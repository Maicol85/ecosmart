#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant6.py — barrido de MUTACIONES DIRIGIDAS de la tanda PANT-6 (2026-11-03).

Cada mutacion revierte UNA de las cosas que los seis commits de codigo cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant6.py              # todas
  python3 scripts/_mut_pant6.py --solo 1,2   # algunas

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: con los cinco, un
   reparto mal hecho queda tapado por el caso de otro commit. Es la leccion de la tanda TGA.
⚠️ VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (caso, nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · la pantalla de CIA y CIV ────────────────────────────────────────
 ('TC-644', '01 el boton vuelve a esconder el panel de la lesion',
  "  if(p1) p1.style.display = '';",
  "  if(p1) p1.style.display = (document.getElementById('ete_cia_activa')||{}).checked ? '' : 'none';"),

 ('TC-644', '02 la fila deja de repartir en dos y vuelve a apilar',
  "  #ete-shunt-fila{grid-template-columns:repeat(2,minmax(0,1fr));}",
  "  #ete-shunt-fila{grid-template-columns:minmax(0,1fr);}"),

 ('TC-644', '03 el cuadro pierde su borde, o sea deja de ser un cuadro',
  ".ete-shunt-cuadro{border:2px solid var(--accent);border-radius:12px;padding:12px;",
  ".ete-shunt-cuadroX{border:2px solid var(--accent);border-radius:12px;padding:12px;"),

 ('TC-644', '04 el boton de la CIA sale de su cuadro',
  """    <div id="ete-shunt-pane-cia" class="ete-shunt-cuadro">
      <div class="subtabs-wrap cc-lesbar ete-shunt-btnbar" style="justify-content:flex-start;">""",
  """      <div class="subtabs-wrap cc-lesbar ete-shunt-btnbar" style="justify-content:flex-start;">"""),

 # ⚠️ ESTA MUTACION ESTUVO MAL ESCRITA EN EL PRIMER BARRIDO Y SOBREVIVIO SIN INYECTAR NADA:
 # abria un SEGUNDO <div id="ete-shunt-fila"> antes del cuadro comun, y `getElementById` devuelve
 # el PRIMERO -el de verdad-, que sigue sin contenerlo. Hoy mueve el CIERRE de la fila para que el
 # cuadro comun quede de verdad adentro, que es el defecto que (E1) viene a cazar.
 ('TC-644', '05 el cuadro comun del shunt vuelve DENTRO de la fila',
  [("""    </div><!-- /ete-shunt-fila -->""", """"""),
   ("""      <div style="font-size:10.5px;color:var(--text2);margin-top:8px;">
        Los cuatro valores del Qp/Qs se cargan en sus tabs:""",
    """      </div><div style="font-size:10.5px;color:var(--text2);margin-top:8px;">
        Los cuatro valores del Qp/Qs se cargan en sus tabs:""")]),

 ('TC-644', '06 DE MAS: la PSAP por IT vuelve a repetirse en la CIA',
  """    <div id="ete-shunt-comun" class="ete-shunt-cuadro ete-shunt-cuadro-fino">""",
  """    <div id="ete-cia-paps-it"></div>
    <div id="ete-shunt-comun" class="ete-shunt-cuadro ete-shunt-cuadro-fino">"""),

 # ── commit 2 · el dibujo de sobrecarga del VD ──────────────────────────────────
 ('TC-645', '07 el dibujo vuelve a su ancho de 110 px',
  "#vdsc-svg{display:block;width:100%;max-width:520px;height:auto;margin:0 auto;}",
  "#vdsc-svg{display:block;width:50%;max-width:110px;height:auto;margin:0 auto;}"),

 ('TC-645', '08 el tope de 520 px baja por debajo del minimo medido para 12 px',
  "max-width:520px;height:auto;margin:0 auto;}",
  "max-width:300px;height:auto;margin:0 auto;}"),

 ('TC-645', '09 la fila deja de ser grilla y el dibujo vuelve a apilarse',
  "  #vdsc-fila{display:grid;grid-template-columns:minmax(0,55fr) minmax(0,45fr);",
  "  #vdsc-fila{display:block;grid-template-columns:minmax(0,55fr) minmax(0,45fr);"),

 ('TC-645', '10 el reparto deja de ser 55/45',
  "grid-template-columns:minmax(0,55fr) minmax(0,45fr);",
  "grid-template-columns:minmax(0,1fr) minmax(0,1fr);"),

 ('TC-645', '11 la lista de criterios sale de la columna izquierda',
  "  #vdsc-lista{grid-column:1;grid-row:2;}",
  "  #vdsc-lista{grid-column:2;grid-row:3;}"),

 # ── commit 3 · el molde de la estenosis mitral ─────────────────────────────────
 ('TC-646', '12 el molde no se despacha y la seccion vuelve al cuerpo viejo',
  "  if (r.molde) {\n    h += _indMoldeHTMLSec(r, compacta);",
  "  if (false) {\n    h += _indMoldeHTMLSec(r, compacta);"),

 ('TC-646', '13 la franja de categoria deja de emitirse',
  "    if (m.cat) h += '<div class=\"ind-franja-cat\">' +",
  "    if (false) h += '<div class=\"ind-franja-cat\">' +"),

 ('TC-646', '14 la franja del estadio deja de emitirse',
  "    if (m.est) h += '<div class=\"ind-franja-est\">' +",
  "    if (false) h += '<div class=\"ind-franja-est\">' +"),

 ('TC-646', '15 LA PREGUNTA DE SINTOMAS VUELVE A DESAPARECER CON LA ETIOLOGIA CALCIFICADA',
  "      : [ [ { tit:'Clínica', filas:fSx } ], [] ],",
  "      : [ [], [] ],"),

 ('TC-646', '16 el globo de sintomas de la estenosis mitral se queda sin su fuente',
  "{ term: 'emsintomas' })];",
  "{ term: null })];"),

 # ── commit 4 · la seccion unica de la mitral ───────────────────────────────────
 ('TC-647', '17 el alias de mediciones-mitral desaparece y las llamadas viejas son un no-op',
  "const ETE_SEC_ALIAS = { 'mediciones-mitral': 'morfo' };",
  "const ETE_SEC_ALIAS = {};"),

 ('TC-647', '18 la seccion unica deja de repartir en TRES columnas',
  "  #etem-cols{grid-template-columns:repeat(3,minmax(0,1fr));}",
  "  #etem-cols{grid-template-columns:repeat(2,minmax(0,1fr));}"),

 # ── commit 5 · los criterios TEER ──────────────────────────────────────────────
 ('TC-648', '19 el bloque de la IM primaria vuelve a esconderse por el tipo',
  "  /* _mostrar('teer-bloque-primaria',   !r.esSec);   <- retirado en PANT-6, commit 5 */",
  "  _mostrar('teer-bloque-primaria',   !r.esSec);"),

 ('TC-648', '20 el de la secundaria tambien',
  "  /* _mostrar('teer-bloque-secundaria', !r.esPrim);  <- retirado en PANT-6, commit 5 */",
  "  _mostrar('teer-bloque-secundaria', !r.esPrim);"),

 ('TC-648', '21 las dos filas del TEER dejan de repartir en dos columnas',
  "  #teer-medio,#teer-abajo{grid-template-columns:repeat(2,minmax(0,1fr));}",
  "  #teer-medio,#teer-abajo{grid-template-columns:minmax(0,1fr);}"),

 # ── commit 6 · el Forrester y los dos rotulos ──────────────────────────────────
 ('TC-648', '22 la frase de dato faltante del Forrester vuelve al texto del modulo',
  "  const f = ((typeof forrEsFalta === 'function') && forrEsFalta(_f0)) ? '' : _f0;",
  "  const f = _f0;"),

 ('TC-648', '23 DE MAS: el predicado tambien se come un perfil de verdad',
  "  return [forrFaltaTxt(false, false), forrFaltaTxt(true, false), forrFaltaTxt(false, true)]\n    .filter(Boolean).some(function(f){ return t === f; });",
  "  return true;"),

 ('TC-648', '24 los dos rotulos de la profundidad de coaptacion vuelven a llamarse igual',
  "<label>Profundidad coaptación — reparación (mm)</label>",
  "<label>Profundidad de coaptación (mm)</label>"),

 ('TC-648', '25 y el del TEER tambien',
  "<label>Profundidad coaptación — TEER (mm)</label>",
  "<label>Profundidad de coaptación (mm)</label>"),

 # ⚠️ ESTA MUTACION ESTUVO MAL ESCRITA Y SOBREVIVIO: envolvia `window.etemVeloGesto`, y el caso
 # llama a `etemVeloGesto(...)` -el binding LOCAL de la pagina-, que el alias de window no toca.
 # Hoy agrega el par a la lista que la propia funcion recorre, que es donde vive el espejo.
 ('TC-648', '26 DE MAS: los dos campos se espejan, y eso cambiaria el criterio c4 del TEER',
  "var _ETEM_VELOS = [['ete_lva', 'teer_lva'], ['ete_lvp', 'teer_lvp']];",
  "var _ETEM_VELOS = [['ete_lva', 'teer_lva'], ['ete_lvp', 'teer_lvp'], ['ete_prof_coapt', 'teer_prof_flail']];"),

 # ── commit 7 · el molde en las otras cinco valvulas ────────────────────────────
 ('TC-649', '27 el globo de sintomas de la insuficiencia aortica pierde su fuente',
  "term: 'iasintomas'",
  "term: null, _t: 'iasintomas'"),

 ('TC-649', '28 el de la estenosis aortica',
  "term: 'easintomas'",
  "term: null, _t: 'easintomas'"),

 ('TC-649', '29 el de la insuficiencia mitral primaria',
  "term: 'impsintomas'",
  "term: null, _t: 'impsintomas'"),

 ('TC-649', '30 el de la secundaria',
  "term: 'imssintomas'",
  "term: null, _t: 'imssintomas'"),

 ('TC-649', '31 y el de la tricuspide',
  "term: 'itsintomas'",
  "term: null, _t: 'itsintomas'"),

 # ⚠️ ESTA MUTACION ESTUVO MAL ESCRITA Y SOBREVIVIO: declaraba una variable que nadie lee, o sea
 # no inyectaba nada. Hoy le pone `molde` DE VERDAD al objeto que la seccion devuelve, que es lo
 # que (F1) de TC-649 vigila -y es la parada que P6-a declara-.
 ('TC-649', '32 DE MAS: el molde le entra tambien a la valvula pulmonar, que esta tanda PARO',
  """  return { filas: filas,
    clinica: clinica,
    recom: _indEPRecom(D, sev, mod, gmax, UM, valvular, nivelDicho, /^ramas/i.test(nivel)),""",
  """  return { filas: filas,
    molde: { cat:{ txt:'x' }, est:'x', datos:[], cols:[[],[]], pie:null },
    clinica: clinica,
    recom: _indEPRecom(D, sev, mod, gmax, UM, valvular, nivelDicho, /^ramas/i.test(nivel)),"""),
]

def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-300:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%d condicion(es) en rojo%s' % (nC, ' + EXCEPCION' if nE else '')
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:160]

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    print('  md5 de partida: %s  (%d mutaciones)' % (m0[:8], len(MUT)), flush=True)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            caso, nom = ent[0], ent[1]
            pares = ent[2] if (len(ent) == 3 and isinstance(ent[2], list)) else [(ent[2], ent[3])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, caso, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s %s (apariciones %s)' % (i, caso, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)[:200]
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, caso, nom, v, det))
            print('  %02d  %-11s %s  %s  —  %s' % (i, v, caso, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[3] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, caso, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s %s · %s' % (i, v, caso, nom, det))
    print('  md5 al cerrar: %s  (identico: %s)' % (md5(IDX)[:8], md5(IDX) == m0))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
