#!/usr/bin/env node
/**
 * _probe_sinapaga.mjs — sonda TEMPORAL (no es la suite) para la tanda
 * «Sin apaga el boton, el aviso persiste y el escalon aortico».
 *
 * A diferencia de _probe_singrado.mjs, esta sonda NO escribe el estado del boton a mano:
 * entra por el CAMINO REAL DE LA UI (valvSev.aplicar, que es lo que hace el menu ▼, y
 * toggleValvPill, que es lo que hace el clic en el boton). Lo que se mide es justamente
 * quien mueve el boton y quien decide la visibilidad del bloque.
 *
 * Uso:  node scripts/_probe_sinapaga.mjs            > /tmp/e1.json
 *       node scripts/_probe_sinapaga.mjs --ver
 *
 * Infraestructura copiada de scripts/test_clinico.mjs, igual que la otra sonda.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-e1-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
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

/* ── Sonda inyectada ─────────────────────────────────────────────────────────────────────────
   OJO: el cuerpo es un template literal. Sin acentos graves adentro, ni en los comentarios. */
const SONDA = `
window.__q = {
  set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  chk(id, on) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.checked = on !== false; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  val(id) { const e = document.getElementById(id); return e ? e.value : null },
  txt(id) { const e = document.getElementById(id); return e ? (e.textContent || '') : null },
  /* Visible de VERDAD: se sube por los ancestros. Un hijo con display normal dentro de un
     padre en display:none no tiene geometria, y mirar solo su propio style miente. */
  vis(id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    let n = e;
    while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false;
      n = n.parentNode;
    }
    return true; },
  /* ⚠️ QUIEN oculta, no solo «esta oculto». La primera corrida midio alto 0 en las 26 escenas y
     el culpable no era el boton: era un ancestro. Un booleano no deja distinguir «el boton lo
     cerro» —que es lo que la tanda mide— de «la pestaña estaba cerrada», que es el denominador.
     Devuelve el primer ancestro en display:none, con su id o su clase. */
  culpable(id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    let n = e;
    while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') {
        return (n.id ? ('#' + n.id) : ('.' + String(n.className || '?').split(' ').join('.'))) +
               (n === e ? ' (EL PROPIO NODO)' : '');
      }
      n = n.parentNode;
    }
    return null; },
  /* El denominador de la maquetacion: alto y ancho reales del bloque. Cero alto = no se ve,
     aunque el display diga lo contrario. */
  caja(id) { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; },
  pill(valv, tipo) { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' },
  /* Clic REAL en el boton principal. Es el gesto del medico, no una asignacion de clase. */
  clicPill(valv, tipo) { toggleValvPill(valv, tipo); return window.__q.pill(valv, tipo); },
  /* ⚠️ EL DENOMINADOR SE REPONE EN CADA ESCENA, Y ARMARLO UNA SOLA VEZ DIO UNA MEDICION FALSA.
     La cuarta corrida midio alto real en las DOS primeras escenas y cero en las 24 siguientes,
     con el culpable en #tab-valvulas: limpiarCampos saca la pestaña de Valvulas, asi que el
     denominador que se armo al arrancar se perdia con el primer limpiar(). Sin esto la sonda
     contesta «el bloque no se ve» sobre la app cerrada — que es la trampa del CLAUDE.md, y acá
     habria dado por bueno justo lo que la tanda tiene que medir.
     valvAutoAbrirAortica no interfiere: corre dentro de showTab y abre solo con grado leve o
     mayor y sin clave guardada, y a esta altura los grados estan en 'sin' / '0'. */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      const s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    const t = document.getElementById('tab-valvulas');
    const abiertas = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].filter(function(tok){
      const s = document.getElementById('ete-seccion-' + tok);
      return s && getComputedStyle(s).display !== 'none'; });
    return { tab: !!t && getComputedStyle(t).display !== 'none', secciones: abiertas.length };
  },
  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        if (window.__q.pill(v,t) === true) toggleValvPill(v,t);
      });
    });
    return 1; },
  informe() { generarInforme();
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' }; },
  /* La foto completa de UNA clave del registro: lo que el medico ve y lo que el papel dira. */
  foto(clave) {
    const C = window.SEV_SINC[clave];
    const wrap = C.tipo === 'insuf' ? ('gf-insuf-' + C.valv) : ('bloque-esten-' + C.valv);
    return {
      pill: window.__q.pill(C.valv, C.tipo),
      sel: window.__q.val(C.select),
      oculto: C.tipo === 'insuf' ? window.__q.val(C.valv === 'aortica' ? 'ia_grado' : 'im_grado') : null,
      manual: !!(window.esqSevManual && window.esqSevManual[clave]),
      calc: (function(){ try { return window.sevCalcPublicable(clave); } catch(e){ return 'EXC' } })(),
      discrepa: (function(){ try { return window.sevDiscrepa(clave); } catch(e){ return 'EXC' } })(),
      aviso: window.__q.txt(C.aviso),
      wrapVis: window.__q.vis(wrap),
      wrapCaja: window.__q.caja(wrap),
      wrapCulpa: window.__q.culpable(wrap),
      fundVis: C.fundamento ? window.__q.vis(C.fundamento) : null,
      fundCulpa: C.fundamento ? window.__q.culpable(C.fundamento) : null,
      pastilla: window.__q.txt('sevbtn-' + C.tipo + '-' + C.valv),
      /* La clave de localStorage que gobierna los TRES estados de valvAutoAbrirCajones:
         null = nadie la toco · '0' = el medico la cerro, no se reabre · '1' = abierta. */
      ls: (function(){ try { return localStorage.getItem('valv-pill-' + C.tipo + '-' + C.valv) } catch(e){ return 'EXC' } })(),
      /* El nodo que OTROS leen como compuerta. sincronizarEMDesdeGlobal gatea por el
         style.display de bloque-esten-mitral, no por pillOn, y desde esta tanda ese display
         puede decir 'block' con la pastilla apagada. */
      displayCrudo: (function(){ const n = window.__q.vis ? document.getElementById(
          C.tipo === 'insuf' ? ('gf-insuf-' + C.valv) : ('bloque-esten-' + C.valv)) : null;
        return n ? (n.style.display || '(vacio)') : null })(),
      /* LAS TRES MITADES DE LA COMPUERTA DEL ESCALON, reconstruidas desde el DOM con la MISMA
         aritmetica que el emisor del informe. Si las tres dan verdadero, encender el escalon
         publica la valvulopatia en el informe FIRMADO. Se mide sin mutar nada: la compuerta es
         observable aunque la constante este en false. */
      gate: window.__q.gate(clave)
    };
  },
  gate(clave) {
    const C = window.SEV_SINC[clave];
    const v = String(window.__q.val(C.select) || '');
    const manual = !!(window.esqSevManual && window.esqSevManual[clave]);
    const pill = window.__q.pill(C.valv, C.tipo);
    /* Estenosis: el grado «describe» cuando no es 'sin' ni 'esclerosis'. Insuficiencia: cuando
       el numero es > 0. Es la misma cuenta que hacen eaDesc / (iaG > 0) en el emisor. */
    const describe = C.tipo === 'esten' ? (!!v && v !== 'sin' && v !== 'esclerosis') : ((parseInt(v) || 0) > 0);
    /* ⚠️ LA CUARTA MITAD, Y SIN ELLA ESTA SONDA MENTIA. La primera version modelaba tres
       (sin grado / sin marca / boton prendido) y despues de agregar la compuerta de fuera de banda
       la escena H-RET-ea informaba dispararia=true mientras el informe medido no decia nada: un
       modelo incompleto que contradice la medicion real es peor que no tener modelo, porque el
       numero se lee y se cree. Se consulta el MISMO bloqueado() del registro que consulta el
       emisor, y falla en la misma direccion (true = no afirma). */
    let bloqueado = true;
    try { bloqueado = (typeof C.bloqueado === 'function') ? !!C.bloqueado() : true; } catch(e) { bloqueado = true; }
    return { sinGrado: !describe, manual: manual, pill: pill, bloqueado: bloqueado,
             dispararia: !describe && !manual && pill === true && !bloqueado };
  }
};
`;

// ── Escenas de la Etapa 1 ───────────────────────────────────────────────────────────────────
/* Cada escena declara: que se carga, que gesto se hace, y de que claves se saca la foto.
   El GESTO es siempre el camino real de la UI: el menu ▼ (valvSev.aplicar) o el clic en el
   boton (toggleValvPill). Nunca se escribe la clase del boton ni esqSevManual a mano. */
const ESCENAS = [];
const push = (o) => ESCENAS.push(o);

/* Mediciones que producen un grado calculado de cada valvula, para el lado «con calculo».
   Control negativo de cada par: la misma escena SIN mediciones, donde el calculado es null y
   no hay con que discrepar. Si las dos salen iguales, la sonda no distingue y no prueba nada. */
const MED_EA = [['vmax_ao','4.2'], ['gmedio_ao','45']];          // → EAo severa
const MED_IA = [['ia_vc','7']];                                   // → IAo severa
const MED_EM = [['avm_plan','1.2']];                              // → EM severa
const MED_IM = [['im_vc','8']];                                   // → IM severa

// ── A. «Sin» por el menu ▼, con y sin calculo, en las cuatro claves ──
[['ea','esten','aortica','sin',   MED_EA],
 ['ia','insuf','aortica','0',     MED_IA],
 ['em','esten','mitral','sin',    MED_EM],
 ['im','insuf','mitral','0',      MED_IM]].forEach(function(e){
  const [clave, tipo, valv, valorSin, med] = e;
  // Sin calculo: el boton se abre a mano primero, y despues se elige «Sin» en el menu.
  push({ id: 'SIN-' + clave + '-nocalc', desc: 'Sin por el menu, SIN calculo — ' + clave,
         abrir: [[valv, tipo]], aplicar: [[tipo, valv, valorSin]], fotos: [clave] });
  // Con calculo: las mediciones producen un grado, y «Sin» es un ajuste a la baja.
  push({ id: 'SIN-' + clave + '-calc', desc: 'Sin por el menu, CON calculo — ' + clave,
         campos: med, abrir: [[valv, tipo]], aplicar: [[tipo, valv, valorSin]], fotos: [clave],
         informe: 1 });
});

// ── B. Control negativo del menu: un grado REAL (no «Sin») por el mismo camino ──
/* Si «Sin» apagara el boton y esto tambien, el cambio no distingue el gesto. */
push({ id: 'NEG-ea-severa', desc: 'CONTROL NEGATIVO: «Severa» por el menu — el boton NO se apaga',
       campos: MED_EA, abrir: [['aortica','esten']], aplicar: [['esten','aortica','severa']], fotos: ['ea'] });
push({ id: 'NEG-im-severa', desc: 'CONTROL NEGATIVO: «Severa» por el menu en IM',
       campos: MED_IM, abrir: [['mitral','insuf']], aplicar: [['insuf','mitral','4']], fotos: ['im'] });

// ── C. ¿La visibilidad del bloque depende del boton? ──
/* Grado manual discrepante (bloque con aviso y cajon) y DESPUES se cierra el boton a mano.
   Las dos preguntas de la decision 2 y de la regla de visibilidad, en un gesto. */
push({ id: 'VIS-ea-cerrar', desc: 'Discrepancia viva y se CIERRA el boton a mano — aortica estenosis',
       campos: MED_EA, abrir: [['aortica','esten']], aplicar: [['esten','aortica','leve']],
       cerrar: [['aortica','esten']], fotos: ['ea'], informe: 1 });
push({ id: 'VIS-ia-cerrar', desc: 'Discrepancia viva y se CIERRA el boton — aortica insuficiencia',
       campos: MED_IA, abrir: [['aortica','insuf']], aplicar: [['insuf','aortica','1']],
       cerrar: [['aortica','insuf']], fotos: ['ia'], informe: 1 });
push({ id: 'VIS-im-cerrar', desc: 'Discrepancia viva y se CIERRA el boton — mitral insuficiencia',
       campos: MED_IM, abrir: [['mitral','insuf']], aplicar: [['insuf','mitral','1']],
       cerrar: [['mitral','insuf']], fotos: ['im'], informe: 1 });
push({ id: 'VIS-em-cerrar', desc: 'Discrepancia viva y se CIERRA el boton — mitral estenosis',
       campos: MED_EM, abrir: [['mitral','esten']], aplicar: [['esten','mitral','leve']],
       cerrar: [['mitral','esten']], fotos: ['em'], informe: 1 });

// ── C2. «Sin» por el <select>, que es el OTRO camino y el que reabrio el defecto ──
/* El menu ▼ no es la unica puerta a «Sin»: el desplegable de grado final tambien, y en la
   estenosis ese desplegable vive DENTRO del cajon que el boton abre. Lo que se mide es el
   estado de las TRES mitades de la compuerta del escalon (`!eaDesc && !manual && pillOn`):
   si las tres dan verdadero, encender el escalon publica «con estenosis» en el firmado.
   La mitral va al lado como control: ahi el onchange SI enciende la marca. */
push({ id: 'SEL-ea-sin', desc: 'Sin estenosis por el <select> real (ea_grado, con change)',
       campos: MED_EA, abrir: [['aortica','esten']], sel: [['ea_grado','sin']], fotos: ['ea'], informe: 1 });
push({ id: 'SEL-ia-sin', desc: 'Sin insuficiencia por el <select> real (ia_sev_final)',
       campos: MED_IA, abrir: [['aortica','insuf']], sel: [['ia_sev_final','0']], fotos: ['ia'], informe: 1 });
push({ id: 'SEL-em-ctrl', desc: 'CONTROL: lo mismo por el <select> de la mitral, que SI marca',
       campos: MED_EM, abrir: [['mitral','esten']], sel: [['em_grado','sin']], fotos: ['em'], informe: 1 });
push({ id: 'SEL-im-ctrl', desc: 'CONTROL: lo mismo por el <select> de la IM, que SI marca',
       campos: MED_IM, abrir: [['mitral','insuf']], sel: [['im_sev_final','0']], fotos: ['im'], informe: 1 });

// ── D. El escalon aortico apagado: estado 2 (boton abierto, sin grado) ──
/* Hoy EA_ESCALON_SIN_GRADO es false, asi que el informe tiene que decir «sin estenosis».
   Es la linea base contra la que se lee el encendido de la etapa 2. */
/* ⚠️ SIN MEDICIONES, Y LA PRIMERA CORRIDA LO TENIA MAL. Con Vmax 4,2 la app AUTO-GRADUA
   «severa», asi que la escena no era el estado 2 —habia grado— y el gate daba false por el
   motivo equivocado. El estado 2 de la estenosis aortica es el boton abierto con el grado
   todavia en 'sin': cargar un Vmax que gradua lo saca de ese estado por definicion. */
push({ id: 'ESC-ea-estado2', desc: 'Estado 2 hoy: boton de estenosis abierto y sin grado',
       abrir: [['aortica','esten']], fotos: ['ea'], informe: 1 });
push({ id: 'ESC-ia-estado2', desc: 'Estado 2 hoy: boton de insuficiencia abierto y sin grado',
       abrir: [['aortica','insuf']], fotos: ['ia'], informe: 1 });

// ── E. Defecto (a): la tarjeta pre-PDF ──
/* Se abre la tarjeta de verdad, se corrige la IAo en el clon y se confirma. Lo que se mide es
   si el oculto `ia_grado` y el visible `ia_sev_final` quedan iguales, y si la pastilla, el
   aviso y el cajon de la aortica se repintan. La mitral va al lado como CONTROL POSITIVO:
   ahi el arreglo ya entro (5602597), asi que tiene que salir sincronizada. */
push({ id: 'CARD-ia', desc: 'Defecto (a): corregir la IAo en la tarjeta pre-PDF',
       campos: MED_IA, abrir: [['aortica','insuf']], card: { 'rev-ia': '2' },
       fotos: ['ia'], informe: 1 });
push({ id: 'CARD-ea', desc: 'Defecto (a): corregir la EAo en el clon de la tarjeta',
       campos: MED_EA, abrir: [['aortica','esten']], card: { 'ea_grado': 'leve' },
       fotos: ['ea'], informe: 1 });
push({ id: 'CARD-im-ctrl', desc: 'CONTROL POSITIVO: la misma correccion en la IM, ya arreglada',
       campos: MED_IM, abrir: [['mitral','insuf']], card: { 'rev-im': '2' },
       fotos: ['im'], informe: 1 });

// ── F. Defecto (b): guardar y reabrir ──
/* Grado manual discrepante, se guarda, se reabre, y se mira si el aviso y el cajon vuelven.
   La IM al lado como control positivo: su entrada del registro ya tiene `recalcular`. */
push({ id: 'REAB-ia', desc: 'Defecto (b): guardar y reabrir con IAo manual discrepante',
       campos: MED_IA, abrir: [['aortica','insuf']], aplicar: [['insuf','aortica','1']],
       nota: ['ia_fund_nota','jet excentrico'], guardarReabrir: 1, fotos: ['ia'] });
push({ id: 'REAB-im-ctrl', desc: 'CONTROL POSITIVO: lo mismo en la IM, que ya tiene recalcular',
       campos: MED_IM, abrir: [['mitral','insuf']], aplicar: [['insuf','mitral','1']],
       nota: ['im_fund_nota','jet excentrico'], guardarReabrir: 1, fotos: ['im'] });
push({ id: 'REAB-ea-ctrl', desc: 'CONTROL: la EAo, cuyo proveedor es puro y no necesita recalcular',
       campos: MED_EA, abrir: [['aortica','esten']], aplicar: [['esten','aortica','leve']],
       nota: ['ea_fund_nota','criterio clinico'], guardarReabrir: 1, fotos: ['ea'] });

// ── G. Triage de /sharp-edges sobre el diff de la Etapa 2 (2026-10-03) ──────────────────────
/* Los cinco caminos que el informe de /sharp-edges señaló, medidos antes de creerle. Tres serían
   REGRESIONES de esta tanda: el escalón encendido publicando una valvulopatía por un camino que
   NO es un gesto del médico. */

/* H-R6 — «vuelta a automático» escribe 'sin', BORRA la marca y no toca el botón. Camino: Vmax 4,5
   gradúa severa sola; el médico baja a moderada por el ▼ (marca + foto 'severa'); corrige la Vmax
   a 1,8 porque fue un tipeo. R6 ve que el calculado cambió, suelta el manual y escribe 'sin'.
   Si el botón queda prendido, las tres mitades de la compuerta dan verdadero. */
push({ id: 'H-R6-ea', desc: 'R6 suelta el manual y escribe «sin»: boton, marca y compuerta',
       campos: [['vmax_ao','4.5']], abrir: [['aortica','esten']],
       aplicar: [['esten','aortica','moderada']], luego: [['vmax_ao','1.8']],
       fotos: ['ea'], informe: 1 });
/* CONTROL NEGATIVO de H-R6: la misma corrección pero a un valor que SIGUE graduando (3,5 → al
   menos moderada). Ahí R6 también suelta, pero escribe un grado real y el escalón no aplica.
   Si las dos escenas salen iguales, la sonda no distingue «soltó a sin» de «soltó a un grado». */
push({ id: 'H-R6-neg', desc: 'CONTROL NEGATIVO: R6 suelta a un grado REAL, no a «sin»',
       campos: [['vmax_ao','4.5']], abrir: [['aortica','esten']],
       aplicar: [['esten','aortica','moderada']], luego: [['vmax_ao','3.5']],
       fotos: ['ea'], informe: 1 });

/* H-RET — el retiro por insumo fuera de banda escribe 'sin' con el badge diciendo «no gradúa».
   El Ø TSVI tipeado en centimetros (2 en vez de 20) es el caso que ese retiro documenta. */
push({ id: 'H-RET-ea', desc: 'Retiro por fuera de banda: escribe «sin» y el badge dice no gradua',
       campos: [['vmax_ao','4.5']], abrir: [['aortica','esten']], luego: [['diam_tsvi','2']],
       fotos: ['ea'], informe: 1 });

/* H-VUELTA — el camino de vuelta del punto 5: «Sin» por el desplegable apaga el botón, y el
   médico que se equivocó vuelve a abrirlo para corregir. Al reabrir, grado 'sin' + sin marca +
   botón prendido = estado 2, o sea que el informe pasa a afirmar la estenosis mientras busca el
   desplegable. Es «la respuesta Sin no deja rastro» en la aórtica. */
push({ id: 'H-VUELTA-ea', desc: '«Sin» por el desplegable y despues REABRIR el boton para corregir',
       campos: MED_EA, abrir: [['aortica','esten']], sel: [['ea_grado','sin']],
       reabrir: [['aortica','esten']], fotos: ['ea'], informe: 1 });
/* CONTROL: lo mismo en la MITRAL, donde el desplegable SI marca, asi que reabrir no reabre nada. */
push({ id: 'H-VUELTA-em', desc: 'CONTROL: lo mismo en la mitral, cuyo desplegable si deja marca',
       campos: MED_EM, abrir: [['mitral','esten']], sel: [['em_grado','sin']],
       reabrir: [['mitral','esten']], fotos: ['em'], informe: 1 });

/* H-LS — apagar por regla escribe '0' en la clave de localStorage, que para
   valvAutoAbrirCajones significa «el medico lo cerro a mano, no reabrir nunca». */
push({ id: 'H-LS-ea', desc: '¿Que queda en localStorage al apagar por regla?',
       campos: MED_EA, abrir: [['aortica','esten']], sel: [['ea_grado','sin']], fotos: ['ea'] });

/* H-EMGATE — el gate de sincronizarEMDesdeGlobal lee el style.display de bloque-esten-mitral y
   su comentario declara que ese display significa «la pastilla esta encendida». Con discrepancia
   y boton cerrado ese nodo queda en 'block': el gate se abre con la pastilla apagada y los dos
   espejos se llenan dentro de un bloque de cuantificacion que esta oculto. */
push({ id: 'H-EMGATE', desc: 'Gate de EM: discrepancia + boton cerrado, y despues tipear el origen',
       campos: MED_EM, abrir: [['mitral','esten']], aplicar: [['esten','mitral','leve']],
       cerrar: [['mitral','esten']], luego: [['diam_tsvi','20'],['itv_tsvi','25']],
       fotos: ['em'], espejosEM: 1 });
/* CONTROL NEGATIVO del gate: sin discrepancia y con el boton cerrado el nodo queda en 'none' y
   los espejos NO se llenan, que es el comportamiento que el gate existe para dar. */
push({ id: 'H-EMGATE-neg', desc: 'CONTROL NEGATIVO: sin discrepancia y boton cerrado, el gate cierra',
       abrir: [['mitral','esten']], cerrar: [['mitral','esten']],
       luego: [['diam_tsvi','20'],['itv_tsvi','25']], fotos: ['em'], espejosEM: 1 });

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
  await ev(SONDA + ' return 1;');
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);
  /* ⚠️ EL DENOMINADOR LO ARMA LA SONDA, UNA VEZ POR ESCENA (ver __q.denominador). Acá sólo se
     comprueba que se puede armar: si la pestaña o las cuatro secciones no abren, ninguna medición
     de geometría de esta corrida vale y hay que decirlo antes de leer los números. */
  const tabOk = await ev(`return window.__q.denominador();`);
  process.stderr.write('  denominador — ' + JSON.stringify(tabOk) + '\n');

  /* `EA_ESCALON_SIN_GRADO` es un `const` LOCAL del emisor del informe: no se puede leer desde la
     pagina. Se lee de la fuente, que es donde vive. */
  const fuente = await readFile(join(RAIZ, 'index.html'), 'utf8');
  const mEsc = fuente.match(/const EA_ESCALON_SIN_GRADO = (\w+);/);
  const salida = { escalon: mEsc ? mEsc[1] : "NO ENCONTRADO", denominador: tabOk, escenas: [] };

  for (const e of ESCENAS) {
    const cfg = JSON.stringify(e);
    let r;
    try {
      r = await ev(`return (async () => {
        const c = ${cfg};
        window.__q.limpiar();
        /* La pestaña y las cuatro secciones, DESPUES de limpiar y antes de medir geometria. */
        const den = window.__q.denominador();
        /* El nombre es obligatorio para guardar: sin esto guardarInforme hace toast y vuelve
           false, y la escena fallaria por un motivo que no es el que mide. */
        window.__q.set('nombre','Probe E1'); window.__q.set('documento','9999');
        (c.campos || []).forEach(function(p){ window.__q.set(p[0], p[1]); });
        /* Se ABRE con el clic real. Va DESPUES de los campos: toggleValvPill arrastra las
           sincronias, y con los campos ya puestos ve lo mismo que veria el medico. */
        (c.abrir || []).forEach(function(p){ if (window.__q.pill(p[0],p[1]) !== true) window.__q.clicPill(p[0], p[1]); });
        (c.aplicar || []).forEach(function(t){ window.valvSev.aplicar(t[0], t[1], t[2]); });
        /* El OTRO camino: el desplegable de grado final, con su change real. */
        (c.sel || []).forEach(function(p){ window.__q.set(p[0], p[1]); });
        if (c.nota) window.__q.set(c.nota[0], c.nota[1]);
        (c.cerrar || []).forEach(function(p){ if (window.__q.pill(p[0],p[1]) === true) window.__q.clicPill(p[0], p[1]); });
        /* SIN ACENTOS GRAVES EN ESTOS COMENTARIOS: estan DENTRO del template literal que se
           manda por CDP, y un backtick cierra la cadena (ya me costo dos corridas en esta sesion).
           luego: campos que se cargan DESPUES del gesto. Es lo que necesitan los caminos
           AUTOMATICOS —corregir una Vmax dispara R6, tipear el diametro en cm dispara el retiro—,
           que no son gestos sobre la pastilla y por eso la primera tanda de escenas no los midio. */
        (c.luego || []).forEach(function(p){ window.__q.set(p[0], p[1]); });
        /* reabrir: el clic de vuelta en el boton, para el camino «me equivoque y quiero
           corregir». Va al final porque es el ultimo gesto de esa historia. */
        (c.reabrir || []).forEach(function(p){ if (window.__q.pill(p[0],p[1]) !== true) window.__q.clicPill(p[0], p[1]); });
        const out = { id: c.id, desc: c.desc, den: den };
        /* espejosEM: los dos espejos que sincronizarEMDesdeGlobal llena solo con su gate abierto.
           Se miden despues de tipear en el origen, que es lo que dispara el oninput.
           Va DESPUES de declarar out: la primera version lo puso antes y las dos escenas del gate
           murieron con «Cannot access out before initialization» — un error ruidoso, por suerte. */
        if (c.espejosEM) out.espejosEM = { em_dtsvi: window.__q.val('em_dtsvi'), em_vtitsvi: window.__q.val('em_vtitsvi') };

        /* La tarjeta pre-PDF, de verdad: se abre, se escribe el clon y se aprieta Confirmar. */
        if (c.card) {
          window.mostrarCardSeveridadValvular(function(){});
          const ov = document.getElementById('pdf-review-overlay');
          if (!ov) { out.cardError = 'no abrio la tarjeta'; }
          else {
            out.cardAntes = {};
            Object.keys(c.card).forEach(function(k){
              const el = ov.querySelector('#' + k) || ov.querySelector('select[data-target="' + k + '"]');
              if (!el) { out.cardError = 'no existe el control ' + k; return; }
              out.cardAntes[k] = el.value;
              el.value = c.card[k];
              /* DENOMINADOR: un select rechaza en silencio un valor que no es una de sus
                 opciones y queda vacio. Si no quedo, la escena no probo nada. */
              if (String(el.value) !== String(c.card[k])) out.cardError = 'el select rechazo ' + c.card[k] + ' en ' + k;
            });
            ov.querySelector('#rev-confirm').click();
            out.cardCerro = !document.getElementById('pdf-review-overlay');
          }
        }

        /* Guardar y reabrir por las funciones REALES, que es el viaje completo. */
        if (c.guardarReabrir) {
          window._ettEditandoId = null;
          const ids0 = new Set((getInformes() || []).map(function(x){ return x.estudioId }));
          let ok = false;
          try { ok = await new Promise(function(res){
            guardarInforme(function(){ res(true) });
            const t = setInterval(function(){
              const ov = document.getElementById('pdf-review-overlay');
              if (ov) { clearInterval(t); ov.querySelector('#rev-confirm').click(); }
            }, 50);
            setTimeout(function(){ clearInterval(t); res(false) }, 8000);
          }); } catch(e) { out.guardarError = e.message }
          const desp = getInformes() || [];
          const nuevo = desp.find(function(x){ return !ids0.has(x.estudioId) });
          out.guardado = { ok: ok, id: nuevo ? nuevo.estudioId : null, n: desp.length };
          if (nuevo) {
            /* La foto ANTES de reabrir, para tener el denominador: si el aviso ya estaba
               vacio, que desaparezca al reabrir no prueba nada. */
            out.fotoAntes = {}; (c.fotos || []).forEach(function(k){ out.fotoAntes[k] = window.__q.foto(k) });
            window.__q.limpiar();
            await cargarEstudioPorId(nuevo.estudioId);
            await new Promise(function(r){ setTimeout(r, 400) });
            /* Reabrir vuelve a mover la pestaña: el denominador se repone DESPUES de cargar,
               o la foto del estudio reabierto se mide sobre la pestaña cerrada otra vez. */
            out.denReabierto = window.__q.denominador();
            out.reabierto = 1;
          }
        }

        (c.fotos || []).forEach(function(k){ out['foto_' + k] = window.__q.foto(k) });
        if (c.informe) { const i = window.__q.informe(); out.inf = i.inf; out.suma = i.suma; }
        /* Cada escena borra lo que guardo: un estudio que sobrevive cambia el denominador
           de las que vienen despues. */
        if (out.guardado && out.guardado.id) {
          try { await CeiboStore.setLocal((getInformes() || []).filter(function(x){ return x.estudioId !== out.guardado.id })); } catch(e){}
        }
        return out;
      })();`);
    } catch (err) { r = { id: e.id, desc: e.desc, error: err.message }; }
    salida.escenas.push(r);
    process.stderr.write('  ' + e.id.padEnd(18) + (r.error ? 'ERROR ' + r.error : 'ok') + '\n');
  }
  console.log(JSON.stringify(salida, null, 1));
  cdp.close();
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive:true, force:true }); } catch {} }
  process.exit(process.exitCode || 0);
}
