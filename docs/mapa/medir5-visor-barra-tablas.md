# MEDIR-5 — los arreglos del visor, la barra única y las tablas nuevas

> Mapa por **nombre de función y constante**, no por número de línea: la línea cambia en cada
> edición y el nombre no. Armado sobre el sello `v20261115-1403`.

---

## 0 · Los siete hallazgos del médico, y cuáles eran defectos

| | veredicto | qué lo causaba |
|---|---|---|
| **A1** · la tabla de una vista en la columna de la otra | defecto real | `_vSlotSync` mandaba los **dos** cajones a la ranura de la vista **activa**, mientras la visibilidad de cada uno se decide por «**alguna** vista» (`_d2HerrEnAlguna`, `_dopGrupoAbiertoEnAlguna`) |
| **A2** · «Limpiar» deja restos | defecto real | `medSimpsonLimpiarTabla` llamaba a `_simpIniciar()` pelado, o sea sobre la sesión del **destino** |
| **A3** · la imagen sube y tapa los botones | defecto real, **dos causas** | (1) `#cine-ov` centraba el modal vertical; (2) `flex-shrink` vale 1 por omisión y `#cine-lienzo` cedía hasta su `min-height` mientras el canvas no |
| **A4** · la barra del video desaparece | **consecuencia de A3(2)** | el recorte se desbordaba 39 px abajo; `elementFromPoint` sobre el slider devolvía `cine-med` |
| **A5** · no hay tabla tras la diástole | **por diseño** | `_simpMonoDeS` exige el par completo porque devuelve VFD, VFS y FEVI juntos |
| **A6** · dos ⓘ con el mismo texto | defecto real | se emitía en `_vBiplanoPintar` **y** en `_simpUniTexto`, con la misma clave |
| **A7** · el cartel de Ventana estorba | defecto real | la fila era un flex a ancho completo: **97 %** del panel |
| **A8** · el FAC del VD pierde la diástole | defecto real | `medReset()` hacía `_medAreas = []`, y mover el cuadro es **obligatorio** |
| **A9** · los carteles del Simpson en Doppler | **no reproducido** | con una vista el panel se esconde bien; el único camino es un trazado sin confirmar, que es el «Listo» de rescate de MEDIR-4b |
| **A10** · 1920 y 2560 px | no existía | cero `@media` por encima de 1500 px |

---

## 1 · El reparto de los cajones — `_vSlotSync`

**La tabla sigue siendo UNA sola y se sigue moviendo**: `_dop` y `_d2` son estado de módulo a
propósito (MEDIR-4a), porque la ecuación de continuidad necesita insumos de planos distintos.

Lo que cambió es **a qué ranura va**: a la de la vista que tiene **esa herramienta** abierta.

- `dueno(pred)` elige entre las candidatas: gana la **activa** si califica **y está a la vista**;
  si no, cualquiera **visible**; si no, la primera.
- `_vVisible(V)` mira el **panel** por `offsetParent`, no la ranura (que puede tener alto cero por
  estar vacía).
- Falla **abierto** por los dos lados: sin dueño cae en la activa, sin ranura el cajón se queda
  donde esté.

⚠️ **Por debajo de 1024 px la app muestra UNA vista por vez** (`#cine-paneles > div` a
`display:none`, alternado por `cine-ver-b`). Ahí el cajón viaja con su vista y **reaparece al
cambiar a ella** — correcto, porque la tabla es de esa imagen.

---

## 2 · El maquetado del modal — las dos causas de A3

```
#cine-ov { align-items: flex-start }      ← anclado arriba, NO centrado
#cine-ov [id$="cine-lienzo"] { flex: 0 0 auto }
#cine-ov #cine-paneles      { flex: 0 0 auto }
```

⚠️ **`modalScrollY.desborda` daba 0 y eso ocultaba el defecto**: el encogimiento en cascada
absorbía el crecimiento en vez de desplazar. Con `flex-shrink:0` el contenido que no entra se
**desplaza** dentro del modal, que ya es `overflow:auto`.

**Medido**: antes el lienzo subía **106 px** y no volvía con «Limpiar»; hoy **0 y 0**, con
**desborde 0/0** del recorte contra su lienzo en los tres momentos.

### El ancho extra (A10, M5-c)

```
@media (min-width: 1920px) { #cine-modal { max-width: 1860px !important } }
@media (min-width: 2560px) { #cine-modal { max-width: 2400px !important } }
```

Van con `!important` porque el tope vive en un **estilo en línea**. El ancho extra se lo lleva la
**imagen** y no la tabla **por construcción**: la columna de medición está fijada (380 / 340 px) y
la de la imagen es `flex:1`. Medido: `colMedW` queda en **340 px** a 2560, 1920 y 1440.

---

## 3 · La barra de herramientas — `_medSideRender` (B1)

Tres filas visibles —**2D**, **Doppler / M** y **Estructura**— más la fila **«Modo» escondida**.

- La fila «Modo» lleva la clase **`cine-selviejo`**, que esta hoja ya usa para los selectores
  viejos de los cajones. **No se retira** porque **19 usos del suite** aprietan `cine-g-*`.
- **No rompe la visibilidad de los cajones** porque `medHerramienta` ya hacía
  `_medGrupo = _MED_GRUPO_DE[_medHerr]`.
- La fila **Estructura** la decide `gAct = _MED_GRUPO_DE[_medHerr]`, **no** `_medGrupo`. Eso es lo
  que cumple «Tiempo y FC no cambian la lista de estructuras».

⚠️ **`_MED_EST_2D` y `_MED_EST_DOP` ya estaban en el orden que B1 pide** y no hubo que tocarlas.

---

## 4 · La tabla — `_medTablaHTML` (B2)

| columna | ancho | |
|---|---|---|
| Medida | 46 % | |
| Valor | 20 % | el más angosto |
| Acciones | 34 % | |

⚠️ **El 34 % sale de una medición, por un píxel.** Con 32 % la celda daba 100 px y su relleno
dejaba **90** de contenido, mientras los dos botones necesitan **91** (44 + 3 + 44, porque 44 es el
piso táctil global de `.btn`). Por ese píxel **envolvían**, y con `row-gap:22px` una fila con valor
medía **89 px contra 45**.

- **No hay ✏️**: el **valor es un botón** con `data-<pfx>-corr`, o sea la misma puerta que abría el
  lápiz. El **guion también se toca**.
- Reusa la clase **`med-fbot`**, que ya trae el área táctil medida: **se ve de 22 px y se toca en
  44** por un `::after` absoluto que no participa del flujo.
- «Borrar» pasa a **✕** — mismo atributo, mismo `dopBorrar`/`d2Borrar`, borra **de a uno**.
- Las filas **calculadas** no llevan botón: en cursiva y con «calculada».

---

## 5 · Las cuatro válvulas (B4 a B7)

**Una sola columna**: las dos **no entran** y está medido (M5-l) — dejan 40-46 px donde hacen falta
91. Se aplica la salvedad que el propio pedido trae.

### Los catorce campos nuevos, todos reusando el rótulo de la app

| válvula | claves nuevas de `_dop` | campo de la app del que sale el rótulo |
|---|---|---|
| mitral | `triv`, `tde`, `vmaxAlias`, `pisa`, `vc` | `triv`, `tde`, `pisa_val`, `pisa_r`, `im_vc` |
| aórtica | `jetDiam`, `vc` | `ia_jet_diam`, `ia_vc` |
| tricúspide | `ondaS`, `trivTdi`, `vtiVt`, `gradMedioVt`, `thpVt`, `vciDiam`, `vciCol` | `s_prime`, `dt_triv`, `et_vti_diast`, `et_gmedio`, `et_thp`, `vci_diam`, `vci_col` |

⚠️ **Las tres de la tricúspide viven bajo la ESTENOSIS (`et_`) y no bajo la insuficiencia**, que es
donde el primer censo las buscó mal. Y **`s_prime` es la onda del ANILLO por TDI**, no la «Onda S
pulmonar» de la vena pulmonar.

⚠️ **Ninguno escribe un campo del informe, y es por construcción**: `f[3]` de una fila es la ruta
dentro de `_dop`, que es lo que `dopCorregir` y `dopBorrar` tocan. Pasarlos al informe es
**MEDIR-4c**.

**Cuatro no llevan «Medir»** —`mit.pisa`, `mit.vc`, `ao.jetDiam`, `ao.vc`— porque son **distancias
sobre 2D** y esa herramienta no alimenta este cajón.

**«Grad Máx IT» → «G. Máx AD-VD»**: mismo cálculo, mismo corte, un nombre que dice entre qué
cámaras es ese gradiente.

---

## 6 · Los calculados y la FC — `_dopCalcFilas`, `_dopFcHTML`, `_dopCalcHTML`

Viven en **`#cine-calc`**, hermano de `cine-biplano`: **debajo de los dos paneles y centrado**.

⚠️ **Ninguna fórmula se escribe ahí.** Cada número sale del dueño único de la app:

| calculado | dueño |
|---|---|
| AVA y AVM por continuidad | `_avaContinuidad` |
| AVM por THP | `_avmPorPHT` |
| Volumen sistólico | `_hemoVSEco` |
| Gasto cardíaco | `_hemoGCEco` |
| indexado | `getBSA` |
| PmAD | `pmadEstimar` |
| gradiente máximo | `_medGradMmHg` |

⚠️ **El DVI es el único sin dueño**: está escrito **en línea** dentro de `calcEADetalle`, que lee el
DOM y no es alcanzable desde el visor. Se hace la **misma cuenta** sin cambiarla. Lo mismo **E/A** y
**E/e′**, que ya estaban en línea en `_dopDerivados`.

**El contrato numérico, medido**: AVA **1,5708**, DVI **0,50**, Vol. sistólico **69,115**, indexado
**38,015** con BSA 1,818, GC **4,838 L/min** con FC 70, E/A **1,60**, E/e′ **10,0**, AVM por THP
**1,00**, AVM por continuidad **3,456**, PmAD **3 mmHg**.

### La FC (B8)

Se pinta **antes del return temprano** de `_dopRender` a propósito: es «fija debajo de cualquier
imagen», o sea que tiene que verse **también sin ninguna válvula abierta**.

Sale de **`ao_fc`** con **`hemo_fc`** de respaldo — son **espejo**, los sincroniza `aoFcSync`.
**Medido: cero controles dentro del bloque**, así que la sola lectura es por construcción.

---

## 7 · El parcial del Simpson — `_simpVfdParcial`, `_simpFilasParciales` (M5-a)

⚠️ **Vive en su propia función y NO en `_simpFilasVivas`**, y de eso depende todo: esa función la
consumen `_simpResumen` (lo que se **persiste**), `_simpFilasTabla`, `_simpTablaCanvas` (la imagen
que va a la biblioteca y al PDF) y la **integración**. Metido ahí, un parcial se guardaría, saldría
en el papel y se podría integrar.

**Medido**: `nParciales 1` con `vivas 0`, `enTabla 0`, `enResumen 0`, `enCanvas false` y el campo
`fevi` vacío.

---

## 8 · La guía de calibración — `_medCalFalta`, `_medCalCartel` (B9)

**Tres ejes distintos**, y de eso depende que sirva:

| herramienta | eje | «Calibrar ahora» |
|---|---|---|
| Distancia, Área, Simpson | regla de profundidad | **sí** → `medRecalibrar` |
| Velocidad, VTI | eje de velocidad | **sí** → `medCalibrarVelocidad` |
| Tiempo, FC (y el VTI por su segundo eje) | eje del tiempo | **no**, no se puede calibrar a mano |

⚠️ **El predicado de la rama 2D es propio y no delega en `_medSinCalibrar`**: esa función arranca
preguntando por `_medHerr` —la herramienta **activa**— y se declaraba satisfecha con Velocidad
puesta, mientras acá se pregunta por la que se está **armando**.

El cartel se **destruye al cerrar**, así que no deja ningún id que los barridos de «Nuevo estudio»
puedan alcanzar.

---

## 9 · Cobertura

| caso | qué fija |
|---|---|
| **TC-899** | A1 y A2 — el cajón en la columna de su vista; «Limpiar» alcanza a las dos sesiones |
| **TC-900** | A3 y A4 — la imagen y los botones no se mueven; la barra del video sin nada encima |
| **TC-901** | B4 a B8 — el contrato numérico de los diez calculados; la FC de sólo lectura |
| **TC-902** | el visor **no escribe nada** en el informe: censo idéntico |
| **TC-903** | B1, B2 y B9 — la barra sin «Modo», la tabla sin lápiz, el cartel de calibración |

Los cinco caen **0/5 contra `2cd2ee9`** con el mismo archivo de casos.

**Casos adaptados**: los cuatro de C1 (`cine-med-cap` → `cine-cap`) y el del modo mínimo.

---

## 10 · Lo que esta tanda NO hizo

- **Pasar los catorce campos nuevos al informe** — es **MEDIR-4c**.
- **Retirar de verdad** los botones `cine-g-*` — son 19 usos del suite.
- Los puntos abiertos siguen **sin decidir** y están en `docs/PENDIENTES.md` → **M5-m**.
