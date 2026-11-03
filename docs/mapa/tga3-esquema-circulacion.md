# El esquema de circulación de la sangre de la TGA, y la conclusión a la izquierda — tanda TGA-3 (2026-11-01)

Mapa por **nombre de función y de constante**, no por línea. La línea cambia en cada edición; el
nombre, no.

Lo que esta tanda agregó: la **conclusión en la columna izquierda**, la **conducta fuera del
papel**, el **esquema de circulación** con sus seis escenarios y su **ⓘ**. Lo que **paró** está en
`docs/PENDIENTES.md` → `T3-a` a `T3-g`.

**Cero campos guardados nuevos. Cero columnas de Excel. Excel en 441 columnas con las mismas
claves. Censo de campos idéntico.**

---

## 1 · La conclusión en la columna izquierda (commit 1)

El médico la pidió en el hueco que la maqueta de CONG-2A dejaba vacío bajo los campos. Medido
antes de tocar nada, con el tipo cargado:

| ancho | campos | recuadro del 3D | hueco bajo los campos | conclusión (antes) |
|---|---|---|---|---|
| 1440 | 549×344 | 631×700 | **368 px** de alto × 549 de ancho | 1168×34 al pie, a ancho completo |
| 1000 | 358×350 | 406×813 | **475 px** × 358 | 688×30 al pie |
| 768 · 390 | — | — | (apilado, sin hueco) | al pie |

Después: la caja pasa a **549×67 en (211, 913)**, justo bajo el último campo, que termina en
y=901. El alto de la sección baja de **927 a 864 px** a 1440 y de **1056 a 977** a 1000.

**El mecanismo es una línea de CSS y un `id`:** `#tga-concl-box` es el **último hijo** de
`#tga-campos` con `grid-column:1 / -1`. Así `#tga-fila` sigue teniendo **exactamente dos hijos**
—la grilla y el recuadro del 3D—, que es lo que deja la maqueta de 900 px intacta: el flex no ve
un tercer item. Por debajo de 900 px queda apilada **después de los campos y antes del
diagrama**, que es el orden que la orden pide.

**El contenido NO cambia**, y está medido: la conclusión mide **214 caracteres en los dos
árboles**. Lo que se mueve es dónde se dibuja.

⚠️ **LA MÉTRICA `pisaConcl` DE `_probe_cong2a_pant.mjs` INFORMA UN SOLAPE QUE NO EXISTE, y no es
un defecto.** Compara **sólo el eje vertical** —`(host.y + host.h) > concl.y`—, y eso era correcto
mientras la conclusión estuviera **debajo** del lienzo. Desde que vive al lado, dos cajas
lado a lado comparten rango vertical **por diseño**. La intersección en los **dos** ejes es
**cero** en los ocho cruces y en los dos árboles. Lo mismo le pasaba a `pisaCv` de **TC-574**, que
se adaptó a medir los dos ejes.

## 2 · La conducta fuera del papel (commit 2)

**El defecto, medido en HEAD con la sección integrada y con su control positivo:** la rama
`seguimiento` publicaba «seguimiento anual» **una** vez en el informe en cada uno de los **tres**
estilos, **tres** veces en cada una de las **seis** plantillas del PDF y **una** en el PPT. El
**EN SUMA no la llevaba**: `ccSumaLinea` arma su propia línea y nunca leyó la conducta. Y la rama
`cirugia_it` llevaba **«(ESC 2020)»** al informe firmado.

**El censo completo, once marcadores por las once superficies de papel de cada escena:
381 apariciones antes, 0 después.**

| rama | lo que llevaba al papel |
|---|---|
| `cirugia_it` | «cirugía sobre la válvula a considerar … (ESC 2020)» |
| `disfuncion` | «optimización del tratamiento médico … evaluación de resincronización» |
| `obstr_subaortica` | «intervención a considerar» |
| `it_severa` | «seguimiento estrecho» |
| `sin_contexto` | «No consta la situación clínica, de la que dependen las indicaciones» |
| `seguimiento` | **«seguimiento anual»** |
| `sin_funcion` | «seguimiento anual y vigilancia de la progresión» / «completar la evaluación» |

**`tgaConclusion` gana la salida `papel`**, que es la **misma lista de partes congelada antes de
que entre la conducta**. Las dos salidas se arman con las mismas piezas, así que no pueden
divergir: no se reescribió ningún texto. Es el patrón que la coartación (`coaPapel`) y la
miocardiopatía hipertrófica (`mchConclusion().papel`) ya usan, y lo que la tanda AJ7 pagó con la
Fallot por no tenerlo.

| superficie | qué lee |
|---|---|
| cuerpo del informe | `c.papel`, por la tabla compartida de `ebs`/`tdf`/`tga`/`mca` |
| hoja del PDF | `c.papel`, por `ccHoja` |
| diapositiva del PPT | `c.papel`, por `papel:true` en el registro |
| EN SUMA | `ccSumaLinea('tga')`, que nunca leyó la conducta |
| **pantalla** (`tga-concl`) | **`c.txt`, entero, con la conducta** |

⚠️ **LA TABLA COMPARTIDA ES UN NO-OP PARA LAS OTRAS TRES SECCIONES, verificado:** ni
`ebsConclusion`, ni `tdfConclusion`, ni `mcaConclusion` devuelven `papel`, así que
`(c.papel || c.txt)` les da exactamente lo de antes.

⚠️ **`resumen` QUEDA COMO ESTABA Y HOY NO LO LEE NINGUNA SUPERFICIE DE PAPEL.** Sus dos
consumidores eran la hoja del PDF y la diapositiva, y los dos pasan a `papel`. **Quien vuelva a
cablear esta sección al papel tiene que usar `papel`.** → `T3-b`.

⚠️ **ESTO TERMINA LO QUE TGA-2 EMPEZÓ.** Su rama `descriptivo` —Jatene y Rastelli— ya salía sin
conducta, y su propio comentario decía que la cascada «cita la ESC 2020, que es lo que el
principio del médico saca del papel». Esa rama **también devuelve `papel`** desde esta tanda, con
el mismo valor que `txt`, para que el contrato sea uniforme: **lo destapó el caso de prueba**, que
pedía las tres salidas y se encontró con que esa rama devolvía dos.

**Su contenido sigue en la aplicación:** la **pantalla** conserva la conclusión entera —261
caracteres, medidos en Chrome— y la **Evidencia** de la sección publica las recomendaciones de
guía con su clase, su nivel, su hoja y su folio, en las cuatro tablas de `TGA_IND_RECS`.

## 3 · El esquema de circulación (commits 3, 4 y 5)

### Las piezas

| pieza | qué hace |
|---|---|
| `TGA_ESQ_VB` · `TGA_ESQ_BX` · `TGA_ESQ_W/H` | el `viewBox` y la geometría de las cuatro cavidades, de la demo |
| `TGA_ESQ_FS` | las seis tipografías. **El mínimo es 12 y es una medición**: ver abajo |
| `TGA_ESQ_DEF` | los **seis** escenarios: `norm`, `dtga`, `mus`, `jat`, `ras`, `ltga` |
| `TGA_ESQ_NOM` | el nombre de cada escenario, con los rótulos del selector y de `TGA_CIR_LBL` |
| `TGA_ESQ_MK` | los dos marcadores de punta de flecha |
| `tgaEsqSVG(k, sh)` | arma el SVG entero. Devuelve cadena vacía con una clave que no existe |
| `_tgaEsqCav` · `_tgaEsqCol` · `_tgaEsqTxt` | la cavidad, el color y el escape |
| `_tgaEsqDirCom(id)` | la dirección del shunt, **sólo donde la app la guarda** |
| `_tgaEsqBase(k)` | el escenario **parado**: devuelve el base y la marca `pend` |
| `tgaEsqSync(anat, cir)` | el embudo: lee, dibuja, escribe el texto y la alternativa, arranca el bucle |
| `_tgaEsq` · `_tgaEsqCuadro` · `_tgaEsqArrancar` | la animación |

### El escenario no tiene selector, y esa es la decisión de diseño
Sale de **`tgaEjes()`** y de **`tga3dComs()`**, los dueños únicos que ya lee el 3D. Con un
selector propio, el esquema y el 3D de la misma caja podrían mostrar **dos anatomías distintas
del mismo paciente**. Medido: con `tga_tipo = mustard` el dibujo es **idéntico** al de
`dtga` + `auricular`.

### Dónde se pinta, y por qué en un solo lugar
`tgaEsqSync` se llama **una sola vez**, desde `tga3dSync` y **antes de toda salida temprana**.
Esa función es el embudo de los tres caminos que cambian el dibujo —`tgaSync` por los campos, el
botón del corazón normal y los controles de la caja—, así que pintar ahí cubre los tres **sin un
segundo mecanismo**. Y va antes del `return` de la sección plegada y del de la librería porque
**el esquema no depende de three.js**: si el CDN falla, el 3D avisa y el esquema sigue.

### Solo lectura, y está medido
Recorrer los siete escenarios no mueve **ninguno** de los 986 campos del estudio, y **ninguna**
clave del esquema es campo del estudio. Además **TC-603 (M1b)** vacía el tipo, deja repintar y
comprueba que sigue vacío: esa condición **nació de una mutación que sobrevivió** (M14), porque la
condición anterior excluía del censo justo los dos campos que el caso mueve a propósito.

### El control clínico de los recorridos — la condición de la orden
Los recorridos de la demo **no** se usan como respaldo: los redactó quien armó la demo y no
estaban en la app. El respaldo es **`TGA3D_CIRC`**, que es de la app. Comparados uno por uno:

| clave | el dibujo | `TGA3D_CIRC` | |
|---|---|---|---|
| `norm` | cavas → AD → VD → AP · venas pulm. → AI → VI → Ao | «AD → VD → arteria pulmonar → pulmones → AI → VI → aorta → cuerpo» | **coincide** |
| `dtga` | AD → VD → Ao · AI → VI → AP (en paralelo) | «AD → VD → AORTA → cuerpo · AI → VI → ARTERIA PULMONAR → pulmones → AI (dos circuitos en paralelo)» | **coincide** |
| `mus` | cavas → Túnel → M → VI → AP · venas pulm. → T → VD → Ao | «cavas → tunel → valvula mitral → VI → arteria pulmonar · venas pulmonares → valvula tricuspide → VD → aorta» | **coincide** |
| `jat` | cavas → AD → VD → AP · venas pulm. → AI → VI → Ao | «AD → VD → arteria pulmonar (neopulmonar) · AI → VI → aorta (neoaorta)» | **coincide** |
| `ras` | cavas → AD → VD → conducto → AP · AI → VI → túnel por la CIV → Ao | «AI → VI → tunel por la CIV → aorta · AD → VD → conducto → arteria pulmonar» | **coincide** |
| `ltga` | cavas → AD → **M** → VI → AP · venas pulm. → AI → **T** → VD → Ao | «AD → VI morfologico → arteria pulmonar → pulmones · AI → VD morfologico → aorta» | **coincide** |

**Los seis coinciden, así que los seis se dibujan.** Si alguno no hubiera coincidido, ese
escenario quedaba **parado**: `_tgaEsqBase` devuelve el esquema de la anatomía y el texto dice
«Esquema pendiente de revisión para esta cirugía: se muestra el de la anatomía». Ese camino
**sigue vivo y tiene cobertura** —la mutación **M13** lo ejercita—, así que el día que haga falta
parar un escenario, el mecanismo ya está.

⚠️ **En la ccTGA las DOS válvulas cambian de lado, y es todo el sentido de la doble
discordancia**: la aurícula derecha desemboca por la **mitral** en el ventrículo izquierdo
morfológico y la izquierda por la **tricúspide** en el derecho morfológico. Medido: `M@80 T@220`
contra `T@80 M@220` del resto. La mutación **M12** las descruza y mata el caso.

### Las dos exclusiones de comunicación
Son **las del 3D, no unas nuevas**: con el **switch auricular** no se dibuja la **CIA** y con el
**Rastelli** no se dibuja la **CIV**, por el motivo clínico que `docs/PENDIENTES.md` → **C2A-f**
declara. Dibujarlas acá y no allá dejaría los dos dibujos de la misma caja contradiciéndose sobre
el mismo paciente. **Y la comunicación omitida se dice**: un dibujo que no muestra una CIA cargada
sin explicar por qué se lee como que la app perdió el dato.

Medido con las tres cargadas: `CIA=NO` **sólo** con `mus` (en sus dos formas) y `CIV=NO` **sólo**
con `ras`; en los otros cuatro escenarios se dibujan las tres.

### La punta de flecha, sólo donde la app guarda la dirección
Censado, no supuesto: existen **`ete_cia_dir`** y **`dap_dir`**, y para la **CIV no hay ningún
campo de dirección en toda la aplicación**. Así que la CIA y el ductus llevan punta y la CIV no,
que es exactamente lo que la orden pide. Medido: **6** puntas sin dirección —una por flecha de
flujo—, **7** con la de la CIA y **8** con la del ductus.

### La animación
Se cuelga de los **dos dueños que el 3D ya tiene**: `_tga3d.pausado` y `_tga3d.fc`. Con un estado
propio, el botón «Pausar» del recuadro dejaría el 3D quieto y el esquema moviéndose, y los dos
dibujos de la misma caja latirían a ritmos distintos. **`prefers-reduced-motion` queda satisfecho
por ahí mismo**: `tga3dBoot` pone `pausado` en `true` al arrancar. **Sin frecuencia, ritmo fijo**:
`fc` en 0 deja el trazo quieto. Y el bucle **se apaga solo** cuando el dibujo no se ve, con el
mismo predicado del 3D (`_tga3dVisible`), que es la lección del POP-B.

⚠️ **`Math.max(0, …)` sobre el delta hace falta**: el reloj que `requestAnimationFrame` pasa es el
del comienzo del cuadro y puede ser anterior al que se tomó al arrancar, así que el primer delta
sale **negativo**. Es el mismo defecto latente de la demo que el 3D ya documenta.

### La maqueta, y el corte que NO es el de la orden
⚠️ **AL LADO DEL 3D DESDE 1200 px Y NO DESDE 900, Y ES UNA MEDICIÓN.** La orden pide el esquema al
lado del 3D y apilado por debajo de 900 px. Medido: el recuadro mide **631 px a 1440** y **406 a
1000**, así que al lado el 3D quedaría en **327 px a 1440** —que sirve— y en **126 px a 1000** —que
no sirve para nada—. El punto 3a dice que el 3D «no se achica más de lo necesario», así que entre
900 y 1200 el esquema se apila **debajo del 3D dentro del recuadro**, y por debajo de 900 se apila
junto con toda la caja, que es lo que la orden pide. → **`T3-a`**.

⚠️ **LA TIPOGRAFÍA ES MÁS GRANDE QUE LA DE LA DEMO, Y ES UNA MEDICIÓN.** El SVG escala con su
ancho: con los 9 px de la demo en un `viewBox` de 300, a los 268 px que el esquema ocupa al lado
del 3D el rótulo saldría en **8,0 px**. El mínimo es **12**, que a ese ancho sale en **10,7 px**:
la misma tipografía que este recuadro ya usa en sus dos párrafos (10,5 y 11 px). Con 11 el mínimo
caía en 9,8, por debajo de los dos. **Apilado el SVG se topa en 340 px**, porque sin ese tope en
el recuadro de 706 px de los 768 la tipografía se iba a 28 px.

| ancho | el SVG | tipografía | maqueta |
|---|---|---|---|
| 1440 | 268×259 | 10,7 – 13,4 px | al lado del 3D |
| 1000 · 768 | 340×329 | 13,6 – 17 px | apilado bajo el 3D |
| 390 | 302×292 | 12,1 – 15,1 px | apilado |

### El texto y la alternativa accesible
La línea de abajo se arma **con las palabras que la app ya tiene**, y ninguna sale de la demo: el
nombre del escenario de `TGA_ESQ_NOM` y «Comunicaciones cargadas:» con sus tres nombres, que son
los de la línea de estado del 3D, **textuales**.

**La alternativa accesible es el recorrido que la app ya publica.** `#tga-esq-alt` es un nodo
visually-hidden al que el SVG apunta con `aria-labelledby`, y su texto sale de **`TGA3D_CIRC`**,
que es el mismo que imprime el párrafo de al lado: el lector de pantalla y el que ve el dibujo
reciben la **misma** secuencia, así que no hay una segunda redacción que pueda divergir.

⚠️ **Ese nodo es un falso positivo de los barridos de «texto recortado»**: mide 1 px de ancho con
`overflow:hidden` **a propósito**, así que su `scrollWidth` siempre supera su `clientWidth`. Las
sondas de esta tanda lo descartan por `id`.

### El ⓘ (commit 5b)
`VINFO['tga-esq']` es el **ⓘ estándar de la casa**: el mismo glifo **U+24D8** en un botón de 44 px
con `vinfo-btn-44`, el mismo `data-vinfo` y la misma tarjeta. Dice lo que el esquema representa y
—con la misma claridad— lo que **no** es: no es una imagen del estudio, no está a escala, y **los
recorridos de las cirugías están pendientes de que los revise un cardiólogo de congénitas**.
**Parafraseado y sin una sola cita**: ni guía, ni sociedad, ni clase, ni tabla, ni folio. Este
globo no respalda una recomendación: explica un dibujo. El registro pasa de **97 a 98** entradas.

El esquema lleva además, **visible**, la leyenda «Esquema ilustrativo».

---

## 4 · Lo que esta tanda NO hizo, a propósito

- **El esquema no entra al PDF ni a ningún papel**, que es lo que la orden acota. El «Incluir en el
  PDF» y el guardado en «Imágenes» quedan declarados → **`T3-c`**.
- **El `resumen` de `tgaConclusion` no se tocó** → **`T3-b`**.
- **La diapositiva del PPT no tiene condición en la suite** → **`T3-d`**.
- **La conducta sigue en la PANTALLA**, porque la orden lo pide expresamente. La ampliación de la
  regla fija —«la pantalla tampoco da indicaciones»— no se aplicó acá → **`T3-e`**.

## 5 · Dónde está lo demás

- La maqueta de la conclusión: `scripts/_probe_tga3concl.mjs`.
- El esquema en el navegador, con el control clínico: `scripts/_probe_tga3circ.mjs`.
- Los dos motores: `scripts/_probe_tga3wk.mjs`.
- El A/B de superficies: `scripts/_probe_tga3ab.mjs` y `scripts/_ab_tga3diff.mjs`.
- Las mutaciones: `scripts/_mut_tga3.py`.
- Las fichas de los casos: `docs/mapa/tests-fichas-601.md`.

⚠️ **`scripts/_probe_tga3.mjs` YA EXISTÍA**: es la sonda del papel de la tanda **TGA** del 31/10,
y esta tanda se llama TGA-3. Es la colisión que AJUSTES-1 y AJUSTES-3 pagaron sobrescribiendo una
sonda ajena. Se verificó con `ls` **antes** de crear cada nombre: los seis nombres nuevos estaban
libres y esa sonda **no se tocó**.

---

## Lo que la tanda PANT-2 corrigió del esquema (2026-11-02)

- **Sus colores no llegaban al PDF.** El marcado usa `var(--…)` —que en la pantalla es lo
  correcto— y fuera del documento esas variables no existen: las seis cajas salían negras y el
  texto en serif. Lo resuelve `esqSvgParaRaster` en `esqRasterizar`, sin tocar el esquema de
  pantalla.
- **El esquema ya no publica línea propia al papel**: el recuadro decía el escenario y las
  comunicaciones dos veces.

Todo en `docs/mapa/pant2-correcciones.md`.
