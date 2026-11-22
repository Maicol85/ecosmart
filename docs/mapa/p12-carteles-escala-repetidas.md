# P12 — el cartel propio, la escala de velocidad que se perdía y las repetidas

Mapa de la tanda **P12** (2026-11-22). Sello **`v20261122-1436`**, md5 **`ae874798`**,
**192.438** líneas. Línea base **`921b72b`**, el cierre de P11.

Está armado sobre ese commit y **no guarda números de línea** a propósito: la línea cambia en
cada edición, el nombre de la función no.

---

## 1 · Los tres primitivos del cartel propio

No se inventó ningún cartel. Lo que hizo P12 fue darle **un dueño único a cada clase** y
renombrar los dos que ya existían, dejando el nombre viejo como alias de una línea.

| clase | dueño | alias histórico | marca | devuelve |
|---|---|---|---|---|
| aviso de un botón | `avisoProp(titulo, texto)` | `_medAviso` (P10) | `data-med-aviso` | nada |
| pregunta de sí/no | `preguntaProp(titulo, parrafos, rotuloSi, claseSi)` | `borrConfirmar` (EQ) | `data-borr-conf` | `Promise<bool>` |
| pedir un valor | `pedirProp(titulo, texto, inicial, pista)` | — (nuevo) | `data-ped-prop` | `Promise<string|null>` |

- **Las marcas NO se cambiaron**, y es deliberado: son por donde los casos encuentran cada
  cartel. Un cartel, una marca.
- **`claseSi` es el cuarto argumento de `preguntaProp`, con `btn-danger` por omisión.** Hacía
  falta porque P12 lo usa para decisiones que **no destruyen nada** —«¿Usar calidad original?»,
  «¿Copiar al estudio de…?»— y ahí el rojo dice algo falso: le pinta de peligro una acción que no
  lo es, y el médico aprende a desconfiar del rojo. Los veinte llamadores de `borrConfirmar` no
  cambian de aspecto.
- **`avisoProp` no devuelve una promesa**, a propósito: un aviso no es una decisión. Una promesa
  que sólo un clic resuelve es lo que colgó la pasada de la tanda EQ hora y media en el lote 18.
- **En `pedirProp` la cadena VACÍA es un valor válido y no una cancelación**, igual que en
  `prompt`: en los dos cajones de medición «vacío borra», así que confundirla con cancelar le
  quitaría al médico la única forma de borrar un valor desde el teclado. Por eso su botón **no**
  se deshabilita con el campo vacío, al revés que los dos cuadros de calibración.
- **Ninguno de los tres lleva un solo `id`**: el censo del estudio y el Excel recorren
  `input[id]` / `select[id]`, así que un campo con id entraría a las 457 columnas por existir.

### El censo: 106 → 41

Se cuentan separando **código de comentario con el estado del comentario de bloque**, que es lo
que de verdad los separa en este archivo. Las 65 convertidas son las de los tres flujos que el
pedido acota. Lo que **queda sin convertir**, por orden expresa del punto 1.3, está en
`docs/CENSO_DIALOGOS_P12.md`.

### Dos contratos que no se rompieron, y cómo

- **`_simpEscribirFEVI`** devuelve `true` si escribió, y de eso cuelgan las dos marcas
  `integrada` de MEDIR-4b (C2) **y una condición de la batería que la llama directo**. Volverla
  `async` convertiría ese booleano en una promesa —siempre verdadera— y la marca quedaría puesta
  aunque el médico dijera que no. La pregunta salió a **`_simpPisarFEVIOK`**, su dueño único, que
  la hacen los **dos** llamadores; la escritura queda sincrónica y sin diálogo.
- **`_simpPisarFEVIOK` y `medStrainElegirVista` devuelven SINCRÓNICAMENTE cuando no hay nada que
  preguntar**, y una promesa sólo cuando sí. No es una comodidad: con el campo vacío —el caso
  normal— integrar sigue siendo una operación sincrónica de punta a punta, así que los **cuatro**
  sitios de la batería que llaman a `medSimpsonIntegrar` y leen el campo en la línea siguiente no
  se enteran. El llamador distingue los dos casos con `=== true`.

### Pedir y aplicar quedan separados

En `dopCorregir` → `_dopCorregirAplicar`, `d2Corregir` → `_d2CorregirAplicar`, `imgSetCalidad` →
`_imgSetCalidadYa`, `medSimpsonLimpiarTabla` → `_medSimpsonLimpiarTablaYa` y `medStrainLimpiar` →
`_medStrainLimpiarYa`. El valor que vuelve del cartel recorre **exactamente** el mismo camino que
recorría el del `prompt` —la misma banda, el mismo normalizador, la misma marca de origen—. Con
el cuerpo copiado en las dos ramas, el día que cambie la escritura una quedaría vieja.

---

## 2 · La escala de velocidad que se perdía al recargar

**El dueño es `_cineRegistro`**, el que arma lo que se escribe en `ceibomed_cine`. Su lista de
campos por región tenía **nueve** y la región tiene **trece**.

| campo | qué es | ¿viajaba antes de P12? |
|---|---|---|
| `tipo, x0, y0, x1, y1` | el recuadro y el tipo de región | sí |
| `ux, uy` | la unidad de cada eje | sí |
| `dx, dy` | la escala de cada eje, con su signo | sí |
| **`rx0`, `ry0`** | el **píxel de referencia** | **no** |
| **`rvx`, `rvy`** | su valor físico | **no** |

Y de `ry0` cuelga **`_dcmImgBaseY`**, la fila de la línea de cero, que es lo único que convierte
una altura en una velocidad.

**Eso explica las tres mitades del síntoma**, y cada una sale de su propio predicado:

| eje | predicado | campos que exige | ¿sobrevivía? |
|---|---|---|---|
| distancia 2D | `_dcmImgRegionMedible` | `dx, dy, ux, uy` | **sí** |
| tiempo | `_dcmImgRegionTiempo` | `ux, dx` | **sí** |
| velocidad | `_dcmImgRegionVelocidad` | + **`ry0`** y `y0` | **no** |

**El camino de vuelta es `_cineDesdeRegistro`**, y lo consumen `medFijasRestaurar` —o sea
recargar la página con una fija Doppler guardada— y la reapertura de un cineloop del estudio. No
es un borde: es **toda** imagen Doppler que vuelva del disco.

⚠️ **NO HAY MIGRACIÓN NI LA NECESITA**, y sale del propio predicado: un registro escrito antes de
P12 no trae `ry0` y `_dcmImgRegionVelocidad` lo rechaza por `ry0 != null` — o sea que sigue
diciendo «acá no se mide velocidad», que es el lado seguro y es lo que hace hoy. Lo que la lista
evita es que calcule una **base equivocada**. Un estudio viejo recupera su escala en cuanto se
vuelva a guardar.

⚠️ **LOS CUATRO SON NÚMEROS DEL ENCABEZADO Y NO LLEVAN NADA DEL PACIENTE**: coordenadas de píxel
y valores de eje, ~40 bytes por región, dentro del registro de `ceibomed_cine`. **Ni un campo del
estudio ni una columna de Excel.**

### Lo medido

| | antes del viaje | después, con el registro viejo | después, con el de hoy |
|---|---|---|---|
| campos | 13 | **9** | 13 |
| `_dcmImgBaseY` | 600 | **NaN** | 600 |
| velocidad | sí | **no** | sí |
| VTI | sí | **no** | sí |
| tiempo | sí | sí | sí |
| VTI del mismo trazo | **43,2042 cm** | — | **43,2042 cm** |
| pico | **113,1 cm/s** | — | **113,1 cm/s** |
| gradiente máximo | **5,116644 mmHg** | — | **5,116644 mmHg** |

Sondas: `scripts/_probe_p12_0.mjs` (el viaje) y `scripts/_probe_p12_vti.mjs` (el VTI de punta a
punta, con su control positivo —el registro de nueve campos falla— y su control negativo —la
escala 2D en mm sobrevive con su `dx` y `dy` idénticos—).

---

## 3 · La receta de la calibración manual, y la frase del «qué hacer»

Dos constantes, los dos dueños únicos, declaradas en el bloque de `<script>` **más temprano** de
los que las leen.

- **`MED_CAL_VEL_RECETA`** — «Marcá el cero y otro punto del eje de velocidad, y escribí cuánto
  vale cada uno eligiendo la unidad (m/s o cm/s) en el mismo cuadro.» La leen el panel guía
  mientras se calibra y el cartel de «todavía no se puede medir acá».
- **`MED_CAL_VEL_RECETA2`** — «También sirven dos puntos cualesquiera del eje…», que es la verdad
  que MEDIR-3 estableció.
- **`MED_COMO_CALIBRAR_VEL`** — la frase del **qué hacer**, leída por **cuatro** lugares: el
  aviso de la herramienta Velocidad, el de VTI, el rechazo de `_vtiDe` y el de una fija sin
  escala.

⚠️ **UN `const` DE NIVEL SUPERIOR SE ALCANZA POR SU NOMBRE PELADO DESDE LOS BLOQUES DE DESPUÉS,
PERO NO DESDE LOS DE ANTES.** Los tres lectores de `MED_COMO_CALIBRAR_VEL` viven en **tres**
bloques distintos, así que la constante va en el más temprano de los tres, el de `_vtiDe`.

⚠️ **NOMBRA EL CONTROL POR EL RÓTULO QUE EL MÉDICO LEE: «Calibrar vel.»** El pedido decía «tocar
la regla» y la 📏 de esta app es la herramienta **Distancia**, no ésta. Declarado en **P12-c**.

⚠️ **«Marcá el cero y otro punto» ES LA FORMA RECOMENDADA Y NO UNA OBLIGACIÓN.** MEDIR-3 sacó a
propósito la obligación de marcar la base —porque no siempre entra en el recuadro del trazo— y
reintroducirla dejaría sin calibrar justo los archivos donde hace falta. Declarado en **P12-d**.

---

## 4 · Las repetidas y el botón con «(0)»

Las **tres** caras que el médico reportó son **un** defecto.

- **`_clnkBorrarEnPuente(ids, conProgreso)`** es el dueño único del borrado en CeiboLink. El
  cuerpo vivía dentro de `clnkDescartar`, pegado a su confirmación; el punto 2.1 necesita el
  mismo borrado **sin una segunda pregunta**. Devuelve `{ok, mal, corto}`.
- **`_clnkSoloNuevas(g, sigue)`** adjunta las nuevas y descarta las repetidas. El grupo recortado
  lo arma **`sigue`, recibido por parámetro**, que es el mismo que usa «todas igual»: con dos
  cuerpos, el cartel de destino podría contar una cosa por un botón y otra por el otro.
- **El orden**: primero se abre la pregunta de destino y **después** se borran las repetidas, en
  segundo plano y **sin progreso en el modal** —ahí ya está la pregunta que el médico contesta—.
  Y **no se espera el borrado** para seguir: un puente que no responde no puede bloquear lo que
  el médico pidió.
- **No se pregunta dos veces**: elegir «sólo las nuevas» **es** la decisión sobre las repetidas.
  Lo que hacía falta es que el cartel lo **diga antes**, y lo dice en `g.avSub`.
- **El `(0)` se dice siempre.** El rótulo era `' (' + nN + ')'` **sólo** si `nN` era distinto de
  cero, así que con cero nuevas el botón prometía algo sin decir que no había ninguna.

⚠️ **LA ACLARACIÓN SE AGREGA DESPUÉS DE `clnkAvisoAbrir`, Y LO DESTAPÓ LA MEDICIÓN.** Puesta
antes, `_clnkAvisoTexto` la **pisaba**: esa función se evalúa como **argumento** de la apertura
—o sea después de cualquier asignación de arriba— y reescribe `g.avSub` con el equipo y la hora.

⚠️ **BORRAR LAS REPETIDAS NO PIERDE NADA**, y es lo que lo hace seguro: una repetida está, por
definición del registro `ett_clnk_vistas`, en un estudio, en un estudio guardado, en «Imágenes
sin estudio» o ya descartada. La copia del puente es la de más.

**El registro persistente de ids ya vistos NO se tocó** (punto 2.4): se lee con `_clnkVistaDe` y
se escribe con `_clnkVistasMarcar`, las dos de P9.

### Lo medido (`scripts/_probe_p12_t2.mjs`)

| escena | botón 1 | en el puente antes | después |
|---|---|---|---|
| 1 nueva, 2 repetidas | «(1)» | `p1, p2, p3` | **`p3`** |
| 0 nuevas, 3 repetidas | **«(0)»**, `disabled`, opacidad **0,45** | `q1, q2, q3` | `q1, q2, q3` (no pierde nada) |
| control negativo: 3 nuevas | no se abre la pregunta | — | — |

Y las dos repetidas quedan marcadas **`descartada`** en el registro persistido, que es lo que
hace que no vuelvan al recargar.

---

## 5 · Los cuatro puntos de solo reporte

| punto | veredicto |
|---|---|
| **4.1 · la flecha ↑/↓** | **No es un defecto de la flecha: es la misma causa que 3.1.** Con imagen fresca da ↑ arriba (+94,25 cm/s) y ↓ abajo (−94,25). El ↑ que el médico vio abajo sale del registro viejo: sin `ry0` la base da `NaN`, `cms` da `NaN`, y **`NaN < 0` es falso**, así que el ternario cae siempre en ↑. **Cerrado por la TAREA 3.** |
| **4.2 · la marca de escala** | **La premisa es falsa en la tabla del visor y cierta un paso después.** La tabla publica las dos marcas distintas a la vez, más el renglón ámbar arriba del botón que carga al informe. Lo que **sí** se pierde es al cargar: `medVtiCargar` no menciona `velManual` y no existe campo gemelo. **No se agregó la marca.** → **P12-e** |
| **4.3 · los diámetros** | **La premisa es falsa en sus dos mitades.** `_vtiQpQs` lee `diam_tsvi` y `tsvd_diametro` —los campos de la app— y `medVtiDiametro` escribe a **esos mismos**. El pasaje es bidireccional por un dueño único. **No se cambió nada.** → **P12-f** |
| **4.4 · los rojos de la suite** | La lista exacta, en la sección de esta tanda de `CLAUDE.md`. |

Sondas: `scripts/_probe_p12_t4.mjs` (la flecha en cinco escenarios) y
`scripts/_probe_p12_t42.mjs` (4.2 y 4.3).

---

## 6 · El puente de los carteles propios en el arnés — `__t.propPuenteOn`

Convertir 65 ventanas nativas en carteles propios **rompe la batería por dos puertas a la vez**, y
las dos están medidas:

| | cuánto | qué pasa |
|---|---|---|
| casos que sustituyen `window.alert` | **246** | el texto que medían ya no llega |
| `window.confirm` | **239** | lo mismo, y además |
| `window.prompt` | **46** | lo mismo |
| casos que **colgaron** su lote | **3** | TC-238, TC-879, TC-964 |

Lo segundo es peor que un rojo: `preguntaProp` y `pedirProp` devuelven una promesa que **sólo un
clic resuelve**, así que un caso que dispara el sumidero y no aprieta nada no falla — **cuelga el
lote entero**. En la primera pasada de P12 cortaron los lotes 4, 17 y 18 a los 900 s y dejaron
**81 casos sin ejecutar**.

**El puente traduce cada cartel propio al nativo que reemplazó.** `propPuenteOn()` envuelve
`window.avisoProp`, `window.preguntaProp` y `window.pedirProp`, le pasa su texto al nativo que el
caso tenga sustituido **en ese momento**, devuelve lo que ése devuelve y **no abre un solo nodo**.
Así los 246 casos siguen midiendo por donde siempre midieron y **no se tocó una sola de sus
condiciones**. Es la generalización de `ec5Auto`, que ECO-CONECTOR-5 escribió para su propio modal
por esta misma razón.

⚠️ **ENVUELVE LAS FUNCIONES Y NO MIRA EL DOM, y el primer intento lo probó**: un vigía que sondea
cada 40 ms contesta **después** de la parte sincrónica del caso, y la mayoría de estos casos lee lo
que el aviso dijo **en la línea siguiente** —con el nativo eso funcionaba porque `alert` es
sincrónico—. Medido sobre los mismos treinta: con el vigía **15 de 30**; con el envoltorio, los
**30**.

⚠️ **Y SÓLO FUNCIONA PORQUE LAS TRES SON DECLARACIONES DE FUNCIÓN** de nivel superior, o sea
propiedades de `window`: los llamadores internos las resuelven contra el objeto global, así que
reemplazarlas intercepta **todos**, los dos alias viejos incluidos —`_medAviso` llama a `avisoProp`
y `borrConfirmar` a `preguntaProp`, los dos por su nombre pelado—. Con un `const` no funcionaría.

**Va armado por omisión en el reset del runner**, y no en cada caso: con una línea por caso, el que
se olvide cuelga su lote. Y los **tres nativos quedan con un valor por omisión no bloqueante**
—`alert` recolecta, `confirm` devuelve `false` (el lado que no destruye) y `prompt` `null`—, porque
el puente los llama y un nativo sin sustituir cuelga la página.

**Los seis que lo desarman con `propPuenteOff()`**, porque manejan estos carteles **por gesto**:
TC-1017 y TC-1021 —los que miden que los carteles propios existen y que los nativos ya no se
llaman— y TC-980, TC-990, TC-991 y TC-992, que aprietan su botón de verdad.

**Lo que cuesta, declarado en P12-h**: en esos 246 casos la batería ya no distingue si el mensaje
salió de un cartel propio o de un nativo. Lo que lo guarda es **TC-1017**.

### Lo que hubo que adaptar, y por qué queda más fuerte

- **TC-856 (B)** y **TC-860 (D)**: el aviso dejó de ser un `alert` de una oración; el nombre del
  ajuste se mudó al **título** y el cuerpo dice «con esa opción **APAGADA**» —en femenino, porque
  concuerda con «opción»—. Las dos condiciones pasan a exigir **las dos mitades**, o sea que
  quedaron más fuertes: antes a TC-860 le bastaba con la palabra en mayúsculas en cualquier lado.
- **TC-256**, **TC-264**, **TC-250** y **TC-251**: `dopCorregir`, `d2Corregir` y
  `_dopLimpiarConfirmar` pasaron a **escribir en un microturno**, y esos casos leían la fila en la
  línea siguiente. Se les deja correr el turno. **Ningún llamador de la app depende de que fueran
  sincrónicas**, medido: los cinco sitios que las llaman son gestos y ninguno lee lo que devuelven.

## Cobertura

**TC-1017 a TC-1022**, uno por corrección, los seis cayendo **0/6 contra `921b72b`** por sus
condiciones y **ninguno por excepción**. Las fichas, en `docs/mapa/tests-fichas-1017.md`.
