#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_d2.py — barrido de MUTACIONES DIRIGIDAS de la TANDA D2 (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits 1 a 4 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-556 se ponga ROJO.

  python3 scripts/_mut_d2.py              # todas
  python3 scripts/_mut_d2.py --solo 1,2   # un grupo

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 03 deja que el mensaje de pantalla
se cuele al papel firmado, la 12 le pone el calendario de monitoreo al informe y la 13 le mete
la cita del folio a la tabla de pantalla. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta probando
nada.

LA 06 Y LA 07 SON EL MISMO ERROR POR DOS PUERTAS: la 06 le da a la casilla de antecedente
coronario un peso unico para las seis columnas y la 07 se lo da solo a la de anti-VEGF. Cada una
sobrevive si la otra la tapa, asi que van separadas.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-556'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # == COMMIT 1 . la calculadora sin farmaco ===========================
 ('01 vuelve a clasificar sin farmaco elegido',
  "  const clasifica = !!farmaco;",
  "  const clasifica = true;"),

 ('02 la capsula pierde su salida temprana y publica la banda igual',
  "  if (!r.clasifica) {\n    fila('Clasificación de EcoSmart (orientativa)', pill('gray', 'Elegí el fármaco para calcular el riesgo'));",
  "  if (false) {\n    fila('Clasificación de EcoSmart (orientativa)', pill('gray', 'Elegí el fármaco para calcular el riesgo'));"),

 ('03 DE MAS: el mensaje de pantalla se cuela a lo que lee el papel',
  "      _g.textContent = 'Completar en «Calculadora de Riesgo CV»';",
  "      _g.textContent = 'Elegí el fármaco para calcular el riesgo';"),

 ('04 el texto del modulo vuelve a afirmar la categoria sin farmaco',
  "  if (!r.clasifica) {\n    p.push(r.factores.length",
  "  if (false) {\n    p.push(r.factores.length"),

 ('05 la derivacion y el calendario dejan de apagarse con la categoria',
  "           seguimiento: clasifica ? _hfaicosSeguimiento(col, clave) : '',\n           derivacion: clasifica ? _hfaicosDerivacion(clave) : '',",
  "           seguimiento: _hfaicosSeguimiento(col, clave),\n           derivacion: _hfaicosDerivacion(clave),"),

 # == COMMIT 2 . las seis columnas de la Tabla 4 ======================
 ('06 la casilla de antecedente coronario recibe un peso unico para las seis columnas',
  "    hfaicos_cv_coron:  { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:null,  mieloma:null, raf_mek:'H' },",
  "    hfaicos_cv_coron:  { antracicline:'H',  trastuzumab:'H',  vegf:'H',  bcr_abl:'H',   mieloma:'H',  raf_mek:'H' },"),

 ('07 solo la celda de anti-VEGF del antecedente coronario baja de muy alto a alto',
  "hfaicos_cv_coron:  { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:null,  mieloma:null, raf_mek:'H' },",
  "hfaicos_cv_coron:  { antracicline:'H',  trastuzumab:'H',  vegf:'H',  bcr_abl:null,  mieloma:null, raf_mek:'H' },"),

 ('08 la hipertension deja de ser un factor alto con anti-VEGF',
  "    hfaicos_hta:       { antracicline:'M1', trastuzumab:'M1', vegf:'H',  bcr_abl:'M2',  mieloma:'M1', raf_mek:'M2' },",
  "    hfaicos_hta:       { antracicline:'M1', trastuzumab:'M1', vegf:'M1', bcr_abl:'M2',  mieloma:'M1', raf_mek:'M2' },"),

 ('09 los peptidos dejan de ser un factor alto con mieloma multiple',
  "    hfaicos_bnp:       { antracicline:'M1', trastuzumab:'M2', vegf:'M1', bcr_abl:null,  mieloma:'H',  raf_mek:'M2' }",
  "    hfaicos_bnp:       { antracicline:'M1', trastuzumab:'M2', vegf:'M1', bcr_abl:null,  mieloma:'M2', raf_mek:'M2' }"),

 ('10 las filas de edad vuelven a ser las mismas en las seis columnas',
  "  if (col === 'raf_mek') return 'M1';                                  // las cuatro filas son M1\n  if (col === 'vegf')    return (edad !== null && edad >= 75) ? 'H' : 'M1';\n  if (col === 'bcr_abl') return (edad !== null && edad >= 75) ? 'H' : 'M2';\n  if (col === 'mieloma') return (edad !== null && edad >= 75) ? 'H' : 'M1';",
  ""),

 ('11 el nombre de la columna en el papel vuelve al ternario binario',
  "      + (COLNOM[r.col] || r.col)",
  "      + (r.col === 'antracicline' ? 'antraciclinas' : 'terapias dirigidas contra HER2')"),

 # == COMMIT 3 . las tablas A y C de HFA-ICOS =========================
 ('12 la matriz deja de salir del dueno y usa un peso fijo por factor',
  "    fila(f.lbl, col => _coT4Rot(PES[f.id][col]));",
  "    fila(f.lbl, col => f.pts + (f.pts === 1 ? ' pt' : ' pts'));"),

 ('13 la regla de combinacion vuelve a tener sus cortes escritos a mano',
  "   ['Alto', 'orange', 'Cualquier factor marcado como «alto», o ' + _CO_T4_CORTES.alto + ' puntos o más entre los moderados.'],",
  "   ['Alto', 'orange', 'Cualquier factor marcado como «alto», o 4 puntos o más entre los moderados.'],"),

 # == COMMIT 4 . el monitoreo ========================================
 ('14 la fila de inmunoterapia vuelve a su texto viejo en las TRES copias',
  "Basal: evaluaci&oacute;n CV, ECG, eco, troponina y p&eacute;ptidos. Despu&eacute;s: ECG y troponina en los ciclos 2, 3 y 4, y luego cada 3 ciclos</td>",
  "ECG y troponina basal y ante s&iacute;ntomas</td>"),

 ('15 DE MAS: el calendario de monitoreo se cuela al informe firmado',
  "    if (t) inf.push('Estratificación de riesgo cardio-oncológico:', t);",
  "    if (t) inf.push('Estratificación de riesgo cardio-oncológico:', t, 'Monitoreo: ECG y troponina en los ciclos 2, 3 y 4.');"),
]

def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            pares = [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c < 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  (%s)' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for r in res if r[2] == 'MUERTA')
    print('\n  %d/%d MUERTAS' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('  !! %02d %s -> %s %s' % (i, nom, v, det[:160]))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
