# PANT-38 — el acomodo de Contractilidad, el menú de Documentos, CeiboLink y tres arreglos chicos

Tanda del 2026-11-15. Línea base `121bb99` (sello `v20261115-1535`, md5 `52cb231e`).
Cinco commits, cuatro bloques independientes.

> Este mapa **no guarda números de línea** a propósito: la línea cambia en cada edición, el nombre
> de la función no. Para ubicar algo, `grep -n` por el nombre que figura acá.

---

## 1 · El acomodo de los cuadros de Contractilidad (commit 1)

### Quién es el dueño

| Qué | Dónde vive |
|---|---|
| La fila de abajo del bull's eye | `#lv3d-fila`, con `#lv3d-bloque-hallazgos` y `#lv3d-panel` |
| El cuadro de «Limpiar» e «Incluir bull's eye en PDF» | `#lv3d-bloque-botones` — **un solo nodo, que se muda** |
| La ranura de arriba, debajo del territorio coronario | `#lv3d-slot-botones`, dentro de `.contr-col-der` |
| Quién decide en qué ranura vive | **`lv3dBotonesSync(angosto)`** |
| Quién lo llama | `lv3dMaquetar()`, que corre al abrir, al cerrar, en `resize` y al arrancar |

### Las tres reglas que lo sostienen

1. **Es un nodo que se muda, no una copia.** Dos cuadros serían dos «Incluir bull's eye en PDF»
   sobre el mismo campo `contr_be_pdf` del estudio, y el día que uno cambie el otro miente.
   Medido: un solo `#lv3d-bloque-botones`, un solo `#contr-pdf-toggle` y un solo `#contr_be_pdf`
   en todo el documento.
2. **Con la guarda de `_vSlotSync` (MEDIR-4a): si ya está en su ranura, no se lo toca.** Mover un
   nodo que contiene al elemento enfocado le quita el foco, y acá adentro hay dos botones cuyo
   `onclick` dispara un repintado que pasa por `lv3dMaquetar`.
3. **En angosto vuelve a su lugar exacto, no al final.** Se inserta **antes** de `#lv3d-panel`,
   que es su hermano siguiente de siempre; con un `appendChild` pelado quedaría después del 3D y
   el orden de lectura saldría al revés. De eso depende el «en celular todo queda como hoy».

### El ancho del 3D no cambia, y sale de una cuenta

Con el 3D abierto la fila pasa de tres columnas a dos, y la de hallazgos se lleva lo que tenían
las dos primeras juntas: **220 + 150 + 16 = 386 px**. El `1fr` del panel vale `total − 386 − 16`
antes y `total − 220 − 150 − 32` después: **el mismo número**. Medido: lienzo y canvas
**597×334 en l=608** a 1369 px, idénticos a la línea base.

### `align-items` pasa de `stretch` a `start`

El comentario de «K2» defendía el `stretch` porque con `start` «el de los botones terminaba
siendo una franja fina». **Ese bloque ya no está en esta fila**, y del que queda el médico pide lo
contrario: alto de su contenido.

### La ranura vacía se esconde

`#lv3d-slot-botones:empty{display:none;}` — con `gap:14px` un hijo vacío deja 14 px de aire debajo
del territorio en angosto, donde el cuadro no vive ahí. Un hijo en `display:none` no cuenta para
el `gap`.

### Medido (Chrome y WebKit, 1369 / 1920 / 2560 y 390 px, los dos temas)

| | línea base | hoy |
|---|---|---|
| El cuadro se mueve al abrir el 3D | dl **−671 / −1168 / −1808** px, dh **+492 / +769 / +1127** | **0 / 0 / 0 / 0** |
| Alto de Hallazgos con 5 hallazgos | **604** px (igual que el panel) | **254** (panel 604) |
| Hallazgos con 0 hallazgos | 604 | **112** |
| A 390 px | — | **idéntico a la base, caja por caja** |

⚠️ **La siembra se hace con los ids de `LV3D_SEG_ID` y se verifica por `contrEstado`.** La primera
versión de la sonda usó `'s1'..'s8'`: `contrSetSegmento` los escribe igual, **nadie los lee**, y el
texto cambia de 52 a 29 caracteres — o sea que «no crece» era la siembra vacía y no el arreglo.

---

## 2 · El tamaño del corazón del 3D y los rótulos de ejes (commit 2)

### El tamaño

**`LV3D_ESC` pasa de 26 a 32.** Es el único lugar donde se decide cuánto mide el corazón: lo lee
`lv3dPant` y nadie más. **La regla del DDVI no se toca**: `lv3dEscalaPorDD` sigue devolviendo
`dd/48` acotado a [0,72 – 1,6], y `_lv3d.P` se sigue derivando de ella.

**El factor sale de una medición del peor caso.** Sobre `_lv3d.polis` —los polígonos con sus
coordenadas de pantalla— con DDVI 95 mm (donde la escala topa en 1,6), con la diástole fantasma
prendida, en las tres vistas de punta, en Coronarias (3099 polígonos contra 1800), en cinco fases
y en doce giros de 30 grados:

| | antes | hoy |
|---|---|---|
| Fracción del recuadro | 48,6 % ancho · 63,6 % alto | **59,8 % · 78,3 %** |
| Aire libre (izq/der · arr · aba) | 174,7 · 61,2 · 77,2 | **136,6 · 33,3 · 49,3** |
| Se sale por algún borde | no | **no, por los cuatro** |

El tope absoluto es **1,507** y lo limita el borde de **arriba**: del centro de proyección
(`cy = H/2 − 8 = 182`) al punto más alto hay 120,8 px contra los 182 que hay hasta el borde. Se
tomó **1,2308** y no el tope por tres cosas que el bbox de los **vértices** no ve: el grosor del
trazo, el halo de los rótulos y la brújula. Con el tope el corazón entraría en x 92 y se le
montaría encima; con 32 entra en 136,6 y la brújula llega a 104.

### Los rótulos

Los **cinco textos son los mismos**; cambia dónde se apoyan. Tres cosas:

- la brújula se corre de `ox` **58 a 72**;
- el rótulo se ancla con **`textAlign`** en vez de un offset fijo de 28 px (que era el ancho
  supuesto del texto más largo);
- el eje alineado con la cámara se escribe **debajo**, repartido por el signo de `r.d`.

⚠️ **AL CENTRO CAEN DOS, NO UNO.** La primera versión mandaba al centro todo eje con proyección
plana chica, argumentando que los cinco ejes son una base ortonormal. **Es falso**: son
`[+X, −X, +Y, −Y, +Z]`, y +X y −X son **el mismo eje**. Con la punta a derecha o izquierda «Lat» y
«Sep» caían los dos en el centro. En la versión anterior a esta tanda no se superponían por **pura
casualidad numérica**: `cos(π/2)` vale 6,1e−17 y no 0, así que uno daba `r.x >= 0` y el otro no.

⚠️ **El contexto se restituye con `save`/`restore`.** `textAlign` es estado del contexto, el
contexto es el mismo entre cuadros, y una fuga así es **estable** —dos repintados dan el mismo
píxel— así que una prueba de idempotencia no la ve. Es la lección de PANT-34.

Medido interceptando `fillText`, con el ancho que mide el propio motor:

| vista | antes | hoy |
|---|---|---|
| «Punta hacia mí» | «Sep» en x[**−2** , 19.4] — cortado; «Punta» x[62 , 93.4] y «Lat» x[94 , 110.7] — a 0,6 px | «Sep» x[13.6 , 35] · «Punta» x[80.3 , 111.7] · «Lat» x[109 , 125.7] |
| «Punta a la izquierda» | «Punta» en x[**−2** , 29.4] — cortado (**no estaba reportado**) | dentro |
| las tres | — | **cero fuera del canvas, cero pares que se pisen** |

---

## 3 · El menú de Documentos y la lista de Configuración (commit 3)

### La causa del recorte

⚠️ **Es `.card{overflow:hidden}`, no un contexto de apilamiento.** El `z-index:260` del menú **ya
funcionaba** —en la captura del médico el menú se pinta por encima del EN SUMA— y lo que faltaba
era arriba: el menú sube con `bottom:calc(100% + 6px)` desde la fila de botones del fondo de la
tarjeta del EN SUMA, y esa tarjeta lo corta en **su borde superior**. Por eso la primera entrada se
leía «eléctrica» en vez de «Consentimiento: cardioversión eléctrica». Recorrida la cadena de
ancestros, `.card` es el **único** con `overflow` distinto de `visible`.

Es el mismo defecto y el mismo arreglo que `#tab-valvulas .card:has(.valv-sev-menu.open)`, que ya
vive en el archivo. Con **`:has()`** y no con un `overflow:visible` pelado: la tarjeta vuelve a
recortar en cuanto el menú se cierra. Más `max-height:min(70vh,440px)` con `overflow-y:auto`.

⚠️ **Se mide por hit-testing, no por geometría.** «Sobresale N px» no cambia con el arreglo —el
menú ocupa el mismo rectángulo—; lo que cambia es si se **pinta**. `elementFromPoint` sí respeta el
recorte del ancestro.

| | línea base | hoy |
|---|---|---|
| Opciones alcanzables | **4 de 6** en 10 cruces, 5 de 6 en 6 | **6 de 6 en los 16** |
| `overflow` de la tarjeta | `hidden` siempre | `visible` abierto → `hidden` cerrado |

### La lista de Configuración

Lo que cambia **no es el `flex:1` del nombre**, que se conserva, sino su `min-width` de 140 a **0**
y el texto que pasa de envolver a cortarse con puntos suspensivos (con el nombre entero en el
`title`).

⚠️ **El nombre conserva `flex-basis:0` y de eso depende todo.** Con `flex-wrap`, el navegador arma
las líneas con el **flex-basis** de cada hijo y no con su ancho mínimo; el encogimiento se reparte
después, dentro de cada línea. Con `flex:0 1 auto` el nombre aporta el ancho entero de su texto
—unos 250 px— y es el que empuja a las acciones al renglón de abajo.

Medido en catorce anchos de 390 a 2560, alto máximo de fila y cuántas de las seis quedan en una
línea. **Cero regresiones**:

| ventana | antes | hoy |
|---|---|---|
| 1200 px | 91 px, 3 de 6 en línea | **62 px, 6 de 6** |
| 1000 px | 102 px, 0 de 6 | **62 px, 6 de 6** |
| 900 px | 102 px | **91 px** |
| 800 px | 131 px | **91 px** |
| 390 px | 116 px | **101 px** |
| 1369 a 2560 | 62 px, 6 de 6 | igual (ya entraba) |

⚠️ **Por debajo de 1000 px sigue envolviendo, y se declara** en vez de prometer una línea que no
entra: ahí la grilla de Configuración ya es de dos columnas y la fila mide entre 252 y 508 px,
donde el nombre más la etiqueta más «Mostrar en el menú» más «Editar» no entran de ninguna forma.

⚠️ **Dos intentos anteriores metieron regresiones, y las encontró el barrido.** `flex-wrap:nowrap`
con una media query en 700 px rompía la banda 650–699 —y el ancho de la fila **no se deriva del
viewport**: la grilla pasa de una a dos columnas cerca de los 780 px, así que la misma fila mide
668 px a 760 de viewport y 252 a 800—. Un piso de 140 px en el nombre rompía 650, 900, 1369 y 1440.

---

## 4 · CeiboLink en Configuración (commit 4)

### El enlace de descarga

`#cfg-clnk-descargar` pasa de `<button disabled>` con un «próximamente» al lado a un `<a>` a
`https://descargas.ceibomed.com` con `target="_blank"` y **`rel="noopener noreferrer"`**.

⚠️ **El `noopener` no es decorativo.** Sin él la página que se abre recibe un `window.opener`
apuntando a ésta y puede navegarla a donde quiera, con el estudio del paciente en pantalla y sin
guardar. **Es la primera vez que esta app abre una dirección externa** —censado: cero
`window.open` y cero `target="_blank"` en todo el archivo antes de hoy—, así que esta línea es el
patrón que hereden las que vengan.

### La guía

El bloque «Cómo conectar el ecógrafo» pasa de **1549 caracteres en ocho párrafos a 473 en tres**, y
el paso a paso completo se muda a la clave **`clnk-guia` de `VINFO`**, que abre el «?» pegado a
«Actualizar». Mismo mecanismo que los demás globos: `data-vinfo` + `vInfoClic`.

Va en la cabecera que se mira siempre porque la guía hace falta cuando algo no anda, y cuando algo
no anda lo primero que se aprieta es «Actualizar».

**Escrita sólo con lo que el panel y la documentación del conector ya dicen.** Los siete pasos
salen del orden de uso del contrato y de los bloques que el panel muestra.

- **Sin el código de seis dígitos.** Dónde lo ve el médico es una decisión pendiente —el propio
  panel lo declara en el comentario de `CLNK_TXT_DONDE_CODIGO`—, así que el paso 3 manda al bloque
  «Vincular este navegador» y no cuenta de dónde sale el número.
- **Sin pasos del instalador de Windows.** Su documento existe pero dice de sí mismo que compila y
  nada más; no está probado en una máquina real.

**Nada del texto viejo se perdió**: las diez piezas que se buscan —cable directo, red del
consultorio, pendrive, «Importar DICOM», el aviso del 169.254, el ejemplo 192.168.50.10, la máscara
255.255.255.0, el DHCP, la dirección fija y la marca de que las tres vías se corrigen al
probarlas— están las **diez**, y **nueve** en el globo.

⚠️ **La marca de provisoriedad se reescribió en vez de copiarse.** El texto viejo decía «A
confirmar con el ecógrafo real», y esa forma cae bajo la regla fija de que ningún texto de la app
dice que algo está «a confirmar». Lo que el médico necesita queda dicho sin esa forma, que es lo
que esa misma regla manda cuando la frase sostiene algo útil.

**La capa de comunicación y los estados, intactos**: `clnkPedir`, `clnkRender`, `clnkLeerEstado` y
`clnkAyudaToggle` siguen ahí, los dos ids del bloque y el marcador `data-clnk-provisorio` se
conservan —son el inventario de Config que TC-161 fija— y el panel tiene los **mismos 4 controles
con id**: cero campos nuevos, cero columnas de Excel.

---

## 5 · Los tres arreglos chicos (commit 5)

### (a) El seno coronario sin techo

La celda de la CIA de «Asociaciones y síndromes» pasa de «**menos de 1 %**» a «**1 %**». La
evidencia ya estaba medida en `P36-c`: la **ACC/AHA 2025**, hoja 35, folio **e149**, leída en
imagen, imprime «unroofed coronary sinus (1%)»; el «<1%» de esa oración es el del **seno venoso
inferior**, que la tabla también publica así y ahí sí coincide.

**Se cambia en el generador y en el marcado**, porque el marcado sale de
`scripts/_gen_p36tablas.py` y no se retipea. La mutación **21** de `scripts/_mut_p36.py` queda
**invertida**: hoy lo que tiene que poner rojo al caso es volver a «menos de 1 %».

Otros lugares donde figura la cifra, **listados y no tocados** porque ya dicen «1 %»: el resumen de
la CIA de `ref-congenitas` en `index.html`, `scripts/_gen_p36resumenes.py` y
`docs/fuentes/FUENTES.md`.

### (b) El deslizador «Apertura» del «What if» — cierra **P37-i**

Con el área en «Se abre con el flujo» y el médico borrando después un dato, la situación pasa a
«faltan datos»: la rama `!C.ok` de `wiPintar` apagaba la gráfica, la tabla y la fila de supuestos,
pero **`wi-fila-m` y `wi-m-nota` se quedaban a la vista, apagados** — su `wi-oculto` se decide
ciento cuarenta líneas más abajo, con `C.ok` ya cierto, así que el `return` temprano nunca lo
tocaba.

**No se toca `_wiSim.area`**: la elección del médico se conserva, así que al reponer el dato el
deslizador vuelve donde estaba. Lo único que cambia es si se **ve**.

### (c) TC-390 — **el caso estaba desactualizado, no el código**

La orden lo daba por «defecto real de más de un mes». Medido, es al revés, y la evidencia es
triple:

1. **La estenosis mitral ya no es una severidad graduada.** `index.html` lo declara al lado de
   `emCategoria()`: publica la **categoría** binaria. Así que el grado «moderada» que la escena
   elige se publica como «no significativa», y «severa» como «significativa (AVm 1.20 cm² por
   planimetría)».
2. **La sigla pelada hoy es «EM presente.» y no «EM.»** — lo afirma **TC-398 en verde**, y
   **TC-42** también pasa afirmando «EM significativa.».
3. **El desplegable no enciende `esqSevManual`** — la regla está escrita en el archivo al lado de
   `sevSinApagaDesdeSelect`, y `valvSev.aplicar` va por el desplegable.

**Adaptado sin aflojarlo**: cada condición sigue midiendo lo que vino a medir —que la nota del
fundamento va entre paréntesis pegada al grado y **no sube al EN SUMA**— con los textos de hoy, y
dos quedaron **más fuertes** (se exige la frase entera y no un fragmento que «EM presente.»
también contendría, y se agrega que la nota no aparezca en el EN SUMA).

---

## Cobertura

| Caso | Qué fija | Cae contra `121bb99` |
|---|---|---|
| **TC-904** | bloques 1 y 2: las dos ranuras del cuadro, que no se mueva, que Hallazgos crezca y no se estire, `LV3D_ESC`, el corazón dentro del recuadro y los cinco rótulos | **7 condiciones, cero excepciones** |
| **TC-905** | bloques 3, 4 y 4b: el menú alcanzable, la tarjeta que vuelve a recortar, el nombre con basis 0, el enlace con su `rel`, el globo sin código ni Windows, el resumen y el deslizador que se retira | **10 condiciones, cero excepciones** |

**Adaptados**: TC-390 (cinco condiciones, con la evidencia de arriba) y TC-821 (la cifra).
**Invertida**: la mutación 21 de `_mut_p36.py`.

⚠️ **Dos condiciones no se pueden medir en la ventana del arnés (756×469)** y se declaran:
- que el cuadro de los botones viva en la ranura de arriba — ahí el ancho es **angosto** y vive en
  la fila **a propósito**, que es el punto 4 del pedido. Se mide llamando a `lv3dBotonesSync` en
  **sus dos ramas**, que es el dueño;
- que las **seis** opciones del menú sean alcanzables — con 469 px de alto la primera queda arriba
  del borde. Se exige que **todas las que entran en la pantalla** lo sean, y las seis las mide la
  sonda de dos motores con su ventana de 940.

---

## Las sondas

| Archivo | Qué mide |
|---|---|
| `scripts/_probe_p38b1.mjs` + `_cuerpo.js` | bloque 1, dos motores × 1369/1920/2560/390 × dos temas |
| `scripts/_probe_p38tam_cuerpo.js` | el bbox del corazón por vista, fase y giro, y los rótulos interceptando `fillText` |
| `scripts/_probe_p38b2.mjs` + `_cuerpo.js` | el menú por hit-testing y la lista de Configuración |
| `scripts/_probe_p38b3.mjs` + `_cuerpo.js` | el enlace, el globo, el resumen y que nada se perdió |

**El cuerpo de cada sonda vive en un archivo aparte** (la mejora de método de MEDIR-4b): metido
dentro de un template literal del arnés, cada acento grave lo cierra.

⚠️ **`page.evaluate` con una cadena descarta el argumento.** El tema se invoca **dentro** de la
cadena, no como segundo parámetro.

---

## Lo que esta tanda pagó

- **El acento grave dentro de mis propios comentarios, en el cuerpo de un caso** — tres veces, y es
  la trampa que esta casa documenta desde hace treinta tandas. Sólo lo caza `node --check`.
- **Y al sacarlos con un bucle, me llevé puestos los del runner** —el `abrirChrome` con su template
  literal— y el archivo dejó de parsear por otra razón. Hubo que restituirlos a mano.
- **`__t.show` y `__t.esp` no existen**: los inventé. El API real es `set`, `val`, `limpiar`,
  `avInc`, y el patrón del cuerpo es `return (async () => { … })()`.
- **La barra invertida no sobrevive al template literal**: `\s+` llegó como `s+` y «Constancia»
  salió «Con tancia». Se cerró **no usando ninguna expresión regular**.
- **`elementFromPoint` sólo ve el viewport**: el «?» de CeiboLink cae en `top` 1497 con una ventana
  de 940 y daba «FUERA» en los dieciséis cruces, que se lee igual que «no se puede tocar». Hay que
  traerlo con `scrollIntoView` antes de preguntar.
- **El botón «What if» vive en la vista 2D y no en el formulario**: sin `v2dAbrir()` no existe.
