#!/usr/bin/env python3
"""
_mut_tga4.py - las mutaciones dirigidas de la tanda TGA-4 (2026-11-01).

Cada mutacion inyecta UN defecto en una COPIA del arbol (un worktree) y corre SOLO el caso que
le toca. Una mutacion que sobrevive es cobertura que falta, o una mutacion mal escrita.

⚠️ NUNCA SOBRE EL ARBOL VIVO. Se trabaja en el worktree que recibe --wt, con guarda de md5
antes y despues: si el index.html vivo cambio durante el barrido, se aborta.
⚠️ VARIAS NO REVIERTEN NADA: APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.

  python3 scripts/_mut_tga4.py --wt <ruta del worktree> [--solo M03,M07]
"""
import subprocess, sys, os, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'

def arg(n, d=None):
    return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d

WT = arg('--wt')
SOLO = (arg('--solo') or '').split(',') if arg('--solo') else None

# (id, caso que debe morir, viejo, nuevo, que inyecta)
MUT = [
 # ── COMMIT 1: el papel ────────────────────────────────────────────────────────────────────
 ('M01', 'TC-613',
  "  if (cc) L.push('!!' + cc + '.');",
  "  if (cc) L.push('!!Segun la guia: ' + cc + '.');",
  'devuelve el prefijo al recuadro de las catorce hojas de congenitas'),
 ('M02', 'TC-613',
  "  if (cc) L.push('!!' + cc + '.');",
  "  if (cc) L.push(cc + '.');",
  'NO revierte nada: saca el MARCADOR de bloque de nota y deja el texto suelto'),
 ('M03', 'TC-613',
  "  if (bav === 'si') partes.push('Bloqueo auriculoventricular completo');",
  "  if (bav === 'si') partes.push('Bloqueo auriculoventricular completo, complicación esperable en la ccTGA por la disposición del sistema de conducción');",
  'devuelve la clausula de la ccTGA a la rama que recorren tres anatomias'),
 ('M04', 'TC-614',
  "    {titulo:'Tricúspide / PSAP' + (_vpHayFil ? ' / Válv. pulmonar' : ''), items:[",
  "    {titulo:'Tricúspide / PSAP', items:[",
  'devuelve el titulo fijo: la valvula pulmonar vuelve a quedar bajo el encabezado de la tricuspide'),
 ('M05', 'TC-614',
  "  const _vpHayFil = _vpFil.some(f => f.val != null && String(f.val).trim() !== '');",
  "  const _vpHayFil = true;",
  'NO revierte nada: el titulo nombra la valvula pulmonar SIEMPRE, tambien sin un solo dato'),
 # ── COMMIT 2: el esquema en el PDF ────────────────────────────────────────────────────────
 ('M06', 'TC-615',
  "    return (typeof _tga3dEsDato !== 'function') || !!_tga3dEsDato();",
  "    return true;",
  'NO revierte nada: deja entrar al papel el esquema de la vista de REFERENCIA'),
 ('M07', 'TC-615',
  "  if (!tgaEsqPdfOn()) return;\n  if (_tgaEsqPdfTo) clearTimeout(_tgaEsqPdfTo);",
  "  if (!tgaEsqPdfOn()) { _tgaEsqPdf = { data:null, linea:'' }; return; }\n  if (_tgaEsqPdfTo) clearTimeout(_tgaEsqPdfTo);",
  'vuelve a BORRAR lo rasterizado con la compuerta cerrada: el defecto del PPT antes del PDF'),
 ('M08', 'TC-615',
  "  if (inmediato) return _cuerpo() || Promise.resolve(null);",
  "  if (inmediato) { _tgaEsqPdfTo = setTimeout(_cuerpo, 700); return Promise.resolve(null); }",
  'saca el modo inmediato: el boton vuelve a dejar la carrera de 700 ms'),
 ('M09', 'TC-615',
  "const TGA_ESQ_PDF_W = 600, TGA_ESQ_PDF_H = 580;\nconst TGA_ESQ_PDF_AR = 290 / 300;",
  "const TGA_ESQ_PDF_W = 600, TGA_ESQ_PDF_H = 580;\nconst TGA_ESQ_PDF_AR = 1;",
  'rompe la proporcion del esquema: se estampa cuadrado como el 3D'),
 ('M10', 'TC-615',
  "    const _tx = document.getElementById('tga-esq-txt');\n    const _ln = _tx ? String(_tx.textContent || '').trim() : '';",
  "    const _ln = '';",
  'deja el esquema sin su linea: la hoja publica el dibujo y no dice de que escenario es'),
 # ── COMMIT 3: el panel compacto ───────────────────────────────────────────────────────────
 ('M11', 'TC-616',
  "const TGA_IND_OPS = Object.freeze([{ v:'si', t:'Sí' }, { v:'no', t:'No' }, IND_OPS_SD]);",
  "const TGA_IND_OPS = Object.freeze([{ v:'si', t:'Sí' }, { v:'no', t:'No' }]);",
  'saca el tercer estado: la botonera vuelve a dos y la fila a apilarse en 104 px'),
 ('M12', 'TC-616',
  "    _indClin[k] = (v === IND_SD_VAL) ? null : ((_indClinGet(k) === v) ? null : v);",
  "    _indClin[k] = (v === IND_SD_VAL) ? 'no' : ((_indClinGet(k) === v) ? null : v);",
  'NO revierte nada: hace que «sin dato» CUENTE como «no», que es lo que la orden prohibe'),
 ('M13', 'TC-616',
  "    compacta: true,\n    preguntas: true,\n    /* ⚠️ UNA SOLA CLAVE Y NO UN ARRAY:",
  "    preguntas: true,\n    /* ⚠️ UNA SOLA CLAVE Y NO UN ARRAY:",
  'saca el modo compacto de la transposicion y deja la prosa desplegada'),
 ('M14', 'TC-616',
  "    const bg = _indPregBadge(p); if (bg) fila.badge = bg;",
  "    const bg = null; if (bg) fila.badge = bg;",
  'saca la etiqueta de guia de la fila: la pregunta deja de decir de que guia sale su corte'),
 ('M15', 'TC-616',
  "    if (!pregs.some(function (x) { return !!x.gr })) return pregs.map(function (x) { return { p:x } });",
  "    if (true) return pregs.map(function (x) { return { p:x } });",
  'saca los cuatro grupos del switch auricular'),
 ('M16', 'TC-616',
  "  if (pregs.length) clinica.unshift(_indFila('Respuestas',",
  "  if (false) clinica.unshift(_indFila('Respuestas',",
  'saca el contador de respuestas'),
 ('M17', 'TC-616',
  "    }, true);\n    /* La etiqueta corta de la guía, al lado del rótulo:",
  "    });\n    /* La etiqueta corta de la guía, al lado del rótulo:",
  'devuelve el aviso por pregunta: la frase del pie se dice diecinueve veces'),
 ('M18', 'TC-616',
  "  if (siDet.length) {\n    const _ls = siDet.map(function (p) {",
  "  if (false) {\n    const _ls = siDet.map(function (p) {",
  'saca la lista de recomendaciones que aplican con lo contestado'),
 ('M19', 'TC-616',
  "const IND_COLS_CORTE = 900;",
  "const IND_COLS_CORTE = 99999;",
  'NO revierte nada: rompe el corte de las dos columnas, que nunca se alcanza'),
 # ── COMMIT 4: la conclusion descriptiva ───────────────────────────────────────────────────
 ('M28', 'TC-616',
  "#indic-card [data-ind-grid][data-ind-preg=\"1\"] [data-ind-info][open] > div{\n  position:absolute;right:0;top:100%;z-index:3;",
  "#indic-card [data-ind-grid][data-ind-preg=\"1\"] [data-ind-info][open] > div{\n  z-index:3;",
  'devuelve la nota a la celda de treinta pixeles: tira de 103 px y la fila crece a 637'),
 ('M20', 'TC-617',
  "  return { clave: clave, txt: _papelDesc, papel: _papelDesc,",
  "  return { clave: clave, txt: partes.join('. '), papel: _papelDesc,",
  'devuelve la conducta a la capsula de pantalla de la transposicion'),
 ('M21', 'TC-617',
  "  return { clave: clave, txt: _papelDesc, papel: _papelDesc,",
  "  return { clave: clave, txt: _papelDesc, papel: partes.join('. '),",
  'NO revierte nada: manda la conducta al PAPEL, que es lo que TGA-3 cerro'),
 ('M22', 'TC-617',
  "  } else if (gradS != null && gradS > 50 && obstr === 'si') {",
  "  } else if (gradS != null && gradS > 30 && obstr === 'si') {",
  'mueve el corte de la cascada, que esta tanda tenia PROHIBIDO tocar'),
 # ── COMMIT 5: la CIA y la CIV ─────────────────────────────────────────────────────────────
 ('M23', 'TC-618',
  "  const CIA_OPS = [{ v:'si', t:'Sí' }, { v:'no', t:'No' }, IND_OPS_SD];",
  "  const CIA_OPS = [{ v:'si', t:'Sí' }, { v:'no', t:'No' }];",
  'saca el tercer estado de la CIA'),
 ('M24', 'TC-618',
  "y de la CIA. */\n    compacta: true,\n    preguntas: true,",
  "y de la CIA. */",
  'saca el modo compacto de la CIV'),
 ('M25', 'TC-618',
  "    const _b = _indPregBadge(p); if (_b) _f.badge = _b;\n    _civClin.push(_f);",
  "    _civClin.push(_f);",
  'saca la etiqueta de guia de la CIV'),
 ('M26', 'TC-618',
  "      return { txt: val === 'si' ? 'Sí' : (val === 'no' ? 'No' : 'Sin dato'),\n               marca: val === 'si' ? 'warn' : (val === 'no' ? 'none' : 'ask'),\n               nota: _indPregNota(p, val == null) };\n    }, true);\n    const _b = _indPregBadge(p); if (_b) _f.badge = _b;\n    clinica.push(_f);",
  "      return { txt: val === 'si' ? 'Sí' : (val === 'no' ? 'No' : 'Sin dato'),\n               marca: val === 'si' ? 'warn' : (val === 'no' ? 'none' : 'ask'),\n               nota: _indPregNota(p, val == null) };\n    });\n    const _b = _indPregBadge(p); if (_b) _f.badge = _b;\n    clinica.push(_f);",
  'devuelve el aviso por pregunta a la CIA'),
 ('M27', 'TC-618',
  "  const _cola = sinAviso\n    ? (_pista ? '— ' + _pista : '')",
  "  const _cola = false\n    ? (_pista ? '— ' + _pista : '')",
  'NO revierte nada del todo: ignora `sinAviso` y devuelve el aviso a las TRES secciones'),
]

def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()

vivo = md5(os.path.join(RAIZ, 'index.html'))
print('md5 del arbol VIVO al empezar: ' + vivo)
print('worktree: ' + str(WT))
if not WT or not os.path.isdir(WT):
    print('FALTA --wt con un worktree valido'); sys.exit(2)

IDX = os.path.join(WT, 'index.html')
base = open(IDX, encoding='utf-8').read()
# el archivo de tests del arbol de trabajo, que es el que trae los casos nuevos
import shutil
shutil.copy(os.path.join(RAIZ, 'scripts', 'test_clinico.mjs'), os.path.join(WT, 'scripts', 'test_clinico.mjs'))

res = []
t0 = time.time()
for (mid, tc, viejo, nuevo, que) in MUT:
    if SOLO and mid not in SOLO:
        continue
    n = base.count(viejo)
    if n != 1:
        res.append((mid, tc, 'NO APLICA', 'el ancla aparece ' + str(n) + ' veces', que))
        print('%s  NO APLICA (ancla x%d)  %s' % (mid, n, que)); continue
    open(IDX, 'w', encoding='utf-8').write(base.replace(viejo, nuevo, 1))
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', tc],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout
    if 'RESULTADO' not in out:
        veredicto = 'NO CORRIO'
    elif ('✗' in out) or ('CON FALLAS' in out):
        veredicto = 'MUERTA'
    else:
        veredicto = 'SOBREVIVIO'
    res.append((mid, tc, veredicto, '', que))
    print('%s  %-11s %s  ::  %s' % (mid, veredicto, tc, que))
open(IDX, 'w', encoding='utf-8').write(base)

print('')
print('=' * 78)
muertas = len([x for x in res if x[2] == 'MUERTA'])
print('RESUMEN  %d/%d muertas   (%.1f min)' % (muertas, len(res), (time.time() - t0) / 60))
for x in res:
    if x[2] != 'MUERTA':
        print('   %s  %s  %s %s' % (x[0], x[2], x[3], x[4]))
fin = md5(os.path.join(RAIZ, 'index.html'))
print('md5 del arbol VIVO al terminar: ' + fin + ('   IDENTICO' if fin == vivo else '   ⚠️ CAMBIO'))
