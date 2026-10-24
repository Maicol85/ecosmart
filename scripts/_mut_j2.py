#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_j2.py — barrido de MUTACIONES DIRIGIDAS de la tanda J2.

Cada mutacion revierte UNA de las cosas que la tanda cambio, sobre una COPIA de index.html, y
exige que TC-533 se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_j2.py              # todas
  python3 scripts/_mut_j2.py --solo 1,2,3 # un grupo, para correr en primer plano

⚠️ EXIGE LA LINEA `RESULTADO` EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun `✗` y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ NUNCA MUTA EL ARCHIVO VIVO. Se trabaja sobre /tmp y se restaura el original con su md5.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-533'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 ('01 el perfil de IC bajo con RVS baja vuelve a la etiqueta y al «considerar»',
  "      perfilEl.innerHTML = badge('gray', 'IC ' + ic.toFixed(2) + ' L/min/m² · RVS ' + rvs.toFixed(0) + ' dinas·s·cm⁻⁵');",
  "      perfilEl.innerHTML = badge('orange', 'GC bajo con RVS baja — considerar shock mixto/distributivo');"),

 ('02 el perfil distributivo pierde el chip «Criterio de EcoSmart»',
  "                            badge('gray', '· Criterio de EcoSmart')].join(' ');",
  "                            ''].join(' ');"),

 ('03 el corte del indice cardiaco pasa de <= 2,2 a < 2,2',
  "  if (ic <= 2.2) return { cls:'red',    txt:'bajo' };",
  "  if (ic < 2.2) return { cls:'red',    txt:'bajo' };"),

 ('04 el globo del indice cardiaco pierde su boton',
  'aria-label="Informaci&oacute;n sobre el &iacute;ndice card&iacute;aco y sus referencias" onclick="vInfoClic(this)">&#9432;</button>',
  'aria-label="x" style="display:none">&#9432;</button>'),

 ('05 el globo de la RVS cambia el folio de Grossman',
  'Tomo I, Tabla 11.2, folio 260. El pie de esa tabla aclara',
  'Tomo I, Tabla 11.2, folio 261. El pie de esa tabla aclara'),

 ('06 la Evidencia de hemodinamica sale del registro de secciones',
  "  { tit:'Perfil hemodinámico — presiones y resistencias estimadas por eco', fn:_indHemo },",
  "  "),

 ('07 vuelve el plazo de «2-4 sem» a la fila de antraciclinas',
  'Si la FEVI cae &gt;=10 pp o baja de 50%: graduar la CTRCD con la subtab «CTRCD» de esta seccion.</td>\n        <td style="padding:5px 8px;">Mama, linfomas',
  'Si la FEVI cae &gt;=10 pp o baja de 50%: eco en 2-4 sem y graduar la CTRCD con la subtab «CTRCD» de esta seccion.</td>\n        <td style="padding:5px 8px;">Mama, linfomas'),

 ('08 el seguimiento tras radioterapia vuelve a «5 y 10 anos» en la tabla corta',
  '<td style="padding:5px 8px;">Eco <b>desde los 5 anos</b> post-RT y luego <b>cada 5 anos</b> (IIa C)</td>',
  '<td style="padding:5px 8px;">Eco 5 y 10 anos post-RT</td>'),

 ('09 la Evidencia de cardio-oncologia sale del registro',
  "  { tit:'Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento', fn:_indConco },",
  "  "),

 ('10 vuelve la etiqueta «Score INTERMEDIO» al tramo 5-7',
  "    cat='🔵 Puntaje ' + pts + '/10: no alcanza el corte de 8'",
  "    cat=(pts >= 5 ? '🟡 Score INTERMEDIO (' + pts + '/10)' : '🟢 Score BAJO (' + pts + '/10) con HVI')\n      + ''"),

 ('11 un corte de Boldrini queda mal transcrito',
  "  1:  { se: 98,  sp: 19 },",
  "  1:  { se: 97,  sp: 19 },"),

 ('12 el globo del score de amiloidosis pierde su boton',
  'aria-label="Informaci&oacute;n sobre la validaci&oacute;n y el rendimiento del score" onclick="vInfoClic(this)">&#9432;</button>',
  'aria-label="x" style="display:none">&#9432;</button>'),

 ('13 la Evidencia de amiloidosis sale del registro',
  "  { tit:'Amiloidosis cardíaca — algoritmo diagnóstico', fn:_indAmil }",
  "  "),

 ('14 el escenario 4 deja de pedir la biopsia endomiocardica',
  "      esc.push({ txt:'En ese escenario el diagnóstico EXIGE histología con tipificación del amiloide, habitualmente por biopsia endomiocárdica (folio 1559).', refs:['gpAmiloid2021'] });",
  "      esc.push({ txt:'En ese escenario hace falta mas estudio (folio 1559).', refs:['gpAmiloid2021'] });"),

 ('15 la ficha de eco pulmonar sale de REF_SUBTAB',
  "                        'pulmon', 'cardiotox', 'miocard', 'congenitas', 'formulas'])",
  "                        'cardiotox', 'miocard', 'congenitas', 'formulas'])"),

 ('16 la ficha vuelve a citar la Figura 4 en vez de la Figura 3',
  'Pie de la <b>Figura 3, panel C</b> &middot; hoja 8',
  'Pie de la <b>Figura 4, panel C</b> &middot; hoja 8'),

 ('17 el globo de Balik pierde su entrada en VINFO_REF',
  "  'pul-balik': 'pulmon'\n});",
  "  'oai-ref2': 'oai'\n});"),
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
