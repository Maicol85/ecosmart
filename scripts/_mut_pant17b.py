#!/usr/bin/env python3
"""Barrido de mutaciones dirigidas de PANT-17b.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo, y escribe index.html con flush y
fsync antes de lanzar el suite: sin eso el servidor del suite lee el archivo SIN los cambios y
la mutacion sale «sobrevivio» sobre un defecto que, aplicado a mano, pone el caso en rojo
(P14c-i). Cada mutacion declara SU caso: con varios casos por mutacion, un reparto mal hecho
queda tapado por el caso de otro commit.
"""
import io, os, re, subprocess, sys, hashlib, time

RAIZ = os.getcwd()
IDX  = os.path.join(RAIZ, 'index.html')

MUT = [
 # ── TC-720: la transparencia ───────────────────────────────────────────────────────────────
 ('M01 el material vuelve a ser de malla de alambre', 'TC-720',
  "transparent: true, depthWrite: false, side: T.FrontSide });",
  "transparent: true, depthWrite: false, side: T.FrontSide, wireframe: true });"),
 ('M02 el material escribe en el buffer de profundidad', 'TC-720',
  "transparent: true, depthWrite: false, side: T.FrontSide });",
  "transparent: true, depthWrite: true, side: T.FrontSide });"),
 ('M03 el material dibuja las dos caras', 'TC-720',
  "transparent: true, depthWrite: false, side: T.FrontSide });",
  "transparent: true, depthWrite: false, side: T.DoubleSide });"),
 ('M04 el alfa deja de depender del angulo: relleno plano', 'TC-720',
  "' gl_FragColor = vec4( uCol, rim * 0.95 + 0.035 ); }',",
  "' gl_FragColor = vec4( uCol, 0.55 ); }',"),
 ('M05 el borde se extiende a toda la superficie', 'TC-720',
  "' float rim = smoothstep( 0.50, 0.92, f );",
  "' float rim = smoothstep( -1.0, 0.02, f );"),
 ('M06 la normal deja de entrar en el calculo', 'TC-720',
  "' vNrm = normalMatrix * normal; vPos = mv.xyz;",
  "' vNrm = vec3( 0.0, 0.0, 1.0 ); vPos = mv.xyz;"),
 ('M07 el material deja de ser transparente', 'TC-720',
  "transparent: true, depthWrite: false, side: T.FrontSide });",
  "transparent: false, depthWrite: false, side: T.FrontSide });"),
 ('M08 el aplicador no cambia el material de la estructura apagada', 'TC-720',
  "if (ob.material !== _matSC) { ob.userData.cmMat0 = ob.material; ob.material = _matSC }",
  "if (false) { ob.userData.cmMat0 = ob.material; ob.material = _matSC }"),
 # ── TC-721: el formato nuevo ───────────────────────────────────────────────────────────────
 ('M09 el encabezado deja de publicar el conteo', 'TC-721',
  "+ (_cta ? '<span data-ind-cuenta=\"1\"", "+ (false ? '<span data-ind-cuenta=\"1\""),
 ('M10 el conteo pierde el nowrap y puede partirse', 'TC-721',
  "'white-space:nowrap;\">' + _critEsc(_cta.si", "'white-space:normal;width:34px;\">' + _critEsc(_cta.si"),
 ('M11 vuelve la fila Respuestas a la tabla de datos clinicos', 'TC-721',
  "  const hayClin = !!(r.clinica && r.clinica.length);",
  "  if (r.cuenta && r.clinica) r.clinica.unshift(_indFila('Respuestas', r.cuenta.si + ' en Si', 'none', ''));\n  const hayClin = !!(r.clinica && r.clinica.length);"),
 ('M12 los bloques fijos dejan de plegarse', 'TC-721',
  "    if (!r.adapt || !b) return b;", "    if (true) return b;"),
 ('M13 el plegable se marca data-ind-detalle y no data-ind-bloque', 'TC-721',
  "return '<details data-ind-bloque=\"1\" style=\"margin:12px 0 0;padding:8px 10px;border:1px solid '",
  "return '<details data-ind-detalle=\"1\" style=\"margin:12px 0 0;padding:8px 10px;border:1px solid '"),
 ('M14 el recuadro «Con lo contestado» no se emite', 'TC-721',
  "  if (r.adapt) h += _indAdaptHTML(r.adapt, r.faltan);", "  if (false) h += _indAdaptHTML(r.adapt, r.faltan);"),
 ('M15 el recuadro ignora las respuestas y sale siempre vacio', 'TC-721',
  "  const xs = (adapt || []).filter(Boolean).slice().sort(function (a, b) {",
  "  const xs = [].filter(Boolean).slice().sort(function (a, b) {"),
 ('M16 el recuadro deja de decir lo que falta contestar', 'TC-721',
  "  if (f.length) c += '<div style=\"font-size:11px;margin-top:7px;color:#D97706;\">'",
  "  if (false) c += '<div style=\"font-size:11px;margin-top:7px;color:#D97706;\">'"),
 ('M17 «sin dato» pasa a contar como «si» en el ductus', 'TC-721',
  "    if (o.val === 'si') { _si.push(p.lbl); _siDet.push(p); }\n    else if (o.val === 'no') _no.push(p.lbl); else _sd.push(p.lbl);\n    const _f = _indFilaOrigen(p.lbl, o, DAP_OPS",
  "    if (o.val !== 'no') { _si.push(p.lbl); _siDet.push(p); }\n    else if (o.val === 'no') _no.push(p.lbl); else _sd.push(p.lbl);\n    const _f = _indFilaOrigen(p.lbl, o, DAP_OPS"),
 # ── TC-722: las recomendaciones nuevas ─────────────────────────────────────────────────────
 ('M18 la CIA pierde la recomendacion 2 de la ACC/AHA', 'TC-722',
  "Sin reparar y con hipertensión arterial pulmonar, la evaluación del riesgo y el manejo deben hacerse en consulta con especialistas en hipertensión pulmonar, para mejorar los resultados (recomendación 2).",
  "Sin reparar y con hipertension arterial pulmonar, se sugiere control."),
 ('M19 la CIV pierde la recomendacion 3 de la ACC/AHA', 'TC-722',
  "el seguimiento debe estar a cargo de especialistas con experiencia en cardiopatías congénitas del adulto y en hipertensión pulmonar",
  "el seguimiento debe hacerse"),
 ('M20 el defecto del septo AV pierde su pregunta nueva', 'TC-722',
  "  { clave:'dsav.ev.htpExpertos', lbl:'Hipertensión arterial pulmonar, reparado o no', guia:'acc',",
  "  { clave:'dsav.ev.htpExpertos_off', lbl:'Otra cosa', guia:'acc',"),
 ('M21 la conexion venosa anomala pierde su pregunta de clase III', 'TC-722',
  "  { clave:'cvpa.ev.vdNormalQp', lbl:'Ventriculo derecho normal o apenas agrandado, con Qp:Qs por debajo de 1,5',",
  "  { clave:'cvpa.ev.vdNormalQp', lbl:'Otra condicion',"),
 ('M22 la clase III deja de rotularse «no recomendado»', 'TC-722',
  "const et = (_indEsClase3(p) ? 'No recomendado — ' : '')",
  "const et = (false ? 'No recomendado — ' : '')"),
 ('M23 el Fontan pierde la recomendacion 16', 'TC-722',
  "El adulto derivado para trasplante cardíaco debe pasar por una revisión pretrasplante a cargo de un comité",
  "El adulto derivado para trasplante cardiaco se evalua"),
 ('M24 la clase III de la conexion venosa pierde su folio', 'TC-722',
  "sostengan un beneficio, hoja 45, folio e159'", "sostengan un beneficio, hoja 45'"),
]

def escribir(txt):
    with io.open(IDX, 'w', encoding='utf-8') as f:
        f.write(txt); f.flush(); os.fsync(f.fileno())

def md5f(p):
    return hashlib.md5(io.open(p, 'rb').read()).hexdigest()[:8]

orig = io.open(IDX, encoding='utf-8').read()
md0 = md5f(IDX)
print('arbol de trabajo:', RAIZ, '| md5', md0, '| mutaciones', len(MUT))
res = []
for nom, caso, a, b in MUT:
    if orig.count(a) != 1:
        res.append((nom, caso, 'NO APLICA (ancla %d veces)' % orig.count(a))); print(' !!', nom, 'NO APLICA'); continue
    escribir(orig.replace(a, b, 1))
    vivo = io.open(IDX, encoding='utf-8').read()
    if b not in vivo:
        res.append((nom, caso, 'NO SE ESCRIBIO')); escribir(orig); continue
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       capture_output=True, text=True, cwd=RAIZ)
    out = r.stdout
    if 'RESULTADO' not in out:
        est = 'NO CORRIO'
    elif 'excepcion' in out:
        est = 'MUERTA (por excepcion: no sirve)'
    elif '✗' in out:
        est = 'MUERTA'
    else:
        est = 'SOBREVIVIO'
    res.append((nom, caso, est))
    print(' %-62s %-8s %s' % (nom[:62], caso, est))
    escribir(orig)

escribir(orig)
assert md5f(IDX) == md0, 'EL ARCHIVO NO VOLVIO A SU md5'
m = sum(1 for _, _, e in res if e == 'MUERTA')
print('\n  %d/%d MUERTAS  | md5 identico antes y despues: %s' % (m, len(MUT), md0))
for nom, caso, e in res:
    if e != 'MUERTA': print('   >>', nom, caso, e)
