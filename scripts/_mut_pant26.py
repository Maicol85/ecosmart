#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant26.py - barrido de mutaciones dirigidas de la tanda PANT-26 (2026-11-09).
Calcado de _mut_pant27.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con `--anclas` ANTES de correr el barrido.
Nombre propio: verificado con ls, no existia.

Rompe, una por una: el repintado de la capsula, la comparacion del area contra el modelo en la
TAVI con sus cortes, la condicion de 1 desvio del desajuste, la frase «con posible estenosis» y
su condicion, el EN SUMA de cada via, el desajuste que apaga «normofuncionante», la mitral sin
conclusion por fila, las cuatro declaraciones de criterio propio y los dos textos del 3D.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── D8 · LA CAPSULA QUE SE REPINTA (TC-769) ──────────────────────────────────
 ('01 vModTrasElegir vuelve a no existir', 'TC-769',
  [("function vModTrasElegir(pos){\n  if (pos !== 'va') return;\n  try { calcEADetalle(); } catch (e) {}\n}",
    "function _vModTrasElegirMuerta(pos){\n  if (pos !== 'va') return;\n  try { calcEADetalle(); } catch (e) {}\n}")]),
 ('02 vModTrasElegir existe pero no repinta nada', 'TC-769',
  [("  if (pos !== 'va') return;\n  try { calcEADetalle(); } catch (e) {}",
    "  if (pos !== 'va') return;\n  try { void 0; } catch (e) {}")]),
 ('03 vModTrasElegir sale temprano SIEMPRE', 'TC-769',
  [("  if (pos !== 'va') return;\n  try { calcEADetalle(); } catch (e) {}",
    "  if (pos !== 'xx') return;\n  try { calcEADetalle(); } catch (e) {}")]),
 # ── D2 · EL AREA CONTRA EL MODELO EN LA TAVI (TC-770) ────────────────────────
 ('04 eaProtEOAz vuelve a dejar la TAVI afuera', 'TC-770',
  [("  if (!(typeof valvEsProtesis === 'function' && valvEsProtesis(morf))) return null;\n  const E = (typeof vModEsperados === 'function') ? vModEsperados('va') : null;",
    "  if (morf !== 'Pr\u00f3tesis mec\u00e1nica' && morf !== 'Pr\u00f3tesis biol\u00f3gica') return null;\n  const E = (typeof vModEsperados === 'function') ? vModEsperados('va') : null;")]),
 ('05 el corte de «posible» del area se mueve de 1 a 1,5 DE', 'TC-770',
  [("const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -2 });",
    "const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1.5, signifMax: -2 });")]),
 ('06 el corte de «significativa» del area se mueve de 2 a 3 DE', 'TC-770',
  [("const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -2 });",
    "const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -3 });")]),
 # ⚠️ REESCRITA TRES VECES, y las dos primeras por una medicion, no por una lectura. El modo
 # MANUAL esta sacado por DOS guardas redundantes: `E.manual`, y `sd == null` cuatro lineas
 # despues —sus valores se construyen con desvio nulo—. Romper una sola deja la otra en pie y la
 # mutacion sobrevive sin que eso diga nada sobre la cobertura: es la leccion que CLAUDE.md ya
 # tiene escrita. Esta rompe LAS DOS, que es la unica forma de que el manual llegue a votar.
 ('07 eaProtEOAz deja de sacar el modo MANUAL por sus DOS guardas: pasaria a votar sin desvio', 'TC-770',
  [("  if (!E || E.manual || !E.vals || !E.vals.eoa) return null;",
    "  if (!E || !E.vals || !E.vals.eoa) return null;"),
   ("  if (ref == null || sd == null || !(+sd > 0)) return null;",
    "  if (ref == null) return null;")]),
 ('08 el area deja de entrar como eje independiente del flujo', 'TC-770',
  [("  const dep   = [nv.vmax, nv.gmed].filter(Boolean);\n  const indep = [nv.dvi, nv.eoa].filter(Boolean);",
    "  const dep   = [nv.vmax, nv.gmed].filter(Boolean);\n  const indep = [nv.dvi].filter(Boolean);")]),
 # ── D7 · LA CONDICION DE LA TABLA 7 (TC-771) ─────────────────────────────────
 ('09 el desvio de la nota al pie pasa de 1 a 2', 'TC-771',
  [("const EA_PROT_PPM_SD = 1;", "const EA_PROT_PPM_SD = 2;")]),
 ('10 la condicion deja de ser de valor absoluto: un area POR ENCIMA pasaria', 'TC-771',
  [("           dentro1DE: Math.abs(z) <= EA_PROT_PPM_SD,",
    "           dentro1DE: z <= EA_PROT_PPM_SD,")]),
 ('11 el predicado del desajuste vale SIEMPRE true: la condicion no se aplica', 'TC-771',
  [("    ppmDentro1DE: (_eoaZ === null) ? true : !!_eoaZ.dentro1DE,",
    "    ppmDentro1DE: true,")]),
 ('12 el predicado falla al reves: sin modelo deja de publicar el desajuste', 'TC-771',
  [("    ppmDentro1DE: (_eoaZ === null) ? true : !!_eoaZ.dentro1DE,",
    "    ppmDentro1DE: (_eoaZ === null) ? false : !!_eoaZ.dentro1DE,")]),
 ('13 el emisor del papel deja de mirar la condicion', 'TC-771',
  [("          && _eaProtP.nivel !== 'signif' && _eaProtP.ppmDentro1DE) {",
    "          && _eaProtP.nivel !== 'signif') {")]),
 # ── D1 · «CON POSIBLE ESTENOSIS» (TC-772) ────────────────────────────────────
 ('14 la frase vuelve a ser la vieja', 'TC-772',
  [("  frase:   'con posible estenosis',",
    "  frase:   'sin datos suficientes para graduar la estenosis prot\u00e9sica',")]),
 ('15 la frase gana la palabra «protesica», que la decision saca', 'TC-772',
  [("  frase:   'con posible estenosis',",
    "  frase:   'con posible estenosis prot\u00e9sica',")]),
 # ⚠️ RETIRADA, EQUIVALENTE DEMOSTRABLE. Sacar `P.pIndep == null` no cambia el comportamiento en
 # ningun estado alcanzable: con `nivel === 'faltan'` y `pDep` distinto de null, lo que falta es
 # el eje independiente -si estuviera medido, `indep` no estaria vacio y el nivel no seria
 # «faltan»-, asi que `pIndep` ya es null en las 24 escenas que la condicion toca. La linea se
 # escribio igual, y el comentario del codigo lo dice: esta ahi para que la condicion DIGA lo que
 # la decision dice y no dependa de una invariante de otra funcion. No hay caso que la pueda
 # matar, y un caso que no puede fallar no prueba nada. Declarada en docs/PENDIENTES.md -> P26-a.

 ('17 la condicion se extiende a la banda NORMAL del eje dependiente', 'TC-772',
  [("                     (P.pDep === 'posible' || P.pDep === 'signif');",
    "                     (P.pDep === 'posible' || P.pDep === 'signif' || P.pDep === 'normal');")]),
 ('18 la condicion se achica a «signif» y deja afuera la banda POSIBLE', 'TC-772',
  [("                     (P.pDep === 'posible' || P.pDep === 'signif');",
    "                     (P.pDep === 'signif');")]),
 ('19 la frase pierde el parentesis de medidas', 'TC-772',
  [("    frase   = EA_PROT_POSIBLE_SD.frase + med;",
    "    frase   = EA_PROT_POSIBLE_SD.frase;")]),
 ('20 el EN SUMA de la TAVI usa el esqueleto de la quirurgica', 'TC-772',
  [("      else if (_eaProtN.posibleSDTavi) suma.push(EA_PROT_POSIBLE_SD.suma);\n", "")]),
 ('21 el EN SUMA de la TAVI pierde su texto aprobado', 'TC-772',
  [("  suma:    'TAVI con posible estenosis.'", "  suma:    'TAVI con posible estenosis prot\u00e9sica.'")]),
 ('22 el resumen de la QUIRURGICA gana la palabra «protesica»', 'TC-772',
  [("  resumen: 'posible estenosis',", "  resumen: 'posible estenosis prot\u00e9sica',")]),
 ('23 la marca del EN SUMA de la TAVI alcanza tambien a la quirurgica', 'TC-772',
  [("    posibleSDTavi: _posibleSD && P.via === 'TAVI',", "    posibleSDTavi: _posibleSD,")]),
 # ── D3 · EL DESAJUSTE APAGA «NORMOFUNCIONANTE» (TC-773) ──────────────────────
 ('24 la guarda vuelve a no mirar el desajuste', 'TC-773',
  [("  const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' &&\n    P.ppm !== 'moderado' && P.ppm !== 'severo' && (function(){",
    "  const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' && (function(){")]),
 ('25 la guarda mira solo el severo y deja pasar el moderado', 'TC-773',
  [("    P.ppm !== 'moderado' && P.ppm !== 'severo' && (function(){",
    "    P.ppm !== 'severo' && (function(){")]),
 ('26 la guarda se apaga con CUALQUIER valor de ppm, incluido «no»', 'TC-773',
  [("    P.ppm !== 'moderado' && P.ppm !== 'severo' && (function(){",
    "    P.ppm == null && (function(){")]),
 # ── D5 · LA MITRAL SIN CONCLUSION POR FILA (TC-774) ──────────────────────────
 ('27 la conclusion por fila vuelve a la Tabla 11', 'TC-774',
  [("    e.textContent = val.toFixed(dec) + ' ' + uni + '  (' + esc + ')';",
    "    e.textContent = val.toFixed(dec) + ' ' + uni + '  (' + OBSTR_TXT[nivel] + ' \u00b7 ' + esc + ')';")]),
 ('28 la fila pierde la escala de referencia, que la decision CONSERVA', 'TC-774',
  [("    e.textContent = val.toFixed(dec) + ' ' + uni + '  (' + esc + ')';",
    "    e.textContent = val.toFixed(dec) + ' ' + uni;")]),
 ('29 la fila del AEO vuelve a concluir', 'TC-774',
  [("  if (R.eoa != null)        eoaTxt = R.eoa.toFixed(2) + ' cm\u00b2';",
    "  if (R.eoa != null)        eoaTxt = R.eoa.toFixed(2) + ' cm\u00b2' + (R.porEoa ? '  (' + OBSTR_TXT[R.porEoa] + ')' : '');")]),
 ('30 la fila del DVI vuelve a concluir', 'TC-774',
  [("      ((!R.porDvi && R.motivo) ? '  (no concluye: ' + R.motivo + ')' : '') +",
    "      (R.porDvi ? '  (' + OBSTR_TXT[R.porDvi] + ')' : (R.motivo ? '  (no concluye: ' + R.motivo + ')' : '')) +")]),
 # ── D4, D2, D6, D7 · LAS CUATRO DECLARACIONES (TC-775) ───────────────────────
 ('31 la declaracion de los cortes de la TAVI se pierde', 'TC-775',
  [("       'quir\u00fargica. Los cortes de gradiente y de DVI para la TAVI son los de la pr\u00f3tesis ' +\n       'quir\u00fargica: es un criterio de la aplicaci\u00f3n.',",
    "       'quir\u00fargica.',")]),
 ('32 vuelve la atribucion a la guia de esos cortes', 'TC-775',
  [("       'quir\u00fargica. Los cortes de gradiente y de DVI para la TAVI son los de la pr\u00f3tesis ' +\n       'quir\u00fargica: es un criterio de la aplicaci\u00f3n.',",
    "       'quir\u00fargica (ASE 2024, hoja 18, folio 19).',")]),
 ('33 la declaracion del area de la TAVI se pierde', 'TC-775',
  [("        ? ' La comparaci\u00f3n del \u00e1rea efectiva con la referencia del modelo es un criterio de la aplicaci\u00f3n.'",
    "        ? ''")]),
 ('34 la nota de la protesis pulmonar se pierde', 'TC-775',
  [("  'prot:pulmonar':   'Con velocidad o gradiente alterados, la aplicaci\u00f3n informa posible ' +\n    'obstrucci\u00f3n: es un criterio de la aplicaci\u00f3n.',", "")]),
 ('35 la declaracion de la condicion del desajuste se pierde', 'TC-775',
  [(" El desajuste se define con el \\u00e1rea efectiva dentro de 1 desv\\u00edo est\\u00e1ndar de la del modelo implantado. Con el modelo cargado, la aplicaci\\u00f3n lo comprueba.'", "'")]),
 # ── EL 3D DE CONGENITAS (TC-776) ─────────────────────────────────────────────
 ('36 el globo pierde el parrafo de «Segun el estudio» y su PDF', 'TC-776',
  [("       + 'Seg\u00fan el estudio: representa las lesiones cargadas en este estudio y puede incluirse '\n       + 'en el PDF.\\n'", "       + ''")]),
 ('37 el globo vuelve a decir que no entra al PDF', 'TC-776',
  [("    lee: 'Diagrama ilustrativo del coraz\u00f3n en 3D. Se puede girar, y al tocar una estructura se '",
    "    lee: 'Es de s\u00f3lo lectura: no entra al informe ni al PDF. Se puede girar, y al tocar una estructura se '")]),
 ('38 la linea de abajo vuelve a decir «todavia»', 'TC-776',
  [("  else if (r.falta.length) partes.push('Cargadas y no representadas en este diagrama: ' + r.falta.join(', ') + '.');",
    "  else if (r.falta.length) partes.push('Cargadas y no dibujadas todav\u00eda: ' + r.falta.join(', ') + '.');")]),
 ('39 la linea de abajo deja de nombrar las lesiones', 'TC-776',
  [("partes.push('Cargadas y no representadas en este diagrama: ' + r.falta.join(', ') + '.');",
    "partes.push('Cargadas y no representadas en este diagrama.');")]),
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
