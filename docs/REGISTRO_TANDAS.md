## PANT-27 — los catorce textos de la Evidencia que el medico aprobo (2026-11-09)

**CINCO commits.** Sello **`v20261109-1203`**, md5 **`a14c45a0`**. Al empezar, `origin/main` =
**116ac5e** (el cierre de PANT-25, ya publicado) y `HEAD` = **ddcf42d**, con los cuatro commits
LOCALES de documentacion de AUD-PROT y el md5 de `index.html` en `f2587ad8`, el que dejo
PANT-25: la diferencia es solo esa, como la orden preveia. **El push lo corre Maicol: esta
tanda tenia orden expresa de NO pushear.**

- **Commit 1 — el inventario**, `docs/INVENTARIO_TEXTOS_P27.md`, de SOLO LECTURA: md5 de
  `index.html` identico antes y despues. Para cada uno de los catorce textos, su ubicacion con
  lineas, su texto completo sin recortar, como esta escrito y como se muestra, en que condicion
  aparece, si vive en otro lugar y los casos que lo afirman, buscados por los literales exactos.
- **Commit 2 — las SIETE notas de la estenosis mitral** (`EM_NOTAS`), reescritas en afirmativo.
- **Commit 3 — Fontan, el globo de la calculadora de TAVI y el reverso aortico**: la entrada
  `fon.ev.sangrado`, el ultimo parrafo de `VINFO['tavi-calc']` y el bloque del reverso
  diastolico de la ficha `ref-ia`.
- **Commit 4 — la cirugia ante el trombo protesico grande**, leida EN IMAGEN a 300 ppp en la
  hoja 64 de la ESC/EACTS 2025 final, con el folio **4698** comprobado en la cabecera impresa.
- **Commit 5 — cobertura y documentacion**: TC-765 a TC-768, TC-328 y TC-516 adaptados, el
  mapa, la guia de prueba, este bloque y **P27-a**.

**TRES PREMISAS DE LA ORDEN NO SE REPRODUJERON, y el inventario las encontro antes de tocar.**

1. **T10 a T13 no estan en una nota de la Evidencia**: viven en la ficha de Referencias
   `ref-ia`. Dos de los cuatro literales que la orden da para encontrarlos **no existen** en la
   nota de Evidencia y aparecen **una sola vez en todo el archivo**, las dos ahi; la cita
   completa de Lancellotti que el texto nuevo pide tambien; y la primera oracion que la orden
   manda dejar identica termina en punto solo ahi.
2. **T14 solo es especifico de protesis mecanica en UNO de sus tres lugares visibles**: la nota
   del ramal `tipo === 'mec'` de la seccion mitral. La pregunta aortica y la tricuspide no
   estan acotadas por tipo, asi que quedaron **PARADAS** y declaradas en **P27-a**.
3. **T2 son DOS notas** con el mismo comienzo, una por etiologia. La orden solo aprueba la de
   etiologia **no reumatica**, que es la unica que se toco.

**NINGUN CALCULO, CORTE, REGLA DE COMBINACION NI CONDICION DE PANTALLA SE MOVIO.** Cero campos
guardados nuevos, Excel en **457** columnas con las mismas claves, ningun id cambiado, y las
claves de cita de cada entrada intactas. **EL PAPEL ES IDENTICO A HEAD** en las tres sondas y en
el A/B: informe en los tres estilos, EN SUMA, PDF y PPT, cero diferencias.

**Verificado con el gesto real en los DOS arboles**, con denominador declarado en cada pieza:
las nueve notas de la estenosis mitral con el detalle plegado abierto por su summary, la fila de
Fontan contestada en los dos sentidos por sus propios botones, el globo abierto por su boton de
44x44 con la tarjeta visible, y la ficha `ref-ia` pintada por `evRefPintar`. **40/40 mutaciones
dirigidas muertas**, en worktree y nunca sobre el vivo, con el md5 del arbol vivo identico antes
y despues.

⚠️ **EL PRIMER BARRIDO DEJO DOS SOBREVIVIENTES Y LOS DOS ERAN HUECOS REALES.** Vaciarle los
`refs` a una nota la deja sin corchete y **ninguna condicion lo miraba**; y escribir el 8 del
score a mano deja en verde a la condicion que compara el texto con la constante, **porque la
constante tambien vale 8**. `EM_CRIT_2025` esta congelado, asi que no se puede mover para verlo
por la conducta: la condicion nueva lee el **cuerpo de `EM_NOTAS`** y exige que el valor se
interpole y no este escrito a mano. Nacieron **(D5)** y **(D6)** de TC-765.

**Casos nuevos:** TC-765 a TC-768, los cuatro con denominador y control negativo, y los cuatro
caen contra `ddcf42d` por **25 condiciones** y ninguna por excepcion.
**Casos adaptados, con el motivo escrito:** **TC-328** (dos condiciones: afirmaban T7 por sus
literales exactos) y **TC-516** (la condicion (h1): afirmaba T10 por el suyo). Los dos ganan
ademas la AUSENCIA del literal viejo, asi que pueden fallar por los dos lados, y los dos caen
contra `ddcf42d`.

**Donde esta todo:** `docs/mapa/pant27-textos-evidencia.md` (**mapa NUEVO**),
`docs/INVENTARIO_TEXTOS_P27.md`, `docs/GUIA_PRUEBA_PANT27.md`, `docs/PENDIENTES.md` →
**P27-a** con lo parado y lo cerrado, y las sondas `_probe_pant27em.mjs`,
`_probe_pant27f9ia.mjs` y `_probe_pant27tromb.mjs`, mas el barrido `_mut_pant27.py`.

---
## AUD-PROT — auditoria de SOLO LECTURA de la logica de las protesis valvulares (2026-11-09)

**Cuatro commits y `index.html` NO cambia**: md5 **`f2587ad83be4d12f8a59fa9a0bb27a23`** al abrir y
al cerrar los cuatro, sobre el arbol sellado **`v20261108-0123`** que dejo PANT-25. **No genera
sello**: la linea base sigue siendo la de PANT-25. Al empezar, `origin/main` = `HEAD` =
**116ac5e**, el cierre de PANT-25, ya publicado. **El push lo corre Maicol: esta tanda tenia
orden expresa de NO pushear.**

- **Commit 1 — el inventario.** `docs/AUDITORIA_PROTESIS.md` seccion 1, medido con la sonda nueva
  `scripts/_probe_audprot_inv.mjs`: por posicion protesica, donde vive la logica, que parametros
  lee y de que lado del flujo los pone, los cortes LITERALES, la regla de combinacion, los estados
  y el texto de cada superficie; y el catalogo de modelos contado celda por celda.
- **Commit 2 — las 25 escenas.** `scripts/_probe_audprot_escenas.mjs`, con el gesto real: el
  select, los campos con sus eventos, la pestania Valvulas, los cuatro acordeones, el boton de
  estilo y la tarjeta «Modelo y tamanio» con su buscador y su boton «Elegir».
- **Commit 3 — el contraste.** CINCO hojas de la ASE 2024 releidas EN IMAGEN a 300 ppp con la
  regla de folio comprobada en el encabezado impreso (la hoja 18 imprime «Zoghbi et al 19»):
  hojas 18, 19, 26, 32 y 35. Tabla de 18 filas: **coincide en 9**, criterio propio de la
  aplicacion en 6, difiere en 1 y no medible en 1.
- **Commit 4 — la documentacion**, este bloque y **PRO-a** a **PRO-d**.

**LA PREMISA CENTRAL DE LA ORDEN NO SE REPRODUJO.** El medico supone que el «sin datos
suficientes» es de todas las protesis: es **solo de la aortica**. La mitral, la tricuspide y la
pulmonar **no escriben nada en el papel** cuando no concluyen —sus tres bloques son
`if (veredicto positivo) { … }` sin `else`—. Medido en nueve escenas.

**LA SEGUNDA HIPOTESIS TAMPOCO.** De los **108** modelos de los cinco catalogos, **28 no sirven**
para comparar el area efectiva en desviaciones estandar: **26** sin area impresa y **2** con area
y sin un solo desvio. El reparto por catalogo: A4 46 de 49, TAVI 9 de 9, A5 15 de 30, A9 8 de 8 y
A7 **2 de 12**. La lista completa, en **PRO-b**.

**Y LA TERCERA:** el motor aortico **no distingue biologica de mecanica**, solo TAVI contra el
resto, asi que las posiciones (A) y (A2) de la orden son la misma.

**DOS HALLAZGOS QUE LA MEDICION DESTAPO Y LA LECTURA NO.**
- **Una TAVI con desajuste SEVERO sale «normofuncionante» en el papel** (escena X1): el cuerpo
  dice «… tipo TAVI normofuncionante (DVI 0.40).» y el renglon siguiente «Desajuste
  protesico-paciente aortico severo (AEO indexada 0.44 cm²/m²).»; el EN SUMA remata con «TAVI
  normofuncionante.» y «PPM aortico severo.». La guarda recorre `P.niveles` y **el PPM no es una
  de sus seis claves**.
- **La capsula de pantalla no se repinta al elegir el modelo** (escena X4): dice «Posible» con el
  informe ya diciendo «significativa», y su plegable sigue publicando que no hay modelo cargado.
  Llamar `calcEADetalle()` a mano la pone de acuerdo. La causa, censada: `vModElegir` llama a
  **`vModTrasElegir`, que no existe en el archivo** —dos llamadas guardadas, cero definiciones—.

**TRES DENOMINADORES VACIOS CAZADOS ANTES DE CREERLE A LA SONDA**: las cuatro secciones de
Valvulas nacen cerradas y sin ellas el componente del modelo no abre; `toggleEteSeccion` prefija
`ete-seccion-` al id que recibe, asi que hay que pasarle la clave corta; y con TAVI el catalogo es
`PROT_CAT_TAVI`, asi que un modelo de la A4 no aparece en el buscador.

**LO QUE LA HOJA 19 AGREGA Y LA LECTURA PREVIA NO DECIA:** la nota al pie de la Tabla 7 exige que
el area medida este **dentro de 1 DE de la del modelo** para hablar de desajuste, y la aplicacion
publica el PPM sin esa condicion.

**Verificacion:** `git status` limpio, md5 identico en los cuatro commits, y TC-753 con los casos
que leen los documentos editados. **No se cambio ni un corte, ni un texto clinico, ni el papel.**

## PANT-23 — la Evidencia, tanda 2 de 2: el orden de los bloques y el cajon de todos los globos (2026-11-07)

**Commits**: el inventario de medicion (no cambia un byte de lo que mide); el ORDEN; los GLOBOS;
y la cobertura con la documentacion, en dos. Sello **`v20261107-1627`**, md5 **`224fd6ae`**. Al empezar,
`origin/main` = `HEAD` = **4c1af7d**, el cierre de LIMPIEZA-1, ya publicado, con `index.html` en
md5 `52f7573b` y el pendrive `DISK_IMG` montado. **El push lo corre Maicol: esta tanda tenia
orden expresa de NO pushear.**

⚠️ **POR VIGESIMA VEZ SEGUIDA EL RENGLON DE TAMANO QUE SE ENCONTRO ESTABA BIEN**, y se verifico de
las dos formas que esta casa manda: `git show 4c1af7d:index.html` da **168.667** lineas,
**12.264.443** bytes y el md5 **`52f7573b`**, los tres identicos a lo que decia.

- **EL CASO DEL MEDICO, REPRODUCIDO Y MEDIDO (commit 1).** Con el gesto real, sobre las 45
  secciones de `IND_SECS` y en cuatro anchos: **DIECISIETE** secciones tenian el recuadro «Con lo
  contestado» ARRIBA de las preguntas —las que PANT-17b convirtio por una orden equivocada— y
  **105 de los 473** globos de nota abrian su texto DENTRO de la fila, en diecisiete secciones. En
  Hemodinamica la fila pasaba de **43 a 637 px de alto** con el texto en una tira de **56 px**.
- ⚠️ **UNA PRECISION DE LA PREMISA:** el **ancho** de la fila NO cambiaba —764 px antes y
  despues, en los cuatro anchos—. Lo que se estiraba era el **alto**. Queda en **P23-a**.
- **EL MODELO es la estenosis aortica**, la UNICA de las 45 que devuelve `molde`: su cuerpo lo
  pinta `_indMoldeHTMLSec` y su orden es grilla con los datos y las preguntas, el recuadro de la
  recomendacion, el «Ver detalle» y la bibliografia al final.
- **EL ORDEN SE CORRIGE EN UN SOLO LUGAR (commit 2).** `_indSecHTMLCuerpo` emitia `adapt` en dos
  puntos segun la opcion `ordenProt` de PANT-21; se retira el de arriba y el de abajo pierde la
  compuerta. **No hay un segundo emisor**: con dos lugares y una condicion el recuadro podria
  salir dos veces y sus corchetes numerarse dos veces. Las 17 pasan al orden del modelo, las 4 de
  protesis no se mueven y las **25 sin recuadro no reciben ninguno**, con su texto identico byte
  por byte.
- **NINGUN TEXTO CAMBIA, Y ESTA CONTADO**: el censo de `textContent` de las 45 secciones con todos
  sus `details` abiertos da **28 identicas byte por byte y 17 permutaciones puras** —el mismo
  multiconjunto de caracteres y el mismo largo—, **502.468 caracteres antes y 502.468 despues**.
- **CERO RENUMERACION DE CITAS, y esta medido POR QUE**: de los **401** corchetes del panel,
  **CERO** viven en el recuadro «Con lo contestado». `_indAdaptHTML` escribe sus referencias como
  TEXTO y no llama a `_indRefMarca`, asi que mover el recuadro no puede cambiar el orden de
  primera aparicion de nada. Los corchetes de las 45 son identicos uno por uno.
- **EL MECANISMO DEL GLOBO NO ERA DE CODIGO, ERA UNA COMPUERTA DE CSS (commit 3).**
  `_indInfoHTML` emite el mismo `<details>` para los 473 y tiene **un solo lugar de llamada**. Lo
  que decidia si su texto flotaba eran DOS reglas acotadas a `[data-ind-preg="1"]`, de TGA-4, cuyo
  propio comentario declaraba el alcance. Se les quita la acotacion: **473 de 473 en posicion
  absoluta, CERO filas que crecen, CERO que cambian de ancho y CERO que se salen del panel**, en
  1440, 1000, 768 y 390 px y en los dos temas.
- ⚠️ **UNA GRILLA NO PODIA ALOJAR EL CAJON DE 600 px.** La de las secciones compactas con datos
  clinicos se parte en dos columnas por el ancho de la VENTANA y no del PANEL, asi que sus filas
  miden **373 px** con el panel en 820 —medido a 1200, 1440 y 1920— y el cajon se dibujaba FUERA
  del panel en **15 de los 16** globos de la Fallot reparada - insuficiencia pulmonar. Se le acota
  el `max-width` a **360 px** dentro de esa misma media query: el mismo `max-width` que el modelo
  ya trae, aplicado a una columna mas angosta. Queda en **P23-a**.
- **LO QUE NO SE TOCO**: las dos reglas de `.ind-ctrl-btn` tambien acotadas a
  `[data-ind-preg="1"]` —ahi la acotacion es una correccion medida de PANT-2— y los **143** globos
  de fuera del panel, **120** de los cuales ya abren una tarjeta flotante (**P23-b**).

**Lo que el commit 4 dejo:**

- **TRES casos nuevos**, TC-754 a TC-756, con sus denominadores y sus controles negativos.
  **Caen contra `4c1af7d` por DIEZ condiciones y NINGUNA por excepcion**, verificado en un
  worktree alternando solo `index.html` con el mismo archivo de casos.
- **UN caso viejo adaptado, e INVERTIDO**: **TC-747 (F1)**, el control negativo de PANT-21, que
  afirmaba que en una seccion sin `ordenProt` el recuadro sigue ARRIBA. Es el dia que esa
  condicion anunciaba: hoy exige lo contrario y puede fallar por los dos lados. Su (F1b) pasa de
  control negativo a DENOMINADOR, porque es lo que garantiza que (F1) mide la otra familia.
- **CUATRO cosas que el barrido destapo**, y las cuatro eran cobertura que faltaba o una mutacion
  equivalente: mover la recomendacion del MODELO arriba de su cuerpo pasaba en verde (nacio
  **(C3)** de TC-754); darle el molde de preguntas a las 25 secciones que no lo piden tambien
  (nacio **(G1)**); el `z-index` del cajon solo se nota en una seccion de PREGUNTAS, porque alli
  los botones de respuesta llevan `position:relative` (nacio **(E3)** de TC-755); y el
  `aria-expanded` se leia DESPUES de cerrar, cuando `_indInfoSync` ya lo habia puesto en false
  (nacio **(B6b)**). **Y una quinta era EQUIVALENTE, medido**: poner el `const ordenProt` en true
  no cambia un nodo, porque tras el commit 2 ese const se usa en un solo lugar —`_causasH`— y las
  unicas secciones con causas son las de protesis, que ya lo traen en true. Se reemplazo por una
  observable.
- **NINGUN mapa nuevo y ningun puntero**: la orden de esta tanda dice «nada mas» y lo que escribe
  es el inventario, el registro, una linea del Estado vigente, el sello, el renglon de tamano, los
  dos items de `docs/PENDIENTES.md` y la guia de prueba.

**La verificacion de cierre:**

| que | resultado |
|---|---|
| **suite completa** | **771 de 771** casos ejecutados en **15 lotes** —catorce de 55 y uno de 1—, en UNA sola pasada sobre el arbol sellado, con el pendrive `DISK_IMG` verificado **17 veces** y el md5 de `index.html` **identico** antes y despues (`224fd6ae`). **764 verdes y 7 rojos.** De los siete, CUATRO son los de siempre -TC-223, TC-376, TC-390 y TC-406-, DOS son intermitentes declarados -TC-358 y TC-557, los dos verdes corridos aislados, igual que TC-551- y el septimo era MIO: **TC-753**, que escribia a mano el sello, el md5 y el renglon de tamano de PANT-22, asi que se ponia rojo en la primera tanda que volviera a sellar. Esta adaptado -el sello ahora se LEE del pie de index.html- y pasa 1/1 corrido aislado. **Ningun rojo nuevo**, y los tres casos nuevos en verde. La linea base al cerrar es **765/771**, y esa cifra sale de la pasada completa mas la corrida aislada del caso adaptado, no de una segunda pasada completa. |
| **mutaciones** | **32/32 muertas**, en worktree y nunca sobre el vivo, md5 del arbol vivo identico antes y despues (`901cbd71`), con las 32 anclas verificadas ANTES de correr |
| **los tres casos nuevos** | caen contra `4c1af7d` por **10 condiciones** y **ninguna** por excepcion |
| **A/B del papel** | **114 escenas, 139.976 claves y 52.098 celdas de Excel: CERO diferencias de superficie firmada**, con el PDF y el PPT generados de verdad. Las **23** de pantalla son el control positivo y las 23 caen en `_evTexto`, las 23 con el mismo multiconjunto de caracteres y el mismo largo |
| **Chrome y WebKit** | **coinciden en los OCHO cruces** -dos motores x 1440, 1000, 768 y 390 px x dos temas-: panel **820 / 820 / 744 / 366** px, **CERO** desplazamiento horizontal, **CERO** solapes, **60** textos recortados -los MISMOS 60 que HEAD da en los ocho cruces- y **CERO errores de consola y de pagina** en los dos motores. Y en el barrido de los **473** globos, WebKit da lo mismo que Chrome a 1440 y a 390: 473 absolutas, cero filas que crecen, cero que se salen del panel, cero que no cierran y cero malos, con el control negativo cayendo en los dos. WebKit de Playwright no es Safari, y se declara; Chrome va por el del sistema con `channel: 'chrome'` |
| **Semgrep** | **124 WARNING / 0 ERROR**, la linea base |
| **huerfanos** | sin huerfanos nuevos |
| **Excel** | **457** columnas con las mismas claves |
| **campos guardados** | **ninguno nuevo**; ningun id cambio |
| **bloques de JS inline** | **17 de 19** parsean, identico al arbol anterior |
| **celular** | **59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la linea base exacta. **No empeoro.** |
| **el diff** | **72 lineas agregadas y 22 quitadas**, de las que **SIETE** no son comentario —tres selectores de CSS, un `if` y las tres del sello—, con **cero** `innerHTML`, `eval(` y `new Function` nuevos y cero claves ni contrasenias |

---

## LIMPIEZA-1 — archivar lo cerrado de PENDIENTES.md y el historial de tandas de CLAUDE.md (2026-11-08)

**Commits**: el inventario de medicion; el reparto de `docs/PENDIENTES.md`; el de `CLAUDE.md`;
y la cobertura con la documentacion. **No toca `index.html`** —md5 **52f7573b**, el mismo antes
y al final— y **no genera sello**: la linea base sigue siendo la de PANT-22,
**v20261107-1137**. Al empezar, `origin/main` = `HEAD` = **0b0af04**, el cierre de PANT-22, ya
publicado. **El push lo corre Maicol: esta tanda tenia orden expresa de NO pushear.**

- **EL PROBLEMA, MEDIDO**: `CLAUDE.md` y `docs/PENDIENTES.md` sumaban **1.887.757 bytes, unos
  472.000 tokens**, y Code los carga a los dos al arrancar. Hoy suman **1.035.182 bytes, unos
  259.000**: **−45 %**, sin perder un byte de texto. (Los dos numeros son del arbol CERRADO, o
  sea con lo que el commit 4 agrega: el reparto solo dejaba 146.166 y 884.694.)

| archivo | antes | despues | delta |
|---|---:|---:|---|
| `CLAUDE.md` | 880.308 B / 10.627 lineas | **146.634 B / 1.493** | **−83,3 %** |
| `docs/PENDIENTES.md` | 1.007.449 B / 15.373 | **888.548 B / 13.657** | **−11,8 %** |
| `docs/archivo/CLAUDE_HISTORIAL_TANDAS.md` | — | 739.025 B / 9.233 | nuevo |
| `docs/archivo/PENDIENTES_CERRADOS.md` | — | 142.436 B / 2.396 | nuevo |

- **EL HALLAZGO DEL COMMIT 1: ninguna herramienta lee estos archivos.** Cero lecturas reales de
  un `.md` en `scripts/`, cero `readdir` o `glob` sobre `docs/`, cero hooks, y
  `docs/REGISTRO_TANDAS.md` no lo nombra ni un archivo. Las 20 menciones de `CLAUDE.md` y las 8
  de `PENDIENTES` en `scripts/` son **prosa en comentarios**. `sellar_version.py` **no** toca
  `CLAUDE.md`: el chequeo «el sello coincide con CLAUDE.md» es **manual**.
- **LO QUE SI OBLIGA SON LOS PUNTEROS DE PROSA**: `index.html` nombra `PENDIENTES` **242** veces
  y `CLAUDE.md` **58** en sus comentarios. De ahi la regla del reparto: **un id vive en UNO de
  los dos archivos, nunca en los dos** — 856 ids distintos = 781 abiertos + 75 cerrados, cero en
  los dos.
- **LA REGLA DE ORO SE CUMPLIO**: todo lo que se movio se movio **textual y en su orden
  original**. Lo unico que esta tanda escribio va entre `<!-- L1:INDICE -->` y
  `<!-- /L1:INDICE -->`, para poder excluirlo de la comparacion.
- ⚠️ **UN DEFECTO DE MI PROPIO PARSER, ENCONTRADO MIDIENDO Y NO LEYENDO**: el rango de un bloque
  de nivel 2 se cortaba en su **primer hijo de nivel 3**, asi que `P3-m`, `P3-r` y `D-r` salian
  truncados y sus hijos quedaban huerfanos. El modelo se rehizo: el extent de un nivel 2 llega
  hasta el proximo encabezado de nivel 1 o 2, **hijos incluidos**.
- ⚠️ **Y EL GUARDIAN DE ACENTOS GRAVES CAZO UNO ADENTRO DEL CUERPO DEL CASO NUEVO**, que habria
  cerrado el template literal antes de tiempo. Lo previno **contar** los acentos graves del
  bloque y exigir el numero exacto —dos, el que abre y el que cierra—, no `node --check`.
- **PREMISA QUE NO SE REPRODUCE**: que `docs/PENDIENTES.md` sea mayormente historia cerrada. Con
  el criterio de la orden lo archivable es el **12,3 %**; sus 41 secciones se titulan «lo
  declarado y NO tocado» y **423 bloques de nivel 2 (593.100 B) no llevan una sola marca de
  cierre**, asi que por la regla de oro quedan. Queda en **L1-a** para el medico.
- **Un caso nuevo**, **TC-753**, y **DOS cosas declaradas**: **L1-a** y **L1-b**.

**La verificacion de cierre:**

| que | resultado |
|---|---|
| **reconstruccion** | tomando del manifiesto cada rango de su destino y excluyendo las lineas delimitadas, los dos originales se rearman con el md5 EXACTO: `CLAUDE.md` **493be3f4…** y `docs/PENDIENTES.md` **68effc8a…**, los mismos de `git show 8da375b:` |
| **control negativo** | con UN byte cambiado la comprobacion cae en los dos |
| **particion** | 4 rangos en `CLAUDE.md` y 158 en `docs/PENDIENTES.md`, sin un hueco ni un solape, y ningun destino con una linea de mas |
| **ids** | 856 distintos = 781 + 75, **cero** en los dos archivos, cero perdidos, cero inventados |
| **decisiones del medico** | P18-b, P18-d, P20-a a P20-c, P21-a a P21-c, P22-a y P22-b, las diez en `docs/PENDIENTES.md` |
| **el sello** | el renglon de tamano y el sello **v20261107-1137** siguen en «Que es EcoSmart», y el pie de `index.html` sigue diciendo lo mismo: el chequeo manual da igual que antes |
| **TC-753** | cae contra `8da375b` por **10 condiciones** y **ninguna** por excepcion |
| **casos de control** | TC-533, TC-502, TC-535, TC-471 y TC-322: **5/5 antes y 5/5 despues** |
| **md5 de `index.html`** | `52f7573bcc005697ac9947eac356e151`, sin cambio |

---

## PANT-22 — la Evidencia, tanda 1 de 2: un sector avanzado no incluido no abre su seccion, y los textos que comparaban fuentes (2026-11-07)

**Commits**: el inventario y el censo de textos; UN ayudante y las TRES secciones que el medico
reporto; las DIEZ restantes; las SIETE cadenas de Hemodinamica y de la protesis mitral; las
VEINTIDOS del resto; las TRES de Referencias que el censo no vio; y la cobertura con la
documentacion. Sello **v20261107-1137**, md5 **52f7573b**. Al empezar, `origin/main` = `HEAD` = **e727fe2**, el cierre de PANT-21, ya publicado.
**El push lo corre Maicol: esta tanda tenia orden expresa de NO pushear.**

- **LO QUE EL MEDICO REPORTO SE REPRODUJO CON EL GESTO REAL**: con un TAPSE bajo y un E/e-prima
  elevado y **sin incluir ningun sector avanzado en el informe**, el panel abria igual las secciones
  «Constriccion pericardica — diagnostico», «Perfil hemodinamico — presiones y resistencias
  estimadas por eco» y «Amiloidosis cardiaca — algoritmo diagnostico». Hoy no abre **ninguna** de
  las trece, y con el sector incluido su seccion sale **identica** a HEAD.

- **UN SOLO MECANISMO EN UN SOLO LUGAR**: `_indSectorIncluido(av)`, que vive justo antes de
  `IND_SECS`, se consulta en **`indicRender`** —el unico punto de armado, censado— y se declara con
  la propiedad **`av`** de la entrada, el mismo patron con que `amiloSecs` declara `soloHoja` y
  `omitir`. **TRECE** entradas la tienen; las **treinta y dos** que no son de un sector avanzado no
  se tocan.
  ⚠️ **LEE EL MISMO INTERRUPTOR QUE LEE EL INFORME Y NO UNA COPIA DEL CRITERIO**: `amiloIntegrado`,
  el dueno unico. Con un predicado propio, el dia que ese interruptor cambie el panel y el informe
  discreparian sobre el mismo sector. Y la llamada va **pelada, sin `typeof`**: si no existiera,
  tira `ReferenceError`, lo caza el try/catch de `indicRender` y la seccion no se pinta —el mismo
  fail-closed que `amiloEnInforme` aplica a `omitir`—.

- **LA AMILOIDOSIS SON DOS CLAVES Y EL ETE CINCO**, asi que `av` acepta una lista y alcanza con
  **UNA**. Lo fijan TC-748 (D1) y (D2): con una sola el ayudante dice si, y **la otra sola sigue en
  NO**, que es lo que prueba que no es un alias.

- **P22-b QUEDA VACIO, Y ES UNA MEDICION**: los **dieciseis** sectores comparten **UN** interruptor,
  asi que no hubo ninguno que parar por falta de criterio. **`wilk` y `teer` no tienen seccion de
  Evidencia** y eso no es una parada: TC-748 (F3) se pone rojo el dia que la ganen.

- **EL DATO SIGUE SINCRONIZADO, QUE ES LA MITAD DEL PEDIDO**, medido por el gesto real **y** por una
  siembra muda, y tambien **despues** de armar el panel: el perfil hemodinamico sigue calculando su
  indice cardiaco, la constriccion sigue recibiendo el dato y el HFA-PEFF sigue puntuando, con el
  sector **sin integrar** en las tres.

- ⚠️ **EL PANEL NO NECESITO UN MECANISMO DE REPINTADO, Y SE MIDIO POR QUE**: es un overlay
  `position:fixed` con `z-index:300` y el boton «Integrar al informe» de un sector queda **tapado**
  por el —`document.elementFromPoint` devuelve `indic-overlay`—, asi que para incluir o sacar hay
  que cerrar el panel y al reabrirlo se rearma. El punto 2c se cumple **por construccion** y **no se
  agrego nada**. Con el panel sin secciones se muestra el mensaje que la app **ya tenia**: cero
  frases nuevas.

- **VEINTINUEVE CADENAS REESCRITAS**, cada fuente por lo que **ella** dice, en su propia oracion y
  con su hoja y su folio intactos: siete en Hemodinamica y en la protesis mitral, veintidos en el
  resto de la Evidencia y en Referencias, mas el encabezado de la tabla de `critMCH`.
  ⚠️ **NINGUN NUMERO, HOJA, FOLIO, TABLA NI CLASE SE PERDIO**, contado **valor por valor** contra
  HEAD en las diez secciones medidas y en Referencias. **El unico valor que sale es el «1,1 cm²/m²»**
  del ejemplo de la protesis mitral, que vivia dentro de la oracion comparativa → **P22-a**, y lo
  fija TC-751 (C3).

- ⚠️ **EL CENSO NO SE HACE POR GREP, Y ESTA MEDIDO**: los mismos patrones devuelven **469** lineas y
  casi todas son comentarios. El filtro que sirve cuenta comillas y se queda con lo que esta
  **dentro de una cadena literal** —**89** al abrir la tanda, **46** al cerrarla— y se confirma en
  el **DOM abierto** con los globos de cada fila desplegados, de 3.906 a 18.947 caracteres por
  seccion y 75.136 en Referencias.
  **CONTROL POSITIVO** en los dos commits: las **seis** cadenas viejas, inyectadas, se detectan las
  seis. **CONTROL NEGATIVO**: la valvula tricuspide y la reparabilidad mitral dan cero en los **dos**
  arboles.
  ⚠️ **LAS DOS FORMAS QUE QUEDAN NO CAEN BAJO LA REGLA**: son «el folio impreso coincide con la hoja
  del PDF», que es la **regla de folio** de una fuente y no una comparacion con otra.
  ⚠️ **Y «no gradua» TIENE USOS LEGITIMOS** en las secciones de valvula, donde el sujeto es un
  gradiente o una tabla: vive en `PROH_TRAMO` y no en `PROH`.

- ⚠️ **TRES DENOMINADORES VACIOS, CORREGIDOS ANTES DE CREERLE A LA MEDICION**: la sonda sembraba
  `tdf_ip_rf` y `esub_grad_medio`, que no existen, y abria la pestania `'referencias'`, que es
  **`'refs'`**: con los tres mal, dos secciones y Referencias **entera** median sobre **cero**
  caracteres. Y un **rojo falso** de TC-751 (E4): `evRefPintar` pinta las fichas **solo al abrir su
  subpestania**, asi que el DOM de Referencias daba 88.054 caracteres con cero apariciones de lo que
  esa condicion vigila — se mide en el **registro** `EV_REG`, con su propio denominador.

- **DOS COSAS PARADAS, en P22-a**: la **tabla** de siete filas de `critMCH`, comparativa **por
  diseno** —se le cambio el encabezado y las filas no se tocaron—, y la entrada de bibliografia
  **`escGuchCiv`**, cuyo aviso de que el criterio de la app diverge de su fuente no se puede
  reescribir sin declarar ese criterio como propio, que es una decision clinica.

- **CINCO CASOS NUEVOS, TC-748 a TC-752**, con sus denominadores y sus controles negativos, y los
  cinco **caen contra `e727fe2` por condiciones y NINGUNO por excepcion**.
  ⚠️ **EL HELPER `__t.avInc` ES IDEMPOTENTE PORQUE `amiloIntegrar` ES UN TOGGLE**: llamarlo sobre un
  sector ya integrado lo **RETIRA**. Lo pago TC-752, cuya escena dejaba hemodinamica **afuera**
  —`integrar=1 · integrado=false`— porque el bloque (D6b) de TC-537, del mismo lote, ya la habia
  integrado; y retirar **no borra el textarea**, asi que su texto seguia ahi en 736 caracteres y el
  sintoma no se parecia a la causa. Las **cinco** llamadas pasan por el helper, y **(D6b) recibio la
  misma guarda**: hoy es mas fuerte, porque ya no depende del estado que le deje el caso anterior.
  ⚠️ **NI UNA EXPRESION REGULAR EN LOS CASOS NUEVOS, y se midio por que**: el cuerpo de un caso es un
  template literal, asi que `/\s+/g` llega como `/s+/g` y **reemplaza las «s» por espacios**:
  «Estenosis aortica» pasaba a «E teno i aortica» y **ningun titulo emparejaba**. Los dos
  normalizadores recorren `charCodeAt`.
  ⚠️ **Y EL ACENTO GRAVE DENTRO DE MI PROPIO COMENTARIO**, por decimosexta tanda seguida, en el
  cuerpo de un caso. Lo cazo `node --check`.

- **DIECISIETE BLOQUES DE CASOS VIEJOS ADAPTADOS** —cinco de ellos destapados por la corrida
  completa y no por el censo: TC-520, TC-553 y TC-554 ganan su `avInc` con una condicion de
  denominador, y TC-532 (C8)(D8) y TC-545 (C6) quedan **INVERTIDAS**—: **TC-533** (los
  conteos de `IND_SECS`, con **(D3) INVERTIDA**, que es el dia que esa condicion anunciaba),
  **TC-534**, **TC-535**, **TC-537** —(D6b) con la guarda de idempotencia—, **TC-544**, **TC-510**,
  **TC-349** y **TC-610** (**(D2) INVERTIDA**), y **TC-669 a TC-673** (el filtro en (D0) y **(D2)
  INVERTIDA** en los cinco).

- **35/35 MUTACIONES DIRIGIDAS MUERTAS**, en worktree y **nunca** sobre el vivo, con el md5 del
  arbol vivo **identico** antes y despues. La **36 se retiro declarada** (P22-a).
  ⚠️ **EL PRIMER BARRIDO DEJO TRECE SOBREVIVIENTES Y SE REPARTIERON EN TRES CLASES**: **siete huecos
  reales**, con siete condiciones nuevas; **dos equivalentes a nivel de seccion** —la condicion
  miraba la seccion entera y la mutacion movia una oracion: hoy miden **dentro** de la oracion—; y
  **cuatro mal escritas o mal dirigidas**.
  ⚠️ **Y LAS ANCLAS SE VERIFICAN ANTES DE CORRER EL BARRIDO** (`--anclas`): el worktree habia quedado
  en HEAD y las treinta y cinco daban **x0**, que se lee igual que «no hay cobertura». Se rehizo con
  `git worktree add --detach` sobre el commit exacto.

- **A/B contra `e727fe2`, con el PDF y el PPT generados de verdad: 114 escenas, 23.256 claves,
  52.098 celdas de Excel y CERO diferencias de superficie firmada** —informe en los tres estilos, EN
  SUMA, las **457** columnas clave por clave, los **1.010** campos, el Laboratorio, el PDF en sus
  seis plantillas y el PPT con sus 25 textos—. **Las 61 diferencias de pantalla son el control
  positivo**, y las 61 caen en claves del panel de Evidencia.

- **Linea base al cierre: suite 761/767**, en CATORCE lotes cubriendo los **767 casos distintos**
  —contados nombre por nombre, cero duplicados—, en UNA sola pasada sobre el arbol sellado, con el
  pendrive `DISK_IMG` verificado al abrir, en los catorce lotes y al cerrar (dieciseis
  verificaciones) y el md5 **identico** antes y despues (`52f7573b`). Los rojos son **TC-223,
  TC-376, TC-390 y TC-406**, los cuatro de siempre, mas **TC-551 y TC-557**, los dos
  intermitentes declarados. **Ningun rojo nuevo.**
  ⚠️ **LOS DOS CARACTERIZADOS CON CUATRO CORRIDAS DE CADA LADO**: TC-551 pasa 2 de 2 aislado
  (`COR-f`) y TC-557 da 2 rojos de 4 en el arbol nuevo y 1 de 4 contra `e727fe2`, con la misma
  firma `00000 44x44` de `elementFromPoint` fuera del viewport (`TGA-h`).
  ⚠️ **Y LA PRIMERA CORRIDA DIO 756/767 CON CINCO ROJOS MAS, LOS CINCO MIOS**: TC-520, TC-532,
  TC-545, TC-553 y TC-554, los cinco adaptados. **Los cinco pasan 5/5 contra `e727fe2`** con el
  mismo archivo de casos, asi que eran consecuencia autorizada y no una regresion.

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISEIS CRUCES** (dos motores x 1440, 1000, 768 y 390 px x
  dos temas), con **UNA sola combinacion de valores en los dieciseis**: cero secciones de sector
  avanzado sin incluir ninguno, el mensaje que la app ya tenia, UNA con la constriccion incluida,
  cero formas prohibidas en las tres secciones, cero desplazamiento horizontal, cero textos
  recortados y **CERO errores de consola y de pagina en los dos motores**. El panel mide
  820 / 820 / 744 / 366 px.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.

- **Semgrep 124 WARNING / 0 ERROR**, la linea base, sin un aviso nuevo. **Sin huerfanos nuevos.**
  **Cero campos guardados nuevos**, **Excel 457** con las mismas claves y **ningun id cambio**.
  **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la linea base exacta.

- **Donde esta todo**: `docs/mapa/pant22-evidencia-sectores.md` (**mapa NUEVO**),
  `docs/INVENTARIO_EVIDENCIA_P22.md` (el inventario de solo lectura del commit 1), las fichas de los
  cinco casos en `docs/mapa/tests-fichas-748.md` (**archivo propio**, porque `tests-fichas.md` esta
  en 34,2 KB), **cuatro mapas con un puntero cada uno** —medidos ANTES de escribir—,
  `docs/fuentes/FUENTES.md` → «La tanda PANT-22» con las veintinueve cadenas y su tabla «Cambios de
  evidencia», `docs/GUIA_PRUEBA_PANT22.md` → la guia manual en **18** pasos, y
  `docs/PENDIENTES.md` → **P22-a** (tres textos y la mutacion retirada) y **P22-b** (vacio a
  proposito), con las **tres premisas que no se reprodujeron** y el intermitente preexistente de
  TC-533 (E0).

## PANT-21 — la protesis valvular, parte 5 de 5: la EVIDENCIA de protesis, una seccion por valvula (2026-11-07)

**Commits**: el inventario y la lectura de las cinco guias; el orden de la seccion como opcion y
la mitral como primer uso; la seccion de la protesis AORTICA; el bloque de causas de la MITRAL
—con el 4a PARADO—; la seccion de la TRICUSPIDE; la de la PULMONAR; y la cobertura con la
documentacion. Sello **v20261107-0025**.

- **Lo leido, todo EN IMAGEN y con el folio comprobado en el pie o la cabecera impresos**: la
  **Recommendation Table 17 entera** de la ESC/EACTS 2025 (hoja 66, folio 4700) a 300 ppp en dos
  tramos —trece filas, seis grupos, **no dividida por valvula**— y su **Figura 20** (hoja 65, folio
  4699); las filas de protesis de la **ACC/AHA 2020** (hojas 79, 81 y 83; folios e150, e152 y
  e154); la **Figura 13** y la **Tabla 5** de la ASE 2024 (hoja 18, folio 19), su parrafo de
  obstruccion (hoja 9, folio 10) y sus causas de estenosis mitral (hoja 24, folio 25); los
  conductos de ventriculo derecho a arteria pulmonar de la **ACC/AHA 2025 de congenitas** (hoja 75,
  folio e189) y de la **ESC 2020 de congenitas INGLESA** (hoja 60, folio 622).

- **Lo que cambio**: `IND_SECS` pasa de **42 a 45**. Tres secciones nuevas —**Protesis aortica**,
  **Protesis tricuspide** y **Protesis pulmonar**— mas la mitral, que ya existia y gana el orden
  nuevo y su bloque de causas. La rama de protesis de `_indEA` deja de publicar la tarjeta «esta
  seccion no aplica» y devuelve `null`. `IND_GUIA_LBL` gana `vhd25` y `vhd20`.

- **El mecanismo**: una opcion por seccion, **`ordenProt`**, que pone el orden que el medico fijo
  —preguntas, «Con lo contestado», causas, «Ver detalle» plegado, bibliografia— e implica el molde
  de preguntas. Y **un solo ayudante de causas**, `_indCausas` + `_indCausasHTML`, parametrizado por
  valvula, cuyo `decide(clave)` devuelve tres estados: la rama que el algoritmo seniala (✅), la
  hermana medida y descartada (—) y la no decidible (❓).

- **TRES PREMISAS QUE NO SE REPRODUJERON**: (1) a la seccion mitral **no le faltaba ninguna** fila
  de la Tabla 17 —ya tenia las doce que alcanzan a esa posicion, con su clase—, asi que el 4a se
  **paro**; (2) el archivo de la ESC 2020 de congenitas que el nombre sugiere esta en **espaniol**
  y la edicion inglesa es otra; (3) la ASE 2024 **no da causas del gradiente alto para la
  tricuspide ni para la pulmonar**, asi que esas dos secciones no llevan bloque y lo **dicen**.

- **Lo que NO cambio**: cero campos guardados nuevos, Excel en **457** columnas, ningun id, y el
  **papel identico** —A/B con el PDF y el PPT generados de verdad: **cero diferencias de superficie
  firmada en las 108 escenas comparables y 22.032 claves**, con 96 de pantalla en tres claves del
  panel como control positivo—.

- **La verificacion**: suite **756/762** en catorce lotes y una sola pasada, con el pendrive
  verificado dieciseis veces y el md5 identico antes y despues; **38/38 mutaciones dirigidas
  muertas**; Chrome y WebKit coincidiendo en los **dieciseis** cruces con cero scroll y cero
  errores; Semgrep **124 / 0**; celular **59 y 67 con 18 ALTA**, la linea base exacta.

## PANT-20 — la protesis valvular, parte 4 de 5: el catalogo en la MITRAL, la TRICUSPIDE y la PULMONAR (2026-11-06)

**DOCE commits** -contados con `git log 694e9e3..HEAD` al cerrar, y el que escribe este numero
entra en la cuenta-, y los **siete de codigo se hicieron enteros**. El inventario de solo lectura; el
catalogo pulmonar (A7); el tricuspide (A9 y A8); el componente en la mitral, en la tricuspide y en
la pulmonar; las dos tablas de obstruccion en Referencias; y la cobertura con la documentacion.

- **Lo leido**: CINCO hojas de la ASE 2024 **en imagen a 300 ppp**, con la regla de folio = hoja+1
  comprobada en el **pie** impreso de las pares y en el **encabezado** de las impares. Tabla 15
  (hoja 32, folio 33), Tabla 19 (hoja 35, folio 36), Tablas A7 y A8 (hoja 61, folio 62) y Tabla A9
  (hoja 62, folio 63). Dos tablas de datos: **A7** con 12 modelos, 26 filas y 82 celdas, y **A9**
  con 8 modelos, 28 tamanos y 196 celdas (190 con dato y 6 impresas «NA»).
- **El hallazgo que obligo a extender la forma del dato: la A7 no tiene UNA forma de celda sino
  CUATRO.** Conviven media mas-menos DE, MEDIANA CON RANGO INTERCUARTILICO, valor unico y LIMITE
  SUPERIOR, y su propia nota al pie declara solo las dos primeras. La celda gano un TERCER elemento
  opcional con el TEXTO IMPRESO, que se carga solo cuando lo impreso no es «valor» ni
  «valor mas-menos desvio» y que la pantalla publica tal cual: asi no se pierde ni se inventa nada.
  Medido: 9 celdas de limite y 56 con texto impreso. De un limite NO sale ni una diferencia en
  desviaciones ni una EOA indexada. → **P20-a**.
- **Seis premisas del indice que no se reprodujeron**, todas medidas: la A8 no es «modelo x tamano»
  sino «referencia x situacion» y dos de sus tres columnas numericas estan en «NR»; la A9 esta
  TRANSPUESTA y trae ademas la EOA indexada de la propia serie; el tamano de la A7 no es siempre un
  numero; la Tabla 7 efectivamente no da cortes de EOA indexada para esas dos valvulas; y —la mas
  importante— **la aplicacion NO gradua la protesis tricuspide ni pulmonar con cortes de valvula
  nativa**: usa VT_PROT_T19 y VP_PROT_T15, que coinciden FILA POR FILA con lo leido en imagen. Lo
  que si faltaba es que esas dos tablas no tenian ficha en Referencias.
- **Donde va el boton en cada valvula, y por que.** En la TRICUSPIDE y la PULMONAR va en la MISMA
  fila del select, como en la aortica: su fila es un flex con UN solo hijo y deja 774 px libres a
  1440, 358 a 1000 y 286 a 768. En la MITRAL va en una FILA PROPIA debajo —la decision 5 del medico
  y la opcion (a) que P19-e dejo medida—, porque su fila es un grid de tres con el ancho acotado al
  boton «Insuficiencia». **TC-522 sigue verde POR CONSTRUCCION**: la fila nueva es HERMANA, y la
  grilla de tres conserva sus tres hijos y su ancho exacto en los cuatro anchos.
- **Un dueno unico para el PPM mitral.** La regla vivia DENTRO de `vmProtEOA`, que lee del DOM, asi
  que el componente no podia usarla sin copiarla. Se extrajo `_vmPpmClasificar`, con la misma forma
  que la aortica, sin mover una sola salida: su guarda NO exige «mayor que cero», al reves que
  aquella, porque agregarla cambiaria el resultado de un area de cero.
- **La decision 6 del medico, aplicada**: sin cortes publicados para la tricuspide ni la pulmonar,
  la «EOA indexada predicha» sale SOLO como numero, y el IMC deja de publicarse donde no elige
  ninguna rama de cortes.
- **La velocidad de E se convierte UNA vez.** La A9 la imprime en m/sec y el campo esta en cm/s. El
  medido lleva `fac:100`. Medido con Carbomedics Standard 31 (1,4 +- 0,19 m/s = 140 +- 19 cm/s):
  140 da +0.0 DE, 178 da +2.0, 121 da -1.0 y 102 da -2.0.
- **Un defecto de texto del componente de PANT-19, corregido**: sin area en la tabla la linea de
  abajo decia «falta el peso y la talla para indexar», o sea afirmaba que faltaba un dato del
  paciente que SI estaba cargado. Lo destapo la A5 y alcanza igual a la A4. → **P20-d**.
- **DOCE campos guardados nuevos y DOCE columnas de Excel**, 445 -> 457, con las 445 anteriores
  iguales y CERO encabezados con «EOA» o «AEO» (P19-g). Censo de campos 1004 -> 1016.
- **Dos fichas nuevas en Referencias**: la sub-pestana de protesicas pasa de CINCO a SIETE. Van
  DENTRO del contenedor, asi que REF_SUBTAB no se toca. **La primera version las dejo afuera y lo
  cazo la medicion, no la lectura.**
- **La verificacion de cierre.** **40/40 mutaciones dirigidas muertas** en worktree y nunca sobre
  el vivo, con el md5 del vivo identico antes y despues; el primer barrido dejo tres
  sobrevivientes y fueron **un hueco real** -de ahi nacio (D4), que ata la publicacion del PPM
  mitral a su dueno-, **una mal dirigida** -la mata (B3b) de TC-731, de PANT-19- y **una mal
  escrita**. Los seis casos nuevos **caen contra 694e9e3 por 52 condiciones y NINGUNA por
  excepcion**. A/B de **104 escenas**: las 2.808 diferencias son el **inventario** -doce campos,
  doce columnas y tres conteos- y **cero** de informe, EN SUMA, PDF, PPT ni Laboratorio.
  **Semgrep 124/0**, sin huerfanos nuevos. **Dieciseis cruces** en dos motores con **una** sola
  diferencia entre ellos, de 3 px de ancho de boton. **Celular 59 y 67 con 18 ALTA**, la linea
  base exacta.

- **Lo que quedo declarado**: la A8 cargada y sin consumidor (**P20-b**); la pulmonar comparando
  tres de sus cinco columnas, porque no hay campo de AT ni de area de la protesis pulmonar
  (**P20-c**); y la Tabla A6 afuera (**P20-e**).

## PANT-19 — la protesis valvular, partes 2 y 3 de 5: el catalogo de modelos y tamanos (2026-11-06)

**Ocho commits**, y el **commit 7 —el componente en la MITRAL— se paro y se reporta**. El
inventario de solo lectura; el catalogo aortico quirurgico; el de TAVI; el componente «Modelo y
tamano» en la aortica; la EOA frente a la del modelo en la tarjeta de severidad; el catalogo
mitral; y la cobertura con la documentacion.

- **Lo leido**: las ONCE hojas del apendice de la ASE 2024 **en imagen a 300 ppp**, con la regla
  de folio = hoja + 1 **comprobada en el encabezado impreso de cada una**, no deducida de dos.
  Tres tablas de datos: **A4** con 49 modelos, 211 tamanos y 523 celdas; **TAVI** (A1, A2 y A3)
  con 9 modelos, 29 tamanos y 78 celdas; **A5** con 30 modelos, 122 tamanos y 391 celdas. Las
  **once** filas de control del indice coinciden una por una.
- **Como se lee el simbolo mas-menos, que el PDF codifica como el caracter «6»: por GEOMETRIA.**
  El glifo mide 6,6 pt y un digito 4,4, asi que el exceso de ancho sobre lo esperado delata al
  simbolo. Lee bien «11 +- 6» —donde el seis es un desvio de verdad— y «21.46», que es «21.4 +-»
  pegado. 12 de 12 celdas de control contra la imagen.
- **Cinco premisas del indice que NO se reprodujeron, todas de estructura y ninguna de celdas**
  (P19-a): la Tabla A4 **no tiene subtitulos de seccion por tipo** —el unico indicio es una
  cursiva por fila que a veces es un descriptor de construccion y a veces un nombre comercial—;
  son 51 bloques y no «unos 45»; el tamano no es un numero sino TEXTO (hay nueve rangos y cuatro
  tallas S/M/L/XL); la A3 **si** imprime un tamano, «All»; y en A1 y A2 ningun modelo tiene los
  siete tamanos.
- **El tipo NO se adivina**: se asigna solo a los descriptores que nombran el mecanismo o el
  tejido, y los diez modelos sin descriptor —mas «Homograft valves» y «Sutureless»— quedan SIN
  DATO y se ofrecen bajo cualquier morfologia de protesis, que es el lado seguro.
- **El componente es UNO solo, parametrizado por posicion**: el dia que entren la tricuspide y la
  pulmonar se agrega una entrada al registro `VMOD_POS`. La card es unica y cuelga del body, y a
  900 px o menos es una hoja fija abajo. **La lista de sugerencias no se abre sola Y ADEMAS va en
  flujo**: flotando tapaba «No se el modelo: ver todos y elegir», medido antes y despues.
- **El papel cambia en UN solo lugar, y es el autorizado**: con una protesis quirurgica del
  catalogo cuya EOA tiene desvio, la desviacion del area respecto de la del modelo entra como eje
  independiente del flujo JUNTO al DVI. ⚠️ **Con el TSVI de 21 mm los dos se mueven juntos y la
  EOA no aporta nada** —los dos salen del cociente de los dos VTI—: lo que los separa es el
  DIAMETRO del TSVI, y con 16 mm el DVI se queda normal mientras el area cae dos desvios por
  debajo. Es la unica familia de escenas donde la tarjeta cambia de resultado, y un A/B que no la
  incluya da cero sin probar nada.
- **CUATRO campos guardados nuevos y CUATRO columnas de Excel** (441 -> 445), todos de la aortica
  y todos con guion BAJO. Recorren las siete listas, y el repintado va en TRES columnas —los dos
  registros de embudo y el final de `limpiarCampos`—: la tercera la cazo la sonda, porque los
  campos si los vacia el barrido generico pero el rotulo del boton no.
- **Lo que se paro y se reporta**: el componente en la MITRAL (P19-e), porque su fila de
  morfologia es un grid de tres con el ancho acotado al boton «Insuficiencia» que TC-522 vigila;
  y la Tabla A6 (P19-d), porque la morfologia mitral no tiene ninguna opcion de implante
  transcateter y su eje no es modelo x tamano. **Los datos mitrales SI quedaron cargados.**
- **Cerrado el mismo dia que se abrio**: P19-c —el PPM mitral SI usa los cortes mitrales de la
  Tabla 7—.
- **La columna del Excel se llama «AVA de referencia aortica» y no «AEO», y lo decidio un caso
  existente**: la condicion «(F) el Excel sigue en 441 columnas y NINGUN encabezado cambio de
  nombre» exige que ningun encabezado contenga «EOA» ni «AEO». Es ademas la sigla con la que el
  propio Excel ya nombra el area valvular aortica en la columna de al lado. El **id del campo no
  cambio**. → **P19-g**.
- **Cobertura**: **siete casos nuevos** (TC-729 a TC-735) que caen contra la linea base por
  **60 condiciones y NINGUNA por excepcion**, y **43/43 mutaciones dirigidas muertas** en
  worktree, con el md5 del arbol vivo identico antes y despues.
  ⚠️ **LAS 135 CONDICIONES ESTABAN ESCRITAS CON EL CONTRATO EQUIVOCADO**, que es la leccion que
  PANT-14b dejo escrita: el runner evalua `[descripcion, BOOLEANO, diagnostico]` y estaban
  `[descripcion, valor, esperado, diagnostico]`, asi que una con un valor truthy pasaba en verde
  SIN comparar nada y una con 0, false o cadena vacia fallaba teniendo el valor correcto. La
  conversion va en UN solo lugar por caso y se probo con su control positivo, su control negativo
  y el caso del cero en los dos sentidos.
  ⚠️ **Y EL PRIMER BARRIDO DEJO DOCE SOBREVIVIENTES Y SIETE ANCLAS QUE NO APLICARON, en CINCO
  clases distintas**: cinco huecos reales —con cinco condiciones nuevas—, dos frenos que tapaban
  a la mutacion —el Escape general de la app cierra la card igual, y el foco ya estaba puesto—,
  dos pares de guardas redundantes que se tapan mutuamente, una mal dirigida —apuntaba al
  borrador de la tarjeta y no al dueno que llega al estudio— y dos mal escritas. Esta todo en
  `docs/mapa/pant19-catalogo-protesis.md` § 7.
- ⚠️ **Y DOS CASOS EXISTENTES OBLIGARON A CAMBIAR LA APP, NO EL CASO**: TC-676 (D2) y TC-700
  (A5)(A6) fijan que `ccPuertaSync` va PRIMERO en los dos registros de embudo -enciende
  interruptores que los pintores LEEN-, y la primera version puso `vModSyncTodos` delante. Hoy va
  DESPUES de `ccPuertaSync` y de `vciNoVisSync`. Mas ONCE conteos de columnas del Excel adaptados
  -441 -> 445 y el mapa 365 -> 369-, ninguno encontrado por el censo porque estan escritos con
  otras palabras, y TC-483, cuya condicion de la media query media el DOCUMENTO ENTERO y lo que
  vigila es la vista 2D.
- **Linea base al cierre: suite 745/750**, en CATORCE lotes cubriendo los 750 casos distintos
  -750 de 750 ejecutados-, en UNA sola pasada sobre el arbol sellado, con el pendrive `DISK_IMG`
  verificado al abrir, en los catorce lotes y al cerrar, y el md5 de `index.html` IDENTICO antes
  y despues (`298cc61d`). Los rojos son TC-223, TC-376, TC-390 y TC-406, los cuatro de siempre,
  mas TC-557, el intermitente que `TGA-h` declara: corrido aislado pasa 3 de 3. **Ningun rojo
  nuevo.** Semgrep **124 WARNING / 0 ERROR**. Sin huerfanos nuevos. Celular **59 a 360 px y 67 a
  390, con 18 ALTA en cada ancho**: la linea base exacta.
- **A/B final: 92 escenas comparables y NINGUNA clave de informe, EN SUMA, PDF, PPT ni
  Laboratorio difiere.** Las cinco que cambian son el inventario del formulario -los cuatro
  campos y las cuatro columnas, vacios en las 92-. Y **CHROME Y WEBKIT COINCIDEN EN LOS DIECISEIS
  CRUCES**, con dos diferencias de metrica de fuente.
- **Donde esta todo**: `docs/mapa/pant19-catalogo-protesis.md` (**mapa NUEVO**),
  `docs/INVENTARIO_CATALOGO_PROTESIS_P19.md`, las tres transcripciones celda por celda
  (`docs/TRANSCRIPCION_A4_P19.md`, `docs/TRANSCRIPCION_TAVI_P19.md`,
  `docs/TRANSCRIPCION_MITRAL_P19.md`), las fichas de los siete casos en
  `docs/mapa/tests-fichas-729.md` (archivo propio), los punteros en
  `docs/mapa/protesis-valvular.md` y `docs/mapa/tests-punteros-tandas.md`,
  `docs/fuentes/FUENTES.md` → «La tanda PANT-19»,
  `docs/GUIA_PRUEBA_PANT19.md` → la guia manual en **26** pasos, y `docs/PENDIENTES.md` →
  **SIETE** cosas declaradas (**P19-a** a **P19-g**).

## PANT-18 — la protesis aortica, parte 1 de 5: el tiempo de eyeccion, el AT/ET, la TAVI graduada y el desajuste (2026-11-06)

**Nueve commits.** El inventario de solo lectura; el tiempo de eyeccion y el AT/ET; la nota del AT
reescrita contra la hoja impresa; el bloque de Referencias; la tarjeta de severidad resumida; la
TAVI graduada con cortes absolutos; el desajuste que no se escribe con una estenosis significativa;
el estado visual del boton «Severidad»; y la cobertura con la documentacion.

- **Lo medido**: la Tabla 5 y la Figura 13 leidas EN IMAGEN a 300 ppp en la hoja 18, con el folio
  **19 comprobado en el pie impreso**. Las seis premisas del medico se reprodujeron con el gesto
  real. El texto visible de la tarjeta de severidad baja de **772 a 345** caracteres con una
  protesis mecanica y de **841 a 193** con una TAVI; la seccion de la valvula aortica, de **723 a
  697 px** a 1440 y de **884 a 858** a 1000.
- **Dos premisas que NO se reprodujeron, las dos a favor de hacer menos**: el AT **ya** tenia sus
  tres tramos desde la Fase 2, y **ya existia** un campo de tiempo de eyeccion reutilizable
  (`tango_te`, en Doppler), asi que no se agrego ningun campo guardado ni ninguna columna de Excel.
- **El papel cambia en los DOS lugares autorizados y en ninguno mas**: la TAVI emite la misma
  frase de severidad que las demas protesis aorticas, y con «sugiere estenosis protesica
  significativa» el informe y el EN SUMA dejan de escribir la frase del desajuste. A/B contra HEAD
  con el PDF y el PPT generados de verdad: las escenas de control —«posible», «sin criterios»,
  «falta un dato», la valvula nativa y el estudio ajeno— dan **cero**.
- **Cobertura**: seis casos nuevos (TC-723 a TC-728) que caen contra HEAD por **57 condiciones y
  ninguna por excepcion**, **34/34 mutaciones dirigidas muertas** y cuatro casos viejos adaptados
  —TC-288, TC-290, TC-291 y TC-303—, los cuatro el dia que ellos mismos anunciaban.
- **Donde esta**: `docs/mapa/pant18-protesis-aortica.md`, `docs/INVENTARIO_PROTESIS_AORTICA_P18.md`,
  `docs/mapa/tests-fichas-723.md`, `docs/fuentes/FUENTES.md` y `docs/PENDIENTES.md` (P18-a a P18-g).

## PANT-17b — la transparencia del 3D, la Evidencia que se arma con lo contestado y el control de las diez secciones (2026-11-06)

**Seis commits.** La transparencia del corazon maestro (el material de malla de alambre pasa a un
sombreado de silueta con alfa por pixel); el inventario del formato y el control de las diez
secciones, de solo lectura; el formato nuevo de la Evidencia de congenitas en diecisiete
secciones, con un solo emisor; y el control, que agrego ocho recomendaciones leidas en imagen y
dos preguntas nuevas.

- **Lo medido**: el centro de una estructura sin color deja ver del **95,1 % al 100 %** de lo que
  se ve con esa estructura oculta, contra **2,9 % a 80,9 %** con la malla anterior, en 40
  mediciones por tema y por motor. El contenido visible de la Evidencia del ductus con 10 Si y 3
  No baja de **2.582 a 2.145 px** a 1440 y de **4.838 a 3.827** a 390.
- **Cobertura**: TC-720, TC-721 y TC-722 nuevos; **24/24** mutaciones dirigidas muertas; trece
  casos viejos adaptados.
- **Papel**: CERO diferencias de superficie firmada.
- **Donde esta**: `docs/mapa/pant17b-transparencia-evidencia.md`,
  `docs/INVENTARIO_EVIDENCIA_P17B.md`, `docs/CONTROL_EVIDENCIA_P17B.md`,
  `docs/GUIA_PRUEBA_PANT17B.md`, `docs/PENDIENTES.md` → P17b-a a P17b-f.

# EcoSmart — registro de tandas


## PANT-17 — la Evidencia de congénitas, la ventana aortopulmonar y el color al tocar (2026-11-06)

**Trece commits**, contados con `git log 040d89e..HEAD` al cerrar, el que escribe este número incluido. Al empezar, `HEAD` =
**`040d89e`** (cierre de PANT-14c), md5 `276361e9`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | qué hizo |
|---|---|
| `5bb5951` (1) | el renombre a «ACC/AHA 2026» **se PARA**: el título oficial dice 2025 y sólo la revista dice 2026 → `P17-e` |
| `f3f578c` (2) | inventario y plan de la Evidencia de congénitas (**solo lectura**, md5 idéntico) |
| `ddbcf28` (3) | el cuestionario del ductus (13) y el de la coartación (13, cinco pre-respondibles) |
| `f968f0b` (4) | la Fallot reparada gana una **segunda** sección —VD y arritmias— y la estenosis pulmonar una tercera columna |
| `713012a` (5) | la conclusión de la bicúspide (11) y la MCH obstructiva (13); `_indMCHSCD` y la aorta ascendente de la VAB **intactas** |
| `04b4ee2` (6) | **la ventana aortopulmonar**: sección nueva de seis preguntas, SIN clase ni nivel, desde una serie de casos |
| `8943a59` (7) | **el color al tocar** una estructura del corazón maestro |
| `4dbe85d` (8) | el control de las diez secciones (**solo lectura**); la mitad que exige leer queda en `P17-c` |
| `ee62781` (9a) | los seis casos nuevos, TC-714 a TC-719 — se commitean apenas parsean |
| `55ed587` (9b) | los seis caen contra el árbol anterior por **56 condiciones y CERO excepciones** |
| `abed600` (9c) | **20 de 20 mutaciones dirigidas muertas**, en worktree y con guarda de md5 |
| `25874a1` (9d) | cobertura y documentación |
| éste (9e) | corrige el número de commits: son **trece**, contados al final |

**La regla central: nada clínico salió de la memoria.** Todo lo que la tanda escribe se leyó en
imagen a 190 ppp o más, con el folio comprobado en el pie impreso. Las seis reglas de folio y
las transcripciones están en `docs/fuentes/FUENTES.md` → «La tanda PANT-17».

**Tres cosas que el índice daba por buenas y la hoja impresa desmintió:** el superíndice de la
fila 1 de la Tabla 69 de la ESC 2024 son **dos** referencias y no una; las filas de su Tabla 68
llevan **de dos a siete** superíndices, no uno; y la Tabla 20 de la ESC 2023 tiene una **séptima
fila** que el índice omite.

**Lo que NO se escribió, y por qué:** la TAVI sobre bicúspide de la ESC/EACTS 2025 (el PDF de la
biblioteca es la versión adelantada: su pie imprime «36» y no 4670), el valor normal del Tei del
ventrículo izquierdo (ninguna fuente lo publica) y el conducto del VD a la pulmonar (el selector
de la aplicación no tiene ese valor). En `P17-a`.

**Dónde está todo:** `docs/mapa/pant17-evidencia-congenitas.md` (mapa NUEVO),
`docs/INVENTARIO_RENOMBRE_ACCAHA.md`, `docs/INVENTARIO_EVIDENCIA_P17.md`,
`docs/INVENTARIO_COLOR_AL_TOCAR_P17.md`, `docs/CONTROL_EVIDENCIA_P17.md`,
`docs/GUIA_PRUEBA_PANT17.md` (26 pasos) y `docs/PENDIENTES.md` → **P17-a** a **P17-e**.


## PANT-14 — el esquema negro, el botón del PDF, la transposición y las siete lesiones (2026-11-05)

**Nueve commits**, los ocho de la orden y el de cierre. Sello **`v20261105-1004`**.
Al empezar, `origin/main` = `HEAD` = **`dc65d2f`** (cierre de PANT-13), sello `v20261105-0008`,
md5 `00825a73`. **El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | qué hizo |
|---|---|
| `cb3b08b` (1) | el esquema de circulación ya no sale con las cajas negras: `cmSchPal` resuelve los colores al dibujar, con respaldo por tema; redibuja al cambiar de tema y de ancho; la letra de la válvula dorada pasa a tinta fija |
| `9da2ba3` (2) | «Incluir en el PDF» de punta a punta: **funciona, y no se cambió una línea** |
| `5033a47` (3) | las reglas de la transposición pasan a ser las del 3D de la pestaña; la obstrucción subaórtica se dibuja; **el dibujo viejo NO se retira** |
| `c76e161` (4) | el inventario de las siete pestañas, y el Fallot y la coartación conectados |
| `0c664af` (5) | la estenosis pulmonar y las dos estenosis aórticas |
| `b5c8c2f` (6) | el defecto AV, Ebstein y Fontan, y las reglas de conjunto |
| `a336661` (7) | la verificación de conjunto: 92 escenas, el A/B del PDF de cuatro estudios |
| `b131e64` (8a) | cobertura: seis casos nuevos, TC-693 a TC-698 |
| `aca82a3` (8b) | los seis en verde: tres defectos propios que la corrida destapó |
| **éste** (8c) | documentación, mapa, pendientes y sello |

### Lo que cerró

- **El esquema negro, con su causa en una línea**: `--card` no existe en esta aplicación, así que
  un `fill="var(--card)"` de atributo cae en el negro heredado. 53 elementos negros por cruce en
  los 16 cruces, contraste 1,32 → **0 negros y 5,93**. El esquema del PDF estaba igual de roto.
- **Un segundo defecto del esquema, preexistente**: la rama del switch auricular reasigna un
  objeto declarado `const` y **abortaba el dibujo entero**.
- **Las reglas de la transposición**: estaban equivocadas en cuatro de las cinco variantes.
  160 escenas, **0 diferencias sin obstrucción** (HEAD tenía 23).
- **Las siete lesiones conectadas**: Fallot, coartación, estenosis pulmonar, las dos aórticas,
  defecto AV, Ebstein y Fontan. 92 de 92 escenas iguales a «Explorar».
- **La única base con su orden de prioridad**, medida en los diez pares.
- **La línea que se contradecía**: decía «todas dibujadas» al lado de «no se dibujan juntas».

### Lo que NO se hizo, y por qué

- **El dibujo de la transposición no se retiró** (3e): la equivalencia del **esquema de
  circulación** no cierra — son dos dibujos distintos, con tamaños de letra, rótulos y sentidos de
  flecha diferentes, 0 de 25 escenas iguales. → `P13-c` y `P14-d`.
- **Cuatro casillas del dibujo** que ninguna pestaña puede encender → `P14-b`.

### Los denominadores

Suite, Semgrep **124 WARNING / 0 ERROR**, Excel **441** columnas, censo de campos **994 y 1010**
según la escena, **sin huérfanos nuevos**, celular **59 a 360 px y 67 a 390 con 18 ALTA** en cada
ancho —idéntico a HEAD—, **34 de 34** mutaciones dirigidas muertas con md5 idéntico antes y
después, y **cero campos guardados nuevos y cero columnas de Excel**.

---
> **Un solo archivo, un bloque por tanda, para que otra herramienta lo lea.** Cada bloque trae el
> nombre de la tanda, su fecha, los códigos y títulos de sus commits, tres líneas de qué cambió y
> lo que quedó pendiente. Creado por la tanda **CONG-2A** (punto 5b).
>
> ⚠️ **NADA DE LO QUE HAY ACÁ SE INVENTÓ.** Los códigos, los títulos y las fechas salen de
> `git log`; el «qué cambió» y los pendientes, de las secciones de «Estado vigente» de
> `CLAUDE.md` y de `docs/PENDIENTES.md`. Lo que esas dos fuentes no dicen, acá no está.
> ⚠️ **Y NO REEMPLAZA A `CLAUDE.md`:** la bitácora de cada tanda —qué se midió, qué premisa
> resultó falsa, qué trampa se pagó— sigue en «Estado vigente» y en `docs/HISTORIAL_CLAUDE.md`.
> Esto es el índice.
>
> **Cómo se agrega un bloque:** al cerrar una tanda, se copia el molde de abajo con sus commits
> tal como los imprime `git log --format="%h|%ad|%s" --date=short --reverse`, y se escriben las
> tres líneas y los pendientes. El archivo va en orden cronológico, el más nuevo al final.

---

### Segunda mitad — commits 6 a 10 (2026-11-03)

| commit | qué |
|---|---|
| `ca412db` 6 | **MCA**: dos columnas de criterios del eco, tres de categorías, conclusión a la derecha, cuatro globos. La zona no ecocardiográfica a todo el ancho **por medición** |
| `7db905a` 7 | **Fallot**: tres globos y conclusión a la derecha. La disposición en tres columnas **PARADA**; el recuadro que se contradecía, retirado |
| `6bb3e71` 8a | **Estenosis subaórtica**: los **DOS** cortes rotulados medio y pico, cada uno con guía, hoja, folio y condición |
| `11ccfe7` 8b | **Estenosis supravalvular**: ídem, con la salvedad de que la guía no publica recuadro propio |
| `27aa986` 9 | **Arritmia ventricular**: primera sección, «Limpiar», tarjeta, valor nuevo «Parada cardíaca recuperada», espejo condicional de MCH |
| `ae9d1b4` 9b | **El arreglo estructural**: la mudanza rompía las dos sub-pestañas y MCA cerraba un div de más |
| `9691de6` 10 | **PSAP, PmAP y PDAP** en 25 rótulos de pantalla |
| `6dff25f` 10b | los tres rótulos que el censo de origen no encontró y sí el caso |
| — 11 | cobertura y documentación |

**Lo que se midió:** A/B por commit contra el árbol anterior, **cero** diferencias de superficie
firmada en los commits 6, 7, 8a, 8b y 10, y en el 9 la **única** diferencia es la descripción del
valor nuevo. **33/33 mutaciones muertas.** Cinco casos nuevos, **TC-628 a TC-632**.

**Lo que quedó parado:** la disposición en tres columnas de Fallot (**P3-i**), y ocho cosas más
en `docs/PENDIENTES.md` → **P3-i** a **P3-p**.

## PANT-3 — los botones CIA y CIV, el esquema de la TGA, el corazón maestro, MCH, MCA, Fallot, las dos estenosis aórticas, la arritmia ventricular y los rótulos de presión (2026-11-02 y 03)

**Veinticinco commits** —los once de la orden, hechos enteros, más los de cobertura, los de
cierre y los de documentación—. Las horas de cada uno salen de `git log`, no de una estimación. Línea base al abrir:
`origin/main` = `HEAD` = **`efce508`**, sello `v20261102-2051`, md5 `8af4c80b`, pendrive
`DISK_IMG` montado. Al cerrar: sello **`v20261103-0256`**, md5 **`0422963d`**.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | qué | estado |
|---|---|---|
| `5504f6d` | **1** — los botones CIA y CIV marcan la lesión y la llevan al informe | cerrado y verificado |
| `bc363f6` | **2** — los rótulos del esquema de la TGA y su ⓘ sin el cartel | cerrado y verificado |
| `eeb3ccf` | **3** — el censo de los carteles de «revisión pendiente» y lo que se retiró | cerrado y verificado |
| `75b555f` | **4** — el botón «3D» del corazón maestro, fase 1 | cerrado y verificado |
| `15098a5` | **5** — la pantalla de MCH en tres columnas | cerrado y verificado |
| `ca412db` | **6** — la pantalla de MCA | cerrado y verificado |
| `7db905a` | **7** — la pantalla de Fallot | cerrado; su disposición en tres columnas, PARADA → P3-i |
| `6bb3e71` · `11ccfe7` | **8a** y **8b** — estenosis subaórtica y supravalvular aórtica | cerrado y verificado |
| `27aa986` · `ae9d1b4` | **9** y **9b** — el módulo compartido de arritmia ventricular, y el arreglo estructural | cerrado y verificado |
| `9691de6` · `6dff25f` | **10** y **10b** — los rótulos PSAP, PmAP y PDAP | cerrado; una fila PARADA → P3-q |
| `69bda9e` · `71a340d` · `db0564d` · `6bb1732` · `7fe47b5` · `e97cd34` | **11** — cobertura y documentación, en cinco tramos | cerrado |
| `cfe6079` | **4b** — el pie del corazón maestro es dueño de su `display` | cerrado y verificado |
| `a0d6f8d` | **12** — el rótulo del TEP que se decía dos veces, y los once rojos de la corrida completa | cerrado y verificado |
| `901748a` | **13** — la sonda de dos motores medía sobre dos denominadores de cero | cerrado y verificado |
| `be55fa0` | **14** — la condición que pedía más que la orden, y el paso 43 de la guía | cerrado y verificado |

**Lo que más pesó, en una línea cada uno:**
- el botón «CIA» no significaba nada y `showTab` lo desmarcaba al cambiar de pantalla, porque
  barre `.active` de todo `.tab-btn`; hoy es un dato del estudio que viaja con él;
- los rótulos del esquema: **61 cruces desnudos y 14 rótulos pisados → 0 y 0**;
- el censo de «revisión pendiente» encontró **una sola** frase visible, y se reescribió en vez de
  borrarse porque su mitad informativa evita un error;
- el corazón maestro **no dibuja nada nuevo**: presta el recuadro que ya existía;
- la pantalla de MCH pasa de **1287 a 939 px** a 1440, con el censo de ids intacto;
- el commit 9 **cortó el documento por el medio** —se llevó el cierre de `#tab-congenitas` y la
  apertura de `#tab-congenitas2`—, y lo gritó la propia app por consola; hoy el módulo se extrae
  por **balance de etiquetas** y el defecto lo fija **TC-631 (H)**;
- la fila del TEP se leía **«PSAP  PSAP 45 mmHg»**: es la única parada del commit 10, y la
  encontró **TC-519 (O6)**, un caso de otra tanda.

**Cuatro fuentes leídas en imagen**, con su regla de folio comprobada en el pie impreso: ESC 2022
(Zeppenfeld), hoja 66 → folio 4062; AHA/ACC 2024 (Ommen), hojas 9 → e1247 y 29 → e1267; más las
cuatro hojas de los cortes de la obstrucción subaórtica.

**Al cierre:** suite **641/647**, con **647 de 647 ejecutados** en doce lotes y en una sola pasada;
rojos **TC-223, TC-376, TC-390, TC-406** y los dos intermitentes declarados **TC-551** y
**TC-557**, ninguno nuevo. **33/33 mutaciones dirigidas muertas.** **Campos guardados 1002 →
1004**, los dos autorizados. **Excel 441** columnas con las mismas claves. **Semgrep 124 WARNING /
0 ERROR.** **Celular 59 a 360 px y 68 a 390, con 17 ALTA.** **Dieciséis cruces de dos motores sin
una diferencia entre ellos.** `index.html` **11,09 MB / 155.230 líneas**; el diff son **1.219
líneas agregadas y 221 quitadas** contra `efce508`.

**Declarado y no arreglado:** `docs/PENDIENTES.md` → **P3-a** a **P3-s**, con **P3-h** y **P3-q**
cerrados. Guía de prueba manual en **43** pasos en `docs/GUIA_PRUEBA_PANT3.md`.

## TANDA NOCTURNA, Parte A — «A» · 2026-10-30

- `427aa06` A1: el esquema de la orejuela al lado de los campos, y los dos rotulos que se pisaban
- `6b589b6` A2: el esquema se mueve con el latido, y el cuadro que el medico elige gana
- `42c4ccb` A3: el globo de «Orejuela izquierda» se reescribe con otro enfoque
- `b9f824d` A4: borrar un estudio se lleva tambien sus videos y sus cineloops (cierra IMG-a)
- `08dd2e9` A3-b: la tarjeta de un globo deja de poder ser mas alta que la pantalla
- `4e47037` A5: TC-551, las catorce mutaciones, la documentacion y el sello de la Parte A

**Qué cambió.** El esquema de la orejuela pasó a estar al lado de los campos y dejó de pisar sus
propios rótulos; gana el cuadro que el médico elige y se anima con el latido. Borrar un estudio
recoge además sus videos y sus cineloops, que no tenían recolector. Y una tarjeta de ⓘ ya no
puede ser más alta que la pantalla.

**Pendiente.** `NOC-A-a` a `NOC-A-h` — entre ellos, el chorro de insuficiencia es central siempre
porque el velo afectado no existe en la app, y dos fuentes que la orden nombraba y no están en la
biblioteca.

---

## TANDA NOCTURNA, Parte B — «B» · 2026-10-30

- `9e70ba6` B1: el TRIV del VD tambien en las referencias de VD/AD, como dato de referencia
- `779902a` B2: el indice de tamanio aortico se calcula solo, y el iDA se publica con un decimal
- `9d422ca` B3: la aortopatia hereditaria publica el sindrome, el diametro y «dilatada», y nada mas
- `9c479cc` B5: TC-552, las catorce mutaciones, la documentacion y el sello de la Parte B

**Qué cambió.** El índice de tamaño aórtico se calcula solo y sólo se publica en Turner. El
informe firmado de una aortopatía hereditaria dejó de llevar la recomendación con su clase, su
nivel, su tabla y su folio: de cinco escenas que publicaban una clase a cero en diez.

**Pendiente.** `NOC-B-a` a `NOC-B-g`. El commit **B4 no se hizo**: son dos cambios clínicos sobre
el papel firmado —cortes nuevos por sexo para la unión sinotubular y la ascendente— y empezarlo
sin poder cerrarlo habría dejado un cambio clínico a medias.

---

## TANDA CORRECCIONES — «COR» · 2026-10-30

- `1853085` COR-1: el informe de la orejuela publica las medidas y ningun veredicto de aptitud
- `48461eb` COR-2: un solo corte de 75 ms para el TRIV, y la frase de elementos a favor de HTP en tres formas
- `03e8919` COR-3: la grilla de VD/AD en tres columnas de seis, simetrica y sin huecos
- `b9493e8` COR-4: la raiz cargada en AI/VI se VE en la pantalla de Marfan, y Turner dice que le falta
- `37f2bf2` COR-5: «Incluir en el PDF» funciona siempre, es un interruptor y es independiente de Config
- `67c6f7d` COR-6: el esquema de la orejuela portado de la demo, sin reinterpretar
- `ac5d1b4` COR-7: TC-553, las veinticuatro mutaciones, la documentacion y el sello

**Qué cambió.** El informe firmado dejó de declarar a un paciente «no apto para cierre
percutáneo». El TRIV quedó con un corte único de 75 ms y un dueño único de la frase de elementos
a favor de hipertensión pulmonar. Y «Incluir en el PDF» de la orejuela, que no incluía nada
—cero imágenes con Config prendido y apagado—, pasa a poner el esquema como slot.

**Pendiente.** `COR-a` a `COR-g`. Dos frases de conducta quedan reportadas y sin tocar, y el
cuadro de referencias de VD/AD no se reordenó.

---

## TANDA AJUSTES-1 — «AJ1» · 2026-10-30

- `612dd82` AJ1-1: la orejuela sin recomendaciones ni ruido
- `05569e8` AJ1-2: el PDF sin repetir la orejuela, y la VAB con su resumen al costado
- `cc6e0fd` AJ1-3: el EN SUMA nombra la valvula aortica bicuspide
- `3f6e436` AJ1-4: la frase del gradiente, con su fuente leida en imagen
- `ed321eb` AJ1-5: la fila de miniaturas de lo que va al PDF
- `ad0067f` AJ1-6: TC-554, las catorce mutaciones, la documentacion y el sello

**Qué cambió.** Con una bicúspide cargada y nada más, el EN SUMA decía «Estudio sin alteraciones
estructurales ni funcionales significativas»: hoy la nombra. El PDF dejó de repetir la orejuela y
la fila de miniaturas muestra lo que va al papel, con su ✕ para quitarlo.

**Pendiente.** `AJ1-a` a `AJ1-g`. El orden de los diagramas en la fila se paró: reordenarlos
exige inventar y persistir un orden, o sea un campo guardado nuevo.

---

## TANDA AORTA-2 — «AO2» · 2026-10-30

- `13a7e58` AO2-1: los otros segmentos de la Figura 5 — la union sinotubular y la aorta ascendente por sexo
- `fa7c865` AO2-2: la bicuspide y la coartacion — el EN SUMA, los tres textos de pantalla y los umbrales
- `2e61d47` AO2-3: la Evidencia de la bicuspide con la Tabla 68 y sus nueve factores en tres estados
- `5cc2a36` AO2-4: TC-555, las catorce mutaciones, los trece casos adaptados y la documentacion

**Qué cambió.** Una unión sinotubular de 34 mm en una mujer salía «Aorta torácica de calibre
normal» en el informe firmado: hoy los dos segmentos se gradúan por sexo con los valores de la
Figura 5. Las seis casillas de factores de riesgo de la bicúspide salieron de la pantalla y sus
nueve factores pasaron a tres estados en la Evidencia.

**Pendiente.** `AO2-a` a `AO2-g`. La línea integrada del EN SUMA de la coartación y
`coaConclusion().txt` siguen publicando clase y folio.

---

## TANDA D2 — «D2» · 2026-10-30

- `1866fd2` D2-1: la calculadora no clasifica sin farmaco elegido
- `f973566` D2-2: las seis columnas de la Tabla 4 — anti-VEGF, BCR-ABL, mieloma y RAF/MEK
- `1c03919` D2-3: las tablas A y C de HFA-ICOS se dibujan desde el dueno que clasifica (D-c)
- `8c198a8` D2-4: el monitoreo de inmunoterapia y de anti-VEGF (D-g)
- `420a67b` D2-5: TC-556, las quince mutaciones, los catorce casos adaptados y la documentacion

**Qué cambió.** Con el selector de fármaco vacío la calculadora de riesgo cardiovascular
clasificaba igual, y el informe firmado publicaba «riesgo alto» sobre un paciente sin tratamiento
elegido. Las seis columnas de la Tabla 4 entraron enteras y las tablas A y C dejaron de
contradecir al dueño que clasifica.

**Pendiente.** `D2-a` a `D2-g`. La tabla B no se tocó: agrupar fármacos en bandas no tiene
equivalente en la Tabla 4.

---

## TANDA AJUSTES-2 — «AJ2» · 2026-10-30 y 31

- `ed6ab4d` AJ2-1: la coartacion en el papel, sin recomendaciones y sin guias
- `3e40fbb` AJ2-2: todo diagrama incluido se guarda con el estudio y aparece en Guardados
- `8376605` AJ2-3: la orejuela que «a veces queda y a veces no» en el PDF — determinista
- `26e7dd3` AJ2-4: el ⓘ de la fila de miniaturas y «Manga de viento» sin riesgo
- `93cc85c` AJ2-5: el ⓘ del TRIV en VD/AD y en el Doppler tricuspide
- `aff0b87` AJ2-6: el barrido del papel — las DOS conductas que quedaban
- `07ffe05` AJ2-7: TC-557, las dieciocho mutaciones, los siete casos adaptados y la documentacion

**Qué cambió.** El informe firmado de una coartación mandaba a medir el gradiente pico-pico
invasivo y citaba la guía con su figura y su folio: hoy describe. Con Config prendido y cuatro
diagramas incluidos, el estudio guardado quedaba con cero imágenes y cero esquemas. Y el barrido
de las cuatro superficies encontró cinco menciones de conducta, de las que se retiraron dos.

**Pendiente.** `AJ2-a` a `AJ2-g`. `congenitas-otros.md` quedó a 500 bytes del techo y la
coartación vive ahí.

---

## TANDA IMÁGENES-3 — «IMG3» · 2026-10-31

- `f6e3197` IMG3-1: el visor de «Imagenes guardadas» reproduce el video en bucle y se agranda
- `69c9bff` IMG3-2: el PPT con video — el cuadro fijo, el aviso de 100 MB y el de privacidad
- `92ba745` IMG3-3: el motor de tercios de las hojas de diagramas del PDF
- `d172624` IMG3-4: la linea de texto de cada diagrama
- `822a261` IMG3-5: la CIA debajo de su texto (R-4) y las capturas al final (R-5)
- `197df0d` IMG3-6: la comparacion con la demo aprobada y la cobertura de la Parte B
- `6c8dc0f` IMG3-7: la capsula de la coartacion en la app, sin guia ni conducta
- `2ea773e` IMG3-8: las dos citas que quedaban en el papel
- `0eecc32` IMG3-9: el PPT de congenitas sin guia, sin clase y sin conducta
- `c5dc409` IMG3-10: cobertura y documentacion de toda la tanda; la PARTE D declarada y no hecha

**Qué cambió.** El estudio de prueba del médico pasa de cinco hojas de PDF a tres y sus diagramas
de cinco hojas a una, con un motor de tercios declarativo que no corta ningún dibujo por
construcción. El visor reproduce el video en bucle. Y el PPT de congénitas poda la guía, la clase
y la conducta, con una regla de todo o nada.

**Pendiente.** `IMG3-a` a `IMG3-j`. La **PARTE D** —el diagrama 3D de la transposición— no se
hizo: su inventario sí, y decidió que sólo dos de los seis escenarios de la demo eran alcanzables
con los datos que la app tenía.

---

## TANDA TGA — «TGA» · 2026-10-31

- `b85f3ea` TGA-1: la cirugia realizada y el valor de anatomia d-TGA
- `0c1337d` TGA-2: el diagrama 3D de la transposicion, portado de la demo aprobada
- `7f6540b` TGA-3: la cirugia realizada en el informe y en el EN SUMA
- `61f6968` TGA-4: cobertura, documentacion, la PARTE B parada y el experimento del bucle

**Qué cambió.** El diagrama 3D de la transposición entró portado de la demo aprobada, con
three.js r128 cargada sólo al abrir la sección y con su hash SRI verificado por dos caminos. Se
agregó UN campo guardado —la cirugía realizada— y un valor nuevo de anatomía, d-TGA. La
comparación con la demo dio 20 de 20 escenarios alcanzables idénticos.

**Pendiente.** `TGA-a` a `TGA-h`. Jatene y Rastelli quedaron parados porque el informe firmado
afirmaba que el ventrículo derecho es el sistémico. La **PARTE B** —retirar del PPT la
recomendación de desfibrilador de la miocardiopatía hipertrófica— se paró porque su fuente no
estaba en la Evidencia.

---

## TANDA TGA-2 — «T2» · 2026-10-31

- `5d0d942` T2-1: Jatene y Rastelli habilitados, con el papel describiendo y no interpretando
- `1f60647` T2-2: la Evidencia de la transposicion, con sus preguntas en tres estados
- `4018b24` T2-3: la Evidencia de la comunicacion interauricular, con sus nueve preguntas
- `d902f59` T2-4: la Evidencia de la comunicacion interventricular, con sus siete preguntas
- `d6ddb02` T2-5: la Tabla 23 de la ESC 2023 entra en la Evidencia; la poda del PPT sigue PARADA
- `7fde2ff` T2-6: cobertura, documentacion, el sello y lo que quedo PARADO
- `8d37a65` T2-6b: el recuento de preguntas del panel era 26 y son 38

**Qué cambió.** Jatene y Rastelli se publican: la decisión del médico lo resolvió por el lado del
texto —con esas dos cirugías el papel describe y no interpreta— y no del campo. Cuatro secciones
del panel de Evidencia pasaron a preguntar, con 38 preguntas de tres estados. La comparación con
la demo pasó de 20 a 30 de 30.

**Pendiente.** `TGA2-a` a `TGA2-h`. Tres campos quedan parados porque su redacción nombra el
ventrículo o la válvula sistémico. La **Parte C** se hizo a medias: la AHA/ACC 2020 que el PPT
cita no está en la biblioteca.

---

## TANDA AJUSTES-3 — «AJ3» · 2026-10-31

- `bcc333b` AJ3-1: el bucle del video entra en los DOS caminos de PPT
- `37fe3ab` AJ3-2: los botones de respuesta de la Evidencia, a 44 px tambien con mouse
- `d851260` AJ3-3: la clausula de la IT sistemica de la TGA vuelve, en el ⓘ de su seccion
- `eaea958` AJ3-4: la miocardiopatia hipertrofica del PPT describe, y la AHA/ACC 2024 entra en la Evidencia
- `ddb3fa5` AJ3-5: se parten los dos mapas que estaban al techo
- `bae00b8` AJ3-6: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** El bucle del video entró en los dos caminos de PPT, con validación estricta y
falla cerrada: si una diapositiva no valida, ninguna se escribe. Los botones de respuesta del
panel pasaron a 44 px también con mouse, lo que cerró cinco solapes reales. Y la línea de la
miocardiopatía hipertrófica del PPT describe, con la AHA/ACC 2024 leída en imagen cargada en la
Evidencia.

**Pendiente.** `AJ3-a` a `AJ3-g`. La etiqueta «AHA/ACC 2020» seguía en el informe, el EN SUMA y
el PDF, y el cuerpo que el PPT proyecta seguía nombrando guías.

---

## TANDA CONG-2A — «CONG-2A» · 2026-10-31 y 2026-11-01

- `655ffc2` CONG-2A-1: la morfologia aortica es el quinto origen de la seccion de la VAB
- `1f8d30b` CONG-2A-2: la pantalla de la TGA, campos a la izquierda y dibujo a la derecha
- `30714c9` CONG-2A-3: el 3D dentro de su recuadro, corazon normal por defecto y las comunicaciones de sus pestanas
- `ce1a6a6` CONG-2A-4: los cuatro dibujos de los criterios TEER, a la derecha de su campo
- `4894cee` CONG-2A-5a: el papel de la miocardiopatia hipertrofica describe, sin guias ni conducta
- `07b695c` CONG-2A-5b: las dos reglas fijas en CLAUDE.md y el registro de tandas
- CONG-2A-6: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** La matriz de «desmarcar» barrió los 105 selectores con opción vacía de las
diecinueve secciones de congénitas y encontró uno solo que sobrevive, en la válvula bicúspide, con
su causa en la morfología aórtica de Válvulas. La pantalla de la TGA quedó con los campos a la
izquierda y el dibujo a la derecha, el 3D dentro de su recuadro y con el corazón normal por
omisión, y los cuatro dibujos de los criterios TEER pasaron a la derecha de su campo. Y el papel
de la miocardiopatía hipertrófica dejó de nombrar guías, clases y la recomendación del
desfibrilador.

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md`.

---

## TANDA POP-A — «POP-A» · 2026-11-01

- `162aa9d` POP-A-1: las tres columnas independientes del posoperatorio y sus rotulos
- `49864a0` POP-A-2: un solo campo «Elegir farmaco» y el azul de metileno
- `3561bf9` POP-A-3: asistencia, monitoreo en columnas y los datos hemodinamicos
- `67038f5` POP-A-4: cirugias combinables, valvulas operadas y drenajes
- `d1bd8ad` POP-A-5: una sola tarjeta «Eco y POCUS», con el derrame pericardico por su dueno
- `bc1ad49` POP-A-6: la disposicion de abajo, con el dibujo identico a HEAD
- POP-A-7: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** La pestaña de posoperatorio pasó de una pila de seis tarjetas —2096 px a 1440 px
y 2857 a 1000, medido— a **tres columnas independientes**, cada una su propio contenedor flex, con
el corte sobre la ventana en 900 px. El monitoreo dejó de ser un acordeón y es una tarjeta fija
con el Swan en tres columnas agrupadas y el PiCCO en dos. Las once casillas de fármacos pasaron a
**un panel absoluto** que se abre desde un botón único y no empuja nada, con el **azul de
metileno** como fármaco nuevo: sin unidad, sin fórmula por peso, fuera del patrón y fuera del
dibujo. «Tipo de cirugía» pasó a **cuatro casillas combinables** con el estudio viejo que se lee y
no se reescribe, más las cuatro válvulas operadas con su tipo tomado de Válvulas y los tres
drenajes. El eco y el POCUS quedaron en una sola tarjeta, el derrame pericárdico ganó una segunda
puerta a su dueño, y abajo el dibujo quedó a media pantalla con las características y la
conclusión a su derecha.

**El dibujo del esquema no se tocó**, y está verificado nodo por nodo contra `47ff639`: 77 nodos,
firma del SVG idéntica, `viewBox` idéntico. Eso es la tanda POP-B.

**Dieciocho campos guardados nuevos**, todos de la lista autorizada, y **Excel 441 → 441**.

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md` → **PA-a** a **PA-i**.

---

## POP-B — arreglos de POP-A y la primera mitad del dibujo del posoperatorio (2026-11-01)

- `dbdc5bf` POP-B-1: el boton «Integrar al informe» del posoperatorio ya dice por que no puede
- `a7662ba` POP-B-2: el tipo de una valvula operada son SOLO las protesis, y el papel no dice una nativa
- `423eb8a` POP-B-3: el conteo de farmacos cuenta las filas, no las casillas mas la asistencia
- `1469c7b` POP-B-4: Pleura y pulmon a ancho completo, y el eco con el VD al lado
- `7bd3e14` POP-B-5: el inventario del dibujo, los textos sin superponerse y el derrame pleural dibujado
- `5b43c4a` POP-B-6: el puente, la malla de la aorta y los tres drenajes
- `a0850ca` POP-B-7: las cuatro valvulas operadas con su tipo y su latido
- POP-B-8: cobertura, documentacion, el sello y lo que quedo PARADO

**Qué cambió.** El botón «Integrar al informe» del posoperatorio **conserva el `title` que dice
por qué no puede integrar** —`_amiloAvisoPintar` se lo borraba 220 ms después, en los ocho árboles
medidos—. El tipo de una válvula operada ofrece **sólo las prótesis** que su dueño tiene, con una
morfología nativa queda en «elegir tipo» y lo **avisa** nombrándola, y el **papel ya no describe
la cirugía con una morfología nativa**. El contador de fármacos cuenta **las filas** y no las
casillas más la asistencia. «Pleura y pulmón» salió a una tarjeta de **ancho completo** debajo de
las tres columnas y la ecocardiografía quedó al lado del ventrículo derecho: la columna más alta
bajó de **1228 a 647 px**.

**Y el dibujo ganó cuatro capas.** El derrame pleural pasó de una elipse igual para los tres
grados a un **nivel de líquido** que sube con el grado, recortado con la misma ruta que dibuja el
pulmón. Entraron el **puente aortocoronario**, la **malla del injerto de aorta**, los **tres
drenajes** y las **cuatro válvulas operadas** con su tipo —mecánica, biológica o anillo punteado
sin tipo— latiendo con la **frecuencia cargada**, la aórtica y la pulmonar en sístole y la mitral
y la tricúspide en diástole. Y los **tres textos que se superponían** dejaron de hacerlo: cero
superposiciones y cero textos fuera del lienzo en treinta escenas.

**Ningún campo guardado nuevo, ningún id cambiado y Excel en 441 columnas.** El papel sólo se
mueve donde la orden lo autoriza: una válvula operada con morfología nativa pasa de
«tricúspide — Mixomatosa» a «tricúspide — sin tipo consignado».

**Pendiente.** Ver el bloque de esta tanda en `docs/PENDIENTES.md` → **POPB-a** a **POPB-g**.

---

## MARFAN-1 — la tarjeta de criterios con el artículo original (2026-11-01)

**Siete commits.** `8d95df3` (1, el score del Box 2 y los diecinueve campos) · `31ee701` (2, las
siete reglas del Box 1) · `b032969` (3, el papel describe los rasgos) · `7d39fb9` (4, la pantalla
y el globo de «Conducta aórtica») · `b98ae7a` (5, un globo por rasgo) · `aeeae9e` (6, la figura
que se transforma) · el de cobertura y documentación.

Al empezar, `origin/main` = `HEAD` = **`27a917d`**, el cierre de POP-B, ya publicado, con sello
`v20261101-0834` y md5 `b6e61443`. **El push lo corre Maicol.**

**Qué hizo:** corrigió la tarjeta de criterios de Marfan con el artículo original (Loeys 2010),
leído en imagen; convirtió sus rasgos en diecinueve campos del estudio; implementó las siete
reglas del Box 1 sólo en pantalla; hizo que el papel describa los rasgos sin la regla; reordenó
la pantalla; agregó veintiún globos con la definición del artículo; y portó la figura que se
transforma desde la demo del médico.

**Qué dejó pendiente:** `MF1-a` a `MF1-h` en `docs/PENDIENTES.md` — el Z que no es campo
guardado, las reglas 3 y 6 con el formulario vacío, las otras cinco categorías del artículo, el
lado del neumotórax, lo que la figura todavía no tiene, la Evidencia de aortopatías, los dos
mapas al techo y la segunda mitad del caveat.

**Dónde está todo:** `docs/mapa/marfan1-ghent.md` (mapa nuevo, 11,1 KB) y
`docs/mapa/tests-fichas-586.md` (fichas, archivo propio).

---

## MARFAN-2 — la pantalla de Marfan, su tarjeta y el Z de la raíz (2026-11-02)

**Cinco commits.** `23212e2` (1, la sección en columnas) · `b626253` (2, la tarjeta en una sola
pantalla) · `92b1cda` (3, la conclusión sin indicaciones) · `0d2217d` (4, el Z) · el de cobertura
y documentación. Al empezar, `origin/main` = `HEAD` = **`40fb624`**, el cierre de MARFAN-1, ya
publicado, con md5 de `index.html` **`05086dab`** y el pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Qué hizo:**
1. La sección en dos columnas —síndrome y factores a la izquierda, los dos diámetros a la
   derecha— y el texto largo de la guía al globo de la sección.
2. La tarjeta de criterios **de 1307 px con 538 de scroll interno a 826 sin ninguno**, en tres
   bandas con la figura a la derecha; los globos **de veintiuno a cuatro**, con el glifo estándar
   de la app, sin perder una sola de las diecinueve definiciones; los selectores sin texto
   cortado y el puntaje de la **opción elegida**; las reglas en una línea.
3. La conclusión en **cuatro filas ordenadas** y la pastilla diciendo si **cumple** o **no cumple**
   los criterios en vez de indicar una cirugía — ampliación de la regla fija: la pantalla tampoco
   da indicaciones.
4. El **Z de la raíz** como campo guardado que viaja con el estudio, con las reglas 1, 2, 3 y 7
   leyéndolo también sobre un estudio archivado.

**Qué PARÓ y por qué:** el **Z calculado**, porque el artículo de Devereux 2012 **no está en la
biblioteca** —censado por contenido sobre los 245 PDF, con control positivo—, y porque lo que el
Loeys cita para ese método es su referencia 13 (Roman 1989), que tampoco está. Y la **nota del
Laboratorio**, que quedó vencida pero está fuera del alcance de la orden.

**Qué dejó pendiente:** `MF2-a` a `MF2-h` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/marfan2-pantalla-z.md` (mapa nuevo, 12,4 KB) y
`docs/mapa/tests-fichas-591.md` (fichas, archivo propio).

---

## POP-C — el posoperatorio terminado, Marfan y el dibujo al PDF · 2026-11-02

**Commits** (`git log --format="%h|%ad|%s" --date=short --reverse`):

```
4593686|2026-11-01|POP-C-1: el selector del tipo de valvula operada sigue a Valvulas
afdd4da|2026-11-01|POP-C-2: la linea de Marfan dice solo lo positivo, y el Z de la raiz se calcula
7356d94|2026-11-01|POP-C-3: la hemodinamica del posoperatorio con el consenso de shock
20b164a|2026-11-01|POP-C-4: integrar con cualquier dato, y los tres avisos que salian sin color
e14e17a|2026-11-01|POP-C-5: las valvulas del dibujo son las de la demo v9, con su latido
e2a794b|2026-11-01|POP-C-6: los chorros de insuficiencia, sincronizados con su valvula
3093691|2026-11-01|POP-C-7: los cateteres del Swan y del PiCCO en el dibujo
8f50dc6|2026-11-01|POP-C-8: las cavidades siguen al dato medido, y el anillo del derrame al tamano
4fe6947|2026-11-01|POP-C-9: los trazados de TAPSE y de E/A dentro de las cavidades
1e3514e|2026-11-01|POP-C-10: el esquema del posoperatorio entra al PDF
```
(más el commit 11, de cobertura y documentación.)

**Qué hizo:**
1. **El selector del tipo de válvula operada** sigue a Válvulas: el sentido Válvulas →
   posoperatorio **no funcionaba en ninguna de las cuatro** —ni al poner la prótesis, ni al
   cambiarla, ni al sacarla— porque `popCxVSync` tenía un solo llamador, `popSync`, que el
   barrido de espejos excluye a propósito.
2. **La línea de Marfan** escribe sólo lo positivo, y **el Z de la raíz se calcula** con la
   ecuación de Devereux 2012, leída en imagen: cierra **MF2-a**. El manual siempre gana, el
   calculado no se guarda y no llega al papel.
3. **La hemodinámica del posoperatorio** con el consenso de la SAC 2024: el corte de bajo gasto
   pasa a estricto —sólo en el posoperatorio, declarando la divergencia con Hemodinámica—, la
   precarga muestra su valor sin banda ni veredicto, el pericardio lista sus signos y los dos
   rótulos nombran de dónde vienen el patrón y los cortes del VD.
4. **«Integrar al informe» con cualquier dato** (cierra **POPB-a**) y los **tres avisos globales**
   que salían sin color (cierra **POPB-h**): el anillo del botón **no se dibujaba en absoluto**.
5. **El dibujo**: las válvulas de la demo v9 con su apertura rotatoria, los chorros de
   insuficiencia sincronizados con la fase contraria a su válvula, los catéteres del Swan y del
   PiCCO, las cavidades siguiendo al dato medido, el anillo del derrame creciendo con el tamaño
   (cierra **POPB-d**) y los trazados de TAPSE y de E/A.
6. **El esquema entra al PDF** con su casilla, su epígrafe fijo y su fila en el registro de
   diagramas (cierra **POPB-e**).

**Qué PARÓ y por qué:** el **corte de 21 mm del pericardio**, porque no existe —`DPT_VCI_PLETORA_MM`
ya vale 20 y los únicos 21 mm son de la probabilidad de HTP, que es otra guía y otro módulo—.

**Qué dejó pendiente:** `POPC-a` a `POPC-j` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/popc-posoperatorio-marfan.md` (mapa nuevo, 17,2 KB) y
`docs/mapa/tests-fichas-595.md` (fichas, archivo propio).

---

## TANDA TGA-3 (2026-11-01) — la conclusión a la izquierda, el papel sin conductas y el esquema de circulación

**Commits:** `d2261f4` (1) · `d2cb912` (2) · `91ae620` (3) · `1c9eb6d` (4) · `60aebc3` (5) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`96b7ff0`**, el cierre de POP-C,
ya publicado, con md5 de `index.html` **`747b6597`** y sello `v20261101-2008`. **El push lo corre
el médico: esta tanda tenía orden expresa de NO pushear.**

**Qué hizo:**

1. **La conclusión de la TGA pasa a la columna izquierda** (pedido del médico), al hueco que la
   maqueta de CONG-2A dejaba vacío bajo los campos: medido, **368 px de alto por 549 de ancho a
   1440 px** y 475 × 358 a 1000. Su contenido **no cambia** —214 caracteres en los dos árboles— y
   `#tga-fila` sigue con **dos** hijos, así que la maqueta de 900 px no se mueve.
2. **La conducta de la TGA sale del papel.** Medido en HEAD con la sección integrada:
   «seguimiento anual» salía **una** vez en el informe en cada uno de los **tres** estilos, **tres**
   veces en cada una de las **seis** plantillas del PDF y **una** en el PPT; y la rama de la
   insuficiencia tricuspídea llevaba **«(ESC 2020)»** al informe firmado. Censo de once marcadores
   por las once superficies: **381 → 0**. `tgaConclusion` gana la salida `papel`, derivada de la
   **misma** lista de partes, así que las dos salidas no pueden divergir.
3. **El esquema de circulación de la sangre**, dentro del recuadro del 3D y al lado del 3D: cuatro
   cavidades, pulmones arriba, cuerpo abajo, las dos válvulas y las comunicaciones en naranja,
   **sin selector** —lee los mismos dueños que el 3D— y **solo lectura**.
4. **Las tres cirugías** (switch auricular, Jatene, Rastelli) con su **control clínico hecho antes
   de dibujar** contra `TGA3D_CIRC`, que es de la app y no la prosa de la demo. Los seis
   recorridos **coinciden**, así que ninguno quedó parado.
5. **La TGA corregida**, el **ⓘ** del esquema y dos detalles que pidió la verificación: la rama
   `descriptivo` también devuelve `papel` —y eso **cierra una regresión del commit 2**, que había
   dejado la diapositiva de Jatene y Rastelli sin su fila de conclusión— y la tipografía mínima
   del SVG sube de 11 a 12 en el `viewBox`.

**Qué NO se movió:** ni un corte, ni un umbral, ni una clase, ni un folio. **Cero campos guardados
nuevos**, Excel en **441** columnas con las mismas claves, censo de campos idéntico, Semgrep **124
WARNING / 0 ERROR** y celular **59 / 68 con 17 ALTA**, la línea base exacta.

**Qué se declaró con su medición en vez de decidirlo:** el corte de la maqueta en **1200 px** y no
en 900 —al lado, a 1000 px el 3D quedaría en **126 px**, inservible—; el `resumen` que ya no lee
ninguna superficie; el esquema fuera del PDF; la diapositiva del PPT sin condición en la suite; la
conducta que sigue en la **pantalla** porque la orden lo pide por los dos lados; y las dos
conductas que la Evidencia no respalda.

**Qué dejó pendiente:** `T3-a` a `T3-g` en `docs/PENDIENTES.md`.

**Dónde está todo:** `docs/mapa/tga3-esquema-circulacion.md` (mapa nuevo, 16,7 KB) y
`docs/mapa/tests-fichas-601.md` (fichas, archivo propio).

---

## VAL-PPT (2026-11-02) — las opciones de plastia, TEER y TAVI, los retoques y el PPT

**Commits.** DOCE. `9da2a0e` (1) · `7f25750` (2) · `76a458a` (3) · `84e5196` (4) · `71d76a6`
(5a) · `1aa31be` (6) · `84f1941` (7) · `a0e8dd6` (8) · `2073e3e`, `aa43ecc`, `67a71b9` y
`7bd0b6a`, los cuatro de cobertura y documentación.
Sello **`v20261102-0107`**, md5 de `index.html` **`738944d2`**.
Al empezar, `origin/main` = `HEAD` = **`5ae3959`**, el cierre de TGA-3, ya publicado, con md5
**`7ff2a3f2`** y el pendrive `DISK_IMG` montado. **El push lo corre Maicol.**

**Qué hizo.**
1. Cuatro opciones nuevas —plastia y TEER en la mitral y en la tricúspide— como **valores** de
   los campos de morfología que ya existían, en sus **tres listas paralelas**, y el selector del
   posoperatorio ampliado a TAVI, plastia y TEER por construcción.
2. Los tres globos de Válvulas con lo que la fuente dice de cada tipo **y lo que no define**.
   Ningún corte nuevo.
3. El papel describe los tipos nuevos, y el EN SUMA deja de negar una mitral intervenida que es
   el único hallazgo.
4. Los tres símbolos del dibujo del posoperatorio, portados de la demo v9.
5. Las tres etiquetas del TEER salen del papel y se quedan en la pantalla.
6. El rótulo de la miocardiopatía hipertrófica pasa a 2024, verificado en imagen.
7. La disposición del PPT elige la de mayor área sin deformar, y el número pasa a ser opcional.
8. La diapositiva inicial, la final y el diseño de fondo elegible.

**Qué se paró y se reportó.** El commit 5b entero (cuatro conductas de la TGA sin respaldo en la
Evidencia), el 6a (su premisa no se reproduce), el Laboratorio y «TAVI de cambio».

**Cobertura.** Cuatro casos nuevos, TC-605 a TC-608, que caen contra HEAD por **46 condiciones y
ninguna por excepción**. **24/24 mutaciones dirigidas muertas.** **Diecisiete casos viejos
adaptados**, los diecisiete destapados por la corrida completa: nueve en el 9b (TC-13, TC-289,
TC-470, TC-471, TC-472, TC-474, TC-500, TC-502, TC-535) y ocho en el 9d —los cuatro del TEER
(TC-74, TC-86, TC-92, TC-GR-07), que exigían el veredicto en la hoja del PDF, y los cuatro del
posoperatorio (TC-580, TC-583, TC-585, TC-595)—. De ahí nacieron la condición **(E9c)** —ninguna
pieza de plastia, TAVI ni TEER encendida sobre una prótesis mecánica— y la **mutación 23** que
la mata.

**La excepción de `CLAUDE.md` que dejó de ser cierta.** Decía que las tres etiquetas del TEER
«llegan a la hoja del PDF … y se quedan». El commit 5a las sacó del papel por orden expresa de
Maicol; la primera mitad de la regla —no se tocan, siguen en la pantalla— se conserva, y la
segunda se corrigió con la medición al lado.

**Línea base al cierre.** Suite **617/623** en doce lotes, 623 de 623 ejecutados, md5 de
`index.html` idéntico antes y después (`738944d2`), pendrive verificado en las catorce
oportunidades. Rojos: TC-223, TC-376, TC-390 y TC-406 (los cuatro de siempre) más TC-182 y
TC-551 (intermitentes declarados, verdes aislados). Semgrep 124 WARNING / 0 ERROR. Excel 441
columnas. Cero campos guardados nuevos. Celular 59 / 68 con 17 ALTA. `index.html` 10,91 MB /
153.139 líneas, sello `v20261102-0107`.

**Lo que queda para el médico.** Abrir en PowerPoint los tres `.pptx` de
`~/Desktop/ceibo-ppt-valppt/` (**VP-f**) y correr el `git push`, que esta tanda tenía prohibido.
→ `docs/PENDIENTES.md` **VP-a** a **VP-j**.

**Cobertura.** TC-605 a TC-608, que caen contra HEAD por **46 condiciones y ninguna excepción**;
**23/23 mutaciones dirigidas muertas**; tres condiciones nacidas del barrido.

**Dónde está todo.** `docs/mapa/valppt-opciones-ppt.md` · `docs/mapa/tests-fichas-605.md` ·
`docs/fuentes/FUENTES.md` → «La tanda VAL-PPT» · `docs/GUIA_PRUEBA_VALPPT.md`.

---

## CORR-EVID — las correcciones de VAL-PPT y la ACC/AHA 2025 en la Evidencia (2026-11-02)

**Commits:** `b49ea1e` (1) · `696fa5f` (2) · `b617556` (4 y 5) · `c1c3f7b` (6 y 7) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`91dd547`**, el cierre de
VAL-PPT, ya publicado, con md5 de `index.html` **`738944d2`** y sello `v20261102-0107`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Lo que hizo.**
- **Commit 1** — el EN SUMA nombra siempre la válvula reparada, con su insuficiencia en la misma
  línea y sin repetirla aparte. Dueño único `valvRepSuma`; la pasada de VAL-PPT-3 se retira.
- **Commit 2** — PARADO tras medirlo: el dato SÍ llega al dibujo y los cuatro símbolos son
  distintos. La comparación sobre el **SVG que renderiza la app** contra la demo v9 da **8 de 8
  iguales**. Lo que falta es la casilla de válvula operada, que es una decisión de diseño.
- **Commit 3** — PARADO tras medirlo: la fila del conteo **ya decía 2024**. Lo que el médico ve es
  la tarjeta de criterios, que es otra superficie.
- **Commits 4 y 5** — el molde de «una pregunta, una guía» (`IND_GUIA_LBL`, `_indPregNota`,
  `acc2025achd`) y la Evidencia de la transposición con las **dos** guías: 18 + 12 + 12 + 8
  preguntas.
- **Commits 6 y 7** — la Evidencia de la comunicación interauricular y de la interventricular, 14
  preguntas cada una, con tres notas de tramo y dos diferencias de clase declaradas.
- **Commit 8** — PARADO: de las cuatro conductas de la pantalla de la TGA, dos quedan respaldadas,
  una parcialmente y una no.

**Lo que dejó declarado:** `CE-a` a `CE-g` en `docs/PENDIENTES.md`.

---

## TGA-4 — el PDF de la transposición, el panel compacto y la conclusión descriptiva (2026-11-02)

**Commits:** `8294072` (1) · `ca110fa` (2) · `4873668` (3) · `30adbbe` (4) · `38df3b4` (5) · el de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`7f7d5ec`**, el cierre de
CORR-EVID, ya publicado, con md5 de `index.html` **`16cf562a`** y sello `v20261102-1206`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Lo que hizo.**
- **Commit 1** — tres retoques del papel firmado: el prefijo «Segun la guia: » sale del recuadro
  de las **nueve** hojas de congénitas que lo emitían (la plantilla es compartida); la cláusula
  «complicación esperable en la ccTGA» sale del bloqueo auriculoventricular, porque esa rama la
  recorren tres anatomías y en dos nombraba otra; y la caja «Tricúspide / PSAP» del PDF nombra la
  **válvula** pulmonar cuando hay datos, con el mismo arreglo que el bloque ya le había hecho a
  la **vena** pulmonar.
- **Commit 2** — el esquema de circulación entra al PDF **al lado del 3D y con el mismo botón**.
  Pre-rasterización con el patrón del posoperatorio; el motor de tercios no se toca. Cierra la
  mitad de PDF de **T3-c**. Dos defectos los encontró la propia medición: el esquema de la vista
  de **referencia** se rasterizaba, y generar el PPT y enseguida el PDF **perdía** el esquema.
- **Commit 3** — el panel de Evidencia de la transposición, compacto: una línea por pregunta con
  tres estados «Sí | No | ?», etiqueta corta de guía, el detalle en el ⓘ debajo de la fila,
  contador, lista de lo contestado que sí, la frase del pie **una** vez, dos columnas por ancho de
  **panel** con su botón, y cuatro grupos sólo en el switch auricular. La causa de los 104 px por
  pregunta no era la prosa —ya estaba plegada— sino que los dos botones se apilaban en 60 px.
- **Commit 4** — la conclusión de **pantalla** de la transposición pasa a descriptiva; cierra
  **T3-e**, **T3-f**, **VP-a** y **CE-d**. Y el corte de **50 mmHg** se buscó en las dos guías
  completas y se **PARÓ**: existe para la estenosis subaórtica en la ACC/AHA (pico ≥50, texto de
  apoyo sin clase) y la ESC 2020 lo **bajó** a media ≥40; en el capítulo de la transposición no
  hay ningún número.
- **Commit 5** — la CIA y la CIV con el mismo molde compacto. La bicúspide, que comparte el molde,
  **no se movió**: medido.

**Lo que dejó declarado:** `T4-a` a `T4-h` en `docs/PENDIENTES.md`, incluida la decisión del
médico sobre los símbolos de las válvulas del posoperatorio, que se quedan como están.

---

## PANT-2 (2026-11-02) — el color del esquema en el PDF, el ⓘ del panel, las dos columnas y las frases de la TGA

**Seis commits de los trece que la orden pide.** Base: `d3f42b0` (cierre de TGA-4), sello
`v20261102-1645`, md5 `c96543c6`. **El push lo corre el médico: esta tanda tenía orden expresa de
NO pushear.**

| commit | qué |
|---|---|
| `b335dbf` | **corrección A** — el esquema de circulación del PDF sale con sus colores y la línea dice el escenario una sola vez |
| `b87a299` | **corrección B** — el ⓘ de una pregunta se cierra al tocar fuera, con Escape y al abrir otro |
| `26999d4` | **corrección C** — las Evidencias de más de 6 preguntas, en dos columnas y con filas compactas |
| `cba0a47` | **corrección D** — el informe de la transposición se adapta a lo cargado y escribe menos |
| `b511f1c` | **commit 1** — inventario de las congénitas, auditoría de sincronías y las dos copias de la guía (SOLO LECTURA) |
| (este) | **commit 9** — cobertura, documentación y la línea base al cierre |

**Lo que NO se hizo:** los commits **2 a 8** (MCH, el botón «3D» del corazón maestro, MCA, Fallot,
las dos estenosis aórticas, la arritmia ventricular y los rótulos de las presiones pulmonares).
**Ninguno se empezó** y ninguna línea de la aplicación se tocó por ellos; la orden prohíbe dejar
una pantalla a medias. Ver `docs/PENDIENTES.md` → **P2-a** y `docs/CONTINUACION_PANT2.md`.

### Lo que cerró, en una línea cada uno

- **A** — el esquema del PDF tenía las seis cajas con una fracción de casi negros de **1,000** y
  moda RGB(4,4,4): el marcado se rasteriza fuera del documento, donde `var(--bg)` no resuelve y
  `fill` cae en negro. Peor distancia moda-vs-pantalla **419,7 → 6,6**; contraste del texto
  **1,02 → 14,5-17,3 : 1**. El censo destapó que el esquema del **posoperatorio** también salía
  mal (113 `var()`), y el mismo arreglo lo cubre.
- **B** — la nota de una pregunta no se cerraba hasta tocar el mismo ⓘ otra vez y se podían abrir
  varias a la vez. Hoy se cierra al tocar fuera, con Escape —dejando el panel abierto— y al abrir
  otra, con `aria-expanded` siguiendo al estado.
- **C** — el panel ponía los datos del estudio a la izquierda y las preguntas a la derecha, o sea
  las preguntas en media pantalla. Hoy los datos van arriba y las preguntas debajo, en dos
  columnas: el alto baja un **32 a 36 %** maximizado y un 7 % a 390 px.
- **D** — el informe decía «Función del ventrículo derecho sistémico con disfunción moderada» y el
  EN SUMA «función del VD sistémico no consignada» con el dato vacío. Hoy nombra el hallazgo
  directo y no menciona lo que no está cargado.
- **1** — 19 secciones, 272 campos, 35 espejos, 53 frases; cinco casos de tipo 2 reportados sin
  unir; y las dos copias de la ACC/AHA 2025 **son la misma versión publicada**.

### Cobertura

**TC-619 a TC-622**, que caen contra HEAD por **29 condiciones y ninguna por excepción**.
**19/19 mutaciones dirigidas muertas**, en worktree y con md5 del árbol vivo idéntico.
**Cuatro casos adaptados**: TC-293, TC-451, TC-615 y TC-616.

---

## PANT-4 — las dos estenosis aórticas, «Task Force» fuera del papel, los textos contra su fuente, la Evidencia de aortopatías y los estadios (2026-11-03)

**Línea base al abrir:** `origin/main` = `HEAD` = **`1e4b70c`**, sello `v20261103-0256`, md5 de
`index.html` **`0422963d`**, 11,09 MB / 155.230 líneas, pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | qué |
|---|---|
| `da890c6` + `ff5de8c` | **1b/1c/1d** — la alineación por `subgrid`, el papel descriptivo de las dos estenosis y la conclusión de pantalla sin conducta |
| `f7e6cb2` | **1e** — la Evidencia de las dos lesiones, leída en imagen en cuatro hojas |
| `2716cdd` | **2** — «Task Force 2010» fuera del papel de la miocardiopatía arritmogénica |
| `c676ba4` | **3** — los tres textos de pantalla contra su fuente |
| `b21ad0a` | **5** — la cita de aorta reconciliada y la insuficiencia aórtica con aorta dilatada |
| `ff8c56d` | **6** — el estadio de la AHA/ACC 2020 en las dos válvulas aórticas |
| `997ed1e` + el de cierre | **7** — cobertura y documentación |

**El commit 4 no tocó una línea de la app, y es una medición la que lo para.** La premisa de
**P3-j** es falsa —PANT-3 dejó MCA **más baja**, no más alta, en los cuatro anchos y en los dos
denominadores— y la de **4b** tampoco se cumple: Fallot tiene **cinco** filas de campos y **un**
solo título de grupo. Las dos están en `docs/PENDIENTES.md` → **P4-b** y **P4-a**.

**Lo que cerró:** **P3-m** (la frase de la resonancia, con su cita) y **P3-r** (TC-502 devuelve el
estilo de informe).

**Verificación:** 27/27 mutaciones dirigidas muertas en una sola pasada; A/B por commit con PDF y
PPT generados de verdad; seis casos nuevos (TC-633 a TC-638) que caen contra HEAD por **116
condiciones y cero excepciones**; siete casos viejos adaptados.

**Dónde está todo:** `docs/mapa/pant4-estenosis-evidencia.md` (**mapa nuevo**),
`docs/fuentes/FUENTES.md` → «La tanda PANT-4», `docs/GUIA_PRUEBA_PANT4.md` (20 pasos) y
`docs/PENDIENTES.md` → **P4-a** a **P4-i**.

---

## PANT-5 — el dibujo de sobrecarga del VD, el Forrester y cinco pantallas (2026-11-03)

**Los NUEVE commits de código se hicieron enteros**, en el orden que la orden fija.

| commit | qué |
|---|---|
| `4c2fc62` | **1** — el dibujo de sobrecarga del VD en Hemodinámica, portado de la demo aprobada |
| `cd5a720` | **2** — el Forrester a la derecha de los datos, y el mensaje de lo que falta una vez |
| `e60bdcc` | **3** — la conclusión de las dos estenosis aórticas, descriptiva y sin guía |
| `6068a1c` | **4** — el derrame pericárdico y el taponamiento en cuatro columnas por tema |
| `92a7bd7` | **5** — la CIA y la CIV lado a lado, y el diagrama de bordes más chico |
| `c39635d` | **6** — la longitud de los velos mitrales, un dato con dos puertas |
| `ff77df1` | **7** — la Fallot reparada en tres columnas por tema |
| `9d65244` | **8** — constricción vs restricción, los cuatro campos de a dos |
| `b6f3a76` | **9** — los estadios de la AHA/ACC 2020 de las cuatro válvulas que faltaban |
| `bae95f6` … el de cierre | **10** — cobertura y documentación |

**Lo que cerró:** **P4-a** (la disposición de Fallot, que estaba parada por falta de grupos: esta
orden los trae), **P4-d** (la atribución a la edición AHA/ACC 2020, retirada de la pantalla) y
**P4-f** (los estadios de las cuatro válvulas).

**Lo que paró, con su medición:** la disposición en tres columnas de la mitral del ETE —exige
fundir tres acordeones con sus dos casillas de inclusión (**P5-e**)—; la profundidad de
coaptación, que es un duplicado **ambiguo** y el censo de la propia app ya lo declara (**P5-f**);
la tercera aparición del mensaje del Forrester, cuyo texto **llega al papel** (**P5-b**); y el
texto cortado de la tabla del dibujo, que **no se pudo reproducir** (**P5-i**).

**Tres premisas no se confirmaron:** la (iii) del commit 6 es **parcialmente falsa** —la etiología
y el Carpentier **ya sincronizan** en los dos sentidos y el mecanismo no tiene par (**P5-g**)—; la
(iv) no se reproduce sobre una tabla poblada; y el desplazamiento horizontal de 30 px a 899 y
900 px es **preexistente**, medido idéntico en HEAD (**P5-j**).

**Las cuatro tablas de estadios se leyeron EN IMAGEN a 200 ppp**, con su folio **comprobado en el
pie impreso de cada hoja** —regla folio = e(hoja + 71), comprobada en las cuatro y no sólo en dos
como hasta ahora—: Tabla 16 (hoja 42, e113), 17 (50, e121), 18 (57, e128) y 20 (61, e132).

**Verificación:** 30/30 mutaciones dirigidas muertas en worktree, con el md5 idéntico antes y
después; A/B por commit con PDF y PPT generados de verdad; cinco casos nuevos (TC-639 a TC-643)
que caen contra HEAD por **86 condiciones y cero excepciones**; la geometría del dibujo del VD
comparada contra la demo en **10 de 10 escenarios**.

**Línea base al cierre:** **suite 652/658**, en doce lotes cubriendo los **658 casos distintos**
(658 de 658 ejecutados), con el pendrive `DISK_IMG` verificado al abrir, en los doce lotes y al
cerrar, y el md5 de `index.html` idéntico antes y después (**`98d60651`**). Rojos: **TC-223,
TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-182 y TC-551**, los dos intermitentes
declarados; **ningún rojo nuevo**. La corrida dio 650/658 con **TC-628** y **TC-635**, los dos
míos y los dos adaptados —TC-635 **invertida**, y es el día que ese caso anunciaba—. **Semgrep
124 WARNING / 0 ERROR**, **Excel 441** columnas, **censo 1004** sin un campo guardado nuevo,
celular **58 a 360 px y 66 a 390 con 17 ALTA** (la línea base exacta), y **Chrome y WebKit
idénticos en los dieciséis cruces** con cero errores de consola. El **A/B final de 25 escenas**
da **UNA** diferencia de superficie firmada, la autorizada del commit 6. Sello
**`v20261103-1546`**, **11,22 MB / 156.792 líneas**, diff **1.164 / 152** contra `dbfc0c3`.
**Son DIECISIETE commits**: los nueve de código más ocho de cobertura y documentación.
**El push lo corre Maicol.**

**Dónde está todo:** `docs/mapa/pant5-pantallas-vd.md` (**mapa nuevo**, 14,0 KB),
`docs/fuentes/FUENTES.md` → «La tanda PANT-5» con las cuatro tablas transcritas,
`docs/GUIA_PRUEBA_PANT5.md` y `docs/PENDIENTES.md` → **P5-a** a **P5-j**.

## PANT-6 (2026-11-03 y 04) — la pantalla de CIA y CIV, el dibujo del VD, el molde de la Evidencia, la mitral del ETE y los criterios TEER

**Commits:** `f75d1cc` (1 · CIA y CIV) · `69d7e9b` (2 · el dibujo del VD) · `a238240` (3 · el molde
de la estenosis mitral) · `47b82fb` (4 · la mitral del ETE en una sección) · `36e05f6` (5 · los
criterios TEER) · `9ac2aa9` (6 · el Forrester y los dos rótulos) · `ffa1b0c` · `1b16530` ·
`9a311a6` · `460121e` (7a-7d · el molde en las otras cinco válvulas) · `3a8bf04` y los de
cobertura y documentación. Al empezar, `origin/main` = `HEAD` = **`c42d9e3`**, el cierre de
PANT-5, con md5 `98d60651`. **El push lo corre Maicol.**

**Qué cerró, en una línea cada cosa:**
- **La pantalla de CIA y CIV se rehizo entera.** Los botones ya **no** deciden la maqueta: la CIA
  siempre a la izquierda, la CIV siempre a la derecha, todos los campos habilitados, y el botón
  decide **sólo** si la lesión entra al informe. Es la decisión del médico, que midió que la
  lógica anterior no tenía sentido.
- **El dibujo del VD pasó de 110 px a 520 y su letra de 2,6 px a 12,26.** Cierra **P5-c**, y el
  dibujo no se tocó: lo que cambió es su ancho y la maqueta de la sección.
- **El molde de las secciones de válvula**, en **seis**: franja ámbar con la categoría y el
  estadio, tarjetas de datos, preguntas por tema en dos columnas y la tabla al pie.
- **La pregunta de síntomas de la estenosis mitral existe con CUALQUIER etiología.** Era el
  defecto que el médico reportó: con «Calcificada» no había ninguna, porque vivía dentro del
  bloque de la comisurotomía.
- **La morfología y las mediciones de la mitral son UNA sección de tres columnas**, con alias para
  el nombre viejo. El dibujo **no** se fundió.
- **Los dos tipos de IM del TEER se ven los dos, siempre.**
- **La frase de dato faltante del Forrester salió del papel** por sus dos caminos restantes, y se
  quedó en la pantalla. Cierra **P5-b**.
- **Los dos rótulos de la profundidad de coaptación se distinguen** —«reparación» y «TEER»— sin
  tocar un id ni un rótulo del Excel ni del papel. Cierra la mitad de **P5-f**.

**Lo que se PARÓ y se reportó, con su medición:** la Evidencia de la **válvula pulmonar** y de la
**prótesis mitral** (P6-a, con el motivo de cada una y **TC-649 (F1)** como guardián); la letra del
dibujo del VD entre 900 y ~1180 px (P6-b); la **franja rosa** de los criterios TEER, que **no se
reproduce como defecto** —tiene 50 caracteres de texto y el «paréntesis» es su borde de 3 px—
(P6-c); `vdscRotulos()`, que **no existe** (P6-d); y la sincronización de los dos campos de
coaptación, que cambiaría el criterio c4 del TEER (P6-f).

**Las fuentes:** las **CINCO tablas de estadios** de la AHA/ACC 2020 leídas **en imagen** a
220-230 ppp, con el folio comprobado en el **pie impreso** de cada hoja: Tabla 13 (hoja 20,
**e91**), 15 (34, **e105**), 16 (42, **e113**), 17 (50, **e121**), 18 (57, **e128**) y 20 (61,
**e132**). **Ningún umbral, ningún corte y ninguna clase se movió.** Las dos guías discrepan —sólo
la AHA/ACC enumera los síntomas— y **la diferencia se muestra y no se resuelve**, que es la regla.

**Verificación:** **32/32 mutaciones dirigidas muertas en UNA sola pasada**, en worktree y nunca
sobre el vivo, con el md5 idéntico antes y después; **seis casos nuevos (TC-644 a TC-649)** que
caen contra HEAD por **81 condiciones y cero excepciones**; **once casos viejos adaptados**; A/B
final contra HEAD con PDF y PPT generados de verdad; Chrome y WebKit en los dieciséis cruces.
⚠️ **Quince mutaciones sobrevivieron al primer barrido y me dijeron dos cosas distintas:** nueve
eran **huecos reales** —el caso miraba el dato, la visibilidad o el registro, y no la maqueta, la
emisión ni el enganche— y nacieron **(A2)**, **(A3)**, **(A3b)**, **(B1b)**, **(A4b)**, **(E5)**,
**(C2)** y el bloque **(H)**; **tres estaban mal escritas** y no inyectaban nada. Y una décima
sobrevivió al segundo barrido **sobre un denominador vacío**: el control de las dos secciones
paradas las llamaba en una escena donde las dos devuelven `null`.

**Línea base al cierre:** **suite 656/664**, en doce lotes cubriendo los **664 casos distintos**
(**664 de 664 ejecutados**), con el pendrive `DISK_IMG` verificado al abrir, en los doce lotes y al
cerrar, y el md5 de `index.html` idéntico antes y después (**`bb6adf41`**). Rojos: **TC-223,
TC-376, TC-390 y TC-406**, los cuatro de siempre, más **TC-551**, el intermitente declarado, más
**TC-99, TC-100 y TC-490**, los tres caracterizados como intermitentes y **ninguno de esta tanda**
—TC-99 y TC-100 pasan aislados y con su lote repetido (56/56), y TC-490 da **2 rojas de 4 contra
HEAD**, 3 de 4 sin adaptar y 3 de 4 adaptado—. **Ningún rojo nuevo.**
⚠️ **Mi primera medición de TC-490 dijo que era mío, y era UNA corrida de cada lado.** Un
intermitente no se caracteriza con una corrida.
**Semgrep 124 WARNING / 0 ERROR**, **Excel 441** columnas con las mismas claves, **censo 1004** sin
un campo guardado nuevo, **sin huérfanos nuevos**, celular **58 a 360 px y 66 a 390 con 17 ALTA**
(la línea base exacta), y **Chrome y WebKit idénticos en los dieciséis cruces** sin una sola
diferencia entre motores. El **A/B final de 64 escenas** da **SEIS** diferencias de superficie
firmada, las seis de la frase del Forrester que el commit 6a autoriza, con 62 escenas en cero.
Sello **`v20261103-2018`**, **11,30 MB / 157.812 líneas**, diff **1.447 / 427** contra `c42d9e3`.
**Son DIECISÉIS commits**, contados con `git log c42d9e3..HEAD` al cerrar: los **diez** de código
más **seis** de cobertura y documentación, de `3a8bf04` en adelante.
**El push lo corre Maicol.**

**Dónde está todo:** `docs/mapa/pant6-pantallas-molde.md` (**mapa nuevo**, 17,4 KB),
`docs/mapa/tests-fichas-644.md` (archivo propio), `docs/fuentes/FUENTES.md` → «La tanda PANT-6»
con las cinco tablas transcritas columna por columna y los seis folios comprobados en el pie
impreso, `docs/GUIA_PRUEBA_PANT6.md` (43 pasos) y `docs/PENDIENTES.md` → **P6-a** a **P6-h**.
`congenitas-otros.md` y `valvulas.md` no se tocaron.

---

## Tanda PANT-7 — el dibujo del VD, los bordes de la CIA, los globos y cuatro pantallas (2026-11-03 y 04)

**Línea base al abrir:** `origin/main` = `HEAD` = **`437834d`**, el cierre de PANT-6, ya
publicado, sello `v20261103-2018`, md5 `bb6adf41`, 157.812 líneas.
**Sello al cerrar:** **`v20261104-0136`**, md5 **`77a4558a`**, **11,35 MB / 158.439 líneas**.
Diff **746 / 119** contra `437834d`, de las que **707** no son comentario.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

### Commits

```
92dcd8d|2026-11-03|PANT7-1: el dibujo de sobrecarga del VD al tamanio del esquema valvular 2D
f401134|2026-11-04|PANT7-2: los bordes de la CIA DENTRO del diagrama del PDF, y su miniatura
cfcae6d|2026-11-04|PANT7-3: los dos globos que no abrian, el del Tei, el del signo 60/60 y la barra del tiempo de aceleracion
803d755|2026-11-04|PANT7-4: la franja del TEER legible, «no determinable» fuera del papel y PAPs a PSAP
ab2aa3d|2026-11-04|PANT7-5: el score de Wilkins en una columna con su conclusion al lado, y un dato con dos puertas
8dace64|2026-11-04|PANT7-6: la conclusion de la orejuela al lado del dibujo, y el cuadro de notas PARADO
1e11c07|2026-11-04|PANT7-7: la aorta del ETE en dos columnas con su conclusion al lado, y el cuadro de notas PARADO
0693eca|2026-11-04|PANT7-8: la VAB en cuatro columnas de campos con el resumen metido arriba
e7e643e|2026-11-04|PANT7-10b: la letra unica de los carteles ⓘ. El 10a NO se hizo
42c1d37|2026-11-04|PANT7-4b: la franja del tipo de IM del TEER se reescribe al mostrarse
```

Más el commit de cobertura y documentación. **Son ONCE commits**, contados con
`git log 437834d..HEAD` al cerrar; el commit 9 (Marfan) **no tocó una línea**, porque la pantalla
ya estaba como la orden la describe.

### Qué cambió

**El dibujo de sobrecarga del VD pasó a medir lo mismo que el esquema valvular 2D** —220 × 300 px
a 1440 y a 1000— con la misma letra y rótulos de una sola línea, y el hueco entre los campos y la
lista de criterios bajó de 104 px a 10; la geometría contra la demo aprobada sale idéntica en los
diez escenarios. **Los cinco valores de borde de la CIA se imprimen DENTRO de su sector** del
diagrama del PDF, medidos por píxeles (28/15/16/19/38 → 74/58/76/77/84), con la línea de corrido
retirada y la velocidad del jet entrando **sólo** cuando el párrafo de la CIA no se emite; y
`INF_MIN_DIAG` ganó su séptima entrada, sin un campo guardado nuevo. **Dos globos ⓘ que no abrían
abren** —el ancla pasó a ser el botón que se clickeó y no el primero del documento—, entran los de
**índice de Tei** y **signo 60/60** con sus fichas `FUN-VD-009` y `FUN-VD-010`, la barra del
tiempo de aceleración pasó de dos tramos a **cuatro** y el signo 60/60 se pinta en ámbar por
debajo de 60 ms, **sólo visual**. **La franja del TEER se lee en el tema claro** (contraste 1,66 →
5,66) y **se reescribe al mostrarse**, que eran dos causas independientes; «no determinable» salió
del papel por sus dos líneas autorizadas y el rótulo **«PAPs» pasó a «PSAP»** en los cuatro
emisores. **Cuatro pantallas reordenadas** —Wilkins en una columna con su conclusión al lado, la
orejuela con la conclusión al lado del dibujo, la aorta del ETE en dos columnas y la VAB en
**cuatro**—, y **el score de Wilkins dejó de estar duplicado**: un dato, dos puertas, colgado del
**gesto** del médico y no de un barrido. **Y ningún cartel ⓘ se declara su propia letra**: el de la
orejuela era el único de los 122 y traía 2.537 de sus 3.110 caracteres un punto más grandes.

**Ningún corte, umbral, clase, nivel ni rótulo de grado se movió**, y **ningún id, campo guardado
ni columna de Excel** tampoco.

### Verificación

**Línea base al cierre:** **suite 665/670**, en doce lotes cubriendo los **670 casos distintos**
(**670 de 670**), en UNA sola pasada sobre el árbol sellado y commiteado, con el pendrive
`DISK_IMG` verificado al abrir, en los doce lotes y al cerrar, y el md5 de `index.html` **idéntico**
antes y después (**`77a4558a`**). Rojos: **TC-223, TC-376, TC-390 y TC-406**, los cuatro de
siempre, más **TC-551**, el intermitente que `COR-f` declara —pasa 3 de 3 aislado y falla en su
lote por **(C3)**, la condición del chorro de la orejuela—. **Ningún rojo nuevo.**
⚠️ **La primera corrida dio 661/670 con CINCO rojos míos** —TC-645, TC-492, TC-494, TC-651 y la
condición (A1) de TC-551—, todos adaptados; **y DOS corridas se descartaron por envenenadas**: una
porque el arnés de fondo y los lotes de primer plano escribieron en el mismo log con **dos Chrome a
la vez** —el síntoma fue un lote informando 54/54 donde su rango tiene 56—, y otra porque el
archivo de casos cambió al adaptar TC-551.
**Semgrep 124 WARNING / 0 ERROR**, **Excel 441** columnas con las mismas claves clave por clave en
las 66 escenas, **censo 1004** con cero campos guardados nuevos y cero perdidos, **sin huérfanos
nuevos**, **ningún id de campo cambió**, celular **58 a 360 px y 66 a 390 con 17 ALTA** (la línea
base exacta), **A/B final de 66 escenas con 31 diferencias de superficie firmada en siete escenas,
las 31 autorizadas y cero en las otras 59**, y **Chrome y WebKit con sólo CUATRO diferencias entre
motores, las cuatro de 4 px de alto a 390 px**.
**35/35 mutaciones dirigidas muertas**, con el md5 idéntico antes y después.
**El push lo corre Maicol.**

### Pendientes

**P7-a** (el punto 10a: las referencias del tronco de la arteria pulmonar, sus ramas y el tracto
de salida del VD — **no hecho**, con lo ya leído y verificado transcrito en FUENTES.md),
**P7-b** (el commit 11: el molde de Evidencia de la válvula pulmonar y de la prótesis mitral —
**no hecho**, mismos motivos que `P6-a`), **P7-c** (la profundidad de coaptación: falta conseguir
Tamburino 2010; copiar el valor convertiría un criterio **sin dato** del TEER en **no cumplido**),
**P7-d** (los dos cuadros de notas: son campos del médico que llegan al informe — la pregunta es
si hay que **moverlos**), **P7-e** (`.mAviso` ilegible en el tema claro, 56 elementos),
**P7-f** (el perfil hemodinámico y la clasificación HTP escriben su propia frase de dato faltante
al papel), **P7-g** (las otras tres frases de «no determinable»), **P7-h** (el paso de guardar y
reabrir la miniatura de la CIA, que queda en la guía manual), **P7-i** (cuatro mapas al techo) y
**P7-j** (la letra del dibujo del VD por debajo de 12 px, por decisión del médico) y **P7-k**
(el primer botón de `vd-triv` y de `pul-balik` mide 0 × 0 en los DOS árboles: un denominador que
ninguna sonda abre, no un hallazgo — y corrige una frase del mensaje del commit 3).

**Cierra** `P6-b` (por decisión del médico), `P6-c` (**la medición de PANT-6 estaba en el tema
equivocado**) y `P6-d` (**`vdscRotulos()` nunca existió**). `P6-f` sigue abierto y pasa a `P7-c`.

**Dónde está todo:** `docs/mapa/pant7-vd-cia-globos.md` (**mapa nuevo**, 30,4 KB) con
`docs/mapa/pant7-medicion-cierre.md` (5,3 KB) partido **antes** de cruzar el techo,
`docs/mapa/tests-fichas-650.md` (archivo propio), nueve mapas con un puntero cada uno,
`docs/mapa/tests-punteros-octubre.md` (**partido** de `tests-punteros-tandas.md`, que cruzó el
techo), `docs/fuentes/FUENTES.md` → «La tanda PANT-7» con los cuatro documentos en sus ocho ubicaciones,
cada folio comprobado en el pie impreso, `docs/GUIA_PRUEBA_PANT7.md` (22 pasos) y `docs/PENDIENTES.md` →
**P7-a** a **P7-k**.

---

## PANT-8 — la pantalla de TAVI, las referencias del VD y el molde de la pulmonar (2026-11-04)

Sobre `afed3e8` (cierre de PANT-7, ya publicado, md5 `77a4558a`, sello `v20261104-0136`).
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| commit | fecha | qué |
|---|---|---|
| `81bca7d` | 2026-11-04 | PANT8-1: los dos botones de TAVI, uno en cada esquina y pintados enteros |
| `7430079` | 2026-11-04 | PANT8-2: el panel Post-TAVI en tres columnas |
| `c7911ae` | 2026-11-04 | PANT8-3: la sincronia de TAVI con Aorta / AI, un dato y dos puertas |
| `3023f36` | 2026-11-04 | PANT8-4: el globo de la calcificacion de la valvula aortica |
| `d683dce` | 2026-11-04 | PANT8-5: Referencias del tronco y las ramas de la AP y de los tres TSVD |
| `3947d72` | 2026-11-04 | PANT8-6: el molde de Evidencia en la estenosis pulmonar. La protesis mitral se PARA |
| `d98349f` | 2026-11-04 | PANT8-7: tres inventarios de solo lectura para los proximos reDisenios |

**Qué cambió, en tres líneas.** Los dos botones de TAVI pasan a las dos esquinas, pintados enteros
con una clase propia que `showTab` no barre, y dejan de medir 0 × 0 en el teléfono; el panel
Post-TAVI se reordena en tres columnas desde 900 px y el sizing pre-TAVI queda sincronizado con
Aorta / AI en los dos sentidos, con el estudio como dueño; y entran el globo de la calcificación,
las referencias del tronco y las ramas de la arteria pulmonar y de los tres tractos de salida, y
el molde de Evidencia en la estenosis pulmonar.

**Lo que se paró y se reportó:** el estado de los botones no sobrevive a guardar y reabrir
(**P8-a**); la morfología de TAVI y la de Válvulas no comparten un solo valor (**P8-d**); la
prótesis mitral sigue sin molde, ahora con dos motivos medidos (**P8-e**); y la app tiene un campo
de tracto de salida donde la guía publica tres (**P8-f**).

**Cierra:** **P7-a** (las referencias del VD y de la AP) y la mitad de **P7-b** / **P6-a** (el
molde de la válvula pulmonar).

---

### PANT-9 — las siete pantallas de congénitas en tres columnas, y el valve-in-valve de TAVI (2026-11-04)

| commit | fecha | título |
|---|---|---|
| `5eef69c` | 2026-11-04 | PANT9-1: la circulacion de Fontan en tres columnas con la conclusion a la derecha |
| `015c110` | 2026-11-04 | PANT9-2: el sindrome de Eisenmenger en tres columnas con la franja roja arriba |
| `f2a5b52` | 2026-11-04 | PANT9-3: la anomalia de Ebstein en tres columnas, con el parrafo y la caja roja en su globo |
| `e6922e9` | 2026-11-04 | PANT9-4: el defecto del septo auriculoventricular en tres columnas |
| `9028d2c` | 2026-11-04 | PANT9-5: la conexion venosa pulmonar anomala parcial en tres columnas |
| `2064875` | 2026-11-04 | PANT9-6: el ductus arterioso permeable en tres columnas |
| `2ef07bf` | 2026-11-04 | PANT9-7: la ventana aortopulmonar en tres columnas, con su parrafo en el globo |
| `a42b063` | 2026-11-04 | PANT9-8: la opcion de valve-in-valve en TAVI y la sincronia de morfologia |
| `7894c91` | 2026-11-04 | PANT9-9: el inventario de SOLO LECTURA de la Evidencia de las congenitas |
| + el de cobertura y documentación | 2026-11-04 | PANT9-10 |

**Qué cambió.** Siete pantallas de cardiopatías congénitas —Fontan, Eisenmenger, Ebstein, defecto
del septo auriculoventricular, conexión venosa pulmonar anómala parcial, ductus y ventana
aortopulmonar— pasan a **tres columnas de campos por tema** con la **conclusión en una tarjeta gris
de 360 px a la derecha** desde los 1.260 px de ventana, con la conclusión debajo entre 900 y 1.259
y todo apilado por debajo de 900. **Diecisiete textos** explicativos pasaron de la pantalla a su
globo ⓘ, palabra por palabra, y el registro de globos pasa de 123 a 140 entradas. El selector de
morfología de TAVI gana **una** opción, «Prótesis biológica previa (valve-in-valve)», y se
sincroniza con la morfología de Válvulas en dos parejas, con el sentido Válvulas → TAVI
**condicional** al módulo en uso por el filtro del Laboratorio.

**Lo que NO cambió.** Ningún campo, ningún id, ningún valor existente, ningún cálculo, ningún corte
y ninguna conclusión. Cero campos guardados nuevos (censo 1004), Excel en 441 columnas con las
mismas claves, y el papel **idéntico** a HEAD en las 30 escenas del A/B salvo las dos que la
sincronía de morfología de TAVI autoriza, con su ejemplo.

**Lo que quedó pendiente.** `docs/PENDIENTES.md` → **P9-a** a **P9-h**: los diecisiete textos
movidos sin respaldo anotado y el que lleva una conducta; las seis pantallas que siguen sin
Evidencia; el borrado que no puede vaciar `va_morf`; el filtro «Con TAVI» del Laboratorio; el alto
que sube por debajo del corte; las columnas desparejas de Ebstein; el globo del título fuera del
encabezado del acordeón; y lo que sigue.

---

## PANT-10 — los textos de congénitas contra las hojas, y la Evidencia de cinco lesiones (2026-11-04)

| commit | fecha | qué |
|---|---|---|
| `2f87731` | 2026-11-04 | PANT10-1: los diecisiete textos de congenitas contra las hojas de las guias |
| `d87b4a5` | 2026-11-04 | PANT10-2: la Evidencia del defecto del septo auriculoventricular |
| `f49ccc3` | 2026-11-04 | PANT10-3: la Evidencia de la anomalia de Ebstein |
| `c05a29c` | 2026-11-04 | PANT10-4: la Evidencia de la circulacion de Fontan |
| `742f493` | 2026-11-04 | PANT10-5: la Evidencia de la conexion venosa pulmonar anomala parcial |
| `955053c` | 2026-11-04 | PANT10-6: la Evidencia del sindrome de Eisenmenger |
| `808d89a` | 2026-11-04 | PANT10-7: cobertura y documentacion de la tanda |
| `38ba80f` | 2026-11-04 | PANT10-8: el segundo hallazgo de papel y las dos redacciones de la franja |
| `968df75` | 2026-11-04 | PANT10-9: la geometria del panel y los dos pasos que faltaban en la guia |
| — | 2026-11-04 | PANT10-10: el conteo de commits al cerrar |

**Qué cambió.** Los **diecisiete** textos que PANT-9 había movido al globo ⓘ se corrigieron
contra la hoja que cada uno invoca, leída en imagen a 200-220 ppp y con el folio comprobado en el
pie impreso; lo que **ninguna** de las 248 fuentes de la biblioteca respalda se retiró del globo y
quedó literal en `docs/PENDIENTES.md` → P10-a. Y **cinco lesiones de congénitas que no tenían
Evidencia ahora la tienen**: defecto del septo auriculoventricular (13 preguntas), anomalía de
Ebstein (12), circulación de Fontan (14), conexión venosa pulmonar anómala parcial (9) y síndrome
de Eisenmenger (14), con el molde de `_indCIA` sin reescribirlo y las diferencias entre guías
mostradas sin resolver. `IND_SECS` pasa de **35 a 40**. **El papel no se movió en ninguno de los
seis commits**, y no hay campos guardados nuevos ni columnas de Excel nuevas.

**Qué quedó pendiente.** `P10-a` a `P10-e`. Lo primero: **la segunda copia de la frase del índice
de Celermajer que `ebsConclusion` publica y que SÍ llega al informe firmado**, medida superficie
por superficie y **no tocada**, porque la orden manda parar y reportar. Después, la ventana
aortopulmonar sin Evidencia —ninguna guía de la biblioteca la trata—, los cortes del DSAV que no
son los de ninguna de las dos guías, y las Evidencias existentes del ductus, la coartación y la
miocardiopatía hipertrófica obstructiva, que tienen cero preguntas.

---

## Tanda PANT-11 — el papel de Ebstein y Eisenmenger, la VCI no visualizada, el eco pulmonar por lado y las masas en Otros (2026-11-04)

| commit | fecha | título |
|---|---|---|
| `3bd2d05` | 2026-11-04 | PANT11-1: el papel de Ebstein y de Eisenmenger lleva solo lo medido |
| `785d83b` | 2026-11-04 | PANT11-2: TDE y TRIV del Doppler mitral intercambian de lugar |
| `cb10ce2` | 2026-11-04 | PANT11-3: la casilla «(no se visualiza VCI)» en VD / AD |
| `e3fa328` | 2026-11-04 | PANT11-4: la profundidad de coaptacion, un dato con dos puertas |
| `476d4f0` | 2026-11-04 | PANT11-5: la ecografia pulmonar gana el derrame por lado y el lado de la consolidacion |
| `45f18b7` | 2026-11-04 | PANT11-6: la ecografia pulmonar y el posoperatorio, sincronizados con guarda |
| `df248c0` | 2026-11-04 | PANT11-7: el dibujo de la ecografia pulmonar y la disposicion de su seccion |
| `c1576e8` | 2026-11-04 | PANT11-8: «Masas» se muda a la pestania Otros y «Pericardio y masas» pasa a «Pericardio» |
| `ff3ede8` | 2026-11-04 | PANT11-9a: la tabla de diagnosticos diferenciales de las masas, con sus fuentes |
| `ffe716f` | 2026-11-04 | PANT11-9b: el globo de endocarditis en la fila de la vegetacion |
| `9edc0fe` | 2026-11-04 | PANT11-10: la ficha de Referencias de tumores cardiacos |
| `682ffdb` | 2026-11-04 | PANT11-11: la ficha de Referencias de fuentes emboligenas |
| `a26b03c` | 2026-11-04 | PANT11-8b: la seccion de masas era HERMANA de variantes y estaba ANIDADA |
| — | 2026-11-04 | PANT11-12: cobertura y documentacion de la tanda |

**Qué cambió.** Cierra **P10-a**: `ebsConclusion` y `eisenEstado` publican ahora una salida
`papel` descriptiva, armada de las **mismas piezas** que la pantalla, así que el informe firmado
de una anomalía de Ebstein deja de llevar el κ de 0,39, el apellido Celermajer, la resonancia, la
serie neonatal, el nombre de la guía y la conducta —todo eso sigue en el globo y en la
Evidencia—, y las alertas de síncope y de hemoptisis del síndrome de Eisenmenger se retiran
enteras, con la mortalidad materna corregida a **30 a 50 %** contra la hoja 95, folio e209. En el
Doppler mitral el **TDE y el TRIV intercambian de lugar**, clases y marcado juntos. La pestaña
VD / AD gana la casilla **«(no se visualiza VCI)»**, que vacía y guarda los dos campos de la cava
para que sus ~25 consumidores degraden a «sin dato» por construcción. Las **dos** profundidades de
coaptación —la del ETE y la de los criterios TEER— pasan a ser **un dato con dos puertas**. La
ecografía pulmonar gana el **derrame por lado** y el **lado de la consolidación**, con los dos
campos legados derivados, la sincronía con el posoperatorio **con su guarda** y el **dibujo del
pulmón** de solo lectura, portado de la demo aprobada. Y **«Masas» se muda a la pestaña Otros**,
con una tabla de diagnósticos diferenciales de siete filas con sus fuentes, un globo de
endocarditis, y **dos fichas de Referencias nuevas** —tumores cardíacos y fuentes embolígenas—.

**Campos guardados nuevos: CUATRO**, los autorizados:
`vci_no_vis`, `pua_derrame_der`, `pua_derrame_izq` y `pua_consol_lado`. `VINFO` pasa de **140 a
142** entradas y las fichas de Referencias de **36 a 38**. **Cero columnas de Excel nuevas.**

**Qué quedó pendiente.** `P11-a` a `P11-h`. Lo que la tanda paró y reportó: la columna de Excel
que la premisa daba por existente y **no existe** para ningún campo del pulmón (P11-c); los pares
del pulmón que **no** se sincronizan, con el motivo de cada uno (P11-d); lo que el dibujo no
muestra (P11-e); la opción «pannus» en `masa_dx` (P11-f); y el botón «Ver referencia» de los dos
globos nuevos, que no tiene destino exacto hoy (P11-g). El commit **8b** corrige un defecto propio
de la tanda: un `</div>` de menos dejaba la sección de masas anidada dentro de «Variantes
anatómicas», con el DOM balanceado y sin síntoma visible.
**Suite al cierre: 689/694** en trece lotes, una sola pasada sobre el árbol sellado, con los
cuatro rojos de siempre más el intermitente **TC-557** y **ningún rojo nuevo**. **44/44
mutaciones dirigidas muertas.** Semgrep **124 WARNING / 0 ERROR**. Excel **441** columnas con las
mismas claves. Censo de campos **1004 → 1008**.

Cierra **P10-a**, **P6-f**, **P5-f** y **P6-h**; el último porque
`docs/mapa/mitral-dibujo-estatico.md` cruzó el techo de ~35 KB al recibir el puntero de esta
tanda y se partió a `docs/mapa/mitral-teer-criterios.md`, con cero líneas perdidas.

---

## PANT-12 — el corazón maestro, parte 1 (2026-11-04)

**Seis commits** —contados con `git log` al cerrar—, para los siete puntos de la orden: el 2 no cambia una línea. Al empezar, `origin/main` = `HEAD` = `9c5ab8f`, el cierre de PANT-11, ya
publicado, con md5 `a78bd6ce`, sello `v20261104-1554` y el pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| # | Commit | Qué hizo |
|---|---|---|
| 1 | `96a90bc` | Inventario de solo lectura del corazón maestro, y el defecto del reloj **medido** |
| 2 | — | **No cambia una línea**: el defecto no se reproduce, y está medido con su control positivo |
| 3 | `83e33f6` | La casilla «Vena cava superior izquierda persistente» |
| 4 | `0a4cca5` | El motor modular y las dieciséis lesiones |
| 5 | `928c860` | Los controles, la tabla lateral, el globo y los dos modos |
| 6 | `185a173` | «Según el estudio»: las comunicaciones y las conexiones |
| 7 | éste | Cobertura y documentación |

**Lo que dejó:** un módulo 3D con motor, lienzo y estado propios abajo de las congénitas, con dos
modos; la transposición conserva su propio diagrama; un campo guardado nuevo (el autorizado); y
los textos del globo verificados hoja por hoja contra las guías.

**Lo que NO hizo:** la parte 2 —«Según el estudio» para las siete lesiones que el motor ya
dibuja pero la pestaña todavía no cablea—, declarada en `docs/PENDIENTES.md` → **P12-c**.

## PANT-13 — «Explorar», la transposición dentro del corazón maestro, Masas y el pulmón (2026-11-04 y 05)

**Nueve commits** —contados con `git log` al cerrar, y el que escribe este número entra en la
cuenta—, para los ocho puntos de la orden: el 8 se partió en dos, cobertura y documentación. Al
empezar, `origin/main` = `HEAD` = `866482f`, el cierre de PANT-12, ya publicado, con md5
`f27f4705` y sello `v20261104-1942`.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

| # | Commit | Qué hizo |
|---|---|---|
| 1 | `0398efe` | El lienzo que sigue al ancho de su recuadro, las tildes y el campo de frecuencia |
| 2 | `2b35ac7` | El rediseño de «Explorar» en tres zonas y el esquema de circulación |
| 3 | `9e9fd3f` | «Incluir en el PDF» del corazón maestro, **sólo** en «Según el estudio» |
| 4 | `a2e2f93` | La transposición de grandes arterias como **sexta anatomía de base** |
| 5 | `e9d227a` | La tabla de Masas cerrada y los textos neutros, con la **regla nueva** en `CLAUDE.md` |
| 6 | `19309ba` | El broncograma aéreo en **puntitos** y el botón del PDF del diagrama del pulmón |
| 7 | `997567f` | Las variantes anatómicas en una grilla compacta |
| 8a | `ffb762a` | Cobertura: siete casos nuevos, TC-686 a TC-692 |
| 8b | éste | Documentación |

**Lo que dejó:** un «Explorar» en tres zonas con sus combinaciones por sigla y su esquema de
circulación al lado; la transposición dibujándose dentro del módulo **llamando a la función que su
pestaña ya usa**; dos diagramas nuevos en el registro del PDF (`cm3d` y `puldib`); la tabla de
Masas cerrada por omisión; el broncograma en puntos; las variantes en grilla; **un** campo
guardado nuevo (`pul_dib_pdf`, el único de los dos autorizados que se usó); y una **regla fija
nueva** en `CLAUDE.md` —«Ningún texto habla mal de las guías»— con su censo medido en el navegador.

**Lo que NO hizo:** retirar el dibujo de la transposición de su pestaña. La equivalencia dio **46
diferencias sobre 160**, todas de una sola causa medida —las reglas de compatibilidad de la demo
son más estrictas que las del 3D de hoy—, así que la condición que la orden pone no se cumplió.
Declarado en `docs/PENDIENTES.md` → **P13-c**, con la decisión que le toca al médico.

---

## PANT-14b — el estado del corazón maestro, «un dato una sola puerta», el PDF, el retiro de la transposición y el túnel violeta (2026-11-05)

**Línea base al abrir:** `origin/main` = `HEAD` = `4ebeee4`, el cierre de PANT-14, ya publicado,
con sello `v20261105-1004` y md5 `ae21bc42`. Pendrive `DISK_IMG` montado.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

**Los ocho puntos de código se hicieron enteros.** Ningún campo guardado nuevo, ninguna columna de
Excel, censo de campos idéntico.

| commit | qué |
|---|---|
| 1 | el módulo **deriva** su estado de las pestañas en vivo, con `cm3dDerivar` como dueño único; `cm3dReset` lo deja sin estado con «Nuevo estudio»; el botón y el panel viven sólo dentro de las congénitas, con la misma regla de acceso que la pestaña |
| 2 | **un dato, una sola puerta**: el interruptor de presencia de una sección se enciende solo con su dato identificatorio, y el dibujo y el informe leen el MISMO predicado de `_CC_SECS` |
| 3 | el PDF lleva **un solo** bloque de dibujo, y el esquema de circulación sólo con su botón abierto |
| 4 | el esquema de la transposición del módulo sale de `tgaEsqCuerpo`, el **dueño único** de la pestaña |
| 5 | el **retiro** del recuadro de dibujo de la pestaña de la transposición, con «Ver en 3D» en su lugar |
| 6 | el **túnel** del switch auricular en violeta, con su leyenda condicional y sus dos rótulos |
| 7 | el **anillo** de la obstrucción subaórtica, por debajo del origen de la aorta y con prioridad de render |
| 8a-c | cobertura y documentación |

**Lo más grande que cerró:** el módulo arrancaba con el estudio viejo y en dos escenarios la línea
decía «Sin lesiones cargadas que dibujar» al lado de un dibujo de cuatro y de siete objetos del
paciente anterior. La causa, en dos líneas: `cm3dEstudioSync` salía temprano con el panel cerrado y
`cm3dSync` repinta sin derivar.

**Las premisas que NO se reprodujeron**, y las tres las explicaba el estado viejo: la coartación
«nativa» **sí** se dibuja; la velocidad pulmonar de 3,5 sin nivel no dibuja y es lo correcto; y el
médico **no** veía el anillo de la obstrucción subaórtica —0 a 4 píxeles sobre 45.000—.

**Lo que paró:** nada de los ocho puntos. Lo declarado son **diez** cosas en
`docs/PENDIENTES.md` (**P14b-a** a **P14b-j**), más el **cierre de P13-c**.

**El barrido de mutaciones: 37 de 37 muertas**, en worktree y nunca sobre el árbol vivo, con el
md5 idéntico antes y después, cada mutación declarando su caso. ⚠️ **Su primera pasada dio 21 de
38**, y los diecisiete sobrevivientes dieron **once condiciones nuevas** —TC-699 (B0), (B4)
reescrita, (H4), (I4) y (K1); TC-700 (C1b), (D1b), (D1d) y (B1c); TC-702 (A2b), (D3) y (B3b); y
TC-703 (D1b)—, **una redundancia retirada** —`cm3dReset` cerraba el panel que `limpiarCampos`, su
único llamador, ya cerraba 433 líneas antes: la tercera copia de la misma acción— y **tres
equivalencias declaradas**, con la 24 retirada y escrita en **P14b-j**.

**Verificación:** suite **713/719** en catorce lotes de 55 sobre el árbol **resellado**, 719 de
719 ejecutados y el pendrive verificado dieciséis veces, con los cuatro rojos de siempre más
TC-551 y TC-557, los dos intermitentes declarados; **37/37 mutaciones dirigidas muertas**; Semgrep
124 WARNING / 0 ERROR; Excel 441 con las mismas claves y sólo dos a cuatro **celdas** distintas en
las siete escenas autorizadas; censo 1010 con el mismo juego; sin huérfanos nuevos; los 15 bloques
de JS inline parseando; celular idéntico a HEAD (59 y 67 hallazgos con 18 ALTA); A/B de 64 escenas
y 12.852 claves con **56 diferencias de papel en SIETE escenas, las autorizadas** y las otras 57 en
cero, `vacio` y `ajeno` incluidas; y Chrome y WebKit coincidiendo en los dieciséis cruces, con dos
diferencias de motor y las dos de métrica de fuente.
⚠️ **Una corrida de la suite se envenó por DOS procesos sobre el mismo log** —el `nohup … &`
desde la herramienta de shell no sobrevive al envoltorio y el relanzamiento convivió con el
primero, que seguía vivo—: se cortaron por PID exacto, se verificó que el árbol vivo no se había
tocado y se rehizo de una sola pasada. Lo delata el **conteo de cabeceras de lote**.

**Dónde está todo:** `docs/mapa/p14b-estado-puerta-tunel.md` (mapa nuevo),
`docs/INVENTARIO_UN_DATO_UNA_PUERTA_P14B.md`, `docs/GUIA_PRUEBA_PANT14B.md`,
`docs/fuentes/FUENTES.md` → «La tanda PANT-14b», y los seis casos nuevos TC-699 a TC-704.

---

## PANT-14c — el PDF del corazón maestro, el diagrama del posoperatorio y los colores del 3D (2026-11-05/06)

**Al abrir:** `origin/main` = `HEAD` = `741d0cc`, el cierre de PANT-14b, ya publicado, con el sello
`v20261105-1629`, md5 de `index.html` `f6eb884f` y el pendrive `DISK_IMG` montado. El push lo corre
Maicol: esta tanda tenía orden expresa de **no** pushear.

**Lo que el médico reportó, con capturas, probando PANT-14b en Safari** — y qué pasó con cada cosa:

| # | lo reportado | qué se midió | qué se hizo |
|---|---|---|---|
| 1 | el PDF imprime el corazón angosto y chico | **reproducido**: se estampaba cuadrado (`p.ar \|\| 1`) un lienzo de 1230 × 420 y se capturaba el lienzo entero, con el corazón en el 16,8 % del ancho | commit 1: recorte al contenido + `ar` propio. El corazón pasa de **11,9 a 31,4 mm** de ancho |
| 2 | con ◫ abierto el PDF no incluyó el esquema | **reproducido en el orden que usó**: botón primero, ◫ después. `cmSchSet` no rasterizaba | commit 1d: `cmSchSet` rasteriza al abrir |
| 3 | falta una explicación en texto | — | commit 1c: `cmPapelTexto` con sus cuatro partes, todas de registros que la app ya tiene |
| 4 | el esquema del posoperatorio sale solo y vacío, con el botón encendido tras «Nuevo estudio» | **reproducido las dos mitades**: `pop_esq_pdf` es `hidden` y `limpiarCampos` no lo alcanzaba; y con la casilla encendida y cero datos el PDF emitía la hoja | commit 2 |
| 5 | los dos rótulos del túnel se superponen; con dos túneles hay que distinguirlos | **reproducido**: `Túnel cavas × Túnel venas pulm. = 62 × 10 px` en 4 de 30 escenas | commit 3a: dos violetas medidos y una regla general de rótulos |
| 6 | el anillo de la obstrucción se ve raro | estaba en el plano XY, de frente a la cámara | commit 3d: acostado, transversal al eje de la aorta |
| 7 | en el Jatene no se entienden los anillos ni el punto naranja | las suturas usaban **el mismo toro** que la obstrucción | commit 3e: bandas con trama de malla, sin reusar el toro |
| 8 | violeta también para el Rastelli; cava izquierda celeste; parches verdes | — | commit 3a, 3c y 3f |
| 9 | un título con las siglas de lo que se dibuja | — | commit 4a |
| 10 | la pestaña de transposición quedó con un hueco | — | commit 5 |
| 11 | las secciones de congénitas quedan abiertas al volver | — | commit 6 |

**Los siete commits** —contados con `git log 741d0cc..HEAD` al cerrar; el commit 7 entra en la
cuenta—:

| # | commit | qué cambió |
|---|---|---|
| 1 | `1bdba41` | el PDF del corazón maestro: imagen recortada con su proporción, el esquema que faltaba y el texto que describe lo dibujado |
| 2 | `17228e6` | el esquema del posoperatorio deja de salir solo — «Nuevo estudio» lo apaga y sin datos no se emite |
| 3 | `4b2e7e5` | el 3D y el esquema: dos violetas, el anillo acostado, las suturas en malla, los parches verdes, la cava celeste y la leyenda por entradas |
| 4 | `2b882c7` | el título de lo que se dibuja, y los dos textos chicos que repetían lo que el dibujo ya muestra |
| 5 | `142ce0a` | la pestaña de transposición sin su botón propio y sin hueco — los once campos en cuatro grupos |
| 6 | `360c81e` | las secciones de congénitas, siempre cerradas al entrar |
| 7 | éste | cobertura y documentación |

**Lo que el commit 7 dejó:**

- **Nueve casos nuevos**, TC-705 a TC-713, uno o dos por commit, con sus denominadores y sus
  controles negativos. **Caen contra `741d0cc` por 99 condiciones y NINGUNA por excepción.**
- **Siete casos viejos adaptados**, cada uno con el motivo escrito: TC-573, TC-601, TC-697,
  TC-699, TC-702, TC-703 y TC-704. **Seis de los siete son el día que ellos mismos anunciaban**, y
  once de sus condiciones quedaron **invertidas**, no borradas.
- **Un mapa nuevo**, `docs/mapa/pant14c-pdf-colores.md`, y las fichas en
  `docs/mapa/tests-fichas-705.md` (archivo propio).
- ⚠️ **`docs/mapa/tests-punteros-tandas.md` cruzó el techo y se partió**: estaba en 31.438 B y el
  bloque de esta tanda lo llevó a **36.653**. Las tandas PANT-8 a PANT-14c salieron a
  `docs/mapa/tests-punteros-noviembre.md` (16,6 KB) y el mapa volvió a **20,7 KB**, con **cero
  líneas perdidas** verificadas una por una. **Es otra vez la regla aplicada DESPUÉS de cruzar:
  hay que medir el archivo MÁS lo que se le va a escribir.**
- **NUEVE cosas declaradas** en `docs/PENDIENTES.md`: **P14c-a** a **P14c-i**, la última con lo
  que la tanda deja para las que siguen.

**La verificación de cierre:**

| qué | resultado |
|---|---|
| **suite completa** | **728 de 728** casos ejecutados en **14 lotes**, md5 idéntico antes y después, pendrive verificado **16 veces**. Once rojos, **siete conocidos**: la línea base al cerrar es **721/728** |
| **los cuatro rojos míos** | TC-514 (F5)(F6), TC-685 (F0)(F1b), TC-686 (A2)(A3) y TC-689 (H0) — adaptados, **once condiciones invertidas**, y sus dos lotes repetidos dan **55/55** |
| **mutaciones** | **46/46 muertas**, en worktree, md5 idéntico antes y después |
| **los nueve casos nuevos** | caen contra `741d0cc` por **99 condiciones** y **ninguna** por excepción |
| **Semgrep** | **124 WARNING / 0 ERROR**, la línea base |
| **huérfanos** | sin huérfanos nuevos |
| **Excel** | **441** columnas con las mismas claves |
| **campos guardados** | **ninguno nuevo**; ningún id cambió |
| **bloques de JS inline** | **17 de 19** parsean, idéntico al árbol anterior |
| **el diff** | **882 líneas agregadas y 140 quitadas**, **792** no comentario, **cero** `innerHTML`, `eval(` y `new Function` nuevos, cero claves |

⚠️ **Y la corrida completa corrigió un error de la propia documentación de la tanda**: `P14c-b`
afirmaba que ninguna condición de la suite sostenía que una sección con un dato del paciente se
abriera sola, y **TC-514 (F6) lo afirmaba con todas las letras**. Corregido.

## PANT-24 — cierre de textos de protesis y de la Evidencia, y el tamanio tactil del circulo-i (2026-11-08)

**Commits**: el inventario con las premisas (no cambia un byte de la app); la TAVI
normofuncionante; el AT/ET; la cita `escGuchCiv` con el corte de 10 mm; la zona de toque del ⓘ; y
la cobertura con la documentacion. Al empezar, `origin/main` = `HEAD` = **`a40073f`**, el cierre
de PANT-23, ya publicado, con `index.html` en md5 `224fd6ae`, **168.717** lineas, sello
`v20261107-1627`, y el pendrive `DISK_IMG` montado. **El push lo corre Maicol: esta tanda tenia
orden expresa de NO pushear.**

⚠️ **POR VIGESIMOPRIMERA VEZ SEGUIDA EL RENGLON DE TAMANIO QUE SE ENCONTRO ESTABA BIEN**, y se
verifico de las dos formas que esta casa manda: el sello del pie (`#eco-build-sello`, linea
165852) coincide con el de `CLAUDE.md`, y `wc -l` y `md5` sobre el archivo vivo dan **168.717**
lineas, **12.268.984** bytes y **`224fd6ae`**, los tres identicos a lo que decia.

- **LAS TRES PREMISAS SE REPRODUJERON, y DOS en un lugar distinto del que la orden describe
  (commit 1).** La frase de la TAVI es textual y es la del estilo **NARRATIVO**. El **1.67** del
  AT/ET **no** sale en la fila —`_eaAtEtVal` ya tenia su guarda y la fila muestra la raya—: sale
  en el **aviso amarillo**, en **«Ver detalle»** y **en el papel**, que es lo que P18-b
  declaraba. Y el 1 EXACTO tambien se publicaba.

- **LA TAVI NORMOFUNCIONANTE (commit 2).** Con la aortica en TAVI y sin un solo dato que indique
  estenosis o insuficiencia protesica, el informe dice «La valvula aortica presenta una protesis
  transcateter tipo TAVI normofuncionante.» y el EN SUMA «TAVI normofuncionante.». Las dos frases
  viven en **una tabla congelada**, `EA_PROT_NORMO`; el emisor publica una **marca** y el bloque
  del informe compone. **La condicion no es «nivel faltan»**: con Vmax 4,5 y gradiente 45 sin DVI
  el nivel tambien es «faltan» y los dos ejes medidos estan en rango de estenosis, asi que se
  exige que **ningun nivel medido salga de normal**, y falla cerrado.
  ⚠️ **LA INSUFICIENCIA PROTESICA TIENE TRES FUENTES Y LA TERCERA LA ENCONTRO TC-289, NO LA
  LECTURA**: la regurgitacion PARAVALVULAR del modulo TAVI, que no pasa por `ia_grado` ni por el
  escalon. El EN SUMA salia «TAVI normofuncionante. … RPV moderada.». Se arreglo la aplicacion y
  no el caso. Y **el EN SUMA sale del bloque del informe y no del de «protesis normofuncionante»
  del final**, cuya guarda de TAVI (P18-d) se conserva: ese bloque se apaga solo porque «TAVI» ya
  era un token de `yaDicho` de esa valvula.
  ⚠️ **Y EL COMMIT 3 DESTAPO UN DEFECTO DEL 2**: la frase se emitia a secas y el papel perdia
  «(Vmax 2 m/s)». Es la regla fija de la casa —ningun numero medido desaparece— y hoy la frase
  lleva el parentesis de medidas desde su dueno.

- **EL AT/ET (commit 3), que cierra P18-b.** `eaProtVeredicto` deja de calcular el cociente por su
  cuenta y **lee `_eaAtEtVal()`**, el dueno de la fila: con eso un cociente de 1 o mas vale `null`
  y desaparece del papel, del aviso y del plegable de una sola vez. La llamada va **pelada**, y se
  midio que se puede —las dos funciones estan en el **mismo** bloque de `<script>`, el 56, y
  `_eaAtEtVal` es una declaracion izada—. La fila dice **«Revisar los valores»** por un segundo
  dueno, `_eaAtEtRevisar()`, que publica el **por que** y no el valor. Y el decimal va con
  **coma** en las tres rutas de **pantalla**; en el papel se deja con punto y se lista en P24-c.

- **LA CITA `escGuchCiv` Y EL CORTE DE 10 MM (commit 4).** Salen las tres formas que esta casa ya
  no escribe —«DIVERGE … ESTA SIN RESOLVER», «Verificacion clinica pendiente» y «no figura en el
  documento»— y entra el **molde de PANT-22**, letra por letra: cada fuente por lo que ella dice y
  el criterio de la seccion declarado como **propio de la aplicacion**. **Ni un numero, una clase,
  un folio ni la publicacion se perdieron.** El corte pasa a **«10 mm o mas»** en los **tres**
  items donde el medico lo ve —ocho cadenas— con la cita del corte en la **Figura 20 (hoja 65,
  folio 4699)** y la **Tabla 17 (hoja 66, folio 4700)** para la recomendacion, sin comparar las
  dos partes. El recuento, por items y por cadenas, queda declarado en **P24-a**.

- **LA ZONA DE TOQUE DEL ⓘ (commit 5).** De **11 × 14 px** a **44 × 42**, con un `::after`
  absoluto dentro de `@media (pointer: coarse)` —el mecanismo que `.ind-ctrl-btn` ya usa— y con
  **insets explicitos** y no un porcentaje. Los **42 de alto** estan **medidos**: los 473 globos
  dan **129 pares de vecinos** a **42,9 px**, los 129 con `dx = 0`, asi que una caja de 44 se
  pisaria 1,1 px; en horizontal no hay restriccion y el ancho va 44 entero. Y lleva **`z-index:1`**
  porque `td:nth-child(3)` esta posicionada y su celda tapaba la mitad de abajo de la zona.
  **CERO** zonas tocan otro ⓘ o un boton de respuesta, medido punto por punto. Con el **mouse** no
  cambia una fila.

- **LO QUE SE PARO, en P24-a:** el **PPM aortico** puede salir debajo de «TAVI normofuncionante»
  en un estudio con el DVI cargado y los dos ejes dependientes vacios, y decidir si un desajuste
  impide llamar normofuncionante a una protesis es contenido clinico que la orden no decide.

- **EL BARRIDO DE TEXTOS, en P24-b** — solo reporte, sobre `textContent` en el navegador y con
  control positivo: **cuatro** textos visibles exponen de verdad lo pendiente, y **dos de ellos
  son `escGuchCiv`**, que esta tanda corrige. Los otros dos son el «Queda declarado, no
  corregido.» de la estenosis mitral. El resto son falsos positivos del patron o caen en las
  excepciones que la propia regla declara.

- **LA COBERTURA.** Cuatro casos nuevos —**TC-757** a **TC-760**—, y la suite pasa de **771 a
  775** casos distintos. **Los seis caen contra `a40073f` por 30 condiciones y NINGUNA por
  excepcion**, verificado en un worktree alternando solo `index.html` con el mismo archivo de
  casos. **36 de 36 mutaciones dirigidas muertas** en 36,8 min, en worktree y nunca sobre el
  vivo, con el md5 del arbol vivo identico antes y despues; la **37.a se retiro declarada** y es
  un **mutante equivalente demostrable** (P24-a § 3).
  ⚠️ **LAS 37 ANCLAS SE VERIFICARON ANTES DEL BARRIDO Y UNA ESTABA ROTA**: la 30 daba **x0**
  porque el comentario del commit 5 se metio entre sus dos lineas, y `@media (pointer: coarse)`
  aparece **siete** veces en el archivo, asi que no servia sola.

- **TRES CASOS VIEJOS ADAPTADOS, cada uno con el motivo escrito.** **TC-289** (invertido en su
  mitad aortica); **TC-723**, que **el censo por grep NO encontro y la suite SI** —grepear
  `atet` empareja con **«cateterismo»**, que aparece decenas de veces en el archivo de casos—, y
  que afirmaba el punto decimal de la fila y la raya con AT ≥ ET, o sea exactamente lo que esta
  tanda cambia; y **TC-753**, que fijaba a mano el **md5** y el **renglon de tamanio** de
  PANT-23 y por eso se ponia rojo en la tanda siguiente sin que nada se hubiera roto. Hoy los
  comprueba **por su forma y por su vecindad al sello**: el sello ya se leia del pie desde
  PANT-23, y ahora los otros dos tambien dejan de ser literales.
  ⚠️ **Y ADAPTAR TC-753 COSTO UNA CORRIDA POR LA TRAMPA DE SIEMPRE**: un `split` con el escape
  del salto de linea, dentro del template literal del cuerpo de un caso, se convierte en un
  **salto de linea real** y la cadena queda sin cerrar —«SyntaxError: Invalid or unexpected
  token»—. Se parte por `String.fromCharCode(10)`, que no tiene escape que perder.

- **EL A/B DEL PAPEL, con el PDF y el PPT generados DE VERDAD: 121 escenas, 148.572 claves y
  55.297 celdas de Excel, y las diferencias de superficie firmada son 84, TODAS en SIETE
  escenas y doce claves cada una.** Las **114 escenas restantes** —entre ellas TODAS las que el
  arnes ya traia de las tandas anteriores— salen **identicas**, clave por clave. El reparto:

  | escena | que cambia | por que |
  |---|---|---|
  | `p24taviSin` | «… tipo TAVI normofuncionante.» / «TAVI normofuncionante.» | autorizada **(a)** |
  | `p24taviParc` | «… normofuncionante (Vmax 2 m/s)» | autorizada **(a)** |
  | `p24atet167` | pierde «AT/TE 1.67» | autorizada **(b)** |
  | `p24atetSavr` | pierde «AT/TE 1.67» en una protesis QUIRURGICA | autorizada **(b)**, y es el control de que no es un arreglo de la TAVI |
  | `p24atet1` | pierde «AT/TE 1.00» y pasa a «normofuncionante (AT 60 ms)» | **(b)** y despues **(a)** |
  | `p24etCero` | «normofuncionante (AT 50 ms)» | autorizada **(a)**: con el ET en 0 el cociente ya era nulo en los DOS arboles |
  | `p24at0` | pierde «AT/TE 0.00» y pasa a «normofuncionante (AT 0 ms)» | **(a)** mas un TERCER efecto, declarado en **P24-a § 4** |

  ⚠️ **`p24at0` ES LA UNICA ESCENA CON UN EFECTO QUE LA ORDEN NO NOMBRA, y se midio a proposito
  en vez de descubrirlo despues**: ahi el cociente vale **0**, o sea por DEBAJO de 1, asi que
  deja de publicarse por la guarda de positividad de `_eaAtEtVal` y no por la decision del
  cociente. Un AT de 0 esta fuera de la banda de plausibilidad `va_at:[10,300]`, y la fila ya
  decia «fuera de rango medible» mientras el papel publicaba `AT/TE 0.00`: hoy las dos
  superficies coinciden, que es lo que P18-b pedia. Queda declarado y con su salida de una linea.

  **En PANTALLA hay UNA sola diferencia**, en `p24civ`: el texto de `escGuchCiv`. Es el commit 4,
  y vive solo en el panel de Evidencia.

- **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la linea base
  exacta. **No empeoro**, que es lo que la orden pide, y es lo que confirma que la zona de toque
  del ⓘ no agrando una sola caja con el mouse: el barrido de celular NO emula un puntero grueso.

- **CHROME Y WEBKIT, DIA Y NOCHE, en los cuatro anchos**: 28 corridas, cero errores de consola y
  de pagina en todas. El detalle esta en el cuerpo del commit 5.

- **LA LINEA BASE AL CIERRE: suite 769/775**, en **quince** lotes cubriendo los **775 casos
  distintos** —contados nombre por nombre, con la guarda del arnes comparando lo listado con lo
  ejecutado: **775 de 775**—, en UNA sola pasada sobre el arbol sellado, con el pendrive
  `DISK_IMG` **verificado al abrir, en cada uno de los quince lotes y al cerrar** (diecisiete
  verificaciones) y el md5 de `index.html` **identico** antes y despues (`b8481a9b`). Los rojos
  son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, mas **TC-182** y **TC-706**,
  los dos que la orden lista como posibles. **Ningun rojo nuevo**, y los cuatro casos nuevos y
  los tres adaptados en verde.
  ⚠️ **LOS TRES INTERMITENTES SE CARACTERIZARON COMO MANDA ESTA CASA, con CUATRO corridas cada
  uno**: **TC-182**, **TC-706** y **TC-551** pasan **4 de 4 aislados**, asi que son del contexto
  de la suite -los 775 casos corren en UNA sola pagina- y no de esta tanda.
  ⚠️ **Y LA PRIMERA CORRIDA COMPLETA DIO 766/775 CON TRES ROJOS MAS, LOS TRES MIOS**, y por eso
  esa cifra no es la linea base: **TC-551** (el intermitente), **TC-723** y **TC-753**. Estan
  adaptados y la cifra de arriba sale de la corrida **limpia**, de una sola pasada sobre el
  mismo arbol sellado y con el archivo de casos final.

- **Semgrep 124 WARNING / 0 ERROR**, la linea base exacta, sin un aviso nuevo. **Sin huerfanos
  nuevos**: el censo es identico a HEAD y lo unico que cambia son los numeros de linea. El diff
  son **263 lineas agregadas y 30 quitadas** en `index.html`, de las que **64** no son
  comentario, con **UN** `innerHTML` nuevo que recibe un literal por el mismo `badge()` que las
  tres lineas hermanas de su propia funcion, **cero** `eval(` y `new Function`, y cero claves ni
  contrasenias —las dos unicas apariciones de «token» son la palabra espaniola en MIS
  comentarios, sobre el `yaDicho` de la valvula—. **Cero campos guardados nuevos, cero columnas
  de Excel y ningun id cambiado.**

- **Donde esta todo:** `docs/INVENTARIO_PANT24.md` (el inventario del commit 1),
  `docs/GUIA_PRUEBA_PANT24.md` (la guia manual en ocho pasos), `docs/PENDIENTES.md` → **P24-a**,
  **P24-b** y **P24-c**, y `docs/archivo/PENDIENTES_CERRADOS.md` → **P18-b** y **P18-d**,
  cerrados.

## PANT-25 — Referencias se ordena como la app, y masas y fuentes embolígenas ganan lo que les faltaba (2026-11-08)

**Commits**: el inventario con las premisas y la base de los casos; la lectura de las fuentes en
imagen; la estructura nueva de pestañas; los cinco bloques de masas; las sensibilidades y los
predictores de embolia; y la cobertura con la documentación. Al empezar, `origin/main` = `HEAD` =
**`bc62db2`**, el cierre de PANT-24, ya publicado, con `index.html` en md5 `b8481a9b`, **168.950**
líneas, sello `v20261107-2204`, y el pendrive `DISK_IMG` montado. Sello nuevo
**`v20261108-0123`**, md5 **`f2587ad8`**, **169.015** líneas.
**El push lo corre Maicol: esta tanda tenía orden expresa de NO pushear.**

⚠️ **POR VIGESIMOSEGUNDA VEZ SEGUIDA EL RENGLÓN DE TAMAÑO QUE SE ENCONTRÓ ESTABA BIEN**, y se
verificó de las dos formas que esta casa manda: el sello del pie coincidía con el de `CLAUDE.md`,
y `git show bc62db2:index.html` da **168.950** líneas, **12.288.401** bytes y **`b8481a9b`**.

- **⚠️ LA PREMISA CENTRAL DE LA ORDEN NO SE REPRODUJO (commit 1).** El CONTEXTO afirma que las
  masas y las fuentes embolígenas **no tienen entrada en Referencias**, y **las dos existen desde
  PANT-11** —`ref-tumores` y `ref-embolig`, ya adyacentes dentro de «Otros hallazgos» y ya en el
  reparto—, o sea que la **decisión (4) ya estaba cumplida**. No había ninguna pestaña que crear:
  los commits 4 y 5 **completaron** las dos fichas.

- **LA LECTURA (commit 2).** **Trece hojas en imagen** a 220-230 ppp, con el folio comprobado en
  el pie o la cabecera de cada una: Angeli 2024 (2, 3, 4, 5, 6 y 13), Saric 2016 (3, 10, 15, 16,
  17, 18 y 27) y Lyon 2022 (91, 92 y 93). **Las tres reglas de folio quedan comprobadas por mí**
  —hoja + 846, hoja, y hoja + 4228—; la de Kleindorfer **no**, y por eso no se escribe ni una
  cifra suya. **Cincuenta y un datos verificados**, cuarenta y cinco nuevos. Entre ellos, **los
  puntajes que la ficha declaraba como no leídos con certeza**.

- **LA ESTRUCTURA (commit 3).** De **seis a NUEVE** pestañas principales. **Se mueve, no se
  reescribe**: de las **40** entradas, **cero** cambian de texto, de título o de conteo de hijas,
  y sólo **cinco** cambian de panel. **`SUBTIT` era el único enlace que se rompía solo** —un
  objeto literal de seis claves que decide el rótulo de sección del buscador— y entra en el mismo
  commit. Las **50** claves de «Ver referencia» resuelven en los dos árboles y **ningún destino
  cambia**; `refIr` deriva la subpestaña del **DOM**, así que siguió al nodo sola.

- **LAS DOS FICHAS (commits 4 y 5).** Masas pasa de **14 filas a 63** con los cinco bloques de la
  decisión (5), en su orden; embolígenas de **18 a 31**. **Dos retiros que la regla del 08/11
  obliga**: la cláusula «no se leyeron con certeza» y la fila de la **OMS**, cuya celda de Fuente
  decía «—». Medido con control positivo: las palabras prohibidas dan **cero** en las fichas
  nuevas y **tres** en la de HEAD.

- **LA COBERTURA.** **TC-761** a **TC-764**, los cuatro cayendo contra `bc62db2` por **25
  condiciones** y ninguna por excepción. **Seis casos viejos adaptados** —TC-502, TC-509, TC-531,
  TC-534 y TC-679—, y ⚠️ **tres de ellos no los encontró el censo por literales y sí la corrida**:
  TC-502 (A5) y TC-531 (A1) tenían el SEIS escrito como número suelto, y TC-534 (G1) afirmaba la
  ubicación del posoperatorio sin nombrar un literal que se moviera. **36 de 36 mutaciones
  dirigidas muertas**, con el md5 del árbol vivo idéntico antes y después.
  ⚠️ **El primer barrido dejó DOS sobrevivientes y las dos eran huecos reales**, del modo de falla
  que PANT-21 documenta: la cifra se contaba sobre el texto **entero** de la ficha.

- **EL A/B DEL PAPEL**, con el PDF y el PPT generados de verdad: **121 escenas, 148.572 claves y
  55.297 celdas**, y **cero diferencias** de superficie firmada **y de pantalla**. Excel **457** y
  campos **1026**, los dos idénticos.


- **LA LÍNEA BASE AL CIERRE: suite 773/779**, en **quince** lotes cubriendo los **779 casos
  distintos** —contados nombre por nombre, cero duplicados, con la guarda del arnés comparando lo
  listado con lo ejecutado: **779 de 779**—, en UNA sola pasada sobre el árbol sellado, con el
  pendrive `DISK_IMG` **verificado al abrir, en cada uno de los quince lotes y al cerrar**
  (diecisiete verificaciones) y el md5 de `index.html` **idéntico** antes y después
  (`f2587ad8`). Los rojos son **TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre, más
  **TC-551** y **TC-557**, los dos intermitentes declarados. **Ningún rojo nuevo**, y los cuatro
  casos nuevos y los seis adaptados en verde.
  ⚠️ **LOS DOS INTERMITENTES SE CARACTERIZARON COMO MANDA ESTA CASA, con CUATRO corridas aisladas
  cada uno, y los dos pasan 4 DE 4**: TC-551 es el que `COR-f` declara —mide el chorro de la
  orejuela sin pausar la animación— y TC-557 el que `TGA-h` declara, con la firma de
  `elementFromPoint` fuera del viewport. Son del contexto de la suite, que corre los 779 casos en
  UNA sola página, y no de esta tanda.
  ⚠️ **Y TC-182 y TC-706, que PANT-24 dejó en rojo, salieron VERDES**, lo que confirma lo que esa
  tanda ya había medido: los dos pasan aislados y lo que los mueve es el contexto del arnés.

- **Semgrep 124 WARNING / 0 ERROR**, la línea base exacta, sin un aviso nuevo. **Sin huérfanos
  nuevos.** **CELULAR: 59 hallazgos a 360 px y 67 a 390, con 18 ALTA en cada ancho** — la línea
  base exacta. **No empeoró.**

- **CHROME Y WEBKIT COINCIDEN EN LOS DIECISÉIS CRUCES** (dos motores × 1440, 1000, 768 y 390 px ×
  dos temas), en las dos sondas: **nueve** botones de **44 px** de alto, la barra desplazándose
  **por dentro** desde los 1000 px, **cero** desplazamiento horizontal de la página, **cero**
  textos recortados, **cero** pestañas que no abren, las dos fichas **abiertas de verdad** con sus
  63 y 31 filas, **cero** celdas y filas vacías nuevas, y **CERO errores de consola y de página en
  los dos motores**. La única diferencia entre motores es de **métrica de fuente**: el contenido
  de la barra mide 1161 px en Chrome y 1179 en WebKit.
  ⚠️ **WebKit de Playwright no es Safari, y se declara.** Chrome va por el del sistema.

- **Dónde está todo:** `docs/INVENTARIO_REFERENCIAS_P25.md`, `docs/CONTROL_MASAS_P25.md`,
  `docs/GUIA_PRUEBA_PANT25.md`, el puntero en `docs/mapa/referencias-subpestanas.md`, y
  `docs/PENDIENTES.md` → **P25-a**, **P25-b** y **P25-c**.
