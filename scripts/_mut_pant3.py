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
 ('M06', "  return /^(login-|ig-|lab-|cfg-|",
         "  return /^(ete_cia_activa|login-|ig-|lab-|cfg-|",
  'TC-623', 'DE MAS: la marca de la CIA deja de ser un campo del estudio. ⚠️ La primera version mutaba _CAMPOS_FUERA_DEL_ESTUDIO, que es la OTRA lista paralela, y no inyectaba el defecto que la condicion mide: sobrevivia'),
 ('M07', "      const onCia = (typeof eteShuntLesionOn==='function') && eteShuntLesionOn('cia');\n      const onCiv = (typeof eteShuntLesionOn==='function') && eteShuntLesionOn('civ');",
         "      const onCia = true;\n      const onCiv = true;",
  'TC-623', 'DE MAS: la CIA y la CIV se emiten con los dos botones apagados. ROMPE LAS TRES COMPUERTAS A LA VEZ -la de ENTRADA y la de cada rama- desde el unico lugar donde se puede: la DECLARACION. ⚠️ Rompiendo solo la de entrada sobrevivia, porque las de rama la tapan -leccion del D-11-, y reasignar onCia no es una opcion: son const, asi que el caso caeria por EXCEPCION y no por su invariante. La rama de la CIA sola la rompe M07b'),
 ('M07b', "      if(onCia && (cTipo||cMax!=null||cMin!=null||bm||cDir)){",
          "      if((cTipo||cMax!=null||cMin!=null||bm||cDir)){",
  'TC-623', 'la otra mitad: la rama de la CIA deja de mirar su boton'),

 ('M08', "    rotCom.push(['CIA', 126, 158, NAR]);",
         "    s += '<text x=\"126\" y=\"158\" font-size=\"' + TGA_ESQ_FS.com + '\" fill=\"' + NAR + '\">CIA</text>';",
  'TC-624', 'el rotulo de la CIA vuelve a emitirse ANTES de las flechas y sin halo'),
 ('M09', "         '\" class=\"tga-esq-rot\" paint-order=\"stroke\" stroke=\"var(--bg3)\" stroke-width=\"3.5\" ' +\n         'stroke-linejoin=\"round\" fill=\"var(--text2)\">' + _tgaEsqTxt(l[0]) + '</text>';",
         "         '\" class=\"tga-esq-rot\" fill=\"var(--text2)\">' + _tgaEsqTxt(l[0]) + '</text>';",
  'TC-624', 'los cinco rotulos libres pierden el halo'),
 ('M10b', "    rotCom.push(['DAP', _apDer ? D.ap[0] - 46 : 116, _apDer ? D.ap[1] - 20 : 53, NAR]);",
          "    rotCom.push(['DAP', (D.ap[0] + D.ao[0]) / 2 + 4, (D.ap[1] + D.ao[1]) / 2 - 4, NAR]);\n    rotCom.push(['CIVX', 134, 132, NAR]);",
  'TC-624', 'el ductus vuelve al punto medio Y vuelve un rotulo a la posicion vieja de la CIV: las DOS mitades a la vez, porque revertir una sola no reintroduce el solape. ⚠️ HUBO UNA M10 -la CIA sola a su posicion vieja- Y SE RETIRO POR MEDICION: con ella aplicada la sonda da 91 cruces contra 82, pero CERO desnudos y CERO rotulos pisados, o sea que mover la CIA sola es una mutacion EQUIVALENTE para el invariante. Lo que lo sostiene es el halo y el orden de emision, que son M09 y M08'),
 ('M11', "       + 'los dos casos el texto de abajo lo dice.'\n",
         "       + 'los dos casos el texto de abajo lo dice.',\n    ojo: 'LOS RECORRIDOS DE LAS CIRUGIAS ESTAN PENDIENTES DE REVISION por un cardiologo.'\n",
  'TC-624', 'DE MAS: vuelve el bloque A tener en cuenta con la frase de revision pendiente'),

 ('M12', "  if (base.pend) partes.push('Para esta cirugía se muestra el esquema de la anatomía.');",
         "  if (base.pend) partes.push('Esquema pendiente de revisión para esta cirugía: se muestra el de la anatomía.');",
  'TC-625', 'vuelve la frase de revision pendiente del esquema'),
 ('M13', '\n            <span style="font-size:10.5px;font-weight:700;color:var(--text2);">Esquema ilustrativo</span>',
         '\n            <span style="font-size:10.5px;font-weight:700;color:var(--text2);">Dibujo del escenario</span>',
  'TC-625', 'DE MAS: se toca el aviso general que la regla manda conservar. ⚠️ La primera version mutaba ESQ_PIE, la constante del PDF, y la condicion mide el DOM: sobrevivia'),

 ('M14', "  w.classList.toggle('cc3d-ver', en);",
         "  w.classList.toggle('cc3d-ver', true); w.style.display = 'block'; if (true) return;",
  'TC-626', 'DE MAS: el pie se ve en todas las pestanias. Rompe las DOS mitades -la clase y el display en linea-, porque desde el commit 4b el display manda y revertir solo la clase es una mutacion equivalente: medido, sobrevivia'),
 ('M15', "      try { _cc3d.padre.insertBefore(box, _cc3d.antes) } catch (e) { _cc3d.padre.appendChild(box) }",
         "      try { } catch (e) { }",
  'TC-626', 'el recuadro prestado NO se devuelve a su seccion'),
 ('M16', "const CC3D_DIBUJA = Object.freeze(['cia', 'civ', 'dap', 'fop', 'tga']);",
         "const CC3D_DIBUJA = Object.freeze([]);",
  'TC-626', 'el diagrama declara que no dibuja ninguna comunicacion'),
 ('M17', "function cc3dCerrar() {",
         "function cc3dCerrar() {\n  if (true) return;",
  'TC-626', 'el panel NO se cierra por ningun camino: rompe las DOS mitades de una vez -el cierre desde showTab y el de cc3dPieSync al salir de congenitas-. ⚠️ Rompiendo una sola, la otra la tapa: medido, las dos sobrevivian por separado'),

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

 # COMMITS 6 a 10 (segunda mitad de la tanda)
 ('M22', "    .mca-cat-grid { grid-template-columns:repeat(3, minmax(0,1fr)); }",
         "    .mca-cat-grid { grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); }",
  'TC-628', 'las cinco categorias vuelven a repartirse por ancho y no en tres columnas'),
 ('M23', '      <div id="mca-nocols">',
         '      <div id="mca-nocols-x">',
  'TC-628', 'la zona no ecocardiografica pierde su id, o sea deja de ser una zona propia'),
 ('M24', "       + 'mm/m\u00b2 para el mayor, 16 a menos de 19 y 18 a menos de 21 para el menor\u2014, que esta '\n       + 'aplicaci\u00f3n no aplica.'",
         "       + 'mm/m\u00b2 para el mayor, 16 a menos de 19 y 18 a menos de 21 para el menor\u2014.'",
  'TC-628', 'el globo deja de decir que la app NO aplica los cortes indexados de la tabla'),
 ('M25', '      <!-- \u26a0\ufe0f ACA HABIA UN RECUADRO QUE DECIA \u00abAca no hay campos',
         '      <p>Aca no hay campos de volumen, y es a proposito.</p>\n      <!-- \u26a0\ufe0f ACA HABIA UN RECUADRO QUE DECIA \u00abAca no hay campos',
  'TC-629', 'DE MAS: vuelve a la pantalla la frase que se contradice con los dos campos de volumen'),
 ('M26', "    fuente: 'ESC 2020 de cardiopat\u00edas cong\u00e9nitas del adulto \u2014 hoja 51, folio 613.',",
         "    fuente: 'ESC 2020 de cardiopat\u00edas cong\u00e9nitas del adulto.',",
  'TC-629', 'el globo de los volumenes pierde su hoja y su folio'),
 ('M27', "    ojo: 'EL 40 ES GRADIENTE MEDIO Y ES CRITERIO DE INTERVENCI\u00d3N.",
         "    ojo: 'EL 40 ES GRADIENTE PICO Y ES CRITERIO DE INTERVENCI\u00d3N.",
  'TC-630', 'DE MAS: el globo rotula el 40 como gradiente PICO, que es justo lo que la orden manda distinguir'),
 ('M28', "       + 'La gu\u00eda no publica un recuadro de recomendaciones propio para la estenosis '\n       + 'supravalvular: lo que se aplica ac\u00e1 es ese umbral general.'",
         "       + 'La gu\u00eda publica un recuadro de recomendaciones propio para la estenosis '\n       + 'supravalvular.'",
  'TC-630', 'DE MAS: el globo le inventa a la guia un recuadro de recomendaciones que no publica'),
 ('M29', "  const mayor = !!(hay && !paradaRec && morf === 'bcri_sup');",
         "  const mayor = !!(hay && morf === 'bcri_sup');",
  'TC-631', 'DE MAS: la parada cardiaca recuperada vuelve a sumar criterio mayor en la miocardiopatia arritmogenica'),
 ('M30', "        if (e.value !== 'si') {\n          if (!e.dataset.tvderiv) e.dataset.tvprev = e.value || '';\n          e.value = 'si'; e.dataset.tvderiv = '1';\n        }",
         "        e.value = 'si'; e.dataset.tvderiv = '1';",
  'TC-631', 'el espejo reclama la autoria SIEMPRE, asi que borra el Si que contesto el medico. Es el defecto que una medicion encontro sobre este mismo commit'),
 ('M31', "  const bits = [t.paradaRec ? 'Parada card\u00edaca recuperada' : 'Taquicardia ventricular documentada'];",
         "  const bits = ['Taquicardia ventricular documentada'];",
  'TC-631', 'el papel vuelve a colgar la parada de la frase de la taquicardia'),
 ('M32', '<span class="calc-lbl">PSAP \u226470mmHg</span>',
         '<span class="calc-lbl">PASP \u226470mmHg</span>',
  'TC-632', 'un rotulo vuelve al acronimo viejo'),
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
