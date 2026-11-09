# Fichas de los casos TC-769 a TC-777 — tanda PANT-26 (2026-11-09)

Archivo propio: `docs/mapa/tests-fichas.md` estaba en **34,2 KB**, a menos de 1 KB del techo de
~35 KB que `CLAUDE.md` fija, medido **antes** de escribir, que es la regla.

Los nueve **caen contra el árbol anterior a la tanda** (`b3e30a5`, md5 `a14c45a0`) por **47
condiciones y CERO excepciones**, verificado en un worktree alternando sólo `index.html` con el
mismo archivo de casos.

---

## TC-769 · La cápsula se repinta al elegir el modelo (D8, commit 2)

**Qué fija.** Que `vModTrasElegir` existe, y que al elegir el modelo por el gesto real del
componente —botón, buscador, sugerencia, tamaño, «Elegir»— la cápsula `#ea-det-sev` publica el
mismo veredicto que el informe firmado ya usa, y el plegable deja de decir que no hay modelo.

**Denominador.** (A1) el catálogo A4 tiene un modelo que deja el área medida a 2 DE o más por
debajo —se **busca** dentro del catálogo, no se elige de memoria—; (A2) el recuadro
`caja-esten-aortica` está **visible**; (B2) el modelo quedó **cargado**, con `sugerencias > 0`.

**Controles.** (C1) quitar el modelo devuelve la cápsula a «Posible» y `eoaEvaluable` a falso;
(D1) sin elegir modelo, volver a tipear el mismo valor no la mueve; (E1) elegir modelo en la
**mitral** no mueve su veredicto, porque su cápsula no lee el catálogo.

**Trampa que pagó.** `generarInforme()` cambia de pestaña, y con el botón sin caja
`_vModColocar` se rinde: la primera corrida de su sonda hermana midió «sugerencias: 0» con el
modelo sin cargar. El caso vuelve a Válvulas **antes** de abrir el componente.

**Mutaciones que lo matan.** 01, 02 y 03.

---

## TC-770 · El área contra el modelo en la TAVI (D2, commit 3a)

**Qué fija.** Que con un modelo de `PROT_CAT_TAVI` y desvío el área vota, con la **misma**
función, los **mismos** cortes y el **mismo** dueño; y que sin desvío o sin modelo no vota y no
se escribe nada nuevo.

**Denominador.** (A0) `PROT_CAT_TAVI` tiene 9 modelos y sus 26 celdas de área traen desvío, así
que los 9 sirven; (A1) hay un modelo en el tramo «dentro de 1 DE» y otro en «a más de 2 DE»;
(B1) el modelo quedó cargado.

**Los tramos.** (B2) dentro de ±1 DE → `eoa` normal; (B3) a más de 2 DE → `eoa` signif; (B4) con
los dos ejes dependientes normales el veredicto **no** llega a «signif», porque la regla de las
dos mitades sigue en pie; (B5) con los dos ejes en significativa **y** el área a más de 2 DE, sí.

**Controles.** (B0) la misma escena sin modelo no evalúa el área; (C1) el **modo MANUAL** tampoco,
porque sus valores se construyen con desvío nulo; (D0) los cortes siguen siendo `EA_PROT_EOA_Z`;
(D2) la quirúrgica se comporta igual que antes de la tanda.

**Trampa que pagó.** Los insumos tienen que caer dentro de su banda de plausibilidad: con un VTI
del TSVI de 80 cm la app marca «revisar la unidad» y el DVI y la AEO indexada salen vacíos.

**Mutaciones que lo matan.** 04 a 08.

---

## TC-771 · La condición de la nota al pie de la Tabla 7 (D7, commit 3b)

**Qué fija.** Que con modelo cargado y con desvío el desajuste se publica **sólo** si el área
efectiva medida está dentro de 1 desvío estándar de la del modelo; que cuando no se cumple **no
se escribe nada en su lugar**; y que sin modelo se publica como siempre.

**Denominador.** (A0) `EA_PROT_PPM_SD` existe y vale 1; (A1) la escena tiene desajuste medido,
moderado o severo; (B1) y (C1) el modelo quedó cargado y el área quedó donde el caso dice, con el
desajuste **todavía** medido.

**Lo que mide.** (B2) dentro de 1 DE → el cuerpo y el EN SUMA lo publican; (C2) fuera → ninguno
de los dos; (C3) y no aparece ninguna frase nueva; (C4) **la fila de pantalla sigue publicando la
AEO indexada con su categoría**: lo que se retira es la oración, no el número.

**Control.** (A2) sin modelo, `ppmDentro1DE` vale `true` y el papel es el de siempre.

**Mutaciones que lo matan.** 09 a 13.

---

## TC-772 · «Con posible estenosis» (D1, commit 4a)

**Qué fija.** El texto exacto en los tres estilos y en el EN SUMA de las dos vías, con el
paréntesis de medidas conservado; y que donde la decisión no alcanza, la frase vieja sigue.

**Denominador.** (A0) la escena del médico llega a la zona: nivel «faltan», `pDep` en «signif» y
**ningún** eje independiente; (A1) `EA_PROT_POSIBLE_SD` dice lo que la decisión fija.

**Lo que mide.** (B1) el narrativo, palabra por palabra; (B2) el estándar y el conciso; (B3) la
frase vieja ya no está en ninguno; (B4) **el paréntesis se conserva en los tres**; (B5) el EN SUMA
de la TAVI es «TAVI con posible estenosis.»; (B6) y no dice «protésica»; (C1) y (C2) la biológica
y la mecánica, con el esqueleto «Prótesis aórtica: posible estenosis.».

**Controles.** (D1) con los dos ejes dependientes **normales** la frase vieja sigue; (D2) sin
ningún dato dependiente, también; (D3) **con** eje independiente la regla no entra y el veredicto
gradúa; (D4) una válvula aórtica **nativa** con los mismos números no dice nada de esto.

**Mutaciones que lo matan.** 14 a 23.

---

## TC-773 · El desajuste apaga «normofuncionante» (D3, commit 4b)

**Qué fija.** Que una TAVI con desajuste no dice «normofuncionante» en ninguna superficie de
texto, que la línea del desajuste se queda, y que sin desajuste la palabra sigue.

**Denominador.** (A0) nivel «faltan», DVI normal y desajuste **severo** medido; (A1) `normoTavi`
es falso.

**Lo que mide.** (B1) ninguno de los tres estilos la dice; (B2) el EN SUMA tampoco; (B3) la frase
sale con el esqueleto de siempre y **conserva** el paréntesis; (B4) la línea del desajuste se
queda en el cuerpo y en el EN SUMA.

**Controles.** (C1) la TAVI sin ningún dato sigue diciendo «normofuncionante»; (C2) con los tres
ejes normales y sin desajuste el veredicto gradúa; (D1) y (D2) **la guarda se prueba inyectando
el objeto**, con `ppm` severo y con `ppm` «no», que es lo que separa «mira el grado» de «mira otra
cosa».

**Mutaciones que lo matan.** 24, 25 y 26.

---

## TC-774 · La mitral sin conclusión por fila (D5, commit 5a)

**Qué fija.** Que las cinco filas publican el **valor** y la **escala** de la Tabla 11 y **no**
concluyen; que la conclusión queda sólo en el resumen; y que el papel no cambia.

**Denominador.** (A0) la cápsula existe y su veredicto cuenta un solo criterio positivo; (A1) la
velocidad pico de E **no** está entre los que votan; (B0) las cinco filas tienen texto.

**Lo que mide.** (A2) y (A3) la velocidad y el gradiente, con su valor y su escala y sin ninguna
de las tres conclusiones; (B1) **ninguna** de las cinco concluye; (B2) el THP con su escala;
(A4) y (B3) el resumen **sí** concluye, con sus criterios y su conteo.

**Controles.** (C1) y (C2) el papel y el EN SUMA siguen publicando la línea de la obstrucción;
(D1) una fila **sin medir** sigue diciendo dónde se carga, porque un motivo no es una conclusión;
(E1) **la tricúspide sigue publicando su lectura por fila**.

**Mutaciones que lo matan.** 27 a 30 — y la **28** es la que vigila que la escala **no** se
pierda.

---

## TC-775 · Las cuatro declaraciones (D4, D2, D6, D7, commit 5b)

**Qué fija.** Las cuatro, cada una en su lugar, y lo que **no** cambió de esos textos.

**Denominador.** (A0) la salvedad de la TAVI tiene texto; (B0) las dos salvedades del área traen
texto; (C0) `QV_NOTA` tiene la clave nueva; (C1b) y (E1b) **las tarjetas se arman con su escena
cargada**, no con el mensaje de «Sin parámetros cargados».

**Lo que mide.** (A1) la declaración de los cortes; (A2) que la atribución con hoja y folio
salió; (A3) que lo que **sí** es de la guía se conserva; (A4) que el médico la ve en el plegable;
(B1) la declaración del área en TAVI; (B2) que no se le atribuye a la Tabla 5 una fila de la
quirúrgica; (B3) que la quirúrgica conserva la suya; (B4) que las dos siguen publicando la
desviación; (C1) el texto exacto de la pulmonar; (C2) que se ve en la tarjeta; (C3) que la cita
de la Tabla 15 se queda; (D1) la declaración del desajuste; (D2) sin perder lo que ya decía.

**Controles.** (E1) `VINFO['ea-prot-sev']` no ganó ninguna declaración; (E2) la tarjeta de la
tricúspide conserva su nota de la regla de dos.

**Trampa que pagó.** La tarjeta de una válvula se arma con la escena cargada: sin ella publica
«Sin parámetros cargados para esta lesión», 85 caracteres, y la medición sale sobre un
denominador vacío.

**Mutaciones que lo matan.** 31 a 35.

---

## TC-776 · El ⓘ del 3D y su línea de abajo (commit 6)

**Qué fija.** El texto aprobado del globo, los tres párrafos, y la línea sin «todavía» con la
lista idéntica.

**Denominador.** (A0) con una CIA cargada aparece el recuadro; (A1) el panel quedó **abierto** por
su botón «Ver en 3D»; (C0) el botón ⓘ **tiene caja**; (C1) la tarjeta abrió y trajo texto;
(E0) hay al menos una lesión cargada que el diagrama no representa.

**Lo que mide.** (B1) los rótulos son «Según el estudio» y «Explorar»; (C2), (C3) y (C4) los tres
párrafos, palabra por palabra; (C5) el texto viejo ya no está; (D1) **el botón del PDF está
habilitado en el modo del estudio**, que es lo que el segundo párrafo afirma; (D2) y apagado en
«Explorar», con su aviso; (D3) y ahí la línea se vacía; (E1) la frase nueva; (E2) sin «todavía»;
(E3) **la lista de nombres no cambió**, comparada contra lo que `cc3dNoDibujadas` devuelve;
(E4) los cuatro rótulos posibles siguen siendo los mismos.

**Control.** (F1) sin nada cargado, la otra frase no se tocó.

**Trampa que pagó.** `#cc3d-wrap` y `#cc3d-panel` nacen en `display:none`, y con el botón ⓘ sin
caja `_vInfoColocar` se rinde: dos corridas midieron «chars: 0» en los dos árboles. Y el selector
de CIA guarda `secundum`, no el rótulo que muestra.

**Mutaciones que lo matan.** 36 a 39.

---

## TC-777 · Lo que la tanda NO tocó

**Qué fija.** Los cinco catálogos con su conteo de modelos y de filas, el mapeo
`VMOD_TABLA`, la tricúspide entera, las **457** columnas del Excel y el texto que indexa el
Laboratorio.

**Denominador.** (A0) los cinco catálogos existen; (B0) la cápsula tricúspide gradúa; (C0) la fila
del Excel se arma y trae más de 400 columnas; (D0) el informe y el EN SUMA traen texto.

**Trampa que pagó.** **Las columnas se cuentan como el Excel las arma**, con `_labExcelRow` y
`_labOrdenarCols`, no sobre `LAB_XLS_MAP`: ese mapa tiene **381** claves, y la primera corrida de
este caso midió 381 y se leía como si la tanda hubiera borrado 76 columnas.
