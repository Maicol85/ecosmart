# «Explorar», la transposición dentro del corazón maestro, Masas y el pulmón — mapa de la tanda PANT-13 (2026-11-04 y 05)

> Mapa NUEVO. `congenitas-otros.md` (34.540 B) y `tests-fichas.md` (34.237 B) están a menos de
> 1 KB del techo y **no se tocaron**, que es lo que la orden pide. Todo lo que está acá se midió;
> lo que no se pudo medir se dice.

---

## 1 · El lienzo que sigue a su recuadro (commit 1)

**El defecto que el médico describió —las etiquetas despegándose del dibujo— se reprodujo, y la
causa es de una línea.** `cm3dInit` fijaba el ancho del renderizador **una vez**, al montar, y lo
volvía a fijar **sólo** en el oyente de `resize`. El recuadro del módulo cambia de ancho sin que
la ventana cambie —al abrir y cerrar el esquema de circulación, al pasar de «Explorar» a «Según
el estudio», al plegar un panel—, y ahí el lienzo quedaba con el ancho viejo mientras las
etiquetas, que se proyectan con la cámara, se calculaban con el nuevo.

| Pieza | Qué hace |
|---|---|
| `let rw = W` | El ancho que el renderizador **tiene puesto**, recordado |
| el reajuste por cuadro | Compara `host.clientWidth` con `rw` y, **sólo si cambió**, rehace el tamaño, el aspecto de la cámara y su matriz |
| `rw = w2` en el oyente de `resize` | Pone al día lo recordado también por ese camino |

⚠️ **LAS DOS MITADES HACEN FALTA Y TIENEN SU MUTACIÓN SEPARADA** (`M01` y `M02`): sin el reajuste
por cuadro el defecto vuelve entero; sin el `rw = w2` el oyente de `resize` deja lo recordado
desactualizado y el cuadro siguiente «corrige» un ancho que ya estaba bien, con un reajuste de
más en cada cuadro.

**El campo de frecuencia** (`input.cm3d-fcin`) pasa a 78 px con `flex:0 0 78px`. La regla es
`input[type=number]`, o sea especificidad (0,1,1), y la de la clase (0,1,0): sin el selector de
elemento, la regla de la clase **pierde** contra la que da el ancho a todos los campos numéricos.

---

## 2 · «Explorar» en tres zonas (commit 2)

`#cm3d-shell` es una rejilla con **tres cortes sobre la ventana**, y los dos de arriba se
midieron en vez de elegirse:

| Ancho | Reparto |
|---|---|
| menos de 560 px | una columna: todo apilado |
| 560 a 1259 px | dos columnas, con el centro a todo el ancho y **primero** (`order:-1`) |
| 1260 px o más | `230px minmax(200px,1fr) 230px`: Base · dibujo · Se suma |

⚠️ **EL CORTE DE TRES COLUMNAS ES 1260 px Y NO 1200, Y LO DECIDIÓ LA MEDICIÓN.** Las dos zonas
laterales piden 230 px cada una, los dos huecos 12 px y el cuerpo de la sección descuenta su
relleno: a 1200 px la columna central quedaba por debajo del piso de 200 px que esta casa usa.
A 1260 da 205 px.

- **La barra de herramientas va en UNA fila** (`.cm3d-tb`, flex con `flex-wrap`): los dos modos
  en un segmentado, la vista de frente, la pausa, «Por dentro», «Nombres», la frecuencia corta,
  el botón del PDF y el globo.
- **Los botones finos se ven en 30 px y se tocan en 44** (`.cm3d-chip`), y el área la da un
  `::after` **absoluto** y no un margen negativo: un margen de −7 px taparía 7 px del control de
  arriba y del de abajo. Es el patrón de `.pac-id-mk` y de la fila de miniaturas.
- **Las combinaciones van DEBAJO del dibujo**, dentro de la zona central (`#cm3d-cbw` dentro de
  `#cm3d-mid`), con su sigla en el botón (`CM_PRESSG`) y el nombre completo en el `title`.
- **La tabla lateral de PANT-12 se retiró**, y con ella sus filas de botones grandes.

**El esquema de circulación** (`cmSchRender`, `#cm3d-sch`) abre desde el botón de la esquina del
dibujo y se pone **al lado** desde 760 px de ancho de ventana. `cmSchRender(forzar)` acepta un
argumento porque **sale temprano cuando su caja está `hidden`**: sin él, rasterizarlo para el PDF
devolvía una imagen **100 % blanca**.

---

## 3 · «Incluir en el PDF» del corazón maestro (commit 3)

El botón es `#cm3d-pdfb` y su aviso `#cm3d-pdfn`. `cmPdfSync` decide, **en este orden**:

1. en «Explorar» → **apagado**, porque lo explorado es didáctico y no es un dato del paciente;
2. sin nada cargado → **apagado**;
3. con una **transposición** cargada → **apagado**, porque esa sección conserva su propio botón
   (su dibujo no se retiró: ver § 4) y encender los dos llevaría el **mismo** dibujo dos veces;
4. si no → habilitado, con su rótulo y su `aria-pressed`.

⚠️ **EL PDF LLEVA LA VERSIÓN DEL ESTUDIO AUNQUE SE ESTÉ EXPLORANDO OTRA COSA.** La captura la
toma `_cmCapturaDelEstudio`, que pone el estado del estudio, dibuja, captura y devuelve el estado
anterior. Sin eso, un médico que explora una combinación didáctica y toca el botón se lleva **esa**
al informe firmado.

- **`_cm3dCaptura`** compone el lienzo WebGL **más las etiquetas** en un canvas 2D: sin eso el PNG
  sale sin un solo rótulo. El motor lleva `preserveDrawingBuffer:true`, porque sin él
  `toDataURL` devuelve un PNG **en blanco** en cuanto el navegador limpió el buffer.
- **El diagrama entra en `PDF_DIAG_REG`** como `{k:'cm3d', w:1, fam:'cc'}`, o sea media franja y
  familia de congénitas, y va **detrás** del esquema 3D de la transposición.
- **Ningún campo guardado nuevo**: el prefijo del módulo es `cm3d-`, con guión MEDIO, y ya está en
  las tres listas paralelas desde PANT-12.

---

## 4 · La transposición como SEXTA anatomía de base (commit 4)

`CM_BASES` gana `['tga','Transposición de grandes arterias']`, con **cinco** variantes
(`CM_BVARS.tga`) y **dos** casillas por variante (`CM_BCK.tga_*`).

**NO SE PORTÓ LA GEOMETRÍA DE LA DEMO: se llama a `tga3dEscena`**, que es la función que el 3D de
la transposición ya usa, a través de `_cmEscenaTGA` y del traductor `CM_TGA_VAR`:

| Variante del módulo | Lo que recibe `tga3dEscena` |
|---|---|
| `d` | `dtga` sin cirugía |
| `jat` | `dtga` + `jatene` |
| `mus` | `dtga` + `auricular` |
| `ras` | `dtga` + `rastelli` |
| `cc` | `ltga` |

Así la equivalencia que el punto 4d exige es **exacta por construcción** y no por comparación: el
día que un corte de la transposición cambie, cambia en los dos dibujos a la vez.

**Las reglas de compatibilidad** están portadas tal cual de la demo v13: la d-TGA admite las tres
comunicaciones y la cava izquierda; el Jatene admite todo menos el Eisenmenger; y el switch
auricular, el Rastelli y la ccTGA sólo admiten la cava izquierda —en el Rastelli la CIV **ya es**
el túnel—.

⚠️ **EL DIBUJO DE LA PESTAÑA NO SE RETIRÓ, Y ES LA CONDICIÓN QUE LA ORDEN PONE.** La equivalencia
escena por escena dio **46 diferencias sobre 160**, todas de una sola causa medida: las reglas de
compatibilidad de la demo son **más estrictas** que las que el 3D de la transposición aplica hoy,
así que hay escenarios que el módulo apaga y la pestaña dibuja. Retirar el recuadro perdería esos
escenarios. Declarado en `docs/PENDIENTES.md` → **P13-c**.

⚠️ **Y `CC3D_PROPIO` QUEDÓ VACÍO**: la línea de abajo ya no dice que la transposición «tiene su
propio diagrama», porque hoy el módulo **la dibuja**; entró a `CC3D_DIBUJA`.

---

## 5 · Masas: la tabla cerrada y los textos neutros (commit 5)

- **La tabla «Cómo distinguirlas (referencia)» nace cerrada**, con el **mismo** mecanismo que
  «Patrones de Strain» del SGL —`igToggleAcc`, un botón con `aria-expanded`, su flecha
  `.igacc-chev` y el cuerpo con `display:none`—. El estado abierto **no se guarda**.
- ⚠️ **EL GLOBO QUEDA FUERA DEL BOTÓN** y no dentro: un botón dentro de otro es marcado inválido
  que el navegador reparenta —lo que PANT-9 midió con el globo del título de un acordeón— y,
  además, abrir la ayuda cerraría la tabla. Medido: el globo abre y la tabla **sigue abierta**.
- ⚠️ **FALTABA UN `</div>`**, que es el defecto que PANT-11 pagó: el div nuevo del cuerpo consumía
  el cierre del contenedor. Se detectó por **balance de etiquetas**, no leyendo.

**La regla nueva de este archivo —«Ningún texto habla mal de las guías»— nació acá**, y su censo
se hace **en el navegador y no por grep**: un grep sobre el archivo marcó 864 líneas y la enorme
mayoría eran **comentarios**. La sonda es `scripts/_probe_pant13neutro.mjs`. Medido: Masas pasó de
**cinco apariciones a cero** y el resto de la app de **treinta textos distintos a seis**; los seis
que quedan **no caen** bajo la regla y están en **P13-a**.

---

## 6 · El pulmón: puntitos y su botón de PDF (commit 6)

**El broncograma aéreo se dibuja en PUNTOS y no en líneas.** Las cinco rutas de `PUL_D_BRONINF`
se leen con una expresión regular que saca sus dos extremos, se interpolan con paso
`PUL_D_BRON_PASO` (7 unidades) y cada muestra es un `<circle>`. El radio decrece con el orden del
bronquio —**2.1** el primero y **1.5** los demás—, igual que el grosor que tenían las líneas.

⚠️ **SIGUEN RECORTADOS POR EL BLOB de la consolidación**: el grupo lleva su `clip-path`, así que
un punto fuera de la mancha no se ve. Con «sin» o «fluido» no se dibuja ninguno.

**El botón del PDF** es `#pul-dib-pdf-toggle` con el campo oculto `pul_dib_pdf`, y sigue el molde
de los otros cuatro toggles de diagrama de la app (`contr_be_pdf`, `sgl_be_pdf`, `vab_pdf`,
`ete_qx_pdf`): `pulDibPdfOn` / `pulDibPdfSync` / `togglePulDibPDF` / `pulDibPdfRaster` /
`pulDibPdfData`, con `PUL_DIB_PDF_AR = 560/440` y su entrada `{k:'puldib', w:1, fam:'pul'}` en
`PDF_DIAG_REG`.

⚠️ **`PUL_DIB_PDF_AR` ES ALTO/ANCHO Y NO ANCHO/ALTO**, y la primera versión lo tenía invertido:
`_pdfTile` multiplica el ancho por `ar` para sacar el alto, así que la imagen salía **82 × 64**
donde tenía que salir **50 × 64**.

**`pulDibPdfSync` está en `RECALC_MODULOS`** y `limpiarCampos` vacía el campo, así que el estado
no se filtra al paciente siguiente.

---

## 7 · Las variantes anatómicas en grilla compacta (commit 7)

`.otr-var-grid` reparte las **siete** variantes en **una** columna por omisión, **dos** desde
560 px y **tres** desde 900 px; cada `.otr-var-celda` lleva su rótulo de 44 px de alto mínimo y,
por debajo, su «Detalle (opcional)».

**El detalle aparece sólo cuando hace falta**, y lo decide `otrVarNotaSync`:

```
const hay = !!c.checked || String(n.value || '').trim() !== '';
n.style.display = hay ? '' : 'none';
```

⚠️ **LA SEGUNDA MITAD DE LA CONDICIÓN NO ES DE ADORNO**: un estudio viejo puede traer el detalle
con la casilla apagada, y esconderlo ahí sería **perder el dato de vista**. Y la función **sólo
muestra y esconde**: no escribe ni borra nada.

⚠️ **ITERA `OTR_VAR_IDS` Y NO `OTR_HALL`, Y ESO LO CAZÓ UN CASO VIEJO.** La primera versión
recorría el registro entero —nueve entradas— y escondía también las notas del **aneurisma del
septum** y de la **circunfleja retroaórtica**, que no son variantes. Lo encontró **TC-499 (g6)**.
La mutación `M34` lo reintroduce y la mata **TC-692 (E1)**.

⚠️ **LA CAVA IZQUIERDA SIGUE SIN CAJA DE DETALLE** —sería otro campo guardado— y sin globo, por
pedido del médico: la explicación necesita una lectura de la biblioteca que todavía no está.
Declarado en **P13-b**. Está igual en `OTR_VAR_IDS`, porque la función pregunta por la caja antes
de tocarla.

---

## 8 · Las trampas de medición que esta tanda pagó

| Trampa | Síntoma | Qué la cierra |
|---|---|---|
| **Exponer un `const` ANTES de declararlo** | «Cannot access `_T3` before initialization» en otra función, 1.400 líneas más abajo, y el bloque de script entero sin inicializar | Exponerlo **después** de su declaración; una sonda que cuenta errores de página |
| **`page.evaluate` con una CADENA descarta el argumento** | La sonda leía `undefined` en los dos árboles y dos resultados vacíos comparaban iguales | Inyectar los datos con `addScriptTag` |
| **El template de una sonda sin su `})()`** | `evaluate` devuelve `undefined` | Invocar la IIFE |
| **Acentos graves en mis propios comentarios** | El template del caso deja de cerrar, con un error que apunta decenas de líneas antes | `node --check` y **contar** los acentos graves del cuerpo de cada caso |
| **Denominadores vacíos** | El lienzo de la TGA en 0 px, la tabla de masas en 0 px, la sección de variantes en 0 px | Abrir la pestaña **y** el acordeón —y la sub-pestaña va por `ccSubTab`, no por `showTab`— |
| **La demo comparada sin serializar en el navegador** | 36 de 36 escenarios «distintos» | Construir un `<svg>` real del DOM |
| **`ar` invertido** | La imagen del pulmón en 82 × 64 | `ar` es **alto/ancho** |
| **El esquema rasterizado en blanco** | PNG 100 % blanco | `cmSchRender(forzar)` |
| **Un `</div>` de menos** | El DOM queda balanceado y el bloque cierra antes de tiempo, sin síntoma visible | Balance de etiquetas |

---

## 9 · Lo que esta tanda NO hizo

- **El dibujo de la transposición en su pestaña no se retiró** (→ **P13-c**), con sus 46
  diferencias medidas.
- **El globo de la cava superior izquierda persistente** sigue sin escribirse (→ **P13-b**).
- **Los seis textos que quedan** fuera de la regla nueva, uno por uno (→ **P13-a**).
