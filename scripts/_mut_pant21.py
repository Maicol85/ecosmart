#!/usr/bin/env python3
"""_mut_pant21.py - barrido de mutaciones dirigidas de la tanda PANT-21.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso (P14c-i).
Cada mutacion declara SU caso: con los seis por mutacion, un reparto mal hecho queda tapado
por el caso de otro commit.
Las anclas llevan el CARACTER REAL y no secuencias \\uXXXX, que es por lo que siete de PANT-19
no aplicaron.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ── TC-742 · la seccion de la protesis AORTICA ──────────────────────────────
 ('01 la compuerta de la seccion aortica acepta una valvula NATIVA', 'TC-742',
  [("  const morf = _indS('va_morf');\n  if (!(_indFn('valvEsProtesis') && valvEsProtesis(morf))) return null;",
    "  const morf = _indS('va_morf');\n  if (false) return null;")]),
 ('02 _indEA vuelve a publicar su tarjeta «esta seccion no aplica»', 'TC-742',
  [("  if (typeof valvEsProtesis === 'function' && valvEsProtesis(_indS('va_morf'))) return null;",
    "  if (typeof valvEsProtesis === 'function' && valvEsProtesis(_indS('va_morf'))) return { filas:[_indFila('X','Y','warn','z')], recom:{tipo:'no',tit:'no aplica',txt:'z'} };")]),
 ('03 la seccion aortica sale del registro IND_SECS', 'TC-742',
  [("  { tit:'Prótesis aórtica',                       fn:_indProtA },\n", "")]),
 ('04 una pregunta de la aortica pierde su etiqueta de guia', 'TC-742',
  [("{ clave:'prota.disf', lbl:'Disfunción protésica significativa', guia:'vhd25',",
    "{ clave:'prota.disf', lbl:'Disfunción protésica significativa', guia:'',")]),
 ('05 una pregunta de la aortica cambia de clave y su respuesta deja de registrarse', 'TC-742',
  [("clave:'prota.disf'", "clave:'prota.disfX'")]),
 ('06 la pre-respuesta de la fuga deja de distinguir «central» de «sin dato»', 'TC-742',
  [("                    : (_pvlOrig === 'central' ? 'no' : null);",
    "                    : null;")]),
 ('07 las tres preguntas de trombosis dejan de filtrarse por el tipo de protesis', 'TC-742',
  [("    if (p.clave === 'prota.icAguda' || p.clave === 'prota.trombGrande') { if (!esMec || _trb !== 'si') return; }\n    if (p.clave === 'prota.trombBio') { if (!esBio || _trb !== 'si') return; }\n",
    "")]),
 ('08 la seccion aortica pierde el marcador de orden', 'TC-742',
  [("    ordenProt: true,\n    causas: causas,", "    causas: causas,")]),
 # ── TC-743 · el bloque de CAUSAS de la aortica ──────────────────────────────
 ('09 el bloque de causas aparece tambien con el veredicto «normal»', 'TC-743',
  [("  const causas = (V && V.nivel === 'posible')", "  const causas = (V && V.nivel !== 'faltan')")]),
 ('10 el bloque de causas no aparece nunca', 'TC-743',
  [("  const causas = (V && V.nivel === 'posible')", "  const causas = (false)")]),
 ('11 el corte del cociente de la Figura 13 se mueve de 0,30 a 0,25', 'TC-743',
  [("  const enNormal = (dvi != null && dvi >= 0.30);", "  const enNormal = (dvi != null && dvi >= 0.25);")]),
 ('12 el hiperflujo y el desajuste se dan vuelta', 'TC-743',
  [("    return clave === 'desajuste' ? esDesaj : !esDesaj;", "    return clave === 'desajuste' ? !esDesaj : esDesaj;")]),
 ('13 el corte de la EOA indexada se mueve de 0,85 a 0,75', 'TC-743',
  [("    const esDesaj = avai < 0.85;", "    const esDesaj = avai < 0.75;")]),
 ('14 las otras tres causas pasan a marcarse solas (la aplica de MAS)', 'TC-743',
  [("    return clave === 'desajuste' ? esDesaj : !esDesaj;\n  }\n  return null;\n}",
    "    return clave === 'desajuste' ? esDesaj : !esDesaj;\n  }\n  return true;\n}")]),
 ('15 el decide deja de mirar la EOA indexada y decide con el cociente solo', 'TC-743',
  [("    if (!enNormal || avai == null) return null;", "    if (!enNormal) return null;")]),
 ('16 una causa aortica pierde su hoja y su folio', 'TC-743',
  [("apunta a un estado de hiperflujo. ASE 2024, Figura 13, hoja 18, folio 19.",
    "apunta a un estado de hiperflujo.")]),
 # ── TC-744 · la protesis MITRAL ─────────────────────────────────────────────
 ('17 una fila de la Tabla 17 desaparece del registro mitral', 'TC-744',
  [("  pvl_tc:     { c:'Clase IIa · Nivel B'", "  pvl_tcX:    { c:'Clase IIa · Nivel B'")]),
 ('18 una clase del registro mitral cambia', 'TC-744',
  [("  viv_mitral: { c:'Clase IIa · Nivel B'", "  viv_mitral: { c:'Clase IIa · Nivel C'")]),
 ('19 el bloque de causas mitral aparece tambien con «significativa»', 'TC-744',
  [("    causas: (P && P.obstr === 'posible') ? _indCausas(PROTM_CAUSAS, function () { return null; }) : null,",
    "    causas: (P && P.obstr) ? _indCausas(PROTM_CAUSAS, function () { return null; }) : null,")]),
 ('20 una causa mitral pasa a marcarse sola (la aplica de MAS)', 'TC-744',
  [("_indCausas(PROTM_CAUSAS, function () { return null; })", "_indCausas(PROTM_CAUSAS, function (k) { return k === 'pannus'; })")]),
 ('21 la seccion mitral pierde el marcador de orden', 'TC-744',
  [("    ordenProt: true,\n    /* ⚠️ EL BLOQUE DE CAUSAS", "    /* ⚠️ EL BLOQUE DE CAUSAS")]),
 ('22 una causa mitral pierde su hoja y su folio', 'TC-744',
  [("La guía enumera la degeneración valvular como la primera de las causas de estenosis de una prótesis mitral. ASE 2024, hoja 24, folio 25.",
    "La guía enumera la degeneración valvular como la primera de las causas de estenosis de una prótesis mitral.")]),
 # ── TC-745 · la protesis TRICUSPIDE ─────────────────────────────────────────
 ('23 la compuerta de la tricuspide acepta una plastia', 'TC-745',
  [("  const morf = _indS('vt_morf');\n  if (!(_indFn('valvEsProtesis') && valvEsProtesis(morf))) return null;",
    "  const morf = _indS('vt_morf');\n  if (!morf) return null;")]),
 ('24 la tricuspide publica el valve-in-valve TRANSFEMORAL, que es el de la aortica', 'TC-745',
  [("rec:'Clase IIa · Nivel B — es una de las condiciones del valve-in-valve percutáneo transvenoso en posición mitral o tricuspídea, hoja 66, folio 4700',",
    "rec:'Clase IIa · Nivel B — es una de las condiciones del valve-in-valve percutáneo transfemoral en posición aórtica, hoja 66, folio 4700',")]),
 ('25 la tricuspide gana un bloque de causas que la guia no sostiene (la aplica de MAS)', 'TC-745',
  [("  return { filas: filas, clinica: clinica,\n    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    ordenProt: true,\n    guia: { ref:PROTT_REF_ESC,",
    "  return { filas: filas, clinica: clinica,\n    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    ordenProt: true,\n    causas: _indCausas(PROTM_CAUSAS, function () { return null; }),\n    guia: { ref:PROTT_REF_ESC,")]),
 ('26 la seccion tricuspide sale del registro IND_SECS', 'TC-745',
  [("  { tit:'Prótesis tricúspide',                    fn:_indProtT },\n", "")]),
 ('27 la tricuspide deja de declarar por que no publica causas', 'TC-745',
  [("para la posición tricuspídea su Tabla 19 publica cortes y no causas.",
    "para la posición tricuspídea no hay.")]),
 # ── TC-746 · la protesis PULMONAR ───────────────────────────────────────────
 ('28 una pregunta de la pulmonar cita la ESC/EACTS 2025 y su folio 4700', 'TC-746',
  [("ref:'la guía americana no publica un corte de presión: su recomendación 6 pide estenosis severa y/o insuficiencia severa con síntomas (hoja 75, folio e189)'",
    "ref:'la ESC/EACTS 2025 lo trata en su tabla de disfunción protésica (hoja 66, folio 4700)'")]),
 ('29 una pregunta de la pulmonar cambia de guia y rompe el reparto', 'TC-746',
  [("{ clave:'protp.rvsp60', lbl:'Presión sistólica del ventrículo derecho mayor de 60 mmHg', guia:'esc',",
    "{ clave:'protp.rvsp60', lbl:'Presión sistólica del ventrículo derecho mayor de 60 mmHg', guia:'acc',")]),
 ('30 la pulmonar pierde el folio e189 de la guia que rige', 'TC-746',
  [("la intervención sobre el conducto debe realizarse para mejorar el estado cardiovascular, hoja 75, folio e189',",
    "la intervención sobre el conducto debe realizarse para mejorar el estado cardiovascular, hoja 75',")]),
 ('31 la pulmonar pierde el folio 622 de la guia de referencia', 'TC-746',
  [("con preferencia por la vía percutánea si es anatómicamente posible, Clase I · Nivel C (hoja 60, folio 622)',",
    "con preferencia por la vía percutánea si es anatómicamente posible, Clase I · Nivel C (hoja 60)',")]),
 ('32 la guia americana de congenitas se renombra a 2026', 'TC-746',
  [("const IND_GUIA_LBL = Object.freeze({ acc:'ACC/AHA 2025',", "const IND_GUIA_LBL = Object.freeze({ acc:'ACC/AHA 2026',")]),
 ('33 la pulmonar gana un bloque de causas que la guia no sostiene (la aplica de MAS)', 'TC-746',
  [("  return { filas: filas, clinica: clinica,\n    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    ordenProt: true,\n    guia: { ref:PROTP_REF_ACC,",
    "  return { filas: filas, clinica: clinica,\n    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    ordenProt: true,\n    causas: _indCausas(PROTM_CAUSAS, function () { return null; }),\n    guia: { ref:PROTP_REF_ACC,")]),
 # ── TC-747 · el emisor compartido ───────────────────────────────────────────
 ('34 ordenProt deja de implicar el molde de preguntas', 'TC-747',
  [("  const esPreg = !!(r.preguntas || r.ordenProt);", "  const esPreg = !!r.preguntas;")]),
 ('35 «Con lo contestado» vuelve ARRIBA tambien con ordenProt', 'TC-747',
  [("  if (r.adapt && !ordenProt) h += _indAdaptHTML(r.adapt, r.faltan);",
    "  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);")]),
 ('36 las causas se emiten SIEMPRE antes del bloque, y rompen el orden de la mitral', 'TC-744',
  [("  if (r.adapt) h += _causasH;\n", "  h += _causasH;\n")]),
 ('37 una seccion ajena gana el orden de protesis', 'TC-747,TC-322',
  [("    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    compacta: true,\n    preguntas: true,\n    guia: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta sección salen de DOS guías: la ACC/AHA 2025 de cardiopatías congénitas del adulto (apartado 4.1.3",
    "    cuenta: { si:_si.length, no:_no.length, sd:_sd.length },\n    adapt: _siDet, faltan: _sd,\n    compacta: true,\n    preguntas: true,\n    ordenProt: true,\n    guia: { ref:'acc2025achd',\n      txt:'Las indicaciones de esta sección salen de DOS guías: la ACC/AHA 2025 de cardiopatías congénitas del adulto (apartado 4.1.3")]),
 ('38 el bloque de causas se emite como un segundo control de detalle', 'TC-747',
  [("  return _indCajaReco(IND_RECOM_COL.falta, 'Causas posibles del gradiente alto', c);",
    "  return '<details data-ind-detalle=\"1\"><summary>Causas</summary>' + _indCajaReco(IND_RECOM_COL.falta, 'Causas posibles del gradiente alto', c) + '</details>';")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 else None
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
