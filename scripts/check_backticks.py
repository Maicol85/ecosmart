#!/usr/bin/env python3
"""check_backticks.py — caza el acento grave dentro del cuerpo de un caso de prueba.

POR QUE EXISTE. El cuerpo de cada `caso(...)` de `scripts/test_clinico.mjs` y las sondas inyectadas
de `scripts/_probe_*.mjs` son template literals. Un acento grave adentro —AUNQUE ESTE DENTRO DE UN
COMENTARIO— cierra la cadena, y el `SyntaxError` que sale apunta decenas de lineas ANTES del
culpable (al `${APAGA_HELPERS}` de la primera interpolacion, por ejemplo). `CLAUDE.md` ya lo
documenta como trampa conocida y aun asi me lo comi CINCO veces en dos tandas: el habito de
escribir identificadores entre acentos graves en los comentarios es mas fuerte que el recuerdo.

`node --check` detecta el problema pero no dice donde esta: este script si.

Uso:
    python3 scripts/check_backticks.py                      # todos los archivos de scripts/
    python3 scripts/check_backticks.py scripts/test_clinico.mjs

Salida: una linea por hallazgo con archivo:linea y el fragmento. Codigo de salida 1 si hay alguno,
asi que sirve de guarda antes de correr la suite.
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Donde ARRANCA un template literal que hay que vigilar. Son los tres patrones que usa el repo:
#   caso('TC-NNN', 'titulo', `   → cuerpo de un caso de la suite
#   const SONDA = `                → sonda inyectada de un _probe_*.mjs
#   await ev(`  /  JSON.parse(await ev(`   → expresion evaluada por CDP
#
# ⚠️ EL PATRON EXIGE `caso('TC-` Y NO `caso(` PELADO, y la primera version no lo hacia: matcheaba
# la palabra `caso(` escrita EN PROSA dentro de un comentario normal —incluido, con ironia, el
# comentario de test_clinico.mjs que documenta esta misma trampa— y daba cuatro falsos positivos
# sobre un archivo que parsea perfecto. Un detector con falsos se deja de mirar, que es peor que
# no tenerlo: el patron tiene que describir una LLAMADA, no una mencion.
ABRE = re.compile(
    r"(caso\('TC-[^']*',[^`]*`"          # caso('TC-NNN', 'titulo', `
    r"|const\s+\w*SONDA\w*\s*=\s*`"      # const SONDA = `
    r"|[A-Z][A-Z_]*_HELPERS\s*=\s*`"     # const XXX_HELPERS = `
    r"|\bev\(`)"                         # ev(` — la expresion que se evalua por CDP
)


def revisar(path: Path):
    """Recorre el archivo caracter a caracter llevando la cuenta de si estamos DENTRO de uno de
    esos template literals. No se usa un regex sobre todo el archivo porque los literales se
    anidan con interpolaciones y un regex da falsos de los dos signos."""
    texto = path.read_text(encoding="utf-8")
    lineas = texto.split("\n")
    hallazgos = []
    dentro = False
    inicio_linea = 0
    i = 0
    n = len(texto)
    while i < n:
        if not dentro:
            m = ABRE.search(texto, i)
            if not m:
                break
            dentro = True
            i = m.end()
            inicio_linea = texto.count("\n", 0, i) + 1
            continue
        # Dentro del literal: el proximo acento grave SIN escapar lo cierra.
        j = texto.find("`", i)
        if j == -1:
            break
        if texto[j - 1] == "\\":
            i = j + 1
            continue
        # Es un cierre legitimo SI lo que sigue es el fin de la llamada: `) o `); o `,
        resto = texto[j + 1 : j + 4]
        linea_no = texto.count("\n", 0, j) + 1
        if re.match(r"\s*\)|\s*;|\s*,", resto):
            dentro = False
            i = j + 1
            continue
        # No cierra nada: es un acento grave suelto adentro del cuerpo.
        hallazgos.append((linea_no, lineas[linea_no - 1].strip()[:100], inicio_linea))
        i = j + 1
        dentro = False  # a partir de aca el parser ya esta desalineado; se reporta y se sigue
    return hallazgos


def main():
    objetivos = [Path(a) for a in sys.argv[1:]] or sorted(
        list((RAIZ / "scripts").glob("*.mjs")) + list((RAIZ / "scripts").glob("*.js"))
    )
    total = 0
    for p in objetivos:
        if not p.is_absolute():
            p = RAIZ / p
        if not p.exists():
            print(f"  (no existe: {p})")
            continue
        for linea, frag, abre in revisar(p):
            total += 1
            rel = p.relative_to(RAIZ) if str(p).startswith(str(RAIZ)) else p
            print(f"{rel}:{linea}  acento grave dentro del template abierto en la linea {abre}")
            print(f"    {frag}")
    if total:
        print(f"\n{total} hallazgo/s. Saca el acento grave: cierra la cadena y rompe el parseo.")
        return 1
    print(f"OK — sin acentos graves dentro de los cuerpos ({len(objetivos)} archivo/s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
