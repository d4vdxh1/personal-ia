"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calendarConfig, CALENDAR_EVENTS_SCOPE } from "@/lib/calendar/config";
import { decryptCalendarToken } from "@/lib/calendar/crypto";
import { calendarReminderEventId,reminderToCalendarEvent,matchesOwnedGoogleEvent } from "@/lib/calendar/export";
import { isId } from "@/lib/study/validation";

type Result="exported"|"already"|"unconfigured"|"unauthorized"|"invalid"|"unavailable";
export async function exportReminderToGoogle(form:FormData){
 const reminderId=form.get("reminder_id");
 if(!isId(reminderId)) redirect("/reminders?calendar=invalid");
 if(process.env.GOOGLE_CALENDAR_WRITE_ENABLED!=="true")redirect("/reminders?calendar=unconfigured");
 const config=calendarConfig();
 if(!config)redirect("/reminders?calendar=unconfigured");
 const client=await createClient();
 const {data:auth,error:authError}=await client.auth.getUser();
 if(authError||!auth.user)redirect("/login?reason=session");
 const userId=auth.user.id;
 const [{data:reminder,error:rError},{data:connection,error:cError},
  {data:link,error:lError}]=await Promise.all([
  client.from("reminders").select("id,title,scheduled_at,status,series_id")
   .eq("id",reminderId).eq("user_id",userId).is("series_id",null).maybeSingle(),
  client.from("google_calendar_connections").select("can_write,calendar_id,refresh_token_encrypted")
   .eq("user_id",userId).maybeSingle(),
  client.from("google_calendar_event_links").select("google_event_id")
   .eq("reminder_id",reminderId).eq("user_id",userId).maybeSingle(),
 ]);
 let result:Result="unavailable";
 if(rError||cError||lError)result="unavailable";
 else if(!reminder||reminder.status!=="pending")result="invalid";
 else if(link)result="already";
 else if(!connection?.can_write||connection.calendar_id!=="primary")result="unauthorized";
 else {
  try {
   const refreshToken=decryptCalendarToken(connection.refresh_token_encrypted,userId,config.tokenKey);
   const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:config.clientId,client_secret:config.clientSecret,
      refresh_token:refreshToken,grant_type:"refresh_token"}),
    signal:AbortSignal.timeout(10000),cache:"no-store",
   });
   if(!tokenResponse.ok)result=tokenResponse.status===400?"unauthorized":"unavailable";
   else {
    const token=await tokenResponse.json() as {access_token?:unknown;scope?:unknown};
    if(typeof token.access_token!=="string"||
       (typeof token.scope==="string"&&!token.scope.split(" ").includes(CALENDAR_EVENTS_SCOPE)))
      result="unauthorized";
    else{
     const id=calendarReminderEventId(userId,reminder.id);
     const event=reminderToCalendarEvent(reminder,id);
     const endpoint="https://www.googleapis.com/calendar/v3/calendars/primary/events";
     const response=await fetch(endpoint+"?sendUpdates=none",{
      method:"POST",headers:{"Authorization":"Bearer "+token.access_token,
        "Content-Type":"application/json"},
      body:JSON.stringify(event),signal:AbortSignal.timeout(12000),cache:"no-store",
     });
     let verified=false;
     if(response.status===409){
      const check=await fetch(endpoint+"/"+encodeURIComponent(id),{
       headers:{"Authorization":"Bearer "+token.access_token},
       signal:AbortSignal.timeout(12000),cache:"no-store",
      });
      verified=check.ok && matchesOwnedGoogleEvent(await check.json(),id,reminder.id);
     } else if(response.ok){
      verified=matchesOwnedGoogleEvent(await response.json(),id,reminder.id);
     } else if(response.status===403||response.status===401)result="unauthorized";
     if(verified){
      const saved=await client.from("google_calendar_event_links")
       .upsert({user_id:userId,reminder_id:reminder.id,google_event_id:id},
        {onConflict:"user_id,reminder_id"}).select("reminder_id").maybeSingle();
      if(!saved.error&&saved.data)result="exported";
     }
    }
   }
  }catch{result="unavailable";}
 }
 if(result==="exported")revalidatePath("/reminders");
 redirect("/reminders?calendar="+result);
}
