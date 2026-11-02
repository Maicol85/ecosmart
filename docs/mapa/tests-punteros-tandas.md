# Mapa — los casos de prueba, tanda por tanda

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


## ⚠️ El caso de la tanda J (2026-10-24)

**TC-532** cubre el pericardio y el taponamiento, la constricción y VEXUS de esa tanda. Su ficha
—qué afirma cada bloque, los cuatro denominadores, los cuatro controles negativos y las tres
trampas que el caso ya pagó— está en **`docs/mapa/tests-fichas-532.md`**, en archivo propio
porque `tests-fichas.md` está a 800 bytes del techo de 35 KB.
Las mutaciones dirigidas que lo hacen fallar viven en **`scripts/_mut_j.py`**.

---

## TC-533 — la tanda «J2» (2026-10-24)

**63 condiciones.** Cubre los siete commits: los tres globos ⓘ de hemodinámica y los bordes del
índice cardíaco; la RVS como número pelado; las dos ramas de RVS baja; las tres Evidencias nuevas;
cardio-oncología sin los plazos sin fuente y con el seguimiento tras radioterapia alineado; el
score de amiloidosis de 0 a 10; el cuestionario de los cuatro escenarios; la ficha de eco pulmonar;
los bloques integrados; guardar y «Nuevo estudio»; y los controles.

**Sabe fallar por los dos caminos:**
- contra el HEAD de la tanda (`74665ca`, worktree aparte): **43 condiciones en rojo**, **ninguna
  por excepción**;
- por mutación dirigida: `scripts/_mut_j2.py`, **17 mutaciones**, una por cada cosa que la tanda
  cambió.

El arnés **exige la línea `RESULTADO`**: sin ella el veredicto es `NO CORRIÓ`, no «sobrevivió».
Nunca muta el archivo vivo y verifica el `md5` al restaurar.

⚠️ **LO QUE TC-533 NO MIDE, Y ESTÁ DECLARADO EN UNA CONDICIÓN PROPIA**: la geometría de las media
queries. Su ventana abre por debajo de 1100 px y el arnés corre por encima. Lo cubren
`scripts/check_mobile.js` y las capturas de `scripts/_probe_hcae.mjs`. Ver PENDIENTES → **J2-e**.

El relato completo vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`**.

---

## ➜ TC-534 — la tanda «G» (posoperatorio, 2026-10-24)

63 condiciones en doce grupos. **Sabe fallar por los dos caminos**: contra el HEAD de la tanda,
**63 en rojo y ninguna por excepción**; por mutación dirigida, **25/25 muertas**
(`scripts/_mut_g.py`). Siete casos adaptados: TC-168, TC-169, TC-253, TC-322, TC-502, TC-507,
TC-509 y TC-533. La ficha del caso y sus ocho trampas de instrumentación:
**`docs/mapa/g-posoperatorio.md`** §7 y §8.

---

## ⚠️ TC-535 — la tanda AJ7 (24/10/2026)

Su ficha está en **`docs/mapa/tests-fichas-535.md`**, en archivo propio porque `tests-fichas.md`
estaba en 34,2 KB. El arnés de mutaciones es `scripts/_mut_aj7.py` y la sonda A/B de solo
lectura, `scripts/_probe_aj7.mjs`.

⚠️ **Y ESTA TANDA DESTAPÓ QUE EL DENOMINADOR DE LA SUITE NO ERA 534.** Son **549**: `TC-1` a
`TC-534` —sin huecos ni duplicados— **más quince `TC-GR-01` a `TC-GR-15`**. Los lotes de la
tanda G enumeraron sólo los numerados, así que **quince casos no se ejecutaron** y el total se
leyó como completo. Antes de armar lotes, contar:

```bash
grep -oE "^caso\('[^']+'" scripts/test_clinico.mjs | sort -u | wc -l
```

→ `PENDIENTES.md` **AJ7-f**.

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).

## ⚠️ TC-538, de la tanda B (2026-10-27)

Los veintiséis espejos que siguen a su fuente sin tocar otro campo, S1 y S2, las siete
combinaciones de la PAM y cuatro controles negativos. **Ficha propia en
`docs/mapa/tests-fichas-538.md`** —`tests-fichas.md` ya estaba en 34,2 KB, medido antes—, con
las tres trampas que costó escribirlo y la tabla de las dieciséis mutaciones
(`scripts/_mut_b.py`).

⚠️ **Y LA TANDA B ENCONTRÓ UN DEFECTO EN EL ARNÉS DE A/B QUE VIENE DESDE `_probe_r2ab.mjs`.**
El montaje de escenas hacía `RECALC_MODULOS.forEach(...)`, y `RECALC_MODULOS` es una **función**:
tiraba `TypeError`, el `catch` lo tragaba y **el embudo de restauración nunca corría**. O sea que
varias tandas midieron su A/B sin pasar por el camino que reponen `editarInforme`, el QR, el
autoguardado y las dos reimpresiones. Corregido en `scripts/_probe_bab.mjs` a
`_recalcModulos('ab')`; **`_probe_aab.mjs` y `_probe_r2ab.mjs` siguen con el defecto**, y la
próxima tanda que los use conviene que lo arregle ahí también.

---

## TC-539 — la tanda E (27/10/2026)

Ficha completa en **`docs/mapa/tests-fichas-539.md`** (archivo propio: `tests-fichas.md` ya estaba
en 34,2 KB). Cuatro bloques —Carpentier, tricúspide, strain del VD y orejuela— con 8 denominadores
declarados. **13/13 mutaciones dirigidas muertas** (`scripts/_mut_e.py`), y cae contra HEAD en
**19** condiciones. Dos de sus condiciones (A11 y A12) **nacieron de mutaciones que
sobrevivieron**. Lo que el caso NO mide y se declara: la geometría de dos avisos, que vive en
`scripts/_probe_te.mjs` → `docs/PENDIENTES.md` **E-b**.

---

## ⚠️ TC-540 — la tanda D (2026-10-27)

Ficha en **`docs/mapa/tests-fichas-540.md`** (archivo propio: `tests-fichas.md` ya estaba en
34,2 KB). 31 condiciones, tres denominadores declarados y cinco controles negativos; cae en las
31 contra HEAD. Sus cinco trampas de arnés —los acentos graves del cuerpo, `VINFO` fuera de
`window`, el botón del globo midiendo 0 × 0, el disparador fabricado que tapaba el defecto de
limpieza, y la marca `hfaicos_manual` que sobrevive a `limpiar()`— están en esa ficha.

## ⚠️ TC-545 — la tanda C2 (2026-10-28)

Ficha en **`docs/mapa/tests-fichas-545.md`** (archivo propio: `tests-fichas.md` está en 34,2 KB).

Cinco bloques con su denominador cada uno, y **dos decisiones de método** que conviene leer antes
de escribir un caso que cense texto de pantalla: `document.body.textContent` **trae el código
fuente de los diecisiete `<script>` inline**, y un chequeo sobre un `toast` que el caso no dispara
no puede fallar nunca. Dieciséis mutaciones dirigidas, 16/16 muertas; **M12 sobrevivió al primer
barrido** y era un hueco real.


---

## Puntero — la tanda «TEP» (2026-10-29)

**TC-546** — 30 condiciones, seis denominadores y ocho controles negativos. Cae contra el árbol
anterior por **20 condiciones y ninguna por excepción**. Ficha y detalle en
**`docs/mapa/tep-aha2026.md`** §9.

**Arneses nuevos:** `scripts/_mut_tep.py` (14 mutaciones dirigidas, worktree, guarda de md5,
14/14 muertas en el primer barrido) y `scripts/_probe_tepg.mjs` (A/B de bordes, sólo lectura).

**Casos adaptados, con el motivo escrito en cada uno (DIEZ):** TC-168, TC-471, TC-500, TC-502,
TC-507, TC-510, TC-534, TC-535, TC-537 y TC-544. **Siete los destapó la corrida completa y no el
censo**, porque son conteos de inventario que no nombran nada de lo que la tanda tocó. Tabla en
`docs/mapa/tep-aha2026.md` §9.

⚠️ **TRES TRAMPAS NUEVAS**, en `docs/mapa/tep-aha2026.md` §8: `generarInforme()` cambia de pestaña
y deja los globos en 0×0; el filtro del informe de TEP tiene **dos ramas** y medir sólo la de
«criterios incompletos» da un denominador de cero; y el badge de la categoría A de HTP **agrega
varios signos**, así que un control que le pregunte a él pasa en verde sobre cualquier corte.

---

## El caso de la tanda AJ9 (2026-10-29) — puntero

**TC-547**, treinta y seis condiciones con cinco denominadores. Su ficha vive en archivo propio:
**`docs/mapa/tests-fichas-547.md`**.

Adaptados en la misma tanda, cada uno con su motivo escrito en el código: **TC-471** y
**TC-500** (el registro de globos, 62 → 65), **TC-502** (el censo de Referencias 35 → 36, el
reparto de Función 3 → 4, el índice del buscador 33 → 34 y el mapeo de tarjetas 41 → 44),
**TC-509** (el mismo censo) y **TC-535** (los globos de 44×44, ocho → once, **y su método**).

⚠️ **EL MÉTODO DE TC-535 CAMBIÓ, NO SÓLO EL NÚMERO.** `.sacc-body` abre con `max-height` y una
transición de 0,3 s: medir en el acto lee la caja de mitad de la animación y los hijos informan
un rect que se superpone con el encabezado de su propia sección. Hoy el arnés abre la sección
**y le saca la animación** antes de medir.

---

## ⇢ Puntero — la tanda «POP-V2» (2026-10-29)

El módulo **«POP Cirugía Cardíaca»** se reordenó de arriba hacia abajo —contexto y monitoreo,
fármacos en un desplegable, hemodinámica, POCUS con el VD primero, dibujo y conclusión—, la dosis
de las vasoactivas **se calcula sola**, apareció la **PAM por línea arterial** en el primer
escalón del dueño único, el dibujo sumó **Impella, ECMO venovenoso y el timing del balón**, la
conclusión publica **señales sueltas con su valor** y el **patrón y las cinco preguntas salieron
del PPT**.

**Todo en `docs/mapa/pop-v2-posoperatorio.md`**, con la tabla de lo que los mapas anteriores decían
y dejó de ser cierto. El caso que lo fija es **TC-548**; los pendientes, **POP-a** a **POP-h**.

---

## → TC-549 — la tanda Y, Parte 1 (2026-10-29)

Cinco bloques: el strain en Referencias y ausente debajo del campo (A), el TRIV por sus dos
puertas con el corte del papel intacto (B), el sexo re-evaluando en el acto (C), la raíz en el
papel y la pastilla con el valor del índice (D), y el estudio **ajeno** como control negativo (E).
Cae contra HEAD por **20 condiciones y ninguna por excepción**; **13/13 mutaciones dirigidas
muertas** (`scripts/_mut_y.py`, en un worktree). → `docs/mapa/y-vd-sexo-aorta.md`


---

## TC-550 — tanda IMÁGENES (2026-10-29)

La ficha vive en **archivo propio**, `docs/mapa/tests-fichas-550.md`: la pantalla «Imágenes
guardadas» con sus dos botones, los meses plegados y las miniaturas numeradas, los filtros
aplicados por el estudio de cada imagen —los numéricos incluidos—, la estrella de imagen con su
nota, el PPT con su límite de 24 y su aviso previo, y el esquema de la orejuela guardándose solo
sin juzgar. Cae contra HEAD por **siete** condiciones y ninguna por excepción; lo cubren
**dieciocho** mutaciones dirigidas (`scripts/_mut_img.py`).

Sus cuatro trampas de método —un uuid de siete caracteres que no se guarda, la grilla ordenada al
revés de lo que supone el caso, los nodos que se desprenden en cada repintado y `S()` despachando
justo el evento que guarda— están en esa ficha.

---

## Puntero · TC-551 (TANDA NOCTURNA, Parte A, 2026-10-30)

La ficha vive en **`docs/mapa/tests-fichas-551.md`**, en archivo propio porque
`tests-fichas.md` está en 34,2 KB. Fija el esquema de la orejuela del ETE: su lugar al lado de
los campos, los rótulos que se pisaban, el movimiento con sus tres controles, el ⓘ nuevo con el
ámbar como control, la leyenda del guardado apagado y los recolectores de las tres tiendas.

⚠️ **El ancho de ventana no se puede cambiar desde el cuerpo de un caso**, así que el lugar se
fija por la regla del CSSOM y por la coherencia con `matchMedia`; la geometría real en los cuatro
anchos la mide `scripts/_probe_oaiwk.mjs`, en dos motores.

---

## Puntero · TC-552 (TANDA NOCTURNA, Parte B, 2026-10-30)

La ficha vive en **`docs/mapa/tests-fichas-552.md`**. Fija el TRIV del VD en sus dos referencias
—con los bordes 74/75/76, el amarillo y el control de que no vota—, el índice de tamaño aórtico
**calculado** con su dueño único y sin que ningún automatismo escriba en el estudio, el iDA con un
decimal en las tres superficies, y la aortopatía hereditaria publicando el síndrome, el diámetro y
«dilatada» **sin** umbral, clase, nivel ni tabla.

⚠️ **El commit B4 no se hizo y este caso no lo mide** → `docs/PENDIENTES.md` → **NOC-B-a**.

---

## TC-553 — la TANDA CORRECCIONES (2026-10-30)

Su ficha vive en **`docs/mapa/tests-fichas-553.md`**, en archivo propio. **59 condiciones** en
siete bloques, uno por commit más el control del estudio ajeno. **Cae contra HEAD por 35 de las
59, y ninguna por excepción**: las 24 que pasan en los dos árboles son los denominadores y los
controles negativos.

---

## → La TANDA AJUSTES-1 (2026-10-30) — puntero

Vive en **`docs/mapa/aj1-orejuela-pdf-ensuma.md`**, en archivo propio. Lo que esta zona
perdió o ganó:

- **TC-554** es el caso de la tanda; su ficha vive en `docs/mapa/tests-fichas-554.md`, en
  archivo propio porque `tests-fichas.md` estaba en 34,2 KB.
- **Cuatro casos viejos adaptados**: TC-78 y TC-553 (A7)(A8), invertidos porque la nota de
  complejidad salió del papel; TC-504 (H5)(H8) y TC-506 (E3)(E4), por la línea nueva del EN
  SUMA de la bicúspide.
- Las sondas: `_probe_aj1ab.mjs`, `_ab_aj1diff.mjs`, `_probe_aj1pdf.mjs` —geometría del PDF—,
  `_probe_aj1min.mjs` —la fila, con gestos reales—, `_mut_aj1.py` y `_probe_ajustes1wk.mjs` —que NO es `_probe_aj1wk.mjs`, el de la tanda AJ1 del 23/10—.


## → TC-555 — TANDA AORTA-2 (2026-10-30)

La ficha vive en **`docs/mapa/tests-fichas-555.md`** (archivo propio, porque `tests-fichas.md`
está en 34,2 KB). Cae contra HEAD por **26 condiciones y ninguna por excepción**, y sobrevive a
**14 mutaciones dirigidas** (`scripts/_mut_ao2.py`).


## → TC-556 — TANDA D2 (2026-10-30)

La ficha vive en **`docs/mapa/tests-fichas-556.md`** (archivo propio, porque `tests-fichas.md`
está en 34,2 KB). Cae contra HEAD por **26 condiciones y ninguna por excepción**, y sobrevive a
**15 mutaciones dirigidas** (`scripts/_mut_d2.py`).

- **Nueve casos viejos adaptados**: TC-72 (la hoja del PDF, con una segunda lectura CON fármaco
  que le devuelve el denominador a «la hoja trae SU banda»), TC-99, TC-100 y TC-108 (los títulos
  y los cortes de las tablas A y C, y el aviso que dejó de ser cierto), TC-471 y TC-500 (el
  registro de globos, 71 → **72**), TC-502 (las tarjetas sin botón, veintitrés → **veinticuatro**),
  TC-535 (los globos de 44×44, catorce → **quince**) y TC-540 (D4 **invertida** porque el
  anti-VEGF ya aplica su columna, y E1 con fármaco porque sin él no hay banda que perder).
- **Dos condiciones nacieron del barrido**: (A1d), que le pregunta al dueño y no sólo a los
  pintores, y (D6a), el denominador que le faltaba al control del monitoreo.
- Las sondas: `_probe_d2.mjs` —con `--nuevos`, porque las dos opciones nuevas del selector **no
  existen en HEAD** y ponerle a un `<select>` un valor que no tiene lo deja en vacío—,
  `_mut_d2.py` y `_probe_d2wk.mjs`.


---

## ⟶ TC-557 y las 18 mutaciones de AJUSTES-2

`docs/mapa/aj2-coartacion-diagramas.md` tiene el caso y el barrido. Lo que conviene saber antes
de tocarlo:
- **`guardarInforme` tiene una salida temprana más** que las que el D-11 documenta: el **gate de
  severidades valvulares** abre una card modal y el callback no llega nunca. Se desactiva
  reemplazando `mostrarCardSeveridadValvular`. Y el campo del documento es **`ci`**.
- **La secuencia de cierre de comentario dentro de un literal de expresión regular** cierra el
  bloque `/* */` antes de tiempo, con un error que apunta a la palabra siguiente.
- **`CeiboImg.indice()` devuelve un registro POR ESTUDIO** con su array `slots`.
- **Tres PNG escritos a mano se parecen tanto** que cualquier rebanada fija los hace
  indistinguibles: la firma va por hash del dataURL entero.
- La mutación **05 sobrevivió dos veces**: la primera porque ninguna condición miraba el PPT, y la
  segunda porque el arreglo **reproducía la expresión** del emisor en vez de ejecutarlo.

---

## ⟶ TC-558, TC-559 y TC-560 (tanda IMÁGENES-3, 2026-10-31) — puntero

El visor con video, el motor de tercios del PDF y el papel sin guías. TC-559 mide el
**empaquetador**, que es puro: no necesita jsPDF, así que no depende del CDN. Veinte mutaciones
dirigidas, 20/20 muertas, con reparto limpio —cada caso discrimina su parte—.

→ fichas en `docs/mapa/tests-fichas-558.md` · mapa en `docs/mapa/img3-visor-tercios.md`

---

## TC-561, TC-562 y TC-563 — tanda TGA (2026-10-31)

Fichas en **`docs/mapa/tests-fichas-561.md`** (archivo propio: este mapa estaba en 33,2 KB y
`tests-fichas.md` en 34,2).

- **TC-561** los campos nuevos: la fila que se muestra sólo con d-TGA, el valor que no se borra al
  esconderse, el Excel en 441 con la nueva última de su bloque, y el round-trip en los dos sentidos.
- **TC-562** el diagrama: la geometría contra la demo en los cuatro escenarios alcanzables y las
  tres comunicaciones, la carga diferida y el registro del PDF. **No baja la librería 3D**: mide lo
  puro, porque un caso de la suite que dependiera de la red sería el intermitente que TC-358 ya es.
- **TC-563** el papel, y el **guardián de una PARADA**: su bloque C pasa en los dos árboles a
  propósito — mide que la recomendación de desfibrilador de la MCH **no** vive fuera del papel, que
  es la condición para poder podarla. El día que entre a la Evidencia, se pone rojo.

**Barrido de mutaciones**: `scripts/_mut_tga.py`, catorce dirigidas, **14/14 muertas**. Cada una
declara **su** caso; correr los tres por cada mutación habría tapado un reparto mal hecho.

**TC-564 a TC-567** (TGA-2, 31/10/2026): Jatene y Rastelli en el papel y en el dibujo, y los cuatro
paneles de Evidencia con sus preguntas. Mutaciones: `scripts/_mut_t2.py`.
→ fichas en **`docs/mapa/tests-fichas-564.md`**.

## ⟶ TC-568 a TC-571 — la tanda AJUSTES-3 (2026-10-31)

Cuatro casos: **TC-568** el bucle del video en los dos PPT (el árbol contra el del experimento,
varios videos por diapositiva, la caída y el todo-o-nada), **TC-569** los botones de respuesta del
panel de Evidencia a 44 px con los dos punteros, **TC-570** la cláusula de la insuficiencia
tricuspídea sistémica en el ⓘ de la TGA, y **TC-571** la línea de la miocardiopatía hipertrófica
del PPT con su Evidencia.

Las fichas, los nueve bloques adaptados de TC-558, TC-563 y TC-567, y las **dieciocho** mutaciones
—con las cuatro que sobrevivieron al primer barrido y por qué— están en
**`docs/mapa/tests-fichas-568.md`**.

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
