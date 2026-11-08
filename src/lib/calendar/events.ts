export type CalendarEvent={id:string;title:string;start:string;end:string;url?:string;allDay:boolean};
export function normalizeCalendarEvents(raw:unknown):CalendarEvent[]{
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return [];
  const items=(raw as {items?:unknown}).items;
  if(!Array.isArray(items))return [];
  const values:CalendarEvent[]=[];
  for(const item of items.slice(0,30)){
    if(!item||typeof item!=="object"||Array.isArray(item))continue;
    const e=item as Record<string,unknown>;
    if(typeof e.id!=="string"||e.id.length>255)continue;
    const start=e.start as {dateTime?:unknown;date?:unknown}|undefined;
    const end=e.end as {dateTime?:unknown;date?:unknown}|undefined;
    const startValue=start?.dateTime??start?.date,endValue=end?.dateTime??end?.date;
    if(typeof startValue!=="string"||typeof endValue!=="string")continue;
    const startMs=Date.parse(startValue),endMs=Date.parse(endValue);
    if(!Number.isFinite(startMs)||!Number.isFinite(endMs))continue;
    const url=typeof e.htmlLink==="string"&&e.htmlLink.startsWith("https://www.google.com/calendar/event?")?e.htmlLink:undefined;
    values.push({id:e.id,title:typeof e.summary==="string"?e.summary.slice(0,200):"Sin título",
      start:startValue,end:endValue,url,allDay:typeof start?.date==="string"});
  }
  return values;
}
