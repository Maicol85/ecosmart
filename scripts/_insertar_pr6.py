#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Insertador de la tanda PR6 — un bloque por llamada, con ancla UNICA y guardian.

Por que un insertador y no `sed`: cada bloque de esta tanda entra en un lugar
distinto de un archivo de 193.000 lineas, y un `sed` mal apuntado sobre
`index.html` cuesta mas que el tamanio del archivo (regla fija de CLAUDE.md).

El guardian hace TRES cosas antes de escribir, y aborta si alguna falla:
  1. el ancla aparece EXACTAMENTE UNA VEZ  -> si no, no se sabe donde entro;
  2. el delta de acentos graves es PAR     -> un acento grave suelto cierra un
     template literal antes de tiempo y lo que queda a veces es JS VALIDO, asi
     que `node --check` NO lo caza (lo pago PANT-31);
  3. el archivo resultante PARSEA sus bloques de JS inline.
Si (3) falla, revierte desde el respaldo y no deja el arbol a medias.
"""
import re, subprocess, sys, shutil, os

RUTA = 'index.html'

def acentos(s):
    """Acentos graves que NO van escapados con barra invertida."""
    return len(re.findall(r'(?<!\\)`', s))

def insertar(ancla, bloque, despues=True, reemplazar=False):
    with open(RUTA, encoding='utf-8') as f:
        txt = f.read()
    n = txt.count(ancla)
    if n != 1:
        print('ABORTA: el ancla aparece %d veces (tiene que ser 1):\n  %r' % (n, ancla[:90]))
        return False
    ag_antes = acentos(txt)
    if reemplazar:
        nuevo = txt.replace(ancla, bloque)
    elif despues:
        nuevo = txt.replace(ancla, ancla + bloque)
    else:
        nuevo = txt.replace(ancla, bloque + ancla)
    delta = acentos(nuevo) - ag_antes
    if delta % 2 != 0:
        print('ABORTA: delta de acentos graves IMPAR (%d) — un template quedaria abierto' % delta)
        return False
    shutil.copy2(RUTA, RUTA + '.pr6bak')
    with open(RUTA, 'w', encoding='utf-8') as f:
        f.write(nuevo)
    r = subprocess.run([sys.executable, 'scripts/check_js_inline.py'],
                       capture_output=True, text=True)
    sal = (r.stdout + r.stderr)
    if 'todos parsean' not in sal or r.returncode != 0:
        print('ABORTA: el archivo no parsea. Se revierte.\n' + sal[-900:])
        shutil.copy2(RUTA + '.pr6bak', RUTA)
        return False
    os.remove(RUTA + '.pr6bak')
    print('OK (delta acentos %d) | %s' % (delta, sal.strip().splitlines()[-1] if sal.strip() else ''))
    return True
