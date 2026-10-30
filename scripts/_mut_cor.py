#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_cor.py — barrido de MUTACIONES DIRIGIDAS de la TANDA CORRECCIONES (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-553 se ponga ROJO.

  python3 scripts/_mut_cor.py              # todas
  python3 scripts/_mut_cor.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
⚠️ TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 hace que la oracion de la
   orejuela vuelva a repetir el trombo que el parrafo de arriba ya dijo, la 07 que el parentesis
   del gradiente subestimado salga tambien con el ventriculo derecho NORMAL, y la 14 que el
   esquema se incluya solo, sin que nadie apriete el boton. Existen porque las condiciones que
   las matan son CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no
   esta probando nada.
⚠️ LA 03 ROMPE LAS DOS PUERTAS DEL CORTE A LA VEZ. El 75 tiene UNA constante y DOS lectores
   —la pantalla y el papel—: una mutacion que toque un solo lector la tapa el otro, porque la
   condicion (B7) de TC-549 compara los dos entre si. Esta cambia la constante, o sea los dos.
⚠️ LA 11 ROMPE LAS DOS CAPAS DE LA SILUETA A LA VEZ, por lo mismo: con una sola rota, la otra
   sigue dibujando y el conteo por trazo seguiria dando dos.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-553'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # ══ COMMIT 1 · el informe de la orejuela ════════════════════════════════════════════════
 ('01 vuelve el veredicto de aptitud: «no apto para cierre percutaneo (trombo presente)»',
  "      etePars.push('Orejuela izquierda: ' + dimParts.join(', ') + '.');",
  "      etePars.push(dimParts.join(', ') + (oTrombo === 'si' ? ' \u2014 no apto para cierre percut\u00e1neo (trombo presente)' : '') + '.');"),

 ('02 se va el sujeto: la oracion del informe firmado vuelve a arrancar en minuscula',
  "      etePars.push('Orejuela izquierda: ' + dimParts.join(', ') + '.');",
  "      etePars.push(dimParts.join(', ') + '.');"),

 ('03 el hecho del trombo movil sale de la Evidencia',
  "    { tit:'Trombo y cierre percut\u00e1neo \u2014 consenso EHRA/EAPCI (folio 1401)', lineas: oaiL },",
  ""),

 ('04 el gate de los lobulos se afloja: la nota de complejidad vuelve a salir con trombo',
  "      if (oLob === '3' && oTrombo !== 'si' && oTrombo !== 'sospecha')",
  "      if (oLob === '3')"),

 ('05 DE MAS: la oracion repite el trombo que el parrafo de arriba ya dijo',
  "      etePars.push('Orejuela izquierda: ' + dimParts.join(', ') + '.');",
  "      etePars.push('Orejuela izquierda: ' + dimParts.join(', ') + (oTrombo === 'si' ? '; trombo presente' : '') + '.');"),

 # ══ COMMIT 2 · el TRIV y la HTP ═════════════════════════════════════════════════════════
 ('06 el corte vuelve a 60 ms: la pantalla y el papel a la vez, porque la constante es una',
  "const DT_TRIV_HTP = 75, DT_TAP_HTP = 105;",
  "const DT_TRIV_HTP = 60, DT_TAP_HTP = 105;"),

 ('07 el operador deja de ser estricto: 75 exactos pasa a ser elemento a favor',
  "  const trivAlto = trivOk && triv > DT_TRIV_HTP;",
  "  const trivAlto = trivOk && triv >= DT_TRIV_HTP;"),

 ('08 DE MAS: el parentesis del gradiente subestimado sale tambien con el VD NORMAL',
  "      const _disf = (typeof vdDisfPresente === 'function') ? vdDisfPresente() : false;",
  "      const _disf = true;"),

 ('09 (i) se pierde: con la IT no medida vuelve la redaccion de siempre',
  """      if (itTrv === null) {
        return hayIT
          ? ` Velocidad de la insuficiencia tricusp\u00eddea no medida; con elementos a favor de hipertensi\u00f3n pulmonar ${i}.`
          : ` Con elementos a favor de hipertensi\u00f3n pulmonar ${i}.`;
      }""",
  "      if (itTrv === null) { return ` Presenta elementos indirectos de HTP ${i}.`; }"),

 ('10 el dueno de la disfuncion del VD pierde dos parametros: se queda con TAPSE y S prima',
  """           || (fac   !== null && anorm(vdFacCat(fac)))
           || (tei   !== null && anorm(vdTeiCat(tei)))""",
  "           || false"),

 # ══ COMMIT 3 · la grilla ════════════════════════════════════════════════════════════════
 ('11 el TRIV vuelve al final de la columna 1 y la FEVD a la columna 1: se rompen las tres',
  [("        <div class=\"fg vd-c1 vd-r4\">", "        <div class=\"fg vd-c1 vd-r7\">"),
   ("        <div class=\"fg vd-c2 vd-r6\">", "        <div class=\"fg vd-c1 vd-r6\">")]),

 ('12 el VD/VI y su selector vuelven a quedar apilados',
  "          <div style=\"display:flex;gap:6px;align-items:flex-end;flex-wrap:wrap;\">",
  "          <div style=\"display:block;\">"),

 # ══ COMMIT 4 · Marfan y Turner ══════════════════════════════════════════════════════════
 ('13 la lectura de la raiz desaparece de la pantalla de Marfan',
  """      le.textContent = (!_mio && _est)
        ? 'Seno de Valsalva ' + _est + ' mm \u2014 tomado de AI/VI.' : '';""",
  "      le.textContent = '';"),

 ('14 DE MAS: la lectura ESCRIBE en el estudio en vez de solo mostrarse',
  """      le.textContent = (!_mio && _est)
        ? 'Seno de Valsalva ' + _est + ' mm \u2014 tomado de AI/VI.' : '';""",
  """      le.textContent = (!_mio && _est)
        ? 'Seno de Valsalva ' + _est + ' mm \u2014 tomado de AI/VI.' : '';
      if (!_mio && _est) { const _b = document.getElementById('marfan_ao_seno'); if (_b) _b.value = _est; }"""),

 ('15 el mensaje de Turner vuelve a no decir cual falta',
  "      ? 'Se calcula con la aorta ascendente y la superficie corporal (peso y talla): ' + _falta() + '.'",
  "      ? 'Se calcula con la aorta ascendente y la superficie corporal.'"),

 # ══ COMMIT 5 · las imagenes ═════════════════════════════════════════════════════════════
 ('16 «Incluir en el PDF» vuelve a exigir Config prendido y el estudio guardado',
  "  return esqIncluirEnPDF('orejuela', 'Esquema de la orejuela', oaiEsqSVG(fa, re),",
  "  return esqGuardarComoImagen('orejuela', 'Esquema de la orejuela', oaiEsqSVG(fa, re),"),

 ('17 el boton deja de cambiar de color y de rotulo',
  """  b.textContent = on ? OAI_PDF_TXT.on : OAI_PDF_TXT.off;
  b.classList.toggle('btn-primary', !!on);""",
  "  b.textContent = OAI_PDF_TXT.off;\n  b.classList.toggle('btn-primary', false);"),

 ('18 el interruptor deja de poder QUITAR lo incluido',
  "  if (typeof esqEstaIncluido === 'function' && esqEstaIncluido('orejuela')) {",
  "  if (false) {"),

 # ══ COMMIT 6 · el dibujo ════════════════════════════════════════════════════════════════
 ('19 vuelve el triangulo del ventriculo izquierdo y se va la auricula',
  """  g += '<path d=\"M16 70 Q16 26 60 26 L150 26 Q178 26 184 52 L187 112 Q188 142 174 164 L38 164 ' +
       'Q16 164 16 140 Z\" fill=\"' + C.panel + '\" stroke=\"none\"/>';""",
  """  g += '<path d=\"M48 164 C60 200 80 226 99 232\" fill=\"none\" stroke=\"' + C.borde + '\" stroke-width=\"2\"/>';"""),

 ('20 la VPSI vuelve a ser un rotulo suelto, sin elipse',
  """  g += '<ellipse cx=\"166\" cy=\"28\" rx=\"22\" ry=\"15\" fill=\"' + C.panel + '\" stroke=\"' + C.linea +
       '\" stroke-width=\"1\"/>' + L(166, 32, 'VPSI', 'middle');""",
  "  g += L(166, 32, 'VPSI', 'middle');"),

 ('21 la silueta vuelve a UNA sola capa: se rompen las DOS a la vez',
  [("""  sil.forEach(dSil => {
    g += '<path d=\"' + dSil + '\" fill=\"' + C.acento + '\" stroke=\"' + C.acento +
         '\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/>';
  });""",
    """  sil.forEach(dSil => {
    g += '<path d=\"' + dSil + '\" fill=\"' + C.acento + '\" stroke=\"' + C.acento +
         '\" stroke-width=\"2.5\" stroke-linejoin=\"round\" fill-opacity=\"0.9\"/>';
  });"""),
   ("  sil.forEach(dSil => { g += '<path d=\"' + dSil + '\" fill=\"' + C.acentoBg + '\"/>'; });", "")]),

 ('22 el trombo vuelve a la PUNTA de la linea guia, fuera de la orejuela',
  "  const sp = _oaiSpec;",
  "  const sp = (function(){ const t = OAI_ESQ_TIP[morf]; return t ? { cx:t[0], cy:t[1], ang:0, rx:10, ry:15 } : null })();"),

 ('23 se va el recorte: el trombo puede asomar entre los lobulos de la coliflor',
  "  const clip = _oaiClip.length",
  "  const clip = false"),

 ('24 el rotulo vuelve a decir «Veleta»',
  "            <option value=\"veleta\">Manga de viento \u2014 riesgo intermedio</option>",
  "            <option value=\"veleta\">Veleta \u2014 riesgo intermedio</option>"),
]


def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
