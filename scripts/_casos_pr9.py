#!/usr/bin/env python3
"""Inserta los casos de PR9 en scripts/test_clinico.mjs, con guardian.

   Cada caso vive en su propio archivo: primera linea el TITULO, despues una linea «@@» y
   despues el CUERPO. El cuerpo se inserta dentro de un template literal, asi que un solo
   acento grave lo cierra antes de tiempo: el guardian cuenta el delta de acentos graves del
   archivo y ABORTA antes de escribir si no es CERO. Es la trampa que esta casa paga desde hace
   treinta y seis tandas, y la unica forma de cazarla es contar, porque lo que queda a veces es
   JS valido y `node --check` pasa.
   Y comprueba que la COLA DEL RUNNER siga DESPUES del ultimo caso: insertar detras de ella
   deja los casos sin registrar y el suite informa «0/0 sin regresiones», que es el peor rojo
   posible porque parece verde.
       python3 scripts/_casos_pr9.py c1058.js c1059.js ...
"""
import io, os, sys

RUNNER = 'scripts/test_clinico.mjs'
COLA = 'try {\n  const s = await servir();'
BT = chr(96)

def main(archivos):
    s = io.open(RUNNER, encoding='utf-8').read()
    bt0 = s.count(BT)
    if COLA not in s:
        sys.exit('ABORTA: no se encuentra la cola del runner')
    bloques = []
    for a in archivos:
        txt = io.open(a, encoding='utf-8').read()
        if BT in txt:
            sys.exit('ABORTA: %s tiene %d acento(s) grave(s) en su cuerpo' % (a, txt.count(BT)))
        if '@@' not in txt:
            sys.exit('ABORTA: %s no tiene el separador @@' % a)
        tit, cuerpo = txt.split('\n@@\n', 1)
        cid = os.path.basename(a).replace('c', 'TC-').replace('.js', '')
        if ("caso('" + cid + "'") in s:
            sys.exit('ABORTA: %s ya esta en el runner' % cid)
        bloques.append("caso('" + cid + "',\n '" + tit.strip().replace("'", "\\'") + "',\n"
                       + BT + "\n" + cuerpo.rstrip() + "\n" + BT + ");\n\n")
    pos = s.rindex(COLA)
    # se busca el final del ultimo caso ANTES de la cola
    marca = BT + ");\n"
    fin = s.rindex(marca, 0, pos) + len(marca)
    s2 = s[:fin] + '\n' + ''.join(bloques) + s[fin:]
    # ── GUARDIAN ──
    bt1 = s2.count(BT)
    esperado = bt0 + 2 * len(bloques)
    if bt1 != esperado:
        sys.exit('ABORTA: acentos graves %d -> %d, se esperaban %d' % (bt0, bt1, esperado))
    if s2.rindex(COLA) < s2.rindex("caso('TC-"):
        sys.exit('ABORTA: la cola del runner quedo ANTES del ultimo caso')
    io.open(RUNNER, 'w', encoding='utf-8').write(s2)
    print('insertados %d caso(s); acentos graves %d -> %d' % (len(bloques), bt0, bt1))

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit('faltan los archivos de caso')
    main(sys.argv[1:])
