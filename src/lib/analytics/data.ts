import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsData } from "./summary";

/** All reads use the authenticated Supabase client and an explicit owner predicate. */
export async function loadAnalytics(client:SupabaseClient,userId:string,dates:string[]):Promise<{data:AnalyticsData|null;error:boolean}> {
 const from=dates[0], to=dates.at(-1);
 if(!from||!to)return {data:null,error:true};
 const [habits,habitEntries,studySessions,trainingSessions,scheduledTrainings,checkins,goals]=await Promise.all([
  client.from("habits").select("id,weekdays,active,created_at").eq("user_id",userId).limit(200),
  client.from("habit_entries").select("habit_id,entry_date,completed").eq("user_id",userId).gte("entry_date",from).lte("entry_date",to).limit(1000),
  client.from("study_sessions").select("study_date,duration_minutes").eq("user_id",userId).gte("study_date",from).lte("study_date",to).limit(1000),
  client.from("training_sessions").select("entry_date,status").eq("user_id",userId).gte("entry_date",from).lte("entry_date",to).limit(1000),
  client.from("training_schedule").select("scheduled_date").eq("user_id",userId).gte("scheduled_date",from).lte("scheduled_date",to).limit(1000),
  client.from("daily_checkins").select("entry_date,energy,sleep_hours").eq("user_id",userId).gte("entry_date",from).lte("entry_date",to).limit(1000),
  client.from("goals").select("status,progress").eq("user_id",userId).limit(200),
 ]);
 const responses=[habits,habitEntries,studySessions,trainingSessions,scheduledTrainings,checkins,goals];
 const caps=[200,1000,1000,1000,1000,1000,200];
 if(responses.some((r,i)=>r.error||!r.data||r.data.length>=caps[i]))return {data:null,error:true};
 return {error:false,data:{
  habits:habits.data as AnalyticsData["habits"],
  habitEntries:habitEntries.data as AnalyticsData["habitEntries"],
  studySessions:studySessions.data as AnalyticsData["studySessions"],
  trainingSessions:trainingSessions.data as AnalyticsData["trainingSessions"],
  scheduledTrainings:scheduledTrainings.data as AnalyticsData["scheduledTrainings"],
  checkins:checkins.data as AnalyticsData["checkins"],
  goals:goals.data as AnalyticsData["goals"],
 }};
}
