#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant8.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-8 (2026-11-04).

Cada mutacion revierte UNA de las cosas que los seis commits de codigo cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant8.py              # todas
  python3 scripts/_mut_pant8.py --solo 1,2   # algunas

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

# (caso, nombre, viejo, nuevo) - viejo tiene que aparecer EXACTAMENTE una vez.
MUT = [
 ('TC-656', '01 la barra del Post pierde cc-lesbar y vuelve a esconderse en el telefono',
  '<div class="subtabs-wrap cc-lesbar ete-tavi-btnbar" style="justify-content:flex-end;">',
  '<div class="subtabs-wrap ete-tavi-btnbar" style="justify-content:flex-end;">'),

 ('TC-656', '02 las dos barras vuelven a justificar a la izquierda',
  '<div class="subtabs-wrap cc-lesbar ete-tavi-btnbar" style="justify-content:flex-end;">',
  '<div class="subtabs-wrap cc-lesbar ete-tavi-btnbar" style="justify-content:flex-start;">'),

 ('TC-656', '03 el pintor vuelve a usar la clase active, que showTab barre',
  "    b.classList.toggle('cc-pane-on', on);\n    b.setAttribute('aria-pressed', on ? 'true' : 'false');",
  "    b.classList.toggle('active', on);\n    b.setAttribute('aria-pressed', on ? 'true' : 'false');"),

 ('TC-656', '04 eteTaviSync deja de repintar: el embudo de restauracion ya no repone el pintado',
  "  if (typeof eteTaviPaneSync === 'function') { try { eteTaviPaneSync(); } catch (e) {} }\n  /* El espejo va PRIMERO",
  '  /* El espejo va PRIMERO'),

 ('TC-656', '05 DE MAS: el pintor escribe un campo del estudio',
  "function eteTaviPaneSync(){\n  [['pre','ete-tavi-tab-pre'],['post','ete-tavi-tab-post']].forEach(function(par){",
  "function eteTaviPaneSync(){\n  try { var _z=document.getElementById('ete_tavi_calc'); if(_z) _z.value='leve' } catch(e){}\n  [['pre','ete-tavi-tab-pre'],['post','ete-tavi-tab-post']].forEach(function(par){"),

 ('TC-656', '06 los dos botones vuelven a la MISMA barra',
  '        </div>\n      </div>\n      <div class="subtabs-wrap cc-lesbar ete-tavi-btnbar" style="justify-content:flex-end;">\n        <div class="tabs-row">\n          <button type="button" class="tab-btn" id="ete-tavi-tab-post"',
  '          <button type="button" class="tab-btn" id="ete-tavi-tab-post"'),

 ('TC-657', '07 el corte de las tres columnas baja a 700 px',
  '  @media (min-width: 900px) {\n    #ete-tavi-post-cols { grid-template-columns:repeat(3, minmax(0,1fr)); }',
  '  @media (min-width: 700px) {\n    #ete-tavi-post-cols { grid-template-columns:repeat(3, minmax(0,1fr)); }'),

 ('TC-657', '08 el piso de 170 px de los campos sale de la media query',
  '    #ete-tavi-post-cols .ete-tavi-pcol > .grid-2,\n    #ete-tavi-post-cols .ete-tavi-pcol > .grid-3,',
  '    #ete-tavi-post-cols .xx-pcol > .grid-2,\n    #ete-tavi-post-cols .ete-tavi-pcol > .grid-3,'),

 ('TC-657', '09 algo se cuela entre las tres columnas y el bloque del jet',
  '      </div><!-- /#ete-tavi-post-cols -->',
  '      </div><!-- /#ete-tavi-post-cols -->\n      <div>x</div>'),

 ('TC-657', '10 la tercera columna se fusiona con la segunda: el contenedor queda con DOS',
  '      </div>\n      <div class="ete-tavi-pcol">\n      <div style="font-size:12px;font-weight:700;color:var(--accent2);margin:14px 0 8px;">Regurgitación paravalvular <span',
  '      <div style="font-size:12px;font-weight:700;color:var(--accent2);margin:14px 0 8px;">Regurgitación paravalvular <span'),

 ('TC-658', '11 el espejo se hace SIMETRICO y el estudio escribe en TAVI sin el modulo en uso',
  '  if (!desdeTavi && !_taviModuloEnUso()) return;',
  '  if (false && !desdeTavi && !_taviModuloEnUso()) return;'),

 ('TC-658', '12 el vacio deja de propagarse: borrar ya no borra',
  "  const vs = String(src.value || '').trim();\n  if (vs !== '' && !isFinite(Number(vs))) return;",
  "  const vs = String(src.value || '').trim();\n  if (vs === '' || !isFinite(Number(vs))) return;"),

 ('TC-658', '13 lo que esta a medio escribir se propaga',
  "  if (vs !== '' && !isFinite(Number(vs))) return;",
  '  if (false) return;'),

 ('TC-658', '14 el reconciliador pisa los dos cargados y distintos',
  "    if (va !== '' && vb !== '') return;          /* los dos cargados y distintos: no se toca */",
  '    if (false) return;          /* los dos cargados y distintos: no se toca */'),

 ('TC-658', '15 el reconciliador escribe en TAVI sin el modulo en uso',
  "    if (va === '' && !enUso) return;             /* estudio -> TAVI solo con el modulo en uso */",
  '    if (false) return;             /* estudio -> TAVI solo con el modulo en uso */'),

 ('TC-658', '16 DE MAS: el anillo de TAVI escribe el diametro del TSVI',
  "  Object.freeze({ tavi:'ete_tavi_ao_asc',   ao:'ao_tub', lbl:'aorta ascendente proximal' })",
  "  Object.freeze({ tavi:'ete_tavi_ao_asc',   ao:'ao_tub', lbl:'aorta ascendente proximal' }),\n  Object.freeze({ tavi:'ete_tavi_anillo_diam', ao:'diam_tsvi_ao', lbl:'anillo' })"),

 ('TC-658', '17 DE MAS: la morfologia se sincroniza con Valvulas',
  '  if (typeof eteTaviPaneSync === \'function\') { try { eteTaviPaneSync(); } catch (e) {} }',
  "  if (typeof eteTaviPaneSync === 'function') { try { eteTaviPaneSync(); } catch (e) {} }\n  try { var a1=document.getElementById('ete_tavi_morf'), b1=document.getElementById('va_morf'); if(a1&&b1&&a1.value==='bicuspide') b1.value='Bicúspide' } catch(e){}"),

 ('TC-658', '18 el gesto deja de llamar al dueno desde el campo del seno de Valsalva',
  'oninput="taviAoSync(\'tavi\',\'ete_tavi_valsalva\');eteTaviSync()"',
  'oninput="eteTaviSync()"'),

 ('TC-659', '19 la clave del globo sale del registro',
  "  'tavi-calc': { tit: 'La calcificación de la válvula aórtica', ancho: 460, lee:",
  "  'tavi-calc-x': { tit: 'La calcificación de la válvula aórtica', ancho: 460, lee:"),

 ('TC-659', '20 el boton pierde el area tactil de 44 px',
  'class="vinfo-btn vinfo-btn-44" data-vinfo="tavi-calc"',
  'class="vinfo-btn" data-vinfo="tavi-calc"'),

 ('TC-659', '21 DE MAS: el globo publica una clase de recomendacion',
  "      'DE DÓNDE SALE EL CRITERIO. Ninguna de las fuentes",
  "      'Clase I. DE DÓNDE SALE EL CRITERIO. Ninguna de las fuentes"),

 ('TC-659', '22 el corte de la mujer desaparece del globo',
  '· Por encima de 2000 unidades Agatston en el varón y de 1200 en la mujer',
  '· Por encima de 2000 unidades Agatston en el varón'),

 ('TC-660', '23 las filas del tronco salen del cuadro',
  "      { ficha: 'DIM-VD-007', rot: 'Tronco de la AP — normal',               h: '≤ 2,5 cm', m: '≤ 2,5 cm' },",
  "      { ficha: 'DIM-VD-007', rot: 'x', h: 'x', m: 'x' },"),

 ('TC-660', '24 DE MAS: las ramas estrenan un valor normal que la guia no publica',
  "      { ficha: 'DIM-VD-008', rot: 'Ramas derecha e izquierda',              h: 'sin valor normal publicado', m: 'sin valor normal publicado' },",
  "      { ficha: 'DIM-VD-008', rot: 'Ramas derecha e izquierda',              h: '≤ 1,7 cm', m: '≤ 1,7 cm' },"),

 ('TC-660', '25 las filas de la guia de 2015 salen del cuadro',
  "      { ficha: 'DIM-VD-010', rot: 'TSVD eje largo — rango normal de 2015',  h: '20 a 30 mm', m: '20 a 30 mm' },",
  "      { ficha: 'DIM-VD-010', rot: 'x', h: 'x', m: 'x' },"),

 ('TC-660', '26 la banda de plausibilidad de la arteria pulmonar se mueve',
  'const IP_AP_BANDA = Object.freeze([5, 80]);',
  'const IP_AP_BANDA = Object.freeze([5, 90]);'),

 ('TC-660', '27 el eje corto distal pierde sus cuatro grados',
  "      { ficha: 'DIM-VD-009', rot: 'TSVD eje corto distal — normal',         h: '< 2,9 cm', m: '< 2,9 cm' },",
  "      { ficha: 'DIM-VD-009', rot: 'x', h: 'x', m: 'x' },"),

 ('TC-661', '28 la seccion pierde el molde',
  '  return { filas: filas, molde: molde,\n    clinica: clinica,\n    recom: _indEPRecom(',
  '  return { filas: filas,\n    clinica: clinica,\n    recom: _indEPRecom('),

 ('TC-661', '29 DE MAS: la seccion estrena una fila de estadio que la guia no publica',
  '    est: null,\n    datos: _epDatos.map(',
  "    est: { et:'Estadio', txt:'C', por:'x' },\n    datos: _epDatos.map("),

 ('TC-661', '30 la pregunta de sintomas pierde su globo',
  "      { term: 'epsintomas' }),",
  '      {}),'),

 ('TC-661', '31 los dos grupos se funden en uno solo',
  "    cols: [ [ { tit:'Indicación', filas:_indPorClave(clinica, ['ep.sintomas', 'ep.sustituto']) },\n              { tit:'Criterios del asintomático',\n                filas:_indPorClave(clinica, ['ep.ejercicio', 'ep.deterioro', 'ep.shunt']) } ] ],",
  "    cols: [ [ { tit:'Indicación', filas:_indPorClave(clinica, ['ep.sintomas', 'ep.sustituto', 'ep.ejercicio', 'ep.deterioro', 'ep.shunt']) } ] ],"),

 ('TC-661', '32 DE MAS: la protesis mitral estrena molde, que es la parada que P6-a declara',
  "  return { filas: filas, clinica: clinica,\n    aviso: _protDom ? '' :",
  "  return { filas: filas, clinica: clinica,\n    molde: { cat:{ et:'x', txt:'x', por:'x' }, est:null, datos:[], cols:[[]], pie:null },\n    aviso: _protDom ? '' :"),

 ('TC-661', '33 las dos filas de solo lectura vuelven a las preguntas y salen de los datos',
  '  const _epDatos = filas.concat(clinica.filter(function(f){ return f && !f.ctrl && !f.origen; }));',
  '  const _epDatos = filas;'),

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
