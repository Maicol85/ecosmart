#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_cong2a.py — barrido de MUTACIONES DIRIGIDAS de la TANDA CONG-2A (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1 a 5a cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_cong2a.py              # todas
  python3 scripts/_mut_cong2a.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cinco por cada una: TC-572 cubre lo que se
desmarca, TC-573 la pantalla de la TGA, TC-574 el 3D, TC-575 los dibujos de los criterios TEER y
TC-576 el papel de la miocardiopatia hipertrofica. Una mutacion del commit 1 que pusiera rojo a
TC-575 estaria diciendo que el reparto esta mal, no que la cobertura exista.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 04 le da el ancho completo a
Sintomas tambien sin la cirugia -o sea CREA el hueco-, la 08 dibuja la CIA tambien con el switch
auricular, la 09 dibuja la CIV tambien con el Rastelli y la 14 deja la conducta en el papel de la
miocardiopatia. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un
control negativo que ninguna mutacion puede romper no esta probando nada.

LA 02 ROMPE LAS DOS MITADES A LA VEZ: el oyente de documento y la lista de origenes son dos
puertas al mismo repintado, y romper una sola la tapa la otra. Es la leccion del D-11.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)  -- o (nombre, caso, [(v1,n1),(v2,n2)]) para romper dos mitades
MUT = [

 # == COMMIT 1 - la morfologia aortica es el quinto origen de la VAB ==========================
 ('01 va_morf sale de la lista de origenes de la seccion', 'TC-572',
  """const _VAB_ORIGENES = ['ao_sin', 'ao_tub', 'ea_grado', 'ia_grado', 'va_morf'];""",
  """const _VAB_ORIGENES = ['ao_sin', 'ao_tub', 'ea_grado', 'ia_grado'];"""),

 ('02 el oyente de la seccion deja de ver el cambio de morfologia -las DOS mitades-', 'TC-572',
  [("""const _VAB_ORIGENES = ['ao_sin', 'ao_tub', 'ea_grado', 'ia_grado', 'va_morf'];""",
    """const _VAB_ORIGENES = ['ao_sin', 'ao_tub', 'ea_grado', 'ia_grado'];"""),
   ("""document.addEventListener('input', _vabOrigenCambio, false);
document.addEventListener('change', _vabOrigenCambio, false);""",
    """document.addEventListener('input', _vabOrigenCambio, false);""")]),

 ('03 el resumen de la seccion deja de seguir a la morfologia', 'TC-572',
  """  else if (sv2('va_morf') === VAB_MORF_BIC) linea('VAB');""",
  """  else if (false) linea('VAB');"""),

 # == COMMIT 2 - la pantalla de la TGA =======================================================
 ('04 DE MAS: Sintomas ocupa las dos columnas SIEMPRE, o sea CREA el hueco sin la cirugia', 'TC-573',
  """  if (_camp) _camp.classList.toggle('tga-sint-ancho', _cirVisible);""",
  """  if (_camp) _camp.classList.add('tga-sint-ancho');"""),

 ('05 la grilla de campos vuelve a una sola columna: se pierden las dos columnas', 'TC-573',
  """  #tga-campos { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px;
                align-items:start; }""",
  """  #tga-campos { display:grid; grid-template-columns:repeat(1,minmax(0,1fr)); gap:10px;
                align-items:start; }"""),

 ('06 el parrafo largo vuelve a la pantalla', 'TC-573',
  """        Transposición de grandes arterias: el tipo y la cirugía describen el dibujo, la conclusión y el informe.""",
  """        Esta sección cubre las cuatro anatomías del selector: la transposición completa (d-TGA), la congénitamente corregida (ccTGA) y las dos operadas con switch auricular. El dibujo, la conclusión de abajo y el informe describen lo que se cargue en el tipo y en la cirugía; con la d-TGA aparece además el campo de cirugía realizada."""),

 # == COMMIT 3 - el 3D ========================================================================
 # ATENCION: ESTA MUTACION ROMPE LAS DOS MITADES, Y SOBREVIVIO AL PRIMER BARRIDO ROMPIENDO UNA.
 # El commit 3c -el corazon normal por omision- TAPA al 3b: con el, al vaciar el tipo la rama
 # «todavia no hay dibujo» no se ejecuta nunca mientras la libreria este cargada, porque se
 # dibuja norm y el build redimensiona el lienzo. O sea que el blindaje del recuadro es la
 # SEGUNDA red, para el caso en que la libreria no cargue. Rompiendo las dos a la vez el canvas
 # de 420 px vuelve a quedar suelto sobre un lienzo de alto 0, que es el defecto que el medico
 # vio. Es la leccion del D-11: una mutacion que rompe una de dos mitades redundantes sobrevive.
 ('07 el recuadro se rompe por las DOS puertas: sin corazon normal y con el lienzo en alto 0', 'TC-574',
  [("""  const anat = (_tga3d.ref || _sinTipo) ? 'norm' : ej.anat;""",
    """  const anat = _tga3d.ref ? 'norm' : ej.anat;"""),
   ("""    if (cvh) cvh.style.display = 'none';""",
    """    if (cvh) cvh.style.height = '0px';""")]),

 ('08 DE MAS: la CIA se dibuja tambien con el switch auricular', 'TC-574',
  """  const _comAsd = sh.asd && !(a === 'dtga' && o === 'mus');""",
  """  const _comAsd = sh.asd;"""),

 ('09 DE MAS: la CIV se dibuja tambien con el Rastelli, encima de su tunel', 'TC-574',
  """  const _comVsd = sh.vsd && !(a === 'dtga' && o === 'ras');""",
  """  const _comVsd = sh.vsd;"""),

 ('10 sin tipo no se dibuja el corazon normal', 'TC-574',
  """  const anat = (_tga3d.ref || _sinTipo) ? 'norm' : ej.anat;""",
  """  const anat = _tga3d.ref ? 'norm' : ej.anat;"""),

 ('11 el gate del PDF vuelve a mirar solo el boton: el corazon normal entra al papel', 'TC-574',
  [("""  const _dato = _tga3dEsDato();
  b.disabled = !_dato;""",
    """  const _dato = !_tga3d.ref;
  b.disabled = !_dato;"""),
   ("""  if (!_tga3dEsDato()) {""",
    """  if (_tga3d.ref) {""")]),

 ('12 las comunicaciones vuelven a la rama de la d-TGA sin cirugia', 'TC-574',
  """  if (_comAsd) {
    s.ex.push({ t:'ring', c:[-0.45,0.95,-0.3], r:0.24, ry:true, in:true });""",
  """  if (_comAsd && a === 'dtga' && o === 'none') {
    s.ex.push({ t:'ring', c:[-0.45,0.95,-0.3], r:0.24, ry:true, in:true });"""),

 # == COMMIT 4 - los dibujos de los criterios TEER ===========================================
 ('13 los dibujos vuelven a ancho completo debajo del campo', 'TC-575',
  """  .teer-figrow { display:flex; gap:8px; align-items:flex-start; }""",
  """  .teer-figrow { display:block; }"""),

 ('14 el apilado pierde su tope y el SVG se estira a 706 px', 'TC-575',
  """    .teer-figrow > .teer-fig { flex:0 0 auto; width:100%; max-width:220px; }""",
  """    .teer-figrow > .teer-fig { flex:0 0 auto; width:100%; }"""),

 # == COMMIT 5a - el papel de la miocardiopatia hipertrofica =================================
 ('15 DE MAS: la conducta y la clase vuelven al resumen, que lee la hoja del PDF', 'TC-576',
  """  let resumen = _escDesc;""",
  """  let resumen = _escDesc + _escCond;"""),

 ('16 el recuento vuelve a nombrar la guia en el cuerpo del informe', 'TC-576',
  """  let txtAHA = aha.n
    ? 'Factores mayores de riesgo de muerte súbita: ' + aha.n + ' de ' + MCH_AHA_N_MAYORES + ' (' + aha.presentes.join('; ') + ')' +""",
  """  let txtAHA = aha.n
    ? 'Factores mayores de la AHA/ACC 2020: ' + aha.n + ' de ' + MCH_AHA_N_MAYORES + ' (' + aha.presentes.join('; ') + ') — desfibrilador razonable (Clase IIa, AHA)' +"""),

 ('17 el EN SUMA vuelve a nombrar el modelo y la sociedad', 'TC-576',
  """    const l3 = 'Factores mayores ' + aha.n + '/' + MCH_AHA_N_MAYORES +""",
  """    const l3 = 'AHA/ACC ' + aha.n + '/' + MCH_AHA_N_MAYORES + ' factores mayores' +"""),

 ('18 el porcentaje del score DESAPARECE del informe: un numero medido que se pierde', 'TC-576',
  """    txtESC = 'Riesgo de muerte súbita a 5 años ' + esc.pct.toFixed(2) + ' %: riesgo ' + esc.banda + cl +""",
  """    txtESC = 'Riesgo de muerte súbita a 5 años: riesgo ' + esc.banda + cl +"""),
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
