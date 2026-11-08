#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant25.py - barrido de mutaciones dirigidas de la tanda PANT-25 (2026-11-08).
Calcado de _mut_pant24.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 ('01 el orden de la barra pierde Cardiopatia congenita', 'TC-761',
  [("'congenitas', 'cardiotox', 'hemo', 'otros']);",
    "'cardiotox', 'hemo', 'otros']);")]),
 ('02 Hemodinamica queda DESPUES de Otros hallazgos', 'TC-761',
  [("'congenitas', 'cardiotox', 'hemo', 'otros']);",
    "'congenitas', 'cardiotox', 'otros', 'hemo']);")]),
 ('03 Cardiopatia congenita pierde las anomalias coronarias', 'TC-761',
  [("  congenitas: Object.freeze(['congenitas', 'coronarias']),",
    "  congenitas: Object.freeze(['congenitas']),")]),
 ('04 Cardiotoxicidad nace vacia', 'TC-761',
  [("  cardiotox:  Object.freeze(['cardiotox']),",
    '  cardiotox:  Object.freeze([]),')]),
 ('05 Hemodinamica pierde la constriccion', 'TC-761',
  [("  hemo:       Object.freeze(['pop', 'constriccion']),",
    "  hemo:       Object.freeze(['pop']),")]),
 ('06 la constriccion vuelve a Otros hallazgos y queda DUPLICADA', 'TC-761',
  [("  otros: Object.freeze(['oai', 'burbujas', 'fop', 'pericardio',",
    "  otros: Object.freeze(['oai', 'burbujas', 'fop', 'constriccion', 'pericardio',")]),
 ('07 el pericardio se va de Otros hallazgos', 'TC-761',
  [("'oai', 'burbujas', 'fop', 'pericardio',",
    "'oai', 'burbujas', 'fop',")]),
 ('08 desaparece el boton de Hemodinamica de la barra', 'TC-761',
  [('    <button type="button" class="ref-subtab" role="tab" id="ref-subtab-hemo"',
    '    <button type="button" class="ref-subtab-NO" role="tab" id="ref-subtab-hemo"')]),
 ('09 desaparece el panel de Cardiotoxicidad', 'TC-761',
  [('  <div id="ref-sub-cardiotox" class="ref-subpanel"',
    '  <div id="ref-sub-cardiotoxXX" class="ref-subpanel"')]),
 ('10 el boton de Cardiopatia congenita controla el panel equivocado', 'TC-761',
  [('id="ref-subtab-congenitas" aria-selected="false" aria-controls="ref-sub-congenitas"',
    'id="ref-subtab-congenitas" aria-selected="false" aria-controls="ref-sub-otros"')]),
 ('11 «Ver referencia» del trayecto coronario apunta a otra entrada', 'TC-762',
  [("'otr-rac': 'coronarias'",
    "'otr-rac': 'congenitas'")]),
 ('12 «Ver referencia» de la vasoplejia apunta a otra entrada', 'TC-762',
  [("  'pop-vaso': 'pop',",
    "  'pop-vaso': 'pericardio',")]),
 ('13 «Ver referencia» del test de burbujas apunta a una entrada que NO existe', 'TC-762',
  [("'otr-burbujas': 'burbujas'",
    "'otr-burbujas': 'noexisteestaentrada'")]),
 ('14 refIr deja de activar la subpestania del destino', 'TC-762',
  [("  if (sub) refSubTab(sub, document.getElementById('ref-subtab-' + sub));",
    "  if (false) refSubTab(sub, document.getElementById('ref-subtab-' + sub));")]),
 ('15 refIr deriva el panel de una lista fija en vez del DOM', 'TC-762',
  [("  const sub = pan ? String(pan.id || '').replace(/^ref-sub-/, '') : null;",
    "  const sub = 'otros';")]),
 ('16 refIr devuelve verdadero aunque la entrada no exista', 'TC-762',
  [("  if (!cuerpo) { console.error('[refIr] no existe ref-' + id); return false; }",
    "  if (!cuerpo) { console.error('[refIr] no existe ref-' + id); return true; }")]),
 ('17 el rotulo de seccion pierde la clave de Cardiopatia congenita', 'TC-763',
  [("                   ao: 'Aorta', congenitas: 'Cardiopatia congenita',",
    "                   ao: 'Aorta',")]),
 ('18 el rotulo de seccion pierde la clave de Cardiotoxicidad', 'TC-763',
  [("                   cardiotox: 'Cardiotoxicidad', hemo: 'Hemodinamica',",
    "                   hemo: 'Hemodinamica',")]),
 ('19 el rotulo de seccion pierde la clave de Hemodinamica', 'TC-763',
  [("                   cardiotox: 'Cardiotoxicidad', hemo: 'Hemodinamica',",
    "                   cardiotox: 'Cardiotoxicidad',")]),
 ('20 Hemodinamica sale rotulada con el nombre de otra seccion', 'TC-763',
  [("hemo: 'Hemodinamica',",
    "hemo: 'Otros hallazgos',")]),
 ('21 el indice deja de recorrer los paneles nuevos', 'TC-763',
  [("  REF_SUB_ORDEN.forEach(function (sub) {\n    const pan = document.getElementById('ref-sub-' + sub);\n    if (!pan) return;\n    const hs = pan.querySelectorAll('h2.card-head');",
    "  ['calc','dim','fun','valv','ao','otros'].forEach(function (sub) {\n    const pan = document.getElementById('ref-sub-' + sub);\n    if (!pan) return;\n    const hs = pan.querySelectorAll('h2.card-head');")]),
 ('22 vuelve la clausula que expone lo pendiente', 'TC-764',
  [('integrado en sistemas de puntuaci&oacute;n.',
    'integrado en sistemas de puntuaci&oacute;n; los cortes de esos puntajes no se citan ac&aacute; porque no se leyeron con certeza.')]),
 ('23 vuelve la fila sin fuente de la clasificacion de la OMS', 'TC-764',
  [('1 &middot; Clasificación y frecuencia</div>',
    '1 &middot; Clasificación de la OMS y frecuencia</div>')]),
 ('24 el bloque de la clinica desaparece', 'TC-764',
  [('2 &middot; Clínica</div>',
    '2 &middot; Otros datos</div>')]),
 ('25 el bloque de la conducta desaparece', 'TC-764',
  [('5 &middot; Conducta</div>',
    '5 &middot; Varios</div>')]),
 ('26 el corte del puntaje ecocardiografico se mueve', 'TC-764',
  [('Puntaje <b>ecocardiográfico</b> de masa</td><td style="padding:5px 8px;">Un puntaje de <b>5 o más</b> orienta a malignidad.',
    'Puntaje <b>ecocardiográfico</b> de masa</td><td style="padding:5px 8px;">Un puntaje de <b>6 o más</b> orienta a malignidad.')]),
 ('27 el area bajo la curva del puntaje cambia', 'TC-764',
  [('área bajo la curva de <b>0,965</b>',
    'área bajo la curva de <b>0,865</b>')]),
 ('28 la supervivencia de los malignos cambia', 'TC-764',
  [('<b>45,3 %</b> al año y <b>11,5 %</b> a los cinco años.',
    '<b>45,8 %</b> al año y <b>11,9 %</b> a los cinco años.')]),
 ('29 la conducta de la masa maligna pierde la quimioterapia neoadyuvante', 'TC-764',
  [('Quimioterapia neoadyuvante, cirugía y quimioterapia adyuvante.',
    'Cirugía.')]),
 ('30 el folio de la Tabla 13 de la conducta cambia', 'TC-764',
  [('Tabla 13, hoja 93, folio <b>4321</b>.',
    'Tabla 13, hoja 93, folio <b>4521</b>.')]),
 ('31 la sensibilidad del transtoracico para el trombo del ventriculo izquierdo cambia', 'TC-764',
  [('Sensibilidad <b>95 %</b> y especificidad <b>85 a 90 %</b>.',
    'Sensibilidad <b>75 %</b> y especificidad <b>65 a 70 %</b>.')]),
 ('32 la sensibilidad del transtoracico para el absceso cambia', 'TC-764',
  [('Sensibilidad <b>28 %</b> y especificidad <b>98 %</b>.',
    'Sensibilidad <b>38 %</b> y especificidad <b>88 %</b>.')]),
 ('33 la incidencia de embolia en la endocarditis cambia', 'TC-764',
  [('del <b>13 al 49 %</b>',
    'del <b>13 al 59 %</b>')]),
 ('34 la fraccion de embolia cerebral asintomatica cambia', 'TC-764',
  [('alrededor del <b>30 al 50 %</b> tiene embolia cerebral <b>asintomática</b>',
    'alrededor del <b>30 al 60 %</b> tiene embolia cerebral <b>asintomática</b>')]),
 ('35 el momento de mayor riesgo deja de decir que es ANTES del diagnostico', 'TC-764',
  [('En las <b>dos primeras semanas</b> de antibiótico sigue siendo significativo',
    'En las primeras jornadas de antibiótico sigue siendo significativo')]),
 ('36 una celda de la tabla de rendimiento queda vacia', 'TC-764',
  [('<td style="padding:5px 8px;"><b>Variantes anatómicas</b></td><td style="padding:5px 8px;">+++</td>',
    '<td style="padding:5px 8px;"><b>Variantes anatómicas</b></td><td style="padding:5px 8px;"></td>')]),

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
