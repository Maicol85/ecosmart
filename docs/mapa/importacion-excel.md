# Mapa — IMPORTACIÓN y REIMPORTACIÓN del Excel del Laboratorio

> Salió de `docs/mapa/informe-pdf-excel.md` en la tanda **K** (2026-10-16), que estaba a **435
> bytes** del techo de 35 KB y no admitía ni un puntero más. Es el bloque más grande y más
> autónomo de aquel mapa: el camino de ENTRADA del Excel, que no comparte una sola función con
> los emisores del informe, el PDF y el PPT.

Por nombre de función y de id, **no por número de línea**.

---

## Importación y reimportación

`importarInformesJSON(file)` — lee el JSON, **detecta el nivel del archivo** (un array pelado es
«solo informes»; un objeto con `_ecosmart_backup` y `estudios` es un backup con medios por uuid),
valida **todos** los estudios con `validarInformeImportado`, cuenta duplicados con `_dupIndice` /
`_dupBuscar`, y abre `modal-import` con el resumen y una vista previa de 10 — escribe: `_impDatos`,
`_impMedios`, `_impNivel`.

`validarInformeImportado(inf)` — esquema de lista blanca: rechaza cualquier clave que no esté en
`_INF_CAMPOS_PERMITIDOS`, exige `id` numérico, valida formato (no sólo largo) de `uuid`
(`_uuidValido`), `estudioId`, `nombre`, `ci`, `doc_tipo` y la fecha.

`importEjecutar()` — aplica la importación según el modo elegido (`omitir` por defecto),
reparte ids con `_nuevoIdUnico` y conserva el `uuid` entrante sin admitirlo repetido.
`importCerrar()` — cierra el modal y limpia `_impDatos`.

`labImportarXLSX(file)` — importador de Excel. Busca la hoja **por nombre** (`/estudios/i`) y no la
primera, porque la plantilla trae «Instrucciones» y «Leyenda»; lee con
`XLSX.utils.sheet_to_json({defval:'', raw:false, blankrows:false})`; pide confirmación arriba de
1000 filas porque el parseo es síncrono; **normaliza las cabeceras** (trim + espacios colapsados +
minúsculas) y guarda el mapeo al nombre original, porque un `"CI "` con un espacio de más se
descartaba en silencio y degradaba la dedup. Deja el resultado en `_labImpDatos`
(`{filas, errores, total}`), que después consumen `labImpRender`, `labImpBoton`,
**`labImpEjecutar`** (el que confirma y escribe) y `labImpCerrar`.

`_sevManualDesdeCampos(campos)` / `_sevManualEnCampos(campos)` — marcan como «fijada a mano» cada
severidad que vino en la planilla, **incluido un «0» / «sin»**, y escriben la marca *dentro* de
`campos` (`sev_manual`) para que viaje con el estudio: una marca sólo en `window` se perdía y el
primer recálculo subía de grado un hallazgo que el estudio original negaba.

> **Regla del repo:** el exportador y el importador de Excel **sólo se tocan con orden expresa**.

### El mensaje de las COLUMNAS CALCULADAS (G3, 2026-10-15), que cierra G2-2

Decisión de Maicol: **UN** mensaje para todas, del estilo «columna calculada por la app: se
recalcula con A, B y C; no se importa», con los **nombres de los datos de origen** de cada una.

⚠️ **HASTA EL G3 HABÍA DOS MENSAJES Y EL REPARTO NO SE ENTENDÍA DESDE AFUERA.** La casa tiene
dos criterios de columna derivada y el importador les daba mensajes distintos:

| Familia | Cómo se detecta | Mensaje en HEAD |
|---|---|---|
| **(a) CON campo** — 18 | `LAB_XLS_SOLO_EXPORT` o `readonly` en el DOM, vía `_labXlsEsCalculado` | «un valor que la app calcula sola» |
| **(b) SIN campo** — 75 | ni siquiera está en `LAB_XLS_MAP` | «**no corresponde a un campo editable**» |

El segundo suena a «no la reconozco» sobre una columna que la PROPIA app exporta. Medido en
HEAD con un Excel de catorce columnas: el cociente TAPSE/PSAP, la FAC del VD, `DisfSist_VD`,
`DD_I`, `Geom_Normal` y el gradiente VD-AD caían ahí. Hoy las dos familias reciben el mismo
mensaje y **cero columnas** quedan en «ignoradas».

⚠️ **EL CENSO DE LAS 75 SE CALCULA, NO SE CABLEA.** Se pregunta por lo que `_labExcelRow` emite
sobre una fila vacía —escribe cada columna, vacía o no— y se le resta el mapa con sus alias. Una
lista de 75 nombres se desactualiza con la primera columna derivada que entre.

**El origen** sale de `LAB_XLS_CALC_ORIGEN` (mapa explícito) más `LAB_XLS_CALC_ORIGEN_PREFIJO`
para las familias de indicadoras —`DD_`, `Geom_`, `TS_`, `PSAP_`, `IM_`, `EM_`, `EAo_`, `IAo_`,
`IT_`, `DPT `, `CVR `—, cuyo origen es siempre la columna de la que derivan.
⚠️ **LO QUE NO ESTÁ EN LA TABLA NO SE INVENTA**: cae al texto común sin la lista, que sigue
siendo verdadero. Inventar un origen manda al médico a corregir el campo equivocado.

**Un solo dueño, `_labXlsCalcMsg`**, que publican las DOS superficies del mismo aviso: el modal
del importador y el **comentario de celda** de la plantilla, que hasta hoy decían lo mismo con
dos redacciones — y la que se lee al llenar es la de la celda.

### El DETALLE del TAPSE/PSAP y de la PSAP, y la ida y vuelta que NO se reproduce

Para esas dos —las que el médico corrige a mano en la planilla— el modal dice además si el valor
**recalculado** de la fila coincide con el del archivo, y cuándo no se puede recalcular dice
**cuál** dato de origen falta. Se recalcula con el MISMO dueño que usa el exportador
(`vdTapsePsapRed`); **no se acepta el valor del archivo en ningún caso**, porque eso dejaría dos
fuentes del mismo número. Para poder comparar, `ok.push` guarda la fila CRUDA (`datos: row`):
`inf.campos` ya tiene las calculadas descartadas.

⚠️ **SE NOMBRA EL DATO DE ORIGEN QUE DE VERDAD FALTA Y NO EL ESLABÓN INTERMEDIO.** Decir «falta
la PSAP» manda a llenar una columna que el importador descarta igual, y la PmAD la app la deriva
de la VCI cuando `vci_diam` y `vci_col` vienen —que sí se importan—.

⚠️ **PARADA MEDIDA Y DECLARADA: LA IDA Y VUELTA DEL COCIENTE NO SE REPRODUCE.** Se exportó la
fila COMPLETA de 438 columnas de un estudio y se la reimportó tal cual: el cociente **no se
puede recalcular**, porque la **velocidad máxima de la insuficiencia tricuspídea no tiene
columna**. Censado: `vmax_it` no está en `LAB_XLS_MAP`, y las dos columnas que la contienen
—`PSAP (mmHg)` y `Grad VD-AD (mmHg)`— son CALCULADAS y no se importan. La cadena es
`TAPSE/PSAP ← TAPSE + PSAP ← VRT + PmAD`, y el eslabón que falta es la VRT.
Las dos alternativas están en `docs/PENDIENTES.md`: agregar una columna de origen (que es una
PARADA de columna) o aceptar el valor del archivo marcado como «importado». **Decisión del
médico.** Lo que sí se pudo hacer, y se hizo, es que el modal lo DIGA con todas las letras.

⚠️ **LAS DOS CON DETALLE VAN AL PRINCIPIO DE LA LISTA.** Se recorta en cuarenta —con 93
calculadas, listarlas todas tapa el resto del modal— y el orden natural es el del mapa, así que
el cociente y la PSAP podían quedar fuera de lo visible justo cuando el renglón de abajo habla
de ellas.

### Exportación JSON (el único backup completo)

`exportarInformesJSON()` — modal de exportación (todos / por centro / selección manual).
`_bkExportar(list, nivel, desc)` — escribe el archivo: con `nivel === 'informes'` baja el array
pelado; con los otros arma el sobre `{"_ecosmart_backup":BK_FORMATO,"nivel":…}` con los medios,
troceando en partes para no quedarse sin memoria.
`exportarEcoAnalytics()` — salida hacia CeiboAnalytics (otra frontera de confianza).

---
