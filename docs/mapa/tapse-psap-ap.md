<!-- mapa armado el 2026-10-15 (tanda G1); los numeros de linea NO se guardan a proposito -->

# Mapa — el cociente TAPSE/PSAP, el diámetro de la arteria pulmonar y el color del aviso del Tei

**Tanda «G1», 2026-10-15.** Estas tres piezas salieron a archivo propio porque **no viven en la
pestaña VD/AD**: el cociente está en el **Doppler tricuspídeo**, el diámetro de la arteria
pulmonar en la **insuficiencia pulmonar de Válvulas**, y lo único del VD es el color de un
cartel. El resto de la tanda —las tres columnas, el cuadro de referencias, el Qp, la relación
VD/VI, la pared graduada y la FEVD— está en `docs/mapa/vd-derecho.md`.

⚠️ **SE PARTIÓ ANTES DE CRUZAR EL TECHO Y NO DESPUÉS.** Con todo junto, `vd-derecho.md` quedaba
en **33,5 KB**, o sea a 1,5 KB de los 35 — que es exactamente la situación en la que
`valvulas.md` cruzó el techo DOS veces. Medido con `wc -c` antes de escribir, que es lo que
`ecosmart/CLAUDE.md` pide desde la tanda D2.

Los cortes y sus folios están en `docs/fuentes/FUENTES.md` → `escErs2022` y `aseVd2025`.

---

## El cociente TAPSE/PSAP — `vdTapsePsap` y `vdTapsePsapSync`

Vive en el cuadro del **Doppler tricuspídeo**, **debajo de la PSAP estimada**, no en la tarjeta
de la válvula tricúspide: su denominador se calcula tres líneas más arriba.

```
vdTapsePsap()  ->  v('tapse') / v('psap_calc')     // crudo; null si falta cualquiera
vdTapsePsapSync()  ->  redondea a TRES decimales, CLASIFICA sobre ese mismo número y pinta
```

⚠️ **LA PSAP NO SE RECALCULA: se LEE de `psap_calc`**, que es el campo readonly con
`(4·VRT² + PmAD).toFixed(0)`. El número que el médico tiene delante es el redondeado y el
cociente tiene que salir de ése.

⚠️ **EL PREDICADO ES EL DE `calcTEP` LETRA POR LETRA** (`if (tapse && psap)`) y no un `> 0` «más
correcto»: desde esta tanda `calcTEP` **lee** esta función, así que cualquier diferencia de
guarda movería su fila, que la orden no autoriza a tocar.

⚠️ **TRES DECIMALES Y NO DOS.** Con dos, un cociente de 0,359 se imprime «0,36» y, clasificado
sobre lo impreso, deja de ser «mal pronóstico»: el corte de 0,36 se convertiría de hecho en
0,355. Con tres, el borde es el de la fuente **y** es la misma precisión con la que `calcTEP`
publica este mismo cociente.

| Tramo | Texto | Color | Respaldo |
|---|---|---|---|
| `< 0,36` | «mal pronóstico en IC con FEVI reducida y preservada» | rojo | Guazzi 2013 — ⚠️ **no verificado al estándar de la casa** |
| `≥ 0,36 y < 0,55` | «elemento de probabilidad para HTP» | naranja | ESC/ERS 2022, Tabla 10, folio 28 |
| `≥ 0,55` | «acoplamiento VD-AP normal» | verde | el complemento, y los 0,5-0,7 de sanos de la ASE 2025 folio 152 |

**Sin TAPSE o sin PSAP la fila NO se dibuja, y sin mensaje de error.**

**Medido:** 0,359 · **0,360 exacto** · 0,410 · 0,546 · **0,550 exacto** · 0,564, con los dos
bordes del lado que publica la fuente.

### Las OTRAS TRES superficies que calculan el mismo cociente

| Dónde | Corte | ¿Lee al dueño? |
|---|---|---|
| `calcTEP` (pantalla de TEP) | `> 0,32` «conservado» | **SÍ** desde esta tanda. Su texto, sus tres decimales y su corte no se tocaron |
| `_htp2022Core` (probabilidad de HTP) | `< 0,55`, en `catC` | **NO**, y es declarado: corre también sobre un estudio **GUARDADO** y no sobre el DOM |
| `cxTP` (constricción/restricción) | `> 0,36` · `0,19-0,36` · `< 0,19` | **NO**, y es declarado: tiene campos de sobreescritura propios (`cx_tapse`, `cx_psap`) |

`docs/PENDIENTES.md` → **G1-8** y **G1-9**.

⚠️ **DESDE EL G2 (2026-10-15) EL DUEÑO ACEPTA UN `src`** —un objeto `campos` de un estudio
ARCHIVADO— y tiene un segundo nombre, **`vdTapsePsapRed(src)`**, que es el dueño único del
redondeo a `VD_TPSP_DEC` (= 3) decimales. Lo leen la fila de la pantalla, la columna del Excel y
las cuatro asociaciones del Laboratorio, así que las tres publican el MISMO número. El predicado
`!t || !p` no cambió en ninguna de las dos ramas, porque `calcTEP` lee esta función.
Ver `docs/mapa/laboratorio-asociaciones-valvulas.md` y `docs/mapa/informe-pdf-excel.md`.

⚠️ **EL 0,32 DE LA PANTALLA DE TEP TIENE FUENTE PERO NO ES UN CRITERIO DE TEP.** ESC/ERS 2022,
folio 41: es el umbral de **BAJO RIESGO en hipertensión arterial pulmonar**. Por eso **no** se
agregó la frase «probabilidad de TEP» que la orden ofrecía. `docs/PENDIENTES.md` → **G1-2**.

### El globo ⓘ

Clave **`tapse-psap`** del registro `VINFO`, con el mecanismo de Válvulas del D1 — el
`#vinfo-card` es **global** (vive fuera de toda pestaña), así que **no hubo que extender nada**.
Cuatro bloques, 22 acentos, 1147 caracteres. **Medido**: abre, cierra por los cuatro caminos
(segundo toque · Escape · clic afuera · el propio botón), es un `<button>` **sin `title` y sin
`abrirAyudaEco`**, y a 1200 / 390 / 360 px en los dos temas la tarjeta entra entera en el
viewport con el globo todavía alcanzable. Captura PNG en los dos temas, con `md5` distinto.

⚠️ **LA TARJETA CITA SÓLO LO QUE SE LEYÓ EN EL ORIGINAL.** Los cortes de insuficiencia cardíaca,
de resincronización y de reparación tricuspídea por catéter que la orden listaba vienen de
fuentes secundarias que no están en la biblioteca: el bloque «a tener en cuenta» **lo dice en voz
alta** en vez de callarlo. `docs/PENDIENTES.md` → **G1-6** y **G1-7**.

---

## El diámetro de la arteria pulmonar — `ip_ap_diam`

⚠️ **SE MUDÓ A LA PESTAÑA VD / AD EN EL G3 (2026-10-15, decisión de Maicol).** Nació acá, en la
sección de insuficiencia de la válvula pulmonar y debajo del «Ancho del jet», y hoy es el
**tercer campo de la columna 3 del VD**, debajo del VTI TSVD. **Se MOVIÓ, no se duplicó**: todo
lo de abajo —el id, el dueño de lectura, la banda, la marca y la columna de Excel— vale igual.
Con él se retiró la regla `.ip-ap-col2`, y ese `.grid-2` volvió a tener DOS hijos en una sola
fila, **sin el hueco** que quedaba debajo del THP. Ver `docs/mapa/vd-derecho.md`.

Lo que el G1 dejó escrito y que el G3 deja sin efecto: _«una regla `.ip-ap-col2 { grid-column:
2; }` dentro del mismo `min-width: 769px` lo manda a la columna del jet, porque por flujo caería
en la columna 1 (debajo del THP). Deja un hueco debajo del THP, y es lo correcto.»_

⚠️ **ES UN DATO DE ENTRADA Y NADA MÁS, Y LO QUE LO GARANTIZA ES SU `oninput`:** llama **sólo** a
`ipApDiamSync` —que pinta su marca— y **no** a `calcIP`, que es el dueño del grado. Mientras eso
siga así, el campo no puede votar. Medido: con los cuatro signos de la IP cargados, grado,
pastilla, cuadro, informe y EN SUMA salen **idénticos** con y sin el diámetro.

| Qué | Cómo |
|---|---|
| Lectura única | **`ipApDiamVal()`**, para que el prompt de HTP lo conecte sin copias |
| Banda | **`IP_AP_BANDA = [5, 80]` mm** — plausibilidad, **no** severidad |
| Marca | `ip_ap_diam-marca`, con `ipApDiamSync` en **dos columnas** (`RECALC_MODULOS` y `limpiarCampos`) |
| Excel | **SÍ, desde el G2 (2026-10-15)**: «Diámetro arteria pulmonar (mm)», bloque 8, pegada a «IP etiología». Es campo de ENTRADA, así que entra en `LAB_XLS_MAP` y **se reimporta**. En el G1 no tenía ninguna (436) |
| Estudio guardado | **SÍ** viaja: su id va con guión BAJO y `_noEsDelEstudio` no lo excluye |

La banda: el piso en 5 caza el diámetro tipeado en **centímetros** (2,5 por 25) y el techo en 80
deja entrar con margen el aneurisma, muy por encima del `> 3,5 cm` que la Tabla 1 de la ASE 2025
(folio 145) llama severo. **NO entra en `LAB_XLS_RANGO_PROPIO`**: ese mapa lo consume el
importador de Excel y este campo no tiene columna.

⚠️ **QUEDA PREPARADO Y NO CONECTADO.** La comparación que la guía pide es **arteria pulmonar
contra RAÍZ AÓRTICA** —«RA: raíz aórtica» en el pie de la Tabla 10 de la ESC/ERS 2022, folio
28—, que en esta app es **`ao_sin`** («Ao sinusal», pestaña AI/VI, acordeón `sacc-aorta`). Los
otros segmentos son `ao_st` y `ao_tub`, y en ETE/TAVI están `ete_tavi_sv`, `ete_tavi_ust` y
`ete_tavi_ao_asc`. Hoy el checkbox `htp2022_b3` («Diámetro AP > diámetro Ao o AP > 25 mm») se
tilda a mano.

---

## El color del aviso del índice de Tei — el defecto D2-2, cerrado

`#vd-tei-aviso` pasó de `var(--amber)` a `var(--orange)`.

| Tema | HEAD (lo que se veía) | Hoy | Control `#diast-excl-aviso` |
|---|---|---|---|
| oscuro | `rgb(232, 236, 244)` — **gris** | `rgb(245, 158, 66)` | `rgb(245, 158, 66)` |
| claro | `rgb(26, 34, 51)` — **gris** | `rgb(217, 123, 31)` | `rgb(217, 123, 31)` |

`getPropertyValue('--amber')` devuelve **cadena vacía** en ese nodo: la variable se define sólo
dentro de `.amilo-root` y de `#sp-root`, así que `color: var(--amber)` era inválido en tiempo de
valor computado y caía al heredado. **El texto y la lógica no se tocaron.** Captura PNG en los
dos temas, con `md5` distinto.

---

---

## ⚠️ LA FILA PASÓ A DOS ESTADOS EN EL Z (2026-10-15), Y LA TARJETA SE REESCRIBIÓ

Lo de arriba —tres tramos, el 0,36, los textos «mal pronóstico en IC» / «elemento de probabilidad
para HTP» / «acoplamiento VD-AP normal» y la constante `VD_TPSP_IC_MAX`— **ya no existe**. Se
conserva escrito porque explica de dónde venía el 0,36 y por qué se fue.

### Los dos estados (decisión de Maicol)

| Tramo | Texto | Color | Respaldo |
|---|---|---|---|
| `< 0,55` | «signo de probabilidad de HTP» | naranja | **ESC/ERS 2022, Tabla 10** |
| `>= 0,55` | «sin signo de HTP» | verde | el complemento |

El corte y el operador son los de la **Tabla 10** —«Signos ecocardiográficos adicionales
indicativos de hipertensión pulmonar», columna **«A: Ventrículos»**, renglón «Cociente TAPSE/PAPs
< 0,55 mm/mmHg»—. **El valor sigue con TRES decimales** y el predicado `!t || !p` no se tocó,
porque `calcTEP` lee este mismo dueño.

⚠️ **SE CITA POR NÚMERO DE TABLA Y NO POR FOLIO.** La biblioteca tiene **sólo** la traducción de
la SEC; la orden advierte que el original inglés pagina distinto y **no hay con qué comprobarlo
acá**. El número de tabla vale en las dos ediciones. (El folio de la traducción —28 para la Tabla
10 y 41 para la 16— se re-verificó y queda en `docs/fuentes/FUENTES.md`.)

**Medido por su borde, con teclas reales y la PSAP fija en 34 mmHg:** 0,529 y 0,544 → signo ·
**0,550 EXACTO** → sin signo · 0,553 y 0,559 → sin signo. El operador estricto deja el 0,55 del
lado «sin signo», que es lo que la tabla escribe.
**Sin TAPSE o sin PSAP la fila NO se dibuja, y sin mensaje de error** — eso no cambió.

### ⚠️ POR QUÉ SE FUE EL 0,36, Y POR QUÉ SE FUE ENTERO

Su texto decía «mal pronóstico en IC con FEVI reducida y preservada» y el corte nacía de **Guazzi
2013**, que **no está en la biblioteca**: nunca estuvo verificado al estándar de la casa, y por eso
la tarjeta del G1 **ya se negaba a citarlo**. O sea que **la línea afirmaba en pantalla lo que la
tarjeta no afirmaba**. Los cortes de insuficiencia cardíaca que SÍ se verificaron —0,45 y 0,38—
viven hoy en la tarjeta, con su población y su fuente, que es donde una serie pronóstica pertenece.

⚠️ **LA CONSTANTE SE VA CON SU `window.*`.** Sacar el valor y dejar viva la línea `window.X = X`
es un `ReferenceError` de **nivel superior** que aborta el `<script>` **COMPLETO** —la app con cero
pestañas—, que es lo que la tanda de la estenosis mitral binaria pagó el 2026-10-11. **Se cuentan
los `window.X = X`, no los `grep` de X.**

### La tarjeta: los CINCO usos verificados

Formato decidido por Maicol: **una línea por uso**, «población · corte · resultado · fuente (autor,
año, revista)», y **sólo** lo verificado en el **texto completo** de un PDF de la biblioteca.

| # | Población | Corte | Fuente |
|---|---|---|---|
| i | hipertensión pulmonar | < 0,55 | ESC/ERS 2022, **Tabla 10** |
| ii | HAP, riesgo | > 0,32 · 0,19-0,32 · < 0,19 | ESC/ERS 2022, **Tabla 16** |
| iii | sanos / con HTP | 0,5-0,7 / 0,3-0,4 | **ASE 2025** (Mukherjee), folios 152 y 173 |
| iv | resincronización | < 0,45 (HR 1,44) | **Stassen 2022**, ESC Heart Failure |
| v | ICFEp hospitalizada / IC aguda con FEVI > 40 % | < 0,45 / < 0,38 (HR 2,21) | **Wang 2024**, Clin Cardiol / **Burgos 2025**, Arch Peru Cardiol Cir Cardiovasc |

⚠️ **LA TARJETA NO LLEVA NINGUNA NOTA DE VERIFICACIÓN NI RESERVA.** La del G1 decía ahí mismo que
tres cortes «no se pudieron leer en su fuente primaria»: eso es **estado interno del proceso** y
va SÓLO a `docs/fuentes/FUENTES.md` y a `docs/PENDIENTES.md`.
⚠️ **Y LA SERIE DE EMBOLIA PULMONAR SE OMITE POR DECISIÓN DEL MÉDICO** (Lyhne 2024, registro
RIETE, EHJ ACC), **aunque SÍ está en la biblioteca y SÍ se verificó**. Queda registrada en
`FUENTES.md` como fuente **disponible y no usada**, para que nadie la vuelva a buscar ni crea que
falta.

**Medido:** abre, cierra por los **cuatro** caminos, es un `<button>` sin `title` y sin
`abrirAyudaEco`, 30 acentos, cuatro bloques; a **1200 / 390 / 360 px en los DOS temas** entra
entera en el viewport con el globo alcanzable (6 de 6); el badge resuelve naranja **real**
—`rgb(245,158,66)` de noche y `rgb(217,123,31)` de día—, no la variable gris.

### ⚠️ EL 0,32 DE LA PANTALLA DE TEP: LA PARADA, CON UNA MEDICIÓN NUEVA

El G1 ya había declarado que ese número **no es un criterio de tromboembolia** (es el umbral de
riesgo bajo en HAP de la Tabla 16). El Z midió algo más, y es lo que lo vuelve intocable:

| Pregunta | Respuesta, medida |
|---|---|
| ¿suma al **score** de criterios del VD? | **NO** — su bloque no tiene ni un `score++` ni un `criterios.push` |
| ¿entra en la **interpretación**? | **NO** — `interpEl` ramifica sólo sobre `score` |
| ¿entra en el **riesgo**? | **SÍ** — `score >= 2 && desacoplado` |

**Escena medida** (dos criterios positivos fijos, PSAP 61 mmHg): TAPSE 19,5 → cociente **0,320** →
«🔴 Disfunción VD significativa»; TAPSE 20 → **0,328** → «🟠 Riesgo INTERMEDIO-ALTO». El veredicto
**se da vuelta** sobre el 0,32. Y el rótulo que lo lleva (`tep-acoplamiento`) **viaja al PDF de
TEP**.
Por eso la etiqueta **no se retiró**. `docs/PENDIENTES.md` → **Z4-TEP**.

---

---

## El TEP — la tanda «C» (2026-10-21), en su propio mapa

Lo que esta tanda hizo con el **cociente TAPSE/PSAP de la pantalla de TEP** y con el score entero
vive en **`docs/mapa/tep-score.md`**, que salió a archivo propio. Tres cosas que conviene saber
desde acá:

- **El 0,32 SALIÓ de la pantalla de TEP.** No era un corte de TEP: es el umbral de **bajo riesgo
  en hipertensión arterial pulmonar** (ESC/ERS 2022, Tabla 16, folio 41). Hoy esa pantalla
  publica el cociente como **número**, sin corte y sin color. El dueño del número sigue siendo
  `vdTapsePsap()` y **sus tres decimales no se tocaron**. Eso cierra la PARADA **Z4-TEP**.
- **El TAPSE del score de TEP pasó a `< 16 mm`** (`TEP_TAPSE_BAJO_MAX`, ESC 2019 de TEP, folio
  497.e17 y Figura 3 G). **`UMBRAL_TAPSE_NORMAL` sigue en 17** y lo leen la pestaña VD, el PDF, el
  POCUS del posoperatorio y el patrón hemodinámico: son dos preguntas distintas con dos fuentes.
- **La PSAP del score de TEP pasó a `>= 35`** —el mismo `UMBRAL_PSAP_ELEVADA`, sólo cambia el
  operador y **sólo ahí**— porque la ASE 2025 (Tabla 1, folio 145) publica normal `<= 34`.
