# Mapa — la pestaña REFERENCIAS: subpestañas, buscador, «Ver referencia» y la tabla de cirugía aórtica

**Tanda «P», 2026-10-18.** Todo lo de acá es **contenido y navegación**: no cambia ningún cálculo,
corte, operador, texto del informe, EN SUMA, PDF ni PPT, y el Excel queda en **440 columnas
idéntico** —medido clave por clave en los siete commits—. El único contenido clínico nuevo es la
tabla de cirugía aórtica, y sale entera de lo que se **vio** en el PDF original.

> ⚠️ **DOS COSAS CAMBIARON EN LA TANDA AJ6 (2026-10-24), y están en
> `docs/mapa/aj6-fallot-pulmon-refs.md`:**
> · **Calculadoras ya no lleva `data-mod`** y Referencias tampoco: las dos dejaron de ser módulos
>   opcionales, salieron de `EE_MODULES` y están siempre visibles, en Modo Básico y en Avanzado.
> · **El buscador tapa las fichas mientras busca**: con texto, el panel del botón activo se
>   esconde y los seis botones quedan sin marcar; tocar un botón o salir del campo los repone y
>   vacía el buscador. El reparto es `_refSubActivar` / `_refBuscLimpiar` / `refBuscar`.

---

## 1 · Las cinco subpestañas

`REF_SUBTAB` es el **dueño único del reparto**. La pestaña no tiene su reparto escrito en el
marcado: `refSubInit()` reubica cada tarjeta al arrancar leyendo esa tabla, así que **el censo de
entradas ES la tabla** y no hay una segunda lista que se separe de ella.

| subpestaña | id | entradas |
|---|---|---|
| 📏 Dimensiones | `dim` | `ai`, `vi2`, `vi`, `vd2`, `ad` |
| 📈 Función | `fun` | `htp`, `tep` |
| 🫀 Válvulas | `valv` | `nativas` (con `im`, `em`, `ia`, `eao`, `it`), `protesicas` (con `pao`, `pm`, `trombo`, `viv`, `endo`) |
| 🩸 Aorta | `ao` | `ao2`, `ao`, `aocx` |
| 🔎 Otros hallazgos | `otros` | `oai`, `burbujas`, `coronarias`, `pericardio`, `cardiotox`, `miocard`, `congenitas`, `formulas` |

**Censo: 30 entradas antes y 30 después de la reubicación** (6 + 2 + 12 + 2 + 8 en el commit 1).
Después, el commit 5 agregó `aocx` (31) y el commit 6 retiró la vieja del VD (**30**).

### Por qué el marcado no se movió
Mover 900 líneas de HTML habría hecho **imposible comprobar que el censo da el mismo conteo**. Con
la tabla, el censo se mide y se audita de un vistazo. Si el JS no corriera, las entradas quedan
visibles debajo de los paneles vacíos: la degradación es «se ve todo», nunca «no se ve nada».

### Tres decisiones de reparto, declaradas
- **`ao2` y `ao` van a AORTA y no a Dimensiones**, aunque la aorta torácica sea una dimensión: la
  orden le da a la aorta su propia subpestaña con sus dos bloques.
- **`formulas` va a «Otros hallazgos»**: no es ni una dimensión ni una función de una cámara. Es el
  cajón que la propia orden prevé para lo que no encaja.
- **`vi` (ASE 2016) va a DIMENSIONES y no a FUNCIÓN**, aunque su segundo bloque sea la diastólica:
  su primer bloque es la **geometría** del VI, que es lo que da nombre al RWT y a la masa, y es lo
  que el buscador tiene que encontrar junto a `vi2`.

### El texto de integración del VAL
Vivía **dentro** del cuerpo plegable de «Válvulas Nativas», o sea que sólo se veía con ese grupo
abierto. `refSubInit` lo muda al final del panel de Válvulas: **mismo nodo, mismas palabras**, a
11 px y `--text2` (`rgb(154,163,188)` de noche, `rgb(91,100,120)` de día).

### Accesibilidad y maqueta
`role="tablist"` / `role="tab"` / `role="tabpanel"`, `aria-selected`, `aria-controls` y **un solo
tab stop** (`tabindex` 0 en la activa, −1 en las otras). Flechas, Home y End mueven entre las cinco
y el foco las sigue. **La barra se desplaza POR DENTRO** (`flex-wrap:nowrap` + `overflow-x:auto`):
con `wrap` los cinco botones envuelven y la pestaña crece en alto; con `nowrap` sin `overflow-x`
desborda el ancho del documento. Medido a 360 px: la barra ocupa 328 px de ancho visible con 556 de
contenido, y la **página no desborda**.

### Rótulos de bloque
`REF_SUB_BLOQUES` pone un rótulo antes de una entrada. Hoy lo usan Aorta (tres) y Otros (tres). Es
texto de **navegación**: ni un corte, ni una cuenta, ni una cita.

---

## 2 · El buscador

Filtra por el **texto completo** de cada entrada —título, parámetro, sigla y valor—. No hay un
índice de palabras clave escritas a mano: sería una segunda copia de cada tabla y se separaría de
ella en la primera tanda que mueva un corte.

### Dos cosas que lo hacen funcionar, y las dos se pagaron midiendo
1. **Las cinco entradas nuevas arman su cuerpo al abrirse** (`evRefPintar`), y la tabla de cirugía
   también (`aoCxPintar`). El índice las **fuerza** antes de leer; si no, buscar «0,42» no
   encuentra la geometría del VI y «Marfan» no encuentra una sola fila de la tabla.
2. **El índice recorre las entradas de cada panel y no las claves de `REF_SUBTAB`**: las cinco
   nativas y las cinco protésicas viven dentro del cuerpo de su agrupador. Con la tabla sola tenía
   20 entradas y «Wilkins» devolvía «Válvulas Nativas» en vez de «EM — Estenosis Mitral».
   **Los dos agrupadores se excluyen por una compuerta ESTRUCTURAL** —«un agrupador es el que
   contiene otra entrada»— y no por una lista: si no, cada coincidencia aparece dos veces.
   **Índice: 28 entradas** (las 30 menos los dos agrupadores).

### La normalización tiene UN dueño
`_refNorm` hace las tres cosas juntas —minúsculas, sin diacríticos (NFD) y **coma decimal a
punto**— para que la consulta y el índice no puedan normalizarse distinto. Las dos formas conviven
en esta app: `ref-vi` escribe «<0.42» y `ref-vi2` escribe «≥ 0,42».

**Medido con teclas reales:** «RWT» y «rwt» → las mismas 2 entradas (`vi` en Dimensiones y
`formulas`); **«0,42» y «0.42» → las mismas 3** (`vi2`, `vi`, `formulas`); «TAPSE» → 4; «wilkins» →
`em`; «onda s» → `vd2`; «xyzqnoexiste» → 0 con el mensaje «Sin resultados para «…». Probá con el
nombre del parámetro, su sigla o su valor.».

### No persiste
El id es `ref-busca`, con guión **medio**, y el prefijo `ref-` entra en `_noEsDelEstudio`.
⚠️ **Eso lo cazó el CONTROL y no la lectura**: sin ese prefijo, el recolector genérico lo tomaba y
los campos del estudio pasaban de 1022 a 1023 — el buscador viajaba con el estudio.
⚠️ **Y el helper `camposGuardados` de las sondas NO sirve para medirlo**: barre `input[id]` sin
pasar por ese predicado, así que mide «campos del DOM». Va con `camposEstudio`, que usa el **mismo**
predicado que `guardarInforme`.

---

## 3 · «Ver referencia» en las tarjetas ⓘ

`VINFO_REF` es el dueño único del mapeo tarjeta → entrada. **39 de las 44 claves** del DOM llevan
botón. No lo decide ningún heurístico sobre el nombre de la clave.

**Las CINCO que no lo llevan, y es porque la entrada NO EXISTE:** `tarj-insuf-pulmonar`,
`tarj-esten-pulmonar`, `tarj-esten-tricuspide`, `et-avt-cont` y `pul-balik`. Referencias no tiene
entrada de insuficiencia ni de estenosis pulmonar, ni de estenosis tricuspídea, ni de la fórmula de
Balik. Crearlas sería contenido clínico nuevo. `PENDIENTES.md` → **P-1**.

Un **assert de arranque** (`_vinfoRefAssert`) exige las dos direcciones: que toda clave exista en
`VINFO` y que su destino exista en el marcado. Sin él, una clave con un typo deja un botón que
lleva a ninguna parte y no se nota hasta que alguien lo toca.

⚠️ **EL BOTÓN SE AGREGA ANTES DE MEDIR LA ALTURA**, y en las dos ramas de pintado de
`_vInfoColocar` (`dyn` por nodos e `innerHTML`): agregarlo después deja la tarjeta colocada con una
altura que ya no es la suya, o sea fuera de la pantalla por el alto del botón.
Va por `window._vinfoPieRef` y con `typeof`, porque vive en otro bloque `<script>`.

**El camino es `refIr(id)`**, el mismo que usa el buscador: activa la subpestaña, abre el agrupador
que la contiene **antes** que la entrada, despliega su cuerpo, desplaza hasta ella y la resalta
cuatro segundos (`.ref-destacada`, con el temporizador guardado en el propio nodo).

**«Volver»** guarda la pestaña y el `scrollY` en memoria (`_refVuelta`) y los repone. ⚠️ El scroll
vuelve **al valor guardado**, y si la página se acortó entre medio queda donde llega (medido:
400 → 94 en Válvulas, 231 → 231 en AI/VI).

---

## 4 · La subpestaña Aorta y la tabla de cirugía

Tres bloques, en este orden: **Dimensiones y nomogramas** (`ao2`) → **Ateroma aórtico** (`ao`) →
**Cirugía de la aorta torácica** (`aocx`).

`ao2` ya traía las **tres gráficas** del nomograma de los senos de Valsalva con su ecuación —
y = 1,02 + 0,98x (SEE 0,18, r 0,93) · 0,97 + 1,12x (0,24, r 0,71) · 1,92 + 0,74x (0,37, r 0,40)— y
el criterio de EcoSmart del seno, con el símbolo **derivado** de `aoSegSim` (**≥ 40 mm**). Medido
por comportamiento: 39 mm no es dilatado y **40 mm exactos sí**.

### La tabla: `AO_CX_T`, doce filas

Columnas: situación · umbral general · con factores de riesgo · clase y nivel · notas · fuente.
Cada fila trae **su tabla de recomendaciones, su folio impreso y su hoja del PDF**.

| situación | general | con factores | clase·nivel | fuente |
|---|---|---|---|---|
| Tricúspide — raíz o ascendente | ≥ 55 mm | — | I · B | T38 · folio 80 · hoja 81 |
| Tricúspide — ascendente tubular, riesgo bajo | > 52 mm | — | IIa · B | T38 · folio 80 · hoja 81 |
| Tricúspide — cirugía valvular aórtica + dilatación | ≥ 45 mm | — | IIa · B | T38 · folio 80 · hoja 81 |
| Tricúspide — cirugía cardíaca NO valvular + dilatación | ≥ 50 mm | — | IIa · C | T38 · folio 80 · hoja 81 |
| Tricúspide — aorta proximal, riesgo bajo | — | ≥ 50 mm con ≥1 factor | IIb · B | T38 · folio 80 · hoja 81 |
| **Bicúspide — diámetro máximo** | ≥ 55 mm | — | I · B | T68 · folio 119 · hoja 120 |
| **Bicúspide — fenotipo de raíz** | ≥ 50 mm | — | I · B | T68 · folio 119 · hoja 120 |
| **Bicúspide — fenotipo ascendente, riesgo bajo** | > 52 mm | ≥ 50 mm con ≥1 condición | IIa · B | T68 · folio 119 · hoja 120 |
| **Bicúspide — cirugía de válvula aórtica prevista** | ≥ 45 mm | — | IIa · C | T68 · folio 119 · hoja 120 |
| Marfan — raíz (senos) | ≥ 50 mm | ≥ 45 mm con factores (IIa, C) | I · B | T62 · folio 114 · hoja 115 |
| Marfan — ascendente, arco, descendente o abdominal | ≥ 50 mm | — | IIa · C | T62 · folio 114 · hoja 115 |
| Arco aórtico aislado, sintomático, riesgo bajo | ≥ 55 mm | — | IIa · B | T39 · folio 81 · hoja 82 |

### La tabla y la pestaña VAB leen el MISMO borde, y se comprueba en vivo
Los umbrales de `vabConclusion` son **literales dentro de esa función**. En vez de copiarlos —que
sería una segunda copia— la tabla los **sondea por sus dos lados** (`_aoCxSondear`) y publica si el
dueño separa ahí. Las cuatro filas de la bicúspide dicen **«La aplicación separa en este borde»**;
el día que alguien mueva ese literal, la tabla deja de mostrar la marca y lo dice.
**No se tocó una línea de `vabConclusion`.**

### El renglón que se retiró
`ref-ao` publicaba «Ao ascendente ≥55mm · ≥50mm con bicúspide/Marfan · ≥45mm Marfan + factores ·
crecimiento >3mm/año». **Tres de esas cuatro afirmaciones estaban mal** contra la guía que el mismo
renglón citaba: el «≥50 con bicúspide» no distingue el fenotipo (en la VAB el ≥50 Clase I es **sólo
el de raíz**), se comía el ≥45 de la cirugía valvular concomitante, y escribía el crecimiento con
`>` donde **las tres listas de esa guía** escriben `≥ 3 mm al año`. No se inventó ningún valor: lo
que se dejó de afirmar es lo que ninguna fuente sostenía.

---

## 5 · La entrada del VD

La vieja (`ref-vd`, «ASE 2015») se **retiró**: publicaba cinco filas tipeadas y **tres ya no eran lo
que la app aplica** desde la tanda VS. La que corresponde es `ref-vd2`, con **46 filas y 12 barras**
derivadas de `ase25Rango`.

| fila vieja, tipeada | lo que el dueño aplica |
|---|---|
| S′ ≥10 / <10 cm/s | `ase25Corte('s_prime','normal')` = **9,5**, en cuatro bandas |
| Área AD ≤18 / >18 cm² | `ase25Corte('ad_area','normal')` = **19**, en `ref-ad` |
| TAPSE ≥17, TAP ≥105, VD basal ≤41 | iguales, pero en cuatro bandas y derivadas |

**No se pierde ningún parámetro**: los cinco están cubiertos entre `ref-vd2` y `ref-ad`.
⚠️ Los tres «<10» que quedan en la pestaña son la EROA de la IM secundaria, la EROA de la IT y el
gradiente medio de la prótesis — censados uno por uno, ninguno del VD.

---

## 6 · Trampas medidas en esta tanda

1. **El helper `camposGuardados` de las sondas no mide «campos del estudio»** (ver §2).
2. **Una vuelta de calentamiento antes de contar nodos**: las cinco entradas nuevas y la tabla de
   cirugía arman su cuerpo la primera vez que se abren. Sin ella, la sonda informó **+82 nodos**
   sobre algo que no acumula ninguno.
3. **`tema()` de la infraestructura toma un BOOLEANO**: pasarle la cadena `'oscuro'` es *truthy*, y
   las ocho celdas midieron el tema claro con la tabla diciendo «el color no cambia».
4. **`\s` y `\(` se cocinan dentro de un template literal**: `\s` llega como la letra `s` y borra
   todas las eses del texto leído («error e tándar»); `\(` deja el grupo del regex sin cerrar. En
   el bloque grande va `String.raw`; en los `ev()` sueltos, doble barra **en el archivo**.
5. **`VINFO` y `AO_SEGS` son `const` de MÓDULO y no propiedades de `window`**: el censo de claves
   sale de los `[data-vinfo]` del DOM, y el criterio del seno se mide por **comportamiento**.
6. **El globo del test de burbuja vive dentro de `#ete-seccion-burbuja`**, que nace cerrada con su
   propio `toggleEteSeccion` y que `puertaDe` no abre: sin eso mide 0 × 0.
7. **Un selector construido con la concatenación DENTRO de las comillas** deja el literal
   « + String.fromCharCode(39) + » adentro y no matchea nada.
8. **Con `scrollY` en 0 en las dos puntas, «volvió a la posición» pasa sin medir nada.**
9. **El acento grave en un comentario mío dentro del cuerpo de un caso o de una sonda**, tres veces.
   Y al limpiarlos de un **rango de líneas** me llevé dos veces lo que abría el cuerpo —y una vez
   líneas del **runner**, 400 después—. `check_backticks.py` da la línea exacta; `node --check`
   apunta a la apertura del template, cientos de líneas antes. **Correr los dos.**

---

## 7 · Cómo medir esta zona

```bash
node scripts/_probe_p.mjs --solo censo,subtabs            # el censo y las subpestañas
node scripts/_probe_p.mjs --solo buscar,verref            # el buscador y «Ver referencia»
node scripts/_probe_p.mjs --solo aorta,vdref              # la aorta y el VD
node scripts/_probe_p.mjs --solo ctrl                     # los controles (A/B contra HEAD)
node scripts/_probe_p.mjs --file /tmp/index.PHEAD.html --solo ctrl   # el lado de HEAD
node scripts/_probe_pwk.mjs --dest /tmp/pcap              # los DOS motores y las 84 capturas
node scripts/test_clinico.mjs --solo TC-502               # la cobertura
```

**Al medir:** el tema se activa con la clase `light-mode` en el elemento raíz y hay que **esperar
una vuelta** antes de leer un color computado. La pestaña Referencias tiene que estar activa y la
subpestaña correcta también: un panel inactivo está en `display:none` y todo lo de adentro mide 0×0.

## La tanda «R» (2026-10-20) — el DOI, las citas y el marcador de criterio propio

El DOI que faltaba (`EV_DOI_ESC2021IC`); `ET_CRIT_FUENTE` nombrando las **tres** guías con su
tabla y su folio, **sin mover un corte ni un operador**; la regla de la prótesis mitral en
`#ref-integracion`; el ancho del jet de la IP pasando a nombrar el **anillo pulmonar**; y la
escala de burbujas con su tabla de cuatro grados y su bloque de fuentes.

**`QV_ECOSMART`** es el prefijo único del marcador, y el chip «CRITERIO DE ECOSMART» sale en los
**tres** lugares donde la app aplica un corte que ninguna fuente publica: el 20-50 % de FEVI del
TEER, los tres cortes del taponamiento y el 5 de la escala de burbujas.

⚠️ **`QV_NOTA['esten:pulmonar']` TUVO QUE SER UNA FUNCIÓN**: nombra `EP_GMAX_NORMAL_MAX`, que se
declara 1700 líneas más abajo, y como valor lanzaba por zona muerta llevándose el `<script>`
entero. Su consumidor la resuelve con `(typeof n === 'function') ? n() : n`.

→ `docs/mapa/tanda-r-referencias.md` §§ 7 y 8.

---

## ⚠️ LA REORGANIZACIÓN DE PESTAÑAS — trabajo «B» (2026-10-21)

Las pantallas de esta zona **cambiaron de lugar**. Nada de lo que este mapa documenta —cortes,
operadores, fórmulas, textos clínicos, ids— se movió; lo que cambió son las puertas:

- **Pericardio y masas** salió de «Otros» a su propia pestaña del rail (`#tab-pericardio`).
- **Otros** quedó con dos sub-pestañas: «Test de burbuja» y «Variantes anatómicas» (el ASIA, las
  seis estructuras normales prominentes y la RAC).
- **El eco pulmonar** —básico y avanzado— quedó en UNA pestaña del rail, y el texto del avanzado
  pasó de una hoja aparte del PDF al **cuerpo del informe**.
- **Calculadoras** es hoy la primera sub-pestaña de **Referencias**.
- **CC frecuentes** y **CC complejas** se abren con un solo botón, «C. Congénitas».
- El **Fonocardiograma** salió de la app (copiado a `docs/para-cardiosalud/fonocardiograma/`).
- La única palabra que cambió es la frase de **Balik**, que ahora nombra la fórmula.

**El mapa de todo eso es `docs/mapa/pestanas-reorganizacion.md`**, con la tabla «qué se movió»,
las tres cosas que `showTab` hace y que condicionan cualquier barra de sub-pestañas, el drawer
móvil y sus `data-mod`, y las seis trampas de medición.

---

## La ficha del TEP — la tanda «C» (2026-10-21)

`ref-tep` vive en la subpestaña **`fun`** y se reescribió entera: cada criterio pasa a una tabla
con su corte y su **fuente con folio**, vistos en el PDF original. Tres afirmaciones que la ficha
**dejó de hacer** porque ninguna fuente las sostiene: el TAPSE en «<17 mm» (ése es el corte de la
pestaña VD), la PSAP en «>35» (la ASE 2025 escribe `>= 35`) y el «mal pronóstico
**independiente**» del cociente TAPSE/PSAP. También salió la «especificidad ~94 %» del signo de
McConnell. El detalle está en **`docs/mapa/tep-score.md`**.

⚠️ **EL CHIP «CRITERIO DE ECOSMART» PASA DE TRES A CUATRO**: el cuarto declara que los cortes 2 y
4 del conteo del TEP son una referencia propia. Lo cuenta TC-507 (I8).

⚠️ **MEDIRLA EXIGE ACTIVAR SU SUBPESTAÑA.** Sin `refSubTab('fun', btn)` la tarjeta existe y mide
**0×0** dentro de un panel apagado, y `refSubTab` **exige su segundo argumento**.

---

## El trabajo «D» (2026-10-22) — el foramen oval: puntero

La tanda del **FOP** vive en `docs/mapa/fop-burbuja-unificado.md` → «El trabajo D». Lo que toca
de esta zona:

- **`otr_asia_lado`** («Se abomba hacia»: AD, AI o ambos) nace en **Otros · Variantes
  anatómicas**, al lado de `otr_asia`, y es su **dueño único**. Decide el corte del aneurisma
  del septum: 10 mm hacia un lado, **15 mm de excursión total** con «ambos lados» (Silvestry
  2015, folio 916). Sin consignar manda el de 10, que es el que la app aplica desde siempre.
- **`otr_burb_lat`** (3 a 6 latidos, con el **3 por defecto**) nace en **Otros · Test de
  burbuja**, dentro de `otr-burb-pos`, y también es dueño único (Silvestry 2015, folio 931).
  Su primera opción es el 3 y la vacía va última: `limpiarCampos` hace `selectedIndex = 0`.
- La sección del FOP de «CC frecuentes» pasa a **tres columnas** —Anatomía, Shunt y Contexto
  clínico— y **lee** esos dos datos en dos `<span>` de solo lectura. **Sin dibujo.**
- La ficha **«Foramen Oval Permeable — ASIA, shunt y cierre»** entra en Referencias ·
  **Otros hallazgos**, pegada a la del test de burbuja; la de **Test de Burbujas** gana la
  **fuente** de su tabla de tiempos, y **ni un corte de esa tabla se movió**.
- La conclusión, el informe y el EN SUMA del FOP son **descriptivos**: sin «ESC», sin indicación
  de cierre y **sin el ACV criptogénico**, que pasa al PDF como «Motivo del estudio».

---

## Las fichas de la tanda AJ1 (22/10/2026)

`AOR-004` (definición de dilatación y el iDA, folios 71 y 76) y `FUN-VD-007` (strain de pared libre
del VD, folios 145 y 159) son las dos fichas nuevas; `ref-ia` gana la fila de la duración del
reverso con sus **dos** fuentes —la EACVI 2013 y un **libro de texto**, rotulado como tal—,
`ref-im` el corte alternativo de la IM secundaria y `ref-eao` la línea de fuente del gradiente
medio (**EAE/ASE 2009, Tabla 3, folio 10**, columna AHA/ACC). El corte de **9 mmHg** de la pulmonar
sigue rotulado «Criterio de EcoSmart».

Detalle en **`docs/mapa/aj1-ajustes.md` § 7**.

---

## La tanda «E» (2026-10-22) — `ref-hfapeff`, y «Función» pasa a TRES

`REF_SUBTAB.fun` pasa de `['htp','tep']` a **`['htp','tep','hfapeff']`** y el censo de la pestaña de
**31 a 32** entradas. `ref-htp` gana una tabla de catorce filas —las tres bandas de VRT y los once
signos, cada uno con su corte y su folio— y **`ref-hfapeff` es NUEVA**: hasta esta tanda el score
HFA-PEFF **no tenía entrada**, así que los veinte cortes que la app aplica no estaban publicados en
ninguna superficie consultable.

Detalle en **`docs/mapa/htp-hfapeff.md`** §8.

---

## La tanda I (22/10/2026) — cuatro fichas de la ETE con su folio

`ref-em` (la escala de Wilkins, la serie original y la salvedad), `ref-im` (reparabilidad quirúrgica
y los cortes de TEER), `ref-oai` (los dos cortes de vaciamiento y los dispositivos con su
fabricante) y `ref-ao` (las **dos** escalas de ateroma, comparadas). **Ningún corte se movió**: lo
que cambia es que cada número diga de dónde sale, y que lo que no tiene fuente lleve el chip
CRITERIO DE ECOSMART.

⚠️ **«EVEREST II» era una atribución equivocada**: el registro que publica los cortes anatómicos del
TEER es de **Tamburino y cols.**, está en la biblioteca y hoy se cita.

Detalle en **`docs/mapa/tanda-i-ete.md` § 5**.

---

## Puntero — la tanda «AJ2» (2026-10-23)

Lo que esa tanda movió de esta zona está en **`docs/mapa/aj2-correcciones.md`**, con los doce
commits, sus dependencias y las doce trampas. En una línea, lo que toca acá:

- **HTP**: `htpVrtSinDatos` es el dueño del estado «sin datos», que NO es «no medible»; la hoja del
  PDF y la pantalla son un solo dueño por construcción (`amiloTextoHTP` lee el mismo nodo).
- **TEP**: `tepVeredicto` + `TEP_VD_SIGNIF_MIN` gobiernan las tres superficies; el cuadro pasa a
  tres grupos y el TAPSE/PSAP sale una sola vez; el rótulo del score en `/6`.
- **Otros / orejuela / ateroma**: la orejuela publica la medición y no la juzga; el ateroma no
  afirma un riesgo embólico que su escala no publica, su grosor completa el grado, y los dos
  aportan su línea al EN SUMA.
- **Referencias**: los dos buscadores tratan guión = espacio = nada (`_buscaCompacta`), con el
  punto decimal intacto.
- **Aorta**: `aoSegGrado` devuelve un solo grado, `'dilatada'`, **y el corte no se movió**.
- **Diastólica**: la frase de «no clasificable» describe en vez de pedir un campo.

---

## ⚠️ La tanda J movió esto (2026-10-24) — el mapa está en otro archivo

El colapso de la aurícula derecha pasó a ser **diastólico** con su duración (`dpt_col_ad_dur`,
corte `DPT_COL_AD_DUR_SIG` = 0,34), la plétora de VCI del pericardio bajó a **>20 mm**
(`DPT_VCI_PLETORA_MM`), la constricción perdió el aviso de confirmación invasiva y ganó el
cociente de la vena suprahepática (`cvr_hep_coc`, `CVR_HEP_COC_MIN` = 0,78), VEXUS pasó a usar los
**dos** operadores del artículo (`VEXUS_VCI_MM`, con `≥` para el grado 1 y `>` para el 2 y el 3) y
perdió sus frases de conducta, y entraron **tres Evidencias nuevas** más la ficha de Referencias
de constricción.

**Todo eso está en `docs/mapa/j-pericardio-constriccion-vexus.md`.** Acá no se repite.

---

## Una ficha nueva en la tanda «J2»: eco pulmonar → otro mapa

Puntero. El relato vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`** §5.

`ref-pulmon`, «🫁 Ecografía pulmonar (recomendaciones internacionales 2026)», en la subpestaña
**«Otros hallazgos»**, pegada a `constriccion` porque viven en la misma pantalla de la app.

⚠️ **SE AGREGÓ A `REF_SUBTAB` EN EL MISMO COMMIT QUE LA FICHA.** Es el paso que la tanda J se
olvidó con `constriccion`: la ficha existía, se abría desde su encabezado y el buscador la
indexaba, pero `refSubInit` no la reubicaba y el médico que navegara por las solapas no la
encontraba nunca. El censo pasa de **23 a 24** entradas repartidas, **ninguna sin panel**, y
TC-533 (H2) lo fija como invariante sobre la lista entera.

Y **`pul-balik` deja de ser una de las cinco tarjetas sin botón**: entra a `VINFO_REF` y su globo
gana el «Ver referencia →». Siguen sin botón **cuatro**: `tarj-insuf-pulmonar`,
`tarj-esten-tricuspide`, `tarj-esten-pulmonar` y `et-avt-cont`.
