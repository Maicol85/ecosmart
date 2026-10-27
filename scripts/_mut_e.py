# -*- coding: utf-8 -*-
"""_mut_e.py - mutaciones dirigidas de la TANDA E, contra TC-539.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-539 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_e.py            # corre las DOCE en un WORKTREE
  python3 scripts/_mut_e.py --solo M3

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
WT   = '/tmp/wt-mut-e'
CASO = 'TC-539'

MUT = [
 ('M1', 'se revierte la precedencia: vuelve a ganar el Carpentier de Valvulas',
  "  return (b && b.value) || (a && a.value) || '';",
  "  return (a && a.value) || (b && b.value) || '';"),
 ('M2', 'el hueco de vm_carp no se llena: el campo bloqueado se queda en el guion',
  "  if (vm && ete && !vm.value) {",
  "  if (false && vm && ete && !vm.value) {"),
 ('M3', 'el enlace de origen no se pinta: el medico no sabe de donde sale el dato',
  "    if (ete) {\n      const puerta = vmCarpPuertaEteAbierta();",
  "    if (false) {\n      const puerta = vmCarpPuertaEteAbierta();"),
 ('M4', 'vmProtBloqSync pierde el motivo «el ETE es el dueno»: el campo queda tocable',
  "    const bloq = !!prot || (id === 'vm_carp' && !!ete);",
  "    const bloq = !!prot;"),
 ('M5', 'sale la guarda de repintado del legado: llenar el hueco PISA el Tipo guardado',
  "  if (!gesto) { const lv = String(leg.value || ''); if (lv && lv !== '—') return; }\n",
  ""),
 ('M6', 'la frase de prolapso no se calla: el Carpentier vuelve a decirse dos veces',
  "      if (_carp && _carp !== '—'\n          && !((typeof vmCarpDichoEnMitral === 'function') && vmCarpDichoEnMitral()))\n",
  "      if (_carp && _carp !== '—')\n"),
 ('M7', 'la oracion de la mitral del ETE no se calla: vuelve a haber tres Carpentier',
  "    const carp = (_morfoInc && !_vmProt\n                  && !((typeof vmCarpDichoEnMitral === 'function') && vmCarpDichoEnMitral()))\n                 ? sv('ete_carpentier') : '';",
  "    const carp = (_morfoInc && !_vmProt) ? sv('ete_carpentier') : '';"),
 ('M8', 'et_grado sale del oyente de change: el aviso de la tricuspide no nace',
  "  if (id !== 'it_grado' && id !== 'ia_grado' && id !== 'et_grado') return;",
  "  if (id !== 'it_grado' && id !== 'ia_grado') return;"),
 ('M9', 'el strain por debajo de 15 vuelve a escribir «leve como minimo»',
  "      if (!_vdDisfG && strCat === 'leve') _vdDisfG = 'leve';",
  "      if (!_vdDisfG && strVota) _vdDisfG = (strCat === 'bajo_leve') ? 'leve como mínimo' : 'leve';"),
 ('M10','una fila del Amulet se mueve medio milimetro (tamano 25: 22,0 -> 22,5)',
  "Object.freeze([25, 19.0, 22.0, 12])",
  "Object.freeze([25, 19.0, 22.5, 12])"),
 ('M11','una fila del Watchman se mueve (tamano 27: 24,3 -> 24,9)',
  "Object.freeze([27, 18.9, 24.3])",
  "Object.freeze([27, 18.9, 24.9])"),
 ('M12','el informe vuelve a juzgar por rango, con el 17 a 31 de la generacion anterior',
  "      if (oTrombo === 'si') aptitud = 'no apto para cierre percutáneo (trombo presente)';",
  "      if (oTrombo === 'si') aptitud = 'no apto para cierre percutáneo (trombo presente)';\n      else if (oDiam && oDiam >= 17 && oDiam <= 31) aptitud = 'potencialmente apto para cierre percutáneo (Watchman/Amulet)';"),
 ('M13','las notas vuelven a juzgar el ostium contra la zona de anclaje',
  "    notas.push(`Ostium ${diam} mm`);",
  "    notas.push(`Ostium ${diam} mm — dentro de la zona de anclaje del Amplatzer Amulet`);"),
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
