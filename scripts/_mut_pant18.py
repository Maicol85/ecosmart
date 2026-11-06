#!/usr/bin/env python3
"""_mut_pant18.py — barrido de mutaciones dirigidas de la tanda PANT-18.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso: sin eso el servidor del suite lee el archivo viejo y la mutacion sale
«sobrevivio» sobre un defecto que, aplicado a mano, pone el caso en rojo (P14c-i).
"""
import os, re, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest()[:8]

VIVO = os.path.join(RAIZ,'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT,'index.html')

# (nombre, caso(s), [(buscar, reemplazar), ...])
MUT = [
 ('01 el espejo pasa a ser campo guardado (sale de _noEsDelEstudio)','TC-723',
  [("|pop-esp-|va-esp-|tga-3d-|cm3d-|mfs-fig-|vd-triv|ref-|(?:b-)?cine-","|pop-esp-|tga-3d-|cm3d-|mfs-fig-|vd-triv|ref-|(?:b-)?cine-")]),
 ('02 el espejo sale de _CAMPOS_FUERA_DEL_ESTUDIO','TC-723',
  [("|pop-bcia-|pop-esp-|va-esp-|tga-3d-|cm3d-|centro_tipo$","|pop-bcia-|pop-esp-|tga-3d-|cm3d-|centro_tipo$")]),
 ('03 el espejo copia en UN SOLO sentido','TC-723',
  [("    const src = (origenId === 'va-esp-et') ? b : a;\n    const dst = (origenId === 'va-esp-et') ? a : b;",
    "    const src = a;\n    const dst = b;")]),
 ('04 el vacio NO se copia','TC-723',
  [("    if (dst.value === src.value) return { copio: false, valor: src.value };\n    dst.value = src.value;\n    return { copio: true, valor: src.value };\n  } finally { _etEspSinc = false; }",
    "    if (dst.value === src.value || src.value === '') return { copio: false, valor: src.value };\n    dst.value = src.value;\n    return { copio: true, valor: src.value };\n  } finally { _etEspSinc = false; }")]),
 ('05 el borde 0,37 del AT/ET pasa a significativa (operador no estricto)','TC-723',
  [("  const nivel = _eaProtNivel(v, EA_PROT_CRIT.atet_normal_max, EA_PROT_CRIT.atet_signif_min, true, true);",
    "  const nivel = _eaProtNivel(v, EA_PROT_CRIT.atet_normal_max, EA_PROT_CRIT.atet_signif_min, true, false);")]),
 ('06 el borde 0,32 del AT/ET cae en normal','TC-723',
  [("  const v = _eaAtEtVal();\n  if (v == null) { cel.innerHTML = '&#8212;'; return; }",
    "  let v = _eaAtEtVal();\n  if (v == null) { cel.innerHTML = '&#8212;'; return; }\n  if (v === 0.32) v = 0.31;")]),
 ('07 se retira la guarda de AT menor que ET','TC-723',
  [("  if (!(at < et)) return null;\n  return at / et;","  return at / et;")]),
 ('08 el AT/ET se calcula con el ET vacio','TC-723',
  [("  if (at == null || et == null) return null;","  if (at == null) return null;\n  if (et == null) return at / 300;")]),
 ('09 la fila del AT/ET no se esconde con valvula nativa','TC-723',
  [("  if (fila) fila.style.display = esProt ? '' : 'none';\n  if (!cel) return;\n  if (!esProt) { cel.innerHTML = '&#8212;'; return; }",
    "  if (fila) fila.style.display = '';\n  if (!cel) return;\n  if (!esProt) { return; }")]),
 ('10 el espejo NO se repinta desde el dueno en el embudo','TC-723',
  [("  try { etEspSync('tango_te'); } catch (e) {}\n","")]),
 ('11 la nota del AT vuelve a enfrentar la Figura 13 con la Tabla 5','TC-724',
  [("'de esa misma guía usa los dos —el AT con ' + AT_PROT_POSIBLE_MAX + ' ms y el AT/ET con ' +",
    "'de esa misma guía usa 100 ms como único punto de corte, así que la banda 80-100 ms no es sospechosa por ese camino. El AT/ET con ' +")]),
 ('12 la nota del AT pierde su hoja y su folio','TC-724',
  [("'del chorro (ASE 2024, hoja 18, folio 19).';","'del chorro.';")]),
 ('13 la nota le atribuye la funcion ventricular tambien al cociente','TC-724',
  [("'estenosis protésica, porque la nota general de la Tabla 5 pide un parámetro que depende ' +\n      'del flujo (velocidad pico o gradiente medio) y otro que no (AEO o DVI). El AT, además, se ' +\n      'afecta por la función del ventrículo izquierdo y por la frecuencia cardíaca. La Figura 13 ' +",
    "'estenosis protésica, porque la nota general de la Tabla 5 pide un parámetro que depende ' +\n      'del flujo (velocidad pico o gradiente medio) y otro que no (AEO o DVI). Los dos se ' +\n      'afectan por la función del ventrículo izquierdo y por la frecuencia cardíaca. La Figura 13 ' +")]),
 ('14 se mueve el corte normal del AT a 70 ms','TC-724',
  [("const AT_PROT_NORMAL_MAX  = 80;","const AT_PROT_NORMAL_MAX  = 70;")]),
 ('15 el AT/ET pasa a VOTAR en el veredicto','TC-724',
  [("  const dep   = [nv.vmax, nv.gmed].filter(Boolean);","  const dep   = [nv.vmax, nv.gmed, nv.atet].filter(Boolean);")]),
 ('16 se retira el bloque del AT y el AT/ET de Referencias','TC-724',
  [("<b style=\"color:var(--accent2);\">AT y AT/ET (ASE 2024, Tabla 5, hoja 18 &middot; folio 19):</b>",
    "<b style=\"color:var(--accent2);\">Tiempos:</b>")]),
 ('17 Referencias publica un tramo del AT/ET equivocado','TC-724',
  [("<b>AT/ET</b> (el AT dividido por el tiempo de eyecci&oacute;n del ventr&iacute;culo izquierdo)<b>:</b> &lt;0,32 normal",
    "<b>AT/ET</b> (el AT dividido por el tiempo de eyecci&oacute;n del ventr&iacute;culo izquierdo)<b>:</b> &lt;0,30 normal")]),
 ('18 la ficha de Referencias gana un globo','TC-724',
  [("<b style=\"color:var(--accent2);\">AT y AT/ET (ASE 2024, Tabla 5, hoja 18 &middot; folio 19):</b>",
    "<button type=\"button\" class=\"vinfo-btn\" data-vinfo=\"ea-prot-ppm\" onclick=\"vInfoClic(this)\">&#9432;</button><b style=\"color:var(--accent2);\">AT y AT/ET (ASE 2024, Tabla 5, hoja 18 &middot; folio 19):</b>")]),
 ('19 la tarjeta vuelca TODAS las salvedades a la vista, sin plegable','TC-725',
  [("    if (sal.length) {\n      h += '<details ","    if (false && sal.length) {\n      h += '<details ")]),
 # ⚠️ REESCRITA: la primera version le pegaba un .replace a un literal que NO contiene «<details»,
 # asi que no inyectaba ningun defecto y sobrevivia por eso y no por falta de cobertura.
 ('20 el plegable nace ABIERTO','TC-725',
  [("h += '<details style=\"margin:6px 0 0;","h += '<details open style=\"margin:6px 0 0;")]),
 ('21 al nivel normal se le inventa una conclusion','TC-725',
  [("  return cuerpo ? (cuerpo.charAt(0).toUpperCase() + cuerpo.slice(1) + '.') : '';",
    "  return 'Ningún eje en rango de estenosis significativa' + (cuerpo ? ' (' + cuerpo + ')' : '') + '.';")]),
 ('22 se levanta el tope de dos avisos','TC-725',
  [("  return a.slice(0, 2);","  return a;")]),
 ('23 vuelve la salida temprana de TAVI (sin graduar)','TC-726',
  [("  nv.gmed = _eaProtNivel(gmed, EA_PROT_CRIT.savr_gmed_normal_max, EA_PROT_CRIT.savr_gmed_signif_min, true);",
    "  if (esTavi) return { via:'TAVI', niveles:nv, gmed:gmed, dvi:dvi, dviNivel:_dviNivel, vmax:vmax, at:at, atet:atet, vs:vs, sinGraduar:true, eoaEvaluable:false, avai:avai, avaiMotivo:avaiMotivo, ppm:ppmAo, ppmCortes:ppmCortesAo, imc:imcAo };\n  nv.gmed = _eaProtNivel(gmed, EA_PROT_CRIT.savr_gmed_normal_max, EA_PROT_CRIT.savr_gmed_signif_min, true);")]),
 ('24 la TAVI pierde su salvedad del basal','TC-726',
  [("  if (P.via === 'TAVI') salv.push(EA_PROT_SALV.tavi);\n","")]),
 ('25 la salvedad del basal sale TAMBIEN en la protesis quirurgica (de mas)','TC-726',
  [("  if (P.via === 'TAVI') salv.push(EA_PROT_SALV.tavi);","  salv.push(EA_PROT_SALV.tavi);")]),
 ('26 la salvedad de TAVI pierde su hoja y su folio','TC-726',
  [("'quirúrgica (ASE 2024, hoja 18, folio 19).',","'quirúrgica.',")]),
 ('27 se retira la condicion que calla el desajuste','TC-727',
  [("      if (_eaProtP && (_eaProtP.ppm === 'moderado' || _eaProtP.ppm === 'severo')\n          && _eaProtP.nivel !== 'signif') {",
    "      if (_eaProtP && (_eaProtP.ppm === 'moderado' || _eaProtP.ppm === 'severo')) {")]),
 ('28 el desajuste se calla TAMBIEN con «posible» (de mas)','TC-727',
  [("          && _eaProtP.nivel !== 'signif') {","          && _eaProtP.nivel !== 'signif' && _eaProtP.nivel !== 'posible') {")]),
 ('29 el desajuste no se escribe NUNCA (de mas)','TC-727',
  [("          && _eaProtP.nivel !== 'signif') {","          && false) {")]),
 ('30 el boton ESCRIBE ea_grado en vez de solo pintarlo','TC-728',
  [("      btn.textContent = 'Severidad ▼';\n      btn.classList.add('nivel' + _protNiv);",
    "      btn.textContent = 'Severidad ▼';\n      btn.classList.add('nivel' + _protNiv);\n      if (el) el.value = (_protNiv === 3) ? 'severa' : (_protNiv === 2 ? 'moderada' : 'leve');")]),
 ('31 el boton se pinta tambien con «falta un dato» (de mas)','TC-728',
  [("        if (_P && _P.nivel) _protNiv = (_P.nivel === 'signif') ? 3\n                                     : (_P.nivel === 'posible') ? 2\n                                     : (_P.nivel === 'normal') ? 1 : 0;",
    "        if (_P && _P.nivel) _protNiv = (_P.nivel === 'signif') ? 3\n                                     : (_P.nivel === 'posible') ? 2\n                                     : (_P.nivel === 'normal') ? 1 : 2;")]),
 ('32 la rama protesica gana sobre el grado fijado a mano','TC-728',
  [("    if (!txt && tipo === 'esten' && valv === 'aortica') {","    if (tipo === 'esten' && valv === 'aortica') {"),
   ("    if (!txt && _protNiv) {","    if (_protNiv) {")]),
 ('33 se retira la rama protesica del boton','TC-728',
  [("    if (!txt && tipo === 'esten' && valv === 'aortica') {","    if (false && tipo === 'esten' && valv === 'aortica') {")]),
 ('34 el boton conserva el circulo amarillo sobre el color','TC-728',
  [("      btn.textContent = 'Severidad ▼';\n      btn.classList.add('nivel' + _protNiv);",
    "      btn.textContent = '🟡 Severidad ▼';\n      btn.classList.add('nivel' + _protNiv);")]),
]

orig = open(IDX,encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0=time.time()
for i,(nom,casos,pares) in enumerate(MUT,1):
    s = orig
    ok = True
    for bus,rep in pares:
        if s.count(bus) != 1:
            noaplica.append((nom,'el ancla aparece %d veces'%s.count(bus))); ok=False; break
        s = s.replace(bus,rep)
    if not ok: print('  %02d NO APLICA  %s'%(i,nom)); continue
    with open(IDX,'w',encoding='utf-8') as f:
        f.write(s); f.flush(); os.fsync(f.fileno())
    # COMPROBAR que el archivo EN DISCO tiene la mutacion
    disco = open(IDX,encoding='utf-8').read()
    if disco != s:
        noaplica.append((nom,'el archivo en disco no coincide')); print('  %02d DISCO  %s'%(i,nom)); continue
    r = subprocess.run(['node','scripts/test_clinico.mjs','--solo',casos],
                       cwd=WT, capture_output=True, text=True, timeout=600)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        noaplica.append((nom,'el suite NO CORRIO')); print('  %02d NO CORRIO  %s'%(i,nom))
    elif '✗' in out:
        muertas.append(nom); print('  %02d MUERTA    %s'%(i,nom))
    else:
        vivas.append(nom); print('  %02d SOBREVIVIO %s   <<<'%(i,nom))
with open(IDX,'w',encoding='utf-8') as f:
    f.write(orig); f.flush(); os.fsync(f.fileno())
print('')
print('  %d/%d MUERTAS   %d sobrevivieron   %d no aplicaron   (%.1f min)'%(
    len(muertas),len(MUT),len(vivas),len(noaplica),(time.time()-t0)/60))
for n,m in noaplica: print('    NO APLICO: %s — %s'%(n,m))
for n in vivas: print('    SOBREVIVIO: %s'%n)
print('  md5 del arbol VIVO: antes %s  despues %s  %s'%(
    MD5_VIVO, md5(VIVO), 'IDENTICO' if MD5_VIVO==md5(VIVO) else '!!! CAMBIO !!!'))
