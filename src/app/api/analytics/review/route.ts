import {NextRequest} from "next/server";
import {readAssistantRequest,send} from "@/lib/assistant/request";
import {GeminiProvider,ProviderError} from "@/lib/assistant/provider";
import {loadAnalytics} from "@/lib/analytics/data";
import {lastNDates,paraguayDate,buildAnalytics} from "@/lib/analytics/summary";
import {periodDays,resolvePeriod,reviewPayload,reviewPrompt,isUsefulReview} from "@/lib/analytics/comparison";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:NextRequest){
 const context=await readAssistantRequest(request);
 if(context instanceof Response)return context;
 const {client,userId,body}=context;
 if(Object.keys(body).sort().join(",")!=="consent,period"||
   body.consent!==true||(body.period!=="week"&&body.period!=="month"))
  return send({error:"Indicá período válido y autorizá explícitamente el envío de agregados a Gemini."},400);
 const key=process.env.GEMINI_API_KEY;
 if(!key)return send({error:"Gemini no está configurado en este entorno."},503);
 // Reserve before database aggregation to prevent unlimited expensive reads.
 const reservation=await client.rpc("reserve_ai_request");
 if(reservation.error||!reservation.data||typeof reservation.data!=="object")
  return send({error:"No pudimos comprobar el límite diario."},503);
 const quota=reservation.data as {allowed?:boolean;remaining?:number};
 if(!quota.allowed)return send({error:"Alcanzaste tu límite diario de Gemini o solicitaste otra revisión muy pronto."},429);
 const days=periodDays(resolvePeriod(body.period));
 const dates=lastNDates(paraguayDate(),days*2);
 const loaded=await loadAnalytics(client,userId,dates);
 if(loaded.error||!loaded.data)return send({error:"No se pudo verificar el resumen completo."},503);
 const previous=buildAnalytics(dates.slice(0,days),loaded.data);
 const current=buildAnalytics(dates.slice(days),loaded.data);
 const payload=reviewPayload(current,previous,resolvePeriod(body.period));
 if(!isUsefulReview(payload))return send({error:"Todavía no hay suficientes registros en este período para una revisión útil."},422);
 try{
  const response=await new GeminiProvider(key).generate([{role:"user",parts:[{text:reviewPrompt(payload)}]}],false);
  const answer=response.text.trim();
  if(!answer||response.calls.length)return send({error:"Gemini no generó una revisión válida."},502);
  return send({answer:answer.slice(0,1800),remaining:Math.max(0,quota.remaining??0)});
 }catch(error){
  if(error instanceof ProviderError)return send({error:error.message},error.code==="quota"?429:502);
  return send({error:"No pudimos generar la revisión en este momento."},502);
 }
}
