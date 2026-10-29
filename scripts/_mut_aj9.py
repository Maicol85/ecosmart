#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_aj9.py — barrido de MUTACIONES DIRIGIDAS de la tanda AJ9.

Cada mutacion revierte UNA de las cosas que la tanda cambio -o la aplica DE MAS-, sobre el
index.html del directorio donde se lo corra, y exige que TC-547 se ponga ROJO. Una mutacion que
sobrevive es cobertura que no existe.

  python3 scripts/_mut_aj9.py              # todas
  python3 scripts/_mut_aj9.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y
   comprueba su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion
   aplicada y la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no
   hay cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ DOS DE LAS DOCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 hace que el rotulo se cuele
   al informe firmado y la 10 que el 2,90 exacto sume. Existen porque las condiciones que las
   matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no
   esta probando nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-547'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · los cortes, el signo y el rotulo ─────────────────────────────────
 ('01 el corte de normalidad vuelve al -20 del semaforo viejo',
  'const SGL_NORMAL_MAX  = -18;',
  'const SGL_NORMAL_MAX  = -20;'),

 ('02 el -18 EXACTO vuelve a caer del lado normal (borde no estricto)',
  'if (n <  SGL_NORMAL_MAX)  return SGL_CATS[0];',
  'if (n <= SGL_NORMAL_MAX)  return SGL_CATS[0];'),

 ('03 el -16 EXACTO cae del lado anormal (borde estricto donde la guia lo incluye)',
  'if (n <= SGL_ANORMAL_MIN) return SGL_CATS[1];',
  'if (n <  SGL_ANORMAL_MIN) return SGL_CATS[1];'),

 ('04 el papel deja de anteponerle el signo al strain tipeado positivo',
  '  if (n === null || !isFinite(n) || n <= 0) return t;\n  return \'-\' + t.replace(/^\\+/, \'\');',
  '  return t;'),

 ('05 APLICA DE MAS: el rotulo se cuela al informe y al EN SUMA',
  "  const _sglV = sglNegTxt((sv('sgl') || '').trim() || (sv('sgl_gls') || '').trim());",
  "  const _sglV = (function () { const c = (sv('sgl') || '').trim() || (sv('sgl_gls') || '').trim();\n    const k = sglClasificar(c); return sglNegTxt(c) + (k ? '% \u00b7 ' + k.rot : ''); })();"),

 ('06 los dos cortes dejan de pintarse en la ficha de Referencias',
  'try { sglCortesPintar(); } catch (e) {}',
  'try { } catch (e) {}'),

 ('07 la banda de normalidad vuelve a tener su propio numero tecleado',
  'sgl:[-25, SGL_NORMAL_MAX], vci_diam:[10,21],',
  'sgl:[-25, -20], vci_diam:[10,21],'),

 ('08 el rotulo deja de repintarse en «Nuevo estudio» y se filtra entre pacientes',
  "  { if (typeof sglRotuloPintar === 'function') { try { sglRotuloPintar(); } catch (e) {} } }",
  "  { }"),

 # ── commit 2 · los territorios ───────────────────────────────────────────
 ('09 el segmento 15 se pasa de la coronaria derecha a la circunfleja',
  "mid_inferior:'#3ecf8e', apical_inferior:'#3ecf8e',",
  "mid_inferior:'#3ecf8e', apical_inferior:'#ff7ab8',"),

 # ── commit 3 · los patrones ─────────────────────────────────────────────
 ('10 el patron de amiloidosis vuelve a definirse con el 2,9 del score',
  'Preservaci\u00f3n apical: el promedio del \u00e1pex m\u00e1s de 2 veces el promedio del resto.',
  'Relaci\u00f3n \u00e1pice/base > 2.9.'),

 # ── commit 4 · el score ───────────────────────────────────────────────
 ('11 APLICA DE MAS: el corte del score deja de ser estricto y el 2,90 exacto suma',
  "amAplicarCalc('apice', rel > 2.9, 3);",
  "amAplicarCalc('apice', rel >= 2.9, 3);"),

 ('12 el globo del 2,9 pierde su stopPropagation y marca el criterio al abrirse',
  'onclick="event.stopPropagation();vInfoClic(this)">&#9432;</button></div>',
  'onclick="vInfoClic(this)">&#9432;</button></div>'),
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
        for i, (nom, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            n = orig.count(viejo)
            if n != 1:
                res.append((i, nom, 'NO APLICA', 'el patron aparece %d veces' % n))
                print('  %02d  NO APLICA  %s (%d apariciones)' % (i, nom, n), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
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
