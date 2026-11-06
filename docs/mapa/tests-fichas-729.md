# Fichas de los casos TC-729 a TC-735 — tanda PANT-19 (2026-11-06)

> En archivo propio porque `docs/mapa/tests-fichas.md` está en 34.237 B, a menos de 1 KB del techo
> de ~35 KB que este repositorio se fijó. El índice por tanda está en
> `docs/mapa/tests-punteros-tandas.md`; el mapa de la tanda, en
> `docs/mapa/pant19-catalogo-protesis.md`.

**Los siete caen contra la línea base (`56b868b`) por 60 condiciones y NINGUNA por excepción**,
verificado en un worktree alternando sólo `index.html` con el **mismo** archivo de casos.

⚠️ **LAS 135 CONDICIONES ORIGINALES ESTABAN CON EL CONTRATO EQUIVOCADO, y es la lección que
PANT-14b dejó escrita.** El runner evalúa `[descripción, BOOLEANO, diagnóstico]` y estaban
escritas `[descripción, valor, esperado, diagnóstico]`, así que una condición con un valor truthy
**pasaba en verde SIN comparar nada** y una con `0`, `false` o cadena vacía **fallaba teniendo el
valor correcto**. Las 135 tienen exactamente cuatro elementos —contadas con un parser de balance—,
así que la conversión va en **UN solo lugar por caso**:

```js
const _push = ex.push.bind(ex);
ex.push = t => _push(t.length >= 4 ? [t[0], String(t[1]) === String(t[2]), t[3]] : t);
```

y se probó con su **control positivo** (49 vs 49 → `true`), su **control negativo** (48 vs 49 →
`false`) y **el caso del cero en los dos sentidos** (0 vs 0 → `true`; 0 vs 1 → `false`), más la
cadena vacía, el `false`, el `null` y un push de tres elementos, que queda intacto.

---

## TC-729 · la Tabla A4 contra su transcripción (commit 2) — 19 condiciones

**Denominador:** `PROT_CAT_A4` existe y tiene modelos; sin eso el caso sale y lo dice.

- **(A)** los cuatro conteos contra `docs/TRANSCRIPCION_A4_P19.md`: **49** modelos, **211**
  tamaños, **523** celdas con dato y **110** vacías impresas.
- **(B)** las filas de control leídas en imagen, una por hoja, con su `[media, desvío]` exacto.
- **(C)** los dos «Abbott Epic» y los dos «Mosaic» existen **por separado**, cada uno con su folio:
  la tabla los imprime dos veces y el catálogo no los funde.
- **(D)** los tamaños en **rango** (`17-19`) y las tallas (`XL (27)`) se conservan como TEXTO.
- **(E)** los controles del tipo: los que no nombran mecanismo ni tejido quedan **sin dato**, y
  **ningún desvío vale cero** —un cero sería un ± mal leído—.

## TC-730 · las tablas de TAVI (commit 3) — 14 condiciones

- **(A)** **9** modelos, **29** tamaños, **78** celdas.
- **(B)** el **«NA» impreso se carga como `null`** y no como un número.
- **(C)** los cuatro **valve-in-valve** llevan su marca `viv:1` y **no** traen DVI, porque la
  tabla no lo imprime para ellos.
- **(D)** la A3 imprime el tamaño **«All»**, que es texto.

## TC-731 · el botón, las sugerencias y elegir (commit 4) — 29 condiciones

- **(A)** el botón se ve **sólo con prótesis** —mecánica, biológica y TAVI— y **no** con válvula
  nativa, y mide **44 px** de alto.
- **(B)** la lista **no se abre sola**; «han» encuentra los Hancock y «mosa» los dos Mosaic **por
  palabra**; **(B3b)** «ifecta», que cae **en medio** de «Trifecta», **no encuentra nada**; y la
  lista **no tapa** «No sé el modelo: ver todos y elegir».
- **(C)** elegir por sugerencia habilita el tamaño y «Elegir», cierra la tarjeta, guarda los dos
  campos, repinta el botón y publica los valores de la tabla con su hoja y su folio.
- **(D)** «ver todos» agrupa por el descriptor impreso, sus botones de tamaño miden 44 px y tocar
  uno elige modelo **y** tamaño; **(D4)** el **borrador** del modo manual **no inventa un desvío**.
- **(E)** Escape cierra y **devuelve el foco**. ⚠️ **(E0) es el denominador que hizo falta**: con
  el manejador del componente roto la tarjeta **se cierra igual** —la app tiene su propio Escape
  general, medido— y el foco **ya estaba** en el botón porque `vModElegir` lo devuelve, así que el
  caso **mueve el foco** al campo del modelo antes del Escape.

## TC-732 · los esperados, la indexada y lo medido (commit 4) — 24 condiciones

- **(A)** los valores esperados salen de la **tabla**: 7.2 ± 2.8 mmHg y 1.81 ± 0.3 cm².
- **(B)** la EOA indexada predicha con los **dos** cortes de IMC (0,85/0,65 y 0,70/0,55), y
  **(B0b)** que es la EOA **dividida por el ASC** y no la EOA cruda, con el número recalculado con
  el ASC que la propia función publica.
- **(B3)** la **misma** indexada de 0,75 da «moderado» con IMC 25 y «sin desajuste» con IMC 31:
  es lo único que prueba que el corte decide.
- **(C)** sin peso ni talla **no hay** indexada, y el cuadrito **lo dice** en vez de callarse.
  ⚠️ El montaje usaba `o.peso || '75'`, y el `||` **se comía la cadena vacía**: la escena «sin peso
  ni talla» corría **con** peso y talla.
- **(D)** lo medido con su diferencia en **DE** y su signo; **(D4)** con la Edwards Mira 25 —que
  imprime el gradiente medio **con** desvío y la EOA **sin**— el gradiente lleva su DE y el AVA
  **no**, las dos mitades en la misma escena.
- **(E)** el modo manual se reconoce como manual, sus dos valores **no traen desvío** y la línea
  lo dice; **(F)** ocultar y mostrar es de **pantalla**.

## TC-733 · TAVI, la limpieza y los cuatro campos (commit 4) — 20 condiciones

- **(A)** con TAVI el catálogo es el transcatéter, el botón **no** escribe « mm» con «All», se
  publica el **DVI esperado** y el valve-in-valve trae pico, medio y EOA **sin** DVI.
- **(B)** cambiar la morfología a un tipo incompatible **limpia** el modelo.
- **(C)** los cuatro campos entran en el censo del estudio con su valor, salen al Excel **sólo con
  prótesis**, «Nuevo estudio» los borra y **restaurar por la vía muda repinta el botón**;
  **(C6b)** los cuatro **nombres de columna** del importador son los que el Excel emite —(C6)
  cuenta por campo, así que un renombre pasaba en verde y el round-trip quedaba roto en silencio—.

## TC-734 · la EOA frente a la del modelo (commit 5) — 27 condiciones

- **(A)** con el modelo cargado la EOA es evaluable, la desviación es de **2 DE por debajo**,
  entra como eje **independiente** y la tarjeta concluye significativa; **(A7)** y **ninguna**
  salvedad dice que el área no se evalúa —se contradirían—.
- **(B)** el **control** que lo prueba: el **mismo** estudio **sin** modelo concluye «posible», o
  sea que el resultado **cambia** con el modelo, y con él la frase del EN SUMA.
- **(C)** los cinco controles negativos: **TAVI**, **modo manual**, un modelo **sin desvío
  impreso**, y **(C6)** el AVA marcado **«(revisar)»** —que se puede sembrar porque el campo es de
  **texto** en tiempo de ejecución, medido— con **(C7)** su propio control sin la marca.
- **(D)** con el eje **dependiente** del flujo normal la tarjeta **no** concluye significativa: el
  eje independiente solo no alcanza.
- **(F)** la escena que separa los dos ejes **al revés** —TSVI de 28 mm y VTI aórtico de 90: DVI
  0,20 significativo y área a 0,93 desvíos, normal—: prueba que los dos **votan juntos** y que uno
  no reemplaza al otro.
- **(E)** los cortes son **−1** y **−2**, los de la tabla leída en imagen.

## TC-735 · la Tabla A5 del catálogo mitral (commit 6) — 17 condiciones

- **(A)** **30** modelos, **122** tamaños, **391** celdas con dato y **219** vacías; 12 mecánicas,
  15 biológicas y 3 sin tipo; las **cinco** columnas en su orden; y la fuente con sus hojas 57 a 60
  y sus folios 58 a 61.
- **(B)** dos filas de control con sus cinco valores.
- **(C)** Hancock II y Medtronic Mosaic están impresos **idénticos** y se cargan los dos, cada uno
  con su folio.
- **(D)** los rangos de la On-X (`27-29`, `31-33`) se conservan como texto.
- **(E)** los controles: la **Tabla A6 no está cargada**, la morfología mitral **sigue sin** opción
  de implante transcatéter, y **todos** los modelos declaran su folio.
