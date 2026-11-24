#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr7.py - barrido de MUTACIONES DIRIGIDAS de la tanda PR7 (2026-11-23/24).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr7.py              # todas
  python3 scripts/_mut_pr7.py --solo 1,2   # algunas
  python3 scripts/_mut_pr7.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba su
md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y la
medicion siguiente se hace sobre un archivo envenenado.

EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay ningun
signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
cobertura». Sin esa linea el veredicto es NO CORRIO.

LAS ANCLAS SE VERIFICAN ANTES DE CORRER (--anclas), que es lo que PANT-19 pago con siete anclas
que no aplicaron por escribirlas con secuencias de escape en vez del caracter real.

AL MENOS DOS POR GRUPO, que es lo que la orden pide, y los grupos son los de la verificacion:
los tramos y sus bordes (1), el boton apagado (2), el boton encendido (3), el guardado y la
migracion (4), «Limpiar» (5), los textos sin la marca (6), la leyenda (7), los patrones (8) y el
PDF (9).

CINCO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS -que la paleta de la motilidad no se haya tocado, que «Limpiar» no toque el
SGL global ni las notas, que el ciclo borre el numero, que Escape no escriba y que «Arterias
posiblemente involucradas» no llegue al papel-, y un control negativo que ninguna mutacion puede
romper no prueba nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) - `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # == GRUPO 1 - LOS TRAMOS Y SUS BORDES ========================================
 ('01 el borde cae en el tramo de su IZQUIERDA (se usa ceil en vez de floor)', 'TC-1042',
  '  const i = Math.floor((v - STRAIN_MIN) / STRAIN_PASO) + 1;',
  '  const i = Math.ceil((v - STRAIN_MIN) / STRAIN_PASO) + 1;'),

 ('02 el extremo NO se acota: fuera de rango sale de la paleta', 'TC-1042',
  '  return Math.max(1, Math.min(STRAIN_N_TRAMOS, i));',
  '  return i;'),

 ('03 el paso del tramo es de CUATRO puntos y no de cinco', 'TC-1042',
  'const STRAIN_MIN = -20, STRAIN_PASO = 5;',
  'const STRAIN_MIN = -20, STRAIN_PASO = 4;'),

 ('04 el numero sale en gris oscuro tambien sobre los tramos oscuros', 'TC-1042',
  "  Object.freeze({ color:'#6A1B9A', rango:'-20 a -15', txt:'#FFFFFF' }),",
  "  Object.freeze({ color:'#6A1B9A', rango:'-20 a -15', txt:'#2B2B2B' }),"),

 ('05 la paleta de la MOTILIDAD se repinta con la de strain (se aplica de mas)', 'TC-1042',
  '  {nombre:"Normal",        color:"#22C55E"},',
  "  {nombre:\"Normal\",        color:'#6A1B9A'},"),

 # == GRUPO 2 - EL BOTON APAGADO ===============================================
 # /!\ ESTA MUTACION ERA EQUIVALENTE EN SU PRIMERA VERSION: agregaba un atributo que nadie lee,
 # asi que no cambiaba la conducta. Hoy ataca el VALOR POR OMISION del estado, que es lo unico
 # que decide con que color nace un segmento que nadie toco -el marcado lo repinta
 # `strainAplicarTodos` en cuanto se dibuja-.
 ('06 los segmentos arrancan en el tramo 1 y no SIN DATO', 'TC-1043',
  "function strainColor(id){ return (STRAIN_PAL[strainEstado[id] || 0] || STRAIN_PAL[0]).color; }",
  "function strainColor(id){ return (STRAIN_PAL[strainEstado[id] || 1] || STRAIN_PAL[0]).color; }"),

 ('07 el ciclo tiene OCHO estados y nunca vuelve a sin dato', 'TC-1043',
  'function strainCiclar(id){ strainSet(id, ((strainEstado[id] || 0) + 1) % (STRAIN_N_TRAMOS + 1), null); }',
  'function strainCiclar(id){ strainSet(id, 1 + (((strainEstado[id] || 0)) % STRAIN_N_TRAMOS), null); }'),

 ('08 el toque CONSERVA el numero: el color y el numero pueden contradecirse', 'TC-1043',
  '  if (strainNumModoOn()) strainCajaAbrir(id, el);\n  else strainCiclar(id);',
  '  if (strainNumModoOn()) strainCajaAbrir(id, el);\n  else strainSet(id, ((strainEstado[id] || 0) + 1) % (STRAIN_N_TRAMOS + 1), strainNum[id]);'),

 ('09 el segmento sin dato no muestra el guion', 'TC-1043',
  "  if ((strainEstado[id] || 0) === 0) return '\u2013';",
  "  if ((strainEstado[id] || 0) === 0) return '';"),

 # == GRUPO 3 - EL BOTON ENCENDIDO =============================================
 ('10 el interruptor nace ENCENDIDO', 'TC-1044',
  'let strainNumModo = false;',
  'let strainNumModo = true;'),

 ('11 sin signo el valor se toma POSITIVO', 'TC-1044',
  '  return mas ? a : -a;',
  '  return a;'),

 ('12 el mas explicito NO se respeta: todo sale negativo, como el campo global', 'TC-1044',
  "  const mas = t.charAt(0) === '+';",
  "  const mas = false && t.charAt(0) === '+';"),

 ('13 la coma decimal no se convierte', 'TC-1044',
  "  t = t.replace(/,/g, '.').replace(/\\s/g, '');",
  "  t = t.replace(/\\s/g, '');"),

 ('14 el menos tipografico no vale como menos', 'TC-1044',
  "  t = t.replace(/\u2212/g, '-').replace(/\u2013/g, '-').replace(/\u2014/g, '-');",
  "  t = t.replace(/\u2013/g, '-').replace(/\u2014/g, '-');"),

 ('15 Escape CONFIRMA en vez de cancelar', 'TC-1044',
  "    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); strainCajaCerrar(false); }",
  "    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); strainCajaCerrar(true); }"),

 ('16 la casilla lleva un id y entraria al censo del estudio (se aplica de mas)', 'TC-1044',
  "  inp.setAttribute('data-strain-caja', id);",
  "  inp.setAttribute('data-strain-caja', id); inp.id = 'strain_caja_' + id;"),

 # == GRUPO 4 - EL GUARDADO Y LA MIGRACION =====================================
 ('17 los numeros no se guardan con el estudio', 'TC-1045',
  "  campos['strain_sgl_num'] = JSON.stringify(strainNum);",
  "  campos['strain_sgl_num'] = '{}';"),

 ('18 el estudio viejo NO se migra: los indices se toman como tramos', 'TC-1045',
  '  const viejo = (ver !== STRAIN_VER);',
  '  const viejo = false;'),

 ('19 el 0 viejo se migra a «Normal» en vez de a SIN DATO', 'TC-1045',
  'const STRAIN_MIGRA = Object.freeze([0, 2, 3, 5, 7]);',
  'const STRAIN_MIGRA = Object.freeze([1, 2, 3, 5, 7]);'),

 ('20 el numero se repone aunque no derive el tramo guardado', 'TC-1045',
  "      if ((strainEstado[k] || 0) === strainTramoDe(v)) strainNum[k] = Math.round(v * 10) / 10;",
  "      strainNum[k] = Math.round(v * 10) / 10;"),

 # == GRUPO 5 - «LIMPIAR» ======================================================
 ('21 «Limpiar» no borra los numeros', 'TC-1046',
  "  Object.keys(strainNum).forEach(function (k) { delete strainNum[k]; });",
  "  void 0;"),

 ('22 «Limpiar» tambien borra el SGL global y las notas (se aplica de mas)', 'TC-1046',
  "  strainCajaCerrar(false);\n  strainAplicarTodos();",
  "  strainCajaCerrar(false);\n  try { document.getElementById('sgl_gls').value = ''; document.getElementById('sgl_notas').value = ''; } catch (e) {}\n  strainAplicarTodos();"),

 # == GRUPO 6 - LOS TEXTOS SIN LA MARCA ========================================
 ('23 la frase de arriba vuelve a nombrar la escala de la marca', 'TC-1047',
  'para cambiar el color del strain, o activá',
  'según la escala General Electric, o activá'),

 ('24 el titulo de la leyenda vuelve a decir «(GE)»', 'TC-1047',
  '>Referencia de colores</div>',
  '>Referencia de colores (GE)</div>'),

 # == GRUPO 7 - LA LEYENDA =====================================================
 ('25 la leyenda publica SIETE cuadritos y no ocho', 'TC-1048',
  '  for (let i = 1; i <= STRAIN_N_TRAMOS; i++) {',
  '  for (let i = 1; i <= STRAIN_N_TRAMOS - 1; i++) {'),

 ('26 la leyenda pierde el cuadrito de «Sin dato»', 'TC-1048',
  "    + ';display:inline-block;border:1px solid #9aa0ae;\"></span>Sin dato</div>';",
  "    + ';display:inline-block;border:1px solid #9aa0ae;\"></span></div>';"),

 ('27 la leyenda vuelve a rotular nombres de categoria', 'TC-1048',
  "       + (v > 0 ? '+' : '') + v + '</div>';",
  "       + (v > 0 ? 'Acinesia' : 'Normal') + '</div>';"),

 ('28 la barra del PDF no dibuja sus ocho marcas', 'TC-1048',
  "          STRAIN_MARCAS.forEach((v, i) => {\n            doc.text(((v > 0 ? '+' : '') + v), _lx + i * _bw + _bw / 2, _ly + 2.6, { align:'center' });\n          });",
  "          STRAIN_MARCAS.forEach((v, i) => { void i; });"),

 # == GRUPO 8 - LOS PATRONES DE EJEMPLO ========================================
 ('29 los patrones vuelven a la paleta vieja', 'TC-1049',
  "const C = {\n  N:  _CT(1), H1: _CT(2), H2: _CT(3), H3: _CT(4),\n  AC: _CT(5), D1: _CT(6), D2: _CT(7), GR: _CT(0)\n};",
  "const C = {\n  N:  '#DC2626', H1: '#F87171', H2: '#FECACA', H3: '#FECACA',\n  AC: '#93C5FD', D1: '#1D4ED8', D2: '#1D4ED8', GR: '#9E9E9E'\n};"),

 ('30 el normal de los patrones se pinta con un color que no es de la paleta', 'TC-1049',
  '  N:  _CT(1), H1: _CT(2), H2: _CT(3), H3: _CT(4),',
  "  N:  '#DC2626', H1: _CT(2), H2: _CT(3), H3: _CT(4),"),

 # == GRUPO 9 - EL PDF =========================================================
 ('31 el SGL global y las notas vuelven a pegarse en un renglon unico', 'TC-1050',
  "      if (_gls) _lin.push('SGL global: ' + _gls + ' %');\n      if (_nt) String(_nt).split('\\n').forEach(function (t) { if (t.trim()) _lin.push(t.trim()); });",
  "      const _j = [_gls ? ('SGL global: ' + _gls + ' %') : '', _nt].filter(Boolean).join(' \\u00b7 ');\n      if (_j) _lin.push(_j.replace(/\\n/g, ' '));"),

 ('32 las oraciones de motilidad vuelven a pegarse con un separador', 'TC-1050',
  "                  sub: 'Motilidad', leyenda: CONTR_MOTILIDAD, lineas: _ctL.slice() });",
  "                  sub: 'Motilidad', leyenda: CONTR_MOTILIDAD, lineas: _ctL.length ? [_ctL.join(' \\u00b7 ')] : [] });"),

 ('33 el texto vuelve al PIE del tile y no a la derecha de su dibujo', 'TC-1050',
  "      if (p.lineas && p.lineas.length) {\n        _ly += 1.2;",
  "      if (false && p.lineas && p.lineas.length) {\n        _ly += 1.2;"),

 ('34 la columna derecha cambia de ancho segun si la parte tiene texto', 'TC-1050',
  "    const _hayTxt = t.partes.some(p => (p.lineas && p.lineas.length) || p.leyenda || p.barra);\n    const _legW = !_hayTxt ? 0 : Math.max(22, Math.min(_n === 1 ? 62 : 40, _pw * (_n === 1 ? 0.34 : 0.44)));",
  "    const _hayTxt = t.partes.some(p => (p.lineas && p.lineas.length) || p.leyenda || p.barra);\n    const _legW0 = !_hayTxt ? 0 : Math.max(22, Math.min(_n === 1 ? 62 : 40, _pw * (_n === 1 ? 0.34 : 0.44)));"),

 ('35 «Arterias posiblemente involucradas» llega al PDF (se aplica de mas)', 'TC-1050',
  "      _dgP.push({ data: bullseyeDataURL(id => (CONTR_MOTILIDAD[(contrEstado[id]||0)] || CONTR_MOTILIDAD[0]).color),\n                  sub: 'Motilidad', leyenda: CONTR_MOTILIDAD, lineas: _ctL.slice() });",
  "      const _ar = (function(){ try { const z = document.getElementById('contr-arterias');\n        return (z && z.textContent.trim()) ? ['Arterias posiblemente involucradas: ' + z.textContent.trim().slice(0, 40)] : [] } catch (e) { return [] } })();\n      _dgP.push({ data: bullseyeDataURL(id => (CONTR_MOTILIDAD[(contrEstado[id]||0)] || CONTR_MOTILIDAD[0]).color),\n                  sub: 'Motilidad', leyenda: CONTR_MOTILIDAD, lineas: _ctL.slice().concat(_ar) });"),

 ('36 el bull is eye del PDF no estampa los numeros de los segmentos', 'TC-1050',
  "      _dgP.push({ data: bullseyeDataURL(id => strainColor(id), id => strainNumTxt(id), id => strainColorTxt(id)),\n                  sub: 'Strain (SGL)', barra: true, lineas: _lin });",
  "      _dgP.push({ data: bullseyeDataURL(id => strainColor(id)),\n                  sub: 'Strain (SGL)', barra: true, lineas: _lin });"),
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
        if nE and not nC:
            return 'MUERTA(EXC)', 'cayo por EXCEPCION y no por condiciones'
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

def main():
    solo = None
    soloAnclas = '--anclas' in sys.argv
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    print('  md5 del arbol: %s' % m0[:8])
    malas = [(i, n) for i, (n, c, v, _) in enumerate(MUT, 1) if orig.count(v) != 1]
    for i, n in malas:
        print('  %02d  ANCLA x%d  %s' % (i, orig.count(MUT[i-1][2]), n))
    print('  anclas que emparejan exactamente una vez: %d/%d' % (len(MUT) - len(malas), len(MUT)))
    if soloAnclas:
        return 0 if not malas else 1
    bak = tempfile.mktemp(suffix='.html'); shutil.copy2(IDX, bak)
    res = []
    try:
        for i, (nom, caso, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            if orig.count(viejo) != 1:
                res.append((i, nom, caso, 'NO APLICA', 'apariciones: %d' % orig.count(viejo)))
                print('  %02d  NO APLICA  %s' % (i, nom), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, caso, v, det))
            print('  %02d  %-11s %s  [%s]  —  %s' % (i, v, nom, caso, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[3].startswith('MUERTA'))
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, caso, v, det in res:
        if not v.startswith('MUERTA'):
            print('    ⚠️ %02d %s %s [%s] — %s' % (i, v, nom, caso, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
