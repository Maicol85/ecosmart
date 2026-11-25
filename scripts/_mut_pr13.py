#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr13.py - barrido de MUTACIONES DIRIGIDAS de la tanda PR13 (2026-11-25).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr13.py              # todas
  python3 scripts/_mut_pr13.py --solo 1,2   # algunas
  python3 scripts/_mut_pr13.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. EXIGE LA LINEA RESULTADO EN LA SALIDA: si el
suite no arranca, stdout queda vacio y TODAS saldrian «sobrevivio», indistinguible de «no hay
cobertura». LAS ANCLAS SE VERIFICAN ANTES DE CORRER.

AL MENOS DOS POR GRUPO, y los grupos son los cuatro que esta tanda toca: la leyenda (1), los seis
sectores (2), el color del texto (3) y la formula (4), mas la geometria derivada (5).

CUATRO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS -que los nueve rotulos no se pisen, que el texto del mapa siga siendo el de la
pestania donde alcanza, y que el descargo de la captura siga entrando-, y un control negativo que
ninguna mutacion puede romper no prueba nada.

MATA EL CHROME HUERFANO DESPUES DE CADA CORRIDA.
"""
import hashlib, os, re, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) - `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ══ GRUPO 1 · LA LEYENDA ══
 ('01 la leyenda vuelve a ocho rotulos: pierde el borde derecho', 'TC-1068',
  "  const v = m.concat([mn + nt * pa]);",
  "  const v = m.slice();"),
 ('02 los extremos pierden el menor-igual y el mayor-igual', 'TC-1068',
  "    if (i === 0) return '≤ ' + t;\n    if (i === v.length - 1) return '≥ ' + t;",
  "    if (i === 0) return t;\n    if (i === v.length - 1) return t;"),
 ('03 los rotulos se alinean a la izquierda del borde en vez de centrarse', 'TC-1068',
  "  cx2.textAlign = 'center';\n  bordes.forEach(function (t, i) {",
  "  cx2.textAlign = 'left';\n  bordes.forEach(function (t, i) {"),
 ('04 el texto explicativo vuelve a UNA sola linea sin envolver', 'TC-1068',
  "  const leyLineas = _strEnvolver(cx2, LEY_TXT, leyAncho, 2);",
  "  const leyLineas = [LEY_TXT];"),
 ('05 el cuadrado de sin dato vuelve a la MISMA fila que la barra', 'TC-1068',
  "  const gy = ly + u(26), gw = u(14), gh = u(9);",
  "  const gy = ly, gw = u(14), gh = u(9);"),
 ('06 DE MAS: la barra vuelve al 46 por ciento y los nueve rotulos se pisan (control)', 'TC-1068',
  "  const ly = cy + r + u(34), lw = S * 0.70, lx = cx - lw / 2;",
  "  const ly = cy + r + u(34), lw = S * 0.46, lx = cx - lw / 2;"),

 # ══ GRUPO 2 · LOS SEIS SECTORES ══
 ('07 el disco del centro se come mas de la mitad del sector', 'TC-1069',
  "const _STR_R_DISCO = 0.24;",
  "const _STR_R_DISCO = 0.60;"),
 ('08 el color de un sector deja de salir del tramo de su valor', 'TC-1069',
  "    cx2.fillStyle = t ? _strColorPct(t.pct) : _strGris();\n    cx2.fill();",
  "    cx2.fillStyle = t ? _strPalColor(3) : _strGris();\n    cx2.fill();"),
 ('09 el numero vuelve al PUNTO decimal', 'TC-1069',
  "  try { if (typeof _scN === 'function') return _scN(pct, 1) + ' %'; } catch (e) {}",
  "  return (Math.round(pct * 10) / 10).toFixed(1) + ' %';\n  try { if (typeof _scN === 'function') return _scN(pct, 1) + ' %'; } catch (e) {}"),
 ('10 el nombre y el numero vuelven al desplazamiento en la y de pantalla', 'TC-1069',
  "  const rhoNom = rIn + rangoR * 0.72;\n  const rhoNum = rIn + rangoR * 0.36;",
  "  const rhoNom = rIn + rangoR * 0.54;\n  const rhoNum = rIn + rangoR * 0.54;"),
 ('11 el pie deja de decir cuantas paredes tienen valor', 'TC-1069',
  "    cx2.fillText(R.nVistas + (R.nVistas === 1 ? ' vista' : ' vistas') + ' · ' +\n                 nConDato + (nConDato === 1 ? ' pared' : ' paredes') +\n                 ' · el ápex (17) no lo mide este método', cx, cy + r + u(26));",
  "    cx2.fillText(R.nVistas + (R.nVistas === 1 ? ' vista' : ' vistas') +\n                 ' · el ápex (17) no lo mide este método', cx, cy + r + u(26));"),
 ('12 vuelve un ANILLO: el tercio interno de cada sector se pinta gris', 'TC-201',
  "  _STR_SECTORES.forEach(function (sc) {\n    const t = porPared[sc.pared];\n    sector(rIn, r, sc.a[0], sc.a[1]);",
  "  _STR_SECTORES.forEach(function (sc) {\n    const t = porPared[sc.pared];\n    sector(rIn, rIn + (r - rIn) * 0.45, sc.a[0], sc.a[1]);\n    cx2.fillStyle = _strGris(); cx2.fill();\n    sector(rIn + (r - rIn) * 0.45, r, sc.a[0], sc.a[1]);"),
 ('13 el sector sin dato deja de decir Sin dato', 'TC-1069',
  "    const txt = t ? _strFmt(t.pct) : 'Sin dato';",
  "    const txt = t ? _strFmt(t.pct) : '';"),

 # ══ GRUPO 3 · EL COLOR DEL TEXTO ══
 ('14 el texto del mapa vuelve al oscuro fijo de antes de PR13', 'TC-1070',
  "function _strTxtSobre(i) {\n  const fondo = _strPalColor(i), prop = _strPalTxt(i);",
  "function _strTxtSobre(i) {\n  return '#111827';\n  const fondo = _strPalColor(i), prop = _strPalTxt(i);"),
 ('15 el texto usa el de la paleta SIN endurecer, y el tramo 7 queda en 3,34', 'TC-1070',
  "    if (_medContraste(_medLumDe(prop).L, _medLumDe(fondo).L) >= 4.5) return prop;",
  "    if (true) return prop;"),
 ('16 DE MAS: se endurece en TODOS y deja de ser el de la pestania donde alcanza (control)', 'TC-1070',
  "    if (_medContraste(_medLumDe(prop).L, _medLumDe(fondo).L) >= 4.5) return prop;",
  "    if (_medContraste(_medLumDe(prop).L, _medLumDe(fondo).L) >= 99) return prop;"),

 # ══ GRUPO 4 · LA FORMULA ══
 ('17 la formula divide por el largo de SISTOLE en vez del de diastole', 'TC-1071',
  "      const pct = (ls - ld) / ld * 100;",
  "      const pct = (ls - ld) / ls * 100;"),
 ('18 la formula pasa a una DIFERENCIA y deja de ser un cociente', 'TC-1071',
  "      terr.push({ vista:V.k, vistaRot:V.rot, pared:V.paredes[i], ld, ls, pct,",
  "      terr.push({ vista:V.k, vistaRot:V.rot, pared:V.paredes[i], ld, ls, pct: (ls - ld) * -1,"),
 ('19 el SGL deja de ser el promedio de los seis', 'TC-1071',
  "  const sgl = terr.reduce((a, t) => a + t.pct, 0) / terr.length;",
  "  const sgl = terr.reduce((a, t) => a + t.pct, 0) / Math.max(1, terr.length - 1);"),

 # ══ GRUPO 5 · LA GEOMETRIA DERIVADA ══
 ('20 DE MAS: el radio vuelve a ser una constante y el descargo se sale del canvas (control)', 'TC-1068',
  "  const r = Math.max(u(40), (S - u(uArriba) - u(uDebajo)) / 2);",
  "  const r = S * (conTitulo ? 0.27 : 0.335);"),
 ('21 el dibujante deja de publicar donde dibujo', 'TC-201',
  "  return { ly: yFin, esc: esc, cx: cx, cy: cy, r: r, rIn: rIn };",
  "  return { ly: yFin, esc: esc };"),
]

def aplicar(viejo, nuevo):
    with open(IDX, encoding='utf-8') as f:
        s = f.read()
    n = s.count(viejo)
    if n != 1:
        return None, n
    return s.replace(viejo, nuevo, 1), 1

def main():
    args = sys.argv[1:]
    solo = None
    if '--solo' in args:
        solo = set(int(x) for x in args[args.index('--solo') + 1].split(','))
    base = md5(IDX)
    if '--anclas' in args:
        malas = 0
        for i, (nombre, caso, viejo, nuevo) in enumerate(MUT, 1):
            with open(IDX, encoding='utf-8') as f:
                s = f.read()
            n = s.count(viejo)
            if n != 1:
                malas += 1
                print('  x%d  %02d %s' % (n, i, nombre))
            else:
                print('  ok  %02d %s  [%s]' % (i, nombre, caso))
        print('\n  anclas que NO emparejan exactamente una vez: %d de %d' % (malas, len(MUT)))
        sys.exit(1 if malas else 0)

    orig = os.path.join(RAIZ, '.mut_pr13_orig.html')
    shutil.copy2(IDX, orig)
    muertas, vivas, nocorrio = [], [], []
    try:
        for i, (nombre, caso, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            s2, n = aplicar(viejo, nuevo)
            if s2 is None:
                nocorrio.append((i, nombre, 'el ancla aparece %d veces' % n))
                print('  %02d  NO CORRIO (ancla x%d)  %s' % (i, n, nombre))
                continue
            with open(IDX, 'w', encoding='utf-8') as f:
                f.write(s2)
            r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                               cwd=RAIZ, capture_output=True, text=True)
            sal = (r.stdout or '') + (r.stderr or '')
            shutil.copy2(orig, IDX)
            subprocess.run(['pkill', '-f', 'remote-debugging-port=0 --user-data'],
                           capture_output=True)
            if 'RESULTADO' not in sal:
                nocorrio.append((i, nombre, 'sin linea RESULTADO'))
                print('  %02d  NO CORRIO  %s' % (i, nombre))
                continue
            m = re.search(r'RESULTADO: (\d+)/(\d+)', sal)
            ok, tot = (int(m.group(1)), int(m.group(2))) if m else (1, 1)
            if ok < tot:
                muertas.append((i, nombre, caso))
                print('  %02d  MUERTA     %s  [%s]' % (i, nombre, caso))
            else:
                vivas.append((i, nombre, caso))
                print('  %02d  SOBREVIVIO %s  [%s]' % (i, nombre, caso))
    finally:
        shutil.copy2(orig, IDX)
        os.remove(orig)
        subprocess.run(['pkill', '-f', 'remote-debugging-port=0 --user-data'], capture_output=True)

    fin = md5(IDX)
    print('\n  md5 antes %s / despues %s  ->  %s'
          % (base[:8], fin[:8], 'IGUAL' if base == fin else 'DISTINTO (!!)'))
    print('  muertas %d  ·  sobrevivieron %d  ·  no corrieron %d'
          % (len(muertas), len(vivas), len(nocorrio)))
    for i, nombre, caso in vivas:
        print('    SOBREVIVIO  %02d %s  [%s]' % (i, nombre, caso))
    for i, nombre, motivo in nocorrio:
        print('    NO CORRIO   %02d %s  (%s)' % (i, nombre, motivo))
    sys.exit(1 if (vivas or nocorrio or base != fin) else 0)

main()
