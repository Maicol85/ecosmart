# -*- coding: utf-8 -*-
"""_mut_d.py - mutaciones dirigidas de la TANDA D, contra TC-540.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-540 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_d.py            # corre las DOCE en un WORKTREE
  python3 scripts/_mut_d.py --solo M3

⚠️ NUNCA TOCA EL ARBOL VIVO. Arma un worktree aparte, copia ahi el index.html y el
   test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
⚠️ EXIGE «RESULTADO» EN LA SALIDA ANTES DE PUNTUAR. Si la suite no arranca, stdout queda vacio,
   no hay ningun ✗ y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Es la trampa que el arnes de la tanda AJ7 pago con siete falsos.
⚠️ Y CORRE LA LINEA BASE PRIMERO. Con el caso ya rojo de entrada, las doce salen «en rojo»
   sin que eso pruebe nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-d'
CASO = 'TC-540'

MUT = [
 ('M1', 'la arritmia deja de ser «-» en antraciclinas y pasa a valer lo mismo en las dos columnas',
  "    hfaicos_cv_arrit:  { antracicline:null, trastuzumab:'M2' },",
  "    hfaicos_cv_arrit:  { antracicline:'M2', trastuzumab:'M2' },"),
 ('M2', 'la IC previa baja de muy alto a alto: la celda VH de la Tabla 4 se degrada',
  "    hfaicos_cv_ic:     { antracicline:'VH', trastuzumab:'VH' },",
  "    hfaicos_cv_ic:     { antracicline:'H',  trastuzumab:'H'  },"),
 ('M3', 'vuelve el corte viejo: con 2 a 4 puntos moderados se clasifica ALTO y no moderado',
  "    else if (pts >= 2)       clave = 'medio';",
  "    else if (pts >= 2)       clave = 'alto';"),
 ('M4', 'vuelve el piso por farmaco: el anti-HER2 empuja a alto con cero factores',
  "  const col = coT4Columna(farmaco);",
  "  const col = null;"),
 ('M5', 'la nota al pie g se retira: antraciclina mas trastuzumab deja de ser alto',
  "    if (col === 'trastuzumab' && (num('co_dosis_antrac') || 0) > 0",
  "    if (false && col === 'trastuzumab' && (num('co_dosis_antrac') || 0) > 0"),
 ('M6', 'la edad deja de mirar el numero: todas las edades caen en la fila de 65 a 79',
  "  if (edad !== null && edad >= 80) return 'H';",
  "  if (false) return 'H';"),
 ('M7', 'la derivacion del riesgo moderado se calla: solo derivan alto y muy alto',
  "  if (clave === 'medio')\n    return 'Se puede considerar derivar a cardiología, sin demorar el tratamiento.';",
  "  if (false)\n    return 'Se puede considerar derivar a cardiología, sin demorar el tratamiento.';"),
 ('M8', 'el anti-HER2 vuelve a recibir el calendario de la banda y no el suyo',
  "  if (col === 'trastuzumab') {\n    return 'Eco basal, cada 3 meses durante el tratamiento y dentro de los 12 meses de terminarlo.'",
  "  if (false) {\n    return 'Eco basal, cada 3 meses durante el tratamiento y dentro de los 12 meses de terminarlo.'"),
 ('M9', 'vuelve la salida temprana sin publicar: Datos basales conserva la banda anterior',
  "    if (typeof hfaicosPublicarBasal === 'function') hfaicosPublicarBasal();\n    return;\n  }",
  "    return;\n  }"),
 ('M10','el marcado automatico del score se saca del barrido de espejos',
  "          'amiloScoreSync'];",
  "          'pamAvisoSync'];"),
 ('M11','el destildado a mano deja de registrarse: el barrido revive lo que el medico saco',
  "  amOrigenSet(_k0, activo ? 'manual' : 'nomanual');",
  "  amOrigenSet(_k0, activo ? 'manual' : '');"),
 ('M12','el puntaje deja de llegar solo al algoritmo: vuelve a hacer falta el boton',
  "  if (_algEl && pts > 0 && String(_algEl.value) !== String(pts)) {",
  "  if (false && _algEl && pts > 0 && String(_algEl.value) !== String(pts)) {"),
 ('M13','el sentido modulo -> app PISA un valor distinto en vez de declararlo',
  "    } else if (!mismo) {\n      discrep.push(e.lbl",
  "    } else if (!mismo) {\n      destino.value = e.abs ? -Math.abs(vm) : vm;\n      discrep.push(e.lbl"),
 # ⚠️ M14 REESCRITA: la primera version cambiaba la guarda a «if (!_AM_FUENTE[k] && k !== 'apice')»
 # y NO MUTABA NADA — con el guardia abierto, amAutoLlenar('apice') sale en su primera linea
 # porque _AM_FUENTE['apice'] no existe, y el mapa de recalculo tampoco tiene esa clave. Una
 # mutacion que no cambia el comportamiento sale «sobrevivio» y se lee como un hueco de cobertura
 # que no esta. Esta version SI deduce el cociente apex-base de otra medicion, que es exactamente
 # lo que la condicion (F2) prohibe.
 ('M14','el apice se marca solo deduciendolo del strain, que es otra medicion',
  "    if (!_AM_FUENTE[k]) return;                 // sin fuente en la app: no se toca",
  "    if (k === 'apice') { var _s = v('sgl');\n"
  "      if (_s !== null) { var _a = document.getElementById('ap-apic'), _b = document.getElementById('ap-base');\n"
  "        if (_a && _b && !_a.value && !_b.value) { _a.value = -Math.abs(_s); _b.value = -1;\n"
  "          if (typeof calcApice === 'function') calcApice(); } }\n"
  "      return; }\n"
  "    if (!_AM_FUENTE[k]) return;"),
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
