# Mapa — P9: la biblioteca y la grilla del PDF, el repoblado de la reimpresión, los duplicados y la galería

Tanda **P9** (2026-11-21/22). Línea base `bada886`; sello **`v20261121-2158`**, md5 `d6a7d8dd`.
Commits: `82a1d89` (T1) · `a081ac6` (T2) · `7714f16` (T3) · `83c80cb` (T4).

> Se busca por **nombre de función y de constante**, nunca por número de línea.

---

## 1 · Las dos grillas de la pestaña Imágenes

| Qué | Quién |
|---|---|
| la grilla de **arriba** (lo que va al PDF) | `imgPdfRender` → `#img-pdf-grid`; su cuenta en `#img-pdf-cnt` |
| sus oyentes (✕, arrastre, reordenar) | `_imgPdfCablear`, **una sola vez** y por delegación |
| la grilla de **abajo** (la biblioteca) | `imgRender` → `#img-grid` (sin cambios de estructura) |
| **el dueño único del repintado** | `imgRender`: llama a `imgCuentaPintar`, `infMinPintar` y `imgPdfRender` |
| ¿esta imagen sale en el PDF? | `_imgEnPdf(slot)` — el MISMO predicado para las dos grillas |
| la lista que la grilla de arriba pinta | `infMinCapturas()`, **la misma** que las miniaturas del Informe |
| sacar del PDF (la ✕ de arriba, y la de la fila del Informe) | `infMinQuitarCaptura` |
| volver a incluir (la pastilla, el arrastre) | `infMinReincluir` |
| borrar de la biblioteca **y de todos lados** | `imgBorrarBib` → cartel propio `borrConfirmar` + `imgRemove` + `CeiboCine.borrar` de `_dcmId`/`_docId` |
| los dos botones de lote | `imgPdfTodas(on)`; ids `img-pdf-todas` / `img-pdf-ninguna`, que se **mudaron** a la sección de arriba |
| el contador «N fijas y M cines · K en el PDF» | `imgCuentaPintar` + `_imgCinesEnBiblioteca` + `_bibCinesN` |
| cuántos cines hay (lo publica la tira) | `cineStripRender` escribe `_bibCinesN`; se pone en **cero** en `imgVaciar` |

⚠️ **`_bibCinesN` se resetea en `imgVaciar`**: la cuenta de cines es **por estudio**, y sin eso
«Nuevo estudio» dejaba los del paciente anterior hasta que la tira volviera a dibujar.

⚠️ **El contador salió a su propia función** (`imgCuentaPintar`) porque la tira lo necesita y **no
puede llamar a `imgRender`**: hay un `MutationObserver` sobre `#img-grid` que vuelve a disparar la
tira en cada repintado, y las dos se llamarían en círculo.

## 2 · Con qué marca NACE una imagen (punto 1.4)

Todo pasa por la **puerta única** `imgCompressLoad(file, idx, origen, nombreSrc)`:

| `origen` | De dónde | ¿Al PDF? |
|---|---|---|
| `'mano'` | «＋ Agregar imagen», foto o archivo del celular (`imgFileChosen`), pegar (`imgPasteHandler`), el **📄** de una tarjeta de la biblioteca (`_bibAlSlot`) | **SÍ** (`noPdf` en falso) |
| `'ceibolink'` | el ecógrafo por cable o Wi-Fi | no |
| `'visor'` | capturas del visor | no |
| nada / `'estudio'` | pendrive, «Importar DICOM», «Importar imágenes y videos», «Desde imágenes guardadas» | no |

⚠️ **Se decide en la puerta y no en cada llamador**: con la marca escrita en los diez sitios que
llaman a esa función, el primero que se agregue sin ella manda al informe firmado una imagen que
nadie eligió. Y `'mano'` **no se persiste como origen**: se normaliza a `estudio`, por la misma
razón que `ceibolink`. Lo que viaja es `noPdf`.

## 3 · La biblioteca es la grilla **más** la tira, y cada cosa aparece una vez (1.6)

**La tira (`cineStripRender`) dibuja SOLO lo que NO tiene casilla.** De los slots sale únicamente
la lista de deduplicación de los registros de disco: `_dcmId` (el original de una fija) y `_docId`
(una tabla de medidas que ya fue al PDF). Con eso, una tabla guardada que antes aparecía **tres**
veces —su casilla, su ficha de slot y su registro— aparece una.

- `_docId` lo sella `_bibAlSlot` cuando el **📄** manda un documento a una casilla, y **se
  persiste** en las dos allowlists de `CeiboImg` (`guardar` y `agregar`) y en `imgRestaurar`.
- Una **fija sin casilla** dice si trae escala: el `nota` del registro se deriva de sus
  `regiones` con `_dcmImgRegionMedible`, el mismo predicado que usaba la ficha del slot.
- Lo que se perdió al dejar de dibujar las fichas de los slots —el ✕ que borraba el original
  DICOM— lo cubre ahora `imgBorrarBib`.

## 4 · El repoblado de la reimpresión (Tarea 2, el defecto grave)

`_pdfDeInformeGuardadoArmar` repuebla `imgSlots` desde `_pdfImgsEstudio`. **Copiaba tres campos**
y tiraba `noPdf`, `_srcKey`, `videoId`, `esquema`, `_dcmId`, `_docId`, `star` y `nota`.

- `noPdf` perdido → el PDF de un guardado salía con **todas** las imágenes (medido: 4 de 4 contra
  bada886, 2 de 4 hoy).
- `_srcKey` perdido → la deduplicación por archivo se quedaba sin clave y un reenvío volvía a
  entrar entero.
- `videoId` perdido → un video se reimprimía como foto.

**La allowlist es ahora la misma que la de `imgRestaurar`**, a propósito: son los dos caminos que
repueblan `imgSlots` desde el disco.

## 5 · Los cineloops que no entran, y los que no se duplican

| Qué | Quién |
|---|---|
| la clave de contenido de un cineloop | `_cineClave(loop)` — nombre, cuadros, bytes y hash de los primeros 4 KB del **primer** fragmento |
| no entra dos veces a la **cola** | `_cineEncolar` compara la clave |
| no se vuelve a escribir en **disco** | `_cinePendientesPersistir` arma `_yaEnDisco` desde `CeiboCine.listar(uuid)` |
| lo que no se pudo escribir | **vuelve a la cola** y se dice con el cartel propio (no un toast) |

⚠️ **Si la lista no se puede leer, no se deduplica**: escribir un duplicado cuesta espacio y se ve;
no escribir el único cineloop del estudio por un fallo de lectura cuesta la imagen.

## 6 · El registro de lo que ya entró (3.2) y el cartel de tres opciones (3.3)

| Qué | Quién |
|---|---|
| la clave de `localStorage` | `CLNK_VISTAS_KEY` = `ett_clnk_vistas`, tope `CLNK_VISTAS_MAX` = 4000 |
| leer / marcar | `_clnkVistasLeer`, `_clnkVistaDe(id)`, `_clnkVistasMarcar(ids, destino)` |
| los cuatro destinos | `estudio`, `guardado`, `bandeja`, `descartada` (`CLNK_VISTA_TXT`) |
| quién marca | `dstAlActual`, `dstAGuardado`, `dstABandeja` y `clnkDescartar`, cada uno en su camino de éxito |
| el reparto en nuevas y repetidas | `_clnkRepartir(g)` → `idsNuevos`, `idsRepes`, `repesDonde`, `nYaEstaban` |
| la frase de dónde están | `_clnkRepesTexto(g)` |
| las tres opciones | `_clnkPreguntarQue(g, nom)`; sigue con `_clnkAvisoArmarAcciones` sobre el subconjunto |
| el texto del cartel | `_clnkAvisoTexto`, que además publica `g.avSub` — la segunda línea, más chica |

⚠️ **Se guarda el ID DEL PUENTE y nada más** —se deriva del contenido, así que el mismo archivo
reenviado vuelve con el mismo id: es la regla 3.6—. La alternativa, comparar el hash de cada imagen
de cada estudio, obligaría a leer de IndexedDB todos los `dataURL` de todos los pacientes para
contestar una pregunta de pantalla.

⚠️ **El registro ATRAVIESA los casos de la batería**, porque vive en disco a propósito: se limpia en
el **reset del runner** (`__t.resetVisor`) y no en cada caso.

⚠️ **No se usa `clnkAvisoPreguntar`** —la pregunta anidada que espera— porque a
`clnkRevisarImagenes` la espera el sondeo.

## 7 · La galería de «Imágenes guardadas» (4.1)

| Qué | Quién |
|---|---|
| marcar o desmarcar una | `igSelToggle(it, sinPintar)` — con `true` **no toca el DOM** |
| «☑ Todas» / «☐ Ninguna» | `igSelTodas(on)`: mueve la selección y repinta **UNA** vez al final |
| la marca de «elegida», para las **dos** clases de celda | `igSelAdornar(boton, it)` |
| la estrella y el orden del PPT | `igImgAdornar` (sólo las fijas) |
| el póster de un cineloop | viaja en `data-ig-poster` y lo pinta `igImgPintarMiniatura`, en diferido |

⚠️ **`igSelToggle` repintaba la lista entera en cada ítem**: con 57 miniaturas eran 57 repintados
completos, y es lo que tiraba la pestaña. **No era la memoria de los videos.**

⚠️ **La celda de un cineloop volvía antes de `igImgAdornar`**, así que se podía elegir y no mostraba
la tilde, y su entrada nacía sin tipo ni nombre.

## 8 · El panel de CeiboLink y el rótulo de la dirección (4.2 y 4.3)

- `clnkLeerEquipos(forzar)` — `forzar` saltea **sólo la regla 1** (el foco adentro de la tarjeta).
  La regla 2 (misma firma, no se escribe un nodo) sigue valiendo. Lo piden los gestos: `separar`,
  `apodo` y las tres acciones del puente.
- `clnkEqConexion(ip)` — `169.254.` → «cable directo»; red de una interfaz de cable → **«cable
  directo»** (decisión del médico, 2026-11-22, que revierte EQ-b); Wi-Fi → «red del router»; sin
  poder deducir → **«tipo no determinado»**.

## 9 · Lo que esta tanda NO tocó

Cero cortes clínicos, cero fórmulas, cero umbrales. **Cero `<input>`, `<select>` y `<textarea>`
nuevos**, así que cero campos guardados nuevos y las **457** columnas del Excel quietas, por
construcción. Un solo `innerHTML` en el diff y es `g.innerHTML = ''` (la cadena vacía).
