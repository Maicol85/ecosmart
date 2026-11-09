#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant27.py - barrido de mutaciones dirigidas de la tanda PANT-27 (2026-11-09).
Calcado de _mut_pant25.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una: las SIETE frases de la estenosis mitral, la compuerta de etiologia de la
nota de los cortes de 5 y 10 mmHg, el cableado del area y del score a sus variables, las tres
frases del commit 3 con la primera oracion intacta, la oracion del trombo y su acotamiento al
ramal de protesis mecanica.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── T3 ────────────────────────────────────────────────────────────────────────
 ('01 T3 vuelve a traer la expresion en ingles de la guia', 'TC-765',
  [("{ txt:'La palabra de la guía es «clínicamente grave» (folio 4680)",
    "{ txt:'La palabra de la guía es «clínicamente grave» («clinically severe MS», folio 4680)")]),
 ('02 T3 vuelve a comparar la palabra de la guia con la del informe', 'TC-765',
  [("riesgo tromboembólico alto o descompensación hemodinámica.',\n      refs:['esc2025vc'] },",
    "riesgo tromboembólico alto o descompensación hemodinámica. El informe de esta aplicación dice «significativa» para el mismo hecho.',\n      refs:['esc2025vc'] },")]),
 ('03 T3 pierde su folio', 'TC-765',
  [("La palabra de la guía es «clínicamente grave» (folio 4680)",
    "La palabra de la guía es «clínicamente grave»")]),
 # ── T1 ────────────────────────────────────────────────────────────────────────
 ('04 T1 vuelve a relatar el operador de las tres partes del documento', 'TC-765',
  [("{ txt:'Esta aplicación usa un área menor o igual a ' + u + ' cm², como figura en la guía ESC 2025.',",
    "{ txt:'El operador del área no es el mismo en los tres lugares del documento. Queda declarado, no corregido.',")]),
 ('05 T1 deja de seguir a la variable del area y escribe el numero a mano', 'TC-765',
  [("'Esta aplicación usa un área menor o igual a ' + u + ' cm², como figura en la guía ESC 2025.'",
    "'Esta aplicación usa un área menor o igual a 1,5 cm², como figura en la guía ESC 2025.'")]),
 ('06 T1 pierde la cita de la guia vigente', 'TC-765',
  [("como figura en la guía ESC 2025.',\n      refs:['esc2025vc'] },",
    "como figura en la guía ESC 2025.',\n      refs:[] },")]),
 # ── T4 ────────────────────────────────────────────────────────────────────────
 ('07 T4 vuelve a comparar las dos notas del documento', 'TC-765',
  [("{ txt:'La comisurotomía mitral percutánea es posible en ausencia de características desfavorables (folio 4681).',",
    "{ txt:'Las características desfavorables tampoco se definen igual en los dos lugares.',")]),
 ('08 T4 pierde su folio', 'TC-765',
  [("es posible en ausencia de características desfavorables (folio 4681).'",
    "es posible en ausencia de características desfavorables.'")]),
 # ── T5 ────────────────────────────────────────────────────────────────────────
 ('09 T5 vuelve a decir que el material suplementario NO esta', 'TC-765',
  [("'», tal como la guía lo escribe. La guía remite la definición de esa escala a su material suplementario (Table S3), y la aplicación no la atribuye a ninguna escala concreta.'",
    "'», según la guía. La definición de esa escala vive en su material suplementario (Table S3), que no está en el documento consultado: la aplicación usa el corte tal como la guía lo escribe y no lo atribuye a ninguna escala concreta.'")]),
 ('10 T5 deja de seguir a EM_CRIT_2025.score_desfav y escribe el 8 a mano', 'TC-765',
  [("'El corte del score es «score ecocardiográfico > ' + EM_CRIT_2025.score_desfav + '», tal como la guía lo escribe.",
    "'El corte del score es «score ecocardiográfico > 8», tal como la guía lo escribe.")]),
 # ── T6 ────────────────────────────────────────────────────────────────────────
 ('11 T6 vuelve a traer la aposicion que negaba otra forma', 'TC-765',
  [("insuficiencia mitral más que leve; calcificación severa o bicomisural;",
    "insuficiencia mitral MÁS QUE LEVE —no «moderada o más»—; calcificación severa o bicomisural;")]),
 ('12 T6 deja de seguir a la variable del area', 'TC-765',
  [("(Tabla 8, folio 4682): AVm > ' + u + ' cm²; trombo en aurícula izquierda;",
    "(Tabla 8, folio 4682): AVm > 1,5 cm²; trombo en aurícula izquierda;")]),
 ('13 T6 pierde una contraindicacion de la lista', 'TC-765',
  [("ausencia de fusión comisural; valvulopatía aórtica severa,",
    "valvulopatía aórtica severa,")]),
 # ── T7 ────────────────────────────────────────────────────────────────────────
 ('14 T7 vuelve a su encabezado viejo', 'TC-765',
  [("{ txt:'Excepciones de la Tabla 8 (folio 4682): con el área mayor que ' + u + ' cm²",
    "{ txt:'Las dos excepciones de esa tabla: con AVm > ' + u + ' cm²")]),
 ('15 T7 vuelve a escribir la orejuela con la aposicion y el rango viejo', 'TC-765',
  [("con trombo en la orejuela, en quien tiene contraindicación quirúrgica o no tiene urgencia, con anticoagulación de 1 a 3 meses y un ETE de control.",
    "y con el trombo en la OREJUELA —no en toda la aurícula— puede considerarse en quien tiene contraindicación quirúrgica o no tiene necesidad urgente, anticoagulando 1-3 meses y con un ETE de control.")]),
 ('16 T7 deja de seguir a la variable del area', 'TC-765',
  [("Excepciones de la Tabla 8 (folio 4682): con el área mayor que ' + u + ' cm²",
    "Excepciones de la Tabla 8 (folio 4682): con el área mayor que 1,5 cm²")]),
 ('17 T7 pierde su folio', 'TC-765',
  [("Excepciones de la Tabla 8 (folio 4682): con el área mayor que",
    "Excepciones de la Tabla 8: con el área mayor que")]),
 # ── T2 y su compuerta de etiologia ───────────────────────────────────────────
 ('18 T2 vuelve a contar de que documento NO salen los cortes', 'TC-765',
  [("'Los cortes de 5 y 10 mmHg del gradiente medio son un criterio de la aplicación.' : '',",
    "'Los cortes de 5 y 10 mmHg del gradiente medio salen de un documento de cardiopatía REUMÁTICA. Queda declarado, no corregido.' : '',")]),
 ('19 la compuerta de etiologia se cae y T2 sale SIEMPRE', 'TC-765',
  [("    (etio && etio !== 'reumatica') ? 'Los cortes de 5 y 10 mmHg",
    "    (true) ? 'Los cortes de 5 y 10 mmHg")]),
 ('20 la compuerta se invierte y T2 sale SOLO con etiologia reumatica', 'TC-765',
  [("    (etio && etio !== 'reumatica') ? 'Los cortes de 5 y 10 mmHg",
    "    (etio === 'reumatica') ? 'Los cortes de 5 y 10 mmHg")]),
 ('21 la compuerta deja de exigir etiologia y T2 sale tambien sin ella', 'TC-765',
  [("    (etio && etio !== 'reumatica') ? 'Los cortes de 5 y 10 mmHg",
    "    (etio !== 'reumatica') ? 'Los cortes de 5 y 10 mmHg")]),
 # ── T8, Fontan ────────────────────────────────────────────────────────────────
 ('22 T8 vuelve a decir lo que la ESC 2020 NO publica', 'TC-766',
  [("ref:'La ESC 2020 indica anticoagulacion con trombo, arritmia auricular o tromboembolia (hoja 65, folio 627)' }",
    "ref:'la ESC 2020 solo indica anticoagulacion con trombo, arritmia auricular o tromboembolia, y no publica una recomendacion para el paciente sin rasgos de alto riesgo (hoja 65, folio 627)' }")]),
 ('23 T8 recupera el remate que comparaba las dos guias', 'TC-766',
  [("tromboembolia (hoja 65, folio 627)' }",
    "tromboembolia (hoja 65, folio 627)', tramo:'las dos guias no cubren lo mismo: la ACC/AHA 2025 indica aspirina o anticoagulacion a TODO paciente sin rasgos de alto riesgo, y la ESC 2020 no' }")]),
 ('24 T8 pierde su hoja y su folio', 'TC-766',
  [("arritmia auricular o tromboembolia (hoja 65, folio 627)' }",
    "arritmia auricular o tromboembolia' }")]),
 # ── T9, el globo de la calculadora de TAVI ───────────────────────────────────
 ('25 T9 vuelve a decir que la guia usa la palabra sin definirla', 'TC-766',
  [("    + '\\nSe plantea calcificación valvular severa por evaluación con tomografía y progresión de la velocidad máxima de 0,3 m/s por año o más.' },",
    "    + '\\nY LA GUÍA USA LA PALABRA «SEVERA» SIN DEFINIRLA. En su tabla de la estenosis aórtica aparece la expresión «calcificación valvular severa, idealmente evaluada por tomografía», junto con una progresión de la velocidad máxima de 0,3 m/s por año o más. Folio 4670.' },")]),
 ('26 T9 pierde la progresion de 0,3 m/s por anio', 'TC-766',
  [("por evaluación con tomografía y progresión de la velocidad máxima de 0,3 m/s por año o más.",
    "por evaluación con tomografía.")]),
 # ── T10 a T13, la ficha ref-ia ───────────────────────────────────────────────
 ('27 T13 vuelve a las tres expresiones en ingles y a la cita de Tribouilloy', 'TC-767',
  [("            <b>folio 621</b>): reverso de flujo protodiast&oacute;lico breve en leve, intermedio en moderada y\n            reverso de flujo holodiast&oacute;lico, con velocidad telediast&oacute;lica mayor de 20 cm/s, en grave.",
    "            <b>Tabla 4, folio 621</b>), que escribe <i>&laquo;brief, protodiastolic flow reversal&raquo;</i> en leve,\n            <i>&laquo;intermediate&raquo;</i> en moderada y <i>&laquo;holodiastolic flow reversal&raquo;</i> en grave &mdash; y que a su vez lo cita de Tribouilloy.")]),
 ('28 T10 vuelve a decir de donde NO sale el corte de 15 cm', 'TC-767',
  [("            El <b>corte de 15 cm del VTI</b> sale del libro &laquo;Ecocardiograf&iacute;a avanzada&raquo;\n            (Moya Mur, cap&iacute;tulo 20).",
    "            El <b>corte de 15 cm del VTI</b> sale de la <b>Tabla 20-5 del libro de texto</b> &laquo;Ecocardiograf&iacute;a avanzada&raquo;\n            (Moya Mur, cap&iacute;tulo 20): <b>libro de texto; no figura en las gu&iacute;as de la biblioteca</b>.")]),
 ('29 T11 vuelve a explicar el lado y a juzgar la tabla', 'TC-767',
  [("Con <b>15 cm exactos</b> la aplicaci&oacute;n lo considera <b>moderada</b>.",
    "Con <b>15 cm exactos</b> la aplicaci&oacute;n se queda en <b>moderada</b>, que es el lado que no afirma la gravedad: la tabla escribe &laquo;&lt;15&raquo; y &laquo;&gt;15&raquo; y deja ese valor sin definir.")]),
 ('30 T12 vuelve a su forma larga', 'TC-767',
  [("<b>Sin la duraci&oacute;n</b>, el VTI y la velocidad se muestran pero <b>no grad&uacute;an</b>.",
    "<b>Sin la duraci&oacute;n consignada</b>, el VTI y la velocidad se muestran y <b>no grad&uacute;an</b>.")]),
 ('31 la PRIMERA oracion del bloque, que no se toca, se altera', 'TC-767',
  [("El <b>reverso diast&oacute;lico de la aorta descendente</b> se grad&uacute;a por su <b>duraci&oacute;n</b>, y el VTI\n            y la velocidad telediast&oacute;lica la califican. La estructura",
    "El <b>reverso diast&oacute;lico de la aorta descendente</b> se grad&uacute;a por su <b>duraci&oacute;n</b>. La estructura")]),
 ('32 el bloque pierde la publicacion de la EACVI', 'TC-767',
  [("<b>EACVI 2013</b> (Lancellotti y col., <i>Eur Heart J Cardiovasc Imaging</i> 2013;14:611-644,",
    "<b>EACVI 2013</b> (Lancellotti y col.,")]),
 ('33 el bloque pierde el autor del libro', 'TC-767',
  [("(Moya Mur, cap&iacute;tulo 20).",
    "(cap&iacute;tulo 20).")]),
 ('34 el bloque pierde la velocidad telediastolica de 20 cm/s', 'TC-767',
  [("con velocidad telediast&oacute;lica mayor de 20 cm/s, en grave.",
    "en grave.")]),
 # ── T14, el trombo ───────────────────────────────────────────────────────────
 ('35 la oracion del trombo desaparece', 'TC-768',
  [(" La cirugía se considera ante un trombo protésico grande, no obstructivo, que se complicó con embolia o que persiste a pesar de anticoagulación óptima (folio 4698).",
    "")]),
 ('36 la oracion del trombo pierde su folio', 'TC-768',
  [("que persiste a pesar de anticoagulación óptima (folio 4698).",
    "que persiste a pesar de anticoagulación óptima.")]),
 ('37 la oracion del trombo pierde la rama de persistencia a pesar de anticoagulacion', 'TC-768',
  [("que se complicó con embolia o que persiste a pesar de anticoagulación óptima (folio 4698).",
    "que se complicó con embolia (folio 4698).")]),
 ('38 la oracion del trombo deja de estar acotada al ramal MECANICO', 'TC-768',
  [("    if (tipo === 'mec') {\n      o.mod = { tit:'También aplica', txt:PROTM_REC_2025.tromb_mec.t,",
    "    if (true) {\n      o.mod = { tit:'También aplica', txt:PROTM_REC_2025.tromb_mec.t,")]),
 ('39 la frase que ya estaba, con su corte y su Figura 20, se pierde', 'TC-768',
  [("nota:'Y la cirugía es a considerar (Clase IIa · Nivel C) ante un trombo grande, de 10 mm o más, complicado con embolia: el tamaño del trombo grande lo imprime así su Figura 20 (hoja 65, folio 4699). La cirugía se considera",
    "nota:'La cirugía se considera")]),
 ('40 el cierre que declara lo que la aplicacion no registra se pierde', 'TC-768',
  [(" El tamaño del trombo y la clase funcional no se registran en esta aplicación.'",
    "'")]),
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
