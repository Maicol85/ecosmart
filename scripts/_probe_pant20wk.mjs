/**
 * _probe_pant20wk.mjs — LOS DIECISEIS CRUCES DE PANT-20.
 * Dos motores (el Chrome del sistema y el WebKit de Playwright) x 1440, 1000, 768 y 390 px x
 * los dos temas. WebKit de Playwright NO es Safari, y se declara.
 *   node scripts/_probe_pant20wk.mjs --file <index.html> --out <json>
 *
 * Mide, en cada cruce: los TRES botones nuevos (mitral, tricuspide, pulmonar) con su alto y sus
 * cinco puntos tactiles propios; la fila PROPIA del boton mitral y la grilla de tres de TC-522
 * intacta; la tarjeta flotante por encima de 900 px y hoja fija abajo por debajo; Escape; el
 * foco de vuelta al boton; las dos fichas de Referencias dentro de su contenedor y cerradas;
 * desplazamiento horizontal, textos recortados y errores de consola y de pagina.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p20_wk.json';

const MEDIR = '(async () => {\n'
  + '  const esperar = (ms) => new Promise(r => setTimeout(r, ms));\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function(id){var m=document.getElementById(id); if(m)m.style.display="none"});\n'
  + '  try { limpiarCampos(true) } catch(e){}\n'
  + '  try { showTab("valvulas") } catch(e){}\n'
  + '  await esperar(260);\n'
  + '  document.querySelectorAll("*").forEach(function(e){e.style.transition="none"; e.style.animation="none"});\n'
  /* las tres morfologias en protesis, por el gesto real */
  + '  [["vm_morf","Pr\\u00f3tesis mec\\u00e1nica"],["vt_morf","Pr\\u00f3tesis mec\\u00e1nica"],\n'
  + '   ["vp_morf","Pr\\u00f3tesis mec\\u00e1nica"]].forEach(function(kv){\n'
  + '    var e=document.getElementById(kv[0]); if(!e)return;\n'
  + '    var hay=[].slice.call(e.options).some(function(o){return o.value===kv[1]});\n'
  + '    if(!hay) return;\n'
  + '    e.value=kv[1]; e.dispatchEvent(new Event("input",{bubbles:true}));\n'
  + '    e.dispatchEvent(new Event("change",{bubbles:true})) });\n'
  + '  try { vModSyncTodos() } catch(e){}\n'
  + '  await esperar(300);\n'
  /* LAS TRES SECCIONES SE ABREN CON toggleEteSeccion y sus ids son ete-seccion-valv-*. Sin esto
     los tres botones informan 0x0 y la tarjeta no abre: el denominador vacio que la primera
     corrida de esta sonda pago, y que se lee igual que «el componente no esta». */
  + '  var secs=["valv-mitral","valv-tricuspide","valv-pulmonar"];\n'
  + '  var abiertas=0;\n'
  + '  secs.forEach(function(k){ var d=document.getElementById("ete-seccion-"+k); if(!d) return;\n'
  + '    for(var i=0;i<3 && getComputedStyle(d).display==="none";i++){\n'
  + '      try { toggleEteSeccion(k) } catch(e){ return } }\n'
  + '    if(getComputedStyle(d).display!=="none") abiertas++ });\n'
  + '  await esperar(320);\n'
  + '  document.querySelectorAll("*").forEach(function(e){e.style.transition="none"; e.style.animation="none"});\n'
  + '  var R = { btn:{}, tactil:{}, fila:{}, tres:null, card:null, refs:null, secs:abiertas };\n'
  + '  ["vm","vt","vp"].forEach(function(p){\n'
  + '    var b=document.getElementById("vmod-"+p+"-btn");\n'
  + '    if(!b){ R.btn[p]="NO EXISTE"; return }\n'
  + '    var r=b.getBoundingClientRect();\n'
  + '    R.btn[p]=Math.round(r.height)+"x"+Math.round(r.width);\n'
  + '    var ajeno=0;\n'
  + '    var pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],\n'
  + '             [r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]];\n'
  + '    var n=0;\n'
  + '    if(r.top>=0 && r.bottom<=innerHeight){\n'
  + '      pts.forEach(function(q){ var e=document.elementFromPoint(q[0],q[1]);\n'
  + '        if(e && (e===b || b.contains(e))) n++;\n'
  + '        else if(e && e.closest && e.closest("button,input,select,textarea,a[href]")) ajeno++ });\n'
  + '      R.tactil[p]=n+"/5 ajeno="+ajeno;\n'
  + '    } else { b.scrollIntoView({block:"center"});\n'
  + '      var r2=b.getBoundingClientRect();\n'
  + '      var p2=[[r2.left+2,r2.top+2],[r2.right-2,r2.top+2],[r2.left+2,r2.bottom-2],\n'
  + '              [r2.right-2,r2.bottom-2],[r2.left+r2.width/2,r2.top+r2.height/2]];\n'
  + '      p2.forEach(function(q){ var e=document.elementFromPoint(q[0],q[1]);\n'
  + '        if(e && (e===b || b.contains(e))) n++;\n'
  + '        else if(e && e.closest && e.closest("button,input,select,textarea,a[href]")) ajeno++ });\n'
  + '      R.tactil[p]=n+"/5 ajeno="+ajeno; }\n'
  + '  });\n'
  /* la fila PROPIA del boton mitral, hermana de la grilla de tres */
  + '  var wm=document.getElementById("vmod-vm-wrap");\n'
  + '  var filaM=wm?wm.closest(".valv-morf-row"):null;\n'
  + '  var tres=document.querySelector(".valv-morf-row--tres");\n'
  + '  R.fila.propia = !!(filaM && tres && filaM!==tres && filaM.classList.contains("vmod-row"));\n'
  + '  R.fila.hermana = !!(filaM && tres && filaM.parentElement===tres.parentElement);\n'
  + '  if(tres){ var hij=[].slice.call(tres.children).filter(function(c){return c.classList.contains("fg")});\n'
  + '    R.tres = hij.length + ":" + hij.map(function(c){var s=c.querySelector("select,input");\n'
  + '      return s?s.id:"-"}).join(","); }\n'
  /* la tarjeta: flotante arriba de 900, hoja fija abajo */
  + '  var bm=document.getElementById("vmod-vm-btn");\n'
  + '  if(bm){ bm.scrollIntoView({block:"center"}); await esperar(120);\n'
  + '    bm.click(); await esperar(320);\n'
  + '    var c=document.getElementById("vmod-card");\n'
  + '    if(c){ var st=getComputedStyle(c), rc=c.getBoundingClientRect();\n'
  + '      R.card={ vis:st.display!=="none", pos:st.position, abajo:Math.round(rc.bottom),\n'
  + '               alto:Math.round(rc.height), ancho:Math.round(rc.width),\n'
  + '               hoja: Math.abs(rc.bottom-innerHeight)<=20 && Math.round(rc.width)>=innerWidth-20,\n'
  + '               dentro: rc.top>=-1 && rc.left>=-1 && rc.right<=innerWidth+1 };\n'
  + '      document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));\n'
  + '      await esperar(240);\n'
  + '      R.card.cierraEsc = getComputedStyle(c).display==="none";\n'
  + '      R.card.foco = document.activeElement===bm;\n'
  + '    } else R.card={ vis:false }; }\n'
  /* las dos fichas de Referencias */
  + '  try { showTab("referencias") } catch(e){}\n'
  + '  await esperar(320);\n'
  + '  var rp=document.getElementById("ref-protesicas");\n'
  + '  var cab=rp?[].slice.call(rp.querySelectorAll("h2.card-head")).map(function(h){\n'
  + '    return (h.textContent||"").replace(/\\s+/g," ").trim()}):[];\n'
  + '  var pp=document.getElementById("ref-ppulm"), pt=document.getElementById("ref-ptric");\n'
  + '  R.refs={ n:cab.length,\n'
  + '           dentro: !!(rp&&pp&&pt&&rp.contains(pp)&&rp.contains(pt)),\n'
  + '           cerradas: !!(pp&&pt&&getComputedStyle(pp).display==="none"&&getComputedStyle(pt).display==="none"),\n'
  + '           pulm: cab.filter(function(t){return t.indexOf("ulmonar")>-1&&t.indexOf("ASE 2024")>-1}).length,\n'
  + '           tric: cab.filter(function(t){return t.indexOf("ric")>-1&&t.indexOf("ASE 2024")>-1}).length };\n'
  /* desplazamiento horizontal y textos recortados */
  + '  try { showTab("valvulas") } catch(e){}\n'
  + '  await esperar(240);\n'
  + '  var cuerpo=document.querySelector(".app-content")||document.body;\n'
  + '  R.scrollH=Math.max(0, cuerpo.scrollWidth-cuerpo.clientWidth);\n'
  + '  var rec=0;\n'
  + '  [].slice.call(document.querySelectorAll("#tab-valvulas div,#tab-valvulas span,#tab-valvulas button,#tab-valvulas label")).forEach(function(e){\n'
  + '    if(e.children.length) return;\n'
  + '    if(!(e.textContent||"").trim()) return;\n'
  + '    var st=getComputedStyle(e);\n'
  + '    if(st.display==="none"||st.visibility==="hidden") return;\n'
  + '    if(st.overflow==="auto"||st.overflowX==="auto") return;\n'
  + '    if(e.scrollWidth>e.clientWidth+2 && st.whiteSpace==="nowrap") rec++ });\n'
  + '  R.recortados=rec;\n'
  + '  return R;\n'
  + '})()';

(async () => {
  const R = { file: FILE, cruces: {} };
  for (const motor of ['chrome', 'webkit']) {
    const br = motor === 'webkit' ? await _pw.webkit.launch()
                                  : await _pw.chromium.launch({ channel: 'chrome' });
    for (const w of [1440, 1000, 768, 390]) for (const tema of ['osc', 'clr']) {
      const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGINA ' + String(e && e.message || e).slice(0, 80)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA ' + m.text().slice(0, 80)) });
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        if (tema === 'clr') await pg.evaluate(`document.documentElement.classList.add('light-mode')`);
        const r = await pg.evaluate(MEDIR);
        R.cruces[motor + ' ' + w + ' ' + tema] = Object.assign({ errores: errs.slice(0, 4) }, r);
      } catch (e) { R.cruces[motor + ' ' + w + ' ' + tema] = { error: String(e && e.message || e).slice(0, 130) } }
      await ctx.close();
    }
    await br.close();
  }
  fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
  console.log('OK ->', OUTF);
  for (const k of Object.keys(R.cruces)) {
    const v = R.cruces[k];
    if (v.error) { console.log(k.padEnd(18), 'ERROR', v.error); continue }
    const c = v.card || {};
    console.log(`${k.padEnd(18)} secs=${v.secs} btn=${v.btn.vm}/${v.btn.vt}/${v.btn.vp} tac=[${v.tactil.vm}][${v.tactil.vt}][${v.tactil.vp}]`
      + ` filaPropia=${v.fila.propia} hermana=${v.fila.hermana} tres=${v.tres}`
      + ` card=${c.vis}/${c.pos}/${c.ancho}x${c.alto}@${c.abajo}/hoja=${c.hoja}/dentro=${c.dentro}/esc=${c.cierraEsc}/foco=${c.foco}`
      + ` refs=${v.refs.n}/${v.refs.pulm}/${v.refs.tric}/dentro=${v.refs.dentro}/cerr=${v.refs.cerradas}`
      + ` scrollH=${v.scrollH} recort=${v.recortados} err=${v.errores.length}`);
  }
})();
