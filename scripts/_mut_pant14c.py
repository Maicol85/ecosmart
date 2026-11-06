#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant14c.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-14c (2026-11-05/06).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant14c.py              # todas
  python3 scripts/_mut_pant14c.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
CADA MUTACION DECLARA SU CASO. Correr los nueve por cada una taparia un reparto mal hecho.
ALGUNAS NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta probando
   nada.
UNA MUTACION QUE ROMPE UNA DE DOS MITADES REDUNDANTES SOBREVIVE: hay que romper las dos. Es la
   leccion que el D-11 dejo escrita.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def escribir(txt):
    # ESCRITURA CON flush Y fsync. Sin ellos la guarda de md5 se tomaba de un archivo a medio
    # escribir y abortaba el barrido con «EL ARCHIVO VIVO NO VOLVIO A SU md5» sobre un archivo
    # que estaba bien: paso en la tanda PANT-14c, en la mutacion 24.
    with open(IDX, 'w', encoding='utf-8') as f:
        f.write(txt)
        f.flush()
        os.fsync(f.fileno())

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo)  -  `viejo` tiene que aparecer EXACTAMENTE una vez.
# `viejo` puede ser una LISTA de pares [(v1,n1),(v2,n2)] para romper dos mitades a la vez.
MUT = [
 # ══ COMMIT 1 : el PDF del corazon maestro ═══════════════════════════════════════════════════
 ('01 el 3D del PDF vuelve a estamparse CUADRADO (sin su ar)', 'TC-705',
  "const _cp = [{ data: imgSlots[_ci].dataURL, ar: CM_PDF_AR }];",
  "const _cp = [{ data: imgSlots[_ci].dataURL }];"),

 ('02 la captura deja de recortar al contenido', 'TC-705',
  "    if (!rec) return { url: o.toDataURL('image/png'), ancho: o.width, alto: o.height };",
  "    if (true) return { url: o.toDataURL('image/png'), ancho: o.width, alto: o.height };"),

 ('03 el recorte deja de abrirse a la relacion fija', 'TC-705',
  "const CM_PDF_AR = 1.25;",
  "const CM_PDF_AR = 1.0;"),

 ('04 el texto del papel pierde la leyenda de lo dibujado', 'TC-705',
  "    const ly = cmLeyendaPresente(esc);\n    if (ly.length) ln.push(ly.map(function (e) { return e.t }).join('  ·  '));",
  "    const ly = [];\n    if (ly.length) ln.push('');"),

 ('05 el texto del papel pierde los nombres completos de las lesiones', 'TC-705',
  "    const le = cmPapelLesiones(_cm3d.S); if (le) ln.push(le);",
  "    const le = ''; if (le) ln.push(le);"),

 ('06 el recolector vuelve al texto corto en vez del de las cuatro partes', 'TC-705',
  "        const _cl = (typeof cmPapelTexto === 'function') ? (cmPapelTexto() || '')\n                  : ((typeof cmLineaPDF === 'function') ? (cmLineaPDF() || '') : '');",
  "        const _cl = (typeof cmLineaPDF === 'function') ? (cmLineaPDF() || '') : '';"),

 ('07 (DE MAS) el titulo pone «Normal» delante de las lesiones', 'TC-705',
  "  if (E.base !== 'norm' || !les.length) {",
  "  if (true) {"),

 ('08 cmSchSet deja de rasterizar al abrir el esquema', 'TC-706',
  "  try { if (typeof cmEsqPdfRaster === 'function') cmEsqPdfRaster(true) } catch (e) {}\n}\nwindow.cmSchSet = cmSchSet;",
  "  try { if (false) cmEsqPdfRaster(true) } catch (e) {}\n}\nwindow.cmSchSet = cmSchSet;"),

 # ══ COMMIT 2 : el esquema del posoperatorio ═════════════════════════════════════════════════
 ('09 el esquema del posoperatorio vuelve a emitirse sin datos', 'TC-707',
  "function popEsqPdfData() { return (popEsqPdfOn() && popHayDatos()) ? _popEsqPdfData : null; }",
  "function popEsqPdfData() { return popEsqPdfOn() ? _popEsqPdfData : null; }"),

 ('10 «Nuevo estudio» deja de apagar la casilla del esquema', 'TC-707',
  "  { const _pe = document.getElementById('pop_esq_pdf'); if (_pe) _pe.value = '';",
  "  { const _pe = null; if (_pe) _pe.value = '';"),

 # ══ LA 11 SE RETIRO EN PANT-14c: ES EQUIVALENTE, Y ESTA MEDIDO ══════════════════════════════
 # Mutaba la exclusion de `pop_esq_pdf` en popHayDatos. En un input type="hidden" el IDL `value`
 # refleja el ATRIBUTO value -value mode «default»-, asi que `value` y `defaultValue` son el
 # MISMO atributo y el predicado NO PUEDE ver su valor, con o sin la exclusion. Medido con la
 # exclusion retirada: popHayDatos() con la casilla en 1 sigue dando FALSE, asi que ninguna
 # condicion de caso puede hacerla observable. La exclusion SE QUEDA porque declara la intencion
 # y protege el dia que el campo deje de ser hidden, y eso lo exige TC-707 (C3). Y pop_esq_pdf es
 # el UNICO input hidden con prefijo pop_, censado, asi que ningun otro dato queda invisible.
 # Declarado en docs/PENDIENTES.md -> P14c-g.


 ('12 (DE MAS) el predicado de datos dice que SIEMPRE hay', 'TC-707',
  "function popHayDatos() {\n  try {",
  "function popHayDatos() {\n  if (true) return true;\n  try {"),

 # ══ COMMIT 3 : los colores, el anillo, las suturas, los parches y la leyenda ════════════════
 ('13 los dos tuneles del switch auricular vuelven al MISMO violeta', 'TC-708',
  "              { t:'tube', p:rd.slice(2,7), r:0.17, c:C.violetClaro, op:0.5, in:true });",
  "              { t:'tube', p:rd.slice(2,7), r:0.17, c:C.violet, op:0.5, in:true });"),

 ('14 el Rastelli vuelve al color de la sangre en sus dos estructuras', 'TC-708',
  "      s.ex.push({ t:'tube', p:tun, r:0.2, c:C.violet, op:0.5, in:true },\n                { t:'tube', p:con, r:0.2, c:C.violetClaro, op:0.65 });",
  "      s.ex.push({ t:'tube', p:tun, r:0.2, c:C.red, op:0.5, in:true },\n                { t:'tube', p:con, r:0.2, c:C.blue, op:0.65 });"),

 ('15 los dos violetas dejan de separarse por luminancia', 'TC-708',
  "                                violet: 0x7e22ce, violetClaro: 0xc084fc });",
  "                                violet: 0x7e22ce, violetClaro: 0x8b2ed8 });"),

 ('16 el violeta vuelve a quedar cerca del azul en matiz', 'TC-708',
  "const TGA3D_C = Object.freeze({ blue: 0x2f6fd0, red: 0xd8433b, grey: 0x9a9a95, orange: 0xe08a1e,",
  "const TGA3D_C = Object.freeze({ blue: 0x6f2fd0, red: 0xd8433b, grey: 0x9a9a95, orange: 0xe08a1e,"),

 ('17 el esquema pierde el tono por tramo del tunel', 'TC-708',
  "    tun:[[1, 'o'], [4, 'c']] }),",
  "    tun:[[1, 'o'], [4, 'o']] }),"),

 ('18 el Rastelli pierde sus dos rotulos', 'TC-708',
  "      s.lb.push(['Túnel VI-aorta', tun[1]], ['Conducto VD-AP', con[2]]);",
  "      s.lb.push();"),

 # ══ LA 19 SE RETIRO EN PANT-14c: ES INOBSERVABLE DESDE EL SUITE, Y ESTA MEDIDO ══════════════
 # Apagaba el paso de correccion del bucle de rotulos. TC-711 (A6) mide los cruces de los CINCO
 # rotulos visibles del switch auricular y da cero en los dos arboles: el solape que el medico
 # reporto aparecia en 4 de 30 escenas, o sea en combinaciones de rotacion y estado que el suite
 # no puede montar de forma determinista. (A6) se queda como control de que no se solapan en la
 # escena que si se puede montar, y lo que sostiene la regla es la sonda de dos motores, que los
 # cruza en los dieciseis cruces. Declarado en docs/PENDIENTES.md -> P14c-h.


 ('20 el anillo de la obstruccion vuelve a quedar de frente a la camara', 'TC-709',
  "    s.ex.push({ t:'ring', c:po, r:_rob, col:CM_C.grey, pri:true, nrm:(_tg || [0,1,0]) });",
  "    s.ex.push({ t:'ring', c:po, r:_rob, col:CM_C.grey, pri:true });"),

 ('21 el anillo deja de seguir la tangente y vuelve a bajar en Y', 'TC-709',
  "    const po = (_r0 && _tg) ? [_r0[0] - _tg[0]*CM_OBS_BAJO, _r0[1] - _tg[1]*CM_OBS_BAJO, _r0[2] - _tg[2]*CM_OBS_BAJO]",
  "    const po = (_r0 && _tg) ? [_r0[0], _r0[1] - CM_OBS_BAJO, _r0[2]]"),

 ('22 el radio del anillo deja de salir del radio de la aorta', 'TC-709',
  "    const _rob = (_ao && _ao.r && _ao.r[0]) ? (_ao.r[0] * 1.1) : 0.30;",
  "    const _rob = 0.26;"),

 ('23 las dos suturas del Jatene vuelven a ser anillos', 'TC-709',
  "    s.ex.push({ t:'malla', c:[0.3,1.2,-0.15], r:0.3, col:C.orange, nrm:_t3tang(P.AO_N, [0.3,1.2,-0.15]) },\n              { t:'malla', c:[-0.2,1.4,0.75], r:0.3, col:C.orange, nrm:_t3tang(_t3cat(P.PAA_T, P.PAA_R.slice(1)), [-0.2,1.4,0.75]) },",
  "    s.ex.push({ t:'ring', c:[0.3,1.2,-0.15], r:0.3, col:C.orange },\n              { t:'ring', c:[-0.2,1.4,0.75], r:0.3, col:C.orange },"),

 # REESCRITA EN PANT-14c: estaba dirigida al MOTOR —el giro de la malla en cm3dInit—, que
 # cmEscena NO ve, asi que ninguna condicion de caso podia matarla sin WebGL. Hoy muta la
 # ESCENA: le saca la normal a las dos bandas, que es lo que el caso lee.
 ('24 las bandas de malla pierden su normal, o sea su perpendicularidad al vaso', 'TC-709',
  "{ t:'malla', c:[0.3,1.2,-0.15], r:0.3, col:C.orange, nrm:_t3tang(P.AO_N, [0.3,1.2,-0.15]) }",
  "{ t:'malla', c:[0.3,1.2,-0.15], r:0.3, col:C.orange }"),

 # REESCRITA EN PANT-14c: el patron anterior no aparecia ni una vez —el arnes lo dijo con «NO
 # APLICA», que es un veredicto honesto y cuesta una corrida—. Se toma del codigo real.
 ('25 el esquema vuelve a la barra solida en vez de la trama', 'TC-709',
  "'<rect x=\"69\" y=\"62\" width=\"22\" height=\"8\" rx=\"2\" fill=\"url(#' + TGA_ESQ_MALLA_ID + ')\" ' +",
  "'<rect x=\"69\" y=\"62\" width=\"22\" height=\"8\" rx=\"2\" fill=\"var(--tga-esq-naranja)\" ' +"),

 # REESCRITA EN PANT-14c, por el mismo motivo que la 24: muta la ESCENA y no el motor. Le pone
 # normal al anillo del parche del Fallot, que es uno de los que el CONTROL (D3) cuenta.
 ('26 (DE MAS) la normal la llevan TODOS los anillos del modulo', 'TC-709',
  "s.ex.push({t:'ring',c:_bo,r:0.1,ry:true,in:true});",
  "s.ex.push({t:'ring',c:_bo,r:0.1,ry:true,in:true,nrm:[0,1,0]});"),

 ('27 la cava izquierda vuelve al azul de la sangre', 'TC-710',
  "    s.ex.push({t:'tube',p:vc,r:0.13,c:CM_C.celeste,op:0.9},{t:'tube',p:cs,r:0.2,c:CM_C.celeste,op:0.8});",
  "    s.ex.push({t:'tube',p:vc,r:0.13,c:CM_C.blue,op:0.9},{t:'tube',p:cs,r:0.2,c:CM_C.blue,op:0.8});"),

 ('28 el celeste deja de separarse del azul por claridad', 'TC-710',
  "                          green:0x2f9e44,celeste:0x38bdf8});",
  "                          green:0x2f9e44,celeste:0x3570d8});"),

 ('29 el parche del Fallot operado vuelve al naranja', 'TC-710',
  "      s.ex.push({t:'disc',c:CM_FAL_PARCHE,r:CM_FAL_PARCHE_R,col:CM_C.green,in:true},{t:'tube',p:[[-0.62,0.05,0.98],[-0.45,0.55,1.02],[-0.25,1.2,0.88]],r:0.045,c:CM_C.green,op:1});",
  "      s.ex.push({t:'disc',c:CM_FAL_PARCHE,r:CM_FAL_PARCHE_R,in:true},{t:'tube',p:[[-0.62,0.05,0.98],[-0.45,0.55,1.02],[-0.25,1.2,0.88]],r:0.045,c:CM_C.orange,op:1});"),

 ('30 la CIV residual vuelve a quedar por DEBAJO del parche, no en su borde', 'TC-710',
  "        const _bo=[CM_FAL_PARCHE[0], CM_FAL_PARCHE[1]-CM_FAL_PARCHE_R*0.8, CM_FAL_PARCHE[2]+CM_FAL_PARCHE_R*0.6];",
  "        const _bo=[-0.05,-1.2,0.2];"),

 ('31 el colector vuelve a leer `e.c` como color de TODO objeto', 'TC-710',
  "    let c = (e.t === 'tube') ? e.c : e.col;",
  "    let c = (e.col != null) ? e.col : e.c;"),

 ('32 la leyenda vuelve a una sola entrada para las tres cosas naranjas', 'TC-710',
  "  { id:'par',  c: CM_C.green,       t: 'parche' },",
  "  { id:'par',  c: CM_C.orange,      t: 'parche' },"),

 # REESCRITA EN PANT-14c: la anterior rompia el parseo del bloque —dejaba un if sin cerrar— y
 # el arnes lo dijo con «NO CORRIO», que es su guarda de la linea RESULTADO funcionando.
 ('33 (DE MAS) la leyenda prende TODAS sus entradas siempre', 'TC-710',
  "  return CM_LEY.filter(function (e) {",
  "  return CM_LEY.filter(function (e) { if (e) return true;"),

 ('34 cmTunelLeySync deja de delegar y vuelve a ser un segundo dueno', 'TC-710',
  "function cmTunelLeySync() {\n  if (typeof cmLeyendaSync === 'function') cmLeyendaSync();\n}",
  "function cmTunelLeySync() {\n  const on = cmHayTunel();\n  ['cm3d-leg-tun','cm3d-leg2-tun'].forEach(function (i) {\n    const e = document.getElementById(i); if (e) e.hidden = !on });\n}"),

 # ══ COMMIT 4 : el titulo y los textos chicos ════════════════════════════════════════════════
 ('35 el titulo deja de escribirse en el recuadro', 'TC-711',
  "  const a = document.getElementById('cm3d-tit'); if (a) a.textContent = t;",
  "  const a = null; if (a) a.textContent = t;"),

 ('36 el titulo deja de escribirse en la cabecera del esquema', 'TC-711',
  "  const b = document.getElementById('cm3d-schtit'); if (b) b.textContent = t ? ('  ·  ' + t) : '';",
  "  const b = null; if (b) b.textContent = '';"),

 ('37 el titulo deja de colgarse del repintado', 'TC-711',
  "    try { if (typeof cmTituloSync === 'function') cmTituloSync() } catch (e) {} };",
  "    try { if (false) cmTituloSync() } catch (e) {} };"),

 ('38 (DE MAS) vuelve la frase «Todas las lesiones cargadas estan dibujadas»', 'TC-711',
  "  else if (r.falta.length) partes.push('Cargadas y no dibujadas todavía: ' + r.falta.join(', ') + '.');",
  "  else if (r.falta.length) partes.push('Cargadas y no dibujadas todavía: ' + r.falta.join(', ') + '.');\n  else partes.push('Todas las lesiones cargadas están dibujadas.');"),

 ('39 las dos aclaraciones salen del globo del recuadro', 'TC-711',
  "            <p class=\"cm3d-ref\">Modelo en 3D esquem&aacute;tico, no a escala. Se rota arrastrando.</p>",
  "            <p class=\"cm3d-ref\"></p>"),

 # ══ COMMIT 5 : la pestania de transposicion ═════════════════════════════════════════════════
 ('40 el grupo sin campos visibles vuelve a ocupar su columna', 'TC-712',
  "  if (typeof tgaGruposSync === 'function') { try { tgaGruposSync() } catch (e) {} }",
  "  if (false) { try { tgaGruposSync() } catch (e) {} }"),

 ('41 la grilla de grupos pierde su corte de 1000 px', 'TC-712',
  "@media (min-width:1000px){\n  #tga-grupos{grid-template-columns:repeat(3,minmax(0,1fr));}\n}",
  "@media (min-width:1000px){\n  #tga-grupos{grid-template-columns:repeat(2,minmax(0,1fr));}\n}"),

 ('42 la grilla de grupos pierde su corte de 768 px', 'TC-712',
  "@media (min-width:768px){\n  #tga-grupos{grid-template-columns:repeat(2,minmax(0,1fr));}\n}",
  "@media (min-width:768px){\n  #tga-grupos{grid-template-columns:minmax(0,1fr);}\n}"),

 ('43 (DE MAS) vuelve el boton «Ver en 3D» propio de la seccion', 'TC-712',
  '      <div id="tga-fila">',
  '      <div style="margin-top:12px;text-align:center;"><button type="button" class="btn btn-ghost" id="tga-ver3d" onclick="tgaVer3D()">Ver en 3D</button></div>\n      <div id="tga-fila">'),

 ('44 el sincronizador de grupos mira el atributo en vez del display computado', 'TC-712',
  "      if (getComputedStyle(f).display !== 'none') alguno = true;",
  "      if (f.style.display !== 'none') alguno = true;"),

 # ══ COMMIT 6 : las secciones de congenitas ══════════════════════════════════════════════════
 ('45 showTab deja de cerrar las secciones de congenitas', 'TC-713',
  "  if (typeof ccSeccionesCerrar === 'function') { try { ccSeccionesCerrar(id) } catch (e) {} }",
  "  if (false) { try { ccSeccionesCerrar(id) } catch (e) {} }"),

 ('46 (DE MAS) el cerrador alcanza a TODAS las pestanias, no solo a congenitas', 'TC-713',
  "  if (CC_TABS_CERRAR.indexOf(String(id)) < 0) return 0;",
  "  if (false) return 0;"),

 ('47 el cerrador deja la clase pero no el max-height, o al reves', 'TC-713',
  "    if (b) { b.style.overflow = 'hidden'; b.style.maxHeight = '0' }",
  "    if (b) { b.style.overflow = 'hidden' }"),

 # REESCRITA EN PANT-14c: la anterior AGREGABA la llamada antes y DEJABA la de despues, asi que
 # el cerrador corria dos veces y el estado final era el mismo: una mutacion equivalente. Para
 # probar el orden hay que MOVERLA, y son los DOS pares a la vez.
 ('48 el cerrador corre ANTES de secAutoOpen, que lo vuelve a abrir', 'TC-713',
  [("  if (typeof secAutoOpen === 'function') secAutoOpen('tab-' + id);",
    "  if (typeof ccSeccionesCerrar === 'function') { try { ccSeccionesCerrar(id) } catch (e) {} }\n  if (typeof secAutoOpen === 'function') secAutoOpen('tab-' + id);"),
   ("  if (typeof ccSeccionesCerrar === 'function') { try { ccSeccionesCerrar(id) } catch (e) {} }\n  /* La barra de las dos pestanas de congenitas se repinta ACA",
    "  /* La barra de las dos pestanas de congenitas se repinta ACA")]),

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
            escribir(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            escribir(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5 tras la %02d' % i
            res.append((i, nom, caso, v, det))
            print('  %02d  %-11s %-8s %s  -  %s' % (i, v, caso, nom, det), flush=True)
    finally:
        escribir(orig)
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
