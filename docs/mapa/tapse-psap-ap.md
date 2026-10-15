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
