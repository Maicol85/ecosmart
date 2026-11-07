#!/usr/bin/env node
/** _probe_pant24inv.mjs - PANT-24, commit 1: INVENTARIO Y PREMISAS. SOLO LECTURA.
 *  Mide (a) la TAVI en cinco escenas, con el informe en los TRES estilos y el EN SUMA;
 *  (b) el AT/ET en cinco bordes, con la fila, el aviso, el plegable y el papel;
 *  (c) los numeros con punto decimal en texto visible en espaniol.
 *  Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);

const CUERPO = `(async () => {
  const R = { tavi:{}, atet:{}, punto:{}, _den:{} };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const T = id => { const e = document.getElementById(id); return e ? String(e.value != null ? e.value : e.textContent || '') : 'NO EXISTE' };
  const TC = id => { const e = document.getElementById(id); return e ? String(e.textContent || '') : 'NO EXISTE' };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  (function(){ const st = document.createElement('style');
    st.textContent = '*{transition:none !important;animation:none !important}';
    document.head.appendChild(st) })();

  const ESTILOS = ['conciso','estandar','narrativo'];
  /* El estilo NO es un <select>: lo fija \`setEstiloInforme\`, que es el dueno, y las pastillas
     \`.estilo-pill\` son su interfaz. Medido: con un \`<select id="estilo_informe">\` inexistente
     las tres lecturas salian IDENTICAS -el estandar- y eso se lee igual que «los tres estilos
     dicen lo mismo». */
  const estiloSet = function (st) { try { setEstiloInforme(st); return (estiloInforme === st) ? 'ok' : ('quedo ' + estiloInforme) }
    catch (e) { return 'ERR ' + String(e).slice(0,60) } };

  const sembrar = function (campos) {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    S('nombre','P24'); S('ci','24242424');
    Object.keys(campos || {}).forEach(function (k) { try { S(k, campos[k]) } catch (e) {} });
  };

  /* Abre el bloque expandido de la aortica para que la capsula y la fila se pinten: sin eso
     la geometria y el texto salen sobre un denominador vacio. */
  const abrirEA = async function () {
    try { if (typeof valvProtSync === 'function') valvProtSync() } catch (e) {}
    try { if (typeof calcAo === 'function') calcAo() } catch (e) {}
    try { if (typeof eaAtPintar === 'function') eaAtPintar() } catch (e) {}
    await esperar(260);
  };

  const medirEscena = async function (campos) {
    sembrar(campos); await esperar(340); await abrirEA();
    const o = { _campos: JSON.stringify(campos) };
    o._estiloOK = {};
    for (const st of ESTILOS) {
      o._estiloOK[st] = estiloSet(st); await esperar(60);
      try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
      await esperar(120);
      o['informe_' + st] = T('informe_texto');
      o['suma_' + st]    = T('en_suma');
    }
    estiloSet('estandar'); await esperar(40);
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    await esperar(100);
    /* El veredicto y sus piezas, leidos del dueno */
    let P = null; try { P = (typeof eaProtVeredicto === 'function') ? eaProtVeredicto() : null } catch (e) { P = { ERR:String(e).slice(0,90) } }
    o._P = P ? { via:P.via, nivel:P.nivel, atet:P.atet, at:P.at, vmax:P.vmax, gmed:P.gmed,
                 dvi:P.dvi, falta:(P.falta||[]).join(' | '),
                 nivAtet:(P.niveles||{}).atet, nivAt:(P.niveles||{}).at } : null;
    let N = null; try { N = (P && typeof eaProtNarrativa === 'function') ? eaProtNarrativa(P) : null } catch (e) {}
    o._N = N ? { frase:N.frase, resumen:N.resumen, salvedades:N.salvedades } : null;
    let AV = null; try { AV = (P && typeof _eaProtAvisos === 'function') ? _eaProtAvisos(P) : null } catch (e) {}
    o._avisos = AV;
    o._filaAtet = TC('ea-det-atet');
    o._filaAt   = TC('ea-det-at');
    o._notaAt   = TC('ea-det-at-nota');
    o._sev      = TC('ea-det-sev');
    o._atEtVal  = (function(){ try { return (typeof _eaAtEtVal === 'function') ? _eaAtEtVal() : 'NO EXISTE' } catch (e) { return 'ERR' } })();
    /* El plegable de Ver detalle de la capsula protesica */
    o._plegable = (function(){
      const c = document.getElementById('ea-det-sev');
      const w = c ? c.closest('.calc-row') : null;
      const p = w && w.parentElement ? w.parentElement : null;
      if (!p) return 'SIN CONTENEDOR';
      const ds = Array.prototype.slice.call(p.querySelectorAll('details'));
      return ds.map(function(d){ try { d.open = true } catch(e){} return String(d.textContent||'').slice(0,900) }).join(' ~~ ');
    })();
    return o;
  };

  /* ══ (a) LA TAVI ══ */
  R.tavi.taviSinDatos       = await medirEscena({ va_morf:'TAVI' });
  R.tavi.taviParcialNormal  = await medirEscena({ va_morf:'TAVI', vmax_ao:'2.0' });
  R.tavi.taviEstenosisParc  = await medirEscena({ va_morf:'TAVI', vmax_ao:'4.5', gmedio_ao:'45' });
  R.tavi.taviEstenosisFull  = await medirEscena({ va_morf:'TAVI', vmax_ao:'4.5', gmedio_ao:'45', itv_tsvi:'20', itv_ao:'100' });
  R.tavi.taviNormalFull     = await medirEscena({ va_morf:'TAVI', vmax_ao:'2.0', gmedio_ao:'8', itv_tsvi:'22', itv_ao:'50' });
  /* ⚠️ EL CAMPO DEL GRADO DE LA INSUFICIENCIA AORTICA ES \`ia_grado\`, NO \`ia_sev_final\`.
     Medido: con \`ia_sev_final\` -que no existe en el DOM- la linea del informe salia SIN la
     mitad de insuficiencia, o sea la escena no llegaba a la condicion y el cero se leia igual
     que «la insuficiencia no cambia nada». */
  R.tavi.taviInsuf          = await medirEscena({ va_morf:'TAVI', ia_grado:'3' });
  R.tavi.taviInsufSev       = await medirEscena({ va_morf:'TAVI', ia_grado:'4' });
  R.tavi.taviNormalFullIns  = await medirEscena({ va_morf:'TAVI', vmax_ao:'2.0', gmedio_ao:'8', itv_tsvi:'22', itv_ao:'50', ia_grado:'3' });
  R.tavi.savrInsuf          = await medirEscena({ va_morf:'Prótesis biológica', ia_grado:'3' });
  R.tavi.savrSinDatos       = await medirEscena({ va_morf:'Prótesis biológica' });
  R.tavi.savrMecSinDatos    = await medirEscena({ va_morf:'Prótesis mecánica' });
  R.tavi.nativaSinDatos     = await medirEscena({ va_morf:'Trivalva normal' });

  /* ══ (b) EL AT/ET ══ */
  R.atet.at100et60 = await medirEscena({ va_morf:'TAVI', va_at:'100', tango_te:'60' });
  R.atet.at60et60  = await medirEscena({ va_morf:'TAVI', va_at:'60',  tango_te:'60' });
  R.atet.at99et100 = await medirEscena({ va_morf:'TAVI', va_at:'99',  tango_te:'100' });
  R.atet.at32et100 = await medirEscena({ va_morf:'TAVI', va_at:'32',  tango_te:'100' });
  R.atet.at37et100 = await medirEscena({ va_morf:'TAVI', va_at:'37',  tango_te:'100' });
  R.atet.at50et100 = await medirEscena({ va_morf:'TAVI', va_at:'50',  tango_te:'100' });
  R.atet.savr100_60 = await medirEscena({ va_morf:'Prótesis biológica', va_at:'100', tango_te:'60' });
  return R;
})()`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 1000 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1800);
let r; try { r = await pg.evaluate(CUERPO) } catch (e) { r = { ERR: String(e.message).slice(0, 900) } }
r._errores = errs; r._consola = cons.slice(0, 20); r._ancho = ANCHO; r._file = FILE;
await ctx.close(); await nav.close();
console.log(JSON.stringify(r, null, 1));
