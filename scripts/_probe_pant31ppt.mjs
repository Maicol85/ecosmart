#!/usr/bin/env node
/**
 * _probe_pant31ppt.mjs - R11 de PANT-31 (2026-11-10). Un arbol (--file), apto para A/B.
 *  (A) LA CASILLA de «Protesis valvulares»: que exista, donde esta, cuanto mide, su estado por
 *      omision, que se guarde en la MISMA clave que las otras y que prenda `data-ppt-on`.
 *  (B) LOS DOS ASSERTS de arranque: toda tarjeta declarada y toda clave en exactamente un grupo.
 *  (C) EL MAZO GENERADO DE VERDAD, espiando el constructor de PptxGenJS, con una poblacion
 *      sintetica de 24 estudios: SIN tildar y CON tildar, con sus titulos y sus textos.
 * ⚠️ DENOMINADOR: antes de medir se comprueba que labGetInformes devuelva los 24 estudios y que
 *    el mazo haya producido diapositivas. Un mazo de 0 se lee igual que «el PPT no cambio».
 * ⚠️ CONTROL NEGATIVO: sin tildar, la hoja de protesis NO tiene que estar y el resto del mazo
 *    tiene que salir identico al de antes de tildar.
 * La poblacion es la misma que _probe_pant30prot.mjs, con datos FICTICIOS: el repo es publico.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);

const POB = [];
let _id = 1;
function est(campos) { POB.push({ id: _id++, uuid: 'u' + _id, nombre: 'Ficticio ' + _id,
  fecha_estudio: '2026-11-0' + ((_id % 9) + 1), campos: campos }); }
const TXT = {
  signif: 'Válvula aórtica con prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s).',
  posible: 'Válvula aórtica con prótesis transcatéter tipo TAVI, con posible estenosis (Vmax 3.2 m/s).',
  faltan: 'Válvula aórtica con prótesis biológica, sin datos suficientes para graduar la estenosis protésica.',
  normo: 'Válvula aórtica con prótesis mecánica tipo normofuncionante (Vmax 2.0 m/s).',
  sinCrit: 'Válvula aórtica con prótesis biológica, sin criterios de estenosis protésica (Vmax 2.1 m/s).',
  sugest: 'Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 9.0 mmHg, THP 250 ms).',
  aislado: 'Prótesis tricúspide con hallazgo aislado, sin veredicto (THP 250 ms).',
  desaj: 'Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm2/m2).',
  nativa: 'Válvula aórtica con estenosis aórtica severa, con posible estenosis de la válvula nativa.'
};
for (let i = 0; i < 4; i++) est({ va_morf: 'Prótesis mecánica', va_prot_modelo: 'ATS',
  informe_texto: i < 2 ? TXT.signif : TXT.normo, en_suma: '' });
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Abbott Epic', informe_texto: TXT.sinCrit });
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Abbott Epic', informe_texto: TXT.faltan });
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Biocor', informe_texto: TXT.sinCrit });
est({ va_morf: 'TAVI', va_prot_modelo: 'SAPIEN 3', informe_texto: TXT.posible });
est({ va_morf: 'TAVI', va_prot_modelo: 'SAPIEN 3', informe_texto: TXT.desaj });
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis biológica', vm_prot_modelo: 'Hancock II', informe_texto: '' });
est({ vm_morf: 'Plastia mitral', informe_texto: 'Válvula mitral con plastia mitral, sin estenosis ni insuficiencia.' });
est({ vm_morf: 'TEER mitral', informe_texto: 'Válvula mitral con reparación transcatéter borde a borde (TEER), sin estenosis ni insuficiencia.' });
est({ vt_morf: 'Prótesis mecánica', vt_prot_modelo: 'St Jude', informe_texto: TXT.sugest });
est({ vt_morf: 'Prótesis biológica', vt_prot_modelo: 'Hancock', informe_texto: TXT.aislado });
est({ vt_morf: 'Plastia tricuspídea', informe_texto: 'Válvula tricúspide con plastia tricuspídea.' });
est({ vt_morf: 'TEER tricuspídeo (T-TEER)', informe_texto: 'Válvula tricúspide con TEER.' });
est({ vp_morf: 'Prótesis biológica', vp_prot_modelo: 'Hancock', informe_texto: '' });
est({ vp_morf: 'Prótesis mecánica', vp_prot_modelo: 'St Jude', informe_texto: '' });
est({ va_morf: 'Prótesis mecánica', va_prot_modelo: 'ATS', vm_morf: 'Prótesis biológica',
      vm_prot_modelo: 'Hancock II', informe_texto: TXT.signif });
est({ va_morf: 'Calcificada', informe_texto: TXT.nativa });
est({ vm_morf: 'Reumática', informe_texto: '' });
est({ nombre: 'sin nada', informe_texto: '' });
R.pob = POB.length;

R.inyecta = await S.ev(async (pob) => {
  if (typeof guardarInformesSeguro !== 'function') return { fn: false };
  const ok = await guardarInformesSeguro(pob);
  /* El turno se cede antes de showTab: P30-d (window.event global tras IndexedDB). */
  await new Promise(r => setTimeout(r, 30));
  if (window.showTab) showTab('lab');
  await new Promise(r => setTimeout(r, 300));
  const p = document.getElementById('lab-periodo');
  if (p) { p.value = '0'; p.dispatchEvent(new Event('change', { bubbles: true })); }
  await new Promise(r => setTimeout(r, 400));
  if (typeof labInit === 'function') labInit();
  await new Promise(r => setTimeout(r, 900));
  return { fn: true, ok: !!ok, leidos: (typeof labGetInformes === 'function') ? labGetInformes().length : null };
}, POB);

/* ── (A) la casilla, con el gesto real de abrir el acordeon ── */
R.A = await S.ev(async () => {
  /* ⚠️ SE VUELVE A ABRIR LA PESTANIA, Y SE MIDE QUE QUEDO ABIERTA. La primera version medía la
     casilla en 0x0 -- y la de «Valvulopatias» tambien-, que se lee igual que «la casilla no esta»:
     con la pestaña inactiva nada tiene geometria. El turno se cede antes, por P30-d. */
  await new Promise(r => setTimeout(r, 30));
  if (window.showTab) showTab('lab');
  await new Promise(r => setTimeout(r, 400));
  const tabActiva = String((document.getElementById('tab-lab') || {}).className || '').indexOf('active') > -1;
  /* ⚠️ Y LA SUB-PESTANIA «Mediciones», QUE ES DONDE VIVE LA TARJETA. Con el Laboratorio abierto
     en «General» -- la de fabrica-- el panel de Mediciones es display:none y TODA su geometria da
     0x0, la casilla de «Valvulopatias» incluida: es el mismo 0x0 de la pestania cerrada, un
     escalon mas abajo. Lo delata que la casilla de comparacion tambien mida 0x0. */
  const bot = Array.prototype.slice.call(document.querySelectorAll('#tab-lab .lab-subtab'))
    .filter(b => (b.textContent || '').toLowerCase().indexOf('medicion') > -1)[0];
  if (bot) { bot.click(); await new Promise(r => setTimeout(r, 400)); }
  const subActiva = !!(document.getElementById('lab-sub-mediciones') || {}).classList &&
    document.getElementById('lab-sub-mediciones').classList.contains('active');
  const card = document.querySelector('#tab-lab .lab-card[data-ppt="protesis"]');
  if (!card) return { tarjeta: false };
  const hdr = card.querySelector('.lab-card-hdr');
  if (hdr) { hdr.click(); await new Promise(r => setTimeout(r, 300)); }
  const chk = card.querySelector('.lab-ppt-chk');
  const inp = chk ? chk.querySelector('input') : null;
  const rc = chk ? chk.getBoundingClientRect() : null, rh = hdr.getBoundingClientRect();
  /* la de al lado, para comparar aspecto y posicion */
  const otra = document.querySelector('#tab-lab .lab-card[data-ppt="valvulas"] .lab-ppt-chk');
  const ro = otra ? otra.getBoundingClientRect() : null;
  const antes = (function () { try { return localStorage.getItem(LAB_PPT_CHK_KEY) } catch (e) { return null } })();
  return {
    tabActiva: tabActiva, subActiva: subActiva, botonSub: bot ? (bot.textContent || '').trim() : null,
    tarjeta: true, clave: card.getAttribute('data-ppt'), dataPptNo: card.getAttribute('data-ppt-no'),
    tieneChk: !!chk, texto: chk ? chk.textContent : null, title: chk ? chk.title : null,
    marcadaPorOmision: inp ? inp.checked : null, pptOn: card.getAttribute('data-ppt-on'),
    caja: rc ? { w: Math.round(rc.width), h: Math.round(rc.height) } : null,
    aDerechaDelHeader: rc ? Math.round(rh.right - rc.right) : null,
    igualALaDeValvulas: (rc && ro) ? (Math.round(rc.width) === Math.round(ro.width) && Math.round(rc.height) === Math.round(ro.height)) : null,
    cssChk: chk ? getComputedStyle(chk).margin : null,
    lsAntes: antes,
    cuerpoAbierto: (function () { const b = document.getElementById('lab-acc-protesis'); return b ? getComputedStyle(b).display !== 'none' : null })(),
    graficoDibujado: (function () { const c = document.getElementById('lab-prot-chart'); return c ? (c.width > 0 && c.height > 0) : null })()
  };
});

/* ── (B) los dos asserts ── */
R.B = await S.ev(() => ({
  claves: _labPptAssertClaves(), grupos: _labPptAssertGrupos(),
  nGrupos: LAB_PPT_GRUPOS.length,
  grupoDeProtesis: (function () { const g = LAB_PPT_GRUPOS.filter(x => x.cards.indexOf('protesis') > -1); return g.length ? { k: g[0].k, lbl: g[0].lbl, n: g[0].cards.length, cuantosGrupos: g.length } : null })(),
  ordenGrupos: LAB_PPT_GRUPOS.map(g => g.k)
}));

/* ── (C) el mazo generado de verdad, sin tildar y con tildar ── */
const MAZO = `(async () => {
  if (typeof window.PptxGenJS === 'undefined') return { err: 'SIN PPTXGENJS' };
  const Orig = window.PptxGenJS;
  const reg = { titulos: [], textos: [], slides: 0, tablas: 0, charts: 0 };
  window.PptxGenJS = function (...a) {
    const p = new Orig(...a);
    const oa = p.addSlide.bind(p);
    p.addSlide = function (...z) {
      reg.slides++; const s = oa(...z);
      const mio = reg.slides;
      const ot = s.addText.bind(s);
      s.addText = function (t, o) {
        const txt = (typeof t === 'string') ? t : JSON.stringify(t);
        /* el titulo de la hoja es el addText de 23 pt en negrita que pone \`nueva\` */
        if (o && o.fontSize === 23 && o.bold) reg.titulos.push(String(txt));
        reg.textos.push(mio + '#' + String(txt).slice(0, 300));
        return ot(t, o);
      };
      if (typeof s.addTable === 'function') {
        const oTb = s.addTable.bind(s);
        s.addTable = function (f, ...r) { reg.tablas++; reg.textos.push(mio + '#[TABLA] ' + JSON.stringify(f).slice(0, 2500)); return oTb(f, ...r) };
      }
      if (typeof s.addChart === 'function') {
        const oCh = s.addChart.bind(s);
        s.addChart = function (ti, d, o2) { reg.charts++; reg.textos.push(mio + '#[CHART] ' + JSON.stringify(d).slice(0, 1200)); return oCh(ti, d, o2) };
      }
      return s;
    };
    p.writeFile = function () { return Promise.resolve(true) };
    p.write = function () { return Promise.resolve('') };
    return p;
  };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  let err = null;
  try {
    await _labPPTGenerar(labGetInformes(), { presentador: 'Dra. Ficticia Perez',
      institucion: 'Centro Ficticio', fecha: '2026-11-10', tema: 'dark' });
  } catch (e) { err = String(e).slice(0, 160) }
  await new Promise(r => setTimeout(r, 400));
  window.PptxGenJS = Orig;
  return { slides: reg.slides, titulos: reg.titulos, nTextos: reg.textos.length,
           tablas: reg.tablas, charts: reg.charts, txt: reg.textos.join(' || '), err: err };
})()`;

R.C = {};
R.C.sinTildar = await S.evStr(MAZO);
R.C.marcar = await S.ev(() => {
  const card = document.querySelector('#tab-lab .lab-card[data-ppt="protesis"]');
  const inp = card.querySelector('.lab-ppt-chk input');
  inp.checked = true;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  let ls = null; try { ls = localStorage.getItem(LAB_PPT_CHK_KEY) } catch (e) {}
  return { marcada: inp.checked, pptOn: card.getAttribute('data-ppt-on'), ls: ls,
           marcadas: _labPptChkMarcadas(), activos: Object.keys(_labPptGruposActivos()) };
});
R.C.conTildar = await S.evStr(MAZO);
/* ── el control: destildar vuelve al mazo de antes ── */
R.C.desmarcar = await S.ev(() => {
  const card = document.querySelector('#tab-lab .lab-card[data-ppt="protesis"]');
  const inp = card.querySelector('.lab-ppt-chk input');
  inp.checked = false;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  let ls = null; try { ls = localStorage.getItem(LAB_PPT_CHK_KEY) } catch (e) {}
  return { marcada: inp.checked, pptOn: card.getAttribute('data-ppt-on'), ls: ls };
});
R.C.trasDesmarcar = await S.evStr(MAZO);

R.errores = S.errs.slice(0, 10);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
