#!/usr/bin/env python3
"""Inserta los casos de PR7 en scripts/test_clinico.mjs, con guardian.

TRES COSAS QUE ESTE GUARDIAN IMPIDE, y las tres las pago esta casa:
  1) UN ACENTO GRAVE DE MAS en el cuerpo de un caso. El cuerpo es un template literal: uno en un
     comentario lo cierra antes de tiempo, y cuando lo que queda es JS VALIDO `node --check`
     PASA y el runner registra el caso con `fn` igual a un numero. Se cuentan y se exige el par
     exacto: dos por caso.
  2) LOS CASOS INSERTADOS DESPUES DE LA COLA DEL RUNNER. Si el ancla cae despues del bloque
     `finally` que cierra Chrome, los casos no se registran y el suite informa «0/0 sin
     regresiones»: el peor rojo posible, porque parece verde.
  3) UNA BARRA INVERTIDA SUELTA. Dentro del template, `\\s` llega como `s` y el patron mide otra
     cosa en silencio. Se exige que toda barra invertida del bloque venga DOBLADA.
"""
import re, sys, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DST = RAIZ / 'scripts' / 'test_clinico.mjs'
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-501/pr7/casos.txt')

bloque = SRC.read_text(encoding='utf-8').rstrip('\n')
n_casos = len(re.findall(r"^caso\('TC-\d+'", bloque, re.M))
graves = bloque.count('`')
if n_casos == 0:
    sys.exit('ABORTA: el bloque no declara ningun caso')
if graves != n_casos * 2:
    sys.exit('ABORTA: %d acentos graves para %d casos (se esperan %d)' % (graves, n_casos, n_casos * 2))
sueltas = [l for l in bloque.split('\n') if re.search(r'(?<!\\)\\(?!\\)', l)]
if sueltas:
    sys.exit('ABORTA: barra invertida SIN doblar en %d linea(s): %s' % (len(sueltas), sueltas[0][:80]))

txt = DST.read_text(encoding='utf-8')
ids = re.findall(r"^caso\('(TC-\d+)'", bloque, re.M)
for i in ids:
    if ("caso('" + i + "'") in txt:
        sys.exit('ABORTA: %s ya existe en el runner' % i)

# El ancla: el ULTIMO `caso(` del archivo, y su cierre `);`
ultimos = [m.start() for m in re.finditer(r"^caso\('", txt, re.M)]
if not ultimos:
    sys.exit('ABORTA: no se encontro ningun caso en el runner')
pos = ultimos[-1]
cierre = txt.find('\n`);\n', pos)
if cierre < 0:
    sys.exit('ABORTA: no se encontro el cierre del ultimo caso')
corte = cierre + len('\n`);\n')
cola = txt[corte:]
if 'finally' not in cola or 'cdp.close()' not in cola:
    sys.exit('ABORTA: la COLA DEL RUNNER no queda despues del punto de insercion')

nuevo = txt[:corte] + '\n' + bloque + '\n' + cola
DST.write_text(nuevo, encoding='utf-8')
print('insertados %d casos: %s' % (n_casos, ', '.join(ids)))
