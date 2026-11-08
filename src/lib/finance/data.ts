import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import type {FinanceRow} from "./validation";
import {monthBounds} from "./validation";
export const MAX_FINANCE_ROWS=500;
export async function loadFinanceMonth(client:SupabaseClient,userId:string,month:string){
 const {from,until}=monthBounds(month);
 const lastDate=new Date(Date.parse(until+"T00:00:00Z")-86400000).toISOString().slice(0,10);
 const {data,error,count}=await client.from("finance_transactions")
   .select("id,direction,category,amount_pyg,occurred_on,note",{count:"exact"})
   .eq("user_id",userId).gte("occurred_on",from).lte("occurred_on",lastDate)
   .order("occurred_on",{ascending:false}).order("id",{ascending:false}).limit(MAX_FINANCE_ROWS+1);
 if(error||!data||count===null||count>MAX_FINANCE_ROWS||data.length>MAX_FINANCE_ROWS){
  return {rows:[] as FinanceRow[],error:true};
 }
 return {rows:data as FinanceRow[],error:false};
}
