<!-- mapa armado el 2026-10-15 (tanda G2); los numeros de linea NO se guardan a proposito -->

# Mapa — el Laboratorio: las asociaciones del TAPSE/PSAP y las dos estenosis BINARIAS

**Tanda «G2», 2026-10-15.** Dos zonas del Laboratorio que la tanda tocó y que no tenían mapa
propio: el bloque A de **asociaciones** (la subtab «Asociaciones») y la **tabla de las ocho
válvulas** con su gráfico apilado (la subtab «Mediciones», tarjeta «Valvulopatías»).

La tercera parte del G2 —las dos columnas nuevas del Excel— vive en
`docs/mapa/informe-pdf-excel.md`, y el cociente y el diámetro de la arteria pulmonar, en
`docs/mapa/tapse-psap-ap.md`.

---

## 1 · El cociente TAPSE/PSAP en las asociaciones

### El dueño, y por qué no hay una segunda división

```
vdTapsePsap(src)      -> crudo; sin src lee el FORMULARIO, con un objeto campos lee un ARCHIVADO
vdTapsePsapRed(src)   -> el mismo, redondeado a VD_TPSP_DEC (= 3) decimales
```

La rama `src` nació en el **G2** con el patrón de `emContFueraBanda(src)` / `emThpValido(src)`.
**El predicado no cambió**: `!t || !p` letra por letra en las dos ramas, porque `calcTEP` lee
esta función desde el G1 y cualquier diferencia de guarda movería su fila.

⚠️ **CUATRO SUPERFICIES PUBLICAN ESTE NÚMERO Y TODAS PREGUNTAN AL MISMO DUEÑO**: la fila del
Doppler tricuspídeo (`vdTapsePsapSync`), `calcTEP`, la columna del Excel y estas asociaciones.
Hasta el G2, `vdTapsePsapSync` repetía su propio `Math.round(x * 1000)`; hoy llama a
`vdTapsePsapRed`. El número impreso no se movió.

### Qué hace este módulo con una variable sesgada — medido, no supuesto

**No la transforma ni la categoriza.** Censo del bloque: cero `Math.log`, cero prueba de
normalidad, y sus **cuatro** pruebas son no paramétricas —**Spearman**, **Mann-Whitney**,
**Kruskal-Wallis** y **chi²**—. Spearman trabaja por RANGOS, así que es invariante a cualquier
transformación monótona: categorizar el cociente en sus tres tramos le quitaría información sin
ganar robustez. Por eso entra **crudo**. Los tres tramos siguen existiendo en la fila de la
pantalla, que es otra pregunta.

### Las cuatro entradas de `ASSOC_A`

| Clave | Etiqueta | Prueba | Población |
|---|---|---|---|
| `tpsp_fevi` | TAPSE/PSAP – FEVI | Spearman | `tpsp` |
| `tpsp_ee` | TAPSE/PSAP – E/e′ | Spearman | `tpsp` |
| `tpsp_lavi` | TAPSE/PSAP – Vol AI indexado | Spearman | `tpsp` |
| `tpsp_it` | TAPSE/PSAP – Insuficiencia tricuspidea (grado) | **Kruskal-Wallis** | `tpsp` |

La del grado de IT es Kruskal-Wallis porque el grado es una variable de **cuatro categorías
ordinales**, igual que `amil_geom` con la geometría del VI. Sus grupos salen de
**`_labRegurgSev`**, el mismo dueño que cuenta la tabla de las ocho válvulas.

### `A_POBL.tpsp` — la población propia, y por qué no es `todos`

El cociente sólo existe donde hay un chorro de IT medible. Con `pob:'todos'`, el `nPob` que el
detalle publica habría contado la cohorte entera y el lector no tendría forma de saber que la
mitad nunca entró. Con población propia, el detalle dice «Población de la asociación: N
estudio(s); con las dos variables cargadas, M» y los dos números son del mismo universo.

**`A_NOTA_SESGO`** es una sola constante que las cuatro concatenan a su `nota`: cuatro copias de
la misma advertencia se separan en cuanto alguien corrija una.

### El aviso de PAR ACOPLADO

| Dónde | Mecanismo |
|---|---|
| Bloque **ARMADO** | **No ofrece** «TAPSE/PSAP – TAPSE» ni «– PSAP» (decisión (c) de la orden) |
| Bloque **LIBRE** | `_LIBRE_ACOPLADOS`, familia nueva, aparte de `_LIBRE_COMPONENTES` |
| La del grado de IT | Su propio campo `circular:`, el mecanismo que ya existía |

⚠️ **`_libreCircular` DEVUELVE DOS FORMAS, `corta` y `larga`, Y NO UNA.** Los dos sitios que
publican el aviso usaban textos **distintos** —el de «no se pudo calcular» corta en el punto y el
de «hay resultado» sigue con «así que parte de esta correlación…»—, así que una sola frase le
habría cambiado el wording a uno de los dos pares que ya existían. Medido: el texto de
`hfpeff – E/e′`, el de `amil – TAPSE` y el del par sin datos salen idénticos a HEAD.

⚠️ **UNA FAMILIA APARTE Y NO UNA ENTRADA MÁS EN `_LIBRE_COMPONENTES`**: un COCIENTE contra uno de
sus dos factores no es un puntaje contra su componente, y la frase «es uno de los criterios que
PUNTÚAN X» sería falsa sobre el TAPSE/PSAP contra el TAPSE.

### Consecuencia declarada: el p ajustado de las vecinas se mueve

El ajuste **BH** corre sobre la familia de ESTE bloque. Con cuatro pruebas calculables más, el
`pAdj` de las que ya estaban cambia: medido, «PSAP – TAPSE» pasó de **0,449 a 0,829** en la
población de la sonda. **No es un defecto** — es lo que el propio comentario de `_bh` dice: «la
multiplicidad la genera el haber mirado, no el haber mostrado». **El p CRUDO no se mueve.**

### Los cuatro grados en `ORD`

`ordCmp` ordena los grupos del Kruskal-Wallis por el array `ORD`. Sin agregar
`'Sin','Leve','Moderada','Severa'` cae al orden **alfabético** y los grupos salen «Leve ·
Moderada · Severa · Sin», con el «Sin» al final: una escalera de severidad que arranca por el
medio.

---

## 2 · Las dos estenosis BINARIAS en la tabla y en el apilado

### El reparto: `counts` para todos, `bin` sólo para los autorizados

`_labValvCounts(infs)` devuelve `{ counts, bases, N, bin }`. **`counts` y `bases` NO se tocaron**
y esa es la decisión de fondo:

| Consumidor | Lee | ¿Lo autoriza la orden del G2? |
|---|---|---|
| Tabla de las ocho filas (pantalla) | `counts` + **`bin`** | sí |
| `_labValvChartCfg` (apilado de pantalla **y del PDF**) | `counts` + **`bin`** | sí |
| PPT estadístico | `counts` / `bases` | **no** → sale idéntico a HEAD |
| Mini-tabla del PDF de auditoría | `counts` / `bases` | **no** → sale idéntico a HEAD |

Con la lectura binaria dentro de `counts`, los cuatro habrían cambiado. Con `bin` aditivo, los
dos últimos salen idénticos **por construcción** y no por una medición a posteriori.

### `LAB_VALV_BIN` — las dos entradas

| Clave | Índice | Lee | Publica | Con guion |
|---|---|---|---|---|
| `em` | 1 | `_labEstenSev(inf,'em_grado')` | Sin = «Sin estenosis» · Leve = «No significativa» · Sev = «Significativa» | **Moderada** |
| `et` | 5 | lectura propia de `et_grado` | Sev = «Significativa» | **Sin · Leve · Moderada** |

El índice se **verifica** contra `_LAB_VALV_LABELS.indexOf(...)`, no se confía: era `length - 1`
cuando la pulmonar entró como séptima y el caso siguió verde midiendo **otra** válvula.

### ⚠️ Los dos defectos que esto cierra, y el médico vio uno

Medido en HEAD, con la sonda:

1. **Con un `et_grado` LEGADO «Leve»** —anterior al 2026-10-05— la fila decía
   `ET | 2 | 1 | 0 | 0`: el Laboratorio rotulaba «leve» una válvula que la app ya no gradúa. Es
   exactamente lo que el médico midió con datos reales.
2. **Peor, y nadie lo había visto: con los tokens VIGENTES**,
   `_labEstenSev('Significativa')` devuelve **`null`** —su cascada no matchea «significativa» ni
   «no significativa»; «significativa» no contiene la subcadena «sin»— así que **dos estenosis
   tricuspídeas significativas quedaban FUERA de la fila**. No es un rótulo equivocado: es una
   pérdida silenciosa. Hoy la fila dice `ET | — | — | — | 2`.

### ⚠️ Los tres grados legados de la tricúspide NO se traducen

Mapear «Severa» o «Moderada» a «Significativa» sería inventar una equivalencia que la guía no
hace — el mismo argumento con el que la tanda del 2026-10-05 decidió **no migrar** esos estudios.
Cuentan en la **base** (la válvula fue valorada) y no se afirman en ninguna celda. El pie lo dice.

### Los dos denominadores, declarados y NO unificados

| Superficie | Denominador |
|---|---|
| Tabla de las ocho filas | **el total del período**; no marcar una válvula indica que fue valorada como normal |
| Gráfico propio de la estenosis mitral (`_labEmBarras`) | **sólo los estudios con dato** de esa válvula |

Cada uno publica su `n` en su propio pie. Mezclarlos daría un número que no es de ninguno de los
dos, y por eso el pie de la tabla nombra el del otro en vez de unificarlos.

### El apilado

La cubeta que no aplica va en **`null` y no en 0**: con 0, Chart.js dibuja un segmento de alto
cero que el plugin de etiquetas igual puede rotular. `_rawN` va en 0 para que no imprima su «n=».
Y la **leyenda** declara las dos binarias: su fila de «Severidad» promete tres niveles, y sobre
estas dos eso sería falso — sin ese renglón, una columna con una sola banda se lee como «las otras
dos dieron cero».

---

## El G3 (2026-10-15) cierra el límite: las CUATRO superficies leen el MISMO dueño

El G2 dejó la lectura binaria **sólo** en la tabla de pantalla y en el apilado —su orden no
autorizaba las otras dos— y la declaró en `docs/PENDIENTES.md` → **G2-3**. El G3 la cierra.

### El defecto reproduce en los dos, y el segundo es peor — medido en HEAD

Con la misma población de seis estudios:

| Superficie | HEAD | Hoy |
|---|---|---|
| PPT, `Esten. Mitral` | `1 (17 %) · 2 (33 %) · **0 (0 %)** · 3 (50 %)` | `1 · 2 · **—** · 3` |
| PPT, `Esten. Tricusp.` | `2 (67 %) · **1 (33 %)** · 0 · **0 (0 %)**` | `**—** · — · — · **2 (33 %)**` |
| PDF, `Esten. Mitral` | `(n = 6) 1 \| 2 \| **0** \| 3` | `(n = 6) 1 \| 2 \| **-** \| 3` |
| PDF, `Esten. Tricusp.` | `**(n = 3)** 2 \| **1** \| 0 \| **0**` | `**(n = 6)** - \| - \| - \| **2**` |

Un «0 (0 %)» sobre una cubeta vacía POR CONSTRUCCIÓN la rotula como una medición que dio cero.
Y lo de la tricúspide es peor que un rótulo equivocado: `_labEstenSev` devuelve `null` sobre
«Significativa», así que las **dos significativas quedaban FUERA de la fila** y el n era 3 en
vez de 6 — mientras la pantalla, a dos clics, decía `ET | — | — | — | 2` sobre esos MISMOS
estudios.

### El dueño único — `_labValvFila(vc, i)`

Contesta, para una válvula: **qué cuentas publico, sobre qué base y qué cubetas NO aplican**.

```
{ cuentas: {Sin, Leve, Moderada, Severa}, base, na: [...], bin: bool }
```

Lo leen las **tres** superficies de tabla, así que no pueden volver a separarse — que es
exactamente lo que pasó entre el G2 y hoy, con la resolución escrita en cada una.

⚠️ **LAS OTRAS SEIS LESIONES NO CAMBIAN, Y LO GARANTIZA LA FORMA DE LA FUNCIÓN**, no una
medición a posteriori: sin entrada en `bin` devuelve EXACTAMENTE lo que los tres consumidores
calculaban —«Sin» derivado por resta sobre la base de esa válvula— y `na` vacío. Medido: las
seis idénticas a HEAD en el PPT y en el PDF, y `counts`/`bases` sin moverse.

### Una sola frase para las tres — `LAB_VALV_BIN_NOTA`

El pie de la tabla de pantalla, el del PPT y la nota del PDF decían lo mismo con tres
literales. Hoy salen de una constante: con tres, el día que uno se corrija los otros dos
siguen diciendo lo de ayer.

### Lo que NO entró, y por qué

⚠️ **EL n POR FILA NO SE AGREGÓ AL PPT.** Su tabla no lo lleva en ninguna de las ocho lesiones y
agregarlo cambiaría también las SEIS que la orden congela. El n del grupo sigue en el pie. En el
PDF la fila **ya** lo llevaba, así que el de la tricúspide pasa de 3 a 6 — que es el conteo
correcto y es parte del cambio autorizado.

---

## Trampas medidas en esta tanda

- **`_labImpDatos` es una `let` DE MÓDULO**, no una propiedad de `window`. La sonda informó
  «hay: false» en las cuatro escenas del importador sobre un importador que funcionaba. Se lee el
  **modal** que `labImpRender` pinta. Misma trampa que `ECO_AYUDA`.
- **`valvSevConfirmada` también**, así que `generarPDF` abría la tarjeta de severidad y el PDF
  salía con **0 textos**. Se entra por `_pdfAjustarA4`, que el comentario de `generarPDF` declara
  como el único camino de todos sus llamadores.
- **La tarjeta «Valvulopatías» vive en la subtab «MEDICIONES», no en «General».** Una captura
  tomada tras `labSubTab('general')` sale de otra pantalla, con la tabla pintada en un panel con
  `display:none`. Lo delató la cadena de padres que imprime el aborto.
- **`labSubTab(id, el)` exige el botón** —sin `el` revienta en `el.classList.add`— y además corre
  `labAccCerrarTodos`, así que el acordeón hay que abrirlo **después** de entrar.
- **`labRenderExtras` pinta pero no navega**: pintar no es mostrar.
- **La PSAP no sale sólo de la Vmax**: es `4·VRT² + PmAD`, y sin el diámetro y el colapso de la
  VCI queda vacía — la fila del cociente decía «—» y se leía como «el cociente no funciona».
- **Un `ReferenceError` de NIVEL SUPERIOR aborta el `<script>` COMPLETO.** La primera versión de
  la nota de sesgo nombraba una constante sin declarar: `labAsocARender` quedaba `undefined` y la
  app cargaba sin asociaciones. **Semgrep no lo ve** —no es un error de sintaxis—; lo dieron la
  sonda (con `SIN labAsocARender` en las once escenas, en vez de reventar) y la consola.

## Cómo medir esta zona

```bash
node scripts/_probe_g2.mjs --file /tmp/index.HEAD.html > /tmp/g2.HEAD.json   # A/B contra HEAD
node scripts/_probe_g2.mjs --solo asoc,libre                                 # las asociaciones
node scripts/_probe_g2.mjs --solo valv                                       # la tabla y el apilado
node scripts/_probe_g2.mjs --solo captura --dest /tmp/capt                   # PNG en los dos temas
node scripts/test_clinico.mjs --solo TC-477                                  # la cobertura
```

---

## → La tanda «VAL» (2026-10-17) vive en `docs/mapa/valvulas-val.md`

Lo que esa tanda movió en esta zona, en una línea cada uno:
- **Estenosis tricuspídea:** el gradiente medio pasa a `> 5` mmHg ESTRICTO, el **THP deja de votar**
  y es un signo de APOYO, el veredicto **nombra el criterio que decide** (área → gradiente → VTI)
  y entra un aviso de texto con insuficiencia tricuspídea mayor que leve. La cita del cuadro pasa
  de «ESC/EACTS 2021» a **2025**.
- **Estenosis aórtica:** el **1,50 cm² EXACTO es MODERADA** (`AVA_MOD_MAX`, del que se deriva
  `EA_BANDAS.avaSinMin`). El borde de 1,0 se verificó y **no se tocó**.
- **Insuficiencia aórtica:** la fracción regurgitante es severa con **más** de 50 %.
- **Insuficiencia mitral:** la onda E apoya con **más** de 120 cm/s, el **cociente VTI se retira
  desde la IAo moderada** —y con eso se fue la salvedad de la divergencia— y el **jet/AI gana su
  fuente** (ACC/AHA 2020, Tabla 17, folio e121) sin mover un número.
- **Referencias:** el texto general de integración, al final de la sección de válvulas nativas.

Cada corte con su tabla, su folio impreso y su hoja del PDF está en `docs/fuentes/FUENTES.md` →
«La tanda VAL». Lo declarado y no tocado, en `docs/PENDIENTES.md` → VAL-1 a VAL-8.

---

## La FUGA PARAVALVULAR de la prótesis quirúrgica → `docs/mapa/protesis-fuga-pvl.md`

La tanda **PRO-B** (2026-10-17) extendió el motor de la fuga de la TAVI —`eteTaviRPV`, con su
**fuente inyectable**— a la **prótesis aórtica quirúrgica**, con los cuatro cortes de la **Tabla 8
de la ASE 2024 (folio 23, hoja 22)** que ese motor ya aplicaba y **sin mover ninguno**: tres campos
nuevos (`ea_pvl_origen`, `ea_pvl_ext`, `ea_pvl_vc_area`) y **dos prestados**, el ancho de vena
contracta de `ia_vc` y el THP de `ia_pht`, cuyos cortes ya coincidían dígito por dígito.
En la **mitral** no se movió un solo corte —los cuatro cuantitativos de la **Tabla 13 (folio 30)**
ya eran los de `IM_CORTES`— y lo único que entró es `vm_pvl_origen`, el selector que marca que la
regurgitación es paravalvular. **La Tabla 13 no publica extensión circunferencial, así que la
mitral no la ofrece.**

⚠️ **El reverso diastólico NO alimenta el motor de la quirúrgica**: `IA_VMAX_TD_SEVERA` sigue en
20 cm/s de un solo nivel para la nativa y la SAVR (ESC/EACTS 2025) y la lectura en dos niveles es
de la VARC-3, que es de TAVI.
⚠️ **El Laboratorio tenía una segunda copia de los cuatro cortes** y divergía del dueño en dos
cosas; desde el PRO-B3 le pregunta al dueño, y `RPV_L` ganó el rótulo «Sin RPV».

Cobertura: **TC-497**, 51 condiciones. Fuentes: `docs/fuentes/FUENTES-protesis.md`.

---

## ⚠️ La FEVI del Laboratorio se lee de su dueño desde la tanda «CORTOS» (2026-10-17)

Cierra `LS-6` y `LS-7`. Tres sitios la leían a mano y hoy los tres le preguntan a
`feviClasificar` / `FEVI_CATS`:

- **`ORD`**, el orden de lectura de las categóricas, tenía escritas las TRES etiquetas viejas
  (`≥50`, `40-49`, `<40`): ninguna matcheaba el `rango` de las cuatro clases y la tabla de
  contingencia de las tres chi² de FEVI salía en orden **alfabético**. ⚠️ **EL VALOR DE p NO SALÍA
  MAL** —`chi2test` deriva R, C, los esperados y `df` de las propias filas, y el chi² es invariante
  a permutar filas—: lo que estaba mal era el orden de lectura. Lo que sí cambió con la cuarta clase
  es que hay más celdas y el semáforo cae a 🟡 con `fe<5` más seguido.
- **El filtro de cohorte `coh-fevi`** pasa de tres bandas con un 40 a pelo a las **cuatro**
  categorías del dueño, con los tres valores viejos aceptados y traducidos.
- **La comparación de subgrupos del PPT** parte la cohorte por el dueño —reducida = moderada o
  severa— en vez de por `f < 40`, y sus rótulos salen de dos constantes.

**ESCENA QUE CAMBIA en los dos últimos: el estudio con FEVI 40 exacta**, que es «moderadamente
reducida» y antes caía del lado no reducido. Detalle y medición en `docs/mapa/cortos-arreglos.md`.
