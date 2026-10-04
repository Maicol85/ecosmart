#!/usr/bin/env python3
"""
_mut_pulmo.py — barrido de mutaciones de la tanda P1/P4/P5 de la pulmonar.

Cada mutacion se aplica sobre una COPIA del repo en /tmp, NUNCA sobre index.html. El md5 del
archivo vivo se sella antes y se comprueba despues: si cambio, el barrido ABORTA.

Corre `test_clinico.mjs --solo <casos>` DESDE la copia (RAIZ se deriva de la ubicacion del
script, asi que copiando scripts/ al /tmp la suite sirve el index.html mutado).

⚠️ DOS GUARDAS QUE EL CLAUDE.md EXIGE Y QUE ESTE ARCHIVO IMPLEMENTA, NO COMENTA:
  1. LINEA BASE PRIMERO. Con los casos ya rojos en la copia sin mutar, TODAS las mutaciones
     saldrian «muertas» sin que eso pruebe nada. Si la base no esta verde, el barrido aborta.
  2. SE EXIGE `RESULTADO` EN LA SALIDA. Si la suite no arranca, stdout queda vacio, no hay
     ningun ✗ y todas las mutaciones parecerian muertas — indistinguible de «no hay cobertura».
     Sin la linea RESULTADO el veredicto es NO CORRIO, no «muerta».

Uso:  python3 scripts/_mut_pulmo.py
"""

import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')

# (id, descripcion, viejo, nuevo, casos que TIENEN que ponerse rojos)
MUTACIONES = [
    ('ME1', 'la tupla de limpiarCampos vuelve a dejar la pulmonar afuera (la fuga de P1)',
     "const VALV_PILL_VALVS = Object.freeze(['mitral','aortica','tricuspide','pulmonar']);",
     "const VALV_PILL_VALVS = Object.freeze(['mitral','aortica','tricuspide']);",
     ['TC-413']),

    ('ME2', 'el adjetivo «pulmonar» vuelve aunque la oracion abra con «Valvula pulmonar»',
     "const _adjE = _vpConMorf ? '' : ' pulmonar';",
     "const _adjE = ' pulmonar';",
     ['TC-414']),

    ('ME3', 'las siglas vuelven a PmAP/PdAP en vez de PAPm/PAPd',
     "if (_papmNum !== null) ps.push(`PAPm de ${_papmNum} mmHg`);",
     "if (_papmNum !== null) ps.push(`PmAP de ${_papmNum} mmHg`);",
     ['TC-414']),

    ('ME4', 'se invierte el orden: la estenosis vuelve a ir primero',
     "const fr = [_ipFragE, _epFragE].filter(Boolean);",
     "const fr = [_epFragE, _ipFragE].filter(Boolean);",
     ['TC-412', 'TC-414']),

    ('ME5', 'se desconecta la rama del estandar (vuelve el camino de dos oraciones)',
     "if (_vpEstandar && !_epEsProt && _lesionesE) {",
     "if (false && _vpEstandar && !_epEsProt && _lesionesE) {",
     ['TC-412', 'TC-414']),

    ('ME6', 'el motivo del ajuste manual deja de colgarse de la oracion',
     "if (_epDiscrepa && _epNotaTxt) cuerpo += (cuerpo ? ', ' : '') + `pero con ${_epNotaTxt}`;",
     "if (false && _epDiscrepa && _epNotaTxt) cuerpo += (cuerpo ? ', ' : '') + `pero con ${_epNotaTxt}`;",
     ['TC-414']),

    ('ME7', 'el separador del parentesis deja de distinguir el ajuste manual',
     "let cuerpo = ps.join(_epDiscrepa ? ' y ' : ', ');",
     "let cuerpo = ps.join(', ');",
     ['TC-414']),

    ('ME8', 'las presiones se publican sin PmAD (4*V2 con nombre de presion)',
     "const _papmNum = (ipProto !== null && ipPmad !== null) ? (4 * ipProto * ipProto + ipPmad).toFixed(0) : null;",
     "const _papmNum = (ipProto !== null) ? (4 * ipProto * ipProto + (ipPmad || 0)).toFixed(0) : null;",
     ['TC-414']),

    ('ME9', 'la columna fija de la grilla se cambia por auto-placement (P4)',
     "#vp-lesiones > #bloque-esten-pulmonar { grid-column: 2; }",
     "#vp-lesiones > #bloque-esten-pulmonar { }",
     []),   # declarada SIN caso: la maquetacion no tiene cobertura en la suite (ver abajo)
]

TODOS = sorted({c for m in MUTACIONES for c in m[4]})


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def correr(base, casos):
    """Devuelve (ok_arranco, set_de_rojos). ok_arranco=False si no hubo linea RESULTADO."""
    r = subprocess.run(
        ['node', os.path.join(base, 'scripts', 'test_clinico.mjs'), '--solo', ','.join(casos)],
        cwd=base, capture_output=True, text=True, timeout=1800)
    out = (r.stdout or '') + (r.returncode and (r.stderr or '') or '')
    if 'RESULTADO' not in out:
        return False, set(), out[-600:]
    rojos = set(re.findall(r'(TC-\d+)[^\n]*✗', out))
    return True, rojos, out[-600:]


def main():
    sello = md5(VIVO)
    print('md5 del archivo VIVO antes del barrido: %s' % sello)

    base = tempfile.mkdtemp(prefix='ecosmart-mut-pulmo-')
    shutil.copy2(VIVO, os.path.join(base, 'index.html'))
    shutil.copytree(os.path.join(RAIZ, 'scripts'), os.path.join(base, 'scripts'))
    # La suite lee algunos archivos del repo (tests/, docs/); se copia lo que exista y sea liviano.
    for d in ('tests',):
        o = os.path.join(RAIZ, d)
        if os.path.isdir(o):
            shutil.copytree(o, os.path.join(base, d))
    copia_idx = os.path.join(base, 'index.html')
    orig = open(copia_idx, encoding='utf-8').read()
    print('copia de trabajo: %s' % base)

    # ── GUARDA 1: la linea base tiene que estar VERDE en la copia sin mutar ──
    print('\nLINEA BASE (copia sin mutar), casos %s' % ','.join(TODOS))
    ok, rojos, cola = correr(base, TODOS)
    if not ok:
        print('  NO CORRIO — sin linea RESULTADO. Se aborta.\n' + cola)
        shutil.rmtree(base, ignore_errors=True); sys.exit(2)
    if rojos:
        print('  BASE EN ROJO (%s). Se aborta: con casos ya rojos, toda mutacion sale '
              '«muerta» sin probar nada.' % ','.join(sorted(rojos)))
        shutil.rmtree(base, ignore_errors=True); sys.exit(2)
    print('  base verde: los %d casos pasan sin mutacion.' % len(TODOS))

    resultados = []
    for mid, desc, viejo, nuevo, esperados in MUTACIONES:
        if not esperados:
            resultados.append((mid, 'SIN COBERTURA DECLARADA', desc))
            print('\n%s  %s\n  (declarada sin caso: no se puntua)' % (mid, desc))
            continue
        if orig.count(viejo) != 1:
            resultados.append((mid, 'NO APLICABLE (ancla %dx)' % orig.count(viejo), desc))
            print('\n%s  ancla encontrada %d veces, se saltea' % (mid, orig.count(viejo)))
            continue
        open(copia_idx, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
        ok, rojos, cola = correr(base, esperados)
        if not ok:
            estado = 'NO CORRIO'
        elif set(esperados) & rojos:
            estado = 'MUERTA (rojo: %s)' % ','.join(sorted(set(esperados) & rojos))
        else:
            estado = 'SOBREVIVIO'
        resultados.append((mid, estado, desc))
        print('\n%s  %s\n  -> %s' % (mid, desc, estado))

    open(copia_idx, 'w', encoding='utf-8').write(orig)

    ahora = md5(VIVO)
    print('\nmd5 del archivo VIVO despues del barrido: %s' % ahora)
    if ahora != sello:
        print('⚠️  EL ARCHIVO VIVO CAMBIO DURANTE EL BARRIDO. Resultados NO confiables.')
        shutil.rmtree(base, ignore_errors=True); sys.exit(3)
    print('md5 IGUAL: el archivo vivo no se toco.')

    print('\nRESULTADO MUTACIONES:')
    muertas = 0
    puntuadas = 0
    for mid, estado, desc in resultados:
        print('  %-5s %-28s %s' % (mid, estado, desc))
        if estado.startswith('MUERTA'):
            muertas += 1
        if estado.startswith(('MUERTA', 'SOBREVIVIO')):
            puntuadas += 1
    print('\n  %d/%d MUERTAS (de las puntuadas)' % (muertas, puntuadas))
    shutil.rmtree(base, ignore_errors=True)
    sys.exit(0 if muertas == puntuadas else 1)


if __name__ == '__main__':
    main()
