#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_t2.py — barrido de MUTACIONES DIRIGIDAS de la TANDA TGA-2 (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1 a 5 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_t2.py              # todas
  python3 scripts/_mut_t2.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cuatro por cada una: TC-564 cubre el papel y
el dibujo de Jatene y Rastelli, TC-565 el panel de la transposicion, TC-566 los de la CIA y la
CIV, y TC-567 el de la muerte subita. Una mutacion del commit 1 que pusiera rojo a TC-565
estaria diciendo que el reparto esta mal, no que la cobertura exista.

TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 03 hace que el switch auricular
caiga tambien en la rama descriptiva —o sea que el papel deje de decir lo que SI tiene que
decir—, la 09 que esconder la fila BORRE el valor, y la 10 que «sin dato» cuente como «no».
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

 # ══ COMMIT 1 · el papel de Jatene y Rastelli ═══════════════════════════════════════════════
 ('01 la frase de la cirugia no reconoce el switch arterial', 'TC-564',
  "  if (ej.cir === 'jatene') return 'operada, con switch arterial (Jatene)';",
  "  if (ej.cir === 'jatene') return '';"),

 ('02 la rama descriptiva deja de cubrir el Rastelli', 'TC-564',
  "  if (_ejC.cir === 'jatene' || _ejC.cir === 'rastelli') {",
  "  if (_ejC.cir === 'jatene') {"),

 ('03 DE MAS: el switch auricular tambien cae en la rama descriptiva', 'TC-564',
  "  if (_ejC.cir === 'jatene' || _ejC.cir === 'rastelli') {",
  "  if (_ejC.cir === 'jatene' || _ejC.cir === 'rastelli' || _ejC.cir === 'auricular') {"),

 ('04 el EN SUMA no corta: vuelve a afirmar cual es el ventriculo sistemico', 'TC-564',
  "    if (_ejS && (_ejS.cir === 'jatene' || _ejS.cir === 'rastelli')) {",
  "    if (false && _ejS && (_ejS.cir === 'jatene' || _ejS.cir === 'rastelli')) {"),

 ('05 la rama descriptiva publica igual la funcion del VD sistemico, que esta PARADA', 'TC-564',
  "    const pd = [_cab];\n    if (obstr === 'si')",
  "    const pd = [_cab];\n    if (func) pd.push('Función del ventrículo derecho sistémico ' + func);\n    if (obstr === 'si')"),

 ('06 el bloqueo AV vuelve con la clausula que nombra la ccTGA', 'TC-564',
  "    if (bav === 'si') pd.push('Bloqueo auriculoventricular completo');",
  "    if (bav === 'si') pd.push('Bloqueo auriculoventricular completo, complicación esperable en la ccTGA por la disposición del sistema de conducción');"),

 ('07 el mapa al vocabulario de la demo pierde el Rastelli', 'TC-564',
  "const TGA_CIR_OP = Object.freeze({ auricular:'mus', jatene:'jat', rastelli:'ras' });",
  "const TGA_CIR_OP = Object.freeze({ auricular:'mus', jatene:'jat' });"),

 ('08 la fila de funcion del VD sistemico deja de esconderse', 'TC-564',
  "  if (_fvd) _fvd.style.display = (_ej.cir === 'jatene' || _ej.cir === 'rastelli') ? 'none' : '';",
  "  if (_fvd) _fvd.style.display = '';"),

 ('09 DE MAS: esconder la fila BORRA el valor del estudio', 'TC-564',
  "  if (_fvd) _fvd.style.display = (_ej.cir === 'jatene' || _ej.cir === 'rastelli') ? 'none' : '';",
  "  if (_fvd) { const _oc = (_ej.cir === 'jatene' || _ej.cir === 'rastelli');\n    _fvd.style.display = _oc ? 'none' : '';\n    if (_oc) { const _f = document.getElementById('tga_func_vd'); if (_f) _f.value = ''; } }"),

 # ══ COMMIT 2 · el panel de la transposicion ════════════════════════════════════════════════
 ('10 DE MAS: en el panel de la TGA, «sin dato» cuenta como «no»', 'TC-565',
  "    if (o.val === 'si') si.push(p.lbl); else if (o.val === 'no') no.push(p.lbl); else sd.push(p.lbl);",
  "    if (o.val === 'si') si.push(p.lbl); else no.push(p.lbl);"),

 ('11 el panel de la TGA no reparte por situacion: siempre el switch auricular', 'TC-565',
  "  const grupo = (ej.anat === 'ltga') ? 'cc'\n              : (ej.cir === 'auricular') ? 'aur'\n              : (ej.cir === 'jatene') ? 'jat'\n              : (ej.cir === 'rastelli') ? 'ras' : null;",
  "  const grupo = 'aur';"),

 # ══ COMMITS 3 Y 4 · la CIA y la CIV ════════════════════════════════════════════════════════
 ('12 la CIA vuelve a su unica fila de solo lectura, sin botonera', 'TC-566',
  "  return { filas: filas,\n    clinica: clinica,\n    bloques: [\n      { tit:'Indicación de cierre y método",
  "  return { filas: filas,\n    clinica: [_indFila('Resistencia vascular pulmonar < 3 UW', '—', 'ask', 'es la compuerta de la guía')],\n    bloques: [\n      { tit:'Indicación de cierre y método"),

 ('13 la CIV pierde la fila de contraindicacion de su tabla', 'TC-566',
  "        { txt:'Clase III · Nivel C — El cierre no se recomienda en la fisiología de Eisenmenger ni con hipertensión arterial pulmonar severa (resistencia de 5 UW o más) que se presenta con desaturación en el ejercicio.",
  "        { txt:'El cierre no se recomienda en la fisiología de Eisenmenger ni con hipertensión arterial pulmonar severa (resistencia de 5 UW o más) que se presenta con desaturación en el ejercicio."),

 # ══ COMMIT 5 · la muerte subita de la MCH ══════════════════════════════════════════════════
 ('14 la seccion de muerte subita pasa a exigir obstruccion, como la de reduccion septal', 'TC-567',
  "function _indMCHSCD(){\n  const concl = _indFn('mchConclusion');\n  const C = concl ? concl() : null;\n  if (!C) return null;",
  "function _indMCHSCD(){\n  const concl = _indFn('mchConclusion');\n  const C = concl ? concl() : null;\n  if (!C) return null;\n  { const _g = _indFn('mchGrad'); const _G = _g ? _g() : null; if (!_G || !_ge(_G.max, 30)) return null; }"),
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
