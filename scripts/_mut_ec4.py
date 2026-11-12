#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_ec4.py - barrido de mutaciones dirigidas de la tanda ECO-CONECTOR-4 (2026-11-12).
Calcado de _mut_ec3.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

LAS SEIS QUE LA ORDEN PIDE son la 01 a la 06, en su orden.
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

 # ══ LAS SEIS QUE LA ORDEN PIDE, EN SU ORDEN ══════════════════════════════════════════════
 # (1) Confirmar a CeiboLink un archivo que el importador RECHAZO. Es, literalmente, el
 #     defecto que el medico encontro: el DICOM de 351,9 MB no entro y se borro alla igual.
 ('01 confirmar un archivo que el importador RECHAZO', 'TC-862,TC-863',
  [("    const det = (r && Array.isArray(r.res) && r.res[0]) ? r.res[0] : null;\n    if (det && det.ok) {",
    "    const det = (r && Array.isArray(r.res) && r.res[0]) ? r.res[0] : null;\n    if (true) {")]),

 # (2) «Dejarlo esperando» que igual confirma: la respuesta del medico se ignora.
 ('02 «Dejarlo esperando» igual deja entrar el archivo', 'TC-865,TC-862',
  [("  if (!q.seguir) { d.crudo = null; return { ok: false, err: q.err, esperando: true }; }",
    "  if (false) { d.crudo = null; return { ok: false, err: q.err, esperando: true }; }")]),

 # (3) Asignar desde «Sin estudio» al estudio EQUIVOCADO: la fuga entre pacientes.
 ('03 asignar un envio de la bandeja al estudio ABIERTO en vez del elegido', 'TC-868',
  [("async function clnkbAsignar(id, inf) {\n  var reg = null;",
    "async function clnkbAsignar(id, inf) {\n  inf = null;\n  var reg = null;")]),

 # (4) Borrar desde la lista SIN la confirmacion. Es la ultima copia: ya no esta en CeiboLink.
 ('04 borrar un envio de la bandeja SIN pedir confirmacion', 'TC-868',
  [("    if (typeof confirm === 'function' &&\n        !confirm('\u00bfBorrar este env\u00edo de im\u00e1genes sin estudio?",
    "    if (false &&\n        !confirm('\u00bfBorrar este env\u00edo de im\u00e1genes sin estudio?")]),

 # (5) El apodo del equipo como HTML en la fila nueva de «Sin estudio».
 ('05 el apodo del equipo entra como HTML en la bandeja', 'TC-871',
  [("    var eq = document.createElement('bdi');\n    eq.style.cssText = 'font-size:12.5px;font-weight:700;';\n    eq.textContent = x.equipo || 'Equipo desconocido';",
    "    var eq = document.createElement('span');\n    eq.style.cssText = 'font-size:12.5px;font-weight:700;';\n    eq.innerHTML = x.equipo || 'Equipo desconocido';")]),

 # (6) El fallo por memoria que igual confirma: la excepcion se traga y el archivo se da por
 #     entrado. Es la otra mitad de la regla que no se negocia.
 ('06 el fallo por memoria da el archivo por ENTRADO', 'TC-866',
  [("    frags.length = 0;\n    d.crudo = null;\n    return { ok:false, esperando:true,",
    "    frags.length = 0;\n    d.crudo = null;\n    if (true) return { ok:true, n:1 };\n    return { ok:false, esperando:true,")]),

 # ══ EL RESULTADO EXPLICITO ════════════════════════════════════════════════════════════════
 ('07 el importador vuelve a no devolver nada', 'TC-862,TC-863',
  [("  const _nOk = res.filter(x => x.ok).length;\n  return { n: files.length, ok: _nOk, no: files.length - _nOk, res: res };",
    "  const _nOk = res.filter(x => x.ok).length;\n  return undefined;")]),
 ('08 el veredicto arranca en ENTRO en vez de en NO ENTRO', 'TC-862,TC-863',
  [("  const res = files.map(f => ({ nombre: String((f && f.name) || 'archivo'), ok: false,\n                                motivo: 'no se pudo procesar' }));\n  /* Las im\u00e1genes que DE VERDAD quedaron en un slot.",
    "  const res = files.map(f => ({ nombre: String((f && f.name) || 'archivo'), ok: true,\n                                motivo: 'no se pudo procesar' }));\n  /* Las im\u00e1genes que DE VERDAD quedaron en un slot.")]),
 ('09 la RESERVA del slot se toma por imagen puesta', 'TC-863',
  [("    imagenes.forEach((x, k) => {\n      if (_puestas[k]) { res[x.i].ok = true; res[x.i].motivo = ''; imgsOk++; }",
    "    imagenes.forEach((x, k) => {\n      if (true) { res[x.i].ok = true; res[x.i].motivo = ''; imgsOk++; }")]),
 ('10 imgCompressLoad deja de decir si el slot quedo puesto', 'TC-863',
  [("      resolve(true);\n    }).catch(() => { if (typeof toast === 'function') toast('\u274c No se pudo procesar la imagen'); resolve(false); });",
    "      resolve(true);\n    }).catch(() => { if (typeof toast === 'function') toast('\u274c No se pudo procesar la imagen'); resolve(true); });")]),
 ('11 un DICOM rechazado por dcmImgImportar cuenta como entrado', 'TC-862',
  [("    dicoms.forEach((x, k) => {\n      const d = rl[k];\n      if (d && d.ok) { res[x.i].ok = true; res[x.i].motivo = ''; }",
    "    dicoms.forEach((x, k) => {\n      const d = rl[k];\n      if (true) { res[x.i].ok = true; res[x.i].motivo = ''; }")]),
 ('12 un cineloop que no se pudo guardar NO se desmarca', 'TC-862',
  [("      if (!n) {\n        loops.forEach(l => { if (typeof l._i === 'number') _noD(l._i, 'no se pudo guardar el cineloop en este dispositivo'); });",
    "      if (!n) {\n        loops.forEach(l => { if (false) _noD(l._i, 'x'); });")]),
 ('13 el cartel deja de decir cuantos siguen esperando', 'TC-862',
  [("          (ctx.origen === 'ceibolink' && esperando\n            ? '\\n\\n' + esperando + (esperando === 1 ? ' archivo SIGUE ESPERANDO' : ' archivos SIGUEN ESPERANDO') +\n              ' en CeiboLink hasta que se cumpla su plazo: no se borr\u00f3 nada all\u00e1.'\n            : ''));",
    "          '');")]),
 ('14 el denominador de los avisos cuenta las clasificadas y no las puestas', 'TC-863',
  [("  if (imgsOk) partes.push(imgsOk + ' imagen(es)');",
    "  if (imagenes.length) partes.push(imagenes.length + ' imagen(es)');")]),

 # ══ LOS ARCHIVOS PESADOS ══════════════════════════════════════════════════════════════════
 ('15 el tope vuelve a RECHAZAR en vez de preguntar', 'TC-865',
  [("  const q = _dcmCrudoPreguntar(d, info);\n  if (!q.seguir) { d.crudo = null; return { ok: false, err: q.err, esperando: true }; }",
    "  if (_dcmCrudoBytes(d) > _dcmCrudoTope()) { d.crudo = null; return { ok:false, err:'pesa demasiado' }; }")]),
 ('16 la pregunta no dice el peso', 'TC-865',
  [("  const tam = dstMB(bytes) + ' de p\u00edxeles (' + cols + '\u00d7' + filas + ', ' + cuadros + ' cuadro(s))';",
    "  const tam = 'bastante';")]),
 ('17 por encima del tope DURO se ofrece abrir igual', 'TC-866',
  [("  if (bytes > _dcmCrudoTopeDuro()) {",
    "  if (false) {")]),
 ('18 el tope duro puede quedar POR DEBAJO del blando', 'TC-866',
  [("  const duro = (isFinite(v) && v > 0) ? v : DCM_CRUDO_DURO;\n  return Math.max(duro, _dcmCrudoTope());",
    "  const duro = (isFinite(v) && v > 0) ? v : DCM_CRUDO_DURO;\n  return duro;")]),
 # ** ESTA MUTACION ESTABA MAL DIRIGIDA Y SOBREVIVIO AL PRIMER BARRIDO. Anulaba el rechazo
 # DURO de `_dcmCrudoRechazo`, pero la escena de TC-865 (E) usa un DICOM comprimido en RLE, que
 # se rechaza mucho antes -- en `_dcmImgLeer`, por `d.rechazo`-- y nunca llega a esta funcion.
 # Lo que la condicion mide de verdad es el ORDEN: a un archivo que esta app no sabe interpretar
 # no se le pregunta. Hoy la mutacion da vuelta ESE orden, que es lo que se puede romper.
 ('19 la pregunta se hace ANTES de los rechazos duros', 'TC-865',
  [("  const mal = _dcmCrudoRechazo(d);\n  if (mal) { d.crudo = null; return { ok: false, err: mal }; }\n  /* La pregunta va DESPU\u00c9S de los rechazos duros",
    "  const q0 = _dcmCrudoPreguntar(d, info);\n  if (!q0.seguir) { d.crudo = null; return { ok:false, err:q0.err }; }\n  const mal = _dcmCrudoRechazo(d);\n  if (mal) { d.crudo = null; return { ok: false, err: mal }; }\n  /* La pregunta va DESPU\u00c9S de los rechazos duros")]),
 ('20 el bucle de conversion deja de estar protegido', 'TC-866',
  [("  try {\n  for (let f = 0; f < cuadros; f++) {\n    if (window.__dcmFallaMemoriaTest) throw new RangeError('Array buffer allocation failed');",
    "  try {\n  for (let f = 0; f < cuadros; f++) {\n    if (false) throw new RangeError('Array buffer allocation failed');")]),
 ('21 el mensaje del fallo por memoria no nombra la memoria', 'TC-866',
  [("             err:'este navegador se qued\u00f3 sin memoria al abrirlo ('",
    "             err:'no se pudo abrir ('")]),

 # ══ VER ANTES DE ASIGNAR ══════════════════════════════════════════════════════════════════
 ('22 la lista de la bandeja deja de traer los thumbs', 'TC-867',
  [("                 thumbs: im.map(function (x) { return (x && x.thumb) || ''; }),",
    "                 thumbs: [],")]),
 ('23 la bandeja deja de guardar la miniatura', 'TC-867',
  [("    var th = '';\n    try { th = await dstThumb(chica); } catch (e) { th = ''; }",
    "    var th = '';")]),
 ('24 la fila de miniaturas no se dibuja', 'TC-867',
  [("    f.appendChild(_igBandMiniaturas(x));",
    "    if (false) f.appendChild(_igBandMiniaturas(x));")]),
 ('25 la miniatura deja de ser un boton y pierde su area tactil', 'TC-867',
  [("  var b = document.createElement('button');\n  b.type = 'button';\n  b.style.cssText = 'position:relative;width:62px;height:62px;padding:0;border-radius:8px;'",
    "  var b = document.createElement('span');\n  b.type = 'button';\n  b.style.cssText = 'position:relative;width:62px;height:62px;padding:0;border-radius:8px;'")]),
 ('26 el visor de la bandeja deja de abrir el cineloop con el visor de siempre', 'TC-867',
  [("    _cineAbrir([loop]);\n    return true;\n  }\n  var im = (reg.imgs || [])[k];",
    "    return true;\n  }\n  var im = (reg.imgs || [])[k];")]),
 ('27 mirar una fija ESCRIBE en el estudio abierto', 'TC-867',
  [("  _clnkbVerFija(idEnvio, im.dataURL, k, (reg.imgs || []).length, String(reg.equipo || ''));\n  return true;",
    "  try { var _i = _dcmImgReservar(1)[0]; imgSlots[_i] = { dataURL: im.dataURL, calidad:'media', origen:'estudio' }; imgRender(); } catch (e) {}\n  _clnkbVerFija(idEnvio, im.dataURL, k, (reg.imgs || []).length, String(reg.equipo || ''));\n  return true;")]),
 ('28 el visor de la bandeja pierde su boton de asignar', 'TC-867',
  [("  fila.appendChild(bA);\n  var bB = _igBandNodo('button', 'padding:7px 14px;font-size:12px;', '\U0001F5D1 Borrar el env\u00edo');",
    "  var bB = _igBandNodo('button', 'padding:7px 14px;font-size:12px;', '\U0001F5D1 Borrar el env\u00edo');")]),
 ('29 la lista de la bandeja materializa los cineloops enteros', 'TC-868',
  [("      var im = Array.isArray(v.imgs) ? v.imgs : [];\n      out.push({ id: v.id,",
    "      var im = Array.isArray(v.imgs) ? v.imgs : [];\n      out.push({ loops: ls, id: v.id,")]),

 # ══ LOS CINELOOPS A LA VISTA ══════════════════════════════════════════════════════════════
 ('30 el indice de cineloops vuelve a materializar los datos', 'TC-869',
  [("            out.push({ id: String(r.id || ''), uuid: String(r.uuid || ''),",
    "            out.push({ datos: r.datos, offs: r.offs, id: String(r.id || ''), uuid: String(r.uuid || ''),")]),
 ('31 el indice trae tambien las fijas DICOM y cada una sale DOS veces', 'TC-869',
  [("          if (String(r.tipo || '') === 'loop') {",
    "          if (true) {")]),
 ('32 el cineloop deja de pasar el filtro «Videos»', 'TC-869',
  [("  return _igImgFiltro === 'all' || _igImgFiltro === 'vid' || !_igImgFiltro;",
    "  return _igImgFiltro === 'all' || !_igImgFiltro;")]),
 ('33 el cineloop pasa «De interes» y ese filtro deja de dar lo que daba', 'TC-869,TC-870',
  [("function igLoopPasaTipo() {\n  return _igImgFiltro === 'all'",
    "function igLoopPasaTipo() {\n  if (_igImgFiltro === 'star') return true;\n  return _igImgFiltro === 'all'")]),
 ('34 la celda del cineloop no dice de que estudio es', 'TC-869',
  [("      b.title = 'Cineloop \u00b7 ' + (it.cuadros || 0) + ' cuadros' +\n                (it.bytes ? ' \u00b7 ' + dstMB(it.bytes) : '') + ' \u00b7 ' + quien;",
    "      b.title = 'Cineloop';")]),
 ('35 tocar un cineloop abre el visor de IMAGENES', 'TC-869',
  [("    if (typeof cineAbrirGuardado === 'function') cineAbrirGuardado(cine);\n    return;",
    "    igImgVisorAbrir(uuid, idx, n, false);\n    return;")]),
 ('36 un cineloop ENTRA al mazo del PPT', 'TC-870',
  [("    if (_igImgPpt) {\n      igImgRes('Un cineloop no entra al mazo desde ac\u00e1. El PPT del estudio los convierte a video.');\n      return;\n    }",
    "    if (_igImgPpt) { igImgSelToggle(uuid, idx, n); return; }")]),
 ('37 los cineloops suman al conteo de imagenes del pie', 'TC-869',
  [("        mostradosLoops++;",
    "        mostradosLoops++; mostradas++;")]),
 ('38 el cineloop se pinta leyendo los cuadros en vez de su poster', 'TC-869',
  [("      if (it.poster) {\n        const pim = document.createElement('img');\n        pim.src = it.poster;",
    "      if (it.poster) {\n        const pim = document.createElement('img');\n        pim.src = '';")]),
 ('39 el nombre del estudio entra como HTML en la celda del cineloop', 'TC-871',
  [("      const mk = document.createElement('span');\n      mk.className = 'ig-img-eq';\n      mk.textContent = it.cuadros ? (it.cuadros + 'c') : 'loop';",
    "      const mk = document.createElement('span');\n      mk.className = 'ig-img-eq';\n      mk.innerHTML = String(it.nombre || '');")]),
 ('40 el cartel de «no hay imagenes» tapa una galeria que solo tiene cineloops', 'TC-869',
  [("  if (!totalImgs && !mostradosLoops) {",
    "  if (!totalImgs) {")]),
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
