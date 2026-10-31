# Mapa de funciones — el visor con video, el PPT con el cuadro fijo, el motor de tercios del PDF y el papel sin guías

Tanda **IMÁGENES-3** (2026-10-31). Cubre las partes A, B y C. La parte D —el diagrama 3D de la
transposición de las grandes arterias— **no se hizo** y está declarada en
`docs/PENDIENTES.md` → **IMG3-h**, con su inventario completo.

---

## 1 · El visor de «Imágenes guardadas» con video (Parte A)

| pieza | qué hace |
|---|---|
| `#ig-imgv-vid` | el `<video>` nativo, con `loop` y `muted` y **sin** `autoplay` |
| `#ig-imgv-vctl` | la fila de controles: play/pausa, ± cuadro y velocidad |
| `#ig-imgv-grande` | alterna 560 ↔ 1100 px de modal y 345 ↔ 522 px de visor |
| `igImgVisorVideoCargar(uuid, idx, sl)` | cruza el `videoId` del slot con `CeiboVideo.leer(uuid)` |
| `igImgVisorVideoSoltar()` | pausa, quita el `src`, revoca la URL de objeto |
| `igImgVisorPlaySync()` | el rótulo del botón sigue al estado REAL del elemento |
| `igImgVisorGrande(poner)` | sin argumento alterna; con `false` vuelve al normal |
| `IG_VID_PASO` | 1/30 s |

### ⚠️ Los bytes del video NO están en `CeiboImg`
El slot sólo lleva su `videoId`; los bytes viven en **`ceibomed_video`**, que es una base
aparte. Así que el visor de Guardados necesita **dos** lecturas: `igImgBlobs` para el slot y
`CeiboVideo.leer` para el blob. Y **no sirve `_videoBlobs`**, que es la memoria del
FORMULARIO: acá el estudio no está abierto.

### ⚠️ La guarda va ANTES de crear la URL de objeto
Si el médico ya cerró el visor, crear la URL la deja viva sin nadie que la revoque: el que
cierra es `igImgVisorVideoSoltar`, que mira `_igVisorVidURL`, y esa URL no llegaría a
escribirse ahí.

### ⚠️ `load()` sólo si HABÍA un `src`
Sobre un elemento sin fuente varios navegadores escriben un error de medio en la consola, y la
línea base de este repositorio es cero.

### ⚠️ En modo TAPA un video se trata como imagen
Tapar datos es un paso de la exportación del PPT y lo que se tapa es el cuadro que va a la
diapositiva: un reproductor con un rectángulo negro encima arriba del cual el cuadro cambia no
sirve para elegir dónde va el rectángulo. Ese camino queda idéntico a HEAD.

### «📏 Medir» no aparece sobre un video
No se mide sobre video —`medFijaClic` exige `slot._dcmId`, que un video no tiene— así que el
botón llevaba a un visor que iba a rechazarlo. Sobre una imagen queda igual.

### A 430 px o menos no hay botón de agrandar
Media query sobre `#ig-imgv-grande`. El visor ya ocupa el ancho.

---

## 2 · El PPT con video (Parte A, commit 2)

### Lo que ya existía, y la orden suponía que no
**El PPT del ESTUDIO ya incrusta el video** desde antes de esta tanda: `_pptAgregarVideos`
escribe `ppt/media/media-N-M.mp4`, la diapositiva lleva `<a:videoFile r:link>` más la extensión
`p14:media r:embed`, su póster como `<p:blipFill>`, y `[Content_Types].xml` declara `mp4`.
Con corrección de rotación y la salvedad del `.mov`.

### ⚠️ EL BUCLE NO SE PUEDE MARCAR, Y ESTÁ VERIFICADO POR DOS CAMINOS
1. el XML de un paquete generado de verdad **no tiene** `<p:timing>`, ni `repeatCount`, ni
   `cMediaNode`, ni `<p:video>`;
2. los **477.529 bytes** del bundle de PptxGenJS 3.12.0 tienen **cero** apariciones de
   `repeatCount`, `p:timing`, `cMediaNode` y de cualquier `loop*`.

«Repetir hasta detener» vive en el árbol de tiempos de la diapositiva y la librería no lo
escribe. Escribirlo a mano post-procesando el zip es posible —`_pptxDescargarSaneado` ya
post-procesa— pero **no se hizo**: no se puede verificar sin PowerPoint y este repositorio ya
documenta que una parte OOXML mal formada hace que PowerPoint pida reparar **y que al reparar
borre la diapositiva completa**. Está en `PENDIENTES.md` → **IMG3-a**.

### El «cuadro fijo» va donde corresponde
En el PPT de **«Imágenes guardadas»** un video elegido aporta su primer cuadro, por
`_igPptUsable`. Se usa un predicado PROPIO y **no** `_pptEsImagen`: ése excluye el póster a
propósito y lo leen el PPT del estudio —donde el video tiene su diapositiva— y su selector.
Cambiarlo allá metería el póster **dos veces** en el mazo del estudio.

### Los dos umbrales de tamaño
`PPT_VIDEO_AVISO_MB` (50, sobre los bytes de los videos) y `PPT_PPTX_AVISO_MB` (100, sobre el
ARCHIVO: los videos más `PPT_PPTX_PISO_BYTES`). **Un solo `confirm`**, con `if/else`: el de 100
manda porque dice lo mismo que el de 50 y además lo que pasa a ese tamaño.
De dónde sale la estimación, medido: los videos entran al zip ya comprimidos y no se inflan —
13.411 bytes de video dan un `.pptx` de 129.834.

---

## 3 · El motor de tercios de las hojas de diagramas del PDF (Parte B)

Referencia: `docs/3d/demo_pdf_diagramas_tercios.html`.
⚠️ **El archivo NO lleva el sufijo `_aprobado`** con que la orden lo nombra. Es el único de los
tres así; su contenido coincide con lo que la orden describe y su preset «Mi estudio de prueba»
da las dos hojas que la orden espera.

### Las seis reglas
R-1 tres franjas por hoja · R-2 Contractilidad y SGL primero, juntos, a todo el ancho ·
R-3 los demás de a dos, en el orden del registro · R-4 el texto de congénitas en hoja propia
con sus diagramas debajo · R-5 las capturas después de todos los diagramas, de a dos por
franja, continuando en la última hoja · R-6 nunca se corta un diagrama.

### Las piezas

| pieza | qué es |
|---|---|
| `PDF_DIAG_REG` | el **único dueño** del orden (su índice), el tamaño (`w`: 2 = franja completa, 1 = media) y la familia |
| `PDF_DIAG_EXC` | la única pareja que no va junta: `['tavi','vab']` |
| `pdfDiagPack(claves, caps)` | **PURA**: devuelve las hojas con sus franjas sin tocar el documento |
| `_pdfTile(box, k)` | dibuja un diagrama en su caja, con su rótulo, su leyenda y su línea |
| `_pdfCapTile(box, items, primera, ampl)` | dibuja una franja de capturas |
| `_dg` | lo que cada diagrama APORTA: `{partes:[{data, ar, leyenda, sub}], linea}` |
| `PDF_MITRAL_LEY` | la leyenda de colores de la vista quirúrgica, a nivel de módulo |
| `pdfMitralLinea()` | la línea de texto de la mitral |

### ⚠️ Nada se corta POR CONSTRUCCIÓN, no por presupuesto
El alto de la **línea** se mide primero y se le resta al hueco del dibujo, y el dibujo se escala
a lo que queda. No depende de que un `checkPage` esté bien calculado, que es cómo este archivo
ya se cortó dos veces.

### ⚠️ La orejuela entra como diagrama SÓLO si no fue junto a su tabla
Es la regla del AJ1-2a y no se movió: con la sección integrada el dibujo va al lado de su tabla
y **no** se repite. `_oaiEsqIdx` se suma a `_oaiSlotUsado` para que la captura no vuelva a
entrar por el reparto de imágenes.

### ⚠️ La CIA va debajo de su texto, y si no hay texto va al motor
`PDF_DIAG_REG` la declara con familia `cc`. La hoja de congénitas estampa los de esa familia
bajo su texto; si el módulo no dejó texto no hay hoja bajo la cual ponerla y entra al motor por
su fila del registro.

### ⚠️ `ete_seg_A1`..`ete_seg_P3` guardan un ENTERO, no un nombre, y el 0 es «Normal»
Los seis campos valen `'0'` en todo estudio: tratar el valor como texto publicaba
«0: A1, A2, A3, P1, P2, P3» en el papel de un paciente sin una sola lesión marcada.
Los rótulos salen de `window.ETE_ESTADOS`, que se **exporta** desde su cierre para que no haya
dos copias de los seis nombres.

### ⚠️ `im_grado` es un campo NUMÉRICO con `'0'` de fábrica
Leerlo crudo publicaba «Insuficiencia mitral · 0». El grado sale de `_oaiImGrado()` y su rótulo
de `_CC_GRADO`, que son los mismos dueños que usa el resumen de la orejuela.

### Lo que el texto del PDF pierde y gana
Las tablas de la bicúspide, de la orejuela y de la CIA pasan a una **línea compacta**, con el
MISMO dueño de las palabras (`vabPdfFilas()`, `oaiResumenPDF()`, `eteCiaBordeMin`/`ccQpQsDe`).
Medido por conjuntos: todo texto que se fue tiene su equivalente en el que llegó.

### Hojas, antes y después (PDF generado de verdad)

| escena | hojas | con diagramas | dibujos |
|---|---|---|---|
| el estudio del médico | 5 → **3** | 5 → **2** | 6 → 6 |
| mitral + orejuela + bicúspide | 3 → **2** | 3 → 2 | 3 → 3 |
| jet post-TAVI + bicúspide | 1 → **2** | 1 → 1 | 2 → 2 |
| todo + 8 capturas | 6 → **5** | 6 → 5 | 16 → 16 |
| sólo 5 capturas | 2 → 2 | 1 → 1 | 5 → 5 |
| vacío y ajeno | 1 → 1 | 0 → 0 | 0 → 0 |

⚠️ **El jet post-TAVI con la bicúspide SUBE de 1 a 2 hojas**: con dos diagramas y nada más,
HEAD los dibujaba inline en la hoja del cuerpo y hoy los diagramas tienen hoja propia, que es
lo que R-1 pide. Es el precio de la maqueta aprobada y se paga una vez por estudio.

### El FOP no tiene dibujo
Contra lo que la demo supone: `fopPdfFilas()` es una tabla y no hay ninguna función que dibuje
un FOP, censado. Queda como sección de texto.

---

## 4 · El papel y la pantalla sin guías (Parte C)

### La cápsula de la coartación
`coaPantalla(c, src)` es el dueño del texto de PANTALLA. El clasificador no se toca: `c.clave`,
`c.via` y `c.txt` quedan idénticos, y `c.txt` es lo que sigue leyendo el panel de Evidencia.
Las tres claves de **indicación** no tienen cláusula en `COA_PAPEL` —su contenido ERA la clase
y la conducta— así que para ellas la pantalla dice lo que se midió.
El ⓘ `coa-card` recibió el bloque «Criterio de sospecha por Doppler», con los **dos folios**:
120 de la edición en español de la SEC y 3649 de la inglesa. Discrepan y no se puede elegir uno.

### Las dos citas
`VEXUS_SALVEDAD` pierde la cita bibliográfica y conserva la salvedad. La cita vive entera en
`IND_REFS.vexus2020`. El rótulo de la diastólica entra al PPT por `_pptSinGuia`, que recorta el
nombre de la sociedad del final: el mismo span publica **nueve** rótulos, no uno.

### El podador del PPT de congénitas
`_ccPptPodar(t)` **poda, no reescribe**: parte el texto por sus propios separadores —guion
largo, punto y coma, punto, dos puntos y la subordinada «, que …»— y descarta el segmento que
nombra una guía o lleva un verbo de conducta. Dentro de un paréntesis quita la **fuente** y no
el paréntesis entero.

**Tres guardas, y las tres nacieron de una medición:**
1. los dos puntos y «, que …» son separadores — sin ellos se perdía un hallazgo;
2. la fuente se quita DENTRO del paréntesis — sin eso «(Task Force 2010: 0 puntos)» se iba
   entero y el PPT perdía el puntaje;
3. **ningún número medido puede desaparecer** (los años no cuentan) — es lo que para la
   miocardiopatía hipertrófica, donde «desfibrilador razonable (3 sin evaluar)» pega una
   recomendación a un recuento.

Y la regla de cierre: **todo o nada**. Si después de podar sobrevive un marcador, o se perdió un
número, o no quedó nada, se devuelve el texto ORIGINAL y la sección queda **parada**.

Medido sobre veintidós estados: **ocho podadas, una parada** (la miocardiopatía hipertrófica) y
trece sin cambio.

---

## 5 · Los arneses de esta tanda

| script | qué mide |
|---|---|
| `_probe_img3visor.mjs` | el visor, con un video fabricado con MediaRecorder y guardado por el camino real |
| `_probe_img3ppt.mjs` | los dos PPT generados de verdad, con su XML leído con el JSZip del bundle |
| `_probe_img3pdf.mjs` | el PDF con COORDENADAS y por hoja, con carga limpia por escena |
| `_ab_img3pdf.mjs` | compara dos volcados: hojas por escena y qué texto se fue y cuál llegó |
| `_probe_img3demo.mjs` | corre el `pack()` de la demo y el `pdfDiagPack()` de la app lado a lado |
| `_probe_img3raster.mjs` | genera el PDF, lo rasteriza con pdf.js y guarda un PNG por hoja |
| `_probe_img3c.mjs` | la cápsula, el barrido de pantalla y las dos citas en las cuatro superficies |
| `_probe_img3cc.mjs` | las once secciones del PPT de congénitas, en dos estados cada una |
| `_mut_img3.py` | las veinte mutaciones dirigidas |

### ⚠️ Trampas que esta tanda pagó
- **`page.evaluate` con un STRING evalúa la expresión y DESCARTA el argumento.** La comparación
  con la demo daba «12 de 12 iguales» sobre un denominador vacío: devolvía la función, no
  serializable, y los dos lados leían `undefined`. Dos `'ERR'` comparan iguales.
- **`_pdfAjustarA4` genera el PDF VARIAS veces.** Un registro acumulado sumaba las pasadas: la
  escena del médico daba 13 hojas con la misma secuencia repetida cuatro veces.
- **`limpiarCampos(true)` NO vacía `imgSlots`**, ni deshace un stub, ni saca el esquema de la
  orejuela: midiendo en serie, la escena «vacío» llegaba con trece capturas. Una carga limpia
  por escena.
- **El PNG de 2×2 heredado de otras sondas** hace que jsPDF tire «Incomplete or corrupt PNG
  file» al meter varios en la misma hoja, y el PDF sale de UNA página sin que eso diga nada.
- **`guardarInforme` no llama al callback** sin nombre del paciente ni con el gate de
  severidades valvulares abierto; y **`generarPPT` encadena TRES modales**, no dos: tema,
  presentador y qué imágenes — y los videos arrancan **sin tildar** en el tercero.
- **Los nodos de la grilla de imágenes se desprenden en cada repintado**: clickear una lista
  cacheada elige UNA sola.
- **El marcador de reemplazo `ID` aparece dentro de la palabra `VIDEOS`** (`V-ID-EOS`).
- **El acento grave dentro de un comentario del template**, cuatro veces en tres archivos.
  `check_backticks.py` no caza ninguno; **`node --check` los caza todos**.

---

## La fila octava del registro — tanda TGA (2026-10-31)

Puntero. El detalle está en **`docs/mapa/tga-diagrama-3d.md`** § 4.

`PDF_DIAG_REG` pasa de **siete a ocho** filas: `{ k:'tga3d', w:1, fam:'cc', lbl:'Transposición de
grandes arterias — esquema 3D' }`, al final, detrás de la CIA.

⚠️ **El comentario del motor decía «agregar otro congénito no toca este bloque» y era FALSO por un
renglón.** La exclusión del motor estaba escrita `k === 'cia' && _ciaEnSuHoja`, una bandera para la
CIA, así que un segundo congénito se estampaba debajo del texto de su módulo **y** volvía a entrar
al motor: el mismo dibujo **dos veces** en el informe firmado. Hoy es `_ccEnSuHoja`, un array, y
ahora sí agregar un congénito es una fila del registro y su recolector.

⚠️ **El recolector del esquema 3D va ANTES de la hoja de congénitas, y es por el orden de
ejecución** — no junto al de la orejuela, que va después. Esa hoja lee `_dg` unas cuatrocientas
líneas más abajo pero **antes** del bloque de la orejuela.
