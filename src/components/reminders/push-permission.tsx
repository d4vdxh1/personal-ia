"use client";
import { useEffect, useState } from "react";

type State = "checking" | "unsupported" | "denied" | "ready" | "subscribed" | "saving";
function decodeKey(value: string): Uint8Array<ArrayBuffer> {
  const raw = atob(value.replace(/-/g,"+").replace(/_/g,"/") + "=".repeat((4-value.length%4)%4));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for(let i=0;i<raw.length;i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
const supportsPush=()=>typeof window!=="undefined" && window.isSecureContext &&
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
async function sendSubscription(method:"POST"|"DELETE", body:unknown) {
  const response = await fetch("/api/push/subscription",{
    method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body),credentials:"same-origin",
  });
  const data = await response.json();
  if(!response.ok) throw new Error(data.error ?? "No pudimos guardar el cambio.");
}
export function PushPermission() {
  const [state,setState]=useState<State>("checking");
  const [message,setMessage]=useState("");
  const [publicKey,setPublicKey]=useState<string|null>(null);
  useEffect(()=>{
    let alive=true;
    async function init(){
      if(!supportsPush()){ if(alive)setState("unsupported");return; }
      if(Notification.permission==="denied"){if(alive)setState("denied");return;}
      try {
        const response=await fetch("/api/push/config",{cache:"no-store"});
        if(!response.ok)throw Error("No pudimos comprobar la configuración.");
        const payload=await response.json() as { publicKey?:string|null };
        if(!alive)return;
        setPublicKey(payload.publicKey??null);
        if(!payload.publicKey){setState("unsupported");return;}
        const registration=await navigator.serviceWorker.getRegistration("/");
        const existing=await registration?.pushManager.getSubscription();
        if(alive)setState(existing?"subscribed":"ready");
      }catch{if(alive){setState("unsupported");setMessage("No pudimos comprobar Web Push.");}}
    }
    void init();return()=>{alive=false;};
  },[]);
  async function enable(){
    if(!publicKey)return;
    setMessage("");setState("saving");
    try{
      const registration=await navigator.serviceWorker.register("/sw.js",{scope:"/"});
      const permission=await Notification.requestPermission();
      if(permission!=="granted"){setState(permission==="denied"?"denied":"ready");return;}
      const old=await registration.pushManager.getSubscription();
      const subscription=old??await registration.pushManager.subscribe({
        userVisibleOnly:true,applicationServerKey:decodeKey(publicKey)
      });
      const serialized=subscription.toJSON();
      await sendSubscription("POST",{endpoint:serialized.endpoint,
        keys:{p256dh:serialized.keys?.p256dh,auth:serialized.keys?.auth}});
      setState("subscribed");setMessage("Dispositivo registrado. Los avisos se activarán cuando el programador esté configurado.");
    }catch(e){setState("ready");setMessage(e instanceof Error?e.message:"No se pudo activar el dispositivo.");}
  }
  async function disable(){
    setMessage("");setState("saving");
    try {
      const registration=await navigator.serviceWorker.getRegistration("/");
      const subscription=await registration?.pushManager.getSubscription();
      if(subscription){
        await sendSubscription("DELETE",{endpoint:subscription.endpoint});
        await subscription.unsubscribe();
      }
      setState("ready");setMessage("Avisos desactivados para este dispositivo.");
    }catch(e){setState("subscribed");setMessage(e instanceof Error?e.message:"No se pudo desactivar.");}
  }
  return <section className="card reminder-notice" aria-label="Notificaciones push">
    <h2>Notificaciones en este dispositivo</h2>
    <p>Activá los avisos solo si querés recibir recordatorios en este dispositivo. El envío automático todavía no está habilitado.</p>
    {state==="unsupported" && <p role="status">Web Push no está disponible aquí o faltan las claves del servidor. En iPhone necesitás agregar la web a la pantalla de inicio.</p>}
    {state==="denied" && <p role="status">El navegador bloquea las notificaciones. Podés habilitarlas desde los permisos del sitio.</p>}
    {state==="subscribed" && <button className="secondary-button" disabled={false} onClick={disable}>Desactivar avisos en este dispositivo</button>}
    {state==="ready" && <button className="secondary-button" onClick={enable}>Activar avisos en este dispositivo</button>}
    {state==="saving" && <button className="secondary-button" disabled>Guardando…</button>}
    {message && <p role="status">{message}</p>}
  </section>;
}
