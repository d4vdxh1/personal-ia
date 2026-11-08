import assert from "node:assert/strict";
import ts from "typescript";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const compiled=ts.transpileModule(readFileSync("src/lib/analytics/line-chart.ts","utf8"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
});
const exports={};
runInNewContext(compiled.outputText,{exports,Number,Math});
const {lineGeometry}=exports;
const zero=lineGeometry([{label:"Lun",value:0},{label:"Mar",value:0}]);
assert.equal(zero.yMax,1);
assert.equal(zero.coords.length,2);
assert.equal(zero.coords[0].y,zero.coords[1].y);
assert.ok(!zero.path.includes("NaN"));
const positive=lineGeometry([{label:"Lun",value:0},{label:"Mar",value:90},{label:"Mié",value:60}]);
assert.equal(positive.yMax,90);
assert.ok(positive.coords[1].y<positive.coords[2].y);
assert.ok(positive.coords[2].y<positive.coords[0].y);
const invalid=lineGeometry([{label:"x",value:NaN},{label:"y",value:-3},{label:"z",value:Infinity}]);
assert.ok(invalid.coords.every(c=>Number.isFinite(c.x)&&Number.isFinite(c.y)&&c.value===0));
console.log("PASS: line chart scale, zero-data handling and non-finite safety.");
