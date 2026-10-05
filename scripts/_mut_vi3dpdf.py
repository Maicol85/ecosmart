#!/usr/bin/env python3
"""
_mut_vi3dpdf.py — arnes TEMPORAL de mutaciones para la tanda
«Casilla "Incluir diagrama 3D en el PDF" + disposiciones + captura de fondo blanco».

Cada cableado de esta tanda tiene que poder ponerse ROJO: un caso que no se puede hacer fallar no
esta probando nada. Aca se revierte uno por vez y se exige que la asercion que le corresponde pase
de verde a rojo.

LAS TRES GUARDAS DEL ARNES ANTERIOR, iguales y por los mismos defectos reales de este repo:
 1. NUNCA se muta el archivo vivo: se trabaja sobre una COPIA en /tmp.
 2. md5 del archivo vivo ANTES y DESPUES; si cambio en el medio, se aborta.
 3. SE EXIGE la linea «RESULTADO» en la salida antes de puntuar. Sin ella el veredicto es
    NO CORRIO, no «sobrevivio» — ese defecto exacto reporto 7 falsos en este repo.

Y la linea base se mide PRIMERO.

Uso:  python3 scripts/_mut_vi3dpdf.py
      python3 scripts/_mut_vi3dpdf.py --solo M14 M17
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
SONDA = os.path.join(RAIZ, 'scripts', '_probe_vi3dpdf.mjs')


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for ch in iter(lambda: f.read(1 << 20), b''):
            h.update(ch)
    return h.hexdigest()


# (nombre, viejo, nuevo, aserciones que DEBEN ponerse rojas, [motivo si se ESPERA que sobreviva])
MUTACIONES = [
    # ── P2a: la captura de fondo blanco fijo ──
    ('M01 la captura vuelve a leer el fondo del tema de la app',
     "  const pal  = LV3D_CAP_PAL;          // fija y blanca: el PNG no depende del tema de la app",
     "  const pal  = Object.assign({}, LV3D_CAP_PAL, { fondo:((getComputedStyle(document.documentElement).getPropertyValue('--bg3') || '').trim() || '#1e2333') });",
     ['B-1', 'B-4']),

    ('M02 los TEXTOS del PNG vuelven a salir del tema (claros sobre blanco en tema oscuro)',
     "const LV3D_CAP_PAL = { fondo:'#ffffff', texto:'#1e1e1e', texto2:'#4a5163', borde:'#cfd6e6' };",
     "const LV3D_CAP_PAL = { fondo:'#ffffff', texto:'#e8ecf4', texto2:'#9aa3bc', borde:'#cfd6e6' };",
     ['B-10b']),

    ('M03 el PNG vuelve a salir transparente (sin fondo opaco)',
     "  ctx.fillStyle = pal.fondo;\n  ctx.fillRect(0, 0, W, H);\n\n  lv3dPintar(ctx, W, LV3D_H, pal, false);",
     "  lv3dPintar(ctx, W, LV3D_H, pal, true);",
     ['B-2']),

    ('M04 el PNG pierde el marco y se funde con la hoja blanca',
     "  ctx.strokeStyle = pal.borde; ctx.lineWidth = 1;\n  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);",
     "  ctx.strokeStyle = pal.borde; ctx.lineWidth = 1;",
     ['B-3']),

    ('M05 el PNG del modo territorio pierde la leyenda de tonos',
     "  const ALTO_LEY = terr ? (LV3D_CAP_LEY_CAB + ters.length*LV3D_CAP_LEY_FILA + 10) : 0;",
     "  const ALTO_LEY = 0;",
     ['B-7', 'B-9']),

    ('M06 el PNG pierde la frase «Modelo esquematico» del pie',
     "  ctx.fillText(LV3D_CAP_FRASE, 14, y);",
     "  if (false) ctx.fillText(LV3D_CAP_FRASE, 14, y);",
     ['B-6'],
     'SOBREVIVE Y SE DECLARA, CON LA MEDICION: B-6 cuenta la tinta de TODA la franja del pie, y la '
     'frase es la segunda de dos lineas mas el separador; sacandola la franja baja de 26.191 a '
     '~17.000 subpixeles, que sigue estando muy por encima del piso de 200 y muy por debajo del '
     'techo del 50 %. Para matarla haria falta contar la tinta por RENGLON y no por franja, y un '
     'conteo por renglon se rompe el dia que el pie cambie de alto — cambiaria la prueba por una '
     'mas fragil a cambio de cubrir un borrado que ninguna edicion plausible produce. La frase SI '
     'esta cubierta por el ojo en el PDF generado, que es como se verifico esta tanda.'),

    # ── P2b: ni rastro del aviso «desactualizada» ──
    ('M07 vuelve el aviso «desactualizada» a la miniatura',
     "    txt.textContent = 'Captura · ' + c.fase + ' · '",
     "    txt.textContent = '⚠️ Desactualizada · Captura · ' + c.fase + ' · '",
     ['D-1', 'D-2', 'D-3', 'D-4']),

    ('M08 el getter vuelve a exponer el campo «desactualizada»',
     "  return { url:c.url, fase:c.fase, modo:c.modo, tema:c.tema, ancho:c.ancho, alto:c.alto };",
     "  return { url:c.url, fase:c.fase, modo:c.modo, tema:c.tema, ancho:c.ancho, alto:c.alto, desactualizada:false };",
     ['D-5']),

    ('M09 capturar de nuevo NO reemplaza (se acumulan capturas)',
     "  _lv3d.cap = { url: cv.toDataURL('image/png'),",
     "  if (_lv3d.cap) { lv3dCapRender(); return; }\n  _lv3d.cap = { url: cv.toDataURL('image/png'),",
     ['D-8']),

    ('M10 «Quitar» no descarta la captura',
     "function lv3dCapQuitar(){\n  if (!_lv3d.cap) return;\n  _lv3d.cap = null;",
     "function lv3dCapQuitar(){\n  if (!_lv3d.cap) return;",
     ['D-9', 'C-9']),

    # ── P3: la casilla ──
    ('M11 la casilla NO se desmarca al descartar la captura',
     "    if (pdf){ pdf.checked = false; pdf.disabled = true; }",
     "    if (pdf){ pdf.disabled = true; }",
     ['C-9', 'C-11', 'C-12', 'C-13']),

    ('M12 la casilla NO se deshabilita sin captura (se puede marcar sin imagen detras)',
     "    if (pdf){ pdf.checked = false; pdf.disabled = true; }",
     "    if (pdf){ pdf.checked = false; }",
     ['C-3', 'C-4']),

    ('M13 la casilla arranca HABILITADA en el HTML (ventana entre el parseo y el primer render)',
     '<input type="checkbox" class="lv3d-cap-pdf" data-ui disabled',
     '<input type="checkbox" class="lv3d-cap-pdf" data-ui',
     ['C-1']),

    ('M14 la casilla lleva id y la levantan los barridos del estudio',
     '<input type="checkbox" class="lv3d-cap-pdf" data-ui disabled',
     '<input type="checkbox" id="lv3d-cap-pdf" class="lv3d-cap-pdf" data-ui disabled',
     ['C-2', 'Z-3']),

    ('M15 el getter del PDF NO mira la casilla (la captura entra sin que la marquen)',
     "  const pdf = document.querySelector('#lv3d-cap .lv3d-cap-pdf');\n  if (!pdf || !pdf.checked) return null;",
     "  const pdf = document.querySelector('#lv3d-cap .lv3d-cap-pdf');",
     ['C-5', 'P-2']),

    ('M16 el getter del PDF NO mira la captura en memoria (se queda con la casilla sola)',
     "window.lv3dCapturaParaPDF = function(){\n  if (!_lv3d.cap) return null;",
     "window.lv3dCapturaParaPDF = function(){",
     ['S-1', 'S-2', 'S-3'],
     'SOBREVIVE POR REDUNDANCIA, Y ES EXACTAMENTE EL PUNTO DE LA DOBLE COMPUERTA: sacada la '
     'primera, la segunda sigue cerrando — lv3dCaptura() ya devuelve null sin captura en memoria, '
     'y ademas lv3dCapRender desmarca la casilla en los cuatro descartes. O sea que hoy NINGUNA '
     'de las dos sola deja pasar nada. Se deja igual porque lo que protege es el dia que una de '
     'las dos se rompa: con una sola compuerta, romperla es un PDF firmado con la imagen del '
     'paciente anterior. No hay asercion honesta que distinga las dos versiones mientras las dos '
     'compuertas funcionen.'),

    ('M17 capturar de nuevo DESMARCA la casilla',
     "  if (pdf) pdf.disabled = false;      // `checked` NO se toca: lo decide el médico",
     "  if (pdf) { pdf.disabled = false; pdf.checked = false; }",
     ['C-7']),

    ('M18 generar el PDF desmarca la casilla',
     "  const _cap3d = (typeof window.lv3dCapturaParaPDF === 'function') ? window.lv3dCapturaParaPDF() : null;",
     "  const _cap3d = (typeof window.lv3dCapturaParaPDF === 'function') ? window.lv3dCapturaParaPDF() : null;\n  { const _c = document.querySelector('#lv3d-cap .lv3d-cap-pdf'); if (_c) _c.checked = false; }",
     ['C-8']),

    # ── P4: la disposicion ──
    ('M19 la captura no entra al PDF (se corta el cableado entero)',
     "  const _cap3d = (typeof window.lv3dCapturaParaPDF === 'function') ? window.lv3dCapturaParaPDF() : null;",
     "  const _cap3d = null;",
     ['P-7', 'P-9', 'P-10', 'P-11', 'S-0']),

    ('M20 la captura se dibuja CUADRADA (se deforma el ventriculo)',
     "        doc.addImage(col.data, 'PNG', _imgX, _imgY, _imgW, _imgH);",
     "        doc.addImage(col.data, 'PNG', _imgX, _imgY, _imgW, _imgW);",
     ['P-8', 'P-13']),

    ('M21 el strain NO baja a la segunda fila: tres columnas en una',
     "    if (_colSgl) { if (_fila1.length >= 2) _fila2.push(_colSgl); else _fila1.push(_colSgl); }",
     "    if (_colSgl) { _fila1.push(_colSgl); }",
     ['P-9']),

    ('M22 la captura va a la IZQUIERDA del bull-s eye',
     "    const _fila1 = [_colContr, _colCap].filter(Boolean);",
     "    const _fila1 = [_colCap, _colContr].filter(Boolean);",
     ['P-7', 'P-9']),

    ('M23 se saca el TOPE DE ANCHO: la captura sola se estira a la hoja y su letra se dispara',
     "        let _imgW = col.ar ? Math.min(_PDF_CAP_ANCHO_MAX, _dispo) : Math.min(_PDF_DIANA_LADO, _dispo);",
     "        let _imgW = col.ar ? _dispo : Math.min(_PDF_DIANA_LADO, _dispo);",
     ['P-17', 'P-18', 'P-20']),

    ('M24 los cuerpos de letra del PNG vuelven a los de pantalla (ilegibles en media hoja)',
     "const LV3D_CAP_F_FASE = 26, LV3D_CAP_F_FRASE = 23;   // pie\nconst LV3D_CAP_F_GRADO = 17, LV3D_CAP_F_TER = 19;    // cabecera y filas de la leyenda de tonos",
     "const LV3D_CAP_F_FASE = 14, LV3D_CAP_F_FRASE = 12;   // pie\nconst LV3D_CAP_F_GRADO = 9, LV3D_CAP_F_TER = 10;    // cabecera y filas de la leyenda de tonos",
     ['P-19']),

    ('M25 el rotulo de la banda no nombra el diagrama 3D',
     "        rotulo: 'DIAGRAMA 3D',",
     "        rotulo: 'CONTRACTILIDAD',",
     ['P-14']),

    ('M26 el rotulo de dos columnas deja de ser el literal viejo',
     "              : (_rs.slice(0, -1).join(', ') + ' Y ' + _rs[_rs.length - 1]));",
     "              : _rs.join(' + '));",
     ['P-15']),

    ('M27 con una sola columna el rotulo deja de ser su titulo (cambia el caso que ya existia)',
     "      drawBar(_todas.length === 1 ? _todas[0].title.toUpperCase()",
     "      drawBar(_todas.length === 2 ? _todas[0].title.toUpperCase()",
     ['P-16']),

    ('M28 la captura no se centra en su columna',
     "        const _imgX = _cx0 + _legW + (_colW - _legW - _imgW) / 2;",
     "        const _imgX = _cx0 + _legW;",
     ['P-18']),

    ('M29 el checkPage no presupuesta el alto real de la imagen',
     "      checkPage(Math.max(88, 2 + _altoImgFila(_fila1, _anchoCol(_fila1)) + 20));",
     "      checkPage(88);",
     ['P-12'],
     'SOBREVIVE Y SE DECLARA, CON EL NUMERO: con el tope de ancho en 120 mm la captura mas alta '
     'mide 105 mm, y el bloque arranca en y=64,7 sobre un _yMax de 284 — o sea que el presupuesto '
     'viejo de 88 alcanza igual y el recorte por MediaBox no se produce. Solo muerde cuando el '
     'bloque arranca por debajo de y~170, que pasa en un informe con ETE, imagenes o un texto de '
     'motilidad largo: escenas que la sonda no monta. La guarda se deja porque lo que evita es un '
     'informe FIRMADO recortado sin aviso, y porque el dia que el tope de ancho suba vuelve a '
     'morder. Cobertura automatica de esa rama: NO HAY, y se dice.'),

    ('M30 la segunda fila no comprueba que entre en la hoja',
     "      if (_conSalto) { checkPage(2 + _altoImgFila(_cols, _colW) + 20); y += _aire(2); }",
     "      if (_conSalto) { y += _aire(2); }",
     ['P-12'],
     'SOBREVIVE POR EL MISMO MOTIVO MEDIDO QUE M29: en el caso 111 la segunda fila arranca en '
     'y=155,7 y la diana del strain mide 54, o sea termina en 209,7 sobre un _yMax de 284. El '
     'salto de pagina no hace falta en la escena que la sonda puede montar, y solo hace falta '
     'cuando la fila de arriba llego larga. Declarado, no tapado.'),

    # ── Lo que NO se tenia que mover ──
    # ⚠️ EL ANCLA TUVO QUE SER LA FIRMA DE LA FUNCION. Ni el fillRect blanco ni la linea de
    # geometria sirven: las dos aparecen TRES veces en el archivo —las comparten el bull's eye
    # SVG de contractilidad, el de strain y este generador de dataURL—. Un ancla ambigua no muta
    # «otra cosa»: el arnes la rechaza (ANCLA MALA) y la mutacion no corre, que es por lo que
    # existe esa guarda.
    ('M31 bullseyeDataURL cambia (y con el, el PDF y el PPT de todos los estudios)',
     "function bullseyeDataURL(getColor){\n  const S=320, k=2;",
     "function bullseyeDataURL(getColor){\n  const S=318, k=2;",
     ['Z-1']),

    ('M32 la captura se mete en un campo del estudio (y se guarda en disco)',
     "  lv3dCapRender();\n  if (typeof toast === 'function') toast('\U0001f4f7 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     "  lv3dCapRender();\n  { const e = document.getElementById('otras_notas'); if (e) e.value = _lv3d.cap.url; }\n  if (typeof toast === 'function') toast('\U0001f4f7 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     ['Z-3']),

    ('M33 la captura se persiste en localStorage',
     "  lv3dCapRender();\n  if (typeof toast === 'function') toast('\U0001f4f7 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     "  lv3dCapRender();\n  try { localStorage.setItem('lv3d_captura', _lv3d.cap.url); } catch (e) {}\n  if (typeof toast === 'function') toast('\U0001f4f7 Imagen del 3D capturada (' + _lv3d.cap.fase + ')');",
     ['Z-4']),

    ('M34 limpiar el estudio NO descarta la captura (fuga entre pacientes)',
     "  if (typeof lv3dNuevoPaciente === 'function') lv3dNuevoPaciente();",
     "  if (false) lv3dNuevoPaciente();",
     ['C-11', 'C-12', 'S-1', 'S-2', 'S-4']),

    ('M35 cerrar sesion NO descarta la captura',
     "  if (typeof lv3dNuevoPaciente === 'function') { try { lv3dNuevoPaciente(); } catch (e) {} }",
     "  if (false) { try { lv3dNuevoPaciente(); } catch (e) {} }",
     ['C-13', 'S-3'],
     'SOBREVIVE POR REDUNDANCIA, Y ES A PROPOSITO — mismo caso que la tanda anterior: en el camino '
     'que mide la sonda, cerrarSesionReal() con el estudio cargado, limpiarCampos ya corrio por la '
     'puerta de cerrarSesion y la captura ya esta descartada. Esta linea NO es redundante cuando '
     '_hayAlgoSinGuardar() devuelve null —el fallback para cuando el bloque 12 no parseo—: ahi '
     'cerrarSesion NO llama a limpiarCampos y esta es la unica que descarta. Ese estado no se '
     'puede montar desde la sonda sin romper el bloque 12.'),
]


def correr(raiz_mut):
    env = dict(os.environ, VI3D_RAIZ=raiz_mut)
    try:
        r = subprocess.run(['node', SONDA], capture_output=True, text=True,
                           timeout=600, env=env, cwd=RAIZ)
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

    base = tempfile.mkdtemp(prefix='mut_vi3dp_base_')
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
        d = tempfile.mkdtemp(prefix='mut_vi3dp_')
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
            pegadas = [e for e in esperadas if any(e == r.split(' ')[0] for r in rojas)]
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

    print('\n== RESUMEN (sobre %d mutaciones corridas) ==' % len(lista))
    print('  muertas:      %d' % len(muertas))
    print('  redundantes:  %d  (declaradas, con el motivo medido)' % len(redundantes))
    print('  SOBREVIVIO:   %d' % len(vivas))
    print('  no aplicaron: %d' % len(noaplica))
    for nom, motivo in noaplica:
        print('     ⊘ %s — %s' % (nom, motivo))
    for nom, esp, marca, rojas in vivas:
        print('     ✗ %s' % nom)
    shutil.rmtree(base, ignore_errors=True)
    return 1 if vivas or noaplica else 0


if __name__ == '__main__':
    sys.exit(main())
