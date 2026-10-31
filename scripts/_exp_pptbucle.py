#!/usr/bin/env python3
"""bucle.py — EXPERIMENTO FUERA DEL PRODUCTO (tanda TGA, Parte C).

Toma el .pptx que PptxGenJS 3.12.0 genero —que NO escribe `p:timing` ni `repeatCount`,
verificado leyendo el XML del paquete— y le inyecta el arbol de tiempo que marca el video
para que se repita.

EL XML QUE SE ESCRIBE, y de donde sale cada pieza:

  <p:timing>                     padre de p:tnLst. Microsoft Learn, pagina de TimeNodeList:
   <p:tnLst>                     «Parent Elements: timing (19.3.1.48); tmpl (19.5.84)».
    <p:par><p:cTn ...>           p:par es hijo declarado de p:tnLst en esa misma pagina.
     <p:childTnLst>              p:video es hijo de childTnLst / subTnLst / tnLst, segun la
      <p:video>                  pagina de Video de Microsoft Learn.
       <p:cMediaNode>            unico hijo declarado de p:video en esa pagina (19.5.29).
        <p:cTn repeatCount=...>  p:cMediaNode figura entre los padres de p:cTn en la pagina de
                                 CommonTimeNode. `repeatCount` es atributo de p:cTn: «This
                                 attribute describes the number of times the element should
                                 repeat, in units of thousandths. The possible values ... are
                                 defined by the ST_TLTime simple type (19.7.38)».
        <p:tgtEl><p:spTgt spid=  asi apunta al shape del video; sale del EJEMPLO de la pagina de
                                 Video, que dice «its child spTgt element specifies that the
                                 shape which contains the video to be played has a shape ID of 4».

LO QUE NO ESTA VERIFICADO, Y SE DECLARA:
  · El VALOR del bucle. Las paginas de Microsoft Learn NO contienen la palabra «indefinite» ni
    listan valores literales de `repeatCount`: remiten a ST_TLTime (19.7.38), que no se pudo
    leer en el texto de ISO/IEC 29500-1. La reproduccion del esquema de datypic
    (http://www.datypic.com/sc/ooxml/t-p_ST_TLTime.html) describe ST_TLTime como
    «Union of: xsd:unsignedInt | from type p:ST_TLTimeIndefinite ... Valid value: indefinite»,
    y es LA UNICA fuente leida que admite el literal. No es la norma: es una reproduccion de
    tercero. Por eso esto es un experimento y no una implementacion.
  · Los atributos del nodo raiz (`dur`, `restart`, `nodeType`) y del nodo de medio (`vol`,
    `showWhenStopped`, `fill`, `display`) son valores CONVENCIONALES elegidos aca; ninguna de
    las paginas leidas los prescribe para este caso.

Y UN HALLAZGO DE LA LIBRERIA, que obligo a un cambio mas: PptxGenJS 3.12.0 emite DOS shapes con
`id="3"` en la misma diapositiva —el segundo cuadro de texto y el video—. Un `spid` duplicado es
ambiguo y podria por si solo hacer que PowerPoint se queje, confundiendo el experimento, asi que
al video se le pone un id libre y el `spTgt` apunta a ese.
"""
import re, shutil, sys, zipfile
from xml.etree import ElementTree

D = sys.argv[1]
BASE, SAL = D + '/base.pptx', D + '/experimento_bucle_video.pptx'
ID_VIDEO = '10'           # id libre para el shape del video (ver el hallazgo de arriba)

TIMING = (
 '<p:timing><p:tnLst><p:par>'
 '<p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
 '<p:video><p:cMediaNode vol="80000" showWhenStopped="1">'
 '<p:cTn id="2" fill="hold" display="0" repeatCount="indefinite">'
 '<p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>'
 '</p:cTn>'
 '<p:tgtEl><p:spTgt spid="' + ID_VIDEO + '"/></p:tgtEl>'
 '</p:cMediaNode></p:video>'
 '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>'
)

z = zipfile.ZipFile(BASE)
partes = {n: z.read(n) for n in z.namelist()}
z.close()

RUTA = 'ppt/slides/slide1.xml'
s = partes[RUTA].decode('utf8')

# 1 · el shape del video gana un id UNICO
antes = s
s = s.replace('<p:cNvPr id="3" name="Media 0">', '<p:cNvPr id="' + ID_VIDEO + '" name="Media 0">')
assert s != antes, 'no se encontro el shape del video'
assert s.count('id="' + ID_VIDEO + '"') == 1, 'el id elegido ya estaba en uso'

# 2 · el arbol de tiempo, DESPUES de p:clrMapOvr (orden de CT_Slide: cSld, clrMapOvr, transition, timing)
assert 'p:timing' not in s, 'el paquete base YA trae p:timing'
assert s.count('</p:clrMapOvr>') == 1
s = s.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + TIMING, 1)
partes[RUTA] = s.encode('utf8')

zo = zipfile.ZipFile(SAL, 'w', zipfile.ZIP_DEFLATED)
for n, b in partes.items():
    zo.writestr(n, b)
zo.close()

# ── VALIDACION ──
print('ARCHIVO : ' + SAL)
zv = zipfile.ZipFile(SAL)
mal = zv.testzip()
print('ZIP coherente        : ' + ('SI' if mal is None else 'NO, falla en ' + str(mal)))
print('partes               : %d (base %d)' % (len(zv.namelist()), len(partes)))
xmls = [n for n in zv.namelist() if n.endswith('.xml') or n.endswith('.rels')]
rotos = []
for n in xmls:
    try:
        ElementTree.fromstring(zv.read(n))
    except Exception as e:
        rotos.append(n + ': ' + str(e))
print('XML bien formados    : %d de %d%s' % (len(xmls) - len(rotos), len(xmls),
      ('' if not rotos else '  ROTOS: ' + '; '.join(rotos))))
sl = zv.read(RUTA).decode('utf8')
print('p:timing presente    : ' + ('SI' if '<p:timing>' in sl else 'NO'))
print('repeatCount          : ' + (re.search(r'repeatCount="([^"]*)"', sl).group(1) if 'repeatCount' in sl else 'NO'))
print('spTgt spid           : ' + (re.search(r'<p:spTgt spid="([^"]*)"', sl).group(1) if 'spTgt' in sl else 'NO'))
print('video embebido       : ' + str([n for n in zv.namelist() if n.endswith('.mp4')]))
print('ids de shape         : ' + str(sorted(re.findall(r'<p:cNvPr id="(\d+)"', sl))) + '  (sin duplicados: '
      + ('SI' if len(set(re.findall(r'<p:cNvPr id="(\d+)"', sl))) == len(re.findall(r'<p:cNvPr id="(\d+)"', sl)) else 'NO') + ')')
print('bytes                : %d' % len(open(SAL, 'rb').read()))
zv.close()
