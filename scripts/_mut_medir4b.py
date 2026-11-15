#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_medir4b.py - barrido de mutaciones dirigidas de la tanda MEDIR-4b (2026-11-15).
Calcado de _mut_ec5.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

LA CUARTA QUE LA ORDEN DE MEDIR-4a DEJO PENDIENTE —«Listo» no pasa a la sistole— es la 04.
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

 # ══ BLOQUE A — LA VENTANA UNA VEZ, Y LA BARRA DE DOS PASOS ═══════════════════════════════
 # (1) LA VENTANA VUELVE A NACER SIN DECLARAR. Es el estado de antes de esta tanda: la ventana
 #     queda OPCIONAL para siempre y la etiqueta se rotula por cantidad.
 ('01 la ventana NO se declara al abrir la herramienta', 'TC-896',
  [("  try { _simp.nombres[0] = _simpVentanaLibre(); } catch (e) {}",
    "  try { } catch (e) {}")]),

 # (2) LA VENTANA SE PUEDE CAMBIAR CON UN CONTORNO CONFIRMADO. Es el hueco que H2 destapo: los
 #     dos contornos del mismo par quedan atribuidos a ventanas distintas.
 ('02 la ventana sigue cambiandose con un contorno confirmado', 'TC-896',
  [("  return !!(P && (P.d || P.s));",
    "  return false;")]),

 # (3) LA SEGUNDA VISTA SE LLEVA LA MISMA VENTANA QUE LA PRIMERA. El reparto deja de funcionar y
 #     las dos vistas nacen en A4C.
 ('03 la segunda vista se lleva la MISMA ventana que la primera', 'TC-897',
  [("  for (let i = 0; i < _SIMP_VISTAS.length; i++)\n    if (!usadas[_SIMP_VISTAS[i].k]) return _SIMP_VISTAS[i].k;\n  return _SIMP_VISTAS[0].k;",
    "  return _SIMP_VISTAS[0].k;")]),

 # (4) «LISTO» NO PASA A LA SISTOLE. ES LA CUARTA QUE LA ORDEN DE MEDIR-4a DEJO PENDIENTE: el
 #     medico confirma la diastole y el panel le sigue pidiendo la diastole, asi que el segundo
 #     trazado pisa el primero y nunca hay par.
 ('04 «Listo» confirma pero NO pasa a la sistole', 'TC-896',
  [("  _simp.fase = (_simp.fase === 'd') ? 's' : 'd';",
    "  _simp.fase = 'd';")]),

 # (5) LA BARRA EMITE UN SOLO PASO. La diastole desaparece de la barra.
 ('05 la barra de pasos emite UN solo paso', 'TC-896',
  [("      _simpPasoChip(pfx, 'd', esD, hechoD, 'Diástole') +\n      '<span style=\"align-self:center;color:var(--text2);font-size:12px;\">→</span>' +",
    "      '<span style=\"align-self:center;color:var(--text2);font-size:12px;\">→</span>' +")]),

 # (6) EL PASO PIERDE SU PISO TACTIL. Se ve de 44 y se toca en 26.
 ('06 los pasos pierden sus 44 px de alto', 'TC-896',
  [("    ' style=\"flex:1 1 0;min-width:0;min-height:44px;padding:4px 8px;font-size:11px;' +",
    "    ' style=\"flex:1 1 0;min-width:0;min-height:26px;padding:4px 8px;font-size:11px;' +")]),

 # (7) LOS DOS PASOS SE PINTAN CON EL ACENTO. El azul deja de decir cual esta en curso.
 ('07 los DOS pasos llevan el acento', 'TC-896',
  [("    (act ? 'background:var(--accent);color:' + col + ';font-weight:700;' : '') +",
    "    ('background:var(--accent);color:' + (col || '#fff') + ';font-weight:700;') +")]),

 # (8) EL PASO HECHO NO LLEVA TILDE. El medico no ve cual ya trazo.
 ('08 el paso hecho pierde su tilde', 'TC-896',
  [("    (hecho ? '✓ ' : ((f === 'd' ? '1' : '2') + ' ')) + rot + '</button>';",
    "    ((f === 'd' ? '1' : '2') + ' ') + rot + '</button>';")]),

 # (9) «LISTO» LLEVA `disabled`. Un control deshabilitado NO emite click, asi que el unico
 #     control que tiene que explicar por que no se puede no hace nada al tocarlo.
 ('09 «Listo» lleva disabled en vez de aria-disabled', 'TC-896',
  [("    (hayPend ? '' : ' aria-disabled=\"true\"') +",
    "    (hayPend ? '' : ' disabled') +")]),

 # (10) REHACER UNA FASE SE LLEVA LAS DOS. Vuelve a ser «Empezar de nuevo» con otro nombre.
 ('10 rehacer una fase borra TAMBIEN la otra', 'TC-896',
  [("  P[f] = null;\n  _simp.pendiente = null;\n  _simp.fase = f;",
    "  P.d = null; P.s = null;\n  _simp.pendiente = null;\n  _simp.fase = f;")]),

 # (11) EL RUTEO DEL PASO MIRA LA VISTA ACTIVA Y NO EL PREFIJO. `_V` fuera de un manejador
 #      envuelto es SIEMPRE _vistaA, asi que el «Listo» de la B confirma en la A.
 ('11 el «Listo» se rutea por la vista activa y no por su prefijo', 'TC-897',
  [("    const pfx = t.getAttribute('data-simp-pfx') || '';\n    const V = _vTodas().filter(x => x.pfx === pfx)[0];",
    "    const pfx = t.getAttribute('data-simp-pfx') || '';\n    const V = _vistaA;")]),

 # (12) LOS IDS DEL PASO PIERDEN SU PREFIJO. Con las dos vistas abiertas quedan duplicados.
 ('12 la barra de pasos emite su prefijo VACIO en las dos vistas', 'TC-897',
  [("function _simpPanel() {\n  if (!_simp) return '';\n  const pfx = _V.pfx;",
    "function _simpPanel() {\n  if (!_simp) return '';\n  const pfx = '';")]),

 # (13) EL BOTON DE RESCATE SE EMITE SIEMPRE. Dos botones para una sola accion, que es lo que
 #      «un unico boton» prohibe.
 ('13 el boton de rescate se emite SIEMPRE, junto con el «Listo»', 'TC-896',
  [("  const rescate = (VP && VP.medHerr !== 'simpson')",
    "  const rescate = (VP || true)")]),

 # (14) EL BOTON DE RESCATE NO SE EMITE NUNCA. Reintroduce el defecto documentado: con un trazado
 #      pendiente, cambiar de herramienta deja confirmar INALCANZABLE y el trazado se pierde.
 ('14 el boton de rescate NO se emite nunca', 'TC-257',
  [("  const rescate = (VP && VP.medHerr !== 'simpson')",
    "  const rescate = (VP && false)")]),

 # ══ BLOQUE B — LOS TRAZADOS Y LAS DOS VENTANAS IGUALES ═══════════════════════════════════
 # (15) EL CRUCE VUELVE A IGNORAR LA VENTANA DECLARADA. Es el defecto X1 restituido: dos
 #      ventanas iguales publican una FEVI que parece un biplano y no lo es.
 ('15 el cruce vuelve a ignorar la ventana declarada', 'TC-897',
  [("  if (na && nb && na === nb) return null;",
    "  if (false) return null;")]),

 # (16) EL PREDICADO DE LAS DOS VENTANAS IGUALES DICE SIEMPRE NO. El panel se queda sin la linea
 #      que explica por que no hay biplano: el medico ve dos monoplanares y ningun motivo.
 ('16 el predicado de ventanas iguales dice siempre NO', 'TC-897',
  [("function _vBiplanoMismaVentana() {\n  if (!_vistaB) return false;",
    "function _vBiplanoMismaVentana() {\n  if (true) return false;\n  if (!_vistaB) return false;")]),

 # (17) LA DEDUP VUELVE A DESCARTAR EL ROTULO REPETIDO. Con las dos ventanas iguales, la fila de
 #      la segunda vista DESAPARECE y el medico ve una monoplanar donde hay dos medidas.
 ('17 el rotulo repetido se descarta en vez de distinguirse', 'TC-897',
  [("      if (vistos.indexOf(rot) >= 0) rot = rot + ' · ' + rotVista;",
    "      if (vistos.indexOf(rot) >= 0) rot = rot;")]),

 # (18) EL BIPLANO SE CACHEA EN LA SESION. Deja de ser una funcion del estado: rehacer una fase
 #      ya no cambia el numero, asi que el panel publica el de los trazados viejos.
 ('18 el biplano se guarda en la sesion y deja de recalcularse', 'TC-897',
  [("function _vBiplanoDatos() {\n  if (!_vistaB) return null;",
    "function _vBiplanoDatos() {\n  if (!_vistaB) return null;\n  if (_vistaA.simp && _vistaA.simp.biplano) return _vistaA.simp.biplano;")]),

 # (19) CERRAR UNA VISTA NO DESCARTA SU TRAZADO. La decision (a) se cae: el biplano sigue
 #      publicandose con el contorno de una vista que ya no esta en pantalla.
 ('19 cerrar una vista NO descarta su trazado', 'TC-897',
  [("  _simp = null;                      // otra imagen: los cuatro trazados no aplican",
    "  // _simp = null;  // MUTACION")]),

 # (20) LA CALIBRACION PASA A SER DE MODULO. La escala de una imagen se aplica a la otra, que es
 #      el defecto que MEDIR-3 cerro con el estado por vista.
 ('20 la calibracion se comparte entre las dos vistas', 'TC-897',
  [("    medCalibVel: null, medCalibrandoVel: false,",
    "    get medCalib() { return window.__mutCal || null; },\n    set medCalib(v) { window.__mutCal = v; },\n    medCalibVel: null, medCalibrandoVel: false,")]),

 # (21) LA SEGUNDA VENTANA DE UNA MISMA VISTA DEJA DE DECLARARSE. La mitad de la app nombra su
 #      ventana y la otra mitad cuenta, sobre el mismo estudio.
 ('21 la segunda ventana de una misma vista no se declara', 'TC-228',
  [("  if (!_simp.nombres[1]) {\n    const n0 = _simp.nombres[0];",
    "  if (false) {\n    const n0 = _simp.nombres[0];")]),

 # ══ BLOQUE C — EL RESULTADO INTEGRADO Y EL GLOBO ═════════════════════════════════════════
 # (22) LOS TRES NUMEROS SE VAN A LETRA CHICA. El pedido los quiere GRANDES.
 ('22 los tres numeros del resultado dejan de ser grandes', 'TC-897',
  [("    '<div style=\"font-size:' + (gr ? '26' : '20') + 'px;font-weight:700;line-height:1.15;' +",
    "    '<div style=\"font-size:' + (gr ? '12' : '11') + 'px;font-weight:700;line-height:1.15;' +")]),

 # (23) LA FEVI PIERDE SU CLASIFICACION. El numero sale sin la palabra que lo interpreta.
 ('23 la FEVI del resultado pierde su clasificacion', 'TC-897',
  [("    '<div style=\"text-align:center;font-size:12px;font-weight:700;color:' + k.col + ';' +\n      'margin-top:1px;\">' + k.txt + '</div>' +",
    "    '' +")]),

 # (24) UNA NOTA DE METODO DESAPARECE DEL GLOBO. Se pierde texto clinico: es exactamente lo que
 #      «se mueven, no se borran» prohibe.
 ('24 una nota de metodo desaparece del globo', 'TC-898',
  [("  'El método supone que el ápex está bien visualizado. Un ápex escorzado subestima los volúmenes; la guía lo lista como su limitación principal.',",
    "")]),

 # (25) EL VOLUMEN CAMBIA SU CONSTANTE. Es el contrato numerico: con pi/3 en vez de pi/4 los seis
 #      valores de la linea base se mueven y la FEVI del informe cambia sin que nada lo diga.
 ('25 el volumen por discos cambia su constante', 'TC-898',
  [("  return Math.PI / 4 * s * (Lcm / SIMP_N);",
    "  return Math.PI / 3 * s * (Lcm / SIMP_N);")]),
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
