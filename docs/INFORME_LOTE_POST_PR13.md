# Informe — Lote post-PR13 (2026-11-28)

Ocho grupos, A a H. **Los ocho se hicieron.** Lo que sigue es qué se encontró, qué se cambió y qué
quedó declarado sin tocar.

---

## Lo que la medición dio vuelta

Tres premisas del pedido **no se reprodujeron**, y las tres cambiaron qué había que hacer.

### 1 · El copiado en Pages no fallaba por el HTML (grupo B)

El pedido daba por sentado que faltaba fijar el tamaño en algún bloque. **No faltaba en ninguno**:
leyendo el portapapeles de verdad, las dos vías de copiado entregaban `font-size:11pt` en los
**doce** elementos con texto.

Lo que convierte es **macOS**. Medido con `textutil`, el mismo motor de Cocoa que Pages usa al
pegar HTML (el `\fs` del RTF va en **medios puntos**):

| se declara | llega | Pages muestra |
|---|---|---|
| `11pt` | `\fs29` | **14,5** |
| `11px` | `\fs22` | **11,0** |

Cocoa resuelve los puntos a píxeles a 96 ppp y después los lee **como puntos**. **Así que para que
Pages muestre 11 hay que declarar 11 píxeles**, que es lo contrario de lo que el pedido decía
(«en pt y no en px»). Se hizo lo que la medición dice, queda en **un solo dueño** y **falta probar
Word**, que tiene su propio importador. → **L13-b**

### 2 · El corte de 18 % del reservorio es el que el comité respalda (grupo F3)

El pedido decía que el 18 % «corresponde a otro contexto (guía diastólica)» y que el límite
inferior de lo normal es **23 %**.

Leída la guía de strain de la ASE en la biblioteca —**Thomas y cols., JASE 2025;38(11)**, con la
regla **`folio = hoja + 984`** comprobada en el pie impreso de las hojas 1, 11 y 23—:

- **Hoja 23, folio 1007:** «the committee believes that using **LASr < 18%** would provide the…» y,
  entre sus puntos clave, «Impaired LASr of **<18%** is associated with elevated LV filling
  pressures». **El 18 % es la recomendación del comité.**
- El **23 %** existe en esa misma hoja, pero es de **un estudio de 139 pacientes** que la guía
  cita, no su recomendación.
- **Hoja 11, folio 995:** el valor **normal** del reservorio es **39 %** (IC 95 % 38-41), de un
  metaanálisis de 2.542 sanos en 40 estudios.

**El corte no se tocó.** El valor normal sí se precisó a 39 %.

### 3 · El cálculo del strain del VD no estaba mal (grupo F1)

El pedido pedía «reportar qué mide hoy el cálculo y ajustarlo si no coincide». Medido:
`_vdCalcular` hace `(Ls − Ld)/Ld` sobre el **largo del trazo que el médico dibujó**, o sea **mide
exactamente lo que se traza**. **No hubo nada que ajustar**: lo que estaba mal era lo que la
pantalla le pedía trazar («hasta el anillo septal», que contradice «no incluyas el septo»).

---

## Grupo por grupo

| grupo | qué se hizo | medido |
|---|---|---|
| **A** | Las dos líneas del aviso quemado se miden dentro del dibujante y se parten en los renglones que entran, con márgenes parejos | 300, 640 y 1000 px: **cero** textos fuera del canvas, descargo **entero** palabra por palabra, **cero** puntos suspensivos. Antes, a 640 px la primera medía **850 px contra 640** |
| **B** | El tamaño pasa a píxeles, con un solo dueño | El HTML real de los dos copiados, por `textutil`: **`\fs22`** = 11 pt exactos |
| **C1** | La casilla del NT-proBNP dice «por encima del límite superior del laboratorio local», con globo que cita **Lyon 2022**, sin `title` | Globo 44×44, abre, cita Lyon 2022, **sin números** y **no tildea la casilla** |
| **C2** | Salen las tres frases de **AF-4** y **AF-5** de las notas del Simpson | Las nueve entradas siguen siendo nueve; lo que la fuente sí dice se queda |
| **D** | Retroceder con el dedo sobre lo dibujado, en las **seis** herramientas de arrastre a la vez | La función pura en siete casos y el gesto en ocho, incluido el **retroceso lento** |
| **E** | «‹ Cambiar vista» con su salida sin elegir y su pregunta | Siete escenarios; **los valores de dos ventanas no se mezclan** |
| **F** | Los cuatro textos del VD, el doble signo, las dos citas al globo, el cuadro propio de cada trazo y la pre-contracción | Conducto −43,75 publicado con **un solo** menos; en el cuadro 3 sale **sólo** «AI mín.» |
| **G** | **Nada: ya estaba hecho.** Verificado | Iconos 14 px con toque 44×44; tras calcular la flecha escribe **−15,7** en `sgl_gls` |
| **H** | Pantalla completa con `requestFullscreen`, controles que se esconden a los 3 s, pausa al tocar y barra espaciadora | Botón 44×44 **debajo** del de columna en un racimo apilado; **no pausa** con la columna a la vista ni mientras se mide |

---

## Dos defectos que la sonda cazó y la lectura no

1. **`cinePlay` NO EXISTE.** El dueño del play y de la pausa es `cineToggle`, que ya hace el
   toggle. La primera versión del grupo H llamaba a una función inexistente.
2. **La fila de controles de reproducción no tenía `id`**, así que la regla que la hace flotar en
   pantalla completa **no aplicaba a nada**.

---

## Cobertura

**Ocho casos nuevos, TC-1072 a TC-1079**, uno por grupo, y **los ocho caen 0/8 contra `d3e08ed`**
con el mismo archivo de casos y sólo el `index.html` distinto, **por condiciones y ninguno por
excepción**.

**Cuatro casos adaptados**, todos consecuencia autorizada:

| caso | por qué |
|---|---|
| **TC-1064** | **INVERTIDO**: exigía el literal `font-size:11pt`, que es lo que daba el 14 |
| **TC-204** | **INVERTIDO**: el corte del reservorio se describe en pantalla y su cita vive en el globo |
| **TC-205** | **INVERTIDO**: el folio del strain del VD salió del texto de pantalla |
| **TC-471 / TC-500 / TC-502 / TC-535** | conteos de inventario: `VINFO` 156 → **157**, tarjetas sin botón de Referencias 82 → **83**, globos con piso táctil 70 → **71** |

### Mutaciones: 38/38 muertas

Hicieron falta **cuatro pasadas**, y las tres primeras dejaron 10, 3 y 1 sobreviviente:

- **Seis huecos reales de cobertura**, cerrados con condiciones nuevas y **sin aflojar una sola
  mutación**: los márgenes parejos del descargo; el piso de puntos del retroceso, que con cinco
  puntos no se ejercitaba; el orden «retroceso antes de decimar», que un trazo recto no podía
  probar y necesitó uno **en U**; el cuadro de referencias del VD, que sólo se dibuja con
  resultado; el guardado del cuadro en `_contornoLargo`, que el caso salteaba sembrando a mano; y
  el botón de salida que no se esconde, cuya opacidad **transiciona** y había que medir en la hoja
  de estilos.
- **Tres mal escritas o mal dirigidas**: la del botón «arriba del de columna», que agregaba otro
  botón y dejaba el real en su lugar; la del doble signo, que buscaba dos menos **tipográficos**
  cuando el defecto mezcla el tipográfico con el ASCII de `toFixed`; y «el botón queda arriba»
  medida por `top`, que con dos ids iguales no distingue nada.
- **Dos equivalentes, declaradas**: quitarle el `preventDefault` al globo —Chrome **no** activa el
  label cuando el clic cae sobre un botón hijo— y «la flecha escribe en otro campo», porque `sgl`
  y `sgl_gls` están espejados. Las dos se reapuntaron a algo del mismo grupo que sí se ve.

---

## Verificación

- **Semgrep 126 WARNING / 0 ERROR** — la línea base exacta, sin un aviso nuevo.
- **Celular: 38 ALTA** — la línea base exacta, medido con la máquina sola.
- **17 de 17** bloques de JS inline parsean.
- **Tres anchos** (1440, 768 y 390 px) de lo que cambió visualmente: el racimo del visor en
  **columna** con el botón de 44×44 **debajo** del de columna y **dentro de la imagen**, el globo
  del NT-proBNP en 44×44 **dentro de la pantalla**, y **cero** desplazamiento horizontal del
  documento en los tres.
- **La suite completa NO se corrió, por orden expresa.** Se corrió la **banda relacionada**: los
  casos cuyo cuerpo toca alguna de las zonas de los ocho grupos, seleccionados por el **patrón de
  su propio cuerpo** y no a ojo (`scripts/_lotes_lote13.sh`).

### ⚠️ El pendrive `DISK_IMG` NO estaba montado

Los **diecisiete** casos que dependen de él —**TC-181 a TC-197**— **no prueban nada** en esta
corrida y **no son cobertura**. El arnés lo dice con todas las letras: «no se encontró
/Volumes/DISK_IMG/GEMS_IMG: quedó SIN verificar con archivos del ecógrafo». Queda declarado, y
**ninguno de los ocho grupos de este lote toca ese camino**.

---

## Lo que quedó sin hacer, y por qué

| id | qué |
|---|---|
| **L13-b** | **Pegar el copiado en Word.** No se puede medir desde acá. Si sale chico, el valor a probar es `'14.6667px'` y es **una línea** |
| **L13-f** | Los valores **normales** del conducto (23 %) y la contracción (17 %) existen con folio (Thomas 2025, hoja 11, folio 995) y hoy la app dice «sin corte publicado». **Agregarlos es contenido clínico y lo decide el médico** |
| **L13-g** | Cuántos trazados pide el LARS: hoy **tres**, los tres obligatorios. **Reportado y no cambiado**, como la orden pide |
| **L13-h** | La graduación por Z del seno de Valsalva y otras decisiones de la biblioteca que nunca llegaron a los registros de la app siguen abiertas |

**AF-2 y el NT-proBNP de FA del HFA-PEFF no se tocaron**, por orden expresa.
