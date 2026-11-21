#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inserta un caso en scripts/test_clinico.mjs leyendo su CUERPO de un archivo aparte.

⚠️ EL ACENTO GRAVE DENTRO DEL CUERPO ES LA TRAMPA QUE ESTA CASA PAGO TREINTA Y DOS TANDAS
   SEGUIDAS: el cuerpo es un template literal del runner, asi que UN acento grave lo cierra antes
   de tiempo. A veces lo que queda es JS valido y `node --check` PASA, asi que lo unico que lo
   caza de verdad es CONTARLOS antes de insertar. Este script ABORTA si encuentra uno, y aborta
   tambien con una barra invertida, que no sobrevive al template.

   Uso:  _insertar_p7.py <TC-id> <titulo.txt> <cuerpo.js> [<comentario.txt>]
"""
import io, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RAIZ, 'scripts', 'test_clinico.mjs')
ANCLA = '\ntry {\n  const s = await servir(); servidor = s.srv;\n'

def leer(p):
    return io.open(p, encoding='utf-8').read()

def main():
    tc = sys.argv[1]
    titulo = leer(sys.argv[2]).strip()
    cuerpo = leer(sys.argv[3])
    coment = leer(sys.argv[4]).rstrip() + '\n' if len(sys.argv) > 4 else ''

    # El comentario va FUERA del template -- es un bloque suelto antes de `caso(` -- asi que ahi
    # un acento grave es codigo normal y no cierra nada. Dentro del titulo y del cuerpo, no.
    for nom, txt in (('titulo', titulo), ('cuerpo', cuerpo)):
        n = txt.count('`')
        if n:
            sys.exit('ABORTA: %d acento(s) grave(s) en el %s de %s' % (n, nom, tc))
    if '\\' in cuerpo:
        sys.exit('ABORTA: barra invertida en el cuerpo de %s (no sobrevive al template)' % tc)
    if "'" in titulo:
        sys.exit('ABORTA: apostrofe en el titulo de %s' % tc)

    s = leer(DEST)
    if ("caso('" + tc + "'") in s:
        sys.exit('ABORTA: %s ya existe' % tc)
    if s.count(ANCLA) != 1:
        sys.exit('ABORTA: el ancla no aparece exactamente una vez')

    bloque = coment + "caso('" + tc + "', '" + titulo + "', `\n" + cuerpo.rstrip('\n') + "\n`);\n"
    s = s.replace(ANCLA, '\n' + bloque + ANCLA, 1)
    io.open(DEST, 'w', encoding='utf-8').write(s)
    print('ok: %s insertado (%d caracteres de cuerpo)' % (tc, len(cuerpo)))

main()
