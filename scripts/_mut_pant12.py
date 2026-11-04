#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant12.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-12 (2026-11-04).
Calcado de _mut_pant11.py. Nombre propio: verificado con ls, no existia.

Cada mutacion revierte UNA de las cosas que los seis commits de codigo cambiaron -o la aplica DE
MAS- y exige que SU caso se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant12.py              # todas
  python3 scripts/_mut_pant12.py --solo 1,2   # algunas

** SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
** EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
** CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: con los seis por
   mutacion, un reparto mal hecho queda tapado por el caso de otro commit.
** VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS, porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (caso, nombre, viejo, nuevo) - viejo tiene que aparecer EXACTAMENTE una vez.
MUT = [
 ('TC-680', '01 el tiempo transcurrido del corazon maestro puede ser negativo',
  '    let dt=Math.max(0,Math.min(0.1,(now-last)/1000));last=now;',
  '    let dt=Math.min(0.1,(now-last)/1000);last=now;'),
 ('TC-680', '02 el parametro de la curva pierde el doble modulo',
  '        let u=(((p.u+flowT*fl.sp)%1)+1)%1;',
  '        let u=(p.u+flowT*fl.sp)%1;'),
 ('TC-680', '03 el parametro deja de acotarse antes de evaluar la curva',
  '        let q=fl.cu.getPointAt(Math.max(0,Math.min(1,u)));',
  '        let q=fl.cu.getPointAt(u);'),
 ('TC-680', '04 el reloj deja de ponerse en hora antes de arrancar el bucle',
  '  last = performance.now();\n  requestAnimationFrame(frame);',
  '  requestAnimationFrame(frame);'),
 ('TC-680', '05 el motor de la transposicion pierde su guarda del tiempo',
  '    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;',
  '    const dt = Math.min(0.1, (now - last) / 1000); last = now;'),
 ('TC-681', '06 la casilla sale del registro, asi que no llega al informe',
  "  Object.freeze({ id: 'otr_var_vcsip',     def: 'Vena cava superior izquierda persistente',           suma: null }),\n",
  ''),
 ('TC-681', '07 la casilla sube al EN SUMA, que es lo que suma:null impide',
  "Object.freeze({ id: 'otr_var_vcsip',     def: 'Vena cava superior izquierda persistente',           suma: null })",
  "Object.freeze({ id: 'otr_var_vcsip',     def: 'Vena cava superior izquierda persistente',           suma: 'VCSIP' })"),
 ('TC-681', '08 la casilla se mueve delante del seno coronario',
  "  Object.freeze({ id: 'otr_var_senocor',   def: 'Seno coronario dilatado',                             suma: null }),\n  Object.freeze({ id: 'otr_var_vcsip',     def: 'Vena cava superior izquierda persistente',           suma: null }),",
  "  Object.freeze({ id: 'otr_var_vcsip',     def: 'Vena cava superior izquierda persistente',           suma: null }),\n  Object.freeze({ id: 'otr_var_senocor',   def: 'Seno coronario dilatado',                             suma: null }),"),
 ('TC-681', '09 APLICA DE MAS: la casilla pasa a NO ser campo del estudio',
  '  return /^(login-|ig-|lab-|cfg-|exp-|filtro-|adv-|asoc-|pdf-|lgal-|fcg-|hfpep-|vauto-|vabchk-|vab-anim-|otr-asia-|pop-bcia-|pop-esp-|tga-3d-|cm3d-|mfs-fig-|vd-triv|ref-|(?:b-)?cine-)/.test(id);',
  '  return /^(login-|ig-|lab-|cfg-|exp-|filtro-|adv-|asoc-|pdf-|lgal-|fcg-|hfpep-|vauto-|vabchk-|vab-anim-|otr-asia-|pop-bcia-|pop-esp-|tga-3d-|cm3d-|otr_var_vcsip|mfs-fig-|vd-triv|ref-|(?:b-)?cine-)/.test(id);'),
 ('TC-682', '10 el panel vuelve a PRESTAR el recuadro de la transposicion',
  "  try { if (typeof cm3dSync === 'function') cm3dSync() } catch (e) {}\n  cc3dTextoSync();",
  "  try { const bx = document.getElementById('tga-3d-box'), ho = document.getElementById('cc3d-host');\n        if (bx && ho) { _cc3d.padre = bx.parentNode; _cc3d.antes = bx.nextSibling; ho.appendChild(bx) } } catch (e) {}\n  try { if (typeof cm3dSync === 'function') cm3dSync() } catch (e) {}\n  cc3dTextoSync();"),
 ('TC-682', '11 Eisenmenger deja de invertir el sentido de los cortocircuitos',
  '    let rev=(rl===undefined)?eis:rl;',
  '    let rev=(rl===undefined)?false:rl;'),
 ('TC-682', '12 Eisenmenger deja de dilatar la arteria pulmonar central',
  "    s.ar.push({p:_cmCat(CM_PAA_T,CM_PAA_R.slice(1)),c:CM_C.blue,r:[0.46,0.42],from:'L',bb:0.52},{p:CM_PAA_L,c:CM_C.blue,r:[0.13,0.13]});",
  "    s.ar.push({p:_cmCat(CM_PAA_T,CM_PAA_R.slice(1)),c:CM_C.blue,r:[0.30,0.24],from:'L',bb:0.30},{p:CM_PAA_L,c:CM_C.blue,r:[0.13,0.13]});"),
 ('TC-682', '13 la regla que dice que Fallot ya incluye la CIV se afloja',
  "if(b==='fal'){if(k==='civ'){return 'Fallot ya incluye la CIV';}",
  "if(b==='fal'){if(k==='civ'){return null;}"),
 ('TC-682', '14 la estenosis pulmonar deja de proteger del Eisenmenger',
  "  if(k==='eis'&&m.ep){return 'la estenosis pulmonar protege del Eisenmenger';}",
  "  if(k==='eis'&&m.ep){return null;}"),
 ('TC-682', '15 APLICA DE MAS: la CIA queda bloqueada tambien sobre el corazon normal',
  "  if(b==='fon'&&['cia','civ','dap','vap','ep','eis','cvpa'].indexOf(k)>=0){return 'no aplica con la circulación de Fontan';}",
  "  if(k==='cia'){return 'no aplica';}\n  if(b==='fon'&&['cia','civ','dap','vap','ep','eis','cvpa'].indexOf(k)>=0){return 'no aplica con la circulación de Fontan';}"),
 ('TC-682', '16 los controles del dibujo pasan a ser campos del estudio (la PRIMERA lista)',
  '|tga-3d-|cm3d-|mfs-fig-|',
  '|tga-3d-|mfs-fig-|'),
 ('TC-682', '17 y la SEGUNDA lista pierde el prefijo, que es la que decide «tiene datos»',
  '|pop-esp-|tga-3d-|cm3d-|centro_tipo$|',
  '|pop-esp-|tga-3d-|centro_tipo$|'),
 ('TC-682', '18 los controles pierden data-ui, que es la TERCERA lista',
  '<input type="checkbox" id="cm3d-ins" data-ui checked>',
  '<input type="checkbox" id="cm3d-ins" checked>'),
 ('TC-683', '19 los botones de modo vuelven a la clase .active que showTab barre',
  'class="btn btn-ghost cm3d-sg cm3d-md" data-m="estudio" aria-pressed="true"',
  'class="btn btn-ghost cm3d-sg cm3d-md active" data-m="estudio" aria-pressed="true"'),
 ('TC-683', '20 el modo que abre por omision pasa a ser Explorar',
  "  modo:'estudio',",
  "  modo:'explorar',"),
 ('TC-683', '21 la tabla lateral pierde las combinaciones frecuentes',
  "  sec('Combinaciones frecuentes');",
  "  if(false)sec('Combinaciones frecuentes');"),
 ('TC-683', '22 las filas que no se combinan dejan de apagarse',
  '  CM_TBM.forEach(function(m){let why=cmBloqueado(m[0], _cm3d.S);',
  '  CM_TBM.forEach(function(m){let why=null;cmBloqueado(m[0], _cm3d.S);'),
 ('TC-683', '23 lo elegido en Explorar sobrevive al volver al modo estudio',
  "  if (m === 'estudio') { cmDesdeEstudio(); }",
  "  if (m === 'estudio') { }"),
 ('TC-683', '24 el globo deja de cerrarse con Escape Y con un clic afuera (las DOS mitades: con una sola, la otra lo tapa)',
  "  if (ip.contains(ev.target) || (b && b.contains(ev.target))) return;\n  cmInfoCerrar();\n});\ndocument.addEventListener('keydown', function (ev) {\n  if (ev.key === 'Escape') cmInfoCerrar();",
  "  if (ip.contains(ev.target) || (b && b.contains(ev.target))) return;\n});\ndocument.addEventListener('keydown', function (ev) {\n  if (ev.key === 'EscapeXX') cmInfoCerrar();"),
 ('TC-683', '25 el globo deja de cerrarse con un clic afuera',
  '  if (ip.contains(ev.target) || (b && b.contains(ev.target))) return;\n  cmInfoCerrar();',
  '  if (ip.contains(ev.target) || (b && b.contains(ev.target))) return;'),
 ('TC-683', '26 APLICA DE MAS: el panel del globo nace ABIERTO',
  '<div class="cm3d-ip" id="cm3d-ip" hidden>',
  '<div class="cm3d-ip" id="cm3d-ip">'),
 ('TC-684', '27 la CIA primum vuelve a decir «hendidura de la valvula mitral»',
  'que con frecuencia lleva una hendidura de la válvula auriculoventricular izquierda.',
  'que con frecuencia lleva una hendidura de la válvula mitral.'),
 ('TC-684', '28 la CIV de entrada vuelve a la «porcion posterior» que la fuente no dice',
  'Se ubica en el tabique de entrada, inmediatamente por debajo del aparato valvular auriculoventricular',
  'Se ubica en la porción posterior del tabique, junto a las válvulas auriculoventriculares'),
 ('TC-684', '29 la estenosis pulmonar vuelve a decir que la arteria se dilata DESPUES de la obstruccion',
  'La arteria pulmonar puede dilatarse por alteraciones de su propia pared, con independencia de la hemodinámica.',
  'La arteria pulmonar se dilata después de la obstrucción.'),
 ('TC-684', '30 la supravalvular aortica pierde los ostium coronarios de su fuente',
  'Aparece como un diafragma fibroso justo por encima de los ostium coronarios',
  'La aorta se estrecha justo por encima de los senos'),
 ('TC-684', '31 vuelve la frase «A verificar por Code», que no puede entrar a la app',
  "'ESC 2020 de cardiopatías congénitas del adulto, hoja 48, folio 610:",
  "'A verificar por Code. ESC 2020 de cardiopatías congénitas del adulto, hoja 48, folio 610:"),
 ('TC-684', '32 APLICA DE MAS: el texto de la cava izquierda vuelve a afirmar el seno dilatado',
  'Una vena adicional del lado izquierdo cuyo drenaje puede ser al seno coronario',
  'Una vena adicional del lado izquierdo que desemboca en el seno coronario, que se dilata, o'),
 ('TC-684', '33 la ventana aortopulmonar deja de declarar que la biblioteca no la trata',
  'cerca de las válvulas. Ninguna de las dos guías de cardiopatías congénitas del adulto de la biblioteca trata esta lesión, así que este texto no publica contenido de guía.',
  'cerca de las válvulas.'),
 ('TC-685', '34 la CIA deja de leer su tipo de la pestania',
  "  cia:  Object.freeze({ campo:'ete_cia_tipo',   mapa: Object.freeze({ secundum:'sec', primum:'pri', sv_vcs:'sv' }), omision:'sec' }),",
  "  cia:  Object.freeze({ campo:'ete_cia_tipo',   mapa: Object.freeze({}), omision:'sec' }),"),
 ('TC-685', '35 la CIV de entrada se dibuja como perimembranosa',
  "perimembranosa:'pm', muscular:'mus', infundibular:'sal', inlet:'ent'",
  "perimembranosa:'pm', muscular:'mus', infundibular:'sal', inlet:'pm'"),
 ('TC-685', '36 lo que no tiene variante deja de declararse y se INVENTA un dibujo',
  '    if (!var_) { omit.push(k); return }   /* cargada, pero su opcion no tiene variante */',
  "    if (!var_) { S.mods[k] = Object.keys(r.mapa).length ? r.mapa[Object.keys(r.mapa)[0]] : 'std'; return }"),
 ('TC-685', '37 la CIA de seno venoso vuelve a leerse del ESPEJO, que publica un centinela',
  "  if (S.mods.cvpa && S.mods.cia === 'sv') S.ck.svs = true;",
  "  if (S.mods.cvpa && String((document.getElementById('cvpa_cia_ro') || {}).value || '').trim()) S.ck.svs = true;"),
 ('TC-685', '38 la direccion cargada en la pestania deja de respetarse',
  "    if (d === 'di') S.dir[k] = true;        /* de derecha a izquierda: azul */",
  "    if (d === 'di') S.dir[k] = undefined;"),
 ('TC-685', '39 APLICA DE MAS: «bidireccional» pasa a forzarse como derecha a izquierda',
  "    else if (d === 'id') S.dir[k] = false;  /* de izquierda a derecha: roja */",
  "    else if (d === 'id') S.dir[k] = false; else if (d === 'bi') S.dir[k] = true;"),
 ('TC-685', '40 la transposicion vuelve a caer en la lista de «no dibujadas»',
  "const CC3D_PROPIO = Object.freeze(['tga']);",
  'const CC3D_PROPIO = Object.freeze([]);'),
 ('TC-685', '41 el repintador sale de ESPEJOS_VIVOS, que es el registro del gesto',
  "             pintores que escriben campos del estudio. */\n          'cm3dEstudioSync'];",
  '             pintores que escriben campos del estudio. */\n          ];'),
]

SOLO = set()
if '--solo' in sys.argv:
    SOLO = set(int(x) for x in sys.argv[sys.argv.index('--solo') + 1].split(','))

ORIG = IDX + '.mutorig'
shutil.copy2(IDX, ORIG)
MD5_0 = md5(IDX)
print('md5 del arbol antes del barrido:', MD5_0)
muertas, vivas, noaplica = [], [], []
try:
    for i, (caso, nombre, viejo, nuevo) in enumerate(MUT, 1):
        if SOLO and i not in SOLO:
            continue
        with open(ORIG, encoding='utf-8') as f:
            s = f.read()
        n = s.count(viejo)
        if n != 1:
            noaplica.append((i, nombre, 'el ancla aparece %d veces' % n))
            print('  %02d NO APLICA  %s  (ancla x%d)' % (i, nombre, n))
            continue
        with open(IDX, 'w', encoding='utf-8') as f:
            f.write(s.replace(viejo, nuevo, 1))
        r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=RAIZ, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        if 'RESULTADO' not in out:
            noaplica.append((i, nombre, 'NO CORRIO: el suite no publico RESULTADO'))
            print('  %02d NO CORRIO  %s' % (i, nombre))
        elif ' CON FALLAS' in out:
            muertas.append((i, nombre))
            print('  %02d MUERTA    %s  [%s]' % (i, nombre, caso))
        else:
            vivas.append((i, nombre, caso))
            print('  %02d SOBREVIVIO %s  [%s]  <-- COBERTURA QUE FALTA' % (i, nombre, caso))
finally:
    shutil.copy2(ORIG, IDX)
    os.remove(ORIG)

print()
print('md5 del arbol despues del barrido:', md5(IDX))
print('GUARDA DE md5:', 'OK - identico' if md5(IDX) == MD5_0 else 'XX EL ARBOL CAMBIO')
print('RESUMEN: %d muertas / %d sobrevivieron / %d no aplicaron' % (len(muertas), len(vivas), len(noaplica)))
for i, n, c in vivas:
    print('   SOBREVIVIO %02d %s [%s]' % (i, n, c))
for i, n, m2 in noaplica:
    print('   NO APLICO  %02d %s (%s)' % (i, n, m2))
