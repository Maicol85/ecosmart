#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr9.py - barrido de MUTACIONES DIRIGIDAS de la tanda PR9 (2026-11-25).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr9.py              # todas
  python3 scripts/_mut_pr9.py --solo 1,2   # algunas
  python3 scripts/_mut_pr9.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba su
md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y la
medicion siguiente se hace sobre un archivo envenenado.

EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay ningun
signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
cobertura». Sin esa linea el veredicto es NO CORRIO.

LAS ANCLAS SE VERIFICAN ANTES DE CORRER (--anclas), que es lo que PANT-19 pago con siete anclas
que no aplicaron por escribirlas con secuencias de escape en vez del caracter real.

AL MENOS DOS POR GRUPO, que es lo que la orden pide, y los grupos son los seis de su lista de
tests: la tabla de strain (1), el PDF «Tipo Word» (2), los recuadros (3), el ingreso del SGL (4),
el cartel de FEVI/SGL (5) y el redondeo (6).

CUATRO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS -que el globo no lleve title, que la regla de la celda no se afloje, que el
redondeo no se vaya para el otro lado y que las otras plantillas de PDF no se muevan-, y un
control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) - `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 ('01 la lista de lo que falta vuelve al cuerpo de la celda', 'TC-1058',
  '      td.appendChild(lin);\n      tr.appendChild(td);',
  "      td.appendChild(lin);\n      if (motivo) { const fa = document.createElement('div');\n                    fa.className = 'sc-falta'; fa.textContent = motivo; td.appendChild(fa); }\n      tr.appendChild(td);"),
 ('02 el icono apagado vuelve a llevar el atributo disabled', 'TC-1058',
  "  if (apagado) {\n    b.setAttribute('aria-disabled', 'true');",
  "  if (apagado) {\n    b.disabled = true;\n    b.setAttribute('aria-disabled', 'true');"),
 ('03 los iconos vuelven a medir 44 px de caja', 'TC-1058',
  '            width:14px; height:14px; min-width:0; min-height:0; cursor:pointer;',
  '            width:44px; height:44px; min-width:0; min-height:0; cursor:pointer;'),
 ('04 DE MAS: el globo recupera el atributo title (control de TC-500 (A3))', 'TC-1058',
  "  bi.textContent = 'ⓘ';",
  "  bi.setAttribute('title', etiqueta);\n  bi.textContent = 'ⓘ';"),
 ('05 los nombres vuelven a traer el rango de segmentos en la celda', 'TC-1058',
  "      { k:'basal',  nom:'Basal',  tipo:'prom', grupo:'basal',  info:'sc-niv' },",
  "      { k:'basal',  nom:'Basal (1-6)',  tipo:'prom', grupo:'basal',  info:'sc-niv' },"),
 ('06 el icono de accion vuelve a ser un emoji en vez de un SVG', 'TC-1058',
  '  b.appendChild(_scSvg(cual));',
  "  b.textContent = (cual === 'calc') ? '\\ud83e\\uddee' : '\\u2b06\\ufe0f';"),
 ('07 la narrativa vuelve a su cuerpo propio (8 * _FS = 8,56 pt)', 'TC-1059',
  '    else if (_TW) twn(); else fn(8);',
  '    else fn(8);'),
 ('08 el EN SUMA vuelve a su cuerpo propio (8 * _FSF = 9,2 pt)', 'TC-1059',
  '      twn();\n      cuadSumaItems(sumaTxt)',
  "      doc.setFont('helvetica', 'normal'); doc.setFontSize(8 * _FSF);\n      cuadSumaItems(sumaTxt)"),
 ('09 el renglon en blanco vuelve a meter aire irregular', 'TC-1059',
  "          if (l === '') return;",
  "          if (l === '') { y += _ILW * 0.6; return; }"),
 ('10 el cuerpo baja a 8 pt, por debajo del piso de 9 que la orden fija', 'TC-1059',
  '  const TW_PT = 10, TW_PT_FICHA = 8;',
  '  const TW_PT = 8, TW_PT_FICHA = 8;'),
 ('11 los titulos de seccion vuelven a su cuerpo propio (9 * _FS = 9,63 pt)', 'TC-1059',
  '        twb();',
  "        doc.setFont('helvetica', 'bold'); doc.setFontSize(9 * _FS);"),
 ('12 DE MAS: el cuerpo unico alcanza tambien al estilo clasico (control de que no se toco)', 'TC-1059',
  "  const _TW = (_plantillaId === 'tipoword');",
  "  const _TW = (_plantillaId === 'tipoword' || _plantillaId === 'clasico');"),
 ('13 el recuadro deja de reservar su aire de salida al DIBUJAR', 'TC-1060',
  '      y += altoN + _SEP(p.H);',
  '      y += altoN;'),
 ('14 el aire de salida se saca de plan() Y del dibujo: vuelve el solape de 2,44 mm', 'TC-1060',
  '  const _SEP = (H) => H * 0.78;',
  '  const _SEP = (H) => 0;'),
 ('15 la franja de titulo vuelve a su avance viejo: su subtitulo queda pegado', 'TC-1060',
  '      y += 7 + 1.5 + _SEP(p.H);',
  '      y += 8.5 + 1.5;'),
 ('16 strainEscribir deja de validar: vuelve a guardar un valor imposible', 'TC-1061',
  '  if (!strainTxtValido(txt)) {',
  '  if (false && !strainTxtValido(txt)) {'),
 ('17 el filtro en vivo de la casilla deja de actuar: se puede teclear y pegar cualquier cosa', 'TC-1061',
  '    if (STRAIN_RE_PARCIAL.test(strainNormTxt(inp.value))) { _ult = inp.value; return; }',
  '    if (true) { _ult = inp.value; return; }'),
 ('18 la restauracion vuelve a reponer un valor imposible guardado en disco', 'TC-1061',
  '      if (!strainNumValido(v)) { _malos++; strainEstado[k] = 0; delete strainNum[k]; return; }',
  '      if (false) { _malos++; strainEstado[k] = 0; delete strainNum[k]; return; }'),
 ('19 DE MAS: la regla se afloja a TRES cifras enteras (control del rechazo)', 'TC-1061',
  'const STRAIN_ENT_MAX = 2;',
  'const STRAIN_ENT_MAX = 3;'),
 ('20 DE MAS: la regla acepta tres cifras tambien en el TEXTO', 'TC-1061',
  'const STRAIN_RE_OK = /^[+-]?[0-9]{1,2}([.][0-9]{1,2})?$/;',
  'const STRAIN_RE_OK = /^[+-]?[0-9]{1,4}([.][0-9]{1,2})?$/;'),
 ('21 el cartel vuelve al texto viejo: no dice la FEVI de la aplicacion', 'TC-1062',
  "    if (g === null) return 'Falta: SGL global.' + conFevi;",
  "    if (g === null) return 'Falta: SGL global';"),
 ('22 scRender sale del barrido de espejos: cambiar la FEVI no borra el resultado', 'TC-1062',
  "          'scRender'];",
  "          'cm3dEstudioSync'];"),
 ('23 el cartel deja de nombrar la aplicacion cuando falta la FEVI', 'TC-1062',
  "    if (f === null) return 'Falta: FEVI en la app';",
  "    if (f === null) return 'Falta: FEVI';"),
 ('24 el redondeo vuelve a Math.round pelado: asimetrico entre signos', 'TC-1063',
  '  const r = Math.round(Math.abs(v) * f) / f;\n  return v < 0 ? -r : r;',
  '  return Math.round(v * f) / f;'),
 ('25 DE MAS: el medio se redondea HACIA el cero en los dos signos', 'TC-1063',
  '  const r = Math.round(Math.abs(v) * f) / f;',
  '  const r = Math.ceil(Math.abs(v) * f - 0.5) / f;'),
 ('26 «Usar como SGL global» vuelve a redondear por su cuenta', 'TC-1063',
  '  const val = String(_scRed(n, 1));',
  '  const val = String(Math.round(n * 10) / 10);'),
]

def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    # ** LOS CHROME HUERFANOS AHOGAN EL BARRIDO, y el sintoma se lee como «esto tarda»: cuatro
    #    minutos por mutacion cuando una corrida aislada tarda menos de veinte segundos. El arnes
    #    del suite deja su arbol de Chrome con el servidor escuchando; se cierran aca, despues de
    #    CADA corrida. No alcanza al Chrome del medico, que no corre con --user-data-dir en el
    #    temporal. Es la leccion que PANT-37 estuvo a punto de pagar recortando la cobertura.
    subprocess.run(['pkill', '-f', 'remote-debugging-port=0 --user-data'],
                   capture_output=True)
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
