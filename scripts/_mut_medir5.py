#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_medir5.py - barrido de mutaciones dirigidas de la tanda MEDIR-5 (2026-11-15).
Calcado de _mut_ec5.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

Cada mutacion ataca algo que ESTA TANDA escribio, y declara el caso que la tiene que matar.
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

 # ══ A1 — EL REPARTO DE LOS CAJONES ════════════════════════════════════════════════════════
 ('01 los dos cajones vuelven a la ranura de la vista ACTIVA', 'TC-899',
  [("  mudar('cine-dop-slot', dueno(V => V && V.medGrupo === 'dop'));\n  mudar('d2-cajon',      dueno(V => V && V.medHerr === 'dist'));",
    "  mudar('cine-dop-slot', _V);\n  mudar('d2-cajon',      _V);")]),

 # ══ A2 — «LIMPIAR» ════════════════════════════════════════════════════════════════════════
 ('02 «Limpiar» vuelve a alcanzar SOLO la vista del destino', 'TC-899',
  [("      if (typeof _vTodas === 'function' && typeof _vCon === 'function')\n        _vTodas().forEach(V => { if (V) _vCon(V, () => _simpIniciar()); });\n      else _simpIniciar();",
    "      _simpIniciar();")]),

 # ══ A3 — EL MODAL Y EL LIENZO ═════════════════════════════════════════════════════════════
 ('03 el modal vuelve a centrarse vertical', 'TC-900',
  [("'align-items:flex-start;justify-content:center;padding:14px;'",
    "'align-items:center;justify-content:center;padding:14px;'")]),

 ('04 el lienzo vuelve a ceder (flex-shrink 1)', 'TC-900',
  [('#cine-ov [id$="cine-lienzo"] { flex: 0 0 auto; }',
    '#cine-ov [id$="cine-lienzo"] { flex: 1 1 auto; }')]),

 # ══ B2 — LA TABLA ═════════════════════════════════════════════════════════════════════════
 ('05 el valor vuelve a ser texto y no un boton', 'TC-903',
  [("    const val = calc ? valTxt\n      : '<button type=\"button\" class=\"btn btn-ghost med-fbot\" ' +",
    "    const val = valTxt || calc ? valTxt\n      : '<button type=\"button\" class=\"btn btn-ghost med-fbot\" ' +")]),

 ('06 la columna del valor vuelve a 26 %', 'TC-903',
  [("'<colgroup><col style=\"width:46%\"><col style=\"width:20%\"><col style=\"width:34%\">' +",
    "'<colgroup><col style=\"width:42%\"><col style=\"width:26%\"><col style=\"width:32%\">' +")]),

 # ══ B4 a B7 — LAS FILAS Y LA IMAGEN GUARDADA ══════════════════════════════════════════════
 ('07 los calculados vuelven a dibujarse en la tabla de pantalla', 'TC-250',
  [("  return _dopFilas(modo).filter(f => f[8] !== 'calc');",
    "  return _dopFilas(modo);")]),

 ('08 la imagen guardada pierde los calculados (se filtran en el ORIGEN)', 'TC-256,TC-257',
  [("function _dopSeccionesGuardado() {\n  const S = [];\n  const medidas = f => f[1] != null;",
    "function _dopSeccionesGuardado() {\n  const S = [];\n  const medidas = f => f[1] != null && f[8] !== 'calc';")]),

 ('09 el colapso de la VCI vuelve a arrancar en cadena vacia', 'TC-249,TC-250',
  [('           vciDiam:null, vciCol:null },',
    "           vciDiam:null, vciCol:'' },")]),

 # ══ C1 — LA CAPTURA ═══════════════════════════════════════════════════════════════════════
 ('10 la captura deja de ver la ETIQUETA y pierde la franja', 'TC-202',
  [("    if (String(_medEtiqueta || '').trim()) return true;",
    "    if (false) return true;")]),

 # ══ B9 — LA GUIA DE CALIBRACION ═══════════════════════════════════════════════════════════
 ('11 la rama 2D vuelve a delegar en `_medSinCalibrar`', 'TC-903',
  [("    const hay2D = (typeof _medCalib !== 'undefined' && _medCalib) ||\n      ((typeof _medRegs === 'function') && _medRegs().filter(_dcmImgRegionMedible).length > 0);\n    if (!hay2D) return {",
    "    const hay2D = !(typeof _medSinCalibrar === 'function' && _medSinCalibrar());\n    if (!hay2D) return {")]),

 ('12 el eje del TIEMPO ofrece «Calibrar ahora», que no puede calibrar', 'TC-903',
  [("que sí la traen.'],\n        accion: null",
    "que sí la traen.'],\n        accion: '2d'")]),

 # ══ B5 y B6 — LOS CALCULADOS CON SU DUEÑO ═════════════════════════════════════════════════
 ('13 la PmAD se calcula a mano en vez de con `pmadEstimar`', 'TC-901',
  [("  R.pmad = (typeof pmadEstimar === 'function') ? pmadEstimar(T.vciDiam, T.vciCol) : null;",
    "  R.pmad = (T.vciDiam > 0 && T.vciCol) ? { pmad: 5, interp: '', fila: '' } : null;")]),

 ('14 el gasto cardiaco deja de usar la FC del informe', 'TC-901',
  [("  R.gc = (typeof _hemoGCEco === 'function') ? _hemoGCEco(A.diam, A.vtiTsvi, R.fc) : null;",
    "  R.gc = (typeof _hemoGCEco === 'function') ? _hemoGCEco(A.diam, A.vtiTsvi, 60) : null;")]),

 ('15 el volumen sistolico deja de usar `_hemoVSEco`', 'TC-901',
  [("  R.vs = (typeof _hemoVSEco === 'function') ? _hemoVSEco(A.diam, A.vtiTsvi) : null;",
    "  R.vs = (A.diam > 0 && A.vtiTsvi > 0) ? (A.diam * A.vtiTsvi / 10) : null;")]),

 # ══ B1 — LA BARRA ═════════════════════════════════════════════════════════════════════════
 ('16 la fila «Modo» vuelve a verse', 'TC-887',
  [("    _medSideFila('Modo', f1, 'cine-selviejo'),",
    "    _medSideFila('Modo', f1),")]),

 # ══ B8 — LA FC DE SOLO LECTURA ════════════════════════════════════════════════════════════
 ('17 la mini tabla de FC se dibuja DESPUES del return temprano', 'TC-901',
  [("      else { cc.innerHTML = _dopCalcHTML(); cc.style.display = ''; }",
    "      else if (_dopVisible()) { cc.innerHTML = _dopCalcHTML(); cc.style.display = ''; }\n      else { cc.style.display = 'none'; cc.innerHTML = ''; }")]),
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
