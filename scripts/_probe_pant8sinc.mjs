/*
 * _probe_pant8sinc.mjs - PANT-8, commit 3: la sincronia de TAVI con Aorta / AI, los DOS
 * sentidos, cada pareja, con valor en cada lado, con vacio y con borrado, mas los controles
 * negativos (el modulo sin usar y la morfologia, que queda PARADA).
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant8sinc.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p8sinc.json';

/* Cada prueba se corre sobre una pagina RECIEN cargada: el estado de un gesto anterior
   envenena al siguiente, y el modulo se declara en uso con un campo que no es espejo. */
const PRUEBA = `((P) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = { k: P.k };
  const E = (id) => document.getElementById(id);
  const V = (id) => { const e=E(id); return e ? String(e.value || '') : 'NO EXISTE' };
  /* poner un valor con el GESTO real: asignar y despachar input, que es lo que hace el teclado */
  const S = (id, v) => { const e=E(id); if(!e) return 0;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return 1 };
  try { showTab('ete') } catch(e) {}
  const sec = E('ete-seccion-tavi');
  if (sec && getComputedStyle(sec).display === 'none') { try { toggleEteSeccion('tavi') } catch(e) {} }
  /* DENOMINADOR: existen los tres pares y la funcion? */
  o.tieneFn   = (typeof taviAoSync === 'function');
  o.tienePares = (typeof TAVI_AO_PARES !== 'undefined') ? TAVI_AO_PARES.length : 'sin tabla';
  /* el modulo en uso, si la prueba lo pide */
  if (P.enUso) { S('ete_tavi_calc', 'severa'); }
  if (P.integrar) { const c=E('ete_tavi_incluir_chk'); if(c){ c.checked=true;
    c.dispatchEvent(new Event('change',{bubbles:true})); } }
  o.enUsoAntes = (typeof _taviModuloEnUso === 'function') ? _taviModuloEnUso() : 'sin fn';
  /* la siembra previa (un estudio viejo con los dos cargados, por ejemplo) */
  (P.siembra || []).forEach(par => S(par[0], par[1]));
  /* ⚠️ SIEMBRA MUDA: asigna el valor SIN despachar ningun evento, que es exactamente como
     pueblan los campos las rutas de restauracion -por eso aoRaizSync necesita su
     reconciliador-. Con la siembra por GESTO el espejo ya corre y los dos lados quedan iguales:
     la primera version de F1 y F2 medio sobre un denominador envenenado -la foto de ANTES decia
     44 y 44 sobre una escena montada con 38 y 44-. */
  (P.siembraMuda || []).forEach(par => { const e=E(par[0]); if(e) e.value = par[1]; });
  /* la foto de antes */
  o.antes = (P.mirar || []).map(id => id + '=' + V(id)).join(' ');
  /* el GESTO */
  if (P.gesto) S(P.gesto[0], P.gesto[1]);
  /* el embudo de restauracion, si la prueba lo pide */
  if (P.embudo) {
    const pasadas = (typeof P.embudo === 'number') ? P.embudo : 1;
    o.porPasada = [];
    for (let n = 0; n < pasadas; n++) {
      try { (typeof RECALC_MODULOS === 'function' ? RECALC_MODULOS() : []).forEach(function(fn){
        try { if (typeof window[fn] === 'function') window[fn]() } catch(e) {} }) } catch(e) { o.embErr = String(e).slice(0,80) }
      o.porPasada.push((P.mirar || []).map(id => V(id)).join('/'));
    }
  }
  o.despues = (P.mirar || []).map(id => id + '=' + V(id)).join(' ');
  /* el Laboratorio: este estudio cuenta como «Con TAVI»? */
  try {
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    });
    o.labTavi = (typeof _labUsaTavi === 'function') ? !!_labUsaTavi({ campos: campos }) : 'sin fn';
    o.nCampos = Object.keys(campos).length;
  } catch(e) { o.labErr = String(e).slice(0,80) }
  /* la capsula de la aorta, que es lo que el medico ve en pantalla */
  o.aoInterp = ((E('ao-interp')||{}).textContent || '').replace(/\\s+/g,' ').trim().slice(0,90);
  return o;
})(__P__)`;

const PRUEBAS = [
  /* ── A · TAVI -> estudio, INCONDICIONAL: las tres parejas, con la aorta vacia ── */
  { k:'A1-valsalva', gesto:['ete_tavi_valsalva','38'], mirar:['ete_tavi_valsalva','ao_sin'] },
  { k:'A2-ust',      gesto:['ete_tavi_ust','32'],      mirar:['ete_tavi_ust','ao_st'] },
  { k:'A3-aoasc',    gesto:['ete_tavi_ao_asc','36'],   mirar:['ete_tavi_ao_asc','ao_tub'] },
  /* ── B · estudio -> TAVI con el modulo SIN USAR: el CONTROL NEGATIVO ── */
  { k:'B1-aoSolo',   gesto:['ao_sin','40'],  mirar:['ao_sin','ete_tavi_valsalva'] },
  { k:'B2-stSolo',   gesto:['ao_st','33'],   mirar:['ao_st','ete_tavi_ust'] },
  { k:'B3-tubSolo',  gesto:['ao_tub','37'],  mirar:['ao_tub','ete_tavi_ao_asc'] },
  /* ── C · estudio -> TAVI con el modulo EN USO ── */
  { k:'C1-enUso',    enUso:true, gesto:['ao_sin','40'], mirar:['ao_sin','ete_tavi_valsalva'] },
  { k:'C2-enUsoSt',  enUso:true, gesto:['ao_st','33'],  mirar:['ao_st','ete_tavi_ust'] },
  { k:'C3-integrado',integrar:true, gesto:['ao_tub','37'], mirar:['ao_tub','ete_tavi_ao_asc'] },
  /* ── D · BORRADO: borrar borra, en los dos sentidos ── */
  { k:'D1-borraTavi', siembra:[['ete_tavi_valsalva','38']], gesto:['ete_tavi_valsalva',''],
    mirar:['ete_tavi_valsalva','ao_sin'] },
  { k:'D2-borraAo',   enUso:true, siembra:[['ao_sin','40']], gesto:['ao_sin',''],
    mirar:['ao_sin','ete_tavi_valsalva'] },
  /* ── E · A MEDIO ESCRIBIR: un signo menos solo no se propaga ── */
  { k:'E1-medio',     gesto:['ete_tavi_valsalva','-'], mirar:['ete_tavi_valsalva','ao_sin'] },
  { k:'E2-punto',     gesto:['ete_tavi_valsalva','.'], mirar:['ete_tavi_valsalva','ao_sin'] },
  /* ── F · EL EMBUDO: los dos cargados y DISTINTOS no se pisan ── */
  { k:'F1-distintos', embudo:true, enUso:true,
    siembraMuda:[['ete_tavi_valsalva','38'],['ao_sin','44']], mirar:['ete_tavi_valsalva','ao_sin'] },
  { k:'F2-unoVacio',  embudo:true, enUso:true,
    siembraMuda:[['ete_tavi_valsalva','38']], mirar:['ete_tavi_valsalva','ao_sin'] },
  /* F2b: lo mismo pero con el modulo SIN usar y el valor en TAVI -el sentido incondicional, que
     el reconciliador tiene que correr igual-. */
  { k:'F2b-sinUso',   embudo:true,
    siembraMuda:[['ete_tavi_valsalva','38']], mirar:['ete_tavi_valsalva','ao_sin'] },
  /* F4: tres pasadas del embudo seguidas. Un reconciliador que no es idempotente informa un
     movimiento en CADA pasada, para siempre, que es la leccion de PANT-7 con Wilkins. */
  { k:'F4-idempot',   embudo:3, enUso:true,
    siembraMuda:[['ete_tavi_valsalva','38']], mirar:['ete_tavi_valsalva','ao_sin'] },
  { k:'F3-vacioSinUso', embudo:true,
    siembra:[['ao_sin','40']], mirar:['ao_sin','ete_tavi_valsalva'] },
  /* ── G · LA MORFOLOGIA, que queda PARADA: ni escribe ni borra, en los dos sentidos ── */
  { k:'G1-vaBi',      gesto:['va_morf','Bicúspide'],      mirar:['va_morf','ete_tavi_morf'] },
  { k:'G2-taviBi',    gesto:['ete_tavi_morf','bicuspide'], mirar:['ete_tavi_morf','va_morf'] },
  { k:'G3-vaCalc',    gesto:['va_morf','Calcificada'],     mirar:['va_morf','ete_tavi_morf'] },
  { k:'G4-taviCuadri',gesto:['ete_tavi_morf','cuadricuspide'], mirar:['ete_tavi_morf','va_morf'] },
  /* ── H · LOS QUE NO SE UNEN: el anillo y el TSVI son dos sitios distintos ── */
  { k:'H1-anillo',    gesto:['ete_tavi_anillo_diam','24'], mirar:['ete_tavi_anillo_diam','diam_tsvi_ao','diam_tsvi'] },
  { k:'H2-vmax',      gesto:['ete_tavi_vmax','2.1'],       mirar:['ete_tavi_vmax','vmax_ao'] }
];

const res = { file: FILE, pruebas: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
for (const P of PRUEBAS) {
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(900);
    res.pruebas[P.k] = await pg.evaluate(PRUEBA.replace('__P__', JSON.stringify(P)));
  } catch (e) { res.pruebas[P.k] = { error: String(e).slice(0, 180) } }
}
res.errores = errs.length; res.err1 = errs[0] || '';
await ctx.close(); await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
