#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_aj3.py — barrido de MUTACIONES DIRIGIDAS de la TANDA AJUSTES-3 (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1 a 4 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_aj3.py              # todas
  python3 scripts/_mut_aj3.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cuatro por cada una: TC-568 cubre el bucle del
video, TC-569 los botones del panel, TC-570 la clausula de la IT sistemica y TC-571 la linea de
la miocardiopatia en el PPT. Una mutacion del commit 1 que pusiera rojo a TC-569 estaria
diciendo que el reparto esta mal, no que la cobertura exista.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 07 marca una diapositiva que ya
trae su arbol de tiempo, la 08 marca una que no tiene ningun video, la 11 pone la marca de forma
tambien al boton NO marcado, y la 14 publica la clausula de la IT sistemica tambien en el papel.
Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo que
ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)  -- o (nombre, caso, [(v1,n1),(v2,n2)]) para romper dos mitades
MUT = [

 # == COMMIT 1 - el bucle del video =========================================================
 ('01 el arbol de tiempo no marca la repeticion', 'TC-568',
  """fill="hold" display="0" repeatCount="indefinite">""",
  """fill="hold" display="0">"""),

 ('02 el arbol se escribe ANTES de p:clrMapOvr, fuera del orden de CT_Slide', 'TC-568',
  """  out = out.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + timing);""",
  """  out = out.replace('</p:clrMapOvr>', timing + '</p:clrMapOvr>');"""),

 ('03 el video NO gana un id libre: el spid queda ambiguo', 'TC-568',
  """    if (nveces !== 1) {""",
  """    if (false && nveces !== 1) {"""),

 ('04 la validacion estricta deja de correr', 'TC-568',
  """  if (!_pptxXmlValido(out)) return null;""",
  """  if (false && !_pptxXmlValido(out)) return null;"""),

 ('05 deja de ser TODO O NADA: escribe lo que validó y sigue', 'TC-568',
  """    if (!res) { r.falla = rutas[i]; return r; }     // una sola falla deja el mazo sin bucle""",
  """    if (!res) { r.falla = rutas[i]; continue; }"""),

 ('06 un solo p:video aunque la diapositiva tenga varios', 'TC-568',
  """  for (let i = 0; i < spids.length; i++) {
    cuerpo += '<p:video><p:cMediaNode vol="80000" showWhenStopped="1">'""",
  """  for (let i = 0; i < Math.min(1, spids.length); i++) {
    cuerpo += '<p:video><p:cMediaNode vol="80000" showWhenStopped="1">'"""),

 ('07 DE MAS: marca tambien una diapositiva que YA trae su arbol de tiempo', 'TC-568',
  """  if (xml.indexOf('<p:timing') >= 0) return null;""",
  """  if (false && xml.indexOf('<p:timing') >= 0) return null;"""),

 ('08 DE MAS: marca tambien una diapositiva SIN ningun video', 'TC-568',
  """  const pics = _pptxPicsDeVideo(xml);
  if (!pics.length) return null;""",
  """  const pics = _pptxPicsDeVideo(xml);
  if (!pics.length) { pics.push({ bloque:'', id:'1', idAttr:'' }); }"""),

 # == COMMIT 2 - los botones del panel ======================================================
 ('09 la media query vuelve a bajarle el piso tactil a la botonera', 'TC-569',
  """@media (pointer:fine){
  #indic-cuerpo [data-ind-term]{ min-height:0;min-width:0 }
}""",
  """@media (pointer:fine){
  #indic-cuerpo [data-ind-clin],
  #indic-cuerpo [data-ind-term]{ min-height:0;min-width:0 }
}"""),

 ('10 el estado vuelve a depender SOLO del color', 'TC-569',
  """      (on ? '\u2713 ' : '') + _critEsc(o.t) + '</button>';""",
  """      _critEsc(o.t) + '</button>';"""),

 ('11 DE MAS: la marca de forma tambien en el boton NO marcado', 'TC-569',
  """      (on ? '\u2713 ' : '') + _critEsc(o.t) + '</button>';""",
  """      '\u2713 ' + _critEsc(o.t) + '</button>';"""),

 # == COMMIT 3 - la clausula de la IT sistemica =============================================
 ('12 la clausula no vuelve al globo de la seccion', 'TC-570',
  """       + 'Criterio de EcoSmart \u2014 en la transposici\u00f3n cong\u00e9nitamente corregida y tras el switch '
       + 'auricular: La v\u00e1lvula tric\u00faspide de estos pacientes es la auriculoventricular '
       + 'sist\u00e9mica: su insuficiencia pesa como pesar\u00eda una mitral.'""",
  """       + ''"""),

 ('13 la clausula vuelve pero SIN su rotulo de criterio propio', 'TC-570',
  """       + 'Criterio de EcoSmart \u2014 en la transposici\u00f3n cong\u00e9nitamente corregida y tras el switch '
       + 'auricular: La v\u00e1lvula""",
  """       + 'En la transposici\u00f3n cong\u00e9nitamente corregida y tras el switch '
       + 'auricular: La v\u00e1lvula"""),

 # REDIRIGIDA: la primera version mutaba mchConclusion, que es el papel de la
 # MIOCARDIOPATIA, mientras TC-570 mira el de la TRANSPOSICION. Sobrevivio por eso y no
 # porque faltara cobertura: no inyectaba el defecto donde el caso mira.
 ('14 DE MAS: la clausula de la IT sistemica se publica en el papel de la TGA', 'TC-570',
  """  partes.push(conducta);\n  return { clave: clave, txt: partes.join('. '),""",
  """  partes.push(conducta);\n  partes.push('La v\u00e1lvula tric\u00faspide de estos pacientes es la auriculoventricular sist\u00e9mica: su insuficiencia pesa como pesar\u00eda una mitral.');
  return { clave: clave, txt: partes.join('. '),"""),

 # == COMMIT 4 - la miocardiopatia hipertrofica del PPT =====================================
 # CORREGIDA: la primera version revertia el papel de la ESC, y en la escena de TC-571 el
 # score NO es calculable, asi que esa rama no aporta conducta y la mutacion no inyectaba
 # nada. Es el «freno que tapa al que se muta». Ahora toca la rama de la AHA, que es la
 # que esa escena SI ejercita.
 ('15 el papel vuelve a llevar la recomendacion de la AHA al PPT', 'TC-571',
  """  papel += '. Factores mayores de riesgo de muerte s\u00fabita: ' + _ahaCuenta + _ahaPend;""",
  """  papel += '. Factores mayores de riesgo de muerte s\u00fabita: ' + _ahaCuenta + _ahaCond + _ahaPend;"""),

 ('16 el papel pierde el «(N sin evaluar)»: desaparece un numero medido', 'TC-571',
  """  papel += '. Factores mayores de riesgo de muerte s\u00fabita: ' + _ahaCuenta + _ahaPend;""",
  """  papel += '. Factores mayores de riesgo de muerte s\u00fabita: ' + _ahaCuenta;"""),

 # CORREGIDA: la primera version cambiaba solo el TITULO del bloque, y las lineas -con la
 # recomendacion, la guia y el folio- seguian ahi. Ahora vacia las lineas, que es lo que
 # «sale de la Evidencia» quiere decir.
 ('17 el bloque de la AHA/ACC 2024 sale de la Evidencia', 'TC-571',
  """        { txt:'Clase IIa \u00b7 Nivel B-NR \u2014 En el adulto con miocardiopat\u00eda hipertr\u00f3fica y uno o m\u00e1s factores mayores de riesgo de muerte s\u00fabita, es razonable ofrecer un desfibrilador.', refs:null },""",
  """        { txt:'', refs:null },"""),

 ('18 DE MAS: la obstruccion severa, que es una MEDIDA, sale del papel', 'TC-571',
  """    resumen += _obs; papel += _obs;""",
  """    resumen += _obs;"""),
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
