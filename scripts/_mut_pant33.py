#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_pant33.py - barrido de mutaciones dirigidas de la tanda PANT-33 (2026-11-10).
Calcado de _mut_pant32.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el
guardian compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso. Cada mutacion declara SU caso.
Las anclas llevan el CARACTER REAL y se verifican con --anclas ANTES de correr el barrido:
el barrido de PANT-20 se perdio una corrida entera por siete anclas escritas con secuencias
de escape en vez del caracter.
Nombre propio: verificado con ls, no existia.

Rompe, una por una, cada decision de los commits 2 a 5: de donde sale la institucion, donde cae
el logo, la linea gris que reemplaza a la raya, el nombre editable de la hoja del Informe, la
lista minima de Configuracion, el almacen de PANT-32 que no se puede descartar, la convencion del
titulo de seccion, la conversion modelo <-> texto, lo que queda fijo en la hoja del editor, los
dos cierres, los dos documentos en blanco y la firma que nunca queda sola.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── commit 2 · PARTE D · la institucion ───────────────────────────────────────────────────
 ('01 docDatos vuelve a leer el span de la cabecera vieja en vez del centro de trabajo', 'TC-807',
  [("    try { a = (typeof hdrCentroNombre === 'function' ? (hdrCentroNombre() || '') : '').trim(); } catch (e) { a = ''; }",
    "    try { a = (typeof sv === 'function' ? (sv('med-centro') || '') : '').trim(); } catch (e) { a = ''; }")]),
 ('02 vuelve el respaldo escrito a mano «CeiboMed»', 'TC-807',
  [("    try { return String(localStorage.getItem('centro_nombre_activo') || '').trim(); } catch (e) { return ''; }",
    "    try { return String(localStorage.getItem('centro_nombre_activo') || '').trim() || 'CeiboMed'; } catch (e) { return 'CeiboMed'; }")]),
 ('03 el logo del papel vuelve a la izquierda', 'TC-807',
  [("      cur().push({ k: 'img', x: G.W - G.MR - LOGO_W, y: yT, w: LOGO_W, h: LOGO_H, d: D.logoD });",
    "      cur().push({ k: 'img', x: G.ML, y: yT, w: LOGO_W, h: LOGO_H, d: D.logoD });")]),
 ('04 el circulo de iniciales vuelve a la izquierda', 'TC-807',
  [("      if (ini) cur().push({ k: 'circ', x: G.W - G.MR - 7, y: yT + 7, r: 7, col: G.NAVY, s: ini });",
    "      if (ini) cur().push({ k: 'circ', x: G.ML + 7, y: yT + 7, r: 7, col: G.NAVY, s: ini });")]),
 ('05 sin institucion se dibuja igual el circulo, con la inicial vacia', 'TC-807',
  [("      if (ini) cur().push({ k: 'circ', x: G.W - G.MR - 7, y: yT + 7, r: 7, col: G.NAVY, s: ini });",
    "      cur().push({ k: 'circ', x: G.W - G.MR - 7, y: yT + 7, r: 7, col: G.NAVY, s: ini });")]),
 ('06 el nombre del papel deja de ir centrado en el ancho de la hoja', 'TC-807',
  [("        cur().push({ k: 'c', y: yy, sz: SZ + 2.2, b: true, i: false, col: G.NAVY, s: l });",
    "        cur().push({ k: 't', x: G.ML, y: yy, sz: SZ + 2.2, b: true, i: false, col: G.NAVY, s: l });")]),
 ('07 vuelve la raya en la hoja cuando no hay institucion', 'TC-807',
  [("          : '<div class=\"doc-enc-nom doc-enc-ph\" data-ph=\"' + escHtml(DOC_INST_PH) + '\"' + edInst + '></div>') +",
    "          : '<div class=\"doc-enc-nom doc-dato\">' + escHtml('\u2014') + '</div>') +")]),
 ('08 el orden del DOM vuelve a logo, nombre y hueco: el logo a la izquierda', 'TC-807',
  [("      out += '<div class=\"doc-enc\"><span class=\"doc-enc-hueco\"></span>' +",
    "      out += '<div class=\"doc-enc\">' +")]),
 ('09 el nombre de la institucion deja de ser editable en la hoja del Informe', 'TC-807',
  [("      const edInst = editable ? (' contenteditable=\"true\" data-doc-inst=\"1\" spellcheck=\"false\"') : '';",
    "      const edInst = '';")]),
 ('10 docDatosHoja ignora lo que el medico escribio en la hoja: el papel sale con otro nombre', 'TC-809',
  [("  if (st && typeof st.inst === 'string') D.inst = st.inst;", "  /* sin la correccion */")]),
 # ── commit 3 · PARTE A · la lista minima ──────────────────────────────────────────────────
 ('11 la etiqueta de tipo deja de distinguir: todos dicen Consentimiento', 'TC-803',
  [("  if (tipo === 'constancia') return 'Constancia';\n  if (tipo === 'blanco') return 'En blanco';",
    "  if (false) return 'Constancia';\n  if (false) return 'En blanco';")]),
 ('12 la fila vuelve a ofrecer «Borrar»', 'TC-803',
  [("      '<button type=\"button\" class=\"btn btn-ghost\" data-cd-ed=\"' + escHtml(x.clave) + '\">Editar</button>' +",
    "      '<button type=\"button\" class=\"btn btn-ghost\" data-cd-ed=\"' + escHtml(x.clave) + '\">Editar</button>' + '<button type=\"button\" class=\"btn btn-ghost\" data-cd-del=\"' + escHtml(x.clave) + '\">Borrar</button>' +")]),
 ('13 docmodLista vuelve a listar los documentos propios de PANT-32', 'TC-808',
  [("  DOCMOD_BLANCOS.forEach(function (k) { const m = docmodModelo(k, st); if (m) out.push(m); });\n  return out;",
    "  DOCMOD_BLANCOS.forEach(function (k) { const m = docmodModelo(k, st); if (m) out.push(m); });\n  (st.prop || []).forEach(function (pp) { const m = docmodModelo(pp.clave, st); if (m) out.push(m); });\n  return out;")]),
 ('14 cfgDocsVis pierde la rama de los documentos en blanco: el interruptor no hace nada', 'TC-804',
  [("  else if (docmodEsBlanco(clave)) {", "  else if (false) {")]),
 # ── commit 5 · el almacen que no se puede descartar ───────────────────────────────────────
 ('15 el validador EXIGE la raiz de los blancos: el almacen de PANT-32 se descarta entero', 'TC-808',
  [("  const K_RAIZ = ['v', 'incl', 'prop', 'blanco', '_ecosmart_modelos', 'fecha'];",
    "  const K_RAIZ = ['v', 'incl', 'prop', '_ecosmart_modelos', 'fecha'];")]),
 ('16 la version del almacen sube: el almacen de PANT-32 se descarta entero', 'TC-808',
  [('const DOCMOD_VER = 1;', 'const DOCMOD_VER = 2;')]),
 ('17 el validador acepta una clave de blanco desconocida', 'TC-808',
  [("  for (const k in rb) if (Object.prototype.hasOwnProperty.call(rb, k) && DOCMOD_BLANCOS.indexOf(k) < 0) return no();",
    "  /* sin control */")]),
 ('18 el validador acepta un numero donde va el texto de un blanco', 'TC-808',
  [("    if (e.txt !== undefined && !txt(e.txt, DOCMOD_LIM.ptxt)) return no();", "    /* sin control */")]),
 ('19 docmodVacio deja de sembrar la raiz de los blancos', 'TC-808',
  [("  DOCMOD_BLANCOS.forEach(function (k) { o.blanco[k] = { vis: true, nom: '', txt: '', firma: true }; });",
    "  /* sin sembrar */")]),
 # ── commit 4 · PARTE B · la convencion y la conversion ────────────────────────────────────
 ('20 el titulo de seccion deja de reconocerse: «## » entra como texto', 'TC-802',
  [("    if (t.indexOf('## ') === 0 || t === '##') {\n      cerrar();", "    if (false) {\n      cerrar();")]),
 ('21 los bloques dejan de escribir la marca del titulo de seccion', 'TC-802',
  [("    if (b.t === 'sec') { tr.push('## ' + String(b.x || '')); return; }",
    "    if (b.t === 'sec') { tr.push(String(b.x || '')); return; }")]),
 ('22 el texto deja de partirse por seccion: el consentimiento queda con UNA pregunta', 'TC-810',
  [("    if (t.indexOf('## ') === 0 || t === '##') {\n      cur = { t: t.slice(2).replace(/^\\s+/, ''), xs: [] }; pregs.push(cur); return;\n    }",
    "    if (false) {\n      cur = { t: t.slice(2).replace(/^\\s+/, ''), xs: [] }; pregs.push(cur); return;\n    }")]),
 ('23 el modelo a texto pierde el titulo de cada pregunta', 'TC-810',
  [("      return (t ? ('## ' + t + '\\n') : '') + String(p.x || '');", "      return String(p.x || '');")]),
 ('24 guardar marca como editado aunque el texto sea el original: la regla de oro cae', 'TC-809',
  [("    st.incl[m.clave].ed = docmodIgualAlOriginal(m.clave, m) ? null : docmodCuerpo(m);",
    "    st.incl[m.clave].ed = docmodCuerpo(m);")]),
 ('25 «Guardar como modelo» ya no se apaga cuando no hay nada nuevo', 'TC-809',
  [("  const hay = !!(_cdEd && _cdFirmaEd() !== _cdEd.firmaIni);", "  const hay = true;")]),
 ('26 el cuerpo se lee con innerText: una linea en blanco cuenta DOS saltos', 'TC-804',
  [("  if (!el.firstElementChild)\n    return String(el.innerText || '').replace(/\u00a0/g, ' ').replace(/\\r\\n?/g, '\\n');",
    "  return String(el.innerText || '').replace(/\u00a0/g, ' ').replace(/\\r\\n?/g, '\\n');\n  if (!el.firstElementChild)\n    return String(el.innerText || '').replace(/\u00a0/g, ' ').replace(/\\r\\n?/g, '\\n');")]),
 ('27 las piezas finales de la hoja del editor pasan a editables', 'TC-804',
  [("  if (P.pie.length) out += docHojaHTML(docSustBloques(P.pie, D, 1000), D, false);",
    "  if (P.pie.length) out += docHojaHTML(docSustBloques(P.pie, D, 1000), D, true);")]),
 ('28 el encabezado y la fecha de la hoja del editor pasan a editables', 'TC-804',
  [("  let out = docHojaHTML(docSustBloques(P.cab, D, 0), D, false);",
    "  let out = docHojaHTML(docSustBloques(P.cab, D, 0), D, true);")]),
 ('29 el clic afuera vuelve a cerrar el editor de modelos', 'TC-809',
  [("  if (_docModo === 'modelo') return;\n  if (!docSinEntregar()) { docCerrar(); return; }",
    "  if (!docSinEntregar()) { docCerrar(); return; }")]),
 ('30 cerrar el editor con cambios sin guardar ya no pregunta', 'TC-809',
  [("  if (_cdFirmaEd() === _cdEd.firmaIni) { docmodEdSalir(); return; }", "  { docmodEdSalir(); return; }")]),
 ('31 la hoja del editor deja de usar un paciente ficticio', 'TC-804',
  [("  const D = docDatos(), E = docmodEjemplo();\n  for (const k in E) if (Object.prototype.hasOwnProperty.call(E, k)) D[k] = E[k];\n  return D;",
    "  return docDatos();")]),
 # ── commit 5 · PARTE C · los dos documentos en blanco ─────────────────────────────────────
 ('32 los dos blancos dejan de listarse y de entrar al menu', 'TC-811',
  [("  DOCMOD_BLANCOS.forEach(function (k) { const m = docmodModelo(k, st); if (m) out.push(m); });\n  return out;",
    "  return out;")]),
 ('33 un blanco se arma con titulo y linea del paciente: deja de ser virgen', 'TC-811',
  [("    bl.push({ t: 'enc' });\n    bl.push({ t: 'ciudadfecha' });\n    const cuerpo = docmodTextoABloques(m.txt);",
    "    bl.push({ t: 'enc' });\n    bl.push({ t: 'ciudadfecha' });\n    bl.push({ t: 'tit', x: 'DOCUMENTO' });\n    bl.push({ t: 'pacid' });\n    const cuerpo = docmodTextoABloques(m.txt);")]),
 ('34 la firma de un blanco deja de viajar con el ultimo parrafo: puede quedar SOLA en una hoja', 'TC-812',
  [("      if (cuerpo.length) {\n        const u = bl[bl.length - 1], c = {};\n        for (const k in u) if (Object.prototype.hasOwnProperty.call(u, k)) c[k] = u[k];\n        c.grupo = 'firmas';\n        bl[bl.length - 1] = c;\n      }\n      bl.push({ t: 'firma', grupo: 'firmas' });",
    "      bl.push({ t: 'firma' });")]),
 ('35 la casilla de la firma del Informe escribe en el MODELO', 'TC-811',
  [("    st.conFirma = !!this.checked;\n    st.editado = true; st.entregado = false;",
    "    const stm = docmodLeer(); stm.blanco[_docAbierto].firma = !!this.checked; docmodEscribir(stm);\n    st.conFirma = !!this.checked;\n    st.editado = true; st.entregado = false;")]),
 ('36 el nombre de un blanco puede quedar vacio', 'TC-811',
  [("    if (!nom) { alert('El nombre no puede quedar vacío.'); return; }", "    /* sin control */")]),
 ('37 «Vaciar» deja el nombre personalizado puesto', 'TC-811',
  [("      _cdEd.nom = docmodBlancoNom(_cdEd.clave);", "      /* el nombre queda */")]),
 ('38 el pegado en el cuerpo vuelve a colapsar los saltos de linea', 'TC-812',
  [("  const limpio = enCuerpo\n    ? crudo.replace(/\\r\\n?/g, '\\n').split('\\n')",
    "  const limpio = false\n    ? crudo.replace(/\\r\\n?/g, '\\n').split('\\n')")]),
 ('39 un blanco se imprime con el cuerpo de una constancia', 'TC-811',
  [("const DOCMOD_SZ = Object.freeze({ constancia: 10.5, consent: 10.2, blanco: 10.2 });",
    "const DOCMOD_SZ = Object.freeze({ constancia: 10.5, consent: 10.2, blanco: 10.5 });")]),
 ('40 el nombre del blanco deja de nombrar la miniatura y el pie del PDF', 'TC-811',
  [("           tit: m.incl ? DOC_DEFS[clave].tit : (m.nom || m.tit || 'Documento'),",
    "           tit: 'Documento',")]),
 ('41 los bloques de la hoja de un blanco se leen de st.bloques, que esta vacio', 'TC-812',
  [("  if (!docmodEsBlanco(clave)) return st.bloques;", "  return st.bloques;")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] != '--anclas' else None
if len(sys.argv) > 2 and sys.argv[2] == '--anclas':
    mal = 0
    for i, (nom, casos, pares) in enumerate(MUT, 1):
        for bus, rep in pares:
            c = orig.count(bus)
            if c != 1:
                mal += 1
                print('  %02d ANCLA x%d  %s' % (i, c, nom))
    print('  anclas que NO aparecen exactamente una vez: %d de %d mutaciones' % (mal, len(MUT)))
    sys.exit(0)
for i, (nom, casos, pares) in enumerate(MUT, 1):
    if SOLO and ('%02d' % i) not in SOLO: continue
    s = orig; ok = True
    for bus, rep in pares:
        if s.count(bus) != 1:
            noaplica.append((nom, 'el ancla aparece %d veces' % s.count(bus))); ok = False; break
        s = s.replace(bus, rep)
    if not ok: print('  %02d NO APLICA  %s' % (i, nom), flush=True); continue
    with open(IDX, 'w', encoding='utf-8') as f:
        f.write(s); f.flush(); os.fsync(f.fileno())
    if open(IDX, encoding='utf-8').read() != s:
        noaplica.append((nom, 'el archivo en disco no coincide')); print('  %02d DISCO  %s' % (i, nom), flush=True); continue
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', casos],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        noaplica.append((nom, 'el suite NO CORRIO')); print('  %02d NO CORRIO  %s' % (i, nom), flush=True)
    elif chr(10007) in out:
        muertas.append(nom); print('  %02d MUERTA    %s' % (i, nom), flush=True)
    else:
        vivas.append(nom); print('  %02d SOBREVIVIO %s   <<<' % (i, nom), flush=True)
with open(IDX, 'w', encoding='utf-8') as f:
    f.write(orig); f.flush(); os.fsync(f.fileno())
print('')
print('  %d/%d MUERTAS   %d sobrevivieron   %d no aplicaron   (%.1f min)' % (
    len(muertas), len(MUT) if not SOLO else len(SOLO), len(vivas), len(noaplica), (time.time() - t0) / 60))
for n, m in noaplica: print('    NO APLICO: %s - %s' % (n, m))
for n in vivas: print('    SOBREVIVIO: %s' % n)
print('  md5 del arbol VIVO: antes %s  despues %s  %s' % (
    MD5_VIVO, md5(VIVO), 'IDENTICO' if MD5_VIVO == md5(VIVO) else '!!! CAMBIO !!!'))
