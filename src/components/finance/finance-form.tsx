"use client";
import {useActionState,useId,useState} from "react";
import {addFinanceTransaction,removeFinanceTransaction} from "@/app/finance/actions";
import {FINANCE_CATEGORIES,type FinanceDirection} from "@/lib/finance/validation";
const initial={message:"",error:false,saved:false};
export function FinanceComposer({today}:{today:string}){
 const [key,setKey]=useState(0);
 return <FinanceForm key={key} today={today} onNew={()=>setKey(v=>v+1)}/>;
}
function FinanceForm({today,onNew}:{today:string;onNew:()=>void}){
 const id=useId();
 const [direction,setDirection]=useState<FinanceDirection>("expense");
 const [state,action,pending]=useActionState(addFinanceTransaction,initial);
 if(state.saved)return <div className="journal-saved">
  <p role="status" className="form-success">{state.message}</p>
  <button type="button" className="secondary-button" onClick={onNew}>Registrar otro movimiento</button>
 </div>;
 return <form action={action} className="finance-form">
  <fieldset disabled={pending}><legend>Nuevo movimiento</legend>
   <div className="journal-field">
    <label htmlFor={id+"-direction"}>Tipo de movimiento</label>
    <select name="direction" id={id+"-direction"} value={direction} onChange={e=>setDirection(e.target.value as FinanceDirection)}>
     <option value="expense">Gasto</option><option value="income">Ingreso</option>
    </select>
   </div>
   <div className="journal-field">
    <label htmlFor={id+"-amount"}>Monto (guaraníes, sin decimales)</label>
    <input name="amount_pyg" id={id+"-amount"} type="number" inputMode="numeric" min="1" max="1000000000000" step="1" required placeholder="45000"/>
   </div>
   <div className="journal-field">
    <label htmlFor={id+"-category"}>Categoría</label>
    <select key={direction} name="category" id={id+"-category"} required>
      {FINANCE_CATEGORIES[direction].map(([value,label])=><option value={value} key={value}>{label}</option>)}
    </select>
   </div>
   <div className="journal-field">
    <label htmlFor={id+"-date"}>Fecha</label>
    <input name="occurred_on" id={id+"-date"} type="date" defaultValue={today} min="2000-01-01" max={today} required/>
   </div>
   <div className="journal-field">
    <label htmlFor={id+"-note"}>Descripción opcional</label>
    <input name="note" id={id+"-note"} maxLength={300} placeholder="Ej.: almuerzo" />
   </div>
   <p className="form-hint">Solo registra tus movimientos manuales. No consulta bancos ni efectúa pagos.</p>
   <button type="submit" className="auth-submit" disabled={pending}>{pending?"Guardando…":"Guardar movimiento"}</button>
  </fieldset>
  {state.message&&<p role={state.error?"alert":"status"} className={state.error?"form-error":"form-success"}>{state.message}</p>}
 </form>;
}
export function FinanceDelete({id}:{id:string}){
 const [state,action,pending]=useActionState(removeFinanceTransaction,initial);
 return <details className="finance-delete">
  <summary>Eliminar movimiento</summary>
  <form action={action}>
   <input type="hidden" name="id" value={id}/>
   <label><input type="checkbox" name="confirm" value="yes" required/> Confirmo que deseo eliminar este movimiento.</label>
   <button disabled={pending} type="submit" className="secondary-button">{pending?"Eliminando…":"Eliminar definitivamente"}</button>
  </form>
  {state.message&&<p role={state.error?"alert":"status"} className={state.error?"form-error":"form-success"}>{state.message}</p>}
 </details>;
}
