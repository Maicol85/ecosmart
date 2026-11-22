# Censo de las ventanas nativas del navegador — TAREA 1.1 y 1.3 de P12

**Medido el 2026-11-22** sobre el árbol sellado `v20261122-1436` (md5 `ae874798`).

⚠️ **EL CENSO NO SE PUEDE HACER CON UN `grep` A SECAS**, y es la misma razón que PANT-3 y PANT-13
dejaron escrita: este archivo tiene cientos de miles de líneas de comentario y muchas nombran un
`alert` o un `confirm` para explicar por qué **no** se usa. Se cuenta llevando el **estado del
comentario de bloque** y descartando además el comentario de línea, que es lo que de verdad
separa código de prosa. La herramienta vive en
`scripts/_probe_p12_0.mjs` y su contraparte de conteo se corre con el script del scratchpad que
el commit de la TAREA 1 describe.

## El total

| | antes de P12 | después |
|---|---|---|
| **en código** | **106** | **41** |

Las **65** convertidas son las de los tres flujos que el pedido acota: el visor de imágenes y
cineloop, la biblioteca de imágenes y el cartel de llegada de CeiboLink.

---

## Las 41 que QUEDAN, por decisión del punto 1.3

El punto 1.3 dice, con todas las letras: «Las que queden fuera de esos flujos NO las conviertas:
dejalas listadas en el reporte para decidir después.» Acá están, agrupadas por la pantalla donde
el médico las encuentra.

### Configuración — médicos, centros, logo y firma (12)

| línea | tipo | función | qué pregunta o dice |
|---|---|---|---|
| 123513 | `prompt` | `cfgEditCentro` | el nombre del centro |
| 123743 | `prompt` | `cfgEditMedico` | el nombre del médico |
| 123745 | `prompt` | `cfgEditMedico` | la matrícula |
| 123746 | `prompt` | `cfgEditMedico` | la especialidad |
| 123799 | `alert` | `logoGalleryUpload` | un logo SVG no sirve para el PDF |
| 123800 | `alert` ×2 | `logoGalleryUpload` | el archivo no es una imagen válida |
| 123805 | `alert` ×2 | `setActiveLogo` | ese logo no es una imagen válida |
| 124020 | `alert` | `firmaGuardar` | falta el médico que firma |

**Son los tres `prompt` que más se usan de la app**, y los cuatro valores que piden van a la
cabecera de todo documento firmado. Convertirlos con `pedirProp` es mecánico; lo que hay que
decidir es si el nombre y la matrícula merecen un cuadro con validación en pantalla —hoy un
nombre vacío se acepta y se corrige después—.

### Informes guardados y backup (9)

| línea | tipo | función | qué pregunta |
|---|---|---|---|
| 37277 | `confirm` | (reimpresión) | el informe es de una versión anterior |
| 128905, 128914 | `confirm` | (PPT) | el peso del PPT con videos |
| 129515 | `confirm` | `eliminarInforme` | ¿eliminar este informe? |
| 129749 | `confirm` | `limpiarTodosInformes` | ¿eliminar TODOS? |
| 130611 | `confirm` | `_bkAvisarToggle` | el aviso del backup |
| 135612 | `confirm` | `eliminarInformeYVolver` | ¿eliminar y volver? |
| 136491, 136496 | `confirm` | (PPT) | el peso del PPT con videos |

**Los dos `confirm` del peso del PPT están DUPLICADOS** —128905/128914 y 136491/136496 dicen lo
mismo en dos lugares—, así que convertirlos es además la oportunidad de darles un dueño único.

### PDF (4)

| línea | tipo | función | qué dice |
|---|---|---|---|
| 80849 | `confirm` | `generarPDF` | hay bloques editados a mano cuyos datos cambiaron |
| 80883 | `alert` | `generarPDFReal` | la biblioteca PDF está cargando |
| 83969 | `alert` | `_pdfAjustarA4` | ídem |
| 133516 | `alert` | `amiloImprimirPDF` | ídem |

**Los tres «la biblioteca PDF está cargando» son el mismo texto en tres lugares.** Un dueño único
primero, y después el cartel.

### Documentos del Informe (4)

120198, 120667, 120682, 120683 — los cuatro `alert` de `docmodEdGuardar` y su vecino: el
almacenamiento del navegador lleno, el nombre vacío y el documento fuera de los límites de
tamaño.

### Otros (12)

| línea | tipo | función | pantalla |
|---|---|---|---|
| 15486 | `confirm` | `eteUsarPlantilla` | ETE · ¿reemplazar la técnica por la plantilla? |
| 63684, 63695 | `confirm` | `coAdoptarHuerfanos`, `coDescartarHuerfanos` | controles sin paciente |
| 64215, 64220 | `confirm`, `alert` | `frasesGuardar` | frases propias |
| 64258, 64260 | `confirm`, `alert` | `frasesBorrar` | frases propias |
| 134746, 134758 | `confirm` | `resetETTConfirmar`, `resetAlgoritmoConfirmar` | amiloidosis |
| 166197 | `confirm` | `labImportarXLSX` | el Excel tiene más de 1.000 filas |
| 168445 | `alert` | `dcmImportarSR` | no se pudo importar ningún archivo |

### Panel de equipos de CeiboLink (3)

| línea | tipo | función | qué pregunta |
|---|---|---|---|
| 185161 | `confirm` | `clnkDesvincular` | ¿desvincular EcoSmart de CeiboLink? |
| 186179 | `confirm` | `clnkAccionEquipo` | ¿sacar este equipo de la lista? |
| 186184 | `confirm` | `clnkAccionEquipo` | ¿bloquear este equipo? (borra sus imágenes) |

⚠️ **ESTOS TRES SON DE CeiboLink Y NO SE CONVIRTIERON A PROPÓSITO.** El pedido acota el flujo al
**«cartel de llegada de CeiboLink»**, y estos tres viven en el **panel de equipos de
Configuración**, que es otra pantalla y otro momento. Quedan listados acá, que es lo que el punto
1.3 manda. Son los más fáciles de convertir de toda la lista —`clnkAccionEquipo` ya es `async`—
y los tres son destructivos, así que `borrConfirmar` con su rojo les calza exacto.

---

## Lo que cuesta cada grupo, para decidir después

El costo de convertir **no está en el producto**: los tres primitivos ya existen y un
`alert(x) → avisoProp(t, x)` no cambia ningún contrato. El costo está en **adaptar los casos de
la batería** que sustituyen el diálogo nativo para capturar su mensaje.

Medido sobre `scripts/test_clinico.mjs`: **156 casos distintos** sustituyen `alert`, `confirm` o
`prompt`. El reparto aproximado por zona —por las funciones que cada cuerpo nombra— es 87 en el
visor, 39 en CeiboLink, 5 en la biblioteca y 25 en el resto. Esta tanda adaptó los que los 65
convertidos movieron; el resto se adapta cuando se convierta su grupo.

**El orden más barato, de menor a mayor costo de casos:**

1. los **tres del panel de equipos** de CeiboLink (ya `async`);
2. los **tres «la biblioteca PDF está cargando»**, que primero piden un dueño único;
3. los **cuatro de los documentos del Informe**;
4. los **dos pares duplicados del peso del PPT**, que también piden un dueño único;
5. **Configuración** —los cuatro `prompt` y los cinco `alert` del logo y la firma—, que es el
   grupo que el médico ve más seguido;
6. **Informes guardados**, que es el grupo con más casos atrás.
