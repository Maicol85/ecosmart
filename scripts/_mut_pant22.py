#!/usr/bin/env python3
"""_mut_pant22.py - barrido de mutaciones dirigidas de la tanda PANT-22.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso (P14c-i).
Cada mutacion declara SU caso: con los cinco por mutacion, un reparto mal hecho queda tapado
por el caso de otro commit.
Las anclas llevan el CARACTER REAL y no secuencias \\uXXXX, que es por lo que siete de PANT-19
no aplicaron.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ══ COMMIT 2 · EL AYUDANTE ═══════════════════════════════════════════════════
 ('01 el ayudante dice SI siempre: vuelve el defecto que el medico reporto', 'TC-748,TC-749',
  [("function _indSectorIncluido(av){\n  if (av == null) return true;",
    "function _indSectorIncluido(av){\n  if (true) return true;\n  if (av == null) return true;")]),
 ('02 el ayudante dice NO siempre: ninguna seccion de sector avanzado aparece nunca', 'TC-748,TC-749',
  [("  const ks = Array.isArray(av) ? av : [av];\n  for (let i = 0; i < ks.length; i++) { if (amiloIntegrado(ks[i])) return true; }\n  return false;",
    "  const ks = Array.isArray(av) ? av : [av];\n  for (let i = 0; i < ks.length; i++) { if (false && amiloIntegrado(ks[i])) return true; }\n  return false;")]),
 ('03 una seccion SIN sector declarado tambien se filtra: se van las treinta y dos no avanzadas', 'TC-748,TC-749',
  [("  if (av == null) return true;", "  if (av == null) return false;")]),
 ('04 la lista de claves exige TODAS en vez de alcanzar con una', 'TC-748',
  [("  for (let i = 0; i < ks.length; i++) { if (amiloIntegrado(ks[i])) return true; }\n  return false;",
    "  for (let i = 0; i < ks.length; i++) { if (!amiloIntegrado(ks[i])) return false; }\n  return true;")]),
 ('05 el ayudante deja de leer el interruptor del informe y mira el campo persistido', 'TC-748',
  [("if (amiloIntegrado(ks[i])) return true;",
    "if ((document.getElementById('am-integrados')||{}).value === ks[i]) return true;")]),
 ('06 el armado del panel deja de consultar el ayudante', 'TC-748,TC-749',
  [("    try { if (s.av != null && !_indSectorIncluido(s.av)) return;",
    "    try { if (false && s.av != null && !_indSectorIncluido(s.av)) return;")]),
 ('07 la consulta mira una propiedad que ninguna seccion declara', 'TC-749',
  [("if (s.av != null && !_indSectorIncluido(s.av)) return;",
    "if (s.avX != null && !_indSectorIncluido(s.avX)) return;")]),
 # ══ COMMIT 2 · LAS TRES SECCIONES DE LAS CAPTURAS ════════════════════════════
 ('08 la constriccion pericardica pierde su sector declarado', 'TC-748,TC-749',
  [("{ tit:'Constricción pericárdica — diagnóstico', fn:_indConstr, av:'cvr' },",
    "{ tit:'Constricción pericárdica — diagnóstico', fn:_indConstr },")]),
 ('09 el perfil hemodinamico pierde su sector declarado', 'TC-748,TC-751',
  [("{ tit:'Perfil hemodinámico — presiones y resistencias estimadas por eco', fn:_indHemo, av:'hemo' },",
    "{ tit:'Perfil hemodinámico — presiones y resistencias estimadas por eco', fn:_indHemo },")]),
 ('10 la amiloidosis declara UNA sola de sus dos hojas', 'TC-748',
  [("fn:_indAmil, av:['ett','alg'] },", "fn:_indAmil, av:['ett'] },")]),
 ('11 la constriccion declara una clave que NO existe en amiloSecs', 'TC-748',
  [("fn:_indConstr, av:'cvr' },", "fn:_indConstr, av:'cvrX' },")]),
 # ══ COMMIT 3 · EL RESTO DE LOS SECTORES ══════════════════════════════════════
 ('12 la tromboembolia pulmonar pierde su sector declarado', 'TC-748',
  [("fn:_indTEP, av:'tep' },", "fn:_indTEP },")]),
 ('13 el HFA-PEFF pierde su sector declarado', 'TC-748,TC-749',
  [("fn:_indHFPEFF, av:'hfpeff' },", "fn:_indHFPEFF },")]),
 ('14 el posoperatorio pierde su sector declarado', 'TC-748',
  [("fn:_indPOP, av:'pop' }", "fn:_indPOP }")]),
 ('15 la cardiotoxicidad declara el sector de OTRO modulo', 'TC-748',
  [("fn:_indConco, av:'conco' },", "fn:_indConco, av:'oai' },")]),
 ('16 el trombo de la orejuela se conecta al sector equivocado', 'TC-748',
  [("fn:_indETETrombo, av:'oai' },", "fn:_indETETrombo, av:'conco' },")]),
 # ══ COMMIT 2/3 · EL DATO SE DEJA DE SINCRONIZAR (aplica el defecto de mas) ═══
 ('17 el ayudante apaga tambien el CALCULO del sector, no solo su Evidencia', 'TC-750',
  [("function _indSectorIncluido(av){\n  if (av == null) return true;",
    "function _indSectorIncluido(av){\n  try { ['hemo-ic','hemo-gc'].forEach(function(i){ var e=document.getElementById(i); if(e) e.textContent='—' }) } catch(e){}\n  if (av == null) return true;")]),
 # ══ COMMIT 4 · HEMODINAMICA ══════════════════════════════════════════════════
 ('18 vuelve el «cae de un lado distinto» de la nota del Forrester', 'TC-751',
  [("{ txt:'Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos y congestión cuando la presión capilar supera los 18 mmHg.', refs:null },",
    "{ txt:'Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos, de modo que el 2,2 justo cae de un lado distinto del que resuelve la clasificación original.', refs:null },")]),
 ('19 vuelve el «sale de la columna del Shock Trial» del globo del indice cardiaco', 'TC-751',
  [("La Tabla 1 del consenso argentino de shock cardiogénico compara definiciones de shock cardiogénico, y su columna del Shock Trial publica un índice cardíaco de 2,2 o menos (folio 2).",
    "El «2,2 o menos» con que la aplicación lo llama bajo sale de la columna del Shock Trial de la Tabla 1 del consenso argentino de shock cardiogénico (folio 2).")]),
 ('20 vuelve el «los dos libros de referencia no coinciden» del globo de la RVS', 'TC-751',
  [("'esta aplicación publica el número sin banda. Un libro de referencia da 1.170",
    "'los dos libros de referencia no coinciden en un rango único, y por eso la aplicación publica el número sin banda: 1.170")]),
 ('21 el globo del indice cardiaco pierde su rango de referencia y sus dos folios', 'TC-751',
  [("'el rango de referencia normal es 2,5 a 4,0 L/min/m² (ESC/ERS 2022 de hipertensión pulmonar, tabla de valores hemodinámicos normales, folio 30).",
    "'el indice cardiaco sale del gasto y la superficie corporal.")]),
 # ══ COMMIT 4 · LA PROTESIS MITRAL ════════════════════════════════════════════
 ('22 vuelve el «las dos definiciones no coinciden» del desajuste mitral', 'TC-751',
  [("{ txt:'El texto de la guía define el desajuste protésico-paciente mitral moderado por debajo de 1,2",
    "{ txt:'Las dos definiciones de desajuste protésico-paciente mitral de la misma guía no coinciden. El texto define moderado por debajo de 1,2")]),
 ('23 vuelve el ejemplo del 1,1 que decia que las dos versiones se contradicen', 'TC-751',
  [("      'La calculadora de esta aplicación aplica la TABLA 7, la estratificada por IMC.',",
    "      'La calculadora de esta aplicación aplica la TABLA 7, la estratificada por IMC. Para un IMC de 30 o más las dos versiones se contradicen: una AEO indexada de 1,1 cm²/m² es moderada por el texto y normal por la tabla.',")]),
 ('24 vuelve la «tercera voz» de la ESC/EACTS 2025', 'TC-751',
  [("{ txt:'La ESC/EACTS 2025 dice que se sabe poco sobre la prevalencia",
    "{ txt:'Y hay una tercera voz: la ESC/EACTS 2025 dice que se sabe poco sobre la prevalencia")]),
 ('25 vuelve el «coincide con la europea» de la ACC/AHA en la protesis mitral', 'TC-751',
  [("{ txt:'La ACC/AHA 2020 indica la reintervención quirúrgica en la estenosis protésica sintomática severa, Clase 1 · Nivel B-NR, salvo riesgo alto o prohibitivo. Su fila de valve-in-valve percutáneo está escrita para la prótesis AÓRTICA y no se aplica acá.',",
    "{ txt:'La ACC/AHA 2020 coincide con la europea en la estenosis protésica sintomática severa: reintervención quirúrgica indicada, Clase 1 · Nivel B-NR, salvo riesgo alto o prohibitivo. Su fila de valve-in-valve percutáneo está escrita para la prótesis AÓRTICA y no se aplica acá.',")]),
 ('26 la linea de las dos definiciones del desajuste pierde sus cortes', 'TC-751',
  [("{ txt:'El texto de la guía define el desajuste protésico-paciente mitral moderado por debajo de 1,2 cm²/m² y severo hasta 0,90 cm²/m², sin estratificar por IMC. Su Tabla 7 lo estratifica: con IMC menor de 30, normal por encima de 1,2 y severo hasta 0,90; con IMC de 30 o más, normal por encima de 1,0 y severo hasta 0,75.',",
    "{ txt:'El texto de la guía define el desajuste protésico-paciente mitral y su Tabla 7 lo estratifica por IMC.',")]),
 # ══ COMMIT 5 · LOS TRAMOS, LOS TITULOS Y REFERENCIAS ═════════════════════════
 ('27 vuelve el «no coinciden» a la nota de tramo del Qp:Qs', 'TC-751',
  [("tramo:'la ACC/AHA 2025 escribe «≥1,5». La ESC 2020 escribe «>1,5»' },\n  { clave:'cia.ev.rvp2'",
    "tramo:'con un Qp:Qs de 1,5 exacto las dos guías no coinciden' },\n  { clave:'cia.ev.rvp2'")]),
 ('28 vuelve el «no gradua nada» al tramo de 5 a 8 unidades Wood de la CIA', 'TC-751',
  [("tramo:'en las hojas leídas la ACC/AHA 2025 gradúa hasta 8 unidades Wood' },\n  { clave:'cia.ev.rvpbaja5'",
    "tramo:'por encima de 8 unidades Wood la ACC/AHA 2025 no gradúa nada en las hojas leídas' },\n  { clave:'cia.ev.rvpbaja5'")]),
 ('29 vuelve el «sin resolver» al titulo del bloque de congenitas', 'TC-669,TC-751',
  [("      { tit:'Lo que cada guía publica', lineas:[\n        { txt:'Diámetro telesistólico",
    "      { tit:'Las diferencias entre las dos guías, sin resolver', lineas:[\n        { txt:'Diámetro telesistólico")]),
 ('30 vuelve el «no coinciden» a la ficha del foramen oval de Referencias', 'TC-751',
  [("shunt sustancial como <b>más de 10 microburbujas</b> (apéndice suplementario 4).",
    "shunt sustancial como <b>más de 10 microburbujas</b> (apéndice suplementario 4): las dos guías no coinciden sobre cómo ese ensayo lo definió.")]),
 ('31 vuelve el «difieren ... sin resolver» a la ficha del tracto de salida del VD', 'TC-751',
  [("La guía de 2025 publica techos de normalidad de 33, 34 y 29 milímetros.",
    "Los techos de normalidad difieren de los de la guía de 2025 —33, 34 y 29 milímetros—, y la diferencia se muestra sin resolver.")]),
 ('32 los numeros de la guia de 2025 desaparecen de la ficha del VD', 'TC-751',
  [("publica techos de normalidad de 33, 34 y 29 milímetros.",
    "publica sus propios techos de normalidad.")]),
 ('33 vuelve el «ninguna guia de la biblioteca publica un recuento asi» de la constriccion', 'TC-751',
  [("'criterio de EcoSmart: cuántos criterios hacen falta de cada lado, y cuáles cuentan, es una regla propia de la aplicación, y por eso esta fila no lleva cita.",
    "'criterio de EcoSmart: cuántos criterios hacen falta de cada lado, y cuáles cuentan, es una regla propia de la aplicación. Ninguna guía de la biblioteca publica un recuento así, y por eso esta fila no lleva cita.")]),
 ('34 vuelve el «ninguna fuente de la biblioteca» de la reparabilidad mitral', 'TC-751',
  [("const REPAR_PRIM_TXT    = 'Para la insuficiencia mitral PRIMARIA las cifras de esta pantalla son un criterio propio de la aplicación.';",
    "const REPAR_PRIM_TXT    = 'Para la insuficiencia mitral PRIMARIA ninguna fuente de la biblioteca publica cortes de reparabilidad quirúrgica: las cifras de esta pantalla son un criterio propio de la aplicación.';")]),
 # ══ EL PAPEL ═════════════════════════════════════════════════════════════════
 # ⚠️ LA MUTACION 35 SE RETIRO, DECLARADA EN P22-a. Queria matar la condicion (A2) de TC-752 -que
 # el informe y el EN SUMA no lleven nada del panel-, y ese es un control de FRONTERA cuyo defecto
 # vive en el EMISOR del informe, que esta tanda no toca: generarInforme recompone los dos
 # textareas en cada llamada, asi que una fuga inyectada en el panel, en ccSumaLinea o en el
 # defaultValue del textarea se borra antes de que el caso la lea -medido en tres intentos-.
 # Lo que sostiene ese invariante es el A/B de 114 escenas con el PDF y el PPT generados de
 # verdad: CERO diferencias de superficie firmada. La mutacion 36 si mata a TC-752, por su Excel.
 ('36 el Excel gana una columna que nombra la inclusion de un sector', 'TC-752',
  [("    'Nombre': inf.nombre || '', 'CI': inf.ci || '',",
    "    'Sectores integrados en Evidencia': '', 'Nombre': inf.nombre || '', 'CI': inf.ci || '',")]),
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
