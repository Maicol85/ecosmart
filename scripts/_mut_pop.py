#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pop.py — barrido de MUTACIONES DIRIGIDAS de la tanda POP-V2 (2026-10-29).

Cada mutacion revierte UNA de las cosas que la tanda cambio —o la aplica DE MAS— sobre el
index.html del directorio donde se lo corra, y exige que TC-548 se ponga ROJO. Una mutacion que
sobrevive es cobertura que no existe.

  python3 scripts/_mut_pop.py              # todas
  python3 scripts/_mut_pop.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 09 hace que el lactato de 2,0
   exactos encienda la senal, la 10 que el TAPSE de 17 exactos la encienda, y la 11 que el
   VD/VI de 0,90 exactos cuente como dilatacion. Existen porque las condiciones que las matan
   son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta
   probando nada.
⚠️ LA 13 ROMPE LAS DOS LISTAS A LA VEZ. El selector de timing esta fuera del estudio por DOS
   expresiones paralelas, `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`: una mutacion que
   rompa solo una sobrevive porque la otra la tapa. Es la leccion que el D-11 dejo escrita.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-548'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · el orden y el desplegable ────────────────────────────────────────
 ('01 el desplegable de farmacos arranca ABIERTO',
  '      <details class="pop-farm" id="pop_farmacos_det">',
  '      <details class="pop-farm" id="pop_farmacos_det" open>'),

 ('02 el contador cuenta «Ninguna» asistencia como soporte en curso',
  "      if (_as && _as !== 'ninguna') _n++;",
  "      if (_as) _n++;"),

 ('03 el recuadro del monitoreo vuelve a scrollear por dentro',
  '  .pop-mon-body { padding:0 10px 10px; }',
  '  .pop-mon-body { max-height:250px; overflow:auto; padding:0 10px 10px; }'),

 # ── commit 2 · la dosis ─────────────────────────────────────────────────────────
 ('04 la dosis vuelve a ser una sugerencia y no se escribe sola',
  "  if (!_mano && el) { el.value = d.toFixed(2); el.dataset.popAuto = el.value; }",
  "  if (!_mano && el) { }"),

 ('05 se pisa la dosis que el medico escribio a mano',
  "  if (el.dataset.popMano === '1') return true;\n  if (el.value === '') return false;\n  return !(el.dataset.popAuto !== undefined && el.dataset.popAuto === el.value);",
  "  return false;"),

 ('06 borrar la dosis ya no la deja borrada: el barrido la repuebla',
  "  if (el.dataset.popMano === '1') return true;\n  if (el.value === '') return false;",
  "  if (el.value === '') return false;"),

 ('07 la vasopresina pasa a escribir su dosis sola',
  "var POP_DROGAS_PESO = POP_DROGAS.filter(function (k) { return k !== 'vaso'; });",
  "var POP_DROGAS_PESO = POP_DROGAS.slice();"),

 # ── commit 3 · la PAM por linea arterial ────────────────────────────────────────
 ('08 la linea arterial deja de entrar en el primer escalon',
  "    else if (mon === 'pai') { inv = v('pop_pai_pam'); invClave = 'art'; }",
  "    else if (mon === 'pai') { }"),

 # ── los TRES controles negativos: APLICAN DE MAS ────────────────────────────────
 ('09 APLICA DE MAS: el lactato de 2,0 exactos enciende la senal',
  '  const lacAlto = lactato !== null && lactato > POP_LACTATO_ALTO;',
  '  const lacAlto = lactato !== null && lactato >= POP_LACTATO_ALTO;'),

 ('10 APLICA DE MAS: el TAPSE de 17 exactos enciende la senal de falla cardiaca',
  "  if (pcp !== null && pcp > UMBRAL_PCP_HUMEDO && tapseBaja) {",
  "  if (pcp !== null && pcp > UMBRAL_PCP_HUMEDO && tapse !== null && tapse <= uT) {"),

 ('11 APLICA DE MAS: el VD/VI de 0,90 exactos cuenta como dilatacion',
  'function tepVdViDilatado(vdvi) { return vdvi !== null && vdvi !== undefined && vdvi > TEP_VDVI_DILAT_MIN; }',
  'function tepVdViDilatado(vdvi) { return vdvi !== null && vdvi !== undefined && vdvi >= TEP_VDVI_DILAT_MIN; }'),

 # ── commit 4 · el dibujo ────────────────────────────────────────────────────────
 ('12 el balon se infla en la SISTOLE y se desinfla en la diastole',
  '  const u = fase < 0.35 ? 0\n          : fase < 0.45 ? (fase - 0.35) / 0.1\n          : fase < 0.9 ? 1\n          : (1 - fase) / 0.1;',
  '  const u = fase < 0.35 ? 1 : 0;'),

 # ⚠️ ROMPE LAS DOS LISTAS DE UNA VEZ. `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO` son dos
 # expresiones paralelas, y una mutacion que rompa UNA sola la tapa la otra: es la leccion que el
 # D-11 dejo escrita con `data-espejo`. Por eso esta entrada lleva DOS pares.
 ('13 el selector de timing vuelve a ser un campo del estudio (LAS DOS listas a la vez)',
  [('pop-bcia-|ref-|(?:b-)?cine-', 'ref-|(?:b-)?cine-'),
   ('|fcg-|pop-bcia-|centro_tipo$', '|fcg-|centro_tipo$')]),

 # ── commit 5 · el rotulo que no tranquiliza de mas ──────────────────────────────
 ('14 el rotulo vuelve a decir «Sin patron de bajo gasto» con el indice cardiaco bajo',
  "  else if (!pats.length && icBajo)\n    pat = { k:'bajo_sin_patron', cls:'orange',\n            lbl:'" + chr(205) + "ndice card" + chr(237) + "aco bajo, sin un patr" + chr(243) + "n que lo explique con los datos cargados' };",
  "  else if (false) { }"),
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
    bak = tempfile.mktemp(suffix='.html')
    shutil.copy2(IDX, bak)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            # Una entrada puede traer UN par o una LISTA de pares: ver la nota de la 13.
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
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
