#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_img3.py — barrido de MUTACIONES DIRIGIDAS de la TANDA IMAGENES-3 (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1 a 5 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-558 o TC-559 se ponga
ROJO.

  python3 scripts/_mut_img3.py              # todas
  python3 scripts/_mut_img3.py --solo 1,2   # un grupo

SE CORRE EN UN WORKTREE O EN UNA COPIA, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 02 le pone `autoplay` al video
—que es lo que `prefers-reduced-motion` prohibe—, la 03 esconde «Medir» tambien sobre una
IMAGEN, la 06 hace que el PPT del ESTUDIO acepte el poster de un video —y entonces el poster
entra DOS veces en ese mazo, una como imagen y otra dentro de su diapositiva— y la 14 le
devuelve a la linea de la mitral el grado CRUDO, que publica «Insuficiencia mitral · 0».
Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo
que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASOS = ['TC-558', 'TC-559']

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # ══ PARTE A · el visor ════════════════════════════════════════════════════════════════
 ('01 el video deja de repetir: sale `loop` del elemento',
  '<video id="ig-imgv-vid" loop muted playsinline preload="metadata"',
  '<video id="ig-imgv-vid" muted playsinline preload="metadata"'),

 ('02 DE MAS: el video arranca SOLO (autoplay), contra prefers-reduced-motion',
  '<video id="ig-imgv-vid" loop muted playsinline preload="metadata"',
  '<video id="ig-imgv-vid" loop muted autoplay playsinline preload="metadata"'),

 ('03 DE MAS: «Medir» se esconde tambien sobre una IMAGEN',
  "  if (bmed) bmed.style.display = (tapa || (meta && meta.video)) ? 'none' : '';",
  "  if (bmed) bmed.style.display = 'none';"),

 ('04 «Medir» vuelve a aparecer sobre un VIDEO',
  "  if (bmed) bmed.style.display = (tapa || (meta && meta.video)) ? 'none' : '';",
  "  if (bmed) bmed.style.display = tapa ? 'none' : '';"),

 ('05 el PPT de imagenes vuelve a dejar el video AFUERA',
  "  return !!(sl && sl.dataURL && (typeof _imgSrcOK !== 'function' || _imgSrcOK(sl.dataURL)));",
  "  return !!(sl && sl.dataURL && !sl.videoId && (typeof _imgSrcOK !== 'function' || _imgSrcOK(sl.dataURL)));"),

 ('06 DE MAS: el PPT del ESTUDIO acepta el poster y lo mete dos veces',
  "function _pptEsImagen(s) { return !!(s && s.dataURL && !s.videoId && _imgSrcOK(s.dataURL)); }",
  "function _pptEsImagen(s) { return !!(s && s.dataURL && _imgSrcOK(s.dataURL)); }"),

 ('07 el aviso de tamanio del archivo baja de 100 a 10 MB',
  "const PPT_PPTX_AVISO_MB = 100;",
  "const PPT_PPTX_AVISO_MB = 10;"),

 ('08 el aviso de privacidad deja de nombrar los videos',
  "      (nVid ? ' Hay ' + nVid + ' video(s) entre lo elegido: de un video va sólo su primer cuadro, ' +",
  "      (false ? ' Hay ' + nVid + ' video(s) entre lo elegido: de un video va sólo su primer cuadro, ' +"),

 # ══ PARTE B · el motor de tercios ═════════════════════════════════════════════════════
 ('09 la lista de excluidos se vacia: el jet post-TAVI va junto a la bicuspide',
  "const PDF_DIAG_EXC = Object.freeze([['tavi', 'vab']]);",
  "const PDF_DIAG_EXC = Object.freeze([]);"),

 ('10 el orden del registro se invierte',
  "  const sel = PDF_DIAG_REG.filter(function (d) { return claves.indexOf(d.k) >= 0 });",
  "  const sel = PDF_DIAG_REG.slice().reverse().filter(function (d) { return claves.indexOf(d.k) >= 0 });"),

 ('11 las capturas se acomodan ANTES de los diagramas',
  "      const dos = (k + 1 < caps.length && !caps[k + 1].ampliada) ? [caps[k], caps[k + 1]] : [caps[k]];\n      items.push({ t:'cap', h:PDF_DIAG_U, ids:dos, full:false, primera:k === 0 });",
  "      const dos = (k + 1 < caps.length && !caps[k + 1].ampliada) ? [caps[k], caps[k + 1]] : [caps[k]];\n      items.unshift({ t:'cap', h:PDF_DIAG_U, ids:dos, full:false, primera:k === 0 });"),

 ('12 una captura AMPLIADA deja de ocupar la franja entera',
  "    if (caps[k].ampliada) { items.push({ t:'cap', h:PDF_DIAG_U, ids:[caps[k]], full:true, primera:k === 0 }); k++; }",
  "    if (caps[k].ampliada) { items.push({ t:'cap', h:PDF_DIAG_U, ids:[caps[k]], full:false, primera:k === 0 }); k++; }"),

 ('13 la hoja pasa a tener DOS franjas en vez de tres',
  "const PDF_DIAG_FRANJAS = 3;",
  "const PDF_DIAG_FRANJAS = 2;"),

 ('14 DE MAS: la linea de la mitral vuelve a leer el grado CRUDO',
  "  const _ng = (typeof _oaiImGrado === 'function') ? _oaiImGrado() : 0;\n  const grado = _ng ? ((typeof _CC_GRADO === 'object' && _CC_GRADO[String(_ng)]) || String(_ng)) : '';",
  "  const grado = _sv('im_grado');"),
]

def correr():
    rojo_total, detalle, corrio = False, [], False
    for c in CASOS:
        r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', c],
                           cwd=RAIZ, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        if 'RESULTADO' not in out:
            detalle.append(c + ': NO CORRIO')
            continue
        corrio = True
        m = re.search(r'RESULTADO: (\d+)/(\d+)', out)
        nC = len(re.findall(r'condicion:', out))
        if m and m.group(1) == '0':
            rojo_total = True
            detalle.append('%s ROJO (%d cond.)' % (c, nC))
        else:
            detalle.append('%s verde' % c)
    if not corrio:
        return 'NO CORRIO', ' · '.join(detalle)
    return ('MUERTA' if rojo_total else 'SOBREVIVIO'), ' · '.join(detalle)

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, (nom, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            n = orig.count(viejo)
            if n != 1:
                res.append((i, nom, 'NO APLICA', 'apariciones: %d' % n))
                print('  %02d  NO APLICA  %s (apariciones %d)' % (i, nom, n), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo))
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)[:140]
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  (%s)' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for r in res if r[2] == 'MUERTA')
    print('\n  %d/%d MUERTAS' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('  !! %02d %s -> %s %s' % (i, nom, v, det[:160]))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
