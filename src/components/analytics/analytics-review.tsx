"use client";
import {useState} from "react";
import type {Period} from "@/lib/analytics/comparison";
export function AnalyticsReview({period,enabled}:{period:Period;enabled:boolean}){
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [remaining,setRemaining]=useState<number|null>(null);
 async function generate(){
  if(!enabled||!consent||busy)return;
  setBusy(true);setError("");setMessage("");
  try{
   const response=await fetch("/api/analytics/review",{
    method:"POST",credentials:"same-origin",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({period,consent:true}),
   });
   const result:unknown=await response.json();
   const data=result as {answer?:unknown;error?:unknown;remaining?:unknown};
   if(!response.ok||typeof data.answer!=="string"){
    throw new Error(typeof data.error==="string"?data.error:"No pudimos generar la revisión.");
   }
   setMessage(data.answer);
   if(typeof data.remaining==="number")setRemaining(data.remaining);
  }catch(e){setError(e instanceof Error?e.message:"No pudimos generar la revisión.")}
  finally{setBusy(false);}
 }
 return <section className="card analytics-detail" aria-label="Revisión inteligente con Gemini">
  <h2>Revisión inteligente</h2>
  <p className="goal-meta">Gemini puede interpretar las estadísticas de {period==="week"?"los últimos 7 días":"los últimos 30 días"} y compararlas con el período anterior. No puede modificar registros.</p>
  {!enabled&&<p role="status" className="form-error">Gemini no está configurado en este entorno. Las estadísticas funcionan sin IA.</p>}
  {enabled&&<label className="analytics-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>
   <span>Autorizo enviar a Gemini únicamente los totales y promedios de este resumen y del período anterior. No se envían notas, nombres ni mi historial de conversación.</span>
  </label>}
  <button type="button" className="auth-submit" disabled={!enabled||!consent||busy} onClick={()=>void generate()}>
   {busy?"Analizando…":"Generar revisión con Gemini"}
  </button>
  {remaining!==null&&<p className="goal-meta">Consultas restantes hoy: {remaining}</p>}
  {error&&<p role="alert" className="form-error">{error}</p>}
  {message&&<div className="analytics-ai-result" role="status">
   <strong>Resumen de Gemini</strong><p>{message}</p>
   <small>Es una interpretación orientativa; revisá los datos originales antes de tomar decisiones.</small>
  </div>}
 </section>;
}
