#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pa.py - barrido de MUTACIONES DIRIGIDAS de la TANDA POP-A (2026-11-01).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_pa.py              # las catorce
  python3 scripts/_mut_pa.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cinco por cada una: TC-577 cubre las tres
columnas y los rotulos, TC-578 el selector de farmacos y el azul de metileno, TC-579 la
asistencia, el monitoreo y los datos hemodinamicos, TC-580 el contexto quirurgico y TC-581 la
tarjeta de Eco y POCUS con la disposicion de abajo. Una mutacion del commit 1 que pusiera rojo a
TC-580 estaria diciendo que el reparto esta mal, no que la cobertura exista.

TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 mete el azul de metileno al
patron y al dibujo, la 06 le declara una unidad en el papel y la 12 le escribe una protesis
mecanica por omision a una valvula marcada sin tipo. Existen porque las condiciones que las
matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta
probando nada.

LA 03 Y LA 04 NECESITAN DOS ARCHIVOS AL LADO (`_mut_pa_azul.txt` y `_mut_pa_sep.txt`): el
marcado del farmaco nuevo y el del separador, que se mueven de lugar. Transcribirlos aca dejaria
dos copias del mismo marcado, y el dia que el marcado cambie la mutacion saldria NO APLICA -que
se lee igual que «no hay cobertura»-.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()



# (nombre, caso, viejo, nuevo)
AZUL = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '_mut_pa_azul.txt'), encoding='utf-8').read()
SEP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '_mut_pa_sep.txt'), encoding='utf-8').read()

MUT = [
 ('01 el corte de las tres columnas se va de 900 a 1100 px', 'TC-577',
  '  @media (min-width: 900px) {\n    .pop-cols { grid-template-columns: repeat(3, minmax(0,1fr)); }\n  }\n',
  '  @media (min-width: 1100px) {\n    .pop-cols { grid-template-columns: repeat(3, minmax(0,1fr)); }\n  }\n'),

 ('02 la presion pulmonar sistolica vuelve a llamarse PAPs', 'TC-577',
  '<label for="pop_sw_paps">PSAP (mmHg)</label>',
  '<label for="pop_sw_paps">PAPs (mmHg)</label>'),

 ('03 el azul de metileno se corre al grupo de los vasodilatadores: cambia el orden', 'TC-578',
  AZUL + SEP, SEP + AZUL),

 ('04 el panel de farmacos deja de ser absoluto: desplegarlo empuja lo de abajo', 'TC-578',
  '  .pop-farm-menu { display:none; position:absolute; z-index:30; left:0; right:0;\n',
  '  .pop-farm-menu { display:none; position:static; z-index:30; left:0; right:0;\n'),

 ('05 DE MAS: el azul de metileno entra al patron hemodinamico y al dibujo', 'TC-578',
  'var POP_DROGAS_PATRON = POP_DROGAS.filter(function (k) { return POP_DROGAS_SIN_UNIDAD.indexOf(k) < 0; });',
  'var POP_DROGAS_PATRON = POP_DROGAS.slice();'),

 ('06 DE MAS: el papel le declara mcg/kg/min al azul de metileno', 'TC-578',
  "var POP_DOSIS_UNID = { azul: '' };",
  'var POP_DOSIS_UNID = {};'),

 ('07 el boton de sacar desmarca la casilla y NO borra lo cargado', 'TC-578',
  "  if (c) c.checked = false;\n  try { popSync(); } catch (e) { console.error('[popFarmSacar]', e); }",
  "  if (c) c.checked = false;\n  try { if (false) popSync(); } catch (e) { console.error('[popFarmSacar]', e); }"),

 ('08 la segunda columna del Swan deja de ser una columna: el reparto se deshace', 'TC-579',
  '            <div class="pop-mon-c">\n            <div class="fg"><label for="pop_sw_pam">',
  '            <div>\n            <div class="fg"><label for="pop_sw_pam">'),

 ('09 la compuerta por dispositivo deja de esconder la FC y la PAM: se piden dos veces', 'TC-579',
  "  g('pop_dh_fc_wrap', mon !== 'swan');\n  g('pop_dh_pam_wrap', mon !== 'swan' && mon !== 'pai');",
  "  g('pop_dh_fc_wrap', true);\n  g('pop_dh_pam_wrap', true);"),

 ('10 el barrido ESCRIBE el campo del dueno: lo automatico toca el estudio', 'TC-579',
  '    if (esp.value !== due.value) esp.value = due.value;',
  '    if (esp.value !== due.value) due.value = esp.value;'),

 ('11 la marca heredada MARCA la casilla de verdad: reescribe el estudio viejo', 'TC-580',
  "    if (l) l.classList.toggle('pop-cx-her', r[0] === her && her !== '');",
  "    if (l) l.classList.toggle('pop-cx-her', r[0] === her && her !== '');\n"
  "    const _c = document.getElementById(r[0]);\n"
  "    if (_c && r[0] === her && her !== '') _c.checked = true;"),

 ('12 DE MAS: marcar una valvula le escribe una protesis mecanica por omision', 'TC-580',
  "    const val = hay ? d.value : '';\n    if (e.value !== val) e.value = val;",
  "    const val = hay ? d.value : '';\n    if (e.value !== val) e.value = val;\n"
  "    const _ck = document.getElementById(m.chk);\n"
  "    if (_ck && _ck.checked && !hay) { d.value = 'Protesis mecanica'; }"),

 ('13 los tres drenajes vuelven a una fila elastica: a 1000 px uno baja de renglon', 'TC-580',
  '  .pop-dren-fila { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:0 8px; }',
  '  .pop-dren-fila { display:flex; gap:0 8px; flex-wrap:wrap; }'),

 ('14 el espejo del derrame pericardico gana una opcion vacia que el dueno no tiene', 'TC-581',
  '  if (!e.options.length) {\n    Array.prototype.forEach.call(d.options, function (o) {',
  "  if (!e.options.length) {\n    const _v = document.createElement('option');\n"
  "    _v.value = ''; _v.textContent = 'sin evaluar';\n    e.appendChild(_v);\n"
  '    Array.prototype.forEach.call(d.options, function (o) {'),
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
