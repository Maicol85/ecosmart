#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_lote13.py - barrido de MUTACIONES DIRIGIDAS del lote post-PR13 (2026-11-28).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_lote13.py              # todas
  python3 scripts/_mut_lote13.py --solo 1,2   # algunas
  python3 scripts/_mut_lote13.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. EXIGE LA LINEA RESULTADO EN LA SALIDA: si el
suite no arranca, stdout queda vacio y TODAS saldrian «sobrevivio», indistinguible de «no hay
cobertura». LAS ANCLAS SE VERIFICAN ANTES DE CORRER.

AL MENOS DOS POR GRUPO, y los grupos son los ocho del lote: A el descargo de la captura, B el
tamanio del copiado, C el NT-proBNP y las notas del Simpson, D el retroceso del trazado, E
«Cambiar vista», F los textos del LARS y del VD, F5 el cuadro propio de cada trazo, y G y H la
flecha de la tabla y la pantalla completa.

CINCO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS -que la frase del retroceso NO este en las de clic, que el clic no pause con
la columna a la vista ni mientras se mide, que el espacio respete un boton enfocado y que un trazo
sin cuadro se siga dibujando-, y un control negativo que ninguna mutacion puede romper no prueba
nada.

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
 # ══ GRUPO A · EL DESCARGO DE LA CAPTURA ══
 ('A1 el descargo vuelve a dibujarse de una sola linea, sin medir', 'TC-1072',
  "    capL1 = _strEnvolver(cx2, _STR_CAP_L1, capAncho, 3);",
  "    capL1 = [_STR_CAP_L1];"),
 ('A2 el alto reservado no cuenta los renglones: vuelve al 34 fijo', 'TC-1072',
  "    uCap = 16 + 12 * (capL1.length + capL2.length - 1) + 6;",
  "    uCap = 34;"),
 ('A3 el ancho disponible deja de tener margenes: usa el canvas entero', 'TC-1072',
  "    const capAncho = S - u(16);",
  "    const capAncho = S;"),

 # ══ GRUPO B · EL TAMANIO DEL COPIADO ══
 ('B1 el tamanio del copiado vuelve a los puntos', 'TC-1073',
  "const CW_PT = '11px';",
  "const CW_PT = '11pt';"),
 ('B2 la negrita pierde su tamanio propio', 'TC-1073',
  "  const ab = '<b style=\"' + CW_FS + '\">';",
  "  const ab = '<b>';"),
 ('B3 los parrafos pierden el tamanio: queda solo en el envoltorio', 'TC-1073',
  "  return '<p style=\"margin:0;' + CW_FS + (estilo || '') + '\">' + t + '</p>';",
  "  return '<p style=\"margin:0;' + (estilo || '') + '\">' + t + '</p>';"),

 # ══ GRUPO C · EL NT-proBNP Y LAS NOTAS DEL SIMPSON ══
 ('C1 la casilla vuelve a publicar el rango', 'TC-1074',
  "por encima del l&iacute;mite superior del laboratorio local</span></span>",
  "NT-proBNP 375&ndash;600 pg/mL</span></span>"),
 ('C2 el globo de la casilla pierde su title-menos: le ponemos uno', 'TC-1074',
  "aria-label=\"Informaci&oacute;n sobre el marcador humoral basal\" onclick=\"event.preventDefault();event.stopPropagation();vInfoClic(this)\"",
  "aria-label=\"Informaci&oacute;n sobre el marcador humoral basal\" title=\"Marcador humoral\" onclick=\"event.preventDefault();event.stopPropagation();vInfoClic(this)\""),
 # /!\ LA MUTACION DE «QUITARLE EL preventDefault AL GLOBO» ES EQUIVALENTE Y QUEDA DECLARADA:
 # medido, Chrome NO activa el label cuando el clic cae sobre un BOTON hijo, asi que el clic
 # sintetico que el caso despacha no tildea la casilla ni con la guarda ni sin ella. Lo que esa
 # guarda protege es el TOQUE real, que no se puede despachar desde aca. Se reapunta a algo del
 # mismo grupo que SI se ve.
 ('C3 el globo del NT-proBNP vuelve a publicar un numero', 'TC-1074',
  "       + 'El limite lo pone el laboratorio que midio la muestra: cada metodo tiene el suyo, y '",
  "       + 'El limite habitual va de 375 a 600 pg/mL: cada metodo tiene el suyo, y '"),
 ('C4 vuelve la frase AF-5 de los valores normales de biplano', 'TC-1074',
  "Lang 2015 recomienda el biplano. Un monoplanar no se integra",
  "Lang 2015 recomienda el biplano, y los valores normales con los que se clasifica salen de biplano. Un monoplanar no se integra"),

 # ══ GRUPO D · EL RETROCESO ══
 ('D1 el retroceso se mira DESPUES de decimar: retroceder lento no hace nada', 'TC-1075',
  """  const corte = medRetroIndice(_medTrazo, p);
  if (corte >= 0) {""",
  """  const _u0 = _medTrazo[_medTrazo.length - 1];
  if (Math.abs(p.x - _u0.x) < 2 && Math.abs(p.y - _u0.y) < 2) return;
  const corte = medRetroIndice(_medTrazo, p);
  if (corte >= 0) {"""),
 ('D2 el tramo que se esta dibujando SI cuenta: el salto pasa a cero', 'TC-1075',
  "const MED_RETRO_SALTO = 4;",
  "const MED_RETRO_SALTO = 0;"),
 ('D3 el piso de puntos desaparece: un trazo de dos puntos ya retrocede', 'TC-1075',
  "const MED_RETRO_MIN   = 8;",
  "const MED_RETRO_MIN   = 0;"),
 ('D4 se vuelve al punto mas VIEJO: el trazo cruzado se borra entero', 'TC-1075',
  "  for (let i = pts.length - 1 - S; i >= 1; i--) {",
  "  for (let i = 1; i <= pts.length - 1 - S; i++) {"),
 ('D5 DE MAS: la frase del gesto se le pone tambien a las de clic', 'TC-1075',
  "  dist:   'Hacé clic en dos puntos para medir.'",
  "  dist:   'Hacé clic en dos puntos para medir.' + MED_RETRO_AYUDA"),

 # ══ GRUPO E · CAMBIAR VISTA ══
 ('E1 el paso deja de respetar la marca: «Cambiar vista» no lleva a ninguna parte', 'TC-1076',
  "  if (_strain.eligiendoVista) return 'vista';",
  "  if (false) return 'vista';"),
 ('E2 cambiar de vista NO pregunta: descarta el trazado sin confirmar', 'TC-1076',
  "  if (!hayPend) { irA(); return; }",
  "  if (true) { irA(); return; }"),
 ('E3 elegir una ventana deja de apagar la pantalla de eleccion', 'TC-1076',
  "  /* GRUPO E: elegir una ventana cierra la pantalla de eleccion. */\n  _strain.eligiendoVista = false;",
  "  /* GRUPO E: elegir una ventana cierra la pantalla de eleccion. */"),
 ('E4 la salida sin elegir no se emite: se queda obligado a elegir', 'TC-1076',
  "          ? b('cine-str-seguir', 'btn-ghost', 'Seguir en ' + String(_strain.vista).toUpperCase()) + ' '",
  "          ? ''"),

 # ══ GRUPO F · LARS Y STRAIN DEL VD ══
 ('F1 vuelve la contradiccion: el VD se pide hasta el anillo septal', 'TC-1077',
  "    'Trazá <b>sólo la pared libre</b>: del <b>anillo tricuspídeo lateral</b> hasta el <b>ápex ' +\n    'del VD</b>.",
  "    'Trazá <b>sólo la pared libre</b>: del <b>anillo tricuspídeo lateral</b>, por el <b>ápex ' +\n    'del VD</b>, hasta el <b>anillo septal</b>."),
 ('F2 vuelve el doble signo: el menos se antepone al valor con su signo', 'TC-1077',
  "        'signo negativo (−' + Math.abs(R.cond).toFixed(1) + ' % y −' + Math.abs(R.ctr).toFixed(1) +",
  "        'signo negativo (−' + R.cond.toFixed(1) + ' % y −' + R.ctr.toFixed(1) +"),
 ('F3 vuelve el nombre de la guia al texto de pantalla del LARS', 'TC-1077',
  "      fila('Reservorio', R.res, 'normal ' + LARS_RESERVORIO_NORMAL + ' % o más') +",
  "      fila('Reservorio', R.res, 'normal ≥ ' + LARS_RESERVORIO_NORMAL + ' % (ASE 2025)') +"),
 ('F4 vuelve el folio y la tabla al texto de pantalla del VD', 'TC-1077',
  "      'Normal: <b>más negativo que −20 %</b>, igual en hombres y en mujeres. Menos negativo que ' +",
  "      'Normal (ASE 2025, Tabla 1 · folio 145): <b>más negativo que −20 %</b>, igual en hombres y en mujeres. Menos negativo que ' +"),
 ('F5 el globo del LARS se queda sin la cita de su fuente', 'TC-1077',
  "  'Un reservorio por debajo de 18 % se asocia a presiones de llenado del ventrículo izquierdo '\n  + 'elevadas, y es el corte que el comité de esa fuente respalda (Thomas 2025, hoja 23, '\n  + 'folio 1007).',",
  "  'Un reservorio por debajo de 18 % se asocia a presiones de llenado elevadas.',"),
 ('F6 el panel deja de explicar la pre-contraccion', 'TC-1077',
  "    guia:'Es el punto donde <b>empieza la onda P</b> del electrocardiograma: el final del llenado '",
  "    guia:'Avanzá hasta el final de la diástasis: el final del llenado '"),

 # ══ GRUPO F5 · CADA TRAZO EN SU CUADRO ══
 ('G1 los tres contornos vuelven a dibujarse juntos en cualquier cuadro', 'TC-1078',
  """    const _aqui = (T) => !T || T.cuadro == null || !_cineDatos
      || (T.loop === (_cineDatos.i | 0) && T.cuadro === (_cineDatos.cuadro | 0));""",
  "    const _aqui = (T) => true;"),
 ('G2 un trazo SIN cuadro deja de dibujarse: falla hacia esconder', 'TC-1078',
  "    const _aqui = (T) => !T || T.cuadro == null || !_cineDatos",
  "    const _aqui = (T) => !T || !_cineDatos"),
 ('G3 el trazo deja de guardar su cuadro', 'TC-1078',
  "                            cuadro: _cineDatos ? (_cineDatos.cuadro | 0) : null } };",
  "                            cuadro: null } };"),

 # ══ GRUPO G y H ══
 ('H1 el boton de pantalla completa deja de emitirse', 'TC-1079',
  "                ibtn('cine-fs', '&#9974;', 'Pantalla completa', '') +",
  ""),
 # /!\ LA PRIMERA VERSION DE ESTA MUTACION AGREGABA OTRO BOTON Y DEJABA EL REAL EN SU LUGAR: era
 # equivalente. Ahora el boton real se MUEVE arriba del de columna, que es lo que la condicion mide.
 ('H2 el boton de pantalla completa queda ARRIBA del de columna', 'TC-1079',
  """                ibtn('cine-pan', '&#187;', 'Esconder la columna de medidas y darle todo el ancho a la imagen', 'cine-pan-btn') +
                /* ══ LOTE POST-PR13 · GRUPO H — PANTALLA COMPLETA DE VERDAD ═══════════════""",
  """                ibtn('cine-fs', '&#9974;', 'Pantalla completa', '') +
                ibtn('cine-pan', '&#187;', 'Esconder la columna de medidas y darle todo el ancho a la imagen', 'cine-pan-btn') +
                /* ══ LOTE POST-PR13 · GRUPO H — PANTALLA COMPLETA DE VERDAD ═══════════════"""),
 ('H3 el clic pausa SIEMPRE, tambien con la columna a la vista', 'TC-1079',
  "  return cineFsActiva() || ov.classList.contains('cine-sinpanel');",
  "  return true;"),
 ('H4 el clic pausa tambien MIENTRAS SE MIDE', 'TC-1079',
  "  if (V && V.medOn) return false;",
  "  if (false) return false;"),
 ('H5 el espacio se roba la tecla con un boton enfocado', 'TC-1079',
  "        if (esEspacio && (tag === 'BUTTON' || tag === 'A' || a.getAttribute('role') === 'button')) return;",
  ""),
 ('H6 el autoocultado baja a cero: los controles no esperan nada', 'TC-1079',
  "const CINE_FS_OCULTAR_MS = 3000;",
  "const CINE_FS_OCULTAR_MS = 0;"),
 ('H7 el boton de salida se esconde con los demas', 'TC-1079',
  "  #cine-ov.cine-fs.cine-fs-ocultos .cine-imgbtns-bl {",
  "  #cine-ov.cine-fs.cine-fs-ocultos .cine-imgbtns-tr,\n  #cine-ov.cine-fs.cine-fs-ocultos .cine-imgbtns-bl {"),
 ('H8 el sincronizador deja de leer el estado del navegador', 'TC-1079',
  "  if (ov) ov.classList.toggle('cine-fs', on);",
  "  if (ov) ov.classList.toggle('cine-fs', true);"),
 ('H9 la flecha de la tabla pierde su area tactil de 44 px', 'TC-1079',
  "  .sc-ico::after { content:''; position:absolute; left:50%; top:50%;\n                   width:44px; height:44px; transform:translate(-50%,-50%); }",
  "  .sc-ico::after { content:''; position:absolute; left:50%; top:50%;\n                   width:20px; height:20px; transform:translate(-50%,-50%); }"),
 # /!\ «ESCRIBE EN OTRO CAMPO» ES EQUIVALENTE Y QUEDA DECLARADA: los dos ids existen y estan
 # espejados, asi que escribir en uno llena el otro y la condicion no puede distinguirlos. Se
 # reapunta al REDONDEO, que es lo que la flecha publica y lo que PR9 arreglo.
 ('H10 la flecha escribe el promedio sin redondear', 'TC-1079',
  "  const val = String(_scRed(n, 1));",
  "  const val = String(n);"),
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

    orig = os.path.join(RAIZ, '.mut_lote13_orig.html')
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
