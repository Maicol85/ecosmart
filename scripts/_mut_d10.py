# -*- coding: utf-8 -*-
"""_mut_d10.py - mutaciones dirigidas de la CORRECCION D-10, contra TC-542.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-541 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_d10.py            # corre las DOCE en un WORKTREE
  python3 scripts/_mut_d10.py --solo M3

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
WT   = '/tmp/wt-mut-d10'
CASO = 'TC-542'

MUT = [
 # ── El sentido ESTUDIO -> MODULO: el reflejo tiene que mandar siempre ────────────────────────
 ('M1', 'vuelve la guarda de la marca de espejo: el reflejo solo toca lo que el mismo escribio, '
        'que es el defecto que congelaba el modulo tras cada recarga',
  "      if (el.dataset.amiloPropio === '1') return;",
  "      if (el.dataset.espejo !== '1') return;\n      if (el.dataset.amiloPropio === '1') return;"),
 ('M2', 'el reflejo deja de vaciarse cuando la fuente del estudio desaparece: el DDVI borrado '
        'no se va del calculador',
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);\n      if (String(el.value || '').trim() === nuevo) return;",
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);\n      if (vacio) return;\n      if (String(el.value || '').trim() === nuevo) return;"),
 ('M3', 'el dueno unico del sentido app -> modulo deja de correr',
  "  _amiloReflejarDesdeApp();",
  "  void 0;"),
 ('M4', 'el reflejo se vacia SIEMPRE, tambien con la fuente cargada: no sigue al dato, lo borra',
  "      var nuevo = vacio ? '' : String(Math.round(n * 10) / 10);",
  "      var nuevo = '';"),
 # ⚠️ M5 REESCRITA. La primera version mutaba una guarda de FOCO que sobrevivio porque era
 # inalcanzable: la escritura hacia el estudio corre en el oninput, antes de que el barrido pueda
 # correr, asi que la marca de desacuerdo ya protege el campo. Esa guarda se retiro —un dueno— y
 # esta version muta la unica que quedo para ese trabajo, desde el otro lado.
 ('M5', 'la marca de desacuerdo deja de ponerse, asi que el reflejo le pisa al medico lo que '
        'midio en el calculador',
  "      if (mod && mod.dataset) mod.dataset.amiloPropio = '1';",
  "      void 0;"),
 ('M6', 'el reflejo pisa tambien el insumo SIN vuelta al estudio: el promedio de e-prima que el '
        'medico midio en el calculador se pierde',
  "      if (!conVuelta[id] && String(el.value || '').trim() !== '' && el.dataset.espejo !== '1') return;",
  "      void 0;"),
 ('M7', 'el reflejo pisa el valor propio que el estudio rechazo, asi que el desacuerdo se borra '
        'de la pantalla sola',
  "      if (el.dataset.amiloPropio === '1') return;",
  "      void 0;"),
 # ── El sentido MODULO -> ESTUDIO: todos los digitos, y nunca lo del medico ───────────────────
 ('M8', 'vuelve la regla que trataba el digito ya escrito por el modulo como un valor ajeno: el '
        'estudio se queda con el primer digito',
  "    if (va === null || nuestro) {",
  "    if (va === null) {"),
 ('M9', 'el modulo deja de recordar lo que escribio, asi que la autorizacion no se puede dar',
  "      if (destino.dataset) destino.dataset.amiloEsc = String(destino.value);",
  "      void 0;"),
 ('M10','la autorizacion deja de comparar y pisa SIEMPRE, tambien lo que el medico cargo a mano '
        'en el estudio',
  "    var nuestro = (va !== null) && nUlt !== null && isFinite(nUlt) &&\n                  (e.abs ? Math.abs(va) === Math.abs(nUlt) : va === nUlt);",
  "    var nuestro = (va !== null);"),
 # ⚠️ M11 REESCRITA por lo mismo: el gesto tambien borraba la marca de desacuerdo y el cuerpo de
 # la escritura ya la resuelve por los tres caminos, asi que romper una mitad no cambiaba nada.
 # Retirada la mitad, esta version muta la limpieza que quedo, la del cuerpo.
 ('M11','la marca de desacuerdo deja de limpiarse cuando los dos valores coinciden: el campo '
        'queda marcado como propio para siempre y el reflejo no lo toca mas',
  "    } else if (mod && mod.dataset) {",
  "    } else if (false) {"),
 ('M12','el gesto deja de escribir hacia el estudio',
  "function amiloGestoEnModulo(id) {\n  var e = id ? document.getElementById(id) : null;",
  "function amiloGestoEnModulo(id) {\n  if (1) return;\n  var e = id ? document.getElementById(id) : null;"),
 # ADVERTENCIA M13 EXISTIO Y SE RETIRO. Mutaba un requisito de «campo no vacio» que resulto ser un
 # TERCER mecanismo para lo que ya hacen la escritura (dentro del estudio) y la lista cerrada de
 # limpiarCampos (entre estudios). Retirado el requisito, la mutacion no tiene donde aplicarse.
 ('M14','las dos marcas del modulo dejan de morir con Nuevo estudio y mandan sobre el paciente '
        'siguiente',
  "    delete el.dataset.amiloEsc; delete el.dataset.amiloPropio;",
  "    void 0;"),
 # ADVERTENCIA M16 muta la OTRA mitad: el selector. El archivo ya documenta que el selector y el
 # cuerpo son DOS listas y que anotar la marca en una sola es un no-op completo.
 ('M16','la marca queda en el cuerpo pero NO en el selector de Nuevo estudio, que es como entro '
        'la fuga vieja que este archivo documenta',
  ",[data-amilo-esc],[data-amilo-propio]'",
  "'"),
 # ADVERTENCIA M15 nacio al retirar la redundancia que dejaba vivas a M13 y M14: el autollenado
 # y el reflejo hacian el mismo trabajo sobre los mismos campos.
 # ADVERTENCIA M15 NO ES UNA INYECCION DE DEFECTO y su supervivencia no es un hueco: vuelve a
 # poner un mecanismo REDUNDANTE —el autollenado, que escribe lo mismo que el reflejo en los
 # campos vacios— y por eso el comportamiento no cambia. Su valor es justamente ese: es la
 # evidencia medida de que retirarlo no movio nada.
 ('M15','vuelve el autollenado dentro del barrido, que tapa al reflejo en todo campo vacio '
        '(NO es un defecto: mide que el retiro fue inocuo)',
  "    var lleno = false;",
  "    var lleno = amAutoLlenar(k);"),
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
