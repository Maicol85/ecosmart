#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_y.py — barrido de MUTACIONES DIRIGIDAS de la tanda Y, Parte 1 (2026-10-29).

Cada mutacion revierte UNA de las cosas que los commits 1 a 3 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-549 se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_y.py              # todas
  python3 scripts/_mut_y.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ TRES DE LAS TRECE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 hace que la fila del strain se
   vea tambien con un 0 o con un valor fuera de banda, la 10 que el sexo vacio escriba igual y la
   12 que el papel nombre el indice aunque el voto lo haya dado el diametro. Existen porque las
   condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion
   puede romper no esta probando nada.
⚠️ LA 08 ROMPE LAS DOS PUERTAS A LA VEZ. El espejo del TRIV esta fuera del estudio por el
   prefijo de `_noEsDelEstudio`, y su sincronizacion cuelga de DOS manejadores `oninput`: una
   mutacion que rompa uno solo sobrevive porque el otro la tapa. Es la leccion que el D-11 dejo
   escrita.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-549'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · el strain en el cuadro de referencias ────────────────────────────
 ('01 el pintor vuelve a escribir debajo del campo',
  "  const el = document.getElementById('vd-strain-interp');",
  "  const el = document.getElementById('vd_strain_pl-marca');"),

 # La fila deja de ser la que SIGUE a la del Tei: se le mete OTRA fila en medio. Es la condicion
 # (A2), la unica que mide la POSICION y no el contenido.
 ('02 la fila del strain deja de seguir a la del indice de Tei',
  '        <div class="calc-row" id="row-vd-strain-interp" style="display:none;">',
  '        <div class="calc-row"><span class="calc-lbl">mut</span><span id="mut-interp">\u2014</span></div>\n'
  '        <div class="calc-row" id="row-vd-strain-interp" style="display:none;">'),

 ('03 el texto de la banda LEVE pierde su corte',
  "     : cat === 'leve'   ? ' (de ' + VD_STRAIN_PL_LEVE + ' a ' + VD_STRAIN_PL_NORMAL + ' % en valor absoluto)'",
  "     : cat === 'leve'   ? ''"),

 ('04 por debajo de leve deja de decir que la fuente no publica moderada ni severa',
  "     : ' (menos de ' + VD_STRAIN_PL_LEVE + ' % en valor absoluto — la aplicación no tiene corte de moderada ni de severa)');",
  "     : '');"),

 ('05 DE MAS: la fila se ve tambien con un 0 o con un valor fuera de banda',
  "  const _hayStrain = (typeof vdStrainPlCat === 'function')\n    && vdStrainPlCat((document.getElementById('vd_strain_pl') || {}).value) !== null;",
  "  const _hayStrain = true;"),

 # ── commit 2 · el TRIV con dos puertas ─────────────────────────────────────────
 # ⚠️ EL ANCLA TIENE QUE SER UNICA: la linea `if (dst.value === src.value) return ...` aparece
 # SEIS veces en el archivo -es el patron de todos los espejos de la casa-, asi que la mutacion
 # se ancla en el getElementById de ESTE espejo, que solo esta en vdTrivSync.
 ('06 el espejo del TRIV deja de copiar el vacio: borrar en uno no borra en el otro',
  "    const src = (origenId === 'vd-triv') ? b : a;\n"
  "    const dst = (origenId === 'vd-triv') ? a : b;\n"
  "    if (dst.value === src.value) return { copio: false, valor: src.value };",
  "    const src = (origenId === 'vd-triv') ? b : a;\n"
  "    const dst = (origenId === 'vd-triv') ? a : b;\n"
  "    if (dst.value === src.value || src.value === '') return { copio: false, valor: src.value };"),
 ('07 el espejo sale del embudo de restauracion',
  "'cvpaSync','dtTapSync','vdTrivSync','etOndaESync'",
  "'cvpaSync','dtTapSync','etOndaESync'"),

 ('08 el espejo pasa a ser un campo GUARDADO, por las dos puertas a la vez',
  [("|otr-asia-|pop-bcia-|vd-triv|ref-|", "|otr-asia-|pop-bcia-|ref-|"),
   ('<input type="number" id="vd-triv" step="1" placeholder="ms" oninput="vdTrivSync(\'vd-triv\');calcDopTric()">',
    '<input type="number" id="vd-triv" step="1" placeholder="ms" oninput="calcDopTric()">')]),

 ('09 el corte de PANTALLA del TRIV se unifica con el del papel',
  'const DT_TRIV_HTP_PANEL = 75, DT_TDE_ACORT = 120;',
  'const DT_TRIV_HTP_PANEL = 60, DT_TDE_ACORT = 120;'),

 # ── commit 3 · el sexo y la raiz ───────────────────────────────────────────────
 ('10 DE MAS: el sexo deja de re-evaluar la aorta',
  "  if (typeof calcAorta   === 'function') { try { calcAorta();   r.aorta = true } catch (e) {} }",
  "  if (false) { }"),

 ('11 el sexo deja de re-evaluar la aurícula y el ventriculo izquierdos',
  "  if (typeof calcAI      === 'function') { try { calcAI();      r.ai    = true } catch (e) {} }\n  if (typeof calcVI      === 'function') { try { calcVI();      r.vi    = true } catch (e) {} }",
  "  r.ai = true; r.vi = true;"),

 ('12 el papel vuelve a llevar la frase de «no se puede clasificar»',
  "    const sinC = aoS.length ? (' ' + aoS.map(x => x.sg.lblC + ' ' + x.val + ' mm').join(', ') + '.') : '';",
  "    const sinC = aoS.length ? (' ' + aoS.map(x => x.sg.lblC + ' ' + x.val + ' mm').join(', ') + ' — no se puede clasificar sin el sexo.') : '';"),

 ('13 la pastilla vuelve a esconder el valor del indice',
  "                                     txt = 'iDA de ' + Math.round(m.ida) + ' mm/m² (dilatada, iDA >'\n                                         + sg.idaMax + ' mm/m²)';",
  "                                     txt = 'Dilatada (iDA >' + sg.idaMax + ' mm/m²)';"),
]

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
    bak = tempfile.mktemp(suffix='.html')
    shutil.copy2(IDX, bak)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            # Una entrada puede traer UN par o una LISTA de pares: ver la nota de la 13.
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
