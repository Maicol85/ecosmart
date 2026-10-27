# La raíz aórtica con un solo criterio, el globo, el cruce de las dos pantallas y la Evidencia de la VAB

Mapa de la tanda **AJ4** (2026-10-23). Lo que vive acá: el **criterio único de dilatación de la
raíz** y sus siete superficies, el **texto del globo ⓘ**, el **cruce entre las pantallas de
bicúspide y de coartación**, y la parte de la Evidencia de la VAB que esta tanda sí tocó.

Lo que **NO** vive acá: las citas por aortopatía, la coartación por gradiente medio y el motor
`_indAo` → `docs/mapa/aorta-aortopatias-evidencia.md`; el dibujo y los seis tipos de la VAB →
`docs/mapa/vab-bicuspide.md`; el mecanismo del panel → `docs/mapa/panel-evidencia.md`; lo que esta
tanda **declaró y no hizo** → `docs/PENDIENTES.md` → **AJ4-a** a **AJ4-g**; las fuentes con sus
folios → `docs/fuentes/FUENTES.md` → «La tanda AJ4».

**Commits:** `cb742a1` (AJ4-1 + AJ4-2) · `aa7be1b` (AJ4-4) · `1ba0cee` (AJ4-5 parcial) · la
cobertura y la documentación. **El orden de revertido seguro es el inverso del de aplicación**, y
**TC-521 cuelga de los tres**: revertir uno sin revertir el caso deja el suite en rojo apuntando a
la app.

---

## 1 · El defecto que cerró, en una línea

Una **mujer con una raíz de 38 mm** salía «Aorta torácica de calibre normal» en el informe
**firmado** y «dilatada» en la pestaña Referencias de la misma aplicación, sobre el mismo número.

Había **cuatro** dueños de «normal / dilatada» para ese segmento y no coincidían:

| # | Quién | Qué decía | Qué superficies gobernaba |
|---|---|---|---|
| 1 | `aoSegDil` con `AO_REF.sin` = 40, inclusivo | **igual para los dos sexos** | cápsula, informe, EN SUMA, las dos tablas del PDF, Laboratorio |
| 2 | `aoDilCorte` = {M:40, F:36} + `aoIdaDilatado` | por sexo, y con índice | sólo el panel de Evidencia y Referencias (desde «H» y AJ1) |
| 3 | `vabConclusion`, un `maxAo >= 40` escrito a mano | igual para los dos sexos | el EN SUMA de la VAB y `_indVABConcl` |
| 4 | la fila «Raíz aórtica — dilatada (criterio de EcoSmart)» | 40 para los dos | Referencias |

Hoy hay **uno**: `aoSegRef` / `aoSegIda` / `aoSegDil`, y los cuatro caminos de arriba pasan por ahí.

---

## 2 · Las piezas, por nombre de función

| Nombre | Qué hace | ⚠️ |
|---|---|---|
| `AO_DIL_MM` = `{M:40, F:36}` | el corte por sexo | **se MUDÓ** al bloque de constantes de la aorta, junto a `AO_REF`. Declarada donde estaba quedaba ~54.000 líneas **después** de su primer lector: zona muerta, y eso aborta el `<script>` entero |
| `AO_IDA_MAX` = 22 | el corte del índice | se mudó por el mismo motivo |
| `AO_SEGS.ao_sin.refSexo` / `.idaMax` | **declarativos, al lado del valor** | son lo que hace que la raíz sea el único segmento con corte por sexo y con segunda puerta. `ref` se conserva: es el corte del varón y es lo que `aoSegRef` devuelve sin sexo |
| `aoSegRef(sg, src)` | el corte **efectivo** de un segmento | los otros cuatro devuelven su `ref` y no miran nada |
| `aoSegIda(sg, x, src)` | el índice **de ese segmento** | sólo la raíz. Indexa el diámetro **de la raíz**, no el máximo de cuatro campos: eso es `aoIdaVal()` y es otra pregunta (→ PENDIENTES **AJ4-a**) |
| `aoSegDil(sg, x, src)` | el predicado | la raíz tiene **dos puertas**: diámetro **inclusivo**, índice **estricto** |
| `aoSegGrado(sg, x, src)` | el grado | sigue devolviendo un solo grado, `'dilatada'` |
| `window.AO_SEGS` | la lista, **exportada** | un `const` de nivel superior **no** crea la propiedad en `window`; las sondas y los casos tenían que escribir el literal |

### `src` tiene TRES formas y las tres hacen falta

| `src` | Qué resuelve | Quién lo pasa |
|---|---|---|
| ausente | el **formulario** | la cápsula, el narrativo, el PDF |
| objeto `campos` | un estudio **guardado** | el Laboratorio (`i.campos`) y `vabConclusion` |
| texto `'M'` / `'F'` | un **sondeo por sexo**, sin paciente | el aviso de «Falta el sexo» y el mapa de bandas de `evCortes` |

⚠️ **`aoSegIda` devuelve `null` con un `src` de texto**, y es deliberado: un sondeo por sexo no
tiene paciente, así que no tiene superficie corporal. Leer el peso y la talla del formulario en un
sondeo que pregunta «¿qué pasaría con el otro sexo?» mezclaría dos pacientes en la misma respuesta.

⚠️ **EL LABORATORIO PASA `i.campos` Y ANTES NO PASABA NADA.** Con el tercer argumento vacío,
`aoSegDil` leía el sexo del paciente **en pantalla** y lo aplicaba a los N estudios de la base: el
agregado habría contado con el sexo equivocado y nada lo habría dicho.

---

## 3 · Las siete superficies, y qué cambió en cada una

| Superficie | Quién la escribe | Qué cambió |
|---|---|---|
| **Pantalla** (cápsula `ao-interp`) | `calcAorta` | el número del rótulo sale de `aoSegRef`, no de `sg.ref`. Y hay una rama nueva: cuando el voto lo da el **índice** y no el diámetro, el rótulo lo **dice** — «Dilatada (iDA >22 mm/m²)». Sin esa rama decía «Dilatada (≥40mm)» sobre un 38, que se lee como un error de la app |
| **Informe** (3 estilos) | sección 12 de `generarInforme` | nada propio: hereda el voto de `aoSegsMedidos` |
| **EN SUMA** | la misma sección | idem |
| **ⓘ** | `evTarjetaAo` | texto aprobado, § 4 |
| **Referencias** | `evRefPintar('ao2')` | **una sola fila** de la raíz, ficha `AOR-004`, con 40 / 36. Se fue la del «criterio de EcoSmart» y la de «Dilatación según la ESC 2024 — diámetro», que decía el mismo número bajo otro rótulo |
| **Evidencia** | `_indAo` / `_indVAB` | no cambió: ya aplicaba este criterio desde «H» y AJ1 |
| **PDF** | bloque 1 (tabla compacta) y bloque 5 (celda «Otros») | el bloque 1 imprime `aoSegRef(sg)`, así que en una mujer dice «<36 mm»; el bloque 5 hereda el asterisco de `aoSegDil` |

Y dos lugares más, que no son superficies pero deciden:

- **`vabConclusion`**: su `maxAo >= 40` pasa a `aoDilCorte(src)`. **Se mueve el umbral y NO la
  clave**: `dilatacion_leve` es lo que el Laboratorio cuenta por estudio guardado y renombrarla
  reclasificaría la base entera.
  ⚠️ **CONSECUENCIA DECLARADA Y NO MIGRADA**: un estudio ya guardado de una mujer con la raíz entre
  36 y 39 mm pasa de `sin_dilatacion` a `dilatacion_leve` la próxima vez que se lea. **No se
  reescribe nada en disco** — la clave se recalcula desde `campos` en cada lectura.
- **`DCM_RANGO_CLIN.ao_sin`**: pasa de `[null, AO_REF.sin]` a `sx => [null, aoDilCorte(sx)]`, el
  mismo patrón que `ai_diam` desde el CORTOS8. Con el techo del varón para los dos sexos, una mujer
  con 38 mm entraba por el importador **sin advertencia** sobre un valor que la app llama dilatado.

### El aviso de «Falta el sexo» la nombra

La raíz entra en **`AIVI_SEXO_PARAMS`**, que es el mecanismo que ya existía para los seis
parámetros de AI/VI. Con el sexo vacío y una raíz de **39 mm** —que es normal en el varón y dilatada
en la mujer— el aviso sale: «Falta el sexo: la raíz aórtica cambia de categoría según el sexo».
Con **40 mm** no sale, y es correcto: a 40 está dilatada en los dos sexos, así que el sexo no
cambia nada.

---

## 4 · El globo ⓘ — AJ4-2

El texto aprobado, en orden de lectura. **Las líneas fijas** salen de `AO_DIL_MM` y de la ficha
`AOR-002`; **la dinámica** es la lectura del nomograma.

1. `Aorta torácica — senos de Valsalva`
2. `Rango esperado según la edad y la superficie corporal` + el gráfico
3. *(dinámica)* `Cargar la edad para elegir el gráfico que corresponde.`
4. `Dilatación en EcoSmart: 40 mm o más en el varón y 36 mm o más en la mujer. Son los valores con los que la ESC 2024 define la aorta dilatada (apartado 9.2.1.1, folio 71; Figura 24, folio 76).`
5. `Es una orientación: el criterio final es individual (edad, sexo, superficie corporal).`
6. `Fuente del rango: ASE/EACVI 2015, Figura 13 (folio 32), ecuaciones de Roman 1989.`

**Lo que salió, y por qué:**

- la línea que mezclaba el corte con **la categoría de la cápsula** (`_evCapsula('ao-interp')`):
  esa categoría está en pantalla, a dos dedos del globo, y repetirla era una segunda redacción del
  mismo veredicto sobre el mismo paciente;
- la nota de las **«dos maneras»** de la guía: es metodología de lectura de una fuente, no
  información sobre este paciente. Vive en `docs/fuentes/FUENTES.md` y en el `valor` de `AOR-004`.

⚠️ **EL PIE DICE «Fuente del rango» Y NO «Fuente»**, y no es cosmético: desde el AJ4-1 la tarjeta
publica **dos cosas de dos documentos** —el rango esperado es de la ASE/EACVI 2015 y el corte de la
ESC 2024—. Un pie que dijera «Fuente:» a secas le atribuiría las dos a la primera.

⚠️ **LA LÍNEA DEL NOMOGRAMA YA NO DICE «Corte de EcoSmart»** (`_evNomoSvg`): dice «Dilatación: N mm»
y el número se **sondea** del dueño, así que en una mujer cae en 36.

⚠️ **LA FICHA `AOR-001` DEJÓ DE CUBRIR LA RAÍZ.** Hoy cubre los otros cuatro segmentos y sigue
«por verificar»; la raíz la respalda `AOR-004`, que está **verificada**.

---

## 5 · El cruce de las dos pantallas — AJ4-4

`vabCoaCruceSync()`, **un solo pintor para los dos carteles**. Con dos funciones, el día que una
cambie de criterio la pantalla afirmaría la coartación de un lado y la ignoraría del otro, sobre el
mismo estudio.

| Estado | `vab-coa-nota` (sección VAB) | `coa-vab-nota` (sección COAO) |
|---|---|---|
| sin nada | «Excluir coartación de aorta asociada — ver la sección de coartación.» **en ámbar** | oculto |
| coartación cargada | «Coartación de aorta cargada (sección COAO)» **en gris** | oculto |
| bicúspide | el de ámbar | «Válvula aórtica bicúspide presente (Válvulas)» |
| las dos | el de gris | el de la bicúspide |

**La presencia se le pregunta a su dueño y no se reimplementa:** `coaConclusion() != null` —su
`hayDato` mira los siete campos propios y deja la ascendente afuera a propósito, porque `ao_tub`
está medida en casi todos los estudios y no es evidencia de que alguien haya buscado una
coartación— y `_indVABEsBicuspide()`, que las dos secciones de Evidencia ya comparten desde el
D2-E3. Ese segundo dueño cubre **los dos caminos**: la morfología de Válvulas en «Bicúspide» **o**
un tipo de fusión elegido en Congénitas.

⚠️ **UN OYENTE DE DOCUMENTO ADEMÁS DE LAS DOS SYNC.** Cada cartel depende de campos de la **otra**
sección, y `va_morf` vive en otra **pestaña**: su `onchange` llama a `valvProtSync()` y no pasa por
acá. Es el patrón de `aiviSexoSync`, por el mismo motivo.

⚠️ **NINGUNO DE LOS DOS ids TERMINA EN «-aviso»**: `limpiarCampos` barre `[id$="-aviso"]` con
`textContent = ''` y dejaría el nodo **visible y mudo**.

⚠️ **ES DE PANTALLA.** Medido: los tres textos —leídos de sus constantes, no de una aproximación—
no aparecen en el informe, ni en el EN SUMA, ni en el PDF generado de verdad.

---

## 6 · La Evidencia de la VAB — AJ4-5, lo que sí se hizo

- **Las cuatro recomendaciones pasan a `r.bloques`**, que se pinta con `plegado:false`. Vivían en
  `notas`, que el marco pinta **dentro del «Ver detalle»** y ése nace **plegado**: eran las cuatro
  filas que la sección existe para publicar y estaban detrás de un clic. Es la tercera vez que este
  repo lo paga (el trabajo «H» en la sección de aorta, el AJ1 con la coartación).
- **Tono neutro** en las dos líneas que eran advertencias dirigidas al lector («NO hay Clase I a
  50 mm…», «Los dos umbrales que circulan… son de la ESC 2014»). **Todo el dato se conserva** —
  clase, nivel, tabla y folio—; la historia pasa a `FUENTES.md`.
- **El texto que el panel decía dos veces**: `_indVAB.notas[0]` abría con «Conclusión de la app: »
  + el texto **entero** de `vabConclusion()`, que es exactamente lo que la sección «Válvula aórtica
  bicúspide — conclusión» publica como su única fila, **dos secciones más arriba del mismo panel**.
  Se retira de `_indVAB` y queda sólo el estado **sin** conclusión, que la otra no puede decir
  porque con `C` nulo no se pinta. Y la frase de la distinción raíz/ascendente sale de
  `_indVABConcl`: queda en la sección que además trae los diámetros que la sostienen.
- **El aviso de Turner con sexo masculino**, sólo en Evidencia (`_indAo.aviso`). **Con el sexo
  vacío no se avisa**: «no cargado» no es «masculino», y la app no puede afirmar una contradicción
  sobre un campo que nadie contestó. No cambia ningún cálculo: los dos cortes de Turner son
  indexados y no miran el sexo.

**La fusión de los cuatro paneles en uno NO se hizo**, con sus motivos, en `PENDIENTES.md` →
**AJ4-f**.

---

## 7 · Cómo medir esta zona

- **Arnés:** `scripts/_probe_aj4.mjs` (Chrome por CDP, A/B de solo lectura con `--file`). Grupos:
  `dueno` (once escenas por sus bordes), `sup` (Referencias, el globo, la Evidencia y el PDF),
  `cruce` (las cinco celdas del AJ4-4 y el control del papel), `evid` (AJ4-5 parcial, con sus dos
  controles negativos de Turner), `ctrl` (el A/B contra HEAD) y `maq` (dos anchos por dos temas).
- **Cobertura: TC-521, 42 condiciones** en nueve grupos, **verificado por CINCO mutaciones** y cada
  una muere donde le toca:

| Mutación | Condiciones que mueren |
|---|---|
| el corte de la mujer vuelve a 40 | **ocho**: A2, A3, C1, C2, C3, C4, C6 y E1 |
| se saca la segunda puerta (el índice) | B3 y B4 |
| el bloque de la VAB vuelve a nacer plegado | G1 |
| se saca el aviso de Turner | H1 |
| se desconecta el cruce de las dos pantallas | F2, F3 y F4 |

Las mutaciones se aplicaron sobre `index.html` con los tres commits ya hechos y se restauraron con
`git checkout`, **verificando el `md5` después de cada una**.

---

## 8 · Cinco trampas de esta tanda

1. ⚠️ **UN `const` DE NIVEL SUPERIOR NO ESTÁ EN `window`.** `AO_SEGS` y `AO_REF` no crean la
   propiedad; sólo las declaraciones de función lo hacen. Dos casos murieron con
   `Cannot read properties of undefined` sobre `window.AO_SEGS` y sobre `window.AO_REF`. Se exportó
   `AO_SEGS` (después de la declaración, nunca antes) y los cortes de los otros segmentos se leen
   de ahí.
2. ⚠️ **EL SELECTOR DE SEXO GUARDA `'M'` / `'F'`, NO «Masculino» / «Femenino».** La primera corrida
   de la sonda informó `faltan: ['sexo:VALOR']` y midió once escenas **sin sexo cargado**: el
   denominador entero era falso y los números salían plausibles.
3. ⚠️ **UN BACKSLASH PERDIDO EN UN TEMPLATE ANIDADO.** `/\s+/g` escrito con un solo escape dentro
   del template de la sonda llega al navegador como `/s+/g` y **borra todas las eses**: la sonda
   informaba «Excluir coartación de aorta a ociada» y parecía un problema de acentos.
4. ⚠️ **`check_backticks.py` DEJÓ PASAR DOS ACENTOS GRAVES MÁS** — uno en un `evCrudo` suelto y uno
   en el cuerpo de TC-521 antes de que el caso existiera. El `SyntaxError` apunta a la **apertura**
   del template: la primera vez señaló `caso('TC-494'` y el culpable estaba 260 líneas más abajo.
   **Correr los dos, y en ese orden**: `check_backticks.py` dice dónde, `node --check` confirma.
5. ⚠️ **EL CUERPO DE UN CASO DEVUELVE `{ extra: ex }`, NO `ex`.** Con el array pelado el arnés
   informa «el caso no declara NINGUNA condición» y las 42 se pierden — en verde, no en rojo.

---

## 9 · Lo que esta tanda encontró en la fuente y NO tocó

- La **Figura 5 de la ESC 2024** (folio 28) publica límites superiores de normalidad **por sexo**
  para todos los segmentos, y para el seno de Valsalva dice **40 / 34**, no 40 / 36. → **AJ4-b**.
- Los cuatro cortes de los **otros segmentos** no tienen fuente que los publique con esos valores;
  la atribución a la «ESC 2021» que el Laboratorio imprimía **era falsa** —ese documento no está en
  la biblioteca— y se retiró. → **AJ4-c**.
- La guía indexa **sólo Turner**. Marfan y Loeys-Dietz son absolutos. → `FUENTES.md` y **AJ4-f**.

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).
