#!/usr/bin/env python3
"""Guarda de la tanda PANT-7: cuenta los acentos graves de cada sonda y de cada caso nuevo y
exige el numero EXACTO que corresponde a sus delimitadores de template literal. Un acento grave
de mas dentro de un comentario cierra la cadena y el archivo deja de parsear con un error que
apunta decenas de lineas antes del culpable. Es la trampa que esta casa paga desde PANT-3."""
import sys, io, os
ESPERADO = {
    "scripts/_probe_pant7vd.mjs": 4,
    "scripts/_probe_pant7vd1e.mjs": 12,
    "scripts/_probe_pant7cia.mjs": 6,
    "scripts/_probe_pant7c3.mjs": 8,
    "scripts/_probe_pant7pant.mjs": 16,
    "scripts/_probe_pant7info.mjs": 2,
    "scripts/_probe_pant7wk.mjs": 2,
}
mal = 0
for f, n in ESPERADO.items():
    if not os.path.exists(f):
        print('FALTA %s' % f); mal += 1; continue
    c = io.open(f, encoding='utf-8').read().count('`')
    ok = (c == n)
    print('%-42s %3d acentos graves  esperado %3d  %s' % (f, c, n, 'OK' if ok else 'MAL'))
    if not ok: mal += 1
sys.exit(1 if mal else 0)
