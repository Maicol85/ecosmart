# Inventario de la tanda PANT-32 — solo lectura (2026-11-10)

Medido sobre `8967e5f` (cierre de PANT-31), sello **`v20261110-1327`**, md5 **`fcb65077`**,
172.247 lineas / 12.532.229 bytes. `HEAD` = `origin/main`, verificado.
**Este commit no toca `index.html`.**

La sonda es `scripts/_probe_p32inv.mjs` (nombre propio, verificado con `ls`: no existia). Corre
por CDP contra el Chrome del sistema, sirviendo la app por HTTP — en `file://` el origen es
opaco y no hay `localStorage`, asi que la institucion, el logo y el medico Principal saldrian
vacios y la medicion seria un denominador vacio.

---

## a) La pantalla Configuracion

| que | medido |
|---|---|
| donde esta | `<div id="tab-config" class="tab-section">`, linea **5783**. Se abre con el boton `⚙️ Config` de la fila de pestanias (linea 5745), que llama `showTab('config')` y despues `cfgOnShow()` |
| como se organiza | **OCHO** `<section class="cfg-card">`, cada una con un `<div class="cfg-sec-title">` como titulo. Sin ids salvo una (`cfg-card-orthanc`) |
| las ocho, en orden | 🏥 Institucion y firma · 🏥 Centros de trabajo · 👨‍⚕️ Medicos · 📄 Diseno del informe PDF · 🖼️ Imagenes del estudio · 🖥️ Modo de visualizacion · 🔌 Conexion por red (DICOM) · ✉️ Soporte y contacto — CeiboMed |
| el estilo de una fila | `<label style="display:flex;align-items:center;gap:9px;cursor:pointer;">` con un `input type=checkbox` de 16 px y un `<span style="font-size:12.5px">` con `<b>` adelante; debajo un `<p style="font-size:11px;color:var(--text2)">` explicativo. El modelo literal es la tarjeta «Imagenes del estudio» (lineas 5912-5924) |
| donde encaja «Documentos» | **despues de «Imagenes del estudio» y antes de «Modo de visualizacion»**: las dos de arriba son datos de la institucion y el papel, y las de abajo son el aparato (modo, DICOM, soporte). Es la vecina tematica del documento impreso |

> **HIPOTESIS DE LA ORDEN: confirmada.** Configuracion existe, se organiza en secciones con un
> estilo propio y admite una seccion nueva sin tocar ninguna de las ocho.

## b) Como guarda Configuracion, donde viven las imagenes, descarga y lectura de archivos

| que | medido |
|---|---|
| mecanismo | **`localStorage`**, siempre con `try/catch` en las dos puntas y `JSON.parse` verificando la forma. Sin excepcion medida |
| el precedente exacto para esta tanda | **`ecosmart_frases`** (`FRASES_KEY`, linea 60888): una lista de **textos escritos por el medico**, con `frasesLeer()` que filtra a cadenas no vacias y devuelve `[]` ante un valor corrupto, `frasesEscribir()` que devuelve `false` con la cuota llena y **no finge exito**, y `frasesRender()` que pinta con `escHtml`, indices por `data-*` y **un oyente delegado registrado una sola vez** |
| las otras claves de Config | `ett_theme`, `ett_view_mode`, `ett_modules`, `ett_modo_institucional`, `ett_pdf_plantilla`, `ett_estilo_informe`, `ett_filename_fmt`, `ett_qr_enabled`, `ett_color2`, `centro_tipo_activo`, `centro_nombre_activo`, `centro_label_*`, `logo_gallery`, `logo_centro_*`, `pdf_color`, `ecosmart_pdf_toggles`, `ecosmart_lab_ppt_chk`, `ecosmart_ppt_tema`, `firma_centro_<centro>` (`firmaKey()`) |
| que pasa al limpiar el navegador | **se pierde todo.** `localStorage` es por origen; no hay respaldo en disco ni en el backup de informes (`exportBackup` lleva estudios y medios, no la configuracion) |
| donde viven las imagenes | **IndexedDB**, por `CeiboImg`, en dos listas por estudio: `imgs` (las del estudio, las que el PDF imprime en «Imagenes del estudio») y `esqs` (los esquemas, por clave). `localStorage` guarda solo la preferencia (`IMG_CFG_KEY`) y la galeria de logos |
| descarga de archivos | **si**, y el mecanismo es siempre el mismo: `document.createElement('a')`, `a.href = URL.createObjectURL(blob)`, `a.download = '<nombre>.json'`, `a.click()` y `URL.revokeObjectURL` diferido. El modelo literal es `_bkExportar` (linea ~122930) con el nombre `ecosmart_<fecha>_<desc>.json`. El Excel del Laboratorio baja por XLSX; el PDF por `doc.save(nombre)` de jsPDF |
| lectura de archivos que el usuario elige | **si**: un `<input type="file" style="display:none">` con `accept`, un boton que le hace `.click()`, el `onchange` que pasa `this.files[0]` al lector y **`this.value=''`** a continuacion para que elegir el mismo archivo dos veces vuelva a disparar. Dentro, `FileReader` + `JSON.parse` en `try/catch` + un validador que rechaza el archivo **entero** antes de cargar nada (`validarInformeImportado`, `importarInformesJSON`, linea 123189) |

> **HIPOTESIS DE LA ORDEN: confirmada en las tres partes.** Y hay un precedente mejor que el
> supuesto: `ecosmart_frases` ya es «textos del usuario en el navegador», con el patron de
> lectura tolerante y escritura que no finge exito. Esta tanda lo copia en vez de inventar.

## c) Como se arman HOY los cuatro documentos

Todo el modulo vive en **`index.html` lineas 115139 a 116470**, en este orden: `DOC_GEO` (la A4
en milimetros) · `docSan` · `docDatos` · `DOC_CLAVES_AZUL` · `docSust` · `docMarcar` ·
`DOC_RAYA_RIESGOS` y `DOC_BENEFICIO` · `docDeclaracion` · `docHojasComunes` · `docEncConsent` ·
`docRiesgosCierre` · **`DOC_DEFS`** · `docMaquetar` · `docOpsAPdf` · `docOpsASvg` ·
`docBloquesNuevos` · el menu · la hoja · la imagen.

**Donde esta cada texto:** dentro de `DOC_DEFS[clave].bloques()`, como literales de cadena en una
lista de bloques. Los tres bloques compartidos salen de funciones: `docDeclaracion(procSin,
internacion)`, `docHojasComunes()` y `docEncConsent(sub)` mas `docRiesgosCierre()`.

**Como se dibuja cada parte.** `docMaquetar(def, D, bloques)` convierte la lista de bloques en
una lista de operaciones con sus coordenadas, y de esa **unica** lista salen el PDF
(`docOpsAPdf`) y la imagen (`docOpsASvg`). Los **diecisiete** tipos de bloque:

| tipo | que dibuja |
|---|---|
| `enc` | el encabezado: logo o iniciales a la izquierda y el nombre de la institucion centrado |
| `hr` | la raya debajo del encabezado |
| `tit` / `sub` | el titulo centrado y su subtitulo |
| `ciudadfecha` | la linea de ciudad y fecha a la derecha (solo la constancia) |
| `pacid` | la linea del paciente: nombre, documento, ciudad y fecha (solo los consentimientos) |
| `sec` | el titulo de seccion en azul `NAVY`, numerado salvo `nonum:1` |
| `p` | parrafo **justificado palabra por palabra**, calculado aca y no delegado a jsPDF |
| `pchk` | como `p`, pero **dibujando un cuadrado** donde el texto trae un U+2610 |
| `ul` | vinietas con sangria francesa de 4,2 mm; `fuerte:[...]` pone en negrita un prefijo literal; `aire:5` agrega 5 pt entre items |
| `raya` | el texto de «otros riesgos» mas la raya para escribir a mano |
| `chk1` | **una** casilla con su texto, a todo el ancho |
| `chk2` | una lista de casillas **en DOS columnas**, partida por la mitad (`its.slice(0,mitad)` a la izquierda) |
| `firma` | el bloque de firma del medico de la constancia |
| `tfirmas` | la tabla de firmas paciente / testigo / medico |
| `salto` | fin de hoja, si la hoja en curso tiene algo |
| `esp` | aire vertical en milimetros |

**Las operaciones** son `t` (texto a la izquierda), `c` / `r` (centrado / derecha), `tw` (linea
justificada, con la `x` de cada palabra), `l` (raya), `box` (casilla), `img` / `circ` (logo o
iniciales) y `rect` / `c2` (celdas de la tabla de firmas).

**El reparto de hojas** y las operaciones, medidos con el PDF armado de verdad:

| documento | cuerpo/interlineado | bloques | hojas | ops por hoja | ops |
|---|---|---|---|---|---|
| `constancia` | 10,5 / 16 pt | 8 | **1** | 13 | **13** |
| `cve` (cardioversion) | 10,2 / 13,4 pt | 44 | **3** | 40 · 82 · 28 | **150** |
| `ete` | 10,2 / 13,4 pt | 48 | **3** | 40 · 130 · 28 | **198** |
| `burb` (burbujas) | 10,2 / 13,4 pt | 48 | **3** | 35 · 89 · 28 | **152** |

> ⚠️ **ESA TABLA ES LA REGLA DE ORO DE A3**, y es contra ella que se mide el cierre de la tanda:
> con los cuatro documentos **sin editar**, hojas y operaciones tienen que dar esos mismos ocho
> numeros.

> ⚠️ **`def.hojas` DECLARA 1 / 2 / 2 / 2 Y LAS HOJAS REALES SON 1 / 3 / 3 / 3.** El campo es
> metadato y **ningun camino lo lee** (censado): el reparto lo decide el maquetador con los
> `salto` y el alto de cada bloque. Los tres consentimientos llevan **dos** `salto`: el del
> cuerpo y el de `docHojasComunes`.

> ⚠️ **LA DECLARACION Y LAS FIRMAS YA VIAJAN JUNTAS, y el mecanismo se reusa tal cual.** Los
> **once** bloques de `docDeclaracion` llevan `grupo:'firmas'`, y el recorrido de `docMaquetar`
> mide el grupo entero con `altoGrupo` antes de abrirlo: si no entra, pasa de hoja completo.
> `altoGrupo` mide la **tinta** y no la `y` de cierre, porque esa `y` incluye el margen que el
> ultimo bloque deja detras y al final de una hoja no ocupa nada. **D4 no necesita mecanismo
> nuevo.**

## d) El menu del boton «Documentos» del Informe

| que | medido |
|---|---|
| el HTML | lineas **25237-25246**: un `<span class="doc-menu-wrap">` con `margin-left:auto` que contiene el `<button id="doc-btn" class="btn btn-ghost" onclick="docMenuToggle()">📄 Documentos ▾</button>` y el `<div id="doc-menu" hidden role="menu">` |
| como se arma | **escrito a mano en el HTML**: cuatro `<button role="menuitem" onclick="docAbrir('<clave>')">` con el texto de `def.menu` copiado. No hay pintor: nada lo arma en tiempo de ejecucion |
| como se abre y cierra | `docMenuToggle()` alterna `m.hidden` y `aria-expanded`, y pone el foco en el primer item. `docMenuCerrar()` lo cierra. Un oyente **delegado** de `keydown` cierra con Escape (primero el menu, despues la hoja) y uno de `click` cierra el menu al tocar fuera de `.doc-menu-wrap` |
| como se deshabilita | **no se deshabilita ni se oculta**: las cuatro opciones estan **siempre activas** y el boton siempre esta. `#doc-menu[hidden]{display:none;}` esta declarado **a proposito**, porque `[hidden]` del navegador no vence al `display` del contenedor |
| «Guardar en Imagenes» | `docGuardarImagen()` maqueta, rasteriza el SVG con `esqRasterizar` y guarda con `esqGuardarDataURL(docClaveEsq(clave), def.tit, dataURL)`. La clave es **`'doc-' + clave`** y va a **`esqs`**, no a `imgSlots`: por eso una constancia no puede salir dentro del informe firmado. `guardarEsquema` identifica por clave y **reemplaza**, asi que «actualizar» no necesita camino propio |
| como nombra la miniatura | con **`def.tit`** — el titulo del documento, no el del menu. El aviso lo dice: «Guardado en «Imagenes» como «<def.tit>»» |
| las tres compuertas del guardado | hay almacenamiento · la casilla «Guardar imagenes con los estudios» esta prendida · el estudio ya tiene uuid. Las tres pueden negar y **el motivo se dice siempre** |

> **HIPOTESIS DE LA ORDEN: una es falsa.** La orden pregunta «como se deshabilita y como se oculta
> el boton»: **hoy no hay ningun mecanismo para ninguna de las dos cosas.** El boton esta siempre
> y las cuatro opciones estan siempre activas. B2 tiene que **crear** el ocultamiento, y por la
> leccion de PANT-30 va con una **clase** y no con `hidden`: `.btn` declara
> `display:inline-flex` y le gana al `[hidden]` del navegador — medido en esta sonda, el boton
> computa `display:flex`.

## e) Los barridos de limpieza y la exclusion de Configuracion

**`limpiarCampos()` — «Nuevo estudio».** Barre por tipo de control y, ademas, por **sufijo y
prefijo de id**. Los barridos por id que importan para un id nuevo:

| barrido | que hace |
|---|---|
| `[id$="-aviso"]` | `textContent = ''` — **el que PANT-30 pago**: vaciaba el recuadro del aviso y se llevaba su boton puesto |
| `[id$="-badge"]` | `textContent = ''` |
| `[id^="im-pdf-"]`, `[id^="em-pdf-"]`, `[id^="em-clase-"]` | textos y clases de las valvulas |
| `[id^="bloque-insuf-"]`, `[id^="bloque-esten-"]`, `[id^="gf-insuf-"]` | `display:none` |
| `input[type=text], input[type=number]` | `value = ''` |
| `textarea` | `value = el.defaultValue` |
| `select` | `selectedIndex = 0` |
| `input[type=checkbox][id]` | se desmarcan, salvo la allowlist |
| `.calc-box .calc-row span[id]:not(.calc-lbl)` | `innerHTML = '—'` |
| `[data-derivado-de]` y trece atributos hermanos | los espejos y derivados |

**La exclusion de Configuracion son DOS listas paralelas, y las dos hacen falta:**

1. **`_CAMPOS_FUERA_DEL_ESTUDIO`** (linea 76006), una expresion regular anclada en `^`:
   `/^(cfg-|firma-|lab-|ig-|med-|logo|lgal-|tema|pdf-|filtro-|adv-|asoc-|exp-|alg-|ett-|rwt-|ee-|ap-|rev-|login-|fcg-|pop-bcia-|pop-esp-|va-esp-|tga-3d-|cm3d-|centro_tipo$|ecoAdvSelect$)/`.
   Decide si el formulario «tiene datos» (`_formTieneDatos`) y es el `_noVaciar` de
   `editarInforme` (linea 131251).
2. **`_noEsDelEstudio(id)`** (linea 66672), la funcion que cuatro recolectores consultan para
   **no guardar** el campo con el estudio.

Medido con la sonda, las dos contestan **`true`** a `cfg-docs-on` y a `cfg-doc-x`, y `false` a
`doc-aviso` y a `docmod-x`.

> **CONCLUSION OPERATIVA, y es la regla (3) de la orden medida:** **todo id nuevo de esta tanda
> lleva prefijo `cfg-`.** Con ese prefijo queda fuera del censo del estudio, fuera del Excel y
> fuera de `editarInforme` **por las dos listas a la vez**, sin tocar ninguna de las dos. Y
> **ningun id nuevo termina en `-aviso`** ni en `-badge`, ni empieza por ninguno de los cinco
> prefijos barridos. Los ids de la **hoja** del documento (los `doc-*` de PANT-31) ya existen y
> no se tocan.

## f) El procedimiento de cada consentimiento: dato o literal

**Esta escrito dentro del texto, como literal, y se pasa por parametro.** Cada
`DOC_DEFS[clave].bloques()` declara una constante local:

- `cve` → `const PROC = 'una cardioversión eléctrica';`
- `ete` → `const PROC = 'un ecocardiograma transesofágico con sedación';`
- `burb` → `const PROC = 'un ecocardiograma con test de burbujas';`

y la pasa a `docDeclaracion(PROC, internacion)`. **No sale de ningun dato** y no esta en
`docDatos()`.

Medido con `docDeclaracion('XXPROCXX', false)`: **once** bloques, los once con
`grupo:'firmas'`, y el procedimiento aparece **dos veces** — una en la **primera vinieta** del
`ul` («en qué consiste <PROC>») y otra en el parrafo «He leído la información y estoy de acuerdo
en que se me realice <PROC>.». Con `internacion` en verdadero el `ul` gana una quinta vinieta y
el conteo de bloques no cambia.

> **HIPOTESIS DE LA ORDEN (A5): confirmada.** El procedimiento es un literal del documento, asi
> que para los consentimientos **propios** alcanza con pasarle `'el procedimiento'` al **mismo**
> `docDeclaracion`: no hay que escribir un segundo texto de declaracion, que seria la copia
> paralela que esta casa no admite.

---

## Lo que esta tanda reusa, y lo que tiene que crear

**Reusa tal cual:** `DOC_GEO`, `docSan`, `docDatos`, `docSust`, `docMarcar`, `docDeclaracion`,
`docHojasComunes`, `docEncConsent`, `docRiesgosCierre`, **`docMaquetar` con sus diecisiete tipos
de bloque y su grupo `firmas`**, `docOpsAPdf`, `docOpsASvg`, `docBloquesNuevos`, la hoja editable
(`docAbrir` / `docRender` / `docEditado` / `docCerrar`), `docImprimir`, `docGuardarImagen`,
`docImgSync`, `escHtml`, `toast`, `confirm`, el patron de descarga de `_bkExportar` y el patron de
lectura de `importarInformesJSON`.

**Tiene que crear:** el almacen de modelos en `localStorage`; la representacion de los cuatro
incluidos como modelos; el **conversor de texto a bloques** con las cinco convenciones de A4; la
seccion de Configuracion con su lista y su editor; el ocultamiento del boton por clase; el
**pintor del menu** (hoy el menu es HTML escrito a mano); los documentos propios; y el par
exportar / importar.

**Lo que NO se toca:** el papel del informe, el Excel, el 3D, la brujula, la captura, `P30-d`,
`P31-a` a `P31-g`, y **ni una palabra de los cuatro documentos incluidos**.
