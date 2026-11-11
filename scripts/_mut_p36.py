#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_p36.py - barrido de mutaciones dirigidas de la tanda PANT-36 (2026-11-11).
Calcado de _mut_pant34.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido, y algunas se CALCULAN del
propio archivo (las filas enteras de las dos tablas, que miden cientos de caracteres): asi no
hay forma de que una mutacion no aplique por un carácter mal copiado, que es lo que el barrido
de PANT-20 pago con una corrida entera.

Rompe, una por una, las decisiones de la parte A -- el reparto, el orden de la entrada, su
encabezado, lo que no trae, las dos tablas con sus columnas, sus filas, sus cifras, su negrita
y su envoltorio -- y las de la parte B -- los quince resumenes, su orden, su molde, su techo,
sus vinietas, lo que no pueden decir y los dos controles.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')
orig = open(IDX, encoding='utf-8').read()


def fila(clave):
    """La linea <tr> entera cuya primera celda es `clave`. Se calcula del archivo."""
    m = '>' + clave + '</td>'
    i = orig.index(m)
    a = orig.rindex('\n', 0, i) + 1
    b = orig.index('\n', i)
    return orig[a:b]


def cuerpo(titulo):
    """La linea del cuerpo del resumen cuyo titulo es `titulo`."""
    i = orig.index('>' + titulo + '</div>')
    a = orig.index('\n', i) + 1
    b = orig.index('\n', a)
    return orig[a:b]


def titulo(t):
    i = orig.index('>' + t + '</div>')
    a = orig.rindex('\n', 0, i) + 1
    b = orig.index('\n', i)
    return orig[a:b]


def primeravin(t):
    """La primera linea de vinieta del resumen `t`."""
    i = orig.index('>' + t + '</div>')
    a = orig.index('\n', i) + 1          # linea del cuerpo
    a = orig.index('\n', a) + 1          # primera vinieta
    b = orig.index('\n', a)
    return orig[a:b]


MUT = [
 # ══ PARTE A · la entrada ═════════════════════════════════════════════════════════════════
 ('01 la entrada no entra al reparto: queda suelta fuera de las nueve subpestanias', 'TC-821,TC-502,TC-509',
  [("  congenitas: Object.freeze(['congenitas', 'coronarias', 'asoc']),",
    "  congenitas: Object.freeze(['congenitas', 'coronarias']),")]),
 ('02 la entrada va PRIMERA del panel y no debajo de «Anomalias coronarias»', 'TC-821',
  [("  congenitas: Object.freeze(['congenitas', 'coronarias', 'asoc']),",
    "  congenitas: Object.freeze(['asoc', 'congenitas', 'coronarias']),")]),
 ('03 el encabezado deja de abrir la entrada: apunta a otra clave', 'TC-821',
  [("onclick=\"toggleRef('asoc',this)\"", "onclick=\"toggleRef('coronarias',this)\"")]),
 ('04 el encabezado cambia de titulo', 'TC-821',
  [("      \U0001f517 Asociaciones y síndromes\n", "      \U0001f517 Tabla de síndromes\n")]),
 ('05 la entrada gana un id terminado en «-aviso», que «Nuevo estudio» vaciaria', 'TC-821',
  [('    <div id="ref-asoc" style="display:none;" class="card-body">',
    '    <div id="ref-asoc" style="display:none;" class="card-body">\n      <div id="asoc-aviso"></div>')]),
 ('06 la entrada gana un boton: deja de ser solo texto', 'TC-821',
  [('    <div id="ref-asoc" style="display:none;" class="card-body">',
    '    <div id="ref-asoc" style="display:none;" class="card-body">\n      <button type="button">Ver</button>')]),
 ('07 la entrada gana una linea de fuente en cursiva, que A4 prohibe', 'TC-821',
  [('    <div id="ref-asoc" style="display:none;" class="card-body">',
    '    <div id="ref-asoc" style="display:none;" class="card-body">\n      <div style="font-size:10px;"><i>Fuente consultada</i></div>')]),
 # ══ PARTE A · las dos tablas ═════════════════════════════════════════════════════════════
 ('08 la primera tabla pierde su ultima fila, la heterotaxia', 'TC-822',
  [(fila('Heterotaxia') + '\n', '')]),
 ('09 la segunda tabla pierde su ultima fila, el canal AV', 'TC-822',
  [(fila('Canal AV (defecto septal AV)') + '\n', '')]),
 ('10 dos sindromes cambian de lugar: Down y Holt-Oram', 'TC-822',
  [(fila('Down') + '\n' + fila('Holt-Oram'), fila('Holt-Oram') + '\n' + fila('Down'))]),
 ('11 un encabezado de la primera tabla cambia', 'TC-822',
  [('<th style="padding:6px 8px;text-align:left;color:var(--accent2);">Cómo sospecharlo</th>',
    '<th style="padding:6px 8px;text-align:left;color:var(--accent2);">Cómo sospecharla</th>')]),
 ('12 un encabezado de la segunda tabla cambia', 'TC-822',
  [('<th style="padding:6px 8px;text-align:left;color:var(--accent2);">Qué mirar en el eco</th>',
    '<th style="padding:6px 8px;text-align:left;color:var(--accent2);">Qué mirar</th>')]),
 ('13 el rotulo de la segunda tabla cambia', 'TC-822',
  [('margin:14px 0 6px;">Asociaciones entre cardiopatías, sin síndrome</div>',
    'margin:14px 0 6px;">Asociaciones sin síndrome</div>')]),
 ('14 el «60 a 80 %» de la delecion 22q11.2 pasa a un rango con guion', 'TC-822',
  [('<td style="padding:5px 8px;">60 a 80 %</td>', '<td style="padding:5px 8px;">60-80 %</td>')]),
 ('15 el 70 % conotruncal pasa a 60 %', 'TC-822',
  [('el 70 % tiene un defecto conotruncal.', 'el 60 % tiene un defecto conotruncal.')]),
 ('16 el 40 a 50 % del Down pasa a 40 a 60 %', 'TC-822',
  [('<td style="padding:5px 8px;">40 a 50 %</td>', '<td style="padding:5px 8px;">40 a 60 %</td>')]),
 ('17 el 75 % de los canales AV completos del Down pasa a 70 %', 'TC-822',
  [('Más del 75 % de los canales AV completos ocurren en Down.',
    'Más del 70 % de los canales AV completos ocurren en Down.')]),
 ('18 el 30 % del Turner pasa a 20 %', 'TC-822',
  [('<td style="padding:5px 8px;">30 %</td>', '<td style="padding:5px 8px;">20 %</td>')]),
 ('19 el 50 a 95 % de la heterotaxia pasa a 50 a 90 %', 'TC-822',
  [('<td style="padding:5px 8px;">50 a 95 %</td>', '<td style="padding:5px 8px;">50 a 90 %</td>')]),
 ('20 el 4 a 10 % de coartacion en la bicuspide pasa a 4 a 15 %', 'TC-822',
  [('Coartación (4 a 10 % de las bicúspides)', 'Coartación (4 a 15 % de las bicúspides)')]),
 ('21 el seno coronario sin techo pasa de «menos de 1 %» a «1 %»', 'TC-822',
  [('seno coronario sin techo menos de 1 %.', 'seno coronario sin techo 1 %.')]),
 ('22 la CIV perimembranosa pierde el signo de aproximacion', 'TC-822',
  [('perimembranosa ≈80 %, muscular', 'perimembranosa 80 %, muscular')]),
 ('23 el patron coronario habitual de la TGA pasa de 65 % a 60 %', 'TC-822',
  [('habitual ≈65 %, circunfleja', 'habitual ≈60 %, circunfleja')]),
 ('24 el bloqueo AV de la ccTGA pierde su «por anio»', 'TC-822',
  [('bloqueo AV (2 % por año)', 'bloqueo AV (2 %)')]),
 ('25 la primera columna pierde la negrita', 'TC-822',
  [('<td style="padding:5px 8px;font-weight:700;">Deleción 22q11.2 (DiGeorge, velocardiofacial)</td>',
    '<td style="padding:5px 8px;">Deleción 22q11.2 (DiGeorge, velocardiofacial)</td>')]),
 ('26 la segunda celda de una fila gana la negrita', 'TC-822',
  [('<td style="padding:5px 8px;">Gen TBX5</td>', '<td style="padding:5px 8px;font-weight:700;">Gen TBX5</td>')]),
 ('27 la primera tabla pierde su envoltorio de desplazamiento', 'TC-822',
  [('<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><table style="width:100%;min-width:900px;',
    '<div><table style="width:100%;min-width:900px;')]),
 ('28 la segunda tabla pierde su min-width: en celular aprieta en vez de desplazarse', 'TC-822',
  [('<table style="width:100%;min-width:700px;border-collapse:collapse;font-size:12px;">',
    '<table style="width:100%;border-collapse:collapse;font-size:12px;">')]),
 # ══ PARTE B · los quince resumenes ═══════════════════════════════════════════════════════
 ('29 se pierde un resumen: el de Marfan', 'TC-823',
  [(titulo('Marfan/EHAT — Aortopatía hereditaria') + '\n', '')]),
 # ESTA MUTACION CONSERVA LOS QUINCE Y SOLO CAMBIA EL ORDEN: mueve el resumen de Marfan al
 # principio. Asi discrimina el ORDEN y no el numero, que la 29 ya cubre. El borrado va PRIMERO
 # y la insercion despues: al reves, el par aparece dos veces y el ancla no es unica.
 # (En un archivo de Python el comentario va con #: los /* */ no son comentario, que es lo que
 # el barrido de PANT-20 pago con una corrida.)
 ('30 los quince siguen, pero el de Marfan se adelanta al primero: cambia el ORDEN', 'TC-823',
  [(titulo('Marfan/EHAT — Aortopatía hereditaria') + '\n'
    + cuerpo('Marfan/EHAT — Aortopatía hereditaria') + '\n', ''),
   (titulo('CIA — Comunicación interauricular'),
    titulo('Marfan/EHAT — Aortopatía hereditaria') + '\n'
    + cuerpo('Marfan/EHAT — Aortopatía hereditaria') + '\n'
    + titulo('CIA — Comunicación interauricular'))]),
 ('31 el titulo de un resumen cambia', 'TC-823',
  [('>CoAo — Coartación de aorta</div>', '>Coartación de aorta</div>')]),
 ('32 el renglon que la ficha ya tenia se reescribe', 'TC-823',
  [('<b style="color:var(--accent2);">PCA:</b> sobrecarga VI',
    '<b style="color:var(--accent2);">DAP:</b> sobrecarga VI')]),
 # EL ANCLA DEL CUERPO LLEVA SU TITULO ADELANTE: la linea del cuerpo es IDENTICA en los quince
 # resumenes -- es el molde --, asi que sola aparece veintiuna veces y no aplica.
 ('33 el cuerpo de un resumen pasa a negrita: se pierde el molde', 'TC-823',
  [(titulo('Fontan — Circulación de Fontan') + '\n' + cuerpo('Fontan — Circulación de Fontan'),
    titulo('Fontan — Circulación de Fontan') + '\n'
    + cuerpo('Fontan — Circulación de Fontan').replace('line-height:1.8;', 'line-height:1.8;font-weight:700;'))]),
 ('34 un cuerpo pierde el interlineado 1,8 del molde', 'TC-823',
  [(titulo('Ebstein — Anomalía de Ebstein') + '\n' + cuerpo('Ebstein — Anomalía de Ebstein'),
    titulo('Ebstein — Anomalía de Ebstein') + '\n'
    + cuerpo('Ebstein — Anomalía de Ebstein').replace('line-height:1.8;', 'line-height:1.5;'))]),
 ('35 un titulo pierde el peso 700 del molde', 'TC-823',
  [(titulo('Estenosis subaórtica'),
    titulo('Estenosis subaórtica').replace('font-weight:700;', ''))]),
 ('36 un resumen pasa el techo de 849 caracteres', 'TC-823',
  [(primeravin('CoAo — Coartación de aorta'),
    primeravin('CoAo — Coartación de aorta').replace(
      'estenosis del istmo aórtico',
      'estenosis del istmo aórtico, que es el segmento de la aorta que queda entre la salida de la subclavia izquierda y la desembocadura del ductus arterioso y que en el adulto se mide con imagen de corte'))]),
 ('37 un resumen gana una OCTAVA vinieta y pasa el techo de siete', 'TC-823',
  [(primeravin('Fontan — Circulación de Fontan'),
    primeravin('Fontan — Circulación de Fontan') + '\n'
    + primeravin('Fontan — Circulación de Fontan'))]),
 ('38 un resumen nombra la guia de la que sale', 'TC-823',
  [('&bull; <b>Qué vigilar:</b> el hígado, de forma sistemática, con derivación a hepatología<br>',
    '&bull; <b>Qué vigilar:</b> el hígado, de forma sistemática, con derivación a hepatología (ACC/AHA 2025, folio e202)<br>')]),
 ('39 un resumen gana una linea de fuente en cursiva', 'TC-823',
  [(titulo('Eisenmenger — Síndrome de Eisenmenger'),
    '      <div style="font-size:10px;color:var(--text2);"><i>Fuente: guía de congenitas</i></div>\n'
    + titulo('Eisenmenger — Síndrome de Eisenmenger'))]),
 ('40 un resumen queda oculto: el texto esta y el medico no lo ve', 'TC-823',
  [(titulo('TGA — Transposición de grandes arterias'),
    titulo('TGA — Transposición de grandes arterias').replace('margin-bottom:6px;', 'margin-bottom:6px;display:none;'))]),
 # ══ los dos controles ════════════════════════════════════════════════════════════════════
 ('41 la entrada nueva gana un campo con id: entraria al censo del estudio', 'TC-824',
  [('    <div id="ref-asoc" style="display:none;" class="card-body">',
    '    <div id="ref-asoc" style="display:none;" class="card-body">\n      <input id="asoc_prueba" type="text">')]),
 ('42 la ficha de anomalias coronarias pierde una marca data-ref-solo: el globo otr-rac cambia', 'TC-824',
  [('      <div data-ref-solo="1" style="font-size:10px;color:var(--text2);margin-top:8px;line-height:1.4;">',
    '      <div style="font-size:10px;color:var(--text2);margin-top:8px;line-height:1.4;">')]),
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
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
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
