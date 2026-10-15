# Mapa · La PANTALLA de las insuficiencias AÓRTICA y TRICUSPÍDEA, las tarjetas ⓘ, el rótulo THP y el color de los avisos

Tanda **D2** del rediseño de Válvulas (2026-10-14), segunda mitad de la que
`docs/mapa/valvulas-mitral-pantalla.md` documenta. Armado sobre `5b92b4c`; **sin números de
línea a propósito** — la línea cambia en cada edición, el nombre de la función no.

Lo que la tanda **no** toca: ningún corte, ningún grado, ninguna regla de integración, ningún
texto del informe salvo el rótulo del punto 3, el Excel (sigue en **436** columnas) y el
Laboratorio.

---

## 1 · La INSUFICIENCIA AÓRTICA — tres columnas de cuatro

Rejilla `.valv-cols-3` dentro de `#bloque-insuf-aortica`, **cada columna en su propio
contenedor**: eso es lo que hace que el Tab BAJE por la columna en vez de cruzar la fila, porque
no hay un solo `tabindex` en el bloque y el orden del DOM es el del recorrido.

| col | fila | id | rótulo | quién lo escribe |
|---|---|---|---|---|
| 1 | 1 | `ia_vc` | Vena contracta (mm) | el médico |
| 1 | 2 | `ia_jet_diam` | Diám jet IAo en TSVI (mm) | el médico |
| 1 | 3 | `ia_pht` | **THP** (ms) | el médico |
| 1 | 4 | `ia_vmax_td` | Vmax telediast. Ao desc. (cm/s) | el médico |
| 2 | 1 | `ia_pisa_r` | Radio PISA IAo (mm) | el médico |
| 2 | 2 | `ia_pisa_val` | Valiasing IAo (cm/s) | el médico |
| 2 | 3 | `ia_vmax_cw` | Vmax IAo CW (m/s) | el médico |
| 2 | 4 | `ia_vti` | VTI IAo (cm) | el médico |
| 3 | 1 | `vauto-ia-eroa` | EROA por PISA (mm²) (auto) | `_iaAutosSync` |
| 3 | 2 | `vauto-ia-volr` | Vol-R por PISA (ml) (auto) | `_iaAutosSync` |
| 3 | 3 | `vauto-ia-fr` | FR por PISA (%) (auto) | `_iaAutosSync` |
| 3 | 4 | `ia_vti_desc` | VTI IAo Ao desc. (cm) | el médico |

**Los nueve tipeables YA EXISTÍAN** y no cambiaron de `id`, `oninput`, `step`, `placeholder` ni
rótulo: se movieron **wrappers**. Reparto anterior: 3 + 3 + 3, con `ia_vti`, `ia_vmax_td` y
`ia_vti_desc` los tres en la columna 3.

## 2 · La INSUFICIENCIA TRICUSPÍDEA — 3 + 3 + 2

Rejilla `.valv-cols-3` dentro de `#campos-insuf-tricuspide`. **Eran dos filas de `grid-3`**, así
que el Tab cruzaba la fila.

| col | fila | id | rótulo |
|---|---|---|---|
| 1 | 1 | `it_vc` | Vena contracta (mm) |
| 1 | 2 | `it_densidad` | Densidad jet CW (`<select>`) |
| 1 | 3 | `it_vti` | VTI IT (cm) |
| 2 | 1 | `it_pisa_r` | Radio PISA IT (mm) |
| 2 | 2 | `it_pisa_val` | Valiasing IT (cm/s) |
| 2 | 3 | `it_vmax_cw` | Vmax IT CW (m/s) |
| 3 | 1 | `vauto-it-eroa` | EROA por PISA (mm²) (auto) |
| 3 | 2 | `vauto-it-volr` | Vol-R por PISA (ml) (auto) |

⚠️ **LA COLUMNA 3 TIENE DOS Y NO TRES, Y ES UNA PARADA DECLARADA.** La orden pedía EROA, Vol-R y
**FR**. La **fracción regurgitante de la IT no la calcula ninguna función de la app** —`calcIT_ESC`
produce `eroa` y `volR` y nada más, e `itRefPintar` tiene tres filas: vena contracta, EROA y
Vol-R— y la **Tabla 14 de la ASE 2017, folio 350, tampoco publica una banda de FR para esta
válvula**: sus filas son VCW, EROA, RVol, densidad del chorro por CW, radio PISA y área del jet
color. No se inventa ni la cuenta ni la banda. `docs/PENDIENTES.md` → **D2-1**.

## 3 · LAS CINCO CASILLAS AUTOMÁTICAS NO CALCULAN: COPIAN SU FILA

Dos dueños, uno por lesión, los dos sobre el **mismo copiador**:

- **`_iaAutosSync()`** — llamada desde `calcIA_ESC` y desde `limpiarCampos`.
- **`_itAutosSync()`** — llamada desde `calcIT_ESC` y desde `limpiarCampos`.
- **`_imAutoDeFila(idCampo, idSpan, falta, sep)`** — el copiador, que nació en el D1 y gana en
  esta tanda un **cuarto argumento opcional**, el separador. Omitido, el comportamiento es
  idéntico al de los cuatro llamadores de la IM.

| casilla | fila que copia | separador |
|---|---|---|
| `vauto-ia-eroa` | `ia-eroa` | dos espacios (el de serie) |
| `vauto-ia-volr` | `ia-volr` | dos espacios |
| `vauto-ia-fr` | `ia-freg` | dos espacios |
| `vauto-it-eroa` | `it-eroa` | ` · ` (punto medio) |
| `vauto-it-volr` | `it-volr` | ` · ` |

⚠️ **EL SEPARADOR DE LA IT ES OTRO Y POR ESO EL ARGUMENTO EXISTE.** `itRefPintar` escribe
«18.1 mm² · Leve (<20 mm²)», o sea el valor **con su grado pegado**; sin el corte por el punto
medio la casilla publicaría la GRADUACIÓN, y el reparto que el D1 fijó es que **la casilla publica
la medición y el cuadro la graduación**. Las filas de la IAo no traen leyenda, así que les sirve
el corte por dos espacios — que además recorta las tres explicaciones largas de la FR
(«—  (114 % imposible: …)»), dejando la casilla vacía y la explicación en la fila, que es donde
hay ancho para leerla.

⚠️ **LAS DOS LLAMADAS VAN ANTES DEL `return` TEMPRANO de `params.length === 0`**, que es la única
posición correcta: por ese `return` se sale cuando nadie cuantificó —o cuando todo lo cargado
quedó fuera de banda—, que es justo el estado en el que las casillas tienen que vaciarse y decir
qué falta. En la IT van pegadas a `itRefPintar`; en la IAo, justo después del `else` que devuelve
las tres filas a «—».

⚠️ **EL TEXTO DE «requiere …» SIGUE LA PRECEDENCIA DE LA CUENTA, Y EL VOL-R DE LA IAo LO PRUEBA.**
Las filas `ia-volr` e `ia-freg` viven dentro del **mismo** `if (vtiIA && itsvi && dtsvi)` de
`calcIA_ESC`, así que sin el Ø o el VTI del TSVI las dos se van al `else`. La primera versión de
`_iaAutosSync` no los nombraba en el Vol-R y **la sonda informó la casilla vacía con el
placeholder vacío al lado**: un campo mudo que no dice qué le falta. Los dos del TSVI llevan
«(en Estenosis)» porque su puerta visible en esta pestaña es `ea_dtsvi` / `ea_vtitsvi`.

⚠️ **NINGUNA VIAJA CON EL ESTUDIO:** prefijo `vauto-`, que `_noEsDelEstudio` ya excluía desde el
D1. Medido: **893 campos, mismo hash, cero claves `vauto-`.**

## 4 · LAS TARJETAS ⓘ — dieciséis globos, dieciséis entradas, cero legado

El mecanismo es el del D1 (`vInfoClic` → `_vInfoAbrir` → `_vInfoColocar`, con `#vinfo-card` única
en el marcado) y **no se duplicó**. Lo que cambia es el registro `VINFO`, que pasa de **5 a 16**
entradas: las **cuatro nuevas** y las **siete reescritas**.

| clave | dónde cuelga | fuente de la tarjeta |
|---|---|---|
| `ia-eroa-pisa` | `vauto-ia-eroa` (IAo) | ASE 2017 folios 311 y 312; Tabla 14, folio 339 |
| `it-eroa-pisa` | `vauto-it-eroa` (IT) | ASE 2017 folio 312; Tabla 14, folio 350 |
| `ea-ava-cont` | `ea_ava_display` (EAo) | EAE/ASE 2009 folios 6 y 7 |
| `et-avt-cont` | `et_avt` (ET) | EAE/ASE 2009, Tabla 10 y su texto, folio 19 |
| `prot-eoa` · `prot-dvi` | prótesis mitral | ASE 2024, Tabla 11, pág. 27 |
| `prot-ppm` | prótesis mitral | ASE 2024, Tabla 7, pág. 20 |
| `im-onda-e` · `im-vc` | referencias de la IM | ASE 2017, Tabla 8, folio 332 |
| `im-vti-ratio` | referencias de la IM | ASE 2023 folio 12 · ESC/EACTS 2025 folio 4672 · ASE 2024 Tabla 12 pág. 28 |
| `im-jet-ai` | referencias de la IM | ASE 2017 Tabla 8 folio 332 · ASE 2024 Tabla 13 pág. 30 |

⚠️ **EL `title` LARGO DE LAS SIETE SE RETIRÓ, y eso es lo que hace que «cero legado» sea una
afirmación y no una formalidad.** Un globo sin entrada en el registro cae al camino que lee el
`title` de su fila (`_vInfoLegadoTxt`): con los `title` retirados, una clave sin entrada abriría
una tarjeta **VACÍA** y nadie lo notaría. TC-472 lo fija exigiendo que las dieciséis claves del
marcado tengan entrada.

⚠️ **NINGÚN CORTE SE MOVIÓ.** Los once números de esos siete textos se verificaron contra la
constante que la app aplica: `IM_CORTES.vc` (3 y 7 mm), `IM_CORTES.jet_nat` (20 y 40 %),
`IM_CORTES.jet_prot` (20 y 50 %), `UMBRAL_ONDA_E_APOYO_IM` (120 cm/s), el 1,4 y el 2,5 del
cociente de VTI, `VM_PROT_EOA_OBSTR_MAX` (1,0), `VM_PROT_DVI_NORMAL_MAX` (2,2),
`VM_PROT_DVI_SIGNIF_MIN` (2,5) y `VM_PROT_PPM_CORTES`.

⚠️ **LO QUE EL TEXTO LARGO DECÍA Y LA TARJETA NO REPITE BAJÓ A «Referencia clínica»**, en dos
bloques nuevos de la tarjeta de la IM: **«Salvedades de los parámetros de apoyo»** (las de la onda
E, la vena contracta, el jet/AI y el cociente de VTI) y **«Prótesis mitral — ASE 2024»** (el
detalle del EOA, el DVI y el PPM, que **no estaba en ninguna otra superficie de la app**). La
tarjeta **no** lleva a esa pestaña: el globo ya no abre el manual.

⚠️ **UN GLOBO SIN GEOMETRÍA NO ANCLA NADA, Y ESO ES LO CORRECTO.** Los tres de la prótesis miden
**0×0** mientras la morfología mitral no sea protésica, así que se miden en una **escena protésica
aparte**; sin ella, «no abre» se lee como «el mecanismo no funciona». Lo mismo dentro del cuerpo
de un caso: TC-472 abre la pestaña, la sección plegable y el cajón antes de clickear, y **aborta
nombrando el `0x0`** si el globo no tiene caja.

## 5 · El rótulo **PHT → THP**

**Veinticuatro lugares cambiados**, en siete superficies: los cinco rótulos de campo y de fila
(IAo, IP y el TAVI del ETE), la fila de la tabla de ayuda, el badge de fuera de banda de la IAo,
el aviso de insumos fuera de rango, el **nombre del voto** que publica la fila de discordancia
(`params.push({p:'THP'})`), las **dos vías** del informe narrativo del TAVI, la etiqueta del PDF,
los cinco rótulos y las dos notas del panel de revisión del Doppler importado, la etiqueta visible
del vocabulario UCUM y la línea de ayuda del cálculo de presiones.

**NO SE CAMBIARON**, con el motivo:

| qué | por qué |
|---|---|
| `PHT IAo (ms)`, `TAVI RPV PHT (ms)` y el prefijo de ordenamiento `PHT IAo` | **son encabezados de columna del Excel y el importador lee por NOMBRE**: renombrarlos descarta esas columnas en todo backup ya exportado. La alternativa, cuando se decida: una tabla de alias **de entrada** —el patrón que `LAB_XLS_LISTAS_LEGADO` ya usa para los valores—. Es un cambio del Excel y la orden lo manda parar |
| la clave `AR PHT` de `CHM_MAPA` | es el vocabulario del **ecógrafo**, no nuestro. Su `etiq` visible SÍ cambió |
| cinco citas literales en inglés de las guías | alterar una cita la falsifica |
| 44 comentarios de código y el nombre `_avmPorPHT` | no se muestran |

⚠️ **`ET THP (ms)` YA DECÍA THP**, así que la inconsistencia del libro es preexistente y queda
reducida a dos encabezados.

**Medido:** el texto **visible** de Válvulas pasa de 5 PHT / 6 THP a **0 / 11**, y el del ETE de
1 / 0 a **0 / 1**; el Doppler no tenía ninguno. El informe narrativo del TAVI cambia en los tres
estilos y **sólo en el rótulo**; el EN SUMA no se mueve.

## 6 · El COLOR de los avisos

`--amber` se define **únicamente** dentro de `.amilo-root` y de `#sp-root`. Fuera de esos dos
contenedores `color: var(--amber)` es **inválido en tiempo de valor computado** y cae al heredado.
Medido en HEAD en los dos temas, `getPropertyValue('--amber')` devuelve **cadena vacía** en los
siete nodos que la usan.

| aviso | HEAD oscuro / claro | hoy |
|---|---|---|
| `im-pdf-metodo-aviso` | gris `rgb(232,236,244)` / `rgb(26,34,51)` | `rgb(245,158,66)` / `rgb(217,123,31)` |
| `diast-algo-aviso` | ídem | ídem |
| `diast-fc-aviso` | ídem | ídem |
| `diast-bse-eprima-aviso` | ídem | ídem |
| `diast-bse-gris-aviso` | ídem | ídem |
| `diast-excl-aviso` | ya estaba en `--orange` | **sin cambio** (control negativo) |
| `vd-tei-aviso` | gris | **NO SE TOCÓ** — fuera del alcance, `PENDIENTES.md` → D2-2 |

⚠️ **SON CUATRO AVISOS DE LA DIASTÓLICA Y NO TRES.** La orden decía «los tres» y el censo del
archivo da cuatro. Se cierran los cuatro; el comentario de la zona, que afirmaba que «los otros
tres siguen con `--amber` a propósito», se corrigió en el mismo lugar.

⚠️ La única otra lectura de `--amber` fuera de esos contenedores lleva **valor de respaldo**
(`var(--amber, #f59e0b)`), así que resuelve bien y no se tocó.

---

## 7 · Cómo medir esta zona

**Arnés: `scripts/_probe_iaitcols.mjs`** — A/B de solo lectura, con `--file` para correr contra una
copia de HEAD y `--captura --dest` para los PNG.

```bash
node scripts/_probe_iaitcols.mjs --solo campos,autos > /tmp/d2.NEW.json
node scripts/_probe_iaitcols.mjs --solo superficies,controles --file /tmp/index.HEAD.html > /tmp/d2.HEAD.json
node scripts/_probe_iaitcols.mjs --solo captura --dest /tmp
```

Grupos: `campos`, `autos`, `globos`, `thp`, `tavi`, `color`, `superficies`, `controles`, `ancho`,
`captura`.

**Cobertura: TC-472**, **39 condiciones**, con cinco denominadores y cuatro controles negativos.
Verificado que sabe fallar contra HEAD en un worktree aparte: **22 de las 39 en rojo, y ninguna
por excepción**; las 17 que pasan son lo que esta tanda no mueve.

### Las trampas medidas en esta tanda

⚠️ **ENTER NO ACTIVA UN CHECKBOX; Y EL CHECKBOX DEL TAVI NO ES EL CONTROL.** La escena del informe
del TAVI informó «el informe no cambia» **dos veces** sobre gestos que no ocurrieron: primero
porque el respaldo por tecla de `clicEn` manda Enter y la tecla de un checkbox es Espacio, y
después porque `ete_tavi_incluir_chk` está en `display:none` con `tabindex="-1"` y el control real
es el **botón** «Integrar al informe» (`[data-ete-chk="ete_tavi_incluir_chk"]`). Ese bloque cuelga
de **cuatro** puertas: la pestaña ETE, la sección plegable del TAVI, su solapa «post» y esa
casilla.

⚠️ **UN REGEX CON `\n` DENTRO DE UN TEMPLATE LITERAL NO PARSEA.** La barra-ene se **cocina** a un
salto real, así que `/\n/g` queda con un salto adentro —«Invalid regular expression: missing /»— y
`'\n'` deja la cadena sin cerrar —«Invalid or unexpected token»—. Las dos aparecieron seguidas al
escribir TC-472. Se nombra el salto por su código: `String.fromCharCode(10)`.

⚠️ **ME COMÍ EL ACENTO GRAVE TRES VECES**, las tres en comentarios míos dentro del cuerpo de un
caso, con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la
línea exacta las tres; `node --check` apuntaba a la apertura del template.

⚠️ **LA ESCENA BASE DABA UNA FR IMPOSIBLE Y LA CASILLA SALÍA VACÍA.** Con Ø TSVI 20 mm y VTI 20 cm
el volumen eyectado es 62,8 ml contra un Vol-R de 71,4: la FR daba 114 % y la fila publicaba su
explicación en vez de un número, así que la casilla quedaba en blanco **y coincidía igual**. Una
escena que no produce el valor que se quiere medir pasa la comparación sin medir nada: se subió a
22 mm y 25 cm.

⚠️ **EL GLOBO SIGUE SIENDO ALCANZABLE DESPUÉS DE ABRIR SU TARJETA**, y se mide: a 1200, 390 y 360
px en los dos temas, `elementFromPoint` sobre el centro del globo devuelve el globo en las 30
lecturas. Es el defecto que el D1 encontró con su tarjeta más alta, que se colocaba arriba de todo
y tapaba su propia ancla.
