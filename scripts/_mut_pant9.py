#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant9.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-9 (2026-11-04).
Calcado de _mut_pant8.py. Nombre propio: verificado con ls, no existia.

Cada mutacion revierte UNA de las cosas que los ocho commits de codigo cambiaron -o la aplica DE
MAS- sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant9.py              # todas
  python3 scripts/_mut_pant9.py --solo 1,2   # algunas

** SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
** EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» - indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
** CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: con los seis, un reparto
   mal hecho queda tapado por el caso de otro commit.
** VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS. Existen porque las condiciones que las matan son
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
 # ===== TC-666: EL CONTRATO DE LA HOJA DE ESTILOS =====
 ('TC-666', '01 el corte de las tres columnas baja de 900 a 800 px',
  '@media (min-width:900px){\n  .cc9-cols{grid-template-columns:repeat(3,minmax(0,1fr));}\n}',
  '@media (min-width:800px){\n  .cc9-cols{grid-template-columns:repeat(3,minmax(0,1fr));}\n}'),

 ('TC-666', '02 el corte de la conclusion a la derecha vuelve a 1220 px, donde la columna mide 192',
  '@media (min-width:1260px){\n  .cc9-fila{grid-template-columns:minmax(0,1fr) 360px;}\n}',
  '@media (min-width:1220px){\n  .cc9-fila{grid-template-columns:minmax(0,1fr) 360px;}\n}'),

 ('TC-666', '03 el piso de la columna se declara FUERA de la media query',
  '.cc9-cols > .cc9-col{min-width:0;display:flex;flex-direction:column;gap:8px;}',
  '.cc9-cols > .cc9-col{min-width:210px;display:flex;flex-direction:column;gap:8px;}'),

 ('TC-666', '04 la tarjeta de conclusion deja de ser gris',
  '.cc9-concl{background:var(--section-head);border:1px solid var(--border);border-radius:10px;',
  '.cc9-concl{background:var(--bg2);border:1px solid var(--border);border-radius:10px;'),

 ('TC-666', '05 el cuadro de la seccion pierde su borde de 2 px',
  '.cc9-cuadro{border:2px solid var(--accent);border-radius:12px;padding:12px;',
  '.cc9-cuadro{border:1px solid var(--accent);border-radius:12px;padding:12px;'),

 ('TC-666', '06 los titulos de grupo dejan de ir en mayusculas',
  '.cc9-h{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;',
  '.cc9-h{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:none;'),

 ('TC-666', '07 los titulos de grupo bajan a 9 px, por debajo del piso de letra de pantalla',
  '.cc9-h{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;',
  '.cc9-h{font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;'),

 ('TC-666', '08 el boton del encabezado pierde el margin-left auto y vuelve a la izquierda',
  '.cc9-hdrbar > .cc9-hdr-der{margin-left:auto;margin-right:0;}',
  '.cc9-hdrbar > .cc9-hdr-der{margin-left:0;margin-right:0;}'),

 ('TC-666', '09 las casillas de complicaciones vuelven a UNA columna',
  '.cc9-chk2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 6px;}',
  '.cc9-chk2{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:2px 6px;}'),

 ('TC-666', '10 las areas de Celermajer vuelven a UNA columna',
  '.cc9-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start;}',
  '.cc9-g2{display:grid;grid-template-columns:repeat(1,minmax(0,1fr));gap:8px;align-items:start;}'),

 ('TC-666', '11 DE MAS: la conclusion a la derecha se declara FUERA de toda media query',
  '.cc9-fila{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;align-items:start;}',
  '.cc9-fila{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:14px;align-items:start;}'),

 # ===== TC-662: FONTAN =====
 ('TC-662', '12 el globo de la insuficiencia AV sistemica apunta a una clave que no existe',
  'data-vinfo="cc9-fontan-iav"',
  'data-vinfo="cc9-fontan-iav-NO"'),

 ('TC-662', '13 DE MAS: la nota de la saturacion vuelve al cuerpo de la pantalla',
  '<input type="number" id="fontan_saturacion" placeholder="%" oninput="fontanSync()"></div>',
  '<input type="number" id="fontan_saturacion" placeholder="%" oninput="fontanSync()">'
  '<span style="font-size:10px;color:var(--text2);">Normal sin fenestracion: &gt;93-95&nbsp;%.</span></div>'),

 ('TC-662', '14 «Sin complicaciones» deja de ser excluyente de las otras cinco',
  "    if (ning && ning.checked) fontanComplicaciones().forEach(c => {",
  "    if (false && ning && ning.checked) fontanComplicaciones().forEach(c => {"),

 ('TC-662', '15 la tira de conclusion de Fontan sale de la tarjeta de la derecha',
  '<div class="cc9-concl">\n            <div id="fontan-resultado" class="calc-box"></div>',
  '<div class="cc9-xconcl">\n            <div id="fontan-resultado" class="calc-box"></div>'),

 ('TC-662', '16 la tercera columna de Fontan cambia de tema',
  '<div class="cc9-h">Congestión y complicaciones</div>',
  '<div class="cc9-h">Complicaciones y congestión</div>'),

 ('TC-662', '17 el texto de la saturacion deja de estar palabra por palabra en su globo',
  "    lee: 'Normal sin fenestracion: >93-95 %.'",
  "    lee: 'Normal sin fenestracion: mas de 93-95 %.'"),

 ('TC-662', '18 «Ver criterios» de Fontan pierde la clase que lo manda a la derecha',
  '<button type="button" class="btn btn-ghost cc9-hdr-der" style="font-size:11px;padding:4px 12px;" onclick="critAbrir(\'fontan\')">',
  '<button type="button" class="btn btn-ghost" style="font-size:11px;padding:4px 12px;" onclick="critAbrir(\'fontan\')">'),

 # ===== TC-663: EISENMENGER =====
 ('TC-663', '19 la franja roja de contraindicaciones pierde su rotulo',
  '<b style="color:var(--red);">Contraindicaciones absolutas</b>',
  '<b style="color:var(--red);">Contraindicaciones</b>'),

 ('TC-663', '20 DE MAS: la franja roja pasa al registro de globos, que es lo que el medico prohibio',
  "    tit: 'La saturacion de oxigeno en reposo en el sindrome de Eisenmenger',",
  "    tit: 'Contraindicaciones absolutas en el sindrome de Eisenmenger',\n"
  "    ojo: 'Contraindicaciones absolutas: embarazo, correccion quirurgica y ejercicio extenuante.',"),

 ('TC-663', '21 el globo del derrame pericardico apunta a una clave que no existe',
  'data-vinfo="cc9-eisen-per"',
  'data-vinfo="cc9-eisen-per-NO"'),

 ('TC-663', '22 DE MAS: la nota del sincope vuelve al cuerpo de la pantalla',
  '<select id="eis_sincope" onchange="eisenSync()">\n                  <option value="">&mdash;</option><option value="no">No</option><option value="si">Si</option>\n                </select></div>',
  '<select id="eis_sincope" onchange="eisenSync()">\n                  <option value="">&mdash;</option><option value="no">No</option><option value="si">Si</option>\n                </select><span style="font-size:10px;color:var(--text2);">Marcador de mal pronostico.</span></div>'),

 ('TC-663', '23 la segunda columna de Eisenmenger cambia de tema',
  '<div class="cc9-h">Presión pulmonar y ventrículo derecho</div>',
  '<div class="cc9-h">Presión pulmonar</div>'),

 # ===== TC-664: EBSTEIN =====
 ('TC-664', '24 DE MAS: el parrafo de la seccion vuelve al cuerpo de la pantalla',
  '<div class="cc9-fila" id="ebs-fila">',
  '<p style="font-size:11px;">Desplazamiento apical del velo septal tricuspídeo con atrialización del ventrículo derecho.</p><div class="cc9-fila" id="ebs-fila">'),

 ('TC-664', '25 la CAJA ROJA del indice deja de estar en el bloque «A tener en cuenta»',
  "    ojo: 'El índice es orientativo, no una indicación. Por ecocardiografía sobreestima la '",
  "    nota: 'El índice es orientativo, no una indicación. Por ecocardiografía sobreestima la '"),

 ('TC-664', '26 las cinco areas dejan de ir en la grilla de dos columnas',
  '<div class="cc9-g2">\n                <div class="fg"><label>Área AD (cm²)</label>',
  '<div class="grid-3">\n                <div class="fg"><label>Área AD (cm²)</label>'),

 ('TC-664', '27 el globo del grupo del indice apunta a una clave que no existe',
  'data-vinfo="cc9-ebs-cel"',
  'data-vinfo="cc9-ebs-cel-NO"'),

 ('TC-664', '28 DE MAS: el encabezado de Ebstein gana un segundo boton',
  '<button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="cc9-ebs-sec"',
  '<button type="button" class="btn btn-ghost" onclick="void 0">X</button><button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="cc9-ebs-sec"'),

 # ===== TC-665: DSAV, CVPA, DUCTUS, VENTANA AORTOPULMONAR =====
 ('TC-665', '29 DE MAS: la linea de disenio del DSAV vuelve al cuerpo de la pantalla',
  '<div class="cc9-fila" id="dsav-fila">',
  '<p style="font-size:11px;">Dos lugares donde escribir el mismo número es la vía más corta a que la pantalla y el informe firmado digan cosas distintas.</p><div class="cc9-fila" id="dsav-fila">'),

 ('TC-665', '30 el rotulo del DSAV deja de decir de donde sale el dato',
  '<label>FEVI y DTSVI &mdash; del estudio</label>',
  '<label>FEVI y DTSVI</label>'),

 ('TC-665', '31 la conducta de la ventana aortopulmonar se pierde al mover el parrafo',
  "       + 'la repercusión hemodinámica se asume salvo prueba en contra. ESC 2020: cierre indicado '\n       + 'siempre, salvo hipertensión pulmonar irreversible (Eisenmenger).'",
  "       + 'la repercusión hemodinámica se asume salvo prueba en contra.'"),

 ('TC-665', '32 DE MAS: el ductus gana un globo que no le corresponde, porque no tenia textos',
  '<div class="cc9-h">Gradiente y presión</div>',
  '<div class="cc9-h">Gradiente y presión <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="cc9-dsav-rvp" aria-expanded="false" aria-label="x" onclick="vInfoClic(this)">&#9432;</button></div>'),

 ('TC-665', '33 la tercera columna de la CVPA cambia de tema',
  '<div class="cc9-h">Clínica y datos del estudio</div>',
  '<div class="cc9-h">Clínica</div>'),

 ('TC-665', '34 la ventana aortopulmonar pierde el globo de su titulo',
  '<button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="cc9-vap-sec"',
  '<button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="cc9-vap-sec-NO"'),

 # ===== TC-667: TAVI =====
 ('TC-667', '35 el selector de TAVI pierde la opcion de valve-in-valve',
  '<option value="protesis_bio">Prótesis biológica previa (valve-in-valve)</option>',
  '<option value="protesis_bio_NO">Prótesis biológica previa (valve-in-valve)</option>'),

 ('TC-667', '36 la opcion nueva pierde su texto de papel y el emisor publicaria el token crudo',
  "        protesis_bio:'sobre prótesis biológica previa'},",
  "        },"),

 ('TC-667', '37 el sentido Valvulas -> TAVI deja de ser condicional y rompe el filtro del Laboratorio',
  "  const desdeTavi = (origen === 'tavi');\n  if (!desdeTavi && !_taviModuloEnUso()) return;\n  const src = desdeTavi ? a : b, dst = desdeTavi ? b : a;\n  const vs = String(src.value || '');",
  "  const desdeTavi = (origen === 'tavi');\n  const src = desdeTavi ? a : b, dst = desdeTavi ? b : a;\n  const vs = String(src.value || '');"),

 ('TC-667', '38 la morfologia de TAVI sale de la exclusion y el espejo se autoriza a si mismo',
  "  const espejos = TAVI_AO_PARES.map(function (pr) { return pr.tavi }).concat(['ete_tavi_morf']);",
  "  const espejos = TAVI_AO_PARES.map(function (pr) { return pr.tavi }).concat([]);"),

 ('TC-667', '39 DE MAS: «Trivalva normal» entra en la tabla de parejas, que es lo que P8-d prohibe',
  "  Object.freeze({ tavi: 'bicuspide',    va: 'Bicúspide' }),",
  "  Object.freeze({ tavi: 'tricuspide',   va: 'Trivalva normal' }),\n  Object.freeze({ tavi: 'bicuspide',    va: 'Bicúspide' }),"),

 ('TC-667', '40 DE MAS: vaciar TAVI escribe «Trivalva normal» en Valvulas, que AFIRMA que la valvula es normal',
  "  } else if (vs === '' && desdeTavi) {\n    /* Vaciar TAVI no vacia Valvulas: ver el comentario de arriba. */\n    return;",
  "  } else if (vs === '' && desdeTavi) {\n    destino = 'Trivalva normal';"),

 ('TC-667', '41 un valor sin equivalente BORRA el otro lado',
  "  } else {\n    /* Valor sin equivalente: no escribe nada y no borra nada. */\n    return;\n  }",
  "  } else {\n    destino = desdeTavi ? 'Trivalva normal' : '';\n  }"),
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
