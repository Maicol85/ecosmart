#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_ec5.py - barrido de mutaciones dirigidas de la tanda ECO-CONECTOR-5 (2026-11-13).
Calcado de _mut_ec4.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

LAS OCHO QUE LA ORDEN PIDE son la 01 a la 08, en su orden.
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

 # ══ LAS OCHO QUE LA ORDEN PIDE, EN SU ORDEN ══════════════════════════════════════════════
 # (1) QUE LA VISTA PREVIA CONFIRME ALGO EN CEIBOLINK. Mirar no es decidir: con esto, abrir la
 #     tira le pide al conector que borre lo que todavia no entro a ningun estudio.
 ('01 la vista previa CONFIRMA en CeiboLink lo que mira', 'TC-878',
  [("      var b2 = await _clnkPrevBajar(it.id);\n      if (gen !== _clnkPrevGen) return;",
    "      var b2 = await _clnkPrevBajar(it.id);\n      _clnkPorConfirmar.push(it.id);\n      try { await clnkConfirmarPersistidas(); } catch (e) {}\n      if (gen !== _clnkPrevGen) return;")]),

 # (2) QUE LA VISTA PREVIA BAJE UN PESADO SIN EL BOTON. La primera de las dos puertas deja de
 #     existir, asi que una tira de ocho archivos de 350 MB se baja sola.
 ('02 la vista previa baja un archivo PESADO sin el boton', 'TC-877',
  [("      if ((Number(it.bytes) || 0) > _clnkPrevTopeArchivo()) {",
    "      if (false) {")]),

 # (3) QUE «ELIMINAR» BORRE TAMBIEN OTRAS IMAGENES DEL ESTUDIO. Con el conjunto ignorado, el
 #     primer borrado se lleva el registro entero del paciente.
 ('03 «Eliminar» borra TODAS las imagenes del estudio y no la elegida', 'TC-879',
  [("          const imgs = imgs0.filter((x, i) => !set.has(i));",
    "          const imgs = [];")]),

 # (4) QUE «ADJUNTAR» MUEVA EN VEZ DE COPIAR. El original se borra: es la perdida de la unica
 #     copia, que esta casa ya pago una vez.
 ('04 «Adjuntar a un estudio guardado» MUEVE: borra el original', 'TC-880',
  [("      try { n = await CeiboImg.agregar(dest, slots); } catch (e) { n = 0; }",
    "      try { n = await CeiboImg.agregar(dest, slots); } catch (e) { n = 0; }\n      try { await CeiboImg.quitar(L[0].uuid, L.map(e => e.idx)); } catch (e) {}")]),

 # (5) QUE «ADJUNTAR A UN ESTUDIO GUARDADO» ESCRIBA EN EL ESTUDIO EQUIVOCADO. La fuga entre
 #     pacientes: la imagen de uno termina en el informe firmado de otro.
 ('05 «Adjuntar a un estudio guardado» escribe en el estudio EQUIVOCADO', 'TC-880',
  [("    const dest = String(inf.uuid || '');",
    "    const dest = String((getInformes()[2] || inf).uuid || '');")]),

 # (6) EL NOMBRE DEL ESTUDIO COMO HTML EN UN DIALOGO NUEVO. Lo escribio una persona y puede
 #     traer cualquier cosa; el resumen es justo donde se lee un nombre de estudio.
 ('06 el resumen muestra su detalle como HTML en vez de texto', 'TC-871,TC-880',
  [("      var p = document.createElement('div');\n      p.style.cssText = 'margin:0 0 7px;';\n      /* `textContent` y nada más: acá entran nombres de archivo del ecógrafo y nombres de\n         estudio que escribió una persona. */\n      p.textContent = '· ' + String(t);",
    "      var p = document.createElement('div');\n      p.style.cssText = 'margin:0 0 7px;';\n      p.innerHTML = '· ' + String(t);")]),

 # (7) QUE «EXPORTAR» INCLUYA LO QUE NO SE ELIGIO. El archivo sale con imagenes de pacientes
 #     que el medico no eligio mandar a ninguna parte.
 ('07 «Exportar» mete TODAS las imagenes del estudio y no las elegidas', 'TC-881',
  [("      let dus = null;\n      try { dus = await _igSelBlobs(u, ix); } catch (e) { dus = null; }",
    "      let dus = null;\n      try { dus = await igImgBlobs(u); } catch (e) { dus = null; }")]),

 # (8) QUE EL PANEL NO SE ACTUALICE TRAS UNA ACCION. Es el defecto que el medico reporto:
 #     tuvo que apretar «Actualizar» para ver el numero verdadero.
 ('08 el panel NO se actualiza tras una accion', 'TC-873',
  [("function clnkRefrescar() {\n  if (!clnkActivo()) return false;",
    "function clnkRefrescar() {\n  if (true) return false;\n  if (!clnkActivo()) return false;")]),

 # ══ «VER LO QUE ESPERA» Y EL PANEL ════════════════════════════════════════════════════════
 ('09 el boton NO ignora lo ya avisado: no reabre nada', 'TC-872',
  [("  var grupos = forzar ? todos : todos.filter(function (g) {",
    "  var grupos = todos.filter(function (g) {")]),
 ('10 sin nada esperando se queda callado', 'TC-872',
  [("    clnkAvisoAbrir('No hay nada esperando',",
    "    if (false) clnkAvisoAbrir('No hay nada esperando',")]),
 ('11 un equipo por decidir se informa como «no hay nada»', 'TC-872',
  [("  var esp = Number(d.equipos_esperando) || 0;\n  var pen = Number(d.imagenes_pendientes) || 0;\n  if (esp > 0) {",
    "  var esp = Number(d.equipos_esperando) || 0;\n  var pen = Number(d.imagenes_pendientes) || 0;\n  if (false) {")]),
 ('12 el panel pide estado con la tarjeta FUERA de la vista', 'TC-873',
  [("  if (!clnkPanelALaVista()) return false;\n  if (_clnkRefTimer) clearTimeout(_clnkRefTimer);",
    "  if (false) return false;\n  if (_clnkRefTimer) clearTimeout(_clnkRefTimer);")]),
 ('13 el refresco NO agrupa: cinco llamadas son cinco lecturas', 'TC-873',
  [("  if (_clnkRefTimer) clearTimeout(_clnkRefTimer);\n  _clnkRefTimer = setTimeout(function () {",
    "  _clnkRefTimer = setTimeout(function () {")]),
 ('14 confirmar deja de repintar el panel', 'TC-873',
  [("  /* Decisión 2. Confirmar es la acción que más cambia los números: lo confirmado se BORRA en el\n     conector, así que «3 imágenes esperando» pasa a «sin imágenes esperando» y el espacio usado\n     baja. Es exactamente el número que el médico veía viejo. */\n  try { clnkRefrescar(); } catch (e) {}",
    "  try { } catch (e) {}")]),

 # ══ LA FECHA ══════════════════════════════════════════════════════════════════════════════
 ('15 la fecha se compara restando 24 horas en vez de por dia local', 'TC-873',
  [("    var dias = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };\n    var delta = Math.round((dias(hoy) - dias(d)) / 86400000);",
    "    var delta = Math.floor((hoy.getTime() - d.getTime()) / 86400000);")]),
 ('16 el aviso vuelve a decir solo la hora', 'TC-873',
  [("    texto: _clnkAvisoTexto(g, nom, _clnkCuando(g.primero))",
    "    texto: _clnkAvisoTexto(g, nom, 'a las ' + _clnkHora(g.primero))")]),
 ('17 de hoy tambien dice la fecha', 'TC-873',
  [("    if (delta === 0) return 'a las ' + hora;",
    "    if (false) return 'a las ' + hora;")]),

 # ══ LOS DIALOGOS Y LOS DOS PESOS ══════════════════════════════════════════════════════════
 ('18 la pregunta vuelve a ser un confirm nativo', 'TC-874',
  [("  const r = await clnkAvisoPreguntar('¿Abrir un archivo pesado?',",
    "  const r = ((typeof confirm === 'function') && confirm('pesado')) ? 'abrir' : 'esperar';\n  const _r2 = await clnkAvisoPreguntar('¿Abrir un archivo pesado?',")]),
 ('19 la pregunta no dice lo que ocupara guardado', 'TC-874,TC-865',
  [("  return dstMB(bytes) + ' sin comprimir · unos ' + dstMB(_dcmGuardadoEstimado(bytes)) +\n         ' guardado (estimado)';",
    "  return dstMB(bytes);")]),
 ('20 la estimacion de lo guardado es IGUAL al crudo', 'TC-874',
  [("const DCM_GUARDADO_DIV = 4;",
    "const DCM_GUARDADO_DIV = 1;")]),
 ('21 el resumen final no abre: el medico no se entera', 'TC-874,TC-862',
  [("function dstResumen(o) {\n  var d = o || {};",
    "function dstResumen(o) {\n  if (true) return false;\n  var d = o || {};")]),
 ('22 los avisos de adentro NO se juntan: vuelven los dos cuadros', 'TC-874',
  [("  if (_dstJuntando) { _dstMsgs.push(t); return true; }",
    "  if (false) { _dstMsgs.push(t); return true; }")]),
 ('23 cerrar la pregunta con la X se toma como «abrir igual»', 'TC-874',
  [("  if (r === 'abrirTodos') { _dcmCrudoModoLote = 'abrir'; return { seguir: true }; }\n  if (r === 'abrir') return { seguir: true };",
    "  if (r === 'abrirTodos') { _dcmCrudoModoLote = 'abrir'; return { seguir: true }; }\n  if (r !== 'esperar' && r !== 'esperarTodos') return { seguir: true };")]),

 # ══ EL UMBRAL ADAPTATIVO ══════════════════════════════════════════════════════════════════
 ('24 el presupuesto mira la RAM y NO el techo del monton', 'TC-875',
  [("  return Math.min(porHeap, porRam) * 1048576;",
    "  return porRam * 1048576;")]),
 ('25 sin dato se asume el MEJOR equipo en vez del modesto', 'TC-875',
  [("const DCM_MEM_DEF_GIB = 4;",
    "const DCM_MEM_DEF_GIB = 64;")]),
 ('26 los dos topes dejan de depender de la memoria', 'TC-875',
  [("  return Math.max(DCM_DURO_PISO, _dcmPresupuestoBytes() / DCM_PICO_FACTOR);",
    "  return DCM_CRUDO_DURO;")]),
 ('27 el orden entre el blando y el duro se puede invertir', 'TC-875,TC-866',
  [("function _dcmCrudoTopeDuro() {\n  return Math.max(_dcmTopeDuroCrudo(), _dcmTopeBlandoCrudo());\n}",
    "function _dcmCrudoTopeDuro() {\n  return _dcmTopeDuroCrudo();\n}")]),
 ('28 por encima del duro se ofrece abrir igual', 'TC-875,TC-866',
  [("  if (bytes > _dcmCrudoTopeDuro()) {\n    /* ⚠️ ARRIBA DEL TOPE DURO NO SE PREGUNTA NADA",
    "  if (false) {\n    /* ⚠️ ARRIBA DEL TOPE DURO NO SE PREGUNTA NADA")]),
 ('29 el pico se estima igual al crudo: el tope duro se duplica', 'TC-875',
  [("const DCM_PICO_FACTOR = 1.8;",
    "const DCM_PICO_FACTOR = 1;")]),

 # ══ LA ELECCION PARA TODA LA TANDA ════════════════════════════════════════════════════════
 ('30 «para todos» no se recuerda: se pregunta por cada uno', 'TC-876',
  [("  if (_dcmCrudoModoLote === 'abrir') return { seguir: true };",
    "  if (false) return { seguir: true };")]),
 ('31 la eleccion SOBREVIVE a la tanda siguiente', 'TC-876',
  [("function _dcmCrudoNuevoLote() { _dcmCrudoModoLote = null; return true; }",
    "function _dcmCrudoNuevoLote() { return true; }")]),
 ('32 los dos botones de «para todos» salen con UN solo archivo', 'TC-876',
  [("  const varios = (ctx && Number(ctx.total) > 1);",
    "  const varios = true;")]),
 ('33 el sumidero no abre tanda: la eleccion anterior decide', 'TC-876',
  [("function _dstJuntarAbrir() {\n  _dstJuntando = true;\n  _dstMsgs = [];\n  try { _dcmCrudoNuevoLote(); } catch (e) {}",
    "function _dstJuntarAbrir() {\n  _dstJuntando = true;\n  _dstMsgs = [];")]),

 # ══ LA VISTA PREVIA ══════════════════════════════════════════════════════════════════════
 ('34 la marca foto/video se inventa en vez de salir de la lista', 'TC-877',
  [("    caja.textContent = (String(it.tipo) === 'video') ? '🎬' : '📷';",
    "    caja.textContent = '📷';")]),
 ('35 la tira no se desplaza: lo que no entra desaparece', 'TC-877',
  [("  var tira = _clnkPrevNodo('div', 'display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;' +",
    "  var tira = _clnkPrevNodo('div', 'display:flex;gap:8px;overflow-x:hidden;padding:2px 0 8px;' +")]),
 ('36 la tira no dice cuantas se ven de cuantas', 'TC-877',
  [("      ? ('Se ven ' + CLNK_PREV_VISTA + ' de ' + filas.length + ' — desplazá al costado para ver el resto.')",
    "      ? ''")]),
 ('37 una miniatura que falla CORTA el llenado de las demas', 'TC-877',
  [("      if (b2.err) {\n        cel.caja.textContent = '⚠️';\n        cel.caja.title = b2.err;\n        cel.pie.textContent = b2.err.slice(0, 40);\n        continue;\n      }",
    "      if (b2.err) { return; }")]),
 ('38 la miniatura convierte TODOS los cuadros y no uno', 'TC-877,TC-878',
  [("  d2.nFrames = 1;\n  d2.crudo = { px: d.crudo.px.subarray(0, porCuadro), bytes: porCuadro };",
    "  d2.crudo = { px: d.crudo.px, bytes: d.crudo.bytes };")]),
 ('39 la vista previa agrega la imagen al estudio abierto', 'TC-878',
  [("      cel.caja.textContent = '';\n      var im = document.createElement('img');\n      im.src = m.thumb;",
    "      cel.caja.textContent = '';\n      try { imgSlots.push({ dataURL: m.thumb, calidad:'media', origen:'estudio' }); } catch (e) {}\n      var im = document.createElement('img');\n      im.src = m.thumb;")]),
 ('40 el visor de la vista previa ofrece borrar un envio que no existe', 'TC-878',
  [("  if (idEnvio) {\n    var bA = _igBandNodo('button',",
    "  if (true) {\n    var bA = _igBandNodo('button',")]),

 # ══ LA GALERIA ═══════════════════════════════════════════════════════════════════════════
 ('41 «Eliminar» no pide confirmacion', 'TC-879',
  [("  if (typeof confirm === 'function' && !confirm(\n      '¿Borrar ' + c.txt + ' de ' + quien + '?\\n\\n' +",
    "  if (false && !confirm(\n      '¿Borrar ' + c.txt + ' de ' + quien + '?\\n\\n' +")]),
 ('42 la confirmacion no nombra el estudio de origen', 'TC-879',
  [("  const quien = (orig.length === 1)\n    ? ('el estudio de ' + orig[0])",
    "  const quien = (orig.length === 1)\n    ? ('un estudio')")]),
 ('43 «Eliminar» se lleva tambien los esquemas del estudio', 'TC-879',
  [("          const esqs = esqs0.filter((x, i) => !set.has(nI + i));",
    "          const esqs = [];")]),
 ('44 el registro vacio se queda: el estudio figura con imagenes', 'TC-879',
  [("          if (!imgs.length && !esqs.length) {\n            os.delete(uuid);",
    "          if (false) {\n            os.delete(uuid);")]),
 ('45 la imagen borrada NO sale del formulario: al guardar vuelve', 'TC-879',
  [("            imgSlots.splice(i, 1); saco++; return;",
    "            return;")]),
 ('46 «Adjuntar» se lleva los esquemas a otro paciente', 'TC-880',
  [("    if (e.esquema) { esqs++; return; }",
    "    if (e.esquema) { esqs++; }")]),
 ('47 adjuntar a un estudio guardado escribe con el ajuste APAGADO', 'TC-880',
  [("  if (typeof imgGuardadoActivo === 'function' && !imgGuardadoActivo()) {\n    igSelRes('«Guardar imágenes con los estudios» está APAGADO",
    "  if (false && !imgGuardadoActivo()) {\n    igSelRes('«Guardar imágenes con los estudios» está APAGADO")]),
 ('48 copiar al MISMO estudio de origen duplica y corre los numeros', 'TC-880',
  [("    if (L.every(e => e.uuid === dest)) {",
    "    if (false) {")]),
 ('49 el modo elegir y el del PPT dejan de ser excluyentes', 'TC-879',
  [("  if (v) {\n    /* Excluyente con el armado del PPT, con su misma limpieza. */\n    _igImgPpt = false; _igImgSel = []; _igImgTapas.clear();",
    "  if (v) {\n    _igImgSel = []; _igImgTapas.clear();")]),

 # ══ EXPORTAR, IMPORTAR Y «DESDE IMAGENES GUARDADAS» ══════════════════════════════════════
 ('50 exportar no dice el tamanio antes de generar', 'TC-881',
  [("    'El archivo va a ocupar unos ' + dstMB(peso) + ' y se descarga a esta computadora: no se ' +",
    "    'El archivo se descarga a esta computadora: no se ' +")]),
 ('51 exportar no avisa que trae datos de pacientes', 'TC-881',
  [("      t1.textContent = '⚠️ El archivo contiene imágenes de pacientes';",
    "      t1.textContent = 'Listo';")]),
 ('52 exportar no avisa que el nombre puede estar DIBUJADO sobre la imagen', 'TC-881',
  [("'DIBUJADO SOBRE la imagen por el ecógrafo, así que no se puede quitar. Guardalo donde ' +",
    "'en la imagen. Guardalo donde ' +")]),
 ('53 exportar genera el archivo SIN preguntar', 'TC-881',
  [("  if (r !== 'si') return false;",
    "  if (false) return false;")]),
 ('54 «Importar» de la galeria NO pasa por la pregunta de destino', 'TC-881',
  [("            () => { if (typeof mediosPick === 'function') mediosPick(true); });",
    "            () => { if (typeof mediosPick === 'function') mediosPick(false); });")]),
 ('55 «Desde imagenes guardadas» no prende el modo elegir', 'TC-881',
  [("  try { igElegirModo(true); } catch (e) {}\n  try {\n    igSelRes('Elegí las imágenes que querés traer",
    "  try { } catch (e) {}\n  try {\n    igSelRes('Elegí las imágenes que querés traer")]),
 ('56 el boton de siempre pasa a preguntar destino', 'TC-881',
  [("                onclick=\"mediosPick()\">📥 Importar imágenes y videos</button>",
    "                onclick=\"mediosPick(true)\">📥 Importar imágenes y videos</button>")]),
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
                       cwd=WT, capture_output=True, text=True, timeout=1800)
    out = r.stdout + r.stderr
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
