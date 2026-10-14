# Mapa — el MODO MANUAL de las pastillas, el selector binario de la EM, el violeta y el VTI de la ET (2026-10-13)

> Mapa **nuevo**, a archivo propio, por la regla de `CLAUDE.md`: `valvulas.md` está en **32,0 KB** y
> el techo son ~35 KB, así que una sección más lo cruzaba. Acá viven la regla del modo manual de las
> ocho pastillas, el selector binario de la estenosis mitral, el violeta de «Significativa» y el
> cuarto criterio de la estenosis tricuspídea. Lo que **no** está acá sigue donde estaba: el retiro
> del grado y la propiedad de las pastillas en `docs/mapa/valvulas-borrado.md`, y los botones,
> `SEV_SINC`, el escalón aórtico y las cascadas de severidad en `docs/mapa/valvulas.md`.

Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

---

## 1 · La regla del modo manual — un solo dueño para las OCHO lesiones

**`sevReiniciarManual(clave, calc)`** — dueño único. Vive pegado a `sevSincronizar`, que es su
**único llamador** y el punto por el que pasan las ocho claves registradas (`ea`, `ia`, `im`, `em`,
`it`, `et`, `ep`, `ip`). Devuelve lo que hizo, para que las pruebas afirmen sobre el gesto.

### El defecto que cierra, medido

Con teclas y clics reales en las ocho lesiones (`scripts/_probe_valvmanual.mjs --solo repro`):
cargar un dato → **apagar** la pastilla → **borrar** el dato dejaba la marca de manual viva sobre un
formulario vacío, y el dato **siguiente** ya no se graduaba.

| | HEAD | hoy |
|---|---|---|
| marca de manual tras borrar | **viva en 8 de 8** | ninguna |
| el dato nuevo escribe grado | **NO en 6 de 8** (ia, it, ip, em, ea, et) | en 8 de 8 |
| aviso «(ajuste manual) · cálculo automático: Severa» con el dato nuevo | en 5 de 8 | en ninguna |

⚠️ **LA ET NI SIQUIERA AVISABA, y es el caso peor.** Su `comparables` excluye el centinela, así que
`sevDiscrepa` devolvía `false`: el grado desaparecía **en silencio**, sin el aviso rojo que al menos
delataba a las otras cinco.

### La causa, con nombre

`toggleValvPill` → `valvApagarGrado` → `valvSev.aplicar(…, centinela)`, que **marca**
(`esqSevManual[clave]`) y **toma la foto** del calculado (`_sevCalcAlFijar[clave]`). Nadie la
deshace: `sevRetirarSugerido` sale por su guarda de manual (`{delMedico:true}`) y los **seis**
apagados automáticos —`_insufApagarAuto`, `_emApagarAuto`, `_etApagarAuto`, `_epApagarAuto`,
`_ipApagarAuto`, `_eaApagarAuto`— salen por su **primera** guarda, «la pastilla ya está apagada»,
sin tocar nada.

### Las cuatro guardas, en orden

| # | Guarda | Por qué |
|---|---|---|
| 1 | la clave está en `_sevCalcAlFijar` (`hasOwnProperty`) | la marca tiene que ser de un **gesto de esta sesión**. `aplicar()` es el único que escribe esa foto, que **no se persiste** y que `limpiarCampos` vacía: un estudio reabierto o una planilla importada traen la marca **sin** foto. Sin esta guarda, abrir un estudio con «IM ausente» importada —que `_sevManualDesdeCampos` marca a propósito— le borraría la marca, y eso es **migrar un estudio guardado** |
| 2 | el `<select>` está en el centinela | un grado que el médico escribió es una afirmación suya y la marca es lo que la protege |
| 3 | `C.bloqueado()` es `false` | con prótesis o con un insumo fuera de banda `sevCalcPublicable` también da `null`, y ahí **sí hay** un dato cargado. Falla CERRADA |
| 4 | `sevCalcPublicable(clave) === null` | no queda ningún dato que vote: es la condición de la regla |

⚠️ **`hasOwnProperty` Y NO `!= null`**: apagar la pastilla sin ningún dato guarda la foto en `null`,
y eso **es** un gesto. Con la comparación laxa ese caso se confundiría con «marca restaurada».

### Qué hace cada letra de la regla de Maicol

- **(a)** pastilla apagada y sin dato que vote → **estado inicial**: sin marca y sin advertencia.
- **(b)** pastilla apagada **con** datos → se respeta y el aviso de discordancia queda. Sale gratis
  por la **guarda 4**: con un dato que vota no se entra. Medido: **0 diferencias contra HEAD** en
  las ocho (marca, grado, pastilla, cajón y aviso letra por letra).
- **(c)** al borrar el último dato la marca se limpia sola. **El cajón de fundamento no necesita una
  línea**: lo vacía y lo esconde `sevFundamento`, que `sevSincronizar` llama en el mismo punto único
  que pinta el aviso.
- **(d)** reabrir la pastilla a mano después de apagarla: **no cambió**. Con el dato cargado sigue
  sin recuperar el grado —medido, 8 de 8 idéntico a HEAD—, o sea **B-3 sigue abierto**. No hizo
  falta tocarlo para (a) a (c).

### Dos cosas que hay que saber

⚠️ **LA PASTILLA NO SE VUELVE A PRENDER SOLA, Y ES DELIBERADO.** El apagado del médico deja la clave
de `localStorage` en `'0'`, y los auto-prendidos la leen como «el médico la cerró». Eso es «como ya
lo hace hoy para esa lesión»: en HEAD, las dos lesiones que se recuperaban (IM y EP) terminaban
igual. Lo que sí cambia es que **el grado se escribe**, que es lo que el informe lee —el informe
usa el GRADO y no la pastilla desde la etapa 4b—.

⚠️ **EL REINICIO DEPENDE DE QUE EL CALCULADOR HAYA CORRIDO, y eso destapa una asimetría
PREEXISTENTE:** `limpiarCampos` pone `_iaGradoCalc` en `null` y **no toca** `_imGradoCalc` ni
`_itGradoCalc`, así que la foto de proceso de la IM y la IT sobrevive a «Nuevo estudio» y el
reinicio puede ver un cálculo que ya no es de este paciente. Lo destapó TC-430. Declarado en
`docs/PENDIENTES.md`; arreglarlo es tocar `limpiarCampos`.

---

## 2 · El selector binario de la estenosis mitral

El médico no ve el `<select>` —`em_grado` está en `display:none` desde el 2026-10-06— sino el menú
**▼** de la pastilla, que `valvSev.opciones` arma leyendo sus `<option>` y filtrando las ocultas.

| `value` (NO cambia) | texto de la `<option>` | en el menú ▼ |
|---|---|---|
| `sin` | — grado — | no (centinela) |
| `leve` | **No significativa** | **sí** |
| `moderada` | **No significativa**, con `hidden` | no |
| `severa` | **Significativa** | **sí** |

⚠️ **`moderada` QUEDA COMO `<option hidden>` Y NO SE BORRA**, con el precedente exacto de
«Moderada-severa» de `ep_grado`: asignar a un `<select>` un valor que no existe lo deja en
`selectedIndex -1` y `.value === ''`, o sea el grado **desaparece** de las cuatro superficies sin
evento y sin rastro. Verificado: los dos tokens de legado reabren en su índice, 1 y 2.

### Las cuatro superficies de TEXTO, y su dueño

| superficie | dueño |
|---|---|
| el menú ▼ y el desplegable nativo | el texto de la `<option>` (HTML estático) |
| la fila «EM grado» del PDF | `emGradoVis` ← `EM_GRADO_VIS` |
| la etiqueta del aviso rojo | `SEV_SINC.em.etiqueta` → `emGradoVis` |
| **el sub-botón y el «grado final al informe»** | `rotulo()` → `VIS_BTN` → `emGradoVis` |
| la franja del PPT | el texto de la `<option>`, vía `_pptSel` |

⚠️ **LA CUARTA FILA ES NUEVA Y CERRABA UNA DIVERGENCIA PREEXISTENTE.** El sub-botón derivaba su
rótulo de `corto()`, que busca «severa» en el **VALOR**: con `em_grado='severa'` decía **«Severa ▼»**
mientras la `<option>`, el PDF y la etiqueta ya decían «Significativa» desde el 2026-10-11. Dos
palabras para el mismo dato en la misma pantalla. Se arregla con un dueño **por par** (`VIS_BTN`) y
**sin tocar `corto()`**, que gobierna las ocho pastillas: las otras siete salen idénticas en el A/B.

### El informe y el EN SUMA

`emDesc` pasa por `emGradoVis` en vez de `emG.toLowerCase()`.

| token | informe, antes → hoy | EN SUMA, antes → hoy |
|---|---|---|
| `leve` | con estenosis **leve** → **no significativa** | EM leve. → **EM no significativa.** |
| `moderada` | con estenosis **moderada** → **no significativa** | EM moderada. → **EM no significativa.** |
| `severa` | con estenosis **severa** → **significativa** | EM severa. → **EM significativa.** |
| `sin` | sin frase | sin frase |

⚠️ **LAS CUATRO FRASES NUEVAS YA LAS EMITÍA LA APP** por el camino de la CATEGORÍA
(`EM_CAT_EST.severa`, `EM_CAT_SUMA.severa`, `EM_CAT_SUMA.gradiente`), así que no se inventó ninguna
redacción en un informe firmado. Lo que se cierra es que el grado **elegido** se escribiera distinto
del **calculado** sobre el mismo paciente. La de `severa` era PREEXISTENTE.

### Quién lee el VALOR, y por eso no se tocó

Censo completo: **Excel** (columna «EM grado», tipo `vocab`, vocabulario `sin · leve · moderada ·
severa`), **importador** (`LAB_XLS_MAP`, sus listas y su tabla de legado), **Laboratorio**
(`_labEstenSev` por regex sobre el valor guardado, más `_labGradoTxt` y el filtro de cohorte),
**panel de Evidencia** (`_indS('em_grado')`), el **PDF** (que ya pasaba por `emGradoVis`), el **PPT**
(que lee el texto de la `<option>`), la **tarjeta de reimpresión** (que clona el `<select>`) y las
tablas de frases de `generarInforme`. Medido por token: Excel en **435 columnas con el mismo valor**
en los cuatro y el Laboratorio clasificando igual (Sin/Leve/Moderada/Severa).

⚠️ **LO QUE SÍ CAMBIA DE DATO, declarado**: el médico ya no puede escribir `moderada`, así que de acá
en más el Laboratorio verá «Leve» donde antes podía ver «Moderada». Es el renglón que el prompt
siguiente del Laboratorio tiene que mirar.

---

## 3 · El violeta de «Significativa»

`.valv-sev-btn.nivel-sig` → fondo `#ede9fe`, borde `#7c3aed`, texto `#4c1d95`. Se la pone
`refrescar()` cuando el **texto** que acaba de escribir es exactamente `'Significativa'`.

- **La compuerta es el TEXTO y no el token**, y eso es lo que garantiza que el color y la palabra no
  se desincronicen: `txt` sale de `rotulo()`, el mismo dueño que escribió el botón.
- **Va DESPUÉS de los tres `nivel*`** en la hoja: misma especificidad, gana la última, así que la
  mitral —que sí tiene `nivel3` por su token `severa`— queda violeta sin quitarle la clase en el JS.
- **En hex y el mismo en los dos temas**, como los otros tres niveles. `--purple` es un color de
  primer plano y no sirve de fondo.
- **Alcance medido**: la estenosis mitral (por `VIS_BTN`) y la tricuspídea (cuyo vocabulario **es**
  la palabra). Las otras seis no la producen con ningún valor — control negativo en los dos temas.

⚠️ **CONTRA SUS VECINOS SE DISTINGUE POR TONO Y NO POR CLARIDAD.** Contraste del texto 9,23:1 y del
borde 4,8:1, pero contra el rojo de `nivel3` la razón es **1,03:1** —la misma luminancia— y la
distancia ΔE76 **13,9**, la más corta de las cuatro (verde 25,5 · amarillo 33,4 · naranja 57,0). Es
preexistente entre los tres pastel que ya estaban. Lo que sostiene el significado es la **palabra**.

⚠️ **NINGUNA SUPERFICIE DE SALIDA LEE EL COLOR** (verificado por grep): el PDF imprime la fila «EM
grado» como texto y el PPT la franja de hallazgos también.

---

## 4 · El cuarto criterio de la estenosis tricuspídea

`ET_CRIT.vtiEnt` — `signif: 60`, `op: '>'`, `uni: 'cm'`, `banda: null`.

```
cVti   = vtiOk && vtiD > ET_VTIENT_SIGNIF
signif = cGm || cThp || cAvt || cVti        // un termino mas del MISMO some
```

**La regla no cambia ni una condición**: los criterios de la Tabla 10 pesan igual y basta con que se
cumpla uno. La compuerta es `vtiOk`, **la misma banda** que ya decide si ese número puede alimentar
el área.

⚠️ **LA BANDA NO SE DUPLICA: sigue en `ET_BANDA_INSUMO` y la entrada declara `banda: null`.** El
campo tiene **dos papeles** —criterio y denominador del área— y el rango tiene que tener un solo
dueño. Por eso esa tabla dejó de ser «los que NO son criterio», y su comentario lo dice.

⚠️ **EL ÁREA NO SE MUEVE Y ESTÁ MEDIDO**: con Ø TSVD 25 mm, VTI TSVD 14 y VTI de entrada 70 da
**0,98 cm²** en los dos árboles, con la misma fila y el mismo campo.

**El borde, con el VTI como único dato:**

| VTI | `cVti` | veredicto | grado | pastilla |
|---|---|---|---|---|
| 59,9 | no | — | `sin` | apagada |
| **60,0** | **no** (operador estricto) | — | `sin` | apagada |
| **60,1** | **sí** | significativa | `Significativa` | **prendida** |
| 99 | sí | significativa | `Significativa` | prendida |
| 101 | no (**fuera de banda**) | — | `sin` | apagada |

⚠️ **LA BANDA NO HUBO QUE AMPLIARLA**: el techo es **100 cm y no 60** desde el 2026-10-07, y el
comentario de entonces dice por qué —en una ET severa el flujo de entrada se alarga—, así que ya
cubría entera la zona del criterio. Que por encima de 100 no vote queda en `PENDIENTES`.

**El cuadro de referencias pasa de tres filas a CUATRO**, con la del VTI en segundo lugar, que es el
orden de la tabla. ⚠️ **El símbolo del operador dejó de salir de un ternario**
(`op === '>=' ? '≥' : '≤'`): con el cuarto criterio, que es el único estricto, habría impreso
**«≤60 cm»**, o sea el signo **contrario** al de la guía sobre el renglón que explica el veredicto.
Hoy es un mapa, `OP_TXT`.

**El informe** nombra el criterio en el paréntesis cuando CUMPLE, como los otros tres: sin eso, un
paciente cuya ET significativa la sostiene sólo el VTI publicaba la afirmación con el paréntesis
vacío. **El borrado** devuelve el grado al centinela y apaga la pastilla que la app prendió.

Los folios, los dos operadores en conflicto y el silencio de la ESC/EACTS 2025 están en
`docs/fuentes/FUENTES.md` → «Estenosis TRICUSPÍDEA — Tabla 10, p. 19».

---

## 5 · Cómo se mide

**`scripts/_probe_valvmanual.mjs`** — A/B de solo lectura, con `--file` para correr contra una copia
de HEAD y `--captura --dest <dir>` para los PNG del sub-botón. Seis grupos: `repro`, `respeta`,
`emsel`, `color`, `vti`, `controles`. Teclas y clics reales, con **aborto** si el tecleo, el borrado
o el clic en la pastilla no quedan.

**TC-466** — 37 condiciones, 5 denominadores, 5 controles negativos. Carga con `__t.set` y no con
teclas de CDP, **porque el cuerpo de un caso corre dentro de la página**. Verificado que sabe fallar
contra HEAD en un worktree aparte: **19 de 37 en rojo**, y sin morir por excepción.

### Trampas medidas en esta tanda

- ⚠️ **`SEV_TOKEN_SIN` NO ESTÁ EN `window`** —es un `const` de módulo— y la primera versión de TC-466
  **murió por excepción** leyéndolo. Un caso que muere así prueba que el árbol es distinto, no que
  sabe medir. Se pregunta por `sevEsSin`, que sí está exportado.
- ⚠️ **EL AVISO LEGAL VUELVE A MITAD DE CORRIDA Y OSCURECE LA CAPTURA ENTERA.** Los cuatro primeros
  PNG salieron con el sub-botón bajo el scrim de `#modalAvisoEco`: el violeta se veía gris **con
  `getComputedStyle` diciendo `rgb(237,233,254)` al lado**, porque lee el estilo y no el píxel.
- ⚠️ **EL `clip` DE `Page.captureScreenshot` VA EN COORDENADAS DE PÁGINA** y `getBoundingClientRect`
  da las del **viewport**: en cuanto `scrollIntoView` scrollea, difieren en `scrollY`. El PNG de la
  tricúspide salió **en negro** y el de la mitral se salvó sólo porque ahí `scrollY` era 0.
- ⚠️ **EL ESCENARIO DE CONTROL TIENE QUE TENER VEREDICTO.** La primera versión escribía `eprima_sep`
  y `eprima_lat`, que **no existen** (son `e_sep` y `e_lat`): la diastólica decía «Incompleto — ASE
  2025» en los dos árboles y el control comparaba dos ausencias. Con los ids buenos dice **«DD Grado
  II — ASE 2025»** en los dos, que es una medición.
- ⚠️ **LA CELDA DEL EXCEL NECESITABA UN GRADO FIJADO A MANO.** El escenario de control carga el
  gradiente medio con IM moderada, o sea la categoría «gradiente transmitral elevado», donde la app
  **no escribe grado**: la celda salía `sin` y no distinguía el token de la palabra nueva.
- ⚠️ **Me comí el acento grave SEIS veces**, todas en comentarios míos dentro del cuerpo de un caso,
  con el archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea
  exacta las seis veces; `node --check` apuntaba a la apertura del template, cientos de líneas antes.
- ⚠️ **TC-137 ES UN INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-246, TC-249, TC-252, TC-260 y
  TC-GR-06: salió rojo en un `--solo` de 15 casos de la zona y **verde corrido solo**, con el mismo
  árbol. **Repetir antes de sospechar.**
