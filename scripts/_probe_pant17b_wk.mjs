/**
 * _probe_pant17b_wk.mjs — LOS DIECISEIS CRUCES DE PANT-17b.
 * Dos motores (el Chrome del sistema y el WebKit de Playwright) x 1440, 1000, 768 y 390 px x
 * los dos temas. WebKit de Playwright NO es Safari, y se declara.
 *   node scripts/_probe_pant17b_wk.mjs --file <index.html> --out <json>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17b_wk.json';

const MEDIR = '(async () => {\n'
  + '  const esperar = (ms) => new Promise(r => setTimeout(r, ms));\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function(id){var m=document.getElementById(id); if(m)m.style.display="none"});\n'
  + '  try { limpiarCampos(true) } catch(e){}\n'
  + '  [["dap_tipo","no_restrictivo"],["dap_diam","4"],["ete_cia_tipo","secundum"],["ete_cia_tam_max","18"],\n'
  + '   ["ete_civ_tipo","perimembranosa"],["dsav_tipo","completo"],["cvpa_venas_numero","1"],["fontan_tipo","extra"]].forEach(function(kv){\n'
  + '    var e=document.getElementById(kv[0]); if(!e)return; e.value=kv[1];\n'
  + '    e.dispatchEvent(new Event("input",{bubbles:true})); e.dispatchEvent(new Event("change",{bubbles:true})) });\n'
  + '  Object.keys(window).forEach(function(k){ if(/^calc[A-Z]/.test(k)&&typeof window[k]==="function"){try{window[k]()}catch(e){}} });\n'
  + '  try { indicCerrar() } catch(e){} try { indicAbrir() } catch(e){ return {error:"sin panel"} }\n'
  + '  await esperar(360);\n'
  + '  document.querySelectorAll("*").forEach(function(e){e.style.transition="none"; e.style.animation="none"});\n'
  + '  var c=document.getElementById("indic-cuerpo"); if(!c) return {error:"sin cuerpo"};\n'
  + '  var tops=[].slice.call(c.querySelectorAll("details")).filter(function(d){return !d.parentElement.closest("details")});\n'
  + '  tops.forEach(function(d){ d.open=true });\n'
  + '  var conCuenta=0, unaLinea=0, sinDesborde=0, conCaja=0, conDetalle=0, detalleUno=0;\n'
  + '  var balance=0, listaLarga=0, filaResp=0;\n'
  + '  tops.forEach(function(d){\n'
  + '    var t=d.textContent||"";\n'
  + '    var cta=d.querySelector("[data-ind-cuenta]");\n'
  + '    if(cta){ conCuenta++;\n'
  + '      var rc=cta.getBoundingClientRect();\n'
  + '      if(rc.height<=22) unaLinea++;\n'
  + '      if(cta.scrollWidth<=rc.width+2) sinDesborde++; }\n'
  + '    var caja=null;\n'
  + '    [].slice.call(d.querySelectorAll("div")).forEach(function(x){ if(caja)return;\n'
  + '      if(/^Con lo contestado/i.test((x.textContent||"").trim())){ var p=x.parentElement;\n'
  + '        if(p&&/border-left/.test(p.getAttribute("style")||"")) caja=p } });\n'
  + '    if(caja) conCaja++;\n'
  + '    var det=null;\n'
  + '    [].slice.call(d.querySelectorAll("details[data-ind-bloque]")).forEach(function(x){\n'
  + '      var u=x.querySelector("summary"); if(u&&/Ver detalle de la gu/.test(u.textContent||"")) det=x });\n'
  + '    if(det) conDetalle++;\n'
  + '    if(d.querySelectorAll("details[data-ind-detalle]").length===1) detalleUno++;\n'
  + '    if(t.indexOf("Condiciones presentes en este paciente")>=0) balance++;\n'
  + '    if(t.indexOf("Recomendaciones que aplican con lo contestado")>=0) listaLarga++;\n'
  + '    if(t.indexOf("Respuestas")>=0 && !cta) filaResp++;\n'
  + '  });\n'
  + '  /* las recomendaciones nuevas */\n'
  + '  var todo=tops.map(function(d){return d.textContent||""}).join(" ");\n'
  + '  var rec={ cia:todo.indexOf("especialistas en hipertensi\\u00f3n pulmonar, para mejorar los resultados")>=0,\n'
  + '            civ:todo.indexOf("experiencia en cardiopat\\u00edas cong\\u00e9nitas del adulto y en hipertensi\\u00f3n pulmonar")>=0,\n'
  + '            dsav:todo.indexOf("Hipertensi\\u00f3n arterial pulmonar, reparado o no")>=0,\n'
  + '            cvpa:todo.indexOf("apenas agrandado, con Qp:Qs por debajo de 1,5")>=0,\n'
  + '            fon:todo.indexOf("revisi\\u00f3n pretrasplante a cargo de un comit\\u00e9")>=0,\n'
  + '            e149:todo.indexOf("e149")>=0, e153:todo.indexOf("e153")>=0,\n'
  + '            e156:todo.indexOf("e156")>=0, e159:todo.indexOf("e159")>=0, e201:todo.indexOf("e201")>=0 };\n'
  + '  /* desplazamiento horizontal del cuerpo y textos recortados */\n'
  + '  var cuerpo=document.querySelector(".app-content")||document.body;\n'
  + '  var scrollH=Math.max(0, cuerpo.scrollWidth-cuerpo.clientWidth);\n'
  + '  var rec2=0;\n'
  + '  [].slice.call(c.querySelectorAll("div,span,td,button,summary")).forEach(function(e){\n'
  + '    if(e.children.length) return;\n'
  + '    if(!(e.textContent||"").trim()) return;\n'
  + '    var st=getComputedStyle(e);\n'
  + '    if(st.overflow==="auto"||st.overflowX==="auto"||st.overflowY==="auto") return;\n'
  + '    if(e.scrollWidth>e.clientWidth+2 && st.whiteSpace==="nowrap") rec2++;\n'
  + '  });\n'
  + '  return { secs:tops.length, conCuenta:conCuenta, unaLinea:unaLinea, sinDesborde:sinDesborde,\n'
  + '           conCaja:conCaja, conDetalle:conDetalle, detalleUno:detalleUno,\n'
  + '           balance:balance, listaLarga:listaLarga, filaResp:filaResp,\n'
  + '           rec:rec, scrollH:scrollH, recortados:rec2 };\n'
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
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
        if (tema === 'clr') await pg.evaluate(`document.documentElement.classList.add('light-mode')`);
        const r = await pg.evaluate(MEDIR);
        R.cruces[motor + ' ' + w + ' ' + tema] = Object.assign({ errores: errs.slice(0, 4) }, r);
      } catch (e) { R.cruces[motor + ' ' + w + ' ' + tema] = { error: String(e && e.message || e).slice(0, 110) } }
      await ctx.close();
    }
    await br.close();
  }
  fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
  console.log('OK ->', OUTF);
  for (const k of Object.keys(R.cruces)) {
    const v = R.cruces[k];
    if (v.error) { console.log(k, 'ERROR', v.error); continue }
    console.log(`${k.padEnd(18)} secs=${v.secs} cuenta=${v.conCuenta} 1linea=${v.unaLinea} sinDesb=${v.sinDesborde} caja=${v.conCaja} detGuia=${v.conDetalle} det1=${v.detalleUno} balance=${v.balance} lista=${v.listaLarga} filaResp=${v.filaResp} rec=${Object.values(v.rec).filter(Boolean).length}/10 scrollH=${v.scrollH} recort=${v.recortados} err=${v.errores.length}`);
  }
})();
