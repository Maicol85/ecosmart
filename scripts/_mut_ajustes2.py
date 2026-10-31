#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_ajustes2.py — barrido de MUTACIONES DIRIGIDAS de la TANDA AJUSTES-2 (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-557 se ponga ROJO.

  python3 scripts/_mut_ajustes2.py              # todas
  python3 scripts/_mut_ajustes2.py --solo 1,2   # un grupo

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 le devuelve la guia al PPT
de una seccion que no es la coartacion, la 09 hace que el barrido de diagramas escriba tambien
los NO incluidos, la 11 que la adopcion del esquema huerfano se haga con DOS huerfanos —donde
adoptar el equivocado es peor que no adoptar— y la 13 que el ⓘ de TAMANO del VD repita el texto
entero en vez de remitir. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS,
y un control negativo que ninguna mutacion puede romper no esta probando nada.

LA 02 Y LA 03 SON EL MISMO ERROR POR DOS PUERTAS: la 02 le devuelve `c.txt` al cuerpo del
informe y la 03 al recuadro del PDF. Cada una sobrevive si la otra la tapa, asi que van
separadas — es la leccion del D-11 con `data-espejo`.

LA 06 ROMPE LAS DOS ALLOWLISTS DE `noPdf` A LA VEZ, por lo contrario: estan duplicadas a
proposito, asi que romper una sola la tapa la otra.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-557'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # == COMMIT 1 . la coartacion en el papel ============================
 ('01 el dueno unico deja de existir y el papel vuelve a llevar la guia',
  "  const k = c.via ? (c.clave + '_' + c.via) : c.clave;\n  return Object.prototype.hasOwnProperty.call(COA_PAPEL, k) ? COA_PAPEL[k] : null;",
  "  return ' ' + String(c.txt || '');"),

 ('02 el CUERPO del informe vuelve a pegar c.txt',
  "      if (c.papel) p[p.length - 1] = p[p.length - 1] + c.papel;\n      etePars.push(p.join('. ') + '.'); ccMarcarParrafo();",
  "      if (c.papel) p[p.length - 1] = p[p.length - 1] + c.papel;\n      etePars.push(p.join('. ') + '. ' + c.txt + '.'); ccMarcarParrafo();"),

 ('03 el RECUADRO «Segun la guia» vuelve a la hoja del PDF',
  "      ccHoja('coa', p, null, null);",
  "      ccHoja('coa', p, c.txt, null);"),

 ('04 el EN SUMA integrado vuelve a publicar la clase y la guia',
  "    const DX = { limitrofe:'gradiente limítrofe',\n                 incompleto:'datos incompletos para clasificarla' };",
  "    const DX = { limitrofe:'gradiente limítrofe', indicacion_i:'indicación de intervención Clase I ESC 2020',\n                 incompleto:'datos incompletos para clasificarla' };"),

 ('05 DE MAS: la fila del PPT vuelve a leer c.txt en la coartacion',
  "        if (cc && d.papel) {",
  "        if (false && d.papel) {"),

 ('06 la aposicion deja de ir a p[0] y «nativa» desaparece del informe',
  "                 (c.apos ? (loc ? ', ' : ' ') + c.apos : '')];",
  "                 (c.clave === 'incompleto' && c.apos ? ', ' + c.apos : '')];"),

 ('07 el EN SUMA no integrado pierde la clausula de significacion',
  "       + (c.papel || '') + '.';",
  "       + '.';"),

 # == COMMIT 2 . los diagramas se guardan con el estudio ==============
 ('08 el barrido de diagramas deja de correr al guardar el estudio',
  "  if (typeof diagGuardarIncluidos === 'function') {\n    try { diagGuardarIncluidos(); } catch (e) {}\n  }",
  ""),

 ('09 DE MAS: el barrido guarda tambien los diagramas NO incluidos',
  "    let on = false;\n    try { on = !!d.on(); } catch (e) { on = false; }\n    if (!on) {",
  "    let on = true;\n    try { d.on(); } catch (e) {}\n    if (!on) {"),

 ('10 el valor por omision de Config vuelve a ser APAGADO',
  "  try { const v = localStorage.getItem(IMG_CFG_KEY); return v === null ? true : v === '1'; }",
  "  try { const v = localStorage.getItem(IMG_CFG_KEY); return v === '1'; }"),

 ('11 `noPdf` sale de LAS DOS allowlists a la vez',
  None, None),   # se arma abajo: son dos reemplazos

 # == COMMIT 3 . la orejuela determinista =============================
 ('12 el esquema huerfano deja de adoptarse y el boton vuelve a mentir',
  "  const huerfanos = [];\n  for (let i = 0; i < imgSlots.length; i++)\n    if (imgSlots[i] && imgSlots[i].esquema && !imgSlots[i].esqClave) huerfanos.push(i);\n  if (huerfanos.length === 1) { imgSlots[huerfanos[0]].esqClave = clave; return huerfanos[0]; }",
  ""),

 ('13 DE MAS: adopta aunque haya DOS huerfanos, o sea el equivocado',
  "  if (huerfanos.length === 1) { imgSlots[huerfanos[0]].esqClave = clave; return huerfanos[0]; }",
  "  if (huerfanos.length >= 1) { imgSlots[huerfanos[0]].esqClave = clave; return huerfanos[0]; }"),

 # == COMMIT 4 . la fila y «Manga de viento» ==========================
 ('14 «Manga de viento» vuelve a afirmar un riesgo intermedio',
  '<option value="veleta">Manga de viento</option>',
  '<option value="veleta">Manga de viento \u2014 riesgo intermedio</option>'),

 ('15 el ⓘ de la fila pierde su z-index y la ✕ vuelve a taparlo',
  "  #inf-min-fila .inf-min-cab .vinfo-btn{position:relative;z-index:1}",
  ""),

 # == COMMIT 5 . los ⓘ del TRIV ======================================
 ('16 el ⓘ de FUNCION del VD pierde el bloque del TRIV',
  "  fr.appendChild(_evBloqueTriv());\n  fr.appendChild(_evFuentesPie(['FUN-VD-001'",
  "  fr.appendChild(_evFuentesPie(['FUN-VD-001'"),

 ('17 DE MAS: el ⓘ de TAMANO repite el texto entero en vez de remitir',
  "  fr.appendChild(_evDiv('ev-cat',\n    'El TRIV por Doppler tisular es un par\\u00e1metro de FUNCI\\u00d3N:",
  "  fr.appendChild(_evBloqueTriv());\n  fr.appendChild(_evDiv('ev-cat',\n    'El TRIV por Doppler tisular es un par\\u00e1metro de FUNCI\\u00d3N:"),

 ('18 la fila del Doppler tricuspide pierde su ⓘ',
  '<span class="calc-lbl">TRIV por Doppler tisular\n            <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="vd-triv"',
  '<span class="calc-lbl">TRIV por Doppler tisular\n            <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="NO-EXISTE"'),
]

# La 11 son DOS reemplazos: las dos allowlists a la vez (ver la cabecera).
# ⚠️ LOS DOS PATRONES VAN ANCLADOS EN SU LINEA ANTERIOR: el de la allowlist de LECTURA es
# sufijo del de ESCRITURA —la unica diferencia es la sangria—, asi que a secas el primero
# aparece DOS veces y la mutacion queda ambigua. Costo una verificacion.
MUT[10] = ('11 `noPdf` sale de LAS DOS allowlists de IndexedDB a la vez',
  [("                                        noPdf: !!s.noPdf,\n                                        videoId: (s.videoId || undefined),",
    "                                        videoId: (s.videoId || undefined),"),
   ("                                               noPdf: !!s.noPdf,\n                                               videoId: (s.videoId || undefined),",
    "                                               videoId: (s.videoId || undefined),")])

def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
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
            nom = ent[0]
            # La 11 trae una LISTA de pares: rompe las dos allowlists a la vez, porque
            # estan duplicadas a proposito y romper una sola la tapa la otra (leccion del D-11).
            pares = ent[1] if isinstance(ent[1], list) else [(ent[1], ent[2])]
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
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  (%s)' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for r in res if r[2] == 'MUERTA')
    print('\n  %d/%d MUERTAS' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('  !! %02d %s -> %s %s' % (i, nom, v, det[:160]))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
