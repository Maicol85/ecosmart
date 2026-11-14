# MEDIR-2 — la tabla de medidas, los nombres del Doppler pulmonar, el Área por estructura, Simpson indexado y la comunidad bloqueada

Mapa de la tanda **MEDIR-2** (2026-11-13), que continúa MEDIR-1 y cierra sus cuatro puntos
pendientes (5, 6, 7 y 8) más el bloque de rojos y seguridad. Por **nombre de función y de
constante**, no por número de línea.

Lo de MEDIR-1 —la ventana, la barra única, las dos columnas y el selector progresivo— está en
`docs/mapa/` de esa tanda y en el «Estado vigente» de `CLAUDE.md`; acá sólo lo que esta tanda
agregó o movió.

---

## 1 · La tabla de medidas en cinco columnas (bloque B)

**Armador único: `_medTablaHTML(filas, pfx, destino)`.** Lo consumen los DOS cajones del visor:

| cajón | quién llama | prefijo de atributo |
|---|---|---|
| Distancia 2D | `_d2Render` | `d2` |
| Doppler | `_dopRender` (dentro de su ayudante `tabla`, que a su vez usa `tablaCols`) | `dop` |

Las columnas son **Medida | Valor | Unid. | Medir y Borrar | \<comunidad\>**. El nombre de la
quinta sale de `ANAHI_NOMBRE`; la celda la emite `anahiCeldaHTML()`.

**Una fila es CALCULADA cuando `f[3]` (la clave de campo) es `null`.** Ese criterio no es nuevo:
es el que `_d2Filas` ya declaraba para sacarles el ✏️. Las calculadas van **sin ningún botón**,
en **cursiva** y con la palabra **«calculada»** en su celda de acciones.

**La forma de una fila no cambió** — sigue siendo
`[rótulo, valor, unidad, clave, ¿armable?, insumos, columna]`, y lo que `_medTablaHTML` hace es
repartirla en celdas. Ningún corte y ninguna banda se tocaron.

**Sin visor abierto no se ofrece «Medir»**, igual que antes: `_dopRender` apaga el `armable` de
cada fila antes de pasarla al armador, así que el armador no necesita saber nada del visor.

### «Borrar»

`d2Borrar(campo)` y `dopBorrar(campo)`, cableados en los dos delegados por
`data-d2-borrar` / `data-dop-borrar`. Recorren el **mismo camino** que `d2Corregir` /
`dopCorregir` con el cuadro de texto vacío: vaciar el valor y soltar la marca de origen
(`_d2BorrarOrigen` / `delete E.origen[campo]`), más el repintado del cajón ajeno cuando el campo
es destino de un alias.

**El botón sólo se dibuja si la fila TIENE valor**, así que no hay forma de borrar algo que no
está — y por eso no pregunta. El **✏️ se conserva**: para campos como el Diam TSVD es la única
vía de entrada.

---

## 2 · Los nombres del Doppler pulmonar (bloque C)

| antes | hoy | clave | banda |
|---|---|---|---|
| `VP` **+** `Vmax EP` | **`Vmax pulmonar`** | `pul.vmaxEp` (la conectada: de ella sale el gradiente) | ninguna |
| `Grad Máx EP` | `Grad Máx pulmonar` | — (derivada) | — |
| `Vmax IP` | **`Vmax proto-diast. IP`** | `pul.vmaxIp` | ninguna |
| *(no existía)* | **`Vmax telediastólica IP`** | `pul.vmaxIpTd` | ninguna |

**`pul.vp` se retiró entero** —estado en `_dopNuevo`, herramienta en `_DOP_HERR` y rótulo en
`_DOP_ROT`— con su lápida en los dos primeros. Medía lo mismo que `pul.vmaxEp` y no la leía
nadie: ni un campo del informe, ni el Excel, ni el papel, ni `_dopDerivados`.

**Los rótulos de las dos filas de la IP son los de la app, palabra por palabra**: los mismos que
llevan los campos `ip_vmax` («Vmax proto-diast. IP (m/s)») e `ip_vtd` («Vmax telediastólica IP
(m/s)») en el formulario. **Las filas los leen de `_DOP_ROT` y no los escriben**, para que la
tabla y el cuadro de «corregir a mano» no puedan nombrar distinto el mismo campo.

**Ninguna banda nueva.** Medido: `pul.vmaxEp`, `ip_vmax` e `ip_vtd` **no tienen** rango en
`DCM_RANGO` ni en `CHM_RANGO`, así que el homólogo no tiene nada que prestar. Las dos que sí la
tienen —`pul.vtiPul` y `pul.diamTsvd`— la conservan.

### Los otros nombres de la misma magnitud (informado, no tocado)

La velocidad pico pulmonar anterógrada tiene **cuatro** nombres fuera del visor: `vp_vmax`
(«Vmax pulmonar (m/s) — Estenosis», el dueño), su espejo `ep_vmax` («Velocidad máxima pulmonar
(m/s)», sincronizados por `vpVmaxSync`, par declarado en `VP_VMAX_PARES`), «V. máx VP» en el PDF
y «PV Vmax P» como cabecera del importador de Excel. Ver `docs/PENDIENTES.md` → **M2-c**.

---

## 3 · El Área por estructura (bloque D)

- **`_MED_EST_AREA`** — las dos estructuras, con su rótulo corto y su nombre largo:
  `{ m:'ai', rot:'AI', nom:'Área de AI' }` y su hermana `ad`.
- **`_medAreaEst`** — cuál está elegida (o `null`). La alterna `medAreaEstructura(m)`, igual que
  `d2Modo` y `dopModo`.
- **`_medAreaNom(m)`** — el nombre largo, para el rótulo del dibujo.

**Dónde aparece la fila**: en el **nivel 3** del selector progresivo (`_medSideRender`), con la
condición `ab === '2d' && _medHerr === 'area'`. Los ids llevan el prefijo **`cine-est-area-`**
para no chocar con las cinco estructuras del cajón 2D (`cine-est-`), que eligen otra cosa. El
oyente se cablea al final de `_medSideRender` con el mismo **`_vBind`** que los demás, así que
elegir una estructura en la vista B no mueve la de la A.

**El contorno se guarda con su estructura**: `_medAreas` pasa de `{pts, cm2}` a
`{pts, cm2, est}`. Un contorno trazado sin estructura elegida **se guarda igual** y se dibuja sin
rótulo.

**El dibujo** (el ayudante `contorno` de `_medPintar`) rotula `«Área de AI: 12,34 cm²»`.

**El resultado** se publica en el **panel guía** (`_medEstado`, al final, antes de
`_strainPersistir`): una línea por estructura, la **última** de cada una, más el aviso de que las
dos van en A4C y de que **no se escribe ningún campo**. Los contornos sin estructura se cuentan
aparte.

⚠️ **Va en el panel guía y NO en el cajón 2D**, y es la razón de fondo: ese cajón escribe campos
del formulario y el pedido dice que esto no escribe ninguno.

**La estructura se suelta en `medApagar`** —la puerta que borra los contornos— y **no** en
`cineCerrar`, que conserva lo medido a propósito.

---

## 4 · Simpson en mL y mL/m² (bloque E)

Todo en **`_simpTablaHTML`**. La superficie sale de **`getBSA()`**, el dueño único.

- Con superficie: **siete** columnas numéricas —los tres volúmenes en mL, cada uno seguido de su
  mL/m², y la FEVI—, más la línea que dice de dónde sale la superficie y su valor.
- Sin peso o sin talla: `getBSA()` devuelve `null`, las tres columnas indexadas **no se dibujan**
  y la tabla dice «**Sólo en mL:** falta el peso o la talla».

**El cálculo no se tocó**: lo indexado es una división de lo que `_simpFilasTabla` ya devolvía.
**La FEVI no se indexa**: es un porcentaje.

**«Volumen» (AI biplano)** sigue visible y apagado con su leyenda «próximamente», como lo dejó
MEDIR-1: no lleva id de herramienta y no entra en `_MED_HERRS`.

---

## 5 · La comunidad de desarrollo de IA, bloqueada (bloque F)

**Los dos dueños únicos:**

| constante | qué es |
|---|---|
| `ANAHI_ON` | el estado. Hoy `false`. Lo lee **`anahiActiva()`** y nadie más. |
| `ANAHI_NOMBRE` | el nombre. Hoy `'Anahí'`. Lo **leen** las cuatro superficies. |

Más los tres textos: `ANAHI_TIT`, `ANAHI_CUERPO` y `ANAHI_CORTO`.

**Las cuatro superficies:**

1. **La casilla por fila** — `anahiCeldaHTML()`, dentro de `_medTablaHTML`. Clase `anahi-cel`.
2. **El botón de «Imágenes guardadas»** — `_anahiBoton(cont)`, con el molde de `_igSelBtn`.
   Va en la columna de `igSelSidePintar` **pegado** a «Exportar las elegidas», y también en la
   barra del modo elegir junto a su «Exportar». Clase `anahi-btn`.
3. **El botón de «Estudios guardados»** — `#igio-exp-anahi`, dentro del menú `#igio-menu-exp`.
   Su rótulo lo escribe **`anahiBotonMenuSync()`**.
4. **El bloque de Configuración** — `#cfg-card-anahi`, con `#cfg-anahi-tit` y `#cfg-anahi-txt`,
   escritos por **`anahiCfgSync()`**. **Sin botón de aceptar y sin un solo campo.**

Los dos sincronizadores los llama `_anahiSyncTodo()` al cargar.

⚠️ **NINGUNO LLEVA `disabled`** —la casilla sí, pero su oyente cuelga de la **celda**—, y es
medido: un control deshabilitado **no emite click**, así que el médico tocaría el único control
que tiene que explicarle por qué está bloqueado y no pasaría nada. Llevan `aria-disabled` para el
lector de pantalla y el candado para el ojo.

**El cartel: `anahiCartel()`.** Overlay propio de la app con `role="dialog"`, `aria-modal`, el
foco en «Entendido» y Escape para cerrar; se arma al vuelo y **se destruye al cerrar**, así que no
deja un nodo ni un id que los barridos de «Nuevo estudio» puedan alcanzar. Todo entra por
`textContent`. Sale **la primera vez de cada sesión de la página** —`_anahiCartelVisto`, **en
memoria y no en disco**— y después va el aviso corto por `toast`.

**«Entendido» SOLO cierra**: no toca `ANAHI_ON` y no escribe nada.

**Un solo oyente delegado** para todo el documento, sobre `.anahi-cel, .anahi-btn`: las tablas y
la columna se repintan enteras y un manejador por nodo se iría con el nodo viejo en cada
repintado.

**Nada se envía y nada se guarda.** Cero llamadas de red nuevas y cero claves de `localStorage`.

---

## 6 · Lo del bloque A (rojos y seguridad)

- **`_medColorLegible(varName)`** — deriva el color del rótulo de un botón del selector hasta que
  contrasta **4,5:1** con el fondo del modal, mezclándolo contra `--text`. Lo usa `_medSideBtn`
  para el estado **no** seleccionado. Sus dos ayudantes son `_medLumDe` y `_medContraste`.
  El **borde** sigue con el color crudo del grupo: ahí no hay texto que leer.
- **`.cine-selbtn::after`** — el área táctil de **44 px** sobre botones de **28**, con el patrón
  de PANT-2 (un pseudo absoluto, nunca un margen negativo). El botón lleva `position:relative`.
- **`.cine-selfila { row-gap: 16px }`** — 28 + 16 = 44 exactos, el mínimo que separa dos líneas
  de botones sin que sus áreas táctiles se encimen.
  ⚠️ **Y EL MARCADO EMITE `column-gap:3px`, NO `gap:3px`.** Con el atajo `gap` en línea, el
  `row-gap` de la hoja **no aplicaba** —un estilo en línea le gana a la hoja sin importar la
  especificidad, y `gap` fija los dos ejes—: el hueco efectivo seguía en 3 px y con la fila
  envuelta había **tres pares de áreas táctiles solapadas**. Separando los ejes, el horizontal se
  queda en 3 y el vertical lo pone la hoja. Medido en los ocho cruces de la sonda, con su
  mutación muriendo. Ver `docs/PENDIENTES.md` → **M2-g · 1**.
- **El `innerHTML` de `_medSideRender`** junta las tres filas con **`join`** en vez de
  concatenarlas del lado derecho de la asignación: es la forma que `ceibo-xss-innerhtml-concat`
  empareja, y con esto Semgrep vuelve a su línea base de **126/0**. **M1-d cerrado.**

---

## 7 · Los casos

| caso | qué fija |
|---|---|
| **TC-882** | la tabla de cinco columnas en los dos cajones, las calculadas sin botones y en cursiva, «Borrar» vaciando sólo su fila, la casilla bloqueada |
| **TC-883** | los nombres del Doppler pulmonar, la clave que sobrevive, los rótulos leídos del formulario, y que no se inventó ninguna banda |
| **TC-884** | el Área con AI y AD, el contorno con su estructura, el resultado en el panel guía, y el censo del formulario intacto |
| **TC-885** | Simpson en mL y mL/m², el aviso sin peso o sin talla, la FEVI sin indexar, los mL sin moverse |
| **TC-886** | los seis puntos de la comunidad bloqueada, con la red instrumentada |

**Adaptados**: TC-208, TC-236, TC-241, TC-244 y TC-850 del bloque A, más **TC-250, TC-257 y
TC-262**, que la batería destapó — ver `docs/PENDIENTES.md` → **M2-a** y **M2-g**.

⚠️ **LOS TRES CASOS QUE MIRAN UN CAJÓN ASEGURAN EL MODO EN VEZ DE ALTERNARLO.** `d2Modo` y
`dopModo` son **toggles**: llamarlos a secas hereda el modo que dejó el caso anterior del lote y,
si ya era el que se pide, lo **apagan** y no se pinta ninguna tabla. TC-882, TC-883 y TC-886 usan
un ayudante que sólo llama al toggle cuando el modo no es el pedido, así que miden lo mismo
corridos solos y en cualquier lugar del lote. La sonda de dos motores tenía la misma trampa.

## 8 · La sonda de dos motores

`scripts/_probe_medir2.mjs` mide, en **Chrome y WebKit × 1440×900 y 1280×800 × los dos temas
reales** (puestos por `ett_theme` + `loadTheme()`, y la sonda **devuelve** cuál quedó): la tabla de
cinco columnas en los dos cajones, las filas calculadas, los nombres del Doppler pulmonar, el
**contraste** del selector, su **área táctil**, el **solape con la fila ENVUELTA** —con su
denominador: las líneas pasan de 3 a 5—, las dos estructuras del Área, el botón «Volumen» apagado,
el cartel con su texto, el bloque de Configuración, y **las tres rutas al informe ejercitadas de
verdad**. Lleva su **detector de que son dos árboles** (`tieneLoNuevo`).
