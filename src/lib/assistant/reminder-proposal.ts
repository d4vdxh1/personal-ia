export type ReminderFrequency="once"|"daily"|"weekly"|"monthly";
export type ReminderValues={
 title:string;time:string;frequency:ReminderFrequency;
 date?:string;weekdays?:number[];until_on?:string;
};
export type ReminderProposal={
 kind:"reminder";id:string;title:string;date:string;time:string;
 frequency:ReminderFrequency;weekdays:number[];until_on:string|null;
 timezone:"America/Asuncion";
};
const validDay=(day:string)=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
 const d=new Date(day+"T12:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===day;
};
const validTime=(time:string)=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
const frequencies=["once","daily","weekly","monthly"];
export function parseReminderValues(raw:unknown):ReminderValues|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(Object.keys(o).some(k=>!["title","time","date","frequency","weekdays","until_on"].includes(k)))return null;
 if(typeof o.title!=="string"||!o.title.trim()||o.title.trim().length>200||
    typeof o.time!=="string"||!validTime(o.time)||
    typeof o.frequency!=="string"||!frequencies.includes(o.frequency))return null;
 const frequency=o.frequency as ReminderFrequency;
 if(o.date!==undefined&&(typeof o.date!=="string"||!validDay(o.date)))return null;
 if(frequency==="once"&&o.date===undefined)return null;
 if(o.until_on!==undefined&&(typeof o.until_on!=="string"||!validDay(o.until_on)||frequency==="once"))return null;
 if(o.date!==undefined&&typeof o.until_on==="string"&&o.until_on<o.date)return null;
 const week=o.weekdays;
 if(week!==undefined&&(!Array.isArray(week)||week.length>7||
    week.some(x=>typeof x!=="number"||!Number.isInteger(x)||x<0||x>6)||
    new Set(week).size!==week.length))return null;
 if(frequency==="weekly"&&(!Array.isArray(week)||week.length===0))return null;
 if(frequency!=="weekly"&&Array.isArray(week)&&week.length>0)return null;
 return {title:o.title.trim(),time:o.time,frequency,
   ...(o.date!==undefined?{date:o.date as string}:{}),
   ...(week!==undefined?{weekdays:[...(week as number[])].sort()}:{}),
   ...(o.until_on!==undefined?{until_on:o.until_on as string}:{})};
}
export function isReminderProposal(raw:unknown):raw is ReminderProposal{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return false;
 const v=raw as Record<string,unknown>;
 return v.kind==="reminder" && typeof v.id==="string" &&
   /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(v.id) &&
   typeof v.title==="string"&&v.title.length>0&&v.title.length<=200&&
   typeof v.date==="string"&&validDay(v.date)&&
   typeof v.time==="string"&&validTime(v.time)&&
   typeof v.frequency==="string"&&frequencies.includes(v.frequency)&&
   v.timezone==="America/Asuncion"&&Array.isArray(v.weekdays)&&
   v.weekdays.every(x=>typeof x==="number"&&Number.isInteger(x)&&x>=0&&x<=6)&&
   (v.until_on===null||(typeof v.until_on==="string"&&validDay(v.until_on)));
}
