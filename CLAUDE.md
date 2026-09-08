# EcoSmart — trampas de este archivo

Leer esto antes de tocar `index.html`. Son cosas que ya costaron una sesión cada una;
ninguna es evidente leyendo el código alrededor.

## Arquitectura

- **Un solo archivo**, **1,75 MB / 31.233 líneas** (medido 2026-09-08). HTML + CSS + JS
  inline, sin build, sin dependencias externas más allá de jsPDF, XLSX y PptxGenJS por CDN.
  No confundir con los **1,24 MB / ~21.000 líneas del JS extraído**, que es lo que escanea
  Semgrep: `scan.py` saca el JS de los `<script>` antes de analizar, así que sus números de
  línea NO son los del archivo. Para ubicar un hallazgo hay que buscar el fragmento con
  `grep`, no sumarle un offset.
- **`CeiboStore` es el borde de confianza para los id de informe.** El saneo va ahí, no en
  las plantillas: cinco funciones leen `CeiboStore.getLocal()` directo sin pasar por
  `getInformes()`, así que arreglar `getInformes` deja esas cinco afuera, y una plantilla
  nueva reabre el agujero.
- **`amiloSanPDFml` es la función correcta para texto multilínea en el PDF.** `amiloSanPDF`
  es la de una sola línea.
- **El extractor de JS falla siempre en los bloques 0 y 1.** Cualquier chequeo de sintaxis
  que los recorra va a reportarlos como rotos y no lo están: es el extractor, que corta mal
  por un `</script>` dentro de una cadena. Comparar SIEMPRE contra HEAD antes de creerle a
  un resultado. `CeiboStore` vive en el **bloque 8**, que sí se valida.

## Trampas

### `amiloSanPDF` borra los `\n`
Su catch-all es `[^\x20-\xFF]`, o sea que se lleva puesto el salto de línea, y además
termina en `.trim()`. Aplicada de una pasada a `informeTxt` o `sumaTxt` —que son
`inf.join('\n')`— pega todos los párrafos en un bloque corrido. Usar **`amiloSanPDFml`**,
que sanea línea por línea y conserva la sangría.

### `render()` sale temprano
Tiene un `if(!tablExpanded) return;` antes de poblar `tbody`. Un test que mida `#tbody` con
la tabla colapsada da **cero handlers y cero scripts sobre un contenedor vacío**: falso
negativo perfecto. Poner `tablExpanded = true` y mostrar `#tbl-wrap` antes de medir, y
contar las filas para confirmar que hay denominador.

### `renderSeguimientoLista` lee por clave de paciente
No hay ninguna global `coSeguimiento` que sirva para el test: la función arma la clave con
`_coPacienteKey()` a partir del nombre/documento cargado y busca `co_seguimiento[clave]`.
Setear una variable global no ejerce el sink; hay que setear `#nombre`, pedir la clave y
escribir el store indexado por ella.

### `typeof` sobre un `const` en zona muerta **lanza**
No devuelve `'undefined'`. Si una sentencia de nivel superior hace `typeof X` y `X` es un
`const` declarado más abajo, tira `ReferenceError` — y al ser nivel superior se lleva puesto
todo el resto del bloque `<script>`. Como las funciones se hoistean, la app arranca con la
interfaz completa y sin estado, sin más rastro que una traza. Ya pasó con `DCM_RANGO`.
Solución: función perezosa que resuelva en la primera llamada, o mover la declaración.

### Los reemplazos por rango de líneas son peligrosos
Usar **siempre anclas de texto único** y `assert` de que la ancla aparece exactamente una
vez. Un reemplazo por índice borró 106 líneas —`_lsLocal`, `_lsChunks`, `_lsGuardar`,
`_idbGuardar`, `_idbLeer`, `_abrir`: la capa de persistencia entera— y **`node --check` lo
dio por bueno**, porque sólo valida sintaxis y el archivo seguía siendo JS válido. Se
detectó recién en el navegador, con `CeiboStore` dando `undefined`. Después de un cambio
grande, mirar `git diff` y contar las líneas eliminadas.

### `getLocal()` devuelve el array **vivo**
No es una copia. Un `CeiboStore.getLocal().push(x)` escribe directo en el caché interno y
esquiva el saneo de id. Hoy todos los llamadores son de sólo lectura o hacen `.slice()`,
pero nada lo obliga. Si hace falta modificar, `.slice()` primero y volver por `setLocal`.

### `window.eeIncluirPDF` — y por qué sacarlo no alcanzó
Se quitó el export explícito el 2026-09-08. **Ojo con la intuición**: eso NO volvió
inalcanzable la función, porque una declaración de función en el nivel superior de un
`<script>` clásico ya crea la propiedad en `window`. Medido: después de sacar la línea,
`typeof window.eeIncluirPDF` sigue dando `'function'`. El export era redundante.
Lo que mantiene inerte el bloque de Eco Estrés es otra cosa: el toggle `ee-incluir-pdf` no
existe en el DOM y al arrancar se borra la bandera `ecoestres_incluir_pdf`. **No volver a
agregar el export**, y si algún día hace falta cerrarlo de verdad, envolver el bloque en un
IIFE o borrarlo.

### `badge(cls, txt)` — verificar la allowlist contra el CSS
La lista de clases permitidas tiene que salir de `grep` de las clases `.badge-*` que
realmente existen, no de suponerlas. Una primera versión omitió `orange` y `yellow` —57
llamadas— y las habría pintado de gris: un badge de alerta degradado a uno neutro es una
regresión de señal clínica, no un detalle visual.

### Semgrep: 118 warnings, 106 son ruido
El triage completo del 2026-09-08 dio **106 falsos positivos / 12 reales**. Los falsos
vienen del patrón `innerHTML +=` con resultados numéricos (`.toFixed()`, `Math.round`,
`.length`) y con constantes de las tablas de referencia del propio archivo. Los 12 reales
compartían una sola causa —el id sin sanear— y están **cerrados por construcción en
CeiboStore**; siguen apareciendo en el conteo porque las reglas son sintácticas y no ven el
saneo del borde. **No "arreglar" los 106 restantes sin triagearlos de nuevo**: la mayoría
son correctos como están.

## Tests de regresión

`tests/regresion.json` tiene dos pacientes. **Correr los dos en el navegador antes de cada
commit** que toque renderizado, escapes, el store o el PDF.

- **Paciente 1 — envenenado.** Cuatro campos malformados, uno por contexto de inyección.
  Se espera: cero ejecuciones, cero atributos de evento, cero elementos inyectados, los
  campos visibles como texto literal, y el id reparado a un `number` en la banda ≥ 9e14.
  No hay que assertar el número exacto: es determinista para un contenido dado, pero el
  contrato es «number y en la banda».
  No entra por el import JSON —`validarInformeImportado` lo rechaza— así que hay que
  escribirlo con `CeiboStore.setLocal([...])`. Eso es correcto: la escritura directa es
  justamente el vector que queda abierto.

- **Paciente 2 — legítimo con extremos.** Sirve para detectar la defensa que se pasa. Se
  espera: el nombre `O'Brien & Cía <Cardiólogo>` visible **tal cual** (si se ven entidades
  hay doble escape), y **FEVI 0 y edad 0 visibles como `0`, no como celda vacía** — ese es
  el caso que protege el cambio de `escHtml` a `String(s ?? '')`.

El JSON lista además los cinco sinks a verificar y cómo montar cada vista sin caer en el
falso negativo del contenedor vacío. **Antes de contar cualquier resultado, confirmar que la
vista renderizó**: contar filas, ítems o bytes. Un cero sobre cero elementos no prueba nada.

## Rangos de importación

`DCM_RANGO` y `LAB_XLS_RANGO` **asumen paciente adulto**. Un seno aórtico neonatal (~6-9 mm)
cae bajo el piso de 10 mm y la fila se rechaza entera. Está documentado en el propio código,
arriba de `DCM_RANGO`, con la lista de campos afectados. No bajar los pisos: son los que
atrapan un `1,2` escrito por `12`. Si hace falta pediatría, rango por franja etaria usando
el campo `edad` que ya está en el mapa de Excel.

Los tamaños de CIA/CIV y los diámetros de TSVD/TSVI **no tienen rango en ninguna tabla**.
