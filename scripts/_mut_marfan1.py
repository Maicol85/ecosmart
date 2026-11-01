#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_marfan1.py - barrido de MUTACIONES DIRIGIDAS de la TANDA MARFAN-1 (2026-11-01).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_marfan1.py              # las dieciseis
  python3 scripts/_mut_marfan1.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cinco por cada una: TC-586 cubre el score,
TC-587 las siete reglas, TC-588 el papel y el round-trip, TC-589 la pantalla y los globos, y
TC-590 la figura. Una mutacion del commit 1 que pusiera rojo a TC-590 estaria diciendo que el
reparto esta mal, no que la cobertura exista.

CUATRO DE LAS DIECISEIS NO REVIERTEN NADA: LA APLICAN DE MAS. La 06 vuelve a meter la ectopia
lentis en el puntaje, la 09 hace que el asterisco se exija tambien en las reglas 2, 4 y 5, la
13 deja que la regla cumplida se filtre al papel y la 16 hace que la casilla de la figura sea
un campo guardado. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un
control negativo que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)
MUT = [
 # ── COMMIT 1: el score sistemico del Box 2 ───────────────────────────────────────────────
 ('01 el maximo vuelve a escribirse a mano y se desfasa de la tabla', 'TC-586',
  "var MFS_SCORE_MAX = MFS_SCORE.reduce(function(a, r){ return a + (r.t === 'sel' ? r.max : r.p); }, 0);",
  "var MFS_SCORE_MAX = 19;"),

 ('02 los dos signos de la mano vuelven a valer lo mismo que uno solo', 'TC-586',
  "    ops:[['ambos','Los dos signos', 3, 'signos de la muñeca y del pulgar'],",
  "    ops:[['ambos','Los dos signos', 1, 'signos de la muñeca y del pulgar'],"),

 ('03 el retropie vuelve a valer 1, como el pie plano simple', 'TC-586',
  "    ops:[['retropie','Deformidad del retropié', 2], ['plano','Pie plano simple', 1]] },",
  "    ops:[['retropie','Deformidad del retropié', 1], ['plano','Pie plano simple', 1]] },"),

 ('04 un valor sin equivalente vuelve a contarse como si fuera valido', 'TC-586',
  "    if (!op) { sinEq.push({ c:r.c, rot:r.rot, val:v }); return; }",
  "    if (!op) { pts += 1; return; }"),

 ('05 la guarderia se vacia al poblarse y se lleva la figura', 'TC-590',
  "  var fig = document.getElementById('mfs-bloque-figura');\n"
  "  if (fig) { g.insertBefore(bs, fig); g.insertBefore(ba, fig); }\n"
  "  else { g.appendChild(bs); g.appendChild(ba); }",
  "  while (g.firstChild) g.removeChild(g.firstChild);\n  g.appendChild(bs); g.appendChild(ba);"),

 # DE MAS: la ectopia lentis vuelve al puntaje, que es el defecto que esta tanda cierra
 ('06 DE MAS: la ectopia lentis vuelve a sumar 3 puntos al score', 'TC-586',
  "  { c:'mfs_prolapso',     t:'chk', p:1, i:'mfs-prolapso', rot:'Prolapso mitral (todos los tipos)' }\n];",
  "  { c:'mfs_prolapso',     t:'chk', p:1, i:'mfs-prolapso', rot:'Prolapso mitral (todos los tipos)' },\n"
  "  { c:'mfs_ectopia_lentis', t:'chk', p:3, rot:'Luxacion del cristalino' }\n];"),

 ('07 la devolucion deja los bloques en la tarjeta y el innerHTML se los lleva', 'TC-586',
  "  ['mfs-bloque-score', 'mfs-bloque-aparte', 'mfs-bloque-figura'].forEach(function (k) {\n"
  "    var b = document.getElementById(k);\n"
  "    if (b && b.parentElement !== g) g.appendChild(b);\n  });",
  "  /* mutante: no recoge nada */"),

 # ── COMMIT 2: las siete reglas ───────────────────────────────────────────────────────────
 ('08 una condicion desconocida vuelve a contar como condicion FALSA', 'TC-587',
  "  var falta = cond.filter(function (c) { return c.v === null; });\n"
  "  if (falta.length) return { estado: 'sin_dato', por: 'falta ' + falta.map(function (c) { return c.falta; }).join('; falta ') };",
  "  var falta = cond.filter(function (c) { return c.v === null; });\n"
  "  if (falta.length) return { estado: 'no', por: 'falta ' + falta.map(function (c) { return c.falta; }).join('; falta ') };"),

 # DE MAS: el asterisco en reglas que no lo llevan
 ('09 DE MAS: el asterisco se exige tambien en las reglas 2, 4 y 5', 'TC-587',
  "    { n: 2, fam: 'sin', txt: 'Raíz aórtica (Z ≥ 2 o disección) y variante de FBN1 causal',\n      cond: [cAo(2), tri(fb, 'variante de FBN1 causal', 'no hay variante de FBN1 causal', 'la variante de FBN1 causal')] },",
  "    { n: 2, fam: 'sin', txt: 'Raíz aórtica (Z ≥ 2 o disección) y variante de FBN1 causal',\n      cond: [cAo(2), tri(fb, 'variante de FBN1 causal', 'no hay variante de FBN1 causal', 'la variante de FBN1 causal'), cAst] },"),

 ('10 la regla 7 deja de mirar la edad y usa siempre Z 2', 'TC-587',
  "    var zMin = edad >= 20 ? 2 : 3;",
  "    var zMin = 2;"),

 ('11 la diseccion deja de hacer verdadera la condicion de la raiz', 'TC-587',
  "  var dis = mfsAparte(src, 'mfs_diseccion_raiz');\n  if (dis === 'si') return true;",
  "  var dis = mfsAparte(src, 'mfs_diseccion_raiz');"),

 ('12 las dos variantes de FBN1 se infieren una de la otra', 'TC-587',
  "    { n: 4, fam: 'sin', txt: 'Ectopia lentis y variante de FBN1 con asociación conocida a la aorta',\n      cond: [tri(el, 'ectopia lentis', 'no hay ectopia lentis', 'la ectopia lentis'),\n             tri(fbAo, 'variante de FBN1 asociada a la aorta', 'la variante de FBN1 no está asociada a la aorta', 'la variante de FBN1 asociada a la aorta')] },",
  "    { n: 4, fam: 'sin', txt: 'Ectopia lentis y variante de FBN1 con asociación conocida a la aorta',\n      cond: [tri((fbAo === 'si' || fb === 'si') ? 'no' : el, 'ectopia lentis', 'no hay ectopia lentis', 'la ectopia lentis'),\n             tri(fbAo, 'variante de FBN1 asociada a la aorta', 'la variante de FBN1 no está asociada a la aorta', 'la variante de FBN1 asociada a la aorta')] },"),

 # ── COMMIT 3: el papel ───────────────────────────────────────────────────────────────────
 # DE MAS: la regla cumplida se filtra al papel
 ('13 DE MAS: la regla cumplida se filtra al informe', 'TC-588',
  "        if (frases.length) { etePars.push(frases.join(' ')); ccMarcarParrafo(); }",
  "        if (typeof mfsReglas === 'function') { var _rg = mfsReglas();\n"
  "          if (_rg.algunaCumple) frases.push('Cumple criterios de Marfan.'); }\n"
  "        if (frases.length) { etePars.push(frases.join(' ')); ccMarcarParrafo(); }"),

 ('14 el papel vuelve a publicar el rotulo del selector y no el texto del rasgo', 'TC-588',
  "            ' (' + _mfsP.tildados.map(x => (x.papel || x.txt).charAt(0).toLowerCase() + (x.papel || x.txt).slice(1)).join(', ') + ').');",
  "            ' (' + _mfsP.tildados.map(x => x.txt.charAt(0).toLowerCase() + x.txt.slice(1)).join(', ') + ').');"),

 # ── COMMIT 4: la pantalla y el globo ─────────────────────────────────────────────────────
 ('15 el cuadro vuelve a publicar la clase en su etiqueta', 'TC-589',
  "  const ETQ = { cx_i:'Cirugía indicada', cx_iia:'Considerar cirugía',\n                cx_iib:'Puede considerarse', ",
  "  const ETQ = { cx_i:'Cirugía indicada — Clase I', cx_iia:'Considerar cirugía — Clase IIa',\n                cx_iib:'Puede considerarse — Clase IIb', "),

 # ── COMMIT 6: la figura ──────────────────────────────────────────────────────────────────
 # DE MAS: la casilla de la figura pasa a ser un campo guardado
 ('16 DE MAS: la casilla de la figura vuelve a ser un campo del estudio', 'TC-590',
  "|pop-esp-|tga-3d-|mfs-fig-|vd-triv|",
  "|pop-esp-|tga-3d-|vd-triv|"),

 ('17 la figura deja de seguir al campo y se queda con su primer estado', 'TC-590',
  "  mfsFigMarcas(); mfsFigAlt(); mfsFigRefSync(); _mfsFigKick();",
  "  if (!window.__mfsFigUnaVez) { window.__mfsFigUnaVez = 1; mfsFigMarcas(); mfsFigAlt(); mfsFigRefSync(); _mfsFigKick(); }"),

 ('18 los cambios de forma dejan de seguir al rasgo de la mano', 'TC-590',
  "    fing: S.mun === 3 ? 1.24 : (S.mun === 1 ? 1.12 : 1),\n"
  "    thumb: S.mun === 3 ? 1.45 : (S.mun === 1 ? 1.25 : 1),",
  "    fing: 1, thumb: 1,"),
]


def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion', out))
    if rojo and rojo.group(1) == '0':
        if nC == 0 and nE:
            return 'POR EXCEPCION', out[out.find('excepcion'):][:160]
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
            nom, caso = ent[0], ent[1]
            pares = ent[2] if isinstance(ent[2], list) else [(ent[2], ent[3])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c < 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-13s %-6s %s  (%s)' % (i, v, caso, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for r in res if r[2] == 'MUERTA')
    print('\n  %d/%d MUERTAS' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('  !! %02d %s -> %s %s' % (i, nom, v, det[:200]))
    return 0 if muertas == len(res) else 1


if __name__ == '__main__':
    sys.exit(main())
