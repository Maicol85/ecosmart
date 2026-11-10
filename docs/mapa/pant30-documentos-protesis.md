# Mapa — Documentos del Informe y Prótesis valvulares en el Laboratorio (PANT-30, 2026-11-10)

Armado sobre el cierre de PANT-30. **Sin números de línea a propósito**: la línea cambia en cada
edición, el nombre de la función no.

Dos cosas distintas que la misma tanda agregó:
- **Parte A** — cuatro documentos que salen del botón «Documentos» del Informe.
- **Parte B** — una sección «Prótesis valvulares» en «Mediciones» del Laboratorio y en su PDF de
  auditoría.

El inventario de solo lectura que decidió las dos está en `docs/INVENTARIO_P30.md`; el manual
del médico, en `docs/DOCUMENTOS_P30.md`; la guía de prueba, en `docs/GUIA_PRUEBA_PANT30.md`.

---

## 1 · Parte A — una lista de bloques, UN maquetador, TRES emisores

Eso es todo el diseño, y es lo que impide que las tres superficies divergan.

```
DOC_DEFS[clave].bloques()      -> lista de bloques de TEXTO LLANO
        |
   docMaquetar(def, D, bloques) -> { hojas: [[op, ...], ...], n }   <- la UNICA geometria
        |
        +-- docRender()                   -> la hoja de PANTALLA (editable, datos en azul)
        +-- docOpsAPdf(def, maq)          -> el PDF que se imprime
        +-- docOpsASvg(maq) + esqRasterizar -> la imagen que va a «Imagenes»
```

Con tres emisores escritos a mano los tres divergen. Es la misma razón por la que
`teerEstado().papel` y `coaPapel` existen.

### Los tipos de bloque

| `t` | Qué dibuja |
|---|---|
| `enc` | institución a la izquierda, logo a la derecha (o un círculo con las iniciales) |
| `hr` | la raya bajo el encabezado |
| `tit` / `sub` | título centrado (cuerpo + 3 pt) y subtítulo en cursiva |
| `ciudadfecha` | «[ciudad], [fecha]» a la derecha |
| `pacid` | «Paciente: … · CI: …» a la izquierda, ciudad y fecha a la derecha |
| `sec` | título de sección, **numerado solo** (`nonum` lo exime), negrita, azul `#1f3a5f`, cuerpo + 0,7 pt |
| `p` | párrafo **justificado palabra por palabra** |
| `ul` | viñetas con sangría francesa; `fuerte` marca el prefijo en negrita |
| `raya` | la línea en negrita + la raya en blanco para escribir a mano |
| `chk1` / `chk2` | «☐ Sí ☐ No» con su texto; `chk2` en **dos columnas** |
| `firma` | 90 pt de aire, línea, nombre, «especialidad · Matrícula: n» |
| `tfirmas` | la tabla de tres columnas Paciente / Testigo / Médico |
| `salto` | fuerza hoja nueva |

### Las operaciones de dibujo

`{k:'t'|'c'|'r'|'c2', x, y, sz, b, i, col, s}` (izquierda, centrado, derecha, centrado en x),
`{k:'tw', y, ws:[{s,x}]}` (línea justificada, **palabra por palabra**), `{k:'l', x1, x2, y, y2}`,
`{k:'box', x, y, s}`, `{k:'rect', x, y, w, h, relleno}`, `{k:'circ', x, y, r, s}`,
`{k:'img', x, y, w, h, d}`.

### ⚠️ Cuatro decisiones que hay que respetar al tocar esto

1. **La justificación se calcula acá, palabra por palabra**, y no se delega al `align:'justify'`
   de jsPDF: delegada, el PDF conoce la posición de cada palabra y la imagen no, así que las dos
   superficies saldrían con cortes distintos.
2. **La casilla se DIBUJA, no se escribe.** El glifo U+2610 no existe en WinAnsi y además
   `splitTextToSize` lo mide con métricas inventadas y corre el corte de línea. Los **acentos sí**
   se conservan (WinAnsi llega a U+00FF); lo de arriba de U+00FF lo limpia `docSan`.
3. **`altoGrupo` mide la TINTA, no la `y` de cierre**, y esa diferencia decide una hoja: la `y`
   final incluye el margen que el último bloque deja detrás, y ese margen, al final de una hoja,
   no ocupa nada. Midiéndolo, el consentimiento de burbujas pasaba de hoja por **1,9 mm** de aire
   que no se imprime.
4. **El azul (`doc-dato`) es SOLO de pantalla.** El papel y la imagen dibujan de la lista de
   operaciones, donde esa clase no existe. Y se **deriva del texto** (`docMarcar`), no de una
   estructura paralela: por eso sobrevive a que el médico edite la hoja.

### El estado de la hoja, y el aviso

`_docEst[clave] = { bloques, editado, firma }`, **en memoria** (→ `P30-a`).
`docFirmaDatos(D)` es la huella de los datos con los que se armó. `docAvisoSync()` muestra el
aviso **solo** con `editado` **y** la firma cambiada; `docActualizarDatos()` es el único camino
que rearma. **Nunca se pisa sin avisar.**

⚠️ **El aviso alcanza con revisarse al reabrir**, y es por construcción: la hoja es un overlay
`position:fixed` con `inset:0` que tapa la app, así que con la hoja delante no se puede cambiar un
dato del formulario. Es el mismo argumento que PANT-22 escribió para el panel de Evidencia.

### La imagen

`docClaveEsq(clave)` → `'doc-' + clave`. Va a **`esqs`** y **no** a `imgSlots`: `imgSlots` es lo
que el PDF del informe imprime en su página «Imágenes del estudio», y una constancia ahí saldría
dentro del informe firmado. `CeiboImg.leer` devuelve solo `imgs`, así que un esquema no llega a
ninguna superficie firmada.

⚠️ **El prefijo `doc-` no choca con ninguna de las diez claves existentes** (censadas: `orejuela`
y las nueve de `INF_MIN_DIAG`), así que `diagGuardarIncluidos` —que **borra** los esquemas de los
diagramas no incluidos— no puede llevarse una hoja puesta.

⚠️ **`guardarEsquema` identifica por clave y REEMPLAZA**: de ahí sale el «actualizar» del pedido
sin un camino propio. «Quitar» es `CeiboImg.borrarEsquema`.

⚠️ **Las tres compuertas del guardado pueden negar y el motivo SE DICE**: sin almacenamiento, con
la casilla «Guardar imágenes con los estudios» de Config apagada (es el estado de fábrica), o con
el estudio sin guardar.

### El formato, medido

A4, `ML`/`MR` 14 mm, `MT` 12, `MB` 13, pie en `y = 291`. Cuerpo e interlineado por documento:
constancia 10,5/16, cardioversión 8,8/11, ETE 10,2/13,4, burbujas 8,8/11.

| Documento | Hojas | Aire libre en su última hoja de texto |
|---|---|---|
| constancia | 1 | 176,5 mm |
| cve | 1 + 1 | 16,9 mm |
| ete | 2 + 1 | 68,3 mm |
| burb | 1 + 1 | **5,3 mm** → `P30-b` |

---

## 2 · Parte B — la sección de prótesis del Laboratorio

### ⚠️ Por qué NO llama a ningún evaluador de prótesis

Los cuatro —`eaProtVeredicto`, `vmProtEOA`, `vtProtObstr`, `vpProtObstr`— **leen el DOM** y
clasifican con los valores de la pantalla. El Laboratorio corre **sin DOM**, sobre `inf.campos`,
igual que `_labExcelRow`: un predicado que leyera `sv('va_morf')` bandearía cada fila contra el
paciente que está en pantalla, que es la trampa que `valvEsProtesis` ya documenta. Y
reimplementarlos sin DOM sería un **segundo dueño** del mismo veredicto clínico.

De ahí el reparto: **posición, tipo y modelo** de campos guardados; **trastorno** del **texto del
informe**, que es la única forma en que ese veredicto queda guardado. Es el mismo mecanismo con
que esta pestaña ya clasifica la geometría del VI y el grado diastólico, y la pantalla lo dice.
El precio está declarado en `P30-e`.

### Los dueños

| Constante o función | Qué es |
|---|---|
| `LAB_PROT_POS` | las cuatro posiciones, con su campo de morfología y su campo de modelo |
| `LAB_PROT_TIPO` | **solo nombra** el tipo. La pregunta «es una prótesis?» la contesta `valvEsProtesis` |
| `LAB_PROT_TIPO_LBL` / `_COL` / `_ORDEN` | rótulo, color y orden de los cinco tipos |
| `LAB_PROT_TRAST` | las **ocho** conclusiones, con su frase literal y su `alt` (`true` / `false` / **`null` = aparte**) |
| `_LAB_PROT_ORACION` | qué oraciones del informe hablan de una prótesis |
| `_LAB_PROT_POS_RE` | de qué posición habla cada oración (**TAVI cuenta como aórtica**) |
| `_labProtAssert()` | la guarda de arranque: que el mapa y `valvEsProtesis` no se contradigan |
| `_labProtLeer(inf)` | las prótesis y reparaciones de UN estudio, de sus campos |
| `_labProtTrast(inf)` | sus trastornos, **por posición**, del texto guardado |
| `_labProtStats(infs)` | la cuenta de toda la población, en UN recorrido |
| `_labProtChartCfg(S, opt)` | **una** configuración de gráfico para los **dos** destinos |
| `_labProtBuildChart` / `_labProtChartPng` | pantalla y PNG del PDF |
| `labProtRender(infs)` | el pintado. Cuelga de **`labRenderExtras(infs, n)`** —el mismo lugar donde se pinta el grafico de valvulopatias, asi que recibe los `infs` ya filtrados— y de la **rama de cero estudios** de `labInit`, que termina en `return` |
| `labProtFiltrar()` | los dos filtros; filtran la foto, no recalculan la población |

### ⚠️ Cinco decisiones que hay que respetar

1. **`data-ppt-no` y NO `data-ppt`.** `_labPptAssertClaves()` exige uno de los dos en toda
   `.lab-card`, y `data-ppt` significa «esta tarjeta es una diapositiva»: ponérselo **agregaría
   una diapositiva al PPT**. Es el mismo motivo por el que la tabla de Strain Manual lo lleva.
2. **DOS pilas en el gráfico** (`stack: 'prot'` y `stack: 'rep'`): las reparaciones **no** se
   suman a las prótesis, y una sola pila las sumaría en el largo de la barra.
3. **Las categorías de trastorno son mutuamente excluyentes y se evalúan de la MÁS ESPECÍFICA a
   la más general**, por el mismo motivo que `LAB_EM_CAT`: «sin criterios de estenosis protésica»
   **contiene** «estenosis protésica».
4. **Se busca SOLO dentro de las oraciones que nombran una prótesis.** «con posible estenosis»
   —lo que la aórtica emite, medido en el navegador— no lleva «protésica» adentro, así que
   buscarla en todo el informe contaría la estenosis aórtica **nativa** de otro párrafo.
5. **El «con alteración» de un modelo sale de los trastornos de SU posición**: un estudio con
   prótesis aórtica y mitral no le atribuye a la mitral la estenosis de la aórtica.

### Dónde va, en los dos lados

- **Pantalla:** `#lab-acc-protesis`, en `#lab-sub-mediciones`, **entre** la tarjeta de
  Valvulopatías y la de Doppler tricuspídeo (índices 7, **8**, 9).
- **PDF de auditoría:** dentro de `labGenerarPDF`, **después** de la sección 9 (Valvulopatías) y
  **antes** de la 10 (Función VD). Su gráfica se coloca con **150 mm** de ancho, que es un ancho
  que ningún otro gráfico del documento usa —el de valvulopatías va con 170—, y por eso se puede
  contar.
- **Tope del PDF:** **15** modelos, con «y N modelos más.» cuando sobran. En pantalla van todos.

### Ids del DOM

`lab-prot-vacio`, `lab-prot-cuerpo`, `lab-prot-resumen`, `lab-prot-chart`,
`lab-prot-chart-leyenda`, `lab-prot-mod-pos`, `lab-prot-mod-tipo`, `lab-prot-mod-tabla`,
`lab-prot-trast-total`, `lab-prot-trast`.

⚠️ **Los dos `<select>` de filtro llevan prefijo `lab-`**, que ya está en la lista de exclusión de
`_noEsDelEstudio`, así que **no son campos del estudio**. Medido: 1010 campos contra 1010.

---

## 3 · Los arneses de esta tanda

⚠️ **NINGUNO USA PLAYWRIGHT, y se midió por qué:** el paquete **no está instalado** en esta
máquina (`npm ls -g` da tres paquetes y ninguno es playwright; en `~/Library/Caches/ms-playwright`
quedan los binarios de una instalación que ya no existe), así que las sondas de las tandas
anteriores fallan hoy con `ERR_MODULE_NOT_FOUND`. `scripts/_p30cdp.mjs` habla **CDP directo**
contra el Chrome del sistema, que es el camino que `test_clinico.mjs` ya documenta.

| Arnés | Qué mide |
|---|---|
| `_p30cdp.mjs` | el arnés: sirve la app por **HTTP** (en `file://` el origen es opaco y no hay localStorage ni IndexedDB), `ev(fn, ...args)` y `evStr(expr)`, y **cierra con `process.exit(0)`** |
| `_probe_pant30doc.mjs` | el botón, el menú, la hoja, la edición, el aviso y el papel de la constancia |
| `_probe_pant30cons.mjs` | los cuatro documentos: hojas, saltos, declaración junto a las firmas, casillas dibujadas |
| `_probe_pant30img.mjs` | el ciclo de la imagen sobre un estudio guardado de verdad |
| `_probe_pant30prot.mjs` | la cuenta y la pantalla de la sección del Laboratorio |
| `_probe_pant30pdf.mjs` | la sección en el **PDF generado de verdad**, leyendo su texto |
| `_probe_pant30ab.mjs` | el A/B de superficies, portado de `_probe_pant24ab.mjs`: **su cuerpo no se tocó**, solo quién abre el navegador y quién evalúa |
| `_mut_pant30.py` | el barrido de **45** mutaciones dirigidas, en worktree y nunca sobre el vivo |
| `_lotes_pant30.sh` | la suite completa en lotes de 55 |

### ⚠️ Cinco denominadores vacíos que esta tanda pagó, y cómo se cierran

1. **`showTab('informe')` buscando un `[onclick]`**: el primero que empareja no es el de la
   pestaña, así que `#tab-informe` se quedaba sin `active`, el botón informaba **0×0** y el menú
   —que es absoluto adentro— contaba como «opción inactiva». Tres mediciones falsas de una causa.
   Se abre con `showTab` y se declara la clase que encontró.
2. **La subpestaña «Mediciones» nace OCULTA**: el clic en el encabezado abre el acordeón y **todo
   mide 0×0**, con el gráfico ya creado y con datos. Primero la subpestaña, después el acordeón.
3. **`showTab` después de escribir en IndexedDB**: ver `P30-d`. Hay que **ceder el turno**.
4. **`valvSevConfirmada` no está en `window`**: asignarla ahí no hace nada y `guardarInforme`
   devuelve `false` **sin un solo toast**. Se intercepta `mostrarCardSeveridadValvular`. La trampa
   está en la ficha de TC-535.
5. **Contar imágenes del PDF con `/I<n> Do`** daba **12 en los dos lados**, con la gráfica y sin
   ella: un número que no distingue nada. Se envuelve `addImage` y se cuenta por su **ancho**.

### Y dos trampas de escritura

- **La función de medición de una sonda escrita como CADENA** no sobrevive a las barras
  invertidas de sus expresiones regulares: la primera versión de `_probe_pant30pdf.mjs` ni llegó
  a correr. Se pasa la **misma función** dos veces.
- **En el cuerpo de un caso no hay expresiones regulares con barra invertida ni acentos graves**,
  y el pie del papel se busca **con su tilde**: `'Pagina'` sin tilde daba **0 de 1** sobre un pie
  que sí estaba, porque `docSan` conserva los acentos.
