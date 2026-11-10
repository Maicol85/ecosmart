# Documentos del Informe — constancia y consentimientos (PANT-30)

> ## ⚠️ LOS TEXTOS SON UN MODELO. LA INSTITUCIÓN TIENE QUE REVISARLOS.
>
> Las cuatro hojas que esta app genera son **plantillas de trabajo**, no un formulario
> aprobado. Antes de usarlas con pacientes, cada institución tiene que hacerlas revisar por
> quien corresponda —dirección técnica, asesoría jurídica, comité de ética— y adaptarlas a sus
> procedimientos. La app no valida, no aprueba y no certifica nada de este contenido.
>
> **La hoja es editable a propósito**: el médico puede corregir cualquier palabra antes de
> imprimirla, y esa es la vía prevista para ajustar el texto a cada caso y a cada institución.
>
> **Base normativa de referencia (Uruguay)**, según la orden de trabajo de esta tanda:
> **Ley 18.335, artículo 11** y **Decreto 274/010, artículo 25**. Están citados como la
> referencia que el médico indicó; esta aplicación no interpreta esas normas ni afirma que los
> textos de abajo cumplan con ellas. Esa verificación es de la institución.

---

## Qué son los cuatro documentos

| Clave | Documento | Hojas | Para qué |
|---|---|---|---|
| `constancia` | Constancia de asistencia | 1 | Sirve para **todos** los estudios |
| `cve` | Consentimiento: cardioversión eléctrica | 1 + 1 de hojas comunes | |
| `ete` | Consentimiento: ETE con sedación | 2 + 1 de hojas comunes | |
| `burb` | Consentimiento: test de burbujas | 1 + 1 de hojas comunes | |

**No hay consentimiento de ecocardiograma transtorácico ni de eco de estrés, y no es un olvido.**
Medido en la TAREA 0: esta app no tiene un catálogo de tipos de estudio, tiene **una casilla**
(`#ete-es-ete`) y **dos** nombres —«Informe Ecocardiograma Doppler Color» y «Ecocardiograma
Transesofágico»—, y el eco de estrés no tiene interfaz (su código vive en el archivo sin
pantalla; ver `docs/mapa/eco-estres-inventario.md`). El menú muestra las cuatro opciones
siempre activas y no ofrece nada para esos dos.

---

## Los datos que la app pone, y de dónde salen

| En la hoja | Campo o clave |
|---|---|
| Institución | `sv('med-centro')`, y si no el centro activo. En modo institucional **no** cae a «CeiboMed» |
| Logo | `localStorage['logo_centro_' + centro_tipo_activo]`, validado con `LOGO_DATA_OK`. Sin logo va un círculo con las iniciales |
| Ciudad | `#cfg-med-lugar` («Ciudad / Lugar» de ⚙️ Config). Es **opcional**: sin cargar sale una raya |
| Paciente | `#nombre` |
| Artículo | derivado de `#sexo`, en **tres** estados: «el paciente» / «la paciente» / «el/la paciente» |
| Documento | `#doc_tipo` (CI / DNI / CPF) y `#ci` |
| Estudio | derivado de `#ete-es-ete`: «un ecocardiograma transtorácico» o «un ecocardiograma transesofágico» |
| Médico y matrícula | el médico **Principal** de ⚙️ Config → Médicos (`ecoGetMedicos`) |
| «Título» del médico | ⚠️ **no existe un campo de título en esta app.** Se usa la **especialidad** de Config cuando está cargada; si no, la línea sale con el nombre y la matrícula y nada más. No se inventa un «Dr.» |
| Fecha | la del **día**, no la del estudio |

Un dato que falta sale como `____` para completar a mano. **Nunca** sale el marcador crudo.

---

## Cómo se usa

1. Pestaña **📝 Informe** → botón **📄 Documentos ▾** (en la misma fila que «Regenerar Informe»).
2. Se elige una de las cuatro opciones. Se abre una hoja sobre el informe, con su barra arriba.
3. **La hoja es editable.** En pantalla, los datos que vienen de la app se ven en **azul**; en el
   papel y en la imagen salen en **negro**.
4. **🖨️ Imprimir** genera un PDF con **sólo la hoja** — no con la pantalla.
5. **🖼️ Guardar en Imágenes** deja una miniatura reabrible desde **Guardados → Imágenes
   guardadas**. Volver a guardarla la **reemplaza**; **Quitar de Imágenes** la saca.
6. Si se editó la hoja y después se cambia un dato en la app, al reabrirla aparece
   **«Actualizar con los datos»**. Hasta apretarlo **no se toca nada** de lo escrito a mano.

### Lo que puede impedir el guardado en Imágenes, y la app lo dice

1. No hay almacenamiento disponible.
2. La casilla **«Guardar imágenes con los estudios»** (⚙️ Config → «🖼️ Imágenes del estudio»)
   está apagada. **De fábrica está apagada.**
3. El estudio **todavía no se guardó** (hasta el 💾 no hay identificador al que atribuirle la
   imagen).

---

## Lo que esta función NO hace

- **No guarda el texto corregido a mano.** Vive en memoria mientras la pestaña está abierta:
  recargar la página lo descarta. Un campo persistido sería un campo del estudio más y una
  columna de Excel más → declarado en `docs/PENDIENTES.md` → **P30-a**.
- **No manda nada a ninguna parte.** Todo se arma en el navegador: ninguna llamada de red
  nueva, ninguna librería nueva, ninguna clave tocada.
- **No entra al informe firmado.** La imagen guardada va a la lista de **esquemas** (`esqs`),
  que ninguna superficie firmada lee: el PDF del informe imprime los **slots** (`imgs`), y ahí
  no entra.
- **No afirma nada clínico ni legal.** No dice que un procedimiento esté indicado, no gradúa
  riesgos y no reemplaza la conversación con el paciente.

---

## El formato de impresión, medido

A4, márgenes de **14 mm** a los lados, **12 mm** arriba y **13 mm** abajo; texto **justificado**
palabra por palabra; pie con el título del documento y «Página X de Y» en **todas** las hojas.

| Documento | Cuerpo | Interlineado | Hojas | Aire libre en la última hoja de texto |
|---|---|---|---|---|
| Constancia | 10,5 pt | 16 pt | 1 | 176,5 mm |
| Cardioversión | 8,8 pt | 11 pt | 1 (+1) | 16,9 mm |
| ETE | 10,2 pt | 13,4 pt | 2 (+1) | 68,3 mm |
| Test de burbujas | 8,8 pt | 11 pt | 1 (+1) | **5,3 mm** |

⚠️ **El test de burbujas cierra con 5,3 mm libres**, que es poco más de una línea. Los textos y
el cuerpo de 8,8 pt los fija la orden del médico, así que no hay de dónde sacar más aire: un
nombre de institución lo bastante largo para envolver a dos líneas se come casi todo ese
margen y el documento pasaría a dos hojas. Declarado en **P30-b**.

### Dos cosas de la tipografía que hay que saber

- **La fuente no es condensada.** La orden pide «sans angosta (condensed) o la más parecida
  disponible»: jsPDF trae `helvetica`, `times` y `courier`, y ninguna es condensada. Agregar una
  sería incrustar un archivo de fuente nuevo, que esta tanda no autoriza. Se usa **helvetica**.
- **La casilla de verificación se DIBUJA, no se escribe.** El glifo `☐` (U+2610) no existe en
  WinAnsi, que es la codificación de la helvetica de jsPDF: escribirlo da basura y además
  `splitTextToSize` lo mide con métricas inventadas y corre el corte de línea. En el papel y en
  la imagen es un rectángulo dibujado; en pantalla sigue siendo el carácter. Los **acentos sí**
  se conservan: WinAnsi llega a U+00FF.

---

## Dónde está el código

| Pieza | Función |
|---|---|
| Geometría de la hoja | `DOC_GEO` |
| Los datos de la app | `docDatos()` |
| Los cuatro documentos | `DOC_DEFS` |
| Bloques comunes de los consentimientos | `docEncConsent`, `docRiesgosCierre`, `docDeclaracion`, `docHojasComunes` |
| **El maquetador único** | `docMaquetar(def, D, bloques)` → lista de operaciones de dibujo |
| Emisor del papel | `docOpsAPdf(def, maq)` |
| Emisor de la imagen | `docOpsASvg(maq)` + `esqRasterizar` |
| La hoja de pantalla | `docRender()`, con el azul por `docMarcar()` |
| El aviso | `docAvisoSync()` / `docActualizarDatos()` |
| La imagen | `docGuardarImagen()` / `docQuitarImagen()` / `docImgSync()` |

**Una lista de bloques, un maquetador, tres emisores.** La hoja de pantalla, el PDF y la imagen
salen de la **misma** lista de operaciones con sus coordenadas, así que no pueden divergir. Con
tres emisores escritos a mano, los tres divergen —es la lección que `teerEstado().papel` y
`coaPapel` ya dejaron escrita en este repositorio—.
