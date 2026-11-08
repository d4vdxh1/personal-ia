/** Pure Phase 6A analytics: no writes, model calls, or cross-user data. */
export type Habit = { id:string; weekdays:number[]; active:boolean; created_at:string };
export type HabitEntry = { habit_id:string; entry_date:string; completed:boolean };
export type StudyEntry = { study_date:string; duration_minutes:number };
export type WorkoutEntry = { entry_date:string; status:string };
export type ScheduledWorkout = { scheduled_date:string };
export type CheckinEntry = { entry_date:string; energy:number; sleep_hours:number|null };
export type GoalEntry = { status:string; progress:number };
export type AnalyticsData = {
 habits:Habit[]; habitEntries:HabitEntry[]; studySessions:StudyEntry[];
 trainingSessions:WorkoutEntry[]; scheduledTrainings:ScheduledWorkout[];
 checkins:CheckinEntry[]; goals:GoalEntry[];
};

export function paraguayDate(now=new Date()):string {
 const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Asuncion",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const field=(type:string)=>parts.find(p=>p.type===type)?.value??"";
 return `${field("year")}-${field("month")}-${field("day")}`;
}
export function lastNDates(finalDay:string,days=7):string[] {
 const end=new Date(`${finalDay}T12:00:00Z`);
 if(!Number.isFinite(end.getTime())||days<1||days>31)throw new Error("Rango de analítica inválido");
 return Array.from({length:days},(_,i)=>new Date(end.getTime()-(days-i-1)*86400000).toISOString().slice(0,10));
}
const weekDay=(iso:string)=>{const day=new Date(`${iso}T12:00:00Z`).getUTCDay();return day===0?7:day;};
const rounded=(number:number)=>Math.round(number*10)/10;

export function buildAnalytics(dates:string[],data:AnalyticsData) {
 const done=new Set(data.habitEntries.filter(e=>e.completed).map(e=>`${e.habit_id}|${e.entry_date}`));
 const activeHabits=data.habits.filter(h=>h.active).map(h=>({
  ...h, createdDate:paraguayDate(new Date(h.created_at)),
 }));
 const daily=dates.map(date=>{
  const weekday=weekDay(date);
  const planned=activeHabits.filter(h=>h.createdDate<=date && h.weekdays.includes(weekday));
  const completedHabits=planned.filter(h=>done.has(`${h.id}|${date}`)).length;
  return {
   date, scheduledHabits:planned.length, completedHabits,
   studyMinutes:data.studySessions.filter(s=>s.study_date===date).reduce((n,s)=>n+Math.max(0,Number(s.duration_minutes)||0),0),
   completedWorkouts:data.trainingSessions.filter(s=>s.entry_date===date&&s.status==="completed").length,
   scheduledWorkouts:data.scheduledTrainings.filter(s=>s.scheduled_date===date).length,
  };
 });
 const scheduledHabits=daily.reduce((n,d)=>n+d.scheduledHabits,0);
 const completedHabits=daily.reduce((n,d)=>n+d.completedHabits,0);
 const studyMinutes=daily.reduce((n,d)=>n+d.studyMinutes,0);
 const completedWorkouts=daily.reduce((n,d)=>n+d.completedWorkouts,0);
 const scheduledWorkouts=daily.reduce((n,d)=>n+d.scheduledWorkouts,0);
 const average=(values:number[])=>values.length?rounded(values.reduce((a,b)=>a+b,0)/values.length):null;
 const energy= data.checkins.map(c=>Number(c.energy)).filter(Number.isFinite);
 const sleep=data.checkins.filter(c=>c.sleep_hours!==null).map(c=>Number(c.sleep_hours)).filter(Number.isFinite);
 const activeGoals=data.goals.filter(g=>g.status==="active");
 return {
  daily,
  habits:{completed:completedHabits,scheduled:scheduledHabits,percentage:scheduledHabits?Math.round(completedHabits/scheduledHabits*100):null},
  study:{minutes:studyMinutes,hours:rounded(studyMinutes/60)},
  training:{completed:completedWorkouts,scheduled:scheduledWorkouts},
  checkin:{days:data.checkins.length,averageEnergy:average(energy),averageSleep:average(sleep)},
  goals:{active:activeGoals.length,completed:data.goals.filter(g=>g.status==="completed").length,
   averageProgress:average(activeGoals.map(g=>Number(g.progress)).filter(Number.isFinite))},
 };
}
