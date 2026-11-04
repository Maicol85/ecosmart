# Las siete pantallas de congénitas en tres columnas, y la morfología de TAVI — tanda PANT-9

**2026-11-04.** Mapa de la tanda PANT-9: el rediseño de **siete** pantallas de cardiopatías
congénitas con los campos en tres columnas por tema y la conclusión a la derecha, los textos que
pasaron al globo ⓘ, y la opción de **valve-in-valve** del selector de morfología de TAVI con su
sincronía.

Armado sobre el cierre de la tanda. **No guarda números de línea a propósito**: la línea cambia en
cada edición, el nombre de la función y el id no.

---

## 1. El contrato de la disposición — dónde está y cómo se mide

Las siete secciones comparten **nueve clases propias**, declaradas una sola vez en la hoja de
estilos, justo antes de `#dpt-cols`. Ninguna otra pantalla de la aplicación las lleva, así que un
cambio acá **no puede mover** una pantalla que esta tanda no toca —verificado: siete `.cc9-fila` y
siete `.cc9-cuadro` en todo el documento—.

| Clase | Qué es |
|---|---|
| `.cc9-cuadro` | la tarjeta de la sección: borde de **2 px** en `var(--accent)`, radio 12, fondo `var(--bg2)` |
| `.cc9-hdrbar` | la barra de encabezado: el globo ⓘ del título a la izquierda y «Ver criterios» a la derecha |
| `.cc9-hdr-der` | lo que manda un elemento de esa barra a la derecha (`margin-left:auto`) |
| `.cc9-fila` | la fila de la disposición: columnas + conclusión |
| `.cc9-cols` | las tres columnas de campos |
| `.cc9-col` | una columna: flex vertical con `gap:8px` |
| `.cc9-h` | el título de grupo: **11 px**, 700, mayúsculas, `var(--accent2)` |
| `.cc9-concl` | la tarjeta **gris** de conclusión (`var(--section-head)`), 360 px |
| `.cc9-concl-btn` | el envoltorio que centra «Integrar al informe» |
| `.cc9-chk2` | la grilla de dos columnas de las seis casillas de complicaciones del Fontan |
| `.cc9-g2` | la grilla de dos columnas de las cinco áreas de Celermajer |

### Los dos cortes son una MEDICIÓN y no una preferencia

El ancho útil del cuerpo de una sección es **la ventana menos 210 px** por encima de 768 px
—medido en HEAD a 1440, 1000 y 900—. De ahí salen 28 px de relleno del cuerpo, 28 del cuadro con
su borde de 2 px, los 360 de la tarjeta de conclusión, el hueco de 14 y los dos huecos de 10 entre
columnas, así que **cada columna mide (ventana − 660) / 3**:

| Ventana | Columna más angosta | Disposición |
|---:|---:|---|
| 1600 px | 310,7 | tres columnas + conclusión a la derecha |
| 1440 px | 257,3 | tres columnas + conclusión a la derecha |
| 1300 px | 218,7 | tres columnas + conclusión a la derecha |
| **1260 px** | **205,3** | **el corte**: la columna llega al piso de 200 px |
| 1259 px | 329,7 | tres columnas, conclusión **debajo** a todo el ancho |
| 1000 px | 243,3 | tres columnas, conclusión debajo |
| 900 px | 210 | tres columnas, conclusión debajo |
| 899 px | todo el ancho | **apilado**: una columna, conclusión al final |
| 768 px | todo el ancho | apilado |
| 390 px | todo el ancho | apilado |

⚠️ **EL CORTE NO ES 1220, Y ESO ESTÁ MEDIDO.** A 1220 px la columna más angosta mide **192 px**,
por debajo del piso. La primera versión de la hoja de estilos lo puso en 1220 por una cuenta que
olvidaba los dos rellenos de 28 px; la medición en Chrome lo corrigió a 1260.

⚠️ **EL PISO DE LAS COLUMNAS VA DENTRO DE LA MEDIA QUERY.** Es la lección que PANT-8 pagó:
declarado fuera, regiría también por debajo del corte y dejaría tres campos por fila donde
corresponde uno. Lo vigila **TC-666 (E1)**.

⚠️ **LOS CORTES VAN EN MEDIA QUERIES EXPLÍCITAS Y NO CON `auto-fit`**: con `auto-fit` el punto de
quiebre depende del ancho que le quede a la tarjeta, y entonces el corte deja de ser medible.

### Cómo se mide la maqueta en un caso de prueba

El arnés de la suite arranca Chrome **sin `--window-size`**, o sea a unos 756 px, por **debajo**
del corte de 900: ahí las tres columnas están apiladas a propósito. Así que **TC-666 mide la REGLA
de la hoja de estilos**, no la geometría, y la geometría a los cuatro anchos la miden las sondas.

Y la regla se lee del **texto de los `<style>`**, no de `document.styleSheets[i].cssRules`, que en
este arnés devuelve vacío (lección de PANT-7). Delimitar el bloque de una media query por balance
de llaves **se desalinea** en cuanto un comentario de la hoja menciona «900 px», y esta hoja tiene
varios: lo que se hace es buscar el **selector** y preguntar si la media query más cercana **hacia
atrás** declara ese ancho, acumulando **todas** las coincidencias.

---

## 2. Las siete pantallas, una por una

### El encabezado y el globo del título

La barra de encabezado (`.cc9-hdrbar`) existe **sólo** si la sección tiene globo de título o
«Ver criterios»: una barra vacía sólo agregaría 10 px de margen. El DSAV y el ductus no la llevan.

⚠️ **EL GLOBO DEL TÍTULO NO VA DENTRO DE `.sacc-hdr`, y es una decisión.** El encabezado del
acordeón **es un `<button>`**: un botón dentro de otro es marcado inválido y el navegador lo
reparenta, lo que rompe la maqueta. El globo va como primer elemento del cuerpo, en la barra de
encabezado del cuadro, inmediatamente debajo del título del acordeón. **No se repite el título**,
porque la orden no pide agregarlo y duplicarlo sería un cambio que nadie pidió.

### Reparto de campos por columna

| Sección | Columna 1 | Columna 2 | Columna 3 | Conclusión |
|---|---|---|---|---|
| **Fontan** `#fontan-fila` | «Circuito y ventrículo sistémico»: `fontan_tipo`, `fontan_fenestracion`, `fontan_vs_morfologia`, `fontan_vs_fevi`, `fontan_vs_fac` | «Saturación y función»: `fontan_saturacion` ⓘ, `fontan_it_grado` ⓘ, `fontan_clase_nyha`, `fontan_arritmia` | «Congestión y complicaciones»: `fontan_derrame_pleural`, `fontan_ascitis`, y las SEIS casillas en `.cc9-chk2` | `#fontan-resultado` |
| **Eisenmenger** `#eisen-fila` | «Lesión y saturación»: `eis_lesion_base`, `eis_saturacion_reposo` ⓘ, `eis_saturacion_ejercicio` | «Presión pulmonar y ventrículo derecho»: `eis_psap`, `eis_pdap`, `eis_it_vel`, `eis_vd_funcion` | «Clínica»: `eis_clase_nyha`, `eis_sincope` ⓘ, `eis_hemoptisis` ⓘ, `eis_pericardio` ⓘ | `#eisen-resultado` |
| **Ebstein** `#ebs-fila` | «Válvula y ventrículo derecho»: `ebs_desplazamiento`, `#ebs-desp-idx` (calculado), `ebs_atrializacion`, `ebs_it_ro`, `ebs_func_vd` | «Índice de Celermajer» ⓘ: las cinco áreas y `ebs_areas_ro` en `.cc9-g2`, y debajo `#ebs-celermajer` | «Arritmias y situación clínica»: `ebs_tsv`, `ebs_vias`, `ebs_sintomas`, `ebs_saturacion` ⓘ, `ebs_ejercicio`, `ebs_progresion` | `#ebs-concl` |
| **DSAV** `#dsav-fila` | «Tipo y anatomía»: `dsav_tipo`, `dsav_dssd_mm` ⓘ, `dsav_down` ⓘ | «Regurgitación AV y función del VI»: `dsav_regurg_av_izq` ⓘ, `dsav_regurg_av_der`, `dsav_vi_ro` | «Hemodinámica»: `dsav_qp_qs`, `dsav_htp`, `dsav_rvp_uw` ⓘ | `#dsav-resultado` |
| **CVPA** `#cvpa-fila` | «Anatomía»: `cvpa_venas_numero`, `cvpa_conexion` ⓘ, `cvpa_lado` | «Hemodinámica»: `cvpa_qp_qs` ⓘ, `cvpa_htp` | «Clínica y datos del estudio»: `cvpa_sintomas`, `cvpa_cia_ro`, `cvpa_vd_ro` | `#cvpa-resultado` |
| **Ductus** `#dap-fila` | «Tipo y tamaño»: `dap_tipo`, `dap_diam` | «Shunt»: `dap_dir`, `dap_vmax` | «Gradiente y presión»: `#dap-gmax` (calculado, con su leyenda) y `dap_paps` | `#dap-qpqs` **y** `#dap-concl`, las DOS tiras |
| **VAP** `#vap-fila` | «Tipo y tamaño»: `vap_tipo`, `vap_diam` | «Shunt»: `vap_dir`, `#vap-qpqs` (calculado) | «Presión pulmonar»: `vap_htp`, `vap_paps_ro` | `#vap-concl` |

**«Ver criterios» lo tienen SÓLO el Fontan y Eisenmenger**, verificado en HEAD y después, y en los
dos conserva su llamada (`critAbrir('fontan')`, `critAbrir('eisen')`) y abre la tarjeta con los
mismos caracteres que en HEAD —1.909 y 1.724—.

### Altos de la sección, antes y después (tema oscuro)

| Sección | 1440 | 1000 | 900 | 768 | 390 |
|---|---|---|---|---|---|
| Fontan | 783,0 → **460,3** | 783,0 → 586,3 | 783,0 → 586,3 | 1166,0 → 1154,9 | 1166,0 → 1168,9 |
| Eisenmenger | 550,8 → **529,1** | 580,6 → 666,9 | 580,6 → 666,9 | 952,6 → 1107,5 | 996,4 → 1157,1 |
| Ebstein | 814,0 → **531,3** | 865,5 → **657,3** | 877,5 → **670,3** | 1409,5 → **1179,6** | 1582,0 → **1192,6** |
| DSAV | 409,5 → **353,3** | 453,0 → 476,3 | 453,0 → 476,3 | 768,0 → 885,9 | 814,6 → 899,5 |
| CVPA | 416,5 → **365,3** | 424,0 → 488,3 | 448,0 → 488,3 | 683,0 → 826,9 | 741,6 → 828,5 |
| Ductus | 313,0 → **237,3** | 310,0 → 384,3 | 310,0 → 384,3 | 532,0 → 640,9 | 532,0 → 640,9 |
| VAP | 324,0 → **276,3** | 334,5 → 403,3 | 351,0 → 403,3 | 575,0 → 659,9 | 624,5 → 659,9 |

⚠️ **A 1440 px las siete bajan; por debajo del corte, seis suben, y se declara.** Por debajo de
1260 px la conclusión va en su tarjeta **a todo el ancho** —lo que agrega su relleno, su borde y el
botón— y se suman los **tres títulos de grupo**. Ebstein es la única que baja en los cinco anchos,
porque era la que más desperdiciaba espacio. **No se cambió la disposición para compensarlo**: la
disposición la fija la orden.

### Las columnas no quedan parejas, y se declara

A 1440 px, Ebstein mide **285,3 / 290,0 / 379,3** px de alto: la tercera queda **94 px** más alta
que la primera porque tiene seis campos contra cuatro. **No se reordenan campos para igualarlas**,
que es lo que la orden pide. Las otras seis quedan parejas dentro de ±60 px.

---

## 3. Los diecisiete textos que pasaron al globo ⓘ

Cada uno **ya estaba en la pantalla** y se movió **palabra por palabra**: no se reescribió, no se
completó y no se le agregó una fuente que no tuviera. Todas las entradas están en `VINFO`, que pasa
de **123 a 140**, y **ninguna lleva ficha en Referencias** —es la convención de las entradas que no
citan un corte de guía con su folio—. Las diecisiete están listadas en `docs/PENDIENTES.md` → **P9-a**.

| Clave | Sección | De dónde salió |
|---|---|---|
| `cc9-fontan-sat` | Fontan | nota de 10 px de la saturación |
| `cc9-fontan-iav` | Fontan | nota de 10 px de la insuficiencia AV sistémica |
| `cc9-eisen-sat` | Eisenmenger | nota de 10 px de la saturación en reposo |
| `cc9-eisen-sin` | Eisenmenger | nota de 10 px del síncope |
| `cc9-eisen-hem` | Eisenmenger | nota de 10 px de la hemoptisis |
| `cc9-eisen-per` | Eisenmenger | nota de 10 px del derrame pericárdico |
| `cc9-ebs-sec` | Ebstein | el párrafo inicial de la sección → globo del **título** |
| `cc9-ebs-cel` | Ebstein | la nota de las cinco áreas (`lee`) **y la CAJA ROJA** (`ojo`) → globo del **grupo** |
| `cc9-ebs-cia` | Ebstein | la nota de la cianosis |
| `cc9-dsav-comp` | DSAV | «Sólo en el tipo completo.» |
| `cc9-dsav-down` | DSAV | «Presente en buena parte de los DSAV completos del adulto.» |
| `cc9-dsav-rav` | DSAV | «Marcador de severidad y principal indicación quirúrgica.» |
| `cc9-dsav-rvp` | DSAV | «Por cateterismo. Es lo que decide sobre el cierre, no la PSAP del eco.» |
| `cc9-cvpa-sec` | CVPA | el párrafo inicial → globo del **título** |
| `cc9-cvpa-dren` | CVPA | la nota del drenaje a cava superior |
| `cc9-cvpa-qp` | CVPA | la nota del Qp/Qs por eco |
| `cc9-vap-sec` | VAP | el párrafo inicial → globo del **título** |

### Las citas no se perdieron, y se midió de las dos formas

| Sección | Citas en el cuerpo, antes | Citas en el cuerpo, después | En los globos |
|---|---:|---:|---:|
| Ebstein | 2 × ESC 2020 | 0 | 2 × ESC 2020 + Celermajer DS 1992 |
| CVPA | 1 × ESC 2020 | 0 | 1 × ESC 2020 |
| VAP | 1 × ESC 2020 | 0 | 1 × ESC 2020 |
| Fontan, Eisenmenger, DSAV, ductus | 0 | 0 | 0 |

### Lo que NO pasó al globo

- **La franja roja de contraindicaciones de Eisenmenger** se queda **arriba, a todo el ancho y
  visible**: es decisión **expresa** del médico. Verificado presente después del cambio, con su
  texto completo, y verificado que **ninguna** entrada del registro la contiene.
- **La línea inicial del DSAV** salió de la pantalla y **no fue al globo**: cuenta una decisión de
  **diseño** —por qué la FEVI y el DTSVI no se vuelven a pedir ahí— y no un dato clínico. Está
  copiada en `docs/fuentes/FUENTES.md` y en el mensaje del commit 4. En la pantalla queda el rótulo
  **«FEVI y DTSVI — del estudio»**.
- **La leyenda del gradiente del ductus** («4 × Vmax²») se queda pegada a su campo: es parte del
  campo.

⚠️ **LA CAJA ROJA DE EBSTEIN ES UN AVISO QUE EVITA UN ERROR.** Dice que el índice de Celermajer es
orientativo y no una indicación, que por ecocardiografía sobreestima la severidad, que se derivó en
28 neonatos y que no figura en la ESC 2020. Entra **completa** en el bloque «A tener en cuenta» del
globo del grupo, con sus cuatro cortes y su origen. **Pierde sus colores propios** porque el globo
usa el estilo estándar, que es lo que la orden fija.

⚠️ **EL GLOBO DEL GRUPO HACE CRECER SU TÍTULO A 44 px**, y es la decisión de la casa para el piso
táctil: **sin márgenes negativos**, el contenedor crece y nada queda tapado. Verificado con
`elementFromPoint`: los cinco puntos dan el propio botón.

---

## 4. La morfología de TAVI: la opción nueva y su sincronía

### La opción

`ete_tavi_morf` gana **una sola** opción: `protesis_bio` → «Prótesis biológica previa
(valve-in-valve)». No se agrega prótesis mecánica ni ninguna otra, no se quita ninguna y no se
cambia el texto de las que estaban. Cierra lo que **P8-d** dejó declarado.

⚠️ **Y HUBO QUE AGREGARLA A `TAVI_TXT.morf`, QUE NO ES OPCIONAL.** La línea del emisor es
`TAVI_TXT.morf[morf] || morf`, así que una morfología sin texto publica su **token crudo** en el
informe firmado —el defecto que la tanda VAL-PPT ya pagó con el acrónimo del TEER—. Su texto es
**«sobre prótesis biológica previa»**, que describe y no nombra guía ni conducta. Verificado: el
token `protesis_bio` **no** aparece en el informe, ni en el PDF, ni en el PPT, ni en el EN SUMA.

### Los consumidores, censados uno por uno

| Consumidor | Qué hace con un valor nuevo |
|---|---|
| el emisor del informe | lo traduce por `TAVI_TXT.morf` — **había que agregarlo** |
| el PPT (`_pptSel`) | lee el **texto** de la opción elegida — no se rompe |
| el Laboratorio (`_labUsaTavi`) | lo cuenta como predicado de texto — ver abajo |
| `LAB_XLS_MAP` | **no tiene** entrada para `ete_tavi_morf`: sin columna de Excel y sin lista de valores en el importador |
| «Nuevo estudio» | repone el selector a su primera opción, como cualquier `<select>` |

### Las dos parejas, y la que se para

`TAVI_MORF_PARES` declara **dos**:

| TAVI | Válvulas | Por qué es inequívoca |
|---|---|---|
| `bicuspide` | `Bicúspide` | las dos afirman el número de velos |
| `protesis_bio` | `Prótesis biológica` | las dos afirman que la válvula aórtica **es** una bioprótesis |

**No se une `tricuspide` con «Trivalva normal»**, que es el criterio de **P8-d**: «Trivalva normal»
afirma que la válvula es **normal** y «Tricúspide» afirma sólo el número de velos; en un paciente
que va a TAVI la válvula no es normal. Las otras seis opciones de Válvulas y la `cuadricuspide` de
TAVI no tienen equivalente, y un valor sin equivalente **no escribe nada y no borra nada**.

### El sentido Válvulas → TAVI es CONDICIONAL, y es una consecuencia medida

`_labUsaTavi` nombra **`ete_tavi_morf`** entre sus predicados de texto, así que con el espejo
simétrico **todo estudio con la válvula aórtica bicúspide pasaría a contar como «Con TAVI»** en el
filtro de cohorte del Laboratorio, que está **fuera** de esta tanda. Es la misma forma y el mismo
motivo que la sincronía de la raíz aórtica de PANT-8, y se reusa su predicado `_taviModuloEnUso()`.

⚠️ **`ete_tavi_morf` ENTRA EN LA EXCLUSIÓN DE `_taviModuloEnUso`**, por el mismo motivo que los tres
espejos de la raíz: desde esta tanda también es espejo, y si contara, el primer valor copiado haría
que el módulo pareciera en uso y **el espejo se autorizaría a sí mismo**. Lo vigila **TC-667 (F1)**.

| Medición | Resultado |
|---|---|
| «Bicúspide» en Válvulas, módulo de TAVI **sin usar** | `ete_tavi_morf` vacío, `_labUsaTavi` **false** en los dos árboles |
| `ete_tavi_morf` cargado | `_labUsaTavi` **true** — que es lo que la simetría habría producido |

⚠️ **AL VACIAR LA MORFOLOGÍA DE TAVI, LA DE VÁLVULAS NO SE VACÍA**, y se declara en **P9-c**:
`va_morf` **no tiene** opción vacía, así que lo único escribible sería «Trivalva normal», que
**afirma** que la válvula es normal. Un borrado no puede convertirse en una afirmación clínica.

### La diferencia de papel, con sus dos ejemplos

Es la que el punto 8d de la orden autoriza: la sincronía hace llegar al papel un dato que hoy no
llega.

| Escena | Antes | Después |
|---|---|---|
| `ete_tavi_morf` = «Bicúspide», nada más | informe: «Válvula aórtica de morfología normal, sin estenosis ni insuficiencia»; EN SUMA: «Estudio sin alteraciones estructurales ni funcionales significativas» | informe: «Válvula aórtica **bicúspide**, sin estenosis ni insuficiencia»; EN SUMA: «**Válvula aórtica bicúspide**» |
| la opción **nueva**, nada más | la opción no se podía consignar | el informe describe la válvula aórtica como protésica |
| la opción nueva **con el módulo integrado** | — | «**Válvula aórtica sobre prótesis biológica previa.** Anillo aórtico 24 mm.», también en el PDF y en el PPT |

⚠️ **LA ESCENA DE LA OPCIÓN NUEVA SE MIDE SÓLO EN EL ÁRBOL NUEVO.** Poner un valor que HEAD no
tiene deja el selector en cadena vacía y daría una **diferencia falsa** donde el cambio no puede
actuar.

---

## 5. Lo que se midió y con qué

| Qué | Con qué |
|---|---|
| inventario y geometría de las siete pantallas, los dos temas, seis anchos | `scripts/_probe_pant9inv.mjs` |
| una pantalla rediseñada: columnas, conclusión, globos por las tres vías, recortes | `scripts/_probe_pant9pant.mjs --sec <k>` |
| A/B de superficies: 30 escenas, PDF y PPT generados de verdad | `scripts/_probe_pant9ab.mjs` |
| la sincronía de morfología, catorce casos en los dos sentidos | `scripts/_probe_pant9morf.mjs` |
| el inventario de la Evidencia de congénitas (solo lectura) | `scripts/_probe_pant9evid.mjs` |
| Chrome y WebKit, dos temas, cuatro anchos | `scripts/_probe_pant9wk.mjs` |
| las mutaciones dirigidas | `scripts/_mut_pant9.py` |

**Los casos de prueba de la tanda**: TC-662 (Fontan), TC-663 (Eisenmenger), TC-664 (Ebstein),
TC-665 (DSAV, CVPA, ductus y VAP), TC-666 (el contrato de la hoja de estilos) y TC-667 (TAVI).

---

## 6. Dos defectos propios que costaron una medición cada uno

1. **Un `</div>` de más cerró `app-content` antes de tiempo.** El ancho del cuerpo de la sección
   cayó de 1.230 a **920 px** y todo lo que sigue a Fontan —el pie del corazón 3D, las otras
   pestañas, el pie de acciones— se convirtió en **hermano** de `app-content` dentro del
   `app-shell` flex. El DOM quedaba **balanceado**, así que ni el conteo de `<div>` ni la lectura
   lo encontraron: lo encontró medir la **cadena de padres**. Es el modo de falla que esta casa ya
   documenta cuatro veces.
2. **El comando que agregaba las entradas al registro de globos nunca se ejecutó** —lo rechazó el
   shell— y la verificación **se dejó engañar**: buscó el nombre de la clave en **todo** el
   archivo, y la clave también aparece en el marcado. Hay que buscarla en la **región del
   registro**. Por eso `p9_vinfo_add.py` verifica ahí y no en el archivo entero.
