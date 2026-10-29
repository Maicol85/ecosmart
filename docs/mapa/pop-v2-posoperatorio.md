# El posoperatorio reordenado — tanda «POP-V2» (2026-10-29)

Mapa de lo que esta tanda movió dentro de la subpestaña **«POP Cirugía Cardíaca»**. Por **nombre
de función y de constante**, nunca por número de línea.

> **El mapa base del módulo sigue siendo `docs/mapa/g-posoperatorio.md`** —qué es cada bloque,
> de dónde sale cada número, qué publica cada superficie—. Acá está sólo lo que cambió, y lo que
> ese mapa dice y **dejó de ser cierto**.

---

## 0 · Lo que el mapa de la tanda G dice y HOY ES FALSO

| Lo que dice `g-posoperatorio.md` | Hoy |
|---|---|
| «El reparto lo hace `grid-template-areas`, no el orden del marcado» | **Se retiró.** El módulo es UNA columna y el orden del marcado ES el orden visual |
| «El corte es 1100 px y no 768» (para el reparto en tres columnas) | El corte de 1100 px sigue, pero reparte **el dibujo y su texto** dentro de su tarjeta |
| «El cuerpo está acotado (`max-height:250px` con scroll propio)» | **Sin `max-height`.** El recuadro entra entero |
| «El hueco queda reservado … `min-height` inline» | **Sin reserva.** En una columna, plegar mueve lo de abajo y nada más |
| «El lactato … campo opcional que la app **NO interpreta**» | Sigue siendo opcional y el papel lo publica como dato, pero **enciende una señal** por encima de 2 mmol/L |
| «`popDosisDilucion` … **no escribe ningún campo**» | **Escribe `pop_<k>_dosis`**, con dos marcas de runtime que respetan lo que el médico teclea o borra |
| «PPT del paciente: la rama `integrado('pop')`, que lee `popPatron()`» | Ya **no** publica el patrón ni las cinco preguntas |

---

## 1 · El orden, y por qué el marcado se movió de verdad

| Qué | Dónde |
|---|---|
| El orden de las seis tarjetas | el **marcado**, `#pop-seccion > .pop-grid > section[data-pop]` |
| El orden | `pop-ctx` · `pop-soporte` · `pop-hemo` · `pop-pocus` · `pop-esq` · `pop-concl` |
| La grilla | `.pop-grid`, UNA columna en todos los anchos |
| El dibujo y su texto | `.pop-esq-par`, dos columnas **desde 1100 px** |

La tanda G ubicaba cada tarjeta por su `grid-area` justamente **para no** mover el marcado, y el
precio era que el orden visual y el de tabulación no coincidían. Medido en HEAD a 1440 px: el
marcado decía `ctx, hemo, esq, soporte, pocus, concl` y la pantalla mostraba
`hemo, esq, ctx, soporte, pocus, concl`. Hoy los **tres** órdenes coinciden —marcado, visual y
tabulación—, que es lo que el médico pidió: el orden en que carga los datos.

### Los dos defectos de pantalla que esto cierra, medidos antes y después

| | 1440 | 1000 | 768 | 390 |
|---|---|---|---|---|
| **HEAD** · recuadro del Swan: caja / contenido | 250 / **406** | 250 / **367** | 553 / 553 | 613 / 613 |
| **hoy** | 323 / 323 | 329 / 329 | 553 / 553 | 613 / 613 |
| **HEAD** · selectores del POCUS recortados | 0 de 6 | **6 de 6** | 0 de 6 | 0 de 6 |
| **hoy** | 0 | 0 | 0 | 0 |

El segundo se arregló **por los dos lados, porque uno solo no alcanza**: la subgrilla
`.pop-pocus-grid` pasa a dos columnas sólo desde 1100 px, y el `.grid-3` de adentro pasa a
`auto-fit` con un **piso de 170 px**. La cadena del defecto era la tarjeta en media pantalla
(~470 px) × dos columnas de la subgrilla (~230) × tres columnas del `.grid-3` (~70), y eso dejaba
9, 13 y 43 px de ancho útil para opciones que necesitan 100 a 110.

### El desplegable de fármacos

`<details id="pop_farmacos_det">` con `<summary id="pop_farmacos_sum">`, **cerrado por omisión**.
El contador lo escribe **`popSync`** en `#pop_farmacos_cnt` —`<details>` no cuenta nada— y suma
las diez drogas marcadas **más** la asistencia circulatoria consignada que no sea «ninguna»:
«ninguna» es una respuesta, no un soporte en curso.

### La nota larga de la vasoplejia

Pasó al globo ⓘ **`pop-vaso`** con su contenido íntegro —las dos fuentes, sus tres criterios, la
errata de unidad del segundo y la aclaración de que ninguna es una guía—. En la línea visible
queda **una oración por rama**, y las tres ramas siguen siendo excluyentes.

⚠️ **La relación VD/VI del POCUS ya era de sólo lectura y no se tocó**: no hay, ni hubo nunca, un
campo de VD/VI en este módulo. La publica `popPocusSync` leyendo `vdViEstado` (C1-3b).

⚠️ **`popAbrirEnEscritorio` es código muerto, y no se tocó.** Recorre cinco ids —`pop-ctx`,
`pop-soporte`, `pop-hemo`, `pop-pocus`, `pop-concl`— que **no existen**: las secciones llevan
`data-pop`, no `id`. Es un no-op desde que la tanda G las convirtió en tarjetas. Declarado en
`PENDIENTES.md` → **POP-f**.

---

## 2 · La dosis: gana la última edición del médico

| Qué | Dónde |
|---|---|
| El dueño único del cálculo y de la escritura | `popDosisDilucion(k)` |
| Las que se dosifican por peso | `POP_DROGAS_PESO` — las diez **menos** `vaso` |
| «lo escribió la app» | `data-pop-auto`, con el valor escrito |
| «lo escribió una persona» | `data-pop-mano`, puesta por el `oninput` del campo |
| El predicado | `_popDosisMano(el, calc)` |
| Los dos gestos | `popDosisMano(k)` · `popDosisVolver(k)` |
| El botón | delegación por `data-pop-volver` sobre el documento, registrada UNA vez |

La fórmula no se tocó: `(mg × 1000 ÷ ml) × (ml/h) ÷ 60 ÷ peso`. Verificada contra el caso conocido
—4 mg en 100 ml a 21 ml/h con 70 kg = **0,20 mcg/kg/min**— **en HEAD**, donde la línea ya decía
«≈ 0.20 mcg/kg/min usar» y el campo estaba vacío.

### Por qué hacen falta DOS marcas y no una

`data-pop-auto` sola no alcanza: si el médico **borra** la dosis, el campo queda vacío, no es
«nuestro», y la pasada siguiente la vuelve a escribir. Es el defecto que el **D-9**, el **D-10** y
el **D-11** pagaron tres veces en el módulo de amiloidosis, y la lección que quedó escrita es «el
campo del estudio es el dueño y gana la última edición». `data-pop-mano` es lo único que hace que
un campo vacío siga vacío.

⚠️ **Las dos entran en la lista cerrada de «Nuevo estudio», en el SELECTOR y en el CUERPO**, que
son dos listas. Una marca de runtime que sobrevive manda sobre el paciente siguiente.

⚠️ **Una dosis de un estudio VIEJO no se pisa, y es por construcción**: viene sin `data-pop-auto`
—el `dataset` no se persiste—, así que queda como está, marcada «a mano», con el cálculo publicado
al lado para comparar.

⚠️ **Y `popDosisTodas` está en `ESPEJOS_VIVOS`**, así que esto corre 220 ms después de cualquier
tecla. Lo que lo hace seguro es `data-pop-mano`: el barrido no puede deshacer un gesto.

---

## 3 · La PAM por línea arterial

| Qué | Dónde |
|---|---|
| El campo | `#pop_pai_pam`, dentro de `#pop_pai_wrap`, en la tarjeta de contexto |
| Quién lo muestra | `popMonSync`, con `pop_monitor === 'pai'` |
| El dueño único | `pamEfectiva()` · `PAM_FUENTE_LBL.art` · `PAM_FUENTE_DET.art` |

Es **el único campo guardado nuevo** de la tanda. Censo del script 1025 → 1026 por este campo (y
→ 1027 por el selector de timing, que **no** es del estudio). Excel **sigue en 440** columnas:
`LAB_XLS_MAP` es una lista explícita y no tiene un solo `pop_`.

No se borra al cambiar de dispositivo: se **lee con compuerta**, igual que la PAM del Swan.
Borrar destruiría un dato de un estudio guardado; leer con compuerta no.

### Las cuatro combinaciones, medidas

| escena | HEAD | hoy |
|---|---|---|
| sólo línea arterial | sin PAM | **62 · medida (línea arterial)** |
| línea arterial + Swan | 58 · medida (Swan-Ganz) | 58 · medida (Swan-Ganz) |
| línea arterial + tipeada | 95 · de Hemodinámica | **62 · medida (línea arterial)** |
| ninguna | sin PAM | sin PAM |

⚠️ **EL PiCCO NO TIENE CAMPO DE PAM EN ESTA APP**, censado: sus cinco campos son GC, IC, ITBVI,
EVLWI y SVRI. Agregárselo sería un **segundo** campo guardado. → **POP-b**.

⚠️ **LA RVS DE LA CÁPSULA SÍ LEE EL DUEÑO ÚNICO; LA DE `popPatron` NO.** Medido: con sólo la
línea arterial cargada, la cápsula de Hemodinámica pasa de «—» a **1009** y el módulo del
posoperatorio no publica ninguna; y con la línea arterial **y** una PAM tipeada de 95, la cápsula
dice 1009 y `popPatron` dice **1574**. La tercera rama de `popPatron` sigue leyendo
`v('hemo_pam')` directo, que es el pendiente que la tanda C1 ya declaró. **No se tocó** —cambiar
la RVS del módulo mueve su hoja del PDF—. → **POP-c**.

---

## 4 · El dibujo

| Pieza | Nodo | Marca |
|---|---|---|
| Impella, con su hélice | `n.impG` · `n.prop` · `n.impT` | `data-pop-esq="impella"` / `"helice"` |
| ECMO venovenoso | `n.ecmoVV` · `n.ecmoVVT` | `"ecmovv"` |
| ECMO venoarterial (ya estaba) | `n.ecmo` · `n.ecmoT` | `"ecmova"` |
| Balón (ya estaba) | `n.balon` · `n.balonT` | `"balon"` |
| El rótulo del timing | `n.augT` | `"timing"` |
| Derrame pleural (ya estaba) | `n.plR` · `n.plL` | `"pleuraD"` / `"pleuraI"` |
| Líneas B (ya estaban) | `n.bl` | `"lineaB"` |
| El radio del balón por fase | **`popEsqBalonRx(fase)`** | — |

⚠️ **LA PREMISA DEL PEDIDO ERA FALSA, Y ESTÁ MEDIDA.** El esquema **no** «sólo reaccionaba a la
asistencia mecánica»: el derrame pleural y las líneas B están cableados desde la G2. Lo que
faltaba son los **dos dispositivos** que `popEsqTexto` ya nombraba en el equivalente en texto y
que el dibujo no tenía.

Las marcas `data-pop-esq` existen para que una sonda pueda preguntar por un nodo **por su
nombre** y no por su posición entre los setenta hijos del SVG.

### El balón se infla en la diástole, y se puede comprobar

`popEsqBalonRx(fase)` es el dueño único de esa curva, y salió del bucle **para poder
comprobarla sin atrapar un cuadro de animación**. La sístole del dibujo es la fase 0 a 0,35 —la
misma partición del latido de las cavidades—. Medido por los dos caminos:

| fase | 0 | 0,1 | 0,2 | 0,34 | 0,40 | 0,45 | 0,6 | 0,89 | 0,95 | 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| radio | 2 | 2 | 2 | 2 | 6,5 | **11** | **11** | **11** | 6,5 | 2 |

Y sobre el atributo del nodo vivo: mínimo 2, máximo 11, **22 valores distintos** en 80 cuadros.
Con «reducir movimiento», la hélice queda en 0 grados y `_popEsq.rafId` en 0.

### El selector de timing NO es un campo del estudio

`#pop-bcia-timing`, con **guion medio**, y el prefijo `pop-bcia-` entra en las **dos** listas
paralelas: `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`. Es la convención de `hfpep-`,
`vauto-`, `vabchk-`, `vab-anim-`, `otr-asia-` y `ref-`.

**El precio, declarado: el timing no sobrevive a cerrar y reabrir el estudio**, y no llega a
ninguna superficie firmada. Es coherente con «el dibujo es sólo de pantalla», y hacerlo
persistente exige autorizar un segundo campo guardado. → **POP-d**.

### El texto accesible

El `aria-label` del SVG era **fijo** —describía las piezas del dibujo— y hoy dice dónde está el
paciente: el patrón, el índice cardíaco, la presión arterial media y el soporte en curso. El
detalle completo sigue fila por fila en `#pop-esq-txt`, que es lo que `popEsqTexto` arma.

---

## 5 · La conclusión: señales sueltas y un rótulo que no niega el número

### El defecto que el médico midió

Con índice cardíaco **1,57**, presión arterial media 58 y TAPSE 12, la conclusión decía «Sin
patrón de bajo gasto ni vasoplejia por los datos cargados» **ocho renglones debajo** de «IC 1.57 —
bajo». La causa: los cuatro patrones exigen **combinaciones** —bajo gasto MÁS una presión capilar
fuera de rango MÁS una resistencia, o bajo gasto MÁS las dos del VD— y un paciente con el gasto
bajo y todo lo demás en rango no cae en ninguna. **«Ninguno de los cuatro patrones» no es «sin
bajo gasto».**

### Los tres rótulos

| cuándo | `k` | rótulo |
|---|---|---|
| gasto bajo y ningún patrón | `bajo_sin_patron` | «Índice cardíaco bajo, sin un patrón que lo explique con los datos cargados» |
| gasto no bajo y hay señales | `sin_patron_senales` | «Sin patrón de bajo gasto por el índice cardíaco, con señales de alarma» |
| gasto no bajo y sin señales | `sin_patron` | el de siempre |

El vocabulario sigue siendo **cerrado**: el motivo y las señales van aparte, nunca dentro del
rótulo, porque el Laboratorio agrupa su distribución por ese texto.

### Las cuatro señales

| `k` | condición | qué dice |
|---|---|---|
| `soporte` | gasto no bajo **y** hay drogas o asistencia | «puede depender de las drogas o del dispositivo», y las nombra |
| `lactato` | gasto no bajo **y** lactato > 2 | dice el valor |
| `pcp` | gasto no bajo **y** PCP > corte de congestión | «congestión pulmonar» |
| `pcp_vd` | PCP > corte **y** TAPSE bajo | «falla cardíaca aunque el gasto sea normal» |

Las tres primeras exigen el gasto **por encima** del corte: son justamente las que avisan de que
un gasto aparentemente adecuado puede no serlo. La cuarta no, porque una presión capilar alta con
el TAPSE bajo es falla cardíaca con el gasto donde esté.

### Los cortes, y quién es su dueño

| corte | dueño | valor | operador |
|---|---|---|---|
| índice cardíaco bajo | `_icBanda` | 2,2 | `<=` — **el 2,2 exacto es BAJO** |
| congestión | `UMBRAL_PCP_HUMEDO` | 18 | `>` |
| piso de precarga | `POP_PCP_PRECARGA_MIN` | 12 | `<` · **criterio propio, sin fuente** |
| lactato | `POP_LACTATO_ALTO` | 2 | `>` estricto |
| TAPSE | `UMBRAL_TAPSE_NORMAL` | 17 | `<` |
| VD/VI | `TEP_VDVI_DILAT_MIN` vía `tepVdViDilatado` | 0,9 | `>` estricto |

⚠️ **EL 12 Y EL 18 ESTABAN ESCRITOS A MANO, CUATRO VECES CADA UNO.** El 18 coincide en el número
con `UMBRAL_PCP_HUMEDO` —el corte de congestión que el Forrester, la cápsula «Perfil
hemodinámico» y el diagrama del Laboratorio ya leen— y era una **segunda copia**. Hoy los dos
salen de una constante. **Ningún número cambió.**

### El aviso de la pregunta del gasto va en su propio campo

`q.aviso`, no dentro de `q.r`. `q.r` lo imprimía la diapositiva del PPT, que es una superficie
firmada, y el commit 5 es sólo de pantalla. **Medido**: con el aviso dentro de `r`, el A/B del
commit 5 mostraba una diferencia más.

### La app NO asigna etapas SCAI

Decisión del médico del 28/10/2026, y vale también acá: se muestran señales sueltas con su valor
—lactato, presión media, índice cardíaco, fármacos y dispositivos en curso— y nunca una letra A a
E ni la palabra «shock cardiogénico» como etiqueta calculada. El segundo documento del corte de
lactato usa ese mismo número para definir el **estadio C**, que es justo lo que acá no se publica.

---

## 6 · El papel

Inventario **medido** de lo que publica cada superficie, antes de tocar nada:

| superficie | qué lleva | el patrón y las cinco preguntas |
|---|---|---|
| cuerpo del informe narrativo | nada del POP | nunca estuvieron |
| EN SUMA | `popSumaLinea()` | fuera desde la G4 |
| hoja PostCEC del PDF | `amiloTextoPOP()` | fuera desde la G4 |
| **PPT del paciente** | la rama `integrado('pop')` | **estaban — y salieron en esta tanda** |
| Laboratorio | `_labPopResumen` | del TEXTO integrado de estudios guardados **antes** de la G4 |
| Excel | nada | — |
| pantalla | todo | **se quedan acá** |

Se retira **sólo del PPT**: 35 textos → 29. Con `_sem`, el traductor de banda a glifo, que era su
único uso en todo el archivo.

⚠️ **EL LABORATORIO NO SE TOCA**, que es lo que la orden manda hacer si el patrón sale ahí: su
fuente son estudios ya guardados y no se migra nada.

**El lactato ya era opcional y lo sigue siendo**: con el campo vacío el renglón no aparece.

**El bloque integrado anda, verificado y no reescrito** (`scripts/_probe_popint.mjs`): integrar
escribe `am-txt-pop`, editar marca `am-editados`, el texto editado sobrevive a un recálculo, la
tarjeta avisa en ámbar y `generarPDF` pregunta antes de salir nombrando el bloque.

---

## 7 · El caso de prueba

**TC-548**, con 82 condiciones en nueve grupos: (D) siete denominadores, (A) el orden y el
desplegable, (B) la dosis, (C) la PAM, (E) el dibujo, (F) los bordes y las señales, (G) el caso
del médico, (H) qué publica cada superficie e (I) el escenario sin posoperatorio.

**Sabe fallar por los dos caminos:** contra HEAD en un worktree, **51 condiciones en rojo y
NINGUNA por excepción**; y por mutación dirigida, **14/14 muertas** (`scripts/_mut_pop.py`), en
1 min 26 s.

⚠️ **LAS ESCENAS DE BORDE SE ARMAN CON LA SUPERFICIE CORPORAL REAL.** `getBSA()` con peso 70 y
talla 170 da **1,818118685772619**, no 1,8277: con la superficie supuesta, la escena del «2,2
exacto» daba **2,212** —del lado normal— y el borde no se probaba. Es la trampa que la tanda C2
documenta con «las escenas de borde no caen en el borde».

⚠️ **EL MARCADOR DE LA DOSIS A MANO ES «Dosis cargada a mano», NO «a mano» A SECAS.** La línea
automática termina con «podés escribir otra dosis a mano», así que buscar «a mano» da positivo en
las dos y dos condiciones salían rojas con la dosis correcta. Lo cazó el propio caso.

⚠️ **LA 13 ROMPE LAS DOS LISTAS A LA VEZ.** `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO` son
dos expresiones paralelas, y una mutación que rompa una sola la tapa la otra: es la lección que el
D-11 dejó escrita. El arnés acepta una **lista de pares** por entrada para eso.

---

## 8 · Trampas de instrumentación que esta tanda pagó

1. **`#login-overlay` es `position:fixed` y tapa la página entera.** Sin descartarlo,
   `elementFromPoint` devuelve el overlay en los cinco puntos y **cada** globo informa 0 de 5 —un
   cero que se lee igual que «el botón no se puede tocar»—. Medido en HEAD: `pul-balik` daba 0 de
   5 y su área real es 44×44.
2. **Un `<text>` de SVG no se recorta por su `scrollWidth`.** El SVG escala con su caja, así que
   su texto se hace más chico y no se corta; lo único que lo recorta es salirse del `viewBox`. La
   sonda daba **cuatro falsos positivos** por eso.
3. **Una casilla se persiste como `<id>__chk`, no como `<id>`.** El arnés de A/B heredado
   construía su estudio sintético sin esa clave, así que `generarPPT` —que carga el estudio en el
   formulario— reponía **todas** las casillas apagadas: la franja de drogas decía «sin infusión
   activa» sobre una escena con la noradrenalina marcada, en los **dos** árboles. Es un
   denominador envenenado, no un defecto de la app. **Viene de `_probe_r2ab.mjs`: las sondas de
   las tandas R2, A, B, C1 y C2 tienen el mismo defecto** y midieron su PPT con todas las casillas
   apagadas. → **POP-g**.
4. **El recorte de 1200 caracteres de las tablas del PPT no alcanza.** La franja de drogas cae
   dentro de la tabla de contexto y la dosis quedaba cortada.
5. **El acento grave dentro de un comentario del cuerpo de un caso** cierra el template. Y
   **`check_backticks.py` no distingue el cuerpo del caso del comentario de bloque que lo
   precede**: una limpieza que borre «todos los acentos graves del bloque» se lleva los del
   comentario de documentación del caso siguiente, que son legítimos. Costó restaurar TC-534
   entero desde git.
6. **El recuadro del monitoreo mide 0 sin dispositivo elegido.** Medir «no scrollea» con
   `pop_monitor` vacío es un verde sobre un elemento con `display:none`.
7. **La escena `swan` no llega a ninguna rama de vasoplejia** —su IC es bajo—, así que medir el
   globo nuevo sobre ella daba «no está» sobre un denominador de cero.
8. **Un `for` sobre un glob con `node` adentro se corta en el primer lote** si no se le redirige
   `stdin` desde `/dev/null`.

---

## 9 · Dónde está lo demás

- El mapa base del módulo: **`docs/mapa/g-posoperatorio.md`**
- El dueño único de la PAM y el barrido de espejos: `docs/mapa/b-espejos-pam.md`
- El Forrester, la RVS y `UMBRAL_PCP_HUMEDO`: `docs/mapa/c1-hemodinamica.md` y
  `docs/mapa/c2-pulmon-constriccion-forrester.md`
- Los cortes del VD: `docs/mapa/tep-aha2026.md`
- Las fuentes del corte de lactato, transcritas: `docs/fuentes/FUENTES.md` → «La tanda POP-V2»
- La ficha del caso: este mismo archivo, § 7
- Lo que quedó sin hacer: `docs/PENDIENTES.md` → **POP-a** a **POP-h**
