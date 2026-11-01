# Fichas de los casos TC-591 a TC-594 — tanda MARFAN-2 (2026-11-02)

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34.237 B**, a 800 bytes del techo.
El mapa de la tanda es `docs/mapa/marfan2-pantalla-z.md`.

⚠️ **EL SUITE CORRE CHROME A 756 px** —headless sin `--window-size`—, o sea en la maquetación de
**celular**. Los cuatro casos miden por eso la **regla** de la hoja de estilos y la **estructura**,
no la geometría lado a lado; eso lo miden las sondas en los cuatro anchos y en los dos motores.

⚠️ **LOS CUATRO LLEVAN HELPERS TOLERANTES AL ÁRBOL VIEJO.** Contra HEAD varias de estas cosas no
existen, y la primera línea que las nombrara mataría el caso con un `TypeError` sin decir **qué**
invariante se rompió. Medido: los cuatro caen contra HEAD por **80 condiciones y ninguna
excepción**.

---

## TC-591 · la sección en dos columnas, sin texto bajo «Factores de riesgo», el título de la conclusión y el globo descriptivo

| bloque | qué fija |
|---|---|
| (A0) | **denominador**: el acordeón de Marfan está abierto |
| (B0)-(B7) | las **dos** subcolumnas; síndrome y factores en la **primera**, los dos diámetros y el índice en la **segunda**, y el orden dentro de cada una |
| (C1)-(C2) | el span `marfan-fr-hint` **ya no existe** y la columna de campos no publica la guía, la tabla ni el folio |
| (C3) | **control negativo**: la lectura de la raíz cargada en AI/VI —que es un **dato**— sigue debajo del campo |
| (D0)-(D3) | el rótulo de la conclusión mide **12px/500**, igual que el de otra conclusión de la app, y el encabezado del acordeón **11px/700**, igual que los otros de C. Congénitas |
| (E0)-(E7) | el globo de la sección: trae la **lista de factores** con su guía, su tabla y su folio; abre **describiendo** lo que la guía fija; **cero** «se debe», «se recomienda», «seguimiento» e «indicada»; y **conserva** la clase y el nivel |
| (E8) | **control negativo**: con Turner la lista **cambia** y nombra su propia tabla |

⚠️ **(C3) necesita el módulo SIN USAR, y salió de una medición.** Con el síndrome cargado, el
espejo condicional del G-4 copia `ao_sin` a `marfan_ao_seno`, el campo propio deja de estar vacío
y la lectura **no sale** — por diseño: repetir el número al lado del campo que lo contiene no dice
nada. Medirlo con el síndrome puesto daba «NO» sobre un comportamiento correcto.

⚠️ **(D1)-(D3) fijan una premisa que resultó FALSA.** La orden anticipa que el título es más
grande que los demás; medido, no lo es. Lo que estas tres condiciones hacen es **fijar los tres
valores** para que un cambio futuro se ponga rojo. → `PENDIENTES.md` **MF2-d**.

---

## TC-592 · la tarjeta en tres bandas, los cuatro globos estándar, los selectores y las reglas

| bloque | qué fija |
|---|---|
| (A0) | **denominador**: la tarjeta abrió y tiene cuerpo |
| (B1)-(B3) | **tres** bandas a la izquierda en su orden, y la figura **entera** en la columna de la derecha |
| (B4)-(B5b) | los dos bloques son **grillas**, su regla pide **dos** columnas y a 760 px o menos se apilan |
| (B6) | los **tres** selectores ocupan las dos columnas |
| (B7) | el cuerpo baja de **1700 px** al ancho del suite, donde HEAD daba **1850** |
| (C1)-(C4) | **tres** globos en la tarjeta, los tres con el glifo **U+24D8**, con sus tres claves |
| (C5) | el **cuarto** es el de la sección, fuera de la tarjeta |
| (C6)-(C7) | **denominador**: más de cincuenta botones del documento usan ese mismo glifo, y **ninguno** quedó con la «i» suelta U+2139 |
| (D0)-(D2) | las **diecinueve** definiciones publicadas dentro de su globo de grupo, **con su folio** |
| (D3) | las **diez** zonas del cuerpo |
| (D4) | la definición sale de **VINFO** y no de una copia — se muta la entrada y el globo cambia |
| (D5)-(D7) | el cuerpo de la tarjeta no dice «folio», no nombra un Box ni la revista |
| (E0)-(E7) | el puntaje de la **opción elegida** en siete casos: pie plano **1**, retropié 2, sin elegir el máximo 2, excavatum 1, carinatum 2, un signo 1, los dos 3 |
| (E8) | **control negativo**: una **casilla** sigue publicando su puntaje fijo |
| (E9) | ningún selector corta su texto |
| (F0)-(F8) | las siete reglas en **una línea**, sin motivo debajo, con su número y su estado; lo que falta **una** vez; el aviso **una** vez; los dos grupos como rótulo chico; y el motivo repetido que había en cuatro de siete, ahora en una |
| (F9)-(F10) | **control negativo**: con todo contestado **no** sale la línea de lo que falta |
| (F11) | **control**: la lógica sigue en su dueño — las siete conservan su `txt` completo y su `por` |
| (F12)-(F13) | el globo de las reglas publica las **siete** completas |

⚠️ **(D4) es la condición que impide una segunda copia.** Siembra un centinela en
`VINFO['mfs-codo'].lee`, pide el globo y lo restaura. Si alguien copiara las definiciones dentro
del globo, el centinela no aparecería y la condición se pone roja.

⚠️ **(F3) no usa expresión regular, y es a propósito**: el cuerpo de un caso es un template
literal y una barra invertida simple **no sobrevive** — el patrón llega sin ella y deja de pedir
el paréntesis. Es la trampa que este repositorio ya documenta.

⚠️ **(C5) obliga a abrir la pestaña, el acordeón y cargar un síndrome ANTES.** El globo de la
sección lo pinta `marfanSync` dentro de la conclusión: sin datos esa fila no existe y la condición
daba «NO EXISTE» sobre un botón que sí se dibuja.

---

## TC-593 · la conclusión en cuatro filas y el veredicto sin indicaciones

| bloque | qué fija |
|---|---|
| (A0)-(A5) | las **cuatro** filas y su **orden**; la de criterios nombra la regla que cumple; la de otros datos publica lo cargado con su estado; la del umbral lleva el umbral **y** el diámetro medido; la cuarta es la conducta con su globo |
| (B1)-(B9) | los **nueve** escenarios de la pastilla, uno por rama de `marfanEstado` |
| (B10) | **control negativo**: el **color** sigue separando la Clase I de la IIb, así que la información no se perdió |
| (B11) | **control**: las **claves** de `marfanEstado` siguen siendo las mismas — las lee el Laboratorio |
| (C1)-(C5) | ninguna superficie de la sección dice «indicada», «se recomienda», «seguimiento» ni «considerar», ni nombra la guía, la tabla o el folio |
| (C6) | pero **sí** conserva el umbral en milímetros |
| (D0)-(D3) | **el papel no cambia**: ni la conclusión de pantalla, ni la fila de Ghent, ni el umbral llegan al informe ni al EN SUMA |

⚠️ **(B10) y (B11) son lo que impide que esto se lea como una pérdida de información.** Tres
claves distintas publican hoy la misma frase; lo que las separa es el color, y lo que el
Laboratorio lee es la clave. Sin estas dos, aplanar las tres a un gris único pasaría igual.

---

## TC-594 · el Z de la raíz, su round-trip y el calculado que no existe

| bloque | qué fija |
|---|---|
| (A0)-(A3) | el campo existe **sin abrir la tarjeta**, vive en la guardería, es del **estudio** y acepta decimales |
| (A4)-(A5) | el recolector lo toma y el Excel sigue en **441 columnas con cero** entradas `mfs` |
| (A6)-(A8) | la tarjeta **no** tiene un segundo control del Z; el campo entra en préstamo y **vuelve con su valor** |
| (B0)-(B5) | **round-trip** por las funciones reales: se guarda, el registro trae el Z, las reglas **concluyen sobre el estudio archivado**, «Nuevo estudio» lo deja vacío y reabrir lo devuelve |
| (C0)-(C3) | las reglas 1, 2 y 3 leen el Z, con su denominador sin Z |
| (C4)-(C7) | los **dos cortes de edad** de la regla 7 y la disección cumpliendo sin Z ni edad |
| (C8) | **control negativo**: Z 1,5 con la disección en «no» pone las reglas 1 y 2 en **no cumple** |
| (D1)-(D4) | **ninguna** función calcula un Z; el globo declara «Z calculado: no disponible», dice que la fuente no está, y explica de dónde sale el Z y con qué método |
| (E0)-(E3) | el papel **no** publica el Z, ni «Z-score», ni la regla que cumple |

⚠️ **(B0)-(B5) usan el helper `__t.guardar()` de la suite y no `guardarInforme` a secas.** La
primera versión de la sonda llamaba a `guardarInforme` con un callback y el estudio **no se
guardaba**: esa función exige nombre o documento, la primera vez muestra la **card de severidades
valvulares** y el guardado real cuelga de confirmarla con `#rev-confirm`. Quien reabre es
`cargarEstudioPorId`, no `editarInforme`. Costó una corrida.

⚠️ **(C3) arma el puntaje de 7 con los tres SELECTORES** —muñeca 3 + pectus 2 + retropié 2— y no
con el neumotórax: ése es una **casilla**, y el helper `pon` escribe `.value`, no `.checked`.

⚠️ **(C3) espera la regla 6 en «sin dato» y no en «no cumple».** Con el puntaje en 7, esa regla
deja de fallar por el puntaje y le falta la historia familiar: es la lógica de tres estados de
MARFAN-1 y no un cambio de esta tanda.
