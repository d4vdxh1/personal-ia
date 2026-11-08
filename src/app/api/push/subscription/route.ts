import { NextRequest, NextResponse } from "next/server";
import { readAssistantRequest, send } from "@/lib/assistant/request";
import { parsePushEndpoint, parsePushSubscription } from "@/lib/push/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const context = await readAssistantRequest(request);
  if (context instanceof Response) return context;
  const { client, userId, body } = context;
  const subscription = parsePushSubscription(body);
  if (!subscription) return send({ error:"Suscripción push inválida." },400);
  const { count, error: countError } = await client.from("push_subscriptions")
    .select("id",{count:"exact",head:true}).eq("user_id",userId).eq("active",true);
  if (countError) return send({ error:"No pudimos verificar tus dispositivos." },503);
  const { data:existing, error:selectError } = await client.from("push_subscriptions")
    .select("id").eq("user_id",userId).eq("endpoint",subscription.endpoint).maybeSingle();
  if (selectError) return send({error:"No se pudo comprobar la suscripción."},503);
  if (!existing && (count ?? 0) >= 5) return send({error:"Máximo cinco dispositivos activos."},429);
  const values = { p256dh:subscription.keys.p256dh, auth_key:subscription.keys.auth, active:true };
  const { data,error } = existing
    ? await client.from("push_subscriptions").update(values).eq("id",existing.id)
      .eq("user_id",userId).select("id").maybeSingle()
    : await client.from("push_subscriptions").insert({
      ...values,user_id:userId,endpoint:subscription.endpoint
    }).select("id").maybeSingle();
  if (error || !data) return send({error:"No pudimos registrar el dispositivo."},503);
  return NextResponse.json({ ok:true },{headers:{"Cache-Control":"no-store"}});
}
export async function DELETE(request: NextRequest) {
  const context = await readAssistantRequest(request);
  if (context instanceof Response) return context;
  const { client, userId, body } = context;
  const endpoint = parsePushEndpoint(body);
  if (!endpoint) return send({ error:"Endpoint inválido." },400);
  const {error}=await client.from("push_subscriptions").delete()
    .eq("user_id",userId).eq("endpoint",endpoint);
  if(error) return send({error:"No pudimos quitar el dispositivo."},503);
  return send({ok:true});
}
