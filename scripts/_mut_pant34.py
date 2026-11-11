#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant34.py - barrido de mutaciones dirigidas de la tanda PANT-34 (2026-11-11).
Calcado de _mut_pant33.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con --anclas ANTES de correr el barrido:
el barrido de PANT-20 se perdio una corrida entera por siete anclas escritas con secuencias
de escape en vez del caracter.

Rompe, una por una, cada decision de los commits 2 a 4: las nueve vistas con sus angulos, el
titulo fijo del boton, la tilde de la lista, el duenio unico del nombre, el rotulo dentro del
cuadro con su rincon y su restitucion del contexto, el reinicio al apagar, el filtro del selector
de arteria con su criterio de duenio, su independencia del territorio, su persistencia, y en
Referencias los cinco apartados, las casillas sin id, el cuadro oculto por clase, las dos notas
del pie, la franja intramural, el color por regla de CSS y la geometria de los rotulos.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── PARTE A · las nueve vistas y sus angulos ──────────────────────────────────────────────
 ('01 la tabla vuelve a tener SEIS vistas: las tres nuevas desaparecen', 'TC-813,TC-783,TC-784',
  [("  { n:'AP caudal',   a:  0, b:-30 }, { n:'Lateral',     a: 90, b:  0 },\n  { n:'OAD recta',   a:-30, b:  0 }\n]);",
    "  { n:'AP caudal',   a:  0, b:-30 }\n]);")]),
 ('02 OAD caudal vuelve al caudal 25 de la demo', 'TC-813',
  [("  { n:'OAD caudal',  a:-30, b:-30 }, { n:'OAI caudal',  a: 50, b:-30 },",
    "  { n:'OAD caudal',  a:-30, b:-25 }, { n:'OAI caudal',  a: 50, b:-30 },")]),
 ('03 OAI caudal vuelve al OAI 40 de la demo', 'TC-813',
  [("{ n:'OAI caudal',  a: 50, b:-30 },", "{ n:'OAI caudal',  a: 40, b:-30 },")]),
 ('04 PA craneal vuelve al craneal 30 de la demo', 'TC-813',
  [("  { n:'PA craneal',  a:  0, b: 40 }, { n:'OAI (CD)',    a: 40, b:  0 },",
    "  { n:'PA craneal',  a:  0, b: 30 }, { n:'OAI (CD)',    a: 40, b:  0 },")]),
 ('05 Lateral deja de ser lateral de 90 grados', 'TC-813',
  [("{ n:'Lateral',     a: 90, b:  0 },", "{ n:'Lateral',     a: 60, b:  0 },")]),
 ('06 OAD recta gana angulacion: deja de ser una rotacion sola', 'TC-813',
  [("  { n:'OAD recta',   a:-30, b:  0 }\n]);", "  { n:'OAD recta',   a:-30, b: 20 }\n]);")]),
 ('07 el titulo del boton vuelve a decir «Vista: …», como hasta PANT-33', 'TC-813,TC-784',
  [("    vb.textContent = 'Vista de angiograf\\u00eda';",
    "    vb.textContent = (v === null) ? 'Vista de angiograf\\u00eda' : ('Vista: ' + LV3D_CORO_VISTAS[v].n);")]),
 ('08 la tilde de la opcion activa no se pone', 'TC-813,TC-784',
  [("    bb.textContent = (sel ? '\\u2713 ' : '') + nom;", "    bb.textContent = nom;")]),
 ('09 el nombre de la opcion deja de salir de la tabla: se escribe a mano', 'TC-813',
  [("    const nom = (LV3D_CORO_VISTAS[i] && LV3D_CORO_VISTAS[i].n) || bb.textContent;",
    "    const nom = 'Vista ' + (i + 1);")]),
 # ── PARTE A · el rotulo dentro del cuadro ─────────────────────────────────────────────────
 ('10 el rotulo de la vista no se dibuja', 'TC-814,TC-820',
  [("  if (_lv3d.coro && _lv3d.coroVista !== null && LV3D_CORO_VISTAS[_lv3d.coroVista]){",
    "  if (false && _lv3d.coro && _lv3d.coroVista !== null && LV3D_CORO_VISTAS[_lv3d.coroVista]){")]),
 ('11 el rotulo se dibuja tambien SIN vista elegida', 'TC-814,TC-820',
  [("  if (_lv3d.coro && _lv3d.coroVista !== null && LV3D_CORO_VISTAS[_lv3d.coroVista]){\n    ctx.save();",
    "  if (_lv3d.coro){\n    ctx.save();")]),
 ('12 el rotulo escribe una cadena FIJA en vez del nombre de la vista', 'TC-814',
  [("    const rot = LV3D_CORO_VISTAS[_lv3d.coroVista].n;", "    const rot = 'Angiografia';")]),
 ('13 el rotulo se va al rincon IZQUIERDO, encima de la brujula', 'TC-814',
  [("    ctx.strokeText(rot, W - 14, oy + 4);\n    ctx.fillStyle = _coroAngio ? '#f0f0f0' : pal.texto;\n    ctx.fillText(rot, W - 14, oy + 4);",
    "    ctx.strokeText(rot, 120, oy + 4);\n    ctx.fillStyle = _coroAngio ? '#f0f0f0' : pal.texto;\n    ctx.fillText(rot, 120, oy + 4);")]),
 ('14 el rotulo NO restituye el contexto: el textAlign queda puesto para los cuadros siguientes', 'TC-783,TC-814',
  [("    ctx.fillText(rot, W - 14, oy + 4);\n    ctx.restore();", "    ctx.fillText(rot, W - 14, oy + 4);")]),
 ('15 apagar «Coronarias» deja de reiniciar el selector de arteria', 'TC-814',
  [("  _lv3d.coroArt = 'todas'; _lv3d.coroListaArt = false;\n  lv3dCoroUI();",
    "  _lv3d.coroListaArt = false;\n  lv3dCoroUI();")]),
 # ── PARTE C · el selector de arteria ──────────────────────────────────────────────────────
 ('16 el filtro del selector no se aplica: se dibuja todo siempre', 'TC-815',
  [("  return lv3dCoroFiltrar(d);", "  return d;")]),
 ('17 el criterio de lado se da vuelta: la coronaria derecha pasa a ser de la izquierda', 'TC-815',
  [("function lv3dCoroLado(g){ return (g === 'CD') ? 'der' : 'izq' }",
    "function lv3dCoroLado(g){ return (g === 'CD') ? 'izq' : 'der' }")]),
 ('18 el lado sale de una lista propia que NO sigue la dominancia', 'TC-815',
  [("function lv3dCoroLado(g){ return (g === 'CD') ? 'der' : 'izq' }\nfunction lv3dCoroFiltrar(d){",
    "function lv3dCoroLado(g){ return (g === 'CD') ? 'der' : 'izq' }\nfunction lv3dCoroLadoFijo(df){ return (df.n === 'DP' || df.n === 'PL' || df.g === 'CD') ? 'der' : 'izq' }\nfunction lv3dCoroFiltrar(d){"),
   ("  return d.filter(function (df){ return lv3dCoroLado(df.g) === sel });",
    "  return d.filter(function (df){ return lv3dCoroLadoFijo(df) === sel });")]),
 ('19 el filtro deja pasar las arterias con letra: la letra sobrevive al lado', 'TC-815',
  [("  return d.filter(function (df){ return lv3dCoroLado(df.g) === sel });",
    "  return d.filter(function (df){ return !!df.n || lv3dCoroLado(df.g) === sel });")]),
 ('20 el titulo del boton «Arteria» pasa a decir el lado elegido', 'TC-815',
  [("    ab.textContent = 'Arteria';", "    ab.textContent = 'Arteria: ' + (_lv3d.coroArt || 'todas');")]),
 ('21 la tilde del selector de arteria no se pone', 'TC-815',
  [("    bb.textContent = (sel ? '\\u2713 ' : '') + ((e && e.n) || bb.textContent);",
    "    bb.textContent = ((e && e.n) || bb.textContent);")]),
 ('22 la lista del selector de arteria nace ABIERTA', 'TC-815',
  [("  if (listaA) listaA.style.display = (on && _lv3d.coroListaArt) ? 'flex' : 'none';",
    "  if (listaA) listaA.style.display = on ? 'flex' : 'none';")]),
 ('23 el boton «Arteria» sale de la fila de la vista y se va a una fila propia', 'TC-815,TC-783',
  [("#lv3d-coro-caja{display:flex;gap:4px;}\n.lv3d-coro-dd{position:relative;flex:1 1 0;min-width:0;}",
    "#lv3d-coro-caja{display:block;}\n.lv3d-coro-dd{position:relative;}")]),
 ('24 elegir un lado repinta la contractilidad entera', 'TC-816',
  [("    _lv3d.coroArt = b.getAttribute('data-a') || 'todas';\n    _lv3d.coroListaArt = false;",
    "    _lv3d.coroArt = b.getAttribute('data-a') || 'todas';\n    _lv3d.coroListaArt = false;\n    try { contrSetSegmento(Object.keys(CONTR_TERRITORIO)[0], 2) } catch (e) {}")]),
 ('25 elegir un lado cambia el modo de color del 3D', 'TC-816',
  [("    _lv3d.coroArt = b.getAttribute('data-a') || 'todas';\n    _lv3d.coroListaArt = false;\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();",
    "    _lv3d.coroArt = b.getAttribute('data-a') || 'todas';\n    _lv3d.coroListaArt = false;\n    try { lv3dSetModo('territorio') } catch (e) {}\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();")]),
 ('26 el selector se SUELTA al elegir una vista', 'TC-816',
  [("    _lv3d.R = lv3dCoroMatriz(LV3D_CORO_VISTAS[_lv3d.coroVista]);\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();",
    "    _lv3d.R = lv3dCoroMatriz(LV3D_CORO_VISTAS[_lv3d.coroVista]);\n    _lv3d.coroArt = 'todas';\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();")]),
 ('27 el selector se SUELTA al cambiar de dominancia', 'TC-816',
  [("    _lv3d.coroDom = Number(b.getAttribute('data-d')) || 0;\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();",
    "    _lv3d.coroDom = Number(b.getAttribute('data-d')) || 0;\n    _lv3d.coroArt = 'todas';\n    lv3dCoroUI(); if (_lv3d.abierto) lv3dDibujar();")]),
 # ── PARTE B · el esquema de Referencias ───────────────────────────────────────────────────
 ('28 el esquema pierde la marca data-ref-solo: el globo otr-rac se lo lleva puesto', 'TC-817,TC-779',
  [('      <div data-ref-solo="1" class="rac-root" id="rac-root">',
    '      <div class="rac-root" id="rac-root">')]),
 ('29 una casilla gana un id: entra en el barrido de «Nuevo estudio»', 'TC-817',
  [('<input type="checkbox" data-rac="R">', '<input type="checkbox" id="rac-fist-r" data-rac="R">')]),
 ('30 falta un apartado: la fistula coronaria desaparece', 'TC-817',
  [('<div class="rac-ap" data-rac-ap="fistula">', '<div class="rac-ap" data-rac-no="fistula">')]),
 ('31 el cuadro se oculta con el atributo hidden y no con la clase', 'TC-817,TC-818',
  [(".rac-oculto{display:none;}", ".rac-oculto{}"),
   ("  caja.classList.toggle('rac-oculto', !hay);",
    "  caja.classList.toggle('rac-oculto', !hay); if (hay) caja.removeAttribute('hidden'); else caja.setAttribute('hidden', '');")]),
 ('32 el cuadro se ve SIEMPRE, con las dieciocho casillas destildadas', 'TC-817,TC-818',
  [("  caja.classList.toggle('rac-oculto', !hay);", "  caja.classList.toggle('rac-oculto', false);")]),
 ('33 la nota que pide tildar un camino no aparece', 'TC-818',
  [("    if (!T.pre && !T.retro && !T.inter) nota = RAC_NOTA_CAM;", "    /* sin la nota */")]),
 ('34 la nota que pide el origen y la desembocadura de la fistula no aparece', 'TC-818',
  [("    } else { nota = RAC_NOTA_FIS }", "    }")]),
 ('35 la fistula dibuja con el origen solo, sin exigir la desembocadura', 'TC-818',
  [("      dest.forEach(function (d){\n        const via = RAC_FIST.via[o + '-' + d];",
    "      (dest.length ? dest : ['ad']).forEach(function (d){\n        const via = RAC_FIST.via[o + '-' + d];")]),
 ('36 la franja del tramo intramural no se dibuja', 'TC-818',
  [("      _racLinea(svg, _racPared(A.intra), 'rac-c-intra', 9, null, '0.55');\n      ley.push({ k:'intra', v:'intra', t:RAC_LEY.intra });",
    "      ley.push({ k:'intra', v:'intra', t:RAC_LEY.intra });")]),
 ('37 el color del trazo pasa a ir en un ATRIBUTO con var(): cae en el negro heredado', 'TC-819',
  [("  const e = _racEl('path', { d:_racSpline(puntos), class:'rac-l ' + clase, 'stroke-width':ancho });",
    "  const e = _racEl('path', { d:_racSpline(puntos), class:'rac-l', stroke:'var(--rac-pre)', 'stroke-width':ancho });")]),
 ('38 el rotulo del flujo invertido vuelve al anclaje de inicio y se sale del lienzo', 'TC-819',
  [("    svg.appendChild(_racTxt(318, 150, 'flujo invertido', 'rac-rot-a', 'end'));",
    "    svg.appendChild(_racTxt(318, 150, 'flujo invertido', 'rac-rot-a', 'start'));")]),
 ('39 el rotulo de la aorta vuelve al centro del circulo y se encima con los senos', 'TC-819',
  [("  svg.appendChild(_racTxt(B.ao.cx, B.ao.cy + 48, B.ao.rot, 'rac-rot', 'middle'));",
    "  svg.appendChild(_racTxt(B.ao.cx, B.ao.cy, B.ao.rot, 'rac-rot', 'middle'));")]),
 ('40 el lienzo deja de ser 400 por 360', 'TC-819',
  [("const RAC_VB = { w:400, h:360 };", "const RAC_VB = { w:380, h:340 };")]),
 ('41 el tema claro pierde su paleta: un solo juego de colores para los dos temas', 'TC-819',
  [("    --rac-pre: #2f6fd0;\n    --rac-retro: #1f8f86;", "    --rac-retro: #1f8f86;")]),
 ('42 el pie que dice como se lee el esquema desaparece', 'TC-817',
  [(".rac-pie{margin-top:6px;font-size:9.5px;color:var(--text2);line-height:1.45;}",
    ".rac-pie{display:none;}")]),
 ('43 la leyenda de colores sale vacia', 'TC-818',
  [("  hostSvg.appendChild(svg);\n  _racLeyenda(hostLey, ley);", "  hostSvg.appendChild(svg);\n  _racLeyenda(hostLey, []);")]),
 ('44 el oyente de las casillas no se cablea: tildar una no dibuja nada', 'TC-818',
  [("  raiz.addEventListener('change', function (e){", "  if (false) raiz.addEventListener('change', function (e){")]),
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
