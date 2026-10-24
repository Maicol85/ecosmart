#!/usr/bin/env python3
"""Chequea con `node --check` el JS INLINE de index.html, bloque por bloque.

   Por que existe (AJ6, 2026-10-24): un `*/` de mas, agregado al cerrar un comentario,
   dejo el bloque grande sin parsear y el UNICO sintoma fue que una sonda informara CERO
   secciones del panel de Evidencia -- un numero plausible que se lee como «la seccion no
   despierta», no como «la app no arranca». `check_backticks.py` no lo ve (no hay acento
   grave) y Semgrep tampoco (no es un patron de seguridad). Esto lo dice en un segundo.

   ⚠️ LOS BLOQUES DENTRO DE UN COMENTARIO HTML NO CUENTAN: este archivo tiene comentarios
   que NOMBRAN `<script>` en su prosa, y tomarlos por codigo da falsos rotos. Se borran los
   comentarios HTML antes de buscar.

   Uso:  python3 scripts/check_js_inline.py [archivo.html]
   Sale 1 si algun bloque no parsea.
"""
import io, os, re, subprocess, sys, tempfile

ARCH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'index.html')

s = io.open(ARCH, encoding='utf-8').read()
# Los comentarios HTML se reemplazan por saltos, para que los numeros de linea no se muevan.
sin_com = re.sub(r'<!--.*?-->', lambda m: '\n' * m.group(0).count('\n'), s, flags=re.S)

bloques = []
for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', sin_com, re.S):
    linea = sin_com[:m.start(1)].count('\n') + 1
    bloques.append((linea, m.group(1)))

if not bloques:
    print('  ⚠️  no se encontro ni un bloque de JS inline en ' + ARCH)
    sys.exit(1)

malos = []
tmp = tempfile.mkdtemp(prefix='chkjs_')
for i, (linea, cod) in enumerate(bloques):
    f = os.path.join(tmp, 'b%d.js' % i)
    io.open(f, 'w', encoding='utf-8').write(cod)
    r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
    if r.returncode != 0:
        # El numero de linea que node informa es RELATIVO al bloque: se traduce al archivo.
        err = r.stderr
        mm = re.search(r'b\d+\.js:(\d+)', err)
        abs_l = (linea + int(mm.group(1)) - 1) if mm else None
        malos.append((i, linea, abs_l, err.strip().split('\n')))

print('  %d bloque(s) de JS inline en %s' % (len(bloques), os.path.basename(ARCH)))
for i, linea, abs_l, err in malos:
    print('')
    print('  ✗ bloque %d (empieza en la linea %d del archivo)%s' %
          (i, linea, (' — el error cae en la linea %d' % abs_l) if abs_l else ''))
    for l in err[:6]:
        print('      ' + l)
print('')
if malos:
    print('  %d bloque(s) NO parsean. El navegador descarta el bloque ENTERO en silencio.' % len(malos))
    sys.exit(1)
print('  ✓ todos parsean.')
