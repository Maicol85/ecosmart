# PR12 · TAREA 6 — Informe de SOLO LECTURA: los segmentos del SGL del visor

**Fecha:** 2026-11-25 · **Árbol leído:** `2830208`, sello `v20261124-2316`, md5 `a5ce3ab2`.
**No se cambió una línea de `index.html` por esta tarea.** Todo lo de abajo está leído del
código y de los comentarios que ese código ya traía, con la línea donde vive cada cosa.

> ⚠️ **LA PREMISA DE LA ORDEN NO SE REPRODUCE, Y ES EL HALLAZGO PRINCIPAL.** La orden dice
> «cada vista apical da 6 segmentos». **No**: cada vista apical da **DOS** valores —las dos
> paredes del trazado, partidas en el ápex— y el visor **no calcula strain por segmento en
> ningún momento**. Los 17 segmentos de la diana son una **forma de dibujo**: cada segmento
> toma el color y el número del **territorio** que le corresponde, y los tres segmentos de una
> pared llevan **el mismo** número porque son **una sola medición repartida**. Lo dice el
> propio comentario del módulo (`index.html` ~153305): «Lo que se mide es la pared ENTERA, no
> basal/medio/apical: los tres segmentos de un territorio llevan el MISMO número porque es una
> sola medición repartida, no tres».

---

## (a) Cómo calcula hoy el visor el strain, y qué obtiene de cada vista

### El gesto y el dato crudo
Por **ventana apical** el médico traza **dos contornos** del borde endocárdico —uno en
diástole y uno en sístole— con la herramienta **Deformación** del visor (`medHerramienta('strain')`).
Cada contorno se cierra en `_strainAceptar` (~152386), que guarda:

| campo | qué es |
|---|---|
| `bordeCm` | largo del trazo **ABIERTO** entero, en cm |
| `arcoAcm` | **primera pared**: del inicio al **ápex** |
| `arcoBcm` | **segunda pared**: del ápex al final |
| `cuerdaCm` | la recta que cierra el contorno — **NO es pared** y no entra en el cálculo |
| `Lcm` | eje largo anillo → ápex |
| `metodo` | `libre` o `3pt` |

El ápex lo da `_simpEje(pts)`; **esa es la única partición posible** y el código explica por qué
(~152393): «el ápex y los dos extremos del anillo son los únicos puntos que los dos contornos
comparten como referencia anatómica».

### La fórmula, por territorio
En `_strainCalcular` (~152474):

```
pct = (arco_sístole − arco_diástole) / arco_diástole × 100
```

con **un `pct` por arco**, o sea **dos por ventana**. El SGL es el **promedio** de los
territorios, cada uno pesando igual (`_strAgregar`, ~152459).

### ⚠️ Partirlo en más tramos NO da más información, y está medido en el código
Comentario de `_strainAceptar` (~152396): «Partir por arco igual en más tramos da —medido,
dispersión exactamente cero— el mismo número en todos, porque dividir cada contorno en k partes
iguales DE SU PROPIA longitud devuelve el global k veces». Es decir: con la geometría que hoy se
guarda, cortar cada pared en basal/medio/apical por longitud de arco devolvería **tres veces el
mismo número**, no tres mediciones.

### Qué paredes da cada ventana
De `_STR_VISTAS` (~152312), y el rótulo **depende de la dirección en que se traza**, que el
panel indica y el código declara:

| ventana | orden de trazado | pared A (`arcoAcm`) | pared B (`arcoBcm`) |
|---|---|---|---|
| **A4C** | del anillo INFEROSEPTAL, por el ápex, al ANTEROLATERAL | Inferoseptal | Anterolateral |
| **A2C** | del anillo INFERIOR, por el ápex, al ANTERIOR | Inferior | Anterior |
| **A3C** | del anillo ANTEROSEPTAL, por el ápex, al INFEROLATERAL | Anteroseptal | Inferolateral |

### Qué SEGMENTOS pinta cada pared
De `_STR_SEG_FUENTE` (~153360). La numeración sale de `EE_SEGS`, la misma del bull's eye del
informe (declarado en ~153330).

| ventana | pared | segmentos que pinta | dónde va el número |
|---|---|---|---|
| A4C | Inferoseptal | **3, 9** | 9 |
| A4C | Anterolateral | **6, 12** | 12 |
| A2C | Inferior | **4, 10, 15** | 10 |
| A2C | Anterior | **1, 7, 13** | 7 |
| A3C | Anteroseptal | **2, 8** | 8 |
| A3C | Inferolateral | **5, 11** | 11 |

Y **dos segmentos compartidos**, que se pintan con el **promedio** y **sólo si las DOS paredes
tienen valor** (`deSegmento`, ~153408):

| segmento | lo comparten | se pinta con |
|---|---|---|
| **14** (septal apical) | Anteroseptal + Inferoseptal | promedio de las dos |
| **16** (lateral apical) | Anterolateral + Inferolateral | promedio de las dos |

**El número se imprime UNA sola vez por territorio**, en su segmento del anillo **medio**
(`_STR_SEG_ROTULO`, ~153373): repetirlo en los tres «los haría leer como tres mediciones que
dieron igual».

**Por ventana, entonces:** 1 ventana → **4 segmentos pintados** y **2 números**.

---

## (b) Cuántos de los 17 se obtienen hoy combinando las tres ventanas

Con **A4C + A2C + A3C** trazadas (seis paredes):

| | cuántos | cuáles |
|---|---|---|
| **segmentos con COLOR** | **16 de 17** | 1 a 16 |
| **segmentos SIN color (grises)** | **1** | **17 — el ápex** |
| **valores independientes** | **6** | uno por pared |

- **Los 16 se pintan, pero con 6 números.** Los tres segmentos de una pared llevan el mismo
  valor; 14 y 16 llevan un promedio de dos paredes. O sea: **16 segmentos coloreados** y
  **6 mediciones**.
- **El 17 queda SIEMPRE gris**, y es una decisión declarada (Maicol, 2026-09-20, ~153372): «el
  ápex no es de ninguna pared» y «este método no lo mide». El trazado del borde endocárdico pasa
  **por** el ápex —es el punto de partición— pero no delimita un casquete, así que no hay dos
  longitudes que comparar para él. El propio dibujo lo dice en el papel: «el ápex (17) no lo mide
  este método» (~153470).
- **Con menos ventanas:** 1 ventana → 4 segmentos (y 14/16 grises); 2 ventanas → 8 segmentos;
  3 ventanas → 16. Las condiciones de **TC-201** fijan exactamente esa progresión.

---

## (c) ¿Combina hoy vistas distintas del mismo estudio en un solo mapa?

**SÍ, por las dos puertas, y ya está hecho.** No haría falta nada.

1. **Dentro de un mismo panel del visor.** `_strain.vistas` tiene **tres casilleros**
   —`{a4c, a2c, a3c}`— y `medStrainVistaSiguiente()` (~152971) pasa al siguiente sin perder el
   anterior. `medStrainElegirLoop` + `medStrainElegirVista` (~153068 y ~153091) dejan elegir el
   cineloop y declarar qué ventana es. Se puede además usar **un mismo cineloop para dos
   ventanas**, y el código lo declara a propósito (~152976).
2. **Entre los dos paneles (vista A y vista B).** `_strTerrVivos()` (~152517) recorre
   `_vTodas()` y junta los territorios de los dos, **deduplicando por `ventana|pared`** —no por
   posición—: «el mismo territorio medido en los dos paneles es una medición repetida, no dos».
   Gana la primera vista que lo tenga (A antes que B), igual que la tabla de Simpson.

**La diana es UNA sola y compartida**: `_strResultadoVivo()` (~152538) es el único productor de
lo que la diana pinta, lo que la captura rotula y lo que se guarda. Antes de esa función había
**dos dianas** con dos SGL distintos del mismo ventrículo (medido: −20,8 y −19,7), y el
comentario lo registra.

**Dos compuertas y dos salvedades, que ya existen:**
- `_vEpocaVigente(V)` descarta la sesión de **otro estudio**, así que la diana no puede publicar
  al paciente anterior.
- Las salvedades se **arrastran de cualquiera** de las vistas: `mismaImagen` (las dos fases
  trazadas sobre imágenes distintas) y `mezclaMetodo` (una fase a mano y la otra con 3 puntos,
  medido en ±3,7 a ±4,4 pp).

---

## (d) Qué campos de la pestaña SGL podría alimentar el visor, y cuáles no

**Hoy el visor NO escribe ningún campo de la pestaña SGL.** Lo único que escribe en el
formulario desde el módulo de medición es la **FEVI biplano** de Simpson, por
`_simpEscribirFEVI`, y con su pregunta antes de pisar. El resultado de strain del visor se
persiste aparte, con el estudio, por `_strainResumenDeVista` → `_strainPersistir` (~153770 y
~153829): ahí viajan `sgl`, `nVistas`, `vistas`, `etiqueta`, `mezclaMetodo`, `plausible`,
`invertido`, la lista de `terr` y los `metodos`.

### Podría alimentar

| campo de la app | id | qué tendría del visor |
|---|---|---|
| **SGL global (%)** | `sgl_gls` | `R.sgl`, el promedio de los territorios. Es el mismo campo que ya escribe `scUsarComoSGL` desde la tabla «Cálculos de strain» (~144211), por su camino normal y con la misma pregunta si ya tiene valor. |
| **Los 16 segmentos de la diana** | `strainEstado` / `strainNum`, por `strainSet(id, tramo, num)` | los 6 valores de pared, repartidos en sus 16 segmentos. |
| **las tres claves persistidas** | `strain_sgl`, `strain_sgl_num`, `strain_sgl_ver` | se escriben solas al escribir los segmentos. |

### No podría alimentar

| campo / celda | por qué |
|---|---|
| **segmento 17 (ápex)** | el método no lo mide: no hay dos longitudes que comparar para el casquete. |
| **los tres niveles de «Cálculos de strain»** (basal, medio, apical) | el visor mide la **pared entera**; esas tres celdas exigen **todos** los segmentos de su nivel con número y publicarían **tres números iguales** sobre una sola medición. El nivel apical de esa tabla son los cuatro apicales **sin** el casquete, y dos de ellos (14 y 16) son promedios de dos paredes. |
| **g17 y g16 de esa tabla** | g17 exige los 17 y el 17 no existe acá; g16 saldría igual al SGL por construcción, porque los 16 son 6 valores repetidos. |
| **apical sparing y FEVI/SGL** | derivan de las celdas de arriba, así que heredan el mismo reparo. |
| **Comentarios / notas de strain** | `sgl_notas` es texto libre del médico, no una medición. |

### ⚠️ Lo que haría falta decidir antes, y es clínico y no técnico
Escribir los 16 segmentos desde 6 mediciones deja un bull's eye por segmento **que se ve igual
que uno medido por speckle tracking** y no lo es: los tres segmentos de una pared son el mismo
número. El propio módulo ya declara que **no gradúa severidad** y que **no publica atribución
coronaria** por esa razón, y que el corte de −16 % del marco HFA-ICOS está definido para GLS por
speckle tracking, «que NO es esto». **Nada de eso se tocó en esta tanda.**
