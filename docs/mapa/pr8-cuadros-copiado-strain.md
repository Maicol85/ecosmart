# PR8 — los cuadros, el copiado con formato, el PDF Tipo Word, el SGL y la tabla de cálculos

Mapa de la tanda **PR8** (2026-11-24). Línea base **`d6f8326`** (cierre de PR7, sello
`v20261123-2232`, md5 `d6e31de8`, 195.032 líneas).

Se abre a demanda: no se carga solo. Las funciones se buscan **por nombre**, nunca por número de
línea.

---

## 1. Los cuadros — el resumen de válvulas y el arrastre

### 1.1 El interruptor del resumen de válvulas pasó a ser un botón de icono

| qué | dónde |
|---|---|
| el botón | marcado del pie de la tarjeta, se alcanza por `data-cuad-rv` — **no tiene `id`** |
| el estado | `cuadResumenValvToggle(on)` y `cuadRvBtnSync()` |
| el estado en memoria | `_cuadResumenValv`, leído por `cuadResumenValvOn()` |
| las cajas en la vista previa | `cuadPintar`, al final, detrás de `cuadResumenValvOn()` |
| el cuerpo de una caja | `_cuadCuerpoEn(box, d)` — **un solo armador** para los doce y para el resumen |

- **Sigue sin `id`**, por el mismo motivo que la casilla que reemplaza: el censo del estudio y el
  Excel recorren `input[id]` y `select[id]`. Se alcanza por `data-cuad-rv`, el mismo atributo que
  tenía el `<label>`.
- **El estado no vive sólo en el color**: `aria-pressed` lo dice en los dos estados, y el `title`
  y el `aria-label` dicen con palabras qué hace el botón. El texto del `<small>` de la casilla
  vieja pasó entero al `title`.
- Sigue **apagado de fábrica**, **sólo en memoria** y se reinicia al recargar.
- **Las cajas del resumen NO llevan `data-cuad-id`**: llevan `data-cuad-rv-id`. Eso es lo que las
  deja fuera del arrastre, de la cruz, del orden y de los quitados **por construcción** —todo eso
  se selecciona por `data-cuad-id`— y no por una guarda. El resumen es una INCLUSIÓN, no uno de
  los doce.
- Van detrás de un título `.cuad-rvtit` con `data-cuad-span="6"`: ese título **fuerza el corte de
  fila**. Sin él, las cajas del resumen se meterían en el hueco que dejó la última fila de los
  doce y el papel —que las dibuja en sus propias filas— no coincidiría con la vista previa.
- Salen del **mismo `cuadResumenValvDefs()`** que el PDF y con el **mismo reparto de
  `cuadFilas`**.

### 1.2 «Restablecer» apaga también el resumen

`cuadRestablecer()` llama a `cuadReset()`, apaga `_cuadResumenValv` y sincroniza el botón.
**Se apaga ahí y no en `cuadReset`**, a propósito: `cuadReset` es el reseteo PURO del orden y de
los quitados y lo llaman también las pruebas para armar su escena.

⚠️ **CON EL ESTILO «Tipo Word» LA VISTA PREVIA MUESTRA EL RESUMEN Y EL PAPEL NO**: ese estilo
ignora el resumen por la orden expresa de PR6-4, y su compuerta vive en ese camino. En los otros
ocho la vista previa y el papel leen el mismo `cuadResumenValvOn()`. El dato no se pierde: el
cuerpo de «Tipo Word» **es** el texto de los datos, y ese texto ya publica la cuantificación de las
tres válvulas desde el **mismo** `cuadResumenValvDefs()`. → **PR8-j**

⚠️ **`cuadPersonalizado()` NO se tocó**, así que el punto de aviso del botón «Cuadros» sigue sin
prenderse por el resumen. Es la decisión de PR6-b, que esta tanda no revierte. → **PR8-a**

### 1.3 El arrastre — y la causa del cuadro que quedaba gris

| qué | dónde |
|---|---|
| el oyente | delegado en `#cuad-grid`, registrado UNA vez (`g.__cuadArrOn`) desde `cuadPintar` |
| el gesto | `_cuadArrDown` · `_cuadArrIniciar` · `_cuadArrMove` · `_cuadArrUp` |
| la limpieza | `_cuadArrLimpiar()`, llamada también desde `cuadPintar` |
| el intercambio | `cuadIntercambiar(a, b)` |
| el umbral y la espera | `CUAD_ARR_UMBRAL` (6 px) y `CUAD_ARR_ESPERA` (220 ms) |
| el marcador de destino | la clase `.cuad-dest` (contorno, no relleno) |

⚠️ **LA CAUSA DEL DEFECTO QUE EL MÉDICO REPORTÓ, Y NO ERA UN DESCUIDO DE LIMPIEZA.** La versión de
PR6 colgaba `pointermove` y `pointerup` **del asa** y le daba a esa misma asa la **captura del
puntero**; y movía el nodo en vivo con `insertBefore` sobre la caja. Insertar un nodo que ya tiene
padre es, en el estándar del DOM, **quitarlo y volver a insertarlo**, y la captura del puntero se
suelta cuando el nodo que la tiene sale del documento. El asa es descendiente de la caja que se
movía, así que **el primer `insertBefore` del gesto le soltaba la captura**: desde ahí el
`pointerup` ya no llegaba al asa, `_cuadArrUp` no corría nunca, la clase `cuad-arr` —opacidad
0,45— se quedaba puesta y el orden no se commiteaba ni se repintaba. Exactamente el síntoma: el
cuadro se movía, quedaba apagado y no respondía más.

**No lo veían las pruebas** porque despachan los eventos **directamente sobre el asa**: ahí el
`pointerup` llega porque es el nodo de destino del despacho, con captura o sin ella.

**Se cierra por tres lados a la vez:** (1) `move` y `up` se escuchan en el **documento**, que no se
mueve; (2) la captura se pide sobre la **grilla**, que es el único nodo de este árbol que no se
mueve; (3) **durante el gesto no se mueve ningún nodo** —lo que se mueve es una clase de
marcador— y el orden se escribe una sola vez, al soltar.

- **Se agarra desde cualquier parte del cuadro.** La **cruz** queda afuera: ahí el gesto es
  quitar, y un umbral de arrastre sobre ese botón le comería el clic.
- **El asa ⠿ QUEDA**, como indicador discreto y como segunda vía. No desaparece porque es la única
  superficie con `touch-action:none`, o sea la única desde la que el dedo puede arrastrar hacia
  arriba y hacia abajo: `.cuad-box` lleva `touch-action:pan-y` para que el dedo pueda seguir
  desplazando la tarjeta. → **PR8-c**
- **Al soltar sobre otro cuadro los dos se INTERCAMBIAN.** Con dos cuadros **vecinos** el
  resultado es el mismo que insertar uno después del otro —por eso las pruebas del arrastre de
  PR6 y de CUADROS siguen midiendo lo mismo—; con dos lejanos es otra cosa.
- ⚠️ **EL ANCHO PERTENECE A LA POSICIÓN Y NO AL CUADRO**, y es la regla de acomodo que ya existía:
  `_cuadSpans` reparte los spans por posición desde `cuadFilas`, así que al intercambiar dos
  cuadros de anchos distintos **cada uno toma el ancho de su lugar nuevo**. No se inventó ningún
  motor. Medido con once cuadros: los spans quedan `22222222233` antes y después del
  intercambio. → **PR8-b**

---

## 2. El copiado con formato y el PDF Tipo Word

### 2.1 Un solo armador, tres salidas

`cuadTextoSecs()` es el **dueño único**: de él salen el texto llano (`cuadTexto`), el HTML del
portapapeles (`cuadTextoHTML`) y el cuerpo del PDF «Tipo Word». Con tres armadores los tres
podrían decir cosas distintas del mismo estudio.

| qué | dónde |
|---|---|
| las secciones y su orden | `CW_SECS` y `CW_SECS_DOP` |
| el separador de grupo | `CW_BLANCO` |
| el largo que decide el corte | `CW_CORTE_LARGO` (70) |
| lo que es un mensaje y no una medida | `CW_MENSAJES` y `_cwEsMensaje` |
| la mayúscula inicial | `_cwCap` |
| el HTML | `cuadTextoHTML` · `cuadInformeHTML` · `_cwEscHtml` · `_cwP` |
| los ítems del EN SUMA | `cuadSumaItems` |
| las dos piezas del informe | `cuadInformePartes` |
| las tres vías del portapapeles | `_cuadCopiar(txt, queCosa, html)` |

⚠️ **`CW_BLANCO` y `CW_CORTE_LARGO` SE DECLARAN ANTES DE `CW_SECS`, Y NO ES UN GUSTO**: `CW_SECS`
los consume **dentro de su literal**, así que con la declaración más abajo el literal se evalúa con
el centinela en **zona muerta** y el bloque de script **entero aborta ahí**. Las funciones
declaradas siguen existiendo por el izado, pero todos los `const` de abajo quedan en zona muerta y
ningún `window.X = X` vuelve a correr: la sonda lo cazó con **catorce errores de página que
parecían de otros módulos** —`_lv3d`, `FORR_IC_CORTE`, `valvSev`— y no la lectura.

- **Los dos formatos viajan en el MISMO copiado.** El portapapeles del sistema guarda un solo
  contenido con varias representaciones: escribir primero el HTML y después el texto plano **deja
  sólo el segundo**. Tres vías, en este orden: `ClipboardItem` con las dos representaciones; un
  nodo editable fuera de pantalla con `execCommand` (anda con `file://`); y el `<textarea>` de
  siempre, que copia **sólo texto llano** y es la red que la orden pide.
- **La viñeta va en el HTML y en el papel, y NO en el texto llano**: el texto llano es la red para
  pegar en un sistema que no acepta formato, y ahí lo que se pega es lo que el médico escribió.
  → **PR8-f**

### 2.2 Lo que cambió en el texto de los datos

- **Mayúscula inicial de cada renglón**, puesta al armar la salida y **no** en la tabla de orden:
  los rótulos de ahí son los de la aplicación —«onda E», «e' septal», «área AD»— y cambiarlos
  habría dejado dos juegos de nombres para los mismos campos.
- **Los renglones que son un mensaje se omiten.** Varias celdas de los cuadros no publican un
  número cuando no se puede calcular: publican el motivo. En un cuadro del papel eso explica un
  hueco; en el texto que el médico pega en el sistema del sanatorio es un renglón que dice una
  frase donde se espera un valor.
- **La PAP media lleva su unidad.** ⚠️ La pone **este texto y no el cuadro**: la celda del cuadro
  es `{ lbl:'PAP media', val: sv('pap_med') }`, el único valor del papel que sale sin su unidad.
  Ponérsela al cuadro cambiaría el PDF, que esta tanda no tiene orden de tocar. → **PR8-e**
- **La línea mitral es `THP - TDE - TRIV - área`**, con el corte: si la línea pasa de
  `CW_CORTE_LARGO` la **última pieza** baja al renglón siguiente. Medido con el caso normal: 61
  caracteres, o sea que con datos reales el corte **no llega a disparar** y es una guarda.
  → **PR8-d**
- ⚠️ **LA FRASE QUE ESTABA REPETIDA.** Hasta PR7 la mitral publicaba **dos renglones con el mismo
  número**: «área: 2.32 cm2 (THP)» —el área por el método elegido, que rotula cuál fue— y «AVm por
  THP: 2.32 cm2» —el mismo valor sin decir de dónde sale—. Queda **uno**: el que dice el método, y
  viaja en la misma línea del THP. La clave `vm|AVm THP` ya no se nombra en ninguna tabla de orden,
  así que `cuadTextoFaltan` la declara usada a mano.
- **El ventrículo izquierdo va en tres grupos** separados por una línea en blanco: (SIV … FEVI),
  (masa indexada y geometría), (VDFVI indexado, volumen sistólico y VLI). El separador sale
  **sólo** si hay un renglón con datos antes y otro después.
- **Pericardio y masas no entran**: el cuadro `otros` sigue en `CW_CUAD_FUERA`.

### 2.3 El PDF «Tipo Word», rehecho

| qué | dónde |
|---|---|
| el perfil monocromo y sin cajas | `_TBL_ESTILOS.tipoword` |
| el subrayado del título | la clave `barSubray`, consumida por `drawBar` |
| el encabezado y la ficha | `_hdrTipoWord()`, registrado en `_PLANTILLAS_FN.tipoword` |
| el cuerpo | la rama `_plantillaId === 'tipoword'` del bloque de los cuadros |
| la viñeta del EN SUMA | la rama `tipoword` del bloque del EN SUMA |

- **Negro sobre blanco y sin una sola caja.** Lo que lo deja monocromo no es una lista de
  excepciones repartida por el emisor: es el **perfil**, que es el único lugar donde esas
  decisiones viven. Medido: **12 rectángulos** y los doce son los subrayados —de 15 a 16 mm de
  ancho por 0,35 mm de alto—, **cero** recuadros, contra los 94 del clásico.
- **La ficha del paciente sale de `pRows`**, el mismo lugar donde las otras ocho plantillas
  resuelven sus datos, puesta como renglones de texto en vez de una grilla con bordes. El símbolo
  del sexo entra por `_tSexo`, el mismo dibujante que usa la caja del paciente.
- **El logo sólo si está cargado**: `_hdrDibujarLogo` ya no dibuja nada cuando no hay logo, así que
  la condición no se escribe acá. Medido: **cero** imágenes sin logo.
- ⚠️ **LA VIÑETA SE DIBUJA Y NO SE ESCRIBE, y lo encontró la sonda.** El saneador de este archivo
  —`amiloSanPDF`— deja pasar sólo `\x20` a `\xFF` y borra todo lo demás, así que el carácter
  U+2022 **desaparecía** y los ítems salían sin nada adelante. Escribir el byte 0x95 —la viñeta de
  WinAnsi— lo atravesaría, pero eso apuesta a la codificación del tipo de letra y **un glifo
  equivocado en un informe firmado es peor que un punto dibujado**. Se dibuja un círculo lleno de
  0,5 mm, que no depende de ninguna codificación.
- ⚠️ **Y LOS ÍTEMS DEL EN SUMA VAN EN LETRA NORMAL, lo que costó el segundo sello de la tanda.**
  `fif(8)` —que corre para las nueve plantillas, arriba de la rama— deja la letra en `bolditalic`,
  que es como el EN SUMA sale en las otras ocho desde siempre, así que los ítems **heredaban la
  negrita del rótulo**. La orden pide que el narrativo salga con el **mismo formato que el copiado
  del informe**, donde los ítems son renglones de una lista llana y el único negrita con subrayado
  es el rótulo. Lo encontró mirar las **llamadas de dibujo** y no el papel: `"b|Estenosis aortica
  severa."`. Se pone la letra normal **dentro** de la rama `tipoword`, así que las otras ocho
  plantillas no se enteran, y el A/B de los siete estilos lo confirma.
- **El subrayado del cuerpo va sólo en DOPPLER**, igual que en el copiado: la orden distingue
  «títulos de sección en negrita» de «DOPPLER en negrita y subrayado». Hasta PR7 lo llevaban los
  nueve títulos, así que el papel y el portapapeles se contradecían.
- ⚠️ **EL CONTROL MÁS FUERTE DE LA TANDA**: los **otros seis estilos de PDF no mueven un solo
  texto dibujado**. Medido con el mismo estudio en los dos árboles, capturando cada `doc.text`:
  clásico 368 textos y 4.259 caracteres con el mismo hash; moderno 370/4.281; minimalista
  863/10.578; académico 933/10.758; compacto 344/4.303; elegante 370/4.281 — los seis
  **idénticos**, con los mismos rectángulos, círculos e imágenes. El único que cambia es
  `tipoword`: 240 → 184 textos, 56 → 12 rectángulos, 4 → 8 círculos.
  ⚠️ **No se compara por BYTES**: el PDF trae su fecha de creación, así que dos corridas del mismo
  árbol dan bytes distintos —medido: 34.948 y 34.950—. Lo determinista es la lista de textos.

---

## 3. La entrada de datos del SGL

| qué | dónde |
|---|---|
| el tramo por omisión | `STRAIN_DEF` (1, el violeta) |
| el tramo vigente de un segmento | `strainIdx(id)` |
| el número con su signo, para el papel | `strainNumTxt(id)` |
| el número o el guion, para la pantalla | `strainNumTxtPantalla(id)` |
| el ciclo | `strainCiclar(id)` |
| la única escritura | `strainSet(id, idx, num)` |
| el texto escrito a mano | `strainEscribir(id, txt)` |
| la puerta del gesto | `strainTocar(id, el)` |
| el aviso del segmento con número | `STRAIN_AVISO_NUM` |
| esconder la etiqueta del segmento | `_strainOcultarRot(id, ocultar)` |
| la migración de los cinco estados viejos | `STRAIN_MIGRA` y `_restaurarStrain` |

- **Los diecisiete arrancan en el tramo 1, violeta y sin números**, y «Sin dato» deja de ser el
  arranque para pasar a ser un estado al que se llega **ciclando**, al final de los ocho tramos.
  El ciclo medido: `2,3,4,5,6,7,8,0,1,2`.
- ⚠️ **ESTO NO ESCRIBE `strainEstado`**: el objeto sigue vacío hasta que el médico toca un
  segmento, y es lo que mantiene en pie la compuerta del papel —«hay strain por segmento
  EVALUADO» pregunta por un estado **mayor que cero** sobre las claves que existen—. Un segmento
  sin tocar se **dibuja** violeta y no cuenta como dato; uno que el médico dejó en violeta a
  propósito tiene su clave escrita y sí cuenta. Medido: con los diecisiete recién dibujados,
  `strainHayDatos()` da **false**. → **PR8-g**
- **El guion aparece sólo con el botón de números encendido**, y sólo en los segmentos sin número.
  ⚠️ **Hay DOS funciones y no una**: la de **pantalla** pone el guion y la del **papel** no. En un
  informe firmado un guion dentro de un segmento no le dice nada a quien lo lee, y además haría
  que el papel dependiera de un interruptor de pantalla. Las dos superficies del papel —el PDF y
  el PPT— consumen `strainNumTxt`.
- **Un valor sin signo se toma negativo; con un `+` explícito se conserva positivo y se muestra
  con su signo** (`+8`), porque la escala lateral es así y porque un `+8` sin signo se leería como
  un `-8`. `strainParseNum` no se tocó: es la función pura de PR7.
- **Borrar el número y confirmar devuelve el segmento al violeta** y no a «Sin dato»: lo que el
  médico hace al borrar es deshacer lo que escribió, y lo que había antes de escribir es el
  violeta de arranque.
- **Con el botón apagado, un segmento que tiene número no cambia de color y avisa.** Ciclarlo
  borraría el número —es lo que `strainSet` hace a propósito para que el color y el número no se
  contradigan—, o sea una pérdida de dato en silencio por un toque.
- **La casilla esconde la etiqueta vieja del segmento** mientras está abierta, por atributo
  (`visibility`), y la repone al cerrar.
- **La migración manda el 0 viejo al tramo 1** (violeta) y no a «Sin dato»: `STRAIN_MIGRA` pasa de
  `[0,2,3,5,7]` a `[1,2,3,5,7]`. Es orden expresa y es coherente con el modelo nuevo —el violeta
  **es** un valor, de −20 a −15—. Lo que cuesta está en **PR8-g**.

---

## 4. La tabla «Cálculos de strain»

| qué | dónde |
|---|---|
| el contenedor | `#sgl-calc`, entre la tarjeta del bull's eye y `#sp-root` |
| el dibujo | `scRender()` — con nodos |
| las doce celdas | `SC_COLS` |
| los grupos de segmentos | `SC_GRUPOS` |
| los territorios | `_scTerr(sigla)`, derivado de `CONTR_TERRITORIO` |
| los promedios | `scPromedio(indices)` |
| las dos fórmulas | `scApicalSparing()` y `scFeviSobreSgl()` |
| lo que le falta a una celda | `scMotivo(celda)` |
| la firma de los insumos | `_scFirma(celda)` |
| los resultados | `_scRes` — en memoria y nada más |

- ⚠️ **LOS DIEZ GLOBOS ⓘ DE LA TABLA NO LLEVAN ATRIBUTO `title`, y eso costó el tercer sello de la
  tanda.** Lo encontró la **pasada de lotes** y no una lectura: **TC-500 (A3)** —un caso maduro—
  exige que *ningún* globo de la app lo lleve, porque la explicación vive en la **tarjeta** que el
  globo abre y un `title` encima pone un segundo cartel, el nativo del navegador, compitiendo con
  ella sobre el mismo botón. Queda el `aria-label`, que es lo que lee el lector de pantalla. Los
  otros dos botones de la celda —la calculadora y la flecha— **sí** lo llevan: no son globos, y la
  orden pide que un botón de icono sin texto tenga su explicación al pasar el mouse.
  ⚠️ **Y ERA SENSIBLE AL LOTE**: corrido aislado, TC-500 no veía la tabla —`scRender` la dibuja al
  mostrar la pestaña de strain o al escribir un segmento—, así que el defecto aparecía sólo cuando
  un caso anterior la había pintado. Es por lo que la pasada de lotes existe.
| «Usar como SGL global» | `scUsarComoSGL(clave)` |
| los cinco textos del globo | `VINFO` → `sc-prom`, `sc-niv`, `sc-terr`, `sc-asr`, `sc-fsgl` |

- **Es de consulta.** Nada de lo que muestra entra al informe, al EN SUMA, al PDF, al PPT, al
  Excel ni a los textos copiados, y **no lleva una sola casilla de inclusión**. Lo único que sale
  de ahí hacia la aplicación es «Usar como SGL global». Medido: cero apariciones de sus cuatro
  rótulos en el texto copiado, en el informe, en el HTML y en el PDF.
- ⚠️ **LOS SEGMENTOS Y LOS TERRITORIOS SALEN DE LOS DUEÑOS DE CONTRACTILIDAD**, no de una lista
  escrita acá: `LV3D_SEG_ID` es la numeración AHA 1..17, `LV3D_SEG_NOMBRE` son los nombres que el
  médico lee, y `CONTR_TERRITORIO` con `CONTR_TERRITORIO_NOMBRE` son el reparto por arteria. Los
  tres viven en un bloque de script **anterior**, así que desde acá se alcanzan por su nombre.
  Medido: DA `[1,2,7,8,13,14,17]`, CD `[3,4,9,10,15]`, CX `[5,6,11,12,16]`.
- **El nivel apical son los cuatro segmentos apicales y NO incluye el casquete (17).** Es criterio
  de la aplicación y lo dice su globo.
- **Cada celda exige TODOS sus segmentos con número.** El botón queda apagado con el motivo en su
  `title` **y** en un renglón chico dentro de la celda, con los nombres que se ven en el bull's
  eye.
- **Los promedios usan los valores con su signo**, con un decimal y coma; **las razones usan
  valores absolutos**, con dos decimales. Medido con los diecisiete cargados: g17 −12, g16 −12,5,
  basal −15, medio −14, apical −6,5; apical sparing 0,2241; FEVI/SGL 3,4118.
- **Si después de calcular cambia un número que esa celda usó, el resultado se borra**: de eso
  cuelga `_scFirma`. Medido: al mover el ápice se va el promedio de 17 y se quedan el basal, el
  apical sparing y la FEVI/SGL, que no lo usan.
- **«Usar como SGL global» escribe el campo por su camino normal** —se le despacha un evento de
  entrada, así que corren el espejo con el campo de AI/VI y `calcSGL`—. ⚠️ **El signo no se
  duplica**: el promedio de valores negativos ya es negativo, así que se escribe tal cual;
  pasarlo por `sglNeg` —que hace `-|x|` siempre— daría vuelta un promedio positivo. Y el campo es
  `type=number`, así que el valor se escribe con **punto** decimal.
- **Con el campo ya cargado pregunta** con el cartel propio de esta casa (`preguntaProp`); con el
  campo vacío escribe en el acto.
- ⚠️ **LA ALTURA LA FIJAN LOS BOTONES Y NO EL TEXTO.** El piso táctil global de este archivo le
  pone 44 px de alto y de ancho a todo botón, así que una celda no puede medir menos que una fila
  de botones. Por eso el nombre y el valor van en un renglón de 13 px y los botones en el
  siguiente. Medido: **265 px de alto** con los diecisiete cargados (377 con los nueve renglones
  de «Falta:») y **660 px de ancho**, contra los **488 px** de la tarjeta del bull's eye.
  → **PR8-h**
- ⚠️ **LOS DIEZ GLOBOS LLEVAN `vinfo-btn-44` Y NO SÓLO `vinfo-btn`.** Un `vinfo-btn` pelado mide
  15×11 px en escritorio —lo declara su propia hoja— y `check_mobile.js` lo cuenta como toque
  chico de severidad **ALTA**: diez globos nuevos habrían movido la línea base del celular en
  diez.

---

## 5. Lo que esta tanda NO tocó

- Los **patrones de ejemplo** del SGL, el **mapa de SGL calculado del visor**, los valores de
  **aorta**, **Referencias** y los **otros ocho estilos de PDF**.
- **Ningún corte clínico, ningún umbral y ninguna fórmula de severidad**: lo que entra son dos
  cálculos **descriptivos** que no votan en ninguna cápsula, un reordenamiento de texto, un estilo
  de PDF y un modo de entrada de datos.
- **Cero campos guardados nuevos y las 457 columnas quietas**, por construcción: cero `<input>`,
  `<select>` y `<textarea>` nuevos **con `id`**. Medido en los dos árboles: **812** `input[id]`,
  **297** `select[id]`, **29** `textarea[id]` y **381** claves de `LAB_XLS_MAP`, los cuatro
  idénticos.

---

## 6. Las trampas que esta tanda pagó

1. **La zona muerta de un `const`.** `CW_SECS` consumía `CW_BLANCO` antes de su declaración: el
   bloque de script entero abortó y la sonda informó **catorce errores de página** que parecían de
   otros módulos. Es la misma trampa que PR7 pagó con la paleta del strain.
2. **El saneador de WinAnsi borra la viñeta.** `amiloSanPDF` conserva sólo `\x20` a `\xFF`.
3. **La ventana del arnés mide 756×469**, así que a ese ancho la tarjeta pone **un cuadro por
   fila** y el quinto cae debajo del pliegue, donde `elementFromPoint` devuelve `null`. Se arrastra
   al cuadro **siguiente**, que es la receta que TC-939 documenta.
4. **El denominador del puntero se mide ANTES de soltar**: después de soltar, el cuadro que está
   en ese lugar ya es el intercambiado.
5. **A 756 px la media query de celular le pone `span 6` a todos los cuadros**, así que el ancho
   medido no distingue nada y el **atributo** sí.
6. **El cartel propio devuelve una promesa que sólo un clic resuelve**, y buscarlo por su marca en
   el DOM depende de que nadie más lo haya cerrado en el medio. Lo que la orden pide —«pregunta
   antes de reemplazar»— se mide **espiando la llamada** y comprobando que el campo no cambie
   mientras se espera la respuesta.

---

## → PR12 (25/11/2026): el TAMAÑO DE LETRA del texto copiado

Los dos armadores de HTML de esta tanda —`cuadTextoHTML` y `cuadInformeHTML`— declaraban
`font-size:11pt` **sólo en el `<div>` envoltorio**, y Pages y Word le asignan a todo bloque sin
tamaño el de su propio estilo de párrafo: de ahí el **14** que el médico vio al pegar. PR12 puso el
tamaño **en línea en cada bloque** con un solo dueño (`CW_PT` / `CW_FS` / `_cwB`) y **retiró la
tipografía fija** del envoltorio. El **texto llano no cambió ni un byte**.

→ **`docs/mapa/pr12-copiado-rwt-paleta.md` § 1.**
