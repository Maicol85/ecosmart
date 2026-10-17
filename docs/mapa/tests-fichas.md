# Fichas de casos por tanda

Sale de `docs/mapa/tests.md`, que cruzó el techo de 35 KB el 2026-10-16 al agregarle TC-485.
**Lo que está acá es la ficha de cada tanda**: qué cubre su caso, cuántas condiciones tiene y
cuántas quedan en rojo contra HEAD. **Lo que está allá es el mecanismo**: cómo se agrega un caso,
cómo se corre la suite, los dos juegos de helpers, los arneses y las trampas.

> ⚠️ **ARCHIVO PARTIDO el 2026-10-17 (tanda VS):** las fichas de **TC-481 a TC-490** salieron a
> `docs/mapa/tests-fichas-481-490.md`. Estaba en 33,4 KB y la ficha de TC-494 lo cruzaba; se midio
> con `wc -c` ANTES de escribir, que es lo que `CLAUDE.md` pide y lo que las tres particiones
> anteriores tuvieron que hacer DESPUES de cruzar.

## TC-491 — la tanda «L»: el registro de evidencia y las tres tarjetas ⓘ de AI/VI

**51 condiciones**, con **dos denominadores** y **cuatro controles negativos**. Verificado que
sabe fallar contra el árbol de entrada en un worktree aparte: **42 de las 51 en rojo, y NINGUNA
por excepción**. Las nueve que pasan son lo que esta tanda no mueve —los cortes de
`calcGeometriaVI` y `hviSeveridad`, el Excel en 440 columnas, la línea de la AI en el informe y
los controles—, y eso es justamente lo que había que demostrar.

| bloque | qué fija |
|---|---|
| **(DENOM)** | los tres globos existen y tienen geometría. Sin la pestaña AI/VI abierta y sus dos acordeones, los tres miden 0 × 0, la tarjeta se niega a anclarse —que es lo correcto— y **todas** las condiciones de abajo salen rojas sobre un árbol perfecto |
| **A1-A8** | el registro: doce fichas, ids únicos con su formato, datos puros que sobreviven a `JSON.stringify`, los quince campos, los tres estados, **ninguna nota interna** (barrido de vocabulario de reserva), la línea de fuente **sólo** en las «verificado», y toda ficha verificada con tabla, folio, hoja y DOI |
| **A9-A15** | el valor de cada ficha contra el **dueño**, sondeado: 34/41/48 en la AI; 40 y 20 en diámetro y área; 74/89/100 y 61/70/80 en el telediastólico; 31/38/45 y 24/32/40 en el telesistólico; 115/131/148 y 95/108/121 en la masa; 0,42 en el espesor con la masa normal **y** con la aumentada; 58/65 en el diámetro diastólico |
| **B1-B8** | la tarjeta de la AI: tres barras con punto, cada corte con su unidad, **ninguna palabra de gravedad dentro del dibujo**, la categoría del informe, la fuente una sola vez, las **tres** puertas de cierre, el foco que vuelve y el globo como `<button>` sin `title` ni enlace al manual |
| **B9-B11** | el punto y la categoría en las cuatro bandas, el punto que **se corre** al subir el volumen —con mirar sólo la categoría, un dibujo que pintara el punto siempre en el mismo lugar pasaría igual— y el repintado **en vivo** |
| **B12-B13** | sin superficie corporal y sin datos |
| **B14-B17** | la tarjeta del VI: cinco barras, los cortes que cambian con el **sexo**, la categoría de la FEVI igual a la de la cápsula, y sin sexo las tres barras que dependen de él sin punto mientras el diámetro diastólico y la FEVI lo conservan |
| **C1-C7** | la geometría: cuatro cuadrantes con la hipertrofia en tres bandas, las dos mitades del **mismo** tamaño, las tres bandas iguales entre sí y sin raya, el remodelado y la normal **sin** bandas de gravedad, la línea con las palabras del informe, y los bordes exactos de 0,42 y del umbral de masa |
| **D1-D4** | Referencias: las dos entradas con sus tablas de los dos sexos y sus gráficas **sin punto**, la bibliografía desde [1] con folio y DOI, y el **control negativo**: la fila de una ficha que no es «verificado» sale **sin corchete** |
| **E1-E3** | veinte aperturas sin acumular nodos, nada en el navegador ni en el estudio, y el color **computado** en los dos temas |
| **F1-F4** | los controles: el informe sigue publicando la AI, el Excel en **440** columnas, ninguna columna ni campo nuevo, y el dueño único de la gravedad de la hipertrofia por sus cuatro bordes |

### Lo que este caso destapó

**C7 encontró un límite real**: `calcGeometriaVI` llama hipertrofia a la masa que **no es menor**
que el umbral, así que **115 g/m² exactos ya son hipertrofia en el varón** mientras `hviSeveridad`
empieza a graduar en 116 — en ese valor la app publica «hipertrofia» **sin gravedad**. La primera
versión de la condición afirmaba lo contrario y el caso lo cazó. No se corrigió —es contenido del
informe firmado—: queda en `PENDIENTES.md` → **L-5** y la condición lo fija.

### Trampas que pagó al escribirlo

* **Murió por excepción contra HEAD** en su primera versión, por un `.click()` sobre `null`: eso
  prueba que el árbol es distinto, no que el caso sabe medir. Todo clic va por `CLIC(k)`, que
  devuelve `false` si el botón no está.
* **`data-ev-cuad` de una banda ya lleva su nivel con una barra adentro**, así que concatenarle
  las medidas y partir por barra las corre un lugar: la condición de simetría informó **420
  contra 82** sobre un dibujo simétrico. Las medidas van en campos separados.
* **`puntoX[2]` no es el punto del volumen**: con una sola barra con punto, el índice 2 no
  existe. Se busca por su clave.

---

## TC-492 — la tanda «M»: el registro de AD/VCI, VD y aorta, sus cuatro tarjetas ⓘ y sus tres entradas de Referencias

**49 condiciones**, con **dos denominadores** y **cinco controles negativos**.
**Verificado que sabe fallar contra HEAD en un worktree aparte: 38 de las 49 en rojo, y NINGUNA
por excepción.** Las once que pasan son lo que esta tanda no mueve —los ids del L, la pureza del
registro, el Excel en 440, el informe, los dos controles de las entradas viejas de Referencias y
el límite declarado—.

### Qué afirma

| bloque | qué |
|---|---|
| denominadores | los cuatro globos existen y tienen geometría; el registro trae las doce del L más las dieciséis de la M |
| registro | ids únicos y ninguno reusado del L · datos puros (JSON ida y vuelta) · los quince campos · sin vocabulario de reserva · la fuente sólo en «verificado» |
| dueños | los doce sondeos contra sus bordes: 18/19 · 41/42/45/46 · 35/36 · 86/87 · 4,9/5/7/7,1/9/9,1 · 16/17 · 9,4/9,5 · 24/25/34/35 · 45/46 · 0,54/0,55 · 104/105 · 40/41/45/46 · las cuatro combinaciones de la vena cava · el 21 exacto |
| nomograma | las tres ecuaciones con su SEE y el z=1,96 · el gráfico por edad (19·20·39·40·41) · la banda = ecuación ± 1,96·SEE · fuera del rango de superficie corporal devuelve `null` |
| tarjetas | abren y cierran por el mismo botón, por Escape y por el clic afuera · el foco vuelve al globo · el punto en las cuatro · cada corte con su número y su unidad · los cortes de FEVD, Tei y TAP sin el paso de sondeo corrido · ninguna palabra de gravedad dentro de las bandas · la categoría igual a la de la cápsula · la fila del paciente en la tabla de la vena cava · en vivo · sin datos |
| aorta | el gráfico por edad · dentro / por encima / por debajo del rango · el corte de 40 mm con la categoría de la cápsula y el 40 exacto normal · las tres líneas de texto · sin edad |
| Referencias | las tres entradas con las dos columnas de sexo · las tres gráficas sin punto · la bibliografía sólo de verificadas |
| no se guarda | cero campos del estudio y cero claves del navegador |
| controles | el Excel en 440 · el informe y el EN SUMA sin mención del nomograma · los cuatro globos son `<button>` sin `title` |

### Los cinco controles negativos

1. **las seis fichas que NO son «verificado» devuelven cadena vacía** en `evFuenteLinea`;
2. **fuera del rango de superficie corporal la banda es `null`** (1,29 y 2,41 m² en el gráfico C,
   contra 1,30 que sí la devuelve);
3. **el corte de 40 mm no se le atribuye a ninguna guía**: la tarjeta publica UNA sola línea de
   fuente y es la del nomograma;
4. **una fila cuya ficha no está «verificado» sale sin corchete** en Referencias;
5. **con el VD alterado el informe sigue publicando su frase de siempre**.

### Límite declarado

⚠️ **El ancho de la ventana y el segundo motor NO se pueden medir desde el cuerpo de un caso**:
corre DENTRO de la página. Los miden `scripts/_probe_m.mjs` (grupo `maqueta`, doce celdas) y
`scripts/_probe_mwk.mjs` (**192 celdas por motor**, Chrome 155 y WebKit). Es el reparto de
TC-460.

### Dos trampas que este caso pagó

* **Una lista de palabras de reserva con términos cortos da falsos**: «todo» matchea dentro de
  «método» y puso en rojo a `FUN-VD-005` sobre una ficha perfecta.
* **Un centinela sobre la VERDAD no alcanza: tiene que ser sobre el TIPO.** Contra HEAD el
  ayudante devuelve la cadena `'SIN FN'`, que es *truthy*, y `r.lo.toFixed(3)` mató la corrida
  entera — que prueba que el árbol es distinto, no que el caso sabe medir.

---

## TC-493 — la tanda «LS»: la AI y el VI por sexo, la FEVI en cuatro y el aviso

**52 condiciones**, con **dos denominadores** y **cuatro controles negativos**. Contra el árbol de
entrada en un worktree aparte: **36 de las 52 en rojo**, y **ninguna por excepción** (el log no
tiene una sola línea de `excepcion`).

### Lo que afirma, por bloque

| Bloque | Condiciones | Qué fija |
|---|---|---|
| DENOM | 2 | las once piezas nuevas existen como función; los tres globos de AI/VI tienen geometría |
| (b) el dueño del sexo | b1 a b4 | normaliza `M`/`F`/minúscula/palabra entera/con espacios; un valor **no binario** cuenta como sin sexo; sin sexo el corte es el del **varón**; la regla alcanza a los seis parámetros |
| (a) los seis parámetros | a1 a a11 | el diámetro AP por sus bordes exactos en los tres sexos y el rótulo del corte publicado; el DDVI en sus **tres** bordes por sexo y en los tres estilos del informe; el DSVI y el espesor por sus bandas; **(a11) límite declarado**: ninguna cápsula clasifica el diámetro sistólico ni el espesor |
| (e) la masa | e1 a e4 | 115 y 95 **exactos** normales, 116 y 96 hipertrofia leve, sin sexo el del varón, y **cero huecos ni solapes** de 40 a 200 g/m² en los dos sexos |
| (d) la FEVI | d1 a d5 | los cuatro tramos con 50/41/40/30/29; el 40 y el 30 en moderada **en los tres estilos y en el EN SUMA**; **un solo dueño** (cápsula, informe, Simpson y bandas coinciden en todo el dominio); el censo de la comparación suelta; **(d5) control negativo**: el criterio no distingue sexo |
| (c) el aviso | c1 a c7 | aparece sólo con falta de sexo y valor en la franja; desaparece con el sexo cargado; los seis parámetros lo disparan y la FEVI **no**; no entra al informe ni al EN SUMA en los tres estilos; `role="status"` y `aria-live="polite"` sin `onclick`; «Nuevo estudio» lo apaga sin dejar una línea vacía; **no desplaza el campo de al lado** |
| (f) las tarjetas | f1 a f5 | sin sexo las **cinco** barras del VI ubican su punto y las tres que dependen del sexo lo dicen; los cortes publicados son los del sexo; la línea del criterio de la FEVI **sin nombrar ninguna guía**; la de geometría trae las dos barras de espesor con su fuente; la de la AI con sus tres fuentes verificadas |
| (g) Referencias | g1 a g3 | los **dos sexos** del diámetro AP y del DDVI, el espesor y la masa con su operador nuevo, y las cuatro bandas de la FEVI con su línea de criterio |
| (h) el registro | h1 a h4 | ids únicos y datos puros; el valor de cada ficha **atado a su dueño**; sin vocabulario de reserva y con los acentos puestos; las seis fichas nuevas o reverificadas con su tabla, folio, hoja y DOI |
| (i)/(j) | i1, i2, j1 | 20 aperturas y cierres de las tres tarjetas sin acumular nodos ni dejar ninguna abierta; sin scroll horizontal con el aviso puesto; nada se guarda en el estudio ni en el navegador |
| (k) los controles | k1 a k4 | el Excel en **440** columnas sin ninguna categoría nueva; la diastólica, el HFA-PEFF y los ocho grados; las cuatro tarjetas de la tanda M intactas; el cuadro de frases, la identificación del paciente y el Wilkins en su lugar |

### Dos cosas que hay que saber para releerlo

⚠️ **CARGA CON `__t.set` Y NO CON TECLAS DE CDP**, y está escrito en el caso: el cuerpo corre
DENTRO de la página, no tiene acceso al protocolo del navegador y un `KeyboardEvent` construido a
mano no es de confianza. Las **mismas** escenas se corren con teclas y clics reales en
`scripts/_probe_ls.mjs`, que es la sonda que midió el A/B contra el árbol de entrada. Es el
reparto de TC-460, TC-463 y TC-469.

⚠️ **LA ESCENA DE (d2) LLEVA EL DIÁMETRO DIASTÓLICO ADEMÁS DE LA FEVI, y es un denominador**: el
bloque del ventrículo del informe se arma alrededor del diámetro, así que con la FEVI sola el
estilo **conciso** no publica su fragmento y la condición salía roja sobre un informe correcto en
los otros dos estilos.

---

## TC-494 — la tanda «VS»: el corazón derecho y la raíz aórtica a la Tabla 1 de la ASE 2025

**54 condiciones**, con **tres denominadores** y **ocho controles negativos**.
**Verificado que sabe fallar contra el árbol de entrada en un worktree aparte: 38 de las 54 en
rojo, y NINGUNA por excepción.** Las 16 que pasan son lo que esta tanda no mueve: la pared del
VD —la única fila que la app ya tenía exactamente como la guía la publica—, el tiempo de
aceleración pulmonar, los cuatro segmentos de la aorta que conservan su operador, la forma del
OR, el registro como datos puros y los cinco controles de las zonas ajenas.

### Qué afirma, por bloque

| bloque | qué |
|---|---|
| DENOM | la tabla y su evaluador existen y traen las DOCE filas con sus cuatro bandas; y el sondeo da lo MISMO con varón y con mujer |
| (a)(b) | los **once** parámetros por su borde EXACTO, uno por debajo y uno por encima — seis valores cada uno |
| (a) | el 17,0 exacto del TAPSE dice lo mismo en el informe, en el EN SUMA y en la cápsula, y en los TRES estilos |
| (b) | el tamaño del VD y el área de la AD en cuatro categorías, con el vocabulario de la AI; y el 18,9 cm² que pasa a normal y PIERDE su línea del EN SUMA |
| (c) | la VCI con el 21 mm exacto NORMAL, las cuatro combinaciones de PmAD y la PSAP bajando 5 mmHg |
| (d) | el seno de Valsalva en 39,9 / 40,0 / 40,1, el 40 exacto llegando al informe y al EN SUMA, y los otros cuatro segmentos con su operador |
| (e) | la LÓGICA: un OR donde uno alcanza y dos dicen lo mismo, la FEVD que sigue sin votar, la línea de FAC severa con su compuerta nueva y `DisfSist_VD` binaria |
| (f) | las cuatro tarjetas: abren y cierran, seis barras en tamaño, cuatro zonas por barra, 37 cortes con su unidad, sin palabras de gravedad y con la categoría idéntica a la cápsula |
| (g) | Referencias con los cortes nuevos, sin ninguno de los viejos, con el operador propio de la raíz y la bibliografía deduplicada |
| (h) | el registro: ids únicos, datos puros, sin vocabulario de reserva y el VALOR de cada ficha contra el corte que aplica su dueño |
| (i) | veinte aperturas y cierres sin acumular nodos |
| (j) | nada se guarda en el estudio ni en el navegador |
| (k) | los controles: AI/VI, diastólica, HFA-PEFF, aorta ajena, las 440 columnas del Excel y la tarjeta del cociente TAPSE/PSAP |

### Los ocho controles negativos

1. La **pared del VD** no cambió ni un corte.
2. El **tiempo de aceleración pulmonar** conserva su único corte de 105 ms y **no está** en la tabla.
3. La **FEVD alterada NO vota**: con TAPSE y onda S′ normales el informe dice función conservada.
4. Los **cuatro segmentos de la aorta** que no son la raíz conservan su `>` estricto.
5. **Referencias ya NO publica ninguno de los cortes viejos** (`≥ 17 mm`, `< 25 %`, `> 86 mm`,
   `≤ 18 cm²`, `< 21 mm`).
6. **`AOR-001` sigue siendo criterio propio** y no publica fuente, mientras `DIM-VD-001` sí.
7. Con la zona AI/VI, la diastólica, el HFA-PEFF y la aorta cargados y **sin un solo dato del
   VD**, el informe no nombra el VD y dice «Aurícula derecha no valorada».
8. El **Excel sigue en 440 columnas** y ninguna nombra la Tabla 1.

### Dos cosas que hay que saber para releerlo

* **Las escenas se cargan con `__t.set` y no con teclas reales**, porque el cuerpo de un caso
  corre DENTRO de la página. Las mismas escenas se miden con **teclas y clics reales** en
  `scripts/_probe_vs.mjs`, que es la sonda del A/B. Es el reparto de TC-460 y TC-492.
* **Toda lectura de las piezas nuevas va por un ayudante con centinela** (`G` / `FN` / `LL`):
  contra el árbol de entrada no existen `ASE25_T1`, ni `ase25Grado`, ni `vdTamPeor`, ni las dos
  áreas graduadas, y nombrarlos pelados mata la corrida entera.

### Casos adaptados por esta tanda: TRECE

**TC-02**, **TC-06**, **TC-33**, **TC-34**, **TC-35**, **TC-36**, **TC-37**, **TC-38**,
**TC-136**, **TC-285**, **TC-457**, **TC-470** y **TC-492**, cada uno con el motivo escrito en el
propio caso. Los trece afirmaban un corte o una palabra que esta tanda movió; ninguno estaba mal
escrito, los trece describían la app de ayer. Los que ganaron cobertura y no la perdieron:
TC-33, TC-34, TC-35 y TC-37 pasan de cuatro bordes a seis, y TC-492 mide hoy las cuatro bandas de
cada parámetro donde antes medía un corte.

⚠️ **Y DOS CASOS CAZARON DEFECTOS REALES QUE LA LECTURA NO VIO:** TC-457 encontró las dos
constantes derivadas con la banda equivocada, y TC-482 que la vista 2D había dejado de agrandar
las dos cámaras derechas.

---

## TC-495 — la tanda «VAL» (2026-10-17)

**Qué afirma.** Los cinco parámetros de válvula nativa que la tanda alineó a las guías, cada uno
por su **borde EXACTO** con un valor por debajo y uno por encima, y las dos cosas de texto.

**53 condiciones**, con **tres denominadores** y **nueve controles negativos**.
**Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 29 de las 53 en
rojo, y NINGUNA por excepción.** Las 24 que pasan son lo que esta tanda NO mueve —los cortes del
área y del VTI de entrada de la ET, el borde de 1,0 del AVA, el `>1,4` del cociente, los números
del jet/AI, el Excel en 440 columnas y las ocho lesiones—, que es justamente lo que había que
demostrar.

### Los denominadores
1. `ET_CRIT` trae los cuatro criterios con su nombre corto, y el **THP es el único** con
   `apoyo: true`; los operadores y los cuatro valores son los que se declaran.
2. `AVA_MOD_MAX` existe y `EA_BANDAS.avaSinMin` **se deriva** de él: no hay dos copias del 1,5.
3. Las escenas del AVA y de la FR **producen el número que dicen producir** (`1.49` / `1.50` /
   `1.51` y `49%` / `50%` / `51%`). Sin esto, un corte que no se alcanza pasa por un corte que no
   se movió.

### Los nueve controles negativos
- El THP distingue sus dos lados (`cThp`) y **aun así no decide** — se muestra y no vota.
- Con el THP como **único** dato el grado calculado es **nulo**, no «No significativa».
- Con IT severa pero **sin área** por continuidad el aviso **no** sale.
- El borde de **1,0** del AVA no se movió (1,00 severa · 1,01 moderada) y las bandas no se solapan
  en ninguno de los nueve valores probados.
- La **onda E sigue sin votar**: `im_grado` es el mismo en 119, 120 y 121.
- El **corte del cociente VTI no se movió**: sin IAo sigue publicando el `>1,4`.
- Los **números del jet/AI** no se movieron (20 y 40, con el 40 inclusive en moderada).
- Con **prótesis** mitral el cociente conserva su `≥2,5` y su retiro desde la IAo moderada.
- La frase de integración **no** aparece en el informe, en el EN SUMA ni en la pestaña Válvulas, y
  aparece **una sola vez** en todo el documento.

### Trampas que este caso pagó al escribirse
1. **`sinArea` dejaba el VTI de entrada cargado**, así que la escena «el THP solo» tenía un segundo
   insumo en banda y el grado calculado existía: el control negativo medía otra cosa.
2. **`_labValvBin` devuelve un objeto indexado por VÁLVULA**: tomar la primera clave da la MITRAL
   (índice 1) y no la tricúspide (índice 5).
3. **`ET_SIGNIF_TXT` era un `const` de módulo**: preguntando por `window.ET_SIGNIF_TXT` la lectura
   caía por el camino de legado y la condición pasaba por una razón equivocada. Se exportó.
4. **El globo ⓘ del jet/AI mide 0×0** con su pestaña y su cajón cerrados, y una tarjeta que no se
   ancla devuelve el texto de la anterior. Se abren los tres pasos antes de tocarlo.
5. **El Ø del TSVI de la escena del AVA va en 19 mm y no en 20**: con 20 el DVI vota moderada por
   su cuenta y los dos lados del borde de 1,5 dan «moderada» sobre un corte que sí se movió.
6. **Las unidades del PISA aórtico son las de su banda** (radio en mm, Valiasing en cm/s, Vmax en
   m/s): fuera de banda la FR no se calcula y los tres bordes salen iguales.
