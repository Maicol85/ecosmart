#!/usr/bin/env node
/**
 * _probe_pantalla.mjs — sonda A/B de SOLO LECTURA para la tanda de PANTALLA de la pestania
 * Valvulas: campos fijos en la PC, aortica en tres columnas, tarjetas cerradas al entrar.
 *
 * Mide, en los dos arboles (HEAD y el nuevo), con --file:
 *   · GEOMETRIA (top/left/width) de cada elemento de los CUATRO bloques de tricuspide y pulmonar,
 *     a 360 / 390 / 1200 px. Es la condicion de Maicol: solo debe cambiar lo pedido.
 *   · ORDEN DE TABULACION de los dos bloques aorticos, por el algoritmo real del navegador.
 *   · Visibilidad de campos con el boton APAGADO, en PC y en celular.
 *   · Tarjetas de las cuatro valvulas al entrar a la pestania, y tras escribir un dato.
 *   · El aviso `it-incongruencia` con la Vmax IT cargada y el boton apagado.
 *   · La sincronia de los espejos de la EA al entrar: boton, pastilla y grado A/B.
 *   · Informe, EN SUMA y Excel en varias escenas.
 *   · Desborde horizontal a los tres anchos.
 *
 *   node scripts/_probe_pantalla.mjs --file /tmp/index.HEAD2.html > /tmp/pan.HEAD.json
 *   node scripts/_probe_pantalla.mjs                              > /tmp/pan.NEW.json
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_gradofijo.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;

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
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE;
        const p = (EXTERNO && rel === FILE) ? FARG : join(RAIZ, rel);
        if (!EXTERNO && !p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-pantalla-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__S = {
  /* Los elementos de los CUATRO bloques de tricuspide y pulmonar, por id. Se listan a mano y no
     se derivan del contenedor a proposito: el contenedor CAMBIA de nombre en el arbol nuevo
     (aparece caja-* y campos-*), asi que derivarlos haria que los dos lados midieran conjuntos
     distintos y el A/B no compararia nada. Con la lista fija, cada id se mide en los dos. */
  IDS_TRI_PULM: [
    'it_grado','it_fund_nota','it_vc','it_pisa_r','it_pisa_val','it_vmax_cw','it_vti','it_densidad',
    'it-manual-aviso','it-fund','it-incongruencia',
    'et_grado','et_fund_nota','et_gmedio','et_thp','et_vti_diast','et_avt',
    'et-manual-aviso','et-fund',
    'ip_etiologia','ip_grado',
    'ep_fund_nota','ep_grado','ep_nivel','ep-manual-aviso','ep-fund'
  ],
  /* Los dos bloques aorticos, en el orden en que el pedido los quiere: insuficiencia primero. */
  IDS_AO_INSUF: ['ia_vc','ia_jet_diam','ia_pht','ia_pisa_r','ia_pisa_val','ia_vmax_cw',
                 'ia_vti','ia_vmax_td','ia_vti_desc'],
  IDS_AO_ESTEN: ['ea_vmax','ea_gmax_display','ea_gmedio','ea_dtsvi','ea_vtitsvi','ea_vtiao',
                 'ea_dvi_display','ea_ava_display','ava_plan'],

  el(id){ return document.getElementById(id) },
  val(id){ var e=this.el(id); return e?e.value:null },
  txt(id){ var e=this.el(id); return e?(e.textContent||'').trim():null },
  pill(v,t){ try{ return pillOn(v,t) }catch(e){ return 'EXC' } },
  abrir(v,t){ if(this.pill(v,t)!==true){ try{ toggleValvPill(v,t) }catch(e){} } return this.pill(v,t) },
  cerrar(v,t){ if(this.pill(v,t)===true){ try{ toggleValvPill(v,t) }catch(e){} } return this.pill(v,t) },

  /* Visible DE VERDAD: se sube por los ancestros. Un nodo con display propio heredado de un padre
     oculto mide 0x0, que es la trampa del denominador que CLAUDE.md documenta. */
  vis(id){ var e=this.el(id); if(!e) return null;
    var n=e; while(n&&n.nodeType===1){ if(getComputedStyle(n).display==='none') return false; n=n.parentNode }
    return true },

  geo(id){ var e=this.el(id); if(!e) return 'falta';
    if(!this.vis(id)) return 'oculto';
    var r=e.getBoundingClientRect();
    if(!r.width&&!r.height) return 'sin caja';
    return { top:Math.round(r.top), left:Math.round(r.left), w:Math.round(r.width) } },

  /* ══ GEOMETRIA RELATIVA A LA TARJETA DE SU PROPIA VALVULA ════════════════════════════════════
     ⚠️ LA ABSOLUTA NO SIRVE PARA ESTE A/B Y LA PRIMERA VERSION LA USABA. En el arbol nuevo los
     campos de la AORTICA se ven siempre, asi que esa tarjeta es mas alta y TODO lo que viene
     debajo baja: la tricuspide aparecia movida 401 px con su maquetacion interna intacta, y el
     diff decia \"cambiaron 18 de 26\" cuando lo que cambio estaba en otra valvula.
     Midiendo contra el borde de la propia tarjeta, un desplazamiento de arriba se cancela y lo que
     queda es lo que esta tanda le hizo a ESTE bloque. */
  geoRel(id){ var e=this.el(id); if(!e) return 'falta';
    if(!this.vis(id)) return 'oculto';
    var r=e.getBoundingClientRect();
    if(!r.width&&!r.height) return 'sin caja';
    var sec=e.closest('[id^=ete-seccion-valv-]'); if(!sec) return 'sin tarjeta';
    var s=sec.getBoundingClientRect();
    return { dtop:Math.round(r.top-s.top), dleft:Math.round(r.left-s.left), w:Math.round(r.width) } },

  /* ══ TARJETAS DE VALVULA ══════════════════════════════════════════════════════════════════════
     El estado real es el display de ete-seccion-valv-<x>. Se devuelve el de las cuatro juntas,
     que es lo que el punto 4b gobierna. */
  tarjetas(){ var o={};
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      var s=document.getElementById('ete-seccion-valv-'+v);
      var a=document.getElementById('ete-valv-'+v+'-arrow');
      o[v]={ abierta: !!(s && s.style.display!=='none'),
             flecha: a?(a.style.transform||'(sin rotar)'):null } });
    return o },
  abrirTarjeta(v){ try{ toggleEteSeccion('valv-'+v) }catch(e){} return this.tarjetas()[v] },
  abrirTodas(){ var self=this;
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      var s=document.getElementById('ete-seccion-valv-'+v);
      if(s && s.style.display==='none'){ try{ toggleEteSeccion('valv-'+v) }catch(e){} } });
    return this.tarjetas() },

  entrarPestania(){ try{ showTab('valvulas') }catch(e){} return this.tarjetas() },

  limpiar(){ try{ limpiarCampos(true) }catch(e){}
    window.esqSevManual={}; window._sevCalcAlFijar={};
    window._imGradoCalc=null; window._iaGradoCalc=null; window._itGradoCalc=null;
    try{ if(window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() }catch(e){}
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){ ['esten','insuf'].forEach(function(t){
      try{ localStorage.removeItem('valv-pill-'+t+'-'+v) }catch(e){}
      try{ if(window.__S.pill(v,t)===true) toggleValvPill(v,t) }catch(e){} }) });
    return 1 },

  set(id,v){ var e=this.el(id); if(!e) return 'NO EXISTE '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value },
  quieto(id,v){ var e=this.el(id); if(e) e.value=String(v); return e?e.value:null },

  /* ══ ORDEN DE TABULACION, POR EL ALGORITMO DEL NAVEGADOR ══════════════════════════════════════
     No se deduce del DOM: se enumeran los focusables en orden de documento y se descartan los que
     el navegador NO visita —tabindex negativo, disabled, o sin caja—. Es lo que hace Chrome con
     Tab cuando no hay tabindex positivos, y asi el resultado se puede pegar como \\"la lista de ids
     en orden\\". Los readonly SI reciben Tab en Chrome, por eso aparecen salvo que lleven
     tabindex=-1: eso es justo lo que el punto 2d pide comprobar. */
  tabDe(contId){
    var c=document.getElementById(contId); if(!c) return 'falta '+contId;
    var sel='input,select,textarea,button,a[href],[tabindex]';
    var out=[];
    Array.prototype.forEach.call(c.querySelectorAll(sel), function(e){
      if(e.disabled) return;
      var ti=e.getAttribute('tabindex');
      if(ti!==null && parseInt(ti,10)<0) return;
      var cs=getComputedStyle(e);
      if(cs.display==='none'||cs.visibility==='hidden') return;
      var r=e.getBoundingClientRect(); if(!r.width&&!r.height) return;
      out.push(e.id||('('+e.tagName.toLowerCase()+')'));
    });
    return out },

  /* Tabulacion REAL, moviendo el foco con el metodo del navegador. Se arranca desde el primer
     focusable del contenedor y se avanza con el orden de documento filtrado, comprobando que
     document.activeElement termina donde se espera. Es el control de que tabDe no mienta. */
  tabReal(contId, pasos){
    var c=document.getElementById(contId); if(!c) return 'falta '+contId;
    var lista=this.tabDe(contId); if(typeof lista==='string') return lista;
    var out=[];
    for(var i=0;i<lista.length && i<(pasos||40);i++){
      var e=document.getElementById(lista[i]);
      if(!e){ out.push('(sin id)'); continue }
      try{ e.focus() }catch(err){}
      out.push(document.activeElement===e ? e.id : ('NO FOCUSABLE:'+e.id));
    }
    return out },

  denom(){ try{ showTab('valvulas') }catch(e){} return this.abrirTodas() },

  informe(){ try{ generarInforme() }catch(e){ return {err:e.message} }
    return { inf:(this.el('informe_texto')||{}).value||'', suma:(this.el('en_suma')||{}).value||'' } },

  excel(){ if(typeof _labExcelRow!=='function') return 'SIN _labExcelRow';
    var campos={};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try{ if(typeof _noEsDelEstudio==='function' && _noEsDelEstudio(el.id)) return }catch(e){}
      campos[el.id]=el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id+'__chk']=el.checked?'1':'0' });
    try{ return _labExcelRow({nombre:'P',ci:'1',fecha_estudio:'2026-10-06',campos:campos}) }
    catch(e){ return 'EXC: '+e.message } },

  /* Desborde horizontal de la pestania entera: el scrollWidth del documento contra el viewport,
     y cualquier descendiente de #tab-valvulas que se salga por la derecha. */
  desborde(){
    var doc=document.documentElement;
    var out={ docScroll:doc.scrollWidth, viewport:doc.clientWidth,
              barra: doc.scrollWidth > doc.clientWidth + 1, fuera:[] };
    var tab=document.getElementById('tab-valvulas'); if(!tab) return out;
    var lim=doc.clientWidth;
    Array.prototype.forEach.call(tab.querySelectorAll('*'), function(e){
      if(getComputedStyle(e).display==='none') return;
      var r=e.getBoundingClientRect();
      if(!r.width&&!r.height) return;
      if(Math.round(r.right) > lim+1) out.fuera.push((e.id||e.tagName)+' right='+Math.round(r.right));
    });
    out.fuera=out.fuera.slice(0,12);
    return out },

  /* Blancos tactiles de 44 px dentro de la pestania Valvulas, para el punto 5c. */
  toque(){
    var tab=document.getElementById('tab-valvulas'); if(!tab) return null;
    var chicos=[];
    Array.prototype.forEach.call(tab.querySelectorAll('button,[role=button],summary,.valv-datos-tog'), function(e){
      if(getComputedStyle(e).display==='none') return;
      var r=e.getBoundingClientRect(); if(!r.width&&!r.height) return;
      if(r.width<44||r.height<44) chicos.push((e.id||e.className||e.tagName)+' '+Math.round(r.width)+'x'+Math.round(r.height));
    });
    return { n:chicos.length, lista:chicos.slice(0,10) } },

  /* Foto de una lesion: lo que el pedido vigila que NO cambie. */
  foto(v,t,campo){
    return { pill:this.pill(v,t), grado:this.val(campo),
             pastilla:this.txt('sevbtn-'+t+'-'+v),
             manual: !!(window.esqSevManual||{})[({aortica:{esten:'ea',insuf:'ia'},mitral:{esten:'em',insuf:'im'},
               tricuspide:{esten:'et',insuf:'it'},pulmonar:{esten:'ep',insuf:'ip'}})[v][t]] } }
};
1`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' +
      ((r.exceptionDetails.exception || {}).description || ''));
    return r.result.value;
  };
  const metrica = async (w, h) => cdp.send('Emulation.setDeviceMetricsOverride',
    { width: w, height: h, deviceScaleFactor: 1, mobile: w <= 768 }, sessionId);

  for (let i = 0; i < 120; i++) {
    if (await ev("!!(window.valvSev && typeof generarInforme==='function' && typeof toggleEteSeccion==='function')")) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  await ev(SONDA);

  /* ══ (A) GEOMETRIA de los cuatro bloques de tricuspide y pulmonar, a los tres anchos ═════════
     Con las dos pastillas de cada valvula PRENDIDAS: es el unico estado en que HEAD muestra esos
     campos, asi que es el unico donde el A/B tiene denominador en los dos lados. */
  const geo = {};
  for (const [w, h] of [[1200, 1000], [390, 900], [360, 900]]) {
    await metrica(w, h);
    geo[w] = JSON.parse(await ev(`(function(){
      window.__S.limpiar(); window.__S.denom();
      ['tricuspide','pulmonar'].forEach(function(v){ ['insuf','esten'].forEach(function(t){
        window.__S.abrir(v,t) }) });
      var o={ conPastilla:{}, desborde:null, toque:null };
      window.__S.IDS_TRI_PULM.forEach(function(id){ o.conPastilla[id]=window.__S.geo(id) });
      o.rel={}; window.__S.IDS_TRI_PULM.forEach(function(id){ o.rel[id]=window.__S.geoRel(id) });
      o.desborde = window.__S.desborde();
      o.toque = window.__S.toque();
      /* Y el estado con las pastillas APAGADAS, que es lo que el punto 2a/5a cambia. */
      window.__S.limpiar(); window.__S.denom();
      o.sinPastilla={};
      window.__S.IDS_TRI_PULM.forEach(function(id){ o.sinPastilla[id]=window.__S.vis(id) });
      o.sinPastillaAo={};
      window.__S.IDS_AO_INSUF.concat(window.__S.IDS_AO_ESTEN).forEach(function(id){
        o.sinPastillaAo[id]=window.__S.vis(id) });
      return JSON.stringify(o);
    })()`));
  }

  /* ══ (B) ORDEN DE TABULACION de los dos bloques aorticos, a 1200 px ═════════════════════════ */
  await metrica(1200, 1000);
  const tab = JSON.parse(await ev(`(function(){
    window.__S.limpiar(); window.__S.denom();
    ['aortica'].forEach(function(v){ ['insuf','esten'].forEach(function(t){ window.__S.abrir(v,t) }) });
    /* Se prueban los DOS nombres de contenedor: el viejo y el nuevo. El que exista es el que mide,
       y el nombre usado queda en la salida para que el diff diga por donde entro. */
    var cands = [['insuf','caja-insuf-aortica'],['insuf','bloque-insuf-aortica'],
                 ['esten','caja-esten-aortica'],['esten','bloque-ea-detalle']];
    var o={ usado:{}, lista:{}, real:{} };
    cands.forEach(function(c){
      if (o.usado[c[0]]) return;
      if (document.getElementById(c[1])) { o.usado[c[0]]=c[1];
        o.lista[c[0]]=window.__S.tabDe(c[1]); o.real[c[0]]=window.__S.tabReal(c[1]); }
    });
    /* El orden de los dos bloques ENTRE si: cual aparece primero en el documento. */
    var a=document.getElementById(o.usado.insuf), b=document.getElementById(o.usado.esten);
    o.primero = (a&&b) ? ((a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'insuf' : 'esten') : null;
    /* Y los rotulos, que el pedido cambia en tres y prohibe en el resto. */
    o.rotulos={};
    [['ia_vmax_td','ia_vmax_td'],['ia_vti_desc','ia_vti_desc'],['ea_dtsvi','ea_dtsvi'],
     ['ia_jet_diam','ia_jet_diam'],['ea_vmax','ea_vmax'],['ia_vc','ia_vc'],['ava_plan','ava_plan'],
     ['ea_gmedio','ea_gmedio'],['ea_vtitsvi','ea_vtitsvi'],['ea_vtiao','ea_vtiao'],
     ['ea_gmax_display','ea_gmax_display'],['ea_dvi_display','ea_dvi_display'],
     ['ea_ava_display','ea_ava_display'],['ia_pht','ia_pht'],['ia_pisa_r','ia_pisa_r'],
     ['ia_pisa_val','ia_pisa_val'],['ia_vmax_cw','ia_vmax_cw'],['ia_vti','ia_vti'],
     ['va_notas','va_notas'],['va_at','va_at']].forEach(function(p){
      var e=document.getElementById(p[0]);
      var fg=e?e.closest('.fg'):null; var lb=fg?fg.querySelector('label'):null;
      o.rotulos[p[1]]=lb?lb.textContent.trim():null });
    /* El titulo que el 2b manda sacar. */
    o.tituloCuant = (function(){ var c=document.getElementById('bloque-insuf-aortica');
      if(!c) return null; var t=c.textContent||'';
      return /Insuficiencia A.rtica .{1,3} Cuantificaci.n/.test(t) ? 'PRESENTE' : 'ausente' })();
    o.notasAncho = window.__S.geo('va_notas');
    return JSON.stringify(o);
  })()`));

  /* ══ (C) TARJETAS: al entrar a la pestania, tras escribir un dato, y abrir/cerrar por el nombre ══ */
  const tarjetas = JSON.parse(await ev(`(function(){
    var o={};
    window.__S.limpiar();
    /* Se abren las cuatro A MANO para que \\"cerradas al entrar\\" tenga denominador: sobre cuatro
       tarjetas ya cerradas, el aserto pasaria sin que nada lo cierre. */
    try{ showTab('valvulas') }catch(e){}
    o.denominador = window.__S.abrirTodas();
    try{ showTab('paciente') }catch(e){}
    o.alEntrar = window.__S.entrarPestania();
    /* Tras escribir un dato: NO debe cerrarlas de nuevo (ni abrirlas). */
    window.__S.abrirTodas();
    window.__S.set('ia_vc','7');
    o.trasDato = window.__S.tarjetas();
    /* Y tras un repintado explicito. */
    try{ if(typeof valvSev!=='undefined') valvSev.refrescarTodo() }catch(e){}
    try{ generarInforme() }catch(e){}
    o.trasRepintar = window.__S.tarjetas();
    /* Abrir y cerrar por el nombre, en las cuatro. */
    o.porNombre={};
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      var s=document.getElementById('ete-seccion-valv-'+v);
      var ini = !!(s && s.style.display!=='none');
      try{ toggleEteSeccion('valv-'+v) }catch(e){}
      var uno = !!(s && s.style.display!=='none');
      try{ toggleEteSeccion('valv-'+v) }catch(e){}
      var dos = !!(s && s.style.display!=='none');
      o.porNombre[v]={ inicial:ini, trasUnClic:uno, trasDosClics:dos };
    });
    return JSON.stringify(o);
  })()`));

  /* ══ (D) EL AVISO it-incongruencia CON LA Vmax IT CARGADA Y EL BOTON APAGADO ════════════════
     Condicion 2 de Maicol. El estado es estrecho: calcPSAP prende la pastilla al cargar la Vmax,
     asi que hay que APAGARLA a mano despues, que es el unico camino del medico. */
  const incong = JSON.parse(await ev(`(function(){
    var o={};
    window.__S.limpiar(); window.__S.denom();
    window.__S.set('vmax_it','3.0');
    o.trasVmax = { pill:window.__S.pill('tricuspide','insuf'),
                   aviso:window.__S.txt('it-incongruencia'), vis:window.__S.vis('it-incongruencia') };
    window.__S.cerrar('tricuspide','insuf');
    o.trasApagar = { pill:window.__S.pill('tricuspide','insuf'),
                     aviso:window.__S.txt('it-incongruencia'), vis:window.__S.vis('it-incongruencia'),
                     geo:window.__S.geo('it-incongruencia') };
    /* Control negativo: sin Vmax el aviso tiene que estar MUDO. */
    window.__S.limpiar(); window.__S.denom();
    window.__S.cerrar('tricuspide','insuf');
    o.ctrlSinVmax = { aviso:window.__S.txt('it-incongruencia'), vis:window.__S.vis('it-incongruencia') };
    /* Y que \\"Nuevo estudio\\" lo apague. */
    window.__S.set('vmax_it','3.0'); window.__S.cerrar('tricuspide','insuf');
    var antes = window.__S.txt('it-incongruencia');
    window.__S.limpiar();
    o.trasNuevo = { antes:antes, despues:window.__S.txt('it-incongruencia') };
    return JSON.stringify(o);
  })()`));

  /* ══ (E) LA SINCRONIA DE LOS ESPEJOS DE LA EA AL ENTRAR — condicion 1 y 3 de Maicol ══════════
     Se mide boton, pastilla y grado de la estenosis aortica al entrar a la pestania, con el
     Doppler cargado y vacio, y con grado sin / esclerosis / calculado. Si la sincronia nueva
     prendiera algo que HEAD no prendia, aca se ve. */
  const espejos = JSON.parse(await ev(`(function(){
    var ESP=['ea_vmax','ea_gmedio','ea_dtsvi','ea_vtitsvi','ea_vtiao'];
    var AUTO=['ea_gmax_display','ea_dvi_display','ea_ava_display'];
    var leer=function(){ var o={ foto:window.__S.foto('aortica','esten','ea_grado'), esp:{}, auto:{} };
      ESP.forEach(function(id){ o.esp[id]=window.__S.val(id) });
      AUTO.forEach(function(id){ o.auto[id]=window.__S.val(id) });
      return o };
    var esc=function(nombre, dopp, grado){
      window.__S.limpiar();
      try{ showTab('valvulas') }catch(e){}
      window.__S.abrirTodas();
      if(dopp){ Object.keys(dopp).forEach(function(k){ window.__S.set(k,dopp[k]) }) }
      if(grado!==null){ window.__S.quieto('ea_grado',grado) }
      /* Se APAGA la estenosis a mano: es el estado que el punto 2a crea (campos visibles, boton off) */
      window.__S.cerrar('aortica','esten');
      var pre=leer();
      try{ showTab('paciente') }catch(e){}
      try{ showTab('valvulas') }catch(e){}
      window.__S.abrirTodas();
      return { nombre:nombre, antesDeEntrar:pre, trasEntrar:leer() } };
    var DOPP={ vmax_ao:'4.5', gmedio_ao:'45', diam_tsvi:'21', itv_tsvi:'20', itv_ao:'95' };
    var o={};
    o.doppler_gradoSin        = esc('Doppler cargado, grado sin', DOPP, 'sin');
    o.doppler_esclerosis      = esc('Doppler cargado, esclerosis', DOPP, 'esclerosis');
    o.doppler_gradoCalculado  = esc('Doppler cargado, grado calculado', DOPP, null);
    o.sinDoppler_gradoSin     = esc('Doppler vacio, grado sin', null, 'sin');
    /* ══ LA ESCENA DECISIVA: EL MEDICO CERRO LA ESTENOSIS, ASI QUE LA REGLA J NO LA ABRE ════════
       Las cuatro escenas de arriba salen IDENTICAS en los dos arboles, y eso NO prueba que la
       sincronia nueva haga algo: en HEAD los espejos tambien estaban poblados porque la regla J
       prendio la pastilla al entrar y toggleValvPill sincronizo al abrirla. Para aislar el caso
       hay que impedir que J actue, y la unica forma honesta es la del medico: dejar la clave de
       localStorage en '0', que es lo que escribe un cierre a mano. Con J fuera de juego, en HEAD
       los seis \"auto <- Doppler\" quedan VACIOS con el Doppler cargado, y en el arbol nuevo llegan
       poblados. Es el hueco que la decision de Maicol vino a tapar, y aca se mide. */
    /* ⚠️ EL ORDEN DE ESTOS TRES PASOS ES LA ESCENA, Y LA PRIMERA VERSION LO TUVO AL REVES.
       Cargaba el Doppler ANTES de cerrar la pastilla, y entonces calcAo ya habia corrido
       valvAutoPrenderEsten —que la prende si la clave esta en null— y toggleValvPill ya habia
       sincronizado los espejos: los dos arboles salian poblados y el A/B decia \"identico\" sobre
       una escena que no existia. El orden REAL del medico es: cerrar la estenosis a mano (eso
       escribe la clave en '0') y DESPUES cargar el Doppler. Con la clave en '0',
       valvAutoPrenderEsten sale temprano, la pastilla queda apagada, la compuerta de calcAo
       sigue cerrada y en HEAD los seis espejos quedan VACIOS con el Doppler cargado. */
    window.__S.limpiar();
    try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    window.__S.abrir('aortica','esten');        // la prendo para poder cerrarla con un gesto real
    window.__S.cerrar('aortica','esten');       // esto escribe la clave en '0'
    var lsTrasCerrar = (function(){ try{ return localStorage.getItem('valv-pill-esten-aortica') }catch(e){ return 'EXC' } })();
    try{ showTab('paciente') }catch(e){}
    Object.keys(DOPP).forEach(function(k){ window.__S.set(k,DOPP[k]) });
    var jPre = leer();
    try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    o.medicoCerroLaEstenosis = { lsTrasCerrar:lsTrasCerrar, antesDeEntrar:jPre, trasEntrar:leer(),
      ls:(function(){ try{ return localStorage.getItem('valv-pill-esten-aortica') }catch(e){ return 'EXC' } })() };

    /* Condicion 3: el medico escribe A MANO en un espejo y vuelve a entrar. */
    window.__S.limpiar(); try{ showTab('valvulas') }catch(e){} window.__S.abrirTodas();
    window.__S.cerrar('aortica','esten');
    window.__S.set('ea_vmax','9.9'); window.__S.set('ea_gmedio','99');
    var manoPre=leer();
    try{ showTab('paciente') }catch(e){} try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    o.tipeadoAMano={ antes:manoPre, despues:leer(), dopplerVacio:true };
    /* Y lo mismo con el Doppler CARGADO, que es el caso que puede pisar lo tipeado. */
    window.__S.limpiar(); try{ showTab('valvulas') }catch(e){} window.__S.abrirTodas();
    Object.keys(DOPP).forEach(function(k){ window.__S.set(k,DOPP[k]) });
    window.__S.cerrar('aortica','esten');
    window.__S.set('ea_vmax','9.9');
    var mano2=leer();
    try{ showTab('paciente') }catch(e){} try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    o.tipeadoConDoppler={ antes:mano2, despues:leer() };
    return JSON.stringify(o);
  })()`));

  /* ══ (F) SUPERFICIES FIRMADAS en varias escenas ═════════════════════════════════════════════ */
  const superficies = JSON.parse(await ev(`(function(){
    var out={};
    var combos=[
      { n:'vacio', c:{}, g:{} },
      { n:'con datos sin grado', c:{ ia_vc:'3', vmax_ao:'2.0', it_vc:'2', et_gmedio:'2' }, g:{} },
      { n:'con grado severo',    c:{ ia_vc:'7', vmax_ao:'4.5', it_vc:'8', vmax_it:'3.0' }, g:{} },
      { n:'grados a mano',       c:{}, g:{ ia_grado:'2', ea_grado:'moderada', it_grado:'2',
                                           et_grado:'Significativa', ep_grado:'Moderada', ip_grado:'Leve',
                                           im_grado:'2', em_grado:'moderada' } }
    ];
    combos.forEach(function(C){
      window.__S.limpiar(); window.__S.denom();
      ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
        ['insuf','esten'].forEach(function(t){ window.__S.abrir(v,t) }) });
      Object.keys(C.c).forEach(function(id){ window.__S.set(id,C.c[id]) });
      Object.keys(C.g).forEach(function(id){ window.__S.quieto(id,C.g[id]) });
      var r=window.__S.informe();
      var x=window.__S.excel();
      r.excelN=(x&&typeof x==='object')?Object.keys(x).length:x;
      r.excelValv=(x&&typeof x==='object')?{ im:x['IM grado'], ia:x['IAo grado'], em:x['EM grado'],
        ea:x['EAo grado'], it:x['IT grado'], et:x['ET grado'] }:null;
      r.campos={}; ['ia_grado','ea_grado','it_grado','et_grado','ep_grado','ip_grado','im_grado','em_grado',
        'ia_vc','ea_vmax','ea_dtsvi','it_vc','vmax_it'].forEach(function(id){ r.campos[id]=window.__S.val(id) });
      out[C.n]=r;
    });
    return JSON.stringify(out);
  })()`));

  /* ══ (G) CELULAR: el \\"Datos\\" abre sin prender el boton azul; y el auto-abrir por grado ═══════ */
  await metrica(390, 900);
  const movil = JSON.parse(await ev(`(function(){
    var o={};
    var togs=function(){ return Array.prototype.map.call(
      document.querySelectorAll('.valv-datos-tog'), function(b){ return b.id||b.className }) };
    window.__S.limpiar(); window.__S.denom();
    o.togglesExisten = togs();
    /* Estado de arranque: los campos CERRADOS en el celular. */
    o.alArrancar={};
    window.__S.IDS_AO_INSUF.concat(window.__S.IDS_AO_ESTEN).slice(0,4).forEach(function(id){
      o.alArrancar[id]=window.__S.vis(id) });
    o.alArrancarTri = { it_vc:window.__S.vis('it_vc'), et_gmedio:window.__S.vis('et_gmedio') };
    /* Abrir el \\"Datos\\" de la insuficiencia aortica: no debe prender el boton ni tocar el grado. */
    var antes = window.__S.foto('aortica','insuf','ia_grado');
    var t = document.getElementById('datos-tog-insuf-aortica');
    if (t) { t.click(); }
    o.trasDatos = { existe:!!t, foto:window.__S.foto('aortica','insuf','ia_grado'),
                    fotoAntes:antes, ia_vc:window.__S.vis('ia_vc') };
    /* Cerrarlo de nuevo. */
    if (t) { t.click(); }
    o.trasCerrarDatos = { ia_vc:window.__S.vis('ia_vc'),
                          foto:window.__S.foto('aortica','insuf','ia_grado') };
    /* ⚠️ EL EJEMPLO QUE MAICOL PIDIO: datos cargados y SIN grado -> no abre solo. */
    window.__S.limpiar(); window.__S.denom();
    window.__S.set('ia_vc','3');            // 3 mm: cuantifica pero no gradua (no llega a leve)
    window.__S.quieto('ia_grado','0');
    try{ showTab('paciente') }catch(e){} try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    o.datosSinGrado = { ia_vc_valor:window.__S.val('ia_vc'), ia_grado:window.__S.val('ia_grado'),
                        pill:window.__S.pill('aortica','insuf'), ia_vc_visible:window.__S.vis('ia_vc') };
    /* Control positivo: con grado graduable SI abre solo. */
    window.__S.limpiar(); window.__S.denom();
    window.__S.quieto('ia_grado','2');
    try{ showTab('paciente') }catch(e){} try{ showTab('valvulas') }catch(e){}
    window.__S.abrirTodas();
    o.conGrado = { ia_grado:window.__S.val('ia_grado'), pill:window.__S.pill('aortica','insuf'),
                   ia_vc_visible:window.__S.vis('ia_vc') };
    o.toque = window.__S.toque();
    o.desborde = window.__S.desborde();
    return JSON.stringify(o);
  })()`));

  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
  const despues = await md5(join(RAIZ, 'index.html'));

  console.log(JSON.stringify({
    archivo: FARG, md5_antes: antes, md5_despues: despues, intacto: antes === despues,
    geo, tab, tarjetas, incong, espejos, superficies, movil,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
