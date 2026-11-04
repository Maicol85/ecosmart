#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant10.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-10 (2026-11-04).
Calcado de _mut_pant9.py. Nombre propio: verificado con ls, no existia.

Cada mutacion revierte UNA de las cosas que los seis commits de codigo cambiaron -o la aplica DE
MAS- y exige que SU caso se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant10.py              # todas
  python3 scripts/_mut_pant10.py --solo 1,2   # algunas

** SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
** EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
** CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una.
** VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS, porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (caso, nombre, viejo, nuevo) - viejo tiene que aparecer EXACTAMENTE una vez.
MUT = [
 ('TC-668', '01 vuelve el kappa de 0,39 al globo del indice de Celermajer',
  "y no figura en la ESC 2020, cuyas indicaciones de cirugía en '",
  "y no figura en la ESC 2020 (concordancia con resonancia κ=0,39), cuyas indicaciones de cirugía en '"),

 ('TC-668', '02 vuelve la frase de que el indice sobreestima la severidad',
  "ojo: 'El índice es orientativo, no una indicación. Se derivó en una serie retrospectiva de '",
  "ojo: 'El índice es orientativo. Por ecocardiografía sobreestima la severidad. Se derivó en una serie retrospectiva de '"),

 ('TC-668', '03 vuelve la mortalidad materna de «>50 %» al globo de la saturacion',
  "publica un riesgo de mortalidad materna de 30 a 50 %, con exacerbación de insuficiencia '",
  "publica un riesgo de Mortalidad materna >50 %, con exacerbación de insuficiencia '"),

 ('TC-668', '04 vuelve la conducta atribuida a la ESC 2020 en la ventana aortopulmonar',
  "lee: 'Comunicación directa entre la aorta ascendente y la arteria pulmonar principal.',",
  "lee: 'Comunicación directa entre la aorta ascendente y la arteria pulmonar principal. ESC 2020: cierre indicado siempre, salvo hipertensión pulmonar irreversible.',"),

 ('TC-668', '05 vuelve el «Menos del 1 % de las cardiopatias congenitas» a Ebstein',
  "lee: 'Desplazamiento apical del velo septal tricuspídeo con atrialización del ventrículo '\n       + 'derecho: el corazón derecho queda formado por",
  "lee: 'Desplazamiento apical del velo septal tricuspídeo con atrialización del ventrículo '\n       + 'derecho. Menos del 1 % de las cardiopatías congénitas: el corazón derecho queda formado por"),

 ('TC-668', '06 vuelve el «Solo en el tipo completo» a la nota del componente ventricular',
  "lee: 'No es exclusivo del tipo completo. En el completo no hay fusión central de los velos '",
  "lee: 'Sólo en el tipo completo. En el completo no hay fusión central de los velos '"),

 ('TC-668', '07 vuelve la afirmacion de que en el adulto solo se ve la CVPA parcial',
  "lee: 'Esta sección corresponde a la forma parcial. El tipo de comunicación interauricular y '",
  "lee: 'En el adulto sólo se ve la forma parcial: la total es una emergencia neonatal. El tipo de comunicación interauricular y '"),

 ('TC-668', '08 vuelve el «El eco subestima el shunt» a la nota del Qp/Qs',
  "lee: 'La resonancia magnética cardíaca es recomendación de la ACC/AHA 2025 para evaluar la '",
  "lee: 'El eco subestima el shunt en esta lesión. La resonancia magnética cardíaca es recomendación de la ACC/AHA 2025 para evaluar la '"),

 ('TC-668', '09 vuelve el «Marcador de mal pronostico» al globo del sincope',
  "tit: 'El sincope en el sindrome de Eisenmenger',\n    lee: 'Se consigna como dato clínico del paciente.',",
  "tit: 'El sincope en el sindrome de Eisenmenger',\n    lee: 'Marcador de mal pronostico.',"),

 ('TC-668', '10 se retira el folio e209 de la cita de la mortalidad materna',
  "2026;153:e115-e251), hoja 95, folio e209. ESC 2025 de embarazo (De Backer y col.), '",
  "2026;153:e115-e251). ESC 2025 de embarazo (De Backer y col.), '"),

 ('TC-668', '11 la serie de Celermajer pasa de 50 neonatos a 28, que es el error que la tanda corrige',
  "un solo centro de 50 neonatos con anomalía de Ebstein vistos entre 1961 y 1990, en la '",
  "un solo centro de 28 neonatos con anomalía de Ebstein vistos entre 1961 y 1990, en la '"),

 ('TC-668', '12 se retira el umbral de desplazamiento de 0,8 cm/m² del globo de Ebstein',
  "diagnóstico de desplazamiento en el adulto es de 0,8 cm/m² de superficie corporal o '\n       + 'más.',",
  "diagnóstico de desplazamiento en el adulto está publicado en la guía.',"),

 ('TC-668', '13 DE MAS: el Down del DSAV vuelve a restringirse «del adulto»',
  "lee: 'Más del 75 % de los defectos del septo auriculoventricular completos se dan en '",
  "lee: 'Más del 75 % de los defectos del septo auriculoventricular completos del adulto se dan en '"),

 ('TC-668', '14 DE MAS: se toca la franja de contraindicaciones de Eisenmenger, que el medico decide',
  'embarazo (mortalidad materna &gt;50&nbsp;%) &middot;',
  'embarazo (mortalidad materna 30 a 50&nbsp;%) &middot;'),

 ('TC-669', '15 el DSAV pierde una pregunta',
  'DSAV_PREG.forEach(function (p) {',
  'DSAV_PREG.slice(1).forEach(function (p) {'),

 ('TC-669', '16 el DSAV deja de repartir las preguntas en dos columnas',
  "    compacta: true,\n    preguntas: true,\n    guia: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta secci\u00f3n salen de DOS gu\u00edas: la ACC/AHA 2025 de cardiopat\u00edas cong\u00e9nitas del adulto (apartado 4.1.3,",
  "    compacta: true,\n    preguntas: false,\n    guia: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta secci\u00f3n salen de DOS gu\u00edas: la ACC/AHA 2025 de cardiopat\u00edas cong\u00e9nitas del adulto (apartado 4.1.3,"),

 ('TC-669', '17 la compuerta del DSAV abre siempre',
  "  const est = _indFn('dsavEstado');\n  const r = est ? est() : null;\n  if (!r || !r.hayDatos) return null;",
  "  const est = _indFn('dsavEstado');\n  const r = est ? est() : null;\n  if (false) return null;"),

 ('TC-669', '18 el DSAV pierde el folio e157 de su bloque de la ACC/AHA',
  'apartado 4.1.3, «Atrioventricular Septal Defect», hojas 42 y 43, folios e156 y e157.',
  'apartado 4.1.3, «Atrioventricular Septal Defect», hojas 42 y 43.'),

 ('TC-669', '19 el DSAV deja de mostrar la diferencia de los dos diametros telesistolicos',
  "{ txt:'Diámetro telesistólico del ventrículo izquierdo en el asintomático con regurgitación severa: 40 mm o más en la ACC/AHA 2025 y 45 mm o más en la ESC 2020.', refs:null },",
  "{ txt:'El diámetro telesistólico del ventrículo izquierdo se mide en el asintomático con regurgitación severa.', refs:null },"),

 ('TC-670', '20 Ebstein pierde una pregunta',
  'EBS_PREG.forEach(function (p) {',
  'EBS_PREG.slice(1).forEach(function (p) {'),

 ('TC-670', '21 la compuerta de Ebstein abre siempre',
  '  const r = ebsC ? ebsC() : null;\n  if (!r) return null;',
  '  const r = ebsC ? ebsC() : null;\n  if (false) return null;'),

 ('TC-670', '22 Ebstein deja de declarar cual es la guia que rige',
  "    guia: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta sección salen de DOS guías: la ACC/AHA 2025 de cardiopatías congénitas del adulto (apartado 4.3.1,",
  "    guia: null, _guiaVieja: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta sección salen de DOS guías: la ACC/AHA 2025 de cardiopatías congénitas del adulto (apartado 4.3.1,"),

 ('TC-670', '23 Ebstein deja de mostrar la diferencia del grado de insuficiencia tricuspidea',
  "{ txt:'Grado de insuficiencia tricuspídea que pide la cirugía: al menos moderada en la ACC/AHA 2025 y severa en la ESC 2020.', refs:null },",
  "{ txt:'Las dos guías piden un grado de insuficiencia tricuspídea para indicar la cirugía.', refs:null },"),

 ('TC-670', '24 Ebstein pierde el folio e176 del texto de apoyo que define la cianosis',
  'hojas 59, 60 y 62, folios e173, e174 y e176.',
  'hojas 59, 60 y 62.'),

 ('TC-671', '25 Fontan pierde una pregunta',
  'FON_PREG.forEach(function (p) {',
  'FON_PREG.slice(1).forEach(function (p) {'),

 ('TC-671', '26 la compuerta de Fontan abre siempre',
  '  const r = fEst ? fEst() : null;\n  if (!r || r.hayDatos === false) return null;',
  '  const r = fEst ? fEst() : null;\n  if (false) return null;'),

 ('TC-671', '27 Fontan deja de declarar que Rychik es una declaracion cientifica y no una guia',
  "{ txt:'No es una guía de práctica: es una declaración científica de la American Heart Association, y se cita como tal.', refs:null },",
  "{ txt:'Lo que sigue sale de Rychik y col.', refs:null },"),

 ('TC-671', '28 Fontan pierde el folio e242 de la tabla de la insuficiencia auriculoventricular',
  'largo plazo después de la cirugía de Fontan (hoja 9, folio e242).',
  'largo plazo después de la cirugía de Fontan.'),

 ('TC-672', '29 la CVPA pierde una pregunta',
  'CVPA_PREG.forEach(function (p) {',
  'CVPA_PREG.slice(1).forEach(function (p) {'),

 ('TC-672', '30 la compuerta de la CVPA abre siempre',
  '  const r = cEst ? cEst() : null;\n  if (!r || r.hayDatos === false) return null;',
  '  const r = cEst ? cEst() : null;\n  if (false) return null;'),

 ('TC-672', '31 la CVPA deja de decir que la ESC 2020 no publica tabla propia',
  "{ txt:'La ESC 2020 NO publica una tabla de recomendaciones propia para esta lesión: sus indicaciones siguen los principios del cierre de la comunicación interauricular, y dice que una sola vena de un solo lóbulo rara vez justifica la cirugía.', refs:null },",
  "{ txt:'La ESC 2020 trata esta lesión dentro del capítulo de la comunicación interauricular.', refs:null },"),

 ('TC-672', '32 la CVPA pierde el folio 575 de la Tabla 4 que contradice el texto viejo',
  'Fuente: ESC 2020 de cardiopatías congénitas del adulto, hojas 13 y 29, folios 575 y 591.',
  'Fuente: ESC 2020 de cardiopatías congénitas del adulto, hojas 13 y 29.'),

 ('TC-673', '33 Eisenmenger pierde una pregunta',
  'EIS_PREG.forEach(function (p) {',
  'EIS_PREG.slice(1).forEach(function (p) {'),

 ('TC-673', '34 la compuerta de Eisenmenger abre siempre',
  '  const r = eEst ? eEst() : null;\n  if (!r || r.hayDatos === false) return null;',
  '  const r = eEst ? eEst() : null;\n  if (false) return null;'),

 ('TC-673', '35 Eisenmenger pierde el corte de TAPSE de 16 mm de la nota al pie de riesgo alto',
  'excursión sistólica del plano del anillo tricuspídeo por debajo de 16 mm y NT-proBNP por encima de 1400 pg/ml.',
  'excursión sistólica del plano del anillo tricuspídeo reducida y NT-proBNP elevado.'),

 ('TC-673', '36 Eisenmenger pierde el folio 66 de la tabla de la ESC/ERS 2022',
  'Fuente: ESC/ERS 2022 de hipertensión pulmonar, versión en español de la Sociedad Española de Cardiología, hoja 67, folio 66.',
  'Fuente: ESC/ERS 2022 de hipertensión pulmonar, versión en español de la Sociedad Española de Cardiología.'),

]

SOLO = None
if '--solo' in sys.argv:
    SOLO = set(int(x) for x in sys.argv[sys.argv.index('--solo') + 1].split(','))

ORIG = IDX + '.mutorig'
shutil.copy2(IDX, ORIG)
MD5_0 = md5(IDX)
print('md5 del arbol antes del barrido:', MD5_0)
muertas, vivas, noaplica = [], [], []
try:
    for i, (caso, nombre, viejo, nuevo) in enumerate(MUT, 1):
        if SOLO and i not in SOLO:
            continue
        with open(ORIG, encoding='utf-8') as f:
            s = f.read()
        n = s.count(viejo)
        if n != 1:
            noaplica.append((i, nombre, 'el ancla aparece %d veces' % n))
            print('  %02d NO APLICA  %s  (ancla x%d)' % (i, nombre, n))
            continue
        with open(IDX, 'w', encoding='utf-8') as f:
            f.write(s.replace(viejo, nuevo, 1))
        r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=RAIZ, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        if 'RESULTADO' not in out:
            noaplica.append((i, nombre, 'NO CORRIO: el suite no publico RESULTADO'))
            print('  %02d NO CORRIO  %s' % (i, nombre))
        elif ' CON FALLAS' in out:
            muertas.append((i, nombre))
            print('  %02d MUERTA    %s  [%s]' % (i, nombre, caso))
        else:
            vivas.append((i, nombre, caso))
            print('  %02d SOBREVIVIO %s  [%s]  <-- COBERTURA QUE FALTA' % (i, nombre, caso))
finally:
    shutil.copy2(ORIG, IDX)
    os.remove(ORIG)

print()
print('md5 del arbol despues del barrido:', md5(IDX))
print('GUARDA DE md5:', 'OK - identico' if md5(IDX) == MD5_0 else 'XX EL ARBOL CAMBIO')
print('RESUMEN: %d muertas / %d sobrevivieron / %d no aplicaron' % (len(muertas), len(vivas), len(noaplica)))
for i, n, c in vivas:
    print('   SOBREVIVIO %02d %s [%s]' % (i, n, c))
for i, n, m2 in noaplica:
    print('   NO APLICO  %02d %s (%s)' % (i, n, m2))
