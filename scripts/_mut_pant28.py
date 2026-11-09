#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant28.py - barrido de mutaciones dirigidas de la tanda PANT-28 (2026-11-09).
Calcado de _mut_pant26.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una: el reparto y el id de las tres fichas nuevas, el orden y los rotulos de
sus bloques, las cifras y los folios de cada una, la regla de que ninguna celda de la tabla de
guias compara una guia con otra, la frase literal de que la fuente no recomienda usar cortes,
la prohibicion de transcribir criterios de la hipertrofica, el puntaje de Rassi, la ausencia de
controles en la ficha de Chagas, y la oracion del trombo protesico en la aortica mecanica.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 ('01 racong sale del reparto y la ficha queda sin panel', 'TC-778,TC-783',
  [("Object.freeze(['congenitas', 'coronarias', 'racong'])",
    "Object.freeze(['congenitas', 'coronarias'])")]),
 ('02 el id de la ficha nueva cambia y deja de existir', 'TC-778,TC-783',
  [('<div id="ref-racong" style="display:none;" class="card-body">',
    '<div id="ref-racongX" style="display:none;" class="card-body">')]),
 ('03 la ficha nueva nace ABIERTA', 'TC-778',
  [('<div id="ref-racong" style="display:none;" class="card-body">',
    '<div id="ref-racong" class="card-body">')]),
 ('04 el bloque 3 se renumera y rompe el orden', 'TC-778',
  [('margin:14px 0 6px;">3 &middot; Riesgo</div>',
    'margin:14px 0 6px;">0 &middot; Riesgo</div>')]),
 ('05 el bloque 4 pasa a llamarse ECG', 'TC-778',
  [('margin:14px 0 6px;">4 &middot; El ecocardiograma</div>',
    'margin:14px 0 6px;">4 &middot; El ECG</div>')]),
 ('06 aparece un bloque de aneurismas coronarios', 'TC-778',
  [('margin:14px 0 6px;">5 &middot; Otras exploraciones</div>',
    'margin:14px 0 6px;">5 &middot; Aneurismas coronarios</div>')]),
 ('07 aparece un bloque de restriccion del deporte', 'TC-778',
  [('7 &middot; Seguimiento</div><div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:12px 0 6px;">Interv',
    '7 &middot; Restricci&oacute;n del deporte</div><div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:12px 0 6px;">Interv')]),
 ('08 una celda de una tabla de tres columnas queda vacia', 'TC-778',
  [('<td style="padding:5px 8px;">La rotaci&oacute;n <b>horaria</b>',
    '<td style="padding:5px 8px;"></td><td style="padding:5px 8px;">La rotaci&oacute;n <b>horaria</b>')]),
 ('09 la prevalencia en poblacion general se mueve', 'TC-779',
  [('Se estima en el <b>0,7 %</b>',
    'Se estima en el <b>0,8 %</b>')]),
 ('10 el intervalo de confianza se mueve', 'TC-779',
  [('<b>0,48 a 0,95 %</b>',
    '<b>0,45 a 0,95 %</b>')]),
 ('11 la incidencia del ALCAPA se mueve', 'TC-779',
  [('<b>1 caso cada 300.000 ni&ntilde;os</b>',
    '<b>1 caso cada 30.000 ni&ntilde;os</b>')]),
 ('12 el limite de Nyquist se mueve', 'TC-779',
  [('l&iacute;mite de Nyquist a <b>20 a 40 cm/s</b>',
    'l&iacute;mite de Nyquist a <b>20 a 50 cm/s</b>')]),
 ('13 la longitud del segmento intramural corto se mueve', 'TC-779',
  [('<b>m&aacute;s corto, de 2 a 3 mm</b>',
    '<b>m&aacute;s corto, de 2 a 4 mm</b>')]),
 ('14 la sensibilidad del flujo invertido se mueve', 'TC-779',
  [('Inversi&oacute;n del flujo en la coronaria izquierda</td><td style="padding:5px 8px;"><b>91 %</b>',
    'Inversi&oacute;n del flujo en la coronaria izquierda</td><td style="padding:5px 8px;"><b>81 %</b>')]),
 ('15 la resolucion temporal de la tomografia se mueve', 'TC-779',
  [('resoluci&oacute;n temporal llega a <b>66 ms</b>',
    'resoluci&oacute;n temporal llega a <b>60 ms</b>')]),
 ('16 el puente miocardico pierde su definicion', 'TC-779',
  [('<b>compresi&oacute;n sist&oacute;lica de una coronaria epic&aacute;rdica, que puede persistir en di&aacute;stole</b>',
    '<b>un hallazgo de la tomograf&iacute;a</b>')]),
 ('17 la ficha VIEJA de coronarias gana una palabra', 'TC-779,TC-783',
  [('<b style="color:var(--accent2);">Riesgo:</b> el trayecto <b>interarterial</b>',
    '<b style="color:var(--accent2);">Riesgo:</b> hoy el trayecto <b>interarterial</b>')]),
 ('18 el folio de la Tabla 2 de sensibilidades se corre', 'TC-779',
  [('ecocardiogramas preoperatorios. ASE 2020 de anomal&iacute;as coronarias &middot; hoja 15, folio <b>273</b>',
    'ecocardiogramas preoperatorios. ASE 2020 de anomal&iacute;as coronarias &middot; hoja 15, folio <b>274</b>')]),
 ('19 una celda de la columna de la ESC 2020 nombra a la ACC/AHA', 'TC-780',
  [('La angiotomograf&iacute;a es la t&eacute;cnica preferida para evaluar la anatom&iacute;a de alto riesgo (hoja 66, folio <b>628</b>).',
    'Como la ACC/AHA 2025, la angiotomograf&iacute;a es la preferida (hoja 66, folio <b>628</b>).')]),
 ('20 una celda en blanco pasa a decir que esa guia no publica nada', 'TC-780',
  [('angina con otras causas excluidas</td><td style="padding:5px 8px;"></td><td style="padding:5px 8px;"></td>',
    'angina con otras causas excluidas</td><td style="padding:5px 8px;">Esta gu&iacute;a no publica nada para esta situaci&oacute;n.</td><td style="padding:5px 8px;"></td>')]),
 ('21 la cabecera de la cuarta columna deja de nombrar su guia', 'TC-780',
  [('color:var(--accent2);">ESC 2022 de arritmias ventriculares</th>',
    'color:var(--accent2);">Arritmias ventriculares</th>')]),
 ('22 una celda pierde su clase y su folio', 'TC-780',
  [('Cirug&iacute;a <b>recomendada</b>. <b>Clase 1 &middot; Nivel B-NR</b> (folio <b>e211</b>).',
    'Cirug&iacute;a recomendada.')]),
 ('23 atleta sale del reparto', 'TC-781,TC-783',
  [("'miocard', 'atleta', 'chagas', 'formulas'])",
    "'miocard', 'chagas', 'formulas'])")]),
 ('24 el bloque del ECG del atleta cambia de nombre', 'TC-781',
  [('4 &middot; El ECG</div><div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:12px 0 6px;">Los tres gr',
    '4 &middot; El trazado</div><div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:12px 0 6px;">Los tres gr')]),
 ('25 la frase de que la fuente NO recomienda usar cortes se suaviza', 'TC-781',
  [('miocardiopat&iacute;a patol&oacute;gica, NO se recomienda&raquo;</b>',
    'miocardiopat&iacute;a patol&oacute;gica, se desaconseja&raquo;</b>')]),
 ('26 la ficha del atleta transcribe un criterio de la hipertrofica', 'TC-781',
  [('El engrosamiento por ejercicio es t&iacute;picamente leve',
    'El HCM Risk-SCD no aplica. El engrosamiento por ejercicio es t&iacute;picamente leve')]),
 ('27 la regla de folio del documento de ECG se cambia', 'TC-781',
  [('<b>Regla de folio</b>: folio = hoja + 1056',
    '<b>Regla de folio</b>: folio = hoja + 1050')]),
 ('28 el corte del espesor del atleta se mueve', 'TC-781',
  [('de <b>11 a 13 mm en atletas cauc',
    'de <b>11 a 14 mm en atletas cauc')]),
 ('29 el pie que remite a los criterios de la app se borra', 'TC-781',
  [('&laquo;Miocardiopat&iacute;as &mdash; Criterios Eco Clave&raquo;</b> de esta misma solapa',
    '&laquo;otra ficha&raquo;</b> de esta misma solapa')]),
 ('30 chagas sale del reparto', 'TC-782,TC-783',
  [("'miocard', 'atleta', 'chagas', 'formulas'])",
    "'miocard', 'atleta', 'formulas'])")]),
 ('31 el puntaje de Rassi pierde una variable', 'TC-782',
  [('<td style="padding:5px 8px;">Sexo masculino</td>',
    '<td style="padding:5px 8px;">Edad</td>')]),
 ('32 la categoria alta del puntaje se mueve', 'TC-782',
  [('<td style="padding:5px 8px;"><b>12 a 20</b></td>',
    '<td style="padding:5px 8px;"><b>12 a 21</b></td>')]),
 ('33 la mortalidad a 10 anios del riesgo alto se mueve', 'TC-782',
  [('<td style="padding:5px 8px;"><b>63 %</b></td><td style="padding:5px 8px;"><b>84 %</b></td>',
    '<td style="padding:5px 8px;"><b>63 %</b></td><td style="padding:5px 8px;"><b>88 %</b></td>')]),
 ('34 la ficha de Chagas gana un boton y pasa a calcular', 'TC-782',
  [('<div id="ref-chagas" style="display:none;" class="card-body">',
    '<div id="ref-chagas" style="display:none;" class="card-body"><button type="button">Calcular Rassi</button>')]),
 ('35 el pie de los criterios de desfibrilador se borra', 'TC-782',
  [('Los criterios generales de indicaci&oacute;n de desfibrilador no se escriben ac&aacute;',
    'Esta ficha publica lo que las fuentes dicen')]),
 ('36 el estadio B1 pierde su definicion', 'TC-782',
  [('Cardiopat&iacute;a estructural evidenciada por <b>cambios electrocardiogr&aacute;ficos o ecocardiogr&aacute;ficos</b>, con <b>funci&oacute;n ventricular global normal</b>',
    'Cardiopat&iacute;a estructural evidenciada por <b>cambios electrocardiogr&aacute;ficos o ecocardiogr&aacute;ficos</b>, con funci&oacute;n alterada')]),
 ('37 la oracion del folio 4698 sale de la aortica', 'TC-783',
  [("imprime el tamaño del trombo grande como «10 mm o más». La cirugía se considera ante un trombo protésico grande, no obstructivo, que se complicó con embolia o que persiste a pesar de anticoagulación óptima (folio 4698).'",
    "imprime el tamaño del trombo grande como «10 mm o más»'")]),
 ('38 la oracion se le presta tambien a la tricuspide', 'TC-783',
  [("    nota:'su Figura 20 (hoja 65, folio 4699) imprime el tamaño del trombo grande como «10 mm o más»' },",
    "    nota:'su Figura 20 (hoja 65, folio 4699) imprime el tamaño del trombo grande como «10 mm o más». La cirugía se considera ante un trombo protésico grande, no obstructivo, que se complicó con embolia o que persiste a pesar de anticoagulación óptima (folio 4698).' },")]),
 ('39 la pregunta aortica del trombo deja de acotarse a lo mecanico', 'TC-783',
  [("    if (p.clave === 'prota.icAguda' || p.clave === 'prota.trombGrande') { if (!esMec || _trb !== 'si') return; }",
    "    if (p.clave === 'prota.icAguda' || p.clave === 'prota.trombGrande') { if (_trb !== 'si') return; }")]),
 ('40 la oracion de la aortica se escribe distinta de la de la mitral', 'TC-783',
  [("o que persiste a pesar de anticoagulación óptima (folio 4698).'",
    "o que persiste pese a anticoagulación óptima (folio 4698).'")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 else None
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
