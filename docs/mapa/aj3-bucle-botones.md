# Mapa — el bucle del video en los PPT, los botones de la Evidencia, la cláusula de la IT sistémica y la miocardiopatía del PPT

> **Tanda AJUSTES-3 (2026-10-31).** Cinco commits de código y documentación sobre el cierre de
> TGA-2 (`8d37a65`). Cierra **IMG3-a**, **IMG3-g** (en parte) y **TGA2-b**.
>
> Lo que **no** está acá: el registro de citas del panel (`docs/mapa/panel-evidencia-citas.md`),
> la anatomía de una sección (`docs/mapa/panel-evidencia-secciones.md`), el motor de tercios del
> PDF (`docs/mapa/img3-visor-tercios.md`) y el banco de imágenes de Guardados
> (`docs/mapa/img-guardadas.md`).

---

## 1 · El bucle del video — `_pptxBucleVideos`

### Dónde vive y por dónde pasa

| Pieza | Qué hace |
|---|---|
| `_pptxBucleVideos(zip)` | el post-proceso. Recorre `ppt/slides/slideN.xml`, arma todas las diapositivas en memoria, valida, y recién entonces escribe. Devuelve `{diapos, videos, falla}` |
| `_pptxBucleEnDiapo(xml)` | marca **una** diapositiva. Devuelve `{xml, spids}` o `null` |
| `_pptxPicsDeVideo(xml)` | los `<p:pic>` que llevan `<a:videoFile>`, con el `id` de su `<p:cNvPr>` |
| `_pptxXmlValido(xml)` | parseo estricto con `DOMParser`; exige que la raíz sea `p:sld` |
| `_pptxDescargarSaneado` | **el único punto de descarga** de los tres exportadores. Llama al bucle después de la poda de `[Content_Types].xml` y antes de `generateAsync` |

Las tres primeras están en `window` por la misma razón que `_ccPptPodar`: **TC-568** las mide sin
generar un `.pptx`, que cuesta decenas de segundos y depende de que el CDN conteste —el rojo
intermitente que `E-h` documenta—.

### El árbol de tiempo, y de dónde sale cada pieza

```
<p:timing><p:tnLst><p:par>
  <p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>
    <p:video><p:cMediaNode vol="80000" showWhenStopped="1">
      <p:cTn id="N" fill="hold" display="0" repeatCount="indefinite">
        <p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>
      </p:cTn>
      <p:tgtEl><p:spTgt spid="M"/></p:tgtEl>
    </p:cMediaNode></p:video>     ← UNO POR VIDEO de la diapositiva
  </p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>
```

Va **después de `</p:clrMapOvr>`**, que es el orden que `CT_Slide` declara: `cSld`, `clrMapOvr`,
`transition`, `timing`. Ponerlo antes invalida la parte entera (la mutación **02** lo fija).

La procedencia de cada etiqueta está transcripta en `docs/fuentes/FUENTES.md` → «La tanda
AJUSTES-3». El **valor** `indefinite` es el único que no sale de la norma: lo sostiene la
reproducción del esquema de datypic, que es un tercero, y por eso la tanda TGA lo probó fuera del
producto antes de traerlo acá.

### Lo que lo sostiene: el experimento que el médico abrió

`~/Desktop/ceibo-experimento-ppt-bucle/experimento_bucle_video.pptx` — **fuera del repositorio y
sólo de lectura**. Lo generó la tanda TGA con el XML escrito a mano y **el médico lo abrió en
PowerPoint el 31/10/2026: no pidió reparar y el video se repite sin parar.**

El `p:timing` que `_pptxBucleEnDiapo` escribe es **idéntico carácter por carácter** al de ese
archivo, **salvo el valor del `spid`**, y eso está medido en los dos caminos
(`scripts/_probe_aj3bucle.mjs` → `experimento.vsEstudio` y `vsImagenes`).

⚠️ **La diferencia del `spid` es deliberada.** El experimento cableó `10`; acá es `max + 1` de
los `id` de esa diapositiva. Un 10 cableado falla en una diapositiva con diez shapes.

### Por qué el video gana un `id` nuevo

**PptxGenJS 3.12.0 emite dos shapes con el mismo `id` en la misma diapositiva** —el segundo
cuadro de texto y el video salen los dos con `id="3"`, medido—. Un `spTgt` ambiguo podría por sí
solo hacer que PowerPoint se queje. Es seguro cambiarlo: el `id` de `p:cNvPr` es local a su
diapositiva y lo referencian sólo el árbol de tiempo y las animaciones, y esta librería no
escribe ninguna.

### ⚠️ FALLA CERRADA, al contrario que la poda de partes de la misma función

Una parte OOXML mal formada **no abre con una advertencia**: PowerPoint pide reparar y al reparar
**borra la diapositiva completa** —es el defecto que `_pptHex` documenta, con dos hojas en blanco
reportadas el 2026-09-16—.

Por eso es **todo o nada**: las diapositivas se arman en memoria, se validan **todas**, y recién
entonces se escriben. Si una sola no valida, **ninguna** se escribe, el mazo sale sin bucle como
hasta hoy, y se avisa. *Un video que no se repite es una molestia; una diapositiva que PowerPoint
borra es una pérdida.*

La mutación **05** y las condiciones **(G1)(G2)** de TC-568 lo fijan, y hizo falta un escenario de
**dos** diapositivas con video —una que valide y otra que no—: con una sola, «todo o nada» y
«salteo la que falla» dan el mismo resultado.

### Los dos caminos, y qué cambió en cada uno

| | antes | ahora |
|---|---|---|
| **PPT del estudio** | incrustaba el clip, sin repetición | lo incrusta **y lo repite** |
| **«Imágenes guardadas» → «Armar PPT»** | sólo el **primer cuadro**, con aviso | **el clip completo**, en la celda de su grilla, con el cuadro ya tapado de póster |

⚠️ **El texto «▶ Clic sobre la imagen para reproducir · el video no arranca solo» NO se tocó.**
Sigue siendo cierto —el bucle arranca al clic, `delay="indefinite"`— y decir «se repite» mentiría
el día que el bucle caiga.

### `_pptVideoMp4Preparar` — el dueño único

«blob de video → lo que `addMedia` necesita», compartido por los dos caminos. Se extrajo al abrir
el segundo: **la corrección de rotación** (el `tkhd` con las dimensiones intercambiadas) y **la
salvedad del `.mov`** son dos reglas delicadas, y con una copia en cada camino el día que una
cambie el otro queda atrás. No cubre cineloops: ésos hay que codificarlos antes, y eso es propio
del PPT del estudio, el único camino que los ofrece.

Los avisos se **devuelven** en una lista en vez de empujarse: cada camino los publica por su vía
—el del estudio por `_pptAvisos` y sus toasts, el de imágenes por su línea de resultado—.

### Los avisos de «Imágenes guardadas»

- **Privacidad** (`igImgPptPedir`): se corrigió. Decía que «de un video va sólo su primer cuadro»
  y dejó de ser cierto; ahora dice que **el clip entra completo** y que «Tapar datos» sólo tapa su
  primer cuadro. **TC-558 (D1)** lo fija.
- **Tamaño**: los dos umbrales, por las **mismas constantes** que el otro camino
  (`PPT_PPTX_AVISO_MB` manda sobre `PPT_VIDEO_AVISO_MB`). Va **después** de leer y no en el aviso
  previo, porque los bytes del video no están en el índice de la pantalla: viven en
  `ceibomed_video`.
- **Caída**: un video que no se puede leer o preparar queda en su primer cuadro, y la línea de
  resultado dice **el motivo**.

---

## 2 · Los botones de respuesta del panel de Evidencia

### La premisa de la orden era parcialmente falsa, y está medida

`_probe_aj3btn.mjs`, dieciséis cruces (dos punteros × 1440/1000/768/390 px × dos temas):

| | alto | con 44×44 | encima de otro control |
|---|---|---|---|
| **puntero grueso** (dedo, tablet) — HEAD | 44 | 39/39 | **0** |
| **puntero fino** (mouse) — HEAD | **22** | 0/39 | **5** |
| los dos, después | **44** | **39/39** | **0** |

O sea: **en la tablet al lado del ecógrafo ya estaban bien**. Con mouse medían 22 no por un bug
sino por una media query deliberada, `@media (pointer:fine){ … min-height:0 }`, con su decisión
escrita. Lo que **sí** era un defecto: cinco de los 39 tenían parte de su cuadrado táctil encima
de otro botón de su misma botonera (las dos preguntas del HFA-PEFF).

### Por qué el mecanismo es sacarla de la media query, y no un `::after`

Las dos mediciones que lo decidieron:

1. **El panel no crece.** Con el botón en 22 y en 44 mide **lo mismo** —818×745 a 1440 px y
   364×729 a 390—, porque las filas de la tabla ya tenían ese alto por su propio relleno. El costo
   que el comentario del código advertía no existe para la botonera.
2. **Con 22 px hay solape y con 44 no.** Agrandar el área con un `::after` —el patrón de
   `.pac-id-mk`— habría **tapado** el control vecino, que es justo lo que la orden prohíbe. Con el
   botón creciendo de verdad el flex los acomoda.

No revierte la decisión del 2026-09-25 («se conserva el piso y lo que baja es el **peso
visual**»): la cumple. El peso visual lo bajan el relleno y el tamaño de letra del `style` en
línea, no el piso.

**El ⓘ de un término (`data-ind-term`) se queda en la media query, y ahora es el único.** Ahí sí
se paga: el glifo vive en la celda del rótulo y no en una botonera que ya ocupa el alto de la fila.

### El estado ya no depende sólo del color

`aria-pressed` cubría al lector de pantalla. El botón marcado lleva además **`✓ ` delante del
rótulo**: una diferencia de **forma**, legible sin color. El ancho cambia al marcarlo y está bien
—el botón ya cambia de color en el mismo gesto—.

⚠️ **Los nodos del panel se desprenden en cada repintado** (contestar una pregunta lo repinta), así
que toda medición vuelve a consultar el DOM después del gesto. Es la trampa que TC-550 documenta.
Y el panel es un modal `position:fixed`: **`offsetParent` da `null` aunque esté abierto**.

---

## 3 · La cláusula de la insuficiencia tricuspídea sistémica

La oración, **sus palabras intactas**, de `61f6968` (índice 18038):

> «La válvula tricúspide de estos pacientes es la auriculoventricular sistémica: su insuficiencia
> pesa como pesaría una mitral.»

Vive en el **`ojo` del globo `tga-3d`**, que es el **único ⓘ de `#sacc-cc-tga`**.

- **El antecedente se explicita afuera.** En el párrafo original «estos pacientes» eran los de la
  TGA corregida; suelta, la frase se quedaba sin sujeto.
- **Rotulada «Criterio de EcoSmart»**, porque la analogía no está en ninguna hoja leída. Lo que el
  registro sí tiene es la recomendación 4 de la tabla de intervención tras switch auricular de la
  **ESC 2020, hoja 57, folio 619, IIa · C**, que manda considerar la reparación o el reemplazo con
  insuficiencia severa de la auriculoventricular sistémica «independientemente de los síntomas»:
  respalda el **concepto**, no la frase.
- **Sin folio, sin clase y sin nombrar la guía en el ⓘ**: esta línea no es una recomendación.

**Lo demás del párrafo retirado no se había perdido**, verificado: `TGA3D_INFO.ltga` y
`TGA3D_INFO.mus` lo dicen por escenario, más `tgaConclusion` en el informe de esas anatomías.
**TGA2-b queda cerrado.**

---

## 4 · La miocardiopatía hipertrófica del PPT de congénitas

### Por qué la poda estaba parada (IMG3-g)

`_ccPptPodar` devuelve **`parado: true`** sobre el texto real: «desfibrilador razonable (Clase
IIa)» está **pegado** a «(1 sin evaluar)», y llevarse la recomendación se lleva el 1 — la guarda 3
del podador («ningún número medido puede desaparecer») lo detecta y devuelve el original.

### Por qué no se reordenó el `resumen`

**Lo leen dos consumidores y los dos son papel firmado**: la hoja del PDF (`ccHoja('mch', …)`) y la
diapositiva del PPT. Es el defecto que la tanda AJ7 pagó con la Fallot. Mover «(N sin evaluar)»
delante del guión habría movido el PDF.

### La salida: `mchConclusion().papel`

`CC_PPT` le pone `papel:true`, igual que la coartación en AJUSTES-2. Y **no son dos textos
paralelos**: se arman de las mismas piezas.

```
_escDesc + _escCond                              → resumen  (PDF, idéntico a HEAD)
_escDesc (sin la sigla del score)                → papel
+ '. AHA/ACC 2020: ' + _ahaCuenta + _ahaCond + _ahaPend   → resumen
+ '. Factores mayores de riesgo de muerte súbita: ' + _ahaCuenta + _ahaPend → papel
```

⚠️ En el `papel` el «(N sin evaluar)» va **pegado al recuento**, que es a lo que califica; en el
`resumen` queda **después de la conducta**, como estaba, porque ese orden lo lee la hoja del PDF.

Las cuatro coletillas —resonancia, TV sostenida, aplicabilidad, obstrucción severa— van a **las
dos** salidas, sin la sigla de la guía: ninguna recomienda.

**Medido: `resumen` idéntico a HEAD en seis escenarios.**

### La guía, leída en imagen

AHA/ACC 2024 de miocardiopatía hipertrófica (Ommen et al, *Circulation* 2024;149:e1239-e1311),
**hoja 29, folio e1267**, apartado 7.2. **Regla de folio: folio = hoja + 1238**, comprobada en el
pie impreso de las hojas 26 y 29.

Coincide con lo que la app aplica: **COR 2a** («it is reasonable to offer an ICD») con **≥1 factor
mayor**, y los **cinco** factores uno por uno contra los cinco de `mchAHA`. La recomendación 6
(**COR 2b**, sin factores mayores, con realce tardío extenso o TVNS) es el árbitro Clase IIb que la
app ya publicaba.

### Lo que se paró

1. **La etiqueta «AHA/ACC 2020»** en el informe, el EN SUMA y el PDF: la guía vigente es la 2024 y
   coinciden en todo salvo el año. → `AJ3-a`.
2. **El cuerpo del informe que el PPT proyecta** sigue diciendo la recomendación y la guía: las
   primeras diapositivas llevan `informe_texto` entero. → `AJ3-b`.

---

## 5 · Dónde está cada cosa

| | |
|---|---|
| Casos | **TC-568** (bucle), **TC-569** (botones), **TC-570** (cláusula), **TC-571** (MCH del PPT) |
| Adaptados | TC-558 (D1), TC-563 (C2, C6 → C8), TC-567 (título, A2, A2b, A4, C1, C2b) |
| Mutaciones | `scripts/_mut_aj3.py` — 18, cuatro de ellas «de más» |
| Sondas | `_probe_aj3bucle.mjs` (los dos PPT de verdad), `_probe_aj3btn.mjs` (los dos punteros, 16 cruces), `_probe_aj3ab.mjs` (A/B de superficies), **`_probe_ajustes3wk.mjs`** (dos motores) |
| ⚠️ El nombre | **`_probe_aj3wk.mjs` NO es de esta tanda**: es la sonda de dos motores de la tanda **AJ3 del 23/10/2026**, otra con la misma sigla. Escribir la de acá con ese nombre la sobrescribe — pasó, y se restauró byte por byte desde `8d37a65`. El mapa de aquélla es `docs/mapa/aj3-ett-avanzado.md` |
| Fuentes | `docs/fuentes/FUENTES.md` → «La tanda AJUSTES-3» |
| Declarado | `docs/PENDIENTES.md` → **AJ3-a** a **AJ3-g** |
