# PANT-5 — el dibujo de sobrecarga del VD, el Forrester y las cinco pantallas (2026-11-03)

Mapa por nombre de función y de constante, **sin números de línea** a propósito: la línea cambia
en cada edición, el nombre no. Medido al cerrar la tanda.

---

## 1 · El dibujo de sobrecarga del VD — `#vdsc-svg`

Vista apical de cuatro cámaras en la sección «Evaluación de sobrecarga del VD» de la pestaña
**Hemodinámica** (`#tep-seccion`). Portado de la demo aprobada
`docs/3d/demo_sobrecarga_vd_v4_a4c_concepto.html`.

**Solo lectura y sin controles de datos.** Se arma con lo que ya está cargado y **no escribe un
solo campo** — medido: tras seis fases y seis sincronizaciones, cero campos movidos en los cuatro
anchos. El único control es el botón de pausa, `#vdsc-play` → `vdscPlayTog`.

| pieza | nombre |
|---|---|
| geometría | `D` (dentro de su IIFE): `OUT`, `CL`, `CR`, `JET.it`, `LEAF.tv`, `LEAF.mv`, `BOW` |
| deformación | `region` → `dilate` → `deform` → `poly` |
| válvulas | `VK`, `updValve` · chorro: `J.it`, `updJet` |
| ciclo | `cc`, `atrialKick`, `avOpen`, `sysI` |
| extras del VD | `vdExtras` (barra del TAPSE, McConnell, septum, Vmáx) |
| encuadre | `fitView` · ápice: `setApex` |
| lectura del estudio | `vdscLeer` · sincronizador: `vdscSync` (expuesto) |
| puerta de verificación | `vdscFase(ph)` — fija la fase y dibuja ese cuadro |
| paleta | `--vdsc-*` en `:root` y en `html.light-mode`, **doce variables más `--vdsc-ink`** |

**De dónde sale cada dato.** VD/VI de `tepVdViRatio()` —su dueño único, el mismo que lee el score
y el informe—; TAPSE de `tapse`; McConnell de `tep_mcconnell`; tabique en D de `tep_tabique_d`;
grado de la IT de `it_grado` **traducido por `IT_MAP`**, porque ese campo vale 0, 1, 2 y **4** —no
3— y con el 4 leído como índice el chorro severo no se dibujaba; velocidad máxima de `vmax_it`.

**Las reglas del dibujo, copiadas de la demo número por número.** `dFromR(r) = clamp(r/0,72 − 1;
−0,2; 0,8)` para la dilatación del VD; la AD sigue al VD con `0,75 · d` y tope `0,6`; el TAPSE da
la fuerza de contracción con `clamp(tp/22; 0,15; 1,1)`. Sin VD/VI o sin TAPSE se usa el valor
normal de la demo (`VDSC_VD_NORM` 0,7 y `VDSC_TP_NORM` 24) **para esa parte**.

⚠️ **EL DIBUJO NACE MUDO Y ES UNA DECISIÓN DEL MÉDICO.** Sin ninguno de los seis datos, `S.hay`
es falso y los dos grupos de texto quedan en opacidad cero: **cero textos visibles**, medido, con
el contorno dibujado (369 caracteres de trazado) como denominador. Un dibujo con leyendas sobre
un paciente sin datos se lee como una afirmación.

⚠️ **LA GEOMETRÍA ES PROPIA Y NO SE COMPARTE CON EL ESQUEMA VALVULAR 2D, y es una medición.** De
los seis juegos de datos, `OUT` (424 B) y `JET.it` (565 B) son **idénticos** a los de `#v2d-svg`;
`CL`, `CR` y los dos juegos de valvas son **distintos**, porque la demo los re-digitalizó sin
tracto de salida ni válvula aórtica. Lo compartible son **989 bytes sobre 11,2 MB**, y sacarlos a
un dueño común obliga a editar el motor del esquema valvular —cuyo `D` vive dentro de su propia
IIFE y no es alcanzable—. La firma de `#v2d-svg` sale **idéntica**: 8.683 caracteres nodo por
nodo en las cinco escenas del A/B.

⚠️ **EL ROTULO VA EN `--vdsc-ink` Y NO EN `--text`.** El `--text` de la app es un gris **azulado**
(rgb 232, 236, 244), así que la sonda por color contaba once nodos fuera de la escala de grises:
los once textos del dibujo. La orden pide las variables de tema **de la demo**, cuyo gris es puro.

⚠️ **CON `prefers-reduced-motion` QUEDA QUIETO EN LA FASE 0,40**, no en la 0,30 de la demo: es
decisión del médico, para que en el cuadro fijo se vean la barra del TAPSE y el chorro.

**El tamaño es la MITAD del esquema valvular 2D, medido.** `#v2d-svg` mide 220 px por encima de
768 px y el 100 % por debajo; las dos reglas de `#vdsc-svg` son ésas divididas por dos. Medido a
1440 / 1000 / 768 / 390 px: el esquema da **220 / 220 / 714 / 336** y el dibujo **110 / 110 /
353 / 164**.

⚠️ **A ESE TAMAÑO LA TIPOGRAFÍA SALE EN 2,6 px** (8,3 a 768 y 3,9 a 390), por debajo del piso de
12 px que esta casa usa para texto chico. Los rótulos **no pisan nada** —cruce cero contra la
pared, el chorro y los otros rótulos, y cero fuera del lienzo en los cuatro anchos—, así que por
el criterio de la orden entran; la causa es el tamaño, no el rótulo. → **P5-c**.

---

## 2 · El perfil hemodinámico y el Forrester — `#hemo-forr-fila`

Los valores y las fórmulas a la izquierda, el gráfico (`#hemo-forr-graf`) a la derecha desde
**900 px**, y la advertencia de la PCP estimada **debajo, a ancho completo**.

**El mensaje de lo que falta aparecía TRES veces** —el span `hemo-forrester`, un `<text>` dentro
del SVG y el `<div data-forr-desc>` de abajo— y el del SVG **tapaba los rótulos**: cruce real en
los dos ejes con «seco-caliente» (592 u²), «seco-frío» (399), «III» (35) y «I» (12).

El del SVG se apaga con **`sinVacio`**, una opción **aditiva** de `_labForrSVG` del mismo linaje
que `vacioTxt`. **El Laboratorio no la pasa**, así que su gráfico no cambia: verificado con su
control negativo en el mismo generador —sin la opción escribe sus 19 textos, con ella 18, y el
centinela de `vacioTxt` sigue saliendo—.

⚠️ **LA TERCERA APARICIÓN ESTÁ PARADA.** El span `hemo-forrester` **llega al papel** por tres
caminos: `amiloTextoHemo()` lo integra al informe y a la hoja de ETT Avanzado del PDF, y
`_pptSpan('hemo-forrester')` lo lleva a la diapositiva. → **P5-b**.

Alto de la tarjeta, antes → después: **856,7 → 541,8** a 1440 px y **883,7 → 527** a 1000.

---

## 3 · Las dos estenosis aórticas: la conclusión descriptiva

`esubSync` / `easvSync` pintan la pastilla; `esubEstado` / `easvEstado` arman `papel` y `suma`.
**Las `alertas` son SOLO de pantalla**: `papel` y `suma` se arman de sus propias piezas y no las
leen —verificado en el código y medido—.

Lo que salió de la pantalla: el `(ESC 2020)` de la pastilla, la alerta que publicaba el criterio
de la guía, y la interpretación pegada tras un guión a un hallazgo graduado. **El corte, su guía,
su hoja y su folio siguen en los globos `esub-grad` y `easv-grad`**, que ya los tenían.

Medido en el caso del médico: la conclusión pasa de **290 caracteres con cinco marcadores** a
**72 con cero**, y la supravalvular de 390 con cuatro a 236 con cero.

---

## 4 · Las tres pantallas reordenadas

| pantalla | contenedor | columnas | corte (ventana) |
|---|---|---|---|
| Derrame pericárdico / Taponamiento | `#dpt-cols` | 4 / 2 / 1 | 1100 y 700 px |
| Fallot reparada | `#tdf-cols` | 3 / 1 | 700 px |
| Constricción vs restricción | `#cvr-campos-grid` | 2 / 1 | 700 px |

**Los cortes salen de una medición, no de un número elegido.** El ancho útil de una sección es la
ventana menos 246 px por encima de 768 y menos 62 por debajo. Para que cuatro columnas no bajen
de 200 px hace falta una ventana de 1076 → el corte va en **1100** (ahí cada una mide 212). Para
tres, 700 (ahí miden 206) y a 699 pasan a una de 637.

⚠️ **Y SON MEDIA QUERIES EXPLÍCITAS Y NO `auto-fit`**: con `auto-fit` el punto de quiebre depende
del ancho que le quede a la tarjeta, y «el ancho donde las columnas bajan de 200 px» deja de ser
medible. Es la lección que PANT-4 pagó con una barra horizontal a 900 px exactos.

⚠️ **LA CONCLUSIÓN DE FALLOT PASA A LA DERECHA DESDE 1200 px Y NO DESDE 900**, y lo decidió la
medición que la orden pide: con la conclusión al lado, `#tdf-campos` mide 344 px a 900 y 444 a
1000, o sea columnas de 108 y 141. `#mca-fila`, `#esub-fila` y `#easv-fila` **no se tocan**.

**Alturas, antes → después.** Derrame: 1018 → 620 a 1440, 1377 → 880 a 768. Fallot: 1183 → 596 a
768. Constricción: 762 → 677 a 1440, y la columna izquierda de 496 → 411, que es el hueco que el
médico pidió cerrar.

**Cierra P4-a**: los tres grupos de Fallot los decide el médico y los **quince** campos de la
sección figuran en su lista (4 + 6 + 5), censado antes de mover nada.

---

## 5 · La CIA y la CIV lado a lado — `#ete-shunt-fila`

**Es flex y no grid, y eso es lo que hace que «una sola ocupe todo» salga gratis**: los dos
paneles se muestran y se esconden con `display:none`, y un hijo así no participa del reparto.

**El dueño único del `display` es `eteShuntPanes`**, nuevo. Hasta esta tanda lo decidía sólo
`_eteShuntPane` —los botones nacieron como solapas—, así que **con las DOS lesiones marcadas se
veía UN solo panel**: medido en HEAD, los dos checkbox en `true` y `vis cia/civ = false/true`.

La regla es una línea: **un panel se ve si su lesión está marcada _o_ si es el navegado.** El
«o» conserva la garantía documentada de `eteShuntLesionTog` —desmarcar no esconde el panel,
porque un campo oculto se sigue guardando—.

Se repinta también desde `eteShuntSync`, que está en `RECALC_MODULOS`: las cinco rutas de
restauración reponen los checkbox asignando `.checked`, que no dispara nada.

El diagrama de bordes baja de **260 a 190 px** (160 a 390), por CSS, sin tocar su marcado: sus
7 segmentos, sus 7 textos y los 765 caracteres de su panel son los mismos en los dieciséis cruces.

⚠️ **LOS CINCO BLOQUES DE «Comunes a CIA y CIV» QUEDAN FUERA DE LA FILA.** En la primera versión
quedaron dentro y la fila tenía **siete** hijos flex en vez de dos: cada panel se quedaba con
183 px de los 1194 a 1440 px.

---

## 6 · La longitud de los velos mitrales: un dato, dos puertas

`etemVeloGesto(id)` con `_ETEM_VELOS = [['ete_lva','teer_lva'], ['ete_lvp','teer_lvp']]`, colgado
de los **cuatro `oninput`**. Gana la última edición, **el vacío incluido**.

**El defecto, medido en los dos sentidos antes de tocar nada:** `ete_lva` en 24 dejaba `teer_lva`
VACÍO, y `teer_lva` en 26 dejaba `ete_lva` vacío. El rótulo «auto ← ETE Válvula Mitral» prometía
un espejo que no ocurría en ningún gesto.

⚠️ **CUELGA DEL GESTO Y NO DE NINGÚN BARRIDO** —la lección que el D-9, el D-10 y el D-11 pagaron
tres veces— y **no despacha `input` en el par**, que haría que el gesto se copiara de ida y
vuelta. `_syncSiVacio` **no se retira**: sigue siendo el camino de los estudios viejos.

**Lo que NO se unió, y por qué:**

| duplicado | medido | decisión |
|---|---|---|
| `ete_prof_coapt` ↔ `teer_prof_flail` | mismo rótulo, cortes distintos (≤10 vs ≥11) y grupos distintos en `M3D_TABLA` | **PARADO** → P5-f |
| `avm_plan` ↔ `teer_area_mitral` ↔ `ete_area_mitral` | tres campos de área | **PARADO** → P5-h |
| `ete_etiologia` ↔ `vm_morf` | **ya sincroniza** por `eteVmPropagar` | nada |
| `ete_carpentier` ↔ `vm_carp` | **ya sincroniza** por `vmCarpPropagar` | nada |
| `ete_mecanismo` | **no tiene par**: «queda sólo en el ETE» | nada |

**La disposición en tres columnas está PARADA** → P5-e: exige fundir tres acordeones con sus dos
casillas de inclusión, y la orden no dice qué pasa con ellas.

---

## 7 · Los estadios de la AHA/ACC 2020

Piezas genéricas (de PANT-4): `IND_EST_FTE`, `_indEstFila`, `_indEstSint`.
Escaleras: `_indEstEA`, `_indEstIA` (PANT-4) y **`_indEstEM`, `_indEstIMP`, `_indEstIMS`,
`_indEstIT`** (esta tanda), más `_indEstNoHay` y `_indEstITNota`.

| lesión | tabla | hoja | folio | pregunta |
|---|---|---|---|---|
| estenosis mitral | 16 | 42 | e113 | `em.sintomas` |
| insuficiencia mitral primaria | 17 | 50 | e121 | `im.sintomas` |
| insuficiencia mitral secundaria | 18 | 57 | e128 | `ims.sintomas` |
| insuficiencia tricuspídea | 20 | 61 | e132 | `vt.sintomas` |

**Regla de folio: folio = e(hoja + 71)**, comprobada en el pie impreso de las cuatro hojas.

⚠️ **EN LA ESTENOSIS MITRAL EL GRADIENTE MEDIO NO ENTRA**, y la tabla lo dice en su nota al pie:
por su variabilidad con la frecuencia cardíaca y el flujo anterógrado **no se incluyó** entre los
criterios de severidad. Lo que gradúa es el **área**, y su corte —1,5 cm²— es **el mismo** que el
selector binario de la app.

⚠️ **EN LA SECUNDARIA LOS SÍNTOMAS NO SEPARAN C DE D.** La tabla los admite en los **cuatro**
estadios y define el D porque **persisten** tras la revascularización y la optimización del
tratamiento. Con síntomas el estadio sale como «C o D, según la respuesta al tratamiento».

⚠️ **LA TABLA 20 NO TIENE FILA A** en esta edición, verificado en imagen: arranca en B.

**La estenosis tricuspídea y la válvula pulmonar no tienen estadios**, y la pantalla lo dice: la
pulmonar con su propia fila y la tricuspídea en la **nota** del estadio de la insuficiencia, para
no dejar dos filas «Estadio» en una sección diciendo cosas distintas.

⚠️ **PROBAR EL GRADO «moderada-severa» COSTÓ UNA MEDICIÓN**: ese valor ya no es opción de los
selectores —se fue con el `<select>` viejo— pero **sí puede venir de un estudio guardado**, y
asignar un valor que un selector no tiene lo deja en cadena vacía. La sonda lo inyecta al vuelo.

---

## Sondas de la tanda

`_probe_pant5vd.mjs` (la sección y el esquema valvular) · `_probe_pant5demo.mjs` (la geometría
contra la demo) · `_probe_pant5rot.mjs` (rótulos, colores y dibujo mudo) · `_probe_pant5mov.mjs`
(pausa, reduced-motion y costo por tecla) · `_probe_pant5forr.mjs` · `_probe_pant5esten.mjs` ·
`_probe_pant5dpt.mjs` · `_probe_pant5ciaciv.mjs` · `_probe_pant5mitral.mjs` ·
`_probe_pant5tdf.mjs` · `_probe_pant5cvr.mjs` · `_probe_pant5est.mjs` · `_probe_pant5ab.mjs`
(el A/B de superficies) · `_mut_pant5.py` (31 mutaciones).

⚠️ **DENOMINADORES QUE ESTA TANDA PAGÓ, uno por sonda:** la sección del derrame y la de
constricción viven en **Hemodinámica**, no en una pestaña de pericardio; la CIA y la CIV en la
sub-pestaña **«CC complejas»**; **Fallot en la primera**; el gráfico del Forrester **no se pinta
solo** al abrir la pestaña; el acordeón de Fallot abre con `max-height` y una transición; y la
tabla «Datos usados en el dibujo» sólo se puebla con el panel 3D abierto.

---

## Lo que la tanda PANT-6 movió de estas dos pantallas (2026-11-03)

- **El dibujo de sobrecarga del VD pasó de 110 px a 520, y su letra de 2,6 px a 12,26.** Cierra
  **P5-c**. **El dibujo no se tocó**: lo que cambió son su ancho (`#vdsc-svg`, `max-width:520px`)
  y la maqueta de la sección (`#vdsc-fila`, 55/45 desde 900 px, con la lista de criterios debajo
  de los campos). El **520** es una medición: el mínimo para 12 px es 509.
- **La pantalla de CIA y CIV se rehizo entera.** Los botones ya **no** deciden la maqueta: la CIA
  siempre a la izquierda, la CIV siempre a la derecha, todos los campos habilitados, y el botón
  decide **sólo** si la lesión entra al informe. `eteShuntPanes()` es dos líneas y no lee ninguna
  casilla; `eteShuntSync` perdió el bloque de la clase `dos`.
- **La PSAP por insuficiencia tricuspídea se dejó de repetir** en los dos paneles: quedó la de la
  CIV.
- ⚠️ **Y el recorte de 116 a 389 px del cuerpo del acordeón, que era PREEXISTENTE, se cerró de
  paso** — ver `docs/PENDIENTES.md` → **P6-g**.

**Dónde está todo:** `docs/mapa/pant6-pantallas-molde.md` § 1 y § 2.
