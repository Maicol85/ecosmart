#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_p14b.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-14b (2026-11-05).

Cada mutacion revierte UNA de las cosas que los commits 1 a 7 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_p14b.py              # todas
  python3 scripts/_mut_p14b.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
CADA MUTACION DECLARA SU CASO. Correr los seis por cada una taparia un reparto mal hecho: una
   mutacion del commit 6 que mate al caso del commit 1 no esta midiendo lo que dice.
SEIS NO REVIERTEN NADA: LA APLICAN DE MAS. La 09 hace que el acceso falle CERRADO, la 14 que el
   interruptor se encienda con el predicado en falso, la 19 que el esquema entre al PDF sin su
   boton, la 32 que cmHayTunel de verdadero siempre, la 36 que la prioridad de render la lleven
   TODOS los objetos y la 37 que el anillo se dibuje sin obstruccion. Existen porque las
   condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion
   puede romper no esta probando nada.
LA 08 Y LA 16 ROMPEN LAS DOS MITADES A LA VEZ. La puerta del acceso esta en `cc3dPieSync` y en
   `cc3dAbrir`, y las marcas de «un dato, una sola puerta» estan en el SELECTOR y en el CUERPO
   del barrido de «Nuevo estudio»: una mutacion que rompa una sola sobrevive porque la otra la
   tapa. Es la leccion que el D-11 dejo escrita.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo)  -  `viejo` tiene que aparecer EXACTAMENTE una vez.
# `viejo` puede ser una LISTA de pares [(v1,n1),(v2,n2)] para romper dos mitades a la vez.
MUT = [
 ('01 cm3dDerivar vuelve a salir temprano si el panel no se ve', 'TC-699',
  "  if (!_cm3d) return;\n  if (_cm3d.modo !== 'estudio')",
  "  if (!_cm3d || !_cm3dVisible()) return;\n  if (_cm3d.modo !== 'estudio')"),

 ('02 cm3dDerivar no deriva: no llama a cmDesdeEstudio', 'TC-699',
  '  try { cmDesdeEstudio() } catch (e) {}\n  if (_cm3dVisible()) {',
  '  if (_cm3dVisible()) {'),

 ('03 cm3dDerivar no repinta la linea de abajo', 'TC-699',
  '  try { cmPdfSync() } catch (e) {}\n  try { cc3dTextoSync() } catch (e) {}\n}\nwindow.cm3dDerivar',
  '  try { cmPdfSync() } catch (e) {}\n}\nwindow.cm3dDerivar'),

 ('04 el panel no se cierra por NINGUNA de sus dos puertas', 'TC-699',
  [("  if (typeof cc3dCerrar === 'function') { try { cc3dCerrar() } catch (e) {} }\n  /* La tabla de Cardio-Oncolog\u00eda",
    "  /* La tabla de Cardio-Oncolog\u00eda"),
   ('  if (!en && _cc3d.abierto) cc3dCerrar();', '  if (false) cc3dCerrar();')]),

 ('05 «Nuevo estudio» no repone el MODO', 'TC-699',
  "try { if (_cm3d) { _cm3d.modo = 'estudio'; _cm3d.sch = false; } } catch (e) {}",
  'try { if (_cm3d) { _cm3d.sch = false; } } catch (e) {}'),

 ('06 irATabPaciente no repinta el pie, asi que el boton sobrevive en Paciente', 'TC-699',
  "    if (typeof cc3dPieSync === 'function') { try { cc3dPieSync(); } catch (e) {} }\n    window.scrollTo(0, 0);",
  "    window.scrollTo(0, 0);"),

 ('07 el esquema no se repinta por NINGUNA de las dos puertas del derivado', 'TC-699',
  [("    try { if (typeof cmSchRender === 'function') cmSchRender() } catch (e) {}",
    '    try { if (false) cmSchRender() } catch (e) {}'),
   ("  cm3dBuild = function () { build(); try { if (typeof cmSchRender === 'function') cmSchRender() } catch (e) {} };",
    '  cm3dBuild = function () { build(); try { if (false) cmSchRender() } catch (e) {} };')]),

 ('08 la puerta del acceso se abre por LAS DOS mitades a la vez', 'TC-699',
  [('  const en = cc3dAcceso() && cc3dEnCongenitas();',
    '  const en = cc3dEnCongenitas();'),
   ('  if (!cc3dAcceso()) return;\n  _cc3d.abierto = true;',
    '  _cc3d.abierto = true;')]),

 ('09 (DE MAS) el acceso falla CERRADO con el modulo habilitado', 'TC-699',
  "    if (typeof eeModOn === 'function') return !!eeModOn('congenitas');",
  "    if (typeof eeModOn === 'function') return false;"),

 ('10 ccPuertaSync deja de ir PRIMERO en RECALC_MODULOS', 'TC-676',
  "  return ['ccPuertaSync','vciNoVisSync',",
  "  return ['vciNoVisSync','ccPuertaSync',"),

 ('11 el apagado a mano deja de respetarse', 'TC-700',
  '    else if (!sw.checked && sw.dataset.ccpuertaOff !== firma) { sw.checked = true; encendio = true; }',
  '    else if (!sw.checked) { sw.checked = true; encendio = true; }'),

 ('12 el apagado a mano no se registra', 'TC-700',
  '      sw.dataset.ccpuertaOff = firma;',
  '      delete sw.dataset.ccpuertaOff;'),

 ('13 una firma nueva ya no borra el apagado a mano', 'TC-700',
  '    if (antesF !== undefined && antesF !== firma) { delete sw.dataset.ccpuertaOff; }',
  '    if (false) { delete sw.dataset.ccpuertaOff; }'),

 ('14 (DE MAS) el interruptor se enciende con el predicado en FALSO', 'TC-700',
  '    try { on = !!sc.pred(inf) } catch (e) { on = false }\n    if (!on) { delete sw.dataset.ccpuertaOff; }',
  '    try { on = true } catch (e) { on = false }\n    if (!on) { delete sw.dataset.ccpuertaOff; }'),

 ('15 los botones de estado no se repintan en la misma pasada', 'TC-700',
  "  if (encendio) {\n    if (typeof eteInclSync === 'function')",
  "  if (false) {\n    if (typeof eteInclSync === 'function')"),

 ('16 las tres marcas salen de LAS DOS listas de «Nuevo estudio» a la vez', 'TC-700',
  [(",[data-ccpuerta-off],[data-ccpuerta-vi],[data-ccpuerta-on]'",
    "'"),
   ('    delete el.dataset.ccpuertaOff; delete el.dataset.ccpuertaVi; delete el.dataset.ccpuertaOn;',
    '')]),

 ('17 el informe de la CIA vuelve a mirar SOLO el interruptor', 'TC-623',
  '  _CC_SECS.forEach(function (sc) {\n    const sw = document.getElementById(_ccPuertaSwId(sc.k));',
  '  _CC_SECS.slice(0, 0).forEach(function (sc) {\n    const sw = document.getElementById(_ccPuertaSwId(sc.k));'),

 ('18 el slot del corazon maestro vuelve a entrar en las capturas', 'TC-701',
  '      if (i === _oaiSlotUsado || i === _oaiEsqIdx || i === _tga3dEsqIdx || i === _cm3dEsqIdx) return;',
  '      if (i === _oaiSlotUsado || i === _oaiEsqIdx || i === _tga3dEsqIdx) return;'),

 ('19 (DE MAS) el esquema entra al PDF sin su boton abierto', 'TC-701',
  "function cmEsqPdfOn() { return (typeof esqEstaIncluido === 'function') && esqEstaIncluido('cm3d')\n                        && !!(_cm3d && _cm3d.sch) }",
  "function cmEsqPdfOn() { return (typeof esqEstaIncluido === 'function') && esqEstaIncluido('cm3d') }"),

 ('20 el aviso del boton deja de decir lo del esquema', 'TC-701',
  "  on:'El PDF llevará este dibujo, armado con lo cargado en las pestañas; con el esquema de circulación abierto lleva también el esquema.' });",
  "  on:'El PDF llevará este dibujo, armado con lo cargado en las pestañas.' });"),

 ('21 el boton del PDF vuelve a apagarse con una transposicion cargada', 'TC-702',
  "  if (_cm3d.modo !== 'estudio') { apagar(CM_PDF_AVISO.explorar); return }",
  "  if (_cm3d.modo !== 'estudio') { apagar(CM_PDF_AVISO.explorar); return }\n  if (_cm3d.S && _cm3d.S.base === 'tga') { apagar(CM_PDF_AVISO.tga); return }"),

 ('22 cmSchRender deja de delegar en tgaEsqCuerpo', 'TC-702',
  "  if (B === 'tga' && typeof tgaEsqCuerpo === 'function' && typeof CM_TGA_VAR !== 'undefined') {",
  "  if (false && typeof tgaEsqCuerpo === 'function' && typeof CM_TGA_VAR !== 'undefined') {"),

 ('23 tgaEsqResolver deja de resolver los var() del marcado', 'TC-693',
  "  let t = String(txt == null ? '' : txt);\n  if (t.indexOf('var(--') < 0) return t;",
  "  let t = String(txt == null ? '' : txt);\n  return t;"),

 ('25 la barra de la obstruccion desaparece del esquema del modulo', 'TC-702',
  '      if (K.tobs) {\n        const _ob = ({ dtga:[22,112], mus:[22,112], ras:[146,150], ltga:[210,208], jat:[210,208] })[_k] || [210,208];',
  '      if (false) {\n        const _ob = ({ dtga:[22,112], mus:[22,112], ras:[146,150], ltga:[210,208], jat:[210,208] })[_k] || [210,208];'),

 ('26 el recuadro viejo de la transposicion vuelve a verse', 'TC-702',
  '      <div class="calc-box" id="tga-3d-box" style="margin-top:12px;display:none;">',
  '      <div class="calc-box" id="tga-3d-box" style="margin-top:12px;">'),

 ('27 el boton «Ver en 3D» deja de delegar en cc3dAbrir', 'TC-702',
  "  if (typeof cc3dAbrir !== 'function') return;\n  if (typeof cc3dAcceso === 'function' && !cc3dAcceso()) return;",
  "  return;\n  if (typeof cc3dAcceso === 'function' && !cc3dAcceso()) return;"),

 ('28 el globo del esquema pierde su clave del registro', 'TC-535',
  '                <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="tga-esq"',
  '                <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="tga-esq-mut"'),

 ('29 las paredes del tunel vuelven al color de la sangre que llevan', 'TC-703',
  [("    s.ex.push({ t:'tube', p:bl.slice(0,5), r:0.17, c:C.violet, op:0.5, in:true },\n              { t:'tube', p:rd.slice(2,7), r:0.17, c:C.violet, op:0.5, in:true });",
    "    s.ex.push({ t:'tube', p:bl.slice(0,5), r:0.17, c:C.blue, op:0.5, in:true },\n              { t:'tube', p:rd.slice(2,7), r:0.17, c:C.red, op:0.5, in:true });")]),

 ('30 los dos rotulos del tunel se van del dibujo', 'TC-703',
  "    s.lb.push(['VD',P.LBV], ['VI',P.LBI], ['Ao',P.AO_ANT[2]], ['AP',P.PAP_T[1]],\n              ['Túnel cavas', bl[2]], ['Túnel venas pulm.', rd[4]]);",
  "    s.lb.push(['VD',P.LBV], ['VI',P.LBI], ['Ao',P.AO_ANT[2]], ['AP',P.PAP_T[1]]);"),

 ('31 la leyenda del tunel no se prende nunca', 'TC-703',
  '    const e = document.getElementById(id); if (e) e.hidden = !on });',
  '    const e = document.getElementById(id); if (e) e.hidden = true });'),

 ('32 (DE MAS) cmHayTunel da verdadero sin un tunel dibujado', 'TC-703',
  "  try { return !!(_cm3d && _cm3d.S && _cm3d.S.base === 'tga' && _cm3d.S.bv.tga === 'mus') }",
  '  try { return !!(_cm3d && _cm3d.S) }'),

 ('33 el violeta deja de salir de una sola constante', 'TC-703',
  "const TGA_ESQ_VIOLETA = '#' + TGA3D_C.violet.toString(16).padStart(6, '0');",
  "const TGA_ESQ_VIOLETA = '#f59e0b';"),

 ('34 la leyenda del tunel no se pone al dia por NINGUNA de sus dos puertas', 'TC-703',
  [("  try { if (typeof cmTunelLeySync === 'function') cmTunelLeySync() } catch (e) {}\n  try { cmPdfSync() } catch (e) {}",
    '  try { if (false) cmTunelLeySync() } catch (e) {}\n  try { cmPdfSync() } catch (e) {}'),
   ("  try { if (typeof cmTunelLeySync === 'function') cmTunelLeySync() } catch (e) {}\n  try { if (typeof cmSchRender === 'function') cmSchRender() } catch (e) {}}",
    '  try { if (false) cmTunelLeySync() } catch (e) {}\n  try { if (typeof cmSchRender === "function") cmSchRender() } catch (e) {}}')]),

 ('35 el anillo vuelve a la posicion fija de la demo, sin leer la escena', 'TC-704',
  '    const po = _r0 ? [_r0[0], _r0[1] - 0.30, _r0[2]]',
  '    const po = false ? [_r0[0], _r0[1] - 0.30, _r0[2]]'),

 ('36 el anillo pierde su prioridad de render', 'TC-704',
  "    s.ex.push({ t:'ring', c:po, r:0.26, col:CM_C.grey, pri:true });",
  "    s.ex.push({ t:'ring', c:po, r:0.26, col:CM_C.grey });"),

 ('37 (DE MAS) la prioridad de render la llevan TODOS los objetos', 'TC-704',
  '        if(e.pri){m.material.depthTest=false;m.material.depthWrite=false;m.renderOrder=10;}',
  '        if(true){m.material.depthTest=false;m.material.depthWrite=false;m.renderOrder=10;}'),

 ('38 (DE MAS) el anillo se dibuja sin obstruccion cargada', 'TC-704',
  '  if (K.tobs) {\n    /* ',
  '  if (true) {\n    /* '),

]

def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion:', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%s condicion(es), %s excepcion(es)' % (nC, nE)
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:160].replace('\n', ' ')

def main():
    solo = None
    args = sys.argv[1:]
    for i, a in enumerate(args):
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else args[i + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom, caso = ent[0], ent[1]
            pares = ent[2] if (len(ent) == 3 and isinstance(ent[2], list)) else [(ent[2], ent[3])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, caso, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, caso, v, det))
            print('  %02d  %-11s %-8s %s  -  %s' % (i, v, caso, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[3] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, caso, v, det in res:
        if v != 'MUERTA':
            print('    %02d %s [%s] %s - %s' % (i, v, caso, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
