#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant6.py — barrido de MUTACIONES DIRIGIDAS de la tanda PANT-6 (2026-11-03).

Cada mutacion revierte UNA de las cosas que los seis commits de codigo cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant6.py              # todas
  python3 scripts/_mut_pant6.py --solo 1,2   # algunas

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: con los cinco, un
   reparto mal hecho queda tapado por el caso de otro commit. Es la leccion de la tanda TGA.
⚠️ VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (caso, nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · el dibujo del VD ───────────────────────────────────────────────
 ('TC-650', '01 el dibujo vuelve a su ancho de PANT-6, el doble del esquema valvular',
  "#vdsc-svg{display:block;width:220px;height:300px;max-width:100%;margin:0 auto;}",
  "#vdsc-svg{display:block;width:100%;max-width:520px;height:auto;margin:0 auto;}"),

 ('TC-650', '02 la letra del rotulo vuelve a 4.2 y deja de ser la del esquema valvular',
  "#vdsc-svg .vdsc-lbl{font-size:5.2px;",
  "#vdsc-svg .vdsc-lbl{font-size:4.2px;"),

 ('TC-650', '03 el rotulo del septum vuelve a dos lineas',
  "var ROT={mc:['Sg McConnell'],sp:['SIV desplazado']};",
  "var ROT={mc:['Sg McConnell'],sp:['SIV','desplazado']};"),

 ('TC-650', '04 el rotulo del McConnell vuelve al largo',
  "var ROT={mc:['Sg McConnell'],sp:['SIV desplazado']};",
  "var ROT={mc:['McConnell'],sp:['SIV desplazado']};"),

 # 05 mutaba el atributo del marcado y SOBREVIVIO: vdscSync reescribe esa opacidad en cada
 # pasada, asi que no inyectaba ningun defecto (mutacion equivalente). Lo que se muta es la
 # linea que la escribe.
 ('TC-650', '05 DE MAS: el dibujo deja de ser mudo sin datos',
  "  gNames.setAttribute('opacity',S.hay?'1':'0');",
  "  gNames.setAttribute('opacity','1');"),

 ('TC-650', '06 DE MAS: entra un control de dato dentro de la caja del dibujo',
  "          <div id=\"vdsc-pie\">",
  "          <div id=\"vdsc-pie\"><input type=\"number\" id=\"vdsc-colado\">"),

 # ── commit 2 · los bordes de la CIA ───────────────────────────────────────────
 ('TC-651', '07 el ancho disponible del sector devuelve siempre cero',
  "  if (!dentro(seg.sx, yy)) return 0;",
  "  if (!dentro(seg.sx, yy)) return 0;\n  return 0;"),

 ('TC-651', '08 DE MAS: el medidor deja de ver el agujero del anillo',
  "    if (r < R0 + MARG || r > R1 - MARG) return false;",
  "    if (r > R1 - MARG) return false;"),

 ('TC-651', '09 el generador deja de publicar la lista de los que no entraron',
  "  if (info && typeof info === 'object') info.fuera = _ciaFuera;",
  "  if (false) info.fuera = _ciaFuera;"),

 ('TC-651', '10 el ajuste se endurece y los cinco bordes salen al costado',
  "    if (wSig <= dSig && wVal <= dVal) {",
  "    if (wSig <= dSig * 0.05 && wVal <= dVal) {"),

 ('TC-651', '11 la CIA sale del registro de miniaturas',
  "  { k:'cia', lbl:'Bordes de la CIA', chk:'ete_shunt_incluir_chk',",
  "  { k:'ciaX', lbl:'Bordes de la CIA', chk:'ete_shunt_incluir_chk',"),

 ('TC-651', '12 DE MAS: la puerta de la miniatura ignora si hay algun borde medido',
  "                 if (!_CIA_BORDES.some(b2 => v(b2[0]) != null)) return false;",
  "                 if (false) return false;"),

 ('TC-651', '13 DE MAS: la puerta de la miniatura ignora la casilla',
  "                 if (!(c && c.checked)) return false;\n                 if (typeof _CIA_BORDES === 'undefined' || typeof v !== 'function') return false;",
  "                 if (typeof _CIA_BORDES === 'undefined' || typeof v !== 'function') return false;"),

 # ── commit 3 · los globos, el resalte y la barra ──────────────────────────────
 ('TC-652', '14 el ancla de la tarjeta vuelve a ser el PRIMER boton del documento',
  "  if (btn && btn.getAttribute && btn.getAttribute('data-vinfo') === k) return btn;",
  "  if (false) return btn;"),

 ('TC-652', '15 el globo del indice de Tei sale del registro',
  "  'vd-tei': {\n    ancho: 420,",
  "  'vd-teiX': {\n    ancho: 420,"),

 ('TC-652', '16 el globo del signo 60/60 sale del registro',
  "  'tep-6060': {\n    ancho: 400,",
  "  'tep-6060X': {\n    ancho: 400,"),

 ('TC-652', '17 los dos globos nuevos pierden su boton Ver referencia',
  "  'vd-tei': 'vd2', 'tep-6060': 'vd2',",
  "  'vd-teiZ': 'vd2', 'tep-6060Z': 'vd2',"),

 ('TC-652', '18 DE MAS: el resalte del 60/60 pasa a incluir los 60 ms exactos',
  "  const on = (tap != null && isFinite(tap) && tap < TEP_6060_TAP_MAX);",
  "  const on = (tap != null && isFinite(tap) && tap <= TEP_6060_TAP_MAX);"),

 ('TC-652', '19 DE MAS: el resalte escribe el campo que contesto el medico',
  "  ['tep-6060-lbl', 'tep-6060-fila-lbl'].forEach(function (id) {",
  "  { const s6 = document.getElementById('tep_signo6060'); if (s6 && on) s6.value = 'si'; }\n  ['tep-6060-lbl', 'tep-6060-fila-lbl'].forEach(function (id) {"),

 ('TC-652', '20 los grados del tiempo de aceleracion se corren un tramo',
  "    Object.freeze({ g:'normal', op:'>', v:105 }), Object.freeze({ g:'leve', op:'>=', v:80 }),\n    Object.freeze({ g:'moderada', op:'>=', v:60 }), Object.freeze({ g:'severa' })]) })",
  "    Object.freeze({ g:'normal', op:'>', v:105 }), Object.freeze({ g:'leve', op:'>=', v:70 }),\n    Object.freeze({ g:'moderada', op:'>=', v:50 }), Object.freeze({ g:'severa' })]) })"),

 ('TC-652', '21 el corte de elemento indirecto de HTP se mueve',
  "const UMBRAL_TAP_HTP       = 105;",
  "const UMBRAL_TAP_HTP       = 110;"),

 # ── commit 4 · los cuatro arreglos chicos ─────────────────────────────────────
 ('TC-653', '22 la franja del TEER pierde su color en el tema claro',
  "  html.light-mode #teer-tipo-aviso { color:#B91C1C; }",
  "  html.light-mode #teer-tipo-aviso-X { color:#B91C1C; }"),

 ('TC-653', '23 la franja deja de reescribirse al mostrarse',
  "    if (_av && !r.tipoIM) _av.textContent = TEER_TIPO_AVISO_TXT;",
  "    if (false) _av.textContent = TEER_TIPO_AVISO_TXT;"),

 ('TC-653', '24 vuelve la frase no determinable del Forrester al papel',
  "  if (f)  L.push('Perfil de Forrester (estimado por eco): ' + f);",
  "  L.push('Perfil de Forrester (estimado por eco): ' + (f || 'no determinable'));"),

 ('TC-653', '25 el rotulo del papel vuelve a PAPs',
  "p.push('PSAP estimada por CIV '+f1(pc)+' mmHg');",
  "p.push('PAPs estimada por CIV '+f1(pc)+' mmHg');"),

 # ── commits 5 a 8 · las cuatro pantallas ──────────────────────────────────────
 ('TC-654', '26 la fila de Wilkins deja de ser grilla desde 900 px',
  "    #wilk-fila { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr);",
  "    #wilk-fila { display:block; grid-template-columns:minmax(0,1fr) minmax(0,1fr);"),

 ('TC-654', '27 los cuatro campos de Wilkins vuelven a dos columnas',
  "  #wilk-campos.grid-1 { display:grid; grid-template-columns:1fr; gap:10px; }",
  "  #wilk-campos.grid-1 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }"),

 ('TC-654', '28 la conclusion de la orejuela sale de la fila',
  "    #oai-fila > .calc-box { grid-column:1; grid-row:2; margin-top:0; }",
  "    #oai-fila > .calc-boxX { grid-column:1; grid-row:2; margin-top:0; }"),

 ('TC-654', '29 el dibujo de la orejuela deja de abarcar las dos filas',
  "    #oai-fila > #oai-esq-caja { grid-column:2; grid-row:1 / span 2; margin-top:0; }",
  "    #oai-fila > #oai-esq-caja { grid-column:2; grid-row:1; margin-top:0; }"),

 ('TC-654', '30 los campos de la aorta del ETE vuelven a tres columnas',
  '<div id="eteao-campos" class="grid-2">',
  '<div id="eteao-campos" class="grid-3">'),

 ('TC-654', '31 la VAB pierde una de sus cuatro columnas',
  '        <div class="vab-col"><!-- COLUMNA 4: el contexto quirurgico -->',
  '        <div class="vab-colX"><!-- COLUMNA 4: el contexto quirurgico -->'),

 ('TC-654', '32 la VAB deja de repartir en cuatro desde 1200 px',
  "    #vab-fila { grid-template-columns:repeat(4, minmax(0,1fr)); }\n    #vab-fila > #vab-dibujo-host { grid-column:1 / -1; grid-row:auto; justify-self:center; }",
  "    #vab-fila { grid-template-columns:repeat(2, minmax(0,1fr)); }\n    #vab-fila > #vab-dibujo-host { grid-column:1 / -1; grid-row:auto; justify-self:center; }"),

 ('TC-654', '33 el sincronizador de Wilkins deja de traducir el centinela de vacio',
  "    if (val === '' || val === '0') val = WILK_VACIO[dst];",
  "    if (val === '') val = WILK_VACIO[dst];"),

 ('TC-654', '34 DE MAS: la sincronia corre sin exigir un gesto de confianza',
  "  if (!ev || ev.isTrusted !== true) return false;\n  var e = document.getElementById(WILK_MARCA[src]);",
  "  if (!ev) return false;\n  var e = document.getElementById(WILK_MARCA[src]);"),

 # ── commit 10b · la letra del cartel ──────────────────────────────────────────
 ('TC-655', '35 el cartel de la orejuela vuelve a fijarse su propia letra',
  "  cont.style.cssText = 'line-height:1.55;';",
  "  cont.style.cssText = 'font-size:12px;line-height:1.55;';"),
]

def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-300:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion', out))
    if rojo and rojo.group(1) == '0':
        return 'MUERTA', '%d condicion(es) en rojo%s' % (nC, ' + EXCEPCION' if nE else '')
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:160]

def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    print('  md5 de partida: %s  (%d mutaciones)' % (m0[:8], len(MUT)), flush=True)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            caso, nom = ent[0], ent[1]
            pares = ent[2] if (len(ent) == 3 and isinstance(ent[2], list)) else [(ent[2], ent[3])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, caso, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s %s (apariciones %s)' % (i, caso, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)[:200]
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, caso, nom, v, det))
            print('  %02d  %-11s %s  %s  —  %s' % (i, v, caso, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[3] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, caso, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s %s · %s' % (i, v, caso, nom, det))
    print('  md5 al cerrar: %s  (identico: %s)' % (md5(IDX)[:8], md5(IDX) == m0))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
