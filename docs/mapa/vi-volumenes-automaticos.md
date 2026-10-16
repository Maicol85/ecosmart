# Mapa — los VOLÚMENES AUTOMÁTICOS del VI y el GASTO CARDÍACO del PDF

Mapa de la tanda **«F»** (2026-10-15), bloque **F1**. Nace como archivo propio y no colgado de
otro mapa porque la pestaña **AI/VI** no tenía ninguno: `docs/mapa/informe-pdf-excel.md` ya está
en 22 KB y éste crece con cada tanda que toque los volúmenes del ventrículo izquierdo.

Está por **nombre de función y de id**, no por número de línea: la línea cambia en cada edición,
el nombre no.

---

## 1 · Los dos campos automáticos

Viven en la grilla de entradas de la tarjeta **«Ventrículo izquierdo»** de la pestaña AI/VI,
inmediatamente después del **VSFVI manual**.

| id | rótulo | qué publica |
|---|---|---|
| `vauto-vsfvi` | VSFVI automático (ml) · *auto ← VDFVI y FEVI* | `VDFVI × (1 − FEVI/100)`, en ml |
| `vauto-vol-lat` | Volumen latido (ml) · *auto ← VDFVI − VSFVI* | `VDFVI − VSFVI`, en ml |
| `vauto-vol-lat-fuente` | — (renglón gris debajo) | «con el VSFVI manual» / «con el VSFVI automático» |

**Dueño único: `viVolAutoSync()`.** Lee por `vPlaus(id).val`, que es `null` fuera de banda, y
escribe el `value` y el `placeholder` de los dos campos más el texto del renglón de origen. No
escribe nada más.

⚠️ **LA CELDA DEL VOLUMEN LATIDO VA PEGADA A SU PAR Y NO «DEBAJO»**, que es donde la pedía el
prompt: en un `grid-4` «debajo de X» es la celda de **cuatro** después y la posición se corre
sola según el viewport. Es la misma decisión —y el mismo comentario— que el VSFVI manual ya
tenía respecto del SGL.

### Las tres columnas del cableado

1. **`calcVI()`**, al que ya llaman los `oninput` de `vdfvi`, `vsfvi` y `fevi`. Colgarse de ahí
   es lo que hace que se repinten mientras el médico tipea sin agregarle un listener a cada
   campo, que es como uno se queda sin cablear.
2. **`RECALC_MODULOS`**: las cinco rutas de restauración pueblan asignando `.value`, que **no**
   dispara `input`, así que reabrir un estudio dejaba los dos automáticos con el «requiere …»
   del formulario vacío al lado de un VDFVI y una FEVI ya poblados.
3. **El final de `limpiarCampos`**: el barrido genérico borra el `value` de un
   `input[type=text]` pero **no** el `placeholder`, y el renglón de origen es un `<div>` que no
   termina en `-aviso`, así que ningún barrido lo alcanza.

### Lo que NO hacen

- **No votan y no escriben ningún grado.**
- **No viajan con el estudio**: prefijo `vauto-` con guión **medio**, que `_noEsDelEstudio` ya
  excluía por los dos precedentes (`hfpep-` y las nueve casillas de la IM, la IAo y la IT).
  Medido: **1022 campos con el mismo hash y cero claves `vauto-`**.
- **No tienen columna de Excel**, que sigue en **436**, con el mismo hash con el escenario
  cargado y con el formulario vacío.
- **No tocan ningún texto del informe ni del EN SUMA.**

### Las guardas, una por una

| condición | qué publica |
|---|---|
| falta el VDFVI | `requiere VDFVI` / `requiere VDFVI, VSFVI o FEVI` |
| falta la FEVI | `requiere FEVI` / (la resta sigue, si hay VSFVI manual) |
| faltan los dos | `requiere VDFVI, FEVI` / `requiere VDFVI, VSFVI o FEVI` |
| VSFVI manual cargado | la resta lo PREFIERE, y el renglón dice «con el VSFVI manual» |
| VSFVI manual ausente o fuera de banda | la resta usa el automático y lo dice |
| VSFVI > VDFVI | `requiere un VSFVI menor que el VDFVI` — no se publica un eyectado negativo |

⚠️ **UN CAMPO VACÍO CON EL PLACEHOLDER VACÍO ES UN CAMPO MUDO**, que es el defecto **D2-4** de la
tanda anterior. Por eso toda rama que no publique un número nombra lo que le falta, y la sonda
lee el `value` y el `placeholder` **juntos**.

### No hay circularidad, y está medido

`fevi` es un campo **TIPEADO**: censo del archivo, **nadie** le escribe `.value` ni pasa por un
`setv('fevi', …)`, y `fevi_met` sólo **declara** con qué método lo midió el médico. Así que el
automático nunca se alimenta de un VSFVI que a su vez venga de él. El panel del **VI 3D** sí
deriva una FEVI de los dos volúmenes cuando falta, pero eso vive dentro del panel y **no escribe
el campo**, así que tampoco cierra el lazo.

⚠️ **LA FÓRMULA NO ES NUEVA EN ESTA APP.** El VI 3D ya hace `VDF × (1 − FEVI/100)` y `VDF − VSF`
con las **mismas dos guardas** —lo cargado gana sobre lo calculado, y un volumen eyectado
negativo se calla—. Lo de acá repite esas dos reglas sobre los mismos campos: ningún corte,
ninguna banda y ninguna constante nueva. Es álgebra de la definición de fracción de eyección,
no un criterio, y por eso **no lleva cita**.

### Quién lee el VSFVI y el volumen latido manual — y sigue leyéndolos

Ninguno de estos cinco consumidores se tocó.

| quién | qué lee | dónde |
|---|---|---|
| `calcVI` | `vsfvi` | `vsfvi-idx-interp`, el indexado por BSA con los cortes ASE por sexo |
| `generarPDFReal` | `vsfvi` | fila «VSFVI idx» de la tabla compacta |
| `generarPDFReal` | `vol_lat` | fila «Vol. lat.» (`55-100 ml`) |
| panel de **Evidencia** | `vsfvi` | `D.vsf`, criterio `vtsvi_idx` de la IAo (Clase IIb · Nivel B) |
| **VI 3D** (`lv3d`) | `vdfvi`, `vsfvi`, `fevi`, `ddfvi` | su propio estado, con `org: 'medido'/'calculado'` |
| tarjeta previa al PDF | `vol_lat` | grupo «🫀 VI Función» |

⚠️ **`vsfvi` y `vol_lat` NO tienen columna de Excel** y nunca la tuvieron: no están en
`LAB_XLS_MAP`. Lo que viaja de ellos es el campo guardado.

---

## 2 · El gasto cardíaco del PDF

Vive en `generarPDFReal`, bloque 4, sección **«AVA / GC / IC»** de la tabla compacta.

```
const _fcReal = v('hemo_fc');
const _fcUso  = hemoFCUsable(_fcReal) ? _fcReal : null;     // antes: 70
const coV     = (_fcUso !== null && Ø TSVI && VTI TSVI) ? … : null;
const _fcRef  = (_fcUso !== null) ? 'con FC de ' + _fcUso + ' lpm' : '';
const icV     = (coV && bsa) ? … : null;
```

- `{lbl:'GC', ref:_fcRef, val:coV}` → el papel estampa **«GC (con FC de 72 lpm): 4.5 L/min»**.
- Sin FC usable, `coV` es `null` y **`drawTablaCompacta` no dibuja la fila**.

⚠️ **EL ROTULO VA EN `ref` Y NO EN `lbl`**: `drawTablaCompacta` estampa «rótulo (ref): valor», o
sea que el texto impreso es exactamente el pedido; en `lbl` habría entrado en **negrita** y le
habría comido el ancho que la función reserva para envolver el valor, porque el presupuesto de
cada celda se mide sobre el rótulo en negrita.

⚠️ **EL ÍNDICE CARDÍACO SE VA CON ÉL**, y es consecuencia y no una decisión aparte: `icV` es
`coV / ASC`, con la MISMA FC inventada.

⚠️ **LA PANTALLA NO CAMBIA.** `calcHemo` ya dejaba el GC, el IC, la RVS y los dos perfiles en
`null` con la FC vacía o fuera de banda, con el **mismo** predicado `hemoFCUsable`
(`HEMO_FC_BANDA = [20, 250]`, exclusivo en los dos extremos). Lo que esta tanda cierra es que
las dos superficies dejaran de discrepar.

### Lo que había, medido en HEAD

Con Ø TSVI 20 mm y VTI TSVI 20 cm (volumen sistólico 62,83 ml):

| escena | HEAD | hoy |
|---|---|---|
| sin FC | `GC: 4.4 L/min*` + `IC: 2.20 L/min/m2` | sin fila de GC ni de IC |
| FC 72 | `GC: 4.5 L/min` | `GC (con FC de 72 lpm): 4.5 L/min` |
| FC 110 | `GC: 6.9 L/min` | `GC (con FC de 110 lpm): 6.9 L/min` |
| FC 300 (fuera de banda) | `GC: 4.4 L/min*` | sin fila |

El `*` del respaldo **no tiene pie de página en ningún lado del documento** — censo del archivo,
cero apariciones de una nota que lo explique.

⚠️ **CON FC CARGADA NO CAMBIA NI UN NÚMERO**, y por eso la parada que la orden preveía no se
aplicó: `_fcUso` ya era la FC real cuando `hemoFCUsable` la aceptaba. La única rama con una FC
por defecto era la que **no** tiene FC cargada, que es la que esta tanda retira.

### Los otros dos sitios que imprimen un gasto cardíaco — NO se tocaron

- La fila `GC` del bloque **GTP** (`cx-gtp-gc`), que lee un span de la pantalla.
- Las líneas **«GC termodilución»** y **«GC ecocardiográfico»** de la hoja adjunta hemodinámica
  (`amiloTexto…`), que salen del PiCCO / Swan.

---

## 3 · Trampas medidas en esta zona

- ⚠️ **LA TARJETA DEL VI ES UN ACORDEÓN QUE NACE CERRADO** (`#sacc-vi`, `aria-expanded="false"`).
  Sin abrirlo con `secToggle('vi')`, los tres campos que una sonda tipea **no tienen caja**,
  `focus()` falla en silencio y la escena mide un tecleo que nunca ocurrió. El denominador de
  arranque de `scripts/_probe_f.mjs` aborta nombrándolo.
- ⚠️ **EL ROTULO Y EL VALOR DE UNA FILA DEL PDF SON DOS `doc.text` DISTINTOS** (el rótulo en
  negrita en `(cx, ry+2,6)`, el sufijo en `(cx+ancho, ry+3,0)`). Un espía que registre sólo el
  texto deja la fila del GC como «GC» pelado — la primera corrida informó eso en las cuatro
  escenas. Hay que registrar también las coordenadas y recomponer la fila por su `y`.
- ⚠️ **SIN AVA, LAS FILAS DE GC E IC SON LAS DOS ÚNICAS DE LA SECCIÓN «AVA / GC / IC»**, así que
  al retirarlas desaparece la **columna entera** del PDF, header incluido, por el
  `.filter(s => s.items.length > 0)` que `drawTablaCompacta` **ya** tenía. Sin una escena con el
  AVA cargado, eso se lee como una pérdida de esta tanda. La sonda tiene las dos.
- ⚠️ **`J()` DE LA SONDA STRINGIFICA ANTES DE AWAITEAR**, así que sobre una **promesa** devuelve
  `{}` — y eso se lee igual que «el PDF salió vacío». La primera corrida del grupo `gc` informó
  las cuatro escenas con el objeto vacío sobre un jsPDF que **sí** había cargado. Para una
  promesa va `JP()`, que la resuelve dentro de la página.
- ⚠️ **«QS» NO APARECE EN NINGÚN ROTULO VISIBLE DE LA APP**, medido sobre el árbol vivo: cero
  `<label>` con esa sigla. Las únicas apariciones de `QS` en el archivo son
  `CIV_QPQS_CIERRE` y los textos de **Qp/Qs** de los módulos congénitos, que son otra magnitud,
  otro módulo y **no se tocaron**. TC-475 lo fija por si alguien lo reintroduce.

---

## 4 · Cómo medir

```bash
node scripts/_probe_f.mjs --solo vol          # los dos automaticos, 12 escenas con teclas reales
node scripts/_probe_f.mjs --solo gc           # el PDF generado de verdad, 6 escenas
node scripts/_probe_f.mjs --solo controles    # el control negativo mayor
node scripts/_probe_f.mjs --file /tmp/index.HEAD.html > /tmp/f.HEAD.json   # el lado A del A/B
node scripts/test_clinico.mjs --solo TC-475
```

**Cobertura: TC-475**, 37 condiciones —contadas instrumentando el propio caso para que publicara
su `ex.length`, no a ojo—, de las cuales **seis** viven detrás del denominador de jsPDF.

---

## La tarjeta ⓘ del ventrículo izquierdo y el gráfico de geometría — puntero (tanda «L», 2026-10-16)

Desde el 2026-10-16 el título del VI lleva **dos** globos ⓘ: uno abre una tarjeta con cinco
barras —DDVI, DSVI, los dos volúmenes indexados y la FEVI— y el otro el gráfico de **geometría**
de cuatro cuadrantes con el punto del paciente. Van separados por una **medición**: juntos
obligaban a scroll interno a 1200 × 700.

Los cortes se **sondean** de `viDimCat`, `vdfviInterp`, `vsfviInterp`, `hviSeveridad` y
`calcGeometriaVI`; ninguno se copia. Dos datos no tienen dueño y sus números viven en un solo
lugar (`EV_BANDAS_REF`): el **DSVI**, que la app no clasifica en ninguna superficie, y la
**FEVI**, cuyos cortes ya viven en dos copias —la cápsula de `calcVI` y el bloque del informe— y
a las que esta tanda **no agregó una tercera**.

El registro de evidencia que lo alimenta, el mecanismo entero y sus trampas están en
**`docs/mapa/registro-evidencia.md`**.
