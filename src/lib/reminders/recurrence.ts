import { validDate } from "@/lib/study/validation";

export const REPEAT_FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type RepeatFrequency = typeof REPEAT_FREQUENCIES[number];
export const REMINDER_TIMEZONES = [
  "America/Asuncion", "America/Argentina/Buenos_Aires", "UTC",
] as const;
export type ReminderTimezone = typeof REMINDER_TIMEZONES[number];

export function parseSeries(form: FormData) {
  const title = form.get("title"), notes = form.get("notes");
  const frequency = form.get("frequency"), timezone = form.get("timezone");
  const time = form.get("local_time");
  if(typeof title!=="string" || !title.trim() || title.trim().length>200 ||
     typeof notes!=="string" || notes.trim().length>1000 ||
     typeof frequency!=="string" || !REPEAT_FREQUENCIES.includes(frequency as RepeatFrequency) ||
     typeof timezone!=="string" || !REMINDER_TIMEZONES.includes(timezone as ReminderTimezone) ||
     typeof time!=="string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  let startsOn:string, untilOn:string|null=null;
  try {
    startsOn=validDate(form.get("starts_on"));
    const until=form.get("until_on");
    if(until!=="" && until!==null){untilOn=validDate(until);if(untilOn<startsOn)return null;}
  }catch{return null;}
  const weekdays = form.getAll("weekdays");
  if(weekdays.some(day=>typeof day!=="string"||!/^[0-6]$/.test(day)))return null;
  const days=[...new Set(weekdays.map(day=>Number(day)))].sort();
  if((frequency==="weekly" && !days.length) || (frequency!=="weekly" && days.length))return null;
  const monthDay=frequency==="monthly"?Number(startsOn.slice(-2)):null;
  return {
    title:title.trim(),notes:notes.trim(),frequency,timezone,
    local_time:time+":00",starts_on:startsOn,until_on:untilOn,
    weekdays:days,month_day:monthDay,
  };
}
export function recurrenceLabel(frequency:string,weekdays:number[],monthDay:number|null) {
  if(frequency==="daily")return "Todos los días";
  if(frequency==="monthly")return "Cada mes, día "+(monthDay??"");
  const labels=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  return "Cada semana: "+weekdays.map(day=>labels[day]).join(", ");
}
