import { createHash } from "node:crypto";
import { isId } from "@/lib/study/validation";

export function calendarReminderEventId(userId:string,reminderId:string):string{
 if(!isId(userId)||!isId(reminderId))throw new Error("Invalid event owner or reminder");
 return "d"+createHash("sha256").update(userId+":"+reminderId).digest("hex").slice(0,31);
}
export function reminderToCalendarEvent(reminder:{id:string;title:string;scheduled_at:string},eventId:string){
 const start=new Date(reminder.scheduled_at);
 if(!isId(reminder.id)|| !/^[a-v0-9]{32}$/.test(eventId)||
    !reminder.title.trim()||reminder.title.length>200 ||
    !Number.isFinite(start.getTime())) throw new Error("Invalid reminder");
 const end=new Date(start.getTime()+30*60_000);
 return {
  id:eventId,
  summary:reminder.title,
  start:{dateTime:start.toISOString(),timeZone:"America/Asuncion"},
  end:{dateTime:end.toISOString(),timeZone:"America/Asuncion"},
  extendedProperties:{private:{diaADiaReminderId:reminder.id}},
 };
}
export function matchesOwnedGoogleEvent(raw:unknown,eventId:string,reminderId:string):boolean{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return false;
 const v=raw as {id?:unknown;extendedProperties?:{private?:{diaADiaReminderId?:unknown}}};
 return v.id===eventId&&v.extendedProperties?.private?.diaADiaReminderId===reminderId;
}
