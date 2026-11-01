# La pantalla del posoperatorio — tanda POP-A (2026-11-01)

Mapa de la pestaña **POP Cirugía Cardíaca**, que vive en `#tab-hemodinamica` (no en una pestaña
propia: es el primer dato que hay que saber). Está por **nombre de función y de constante**, no
por línea.

Lo anterior a esta tanda está en `g-posoperatorio.md` (la tanda G, que creó el módulo) y en
`pop-v2-posoperatorio.md` (la POP-V2, que lo reordenó en una columna). **Esta tanda cambia la
PANTALLA y sus datos; el DIBUJO del esquema no se tocó** — eso es la tanda POP-B.

---

## 1 · El reparto: tres columnas independientes

`.pop-cols` es la fila y `.pop-col` **cada** columna, un contenedor flex vertical propio. Eso es
lo que hace que una tarjeta que crece empuje sólo lo que tiene **debajo en su columna**.

| columna | tarjetas (`data-pop`) |
|---|---|
| 1 | `pop-ctx` (Contexto quirúrgico) · `pop-mon` (Monitoreo) |
| 2 | `pop-farm` (Fármacos vasoactivos) · `pop-hemo` (Datos hemodinámicos) |
| 3 | `pop-asist` (Asistencia circulatoria) · `pop-pocus` (Eco y POCUS) |
| debajo (`.pop-abajo`) | `pop-esq` (el dibujo) a la izquierda · `pop-carac` + `pop-concl` a la derecha |

⚠️ **No es un grid de seis items en tres columnas, y la diferencia es el pedido.** Con los items
sueltos en un grid, las filas se alinean y la más alta estira a sus dos vecinas. Con un
contenedor flex por columna, no.

El corte va **sobre la ventana** y en **900 px**, que es la regla fija de `CLAUDE.md`. Por debajo
quedan apiladas en el **orden del marcado**, que es el que pidió el médico y también el de
tabulación y el de un lector de pantalla:
`pop-ctx, pop-mon, pop-farm, pop-hemo, pop-asist, pop-pocus, pop-esq, pop-carac, pop-concl`.

⚠️ **El reparto NO se hace con `grid-template-areas`.** Eso es justo lo que la POP-V2 retiró, por
separar el orden visual del de lectura.

**Alto de las tarjetas, medido** (Chrome, con el desplegable de fármacos abierto):

| | 1440 px | 1000 px |
|---|---|---|
| la pila de UNA columna (antes de esta tanda) | 2096 px | 2857 px |
| la columna más alta (hoy) | 957 px | 1078 px |

---

## 2 · El monitoreo: una tarjeta fija, no un acordeón

`popMonSync()` es lo único que queda del acordeón de la G1. Gobierna **dos** cosas, y ninguna
estaba en `popHemoSync`:

- `#pop_pai_wrap` — la PAM por línea arterial, con `pop_monitor === 'pai'`;
- `#pop_mon_vacio` — la línea breve de «sin dispositivo», con cualquier otro valor que no sea
  `swan`, `picco` o `pai`.

La visibilidad de los **dos recuadros** (`#pop_sw_wrap`, `#pop_picco_wrap`) la sigue poniendo
`popHemoSync` con su propio `vis`, igual que siempre. **Dos mecanismos para el mismo trabajo es
lo que hace que una mutación sobreviva.**

⚠️ **Lo que se retiró y no vuelve:** `pop_mon_acc`, `pop_mon_sum`, `pop_mon_arrow`,
`pop_mon_lbl`, `pop_mon_body`, `pop_mon_slot`, `popMonToggle`, `_popMonPintar`,
`_popMonAbierto`, `_popMonVisto` y las cinco clases `.pop-mon-*` con sus dos reglas de medios.
La reserva de hueco existía para que plegar no recolocara las tarjetas vecinas en una maqueta de
dos dimensiones; hoy no hay nada que plegar y la independencia la da `.pop-col`.

### El Swan en tres columnas y el PiCCO en dos

`.pop-mon-3` con tres `.pop-mon-c`:

| columna | campos |
|---|---|
| 1 | `pop_sw_fc`, `pop_sw_gc` |
| 2 | `pop_sw_pam` (con `#pop-pam-aviso`), `pop_sw_pad`, `pop_sw_pcp` |
| 3 | `pop_sw_paps`, **`pop-sw-papm`** (derivado), `pop_sw_papd` |

El `.grid-3` de flujo por filas daba **«gc+pad+paps | fc+papd | pam+pcp»**, medido: tres columnas
que no agrupaban nada.

⚠️ **`pop-sw-papm` NO es un campo.** Es `(PSAP + 2 × PDAP) / 3`, la **misma** cuenta que
`popHemoSync` ya hacía para la resistencia pulmonar, publicada en un `<div>`: no es `input`,
`select` ni `textarea`, así que ningún recolector la toma y **no hubo que tocar ninguna lista
paralela**. Su dueño es `popHemoSync`, y se calcula en una rama propia porque la de la
resistencia exige además la PCP y el gasto.

El PiCCO pasa a `.grid-2`: cinco campos en un `.grid-3` dejaban la tercera celda de la última
fila vacía.

### Los rótulos de ESTA pestaña

`PAD <small>(PVC)</small> (mmHg)` · `PSAP (mmHg)` · `PDAP (mmHg)` · `PmAP (mmHg)` (y el `PmAP`
de la fila de la resistencia). **Ningún rótulo de otra pestaña se tocó**: la «PAP media
estimada» de VD/AD y el cociente «TAPSE/PAPs» de la tabla de HTP siguen como estaban, y TC-577
(G1) y (G2) lo fijan. Unificarlos en toda la app es otra tanda → `PENDIENTES.md` **PA-f**.

---

## 3 · El selector único de fármacos

| pieza | qué es |
|---|---|
| `#pop_farm_sel` | el envoltorio `position:relative` |
| `#pop_farm_btn` | el botón «Elegir fármaco», con su `aria-expanded` |
| `#pop_farm_menu` | el panel, `position:absolute` con `z-index:30`, `max-height:232px` y `overflow-y:auto` |
| `#pop_farm_rows` | las filas de los fármacos marcados |
| `popFarmMenu(on)` | abre y cierra; `_popFarmAbierto` es estado de pantalla y no se persiste |
| `popFarmSacar(k)` | la ✕: desmarca y llama a `popSync`, que es **el único que borra** |

**El orden de la lista y sus tres separadores** salen del pedido del médico:
`nor | adr, dob, dop, mil, levo | vaso, ter, azul | ntg, ntp`.

⚠️ **El panel es absoluto, y eso es el pedido, no estética.** Medido: al abrirlo las tres
tarjetas vecinas y la fila de dosis no mueven un píxel, el alto del cuerpo queda igual, y el
panel **se superpone** con la tarjeta de abajo — que es la prueba de que flota.

Se cierra al tocar afuera y con Esc, con **dos oyentes de DOCUMENTO** que salen temprano si está
cerrado. Uno por nodo serían once oyentes para cerrar un panel. El del clic va en **fase de
captura** para que el `onclick` del propio botón no se pierda.

⚠️ **Las casillas son las mismas** (`pop_<k>_activa` con su `onchange="popSync()"`). Lo que
cambió es **dónde están**. El punto de estado sigue funcionando porque la casilla y el punto
siguen siendo hermanos dentro del mismo `<label>`.

⚠️ **Los `<label>` de los diez de siempre siguen SIN `for`, a propósito.** La diapositiva del PPT
busca `label[for="pop_<k>_activa"]` y no lo encuentra, así que imprime la **clave** de la droga
(`nor 0.25`) — defecto **preexistente**, POP-h. Agregárselo a los diez cambiaría el papel firmado
de diez fármacos. El azul de metileno **sí** lo lleva, porque es nuevo y no hay papel viejo que
mover.

### El azul de metileno: tres cosas que no tiene

| constante | qué hace |
|---|---|
| `POP_DROGAS_SIN_UNIDAD = ['azul']` | su dosis no lleva unidad en ninguna superficie, y la línea de la dilución no publica un «≈ N mcg/kg/min» que sería inventado |
| `POP_DROGAS_PESO` | lo **excluye** → no escribe su dosis sola |
| `POP_DROGAS_PATRON` | lo **excluye** → no entra al patrón hemodinámico ni al dibujo |
| `POP_DOSIS_UNID = { azul: '' }` + `popDosisUnid(k)` | la unidad con que el **papel** publica la dosis, por fármaco; por omisión `mcg/kg/min`, que es lo que los diez de siempre ya decían |

⚠️ **`POP_DROGAS` lo lleva al FINAL y no en su lugar del menú**, a propósito: el orden de ese
array es el orden con que el informe y la hoja del PDF enumeran los vasoactivos. La posición en
el menú la decide el **marcado**, que es donde el médico la ve.

Su uso hemodinámico espera la guía EACTS 2024 → `PENDIENTES.md` **PA-a** y **PA-b**.

---

## 4 · Datos hemodinámicos: un dato, dos puertas

`POP_ESPEJOS` es el registro: espejo → dueño.

| espejo (no se guarda) | dueño (el campo que viaja) | dónde vive el dueño |
|---|---|---|
| `pop-esp-fc` | `hemo_fc` | Hemodinámica |
| `pop-esp-pas` | `ao_pas` | Doppler aórtico |
| `pop-esp-pam` | `hemo_pam` | Hemodinámica |
| `pop-esp-pad` | `ao_pad` | Doppler aórtico |

- **`popDatoGesto(id)`** corre desde el `oninput` del espejo —o sea un **gesto humano**— y
  escribe el campo del dueño, **el vacío incluido**. Despacha `input` y `change` en el dueño para
  que su propia cadena corra igual que si el médico hubiera tipeado allá.
- **`popDatosSync()`** sólo **LEE** al dueño y lo copia al espejo. Nunca escribe el estudio.

⚠️ **Con una sola función que hiciera las dos cosas, borrar no se podría**: el barrido de 220 ms
repoblaría el espejo con el valor viejo. Es el defecto que el D-9, el D-10 y el D-11 pagaron tres
veces, y la lección que quedó es «el campo del estudio es el dueño, y gana la última edición».

⚠️ **No hace falta una entrada nueva en `ESPEJOS_VIVOS` ni en `RECALC_MODULOS`**: la llama
`popHemoSync`, que ya está en las dos —y en el final de `limpiarCampos`, por `popSync`—.

**La compuerta por dispositivo** (`popDatosSync`): con `swan` desaparecen las puertas de **FC** y
**PAM** —el catéter tiene sus propios `pop_sw_fc` y `pop_sw_pam`, que son **otro** dato y pueden
diferir, como su propio comentario declara—; con `pai`, la de **PAM**; con `picco`, ninguna. Lo
que se esconde es la **puerta**, no el valor.

**Campos nuevos de este bloque:** `pop_relleno_cap` (s) y `pop_diuresis` (ml/h). Los dos se
**describen** en el informe y en la hoja del PDF y **no entran a ningún algoritmo**: sin banda,
sin «prolongado», sin «oligúrico» y sin corte, porque ninguna fuente de este módulo publica uno
aplicable → `PENDIENTES.md` **PA-c**. El `pop_lactato` ya era así desde la G1.

---

## 5 · Contexto quirúrgico: cirugías combinables

| pieza | qué hace |
|---|---|
| `POP_CX_CHK` | las cuatro casillas: `[id, token, descriptor]` |
| `POP_CX_LEGADO` | el token viejo → la casilla que le corresponde |
| `popCxEstado()` | **el dueño único**: `{tokens, txt, txtBajo, legado}`. No escribe nada |
| `popCxGesto()` | el `onchange` de una casilla; escribe `pop_cx_tipo` |
| `popCxSync()` | pinta la marca heredada, su etiqueta y la fila de válvulas |

`txt` es la forma **capitalizada** (para una línea que empieza: «Revascularización y valvular») y
`txtBajo` la de **medio de frase** (el EN SUMA). Sin ninguna casilla marcada, las dos caen al
rótulo del `<option>` de `pop_cx_tipo` —«CABG», «Valvular»—, que es exactamente lo que el módulo
publicaba antes de esta tanda.

⚠️ **`pop_cx_tipo` sigue en el marcado, oculto, y no es deuda.** Lo leen **cuatro** consumidores:
el panel de Evidencia (`_indS`), la diapositiva del PPT (`_pptSpan`), el Laboratorio
(`_labCampoRaw`) y el round-trip del propio estudio. Lo escribe **sólo** el gesto de una casilla.

⚠️ **UN ESTUDIO VIEJO SE LEE Y NO SE REESCRIBE.** Sin casillas marcadas y con el campo cargado,
la casilla que le corresponde se muestra con la **marca heredada** —la clase `.pop-cx-her`, que
dibuja un tilde tenue encima de la caja con un `::before`— y al lado se dice de dónde sale. Su
propiedad `checked` **no se toca**: si se tocara, guardar le agregaría una clave `__chk` que el
estudio no tenía. «Combinada» no se puede descomponer: no marca ninguna y la etiqueta lo dice.

⚠️ **LA CASILLA «OTRA» NO TIENE TOKEN, Y ES UNA PARADA MEDIDA.** `_pptSpan` lee `e.textContent`,
y en un `<select>` eso es la **lista entera** de opciones: la celda «Tipo de cirugía» de la
diapositiva publica hoy las ocho, sea cual sea el valor —defecto preexistente—. Agregarle una
novena cambiaba esa celda en **toda** escena integrada. El informe, el EN SUMA y la hoja del PDF
igual publican «Otra», porque leen `popCxEstado()`. Lo que pierde es el histograma del
Laboratorio y el bloque «Según la cirugía, también mirar…» → **PA-d**.

### Las cuatro válvulas operadas y su tipo

`POP_CX_V` es el registro: espejo → `{due, chk}`.

| espejo (no se guarda) | dueño | casilla |
|---|---|---|
| `pop-esp-vao` | `va_morf` | `pop_cx_v_ao` |
| `pop-esp-vmi` | `vm_morf` | `pop_cx_v_mi` |
| `pop-esp-vtr` | `vt_morf` | `pop_cx_v_tr` |
| `pop-esp-vpu` | `vp_morf` | `pop_cx_v_pu` |

`popCxVOpciones()` **clona** las opciones del selector dueño una sola vez, más una
«— elegir tipo —» vacía al principio. Transcribirlas a mano deja dos listas que se
desincronizan el día que Válvulas agregue una etiología, y el pedido dice «SOLO las opciones que
hoy existen en Válvulas para esa válvula». Medido: 9+1, 9+1, 8+1 y 7+1.

⚠️ **Marcar una válvula no escribe ningún tipo**: `popCxVGesto` sale temprano con el selector en
la opción vacía. Una prótesis mecánica por omisión sería una afirmación clínica inventada.

⚠️ **«de Válvulas»** aparece cuando el dueño vale algo **distinto de su primera opción**. Esas
listas no tienen opción vacía —su default es «Normal» o «Trivalva normal»—, y «normal» no es un
tipo de válvula operada. La etiqueta se repinta **en el gesto** y no se espera al barrido.

### Los drenajes

`POP_DRENAJES` (`pop_dren_pd`, `pop_dren_pi`, `pop_dren_med`) y `popDrenajesTxt()`.
`.pop-dren-fila` es un grid de **tres pistas `minmax(0,1fr)`** y no un flex: con flex, a 1000 px
«Mediastino» bajaba de renglón —medido: 1194, 1194 y **1242**—. Lo que cede es el rótulo, que se
parte en dos líneas dentro de su celda: partirse no es recortarse.

---

## 6 · Eco y POCUS

Una sola tarjeta (`pop-pocus`, título «🔎 Eco y POCUS») con, en este orden:

1. el **recuadro gris del eco** (`pop-eco-src`, `pop-eco-gc`, `pop-eco-ic`), mudado de
   «Datos hemodinámicos» sin cambiar un id: lo sigue escribiendo `popHemoSync`;
2. el **ventrículo derecho** (`pop-pocus-vd`) con su conclusión;
3. **pericardio, pleura y pulmón** en grillas de **dos** columnas (eran de tres: en una columna
   de 404 px eso daba pistas de 128 px).

La **concordancia Swan contra eco** (`pop-comp-wrap`) se queda en «Datos hemodinámicos», porque
compara el gasto del **catéter** con el del eco.

⚠️ **Y UNA REGLA DE 1100 px QUE DEJÓ DE TENER SENTIDO, QUE LA ENCONTRÓ UN CASO DE PRUEBA.**
`.pop-pocus-grid` —la subgrilla que envuelve todo el contenido de esta tarjeta— se partía en dos
columnas desde 1100 px (POP-V2), lo que con la tarjeta a **ancho completo** daba dos de ~600 px.
Con las tres columnas del POP-A la tarjeta mide ~404, y medido a 1440 px esa regla la partía en
dos de **182 px** —y en **128** a 1100—, o sea las filas del recuadro del eco y de la conclusión
del VD dentro de 182 px. El pedido dice «el recuadro del eco, el VD con su conclusión, y **DEBAJO**
pericardio, pleura y pulmón en una grilla compacta de dos columnas»: las dos columnas son las de
los **selectores**, y la tarjeta se lee de arriba hacia abajo. Hoy la subgrilla es **una** columna
a cualquier ancho. Su `.pop-pocus-grid .grid-3` con piso de 170 px se fue con ella: esta tanda
pasó sus dos grillas a `.grid-2` y no quedaba un nodo que la usara, verificado por grep del
marcado.

⚠️ **«La conclusión del VD al lado, no lejos a la derecha» lo resolvió el reparto en tres
columnas**, y está medido: el hueco entre el rótulo «Conclusión» y su valor es de **0 px** a
1440, 1000 y 390 px, porque la tarjeta pasó de 1232 a ~404 px de ancho. A 768 px es de 254,
porque ahí la maqueta está apilada y la tarjeta se lleva el ancho entero —como cada `calc-row` de
la casa—.

### El derrame pericárdico: segunda puerta

`pop-esp-peri` → `#pericardio`, con `popPeriOpciones()`, `popPeriGesto()` y `popPeriSync()`.
Las opciones se clonan del dueño y **no hay opción vacía**, porque el dueño no la tiene: su
primera opción es «Normal, sin derrame», que es una respuesta. Lo llama `popPocusSync`, que ya
está en `ESPEJOS_VIVOS`.

### ⚠️ Pleura y pulmón NO se unificaron, y hay SEIS contradicciones medidas

| | el posoperatorio | el módulo «Pericardio y pulmón» |
|---|---|---|
| grado del derrame pleural | **por lado**: `pop_pleura_der`, `pop_pleura_izq` — Leve <1 cm / Moderado 1-3 / Severo >3 / Ausente | **uno solo**: `pul_derrame_tam` — Mínimo / Moderado / Severo, **sin cifra** |
| lado | implícito en los dos campos | `pua_derrame_lado` — Unilateral derecho / izquierdo / Bilateral |
| característica | `pop_pleura_caract` — Libre / Loculado / **Hemotórax** | `pua_derrame_tipo` — Libre / **Tabicado** |
| líneas B | `pop_pulmon_lineasb` — Ausentes / Focales / Difusas bilaterales | **seis casillas por zona**: `pua_z_ant_d` … `pua_z_bas_i` |
| consolidación | `pop_pulmon_consol` — Ausente / Derecha / Izquierda / Bilateral | `pua_consol` — No / Sí, más broncograma y una nota |
| neumotórax | `pop_pulmon_neumo` — Ausente / Sospecha / Presente | **criterio de dos signos**: `pua_desliz` (Presente/Reducido/Abolido) + `pua_punto` (Presente/Ausente) |

«Derecho severo + izquierdo leve» no se puede decir allá, y «bilateral moderado» no dice qué lado
acá. Traducir cualquiera de las seis en una dirección **inventa un dato o lo pierde**, y eso es
contenido clínico. Los seis selectores del posoperatorio conservan sus ids y sus opciones
—medido: 5,5,4,4,5,4— → `PENDIENTES.md` **PA-e**. TC-581 (D) lo fija.

**El pericardio, en cambio, tiene UN solo dueño** (`#pericardio`, cinco opciones), así que ahí no
hubo contradicción y la unificación sí se hizo.

---

## 7 · La disposición de abajo

`.pop-abajo` reparte en **dos mitades iguales** desde 900 px: el dibujo a la izquierda y, a la
derecha, una `.pop-col` con `pop-carac` («📋 Características del esquema», que es el **mismo**
`#pop-esq-txt` escrito por el mismo dueño `popEsqTexto`) y `pop-concl` debajo. `#pop_integrar`
va debajo de todo. Por debajo de 900 px, apilado.

Se retiró `.pop-esq-par`, que ponía el dibujo y su texto lado a lado **dentro** de la tarjeta del
esquema desde 1100 px.

⚠️ **EL DIBUJO QUEDA IDÉNTICO, Y ESTÁ VERIFICADO NODO POR NODO.** Con la misma escena cargada y
la animación **parada** antes de fotografiar, en los cuatro anchos: **77 nodos** antes y después,
la **firma** del SVG —cada nodo con su etiqueta y sus atributos ordenados— idéntica, `viewBox`
«0 0 600 496» idéntico, `aria-label` idéntico, el texto del esquema y la conclusión idénticos.
Las coordenadas de adentro son del espacio del `viewBox`, así que no dependen del ancho del
contenedor: el SVG ya escalaba con su caja (`width:100%` + `height:auto`). **No se tocó una línea
de `popEsqPintar`.** Lo mide `scripts/_probe_pa_c6.mjs --head <arbol>`.

---

## 8 · Lo que el papel publica

| superficie | dónde se arma | qué ganó en esta tanda |
|---|---|---|
| informe narrativo y hoja del PDF | `amiloTextoPOP()` | «Tipo de cirugía» desde `popCxEstado().txt`; «Válvulas operadas»; «Drenajes»; «Relleno capilar»; «Diuresis»; la dosis del azul **sin unidad** |
| EN SUMA | `popSumaLinea()` | la cirugía desde `popCxEstado().txtBajo` y el fragmento «— drenaje …» |
| diapositiva del PPT | el bloque `CTX` de `generarPPT` | nada: su celda de tipo de cirugía es `_pptSpan`, que publica la lista entera de opciones (POP-h) |
| dibujo del esquema | `popEsquema()` → `popEsqTexto()` / `popEsqPintar()` | nada: lee `POP_DROGAS_PATRON`, que excluye al azul |

**Ejemplos medidos** (A/B contra `47ff639`):

```
Vasoactivos | Noradrenalina 0.25 mcg/kg/min      →  … · Azul de metileno 1.5
Vasoactivos | ninguno activo                     →  Vasoactivos | Azul de metileno 2
Lactato | 3 mmol/L                               →  + Relleno capilar | 4 s · Diuresis | 20 ml/h
Tipo de cirugía | no consignado                  →  Tipo de cirugía | Revascularización y valvular
(nada)                                           →  Válvulas operadas | aórtica — Prótesis mecánica
(nada)                                           →  Drenajes | pleural derecho y mediastino
PostCEC — hora 6 h — IC 1.76 …                   →  PostCEC revascularización y valvular — hora 6 h — …
```

**Y el control negativo que más dice:** un estudio viejo con `pop_cx_tipo = 'valvular'` y ninguna
casilla marcada publica **«Tipo de cirugía | Valvular»** y **«PostCEC Valvular — hora 6 h — IC
1.76 L/min/m² — bajo gasto.»**, carácter por carácter como antes de esta tanda.

---

## 9 · Los dieciocho campos guardados nuevos

Censo **947 → 965**, cero perdidos, **Excel 441 → 441** columnas con las mismas claves
(`LAB_XLS_MAP` es una lista explícita y no tiene un solo `pop_`).

| lista autorizada | campos |
|---|---|
| (a) tipo de cirugía | `pop_cx_cabg`, `pop_cx_valv`, `pop_cx_aorta`, `pop_cx_otra` |
| (b) válvulas operadas | `pop_cx_v_ao`, `pop_cx_v_mi`, `pop_cx_v_tr`, `pop_cx_v_pu` |
| (c) drenajes | `pop_dren_pd`, `pop_dren_pi`, `pop_dren_med` |
| (d) azul de metileno | `pop_azul_activa`, `pop_azul_dosis`, `pop_azul_diluc_mg`, `pop_azul_diluc_ml`, `pop_azul_veloc` |
| (e) datos de la cama | `pop_relleno_cap`, `pop_diuresis` |

**Y los NUEVE que NO se guardan**, todos con prefijo `pop-esp-` (guión MEDIO), agregado a las
**dos** listas paralelas —`_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`—: `pop-esp-fc`,
`pop-esp-pas`, `pop-esp-pam`, `pop-esp-pad`, `pop-esp-vao`, `pop-esp-vmi`, `pop-esp-vtr`,
`pop-esp-vpu`, `pop-esp-peri`. Los nueve llevan `data-espejo` **sin valor**: es la declaración
estática que `cardAutoOpen` y `secAutoOpen` miran, y **no** la marca de runtime
`data-espejo="1"` que `limpiarCampos` borra — es la lección del D-11, que costó TC-514 en rojo.

`pop-sw-papm`, `pop_mon_vacio`, `pop_cx_legado`, `pop_dh_fc_wrap`, `pop_dh_pam_wrap`,
`pop_cx_valv_wrap`, `pop_cx_tipo_wrap`, `pop_<k>_fila` y `pop_farm_*` son `<div>`, `<button>` o
`<label>`: ningún recolector los toma y no hizo falta registrarlos.

---

## 10 · Las sondas de esta tanda

| sonda | qué mide |
|---|---|
| `_probe_pa_inv.mjs` | el inventario 1a: alto de cada tarjeta a 1440 y 1000, censo de campos de la sección y opciones de cada selector |
| `_probe_pa_farm.mjs` | el selector de fármacos y el azul de metileno, con el área táctil de la ✕ |
| `_probe_pa_c3.mjs` | asistencia, monitoreo y datos hemodinámicos en los cuatro anchos |
| `_probe_pa_c4.mjs` | contexto quirúrgico: legado, combinadas, válvulas y drenajes |
| `_probe_pa_c5.mjs` | la tarjeta de Eco y POCUS y el hueco de la conclusión del VD |
| `_probe_pa_c6.mjs` | la disposición de abajo y **el SVG comparado contra otro árbol, nodo por nodo** |
| `_probe_paab.mjs` + `_ab_padiff.mjs` | el A/B de superficies, calcado de `_probe_popab.mjs` |
| `_probe_pawk.mjs` | la de DOS MOTORES: Chrome y WebKit × cuatro anchos × dos temas, 25 claves por cruce, con `--head` como control |
| `_mut_pa.py` + `_mut_pa_azul.txt` + `_mut_pa_sep.txt` | las catorce mutaciones dirigidas; los dos `.txt` traen el marcado que la 03 mueve de lugar, para no tener dos copias de el |

Lo que quedó declarado y no arreglado está en `docs/PENDIENTES.md` → **PA-a** a **PA-i**.

⚠️ **Los nombres se censaron con `ls` antes de crearlos**, que es la regla: ya existían
`_probe_popab.mjs` (el A/B de la POP-V2) y `_probe_popanim.mjs`, así que esta tanda usa el prefijo
**`_probe_pa_`** para sus cinco sondas dedicadas, **`_probe_pawk.mjs`** para la de dos motores,
**`_probe_paab.mjs`** / **`_ab_padiff.mjs`** para el A/B y **`_mut_pa.py`** para las mutaciones.
Ninguno existía. Es la lección de AJUSTES-1 y AJUSTES-3, que sobrescribieron la sonda de otra
tanda con la misma sigla.

⚠️ **El suite corre Chrome SIN `--window-size`, o sea a 756 px, por debajo del corte de 900.** Por
eso los casos de prueba miden el reparto por la **REGLA de la hoja de estilos** y no por
geometría: la geometría lado a lado la miden las sondas. Está escrito en el encabezado de
TC-577.

⚠️ **Dos trampas que costaron una medición cada una:**
- `offsetParent !== null` y nada más para «¿se ve?»: con el `display` del **propio** nodo, un
  input dentro de un envoltorio oculto sale «visible» —su display es `block`— y la compuerta
  parece no funcionar.
- `document.body.innerText` **no ve** el texto de un nodo oculto, así que el control negativo de
  un rótulo de otra pestaña daba «SE FUE» sobre un rótulo que sigue ahí. Hay que preguntar por
  `textContent`.

---

## Lo que la tanda POP-B movió de esta pantalla (2026-11-01)

**Puntero.** El mapa de POP-B es `docs/mapa/popb-dibujo-posoperatorio.md`. Lo que de esta pantalla
dejó de ser cierto:

- **La tarjeta «Eco y POCUS» ya no lleva pleura ni pulmón.** Los seis selectores y sus dos cápsulas
  se mudaron a **`pop-pleupul`**, una tarjeta de ancho completo debajo de las tres columnas, en dos
  columnas desde 900 px. Ningún id cambió. La tarjeta pasó de **1115 a 534 px** y la columna 3 de
  **1228 a 647**.
- **Dentro de «Eco y POCUS», la ecocardiografía y el ventrículo derecho van uno al lado del otro**
  (`.pop-eco-par`, dos columnas desde 900 px), con el pericardio debajo a ancho de tarjeta.
- **El contador del desplegable de fármacos ya no suma la asistencia circulatoria**: cuenta
  `#pop_farm_rows .pop-droga.pop-droga-on`, o sea las filas visibles. Con noradrenalina, dopamina y
  balón decía «3 marcados» con dos filas, y lo decía igual en `47ff639`.
- **Los cuatro selectores de tipo de válvula operada ofrecen sólo las prótesis de su dueño**, no su
  lista entera: con una morfología nativa quedan en «— elegir tipo —» y una línea ámbar la nombra.
  Y **`popCxValvTxt` ya no publica una morfología nativa en el papel**.
- **El esquema ganó cuatro capas** —el nivel de líquido pleural, el puente, la malla y los tres
  drenajes— y **las cuatro válvulas operadas**, y sus rótulos bajaron de tamaño: ver el mapa de
  POP-B § 5.
