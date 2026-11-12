#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_ec3.py - barrido de mutaciones dirigidas de la tanda ECO-CONECTOR-3 (2026-11-12).
Calcado de _mut_ec2.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

LAS SIETE QUE LA ORDEN PIDE son la 01 a la 07, en su orden. Las otras rompen, una por una, las
decisiones de fondo de la pregunta unica, del cineloop automatico, de la tira y del DICOM sin
comprimir.
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
 # ══ LAS SIETE QUE LA ORDEN PIDE, EN SU ORDEN ══════════════════════════════════════════════
 # (1) Confirmar ANTES de que la escritura termine. El punto de la decision 6 es que confirmar
 #     BORRA en el conector, asi que la condicion no puede ser «el medico apreto Guardar».
 ('01 confirmar a CeiboLink ANTES de que la escritura termine', 'TC-858',
  [("  const _pCine = _cinePendientesPersistir(uuid);",
    "  const _pCine = _cinePendientesPersistir(uuid);\n  try { clnkConfirmarPersistidas(); } catch (e) {}")]),
 # (2) La bandeja guarda SOLO el primer cuadro: el defecto que esta tanda vino a cerrar.
 ('02 la bandeja guarda SOLO el primer cuadro del cineloop', 'TC-859',
  [("      r.loop.d.frags.forEach(function (x, k) { offs[k] = p; datos.set(x, p); p += x.length; });",
    "      offs = new Int32Array(1); datos = new Uint8Array(r.loop.d.frags[0].length);\n      datos.set(r.loop.d.frags[0], 0); offs[0] = 0;")]),
 # (3) Escribir sin leer antes: se lleva los esquemas del estudio elegido.
 ('03 adjuntar a un guardado SIN leer antes: se lleva los esquemas', 'TC-855',
  [("""      return _tx('readwrite', (os, ok) => {
        const q = os.get(uuid);
        q.onsuccess = () => {
          const prev = q.result;
          const antes = (prev && Array.isArray(prev.imgs)) ? prev.imgs : [];
          const esqs = (prev && Array.isArray(prev.esqs))
            ? prev.esqs.filter(e => e && _imgSrcOK(e.dataURL)) : [];
          const todas = antes.concat(limpias);""",
    """      return _tx('readwrite', (os, ok) => {
        const q = os.get(uuid);
        q.onsuccess = () => {
          const prev = q.result;
          const antes = (prev && Array.isArray(prev.imgs)) ? prev.imgs : [];
          const esqs = [];
          const todas = antes.concat(limpias);""")]),
 # (4) Escribir en el estudio ABIERTO en vez de en el elegido: la fuga entre pacientes.
 ('04 asignar al estudio ABIERTO en lugar del ELEGIDO', 'TC-860',
  [("    var uuid = String(inf.uuid || '');\n    if (!_uuidValido(uuid)) {\n      clnkAvisoCerrar();\n      if (typeof alert === 'function') {\n        alert('Ese estudio guardado no tiene identificador de im\u00e1genes. Abrilo una vez desde ' +",
    "    var uuid = 'ec3d0000-0000-4000-8000-00000000d099';\n    if (!_uuidValido(uuid)) {\n      clnkAvisoCerrar();\n      if (typeof alert === 'function') {\n        alert('Ese estudio guardado no tiene identificador de im\u00e1genes. Abrilo una vez desde ' +")]),
 # (5) El nombre del estudio como HTML. Es la fila donde el medico elige A QUE PACIENTE.
 ('05 el nombre del estudio guardado entra como HTML', 'TC-852',
  [("      nom.textContent = String(inf.nombre || 'Sin nombre');",
    "      nom.innerHTML = String(inf.nombre || 'Sin nombre');")]),
 # (6) «Nuevo estudio» deja de contar un cineloop sin guardar.
 ('06 «Nuevo estudio» no cuenta un cineloop sin guardar', 'TC-858',
  [("    if (_cinePendientes.length) return true;\n    /* ⚠️ Y LOS IDS DE CEIBOLINK PENDIENTES",
    "    if (false && _cinePendientes.length) return true;\n    /* ⚠️ Y LOS IDS DE CEIBOLINK PENDIENTES")]),
 # (7) Confirmar aunque la escritura haya fallado.
 ('07 confirmar a CeiboLink cuando la escritura FALLO', 'TC-858',
  [("      if (n > 0 && _cineFallos() === 0 && typeof clnkConfirmarPersistidas === 'function') {",
    "      if (typeof clnkConfirmarPersistidas === 'function') {")]),
 # ══ LA PREGUNTA UNICA ═════════════════════════════════════════════════════════════════════
 ('08 el cuarto boton dice Descartar tambien desde el pendrive', 'TC-852',
  [("    { txt: ctx.cancelar ? 'Cancelar' : '🗑 Descartar',",
    "    { txt: '🗑 Descartar',")]),
 ('09 desde el pendrive se importa DERECHO, sin preguntar', 'TC-854',
  [("  if (preguntar && typeof dstDesdePendrive === 'function') { dstDesdePendrive(fs); return; }",
    "  if (false && typeof dstDesdePendrive === 'function') { dstDesdePendrive(fs); return; }")]),
 ('10 la marca de preguntar NO se consume: se hereda al gesto siguiente', 'TC-854',
  [("  const preguntar = inp.hasAttribute('data-preguntar');\n  inp.removeAttribute('data-preguntar');",
    "  const preguntar = inp.hasAttribute('data-preguntar');")]),
 ('11 el aviso cuenta el TOTAL y no por tipo', 'TC-852,TC-847',
  [("function dstCuenta(n, nFijas, nLoops) {\n  if (nFijas === null || nFijas === undefined) {",
    "function dstCuenta(n, nFijas, nLoops) {\n  if (true) {")]),
 ('12 el aviso se abre encima del visor de cineloop', 'TC-853',
  [("var CLNK_AV_BLOQUEANTES = ['modal-nuevo-estudio', 'doc-ov', 'modal-def-pwd', 'login-overlay',\n                           'cine-ov', 'dst-elegir-ov'];",
    "var CLNK_AV_BLOQUEANTES = ['modal-nuevo-estudio', 'doc-ov', 'modal-def-pwd', 'login-overlay'];")]),
 ('13 el aviso NO se actualiza: con mas imagenes no dice nada', 'TC-853',
  [("  if (_clnkAvisoAbierto && !_clnkAvisoGrupo) return false;",
    "  if (_clnkAvisoAbierto) return false;")]),
 ('14 al cerrar NO se olvida el grupo: no vuelve a avisar nunca mas', 'TC-853',
  [("  _clnkAvisoGrupo = null;\n  _clnkAvisoAccion = { b1: null, b2: null, b3: null, b4: null };",
    "  _clnkAvisoAccion = { b1: null, b2: null, b3: null, b4: null };")]),
 # ══ EL ESTUDIO GUARDADO ═══════════════════════════════════════════════════════════════════
 ('15 se escribe en un guardado con el ajuste de guardar APAGADO', 'TC-856',
  [("  if (typeof imgGuardadoActivo === 'function' && !imgGuardadoActivo()) {\n    clnkAvisoCerrar();\n    if (typeof alert === 'function') {\n      alert('No se puede adjuntar a un estudio guardado con \u00abGuardar im\u00e1genes con los estudios\u00bb ' +",
    "  if (false) {\n    clnkAvisoCerrar();\n    if (typeof alert === 'function') {\n      alert('No se puede adjuntar a un estudio guardado con \u00abGuardar im\u00e1genes con los estudios\u00bb ' +")]),
 ('16 un estudio sin uuid recibe uno INVENTADO', 'TC-856',
  [("  var uuid = String(inf.uuid || '');\n  if (!_uuidValido(uuid)) {\n    clnkAvisoCerrar();\n    if (typeof alert === 'function') {\n      alert('Ese estudio guardado no tiene identificador de im",
    "  var uuid = String(inf.uuid || _uuidNuevo());\n  if (!_uuidValido(uuid)) {\n    clnkAvisoCerrar();\n    if (typeof alert === 'function') {\n      alert('Ese estudio guardado no tiene identificador de im")]),
 ('17 las imagenes nuevas se INTERCALAN al principio en vez de al final', 'TC-855',
  [("          const todas = antes.concat(limpias);",
    "          const todas = limpias.concat(antes);")]),
 ('18 la allowlist deja pasar lo que no esta en ella', 'TC-855',
  [("""      const limpias = (imgs || []).filter(s => s && _imgSrcOK(s.dataURL))
                                  .map(s => ({ dataURL: s.dataURL, ampliada: !!s.ampliada,
                                               calidad: (typeof s.calidad === 'string' ? s.calidad : 'media'),
                                               origen: (s.origen === 'visor' ? 'visor' : 'estudio'),
                                               _dcmId: (s._dcmId || undefined),""",
    """      const limpias = (imgs || []).filter(s => s && _imgSrcOK(s.dataURL))
                                  .map(s => ({ ...s, dataURL: s.dataURL, ampliada: !!s.ampliada,
                                               calidad: (typeof s.calidad === 'string' ? s.calidad : 'media'),
                                               origen: (s.origen === 'visor' ? 'visor' : 'estudio'),
                                               _dcmId: (s._dcmId || undefined),""")]),
 # ══ EL CINELOOP Y LA TIRA ═════════════════════════════════════════════════════════════════
 ('19 el cineloop ya no se encola solo: vuelve a depender del boton', 'TC-857',
  [("    loops.forEach(l => { _cineEncolar(l); l.d.frags.forEach(f => { _bytesL += f.length; }); });",
    "    loops.forEach(l => { l.d.frags.forEach(f => { _bytesL += f.length; }); });")]),
 ('20 la tira no muestra lo adjuntado sin guardar', 'TC-857',
  [("    const pend = (typeof _cinePendientes !== 'undefined') ? _cinePendientes : [];",
    "    const pend = [];")]),
 ('21 la tira no dice el PESO de lo que no esta guardado', 'TC-857',
  [("                    nota: 'sin guardar · ' + dstMB(by),",
    "                    nota: 'sin guardar',")]),
 ('22 un pendiente no se puede reabrir desde la tira', 'TC-857',
  [("      if (f.clase === 'cinepend') {\n        const pl = ((typeof _cinePendientes !== 'undefined') ? _cinePendientes : [])[f.pend];\n        if (pl && pl.loop) { _cineAbrir([pl.loop]); return; }",
    "      if (f.clase === 'cinepend') {\n        const pl = null;\n        if (pl && pl.loop) { _cineAbrir([pl.loop]); return; }")]),
 ('23 la cola NO es idempotente: dos veces lo duplica', 'TC-857',
  [("  if (_cinePendientes.some(p => p.loop === loop)) return false;",
    "  if (false) return false;")]),
 # ══ LA BANDEJA ════════════════════════════════════════════════════════════════════════════
 ('24 la bandeja confirma el borrado aunque no haya entrado', 'TC-859',
  [("""  var ok = await clnkbGuardar(reg);
  clnkAvisoCerrar();
  if (!ok) {""",
    """  var ok = await clnkbGuardar(reg);
  clnkAvisoCerrar();
  if (ctx.origen === 'ceibolink') { imgs.forEach(function (x) { if (x.clnkId) _clnkPorConfirmar.push(x.clnkId); });
    loops.forEach(function (x) { if (x.clnkId) _clnkPorConfirmar.push(x.clnkId); });
    try { await clnkConfirmarPersistidas(); } catch (e) {} }
  if (!ok) {""")]),
 ('25 el cineloop se guarda sin mirar el espacio', 'TC-859',
  [("      if (!hay) {\n        fallos.push(r.nombre + ': no hay espacio en este dispositivo para el cineloop entero (' +",
    "      if (false) {\n        fallos.push(r.nombre + ': no hay espacio en este dispositivo para el cineloop entero (' +")]),
 ('26 el bloque «Sin estudio» no se muestra en Guardados', 'TC-859',
  [("  if (!l.length) { sec.style.display = 'none'; if (cnt) cnt.textContent = ''; return 0; }\n  sec.style.display = '';\n  var tot = l.reduce(function (a, x) { return a + (x.n || 0) + (x.nLoops || 0); }, 0);\n  var by = l.reduce(function (a, x) { return a + (x.bytesLoops || 0); }, 0);",
    "  if (!l.length) { sec.style.display = 'none'; if (cnt) cnt.textContent = ''; return 0; }\n  sec.style.display = 'none';\n  var tot = l.reduce(function (a, x) { return a + (x.n || 0) + (x.nLoops || 0); }, 0);\n  var by = l.reduce(function (a, x) { return a + (x.bytesLoops || 0); }, 0);")]),
 ('27 el id de la bandeja pierde su prefijo propio', 'TC-859',
  [("  return 'clnkb_' + Date.now().toString(36) + '_' +",
    "  return '' + Date.now().toString(36) + '_' +")]),
 ('28 el envio se borra de la bandeja aunque no haya entrado entero', 'TC-860',
  [("  var entero = (n === imgs.length + loops.length) && !fallos.length;",
    "  var entero = true;")]),
 # ══ EL DICOM SIN COMPRIMIR ════════════════════════════════════════════════════════════════
 ('29 las dos sintaxis nativas vuelven a rechazarse', 'TC-861,TC-179',
  [("  '1.2.840.10008.1.2.1':    { ok:true,  nom:'Explicit VR LE (sin comprimir)', crudo:true },",
    "  '1.2.840.10008.1.2.1':    { ok:false, nom:'Explicit VR LE (sin comprimir)' },")]),
 ('30 el dataset implicito se recorre como si tuviera VR', 'TC-861',
  [("  const IMPL = !!CONOCIDA.impl;", "  const IMPL = false;")]),
 ('31 el tope de pixeles crudos desaparece', 'TC-861',
  [("  if (esperado > DCM_CRUDO_MAX) {", "  if (false) {")]),
 ('32 el color en planos separados se acepta y se dibuja mal', 'TC-861',
  [("  if (muestras === 3 && (d.planar | 0) === 1)\n    return 'la imagen es color en planos separados",
    "  if (false)\n    return 'la imagen es color en planos separados")]),
 # ⚠️ LA PRIMERA VERSION DE ESTA MUTACION ERA EQUIVALENTE Y SOBREVIVIO: se insertaba ANTES de la
 # linea que suelta los pixeles, asi que el `d.crudo = null` de dos lineas mas abajo la deshacia.
 # La de hoy ataca esa linea.
 ('33 los pixeles crudos NO se sueltan: los megas quedan vivos', 'TC-861',
  [("     ArrayBuffer del archivo entero queda vivo mientras viva este objeto. */\n  d.crudo = null;",
    "     ArrayBuffer del archivo entero queda vivo mientras viva este objeto. */")]),
 ('34 la ventana de 16 bits se calcula por CUADRO y el cineloop parpadea', 'TC-861',
  [("  const esc = (bits === 16) ? (255 / Math.max(1, alto - lo)) : 1;",
    "  let esc = (bits === 16) ? (255 / Math.max(1, alto - lo)) : 1;\n  if (bits === 16) { lo = 0; alto = 255; esc = 1; }")]),
 ('35 un formato ajeno se rechaza SIN decir su nombre', 'TC-861,TC-179',
  [("      out.rechazo = out.nombre + ': está comprimido en ' + d.rechazo +\n                    ', que este navegador no sabe abrir por su cuenta.';",
    "      out.rechazo = out.nombre + ': no se pudo importar.';")]),
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
                       cwd=WT, capture_output=True, text=True, timeout=1200)
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
