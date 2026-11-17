#!/usr/bin/env python3
# Barrido de mutaciones dirigidas de la tanda PARTE-2 — los cambios con CONTENIDO CLINICO:
# 2.1 (coartacion), 2.2 (rotulos de criterio propio), 2.4 (HFA-PEFF), 2.5 (amiloidosis),
# 2.6 (bioprotesis) y 2.7 (Simpson).
#
#   python3 scripts/_mut_p2.py --anclas     # SOLO verifica que cada ancla aparezca UNA vez
#   python3 scripts/_mut_p2.py              # corre el barrido
#
# ** NUNCA SOBRE EL ARBOL VIVO. Trabaja en un worktree aparte y comprueba el md5 del vivo antes
#    y despues: es la regla de esta casa, y PANT-20 pago una corrida entera por no verificar las
#    anclas primero -- las treinta y cinco daban x0 porque el worktree habia quedado en HEAD-.
#
# ** EL SCORER EXIGE LA LINEA «RESULTADO» ANTES DE PUNTUAR. Si el suite no arranca, stdout queda
#    vacio, no hay ningun marcador de fallo y TODAS las mutaciones saldrian «sobrevivio» --
#    indistinguible de «no hay cobertura»-. Sin esa linea el veredicto es NO CORRIO.
#    (Los comentarios van con # porque esto es Python: /* */ no es un comentario aca, que es lo
#    que PANT-20 pago con una corrida perdida.)

import hashlib, os, re, shutil, subprocess, sys, time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WT   = os.path.join(os.path.dirname(RAIZ), '_wt_mut_p2')
VIVO = os.path.join(RAIZ, 'index.html')

# (id, caso que la tiene que matar, ancla, reemplazo, que rompe)
MUT = [
 # ── 2.1 · la coartacion ────────────────────────────────────────────────────────────────────
 ('01', 'TC-912', "if ((gm!=null && gm >= 20) || cola) return { clave:'significativa',",
                  "if ((gm!=null && gm > 20) || cola) return { clave:'significativa',",
                  'devuelve el > estricto a la rama de significativa: el 20,0 vuelve a limitrofe'),
 ('02', 'TC-912', "(gm!=null && gm >= 20 ? ' (gradiente medio ' + gm + ' mmHg, de 20 mmHg o más)' : '') +",
                  "(gm!=null && gm >= 20 ? ' (gradiente medio ' + gm + ' mmHg, por encima de los 20 mmHg)' : '') +",
                  'la rama opera en >= pero el TEXTO sigue diciendo «por encima de»'),
 # ⚠️ LA 03 ORIGINAL ERA EQUIVALENTE, Y ESTA MEDIDO. Cambiaba `g >= 20` por `g > 20`, y en esa
 # rama el maximo se DERIVA de la Vmax como 4*v*v: v*v === 5 no existe en doble precision -- la
 # escritura mas cercana de la raiz de 5 da 20.000000000000004-, asi que el >= y el > se portan
 # igual para TODA entrada alcanzable. Una mutacion que no puede cambiar la conducta no prueba
 # nada, asi que se REAPUNTA al umbral, que si es alcanzable, en vez de aflojar el caso.
 # (El borde de 20 EXACTO si se prueba, pero en el lector de la Evidencia: ahi el pico-pico es
 #  un campo que el medico tipea, asi que el 20 entra tal cual. Son las mutaciones 04 y 05.)
 ('03', 'TC-912', "  if (g != null && g >= 20 && gm == null) return { clave:'limitrofe', via:'sin_gmedio',",
                  "  if (g != null && g >= 30 && gm == null) return { clave:'limitrofe', via:'sin_gmedio',",
                  'sube el umbral del maximo sin medio registrado de 20 a 30'),
 ('04', 'TC-912', "    'coa.ev.picopico20': _coaNum('coa_gradiente_picopico', 'ge', 20),",
                  "    'coa.ev.picopico20': _coaNum('coa_gradiente_picopico', 'gt', 20),",
                  'la Evidencia vuelve a discrepar del papel sobre el MISMO campo'),
 ('05', 'TC-912', "    const _ok = (op === 'gt') ? (v > umbral) : (op === 'ge') ? (v >= umbral) : (v < umbral);",
                  "    const _ok = (op === 'gt') ? (v > umbral) : (v < umbral);",
                  "saca el operador 'ge': 'ge' cae en v < umbral, o sea al REVES y en silencio"),
 ('06', 'TC-912', "lbl:'Gradiente invasivo pico-pico de 20 mmHg o más', guia:'ao',",
                  "lbl:'Gradiente invasivo pico-pico mayor de 20 mmHg', guia:'ao',",
                  'la etiqueta vuelve a contradecir a su propia cita'),
 ('07', 'TC-912', "  bl('Criterio de EcoSmart',",
                  "  bl('Nota',",
                  'el globo deja de rotular el criterio propio'),
 ('08', 'TC-912', "   + 'medidas de 20 mmHg de esta pantalla en que el criterio es propio: el pico-pico invasivo y '",
                  "   + 'medidas de 20 mmHg de esta pantalla. El pico-pico invasivo y '",
                  'el rotulo deja de decir que las otras dos SI son de la fuente'),
 # ⚠️ ESTE ANCLA VA CON LAS SECUENCIAS DE ESCAPE LITERALES, no con el caracter: ese bloque del
 # globo trae los acentos como ó escritos en el archivo, asi que el ancla con la tilde de
 # verdad daba x0. Es la misma trampa que MEDIR-6 declaro con el ≥ y que esta tanda ya pago
 # una vez en la tarjeta ea-prot-sev. Verificada con --anclas antes de correr el barrido.
 ('09', 'TC-912', "   + 'adulto en el folio 604 de su edici\\u00f3n inglesa, que es tambi\\u00e9n de donde salen la salvedad de '",
                  "   + 'adulto, que es tambi\\u00e9n de donde salen la salvedad de '",
                  'el pico-pico pierde el folio de su atribucion'),
 # ── 2.2 · los rotulos de criterio propio ───────────────────────────────────────────────────
 ('10', 'TC-913', "letter-spacing:.3px;\">CRITERIO DE ECOSMART</span>Bandas ALTAS de la RVS del posoperatorio",
                  "letter-spacing:.3px;\">SIN FUENTE</span>Bandas ALTAS de la RVS del posoperatorio",
                  'la fila de la RVS pierde el rotulo con el nombre que la casa usa'),
 ('11', 'TC-913', "elevada &gt;1400 dinas&middot;s&middot;cm&#8315;&#8309;",
                  "elevada alta dinas&middot;s&middot;cm&#8315;&#8309;",
                  'la fila deja de declarar el corte de 1400'),
 ('12', 'TC-913', "El corte de <b>800</b> es distinto y <b>no</b> lleva este r&oacute;tulo",
                  "El corte de <b>800</b> tampoco tiene fuente",
                  'la fila deja de decir que el 800 SI tiene fuente -- afirma lo contrario'),
 ('13', 'TC-913', "        El reparto de fest&oacute;n por &aacute;ngulo de esta tabla es una referencia propia de la",
                  "        El reparto de fest&oacute;n por &aacute;ngulo de esta tabla sale de la",
                  'la nota de los festones deja de declararlo como criterio propio'),
 ('14', 'TC-913', "      <div style=\"font-size:10px;color:var(--text2);line-height:1.55;text-align:center;margin-bottom:6px;\">\n        <span style=\"display:inline-block;border:1px solid var(--border);border-radius:4px;\n                     padding:1px 5px;margin-right:4px;font-size:9px;letter-spacing:.3px;\">CRITERIO DE ECOSMART</span>\n        El reparto de fest",
                  "      <div style=\"font-size:10px;color:var(--text2);line-height:1.55;text-align:center;margin-bottom:6px;display:none;\">\n        <span style=\"display:inline-block;border:1px solid var(--border);border-radius:4px;\n                     padding:1px 5px;margin-right:4px;font-size:9px;letter-spacing:.3px;\">CRITERIO DE ECOSMART</span>\n        El reparto de fest",
                  'la nota de los festones existe pero queda OCULTA -- vuelve a ser invisible'),
 # ── 2.4 · el HFA-PEFF ──────────────────────────────────────────────────────────────────────
 ('15', 'TC-915', "    const _domTot = r.soloEco ? 2 : 3;",
                  "    const _domTot = 3;",
                  'escribe el 3 a mano: el modo solo-eco diria «de 3» y seria falso'),
 ('16', 'TC-915', "    const _domCon = _domTot - faltan.length;",
                  "    const _domCon = _domTot;",
                  'la N deja de seguir a los dominios que de verdad tienen dato'),
 ('17', 'TC-915', "    return p + ' (puntaje parcial: ' + nom + _conN + '). Probabilidad ' + hoy + prov + '.' + avisoFevi;",
                  "    return p + ' (puntaje parcial: ' + nom + '). Probabilidad ' + hoy + prov + '.' + avisoFevi + _conN;",
                  'la frase sale FUERA del parentesis del puntaje parcial'),
 # ── 2.5 · la amiloidosis ───────────────────────────────────────────────────────────────────
 ('18', 'TC-916', "      titulo = 'ATTR confirmado — Grado ' + gradoGamma + ' (especificidad cercana al 100 %)' + ettInfo;",
                  "      titulo = 'ATTR confirmado — Grado ' + gradoGamma + ' (VPP 100%)' + ettInfo;",
                  'el TITULO vuelve a afirmar el valor predictivo del 100 % en el papel'),
 ('19', 'TC-916', "A la captación grado 2 o 3, en un paciente en quien la enfermedad se sospecha, se le ha propuesto una especificidad cercana al 100 % para ATTR cardíaca",
                  "Este patrón tiene un valor predictivo positivo del 100% para ATTR",
                  'el CUERPO vuelve al VPP y pierde las dos mitades de la condicion'),
 ('20', 'TC-916', "en un paciente en quien la enfermedad se sospecha, se le ha propuesto",
                  "se le ha propuesto",
                  'se pierde la condicion de que la enfermedad se sospeche'),
 ('21', 'TC-916', "A la captación grado 2 o 3, en un paciente",
                  "A la captación, en un paciente",
                  'se pierde la condicion del grado 2 o 3'),
 # ── 2.6 · la bioprotesis ───────────────────────────────────────────────────────────────────
 ('22', 'TC-917', "tampoco cuenta. Esta aplicación evalúa obstrucción; no evalúa deterioro estructural de la bioprótesis.'",
                  "tampoco cuenta.'",
                  'el globo de la MITRAL deja de declarar el limite'),
 ('23', 'TC-917', "un eje que depende del flujo y uno que no. Esta aplicación evalúa obstrucción; no evalúa deterioro estructural de la bioprótesis.'",
                  "un eje que depende del flujo y uno que no.'",
                  'el globo de la AORTICA deja de declarar el limite'),
 # ── 2.7 · el Simpson ───────────────────────────────────────────────────────────────────────
 ('24', 'TC-918', "separado (Lang 2015).',",
                  "separado (ASE/EACVI 2015).',",
                  'vuelve la forma sociedad-año en la nota del eje largo'),
 ('25', 'TC-918', "volúmenes; Lang 2015 lo lista como su limitación principal.',",
                  "volúmenes; la guía lo lista como su limitación principal.',",
                  'vuelve «la guia» a secas en la nota del apex'),
 ('26', 'TC-918', "corte transversal. Lang 2015 recomienda el biplano",
                  "corte transversal. La guía recomienda el biplano",
                  'vuelve «La guia» a secas en la nota del monoplanar'),
]

def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()

def anclas():
    src = open(VIVO, encoding='utf-8').read()
    mal = 0
    for mid, caso, anc, _rep, que in MUT:
        n = src.count(anc)
        if n != 1:
            mal += 1
            print('  x%d  %s  %s  -- %s' % (n, mid, caso, que))
            print('        ancla: %s' % anc[:110].replace('\n', '\\n'))
        else:
            print('  ok  %s  %s  -- %s' % (mid, caso, que))
    print('')
    print('ANCLAS: %d de %d aparecen exactamente una vez' % (len(MUT) - mal, len(MUT)))
    return mal == 0

def barrido():
    m0 = md5(VIVO)
    print('md5 del arbol VIVO antes: %s' % m0[:8])
    if os.path.exists(WT):
        subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ,
                       capture_output=True)
    r = subprocess.run(['git', 'worktree', 'add', '-q', '--detach', WT, 'HEAD'],
                       cwd=RAIZ, capture_output=True, text=True)
    if r.returncode:
        print('no se pudo crear el worktree: %s' % (r.stderr or r.stdout)); return 2
    shutil.copy(os.path.join(RAIZ, 'scripts', 'test_clinico.mjs'),
                os.path.join(WT, 'scripts', 'test_clinico.mjs'))
    orig = open(os.path.join(WT, 'index.html'), encoding='utf-8').read()

    muertas, vivas, nocorrio = [], [], []
    t0 = time.time()
    for mid, caso, anc, rep, que in MUT:
        if orig.count(anc) != 1:
            nocorrio.append((mid, caso, 'ancla x%d' % orig.count(anc), que)); continue
        open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig.replace(anc, rep))
        p = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=WT, capture_output=True, text=True, timeout=900)
        out = (p.stdout or '') + (p.stderr or '')
        if 'RESULTADO' not in out:
            nocorrio.append((mid, caso, 'el suite no imprimio RESULTADO', que))
        elif re.search(r'RESULTADO: 0/1', out) or 'CON FALLAS' in out:
            muertas.append((mid, caso, que))
        else:
            vivas.append((mid, caso, que))
        print('  %s  %s  %s' % (mid, caso,
              'MUERTA' if (mid, caso, que) in muertas else
              ('SOBREVIVIO' if (mid, caso, que) in vivas else 'NO CORRIO')))
    open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig)
    subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ, capture_output=True)

    m1 = md5(VIVO)
    print('')
    print('== RESUMEN ==')
    print('  muertas:     %d de %d' % (len(muertas), len(MUT)))
    print('  SOBREVIVIO:  %d' % len(vivas))
    for mid, caso, que in vivas:
        print('     %s  %s  -- %s' % (mid, caso, que))
    print('  NO CORRIO:   %d' % len(nocorrio))
    for t in nocorrio:
        print('     %s' % (t,))
    print('  minutos: %.1f' % ((time.time() - t0) / 60))
    print('  md5 del arbol VIVO despues: %s (identico: %s)' % (m1[:8], 'SI' if m0 == m1 else 'NO'))
    return 0 if (not vivas and not nocorrio and m0 == m1) else 1

if __name__ == '__main__':
    sys.exit(0 if (anclas() if '--anclas' in sys.argv else False) else (
        barrido() if '--anclas' not in sys.argv else 1))
