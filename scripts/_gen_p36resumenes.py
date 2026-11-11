#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_gen_p36resumenes.py - PANT-36, parte B (2026-11-11).

LOS RESUMENES DE CONGENITAS SE GENERAN DESDE ESTA ESPECIFICACION Y NO SE RETIPEAN, igual que
las dos tablas de la parte A. Cada viñeta trae, al lado del texto, la hoja y el folio de la
fuente que la respalda -- eso NO va a la pantalla: va a `docs/CONTROL_CONGENITAS_P36.md`.

El molde es el MEDIDO de `ref-miocard` (ver docs/INVENTARIO_P36.md):
  titulo  <div 12px / 700 / var(--accent2) / margin-bottom 6px>
  cuerpo  <div 12px / var(--text) / line-height 1.8 / margin-bottom 10px>
          vinietas «• <b>Rotulo:</b> texto<br>»
  SIN linea de fuente, que es el estilo medido del sector.
TECHO: 849 caracteres (titulo + cuerpo, normalizados) y 7 vinietas -- el del resumen mas largo
de `ref-miocard`, la amiloidosis.

Uso:
  python3 scripts/_gen_p36resumenes.py --html <clave> [<clave>...]
  python3 scripts/_gen_p36resumenes.py --json
  python3 scripts/_gen_p36resumenes.py --medir
  python3 scripts/_gen_p36resumenes.py --insertar <clave> [<clave>...]
"""
import sys, json, html, re

A = 'ACC/AHA 2025'   # folio = e + hoja + 114
E = 'ESC 2020'       # folio = hoja + 562

# clave: (titulo, [ (rotulo, texto, fuente, hoja, folio, 'imagen'|'texto') ])
RES = {}

RES['cia'] = ('CIA — Comunicación interauricular', [
 ('Tipos', 'secundum 80 %, primum (canal AV parcial) 15 %, seno venoso superior 5 %, seno venoso inferior menos del 1 % y seno coronario sin techo 1 %', A, 35, 'e149', 'imagen'),
 ('Qué produce', 'el cortocircuito de izquierda a derecha agranda las cavidades derechas y puede alterar la función del VD', A, 35, 'e149', 'imagen'),
 ('Qué buscar', 'tamaño del defecto, bordes, morfología y conexión de las venas pulmonares; el transtorácico no define todo el septum y el transesofágico sí', A, 35, 'e149', 'imagen'),
 ('Complicaciones', 'HTP, cortocircuito de derecha a izquierda, embolia paradójica y arritmia auricular, más frecuente cuanto más tarde se cierra', A, 35, 'e149', 'imagen'),
 ('Cuándo se cierra', 'Qp/Qs ≥1,5 con dilatación del VD y RVP ≤2 unidades Wood; en el secundum aislado se prefiere el cierre percutáneo', A, 35, 'e149', 'imagen'),
 ('Cuándo no', 'con fisiología de Eisenmenger el cierre no se hace', A, 35, 'e149', 'imagen'),
])

RES['civ'] = ('CIV — Comunicación interventricular', [
 ('Qué es', 'la cardiopatía congénita más frecuente después de los defectos de la válvula aórtica; sobrecarga de volumen del corazón izquierdo', A, 40, 'e154', 'imagen'),
 ('Restrictiva pequeña', 'gradiente entre VI y VD mayor de 64 mmHg, con cortocircuito chico', A, 40, 'e154', 'imagen'),
 ('Restrictiva de presión, no de volumen', 'Qp/Qs ≥1,5 y menor de 2, con HTP, dilatación del VI o las dos', A, 40, 'e154', 'imagen'),
 ('No restrictiva grande', 'sin obstrucción del TSVD, en el adulto suele acompañarse de Eisenmenger', A, 40, 'e154', 'imagen'),
 ('Qué buscar', 'localización y tamaño, prolapso o aneurisma del seno de Valsalva, insuficiencia aórtica y VD de doble cámara', A, 40, 'e154', 'imagen'),
 ('Seguimiento', 'en la restrictiva no complicada, control cada 3 a 5 años', A, 40, 'e154', 'imagen'),
 ('Cuándo no se cierra', 'con Qp/Qs menor de 1,5 y sin otra indicación, y con fisiología de Eisenmenger', A, 40, 'e154', 'imagen'),
])

RES['dap'] = ('DAP — Ductus arterioso persistente', [
 ('Qué es', 'resto de la circulación fetal que une la aorta descendente con el tronco de la arteria pulmonar', A, 47, 'e161', 'imagen'),
 ('Frecuencia', '0,3 a 0,8 % de los recién nacidos de término, con predominio en mujeres', A, 47, 'e161', 'imagen'),
 ('Qué produce', 'según su tamaño y las resistencias, dilata el corazón izquierdo por sobrecarga de volumen y puede llevar a HTP', A, 47, 'e161', 'imagen'),
 ('Cuándo hay HTP', 'RVP ≥2 unidades Wood, presión media de la arteria pulmonar ≥20 mmHg y presión capilar pulmonar ≤15 mmHg', A, 47, 'e161', 'imagen'),
 ('Cianosis diferencial', 'la saturación se mide en los pies y en las dos manos, porque el cortocircuito invertido entra por debajo del ductus', A, 47, 'e161', 'imagen'),
 ('Cuándo se cierra', 'con agrandamiento del corazón izquierdo por el cortocircuito y sin HTP; con Eisenmenger el cierre no se hace', A, 47, 'e161', 'imagen'),
])

RES['vab'] = ('VAB — Válvula aórtica bicúspide', [
 ('Frecuencia', 'la malformación cardíaca congénita más común: 4,6 por 1.000 nacidos vivos, y 2 a 3 veces más frecuente en varones', A, 54, 'e168', 'imagen'),
 ('Qué es', 'en la mayoría, fusión anómala de dos cojinetes endocárdicos conotruncales vecinos', A, 54, 'e168', 'imagen'),
 ('Qué buscar', 'coartación y aneurisma de aorta, que se buscan en todo adulto con bicúspide', A, 53, 'e167', 'imagen'),
 ('Repercusión', 'remodelado del VI por apertura excéntrica de la válvula y menor elasticidad de la aorta ascendente', A, 54, 'e168', 'imagen'),
 ('Seguimiento de por vida', 'con diámetro aórtico mayor de 4 cm en los senos o en la aorta ascendente, o con factores de riesgo de disección', A, 53, 'e167', 'imagen'),
 ('Familiares de primer grado', 'un ecocardiograma, una sola vez', A, 53, 'e167', 'imagen'),
])

RES['coa'] = ('CoAo — Coartación de aorta', [
 ('Qué es', 'estenosis del istmo aórtico, a veces con hipoplasia del arco', A, 57, 'e171', 'texto'),
 ('Se acompaña de', 'válvula aórtica bicúspide, estenosis subaórtica y enfermedad de entrada del VI (anillo supramitral, estenosis mitral, válvula en paracaídas)', A, 57, 'e171', 'texto'),
 ('Qué produce', 'sobrecarga de presión del VI, con hipertrofia, fibrosis y relajación y distensibilidad alteradas', A, 57, 'e171', 'texto'),
 ('Cuándo es significativa', 'gradiente sistólico brazo-pierna mayor de 20 mmHg, gradiente medio Doppler mayor de 20 mmHg, cola diastólica en la aorta descendente y flujo anterógrado diastólico en la aorta abdominal', A, 57, 'e171', 'imagen'),
 ('Por cateterismo e imagen', 'gradiente pico a pico mayor de 20 mmHg, relación del istmo menor de 0,5 a 0,7 y arterias colaterales', A, 57, 'e171', 'imagen'),
 ('Seguimiento', 'presión en los cuatro miembros e imagen de corte; en la reparada, recoartación y aneurisma de la aorta', A, 57, 'e171', 'imagen'),
])

RES['tdf'] = ('TdF — Tetralogía de Fallot reparada', [
 ('Qué queda de la cirugía', 'la disfunción del tracto de salida del VD es la secuela más común, como insuficiencia pulmonar, estenosis pulmonar o las dos', A, 69, 'e183', 'imagen'),
 ('Atresia pulmonar', 'al menos el 15 % de los nacidos con Fallot la tienen, y suelen llevar un conducto del VD a la arteria pulmonar que se reemplaza con los años', A, 69, 'e183', 'imagen'),
 ('Insuficiencia pulmonar moderada', 'fracción de regurgitación del 25 % o más medida por resonancia', A, 69, 'e183', 'imagen'),
 ('Estenosis pulmonar moderada', 'presión del VD de al menos dos tercios de la sistémica por obstrucción del tracto de salida', A, 69, 'e183', 'imagen'),
 ('Qué más buscar', 'estenosis de ramas pulmonares y zonas disquinéticas o aneurismáticas de la pared libre del VD, por la resección muscular y el parche transanular', A, 69, 'e183', 'imagen'),
 ('Con los años', 'las arritmias se hacen más frecuentes y el seguimiento es de por vida', A, 68, 'e182', 'texto'),
])

RES['ebs'] = ('Ebstein — Anomalía de Ebstein', [
 ('Frecuencia', 'poco común: alrededor de 1 de cada 1.000 nacidos vivos', A, 60, 'e174', 'imagen'),
 ('Qué es', 'además de la malformación de la válvula tricúspide hay una miocardiopatía propia del VD, que puede extenderse al VI', A, 60, 'e174', 'imagen'),
 ('Se acompaña de', 'CIA, CIV y estenosis pulmonar; el foramen oval permeable, aunque se considere dentro de lo normal, pesa en la fisiología', A, 60, 'e174', 'imagen'),
 ('Qué buscar', 'morfología valvular, tamaño del corazón derecho, función sistólica del VD y cortocircuito a nivel auricular', A, 60, 'e174', 'texto'),
 ('Arritmias', 'las vías accesorias y las arritmias son relativamente frecuentes, así que el control incluye el ritmo', A, 60, 'e174', 'imagen'),
 ('Qué más', 'oximetría de pulso y prueba de esfuerzo', A, 60, 'e174', 'texto'),
])

RES['dsav'] = ('DSAV — Defecto del septo auriculoventricular', [
 ('Frecuencia', '4 a 5 % de las cardiopatías congénitas', A, 43, 'e157', 'imagen'),
 ('Qué es', 'defecto en el septo auriculoventricular con anomalías de las válvulas auriculoventriculares', A, 43, 'e157', 'imagen'),
 ('Parcial', 'sólo componente auricular (CIA ostium primum), a menudo con hendidura de la válvula AV izquierda', A, 43, 'e157', 'imagen'),
 ('Completo', 'sin fusión de los velos puente, con un defecto grande a nivel auricular y ventricular', A, 43, 'e157', 'texto'),
 ('Transicional', 'dos orificios valvulares funcionales, con CIV restrictiva y CIA ostium primum', A, 43, 'e157', 'texto'),
 ('Qué seguir', 'cortocircuito residual, insuficiencia de la válvula AV izquierda —el motivo más común de reoperación—, obstrucción del tracto de salida del VI —el segundo— y arritmias', A, 43, 'e157', 'texto'),
 ('ECG', 'nódulo AV desplazado hacia atrás y haz de His hacia abajo, con desviación del eje a la izquierda y riesgo de bloqueo completo tardío', A, 43, 'e157', 'texto'),
])

RES['esub'] = ('Estenosis subaórtica', [
 ('Qué es', 'desde una membrana fina hasta un rodete fibromuscular grueso, una obstrucción tunelizada difusa, inserciones mitrales anómalas o tejido de cojinete accesorio', A, 52, 'e166', 'imagen'),
 ('Cuándo aparece', 'suele manifestarse antes de los 10 años y predomina en varones', A, 52, 'e166', 'imagen'),
 ('Insuficiencia aórtica', 'se adquiere por la turbulencia o porque la membrana toca los velos; en el adulto no operado progresa lento y rara vez llega a severa', A, 52, 'e166', 'imagen'),
 ('Tratamiento', 'resección quirúrgica de la membrana, con miectomía o sin ella', A, 52, 'e166', 'imagen'),
 ('Riesgos', 'bloqueo cardíaco en el 4 a 5 %, recurrencia de hasta el 25 % y reoperación del 2 % por año', A, 52, 'e166', 'imagen'),
 ('Al decidir', 'la escala de severidad de la estenosis valvular aórtica puede no servir para fijar el umbral de operar en esta lesión', A, 52, 'e166', 'imagen'),
])

RES['easv'] = ('Estenosis aórtica supravalvular', [
 ('Dónde', 'distal a los ostium coronarios, en la unión sinotubular', A, 55, 'e169', 'imagen'),
 ('Formas', 'estrechez localizada en reloj de arena —la más común— o estenosis difusa de segmento largo de la aorta ascendente, que puede alcanzar los troncos braquiocefálicos', A, 55, 'e169', 'imagen'),
 ('Con qué aparece', 'síndrome de Williams, hipercolesterolemia familiar homocigota y arteriopatía por elastina no sindrómica', A, 55, 'e169', 'imagen'),
 ('Qué buscar', 'imagen basal con la anatomía aórtica en detalle', A, 55, 'e169', 'imagen'),
 ('En el Williams', 'evaluación basal de las arterias coronarias, por el riesgo de muerte súbita', A, 55, 'e169', 'imagen'),
 ('Cuándo se opera', 'síntomas o deterioro de la función ventricular por la obstrucción del tracto de salida del VI; con estenosis del ostium coronario e isquemia, revascularización', A, 55, 'e169', 'imagen'),
])

RES['tga'] = ('TGA — Transposición de grandes arterias', [
 ('d-TGA', 'discordancia ventriculoarterial; el switch auricular dejó al VD como ventrículo sistémico y hoy se opera con el arterial', A, 77, 'e191', 'imagen'),
 ('Tras el switch auricular', 'disfunción sistólica moderada o severa del ventrículo sistémico en el 42,8 % a una mediana de 29 años, e insuficiencia tricuspídea moderada o severa en la cuarta parte', A, 77, 'e191', 'imagen'),
 ('Los túneles', 'estenosis de los conductos venosos en hasta la mitad de los cateterizados y fugas en hasta el 65 %', A, 78, 'e192', 'imagen'),
 ('Arritmias', 'auricular 28,9 %, ventricular 5,8 %, pérdida del ritmo sinusal 24,9 % y muerte súbita del 0,63 % anual', A, 78, 'e192', 'imagen'),
 ('ccTGA', 'doble discordancia, con el VD como ventrículo sistémico y disfunción sistólica frecuente', A, 84, 'e198', 'imagen'),
 ('En la ccTGA', 'más del 80 % tiene lesiones asociadas —tricúspide tipo Ebstein, CIV y obstrucción del TSVI— y riesgo de bloqueo AV avanzado', A, 84, 'e198', 'imagen'),
])

RES['cvpa'] = ('CVPA — Conexión venosa pulmonar anómala parcial', [
 ('Qué es', 'una o más venas pulmonares drenan fuera de la aurícula izquierda; aislada, sin CIA, es rara', A, 45, 'e159', 'texto'),
 ('Qué produce', 'cortocircuito obligado de izquierda a derecha, con sobrecarga de volumen del VD y riesgo de HTP', A, 45, 'e159', 'texto'),
 ('En qué se diferencia de la CIA', 'sin cortocircuito de derecha a izquierda no hay embolia paradójica ni hipoxemia', A, 45, 'e159', 'texto'),
 ('Cuánto cortocircuito', 'lo fijan el calibre y el número de venas anómalas; con más de una sube el riesgo de sobrecarga y de HTP', A, 45, 'e159', 'texto'),
 ('Las más comunes', 'vena pulmonar superior derecha a la cava superior, y vena pulmonar superior izquierda a la vena innominada izquierda', A, 45, 'e159', 'texto'),
 ('Vena cimitarra', 'la vena pulmonar derecha, en general la inferior, drena a la vena cava inferior, a veces con secuestro pulmonar o colaterales aortopulmonares', A, 45, 'e159', 'texto'),
 ('Tratamiento', 'sólo quirúrgico', A, 45, 'e159', 'texto'),
])

RES['fontan'] = ('Fontan — Circulación de Fontan', [
 ('Qué es', 'la sangre venosa sistémica llega a las arterias pulmonares sin un ventrículo subpulmonar', A, 88, 'e202', 'texto'),
 ('Cómo funciona', 'hipertensión venosa sistémica obligada y gasto cardíaco bajo', A, 88, 'e202', 'texto'),
 ('Con los años', 'enfermedad multisistémica, con distintas formas de falla de la circulación y compromiso de otros órganos', A, 88, 'e202', 'texto'),
 ('Qué vigilar', 'el hígado, de forma sistemática, con derivación a hepatología', A, 88, 'e202', 'texto'),
 ('Tratamiento médico', 'la evidencia es escasa y se limita a la tromboprofilaxis; el tratamiento de las arritmias y el ejercicio programado pueden ayudar', A, 88, 'e202', 'texto'),
 ('Cateterismo', 'útil ante obstrucción del circuito de Fontan', A, 88, 'e202', 'texto'),
 ('Si falla la circulación', 'derivación temprana a un programa de insuficiencia cardíaca y trasplante', A, 88, 'e202', 'texto'),
])

RES['eisen'] = ('Eisenmenger — Síndrome de Eisenmenger', [
 ('Qué es', 'un cortocircuito de izquierda a derecha eleva la resistencia pulmonar hasta volver el flujo bidireccional', A, 94, 'e208', 'texto'),
 ('De qué depende', 'síndromes asociados, anatomía, tamaño del cortocircuito, genética y exposición ambiental', A, 94, 'e208', 'texto'),
 ('Qué produce', 'cianosis crónica con disfunción de varios órganos, sistólica y diastólica, arritmias y muerte súbita', A, 94, 'e208', 'texto'),
 ('Capacidad funcional', 'de las más bajas de la cardiopatía congénita del adulto, con peor calidad de vida', A, 94, 'e208', 'texto'),
 ('Con síndrome de Down', 'más comorbilidad —apnea del sueño, disfunción tiroidea— y la marcha de 6 minutos refleja peor la gravedad', A, 94, 'e208', 'texto'),
 ('Qué evitar', 'altura prolongada, embarazo, calor o humedad extremos, nefrotóxicos, esfuerzo extremo y cambios grandes de volemia', A, 94, 'e208', 'texto'),
 ('Oxígeno', 'se indica caso por caso, sin buscar normalizar la saturación', A, 94, 'e208', 'texto'),
])

RES['marfan'] = ('Marfan/EHAT — Aortopatía hereditaria', [
 ('Qué es', 'grupo heterogéneo cuyo denominador común es el aneurisma o la disección de la aorta torácica', E, 43, '605', 'texto'),
 ('Pronóstico', 'lo marca la dilatación progresiva de la aorta; sin tratar, la edad media de muerte es menor de 40 años, y bien manejado se acerca a la general', E, 44, '606', 'imagen'),
 ('Disección tipo A', 'la determina el diámetro de la raíz aórtica, con riesgo de rotura aumentado desde 50 mm', E, 44, '606', 'imagen'),
 ('Qué más pesa', 'disección familiar con diámetro bajo, crecimiento de la raíz, embarazo e hipertensión', E, 44, '606', 'imagen'),
 ('Qué medir', 'anillo, senos, unión sinotubular, aorta ascendente distal, cayado y descendente, de borde anterior a borde anterior y corregidos por edad, sexo y tamaño', E, 44, '606', 'texto'),
 ('Qué más mirar', 'prolapso mitral, bicúspide, ductus persistente y el VI', E, 44, '606', 'texto'),
 ('Genética', 'la mutación se halla más en lo sindrómico (más del 90 %) que en lo no sindrómico (20 a 30 %)', E, 44, '606', 'imagen'),
])

ORDEN = ['cia', 'civ', 'dap', 'vab', 'coa', 'tdf', 'ebs', 'dsav', 'esub', 'easv',
         'tga', 'cvpa', 'fontan', 'eisen', 'marfan']

TECHO_CHARS = 849
TECHO_VIN = 7
ESC = lambda s: html.escape(s, quote=False)
TIT = 'font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px;'
CUE = 'font-size:12px;color:var(--text);line-height:1.8;margin-bottom:10px;'


def norma(s):
    return re.sub(r'\s+', ' ', s).strip()


def html_de(k):
    tit, vs = RES[k]
    o = ['      <div style="' + TIT + '">' + ESC(tit) + '</div>',
         '      <div style="' + CUE + '">']
    for i, (rot, txt, _f, _h, _fo, _m) in enumerate(vs):
        o.append('        &bull; <b>' + ESC(rot) + ':</b> ' + ESC(txt) + ('<br>' if i < len(vs) - 1 else ''))
    o.append('      </div>')
    return '\n'.join(o)


def medida(k):
    tit, vs = RES[k]
    cuerpo = ' '.join('• ' + rot + ': ' + txt for rot, txt, _f, _h, _fo, _m in vs)
    return len(norma(tit)) + len(norma(cuerpo)), len(vs)


def main():
    a = sys.argv[1:]
    if '--json' in a:
        print(json.dumps({k: {'titulo': RES[k][0],
                              'vinietas': [{'rotulo': r, 'texto': t, 'fuente': f, 'hoja': h, 'folio': fo, 'modo': m}
                                           for r, t, f, h, fo, m in RES[k][1]],
                              'chars': medida(k)[0], 'n': medida(k)[1]} for k in ORDEN},
                         ensure_ascii=False)); return
    if '--control' in a:
        print('# CONTROL_CONGENITAS_P36 — cada vinieta con su fuente, su hoja y su folio')
        print()
        print('Documento de control de la **parte B de PANT-36**. **No es texto de la app**: aca si se')
        print('nombran las guias y los folios. Las dos reglas de folio, comprobadas en ocho y cinco hojas')
        print('en `docs/INVENTARIO_P36.md`:')
        print()
        print('| guia | archivo | hojas | folio |')
        print('|---|---|---|---|')
        print('| ACC/AHA 2025 de congenitas del adulto | `08_Cardiopatias_congenitas/gurvitz-et-al-2025-…-congenital-heart-disease-a.pdf` | 137 | **e** + hoja + **114** |')
        print('| ESC 2020 de congenitas del adulto, en ingles | `08_Cardiopatias_congenitas/ESC congenitos en ingles 2020.pdf` | 84 | hoja + **562** |')
        print()
        print('«imagen» = el dato se leyo renderizando la hoja a **200 ppp** y mirandola, que es lo que la')
        print('orden exige para numeros y rangos: el texto extraido de estas guias pierde guiones y rangos.')
        for k in ORDEN:
            c, n = medida(k)
            print()
            print('## %s' % RES[k][0])
            print()
            print('%d caracteres (techo 849) · %d vinietas (techo 7)' % (c, n))
            print()
            print('| vinieta | texto | fuente | hoja | folio | leido |')
            print('|---|---|---|---|---|---|')
            for r, t, f, h, fo, m in RES[k][1]:
                print('| %s | %s | %s | %d | %s | %s |' % (r, t.replace('|', '/'), f, h, fo, m))
        return
    if '--medir' in a:
        for k in ORDEN:
            c, n = medida(k)
            print('%-7s %4d chars (techo %d) %d vinietas (techo %d) %s'
                  % (k, c, TECHO_CHARS, n, TECHO_VIN, 'OK' if c <= TECHO_CHARS and n <= TECHO_VIN else '*** PASA EL TECHO ***'))
        return
    claves = [x for x in a if not x.startswith('--')] or ORDEN
    bloque = '\n'.join(html_de(k) for k in claves)
    if '--html' in a:
        print(bloque); return
    if '--insertar' in a:
        p = 'index.html'
        s = open(p, encoding='utf-8').read()
        MARCA = '      <!-- ══ RESUMENES POR PATOLOGIA — PANT-36, parte B ═══'
        if MARCA in s:
            i = s.index(MARCA)
            j = s.index('\n    </div>', i)
            s = s[:i] + MARCA_CABEZA + '\n' + bloque + s[j:]
        else:
            k = s.find('<div id="ref-congenitas"')
            j = s.index('\n    </div>', k)
            s = s[:j] + '\n' + MARCA_CABEZA + '\n' + bloque + s[j:]
        open(p, 'w', encoding='utf-8').write(s)
        print('insertados: ' + ' '.join(claves)); return
    sys.exit(__doc__)


MARCA_CABEZA = '''      <!-- ══ RESUMENES POR PATOLOGIA — PANT-36, parte B ═══════════════════════════════
           Un resumen por cada seccion de congenitas de la app (`_CC_SECS`), con el MOLDE MEDIDO
           de `ref-miocard`: titulo de 12 px en 700 y accent2, cuerpo de 12 px con interlineado
           1,8 y vinietas «• <b>Rotulo:</b> texto», SIN linea de fuente -- que es el estilo
           medido del sector, declarado en `P29-a · 2`.
           ⚠️ TECHO: 849 caracteres y 7 vinietas, el del resumen mas largo de `ref-miocard` (la
              amiloidosis). Lo fija TC-778 (B2), (C4) y (C5) para ese sector y la sonda de esta
              tanda para este.
           ⚠️ LOS CUATRO RENGLONES QUE ESTA FICHA YA TENIA NO SE TOCAN: quedan arriba, identicos
              carácter por carácter, igual que los cinco resumenes que `ref-miocard` ya tenia
              cuando PANT-29 le agrego dos.
           ⚠️ NINGUN TEXTO NOMBRA UNA GUIA, UNA CLASE, UN FOLIO NI UNA FUENTE, ni compara dos
              fuentes, ni dice que algo no figura. La trazabilidad de cada viñeta -- con su hoja,
              su folio y si se leyo en imagen -- vive en `docs/CONTROL_CONGENITAS_P36.md`.
           ⚠️ EL TEXTO SE GENERA DESDE `scripts/_gen_p36resumenes.py` y no se retipea.
           ⚠️ NADA DE ESTO LLEGA AL PAPEL: es una entrada de Referencias. -->'''

main()
