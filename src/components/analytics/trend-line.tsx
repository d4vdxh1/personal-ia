import { lineGeometry, type Point } from "@/lib/analytics/line-chart";

/** Accessible SVG, no chart dependency or client hydration required. */
export function TrendLine({points,label,unit="min"}:{points:readonly Point[];label:string;unit?:string}) {
 const {coords,path,yMax,width,height,left,right,top,bottom}=lineGeometry(points);
 const titleId="analytics-trend-title",descId="analytics-trend-desc";
 const empty=points.every(p=>p.value===0);
 return <div className="analytics-trend">
  <svg role="img" aria-labelledby={titleId+" "+descId} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="analytics-line-graph">
   <title id={titleId}>{label}</title>
   <desc id={descId}>{points.map(p=>`${p.label}: ${p.value} ${unit}`).join("; ")||"Sin registros"}</desc>
   {[0,.5,1].map((part,i)=>{
      const y=top+(height-top-bottom)*(1-part);
      return <g key={i}>
       <line className="analytics-grid-line" x1={left} x2={width-right} y1={y} y2={y}/>
       <text className="analytics-axis-label" x={left-9} y={y+4} textAnchor="end">{Math.round(yMax*part)}</text>
      </g>;
   })}
   {coords.length>0&&<path className="analytics-trend-path" d={path} />}
   {coords.map((p,i)=><g key={i}>
    <circle className="analytics-trend-dot" cx={p.x} cy={p.y} r={5}/>
    <text className="analytics-axis-label" x={p.x} y={height-9} textAnchor="middle">{p.label}</text>
   </g>)}
  </svg>
  {empty&&<p className="goal-meta">Sin actividad registrada en este período; la línea permanece en cero.</p>}
 </div>;
}
