#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_gen_p36tablas.py - PANT-36, parte A (2026-11-11).

LAS DOS TABLAS SE GENERAN DESDE ESTA ESPECIFICACION Y NO SE RETIPEAN. El texto de cada celda
es el de la orden del medico, copiado una sola vez aca; el HTML sale de este archivo. Es la
misma forma que PANT-34 uso para los textos del esquema de anomalias coronarias: con el texto
escrito a mano dentro del marcado no hay con que comparar carácter por carácter.

Uso:
  python3 scripts/_gen_p36tablas.py --html      -> imprime el bloque de marcado
  python3 scripts/_gen_p36tablas.py --json      -> imprime la especificacion (para la sonda y el caso)
  python3 scripts/_gen_p36tablas.py --insertar  -> inserta el bloque en index.html tras ref-coronarias
"""
import sys, json, re, html

TIT1 = 'Síndromes con cardiopatía'
COLS1 = ['Síndrome', 'Alteración genética', 'Con cardiopatía', 'Cardiopatía más típica', 'Cómo sospecharlo']
T1 = [
 ['Deleción 22q11.2 (DiGeorge, velocardiofacial)',
  'Deleción 22q11.2',
  '60 a 80 %',
  'Arco aórtico interrumpido tipo B y otras anomalías del arco, tronco arterioso, tetralogía de Fallot, CIV con atresia pulmonar. Del subgrupo con cardiopatía, el 70 % tiene un defecto conotruncal.',
  'Rasgos faciales, paladar y habla alterados, timo y paratiroides pequeños, hipocalcemia, inmunodeficiencia, trastornos del neurodesarrollo y psiquiátricos. En el adulto puede no notarse a simple vista.'],
 ['Down',
  'Trisomía 21',
  '40 a 50 %',
  'CIA, CIV, canal AV (defecto septal auriculoventricular), Fallot. Más del 75 % de los canales AV completos ocurren en Down.',
  'Rasgos faciales, discapacidad del desarrollo, inestabilidad atlantoaxial, apnea obstructiva del sueño, alteraciones craneofaciales.'],
 ['Holt-Oram',
  'Gen TBX5',
  '75 %',
  'CIA, CIV, valvulopatía (prolapso mitral, estenosis pulmonar).',
  'Alteraciones óseas de los miembros superiores; trastornos de la conducción.'],
 ['Klinefelter',
  '47,XXY',
  '50 %',
  'Ductus arterioso persistente, CIA, prolapso mitral.',
  'Talla alta, testículos pequeños, pubertad tardía, discapacidad del desarrollo.'],
 ['Noonan',
  'PTPN11, KRAS, SOS1, RAF1, NRAS, BRAF, MAP2K1',
  '80 %',
  'Estenosis pulmonar, CIA, miocardiopatía hipertrófica, canal AV. La válvula pulmonar displásica (15 a 20 % de las estenosis valvulares pulmonares) suele ser parte del Noonan.',
  'Rasgos faciales, cuello alado, deformidad del tórax, alteraciones linfáticas, trastornos de la coagulación.'],
 ['Turner',
  '45,X (monosomía total o parcial del X)',
  '30 %',
  'Válvula aórtica bicúspide, coartación, aortopatía, drenaje venoso pulmonar anómalo parcial; también VCS izquierda, arco transverso alargado y dilatación de los troncos braquiocefálicos.',
  'Talla baja, cuello alado, linfedema, amenorrea primaria.'],
 ['Williams (Williams-Beuren)',
  'Deleción 7q11.23 (gen de la elastina)',
  '50 a 80 %',
  'Estenosis aórtica supravalvular, estenosis de ramas pulmonares, estenosis pulmonar supravalvular, estenosis del ostium coronario, QTc largo, estrechez aórtica media.',
  'Cara «élfica», personalidad muy sociable, hipoacusia, retraso del desarrollo, hipercalcemia del lactante.'],
 ['Alagille',
  'Gen JAG1',
  '70 a 75 %',
  'Estenosis de ramas o periférica de la arteria pulmonar u otras estrecheces arteriales (en dos tercios); también Fallot, estenosis aórtica, defectos septales.',
  'Rasgos faciales, enfermedad del hígado (colestasis crónica, atresia biliar), accidentes neurovasculares, alteraciones renales.'],
 ['Heterotaxia',
  'Varios genes (ZIC3, NODAL, CFC1 y otros)',
  '50 a 95 %',
  'Canal AV (balanceado o no), grandes vasos malpuestos, VCI interrumpida, VCS bilateral, isomerismo auricular.',
  'Situs anormal, disfunción ciliar, asplenia funcional, trastornos de la conducción, atresia biliar.'],
]

TIT2 = 'Asociaciones entre cardiopatías, sin síndrome'
COLS2 = ['Cardiopatía', 'Se asocia con', 'Qué mirar en el eco']
T2 = [
 ['Válvula aórtica bicúspide',
  'Coartación (4 a 10 % de las bicúspides); enfermedad de la aorta torácica, con dilatación de la aorta ascendente (hasta 30 a 40 % en centros de referencia); presentación familiar (bicúspide en 5 a 10 % de los familiares de primer grado).',
  'Istmo y arco aórtico (coartación), raíz y aorta ascendente.'],
 ['Coartación de aorta',
  'Válvula aórtica bicúspide (más del 60 %); estenosis subaórtica o supravalvular; estenosis mitral o supramitral (incluida la válvula en paracaídas); complejo de Shone; hipoplasia del arco; aneurisma de la aorta ascendente; fuera del corazón, subclavia derecha anómala (4 a 5 %) y aneurismas intracerebrales (hasta 10 %).',
  'Válvula aórtica, aorta ascendente, tracto de salida del VI, válvula mitral y su aparato subvalvular, arco.'],
 ['Tetralogía de Fallot',
  'Anomalías coronarias (5 a 14 %; en la mayoría de esos casos una arteria cruza el tracto de salida del VD; coronaria izquierda dominante en cerca del 25 %); canal AV.',
  'Origen y trayecto de las coronarias (rama que cruza el tracto de salida del VD); canal AV asociado.'],
 ['Comunicación interventricular (CIV)',
  'Forma parte de la tetralogía de Fallot, de la TGA y de la TGA corregida; la CIV de salida, con prolapso de la cúspide coronariana derecha, insuficiencia aórtica y aneurisma del seno de Valsalva; la perimembranosa, con VD de doble cámara; estenosis subaórtica. Por tipo: perimembranosa ≈80 %, muscular hasta 15 a 20 %, de salida ≈5 %.',
  'Tipo y número de defectos, válvula aórtica (prolapso, insuficiencia), seno de Valsalva, VD de doble cámara, tracto de salida del VI.'],
 ['Comunicación interauricular (CIA)',
  'Drenaje venoso pulmonar anómalo, VCS izquierda persistente, estenosis valvular pulmonar, prolapso mitral. El seno venoso superior se asocia a conexión anómala de las venas pulmonares derechas. Por tipo: ostium secundum 80 %, ostium primum 15 %, seno venoso superior 5 %, seno venoso inferior menos de 1 %, seno coronario sin techo menos de 1 %.',
  'Venas pulmonares (sobre todo en el seno venoso), seno coronario dilatado (VCS izquierda), válvula pulmonar, válvula mitral.'],
 ['Anomalía de Ebstein',
  'CIA ostium secundum o foramen oval permeable; vías accesorias, incluidas las de tipo Mahaim (un tercio de los adultos con Ebstein y preexcitación tiene múltiples); también CIV y estenosis pulmonar.',
  'Septum interauricular (dirección del cortocircuito), tracto de salida del VD; correlacionar con el ECG.'],
 ['TGA congénitamente corregida',
  'Lesiones asociadas en más del 80 %: CIV (70 %), estenosis pulmonar (40 %), tricúspide sistémica displásica tipo Ebstein (un tercio); dextrocardia (20 %); bloqueo AV (2 % por año); Wolff-Parkinson-White (2 a 4 %).',
  'Tricúspide sistémica (displasia, insuficiencia), CIV, tracto de salida del VI, posición del ápex.'],
 ['Estenosis subaórtica',
  'Valvulopatía aórtica, CIV, canal AV, complejo de Shone. La CIV asociada se relaciona con la progresión.',
  'Membrana o rodete del tracto de salida del VI, válvula aórtica e insuficiencia aórtica, CIV, válvula mitral.'],
 ['Estenosis aórtica supravalvular',
  'Formas familiares; anomalías coronarias, sobre todo estenosis del ostium (9 % de los que consultan en el primer año de vida).',
  'Unión sinotubular y ostium coronarios; el eco transtorácico sirve de tamizaje y la TC confirma.'],
 ['Transposición de grandes arterias (TGA)',
  'CIV (≈40 %); variantes del patrón coronario: habitual ≈65 %, circunfleja desde la derecha 14 %, otros 20 %.',
  'Patrón coronario antes de la cirugía (más inusual si hay CIV) y trayecto intramural.'],
 ['Tronco arterioso',
  'Anomalías coronarias (hasta 20 %; ostium coronario único 18 %); insuficiencia de la válvula truncal; arco interrumpido.',
  'Origen coronario respecto de las arterias pulmonares; válvula truncal; arco.'],
 ['ARCAPA (coronaria derecha desde la pulmonar)',
  'Ventana aortopulmonar o Fallot (las más comunes).',
  'Ante una ventana aortopulmonar o un Fallot, confirmar el origen de la coronaria derecha.'],
 ['Canal AV (defecto septal AV)',
  'Síndrome de Down (más del 75 % de los completos); Fallot y otras cardiopatías complejas; en los parciales, más del 90 % sin Down.',
  'Tipo de canal (parcial o completo), válvulas AV; buscar Fallot asociado.'],
]

E = lambda s: html.escape(s, quote=False)
ROT = ('font-size:11.5px;font-weight:700;color:var(--accent2);margin:%s;')
# El envoltorio de celular es el patron MEDIDO de PANT-25 en ref-tumores.
WRAP = '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">'
TH = 'padding:6px 8px;text-align:left;color:var(--accent2);'
TD = 'padding:5px 8px;'


def tabla(cols, filas, minw):
    o = [WRAP + '<table style="width:100%;min-width:' + str(minw) + 'px;border-collapse:collapse;font-size:12px;">']
    o.append('        <tr style="background:var(--section-head);">'
             + ''.join('<th style="' + TH + '">' + E(c) + '</th>' for c in cols) + '</tr>')
    for i, f in enumerate(filas):
        ult = (i == len(filas) - 1)
        st = ('' if ult else 'border-bottom:1px solid var(--border);') + ('background:var(--bg3);' if i % 2 else '')
        tds = ['<td style="' + TD + 'font-weight:700;">' + E(f[0]) + '</td>']
        tds += ['<td style="' + TD + '">' + E(c) + '</td>' for c in f[1:]]
        o.append('        <tr' + (' style="' + st + '"' if st else '') + '>' + ''.join(tds) + '</tr>')
    o.append('      </table></div>')
    return '\n'.join(o)


CABEZA = '''
  <!-- ══ ASOCIACIONES Y SINDROMES — PANT-36, parte A (2026-11-11) ═══════════════════════════
       TERCERA ENTRADA del panel «Cardiopatia congenita», debajo de «Anomalias coronarias».
       ⚠️ NO ES UNA DECIMA SUBPESTANIA, y esta medido en `docs/INVENTARIO_P36.md`: Referencias
          tiene NUEVE subpestanias y «Cardiopatia congenita» es una de ellas; lo que vive debajo
          de una entrada es otra ENTRADA del mismo panel. Es el vocabulario que PANT-25 fijo.
       ⚠️ `asoc` VA A `REF_SUBTAB.congenitas` EN ESTE MISMO COMMIT, por la leccion que
          `constriccion` dejo en la tanda J: una ficha fuera del reparto existe, se abre desde su
          encabezado y el buscador la indexa, pero el medico que navegue por las solapas no la
          encuentra nunca. Lo cazan TC-502 (A3) y TC-509 (F3).
       ⚠️ EL BUSCADOR NO NECESITA NINGUN CAMBIO: su indice recorre los `h2.card-head` con
          `toggleRef` de cada panel y arma la entrada sola.
       ⚠️ EL TEXTO DE LAS DOS TABLAS SE GENERA DESDE `scripts/_gen_p36tablas.py` y NO se
          retipea: ahi vive la especificacion del medico, una sola vez, y de ahi sale este
          marcado. Con el texto escrito a mano no hay con que comparar carácter por carácter.
       ⚠️ CERO BOTONES, CERO SELECTORES Y CERO CASILLAS, y cero `input`, `select` y `textarea`:
          por eso esta entrada no agrega un solo campo del estudio ni una columna de Excel. El
          censo recorre `input[id], select[id], textarea[id]`.
       ⚠️ EL ENVOLTORIO `overflow-x:auto` CON LA TABLA EN `min-width` ES EL PATRON MEDIDO de
          PANT-25 en `ref-tumores`: la tabla se desplaza DENTRO de su contenedor y la pagina no
          gana desplazamiento horizontal en celular.
       ⚠️ SIN PIE, SIN FUENTE Y SIN NOTA, que es lo que A4 pide. Nada de esto llega al papel:
          es una entrada de Referencias.
       EL TECHO DE EXTENSION DE LOS RESUMENES NO APLICA ACA: son tablas, no resumenes. -->
  <div class="card">
    <h2 class="card-head" style="cursor:pointer;user-select:none;" onclick="toggleRef('asoc',this)">
      🔗 Asociaciones y síndromes
      <span style="float:right;">▶</span>
    </h2>
    <div id="ref-asoc" style="display:none;" class="card-body">
'''.rstrip('\n')


def bloque(parte):
    o = [CABEZA]
    o.append('      <div style="' + (ROT % '2px 0 6px') + '">' + E(TIT1) + '</div>')
    o.append('      ' + tabla(COLS1, T1, 900))
    if parte >= 2:
        o.append('      <div style="' + (ROT % '14px 0 6px') + '">' + E(TIT2) + '</div>')
        o.append('      ' + tabla(COLS2, T2, 700))
    o.append('    </div>')
    o.append('  </div>')
    return '\n'.join(o)


def main():
    a = sys.argv[1:]
    parte = 2 if '--parte2' in a or '--insertar2' in a else (1 if ('--parte1' in a or '--insertar' in a or '--html' in a) else 2)
    if '--json' in a:
        print(json.dumps({'tit1': TIT1, 'cols1': COLS1, 't1': T1,
                          'tit2': TIT2, 'cols2': COLS2, 't2': T2}, ensure_ascii=False))
        return
    if '--html' in a:
        print(bloque(parte)); return
    if '--insertar' in a or '--insertar2' in a:
        p = 'index.html'
        s = open(p, encoding='utf-8').read()
        ANCLA = '''        ASE 2020 &mdash; Frommelt et al'''
        if '--insertar2' in a:
            # reemplaza el bloque entero por la version de dos tablas
            i = s.find('  <!-- ══ ASOCIACIONES Y SINDROMES')
            if i < 0: sys.exit('no encuentro el bloque de la parte A')
            # El cierre de la tarjeta es la secuencia EXACTA de sus dos div: buscar '  </div>'
            # sin el salto encontraria primero '    </div>', que lo contiene.
            CIERRE = '\n    </div>\n  </div>'
            j = s.find(CIERRE, s.find('<div id="ref-asoc"', i))
            if j < 0: sys.exit('no encuentro el cierre de la tarjeta de asoc')
            nuevo = s[:i] + bloque(2) + s[j + len(CIERRE):]
        else:
            k = s.find('<div id="ref-coronarias"')
            if k < 0: sys.exit('no encuentro ref-coronarias')
            # cierre de la tarjeta de coronarias: el primer '\n  </div>\n' despues de su cuerpo
            m = s.find('\n  </div>\n', k)
            if m < 0: sys.exit('no encuentro el cierre de la tarjeta de coronarias')
            corte = m + len('\n  </div>\n')
            nuevo = s[:corte] + bloque(1) + '\n' + s[corte:]
        open(p, 'w', encoding='utf-8').write(nuevo)
        print('insertado (parte %d)' % (2 if '--insertar2' in a else 1))
        return
    sys.exit(__doc__)


main()
