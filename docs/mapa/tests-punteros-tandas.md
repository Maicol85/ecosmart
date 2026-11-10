# Mapa — los casos de prueba, tanda por tanda


## PANT-14 (2026-11-05) — el esquema negro, el botón del PDF, la transposición y las siete lesiones

Seis casos nuevos, **TC-693 a TC-698**. Mapa: `docs/mapa/pant14-esquema-lesiones.md`.
**34 de 34** mutaciones dirigidas muertas (`scripts/_mut_pant14.py`), con md5 idéntico antes y
después; los seis caen contra HEAD por **80 condiciones y ninguna por excepción**.

| caso | qué fija | reparto de mutaciones |
|---|---|---|
| **TC-693** | el esquema sin cajas negras: la premisa (`--card` no existe), la paleta resuelta al dibujar, las seis cajas y las dos válvulas sin relleno negro, el contraste de cada caja con su texto, cero `var()` en el marcado, las cinco variantes dibujando y la letra de la válvula dorada | 6 |
| **TC-694** | el botón del PDF: apagado sin lesiones y en «Explorar» con dos avisos distintos y con texto, activo con una CIA, «Incluido en el PDF» con su registro, y apagado al sacarle la lesión | 3 |
| **TC-695** | las reglas de la transposición: las cinco variantes permiten exactamente lo que el 3D de la pestaña dibuja, la obstrucción subaórtica con su anillo y su rótulo, y la pestaña conserva su recuadro | 6 |
| **TC-696** | las siete lesiones conectadas, con sus casillas y **siete controles negativos** | 15 |
| **TC-697** | la única base: las cinco solas como denominador y los **diez pares** con su prioridad, y la línea que ya no se contradice | 3 |
| **TC-698** | solo lectura: siete siembras mudas y cero campos movidos, con su denominador | 1 |

### Las tres trampas que estos casos pagaron

1. **`_cm3d` no está en `window`**: es un `const` de nivel de script, así que se alcanza por su
   nombre pelado. Con `window._cm3d` el guardia corta y el caso mide sobre un **denominador
   vacío**, que se lee igual que «todo bien».
2. **`getBBox()` dentro de un subárbol en `display:none` devuelve ceros.** El panel del esquema
   nace cerrado, así que emparejar cajas con textos por su caja medida los encuentra **todos en
   el origen**: la condición pasa sobre nada. La geometría se compara por **atributos**.
3. **La barra invertida simple no sobrevive al template literal**: `/rgba?\(...)/` llega con el
   paréntesis convertido en grupo, el parseo del color da **NaN**, y con NaN tanto «es negro» como
   el contraste dan **falso**. Un **pase vacuo**. Se parsea con `indexOf` y `split`.

### Caso viejo adaptado

**TC-626 (D2)**: la coartación **ya se dibuja**, así que deja de caer en la lista de «cargadas y
no dibujadas». Con el istmo cargado y **sin** la situación cae en la otra lista. La condición queda
**más fuerte**: exige que ya no esté entre las faltantes, que **sí** esté nombrada por su situación
ausente y que la miocardiopatía siga entre las faltantes.

---
> **Salió de `tests.md` el 31/10/2026 (tanda AJUSTES-3, commit 5).** Ese mapa estaba en
> **34,6 KB**, a menos de 500 bytes del techo de ~35 KB que `ecosmart/CLAUDE.md` fija, y
> `TGA2-g` lo dejó declarado. Lo que se movió acá es la **cola de punteros por tanda**: una
> entrada por cada caso nuevo desde la tanda J (24/10/2026), con el número del caso, qué fija y
> en qué ficha vive su detalle. Crece con cada tanda, que es justo por lo que tenía que salir.
>
> **Cero líneas perdidas**: el bloque se movió entero, byte por byte, verificado contra el
> archivo anterior. En `tests.md` quedan el arnés (`scripts/test_clinico.mjs`), cómo agregar un
> caso, cómo correr la suite, los dos juegos de helpers de válvulas y el índice de fichas.
>
> Para los **arneses de A/B y de mutación** y sus trampas: `docs/mapa/arneses-ab-mutacion.md`.


> ⚠️ **Las tandas del 24 al 31 de OCTUBRE se mudaron a `docs/mapa/tests-punteros-octubre.md`**
> (partido el 2026-11-04 en PANT-7, porque este archivo cruzó el techo de 35 KB). Acá quedan
> las de **noviembre**. Cero líneas perdidas, verificado una por una.

## La tanda PANT-3 (2026-11-02 y 03) — TC-623 a TC-627

Cinco casos, uno por commit. El mapa es **`docs/mapa/pant3-botones-3d-mch.md`**.

| caso | qué fija |
|---|---|
| **TC-623** | los botones CIA y CIV: se pintan enteros, la marca sobrevive al cambio de pantalla, viaja con el estudio, y cada lesión tiene su propia compuerta — con la casilla de abajo encendida y el botón apagado la lesión NO se emite |
| **TC-624** | los rótulos del esquema de la TGA: ninguno queda tapado por una línea sin halo ni respaldo opaco, ninguno se pisa, y el ⓘ ya no trae el bloque «A tener en cuenta» |
| **TC-625** | ninguna pantalla dice que algo esté pendiente de revisión por un especialista, y los tres avisos generales se mantienen |
| **TC-626** | el botón «3D»: una sola instancia, sólo en las dos sub-pestañas de congénitas, el préstamo del recuadro ida y vuelta, la línea de lo no dibujado y cero campos del estudio movidos |
| **TC-627** | la pantalla de MCH: treinta ids, tres columnas y dos cuadros, las seis frases fuera, los seis globos con su folio y el conteo rotulado 2024 |

**Adaptados**: TC-471 (el registro de globos, 101 → 108), TC-502 (las tarjetas sin ficha en
Referencias, treinta → treinta y siete) y TC-535 (los globos de 44×44, veintidós → veintinueve).

⚠️ **Dos trampas que estos casos pagaron.** Un caso que no vacía el formulario hereda el del
anterior: TC-626 pasaba aislado y fallaba en el lote. Y el criterio de «tapado» de TC-624 no
puede mirar el orden de dibujo: el rótulo «VD» del Rastelli vive dentro de su recuadro y una
flecha roza el borde de ese recuadro a la altura de su línea de base, así que la sonda lo medía
en cero y el caso en dos **sobre el mismo árbol**. Lo que separa los dos casos es DÓNDE VIVE el
rótulo, no quién se dibujó primero.

## Tanda POP-B (2026-11-01) — TC-582 a TC-585

Las fichas están en **`docs/mapa/tests-fichas-582.md`** (archivo propio: `tests-fichas.md` está en
34,2 KB).

| caso | qué fija |
|---|---|
| **TC-582** | el botón «Integrar al informe» conserva el `title` que dice por qué no puede —después del barrido de 220 ms—, integra con el estudio completo, y el contador de fármacos coincide con las filas visibles |
| **TC-583** | el tipo de una válvula operada son sólo prótesis; con una nativa queda en «elegir tipo», la avisa y no toca Válvulas; el papel no describe la cirugía con una morfología nativa |
| **TC-584** | «Pleura y pulmón» a ancho completo fuera de las tres columnas y en dos columnas desde 900 px; el eco y el VD al lado; ningún id movido |
| **TC-585** | el dibujo: cero superposiciones y cero textos fuera del lienzo, el derrame pleural como nivel que sube con el grado, el puente, la malla, los drenajes y las cuatro válvulas con su tipo y su latido |

⚠️ **Los cuatro corren a 756 px**, que es el ancho del suite: lo que vive por encima de 900 px se
fija por la **regla** de la hoja de estilos y por la **estructura**, no por geometría.
⚠️ **TC-585 trae el dibujo a la vista antes de muestrear el latido**: el bucle se apaga cuando el
dibujo no se ve, y sin eso el hueco de los velos se lee siempre en 0.


## Tanda MARFAN-1 (2026-11-01) — TC-586 a TC-590

`TC-586` el score del Box 2 · `TC-587` las siete reglas del Box 1 · `TC-588` el papel y el
round-trip · `TC-589` la pantalla y los globos · `TC-590` la figura.
Fichas: `docs/mapa/tests-fichas-586.md`. Mutaciones: `scripts/_mut_marfan1.py` (dieciocho).

**Cuatro casos viejos adaptados**, y los cuatro por lo mismo —afirmaban que la cápsula de
«Conducta aórtica» publica la clase, la tabla y el folio, que es lo que el commit 4b mudó al
globo—: **TC-116** y **TC-512** (leen la cita junto al texto, y TC-512 además lee el globo),
**TC-552 (E9)** —**invertida**: el umbral queda en la cápsula y la clase y la tabla en el
globo— y **TC-125**, que probaba la tarjeta vieja entera y cuyo invariante «ningún control del
panel lleva id» se **invirtió a propósito** para Marfan: sus diecinueve rasgos son campos del
estudio.

## Tanda MARFAN-2 (2026-11-02) — TC-591 a TC-594

`TC-591` la sección en dos columnas y el globo descriptivo · `TC-592` la tarjeta en tres bandas,
los cuatro globos estándar y las reglas en una línea · `TC-593` la conclusión en cuatro filas y
la pastilla sin indicaciones · `TC-594` el Z de la raíz.
Fichas: `docs/mapa/tests-fichas-591.md`. Mutaciones: `scripts/_mut_marfan2.py` (dieciocho).

**Nueve casos viejos adaptados**, con el motivo escrito en cada uno:
- **TC-116** — la lista de factores salió de debajo del campo y vive en el globo; el caso la lee
  del globo y conserva lo que afirmaba (que la lista **sigue** al síndrome), más una condición
  nueva de que el span ya no existe. ⚠️ Hay que leer **sólo su párrafo**: el resto del globo trae
  «45 mm», que haría pasar por «5 mm» un texto que no es el que el caso mide.
- **TC-471 (H)**, **TC-500** y **TC-502 (C3)** — el registro de globos pasa de **96 a 97**
  entradas (`mfs-aparte`), y la lista de tarjetas sin botón de **45 a 26**, que es el
  denominador de **antes** de MARFAN-1: los diecinueve botones por rasgo se retiraron, pero sus
  **definiciones** siguen en `VINFO`.
- **TC-535 (K0)(K1)(K2)** — los globos de 44×44 del barrido pasan de **37 a 18**, también el
  denominador de antes de MARFAN-1. Los tres de la tarjeta no entran ahí porque viven dentro del
  modal de criterios, que ese barrido no abre; los mide TC-592.
- **TC-587** y **TC-588** — el Z es un **campo guardado**, así que el caso ya no abre la tarjeta
  para cargarlo. Dos condiciones de TC-587 (I2 e I3) **sí** la abren, porque miran la tarjeta:
  medirlas cerradas daba cero reglas sobre un contenedor que no existe.
- **TC-589** — la pastilla ya no dice «Cirugía indicada» (C0, con una condición **nueva** de que
  no lo diga como indicación), y los globos de la tarjeta pasan de **21 a 3**, con dos
  condiciones **nuevas** —(D3b) y (D3c)— que exigen que las **diecinueve** definiciones sigan
  publicadas con su folio dentro de su globo de grupo.
- **TC-590 (A2)** — la tarjeta pasa de tres columnas a la izquierda con sus tres bandas y la
  figura a la derecha, con dos condiciones **nuevas** (A2b y A2c).

## Tanda POP-C (2026-11-02) — TC-595 a TC-600

Seis casos, uno por zona, con sus denominadores y sus controles negativos. Los seis **caen
contra HEAD por condiciones y ninguno por excepción** (95 condiciones en rojo) y sobreviven a
**31 mutaciones dirigidas, 31 muertas**.

| caso | qué fija |
|---|---|
| **TC-595** | el selector del tipo de válvula operada, en las cuatro válvulas y los dos sentidos |
| **TC-596** | la línea de Marfan sólo con lo positivo, y el Z de la raíz calculado |
| **TC-597** | el corte de bajo gasto estricto, la precarga sin banda, el pericardio por signos y los dos rótulos |
| **TC-598** | «Integrar» con cualquier dato, y los tres avisos que salían sin color |
| **TC-599** | las válvulas de la demo, los chorros y los catéteres |
| **TC-600** | las cavidades, el anillo del derrame, los trazados y el esquema en el PDF |

Las fichas, en **`docs/mapa/tests-fichas-595.md`** (archivo propio).
**Adaptado:** `TC-594`, cuyas condiciones (D1), (D2) y (D3) afirmaban que el Z calculado **no
existe** — es el día que ellas mismas anunciaban. Las tres quedan **invertidas**, no borradas, y
cada una gana una condición que la hace poder fallar otra vez.


## La tanda TGA-3 (2026-11-01) — TC-601 a TC-604

Las fichas de los cuatro casos están en **`docs/mapa/tests-fichas-601.md`** (archivo propio,
porque `tests-fichas.md` está en 34,2 KB).

- **TC-601** · la conclusión en la columna izquierda: hija de `#tga-campos`, último hijo, la regla
  de `grid-column` en la hoja de estilos, y `#tga-fila` con dos hijos.
- **TC-602** · la conducta fuera del papel, con la **pantalla** como control positivo y Jatene,
  Rastelli y la escena sin integrar como controles negativos.
- **TC-603** · el esquema: los seis escenarios por los rótulos del dibujo, las dos exclusiones, la
  punta de flecha sólo donde la app guarda la dirección, el cambio en vivo y **que no escribe**.
- **TC-604** · la leyenda, el glifo estándar U+24D8, lo que el esquema **no** es, y **sin una sola
  cita**.

**Seis casos viejos adaptados**, cada uno con el motivo escrito: **TC-471** y **TC-500** (el
registro de globos, 97 → 98), **TC-502** (las tarjetas sin botón, 26 → 27), **TC-535** (los globos
de 44×44, 18 → 19, en sus **tres** condiciones: (K0), (K1) y (K2) — la última se me quedó en
dieciocho y la destapó la corrida completa), **TC-573** (**invertida**: la conclusión ahora **sí** está dentro de la fila,
más dos condiciones nuevas) y **TC-574** (la métrica de solape pasa a medir los **dos** ejes).

## Tanda CORR-EVID (2026-11-02) — TC-609 a TC-612

| Caso | Qué fija |
|---|---|
| **TC-609** | el EN SUMA de la válvula reparada: estilo corto, la insuficiencia en la misma línea, sin repetirla, y la estenosis en la suya |
| **TC-610** | la regla «una pregunta, una guía» sobre las **tres** tablas, y el molde `_indPregNota` |
| **TC-611** | nada de la Evidencia de congénitas llega al informe, al EN SUMA ni a la cápsula — **con su control positivo** |
| **TC-612** | los cuatro símbolos del dibujo son distintos entre sí, y el rótulo de la miocardiopatía dice 2024 (**guardián**: pasa también contra HEAD) |

Fichas en `docs/mapa/tests-fichas-609.md`.

---

## Tanda PANT-2 (2026-11-02) — TC-619 a TC-622

| caso | qué fija |
|---|---|
| **TC-619** | el esquema que va al PDF se rasteriza con los colores y la tipografía de la pantalla, y la línea del recuadro dice el escenario una sola vez |
| **TC-620** | el ⓘ de una pregunta se cierra al tocar fuera, con Escape y al abrir otro, y tocar DENTRO no lo cierra |
| **TC-621** | las Evidencias de más de 6 preguntas reparten en dos columnas con filas compactas, y las de 6 o menos NO se mueven |
| **TC-622** | el informe de la transposición nombra la disfunción directo y no menciona lo que no está cargado, y Ebstein no se toca |

**Adaptados — SEIS**: TC-293 (invertida: contestar cierra la nota), TC-451 (una sola nota
abierta), TC-615 (C3 y C4 invertidas: el esquema ya no lleva línea propia), TC-616 (B2: 32 px
visibles con 44 de área, más B2b), **TC-528** (D2 invertida, el mismo invariante que TC-293) y
**TC-569** (B1, B2 y E7 por zona; F2 deja de contar el contenido de los `<details>` cerrados).

⚠️ **TC-528 y TC-569 los destapó la CORRIDA COMPLETA y no el censo**: grepeé por las palabras con
que lo escribe TC-293 y esos dos lo dicen distinto. Los dos **pasan contra HEAD** y fallan en el
árbol nuevo, verificado alternando sólo `index.html`.

⚠️ **El (F2) de TC-569 informaba 26 «textos recortados» y NO hay recorte real**: un `<details>`
cerrado conserva su caja teórica. Medido con las notas abiertas, **cero en los dos árboles**.

## Tanda PANT-3, segunda mitad (2026-11-03) — TC-628 a TC-632

| caso | qué fija |
|---|---|
| **TC-628** | la pantalla de MCA: la fila de dos columnas, la zona no ecocardiográfica **fuera** de ella, las reglas de 2 y 3 columnas medidas en la hoja de estilos, los cuatro globos con el glifo estándar, las cinco frases que salieron y los **26 ids** sin cambio |
| **TC-629** | Fallot: la contradicción retirada con los dos campos de volumen **todavía presentes**, la conclusión en su columna, los tres globos y la hoja 51 / folio 613 |
| **TC-630** | las dos estenosis aórticas: las dos conclusiones en su columna, los textos que salieron, y el globo diciendo **medio** y **pico** con sus cuatro folios. Los dos cortes siguen en 40 |
| **TC-631** | el módulo de arritmia: primera sección, rótulo nuevo, valor nuevo, el espejo condicional de MCH con las dos marcas, «Limpiar», la frase del papel, y **el bloque (H)**, que fija la estructura de las dos sub-pestañas |
| **TC-632** | los rótulos PSAP / PmAP / PDAP censados **en el DOM**, los viejos ausentes, los ambiguos intactos y el encabezado del Excel sin mover |

⚠️ **TC-631 (H) nació de un defecto real de la propia tanda**: mover el módulo cortando «desde su
div hasta el de la sección siguiente» se llevó el cierre de una sub-pestaña y la apertura de la
otra. La app lo gritó sola por consola y **ningún caso lo veía**.

⚠️ **TC-632 encontró tres rótulos que el censo de origen no había encontrado**, porque censa el
**DOM** y no el texto del archivo: un censo sobre `index.html` no ve lo que el DOM arma a partir
de etiquetas anidadas.

## PANT-5 (2026-11-03) — TC-639 a TC-643

| caso | qué fija |
|---|---|
| **TC-639** | el dibujo de sobrecarga del VD: mudo sin datos, solo lectura, un solo color, la raya sin número y nada en el papel |
| **TC-640** | el Forrester con un solo mensaje —y su control negativo en el Laboratorio— y la conclusión de las dos estenosis aórticas sin guía, con el criterio en el globo |
| **TC-641** | las tres pantallas reordenadas: el derrame en cuatro columnas, Fallot en tres (4+6+5) y constricción de a dos, con el **valor** de cada corte y no sólo su media query |
| **TC-642** | la CIA y la CIV lado a lado con las dos marcadas, y la longitud de los velos mitrales en los dos sentidos, el vacío incluido |
| **TC-643** | los estadios de las cuatro válvulas, con el borde C1/C2 de la insuficiencia mitral primaria y los dos avisos de las lesiones sin estadio |

Los cinco caen contra HEAD por **86 condiciones y cero excepciones**, y los sostienen **30
mutaciones dirigidas**, todas muertas. → `docs/mapa/pant5-pantallas-vd.md`.

## Tanda PANT-6 (2026-11-03) — TC-644 a TC-649

Seis casos nuevos, uno por commit de código. Las fichas, con el denominador y el control negativo
de cada bloque, están en **`docs/mapa/tests-fichas-644.md`** (archivo propio, porque
`tests-fichas.md` está a menos de 1 KB del techo).

| caso | commit | qué fija |
|---|---|---|
| TC-644 | 1 | la CIA y la CIV en las cuatro combinaciones, cada botón en su cuadro, el papel sin moverse |
| TC-645 | 2 | el dibujo del VD con su ancho mínimo para 12 px, y la lista en la columna izquierda |
| TC-646 | 3 y 7 | el molde, y los síntomas de la estenosis mitral con **cualquier** etiología |
| TC-647 | 4 | la mitral del ETE en una sección de tres columnas, con su alias y sus dos casillas |
| TC-648 | 5 y 6 | el TEER lado a lado, el Forrester fuera del papel y los dos rótulos distinguidos |
| TC-649 | 7 | el molde en las otras cinco válvulas, con el control de las **dos** que se pararon |

**Los seis caen contra HEAD (`c42d9e3`) por 69 condiciones y NINGUNA por excepción.**


## La tanda PANT-7 (2026-11-03 y 04) — TC-650 a TC-655

Seis casos nuevos, con sus fichas en **`docs/mapa/tests-fichas-650.md`** (archivo propio, porque
`tests-fichas.md` está a menos de 1 KB del techo):

| caso | qué fija |
|---|---|
| **TC-650** | el dibujo del VD con la caja y la letra del esquema valvular 2D, los rótulos cortos de una línea sin pisarse, y el esquema valvular sin cambios |
| **TC-651** | los valores de los bordes de la CIA dentro de su sector, sin la línea de corrido, y la miniatura del diagrama entre los botones del informe |
| **TC-652** | los globos de TRVI y de la pleura abriendo desde su propia pestaña, los dos globos nuevos, el resalte del signo 60/60 y los cuatro tramos del tiempo de aceleración |
| **TC-653** | la franja del tipo de IM del TEER legible en el tema claro, «no determinable» fuera del papel y el rótulo PSAP en el informe |
| **TC-654** | Wilkins en una columna con su conclusión al lado, la orejuela y la aorta del ETE con la conclusión arriba, y la VAB en cuatro columnas, sin perder un solo campo |
| **TC-655** | todos los carteles de los globos usan la letra de la tarjeta, y el de la orejuela ya no se declara la suya |

**Adaptados**, cada uno con el motivo escrito: **TC-557 (B0)** (el registro de miniaturas de seis
a siete), los tres conteos del registro de globos (120 → **122**), **TC-535 (K0/K1/K2)** (los
globos de 44 × 44, 41 → **43**), **TC-502 (C1)** (el mapeo a Referencias, 48 → **50**) y
**TC-62** (el rótulo PSAP, con un control de que el viejo no está).

Los seis caen contra HEAD por **69 condiciones y ninguna por excepción**. **35/35 mutaciones
dirigidas muertas** (`scripts/_mut_pant7.py`); siete sobrevivieron al primer barrido y el análisis
de cada una está en `docs/mapa/pant7-vd-cia-globos.md` § 7.


---

## Las tandas PANT-8 a PANT-14c viven en su propio archivo

Estan en **`docs/mapa/tests-punteros-noviembre.md`**: desde PANT-8 (TC-656) hasta PANT-14c
(TC-713), con sus adaptados y sus repartos de mutaciones.

## Tanda PANT-17 (2026-11-06) — la Evidencia de congénitas, la ventana y el color al tocar

| caso | qué fija | lo matan |
|---|---|---|
| TC-714 | el cuestionario del ductus: 13 preguntas, la dirección pre-responde, el bidireccional no | M01, M02, M03, M20 |
| TC-715 | la coartación: 13 preguntas, cuatro pre-respuestas, la ESC 2024 de aorta rige | M04, M05, M06 |
| TC-716 | la Fallot del VD con su tarjeta de datos, y la tercera columna de la estenosis pulmonar | M07, M08, M09 |
| TC-717 | la bicúspide y la MCH ganan preguntas; las dos secciones vecinas, intactas | M10, M11 |
| TC-718 | la ventana aortopulmonar: seis preguntas y **cero clases** | M12, M13, M14, M15, M16 |
| TC-719 | el color al tocar: toque, vuelta, arrastre, escena nueva y repintado | M17, M18, M19 |

Fichas completas en `docs/mapa/tests-fichas-714.md`. El barrido es
`python3 scripts/_mut_pant17.py <worktree>` — **20 de 20 muertas**, con guarda de md5.

## Tanda PANT-18 (2026-11-06) — la prótesis aórtica, parte 1 de 5

Seis casos nuevos, **TC-723 a TC-728**. Las fichas están en archivo propio,
`docs/mapa/tests-fichas-723.md`, porque `tests-fichas.md` está en 34.237 B.

| caso | qué fija |
|---|---|
| TC-723 | el tiempo de eyección es el campo que ya existía, y el AT/ET gana su fila con los tres tramos y los dos bordes |
| TC-724 | el AT con sus tres tramos, la nota corregida y el bloque de Referencias |
| TC-725 | la tarjeta de severidad resumida, con su «Ver detalle» plegado |
| TC-726 | la TAVI graduada con los cortes absolutos de la quirúrgica |
| TC-727 | el desajuste omitido **sólo** con estenosis significativa |
| TC-728 | el estado visual del botón «Severidad», sin tocar el valor guardado |

**Cuatro casos viejos adaptados**, los cuatro el día que ellos mismos anunciaban: **TC-288** (la
nota del AT), **TC-290** y **TC-291** (la TAVI, que no se graduaba) y **TC-303** (el EN SUMA de la
TAVI, que reutilizaba la línea del cuerpo).

## PANT-19 (2026-11-06) — TC-729 a TC-735

**Fichas en `docs/mapa/tests-fichas-729.md`**, en archivo propio porque `tests-fichas.md` está en
34.237 B.

| caso | qué fija |
|---|---|
| TC-729 | la Tabla A4 contra su transcripción —49 modelos, 211 tamaños, 523 celdas— y las filas de control leídas en imagen |
| TC-730 | las tablas A1, A2 y A3 de TAVI, con el «NA» como `null` y los valve-in-valve aparte |
| TC-731 | el botón «Modelo y tamaño», las sugerencias **por palabra** sin tapar «ver todos», elegir por sugerencia y por la lista, y el Escape con su foco |
| TC-732 | los valores esperados de la tabla, la EOA indexada predicha con los dos cortes de IMC, lo medido con su diferencia en DE y el modo manual sin desvíos inventados |
| TC-733 | TAVI con «All» y valve-in-valve, la limpieza al cambiar de morfología y el recorrido de los cuatro campos nuevos **con sus nombres de columna** |
| TC-734 | la EOA frente a la del modelo como eje **independiente del flujo**, con sus cinco controles negativos |
| TC-735 | la Tabla A5 del catálogo mitral y el control de que la A6 **no** se carga |

**Un caso viejo adaptado**: **TC-135**, que exige que las cuentas de columnas **básicas** y
**totales** crezcan igual (140/441 → **144/445**). Las cuatro columnas nuevas caen como básicas
porque el bloque de la válvula aórtica no está detrás de un checkbox de módulo.

⚠️ **Y TRES más que destapó la corrida completa**, todos de aritmética de columnas o de alcance:
**TC-477 (J)** —437 → 441, el total menos las cuatro de ESE caso—, **TC-479** —439 → 443— y
**TC-483**, cuya condición de la media query medía **el documento entero** y lo que vigila es la
**vista 2D**: hoy extrae el bloque de cada `@media (max-width:900px)` por balance de llaves y
exige que ninguno toque un selector `#v2d`, que es el invariante exacto.

⚠️ **Lo que el barrido de mutaciones enseñó está en `docs/mapa/pant19-catalogo-protesis.md` § 7**:
doce sobrevivientes en **cinco** clases distintas —cinco huecos reales, dos frenos que tapaban a la
mutación, dos pares de guardas redundantes, una mal dirigida y dos mal escritas— de las que
salieron **nueve** condiciones nuevas.

---

## PANT-21 (2026-11-07) — la Evidencia de prótesis, una sección por válvula

| caso | qué fija |
|---|---|
| **TC-742** | la sección **aórtica**: la compuerta con la nativa, el orden, y la recomendación con su clase, su nivel y su folio |
| **TC-743** | el **bloque de causas** de la aórtica: su compuerta «posible» y las **tres escenas de borde** de la Figura 13 |
| **TC-744** | la **mitral**: las **doce** filas de la Tabla 17 que ya estaban —el guardián de la parada del 4a— y su orden propio |
| **TC-745** | la **tricúspide**: el valve-in-valve **transvenoso** y que la Tabla 19 da cortes y no causas |
| **TC-746** | la **pulmonar**: rige la ACC/AHA 2025 de congénitas y la **ESC/EACTS 2025 NO se usa** |
| **TC-747** | el **emisor compartido**: `ordenProt` no toca a ninguna otra sección y la Evidencia **no llega al papel** |

**Las fichas de los seis** → `docs/mapa/tests-fichas-742.md` (archivo propio: `tests-fichas.md`
está a menos de 1 KB del techo).

**Tres casos viejos adaptados**: **TC-291** —**INVERTIDO**, y es el día que ese caso anunciaba:
afirmaba que con una prótesis `_indEA` publica la tarjeta «esta sección no aplica», y hoy exige que
la nativa se calle **y** que la de prótesis exista con sus preguntas, así que puede fallar por los
dos lados—; **TC-322**, con tres escenarios nuevos, que se pone rojo tanto al borrar una sección
**como al agregarla**; y **TC-533**, el conteo de `IND_SECS`, 42 → **45**.

### PANT-21 · dos lecciones del barrido de mutaciones

**Una condición que mira el OBJETO no prueba lo que el EMISOR hace con él.** Las condiciones del
orden miraban el objeto que devuelve la sección, así que romper lo que `ordenProt` *hace* —que
implique el molde de preguntas, y que «Con lo contestado» baje de la grilla— pasaba en verde.
Nacieron `(F2b)` y `(F2c)` de TC-747, que miden el **HTML emitido**.

**Una cita exigida sobre el JOIN de varias filas no puede fallar por una.** `(B6)` de TC-743 pedía
la hoja y el folio sobre el texto de las **cinco** causas pegado, y `(E4)` de TC-746 sobre el de las
**once** preguntas: quitárselos a **una** seguía encontrándolos en las otras. Las dos pasaron a
exigirlos **fila por fila**, y de ahí salió `(E4b)`.

## PANT-20 (2026-11-06) — el catálogo en la mitral, la tricúspide y la pulmonar

| caso | qué fija |
|---|---|
| **TC-736** | la Tabla A7 contra su transcripción (12 / 26 / 82) y sus **cuatro formas de celda** |
| **TC-737** | las Tablas A9 (8 / 28 / 190 / 6) y A8, y que la **A8 queda sin consumidor** |
| **TC-738** | el componente en la **mitral**, con la fila propia y **TC-522 intacto**; los dos cortes de IMC |
| **TC-739** | la **tricúspide**: la decisión 6 (sólo el número) y la conversión de m/s a cm/s |
| **TC-740** | la **pulmonar**: lo impreso —límites y medianas— y la marca `uno` |
| **TC-741** | los **doce campos**, el Excel de **457** y que el **papel no cambia** |

Las fichas, con sus denominadores y sus controles negativos, en
`docs/mapa/tests-fichas-736.md`.

**Casos viejos adaptados:** los **139** conteos de `=== 445` del Excel pasan a `457`, más
`esperadas.length === 441` → `453` en el caso del G2, cada uno con su comentario de adaptación.

⚠️ **Y UN DEFECTO DEL PROPIO SCRIPT DE ADAPTACIÓN, QUE VALE PARA LA PRÓXIMA**: el marcador con el
que protegí `TC-445` de la sustitución **contenía «445»**, así que el propio regex lo pisó y dejó
el caso llamándose `@@TC457@@` — o sea **TC-445 desapareció de la suite** sin un solo error. Lo
cazó contar los casos distintos contra la línea base (755 en vez de 756). **Un marcador de
protección no puede contener lo que se va a reemplazar.**

### PANT-20 · dos lecciones más del barrido de mutaciones

**Una mutación sobre una línea COMPARTIDA se declara al caso que la cubre, no al de la tanda.**
La mutación 21 de PANT-20 rompía la búsqueda por palabra del componente «Modelo y tamaño», que es
**uno solo** para las cuatro posiciones: la condición que la mata es **(B3b) de TC-731**, escrita
por PANT-19 para la aórtica —«ifecta» cae en MEDIO de «Trifecta», y es lo único que separa
«buscar por palabra» de «buscar en cualquier posición»—. Declarada al caso de la tanda nueva
sobrevivía **sobre cobertura que ya existía**, que es indistinguible de un hueco.

**Una mutación que cambia un RÓTULO no borra una fila.** La 40 reemplazaba el texto de la fila de
la ficha pulmonar y la fila seguía ahí, así que la condición que cuenta filas con celda de dato no
podía fallar. Para probar «pierde una fila» hay que borrar el `<tr>` entero.

⚠️ **Y los comentarios del arnés van con `#`:** escribir `/* */` en un archivo de Python lo deja
sin parsear, con el error apuntando al primer carácter no ASCII del comentario.

---

## PANT-22 (2026-11-07) — el interruptor de la Evidencia y los textos comparativos

| caso | qué fija |
|---|---|
| **TC-748** | `_indSectorIncluido` con una clave, con dos y con `null`; las **TRECE** secciones con `av` y su clave; `wilk` y `teer` sin sección |
| **TC-749** | el caso del médico: sin sector incluido, **cero** secciones de sector avanzado; con uno incluido, **sólo** la suya; las no avanzadas intactas |
| **TC-750** | el dato **sigue sincronizado** aunque su Evidencia no exista, por el gesto y por la siembra muda, y después de armar el panel |
| **TC-751** | el censo de textos, con su **control positivo** de seis cadenas viejas y cada número y folio contados uno por uno |
| **TC-752** | el papel sin nada del panel, Excel en **457** y el censo de campos quieto |

**Adaptados, con el motivo escrito:** TC-533 (los conteos de `IND_SECS`, con **(D3) invertida**),
TC-534, TC-535, TC-537 —**(D6b)** con la guarda de idempotencia, más fuerte que antes—, TC-544,
TC-510, TC-349, TC-610 (**(D2) invertida**) y TC-669 a TC-673 (filtro en **(D0)** y **(D2)
invertida** en los cinco).

⚠️ **`__t.avInc` ES IDEMPOTENTE PORQUE `amiloIntegrar` ES UN TOGGLE**: llamarlo sobre un sector ya
integrado lo **retira**, y retirar no borra el textarea, así que el síntoma no se parece a la causa.
⚠️ **NINGUNA EXPRESIÓN REGULAR EN LOS CASOS NUEVOS**: `/\s+/` llega como `/s+/` y se come las «s».

Fichas en `docs/mapa/tests-fichas-748.md`.

⚠️ **Y CINCO MÁS que la corrida completa destapó, no el censo**: **TC-520**, **TC-553** y **TC-554**
medían una sección de Evidencia de un sector avanzado **sin integrar el sector** —ganan su `avInc` y
una condición de denominador—, y **TC-532 (C8)(D8)** y **TC-545 (C6)** quedan **INVERTIDAS**, porque
exigían las dos frases que el commit 5 reescribió. **Los cinco pasan 5/5 contra `e727fe2`.**


---

## PANT-26 (2026-11-09) — TC-769 a TC-777

Nueve casos, en **`docs/mapa/tests-fichas-769.md`** (archivo propio: `tests-fichas.md` estaba en
34,2 KB, medido antes de escribir). Cinco adaptados, con su motivo: **TC-303** y **TC-757** por la
frase nueva, **TC-474** por la mitral sin conclusión por fila, **TC-726** por la atribución que
sale de la salvedad de la TAVI y **TC-734** por el área de la TAVI, que ese caso declaraba que
**no** se evaluaba. Los catorce caen contra el árbol anterior por **47 condiciones y cero
excepciones**.

⚠️ **Dos lecciones de instrumentación.** (1) El **contrato del retorno** de un caso es
`{ extra: F }` y no el array pelado: los nueve salieron rojos de entrada con «el caso no declara
NINGUNA condición», con todas sus condiciones en verde. (2) El `--solo` del arnés de mutaciones
filtra por **índice**, así que retirar una mutación corre los índices de todas las de abajo: una
rerida de «07,18,25,29,30» midió en realidad la 07, la 19, la 26, la 30 y la 31.

---

## PANT-29 (2026-11-10)

**TC-778 a TC-783 REESCRITOS y TC-784 a TC-786 nuevos**; la suite pasa de **798 a 801**. Los seis
de PANT-28 afirmaban las tres fichas grandes que esta tanda quitó, así que se reescribieron sobre
lo que las reemplaza y **conservan su número**. Adaptados: TC-502, TC-509, TC-761, TC-763,
TC-563 y TC-490 —los tres últimos **invertidos**—.

⚠️ **Este archivo cruzó los 35 KB al recibir este bloque**, así que el bloque salió a archivo
propio en vez de engordarlo más: **`docs/mapa/tests-punteros-pant29.md`**, con los nueve casos,
las tres trampas que la tanda pagó y el defecto que TC-783 destapó en la app. Las fichas están en
`docs/mapa/pant29-coronarias-3d.md` § 5.
