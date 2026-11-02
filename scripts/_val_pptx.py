#!/usr/bin/env python3
"""_val_pptx.py - el VALIDADOR de un .pptx generado (VAL-PPT-9c).

Calcado del que la tanda TGA uso en su experimento y del que AJUSTES-3 corrio sobre los dos
mazos: abre el zip, confirma que cada parte XML esta BIEN FORMADA, y censa el arbol de tiempo
del bucle -`p:timing`, `repeatCount` y los `spid`- diapositiva por diapositiva.

NO prueba la reproduccion: eso se hace abriendo el archivo en PowerPoint y en Keynote, y no se
puede automatizar desde aca. Lo que prueba es que el XML queda escrito y bien formado.

  python3 scripts/_val_pptx.py <archivo.pptx>
"""
import sys, zipfile, re
import xml.etree.ElementTree as ET

def main(p):
    print('===== VALIDACION DE %s =====' % p)
    try:
        z = zipfile.ZipFile(p)
    except Exception as e:
        print('ABORTA: no es un zip coherente -> %s' % e); return 1
    nombres = z.namelist()
    print('partes en el paquete: %d' % len(nombres))
    bad = z.testzip()
    print('integridad del zip: %s' % ('OK' if bad is None else ('CORRUPTA en ' + str(bad))))
    # 1 - todas las partes XML bien formadas
    xmls = [n for n in nombres if n.endswith('.xml') or n.endswith('.rels')]
    ok = 0; mal = []
    for n in xmls:
        try:
            ET.fromstring(z.read(n)); ok += 1
        except Exception as e:
            mal.append('%s -> %s' % (n, str(e)[:70]))
    print('XML bien formados: %d de %d' % (ok, len(xmls)))
    for m in mal: print('   MAL: %s' % m)
    # 2 - los medios
    medios = [n for n in nombres if n.startswith('ppt/media/')]
    print('medios: %d  %s' % (len(medios), ', '.join(m.split('/')[-1] for m in medios[:6])))
    # 3 - el arbol de tiempo, diapositiva por diapositiva
    slides = sorted([n for n in nombres if re.match(r'^ppt/slides/slide\d+\.xml$', n)],
                    key=lambda s: int(re.findall(r'\d+', s)[-1]))
    print('diapositivas: %d' % len(slides))
    tot_v = 0; tot_t = 0
    for n in slides:
        x = z.read(n).decode('utf-8', 'replace')
        vids = len(re.findall(r'<a:videoFile', x))
        timing = x.count('<p:timing')
        rep = re.findall(r'repeatCount="([^"]+)"', x)
        spids = re.findall(r'<p:spTgt\s+spid="(\d+)"', x)
        pvideo = len(re.findall(r'<p:video>', x))
        if vids or timing:
            tot_v += vids; tot_t += timing
            print('  %-24s videos=%d  p:timing=%d  p:video=%d  repeatCount=%s  spid=%s%s'
                  % (n.split('/')[-1], vids, timing, pvideo, rep, spids,
                     '  <- SPID DUPLICADO' if len(spids) != len(set(spids)) else ''))
    print('TOTAL: %d video(s) incrustado(s), %d arbol(es) de tiempo' % (tot_v, tot_t))
    # 4 - referencias colgadas
    colgadas = []
    for n in nombres:
        if not n.endswith('.rels'): continue
        try: r = ET.fromstring(z.read(n))
        except Exception: continue
        base = n.rsplit('_rels/', 1)[0]
        for rel in r:
            tgt = rel.get('Target', '')
            if rel.get('TargetMode') == 'External' or tgt.startswith('http'): continue
            ruta = (base + tgt).replace('/./', '/')
            while '/../' in ruta:
                a, b = ruta.split('/../', 1)
                ruta = a.rsplit('/', 1)[0] + '/' + b
            if ruta not in nombres: colgadas.append('%s -> %s' % (n, tgt))
    print('referencias colgadas: %d%s' % (len(colgadas),
          ('  ' + '; '.join(colgadas[:4])) if colgadas else ''))
    print('\nRESULTADO: %s' % ('OK' if (not mal and bad is None and not colgadas) else 'CON HALLAZGOS'))
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else ''))
