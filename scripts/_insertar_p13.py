#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inserta los casos de la tanda P13 en scripts/test_clinico.mjs.

GUARDIAN DE ACENTOS GRAVES. El cuerpo de un caso es un template literal: un acento grave en un
comentario mio lo cierra antes de tiempo, y cuando lo que queda es JS VALIDO `node --check` NO lo
ve — es la trampa que esta casa paga desde hace treinta y tres tandas. Por eso:
  · el archivo de casos se escribe con el marcador BT en lugar del acento grave;
  · este script ABORTA si encuentra UN SOLO acento grave en ese archivo;
  · y ABORTA si el archivo destino no parsea despues de insertar (lo comprueba quien lo llama).
Asi el acento grave no puede entrar por descuido: no se escribe nunca a mano.
"""
import io, os, subprocess, sys

ORIG = sys.argv[1] if len(sys.argv) > 1 else None
DEST = 'scripts/test_clinico.mjs'
if not ORIG or not os.path.exists(ORIG):
    sys.exit('falta la ruta del archivo de casos')

casos = io.open(ORIG, encoding='utf-8').read()
n = casos.count('`')
if n:
    sys.exit('ABORTA: el archivo de casos tiene %d acento(s) grave(s). Se escriben con BT.' % n)
if 'BT' not in casos:
    sys.exit('ABORTA: no hay ningun marcador BT; el cuerpo de un caso no puede quedar sin delimitar.')

cuerpo = casos.replace('BT', '`')
dest = io.open(DEST, encoding='utf-8').read()

# se inserta ANTES de la linea que cierra la lista de casos: el ultimo `caso(` del archivo.
i = dest.rfind("\ncaso('")
if i < 0:
    sys.exit('ABORTA: no encuentro donde insertar')
# el final del ultimo caso: su `);` de cierre en una linea propia
j = dest.find('\n`);', i)
if j < 0:
    sys.exit('ABORTA: no encuentro el cierre del ultimo caso')
j += len('\n`);')
nuevo = dest[:j] + '\n\n' + cuerpo.strip() + '\n' + dest[j:]
io.open(DEST, 'w', encoding='utf-8').write(nuevo)
r = subprocess.run(['node', '--check', DEST], capture_output=True, text=True)
if r.returncode != 0:
    io.open(DEST, 'w', encoding='utf-8').write(dest)      # se revierte
    sys.exit('ABORTA: el destino no parsea tras insertar; se revirtio.\n' + r.stderr[:500])
print('insertados %d casos. El destino parsea.' % cuerpo.count("caso('TC-"))
