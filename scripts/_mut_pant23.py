#!/usr/bin/env python3
"""_mut_pant23.py - barrido de mutaciones dirigidas de la tanda PANT-23.

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
 # == COMMIT 2 - EL ORDEN DE LOS BLOQUES =======================================
 ('01 vuelve la compuerta: el recuadro solo sale en las de protesis y desaparece de las otras 17', 'TC-754,TC-747',
  [("  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);",
    "  if (r.adapt && ordenProt) h += _indAdaptHTML(r.adapt, r.faltan);")]),
 ('02 vuelve el orden viejo: el recuadro se emite ARRIBA de la grilla', 'TC-754,TC-747,TC-756',
  [("  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);", "  /* movido arriba */"),
   ("  h += '<div data-ind-grid=\"1\"' + (hayClin ? ' data-ind-dos=\"1\"' : '') +",
    "  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);\n  h += '<div data-ind-grid=\"1\"' + (hayClin ? ' data-ind-dos=\"1\"' : '') +")]),
 ('03 el recuadro se emite en los DOS lugares: sale dos veces y sus corchetes se numerarian dos veces', 'TC-754',
  [("  h += '<div data-ind-grid=\"1\"' + (hayClin ? ' data-ind-dos=\"1\"' : '') +",
    "  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);\n  h += '<div data-ind-grid=\"1\"' + (hayClin ? ' data-ind-dos=\"1\"' : '') +")]),
 ('04 el recuadro baja DESPUES del Ver detalle del pie', 'TC-754',
  [("  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);", "  /* movido al pie */"),
   ("  h += _indBiblioHTML(_indRefCtx);",
    "  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);\n  h += _indBiblioHTML(_indRefCtx);")]),
 ('05 la bibliografia deja de ser lo ultimo de la seccion', 'TC-754,TC-322',
  [("  h += _bloRec();\n  if (!r.adapt) h += _causasH;",
    "  h += _indBiblioHTML(_indRefCtx);\n  h += _bloRec();\n  if (!r.adapt) h += _causasH;")]),
 ('06 el MODELO pierde su orden: su recomendacion sale ANTES del cuerpo', 'TC-754',
  [("  if (r.molde) {\n    h += _indMoldeHTMLSec(r, compacta);\n    h += (r.recom ? _indRecomHTML(r.recom) : '');",
    "  if (r.molde) {\n    h += (r.recom ? _indRecomHTML(r.recom) : '');\n    h += _indMoldeHTMLSec(r, compacta);")]),
 ('07 una seccion SIN adapt recibe un recuadro inventado', 'TC-754',
  [("  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);",
    "  if (r.adapt || r.filas) h += _indAdaptHTML(r.adapt || [], r.faltan);")]),
 # La 08 PRIMERA VERSION -poner el const ordenProt en true- sobrevivio y es EQUIVALENTE, medido:
 # despues del commit 2 ese const se usa en UN solo lugar, _causasH, y las unicas secciones con
 # r.causas son las de protesis, que ya lo traen en true. O sea que mutarlo no cambia un nodo.
 # Lo que SI es observable, y es el invariante que la orden protege -no mover la maqueta de las
 # secciones de seis o menos preguntas-, es darles el molde de preguntas a las que no lo piden.
 ('08 el molde de preguntas se le da a TODAS las secciones y la maqueta de 25 de ellas cambia', 'TC-754',
  [("  const esPreg = !!(r.preguntas || r.ordenProt);", "  const esPreg = true;")]),
 ('09 el rotulo del recuadro cambia y el censo deja de encontrarlo', 'TC-754,TC-720',
  [("return _indCajaReco(col, 'Con lo contestado' + (xs.length ? ' (' + xs.length + ')' : ''), c);",
    "return _indCajaReco(col, 'Lo adaptado' + (xs.length ? ' (' + xs.length + ')' : ''), c);")]),
 ('10 el bloque de causas se emite ANTES del recuadro', 'TC-742',
  [("  const _causasH = (ordenProt && r.causas) ? _indCausasHTML(r.causas, r.causasNota) : '';\n  if (r.adapt) h += _causasH;",
    "  const _causasH = (ordenProt && r.causas) ? _indCausasHTML(r.causas, r.causasNota) : '';\n  if (r.adapt) h = h.replace('</div>', '</div>' + _causasH);")]),
 ('11 IND_SECS pierde la coartacion: una seccion menos', 'TC-756,TC-322',
  [("  { tit:'Coartación de aorta',                   fn:_indCoAo },", "")]),
 ('12 IND_SECS gana una seccion duplicada: una mas', 'TC-756,TC-322',
  [("  { tit:'Ductus arterioso permeable',            fn:_indDAP },",
    "  { tit:'Ductus arterioso permeable',            fn:_indDAP },\n  { tit:'Ductus arterioso repetido',             fn:_indDAP },")]),
 # == COMMIT 3 - EL CAJON DEL GLOBO ============================================
 ('13 vuelve la acotacion: el cajon solo flota en las secciones de preguntas', 'TC-755,TC-756',
  [("#indic-card [data-ind-grid] [data-ind-info][open] > div{",
    "#indic-card [data-ind-grid][data-ind-preg=\"1\"] [data-ind-info][open] > div{")]),
 ('14 vuelve la acotacion SOLO en el bloque de contencion: el cajon flota en el lugar equivocado', 'TC-755',
  [("#indic-card [data-ind-grid] td:nth-child(3){position:relative}",
    "#indic-card [data-ind-grid][data-ind-preg=\"1\"] td:nth-child(3){position:relative}")]),
 ('15 el bloque de contencion se mueve a otra celda', 'TC-755',
  [("#indic-card [data-ind-grid] td:nth-child(3){position:relative}",
    "#indic-card [data-ind-grid] td:nth-child(2){position:relative}")]),
 ('16 el cajon deja de ser absoluto: vuelve a dibujarse dentro de la celda', 'TC-755',
  [("#indic-card [data-ind-grid] [data-ind-info][open] > div{\n  position:absolute;right:0;top:100%;z-index:3;",
    "#indic-card [data-ind-grid] [data-ind-info][open] > div{\n  position:static;right:0;top:100%;z-index:3;")]),
 ('17 el cajon pierde su ancho y el texto vuelve a una tira angosta', 'TC-755',
  [("  width:600px;max-width:76vw;margin-top:2px;", "  width:auto;max-width:76vw;margin-top:2px;")]),
 ('18 el cajon pierde su z-index y queda debajo de las filas siguientes', 'TC-755',
  [("  position:absolute;right:0;top:100%;z-index:3;", "  position:absolute;right:0;top:100%;z-index:auto;")]),
 ('19 el cajon deja de colgar de su fila y se pega arriba de ella', 'TC-755',
  [("  position:absolute;right:0;top:100%;z-index:3;", "  position:absolute;right:0;top:-400px;z-index:3;")]),
 ('20 se va el tope de ancho de la grilla de dos columnas y el cajon se dibuja fuera del panel', 'TC-756',
  [("[data-ind-info][open] > div{max-width:360px}", "[data-ind-info][open] > div{max-width:600px}")]),
 ('21 las reglas del alto de la botonera pierden su acotacion', 'TC-756,TC-537',
  [("#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn{min-height:32px;min-width:0;position:relative}",
    "#indic-card .ind-ctrl-btn{min-height:32px;min-width:0;position:relative}")]),
 # == COMMIT 3 - EL EMISOR DEL GLOBO Y SU CIERRE ===============================
 ('22 el globo pierde su marca data-ind-info y ninguna regla lo alcanza', 'TC-755,TC-756,TC-293',
  [("  return ' <details data-ind-info=\"1\" style=\"display:inline-block;vertical-align:top;\">' +",
    "  return ' <details style=\"display:inline-block;vertical-align:top;\">' +")]),
 ('23 la nota deja de plegarse y no hay globos que abrir', 'TC-755,TC-756,TC-537',
  [("  const plegar = !!f.nota && (compacta || (!!f.ctrl && f.marca !== 'alarm' && f.marca !== 'warn'));",
    "  const plegar = false;")]),
 ('24 el globo pierde su etiqueta accesible', 'TC-755',
  [("    '<summary aria-label=\"Ver la explicación de: ' + _critEsc(lbl) + '\" aria-expanded=\"false\" ' +",
    "    '<summary aria-label=\"\" aria-expanded=\"false\" ' +")]),
 ('25 el globo nace declarando que esta abierto', 'TC-755',
  [("    '<summary aria-label=\"Ver la explicación de: ' + _critEsc(lbl) + '\" aria-expanded=\"false\" ' +",
    "    '<summary aria-label=\"Ver la explicación de: ' + _critEsc(lbl) + '\" aria-expanded=\"true\" ' +")]),
 ('26 abrir un globo deja de cerrar el otro: se tapan entre ellos', 'TC-755',
  [("      _indInfoCerrar(d);\n      setTimeout(_indInfoSync, 0);",
    "      setTimeout(_indInfoSync, 0);")]),
 ('27 tocar afuera deja de cerrar el cajon', 'TC-755',
  [("      if (!d) { _indInfoCerrar(null); return; }", "      if (!d) { return; }")]),
 ('28 Escape deja de cerrar el cajon', 'TC-755',
  [("      const hay = _indInfoTodas().some(function (d) { return !!d.open });\n      if (!hay) return;\n      _indInfoCerrar(null);",
    "      const hay = _indInfoTodas().some(function (d) { return !!d.open });\n      if (!hay) return;")]),
 ('29 el cajon se queda sin texto: el globo abre vacio', 'TC-755,TC-756',
  [("    '<div style=\"margin-top:4px;\">' + htmlInterno + '</div></details>';",
    "    '<div style=\"margin-top:4px;\"></div></details>';")]),
 ('30 el globo sale de la tercera celda y se emite pegado al rotulo', 'TC-756',
  [("      (f.term ? _indTermBtnHTML(f.term) : '') +",
    "      (f.term ? _indTermBtnHTML(f.term) : '') + (f.nota ? _indInfoHTML(f.lbl, _critEsc(f.nota)) : '') +")]),
 # == EL SECTOR QUE EL MEDICO REPORTO ==========================================
 ('31 el perfil hemodinamico pierde su sector y su seccion no aparece', 'TC-755,TC-748',
  [("{ tit:'Perfil hemodinámico — presiones y resistencias estimadas por eco', fn:_indHemo, av:'hemo' },",
    "{ tit:'Perfil hemodinámico — presiones y resistencias estimadas por eco', fn:_indHemo, av:'noExiste' },")]),
 ('32 el glosario del panel pierde su marca y se confunde con la nota', 'TC-756',
  [("  return ' <button type=\"button\" data-ind-term=\"' + _critEsc(id) + '\"' +",
    "  return ' <button type=\"button\" data-ind-termX=\"' + _critEsc(id) + '\"' +")]),
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
