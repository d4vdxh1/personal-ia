import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calendarConfig,CALENDAR_SCOPE } from "./config";
import { decryptCalendarToken } from "./crypto";
import { normalizeCalendarEvents } from "./events";

export async function loadGoogleEvents(client:SupabaseClient,userId:string){
 const config=calendarConfig();
 if(!config)return {status:"unconfigured" as const,events:[]};
 const row=await client.from("google_calendar_connections")
    .select("refresh_token_encrypted,calendar_id").eq("user_id",userId).maybeSingle();
 if(row.error)return {status:"unavailable" as const,events:[]};
 if(!row.data)return {status:"disconnected" as const,events:[]};
 try{
  const refresh=decryptCalendarToken(row.data.refresh_token_encrypted,userId,config.tokenKey);
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,refresh_token:refresh,grant_type:"refresh_token"}),
    signal:AbortSignal.timeout(10000),cache:"no-store"
  });
  if(!tokenResponse.ok)return {status:tokenResponse.status===400?"reconnect" as const:"unavailable" as const,events:[]};
  const token=await tokenResponse.json() as {access_token?:unknown;scope?:unknown};
  if(typeof token.access_token!=="string")return {status:"unavailable" as const,events:[]};
  if(typeof token.scope==="string"&&!token.scope.split(" ").includes(CALENDAR_SCOPE))
    return {status:"reconnect" as const,events:[]};
  const now=new Date();
  const endpoint=new URL("https://www.googleapis.com/calendar/v3/calendars/"+encodeURIComponent(row.data.calendar_id)+"/events");
  endpoint.searchParams.set("timeMin",now.toISOString());
  endpoint.searchParams.set("timeMax",new Date(now.getTime()+14*86400000).toISOString());
  endpoint.searchParams.set("singleEvents","true");
  endpoint.searchParams.set("orderBy","startTime");
  endpoint.searchParams.set("maxResults","25");
  const response=await fetch(endpoint.toString(),{headers:{Authorization:"Bearer "+token.access_token},
    cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(!response.ok)return {status:response.status===401||response.status===403?"reconnect" as const:"unavailable" as const,events:[]};
  return {status:"connected" as const,events:normalizeCalendarEvents(await response.json())};
 }catch{
  return {status:"unavailable" as const,events:[]};
 }
}
