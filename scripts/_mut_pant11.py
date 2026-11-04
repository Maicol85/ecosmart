#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant11.py - barrido de MUTACIONES DIRIGIDAS de la tanda PANT-11 (2026-11-04).
Calcado de _mut_pant10.py. Nombre propio: verificado con ls, no existia.

Cada mutacion revierte UNA de las cosas que los once commits de codigo cambiaron -o la aplica DE
MAS- y exige que SU caso se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pant11.py              # todas
  python3 scripts/_mut_pant11.py --solo 1,2   # algunas

** SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
** EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
** CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: con los seis por
   mutacion, un reparto mal hecho queda tapado por el caso de otro commit.
** VARIAS NO REVIERTEN NADA: LA APLICAN DE MAS, porque las condiciones que las matan son
   CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.
"""
import hashlib, os, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (caso, nombre, viejo, nuevo) - viejo tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── COMMIT 1: el papel de Ebstein y de Eisenmenger ──
 ('TC-674', '01 el papel de Ebstein vuelve a ser el texto de la pantalla',
  "return { clave: clave, rotulo: rotulo, txt: partes.join('. '), papel: partesPapel.join('. '), resumen: rotulo +",
  "return { clave: clave, rotulo: rotulo, txt: partes.join('. '), papel: partes.join('. '), resumen: rotulo +"),

 ('TC-674', '02 el papel de Ebstein deja de cambiar la linea del indice por la descriptiva',
  "const partesPapel = partes.map(function (x, i) { return i === celPos ? celPapel : x; })",
  "const partesPapel = partes.map(function (x, i) { return x; })"),

 ('TC-674', '03 el papel de Ebstein deja de filtrar la linea de la evaluacion electrofisiologica',
  "                            .filter(function (x, i) { return i !== efPos; });",
  "                            .filter(function (x, i) { return true; });"),

 ('TC-674', '04 la linea descriptiva del papel vuelve a nombrar el indice de Celermajer',
  "    celPapel = 'Relación de áreas en cuatro cámaras ' + cel.idx.toFixed(2) + ' — grado ' + _celGr;",
  "    celPapel = 'Índice de Celermajer ' + cel.idx.toFixed(2) + ' — grado ' + _celGr;"),

 ('TC-674', '05 APLICADA DE MAS: el papel se lleva tambien el NUMERO medido',
  "    celPapel = 'Relación de áreas en cuatro cámaras ' + cel.idx.toFixed(2) + ' — grado ' + _celGr;",
  "    celPapel = 'Relación de áreas en cuatro cámaras no informada';"),

 ('TC-674', '06 el registro del PPT pierde el papel:true de Ebstein',
  "{ chk:'ebs_incluir_chk',       sec:'ebs', nom:'Anomalía de Ebstein',                  fn:'ebsConclusion', papel:true },",
  "{ chk:'ebs_incluir_chk',       sec:'ebs', nom:'Anomalía de Ebstein',                  fn:'ebsConclusion' },"),

 ('TC-674', '07 la mortalidad materna de Eisenmenger vuelve a «>50 %»',
  "Embarazo contraindicado — mortalidad materna 30 a 50 %. Evitar",
  "Embarazo contraindicado — mortalidad materna >50 %. Evitar"),

 ('TC-674', '08 la alerta del embarazo vuelve a nombrar la guia',
  "suma:'Eisenmenger con saturación ' + sat + ' % — embarazo contraindicado, mortalidad materna 30 a 50 %.' });",
  "suma:'Eisenmenger con saturación ' + sat + ' % — embarazo contraindicado, mortalidad materna 30 a 50 % (ESC 2020).' });"),

 ('TC-674', '09 APLICADA DE MAS: vuelve la alerta de sincope sin fuente',
  "  if (peri === 'moderado' || peri === 'severo') alertas.push({ k:'pericardio',",
  "  if (sinc === 'si') alertas.push({ k:'sincope',\n    txt:'Síncope — marcador de mal pronóstico en el síndrome de Eisenmenger.', suma:null });\n  if (peri === 'moderado' || peri === 'severo') alertas.push({ k:'pericardio',"),

 # ── COMMIT 2: el TDE y el TRIV ──
 ('TC-675', '10 se revierte el intercambio de las clases de la grilla',
  '<div class="fg dm-c2 dm-r2">\n          <label>TRIV (ms)</label>',
  '<div class="fg dm-c2 dm-r3">\n          <label>TRIV (ms)</label>'),

 ('TC-675', '11 APLICADA DE MAS: la grilla declara un tabindex y el Tab deja de seguir al marcado',
  '<input type="number" id="triv" placeholder="ms" oninput="calcDiastol()">',
  '<input type="number" id="triv" tabindex="3" placeholder="ms" oninput="calcDiastol()">'),

 ('TC-675', '12 el TRIV pierde su cableado a calcDiastol',
  '<input type="number" id="triv" placeholder="ms" oninput="calcDiastol()">',
  '<input type="number" id="triv" placeholder="ms">'),

 # ── COMMIT 3: la casilla de la VCI ──
 ('TC-676', '13 la casilla deja de vaciar los dos campos de la cava',
  "      if (String(e.value || '') !== '') { e.dataset.vciprev = e.value; e.value = ''; }",
  "      if (String(e.value || '') !== '') { e.dataset.vciprev = e.value; }"),

 ('TC-676', '14 la casilla vacia los campos SIN guardar su valor: el dato se pierde',
  "      if (String(e.value || '') !== '') { e.dataset.vciprev = e.value; e.value = ''; }",
  "      if (String(e.value || '') !== '') { e.value = ''; }"),

 ('TC-676', '15 los dos campos ya no se deshabilitan mientras no se visualiza',
  "      e.disabled = true;\n    } else {\n      e.disabled = false;",
  "      e.disabled = false;\n    } else {\n      e.disabled = false;"),

 ('TC-676', '16 la PmAD estimada deja de recalcularse y publica la presion del valor que desaparecio',
  "  if (on) { try { if (typeof calcPmAD === 'function') calcPmAD(); } catch (e) {} }",
  "  if (false) { try { if (typeof calcPmAD === 'function') calcPmAD(); } catch (e) {} }"),

 ('TC-676', '17 la frase deja de llegar al informe',
  "if (typeof vciNoVisOn === 'function' && vciNoVisOn()) { inf.push('No se visualiza la VCI.'); }",
  "if (false) { inf.push('No se visualiza la VCI.'); }"),

 ('TC-676', '18 APLICADA DE MAS: la frase llega al informe SIEMPRE, con o sin casilla',
  "if (typeof vciNoVisOn === 'function' && vciNoVisOn()) { inf.push('No se visualiza la VCI.'); }",
  "if (true) { inf.push('No se visualiza la VCI.'); }"),

 ('TC-676', '19 data-vciprev sale de las DOS listas de «Nuevo estudio» a la vez',
  "[data-tvderiv],[data-tvprev],[data-vciprev]').forEach(el => {",
  "[data-tvderiv],[data-tvprev]').forEach(el => {"),

 ('TC-676', '20 el campo oculto deja de limpiarse en «Nuevo estudio»',
  "{ const _vnv = document.getElementById('vci_no_vis'); if (_vnv) _vnv.value = '';",
  "{ const _vnv = null; if (_vnv) _vnv.value = '';"),

 ('TC-676', '21 vciNoVisSync deja de ir PRIMERO en la lista de reconciliadores',
  "return ['vciNoVisSync','aoRaizReconciliar','taviAoReconciliar','profCoaptReconciliar',",
  "return ['aoRaizReconciliar','taviAoReconciliar','profCoaptReconciliar','vciNoVisSync',"),

 ('TC-676', '22 el area tactil del circulito se queda en la del glifo',
  ".vci-nv-mk::after",
  ".vci-nv-mk-apagado::after"),

 # ── COMMIT 4: la profundidad de coaptacion ──
 ('TC-677', '23 el par de la profundidad de coaptacion sale del registro de velos',
  "                   ['ete_prof_coapt', 'teer_prof_flail']];",
  "                   ['ete_lva', 'teer_lva']];"),

 ('TC-677', '24 la reconciliacion de la coaptacion sale de la lista de restauracion',
  "'vciNoVisSync','aoRaizReconciliar','taviAoReconciliar','profCoaptReconciliar',",
  "'vciNoVisSync','aoRaizReconciliar','taviAoReconciliar',"),

 ('TC-677', '25 APLICADA DE MAS: con los dos cargados y DISTINTOS la aplicacion elige uno',
  "  if (va === vb) return;\n  if (va !== '' && vb === '')",
  "  if (va === vb) return;\n  if (va !== '' && vb !== '') { b.value = va; return; }\n  if (va !== '' && vb === '')"),

 ('TC-677', '26 la reconciliacion deja de completar el lado del TEER',
  "  if (va !== '' && vb === '') { b.value = va; try { if (typeof calcTEER === 'function') calcTEER(); } catch (e) {} }",
  "  if (false) { b.value = va; try { if (typeof calcTEER === 'function') calcTEER(); } catch (e) {} }"),

 # ── COMMITS 5, 6 y 7: el eco pulmonar ──
 ('TC-678', '27 el tamano legado toma el MENOR de las dos pleuras en vez del mayor',
  "    if (!may || PUA_SEV_ORD.indexOf(x) > PUA_SEV_ORD.indexOf(may)) may = x;",
  "    if (!may || PUA_SEV_ORD.indexOf(x) < PUA_SEV_ORD.indexOf(may)) may = x;"),

 ('TC-678', '28 se pierde la traduccion de «leve» a la palabra del legado',
  "var PUA_SEV_A_LEGADO = { leve: 'mínimo', moderado: 'moderado', severo: 'severo' };",
  "var PUA_SEV_A_LEGADO = { leve: 'leve', moderado: 'moderado', severo: 'severo' };"),

 ('TC-678', '29 la derivacion pierde su guarda y le borra el tamano a un estudio viejo',
  "  if (!d && !i) return;                     // nada que derivar: el legado no se toca",
  "  if (false) return;                        // nada que derivar: el legado no se toca"),

 ('TC-678', '30 «en uso» deja de excluir los cinco espejados: el espejo se autoriza a si mismo',
  "    if (PUA_POP_ESPEJADOS.indexOf(e.id) >= 0) continue;",
  "    if (false) continue;"),

 ('TC-678', '31 el espejo basico -> posoperatorio pierde su guarda y escribe siempre',
  "function puaPopEspejoGesto(id) {\n  if (!popModuloEnUso()) return;",
  "function puaPopEspejoGesto(id) {\n  if (false) return;"),

 ('TC-678', '32 APLICADA DE MAS: el hemotorax se sincroniza aunque no tenga equivalente',
  "var POP_TIPO_A_PUA = { libre: 'libre', loculado: 'tabicado' };",
  "var POP_TIPO_A_PUA = { libre: 'libre', loculado: 'tabicado', hemotorax: 'tabicado' };"),

 ('TC-678', '33 APLICADA DE MAS: las lineas B «difusas» del posoperatorio se sincronizan',
  "  const lb = _puaV('pop_pulmon_lineasb');\n  if (lb === 'ausentes') _puaEsc('pua_lineasb', 'ausentes');",
  "  const lb = _puaV('pop_pulmon_lineasb');\n  if (lb === 'difusas') _puaEsc('pua_lineasb', 'presentes');\n  if (lb === 'ausentes') _puaEsc('pua_lineasb', 'ausentes');"),

 ('TC-678', '34 APLICADA DE MAS: el dibujo dibuja la consolidacion SIN lado consignado',
  "    cons: { D: cons && (cl === 'der' || cl === 'bilateral'), I: cons && (cl === 'izq' || cl === 'bilateral') },",
  "    cons: { D: cons, I: cons },"),

 ('TC-678', '35 APLICADA DE MAS: el dibujo escribe un campo del estudio',
  "function pulDibSync() {\n  var svg = document.getElementById('pul-dib-svg');\n  if (!svg) return;",
  "function pulDibSync() {\n  var svg = document.getElementById('pul-dib-svg');\n  if (!svg) return;\n  try { document.getElementById('pua_lineasb').value = 'presentes'; } catch (e) {}"),

 ('TC-678', '36 el campo legado del tamano vuelve a ser editable a mano',
  '<select id="pul_derrame_tam" disabled>',
  '<select id="pul_derrame_tam">'),

 # ── COMMITS 8 a 11: las masas, la tabla, los globos y las dos fichas ──
 ('TC-679', '37 la seccion de masas vuelve a quedar ANIDADA dentro de variantes anatomicas',
  "  </div>\n  </div>\n\n  <!-- ══ MASAS — PANT-11, commit 8",
  "  </div>\n\n  <!-- ══ MASAS — PANT-11, commit 8"),

 ('TC-679', '38 el titulo de la seccion vieja vuelve a nombrar las masas',
  "      ⚪ Pericardio",
  "      ⚪ Pericardio y masas"),

 ('TC-679', '39 la tabla de diferenciales pierde una fila',
  "            <tr>\n              <td><b>Vegetaci&oacute;n</b>",
  "            <tr style=\"display:none;\">\n              <td><b>Vegetaci&oacute;n</b>"),

 ('TC-679', '40 la tabla pierde su scroll propio y se lo pasa a la pagina',
  ".masa-ref-wrap{overflow-x:auto;",
  ".masa-ref-wrap{overflow-x:visible;"),

 ('TC-679', '41 el globo de endocarditis se muda fuera de la fila de la vegetacion',
  "            <tr>\n              <td><b>Vegetaci&oacute;n</b>\n                <button type=\"button\" class=\"vinfo-btn vinfo-btn-44\" data-vinfo=\"masa-ref-ei\"",
  "            <tr>\n              <td><b>Vegetaci&oacute;n</b>\n                <button type=\"button\" class=\"vinfo-btn vinfo-btn-44\" data-vinfo=\"masa-ref-ei-movido\""),

 ('TC-679', '42 el globo de la tabla pierde su clase de area tactil de 44 px',
  'class="vinfo-btn vinfo-btn-44" data-vinfo="masa-ref" aria-expanded="false"',
  'class="vinfo-btn" data-vinfo="masa-ref" aria-expanded="false"'),

 ('TC-679', '43 la ficha de tumores sale del reparto de subpestanas de Referencias',
  "'pulmon', 'pop', 'tumores', 'embolig', 'cardiotox'",
  "'pulmon', 'pop', 'embolig', 'cardiotox'"),

 ('TC-679', '44 la ficha de fuentes emboligenas deja de decir que la guia no trae un algoritmo propio',
  "<b>Esa gu&iacute;a no trae un algoritmo ecocardiogr&aacute;fico paso a paso propio</b>:\n        trae criterios de uso apropiado y estas tablas.",
  "<b>Esa gu&iacute;a trata el tema en sus dos tablas</b>."),
]

SOLO = None
if '--solo' in sys.argv:
    SOLO = set(int(x) for x in sys.argv[sys.argv.index('--solo') + 1].split(','))

ORIG = IDX + '.mutorig'
shutil.copy2(IDX, ORIG)
MD5_0 = md5(IDX)
print('md5 del arbol antes del barrido:', MD5_0)
muertas, vivas, noaplica = [], [], []
try:
    for i, (caso, nombre, viejo, nuevo) in enumerate(MUT, 1):
        if SOLO and i not in SOLO:
            continue
        with open(ORIG, encoding='utf-8') as f:
            s = f.read()
        n = s.count(viejo)
        if n != 1:
            noaplica.append((i, nombre, 'el ancla aparece %d veces' % n))
            print('  %02d NO APLICA  %s  (ancla x%d)' % (i, nombre, n))
            continue
        with open(IDX, 'w', encoding='utf-8') as f:
            f.write(s.replace(viejo, nuevo, 1))
        r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=RAIZ, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        if 'RESULTADO' not in out:
            noaplica.append((i, nombre, 'NO CORRIO: el suite no publico RESULTADO'))
            print('  %02d NO CORRIO  %s' % (i, nombre))
        elif ' CON FALLAS' in out:
            muertas.append((i, nombre))
            print('  %02d MUERTA    %s  [%s]' % (i, nombre, caso))
        else:
            vivas.append((i, nombre, caso))
            print('  %02d SOBREVIVIO %s  [%s]  <-- COBERTURA QUE FALTA' % (i, nombre, caso))
finally:
    shutil.copy2(ORIG, IDX)
    os.remove(ORIG)

print()
print('md5 del arbol despues del barrido:', md5(IDX))
print('GUARDA DE md5:', 'OK - identico' if md5(IDX) == MD5_0 else 'XX EL ARBOL CAMBIO')
print('RESUMEN: %d muertas / %d sobrevivieron / %d no aplicaron' % (len(muertas), len(vivas), len(noaplica)))
for i, n, c in vivas:
    print('   SOBREVIVIO %02d %s [%s]' % (i, n, c))
for i, n, m2 in noaplica:
    print('   NO APLICO  %02d %s (%s)' % (i, n, m2))
