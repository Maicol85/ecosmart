#!/usr/bin/env python3
"""Inserta los casos de P12 en scripts/test_clinico.mjs.

GUARDIAN DE ACENTOS GRAVES. El cuerpo de un caso es un template literal, asi que UN acento
grave de mas lo cierra antes de tiempo -- y lo que queda a veces es JS VALIDO, con lo que
`node --check` PASA y el caso queda registrado con un `fn` que es un numero. Esta casa lo pago
cinco corridas. Se cuenta ANTES de insertar y se ABORTA.
Tambien se aborta si el cuerpo trae una BARRA INVERTIDA de expresion regular: no sobrevive al
template y el patron queda midiendo otra cosa en silencio.
"""
import re, sys, os
BASE = os.path.dirname(os.path.abspath(__file__))
RUN = os.path.join(BASE, 'test_clinico.mjs')
SCR = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
G = chr(96)

CASOS = [
    ('TC-1017', 'P12 (1.2): los cuatro carteles que Maicol confirmo son PROPIOS y no abren ningun dialogo nativo', 'a'),
    ('TC-1018', 'P12 (3.1): la escala de velocidad sobrevive al viaje por el registro, y el VTI sale identico', 'b'),
    ('TC-1019', 'P12 (2.1 y 2.2): con «solo las nuevas» las repetidas se descartan solas y quedan marcadas', 'c'),
    ('TC-1020', 'P12 (2.3): con cero nuevas el boton dice (0), esta apagado y explica por que', 'd'),
    ('TC-1021', 'P12 (3.3 y 3.4): la receta de la calibracion manual y la frase del que hacer, con un solo dueno', 'e'),
    ('TC-1022', 'P12 (4.1): la flecha de la velocidad es correcta con imagen fresca y despues del viaje', 'f'),
]

cuerpos = {}
for cid, nom, suf in CASOS:
    p = os.path.join(SCR, 'casos_p12_' + suf + '.js')
    with open(p, encoding='utf-8') as fh:
        c = fh.read()
    n = c.count(G)
    if n:
        sys.exit('ABORTA: ' + cid + ' tiene ' + str(n) + ' acento(s) grave(s) en su cuerpo.')
    b = c.count('\\\\')
    if b:
        sys.exit('ABORTA: ' + cid + ' tiene ' + str(b) + ' barra(s) invertida(s) doble(s).')
    cuerpos[cid] = c

src = open(RUN, encoding='utf-8').read()
for cid, nom, suf in CASOS:
    if ("'" + cid + "'") in src:
        sys.exit('ABORTA: ' + cid + ' ya esta en el runner.')

# Se inserta DESPUES del ultimo caso y ANTES del corredor, que arranca con "\ntry {".
# El ancla tiene que aparecer EXACTAMENTE una vez o se aborta: insertar en el lugar equivocado
# se lleva puesta la cola del runner -- su try/catch, el cierre de Chrome y el codigo de salida-,
# y el sintoma es un suite que corre y NO IMPRIME NADA con codigo de salida 0. Lo pago PANT-33.
ancla = '\n\ntry {\n  const s = await servir(); servidor = s.srv;'
if src.count(ancla) != 1:
    sys.exit('ABORTA: el ancla del corredor aparece ' + str(src.count(ancla)) + ' veces, no una.')
pos = src.index(ancla)

bloque = ''
for cid, nom, suf in CASOS:
    bloque += "\ncaso('" + cid + "', '" + nom.replace("'", "\\'") + "', " + G + "\n"
    bloque += cuerpos[cid]
    bloque += G + ");\n"

src = src[:pos] + bloque + src[pos:]
open(RUN, 'w', encoding='utf-8').write(src)
print('insertados', len(CASOS), 'casos')
