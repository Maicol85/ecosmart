# Mapa — PANT-17b: la transparencia del 3D y la Evidencia que se arma con lo contestado

Por nombre de función y de constante, no por número de línea.

## 1. La transparencia de una estructura «sin color» (commit 1)

| pieza | dónde |
|---|---|
| el gris del contorno | `CM_SC_GRIS` (`0x8a93a8`), al lado de `CM_C` |
| el material | `_matSC`, dentro de `cm3dInit`, un `T.ShaderMaterial` |
| el aplicador | `cmSinColorAplicar`, al final de `setIns` |
| el estado | `_cm3d.sinColor`, memoria de sesión, se borra al cambiar la escena en `build` |
| las piezas, de solo lectura | `window._cm3dPiezas` → `_cm3dObjs` → `root.children` |

**La técnica.** El alfa se calcula **por píxel** del ángulo entre la normal de la superficie y la
dirección hacia la cámara, las dos en espacio de vista:

```
f   = 1 − |dot(normalize(vNrm), normalize(−vPos))|
rim = smoothstep(0.50, 0.92, f)
alfa = rim × 0.95 + 0.035
```

De frente el ángulo es cero y el píxel sale casi del todo transparente; en el borde la normal
mira de costado y ahí se dibuja el halo. `transparent:true`, `depthWrite:false` —para no tapar lo
de atrás, el mismo motivo por el que `ghost()` lo lleva— y **`side: FrontSide`**, para que el halo
no se duplique con la cara de atrás de la misma pieza.

⚠️ **NO es una malla de alambre, y ése era el defecto.** PANT-17 dejó
`MeshBasicMaterial({ wireframe:true, opacity:0.55 })`: una rejilla gris que tapa lo de atrás.

⚠️ **Se mide por PÍXELES y no por geometría** —un contorno no mueve un solo punto—, comparando
TRES cuadros del MISMO dibujo: todo normal, la estructura sin color, y la misma estructura
**oculta por completo**. Los tres se componen sobre el **fondo real del recuadro** antes de contar:
sin eso el lienzo sale premultiplicado y el halo no se distingue. El dibujo se quieta con la
**frecuencia en cero** y no con la pausa.

⚠️ **`_cm3dInsSet` y `_cm3dVistaSet` NO están en `window`**: son `let` de nivel de script y se
alcanzan por su nombre pelado.

Las sondas: `scripts/_probe_pant17b_tr.mjs` (los píxeles, dos motores, dos temas, diez escenas)
y `scripts/_probe_pant17b_tr2.mjs` (la lista de objetos, el gesto y la captura del PDF).

## 2. La Evidencia que se arma con lo contestado (commit 3)

**Un solo emisor para las diecisiete secciones.** Cada sección devuelve tres campos más y nada
más; todo el orden, la forma y el reparto viven en el emisor compartido.

| campo que la sección devuelve | qué es |
|---|---|
| `cuenta` | `{ si, no, sd }` → la línea del encabezado |
| `adapt` | los **objetos de pregunta** contestados que sí |
| `faltan` | los rótulos sin contestar |

| pieza del emisor | qué hace |
|---|---|
| `_indCajaReco(col, tit, cuerpo)` | el marco del recuadro, a un solo dueño: lo usan `_indRecomHTML` y `_indAdaptHTML` |
| `_indAdaptHTML(adapt, faltan)` | el recuadro **«Con lo contestado»** |
| `_indClaseOrden(p)` / `_indEsClase3(p)` | el orden por clase y el rótulo «no recomendado» |
| la línea del conteo | en `_indSecHTMLCuerpo`, al lado del botón «⇔ columnas», con `data-ind-cuenta` |
| el plegable | en `_bloRec`, un `<details data-ind-bloque>` con el rótulo «ⓘ Ver detalle de la guía» |

⚠️ **NO escribe un solo texto clínico.** La oración, su clase, su nivel, su hoja y su folio salen
del campo **`rec`** de la propia pregunta —el mismo que el ⓘ de la fila ya publicaba por
`_indPregNota`— y la línea de la otra guía de **`ref`**.

⚠️ **El plegable se marca `data-ind-bloque` y NO `data-ind-detalle`**: TC-293 cuenta **un** control
de detalle por sección. Y su rótulo es propio porque `_indRepintarConservando` indexa cada
plegable por «summary del padre ▸ summary»: con el mismo rótulo que el del pie, los dos
compartirían clave.

⚠️ **La causa de las siete líneas del contador era la CELDA, no el texto**: la fila vivía en la
tabla de datos clínicos, cuya columna de valor mide unos 60 px con el panel en 820 px.

⚠️ **El panel se REPINTA al contestar**: una lista de botoneras tomada una sola vez se desprende, y
del segundo clic en adelante se clickean nodos huérfanos. Hay que reconsultar en cada clic.

## 3. Lo que el control de las diez secciones agregó (commits 4 y 5)

| sección | qué entró | clase | hoja y folio |
|---|---|---|---|
| CIA | recomendación 2 de la ACC/AHA, al bloque | 1 · B-NR | hoja 35, folio e149 |
| CIV | recomendación 3 de la ACC/AHA, al bloque | 1 · C-LD | hoja 39, folio e153 |
| Defecto del septo AV | recomendación 2, como **pregunta** (13 → 14) | 1 · C-LD | hoja 42, folio e156 |
| Conexión venosa anómala | recomendación 8, como **pregunta** (9 → 10) | **3: Sin beneficio** · B-NR | hoja 45, folio e159 |
| Fontan | recomendaciones 3, 7, 14 y 16, al bloque | 1 | hoja 87, folio e201 |

**El tope es 14 preguntas** y no hay ninguna constante que lo fije: es la convención de las
órdenes. CIA, CIV, Eisenmenger, Fontan y Fallot reparada ya estaban ahí, así que lo que les falta
entra al **bloque** y no gana pregunta → `P17b-c`.

⚠️ **Antes de declarar que algo falta, hay que mirar los TRES lugares**: el campo `rec` de una
pregunta, su campo `ref` —donde vive la línea de la otra guía— y los bloques fijos de la sección.
Un censo que mire sólo `rec` da falsos «no está»: le pasó a la estenosis subaórtica y a la
supravalvular, cuya Clase I de la ESC ya estaba como línea de referencia.

⚠️ **Y la transposición guarda lo suyo en `TGA_IND_RECS`, `TGA_IND_RECS_ACC` y `TGA_IND_PREG`**, no
en el cuerpo de `_indTGA`. Un censo sobre el cuerpo da «no está» sobre seis recomendaciones que sí
están — incluida la de clase III, que la app escribe «cerclaje» y no «banding».
