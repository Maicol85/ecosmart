# La tanda PANT-6 — la pantalla de CIA y CIV, el dibujo del VD, el molde de la Evidencia, la mitral del ETE y los criterios TEER

Mapa de la tanda **PANT-6** (2026-11-03). Como todos los mapas de este repositorio, va **por
nombre de función y de constante, no por número de línea**: la línea cambia en cada edición y el
nombre no.

---

## 1 · La pantalla de «CIA / CIV» — los botones dejaron de decidir la maqueta

**DECISIÓN DEL MÉDICO (03/11/2026).** La lógica anterior no tenía sentido y él la midió: apagar la
CIV dejaba los dos paneles, y apagar la CIA escondía los campos de la CIV pero dejaba los de la
CIA. Hoy **no hay ninguna lógica de maqueta**: la CIA siempre a la izquierda, la CIV siempre a la
derecha, todos los campos siempre habilitados, y **el botón de cada lesión decide UNA sola cosa**,
si esa lesión entra al informe.

- **`eteShuntPanes()`** es el dueño, y su cuerpo entero son dos líneas que ponen `display = ''` en
  los dos paneles. No lee ninguna casilla.
  ⚠️ **No se borró la función** aunque hoy no decida nada: la llaman cinco rutas —`eteShuntSync`,
  el toggle, la restauración de un estudio, el cambio de sub-pestaña y `limpiarCampos`— y dejarla
  como punto único es lo que impide que una de ellas vuelva a inventar su propia regla.
- **`eteShuntSync`** perdió el bloque que ponía y quitaba la clase `dos` en la fila. Esa clase era
  el otro dueño de la maqueta: con dos dueños, el panel y la fila podían discrepar.
- **La maqueta.** `#ete-shunt-fila` es una grilla de **una** columna y de **dos** desde 900 px
  (`@media (min-width:900px)`), con el corte **sobre la ventana** y no sobre el contenedor, que es
  la regla fija de la casa. Dentro, `#ete-shunt-pane-cia` y `#ete-shunt-pane-civ` son
  `.ete-shunt-cuadro`: borde de **2 px** en `var(--accent)`, radio 12, relleno 12.
- **Cada botón vive DENTRO de su cuadro**, en un `.subtabs-wrap.cc-lesbar.ete-shunt-btnbar` —el de
  la CIA alineado a la izquierda, el de la CIV a la derecha—. Sigue siendo un `.cc-lesbar`, que es
  de donde cuelga su pintado: sacarlo de esa clase lo deja sin color de estado.
- **Las dos columnas internas** de cada cuadro son `#ete-cia-cols` y `#ete-civ-cols`, de **una**
  columna y de **dos** desde **1140 px** —el ancho del cuadro, no el de la ventana, es la mitad de
  la fila—. La columna 1 de la CIA lleva tipo, tamaños y shunt más la **tarjeta de detalle del
  diagrama**; la columna 2, los cinco bordes, el **diagrama** y su leyenda.
- **El tercer cuadro, `#ete-shunt-comun`**, va **FUERA** de la fila, a todo el ancho, con la clase
  `.ete-shunt-cuadro-fino` —borde de 1 px— y su título «Cuantificación del shunt — común a CIA y
  CIV». Adentro, `#ete-shunt-comun-cols` reparte en dos bloques desde 900 px: el Qp/Qs con sus
  cuatro insumos (`ete_shunt_tsvi_ro`, `ete_shunt_vtitsvi_ro`, `ete_shunt_tsvd_ro`,
  `ete_shunt_vtitsvd_ro`) y el DDVI indexado con sus dos (`ete_shunt_ddvi_ro`,
  `ete_shunt_asc_ro`).
- **La PSAP por insuficiencia tricuspídea se dejó de repetir.** Estaba en los dos paneles
  (`ete-cia-paps-it` y `ete-civ-paps-it`); con los dos cuadros a la vista siempre, el mismo valor
  salía dos veces en la misma pantalla. Se retiró **el de la CIA** y quedó el de la CIV.
- ⚠️ **UN DEFECTO PREEXISTENTE QUE LA MAQUETA NUEVA CIERRA DE PASO, y está medido.** El cuerpo del
  acordeón recortaba entre **116 y 389 px** de contenido, porque `max-height` se congela al abrir
  y la maqueta vieja crecía después. La disposición nueva no recorta en ninguno de los cuatro
  anchos.
- **El papel no se movió, y es por construcción:** la compuerta de emisión sigue siendo el dato de
  presencia de cada lesión (`ete_cia_activa` / `ete_civ_activa`), que es lo único que el botón
  toca. **TC-644 (G2)/(G3)** lo fija por los dos lados.

---

## 2 · El dibujo de sobrecarga del VD — de 110 px a 520, y la letra de 2,6 px a 12,26

**El defecto que PANT-5 declaró en P5-c y esta tanda cierra.** El dibujo medía **110 px** al lado
de los campos y su tipografía salía en **2,6 px**, muy por debajo del piso de 12 px de esta casa.
**La causa era el tamaño, no el rótulo** —PANT-5 ya lo había medido—, así que esta tanda no toca
una línea del dibujo: sólo su ancho y la maqueta de la sección.

- **`#vdsc-svg`** pasa a `width:100%; max-width:520px; margin:0 auto`. El **520** es una medición y
  no una preferencia: la tipografía del SVG escala con su ancho, y el mínimo para que el rótulo
  más chico llegue a 12 px es **509 px**. Con 520 sale en **12,26**.
- **`#vdsc-fila`** es `display:block` por omisión y una grilla de
  `minmax(0,55fr) minmax(0,45fr)` desde **900 px**, con el corte sobre la **ventana**.
  - `#vdsc-campos` → columna 1, fila 1. Sus campos van en **dos columnas angostas**.
  - `#vdsc-lista` → columna 1, **fila 2**: la lista de criterios bajó debajo de los campos.
  - `#vdsc-caja` → columna 2, **filas 1 y 2** (`grid-row:1 / span 2`): el dibujo abarca el alto de
    las dos.
  - El orden en el DOM es **campos → dibujo → lista**, que es lo que deja la lista debajo de los
    campos sin un `order` que la grilla pueda contradecir.
- ⚠️ **EL ESQUEMA VALVULAR 2D NO HEREDA ESE ANCHO, y es el control negativo de esta parte.** Son
  dos reglas distintas (`#v2d-svg` y `#vdsc-svg`) sobre dos SVG distintos, aunque el dibujo del VD
  haya nacido midiendo la mitad del esquema. **TC-645 (F2)** lo fija.
- **Sigue siendo de SOLO LECTURA**, que es la garantía que PANT-5 midió y que esta tanda no toca:
  cero campos del estudio movidos tras seis sincronizaciones.
- ⚠️ **`vdscRotulos()` NO EXISTE.** Un comentario de la zona la nombra como «la que elige el
  rótulo largo o el corto» y en todo el archivo no hay ninguna función con ese nombre: el reparto
  lo hace `ROT` dentro del propio pintor. Declarado y **no tocado**.

---

## 3 · El molde de las secciones de válvula del panel de Evidencia

**DECISIÓN DEL MÉDICO (03/11/2026), con esquema aprobado.** Las secciones de válvula pasan a una
disposición nueva, de arriba abajo:

1. **Franja ámbar** con la **categoría que publica el informe** y el **estadio** de la guía, lado
   a lado. `.ind-franja` / `.ind-franja-cat` / `.ind-franja-est`.
2. **Franja de datos del estudio**, en tarjetas. `.ind-datos` / `.ind-dato` / `.ind-dato-lbl`.
3. **Las preguntas, agrupadas por tema**, en **dos** columnas con más de 6 y en **una** con seis o
   menos. `.ind-pregcols`, y `.ind-pregcols-1` para la de una sola.
4. **La tabla de recomendaciones al pie**, con el estado de cada fila.

### Las piezas, y cuál es el dueño de qué

- **`_indMoldeHTML(m)`** emite la franja, los datos y las columnas. Es el único lugar donde el
  molde se dibuja.
- **`_indMoldeHTMLSec(r, compacta)`** lo envuelve con la prosa del bloque **entre los datos y las
  preguntas**: su aviso —«hay N contraindicaciones de la comisurotomía»— cambia cómo se leen las
  preguntas y la tabla que vienen después, así que leerlo al final sería leerlo cuando ya no sirve.
- **`_indSecPie(h, r)`** se extrajo del cuerpo viejo para que el camino del molde y el de siempre
  cierren la sección con **las mismas** piezas: la bibliografía, la alarma y el pie. Dos cierres
  escritos a mano divergen.
- **El despacho es una línea** en `_indSecHTMLCuerpo`: `if (r.molde) { … return _indSecPie(h, r) }`.
  Una sección sin `molde` sigue por el camino de siempre, **sin tocarlo**.
- **`_indColsSync`** escribe además **`data-ind-ancho`** en la tarjeta: `xl` desde 1100 px, `md`
  desde 620, `sm` por debajo. Lo usa la franja de datos para elegir cuántas tarjetas por fila.
  El corte sigue siendo el ancho del **PANEL** y no el de la ventana (`IND_COLS_CORTE`, 900 px),
  por el motivo de siempre: el panel sin maximizar mide 820 px tanto a 1440 como a 1000.
- **El estadio salió de la lista de filas.** Antes era una fila más entre las preguntas; hoy vive
  en la franja. ⚠️ **No se duplica, y hay que verificarlo:** `_indEstSint` lee **la misma**
  respuesta que la pregunta de síntomas, así que la franja y la pregunta no pueden discrepar.
- ⚠️ **EL ESTADO CORTO SE CORTA EN ` · ` Y NO EN EL GUIÓN LARGO, y lo decidió un caso.** Con el
  guión, la fila «> 1,5 cm² — contraindicación del procedimiento» se quedaba en «> 1,5 cm²» y la
  tarjeta perdía qué significa el valor. **TC-328** mide exactamente eso.
- ⚠️ **LA FRANJA SE LLEVA LA FILA DEL GRADO ENTERA —valor, nota y citas— y no sólo su valor.**
  Filtrar la fila y dejar sus corchetes afuera **renumeraba la bibliografía de la sección**: la
  numeración es por primera aparición dentro de la sección, así que la AHA pasaba de `[2]` a `[3]`.
  Lo cazó **TC-339**.
- ⚠️ **EL ÁMBAR ES `--text` / `--text2` Y NO `--orange`.** Medido: sobre el fondo ámbar de la
  franja, `--orange` da **2,48:1** en el tema claro, por debajo de cualquier piso legible.

### La pregunta de síntomas — el defecto que el médico reportó

**Con la etiología «Calcificada» la estenosis mitral no tenía NINGUNA pregunta de síntomas.**
Vivía dentro del bloque de contraindicaciones de la comisurotomía, que sólo se pinta con etiología
reumática o sin consignar. Hoy vive en **`fSx`**, una lista propia que el molde pone **siempre** en
la columna izquierda, y `fClin` ya no la lleva —una sola y sin duplicarse—. La rama sin preguntas
del molde es `[ [ { tit:'Clínica', filas:fSx } ], [] ]`: **la columna de clínica se emite igual**.

**Los seis globos de síntomas** —`emsintomas`, `iasintomas`, `easintomas`, `impsintomas`,
`imssintomas`, `itsintomas`— son términos de `IND_TERMINOS` y se enganchan con
`Object.assign(_indFilaCtrl(…), { term: '<clave>' })`.
⚠️ **La ETIQUETA de cada uno nombra su válvula, y no es prolijidad:** `_indTermHTML` arma el
`aria-label` del botón con ella y **TC-451** exige que los de los términos sean **distintos**,
porque es lo que hace que abrir uno no abra el otro. Con «Qué síntomas cuentan» a secas, dos
globos compartían clave. Lo cazó ese caso.
Qué dice cada uno y de dónde sale, hoja por hoja y folio por folio, está en
`docs/fuentes/FUENTES.md` → «La tanda PANT-6».

### Qué secciones tienen molde

Seis: la **estenosis mitral** (commit 3) y, en el commit 7, la **insuficiencia aórtica**, la
**estenosis aórtica**, las **dos insuficiencias mitrales** y la **tricuspídea**. Cada una lo
declara devolviendo `molde:` en su objeto.
⚠️ **DOS SE PARARON Y SE REPORTARON:** la **válvula pulmonar** (`_indEP`, 4 preguntas) y la
**prótesis mitral** (`_indProtM`, 6). Ver `docs/PENDIENTES.md`. **TC-649 (F1)** es el guardián de
esa parada: el día que entren, se pone rojo.

---

## 4 · La morfología y las mediciones de la mitral, en UNA sección de tres columnas

Las dos secciones del ETE —«Morfología y clasificación VM» y «Mediciones ETE — Válvula Mitral»—
son una sola, `#ete-seccion-morfo`, con `#etem-cols`: **una** columna y **tres iguales** desde
900 px.

| columna | qué lleva |
|---|---|
| 1 | etiología, Carpentier y mecanismo, con la casilla «incluir la morfología» al pie |
| 2 | longitud de los dos velos y las dos áreas |
| 3 | altura y ángulo del tenting, profundidad de coaptación y diámetro anular, con la casilla del módulo al pie |

- **`ETE_SEC_ALIAS = { 'mediciones-mitral': 'morfo' }`**, resuelto en la primera línea de
  `toggleEteSeccion`. ⚠️ **Sin ese alias, las llamadas viejas serían un no-op SILENCIOSO**: tres
  casos de la suite y cuatro sondas abren esa sección por su nombre anterior, y un `toggle` sobre
  un id que no existe no avisa.
- **Las dos casillas siguen siendo dos mecanismos distintos** y no se unificaron: la de morfología
  es un `checkbox` (`ete_morfo_incluir_chk`) y la de las mediciones es una entrada del registro de
  módulos integrados (`data-am-k="etem"`). Son dos decisiones del médico sobre dos contenidos.
- **El cuadro «características desfavorables para la reparación»** (`#etem-desfav`) va **a todo el
  ancho**, debajo de las tres columnas, con sus seis filas intactas.
- **El dibujo NO se funde**, que es lo que la orden fija: `#m3d-fila` se queda en su sección propia.
- ⚠️ **UN `</div>` DE MÁS COSTÓ UNA MEDICIÓN.** El cierre de la `grid-3` original ya cerraba
  `#etem-g1`, así que el cierre extra sacaba las columnas 2 y 3 **fuera** de `#etem-cols`: el
  reparto daba −1 y la sección medía 874 px. Es el mismo modo de falla que PANT-3 pagó con el
  módulo de arritmia.
- **La sincronía de los velos de PANT-5 sigue viva en los dos sentidos** (`etemVeloGesto`), y
  **TC-647 (H1)/(H2)** la mide.

---

## 5 · Los criterios TEER — la IM primaria y la secundaria, lado a lado

**DECISIÓN DEL MÉDICO.** Los dos tipos de insuficiencia mitral dejan de alternarse: los dos
cuadros se ven **siempre**, con todos sus campos habilitados, en los tres valores del selector
—vacío, primaria y secundaria—.

- **Tres filas.** `#teer-arriba` con la franja común (tipo de IM, área mitral, PSAP);
  `#teer-medio` con los **dos cuadros** `.teer-cuadro`; `#teer-abajo` con los **criterios comunes**
  a la izquierda y la **conclusión** a la derecha. Las dos últimas reparten en **dos columnas
  iguales desde 900 px**; dentro, `#teer-comunes-cols` y `.teer-g2` pasan a dos desde **1140 px**.
- **Lo que se retiró son DOS líneas, y están comentadas y no borradas**:
  `_mostrar('teer-bloque-primaria', !r.esSec)` y `_mostrar('teer-bloque-secundaria', !r.esPrim)`.
  Dejarlas a la vista con su fecha es lo que impide que alguien las reponga creyendo que faltan.
- **El veredicto no cambió por la maqueta**, y es por construcción: los criterios siguen
  declarando su `tipo` (`prim` / `sec`) y el evaluador sigue aplicando sólo los que corresponden.
  **TC-648 (B1)/(B2)** lo mide con los mismos datos en los dos tipos, y **(B3)** es el control
  negativo —con la IM primaria, un flail gap de 12 mm deja de ser apto—.
  ⚠️ **Y ESE CONTROL HAY QUE MONTARLO CON EL TIPO PRIMARIA PUESTO:** el flail gap es un criterio
  `prim`, así que con la escena de la secundaria cargada no se evalúa y el control pasa en verde
  sobre un veredicto que nada puede mover.
- ⚠️ **LA FRANJA ROSA VACÍA CON UN PARÉNTESIS A LA IZQUIERDA NO SE REPRODUCE COMO DEFECTO, y está
  medido.** Tiene **50 caracteres de texto**, se muestra **sólo** cuando no hay tipo de IM elegido
  —que es su trabajo— y el «paréntesis» es su **borde izquierdo de 3 px**. No se tocó. Declarado en
  `docs/PENDIENTES.md`.

---

## 6 · El Forrester fuera del papel, y los dos rótulos de la profundidad de coaptación

**Cierra lo que PANT-5 dejó parado en P5-b.** La frase de dato faltante del Forrester —«faltan el
índice cardíaco y la presión capilar…»— llegaba al papel por **tres** caminos; PANT-5 cerró el del
SVG y dejó los otros dos declarados.

- **`forrEsFalta(txt)`** es la pieza nueva, al lado de `forrFaltaTxt`: reconoce las **tres** frases
  que ese dueño produce —ninguno, falta el índice, falta la capilar— comparándolas contra lo que
  `forrFaltaTxt` devuelve, **no contra una cadena escrita a mano**. Con el texto copiado, mover la
  redacción de una dejaría el filtro mirando una frase que ya no existe.
- **Sus dos consumidores** son `amiloTextoHemo()` —que alimenta el informe integrado y la hoja del
  PDF— y la fila `_pptSpan` de la diapositiva. Los dos la cambian por cadena vacía.
- **La de PANTALLA se queda**, que es lo que la regla pide: el médico tiene que saber qué le falta.
  **TC-648 (C5c)** lo fija.
- **Los dos rótulos de la profundidad de coaptación.** Eran idénticos en dos secciones y eran **dos
  campos distintos**: `ete_prof_coapt`, factor desfavorable para la reparación con su corte en
  **10 mm**, y `teer_prof_flail`, el criterio **c4** del TEER —que decide APTO / NO APTO— con su
  corte en **11**. Hoy dicen «Profundidad coaptación — **reparación** (mm)» y «Profundidad
  coaptación — **TEER** (mm)».
  ⚠️ **NINGÚN id CAMBIÓ Y NINGÚN RÓTULO DEL EXCEL NI DEL PAPEL TAMPOCO:** la hoja del PDF sigue
  imprimiendo «Profundidad de coaptación» por `_amFila`. Lo único que cambia es la etiqueta visible.
  ⚠️ **Y SIGUEN SIN SINCRONIZARSE, a propósito:** unirlos cambiaría el criterio c4. Es la mitad de
  **P5-f** que esta tanda **no** resuelve. **TC-648 (D5)** es el control negativo.

---

## 7 · Dónde está el resto

| qué | dónde |
|---|---|
| la anatomía de una sección del panel y su catálogo | `docs/mapa/panel-evidencia-secciones.md` |
| el registro de citas, `IND_REFS` y la numeración por sección | `docs/mapa/panel-evidencia-citas.md` |
| los términos del glosario (el ⓘ con tarjeta) | `docs/mapa/panel-evidencia-terminos.md` |
| el dibujo de sobrecarga del VD, su motor y su comparación con la demo | `docs/mapa/pant5-pantallas-vd.md` |
| el Forrester, sus dos cortes y su dueño único | `docs/mapa/c1-hemodinamica.md` |
| los criterios TEER, sus cortes y sus cuatro dibujos | `docs/mapa/mitral-dibujo-estatico.md` |
| la pantalla de CIA y CIV antes de esta tanda | `docs/mapa/pant5-pantallas-vd.md` § 5 |
| las fuentes de los seis globos, hoja y folio | `docs/fuentes/FUENTES.md` → «La tanda PANT-6» |
| los seis casos nuevos | `docs/mapa/tests-fichas-644.md` |
