#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_ao2.py — barrido de MUTACIONES DIRIGIDAS de la TANDA AORTA-2 (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits 1 a 3 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-555 se ponga ROJO.

  python3 scripts/_mut_ao2.py              # todas
  python3 scripts/_mut_ao2.py --solo 1,2   # un grupo

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 07 le pone el chip de criterio
propio a TODOS los segmentos —tambien a los dos que ahora tienen fuente—, la 09 mete la cita de
la Figura 5 en el papel firmado, la 11 publica la coartacion tambien con la seccion integrada
—o sea dos veces en el mismo resumen— y la 12 le agrega la clase y el folio a la linea
descriptiva del EN SUMA. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS,
y un control negativo que ninguna mutacion puede romper no esta probando nada.

LA 03 Y LA 04 SON EL MISMO ERROR POR DOS PUERTAS, y por eso van separadas: la 03 le devuelve a
la rama por sexo de aoSegDil el >= que era de la raiz —y con eso mueve el borde del varon en el
informe FIRMADO— y la 04 le devuelve a la franja sin sexo su comparacion escrita. Las dos
sobreviven si la otra las tapa, asi que cada una tiene su propio borde medido.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-555'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # == COMMIT 1 . los segmentos de la Figura 5 =========================
 ('01 la union sinotubular pierde su corte por sexo y vuelve al 38 unico',
  "ref:AO_REF.st,  refSexo:AO_ST_MM,  fig5:true, min:10, max:80",
  "ref:AO_REF.st,  fig5:true, min:10, max:80"),

 ('02 la aorta ascendente pierde su corte por sexo y vuelve al 40 unico',
  "ref:AO_REF.tub, refSexo:AO_TUB_MM, fig5:true, min:10, max:90",
  "ref:AO_REF.tub, fig5:true, min:10, max:90"),

 ('03 la rama por sexo de aoSegDil recupera el >= de la raiz: 38,0 exactos pasan a dilatados',
  "    if (aoSegPasa(sg, x, aoSegRef(sg, src))) return true;",
  "    const _r = aoSegRef(sg, src);\n    if (_r != null && x >= _r) return true;"),

 ('04 la franja sin sexo vuelve a su comparacion escrita con el >= de la raiz',
  "    if (!_votaIda && aoSegPasa(sg, x, _bajo) && !aoSegPasa(sg, x, _alto)) return 'sinsexo';",
  "    if (!_votaIda && x >= _bajo && x < _alto) return 'sinsexo';"),

 ('05 los dos segmentos de la Figura 5 vuelven a afirmar «dilatada»',
  "  if (sg && sg.fig5) return AO_FIG5_TXT;",
  "  if (false) return AO_FIG5_TXT;"),

 ('06 la capsula pierde el corte y la cita de la Figura 5',
  "                                         + ' (' + aoSegSim(sg, 'dil') + _ref + 'mm \\u2014 ' + AO_FIG5_CITA + ')';",
  "                                         + '';"),

 ('07 (DE MAS) el chip de criterio propio se le pone a TODOS los segmentos',
  "      + (sg.ecosmart && m.grado !== 'fuera' ? ' ' + badge('gray', 'Criterio de EcoSmart') : ''));",
  "      + (m.grado !== 'fuera' ? ' ' + badge('gray', 'Criterio de EcoSmart') : ''));"),

 ('08 el EN SUMA vuelve a decir «Dilatacion» para los segmentos de la Figura 5',
  "        } else if (x.sg.fig5) {",
  "        } else if (false) {"),

 ('09 (DE MAS) la cita de la Figura 5 entra al papel firmado',
  "    const gTxt = m => aoSegDicho(m && m.sg);",
  "    const gTxt = m => aoSegDicho(m && m.sg) + ' (' + AO_FIG5_CITA + ')';"),

 ('10 el globo de los dos segmentos propios deja de publicar los otros seis tramos',
  "  const orden = D.tramos.concat(Object.keys(AO_FIG5).filter(function (k) { return D.tramos.indexOf(k) < 0 }));",
  "  const orden = D.tramos.slice();"),

 # == COMMIT 2 . la coartacion en el EN SUMA ==========================
 ('11 (DE MAS) la coartacion se publica tambien con la seccion integrada: dos veces',
  "    if (chk && chk.checked) return;\n    const t = (typeof coaSumaFrase === 'function') ? coaSumaFrase() : null;",
  "    if (false) return;\n    const t = (typeof coaSumaFrase === 'function') ? coaSumaFrase() : null;"),

 ('12 (DE MAS) la linea descriptiva del EN SUMA gana su clase y su folio',
  "(p.length ? ' (' + p.join(', ') + ')' : '') + '.';",
  "(p.length ? ' (' + p.join(', ') + ')' : '') + ' \u2014 Clase I \u00b7 Nivel C (ESC 2024, Tabla 69 \u00b7 folio 121).';"),

 ('13 el EN SUMA vuelve a exigir la seccion integrada para nombrar la coartacion',
  "    const t = (typeof coaSumaFrase === 'function') ? coaSumaFrase() : null;\n    if (t) suma.push(t);",
  "    const t = null;\n    if (t) suma.push(t);"),

 # == COMMIT 3 . los nueve factores en tres estados ===================
 ('14 los seis factores preguntados vuelven a DOS estados: el «no» cae en sin evaluar',
  "    if (r === 'si') presentes.push(p[1]);\n    else if (r === 'no') ausentes.push(p[1]);\n    else sinEvaluar.push(p[1]);",
  "    if (r === 'si') presentes.push(p[1]);\n    else sinEvaluar.push(p[1]);"),
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
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
