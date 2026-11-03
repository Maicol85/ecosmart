#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant5.py — barrido de MUTACIONES DIRIGIDAS de la tanda PANT-5 (2026-11-03).

Cada mutacion revierte UNA de las cosas que los nueve commits cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant5.py              # todas
  python3 scripts/_mut_pant5.py --solo 1,2   # algunas

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ CADA MUTACION DECLARA SU CASO, y no se corren los cinco por cada una: con los cinco, un
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
# O (caso, nombre, [(v1,n1), (v2,n2), ...]) para romper DOS puertas a la vez.
MUT = [
 # ── commit 1 · el dibujo de sobrecarga del VD ──────────────────────────────────
 ('TC-639', '01 el dibujo deja de ser mudo sin datos',
  "  gNames.setAttribute('opacity',S.hay?'1':'0');\n  gLabels.setAttribute('opacity',S.hay?'1':'0');",
  "  gNames.setAttribute('opacity','1');\n  gLabels.setAttribute('opacity','1');"),

 ('TC-639', '02 el dibujo ESCRIBE en el estudio (lo que la regla prohibe)',
  "  S.mcc=L.mcc; S.tab=L.tab; S.itg=L.itg;",
  "  S.mcc=L.mcc; S.tab=L.tab; S.itg=L.itg;\n  try{document.getElementById('tapse').value=String(S.tp);}catch(e){}"),

 ('TC-639', '03 la raya de 17 mm vuelve a llevar su numero',
  "    tpT.textContent=S.tp+' mm';tpT.setAttribute('opacity','1');",
  "    tpT.textContent=S.tp+' mm 17';tpT.setAttribute('opacity','1');"),

 ('TC-639', '04 el chorro de la IT pierde su unico color y sale rojo',
  "#vdsc-svg .vdsc-jet-it{fill:var(--vdsc-cel);}",
  "#vdsc-svg .vdsc-jet-it{fill:#d8433b;}"),

 ('TC-639', '05 el rotulo del septum se queda sin su texto',
  "    spT.innerHTML=tspans(qm[0]+4,ROT.sp);",
  "    spT.innerHTML=tspans(qm[0]+4,['']);"),

 ('TC-639', '06 DE MAS: la velocidad maxima se escribe aunque no haya insuficiencia',
  "  S.vmx=(L.vm!==null&&L.itg>0); S.vmv=L.vm;",
  "  S.vmx=(L.vm!==null); S.vmv=L.vm;"),

 # ── commit 2 · el Forrester ────────────────────────────────────────────────────
 ('TC-640', '07 el mensaje vuelve a escribirse ENCIMA del grafico',
  "  caja.innerHTML = _labForrSVG(pts, pal, { sinVacio: true })",
  "  caja.innerHTML = _labForrSVG(pts, pal, { vacioTxt: falta })"),

 ('TC-640', '08 DE MAS: la opcion apaga el texto tambien en el LABORATORIO',
  "  if (!(puntos || []).length && !o.sinVacio)",
  "  if (false)"),

 ('TC-640', '09 el grafico vuelve a quedar debajo de los datos y no al lado',
  "@media (min-width:900px){\n  #hemo-forr-fila{display:flex;gap:12px;align-items:flex-start;}",
  "@media (min-width:900px){\n  #hemo-forr-fila{display:block;}"),

 # ── commit 3 · la conclusion de las dos estenosis ──────────────────────────────
 ('TC-640', '10 la conclusion de la subaortica vuelve a publicar el criterio de la guia',
  "     criterio con su hoja y su folio sigue en esub-grad.",
  "     criterio con su hoja y su folio sigue en esub-grad. */\n  if (severa) alertas.push({ txt:'Gradiente medio de ' + medio + ' mmHg \u2014 por el criterio de la ESC 2020 (medio \u2265' + ESUB_MEDIO_SEVERO + ' mmHg a flujo normal).' });\n  /* x"),
 ('TC-640', '11 la interpretacion vuelve a pegarse al hallazgo',
  "    txt:'Insuficiencia aórtica ' + ESUB_IA_TXT[ia] + ' asociada.' });",
  "    txt:'Insuficiencia aórtica ' + ESUB_IA_TXT[ia] + ' asociada — marcador de severidad.' });"),

 ('TC-640', '12 el globo pierde el corte que la pantalla ya no dice',
  "    lee: 'EN ESTA SECCIÓN GRADÚA EL GRADIENTE MEDIO, con 40 mmHg a flujo normal. El gradiente '",
  "    lee: 'EN ESTA SECCIÓN GRADÚA EL GRADIENTE MEDIO. El gradiente '"),

 ('TC-640', '13 vuelve la atribucion a la edicion 2020 que no se puede verificar',
  "       '<b>La respuesta tensional anormal al ejercicio no está en ninguno de los dos.</b> La app la registra ' +",
  "       '<b>La respuesta tensional anormal al ejercicio no está en ninguno de los dos.</b> La AHA/ACC la retiró explícitamente de la evaluación de rutina en 2020. La app la registra ' +"),

 # ── commit 4 · el derrame en cuatro columnas ───────────────────────────────────
 ('TC-641', '14 el derrame vuelve a UNA columna',
  "@media (min-width:1100px){\n  #dpt-cols{grid-template-columns:repeat(4,minmax(0,1fr));}\n}",
  "@media (min-width:1100px){\n  #dpt-cols{grid-template-columns:minmax(0,1fr);}\n}"),

 ('TC-641', '15 el tamanio del derrame sale de la TERCERA columna y se va a la primera',
  '              <span class="calc-lbl">Tama\u00f1o \u2014 del campo \u00abPericardio\u00bb (tab \U0001f5c2\ufe0f Otros)</span>\n              <span id="dpt-tam-eco" style="font-weight:700;">\u2014</span>',
  '              <span class="calc-lbl">Tama\u00f1o</span>'),
 ('TC-641', '16 el corte del derrame deja de ir sobre la ventana',
  "#dpt-cols{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;align-items:start;\n  margin-bottom:10px;}",
  "#dpt-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;align-items:start;\n  margin-bottom:10px;}"),

 # ── commit 7 · Fallot en tres columnas ─────────────────────────────────────────
 ('TC-641', '17 Fallot vuelve a una sola columna',
  "  @media (min-width: 700px) {\n    #tdf-cols { grid-template-columns:repeat(3, minmax(0,1fr)); }\n  }",
  "  @media (min-width: 700px) {\n    #tdf-cols { grid-template-columns:minmax(0,1fr); }\n  }"),

 ('TC-641', '18 la conclusion de Fallot vuelve al corte de 900 px',
  "  @media (min-width: 1200px) {\n    #tdf-fila { grid-template-columns:minmax(0,1fr) 320px; }\n  }",
  "  @media (min-width: 999px) {\n    #tdf-fila { grid-template-columns:minmax(0,1fr) 320px; }\n  }"),

 ('TC-641', '19 el subtitulo de volumenes se queda fuera de su columna',
  "          <span>Volúmenes del ventrículo derecho — criterio volumétrico ESC 2020</span>",
  "          <span>Criterio volumétrico ESC 2020</span>"),

 # ── commit 8 · constriccion ────────────────────────────────────────────────────
 ('TC-641', '20 los cuatro campos vuelven a apilarse',
  "@media (min-width:700px){\n  #cvr-campos-grid{grid-template-columns:repeat(2,minmax(0,1fr));}\n}",
  "@media (min-width:700px){\n  #cvr-campos-grid{grid-template-columns:minmax(0,1fr);}\n}"),

 # ── commit 5 · CIA y CIV ───────────────────────────────────────────────────────
 ('TC-642', '21 con las dos marcadas vuelve a verse UNA sola, por las DOS puertas',
  [("  const vC = onC || _eteShuntPane === 'cia';\n  const vV = onV || _eteShuntPane === 'civ';",
    "  const vC = _eteShuntPane === 'cia';\n  const vV = _eteShuntPane === 'civ';"),
   ("  if (typeof eteShuntPanes === 'function') { try{ eteShuntPanes(); }catch(e){} }", "  ;")]),

 ('TC-642', '22 DE MAS: los dos paneles se ven SIEMPRE, marcados o no',
  "  const vC = onC || _eteShuntPane === 'cia';\n  const vV = onV || _eteShuntPane === 'civ';",
  "  const vC = true;\n  const vV = true;"),

 # ── commit 6 · la sincronia de los velos ───────────────────────────────────────
 ('TC-642', '23 el espejo de los velos deja de copiar',
  "    b.value = a.value;\n    /* El otro lado repinta su propia capsula con su propio calculo. */",
  "    if (false) b.value = a.value;\n    /* El otro lado repinta su propia capsula con su propio calculo. */"),

 ('TC-642', '24 el espejo deja de propagar el VACIO, que es la mitad de «gana la ultima edicion»',
  "    if (b.value === a.value) return;",
  "    if (b.value === a.value || a.value === '') return;"),

 ('TC-642', '25 DE MAS: el espejo alcanza tambien a la profundidad de coaptacion',
  "var _ETEM_VELOS = [['ete_lva', 'teer_lva'], ['ete_lvp', 'teer_lvp']];",
  "var _ETEM_VELOS = [['ete_lva', 'teer_lva'], ['ete_lvp', 'teer_lvp'], ['ete_prof_coapt', 'teer_prof_flail']];"),

 # ── commit 9 · los estadios ────────────────────────────────────────────────────
 ('TC-643', '26 el estadio de la estenosis mitral se infiere sin la pregunta',
  "    return { txt:'C o D, según síntomas', marca:'ask',\n      nota:'estenosis mitral severa. Lo que separa C de D son los síntomas",
  "    return { txt:'C', marca:'ask',\n      nota:'estenosis mitral severa. Lo que separa C de D son los síntomas"),

 ('TC-643', '27 el borde de C1/C2 de la insuficiencia mitral primaria se corre',
  "    const c2 = (fevi != null && !_gt(fevi, 60)) || (dsf != null && _ge(dsf, 40));",
  "    const c2 = (fevi != null && _lt(fevi, 60)) || (dsf != null && _gt(dsf, 40));"),

 ('TC-643', '28 DE MAS: la secundaria pasa a D con sintomas, como si fuera la primaria',
  "    if (sx === 'si') return { txt:'C o D, según la respuesta al tratamiento', marca:'ask',\n      nota:'insuficiencia mitral secundaria severa con síntomas.",
  "    if (sx === 'si') return { txt:'D', marca:'alarm',\n      nota:'insuficiencia mitral secundaria severa con síntomas."),

 ('TC-643', '29 la nota de la tricuspidea deja de declarar que no hay estadio A',
  "volumen regurgitante por debajo de 45 ml, sin consecuencias hemodinámicas ni síntomas. Esta tabla NO tiene estadio A' + F",
  "volumen regurgitante por debajo de 45 ml, sin consecuencias hemodinámicas ni síntomas.' + F"),

  # ⚠️ LA MUTACION «el estadio llega al papel» NO SE PUEDE ESCRIBIR, Y P4-i YA LO DECLARA: el
 # emisor regenera el textarea entero en cada llamada, asi que escribir en el despues de pintar
 # la fila no es efectivo, y `_indEstFila` solo corre cuando el panel de Evidencia se pinta. Lo
 # que sostiene ese control negativo -(G1), (G2) y (G3) de TC-643- es el A/B, que da cero
 # diferencias de superficie firmada en las cuatro escenas con el control positivo al lado.
 ('TC-643', '31 la fuente pierde su folio en una de las cuatro tablas',
  "  const F = ' (Tabla 20, hoja 61, folio e132)';",
  "  const F = ' (Tabla 20, hoja 61)';"),
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
