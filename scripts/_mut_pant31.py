#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant31.py - barrido de mutaciones dirigidas de la tanda PANT-31 (2026-11-10).
Calcado de _mut_pant30.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una, cada decision de los commits 2 a 5: el borde derecho del boton, el
envoltorio que no estira la hoja, la A4 en milimetros con su cuerpo en puntos y su zoom, el
pegado como texto llano con su guarda de contenedor, el clic en el fondo con su confirmacion y
su Escape que no destruye, la constancia en tres oraciones, el logo a la izquierda y el nombre
centrado, los tres consentimientos con su cuerpo y su salto, el aire de la declaracion, las
casillas dibujadas de la linea de «capacitado», los 6 mm y los 16 mm de la tabla de firmas, el
titulo retirado de las hojas comunes, y del lado del Laboratorio la clave data-ppt, su grupo
propio y las cuatro piezas de su diapositiva.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── commit 2: R1 a R4 ──────────────────────────────────────────────────────
 ('01 el boton deja de irse al rincon derecho de su fila', 'TC-795',
  [('.doc-menu-wrap{position:relative;display:inline-flex;margin-left:auto;}',
    '.doc-menu-wrap{position:relative;display:inline-flex;}')]),
 ('02 el envoltorio vuelve a ESTIRAR la hoja: la tinta sale del papel blanco', 'TC-795',
  [('.doc-hoja-wrap{flex:1 1 auto;overflow:auto;padding:16px 12px 40px;display:flex;justify-content:center;align-items:flex-start;}',
    '.doc-hoja-wrap{flex:1 1 auto;overflow:auto;padding:16px 12px 40px;display:flex;justify-content:center;}')]),
 ('03 la hoja vuelve a encoger como item flex, y el zoom calculado sale 1', 'TC-795',
  [('.doc-hoja{flex:0 0 auto;width:210mm;min-height:297mm;', '.doc-hoja{width:210mm;min-height:297mm;')]),
 ('04 la hoja deja de ser una A4 y vuelve a los 820 px', 'TC-795',
  [('.doc-hoja{flex:0 0 auto;width:210mm;min-height:297mm;', '.doc-hoja{flex:0 0 auto;width:min(820px,100%);min-height:297mm;')]),
 ('05 la hoja pierde su alto minimo de una A4', 'TC-795',
  [('width:210mm;min-height:297mm;background:#ffffff', 'width:210mm;background:#ffffff')]),
 ('06 el cuerpo de pantalla vuelve a ser fijo y deja de seguir al papel', 'TC-795',
  [("  h.style.fontSize = def.sz + 'pt';", "  h.style.fontSize = '12.5px';")]),
 ('07 el interlineado de pantalla deja de seguir al papel', 'TC-795',
  [("  h.style.lineHeight = def.lh + 'pt';", "  h.style.lineHeight = '1.5';")]),
 ('08 la variable del cuerpo no se escribe: los tamanios derivados se quedan en su respaldo', 'TC-795',
  [("  h.style.setProperty('--doc-sz', def.sz + 'pt');", '  /* sin variable */')]),
 ('09 la hoja no se ajusta al ancho al pintarse', 'TC-795',
  [("  h.style.setProperty('--doc-sz', def.sz + 'pt');\n  docZoomAjustar();",
    "  h.style.setProperty('--doc-sz', def.sz + 'pt');")]),
 ('10 el zoom pierde su tope de 1 y agranda la hoja mas que la ventana', 'TC-795',
  [('  const k = Math.min(1, Math.floor(disp / ancho * 1000) / 1000);',
    '  const k = Math.floor(disp / ancho * 1000) / 1000;')]),
 ('11 el titulo de la hoja vuelve a un tamanio fijo', 'TC-795',
  [('.doc-tit{text-align:center;font-weight:700;font-size:calc(var(--doc-sz, 10.5pt) + 3pt);',
    '.doc-tit{text-align:center;font-weight:700;font-size:16px;')]),
 ('12 el oyente de pegado desaparece: vuelve a entrar el marcado del origen', 'TC-796',
  [("document.addEventListener('paste', function (ev) {\n  const h = document.getElementById('doc-hoja');\n  if (!h) return;",
    "document.addEventListener('paste', function (ev) {\n  if (true) return;\n  const h = document.getElementById('doc-hoja');\n  if (!h) return;")]),
 ('13 el pegado inserta el HTML del origen en vez del texto llano', 'TC-796',
  [("  const crudo = (ev.clipboardData && ev.clipboardData.getData('text/plain')) || '';",
    "  const crudo = (ev.clipboardData && ev.clipboardData.getData('text/html')) || '';")]),
 ('14 el pegado deja que el navegador lo haga tambien', 'TC-796',
  [("  if (!t || t.nodeType !== 1 || !h.contains(t) || !t.isContentEditable) return;\n  ev.preventDefault();",
    "  if (!t || t.nodeType !== 1 || !h.contains(t) || !t.isContentEditable) return;")]),
 ('15 lo pegado deja de pasar por el saneo del papel', 'TC-796',
  [("  const limpio = docSan(crudo).replace(/\\s+/g, ' ');",
    "  const limpio = String(crudo);")]),
 ('16 el oyente de pegado pierde la guarda del contenedor y alcanza a toda la app', 'TC-796',
  [("  if (!t || t.nodeType !== 1 || !h.contains(t) || !t.isContentEditable) return;",
    "  if (!t || t.nodeType !== 1) return;")]),
 ('17 el clic en el fondo deja de cerrar la hoja', 'TC-797',
  [('     onclick="if(event.target===this)docCerrarPreguntando();">', '>')]),
 ('18 el fondo cierra SIEMPRE y se lleva las correcciones a mano sin preguntar', 'TC-797',
  [('  if (!docSinEntregar()) { docCerrar(); return; }', '  if (true) { docCerrar(); return; }')]),
 ('19 el foco de la pregunta arranca en la respuesta DESTRUCTIVA', 'TC-797',
  [("  const b = document.getElementById('doc-conf-seguir');\n  if (b) { try { b.focus(); } catch (e) {} }",
    "  const b = document.getElementById('doc-conf-ok');\n  if (b) { try { b.focus(); } catch (e) {} }")]),
 ('20 Escape sobre la pregunta deja pasar el evento y el oyente generico aprieta «Cerrar»', 'TC-797',
  [("  if (cf && !cf.hidden) { ev.stopImmediatePropagation(); docConfCerrar(); return; }",
    "  if (cf && !cf.hidden) { docConfCerrar(); return; }")]),
 ('21 imprimir ya no cuenta como entregar: la hoja sigue preguntando', 'TC-797',
  [('  doc.save(nom);\n  st.entregado = true;', '  doc.save(nom);')]),
 ('22 el fondo pierde la guarda del target y un clic en la hoja la cierra', 'TC-797',
  [('     onclick="if(event.target===this)docCerrarPreguntando();">',
    '     onclick="docCerrarPreguntando();">')]),
 # ── commit 3: R5 a R7 ──────────────────────────────────────────────────────
 ('23 la constancia vuelve a UN parrafo con las tres oraciones corridas', 'TC-798',
  [("        { t: 'p', x: 'Se deja constancia que {{art}} {{pac}}, {{docl}}: {{docn}}, consultó el día de hoy, {{fecha}}, en {{inst}}, para realizarse {{est}}.' },\n        { t: 'p', x: 'Se extiende la presente para ser presentada donde corresponda.' },\n        { t: 'esp', mm: 2 },\n        { t: 'p', x: 'Sin más, saluda atentamente.' },",
    "        { t: 'p', x: 'Se deja constancia que {{art}} {{pac}}, {{docl}}: {{docn}}, consultó el día de hoy, {{fecha}}, en {{inst}}, para realizarse {{est}}. Se extiende la presente para ser presentada donde corresponda. Sin más, saluda atentamente.' },")]),
 ('24 las dos frases de la constancia pierden el espacio entre ellas', 'TC-798',
  [("        { t: 'esp', mm: 2 },\n        { t: 'p', x: 'Sin más, saluda atentamente.' },",
    "        { t: 'p', x: 'Sin más, saluda atentamente.' },")]),
 ('25 el logo vuelve al borde derecho del papel', 'TC-798',
  [("      cur().push({ k: 'img', x: G.ML, y: yT, w: LOGO_W, h: LOGO_H, d: D.logoD });",
    "      cur().push({ k: 'img', x: G.W - G.MR - LOGO_W, y: yT, w: LOGO_W, h: LOGO_H, d: D.logoD });")]),
 ('26 el nombre de la institucion deja de ir centrado y vuelve a la izquierda', 'TC-798',
  [("      cur().push({ k: 'c', y: yy, sz: SZ + 2.2, b: true, i: false, col: G.NAVY, s: l });",
    "      cur().push({ k: 't', x: G.ML, y: yy, sz: SZ + 2.2, b: true, i: false, col: G.NAVY, s: l });")]),
 ('27 el encabezado de pantalla vuelve a dos columnas y el centro deja de ser el de la hoja', 'TC-798',
  [('.doc-enc{display:grid;grid-template-columns:18mm 1fr 18mm;align-items:center;gap:0 4mm;}',
    '.doc-enc{display:flex;align-items:center;gap:12px;}')]),
 ('28 el logo de pantalla se recorta en vez de conservar su proporcion', 'TC-798',
  [('.doc-enc-logo{max-height:14mm;max-width:18mm;object-fit:contain;}',
    '.doc-enc-logo{max-height:14mm;max-width:18mm;object-fit:cover;}')]),
 # ── commit 4: R8 a R10 ─────────────────────────────────────────────────────
 ('29 la cardioversion vuelve al cuerpo apretado de una hoja', 'TC-799',
  [("    sz: 10.2, lh: 13.4, hojas: 2,\n    bloques: function () {\n      const PROC = 'una cardioversión eléctrica';",
    "    sz: 8.8, lh: 11, hojas: 1,\n    bloques: function () {\n      const PROC = 'una cardioversión eléctrica';")]),
 ('30 el test de burbujas pierde su salto de hoja', 'TC-799',
  [("        /* El salto, antes de «Antes del estudio», igual que en el ETE (R8). */\n        { t: 'salto' },\n        { t: 'sec', x: 'Antes del estudio' },\n        { t: 'p', x: 'Informe a su médico, antes de realizarse el estudio, si (marque):' },",
    "        { t: 'sec', x: 'Antes del estudio' },\n        { t: 'p', x: 'Informe a su médico, antes de realizarse el estudio, si (marque):' },")]),
 ('31 la declaracion pierde el aire entre sus vinietas', 'TC-799',
  [("    { t: 'ul', items: vs, aire: 5 },", "    { t: 'ul', items: vs },")]),
 ('32 las dos lineas de casillas pierden sus 8 pt de aire', 'TC-799',
  [("    { t: 'esp', mm: 2.82 },\n    { t: 'chk1', x: 'Consiento", "    { t: 'chk1', x: 'Consiento")]),
 ('33 la linea de «capacitado» vuelve a ESCRIBIR sus casillas en vez de dibujarlas', 'TC-799',
  [("    { t: 'pchk', x: 'El firmante deja constancia", "    { t: 'p', x: 'El firmante deja constancia")]),
 ('34 la fila «Firma» del papel vuelve a 14 mm', 'TC-799',
  [("      ['Firma', '', '', 16],", "      ['Firma', '', '', 14],")]),
 ('35 la tabla de firmas se vuelve a pegar al texto', 'TC-799',
  [("    /* R10: al menos 6 mm entre esa frase y la tabla de firmas. */\n    { t: 'esp', mm: 6 },\n    { t: 'tfirmas' }",
    "    { t: 'tfirmas' }")]),
 ('36 las hojas comunes recuperan su titulo de archivo', 'TC-799',
  [("    { t: 'salto' },\n    { t: 'sec', x: 'Niño o paciente imposibilitado de otorgar el consentimiento', nonum: 1 },",
    "    { t: 'salto' },\n    { t: 'tit', x: 'HOJAS COMUNES A LOS CONSENTIMIENTOS' },\n    { t: 'sec', x: 'Niño o paciente imposibilitado de otorgar el consentimiento', nonum: 1 },")]),
 ('37 el aire no viaja con el bloque: se pierde en cuanto se arma la hoja', 'TC-799',
  [('    if (b.aire) c.aire = b.aire;', '    /* sin aire */')]),
 # ── commit 5: R11 ──────────────────────────────────────────────────────────
 ('38 la seccion del Laboratorio pierde su clave y su casilla', 'TC-800,TC-793',
  [('  <div class="lab-card" data-ppt="protesis">',
    '  <div class="lab-card" data-ppt-no="sin diapositiva">')]),
 ('39 el grupo de la diapositiva desaparece: la casilla no produce nada', 'TC-800',
  [("  { k:'prot',      lbl:'Prótesis valvulares',      cards:['protesis'] },", '')]),
 ('40 la seccion se mete en el grupo de Valvulopatias y las dos hojas se arrastran', 'TC-800',
  [("  { k:'valv',      lbl:'Valvulopatías',             cards:['valvulas','etiologias'] },\n  /* Un grupo propio",
    "  { k:'valv',      lbl:'Valvulopatías',             cards:['valvulas','etiologias','protesis'] },\n  /* Un grupo propio")]),
 ('41 la hoja de protesis sale SIEMPRE, con la casilla apagada', 'TC-800',
  [("    if (G('prot')) {\n      let SP = null;", '    if (true) {\n      let SP = null;')]),
 ('42 la hoja pierde su grafico de trastornos', 'TC-800',
  [("        if (!gBarras(s, trast, { x:6.6, y:0.92, w:3.1, h:2.4 }, 'Trastornos de las prótesis'))",
    "        if (!gBarras(s, [], { x:6.6, y:0.92, w:3.1, h:2.4 }, 'Trastornos de las prótesis'))")]),
 ('43 la hoja pierde la tabla de los modelos mas usados', 'TC-800',
  [('          s.addTable([hdr].concat(filas), { x:0.4, y:3.42, w:W-0.8, fontSize:9, fontFace:FONT,',
    '          if (false) s.addTable([hdr].concat(filas), { x:0.4, y:3.42, w:W-0.8, fontSize:9, fontFace:FONT,')]),
 ('44 las barras dejan de distinguir el tipo y solo publican la posicion', 'TC-800',
  [("            porPosTipo.push({ lbl: pp.lbl + ' · ' + LAB_PROT_TIPO_LBL[t] + (rep ? ' (rep.)' : ''),",
    "            porPosTipo.push({ lbl: pp.lbl,")]),
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
