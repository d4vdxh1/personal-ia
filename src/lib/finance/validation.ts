export const FINANCE_CATEGORIES = {
  income: [
    ["salario","Salario"],["trabajo_extra","Trabajo extra"],["regalo","Regalo"],["otros_ingresos","Otros ingresos"],
  ],
  expense: [
    ["alimentacion","Alimentación"],["transporte","Transporte"],["vivienda","Vivienda"],
    ["educacion","Educación"],["salud","Salud"],["ocio","Ocio"],["otros_gastos","Otros gastos"],
  ],
} as const;
export type FinanceDirection = keyof typeof FINANCE_CATEGORIES;
export type FinanceRow = {
  id:string;direction:FinanceDirection;category:string;amount_pyg:number|string;occurred_on:string;note:string;
};
const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;
export function validDate(value:string):boolean{
 if(!ISO_DATE.test(value))return false;
 const timestamp=Date.parse(value+"T12:00:00Z");
 return Number.isFinite(timestamp)&&new Date(timestamp).toISOString().slice(0,10)===value;
}
export function todayInParaguay(now=new Date()):string{
 const parts=new Intl.DateTimeFormat("en-US",{
  timeZone:"America/Asuncion",year:"numeric",month:"2-digit",day:"2-digit",
 }).formatToParts(now);
 const get=(key:string)=>parts.find(x=>x.type===key)?.value??"";
 return `${get("year")}-${get("month")}-${get("day")}`;
}
export function parseFinanceTransaction(form:FormData,today=todayInParaguay()){
 const direction=form.get("direction");
 if(direction!=="income"&&direction!=="expense")return null;
 const category=form.get("category");
 if(typeof category!=="string"||!FINANCE_CATEGORIES[direction].some(([value])=>value===category))return null;
 const amount=form.get("amount_pyg");
 if(typeof amount!=="string"||!/^[1-9]\d{0,12}$/.test(amount))return null;
 const numeric=Number(amount);
 if(!Number.isSafeInteger(numeric)||numeric>1000000000000)return null;
 const occurredOn=form.get("occurred_on");
 if(typeof occurredOn!=="string"||!validDate(occurredOn)||occurredOn<"2000-01-01"||occurredOn>today)return null;
 const note=form.get("note");
 if(typeof note!=="string"||[...note.trim()].length>300)return null;
 return {direction,category,amount_pyg:numeric,occurred_on:occurredOn,note:note.trim()};
}
export function parseFinanceMonth(value:unknown, today=todayInParaguay()){
 if(typeof value!=="string"||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(value))return today.slice(0,7);
 return value;
}
export function monthBounds(month:string){
 const [year,mon]=month.split("-").map(Number);
 const next=new Date(Date.UTC(year,mon,1)).toISOString().slice(0,7);
 return {from:month+"-01",until:next+"-01"};
}
export function adjacentMonth(month:string,delta:number){
 const [year,mon]=month.split("-").map(Number);
 return new Date(Date.UTC(year,mon-1+delta,1)).toISOString().slice(0,7);
}
export const financeCategoryName=(direction:FinanceDirection,category:string)=>{
 return FINANCE_CATEGORIES[direction].find(([name])=>name===category)?.[1]??"Otros";
};
export const financeFormat=(amount:number|string)=>{
 const numeric=typeof amount==="string"?Number(amount):amount;
 return new Intl.NumberFormat("es-PY",{maximumFractionDigits:0}).format(numeric)+" ₲";
};
export function financeSummary(rows:readonly FinanceRow[]){
 const totals={income:0,expense:0};
 const expensesByCategory=new Map<string,number>();
 for(const row of rows){
  const n=typeof row.amount_pyg==="string"?Number(row.amount_pyg):row.amount_pyg;
  if(!Number.isSafeInteger(n)||n<=0||n>1000000000000)throw Error("Monto inesperado");
  totals[row.direction]+=n;
  if(!Number.isSafeInteger(totals[row.direction]))throw Error("Monto total fuera de rango");
  if(row.direction==="expense")expensesByCategory.set(row.category,(expensesByCategory.get(row.category)??0)+n);
 }
 return {income:totals.income,expense:totals.expense,net:totals.income-totals.expense,
 expensesByCategory:[...expensesByCategory].sort((a,b)=>b[1]-a[1])};
}
