#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_aj1.py — barrido de MUTACIONES DIRIGIDAS de la TANDA AJUSTES-1 (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits 1 a 5 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-554 se ponga ROJO.

  python3 scripts/_mut_aj1.py              # todas
  python3 scripts/_mut_aj1.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
⚠️ TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 06 hace que el recuadro del
   Doppler no se dibuje NUNCA —ni con velocidad cargada—, la 09 que el resumen de la orejuela
   salga tambien sobre un estudio sin un solo dato, y la 12 que la frase de la bicuspide se
   publique sobre una valvula que NO es bicuspide. Existen porque las condiciones que las matan
   son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta
   probando nada.
⚠️ LA 05 ROMPE EL DUEÑO UNICO POR UN SOLO LADO, A PROPOSITO: el emisor deja de acortar el
   lienzo y `_oaiEsqAlto()` sigue devolviendo 262. Es la mutacion que prueba que tener el alto
   escrito en DOS lugares produce una imagen reescalada, y la mata la condicion (A9), que
   compara el alto del SVG de la pantalla contra el dueño.
⚠️ LA 10 ROMPE LAS DOS MITADES DE LA MAQUETA DE LA VAB A LA VEZ —el ancho del dibujo y la
   columna de la tabla—, que es la leccion del D-11: con una sola rota, la otra la tapa.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-554'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # ══ COMMIT 1 · la orejuela ═════════════════════════════════════════
 ('01 el cactus recupera «— riesgo intermedio» en su rotulo',
  '<option value="cactus">Cactus</option>',
  '<option value="cactus">Cactus \u2014 riesgo intermedio</option>'),

 ('02 vuelve al papel «Considerar mayor complejidad para el cierre percutaneo»',
  "      const sN = 'En el estudio transesof\u00e1gico, ' + s.charAt(0).toLowerCase() + s.slice(1);",
  "      if (oLob === '3') s += ' Considerar mayor complejidad para el cierre percut\u00e1neo.';\n"
  "      const sN = 'En el estudio transesof\u00e1gico, ' + s.charAt(0).toLowerCase() + s.slice(1);"),

 ('03 vuelve la rama del trombo a la pastilla: «NO apto — trombo presente»',
  "  if (diam || prof) {\n    /* ══ EL BADGE DEJA DE DAR UN VEREDICTO POR RANGO",
  "  if (trombo === 'si') {\n    el.innerHTML = badge('red','NO apto \u2014 trombo presente');\n"
  "  } else if (diam || prof) {\n    /* ══ EL BADGE DEJA DE DAR UN VEREDICTO POR RANGO"),

 ('04 el recuadro del Doppler vuelve a dibujarse SIEMPRE, con su «sin velocidad cargada»',
  "  const HH = v ? OAI_ESQ_H : OAI_ESQ_H_SD;\n  if (v) {",
  "  const HH = OAI_ESQ_H;\n  if (true) {"),

 ('05 el EMISOR deja de acortar el lienzo y el dueño sigue diciendo 262: la imagen se reescala',
  "  const HH = v ? OAI_ESQ_H : OAI_ESQ_H_SD;",
  "  const HH = OAI_ESQ_H;"),

 ('06 DE MAS: el recuadro del Doppler no se dibuja NUNCA, ni con velocidad cargada',
  "  const HH = v ? OAI_ESQ_H : OAI_ESQ_H_SD;\n  if (v) {",
  "  const HH = OAI_ESQ_H_SD;\n  if (false) {"),

 # ══ COMMIT 2 · el PDF ═══════════════════════════════════════════
 ('07 el dibujo vuelve a repetirse: no se saca de la pagina «Imagenes del estudio»',
  "      _oaiSlotUsado = _esqI;",
  "      _oaiSlotUsado = -1;"),

 ('08 el dibujo deja de ir junto a su tabla: la seccion no recibe su imagen',
  "      _secOAI.img = { dataURL: _d, w: _w, h: _h };",
  "      _secOAI.imgNO = { dataURL: _d, w: _w, h: _h };"),

 ('09 DE MAS: el resumen de la orejuela se dibuja tambien sin un solo dato cargado',
  "      const _oaiRes = (typeof oaiResumenPDF === 'function') ? (oaiResumenPDF() || []) : [];",
  "      const _oaiRes = [['Morfolog\u00eda', '\u2014'], ['Ostium', '\u2014'], ['Profundidad', '\u2014'],\n"
  "                      ['Vel. de vaciamiento', '\u2014'], ['Contraste espont\u00e1neo', '\u2014']];"),

 ('10 la VAB vuelve al dibujo CENTRADO de 70 mm con la tabla DEBAJO (las dos mitades a la vez)',
  [("        const _vW = 48, _vH = _vW;\n        const _vTabX = mL + _vW + 8;",
    "        const _vW = 70, _vH = _vW;\n        const _vTabX = mL;"),
   ("        let _vTy = _vY0 + 4;",
    "        let _vTy = _vY0 + _vH + 5;"),
   ("        doc.addImage(_vData, 'PNG', mL, _vY0, _vW, _vH);",
    "        doc.addImage(_vData, 'PNG', mL + (pgW - _vW) / 2, _vY0, _vW, _vH);")]),

 # ══ COMMIT 3 · el EN SUMA ══════════════════════════════════════
 ('11 la bicuspide deja de nombrarse: el dueño de la frase devuelve null siempre',
  "  if (sv2('va_morf') !== VAB_MORF_BIC) return null;",
  "  if (true) return null;"),

 ('12 DE MAS: la frase sale tambien cuando la valvula NO es bicuspide',
  "  if (sv2('va_morf') !== VAB_MORF_BIC) return null;",
  "  if (false) return null;"),

 # ══ COMMIT 4 · la cita ══════════════════════════════════════════
 ('13 el rotulo del gradiente vuelve a «sin fuente verificada» y pierde sus dos folios',
  "    { txt:'CRITERIO DE ECOSMART, respaldado en parte por la ASE 2025. Con la velocidad de '",
  "    { txt:'CRITERIO DE ECOSMART \u2014 sin fuente verificada en la biblioteca. Con la velocidad de '"),

 # ══ COMMIT 5 · la fila de miniaturas ═════════════════════════════════
 ('14 la ✕ de una captura BORRA el slot en vez de sacarla solo del PDF',
  "  imgSlots[i].noPdf = true;",
  "  imgSlots[i] = null;"),
]

def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

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
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
