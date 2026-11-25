#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr12.py - barrido de MUTACIONES DIRIGIDAS de la tanda PR12 (2026-11-25).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr12.py              # todas
  python3 scripts/_mut_pr12.py --solo 1,2   # algunas
  python3 scripts/_mut_pr12.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba su
md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y la
medicion siguiente se hace sobre un archivo envenenado.

EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay ningun
signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
cobertura». Sin esa linea el veredicto es NO CORRIO.

LAS ANCLAS SE VERIFICAN ANTES DE CORRER (--anclas), que es lo que PANT-19 pago con siete anclas
que no aplicaron por escribirlas con secuencias de escape en vez del caracter real.

AL MENOS DOS POR GRUPO, y los grupos son las cuatro tareas que escriben codigo: el tamanio del
texto copiado (1), el corte de espesor parietal relativo (2), el rango de NT-proBNP (3) y la
paleta del mapa de SGL del visor (5). Las tareas 4 y 6 son de SOLO LECTURA y no tienen mutacion.

CINCO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS -que no se fije la tipografia, que no se le atribuya a una fuente un simbolo
que no escribe, que el globo no lleve title, que la ayuda no lleve id y que no se cite una guia-,
y un control negativo que ninguna mutacion puede romper no prueba nada.

MATA EL CHROME HUERFANO DESPUES DE CADA CORRIDA: el arnes del suite deja su arbol de Chrome con el
servidor escuchando, y acumulados ahogan la corrida -medido en PR8: de 30 s por mutacion a cuatro
minutos-.
"""
import hashlib, os, re, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) - `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ══ GRUPO 1 · EL TAMANIO DEL TEXTO COPIADO ══
 ('01 los parrafos del HTML copiado pierden su tamanio', 'TC-1064',
  "  return '<p style=\"margin:0;' + CW_FS + (estilo || '') + '\">' + t + '</p>';",
  "  return '<p style=\"margin:0;' + (estilo || '') + '\">' + t + '</p>';"),
 ('02 los items del EN SUMA pierden su tamanio', 'TC-1064',
  "      p.push('<li style=\"margin:0;' + CW_FS + '\">' + _cwEscHtml(l) + '</li>');",
  "      p.push('<li style=\"margin:0;\">' + _cwEscHtml(l) + '</li>');"),
 ('03 la negrita y el subrayado pierden su tamanio', 'TC-1064',
  "  const ab = '<b style=\"' + CW_FS + '\">';\n  return sub ? (ab + '<u style=\"' + CW_FS + '\">' + t + '</u></b>') : (ab + t + '</b>');",
  "  const ab = '<b>';\n  return sub ? (ab + '<u>' + t + '</u></b>') : (ab + t + '</b>');"),
 ('04 un bloque sale en OTRO tamanio (la lista, en 12 pt)', 'TC-1064',
  "    p.push('<ul style=\"margin:0 0 0 18px;padding:0;' + CW_FS + '\">');",
  "    p.push('<ul style=\"margin:0 0 0 18px;padding:0;font-size:12pt;\">');"),
 ('05 DE MAS: vuelve la tipografia fija al envoltorio de los datos (control)', 'TC-1064',
  "function cuadTextoHTML() {\n  const secs = cuadTextoSecs();\n  if (!secs.length) return '';\n  const p = ['<div style=\"' + CW_FS + 'color:#000;\">'];",
  "function cuadTextoHTML() {\n  const secs = cuadTextoSecs();\n  if (!secs.length) return '';\n  const p = ['<div style=\"font-family:Calibri,Arial,sans-serif;' + CW_FS + 'color:#000;\">'];"),

 # ══ GRUPO 2 · EL CORTE DE ESPESOR PARIETAL RELATIVO ══
 ('06 el 0,42 exacto pasa al lado NORMAL (masa normal)', 'TC-1065',
  "  if (masaNormal && r < 0.42) return 'Normal';",
  "  if (masaNormal && r <= 0.42) return 'Normal';"),
 ('07 el 0,42 exacto pasa al lado EXCENTRICO (masa aumentada)', 'TC-1065',
  "  if (r < 0.42) return 'Hipertrofia excéntrica';",
  "  if (r <= 0.42) return 'Hipertrofia excéntrica';"),
 ('08 el cuadro de Referencias escribe el corte con el operador estricto', 'TC-1065',
  '<td style="padding:5px 8px;text-align:center;">≥0.42</td></tr>\n        <tr style="border-bottom:1px solid var(--border);"><td style="padding:5px 8px;">HVI excéntrica</td>',
  '<td style="padding:5px 8px;text-align:center;">&gt;0.42</td></tr>\n        <tr style="border-bottom:1px solid var(--border);"><td style="padding:5px 8px;">HVI excéntrica</td>'),
 ('09 la ficha GEO-VI-001 pasa a decir «mas de 0,42»', 'TC-1065',
  "    valor: 'Normal por debajo de 0,42; con 0,42 o más el espesor parietal relativo está aumentado. El mismo corte en los dos sexos',",
  "    valor: 'Normal por debajo de 0,42; con más de 0,42 el espesor parietal relativo está aumentado. El mismo corte en los dos sexos',"),
 ('10 DE MAS: se le atribuye a Pieske 2019 el operador inclusivo (control)', 'TC-1065',
  '<td style="padding:5px 8px;">Espesor parietal relativo</td><td style="padding:5px 8px;text-align:center;font-weight:700;">&gt; 0,42</td>',
  '<td style="padding:5px 8px;">Espesor parietal relativo</td><td style="padding:5px 8px;text-align:center;font-weight:700;">&ge; 0,42</td>'),

 # ══ GRUPO 3 · EL RANGO DE NT-proBNP ══
 ('11 la ayuda pierde el rango', 'TC-1066',
  'CRITERIO DE ECOSMART</span>NT-proBNP 375&ndash;600 pg/mL</span></span>',
  'CRITERIO DE ECOSMART</span>NT-proBNP elevado</span></span>'),
 ('12 la ayuda pierde el rotulo de criterio propio', 'TC-1066',
  '<span style="display:inline-block;border:1px solid var(--border);border-radius:4px;padding:0 4px;margin-right:4px;font-size:9px;letter-spacing:.3px;">CRITERIO DE ECOSMART</span>NT-proBNP 375&ndash;600 pg/mL',
  'NT-proBNP 375&ndash;600 pg/mL'),
 ('13 DE MAS: la ayuda gana un title (control de TC-500)', 'TC-1066',
  '<span style="display:block;margin-top:2px;font-size:10px;font-weight:400;color:var(--text2);line-height:1.4;">',
  '<span title="Rango de NT-proBNP" style="display:block;margin-top:2px;font-size:10px;font-weight:400;color:var(--text2);line-height:1.4;">'),
 ('14 DE MAS: la ayuda gana un id (control del censo del estudio)', 'TC-1066',
  '<span style="display:block;margin-top:2px;font-size:10px;font-weight:400;color:var(--text2);line-height:1.4;"><span style="display:inline-block;border:1px solid var(--border);',
  '<span id="hfaicos_bnp_rango" style="display:block;margin-top:2px;font-size:10px;font-weight:400;color:var(--text2);line-height:1.4;"><span style="display:inline-block;border:1px solid var(--border);'),
 ('15 DE MAS: la ayuda cita una guia para el numero (control)', 'TC-1066',
  'CRITERIO DE ECOSMART</span>NT-proBNP 375&ndash;600 pg/mL</span>',
  'CRITERIO DE ECOSMART</span>NT-proBNP 375&ndash;600 pg/mL (Pieske 2019)</span>'),

 # ══ GRUPO 5 · LA PALETA DEL MAPA DE SGL DEL VISOR ══
 ('16 el color se COPIA en vez de leer la paleta', 'TC-1067',
  "function _strPalColor(i) {\n  return (typeof STRAIN_PAL !== 'undefined' && STRAIN_PAL[i]) ? STRAIN_PAL[i].color : '#D4D4D0';\n}",
  "function _strPalColor(i) {\n  const C8 = ['#D4D4D0','#6A1B9A','#9B59C4','#C9A3E0','#E6D5F0','#D3E3FA','#9DBFF2','#5C8CE0','#2450C0'];\n  return C8[i] || '#D4D4D0';\n}"),
 ('17 el tramo se calcula por MAGNITUD y no por strainTramoDe', 'TC-1067',
  "  return _strPalColor((typeof strainTramoDe === 'function') ? strainTramoDe(pct) : 0);",
  "  return _strPalColor(Math.max(1, Math.min(8, 1 + Math.round(Math.abs(pct) / 5))));"),
 ('18 el gris vuelve al propio del visor', 'TC-1067',
  "function _strGris() { return _strPalColor(0); }",
  "function _strGris() { return '#9E9E9E'; }"),
 ('19 la leyenda vuelve a pintar un solo tono', 'TC-1067',
  "  for (let i = 1; i <= nTr; i++) {\n    cx2.fillStyle = _strPalColor(i);",
  "  for (let i = 1; i <= nTr; i++) {\n    cx2.fillStyle = _strPalColor(1);"),
 ('20 el dibujante deja de devolver donde termina la leyenda', 'TC-1067',
  "  return { ly: ly + 30 * esc, esc: esc };",
  "  return undefined;"),
 ('21 el relleno de un segmento deja de salir del tramo', 'TC-201',
  "    cx2.fillStyle = v ? _strColorPct(v.pct) : _strGris();",
  "    cx2.fillStyle = v ? _strPalColor(3) : _strGris();"),
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

    orig = os.path.join(RAIZ, '.mut_pr12_orig.html')
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
