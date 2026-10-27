# El posoperatorio de cirugía cardíaca — tanda «G» (2026-10-24)

Mapa de la subpestaña **«POP Cirugía Cardíaca»**, dentro de Hemodinámica. Por **nombre de
función y de constante**, nunca por número de línea: la línea cambia en cada edición.

> Lo que esta tanda NO tocó: el Forrester y la cápsula «Perfil hemodinámico» (son del J2), el
> pericardio y su taponamiento, el TEP, el HTP, el FOP, la reorganización de pestañas y el
> módulo «Deformación».

---

## 1 · La pantalla

| Qué | Dónde |
|---|---|
| El marcado entero | `#pop-seccion`, dentro de `#tab-hemodinamica` |
| Las seis tarjetas | `section.pop-card[data-pop="…"]` — `pop-ctx`, `pop-hemo`, `pop-esq`, `pop-soporte`, `pop-pocus`, `pop-concl` |
| El reparto en tres columnas | `@media (min-width:1100px)` sobre `.pop-grid`, con `grid-template-areas` |
| La grilla de drogas | `.pop-drogas` · `.pop-droga` · `.pop-droga-on` · `.pop-droga-dosis` |
| El acordeón del monitoreo | `#pop_mon_slot` › `#pop_mon_acc` › `#pop_mon_sum` + `#pop_mon_body` |
| El lactato | `#pop_lactato` (mmol/L) |

### El reparto lo hace `grid-template-areas`, no el orden del marcado
Mover las secciones de lugar en el HTML habría cambiado el **orden de tabulación** y el de lectura
de un lector de pantalla, que es el orden en que el médico carga los datos. Cada `data-pop` se
ubica por su nombre. Sin la consulta de medios, el marcado sigue siendo el de siempre.

**El corte es 1100 px y no 768**: con dos columnas de ~400 px el esquema queda en 400 px de ancho
y los rótulos de dentro del dibujo se enciman. Entre 768 y 1100 px vale la maqueta de DOS columnas
y el esquema se lleva las dos.

### La columna de la dosis: `auto`, no `minmax(0,150px)`
Una pista de grilla **existe aunque su único hijo esté en `display:none`**, así que con `150px` la
mitad derecha de las diez filas era un rectángulo vacío. Medido en Chrome: el bloque de drogas
pasó de **374 px a 184 px**. El ancho de la caja lo lleva hoy `.pop-droga-dosis`.

La fila de una droga **encendida** ocupa las dos columnas (`.pop-droga-on`, clase que pone y saca
`popSync`): dentro de media columna al rótulo le quedaban 112 px y «Noradrenalina» no entra. Se usa
una clase y no `:has()` porque el estado ya tenía dueño.

### El acordeón: tres reglas y una medición
1. **Aparece y se abre solo al elegir el dispositivo.** Con «Ninguno», «Vigileo», «presión
   invasiva» o sin consignar no hay acordeón: esos cuatro no tienen campos propios.
2. **El cuerpo está acotado** (`max-height:250px` con scroll propio), así que lo que la pantalla
   crece no depende de cuántos campos traiga el dispositivo.
3. **El hueco queda reservado** mientras haya dispositivo: `popMonSync` mide el alto del acordeón
   abierto (`offsetHeight`) y se lo pone al `slot` como `min-height`. Medido: plegarlo y
   desplegarlo deja el borde superior de la tarjeta de abajo en el MISMO píxel.

⚠️ **En el celular no se acota ni se reserva, y es deliberado.** Por debajo de 768 px la grilla del
dispositivo pasa a una columna y los siete campos del Swan miden el triple: dentro de una caja de
250 px el médico tendría que desplazar un recuadro dentro de una página que ya se desplaza. Y la
reserva existe para que plegar no mueva una maqueta de DOS dimensiones. El `!important` de la
consulta de medios le gana al `min-height` inline.

⚠️ **El margen de abajo va en el `slot`, no en el acordeón**, y esto se midió: con el margen
adentro, el contenido del slot medía 14 px más que la reserva y plegar encogía la pantalla
exactamente esos 14 px — la reserva funcionaba y aun así la pantalla se movía.

⚠️ **Los dos rótulos internos «Swan-Ganz / PiCCO — valores medidos» se retiraron**: hoy ese texto
lo dice el encabezado del acordeón y salía DOS VECES seguidas. Visto en la captura.

### El lactato
Campo **opcional** que la app **NO interpreta**: sin banda, sin «elevado» y sin corte. Ninguna de
las fuentes de este módulo publica un punto de corte aplicable —Unic-Stojanovic 2025 lo nombra como
«pista diagnóstica» sin cifra—. Entra al estudio por el barrido genérico de `input[id]`; verificado
que `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO` no lo sacan. **No agrega columna al Excel**:
`LAB_XLS_MAP` es una lista explícita y no tiene un solo `pop_`.

---

## 2 · El esquema

| Qué | Dónde |
|---|---|
| El seam de datos | `popEsquema()` — devuelve DATOS, nunca HTML |
| El montaje del SVG | `popEsqMontar()` — una sola vez, guarda `_popEsq.montado` |
| La geometría ilustrativa | `_popEsqGeo(d)` |
| El pintado estático | `_popEsqEstatico(d, g)` · la curva, `_popEsqOnda(d)` |
| El bucle | `popEsqFrame` · `popEsqArrancar` · `popEsqParar` |
| El equivalente en texto | `popEsqTexto(d)` → `#pop-esq-txt` |
| El punto de entrada | `popEsqPintar()`, que llama `popSync` |
| Constantes | `POP_PAPM_HP_MMHG` (20) · `POP_ESQ_PER_MS` (1700) · `_popEsqC` |

### La escena sale SOLO de los datos cargados
No hay selector de patrón, ni botones de ejemplo, ni valores por omisión. La demo aprobada del
17/10 los tenía porque era una demo, y copiarlos habría puesto en la app una superficie clínica
que se elige a mano.

### Ni un corte nuevo
Lo que el dibujo **colorea** pregunta por la banda que la app ya tiene dueño:

| Pieza | Dueño |
|---|---|
| Ventrículo izquierdo | `_icBanda` |
| Ventrículo derecho | `UMBRAL_TAPSE_NORMAL` y `TEP_VDVI_DILAT_MIN` |
| Pulmones | el valor de `pop_pulmon_lineasb` |
| Cuadro pulmonar | `RVP_ELEVADA_UW` (ESC/ERS 2022) y `POP_PAPM_HP_MMHG` |
| Aurícula derecha e izquierda | **NO se colorean** |

**La AD y la AI no se colorean a propósito**: esta app no tiene banda de PVC ni de PCP —la de 12 a
18 es criterio propio, declarado— y pintar una aurícula de rojo es una afirmación clínica. Se
dibujan del tamaño que acompaña al número y el número se publica al lado.

**La partición de la falla del VD por PAP media lleva el chip «Criterio de EcoSmart»**: el número
(20 mmHg) es la definición de hipertensión pulmonar de la ESC/ERS 2022; la partición en «poscarga»
y «contractilidad» no la publica ninguna fuente de la biblioteca. Sin PAP media no se parte.

⚠️ **El mismo 20 está escrito inline en `calcHemodinamica`**, que esta orden no autorizaba a tocar.
Quedan DOS copias del mismo número. Declarado en PENDIENTES (**G-a**).

### La geometría es ilustrativa y se declara en pantalla
Que una cavidad se vea más grande con una presión más alta es un recurso de dibujo, no una
medición: no hay ninguna fuente que convierta una PVC en milímetros de aurícula. Por eso vive en
`_popEsqGeo` y no entre las constantes clínicas, y por eso el rótulo de abajo del dibujo lo dice.

### La animación no corre para nadie
Un `IntersectionObserver`, creado una vez en el montaje, apaga el bucle cuando el dibujo no se ve y
lo enciende al volver. `popEsqArrancar` es idempotente: sin la guarda, veinte aperturas dejarían
veinte bucles pintando el mismo SVG. Con «reducir movimiento» se dibuja UN cuadro y ahí queda.

⚠️ **El bucle tiene DOS frenos y hay que medir los dos.** El cuadro no vuelve a pedirse cuando el
dibujo no se ve, y `popEsqParar` cancela el que estuviera pedido. Una condición que sólo mire el
primero deja viva una mutación que vacía `popEsqParar` —el otro freno la tapa—: por eso TC-534
tiene (H1) y (H1b).

### Tres defectos propios, vistos en la captura
1. **`--red-pale`, `--green-pale`, `--amber-pale` y `--blue-pale` NO están en el `:root` del tema
   claro** —viven dentro de `html.light-mode .amilo-root`—, así que fuera de ahí el `var()` no
   resuelve, y un `fill` sin resolver **no cae en el color de al lado: cae en el INICIAL, que es
   NEGRO**. Los pulmones, el cuadro pulmonar, los dos ventrículos y las elipses salían negros en
   los DOS temas. Hoy el tinte sale del color fuerte con `fill-opacity`.
2. **La curva de presión se escalaba de 30 a 140 mmHg**: un paciente con PAM 58 y presión de pulso
   14 ocupaba seis píxeles de los cuarenta y seis de la caja. Justo el paciente del módulo era el
   que no se veía. Hoy se escala a su propio rango, recorriendo la onda dos veces.
3. **Cuatro rótulos se pisaban o se salían del `viewBox`** por la izquierda («rrame D moderado»).

---

## 3 · La vasoplejia

`popPatron()` arma el patrón. La etiqueta de vasoplejia exige **las tres cosas**:

| Criterio | Dueño en el código | Fuente |
|---|---|---|
| PAM < 65 mmHg | `POP_VASO_PAM_MAX` | Unic-Stojanovic 2025, ivaf075, **hoja 1 de 4** |
| IC > 2,2 | `!icBajo`, o sea `_icBanda` | los DOS artículos |
| RVS < 800 **sin indexar** | `rvsBaja`, o sea `_rvsBanda` | los DOS artículos |

⚠️ **Los otros dos cortes NO se escriben acá y no hacía falta moverlos.** `_icBanda` llama «bajo» a
todo lo que sea 2,2 **o menos**, así que `!icBajo` ya era exactamente «IC > 2,2»; y `_rvsBanda` abre
su banda de vasodilatación por debajo de 800 sobre el valor **desindexado**. Medido antes de tocar:
una premisa de la orden decía que la app usaba «≥ 2,2» y era **falsa**.

**El SVRI del PiCCO ya se desindexaba** (`picSvri / asc`, con `getBSA()`). Sin peso ni talla no hay
superficie, la resistencia queda en `null` y no hay etiqueta.

**Sin PAM no hay etiqueta**, y la pantalla dice por qué: `vasoSinPam` y `vasoPamAlta`, que
`popConclSync` publica en sus tres ramas excluyentes.

**La etiqueta se rotula como DEFINICIÓN PROPUESTA**: las dos fuentes son un editorial y una
revisión, no guías, y las dos dicen que no hay definición universal. El «PAM < 65» sale sólo de
Unic-Stojanovic.

### La tabla de escenas del commit (PiCCO, peso 60, talla 170, SC 1,68325 m²)

| PAM | IC | RVS | HEAD | G3 |
|---|---|---|---|---|
| 64 | 2,21 | 799,0 | Vasoplejia | **Vasoplejia** |
| 65 | 2,21 | 799,0 | Vasoplejia | **sin etiqueta** |
| 64 | 2,20 | 799,0 | sin etiqueta | sin etiqueta |
| 64 | 2,21 | 800,0 | sin etiqueta | sin etiqueta |
| — | 2,21 | 799,0 | Vasoplejia | **sin etiqueta** |
| 64 | 2,21 | sin peso ni talla | sin etiqueta | sin etiqueta |

---

## 4 · El derrame pleural y el VD

Los **tres grados por tamaño** (menos de 1 cm, de 1 a 3, más de 3) **no tienen fuente** —censada la
biblioteca— y llevan el chip. **No se retiran**: describen el tamaño, no dictan una conducta.
La **estimación del volumen** sí tiene fuente y vive en el globo ⓘ `pul-balik` del módulo de
ecografía pulmonar —Volpicelli 2026, enunciado **D6_11, hoja 19**— que el POP **reusa**, no copia.

⚠️ **El pie del cuadro del VD declaraba «VD/VI 0,9» con el número escrito a mano** mientras las dos
filas de arriba del mismo cuadro imprimen «≥1.0» porque leen `TEP_VDVI_DILAT_MIN`. Hoy el pie sale
de la constante. **No se movió ningún corte: se corrigió una declaración falsa.**

---

## 5 · Qué sale por dónde

| Superficie | Qué lleva del POP |
|---|---|
| **Cuerpo del informe narrativo** | **nada** — el POP nunca estuvo ahí |
| **EN SUMA** | `popSumaLinea()` — «PostCEC \[cirugía\] — hora X — IC X — \[hallazgo\]». **Sin el patrón** |
| **Hoja PostCEC del PDF** | `amiloTextoPOP()` — contexto, hemodinamia (con PAM, PAD, PAP, gradiente, RVP y el lactato si se cargó) y POCUS. **Sin patrón, sin las cinco preguntas y sin conducta** |
| **PPT del paciente** | la rama `integrado('pop')`, que lee `popPatron()` — **sin cambios** |
| **Laboratorio** | `_labPopResumen` — tipo de cirugía, soporte por droga e índice cardíaco promedio |
| **Excel** | **nada**: `LAB_XLS_MAP` no tiene un solo `pop_` |
| **Pantalla** | el patrón, las cinco preguntas y el chip «Criterio de EcoSmart» |

⚠️ **`amiloTextoPOP` lee `popEsquema()` y no `popPatron()` directo.** No es un cambio de nombre:
`popEsquema` devuelve lo de `popPatron` **más** los cuatro números que el dibujo publica. Con dos
derivaciones, el dibujo y el papel podrían publicar números distintos del mismo paciente.

⚠️ **LO QUE ESTO LE COSTÓ AL LABORATORIO, Y ESTÁ MEDIDO:** `_labPopResumen` lee el patrón del TEXTO
integrado con `match(/## Patrón hemodinámico\n([^\n]+)/)`, así que su **distribución de patrones**
queda vacía para los estudios que se integren desde hoy. Los estudios ya guardados conservan su
texto y siguen contando: **no se migró nada**. El resto de ese panel no depende de esa sección.

---

## 6 · Referencias y Evidencia

- **Ficha de Referencias**: `#ref-pop`, en la subpestaña «Otros hallazgos» (`REF_SUBTAB.otros`,
  pegada a `pulmon`). Dieciséis filas; **cuatro** con el chip «CRITERIO DE ECOSMART».
- **Evidencia**: `_indPOP()`, la sección **31** de `IND_SECS`, título «Posoperatorio de cirugía
  cardíaca». Formato compacto. Su compuerta es el **tipo de cirugía** consignado o una asistencia
  circulatoria — no `popPatron().suficiente`, que exige índice cardíaco y la dejaría muda en el
  paciente sin catéter.
- **Qué mirar según la cirugía**: `POP_CX_MIRAR`, seis entradas. Las de `cabg` y `valvular` citan
  Nicoara 2020; las otras cuatro llevan el rótulo «Criterio EcoSmart», sin clase y sin nivel.
- **Lo que NO entra en Evidencia**: los patrones hemodinámicos (no tienen fuente) y la vasoplejia
  (sus dos fuentes publican una DEFINICIÓN, no una recomendación, y no son guías).

⚠️ **La guía ASE / SCA / STS 2020 no usa clase ni nivel**: publica tablas de «puntos clave» y una
figura de estrategia de imagen. Lo suyo se publica sin clase y sin nivel, y no se le inventa
ninguna — el mismo motivo por el que el J2 no abrió una Evidencia de ecografía pulmonar.

---

## 7 · El caso de prueba

**TC-534**, con 63 condiciones agrupadas en (A) la pantalla, (B) el esquema, (C) la vasoplejia en
sus seis bordes, (D) el derrame pleural, (E) informe/EN SUMA/PDF, (F) la Evidencia, (G) la ficha,
(H) la animación, (I) el bloque integrado, (J) guardar y reabrir, (K) la maqueta y (L) los
controles.

**Sabe fallar por los dos caminos:** contra el HEAD de la tanda en un worktree aparte, **63
condiciones en rojo y NINGUNA por excepción**; y por mutación dirigida, **25/25 muertas**
(`scripts/_mut_g.py`).

⚠️ **El arnés corre en una ventana ANGOSTA y no se puede redimensionar mientras el caso corre**, así
que las consultas de medios activas son las del celular. Las condiciones de maqueta se escriben
**conscientes del ancho**: lo que se exige por geometría es el contrato que de verdad está activo, y
el otro se exige **leyendo la regla** de `document.styleSheets` —la lección de TC-522 y TC-529—.

⚠️ **Ninguna lectura supone que el nodo existe**, y no es higiene: el caso tiene que poder CORRER
contra el HEAD —donde el acordeón, el esquema y el lactato no existen— para que sus condiciones
salgan en rojo una por una. Con un `getComputedStyle` sobre `null` el caso se cae con una excepción
y no distingue «la app no lo tiene» de «la sonda está rota».

---

## 8 · Trampas de instrumentación que esta tanda volvió a pagar

1. **Un acento grave dentro de un COMENTARIO** del cuerpo de una sonda o de un caso cierra el
   template, y el `SyntaxError` apunta decenas de líneas antes del culpable. Pagado **seis veces**.
2. **`\s` dentro de ese mismo cuerpo se come la barra** y el regex pasa a borrar las ESES: la sonda
   informaba «Va oplejia». Va `\\s`. Y `\(` hace lo mismo y deja un grupo sin cerrar.
3. **La BIBLIOGRAFÍA de una sección de Evidencia imprime el texto completo de la referencia**, que
   nombra las filas con su clase y su nivel: buscar «Clase I · Nivel B» sobre la sección entera da
   positivo **sin una sola recomendación emitida**. Hay que cortar antes de la bibliografía.
4. **`indicAbrir()` borra las respuestas**, al abrir y al cerrar; y quien engancha el oyente de los
   botones es `_indClinCablear()`, a la que llama `indicAbrir` y **no** `indicRender`.
5. **El dibujo tiene que estar A LA VISTA** para que el observador encienda el bucle: medir «no
   corre» sobre un SVG fuera de la ventana es un verde sobre cero elementos del revés.
6. **`escRefPOP` fuerza a `display:block` todos los ancestros de la ficha** —incluida la pestaña
   Referencias— y eso no se deshace: la celda siguiente capturaba la ficha en vez del posoperatorio.
7. **El panel de Evidencia se cierra al terminar cada celda** de la sonda de dos motores: sin eso,
   la celda del tema claro se captura con el overlay de la celda del tema oscuro encima.
8. **`guardarInforme()` a secas no guarda**: el guardado real cuelga de la card de severidades.

---

## ⚠️ La tanda AJ7 cerró G-a y G-e, y midió G-c y G-g (24/10/2026)

- **`POP_PAPM_HP_MMHG` ya no existe.** El corte de hipertensión pulmonar tiene un dueño único,
  **`HP_PAPM_MIN`**, declarado junto a `RVP_ELEVADA_UW` — el primero de los dos bloques
  `<script>` que lo necesita, porque un `const` no está en `window`. **Ningún corte se movió.**
- El **globo ⓘ del bloque de pleura** lleva `.vinfo-btn-44`.
- El **bloque integrado del POP se retira solo** cuando `popPatron().suficiente` es falso: era el
  único de los diecisiete que declaraba no tener datos y seguía emitiendo su hoja.
- **El PPT del paciente SÍ publica el POP, medido de punta a punta**: 6 diapositivas, 35 textos,
  «PostCEC — Cirugía cardíaca», «Patrón hemodinámico: …» y **las cinco preguntas con su
  semáforo**. → `PENDIENTES.md` **AJ7-h** (lo que el Laboratorio pierde) y **AJ7-i** (las cuatro
  frases de tono de conducta que quedan en el POCUS, todas **sólo de pantalla**).

**`docs/mapa/aj7-correcciones.md` § 5.**

---

## ⚠️ La tanda A movió textos de esta zona (2026-10-27)

No cambió ningún dato clínico. Movió notas de trabajo al globo ⓘ y a `docs/fuentes/FUENTES.md`,
dejó una sola cita al final de cada bloque, sacó las mayúsculas de en medio y dejó cada contenido
una sola vez por sección. **Lo que esta tanda hizo está en `docs/mapa/a-evidencia-textos.md`**, y
el caso que lo fija es **TC-537** (ficha en `docs/mapa/tests-fichas-537.md`).
