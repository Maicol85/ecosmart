#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant30.py - barrido de mutaciones dirigidas de la tanda PANT-30 (2026-11-10).
Calcado de _mut_pant29.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una, cada decision de los commits 2 a 5: el boton y el menu, la sustitucion de
datos con los tres estados del sexo y los dos nombres de estudio, el pie, los 90 pt de la firma,
la casilla dibujada, el salto del ETE, la regla de la declaracion junto a las firmas con su
medicion por tinta, la hoja que no se pisa, el ciclo de la imagen con su clave propia, y del
lado del Laboratorio el lugar de la seccion, su data-ppt-no, las dos pilas, el orden de las
categorias, los dos trastornos que van aparte, el «con alteracion» por posicion, el filtro de
oracion, la rama de cero estudios y el tope de 15 del PDF.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── commit 2: el boton, el menu y la hoja ──────────────────────────────────
 # ⚠️ RE-APUNTADA: la primera version le ponia `hidden` y SOBREVIVIO, porque `hidden` NO oculta
 # un `.btn` en esta app -- `.btn` declara `display:inline-flex` y le gana al [hidden] del
 # navegador-. O sea que la mutacion no ocultaba nada y no probaba nada. Hoy usa un display en
 # linea, que es la unica forma de esconderlo de verdad.
 ('01 el boton Documentos desaparece de la fila de acciones', 'TC-787',
  [('<button type="button" class="btn btn-ghost" id="doc-btn" onclick="docMenuToggle()"',
    '<button type="button" style="display:none" class="btn btn-ghost" id="doc-btn" onclick="docMenuToggle()"')]),
 ('01b la regla que SI oculta el boton de quitar desaparece', 'TC-791',
  [('#doc-quitar[hidden]{display:none;}', '')]),
 ('02 el boton pierde su alto tactil de 44 px', 'TC-787',
  [('#doc-menu button:hover,#doc-menu button:focus{background:var(--bg3);outline:none;}',
    '#doc-menu button:hover,#doc-menu button:focus{background:var(--bg3);outline:none;}\n#doc-btn{min-height:20px !important;height:20px;}')]),
 ('03 el menu pierde la opcion del test de burbujas', 'TC-787',
  [("            <button type=\"button\" role=\"menuitem\" onclick=\"docAbrir('burb')\">Consentimiento: test de burbujas</button>",
    '')]),
 ('04 una opcion del menu nace deshabilitada: deja de estar SIEMPRE activa', 'TC-787',
  [("            <button type=\"button\" role=\"menuitem\" onclick=\"docAbrir('cve')\">",
    "            <button type=\"button\" disabled role=\"menuitem\" onclick=\"docAbrir('cve')\">")]),
 ('05 Escape cierra el menu pero NO devuelve el foco al boton', 'TC-787',
  [("  if (m && !m.hidden) { docMenuCerrar(); const b = document.getElementById('doc-btn'); if (b) b.focus(); return; }",
    '  if (m && !m.hidden) { docMenuCerrar(); return; }')]),
 ('06 el articulo del sexo pierde el tercer estado y elige por el medico', 'TC-788',
  [("  const art = sexo === 'M' ? 'el paciente' : (sexo === 'F' ? 'la paciente' : 'el/la paciente');",
    "  const art = sexo === 'F' ? 'la paciente' : 'el paciente';")]),
 ('07 el nombre del estudio deja de leer la casilla de ETE', 'TC-788',
  [("    est: esEte ? 'un ecocardiograma transesofágico' : 'un ecocardiograma transtorácico',",
    "    est: 'un ecocardiograma transtorácico',")]),
 ('08 un dato vacio pierde su raya en el texto de la declaracion', 'TC-789',
  [("    return (v === undefined || v === null || String(v).trim() === '') ? '____' : String(v);",
    "    return (v === undefined || v === null) ? '____' : String(v);")]),
 # ⚠️ Y SU CASO ES TC-789 Y NO TC-788: en la constancia la ciudad NO pasa por docSust -- su
 # renglon lo arma el bloque `ciudadfecha`, que resuelve el vacio por su cuenta-, asi que una
 # condicion puesta ahi no podia ver esta mutacion. El marcador de verdad vive en la declaracion
 # de un consentimiento: «Se firma el presente en {ciudad}, a los...».
 ('09 el azul de los datos deja de marcarse en pantalla', 'TC-788',
  [("    if (v && String(v).trim().length >= 3) vals.push(String(v));",
    '    if (false) vals.push(String(v));')]),
 ('10 el pie Pagina X de Y sale solo en la primera hoja', 'TC-788,TC-789',
  [("  for (let q = 0; q < n; q++) {\n    hojas[q].push({ k: 't', x: G.ML, y: G.PIE, sz: 7, b: false, i: true, col: [120, 120, 120], s: docSan(def.tit) });",
    "  for (let q = 0; q < 1; q++) {\n    hojas[q].push({ k: 't', x: G.ML, y: G.PIE, sz: 7, b: false, i: true, col: [120, 120, 120], s: docSan(def.tit) });")]),
 ('11 la firma pierde los 90 pt de aire y se pega al texto', 'TC-788',
  [('      const aire = 90 * G.PT;',
    '      const aire = 4 * G.PT;')]),
 ('12 algo se dibuja fuera del margen izquierdo', 'TC-788',
  [('  W:210, H:297, ML:14, MR:14, MT:12, MB:13,',
    '  W:210, H:297, ML:6, MR:14, MT:12, MB:13,')]),
 # ── commit 3: los consentimientos, las hojas y la imagen ───────────────────
 ('13 la casilla se ESCRIBE con el glifo en vez de dibujarse', 'TC-789',
  [("    cur().push({ k: 'box', x: cx, y: yb, s: lado }); cx += lado + 1.1;\n    cur().push({ k: 't', x: cx, y: y, sz: SZ, b: false, i: false, col: null, s: 'Sí' });",
    "    cur().push({ k: 't', x: cx, y: y, sz: SZ, b: false, i: false, col: null, s: '☐ Sí' });")]),
 ('14 el salto de hoja del ETE desaparece y «Antes del estudio» no arranca hoja', 'TC-789',
  [("    if (b.t === 'salto') { if (cur().length) nueva(); return; }",
    "    if (b.t === 'salto') { return; }")]),
 ('15 la regla de la declaracion junto a las firmas se retira', 'TC-789',
  [('      const h = altoGrupo(grupo);\n      if (h < 1e6 && !cabe(h) && cur().length) nueva();',
    '      const h = 0;')]),
 ('16 altoGrupo vuelve a medir la y de cierre en vez de la tinta', 'TC-789',
  [("    let fin = G.MT;\n    if (hojas.length === 1) hojas[0].forEach(function (o) {\n      if (o.k === 'rect') fin = Math.max(fin, o.y + o.h);\n      else if (o.k === 'l') fin = Math.max(fin, o.y2 === undefined ? o.y : o.y2);\n      else if (o.y !== undefined) fin = Math.max(fin, o.y);\n    });",
    '    let fin = y;')]),
 ('17 la vinieta de la internacion entra en los TRES consentimientos', 'TC-789',
  [("  if (internacion) vs.push('Acepto la duración de la internación y las condiciones que el alta médica supone en cada caso.');",
    "  vs.push('Acepto la duración de la internación y las condiciones que el alta médica supone en cada caso.');")]),
 ('18 las ocho casillas del ETE pasan a una sola columna en pantalla', 'TC-789',
  [('.doc-chk2{display:grid;grid-template-columns:1fr 1fr;gap:2px 18px;margin:0 0 7px;}',
    '.doc-chk2{display:grid;grid-template-columns:1fr;gap:2px 18px;margin:0 0 7px;}')]),
 ('19 las secciones dejan de numerarse', 'TC-789',
  [("      const n = b.nonum ? '' : (++nsec) + '. ';\n      if (!cabe(LH)) nueva();",
    "      const n = '';\n      if (!cabe(LH)) nueva();")]),
 ('20 las hojas comunes dejan de ir en su propia hoja', 'TC-789',
  [("    { t: 'salto' },\n    { t: 'tit', x: 'HOJAS COMUNES A LOS CONSENTIMIENTOS' },",
    "    { t: 'tit', x: 'HOJAS COMUNES A LOS CONSENTIMIENTOS' },")]),
 ('21 la correccion a mano no se registra y se pierde al reabrir', 'TC-790',
  [("  if (jj === null) b.x = txt; else if (b.items) b.items[parseInt(jj, 10)] = txt;\n  st.editado = true;",
    '  if (jj === null) b.x = txt; else if (b.items) b.items[parseInt(jj, 10)] = txt;')]),
 ('22 docAbrir PISA la hoja editada con los datos nuevos, sin avisar', 'TC-790',
  [('  else if (!st.editado) { st.bloques = docBloquesNuevos(def, D); st.firma = firma; }',
    '  else { st.bloques = docBloquesNuevos(def, D); st.firma = firma; }')]),
 ('23b el id del aviso vuelve a terminar en «-aviso» y limpiarCampos se lo lleva', 'TC-790',
  [('<span class="doc-aviso" id="doc-aviso-cambio" hidden>',
    '<span class="doc-aviso" id="doc-aviso" hidden>'),
   ("  const av = document.getElementById('doc-aviso-cambio');",
    "  const av = document.getElementById('doc-aviso');")]),
 ('23 el aviso nunca aparece aunque el dato haya cambiado', 'TC-790',
  [("  const hay = !!(st && st.editado && st.firma !== docFirmaDatos(docDatos()));",
    '  const hay = false;')]),
 ('24 la clave del esquema choca con la de un diagrama de toggle', 'TC-791',
  [("function docClaveEsq(clave) { return 'doc-' + clave; }",
    "function docClaveEsq(clave) { return 'contr'; }")]),
 ('25 el motivo deja de decirse cuando el guardado niega', 'TC-791',
  [("        docEstado('No se pudo guardar en «Imágenes»: ' + ((r && r.motivo) || 'motivo desconocido') + '.');",
    "        docEstado('No se pudo guardar.');")]),
 ('26 el boton de quitar no aparece con la hoja ya guardada', 'TC-791',
  [("    const hay = (es || []).some(function (e) { return e && e.clave === cl; });\n    b.hidden = !hay;",
    '    const hay = false;\n    b.hidden = true;')]),
 ('27 quitar dos veces dice que quito algo las dos', 'TC-791',
  [("      docEstado(ok ? 'Se quitó de «Imágenes».' : 'No estaba guardado en «Imágenes».');",
    "      docEstado('Se quitó de «Imágenes».');")]),
 # ── commit 4: la seccion del Laboratorio ───────────────────────────────────
 ('28 la tarjeta nueva reclama una diapositiva del PPT', 'TC-793',
  [('  <div class="lab-card" data-ppt-no="seccion nueva de PANT-30: no es una diapositiva, y ponerle data-ppt agregaria una al PPT">',
    '  <div class="lab-card" data-ppt="protesis">')]),
 ('29 la tarjeta queda MUDA: ni data-ppt ni data-ppt-no', 'TC-793',
  [('data-ppt-no="seccion nueva de PANT-30: no es una diapositiva, y ponerle data-ppt agregaria una al PPT"',
    '')]),
 ('30 las reparaciones van en la MISMA pila y se suman a las protesis', 'TC-793',
  [("      stack: rep ? 'rep' : 'prot',",
    "      stack: 'prot',")]),
 ('31 el mapa de tipos clasifica la plastia como protesis', 'TC-792',
  [("  'Plastia mitral': 'plastia',\n  'Plastia tricuspídea': 'plastia',",
    "  'Plastia mitral': 'bio',\n  'Plastia tricuspídea': 'bio',")]),
 ('32 el orden de las categorias se invierte: lo normal se cuenta como alterado', 'TC-792',
  [("    for (let i = 0; i < LAB_PROT_TRAST.length; i++) {\n      if (b.indexOf(LAB_PROT_TRAST[i].txt) > -1) { k = LAB_PROT_TRAST[i].k; break; }\n    }",
    '    for (let i = LAB_PROT_TRAST.length - 1; i >= 0; i--) {\n      if (b.indexOf(LAB_PROT_TRAST[i].txt) > -1) { k = LAB_PROT_TRAST[i].k; break; }\n    }')]),
 ('33 los dos trastornos que van APARTE pasan a contar como alteracion', 'TC-792',
  [("  { k: 'aislado', lbl: 'Hallazgo aislado, sin veredicto',                txt: 'hallazgo aislado, sin veredicto',                          alt: null,  col: '#7f8c8d' },",
    "  { k: 'aislado', lbl: 'Hallazgo aislado, sin veredicto',                txt: 'hallazgo aislado, sin veredicto',                          alt: true,  col: '#7f8c8d' },")]),
 ('34 el con alteracion de un modelo deja de salir de SU posicion', 'TC-792',
  [('      const ks = Object.keys(tr.pos[x.pos] || {});',
    '      const ks = Object.keys(tr.todos || {});')]),
 ('35 el filtro de oracion desaparece: una estenosis NATIVA se cuenta como protesica', 'TC-792',
  [('    if (!_LAB_PROT_ORACION.test(or)) return;',
    '    if (false) return;')]),
 ('36 el denominador de los trastornos pasa a ser TODOS los estudios', 'TC-792,TC-793',
  [('    S.conProtParaTrast++;',
    '    S.conProtParaTrast = S.n;')]),
 ('37 la seccion no se repinta con cero estudios y se queda con el corte anterior', 'TC-793',
  [("    try { if (typeof labProtRender === 'function') labProtRender([]); }\n    catch (e) { console.error('[lab] protesis valvulares (vacio)', e); }",
    '    /* sin repintado */')]),
 ('38 con cero protesis se dibuja un grafico vacio en vez de decirlo', 'TC-793',
  [("    if (cuerpo) cuerpo.hidden = true;\n    labDestroyChart('lab-prot-chart');\n    return;",
    '    if (cuerpo) cuerpo.hidden = false;\n    return;')]),
 ('39 el gris de los modelos con menos de 10 estudios desaparece en PANTALLA', 'TC-793',
  [('    const flojo = m.n < 10;\n    if (flojo) pocos = true;',
    '    const flojo = false;\n    if (flojo) pocos = true;')]),
 ('40 los dos filtros de la tabla de modelos dejan de filtrar', 'TC-793',
  [('    .filter(function (m) { return (!fpos || m.pos === fpos) && (!ftipo || m.tipo === ftipo); })',
    '    .filter(function (m) { return !!m; })')]),
 # ── commit 5: el PDF de auditoria ──────────────────────────────────────────
 ('41 el tope de 15 modelos del PDF desaparece', 'TC-794',
  [('          const TOPE = 15;',
    '          const TOPE = 99;')]),
 ('42 la grafica apilada no entra al PDF', 'TC-794',
  [('        const pimg = await _labProtChartPng(PS);',
    '        const pimg = null;')]),
 ('43 sin protesis el PDF igual dibuja las tablas', 'TC-794',
  [("        doc.text(S('Sin estudios con protesis en este periodo.'), M, y);\n        y += 8;\n      } else {",
    "        doc.text(S('Sin estudios con protesis en este periodo.'), M, y);\n        y += 8;\n      }\n      if (true) {")]),
 ('44 el gris de los modelos con menos de 10 estudios desaparece en el PDF', 'TC-794',
  [('              const flojo = m.n < 10;\n              if (flojo) _pocos = true;',
    '              const flojo = false;\n              if (flojo) _pocos = true;')]),
 ('45 el PDF deja de marcar las dos filas que van aparte', 'TC-794',
  [("          LAB_PROT_TRAST.map(t => [t.lbl + (t.alt === null ? ' (aparte)' : ''),",
    '          LAB_PROT_TRAST.map(t => [t.lbl,')]),
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
