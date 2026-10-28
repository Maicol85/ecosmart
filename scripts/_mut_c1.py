# -*- coding: utf-8 -*-
"""_mut_c1.py - mutaciones dirigidas de la tanda C1, contra TC-544.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-544 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_c1.py
  python3 scripts/_mut_c1.py --solo M7

Calcado de _mut_d11.py, con sus tres advertencias:
  - NUNCA toca el arbol vivo: arma un worktree, copia ahi el index.html y el
    test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
  - EXIGE «RESULTADO» en la salida antes de puntuar. Sin eso, una suite que no arranca
    deja stdout vacio y TODAS las mutaciones saldrian «sobrevivio».
  - CORRE LA LINEA BASE PRIMERO. Con el caso ya rojo de entrada, todas salen «en rojo».

⚠️ DOS DE LAS DOCE SON DE SOBRE-APLICACION, no de reversion: M3 y M7 no deshacen un arreglo,
   lo aplican DE MAS. Existen porque las dos condiciones que las matan son CONTROLES NEGATIVOS
   -el grado 3 que conserva su frase y el signo automatico que conserva su «ausente»-, y un
   control negativo que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-c1'
CASO = 'TC-544'

MUT = [
 # ══ COMMIT 1 · VExUS ═══════════════════════════════════════════════════════════════════════
 ('M1', 'vuelve el grado 0 que afirma que la presion venosa central es normal',
  "  0: 'Sin congesti\u00f3n venosa.',",
  "  0: 'Sin congesti\u00f3n venosa sist\u00e9mica significativa. Presi\u00f3n venosa central probablemente normal.',"),
 ('M2', 'vuelve el grado 2 con la injuria renal aguda que la Figura 7 no le cuelga',
  "  2: 'Congesti\u00f3n venosa moderada.',",
  "  2: 'Congesti\u00f3n venosa moderada. Riesgo de injuria renal aguda aumentado.',"),
 ('M3', 'SOBRE-APLICACION: el grado 3 pierde tambien su frase de injuria renal, que SI es el '
        'resultado que mide la fuente de la graduacion',
  "  3: 'Congesti\u00f3n venosa severa. Alta asociaci\u00f3n con injuria renal aguda (AKI).'",
  "  3: 'Congesti\u00f3n venosa severa.'"),
 ('M4', 'vuelve la conducta por grado a la Evidencia de VExUS',
  "  const sinConducta = [\n    { txt:'Hasta hoy no hay estudios de intervenci\u00f3n que prueben una conducta guiada por el grado.', refs:['vexusRola2021'] }\n  ];",
  "  const sinConducta = [\n    { txt:'Criterio de EcoSmart \u2014 grado 2: evaluar la necesidad de descongesti\u00f3n.', refs:null }\n  ];"),
 ('M5', 'el globo del modulo pierde las limitaciones de la pagina 9 de Rola 2021',
  "    lee: 'La vena cava puede verse comprimida por la presi\u00f3n intraabdominal, con independencia de la presi\u00f3n de la aur\u00edcula derecha.\\n'",
  "    lee: 'El grado se integra con la cl\u00ednica.\\n'"),
 # ══ COMMIT 2 · HTP y Forrester ═════════════════════════════════════════════════════════════
 ('M6', 'una casilla manual sin marcar vuelve a decir «ausente»',
  "        : (g.estado === 'manual' ? ' \u2014 sin evaluar' : ' \u2014 ausente')));",
  "        : ' \u2014 ausente'));"),
 ('M7', 'SOBRE-APLICACION: tambien el signo AUTOMATICO medido y ausente pasa a decir «sin '
        'evaluar», o sea que la app deja de distinguir lo medido de lo no mirado',
  "      (g.presente ? ' \u2014 presente'\n        : (g.estado === 'sinDatos' ? ''\n        : (g.estado === 'manual' ? ' \u2014 sin evaluar' : ' \u2014 ausente')));",
  "      (g.presente ? ' \u2014 presente'\n        : (g.estado === 'sinDatos' ? '' : ' \u2014 sin evaluar'));"),
 ('M8', 'el Forrester vuelve a pedir los dos datos aunque uno este cargado',
  "  if (hayIc && hayPcp) return null;\n  if (!hayIc && !hayPcp) return 'faltan el \u00edndice card\u00edaco y la presi\u00f3n capilar pulmonar estimada';\n  return hayIc ? 'falta la presi\u00f3n capilar pulmonar estimada' : 'falta el \u00edndice card\u00edaco';",
  "  if (hayIc && hayPcp) return null;\n  return 'Requiere IC + PCP estimada';"),
 # ══ COMMIT 3 · RVS y POCUS ═════════════════════════════════════════════════════════════════
 ('M9', 'la RVS vuelve a leer hemo_pam a secas e ignora la PAM por cateter',
  "  const pam = (_pamRvs && _pamRvs.val !== null) ? _pamRvs.val : v('hemo_pam');",
  "  const pam = v('hemo_pam');"),
 ('M10','la linea de la RVS deja de declarar de donde sale cada insumo',
  "    setH('hemo-rvs', [rvs.toFixed(0), ' dinas\u00b7s\u00b7cm\u207b\u2075 \u00b7 ', _ori, '; PVC estimada por eco'].join(''));",
  "    setH('hemo-rvs', rvs.toFixed(0) + ' dinas\u00b7s\u00b7cm\u207b\u2075');"),
 ('M11','el POCUS vuelve a no mirar el VD/VI de la pestana VD/AD',
  "  if (vdvi === null && _vdviR && _vdviR.fuente === 'numero') vdvi = _vdviR.val;",
  "  void 0;"),
 # ══ COMMIT 4 · el grafico ══════════════════════════════════════════════════════════════════
 ('M12','el borde del indice cardiaco se mueve a «menor o igual»: el 2,2 exacto pasa a ser '
        'hipoperfusion, que es lo que la orden de la tanda suponia y la app NO hace',
  "  const humedo = pcp > UMBRAL_PCP_HUMEDO, frio = ic < FORR_IC_CORTE;\n  return (!frio && !humedo) ? 'I' : (humedo && !frio) ? 'II' : (frio && !humedo) ? 'III' : 'IV';",
  "  const humedo = pcp > UMBRAL_PCP_HUMEDO, frio = ic <= FORR_IC_CORTE;\n  return (!frio && !humedo) ? 'I' : (humedo && !frio) ? 'II' : (frio && !humedo) ? 'III' : 'IV';"),
 ('M13','el corte de congestion del grafico se escribe a mano en 18 en vez de leer la constante: '
        'una PCP de 16 deja de ser congestion y el grafico contradice a la capsula de arriba',
  "function forrCuadrante(ic, pcp) {\n  if (ic === null || pcp === null || !isFinite(ic) || !isFinite(pcp)) return null;\n  const humedo = pcp > UMBRAL_PCP_HUMEDO",
  "function forrCuadrante(ic, pcp) {\n  if (ic === null || pcp === null || !isFinite(ic) || !isFinite(pcp)) return null;\n  const humedo = pcp > 18"),
 ('M14','el grafico deja de seguir al dato: ya no lo pinta la cola de calcHemo, asi que el '
        'barrido de espejos no lo alcanza',
  "  if (typeof hemoForrGrafPintar === 'function') {\n    try { hemoForrGrafPintar(ic, pcp); } catch (e) { console.warn('[forr-graf]', e); }\n  }",
  "  void 0;"),
]


def md5(p):
    with open(p, 'rb') as f: return hashlib.md5(f.read()).hexdigest()

def corre(dirw):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=dirw, capture_output=True, text=True, timeout=900)
    return r.stdout + r.stderr

def veredicto(sal):
    if 'RESULTADO' not in sal: return 'NO CORRIO'
    return 'MUERTA' if re.search(r'✗\s*$', sal, re.M) or ' CON FALLAS' in sal else 'SOBREVIVIO'

def main():
    solo = None
    if '--solo' in sys.argv: solo = sys.argv[sys.argv.index('--solo') + 1]
    md5_ini = md5(os.path.join(RAIZ, 'index.html'))
    print('md5 del index.html VIVO al abrir: %s' % md5_ini)
    if os.path.exists(WT):
        subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ, capture_output=True)
    subprocess.run(['git', 'worktree', 'add', '-q', '--detach', WT, 'HEAD'], cwd=RAIZ, check=True)
    for f in ('index.html', 'scripts/test_clinico.mjs'):
        shutil.copy(os.path.join(RAIZ, f), os.path.join(WT, f))
    orig = io.open(os.path.join(WT, 'index.html'), encoding='utf-8').read()
    print('worktree: %s  (copia del arbol de trabajo, md5 %s)'
          % (WT, md5(os.path.join(WT, 'index.html'))))

    print('\n== LINEA BASE en el worktree ==')
    base = corre(WT)
    if 'RESULTADO' not in base: print('  ABORTA: la suite no arranco en el worktree'); return 2
    if ' CON FALLAS' in base:
        print('  ABORTA: %s ya esta ROJO sin mutar. Mutar sobre un rojo no prueba nada.' % CASO)
        print('\n'.join(l for l in base.split('\n') if 'condicion' in l or 'encontrado' in l)); return 2
    print('  %s VERDE sin mutar.' % CASO)

    res = []
    for cod, desc, viejo, nuevo in MUT:
        if solo and cod != solo: continue
        n = orig.count(viejo)
        if n != 1:
            res.append((cod, 'MAL ESCRITA', desc, 'esperaba 1 ocurrencia, hay %d' % n))
            print('  %-4s MAL ESCRITA (%d ocurrencias)  %s' % (cod, n, desc)); continue
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig.replace(viejo, nuevo))
        sal = corre(WT)
        v = veredicto(sal)
        cond = [l.strip() for l in sal.split('\n') if 'condicion:' in l]
        res.append((cod, v, desc, ' | '.join(c.replace('condicion: ', '') for c in cond)[:150]))
        print('  %-4s %-11s %s' % (cod, v, desc))
        if cond: print('        mata: %s' % ' | '.join(c.replace('condicion: ', '') for c in cond)[:160])
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig)

    md5_fin = md5(os.path.join(RAIZ, 'index.html'))
    print('\nmd5 del index.html VIVO al cerrar: %s' % md5_fin)
    print('GUARDA %s' % ('OK: el arbol vivo no se toco' if md5_ini == md5_fin
                         else 'ROTA: el arbol vivo CAMBIO — la medicion no vale'))
    m = sum(1 for r in res if r[1] == 'MUERTA')
    print('\nRESUMEN: %d/%d muertas' % (m, len(res)))
    for r in res:
        if r[1] != 'MUERTA': print('  ⚠️ %s %s — %s' % (r[0], r[1], r[2]))
    subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ, capture_output=True)
    return 0 if m == len(res) else 1

sys.exit(main())
