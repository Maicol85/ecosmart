# -*- coding: utf-8 -*-
"""_mut_d11.py - mutaciones dirigidas de la CORRECCION D-11, contra TC-543.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-542 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_d11.py            # corre las DOCE en un WORKTREE
  python3 scripts/_mut_d11.py --solo M3

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
WT   = '/tmp/wt-mut-d11'
CASO = 'TC-543'

MUT = [
 # ── El modelo nuevo: gana la ULTIMA edicion ─────────────────────────────────────────────────
 ('M1', 'vuelve la regla de NO PISAR: el gesto del modulo solo escribe si el campo del estudio '
        'esta vacio, que es el defecto que el medico reporto',
  "  if (String(destino.value) === String(nuevo)) return;   // nada que mover, y sin eventos de m\u00e1s",
  "  if (String(destino.value || '').trim() !== '') return;\n  if (String(destino.value) === String(nuevo)) return;"),
 ('M2', 'el vacio deja de propagarse: borrar en el modulo ya no borra en el estudio',
  "  var nuevo = (vm === null) ? '' : (e.abs ? -Math.abs(vm) : vm);",
  "  if (vm === null) return;\n  var nuevo = (e.abs ? -Math.abs(vm) : vm);"),
 ('M3', 'la escritura deja de mirar el id y recorre el registro entero, asi que el segundo campo '
        'espejo del mismo dato deshace el gesto en la misma pasada',
  "  if (!id) return;                                   // sin gesto no hay escritura\n  var e = null;\n  try { e = (amiloEspejos() || []).filter(function (x) { return x.mod === id; })[0]; }",
  "  var e = null;\n  try { e = (amiloEspejos() || []).filter(function (x) { return _amiloNum(x.mod) !== null; })[0]; }"),
 ('M4', 'el campo a medio escribir SI se propaga como vacio: el guion del strain borra el dato '
        'del paciente',
  "  if (vm === null && crudo !== '') return;",
  "  void 0;"),
 ('M5', 'el reflejo vuelve a vaciar un campo a medio escribir: el barrido le come el guion',
  "      var crudoMod = String(el.value || '').trim();\n      if (crudoMod !== '' && isNaN(PF(crudoMod))) return;",
  "      void 0;"),
 ('M6', 'el gesto deja de escribir hacia el estudio',
  "function amiloGestoEnModulo(id) {",
  "function amiloGestoEnModulo(id) {\n  if (1) return;"),
 # ── Lo derivado se recalcula en cada cambio ─────────────────────────────────────────────────
 ('M7', 'la etiqueta del boton violeta deja de repintarse al recalcular un criterio con dato, '
        'asi que vuelve a congelarse en el valor viejo',
  "  amCalcLabelSync(k);\n  if (!crit || !input || !chk) return;",
  "  if (!crit || !input || !chk) return;"),
 ('M8', 'la etiqueta deja de repintarse cuando falta el dato: el boton anuncia un numero que ya '
        'no existe',
  "  amCalcLabelSync(k);\n  if (!crit || crit.dataset.origen === 'manual') return;",
  "  if (!crit || crit.dataset.origen === 'manual') return;"),
 ('M9', 'la etiqueta se repinta pero pierde si el acordeon estaba abierto',
  "  var abierto = !box.hasAttribute('hidden');",
  "  var abierto = false;"),
 # ── Nada automatico escribe (se mantiene del D-9) ───────────────────────────────────────────
 ('M10','vuelve la escritura hacia el estudio desde calcRWT, que es a quien llama el barrido',
  "function calcRWT() {",
  "function calcRWT() {\n  if (typeof amiloEspejoHaciaApp === 'function') amiloEspejoHaciaApp('rwt-septo');"),
 ('M11','el barrido de espejos escribe hacia el estudio en cada pasada',
  "function amiloScoreSync() {\n  amiloEspejoDesdeApp();",
  "function amiloScoreSync() {\n  try { amiloEspejoHaciaApp('tapse-val') } catch(e){}\n  amiloEspejoDesdeApp();"),
 ('M12','el reflejo deja de correr: la otra puerta deja de verse en el modulo',
  "  _amiloReflejarDesdeApp();",
  "  void 0;"),
 ('M13','la marca de espejo deja de morir con Nuevo estudio y manda sobre el paciente siguiente',
  "    delete el.dataset.espejo;",
  "    void 0;"),
 ('M14','el strain deja de escribirse negativo: el Excel publica un GLS con el signo cambiado',
  "  var nuevo = (vm === null) ? '' : (e.abs ? -Math.abs(vm) : vm);",
  "  var nuevo = (vm === null) ? '' : vm;"),
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
