#!/usr/bin/env python3
"""
detectar_huerfanos.py — CeiboMed / EcoSmart

Busca CAMPOS HUERFANOS: controles que el medico ve y puede cargar en pantalla, pero cuyo id no
aparece nunca en el JavaScript, o sea que ningun destino los lee. El dato se carga, se guarda en
`campos` —porque `guardarInforme` barre `input[id]` sin mirar cual— y despues no sale en el
informe, ni en el PDF, ni en el Excel, ni en el Laboratorio. Desaparece sin ningun aviso.

Es el bug del cayado aortico: `diam_cayado` y `diam_ao_toracica` estuvieron meses en la tab
Aorta sin `oninput`, fuera de `AO_SEGS`, del narrativo y de las tablas. Ver CLAUDE.md, punto 8
de las lecciones del 2026-09-14.

Uso:
    python3 scripts/detectar_huerfanos.py                 # sobre ecosmart/index.html
    python3 scripts/detectar_huerfanos.py otra/app.html   # sobre otro archivo
    python3 scripts/detectar_huerfanos.py --todos         # incluye los excluidos, para auditar

Codigo de salida: 0 si no hay huerfanos nuevos, 1 si aparece alguno fuera de la lista conocida.
Asi se puede enganchar a un pre-push sin que rompa por los ya documentados.

LIMITE CONOCIDO — el script contesta "nadie lo nombra", no "no tiene destino". Un id nombrado
UNA vez, en `limpiarCampos`, tiene mencion y no tiene destino. Por eso el reporte imprime donde
aparece cada id sospechoso: la decision final es humana. Prefiere el falso negativo al falso
positivo, porque una lista con ruido se deja de leer.
"""

import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFECTO = os.path.join(RAIZ, 'index.html')

# ── Exclusiones ──────────────────────────────────────────────────────────────────────────────
# Prefijos que NO son campos del estudio. Los diez primeros son EXACTAMENTE los de
# `_noEsDelEstudio()` en index.html —la misma regex que usa `guardarInforme` para decidir que no
# viaja con el estudio—; si alla se agrega uno, hay que agregarlo aca.
PREFIJOS_NO_ESTUDIO = (
    'login-', 'ig-', 'lab-', 'cfg-', 'exp-', 'filtro-', 'adv-', 'asoc-', 'pdf-', 'lgal-', 'fcg-',
    # Preferencias del medico, no datos del paciente: son la allowlist de `limpiarCampos`.
    'firma-', 'evol-',
    # Pedidos por el prompt del 2026-09-15: controles de interfaz, no de carga.
    'btn_', 'boton_', 'tab_', 'panel_', 'modal_', 'resultado_', 'calc_', 'badge_',
)

# Ids sueltos que se revisaron a mano y son locales A PROPOSITO. Cada uno con su motivo: una
# lista de exclusiones sin razones se convierte en el lugar donde se esconden los bugs.
CONOCIDOS_LOCALES = {
    # Vacia a proposito. `oai_lobulos` —el unico que encontro este script en su primera corrida,
    # el 2026-09-15— se arreglo el mismo dia: hoy va al informe narrativo, a la hoja OAI del PDF
    # y al Excel del Laboratorio. Si manana entra uno aca, que sea CON su motivo escrito.
}

# ── Lectura ──────────────────────────────────────────────────────────────────────────────────

def leer(ruta):
    with open(ruta, encoding='utf-8') as f:
        return f.read()


def bloques_js(src):
    """Concatena los <script> inline. Los `src=` externos (CDN) no se miran."""
    return '\n'.join(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', src, re.S))


def html_sin_js(src):
    """
    Vacia los <script> pero CONSERVA sus saltos de linea, para que los numeros de linea del
    reporte sean los del archivo real. Borrandolos a secas quedaban corridos ~1.000 lineas y el
    reporte mandaba a mirar el lugar equivocado — un numero de linea que no lleva al campo es
    peor que no imprimirlo.
    """
    return re.sub(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>',
                  lambda m: '\n' * m.group(0).count('\n'), src, flags=re.S)


def campos_de_entrada(html):
    """
    Devuelve {id: (linea, etiqueta)} de todo lo que el medico puede CARGAR.
    Incluye `type=hidden`: no se ve, pero viaja en `campos` y es donde vivian las horas del jet
    paravalvular y la serie congelada de cardio-onco.
    """
    encontrados = {}
    patron = re.compile(
        r'<(input|select|textarea)\b([^>]*)>|<(div)\b([^>]*\bcontenteditable[^>]*)>',
        re.I)
    for m in patron.finditer(html):
        tag = (m.group(1) or m.group(3)).lower()
        attrs = m.group(2) or m.group(4) or ''
        mid = re.search(r'\bid="([^"]+)"', attrs)
        if not mid:
            continue
        linea = html.count('\n', 0, m.start()) + 1
        encontrados.setdefault(mid.group(1), (linea, tag))
    return encontrados


# ── Analisis ─────────────────────────────────────────────────────────────────────────────────

def menciones(js, campo_id):
    """Lineas del JS donde el id aparece entre comillas (simples, dobles o backtick)."""
    pat = re.compile(r'[\'"`]' + re.escape(campo_id) + r'[\'"`]')
    out = []
    for i, ln in enumerate(js.split('\n'), 1):
        if pat.search(ln):
            out.append((i, ln.strip()[:110]))
    return out


def prefijo_dinamico(js, campo_id):
    """
    ¿El id se puede estar armando por concatenacion? Dos formas, las dos usadas en este archivo:
      · por PREFIJO — `'ete_seg_' + seg`     arma `ete_seg_A2`
      · por SUFIJO  — `'ett-' + k + '-orig'` arma `ett-rwt-orig`
    Sin la segunda, los cinco `ett-*-orig` salian como huerfanos y eran ruido: el ruido es lo que
    hace que una lista de control se deje de leer.
    """
    for corte in range(len(campo_id) - 1, 4, -1):
        if campo_id[corte] not in '_-':
            continue
        pre = campo_id[:corte + 1]
        if re.search(r'[\'"`]' + re.escape(pre) + r'[\'"`]\s*\+', js):
            return pre + '…'
    for corte in range(1, len(campo_id) - 4):
        if campo_id[corte] not in '_-':
            continue
        suf = campo_id[corte:]
        if re.search(r'\+\s*[\'"`]' + re.escape(suf) + r'[\'"`]', js):
            return '…' + suf
    return None


def excluido(campo_id):
    for p in PREFIJOS_NO_ESTUDIO:
        if campo_id.startswith(p):
            return p
    return None


def analizar(ruta, mostrar_todos=False):
    src = leer(ruta)
    html = html_sin_js(src)
    js = bloques_js(src)
    campos = campos_de_entrada(html)

    con_destino, dinamicos, fuera, huerfanos = [], [], [], []
    for cid, (linea, tag) in sorted(campos.items(), key=lambda kv: kv[1][0]):
        pre = excluido(cid)
        if pre and not mostrar_todos:
            fuera.append((cid, linea, tag, pre))
            continue
        ms = menciones(js, cid)
        if ms:
            con_destino.append((cid, linea, tag, ms))
            continue
        din = prefijo_dinamico(js, cid)
        if din:
            dinamicos.append((cid, linea, tag, din))
            continue
        huerfanos.append((cid, linea, tag))
    return campos, con_destino, dinamicos, fuera, huerfanos


# ── Reporte ──────────────────────────────────────────────────────────────────────────────────

L = '═' * 62

def main():
    args = [a for a in sys.argv[1:] if a != '--todos']
    mostrar_todos = '--todos' in sys.argv
    ruta = args[0] if args else DEFECTO
    if not os.path.exists(ruta):
        print('No existe el archivo: ' + ruta)
        return 2

    campos, con_destino, dinamicos, fuera, huerfanos = analizar(ruta, mostrar_todos)

    print(L)
    print('  CAMPOS HUERFANOS — EcoSmart')
    print('  ' + os.path.relpath(ruta, RAIZ))
    print(L)
    print('  Total campos de entrada encontrados : %d' % len(campos))
    print('  Con destino (nombrados en el JS)    : %d' % len(con_destino))
    print('  Id armado por concatenacion         : %d' % len(dinamicos))
    print('  Fuera del estudio (por prefijo)     : %d' % len(fuera))
    print('  CANDIDATOS A HUERFANOS              : %d' % len(huerfanos))
    print(L)

    nuevos = [h for h in huerfanos if h[0] not in CONOCIDOS_LOCALES]

    if huerfanos:
        print()
        print('  LISTA — ningun lugar del JavaScript los nombra:')
        print()
        for cid, linea, tag in huerfanos:
            marca = '  ' if cid in CONOCIDOS_LOCALES else '! '
            print('  %s%-34s (linea %5d, <%s>)' % (marca, cid, linea, tag))
            if cid in CONOCIDOS_LOCALES:
                print('      documentado: %s' % CONOCIDOS_LOCALES[cid])
        print()
        print('  «!» = no esta en CONOCIDOS_LOCALES de este script.')
    else:
        print()
        print('  Sin candidatos. Todo campo de entrada tiene al menos una mencion en el JS.')

    if dinamicos:
        print()
        print('  ID ARMADO POR CONCATENACION — no son huerfanos, pero conviene mirarlos:')
        for cid, linea, tag, din in dinamicos:
            print('    %-34s (linea %5d)  se arma con «%s»' % (cid, linea, din))

    print()
    print(L)
    print('  NOTA: este script contesta «nadie lo nombra», no «no tiene destino». Un id')
    print('  nombrado una sola vez —por ejemplo en limpiarCampos— tiene mencion y NO tiene')
    print('  destino. Verificar a mano cada candidato: informe narrativo, EN SUMA, tablas del')
    print('  PDF, PPT, Excel del Laboratorio o alguna funcion de calculo que alimente a esos.')
    print('  Si es local a proposito, agregarlo a CONOCIDOS_LOCALES con el motivo.')
    print(L)

    if nuevos:
        print()
        print('  ✗ %d campo(s) fuera de la lista conocida. Revisar antes del push.' % len(nuevos))
        return 1
    print()
    print('  ✓ Sin huerfanos nuevos.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
