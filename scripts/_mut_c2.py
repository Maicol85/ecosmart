# -*- coding: utf-8 -*-
"""_mut_c2.py - mutaciones dirigidas de la tanda C2, contra TC-545.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-545 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_c2.py
  python3 scripts/_mut_c2.py --solo M7

Calcado de _mut_c1.py, con sus tres advertencias:
  - NUNCA toca el arbol vivo: arma un worktree, copia ahi el index.html y el
    test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
  - EXIGE «RESULTADO» en la salida antes de puntuar. Sin eso, una suite que no arranca
    deja stdout vacio y TODAS las mutaciones saldrian «sobrevivio».
  - CORRE LA LINEA BASE PRIMERO. Con el caso ya rojo de entrada, todas salen «en rojo».

⚠️ DOS DE LAS DIECISEIS SON DE SOBRE-APLICACION, no de reversion: M4 saca el patron global
   tambien de la PANTALLA y M12 mueve tambien el corte de la clasificacion pre/poscapilar.
   Existen porque las dos condiciones que las matan son CONTROLES NEGATIVOS, y un control
   negativo que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-c2'
CASO = 'TC-545'

MUT = [
 # ══ COMMIT 1 · ECO PULMONAR ════════════════════════════════════════════════════════════════
 ('M1', 'vuelve el rotulo que nombra al autor en vez de decir que se mide',
  'Distancia m&aacute;xima entre pleuras (mm) <button type="button"',
  'Balik (mm) <button type="button"'),
 ('M2', 'vuelve el autor a la frase del volumen del informe y del EN SUMA',
  "  return 'volumen estimado por ecografía de aproximadamente ' + r.ml + ' ml';",
  "  return 'aproximadamente ' + r.ml + ' ml, según fórmula de Balik';"),
 ('M3', 'vuelve el parrafo corrido: las frases del pulmon se pegan en una sola entrada',
  "      try { pulAvFrases().forEach(function (x) { inf.push(x);",
  "      try { pulAvFrases().forEach(function (x) { if (inf.length && /pleur|neas B|Consolidaci/.test(inf[inf.length-1])) { inf[inf.length-1] += ' ' + x; if (typeof ccMarcarParrafo === 'function') ccMarcarParrafo(); return; } inf.push(x);"),
 ('M4', 'SOBRE-APLICACION: el patron global sale tambien de la PANTALLA, no solo del papel',
  "  if (p) p.textContent = r.p;",
  "  if (p) p.textContent = '';"),
 ('M5', 'vuelve el EN SUMA con la consolidacion ANTES que el derrame',
  "  if (_amV('pua_derrame') === 'si' && _om.indexOf('derrame') < 0) {\n    const bk = PF(_amV('pua_balik')), lado = _amV('pua_derrame_lado');",
  "  if (false) {\n    const bk = PF(_amV('pua_balik')), lado = _amV('pua_derrame_lado');"),
 ('M6', 'vuelve la compuerta por BOTON: sin integrar, el pulmon no publica nada',
  "  if (typeof pulAvanzadoHayDatos === 'function' && pulAvanzadoHayDatos()\n      && typeof pulAvSuma === 'function') {",
  "  if (typeof amiloIntegrado === 'function' && amiloIntegrado('pulm')\n      && typeof pulAvanzadoHayDatos === 'function' && pulAvanzadoHayDatos()\n      && typeof pulAvSuma === 'function') {"),
 ('M7', 'vuelve la atribucion a Balik en la ficha de Referencias de eco pulmonar',
  'El consenso <b>no atribuye</b> la f&oacute;rmula del derrame a ning&uacute;n autor',
  'La f&oacute;rmula del derrame es de <b>Balik M</b> y colaboradores'),
 # ══ COMMIT 2 · CONSTRICCION vs RESTRICCION ═════════════════════════════════════════════════
 ('M8', 'la tarjeta del cociente pierde la Figura S1 y su redondeo a 0,8',
  "El 0,78 es el valor del texto de la guía. Su Figura S1 del material suplementario lo redondea a «más de 0,8»",
  "El 0,78 es el valor del texto de la guía"),
 ('M9', 'la tarjeta del criterio propio pierde los dos cortes del HFA-PEFF con su folio',
  "    fuente: 'Pieske B y colaboradores, consenso HFA-PEFF, folio 3303, para los dos cortes del HFA-PEFF.',",
  "    fuente: 'Consenso HFA-PEFF.',"),
 ('M10','vuelve el texto largo a la pantalla, debajo del campo del cociente',
  "              Velocidad del flujo espiratorio invertido sobre el flujo anter&oacute;grado.\n            </div>",
  "              Velocidad del flujo espiratorio invertido sobre el flujo anter&oacute;grado.\n              El <b>0,78</b> es el valor del texto de la gu&iacute;a (ESC 2025, apartado 11.9.3:\n              sensibilidad 87 %, especificidad 91 %). Su <b>Figura S1</b> del material\n              suplementario lo <b>redondea a &gt;0,8</b>.\n            </div>"),
 # ══ COMMIT 3 · EL BOTON RETIRADO ═══════════════════════════════════════════════════════════
 ('M11','vuelve uno de los cuatro botones «Traer del formulario»',
  "amCalcToggle('rwt')\">Calcular ▾</button>",
  "amCalcToggle('rwt')\">Calcular ▾</button><button type=\"button\" class=\"crit-calc-btn\" onclick=\"event.stopPropagation();amTraerDeFormulario('rwt')\">↓ Traer del formulario</button>"),
 # ══ COMMIT 4 · EL FORRESTER ════════════════════════════════════════════════════════════════
 ('M12','SOBRE-APLICACION: la clasificacion pre/poscapilar se mueve TAMBIEN a 18, y no es su corte',
  "      htpEl.innerHTML = (pcp <= 15\n",
  "      htpEl.innerHTML = (pcp <= UMBRAL_PCP_HUMEDO\n"),
 ('M13','vuelve el corte de congestion a 15',
  'const UMBRAL_PCP_HUMEDO = 18;',
  'const UMBRAL_PCP_HUMEDO = 15;'),
 ('M14','vuelve el operador estricto del indice cardiaco: el 2,2 exacto deja de ser hipoperfusion',
  '  const humedo = pcp > UMBRAL_PCP_HUMEDO, frio = ic <= FORR_IC_CORTE;',
  '  const humedo = pcp > UMBRAL_PCP_HUMEDO, frio = ic < FORR_IC_CORTE;'),
 ('M15','vuelve la cascada PROPIA de la capsula, con el literal 2.2 - el cableado que el C2-4b cerro',
  "      const _cuad = forrCuadrante(ic, pcp);",
  "      const _cuad = (function(){ const h = pcp > 15, f = ic < 2.2;\n        return (!f && !h) ? 'I' : (h && !f) ? 'II' : (f && !h) ? 'III' : 'IV'; })();"),
 ('M16','el globo del Forrester vuelve a gritar sus dos mayusculas de en medio',
  "    ojo: 'Los dos bordes exactos no están definidos.",
  "    ojo: 'LOS DOS BORDES EXACTOS NO ESTÁN DEFINIDOS."),
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
