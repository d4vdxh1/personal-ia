import Link from "next/link";
import {TrackingShell} from "@/components/tracking-shell";
import {FinanceComposer,FinanceDelete} from "@/components/finance/finance-form";
import {getAccount} from "@/lib/auth/account";
import {createClient} from "@/lib/supabase/server";
import {todayInParaguay,parseFinanceMonth,financeCategoryName,financeFormat,financeSummary,adjacentMonth} from "@/lib/finance/validation";
import {loadFinanceMonth} from "@/lib/finance/data";
export const dynamic="force-dynamic";
const monthTitle=(month:string)=>new Intl.DateTimeFormat("es-PY",{month:"long",year:"numeric",timeZone:"UTC"})
 .format(new Date(month+"-01T12:00:00Z"));
export default async function FinancePage({searchParams}:{searchParams:Promise<{month?:string|string[]}>}){
 const {user,profile}=await getAccount();
 const args=await searchParams;
 const today=todayInParaguay();
 const month=parseFinanceMonth(args.month,today);
 const client=await createClient();
 const result=await loadFinanceMonth(client,user.id,month);
 const summary=result.error?null:financeSummary(result.rows);
 const previous=adjacentMonth(month,-1),next=adjacentMonth(month,1);
 return <TrackingShell title="Mis finanzas" active="finance" dateLabel="FASE 8A · MVP"
   copy="Ingresos y gastos personales registrados manualmente, en guaraníes."
   displayName={profile?.display_name?.trim()||user.email||"Usuario"}>
  <nav className="finance-month" aria-label="Mes consultado">
   <Link href={`/finance?month=${previous}`} aria-label="Mes anterior">← Anterior</Link>
   <strong>{monthTitle(month)}</strong>
   <Link href={`/finance?month=${next}`} aria-label="Mes siguiente">Siguiente →</Link>
  </nav>
  {result.error?<section className="card"><p className="form-error" role="alert">
    No pudimos cargar el mes completo. Es posible que falte habilitar la base de Finanzas; no mostramos cifras incompletas.
  </p></section>:<>
   <section className="finance-summary" aria-label="Resumen mensual">
    <article className="card"><span>Ingresos</span><strong>{financeFormat(summary!.income)}</strong></article>
    <article className="card"><span>Gastos</span><strong>{financeFormat(summary!.expense)}</strong></article>
    <article className="card"><span>Resultado del mes</span><strong>{financeFormat(summary!.net)}</strong>
      <small>No es el saldo real de una cuenta bancaria.</small></article>
   </section>
   <div className="finance-grid">
    <section className="card"><h2>Registrar movimiento</h2><FinanceComposer today={today}/></section>
    <section className="card"><h2>Gastos por categoría</h2>
     {!summary!.expensesByCategory.length?<p className="habit-empty">Todavía no hay gastos registrados este mes.</p>:
       <div className="finance-breakdown">{summary!.expensesByCategory.map(([category,amount])=><div key={category}>
        <span>{financeCategoryName("expense",category)}</span><strong>{financeFormat(amount)}</strong>
       </div>)}</div>}
    </section>
   </div>
   <section className="card finance-history"><h2>Historial mensual</h2>
    {result.rows.length===0?<p className="habit-empty">No hay movimientos para este mes.</p>:
      <div className="finance-entries">{result.rows.map(row=><article key={row.id} className="finance-entry">
       <div><strong>{financeCategoryName(row.direction,row.category)}</strong>
        <p className="goal-meta"><time dateTime={row.occurred_on}>{row.occurred_on}</time>{row.note?" · "+row.note:""}</p>
       </div>
       <div className="finance-entry-side">
        <strong className={row.direction==="income"?"finance-in":"finance-out"}>{row.direction==="income"?"+":"−"} {financeFormat(row.amount_pyg)}</strong>
        <FinanceDelete id={row.id}/>
       </div>
      </article>)}</div>}
   </section>
  </>}
 </TrackingShell>;
}
