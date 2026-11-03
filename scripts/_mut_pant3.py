# -*- coding: utf-8 -*-
"""_mut_pant3.py - mutaciones dirigidas de la tanda PANT-3.

Nombre propio: verificado con ls contra HEAD, no existia.

CADA MUTACION DECLARA SU CASO. Correr los cinco por cada una taparia un reparto mal hecho: si
una mata a un caso que no le toca, ese caso mide de mas; si no mata al suyo, falta cobertura.

Algunas NO revierten un arreglo: lo aplican DE MAS. Existen porque la condicion que las mata es
un CONTROL NEGATIVO, y un control negativo que ninguna mutacion puede romper no prueba nada.

SE CORRE EN UN WORKTREE Y NUNCA SOBRE EL ARBOL VIVO, con guarda de md5 antes y despues.

    python3 scripts/_mut_pant3.py            # todas
    python3 scripts/_mut_pant3.py M03 M07    # algunas
"""
import io, os, shutil, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/private/tmp/pant3_mut_wt'

MUT = [
 ('M01', "b.classList.toggle('cc-les-on', on);",
         "b.classList.toggle('active', on);",
  'TC-623', 'la marca vuelve a .active, que showTab barre al cambiar de pantalla'),
 ('M02', "      if(!onCia && !onCiv) return;",
         "      if(!aparte) return;",
  'TC-623', 'la compuerta vuelve a ser la casilla de abajo y no el boton de la lesion'),
 ('M03', "        if(aparte) ccHoja('cia', p, null, null);",
         "        ccHoja('cia', p, null, null);",
  'TC-623', 'la hoja aparte deja de depender de la casilla de abajo'),
 ('M04', "        if (onCia) sumaCC(ccSumaLinea('cia'));\n        if (onCiv) sumaCC(ccSumaLinea('civ'));",
         "        sumaCC(ccSumaLinea('cia'));\n        sumaCC(ccSumaLinea('civ'));",
  'TC-623', 'el EN SUMA vuelve a nombrar la lesion sin marcar'),
 ('M05', "        ? (eteShuntLesionOn('cia') || eteShuntLesionOn('civ'))",
         "        ? on",
  'TC-623', 'la pastilla del encabezado vuelve a colgar de la casilla de abajo'),
 ('M06', "var _CAMPOS_FUERA_DEL_ESTUDIO = /^(cfg-|",
         "var _CAMPOS_FUERA_DEL_ESTUDIO = /^(ete_cia_activa|cfg-|",
  'TC-623', 'DE MAS: la marca de la CIA deja de ser un campo del estudio'),
 ('M07', "      if(onCia && (cTipo||cMax!=null||cMin!=null||bm||cDir)){",
         "      if((cTipo||cMax!=null||cMin!=null||bm||cDir)){",
  'TC-623', 'DE MAS: la CIA se emite con el boton apagado'),

 ('M08', "    rotCom.push(['CIA', 126, 158, NAR]);",
         "    s += '<text x=\"126\" y=\"158\" font-size=\"' + TGA_ESQ_FS.com + '\" fill=\"' + NAR + '\">CIA</text>';",
  'TC-624', 'el rotulo de la CIA vuelve a emitirse ANTES de las flechas y sin halo'),
 ('M09', "         '\" class=\"tga-esq-rot\" paint-order=\"stroke\" stroke=\"var(--bg3)\" stroke-width=\"3.5\" ' +\n         'stroke-linejoin=\"round\" fill=\"var(--text2)\">' + _tgaEsqTxt(l[0]) + '</text>';",
         "         '\" class=\"tga-esq-rot\" fill=\"var(--text2)\">' + _tgaEsqTxt(l[0]) + '</text>';",
  'TC-624', 'los cinco rotulos libres pierden el halo'),
 ('M10', "    rotCom.push(['DAP', _apDer ? D.ap[0] - 46 : 116, _apDer ? D.ap[1] - 20 : 53, NAR]);",
         "    rotCom.push(['DAP', (D.ap[0] + D.ao[0]) / 2 + 4, (D.ap[1] + D.ao[1]) / 2 - 4, NAR]);",
  'TC-624', 'el rotulo del ductus vuelve al punto medio, donde se pisaba con CIA y CIV'),
 ('M11', "       + 'los dos casos el texto de abajo lo dice.'\n",
         "       + 'los dos casos el texto de abajo lo dice.',\n    ojo: 'LOS RECORRIDOS DE LAS CIRUGIAS ESTAN PENDIENTES DE REVISION por un cardiologo.'\n",
  'TC-624', 'DE MAS: vuelve el bloque A tener en cuenta con la frase de revision pendiente'),

 ('M12', "  if (base.pend) partes.push('Para esta cirugía se muestra el esquema de la anatomía.');",
         "  if (base.pend) partes.push('Esquema pendiente de revisión para esta cirugía: se muestra el de la anatomía.');",
  'TC-625', 'vuelve la frase de revision pendiente del esquema'),
 ('M13', "No reemplaza el juicio m",
         "No sustituye el criterio m",
  'TC-625', 'DE MAS: se toca el aviso general que la regla manda conservar'),

 ('M14', "  w.classList.toggle('cc3d-ver', en);",
         "  w.classList.toggle('cc3d-ver', true);",
  'TC-626', 'DE MAS: el pie se ve en todas las pestanias y no solo en congenitas'),
 ('M15', "      try { _cc3d.padre.insertBefore(box, _cc3d.antes) } catch (e) { _cc3d.padre.appendChild(box) }",
         "      try { } catch (e) { }",
  'TC-626', 'el recuadro prestado NO se devuelve a su seccion'),
 ('M16', "const CC3D_DIBUJA = Object.freeze(['cia', 'civ', 'dap', 'fop', 'tga']);",
         "const CC3D_DIBUJA = Object.freeze([]);",
  'TC-626', 'el diagrama declara que no dibuja ninguna comunicacion'),
 ('M17', "  if (typeof cc3dCerrar === 'function') { try { cc3dCerrar() } catch (e) {} }\n  document.querySelectorAll('.tab-section')",
         "  if (false) { try { cc3dCerrar() } catch (e) {} }\n  document.querySelectorAll('.tab-section')",
  'TC-626', 'el panel no se cierra al cambiar de pestania y se queda con el recuadro'),

 ('M18', "    #mch-cols  { grid-template-columns:repeat(3, minmax(0,1fr)); }",
         "    #mch-cols  { grid-template-columns:minmax(0,1fr); }",
  'TC-627', 'la pantalla de MCH vuelve a una sola columna'),
 ('M19', '      <div class="mch-h">Hipertrofia ',
         '      <div class="mch-h">Hipertrofia — Umbral diagnóstico ≥15 mm ',
  'TC-627', 'vuelve a la pantalla un texto que tenia que estar en el globo'),
 ('M20', "AHA/ACC 2024</th>' +",
         "AHA/ACC 2020</th>' +",
  'TC-627', 'la tabla de criterios vuelve a rotularse 2020'),
 ('M21', "  'mch-msub': {",
         "  'mch-msub-x': {",
  'TC-627', 'se pierde el globo del realce tardio'),
]

def md5(f):
    return hashlib.md5(io.open(f, 'rb').read()).hexdigest()

def prep():
    if os.path.isdir(WT):
        subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ,
                       capture_output=True, text=True)
        shutil.rmtree(WT, ignore_errors=True)
    r = subprocess.run(['git', 'worktree', 'add', '--detach', WT, 'HEAD'], cwd=RAIZ,
                       capture_output=True, text=True)
    if r.returncode:
        print(r.stderr); sys.exit(1)

def main():
    pedidas = [a for a in sys.argv[1:] if a.startswith('M')]
    guarda = md5(os.path.join(RAIZ, 'index.html'))
    print('md5 del arbol VIVO antes: ' + guarda)
    prep()
    orig = io.open(os.path.join(WT, 'index.html'), encoding='utf-8').read()
    vivas, muertas, noaplica = [], [], []
    t0 = time.time()
    for (mid, vieja, nueva, caso, nota) in MUT:
        if pedidas and mid not in pedidas:
            continue
        n = orig.count(vieja)
        if n != 1:
            noaplica.append((mid, caso, 'el ancla aparece %d veces' % n))
            print('%s  NO APLICA (%d anclas)  %s' % (mid, n, nota))
            continue
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(
            orig.replace(vieja, nueva, 1))
        r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                           cwd=WT, capture_output=True, text=True, timeout=900)
        sal = r.stdout + r.stderr
        if 'RESULTADO' not in sal:
            noaplica.append((mid, caso, 'la suite NO CORRIO'))
            print('%s  NO CORRIO  %s' % (mid, nota))
        elif ' ✗' in sal or 'CON FALLAS' in sal:
            muertas.append((mid, caso))
            print('%s  MUERTA   (%s)  %s' % (mid, caso, nota))
        else:
            vivas.append((mid, caso, nota))
            print('%s  SOBREVIVIO (%s)  %s' % (mid, caso, nota))
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig)
    print('')
    print('MUERTAS %d · SOBREVIVIERON %d · NO APLICARON %d · %.1f min'
          % (len(muertas), len(vivas), len(noaplica), (time.time() - t0) / 60.0))
    for (mid, caso, nota) in vivas:
        print('  ⚠️ SOBREVIVIO %s (%s): %s' % (mid, caso, nota))
    for (mid, caso, nota) in noaplica:
        print('  ⚠️ %s (%s): %s' % (mid, caso, nota))
    despues = md5(os.path.join(RAIZ, 'index.html'))
    print('md5 del arbol VIVO despues: ' + despues +
          ('  IDENTICO' if despues == guarda else '  ⚠️ CAMBIO'))

main()
