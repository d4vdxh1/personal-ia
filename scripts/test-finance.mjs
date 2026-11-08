import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import ts from "typescript";
const compiled=ts.transpileModule(readFileSync("src/lib/finance/validation.ts","utf8"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
});
const exports={};
runInNewContext(compiled.outputText,{exports,Date,Intl,Number,FormData,Map});
const {parseFinanceTransaction,financeFormat,financeSummary,todayInParaguay,parseFinanceMonth,monthBounds,adjacentMonth}=exports;
const form=new FormData();
form.set("direction","expense");
form.set("category","alimentacion");
form.set("amount_pyg","45000");
form.set("occurred_on","2026-11-08");
form.set("note","  Almuerzo  ");
const tx=parseFinanceTransaction(form,"2026-11-08");
assert.equal(tx.amount_pyg,45000);
assert.equal(tx.note,"Almuerzo");
assert.equal(tx.direction,"expense");
assert.equal(parseFinanceMonth("2026-13","2026-11-08"),"2026-11");
assert.equal(parseFinanceMonth("2026-02","2026-11-08"),"2026-02");
assert.equal(adjacentMonth("2026-12",1),"2027-01");
assert.equal(adjacentMonth("2026-01",-1),"2025-12");
assert.equal(monthBounds("2026-12").until,"2027-01-01");
assert.equal(todayInParaguay(new Date("2026-11-09T01:30:00Z")),"2026-11-08");
for(const [key,value] of [
 ["amount_pyg","0"],["amount_pyg","-100"],["amount_pyg","4.5"],["amount_pyg","1000000000001"],
 ["amount_pyg","01"],["occurred_on","2026-02-30"],["occurred_on","2026-11-09"],["category","salario"],
 ["note","n".repeat(301)],
]){
 const copy=new FormData(form);copy.set(key,value);
 assert.equal(parseFinanceTransaction(copy,"2026-11-08"),null,key);
}
assert.equal(financeFormat(45000).includes("₲"),true);
const report=financeSummary([
 {direction:"income",category:"salario",amount_pyg:"1500000",id:"a",occurred_on:"2026-11-08",note:""},
 {direction:"expense",category:"alimentacion",amount_pyg:"45000",id:"b",occurred_on:"2026-11-08",note:""},
 {direction:"expense",category:"transporte",amount_pyg:10000,id:"c",occurred_on:"2026-11-08",note:""},
]);
assert.equal(report.income,1500000);
assert.equal(report.expense,55000);
assert.equal(report.net,1445000);
assert.equal(report.expensesByCategory[0][0],"alimentacion");
assert.equal(financeSummary([]).net,0);
assert.throws(()=>financeSummary([{direction:"expense",category:"ocio",amount_pyg:"-15",id:"x",occurred_on:"2026-11-08",note:""}]));
console.log("PASS: finanzas validación PYG, fechas paraguayas, meses y cálculos con datos reales.");
