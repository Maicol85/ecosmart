#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_mut_p37.py - barrido de mutaciones dirigidas de la tanda PANT-37 (2026-11-11).
Calcado de _mut_p36.py. Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian
compara el md5 del index.html vivo al abrir y al cerrar y aborta si cambio. Escribe con flush +
fsync y comprueba que el archivo en disco tiene la mutacion antes de correr el caso. Cada
mutacion declara SU caso.

Las anclas se verifican con --anclas ANTES de correr el barrido: es lo que PANT-20 pago con una
corrida entera por un caracter mal copiado.

Rompe, una por una, las decisiones de la parte A -- donde va el boton, su piso tactil, el azul y
su condicion, las cuatro situaciones y el texto del globo --, las de la parte B -- el lugar del
panel, el acote, el tope del volumen, las formulas del flujo y del gradiente, la unidad del
tiempo de eyeccion, el corte de la linea de lectura, el dibujo y sus tres restituciones -- y las
de la parte C -- la ley del area, la proyeccion a 250, sus topes, la tercera grafica y la vuelta
a Fija --, mas los dos controles del censo.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')
orig = open(IDX, encoding='utf-8').read()

MUT = [
 # ══ PARTE A · el boton y su lugar ════════════════════════════════════════════════════════
 ('01 el boton no se agrega a ninguna tarjeta', 'TC-825',
  [("        try { _wiFilaBoton(li); } catch (e) {}",
    "        try { if (0) _wiFilaBoton(li); } catch (e) {}")]),
 ('02 el boton se agrega a TODAS las tarjetas de estenosis, no solo a la aortica', 'TC-825',
  [("      if (par[0] === 'v2d-esten' && WI_VALV_NOM && it.valv === WI_VALV_NOM) {",
    "      if (par[0] === 'v2d-esten') {")]),
 ('03 el boton se agrega tambien en la columna de insuficiencias', 'TC-825',
  [("      if (par[0] === 'v2d-esten' && WI_VALV_NOM && it.valv === WI_VALV_NOM) {",
    "      if (WI_VALV_NOM && it.valv === WI_VALV_NOM) {")]),
 ('04 la fila del boton deja de ser el ULTIMO hijo de la tarjeta', 'TC-825',
  [("  li.appendChild(fila);", "  li.insertBefore(fila, li.firstChild);")]),
 # ⚠️ LA PRIMERA VERSION DE ESTA MUTACION ERA EQUIVALENTE Y SOBREVIVIO: sacarle la clase `btn`
 # al boton NO le saca el piso de 44 px, porque ese piso sale de la regla GLOBAL de accesibilidad
 # de esta app (`button, [role=button], .btn, ... { min-height:44px }`) y no de la clase. Medido.
 # La mutacion de hoy ataca el piso de verdad, por estilo en linea.
 ('05 el boton pierde el piso tactil de 44 px', 'TC-825',
  [("  b.type = 'button'; b.className = 'btn'; b.id = 'wi-btn';",
    "  b.type = 'button'; b.className = 'btn'; b.id = 'wi-btn';\n  b.style.minHeight = '0px'; b.style.height = '20px';")]),
 # ══ PARTE A · el azul y la situacion ═════════════════════════════════════════════════════
 ('06 el boton se pinta de azul SIEMPRE', 'TC-825',
  [("  const azul = (sit === 'disc');", "  const azul = true;")]),
 ('07 el azul alcanza tambien a la concordante', 'TC-825',
  [("  const azul = (sit === 'disc');", "  const azul = (sit === 'disc' || sit === 'conc');")]),
 ('08 la discordancia deja de mirar la Vmax', 'TC-825',
  [("  const disc = !!(R && R.gAva === 'severa' && R.gVel !== 'severa' && R.gGrad !== 'severa');",
    "  const disc = !!(R && R.gAva === 'severa' && R.gGrad !== 'severa');")]),
 ('09 la discordancia deja de mirar el gradiente', 'TC-825',
  [("  const disc = !!(R && R.gAva === 'severa' && R.gVel !== 'severa' && R.gGrad !== 'severa');",
    "  const disc = !!(R && R.gAva === 'severa' && R.gVel !== 'severa');")]),
 ('10 el gradiente se pregunta por «moderada» y no por «no severa» (la trampa del bajo flujo)', 'TC-825',
  [("  const disc = !!(R && R.gAva === 'severa' && R.gVel !== 'severa' && R.gGrad !== 'severa');",
    "  const disc = !!(R && R.gAva === 'severa' && R.gVel !== 'severa' && R.gGrad === 'moderada');")]),
 ('11 la protesis deja de cortar y se trata como una valvula nativa', 'TC-825',
  [("  if (D.prot) return { sit: 'prot', falta: [], D: D };", "  if (false) return { sit: 'prot', falta: [], D: D };")]),
 ('12 el VDF sale de la lista de lo que falta', 'TC-825',
  [("  if (D.vdf  === null) falta.push(WI_FALTA_ROT.vdf);", "  if (false) falta.push(WI_FALTA_ROT.vdf);")]),
 ('13 un rotulo de la lista deja de ser el de la app', 'TC-825',
  [("  vs:   'Volumen latido (VSFVI o FEVI)', vdf: 'VDFVI'",
    "  vs:   'Volumen sistolico', vdf: 'VDFVI'")]),
 # ══ PARTE A · el globo ═══════════════════════════════════════════════════════════════════
 ('14 el globo cambia una palabra de su primera linea', 'TC-826',
  [("  Object.freeze(['Aplica:', 'estenosis a\\u00f3rtica nativa con \\u00e1rea en rango severo y gradiente y Vmax por debajo del rango severo, sobre todo con bajo flujo (volumen sist\\u00f3lico indexado menor de 35 mL/m\\u00b2).']),",
    "  Object.freeze(['Aplica:', 'estenosis a\\u00f3rtica nativa con \\u00e1rea en rango severo y gradiente o Vmax por debajo del rango severo, sobre todo con bajo flujo (volumen sist\\u00f3lico indexado menor de 35 mL/m\\u00b2).']),")]),
 ('15 el titulo del globo pierde el id que la tarjeta nombra en su aria-labelledby', 'TC-826',
  [("  h.id = 'vinfo-tit';\n  h.textContent = 'Cu\\u00e1ndo aplica el What if';",
    "  h.id = 'vinfo-tit-wi';\n  h.textContent = 'Cu\\u00e1ndo aplica el What if';")]),
 ('16 un parrafo del globo declara su propio tamanio de letra', 'TC-826',
  [("    e.style.margin = '0 0 6px';", "    e.style.margin = '0 0 6px'; if (!rot) e.style.fontSize = '12px';")]),
 # ══ PARTE B · el panel y su lugar ════════════════════════════════════════════════════════
 ('17 el panel sale desde la derecha de la columna: se mete encima del dibujo', 'TC-827',
  [("#wi-panel{position:absolute;top:100%;left:0;margin-top:6px;width:300px;max-width:88vw;z-index:6;",
    "#wi-panel{position:absolute;top:100%;right:0;margin-top:6px;width:300px;max-width:88vw;z-index:6;")]),
 ('18 el panel nace ARRIBA de la tarjeta y no debajo', 'TC-827',
  [("#wi-panel{position:absolute;top:100%;left:0;margin-top:6px;width:300px;max-width:88vw;z-index:6;",
    "#wi-panel{position:absolute;top:0;left:0;margin-top:6px;width:300px;max-width:88vw;z-index:6;")]),
 ('19 el panel se oculta con hidden en vez de con la clase', 'TC-827',
  [(".wi-oculto{display:none!important;}", ".wi-oculto{}")]),
 ('20 la primera linea de la situacion discordante cambia una palabra', 'TC-827',
  [("  disc: 'Situación: área en rango severo con Vmax y gradiente por debajo del rango severo (discordante). Acá el What if sirve.',",
    "  disc: 'Situación: área en rango severo con Vmax y gradiente por debajo del rango severo (discordante). Acá el What if ayuda.',")]),
 ('21 el tope del volumen sistolico pasa a ser el VDF entero, sin margen', 'TC-827',
  [("const WI_VS_MARGEN = 2;   /* mL de residuo minimo: con VS = VDF el ventriculo se cierra a un",
    "const WI_VS_MARGEN = 0;   /* mL de residuo minimo: con VS = VDF el ventriculo se cierra a un")]),
 ('22 los controles NO se apagan cuando faltan datos', 'TC-827',
  [("    .forEach(function(id){ const e = _wiEl(id); if (e) e.disabled = !on; });",
    "    .forEach(function(id){ const e = _wiEl(id); if (e) e.disabled = false; });")]),
 ('23 el tiempo de eyeccion no se pasa a segundos: el flujo sale mil veces mas chico', 'TC-827',
  [("  const et = (etMs !== null && etMs > 0) ? (etMs / 1000) : null;",
    "  const et = (etMs !== null && etMs > 0) ? etMs : null;")]),
 # ══ PARTE B · las formulas ═══════════════════════════════════════════════════════════════
 ('24 el flujo incorpora la frecuencia: deja de ser el de la eyeccion', 'TC-828',
  [("  const q0 = vs0 / et, q1 = vs1 / et, r = q0 > 0 ? (q1 / q0) : 1;",
    "  const q0 = vs0 / et * (D.fcEf / 60), q1 = vs1 / et * (fc1 / 60), r = q0 > 0 ? (q1 / q0) : 1;")]),
 ('25 el gradiente va LINEAL con el flujo en vez de con su cuadrado', 'TC-828',
  [("    return g0 * k * k;", "    return g0 * k;")]),
 ('26 la Vmax va con el CUADRADO del flujo en vez de lineal', 'TC-828',
  [("    return v0 * (q / q0) * (a0 / areaDe(q));",
    "    return v0 * (q / q0) * (q / q0) * (a0 / areaDe(q));")]),
 ('27 el corte de la linea de lectura se escribe a mano en vez de leerse de EA_BANDAS', 'TC-828',
  [("function _wiCorteG(){ try { return EA_BANDAS.gmedSevMin; } catch (e) { return null; } }",
    "function _wiCorteG(){ return 50; }")]),
 ('28 el pie del panel cambia el tope por el VDF', 'TC-827',
  [("  if (fn) fn.textContent = 'Solo mueve el dibujo 2D. VS máx. ' + _wiEnt(C.vsMax)",
    "  if (fn) fn.textContent = 'Solo mueve el dibujo 2D. VS máx. ' + _wiEnt(C.vdf)")]),
 # ══ PARTE B · el dibujo ══════════════════════════════════════════════════════════════════
 ('29 el dibujo recibe un valor absoluto: con nada movido ya no es identico al real', 'TC-829',
  [("    _wi = { amp: clamp(AMP[S.kvi] * ar, 0.10, 1) };",
    "    _wi = { amp: clamp(0.5 * ar, 0.10, 1) };")]),
 ('30 el rotulo de la Vmax simulada no se apaga al cerrar', 'TC-829',
  [("    } else { t.textContent = ''; t.classList.add('wi-oculto'); }",
    "    } else { t.classList.remove('wi-oculto'); }")]),
 ('31 cerrar el panel no devuelve el dibujo a lo real', 'TC-829',
  [("  try { if (typeof v2dWhatIf === 'function') v2dWhatIf(null); } catch (e) {}\n  const b = _wiEl('wi-btn'); if (b) b.setAttribute('aria-expanded', 'false');",
    "  const b = _wiEl('wi-btn'); if (b) b.setAttribute('aria-expanded', 'false');")]),
 ('32 «Nuevo estudio» deja el panel abierto: v2dCerrar no lo cierra', 'TC-829',
  [("  try { if (typeof wiCerrar === 'function') wiCerrar(); } catch (e) {}",
    "  try { if (0 && typeof wiCerrar === 'function') wiCerrar(); } catch (e) {}")]),
 # ══ PARTE C ══════════════════════════════════════════════════════════════════════════════
 ('33 la ley del area deja de ser lineal con el flujo', 'TC-830',
  [("  const x = Number(a0) + Number(m) * (Number(q) - Number(q0)) / 100;",
    "  const x = Number(a0) * Math.pow(Number(q) / Number(q0), Number(m));")]),
 ('34 la proyeccion se hace a 200 mL/s y no a 250', 'TC-830',
  [("  o.a250 = (_wiSim.area === 'abre') ? wiAreaEn(a0, _wiSim.m, q0, 250) : a0;",
    "  o.a250 = (_wiSim.area === 'abre') ? wiAreaEn(a0, _wiSim.m, q0, 200) : a0;")]),
 ('35 la ley del area pierde sus dos topes', 'TC-830',
  [("  return _wiCl(isFinite(x) ? x : 0, 0.15, 2.5);",
    "  return isFinite(x) ? x : 0;")]),
 ('36 la tercera grafica se muestra tambien en modo Fija', 'TC-830',
  [("  if (g3) g3.classList.toggle('wi-oculto', !abre);", "  if (g3) g3.classList.remove('wi-oculto');")]),
 ('37 el deslizador de apertura y su nota se ven tambien en modo Fija', 'TC-830',
  [("  if (nt) nt.classList.toggle('wi-oculto', !abre);", "  if (nt) nt.classList.remove('wi-oculto');")]),
 ('38 el corte del area de la linea de lectura se escribe a mano', 'TC-830',
  [("      const sev = (typeof AVA_SEVERA_MAX === 'number') ? AVA_SEVERA_MAX : 1.0;",
    "      const sev = 1.2;")]),
 ('39 «Volver a lo medido» no devuelve el modo del area ni la apertura inicial', 'TC-830',
  [("  _wiSim.area = 'fija';\n  _wiSim.s1 = null; _wiSim.fc = null; _wiSim.m = WI_M_INI;",
    "  _wiSim.s1 = null; _wiSim.fc = null;")]),
 # ══ los dos controles del censo ══════════════════════════════════════════════════════════
 ('40 el prefijo wi- sale de _noEsDelEstudio: los controles entran al censo del estudio', 'TC-831',
  [("  return /^(wi-|login-|ig-|lab-|cfg-|", "  return /^(login-|ig-|lab-|cfg-|")]),
 ('41 el prefijo wi- sale de _CAMPOS_FUERA_DEL_ESTUDIO', 'TC-831',
  [("var _CAMPOS_FUERA_DEL_ESTUDIO = /^(wi-|cfg-|", "var _CAMPOS_FUERA_DEL_ESTUDIO = /^(cfg-|")]),
]

muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 and sys.argv[2] != '--anclas' else None
if len(sys.argv) > 2 and sys.argv[2] == '--anclas':
    mal = 0
    for i, (nom, casos, pares) in enumerate(MUT, 1):
        for bus, rep in pares:
            c = orig.count(bus)
            if c != 1:
                mal += 1
                print('  %02d ANCLA x%d  %s' % (i, c, nom))
    print('  anclas que NO aparecen exactamente una vez: %d de %d mutaciones' % (mal, len(MUT)))
    sys.exit(0)
for i, (nom, casos, pares) in enumerate(MUT, 1):
    if SOLO and ('%02d' % i) not in SOLO: continue
    s = orig; ok = True
    for bus, rep in pares:
        if s.count(bus) != 1:
            noaplica.append((nom, 'el ancla aparece %d veces' % s.count(bus))); ok = False; break
        s = s.replace(bus, rep)
    if not ok: print('  %02d NO APLICA  %s' % (i, nom), flush=True); continue
    with open(IDX, 'w', encoding='utf-8') as f:
        f.write(s); f.flush(); os.fsync(f.fileno())
    if open(IDX, encoding='utf-8').read() != s:
        noaplica.append((nom, 'el archivo en disco no coincide')); print('  %02d DISCO  %s' % (i, nom), flush=True); continue
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', casos],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    # ⚠️ LOS CHROME ZOMBIES SE JUNTAN Y CADA CORRIDA SALE MAS LENTA QUE LA ANTERIOR. Es la trampa
    # que este repo ya documenta para cdp.mjs: el servidor sigue escuchando y el event loop vivo,
    # asi que el arbol de Chrome no se cierra. Medido en la primera corrida de este barrido: la
    # cuarta mutacion tardaba cuatro veces lo que la primera. Se barren los del arbol de pruebas
    # -- NUNCA el Chrome del usuario, que no corre con --user-data-dir en /tmp.
    subprocess.run(['pkill', '-f', 'ecosmart-test-'], capture_output=True)
    if 'RESULTADO' not in out:
        noaplica.append((nom, 'el suite NO CORRIO')); print('  %02d NO CORRIO  %s' % (i, nom), flush=True)
    elif chr(10007) in out:
        muertas.append(nom); print('  %02d MUERTA    %s' % (i, nom), flush=True)
    else:
        vivas.append(nom); print('  %02d SOBREVIVIO %s   <<<' % (i, nom), flush=True)
with open(IDX, 'w', encoding='utf-8') as f:
    f.write(orig); f.flush(); os.fsync(f.fileno())
print('')
print('  %d/%d MUERTAS   %d sobrevivieron   %d no aplicaron   (%.1f min)' % (
    len(muertas), len(MUT) if not SOLO else len(SOLO), len(vivas), len(noaplica), (time.time() - t0) / 60))
for n, m in noaplica: print('    NO APLICO: %s - %s' % (n, m))
for n in vivas: print('    SOBREVIVIO: %s' % n)
print('  md5 del arbol VIVO: antes %s  despues %s  %s' % (
    MD5_VIVO, md5(VIVO), 'IDENTICO' if MD5_VIVO == md5(VIVO) else '!!! CAMBIO !!!'))
