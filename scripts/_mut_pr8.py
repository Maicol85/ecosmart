#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr8.py - barrido de MUTACIONES DIRIGIDAS de la tanda PR8 (2026-11-24).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr8.py              # todas
  python3 scripts/_mut_pr8.py --solo 1,2   # algunas
  python3 scripts/_mut_pr8.py --anclas     # SOLO verifica que las anclas emparejen

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
 # == GRUPO 1 - EL RESUMEN DE VALVULAS Y «RESTABLECER» =========================
 ('01 el interruptor vuelve a ser una casilla con su texto (deja de ser un boton de icono)', 'TC-1051',
  """        <button type="button" class="btn btn-ghost cuad-copia" data-cuad-rv aria-pressed="false\"""",
  """        <label class="cuad-rv" data-cuad-rv><input type="checkbox"><span>Incluir resumen de válvulas</span></label>
        <button type="button" class="btn btn-ghost cuad-copia" aria-pressed="false\""""),
 ('02 el interruptor NO repinta la vista previa: el resumen vuelve a verse solo en el PDF', 'TC-1051',
  """  const ov = document.getElementById('cuad-ov');
  if (ov && !ov.hidden) cuadPintar();
}""",
  """  const ov = document.getElementById('cuad-ov');
  if (false && ov && !ov.hidden) cuadPintar();
}"""),
 ('03 las cajas del resumen entran al orden: llevan data-cuad-id', 'TC-1051',
  "        box.setAttribute('data-cuad-rv-id', d.id);",
  "        box.setAttribute('data-cuad-id', d.id);"),
 ('04 «Restablecer» deja el resumen prendido', 'TC-1051',
  """  cuadReset();
  _cuadResumenValv = false;
  cuadRvBtnSync();""",
  """  cuadReset();
  cuadRvBtnSync();"""),
 ('05 el boton no dice su estado: sin aria-pressed', 'TC-1051',
  "  const on = cuadResumenValvOn();\n  b.setAttribute('aria-pressed', on ? 'true' : 'false');",
  "  const on = cuadResumenValvOn();\n  b.setAttribute('data-sin-estado', on ? 'true' : 'false');"),

 # == GRUPO 2 - EL ARRASTRE ====================================================
 ('06 el arrastre vuelve a colgar sus oyentes del asa y no del documento', 'TC-1052',
  """  document.addEventListener('pointermove', _cuadArrMove, true);
  document.addEventListener('pointerup', _cuadArrUp, true);
  document.addEventListener('pointercancel', _cuadArrUp, true);
}
function _cuadArrIniciar()""",
  """  box.addEventListener('pointermove', _cuadArrMove, true);
  box.addEventListener('pointerup', _cuadArrUp, true);
  box.addEventListener('pointercancel', _cuadArrUp, true);
}
function _cuadArrIniciar()"""),
 ('07 al soltar INSERTA en vez de intercambiar', 'TC-1052',
  "  o[ia] = b; o[ib] = a;",
  "  o.splice(ia, 1); o.splice(o.indexOf(b) + 1, 0, a);"),
 ('08 no se marca el destino', 'TC-1052',
  "  if (o) o.classList.add('cuad-dest');",
  "  if (o) o.setAttribute('data-sin-marca', '1');"),
 # ** 09 REDIRIGIDA. La primera version atacaba la LINEA QUE LIMPIA la clase cuad-arr, y sobrevivio
 #    porque es EQUIVALENTE POR CONSTRUCCION: el gesto termina siempre en un repintado y cuadPintar
 #    rehace las doce cajas desde cero, asi que ninguna linea de limpieza puede dejar la clase
 #    pegada. Lo que en PR6 la dejaba pegada era que _cuadArrUp NO CORRIA NUNCA, y eso lo mata la
 #    mutacion 06. Asi que esta pasa a atacar algo que si tiene consecuencia visible: el marcador de
 #    destino puesto en el cuadro que se arrastra en vez del que esta debajo del puntero.
 ('09 el marcador de destino se le pone al cuadro ARRASTRADO y no al de abajo del puntero', 'TC-1052',
  "  const o = _cuadArrSobre(ev.clientX, ev.clientY);\n  if (o) o.classList.add('cuad-dest');",
  "  const o = _cuadArrSobre(ev.clientX, ev.clientY);\n  if (o) _cuadArr.el.classList.add('cuad-dest');"),
 ('10 un clic sin movimiento tambien reordena (sin umbral)', 'TC-1052',
  """    const d = Math.max(Math.abs(ev.clientX - _cuadArr.x0), Math.abs(ev.clientY - _cuadArr.y0));
    if (d < CUAD_ARR_UMBRAL) return;""",
  """    const d = Math.max(Math.abs(ev.clientX - _cuadArr.x0), Math.abs(ev.clientY - _cuadArr.y0));
    if (d < 0) return;"""),
 ('11 la cruz tambien arrastra', 'TC-1052',
  "  if (t.closest('.cuad-x') || t.closest('.cuad-chip')) return;",
  "  if (t.closest('.cuad-chip')) return;"),
 ('12 DE MAS: el arrastre solo empieza desde el asa, como antes', 'TC-1052',
  "  const box = t.closest('#cuad-grid > [data-cuad-id]');\n  if (!box) return;\n  _cuadArrLimpiar();",
  "  const box = t.closest('#cuad-grid > [data-cuad-id]');\n  if (!box) return;\n  if (!t.closest('.cuad-grip')) return;\n  _cuadArrLimpiar();"),

 # == GRUPO 3 - EL COPIADO CON FORMATO =========================================
 ('13 el copiado vuelve a llevar solo texto plano', 'TC-1053',
  "function cuadCopiarDatos() { return _cuadCopiar(cuadTexto(), 'datos', cuadTextoHTML()); }",
  "function cuadCopiarDatos() { return _cuadCopiar(cuadTexto(), 'datos'); }"),
 ('14 los dos formatos NO viajan juntos: primero el HTML y despues el plano', 'TC-1053',
  """      const it = new window.ClipboardItem({
        'text/html':  new Blob([html], { type:'text/html' }),
        'text/plain': new Blob([t],    { type:'text/plain' })
      });""",
  """      const it = new window.ClipboardItem({
        'text/html':  new Blob([html], { type:'text/html' })
      });"""),
 ('15 el subrayado se le pone a TODAS las secciones y no solo a DOPPLER', 'TC-1053',
  "    p.push(_cwP(s.tit === CW_DOPPLER_TIT ? ('<b><u>' + t + '</u></b>') : ('<b>' + t + '</b>')));",
  "    p.push(_cwP('<b><u>' + t + '</u></b>'));"),
 ('16 el EN SUMA pierde sus vinietas', 'TC-1053',
  """    p.push('<ul style="margin:0 0 0 18px;padding:0;">');
    cuadSumaItems(q.suma).forEach(function (l) {
      p.push('<li style="margin:0;">' + _cwEscHtml(l) + '</li>');
    });
    p.push('</ul>');""",
  """    cuadSumaItems(q.suma).forEach(function (l) {
      p.push(_cwP(_cwEscHtml(l)));
    });"""),
 ('17 DE MAS: sin formato el copiado deja de copiar', 'TC-1053',
  "  if (porTextarea()) { ok(); return true; }\n  return aMano();\n}\nwindow._cuadCopiar",
  "  if (false && porTextarea()) { ok(); return true; }\n  return aMano();\n}\nwindow._cuadCopiar"),

 # == GRUPO 4 - EL TEXTO DE LOS DATOS Y EL PDF TIPO WORD =======================
 ('18 los renglones pierden su mayuscula inicial', 'TC-1054',
  "    (s.lineas || []).forEach(function (l) { partes.push(l === '' ? '' : ('  ' + _cwCap(l))); });",
  "    (s.lineas || []).forEach(function (l) { partes.push(l === '' ? '' : ('  ' + l)); });"),
 ('19 los renglones que son un mensaje vuelven a publicarse', 'TC-1054',
  "  if (_cwEsMensaje(s)) return null;",
  "  if (false && _cwEsMensaje(s)) return null;"),
 ('20 la PAP media pierde su unidad', 'TC-1054',
  "      [['PAP media','trip|PAP media',' mmHg'], ['DVI VP','trip|DVI VP']],",
  "      [['PAP media','trip|PAP media'], ['DVI VP','trip|DVI VP']],"),
 # ** 21 REDIRIGIDA. La primera version cambiaba el VALOR del centinela CW_BLANCO, y sobrevivio
 #    porque la tabla de orden y el comparador leen LA MISMA constante: renombrarla no cambia nada.
 #    Ahora se le saca al armador la linea que EMITE el separador.
 ('21 el ventriculo izquierdo vuelve a ser un solo bloque sin grupos', 'TC-1054',
  "      if (grupo === CW_BLANCO) { lineas.push(CW_BLANCO); return; }",
  "      if (grupo === CW_BLANCO) { return; }"),
 ('22 el THP se publica DOS veces: vuelve el renglon del AVm por THP', 'TC-1054',
  "      [['DVI','RV|rv_vm|DVI']] ] },",
  "      [['DVI','RV|rv_vm|DVI'], ['AVm por THP','vm|AVm THP']] ] },"),
 ('23 el PDF Tipo Word vuelve a su encabezado con la banda de color', 'TC-1055',
  "  _PLANTILLAS_FN.tipoword = _hdrTipoWord;",
  "  _PLANTILLAS_FN.tipoword = _hdrClasico;"),
 ('24 el PDF Tipo Word vuelve a los colores y los recuadros del clasico', 'TC-1055',
  "  _TBL_ESTILOS.tipoword = {",
  "  _TBL_ESTILOS.tipowordNO = {"),
 ('25 el EN SUMA del Tipo Word pierde su vinieta dibujada', 'TC-1055',
  "                     doc.circle(mL + 3.1, y - 0.85, 0.5, 'F'); }",
  "                     ; }"),
 ('26 los datos numericos del Tipo Word pierden su mayuscula inicial', 'TC-1055',
  "            _sanML(typeof _cwCap === 'function' ? _cwCap(l) : l), pgW - 8);",
  "            _sanML(l), pgW - 8);"),

 # == GRUPO 5 - LA ENTRADA DE DATOS DEL SGL ====================================
 ('27 los segmentos vuelven a arrancar en SIN DATO', 'TC-1056',
  "const STRAIN_DEF = 1;",
  "const STRAIN_DEF = 0;"),
 # ** 28 REDIRIGIDA. La primera version ponia el modulo de nueve estados, y sobrevivio porque
 #    arrancando en el tramo 1 ESE modulo da la MISMA secuencia: 1->2...8->0->1. Ahora el ciclo
 #    nunca llega al gris, que es la mitad de lo que la orden pide.
 ('28 el ciclo nunca llega a SIN DATO: del octavo tramo salta al primero', 'TC-1056',
  "  const sig = (a === 0) ? 1 : (a >= STRAIN_N_TRAMOS ? 0 : a + 1);",
  "  const sig = (a >= STRAIN_N_TRAMOS) ? 1 : a + 1;"),
 ('29 el guion sale siempre y no solo con el boton de numeros', 'TC-1056',
  "  return strainNumModoOn() ? '–' : '';",
  "  return '–';"),
 ('30 el signo mas no se escribe: un +8 se lee como un -8', 'TC-1056',
  "  return (v > 0 ? '+' : '') + String(v);",
  "  return String(v);"),
 ('31 borrar el numero vuelve a mandar el segmento a SIN DATO', 'TC-1056',
  "  if (n === null) { strainSet(id, STRAIN_DEF, null); return null; }",
  "  if (n === null) { strainSet(id, 0, null); return null; }"),
 ('32 con el boton apagado un segmento con numero vuelve a ciclar y pierde el numero', 'TC-1056',
  """  const v = strainNum[id];
  if (v !== null && v !== undefined && isFinite(v)) {
    if (typeof toast === 'function') toast(STRAIN_AVISO_NUM + '.');
    return;
  }
  strainCiclar(id);""",
  """  strainCiclar(id);"""),
 ('33 la migracion vuelve a mandar el 0 viejo a SIN DATO', 'TC-1056',
  "const STRAIN_MIGRA = Object.freeze([1, 2, 3, 5, 7]);",
  "const STRAIN_MIGRA = Object.freeze([0, 2, 3, 5, 7]);"),
 ('34 la casilla no esconde la etiqueta vieja del segmento', 'TC-1056',
  "  try { _strainOcultarRot(id, true); } catch (e) {}",
  "  try { } catch (e) {}"),

 # == GRUPO 6 - LA TABLA DE CALCULOS ===========================================
 ('35 la tabla se dibuja pero no se pinta al abrir la pestania', 'TC-1057',
  """  sglDibujarBullseye(); sglSyncGLS(); strainNumBtnSync(); strainLeyendaPintar();
  if (typeof scRender === 'function') scRender();""",
  """  sglDibujarBullseye(); sglSyncGLS(); strainNumBtnSync(); strainLeyendaPintar();"""),
 ('36 el nivel apical incluye el casquete (17), contra el criterio declarado', 'TC-1057',
  "  apical:[13,14,15,16]",
  "  apical:[13,14,15,16,17]"),
 ('37 el reparto por territorio se escribe a mano y deja de salir de Contractilidad', 'TC-1057',
  "    if (nom === sig) out.push(i);",
  "    if (nom === sig && i !== 17) out.push(i);"),
 ('38 el apical sparing deja de usar valores absolutos', 'TC-1057',
  "  const den = Math.abs(b) + Math.abs(m);\n  if (!(den > 0)) return null;\n  return Math.abs(a) / den;",
  "  const den = b + m;\n  if (den === 0) return null;\n  return a / den;"),
 ('39 la FEVI sobre SGL deja de usar el valor absoluto del SGL', 'TC-1057',
  "  const d = Math.abs(g);\n  if (!(d > 0)) return null;\n  return f / d;",
  "  const d = g;\n  if (d === 0) return null;\n  return f / d;"),
 ('40 los promedios salen con dos decimales y las razones con uno', 'TC-1057',
  "  const x = scPromedio(_scIdxDe(c));\n  return x === null ? null : (_scN(x, 1) + ' %');",
  "  const x = scPromedio(_scIdxDe(c));\n  return x === null ? null : (_scN(x, 2) + ' %');"),
 ('41 el resultado NO se borra cuando cambia un numero que esa celda uso', 'TC-1057',
  "    if (!c || _scRes[k].firma !== _scFirma(c)) delete _scRes[k];",
  "    if (!c) delete _scRes[k];"),
 ('42 el boton de calcular no se apaga cuando faltan segmentos', 'TC-1057',
  "      bl.appendChild(_scBoton('🧮', 'Calcular', function () { scCalcular(c.k) }, !!motivo, motivo));",
  "      bl.appendChild(_scBoton('🧮', 'Calcular', function () { scCalcular(c.k) }, false, motivo));"),
 ('43 el motivo deja de verse dentro de la celda', 'TC-1057',
  """      if (motivo) { const fa = document.createElement('div'); fa.className = 'sc-falta';
                    fa.textContent = motivo; td.appendChild(fa); }""",
  """      if (false && motivo) { const fa = document.createElement('div'); fa.className = 'sc-falta';
                    fa.textContent = motivo; td.appendChild(fa); }"""),
 ('44 «Usar como SGL global» reemplaza sin preguntar', 'TC-1057',
  "  if (!hay) { escribir(); return; }",
  "  if (true) { escribir(); return; }"),
 ('45 la tabla lleva una casilla de inclusion al informe', 'TC-1057',
  "  raiz.appendChild(n);",
  "  raiz.appendChild(n);\n  { const q = document.createElement('input'); q.type = 'checkbox'; raiz.appendChild(q); }"),
 ('46 DE MAS: la tabla publica sus calculos en el texto copiado', 'TC-1057',
  "function cuadTexto() {\n  const partes = [];",
  "function cuadTexto() {\n  const partes = ['Apical sparing relativo: 0,22'];"),
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
