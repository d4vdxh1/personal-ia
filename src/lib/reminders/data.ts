import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export type Reminder = {
  id: string; title: string; notes: string; scheduled_at: string;
  status: "pending" | "completed" | "cancelled";
};
export async function loadReminders(client: SupabaseClient, userId: string) {
  const { data, error } = await client.from("reminders")
    .select("id,title,notes,scheduled_at,status").eq("user_id",userId)
    .order("scheduled_at",{ascending:true}).limit(100);
  return { reminders: (data ?? []) as Reminder[], error: Boolean(error) };
}

export type ReminderSeries={
 id:string;title:string;notes:string;frequency:"daily"|"weekly"|"monthly";
 weekdays:number[];month_day:number|null;local_time:string;timezone:string;
 starts_on:string;until_on:string|null;active:boolean;
};
export async function loadReminderSeries(client:SupabaseClient,userId:string){
 const {data,error}=await client.from("reminder_series")
 .select("id,title,notes,frequency,weekdays,month_day,local_time,timezone,starts_on,until_on,active")
 .eq("user_id",userId).order("created_at",{ascending:false}).limit(100);
 return {series:(data??[]) as ReminderSeries[],error:Boolean(error)};
}
