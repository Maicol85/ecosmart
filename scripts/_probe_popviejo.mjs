/* Un estudio GUARDADO ANTES del cambio no se rompe: se arma sin la clave `pop_pai_pam`,
   se guarda y se vuelve a abrir, y se comprueba que el campo nuevo queda vacio, que la
   cascada de PAM usa lo que ese estudio SI trae, y que no hay error de pagina. */
const pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const b = await pw.chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1200, height: 800 } });
const errs = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA ' + m.text().slice(0, 160)); });
await pg.goto('file://' + process.argv[2], { waitUntil: 'load' });
await pg.waitForTimeout(1200);
const out = await pg.evaluate(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none'; });
  const S=(id,v)=>{const e=document.getElementById(id); if(!e) return 'NO'; e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return e.value;};
  /* Un estudio de la epoca anterior: Swan-Ganz cargado, sin la clave nueva. */
  S('peso','70'); S('talla','170'); S('pop_monitor','swan'); S('pop_sw_gc','3.2');
  S('pop_sw_pam','58'); S('pop_sw_pad','14'); S('pop_sw_pcp','18'); S('pop_cx_horas','6');
  await new Promise(r=>setTimeout(r,400));
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    if (e.id === 'pop_pai_pam') return;                      /* LA CLAVE NUEVA NO EXISTIA */
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    if (e.type === 'checkbox') campos[e.id + '__chk'] = e.checked ? '1' : '0';
  });
  const tieneClave = Object.prototype.hasOwnProperty.call(campos, 'pop_pai_pam');
  /* Ahora se vacia todo y se repone ese estudio, que es lo que hace abrir uno guardado. */
  if (typeof limpiarCampos === 'function') limpiarCampos(true);
  Object.keys(campos).forEach(k => {
    const e = document.getElementById(k); if (!e) return;
    if (e.type === 'checkbox') { e.checked = campos[k] === '1'; return; }
    e.value = campos[k];
  });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('viejo'); } catch (e) {}
  try { if (typeof popSync === 'function') popSync(); } catch (e) {}
  await new Promise(r=>setTimeout(r,400));
  const pai = document.getElementById('pop_pai_pam');
  let pe = null; try { pe = pamEfectiva(); } catch (e) { pe = { err: String(e).slice(0,80) }; }
  let hoja = ''; try { hoja = amiloTextoPOP(); } catch (e) { hoja = 'EXC ' + String(e).slice(0,80); }
  return {
    claveEnElEstudio: tieneClave,
    campoNuevo: pai ? { existe: true, valor: pai.value, visible: (document.getElementById('pop_pai_wrap')||{}).style.display !== 'none' } : { existe: false },
    pam: pe && pe.val, pamFuente: pe && pe.fuente,
    swanRepuesto: String((document.getElementById('pop_sw_pam')||{}).value || ''),
    hojaPAM: (hoja.match(/^PAM \| .*/m) || ['sin linea PAM'])[0],
    conclusion: (document.getElementById('pop-concl-box')||{}).textContent.slice(0,90)
  };
});
console.log(JSON.stringify({ archivo: process.argv[2], errores: errs, ...out }, null, 1));
await b.close(); process.exit(0);
