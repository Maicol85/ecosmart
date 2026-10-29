<!-- salido de docs/mapa/tests.md en la tanda C2, 2026-10-28 -->
# Arneses de A/B y de mutación, y sus trampas

> **Salió de `docs/mapa/tests.md` en la tanda C2 (2026-10-28), sin perder un párrafo.**
> Ese mapa estaba a **246 bytes** del techo de 35 KB que `CLAUDE.md` fija, así que no entraba una
> línea más y esta tanda tenía que escribirle el caso nuevo. Lo que se mudó acá son las **dos
> secciones que no hablan de la suite sino de la verificación alrededor de ella**: los arneses de
> A/B y de mutación, y las trampas de instrumentación que costaron mediciones falsas.
>
> Lo que **se quedó** en `tests.md` es la suite: `test_clinico.mjs`, cómo agregar un caso, cómo
> correrlo, los dos juegos de helpers de válvulas y las fichas de cada tanda.
>
> ⚠️ **ESTAS TRAMPAS SE LEEN ANTES DE CREERLE A UNA MEDICIÓN, no después.** Casi todas se
> escribieron porque una corrida dio un número plausible y falso.

---

## Arneses de A/B y de mutación

**Desde el 2026-10-03 sí hay arneses versionados**, los de la tanda de «Sin apaga el botón», con el
prefijo `_` porque son temporales y no infraestructura:

- **`scripts/_mut_sinapaga.py`** — arnés de mutación con las reglas del procedimiento
  **implementadas y no comentadas**: md5 del vivo contra su snapshot **antes** de aplicar y aborto
  si no coinciden; md5 antes, después y tras revertir; `RESULTADO` exigido en la salida antes de
  puntuar (sin eso el veredicto es `NO CORRIÓ`, no «sobrevivió»); y cada mutación declara **qué caso
  le corresponde** y corre sólo ése. `python3 scripts/_mut_sinapaga.py M3` corre una sola.
- **`scripts/_probe_sinapaga.mjs`** — sonda de 35 escenas que entra por el **gesto** (no por el
  estado): `valvSev.aplicar`, `toggleValvPill` y el `set` del desplegable. Trae `culpable(id)`, que
  devuelve **qué ancestro** oculta un nodo en vez de un booleano — es lo que destapó que el
  denominador estaba mal tres corridas seguidas.
- **`scripts/_probe_singrado.mjs`** — la sonda de la tanda anterior, 47 escenas con PDF real
  (interceptando `doc.text`) y fila de Excel por `_labExcelRow`. Es la que sirve para el **A/B
  contra HEAD**: se guarda el `index.html` nuevo, se hace `git show <ref>:index.html > index.html`,
  se corre, se restaura y **se verifica el md5**.

- **`scripts/_probe_evidbtn.mjs`** (2026-10-12) — sonda del **estado del botón «Evidencia»**, A/B de
  solo lectura con `--file`. Grupos: `estados`, `temas`, `maqueta`, `rutas`, `abrir`. Lo que vale
  copiar: el estado se lee de **las tres superficies a la vez** —la clase, el **fondo computado** y
  el `aria-label`—, porque una clase que pierde contra otra regla se lee como un arreglo aplicado; y
  el grupo `rutas` trae el **control negativo del enganche**: repone los 886 campos **sin**
  `_recalcModulos` y exige que el botón NO se mueva, que es lo que prueba que el embudo es lo que lo
  mueve.
- **`scripts/_probe_evidterm.mjs`** (2026-10-12) — sonda del **glosario del panel** (los dos ⓘ de
  término y su tarjeta), A/B de solo lectura con `--file`. Grupos: `texto`, `tarjetas`, `teclado`,
  `aislamiento`, `convive`. Tres cosas que vale copiar: el hash por sección con **los glifos ⓘ y
  todo el blanco descontados** (es el que responde «idéntico a HEAD» sin romperse por el
  maquetado); `elementFromPoint` en **las cuatro esquinas y el centro**, que es lo único que
  distingue «no recortada» de «no medí el recorte»; y medir **las dos rutas de repintado por
  separado**, porque «el re-anclaje no sirve» y «el re-anclaje está tapado por el cierre» se ven
  exactamente igual.
- **`scripts/_probe_emevid.mjs`** (2026-10-11) — sonda de la **sección de estenosis mitral del
  panel de Evidencia**, A/B de solo lectura con `--file`. Cinco escenas y dos cosas que vale copiar:
  · **mide el OBJETO y el HTML pintado**. El objeto de `_indEM()` dice qué decidió la función; el
    HTML dice qué ve el médico. Sólo el objeto deja pasar un bloque que la sección arma y el
    renderizador no pinta; sólo el HTML no distingue «no aplica» de «no se evaluó»;
  · **hashea las OTRAS catorce secciones** del panel (longitud + hash por sección) con un paciente
    sembrado a propósito, que es el control negativo de «el cambio no se fue de la mitral».
    ⚠️ La primera versión de ese control sembraba sólo dos áreas y comparaba **UNA** sección ajena:
    decía «idénticas» sobre un conjunto de uno. Ahora informa `cuantasAjenas` al lado del veredicto.
  Escenas: `--solo etio` (las cinco morfologías), `categoria` (la categoría del bloque 1 contra
  `emCategoria()` y contra el informe narrativo, en las seis escenas pedidas), `clin`
  (Ninguna / Una / Varias y su control negativo), `contra` (una contraindicación presente corta las
  cinco filas, con control negativo), `alcance` y `movil` (1200 / 390 / 360 px).

  ⚠️ **DOS FALSOS QUE DIO ESTA SONDA Y QUE SE ARREGLARON, porque los dos se repiten:**
  1. **`abrirTodo` solo no alcanza después de `limpiarCampos`**, que cierra el cajón de la estenosis
     mitral: el `display:block` en línea de `bloque-em-detalle` no gana al CSS del cajón cerrado. Hay
     que abrir con **`valvDatosTog`** —el gesto del médico— y verificar la geometría justo antes de
     medir. Es la misma trampa que `CLAUDE.md` documenta para la pasada de celular.
  2. **La LECTURA del resultado puede ser el defecto.** Tres corridas informaron «SECCIÓN AUSENTE»
     en las cinco morfologías y la sección estaba perfecta: el script de lectura preguntaba
     `sec.get('seccion') is None`, y en Python eso da `None` **también cuando la clave no existe**,
     que es justo el caso de éxito. El denominador roto estaba en el lector, no en la app ni en la
     sonda — mirar el HTML al lado del objeto fue lo que lo delató.

El procedimiento manual sigue valiendo para lo que esos dos no cubren.

Lo que sí existe son los **artefactos de corridas pasadas en `/tmp`** (`mut*.py`, `mut*.sh`,
`mut*.mjs`, `ab_*.json`, `ab_*.txt`, `/tmp/index.orig.html`). Son de un solo uso, no están
versionados y **desaparecen al reiniciar**: no son infraestructura, son el rastro de la sesión que
los escribió. Si hace falta un barrido nuevo, se vuelve a armar.

El procedimiento, tal como quedó escrito después del barrido del 2026-10-01 (31 corridas, 29 en
rojo, 2 declaradas rama inalcanzable):

1. **Correr la línea base primero.** Con casos ya rojos de entrada, todas las mutaciones salen
   «en rojo» sin que eso pruebe nada.
2. **Mutar en una copia**, nunca sobre `index.html` vivo, y comparar el md5 del snapshot contra el
   archivo vivo antes de aplicar; si no coinciden, **abortar** (un arnés que restaura desde un
   snapshot viejo es una máquina de deshacer ediciones en silencio).
3. **md5 antes, después y tras revertir**, en cada mutación.
4. **Puntuar solo si la salida trae `RESULTADO`** (ver Trampas).
5. Una mutación por cambio, y cada una tiene que caer en **la condición que le corresponde**, no
   en cualquiera.

---

## Trampas

Estas son las que cuestan sesiones enteras.

- **Acentos graves (backticks) en el cuerpo de un caso.** El cuerpo es un template literal: un
  backtick —**incluso dentro de un comentario**— cierra la cadena en la mitad y el archivo entero
  deja de parsear, con un `SyntaxError` que apunta a la línea del `caso(`, **decenas de líneas
  ANTES** del culpable. Para citar un identificador en un comentario del cuerpo, escribirlo
  pelado: `amiloTextoTEER`, no entre acentos graves. *Confirmado en el código: el comentario de
  `caso()` lo advierte en mayúsculas y dice que ya se pagó cuatro veces; el historial registra 169
  backticks acumulados removidos de cuerpos de caso.*
- ⚠️ **`\s` dentro del cuerpo de un caso o de una sonda se cocina a la LETRA `s`.** El cuerpo es un
  template literal, que procesa las secuencias de escape **antes** de que el navegador vea el
  código: `/\s+/g` llega como `/s+/g` y borra todas las eses del texto. Y el falso es plausible —
  en la tanda del glosario la sonda informaba una diferencia de **2 caracteres** (el blanco real al
  lado de un glifo) con el veredicto del lado equivocado. **Se vio al IMPRIMIR el texto**, que decía
  «caracteritica» y «defavorable». `\u24d8` sobrevive de pura suerte, porque es un escape válido y
  se cocina al carácter correcto. **En el cuerpo va `\\s`**, como lo escriben los `norm()` de las
  sondas viejas. *Medido el 2026-10-12.*
- ⚠️ **Los DOS overlays de pantalla completa se comen cualquier medición de oclusión, y el aviso
  legal VUELVE a mitad de corrida.** `#modalAvisoEco` tapa con `z-index:9999` y `#login-overlay` con
  `2147483000`: con cualquiera puesto, `elementFromPoint` devuelve **ese** nodo en todos los puntos y
  la escena informa «tapado» sobre un árbol perfecto. TC-395 ya lo documenta para el overlay de
  login; el 2026-10-12 volvió a pasar **dos veces** con el aviso legal, en TC-451 y en la sonda del
  glosario, porque lo repone el arranque de sesión que corre tras `limpiarCampos`. **Despejarlos
  DENTRO del medidor, no una vez al arranque**, y poner su estado al lado del veredicto.
- ⚠️ **Una protección de la sonda puede esconder el defecto que la sonda busca.** El `clicSel` de
  las sondas llama a `scrollIntoView` y **se niega** a clickear un nodo fuera del viewport —la
  protección que se agregó tras una corrida colgada 75 s—, así que **todas** sus escenas tienen el
  blanco a la vista. El acote vertical de la tarjeta del glosario lo encontró **TC-451**, que usa un
  `.click()` sintético y no scrollea: con el botón fuera del área visible del panel, la tarjeta se
  colocaba fuera de la pantalla. *Medido el 2026-10-12.*
- ⚠️ **Comparar dos mediciones de DÍAS distintos da una diferencia que no existe.** El A/B de las
  seis superficies de la tanda del glosario dio 6 diferencias en el hash de los campos guardados: la
  medición de HEAD era del 11 y la nueva del 12 de octubre. Remedido HEAD el mismo día, **0
  diferencias**. Misma clase de falso que el pendrive, con otra variable. **Mirar la fecha antes de
  restar.**
- **El scorer de mutaciones contaba «sin ✗» como "sobrevivió".** Si la suite no arranca, stdout
  queda vacío, no hay ningún `✗` y **todas** las mutaciones salen «sobrevivió» — indistinguible de
  «no hay cobertura». Reportó 7 falsos de una vez. **Exigir `RESULTADO` en la salida antes de
  puntuar; si no está, el veredicto es `NO CORRIÓ`.** *Confirmado a medias: `test_clinico.mjs`
  imprime la línea `RESULTADO: n/m` en los dos caminos (con y sin fallas), así que el chequeo es
  posible. El chequeo en sí vivía en el scorer, que no está versionado — ⚠️ no verificado: no hay
  código vigente donde confirmarlo.*
- **Procesos `cdp.mjs` que no salen.** `cdp.close()` + `proc.kill()` **no alcanzan**: el servidor
  HTTP sigue escuchando y el event loop vivo. Hay que cerrar el servidor y `process.exit(0)`. Se
  juntan zombies reteniendo su Chrome y un A/B encadenado nunca llega al segundo lado: parece
  lentitud, es un cuelgue. **Revisar `ps` antes de culpar al A/B** — y cuidado con el `pkill`, que
  se lleva la corrida en curso. *Regla del proyecto, no re-verificada en este pase: aplica a las
  sondas ad-hoc; `test_clinico.mjs` sí cierra el servidor y mata Chrome en su `finally`.*
- **El pendrive `DISK_IMG` fantasma.** Si se desmonta a mitad de corrida, `readdir` **sigue
  contestando de caché** y `readFile` revienta. Mientras el pendrive esté afuera, los casos que
  dependen de él **no prueban nada y no son cobertura**: hay que decirlo al reportar el total.
  *Confirmado en el código: cuatro fixtures leen `/Volumes/DISK_IMG` (override `ECO_PENDRIVE`) y
  el fixture `PENDRIVE` se interpola en 14 casos, más tres usos de `DOPPLER`, `FIJA_ESC` y
  `DOP_VEL`. La cifra de 17 casos que usa el proyecto es compatible con eso — ⚠️ no verificado: no
  conté caso por caso cuántos quedan realmente sin medir con el volumen desmontado.*
- **No medir en Chrome mientras corre un barrido de mutaciones.** Da una medición falsa y
  plausible: la sonda lee un árbol que otro proceso está reescribiendo. Antes de medir,
  `diff index.html /tmp/index.orig.html`.
- **Denominador.** Una sonda sobre una tabla colapsada, una lista sin paciente seleccionado o un
  `render()` que salió temprano devuelve cero y **parece seguro**. Confirmar que había algo que
  contar. *Confirmado en el código: varios casos traen condiciones rotuladas `DENOMINADOR:` y hay
  comentarios de casos que fijan su propio denominador por esta razón.*
- **Aislamiento: «pasa con `--solo` y falla en el suite».** Síntoma recurrente —los casos corren en
  una sola página— documentado más de media docena de veces en los comentarios del archivo. Si un
  caso verde aislado se cae en la suite, el sospechoso es el estado que dejó otro caso, no la app.
- **TC-223 es el único rojo documentado** de la suite: falla por la fecha. **Cualquier otro rojo es
  una regresión**, no «la línea base». Línea base del proyecto: **351/352** y Semgrep 125 / 0 ERROR.
  *Confirmado: `TC-223` existe y es el caso de importación de un estudio desde Orthanc. El total no
  lo re-verifiqué — `grep` cuenta 356 registros `caso('TC-…')` en el archivo a 5137c30 — ⚠️ no
  verificado: no corrí la suite en este pase, así que no sé si la diferencia con el 352 son casos
  agregados después de esa medición.*
