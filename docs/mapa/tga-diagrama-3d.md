# El diagrama 3D de la transposición de las grandes arterias — tanda TGA (2026-10-31)

Mapa por **nombre de función y de constante**, no por línea. La línea cambia en cada edición; el
nombre, no.

Lo que esta tanda agregó: **un campo guardado** (`tga_cirugia`), **un valor nuevo de un campo que
ya existía** (`tga_tipo = dtga`), el **diagrama 3D** portado de la demo aprobada, y la cirugía
realizada en el informe y en el EN SUMA. Lo que **paró** está en `docs/PENDIENTES.md` → `TGA-a` a
`TGA-g`.

---

## 1 · Los dos ejes, y por qué hacía falta un valor nuevo

`tga_tipo` trae la anatomía y la cirugía **fusionadas**: `mustard` y `senning` son a la vez
«d-TGA» y «switch auricular». La demo aprobada
(`docs/3d/demo_tga_3d_esquema_aprobado.html`) necesita los dos ejes por separado:

| eje | valores de la demo | de dónde salen hoy |
|---|---|---|
| anatomía | `norm` · `dtga` · `ltga` | `tga_tipo`: `dtga` → `dtga`; `cctga` → `ltga`; `mustard`/`senning` → `dtga`. `norm` NO es un dato: es un botón de vista de referencia |
| cirugía | `none` · `mus` · `jat` · `ras` | `tga_cirugia` (`ninguna`, `auricular`) con `dtga`; derivada del tipo con `mustard`/`senning`. **`jat` y `ras` están PARADOS** |
| comunicaciones | CIA o FOP · CIV · DAP | **no tienen campo propio acá**: se leen de sus pestañas |

**`tgaEjes(src)` es el dueño único** de deshacer esa fusión, y lo leen el diagrama, la línea de
texto de la hoja del PDF, `tgaCirFrase` y el informe. Devuelve
`{ tipo, anat, cir, cirDeTipo, cirIgnorada }`. Con la derivación copiada en cada consumidor, un
`mustard` podría dibujarse como un switch y describirse como otra cosa en el mismo estudio.

⚠️ **Con L-TGA la cirugía NO se aplica, y lo decide la demo**, no esta app: su `scenario()` hace
`var o=(a==='dtga')?op:'none'`. El valor cargado **no se borra** —nada automático escribe en el
estudio— y se informa como `cirIgnorada`.

⚠️ **`jatene` y `rastelli` NO están en el vocabulario, y no es un olvido.** En los dos el
ventrículo sistémico es el **izquierdo**, y `tgaConclusion` abre el informe **firmado** con «el
ventrículo derecho es el ventrículo sistémico» más tres oraciones que dependen de eso
(«Función del ventrículo derecho sistémico…», «Diámetro basal del ventrículo sistémico…»,
«Insuficiencia de la válvula auriculoventricular sistémica…»). Publicarlos exigía reescribir
frases del informe → `TGA-a`.

## 2 · Las comunicaciones: un dato, una puerta

`tga3dComs(src)` las lee de los módulos que ya existían. **Cero campos nuevos**, que es la
condición expresa de la orden del médico.

| comunicación | sección | campos que se leen |
|---|---|---|
| CIA | `sacc-cc-shunt` → sub-pestaña «CIA» | `ete_cia_tipo`, `ete_cia_tam_max`, `ete_cia_tam_min` |
| FOP | `sacc-cc-fop` | `fop_tunel` (**numérico**, longitud en mm), `fop_shunt_reposo`, `fop_shunt_valsalva` |
| CIV | `sacc-cc-shunt` → «CIV», y la propia TGA | `ete_civ_tipo`, `ete_civ_tam`, `tga_civ_residual` |
| DAP | `sacc-cc-dap` | `dap_tipo`, `dap_diam` |

⚠️ **El predicado del FOP NO es el `hayDato` de `fopConclusion`, a propósito.** Ese lo llena
también un test de burbujas **negativo** —que es justo como se **descarta** un foramen oval—, así
que usarlo habría dibujado una comunicación interauricular sobre un paciente en el que el médico
acaba de descartarla. Acá cuenta que la comunicación **exista**: un túnel medido (no se mide el
túnel de un foramen que no está) o un shunt documentado.
⚠️ Y `fop_tunel` se lee con `_nv` y **no** con `_sv`: es un campo numérico. Leerlo como texto
funcionaba por casualidad y lo destapó el caso de prueba.

## 3 · El motor del dibujo

| pieza | qué hace |
|---|---|
| `TGA3D_URL` · `TGA3D_SRI` | three.js **r128** de cdnjs, con su hash SHA-512 |
| `tga3dBoot()` | la carga diferida, con `integrity`, `crossorigin` y `referrerpolicy`; su `onerror` cubre **sin internet** y **hash que no coincide** |
| `tga3dEscena(anat, cir, sh)` | la geometría, **portada de la demo sin reinterpretar**; devuelve `{ch, ar, fl, ex, lb}` |
| `_T3` · `_t3cat` | los arrays de puntos y el concatenador que deduplica, los de la demo |
| `tga3dInit()` | la escena de three.js; se crea una vez |
| `tga3dSync()` | el embudo: lee los datos, decide si hay dibujo, reconstruye. Lo llama `tgaSync` |
| `tga3dIncluirPDF()` | el interruptor, por la función común de imágenes |
| `tga3dLineaPDF()` | la línea de texto de la hoja del PDF: **sólo lo cargado**, sin conducta ni cita |
| `_tga3d` | el estado del dibujo. **Nada de esto se persiste** |

### El hash SRI, y por qué va
La app pone `integrity` en sus **seis** scripts de CDN. Sin él el navegador ejecuta lo que sea que
devuelva el CDN, y este script corre con acceso total a los datos del paciente. Verificado el
2026-10-31 por **dos caminos independientes**, y coinciden:

```bash
curl -s "https://api.cdnjs.com/libraries/three.js/r128?fields=sri"
curl -s "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" \
  | openssl dgst -sha512 -binary | openssl base64 -A
```

Al subir de versión hay que recalcular el hash. Si queda viejo, el navegador **descarta el script
en silencio** y el dibujo no aparece.

### ⚠️ Un defecto latente de la demo, arreglado acá
El reloj que `requestAnimationFrame` pasa es el del **comienzo del cuadro**, y puede ser anterior
al `performance.now()` que se toma antes de construir la geometría: el primer `dt` sale
**negativo**, `flowT` se va por debajo de cero y `getPointAt` recibe un parámetro negativo.
three.js no lo valida: entra en `getUtoTmapping`, sale con un índice fuera de rango y revienta con
**«Cannot read properties of undefined (reading 'x')»** dentro de la librería minificada — un error
de consola que parece de la librería y es del reloj. Pasa **una vez**, en el primer cuadro, y
después nunca más, que es lo que lo hace difícil de ver.

Tres guardas, y las tres hacen falta: `Math.max(0, …)` sobre `dt`, el doble módulo de `u`, y el
reloj puesto en hora **justo antes** de arrancar el bucle.

### ⚠️ `offsetParent` no detecta el acordeón plegado
`secToggle` cierra con `max-height:0` y `overflow:hidden`, dejando el `display` en block, así que
con la sección **cerrada** el predicado daba `true` y la librería se bajaba igual. La decisión del
médico dice «sólo al abrir la sección de la TGA», y sin la pregunta por la clase `open` la garantía
era «al abrir la pestaña». `_tga3dVisible()` le pregunta a esa clase.

### Los controles, y por qué no son campos del estudio
Los seis van con prefijo **`tga-3d-` y guión medio**, declarado en `_noEsDelEstudio`.
`guardarInforme` barre `input[id]`, `select[id]` y `textarea[id]`: sin el prefijo, «Ver por
dentro», la frecuencia del latido y el resto se persistirían como campos del estudio — seis claves
nuevas en **todo** estudio que se guarde desde hoy. Es lo que el A/B destapó con `vab-anim-scrub`.

**«Corazón normal» es un botón de vista de referencia** (decisión del médico): se prende y se
apaga, no escribe nada, y **no se puede incluir en el informe** —un corazón normal dentro del
informe firmado de un paciente con transposición se lee como el hallazgo del estudio—.

**Con `prefers-reduced-motion` arranca quieto** y lo arranca el médico: el cuadro se dibuja igual
—`build` hace su propio `render`—, lo que no corre es la animación.

## 4 · El PDF

`PDF_DIAG_REG` gana una fila: `{ k:'tga3d', w:1, fam:'cc', lbl:'Transposición de grandes arterias
— esquema 3D' }`. Familia `cc` por el mismo motivo que la CIA: su lugar natural es **debajo del
texto de congénitas** (R-4).

⚠️ **El recolector va ANTES de la hoja de congénitas, y es por el orden de ejecución.** Esa hoja
lee `_dg` unas cuatrocientas líneas más abajo pero **antes** del bloque de la orejuela, así que un
diagrama de familia `cc` recogido ahí llegaría tarde a su propia hoja y caería al motor de tercios
como si no tuviera texto bajo el cual ponerse.

⚠️ **La exclusión de la familia `cc` pasó de una BANDERA a una LISTA.** El comentario del motor
decía «agregar otro congénito no toca este bloque» y era **falso por un renglón**: la exclusión
estaba escrita `k === 'cia' && _ciaEnSuHoja`, así que un segundo congénito se estampaba debajo del
texto **y** volvía a entrar al motor — el mismo dibujo **dos veces** en el informe firmado. Hoy es
`_ccEnSuHoja`, un array.

### La función común de imágenes
`_esqPonerSlot(clave, nombre, dataURL)` es el **único** lugar donde se coloca el slot, y lo llaman
`esqIncluirEnPDF` (que recibe un `<svg>` y lo rasteriza) y `esqIncluirEnPDFImg` (que recibe un
`dataURL` ya hecho, que es lo que tiene un lienzo de WebGL). Con el cuerpo copiado, un arreglo al
reemplazo del slot, a la conservación de la estrella o a la invalidación del índice llegaría a una
de las dos y no a la otra.

⚠️ **`preserveDrawingBuffer: true` hace falta.** Sin él, `toDataURL` sobre el lienzo de WebGL
devuelve un PNG **en blanco** en cuanto el navegador ya limpió el buffer, y «Incluir en el PDF»
habría guardado una imagen vacía sin un solo error de consola. La demo se salva porque rasteriza
inmediatamente después de un `render`; acá el guardado puede llegar en cualquier momento.

## 5 · La cirugía en el papel

`tgaCirFrase(src)` es el dueño único, y lo leen el cuerpo del informe, el `resumen` del EN SUMA y
la línea de `ccSumaLinea`. **Que se diga una sola vez es por construcción**: devuelve cadena vacía
para `mustard` y `senning`, que ya dicen la cirugía en su propio rótulo. Es el defecto que la tanda
E pagó con el Carpentier, que se decía hasta **tres** veces en el mismo informe firmado.

**Sin dato no dice nada.** «Sin dato» no es «sin cirugía», y un informe que afirme que el paciente
no se operó porque nadie contestó la pregunta sería una afirmación inventada.

| escena | cuerpo del informe |
|---|---|
| `dtga` + sin dato | «Transposición de grandes arterias completa (d-TGA): …» |
| `dtga` + `ninguna` | «… completa (d-TGA) **no operada**: …» |
| `dtga` + `auricular` | «… completa (d-TGA) **operada, con switch auricular (Mustard o Senning)**: …» |
| `mustard` / `senning` | «… post-Mustard: …» — sin frase agregada |
| `cctga` | «… congénitamente corregida (ccTGA): …» — sin frase agregada |

## 6 · El Excel

Una columna nueva: **«TGA cirugía realizada»**, 440 → **441**. Va escrita como la **última clave**
de `_labExcelRow` y como la **última entrada** de `LAB_XLS_MAP`. El lugar que ocupa en la planilla
lo decide `_labOrdenarCols`, que primero recorre el mapa en su orden y **después** reagrupa por
bloque: la columna sale **última de su bloque** —«15 · CARDIOPATÍAS COMPLEJAS», por el prefijo
«TGA» que ese bloque declara— y ninguna de las 440 anteriores cambia de encabezado ni de orden
relativo, medido contra HEAD con `_labOrdenarCols` en los dos árboles.

⚠️ **Es la última de SU BLOQUE y no la última del archivo**, porque forzar eso exigía un bloque
nuevo o un nombre que no matcheara ningún prefijo.

Round-trip: `LAB_XLS_ETIQ`/`TGA_CIR_XLS` exportan la etiqueta legible, y `LAB_XLS_VOCAB.tga_cirugia`
y `LAB_XLS_VOCAB.tga_tipo` la vuelven a entrar. **El valor nuevo del tipo entró con sus alias en el
mismo commit**: sin eso, el round-trip de un Excel exportado con «TGA completa (d-TGA)» se
**rechaza con error**, no se ignora.

## 7 · Trampas de medición que esta tanda pagó

1. **La sección de la TGA vive en `#tab-congenitas2`**, la sub-pestaña «CC complejas», no en
   `congenitas`. Abrir sólo la primera deja todo el árbol bajo un `display:none`: `offsetParent`
   da null, **todo** `getBoundingClientRect` da 0×0, y el diagrama parece no existir. Hay que
   tocar el botón de la pestaña **y** el de la sub-pestaña.
2. **El acordeón de la TGA ya viene abierto** al entrar a esa sub-pestaña: un click a ciegas lo
   **cierra**, y entonces el diagrama no carga.
3. **`page.evaluate(cadena, arg)` descarta el argumento** — queda `undefined` de los dos lados y
   dos resultados vacíos comparan iguales. Para inyectar el `scenario()` de la demo se usa
   `addScriptTag`.
4. **Una barra invertida simple dentro de un template** llega al navegador como el carácter
   literal: `/[ \t\n\r]+/g` escrito con una barra deja un salto de línea **real** dentro del
   literal de expresión regular y revienta con «Invalid regular expression: missing /».
5. **`VINFO` es una constante de nivel de script y no está en `window`.**
6. **El acento grave dentro de un comentario** del cuerpo de un caso o de una sonda: el cuerpo es
   un template literal. `check_backticks.py` no lo caza; **`node --check` sí**.

## 8 · Dónde está lo demás

- La comparación con la demo: `scripts/_probe_tga2demo.mjs` (extrae el `scenario()` de la demo y
  lo compara campo por campo).
- El diagrama en el navegador: `scripts/_probe_tga2.mjs`.
- Los campos: `scripts/_probe_tga1.mjs`. El papel: `scripts/_probe_tga3.mjs`.
- El A/B de superficies: `scripts/_probe_tga1ab.mjs`.
- Las mutaciones: `scripts/_mut_tga.py`.
- Las fichas de los casos: `docs/mapa/tests-fichas-561.md`.
- El experimento del bucle del PPT: `scripts/_exp_pptbucle.py` y
  `scripts/_exp_pptbucle_gen.mjs` → `docs/PENDIENTES.md` → `TGA-f`.
