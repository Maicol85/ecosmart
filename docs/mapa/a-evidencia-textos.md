# Tanda A — los textos de Evidencia y de Referencias (2026-10-26/27)

Mapa de lo que la tanda A movió. **No cambió ningún dato clínico**: ni un corte, ni un umbral, ni
una clase, ni un nivel, ni una tabla, ni un folio. Movió texto —al globo ⓘ, a la bibliografía de
la sección o a `docs/fuentes/FUENTES.md`—, lo acortó, le sacó las mayúsculas de en medio y dejó
cada contenido una sola vez por sección. Las cuatro superficies firmadas quedaron idénticas.

Por nombre de función, no por número de línea.

---

## El motor: `_indSecHTMLCuerpo`, y lo que `compacta` dejó de gobernar

`compacta` gobierna **dos cosas de forma y ninguna de orden**:

1. la grilla se marca `data-ind-compacta`, que enciende la regla de dos columnas de la hoja de
   estilos (`#indic-card [data-ind-dos="1"][data-ind-compacta="1"]`, `@media (min-width:1200px)`);
2. `_indFilaHTML(f, compacta)` pliega **todas** las notas en el ⓘ —también las de fila de dato y
   las de marca 🔴/⚠️—, para que cada dato ocupe una línea.

**Lo que dejó de gobernar es el orden.** Hasta esta tanda, `compacta` emitía `_bloRec()` *antes*
de la grilla: era la inversión que el AJ6-2 introdujo para Fallot. Hoy hay **un solo lugar de
llamada**, después de la grilla, para las quince secciones, y el orden es:

| # | Qué | De dónde sale |
|---|---|---|
| 1 | los datos del paciente | `r.filas` (y `r.clinica` en la columna derecha) |
| 2 | lo que falta contestar | un bloque `plegado:true` de `r.bloques` |
| 3 | las recomendaciones con su clase y su nivel | `r.bloques` + `r.recom` |
| 4 | la teoría y las fórmulas | `r.guia` + `r.notas` (el «ⓘ Ver detalle») |
| 5 | la bibliografía | `_indBiblioHTML`, siempre última |

**Con un solo lugar de llamada desaparece el riesgo de numeración que el AJ6-2 documentó.**
`_indBloqueHTML` y `_indRecomHTML` numeran corchetes —`_indRefMarca` asigna por orden de primera
aparición dentro de la sección—, así que precomputar su HTML arriba y emitirlo abajo le daba a sus
citas los números de las filas. Con dos ramas eso se evitaba por disciplina; con una, el corchete
sigue el orden de lectura **por construcción**.

## Las ocho secciones compactas

Por orden de aparición en `IND_SECS`. El chequeo de documentación que las lista vive en el
comentario de arriba de `_indRecomHTML`, y el conteo vivo se mide con
`grep -c "compacta: *true" index.html` —tiene que dar ocho— y, en el navegador, con
`document.querySelectorAll('#indic-cuerpo [data-ind-compacta]')`, que da **una por sección
despierta**, no ocho, salvo en un estudio que las despierte a todas.

| Función | Sección | Qué le hizo la tanda |
|---|---|---|
| `_indTdFIP` | Fallot reparada · insuficiencia pulmonar | el parentético con apartado, número de recomendación y folio sale de las **siete** líneas y queda una línea de fuente al final de cada bloque; `notas` deja de ser `acc.concat(esc).map(…)`; los cortes de fracción regurgitante quedan en el ⓘ de **su** fila |
| `_indDerrPeri` | Derrame pericárdico y taponamiento | la recomendación ya no reenumera las tres condiciones —las pregunta una fila cada una—; «Recommendation Table 12, folio 43» una vez; el censo de las veintisiete tablas al ⓘ |
| `_indConstr` | Constricción pericárdica · diagnóstico | «Recommendation Table 24, folio 64» una vez; las filas de tratamiento que no se publican, al ⓘ |
| `_indVexus` | Congestión venosa sistémica · VExUS | «Resumen, página 1» salía en las **cinco** líneas: queda una; `notas` deja de copiar el bloque |
| `_indHemo` | Perfil hemodinámico | el mismo texto salía **tres** veces (caja, criterio en negrita, «Ver detalle») con «folio 167» en cada línea; la cuarta línea de las fórmulas repetía el ⓘ de la fila «Índice cardíaco»; **el mensaje de la fila del Forrester** |
| `_indConco` | Cardiotoxicidad | las dos Clase IIa · Nivel C pasan a **una línea** cada una; la nota al pie de la tabla de la biopsia, al ⓘ |
| `_indAmil` | Amiloidosis · algoritmo diagnóstico | las dos recomendaciones una vez y **visibles**; el párrafo del criterio ecocardiográfico y el «no validado externamente» quedan sólo en el ⓘ de sus filas; **los tres bloques reordenados** |
| `_indPOP` | Posoperatorio de cirugía cardíaca | los cinco criterios una fila cada uno; «Tabla 22, folio 59» una vez; **la colchicina se mantiene** con su Clase IIa · Nivel A; `_popNotas` |

Y dos que no son compactas pero la tanda toca: `_indVABConcl` (le sale la línea de umbrales
duplicada) y `_indAo` (la frase del corte sin sexo, y la nota de trabajo que le quedaba).

## `_popNotas` — el ⓘ del posoperatorio sigue a la cirugía cargada

El armador está en `_indPOP`, justo antes del `return`. **No es una lista fija**, y eso no es un
detalle de forma: la primera versión de esta tanda ponía los cinco localizadores siempre, y con
«valvular» cargada la sección publicaba —dentro del globo— el folio 716 de la revascularización,
o sea qué mirar tras una cirugía que el paciente no tuvo. Lo cazó **TC-534 (F9)**, que cuenta
exactamente eso. Cada línea se emite con la **misma condición** que su línea visible:

| Línea del ⓘ | Condición |
|---|---|
| la colchicina es preoperatoria | siempre, con dos redacciones según `pcis` |
| cirugía mitral · apartado 3.1.5 y Tabla 3, folio 701 | `cx === 'valvular'` |
| revascularización · apartado 4.2 folio 716, Tabla 8 folio 707 | `cx === 'cabg'` |
| vistas tras ECMO · Figura 12, folio 716 | `asist === 'ecmo_va'` |
| esa guía no publica clase ni nivel | cualquiera de las tres de arriba |
| el derrame pleural por tamaño no tiene fuente | `hayPle` |
| los patrones hemodinámicos y la vasoplejia no entran | siempre |

## La fila del perfil de Forrester, y la frontera que NO se cruzó

La cápsula de `calcHemo` publica «Requiere IC + PCP estimada» **en los dos casos** —falte el
índice cardíaco o falte la presión capilar—, así que la fila de la Evidencia terminaba pidiendo un
dato que ya estaba cargado. Hoy el mensaje **se arma en `_indHemo`** y nombra el que falta.

⚠️ **La cápsula del módulo no se toca, y es donde el arreglo iría en su origen.** El texto de
`hemo-forrester` lo leen `amiloTextoHemo()` —que se integra al informe y sale en la hoja de ETT
Avanzado del PDF— y la diapositiva del PPT (`_pptSpan`). Cambiarlo ahí cambia **tres superficies
firmadas**. Está medido: la cápsula sale idéntica en los dos árboles en las tres escenas, y
**TC-537 (N4)** lo fija como control de frontera. Declarado en `docs/PENDIENTES.md` → **A-d**.

## Las tres fichas de Referencias

- **`ref-pop`** — las dieciséis filas conservan su criterio y su corte; la columna **Fuente** queda
  «autor, revista, año» en una línea y la hoja, la página, el folio, el apartado y las aclaraciones
  pasan a un `<details>` inline con un ⓘ por fila. Los tres nombres internos del código salieron.
  Los cuatro sellos «Criterio de EcoSmart» y el rótulo «definición propuesta» de la vasoplejia se
  conservan. El pie queda en **una línea** y sus tres párrafos en un ⓘ.
- **`ref-pulmon`** — sale la reserva interna; el título del consenso, la fórmula de Balik con su
  referencia 154 del enunciado D6_11 y el «no publica clase ni nivel» pasan al ⓘ.
- **la del ventrículo derecho** (`evRefPintar('vd2')`) — la fila `FUN-VD-008` dice «Decisión de la
  aplicación» en vez de repetir «de 15 a 20 %», y los folios 145 y 159 de su nota «Criterio de
  EcoSmart» pasan a un ⓘ. La frase «leve como mínimo» **no se tocó**.

⚠️ **`_evRefTabla` acepta un campo `fuente` OPCIONAL** que pisa la celda de la derecha. Lo trae
**una** fila de las **cuarenta y ocho** que pasan por ese armador en sus cinco llamadas, así que
las otras **cuarenta y siete** se pintan exactamente igual. **La cabecera de esa columna sigue
diciendo «Mujer»**: la premisa del pedido —«la columna de fuente»— es falsa en su letra, esa tabla
tiene «Parámetro | Varón | Mujer». Declarado en `docs/PENDIENTES.md` → **A-a**.

## El instrumental de esta tanda

| Archivo | Qué hace |
|---|---|
| `scripts/_probe_aab.mjs` | el A/B de superficies: informe en tres estilos, EN SUMA, las 440 columnas de Excel clave por clave, los campos, el Laboratorio por sus ocho funciones dueñas, veinte cápsulas de pantalla, el PDF generado de verdad en sus seis plantillas, el PPT, y el texto del panel y de las fichas. Catorce escenas. |
| `scripts/_ab_adiff.mjs` | compara dos volcados y **parte** las diferencias: las firmadas tienen que ser cero, las del panel **no** pueden serlo —si lo son, la sonda no está mirando lo que la tanda tocó— |
| `scripts/_ab_apanel.mjs` | el guardián de la regla R7: toda cadena «Clase …», «folio N» y «Tabla N» que estaba en HEAD tiene que seguir en alguna superficie medida |
| `scripts/_mut_a.py` | las quince mutaciones dirigidas contra TC-537, en un worktree y con md5-guard |

⚠️ **Tres defectos de instrumento que esta tanda pagó, y que conviene no repetir:**
1. `/\s+/` escrito con **una** barra dentro de un template de JavaScript queda como `/s+/` y
   **borra todas las eses** del texto medido. Pasó una corrida entera: el volcado decía «ademá
   valor» y «Mecani mo». Afectaba a los dos lados igual, así que el A/B seguía siendo válido,
   pero el texto era ilegible y una diferencia de sólo eses quedaba tapada.
2. El guardián de R7 incluía el **punto** en la clase de caracteres —para atrapar «folio 497.e20»—
   y de paso se tragaba el punto que cierra la oración: «folio e17» y «folio e17.» salían como
   marcas distintas, y reportó **58 folios perdidos que estaban los 58 presentes**.
3. La escena `hemo` de `_probe_r2ab.mjs` carga `fc` y `diam_tsvi_ao`, y `calcHemo` lee `hemo_fc` y
   `diam_tsvi`: esa escena **nunca** produjo un índice cardíaco. `_probe_aab.mjs` la hereda igual
   para no cambiar el A/B a mitad de tanda.

## Dónde está el caso

`TC-537`, con su ficha en `docs/mapa/tests-fichas-537.md`.
