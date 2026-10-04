#!/usr/bin/env python3
"""
_mut_vi3dcolor.py — arnes TEMPORAL de mutaciones para la tanda
«Color por territorio coronario + captura de imagen del 3D del VI».

Cada cableado de esta tanda tiene que poder ponerse ROJO: un caso que no se puede hacer fallar no
esta probando nada. Aca se revierte uno por vez y se exige que la asercion que le corresponde pase
de verde a rojo.

LAS TRES GUARDAS DEL ARNES ANTERIOR, iguales y por los mismos defectos reales de este repo:
 1. NUNCA se muta el archivo vivo: se trabaja sobre una COPIA en /tmp.
 2. md5 del archivo vivo ANTES y DESPUES; si cambio en el medio, se aborta.
 3. SE EXIGE la linea «RESULTADO» en la salida antes de puntuar. Sin ella el veredicto es
    NO CORRIO, no «sobrevivio» — ese defecto exacto reporto 7 falsos en este repo.

Y la linea base se mide PRIMERO.

Uso:  python3 scripts/_mut_vi3dcolor.py
"""

import hashlib
import os
import re
import shutil
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')
SONDA = os.path.join(RAIZ, 'scripts', '_probe_vi3dcolor.mjs')


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for ch in iter(lambda: f.read(1 << 20), b''):
            h.update(ch)
    return h.hexdigest()


# (nombre, viejo, nuevo, aserciones que DEBEN ponerse rojas, [motivo si se ESPERA que sobreviva])
MUTACIONES = [
    # ── P1: el selector de modo ──
    ('M01 el modo por defecto pasa a territorio',
     "                modo:'motilidad', cap:null,",
     "                modo:'territorio', cap:null,",
     ['P1-1', 'P1-2']),

    ('M02 el boton de territorio no cambia el modo (se corta el cableado)',
     "  panel.querySelectorAll('.lv3d-color').forEach(b => b.addEventListener('click', () => {\n    lv3dSetModo(b.getAttribute('data-lv3d-color'));\n  }));",
     "  panel.querySelectorAll('.lv3d-color').forEach(b => b.addEventListener('click', () => {\n    if (false) lv3dSetModo(b.getAttribute('data-lv3d-color'));\n  }));",
     ['P1-6', 'P1-7']),

    ('M03 cambiar de modo no repinta el canvas (el repintado explicito de lv3dSetModo)',
     "  if (_lv3d.abierto) lv3dDibujar();\n}\n\n/* \u2550\u2550 P4 \u00b7 CAPTURA DE IMAGEN",
     "  if (false) lv3dDibujar();\n}\n\n/* \u2550\u2550 P4 \u00b7 CAPTURA DE IMAGEN",
     ['P1-6'],
     'SOBREVIVE POR REDUNDANCIA, Y ESTA MEDIDO: lv3dCuadro llama a lv3dDibujar() en CADA cuadro '
     'sin condicion —pausado o no: la pausa congela la fase, no el repintado— y el bucle esta '
     'vivo siempre que el panel este abierto con datos, porque lv3dArrancar lo enciende cuando '
     'hayTamano. O sea que sacar el repintado explicito de lv3dSetModo solo agrega UN cuadro de '
     'retraso (~16 ms) al cambio de color, y no hay asercion honesta que distinga eso. Se deja '
     'igual por la misma razon que la linea de pal.fondo: que el cambio de modo no dependa de '
     'que el bucle este corriendo, por si alguna vez deja de estarlo. Mismo caso que M05 de la '
     'tanda anterior.'),

    # ── P2a: la paleta sale de CONTR_TERRITORIO ──
    ('M04 el modo territorio usa colores propios en vez de CONTR_TERRITORIO',
     "  return lv3dTonoRGB(lv3dRGB(CONTR_TERRITORIO[id] || ''), idx);",
     "  return lv3dTonoRGB(lv3dRGB(['#4f8ef7','#f05454','#3ecf8e'][(sg % 3)]), idx);",
     ['P2a-3']),

    ('M05 el resolutor ignora el modo y pinta siempre motilidad',
     "  if (!lv3dEsTerritorio()) return lv3dRGB((CONTR_MOTILIDAD[idx] || CONTR_MOTILIDAD[0]).color);",
     "  if (true) return lv3dRGB((CONTR_MOTILIDAD[idx] || CONTR_MOTILIDAD[0]).color);",
     ['P2a-3', 'P2a-4', 'P1-6']),

    ('M06 se desacopla el mapa: el 3D vuelve a tener su propia copia del territorio',
     "const CONTR_TERRITORIO = {\n  basal_anterior:'#3ea8ff',",
     "const CONTR_TERRITORIO = {\n  basal_anterior:'#3ecf8e',",
     ['P2e-2']),

    # ── P2c: los cinco tonos ──
    ('M07 Normal deja de ser el color base',
     "const LV3D_TONO = [0, 0.38, 0.67, -0.47, -0.63];",
     "const LV3D_TONO = [0.2, 0.38, 0.67, -0.47, -0.63];",
     ['P2c-3', 'P2c-4']),

    ('M08 se pierden los dos tonos OSCUROS (discinesia y aneurisma quedan en el base)',
     "const LV3D_TONO = [0, 0.38, 0.67, -0.47, -0.63];",
     "const LV3D_TONO = [0, 0.38, 0.67, 0, 0];",
     ['P2c-3', 'P2c-4', 'P2c-5']),

    ('M09 se pierden los dos tonos CLAROS (hipoquinesia y aquinesia quedan en el base)',
     "const LV3D_TONO = [0, 0.38, 0.67, -0.47, -0.63];",
     "const LV3D_TONO = [0, 0, 0, -0.47, -0.63];",
     ['P2c-2', 'P3-4']),

    ('M10 discinesia y aneurisma quedan al mismo tono (el paso desaparece)',
     "const LV3D_TONO = [0, 0.38, 0.67, -0.47, -0.63];",
     "const LV3D_TONO = [0, 0.38, 0.67, -0.47, -0.48];",
     ['P2c-5', 'P3-4']),

    ('M11 el tono se aplica tambien en modo motilidad (se ensucia el modo de hoy)',
     "function lv3dTonoRGB(base, idx){\n  const f = (LV3D_TONO[idx] !== undefined) ? LV3D_TONO[idx] : 0;",
     "function lv3dTonoRGB(base, idx){\n  const f = 0.5;",
     ['P2c-3', 'P2c-4', 'P3-4']),

    # ── P2b: el toque en modo territorio ──
    ('M12 el toque en territorio vuelve a cambiar el estado del segmento',
     "    if (lv3dEsTerritorio()){\n      const idxT = Number(contrEstado[id]) || 0;",
     "    if (false){\n      const idxT = Number(contrEstado[id]) || 0;",
     ['P2b-1', 'P2b-2']),

    ('M13 el panel no avisa que el modo territorio es solo lectura',
     "const LV3D_TXT_TERRITORIO = 'Arrastrá para girar. En este modo tocar un segmento NO lo cambia: es solo para mirar. Para editar, volvé a «Color por motilidad».';",
     "const LV3D_TXT_TERRITORIO = LV3D_TXT_MOTILIDAD;",
     ['P2b-6']),

    ('M14 el toque en territorio no contesta que segmento es',
     "      if (leidoT) leidoT.textContent = 'Segmento ' + p.sg + ' · ' + LV3D_SEG_NOMBRE[p.sg]",
     "      if (false) leidoT.textContent = 'Segmento ' + p.sg + ' · ' + LV3D_SEG_NOMBRE[p.sg]",
     ['P2b-4']),

    # ── P2d: los bordes de segmento ──
    ('M15 no se dibujan los limites de segmento',
     "      if (terr && (p.bU || p.bD || p.bL || p.bR)){",
     "      if (false && (p.bU || p.bD || p.bL || p.bR)){",
     ['P2d-1', 'P2d-1b', 'P2d-1c']),

    ('M16 no se calculan los limites (la malla no marca ninguna arista)',
     "  const bordes = !fantasma && lv3dEsTerritorio();",
     "  const bordes = false;",
     ['P2d-1', 'P2d-1b', 'P2d-1c']),

    ('M17 el borde usa UN solo gris en vez de elegirlo por pixel',
     "        ctx.strokeStyle = (luma >= LV3D_BORDE_LUMA) ? LV3D_BORDE_OSCURO : LV3D_BORDE_CLARO;",
     "        ctx.strokeStyle = LV3D_BORDE_OSCURO;",
     ['P2d-1b']),

    ('M18 los bordes se dibujan tambien en modo motilidad',
     "      if (terr && (p.bU || p.bD || p.bL || p.bR)){",
     "      if ((p.bU || p.bD || p.bL || p.bR) || !terr){",
     ['P2d-1'],
     'SOBREVIVE POR CONSTRUCCION: en modo motilidad lv3dMalla no calcula las banderas —`bordes` '
     'es falso— asi que p.bU..p.bR son undefined y la condicion no llega a trazar nada. Es la '
     'misma puerta que mata M16, medida desde el otro lado: para que esta mutacion matara habria '
     'que ademas calcular las banderas en motilidad, que es M16 al reves.'),

    # ── P3: la leyenda ──
    ('M19 la leyenda no se muestra en modo territorio',
     "    ley.style.display = terr ? 'block' : 'none';",
     "    ley.style.display = 'none';",
     ['P3-0']),

    ('M20 la leyenda escribe los numeros de segmento a la vista',
     "       + t.nombre + '</div>'\n       + '<div style=\"flex:1 1 0;min-width:0;display:flex;height:15px;border:1px solid var(--border);'",
     "       + t.nombre + ' ' + t.segs.join(',') + '</div>'\n       + '<div style=\"flex:1 1 0;min-width:0;display:flex;height:15px;border:1px solid var(--border);'",
     ['P3-6']),

    ('M21 la leyenda deja de nombrar los grados de CONTR_MOTILIDAD',
     "       + m.nombre + '</div>';",
     "       + 'Grado ' + (CONTR_MOTILIDAD.indexOf(m)+1) + '</div>';",
     ['P3-5']),

    ('M22 la leyenda pierde el orden DA, CD, CX',
     "  return orden.map(hex => ({ hex:hex, nombre:(CONTR_TERRITORIO_NOMBRE[hex] || '?'), segs:por[hex] }));",
     "  return orden.reverse().map(hex => ({ hex:hex, nombre:(CONTR_TERRITORIO_NOMBRE[hex] || '?'), segs:por[hex] }));",
     ['P3-2']),

    ('M23 la leyenda se queda sin la red que evita el desborde a 360 px',
     "       + 'hyphens:auto;-webkit-hyphens:auto;overflow-wrap:anywhere;\">'",
     "       + 'white-space:nowrap;\">'",
     ['P3-12']),

    # ── P4: la captura ──
    ('M24 capturar no guarda nada',
     "  _lv3d.cap = { url: cv.toDataURL('image/png'),",
     "  _lv3d.cap = _lv3d.cap || { url: cv.toDataURL('image/png'),",
     ['P4-9']),

    ('M25 se pierde la compuerta: se captura un recuadro sin datos',
     "  if (!_lv3d.hayTamano){\n    if (typeof toast === 'function') toast('⚠️ No hay diagrama para capturar: falta cargar el DDVI o el VDFVI.');\n    return;\n  }",
     "  if (false){ return; }",
     ['P4-3']),

    ('M26 el PNG sale transparente (sin fondo opaco)',
     "  ctx.fillStyle = pal.fondo;\n  ctx.fillRect(0, 0, W, H);\n\n  lv3dPintar(ctx, W, LV3D_H, pal, false);",
     "  lv3dPintar(ctx, W, LV3D_H, pal, true);",
     ['P4-11']),

    ('M43 la captura lee el fondo del tema por su cuenta, fuera de lv3dPaleta',
     "  ctx.fillStyle = pal.fondo;",
     "  ctx.fillStyle = ((getComputedStyle(document.documentElement).getPropertyValue('--bg3') || '').trim()) || '#1e2333';",
     ['IMG-1'],
     'SOBREVIVE, Y SE DECLARA: hoy los dos lectores dan el MISMO valor, porque lv3dAlCambiarTema '
     'refresca _lv3d.pal en cada cambio de tema SIN mirar si el panel esta abierto. O sea que '
     'unificar en lv3dPaleta cierra un agujero que HOY no es alcanzable: lo que evita es que el '
     'proximo que vuelva condicional esa cache —como ya lo son lv3dDibujar y lv3dReconstruir— '
     'deje el PNG con el fondo de un tema y el texto del otro. No hay caso de prueba honesto que '
     'distinga las dos versiones mientras ese refresco sea incondicional.'),

    ('M27 el PNG pierde la FASE del pie (la frase sigue)',
     "  ctx.fillText('Fase: ' + lv3dFaseRotulo(), 14, y);",
     "  if (false) ctx.fillText('Fase: ' + lv3dFaseRotulo(), 14, y);",
     ['P4-13c']),

    ('M27b el PNG pierde la FRASE del pie (la fase sigue)',
     "  ctx.fillText(LV3D_CAP_FRASE, W - 14, y);",
     "  if (false) ctx.fillText(LV3D_CAP_FRASE, W - 14, y);",
     ['P4-13d']),

    ('M28 el PNG del modo territorio no incluye la leyenda de tonos',
     "  const ALTO_LEY = terr ? (13 + ters.length*17 + 6) : 0;",
     "  const ALTO_LEY = 0;",
     ['P4-15', 'P4-16']),

    ('M29 la captura no se marca desactualizada al cambiar un dato',
     "  const vieja = (c.firma !== lv3dFirmaDatos());",
     "  const vieja = false;",
     ['P4-19', 'P4-22']),

    ('M30 la firma no mira los campos cargados (solo los segmentos)',
     "  let s = g('vdfvi') + '|' + g('vsfvi') + '|' + g('fevi') + '|' + g('ddfvi') + '|';",
     "  let s = '';",
     ['P4-19']),

    ('M31 la firma no mira los 17 segmentos (solo los campos)',
     "  for (let i=1;i<=17;i++) s += (Number(contrEstado[LV3D_SEG_ID[i]]) || 0) + ',';",
     "  for (let i=1;i<=0;i++) s += (Number(contrEstado[LV3D_SEG_ID[i]]) || 0) + ',';",
     ['P4-22']),

    ('M32 la marca se decide solo con el panel abierto',
     "  if (_lv3d.cap) lv3dCapRender();\n  if (_lv3d.abierto) lv3dReconstruir();",
     "  if (_lv3d.abierto) lv3dReconstruir();",
     ['P4-19', 'P4-22']),

    ('M33 Quitar no borra la captura',
     "function lv3dCapQuitar(){\n  if (!_lv3d.cap) return;\n  _lv3d.cap = null;",
     "function lv3dCapQuitar(){\n  if (!_lv3d.cap) return;",
     ['P4-29']),

    # ── P4-d: los cuatro descartes ──
    ('M34 limpiar el estudio NO descarta la captura (fuga entre pacientes)',
     "  if (typeof lv3dNuevoPaciente === 'function') lv3dNuevoPaciente();\n  // Nuevo estudio: la card de severidades",
     "  if (false) lv3dNuevoPaciente();\n  // Nuevo estudio: la card de severidades",
     ['P4d-1', 'P4d-2', 'P4d-3']),

    ('M35 cerrar sesion NO descarta la captura',
     "  if (typeof lv3dNuevoPaciente === 'function') { try { lv3dNuevoPaciente(); } catch (e) {} }\n  sessionStorage.removeItem('ett_auth');",
     "  if (false) { try { lv3dNuevoPaciente(); } catch (e) {} }\n  sessionStorage.removeItem('ett_auth');",
     ['P4d-4'],
     'SOBREVIVE POR REDUNDANCIA, Y ES A PROPOSITO: en el camino que mide la sonda '
     '—cerrarSesionReal() llamada con el estudio cargado— `limpiarCampos` ya corrio por la puerta '
     'de cerrarSesion, asi que la captura ya esta descartada. Esta linea NO es redundante en el '
     'camino que importa: cuando `_hayAlgoSinGuardar()` devuelve null —el fallback documentado '
     'para cuando el bloque 12 no parseo— cerrarSesion NO llama a limpiarCampos y esta es la '
     'unica que descarta. Ese estado no se puede montar desde la sonda sin romper el bloque 12, '
     'asi que la cobertura automatica de esa rama no existe y se declara.'),

    ('M36 el modo no vuelve a motilidad con el paciente nuevo',
     "  _lv3d.cap = null;\n  _lv3d.modo = 'motilidad';",
     "  _lv3d.cap = null;",
     ['P4d-2']),

    ('M36b la captura del PNG se toma en un modo y se registra el otro',
     "                modo: terr ? 'territorio' : 'motilidad',",
     "                modo: 'motilidad',",
     ['P4-17']),

    # ── Lo que NO tiene que haber cambiado ──
    ('M37 la captura se mete en un campo del estudio (y saldria al Excel)',
     "  lv3dCapRender();\n  if (typeof toast === 'function') toast('📷 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     "  lv3dCapRender();\n  { const e = document.getElementById('otras_notas'); if (e) e.value = _lv3d.cap.url; }\n  if (typeof toast === 'function') toast('📷 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     ['P4-26']),

    ('M38 la captura se persiste en localStorage',
     "  lv3dCapRender();\n  if (typeof toast === 'function') toast('📷 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     "  lv3dCapRender();\n  try { localStorage.setItem('lv3d_captura', _lv3d.cap.url); } catch (e) {}\n  if (typeof toast === 'function') toast('📷 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     ['P4-27']),

    ('M39 los controles nuevos llevan id y los barridos del estudio los levantan',
     '<button type="button" class="btn btn-ghost lv3d-cap-tomar"',
     '<button type="button" id="lv3d-cap-tomar" class="btn btn-ghost lv3d-cap-tomar"',
     ['P4-28'],
     'SOBREVIVE Y ESTA BIEN: el selector de los seis barridos es input/select/textarea, no '
     'button. Un id en un <button> no lo levanta nadie —el propio panel ya tiene #lv3d-play y '
     '#lv3d-btn desde la tanda anterior—. La regla «sin id» se cumple igual por disciplina, pero '
     'lo que la asercion mide, y lo que de verdad importa, es que no haya un input/select/'
     'textarea/img con id: eso lo cubre M40.'),

    ('M40 la miniatura lleva id y entra en los barridos',
     '<img class="lv3d-cap-img"',
     '<img id="lv3d-cap-img" class="lv3d-cap-img"',
     ['P4-28']),

    ('M41 el bucle deja de apagarse con el panel cerrado',
     "function lv3dDetener(){\n  if (_lv3d.raf !== null){ cancelAnimationFrame(_lv3d.raf); _lv3d.raf = null; }",
     "function lv3dDetener(){\n  if (false){ cancelAnimationFrame(_lv3d.raf); _lv3d.raf = null; }",
     ['OFF-1', 'OFF-3']),

    ('M42 el dibujante de la captura se separa del de la pantalla',
     "  lv3dPintar(ctx, W, LV3D_H, pal, false);",
     "  ctx.fillStyle = '#888'; ctx.fillRect(40, 40, W-80, LV3D_H-80);",
     ['P4-13b', 'P4-30']),
]

def correr(raiz_mut):
    env = dict(os.environ, VI3D_RAIZ=raiz_mut)
    try:
        r = subprocess.run(['node', SONDA], capture_output=True, text=True,
                           timeout=420, env=env, cwd=RAIZ)
    except subprocess.TimeoutExpired:
        return None, 'TIMEOUT'
    salida = (r.stderr or '') + (r.stdout or '')
    # ⚠️ GUARDA 3: sin RESULTADO no se puntua.
    if 'RESULTADO:' not in salida:
        return None, 'NO CORRIO (sin RESULTADO)'
    rojas = set(re.findall(r'^\s*✗ (.+)$', salida, re.M))
    m = re.search(r'RESULTADO: (\d+)/(\d+)', salida)
    return (rojas, m.group(0)), None


def main():
    h0 = md5(VIVO)
    print('index.html vivo md5 = %s' % h0)

    base = tempfile.mkdtemp(prefix='mut_vi3dc_base_')
    shutil.copy2(VIVO, os.path.join(base, 'index.html'))
    shutil.copytree(os.path.join(RAIZ, 'tests'), os.path.join(base, 'tests'))
    fuente = open(os.path.join(base, 'index.html'), encoding='utf-8').read()

    # ── LINEA BASE sobre la copia, antes de leer ninguna mutacion ──
    print('\n== LINEA BASE (sobre la copia, sin mutar) ==')
    res, err = correr(base)
    if err:
        print('  ABORTO: la linea base %s' % err)
        return 2
    rojas_base, marca = res
    print('  %s' % marca)
    if rojas_base:
        print('  ABORTO: hay %d aserciones ROJAS de entrada. Con la base en rojo, toda mutacion'
              ' sale «en rojo» sin probar nada:' % len(rojas_base))
        for r in sorted(rojas_base):
            print('     ✗ %s' % r)
        return 2
    print('  base limpia: toda mutacion que ponga algo en rojo lo hizo ella')

    print('\n== MUTACIONES ==')
    # `--solo M27 M27b` corre un subconjunto. Sirve para volver sobre un superviviente sin pagar
    # las 45 de nuevo; el resumen dice sobre cuantas se calculo, para que no se lea como total.
    solo = sys.argv[sys.argv.index('--solo') + 1:] if '--solo' in sys.argv else None
    lista = [m for m in MUTACIONES if not solo or m[0].split()[0] in solo]
    if solo:
        print('  (subconjunto: %s — %d de %d)' % (', '.join(solo), len(lista), len(MUTACIONES)))
    muertas, vivas, noaplica, redundantes = [], [], [], []
    for mut in lista:
        nom, viejo, nuevo, esperadas = mut[0], mut[1], mut[2], mut[3]
        motivo_redundante = mut[4] if len(mut) > 4 else None
        n = fuente.count(viejo)
        if n != 1:
            noaplica.append((nom, 'el patron aparece %d veces, no 1' % n))
            print('  ⊘ %-78s ANCLA MALA (%d)' % (nom[:78], n))
            continue
        d = tempfile.mkdtemp(prefix='mut_vi3dc_')
        try:
            open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(
                fuente.replace(viejo, nuevo, 1))
            os.symlink(os.path.join(base, 'tests'), os.path.join(d, 'tests'))
            res, err = correr(d)
            if err:
                noaplica.append((nom, err))
                print('  ⊘ %-78s %s' % (nom[:78], err))
                continue
            rojas, marca = res
            # ¿Se pusieron rojas las que le tocan a ESTA mutacion?
            pegadas = [e for e in esperadas if any(e in r for r in rojas)]
            if pegadas:
                muertas.append((nom, pegadas, marca))
                print('  ✓ MUERTA  %-70s %s' % (nom[:70], marca))
                print('            rojas esperadas: %s' % ', '.join(pegadas))
            elif motivo_redundante:
                redundantes.append((nom, motivo_redundante, marca))
                print('  ◎ REDUNDANTE  %-66s %s' % (nom[:66], marca))
                print('            %s' % motivo_redundante)
            else:
                vivas.append((nom, esperadas, marca, sorted(rojas)))
                print('  ✗ SOBREVIVIO  %-66s %s' % (nom[:66], marca))
                print('            esperaba rojo en: %s' % ', '.join(esperadas))
                print('            rojas reales: %s' % (', '.join(sorted(rojas)) or 'ninguna'))
        finally:
            shutil.rmtree(d, ignore_errors=True)

    h1 = md5(VIVO)
    print('\nindex.html vivo md5 = %s' % h1)
    if h1 != h0:
        print('⚠️ ABORTO: el archivo vivo CAMBIO durante la corrida. Ninguna medicion vale.')
        return 2
    print('✅ el archivo vivo no se toco en ningun momento')

    print('\n== RESUMEN ==')
    print('  muertas:                 %d/%d' % (len(muertas), len(lista)))
    print('  redundantes (esperadas): %d' % len(redundantes))
    print('  SOBREVIVIERON:           %d' % len(vivas))
    print('  no aplicaron:            %d' % len(noaplica))
    for nom, why in noaplica:
        print('     ⊘ %s — %s' % (nom, why))
    for nom, esperadas, marca, rojas in vivas:
        print('     ✗ %s (esperaba %s)' % (nom, ', '.join(esperadas)))
    shutil.rmtree(base, ignore_errors=True)
    return 0 if (not vivas and not noaplica) else 1


if __name__ == '__main__':
    sys.exit(main())
