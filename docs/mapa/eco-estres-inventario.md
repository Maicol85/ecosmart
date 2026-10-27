# Eco Estrés — inventario del código sin interfaz

Mapa de la tanda **AJ10-B** (2026-10-26). Medido sobre el árbol del sello de esa tanda, con
`index.html` en **137.115 líneas / 9,72 MB** al abrir.

**Los rangos de línea son ORIENTATIVOS.** Están verificados en el momento de escribir esto y
envejecen con la primera edición que agregue una línea más arriba. Lo que no envejece son los
nombres: `EE_SEGS`, `eeHasData`, `eeInformeLineas`, `eeIncluirPDF`, `EE_PROTO`, `EE_PDF_KEYS`.
Buscar por nombre, no por línea. Es la misma regla que ya dejó escrita el episodio de los dos
hallazgos de auditoría de EcoSmart que se reabrieron por número de línea y **no existían**.

---

## Qué es esto y por qué no se borra

La **interfaz** de Eco Estrés se retiró de EcoSmart. Hoy no hay pestaña, no hay campos y no hay
una sola regla de CSS para sus clases. El **JS sigue completo** y corre en cada carga de la app:
dos `document.addEventListener` globales, un `setTimeout` de arranque a los 120 ms, y unas sesenta
funciones que salen por su guarda porque el elemento que buscan no existe.

**La decisión de no borrarlo es de Maicol, del 25/10/2026: no se borra hasta modularizar la app.**
El motivo es el que explica la sección siguiente: el prefijo `ee` no identifica a este módulo, y
un borrado por prefijo se lleva puestas tres funciones vivas de la app.

### Las TRES compuertas que lo mantienen fuera del papel

1. **PDF** — la sección exige que el elemento `ee-incluir-pdf` **exista en el DOM**, además de la
   bandera y de `eeHasData()`. Es la que cierra de verdad el riesgo: la bandera se puede encender
   a mano, el elemento no.
2. **Informe narrativo** — `generarInforme` sólo agrega el rótulo «Eco Estrés:» si
   `eeInformeLineas()` devuelve líneas, y esa función sale con `[]` porque `ee-res-global` no
   existe.
3. **`eeHasData()`** — da falso con el árbol limpio.

Las tres están fijadas por **TC-536**, con el escenario peligroso incluido (bandera encendida a
mitad de sesión más `eeHasData()` en `true`) y con controles negativos de lo que sigue vivo.

---

## ⚠️ El riesgo del prefijo «ee»: CUATRO familias y TRES están vivas

| Familia | Piezas | ¿Viva? |
|---|---|---|
| **1 · Eco Estrés** | todo lo de la tabla de abajo | **muerta de cara al usuario** |
| **2 · Calculadora de E/e′** | campos `ee-e`, `ee-ep`, `ee-result`, `ee-val`, `ee-lbl`; función `calcEE()` | **VIVA** — función diastólica y score de amiloidosis |
| **3 · Modo básico/avanzado del ETT** | `EE_MODULES`, `EE_DEF_KEY`, `eeGetMode`, `eeGetModules`, `eeModOn`, `eeDefOn`, `eeDefAplicarUI` | **VIVA** — alimenta el desplegable «Sección avanzada» (`#ecoAdvSelect`, `ecoAdvBuild`) |
| **4 · QR del informe** | `EE_QR_ROWS`, `eeStudyUrl`, `eeQrDataURL`, `eeQrEnabled`, `eeCurrentInformeId` | **VIVA** — el QR del PDF firmado |

**Un borrado por prefijo `ee` apaga el desplegable «Sección avanzada», la calculadora de E/e′ y el
QR del informe.** Las tres familias vivas tienen control negativo en TC-536 justamente por esto:
un caso que sólo contara ausencias de Eco Estrés pasaría en verde con las tres borradas.

**Los campos `cx_duke_*` y el score de Duke NO son de Eco Estrés**: se calculan desde una
ergometría en cinta. Lo que sí hubo fue una dependencia de **destino**: la rama del Duke en el PDF
estuvo tapada por la doble condición de Eco Estrés y hoy depende sólo de su propio toggle. El
comentario de `cxDuke()` lo dice. TC-536 lo cubre (condición E5).

---

## Tabla de piezas

### (A) Exclusivas de Eco Estrés

| Pieza | Rango orientativo | Líneas | Bytes | Qué es | Quién la usa |
|---|---|---|---|---|---|
| **A1 · bloque principal** | 16465–16900 | 436 | 31.770 | El `<script>` con la IIFE: diana de 17 segmentos (`EE_SEGS`, `EE_LABELS`, `EE_SCORES`, `EE_COLORS`, `EE_TER`), evaluadores de FC %, CFVR, PSAP, E/e′ y GLS, galerías de imágenes y de ECG (`EE_IMG_COUNTS`, `EE_ECG_COUNTS`), los **dos listeners globales** (`click` y `paste`), `generarInformeEcoEstres`, `eeHasData`, `eeInformeLineas`, los exports a `window` y el **`setTimeout` de 120 ms**. 48 `function` y 12 variables de estado. | nadie, salvo A2 y el enganche B1 |
| **A2 · sección del PDF** | 65435–65595 | 161 | 9.496 | La sección «ECO ESTRÉS» del PDF firmado, con los parámetros del estrés, la tabla del protocolo, pulmón, CFVR, la conclusión narrativa, el resumen de ECG, las tres dianas y las dos grillas de imágenes. **Toda detrás de la compuerta 1.** | `generarPDFReal` |
| **A3 · `eeIncluirPDF` + su comentario** | 101118–101139 | 22 | 1.997 | El toggle de inclusión. **Ya no se exporta a `window`** (ver la nota de abajo sobre por qué eso no alcanza). | handler inline que no existe |
| **A4 · protocolo y toggles de PDF** | 101142–101349 | 208 | 13.138 | `EE_PROTO` (ejercicio, dobutamina, dipiridamol…), `EE_PDF_KEYS`, `eePdfToggles/eePdfOn/eePdfSet/eePdfSyncUI/eePdfPanelRender/eeBullPdfTog`, `eeProtoBuild/eeProtoCollect/eeProtoMode/eeCurrentProto`. 12 `function`. | A2, por `eePdfOn` (línea 65515) |
| **A5 · limpieza de arranque** | 101342–101346 | 5 | 346 | Borra `ecoestres_incluir_pdf` de `localStorage` **si el toggle no está en el DOM**. Corre SÓLO al cargar. | arranque |
| | **TOTAL** | **832** | **56.747** | **0,61 % de las líneas · 0,58 % de los bytes** | |

> ⚠️ **A1 NO ES 100 % ECO ESTRÉS: lleva adentro una calculadora clínica COMPLETA y AJENA.**
> `ptpCad()` —**probabilidad pre-test de enfermedad coronaria, ESC 2019**, con la tabla de
> porcentajes por grupo etario y sexo y las cuatro recomendaciones— vive en 16708–16732
> (**25 líneas, 1.417 B**) dentro del `<script>` de Eco Estrés. Medido: **nadie la llama**
> (`ptpCad` aparece dos veces en todo el archivo, su definición y su `window.ptpCad=ptpCad`) y
> sus cinco campos `ee-ptp-edad`, `ee-ptp-sexo`, `ee-ptp-sint`, `ee-ptp-res` y `ee-ptp-rec`
> **no existen en el DOM**, así que sale por `if(!res||!rec) return;`.
> O sea que está tan muerta como el resto — **pero no es maquinaria de Eco Estrés: es una
> calculadora independiente que sólo necesita que le devuelvan sus cinco campos.** Borrar A1 la
> borra. Antes de borrar hay que decidir si se rescata, y esa decisión es de Maicol.
> La encontró TC-536: su recomendación `'ESC: prueba funcional (eco estrés) o TAC coronaria.'`
> es el único literal del archivo que nombra al eco estrés fuera de las piezas del módulo.

> ⚠️ **El inventario AJ10-A decía «unas 738 líneas, 0,5 %» y no reproduce.** Medido pieza por
> pieza con `sed -n 'a,bp' | wc -l`: son **832 líneas y 56.747 bytes**. La diferencia es del orden
> de A2 (161 líneas), así que lo más probable es que esa cifra no contara la sección del PDF.
> **La cifra buena para presupuestar un borrado es 832.**

### (B) Compartidas — tocan algo de fuera

| Pieza | Rango orientativo | Qué comparte | Qué pasa si se borra A |
|---|---|---|---|
| **B1 · enganche del informe narrativo** | 56672–56676 (5 líneas, 241 B) | Vive dentro de `generarInforme`, detrás de `typeof eeInformeLineas === 'function'` y de `.length`. | Hay que **retirar el enganche también**: con A1 borrado el `typeof` falla cerrado y no rompe nada, pero queda código que nombra una función que no existe. |
| **B2 · `EE_SEGS` como autoridad de Contractilidad** | cita en 105415–105445 | La numeración AHA de 17 segmentos. `_STR_ANILLOS` **tiene los números escritos a mano**; `EE_SEGS` es la **autoridad declarada en el comentario**, no una dependencia de código. Decisión de Maicol del 20/09/2026: «manda `EE_SEGS`». | El código de Contractilidad **sigue funcionando** —no lee `EE_SEGS`—, pero **pierde la fuente que su propio comentario invoca**. Antes de borrar A1 hay que mover esa tabla de numeración a una constante propia o el comentario queda citando un fantasma. El episodio que la decisión evitó: el mismo PDF llevando dos dianas donde el segmento 2 se llama anteroseptal en una y se pinta inferoseptal en la otra. |
| **B3 · los cortes de GLS de −16 y −20** | `eeEvalGLS`, 16530–16542 | **El inventario AJ10-A decía que «viven sólo en ese código» y eso es FALSO, medido.** El **−16** es además el criterio `hfaicos_gls_alt` del score HFA-ICOS de cardio-oncología (campo en 19867, tabla en 20157, registro en 50871, cableado en 51052) y lo nombra el comentario de la diana de Contractilidad en 105415. El **−20** es la referencia `sgl: {ref:-20}` del Laboratorio (131552) y los textos del 3D del VI (95334, 95336); `VD_STRAIN_NORMAL = -20` (105818) es **otro parámetro** —pared libre del VD, ASE 2025— y no cuenta. | Lo **exclusivo** de `eeEvalGLS` es la **clasificación en tres bandas con el rótulo «borderline»** (`>−16` reducido · `−16 a −20` borderline · `≤−20` normal). Eso sí se va con A1. Los dos cortes sueltos **sobreviven en otros módulos**. |
| **B4 · `localStorage['ecosmart_pdf_toggles']`** | `eePdfToggles`, 101231–101234 | **Nada, y el nombre engaña.** La clave se llama como si fuera una preferencia global de PDF de toda la app; medido, **sólo Eco Estrés la lee y la escribe**. | Se puede borrar con A4. **El riesgo acá es el inverso al del prefijo `ee`:** alguien que la vea por nombre la va a conservar creyendo que es compartida. |

### (C) Tocan algo que se guarda

| Pieza | Qué guarda | Estado hoy |
|---|---|---|
| **C1 · `campos` de los estudios guardados** | `guardarInforme` barre `input[id], select[id], textarea[id]` **de todo el documento** (línea 90512) y congela el valor de cada uno en `campos`. | Hoy **no captura nada** de Eco Estrés, porque los elementos no existen. ⚠️ **Pero pueden existir estudios viejos con claves `ee-*` de Eco Estrés dentro de sus `campos`**, guardados por cualquier build que tuviera la interfaz. Al reabrirlos, la reposición por id no encuentra destino y esos valores quedan **inertes y dentro del estudio**. Nada los borra, y **nada los debe borrar**: la regla de EcoSmart es que no se migran estudios guardados. |
| **C2 · `localStorage['ecoestres_incluir_pdf']`** | La bandera de inclusión en el PDF. | **A5 la borra al arrancar** cuando el toggle no está en el DOM. Encenderla a mitad de sesión la deja viva hasta el próximo refresco: lo único que para el PDF ahí es la compuerta 1. Es el escenario que mide TC-536 (condiciones D6 y B3). |
| **C3 · `localStorage['ecosmart_pdf_toggles']`** | Los ocho toggles por sección de `EE_PDF_KEYS`. | Sobrevive indefinidamente. Nadie la limpia. Ver B4 por el nombre. |

---

## ⚠️ Dos cosas que hay que saber antes de intentar cerrarlo «por las buenas»

1. **Las funciones siguen en `window` aunque se quiten los exports.** Son declaraciones de función
   en el nivel superior de un `<script>` clásico, así que **ya crean la propiedad en `window`**:
   borrar la línea `window.eeIncluirPDF = …` es limpieza, no un cierre. A3 ya tiene el export
   sacado y la función **igual es llamable desde la consola**. Para que un bloque quede realmente
   inalcanzable hay que envolverlo en una IIFE o borrarlo.
2. **No se envolvió todo en una IIFE** porque el código **no es contiguo** —son cinco piezas en
   TRES zonas del archivo —~16.500, ~65.400 y ~101.100—, con el enganche del informe narrativo
   en ~56.700 en medio— y porque el prefijo `ee` no lo identifica (ver la tabla de las cuatro
   familias). A1 **sí** está dentro de una IIFE, y por eso su estado (`eeBull`, `eeImg`, `eeEcg`)
   sólo se alcanza por los exports.

## Lo único que queda abierto, y es el orden de dos listeners

El handler de `paste` de A1 se registra **antes** que `imgPasteHandler` del módulo de imágenes.
Mientras `#tab-ee` no exista, sale por su guarda en la primera línea. **El día que vuelva la
interfaz**, un pegado con la pestaña de ECG activa haría `preventDefault()` ahí y el módulo de
imágenes no lo vería. Hay que **decidir el orden al restaurar, no descubrirlo.**

## Dónde está lo demás

- El caso que fija las tres compuertas: **TC-536**, ficha en `docs/mapa/tests-fichas-536.md`.
- La decisión de borrar y lo que falta medir antes: `docs/PENDIENTES.md` → **AJ10-C**.
- La autoridad de `EE_SEGS` sobre la diana de Contractilidad: `docs/mapa/contractilidad-3d-vi.md`.
- Las otras rutas del PDF y del informe: `docs/mapa/informe-pdf-excel.md`.
