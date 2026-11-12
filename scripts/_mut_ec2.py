#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_ec2.py - barrido de mutaciones dirigidas de la tanda ECO-CONECTOR-2 (2026-11-12).
Calcado de _mut_p37.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

LAS CINCO QUE LA ORDEN PIDE son la 01 a la 05; las otras rompen, una por una, las decisiones de
fondo del panel compacto, del sondeo, de la agrupacion, de la bandeja y de la regla de paciente.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')
orig = open(IDX, encoding='utf-8').read()

MUT = [
 # ══ LAS CINCO QUE LA ORDEN PIDE ═══════════════════════════════════════════════════════════
 ('01 confirmar a CeiboLink AL ADJUNTAR en vez de al guardar', 'TC-848,TC-849',
  [("      _clnkPorConfirmar.push(l[i]);\n      ok++;",
    "      _clnkPorConfirmar.push(l[i]);\n      try { clnkConfirmarPersistidas(); } catch (e) {}\n      ok++;")]),
 ('02 la imagen entra SIN pasar por mediosImportar', 'TC-848',
  [("      await mediosImportar([_clnkArchivo(buf, l[i] + '.dcm')], undefined, 'ceibolink');",
    "      { var _d = _dcmImgLeer(buf); var _b = new Blob([_d.frags[0]], { type:'image/jpeg' });\n        imgCompressLoad(_b, undefined, 'ceibolink'); await new Promise(function(r){ setTimeout(r, 400); }); }")]),
 ('03 se puede guardar sin paciente con imagenes de CeiboLink', 'TC-851',
  [("  if (_clnkExige && (!nombre || !ci)) {", "  if (false && _clnkExige && (!nombre || !ci)) {")]),
 ('04 el apodo del equipo entra como HTML', 'TC-844,TC-837',
  [("  nom.textContent = apodo || String((eq && eq.aet) || id || 'Equipo');",
    "  nom.innerHTML = apodo || String((eq && eq.aet) || id || 'Equipo');")]),
 ('05 el repintado BORRA una parte estatica del panel', 'TC-844',
  [("  ['cfg-clnk-det-conexion', 'cfg-clnk-det-equipos', 'cfg-clnk-det-ajustes'].forEach(function (id) {\n    var e = document.getElementById(id);\n    if (e) { e.style.display = 'none'; try { e.open = false; } catch (x) {} }\n  });",
    "  ['cfg-clnk-det-conexion', 'cfg-clnk-det-equipos', 'cfg-clnk-det-ajustes'].forEach(function (id) {\n    var e = document.getElementById(id);\n    if (e) { e.textContent = ''; e.style.display = 'none'; }\n  });")]),
 # ══ EL PANEL COMPACTO ═════════════════════════════════════════════════════════════════════
 # ⚠️ LA PRIMERA VERSION DE ESTA MUTACION ERA EQUIVALENTE Y SOBREVIVIO: poner `open` en el
 # MARCADO no alcanza, porque `_clnkEsconderDependientes` hace `e.open = false` antes de la
 # primera lectura y lo borra. Medido. La de hoy ataca donde se decide el estado al MOSTRARLO.
 ('06 los plegables se ABREN al mostrarse', 'TC-842',
  [("  if (det) det.style.display = '';\n  var d = r.datos || {};\n  cont.appendChild(_clnkNodo('p'",
    "  if (det) { det.style.display = ''; try { det.open = true; } catch (e) {} }\n  var d = r.datos || {};\n  cont.appendChild(_clnkNodo('p'")]),
 ('07 el renglon que se toca pierde su piso de 44 px', 'TC-842',
  [("  .clnk-det > summary { cursor:pointer; list-style:none; display:flex; align-items:center;\n                        gap:8px; min-height:44px; padding:0 10px; font-size:12px;",
    "  .clnk-det > summary { cursor:pointer; list-style:none; display:flex; align-items:center;\n                        gap:8px; min-height:20px; padding:0 10px; font-size:12px;")]),
 ('08 Desvincular vuelve a estar suelto arriba, fuera de Ajustes', 'TC-842',
  [('              <div id="cfg-clnk-bloque-desvincular" style="display:none;margin-top:11px;',
    '              <div id="cfg-clnk-bloque-desvincular-X" style="display:none;margin-top:11px;')]),
 # ⚠️ LA PRIMERA VERSION USABA `order:9` Y SOBREVIVIO: `cfg-clnk-cuerpo` NO es un contenedor
 # flex, asi que `order` no mueve nada. Y la condicion mide el ORDEN DEL DOM -- con
 # compareDocumentPosition-- justamente para no depender del estilo. La de hoy mueve el nodo.
 ('09 el codigo de vinculacion deja de ser lo primero y baja al final', 'TC-842',
  [("  var bd = document.getElementById('cfg-clnk-bloque-desvincular');",
    "  try { var _cu = document.getElementById('cfg-clnk-cuerpo'), _bv2 = document.getElementById('cfg-clnk-bloque-vincular');\n        if (_cu && _bv2) _cu.appendChild(_bv2); } catch (e) {}\n  var bd = document.getElementById('cfg-clnk-bloque-desvincular');")]),
 ('10 «Equipos» se abre SOLA siempre, haya pendiente o no', 'TC-843',
  [("  if (det && pend) { try { det.open = true; } catch (e) {} }",
    "  if (det) { try { det.open = true; } catch (e) {} }")]),
 ('11 «Equipos» NUNCA se abre sola, ni con un equipo esperando decision', 'TC-843',
  [("  if (det && pend) { try { det.open = true; } catch (e) {} }",
    "  if (det && false) { try { det.open = true; } catch (e) {} }")]),
 ('12 la ayuda de las acciones vuelve a repetirse debajo de CADA equipo', 'TC-843',
  [("  lista.forEach(function (eq) { _clnkFilaEquipo(cont, eq); });\n  /* ══ (d) LA AYUDA DE LAS ACCIONES, UNA SOLA Y PLEGABLE",
    "  lista.forEach(function (eq) { _clnkFilaEquipo(cont, eq);\n    cont.appendChild(_clnkNodo('div', 'font-size:10.5px;',\n      'Permitir deja pasar sus imagenes. Olvidar lo saca de la lista sin borrar nada.')); });\n  /* ══ (d) LA AYUDA DE LAS ACCIONES, UNA SOLA Y PLEGABLE")]),
 # ══ EL SONDEO ═════════════════════════════════════════════════════════════════════════════
 ('13 el sondeo no mira si la pestania esta oculta', 'TC-845',
  [("    if (document.hidden) return false;\n    return true;", "    return true;")]),
 ('14 el sondeo no mira si hay token', 'TC-845',
  [("    if (!clnkVinculado()) return false;\n    if (document.hidden) return false;",
    "    if (document.hidden) return false;")]),
 ('15 el sondeo no mira el interruptor ni el modo', 'TC-845',
  [("    if (!clnkActivo()) return false;\n    if (!clnkVinculado()) return false;",
    "    if (!clnkVinculado()) return false;")]),
 ('16 el sondeo pide la lista de imagenes SIEMPRE, haya pendientes o no', 'TC-845',
  [("    if ((Number(d.imagenes_pendientes) || 0) > 0) await clnkRevisarImagenes();",
    "    await clnkRevisarImagenes();")]),
 ('17 el sincronizador deja de ser idempotente y apila temporizadores', 'TC-845',
  [("  if (debe && !_clnkSondeoTimer) {", "  if (debe) {")]),
 # ══ LA AGRUPACION ═════════════════════════════════════════════════════════════════════════
 ('18 la agrupacion mira SOLO el equipo y no el tiempo', 'TC-846',
  [("    if (g && g.equipo === String(i.equipo || '') && isFinite(t) && isFinite(g.ultimo) &&\n        (t - g.ultimo) <= CLNK_VENTANA_MS) {",
    "    if (g && g.equipo === String(i.equipo || '')) {")]),
 ('19 la ventana se mide desde la PRIMERA del grupo y no desde la anterior', 'TC-846',
  [("        (t - g.ultimo) <= CLNK_VENTANA_MS) {", "        (t - g.primero) <= CLNK_VENTANA_MS) {")]),
 ('20 la agrupacion mira el tiempo y NO el equipo', 'TC-846',
  [("    if (g && g.equipo === String(i.equipo || '') && isFinite(t) && isFinite(g.ultimo) &&",
    "    if (g && isFinite(t) && isFinite(g.ultimo) &&")]),
 ('21 la ventana pasa de dos minutos a media hora', 'TC-846',
  [("var CLNK_VENTANA_MS = 120000;", "var CLNK_VENTANA_MS = 1800000;")]),
 # ══ EL AVISO ══════════════════════════════════════════════════════════════════════════════
 ('22 el aviso vuelve a salir por las MISMAS imagenes', 'TC-847',
  [("  g.ids.forEach(function (id) { _clnkAvisadas[id] = true; });", "  ;")]),
 ('23 el aviso se apila sobre otro que ya esta abierto', 'TC-847',
  [("  if (_clnkAvisoAbierto) return false;        // ya hay una pregunta en pantalla", "  ;")]),
 ('24 el aviso de equipo nuevo pierde su tercera salida', 'TC-847',
  [("     { txt: 'M\u00e1s tarde', fn: function () { clnkAvisoCerrar(); } }]);",
    "     { txt: '', fn: function () { clnkAvisoCerrar(); } }]);")]),
 # ⚠️ LA PRIMERA VERSION LLAMABA A UNA VARIABLE QUE NO EXISTE -- `_clnkUltGrupo`-- asi que el
 # `catch` se tragaba la mutacion entera y sobrevivia sin hacer nada. La de hoy descarta los ids
 # que el aviso acaba de marcar, que si existen.
 ('25 cerrar el aviso DESCARTA las imagenes en vez de dejarlas esperando', 'TC-847',
  [("function clnkAvisoCerrar() {\n  var ov = document.getElementById('clnkav-ov');",
    "function clnkAvisoCerrar() {\n  try { var _ids = Object.keys(_clnkAvisadas);\n        if (_ids.length) clnkDescartar(_ids); } catch (e) {}\n  var ov = document.getElementById('clnkav-ov');")]),
 # ══ CONFIRMAR ═════════════════════════════════════════════════════════════════════════════
 ('26 se confirma aunque la escritura de las imagenes haya FALLADO', 'TC-849',
  [("    if (ok && typeof clnkConfirmarPersistidas === 'function') {",
    "    if (typeof clnkConfirmarPersistidas === 'function') {")]),
 ('27 un fallo de confirmar se da por borrado y el id se pierde', 'TC-849',
  [("    } else {\n      quedan.push(l[i]);\n    }", "    } else {\n      ok++;\n    }")]),
 ('28 el «verificada false» no se le dice al medico', 'TC-849',
  [("      if (r.datos && r.datos.verificada === false) sinVerificar++;", "      ;")]),
 # ══ LA BANDEJA ════════════════════════════════════════════════════════════════════════════
 ('29 la bandeja vive en la MISMA base que las imagenes de los estudios', 'TC-850',
  [("var CLNKB_DB = 'ceibomed_bandeja', CLNKB_STORE = 'sinestudio';",
    "var CLNKB_DB = 'ceibomed_img', CLNKB_STORE = 'sinestudio';")]),
 ('30 guardar en la bandeja TAMBIEN mete la imagen en el estudio abierto', 'TC-850',
  [("    imgs.push({ dataURL: chico, clnkId: l[i] });",
    "    imgs.push({ dataURL: chico, clnkId: l[i] });\n    try { imgSlots[0] = { dataURL: chico, ampliada:false, calidad:'media', origen:'ceibolink' }; } catch (e) {}")]),
 ('31 la bandeja NO confirma, asi que la imagen queda duplicada en el conector', 'TC-850',
  [("  imgs.forEach(function (x) { _clnkPorConfirmar.push(x.clnkId); });\n  await clnkConfirmarPersistidas();", "  ;")]),
 ('32 la seccion de la bandeja gana un campo, y entra al censo del estudio', 'TC-850',
  [('        <div id="clnkb-lista"></div>',
    '        <div id="clnkb-lista"></div>\n        <input type="text" id="clnkb-nota">')]),
 # ══ LA REGLA DE PACIENTE ══════════════════════════════════════════════════════════════════
 ('33 la regla exige nombre O documento, como la de siempre', 'TC-851',
  [("  if (_clnkExige && (!nombre || !ci)) {", "  if (_clnkExige && (!nombre && !ci)) {")]),
 ('34 la regla alcanza a TODOS los estudios, no solo a los que tienen imagenes de CeiboLink', 'TC-851',
  [("  if (_clnkExige && (!nombre || !ci)) {", "  if (!nombre || !ci) {")]),
 ('35 el predicado solo mira la marca del slot y no la lista por confirmar', 'TC-851',
  [("    if (_clnkPorConfirmar.length) return true;", "    ;")]),
 ('36 el predicado solo mira la lista y no la marca del slot', 'TC-851',
  [("    if (typeof imgSlots !== 'undefined' && imgSlots.some(function (s) {\n      return s && s.dataURL && s.origen === 'ceibolink';\n    })) return true;", "    ;")]),
 ('37 el predicado falla ABIERTO: ante un error contesta que NO hay', 'TC-851',
  [("  } catch (e) { return true; }\n}\nwindow.clnkEstudioTieneImagenes = clnkEstudioTieneImagenes;",
    "  } catch (e) { return false; }\n}\nwindow.clnkEstudioTieneImagenes = clnkEstudioTieneImagenes;")]),
 ('38 el modal de cierre deja «Guardar y continuar» habilitada sin paciente', 'TC-851',
  [("    bg.disabled = _falta;", "    bg.disabled = false;")]),
 ('39 el modal de cierre apaga «Guardar» SIEMPRE, y se lleva la salida normal', 'TC-851',
  [("    bg.disabled = _falta;", "    bg.disabled = true;")]),
 ('40 el modal de cierre no dice que las imagenes siguen esperando', 'TC-851',
  [("  if (_falta && p) {", "  if (false && _falta && p) {")]),
 ('41 «Nuevo estudio» NO olvida los ids por confirmar', 'TC-848',
  [("  if (typeof clnkOlvidarPendientes === 'function') { try { clnkOlvidarPendientes(); } catch (e) {} }", "  ;")]),
 ('42 el paciente del DICOM PISA lo que el medico tipeo', 'TC-848',
  [("  if (String(el.value || '').trim() !== '') return false;", "  ;")]),
 ('43 el documento del paciente se escribe con el PatientID del DICOM', 'TC-848',
  [("    _clnkPonerSiVacio('sexo', _clnkSexo(d.pacSexo), puesto);",
    "    _clnkPonerSiVacio('sexo', _clnkSexo(d.pacSexo), puesto);\n    _clnkPonerSiVacio('ci', 'HC-0001', puesto);")]),
 ('44 el aviso de espacio no avisa nunca', 'TC-842',
  [("  if (frac >= CLNK_ESP_AMBAR) {", "  if (false) {")]),
 ('45 el umbral ambar del espacio se mueve al 99 %', 'TC-842',
  [("var CLNK_ESP_AMBAR = 0.85;", "var CLNK_ESP_AMBAR = 0.99;")]),
 # ══ EL AVISO NO SE SUPERPONE A OTRA PREGUNTA (salio de revisar el propio diff) ═══════════════
 ('46 el aviso se abre ENCIMA del modal de Nuevo estudio', 'TC-847',
  [("  if (clnkAvisoHayOtraPregunta()) return false;   // ni encima de otra: ver `clnkAvisoAbrir`", "  ;")]),
 ('47 el aviso de equipo nuevo se abre encima de otra pregunta', 'TC-847',
  [("  if (clnkAvisoHayOtraPregunta()) return false;   // ver `clnkAvisoAbrir`", "  ;")]),
 ('48 el detector de otra pregunta falla ABIERTO ante un error', 'TC-847',
  [("  } catch (e) { return 'error'; }      // falla CERRADO: ante la duda, no se superpone",
    "  } catch (e) { return ''; }")]),
]

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
    # ⚠️ LOS CHROME ZOMBIES SE JUNTAN Y CADA CORRIDA SALE MAS LENTA QUE LA ANTERIOR. Es la trampa
    # que este repo ya documenta para cdp.mjs: el servidor sigue escuchando y el event loop vivo,
    # asi que el arbol de Chrome no se cierra. Medido en la primera corrida de este barrido: la
    # cuarta mutacion tardaba cuatro veces lo que la primera. Se barren los del arbol de pruebas
    # -- NUNCA el Chrome del usuario, que no corre con --user-data-dir en /tmp.
    subprocess.run(['pkill', '-f', 'ecosmart-test-'], capture_output=True)
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
