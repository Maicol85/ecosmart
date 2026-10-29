# Mapa — tanda AJ6 (2026-10-24)

Cuatro cosas, en cuatro commits, sin un valor clínico, un corte ni una fuente movidos:

| Ítem | Qué cambió | Dónde está |
|---|---|---|
| **AJ6-1** | El cuerpo del informe de la **Fallot reparada** en esquema y **sin conducta** | `tdfConclusion` |
| **AJ6-2** | La **Evidencia** de Fallot: recomendaciones arriba, una línea por fila, la prosa en el ⓘ | `_indTdFIP` · `_indSecHTMLCuerpo` · `_indFilaHTML` |
| **AJ6-3** | La **Ecografía pulmonar** en cuatro columnas | marcado de `#pua-seccion` · `.pul-cols` |
| **AJ6-4** | **Referencias** y **Calculadoras** siempre visibles; el **buscador** tapa las fichas | `EE_MODULES` · `applyViewMode` · `ecoAdvBuild` · `refBuscar` |

> Los números de línea no están a propósito: cambian en cada edición y el nombre de la función no.

---

## AJ6-1 · El informe de Fallot: título, renglones con guion y nada de conducta

### Qué emite hoy

`tdfConclusion()` devuelve **cuatro** cosas y cada una tiene su consumidor:

| Campo | Quién lo consume | Lleva conducta |
|---|---|---|
| `lineasInf` | el **cuerpo del informe** (la tabla compartida de `ebs`/`tdf`/`tga`/`mca`) | **no** |
| `txt` | la **caja «Conclusión»** de la sección (`#tdf-concl`, por `textContent`) | **no** |
| `resumen` | la **diapositiva del PPT**, su único consumidor en toda la app | **sí**, a propósito |
| `clave` | el **Laboratorio** (`TDF_CONDUCTAS`, `_claveDe(tdfConclusion)`) | — |

`lineasInf` es un **array de LÍNEAS**, no un párrafo:

```
(una línea con un solo espacio)      ← la fila vacía de separación
Tetralogía de Fallot reparada.
- Insuficiencia pulmonar severa. Diámetro del TSVD 35 mm. Gradiente en el tracto de salida derecho 36 mmHg (gradiente transvalvular pulmonar del estudio); obstrucción al menos moderada (velocidad pico >3 m/s).
- Función del ventrículo derecho con disfunción leve. Volúmenes del ventrículo derecho (por resonancia magnética cardíaca): volumen de fin de diástole indexado 70 ml/m², volumen de fin de sístole indexado 24 ml/m².
```

### ⚠️ La fila vacía va con un ESPACIO y no con la cadena vacía

`_infEscribir` recibe `inf.filter(Boolean)`: un `''` **se descarta en el borde** y la separación no
llega nunca al papel. El archivo ya lo tenía documentado dos veces —para `etePars` y para la hoja
de cardio-oncología— y las dos veces como «ese separador es código muerto». Una línea con un
espacio es *truthy*, sobrevive al filtro, y el PDF la imprime: `amiloSanPDFml` **conserva la
sangría de cada línea**, así que `' '` llega como `' '` y `splitTextToSize` la vuelve un renglón
en blanco.

### Los TRES grupos, y por qué no son dos

La orden describe dos renglones porque su ejemplo sólo carga esos datos. Los grupos son:

| Renglón | Qué lleva, en este orden |
|---|---|
| `gPulm` | insuficiencia pulmonar · diámetro del TSVD · gradiente del tracto de salida (con la aclaración de origen, el «obstrucción al menos moderada» y la discrepancia entre los dos gradientes) · estenosis/stent y morfología valvular pulmonar |
| `gVD` | función del VD · presión sistólica del VD por IT · volúmenes indexados con su método · insuficiencia tricuspídea |
| `gOtro` | CIV residual · taquicardia ventricular y su salvedad |

La CIV residual y la TV **no pertenecen** ni al tracto de salida ni al ventrículo derecho:
colgarlas del renglón vecino diría de la válvula pulmonar algo que no es cierto. Cada renglón
aparece sólo si tiene algo que decir, así que el caso corriente son dos.

### Lo que SALIÓ del papel

`conducta` **se sigue armando** y la cascada de la ESC 2020 no se tocó: lo único que cambia es que
`partes` ya no la recibe. Las tres frases que la orden nombra son las tres mitades del `conducta`
de la rama `vigilancia`:

1. «… sin síntomas ni otros criterios de reintervención por los datos cargados — seguimiento»
2. «Los volúmenes del ventrículo derecho por resonancia están por debajo del umbral de la ESC 2020»
3. «No consta la situación clínica, que es lo que define la indicación Clase I»

Y con ellas salen las de las otras cuatro ramas: la Clase I del sintomático, la IIa del
asintomático con criterios, la vigilancia de la IP moderada y el seguimiento liso.

### Dos cambios de redacción DENTRO de las oraciones

* el gradiente: `' (obstrucción al menos moderada: velocidad pico >3 m/s)'` pasó a
  `'; obstrucción al menos moderada (velocidad pico >3 m/s)'`;
* los volúmenes: el método pasa **delante** de los dos valores —«Volúmenes del ventrículo derecho
  (por resonancia magnética cardíaca): …»—. Colgado del último volumen se leía como si calificara
  sólo a ése.

### Lo que NO se movió, y está medido

* el **EN SUMA** (`ccSumaLinea('tdf')`) **nunca** tuvo conducta: medido en HEAD, los tres
  marcadores en `false`. No se le tocó una letra. ⚠️ **Sigue repitiendo la IP y la estenosis
  pulmonar que la sección de válvulas ya publica más arriba** — declarado, no tocado (AJ6-a);
* la **hoja del PDF** de esta cardiopatía: el emisor compartido sigue pasando `c.parrafos` a
  `ccHoja`, que en Fallot es `[]`. Si alguna vez se le pasaran las líneas nuevas, la hoja ganaría
  tres subtítulos («Morfologia / Tipo», «Mediciones», «Hemodinamica») que esta orden no pide;
* el **PPT**: `resumen` intacto. Su comentario —«POR QUÉ ACÁ SÍ VA LA CONDUCTA Y EN EL EN SUMA
  NO»— sigue valiendo y ahora es la única superficie firmada que la lleva.

### El fuera de rango

`clave:'no_interpretable'`. El renglón va **sin** el prefijo «Tetralogía de Fallot reparada — »,
que debajo del título repetiría el nombre dos veces en dos líneas seguidas; `txt` y `resumen`
conservan el mensaje entero, que ahí se lee suelto.

---

## AJ6-2 · La Evidencia de Fallot, en modo compacto

### El flag vive en la SECCIÓN

`_indTdFIP` devuelve `compacta: true`, y eso gobernaba **tres** cosas en `_indSecHTMLCuerpo`:

1. ~~`bloques` y `recom` se emiten **antes** de la grilla de filas~~;
2. las filas se pintan con `_indFilaHTML(f, true)`;
3. la grilla lleva `data-ind-compacta="1"`, que es lo que enciende la regla de CSS.

⚠️ **DOS COSAS DE ESTE PÁRRAFO SE VENCIERON, Y ASÍ SE ENCONTRARON EN LA TANDA A (2026-10-27).**

- **«Es la única de las quince» dejó de ser cierto.** Lo era cuando este mapa se escribió; entre
  la J, la J2, la G y el AJ6 se sumaron siete más y nadie lo tocó. Hoy son **ocho**, listadas por
  nombre de función en el comentario de arriba de `_indRecomHTML` y en
  `docs/mapa/a-evidencia-textos.md`. El conteo se mide con `grep -c "compacta: *true" index.html`.
- **El punto 1 se revirtió.** DECISIÓN DE MAICOL en la tanda A: las ocho vuelven al orden de las
  otras siete secciones del panel —datos, lo que falta contestar, recomendaciones, teoría,
  bibliografía—, porque pesa más que las quince se lean igual que el argumento del AJ6-2 (una
  sección con dos bloques por guía no tiene una conclusión única que pueda leerse como titular).
  Hoy hay **un solo lugar de llamada** para `_bloRec`, después de la grilla.
- Y **TC-528 (B1) exigía lo contrario**: «los dos bloques van ANTES de la tabla». Está adaptado,
  con el motivo escrito, y hoy exige que vayan **después**. Su condición (C1) decía además «es la
  ÚNICA del panel» contando `data-ind-compacta` en el DOM, y pasaba en verde porque su escenario
  despierta una sola sección: un chequeo que no podía fallar. Hoy dice «la única compacta
  DESPIERTA en este escenario», y el conteo de las ocho lo mide TC-537.

### `_indFilaHTML(f, compacta)` — tres efectos

| En modo compacto | Por qué |
|---|---|
| **todas** las notas se plieguen en el ⓘ (`plegar = !!f.nota && (compacta || …)`) | «una línea por dato medido, con el texto largo en el ⓘ» |
| el rótulo es la celda **golosa** (`width:100%`) | con la prosa plegada, la celda de estado baja de 322 px a 30 y el reparto automático le daba esos 290 al **valor**, dejando el rótulo en 90: las preguntas pasaban de 53 a **109 px** y el alto total **no bajaba** |
| el valor deja de ser `nowrap`, y las botoneras de **más de dos** opciones tienen piso de 170 px | el `nowrap` desbordaba la tabla a 390 px (362 px de contenido en 310 de panel) — un desborde **anterior** a esta tanda; y la botonera de cuatro opciones apilaba sus botones uno por línea, 150 px, el triple que sus vecinas |

⚠️ **Esto invierte dos reglas, y sólo para esta sección.** La decisión del 2026-10-11 pliega la
nota de una **pregunta** y nunca la de una fila de dato ni la de una marca 🔴/⚠️. Lo que esa regla
protege son las **contraindicaciones** de la Tabla 8 de la estenosis mitral —«contraindicación de
la comisurotomía percutánea»—, que son advertencias de seguridad. Las once notas de Fallot dicen
qué guía usa ese dato y con qué corte. **Si esta sección publicara alguna vez una
contraindicación, la compuerta tiene que volver a mirar la marca.**

### ⚠️ `lista.map(_indFilaHTML)` pasaba el ÍNDICE como segundo parámetro

Los tres llamadores eran `map(_indFilaHTML)`, que entrega `(fila, índice, array)`. El día que la
función tuviera un segundo parámetro, la fila 0 se pintaría de un modo y las otras de otro, sin
error y sin que nada lo delate. Ese día era hoy: los tres pasan por una lambda explícita.

### Las dos columnas, sin pedir maximizar

| Regla | Compuerta | Para quién |
|---|---|---|
| la de siempre | `#indic-card[data-ind-max="1"] [data-ind-dos="1"]`, `@media (min-width:1000px)` | las catorce |
| la nueva | `#indic-card [data-ind-dos="1"][data-ind-compacta="1"]`, `@media (min-width:1200px)` | Fallot |

El corte es **1200 y no 1000**: el panel sin maximizar mide ~790 px y da columnas de 373; por
debajo de 1200 quedarían en 370, que es el ancho de un celular. En el celular ninguna de las dos
se aplica y los tres `div` vuelven a ser `display:block`, apilados.

### «Lo que falta contestar»

Es el tercer `bloque`, con `plegado:true` —el `<details data-ind-bloque="1">` que
`_indBloqueHTML` ya tenía—. Decía «Lo que falta para decidir otras filas».

⚠️ **Su título NO lleva el conteador.** `_indRepintarConservando` indexa cada `<details>` por
«summary del padre ▸ summary», así que un número adentro **cambia la clave** en cuanto el médico
contesta: abría el bloque, contestaba una pregunta y el bloque se cerraba solo en el repintado,
que es exactamente el salto que esa función existe para evitar.

### El alto, medido a 1440 px con los datos del ejemplo

| Escena | Antes | Después |
|---|---|---|
| panel sin maximizar (790 px) | 1562 px | **1256 px** (−19,6 %) |
| panel maximizado (1390 px) | 1514 px | **1114 px** (−26 %) |
| 390 px (apilado) | 2430 px | **1917 px** (−21 %) |

Las dieciséis filas de dato quedan en **43 px** —una línea— y las cuatro preguntas de Sí/No en 53.
El ⓘ de los ⓘ: pasan de **5** notas plegadas a **16**.

---

## AJ6-3 · La ecografía pulmonar en cuatro columnas

### Estructura

```
#pua-seccion .card .card-body
  <p> aviso «Si no se completa nada, no aparece en el informe.»
  .pul-cols                                  ← grilla de cuatro
    .pul-col[data-pul-col="pleura"]          → desliz · lateralidad · líneas A · punto pulmón
    .pul-col[data-pul-col="lineasb"]         → líneas B · cantidad · #pua-lb-zonas-wrap (6 zonas)
    .pul-col[data-pul-col="derrame"]         → derrame · tamaño · tipo · Balik (con su ⓘ) · lateralidad
    .pul-col[data-pul-col="consol"]          → consolidación · broncograma · nota
  .calc-box  «🧭 Patrón global» + interpretación      ← a todo el ancho, DEBAJO
  botón «📎 Integrar al informe»                      ← a todo el ancho, DEBAJO
```

Cada columna abre con un `.pul-col-h` que lleva **el mismo texto literal** que tenía el encabezado
inline, y sus campos van en un `.pul-col-campos` de **una** columna: las tres grillas internas que
tenían los grupos apilados (`grid-3`, `grid-2`, `grid-4`) se reemplazaron por ésa, porque dentro de
una columna de 288 px cuatro campos en fila dan 60 px por `<select>`. **La `grid-2` de los dos
hemitórax no se toca** —sus rótulos son «Anterior», «Lateral» y «Basal»— y sigue colapsando sola.

### CSS

```css
.pul-cols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;align-items:start;margin-bottom:12px;}
.pul-col{min-width:0;}
.pul-col-campos{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-bottom:12px;}
.pul-col-h{…;border-bottom:1px solid var(--border);}
@media(max-width:1100px){ .pul-cols{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;} }
@media(max-width:600px){  .pul-cols{grid-template-columns:minmax(0,1fr);} }
```

`align-items:start` por el mismo motivo que `.hfa-grid`: la columna del derrame tiene cinco campos
y la de consolidación uno visible, y estiradas dejan un hueco que se lee como «acá falta algo».

### Medido en Chrome

| | 1440 px | 390 px |
|---|---|---|
| columnas | 4 de **288 px**, cuatro x distintas | **1** de 328 px, misma x |
| scroll horizontal de la página | no | no |
| recortes en los veinte campos | 0 | 0 |
| caja de conclusión | 1194 px, debajo de la columna más alta | a todo el ancho |

**La columna de consolidación queda casi vacía y está aceptado:** sus dos dependientes nacen en
`display:none` y sólo aparecen con «Consolidación: Sí».

### El denominador que hay que respetar al medir

Sin el botón **«Integrar al informe»** el pulmón **no publica nada**: `pulAvanzadoIntegrado()`
gatea el bloque 13c. Medir el informe sin integrar da cero líneas y parece que nada cambió. Con el
módulo integrado, el párrafo y la línea del EN SUMA salen **byte por byte** como los dejó el AJ2.

---

## AJ6-4a · Referencias y Calculadoras dejan de ser opcionales

### Qué se retiró

| Pieza | Antes | Ahora |
|---|---|---|
| `EE_MODULES` | 7 claves (con `calculadoras` y `refs`) | **5** |
| botón `📚 Referencias` (`.tabs-tools`) | `data-mod="refs"` | sin atributo |
| sub-pestaña `🧮 Calculadoras` (`#ref-subtab-calc`) | `data-mod="calculadoras"` | sin atributo |
| `applyViewMode` | escondía `.tabs-tools` en Básico y la recalculaba en Avanzado | no la toca |
| `ecoAdvBuild` | `if(mode==='basico')return;` para **todos** los botones | `if(mode==='basico'&&b.hasAttribute('data-mod'))return;` |

**Las dos cosas van juntas o el chequeo de arranque grita**: la guarda de `DOMContentLoaded` avisa
por consola «sin casilla en Config» si un `data-mod` no está en `EE_MODULES`, y «sin botón» al
revés. Medido: el invariante queda limpio en los dos sentidos.

### Tres hallazgos del propio diff

1. **las dos líneas que escondían `.tabs-tools` no hacían nada visible.**
   `.subtabs-wrap .tabs-tools{display:flex !important}` le gana a un `style.display` inline, así
   que la fila estaba **siempre dibujada** y lo único que escondía al botón era su `data-mod`. Se
   retiran igual: un estado inline que miente sobre lo que se ve es peor que inútil.
2. **la fila sale del recálculo de Avanzado.** Ese bucle prende la fila si alguno de sus
   `[data-mod]` quedó visible; sin ninguno que contar, `any` daba `false` y le escribía
   `display:none` a la fila del botón que no se puede ocultar.
3. **`ecoAdvBuild` dejaba a Referencias sin puerta en el celular.** Por debajo de 768 px
   `.subtabs-wrap:not(.cc-subbar) .tabs-row{display:none !important}` esconde las dos filas y la
   navegación va por `#ecoAdvSelect` — que en Básico salía **vacío**. Medido después: en Básico el
   desplegable ofrece exactamente `refs`, y en Avanzado los módulos más `refs`.
   Se mira el **atributo** y no `style.display` porque esta función puede correr **antes** que
   `applyViewMode` en el arranque, y ahí ningún botón tiene el display puesto todavía.

### Los dos textos de ayuda

| Decía | Dice |
|---|---|
| «Básico muestra solo el estudio principal (fila 1). Avanzado suma módulos especiales y herramientas — elegí cuáles ver.» | «Básico muestra el estudio principal y Referencias, que nunca se oculta. Avanzado suma los módulos especiales —elegí cuáles ver— y el Laboratorio.» |
| «Módulos visibles (filas 2 y 3). Laboratorio aparece siempre en Modo Avanzado.» | «Módulos visibles. Laboratorio aparece siempre en Modo Avanzado. Referencias —y Calculadoras, que vive adentro— están siempre, en los dos modos.» |

### NO se migra nada

Un `ett_modules` guardado con `{"refs":false,"calculadoras":false}` sigue en `localStorage` y abre
**sin error**: nadie lee más esas dos claves —`eeModOn` se consulta sólo por el atributo de un
botón que existe— así que el valor viejo queda **inerte**. Reescribir el `localStorage` del médico
para «limpiarlo» sería migrar, que la orden prohíbe. Medido: los dos controles visibles en los dos
modos con esa configuración puesta, y el valor sigue ahí.

**La casilla «Deformación» no se tocó** (strain manual con contraseña, decisión aparte).

---

## AJ6-4b · El buscador tapa las fichas mientras busca

### El reparto, que es lo que evita que se pisen

| Función | Toca las fichas | Toca el campo |
|---|---|---|
| `_refSubActivar(sub)` | **sí** (marcas y paneles) | no |
| `_refBuscLimpiar()` | no | **sí** (campo y resultados) |
| `_refBuscEntrar()` | **sí** (apaga las seis) | no |
| `_refBuscSalirDelCampo()` | las repone | las vacía |
| `refSubTab(sub, el)` | `_refBuscLimpiar()` **y después** `_refSubActivar(sub)` | — |
| `refBuscar()` | compone las dos según el largo de la consulta | — |

`_refSubActivar` se **extrajo** del cuerpo de `refSubTab`: no es código nuevo.

⚠️ **Si la salida por «texto corto» llamara a `refSubTab`, esa función limpiaría el campo**: la
primera letra de «tapse» se borraría sola y el buscador **nunca** llegaría a dos caracteres.
Medido antes de partirlo así. Por eso esa rama hace `_refSubActivar` directo y deja el texto.

El orden dentro de `refSubTab` también importa: primero el campo y después las fichas. Al revés,
la rama de salida de `refBuscar` activaría la sub-pestaña **anterior** y pisaría la que el médico
acaba de tocar.

### `_refBuscPrev` es bandera y memoria

`null` = no se está buscando. Al entrar guarda `_refSubActiva`; al salir, repone ésa.

### El tab stop se conserva

Mientras hay búsqueda los seis botones pierden `.active` y `aria-selected`, pero **el que estaba
activo conserva `tabIndex = 0`**: un tablist sin un solo elemento tabulable deja la barra fuera del
teclado, y acá no hay nada más que la reponga.

### ⚠️ «Salir del buscador» va con guarda de puntero y no con `relatedTarget`

Dos cosas, las dos medidas:

* el `blur` se dispara **antes** del `click`, así que reponer y vaciar en el `blur` borra los
  botones de resultado y **el resultado se vuelve intocable**;
* mirar `document.activeElement` no alcanza: en **WebKit** un `<button>` **no recibe el foco** al
  hacerle clic, así que la guarda no distinguiría un clic dentro del buscador de uno afuera.

Entonces: `pointerdown` en el host marca `_refBuscPtrDentro`, el `blur` se decide con
`REF_BUSC_SALIDA_MS = 120` ms y, si la marca está puesta, no se sale (y la marca se baja ahí mismo,
para que el próximo `blur` por teclado sí salga).

### Los siete pasos, medidos

| Paso | Fichas | Botón marcado | Texto |
|---|---|---|---|
| sub-pestaña «Válvulas» | `ref-sub-valv` | `valv` | — |
| se tipea «tapse» | **ninguna** | **ninguno** (tab stop en `valv`) | tapse, 4 resultados |
| se borra el texto | `ref-sub-valv` | `valv` | — |
| una sola letra «t» | `ref-sub-valv` | `valv` | **«t» se conserva** |
| «ta» | ninguna | ninguno | 30 resultados |
| se toca «Aorta» | `ref-sub-ao` | `ao` | **vacío** |
| se sale del campo | `ref-sub-ao` | `ao` | **vacío** |
| se toca un resultado | la del resultado, destacada | la suya | **vacío** |

---

## Los cinco casos de prueba

| Caso | Qué fija |
|---|---|
| **TC-527** | AJ6-1: la fila vacía, el título, los dos renglones **literales**, las tres frases ausentes en las tres superficies y en los tres estilos, el `resumen` del PPT conservándolas, la `clave` intacta, la hoja del PDF sin subtítulos, el tercer renglón de la CIV, el fuera de rango y el control negativo |
| **TC-528** | AJ6-2: dieciséis ⓘ y **cero prosa suelta**, el estado siempre visible, las recomendaciones antes de la tabla, los dos bloques con su leyenda, el plegado sin conteador, la regla de dos columnas **leída de `document.styleSheets`**, el ciclo de contestar con un ⓘ abierto, y el control negativo de que ninguna otra sección quedó compacta |
| **TC-529** | AJ6-3: las cuatro columnas en orden, los **veinte** campos en la columna que les toca, el ⓘ del Balik, la conclusión y el botón fuera de las columnas y después de ellas, los dos escalones de reflujo **leídos de la hoja de estilos**, y el informe y el EN SUMA con el módulo integrado |
| **TC-530** | AJ6-4a: `EE_MODULES` sin las dos claves, ningún `data-mod` de las dos, el invariante en los dos sentidos, los dos controles visibles en los dos modos, el desplegable de móvil, la configuración vieja sin migrar, el control negativo de un módulo que sí se apaga, y la reposición del estado |
| **TC-531** | AJ6-4b: los ocho pasos de la tabla de arriba, el tab stop, la letra que no se borra y el clic en un resultado |

⚠️ **Dos casos se reescribieron al contrato nuevo**: TC-502 (A1b) y TC-509 (F1) exigían
`data-mod="calculadoras"` en la sub-pestaña. Hoy exigen lo contrario —que **no** lo tenga— y
siguen exigiendo que sea un `<button>` y el primero de la barra.

⚠️ **La geometría de las media queries NO se mide en el arnés**: su ventana de Chrome abre por
debajo de 1100 px, así que ni las cuatro columnas del pulmón ni las dos de la Evidencia se aplican
mientras el caso corre. Las dos condiciones **leen la regla** de `document.styleSheets` y la exigen
por su forma, que es la lección de TC-522 (A4c) de la tanda AJ5. TC-529 lo declara en una condición
propia (`innerWidth < 1100`).

---

## ⚠️ La tanda AJ7 movió DOS cosas de la Fallot (24/10/2026)

1. **La línea del EN SUMA ya no publica la insuficiencia pulmonar** —la sección de la válvula
   pulmonar la emite más arriba desde el mismo `ip_grado`—. `ipHayInsuf(ip)` **se queda en la
   compuerta**: decide si el EN SUMA *nombra* la cardiopatía, no qué dice de ella.
2. **`resumen` pasó a ser el texto descriptivo completo**, así que la hoja de congénitas del PDF
   y la diapositiva del PPT dejaron de publicar la conducta. `sumaTV` salió; `conducta` se
   devuelve y nadie la publica; `clave` no cambió.

Todo en **`docs/mapa/aj7-correcciones.md` § 1**. Cierra AJ6-a y AJ6-b.

---

## ➜ La tanda «C2» (2026-10-28) — la pantalla pulmonar perdió su botón de integrar

Puntero. El relato vive en **`docs/mapa/c2-pulmon-constriccion-forrester.md`** §2.

Las **cuatro columnas no se tocaron**, ni un campo cambió de columna. Lo que salió de debajo de
la conclusión es el botón «📎 Integrar al informe», con el bloque «Eco Pulmonar» del ETT Avanzado
al que integraba: desde la C2 el eco pulmonar llega al cuerpo del informe **por el dato**.
