#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_tga.py — barrido de MUTACIONES DIRIGIDAS de la TANDA TGA (2026-10-31).

Cada mutacion revierte UNA de las cosas que los commits 1, 2 y 3 cambiaron —o la aplica DE
MAS— sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_tga.py              # todas
  python3 scripts/_mut_tga.py --solo 1,2   # un grupo

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los tres por cada una: TC-561 cubre los campos,
TC-562 el diagrama y TC-563 el papel. Una mutacion del commit 1 que pusiera rojo a TC-562
estaria diciendo que el reparto esta mal, no que la cobertura exista.

CUATRO DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 04 hace que esconder la fila
BORRE el valor —lo contrario de «nada automatico escribe en el estudio»—, la 09 que las
comunicaciones se dibujen tambien con el switch auricular, la 11 que la linea del papel afirme
«sin cirugia» cuando no hay dato, y la 13 que la frase de la cirugia se diga TAMBIEN con los
tipos que ya la nombran. Existen porque las condiciones que las matan son CONTROLES NEGATIVOS,
y un control negativo que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo)  -- o (nombre, caso, [(v1,n1),(v2,n2)]) para romper dos mitades
MUT = [

 # ══ COMMIT 1 · el campo de cirugia y el valor de anatomia ══════════════════════════════════
 ('01 el dueno deja de reconocer que Post-Mustard ES el switch auricular', 'TC-561',
  "  if (tipo === 'mustard' || tipo === 'senning')\n    return { tipo:tipo, anat:'dtga', cir:'auricular', cirDeTipo:true, cirIgnorada:!!cir };",
  "  if (tipo === 'mustard' || tipo === 'senning')\n    return { tipo:tipo, anat:'dtga', cir:cir, cirDeTipo:false, cirIgnorada:false };"),

 ('02 el dueno acepta cualquier valor de cirugia, sin vocabulario', 'TC-561',
  "  const cir = (TGA_CIR_VAL.indexOf(cru) >= 0) ? cru : '';",
  "  const cir = cru;"),

 ('03 la fila de cirugia se muestra con CUALQUIER tipo', 'TC-561',
  "  if (_fila) _fila.style.display = (_ej.tipo === 'dtga') ? '' : 'none';",
  "  if (_fila) _fila.style.display = _ej.tipo ? '' : 'none';"),

 ('04 DE MAS: esconder la fila BORRA el valor guardado', 'TC-561',
  "  if (_fila) _fila.style.display = (_ej.tipo === 'dtga') ? '' : 'none';",
  "  if (_fila) { _fila.style.display = (_ej.tipo === 'dtga') ? '' : 'none';\n    if (_ej.tipo !== 'dtga') { const _c = document.getElementById('tga_cirugia'); if (_c) _c.value = ''; } }"),

 ('05 el valor nuevo pierde su rotulo y el informe publica el token crudo', 'TC-563',
  "  const TIPO = { dtga:'completa (d-TGA)', cctga:'congenitamente corregida (ccTGA)'".replace('congenitamente', 'congénitamente'),
  "  const TIPO = { cctga:'congenitamente corregida (ccTGA)'".replace('congenitamente', 'congénitamente')),

 ('06 la columna de Excel emite el token crudo en vez de la etiqueta', 'TC-561',
  "    'TGA cirugía realizada': _ccLbl(TGA_CIR_XLS, c.tga_cirugia)",
  "    'TGA cirugía realizada': String(c.tga_cirugia == null ? '' : c.tga_cirugia)"),

 ('07 el alias de importacion del tipo nuevo se va: el round-trip se rompe', 'TC-561',
  "  dtga:'dtga', 'd-tga':'dtga', 'tga completa':'dtga', 'tga completa (d-tga)':'dtga',",
  "  'd-tga':'dtga',"),

 ('08 el prefijo del dibujo sale de la lista: los controles se vuelven campos del estudio', 'TC-561',
  "|pop-bcia-|tga-3d-|vd-triv|",
  "|pop-bcia-|vd-triv|"),

 # ⚠️ LA MUTACION 15 ES LA DEFENSA DE UN DEFECTO QUE LA SUITE COMPLETA ENCONTRO. El prefijo del
 # dibujo tiene que estar en DOS listas, y agregarlo a una sola dejo TC-159, TC-246 y TC-247 en
 # rojo: `tga-3d-fc` es un input numerico con 70 en el marcado, asi que `limpiarCampos` lo vaciaba
 # y `_formTieneDatos` veia un campo distinto de su valor por defecto. «Nuevo estudio» preguntaba
 # sobre un formulario vacio y el autoguardado NO restauraba el borrador. La 08 rompe la primera
 # lista y la 15 la segunda: cada una por su puerta, que es la leccion del D-11.
 ('15 el prefijo sale de la SEGUNDA lista: el formulario vacio dice que tiene datos', 'TC-561',
  "|pop-bcia-|tga-3d-|centro_tipo$|",
  "|pop-bcia-|centro_tipo$|"),

 # ⚠️ LA 16 ES LA TERCERA LISTA, y tambien la encontro la suite completa: sin `data-ui`,
 # `secAutoOpen` ABRE la seccion de la TGA sola al entrar a «CC complejas», porque la casilla
 # «Nombres» viene marcada y la frecuencia trae 70. Dejo TC-514 en rojo.
 ('16 los controles del dibujo pierden data-ui: la seccion se abre sola', 'TC-561',
  [('<input type="checkbox" id="tga-3d-ins" data-ui onchange', '<input type="checkbox" id="tga-3d-ins" onchange'),
   ('<input type="checkbox" id="tga-3d-nom" data-ui checked', '<input type="checkbox" id="tga-3d-nom" checked'),
   ('<input type="number" id="tga-3d-fc" data-ui value="70"', '<input type="number" id="tga-3d-fc" value="70"')]),

 # ══ COMMIT 2 · el diagrama 3D ══════════════════════════════════════════════════════════════
 ('09 DE MAS: las comunicaciones se dibujan tambien con el switch auricular', 'TC-562',
  "  if (a === 'dtga' && o !== 'auricular') {",
  "  if (a === 'dtga') {"),

 # ⚠️ ESTA MUTACION ESTABA MAL ESCRITA EN EL PRIMER BARRIDO, y por eso SOBREVIVIO. Cambiaba
 # `o` en la cabecera, pero la rama de L-TGA NO LEE `o` en ninguna linea: todo lo que depende de
 # la cirugia esta detras de un `a === 'dtga'`, asi que la escena salia identica y la mutacion no
 # inyectaba ningun defecto. Lo que hace falta es inyectarlo DENTRO de la rama de L-TGA.
 ('10 la escena de L-TGA empieza a aplicar la cirugia, contra la regla de la demo', 'TC-562',
  "  if (a === 'ltga') {\n    s.ar.push({ p:_t3cat(P.AO_LT), c:C.red, r:P.AOR, br:1, from:'R' },",
  "  if (a === 'ltga') {\n    if (cir === 'auricular') s.ex.push({ t:'ring', c:[0,0,0], r:0.2, ry:true, in:true });\n    s.ar.push({ p:_t3cat(P.AO_LT), c:C.red, r:P.AOR, br:1, from:'R' },"),

 ('11 DE MAS: la linea del papel afirma «sin cirugia» cuando no hay dato', 'TC-562',
  "  if (ej.cirDeTipo) p.push('switch auricular');\n  else if (ej.cir) p.push(TGA_CIR_LBL[ej.cir] || ej.cir);",
  "  if (ej.cirDeTipo) p.push('switch auricular');\n  else p.push(TGA_CIR_LBL[ej.cir] || 'sin cirugía');"),

 ('12 el foramen oval deja de contar como comunicacion interauricular', 'TC-562',
  "  const fop = !!(_nv('fop_tunel') != null || _sv('fop_shunt_reposo') === 'si' ||\n                 _sv('fop_shunt_valsalva') === 'si');",
  "  const fop = false;"),

 ('13 el diagrama se adelanta a la CIA en el registro del motor de tercios', 'TC-562',
  "  { k:'cia',   w:1, fam:'cc',  lbl:'Comunicación interauricular — bordes' },",
  "  { k:'tga3d', w:1, fam:'cc',  lbl:'Transposición de grandes arterias — esquema 3D' },\n  { k:'cia',   w:1, fam:'cc',  lbl:'Comunicación interauricular — bordes' },"),

 # ══ COMMIT 3 · la cirugia en el papel ══════════════════════════════════════════════════════
 ('14 DE MAS: la frase se dice TAMBIEN con los tipos que ya la nombran', 'TC-563',
  "  if (ej.tipo !== 'dtga' || !ej.cir) return '';",
  "  if (!ej.cir) return '';"),
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
            # Caer por EXCEPCION no es caer: no dice que invariante se rompio.
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
