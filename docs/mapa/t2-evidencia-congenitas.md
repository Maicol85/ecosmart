# TGA-2 — Jatene y Rastelli en el papel, y la Evidencia de congénitas

Mapa de la tanda **TGA-2** (2026-10-31). Está por nombre de función y de constante, no por línea.

Lo de la tanda anterior —el diagrama 3D portado, el valor `dtga` y el campo `tga_cirugia`— vive
en `docs/mapa/tga-diagrama-3d.md`, que esta tanda no reemplaza: lo extiende.

---

## 1 · Los dos valores nuevos de la cirugía, y por qué el papel cambia de registro

`tga_cirugia` pasa de dos valores a **cuatro**. No es un campo nuevo ni una columna de Excel: son
dos entradas más en los tres mapas que ya existían.

| Qué | Dueño | Dónde |
|---|---|---|
| El vocabulario válido | `TGA_CIR_VAL` | cuatro valores: `ninguna`, `auricular`, `jatene`, `rastelli` |
| El rótulo de pantalla y de texto | `TGA_CIR_LBL` | «switch arterial (Jatene)» · «Rastelli» |
| El rótulo de la celda del Excel | `TGA_CIR_XLS` | con mayúscula inicial, porque es una celda |
| El vocabulario del importador | `LAB_XLS_VOCAB.tga_cirugia` | sin esto el round-trip se rompe en silencio |
| La traducción al vocabulario de la demo | **`TGA_CIR_OP`** | `auricular→mus` · `jatene→jat` · `rastelli→ras` |
| La leyenda de valores de la columna | el mapa de leyendas, entrada `tga_cirugia` | cuatro valores |

**`TGA_CIR_OP` es la pieza nueva y es un dueño único.** Hasta la TGA-1 la traducción al vocabulario
de la demo estaba escrita **dos veces** —una en `_tga3dClave` y otra como la condición
`o !== 'auricular'` de `tga3dEscena`—. Con dos valores alcanzaba; con cuatro deja de alcanzar: una
rama que se olvide de `rastelli` lo dibuja como una d-TGA sin operar, con la aorta del color
equivocado. Una clave que **no** esté en ese mapa significa «ninguna cirugía que la demo dibuje»,
que es lo correcto para `ninguna` y para «sin dato».

### La decisión del médico, y lo que arrastra

Con Jatene y con Rastelli el ventrículo sistémico es el **izquierdo**. Las cuatro oraciones que
`tgaConclusion` arma para las otras anatomías afirmarían lo contrario:

1. el encabezado «: el ventrículo derecho es el ventrículo sistémico»;
2. «Función del ventrículo derecho sistémico …»;
3. «Diámetro basal del ventrículo sistémico … mm»;
4. «Insuficiencia de la válvula auriculoventricular sistémica (tricúspide) …».

Y toda la cascada de conducta razona sobre el ventrículo sistémico y cita la ESC 2020.

Con esos dos valores, `tgaConclusion` sale por una **rama descriptiva** propia, con
`clave: 'descriptivo'`, y `txt` y `resumen` son la **misma** cadena: el encabezado con el tipo y la
cirugía, más los hallazgos neutros que estén cargados. `ccSumaLinea('tga')` hace lo mismo para el
EN SUMA. Las cuatro superficies quedan:

| Superficie | De dónde sale |
|---|---|
| Cuerpo del informe | `tgaConclusion().txt` |
| EN SUMA | `ccSumaLinea('tga')` |
| Hoja del PDF de congénitas | `tgaConclusion().resumen` vía `ccHoja('tga', …)` |
| PPT | `tgaConclusion().resumen` vía `_ccPptPodar` |

**Ejemplo medido**: informe «Transposición de grandes arterias completa (d-TGA) operada, con switch
arterial (Jatene).» y EN SUMA «TGA completa (d-TGA) operada, con switch arterial (Jatene)», contra
«… (d-TGA): el ventrículo derecho es el ventrículo sistémico. Función del ventrículo derecho
sistémico con disfunción moderada. …» en el árbol anterior.

### ⚠️ TRES CAMPOS QUEDAN PARADOS, Y ESTÁ DECLARADO

`tga_func_vd`, `vd_bas` e `it_grado`. La redacción que esta sección tiene para los tres nombra el
ventrículo o la válvula **sistémico**, y escribirles otra es contenido clínico nuevo. El valor no se
borra —nada automático escribe en el estudio— y el grado de insuficiencia tricuspídea sigue saliendo
por Válvulas, que es su dueño, así que del informe no desaparece. → `docs/PENDIENTES.md` **TGA2-a**.

Del **bloqueo AV** se publica el hallazgo y no su explicación: la cláusula «complicación esperable en
la ccTGA por la disposición del sistema de conducción» es una interpretación y encima nombra otra
anatomía.

### La pantalla

- El título del acordeón pasa de «TGA — Transposición de grandes arterias corregida» a
  «TGA — Transposición de grandes arterias».
- El párrafo de encabezado queda **estructural**, sin una afirmación clínica. Lo que sale de ahí no
  se pierde de la aplicación: lo dicen `TGA3D_INFO.ltga` y `TGA3D_INFO.mus` por escenario, y
  `tgaConclusion` en el informe de esas anatomías. La única prosa que deja de estar en algún lado es
  «su insuficiencia pesa como pesaría una mitral» → **TGA2-b**.
- El grupo del campo «Función del VD sistémico» lleva `id="tga-funcvd-fg"` y `tgaSync` lo **esconde**
  con Jatene y con Rastelli. Esconder y nunca borrar: es la regla que el D-9, el D-10 y el D-11
  pagaron tres veces.

### El dibujo

Las ramas de `tga3dEscena` son las de la demo, número por número:
`a === 'dtga' && (o === 'none' || o === 'ras')` comparten tronco **`AO_ANT`** y lo único que las
separa es el color —azul sin operar, **rojo** con el Rastelli, porque el túnel le lleva sangre
arterial— y lo que cuelga abajo; `o === 'jat'` usa los trazados del corazón normal más cuatro
elementos naranjas (dos anillos de sutura y dos coronarias reimplantadas); `o === 'mus'` no se tocó.
Las comunicaciones se dibujan **sólo** sin cirugía, igual que en la demo.

**La comparación obligatoria da 30 de 30 escenarios IGUALES** (`scripts/_probe_t2a_demo.mjs`), contra
20 de 30 en la TGA-1. El arnés de la TGA-1 (`scripts/_probe_tga2demo.mjs`) queda intacto.

---

## 2 · El molde de la Evidencia: cómo se agrega un panel con preguntas

Las cuatro secciones nuevas o reescritas de esta tanda —TGA, CIA, CIV y la muerte súbita de la
miocardiopatía hipertrófica— usan **el molde de `_indVAB`** y no lo reescriben. Las piezas:

| Pieza | Qué hace |
|---|---|
| `_indFila(lbl, val, marca, nota, refs)` | fila de solo lectura; `marca` es el semáforo |
| `_indOrigen(valorOrigen, claveManual)` | el dato del estudio si está; si no, lo contestado en el panel |
| `_indFilaCtrl(lbl, clave, ops, marca, nota, refs)` | fila con botonera |
| `_indFilaOrigen(lbl, o, ops, pinta)` | elige entre las dos según de dónde salió el dato |
| `_indClin` / `_indClinGet` / `_indClinLimpiar` | **la memoria del panel**, efímera |
| `_indClinVaciar()` | la vacía en los dos caminos de «Nuevo estudio» |
| `IND_SECS` | el registro; el título **no puede ser prefijo de otro ni tener otro por prefijo** |

### DÓNDE SE PERSISTEN LAS RESPUESTAS (lo que la orden pide reportar)

En **`_indClin`**, un `Object.create(null)` de nivel de script que:

- **no es un campo del estudio** y no se guarda ni se exporta;
- lo vacía `_indClinLimpiar()` cuando el panel se cierra, y `_indClinVaciar()` en los **dos** caminos
  de «Nuevo estudio»;
- es exactamente el mecanismo con el que la Evidencia de la **bicúspide** guarda sus seis factores
  preguntados cuando el campo `vab_fr_*` está vacío.

**La diferencia con la bicúspide**: aquélla tiene además seis campos **guardados** (`vab_fr_*`, que
ya existían y nunca fueron casillas), y `_indOrigen` le da **prioridad al campo guardado** sobre lo
contestado en el panel. Las secciones de esta tanda **no tienen ningún campo**, porque la orden
prohíbe agregarlos: pasan por `_indOrigen` con el valor de origen en `null` —para que el día que
alguna tenga campo propio no haya que reescribir la fila— y la respuesta vive sólo en el panel.

### Los tres estados, y por qué «sin dato» no es «no»

Cada pregunta usa `ops = [{v:'si',t:'Sí'},{v:'no',t:'No'}]`. El tercer estado es **no haber
contestado**: `_indClinGet` devuelve `null` y la fila sale con marca `ask`. Un segundo toque sobre la
opción activa la **desmarca** y vuelve a `null`. El balance de cada sección cuenta los tres por
separado y, cuando ninguna condición está en «sí», **nombra las que faltan** — que es la condición
(5) del pedido.

### Las cuatro secciones

| Sección | Función | Compuerta | Recomendaciones | Preguntas |
|---|---|---|---|---|
| Transposición de grandes arterias — indicaciones y seguimiento | `_indTGA` | `tgaEjes().tipo` | 11 / 3 / 4 / 4 según la cirugía, más las generales | 7 / 4 / 6 / 3 |
| Comunicación interauricular | `_indCIA` | tipo y (Qp/Qs o tamaño) | 9 (I×5, IIa×2, IIb, III) + seguimiento | 9 |
| Comunicación interventricular | `_indCIV` | la que ya tenía | 6 (I, IIa×3, IIb, III) + seguimiento | 7 |
| Miocardiopatía hipertrófica — prevención de muerte súbita | `_indMCHSCD` | `mchConclusion()` | 9 (I×4, IIa×2, IIb×3) | 3 |

Las constantes declarativas: `TGA_IND_PREG` / `TGA_IND_RECS` (por situación), `CIA_PREG` y `CIV_PREG`
(locales de su función) y `MCH_SCD_PREG` / `MCH_SCD_OPS`.

### ⚠️ Por qué `_indMCHSCD` es una sección aparte y no un bloque de `_indMCH`

`_indMCH` se abre con un gradiente del tracto de salida de **30 mmHg o más** —es la de la terapia de
reducción septal— y el riesgo de muerte súbita se evalúa en **toda** miocardiopatía hipertrófica,
obstructiva o no. Metido ahí, el paciente sin obstrucción no lo vería. Los títulos no se contienen:
divergen en «— prevención» contra « obstructiva».

---

## 3 · Lo que la guía NO publica, y que el panel dice en vez de callarse

- **No hay tabla de intervención para la d-TGA no operada del adulto.** Las tres situaciones que la
  ESC 2020 trata en el adulto son el switch auricular, el switch arterial y el Rastelli. Con «sin
  cirugía» o sin dato, el panel lo dice.
- **El ejercicio, el embarazo y la profilaxis de endocarditis** no tienen recomendación propia de la
  transposición: el apartado 4.12.6 los remite a los apartados generales de la guía.
- **La divergencia de la CIV sigue abierta.** El bloque nuevo publica la **tabla** con su clase y su
  nivel; el criterio que la app aplica diverge de ella y eso está declarado desde antes en la entrada
  `escGuchCiv` del registro de citas. Esta tanda no la resuelve: corregir el criterio es contenido
  clínico. Por eso el bloque cita `esc2020guch` —la guía, de donde salen esas líneas— y la línea de
  `guia` de la sección sigue citando `escGuchCiv`, que es la que lleva la advertencia.

---

## 4 · La Parte C: por qué la poda del PPT sigue PARADA

La conclusión de la miocardiopatía hipertrófica pega una recomendación —la del desfibrilador— a un
recuento, y la línea del PPT cita **dos** guías: la ESC y la «AHA/ACC 2020».

- **La ESC está y se transcribió**: ESC 2023 de miocardiopatías (`ehad194.pdf`, 124 hojas,
  folio = hoja + 3502), Tabla de recomendaciones 23, hojas 59 y 60, folios 3561 y 3562. Es lo que
  publica `_indMCHSCD`.
- **La AHA/ACC 2020 NO está en la biblioteca.** Lo que hay en `11_Miocardiopatias` es la guía de
  **2024** (Ommen y cols., *Circulation* 2024;149:e1239-e1311) y su resumen.

La regla de la orden es «si no se lee con certeza o la hoja no coincide: PARÁ y reportá sin cambiar
el papel», y la línea del PPT es **una sola cadena** con las dos mitades: retirar la de la ESC y
dejar la de la AHA publicaría media recomendación. Queda en **TGA2-c**, y `IMG3-g` sigue abierto.

---

## 5 · Los arneses de esta tanda

| Arnés | Qué mide |
|---|---|
| `scripts/_probe_t2a_demo.mjs` | los 30 escenarios contra la demo aprobada |
| `scripts/_probe_t2ab.mjs` | el A/B de superficies, con las cinco escenas de Jatene y Rastelli |
| `scripts/_probe_t2b.mjs` | el panel de la TGA por escenario, y el CONTROL DEL PAPEL con sus denominadores reales |
| `scripts/_mut_t2.py` | las mutaciones dirigidas |
| `scripts/_probe_t2wk.mjs` | Chrome y WebKit |

⚠️ **Los nombres no pisan a los de la tanda TGA.** Aquélla dejó `_probe_tga1.mjs`, `_probe_tga2.mjs`,
`_probe_tga2demo.mjs`, `_probe_tga3.mjs` y `_probe_tgawk.mjs`, que nombran sus **commits**; los de
esta tanda llevan el prefijo `t2`. Es la lección que la tanda AJUSTES-1 pagó sobrescribiendo
`_probe_aj1wk.mjs`.

⚠️ **El control del papel necesita denominadores reales.** La primera versión de `_probe_t2b.mjs`
llamaba a `generarPDF` y a `generarPPT` directamente y devolvía **cero textos sin error**, que es
indistinguible de «el papel no lleva la frase». El PDF va por `_pdfAjustarA4` y el PPT exige un
estudio guardado sintético con las casillas persistidas como `<id>__chk`.
