# -*- coding: utf-8 -*-
"""_mut_d9.py - mutaciones dirigidas de la CORRECCION D-9, contra TC-541.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-540 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_d9.py            # corre las DOCE en un WORKTREE
  python3 scripts/_mut_d9.py --solo M3

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
WT   = '/tmp/wt-mut-d9'
CASO = 'TC-541'

MUT = [
 ('M1', 'vuelve la escritura hacia el estudio desde calcTAPSE, que es a quien llama el barrido',
  "function calcTAPSE() {",
  "function calcTAPSE() {\n  if (typeof amiloEspejoHaciaApp === 'function') amiloEspejoHaciaApp();"),
 ('M2', 'lo mismo desde calcRWT: el barrido vuelve a deshacer el borrado de los espesores',
  "function calcRWT() {",
  "function calcRWT() {\n  if (typeof amiloEspejoHaciaApp === 'function') amiloEspejoHaciaApp();"),
 ('M3', 'lo mismo desde calcETT, que corre en cada repintado y en la restauracion',
  "function calcETT() {",
  "function calcETT() {\n  if (typeof amiloEspejoHaciaApp === 'function') { try { amiloEspejoHaciaApp() } catch(e){} }"),
 # ⚠️ M4 REESCRITA: la primera version mutaba un segundo recorrido que hacia lo MISMO que el
 # dueno unico, asi que romperlo no cambiaba nada y salia «sobrevivio» sobre redundancia, no
 # sobre falta de cobertura. Ese recorrido se retiro; esta version muta al dueno que quedo.
 ('M4', 'el reflejo deja de vaciarse cuando la fuente del estudio desaparece',
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);\n      if (String(el.value || '').trim() === nuevo) return;",
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);\n      if (vacio) return;\n      if (String(el.value || '').trim() === nuevo) return;"),
 ('M5', 'el autollenado deja de MARCAR lo que escribe: ya no se distingue del dato del medico',
  "  plan.forEach(function (p) { p[0].value = p[1]; p[0].dataset.espejo = '1'; });",
  "  plan.forEach(function (p) { p[0].value = p[1]; });"),
 # ⚠️ M6: apuntaba al nombre viejo de la funcion y salio «MAL ESCRITA» —cero ocurrencias—, que es
 # lo que el arnes informa cuando la mutacion no se puede aplicar. Un «no se aplico» NO es un
 # «sobrevivio», y distinguirlos es la unica razon por la que ese estado existe.
 ('M6', 'los insumos autollenados dejan de seguir al dato',
  "  _amiloReflejarDesdeApp();",
  "  void 0;"),
 ('M7', 'el reflejo se vacia SIEMPRE, tambien cuando la fuente todavia tiene un valor',
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);",
  "      var nuevo = '';"),
 ('M8', 'el gesto deja de borrar la marca de espejo: lo que el medico tipea se lo pisa el barrido',
  "  if (e && e.dataset) delete e.dataset.espejo;",
  "  void 0;"),
 ('M9', 'el gesto deja de escribir hacia el estudio: se rompe el paso 10 de la guia',
  "function amiloGestoEnModulo(id) {\n  var e = id ? document.getElementById(id) : null;",
  "function amiloGestoEnModulo(id) {\n  if (1) return;\n  var e = id ? document.getElementById(id) : null;"),
 # ⚠️ M10 REESCRITA por lo mismo: la guarda que mutaba vivia en el recorrido retirado. Hoy la
 # que protege la medicion propia del medico es la marca `espejo` del dueno unico.
 ('M10','el reflejo pisa tambien lo que el medico tipeo en el modulo',
  "      if (el.dataset.espejo !== '1') return;                 // medición propia del médico",
  "      void 0;"),
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
