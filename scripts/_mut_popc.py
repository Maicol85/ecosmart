#!/usr/bin/env python3
"""
_mut_popc.py - barrido de mutaciones dirigidas de la tanda POP-C (2026-11-02).

Cada mutacion inyecta UN defecto en una COPIA del arbol (un worktree), corre SOLO el caso que
le toca y exige que se ponga ROJO. Una mutacion que sobrevive es cobertura que falta.

Guarda de md5 ANTES y DESPUES: el arbol vivo no se toca nunca.

  python3 scripts/_mut_popc.py            # todas
  python3 scripts/_mut_popc.py 03 07      # algunas
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (id, caso, descripcion, viejo, nuevo)
MUT = [
 # ── commit 1 · el selector de valvulas ────────────────────────────────────────────────────
 ('01', 'TC-595', 'popCxVSync sale del barrido de espejos: el selector deja de seguir a Valvulas',
  "          'popCxVSync',", "          /* MUT01 */"),
 ('02', 'TC-595', 'popCxVSync pinta la etiqueta pero NO el valor del selector',
  "    if (e.value !== st.val) e.value = st.val;",
  "    /* MUT02 */"),
 # ── commit 2 · Marfan ─────────────────────────────────────────────────────────────────────
 ('03', 'TC-596', 'la linea del informe vuelve a enumerar las ausencias',
  "          if (v === 'si') _apt.push(x[1]);",
  "          if (v === 'si') _apt.push(x[1]); else if (v === 'no') _apt.push(x[1] + ' ausente');"),
 ('04', 'TC-596', 'la oracion unica se escribe con UNA sola de la pareja en No (aplica de mas)',
  "          if (_el === 'no' && _hf === 'no') frases.push('Sin ectopia lentis ni historia familiar.');",
  "          if (_el === 'no' || _hf === 'no') frases.push('Sin ectopia lentis ni historia familiar.');"),
 ('05', 'TC-596', 'el Z usa la superficie corporal de la app (Mosteller) y no la de DuBois',
  "  var bsa = mfsZBsaDuBois(peso, talla);",
  "  var bsa = Math.sqrt((peso * talla) / 3600);"),
 ('06', 'TC-596', 'el coeficiente del sexo se pierde: la ecuacion deja de distinguirlo',
  "  var pred = 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.267 * (sx === 'M' ? 1 : 2);",
  "  var pred = 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.267;"),
 ('07', 'TC-596', 'se calcula tambien por debajo de los 15 anos (aplica de mas)',
  "  if (edad < MFS_Z_EDAD_MIN) return { z: null, falta: [], menor: true };",
  "  /* MUT07 */"),
 ('08', 'TC-596', 'el calculado le gana al manual',
  "  var m = mfsZManual(src);\n  if (m != null) return m;\n  var c = mfsZCalc(src);\n  return (c && c.z != null) ? c.z : null;",
  "  var c = mfsZCalc(src);\n  if (c && c.z != null) return c.z;\n  return mfsZManual(src);"),
 ('09', 'TC-596', 'el pintor del Z ESCRIBE el campo guardado (el defecto del D-9)',
  "  b.disabled = !hay;",
  "  b.disabled = !hay;\n  if (hay) { var _e9 = document.getElementById('mfs_z_raiz'); if (_e9) _e9.value = c.z.toFixed(2); }"),
 # ── commit 3 · la hemodinamica ────────────────────────────────────────────────────────────
 ('10', 'TC-597', 'el corte de bajo gasto vuelve a no ser estricto',
  "  if (ic < POP_IC_BAJO_MAX) return { cls:'red', txt:'bajo' };",
  "  if (ic <= POP_IC_BAJO_MAX) return { cls:'red', txt:'bajo' };"),
 ('11', 'TC-597', 'el corte estricto se propaga a Hemodinamica, que esta orden NO autoriza',
  "  if (ic <= 2.2) return { cls:'red',    txt:'bajo' };",
  "  if (ic < 2.2) return { cls:'red',    txt:'bajo' };"),
 ('12', 'TC-597', 'la precarga vuelve a graduarse con la banda de 12 a 18',
  "              cls: 'gray',",
  "              cls: (pcp !== null && pcp >= POP_PCP_PRECARGA_MIN && pcp <= UMBRAL_PCP_HUMEDO) ? 'green' : 'yellow',"),
 ('13', 'TC-597', 'la fila del pericardio deja de enumerar los signos del modulo',
  "    if (_sg.length) _part.push(_sg.join(', '));",
  "    /* MUT13 */"),
 ('14', 'TC-597', 'el rotulo de los cortes del VD desaparece',
  "        ? ' ' + badge('gray', 'cortes de la cápsula de TEP') : '';",
  "        ? '' : '';"),
 # ── commit 4 · integrar y los avisos ──────────────────────────────────────────────────────
 ('15', 'TC-598', 'vuelve a exigir el indice cardiaco para integrar',
  "           suficiente: !!icB || tapo || _popHayAlgunDato() };",
  "           suficiente: !!icB || tapo };"),
 ('16', 'TC-598', 'el predicado cuenta los espejos, asi que un modulo intacto parece cargado',
  "      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) {",
  "      if (false) {"),
 ('17', 'TC-598', 'el aviso vuelve a la variable que no resuelve fuera de .amilo-root',
  "              line-height:1.45; background:rgba(245,158,66,.15); color:var(--orange);\n              border-left:3px solid var(--orange); }",
  "              line-height:1.45; background:var(--amber-pale); color:var(--amber);\n              border-left:3px solid var(--amber); }"),
 ('18', 'TC-598', 'el anillo del boton vuelve a no dibujarse',
  "  .btn-integrar.revisar { box-shadow:0 0 0 2px var(--orange); }",
  "  .btn-integrar.revisar { box-shadow:0 0 0 2px var(--amber); }"),
 # ── commits 5 a 7 · el dibujo ─────────────────────────────────────────────────────────────
 ('19', 'TC-599', 'la excursion del velo deja de ser la de la demo',
  "const POP_ESQ_VALV_ANG = 72;",
  "const POP_ESQ_VALV_ANG = 50;"),
 ('20', 'TC-599', 'la biologica dibuja rectas en vez de las curvas de la demo',
  "  if (bio) {\n    return [ 'M-8 0Q'",
  "  if (false) {\n    return [ 'M-8 0Q'"),
 ('21', 'TC-599', 'la mitral pasa a abrir en sistole, como la aortica',
  "  if (k === 'ao' || k === 'pu') return ph < 0.35 ? Math.sin(Math.PI * ph / 0.35) : 0;",
  "  return ph < 0.35 ? Math.sin(Math.PI * ph / 0.35) : 0;\n  if (k === 'ao' || k === 'pu') return 0;"),
 ('22', 'TC-599', 'el grado de la pulmonar, que guarda la PALABRA, deja de leerse',
  "  return _POP_JET_PAL[v.toLowerCase()] || 0;",
  "  return 0;"),
 ('23', 'TC-599', 'el chorro se dibuja aunque no haya grado (aplica de mas)',
  "    const m = POP_ESQ_JET[gr];\n    if (!m) { o.g.setAttribute('display', 'none'); return; }",
  "    const m = POP_ESQ_JET[gr] || POP_ESQ_JET[2];"),
 ('24', 'TC-599', 'los dos cateteres se dibujan sin dispositivo elegido (aplica de mas)',
  "  n.catSwan.setAttribute('display', d.mon === 'swan' ? 'inline' : 'none');\n  n.catPicco.setAttribute('display', d.mon === 'picco' ? 'inline' : 'none');",
  "  n.catSwan.setAttribute('display', 'inline');\n  n.catPicco.setAttribute('display', 'inline');"),
 # ── commits 8 a 10 · cavidades, anillo, trazados y PDF ────────────────────────────────────
 ('25', 'TC-600', 'la FEVI deja de agrandar el ventriculo izquierdo',
  "      if (FV[k]) o.sVI = FV[k];",
  "      /* MUT25 */"),
 ('26', 'TC-600', 'el tabique en D se abomba tambien con un No expreso (aplica de mas)',
  "    if (tv === 'si') o.bulge = 24;\n    else if (tv === 'no') o.bulge = 0; }",
  "    if (tv === 'si' || tv === 'no') o.bulge = 24; }"),
 ('27', 'TC-600', 'el anillo del derrame vuelve a no seguir al tamano',
  "    const base = (t && TAM[t]) ? TAM[t] : (d.hayDerrame ? 8 : 0);",
  "    const base = d.hayDerrame ? 8 : 0;"),
 ('28', 'TC-600', 'la marca del compromiso deja de sumar por encima del tamano',
  "    o.eff = d.hayDerrame ? (base + (d.compresion ? 6 : 0)) : 0; }",
  "    o.eff = d.hayDerrame ? base : 0; }"),
 ('29', 'TC-600', 'el trazado del TAPSE pierde puntos y deja de ser el de la demo',
  "  let d = ''; const N = 26;",
  "  let d = ''; const N = 12;"),
 ('30', 'TC-600', 'el esquema del posoperatorio sale del registro de diagramas del PDF',
  "  { k:'pop',   w:2, fam:'pop', lbl:'Esquema del posoperatorio' }",
  "  /* MUT30 */"),
 ('31', 'TC-600', 'la casilla del PDF pasa a ser un control de pantalla y deja de guardarse',
  '      <input type="hidden" id="pop_esq_pdf" value="">',
  '      <input type="hidden" id="pdf-pop_esq" value="">'),
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
