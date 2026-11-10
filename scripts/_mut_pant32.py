#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant32.py - barrido de mutaciones dirigidas de la tanda PANT-32 (2026-11-10).
Calcado de _mut_pant31.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con --anclas ANTES de correr el barrido:
el barrido de PANT-20 se perdio una corrida entera por siete anclas escritas con secuencias
de escape en vez del caracter.
Nombre propio: verificado con ls, no existia.

Rompe, una por una, cada decision de los commits 2 a 6: la identidad que sostiene la regla de
oro, la comparacion que decide si un incluido esta editado, el validador del almacen, las cinco
convenciones del texto, la negrita palabra por palabra, la declaracion de un propio, el lugar de
la seccion de Configuracion, el ocultamiento por clase, el cupo, el menu pintado, los oyentes del
editor registrados una sola vez, la vista previa con su paciente ficticio, el tope de dos
propios, la pregunta vacia, el grupo de firmas, y del lado del archivo la marca de formato, el
nombre, la confirmacion y el rechazo entero.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── commit 2 · el almacen y la regla de oro ───────────────────────────────────────────────
 ('01 docmodDef deja de devolver el objeto de DOC_DEFS: la regla de oro cae', 'TC-801',
  [('  if (m.incl && !m.editado) return DOC_DEFS[clave];',
    '  if (m.incl && !m.editado) return { clave: clave, menu: m.nom, tit: DOC_DEFS[clave].tit, sz: DOCMOD_SZ[m.tipo], lh: DOCMOD_LH[m.tipo], hojas: 1, bloques: function () { return docmodArmar(m); } };')]),
 ('02 un incluido sin editar pasa por el armador comun', 'TC-801',
  [('  if (m.incl && !m.editado) return DOC_DEFS[clave];', '  /* sin atajo */')]),
 ('03 la comparacion del lector desaparece: un ed igual al original cuenta como editado', 'TC-801',
  [('      try { if (JSON.stringify(norm(o)) === JSON.stringify(norm(ed))) ed = null; } catch (x) {}',
    '      /* sin comparar */')]),
 ('04 docmodOrig de la constancia se come la frase con los datos', 'TC-801',
  [("             frase: true, txt: docmodBloquesATexto(b.slice(iFr + 1, iFi < 0 ? b.length : iFi)),",
    "             frase: true, txt: docmodBloquesATexto(b.slice(iFr, iFi < 0 ? b.length : iFi)),")]),
 ('05 el cuerpo de un consentimiento se deriva desde el titulo y arrastra el encabezado', 'TC-801',
  [('           pregs: docmodCuerpoAPregs(b.slice(iPac + 1, iDec < 0 ? b.length : iDec)),',
    '           pregs: docmodCuerpoAPregs(b.slice(0, iDec < 0 ? b.length : iDec)),')]),
 ('06 docmodLeer deja de validar y devuelve el crudo: un valor corrupto llega al render', 'TC-801',
  [('  const r = docmodValidar(raw, false);\n  return r.ok ? r.st : docmodVacio();',
    '  return raw;')]),
 ('07 el validador acepta una clave desconocida', 'TC-801',
  [("  for (const k in raw) if (Object.prototype.hasOwnProperty.call(raw, k) && K_RAIZ.indexOf(k) < 0) return no();",
    "  /* sin control de claves */")]),
 ('08 el validador deja pasar cualquier version', 'TC-801',
  [('  if (raw.v !== DOCMOD_VER) return no();', '  /* sin version */')]),
 ('09 el validador acepta un numero donde va un texto', 'TC-801',
  [("  const txt = function (v, max) { return typeof v === 'string' && v.length <= max; };",
    "  const txt = function (v, max) { return String(v).length <= max; };")]),
 ('10 el validador deja pasar un incluido que no existe', 'TC-801',
  [("  for (const k in ri) if (Object.prototype.hasOwnProperty.call(ri, k) && DOCMOD_INCL.indexOf(k) < 0) return no();",
    "  /* sin control */")]),
 # ── commit 2 · las cinco convenciones ─────────────────────────────────────────────────────
 ('11 la vinieta deja de reconocerse: una lista se vuelve un parrafo', 'TC-802',
  [("    if (t.charAt(0) === '\u2022') {", "    if (false) {")]),
 ('12 dos casillas seguidas dejan de salir en dos columnas', 'TC-802',
  [("      if (chk.length === 1) bl.push({ t: 'chk1', x: chk[0] });\n      else bl.push({ t: 'chk2', items: chk.slice() });",
    "      chk.forEach(function (x) { bl.push({ t: 'chk1', x: x }); });")]),
 ('13 los guiones bajos solos dejan de ser una raya para escribir a mano', 'TC-802',
  [("    if (/^_{3,}$/.test(t)) {", "    if (false) {")]),
 ('14 la raya pierde el parrafo de arriba como rotulo', 'TC-802',
  [("      bl.push({ t: 'raya', x: docmodSinNeg(rot) });", "      bl.push({ t: 'raya', x: '' });")]),
 ('15 los dobles asteriscos dejan de dar negrita: todo es un parrafo llano', 'TC-802',
  [("    if (runs.some(function (r) { return r.b; })) bl.push({ t: 'pr', runs: runs });\n    else bl.push({ t: 'p', x: s });",
    "    bl.push({ t: 'p', x: s });")]),
 ('16 la negrita del prefijo de una vinieta se pierde', 'TC-802',
  [("        if (vin.fuerte.indexOf(m[1]) < 0) vin.fuerte.push(m[1]);", "        /* sin fuerte */")]),
 ('17 parrafoRico deja de emitir el peso por palabra: la negrita no llega al papel', 'TC-802',
  [("      l.forEach(function (p) { ws.push({ s: p.s, x: cx, b: p.b }); cx += p.a + gap; });",
    "      l.forEach(function (p) { ws.push({ s: p.s, x: cx }); cx += p.a + gap; });")]),
 ('18 docBloquesNuevos deja de copiar los runs: la negrita se pierde al abrir la hoja', 'TC-802',
  [("    if (b.runs) c.runs = b.runs.map(function (r) { return { s: docSust(r.s, D), b: !!r.b }; });",
    "    /* sin runs */")]),
 ('19 una linea con cuadrados en el MEDIO se trata como casilla y sus cuadrados no se dibujan', 'TC-802',
  [("      if (s.indexOf('\u2610') < 0) {", "      if (true) {")]),
 ('20 la declaracion de un propio vuelve a nombrar el procedimiento de la frase de acuerdo', 'TC-802',
  [("    { t: 'p', x: 'He leído la información y estoy de acuerdo en que se me realice ' + (procAcuerdo || procSin) + '.' },",
    "    { t: 'p', x: 'He leído la información y estoy de acuerdo en que se me realice ' + procSin + '.' },")]),
 # ── commit 3 · la pantalla y el menu ──────────────────────────────────────────────────────
 # ⚠️ LA PRIMERA VERSION DE ESTA MUTACION ESTABA MAL DIRIGIDA: le ponia `order:9` a la seccion, y
 # `order` no mueve el DOM -- el contenedor de Config no es flex-, asi que era una no-operacion y
 # sobrevivio sin probar nada. Lo que (A3) y (A4) vigilan es la VECINDAD, asi que la mutacion que
 # las ejercita es otra tarjeta colandose en el medio.
 ('21 otra tarjeta se cuela entre «Imagenes del estudio» y «Documentos»', 'TC-803',
  [('      <!-- 5b · Documentos (PANT-32) ',
    '      <section class="cfg-card"><div class="cfg-sec-title">Intrusa</div></section>\n      <!-- 5b · Documentos (PANT-32) ')]),
 ('22 el ocultamiento vuelve a hidden, que no alcanza', 'TC-803',
  [("  w.classList.toggle('doc-oculto', !on);", "  w.hidden = !on;")]),
 ('23 la clase que oculta deja de existir', 'TC-803',
  [('.doc-oculto{display:none !important;}', '.doc-oculto{}')]),
 ('24 el interruptor no se guarda: no vale al recargar', 'TC-803',
  [("  try { localStorage.setItem(DOCMOD_BTN_KEY, on ? '1' : '0'); }",
    "  try { if (false) localStorage.setItem(DOCMOD_BTN_KEY, on ? '1' : '0'); }")]),
 ('25 el interruptor nace APAGADO', 'TC-803',
  [("  try { return localStorage.getItem(DOCMOD_BTN_KEY) !== '0'; } catch (e) { return true; }",
    "  try { return localStorage.getItem(DOCMOD_BTN_KEY) === '1'; } catch (e) { return false; }")]),
 ('26 la lista ofrece Borrar en los cuatro incluidos', 'TC-803',
  [("    if (!x.incl) h += '<button type=\"button\" class=\"btn btn-ghost\" data-cd-del=\"' + escHtml(x.clave) + '\">Borrar</button>';",
    "    h += '<button type=\"button\" class=\"btn btn-ghost\" data-cd-del=\"' + escHtml(x.clave) + '\">Borrar</button>';")]),
 ('27 el cupo deja de contar los ocultos', 'TC-803',
  [("    cupo.textContent = lista.length + ' de ' + DOCMOD_TOTAL_MAX + ' documentos' +",
    "    cupo.textContent = lista.filter(function (z) { return z.vis; }).length + ' de ' + DOCMOD_TOTAL_MAX + ' documentos' +")]),
 ('28 ocultar un incluido le BORRA el texto editado', 'TC-803',
  [("  if (DOCMOD_INCL.indexOf(clave) >= 0) { st.incl[clave].vis = !!on; }",
    "  if (DOCMOD_INCL.indexOf(clave) >= 0) { st.incl[clave].vis = !!on; st.incl[clave].ed = null; }")]),
 ('29 el menu no se repinta al ocultar o mostrar: hay que recargar', 'TC-804',
  [('function cfgDocsRender() {\n  docmodBotonSync();\n  docmodMenuRender();',
    'function cfgDocsRender() {\n  docmodBotonSync();')]),
 ('30 el menu vuelve a interpolar la clave en un onclick inline', 'TC-804',
  [("    return '<button type=\"button\" role=\"menuitem\" data-doc-k=\"' + escHtml(x.clave) + '\">' +",
    "    return '<button type=\"button\" role=\"menuitem\" onclick=\"docAbrir(\\'' + escHtml(x.clave) + '\\')\">' +")]),
 ('31 el mensaje de «no hay documentos visibles» desaparece', 'TC-804',
  [("    m.innerHTML = '<div style=\"padding:8px 12px;font-size:11.5px;color:var(--text2)\">No hay documentos visibles.</div>';",
    "    m.innerHTML = '';")]),
 # ── commit 4 · el editor ──────────────────────────────────────────────────────────────────
 ('32 los oyentes del editor se vuelven a registrar en cada repintado', 'TC-804',
  [('  if (ed._cdDeleg) return;\n  ed._cdDeleg = true;', '  /* sin guarda */')]),
 ('33 la vista previa usa los datos REALES del paciente en vez del ficticio', 'TC-804',
  [('    const D = docmodEjemplo();\n    let bl;', '    const D = docDatos();\n    let bl;')]),
 ('34 la vista previa se vuelve editable: deja de ser una vista', 'TC-804',
  [("    h.innerHTML = docHojaHTML(bl, D, false);", "    h.innerHTML = docHojaHTML(bl, D, true);")]),
 ('35 el editor deja de esconder la lista: las dos cosas se pisan', 'TC-804',
  [("    if (e) e.classList.toggle('doc-oculto', !on);", "    if (e) e.classList.remove('doc-oculto');")]),
 # ── commit 5 · los propios ────────────────────────────────────────────────────────────────
 ('36 el tope de documentos propios sube a tres', 'TC-805',
  [('const DOCMOD_PROPIOS_MAX = 2;', 'const DOCMOD_PROPIOS_MAX = 3;')]),
 ('37 el boton «Agregar documento» ya no se desactiva con el cupo lleno', 'TC-805',
  [('    add.disabled = nProp >= DOCMOD_PROPIOS_MAX;', '    add.disabled = false;')]),
 ('38 un nombre en blanco se acepta y el documento queda sin nombre en el menu', 'TC-805',
  [("    if (!nom) { alert('El nombre no puede quedar vacío.'); return; }\n  } else if (!nom) {",
    "    if (!nom) { nom = 'Documento'; }\n  } else if (!nom) {")]),
 ('39 una pregunta con el texto vacio SI se imprime, y numera una seccion que no dice nada', 'TC-805',
  [('    const cuerpo = docmodTextoABloques(p.x);\n    if (!cuerpo.length) return;',
    '    const cuerpo = docmodTextoABloques(p.x);')]),
 ('40 la declaracion pierde su grupo: puede quedar separada de la tabla de firmas', 'TC-805',
  [("  out.forEach(function (b) { b.grupo = 'firmas'; });", "  /* sin grupo */")]),
 ('41 sin tabla de firmas NO queda la firma del medico', 'TC-805',
  [("  else bl.push({ t: 'firma', grupo: 'firmas' });", "  /* sin firma */")]),
 ('42 las hojas comunes dejan de ir aparte y siguen en la misma hoja', 'TC-805',
  [('  if (m.comunes !== false) mete(pz.comunes);', '  if (m.comunes !== false) mete(pz.comunes.slice(1));')]),
 ('43 el titulo de la hoja de un propio deja de ser su nombre', 'TC-805',
  [("           tit: m.incl ? DOC_DEFS[clave].tit : (m.nom || m.tit || 'Documento'),",
    "           tit: 'Documento',")]),
 # ── commit 6 · exportar e importar ────────────────────────────────────────────────────────
 ('44 el archivo exportado pierde su marca de formato', 'TC-806',
  [("  const obj = { _ecosmart_modelos: true, v: DOCMOD_VER, fecha: fecha, incl: st.incl, prop: st.prop };",
    "  const obj = { v: DOCMOD_VER, fecha: fecha, incl: st.incl, prop: st.prop };")]),
 ('45 el archivo exportado cambia de nombre', 'TC-806',
  [("  a.download = 'ecosmart_modelos_documentos_' + fecha + '.json';", "  a.download = 'modelos.json';")]),
 ('46 el archivo exportado se lleva los datos del paciente puestos', 'TC-806',
  [("  const obj = { _ecosmart_modelos: true, v: DOCMOD_VER, fecha: fecha, incl: st.incl, prop: st.prop };",
    "  const obj = { _ecosmart_modelos: true, v: DOCMOD_VER, fecha: fecha, incl: st.incl, prop: st.prop, datos: docDatos() };")]),
 ('47 la importacion deja de exigir la marca de formato: entra cualquier json con esa forma', 'TC-806',
  [('    const r = docmodValidar(crudo, true);', '    const r = docmodValidar(crudo, false);')]),
 ('48 la importacion deja de preguntar y reemplaza sin avisar', 'TC-806',
  [("    if (!confirm('Esto reemplaza los documentos que tenés ahora por los del archivo. ¿Continuar?')) return;",
    "    /* sin preguntar */")]),
 ('49 la importacion escribe el crudo y carga un archivo invalido a medias', 'TC-806',
  [("    if (!docmodEscribir(r.st)) { alert('No se pudo guardar en el almacenamiento del navegador.'); return; }",
    "    if (!docmodEscribir(crudo)) { alert('No se pudo guardar en el almacenamiento del navegador.'); return; }")]),
 ('50 el mensaje de los tres propios se vuelve el generico', 'TC-806',
  [("    if (!r.ok) { alert(r.motivo === 'propios' ? DOCMOD_3PROP : DOCMOD_AJENO); return; }",
    "    if (!r.ok) { alert(DOCMOD_AJENO); return; }")]),
 # ⚠️ ESTA MUTACION ROMPE LAS DOS GUARDAS, y la primera version rompia solo una: con el tope de
 # propios sacado, 4 incluidos + 3 propios = 7 > 6 y el tope TOTAL la cazaba igual, asi que
 # sobrevivio por redundancia y no por falta de cobertura.
 ('51 el validador deja pasar mas de dos documentos propios (las DOS guardas)', 'TC-806',
  [("  if (rp.length > DOCMOD_PROPIOS_MAX) return no('propios');", "  /* sin tope */"),
   ("  if (DOCMOD_INCL.length + st.prop.length > DOCMOD_TOTAL_MAX) return no('propios');",
    "  /* sin tope total */")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] != '--anclas' else None
if len(sys.argv) > 2 and sys.argv[2] == '--anclas':
    mal = 0
    for i, (nom, casos, pares) in enumerate(MUT, 1):
        for bus, rep in pares:
            c = orig.count(bus)
            if c != 1:
                mal += 1
                print('  %02d ANCLA x%d  %s' % (i, c, nom))
    print('  anclas que NO aparecen exactamente una vez: %d de %d mutaciones' % (mal, len(MUT)))
    sys.exit(0)
for i, (nom, casos, pares) in enumerate(MUT, 1):
    if SOLO and ('%02d' % i) not in SOLO: continue
    s = orig; ok = True
    for bus, rep in pares:
        if s.count(bus) != 1:
            noaplica.append((nom, 'el ancla aparece %d veces' % s.count(bus))); ok = False; break
        s = s.replace(bus, rep)
    if not ok: print('  %02d NO APLICA  %s' % (i, nom), flush=True); continue
    with open(IDX, 'w', encoding='utf-8') as f:
        f.write(s); f.flush(); os.fsync(f.fileno())
    if open(IDX, encoding='utf-8').read() != s:
        noaplica.append((nom, 'el archivo en disco no coincide')); print('  %02d DISCO  %s' % (i, nom), flush=True); continue
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', casos],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        noaplica.append((nom, 'el suite NO CORRIO')); print('  %02d NO CORRIO  %s' % (i, nom), flush=True)
    elif chr(10007) in out:
        muertas.append(nom); print('  %02d MUERTA    %s' % (i, nom), flush=True)
    else:
        vivas.append(nom); print('  %02d SOBREVIVIO %s   <<<' % (i, nom), flush=True)
with open(IDX, 'w', encoding='utf-8') as f:
    f.write(orig); f.flush(); os.fsync(f.fileno())
print('')
print('  %d/%d MUERTAS   %d sobrevivieron   %d no aplicaron   (%.1f min)' % (
    len(muertas), len(MUT) if not SOLO else len(SOLO), len(vivas), len(noaplica), (time.time() - t0) / 60))
for n, m in noaplica: print('    NO APLICO: %s - %s' % (n, m))
for n in vivas: print('    SOBREVIVIO: %s' % n)
print('  md5 del arbol VIVO: antes %s  despues %s  %s' % (
    MD5_VIVO, md5(VIVO), 'IDENTICO' if MD5_VIVO == md5(VIVO) else '!!! CAMBIO !!!'))
