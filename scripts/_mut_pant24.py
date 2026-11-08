#!/usr/bin/env python3
"""_mut_pant24.py - barrido de mutaciones dirigidas de la tanda PANT-24.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso (P14c-i).
Cada mutacion declara SU caso: con un reparto mal hecho, un hueco queda tapado por el caso de
otro commit.
Las anclas llevan el CARACTER REAL y no secuencias \\uXXXX, que es por lo que siete de PANT-19
no aplicaron. Se verifican con `--anclas` ANTES de correr el barrido.
"""
import os, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p, 'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ, 'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT, 'index.html')

MUT = [
 # ══ COMMIT 2 · LA TAVI NORMOFUNCIONANTE ══════════════════════════════════════
 ('01 la marca dice SI siempre: cualquier protesis aortica sale normofuncionante', 'TC-757',
  [("  const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' && (function(){",
    "  const _normoTavi = true && (function(){")]),
 ('02 la marca dice NO siempre: vuelve el defecto que el medico reporto', 'TC-757',
  [("  const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' && (function(){",
    "  const _normoTavi = false && (function(){")]),
 ('03 la marca deja de pedir la via TAVI: una protesis quirurgica sin datos tambien la recibe', 'TC-757',
  [("P.via === 'TAVI' && P.nivel === 'faltan' && (function(){",
    "P.nivel === 'faltan' && (function(){")]),
 ('04 la marca deja de pedir el nivel: una TAVI que YA gradua tambien la recibe', 'TC-757',
  [("P.via === 'TAVI' && P.nivel === 'faltan' && (function(){",
    "P.via === 'TAVI' && (function(){")]),
 ('05 la marca deja de exigir que los niveles medidos sean normales: Vmax 4,5 sin DVI sale normofuncionante', 'TC-757',
  [("    return Object.keys(nv).every(function (k) { return nv[k] == null || nv[k] === 'normal'; });",
    "    return Object.keys(nv).every(function (k) { return true; });")]),
 ('06 la marca cuenta los niveles SIN medir como anormales: no sale nunca', 'TC-757',
  [("return nv[k] == null || nv[k] === 'normal';", "return nv[k] === 'normal';")]),
 ('07 la insuficiencia deja de bloquear: «normofuncionante, con insuficiencia severa»', 'TC-757',
  [("      const _normoT = !!_eaProtN.normoTavi && !insE && _normoRpvOk;",
    "      const _normoT = !!_eaProtN.normoTavi && _normoRpvOk;")]),
 ('08 la regurgitacion PARAVALVULAR deja de bloquear: es el defecto que TC-289 cazo', 'TC-757',
  [("      const _normoT = !!_eaProtN.normoTavi && !insE && _normoRpvOk;",
    "      const _normoT = !!_eaProtN.normoTavi && !insE;")]),
 ('09 el EN SUMA no emite su renglon: la frase del cuerpo queda sin resumen', 'TC-757',
  [("      if (_normoT) suma.push(EA_PROT_NORMO.suma);",
    "      if (false) suma.push(EA_PROT_NORMO.suma);")]),
 ('10 el EN SUMA emite ADEMAS el resumen de la rama de siempre: dos renglones de la misma valvula', 'TC-757',
  [("      if (_normoT) suma.push(EA_PROT_NORMO.suma);\n      else if (_eaProtN.resumen)",
    "      if (_normoT) suma.push(EA_PROT_NORMO.suma);\n      if (_eaProtN.resumen)")]),
 ('11 la frase del cuerpo cambia de palabra', 'TC-757',
  [("  frase: 'normofuncionante',", "  frase: 'sin disfuncion',")]),
 ('12 la frase pierde el parentesis de medidas: desaparece un numero medido del papel', 'TC-757',
  [("    normoFrase: EA_PROT_NORMO.frase + med,", "    normoFrase: EA_PROT_NORMO.frase,")]),
 ('13 el veredicto vuelve a calcular el cociente por su cuenta: reabre P18-b', 'TC-758',
  [("  const atet = _eaAtEtVal();",
    "  const atet = (at != null && et != null && et > 0) ? (at / et) : null;")]),
 ('14 el dueno de la fila pierde su guarda: el 1,67 vuelve a clasificarse y a publicarse', 'TC-758',
  [("  if (!(at < et)) return null;\n  return at / et;", "  return at / et;")]),
 ('15 el dueno del «por que» dice SI siempre: la fila nunca muestra la raya', 'TC-758',
  [("  if (at == null || et == null) return false;\n  if (!(at > 0) || !(et > 0)) return false;\n  return !(at < et);",
    "  if (at == null || et == null) return true;\n  if (!(at > 0) || !(et > 0)) return false;\n  return !(at < et);")]),
 ('16 el «por que» usa el operador estricto: el 1 EXACTO se cuela', 'TC-758',
  [("  return !(at < et);\n}\nwindow._eaAtEtRevisar", "  return (at > et);\n}\nwindow._eaAtEtRevisar")]),
 ('17 la fila deja de consultarlo: vuelve la raya', 'TC-758',
  [("  if (_eaAtEtRevisar()) { cel.innerHTML = badge('gray', 'Revisar los valores'); return; }",
    "  if (false) { cel.innerHTML = badge('gray', 'Revisar los valores'); return; }")]),
 ('18 la fila vuelve al punto decimal', 'TC-758',
  [("  const txt = v.toFixed(2).replace('.', ',');", "  const txt = v.toFixed(2);")]),
 ('19 el aviso vuelve al punto decimal', 'TC-758',
  [("' AT/ET (' + P.atet.toFixed(2).replace('.', ',') + ')'", "' AT/ET (' + P.atet.toFixed(2) + ')'")]),
 ('20 «Ver detalle» vuelve al punto decimal', 'TC-758',
  [("    s.push('El cociente AT/tiempo eyectivo es de ' + P.atet.toFixed(2).replace('.', ',') + ', fuera del rango normal ' +",
    "    s.push('El cociente AT/tiempo eyectivo es de ' + P.atet.toFixed(2) + ', fuera del rango normal ' +")]),
 ('21 el corte normal del cociente se mueve', 'TC-758',
  [("atet_normal_max: 0.32", "atet_normal_max: 0.30")]),
 ('22 el corte de significativa del cociente se mueve', 'TC-758',
  [("atet_signif_min: 0.37", "atet_signif_min: 0.45")]),
 # ══ COMMIT 4 · LA CITA Y EL CORTE DE 10 MM ═══════════════════════════════════
 ('23 la cita vuelve a decir que el criterio DIVERGE y que esta SIN RESOLVER', 'TC-759',
  [("'2021;42(6):563-645), sección de comunicación interventricular. La guía indica el cierre ' +",
    "'2021;42(6):563-645), sección de comunicación interventricular. EL CRITERIO QUE ESTA ' + 'SECCIÓN APLICA DIVERGE DE ESA TABLA Y LA DIVERGENCIA ESTÁ SIN RESOLVER: la guía indica el cierre ' +")]),
 ('24 la cita vuelve a exponer una verificacion PENDIENTE', 'TC-759',
  [("'referencia no publica nivel de evidencia.' },",
    "'referencia no publica nivel de evidencia. Verificación clínica pendiente: hasta resolverla.' },")]),
 ('25 la cita deja de declarar el criterio como propio de la aplicacion', 'TC-759',
  [("son un criterio propio de la aplicación. Esta '", "son los de la guía. Esta '")]),
 ('26 el corte de la protesis AORTICA vuelve a «mas de 10 mm» en su rotulo', 'TC-759',
  [("{ clave:'prota.trombGrande', lbl:'Trombo protésico grande, de 10 mm o más, complicado con embolia', guia:'vhd25',",
    "{ clave:'prota.trombGrande', lbl:'Trombo protésico grande, de más de 10 mm, complicado con embolia', guia:'vhd25',")]),
 ('27 el corte de la protesis TRICUSPIDE vuelve a «mas de 10 mm» en su recomendacion', 'TC-759',
  [("{ clave:'prott.trombGrande', lbl:'Trombo protésico grande, de 10 mm o más, complicado con embolia', guia:'vhd25',\n    rec:'Clase IIa · Nivel C — la cirugía debe considerarse ante un trombo protésico grande, de 10 mm o más, complicado con embolia, hoja 66, folio 4700',",
    "{ clave:'prott.trombGrande', lbl:'Trombo protésico grande, de 10 mm o más, complicado con embolia', guia:'vhd25',\n    rec:'Clase IIa · Nivel C — la cirugía debe considerarse ante un trombo protésico grande, de más de 10 mm, complicado con embolia, hoja 66, folio 4700',")]),
 ('28 la recomendacion de la protesis MITRAL vuelve a «mayor de 10 mm»', 'TC-759',
  [("    t:'Cirugía A CONSIDERAR ante un trombo protésico grande (10 mm o más) complicado con embolia.' },",
    "    t:'Cirugía A CONSIDERAR ante un trombo protésico grande (mayor de 10 mm) complicado con embolia.' },")]),
 ('29 vuelve la nota que COMPARA las dos partes del documento, en la aortica', 'TC-759',
  [("    nota:'su Figura 20 (hoja 65, folio 4699) imprime el tamaño del trombo grande como «10 mm o más»' },\n  { clave:'prota.trombBio'",
    "    nota:'la Tabla 17 imprime «más de 10 mm» y su Figura 20 (hoja 65, folio 4699) imprime «10 mm o más». Esta pregunta usa el de la tabla' },\n  { clave:'prota.trombBio'")]),
 ('30 la zona sale del @media de puntero grueso: cambia el blanco de clic con el mouse', 'TC-760',
  [("   tampoco. */\n@media (pointer: coarse) {",
    "   tampoco. */\n@media (min-width: 1px) {")]),
 ('31 la zona pierde su ancho: los insets laterales se van a cero', 'TC-760',
  [("left:-16.5px;right:-16.5px;top:-14px;bottom:-14px}", "left:0;right:0;top:-14px;bottom:-14px}")]),
 ('32 la zona pierde su alto: los insets verticales se van a cero', 'TC-760',
  [("left:-16.5px;right:-16.5px;top:-14px;bottom:-14px}", "left:-16.5px;right:-16.5px;top:0;bottom:0}")]),
 ('33 la zona se pasa a 44 de alto: se pisa con el vecino de la fila de abajo', 'TC-760',
  [("top:-14px;bottom:-14px}", "top:-15px;bottom:-15px}")]),
 ('34 la zona deja de ser absoluta: crece la fila', 'TC-760',
  [("summary::after{content:'';position:absolute;", "summary::after{content:'';position:static;")]),
 ('35 el summary pierde el z-index: la celda de la fila de abajo vuelve a tapar la mitad de la zona', 'TC-760',
  [("#indic-card [data-ind-info] > summary{position:relative;z-index:1}",
    "#indic-card [data-ind-info] > summary{position:relative}")]),
 ('36 la zona se declara con ancho y alto en vez de insets: vuelve el defecto del porcentaje', 'TC-760',
  [("left:-16.5px;right:-16.5px;top:-14px;bottom:-14px}",
    "left:50%;top:50%;transform:translate(-50%,-50%);width:44px;height:42px}")]),
 ('37 el boton de respuesta pierde su z-index: a 390 px la zona del circulo-i le roba el toque', 'TC-760',
  [("  #indic-card .ind-ctrl-btn{z-index:2}", "  #indic-card .ind-ctrl-btn{z-index:0}")]),
]

orig = open(IDX, encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0 = time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv) > 2 else None
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
