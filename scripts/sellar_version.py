#!/usr/bin/env python3
"""sellar_version.py — escribe el sello de version de EcoSmart.

POR QUE EXISTE
    Una pestana abierta hace dias sirve una copia vieja del HTML sin un solo error en consola:
    las secciones nuevas simplemente NO ESTAN, y eso se ve identico a la app rota. Ya costo tres
    diagnosticos, el ultimo medio dia sobre un archivo de cuatro dias. El sello lo convierte en
    un vistazo al pie.

QUE ESCRIBE — las tres salidas salen del MISMO instante, que es todo el punto:
    index.html   ECO_BUILD     cadena YYYYMMDD-HHMM en hora LOCAL, para mostrar
                 ECO_BUILD_MS  epoch en milisegundos, para COMPARAR
    version.json {"build": "...", "ms": ...}  — lo que la app pide al arrancar

    Dos constantes y no una a proposito: comparar la cadena local contra una fecha UTC es un
    error de tres horas que aparece y desaparece con el huso.

CUANDO CORRERLO
    ANTES de `git add` en cualquier commit que toque index.html. Si el sello queda viejo no se
    rompe nada —el aviso llega tarde, no de mas— pero el pie miente sobre que version se esta
    mirando, que es justo lo que este script viene a evitar.

        python3 scripts/sellar_version.py            # sella con la hora actual
        python3 scripts/sellar_version.py --check    # no escribe; sale 1 si esta desfasado

    `--check` compara el sello contra la fecha de modificacion de index.html: sirve para
    engancharlo a un pre-push y enterarse antes de publicar.
"""
import io
import json
import os
import re
import sys
import time

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(RAIZ, 'index.html')
JSON = os.path.join(RAIZ, 'version.json')

RE_STAMP = re.compile(r"(const ECO_BUILD\s*=\s*')([^']*)(';\s*/\* eco-build-stamp \*/)")
RE_MS = re.compile(r"(const ECO_BUILD_MS\s*=\s*)(\d+)(;\s*/\* eco-build-ms \*/)")
# El pie es HTML ESTATICO y no lo pinta JS: el sello tiene que verse tambien cuando la app se
# quedo sin JavaScript, que es cuando mas falta hace. Por eso es la tercera superficie a sellar.
RE_PIE = re.compile(r'(<span id="eco-build-sello">)([^<]*)(</span>)')


def leer():
    s = io.open(HTML, encoding='utf-8').read()
    m1, m2, m3 = RE_STAMP.search(s), RE_MS.search(s), RE_PIE.search(s)
    if not m1 or not m2 or not m3:
        print('✗ No encontre los marcadores del sello en index.html.')
        print('  Se esperan las dos lineas, con sus comentarios marcadores intactos:')
        print("      const ECO_BUILD    = '...';   /* eco-build-stamp */")
        print('      const ECO_BUILD_MS = ...;     /* eco-build-ms */')
        print('      <span id="eco-build-sello">v...</span>')
        sys.exit(2)
    return s, m1, m2, m3


def main():
    chequear = '--check' in sys.argv
    s, m1, m2, m3 = leer()

    if chequear:
        ms = int(m2.group(2))
        if ms == 0:
            print('✗ index.html no esta sellado todavia (ECO_BUILD_MS = 0).')
            return 1
        # La fecha de modificacion del archivo es lo unico comparable sin depender de git.
        desfase = os.path.getmtime(HTML) - ms / 1000.0
        if not os.path.exists(JSON):
            print('✗ Falta version.json — la app no va a poder comparar y el aviso nunca sale.')
            return 1
        try:
            j = json.load(io.open(JSON, encoding='utf-8'))
        except Exception as e:
            print('✗ version.json no es JSON valido: %s' % e)
            return 1
        if m3.group(2) != 'v' + m1.group(2):
            print('✗ El pie y la constante tienen sellos DISTINTOS.')
            print('  pie       : %s' % m3.group(2))
            print('  ECO_BUILD : v%s' % m1.group(2))
            return 1
        if j.get('ms') != ms or j.get('build') != m1.group(2):
            print('✗ version.json y index.html tienen sellos DISTINTOS.')
            print('  index.html : %s (%d)' % (m1.group(2), ms))
            print('  version.json: %s (%s)' % (j.get('build'), j.get('ms')))
            return 1
        if desfase > 600:
            print('✗ El sello quedo viejo: index.html se modifico %d min despues de sellarlo.'
                  % (desfase / 60))
            print('  Corre:  python3 scripts/sellar_version.py')
            return 1
        print('✓ Sello al dia: v%s' % m1.group(2))
        return 0

    ahora = time.time()
    ms = int(ahora * 1000)
    stamp = time.strftime('%Y%m%d-%H%M', time.localtime(ahora))

    s = RE_STAMP.sub(lambda m: m.group(1) + stamp + m.group(3), s, count=1)
    s = RE_MS.sub(lambda m: m.group(1) + str(ms) + m.group(3), s, count=1)
    s = RE_PIE.sub(lambda m: m.group(1) + 'v' + stamp + m.group(3), s, count=1)
    io.open(HTML, 'w', encoding='utf-8').write(s)

    # separators sin espacios: el archivo se sirve en cada arranque de la app.
    io.open(JSON, 'w', encoding='utf-8').write(
        json.dumps({'build': stamp, 'ms': ms}, separators=(',', ':')) + '\n')

    print('✓ Sellado v%s' % stamp)
    print('  index.html   ECO_BUILD / ECO_BUILD_MS / pie')
    print('  version.json %s' % json.dumps({'build': stamp, 'ms': ms}, separators=(',', ':')))
    print('  Acordate de incluir los DOS archivos en el commit.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
