#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_g.py — barrido de MUTACIONES DIRIGIDAS de la tanda G.

Cada mutacion revierte UNA de las cosas que la tanda cambio, sobre una COPIA de index.html, y
exige que TC-534 se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_g.py              # todas
  python3 scripts/_mut_g.py --solo 1,2,3 # un grupo, para correr en primer plano

⚠️ EXIGE LA LINEA `RESULTADO` EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun `✗` y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ NUNCA MUTA EL ARCHIVO VIVO. Se trabaja sobre /tmp y se restaura el original con su md5.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-534'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── G1 · la pantalla ──────────────────────────────────────────────────────────────────────
 ('01 la columna de la dosis vuelve a reservar 150 px con la droga apagada',
  "  .pop-droga { display:grid; grid-template-columns: minmax(0,1fr) auto; gap:10px; align-items:center; }",
  "  .pop-droga { display:grid; grid-template-columns: minmax(0,1fr) minmax(0,150px); gap:10px; align-items:center; }"),

 ('02 la fila de la droga encendida deja de ocupar las dos columnas',
  "    if (wrap.parentNode && wrap.parentNode.classList)\n      wrap.parentNode.classList.toggle('pop-droga-on', on);",
  "    if (false && wrap.parentNode) {}"),

 ('03 el acordeon del monitoreo aparece aunque no haya dispositivo',
  "  acc.style.display = hay ? 'block' : 'none';",
  "  acc.style.display = 'block';"),

 ('04 el campo del lactato desaparece',
  '<input type="number" id="pop_lactato" step="0.1" min="0" inputmode="decimal" placeholder="mmol/L">',
  '<input type="number" id="pop_lactato_off" step="0.1" min="0" inputmode="decimal" placeholder="mmol/L">'),

 # ── G2 · el esquema ───────────────────────────────────────────────────────────────────────
 ('05 el reparto en tres columnas pierde su media query',
  '  @media (min-width: 1100px) {\n    .pop-grid { grid-template-columns: minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);',
  '  @media (min-width: 9100px) {\n    .pop-grid { grid-template-columns: minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);'),

 ('06 la falla del VD se parte siempre hacia la poscarga',
  "    vdRama = papm === null ? 'sin_pap' : (papm > POP_PAPM_HP_MMHG ? 'poscarga' : 'contractilidad');",
  "    vdRama = 'poscarga';"),

 ('07 el ventriculo izquierdo se pinta siempre de verde',
  "    cVI: icB ? (icB.cls === 'green' ? 'ok' : icB.cls === 'yellow' ? 'warn' : 'bad') : 'none',",
  "    cVI: 'ok',"),

 ('08 la animacion ya no se detiene al salir del posoperatorio',
  "function popEsqParar() {\n  if (_popEsq.rafId) { cancelAnimationFrame(_popEsq.rafId); _popEsq.rafId = 0; }\n}",
  "function popEsqParar() { return; }"),

 ('09 el esquema se vuelve a montar en cada repintado',
  "  if (!svg || _popEsq.montado) return !!svg;",
  "  if (!svg) return false;"),

 ('10 el equivalente en TEXTO del dibujo se queda sin filas',
  "function popEsqTexto(d) {\n  const host = document.getElementById('pop-esq-txt');\n  if (!host) return null;",
  "function popEsqTexto(d) {\n  const host = document.getElementById('pop-esq-txt');\n  if (host) return null;"),

 # ── G3 · vasoplejia, PiCCO y derrame pleural ──────────────────────────────────────────────
 ('11 la vasoplejia vuelve a no mirar la PAM',
  "  if (icB && !icBajo && rvsBaja && pamBaja) pats.push({ k:'vasoplejia', lbl:'Vasoplejia', cls:'orange' });",
  "  if (icB && !icBajo && rvsBaja) pats.push({ k:'vasoplejia', lbl:'Vasoplejia', cls:'orange' });"),

 ('12 el corte de la PAM pasa de 65 a 70',
  "const POP_VASO_PAM_MAX = 65;",
  "const POP_VASO_PAM_MAX = 70;"),

 ('13 el SVRI del PiCCO deja de desindexarse por la superficie',
  "    rvs = picSvri / asc; rvsFuente = 'SVRI del PiCCO / SC';",
  "    rvs = picSvri; rvsFuente = 'SVRI del PiCCO / SC';"),

 ('14 el derrame pleural pierde el chip que declara que sus grados no tienen fuente',
  "      badge('gray', 'Criterio de EcoSmart') +\n      '. La estimación del volumen",
  "      '' +\n      '. La estimación del volumen"),

 ('15 el pie del cuadro del VD vuelve a declarar 0,9',
  "' mm · VD/VI ' + TEP_VDVI_DILAT_MIN.toFixed(1) + ').",
  "' mm · VD/VI 0,9).",),

 # ── G4 · informe, EN SUMA y PDF ───────────────────────────────────────────────────────────
 ('16 vuelve la seccion del patron a la hoja del PDF',
  "  L.push('!! ' + POP_DISCLAIMER);\n  return L.join('\\n');\n}\nwindow.amiloTextoPOP = amiloTextoPOP;",
  "  L.push('## Patrón hemodinámico');\n  L.push(r.patron.lbl + '.');\n  L.push('!! ' + POP_DISCLAIMER);\n  return L.join('\\n');\n}\nwindow.amiloTextoPOP = amiloTextoPOP;"),

 ('17 vuelve el patron a la linea del EN SUMA',
  "         (h !== null ? ' — hora ' + h + ' h' : '') +\n         (r.ic !== null ? ' — IC ' + r.ic.toFixed(2) + ' L/min/m²' : '') +",
  "         (h !== null ? ' — hora ' + h + ' h' : '') +\n         ' — Patrón: ' + r.pat.lbl +\n         (r.ic !== null ? ' — IC ' + r.ic.toFixed(2) + ' L/min/m²' : '') +"),

 ('18 el lactato deja de salir a la hoja del PDF',
  "  if (_lac !== null) L.push('Lactato | ' + _lac + ' mmol/L');",
  "  if (false) L.push('Lactato');"),

 # ── G5 · Referencias ──────────────────────────────────────────────────────────────────────
 ('19 la ficha del posoperatorio queda fuera de las seis subpestanas',
  "                        'pulmon', 'pop', 'cardiotox', 'miocard', 'congenitas', 'formulas'])",
  "                        'pulmon', 'cardiotox', 'miocard', 'congenitas', 'formulas'])"),

 ('20 la ficha pierde el folio de la cirugia mitral',
  "<b>&sect;3.1.5 y Tabla 3, folio 701</b>",
  "<b>&sect;3.1.5 y Tabla 3</b>"),

 # ── G6 · Evidencia ────────────────────────────────────────────────────────────────────────
 ('21 la seccion del posoperatorio sale del panel de Evidencia',
  "  { tit:'Posoperatorio de cirugía cardíaca', fn:_indPOP }\n];",
  "];"),

 ('22 la compuerta de la seccion se abre siempre',
  "  if ((cx === '' || cx === 'ninguna') && asist === '') return null;",
  "  if (false) return null;"),

 ('23 el sindrome post-lesion cardiaca baja su umbral de dos criterios a uno',
  "  const pcis = pos >= 2;",
  "  const pcis = pos >= 1;"),

 ('25 el acordeon deja de MEDIR el alto que reserva',
  "    if (_popMonAbierto) { var h = acc.offsetHeight; if (h > 0) _popMonAlto = h; }",
  "    if (_popMonAbierto) { _popMonAlto = 0; }"),

 ('24 la cirugia valvular pierde su entrada de «Segun la cirugia…»',
  "  valvular: Object.freeze({\n    txt: 'Tras cirugía mitral:",
  "  valvularX: Object.freeze({\n    txt: 'Tras cirugía mitral:"),
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
    bak = tempfile.mktemp(suffix='.html')
    shutil.copy2(IDX, bak)
    res = []
    try:
        for i, (nom, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            n = orig.count(viejo)
            if n != 1:
                res.append((i, nom, 'NO APLICA', 'el patron aparece %d veces' % n))
                print('  %02d  NO APLICA  %s (%d apariciones)' % (i, nom, n), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
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
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
