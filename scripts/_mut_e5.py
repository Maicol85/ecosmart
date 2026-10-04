#!/usr/bin/env python3
"""
_mut_e5.py — barrido de mutaciones TEMPORAL de la etapa E5 (botones/pastillas de la pulmonar).

Cada mutacion se aplica sobre una COPIA del repo en /tmp, NUNCA sobre index.html. El md5 del
archivo vivo se compara antes y despues y el barrido ABORTA si no coincide (la trampa del snapshot
que deshace ediciones). La suite v2 de la pulmonar todavia no existe (va en E6), asi que el scorer
NO usa test_clinico: corre la sonda de outputs `_ab_e5.mjs --file <copia>` y exige que la ESCENA
indicada CAMBIE respecto de la corrida CURRENT (= el mutante quedo en ROJO). Un mutante que no mueve
ninguna escena esta VIVO (sin cobertura). Se exige que `_ab_e5` haya producido JSON (si no, NO CORRIO).

Uso:  python3 scripts/_mut_e5.py
"""
import hashlib, json, os, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')
SC   = os.environ.get('SC', '/tmp')

def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()

# (id, descripcion, viejo, nuevo, escena que debe CAMBIAR, campo a comparar)
MUT = [
 ('ME1', 'informe: se quita el termino del pill en hayIP (regla 9 IP)',
  " || (typeof pillOn === 'function' && pillOn('pulmonar','insuf'))",
  "",
  'N-ip-pill-solo', 'suma'),
 ('ME2', 'calcIP: se desactiva el trigger de IP desde la Vmax',
  "    if (vmax !== null && vmax > 0 && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'insuf')\n        && localStorage.getItem('valv-pill-insuf-pulmonar') !== '0') {",
  "    if (false && vmax !== null && vmax > 0 && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'insuf')\n        && localStorage.getItem('valv-pill-insuf-pulmonar') !== '0') {",
  'R-ip-vel', 'pills_pulmonar'),
 ('ME3', 'epGradoManual: no prende el boton al elegir grado (regla 3 EP)',
  "    if (sel && typeof sevEsSin === 'function' && !sevEsSin('esten', sel.value)\n        && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'esten')) {\n      toggleValvPill('pulmonar', 'esten');",
  "    if (false && sel && typeof sevEsSin === 'function' && !sevEsSin('esten', sel.value)\n        && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'esten')) {\n      toggleValvPill('pulmonar', 'esten');",
  'E-ep-grado-evento', 'pills_pulmonar'),
 ('ME4', 'ipGradoManual: no prende el boton al elegir grado de IP (regla 3 IP)',
  "    if (sel && typeof ipHayInsuf === 'function' && ipHayInsuf(sel.value)\n        && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'insuf')) {\n      toggleValvPill('pulmonar', 'insuf');",
  "    if (false && sel && typeof ipHayInsuf === 'function' && ipHayInsuf(sel.value)\n        && typeof pillOn === 'function' && typeof toggleValvPill === 'function'\n        && !pillOn('pulmonar', 'insuf')) {\n      toggleValvPill('pulmonar', 'insuf');",
  'E-ip-grado-evento', 'pills_pulmonar'),
]

def correr(idxfile, out):
    r = subprocess.run(['node', 'scripts/_ab_e5.mjs', '--file', idxfile],
                       cwd=RAIZ, capture_output=True, text=True, timeout=600)
    open(out, 'w').write(r.stdout)
    try:
        return json.loads(r.stdout)
    except Exception:
        return None

def escena(data, eid):
    if not data: return None
    for e in data.get('escenas', []):
        if e.get('id') == eid: return e
    return None

sello = md5(VIVO)
print('md5 del archivo VIVO antes del barrido: %s' % sello)
orig = open(VIVO, encoding='utf-8').read()

# Corrida CURRENT (archivo vivo, sin mutar) = referencia.
print('corriendo CURRENT (referencia)...')
cur = correr(VIVO, os.path.join(SC, 'mut_e5_current.json'))
if not cur:
    print('ABORTA: _ab_e5 no produjo JSON sobre el archivo vivo'); sys.exit(2)

base = tempfile.mkdtemp(prefix='ecomut-e5-')
shutil.copytree(os.path.join(RAIZ, 'scripts'), os.path.join(base, 'scripts'))
copia_idx = os.path.join(base, 'index.html')
print('copia de trabajo: %s\n' % base)

filas = []
for mid, desc, viejo, nuevo, eid, campo in MUT:
    n = orig.count(viejo)
    if n != 1:
        filas.append((mid, 'NO APLICA', 'patron x%d (debe ser 1)' % n));
        print('  %-5s NO APLICA — patron aparece %d veces' % (mid, n)); continue
    open(copia_idx, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
    data = correr(copia_idx, os.path.join(SC, 'mut_e5_%s.json' % mid))
    if not data:
        filas.append((mid, 'NO CORRIO', '_ab_e5 sin JSON')); print('  %-5s NO CORRIO' % mid); continue
    em, ec = escena(data, eid), escena(cur, eid)
    if not em or not ec:
        filas.append((mid, 'NO CORRIO', 'escena %s ausente' % eid)); print('  %-5s NO CORRIO (escena %s ausente)' % (mid, eid)); continue
    vm, vc = str(em.get(campo)), str(ec.get(campo))
    estado = 'MUERTA' if vm != vc else 'SOBREVIVIO'
    filas.append((mid, estado, '%s: cur=%r mut=%r' % (campo, vc, vm)))
    print('  %-5s %-11s %s[%s] cur=%r -> mut=%r' % (mid, estado, eid, campo, vc, vm))

ahora = md5(VIVO)
print('\nmd5 del archivo VIVO despues del barrido: %s' % ahora)
if ahora != sello:
    print('!!! ABORTA: el archivo vivo CAMBIO durante el barrido'); sys.exit(3)
print('md5 IGUAL: el archivo vivo no se toco.\n')
print('RESULTADO MUTACIONES:')
for mid, estado, det in filas:
    print('  %-5s %-11s %s' % (mid, estado, det))
muertas = sum(1 for _,e,_ in filas if e == 'MUERTA')
print('\n%d/%d MUERTAS' % (muertas, len(filas)))
shutil.rmtree(base, ignore_errors=True)
