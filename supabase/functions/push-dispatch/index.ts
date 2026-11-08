import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@mmmike/web-push/send";

type Delivery = {id:string;lease_token:string;title:string;reminder_id:string;
  endpoint:string;keys:{p256dh:string;auth:string}};
const hostnames = new Set(["fcm.googleapis.com","updates.push.services.mozilla.com",
  "web.push.apple.com","webpush.push.apple.com"]);
function validPushDestination(endpoint:string):boolean {
  try { const u=new URL(endpoint); return u.protocol==="https:" &&
    hostnames.has(u.hostname) && !u.port && !u.username && !u.password &&
    !u.hash && u.pathname.length>1; }catch{return false;}
}
async function sameSecret(left:string,right:string):Promise<boolean>{
  if(!left || !right || left.length!==right.length)return false;
  const a=new TextEncoder().encode(left),b=new TextEncoder().encode(right);
  let mismatch=0;
  for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];
  return mismatch===0;
}
Deno.serve(async request=>{
  if(request.method!=="POST")return new Response("Method not allowed",{status:405});
  const url=Deno.env.get("SUPABASE_URL");
  let key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!key){
    try {
      const all=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")??"{}") as Record<string,string>;
      key=all.default??undefined;
    }catch{key=undefined;}
  }
  if(!url||!key) return new Response("Worker credentials unavailable",{status:503});
  const client=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:rawConfig,error:configError}=await client.rpc("get_push_dispatch_config");
  if(configError||!rawConfig||typeof rawConfig!=="object")
    return new Response("Worker config unavailable",{status:503});
  const config=rawConfig as {cronSecret?:string;publicKey?:string;privateKey?:string;subject?:string};
  const secret=config.cronSecret, publicKey=config.publicKey;
  const privateKey=config.privateKey, subject=config.subject;
  if(!secret||secret.length<32||!publicKey||!privateKey||!subject)
    return new Response("Worker configuration incomplete",{status:503});
  if(!await sameSecret(request.headers.get("x-cron-secret")??"",secret))
    return new Response("Unauthorized",{status:401});
  const {data,error}=await client.rpc("claim_push_deliveries",{p_limit:25});
  if(error||!Array.isArray(data)){
    console.error("push.claim_failed",error?.code??"invalid");
    return new Response("Claim unavailable",{status:503});
  }
  let sent=0,gone=0,retry=0,finalizeFailed=0;
  for(const delivery of data as Delivery[]){
    let outcome:"sent"|"gone"|"retry"="retry";
    try{
      if(!validPushDestination(delivery.endpoint))outcome="gone";
      else{
        const alive=await sendPushNotification({
          endpoint:delivery.endpoint,keys:delivery.keys,
        },{
          title:"Día a Día",body:delivery.title.slice(0,180),
          url:"/reminders",tag:"reminder-"+delivery.reminder_id,
        },{ publicKey,privateKey,subject });
        outcome=alive?"sent":"gone";
      }
    }catch(e){
      console.error("push.send_failed",{id:delivery.id,kind:e instanceof Error?e.name:"unknown"});
    }
    // Claim may expire after a crash. Commit completion only with the matching lease token.
    const {data:finished,error:finishError}=await client.rpc("finish_push_delivery",{
      p_id:delivery.id,p_token:delivery.lease_token,p_outcome:outcome,
    });
    if(finishError||finished!==true){
      finalizeFailed++;
      console.error("push.finish_failed",{id:delivery.id,code:finishError?.code??"no-lease"});
    }
    if(outcome==="sent")sent++;else if(outcome==="gone")gone++;else retry++;
  }
  return Response.json({processed:data.length,sent,gone,retry,finalizeFailed},
    {headers:{"Cache-Control":"no-store"}});
});
