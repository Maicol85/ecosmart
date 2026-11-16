#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_medir6.py - barrido de mutaciones dirigidas de los CAMBIOS CLINICOS de MEDIR-6 (16/11/2026).
Calcado de _mut_medir5.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

Cubre los cinco cambios clinicos que la orden pide -- B1, B2, B3, B4 y B5-- mas C1. Cada mutacion
ataca el CORTE o la REGLA, no el texto que lo rodea: lo que tiene que quedar en rojo es la
conducta, no el rotulo.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')
orig = open(IDX, encoding='utf-8').read()

MUT = [

 # ══ B1 — EL TRIV A >= 75 ms ═══════════════════════════════════════════════════════════════
 ('01 B1: el operador del TRIV vuelve a ser ESTRICTO en el lector del informe', 'TC-133,TC-553',
  [("  const trivAlto = trivOk && triv >= DT_TRIV_HTP;   // B1: ≥ 75 ms, no > 75",
    "  const trivAlto = trivOk && triv > DT_TRIV_HTP;")]),

 ('02 B1: el operador vuelve a ser ESTRICTO en el lector de pantalla', 'TC-428,TC-552',
  [("  const alto = r.triv >= DT_TRIV_HTP;               // B1: ≥ 75 ms, no > 75",
    "  const alto = r.triv > DT_TRIV_HTP;")]),

 ('03 B1: el corte se mueve a 76, o sea que 75 deja de contar', 'TC-133,TC-552,TC-553',
  [("const DT_TRIV_HTP = 75, DT_TAP_HTP = 105;",
    "const DT_TRIV_HTP = 76, DT_TAP_HTP = 105;")]),

 ('04 B1: la frase del papel vuelve a publicar el operador viejo', 'TC-133,TC-553',
  [("  if (r.trivAlto) p.push('TRIV tricuspídeo \\u2265 ' + DT_TRIV_HTP + ' ms');",
    "  if (r.trivAlto) p.push('TRIV tricuspídeo > ' + DT_TRIV_HTP + ' ms');")]),

 # ══ B2 — EL INDICE DE CELERMAJER ══════════════════════════════════════════════════════════
 ('05 B2: el globo deja de encuadrar la extension a adultos', 'TC-664',
  [("    ojo: 'El índice es orientativo y no una indicación, y lo es especialmente EN ADULTOS: se '",
    "    ojo: 'El índice es orientativo. '")]),

 ('06 B2: el grado de Celermajer pasa a CONDUCIR la conclusion de Ebstein', 'TC-664,TC-911',
  [("  const cel = ebsCelermajer(src);\n  const it = _ebsSv('it_grado');",
    "  const cel = ebsCelermajer(src);\n  if (cel && cel.grado >= 3) return { txt: 'Anomalia de Ebstein severa', rotulo: 'Anomalia de Ebstein' };\n  const it = _ebsSv('it_grado');")]),

 # ══ B3 — LA REGLA DE DDVI INDEXADO DE LA CIV ══════════════════════════════════════════════
 ('07 B3: vuelve la regla de DDVI indexado > 32 a la cascada de conducta', 'TC-170',
  [("function _civConducta(i) {\n  const q = _ccQpQsAtrib(i);\n  if (q !== null && q < 1) return 'contra';\n  if (q !== null && q >= CIV_QPQS_CIERRE) return 'cierre';\n  if (q !== null && q < CIV_QPQS_CIERRE) return 'exp';\n  return null;\n}",
    "function _civConducta(i) {\n  const q = _ccQpQsAtrib(i);\n  if (q !== null && q < 1) return 'contra';\n  const d = _ccDdviIdx(i);\n  if ((q !== null && q >= CIV_QPQS_CIERRE) || (d !== null && d > 32)) return 'cierre';\n  if (q !== null && q < CIV_QPQS_CIERRE && d !== null && d <= 32) return 'exp';\n  return null;\n}")]),

 ('08 B3: la cita vuelve a listar el corte retirado entre los criterios propios', 'TC-759',
  [("         'aplica —los síntomas atribuibles al shunt y el Qp/Qs como criterio general de cierre— ' +\n         'son un criterio propio de la aplicación. Esta referencia no publica nivel de evidencia.' },",
    "         'aplica —los síntomas atribuibles al shunt, el Qp/Qs y el corte de DDVI indexado > 32 mm/m²— ' +\n         'son un criterio propio de la aplicación. Esta referencia no publica nivel de evidencia.' },")]),

 # ══ B4 — LOS CUATRO TRAMOS DEL VELO POSTERIOR ═════════════════════════════════════════════
 ('09 B4: el velo posterior vuelve al corte unico de 7 mm', 'TC-86,TC-507',
  [("    c1b: lvp  !== null ? C('teer-c1b','Velo posterior — complejidad del agarre', lvp > 10,",
    "    c1b: lvp  !== null ? C('teer-c1b','Velo posterior — complejidad del agarre', lvp >= 7,")]),

 ('10 B4: el borde de 7 se resuelve hacia ARRIBA (7,0 pasa a muy complejo)', 'TC-86',
  [("  if (mm >= 7) return 'agarre complejo';",
    "  if (mm > 7) return 'agarre complejo';")]),

 ('11 B4: el borde de 5 se resuelve hacia ARRIBA (5,0 pasa a dificil)', 'TC-86',
  [("  if (mm >= 5) return 'agarre muy complejo';",
    "  if (mm > 5) return 'agarre muy complejo';")]),

 ('12 B4: el tramo de «no complejo» se come al de «complejo»', 'TC-86,TC-507',
  [("  if (mm > 10) return 'agarre no complejo';",
    "  if (mm >= 7) return 'agarre no complejo';")]),

 # ══ B5 — EL TETHERING COMO CONDICION DEL CLIP ═════════════════════════════════════════════
 ('13 B5: el criterio del clip deja de exigir tethering', 'TC-648',
  [("    c4:  (aplSec  && profFlail  !== null && profFlail  > 0 && hayTethering) ? C('teer-c4',",
    "    c4:  (aplSec  && profFlail  !== null && profFlail  > 0) ? C('teer-c4',")]),

 ('14 B5: el tethering se lee de UNA sola puerta y no de las dos', 'TC-507,TC-648',
  [("  const hayTethering = _tethCarp === 'IIIb' || _tethMec === 'tethering';",
    "  const hayTethering = _tethMec === 'tethering';")]),

 ('15 B5: el tethering falla ABIERTO -- sin consignarlo se da por presente', 'TC-648',
  [("  const hayTethering = _tethCarp === 'IIIb' || _tethMec === 'tethering';",
    "  const hayTethering = true;")]),

 ('16 B5: el rotulo del clip deja de decir su procedimiento', 'TC-507',
  [('<span class="calc-lbl">Profundidad de coaptación &lt;11mm — clip, con tethering</span>',
    '<span class="calc-lbl">Profundidad de coaptación &lt;11mm</span>')]),

 ('17 B5: la altura de tenting vuelve a colgar de una guia en el pie', 'TC-507',
  [("La altura de tenting no figura en esa tabla: su corte de 10 mm es un criterio propio de esta aplicación.'",
    "La altura de tenting no figura en esa tabla: su corte de 10 mm es el de la ESC/EACTS 2025, material suplementario, Tabla S2 (hoja 5), para el TEER.'")]),

 # ══ C1 — LAS TRES CASILLAS DE LA TABLA 4 ══════════════════════════════════════════════════
 ('18 C1: la valvulopatia severa vuelve a pesar con anti-VEGF (el defecto de D2-a)', 'TC-556',
  [("    hfaicos_cv_vhd:    { antracicline:'H',  trastuzumab:'H',  vegf:null, bcr_abl:null,  mieloma:null, raf_mek:'H' },",
    "    hfaicos_cv_vhd:    { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:null,  mieloma:null, raf_mek:'H' },")]),

 ('19 C1: la angina estable deja de pesar con anti-VEGF', 'TC-556',
  [("    hfaicos_cv_angina: { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:null,  mieloma:null, raf_mek:'H' },",
    "    hfaicos_cv_angina: { antracicline:'H',  trastuzumab:'H',  vegf:null, bcr_abl:null,  mieloma:null, raf_mek:'H' },")]),

 ('20 C1: el infarto pierde su peso con BCR-ABL y pasa a contar', 'TC-556',
  [("    hfaicos_cv_mi:     { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:null,  mieloma:null, raf_mek:'H' },",
    "    hfaicos_cv_mi:     { antracicline:'H',  trastuzumab:'H',  vegf:'VH', bcr_abl:'H',   mieloma:null, raf_mek:'H' },")]),

 ('21 C1: el grupo CV deja de contar una sola vez y cambia la escala del puntaje propio', 'TC-101',
  [("function _hfaicosCvGrupo() { return ['hfaicos_cv_ic', 'hfaicos_cv_vhd', 'hfaicos_cv_mi',\n                                     'hfaicos_cv_angina', 'hfaicos_cv_arrit']; }",
    "function _hfaicosCvGrupo() { return ['hfaicos_cv_ic']; }")]),

 ('22 C1: el maximo deja de saltear las casillas nuevas y sube de 13', 'TC-101',
  [("    if (f.id === 'hfaicos_cv_vhd' || f.id === 'hfaicos_cv_mi' ||\n        f.id === 'hfaicos_cv_angina' || f.id === 'hfaicos_cv_arrit') return t;  // el grupo vale 2 en total",
    "    if (f.id === 'hfaicos_cv_arrit') return t;")]),

 # ══ D1 — EL COR TRIATRIATUM ═══════════════════════════════════════════════════════════════
 ('23 D1: el cor triatriatum deja de subir al EN SUMA', 'TC-911,TC-499',
  [("  Object.freeze({ id: 'otr_var_cortri',    def: 'Cor triatriatum',                                    suma: 'Cor triatriatum', sumaNota: true })",
    "  Object.freeze({ id: 'otr_var_cortri',    def: 'Cor triatriatum',                                    suma: null })")]),

 ('24 D1: el EN SUMA pierde la nota y sube el nombre solo', 'TC-911',
  [("               suma: h.suma ? (h.suma + ((h.sumaNota && n) ? ' ' + n : '') + '.') : null });",
    "               suma: h.suma ? (h.suma + '.') : null });")]),

 ('25 D1: la caja de nota deja de aparecer al marcar la casilla', 'TC-911',
  [("  'otr_var_tendones', 'otr_var_lambl', 'otr_var_senocor', 'otr_var_vcsip', 'otr_var_cortri']);",
    "  'otr_var_tendones', 'otr_var_lambl', 'otr_var_senocor', 'otr_var_vcsip']);")]),
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
                       cwd=WT, capture_output=True, text=True, timeout=1800)
    out = r.stdout + r.stderr
    subprocess.run(['pkill', '-f', 'ecosmart-test-'], capture_output=True)
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
