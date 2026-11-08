import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calendarConfig,CALENDAR_SCOPE } from "@/lib/calendar/config";
import { encryptCalendarToken } from "@/lib/calendar/crypto";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const redirect=(r:NextRequest,code:string)=>NextResponse.redirect(new URL("/calendar?status="+code,r.url));
export async function GET(request:NextRequest){
  const cookieStore=await cookies();
  const stateCookie=cookieStore.get("calendar_oauth_state")?.value;
  cookieStore.delete("calendar_oauth_state");
  const client=await createClient();
  const {data:auth,error}=await client.auth.getUser();
  if(error||!auth.user)return redirect(request,"session");
  const config=calendarConfig();
  if(!config||new URL(config.redirectUri).origin!==request.nextUrl.origin)return redirect(request,"unconfigured");
  const supplied=request.nextUrl.searchParams.get("state");
  const code=request.nextUrl.searchParams.get("code");
  if(!stateCookie||!supplied||!code||code.length>4096||supplied.length>128)return redirect(request,"invalid");
  const expected=stateCookie.split(".");
  const lhs=Buffer.from(expected[0]??""),rhs=Buffer.from(supplied);
  if(expected.length!==2||expected[1]!==auth.user.id||lhs.length!==rhs.length||
     !timingSafeEqual(lhs,rhs))return redirect(request,"invalid");
  try{
    const response=await fetch("https://oauth2.googleapis.com/token",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({code,client_id:config.clientId,client_secret:config.clientSecret,
        redirect_uri:config.redirectUri,grant_type:"authorization_code"}),
      cache:"no-store",signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)return redirect(request,"google");
    const token=await response.json() as {refresh_token?:unknown;scope?:unknown};
    if(typeof token.refresh_token!=="string"||typeof token.scope!=="string"||
       !token.scope.split(" ").includes(CALENDAR_SCOPE))return redirect(request,"scope");
    const encrypted=encryptCalendarToken(token.refresh_token,auth.user.id,config.tokenKey);
    const result=await client.from("google_calendar_connections")
      .upsert({user_id:auth.user.id,refresh_token_encrypted:encrypted,calendar_id:"primary"},{onConflict:"user_id"})
      .select("user_id").maybeSingle();
    if(result.error||!result.data)return redirect(request,"storage");
    return redirect(request,"connected");
  }catch{return redirect(request,"google");}
}
