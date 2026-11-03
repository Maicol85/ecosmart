#!/usr/bin/env python3
"""
_mut_pant2.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-2 (2026-11-02).
Nombre propio: verificado con ls que no existia.

COMO FUNCIONA, y por que asi. Cada mutacion se aplica en un WORKTREE y NUNCA sobre el arbol
vivo, con guarda de md5 antes y despues: leer o editar index.html mientras corre un barrido da
una medicion falsa y plausible, que es lo que este repositorio ya documenta.
Cada mutacion declara SU caso: correr los cuatro por cada una tapa un reparto mal hecho.

Una mutacion que NO revierte un arreglo sino que lo aplica DE MAS existe porque la condicion
que la mata es un CONTROL NEGATIVO, y un control que ninguna mutacion puede romper no prueba
nada.

  python3 scripts/_mut_pant2.py [--solo M01,M07]
"""
import subprocess, sys, os, hashlib, shutil, re

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = os.environ.get('MUT_WT', '/private/tmp/claude-501/-Users-maicoldossantos-Desktop-APLICACIONES-ecosmart/92f565b3-1526-46a7-bdea-a092ee47f5bf/scratchpad/wt_mut')

# (id, caso, descripcion, viejo, nuevo)
MUT = [
 # ── CORRECCION A ──────────────────────────────────────────────────────────────────────────
 ('M01','TC-619','el resolvedor devuelve el marcado sin tocar: las variables vuelven a quedar sin resolver',
  "function esqSvgParaRaster(svgTxt) {\n  let t = _esqSustVars(svgTxt);",
  "function esqSvgParaRaster(svgTxt) {\n  let t = String(svgTxt);"),
 ('M02','TC-619','no se inyecta la tipografia: el texto del dibujo vuelve a caer en serif',
  "  if (t.indexOf('font-family') < 0) {\n    const ff = _esqFontFamily().replace(/\"/g, \"'\");",
  "  if (false) {\n    const ff = _esqFontFamily().replace(/\"/g, \"'\");"),
 ('M03','TC-619','la sustitucion deja el relleno de fondo sin resolver, que es la caja negra',
  "    if (t.indexOf('var(--') < 0) break;",
  "    if (t.indexOf('var(--') < 0) break;\n    t = t.replace(/fill=\"var\\(--bg\\)\"/g, 'fill=\"var(--bg)\"');\n    if (t.indexOf('fill=\"var(--bg)\"') >= 0) { t = t.split('var(--bg)').join('NOSEPUEDE'); break }"),
 ('M04','TC-619','el esquema vuelve a publicar su linea propia: el escenario se dice DOS veces',
  "      .then(function (d) { if (d && tgaEsqPdfOn()) _tgaEsqPdf = { data:d }; return d; })",
  "      .then(function (d) { if (d && tgaEsqPdfOn()) _tgaEsqPdf = { data:d, linea:'Circulación esquemática: x' }; return d; })"),
 ('M05','TC-619','APLICADA DE MAS: el dueno unico de la linea deja de nombrar el escenario',
  "  p.push(TXT[ej.anat] || ej.anat);",
  "  p.push('');"),
 # ── CORRECCION B ──────────────────────────────────────────────────────────────────────────
 ('M06','TC-620','cerrar las demas no hace nada: vuelven a poder abrirse varias a la vez',
  "function _indInfoCerrar(excepto){\n  _indInfoTodas().forEach(function (d) {\n    if (d === excepto) return;",
  "function _indInfoCerrar(excepto){\n  _indInfoTodas().forEach(function (d) {\n    if (d) return;\n    if (d === excepto) return;"),
 ('M07','TC-620','el listener de clic del documento no se registra: no se cierra al tocar fuera',
  "  document.addEventListener('click', function (ev) {\n    try {\n      const t = ev.target;\n      const d = (t && t.closest) ? t.closest('details[data-ind-info]') : null;",
  "  if (false) document.addEventListener('click', function (ev) {\n    try {\n      const t = ev.target;\n      const d = (t && t.closest) ? t.closest('details[data-ind-info]') : null;"),
 ('M08','TC-620','Escape deja de detener la propagacion: cierra la nota Y el panel',
  "      _indInfoCerrar(null);\n      /* ⚠️ SE DETIENE LA PROPAGACIÓN SÓLO SI HABÍA UNA NOTA ABIERTA.",
  "      _indInfoCerrar(null);\n      if (true) return;\n      /* ⚠️ SE DETIENE LA PROPAGACIÓN SÓLO SI HABÍA UNA NOTA ABIERTA."),
 ('M09','TC-620','APLICADA DE MAS: tocar DENTRO de la nota tambien la cierra',
  "      if (!sm || sm.parentNode !== d) return;",
  "      if (!sm || sm.parentNode !== d) { _indInfoCerrar(null); return; }"),
 ('M10','TC-620','aria-expanded deja de seguir al estado: el lector de pantalla no se entera',
  "      if (s) s.setAttribute('aria-expanded', d.open ? 'true' : 'false');",
  "      if (s) s.setAttribute('aria-expanded', 'false');"),
 # ── CORRECCION C ──────────────────────────────────────────────────────────────────────────
 ('M11','TC-621','el reparto devuelve UNA sola columna: las preguntas vuelven a media pantalla',
  "  const corte0 = Math.ceil(L.length / n);",
  "  return [L];\n  const corte0 = Math.ceil(L.length / n);"),
 ('M12','TC-621','la regla de dos columnas de las preguntas se apaga',
  "#indic-card [data-ind-grid][data-ind-preg=\"1\"][data-ind-cols=\"2\"] > [data-ind-col=\"eco\"],\n#indic-card [data-ind-grid][data-ind-preg=\"1\"][data-ind-cols=\"2\"] [data-ind-pregcols=\"1\"]{\n  display:grid;",
  "#indic-card [data-ind-grid][data-ind-preg=\"1\"][data-ind-cols=\"2\"] > [data-ind-col=\"eco\"],\n#indic-card [data-ind-grid][data-ind-preg=\"1\"][data-ind-cols=\"2\"] [data-ind-pregcols=\"1\"]{\n  display:block;"),
 ('M13','TC-621','el alto visible del boton vuelve al piso tactil: la fila vuelve a crecer',
  "#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn{min-height:32px;min-width:0;position:relative}",
  "#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn{min-height:44px;min-width:0;position:relative}"),
 ('M14','TC-621','se quita el area tactil extendida: el boton queda en 32 px de verdad',
  "#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn::after{content:'';position:absolute;left:0;right:0;\n  top:50%;transform:translateY(-50%);height:44px}",
  "#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn::after{content:'';position:absolute;left:0;right:0;\n  top:50%;transform:translateY(-50%);height:32px}"),
 ('M15','TC-621','APLICADA DE MAS: la regla deja de acotarse y mueve las secciones de SEIS O MENOS',
  "#indic-card [data-ind-preg=\"1\"] .ind-ctrl-btn{min-height:32px",
  "#indic-card .ind-ctrl-btn{min-height:32px"),
 ('M16','TC-621','el tercer estado deja de poner null: «sin dato» pasa a valer como una respuesta',
  "    _indClin[k] = (v === IND_SD_VAL) ? null : ((_indClinGet(k) === v) ? null : v);",
  "    _indClin[k] = (v === IND_SD_VAL) ? v : ((_indClinGet(k) === v) ? null : v);"),
 # ── CORRECCION D ──────────────────────────────────────────────────────────────────────────
 ('M17','TC-622','la frase vuelve a repetir funcion y disfuncion en la misma oracion',
  "  if (func) partes.push(FUNC_TXT[func] || ('Función del ventrículo derecho sistémico ' + func));",
  "  const _FV = { normal:'normal', leve:'con disfunción leve', moderada:'con disfunción moderada', severa:'con disfunción severa' };\n  if (func) partes.push('Función del ventrículo derecho sistémico ' + (_FV[func] || func));"),
 ('M18','TC-622','el EN SUMA vuelve a publicar la frase de dato faltante',
  "    if (fvd) l += ' — VD sistémico con ' + fvd;",
  "    l += fvd ? ' — VD sistémico con ' + fvd : ' — función del VD sistémico no consignada';"),
 ('M19','TC-622','APLICADA DE MAS: tambien se cambia la construccion de Ebstein, que esta tanda NO toca',
  "  const FUNC = { normal:'normal', leve:'con disfunción leve', moderada:'con disfunción moderada', severa:'con disfunción severa' };\n  if (func) partes.push('Ventrículo derecho funcional ' + (FUNC[func] || func));",
  "  const FUNC = { normal:'normal', leve:'leve', moderada:'moderada', severa:'severa' };\n  if (func) partes.push('Disfunción del ventrículo derecho funcional ' + (FUNC[func] || func));"),
]

def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest()[:8]

def main():
    solo = None
    if '--solo' in sys.argv:
        solo = set(sys.argv[sys.argv.index('--solo')+1].split(','))
    vivo = RAIZ + '/index.html'
    antes = md5(vivo)
    print('md5 del arbol VIVO antes: %s'%antes)
    if not os.path.isdir(WT):
        subprocess.run(['git','-C',RAIZ,'worktree','add','--detach',WT,'HEAD'],check=True,
                       stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    # el worktree arranca del commit; se le copia el arbol de trabajo tal como esta
    shutil.copy(vivo, WT + '/index.html')
    shutil.copy(RAIZ + '/scripts/test_clinico.mjs', WT + '/scripts/test_clinico.mjs')
    base = open(WT + '/index.html', encoding='utf-8').read()
    ok = mal = noap = 0
    for mid, tc, desc, viejo, nuevo in MUT:
        if solo and mid not in solo: continue
        n = base.count(viejo)
        if n != 1:
            print('  %-5s %-8s NO APLICA (el ancla aparece %d veces) — %s'%(mid,tc,n,desc)); noap += 1; continue
        open(WT + '/index.html','w',encoding='utf-8').write(base.replace(viejo,nuevo))
        r = subprocess.run(['node','scripts/test_clinico.mjs','--solo',tc],cwd=WT,
                           capture_output=True,text=True,timeout=900)
        sal = r.stdout
        if 'RESULTADO' not in sal:
            print('  %-5s %-8s NO CORRIO (sin RESULTADO en la salida) — %s'%(mid,tc,desc)); mal += 1; continue
        murio = ('✗' in sal)
        exc = ('excepcion:' in sal)
        print('  %-5s %-8s %-9s%s %s'%(mid,tc,'MUERTA' if murio else '*** SOBREVIVIO ***',
              ' (por excepcion)' if exc else '', desc))
        if murio: ok += 1
        else: mal += 1
    open(WT + '/index.html','w',encoding='utf-8').write(base)
    desp = md5(vivo)
    print()
    print('RESULTADO: %d muertas · %d sobrevivieron · %d no aplicaron'%(ok,mal,noap))
    print('md5 del arbol VIVO despues: %s  %s'%(desp,'IDENTICO' if desp==antes else '*** CAMBIO ***'))

main()
