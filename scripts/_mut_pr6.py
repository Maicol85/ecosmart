#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr6.py — barrido de MUTACIONES DIRIGIDAS de la tanda PR6 (2026-11-23).

Cada mutacion revierte UNA de las cosas que los cinco commits de codigo cambiaron —o la aplica DE
MAS— sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr6.py              # todas
  python3 scripts/_mut_pr6.py --solo 1,2   # algunas
  python3 scripts/_mut_pr6.py --anclas     # SOLO verifica que las anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba su
md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y la
medicion siguiente se hace sobre un archivo envenenado.

EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay ningun
signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
cobertura». Sin esa linea el veredicto es NO CORRIO.

LAS ANCLAS SE VERIFICAN ANTES DE CORRER (--anclas), que es lo que PANT-19 pago con siete anclas
que no aplicaron por escribirlas con secuencias de escape en vez del caracter real.

AL MENOS DOS POR GRUPO, que es lo que la orden pide, y los grupos son las tareas: el interruptor
del resumen de valvulas (TAREA 2), el texto tipo Word y sus dos botones (TAREA 3), el noveno
estilo de PDF (TAREA 4) y los cuatro contenidos de la Evidencia con la frase retirada (TAREA 5).
La TAREA 1 ya estaba hecha al abrir la tanda, asi que sus mutaciones atacan lo que TC-1041 agrega
sobre los casos que ya existian.

CUATRO NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS —que el interruptor venga apagado, que el texto NO publique hallazgos de
valvula, que «Tipo Word» IGNORE el interruptor y que la copia NO dependa de los cuadros
quitados—, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
# (nombre, caso, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ══ TAREA 2 · el interruptor del resumen de valvulas ══════════════════════════
 ('01 el interruptor nace PRENDIDO', 'TC-1038',
  'let _cuadResumenValv = false;',
  'let _cuadResumenValv = true;'),

 ('02 el PDF dibuja el resumen SIN mirar el interruptor (se aplica de mas)', 'TC-1038',
  '    if (cuadResumenValvOn()) {\n      const _rv = cuadResumenValvDefs();',
  '    if (true) {\n      const _rv = cuadResumenValvDefs();'),

 ('03 el interruptor se APAGA con «Restablecer»', 'TC-1038',
  'function cuadReset() { _cuadQuit = []; _cuadOrden = null; }',
  'function cuadReset() { _cuadQuit = []; _cuadOrden = null; _cuadResumenValv = false; }'),

 ('04 la casilla del interruptor gana un `id`, asi que entra al censo del estudio', 'TC-1038',
  '        <input type="checkbox" onchange="cuadResumenValvToggle(this.checked)">',
  '        <input type="checkbox" id="cuad_rv_chk" onchange="cuadResumenValvToggle(this.checked)">'),

 ('05 el resumen devuelve TAMBIEN la seccion «Otros», que es el cuadro doce', 'TC-1038',
  '  return defs.filter(cuadConDatos);\n}\nwindow.cuadResumenValvDefs',
  "  defs.push({ id:'rv_otros', titulo:'Otros', items:[{ lbl:'Pericardio', val: sv('pericardio') || null }] });\n  return defs.filter(cuadConDatos);\n}\nwindow.cuadResumenValvDefs"),

 ('06 el resumen vuelve a traer la columna de valores de referencia', 'TC-1038',
  "    { lbl:'VC IM',    val: vPdf('im_vc', ' mm') },",
  "    { lbl:'VC IM',    ref:'(<3 / 3-7 / >=7) mm', val: vPdf('im_vc', ' mm') },"),

 # ══ TAREA 3 · el texto tipo Word ══════════════════════════════════════════════
 ('07 las secciones se emiten en el orden de los cuadros y no en el de la orden', 'TC-1035',
  '  CW_SECS.forEach(function (s) { const a = armar(s); if (a) out.push(a); });',
  '  CW_SECS.slice().reverse().forEach(function (s) { const a = armar(s); if (a) out.push(a); });'),

 ('08 una seccion sin un solo dato SALE igual, con su titulo pelado', 'TC-1035',
  '    return lineas.length ? { tit: sec.tit, lineas: lineas } : null;',
  '    return { tit: sec.tit, lineas: lineas };'),

 # ⚠️ REAPUNTADA. La primera version vaciaba CW_NO_MEDIDA, y eso NO TIENE EFECTO OBSERVABLE: esa
 # lista filtra los items de cuadDefs(), y ninguno de los doce cuadros tiene una fila de hallazgo
 # -la morfologia y los grados viven en las lineas de valvula, como TEXTO-; en _cwIndiceValv si
 # filtra, pero NINGUNA tabla de orden referencia esas claves, asi que tampoco cambia la salida.
 # Es una lista DECLARATIVA cuya exclusion ya esta garantizada por las tablas de orden: la
 # mutacion era EQUIVALENTE, no un hueco de cobertura. Declarado en PR6-d.
 # Lo que SI muerde es la forma real en que un hallazgo podria filtrarse al papel: que una tabla
 # de orden lo referencie. Esta mutacion hace exactamente eso.
 # ⚠️ REAPUNTADA DOS VECES, Y LO QUE LAS DOS PRIMERAS ENSEÑARON QUEDA ESCRITO.
 # (1) Vaciar CW_NO_MEDIDA no tiene efecto observable: esa lista filtra los items de cuadDefs(), y
 #     ninguno de los doce cuadros tiene una fila de hallazgo -la morfologia y los grados viven en
 #     las lineas de valvula, como TEXTO-.
 # (2) Referenciar 'IM' o 'Morf.' desde una tabla de orden TAMPOCO: esas claves nunca entran al
 #     indice de la fila de valvulas, porque _cwIndiceValv SI filtra por CW_NO_MEDIDA.
 # O sea que la exclusion de los hallazgos esta en DOS CAPAS REDUNDANTES -las tablas de orden no
 # los referencian Y la lista los filtra- y NINGUNA MUERE SOLA. Esta mutacion ataca lo unico que no
 # tiene pareja: el ROTULO con que se imprime una pieza. La clave sigue siendo una MEDIDA -la vena
 # contracta, que la lista no filtra-, pero sale rotulada «IM», que es como un hallazgo de valvula
 # se filtraria de verdad al texto que el medico pega en el sistema del sanatorio. Declarado en
 # PR6-d.
 ('09 una pieza se rotula «IM», o sea con el nombre de un hallazgo de valvula (se aplica de mas)', 'TC-1035',
  "      [['vena contracta','RV|rv_vm|VC IM'], ['ORE','CW|ore'],",
  "      [['IM','RV|rv_vm|VC IM'], ['ORE','CW|ore'],"),

 ('10 el cuadro «Otros» entra al indice del texto (se aplica de mas)', 'TC-1036',
  "const CW_CUAD_FUERA = Object.freeze(['otros']);",
  "const CW_CUAD_FUERA = Object.freeze([]);"),

 # ⚠️ REESCRITA. La primera version le sacaba el em-dash al guardia de _cwPz y sobrevivia, y no
 # por falta de cobertura: ESE GUARDIA Y EL FILTRO DE _cwIndice SON REDUNDANTES -el que queda
 # atrapa lo que el otro deja pasar-, y ningun cuadro de la escena produce un em-dash. Hoy la
 # mutacion ataca el filtro de _cwLinea, que es el UNICO sin pareja: sin el, una linea cuyas
 # piezas vinieron todas en null se imprime como una ristra de guiones pelados, y una linea con
 # una sola pieza viva se imprime con guiones alrededor. Eso si lo ve el texto.
 ('11 las piezas sin valor entran a la linea: salen guiones pelados', 'TC-1035',
  "  const vivas = (piezas || []).filter(function (p) { return p != null && String(p).trim() !== ''; });\n  return vivas.length ? vivas.join(' - ') : null;",
  "  const vivas = (piezas || []).map(function (p) { return p == null ? '' : p; });\n  return vivas.length ? vivas.join(' - ') : null;"),

 ('12 el indice sale de `cuadVisibles` y no de `cuadDefs`: la copia pasa a depender de los quitados', 'TC-1037',
  '  let defs = [];\n  try { defs = cuadDefs(); } catch (e) { defs = []; }\n  defs.forEach(function (d) {\n    if (!d || CW_CUAD_FUERA.indexOf(d.id) >= 0) return;',
  '  let defs = [];\n  try { defs = cuadVisibles(); } catch (e) { defs = []; }\n  defs.forEach(function (d) {\n    if (!d || CW_CUAD_FUERA.indexOf(d.id) >= 0) return;'),

 ('13 el boton de datos copia el INFORME, o sea datos del paciente', 'TC-1037',
  "function cuadCopiarDatos() { return _cuadCopiar(cuadTexto(), 'datos'); }",
  "function cuadCopiarDatos() { return _cuadCopiar(cuadInformeTexto(), 'datos'); }"),

 ('14 el boton del informe se queda sin el EN SUMA', 'TC-1037',
  "  return inf + '\\n\\nEN SUMA:\\n' + suma;",
  "  return inf;"),

 ('15 los dos botones pierden su explicacion al pasar el mouse', 'TC-1037',
  '          title="Copiar los datos numéricos del estudio como texto, para pegarlos en otro sistema. No lleva datos del paciente."',
  '          title="Copiar"'),

 ('16 el AVA sale de la fila de valvulas, que lo gatea por el grado consignado', 'TC-1035',
  "      [['DVI','va|DVI'], ['AVA','CX|avaC', ' cm2'], ['AVA idx','CX|avaIdx']],",
  "      [['DVI','va|DVI'], ['AVA','RV|rv_va|AVA'], ['AVA idx','CX|avaIdx']],"),

 ('17 la cuantificacion de la insuficiencia vuelve a la forma «METODO: valor»', 'TC-1035',
  "      [['vena contracta','RV|rv_vm|VC IM'], ['ORE','CW|ore'],\n       ['volumen regurgitante','CW|volr'], ['FR','CW|fr']],",
  "      [['vena contracta','RV|rv_vm|VC IM'], ['ORE','RV|rv_vm|EROA'],\n       ['volumen regurgitante','RV|rv_vm|Vol.R'], ['FR','RV|rv_vm|FR']],"),

 ('18 se le quita el renglon de la vena pulmonar: cinco campos de los cuadros quedan afuera', 'TC-1036',
  "      [['dur. A mitral','vm|Dur. A mit.'], ['S/D pulmonar','vm|S/D pulm.'],\n       ['dur. Ar','vm|Dur. Ar'], ['veloc. Ar','vm|Veloc. Ar'], ['Ar-A','vm|Ar-A']],",
  "      []," ),

 ('19 se le quita el renglon del gasto cardiaco: cuatro campos de los cuadros quedan afuera', 'TC-1036',
  "      [['Vol. sistólico','gc|Vol. sistól.'], ['VLI','gc|VLI'],\n       ['GC','gc|GC'], ['IC','gc|IC']] ] },",
  "      [] ] },"),

 # ══ TAREA 4 · el noveno estilo de PDF ═════════════════════════════════════════
 ('20 el noveno estilo sale del catalogo: el selector y el despachador lo pierden', 'TC-1039',
  "  { id:'tipoword',    nom:'Tipo Word',    desc:'Los datos como texto en vez de cuadros, para copiar y pegar.' }\n];",
  "];"),

 ('21 «Tipo Word» dibuja los doce cuadros ADEMAS del texto', 'TC-1039',
  '      y += _aire(2);\n      return;\n    }\n    const _defs = cuadVisibles();',
  '      y += _aire(2);\n    }\n    const _defs = cuadVisibles();'),

 ('22 «Tipo Word» pone cada seccion en un parrafo envuelto y no una linea por renglon', 'TC-1039',
  '          const _ls = doc.splitTextToSize(_sanML(l), pgW - 8);\n          _ls.forEach(function (ln, _k) {\n            checkPage(_IL + 0.5);\n            doc.text(ln, mL + (_k ? 8 : 4), y);\n            y += _IL;\n          });',
  '          checkPage(_IL + 0.5);\n          doc.text(_sanML((s.lineas || []).join(" - ")), mL + 4, y);\n          y += _IL;'),

 ('23 «Tipo Word» deja de ignorar el interruptor del resumen (se aplica de mas)', 'TC-1038',
  "    if (_plantillaId === 'tipoword') {",
  "    if (_plantillaId === 'tipoword' && !cuadResumenValvOn()) {"),

 ('24 el titulo de seccion deja de ir en negrita y subrayado', 'TC-1039',
  "        else { doc.setFont('helvetica', 'bold'); doc.setFontSize(9 * _FS); }",
  "        else { doc.setFont('helvetica', 'normal'); doc.setFontSize(9 * _FS); }"),

 # ══ TAREA 5 · la Evidencia y la frase retirada ════════════════════════════════
 ('25 la frase del tracto de salida vuelve al informe', 'TC-1040',
  "        + `del estudio${eaDatosTxt(_eaR, false)}, que corresponderían a estenosis ${_eaR.esperado}.`);",
  "        + `del estudio${eaDatosTxt(_eaR, false)}, que corresponderían a estenosis ${_eaR.esperado}. `\n        + `Revisar el diámetro del tracto de salida y el trazado de las integrales velocidad-tiempo.`);"),

 ('26 la nota del score de calcio en la rama paradojal pierde su folio', 'TC-1040',
  "          + 'estadios D2 y D3 (hoja 19, folio e90). La guía europea, en su evaluación integrada '",
  "          + 'estadios D2 y D3. La guía europea, en su evaluación integrada '"),

 # ⚠️ REESCRITAS la 27 y la 28: reemplazaban el PRIMER fragmento del texto de la nota y el resto
 # -que es justamente donde estan las frases y los folios que las condiciones buscan- seguia ahi.
 # Eran EQUIVALENTES. Hoy atacan lo que de verdad se puede perder: su CITA.
 ('27 la nota de la medicion del tracto de salida pierde su cita', 'TC-1040',
  "          + 'folio e92).',\n        refs:['esc2025vc', 'ahaVc2020'] },",
  "          + 'folio e92).',\n        refs:null },"),

 ('28 la nota del repaso de las integrales pierde su frase de las ventanas', 'TC-1040',
  "          + 'salida y la interrogación Doppler desde varias ventanas (hoja 30, folio 4664).',\n        refs:['esc2025vc'] },\n      { txt:'Cuando el grado consignado",
  "          + 'salida y la interrogación Doppler (hoja 30, folio 4664).',\n        refs:['esc2025vc'] },\n      { txt:'Cuando el grado consignado"),

 ('29 la nota de la discordancia pierde su cita de la clasificacion por flujo', 'TC-1040',
  "          + 'la estenosis aórtica por el estado de flujo cuando hay discordancia entre los '\n          + 'parámetros ecocardiográficos (hoja 29, folio 4663).',",
  "          + 'la estenosis aórtica por el estado de flujo.',"),

 ('30 una nota pasa a COMPARAR las dos fuentes, que la regla fija prohibe (se aplica de mas)', 'TC-1040',
  "      { txt:'Cuando el grado consignado no coincide con las mediciones del estudio, el primer paso '",
  "      { txt:'Las dos guías no coinciden en este punto. Cuando el grado consignado no coincide con las mediciones del estudio, el primer paso '"),

 ('31 la bibliografia pierde los folios de la aortica', 'TC-1040',
  "         'hoja 19 del PDF, p. e90; el cociente entre la velocidad del tracto de salida y la ' +\n         'aórtica y los errores del área calculada, hoja 21 del PDF, p. e92.' },",
  "         'sin folio.' },"),

 ('32 las cuatro notas nuevas pierden su cita: quedan sin fuente', 'TC-1040',
  "        refs:['ahaVc2020', 'esc2025vc'] },",
  "        refs:null },"),

 # ══ TAREA 1 · lo que TC-1041 agrega sobre los casos que ya existian ═══════════
 ('33 el PDF dibuja los cuadros en el orden de FABRICA y no en el vigente', 'TC-1041',
  '    const _defs = cuadVisibles();\n    let _i = 0;\n    cuadFilas(_defs.length)',
  '    const _defs = cuadVisibles().slice().sort(function (a, b) {\n      return CUAD_IDS.indexOf(a.id) - CUAD_IDS.indexOf(b.id); });\n    let _i = 0;\n    cuadFilas(_defs.length)'),

 # ⚠️ REESCRITA: la primera version colgaba un oyente de un evento `ecoLimpiar` que LA APP NO
 # DESPACHA -censado: cero apariciones en todo el archivo-, asi que la mutacion no hacia nada. Hoy
 # se engancha en el envoltorio de `limpiarCampos`, que es donde el barrido de verdad corre.
 ('34 el orden arrastrado se descarta con «Nuevo estudio»', 'TC-1041',
  'function cuadReset() { _cuadQuit = []; _cuadOrden = null; }',
  'function cuadReset() { _cuadQuit = []; _cuadOrden = null; }\nconst _limpOrig = window.limpiarCampos;\nwindow.limpiarCampos = function () { const r = _limpOrig.apply(this, arguments); _cuadOrden = null; return r; };'),

 ('35 un cuadro solo deja de llevarse su fila entera en la tarjeta', 'TC-1041',
  'function _cuadSpans(n) {',
  'function _cuadSpans(n) { if (n === 1) return [2];'),
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
