#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_noca.py — barrido de MUTACIONES DIRIGIDAS de la TANDA NOCTURNA, Parte A (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits A1 a A4 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-551 se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_noca.py              # todas
  python3 scripts/_mut_noca.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
⚠️ TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 06 hace que la frecuencia de la
   animacion se ESCRIBA en el campo del estudio, la 11 que el recolector de video borre TODO sin
   mirar que estudios estan vivos, y la 13 que el globo afirme un valor normal de la velocidad
   que ninguna fuente publica. Existen porque las condiciones que las matan son CONTROLES
   NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta probando nada.
⚠️ LA 09 ES LA QUE MAS DICE. Devuelve el radio de las particulas al grupo, que es como estaba
   escrita la primera version de este bloque: `r` NO se hereda, asi que el contraste espontaneo
   queda INVISIBLE sin un solo error de consola, y sin la condicion (C0b) eso pasaria en verde.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-551'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # ── A1 · el lugar y los rotulos ──────────────────────────────────────────────────
 ('01 el valor de la profundidad vuelve a ir centrado debajo de la punta',
  "  if (d) g += L(tip[0] + 14, tip[1] + 26, 'prof. ' + d + ' mm', 'start', 11, C.medida);",
  "  if (d) g += L(tip[0], tip[1] + 22, 'prof. ' + d + ' mm', 'middle', 11, C.medida);"),

 ('02 el rotulo Cx vuelve a la derecha de su punto',
  "L(190, 176, 'Cx', 'end', 10, C.rojo);",
  "L(203, 170, 'Cx', 'start', 10, C.rojo);"),

 ('03 la regla de 900 px deja de poner display:flex',
  "    #oai-fila { display:flex; gap:14px; align-items:flex-start; }",
  "    #oai-fila { display:block; gap:14px; align-items:flex-start; }"),

 # ⚠️ LA PRIMERA VERSION DE ESTA MUTACION SOBREVIVIO, Y ESTABA MAL ESCRITA: agregaba un div
 # vacio DESPUES del cierre de la fila, que no cambia de quien es hermana la caja. Esta cierra
 # la fila JUSTO DESPUES de la grilla, asi que la caja del dibujo queda AFUERA -que es
 # exactamente el estado de HEAD-, y hay que mover las DOS etiquetas a la vez: dejar una sola
 # desbalancea el marcado y el navegador lo repara solo, tapando la mutacion.
 ('04 la caja del dibujo deja de ser hermana de la grilla',
  [('''          <input type="number" id="oai_area_ostium" placeholder="cm\u00b2" oninput="calcOAI()">
        </div>
      </div>
      <!-- \u2550\u2550\u2550 ESQUEMA DE LA OREJUELA''',
    '''          <input type="number" id="oai_area_ostium" placeholder="cm\u00b2" oninput="calcOAI()">
        </div>
      </div>
      </div><!-- /#oai-fila MUTADO -->
      <!-- \u2550\u2550\u2550 ESQUEMA DE LA OREJUELA'''),
   ('      </div><!-- /#oai-fila -->\n', '')]),

 # ── A2 · el movimiento ──────────────────────────────────────────────────────────
 ('05 sin frecuencia cargada, el 70 se declara como si viniera del estudio',
  "  return { lpm: OAI_FC_ANIM, cargada: false };",
  "  return { lpm: OAI_FC_ANIM, cargada: true };"),

 ('06 DE MAS: la frecuencia de la animacion se ESCRIBE en el campo del estudio',
  """function _oaiFcAnim() {
  for (const id of ['ao_fc', 'hemo_fc']) {""",
  """function _oaiFcAnim() {
  { const _e = document.getElementById('ao_fc');
    if (_e && !_e.value) { _e.value = String(OAI_FC_ANIM); } }
  for (const id of ['ao_fc', 'hemo_fc']) {"""),

 ('07 la animacion corre aunque la seccion este plegada',
  """  const c = document.getElementById('oai-esq-caja');
  return !!(c && c.offsetParent !== null && !document.hidden);""",
  """  const c = document.getElementById('oai-esq-caja');
  return !!c;"""),

 ('08 el guardado automatico vuelve a pisar el cuadro que el medico eligio',
  "    if (_oaiEsqManualUuid && _uu && _oaiEsqManualUuid === _uu) return;",
  "    if (false && _oaiEsqManualUuid && _uu && _oaiEsqManualUuid === _uu) return;"),

 ('09 el radio de las particulas vuelve al grupo: r NO se hereda y el contraste desaparece',
  [("""      g += '<g id="oai-sec" fill="' + C.tenue + '" opacity="' + c.op + '">';""",
    """      g += '<g id="oai-sec" r="' + c.r + '" fill="' + C.tenue + '" opacity="' + c.op + '">';"""),
   ("""        g += '<circle cx="' + _oaiF1(q[0]) + '" cy="' + _oaiF1(q[1]) + '" r="' + c.r + '"/>'; });""",
    """        g += '<circle cx="' + _oaiF1(q[0]) + '" cy="' + _oaiF1(q[1]) + '"/>'; });""")]),

 ('10 el chorro deja de leer el grado de Valvulas y se queda en uno fijo',
  "  return (typeof g === 'number' && g >= 1 && g <= 4) ? g : 0;",
  "  return (typeof g === 'number' && g >= 1 && g <= 4) ? 2 : 0;"),

 # ── A4 · los recolectores ───────────────────────────────────────────────────────
 ('11 DE MAS: el recolector de video borra TODO sin mirar que estudios estan vivos',
  """    recolectar(uuidsVivos) {
      const vivos = new Set((uuidsVivos || []).filter(_uuidValido));
      return _tx('readwrite', (os, ok) => {
        const q = os.getAll();
        q.onsuccess = () => {
          const muertos = (q.result || []).filter(r => !vivos.has(r.uuid));
          muertos.forEach(r => os.delete(r.id));
          ok(muertos.length);
        };
      }).then(r => (r.ok && r.val) || 0);
    },
    uso() {
      return _tx('readonly', (os, ok) => {
        const q = os.getAll();
        q.onsuccess = () => ok({ n:(q.result||[]).length,
                                 bytes:(q.result||[]).reduce((a,r) => a + (r.bytes||0), 0) });
      }).then(r => (r.ok && r.val) ? r.val : { n:0, bytes:0 });
    }""",
  """    recolectar(uuidsVivos) {
      return _tx('readwrite', (os, ok) => {
        const q = os.getAll();
        q.onsuccess = () => {
          const muertos = (q.result || []);
          muertos.forEach(r => os.delete(r.id));
          ok(muertos.length);
        };
      }).then(r => (r.ok && r.val) || 0);
    },
    uso() {
      return _tx('readonly', (os, ok) => {
        const q = os.getAll();
        q.onsuccess = () => ok({ n:(q.result||[]).length,
                                 bytes:(q.result||[]).reduce((a,r) => a + (r.bytes||0), 0) });
      }).then(r => (r.ok && r.val) ? r.val : { n:0, bytes:0 });
    }"""),

 ('12 la puerta unica deja de recoger los videos',
  """  const pVid = (typeof CeiboVideo !== 'undefined' && CeiboVideo.recolectar)
    ? CeiboVideo.recolectar(vivos).catch(() => 0) : Promise.resolve(0);""",
  """  const pVid = Promise.resolve(0);"""),

 # ── A3 · el globo ───────────────────────────────────────────────────────────────
 ('13 DE MAS: el globo afirma un valor normal de la velocidad que ninguna fuente publica',
  "'la cardioversi\u00f3n la orejuela puede quedar aturdida, con m\u00e1s contraste espont\u00e1neo y ' +",
  "'la cardioversi\u00f3n la orejuela puede quedar aturdida. Lo normal es 40 cm/s o m\u00e1s. Con m\u00e1s contraste espont\u00e1neo y ' +"),

 ('14 el globo vuelve a clonar la ficha de Referencias, con el bloque de dispositivos',
  "  'oai-ref': { ancho: 360, dyn: function () { return _oaiRefGlobo() } },",
  "  'oai-ref': { ancho: 360, dyn: function () { return _otrRefClon('ref-oai') } },"),
]

def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
