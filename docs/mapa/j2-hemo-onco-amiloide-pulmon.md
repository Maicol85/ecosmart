<!-- mapa armado sobre 5a8f04c, 2026-10-24; los números de línea no se guardan a propósito -->

# Mapa — la tanda «J2»: hemodinámica, cardio-oncología, amiloidosis y eco pulmonar

> **Archivo propio y no una sección más.** Medido con `wc -c` **antes** de escribir:
> `congenitas-otros.md` 31,7 KB, `panel-evidencia.md` 31,0 KB, `referencias-subpestanas.md`
> 23,9 KB y `tests.md` 29,7 KB. Una sección de este tamaño cruzaba el techo de ~35 KB en los
> dos primeros, así que lo que entró allá es **un puntero** y el relato vive acá.

Siete commits de código y uno de cobertura y documentación. **Ningún corte, operador ni banda de
severidad cambió** fuera de lo que la orden autoriza, y lo que no se tocó está declarado.

| # | Commit | Qué trae |
|---|---|---|
| 1 | `071c816` | E1 — los tres globos ⓘ de hemodinámica y las dos ramas de RVS baja |
| 2 | `ca67b14` | E2 — la Evidencia de hemodinámica |
| 3 | `e117e82` | E3 — cardio-oncología: el seguimiento tras radioterapia y el plazo sin fuente |
| 4 | `2f1e721` | E4 — la Evidencia de cardio-oncología |
| 5 | `4a29caa` | E5 — amiloidosis: salen «INTERMEDIO» y «BAJO» |
| 6 | `56046fe` | E6 — la Evidencia de amiloidosis, con su cuestionario |
| 7 | `5a8f04c` | E7 — la ficha de eco pulmonar en Referencias |
| 8 | — | TC-533, el arnés de mutaciones y la documentación |

**El orden de revertido seguro es el inverso del de aplicación.** Los commits 2, 4 y 6 cuelgan de
sus entradas de `IND_REFS`, que viven en el mismo commit; los 1, 3, 5 y 7 son independientes entre
sí. **TC-533 cuelga de los siete**: revertir uno sin revertir el caso deja el suite en rojo con un
diagnóstico que apunta a la app y no al revertido.

---

## 1 · Hemodinámica — E1

### Los tres globos ⓘ

Mecanismo: el de siempre, `VINFO` + `vInfoClic` + `#vinfo-card`. Tres entradas nuevas:
`hemo-ic`, `hemo-rvs` y `hemo-forr`, con su botón en el `.calc-lbl` de su fila.

| Globo | Qué publica | Fuentes |
|---|---|---|
| `hemo-ic` | el «bajo con 2,2 o menos», el rango normal y la definición original | SAC 2024 Tabla 1 folio 2 · ESC/ERS 2022 folio 30 · Braunwald Tabla 52-9 folio 1125 |
| `hemo-rvs` | las DOS referencias, porque los libros no dan un rango único | Grossman Tomo I Tabla 11.2 folio 260 · Braunwald Tabla 19-3 folio 375 |
| `hemo-forr` | el alcance y los dos bordes no definidos | Braunwald Tabla 52-9 y texto del folio 1125 |

⚠️ **EL 2,2 EXACTO CAE DE LADOS DISTINTOS, Y SE DECLARA EN VEZ DE CORREGIRSE.** La app marca
hipoperfusión con `ic <= 2.2`; la clasificación original dice «por debajo de 2,2». Mover un corte
es decisión de Maicol, así que el globo lo dice y `_icBanda` no se toca. Lo mismo del otro lado: la
congestión aparece cuando la presión capilar **supera** 18, así que el 18 exacto tampoco está
definido en ninguno de los dos.

⚠️ **LA MEDIA ± DESVIACIÓN DE GROSSMAN NO ES UN RANGO DE REFERENCIA**, y el globo lo escribe: el
pie de esa tabla declara que sale de **37 sujetos** sin cardiopatía demostrada, cateterizados entre
1975 y 1978. Por eso la RVS publica el número **sin banda y sin color**, que es lo que dejó el R2.

### Las dos ramas de RVS baja

```
ic < 2.2 && rvs > 1200   -> «Shock cardiogénico — GC bajo + RVS elevada»        (sin tocar)
rvs < 800 && ic >= 2.2   -> «Perfil distributivo/vasodilatado…» + chip gris     (QUEDA, declarado)
ic < 2.2 && rvs < 800    -> los DOS NÚMEROS en gris, sin etiqueta               (CAMBIÓ)
else                     -> «Perfil hemodinámico normal»                        (sin tocar)
```

⚠️ **LA TERCERA RAMA NO SE PUEDE BORRAR.** Sin ella un índice cardíaco bajo con RVS baja cae en el
`else` final y la app dice **«Perfil hemodinámico normal»** sobre un paciente hipoperfundido. Lo
que sale es la ETIQUETA y el «considerar», no la rama.

⚠️ **EL CHIP VA CON UN SEPARADOR DELANTE** (`'· Criterio de EcoSmart'`): el informe, la hoja del
PDF y el PPT leen el `textContent` del span, y sin él las dos etiquetas se pegan en una palabra.

⚠️ **`join(' ')` Y NO UNA SUMA.** `ceibo-xss-innerhtml-concat` marca todo `innerHTML =` con una
concatenación; con el `+` esta línea subía la línea base de Semgrep en uno. Los dos operandos
salen de `badge`, que escapa su texto, así que sería un falso positivo — pero una línea base que
sube sin motivo termina tapando el hallazgo de verdad.

⚠️ **`_rvsBanda` NO SE TOCA**, y es lo que protege al posoperatorio: de ella cuelgan la vasoplejia
del POP, el SVRI del PiCCO y la cápsula del Swan.

---

## 2 · Las TRES Evidencias nuevas — E2, E4 y E6

`IND_SECS` pasa de **27 a 30** secciones. Ninguno de los tres títulos es prefijo de otro ni de los
veintisiete anteriores (verificado; TC-533 (L5) lo fija como invariante sobre la lista entera).

| Sección | Compuerta | Qué publica con clase y nivel |
|---|---|---|
| `_indHemo` — «Perfil hemodinámico…» | algún valor calculado en la cápsula | **nada**: la ASE 2025 no usa esa escala |
| `_indConco` — «Cardiotoxicidad…» | algún dato de entrada del módulo | **dos**, las dos IIa · C |
| `_indAmil` — «Amiloidosis cardíaca…» | algo cargado del módulo de amiloidosis | **dos**: I · B y IIa · C |

⚠️ **NINGUNA CLASE SE INVENTA, Y CADA SECCIÓN DICE POR QUÉ NO LA TIENE.** Tres motivos distintos:
la ASE 2025 no publica esa escala; Grossman y Braunwald son libros de texto; y el «2,2 o menos»
del consenso argentino vive en una columna COMPARATIVA de su Tabla 1, no en una recomendación
propia de ese consenso. Las Tablas 3, 4 y 5 de Lyon y los cuerpos de las Figuras 10 y 11 son
DEFINICIONES y ESQUEMAS: lo único graduado de la Figura 10 es lo que dice su propio pie.

⚠️ **EL ÍNDICE CARDÍACO NO ESTÁ EN LA TABLA DEL FOLIO 162** y la Evidencia de hemodinámica lo
escribe: esa tabla publica el gasto cardíaco, la resistencia pulmonar y la presión capilar.
Indexar por superficie corporal es la **definición** del indexado, no una fórmula publicada, así
que esa línea va **sin corchete**.

⚠️ **LA GUÍA ESCRIBE EL GASTO CARDÍACO SOBRE EL TRACTO DE SALIDA DERECHO** y esta aplicación lo
calcula sobre el izquierdo, que es donde tiene el diámetro y la integral cargados. Declarado en la
fila y en la nota del bloque.

### El cuestionario de amiloidosis — doble puerta y un solo dueño

Si el médico ya cargó el centellograma y las proteínas monoclonales en el módulo del algoritmo
(`gradoGamma` / `protMonoc`), la sección los **lee**; si no, los **pregunta** con `_indFilaCtrl`.
Lo contestado en el panel no toca el módulo, no se guarda con el estudio y no viaja al informe ni
al Excel. Los cuatro escenarios del documento de posición salen de cruzar esas dos respuestas.

---

## 3 · Cardio-oncología — E3

Dos cambios de contenido en «Referencia rápida — criterios ESC 2022», los **tres** lugares donde
vivía el seguimiento tras radioterapia, y una cosa declarada y no tocada.

| Qué | Antes | Hoy | Fuente |
|---|---|---|---|
| seguimiento tras radioterapia | «Eco a los 5 años post-RT. Eco a los 10 años post-RT» | «desde los 5 años y luego cada 5 años», con su clase y su nivel | Recomendaciones-tabla 41, folio 4314, **IIa · C** |
| plazo tras caída de FEVI con antraciclinas | «eco en 2-4 sem y graduar la CTRCD…» | «graduar la CTRCD…», sin fecha | no figura en la guía |

⚠️ **«CONSIDERAR BIOPSIA SI PERSISTE» Y «CONTROL EN 4 SEM» YA NO ESTABAN**: los retiró el R2-E6
con la columna «Acción» entera. Medido en HEAD **antes** de tocar nada. La recomendación de biopsia
entró a la Evidencia en el commit 4, donde sí tiene clase y nivel.

⚠️ **«REEVALUAR EN 3-6 SEM» DE LA FILA ANTI-HER2 NO SE TOCÓ.** La orden nombra el plazo de 2-4
semanas y el de 4 semanas, no éste; tampoco figura en el pie de la Figura 11 (folio 4260). Mover un
plazo clínico que la orden no nombra sería tocar contenido clínico sin permiso. Queda en
`docs/PENDIENTES.md` → **J2-a**.

---

## 4 · Amiloidosis — E5

### La tabla de escenas, puntaje por puntaje

Con hipertrofia de 12 mm o más y sin llegar a dos de los tres criterios cualitativos:

| pts | antes | hoy |
|---|---|---|
| 0 | «Completá los parámetros» | **igual** |
| 1 | 🟢 Score BAJO (1/10) con HVI | 🔵 Puntaje 1/10: no alcanza el corte de 8 (Se 98 %, Sp 19 % con ≥1) |
| 2 | 🟢 Score BAJO (2/10) con HVI | … (Se 96 %, Sp 35 % con ≥2) |
| 3 | 🟢 Score BAJO (3/10) con HVI | … (Se 94 %, Sp 45 % con ≥3) |
| 4 | 🟢 Score BAJO (4/10) con HVI | … (Se 89 %, Sp 61 % con ≥4) |
| 5 | 🟡 Score INTERMEDIO (5/10) | … (Se 82 %, Sp 72 % con ≥5) |
| 6 | 🟡 Score INTERMEDIO (6/10) | … (Se 78 %, Sp 79 % con ≥6) |
| 7 | 🟡 Score INTERMEDIO (7/10) | … (Se 67 %, Sp 89 % con ≥7) |
| 8 | 🟣 Score ALTO (8/10) — Amiloidosis muy sugestiva | **igual** |
| 9 | 🟣 Score ALTO (9/10) | **igual** |
| 10 | 🟣 Score ALTO (10/10) | **igual** |

Los dos **controles negativos** tampoco se mueven: los mismos puntajes **sin** hipertrofia siguen
diciendo «Sin HVI ≥12mm», y la otra vía del criterio por eco —dos de los tres cualitativos con
score bajo— sigue diciendo «Criterio por eco ALCANZADO».

⚠️ **LA RAMA NUEVA ABSORBE LAS DOS VIEJAS, y el orden de los `else if` es lo que lo garantiza.**
Borrar una y dejar la otra habría mandado los puntajes de 1 a 4 al `else` final, que afirma
«Sin HVI ≥12mm» sobre un paciente que SÍ la tiene.

⚠️ **EL PUNTAJE 0 NO LLEGA A ESA RAMA**: lo atrapa el primer `if`, que no se tocó. Los cinco campos
de puntos son `hidden` que nacen en `'0'`, así que la aplicación **no puede distinguir** «los cinco
criterios ausentes» de «nadie cargó nada». Queda en PENDIENTES → **J2-b**.

### `AMILO_IWT_BOLDRINI` — la constante

Los once cortes de la **Tabla 4, página 30** del manuscrito aceptado, **transcritos y no escritos
de memoria**. Va **antes** de `calcETT`, que es quien la nombra.

⚠️ **ES EL SCORE «IWT» Y NO EL «AL».** Son dos scores distintos en la misma tabla, con cohortes
distintas: el IWT es el de la cohorte de hipertrofia inexplicada (n = 923, AUC 0,87) y suma los
mismos cinco parámetros que esta aplicación. El AL tiene cuatro parámetros y otra cohorte.
⚠️ Los valores son de «≥ N» salvo la última fila, que la tabla escribe «= 10». Acá sólo se usan
los cortes de 1 a 7. El intervalo de confianza de la fila «≥3» viene con una **errata** en el
original («92-6»): se guardan los puntos estimados.

### Lo que NO se movió

- **EL LABORATORIO TIENE SU PROPIA BANDA**, con otros cortes (`<6` / `6-7` / `≥8`) y otro dueño
  (`_labAmilBanda`), que alimenta el filtro de cohorte `coh-amil`, el gráfico del dashboard y el
  PPT estadístico. Es un clasificador de COHORTE, no la etiqueta de la pantalla. PENDIENTES → **J2-c**.
- **ESTUDIOS GUARDADOS: NO HAY NADA QUE MAPEAR.** La etiqueta nunca se persistió —se calcula de
  los campos—, el Excel guarda «Score amiloidosis ETT» como NÚMERO, las 440 columnas salen
  idénticas clave por clave y el censo de 1038 campos da el mismo hash.

---

## 5 · Eco pulmonar — E7

La pantalla (las cuatro columnas del AJ6) y el informe (las tres líneas del AJ2) **no se tocan**.
Lo que entra es la ficha `ref-pulmon`, con cada criterio, su enunciado y su hoja.

⚠️ **DOS PUNTEROS DE LA ORDEN ESTABAN CORRIDOS:**
1. El síndrome intersticial difuso es el pie de la **Figura 3, panel C** (hoja 8), no de la
   Figura 4: la Figura 4C, hoja 9, es la semicuantificación del **neumotórax** por la posición del
   punto pulmón. El comentario de `pulAvPatron` decía «Figura 4C … hoja 8» desde el R2 —la hoja
   estaba bien y el número no— y hoy dice Figura 3C. **Ningún corte se movió.**
2. El enunciado que dice que el punto pulmón **confirma** el neumotórax es el **D2_2.1**; el
   **D2_2.2** es la salvedad del neumotórax muy grande. Los dos están en la hoja 12 y los dos
   entran a la ficha, cada uno con su número.

⚠️ **NO SE CREÓ UNA EVIDENCIA, Y LA FICHA DICE POR QUÉ**: este consenso no publica clase ni nivel.
Sus enunciados llevan **grado de acuerdo entre panelistas**, no la escala I / IIa / IIb / III.
Una sección de Evidencia sin enunciados graduados sería una sección vacía, o peor, una con clases
inventadas.

⚠️ **EL PULSO PULMONAR NO SE AGREGÓ**: la orden lo excluye expresamente.

⚠️ **`REF_SUBTAB` SE ACTUALIZÓ EN EL MISMO COMMIT QUE LA FICHA.** Es el paso que la tanda J se
olvidó con `constriccion`: la ficha existía, se abría y el buscador la indexaba, pero `refSubInit`
no la reubicaba y el médico que navegara por las solapas no la encontraba nunca. Hoy el censo pasa
de 23 a 24 entradas repartidas, **ninguna sin panel** — TC-533 (H2) lo fija.

Y **`pul-balik` deja de ser una de las cinco tarjetas sin botón**: entra a `VINFO_REF` y su globo
gana el «Ver referencia →». Siguen sin botón cuatro: `tarj-insuf-pulmonar`,
`tarj-esten-tricuspide`, `tarj-esten-pulmonar` y `et-avt-cont`.

---

## 6 · Las CUATRO trampas de instrumentación de esta tanda

Las cuatro con el mismo síntoma: **un verde que no medía nada, o un rojo que nacía en la sonda**.

1. **`\s` dentro de un template literal se come la barra** y el regex pasa a borrar las **eses**:
   el título volvía «Perfil hemodinámico — pre ione y re i tencia». Los valores salían bien —se
   leen de atributos— así que el veredicto no cambiaba, pero una comparación por PREFIJO de título
   habría fallado en silencio. Va `/\\s+/g`.
2. **`style.display = ''` BORRA el inline** y devuelve el elemento a lo que diga su CLASE — y las
   subpestañas de Referencias se ocultan por clase. La ficha quedaba oculta y el barrido medía
   **cero nodos**: cero recortes sobre cero elementos. Va `'block'`.
3. **`calentar()` PONE EN CERO el score de amiloidosis.** Corre todas las `calc*`, entre ellas las
   calculadoras del propio score, que con los campos de medición vacíos llaman a `amCalcSinDato`.
   La captura mostraba «Completá los parámetros» sobre una escena de 6 puntos.
4. **`indicAbrir()` BORRA las respuestas del panel** —lo hace al abrir Y al cerrar, por diseño—,
   así que leer la sección con `indicAbrir()` DESPUÉS de contestar devolvía la sección sin
   contestar; y abrir antes de CADA respuesta dejaba viva sólo la ÚLTIMA. El panel se abre **una
   vez por escena**.

Y una quinta, en el caso de la suite: **el barrido del AJ3 está debounced a 220 ms**. Leer el
textarea justo después de tipear devuelve el texto viejo y el caso informa «no se actualiza solo»
sobre un mecanismo sano.

Y una sexta, de lectura: **el bloque de hemodinámica NO va al cuerpo del informe**, va a la HOJA
del PDF. Leer `#informe_texto` buscándolo da cero caracteres.

---

## 7 · Cobertura

**TC-533**, con 63 condiciones y teclas reales. Sabe fallar por los dos caminos:

- **Contra el HEAD de la tanda** (`74665ca`, en un worktree aparte): **43 condiciones en rojo** y
  **ninguna por excepción**.
- **Por mutación dirigida**: `scripts/_mut_j2.py`, con 17 mutaciones, una por cada cosa que la
  tanda cambió. El arnés **exige la línea `RESULTADO`** en la salida: sin ella el veredicto es
  `NO CORRIÓ`, no «sobrevivió». Nunca muta el archivo vivo y verifica el `md5` al restaurar.

---

## ➜ El POSOPERATORIO es otro módulo y tiene su propio mapa

La tanda «G» (2026-10-24) tocó la subpestaña **«POP Cirugía Cardíaca»** y **no** la cápsula
«Perfil hemodinámico» ni el Forrester de esta sección. Lo único compartido son las dos bandas
—`_icBanda` y `_rvsBanda`—, que el posoperatorio **pregunta** y no copia. Ver
**`docs/mapa/g-posoperatorio.md`**.

---

## ⚠️ La tanda AJ7 cerró J2-a y J2-f (24/10/2026)

- **«Reevaluar en 3-6 sem»** salió de las **dos** copias de la fila anti-HER2, y **nada** se
  escribió en su lugar: los plazos de la Figura 11 son de **vigilancia por riesgo** y contestan
  otra pregunta.
- El **globo ⓘ del score de amiloidosis** lleva `.vinfo-btn-44`, el piso táctil sin la media
  query, junto con el del bloque de pleura del POP. `check_mobile.js` vuelve a **63 / 72 con 17
  ALTA**.

**`docs/mapa/aj7-correcciones.md` § 5.**

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).

## ⚠️ La tanda B tocó la RVS de este módulo, y lo que hizo fue NO tocarla (2026-10-27)

`calcHemo` entró al barrido de espejos **sólo para repintar**: lo que lee no se movió. Su RVS
sigue saliendo de `v('hemo_pam')` a secas y por lo tanto **sigue ignorando la PAM medida por
catéter**, que es lo único que faltaba para que la app tuviera un solo dueño de la PAM. Se paró
porque el texto de esta cápsula viaja a la hoja de ETT Avanzado del PDF y al PPT, y el cambio
movería un papel firmado en un estudio con una sola fuente. `docs/PENDIENTES.md` → **B-a**.

---

## ⚠️ La tanda D rehizo la calculadora de riesgo CV y el score de amiloidosis (2026-10-27)

Lo de esta sección sobre **cardio-oncología** y sobre el **score de amiloidosis** sigue siendo
cierto como historia, pero **ya no describe cómo clasifica la app**:

- la clasificación de **antraciclinas y anti-HER2** sale hoy de la **Tabla 4 de la guía** tal
  cual —matriz factor × columna—, sin piso por fármaco y con la derivación por categoría;
- el **score de amiloidosis se marca solo** desde los datos de las otras pestañas y se
  sincroniza en los dos sentidos;
- la tabla de escenas por puntaje de la sección 4 **no cambió** en sus textos, pero el puntaje
  que la alimenta ahora se puebla solo.

**Todo eso vive en `docs/mapa/d-cardioonco-amiloidosis.md`.** La constante
`AMILO_IWT_BOLDRINI` y su advertencia sobre el score «IWT» frente al «AL» siguen siendo las de
acá, y la tanda D las verificó fila por fila contra la Tabla 4 **sin cambiar ninguna**.

---

## ⇢ La tanda C1 (2026-10-28) tocó tres cosas de esta cápsula

1. **El Forrester nombra el dato que falta.** Decía «Requiere IC + PCP estimada» en los tres
   casos; hoy sale del dueño único `forrFaltaTxt`, que comparte con la fila del panel.
2. **La RVS lee `pamEfectiva()`** y declara el origen de sus dos insumos.
3. **Un diagrama de los cuatro cuadrantes**, SOLO de pantalla, debajo de la fila del perfil.

⚠️ **Los dos globos ⓘ de esta sección declaran bordes que la app NO usa**, y esa tanda los
**reportó sin tocarlos**: el corte de congestión de la aplicación es **15**, no 18, y un índice
cardíaco de 2,2 exactos **no** es hipoperfusión en el Forrester. Ver `PENDIENTES.md` → C1-a y
C1-b.

**Todo en `docs/mapa/c1-hemodinamica.md` §§ 3, 4 y 6.**
