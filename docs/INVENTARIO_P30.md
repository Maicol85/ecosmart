# INVENTARIO P30 — Documentos del Informe y Prótesis valvulares en el Laboratorio

Solo lectura. Medido sobre el árbol de cierre de **PANT-29**: HEAD = `origin/main` =
`41d9c1d`, `index.html` con **170.019 líneas / 12.397.649 B (12,40 MB)**, md5 **`6aa22c01`**,
sello **`v20261110-0034`**. Los tres coinciden con lo que `CLAUDE.md` publica, y el sello del
pie (`#eco-build-sello`, línea 167154) coincide con el publicado.

Cada punto marca si la hipótesis de la orden quedó **CONFIRMADA** o **FALSA**.

---

## a) La pantalla del Informe

### «Regenerar informe» — ⚠️ HIPÓTESIS FALSA en la forma del nombre

No existe la cadena «Regenerar informe». El botón se llama **«🔄 Regenerar Informe»**, con
I mayúscula (línea 25025). Está en la fila de acciones al pie de la tarjeta
**«✅ En Suma / Conclusión»**, que es la segunda tarjeta de la columna izquierda del Informe:

```
<div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
  🔄 Regenerar Informe   (btn-primary, generarInformeConEvolucion())
  ⬇️ Exportar PDF        (btn-green,   generarPDF())
  💾 Guardar Informe     (btn-save,    guardarInforme())
  🔀 Modo comparativo    (btn-ghost,   abrirModoComparativo())
</div>
```

Esa fila es el lugar donde cae «Documentos ▾»: es la única fila de acciones del Informe y ya
tiene `flex-wrap`, así que un quinto botón baja de renglón en pantalla angosta sin romper nada.

Arriba de esa fila está `#inf-min-fila`, la fila de miniaturas de lo que va al PDF, que nace
con `display:none` y la gobierna `infMinPintar()`.

### Cómo se guarda una imagen, y las DOS listas del registro

| Base | Store | keyPath | Qué guarda |
|---|---|---|---|
| `ceibomed_img` | `imagenes` | `uuid` | `{uuid, imgs[], esqs[], bytes, ts}` |

- **`imgs`** son los SLOTS del formulario: lo que el médico importó o capturó, **lo que el PDF
  imprime** y lo que ofrece el selector del PPT.
- **`esqs`** son los ESQUEMAS: no ocupan lugar en la grilla, **no se imprimen**, no entran al
  PPT del estudio y nadie los elige. `CeiboImg.leer` devuelve **sólo `imgs`**, así que un
  esquema no llega a ninguna superficie firmada; la pantalla de «Imágenes guardadas» sí los ve,
  porque `igImgBlobs` concatena las dos listas.

**Un documento del informe pertenece a `esqs`**, por el mismo argumento: no es una captura del
estudio y meterlo en `imgs` lo imprimiría dentro del informe firmado.

API disponible (ya existe, no hay que crear nada):

| Función | Línea | Qué hace |
|---|---|---|
| `esqRasterizar(svgTxt, ancho, alto)` | 114687 | SVG → `<img>` → canvas → **JPEG 0,9**, fondo opaco blanco, reloj propio de 8 s. Pasa el marcado por `esqSvgParaRaster` para resolver las `var()` de CSS. |
| `esqGuardarComoImagen(clave, nombre, svgTxt, ancho, alto)` | 114722 | rasteriza y guarda. Devuelve `{ok, motivo}` y **no tira**. |
| `esqGuardarDataURL(clave, nombre, dataURL)` | 114751 | el mismo guardado con la imagen ya hecha. |
| `CeiboImg.guardarEsquema(uuid, clave, dataURL, nombre)` | 117638 (vecina) | escribe. **Identifica por `clave` y REEMPLAZA** → una sola copia por estudio = «actualizar» gratis. |
| `CeiboImg.borrarEsquema(uuid, clave)` | 117638 | retira → «quitar». |
| `CeiboImg.esquemas(uuid)` | — | lista → «reabrir». |

⚠️ **El guardado tiene TRES compuertas y las tres pueden negar**, con el motivo escrito:
1. `typeof CeiboImg === 'undefined'` → «sin almacenamiento».
2. `imgGuardadoActivo()` falso → el estudio no guarda imágenes; la casilla es «Guardar imágenes
   con los estudios», en ⚙️ Config → «🖼️ Imágenes del estudio», y **de fábrica está apagada**.
3. `_imgUuidActual` nulo → «el estudio todavía no está guardado».

Consecuencia para A1: la opción puede estar SIEMPRE activa, pero **«Guardar en Imágenes» tiene
que decir el motivo cuando no puede**, que es la regla que `#oai-esq-estado` ya aplica.

### Cómo se imprime UNA SOLA parte de la pantalla — ⚠️ HIPÓTESIS DE MÉTODO

**Esta app no usa `window.print()`.** El comentario de `amiloImprimirPDF` (línea 124706) lo
declara textualmente: «NO usa window.print() (capturaba la interfaz entera)». El patrón de la
casa es **generar un PDF propio con jsPDF**, con su encabezado de paciente, su firma y su pie.
Hay un solo `window.print` en todo el archivo y es ese comentario; los cuatro `@media print`
que existen sólo apagan overlays.

Eso es además lo que hace medible el formato de A4: márgenes en mm, cuerpo e interlineado en
pt, justificado y conteo de hojas se fijan en jsPDF, no en el CSS del navegador.

---

## b) Los datos disponibles

| Dato | De dónde sale | Observación |
|---|---|---|
| Paciente | `#nombre` (texto, «Apellido, Nombre») | campo del estudio |
| Fecha | `#fecha` (`input[type=date]`) | el día se toma de `new Date()` para los documentos |
| Edad | `#edad` | |
| Sexo | `#sexo` → `''` / `'M'` / `'F'` | **tres estados**: el vacío es el que da «el/la paciente» |
| Tipo de documento | `#doc_tipo` → `CI` / `DNI` / `CPF` | **CONFIRMADO**: los tres existen, en un `<select>` |
| Nº de documento | `#ci` | el marcador `#pac-id-mk-ci` decide si se imprime |
| Institución | `sv('med-centro')` y `centroStr` (línea 77076) | `cTipo+': '+cNom`; en modo institucional el encabezado **nunca** cae a «CeiboMed» |
| Logo | `localStorage['logo_centro_' + (localStorage['centro_tipo_activo'] \|\| 'default')]` | dataURL, validado por `LOGO_DATA_OK`; puede no existir |
| Ciudad | `#cfg-med-lugar` / `#med-lugar` («Ciudad / Lugar») | **con casilla de inclusión** `cfg-med-lugar-on`; es opcional y puede estar vacía |
| Médico (nombre y matrícula) | `ecoGetMedicos()[ecoGetMedPrincipal()]` → `{nombre, matricula}`, y `firma_centro_<centro>` → `{nombre, cjpp}` | el nombre y la matrícula que firman salen del médico **Principal** de ⚙️ Config → Médicos |
| Especialidad | `#cfg-med-especialidad` | opcional, con casilla |

⚠️ **No existe un campo «título» del médico** (Dr./Dra.). El «título» del que habla A2 y la
tabla de firmas tiene que salir del propio `nombre` del médico Principal, que es texto libre y
puede ya traerlo escrito. No se inventa ninguno: si el nombre no lo trae, la línea sale con el
nombre tal cual.

### Nombre de cada tipo de estudio — ⚠️ HIPÓTESIS FALSA

La orden habla de «nombre de cada tipo de estudio» como si hubiera un catálogo. **No lo hay.**
La app tiene **una sola casilla booleana**, `#ete-es-ete` (línea 13836), y de ella derivan los
**dos** únicos nombres de estudio del archivo (línea 77260):

- sin marcar → **«Informe Ecocardiograma Doppler Color»** (transtorácico)
- marcada → **«Ecocardiograma Transesofágico»**

No hay tipo «eco de estrés»: su código vive en el archivo **sin interfaz** (ver
`docs/mapa/eco-estres-inventario.md`), así que no hay un estudio que lo sea. El test de
burbujas **no es un tipo de estudio**: es un módulo dentro del estudio (`#fop_*`,
`fop_contraste` / `fop_burbujas`).

Eso encaja con A1: no hay consentimiento de ETT ni de eco de estrés, y la constancia sirve para
todos. Para la constancia, el estudio se nombra **«un ecocardiograma transtorácico»** o
**«un ecocardiograma transesofágico»** según esa casilla — en minúscula y con artículo, que es
lo que la frase pide; el título en mayúscula del PDF es otra cadena y no se toca.

---

## c) El Laboratorio

### La subpestaña «Mediciones» y dónde termina «Valvulopatías»

`#lab-sub-mediciones` ocupa las líneas **26707–26897**. Sus tarjetas, en orden:

| Orden | Tarjeta | `data-ppt` | Líneas |
|---|---|---|---|
| 1 | 📊 Función sistólica y diastólica | `funcion` | 26710–26730 |
| 2 | 📉 Strain global longitudinal (SGL) | `sgl` | 26734–26746 |
| 3 | 🎯 Contractilidad Segmentaria — Población | `contractilidad` | 26749–26757 |
| 4 | 📐 Geometría VI | `geometria` | 26760–26765 |
| 5 | 🫀 Volumen AI indexado | `volai` | 26768–26774 |
| 6 | 🫀 Función VD (TAPSE) | `vd` | 26777–26783 |
| 7 | 🫁 Hipertensión pulmonar (PSAP) | `htp` | 26786–26792 |
| **8** | **🫀 Valvulopatías** | `valvulas` | **26795–26837** |
| 9 | 🔺 Doppler tricuspídeo… | `doptric` | 26840–26849 |
| 10 | 🫀 Morfología y etiología valvular | `etiologias` | 26852–26859 |
| 11 | 📈 Estadística descriptiva | `descriptiva` | — |
| 12 | 💚 Strain Manual | `data-ppt-no` | — |

**«Valvulopatías» termina en la línea 26837** y el lugar para la sección nueva es
**entre la 26837 y la 26839**, antes de «Doppler tricuspídeo». B1 queda **CONFIRMADO**: hay un
lugar claro.

Molde de una tarjeta (hay que respetarlo entero):
```
<div class="lab-card" data-ppt="<clave>">            <- o data-ppt-no="<motivo>"
  <div class="lab-card-hdr lab-acc-hdr" role="button" tabindex="0" aria-expanded="false"
       aria-controls="lab-acc-<k>" onclick="labAccToggle('lab-acc-<k>',this,event)"
       onkeydown="labAccTecla(event,'lab-acc-<k>',this)">TÍTULO
       <span id="lab-acc-<k>-arrow" style="float:right;...">▶</span></div>
  <div class="lab-card-body lab-acc-body" id="lab-acc-<k>" style="display:none;"> … </div>
</div>
```

⚠️ **`_labPptAssertClaves()` (línea 153954) exige `data-ppt` o `data-ppt-no` en TODA
`.lab-card`.** Y `data-ppt` significa *«esta tarjeta es una diapositiva del PPT»*: ponérselo a
la sección nueva **agregaría una diapositiva al PPT**, que la verificación de esta tanda exige
que no cambie. La sección nueva lleva **`data-ppt-no`** con su motivo, igual que la tabla de
Strain Manual.

### Con qué mecanismo se dibujan los gráficos

Dos mecanismos, los dos vivos en esta subpestaña:

1. **`labBarras(containerId, datos, mode)`** (línea 145389) — el de las barras. Recibe
   `[{lbl, n, total, color}]`; el ancho es `n/max` del conjunto y el texto de la derecha es
   `n/total` en porcentaje, o `n/total (p%)` con `mode === 'fraction'`. Sin datos escribe
   `<div class="lab-empty">Sin datos</div>`. Escapa el rótulo con `escHtml`. El contenedor es un
   `div.lab-bar-wrap`.
   **No hace barras apiladas**: cada fila tiene un solo relleno.
2. **Chart.js** — `#lab-valv-chart` dentro de la propia tarjeta de Valvulopatías, en un
   contenedor de `height:300px`, con `labDestroyChart` para no acumular instancias. Chart.js ya
   está cargado por CDN **con su hash SRI**. Es el mecanismo de las **apiladas**, y la propia
   sección de Valvulopatías lo usa para su «Distribución de severidad por valvulopatía».

Para B3.2 (barras apiladas por posición) el mecanismo de la casa es por tanto **Chart.js
apilado y horizontal**, hermano del que ya vive en la tarjeta de arriba; para B3.1, B3.3 y B3.4
alcanza `labBarras` y el molde de tabla.

### El PDF de auditoría y dónde queda Valvulopatías en él

`labGenerarPDF()` — línea **162027**, `async`. Helpers internos: `sectionTitle`, `sectionTable`,
`drawTable`, `sectionChart(title, headers, rows, chartSpec)`, `_pie(base, txt)`, `ensure(n)`,
`_labCel(n, t)`, `_pc(n, t)`, con `y` corriendo, `M` de margen, `W` de ancho y
`CONTENT_BOTTOM`. El pie de cada hoja lo pone `_labPdfPie(doc, extra)` (161996) y su alto lo
reserva `_labPdfPieAlto` (161987).

**Valvulopatías es la sección 9**, líneas **162543–162656**:
`sectionTitle('Valvulopatías — distribución de severidad')` → subtítulo con el denominador →
gráfica apilada como PNG por **`_labValvChartPng(infs)`** (`doc.addImage`, 170 mm de ancho) →
seis mini-tablas en grid de dos columnas (`miniValv`, `valvColW = 86`, `valvGap = 8`) → un
`_pie` con la válvula significativa más frecuente.

La sección **10 es «Función VD (TAPSE)»**, desde la línea 162658. El lugar de la sección nueva
en el PDF es **entre la 162656 y la 162658**, que es «justo después de Valvulopatías» como pide
B5.

### d) ¿Cuál es el mecanismo del PNG de un gráfico en el PDF?

`_labValvChartPng(infs)` devuelve `{url, ar}` y se inserta con `doc.addImage(..., 'PNG', ...)`.
Es el camino para la apilada de la sección nueva: mismo tratamiento de gráficos que el resto
del PDF, que es lo que B5 pide.

---

## d) Los datos de prótesis y reparaciones

### Posiciones y tipos — qué tiene la app DE VERDAD

Cuatro `<select>` de morfología, uno por válvula. **El `value` no siempre es el rótulo**: las
dos opciones protésicas llevan `value` explícito y las demás no.

| Campo | Posición | Opciones protésicas (value) | Reparación | Otras |
|---|---|---|---|---|
| `va_morf` | aórtica | `Prótesis biológica` (rótulo «Prótesis biológica (SAVR)»), `Prótesis mecánica` (rótulo «… (SAVR)»), **`TAVI`** | **ninguna** | Trivalva normal, Bicúspide, Calcificada, Reumática, Endocarditis, Carcinoide |
| `vm_morf` | mitral | `Prótesis biológica`, `Prótesis mecánica` | **`Plastia mitral`**, **`TEER mitral`** | Normal, Mixomatosa / Barlow, Calcificada, Reumática, Prolapso / EVMS, Endocarditis, Isquémica |
| `vt_morf` | tricúspide | `Prótesis biológica`, `Prótesis mecánica` | **`Plastia tricuspídea`**, **`TEER tricuspídeo (T-TEER)`** | Normal, Mixomatosa, Reumática, Carcinoide, Endocarditis, Funcional / dilatación VD |
| `vp_morf` | pulmonar | `Prótesis biológica`, `Prótesis mecánica` | **ninguna** | Normal, Displásica (congénita), Reumática, Carcinoide, No especificada |

**Dueño del predicado**: `VALV_PROT_OPCIONES = ['Prótesis biológica', 'Prótesis mecánica',
'TAVI']` (línea 71683, congelado) y `valvEsProtesis(val)` (71684). Los dos están en `window`.
`PROT_SIN_GRADO_VALVS = ['vm_morf','vt_morf','vp_morf']` (41132) — la aórtica **sí** gradúa
sobre prótesis.

⚠️ **Ajustes a las hipótesis de B3.2**:
- «TAVI (solo aórtica)» → **CONFIRMADO**.
- «las reparaciones (plástica, TEER)» → **sólo mitral y tricúspide**. La **aórtica y la
  pulmonar no tienen ninguna opción de reparación**, así que su barra no puede llevar ese tramo.
- La pulmonar tampoco tiene TAVI: sus únicos tipos son biológica y mecánica.

### El catálogo de modelos — **108 CONFIRMADO**, contado modelo por modelo

| Constante | Tabla ASE 2024 | Posición | Modelos | Tipo declarado en el catálogo |
|---|---|---|---|---|
| `PROT_CAT_A4` | A4 | aórtica quirúrgica | **49** | 19 `mec`, 20 `bio`, **10 vacío** |
| `PROT_CAT_TAVI` | A1/A2/A3 | aórtica transcatéter | **9** | 9 `tavi` (4 con `viv:1`) |
| `PROT_CAT_A5` | A5 | mitral | **30** | 12 `mec`, 15 `bio`, **3 vacío** |
| `PROT_CAT_A7` | A7 | tricúspide | **12** | 3 `mec`, 1 `bio`, **8 vacío** |
| `PROT_CAT_A9` | A9 | pulmonar | **8** | 3 `mec`, 5 `bio` |
| `PROT_CAT_A8` | A8 | (referencia × situación) | **0** | sin modelos y **sin consumidor** (P20-b) |
| | | **TOTAL** | **108** | |

Forma de una entrada: `{n:'<nombre>', d:'<descripción>', t:'mec'|'bio'|'tavi'|'', viv?:1,
f:'<folio>', s:[[tamaño, pico, medio, eoa, ...], …]}`.

⚠️ **21 de los 108 modelos tienen `t:''`**, o sea el catálogo no dice su tipo. Para la columna
«tipo» de la tabla de modelos de B3.3 el tipo **tiene que salir del `*_morf` del estudio** —que
es lo que el médico eligió— y no de `t`, o 21 modelos saldrían sin tipo.

Elección de catálogo: `VMOD_TABLA = { va:'PROT_CAT_A4', vm:'PROT_CAT_A5', vt:…, vp:… }`
(línea 73745), con la aórtica cambiando a `PROT_CAT_TAVI` cuando la morfología es TAVI.

### Qué es campo guardado y qué es sólo texto del informe

**Campos guardados** (viajan con el estudio y salen al Excel), cuatro por posición, de
`VMOD_POS[*].campos` (línea 73641):

| Posición | modelo | tamaño | gradiente de referencia | área de referencia |
|---|---|---|---|---|
| aórtica | `va_prot_modelo` | `va_prot_tam` | `va_prot_gmref` | `va_prot_eoaref` |
| mitral | `vm_prot_modelo` | `vm_prot_tam` | `vm_prot_gmref` | `vm_prot_eoaref` |
| tricúspide | `vt_prot_modelo` | `vt_prot_tam` | `vt_prot_gmref` | `vt_prot_eoaref` |
| pulmonar | `vp_prot_modelo` | `vp_prot_tam` | `vp_prot_gmref` | `vp_prot_eoaref` |

Más los cuatro `*_morf` (posición y tipo) y las medidas de cada válvula, que ya existían.

**⚠️ LA CONCLUSIÓN NO ES UN CAMPO GUARDADO. ÉSTE ES EL HALLAZGO CENTRAL DE LA TAREA 0.**

Los cuatro evaluadores de prótesis **leen el DOM**:
- `eaProtVeredicto()` (74483) y `eaProtNarrativa(P)` (74767) — aórtica
- `vmProtEOA()` (72644) y `vmProtObstrCrit()` (72605) — mitral
- `vtProtObstr()` (58097) y `vtProtObstrCrit()` (58159) — tricúspide
- `vpProtObstr()` (55730) y `vpProtObstrCrit()` (55762) — pulmonar

Todos empiezan por `document.getElementById(...)` y clasifican con los valores de la pantalla.
**El Laboratorio corre SIN DOM**: `_labExcelRow` «deriva todo de `inf.campos`», y este mismo
archivo ya documenta la trampa — un predicado que lea `sv('va_morf')` «bandearía la fila del
Excel contra el paciente que está en pantalla».

Por lo tanto la sección nueva **no puede llamar a ningún evaluador de prótesis**, y
reimplementarlos sin DOM sería un **segundo dueño del mismo veredicto clínico**, que esta casa
prohíbe explícitamente.

Lo que SÍ está guardado es el **texto que esos evaluadores escribieron**: `informe_texto` y
`en_suma` viajan con el estudio. Y el Laboratorio **ya clasifica por texto del informe** con
detección de negación: `_labMenciona(txt, re)` + `_LAB_NEG_RE` (línea 145436), que es lo que
hace hoy con la geometría del VI, el grado diastólico, los hallazgos frecuentes y los casos de
docencia. La propia pantalla lo declara: «La geometría y el grado diastólico se leen del texto
del informe con detección de negación».

**Decisión de diseño que se deriva de esto**: los TRASTORNOS de B3.4 se cuentan sobre el texto
guardado, buscando **las frases literales que la app misma emite** —no categorías nuevas— y con
las categorías mutuamente excluyentes y evaluadas de la más específica a la más general, por la
misma razón que `LAB_EM_CAT`: «sin criterios de estenosis protésica» **contiene** «estenosis
protésica».

### Lista COMPLETA de conclusiones posibles

**Aórtica** — `eaProtNarrativa`, según `P.nivel` (tablas `F` y `R`, línea 74804):

| Estado | Frase del cuerpo | Resumen del EN SUMA |
|---|---|---|
| `normal` | `sin criterios de estenosis protésica` + medidas | `sin criterios de estenosis protésica` |
| `posible` | `con posible estenosis protésica` + medidas | `posible estenosis protésica` |
| `signif` | `con criterios que sugieren estenosis protésica significativa` + medidas | `criterios que sugieren estenosis protésica significativa` |
| `faltan`, con un eje dependiente en rango y sin eje independiente | `EA_PROT_POSIBLE_SD.frase` → **«con posible estenosis»** | su propio resumen |
| `faltan`, el resto | `sin datos suficientes para graduar la estenosis protésica` | **nulo** (el EN SUMA no dice nada) |
| sin ningún dato que indique estenosis **ni** insuficiencia | **`normofuncionante`** + medidas | `normofuncionante` |

Más, en **oración aparte**, el desajuste protésico-paciente: `Desajuste protésico-paciente
aórtico <grado>`, y la salvedad de TAVI (`EA_PROT_SALV.tavi`).
Y, desde PANT-26, `con posible estenosis` cuando hay velocidad o gradiente altos sin eje
independiente.

**Mitral** — `vmProtEOA` publica valor y escala **por fila** y, desde PANT-26, **no concluye por
fila**: la conclusión queda en el resumen, que cuenta criterios. El desajuste sale como
`Desajuste protésico-paciente <…>` / `sin desajuste` (línea ~72700).

**Tricúspide** — `vtProtObstr` / `vtProtObstrCrit`, con **voto de dos o más** criterios:
`hallazgos sugestivos de estenosis` y, con uno solo, `hallazgo aislado, sin veredicto`.

**Pulmonar** — `vpProtObstr` / `vpProtObstrCrit`: **tres estados que no gradúan** (ver
`docs/mapa/protesis-tri-pulm.md`).

⚠️ **«Sin datos suficientes» es sólo de la AÓRTICA.** La auditoría AUD-PROT ya lo midió y está
escrito en `CLAUDE.md`: «la mitral, la tricúspide y la pulmonar no escriben nada cuando no
concluyen». B3.4 pide que «Sin datos suficientes» vaya aparte — se puede, pero el denominador
honesto de esa barra son **las prótesis aórticas**, no todas.

---

## e) Cómo cuenta hoy el Laboratorio, y cómo filtra por período

- **Se cuentan ESTUDIOS**, no pacientes. `labGetInformes()` (línea 145345) →
  `_labFiltrarBase(getInformes(), false)`.
- **El período** sale de `#lab-periodo` (días, por omisión `365`) más `#lab-desde` / `#lab-hasta`
  cuando están cargados. `labGetInformesSinPeriodo()` es la variante que lo ignora.
- **Encima del período corren los filtros de cohorte**: `_LAB_COHORTE`, 29 controles
  (`coh-*`), que se aplican con el botón y se declaran en el cartel amarillo.
- **El denominador se nombra donde se imprime**, con dos funciones:
  `_labPobTxt()` → «en el período seleccionado» / «en la cohorte filtrada» y
  `_labPobDe()` → «del período» / «de la cohorte filtrada». Un rótulo pegado a un número usa
  una de las dos, nunca una cadena propia.
- **`labInit()`** (146227) es el único punto de repintado: toma `infs = labGetInformes()`,
  escribe `#lab-resumen-header` y, **con `n === 0`, vuelve temprano** después de vaciar dos
  listas de ids (una de `textContent = '—'` y otra de `innerHTML = 'Sin datos'`). La sección
  nueva **tiene que entrar en esa rama**, o con cero estudios quedaría mostrando el corte
  anterior — que es el defecto que esa misma rama documenta para `lab-espera-prom`.

---

## Resumen de hipótesis

| # | Hipótesis de la orden | Resultado |
|---|---|---|
| 1 | Hay un botón «Regenerar informe» | **FALSA en la forma**: es «🔄 Regenerar Informe» |
| 2 | Las imágenes se guardan con miniatura reabrible | **CONFIRMADA**, y el lugar correcto es `esqs`, con `esqGuardarDataURL` / `borrarEsquema` ya hechos |
| 3 | Se puede imprimir sólo una parte de la pantalla | **CONFIRMADA pero por otro camino**: con jsPDF, no con `window.print()` |
| 4 | Hay nombre de cada tipo de estudio | **FALSA**: hay **una casilla** y **dos** nombres |
| 5 | Documento CI / DNI / CPF | **CONFIRMADA**: `#doc_tipo` con los tres |
| 6 | Hay ciudad | **CONFIRMADA con reserva**: es «Ciudad / Lugar», opcional y con casilla de inclusión |
| 7 | Hay título del médico | **FALSA**: no existe campo de título; va dentro del nombre |
| 8 | Hay lugar claro debajo de Valvulopatías | **CONFIRMADA**: línea 26837, antes de «Doppler tricuspídeo» |
| 9 | El catálogo tiene 108 modelos | **CONFIRMADA**, contados: 49 + 9 + 30 + 12 + 8 |
| 10 | Tipos mecánica / biológica / TAVI y reparaciones | **CONFIRMADA con dos recortes**: TAVI sólo aórtica; reparación sólo mitral y tricúspide |
| 11 | La conclusión de cada prótesis se puede leer por posición | **FALSA como campo**: los cuatro evaluadores leen el DOM; lo guardado es el texto del informe |
| 12 | «Sin datos suficientes» es una conclusión de todas | **FALSA**: es sólo de la aórtica |
