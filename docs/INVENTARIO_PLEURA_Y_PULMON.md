# Inventario · pleura y pulmón en las dos pantallas

**Tanda PANT-8, commit 7a (2026-11-04). SOLO LECTURA: este documento no cambió una línea de
`index.html`.** Todo lo que sigue está medido en la aplicación, no leído de memoria.

El pedido es que el médico decida con datos si la pleura del básico y la del posoperatorio deben
compartir un dato, y qué costaría. Acá está lo que hay, lo que falta y lo que le toca decidir.

---

## 1 · Lo que hay — los campos del básico

Pestaña **Pericardio y pulmón**, sección **🫁 Ecografía pulmonar**. Prefijo `pua_`, salvo dos
campos legados con prefijo `pul_`.

| id | rótulo | tipo | opciones |
|---|---|---|---|
| `pua_desliz` | Deslizamiento pleural | select | — · presente · reducido · abolido |
| `pua_desliz_lado` | Lateralidad del deslizamiento | select | bilateral · derecho · izquierdo |
| `pua_lineasa` | Líneas A | select | — · presentes · ausentes |
| `pua_punto` | Punto pulmón | select | — · sí · no |
| `pua_lineasb` | Líneas B | select | — · ausentes · presentes |
| `pua_lineasb_cant` | Cantidad | select | focal · múltiples · coalescentes |
| `pua_z_ant_d` `pua_z_lat_d` `pua_z_bas_d` | Zonas derechas: anterior, lateral, basal | casilla | — |
| `pua_z_ant_i` `pua_z_lat_i` `pua_z_bas_i` | Zonas izquierdas: anterior, lateral, basal | casilla | — |
| `pua_derrame` | Derrame | select | — · no · sí |
| `pul_derrame_tam` | Tamaño | select | — · mínimo · moderado · severo |
| `pua_derrame_tipo` | Tipo | select | — · libre · tabicado |
| `pua_balik` | Distancia máxima entre pleuras (mm) | número | — |
| `pua_derrame_lado` | Lateralidad | select | — · unilateral derecho · unilateral izquierdo · bilateral |
| `pua_consol` | Consolidación | select | — · no · sí |
| `pua_consol_bronco` | Broncograma | select | — · con · sin · fluido |
| `pul_consol_nota` | Consolidación — nota | texto | — |

**Son veinte campos** (seis de ellos casillas de zona). El detalle del derrame y el del broncograma
sólo se muestran cuando su selector de presencia está en «sí»: con el formulario vacío la sección
dibuja **siete** campos.

**Qué emite al papel.** Un emisor único, el bloque «13c» de `generarInforme`: **un párrafo** al
cuerpo del informe y **una línea** al EN SUMA, compuestos uniendo las frases que ya existen.
Desde la tanda B-E3 el detalle va al **cuerpo** del informe y **no** a una hoja aparte del PDF; la
hoja de «ETT Avanzado» no se arma para el pulmón. Al PPT no llega por un emisor propio: viaja
dentro del texto del informe. Al Excel llegan los campos por `LAB_XLS_MAP`.

## 2 · Lo que hay — los campos del posoperatorio

Pestaña del **posoperatorio de cirugía cardíaca**, tarjeta **«Pleura y pulmón»** (tanda POP-B).

| id | rótulo | tipo | opciones |
|---|---|---|---|
| `pop_pleura_der` | Derrame derecho | select | — · leve · moderado · severo · ausente |
| `pop_pleura_izq` | Derrame izquierdo | select | — · leve · moderado · severo · ausente |
| `pop_pleura_caract` | Características | select | — · libre · loculado · hemotórax |
| `pop_pulmon_lineasb` | Líneas B | select | — · ausentes · focales · difusas |
| `pop_pulmon_consol` | Consolidación | select | — · ausente · der · izq · bilateral |
| `pop_pulmon_neumo` | Neumotórax | select | — · ausente · sospecha · presente |

**Son seis campos.** Lo que emiten sale de `popPatron()` y de la hoja del posoperatorio: la línea
de pleura del informe integrado, la hoja del PDF y la diapositiva del PPT. Además **alimentan el
dibujo** del posoperatorio (ver el inventario 7c).

## 3 · Lo equivalente, y en qué difieren

| tema | básico | posoperatorio | ¿sincronizan? |
|---|---|---|---|
| derrame pleural, presencia | `pua_derrame` (sí/no) | implícito en los dos selectores por lado | **no** |
| derrame, severidad | `pul_derrame_tam`, **UNA** para las dos pleuras | `pop_pleura_der` y `pop_pleura_izq`, **una por lado** | **no** |
| derrame, lado | `pua_derrame_lado` (unilateral D · unilateral I · bilateral) | el lado ES el campo | **no** |
| derrame, característica | `pua_derrame_tipo` (libre · tabicado) | `pop_pleura_caract` (libre · loculado · hemotórax) | **no** |
| derrame, medida | `pua_balik`, distancia máxima entre pleuras en mm | **no existe** | — |
| líneas B | `pua_lineasb` + `pua_lineasb_cant` + **seis casillas de zona** | `pop_pulmon_lineasb` (ausentes · focales · difusas) | **no** |
| consolidación | `pua_consol` + `pua_consol_bronco` + nota | `pop_pulmon_consol` (con el lado dentro del mismo campo) | **no** |
| neumotórax | `pua_punto` (punto pulmón) + deslizamiento abolido | `pop_pulmon_neumo` (ausente · sospecha · presente) | **no** |
| deslizamiento | `pua_desliz` + `pua_desliz_lado` | **no existe** | — |
| líneas A | `pua_lineasa` | **no existe** | — |

**CERO sincronía, verificado.** La única escritura cruzada que existe en el código es una
**migración de legado** —`pon('pua_derrame','si')` y `pon('pua_derrame_lado', …)` a partir del
campo viejo `pul_derrame_lado`—, que no tiene nada que ver con el posoperatorio. El posoperatorio
sólo es **leído** por el panel de Evidencia y por su propio dibujo.

**La diferencia que el médico señala, medida y confirmada:** el básico **no puede** expresar
«leve a la derecha y severo a la izquierda». Tiene un solo campo de severidad (`pul_derrame_tam`)
y un selector de lado con tres valores, así que «bilateral» obliga a una única severidad para las
dos pleuras, y la distancia de `pua_balik` es **una sola** medida. El posoperatorio sí puede, por
lado, pero **no** admite una medida en milímetros ni el tipo «tabicado» (dice «loculado») ni el
deslizamiento ni las líneas A ni las zonas.

## 4 · El espacio vacío de la sección «Ecografía pulmonar», medido

Con el formulario vacío —o sea con los siete campos que la sección dibuja sin detalle desplegado—,
el acordeón abierto y las transiciones apagadas:

| ancho | caja de la sección | campos visibles | filas | área ocupada por los campos | hueco al pie |
|---|---|---|---|---|---|
| 1440 px | 1230 × 412 | 7 | 4 · 1 · 1 · 1 | 19 % | **111 px** |
| 1000 px | 806 × 497 | 7 | 2 · 1 · 1 · 1 · 2 | 30 % | 109 px |
| 768 px | 734 × 497 | 7 | 2 · 1 · 1 · 1 · 2 | 30 % | 109 px |
| 390 px | 356 × 710 | 7 | uno por fila | 41 % | 120 px |

A 1440 px **el 81 % de la caja no es un campo**: son los rótulos de grupo, los separadores y las
tres filas de un solo campo. **Alrededor** de la sección, en la misma pestaña, están el derrame
pericárdico y el taponamiento, la constricción frente a la restricción, y la descripción
estructurada de la masa intracardíaca.

## 5 · Lo que falta, y qué costaría

**Propuesta ÚNICA de estructura de datos** para permitir lado y severidad independientes **sin
romper estudios viejos**:

| pieza | qué se hace | costo |
|---|---|---|
| severidad por lado | **reutilizar** `pop_pleura_der` y `pop_pleura_izq`, que ya existen y ya tienen las cuatro opciones, y hacer que el básico los escriba y los lea | **cero campos nuevos**, cero columnas de Excel |
| `pul_derrame_tam` | queda como **campo de legado**: se sigue leyendo para los estudios viejos y deja de escribirse | ninguno |
| `pua_derrame_lado` | queda derivado de los dos campos por lado y deja de ser editable | ninguno |
| medida por lado | `pua_balik` es **una sola** distancia; para medir las dos pleuras harían falta **dos campos guardados nuevos** | **decisión del médico** |
| tipo del derrame | `pua_derrame_tipo` (libre · tabicado) y `pop_pleura_caract` (libre · loculado · hemotórax) **no** tienen el mismo vocabulario | **decisión del médico** |

**Qué pasaría con los estudios guardados.** Un estudio viejo trae `pul_derrame_tam` y
`pua_derrame_lado` y **no** trae los dos por lado. La regla de la casa prohíbe reescribirlos, así
que el camino es el de `aoRaizReconciliar`: **reconciliar sólo cuando uno de los dos lados está
vacío**, derivando del par (tamaño, lado) de legado, y **no tocar nada** cuando los dos están
cargados y difieren. Con eso un estudio viejo se lee sin migrarlo y uno nuevo se guarda con el
dato por lado.

**Qué tocaría de Excel.** Las columnas de las dos pantallas ya existen por separado: con la
propuesta de arriba **el Excel se queda en 441 columnas con las mismas claves**, porque no se
agrega ningún campo guardado. Si el médico quiere la medida por lado, ahí sí entran **dos
columnas nuevas**, y eso rompe el conteo de 441 que toda la suite verifica.

---

## Decisiones que le tocan al médico

1. **¿El derrame pleural es UN dato con dos puertas, o son dos datos distintos?** El del básico
   describe un estudio de ecografía pulmonar y el del posoperatorio describe el posquirúrgico
   inmediato. Si son el mismo dato, la propuesta de arriba no cuesta ningún campo nuevo.
2. **¿Hace falta medir en milímetros cada pleura por separado?** Hoy hay una sola distancia
   (`pua_balik`). Dos medidas son dos campos guardados nuevos y dos columnas de Excel.
3. **¿«Tabicado» y «loculado» son la misma palabra?** Si lo son, los dos selectores pueden
   compartir vocabulario; si no, no se pueden unir.
4. **¿El posoperatorio debería poder registrar el deslizamiento, las líneas A y las zonas?** Hoy
   no los tiene, y son lo que el básico usa para el neumotórax y para el patrón global.
5. **¿El neumotórax se deduce o se consigna?** El básico lo deduce (punto pulmón y deslizamiento
   abolido) y el posoperatorio lo consigna en un campo propio con tres estados.
