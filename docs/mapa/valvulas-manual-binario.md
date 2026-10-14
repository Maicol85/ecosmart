# Mapa — el MODO MANUAL de las pastillas, el selector binario de la EM, el violeta, el VTI de la ET,
# la casilla de PISA y lo que «Nuevo estudio» dejaba vivo (2026-10-13 · ampliado el 2026-10-14)

> Mapa **nuevo**, a archivo propio, por la regla de `CLAUDE.md`: `valvulas.md` está en **32,0 KB** y
> el techo son ~35 KB, así que una sección más lo cruzaba. Acá viven la regla del modo manual de las
> ocho pastillas, el selector binario de la estenosis mitral, el violeta de «Significativa» y el
> cuarto criterio de la estenosis tricuspídea. Lo que **no** está acá sigue donde estaba: el retiro
> del grado y la propiedad de las pastillas en `docs/mapa/valvulas-borrado.md`, y los botones,
> `SEV_SINC`, el escalón aórtico y las cascadas de severidad en `docs/mapa/valvulas.md`.
>
> **Ampliado el 2026-10-14** con las secciones **6** (la casilla de PISA de «Incluir en el informe»,
> que ya se puede destildar), **7** (las tres piezas que sobrevivían a «Nuevo estudio») y **8** (las
> tres afirmaciones viejas de la ayuda de la EM), más el operador nuevo del VTI en la sección 4.
> Pesa **28,6 KB**, medido: por debajo del techo de ~35 KB, así que no hizo falta partirlo — pero la
> próxima tanda que lo toque conviene que mida antes de escribir.

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

`ET_CRIT.vtiEnt` — `signif: 60`, **`op: '>='`** (desde el 2026-10-14; nació con `'>'`), `uni: 'cm'`,
`banda: null`.

```
cVti   = vtiOk && vtiD >= ET_VTIENT_SIGNIF
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
| **60,0** | **sí** (desde el 2026-10-14; con el `>` de 2009 era **no**) | significativa | `Significativa` | **prendida** |
| **60,1** | sí | significativa | `Significativa` | prendida |
| 99 | sí | significativa | `Significativa` | prendida |
| 101 | no (**fuera de banda**) | — | `sin` | apagada |

⚠️ **EL 60,0 EXACTO ES LA ÚNICA ESCENA QUE CAMBIÓ CON EL OPERADOR**, y está medido por sus dos
lados: 59,9 y 60,1 dan lo mismo en los dos árboles, igual que 99 y 101. Es un valor, pero es **el
que se tipea**: nadie escribe 60,1 cuando mide 60.

⚠️ **LA BANDA NO HUBO QUE AMPLIARLA**: el techo es **100 cm y no 60** desde el 2026-10-07, y el
comentario de entonces dice por qué —en una ET severa el flujo de entrada se alarga—, así que ya
cubría entera la zona del criterio. Que por encima de 100 no vote queda en `PENDIENTES`.

**El cuadro de referencias pasa de tres filas a CUATRO**, con la del VTI en segundo lugar, que es el
orden de la tabla. ⚠️ **El símbolo del operador dejó de salir de un ternario**
(`op === '>=' ? '≥' : '≤'`): cuando el cuarto criterio era el único estricto, habría impreso
**«≤60 cm»**, o sea el signo **contrario** al de la guía sobre el renglón que explica el veredicto.
Hoy es un mapa, `OP_TXT`, y desde el 2026-10-14 imprime **«≥60 cm»**.

⚠️ **EL SÍMBOLO Y LA COMPARACIÓN SON DOS LÍNEAS DISTINTAS.** El rótulo sale del `op` de `ET_CRIT` y
el voto del `>=` de `etEstado`; es la convención de los otros tres criterios de esta tabla. Lo único
que impide que se desincronicen es **TC-468**, que compara el símbolo IMPRESO contra el lado del
borde que vota: un cuadro que dijera «>60 cm» al lado de un 60,0 que vota es peor que no tenerlo.

**El informe** nombra el criterio en el paréntesis cuando CUMPLE, como los otros tres: sin eso, un
paciente cuya ET significativa la sostiene sólo el VTI publicaba la afirmación con el paréntesis
vacío. **El borrado** devuelve el grado al centinela y apaga la pastilla que la app prendió.

⚠️ **EL OPERADOR SE DIO VUELTA EL 2026-10-14 Y GANÓ LA GUÍA MÁS NUEVA** (decisión de Maicol). La
**ASE 2023** (Pandian, *Echocardiographic Evaluation of Rheumatic Heart Disease*, JASE enero 2023),
**folio 16** —comprobado en el encabezado impreso de la página— escribe *«inflow VTI ≥60 cm»*, leído
**renderizando a 600 dpi**. La **EAE/ASE 2009** escribe `>60` y sigue siendo la fuente de los otros
tres cortes; por eso `ET_CRIT_FUENTE` **suma «ASE 2023»** y no la reemplaza.

⚠️ **EL TEXTO EXTRAÍDO DE ESE PDF NO SIRVE PARA LEER EL OPERADOR.** La fuente codifica `≥` como `$`
y `≤` como `#`, así que `pdftotext` devuelve «the mean gradient is $5 mmHg, inflow VTI $60 cm» y
quien lo lea así concluye que no hay operador. Es la misma trampa que `FUENTES.md` ya documenta para
Baumgartner 2009 y Wilkins 1988, con otra causa: allá la tabla es un bitmap, acá la codificación de
la fuente.

Los folios, los dos operadores en conflicto y el silencio de la ESC/EACTS 2025 están en
`docs/fuentes/FUENTES.md` → «Estenosis TRICUSPÍDEA — Tabla 10, p. 19».

---

## 6 · La casilla de PISA de «Incluir en el informe» (2026-10-14)

Hasta el 2026-10-14 `im_pdf_pisa` llevaba `onchange="this.checked=true"`: era **informativa**, y con
datos en los dos métodos el médico no podía mandar **sólo la continuidad** al informe. Hoy se
destilda.

**Un solo dueño, `imPdfMetodoClic`**, que gobierna **las dos** casillas:

```
si el clic deja las DOS sin tildar  ->  se repone el tilde, se escribe el aviso, y NADA mas
                                        (ni `tocado` ni recalculo: el clic no prospero)
si no                               ->  se borra el aviso, se marca `tocado` y corre calcIM_ESC()
```

⚠️ **LA REGLA ES «LA ÚLTIMA TILDADA NO SE DESTILDA», Y VALE PARA LAS DOS.** No hay preferencia por
PISA: lo que gana el empate es la OTRA casilla, la que ya estaba tildada. Con una sola pareja no se
prueba —una implementación que protegiera sólo a PISA pasaría la mitad del caso— así que TC-468 lo
mide **por los dos lados**.

⚠️ **`tocado` SÓLO CUANDO EL CLIC PROSPERA.** Es la bandera de «el médico decidió» que `_pdfMetodoChk`
lee para no pisarlo; ponerla en un clic que la regla acaba de revertir registraría una decisión que
el médico no llegó a tomar.

⚠️ **Y `calcIM_ESC()` AL FINAL, EN LAS DOS.** Desde la regla 3 del 2026-10-13 estas casillas deciden
qué método entra al **GRADO** y no sólo a la fila del papel.

### Las tres piezas que consultan la casilla

| quién | qué hace | dónde |
|---|---|---|
| `imPdfPisaIncluida()` | el estado, en un solo lugar; **falla ABIERTO** (sin la casilla, PISA entra) | — |
| `calcIM_ESC` | `_imPisaIncl = imPdfPisaIncluida() && params.some(grupo==='pisa')` | el GRADO |
| `_imMetodoPdfVal` | la pata «PISA:» de las tres filas del papel | el PDF |

⚠️ **LO QUE HACE SEGURO CONSULTARLA NO ES NINGUNA DE ESAS TRES: ES `imPdfPisaRestaurar`.** El
comentario que vivía en el marcado advertía, con razón, que el día que alguien agregara
`if (pisaCb.checked)` **todo informe anterior se reimprimiría sin EROA ni Vol-R**: la ventana de
reimpresión escribe `.checked` desde `campos` sobre TODOS los checkbox, y un estudio anterior al
selector **no trae `im_pdf_pisa__chk`**. Por eso ese `if` entró **junto** con la función que repone
**TILDADA** cuando la clave falta, llamada desde las **dos** rutas —`_restaurarChkInclusion` y
`_pdfDeInformeGuardadoArmar`—. No se migra nada: lo que se repone es el **default**.

| clave en el estudio | la casilla reabre |
|---|---|
| ausente (estudio anterior al selector) | **tildada** |
| `'0'` | destildada |
| `'1'` | tildada |

### Qué publica cada combinación, medido

PISA calibrada a **severa** (EROA 50,3 mm²) y la continuidad a un grado **menor** (EROA 39,3 mm²),
para que la regla «gana el peor de los incluidos» se pueda ver:

| combinación | grado | badge | PDF (fila EROA) | EN SUMA |
|---|---|---|---|---|
| las dos tildadas | `4` | Severa | `PISA: 50.3 mm² · Cont: 39.3 mm²` | IM severa. |
| sólo PISA | `4` | Severa | `PISA: 50.3 mm²` | IM severa. |
| **sólo continuidad** | **`2`** | **Moderada — evaluar integrado** | **`Cont: 39.3 mm²`** | **IM moderada.** |

Las dos primeras son **idénticas a HEAD**. La tercera es la que el médico pidió poder producir.

**`im-pdf-metodo-aviso`** es un renglón de PANTALLA y nada más: un clic que no hace nada y no explica
se lee como un control roto. No tiene emisor en informe, EN SUMA, PDF, PPT ni Excel, es un `<div>`
—así que el recolector de `guardarInforme`, que barre `input`/`select`/`textarea`, no lo toma— y lo
vacía el barrido de `[id^="im-pdf-"]` que ya existía.

---

## 7 · Lo que «Nuevo estudio» dejaba vivo (2026-10-14)

Tres piezas que sobrevivían al cambio de paciente porque **ningún barrido las alcanzaba**:

| pieza | qué es | por qué se escapaba |
|---|---|---|
| `window._imGradoCalc` | la foto del grado calculado de la IM | no es DOM |
| `window._itGradoCalc` | ídem de la IT | no es DOM |
| `im-cont-severidad` | el renglón «Severidad (continuidad)» | es un `<div>` dentro de un `calc-row`: no lo alcanza `.calc-box .calc-row span[id]` ni `[id^="im-pdf-"]` |

Las dos primeras eran el punto **M2** de `PENDIENTES` y la tercera el **B-9**. La de la IAo ya se
limpiaba, y su propio comentario dice por qué: «sobreviviendo, el aviso rojo del paciente B nombra
*cálculo automático: Severa* sobre un estudio que no tiene un solo dato».

⚠️ **EL `dataset.gradoVolum` DE ESE RENGLÓN SÍ SE BORRABA** —entra en la lista de
`[data-grado-volum]`— **y el TEXTO no.** O sea que se limpiaba lo que decide y quedaba vivo lo que se
ve, que es el defecto espejo del que `data-params-disc` documenta.

⚠️ **QUE `calcIT_ESC` SE PONGA EN `null` AL ENTRAR NO ALCANZA.** Las dos quedan rancias igual hasta
que su calculador vuelva a correr, y `limpiarCampos` **no llama a ninguno de los dos**.

**Medido con clics reales en los DOS botones del gesto** —el de la barra y el «Continuar sin
guardar» del modal—, contra el árbol anterior:

| escena | antes del gesto | después, en HEAD | después, hoy |
|---|---|---|---|
| IM con PISA severa | `_imGradoCalc = '4'` | **`'4'`** | `null` |
| IT con VC severa | `_itGradoCalc = '4'` | **`'4'`** | `null` |
| continuidad severa | el renglón dice «Severidad (continuidad): Severa…» | **lo mismo** | vacío |
| **IAo (control)** | `_iaGradoCalc = '4'` | `null` | `null` |

Y `sevCalcPublicable('im')` y `('it')` devolvían **`'4'` sobre un formulario vacío**, que es lo que
lee el aviso rojo de discrepancia. El **dato nuevo** clasifica igual en los dos árboles (grado 1 en
las dos lesiones): lo que cambia es que no arrastra el cálculo anterior.

---

## 8 · Las tres afirmaciones viejas de la ayuda de la EM (2026-10-14)

Punto **M5** de `PENDIENTES`. Viven en **`ref-em`**, la tarjeta «Referencia clínica» de la estenosis
mitral — **no** en el modal del manual, que es un detalle que costó una medición (abajo).

| antes | hoy | por qué |
|---|---|---|
| «gradiente medio **> 4 mmHg** publica *EM con gradiente elevado*» | «gradiente medio **de 5 a menos de 10 mmHg** publica *EM no significativa, con gradiente elevado*» | el corte es 5 desde el 2026-10-11 y la banda llega a 10 |
| «…prevalece el peor, con ***probablemente severa* por …»** | «…prevalece el peor: basta una por debajo del corte» | la categoría `probable` se eliminó ese mismo día |
| «el ≥10 mmHg **no** se usa como criterio de severidad» | «el ≥10 mmHg **sí** es criterio de significación» | es la mitad de la regla binaria |

**No se movió ningún corte ni ninguna cuenta**: los números salen de `AVM_SEVERA_MAX` (1,5),
`EM_GMEDIO_ELEVADO_MIN` (5) y `EM_GMEDIO_SIGNIF_MIN` (10), que son los que `emCategoria` aplica.

⚠️ **LA ATRIBUCIÓN DE LA TERCERA CAMBIÓ DE GUÍA, Y POR LA REGLA DE LA CASA.** Decía «la propia ESC
2021», y **`FUENTES.md` no tiene ninguna entrada de ESC/EACTS 2021**. La **ESC/EACTS 2025**, que sí
está en la biblioteca, escribe el concepto literal en el **folio 4680** —comprobado en el encabezado
impreso—: *«low-gradient severe MS (MVA <1.5 cm², mean gradient <10 mmHg)»*. Esa guía escribe `<1.5`
**estricto**; el corte de la app sigue siendo el `≤1,5` de la ASE 2023 y **no se tocó**.

**UNA CUARTA, DECIDIDA SOBRE LA MARCHA:** el cartel «Estenosis mitral: la app completa sólo
*Significativa*» del manual repetía el mismo «> 4 mmHg» con otras palabras. M5 lista tres y ésta no
estaba, pero dejar una de las dos ayudas diciendo «> 4» era conservar el defecto que la otra acababa
de cerrar.

---

## 5 · Cómo se mide

**`scripts/_probe_valvmanual.mjs`** — A/B de solo lectura, con `--file` para correr contra una copia
de HEAD y `--captura --dest <dir>` para los PNG del sub-botón. Seis grupos: `repro`, `respeta`,
`emsel`, `color`, `vti`, `controles`. Teclas y clics reales, con **aborto** si el tecleo, el borrado
o el clic en la pastilla no quedan.

**TC-466** — 37 condiciones, 5 denominadores, 5 controles negativos. Carga con `__t.set` y no con
teclas de CDP, **porque el cuerpo de un caso corre dentro de la página**. Verificado que sabe fallar
contra HEAD en un worktree aparte: **19 de 37 en rojo**, y sin morir por excepción.

**`scripts/_probe_valvcuatro.mjs`** (2026-10-14) — el arnés de las secciones 6, 7 y 8 y del operador
nuevo de la 4. Seis grupos: `vti`, `area`, `pisa`, `nuevo`, `ayuda`, `controles`. Teclas y clics
reales, con **aborto** si el tecleo, el borrado o el clic no quedan, y con «Nuevo estudio» por los
**dos botones** del gesto en vez de llamar a `limpiarCampos`.

**TC-468** — **35 condiciones**, 7 denominadores, 3 controles negativos. Verificado que sabe fallar
contra HEAD en un worktree aparte: **21 de 35 en rojo**, y **ninguna por excepción**; las 14 que
pasan son lo que esta tanda no mueve —el área por continuidad, el control del gradiente, el de la
IAo, el dato nuevo, las lesiones ajenas, el Laboratorio y el Excel en 435—.

### Trampas medidas en la tanda del 2026-10-14

- ⚠️ **`document.body.textContent` INCLUYE EL TEXTO DE LOS `<script>`**, o sea los 6 MB de JS de esta
  app con todos sus comentarios. La primera versión de la sonda de la ayuda leía eso e informó que
  «probablemente severa por» **seguía en pantalla** después de haberla borrado de los dos textos que
  el médico lee. Hay que armar el texto de los nodos que se LEEN, con `script` y `style` descontados.
- ⚠️ **EL MODAL DE AYUDA SE PINTA DE A UNA SECCIÓN.** Nace con **251 caracteres** —sólo el cascarón—
  y `renderAyudaEco(i)` dibuja una por vez: leerlo sin recorrerlas da ese denominador y las seis
  preguntas salen todas en `false`, que **se lee igual que «la frase ya no está»**.
- ⚠️ **Y LAS TRES AFIRMACIONES DE M5 NO VIVEN EN ESE MODAL: viven en `ref-em`.** Sin ese nodo, dos de
  las tres salían `false` **en HEAD**, y sólo matcheaba la que además está en el cartel del manual.
  **Tres denominadores rotos seguidos, los tres con pinta de medición buena.**
- ⚠️ **`ECO_AYUDA` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`**: `window.ECO_AYUDA` da
  `undefined` y el bucle no corre. Se nombra pelado, con `typeof` por delante.
- ⚠️ **PARA PROBAR «LA ÚLTIMA NO SE DESTILDA» HAY QUE CUIDAR EL ORDEN DE LOS CLICS.** La primera
  versión destildaba PISA y después la continuidad: ese segundo clic dejaba las dos apagadas, así que
  **la regla revertía la continuidad** y PISA quedaba libre de bajar. El orden que mide es: destildar
  PISA (prospera) → reponer PISA → destildar la continuidad (prospera) → intentar PISA (se revierte).
- ⚠️ **Me comí el acento grave DIEZ veces** —cinco en comentarios dentro del cuerpo de un caso y
  cinco dentro del template de la sonda—, con el archivo que documenta la trampa abierto delante.
  `scripts/check_backticks.py` dio la línea exacta en los del caso; **en los de la sonda no**, porque
  su cobertura es el cuerpo de un `caso(...)` y el de la sonda inyectada, y los míos estaban en el
  objeto `SONDA`: ésos los cazó `node --check`. **Correr los dos, siempre.**
- ⚠️ **TC-395 ES UN SÉPTIMO INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-137, TC-246, TC-249,
  TC-252, TC-260 y TC-GR-06: salió rojo en un `--solo` de 20 casos de la zona y **verde corrido
  solo**, con el mismo árbol.

### Trampas medidas en la tanda del 2026-10-13

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
