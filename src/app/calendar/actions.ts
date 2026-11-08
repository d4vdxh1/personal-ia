"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calendarConfig } from "@/lib/calendar/config";
import { decryptCalendarToken } from "@/lib/calendar/crypto";

export async function disconnectGoogleCalendar(){
  const client=await createClient();
  const {data:auth,error}=await client.auth.getUser();
  if(error||!auth.user)redirect("/login?reason=session");
  const result=await client.from("google_calendar_connections")
    .select("refresh_token_encrypted").eq("user_id",auth.user.id).maybeSingle();
  // Removing local access must work even if the Google revocation service is down.
  const deletion=await client.from("google_calendar_connections")
    .delete().eq("user_id",auth.user.id);
  if(deletion.error)redirect("/calendar?status=storage");
  const config=calendarConfig();
  if(config&&result.data){
    try{
      const token=decryptCalendarToken(result.data.refresh_token_encrypted,auth.user.id,config.tokenKey);
      await fetch("https://oauth2.googleapis.com/revoke",{
        method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:new URLSearchParams({token}),cache:"no-store",signal:AbortSignal.timeout(10000)
      });
    }catch{/* Local disconnect still applies; user may revoke access from Google account. */}
  }
  redirect("/calendar?status=disconnected");
}
