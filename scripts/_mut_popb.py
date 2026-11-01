#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_popb.py - barrido de MUTACIONES DIRIGIDAS de la TANDA POP-B (2026-11-01).

Cada mutacion revierte UNA de las cosas que los commits 1 a 7 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_popb.py              # las catorce
  python3 scripts/_mut_popb.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cuatro por cada una: TC-582 cubre el boton que
dice por que y el contador de farmacos, TC-583 el tipo de las valvulas, TC-584 la disposicion, y
TC-585 el dibujo entero. Una mutacion del commit 2 que pusiera rojo a TC-585 estaria diciendo que
el reparto esta mal, no que la cobertura exista.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 deja que el papel describa la
cirugia con una morfologia nativa tambien cuando hay protesis, la 09 dibuja el derrame pleural
con «ausente», la 11 dibuja el puente sin cirugia declarada y la 14 abre las valvulas sin
frecuencia cargada. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un
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
 # ── COMMIT 1: el boton que dice por que ──────────────────────────────────────────────────
 ('01 el barrido de bloques vuelve a borrar el title del boton', 'TC-582',
  "    if (on) b.setAttribute('title', _AM_AVISO_TXT);\n"
  "    else if (b.getAttribute('title') === _AM_AVISO_TXT) b.removeAttribute('title');",
  "    if (on) b.setAttribute('title', _AM_AVISO_TXT); else b.removeAttribute('title');"),

 ('02 el boton deja de decir el motivo y dice solo que no puede', 'TC-582',
  "    btn.title = r.suficiente ? 'Agrega la hoja PostCEC al PDF y la línea al EN SUMA'\n"
  "                             : 'Sin patrón que integrar: ' + (r.motivo || 'faltan datos');",
  "    btn.title = r.suficiente ? '' : 'No se puede integrar';"),

 # ── COMMIT 3: el contador de farmacos ────────────────────────────────────────────────────
 ('03 el contador vuelve a sumar la asistencia circulatoria', 'TC-582',
  "      var _n = document.querySelectorAll('#pop_farm_rows .pop-droga.pop-droga-on').length;",
  "      var _n = document.querySelectorAll('#pop_farm_rows .pop-droga.pop-droga-on').length;\n"
  "      var _as0 = (document.getElementById('pop_asist_tipo') || {}).value || '';\n"
  "      if (_as0 && _as0 !== 'ninguna') _n++;"),

 # ── COMMIT 2: el tipo de las valvulas ────────────────────────────────────────────────────
 ('04 el clonado vuelve a traer la lista entera del dueno, nativas incluidas', 'TC-583',
  "      if (!_popVEsProt(o)) return;\n", "\n"),

 ('05 DE MAS: el papel publica el valor del dueno aunque no sea una protesis', 'TC-583',
  "    out.push(NOM[m.chk] + (st && st.prot ? ' — ' + st.val : ' — sin tipo consignado'));",
  "    const _d0 = document.getElementById(m.due);\n"
  "    out.push(NOM[m.chk] + ((_d0 && _d0.value) ? ' — ' + _d0.value : ' — sin tipo consignado'));"),

 # ⚠️ SU PRIMERA VERSION SOBREVIVIO, Y EL MOTIVO ES UN FRENO QUE TAPA AL QUE SE MUTA: mutaba solo
 # el `val` de `popVEstado`, y su UNICO consumidor es el valor del selector, que con la lista ya
 # filtrada no puede tomar una morfologia nativa -poner un valor que no es ninguna de sus opciones
 # deja el `<select>` en cadena vacia-. O sea que el filtro de opciones lo protege por el otro
 # lado. Hoy se muta el PREDICADO, que es la mitad que la etiqueta «de Valvulas» y el PAPEL leen.
 ('06 una morfologia nativa cuenta como protesis: la etiqueta y el papel la publican', 'TC-583',
  "  const prot = !!(sel && _popVEsProt(sel));",
  "  const prot = !!(sel && d.value !== '' && d.value !== def);"),

 ('07 el aviso de reemplazo no se escribe', 'TC-583',
  "    if (nota) nota.textContent = st.nativa\n"
  "      ? 'En Válvulas: «' + st.nativa + '». Elegir un tipo acá la reemplaza.' : '';",
  "    if (nota) nota.textContent = '';"),

 # ── COMMIT 4: la disposicion ─────────────────────────────────────────────────────────────
 ('08 la tarjeta de pleura y pulmon pierde el ancho completo', 'TC-584',
  '<section class="pop-card pop-card-wide" data-pop="pop-pleupul">',
  '<section class="pop-card" data-pop="pop-pleupul">'),

 ('09 el corte de sus dos columnas se va de 900 a 1400 px', 'TC-584',
  '  @media (min-width: 900px) {\n    .pop-pleupul-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }\n  }',
  '  @media (min-width: 1400px) {\n    .pop-pleupul-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }\n  }'),

 ('10 el eco y el VD vuelven a una sola columna', 'TC-584',
  '  @media (min-width: 900px) {\n    .pop-eco-par { grid-template-columns: repeat(2, minmax(0,1fr)); }\n  }',
  '  @media (min-width: 2400px) {\n    .pop-eco-par { grid-template-columns: repeat(2, minmax(0,1fr)); }\n  }'),

 # ── COMMIT 5: los textos y el derrame pleural ────────────────────────────────────────────
 ('11 vuelve el rotulo del derrame pleural al dibujo, encima de la arteria pulmonar', 'TC-585',
  "  n.pbox = _popEsqNodo('rect', { x:10, y:292, width:178, height:80, rx:8, 'stroke-width':1.5 }, svg);",
  "  n.plT = _popEsqTexto(svg, 12, 282, 'derrame pleural D moderado · I severo', 13, 500, 'start', 'var(--text2)');\n"
  "  n.pbox = _popEsqNodo('rect', { x:10, y:292, width:178, height:80, rx:8, 'stroke-width':1.5 }, svg);"),

 ('12 el nivel de liquido vuelve a ser el mismo para los tres grados', 'TC-585',
  "const POP_ESQ_PLEURA_H = Object.freeze({ leve: 22, moderado: 44, severo: 72 });",
  "const POP_ESQ_PLEURA_H = Object.freeze({ leve: 22, moderado: 22, severo: 22 });"),

 ('13 DE MAS: el derrame pleural se dibuja tambien con «ausente»', 'TC-585',
  "  o.plD = POP_ESQ_PLEURA_H[d.pleD] || 0;",
  "  o.plD = POP_ESQ_PLEURA_H[d.pleD] || (d.pleD ? 22 : 0);"),

 # ── COMMIT 6: puente, malla y drenajes ───────────────────────────────────────────────────
 ('14 DE MAS: el puente se dibuja sin cirugia declarada', 'TC-585',
  "  n.puente.setAttribute('display', d.cabg ? 'inline' : 'none');",
  "  n.puente.setAttribute('display', 'inline');"),

 ('15 el drenaje mediastinico se enciende con el pleural izquierdo', 'TC-585',
  "  n.drenM.setAttribute('display', d.drenM ? 'inline' : 'none');",
  "  n.drenM.setAttribute('display', d.drenI ? 'inline' : 'none');"),

 # ── COMMIT 7: las valvulas con tipo y latido ─────────────────────────────────────────────
 ('16 una valvula marcada sin tipo recibe el aspecto de una mecanica', 'TC-585',
  "    const mec = st.tipo === 'mec', bio = st.tipo === 'bio';",
  "    const mec = st.tipo !== 'bio', bio = st.tipo === 'bio';"),

 ('17 DE MAS: las valvulas laten sin frecuencia cargada', 'TC-585',
  "  const _fv = d.fc === null ? null\n"
  "    : (_popEsq.reduce ? 0.2 : ((ahora - _popEsq.t0) % (60000 / d.fc)) / (60000 / d.fc));",
  "  const _fv = (_popEsq.reduce ? 0.2 : ((ahora - _popEsq.t0) % 900) / 900);"),

 ('18 la aortica abre en diastole, junto con la mitral', 'TC-585',
  "    const abre = (vv.k === 'ao' || vv.k === 'pu') ? sist : (_fv !== null && !sist);",
  "    const abre = (_fv !== null && !sist);"),
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
