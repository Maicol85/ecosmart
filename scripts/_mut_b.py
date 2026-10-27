# -*- coding: utf-8 -*-
"""_mut_b.py — mutaciones dirigidas de la TANDA B, contra TC-538.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-538 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_b.py            # corre las quince en un WORKTREE
  python3 scripts/_mut_b.py --solo M3

⚠️ NUNCA TOCA EL ARBOL VIVO. Arma un worktree aparte, copia ahi el index.html y el
   test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
⚠️ EXIGE «RESULTADO» EN LA SALIDA ANTES DE PUNTUAR. Si la suite no arranca, stdout queda vacio,
   no hay ningun ✗ y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Es la trampa que el arnes de la tanda AJ7 pago con siete falsos.
⚠️ Y CORRE LA LINEA BASE PRIMERO. Con el caso ya rojo de entrada, las quince salen «en rojo»
   sin que eso pruebe nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-b'
CASO = 'TC-538'

MUT = [
 ('M1', 'el barrido de espejos sale del debounce: nadie lo llama nunca',
  "    try { _espejosBarrerTodos(); } catch (e) { console.warn('[_espejosBarrerTodos]', e); }\n    try { amiloRefrescarTodos(); }",
  "    try { amiloRefrescarTodos(); }"),
 ('M2', 'el registro queda VACIO: el mecanismo existe y no cubre a nadie',
  "  return ['tvSync', 'dapSync', 'coaSync', 'vapSync', 'ebsSync', 'tgaSync', 'dsavSync',",
  "  return []; return ['tvSync', 'dapSync', 'coaSync', 'vapSync', 'ebsSync', 'tgaSync', 'dsavSync',"),
 ('M3', 'sale `popDosisTodas`: el texto de dosis deja de seguir al peso (S2)',
  "'popConclSync', 'popDosisTodas',",
  "'popConclSync',"),
 ('M4', 'salen `popEsqPintar` y `popConclSync`: el esquema y la conclusion quedan viejos (S1)',
  "'popHemoSync', 'popPocusSync', 'popEsqPintar', 'popConclSync',",
  "'popHemoSync', 'popPocusSync',"),
 ('M5', 'sale `tvSync`: los espejos de la MCH, la MCA y Fallot dejan de seguir',
  "  return ['tvSync', 'dapSync',",
  "  return ['dapSync',"),
 ('M6', 'sale `eteShuntSync`: la superficie corporal y el DDVI indexado quedan viejos',
  "'cvpaSync', 'eteShuntSync', 'calcTEP',",
  "'cvpaSync', 'calcTEP',"),
 ('M7', 'sale `calcTEP`: la lectura de VD/VI deja de seguir al DDVI',
  "'cvpaSync', 'eteShuntSync', 'calcTEP',\n",
  "'cvpaSync', 'eteShuntSync',\n"),
 ('M8', 'sale `calcHemo`: la fila «PAM» no sigue a la del cateter',
  "'pamAvisoSync', 'aoRefPintar', 'calcHemo'];",
  "'pamAvisoSync', 'aoRefPintar'];"),
 ('M9', 'se invierte la precedencia: la tipeada le gana a la medida por cateter',
  "  const cand = [['inv', inv], ['tip', tip], ['calc', calc]];",
  "  const cand = [['tip', tip], ['inv', inv], ['calc', calc]];"),
 ('M10','la comparacion de discrepancia nunca encuentra nada: el aviso no sale',
  "    if (c.clave !== out.clave && Math.round(c.val) !== Math.round(out.val))",
  "    if (false && c.clave !== out.clave && Math.round(c.val) !== Math.round(out.val))"),
 ('M11','la calculada vuelve a ganar con el valor CRUDO y no con el redondeado',
  "    if (hp !== null) { if (esNuestro) calc = hp; else tip = hp; }",
  "    if (hp !== null) { if (esNuestro) calc = calcCrudo; else tip = hp; }"),
 ('M12','el aviso se pinta TAMBIEN sin discrepancia',
  "  if (!r.difieren.length) {\n    pintar('hemo-pam-auto', r.clave === 'calc' ? 'auto \u2190 PAS/PAD del Doppler a\u00f3rtico' : '');",
  "  if (false) {\n    pintar('hemo-pam-auto', r.clave === 'calc' ? 'auto \u2190 PAS/PAD del Doppler a\u00f3rtico' : '');"),
 ('M13','entra `v2dCerrar` al registro: el barrido cerraria la vista 2D abierta',
  "'pamAvisoSync', 'aoRefPintar', 'calcHemo'];\n}",
  "'pamAvisoSync', 'aoRefPintar', 'calcHemo', 'v2dCerrar'];\n}"),
 ('M14','un pintor del registro pasa a escribir un campo EDITABLE del medico',
  "    try { popDosisDilucion(k); } catch (e) { console.warn('[popDosisTodas] ' + k, e); }",
  "    try { popDosisDilucion(k); var _d = document.getElementById('pop_' + k + '_dosis'); if (_d) _d.value = '9.99'; } catch (e) { console.warn('[popDosisTodas] ' + k, e); }"),
 ('M16','la compuerta de `tvSync` deja de vaciar el tipo de TV cuando no esta documentada',
  "    if (!detalle && e.value !== '') e.value = '';",
  "    if (false && !detalle && e.value !== '') e.value = '';"),
 ('M15','el aviso deja de ser idempotente: agrega en vez de reemplazar',
  "  const pintar = function (id, txt) {\n    const e = document.getElementById(id);\n    if (e) e.textContent = txt;\n  };",
  "  const pintar = function (id, txt) {\n    const e = document.getElementById(id);\n    if (e) e.textContent = (txt ? (e.textContent || '') + ' ' + txt : txt);\n  };"),
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
