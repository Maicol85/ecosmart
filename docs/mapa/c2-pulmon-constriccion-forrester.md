<!-- mapa armado sobre el HEAD de la tanda C2, 2026-10-28; sin números de línea a propósito -->
# El eco pulmonar, los dos textos de constricción, el botón retirado y el Forrester — tanda «C2»

Mapa de la zona. **Por nombre de función y de id, no por número de línea.**

---

## 1 · El eco pulmonar: de dónde sale cada palabra

| Qué | Quién lo decide | Dónde sale |
|---|---|---|
| La separación pleural → volumen | **`_balikVol(bk)`** — `ml = mm × 20`, con la guarda de 1-120 mm | única cuenta de toda la app |
| La frase del volumen | **`_balikFrase(bk)`** | informe **y** EN SUMA, por `_balikDet` |
| Las oraciones del cuerpo | **`pulAvFrases()`** — pleura, líneas A, líneas B, derrame, consolidación | bloque **13c** de `generarInforme` |
| Las líneas del EN SUMA | **`pulAvSuma(omitir)`** | el mismo bloque 13c |
| El patrón global | **`pulAvPatron()`** → `{p, i}` | **sólo pantalla**: `pua-patron` y `pua-patron-interp` |
| La compuerta del informe | **`pulAvanzadoHayDatos()`** | el bloque 13c |

### Lo que la C2 cambió, uno por uno

- **El rótulo del campo** pasó de «Balik (mm)» a **«Distancia máxima entre pleuras (mm)»**. El id
  sigue siendo `pua_balik`, el campo guardado `pul_balik` y la cuenta no se movió.
- **La frase del volumen** dice «volumen estimado por ecografía de aproximadamente X ml», **sin
  autor**. La usan el cuerpo y el EN SUMA: son los dos únicos consumidores de `_balikFrase` y
  `_balikDet`, y dos redacciones del mismo volumen en el mismo documento firmado sería peor.
- **El EN SUMA pone el derrame antes que la consolidación**, en dos entradas separadas. Los dos
  bloques de `pulAvSuma` estaban al revés y el 13c los pegaba con un `join(' ')`.
- **El informe publica una línea por hallazgo** (`pulAvFrases().forEach(x => inf.push(x))`), no un
  párrafo. Esto **revierte a propósito** lo que el B-E3 había unificado: decisión de Maicol.
- **La línea «Patrón global: …» salió del papel.** Sigue en pantalla.
- **El bloque «Eco Pulmonar» del ETT Avanzado se retiró entero.**

> ⚠️ **«Correlacionar con la clínica» vive en el `i` de la rama «Indeterminado» de `pulAvPatron`**,
> y su **única** vía al papel era la línea «Patrón global». Al sacarla, la frase quedó sólo en
> pantalla sin tocar una palabra del texto. El EN SUMA nunca la llevó: `pulAvSuma` empuja `r.p`,
> no `r.i`.

---

## 2 · El retiro del bloque de ETT Avanzado, y las cuatro cosas que se fueron con él

Censado **antes** de retirarlo:

| Pieza | Qué era | Qué pasó |
|---|---|---|
| La entrada `pulm` de **`amiloSecs`** | `gen: amiloTextoPulmonar`, `enCuerpo: true` | **retirada** |
| **`amiloTextoPulmonar`** | `pulAvFrases()` + «## En suma» + «Patrón global» | **retirada** (su único llamador era esa entrada) |
| El textarea **`am-txt-pulm`** | lo construía `amiloBuildCard` desde el registro | desaparece con la entrada; **el censo de campos baja uno** |
| El botón **«📎 Integrar al informe»** de la pantalla pulmonar | `data-am-k="pulm"` | **retirado** |
| La diapositiva **«Ecografía Pulmonar»** del PPT | leía `am-txt-pulm` | **retirada** |
| **`pulAvanzadoIntegrado`** y su `window.X = X` | el predicado de la compuerta | **retirados** |
| `amiloRefrescarSiIntacto('pulm')` en `pulAvUI` | mantenía la tarjeta al día | **retirado** |

> ⚠️ **NO HABÍA HOJA DEL PDF QUE RETIRAR.** `enCuerpo: true` ya hacía que el armador la
> descartara desde el AJ2-9: se verificó en `_enCuerpo` del armador antes de tocar nada.

> ⚠️ **RETIRAR LA ENTRADA SIN TOCAR LA COMPUERTA HABRÍA DEJADO EL INFORME MUDO SOBRE EL PULMÓN.**
> `pulAvanzadoIntegrado` preguntaba por `amiloEnInforme`, o sea por el registro; sin la entrada,
> el predicado quedaba **falso para siempre**. Es el modo de falla que el propio registro ya
> advertía para `omitir`. Por eso la compuerta pasó a ser `pulAvanzadoHayDatos()`.

> ⚠️ **EL PRECIO, DECLARADO: el médico pierde el interruptor.** Hasta la C2 podía cargar el
> módulo y no publicarlo; desde la C2, cargado es publicado. Medido: un estudio con eco pulmonar
> cargado y sin integrar pasa de informe mudo a informe con sus líneas. → `PENDIENTES.md` **C2-a**.

> ⚠️ **Y UNA REGRESIÓN QUE DESTAPÓ EL A/B DEL MISMO COMMIT.** `_ccMods` cuenta los módulos
> integrados y `pulm` era uno; retirado el bloque, un estudio cuyo **único** hallazgo es pulmonar
> y no sube al EN SUMA salía con «Estudio sin alteraciones estructurales ni funcionales
> significativas» mientras el cuerpo decía «Deslizamiento pleural reducido en ambos hemitórax».
> Se cerró con **`ccMarcarParrafo()`** dentro del `forEach` del 13c. Es el defecto que ese helper
> existe para cerrar, y que este repositorio ya documenta para las válvulas.

**Estudios ya guardados: no se migró nada.** Los que tengan `am-txt-pulm` en sus campos lo
conservan y al reabrirlos ese texto queda sin lector; el contenido pulmonar vuelve a salir solo,
compuesto desde los campos `pua_*` que el mismo estudio guarda.

---

## 3 · Constricción vs restricción: los dos textos al globo

El módulo vive en **Hemodinámica**, en modo avanzado — **no** en Pericardio.

| Texto | Dónde estaba | Dónde está |
|---|---|---|
| El 0,78 con su sensibilidad, su especificidad, el apartado 11.9.3 y la Figura S1 | letra chica debajo de `cvr_hep_coc` | tarjeta **`cvr-coc`** |
| Los dos cortes del HFA-PEFF, el folio 3303 y las reglas de conteo sin fuente | bloque «Criterio de EcoSmart» debajo de `cvr-concl` | tarjeta **`cvr-ecosmart`** |

En pantalla quedó **una línea corta** en cada lugar, con su globo ⓘ al lado.

- **Ningún corte, recuento, veredicto ni lectura cambió.** Medido: `cvr-coc-eval` dice
  «0,79 — por encima de 0,78» y «0,78 — no supera 0,78» igual que antes, y `cvr-concl-badge` y
  `cvr-conteo` no se mueven al escribir el cociente.
- **Se fue el «NO» en mayúscula** de «NO son cortes de la distinción» (regla R3).
- **Ninguna de las dos lleva entrada en `VINFO_REF`**, a propósito: el cociente de la vena
  suprahepática y el e′ medial ya tienen su ficha en Referencias, a la que la segunda tarjeta
  manda con sus palabras. Las tarjetas sin botón suben de **diecisiete a diecinueve**.
- El registro `VINFO` pasa de **58 a 60** entradas.

---

## 4 · El botón «↓ Traer del formulario», retirado

Se fueron los **cuatro** botones —RWT, E/e′, TAPSE y SGL—, **`amTraerDeFormulario`**,
**`amAutoLlenar`** y sus dos `window.X = X`.

**Por qué, medido en el D-11 y no supuesto:** desde que el reflejo en vivo manda (D-9 y D-11),
cada insumo del módulo vale lo que dice su fuente en todo momento, así que al apretar el botón no
quedaba nada vacío que llenar. `amAutoLlenar` devolvía `false` en los cuatro criterios y de 22
valores fotografiados no cambiaba ninguno. Y como devolvía `false`, el aviso decía «No hay datos
suficientes cargados en las otras pestañas» **justo cuando estaban todos cargados**.

**Lo que NO se tocó**, verificado uno por uno: el score y su marcado automático, el pasaje al
algoritmo diagnóstico, la sincronización en los dos sentidos, el tercer estado de origen
(`manual` / `nomanual`) y la etiqueta del botón violeta.

> ⚠️ **LA MARCA `data-espejo = '1'` NO SE PIERDE.** La ponía `amAutoLlenar` y la pone también
> `_amiloReflejarDesdeApp`. Censado: son los **tres** únicos lugares de la app que la escriben, y
> el tercero es el espejo de los campos `*_ro`.

Los botones de clase `crit-calc-btn` bajan de **nueve a cinco**.

---

## 5 · El Forrester: un clasificador, dos constantes

```
forrCuadrante(ic, pcp)          ← EL ÚNICO dueño de los dos operadores
  humedo = pcp >  UMBRAL_PCP_HUMEDO   (18)   → 18 EXACTOS NO son congestión
  frio   = ic  <= FORR_IC_CORTE       (2,2)  → 2,2 EXACTOS SÍ son hipoperfusión
  → 'I' | 'II' | 'III' | 'IV'
```

**Sus tres consumidores:** la cápsula `hemo-forrester` de `calcHemo`, el gráfico de la pestaña de
Hemodinámica (`_labForrSVG` por `hemoForrGrafSync`) y el diagrama del Laboratorio (`_labICPCP`).

> ⚠️ **LA CÁPSULA TENÍA SU PROPIA CASCADA, Y ERA LA TERCERA COPIA DE LA REGLA.** Escribía
> `const frio = ic < 2.2;` como **literal**, sin leer `FORR_IC_CORTE`, así que mover la constante
> cambiaba el gráfico y los dos diagramas y dejaba **esta línea** —la que viaja al informe
> integrado, a la hoja del PDF y al PPT— clasificando con el número viejo. El C1-4a había
> extraído `forrCuadrante` justo para eso y la cápsula se había quedado afuera.

**El vocabulario se queda en cada superficie** (4e, sólo reportado):

| Vocabulario | Quién lo usa |
|---|---|
| **A / B / L / C** | la cápsula `hemo-forrester` y, por ella, el informe integrado, la hoja del PDF y el PPT |
| **I / II / III / IV** | `forrCuadrante`, `_labICPCP` / `_labForrester`, el gráfico y el diagrama del Laboratorio |

El mapa entre los dos vive **dentro de `calcHemo`** y no en un `const` de nivel superior: `calcHemo`
y `forrCuadrante` están en bloques `<script>` distintos, y un `const` de nivel superior no llega al
otro bloque —sólo llegan los `window.X = X`—. Es la zona muerta que este repositorio ya documenta
como «aborta el script entero».

### El inventario de cortes (4a), y lo que NO se movió

| Constante / literal | Valor | Quién lo usa | Se movió |
|---|---|---|---|
| `UMBRAL_PCP_HUMEDO` | **15 → 18** | `forrCuadrante`, el pie del diagrama del Laboratorio, el pie del PPT y la anotación «con congestión (PCP >N)» de `hemo-perfil` | **sí** |
| `FORR_IC_CORTE` | 2,2 | `forrCuadrante` y el eje del SVG | no (cambió su **operador**) |
| `ic <= 2.2` en `_icBanda` | 2,2 | la cápsula `hemo-ic` y el bloque POP | no — ya usaba `<=` |
| `ic < 2.2` ×3 en `hemo-perfil` | 2,2 | shock cardiogénico / distributivo / mixto, cruzando IC con **RVS** | **no** — otro criterio |
| `pcp <= 15` ×3 | 15 | clasificación **pre/poscapilar** de HTP | **no** — es la definición de HTP poscapilar de la ESC/ERS 2022 |
| `pcp < 12` / `pcp > 18` | 12-18 | precarga del **posoperatorio** | **no** — diseño del 18/09, excluido por la orden |

> ⚠️ **LOS TRES `pcp <= 15` COINCIDÍAN EN EL NÚMERO Y NO EN EL CRITERIO.** Hasta la C2 los dos
> cortes eran 15 y parecían el mismo escrito dos veces. Quedan como literales a propósito:
> extraerlos a una constante propia sería agregar un número nuevo.

> ⚠️ **LA ANOTACIÓN DE `hemo-perfil` SE MOVIÓ CON LA CONSTANTE, Y ES A PROPÓSITO.** Dice «con
> congestión (PCP >18)» desde la C2. No es el Forrester, pero dos cortes de congestión distintos
> en la misma pantalla se leen como un error de la app. → `PENDIENTES.md` **C2-b**.

### La fuente

**El artículo original de Forrester NO está en la biblioteca.** Censados los PDF uno por uno el
28/10/2026: los once que contienen «Forrester» son Diamond-Forrester o listas de autores. El 18 y
el 2,2 salen de **`docs/fuentes/FUENTES.md`**, leído **en imagen** de la Tabla 52-9 de Braunwald
(folio 1125), que reproduce a Forrester J, Diamond G, Chatterjee K, et al. *N Engl J Med*
1976;295:1356. **No se citó ninguna fuente nueva en pantalla.**

### Los dos textos (4c)

El ⓘ **`hemo-forr`** y la tercera línea de **`forrLin`** **ya describían 18 y «2,2 o menos» antes
de esta tanda, y eran falsos**: el código cortaba en 15 y en `< 2,2`. El C1 los midió y los dejó
sin tocar, con la discrepancia declarada en C1-a y C1-b. La C2 movió el **código** a lo que esos
dos textos dicen, así que desde hoy son verdaderos y **no hubo nada que reescribir**. Lo único que
se tocó son **dos mayúsculas de en medio** (regla R3).

---

## 6 · Dónde está lo demás

- La ficha de Referencias de eco pulmonar → `docs/mapa/j2-hemo-onco-amiloide-pulmon.md` §5.
- La pantalla pulmonar en cuatro columnas → `docs/mapa/aj6-fallot-pulmon-refs.md`.
- El módulo básico y su historia → `docs/mapa/otros-pericardio-pulmon.md`.
- El gráfico de Forrester de la pestaña de Hemodinámica → `docs/mapa/c1-hemodinamica.md`.
- El módulo de amiloidosis y sus dos puertas → `docs/mapa/d-cardioonco-amiloidosis.md` y
  `docs/mapa/d11-dos-puertas.md`.
- La ficha del caso **TC-545** → `docs/mapa/tests-fichas-545.md`.

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
