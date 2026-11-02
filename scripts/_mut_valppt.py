#!/usr/bin/env python3
"""
_mut_valppt.py - barrido de mutaciones dirigidas de la tanda VAL-PPT (2026-11-02).

Cada mutacion inyecta UN defecto en una COPIA del arbol (un worktree), corre SOLO el caso que
le toca y exige que se ponga ROJO. Una mutacion que sobrevive es cobertura que falta.

Guarda de md5 ANTES y DESPUES: el arbol vivo no se toca nunca.

  python3 scripts/_mut_valppt.py            # todas
  python3 scripts/_mut_valppt.py 03 07      # algunas
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (id, caso, descripcion, viejo, nuevo)
MUT = [
 # ── commit 1 · las opciones nuevas y sus tres listas paralelas ────────────────────────────
 ('01', 'TC-605', 'la mitral pierde sus dos opciones nuevas',
  "<option>Plastia mitral</option><option>TEER mitral</option>", "<!-- MUT01 -->"),
 ('02', 'TC-605', 'el importador deja de aceptar la plastia mitral: la reimportacion descartaria la FILA ENTERA',
  "'Pr\u00f3tesis mec\u00e1nica','Plastia mitral','TEER mitral','Endocarditis'",
  "'Pr\u00f3tesis mec\u00e1nica','Endocarditis'"),
 ('03', 'TC-605', 'la redaccion del TEER mitral se pierde y el fallback destruye el acronimo',
  "  'TEER mitral':        { de:'con reparaci\u00f3n transcat\u00e9ter borde a borde (TEER)',",
  "  'TEER mitral XX':     { de:'con reparaci\u00f3n transcat\u00e9ter borde a borde (TEER)',"),
 ('04', 'TC-605', 'el predicado del posoperatorio vuelve a aceptar SOLO protesis',
  "const POP_TIPO_OP_PREFIJOS = Object.freeze(['Pr\u00f3tesis', 'TAVI', 'Plastia', 'TEER']);",
  "const POP_TIPO_OP_PREFIJOS = Object.freeze(['Pr\u00f3tesis']);"),
 ('05', 'TC-605', 'el predicado acepta TAMBIEN las nativas (aplica de mas): el papel volveria a describir una cirugia con una morfologia nativa',
  "  return POP_TIPO_OP_PREFIJOS.some(function (p) { return t.indexOf(p) === 0 });",
  "  return t.length > 0;"),
 ('06', 'TC-605', 'la plastia pasa a contar como protesis y deja de graduarse con cortes nativos',
  "const VALV_PROT_OPCIONES = Object.freeze(['Pr\u00f3tesis biol\u00f3gica', 'Pr\u00f3tesis mec\u00e1nica', 'TAVI']);",
  "const VALV_PROT_OPCIONES = Object.freeze(['Pr\u00f3tesis biol\u00f3gica', 'Pr\u00f3tesis mec\u00e1nica', 'TAVI', 'Plastia mitral']);"),
 # ── commit 3 · el papel ───────────────────────────────────────────────────────────────────
 ('07', 'TC-606', 'la mitral intervenida vuelve a NO subir al EN SUMA: el resumen niega lo que el cuerpo describe',
  "      if (tc !== 'plastia' && tc !== 'teer') return;",
  "      return;"),
 # ⚠️ LA 08 SOBREVIVIO DOS VECES Y LAS DOS ME DIJERON ALGO.
 #    (1) La primera version mutaba una guarda REDUNDANTE -el `valvEsProtesis` que ya hacia el
 #        filtro del tipo corto-, asi que no inyectaba ningun defecto. Esa guarda se RETIRO del
 #        codigo: dos mecanismos para el mismo trabajo son lo que hace sobrevivir a una mutacion.
 #    (2) La segunda solo aflojaba el filtro de TIPO, y `yaEnSuma` la tapaba: medido en los tres
 #        escenarios -protesis sola, protesis con insuficiencia y plastia con estenosis- el EN
 #        SUMA sale IDENTICO con y sin la mutacion, o sea que era una mutacion EQUIVALENTE.
 #    Hoy rompe LAS DOS MITADES A LA VEZ, que es lo que la orden pide y lo que el D-11 ya
 #    documenta: una mutacion que rompe una sola de dos protecciones redundantes sobrevive.
 # ⚠️ ROMPE LAS DOS MITADES EN UN SOLO REEMPLAZO. Medido: aflojar SOLO el filtro de tipo es
 #    una mutacion EQUIVALENTE -el EN SUMA sale identico en los tres escenarios, porque
 #    `yaEnSuma` la tapa-, y aflojar SOLO `yaEnSuma` la mata la 08b. La proteccion esta
 #    duplicada a proposito, asi que la mutacion que vale rompe las dos a la vez. Es la leccion
 #    que el D-11 pago con `data-espejo` y la que la orden de esta tanda pide expresamente.
 ('08', 'TC-606', 'el filtro de tipo Y la guarda de yaEnSuma rotos A LA VEZ: la mitral sale con dos renglones',
  "      if (tc !== 'plastia' && tc !== 'teer') return;",
  "      if (tc === '') return;\n      V.yaDicho = ['__nunca__'];"),
 ('08b', 'TC-606', 'la guarda de yaEnSuma se rompe sola (la otra mitad)',
  "      if (yaEnSuma) return;                     // el resumen ya habla de esta v\u00e1lvula",
  "      /* MUT08b */"),
 ('09', 'TC-606', 'la pasada ignora si el resumen YA habla de la valvula y duplica la linea',
  "      if (yaEnSuma) return;                     // el resumen ya habla de esta v\u00e1lvula",
  "      /* MUT09 */"),
 # ── commit 4 · el dibujo ──────────────────────────────────────────────────────────────────
 ('10', 'TC-607', 'el tipo corto vuelve a mandar todo lo que no diga mecanica a biologica',
  "  if (t.indexOf('Plastia') === 0) return 'plastia';",
  "  /* MUT10 */"),
 ('11', 'TC-607', 'el TEER deja de prender sus dos orificios',
  "    o.ori.forEach(function (e) { e.setAttribute('display', teer ? 'inline' : 'none') });",
  "    o.ori.forEach(function (e) { e.setAttribute('display', 'none') });"),
 ('12', 'TC-607', 'la plastia dibuja el circulo entero y no su semicirculo: se leeria como una protesis',
  "    const conCirculo = !(pla || tavi);",
  "    const conCirculo = !tavi;"),
 ('13', 'TC-607', 'el aro punteado neutro se prende SIEMPRE (aplica de mas)',
  "    o.aro.setAttribute('display', pla ? 'inline' : 'none');",
  "    o.aro.setAttribute('display', 'inline');"),
 # ── commit 5a · las etiquetas del TEER ────────────────────────────────────────────────────
 ('14', 'TC-607', 'el papel del TEER vuelve a publicar el juicio de cada criterio',
  "    L.push(_teerAsciiPDF(c.lbl) + ' | ' + _teerAsciiPDF(_teerTxtSinJuicio(c.txt)));",
  "    L.push(_teerAsciiPDF(c.lbl) + ' | ' + _teerAsciiPDF(c.txt));"),
 ('15', 'TC-607', 'el papel vuelve a publicar el titulo de aptitud y la derivacion',
  "    L.push('## Conclusi\u00f3n');\n    r.papel.forEach(t => L.push(_teerAsciiPDF(t)));",
  "    L.push('## Conclusi\u00f3n');\n    L.push(_teerAsciiPDF(r.titulo));\n    if (r.nota) L.push(_teerAsciiPDF(r.nota));"),
 ('16', 'TC-607', 'el recorte del juicio se lleva TAMBIEN la medicion (aplica de mas)',
  "  return (i < 0 ? s2 : s2.slice(0, i)).trim();",
  "  return (i < 0 ? '' : s2.slice(i + 3)).trim();"),
 # ── commits 6b y 7 · el PPT y el rotulo ───────────────────────────────────────────────────
 ('17', 'TC-608', 'la regla vuelve a la grilla FIJA: cuatro verticales desperdician media hoja',
  "  4: Object.freeze([Object.freeze([2, 2]), Object.freeze([4, 1]), Object.freeze([1, 4])])",
  "  4: Object.freeze([Object.freeze([2, 2])])"),
 ('18', 'TC-608', 'la regla elige la de MENOR area',
  "    if (a2 > mejorA + tol) { mejor = cands[i]; mejorA = a2; }",
  "    if (a2 < mejorA - tol) { mejor = cands[i]; mejorA = a2; }"),
 ('19', 'TC-608', 'la tolerancia se vuelve enorme y los empates tapan la diferencia real',
  "const IG_PPT_DISPOS_TOL = 0.01;   /* 1 % del area de la hoja */",
  "const IG_PPT_DISPOS_TOL = 0.9;"),
 ('20', 'TC-608', 'la casilla del numero nace APAGADA y cambia lo que la app ya hacia',
  "let _igImgNum = true;", "let _igImgNum = false;"),
 ('21', 'TC-608', 'el rotulo de la miocardiopatia vuelve a decir 2020',
  '<span class="calc-lbl">AHA/ACC 2024 \u00b7 factores mayores</span>',
  '<span class="calc-lbl">AHA/ACC 2020 \u00b7 factores mayores</span>'),
 ('22', 'TC-605', 'la tricuspide pierde sus dos opciones nuevas',
  "<option>Plastia tricusp\u00eddea</option><option>TEER tricusp\u00eddeo (T-TEER)</option>",
  "<!-- MUT22 -->"),
 # ── commit 4 · la fuga de una pieza nueva sobre una valvula que no la lleva ────────────────
 # Nace del barrido: la condicion (E9c) de TC-585 es NUEVA -la escribio esta tanda al adaptar
 # el conteo de rutas de ese caso- y sin una mutacion propia no estaria probando nada. El
 # escenario de TC-585 carga una protesis MECANICA en la aortica, asi que la malla del stent
 # encendida ahi es una afirmacion inventada sobre el implante.
 ('23', 'TC-585', 'la malla de la TAVI se prende SIEMPRE: una mecanica saldria con el marco del stent',
  "    o.malla.setAttribute('display', tavi ? 'inline' : 'none');",
  "    o.malla.setAttribute('display', 'inline');"),
]

def corre(ids):
    base = md5(IDX)
    print('md5 del arbol vivo ANTES: ' + base)
    wt = tempfile.mkdtemp(prefix='mutpopc_')
    subprocess.run(['git', '-C', RAIZ, 'worktree', 'add', '--detach', wt, 'HEAD'],
                   capture_output=True)
    res = []
    try:
        for (mid, caso, desc, viejo, nuevo) in MUT:
            if ids and mid not in ids:
                continue
            t0 = time.time()
            # el arbol de trabajo del worktree se repone desde el vivo en cada vuelta
            shutil.copy2(IDX, os.path.join(wt, 'index.html'))
            shutil.copy2(os.path.join(RAIZ, 'scripts', 'test_clinico.mjs'),
                         os.path.join(wt, 'scripts', 'test_clinico.mjs'))
            p = os.path.join(wt, 'index.html')
            with open(p, encoding='utf-8') as f:
                s = f.read()
            n = s.count(viejo)
            if n != 1:
                res.append((mid, caso, 'NO APLICA (%d coincidencias)' % n, desc, 0))
                print('  %s  NO APLICA (%d)  %s' % (mid, n, desc))
                continue
            with open(p, 'w', encoding='utf-8') as f:
                f.write(s.replace(viejo, nuevo))
            r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                               cwd=wt, capture_output=True, text=True, timeout=600)
            out = r.stdout + r.stderr
            dt = time.time() - t0
            # ⚠️ EXIGIR «RESULTADO» ANTES DE PUNTUAR: si el suite no arranca, stdout queda vacio,
            #    no hay ningun ✗ y TODAS las mutaciones saldrian «sobrevivio».
            if 'RESULTADO' not in out:
                veredicto = 'NO CORRIO'
            elif '✗' in out:
                veredicto = 'MUERTA'
            else:
                veredicto = '** SOBREVIVIO **'
            res.append((mid, caso, veredicto, desc, dt))
            print('  %s  %-18s %-8s %.0fs  %s' % (mid, veredicto, caso, dt, desc))
    finally:
        subprocess.run(['git', '-C', RAIZ, 'worktree', 'remove', '--force', wt],
                       capture_output=True)
    fin = md5(IDX)
    print('md5 del arbol vivo DESPUES: ' + fin + ('  (IDENTICO)' if fin == base else '  ** CAMBIO **'))
    m = sum(1 for x in res if x[2] == 'MUERTA')
    print('\nRESULTADO %d/%d muertas' % (m, len(res)))
    for x in res:
        if x[2] != 'MUERTA':
            print('  %s  %s  -> %s' % (x[0], x[3], x[2]))
    return 0 if m == len(res) else 1

if __name__ == '__main__':
    sys.exit(corre(set(a for a in sys.argv[1:] if not a.startswith('-'))))
