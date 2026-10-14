# Mapa — el BORRADO en Válvulas: las cuatro lesiones y sus seis reglas (2026-10-13)

> Mapa **nuevo**, a archivo propio y no una sección de `valvulas.md`, por la regla de
> `CLAUDE.md`: ese mapa está en 32,7 KB y el techo son ~35 KB. Acá viven el retiro del grado, la
> propiedad de las pastillas, la regla de método de la IM, la de continuidad de la IT y el grado
> de cada fila. Lo que **no** está acá —los botones, `SEV_SINC`, el escalón aórtico, `emCategoria`
> y las cascadas de severidad— sigue en `docs/mapa/valvulas.md`.

Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

> ⚠️ **LA OTRA MITAD DE ESTE MECANISMO ESTÁ EN `docs/mapa/valvulas-manual-binario.md`** (2026-10-13):
> acá se retira el GRADO, allá se limpia la MARCA de manual. Son dos cosas y por eso tienen dos
> dueños: `sevRetirarSugerido` sale por su guarda de manual (`{delMedico:true}`) y los seis apagados
> automáticos de abajo salen por su primera guarda —«la pastilla ya está apagada»—, así que ninguno
> de los dos tocaba la marca. El punto **B-3** de `docs/PENDIENTES.md` **sigue abierto**: con el dato
> cargado, reabrir la pastilla a mano no recupera el grado, y está medido idéntico a HEAD en 8 de 8.

---

## 1 · El retiro del grado — un solo dueño para las cuatro lesiones

`sevRetirarSugerido(clave)` — **dueño único**. Vive al lado de `_eaRetirarGradoSugerido` y de
`_iaRetirarGradoSugerido`, y éste último **delega en él** (sigue exportado porque lo llaman
caminos que no pasan por `calcIA_ESC`).

Cuatro guardas, en orden:

| # | Guarda | Por qué |
|---|---|---|
| 1 | clave registrada en `SEV_SINC` | de ahí salen el nodo, el `tipo` y el `trasEscribir`; no hay una segunda lista paralela |
| 2 | `esqSevManual[clave]` | un grado que el médico fijó NO se toca (regla 2) |
| 3 | `sel.value === sel.dataset.sugerido` | «¿este valor es el que escribí yo?». La marca **no se persiste** y `limpiarCampos` la borra, así que **un estudio archivado jamás coincide y su grado no se retira** |
| 4 | ya está en el centinela | idempotencia: no reescribe ni despacha |

El centinela sale de **`SEV_TOKEN_SIN`** (`'0'` insuficiencia, `'sin'` estenosis), que es el valor
de fábrica que las cuatro superficies ya leen como «no hay grado».

⚠️ **`trasEscribir` corre y DESPUÉS se borra la marca.** Las entradas del registro reponen
`dataset.sugerido = calc` ahí adentro —está escrito para R6, donde el valor nuevo sí es una
sugerencia—, así que borrarla antes la dejaría puesta con el centinela adentro.

### Quién pone la marca de dueño

| Lesión | Escritora del grado | Pone `dataset.sugerido` desde |
|---|---|---|
| IM | `autoCompletarSevIM` (la llama `calcIM_ESC`) | **2026-10-13** |
| IAo | `autoCompletarSevIA` | 2026-10-02 |
| EAo | `_eaMarcarSugerido` (cuatro escrituras de `ea_grado`) | 2026-10-02 |
| IT | `calcIT_ESC`, en línea | **2026-10-13** |

Las cuatro entran además a **`_MARCAS_DERIV`**, el respaldo de la ventana de reimpresión: sin eso
la marca se fuga en las dos direcciones (el comentario de esa zona lo documenta para `ia_grado`).

### Dónde se llama

| Lesión | Salida «nadie votó» |
|---|---|
| IM | `calcIM_ESC`, `if (params.length === 0)` — repinta `im-sev` a «—» **siempre** (antes sólo con prótesis) |
| IAo | `calcIA_ESC`, el mismo `if` — **sin** el gate `_iaFuera.length` que tenía, y repinta `ia-sev` |
| EAo | `clasificarEA_Vmax`, el **`else` de `if (R.grado)`** que no existía |
| IT | `calcIT_ESC`, el mismo `if` — era un `return` pelado |

⚠️ **`eaGradoCalculado` devuelve `grado: null` SÓLO cuando ninguno de los tres insumos está
cargado.** Con una Vmax por debajo de 2,0 devuelve `'sin'`, que es un token y es *truthy*.

---

## 2 · Las pastillas: quién las prendió

Dos `Set` vivos, no persistidos, leídos por `window` (se declaran ~30.000 líneas más abajo que
sus lectores): **`VALV_ESTEN_AUTO`** y **`VALV_INSUF_AUTO`**. `localStorage` **no** distingue el
auto-prendido del clic manual: los dos dejan la clave en `'1'`.

**Cuatro puertas prenden una pastilla, y las cuatro registran** (siempre **después** del toggle,
porque la cola de `toggleValvPill` borra la entrada):

| Puerta | Qué prende | Registra desde |
|---|---|---|
| `valvAutoPrenderEsten(valv)` | las cuatro estenosis, desde su calculador | 2026-10-04 |
| `_ipAutoPrender()` | la IP, por velocidad o por signos | 2026-10-08 |
| `_insufAutoPrender(valv)` | **IM, IAo e IT**, desde su calculador con al menos un votante | **2026-10-13** |
| `valvAutoAbrirCajones()` — la **regla J**, en cada `showTab('valvulas')` | cualquiera con grado graduable | **2026-10-13** |
| el bloque inline de `calcPSAP` por la Vmax del chorro de IT | la IT | **2026-10-13** |

⚠️ **La regla J era la puerta sin dueño más frecuente de todas**: basta entrar a Válvulas con un
grado escrito. Era el defecto que `docs/PENDIENTES.md` declaró para la aórtica en la tanda 6c
(«el código que la prende no registra dueño»).

**Cinco funciones de apagado y no una**, y la duplicación es deliberada —cada una gobierna otro
grupo de válvulas y tocar la genérica le cambia el informe firmado a las demás—:

| función | válvula(s) | llamada desde | borra clave | borra marca |
|---|---|---|---|---|
| `valvAutoApagarEsten(valv)` | genérica (ea/em/ep) | **nadie hoy** | no | no |
| `_etApagarAuto()` | estenosis tricuspídea | `_etAutoGrado` | sí | sí |
| `_epApagarAuto()` | estenosis pulmonar | `calcVP` | sí | sí |
| `_emApagarAuto()` | estenosis mitral | `calcEM` | sí | sí |
| `_eaApagarAuto()` | estenosis aórtica | `calcAo` | sí | sí |
| `_ipApagarAuto()` | insuficiencia pulmonar | `calcIP` | sí | sí |
| **`_insufApagarAuto(valv)`** | **IM, IAo, IT** | los tres calculadores, salida sin votos | sí | sí |

Guardas del apagado genérico: idempotencia · **no la prendió la app** · **sobrevivió un grado**
(se pregunta con `sevEsSin`, no con un literal) · **queda una CAUSA viva**.

**`_INSUF_CAUSAS`** — campos que afirman que hay insuficiencia aunque no graduen. Hoy sólo la
tricúspide tiene: `vmax_it` y `it_vmax_cw`, que son el **mismo** dato espejado y se leen los dos
porque un estudio guardado se repone con `.value =` sin eventos. Sin esa guarda, apagar la
pastilla con la Vmax cargada haría aparecer el aviso de `itIncongruenciaSync` **por obra de la
app**.

⚠️ **`_eaApagarAuto` estaba escrito desde el 2026-10-11 y estaba INERTE**: su segunda guarda pide
que el grado haya quedado en el centinela, y sin la rama negativa de `clasificarEA_Vmax` el grado
nunca volvía ahí al **borrar** — sólo al **corregir** la Vmax de 4,5 a 1,4.

⚠️ **Y el gate `valvula === 'pulmonar'` de la cola de `toggleValvPill` se fue.** Era correcto
mientras el Set lo leyera sólo `_ipApagarAuto`; con cuatro rutas leyéndolo, dejarlo habría hecho
que un clic del médico en esos tres botones no le quitara a la app la propiedad.

---

## 3 · La insuficiencia mitral: los dos métodos

`_imIntegrar(votos)` — **la regla de integración, dueño único**. Es la cascada que vivía dentro de
`calcIM_ESC`, extraída sin mover una condición para poder correrla dos veces:

```
severa >= 1                                  -> '4'  badge rojo    «Severa»
moderada >= 2                                -> '2'  badge naranja «Moderada»
leve >= 1 && moderada === 0 && severa === 0  -> '1'  badge verde   «Leve»
resto                                        -> '2'  badge amarillo «Moderada — evaluar integrado»
```

`_imPeorIntegrado(a, b)` compara por **`IM_GRADO_ORDEN`** y no por el string (`'4' > '2'` no se
cumple como texto). **Con empate manda el primero**, y los llamadores pasan PISA primero: es el
método por defecto y el de la casilla que no se puede destildar.

**Los votos llevan `grupo`:**

| grupo | parámetros | entra en |
|---|---|---|
| `comun` | vena contracta, ratio jet/AI, **onda S pulmonar** | los dos métodos |
| `pisa` | EROA, Vol-R y FR por PISA | el método PISA |
| `cont` | EROA, Vol-R y FR por continuidad | el método continuidad |

⚠️ **La onda S entra en las dos integraciones y NO en `params`.** `params` es el gate de «una
válvula que nadie cuantificó no recibe severidad» y la onda S no es una cuantificación de la
regurgitación —es el flujo venoso pulmonar—. Metida en `params`, una onda S invertida sola
escribiría grado 4 sobre una mitral sin un solo parámetro cuantitativo.

**Qué método entra al grado:**
- **PISA**: tiene números (`params` trae algún voto de grupo `pisa`). Su casilla `im_pdf_pisa`
  está **siempre tildada y no se puede destildar**, así que «incluido» equivale a «tiene
  números», que es además la compuerta que `_imMetodoPdfVal` usa para el papel.
- **continuidad**: `im_pdf_cont.checked` **y** alguno de `im_eroa_cont`, `vr_cont`, `im_fr_cont`
  **mayor que 0** (la misma convención que `imPdfMetodosUI` usa para habilitar la casilla).
- **ninguno**: quedan los votos comunes, que es **exactamente** lo que HEAD contaba. No hay una
  rama para eso.

Los tres números de la continuidad se **leen de los campos** que escribe `calcContIM` —su dueño
único— y no se recalculan: una segunda copia de tres fórmulas, con sus propias bandas, es el
defecto que este repo documenta como «la copia que usa el PDF se pudre sin que se vea».

**Disparadores.** De las cinco puertas de la continuidad, cuatro ya llamaban a `calcContIM()` y
`calcIM_ESC()` seguidas (`vtiMitralEditado`, `aiAreaEditada`, `tsviDiamEditado`,
`vtiTsviCoordinar`, más el `oninput` de `im_itv`). Entraron el **2026-10-13**: `diam_mit` y el
`onchange` de `im_pdf_cont`.

**La cápsula «Severidad (continuidad)» NO es el método.** Sigue graduando sólo por Vol-R y FR, con
su propia regla (`volR < 30 && fr < 30` → leve · `volR >= 60 || fr >= 50` → severa · resto
moderada). Son dos lecturas distintas y el aviso «El método volumétrico da X y el integrado Y»
las compara.

**La fila `im-discordancia` no se tocó**: `_votosDisc` sigue siendo PISA + comunes + onda S, así
que su texto es idéntico a HEAD.

---

## 4 · La insuficiencia tricuspídea: gana la continuidad

`scores` se **deriva** de `params`, y cada voto lleva `grupo` (`'vc'`, `'jet'`, `'cont'`).

```
_itHayCont = (eroa !== null)                 // la cadena produjo un NÚMERO
_itDeciden = params.filter(p => !(_itHayCont && p.grupo === 'jet'))
```

- La compuerta es que la cadena haya producido un número, **no** que los campos estén escritos:
  sin uno de los tres insumos (`it_pisa_r`, `it_pisa_val`, `it_vmax_cw`) la continuidad no tiene
  nada que decir y la **densidad vuelve a decidir**.
- **Lo que se retira del veredicto es la densidad del chorro y nada más.** La vena contracta sigue
  votando. Es la lectura conservadora de la regla y está declarada en `docs/PENDIENTES.md`.
- La fila de discordancia **sigue listando los votos completos** y agrega la cláusula «Con datos
  de continuidad cargados el grado final sale de la continuidad: la densidad del chorro se muestra
  y no decide». `it-discordancia` **no tiene un solo lector** fuera de `calcIT_ESC` (verificado
  por grep: ni informe, ni EN SUMA, ni PDF, ni PPT, ni Excel).

---

## 5 · El grado de cada fila entre paréntesis

`sevFilaGradoPintar(mapa, votos)` — dueño único. Dos mapas: **`IM_FILA_GRADO`** (5 filas) y
**`IA_FILA_GRADO`** (4 filas), con sus envoltorios `imGradoFilasPintar` / `iaGradoFilasPintar`.

⚠️ **Es un `<span class="calc-grado" data-grado-de="…">` HERMANO y no texto dentro del
`.calc-val`**, y eso **no** es cosmético: el texto de `eroa-val`, `volr-val` y `freg-val` **es** lo
que el PDF publica (`_imPdfPisaTxt` lo lee literal) y lo que `_imPisaSellar` congela en el estudio.

⚠️ **Y sin `id`**, porque el barrido de `limpiarCampos` devuelve a «—» todo
`.calc-box .calc-row span[id]:not(.calc-lbl)` y la regla pide blanco. Se vacían con una llamada
explícita en `limpiarCampos`, igual que las marcas «(revisar)» del VD y del strain.

**No se tocan las filas que ya publican su grado**: el THP, la Vmax telediastólica y el VTI de la
aorta descendente lo traen en su `badge` con el rango; las tres de la tricúspide con el formato de
`itRefPintar` («18.1 mm² · Leve (<20 mm²)»). El pintor **vacía todas y después escribe las que
votaron**: al revés dejaría el grado del parámetro recién borrado.

---

## 6 · El papel: EROA, Vol-R y FR juntos por método

| fila de la tabla compacta | emisor | `ref` |
|---|---|---|
| `EROA` | `imEroaPdfVal()` | `(<20 / 20–40 / ≥40) mm²` |
| `Vol.R` | `imVolrPdfVal()` | `(<30 / 30–60 / ≥60) ml` |
| **`FR`** | **`imFrPdfVal()`** (nuevo 2026-10-13) | `(<30 / 30–50 / ≥50) %` |

Los tres pasan por `_imMetodoPdfVal(idSpanPisa, idCampoCont, uni, dec)`, que prefija **siempre**
el método. La FR va con **cero decimales**, que es lo que publican `freg-val` (`toFixed(0)`) y
`im_fr_cont` («39 %»).

`freg-val` entró a **`_IM_PISA_SPANS`** (el sellado) y a **`_imFilasBackup`** (el respaldo de la
ventana de reimpresión). ⚠️ **El formato del sellado NO cambia de versión**: `_imPisaPersistido`
busca **por clave**, así que un estudio sellado con dos entradas devuelve las dos y `null` para la
tercera — un informe anterior reimprime exactamente lo que imprimía, sin la fila de FR.

---

## 7 · Cómo se mide

**`scripts/_probe_valvborra.mjs`** — A/B de solo lectura, con `--file` para correr contra una copia
de HEAD. Ocho grupos: `repro`, `borrado`, `dos`, `metodo`, `tric`, `pastillas`, `controles`, `pdf`.
Teclas y clics reales, con **aborto** si el tecleo o el borrado no quedan.

**TC-463** — 29 condiciones, 6 denominadores, 11 controles. Carga con `__t.set` y no con teclas de
CDP, **porque el cuerpo de un caso corre dentro de la página**: no tiene acceso al protocolo del
navegador y un `KeyboardEvent` a mano no es de confianza. Las mismas escenas van con teclas reales
en la sonda. Verificado que sabe fallar contra HEAD en un worktree aparte: **17 de 29 en rojo**.

### Trampas medidas en esta tanda

- ⚠️ **`generarInforme()` pelado SALTA a la pestaña Informe**, y al volver `showTab('valvulas')`
  corre `valvCerrarTarjetas`: los campos quedan sin geometría, `focus()` sobre un nodo oculto falla
  **en silencio** y los Backspace se los come el documento. La primera corrida de la sonda midió
  **un borrado que no ocurrió** en 46 escenas. Va con `{silencioso:true}`.
- ⚠️ **`im_dtsvi`, `im_itv_tsvi` y `diam_tsvi` están en `display:none`** y no son campos. Las
  puertas visibles del Ø y del VTI del TSVI son **`ea_dtsvi`** (Estenosis aórtica) e **`itv_tsvi`**
  (Doppler, dentro de la tarjeta plegable `dop-aortico`).
- ⚠️ **Un clic sobre un nodo sin geometría no es un gesto.** La sonda informó «ambos métodos
  marcados» con `im_pdf_cont.checked === false`. Se exige el estado pedido y se aborta.
- ⚠️ **El estado inicial se mide con los cuatro calculadores ya corridos** sobre el formulario
  vacío: `ea-sev` arrancaba en el «—» del marcado y terminaba en el «— — sin Vmax ni gradiente
  medio cargados» que escribe su pintor, así que las 4 escenas de la EAo salían «no volvió» con el
  grado, la pastilla y el informe perfectos.
- ⚠️ **La REGLA J tiene que haber tenido las mismas oportunidades.** Cuatro escenas salían «no
  volvió» por la pastilla: el prerrequisito ya había dejado un grado graduable y
  `valvAutoAbrirCajones` la prendía recién en el `abrirTodo` del borrado.
- ⚠️ **«Gana el peor» se prueba por los DOS lados.** Con una sola pareja (PISA severo contra
  continuidad leve) un veredicto que se quedara siempre con PISA pasa cinco de las siete escenas.
