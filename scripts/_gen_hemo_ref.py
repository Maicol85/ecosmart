#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_gen_hemo_ref.py — emite la ficha de consulta de Hemodinamica (TAREA 2, 18/11/2026).

POR QUE EXISTE. El contenido sale del Word de estudio que armo Cowork
(~/Desktop/EcoSmart_Estudio_Hemodinamica/Estudio_Hemodinamica_EcoSmart.docx, SOLO LECTURA) y
esta REDACTADO DE NUEVO, no copiado de las guias. Vivir en un generador quiere decir que la
especificacion de cada bloque y la fuente de cada afirmacion estan UNA sola vez: de aca salen
el marcado que entra a index.html Y el documento de control, asi que no pueden divergir. Es el
patron que PANT-36 dejo escrito con _gen_p36tablas.py.

REGLAS QUE ESTE ARCHIVO RESPETA, y por que no son de estilo:
  · NINGUN texto dice que dos fuentes no coinciden, ni compara una contra otra, ni escribe que
    algo «no se encontro». Es la regla fija del 2026-11-04. Lo que queda afuera por estar en
    disputa NO se menciona: se declara en el reporte de la tanda, no en la aplicacion.
  · NINGUN texto dice que algo esta «pendiente de revision», «a confirmar» o «sin validar»
    (regla fija del 2026-11-02). Todo lo que el Word marca asi quedo AFUERA.
  · CERO dosis de farmacos.
  · Cada bloque lleva su linea de fuente al pie, en 10 px, con autor, anio y folio.

Uso:
    python3 scripts/_gen_hemo_ref.py --markup   # el marcado de la ficha
    python3 scripts/_gen_hemo_ref.py --control  # el documento de control
"""
import sys

# ── Las piezas de marcado, una sola vez ──────────────────────────────────────────────────────
def tit(t):
    return ('      <div style="font-size:11.5px;font-weight:700;color:var(--accent2);'
            'margin:2px 0 6px;">%s</div>\n' % t)

def vin(items):
    out = ('      <div style="font-size:12px;color:var(--text);line-height:1.8;'
           'margin-bottom:4px;">\n')
    out += '<br>\n'.join('        • <b>%s</b> %s' % (r, t) for r, t in items) + '\n'
    out += '      </div>\n'
    return out

def tabla(cab, filas, minw=0):
    """Una tabla con su cabecera. `minw` > 0 la envuelve en un scroller propio: es el patron
       MEDIDO de ref-asoc y ref-tumores, que a 390 px desplaza DENTRO del envoltorio y deja el
       documento en cero."""
    ab = ('      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><table '
          'style="width:100%%;min-width:%dpx;border-collapse:collapse;font-size:12px;">\n' % minw) if minw \
        else '      <table style="width:100%;border-collapse:collapse;font-size:12px;">\n'
    ce = '      </table></div>\n' if minw else '      </table>\n'
    out = ab
    out += '        <tr style="background:var(--section-head);">' + ''.join(
        '<th style="padding:6px 8px;text-align:left;color:var(--accent2);">%s</th>' % c for c in cab) + '</tr>\n'
    for i, f in enumerate(filas):
        gris = ';background:var(--bg3)' if i % 2 else ''
        borde = 'border-bottom:1px solid var(--border)' + gris if i < len(filas) - 1 else gris.lstrip(';')
        out += '        <tr style="%s">' % borde
        out += '<td style="padding:5px 8px;font-weight:700;">%s</td>' % f[0]
        out += ''.join('<td style="padding:5px 8px;">%s</td>' % c for c in f[1:])
        out += '</tr>\n'
    out += ce
    return out

def pie(t):
    return ('      <div style="font-size:10px;color:var(--text2);margin:4px 0 14px;">'
            'Fuente: %s</div>\n' % t)

# ── EL CONTENIDO. Cada bloque es (titulo, [piezas], fuente_del_pie, [trazabilidad]) ──────────
BLOQUES = []

BLOQUES.append((
  'Determinantes del gasto cardíaco',
  [vin([
    ('Contractilidad:', 'propiedad del músculo cardíaco que no depende de las condiciones de carga.'),
    ('Precarga:', 'carga que soporta la fibra al final de la diástole; se estima por la presión o el volumen telediastólicos.'),
    ('Poscarga:', 'carga que enfrenta la fibra durante la eyección; su índice más simple es la presión aórtica.'),
    ('Ley de Starling:', 'relación entre el llenado diastólico y el trabajo de eyección.'),
  ])],
  'Braunwald 10.ª ed., cap. 21, folio 447.',
  ['contractilidad independiente de la carga (f. 447)', 'precarga PTD/VTD (f. 447)',
   'poscarga: presion aortica como indice mas simple (f. 447)', 'ley de Starling (f. 447)']))

BLOQUES.append((
  'Orden de abordaje del gasto bajo',
  [tabla(['Paso', 'Determinante', 'Qué se hace'], [
    ['1', 'Causas inmediatas', 'Descartar taponamiento pericárdico y shock hemorrágico.'],
    ['2', 'Ritmo y frecuencia', 'Corregir las alteraciones del ritmo y de la frecuencia.'],
    ['3', 'Precarga', 'Valorarla y dar volumen o diuréticos según el caso.'],
    ['4', 'Poscarga', 'Estimarla e iniciar vasopresores o vasodilatadores.'],
    ['5', 'Contractilidad', 'Evaluarla; inotrópicos y, si hace falta, soporte circulatorio mecánico.'],
  ]),
   vin([('En el ventrículo derecho', 'rigen los mismos determinantes, con dos particularidades: '
         'el tabique interventricular pesa sobre su contractilidad y la hipertensión pulmonar sobre su poscarga.')])],
  'Llanos 2020, hoja 6 del PDF (la guía no trae folio impreso).',
  ['los cinco pasos en su orden (hoja 6)', 'particularidades del VD: tabique y poscarga pulmonar (hoja 6)']))

BLOQUES.append((
  'Gasto cardíaco: cómo se mide',
  [tabla(['Método', 'Qué aporta y dónde rinde'], [
    ['Fick', 'GC = VO₂ / (diferencia arteriovenosa de O₂ × 1,36 × Hb × 10). Rinde mejor con gasto bajo y con insuficiencia tricuspídea. El VO₂ «asumido» se toma como 125 ml/m².'],
    ['Termodilución', 'Tiende a sobrestimar el gasto cuando es menor de 2,5 l/min, y tiene error con insuficiencia tricuspídea grave.'],
    ['Termodilución transpulmonar', 'Aporta volumen telediastólico global, índice de función cardíaca y agua pulmonar extravascular.'],
  ], minw=560)],
  'Fick y termodilución: Braunwald 10.ª ed., folios 377 y 378 (leídos en imagen). '
  'Termodilución transpulmonar: Cecconi 2014, folios 1808–1809.',
  ['formula de Fick (Braunwald f. 378)', 'VO2 asumido 125 ml/m2 (f. 378)',
   'termodilucion sobrestima con GC < 2,5 l/min y error en IT grave (f. 377)',
   'TPTD aporta GEDV, CFI y EVLW (Cecconi f. 1808-1809)']))

BLOQUES.append((
  'Resistencias: fórmulas',
  [tabla(['Variable', 'Fórmula'], [
    ['RVS', '80 × (presión aórtica media − presión media de aurícula derecha) / gasto sistémico'],
    ['RVP', '80 × (presión media de arteria pulmonar − presión media de aurícula izquierda) / gasto pulmonar'],
    ['Resistencia pulmonar total', '80 × presión media de arteria pulmonar / gasto pulmonar'],
    ['Índice de RVS', '(aórtica − aurícula derecha) × 80 / índice cardíaco'],
    ['RVP en unidades Wood', '(presión media de arteria pulmonar − enclavada) / gasto cardíaco'],
    ['Resistencia pulmonar total en unidades Wood', 'presión media de arteria pulmonar / gasto cardíaco'],
    ['Distensibilidad arterial pulmonar', 'volumen latido / (presión pulmonar sistólica − diastólica)'],
  ], minw=560),
   vin([('La constante 80', 'convierte unidades Wood (mmHg/l/min) en dyn·s·cm⁻⁵.')])],
  'RVS, RVP, resistencia pulmonar total y la constante 80: Braunwald 10.ª ed., folios 378–379 '
  '(leídos en imagen). Índice de RVS: Grossman &amp; Baim 8.ª ed., Ec. 11.16, folio 260. '
  'Unidades Wood y distensibilidad: Humbert 2022, Tabla 11, folio 30.',
  ['RVS/RVP/RPT (Braunwald f. 378-379)', 'indice de RVS Ec. 11.16 (Grossman f. 260)',
   'RVP y RPT en Wood y distensibilidad (Humbert Tabla 11, f. 30)',
   'la constante 80 convierte Wood en dyn.s.cm-5 (Braunwald f. 378)']))

BLOQUES.append((
  'Valores de referencia',
  [tabla(['Variable', 'Valor'], [
    ['Presión de aurícula derecha', '2 a 6 mmHg'],
    ['Presión pulmonar media', '8 a 20 mmHg'],
    ['Presión pulmonar sistólica / diastólica', '15 a 30 / 4 a 12 mmHg'],
    ['Enclavada media', '15 mmHg o menos'],
    ['Índice cardíaco', '2,5 a 4,0 l/min/m²'],
    ['Gasto cardíaco', '4 a 8 l/min'],
    ['Volumen latido', '60 a 100 ml (indexado 33 a 47 ml/m²)'],
    ['Saturación venosa mixta', '65 a 80 %'],
    ['RVP', '0,3 a 2,0 unidades Wood'],
    ['Resistencia pulmonar total', 'menos de 3 unidades Wood'],
  ], minw=0),
   vin([('Presión venosa central:', 'normal de 2 a 8 mmHg. Un valor cercano a 10 o 12 sugiere falla '
         'aislada del ventrículo derecho o biventricular, y conviene evitar 15 o más. La presión venosa '
         'central equivale aproximadamente a la mitad de la enclavada.'),
        ('Lo que no debe guiar la reanimación:', 'la presión venosa central, la enclavada o el volumen '
         'telediastólico global tomados por separado, ni una presión de llenado absoluta como objetivo.')])],
  'Valores normales: Humbert 2022, Tabla 11, folio 30 (edición de la SEC en español). '
  'Presión venosa central: SAC 2024, §4.2, folios 20–21. '
  'Lo que no debe guiar la reanimación: Cecconi 2014, folios 1802 y 1806.',
  ['tabla de normales de Humbert (Tabla 11, f. 30)',
   'PVC 2-8, 10-12 sugiere falla del VD, evitar >=15, PVC ~50 % de la enclavada (SAC f. 20-21)',
   'no guiar fluidos con PVC/enclavada/GEDV aislados (Cecconi f. 1802/1806)']))

BLOQUES.append((
  'Cortes de RVS que aparecen con su contexto',
  [tabla(['Corte', 'Contexto'], [
    ['Menos de 1.200 dyn·s·cm⁻⁵', 'Objetivo de la terapia dirigida de Stevenson, junto a enclavada menor de 15, aurícula derecha menor de 8, índice cardíaco mayor de 2,2 y presión sistólica mayor de 80.'],
    ['Más de 1.400', 'En la miocardiopatía hipertrófica obstructiva.'],
    ['Más de 1.500', 'Columna de RVS en la tabla de fenotipos del shock cardiogénico.'],
  ], minw=560)],
  'SAC 2024, folio 22 (Stevenson), folio 73 (miocardiopatía hipertrófica obstructiva) y Tabla 2, folio 3 (fenotipos).',
  ['<1.200 objetivo de Stevenson (SAC f. 22)', '>1.400 en MCH obstructiva (SAC f. 73)',
   '>1.500 en la columna de fenotipos (SAC Tabla 2, f. 3)']))

BLOQUES.append((
  'Los cuatro patrones de shock',
  [vin([('Definición:', 'forma generalizada y potencialmente letal de falla circulatoria aguda '
         'asociada a utilización inadecuada de oxígeno. La hipotensión —sistólica menor de 90, media '
         'menor de 65 o caída de 40 mmHg o más— no es necesaria para definirlo, y el lactato suele '
         'estar por encima de 2 mmol/l. Los cuatro patrones son hipovolémico, cardiogénico, '
         'obstructivo y distributivo.')]),
   tabla(['Patrón', 'PVC', 'Enclavada', 'Gasto', 'RVS', 'SvO₂'], [
    ['Hipovolémico', '↓↓', '↓↓', '↓↓', '↑', '↓'],
    ['Cardiogénico por infarto del ventrículo izquierdo', 'normal o ↑', '↑', '↓↓', '↑', '↓'],
    ['Cardiogénico por infarto del ventrículo derecho', '↑↑', 'normal o ↑', '↓↓', '↑', '↓'],
    ['Obstructivo por taponamiento', '↑↑', '↑↑', '↓ o ↓↓', '↑', '↓'],
    ['Obstructivo por embolia pulmonar masiva', '↑↑', 'normal o ↓', '↓↓', '↑', '↓'],
    ['Distributivo temprano', 'normal o ↑', 'normal', '↓, normal o ↑', '↑, normal o ↓', 'normal o ↓'],
    ['Distributivo temprano tras fluidos', 'normal o ↑', 'normal o ↑', '↑', '↓', '↑, normal o ↓'],
    ['Distributivo tardío', 'normal', 'normal', '↓', '↑', '↑ o ↓'],
   ], minw=620),
   vin([('En el obstructivo', 'suben la presión venosa central y la RVS y bajan el gasto y la '
         'saturación venosa; el taponamiento iguala las presiones; en la embolia masiva la enclavada '
         'queda normal o baja; en el distributivo la RVS baja con hipovolemia relativa.')])],
  'Definición, los cuatro patrones y el lactato: Cecconi 2014, folios 1796 y 1800. '
  'Tabla de patrones: Civetta 2017, cap. 44, Tabla 44.2, hoja 1341 del PDF (la fuente no trae folio impreso); '
  'flechas leídas en la imagen del libro escaneado.',
  ['definicion de shock y los cuatro patrones (Cecconi f. 1796)',
   'hipotension no necesaria y lactato > 2 mmol/l (Cecconi f. 1796 y 1800)',
   'las ocho filas de flechas (Civetta Tabla 44.2, hoja 1341)',
   'resumen del texto del capitulo (Civetta hoja 1341)']))

BLOQUES.append((
  'Forrester: enclavada e índice cardíaco',
  [tabla(['Subgrupo', 'Enclavada (mmHg)', 'Índice cardíaco (l/min/m²)'], [
    ['I', 'menos de 18', 'más de 2,2'],
    ['II', 'más de 18', 'más de 2,2'],
    ['III', 'menos de 18', 'menos de 2,2'],
    ['IV', 'más de 18', 'menos de 2,2'],
  ]),
   vin([('Los subgrupos van en números romanos', 'en esa tabla; las etiquetas A, B, L y C no figuran en ella.')])],
  'Braunwald 10.ª ed., Tabla 52-9, folio 1120.',
  ['las cuatro filas de Forrester (Braunwald Tabla 52-9, f. 1120)',
   'los romanos y la ausencia de A/B/L/C (f. 1120)']))

BLOQUES.append((
  'Fenotipos hemodinámicos del shock cardiogénico',
  [tabla(['Variable', 'Ventrículo izquierdo dominante', 'Ventrículo derecho dominante', 'Biventricular'], [
    ['Presión sistólica (mmHg)', 'menos de 90', 'menos de 90', 'menos de 90'],
    ['Presión venosa central (mmHg)', 'menos de 14', 'más de 14', 'más de 14'],
    ['Enclavada (mmHg)', 'más de 18', 'menos de 18', 'variable'],
    ['Venosa central / enclavada', 'menos de 0,86', 'más de 0,86', 'más de 0,86'],
    ['Índice de pulsatilidad pulmonar', 'más de 1,5', 'menos de 1,5', 'menos de 1,5'],
    ['Índice cardíaco (l/min/m²)', 'menos de 2,2', 'menos de 2,2', 'menos de 2,2'],
    ['RVS (dyn·s·cm⁻⁵)', 'más de 1.500', 'más de 1.500', 'más de 1.500'],
  ], minw=620)],
  'SAC 2024, Tabla 2, folio 3 (adaptada de van Diepen, <i>Circulation</i> 2017;136:e232).',
  ['las siete filas de la tabla de fenotipos (SAC Tabla 2, f. 3)']))

BLOQUES.append((
  'Respuesta a fluidos y objetivos de perfusión',
  [vin([
    ('Variables dinámicas antes que estáticas', 'para predecir la respuesta a fluidos (nivel 1, B); '
     'la prueba de fluidos está recomendada (nivel 1, C).'),
    ('La variación de presión de pulso y la de volumen sistólico', 'sirven solo con ventilación '
     'mecánica totalmente controlada.'),
    ('Cómo se hace la prueba:', 'bolo de 500 ml en menos de 30 minutos, o elevación pasiva de piernas '
     'a 45° durante 4 minutos. La respuesta es positiva con un aumento del gasto cardíaco de 10 a 15 % o más.'),
    ('Una caída de la presión auricular derecha', 'de 1 mmHg o más en inspiración espontánea predice respuesta.'),
    ('Presión arterial media:', 'el objetivo se individualiza, con 65 mmHg o más como punto de partida; '
     'se tolera menos en la hemorragia no controlada sin traumatismo craneal grave y se admite más en el '
     'septicémico hipertenso.'),
    ('Marcadores de hipoperfusión:', 'lactato seriado, saturación venosa central y brecha venoarterial '
     'de pCO₂ mayor de 6 mmHg.'),
    ('La ecocardiografía', 'es la modalidad inicial preferida; en el paciente complejo se agregan el '
     'catéter de arteria pulmonar o la termodilución transpulmonar.'),
  ])],
  'Cecconi 2014: recomendaciones, folios 1802 y 1806; prueba de respuesta, folios 1805–1806; '
  'presión arterial media, Tabla 5, folio 1802; marcadores y ecocardiografía, folio 1801.',
  ['variables dinamicas nivel 1 B y prueba de fluidos nivel 1 C (f. 1802/1806)',
   'VPP y VVS exigen ventilacion controlada (f. 1805-1806)',
   'bolo de 500 ml, elevacion pasiva 45 grados 4 min, respuesta >= 10-15 % (f. 1805-1806)',
   'caida de la presion auricular derecha >= 1 mmHg (f. 1805-1806)',
   'PAM >= 65 individualizada (Tabla 5, f. 1802)',
   'lactato seriado, ScvO2 y brecha de pCO2 > 6 mmHg (f. 1801)',
   'eco como modalidad inicial preferida (f. 1801)']))

BLOQUES.append((
  'Ecocardiografía en la valoración de volumen y del ventrículo derecho',
  [tabla(['Parámetro', 'Interpretación'], [
    ['E/E′ menor de 8', 'Presiones de llenado bajas.'],
    ['E/E′ de 8 a 15', 'No fiable para estimar la presión.'],
    ['E/E′ mayor de 15', 'Presiones de llenado altas.'],
    ['Cociente de áreas telediastólicas VD/VI de 0,6 a 1', 'Dilatación moderada del ventrículo derecho.'],
    ['VD/VI mayor de 1', 'Dilatación grave del ventrículo derecho.'],
  ], minw=0)],
  'Cecconi 2014, folios 1806–1807.',
  ['las cinco filas de eco para volemia y VD (Cecconi f. 1806-1807)']))

BLOQUES.append((
  'Monitoreo y soporte: qué aporta cada uno',
  [tabla(['Herramienta', 'Qué aporta y para qué se usa'], [
    ['Catéter de arteria pulmonar (Swan-Ganz)', 'Define el perfil hemodinámico, sirve para ajustar el tratamiento y para guiar el destete de vasoactivos. Braunwald lo indica en la hipotensión que no corrige con volumen, en la hipotensión con insuficiencia cardíaca, en el compromiso hemodinámico grave, en las lesiones mecánicas y en el infarto del ventrículo derecho.'],
    ['Termodilución transpulmonar (PiCCO)', 'Aporta el volumen telediastólico global, el índice de función cardíaca y el agua pulmonar extravascular.'],
    ['Balón de contrapulsación intraaórtico', 'Clase I, nivel C, para separar de la circulación extracorpórea cuando resulta difícil; clase IIa en otras indicaciones.'],
    ['Asistencia percutánea del ventrículo izquierdo', 'Braunwald menciona dispositivos de hasta 5 l/min.'],
    ['ECMO venoarterial', 'Se considera dentro de las 6 horas del shock cardiogénico refractario; sus contraindicaciones están listadas en el texto de la guía.'],
  ], minw=560)],
  'Usos del catéter: SAC 2024, §4.4, folios 21–22. Indicaciones de Braunwald: Tabla 52-8, folio 1119. '
  'Termodilución transpulmonar: Cecconi 2014, folios 1808–1809. Balón de contrapulsación: SAC 2024, '
  '§5.3, folios 34–35. Asistencia percutánea: Braunwald 10.ª ed., folio 1123. '
  'ECMO venoarterial: Lorusso 2021 (guía ELSO), folio 828.',
  ['usos del Swan-Ganz: perfil, ajuste y destete (SAC f. 21-22)',
   'indicaciones de Braunwald Tabla 52-8 (f. 1119)',
   'TPTD aporta GEDV, CFI y EVLW (Cecconi f. 1808-1809)',
   'BCIA clase I-C para separar de CEC y IIa en otras (SAC f. 34-35)',
   'asistencia percutanea del VI hasta 5 l/min (Braunwald f. 1123)',
   'VA-ECMO dentro de las 6 h del shock refractario (Lorusso f. 828)']))

BLOQUES.append((
  'ECMO venoarterial: puntos de la guía',
  [tabla(['Tema', 'Qué dice la guía'], [
    ['Meta de oxigenación', 'Relación entre transporte y consumo de oxígeno mayor de 3, con saturación venosa mixta por encima de 66 %.'],
    ['Pronóstico (puntaje SAVE)', 'Clases I a V, con supervivencia de 75, 58, 42, 30 y 18 %.'],
    ['Descarga del ventrículo izquierdo', 'Disparadores: edema pulmonar, presión de pulso menor de 5 a 10 mmHg, contraste espontáneo y válvula aórtica cerrada con distensión del ventrículo.'],
    ['Monitoreo', 'Oximetría en la radial derecha, considerar el catéter de arteria pulmonar y ecocardiografía.'],
    ['Ventilación', 'Volumen corriente de 6 a 8 ml/kg de peso ideal.'],
    ['Reducción de flujo', 'Bajarlo de a 500 ml cada 5 a 10 minutos.'],
    ['Destete', 'Presión arterial media mayor de 60, onda S′ lateral de 6 cm/s o más, presión venosa central de 10 o menos y fracción de eyección de 25 a 30 % o más.'],
    ['Registro', 'La tabla del registro reúne 14.580 corridas con una supervivencia del 44 %.'],
  ], minw=560)],
  'Lorusso 2021 (guía ELSO de ECMO venoarterial): meta de oxigenación, folio 827; puntaje SAVE, '
  'Tabla 2, folio 830; descarga del ventrículo, folios 830 y 835; monitoreo, folios 834–835; '
  'ventilación, Tabla 9, folio 841; reducción de flujo, folio 841; destete y registro, folios 841–842.',
  ['DO2:VO2 > 3 con SvO2 > 66 % (f. 827)', 'SAVE clases I a V 75/58/42/30/18 % (Tabla 2, f. 830)',
   'disparadores de la descarga del VI (f. 830 y 835)', 'monitoreo (f. 834-835)',
   'volumen corriente 6-8 ml/kg (Tabla 9, f. 841)', 'bajar el flujo de a 500 ml cada 5-10 min (f. 841)',
   'destete: PAM > 60, S lateral >= 6 cm/s, PVC <= 10, FEVI >= 25-30 % (f. 842)',
   'registro de 14.580 corridas con 44 % de supervivencia (f. 841-842)']))

BLOQUES.append((
  'Hipertensión pulmonar: definiciones hemodinámicas',
  [tabla(['Categoría', 'Pulmonar media', 'Enclavada', 'RVP'], [
    ['Hipertensión pulmonar', 'más de 20 mmHg', '—', '—'],
    ['Precapilar', 'más de 20', '15 mmHg o menos', 'más de 2 unidades Wood'],
    ['Poscapilar aislada', 'más de 20', 'más de 15 mmHg', '2 unidades Wood o menos'],
    ['Poscapilar y precapilar combinada', 'más de 20', 'más de 15 mmHg', 'más de 2 unidades Wood'],
  ], minw=560)],
  'Humbert 2022, Tabla 5, folio 21 (edición de la SEC en español).',
  ['las cuatro categorias hemodinamicas (Humbert Tabla 5, f. 21)']))

BLOQUES.append((
  'Hipertensión pulmonar: signos ecocardiográficos y estratificación de riesgo',
  [vin([('Signos de apoyo:', 'cociente VD/VI mayor de 1, índice de excentricidad del ventrículo '
         'izquierdo mayor de 1,1 y área de aurícula derecha mayor de 18 cm². La probabilidad se estima '
         'a partir de la velocidad de regurgitación tricuspídea junto con estos signos.')]),
   tabla(['Variable', 'Riesgo bajo', 'Riesgo intermedio', 'Riesgo alto'], [
    ['Área de aurícula derecha (cm²)', 'menos de 18', '18 a 26', 'más de 26'],
    ['Presión de aurícula derecha (mmHg)', 'menos de 8', '8 a 14', 'más de 14'],
    ['Índice cardíaco (l/min/m²)', '2,5 o más', '2,0 a 2,4', 'menos de 2,0'],
    ['Índice de volumen sistólico (ml/m²)', 'más de 38', '31 a 38', 'menos de 31'],
    ['Saturación venosa mixta (%)', 'más de 65', '60 a 65', 'menos de 60'],
   ], minw=560)],
  'Signos de apoyo: Humbert 2022, Tabla 10, folio 28; la probabilidad, Figura 5, folio 28. '
  'Estratificación: Humbert 2022, Tabla 16, folio 41.',
  ['VD/VI > 1, indice de excentricidad > 1,1, area de AD > 18 cm2 (Humbert Tabla 10, f. 28)',
   'la probabilidad sale de la VRT y los signos (Figura 5, f. 28)',
   'cinco filas de la estratificacion de riesgo (Tabla 16, f. 41)']))

BLOQUES.append((
  'Falla del ventrículo derecho en el shock',
  [vin([
    ('Diagnóstico hemodinámico:', 'índice cardíaco menor de 2,2, presión venosa central mayor de '
     '15 mmHg y cociente entre venosa central y enclavada mayor de 1.'),
    ('Objetivo de presión:', 'presión auricular derecha de 8 a 12 mmHg.'),
    ('Fenotipo en el shock cardiogénico:', 'presión venosa central mayor de 14, enclavada menor de 18, '
     'cociente mayor de 0,86 e índice de pulsatilidad pulmonar menor de 1,5.'),
    ('El catéter de arteria pulmonar', 'en el shock refractario con disfunción del ventrículo derecho es una '
     'sugerencia de nivel 2, calidad C.'),
  ])],
  'Diagnóstico, objetivo y fenotipo: SAC 2024, §6.5, folios 59–61, y Tabla 2, folio 3. '
  'Catéter en el shock refractario: Cecconi 2014, folio 1809.',
  ['IC < 2,2, PVC > 15 y PVC/enclavada > 1 (SAC f. 59-61)',
   'presion auricular derecha objetivo 8-12 mmHg (SAC f. 59-61)',
   'fenotipo VD dominante (SAC Tabla 2, f. 3)',
   'CAP en shock refractario con disfuncion del VD, nivel 2 C (Cecconi f. 1809)']))

BLOQUES.append((
  'Taponamiento: clínica y tratamiento',
  [vin([
    ('Qué es:', 'un síndrome pericárdico en el que el derrame altera el llenado cardíaco hasta reducir el gasto.'),
    ('Cuánto líquido hace falta:', 'con acumulación rápida —por ejemplo un hemopericardio— el límite se '
     'alcanza con 200 a 300 ml; con acumulación lenta puede llegar a 1 o 2 litros antes del taponamiento.'),
    ('Tríada de Beck:', 'hipotensión, aumento de la presión yugular y ruidos cardíacos atenuados; puede '
     'faltar en el taponamiento de acumulación lenta.'),
    ('Taponamiento agudo:', 'se asocia a taquicardia y presión arterial menor de 90 mmHg.'),
    ('Pulso paradójico:', 'descenso de la presión sistólica de más de 10 mmHg en inspiración, por '
     'interdependencia ventricular exagerada.'),
    ('Electrocardiograma:', 'taquicardia, voltajes bajos y alternancia eléctrica.'),
    ('Tratamiento definitivo:', 'el drenaje, de preferencia la pericardiocentesis con aguja guiada por '
     'ecocardiografía o fluoroscopia, sin demora si hay inestabilidad, con la alternativa quirúrgica. '
     'Sus complicaciones van del 4 al 10 % según la monitorización, el operador y el contexto.'),
    ('Qué evitar:', 'la ventilación con presión positiva y los diuréticos. La administración temporal '
     'de fluidos puede estabilizar mientras se espera el drenaje.'),
    ('Los signos ecocardiográficos', 'con su sensibilidad y su especificidad, los grados del derrame y la '
     'clase de la pericardiocentesis están en la ficha de derrame pericárdico y taponamiento de esta '
     'misma sección.'),
  ])],
  'Schulz-Menger 2025 (guía ESC de miocarditis y pericarditis, edición en español), folio 69.',
  ['definicion del taponamiento (f. 69)', '200-300 ml rapido y 1-2 litros lento (f. 69)',
   'triada de Beck y su ausencia en el lento (f. 69)', 'taquicardia y PAS < 90 en el agudo (f. 69)',
   'pulso paradojico > 10 mmHg (f. 69)', 'ECG: taquicardia, voltajes bajos, alternancia (f. 69)',
   'drenaje y pericardiocentesis guiada, complicaciones 4-10 % (f. 69)',
   'evitar presion positiva y diureticos, fluidos temporales (f. 69)']))

BLOQUES.append((
  'Shock cardiogénico: definición, estadios y objetivos',
  [vin([
    ('Definición de la guía ELSO:', 'presión sistólica menor de 90 mmHg, diuresis menor de 30 ml/h, '
     'lactato mayor de 2 mmol/l, saturación venosa mixta menor de 60 %, alteración de la conciencia, '
     'sostenidos durante 6 horas.'),
    ('Índice cardíaco:', 'menor de 1,8 l/min/m² con soporte y de 2,0 a 2,2 sin soporte.'),
    ('Estadios:', 'el consenso argentino usa los estadios SCAI de la A a la E. El lactato por encima de '
     '2 mmol/l figura en la guía de la ACC.'),
    ('Monitoreo:', 'presión arterial media de 65 mmHg o más, clase I nivel B; presión arterial '
     'invasiva, clase I nivel B.'),
    ('Objetivos de la terapia dirigida de Stevenson:', 'enclavada menor de 15, aurícula derecha menor de 8, '
     'RVS menor de 1.200, índice cardíaco mayor de 2,2 y presión sistólica mayor de 80.'),
  ])],
  'Definición: Lorusso 2021 (guía ELSO), folio 827. Índice cardíaco y estadios: SAC 2024, folio 3. '
  'Lactato: Sinha 2025, folio 1622. Monitoreo: SAC 2024, §4.3, folio 21. '
  'Objetivos de Stevenson: SAC 2024, folio 22.',
  ['definicion de ELSO con sus seis elementos (Lorusso f. 827)',
   'IC < 1,8 con soporte y 2,0-2,2 sin soporte (SAC f. 3)',
   'estadios SCAI A a E (SAC f. 3)', 'lactato > 2 mmol/l (Sinha f. 1622)',
   'PAM >= 65 clase I B y presion invasiva clase I B (SAC f. 21)',
   'objetivos de Stevenson (SAC f. 22)']))

# ── Lo que quedo AFUERA, con su motivo. Vive aca para que el documento de control y el reporte
#    salgan del mismo lugar. NADA de esto se escribe en la aplicacion. ────────────────────────
AFUERA = [
 ('Tabla 19-3 de Braunwald (folio 375): RVS 1.100 (700-1.600), RVP 70 (20-130), RPT 200 (100-300) y la columna de presiones normales',
  'el Word marca el folio como DEDUCIDO (hoja 405 menos 30) y no visto impreso, y la fila esta en su capitulo 14'),
 ('Tabla 11.2 de Grossman & Baim (folio 260): RVS 1.170 +/- 270, indice de RVS 2.130 +/- 450, RVP 67 +/- 30 e indice de RVP 123 +/- 54',
  'marcado «verificar a ojo» por el OCR, y ademas la RVS normal esta en el capitulo 12 de contradicciones'),
 ('Cociente RVP/RVS de Grossman (folio 261): <=0,25 normal, 0,25-0,50 moderada, >0,75 grave',
  'marcado «verificar a ojo» por baja resolucion'),
 ('Tabla 52-10 de Braunwald: las presiones de AD, VD, AP, enclavada e indice cardiaco por cuadro clinico',
  'el Word declara el folio «no comprobado» y la fila esta en su capitulo 14'),
 ('Perfil de presiones del infarto del ventriculo derecho (AD 12-20, enclavada <12, IC <2) y el del taponamiento',
  'los dos salen de la Tabla 52-10, con folio no comprobado'),
 ('Tension parietal (Braunwald, folio 449)',
  'el Word declara que no transcribio su contenido y que el folio no esta comprobado'),
 ('Caudal de cada dispositivo: balon 0,5-1 l/min, Impella 2,5 / CP-3,5 / 5,0, TandemHeart 4-5 y ECMO hasta 7 l/min, con sus calibres',
  'el Word declara que la Tabla 5 del consenso argentino salio desordenada en la extraccion y que el capitulo 27 de Grossman esta con OCR parcial: «verificar a ojo ambas columnas antes de usar las cifras»'),
 ('Los tres cortes de TAPSE/PSAP (0,23 del consenso argentino; <0,55 como signo y 0,19-0,32 por riesgo de Humbert)',
  'el capitulo 12 del Word los pone como usos distintos del mismo cociente y no elige: valor en disputa'),
 ('Indice de RVP «3-3,5 UW.m2» y pendiente PAPm/GC >3 mmHg/l/min (Humbert)',
  'el primero esta marcado «como esta impreso, verificar» y el segundo sin folio anotado'),
 ('El corte de enclavada del shock cardiogenico (>18 en Braunwald y en el texto del consenso argentino; >15 en su tabla) y con el la definicion completa de Braunwald',
  'contradiccion interna declarada en el capitulo 12 del Word'),
 ('Bajo gasto posoperatorio: IC <2,2 con lactato >2 y SvO2 <65 %, frente a IC <2,2 con ScvO2 <60 % y lactato >3',
  'contradiccion entre fuentes (capitulo 12) y, ademas, es materia del posoperatorio'),
 ('Sindrome vasoplejico posoperatorio (RVS <800 con IC >2,2 en las primeras 24 h)',
  'es materia del posoperatorio, que va en la etapa siguiente, y la ficha del posoperatorio ya lo publica'),
 ('Las bandas 800 / 1.200 / 1.400 de RVS como cortes universales',
  'el capitulo 15 del Word las da por sin fuente: solo hay usos con contexto'),
 ('«Enclavada <12 = hipovolemia»', 'el capitulo 15 del Word la da por sin fuente'),
 ('Valores normales de PiCCO (GEDI, ELWI, CFI y variacion de volumen sistolico)',
  'el capitulo 15 del Word los da por no transcritos'),
 ('Formulas de la enclavada por eco (Nagueh), de la pulmonar media (Chemla) y de la RVP por eco (Abbas)',
  'su procedencia en el Word es una fila de trabajo verificada y no una fuente primaria leida para ese documento; y la ficha de formulas de la aplicacion ya las publica'),
 ('La forma de RVS que usa la aplicacion, (PAM - PVC) / GC x 80',
  'el Word la da por sin fuente vista. Queda REPORTADA y no corregida: es contenido clinico y lo decide el medico'),
 ('Terapia dirigida por objetivos en cirugia cardiaca (Goepfert 2013 y Aya 2013)',
  'es materia de la cirugia cardiaca, y sus dos cifras centrales llevan marca de verificar'),
 ('Formula del indice de pulsatilidad pulmonar', 'el Word declara que no la transcribio'),
 ('Tabla de ondas patologicas de Braunwald (Tabla 19-4)', 'el Word declara que no transcribio su contenido'),
 ('Descripcion del taponamiento de Grossman (descenso x conservado, y ausente, igualacion de presiones)',
  'marcada con OCR parcial: «verificar a ojo»'),
 ('Detalle de constriccion frente a restriccion (suplemento de Schulz-Menger y Nagueh p. 562)',
  'el Word declara que no los releyo; y la ficha de constriccion frente a restriccion ya publica sus nueve cortes con su fuente'),
 ('Figura 2 de Sinha con los estadios SCAI', 'el Word declara que es una imagen y no la transcribio'),
 ('El «gasto cardiaco normal 30 dl/m2/min» y el VTI del tracto de salida en el destete de ECMO',
  'los dos marcados «verificar a ojo» en el capitulo 14'),
 ('Dosis de dobutamina 2-5 ug/kg/min y las dosis bajas de vasoactivos que ELSO define para el destete',
  'son dosis de farmacos, que la orden excluye'),
 ('Definicion global del SDRA y la interaccion entre el SDRA y el ventriculo derecho (capitulo 11)',
  'no esta entre los temas que la orden pide, su tabla lleva marca de verificar y el Word declara la interaccion como sin fuente'),
 ('EuroSCORE II, modelos STS y manejo de sangre perioperatorio (capitulos 9 y 10)',
  'son riesgo quirurgico y manejo de sangre, que van en la etapa siguiente'),
 ('Momento de iniciar el soporte mecanico segun la guia del posoperatorio complicado (lactato <4, salida de la circulacion extracorporea)',
  'es materia del posoperatorio, que va en la etapa siguiente'),
]

def markup():
    out = ''
    for t, piezas, fuente, _ in BLOQUES:
        out += tit(t)
        for p in piezas:
            out += p
        out += pie(fuente)
    return out

def control():
    out = '# Control de la ficha de Hemodinamica — TAREA 2 (2026-11-18)\n\n'
    out += ('Generado por `scripts/_gen_hemo_ref.py`. El contenido sale del Word de estudio\n'
            '`~/Desktop/EcoSmart_Estudio_Hemodinamica/Estudio_Hemodinamica_EcoSmart.docx`, que es\n'
            'SOLO LECTURA y no se modifico. Esta REDACTADO DE NUEVO: ninguna tabla ni parrafo de las\n'
            'guias se copia.\n\n')
    out += '## Bloques y trazabilidad\n\n'
    for i, (t, _, fuente, traz) in enumerate(BLOQUES, 1):
        out += '### %d. %s\n\n' % (i, t)
        out += '**Pie de fuente:** %s\n\n' % fuente.replace('<i>', '*').replace('</i>', '*')
        for x in traz:
            out += '- %s\n' % x
        out += '\n'
    out += '## Lo que quedo AFUERA, con su motivo (%d items)\n\n' % len(AFUERA)
    out += ('Nada de esto se escribe en la aplicacion, ni para decir que falta: la regla fija del\n'
            '2026-11-04 prohibe que un texto de la app diga que dos fuentes no coinciden o que algo\n'
            'no se encontro.\n\n')
    for q, m in AFUERA:
        out += '- **%s** — %s.\n' % (q, m)
    return out

if __name__ == '__main__':
    if '--control' in sys.argv:
        sys.stdout.write(control())
    else:
        sys.stdout.write(markup())
