/** Safe, deterministic chart coordinates, shared by 6A/6B. */
export type Point = { label:string; value:number };
export function lineGeometry(points:readonly Point[], width=650, height=210) {
  const left=42,right=16,top=20,bottom=32;
  const values=points.map(p=>Number.isFinite(p.value)?Math.max(0,p.value):0);
  const maximum=Math.max(1,...values);
  const yMax=maximum<=10?Math.ceil(maximum):Math.ceil(maximum/10)*10;
  const dx=(width-left-right)/Math.max(1,points.length-1);
  const coords=values.map((value,i)=>({
    x:left+i*dx, y:top+(height-top-bottom)*(1-value/yMax),
    value,label:points[i].label,
  }));
  return {yMax,coords,path:coords.map((p,i)=>`${i?"L":"M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),width,height,left,right,top,bottom};
}
