<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->
# El EXCEL del Laboratorio — columnas, tipos, alias y las 440 claves

> **Salió de `docs/mapa/informe-pdf-excel.md` en la tanda C2 (2026-10-28), sin perder un párrafo.**
> Ese mapa estaba a 600 bytes del techo de 35 KB que `CLAUDE.md` fija, y esta tanda toca el
> informe y el PDF, así que había que partirlo antes de escribirle una línea más. Lo que se mudó
> acá es **todo lo que habla del Excel**: el mapa de columnas, las tablas satélite, las dos
> columnas del G2 con sus dos criterios de «derivada», el alias «PHT» → «THP», el puntero al mapa
> de importación y el bloque de las 440 columnas del Z.
>
> Lo que **se quedó** en `informe-pdf-excel.md` son las otras tres superficies: el informe
> narrativo, el EN SUMA, el PDF y el PPT.
>
> ⚠️ **LAS CUATRO SUPERFICIES SE SIGUEN ROMPIENDO POR SEPARADO.** Que el Excel tenga mapa propio
> no lo vuelve independiente: lo que entra a una columna sale de los mismos campos que alimentan
> al informe. Antes de tocar una columna, mirar también el mapa del informe.

---

## Excel del Laboratorio

`LAB_XLS_MAP` — tabla de columnas. Cada entrada es
`[columna del Excel, destino, tipo, aliasesOpcionales]`; un destino que empieza con `@` es un
campo de **primer nivel** del estudio (`@nombre`, `@ci`, `@fecha_estudio`), el resto son ids de
`campos`. El `tipo` es `txt` / `num` / `fecha` / `vocab` / `lista`. El 4.º elemento son **alias de
cabecera para el importador**: nombres viejos que se siguen aceptando, porque matchea por nombre y
renombrar una columna haría que los Excel ya exportados pierdan ese dato en silencio. **El orden
del array define el orden de columnas de la plantilla y del export.**

**Cuántas entradas tiene: 361** (contadas — 357 escritas con comilla simple y 4 con comilla doble,
porque llevan apóstrofo en el nombre: `e' septal`, `e' lateral`, `S'`, `e' lateral tricuspideo`).
Las 361 **no** son las columnas del Excel: el mapa es un subconjunto del export.

**Columnas reales de la fila exportada: 438 claves distintas** (eran 434 hasta el 2026-10-12,
cuando entró «Strain contracción AI (%)» pegada a «LARS (%)» en el bloque 3; 435 hasta el
2026-10-14, cuando entró **`DisfSist_VD`** en el bloque 5 — ver
`docs/mapa/exclusiones-laboratorio-vd.md`; y 436 hasta el **2026-10-15**, cuando la tanda **G2**
agregó **«TAPSE/PSAP (mm/mmHg)»** en el bloque 5 y **«Diámetro arteria pulmonar (mm)»** en el
bloque 8 — ver `docs/mapa/tapse-psap-ap.md`) — 412 claves distintas en el objeto
literal de `_labExcelRow` (413 escritas, con `'VAB cirugía valvular prevista'` **repetida dos
veces**, así que la segunda pisa a la primera), más 1 clave computada
(`` [`PSAP_${UMBRAL_PSAP_ELEVADA+1}_50`] ``), más 22 columnas del bloque de pericardio que entra
por un *spread* al final (`DPT …` y `CVR …`). El número 434 que circula **se confirma**.
⚠️ Discrepancia a reportar, no corregida: el panel de ayuda de la app dice **«429 columnas» en 17
bloques** (y «129 columnas básicas» al destildar los siete módulos opcionales); el texto de ayuda
y la fila real no coinciden.

`_labExcelRow(inf)` — **arma la fila**. Deriva todo de `inf.campos` (nada del DOM vivo). Calcula en
el camino BSA, masa indexada, RWT, geometría (`calcGeometriaVI`), FA, relación E/A, e' promedio,
EROA y Vol-R por PISA, AVA por continuidad, gradiente VD-AD, grado diastólico (`_labDiastGrado`) y
los grados valvulares en texto (`_labGradoTxt`) — lee: `im_grado`, `ia_grado`, `it_grado`,
`ea_grado`, `em_grado`, `psap_calc`, `dpt_*`, `cvr_*`, `informe_texto`, `en_suma`, y muchos más —
llamada por: `_labExportarXLSXReal` (una vez por estudio) y `_labRowVacia()`.

`_labOrdenarCols(headers)` — **recorre `LAB_XLS_MAP`** y ordena las cabeceras del export según el
mapa; intercala las binarias de `LAB_XLS_BIN` detrás de su columna de texto y las derivadas de
`LAB_XLS_TRAS` detrás de la suya; lo que el mapa no conoce queda al final; después reagrupa por
bloque de forma estable y, si la reagrupación perdiera o duplicara una columna, devuelve el orden
sin agrupar antes que exportar un Excel incompleto. **El orden del Excel no es el del objeto que
devuelve `_labExcelRow`** — lo decide esta función.

`_labExportarXLSXReal(infs, anon, sel, origen)` — escribe el libro: hoja «Estudios»
(`XLSX.utils.aoa_to_sheet`, `!autofilter`, comentarios de encabezado vía
`_labXlsComentarEncabezados`), hoja de bloques (`_labXlsHojaBloques`), hoja «Leyenda» con el
significado de las binarias, y hoja «Cohorte» cuando `origen` dice que las filas salieron del
filtro. `anon` sustituye `Nombre` por «Paciente anónimo» en **todas** las filas; `sel` es la lista
de módulos elegidos y sin ella se exporta todo. ⚠️ No se escribe `!freeze`: la build comunitaria de
SheetJS 0.18.5 no lo emite.

`labExportarXLSX()` — entrada «exportar el Laboratorio»: `labGetInformes()` → `_labPreguntarAnonimo`
→ `_labExportarXLSXReal(infs, anon, null, 'lab')`.
`labExpAbrir(modo)` / `labExpRefrescar` / `labExpSeleccion` / `labExpSoloConDatos` /
`labExpConfirmar` / `labExpCerrar` — el modal de módulos; `labExpConfirmar` llama a
`_labExportarXLSXReal` con `sel` y `origen`.
`labPlantillaXLSX(vacia, sel)` — plantilla para cargar a mano; también **recorre `LAB_XLS_MAP`** y
escribe la hoja «Instrucciones» (una fila por columna, con tipo y ejemplo) más las alternativas
0/1 de `LAB_XLS_BIN`. Entrada: `labExpPlantilla()`.
`labStrainExportar()` — libro propio del strain; no toca `_labExcelRow` ni `LAB_XLS_MAP`.

### Tablas satélite del mapa

`LAB_XLS_MODULOS` y `LAB_XLS_BLOQUES` (+ `_LAB_XLS_BLOQUE_RESTO`, `_labXlsBloqueDe`,
`_labXlsAssertBloques`) — los bloques temáticos; los módulos **se derivan** de los bloques marcados
`avanzada`, no de una segunda lista. `_labColsFiltradas(headers, sel)` aplica la selección.
`LAB_XLS_BIN` — 5 grupos / 10 columnas binarias de severidad, que el **importador** también lee de
vuelta: por eso no se puede reusar para derivadas. `LAB_XLS_TRAS` — derivadas que deben quedar
pegadas a la suya (`DVI mitral` → `DVI mitral (fuente)`).
`LAB_XLS_SOLO_EXPORT` — campos que salen y no vuelven. `_labXlsEsCalculado(dest)` — el predicado
real de «no se reimporta»: está en `LAB_XLS_SOLO_EXPORT` **o** el input es `readonly`.

### Las DOS columnas del G2 (2026-10-15), y los DOS criterios de «derivada»

| Columna | Bloque | Posición | ¿Se reimporta? |
|---|---|---|---|
| **`TAPSE/PSAP (mm/mmHg)`** | 5 · VENTRÍCULO DERECHO | tras `DisfSist_VD` | **no** |
| **`Diámetro arteria pulmonar (mm)`** | 8 · VÁLVULAS | tras `IP etiología` | **sí** |

El valor del cociente lo da **`vdTapsePsapRed(c)`**, el dueño único desde el G1, con sus **tres
decimales**; la rama `src` existe porque el exportador no tiene formulario que leer. **Vacía —no
0— sin TAPSE o sin PSAP.** El diámetro es el campo `ip_ap_diam`.

⚠️ **EN LA CASA HAY DOS CRITERIOS DE COLUMNA DERIVADA Y HAY QUE ELEGIR EL QUE CORRESPONDE:**

- **(a) con CAMPO** — `PSAP (mmHg)` (`psap_calc`), `AVm THP`, `AVA`: **están** en `LAB_XLS_MAP` y
  se apartan por `LAB_XLS_SOLO_EXPORT`; el importador las lista como «un valor que la app calcula
  sola».
- **(b) SIN campo** — `FAC VD (%)`, `DisfSist_VD`, `DD_I`, `Geom_Normal`, `TS_Presente`: **no**
  están en el mapa y se declaran en `LAB_XLS_BLOQUES`; el importador las lista como «no
  corresponde a un campo editable».

El cociente **no tiene campo en el DOM**, así que sigue el criterio **(b)**. Es la diferencia
menor que el G2 declaró: su mensaje en el importador es el de (b) y no el de (a), más informativo.

⚠️ **LA POSICIÓN LA DECIDE `LAB_XLS_BLOQUES` Y NO EL OBJETO LITERAL**: `_labOrdenarCols` manda al
final lo que el mapa no conoce y **después** reagrupa por bloque, así que sin su declaración el
cociente habría caído al bloque «18 · OTRAS COLUMNAS».

### El alias «PHT» → «THP» (G2), que cierra D2-3

`PHT IAo (ms)` → **`THP IAo (ms)`** y `TAVI RPV PHT (ms)` → **`TAVI RPV THP (ms)`**, las dos con
el nombre viejo en el **cuarto elemento** de su entrada de `LAB_XLS_MAP` — el mecanismo de alias
de ENTRADA que ya existía y que `_cabsDe` consulta. **El número de columnas no cambia.**

⚠️ **EL PREFIJO DEL BLOQUE 8 TUVO QUE SEGUIR EL RENOMBRE.** Era `'PHT IAo'`; sin cambiarlo a
`'THP IAo'`, la columna renombrada caía al bloque «18 · OTRAS COLUMNAS». Lo caza
`_labXlsAssertBloques`, que es para lo que está.

> Las asociaciones y la tabla de válvulas del Laboratorio, en
> **`docs/mapa/laboratorio-asociaciones-valvulas.md`**.
`_labXlsImportables()` — el set de cabeceras que el importador acepta, calculado desde esas mismas
estructuras. Vocabularios y validación: `LAB_XLS_VOCAB`, `_NUEVOS`, `_3E`, `LAB_XLS_OPCIONES`,
`LAB_XLS_LISTAS`, `LAB_XLS_MAX_TXT`, `LAB_XLS_ETIQ` (+ `_labXlsEtiq`), `LAB_XLS_RANGO_PROPIO`,
`LAB_XLS_BIN_VAL`, `LAB_XLS_BIN_NADA`, `LAB_XLS_EJEMPLO`; los asserts `_labXlsAssertVocab` y
`_labXlsAssertListas` existen porque una columna `vocab` sin vocabulario rompe en silencio.

---

## Importación y reimportación → tiene mapa propio

El camino de **ENTRADA** del Excel —el guardián de columnas, las listas de valores, los rangos,
el mensaje de las columnas calculadas, el detalle del TAPSE/PSAP y la exportación JSON— salió a
**`docs/mapa/importacion-excel.md`** en la tanda K (2026-10-16): este mapa estaba a 435 bytes del
techo de 35 KB. Ahí está todo, sin resumir.

## ⚠️ EL EXCEL PASÓ A 440 COLUMNAS EN EL Z (2026-10-15) — y la ida y vuelta tiene mapa propio

Las dos nuevas son **`Vmax IT (m/s)`** (campo de ENTRADA, se reimporta, bloque 8, pegada a
`VC IT (mm)`) y **`PPM aórtico`** (derivada SIN campo, no se reimporta, bloque 8, pegada a
`AVA (cm²)`).

**Todo lo demás vive en `docs/mapa/excel-origen-ida-vuelta.md`**: los tres criterios de columna
(derivada con campo, derivada sin campo, campo de entrada), la cadena entera de la ida y vuelta
del TAPSE/PSAP, el segundo eslabón que faltaba (`calcPmAD` en las dos rutas de restauración) y
los tres cambios del mensaje del importador.

⚠️ **SE SACÓ A ARCHIVO PROPIO PORQUE ESTE MAPA ESTABA EN 29,7 KB Y LA SECCIÓN LO CRUZABA.** Medido
con `wc -c` **ANTES** de escribir, que es lo que `ecosmart/CLAUDE.md` pide desde la D2 y lo que
`valvulas.md` aprendió pagándolo **dos** veces.

---

---
