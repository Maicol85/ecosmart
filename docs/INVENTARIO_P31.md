# INVENTARIO P31 — lo medido antes de tocar nada (2026-11-10)

Tanda **PANT-31**, commit 1. **Solo lectura: no toca `index.html`.** Todo lo de abajo se midió en
Chrome real por CDP con la sonda `scripts/_probe_pant31inv.mjs` (y dos sondas de diagnóstico en el
directorio temporal de la sesión), sobre el árbol de la línea base: `HEAD` = `origin/main` =
**`e531b73`**, sello **`v20261110-1041`**, md5 **`f4ded2a9`**, verificados los tres.

⚠️ **EL RENGLÓN DE TAMAÑO DE `CLAUDE.md` DICE 171.796 LÍNEAS Y `wc -l` DA 171.804.** Ocho de
diferencia. El md5 y el sello sí coinciden, y `git show e531b73:index.html | wc -l` da **171.804**,
o sea que el archivo es el bueno y lo que está corto es el renglón. Se corrige en el commit 7.

⚠️ **LA PRIMERA CORRIDA DE ESTA SONDA MIDIÓ SOBRE LA PANTALLA DE LOGIN, y dijo exactamente lo que
la orden anticipaba: «no se puede editar».** `#login-overlay` es `position:fixed` con
`z-index:2147483000` y tapa la pantalla entera: `document.elementFromPoint` sobre el párrafo
devolvía `DIV#login-overlay`, así que el clic real caía ahí y el foco quedaba en `BODY`. Con la
sesión abierta —`sessionStorage.ett_auth='1'` y el aviso legal cerrado, que es el estado en el que
el médico trabaja— el mismo clic enfoca el párrafo. **Una sonda de gesto real sin pasar el login
mide un denominador vacío que se lee igual que un defecto.** El arnés lo resuelve con `entrar()`.

⚠️ **Y EL TECLADO DE LA PRIMERA VERSIÓN DEL ARNÉS ESCRIBÍA CADA LETRA DOS VECES**: mandaba
`keyDown` con texto **más** un `char`, y los dos insertan en Chrome, así que «XKZ» entraba como
«XXKKZZ». Hoy manda `keyDown` con texto y `keyUp`, nada más.

---

## (a) El botón «Documentos» y el de «Evidencia»

| | «📄 Documentos ▾» | «📋 Evidencia» |
|---|---|---|
| id | `doc-btn` | `indic-btn` |
| fila | la de **acciones** del Informe (`Regenerar · Exportar PDF · Guardar · Modo comparativo · Documentos`) | la de **estilo** (`Técnico · Estándar · Conciso · 🫀 CC · 💬 Frases · 📋 Evidencia`) |
| caja a 1440 px | x 31 · y 761 · **132 × 44** · borde derecho **163** | x 621 · y 186 · **104 × 44** · borde derecho **725** |
| envoltorio | `span.doc-menu-wrap` (relativo, con el menú absoluto adentro) | `span` con `margin-left:auto` |

- **NO están en la misma fila** (`mismaFila: false`): las separan **575 px** de `y`. Las dos filas
  sí comparten el borde derecho: **725 px** las dos, porque son hijas de la misma tarjeta.
- El borde derecho del botón de Documentos está hoy **562 px a la izquierda** del de Evidencia.
- **La «altura exacta» de R1 es por lo tanto ambigua**: no hay forma de que un botón de la fila de
  acciones quede «a la altura» de uno que vive 575 px más arriba sin sacarlo de su fila, y R1 dice
  que la fila no se toca. **Se alinea el BORDE DERECHO** —que es la alternativa que R1 ofrece— con
  `margin-left:auto` en `.doc-menu-wrap`, el mismo recurso que usa el `span` de Evidencia.
- Los cuatro botones de la fila son `.btn` de 44 px de alto; el de Documentos también.

## (b) La hoja que abre «Documentos»

**Qué es:** HTML editable, no una imagen ni una vista previa del PDF. `#doc-ov` es un overlay
`position:fixed; inset:0; z-index:300; display:flex; flex-direction:column`, con tres hijos: la
barra `.doc-bar`, el renglón de estado `#doc-estado` y `.doc-hoja-wrap` (`flex:1 1 auto;
overflow:auto; display:flex; justify-content:center`), que contiene `.doc-hoja`
(`width:min(820px,100%)`, fondo blanco, `font-size:12.5px`, y 12 px con `padding` menor por debajo
de 700 px de ventana).

**Medido en los cinco anchos (hoja del ETE, que es la más larga):**

| ventana | caja blanca | tinta | **fuera del blanco** | desborde horizontal |
|---|---|---|---|---|
| 1440 px | 820 × **783** | 2.285 | **1.502 px** | 0 |
| 1280 px | 820 × **783** | 2.285 | **1.502 px** | 0 |
| 1000 px | 820 × **783** | 2.285 | **1.502 px** | 0 |
| 768 px | 744 × **783** | 2.357 | **1.574 px** | 0 |
| 390 px | 366 × **759** | 3.436 | **2.677 px** | 0 |

⚠️ **ESO ES EL DEFECTO QUE EL MÉDICO REPORTÓ, Y NO ES UN RECORTE: ES QUE EL PAPEL BLANCO SE TERMINA
Y EL TEXTO SIGUE.** `.doc-hoja-wrap` es `display:flex` y su `align-items` computa `normal`, o sea
**stretch**, así que `.doc-hoja` recibe un alto DEFINIDO igual al alto de la caja del envoltorio
(783 px) en vez de crecer con su contenido. El contenido desborda con `overflow:visible`, así que
de los 2.285 px de texto del ETE **1.502 se dibujan por fuera del rectángulo blanco, sobre el fondo
oscuro del overlay**. Por eso «no se ve completa en pantalla» y por eso «sólo se lee bien al
imprimir»: el PDF lo maqueta jsPDF en milímetros y no tiene este problema.
**Cero desplazamiento horizontal y cero texto recortado en los cinco anchos** —`fueraDeCaja: 0`,
`recortados: 0`—, así que el problema es sólo vertical.

**Correspondencia pantalla ↔ papel, medida:**

| documento | cuerpo en pantalla | cuerpo del papel (`def.sz`/`def.lh`) | saltos dibujados en pantalla | hojas del PDF de verdad | `def.hojas` |
|---|---|---|---|---|---|
| constancia | 12,5 px | 10,5 pt / 16 pt | 0 | **1** | 1 |
| cardioversión | 12,5 px | **8,8 pt / 11 pt** | 1 | **2** | 1 ✗ |
| ETE | 12,5 px | 10,2 pt / 13,4 pt | 2 | **3** | 2 |
| burbujas | 12,5 px | **8,8 pt / 11 pt** | 1 | **2** | 1 ✗ |

- La pantalla usa **un solo cuerpo (12,5 px) para los cuatro**, mientras el papel usa tres tamaños
  distintos: la pantalla no puede corresponder al papel ni por tamaño ni por paginado.
- **`def.hojas` NO SE LEE EN NINGÚN LADO** (censado: la única aparición de `.hojas` fuera de este
  módulo es `_pk.hojas` del PDF de pericardio). Es metadato muerto, y en `cve` y `burb` **miente**:
  dice 1 hoja y el PDF da 2.
- Los saltos de pantalla son los bloques `{t:'salto'}` explícitos, no el paginado real.

## (c) La edición

**Hipótesis «el médico NO pudo editar»: FALSA en la hoja que abre «Documentos».** Medido con clic
real y teclado real por CDP, con la sesión abierta:

| sitio | a 1440 px | a 390 px |
|---|---|---|
| párrafo (`p.doc-p`) | escribe y borra ✔ | escribe y borra ✔ |
| viñeta (`li`) | ✔ | ✔ |
| casilla de dos columnas (`span` de `.doc-chk2`) | ✔ | ✔ |
| párrafo del final de la hoja | ✔ | fuera de la ventana al medir (se validó a 1440) |

El clic enfoca el elemento (`focoEsEditable: true`, selección dentro de `#doc-hoja`), `XKZ` entra,
tres `Backspace` lo sacan, y `docEditado` guarda **texto llano**.

**Lo que SÍ está medido como limitación, y es lo más probable que el médico haya tocado:**
1. **De los 2.285 px de tinta, 1.502 están fuera del papel blanco** (ver (b)): lo que cae ahí se ve
   como texto suelto sobre el fondo oscuro y no se lee como parte de la hoja.
2. **No todo es editable.** Porción editable del texto: constancia **84 %** (2 campos),
   cardioversión 95 % (44), ETE 94 % (52), burbujas 95 % (44). **NO son editables**: el nombre de
   la institución (`.doc-enc-nom`), la línea de ciudad y fecha (`.doc-cf`), la línea de paciente
   (`.doc-pacid`), el bloque de firma (`.doc-firma`), la tabla de firmas (`.doc-tf`), el número de
   sección (`.doc-sec-n`), el «☐ Sí ☐ No» (`.doc-chk-sn`) y la raya en blanco (`.doc-rayita`).
3. **No hay oyente de `paste`.** Un `ClipboardEvent('paste')` con `text/plain` y `text/html` sale
   **sin cancelar** (`defaultNoPrevenido: true`) y nadie lo trata, así que un pegado real entra con
   el marcado del origen (negritas, colores, fuentes). Al papel no llega —`docEditado` guarda
   `innerText`— pero la pantalla queda con marcado ajeno.
4. **La imagen guardada en «Imágenes» es un PNG**: `docGuardarImagen` rasteriza el SVG y lo guarda
   con `esqGuardarDataURL`; el visor (`igImgVisorAbrir`) muestra un `<img>`. **No se edita, y no
   puede.** Para cambiar el texto hay que volver a abrir desde «Documentos».

## (d) El cierre

| forma | hoja de «Documentos» (`#doc-ov`) | visor de la miniatura (`#ig-imgv-ov`) |
|---|---|---|
| cruz | ✔ `doc-x` → `docCerrar()` | ✔ `ig-imgv-cerrar` |
| **clic afuera (en el fondo)** | ✗ **NO cierra** (`clicEnOverlayCierra: false`; el overlay no tiene `onclick`) | ✔ ya cierra (`ev.target === ov`) |
| Escape | ✔ **ya cierra** | ✔ ya cierra |

⚠️ **DOS PREMISAS DE R4 SON PARCIALMENTE FALSAS:** Escape **ya** cierra la hoja —hay un oyente
delegado propio del módulo, más el genérico del bloque de accesibilidad, que busca el
`[role="dialog"][aria-modal="true"]` visible más alto y le clickea la ✕—, y el visor de la
miniatura **ya** cierra con Escape y con un clic afuera. Lo único que falta es el **clic afuera en
la hoja**, y la **confirmación** antes de perder correcciones a mano.
El estado de edición está en `_docEst[clave].editado`, en memoria (**P30-a**).

## (e) El logo

- Vive en `localStorage`, clave **`logo_centro_<centro_tipo_activo>`** (hoy `logo_centro_default`),
  validado por `LOGO_DATA_OK` (`data:image/(png|jpeg|jpg|gif|webp);base64,`). `docDatos()` lo lee y
  lo publica como `D.logoD`; sin logo, `logoD` es `null`.
- **En el papel** (`docMaquetar → encabezado()`): el nombre de la institución va a la **IZQUIERDA**
  (`x = ML = 14 mm`, hasta dos líneas, 12,7 pt en negrita azul `#1f3a5f`) y el logo o el círculo a
  la **DERECHA** — logo `{x: 210-14-18 = 178, y, w:18, h:14}`, círculo `{x:189, y:19, r:7}` con dos
  iniciales. Medido: con la institución «Centro Ficticio de Cardiologia del Norte» el círculo sale
  en x **189 mm** de una hoja de 210.
- **En pantalla** (`docRender`): `.doc-enc` es flex con el nombre primero (`x:340`, ancho 702) y el
  logo o el círculo después (`x:1054`, 46 × 46 px, `border-radius:50%`). `.doc-enc-logo` lleva
  `max-height:46px; max-width:120px; object-fit:contain`, así que **ya respeta la proporción**.

⚠️ **LA PREMISA DE R6 ES FALSA: el círculo con las iniciales NO está hoy en el rincón izquierdo,
está en el DERECHO**, en el papel y en la pantalla. R6 pide el logo «en el lugar donde hoy sale el
círculo» **y** aclara «(rincón izquierdo)», y las dos cosas no pueden ser la misma. Se toma el
paréntesis, que es lo que además hace coherente a R7 (el nombre centrado necesita el logo a un
costado): **logo o círculo a la IZQUIERDA, nombre centrado**. El alto se mantiene (14 mm de logo /
r = 7 mm de círculo en el papel; 46 px en pantalla).

## (f) La constancia

Cinco bloques: `enc · ciudadfecha · tit · p · firma`. **UN SOLO párrafo**, con las tres oraciones
corridas:

> «Se deja constancia que {{art}} {{pac}}, {{docl}}: {{docn}}, consultó el día de hoy, {{fecha}},
> en {{inst}}, para realizarse {{est}}. Se extiende la presente para ser presentada donde
> corresponda. Sin más, saluda atentamente.»

En el papel, medido, las dos frases de R5 caen **a mitad de renglón**: «… para realizarse un
ecocardiograma transtorácico. Se extiende la» cierra la segunda línea y «presente para ser
presentada donde corresponda. Sin más, saluda atentamente.» ocupa la tercera. 1 hoja.
La firma lleva **90 pt de aire** en el papel (`{t:'firma'}`) y `margin-top:34mm` (128,5 px) en
pantalla: **R5 dice que la firma no cambia**, y no se toca.

## (g) El Laboratorio y la casilla «PPT»

- **61 tarjetas** `.lab-card` en `#tab-lab`; **57 con `data-ppt`** y **4 con `data-ppt-no`**:
  «🔧 Prótesis valvulares», «💚 Strain Manual», «📄 Informe de Auditoría — Export PDF» y
  «📊 Presentación estadística — Export PPT». `_labPptAssertClaves()` da
  `{total:61, conClave:57, sinDeclarar:[], dup:[]}` y `_labPptAssertGrupos()` da
  `{enDom:57, enGrupo:57, sinGrupo:[], sinTarjeta:[], dobles:[]}`.
- **Dónde está la casilla:** la inyecta `_labPptChkInyectar()` en el `.lab-card-hdr` de cada tarjeta
  con `data-ppt`, como `<label class="lab-ppt-chk" title="Incluir esta tarjeta en la presentación
  estadística (PPT)">` con un `<input type="checkbox" data-ppt-chk="<clave>">` y el texto «PPT».
  Se ancla al borde derecho con `margin:-11px 0 -11px auto` y mide **44 × 44 px**, a **14 px** del
  borde derecho de la cabecera (medido en la tarjeta `actividad`).
- **Estado por defecto: SIN marcar.** Se guarda en `localStorage`, clave
  **`ecosmart_lab_ppt_chk`**, como `{clave:true}`; `_labPptChkMarcadas()` filtra contra el DOM.
  Marcada, la tarjeta recibe `data-ppt-on="1"` y la casilla se pinta de acento.
- **Cómo llega al PPT:** `LAB_PPT_GRUPOS` (hoy **15** grupos que reparten las 57 claves) dice a qué
  diapositiva va cada tarjeta; `_labPptGruposActivos()` devuelve los grupos con al menos una
  tarjeta tildada y `_labPPTGenerar` abre cada hoja con `if (G('<grupo>'))`. **Hay grupos de una
  sola tarjeta** (`contr`, `amil`, `onco`, `tend`), así que una sección con su propia diapositiva
  es el patrón normal y no una excepción.
- **Qué le falta a «Prótesis valvulares»:** el `data-ppt` (hoy tiene `data-ppt-no`), una entrada en
  `LAB_PPT_GRUPOS` y su hoja en el generador. Los datos ya existen y no hay que calcular nada:
  `_labProtStats(infs)` devuelve `conAlgo`, `conProt`, `conRep`, `porPos[pos].tipos[tipo]`,
  `modelos` (con `n` y `alt`), `trast[clave]`, `conProtParaTrast` y `altTotal`, y
  `_labProtChartPng(S)` ya produce el PNG del gráfico apilado para el PDF de auditoría.
- **El gráfico apilado de dos pilas no tiene equivalente nativo en el mazo**: `_pptAddChart` se usa
  hoy con **una sola serie** y en el archivo no hay un solo `barGrouping`. Para no inventar un
  mecanismo, la hoja usa `gBarras` con las categorías **posición · tipo** combinadas, que es
  literalmente «barras por posición y tipo» con el ayudante que ya existe, y las reparaciones
  quedan rotuladas como tales.

## Lo que esta tanda NO toca, y se verificó
- **`docs/PENDIENTES.md` → P30-a es el único id** del pendiente de las correcciones a mano de la
  hoja. Censadas las siete apariciones (`REGISTRO_TANDAS.md`, `DOCUMENTOS_P30.md`,
  `PENDIENTES.md`, `GUIA_PRUEBA_PANT30.md`, `docs/mapa/pant30-documentos-protesis.md`, `CLAUDE.md`
  ×2 e `index.html`): todas dicen **P30-a**. **No hay dos ids y no hay nada que arreglar.**
- **P30-d** (`showTab` y el `window.event` global) queda como está, por orden expresa.
