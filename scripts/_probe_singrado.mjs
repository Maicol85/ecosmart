#!/usr/bin/env node
/**
 * _probe_singrado.mjs — sonda TEMPORAL (no es la suite) para la tanda
 * «valvulopatia consignada sin grado, leves y fundamento».
 *
 * Mide, para cada escena: los TRES estilos del informe narrativo, el EN SUMA, el texto del
 * PDF real (interceptando doc.text sobre el jsPDF que construye _pdfAjustarA4) y la fila de
 * Excel que devuelve _labExcelRow sobre un snapshot del formulario.
 *
 * Uso:  node scripts/_probe_singrado.mjs            > /tmp/lado.json
 *       node scripts/_probe_singrado.mjs --ver
 *
 * La infraestructura (servidor, Chrome, CDP) es la MISMA de scripts/test_clinico.mjs, copiada
 * a proposito: importar de un modulo de 3 MB para reusar 60 lineas cuesta mas de lo que ahorra.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
      try { process.kill(-v.pid, 'SIGKILL'); }
      catch (e) { try { process.kill(v.pid, 'SIGKILL'); } catch (e2) {} }
      if (v.perfil) { try { rmSync(v.perfil, { recursive: true, force: true }); } catch (e) {} }
    }
    _ARNES_VIVOS.clear();
  };
  process.on('exit', barrer);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { barrer(); process.exit(130); });
  }
}


const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-probe-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}
function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

/* ── Sonda inyectada ─────────────────────────────────────────────────────────────────────────
   OJO: el cuerpo es un template literal, igual que los casos de la suite. Sin acentos graves
   adentro, ni en los comentarios. */
const SONDA = `
window.__p = {
  set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  chk(id, on) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.checked = on !== false; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  /* Grado SIN disparar eventos: los cambios por .value no corren onchange, que es exactamente
     lo que necesito para fijar un grado sin que la cascada lo pise ni se marque como manual. */
  grado(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; return String(e.value); },
  /* El estado del boton ES la clase que lee pillOn. Se escribe directo y no por toggleValvPill
     para no arrastrar sincronizarEMDesdeGlobal, que reescribe grados. */
  pill(valv, tipo, on) { const b = document.getElementById('pill-' + tipo + '-' + valv);
    if (!b) return 'NO EXISTE pill-' + tipo + '-' + valv;
    b.classList.toggle('btn-primary', !!on); b.classList.toggle('btn-ghost', !on);
    const bl = document.getElementById('bloque-' + tipo + '-' + valv);
    if (bl) bl.style.display = on ? 'block' : 'none';
    return window.pillOn(valv, tipo) === !!on ? 1 : 'NO QUEDO'; },
  manual(obj) { window.esqSevManual = obj || {};
    const h = document.getElementById('sev_manual');
    if (h) h.value = JSON.stringify(window.esqSevManual);
    return JSON.stringify(window.esqSevManual); },
  limpiar() { try { limpiarCampos(true); } catch(e) {} window.esqSevManual = {};
    ['aortica','mitral','tricuspide'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){ try { window.__p.pill(v,t,false); } catch(e){} }); });
    return 1; },
  tresEstilos() {
    const out = {};
    ['conciso','estandar','narrativo'].forEach(function(st){
      window.estiloInformeProbe = st;
      try { setEstiloInforme(st); } catch(e) {}
      generarInforme();
      out[st] = (document.getElementById('informe_texto')||{}).value || '';
    });
    out.suma = (document.getElementById('en_suma')||{}).value || '';
    try { setEstiloInforme('estandar'); } catch(e) {}
    return out;
  },
  /* PDF REAL. Se envuelve el CONSTRUCTOR de jsPDF y se junta todo lo que pasa por doc.text.
     _pdfAjustarA4 construye varios documentos (los pasos de medicion) y el ULTIMO es el que se
     dibuja: por eso se guarda un array y se devuelve el ultimo no vacio. */
  pdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) return 'SIN jsPDF';
    const Orig = window.jspdf.jsPDF; const docs = [];
    window.jspdf.jsPDF = function(){
      const d = new Orig(arguments[0]); const buf = []; docs.push(buf);
      const t = d.text.bind(d);
      d.text = function(txt){ try { buf.push(Array.isArray(txt) ? txt.join(' | ') : String(txt)); } catch(e){}
        return t.apply(d, arguments); };
      d.save = function(){ return d; };
      return d; };
    window.jspdf.jsPDF.prototype = Orig.prototype;
    let err = null;
    try { _pdfAjustarA4(); } catch(e) { err = 'EXC: ' + e.message; }
    window.jspdf.jsPDF = Orig;
    if (err) return err;
    const llenos = docs.filter(function(b){ return b.length; });
    return llenos.length ? llenos[llenos.length - 1].join('\\n') : 'SIN TEXTO (' + docs.length + ' docs)';
  },
  /* Excel: el MISMO barrido de ids que hace guardarInforme, y despues _labExcelRow. Es un
     snapshot parcial a proposito (sin contractilidad ni strain), y es valido para el A/B porque
     los dos lados lo arman igual. */
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-03', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; }
  },
  escena(cfg) {
    window.__p.limpiar();
    (cfg.campos || []).forEach(function(p){ window.__p.set(p[0], p[1]); });
    (cfg.chks   || []).forEach(function(p){ window.__p.chk(p[0], p[1]); });
    (cfg.grados || []).forEach(function(p){ window.__p.grado(p[0], p[1]); });
    (cfg.pills  || []).forEach(function(p){ window.__p.pill(p[0], p[1], p[2]); });
    if (cfg.manual !== null) window.__p.manual(cfg.manual || {});
    (cfg.aplicar || []).forEach(function(t){ try { window.valvSev.aplicar(t[0],t[1],t[2]); } catch(e){} });
    const r = window.__p.tresEstilos();
    r.id = cfg.id; r.desc = cfg.desc;
    r.estado = { ea: window.__p.val('ea_grado'), em: window.__p.val('em_grado'),
                 ia: window.__p.val('ia_grado'), im: window.__p.val('im_grado'),
                 et: window.__p.val('et_grado'), ep: window.__p.val('ep_grado'),
                 ip: window.__p.val('ip_grado'), it: window.__p.val('it_grado'),
                 manual: JSON.stringify(window.esqSevManual || {}),
                 pills: ['esten-aortica','insuf-aortica','esten-mitral','insuf-mitral']
                   .map(function(k){ const b=document.getElementById('pill-'+k);
                     return k + '=' + (b && b.classList.contains('btn-primary') ? 1 : 0); }).join(',') };
    if (cfg.pdf)   r.pdf   = window.__p.pdf();
    if (cfg.excel) r.excel = window.__p.excel();
    return r;
  },
  val(id) { const e = document.getElementById(id); return e ? e.value : null }
};
`;

// ── Escenas ─────────────────────────────────────────────────────────────────────────────────
/* Un solo eje por escena: la mitad que NO se prueba queda en «cerrado y vacio», que es el
   estado 4. Sin eso, la frase de la valvula combina las dos mitades y no se puede leer cual
   de las dos produjo que texto. */
const MED_EA = [['vmax_ao','4.2'], ['gmedio_ao','45']];
const MED_EM = [['avm_plan','1.2']];
const ESCENAS = [];
const push = (o) => ESCENAS.push(o);

// ── EAo: los cuatro estados ──
push({ id:'EA-1-grado',   desc:'EAo: hay grado (moderada, a mano)',
       grados:[['ea_grado','moderada']], manual:{ea:true}, pills:[['aortica','esten',true]], pdf:1, excel:1 });
push({ id:'EA-2-abierto', desc:'EAo: boton ABIERTO y sin grado',
       grados:[['ea_grado','sin']], manual:{}, pills:[['aortica','esten',true]], pdf:1, excel:1 });
push({ id:'EA-3-sin',     desc:'EAo: «Sin» elegido a proposito (manual)',
       grados:[['ea_grado','sin']], manual:{ea:true}, pills:[['aortica','esten',true]], pdf:1, excel:1 });
push({ id:'EA-4-cerrado', desc:'EAo: boton cerrado y nada cargado',
       grados:[['ea_grado','sin']], manual:{}, pills:[['aortica','esten',false]], pdf:1, excel:1 });
// Control: boton abierto sin grado PERO con mediciones (para ver si eaEscenario interfiere)
push({ id:'EA-2b-medido', desc:'EAo: boton ABIERTO, sin grado, CON Vmax 4.2 y Gm 45',
       campos:MED_EA, grados:[['ea_grado','sin']], manual:{}, pills:[['aortica','esten',true]], excel:1 });

// ── IAo: los cuatro estados ──
push({ id:'IA-1-grado',   desc:'IAo: hay grado (moderada)',
       grados:[['ia_grado','2']], manual:{ia:true}, pills:[['aortica','insuf',true]], excel:1 });
push({ id:'IA-2-abierto', desc:'IAo: boton ABIERTO y sin grado',
       grados:[['ia_grado','0']], manual:{}, pills:[['aortica','insuf',true]], excel:1 });
push({ id:'IA-3-sin',     desc:'IAo: «Sin» elegido a proposito (manual)',
       grados:[['ia_grado','0']], manual:{ia:true}, pills:[['aortica','insuf',true]], excel:1 });
push({ id:'IA-4-cerrado', desc:'IAo: boton cerrado y nada cargado',
       grados:[['ia_grado','0']], manual:{}, pills:[['aortica','insuf',false]], excel:1 });

// ── EM: los cuatro estados ──
push({ id:'EM-1-grado',   desc:'EM: hay grado (moderada, a mano)',
       grados:[['em_grado','moderada']], manual:{em:true}, pills:[['mitral','esten',true]], excel:1 });
push({ id:'EM-2-abierto', desc:'EM: boton ABIERTO y sin grado',
       grados:[['em_grado','sin']], manual:{}, pills:[['mitral','esten',true]], excel:1 });
push({ id:'EM-3-sin',     desc:'EM: «Sin» elegido a proposito (manual)',
       grados:[['em_grado','sin']], manual:{em:true}, pills:[['mitral','esten',true]], excel:1 });
push({ id:'EM-4-cerrado', desc:'EM: boton cerrado y nada cargado',
       grados:[['em_grado','sin']], manual:{}, pills:[['mitral','esten',false]], excel:1 });
push({ id:'EM-2b-medido', desc:'EM: boton ABIERTO, sin grado, CON AVm plan 1.2',
       campos:MED_EM, grados:[['em_grado','sin']], manual:{}, pills:[['mitral','esten',true]], excel:1 });

// ── IM: los cuatro estados ──
push({ id:'IM-1-grado',   desc:'IM: hay grado (moderada)',
       grados:[['im_grado','2']], manual:{im:true}, pills:[['mitral','insuf',true]], excel:1 });
push({ id:'IM-2-abierto', desc:'IM: boton ABIERTO y sin grado',
       grados:[['im_grado','0']], manual:{}, pills:[['mitral','insuf',true]], excel:1 });
push({ id:'IM-3-sin',     desc:'IM: «Sin» elegido a proposito (manual)',
       grados:[['im_grado','0']], manual:{im:true}, pills:[['mitral','insuf',true]], excel:1 });
push({ id:'IM-4-cerrado', desc:'IM: boton cerrado y nada cargado',
       grados:[['im_grado','0']], manual:{}, pills:[['mitral','insuf',false]], excel:1 });

// ── Tricuspide y pulmonar: como se comportan HOY (medir, no cambiar) ──
push({ id:'IT-2-abierto', desc:'IT: boton ABIERTO y sin grado',
       grados:[['it_grado','0']], manual:{}, pills:[['tricuspide','insuf',true]] });
push({ id:'IT-4-cerrado', desc:'IT: boton cerrado y nada cargado',
       grados:[['it_grado','0']], manual:{}, pills:[['tricuspide','insuf',false]] });
push({ id:'ET-2-abierto', desc:'ET: boton ABIERTO y sin grado',
       grados:[['et_grado','sin']], manual:{}, pills:[['tricuspide','esten',true]] });
push({ id:'VP-2-abierto', desc:'VP: campos de estenosis/insuf pulmonar vacios',
       grados:[['ep_grado','sin']], manual:{} });

// ── Las LEVES, una por valvula ──
push({ id:'LV-EA-leve', desc:'LEVE: EAo leve',   grados:[['ea_grado','leve']], manual:{ea:true}, pills:[['aortica','esten',true]] });
push({ id:'LV-IA-leve', desc:'LEVE: IAo leve',   grados:[['ia_grado','1']],    manual:{ia:true}, pills:[['aortica','insuf',true]] });
push({ id:'LV-EM-leve', desc:'LEVE: EM leve',    grados:[['em_grado','leve']], manual:{em:true}, pills:[['mitral','esten',true]] });
push({ id:'LV-IM-leve', desc:'LEVE: IM leve',    grados:[['im_grado','1']],    manual:{im:true}, pills:[['mitral','insuf',true]] });
push({ id:'LV-IT-leve', desc:'LEVE: IT leve',    grados:[['it_grado','1']],    manual:{it:true}, pills:[['tricuspide','insuf',true]] });
push({ id:'LV-ET-leve', desc:'LEVE: ET leve',    grados:[['et_grado','Leve']], manual:{}, pills:[['tricuspide','esten',true]] });
push({ id:'LV-EP-leve', desc:'LEVE: EP leve',    grados:[['ep_grado','Leve']], manual:{} });
push({ id:'LV-IP-leve', desc:'LEVE: IP leve',    grados:[['ip_grado','Leve']], manual:{} });

// ── Fundamento de la aortica → EN SUMA (decision 5) ──
/* Para que el cajon aparezca hace falta DISCREPANCIA: grado a mano distinto del calculado.
   Con Vmax 4.2 / Gm 45 el calculado es severa; se fija «severa» a mano igual y se tildan las
   opciones del lado «sube» para ver que manda hoy al informe y al EN SUMA. */
push({ id:'FD-bfbg-red',  desc:'FUND: severa a mano sobre calculado menor + BF/BG FEVI reducida',
       campos:[['vmax_ao','3.2'],['gmedio_ao','25']], grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_bfbg_red',true]] });
push({ id:'FD-bfbg-cons', desc:'FUND: idem con FEVI conservada',
       campos:[['vmax_ao','3.2'],['gmedio_ao','25']], grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_bfbg_cons',true]] });
push({ id:'FD-plan',      desc:'FUND: idem con AVA por planimetria',
       campos:[['vmax_ao','3.2'],['gmedio_ao','25'],['ava_plan','0.8']], grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_plan',true]] });
push({ id:'FD-otsvi',     desc:'FUND: «Sin estenosis» a mano sobre calculado severo + OTSVI',
       campos:MED_EA, grados:[['ea_grado','sin']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_otsvi',true]] });
push({ id:'FD-otro',      desc:'FUND: «Otro» + nota (NO debe ir al EN SUMA)',
       campos:[['vmax_ao','3.2'],['gmedio_ao','25']], grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_otro',true]], campos2:[['ea_fund_nota','criterio clinico']] });
push({ id:'FD-im-nota',   desc:'FUND mitral: IM severa a mano + nota (texto libre)',
       campos:[['im_eroa','0.15'],['ia_fund_nota','']], grados:[['im_grado','4']], manual:{im:true},
       pills:[['mitral','insuf',true]] });

// ── «Mixta» NUNCA (decision 3): las dos con su grado ──
push({ id:'MIX-ao', desc:'MIXTA aortica: EAo leve + IAo leve, las dos con grado',
       grados:[['ea_grado','leve'],['ia_grado','1']], manual:{ea:true,ia:true},
       pills:[['aortica','esten',true],['aortica','insuf',true]], excel:1 });
push({ id:'MIX-mi', desc:'MIXTA mitral: EM moderada + IM severa',
       grados:[['em_grado','moderada'],['im_grado','4']], manual:{em:true,im:true},
       pills:[['mitral','esten',true],['mitral','insuf',true]], excel:1 });
// Mitad con grado y mitad sin: el estado 1 y el estado 2 en la MISMA valvula
push({ id:'MIX-ao-mitad', desc:'MIXTA aortica: EAo moderada (grado) + IAo abierta SIN grado',
       grados:[['ea_grado','moderada'],['ia_grado','0']], manual:{ea:true},
       pills:[['aortica','esten',true],['aortica','insuf',true]] });

// ── Fundamento: combinacion y control negativo ──
push({ id:'FD-combo', desc:'FUND: BF/BG FEVI reducida Y planimetria a la vez',
       campos:[['vmax_ao','3.2'],['gmedio_ao','25'],['ava_plan','0.8']], grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_bfbg_red',true],['ea_fund_plan',true]] });
/* CONTROL NEGATIVO del cajon: las casillas tildadas SIN discrepancia (grado = el calculado) no
   deben aportar ni una palabra. `sevDiscrepa` es la compuerta, y si fallara abierta el informe
   publicaria un fundamento sobre un grado que nadie ajusto. */
push({ id:'FD-neg', desc:'CONTROL NEGATIVO: casillas tildadas y SIN discrepancia',
       campos:MED_EA, grados:[['ea_grado','severa']], manual:{ea:true},
       pills:[['aortica','esten',true]], chks:[['ea_fund_bfbg_red',true],['ea_fund_otsvi',true]] });

// ── TRIAGE de los hallazgos de /sharp-edges (2026-10-03) ──
/* H1 — el <select> de grado de la AORTICA pasa por _gradoManoBorraMarca, que (dice el informe) NO
   enciende esqSevManual. Si es cierto, elegir «Sin estenosis» por el control PRINCIPAL deja el
   escalon nuevo corriendo y el informe firmado dice «con estenosis». Se usa `set` (que despacha
   change, o sea el camino REAL de la UI) y NO se toca esqSevManual a mano. */
push({ id:'H1-sel-ea', desc:'H1: «Sin estenosis» elegido por el <select> real de la aortica (con change)',
       campos:[['vmax_ao','4.1'],['ea_grado','sin']], manual:null, pills:[['aortica','esten',true]] });
push({ id:'H1-sel-ia', desc:'H1: «Sin insuficiencia» elegido por el <select> real (ia_sev_final)',
       campos:[['im_vc','2'],['ia_sev_final','0']], manual:null, pills:[['aortica','insuf',true]] });
/* CONTROL NEGATIVO de H1: el mismo gesto por el menu ▼, que SI marca. Si las dos escenas salen
   iguales, la sonda no distingue caminos y no prueba nada. */
push({ id:'H1-menu-ea', desc:'H1 control: «Sin» por el menu ▼ (valvSev.aplicar), que si marca',
       campos:[['vmax_ao','4.1']], aplicar:[['esten','aortica','sin']], manual:null, pills:[['aortica','esten',true]] });
/* H2 — el suma.push('EM.') corre ANTES de la compuerta de protesis. */
push({ id:'H2-prot-em', desc:'H2: protesis mitral, pastilla abierta y SIN grado — EN SUMA',
       campos:[['vm_morf','Prótesis mecánica']], grados:[['em_grado','sin']], manual:{}, pills:[['mitral','esten',true]] });
/* H3 — la rama de «valores medidos sin veredicto» usa !estEGrado y el EN SUMA usa estE. */
push({ id:'H3-medido-em', desc:'H3: AVm 2.0 por planimetria, pastilla abierta y SIN grado — EN SUMA',
       campos:[['avm_plan','2.0']], grados:[['em_grado','sin']], manual:{}, pills:[['mitral','esten',true]] });
/* H11b — protesis aortica con la pastilla de insuficiencia abierta y sin grado. */
push({ id:'H11-prot-ia', desc:'H11b: protesis aortica, pastilla de insuficiencia abierta y sin grado',
       campos:[['va_morf','Prótesis biológica']], grados:[['ia_grado','0']], manual:{}, pills:[['aortica','insuf',true]] });

// ── Main ────────────────────────────────────────────────────────────────────────────────────
let servidor, chrome;
try {
  const s = await servir(); servidor = s.srv;
  chrome = await abrirChrome(`http://127.0.0.1:${s.port}/index.html`);
  const cdp = await conectar(chrome.wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find(t => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error en la pagina');
    return r.result.value;
  };
  await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){} location.reload(); return 1;`);
  for (let i = 0; i < 80; i++) {
    await new Promise(r => setTimeout(r, 250));
    const listo = await ev(`return (typeof generarInforme === 'function') && !!document.getElementById('informe_texto');`).catch(() => false);
    if (listo) break;
  }
  if (!await ev(`return typeof generarInforme === 'function';`)) throw new Error('la app no cargo');
  // jsPDF llega por CDN: sin esta espera la medicion del PDF sale «SIN jsPDF» intermitente.
  for (let i = 0; i < 40; i++) {
    if (await ev(`return !!(window.jspdf && window.jspdf.jsPDF);`).catch(() => false)) break;
    await new Promise(r => setTimeout(r, 250));
  }
  await ev(SONDA + ' return 1;');
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  const salida = { jsPDF: await ev(`return !!(window.jspdf && window.jspdf.jsPDF);`), escenas: [] };
  for (const e of ESCENAS) {
    // `campos2` se aplica DESPUES de los checkbox: la nota del fundamento solo existe con el cajon abierto.
    const cfg = JSON.stringify(e);
    let r;
    try {
      r = await ev(`const c = ${cfg}; const r = window.__p.escena(c);
        if (c.campos2) { c.campos2.forEach(function(p){ window.__p.set(p[0], p[1]); });
          const r2 = window.__p.tresEstilos(); r.conciso = r2.conciso; r.estandar = r2.estandar;
          r.narrativo = r2.narrativo; r.suma = r2.suma; }
        return r;`);
    } catch (err) { r = { id: e.id, desc: e.desc, error: err.message }; }
    salida.escenas.push(r);
    process.stderr.write('  ' + e.id.padEnd(16) + ' ok\n');
  }
  console.log(JSON.stringify(salida, null, 1));
  cdp.close();
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive:true, force:true }); } catch {} }
  /* Sin esto el servidor HTTP y el event loop quedan vivos y se juntan zombies reteniendo su
     Chrome: es la trampa documentada de cdp.mjs. */
  process.exit(process.exitCode || 0);
}
