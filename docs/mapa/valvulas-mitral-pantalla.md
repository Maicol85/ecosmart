# La PANTALLA de las dos lesiones mitrales — campos, cuadro de referencias y globos «ⓘ»

Mapa de la tanda **D1** del rediseño de Válvulas (2026-10-14). Cubre **cómo se ve y por dónde se
carga** la insuficiencia y la estenosis mitrales, y el mecanismo de los globos ⓘ de **toda** la
pestaña. **No cubre los cortes, los grados ni la regla de integración**: eso sigue en
`docs/mapa/valvulas.md` y en `docs/mapa/valvulas-manual-binario.md`, y esta tanda **no movió ni uno**.

> Salió a archivo propio porque `valvulas.md` estaba en **33,8 KB**, a 1,2 KB del techo de 35 que
> este repo se fijó. Lo que le entró allá es un **puntero**. Medir con `wc -c` **antes** de escribir.

---

## 1 · Los 18 campos de la insuficiencia mitral, en tres columnas de seis

El contenedor es `#bloque-insuf-mitral` → `.valv-cols-3`. **Cada columna es un `<div>` propio y no
una fila de `grid-3`**: con filas el Tab cruza de izquierda a derecha y después baja; con columnas
baja por la columna y pasa a la siguiente, que es lo pedido. **No hay un solo `tabindex` en el
bloque**, así que el orden del DOM *es* el orden de tabulación — y eso es lo que TC-471 afirma, por
la AUSENCIA del atributo y no por su presencia.

| Col | Campo | `id` | Automático |
|---|---|---|---|
| 1 | Vena contracta (mm) | `im_vc` | |
| 1 | Área jet IM (cm²) | `im_jet_area` | |
| 1 | Onda S pulmonar | `im_onda_s` | |
| 1 | Ø anillo mitral (mm) | `diam_mit` | |
| 1 | VTI mitral de entrada, pulsado (cm) ↔ Doppler | `vtim` | |
| 1 | Vol mitral / latido (ml) | `vm_lat` | **sí** |
| 2 | Radio PISA (mm) | `pisa_r` | |
| 2 | Valiasing PISA (cm/s) | `pisa_val` | |
| 2 | Vmax IM (m/s) | `im_vmax` | |
| 2 | VTI IM del chorro, CW (cm) | `im_itv` | |
| 2 | Área AI (cm²) ↔ AI/VI | `im_ai_area` | |
| 2 | Relación área jet IM / área AI (%) | `vauto-jet-ai` | **sí, NUEVA** |
| 3 | EROA por PISA (mm²) | `vauto-eroa-pisa` | **sí, NUEVA** |
| 3 | Vol-R por PISA (ml) | `vauto-volr-pisa` | **sí, NUEVA** |
| 3 | FR por PISA (%) | `vauto-fr-pisa` | **sí, NUEVA** |
| 3 | EROA por continuidad (mm²) | `im_eroa_cont` | **sí** |
| 3 | Vol-R por continuidad (ml) | `vr_cont` | **sí** |
| 3 | FR por continuidad (%) | `im_fr_cont` | **sí** |

**Qué se REUSÓ y qué nació.** De los seis de la columna 3, **tres ya existían** —`im_eroa_cont`,
`vr_cont` e `im_fr_cont`, que estaban en esa misma columna con otro rótulo— y se **reubicaron**;
`vm_lat` también existía y **bajó de la columna 3 a la 1**, porque no es un resultado de ninguno de
los dos métodos sino el **volumen de base** que los dos usan, y sus dos insumos son las casillas que
tiene justo encima. Los otros cuatro nacen en esta tanda.

⚠️ **Los dos insumos del TSVI (`im_dtsvi`, `im_itv_tsvi`) siguen OCULTOS y fuera de las columnas**
desde el 2026-10-10 — ver su comentario en el marcado. No se tocaron.

⚠️ **El rótulo de las seis casillas de la columna 3 lleva el MÉTODO.** Antes decían «Vol-R (ml)
(auto)» y «FR — Fracción regurg. (%) (auto)» a secas, en una columna que publicaba sólo la
continuidad. Con los dos métodos a la vista, un rótulo sin método no distingue cuál de los dos
números se está mirando.

---

## 2 · Las cinco casillas automáticas nuevas — dueño único y qué NO hacen

**Dueño: `_imAutosSync`** (las cuatro de la IM) y la rama de `calcEM` (la del volumen eyectado).

⚠️ **NINGUNA CALCULA NADA.** Cada una **COPIA el texto** que su fila del cuadro de referencias acaba
de publicar. El ayudante es **`_imAutoDeFila(idCampo, idSpan, falta)`**, y el mapeo es:

| Casilla | Fila que copia |
|---|---|
| `vauto-eroa-pisa` | `eroa-val` |
| `vauto-volr-pisa` | `volr-val` |
| `vauto-fr-pisa` | `freg-val` |
| `vauto-jet-ai` | `im-jet-ratio` |
| `vauto-vsv-tsvi` | `vsvtsvi-val` (la escribe `calcEM` desde `_vsTsviCalc`) |

Copiando el **string**, la casilla y la fila **no se pueden desincronizar** — ni en el valor, ni en
la marca «(revisar)», que viaja pegada al número.

⚠️ **LA LEYENDA DEL RÉGIMEN PROTÉSICO DEL JET SE RECORTA, y no es cosmético.** La fila publica
`45.0%  (Variable — no gradúa en prótesis)`: eso es una afirmación sobre la **banda** en que cae el
número, o sea graduación, y la casilla publica la **medición**. El corte es por **DOS espacios**, que
es exactamente como esa fila separa su leyenda; `MARCA_REVISAR` lleva **un solo** espacio
(`' (revisar)'`), así que **sobrevive al recorte** — que es lo que tiene que pasar, porque es una
advertencia sobre el número y no sobre su banda.

**El centinela es el mismo «—» de las filas**: con la fila vacía la casilla queda vacía y lo que se
ve es el `placeholder` «requiere …». Sin ese mapeo la casilla publicaría un guión largo, que en un
campo de formulario se lee como un valor.

⚠️ **NO VIAJAN CON EL ESTUDIO.** El prefijo **`vauto-`** entra en `_noEsDelEstudio`, por el mismo
motivo que `hfpep-`: persistir una copia de lo que ya tiene dueño deja dos versiones que al reabrir
pueden contradecirse, y serían cinco claves nuevas en todo estudio guardado desde hoy. **Medido: 893
campos del estudio, mismo hash y mismo juego de claves que HEAD, con cero claves `vauto-`.**
Guión **MEDIO**, así que el prefijo no alcanza a ningún campo del estudio, que van con guión bajo.

**No votan, no cambian ningún grado y no agregan una columna de Excel** (sigue en **436**).

---

## 3 · El cuadro de referencias, en tres bloques

Se cuentan por **atributo** (`data-im-bloque`) y no por el texto de un rótulo — la lección que el
panel de Evidencia pagó con sus `<details>`.

- **bloque 1 · signos y semicuantitativos, una columna, valen para los dos métodos:**
  `im-ondae-interp` · `im-vti-ratio` · `im-vc-ref` · `im-jet-ratio` · `im-onda-s-interp`.
- **bloque 2 · cuantitativos, DOS columnas:** tabla `.calc-row.im-m2` con PISA (`eroa-val`,
  `volr-val`, `freg-val`) y continuidad (`im-eroa-cont-ref`, `im-volr-cont-ref`, `im-fr-cont-ref`),
  cada celda con su valor **y su grado**; debajo, en una sola columna, los dos volúmenes de base
  comunes: `im-vmlat-ref` (fila **nueva**, espeja `vm_lat`) y `vsvtsvi-val` (la de siempre).
- **bloque 3 · integración:** `im-sev` · `im-sec-aviso` · `im-discordancia` · `im-cont-severidad`.

⚠️ **LAS FILAS DE LA TABLA LLEVAN LAS DOS CLASES, `calc-row im-m2`.** El barrido de `limpiarCampos`
es `.calc-box .calc-row span[id]:not(.calc-lbl)`: **sin `calc-row` los seis números del bloque 2
dejarían de volver a «—» con «Nuevo estudio»**, que es el número rancio que esta zona ya pagó cuatro
veces. La regla `.im-m2` va **después** de `.calc-row` en la hoja, así que su `display:grid` le gana
al `display:flex` por orden y sin `!important`.

⚠️ **LOS `id` DE LOS SPAN DE PISA NO SE TOCAN.** `eroa-val`, `volr-val` y `freg-val` son
**literalmente** lo que `_imPdfPisaTxt` publica en el papel y lo que `_imPisaSellar` congela en el
estudio. Moverlos de contenedor es lo único que se les hizo.

**El grado de la columna de continuidad lo pinta el MISMO pintor.** `sevFilaGradoPintar` ganó un
tercer argumento **opcional** (`soloGrupo`): sin él se saltean los votos de continuidad —que es lo
que hacía—, y con `'cont'` se saltean todos los demás. El segundo mapa es `IM_FILA_GRADO_CONT`.
`imGradoFilasPintar(votos, votosCont)` recibe `_imCont` aparte **porque esos votos no siempre están
en `params`**: `calcIM_ESC` sólo los concatena cuando el método está incluido en el informe, y el
grado de la fila se muestra igual —como el de PISA—. Sin eso, las dos columnas dirían cosas distintas
según una casilla de impresión.

**LA LÍNEA DE FÓRMULAS SALIÓ** de debajo del cuadro: pasa a las tarjetas de los globos.
**La cápsula «Severidad (continuidad)» SE CONSERVA** y subió al bloque 3. **No es redundante** con el
bloque 2: ahí va el grado de **cada parámetro** y acá la lectura **volumétrica combinada** más sus
dos avisos —«No valorable — revisar mediciones» y «Fuera de rango: …»—, que **no tienen otra
superficie**. Conserva su `id`, su estilo en línea y su `dataset.gradoVolum`, que es lo que lee
`imDiscordanciaPintar`.

---

## 4 · La columna 2 de la estenosis mitral

`#bloque-em-detalle` → `.valv-cols-3`, columna 2, **cuatro** campos en este orden:
`em_dtsvi` (Diám. TSVI ↔ AI/VI) · `em_vtitsvi` (VTI TSVI ↔ Doppler) · **`vauto-vsv-tsvi`
(Vol eyectado TSVI, NUEVO, automático)** · `em_thp_display` (THP ↔ Doppler mitral).
Los dos insumos primero, su producto después y el THP al final, que abre la otra vía de área.
**El VTI Ao no estaba en esta lesión y sigue sin estar.** Las dos sincronías se mantienen.

⚠️ **LA CASILLA SE ESCRIBE ANTES DEL ÁREA Y CON SU PROPIA GUARDA**, porque sus insumos son **dos** y
los del área son **tres**: con el VTI mitral sin cargar el área no se puede calcular pero el volumen
eyectado sí, y esconderlo mandaría a buscar un dato que ya está.

### `_vsTsviCalc(dMm, vtiCm)` — un solo dueño

`π·(d/20)² · vti`, con el diámetro en **milímetros**. El `/20` hace las dos cosas en un paso —la
mitad para el radio y la décima para pasar a cm—, así que es **exactamente `(π/4)·(d/10)²`**, que es
la forma en que la guía lo escribe (EAE/ASE 2009, folio 13).

⚠️ **ESTA EXPRESIÓN VIVÍA DUPLICADA EN DOS LUGARES** a ocho mil líneas de distancia: `calcIM_ESC`
para la fila «Vol eyectado TSVI» y `calcContIM` para el Vol-R por continuidad; `calcEM` tenía la
tercera dentro del AVm por continuidad. Con la casilla habrían sido cuatro. **El orden de las
operaciones se conserva letra por letra** para que el resultado en coma flotante sea el mismo bit a
bit. **Medido: cero diferencias en el AVm por continuidad, el Vol-R y la FR.**

⚠️ **NO SE TOCÓ** la copia de `calcIA_ESC` (insuficiencia **aórtica**) ni la del AVA aórtica por
continuidad: son otra lesión y van en D2.

---

## 5 · Los globos «ⓘ» de la pestaña — mecanismo

**Doce** globos en `#tab-valvulas`, todos `<button class="vinfo-btn" data-vinfo="CLAVE">`.
Una **sola** tarjeta, `#vinfo-card`, en el **marcado estático**; cuál está abierta lo dice `_vInfoId`.

| Clave | Dónde | Tarjeta |
|---|---|---|
| `prot-eoa`, `prot-dvi`, `prot-ppm` | prótesis mitral | legado, D2 |
| `eroa-pisa` | col 3 de la IM | **nueva** |
| `eroa-cont` | col 3 de la IM | **nueva** |
| `im-onda-e`, `im-vti-ratio`, `im-vc`, `im-jet-ai` | cuadro de la IM | legado, D2 |
| `vsv-tsvi` | col 2 de la EM | **nueva** |
| `avm-thp`, `avm-cont` | col 3 de la EM | **nuevas** |

**Cómo se opera:** un toque abre, otro toque cierra, tocar afuera cierra, Escape cierra. Son
`<button>`, así que se enfocan y se activan con teclado sin inventarles `tabindex`.
**Cero `title`** —el único camino por el que algo aparecía al hover— y **cero `abrirAyudaEco`**.

**El registro `VINFO`** tiene **cinco** entradas, una por tarjeta nueva, con a lo sumo cuatro bloques
cortos: `formula`, `lee`, `fuente` y —sólo si cambia cómo se interpreta el número— `ojo`.
**Los siete de legado no están en el registro**: su tarjeta muestra el `title` que su fila ya tenía,
**leído del DOM** por `_vInfoLegadoTxt`, así que no se duplica una palabra. Se reescriben en D2.

**Dónde quedó el texto largo que se sacó.** El `title` de 748 caracteres de la EROA por continuidad
—la historia de desde cuándo vota y la aritmética de los 150 cm— **no se perdió**: vive, y ya vivía,
en la pestaña **«Referencia clínica»**, fila **«IM — EROA por continuidad y Vol-R»**. La tarjeta
**no** lleva a esa pestaña.

### Las trampas, medidas

⚠️ **LA TARJETA MÁS LARGA TAPABA SU PROPIO GLOBO.** Con el tope de altura en la caja entera, una
tarjeta más alta que la pantalla terminaba colocada arriba de todo y cubriendo su ancla: el **segundo
toque** —una de las tres formas de cierre— no llegaba al botón. Escape y el clic afuera sí cerraban,
así que no dejaba a nadie encerrado, pero una de las tres puertas no funcionaba. **La altura se acota
al hueco del lado donde se abre**, así que nunca cubre su ancla; lo que no entra scrollea adentro.

⚠️ **EL GLOBO VIEJO MEDÍA 12×15 px Y NO 44×44.** La regla global de accesibilidad
(`button, …, [onclick] { min-height:44px; min-width:44px }`) lo matcheaba por su atributo `onclick`
**y no lo agrandaba**: era un `<span>`, o sea un elemento **inline** no reemplazado, y a ésos
`min-height` y `min-width` **no se les aplica**. Un `<button>` es `inline-block`, así que la misma
regla sí lo agarra y el globo saltaba a 44×44 en ocho filas. El piso se acota a `pointer: coarse` —el
precedente del glosario del panel—: el escritorio queda en **16×12** y el dedo gana los 44 px que el
`<span>` **nunca tuvo**. Es `pointer` y **no** `any-pointer`: con `any-pointer`, una tablet con un
mouse conectado perdería el piso para el dedo.

⚠️ **LA TARJETA VA EN EL MARCADO ESTÁTICO Y CUELGA DEL `body`.** El `MutationObserver` del bloque de
accesibilidad trata como **modal** a cualquier `<div>` **agregado** con `position:fixed` y `top:0`; y
un ancestro con `transform` es bloque contenedor de un `position:fixed`, así que el rect del botón
—que es del viewport— y la posición de la tarjeta dejarían de estar en el mismo sistema.

⚠️ **`role="dialog"` SIN `aria-modal`**, a propósito: con `aria-modal` el oyente genérico de Escape de
esta app la cerraría clickeándole un botón que dice «Cerrar», que esta tarjeta **no tiene**, y además
entraría en la trampa de Tab del panel. Su Escape es el suyo.

⚠️ **EL CIERRE POR AFUERA VA EN CAPTURA Y DESCARTA EL CLIC QUE ABRE** (`closest('[data-vinfo]')`):
sin eso, el mismo clic que activa el globo llega al documento y cierra lo que se acaba de abrir.

⚠️ **UN GLOBO SIN GEOMETRÍA NO ANCLA NADA, y eso es lo correcto.** Los tres de la prótesis existen y
miden **0×0** mientras la morfología mitral no sea protésica: anclar contra ese rect mandaría la
tarjeta a la esquina de la pantalla. `_vInfoColocar` devuelve `null` y no se abre. **Al medir, correr
una escena protésica aparte**; si no, «no abre» se lee como «el mecanismo no funciona».

---

## 5b · El aviso de FIBRILACIÓN AURICULAR de la continuidad (W1-7, 2026-10-15)

**La fuente.** EAE/ASE 2009, **folio 14, §B.1.4** —folio comprobado en el pie impreso de la página
(«14 · Baumgartner et al»)—, literal: *«The continuity equation cannot be used in cases of atrial
fibrillation or associated significant MR or AR»*. La app retiraba el voto por las **dos
regurgitaciones** (`emContMotivoNoVota`) y **no miraba el ritmo**: medido en HEAD con un gesto real
sobre `#diast_ritmo`, el área por continuidad votaba idéntico en los dos ritmos (0,93 cm²,
categoría «severa», informe «con estenosis significativa (AVm 0.93 cm² por continuidad)») y
`#em-cont-aviso` quedaba vacío en los dos.

**Decisión de Maicol (15/10/2026): entra sólo el cartel.** No se retira el voto, no se mueve el
grado y no cambia una letra del informe, del EN SUMA, del PDF, del PPT, del Laboratorio ni del
Excel.

### Los dueños, por nombre

| Pieza | Qué hace |
|---|---|
| `EM_CONT_FA_TXT` | el texto, en palabras propias, con la guía y el folio |
| `emContRitmoFA(src)` | ¿el ritmo efectivo es fibrilación auricular? |
| `emContAvisoFA(src)` | el texto o cadena vacía |
| `emContFaAvisoSync()` | **el único escritor** del nodo `#em-cont-fa-aviso` |

⚠️ **EL TEXTO NO VA DENTRO DE `emContMotivoNoVota`, Y ÉSA ES LA DECISIÓN DE FONDO.** Esa función es
la dueña de `emContValido`, o sea de **quién vota**: sumarle una condición habría cambiado el grado
y el papel firmado. Son dos preguntas distintas con dos dueños y dos nodos.

⚠️ **EL SPAN ES HERMANO DE `#em-cont-aviso` Y NO UN HIJO SUYO.** `limpiarCampos` barre
`[id$="-aviso"]` con `el.textContent = ''`: un hijo adentro se **destruiría** en el primer «Nuevo
estudio» —el nodo desaparece, no se vacía— y no volvería nunca. Van los dos en la **misma**
`.calc-row`, así que no se agrega un renglón.

⚠️ **EL COLOR ES `--orange` Y NO `--amber`.** Medido computado en los dos temas: `rgb(245,158,66)`
de noche y `rgb(217,123,31)` de día, idénticos a `#diast-excl-aviso`, que es el control.
`getPropertyValue('--amber')` devuelve **cadena vacía** en este nodo —esa variable se define sólo
dentro de `.amilo-root` y de `#sp-root`—, así que con `--amber` el aviso se habría visto **gris**:
es el defecto que la tanda D2 cerró en cinco avisos.

⚠️ **EL RITMO ENTRA POR `src`, REPITIENDO LA CASCADA DE `hfRitmoEfectivo()`** (el `hf_ritmo` fijado
a mano gana; si no, manda `diast_ritmo`). `emContMotivoNoVota(src)` tiene fuente inyectable porque
la consumen el Laboratorio y la fila del Excel sobre `inf.campos` de un estudio archivado; leyendo
el DOM a secas, la pantalla y el libro dirían cosas distintas sobre el mismo paciente el día que
alguien lo consuma desde allá. Hoy **ningún** consumidor pasa `src`: queda declarado.

⚠️ **EL INSUMO VIVE EN OTRA PESTAÑA Y SU `onchange` NO PASA POR `calcEM`.** `#diast_ritmo` está en
el cuadro de función diastólica del Doppler mitral y llama a `calcDiastol` y a `hfRitmoCambio`. El
cartel lleva **tres columnas**: la llamada desde `calcEM` (después del motivo, porque el separador
` · ` se decide leyendo si el motivo tiene texto), un **oyente de documento** sobre `change` de
`diast_ritmo` y de `hf_ritmo`, y la entrada en `RECALC_MODULOS`. La cuarta no hace falta: el
barrido de `limpiarCampos` ya le vacía el texto y el nodo no tiene `display` que reponer.

### La tabla medida

| Ritmo | AVm por continuidad | Aviso de FA |
|---|---|---|
| sinusal | 0,93 cm² | — |
| sinusal | sin calcular | — |
| **fibrilación auricular** | **0,93 cm²** | **sale** |
| fibrilación auricular | sin calcular | — |

**Se suma sin pisar:** con IM moderada y FA se leen **los dos** textos en el mismo renglón,
separados por ` · `; en sinusal el motivo de la regurgitación se lee solo. Y el voto, el grado, la
categoría, la pastilla, las líneas de la mitral del informe, su EN SUMA y el Excel en **436**
columnas salen **idénticos** en los dos ritmos.

⚠️ **AL MEDIR, NO COMPARAR EL INFORME ENTERO ENTRE LOS DOS RITMOS.** Cambiar el ritmo mueve la
**función diastólica** —otra rama de la guía, otras frases—, así que exigir el informe completo
idéntico pone la condición en rojo por un párrafo que esta tanda no toca y que **debe** cambiar con
el ritmo. La primera versión de TC-473 lo hizo y salió en rojo por eso.

⚠️ **LA ESC/EACTS 2025 NO CONTRADICE NADA**, censado el PDF completo: sus tres menciones de la
ecuación de continuidad hablan de flujo transmitral aumentado por IM (Tabla 9, pág. 55:
*«Continuity equation unreliable (increased transmitral flow)»*) y de flujos desiguales en
valvulopatía múltiple; **ninguna nombra la fibrilación auricular** para el área mitral.

⚠️ **CON PRÓTESIS MITRAL EL AVISO TAMBIÉN PUEDE SALIR, y se dejó así.** Si alguien carga los tres
insumos de la continuidad sobre una prótesis, el área se calcula y el cartel aparece: la salvedad es
del **método** y la cápsula protésica lee esa misma continuidad. No cambia nada de la prótesis
—medido: con prótesis y FA el grado queda en el centinela, la cápsula sigue diciendo «No graduada» y
el informe no afirma estenosis— y queda declarado.

## 6 · Cómo medir esta zona

**Arnés: `scripts/_probe_imcols.mjs`** (A/B de solo lectura con `--file`), ocho grupos:
`campos` · `autos` · `refs` · `globos` · `em` · `superficies` · `controles` · `ancho`.

⚠️ **`im_vc` VIVE DETRÁS DE DOS PUERTAS Y LOS NOMBRES NO COINCIDEN:** el contenedor oculto es
`#bloque-insuf-mitral` y el `onclick` dice `valvDatosTog('caja-insuf-mitral')`; y arriba hay otra,
`#ete-seccion-valv-mitral`, que abre `toggleEteSeccion('valv-mitral', this)` —con la coma y el
`this`, así que buscar el literal con paréntesis cerrado tampoco matchea—.

⚠️ **`showTab('valvulas')` CIERRA LO QUE EL CLIC ACABA DE ABRIR** (corre `valvCerrarTarjetas`): se
llama **sólo si la pestaña no está activa**.

⚠️ **EL HASH DE LOS CAMPOS SE ORDENA ANTES DE HASHEAR.** El objeto se arma en **orden del DOM**, así
que **mover un campo de columna** —que es la mitad de esta tanda— cambia el string de JSON sin
cambiar un solo valor: la primera corrida informó «893 campos iguales, hash distinto» y el hash era
el único que hablaba.

**Cobertura: TC-471**, **45 condiciones**, con seis denominadores y cuatro controles negativos.
**Verificado que sabe fallar contra HEAD en un worktree aparte: 32 de las 45 en rojo, y NINGUNA por
excepción** —las trece que pasan son lo que esta tanda no mueve—. ⚠️ Su primera versión **sí** moría
por excepción (`.placeholder` sobre `null`), que prueba que el árbol es distinto y no que el caso
sabe medir: toda lectura de un nodo nuevo va por un ayudante con centinela.

⚠️ **TC-471 CARGA CON `__t.set` Y NO CON TECLAS DE CDP**: el cuerpo corre dentro de la página. Las
mismas escenas van con **teclas y clics reales** en la sonda. Mismo reparto que TC-460 y TC-469.
