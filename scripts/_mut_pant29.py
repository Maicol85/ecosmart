#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant29.py - barrido de mutaciones dirigidas de la tanda PANT-29 (2026-11-10).
Calcado de _mut_pant28.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una: cada decision de los commits 2 a 5. Los dos resumenes de miocardiopatias
-su molde, su extension, sus cifras y que las fichas grandes no vuelvan-, la ampliacion de la
ficha de coronarias y la compuerta que deja el globo otr-rac igual, el achique de las dos
tarjetas grises, las cinco formas de texto del bloque de arterias y su dueno del nivel, y el
boton Coronarias con su panel: las letras, la dominancia, las vistas, el reinicio al apagar y
que las arterias sigan pegadas a la pared mientras el ventriculo late.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── commit 2: los dos resumenes de miocardiopatias ─────────────────────────
 ('01 el resumen de atleta desaparece de la ficha', 'TC-778,TC-780',
  [('<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-top:10px;margin-bottom:6px;">Coraz&oacute;n de atleta',
    '<div style="display:none;font-size:12px;font-weight:700;color:var(--accent2);margin-top:10px;margin-bottom:6px;">Coraz&oacute;n de atleta')]),
 ('02 el resumen de atleta pierde el molde: el titulo deja de ir en negrita 700', 'TC-778',
  [('color:var(--accent2);margin-top:10px;margin-bottom:6px;">Coraz&oacute;n de atleta',
    'color:var(--accent2);margin-top:10px;margin-bottom:6px;font-weight:400;">Coraz&oacute;n de atleta')]),
 ('03 el resumen de atleta se pasa del techo de extension', 'TC-778',
  [('\u2022 <b>La magnitud no alcanza:</b> el tama&ntilde;o del VI y de la AI no separa por s&iacute; solo el ejercicio de la enfermedad',
    '\u2022 <b>La magnitud no alcanza:</b> el tama&ntilde;o del ventriculo izquierdo y de la auricula izquierda no separa por si solo el remodelado inducido por el ejercicio de la enfermedad, y hay que integrar la historia clinica, la funcion miocardica y pruebas diagnosticas adicionales antes de concluir')]),
 ('04 el resumen de atleta gana una vinieta de mas', 'TC-778',
  [('\u2022 <b>Espesor parietal:</b> el engrosamiento por ejercicio es leve',
    '\u2022 <b>Otra cosa:</b> algo mas<br>\n        \u2022 <b>Espesor parietal:</b> el engrosamiento por ejercicio es leve')]),
 ('05 el DDVI del atleta cambia de cifra y deja de coincidir con su fila de control', 'TC-780',
  [('hallazgo <b>normal</b> en el de resistencia \u00b7 DDVI hasta 70 mm en varones (media 55)',
    'hallazgo <b>normal</b> en el de resistencia \u00b7 DDVI hasta 76 mm en varones (media 58)')]),
 ('06 el espesor del atleta pierde el corte de los atletas negros', 'TC-780',
  [('<b>11&ndash;13 mm</b>, y hasta <b>15 mm</b> en atletas negros',
    '<b>11&ndash;13 mm</b> en todos')]),
 ('07 la FEVI fisiologica del atleta cambia de rango', 'TC-780',
  [('\u2022 <b>FEVI 45&ndash;55 %:</b> fisiol&oacute;gica en el asintom&aacute;tico',
    '\u2022 <b>FEVI 40&ndash;50 %:</b> fisiol&oacute;gica en el asintom&aacute;tico')]),
 ('08 el resumen de Chagas desaparece', 'TC-778,TC-780',
  [('<div style="font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px;">Miocardiopat&iacute;a chag&aacute;sica</div>',
    '<div style="display:none;font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px;">Miocardiopat&iacute;a chag&aacute;sica</div>')]),
 ('09 la prevalencia de Chagas cambia de cifra', 'TC-780',
  [('cerca de <b>1,2 millones</b> en los pa&iacute;ses end&eacute;micos',
    'cerca de <b>2,4 millones</b> en los pa&iacute;ses end&eacute;micos')]),
 ('10 el puntaje de Rassi pierde sus categorias', 'TC-780',
  [('\u2192 bajo 0-6, intermedio 7-11, alto 12-20, con mortalidad a 5 a&ntilde;os del <b>2 %</b>, <b>18 %</b> y <b>63 %</b>',
    '\u2192 tres categorias de riesgo')]),
 ('11 el aneurisma apical de Chagas cambia de frecuencia', 'TC-780',
  [('en el <b>2,0 a 8,6 %</b> de los asintom&aacute;ticos',
    'en el <b>12,0 a 28,6 %</b> de los asintom&aacute;ticos')]),
 ('12 la ficha grande de atleta VUELVE al reparto', 'TC-778,TC-509',
  [("Object.freeze(['oai', 'burbujas', 'fop', 'pericardio',\n                        'pulmon', 'tumores', 'embolig', 'miocard', 'formulas'])",
    "Object.freeze(['oai', 'burbujas', 'fop', 'pericardio',\n                        'pulmon', 'tumores', 'embolig', 'miocard', 'atleta', 'formulas'])")]),
 # ── commit 3: la ficha de coronarias y el globo ─────────────────────────────
 ('13 la compuerta del clon desaparece: el globo crece con la ficha', 'TC-779',
  [("  nodos = nodos.filter(function (n) { return !(n.getAttribute && n.getAttribute('data-ref-solo')) });",
    "  nodos = nodos.filter(function (n) { return !!n });")]),
 ('14 el bloque nuevo pierde su marca y entra al globo', 'TC-779',
  [('<div data-ref-solo="1" style="font-size:12px;color:var(--text);line-height:1.8;margin-top:10px;">',
    '<div style="font-size:12px;color:var(--text);line-height:1.8;margin-top:10px;">')]),
 ('15 la linea de fuente nueva pierde su marca y entra al globo', 'TC-779',
  [('<div data-ref-solo="1" style="font-size:10px;color:var(--text2);margin-top:8px;line-height:1.4;">\n        ASE 2020 \u2014 Frommelt et al, J Am Soc Echocardiogr',
    '<div style="font-size:10px;color:var(--text2);margin-top:8px;line-height:1.4;">\n        ASE 2020 \u2014 Frommelt et al, J Am Soc Echocardiogr')]),
 ('16 la ficha de coronarias pierde el bloque de CIRUGIA', 'TC-779',
  [('\u2022 <b>Cirug&iacute;a:</b> recomendada con s&iacute;ntomas o isquemia atribuible',
    '\u2022 <b>Conducta:</b> depende del caso, con s&iacute;ntomas o isquemia atribuible')]),
 ('17 la ficha de coronarias pierde el bloque de FRECUENCIA', 'TC-779',
  [('\u2022 <b>Frecuencia:</b> <b>hasta el 1 %</b>',
    '\u2022 <b>Prevalencia general:</b> <b>hasta el 1 %</b>')]),
 ('18 lo que la ficha vieja ya decia se pierde', 'TC-779',
  [('\u2022 <b>Posterior a la aorta</b> (retroa&oacute;rtico)<br>',
    '')]),
 ('19 la frecuencia en ninios con eco cambia de cifra', 'TC-780',
  [('<b>menos del 0,2 %</b> en ni&ntilde;os con eco',
    '<b>menos del 2 %</b> en ni&ntilde;os con eco')]),
 ('20 la ficha grande de coronarias VUELVE al reparto', 'TC-779,TC-761',
  [("  congenitas: Object.freeze(['congenitas', 'coronarias']),",
    "  congenitas: Object.freeze(['congenitas', 'coronarias', 'racong']),")]),
 # ── commit 4: el achique y el bloque de arterias ────────────────────────────
 ('21 el relleno de las dos tarjetas vuelve al de antes', 'TC-781',
  [('#lv3d-bloque-hallazgos,#lv3d-bloque-botones{background:var(--bg3);border-radius:10px;\n  padding:7px 9px;min-width:0;}',
    '#lv3d-bloque-hallazgos,#lv3d-bloque-botones{background:var(--bg3);border-radius:10px;\n  padding:10px 12px;min-width:0;}')]),
 ('22 la regla de la grilla vuelve a la de antes: la de hallazgos es la flexible', 'TC-781,TC-490',
  [("    : (_lv3d.abierto ? 'minmax(0,220px) minmax(0,150px) minmax(0,1fr)'",
    "    : (_lv3d.abierto ? 'minmax(0,1fr) minmax(0,210px) minmax(0,calc(46% + 118px))'")]),
 ('23 las dos tarjetas quedan en 264 y 210, no en 220 y 150', 'TC-781,TC-490',
  [("'minmax(0,220px) minmax(0,150px) minmax(0,1fr)'",
    "'minmax(0,264px) minmax(0,210px) minmax(0,1fr)'")]),
 ('24 el bloque de arterias desaparece de la tarjeta', 'TC-782',
  [('<div id="contr-arterias-li" style="font-size:11px;color:var(--text2);line-height:1.5;"></div>',
    '<div id="contr-arterias-liX" style="font-size:11px;color:var(--text2);line-height:1.5;"></div>')]),
 ('25 el bloque no se repinta al cambiar un segmento', 'TC-782',
  [('  contrArteriasRender();\n}',
    '  if (false) contrArteriasRender();\n}')]),
 ('26 el nivel basal deja de decir «toda la arteria»', 'TC-782,TC-785',
  [("  { max: 6,  c: 0,    txt: 'toda la arteria' },",
    "  { max: 6,  c: 0,    txt: 'desde el tercio medio' },")]),
 ('27 el corte de altura del tramo medio se mueve', 'TC-785',
  [("  { max: 12, c: 0.34, txt: 'desde el tercio medio' },",
    "  { max: 12, c: 0.50, txt: 'desde el tercio medio' },")]),
 ('28 el apex deja de tener su propio texto', 'TC-782',
  [("  { max: 17, c: 0.88, txt: 'tramo distal (\u00e1pex)' }",
    "  { max: 17, c: 0.88, txt: 'tramo distal' }")]),
 ('29 la linea de mas de un territorio no sale', 'TC-782',
  [('  else if (n > 1) li.push(CONTR_ART_MULTI);',
    '  else if (n > 99) li.push(CONTR_ART_MULTI);')]),
 ('30 el pie deja de ir siempre y no sale con Ninguna.', 'TC-782',
  [('  if (!n) li.push(CONTR_ART_NADA);\n  else if (n > 1) li.push(CONTR_ART_MULTI);\n  /* El pie va SIEMPRE, tambien con \u00abNinguna.\u00bb: es una salvedad del bloque y no de un hallazgo. */\n  li.push(CONTR_ART_PIE);',
    '  if (!n) { li.push(CONTR_ART_NADA); return li }\n  else if (n > 1) li.push(CONTR_ART_MULTI);\n  li.push(CONTR_ART_PIE);')]),
 ('31 el rotulo de la circunfleja sale en CX y no en Cx', 'TC-782',
  [("const CONTR_ART_ROTULO = Object.freeze({ CX: 'Cx' });",
    "const CONTR_ART_ROTULO = Object.freeze({});")]),
 ('32 el nivel se decide por el segmento mas BAJO y no por el mas alto', 'TC-782,TC-785',
  [('    const min = Math.min.apply(null, ss);\n    const niv = CONTR_ART_NIVEL.filter(function (x){ return min <= x.max })[0];',
    '    const min = Math.max.apply(null, ss);\n    const niv = CONTR_ART_NIVEL.filter(function (x){ return min <= x.max })[0];')]),
 # ── commit 5: el boton, las arterias y el panel ─────────────────────────────
 ('33 el boton Coronarias gana la clase de las vistas y queda como una cuarta orientacion', 'TC-783,TC-490',
  [('<button type="button" class="btn btn-ghost lv3d-coro-btn" aria-pressed="false"',
    '<button type="button" class="btn btn-ghost lv3d-coro-btn lv3d-vista" aria-pressed="false"')]),
 ('34 el 3D abre con Coronarias PRENDIDO', 'TC-783',
  [('                coro:false, coroDom:0, coroVista:null, coroTransp:false,',
    '                coro:true, coroDom:0, coroVista:null, coroTransp:false,')]),
 ('35 apagar NO reinicia las letras', 'TC-783',
  [('  _lv3d.coroLetras = true; _lv3d.coroAngio = false; _lv3d.coroLista = false;',
    '  _lv3d.coroAngio = false; _lv3d.coroLista = false;')]),
 ('36 apagar reinicia TAMBIEN la dominancia, que el pedido dice que queda', 'TC-783',
  [('function lv3dCoroApagar(){\n  _lv3d.coro = false; _lv3d.coroVista = null; _lv3d.coroTransp = false;',
    'function lv3dCoroApagar(){\n  _lv3d.coroDom = 0;\n  _lv3d.coro = false; _lv3d.coroVista = null; _lv3d.coroTransp = false;')]),
 ('37 Nuevo estudio deja Coronarias prendido', 'TC-783',
  [('  _lv3d.coroDom = 0;\n  lv3dCoroApagar();\n  lv3dModoUI(true);',
    '  _lv3d.coroDom = 0;\n  lv3dModoUI(true);')]),
 ('38 las septales ganan letra y dejan de ser siete', 'TC-783',
  [("    d.push({ g:'DA', w:'septal', p:[P(t,34,1.0), P(t+0.01,50,0.88), P(t+0.02,66,0.76)] });",
    "    d.push({ g:'DA', n:'S', f:0.5, w:'septal', p:[P(t,34,1.0), P(t+0.01,50,0.88), P(t+0.02,66,0.76)] });")]),
 ('39 la posterolateral pierde su letra', 'TC-783',
  [("  d.push({ g:oPL, n:'PL', f:0.8, w:'fina',",
    "  d.push({ g:oPL, f:0.8, w:'fina',")]),
 ('40 el panel pierde una de sus tres filas', 'TC-783',
  [('                    <div class="lv3d-coro-fila">\n                      <button type="button" class="btn btn-ghost lv3d-coro-transp"',
    '                    <div class="lv3d-coro-fila" hidden>\n                      <button type="button" class="btn btn-ghost lv3d-coro-transp"')]),
 ('41 la lista de vistas pierde una de las seis', 'TC-783',
  [('                        <button type="button" class="btn btn-ghost lv3d-coro-v" data-v="5">OAI (CD)</button>\n',
    '')]),
 ('42 los botones del panel bajan de los 44 px', 'TC-783',
  [('#lv3d-coro-panel .btn{white-space:normal;min-height:44px;font-size:11px;text-align:center;padding:4px 6px;}',
    '#lv3d-coro-panel .btn{white-space:normal;min-height:30px;font-size:11px;text-align:center;padding:4px 6px;}')]),
 ('43 la leyenda del pie pierde las letras', 'TC-783',
  [('DA descendente anterior &middot; D diagonales &middot; Cx circunfleja',
    'Las arterias se dibujan segun el territorio')]),
 ('44 la dominancia izquierda deja la descendente posterior en la CD', 'TC-784',
  [("  const oPDA = (dom === 2) ? 'Cx' : 'CD';",
    "  const oPDA = 'CD';")]),
 ('45 la codominancia deja la posterolateral en la CD', 'TC-784',
  [("  const oPL  = (dom === 0) ? 'CD' : 'Cx';",
    "  const oPL  = 'CD';")]),
 ('46 la dominancia derecha no agrega su rama distal', 'TC-784',
  [("  if (dom === 0){ d.push({ g:'CD', w:'fina', p:[P(0.02,168), P(0.02,188), P(0.04,208), P(0.05,225)] }) }",
    "  if (dom === 9){ d.push({ g:'CD', w:'fina', p:[P(0.02,168), P(0.02,188), P(0.04,208), P(0.05,225)] }) }")]),
 ('47 dos vistas de angiografia comparten el mismo angulo', 'TC-784',
  [("  { n:'OAD craneal', a:-30, b: 20 }, { n:'OAI craneal', a: 40, b: 30 },",
    "  { n:'OAD craneal', a:-30, b:-25 }, { n:'OAI craneal', a: 40, b: 30 },")]),
 ('48 el boton de la vista no pasa a decir «Vista: …»', 'TC-784',
  [("    vb.textContent = (v === null) ? 'Vista de angiograf\u00eda' : ('Vista: ' + LV3D_CORO_VISTAS[v].n);",
    "    vb.textContent = 'Vista de angiograf\u00eda';")]),
 ('49 girar con el dedo NO suelta la vista elegida', 'TC-784',
  [('    if (_lv3d.coroVista !== null) lv3dCoroSoltarVista();',
    '    if (false) lv3dCoroSoltarVista();')]),
 ('50 elegir una punta NO suelta la vista elegida', 'TC-784',
  [('    lv3dCoroSoltarVista();\n  }));',
    '  }));')]),
 ('51 la linea «Vista simulada, aproximada.» se ve siempre', 'TC-783',
  [("  if (vt) vt.style.display = (_lv3d.coroVista === null) ? 'none' : 'block';",
    "  if (vt) vt.style.display = 'block';")]),
 ('52 las arterias dejan de seguir el latido: se calculan en fin de diastole', 'TC-785',
  [('    const co = lv3dCoroSegmentos(_lv3d.fase, _lv3d.G, _L);',
    '    const co = lv3dCoroSegmentos(0, _lv3d.G, _L);')]),
 ('53 las arterias se despegan de la pared: el factor radial se ignora', 'TC-785',
  [('  const r = anillo[j]*(k === undefined ? 1.03 : k);',
    '  const r = anillo[j]*1.03;')]),
 ('54 el tramo gris deja de acotarse al largo de la arteria', 'TC-785',
  [('    eff[g] = (e && e.niv) ? Math.min(e.niv.c, Math.max(0, (tMax[g] || 0) - 0.1)) : null;\n  });\n  const angio',
    '    eff[g] = (e && e.niv) ? e.niv.c : null;\n  });\n  const angio')]),
 ('55 el tramo gris se pinta sin alteraciones', 'TC-785',
  [("  ['DA', 'Cx', 'CD'].forEach(function (g){\n    const e = dat.por[g];\n    eff[g] = (e && e.niv) ? Math.min(e.niv.c, Math.max(0, (tMax[g] || 0) - 0.1)) : null;\n  });\n  defs.forEach(function (df, idx){",
    "  ['DA', 'Cx', 'CD'].forEach(function (g){\n    const e = dat.por[g];\n    eff[g] = 0;\n  });\n  defs.forEach(function (df, idx){")]),
 ('56 la interpolacion pierde los puntos intermedios y la arteria queda recta', 'TC-785',
  [('const LV3D_CORO_MUESTRAS = 22;',
    'const LV3D_CORO_MUESTRAS = 1;')]),
 ('57 el bloque de arterias llega al Excel con una columna nueva', 'TC-782,TC-786',
  [('              <div id="contr-arterias" style="margin-top:7px;">',
    '              <div id="contr-arterias" style="margin-top:7px;"><input type="text" id="contr_arterias_txt" value="">')]),
 ('58 el panel de coronarias gana un select que limpiarCampos barre', 'TC-786',
  [('                    <div class="lv3d-coro-fila">\n                      <button type="button" class="btn btn-primary lv3d-coro-dom" data-d="0"',
    '                    <div class="lv3d-coro-fila"><select id="coro_dom_sel"><option value=""></option></select>\n                      <button type="button" class="btn btn-primary lv3d-coro-dom" data-d="0"')]),
 ('59 el lineJoin no se restituye y el dibujo no vuelve al pixel exacto', 'TC-783',
  [("      ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';",
    "      ctx.lineCap = 'butt';")]),
 ('60 la pertenencia de los segmentos se escribe a mano y deja de salir de CONTR_TERRITORIO', 'TC-782',
  [('    const crudo = CONTR_TERRITORIO_NOMBRE[CONTR_TERRITORIO[id]];\n    if (!crudo) continue;\n    const nom = CONTR_ART_ROTULO[crudo] || crudo;\n    if (orden.indexOf(nom) < 0){ orden.push(nom); out.por[nom] = { segs: [], min: null, niv: null } }',
    "    const crudo = (s <= 2 || s === 7 || s === 8 || s >= 13) ? 'DA' : (s <= 4 || s === 9 || s === 10 ? 'CD' : 'CX');\n    if (!crudo) continue;\n    const nom = CONTR_ART_ROTULO[crudo] || crudo;\n    if (orden.indexOf(nom) < 0){ orden.push(nom); out.por[nom] = { segs: [], min: null, niv: null } }")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 else None
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
