# PR9 — la tabla de cálculos, el PDF «Tipo Word», los recuadros y el ingreso del SGL

Mapa de la tanda **PR9** (2026-11-25). Por nombre de función y de constante, no por número de
línea. Lo que esta tanda **no** movió: ninguna fórmula, ningún corte clínico, ningún texto
clínico y nada de lo que entra al informe, al EN SUMA, al PPT ni al Excel.

---

## 1 · La tabla «Cálculos de strain»

| qué | dónde |
|---|---|
| El contenedor | `#sgl-calc`, entre la tarjeta del bull's eye y los patrones |
| El pintor | `scRender` |
| Las doce celdas | `SC_COLS` — cuatro columnas de tres |
| Los iconos | `SC_SVG`, `_scSvg`, `_scBoton`, `_scGlobo` |
| El motivo de un icono apagado | `scMotivo` → `_scFaltanTxt` |
| El estilo | las reglas `.sc-*` del bloque de CSS |

### Qué cambió y por qué

**Una línea por celda.** Nombre corto, valor —o una raya— y los tres iconos en la **misma**
línea, dentro de un `.sc-lin`. Los nombres son `17 seg.`, `16 seg.`, `Basal`, `Medio`, `Apical`,
`DA`, `CD`, `CX`, `A. sparing` y `FEVI/SGL`; los rangos de segmentos (1 a 6, 7 a 12, 13 a 16)
viven en el globo `sc-niv` y no en la celda.

**La lista de lo que falta salió del cuerpo.** Vive en el `title` **y** en el `aria-label` del
icono de Calcular cuando está apagado, con los nombres del bull's eye y «y N más» a partir del
cuarto. El nodo `.sc-falta` ya no existe.

⚠️ **EL ICONO APAGADO NO LLEVA EL ATRIBUTO `disabled`, Y NO ES UN DESCUIDO.** Un botón
`disabled` **no emite eventos de mouse**, así que su `title` —que desde esta tanda es el **único**
lugar donde vive la lista de lo que falta— no se mostraría nunca al pasar el cursor. Lleva
`aria-disabled`, se atenúa por CSS y su clic **dice** el motivo en vez de calcular. Es la receta
que PANT-34 y el prompt 7 ya dejaron escrita para el botón que tiene que **explicar** por qué
está bloqueado.

**Los iconos son SVG en línea de 14 × 14 con `currentColor`** —calculadora y flecha hacia
arriba—, más el glifo de texto `ⓘ` para el globo. Sin emoji, sin imagen de color, sin cuadro y
sin relleno. Se **tocan** en 44 px por un `::after` absoluto que **no agranda la fila** (la receta
de PANT-2; nunca un margen negativo).

⚠️ **EL ICONO DE CALCULADORA SE REDIBUJÓ PORQUE NO SE LEÍA.** Las teclas estaban hechas con
puntos de trazo (`h.01` con punta redonda) y **medidas en una captura al doble de escala no se
veían**: 14 px de icono son 28 px de pantalla, y un punto de 0,65 unidades sobre un lienzo de 16
queda en poco más de un píxel. Hoy son rectángulos rellenos de 1,6 unidades.

⚠️ **Y LA RAZÓN QUE PR8 ESCRIBIÓ PARA PONERLES `vinfo-btn-44` A LOS DIEZ GLOBOS ERA FALSA.**
Sostenía que sin esa clase el barrido del celular sumaría diez hallazgos de severidad ALTA.
Medido de las dos formas: con los iconos en 14 px `check_mobile.js` sigue dando sus **38 ALTA**
exactos, y una sonda que hace **exactamente lo mismo** que ese barrido antes de medir —marcar
`.active` en todas las `.tab-section`— encuentra la caja con **cero hijos y cero botones**,
porque **nadie llama a `scRender` al cargar la página**. El barrido nunca vio esos treinta
botones, ni a 44 px ni a 28 ni a 14. → **PR9-a**

### Las medidas

| | antes (PR8) | después |
|---|---|---|
| Caja, escritorio a 1440 px | 660 × 377 | **429 × 100** |
| Título + encabezado + 3 filas | 350 px | **85 px** |
| Alto de una fila | 101 px | **19 px** |
| Caja de un icono | 44 × 44 | **14 × 14** (toque 44 × 44) |
| Desplazamiento del documento a 390 px | 0 | **0** |

⚠️ **EL ANCHO DE LA CAJA NO SE MIDE EN EL ARNÉS.** Su ventana mide 756 px, o sea por **debajo**
del corte de 760 de la media query de celular, donde la caja toma el ancho disponible a propósito
y desplaza por dentro. TC-1058 mide el ancho de la **tabla** —que lleva `width:max-content`—; el
de la caja lo mide la sonda de dos motores.

⚠️ **`box-sizing:content-box` EN LA CAJA, A PROPÓSITO.** Con el `border-box` global,
`width:fit-content` resuelve la caja de **borde** al ancho del contenido y el relleno queda por
dentro, así que la tabla desbordaba su propia caja por los píxeles que el relleno le come.

---

## 2 · El PDF «Tipo Word»

| qué | dónde |
|---|---|
| El perfil del estilo | `_TBL_ESTILOS.tipoword` |
| El cuerpo único | `_TW`, `TW_PT`, `TW_PT_FICHA`, `_ILW`, `twn`, `twb`, `twf` |
| El encabezado | `_hdrTipoWord` |
| El cuerpo de datos | la rama `_plantillaId === 'tipoword'` del bloque de cuadros |
| El rótulo de sección | `drawBar` |

**Hasta PR9 ese estilo salía con CUATRO cuerpos de letra a la vez**, medido sobre las llamadas de
dibujo: **8,56 pt** la narrativa, **9,1** los datos numéricos, **9,2** el EN SUMA y **9,63** los
títulos de sección. Ninguno estaba elegido: cada bloque heredaba el tamaño del camino que
comparte con las otras ocho plantillas. Y la ficha salía en dos (9,5 la institución y 8,5 las
filas).

Hoy: **`TW_PT` = 10 pt para todo el cuerpo** —datos, narrativa, EN SUMA y viñetas—, los títulos
de sección y los rótulos de barra en negrita al **mismo** tamaño, y la ficha, la firma y el pie en
**8 pt**, uniformes entre sí.

⚠️ **SE PONEN CON `setFontSize` DIRECTO Y NO POR `fn`/`fb`**, que multiplican por
`_FS = PDF_FS × _FSA`. Son dos cosas a la vez: el número que se declara es el que el médico mide
en el papel, y el ajuste automático A4 —que en su último paso comprime el cuerpo— **no puede
bajar este estilo de los 9 pt** que la orden fija como piso. El **aire** lo sigue comprimiendo
`_SPA`, que es la palanca que esta casa agota primero.

**El 10 sale de medir y no de elegirlo**: es el mayor del rango 9 a 10 con el que el ETT normal de
prueba entra en **una** hoja A4.

**Los renglones en blanco irregulares se fueron.** La línea vacía del texto de datos —los tres
grupos del ventrículo izquierdo— metía 0,6 de interlínea de aire, y eso era lo que el médico vio:
entre FEVI y Masa idx y entre Geometría y Vol. sistólico el papel abría **8,8 mm** donde el resto
abría 5,5. Hoy la separación entre líneas de datos es **siempre 4,9 mm** y la de entre secciones
**siempre 6,9**. El texto **copiado** no se tocó: ahí los tres grupos siguen separados.

### Lo medido, con el score de Wilkins integrado al informe

| | antes | después |
|---|---|---|
| ETT normal | 1 hoja | **1 hoja** |
| Estudio largo | 3 hojas | **2 hojas** |
| Título huérfano en el largo | «INFORME» solo al pie de la hoja 1 (y = 257,61) | **ninguno** |
| Cuerpos de letra por hoja | h1 9,1 y 9,63 · h2 8,56, 9,1 y 9,2 · h3 9,63 | **h1 10** · h2 9,63 (anexo) |

**Las otras ocho plantillas no se tocaron**, y es medible: el A/B contra `1932582` las da
**idénticas en contenido y en formato** en los dos estudios.

⚠️ **LA HOJA DEL ANEXO (el score) LLEVA SU PROPIO CUERPO (9,63) Y SU PROPIO COLOR.** La dibuja
`amiloDibujarSecciones`, que es otra función, y la orden la deja expresamente fuera. En «Tipo
Word» esa hoja **sigue saliendo en color** —la franja del tema `rgb(26,58,92)` y el fondo del
recuadro `rgb(239,241,244)`—. → **PR9-b**

---

## 3 · Los recuadros de texto variable del PDF

| qué | dónde |
|---|---|
| El dibujante | `amiloDibujarSecciones` |
| El marcador de nota | una línea que arranca con `!!` |
| El aire de salida | `_SEP(H) = H × 0,78` |
| El aire interno | `_NOTA_PAD` |

⚠️ **EL RECUADRO NO ERA MÁS ALTO DE LO QUE EL PDF CALCULA, y la hipótesis del reporte queda
desmentida con la medición.** El alto que `plan()` reserva y el que el bucle dibuja salen de la
**misma** cuenta y del **mismo** número de renglones que devolvió `splitTextToSize`: con texto
corto, largo, muy largo y con el ancho recortado a 90 y a 60 mm, el recuadro mide exactamente lo
que dice medir.

**Lo que estaba mal es DÓNDE empieza lo que viene abajo.** Esa función dibuja cada fila con la
**línea de base** en `y` y avanza `y += H`, que es coherente entre dos filas seguidas; pero la
nota es la **única** que reserva un **rectángulo** de `y` a `y + altoN` y deja `y` en su borde
inferior. Así la base de lo que sigue cae **exactamente** sobre ese borde y sus mayúsculas suben
hacia adentro: **2,44 mm** de solape, **siempre el mismo**, porque no depende del largo del texto
ni del ancho. El mismo defecto, más chico, tenía la franja de título: su primer subtítulo quedaba
a **0,56 mm** de la banda.

Se cierra con `_SEP(H)`, el **mismo** factor con que la nota ya coloca su primera línea de base
—o sea el alto de una caja de línea por encima de su base—, usado en `plan()` **y** en el bucle de
dibujo, que es la regla que esa función ya tiene escrita. Escala con el cuerpo de letra.

**Alcanza a los nueve estilos**, que es lo que la orden pide. Ese recuadro es el **único** del PDF
con alto variable: censados los **47** `doc.rect` del archivo, el otro candidato —la caja del
paciente de `_hdrCajaPaciente`— ya reservaba 3 mm de salida contra 2,03 de mayúscula, y el banner
de KPI del Laboratorio tiene alto fijo.

### Lo medido, en la tarjeta del Wilkins de verdad

| | antes | después |
|---|---|---|
| tipoword | pisa 2,44 mm | **ninguno** |
| clásico | pisa 2,44 mm | **ninguno** |
| moderno | pisa 2,44 mm | **ninguno** |
| Aire bajo la franja de título | 0,56 mm | **2,67 mm** |

⚠️ **EL DETECTOR DE SOLAPES TENÍA EL MISMO PUNTO CIEGO QUE EL DEFECTO.** Una línea de base
**exactamente** en el borde de abajo la contaba como «adentro del recuadro», así que daba
«ninguno» sobre la tarjeta que el médico reportó. Se toma el **primer** texto cuya base esté en el
borde **o por debajo**, y se exige que su tope no quede por encima de ese borde.

---

## 4 · El ingreso del SGL, el cartel de FEVI/SGL y el redondeo

| qué | dónde |
|---|---|
| La regla de la celda | `STRAIN_ENT_MAX`, `STRAIN_RE_OK`, `STRAIN_RE_PARCIAL`, `strainTxtValido`, `strainNumValido` |
| Los dos avisos | `STRAIN_AVISO_REGLA`, `STRAIN_AVISO_VIEJO` |
| La escritura | `strainEscribir` |
| La casilla | `strainCajaAbrir` — `data-strain-caja`, sin `id` |
| La restauración | `_restaurarStrain` |
| El cartel de FEVI/SGL | `scMotivo`, rama `tipo === 'fsgl'` |
| El redondeo | `_scRed` — lo consumen `_scN` y `scUsarComoSGL` |

### Cómo se coló el −1718, reproducido con el gesto real

Entraba por **dos** puertas a la vez:

1. La casilla del segmento es `type=text` **sin** `maxlength`, **sin** `inputmode` y **sin**
   `pattern`, así que acepta cualquier cosa; y `strainParseNum` no tenía **ninguna** cota de
   magnitud.
2. Al **reabrir** un segmento la casilla **nace con el valor viejo escrito y seleccionado**
   (`inp.select()`), de modo que **tocarla** para poner el cursor pierde la selección y lo que se
   escribe se **apende**: `-17` más `18` da `-1718`.

Y `strainTramoDe` acota a [1, 8], así que **el color salía violeta y no delataba nada**: el
bull's eye se veía normal con un −1718 adentro y los promedios daban −111,8 %.

### La regla, y cómo se cierra

**Criterio de la aplicación, sin fuente**: como máximo **dos cifras enteras**, con signo y un
decimal opcional. Se acepta hasta un segundo decimal —que se redondea al primero, como
`strainParseNum` ya hacía—: rechazar `12,55` sería una restricción que nadie pidió.

Tres lados:
- **El filtro en vivo** de la casilla, que cubre el teclado **y** el pegado (los dos disparan
  `input`) y revierte al último valor que podía llegar a ser válido, más `maxlength` 6 e
  `inputmode` decimal.
- **La validación al confirmar**, en `strainEscribir`, que **no guarda** y avisa.
- **La limpieza al restaurar**: un valor guardado que no entra en la regla pasa a «Sin dato»
  (tramo 0, gris) para que se vea que hay que volver a cargarlo, con **un solo aviso** por
  restauración aunque sean varios. Hacía falta: el estudio del médico ya tiene ese número escrito
  en disco.

**`strainParseNum` no se toca**, que es el otro llamador de la restauración.

### El cartel de FEVI/SGL

| estado | texto |
|---|---|
| sin ninguna | `Falta: FEVI en la app y SGL global` |
| con la FEVI en 50, sin SGL | `Falta: SGL global. FEVI tomada de la app: 50 %.` |
| sin la FEVI | `Falta: FEVI en la app` |
| SGL en cero | `Falta: un SGL global distinto de cero.` + la FEVI de la app |
| con las dos | vacío: calcula |

La FEVI sale de `v('fevi')`, el **mismo** valor que usa el informe (verificado en el navegador, no
leído). El campo de SGL llenado **a mano** cuenta igual que «Usar como SGL global».

⚠️ **Y SI CAMBIA LA FEVI, EL RESULTADO YA CALCULADO SE BORRA.** De eso se encarga `_scPurgar`,
que compara la **firma** de los insumos, pero corre **dentro** de `scRender`, y hasta PR8
`scRender` sólo se llamaba al escribir un **segmento**: tocar la FEVI dejaba en pantalla un
cociente calculado con la FEVI anterior. `scRender` entra al registro **`ESPEJOS_VIVOS`**, que lo
cuelga del rebote de 220 ms que ese registro ya tiene, sin temporizador nuevo. Cumple su regla:
**sólo pinta** —sus resultados viven en memoria, no van al guardado ni al Excel—.

### El redondeo

⚠️ **ERA ASIMÉTRICO Y ESTÁ MEDIDO.** `Math.round` de JavaScript redondea el medio hacia **+∞** y
no alejándose del cero: `Math.round(-15.75*10)/10` da **−15,7** y `Math.round(15.75*10)/10` da
**15,8**. Como el strain es casi siempre negativo, el efecto práctico era redondear **siempre
hacia cero**. En dos decimales lo mismo: −0,125 daba −0,12 y +0,125 daba 0,13.

Es el caso del médico: los cuatro apicales −16, −13, −17 y −17 promedian **exactamente −15,75** y
la tabla publicaba −15,7.

Se corrige en **un solo lugar** —`_scRed`—, redondeando el valor **absoluto** y reponiendo el
signo, que es lo que `strainParseNum` ya hacía para el valor de un segmento, y por eso **ese
camino nunca tuvo el defecto**. Lo consumen `_scN` —las diez celdas— y `scUsarComoSGL`, que con
`Math.round` pelado mostraba −15,8 y escribía −15,7. **Ninguna fórmula cambia.**

### La verificación de la orden

Con basales +5, −5, −12, −12, −12, −16; medios −12, −12, −14, −10, −9, −9; apicales −16, −13,
−17, −17; ápex −18:

| celda | esperado | da |
|---|---|---|
| 17 seg. | −11,7 | **−11,7** |
| 16 seg. | −11,3 | **−11,3** |
| Basal | −8,7 | **−8,7** |
| Medio | −11,0 | **−11,0** |
| Apical | −15,8 | **−15,8** |
| DA | −10,1 | **−10,1** |
| CD | −13,0 | **−13,0** |
| CX | −12,6 | **−12,6** |
| A. sparing | 0,80 | **0,80** |

⚠️ **EL POSITIVO VA CON SU SIGNO MÁS EXPLÍCITO.** La convención de esta casa es que un valor
**sin** signo se toma **negativo** —lo declara `strainParseNum`—, así que escribir «5» guarda −5.
La primera corrida de la sonda dio −10,3 en el basal por eso: era la sonda, no la aplicación.

---

## Las sondas y los arneses

| archivo | qué mide |
|---|---|
| `scripts/_probe_pr9_0.mjs` | el pre-check: la tabla, el PDF, el ingreso y el redondeo |
| `scripts/_probe_pr9_rec.mjs` | el recuadro aislado, con cinco escenarios de texto y ancho |
| `scripts/_probe_pr9_ab.mjs` | el A/B del papel: los siete estilos, los dos estudios |
| `scripts/_probe_pr9_pdf.mjs` | el estudio largo de verdad, con el Wilkins integrado |
| `scripts/_probe_pr9_sgl.mjs` | la TAREA 4 de punta a punta |
| `scripts/_casos_pr9.py` | el insertador de casos con su guardián |
| `scripts/_mut_pr9.py` | las veintiséis mutaciones dirigidas |

Cada sonda lleva su cuerpo en un archivo aparte, por la lección de los acentos graves.

**Los casos**: TC-1058 a TC-1063, con sus fichas en `docs/mapa/tests-fichas-1058.md`.
