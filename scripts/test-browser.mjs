// Next.js real, Auth simulado y SQL real en PostgreSQL embebido. Sin credenciales remotas.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { cp, mkdir, symlink, access, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";
import { testAssistantBrowser, testCheckinBrowser, testStudyBrowser } from "./test-assistant-browser.mjs";
import { chromium } from "@playwright/test";
import { createTestDatabase, asUser, alice } from "./test-db.mjs";
const root = process.cwd(), workspace = resolve(root, ".test-workspace"), output = resolve(root, "test-results");
assert.ok(workspace.startsWith(root + (process.platform === 'win32' ? '\\' : '/')));
await mkdir(workspace, { recursive: true }); await mkdir(output, { recursive: true });
for (const name of ["src", "package.json", "package-lock.json", ".gitignore", "next.config.ts", "postcss.config.mjs", "tsconfig.json"]) await cp(join(root, name), join(workspace, name), { recursive: true });
await assert.rejects(access(join(workspace, ".env.local")));
try { await access(join(workspace, "node_modules")); } catch { await symlink(join(root, "node_modules"), join(workspace, "node_modules"), process.platform === "win32" ? "junction" : "dir"); }
const hash = createHash('sha256');
async function hashFiles(dir) { for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {const path=join(dir,entry.name);if(entry.isDirectory())await hashFiles(path);else hash.update(path.replace(root,'')).update(await readFile(path));} }
await hashFiles(join(root,'src'));
for(const file of ['package-lock.json','next.config.ts','tsconfig.json','postcss.config.mjs'])hash.update(await readFile(join(root,file)));
const fingerprint=hash.digest('hex'); let previousBuild; try { previousBuild=JSON.parse(await readFile(join(workspace,'test-build.json'),'utf8'));await access(join(workspace,'.next/BUILD_ID')); } catch {previousBuild=null;}
const db = await createTestDatabase();
await db.exec("create role service_role nologin; create schema vault; create table vault.decrypted_secrets(name text,decrypted_secret text);");
for (const file of ["20261106152923_ai_usage.sql", "20261108023553_ai_habit_actions.sql", "20261108025732_ai_checkin_actions.sql", "20261108033000_ai_study_actions.sql", "20261108035009_reminders.sql","20261108043426_push_notifications.sql","20261108184507_reminder_recurrences.sql","20261108193000_ai_reminder_actions.sql"]) {
  await db.exec(await readFile(join(root, "supabase/migrations", file), "utf8"));
}
await db.query("insert into auth.users(id) values($1)", [alice]);
const user = { id: alice, email: "test@example.com", aud: "authenticated", role: "authenticated" };
const encode = v => Buffer.from(JSON.stringify(v)).toString("base64url");
const token = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:alice,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})}.test`;
let revoked = false, failRead = false, failWrite = false, queue = Promise.resolve();
const ident = value => { assert.match(value, /^[a-z_][a-z_0-9]*$/); return `"${value}"`; };
const numericFields = new Set(['weight_kg','waist_cm','arm_cm','max_weight','total_volume','volume']);
const normalize = row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value instanceof Date && /date$/.test(key) ? value.toISOString().slice(0,10) : value !== null && numericFields.has(key) ? Number(value) : value]));
const server = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  const task = async () => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/auth/v1/token") { revoked = false; return res.end(JSON.stringify({access_token:token,refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,user})); }
    if (url.pathname === "/auth/v1/user") return res.writeHead(revoked ? 401 : 200).end(JSON.stringify(revoked ? { message:'Expired' } : user));
    if (url.pathname === "/auth/v1/logout") { revoked=true; return res.writeHead(204).end(); }
    if (!url.pathname.startsWith('/rest/v1/')) return res.writeHead(404).end('{}');
    if ((req.method==='GET' && failRead) || (req.method!=='GET' && failWrite)) return res.writeHead(500).end(JSON.stringify({message:'Simulated failure'}));
    let body=''; for await (const chunk of req) body+=chunk; const payload=body ? JSON.parse(body) : {};
    const name=url.pathname.split('/').at(-1);
    const result = await asUser(db, alice, async () => {
      if (url.pathname.includes('/rpc/')) {
        const names={ propose_daily_checkin:['p_values'], decide_checkin_proposal:['p_id','p_decision','p_overwrite'], propose_ai_reminder:["p_values"], decide_ai_reminder:["p_id","p_decision"], propose_study_session:['p_subject_name','p_topic','p_duration_minutes'], decide_study_proposal:['p_id','p_decision'], reserve_ai_request:[], propose_mark_habit:['p_name'], decide_habit_proposal:['p_id','p_decision'], save_training_plan:['p_id','p_name','p_notes','p_items'],start_training_session:['p_id','p_plan_id','p_schedule_id'],save_training_session:['p_id','p_sets','p_duration','p_rpe','p_notes','p_complete'],training_progress:[],training_exercise_history:['p_exercise','p_page'] };
        assert.ok(name in names); const args=names[name].map(k => typeof payload[k]==='object' && payload[k]!==null ? JSON.stringify(payload[k]) : payload[k]);
        const table=name==='training_progress'||name==='training_exercise_history';
        const sql=table ? `select * from public.${ident(name)}(${args.map((_,i)=>'$'+(i+1)).join(',')})` : `select public.${ident(name)}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as value`;
        const rows=(await db.query(sql,args)).rows; return table ? rows.map(normalize) : rows[0].value;
      }
      assert.ok(['profiles','habits','habit_entries','daily_checkins','journal_entries','goals','training_exercises','training_plans','training_plan_items','training_schedule','training_sessions','training_sets','training_metrics','training_symptoms','study_subjects','study_assignments','study_exams','study_sessions','reminders','reminder_series'].includes(name));
      const args=[], where=[];
      for (const [field, value] of url.searchParams) {
        if (['select','order','limit','offset','on_conflict'].includes(field)) continue;
        const split=value.indexOf('.'), op=value.slice(0,split), val=value.slice(split+1);
        if (op==='in') { const vals=val.slice(1,-1).split(',').map(v=>v.replaceAll('"','')); where.push(`${ident(field)} in (${vals.map(v=>{args.push(v); return '$'+args.length;}).join(',')})`); }
        else { assert.ok(['eq','gte'].includes(op)); args.push(val); where.push(`${ident(field)} ${op==='eq'?'=':'>='} $${args.length}`); }
      }
      const clause=where.length ? ' where '+where.join(' and ') : '';
      let rows;
      if (req.method==='GET') {
        const count=(await db.query(`select count(*)::int n from public.${ident(name)}${clause}`,args)).rows[0].n;
        const columns=url.searchParams.get('select')||'*'; const select=columns==='*'?'*':columns.split(',').map(ident).join(',');
        const order=(url.searchParams.get('order')||'').split(',').filter(Boolean).map(v=>{const [key,dir]=v.split('.'); return ident(key)+(dir==='desc'?' desc':' asc');});
        const limit=Number(url.searchParams.get('limit')||1000), offset=Number(url.searchParams.get('offset')||0); assert.ok(Number.isInteger(limit)&&limit>=0&&Number.isInteger(offset)&&offset>=0);
        rows=(await db.query(`select ${select} from public.${ident(name)}${clause}${order.length?' order by '+order.join(','):''} limit ${limit} offset ${offset}`,args)).rows;
        res.setHeader('Content-Range',`${offset}-${offset+Math.max(0,rows.length-1)}/${count}`);
      } else if (req.method==='DELETE') rows=(await db.query(`delete from public.${ident(name)}${clause} returning *`,args)).rows;
      else if (req.method==='PATCH') {
        const entries=Object.entries(payload); const set=entries.map(([key,val])=>{args.push(val);return `${ident(key)}=$${args.length}`;}).join(',');
        rows=(await db.query(`update public.${ident(name)} set ${set}${clause} returning *`,args)).rows;
      } else {
        const entries=Object.entries(payload), columns=entries.map(([key])=>ident(key)); const values=entries.map(([,val])=>val);
        const conflict=url.searchParams.get('on_conflict');
        rows=(await db.query(`insert into public.${ident(name)}(${columns.join(',')}) values(${values.map((_,i)=>'$'+(i+1)).join(',')})${conflict?' on conflict('+conflict.split(',').map(ident).join(',')+') do update set '+columns.map(c=>c+'=excluded.'+c).join(','):''} returning *`,values)).rows;
      }
      return (req.headers.accept||'').includes('application/vnd.pgrst.object+json') ? rows[0]??null : rows.map(normalize);
    });
    res.end(JSON.stringify(result));
  };
  queue=queue.then(task).catch(e=>{ console.error('Test API:',e.message); if(!res.headersSent)res.writeHead(400);res.end(JSON.stringify({message:e.message})); });
});
let app, assistantApp, browser; const logs=[];
try {
  await new Promise((r,reject)=>{server.once('error',reject);server.listen(3109,'127.0.0.1',r);});
  function launch(args, mockGemini = false) {
    const preload = mockGemini ? ['--import', join(root, 'scripts/mock-assistant-provider.mjs')] : [];
    return spawn(process.execPath, [...preload, join(root, 'node_modules/next/dist/bin/next'), ...args], {
      cwd: workspace, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GEMINI_API_KEY: mockGemini ? 'browser-test-only' : '',
        AI_STUDY_WRITES_ENABLED: mockGemini ? 'true' : 'false',
        NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-public-key',
        NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${server.address().port}` },
    });
  }
  async function waitForApp(child, baseUrl) {
    for (let attempt = 0; attempt < 150 && child.exitCode === null; attempt++) {
      try {
        if ((await fetch(baseUrl + '/login', { signal: AbortSignal.timeout(5000) })).ok) return;
      } catch { /* The app is still starting. */ }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    throw Error('Next no inició: ' + logs.join('').slice(-4000));
  }
  if(previousBuild?.fingerprint !== fingerprint){
  app=launch(['build','--webpack']);
  app.stdout.on('data',b=>{logs.push(String(b));process.stdout.write(b);}); app.stderr.on('data',b=>{logs.push(String(b));process.stderr.write(b);});
  await new Promise((ok,bad)=>{app.on('error',bad);app.on('exit',code=>code===0?ok():bad(Error('La compilación aislada falló')));});
  await writeFile(join(workspace,'test-build.json'),JSON.stringify({fingerprint}));
  } else console.log('Browser: compilación idéntica verificada, reutilizada');
  app=launch(['start','-H','localhost','-p','3108']);
  app.stdout.on('data',b=>{logs.push(String(b));process.stdout.write(b);}); app.stderr.on('data',b=>{logs.push(String(b));process.stderr.write(b);});
  const base='http://localhost:3108';
  await waitForApp(app, base);
  browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  const page=await browser.newPage({viewport:{width:390,height:844}}); page.setDefaultTimeout(30000); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  console.log('Browser: servidor listo');
  // Public OAuth branding pages must be reachable without a session, including on mobile.
  for (const [publicPath, heading] of [
    ['/welcome','Hacé que cada día cuente.'],
    ['/privacy','Política de privacidad'],
    ['/terms','Condiciones del servicio'],
  ]) {
    await page.goto(base + publicPath);
    await page.getByRole('heading',{name:heading,exact:true}).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,'public page mobile overflow '+publicPath);
    assert.equal(await page.getByRole('link',{name:'Iniciar sesión',exact:true}).count() > 0,true);
  }
  await page.goto(base+'/welcome');
  await page.getByRole('link',{name:'Leer la política de privacidad'}).click();
  await page.waitForURL(/\/privacy$/);
  for (const path of ['/signup','/forgot-password']) {
     const response = await page.request.get(base+path,{maxRedirects:0});
     assert.equal(response.status(),200,'public auth route '+path);
   }
   assert.equal((await page.request.get(base+'/auth/callback',{maxRedirects:0})).status(),307);
   await page.goto(base+'/signup');
   await page.getByRole('heading',{name:'Creá tu espacio personal.'}).waitFor();
   await page.getByRole('button',{name:'Continuar con Google'}).waitFor();
   await page.getByText('las cuentas nuevas se crean con Google',{exact:false}).waitFor();
   assert.equal(await page.getByRole('button',{name:'Crear cuenta',exact:true}).count(),0,'email signup UI must be gated until SMTP setup');
   await page.goto(base+'/forgot-password');
   await page.getByRole('heading',{name:'Recuperá tu contraseña.'}).waitFor();
   await page.getByText('La recuperación por correo estará disponible',{exact:false}).waitFor();
   await page.goto(base+'/login'); await page.getByRole('link',{name:'Crear cuenta gratis'}).waitFor();
   await page.goto(base); await page.waitForURL(/login/);
  await page.getByLabel('Correo electrónico').fill(user.email); await page.getByLabel('Contraseña',{exact:true}).fill('test-password'); await page.getByRole('button',{name:'Ingresar',exact:true}).click(); await page.waitForURL(base+'/');
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  console.log('Browser: login correcto');
  await page.goto(base+'/training?view=exercises'); await page.getByLabel('Nombre del ejercicio').fill('Remo de prueba'); await page.getByLabel('Grupo muscular').fill('Espalda'); await page.getByLabel('Equipo').fill('Mancuerna'); await page.getByRole('button',{name:'Crear ejercicio',exact:true}).click(); await page.getByRole('heading',{name:'Remo de prueba',exact:true}).waitFor();
  await page.goto(base+'/training?view=plans'); await page.getByLabel('Nombre de la rutina').fill('Rutina de prueba'); await page.getByLabel('Ejercicio 1',{exact:true}).selectOption({label:'Remo de prueba'}); await page.getByLabel('Carga (kg) ejercicio 1',{exact:true}).fill('5'); await page.getByRole('button',{name:'Crear rutina',exact:true}).click(); await page.getByRole('heading',{name:'Rutina de prueba',exact:true}).waitFor();
  await page.goto(base+'/training'); await page.getByLabel('Rutina',{exact:true}).first().selectOption({label:'Rutina de prueba'}); await page.getByRole('button',{name:'Programar entrenamiento',exact:true}).click(); await page.getByRole('heading',{name:'Rutina de prueba',exact:true}).waitFor();
  await page.goto(base+'/'); await page.getByText('Tenés un entrenamiento programado para hoy.').waitFor();
  await page.goto(base+'/training'); await page.getByRole('button',{name:'Iniciar sesión de entrenamiento',exact:true}).click(); await page.getByRole('link',{name:/^(Abrir sesión →|Continuar sesión)$/}).click(); await page.waitForURL(/training\/[a-f0-9-]+$/); const sessionUrl=page.url();
  await page.getByLabel('Realizada Remo de prueba serie 1',{exact:true}).check(); await page.getByLabel('Duración (minutos)',{exact:true}).fill('30'); await page.getByLabel('Dificultad de la sesión (1–10)',{exact:true}).fill('5'); await page.getByRole('button',{name:'Guardar borrador',exact:true}).click(); await page.getByText('Cambios guardados.',{exact:true}).waitFor(); await page.reload(); assert.equal(await page.getByLabel('Realizada Remo de prueba serie 1',{exact:true}).isChecked(),true);
  await page.getByRole('button',{name:'Completar entrenamiento',exact:true}).click(); await page.getByRole('heading',{name:'Entrenamiento completado',exact:true}).waitFor(); await page.reload(); await page.getByRole('heading',{name:'Entrenamiento completado',exact:true}).waitFor();
  await page.goto(base+'/training?view=history'); await page.getByText('Máxima carga: 5 kg',{exact:true}).waitFor(); await page.getByRole('link',{name:'Ver evolución por sesión →',exact:true}).click(); const exerciseUrl=page.url(); await page.getByText('1 series · máxima carga: 5 kg',{exact:true}).waitFor();
  await page.goto(base+'/training?view=health'); await page.getByLabel('Peso corporal (kg)',{exact:true}).fill('70'); await page.getByRole('button',{name:'Guardar medidas',exact:true}).click(); await page.getByText('Peso: 70 kg',{exact:false}).waitFor(); await page.getByLabel('Zona o molestia',{exact:true}).fill('Rodilla'); await page.getByLabel('Hubo bloqueo',{exact:true}).check(); await page.getByRole('button',{name:'Guardar molestia',exact:true}).click(); await page.getByRole('heading',{name:`Rodilla · ${today}`,exact:true}).waitFor();
  failWrite=true; await page.goto(base+'/training?view=exercises'); await page.getByLabel('Nombre del ejercicio',{exact:true}).first().fill('Borrador conservado'); await page.getByRole('button',{name:'Crear ejercicio',exact:true}).click(); await page.locator('main [role=alert]').waitFor(); assert.equal(await page.getByLabel('Nombre del ejercicio',{exact:true}).first().inputValue(),'Borrador conservado'); failWrite=false;
  failRead=true; await page.goto(base+'/training'); await page.locator('main [role=alert]').waitFor(); failRead=false;
  // University: real SQL CRUD with owner isolation and cross-table FK constraints.
  await page.goto(base+'/study?view=subjects');
  await page.getByLabel('Nombre de la materia').fill('Ingeniería del Software');
  await page.getByRole('button',{name:'Registrar',exact:true}).click();
  await page.getByRole('heading',{name:'Ingeniería del Software',exact:true}).waitFor();
  await page.goto(base+'/study?view=assignments');
  await page.getByLabel('Materia',{exact:true}).first().selectOption({label:'Ingeniería del Software'});
  await page.getByLabel('Título de la tarea').fill('Trabajo final');
  await page.getByRole('button',{name:'Registrar',exact:true}).click();
  await page.getByRole('heading',{name:'Trabajo final',exact:true}).waitFor();
  await page.goto(base+'/study?view=exams');
  await page.getByLabel('Materia',{exact:true}).first().selectOption({label:'Ingeniería del Software'});
  await page.getByLabel('Nombre del examen').fill('Parcial');
  await page.getByRole('button',{name:'Registrar',exact:true}).click();
  await page.getByRole('heading',{name:'Parcial',exact:true}).waitFor();
  await page.goto(base+'/study?view=sessions');
  await page.getByLabel('Materia',{exact:true}).first().selectOption({label:'Ingeniería del Software'});
  await page.getByLabel('Tema estudiado').fill('Arquitectura de software');
  await page.getByRole('button',{name:'Registrar',exact:true}).click();
  await page.getByRole('heading',{name:'Arquitectura de software',exact:true}).waitFor();
  await page.goto(base+'/reminders');
  await page.getByRole('heading',{name:'Recordatorios recurrentes'}).waitFor();
  await page.getByLabel('Título',{exact:true}).fill('Revisar apuntes');
  await page.getByLabel('Repetición').selectOption('daily');
  const seriesStart=new Date(Date.now()+86400000).toISOString().slice(0,10);
  await page.getByLabel('Fecha de inicio').fill(seriesStart);
  await page.getByLabel('Hora local').fill('18:00');
  await page.getByRole('button',{name:'Crear serie'}).click();
  await page.getByRole('heading',{name:'Revisar apuntes'}).waitFor();
  await page.getByRole('button',{name:'Pausar serie'}).click();
  await page.getByRole('button',{name:'Reactivar serie'}).waitFor();
  await page.getByRole('button',{name:'Reactivar serie'}).click();
  await page.getByRole('button',{name:'Pausar serie'}).waitFor();
  await page.goto(base+'/study');
  await page.getByText('Trabajo final',{exact:true}).waitFor();
  // Phase 5A.1: manual reminder saves to user-owned RLS-backed table. No delivery is implied.
  const futureDate=new Date(Date.parse(today+"T12:00:00Z")+2*86400000).toISOString().slice(0,10)+"T16:30";
  await page.goto(base+'/reminders');
  await page.getByText('Los avisos automáticos todavía no están activos.').waitFor();
  await page.getByLabel('¿Qué querés recordar?').fill('Repasar cálculo');
  await page.getByLabel('Fecha y hora').fill(futureDate);
  await page.getByRole('button',{name:'Agregar a mi lista'}).click();
  await page.getByRole('heading',{name:'Repasar cálculo'}).waitFor();
  await page.getByRole('button',{name:'Marcar realizado'}).click();
  await page.getByText('Realizado',{exact:true}).waitFor();
  const reminderRows=(await db.query("select title,status from public.reminders where user_id=$1",[alice])).rows;
  assert.deepEqual(reminderRows,[{title:'Repasar cálculo',status:'completed'}]);

  await page.goto(base+'/assistant');
  await page.getByRole('heading',{name:'¿En qué te puedo ayudar hoy?'}).waitFor();
  assert.equal(await page.getByLabel('Tu pregunta').isDisabled(),true,'assistant requires a configured Gemini key');
  await page.getByRole('link',{name:'Más',exact:true}).click();
  await page.waitForURL(/\/menu$/);
  await page.getByRole('link',{name:'Asistente IA',exact:true}).waitFor({state:'visible'});
  assert.equal((await page.request.post(base+'/api/assistant',{
    headers: {'Content-Type':'application/json',origin:base},
    data: {message:'Qué tengo hoy?'}
  })).status(),503,'no provider key should never fake model output');
  assistantApp=launch(['start','-H','localhost','-p','3110'], true);
  assistantApp.stdout.on('data',b=>logs.push(String(b)));
  assistantApp.stderr.on('data',b=>logs.push(String(b)));
  const assistantBase='http://localhost:3110';
  await waitForApp(assistantApp, assistantBase);
  await testAssistantBrowser({
    page, base: assistantBase, db, output,
    setRevoked: value => { revoked = value; },
    setFailWrite: value => { failWrite = value; },
  });
  await testCheckinBrowser({
    page, base: assistantBase, db, output,
    setRevoked: value => { revoked = value; },
    setFailWrite: value => { failWrite = value; },
  });
  await testStudyBrowser({ page, base: assistantBase, db, output,
    setRevoked: value => { revoked = value; },
    setFailWrite: value => { failWrite = value; },
  });
  const paths=['/','/reminders','/assistant','/menu','/study','/study?view=subjects','/study?view=assignments','/study?view=exams','/study?view=sessions','/habits','/check-in','/journal','/goals','/profile','/training','/training?view=exercises','/training?view=plans','/training?view=history','/training?view=health',sessionUrl.replace(base,''),exerciseUrl.replace(base,'')];
  for(const width of [360,390,768,800,930,1280]){
    await page.setViewportSize({width,height:900});
    for(const path of paths){ await page.goto(base+path); await page.locator('h1').waitFor(); assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width} ${path}`); const nav=page.getByRole('navigation',{name:'Navegación principal',exact:true}); assert.equal(await nav.isVisible(),true); const box=await nav.boundingBox(); if(width<=800)assert.ok(box.y>500,`menú móvil ${width}`); else assert.ok(box.x<250,`menú escritorio ${width}`);
      const buttons=page.locator('form button[type=submit]:visible'); if(await buttons.count()){const button=buttons.last();await button.scrollIntoViewIfNeeded();const b=await button.boundingBox();assert.ok(b.y>=0 && b.y+b.height<=(width<=800?box.y:900)+2,`botón tapado ${width} ${path}`);}
    }
    await page.goto(base+'/');
    await page.locator('h1').waitFor(); // loading.tsx can stream before the authenticated shell
    const mainNav=page.getByRole('navigation',{name:'Navegación principal',exact:true});
    if(width<=800){
      assert.equal(await mainNav.getByRole('link').count(),5,'cinco accesos principales móviles');
      await mainNav.getByRole('link',{name:'Más'}).click();
      await page.waitForURL(/\/menu$/);
      await page.getByRole('link',{name:'Mi diario'}).click();
      await page.waitForURL(/\/journal$/);
    } else {
      await mainNav.getByRole('link',{name:'Mi diario'}).click();
      await page.waitForURL(/\/journal$/);
      await mainNav.getByRole('link',{name:'Entrenamiento',exact:true}).click();
      await page.waitForURL(/\/training$/);
      await mainNav.getByRole('link',{name:'Ejercicios'}).waitFor({state:'visible'}); // streamed page may arrive after URL changes
    }
    await page.goto(base+'/training'); await page.screenshot({path:join(output,`training-${width}.png`),fullPage:true});
  }
  assert.equal((await page.request.get(base+'/api/health/supabase')).status(),404);
  revoked=true; await page.goto(base+'/training'); await page.waitForURL(/login/);
  assert.deepEqual(errors,[]); console.log('PASS: navegador con SQL real, recorrido completo, borrador/recarga, medidas/molestias, evolución, fallos, sesión, navegación y controles a seis anchos.');
} catch(error) { console.error('Browser failure:', error.message); throw error; }
finally { await writeFile(join(output,'next-browser.log'),logs.join('')); if(browser)await browser.close();if(assistantApp)assistantApp.kill();if(app)app.kill();server.closeAllConnections();await new Promise(r=>server.close(r));await db.close(); }
