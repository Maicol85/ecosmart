#!/usr/bin/env python3
"""
_mut_vi3d.py — arnes TEMPORAL de mutaciones para la tanda del VI 3D.

Cada cambio de esta tanda tiene que poder ponerse ROJO: un caso que no se puede hacer fallar no
esta probando nada. Acá se revierte un cableado por vez y se exige que la asercion que le
corresponde pase de verde a rojo.

TRES GUARDAS, y ninguna es decorativa — las tres nacen de defectos reales de este repo:

 1. NUNCA se muta el archivo vivo. Se trabaja sobre una COPIA en /tmp. Mutar el original y
    restaurar desde un snapshot es una maquina de deshacer ediciones en silencio.
 2. md5 del archivo vivo ANTES y DESPUES. Si cambio en el medio, se aborta: significa que algo
    mas lo estaba editando y ninguna medicion de la corrida vale.
 3. SE EXIGE la linea «RESULTADO» en la salida antes de puntuar. Si la sonda no arranca, stdout
    queda vacio, no hay ningun ✗ y TODAS las mutaciones saldrian «sobrevivio» — indistinguible
    de «no hay cobertura». Ese defecto exacto reporto 7 falsos en este repo. Sin RESULTADO el
    veredicto es NO CORRIO, no «sobrevivio».

Y la linea base se mide PRIMERO: con aserciones ya rojas de entrada, todas las mutaciones salen
«en rojo» sin que eso pruebe nada.

Uso:  python3 scripts/_mut_vi3d.py
"""

import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')
SONDA = os.path.join(RAIZ, 'scripts', '_probe_vi3d.mjs')


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for ch in iter(lambda: f.read(1 << 20), b''):
            h.update(ch)
    return h.hexdigest()


# (nombre, viejo, nuevo, aserciones que DEBEN ponerse rojas, [motivo si se ESPERA que sobreviva])
#
# El quinto campo existe para UNA mutacion y vale la pena explicarlo: hay cableados REDUNDANTES
# a proposito, y marcarlos evita que el proximo lector confunda «esta cubierto dos veces» con
# «esto no esta probado». Sin esta distincion, un superviviente legitimo empuja a agregar una
# asercion que no mide nada nuevo, o peor, a sacar la red de contencion para que la mutacion
# «funcione».
MUTACIONES = [
    ('M01 el 3D no avisa al cambiar un segmento (se corta contrNotificar)',
     "function contrNotificar(id){\n  contrAplicar(id);\n  contrRenderInforme();\n  if (typeof lv3dAlCambiarEstado === 'function') lv3dAlCambiarEstado();",
     "function contrNotificar(id){\n  contrAplicar(id);\n  contrRenderInforme();\n  if (false) lv3dAlCambiarEstado();",
     ['P2-4', 'P2-5']),

    ('M02 el cambio masivo no avisa al 3D (se corta contrNotificarTodos)',
     "function contrNotificarTodos(){\n  contrAplicarTodos();\n  contrRenderInforme();\n  if (typeof lv3dAlCambiarEstado === 'function') lv3dAlCambiarEstado();",
     "function contrNotificarTodos(){\n  contrAplicarTodos();\n  contrRenderInforme();\n  if (false) lv3dAlCambiarEstado();",
     ['P2-10']),

    ('M03 el canvas escribe contrEstado directo en vez de usar la via unica',
     "    contrSetSegmento(id, (Number(contrEstado[id]) || 0) + 1);",
     "    contrEstado[id] = ((Number(contrEstado[id]) || 0) + 1) % CONTR_MOTILIDAD.length;",
     ['P2-1', 'P2-2', 'P2-3']),

    ('M04 no se cancela el bucle al cerrar (se pierde el identificador)',
     "function lv3dDetener(){\n  if (_lv3d.raf !== null){ cancelAnimationFrame(_lv3d.raf); _lv3d.raf = null; }",
     "function lv3dDetener(){\n  if (false){ cancelAnimationFrame(_lv3d.raf); _lv3d.raf = null; }",
     ['P6-2', 'P6-3', 'P6-5', 'P6-7']),

    ('M05 no se apaga al cambiar de pestaña',
     "  if (typeof lv3dDetener === 'function') lv3dDetener();\n  document.querySelectorAll('.tab-section')",
     "  if (false) lv3dDetener();\n  document.querySelectorAll('.tab-section')",
     ['P6-3'],
     'SOBREVIVE POR DISEÑO: la red de contencion de lv3dCuadro (offsetParent === null) apaga el '
     'bucle en el primer cuadro tras el cambio de pestaña, y lo hace ANTES de incrementar el '
     'contador, asi que el delta sigue dando 0. El enganche de showTab no es la unica defensa: '
     'cancela el RAF ya encolado en el acto en vez de dejar una devolucion pendiente. Para matar '
     'esta mutacion habria que sacar la red de contencion, que es justamente la que cubre los '
     'caminos no enumerados.'),

    ('M06 no se apaga al cerrar el acordeon',
     "    if (!open){ if (typeof lv3dDetener === 'function') lv3dDetener(); }",
     "    if (!open){ if (false) lv3dDetener(); }",
     ['P6-5']),

    ('M07 no se cierra al limpiar el estudio',
     "  if (typeof lv3dCerrar === 'function') lv3dCerrar();\n  // Nuevo estudio: la card de severidades",
     "  if (false) lv3dCerrar();\n  // Nuevo estudio: la card de severidades",
     ['P6-7']),

    ('M08 el canvas no se repinta al cambiar de tema',
     "  if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema();",
     "  if (false) lv3dAlCambiarTema();",
     ['TEMA-1']),

    ('M09 la ganancia NO se resuelve: la FEVI deja de mandar la amplitud',
     "  let lo = 0, hi = gTope;\n  for (let i=0;i<40;i++){ const m = (lo+hi)/2; if (lv3dEFModelo(m) < fevi) lo = m; else hi = m; }\n  return { G:(lo+hi)/2, aviso:'' };",
     "  return { G:1, aviso:'' };",
     ['AMP-1']),

    ('M10 no se declara el caso inalcanzable (se dibuja una contraccion falsa)',
     "  if (efTope < fevi - 0.5) return { G:1, aviso:'inalcanzable' };",
     "  if (false) return { G:1, aviso:'inalcanzable' };",
     ['AMP-2', 'AMP-2b']),

    ('M11 sin FEVI no se avisa que la amplitud es ilustrativa',
     "  if (fevi === null) return { G:1, aviso:'sinFevi' };",
     "  if (fevi === null) return { G:1, aviso:'' };",
     ['AMP-4']),

    ('M12 el VSF se publica como «medido» en vez de «calculado»',
     "    if (x >= 0){ d.vsf.val = x; d.vsf.crudo = x; d.vsf.org = 'calculado'; }",
     "    if (x >= 0){ d.vsf.val = x; d.vsf.crudo = x; d.vsf.org = 'medido'; }",
     ['P5-b VDF+FEVI: VSF calculado']),

    ('M13 vuelve a estimar un volumen desde el DDVI (Teichholz reintroducido)',
     "  const d = { vdf:lee('vdfvi'), vsf:lee('vsfvi'), fevi:lee('fevi'), dd:lee('ddfvi'),",
     "  const _t = (function(){ const q = lee('ddfvi'); if (q.val === null) return null; const c = q.val/10; return (7.0/(2.4 + c))*c*c*c; })();\n  const _v = lee('vdfvi'); if (_v.val === null && _t !== null){ _v.val = _t; _v.crudo = _t; _v.org = 'calculado'; }\n  const d = { vdf:_v, vsf:lee('vsfvi'), fevi:lee('fevi'), dd:lee('ddfvi'),",
     ['P5-c FEVI+DD sin volumen: VDF no cargado', 'P5-c NO publica ningun volumen derivado del diametro']),

    ('M14 los controles del panel llevan id y los barridos del estudio los levantan',
     '<input type="range" class="lv3d-fase" data-ui min="0" max="100" value="0" step="1"',
     '<input type="range" id="lv3d_fase" class="lv3d-fase" data-ui min="0" max="100" value="0" step="1"',
     ['P7-2']),

    ('M15 el panel abierto deja de apilarse por debajo de 768 px',
     "  const angosto = window.innerWidth < 768;",
     "  const angosto = false;",
     ['LAY-3', 'LAY-4', 'LAY-5']),

    ('M16 el panel no se oculta con el 3D cerrado',
     "  if (panel) panel.style.display = 'none';\n  lv3dMaquetar();                     // devuelve la tarjeta a UNA columna, como estaba",
     "  if (panel) panel.style.display = 'block';\n  lv3dMaquetar();                     // devuelve la tarjeta a UNA columna, como estaba",
     ['P3-1']),

    ('M17 los colores dejan de salir de CONTR_MOTILIDAD (paleta propia, como la demo)',
     "      const col = lv3dRGB((CONTR_MOTILIDAD[idx] || CONTR_MOTILIDAD[0]).color)",
     "      const col = lv3dRGB(['#58BD69','#D1C547','#D68A3A','#D14B4B','#8460D3'][idx] || '#58BD69')",
     ['PAL-1', 'PAL-2', 'PAL-5']),

    # ── Las cuatro de abajo cubren lo que destapo /sharp-edges sobre este mismo diff ──
    ('M18 los controles del panel dejan de excluirse de secAutoOpen (acordeon que se abre solo)',
     ".sacc-body input:not([readonly]):not([data-espejo]):not([data-ui]), .sacc-body select:not([data-espejo]):not([data-ui]), .sacc-body textarea:not([data-ui])",
     ".sacc-body input:not([readonly]):not([data-espejo]), .sacc-body select:not([data-espejo]), .sacc-body textarea",
     ['SHARP-2']),

    ('M19 la ganancia vuelve a probarse en UN SOLO extremo (falsos «inalcanzable»)',
     "  let gTope = 0, efTope = -Infinity;\n  for (let i=0;i<=PASOS;i++){\n    const G = i*GMAX/PASOS, ef = lv3dEFModelo(G);\n    if (ef > efTope){ efTope = ef; gTope = G; }\n  }\n  if (efTope < fevi - 0.5) return { G:1, aviso:'inalcanzable' };\n  let lo = 0, hi = gTope;",
     "  if (lv3dEFModelo(GMAX) < fevi - 0.5) return { G:1, aviso:'inalcanzable' };\n  let lo = 0, hi = GMAX;",
     ['SHARP-4'],
     'SOBREVIVE POR DISEÑO, Y MEDIDO: la no-monotonia de lv3dEFModelo es REAL —hay maximo '
     'interior— pero ninguna FEVI CREIBLE cae en la franja donde el test del extremo se '
     'equivoca. Medidos 8 patrones: con 8 discineticos o la mitad, la joroba mide 0,27 pp, '
     'menos que la tolerancia de 0,5 pp; y todos los patrones con joroba grande (mitad o mas '
     'aneurismaticos: 31 a 179 pp) tienen su PICO en 0,0-0,3 %, muy por debajo del piso de '
     'plausibilidad de la FEVI, que es 5 %. O sea que esas FEVI ya se rechazan por banda antes '
     'de llegar al solver. El barrido de grilla deja el solver correcto POR CONSTRUCCION en vez '
     'de por suerte, pero no cierra un defecto alcanzable y no hay caso de prueba honesto que '
     'lo distinga. Si alguna vez se amplia la banda de la FEVI por debajo de 5, esto pasa a ser '
     'alcanzable y la mutacion deberia morir.'),

    ('M20 el panel vuelve a leer con v() pelado, sin banda de plausibilidad',
     "    const p = (typeof vPlaus === 'function') ? vPlaus(id) : null;\n    if (!p) return { val:null, crudo:null, fuera:false, org:null };\n    return { val:p.val, crudo:p.crudo, fuera:!!p.fuera,",
     "    const _n = (typeof v === 'function') ? v(id) : null;\n    const p = { val:_n, crudo:_n, fuera:false };\n    return { val:p.val, crudo:p.crudo, fuera:!!p.fuera,",
     ['SHARP-5', 'SHARP-7', 'SHARP-8']),

    ('M21 se pierde la rama «fuera de banda» y vuelve a culpar a la motilidad del paciente',
     "  if (d.fevi.fuera){\n    notas.push(['a', 'La FEVI cargada está fuera de lo medible, así que no se usó para la amplitud. '\n      + 'El dibujo muestra solo el patrón segmentario.']);\n  } else if (aviso === 'inalcanzable'){",
     "  if (false){\n    notas.push(['a', 'La FEVI cargada está fuera de lo medible, así que no se usó para la amplitud. '\n      + 'El dibujo muestra solo el patrón segmentario.']);\n  } else if (aviso === 'inalcanzable'){",
     ['SHARP-8']),
]


def correr(raiz_mut):
    env = dict(os.environ, VI3D_RAIZ=raiz_mut)
    try:
        r = subprocess.run(['node', SONDA], capture_output=True, text=True,
                           timeout=420, env=env, cwd=RAIZ)
    except subprocess.TimeoutExpired:
        return None, 'TIMEOUT'
    salida = (r.stderr or '') + (r.stdout or '')
    # ⚠️ GUARDA 3: sin RESULTADO no se puntua.
    if 'RESULTADO:' not in salida:
        return None, 'NO CORRIO (sin RESULTADO)'
    rojas = set(re.findall(r'^\s*✗ (.+)$', salida, re.M))
    m = re.search(r'RESULTADO: (\d+)/(\d+)', salida)
    return (rojas, m.group(0)), None


def main():
    h0 = md5(VIVO)
    print('index.html vivo md5 = %s' % h0)

    base = tempfile.mkdtemp(prefix='mut_vi3d_base_')
    shutil.copy2(VIVO, os.path.join(base, 'index.html'))
    shutil.copytree(os.path.join(RAIZ, 'tests'), os.path.join(base, 'tests'))
    fuente = open(os.path.join(base, 'index.html'), encoding='utf-8').read()

    # ── LINEA BASE sobre la copia, antes de leer ninguna mutacion ──
    print('\n== LINEA BASE (sobre la copia, sin mutar) ==')
    res, err = correr(base)
    if err:
        print('  ABORTO: la linea base %s' % err)
        return 2
    rojas_base, marca = res
    print('  %s' % marca)
    if rojas_base:
        print('  ABORTO: hay %d aserciones ROJAS de entrada. Con la base en rojo, toda mutacion'
              ' sale «en rojo» sin probar nada:' % len(rojas_base))
        for r in sorted(rojas_base):
            print('     ✗ %s' % r)
        return 2
    print('  base limpia: toda mutacion que ponga algo en rojo lo hizo ella')

    print('\n== MUTACIONES ==')
    muertas, vivas, noaplica, redundantes = [], [], [], []
    for mut in MUTACIONES:
        nom, viejo, nuevo, esperadas = mut[0], mut[1], mut[2], mut[3]
        motivo_redundante = mut[4] if len(mut) > 4 else None
        n = fuente.count(viejo)
        if n != 1:
            noaplica.append((nom, 'el patron aparece %d veces, no 1' % n))
            print('  ⊘ %-78s ANCLA MALA (%d)' % (nom[:78], n))
            continue
        d = tempfile.mkdtemp(prefix='mut_vi3d_')
        try:
            open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(
                fuente.replace(viejo, nuevo, 1))
            os.symlink(os.path.join(base, 'tests'), os.path.join(d, 'tests'))
            res, err = correr(d)
            if err:
                noaplica.append((nom, err))
                print('  ⊘ %-78s %s' % (nom[:78], err))
                continue
            rojas, marca = res
            # ¿Se pusieron rojas las que le tocan a ESTA mutacion?
            pegadas = [e for e in esperadas if any(e in r for r in rojas)]
            if pegadas:
                muertas.append((nom, pegadas, marca))
                print('  ✓ MUERTA  %-70s %s' % (nom[:70], marca))
                print('            rojas esperadas: %s' % ', '.join(pegadas))
            elif motivo_redundante:
                redundantes.append((nom, motivo_redundante, marca))
                print('  ◎ REDUNDANTE  %-66s %s' % (nom[:66], marca))
                print('            %s' % motivo_redundante)
            else:
                vivas.append((nom, esperadas, marca, sorted(rojas)))
                print('  ✗ SOBREVIVIO  %-66s %s' % (nom[:66], marca))
                print('            esperaba rojo en: %s' % ', '.join(esperadas))
                print('            rojas reales: %s' % (', '.join(sorted(rojas)) or 'ninguna'))
        finally:
            shutil.rmtree(d, ignore_errors=True)

    h1 = md5(VIVO)
    print('\nindex.html vivo md5 = %s' % h1)
    if h1 != h0:
        print('⚠️ ABORTO: el archivo vivo CAMBIO durante la corrida. Ninguna medicion vale.')
        return 2
    print('✅ el archivo vivo no se toco en ningun momento')

    print('\n== RESUMEN ==')
    print('  muertas:                 %d/%d' % (len(muertas), len(MUTACIONES)))
    print('  redundantes (esperadas): %d' % len(redundantes))
    print('  SOBREVIVIERON:           %d' % len(vivas))
    print('  no aplicaron:            %d' % len(noaplica))
    for nom, why in noaplica:
        print('     ⊘ %s — %s' % (nom, why))
    for nom, esperadas, marca, rojas in vivas:
        print('     ✗ %s (esperaba %s)' % (nom, ', '.join(esperadas)))
    shutil.rmtree(base, ignore_errors=True)
    return 0 if (not vivas and not noaplica) else 1


if __name__ == '__main__':
    sys.exit(main())
