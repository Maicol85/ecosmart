#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_marfan2.py - barrido de MUTACIONES DIRIGIDAS de la TANDA MARFAN-2 (2026-11-02).

Cada mutacion revierte UNA de las cosas que los commits 1 a 4 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_marfan2.py              # las dieciseis
  python3 scripts/_mut_marfan2.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cuatro por cada una: TC-591 cubre la
pantalla de la seccion y su globo, TC-592 la tarjeta, TC-593 la conclusion y la pastilla y
TC-594 el Z. Una mutacion del commit 1 que pusiera rojo a TC-594 estaria diciendo que el
reparto esta mal, no que la cobertura exista.

CUATRO DE LAS DIECISEIS NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 pone la lista de factores
DE VUELTA debajo del campo ADEMAS de en el globo, la 10 hace que la fila de «otros datos»
salga aunque no haya nada contestado, la 13 deja que la conclusion de pantalla se filtre al
papel y la 15 hace que el Z sea ademas una columna de Excel. Existen porque las condiciones
que las matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede
romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)
MUT = [
 # ── COMMIT 1: la seccion en columnas y el texto largo al globo ───────────────────────────
 ('01 los factores de riesgo salen de la columna del sindrome', 'TC-591',
  "            <div class=\"fg\"><label>Factores de riesgo</label>",
  "          </div>\n          <div class=\"mfs-subcol\">\n            <div class=\"fg\"><label>Factores de riesgo</label>"),

 ('02 el texto largo vuelve a publicarse debajo del campo', 'TC-591',
  "  f.appendChild(P((r.sind && _tieneClave(MARFAN_FR_TXT, r.sind)) ? MARFAN_FR_TXT[r.sind] : MARFAN_FR_SIN,\n                  'Qué cuenta como factor de riesgo:'));",
  "  /* mutante: la lista sale del globo */"),

 ('03 el globo vuelve a abrir hablando de un veredicto', 'TC-591',
  "  f.appendChild(P('La guía europea de enfermedades aórticas y vasculares periféricas de 2024 fija un ' +",
  "  f.appendChild(P('El veredicto de la izquierda se debe aplicar segun la guía, que se recomienda para el seguimiento. ' +"),

 ('04 el rotulo de la conclusion crece y deja de ser como los demas', 'TC-591',
  "  const el = document.getElementById('marfan-resultado'); if (!el) return;\n"
  "  while (el.firstChild) el.removeChild(el.firstChild);\n"
  "  const r = marfanEstado();\n"
  "  const fila = (lbl, nodo) => { const row = document.createElement('div'); row.className = 'calc-row';\n"
  "    const l = document.createElement('span'); l.className = 'calc-lbl'; l.textContent = lbl;",
  "  const el = document.getElementById('marfan-resultado'); if (!el) return;\n"
  "  while (el.firstChild) el.removeChild(el.firstChild);\n"
  "  const r = marfanEstado();\n"
  "  const fila = (lbl, nodo) => { const row = document.createElement('div'); row.className = 'calc-row';\n"
  "    const l = document.createElement('span'); l.className = 'calc-lbl'; l.style.fontSize = '16px'; l.textContent = lbl;"),

 ('05 DE MAS: la lista queda en el globo Y vuelve debajo del campo', 'TC-591',
  "              <select id=\"marfan_factores_riesgo\" onchange=\"marfanSync()\">",
  "              <span id=\"marfan-fr-hint\" style=\"font-size:10px;\">ESC 2024, Tabla 62, folio 114</span>\n              <select id=\"marfan_factores_riesgo\" onchange=\"marfanSync()\">"),

 # ── COMMIT 2: la tarjeta en una sola pantalla ────────────────────────────────────────────
 ('06 vuelve el glifo de MARFAN-1, la «i» suelta', 'TC-592',
  "      '\" aria-expanded=\"false\" aria-label=\"' + etq + '\" onclick=\"vInfoClic(this)\">&#9432;</button>';",
  "      '\" aria-expanded=\"false\" aria-label=\"' + etq + '\" onclick=\"vInfoClic(this)\">&#8505;</button>';"),

 ('07 el puntaje de la fila vuelve a mostrar siempre el maximo', 'TC-592',
  "    b.textContent = String(op ? op[2] : def.max);",
  "    b.textContent = String(def.max);"),

 ('08 los selectores dejan de ocupar las dos columnas y se cortan', 'TC-592',
  "    var l = $('label', 'mfs-fila mfs-fila-ancha');\n    l.appendChild($('span', 'mfs-rot', r.rot));\n    l.appendChild(selDe(r.c, r.ops, true));",
  "    var l = $('label', 'mfs-fila');\n    l.appendChild($('span', 'mfs-rot', r.rot));\n    var _s = selDe(r.c, r.ops, true); _s.style.maxWidth = '46%'; l.appendChild(_s);"),

 ('09 el motivo de cada regla vuelve debajo, en su propia fila', 'TC-592',
  "    d.appendChild(t); d.appendChild(b);\n    (col[g.fam] || cols).appendChild(d);",
  "    d.appendChild(t); d.appendChild(b);\n    var p2 = document.createElement('span'); p2.className = 'mfs-reg-por';\n    p2.textContent = g.por; d.appendChild(p2);\n    (col[g.fam] || cols).appendChild(d);"),

 ('10 DE MAS: la linea de lo que falta sale aunque no falte nada', 'TC-592',
  "  if (faltan.length) {\n    var fl = document.createElement('div'); fl.className = 'mfs-falta';",
  "  if (true) {\n    var fl = document.createElement('div'); fl.className = 'mfs-falta';"),

 ('11 el globo del score deja de leer VINFO y pierde las definiciones', 'TC-592',
  "      var e = (typeof VINFO !== 'undefined') ? VINFO[k] : null;\n      if (!e) return;",
  "      var e = null;\n      if (!e) return;"),

 ('12 la cita vuelve al cuerpo de la tarjeta, fuera de los globos', 'TC-592',
  "    _critPie('Lo que se marque acá <b>viaja con el estudio</b>. Contesta ' +",
  "    _critPie('Loeys BL et al. J Med Genet 2010 — Box 2, folio 478. Lo que se marque acá <b>viaja con el estudio</b>. Contesta ' +"),

 # ── COMMIT 3: la conclusion y el veredicto ───────────────────────────────────────────────
 ('13 DE MAS: la pastilla vuelve a indicar una cirugia', 'TC-593',
  "  const ETQ = { cx_i:'Cumple criterios para cirugía', cx_iia:'Cumple criterios para cirugía',",
  "  const ETQ = { cx_i:'Cirugía indicada', cx_iia:'Cumple criterios para cirugía',"),

 ('14 las dos primeras filas vuelven detras de la salida temprana', 'TC-593',
  "  { const g = _mfGhentFrase();\n    if (g) fila('Criterios de Ghent', val(g)); }\n  { const o = _mfOtrosDatos();\n    if (o) fila('Otros datos cargados', val(o)); }\n  if (!r.hayDatos)",
  "  if (!r.hayDatos)"),

 ('15 el umbral deja de publicar el diametro medido', 'TC-593',
  "    else if (r.maxAo != null) _u += ' — diámetro máximo cargado: ' + r.maxAo + ' mm';",
  "    else if (false) _u += '';"),

 # ── COMMIT 4: el Z de la raiz ────────────────────────────────────────────────────────────
 ('16 el Z vuelve a no viajar con el estudio', 'TC-594',
  "    iz.type = 'number'; iz.id = 'mfs_z_raiz'; iz.step = '0.1';",
  "    iz.type = 'number'; iz.id = 'mfs-z-raiz'; iz.step = '0.1';"),

 ('17 mfsZ vuelve a devolver null sobre un estudio archivado', 'TC-594',
  "  var raw = src ? src['mfs_z_raiz'] : (document.getElementById('mfs_z_raiz') || {}).value;",
  "  var raw = src ? null : (document.getElementById('mfs_z_raiz') || {}).value;"),

 ('18 el globo deja de declarar que el Z calculado no esta disponible', 'TC-594',
  "    + 'El Z se carga a mano y se guarda con el estudio. Z calculado: no disponible (falta la fuente del método).",
  "    + 'El Z se carga a mano y se guarda con el estudio. El Z calculado sale de la ecuación publicada.")
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
