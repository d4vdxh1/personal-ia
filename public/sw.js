/* Día a Día: Service Worker, only for push delivery. */
self.addEventListener("push", (event) => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch { message = {}; }
  const title = typeof message.title === "string" ? message.title.slice(0, 120) : "Día a Día";
  const body = typeof message.body === "string" ? message.body.slice(0, 250) : "Tenés un recordatorio.";
  const url = typeof message.url === "string" && /^\/reminders(?:[/?#]|$)/.test(message.url)
    ? message.url : "/reminders";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    tag: typeof message.tag === "string" ? message.tag.slice(0, 120) : "dia-a-dia-reminder",
    data: { url },
    icon: "/favicon.ico",
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/reminders";
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:"window",includeUncontrolled:true});
    const existing = windows.find(w => new URL(w.url).origin === self.location.origin);
    if (existing) { await existing.focus(); if (existing.navigate) await existing.navigate(target); }
    else await self.clients.openWindow(target);
  })());
});
