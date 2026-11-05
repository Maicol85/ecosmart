# -*- coding: utf-8 -*-
"""Barrido de mutaciones dirigidas de la tanda PANT-13.

Corre SIEMPRE en un worktree de git y NUNCA sobre el arbol vivo, con guarda de md5 del
index.html vivo antes y despues. Cada mutacion declara SU caso: correr todos por cada una
tapa un reparto mal hecho.

Uso:  python3 scripts/_mut_pant13.py --check          (solo verifica los anclajes)
      python3 scripts/_mut_pant13.py --wt <dir>       (corre el barrido)
      python3 scripts/_mut_pant13.py --wt <dir> --solo M07,M12
"""
import hashlib, io, os, re, subprocess, sys, time

VIVO = 'index.html'

# (nombre, caso, [(buscar, reemplazar), ...], que defecto inyecta)
MUT = [
 ('M01','TC-686',[("if(w!==rw){rw=w;rd.setSize(w,Hh);cam.aspect=w/Hh;cam.updateProjectionMatrix();}","")],
  'el lienzo deja de seguir al ancho de su recuadro en cada cuadro'),
 ('M02','TC-686',[("const w2 = host.clientWidth || 640; rw = w2; rd.setSize(w2, Hh);",
                   "const w2 = host.clientWidth || 640; rd.setSize(w2, Hh);")],
  'el oyente de resize no pone al dia el ancho recordado'),
 ('M03','TC-686',[("['norm','Corazón normal']","['norm','Corazon normal']")],
  'un texto visible del modulo pierde su tilde'),
 ('M04','TC-686',[("input.cm3d-fcin { width:78px; flex:0 0 78px; min-height:44px; }",
                   "input.cm3d-fcin { min-height:44px; }")],
  'el campo de frecuencia vuelve a llevarse una fila entera'),
 ('M05','TC-687',[("#cm3d-shell:not(.cm3d-solo) { grid-template-columns:230px minmax(200px,1fr) 230px; }",
                   "#cm3d-shell:not(.cm3d-solo) { grid-template-columns:minmax(0,1fr); }")],
  'las tres zonas dejan de repartirse en tres columnas'),
 ('M06','TC-687',[("        sh = document.getElementById('cm3d-shell');",
                   "        sh = document.getElementById('cm3d-shell');\n  if (cbw) document.body.appendChild(cbw);")],
  'la fila de combinaciones se saca de la zona central'),
 ('M07','TC-687',[(".cm3d-chip::after { content:''; position:absolute; left:0; right:0; top:-7px; bottom:-7px; }","")],
  'los botones finos pierden su area tactil de 44 px'),
 ('M08','TC-687',[("CM_PRESSG[p.n] || p.n","p.n")],
  'las combinaciones pierden su sigla y publican el nombre largo en el boton'),
 ('M09','TC-687',[("K = _cm3d.S.ck, eis = !!M.eis;","K = _cm3d.S.ck, eis = false;")],
  'el esquema de circulacion deja de invertirse con Eisenmenger'),
 # M10 reescrita: puesta en el MARCADO era una mutacion EQUIVALENTE, porque el pintor repone
 # `hidden` en cada pasada. Se muta el PINTOR, que es quien decide.
 ('M10','TC-687',[("  if (pr) pr.hidden = (m === 'estudio');","  if (pr) pr.hidden = true;")],
  'la lista «Se suma» deja de verse en Explorar'),
 ('M11','TC-687',[(".cm3d-tb { display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin:0 0 8px; }",
                   ".cm3d-tb { display:block; margin:0 0 8px; }")],
  'la barra de herramientas deja de ser una sola fila'),
 ('M12','TC-688',[("  if (_cm3d.modo !== 'estudio') { apagar(CM_PDF_AVISO.explorar); return }\n","")],
  'el boton del PDF funciona tambien en Explorar'),
 ('M13','TC-688',[("  if (!cmHayCargado()) { apagar(CM_PDF_AVISO.vacio); return }\n","")],
  'el boton queda habilitado sin nada cargado'),
 ('M14','TC-688',[("  if (typeof tgaEjes === 'function') { try { if (tgaEjes().anat) { apagar(CM_PDF_AVISO.tga); return } } catch (e) {} }\n","")],
  'el boton se habilita tambien con una transposicion cargada'),
 ('M15','TC-688',[("{ k: 'cm3d',  w: 1, fam: 'cc',  lbl: 'Corazón en 3D de congénitas' },",""),
                  ("{ k:'cm3d',  w:1, fam:'cc',  lbl:'Corazón en 3D de congénitas' },","")],
  'el diagrama sale del registro del PDF'),
 ('M16','TC-688',[("|tga-3d-|cm3d-|mfs-fig-","|tga-3d-|mfs-fig-")],
  'el boton del modulo pasa a ser un campo guardado del estudio'),
 ('M17','TC-689',[("['tga','Transposición de grandes arterias']",""),(",]","]")],
  'la transposicion deja de ser una anatomia de base'),
 ('M18','TC-689',[("tga:[['d','d-TGA sin cirugía'],['jat','Jatene (switch arterial)'],['mus','Mustard o Senning (switch auricular)'],['ras','Rastelli'],['cc','ccTGA (corregida)']]",
                   "tga:[['d','d-TGA sin cirugía'],['jat','Jatene (switch arterial)'],['mus','Mustard o Senning (switch auricular)'],['ras','Rastelli']]")],
  'la transposicion se queda con cuatro variantes en vez de cinco'),
 ('M19','TC-689',[("if(b==='tga'){let vt=S.bv.tga,blk=","if(b==='tga'){let vt=S.bv.tga,blk=0&&")],
  'las reglas de compatibilidad de la transposicion no apagan nada'),
 ('M20','TC-689',[("mus:['cia','civ','dap','vap','cvpa','coa','ep','ea','eis']",
                   "mus:['civ','dap','vap','cvpa','coa','ep','ea','eis']")],
  'la CIA deja de bloquearse con el switch auricular'),
 ('M21','TC-689',[("'eisen', 'tga']);","'eisen']);")],
  'la transposicion sale de la lista de las anatomias dibujadas'),
 ('M22','TC-689',[('id="tga-3d-cv"','id="tga-3d-cvZ"')],
  'APLICA DE MAS: se retira el recuadro del 3D de la transposicion de su seccion'),
 ('M23','TC-689',[("      S.base = 'tga';","      S.base = 'norm';")],
  '«Segun el estudio» deja de leer la transposicion de su pestania'),
 ('M24','TC-690',[('<div id="masa-ref-cuerpo" style="display:none;">','<div id="masa-ref-cuerpo">')],
  'la tabla de diferenciales vuelve a nacer abierta'),
 ('M25','TC-690',[('aria-expanded="false" aria-controls="masa-ref-cuerpo"','aria-expanded="true" aria-controls="masa-ref-cuerpo"')],
  'el aria del boton de la tabla miente sobre su estado'),
 ('M26','TC-690',[('<span class="igacc-chev" style="font-size:.8rem;color:var(--accent2);">&#9654;</span>\n            <span>C&oacute;mo distinguirlas (referencia)</span>',
                   '<span class="igacc-chev" style="font-size:.8rem;color:var(--accent2);">&#9660;</span>\n            <span>C&oacute;mo distinguirlas (referencia)</span>')],
  'la flecha de la tabla nace al reves'),
 ('M27','TC-690',[("La ASE 2024 de pr&oacute;tesis describe","<b>Dos fuentes que no coinciden, y se muestran sin resolver.</b> La ASE 2024 de pr&oacute;tesis describe")],
  'APLICA DE MAS: vuelve una frase que juzga una guia contra otra'),
 ('M28','TC-690',[("min-height:44px;cursor:pointer;color:var(--text);font-weight:700;font-size:12px;",
                   "min-height:20px;cursor:pointer;color:var(--text);font-weight:700;font-size:12px;")],
  'el boton de la tabla baja de los 44 px tactiles'),
 ('M29','TC-691',[("        _pulDEl('circle', { cx: (x1 + (x2 - x1) * t).toFixed(1),",
                   "        _pulDEl('path', { cx: (x1 + (x2 - x1) * t).toFixed(1),")],
  'el broncograma vuelve a dibujarse con nodos de linea y no con puntos'),
 ('M30','TC-691',[("      var bb = _pulDEl('g', { 'clip-path': 'url(#' + cid + ')', fill: 'var(--bg2)',",
                   "      var bb = _pulDEl('g', { fill: 'var(--bg2)',")],
  'los puntos del broncograma dejan de recortarse por la mancha'),
 ('M31','TC-691',[("        var r = (k2 === 0) ? 2.1 : 1.5;","        var r = 1.5;")],
  'todos los puntos salen del mismo tamanio, sin orden de bronquio'),
 ('M32','TC-691',[("  { const _pb = document.getElementById('pul_dib_pdf'); if (_pb) _pb.value = ''; }","")],
  'el campo del PDF del pulmon sobrevive a «Nuevo estudio»'),
 ('M33','TC-691',[("  if (on) { try { pulDibPdfRaster(true) } catch (e2) {} } else { _pulDibPdf = { data:null } }",
                   "  if (false) { try { pulDibPdfRaster(true) } catch (e2) {} } else { _pulDibPdf = { data:null } }")],
  'encender el boton no rasteriza: el PDF no tendria nada que estampar'),
 ('M34','TC-692',[("  OTR_VAR_IDS.forEach(function (id) {","  OTR_HALL.forEach(function (_h) {\n    const id = _h.id;")],
  'la funcion recorre el registro entero y esconde las notas de ASIA y de la circunfleja'),
 ('M35','TC-692',[("    const hay = !!c.checked || String(n.value || '').trim() !== '';","    const hay = !!c.checked;")],
  'el detalle se esconde aunque tenga texto cargado: un estudio viejo pierde el dato de vista'),
 ('M36','TC-692',[("    n.style.display = hay ? '' : 'none';","    n.style.display = hay ? '' : 'none';\n    n.value = '';")],
  'APLICA DE MAS: la funcion BORRA el valor del detalle en cada pasada'),
 ('M37','TC-692',[(".otr-var-grid { grid-template-columns:repeat(2, minmax(200px,1fr)); }",
                   ".otr-var-grid { grid-template-columns:repeat(1, minmax(200px,1fr)); }")],
  'la grilla pierde su reparto en dos columnas'),
 ('M38','TC-692',[('                <span>Vena cava superior izquierda persistente</span>\n              </label>\n            </div>',
                   '                <span>Vena cava superior izquierda persistente</span>\n              </label>\n              <input type="text" id="otr_var_vcsip_nota" class="otr-var-nota" maxlength="120" placeholder="Detalle (opcional)" style="display:none;">\n            </div>')],
  'APLICA DE MAS: la cava izquierda gana una caja de detalle, o sea un campo guardado mas'),
]

def md5(p):
    return hashlib.md5(io.open(p, 'rb').read()).hexdigest()

def main():
    solo = None
    wt = None
    chk = '--check' in sys.argv
    for i, a in enumerate(sys.argv):
        if a == '--wt': wt = sys.argv[i + 1]
        if a == '--solo': solo = set(sys.argv[i + 1].split(','))
    orig = io.open(VIVO, encoding='utf-8').read()
    # 1) los anclajes: cada uno tiene que aparecer EXACTAMENTE una vez
    malos = []
    for (n, caso, pares, _d) in MUT:
        t = orig
        hechos = 0
        for (b, r) in pares:
            c = t.count(b)
            if c == 1:
                t = t.replace(b, r, 1); hechos += 1
            elif hechos == 0 and len(pares) > 1:
                continue
        if hechos == 0:
            malos.append(n + ' (ningun anclaje aparece exactamente una vez)')
        elif t == orig:
            malos.append(n + ' (no cambia nada)')
    if malos:
        print('ANCLAJES MALOS:'); [print('  ' + m) for m in malos]
        if chk: sys.exit(1)
    else:
        print('Los ' + str(len(MUT)) + ' anclajes aplican y cambian el archivo.')
    if chk: return

    md5a = md5(VIVO)
    print('md5 del arbol VIVO antes: ' + md5a)
    wtidx = os.path.join(wt, 'index.html')
    base = io.open(wtidx, encoding='utf-8').read()
    t0 = time.time()
    res = []
    for (n, caso, pares, desc) in MUT:
        if solo and n not in solo: continue
        if time.time() - t0 > 1800:
            print('TOPE DE 30 MIN: corte en ' + n); break
        t = base
        for (b, r) in pares:
            if t.count(b) == 1: t = t.replace(b, r, 1)
        if t == base:
            res.append((n, caso, 'NO APLICA', desc)); print('  ' + n + '  NO APLICA'); continue
        io.open(wtidx, 'w', encoding='utf-8').write(t)
        p = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=wt, capture_output=True, text=True)
        out = p.stdout + p.stderr
        if 'RESULTADO' not in out:
            v = 'NO CORRIO'
        elif re.search(r'\b' + caso + r'\b.*✗', out) or 'CON FALLAS' in out:
            v = 'MUERTA'
        else:
            v = 'SOBREVIVIO'
        res.append((n, caso, v, desc))
        print('  ' + n + '  ' + caso + '  ' + v + '   ' + desc[:62])
        io.open(wtidx, 'w', encoding='utf-8').write(base)
    md5b = md5(VIVO)
    print('md5 del arbol VIVO despues: ' + md5b + ('  IDENTICO' if md5a == md5b else '  CAMBIO'))
    m = len([r for r in res if r[2] == 'MUERTA'])
    print('RESUMEN: ' + str(m) + '/' + str(len(res)) + ' muertas  ·  ' +
          str(round((time.time() - t0) / 60.0, 1)) + ' min')
    for r in res:
        if r[2] != 'MUERTA': print('  ' + r[0] + ' ' + r[2] + ' -> ' + r[3])

main()
