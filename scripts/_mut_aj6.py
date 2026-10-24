#!/usr/bin/env python3
"""
_mut_aj6.py — barrido de mutaciones de la tanda AJ6 (2026-10-24).

Mismo arnes que `_mut_pulmo.py`, con sus dos guardas: la LINEA BASE tiene que estar verde en la
copia sin mutar, y sin la linea `RESULTADO` en la salida el veredicto es NO CORRIO y no «muerta».
Cada mutacion se aplica sobre una COPIA en /tmp; el md5 del archivo vivo se sella antes y se
comprueba al final.

⚠️ LO QUE ESTE BARRIDO **NO** PUEDE PUNTUAR, y se declara en vez de disimularlo: la ventana de
Chrome del arnes abre por debajo de 1100 px, asi que ninguna de las dos maquetaciones nuevas -las
cuatro columnas del pulmon y las dos columnas de la Evidencia- se APLICA mientras el caso corre.
Por eso TC-528 y TC-529 vigilan esas dos cosas LEYENDO la regla de `document.styleSheets` y los
`style` en linea, no la geometria: M17 muta la regla y muere; una mutacion que solo cambiara
pixeles sobreviviria y se leeria igual que «no hay cobertura». Es la leccion de TC-522 (A4c).

Uso:  python3 scripts/_mut_aj6.py
"""

import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')

# (id, descripcion, viejo, nuevo, casos que TIENEN que ponerse rojos)
MUTACIONES = [
    # ── AJ6-1 · el informe en esquema y sin conducta ──
    ('M1', 'el informe vuelve al parrafo unico: se retira `lineasInf`',
     "return { clave: clave, txt: partes.join('. '), lineasInf: _rengl(),",
     "return { clave: clave, txt: partes.join('. '), lineasInf: null,",
     ['TC-527']),

    ('M2', 'se saca la fila VACIA de separacion',
     "    const L = [' ', 'Tetralog\u00eda de Fallot reparada.'];",
     "    const L = ['Tetralog\u00eda de Fallot reparada.'];",
     ['TC-527']),

    ('M3', 'la CONDUCTA vuelve al cuerpo del informe',
     "  const partes = ['Tetralog\u00eda de Fallot reparada'].concat(gPulm, gVD, gOtro);",
     "  const partes = ['Tetralog\u00eda de Fallot reparada'].concat(gPulm, gVD, gOtro, [conducta]);",
     ['TC-527']),

    ('M4', 'la frase del gradiente vuelve a la puntuacion vieja',
     "    (gradT >= 36 ? '; obstrucci\u00f3n al menos moderada (velocidad pico >3 m/s)' : '') +",
     "    (gradT >= 36 ? ' (obstrucci\u00f3n al menos moderada: velocidad pico >3 m/s)' : '') +",
     ['TC-527']),

    ('M5', 'el metodo de los volumenes vuelve al final, colgado del ultimo valor',
     "    gVD.push('Vol\u00famenes del ventr\u00edculo derecho' +\n      (volFuente ? ' (por ' + VOLF[volFuente] + ')' : '') + ': ' + volTxt.join(', ') +",
     "    gVD.push('Vol\u00famenes del ventr\u00edculo derecho: ' + volTxt.join(', ') +\n      (volFuente ? ' (por ' + VOLF[volFuente] + ')' : '') +",
     ['TC-527']),

    ('M6', 'la CIV residual se cuelga del renglon de la valvula pulmonar',
     "  if (civ === 'si') gOtro.push('Comunicaci\u00f3n interventricular residual'",
     "  if (civ === 'si') gPulm.push('Comunicaci\u00f3n interventricular residual'",
     ['TC-527']),

    # ── AJ6-2 · la Evidencia compacta ──
    ('M7', 'la seccion deja de pedir el modo compacto',
     "  return { filas: filas, bloques: bloques, compacta: true,",
     "  return { filas: filas, bloques: bloques, compacta: false,",
     ['TC-528']),

    ('M8', 'vuelve la regla vieja de plegado: solo las preguntas, y nunca una marca roja',
     "  const plegar = !!f.nota && (compacta || (!!f.ctrl && f.marca !== 'alarm' && f.marca !== 'warn'));",
     "  const plegar = !!f.ctrl && !!f.nota && f.marca !== 'alarm' && f.marca !== 'warn';",
     ['TC-528']),

    ('M9', 'el rotulo deja de ser la celda golosa',
     "      (compacta ? 'width:100%;' : '') + '\">' + _critEsc(f.lbl) +",
     "      '' + '\">' + _critEsc(f.lbl) +",
     ['TC-528']),

    ('M10', 'la botonera de cuatro opciones pierde su piso de ancho',
     "      (compacta && f.ctrl && (f.ctrl.ops || []).length > 2 ? 'min-width:170px;' : '') +",
     "      '' +",
     ['TC-528']),

    ('M11', 'la grilla deja de marcarse como compacta, asi que la regla de dos columnas no la alcanza',
     "       (compacta ? ' data-ind-compacta=\"1\"' : '') + '>';",
     "       '' + '>';",
     ['TC-528']),

    ('M12', 'el titulo del bloque plegable vuelve a llevar el contador',
     "  if (faltan.length) bloques.push({ tit:'Lo que falta contestar', plegado:true, lineas: faltan });",
     "  if (faltan.length) bloques.push({ tit:'Lo que falta contestar (' + faltan.length + ')', plegado:true, lineas: faltan });",
     ['TC-528']),

    # ── AJ6-3 · las cuatro columnas del pulmon ──
    ('M13', 'la columna de consolidacion vuelve a declararse como la de pleura',
     '      <div class="pul-col" data-pul-col="consol">',
     '      <div class="pul-col" data-pul-col="pleura">',
     ['TC-529']),

    ('M14', 'la grilla base vuelve a TRES columnas',
     "  .pul-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;align-items:start;margin-bottom:12px;}",
     "  .pul-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start;margin-bottom:12px;}",
     ['TC-529']),

    # ── AJ6-4a · Referencias y Calculadoras ──
    ('M15', 'el boton de Referencias recupera su data-mod',
     """        <button class="tab-btn tab-tool" onclick="showTab('refs')">\U0001f4da Referencias</button>""",
     """        <button class="tab-btn tab-tool" data-mod="refs" onclick="showTab('refs')">\U0001f4da Referencias</button>""",
     ['TC-530']),

    ('M16', 'la clave `calculadoras` vuelve a EE_MODULES (y el boton no la tiene: el invariante se rompe)',
     "  {key:'congenitas',   label:'\U0001f9ec CC frecuentes y complejas'}\n];",
     "  {key:'congenitas',   label:'\U0001f9ec CC frecuentes y complejas'},\n  {key:'calculadoras', label:'\U0001f9ee Calculadoras'}\n];",
     ['TC-530']),

    ('M17', 'el desplegable de movil vuelve a salir vacio en Modo Basico',
     "      if(mode==='basico'&&b.hasAttribute('data-mod'))return;",
     "      if(mode==='basico')return;",
     ['TC-530']),

    # ── AJ6-4b · el buscador ──
    ('M18', 'la guarda del gesto vuelve a ser una bandera pegajosa',
     "      if (Date.now() - _refBuscPtrTs < REF_BUSC_GESTO_MS) return;",
     "      if (_refBuscPtrTs) { _refBuscPtrTs = 0; return; }",
     ['TC-531']),

    ('M19', 'tocar un boton de arriba deja de vaciar el buscador',
     "  _refBuscLimpiar();\n  _refSubActivar(sub);\n  if (el && el.scrollIntoView)",
     "  _refSubActivar(sub);\n  if (el && el.scrollIntoView)",
     ['TC-531']),

    ('M20', 'la barra se queda sin tab stop mientras se busca',
     "             b.tabIndex = (k === _refBuscPrev) ? 0 : -1; }",
     "             b.tabIndex = -1; }",
     ['TC-531']),

    # ── DECLARADA SIN COBERTURA, y el motivo es el que vale ──
    ('M21', 'los bloques se precomputan arriba y se emiten abajo: la NUMERACION de los corchetes '
            'deja de seguir el orden de lectura en las catorce secciones ajenas',
     "  if (compacta) h += _bloRec();",
     "  const _pre = _bloRec();\n  if (compacta) h += _pre;",
     []),   # el A/B de corchetes lo caza (sonda `citas`); la suite no mira numeros de cita por seccion
]

# --solo M1,M2,...  corre solo esas, con su linea base propia
SOLO = None
for _i, _a in enumerate(sys.argv):
    if _a == '--solo' and _i + 1 < len(sys.argv):
        SOLO = {x.strip().upper() for x in sys.argv[_i + 1].split(',') if x.strip()}
if SOLO:
    MUTACIONES = [m for m in MUTACIONES if m[0].upper() in SOLO]
    if not MUTACIONES:
        print('  --solo no selecciono ninguna mutacion'); sys.exit(2)

TODOS = sorted({c for m in MUTACIONES for c in m[4]})


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def correr(base, casos):
    """Devuelve (ok_arranco, set_de_rojos). ok_arranco=False si no hubo linea RESULTADO."""
    r = subprocess.run(
        ['node', os.path.join(base, 'scripts', 'test_clinico.mjs'), '--solo', ','.join(casos)],
        cwd=base, capture_output=True, text=True, timeout=1800)
    out = (r.stdout or '') + (r.returncode and (r.stderr or '') or '')
    if 'RESULTADO' not in out:
        return False, set(), out[-600:]
    rojos = set(re.findall(r'(TC-\d+)[^\n]*✗', out))
    return True, rojos, out[-600:]


def main():
    sello = md5(VIVO)
    print('md5 del archivo VIVO antes del barrido: %s' % sello)

    base = tempfile.mkdtemp(prefix='ecosmart-mut-aj6-')
    shutil.copy2(VIVO, os.path.join(base, 'index.html'))
    shutil.copytree(os.path.join(RAIZ, 'scripts'), os.path.join(base, 'scripts'))
    # La suite lee algunos archivos del repo (tests/, docs/); se copia lo que exista y sea liviano.
    for d in ('tests',):
        o = os.path.join(RAIZ, d)
        if os.path.isdir(o):
            shutil.copytree(o, os.path.join(base, d))
    copia_idx = os.path.join(base, 'index.html')
    orig = open(copia_idx, encoding='utf-8').read()
    print('copia de trabajo: %s' % base)

    # ── GUARDA 1: la linea base tiene que estar VERDE en la copia sin mutar ──
    print('\nLINEA BASE (copia sin mutar), casos %s' % ','.join(TODOS))
    ok, rojos, cola = correr(base, TODOS)
    if not ok:
        print('  NO CORRIO — sin linea RESULTADO. Se aborta.\n' + cola)
        shutil.rmtree(base, ignore_errors=True); sys.exit(2)
    if rojos:
        print('  BASE EN ROJO (%s). Se aborta: con casos ya rojos, toda mutacion sale '
              '«muerta» sin probar nada.' % ','.join(sorted(rojos)))
        shutil.rmtree(base, ignore_errors=True); sys.exit(2)
    print('  base verde: los %d casos pasan sin mutacion.' % len(TODOS))

    resultados = []
    for mid, desc, viejo, nuevo, esperados in MUTACIONES:
        if not esperados:
            resultados.append((mid, 'SIN COBERTURA DECLARADA', desc))
            print('\n%s  %s\n  (declarada sin caso: no se puntua)' % (mid, desc))
            continue
        if orig.count(viejo) != 1:
            resultados.append((mid, 'NO APLICABLE (ancla %dx)' % orig.count(viejo), desc))
            print('\n%s  ancla encontrada %d veces, se saltea' % (mid, orig.count(viejo)))
            continue
        open(copia_idx, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
        ok, rojos, cola = correr(base, esperados)
        if not ok:
            estado = 'NO CORRIO'
        elif set(esperados) & rojos:
            estado = 'MUERTA (rojo: %s)' % ','.join(sorted(set(esperados) & rojos))
        else:
            estado = 'SOBREVIVIO'
        resultados.append((mid, estado, desc))
        print('\n%s  %s\n  -> %s' % (mid, desc, estado))

    open(copia_idx, 'w', encoding='utf-8').write(orig)

    ahora = md5(VIVO)
    print('\nmd5 del archivo VIVO despues del barrido: %s' % ahora)
    if ahora != sello:
        print('⚠️  EL ARCHIVO VIVO CAMBIO DURANTE EL BARRIDO. Resultados NO confiables.')
        shutil.rmtree(base, ignore_errors=True); sys.exit(3)
    print('md5 IGUAL: el archivo vivo no se toco.')

    print('\nRESULTADO MUTACIONES:')
    muertas = 0
    puntuadas = 0
    for mid, estado, desc in resultados:
        print('  %-5s %-28s %s' % (mid, estado, desc))
        if estado.startswith('MUERTA'):
            muertas += 1
        if estado.startswith(('MUERTA', 'SOBREVIVIO')):
            puntuadas += 1
    print('\n  %d/%d MUERTAS (de las puntuadas)' % (muertas, puntuadas))
    shutil.rmtree(base, ignore_errors=True)
    sys.exit(0 if muertas == puntuadas else 1)


if __name__ == '__main__':
    main()
