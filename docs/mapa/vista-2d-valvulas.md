# Mapa — LA VISTA 2D DE LAS VÁLVULAS (`v2d-*`), tanda «Y1» (2026-10-15)

Esquema animado del corazón con las cuatro cavidades, las tres válvulas de la vista apical de cinco
cámaras y sus chorros, más dos columnas de tarjetas y una tabla de cavidades.
**Es SOLO LECTURA de punta a punta:** no calcula ningún grado, no mueve ningún corte, no escribe un
solo campo del estudio y no toca el informe, el PDF, el PPT, el Excel ni el Laboratorio. Nada se
guarda en el estudio ni en el navegador.

Está armado sobre un commit y **no guarda números de línea** a propósito: se busca por nombre.

---

## 1 · Las piezas, por nombre

| Qué | Nombre |
|---|---|
| El botón al pie de Válvulas | `#v2d-abrir` · `v2dAbrir()` |
| El panel y su tarjeta | `#v2d-ov` · `#v2d-card` · `v2dCerrar()` |
| **El lector único del estado** | **`v2dEstado()`** |
| La tabla de válvulas que recorre | `V2D_VALVS` (tres entradas) |
| El dibujo (motor portado) | la IIFE con `render`, `updValve`, `drawPro`, `updJet`, `deform` |
| El estado del dibujo → el dibujo | `v2dSync()` |
| El latido | `v2dArrancar()` · `v2dParar()` · `v2dCorriendo()` · `v2dFase(p)` |
| Las tarjetas | `v2dPintarTarjetas(E)` · `_v2dLi(item)` |
| La tabla de cavidades | `v2dPintarCav(E)` |
| Ayudantes de lectura | `_v2dTxt` · `_v2dTramo` · `_v2dNivel` · `_v2dPastilla` · `_v2dVeredictoProt` |
| La paleta | 21 variables `--v2d-*` en `:root` y en `html.light-mode` |
| El origen de los chorros | `JORG` (escalado) y **`JOFF`** (la corrección del Y1-4) |
| Cobertura | **TC-482** (45 condiciones) · sonda `scripts/_probe_y1.mjs` |

---

## 2 · De dónde sale cada cosa — el lector NO recalcula nada

`v2dEstado()` devuelve **DATOS**, nunca HTML, y junta lo que la app **ya publicó**:

| Lo que el dibujo necesita | De dónde sale | Cómo |
|---|---|---|
| grado de cada lesión (0-3) | `im_grado`, `ia_grado`, `it_grado`, `ea_grado`, `em_grado`, `et_grado` | `_v2dNivel` |
| prótesis (0 nativa / 1 bio / 2 mecánica) | `vm_morf`, `va_morf`, `vt_morf` | `valvEsProtesis` + `/mec/i` |
| geometría del VI | `#geom-val` | `_v2dTramo` |
| tamaño del VI | **`viDimCat()`**, el dueño que el informe usa | directo |
| tamaño de la AI | `#ai-interp` | `_v2dTramo` |
| tamaño del VD | `#vd-tam` | `_v2dTramo` |
| tamaño de la AD | `#ad-interp` | `_v2dTramo` |
| contracción del VI | `#fevi-interp` | `_v2dTramo` |
| contracción del VD | `#tapse-interp`, `#sprime-interp`, `#fac-interp` | cuenta cuántos dicen «disfunción» |
| grado y COLOR de la tarjeta | la **pastilla** `#sevbtn-<tipo>-<valv>` | `_v2dPastilla` |
| veredicto protésico | `#vm-prot-obstr` (mitral) · `#ea-det-sev` (aórtica) | `_v2dVeredictoProt` |

⚠️ **SE LEE EL TEXTO PUBLICADO Y NO SE RECLASIFICA EL NÚMERO.** Es el mismo argumento con que
`eaProtVeredicto` lee `dvi-val` y `ava-idx` en vez de recalcularlos: el número ya lo clasificó su
dueño, y una segunda tabla de cortes acá se separaría del cuadro de referencias el día que uno se
mueva. El precio, declarado: si alguien cambia la PALABRA de una categoría sin avisar, el tramo del
dibujo cae a 0. TC-482 lo fija comparando la categoría de la tabla contra el `textContent` del
cuadro de referencias.

⚠️ **EL GRADO DE LA TARJETA NO PUEDE DISCREPAR DEL INFORME**, y no es por cobertura sino por
construcción: la pastilla y el informe leen el **mismo** `*_grado`, y la pastilla es el dueño único
de la palabra y del color desde `valvSev.refrescar`, que los deriva de UNA lectura de UN campo. Si
el médico fijó un grado a mano, manda lo que puso. TC-482 lo mide igual, escena por escena, contra
el informe **y** contra el EN SUMA.

---

## 3 · Las tarjetas

- **Sólo las lesiones que EXISTEN**, y «existe» es que la pastilla esté prendida: es la misma
  compuerta con la que el informe decide si nombra la lesión.
- **Sin tarjeta vacía**: con la lista vacía se publica UNA línea gris («Sin insuficiencias
  consignadas.»). Una tarjeta sin grado se lee como una lesión que la app no supo graduar.
- La frase es **la del EN SUMA sin los valores**: «IM severa», «EAo severa», «EM significativa».
  El porqué con sus números es el **Y2** y no entra acá.
- Sin grado y con la pastilla prendida → **«IM presente»**, igual que el EN SUMA.

### Con prótesis

| Columna | Qué publica |
|---|---|
| **Estenosis** | el **veredicto protésico** (`vm-prot-obstr` / `ea-det-sev`), **sin chip de color** |
| **Insuficiencia** | la **pastilla**, como en la nativa |

⚠️ **LA ASIMETRÍA ES DE LA GUÍA Y NO UNA ELECCIÓN DE ESTILO.** La ASE 2024 gradúa la regurgitación
protésica con los criterios de la válvula **nativa**, así que ahí la pastilla dice lo correcto; la
estenosis protésica tiene su propio veredicto y **ninguna escala de severidad**, que es lo que el
W2-B retiró de esa pantalla. Pintar el residuo nativo de `ea_grado` sería republicar esa escala.

⚠️ **UNA PRÓTESIS SIN VEREDICTO NI LESIÓN NO TIENE TARJETA** — hoy, la tricuspídea, que no tiene
veredicto protésico en esta app. Se dibuja y no se nombra. Declarado en `docs/PENDIENTES.md`.

---

## 4 · La tabla de cavidades

Cuatro grupos (VI, VD, AI, AD) con el **rótulo**, el **valor** y la **categoría que la app ya
publica**, leída por `textContent`. **Sólo lo cargado**: una medición que no está no tiene fila,
porque una fila con la raya afirma que se miró y no se encontró nada. Con el formulario vacío no hay
tabla: una línea gris lo dice.

---

## 5 · El dibujo

Portado de la demo que el médico aprobó (`docs/3d/Esquema valvular_ prótesis, geometría y
función.html`, **sin versionar**), como código propio: **sin CDN, sin fuentes externas, sin
`localStorage` y sin `IndexedDB`**. La geometría, las curvas del ciclo y el dibujo de las prótesis
quedan letra por letra como se aprobaron.

Tres cambios y ninguno de forma:
1. **ids y clases con prefijo `v2d-`** — en esta app `.lbl` ya existe con otro significado (89 usos).
2. **el estado sale del estudio** en vez de los controles de la demo (los paneles de ejemplo, los
   presets, el botón de reproducir y el deslizador de duración **no se portaron**).
3. **el latido sólo corre con la vista abierta.**

### El latido

`v2dArrancar()` pinta **un cuadro sincrónico** y después arma el bucle; `v2dCerrar()` lo desarma con
`cancelAnimationFrame` y baja la bandera.
⚠️ **EL CUADRO SINCRÓNICO NO ES COSMÉTICO**: `requestAnimationFrame` pinta en el cuadro SIGUIENTE,
así que sin él la vista se abría con el dibujo del paciente anterior durante un cuadro — y una sonda
que lee justo después de abrir mide ese dibujo viejo. La primera corrida informó «cero prótesis
dibujadas» sobre un árbol que las dibuja bien.
**Medido espiando `requestAnimationFrame`:** 0 cuadros pedidos en 900 ms con la vista cerrada, 55
con la vista abierta, 0 otra vez al cerrar.

**`prefers-reduced-motion`** ya estaba contemplado en la demo y se conserva: con la preferencia
puesta **no hay bucle**, hay UN cuadro fijo en la sístole (`phi` 0,30).

### Los chorros — la corrección del Y1-4

Los de la IM y la IT nacían **por encima** de sus valvas (dentro del ventrículo) y el de la IAo por
debajo de las suyas. `JOFF` los baja o los sube hasta la **línea de coaptación**, y **se calcula de
la misma data que dibuja las valvas** —el medio de las dos bisagras más `D.BOW`, que es exactamente
lo que `updValve` usa para cerrarlas—: con un número a mano, el día que una valva se mueva el chorro
se queda donde estaba.

    IT  +13,66      IM  +14,31      IAo  −8,55      (unidades del viewBox, sólo en y)

Es una **traslación pura**: no cambia el tamaño, ni el color, ni la opacidad, ni una curva de la
animación. El origen de **escalado** (`JORG`) se mueve con el chorro.

---

## 6 · La maqueta

| Ancho | Qué se ve |
|---|---|
| > 900 px | tres columnas: insuficiencias · **dibujo** · estenosis, y la tabla abajo |
| ≤ 900 px | **una** columna, en el orden del marcado: dibujo, insuficiencias, estenosis, cavidades |

Las tres columnas se arman con **posición explícita** (`grid-column`), igual que la grilla del
Doppler mitral y la del VD, y la media query las apaga. **No se usa `order`**: con `order` el orden
visual y el de lectura se separan, que es como una tabla de datos clínicos termina diciendo una cosa
al ojo y otra al lector de pantalla.
**Medido a 1200, 768, 390 y 360 px en los DOS temas:** tres columnas a 1200 y una en los otros tres,
**cero scroll horizontal** en las ocho celdas —ni en la página ni en el cuerpo del panel— y el dibujo
siempre dentro de su caja.

### La paleta

**21 variables `--v2d-*`**, declaradas en `:root` **y** en `html.light-mode`.
⚠️ **NO VIVEN DENTRO DE LA CAJA DEL DIBUJO.** Una variable que no existe en el ámbito donde se usa
**cae al heredado en silencio**, que es como cinco avisos de esta app se vieron grises durante
semanas (`--amber` dentro de `.amilo-root`). Medido: las 21 resuelven en los dos temas, ninguna queda
vacía y **veinte cambian** con el tema; la única que no es `--v2d-brodhi`, el brillo especular del
vástago biológico, que es el mismo blanco rosado en los dos modos **en el dibujo aprobado**.

---

## 7 · Accesibilidad y seguridad

- `role="dialog"` **CON** `aria-modal="true"`: eso es lo que lo mete en la **trampa de Tab** y en el
  **oyente genérico de Escape** del bloque de accesibilidad, que le clickea el primer botón cuyo
  `onclick` matchee `/cerrar/`. Por eso **no hace falta un segundo oyente de teclado**, y
  `v2dCerrar` es idempotente.
- **El foco entra a la tarjeta y vuelve al botón**: es la lección que el panel de Evidencia pagó —sin
  enfocar la tarjeta, el foco queda en el `body` y el primer Tab se va a un control que está DETRÁS
  del overlay—.
- **Todo por `textContent`, ni un `innerHTML`.** Lo que se pinta son categorías que otras funciones
  escribieron en el DOM, y la regla de la casa es que un dato que ya viajó por el DOM no vuelve a
  entrar como marcado: así el sink no existe, en vez de existir y ser inofensivo.
- **Nada en el navegador**: medido, cero claves `v2d` en `localStorage` y en `sessionStorage`.
- **Sin captura y sin inclusión al PDF**: vienen después.

---

## 8 · Trampas medidas en esta tanda

- ⚠️ **`\s` DENTRO DE UN TEMPLATE LITERAL SE COCINA A LA LETRA `s`.** La sonda informaba
  «in uficiencia » en vez de «insuficiencias»: el regex quedaba en `/s+/g` y borraba todas las eses.
  En el cuerpo de una sonda va `\\s`.
- ⚠️ **UN CHIP VACÍO LO VIO LA CAPTURA Y NO LA LECTURA.** Con la prótesis —que no lleva grado— la
  primera versión creaba el span igual y publicaba una pastilla en blanco debajo del veredicto.
- ⚠️ **EL ESTILO DEL INFORME ES ESTADO DE SESIÓN**, y el control negativo lo pagó: el bucle de los
  tres estilos deja el NARRATIVO puesto, así que la fila del Excel se llevaba ese texto y la
  comparación informaba dos diferencias que eran del estilo y no de la vista.
- ⚠️ **UN CASO NO PUEDE EMULAR EL ANCHO** —corre dentro de la página y una media query no se finge—:
  TC-482 afirma la **regla** que produce el comportamiento y la sonda mide el ancho **renderizado**.
  Es el reparto que TC-460 dejó escrito para el diagrama de la BSE.
- ⚠️ **TC-482 MURIÓ POR EXCEPCIÓN CONTRA HEAD EN SUS DOS PRIMERAS VERSIONES** —`[0].cat` sobre una
  tabla vacía y `JSON.stringify({dvi:r.E.dvi})` sobre un estado nulo, y el segundo estaba en el
  TERCER elemento del `push`, que se evalúa **siempre**, condición aparte—. Toda lectura va por un
  ayudante con centinela. Misma lección que TC-455, TC-462, TC-465, TC-471, TC-473, TC-474, TC-477,
  TC-480 y TC-481.

---

## 9 · La maqueta CHICA Y DISCRETA — la tanda «Y1b» (2026-10-16)

El Y1 dejó el panel a pantalla completa y el médico lo vio en el navegador: el dibujo enorme, las
tarjetas pegadas a los bordes, y **la tabla de cavidades y la nota cortadas** debajo del borde
inferior. Medido en HEAD a 1200×700: panel **1180×680** en `@10,10`, dibujo **481×490**, nota y
tabla FUERA de la caja visible y **scroll interno en los seis anchos**.

### El botón del pie

`#v2d-abrir` pasa de `btn btn-primary` a **`btn btn-ghost`**, que es exactamente el estado de
**reposo de las ocho pestañas de válvula** (`#pill-insuf-mitral` y sus siete hermanas son
`btn btn-ghost valv-pill`). **No se declara un solo color acá**: por eso los dos no se pueden
separar el día que alguien repunte la paleta. Lo que sí se declara es la **tipografía y el relleno
de una pestaña** (`.tab-btn`: 11 px, 600, 5/12).

| | antes (Y1) | después (Y1b) |
|---|---|---|
| clase | `btn btn-primary` | `btn btn-ghost` |
| tamaño | 109 × 44 px | **93 × 44 px** |
| fondo (noche / día) | `rgb(79,142,247)` / `rgb(47,111,224)` | `rgb(30,35,51)` / `rgb(238,241,246)` |
| texto | blanco | `rgb(232,236,244)` / `rgb(26,34,51)` |
| borde | ninguno | `rgb(42,48,80)` / `rgb(214,220,230)`, 1 px |
| tipografía | 12 px / 700, pad 9/18 | **11 px / 600, pad 5/12** |

Los tres colores coinciden **carácter por carácter** con los de una pestaña en reposo, en los dos
temas, y TC-483 los compara con su control negativo —una pestaña **prendida** no se ve así—.

⚠️ **EL PISO DE 44 px NO SE BAJA, Y NO ES UN DESCUIDO.** La regla global de esta app
(`button, [role=button], .btn, .tab-btn … { min-height:44px }`) **no está acotada a `pointer`**,
así que una pestaña de válvula en reposo **también** mide 44 px de alto en escritorio: bajarlo acá
haría que el botón dejara de tener el tamaño de una pestaña, que es lo que la orden pide, y
revertiría la decisión de Maicol del 2026-09-25 («se conserva el piso y lo que baja es el peso
visual»). Lo que baja es el peso visual.

### El panel

```
#v2d-card{position:absolute;inset:0;margin:auto;width:min(900px,94vw);
  height:max-content;max-height:85vh; …}
```

⚠️ **SE CENTRA CON `inset:0` + `margin:auto` Y NO CON `transform:translate(-50%,-50%)`.** Un
ancestro con `transform` es **bloque contenedor** de cualquier descendiente `position:fixed`, así
que el día que esta vista necesite una tarjeta flotante adentro —como la del globo ⓘ, que por esto
mismo cuelga del `body`— su rect del viewport y su posición dejarían de estar en el mismo sistema.
Con `margin:auto` no hay un segundo sistema de coordenadas que mantener.

`height:max-content` acotada por `max-height` es lo que deja que la tarjeta mida lo que su contenido
pide y, cuando lo pasa, que el que se desplaza sea **el cuerpo** y no la página.

### El interior

| | antes (Y1) | después (Y1b) |
|---|---|---|
| columnas | `1fr / 1.5fr / 1fr`, gap 14 | **`184px / auto / 184px`, gap 8/10, `justify-content:center`** |
| dibujo a 1200×700 | 481 × 490 | **131 × 200** |
| dibujo a 1440×800 | 584 × 560 | **183 × 280** |
| dibujo a 1920×1080 | 789 × 756 | **209 × 320** |
| tarjeta (`li`) | 320,6 px de ancho, 13 px | **184 px, 11,5 px**, relleno 5/7 |
| pastilla | 12 px, pad 2/9 | **10,5 px, pad 1/7** |
| tabla de cavidades | 1150 px, filas de 24 px, 12,5 px | **582 px, filas de 19 px, 11,5 px** |
| nota al pie | 11,5 px | **10,5 px** |
| encabezado | pad 10/14 | pad 7/12 |

El dibujo se escala **por el ALTO** y el ancho sale de la proporción del `viewBox`:
`height:clamp(200px, calc(100vh - 520px), 320px)`. **Sólo el contenedor**: ni una curva, ni un
chorro, ni un cuadro de la animación se tocan.

⚠️ **EL RESTADOR DEL CLAMP SALE DE MEDIR, NO DE UN NÚMERO REDONDO.** Con el dibujo en los 300 px
que la orden proponía como punto de partida, la tabla de cavidades **completa** —sus **once**
filas— no entraba en el 85 % de una ventana de 700 px y aparecía desplazamiento interno, que es
justo lo que esta tanda cierra. La condición que manda es «todo se ve sin desplazamiento a
1200×700»; el alto del dibujo es la variable que se ajusta.

### Medido, con la escena de ONCE filas de tabla y en los dos temas

| ventana | panel | dibujo | scroll interno | nota y tabla dentro | scroll horizontal |
|---|---|---|---|---|---|
| 1200×700 | 900×587 @150,56 | 131×200 | **no** | **sí** | no |
| 1440×800 | 900×667 | 183×280 | **no** | **sí** | no |
| 1920×1080 | 900×707 | 209×320 | **no** | **sí** | no |
| 768×1024 | 752×1008 @8,8 | 157×240 | sí (dentro del panel) | tabla sí | no |
| 390×844 | 374×828 @8,8 | 157×240 | sí | — | no |
| 360×740 | 344×724 @8,8 | 144×220 | sí | — | no |

La media query de una columna pasó de **900 a 768 px**, que es el corte que la orden fija y el mismo
que la app usa en toda su hoja. En angosto la tarjeta vuelve a tomar la pantalla con **8 px** de
margen (`inset:8px;margin:0;width:auto;height:auto;max-height:none`) y el dibujo recupera el ancho
con un techo de 240 px.

---

## 10 · El «POR QUÉ» de cada tarjeta — la tanda «Y2» (2026-10-16)

Cada tarjeta dice ahora **por qué** la lesión tiene ese grado: qué criterios votaron, con su valor y
con el grado que da cada uno, y —cuando la pantalla lo nombra— **cuál decide**.

### Las piezas

| Qué | Nombre |
|---|---|
| La tabla de criterios por lesión | **`V2D_PORQUE`** (ocho entradas) |
| El nombre del criterio | `_v2dRotulo(row)` |
| El valor y el grado de un criterio | `_v2dCrit(c)` |
| La línea que decide | `_v2dDecide(C)` |
| El «porqué» completo | **`_v2dPorQue(clave)`** |
| El color de una palabra de grado | `_v2dChipCls(pal)` |
| Las tres celdas de una fila | `_v2dPqFila(f)` |
| El pintor | `_v2dPqPintar(li, pq)` |
| El desplegable | `v2dPorQueTog(btn)` |
| Las marcas de retiro | `V2D_PQ_RETIRO` |
| Cobertura | **TC-484** (51 condiciones) · sonda `scripts/_probe_y1b.mjs`, grupo `porque` |

### Nada se recalcula: de dónde sale cada cosa

| Pieza de la tarjeta | De dónde se lee |
|---|---|
| nombre del criterio | los **nodos de TEXTO directos** de su `.calc-lbl` — sin los cortes ni el globo |
| valor, con su unidad, su redondeo y su «(revisar)» | el `textContent` del span del valor |
| grado, forma 1 | el span hermano `[data-grado-de="<id>"]` (IM, IAo, EAo) |
| grado, forma 2 | un id propio: las cuatro `.em-clase-*` de la estenosis mitral |
| grado, forma 3 | **dentro del valor**: la IT («8 mm · Severa (≥7 mm)»), la ET y las cápsulas protésicas |
| la línea «Decide» | el renglón integrado, **tal cual** |
| el aviso de discordancia | el mismo nodo que la pantalla publica |
| el fundamento del ajuste manual | el `*_fund_nota` del propio cajón |

⚠️ **LAS TRES FORMAS DEL GRADO SE DECLARAN POR CRITERIO Y NINGUNA SE ADIVINA** (`gid`,
`sep:'punto'`, `sep:'parentesis'` o nada). Y **el nombre sale de los nodos de texto del rótulo** y
no de una copia: el rótulo completo trae los tres cortes pegados («Vena contracta (mm) <3 · 3–<7 ·
≥7 mm»), que en una tarjeta de 184 px no entran.

### Qué lesión lleva «Decide» y cuál no

| Lesión | Lista de criterios | Línea «Decide» | Por qué |
|---|---|---|---|
| IM | sí (5 + los 6 por método) | **no** | su renglón publica el grado y **no nombra** el criterio: la regla es un conteo |
| IAo | sí (7) | **no** | ídem |
| IT | sí (4) | **no** | ídem; su aviso de discordancia sí lista los grados y se repite |
| ET | sí (4, con su banda) | **no** | su renglón publica el veredicto binario y no nombra cuál lo produjo |
| **EAo nativa** | sí (5) | **sí** | su renglón dice «Severa — **por velocidad**» desde la tanda F, y el Z5 lo arregló |
| **EM** | sí (4) | no, pero **la fila que decide lleva la marca** | la pantalla pega la palabra «peor» a la clase de esa fila |
| **Prótesis mitral** | sí (5, con su banda) | **sí** | su veredicto publica el paréntesis: los positivos y el «N de M» |
| Prótesis aórtica | sí (4) | **no** | su regla son **dos mitades** y no un criterio; la nota va al pie de la lista |

⚠️ **NO SE INVENTA EL «DECIDE» DONDE LA PANTALLA NO LO DICE.** Atribuirle el grado a una fila
sería una segunda lectura de la regla de integración, escrita acá. Y en la aórtica nativa el texto
se publica **tal cual**: recomponerlo como «criterio valor (grado)» obligaría a una tabla de
equivalencias entre el nombre que usa el renglón («por gradiente medio») y el rótulo de la fila
(«G. medio»), que es justo la segunda copia que esta tanda evita.

⚠️ **LA VMAX DE LA ESTENOSIS AÓRTICA VOTA Y NO TIENE FILA EN ESE CUADRO** —la mitad de **F8** que
sigue abierta—, así que el renglón puede nombrar «por velocidad» y la lista no tener esa fila.

### Las prótesis

- **Sin pastilla de color**, y es la asimetría que el Y1 ya declaró: la ASE 2024 no publica escala
  de severidad para la estenosis protésica —el W2-B la retiró de esta pantalla— así que el grado va
  como texto con su banda al lado.
- **La velocidad pico se marca «no vota» y no se saca**: la Tabla 11 la publica y la prosa del folio
  24 la omite (Z5). Esconderla dejaría al médico sin saber que esa medición está y no pesa.
- **El PPM no entra**: no es un criterio de obstrucción.
- **Los retirados** —el gradiente medio con regurgitación significativa y, en una mecánica, con el
  THP normal— se reconocen por el **motivo que la cápsula ya escribe** (`V2D_PQ_RETIRO`: «no
  concluye», «no válida», «no aplica») y van en gris con ese motivo. Un «sin criterios de
  obstrucción» **no** es retiro: es un criterio medido que dio negativo.

### El grado fijado a mano

Si el médico consignó un grado **distinto del calculado**, la tarjeta publica ese grado y **nada
más**: ni valores, ni lista, ni botón. Publicar los criterios al lado de un grado que los contradice
invitaría a leer la tarjeta como si el cálculo hubiera ganado. Debajo va el **aviso de ajuste
manual que la pantalla ya escribe** —que además nombra el grado calculado— y, si está escrito, el
**fundamento** del cajón.

⚠️ **EL CRITERIO ES `sevDiscrepa`**, el mismo dueño que gobierna el aviso rojo y el cajón del
fundamento, y **no `esqSevManual` pelado**: fijar a mano el **mismo** grado que el cálculo no es una
discrepancia, y ahí la lista sigue teniendo sentido. TC-484 lo fija con su control negativo.

### El desplegable

- `<button type="button">` real, con `aria-expanded`, **cerrado por defecto** y **sin `:hover`**.
- **Objetivo táctil de 40 px** con un `::after` que extiende el **área clicable** sin agrandar lo
  que se ve: en una tarjeta de 184 px un control de 44 px se come la tarjeta. Es el patrón del
  glosario del panel de Evidencia, y por eso el botón lleva `min-height:0` para salirse del piso
  global. Medido con `elementFromPoint` a 19 px arriba y abajo del centro.
- **No recuerda nada**: las tarjetas se repintan enteras en cada `v2dAbrir`, así que al cerrar y
  volver a abrir la vista todas las listas vuelven cerradas sin guardar ni limpiar un estado.
- ⚠️ **`.v2d-pq[hidden]{display:none;}` EXPLÍCITO.** El `[hidden]{display:none}` de la hoja del
  **navegador** pierde contra cualquier regla de autor, y esta app ya lo pagó cuatro veces —`.fg`,
  el banner de versión, `.frases-panel` y el botón del panel de Evidencia, que se veía con `hidden`
  puesto—. Con el `display:grid` declarado, sin esa línea la lista **nacía abierta**.
- **Un grado largo se va a su propia fila, a lo ancho** (más de 12 caracteres). En 184 px la tercera
  columna mide unos 55: una banda protésica entera caía ahí partida en cinco renglones de dos
  palabras. **Lo vio la captura, no la medición**: el texto estaba completo y era ilegible.

---

## 11 · Trampas medidas en estas dos tandas

- ⚠️ **SEMGREP CAZÓ EL HANDLER COMO CADENA SOBRE CÓDIGO RECIÉN ESCRITO.** La primera versión del
  botón hacía `setAttribute('onclick', 'v2dPorQueTog(this)')` y daba **128 / 0 ERROR** donde la
  línea base es 127. Pasa por propiedad (`b.onclick = …`), que además lo deja fuera de la búsqueda
  **por atributo** del oyente genérico de Escape.
- ⚠️ **EL SCANNER DE SEMGREP HAY QUE CORRERLO DESDE `~/Desktop/APLICACIONES`**, con la ruta
  `ecosmart/index.html`. Desde dentro de `ecosmart` informa **«0 hallazgos en 0 apps»**, que se lee
  idéntico a «limpio». Es un denominador roto con pinta de medición buena.
- ⚠️ **`\s` DENTRO DEL TEMPLATE DE UNA SONDA SE COCINA A LA LETRA `s`**, otra vez: la sonda informó
  «Vmax teledia tólica» sobre un rótulo perfecto. Van `\\s`.
- ⚠️ **`JSON.stringify(undefined)` DEVUELVE `undefined` Y NO UNA CADENA**, así que un `.slice`
  encima revienta — y eso iba en el **tercer** elemento del `push`, el texto de «encontrado», que se
  evalúa **siempre**. TC-484 murió por excepción contra HEAD exactamente ahí y se llevó las otras
  50 condiciones. Misma lección que TC-482 pagó dos veces.
- ⚠️ **EL GRADO DEL GRADIENTE DE LA EM ESTÁ EN MASCULINO** («significativo (≥10 mmHg)», porque
  califica al gradiente y no al área) y con «significativa» cableado ese chip salía **sin color**,
  con el fondo del marco. La clase se decide por la **raíz**, preguntando «no significativ» antes
  que «significativ» porque lo contiene.
- ⚠️ **EL SEPARADOR ENTRE «no vota» Y LA BANDA ERA UN MARGEN DE CSS**: el ojo los veía separados y
  el `textContent` —que es lo que lee un lector de pantalla y lo que compara el caso— los devolvía
  **pegados** («no votasugiere obstrucción»). Va como nodo de texto.
- ⚠️ **LA VELOCIDAD PICO PUBLICA «—  (sin medir — se carga en Estenosis Mitral)»**: el texto
  completo no es una raya, así que la guarda de «sin fila vacía» lo dejaba pasar y la lista
  publicaba una fila con la raya y su motivo. Se descarta **también** después de separar el grado.
- ⚠️ **EL `viewBox` RENDERIZADO NO ES EL DEL MARCADO**: el motor lo reescribe para encuadrar, y el
  fuente serializado ya lo trae reescrito. El control negativo de TC-483 salió rojo **dos veces**
  sobre un dibujo perfecto.
- ⚠️ **LA SUITE LANZA CHROME SIN `--window-size`**, así que el viewport da **756 px** y toda la app
  se mide en **modo celular**: un caso afirma la REGLA de escritorio y mide lo renderizado en
  angosto, con el denominador que lo dice. Los seis anchos los mide la sonda.
- ⚠️ **UN BUCLE DE TRÍOS NO SIRVE PARA UNA LISTA CON UNA CELDA A LO ANCHO**: el de la sonda tenía
  la condición de corte mal y se comía la última celda — informó «4 filas» sobre una lista que tenía
  cuatro **y su nota**.


---

## 12 · El 3D de la MITRAL dentro de ETE lee este mismo lector (Y3, 2026-10-16)

El panel 3D de la válvula mitral, que vive en la pestaña **ETE** al lado de la vista quirúrgica,
**no tiene lector propio**: `m3dEstado()` llama a `v2dEstado()` y le agrega lo que vive en ETE —los
seis festones, la vena contracta, el área que la pantalla usa para graduar, el diámetro anular y el
trombo de orejuela—.

De acá salen, sin una sola cuenta nueva:
- el **grado** de la IM y de la EM (`E.im`, `E.em`);
- las **tarjetas** de esa columna, que son los objetos de `E.insuf` y `E.esten` filtrados a Mitral,
  con su misma frase, su mismo chip y su misma línea «Decide»;
- el **tamaño de la aurícula** (`E.dai`).

⚠️ **EL CHIP DEL 3D REUSA LA CLASE `v2d-chip`**, no copia sus cuatro colores: con una paleta propia,
el mismo grado saldría de un color en esta vista y de otro allá el día que uno se mueva. Medido
antes de arreglarlo: con una clase propia el chip salía **transparente**.

⚠️ **MOVER UN CRITERIO DE `V2D_PORQUE` MUEVE TAMBIÉN LA TARJETA DEL 3D**, porque la línea «Decide»
sale de `_v2dPorQue`.

El mapa de esa zona es **`docs/mapa/mitral-3d-ete.md`**.

---

## 13 · El panel pasó a estar **EN LÍNEA** — la tanda «Y1c» (2026-10-16)

La ventana flotante de las secciones 9 y 10 **ya no existe**: el panel vive dentro de la pantalla
de Válvulas, debajo del botón, y el mismo botón lo prende y lo apaga. Con eso se fueron el fondo
tenue, el botón «× Cerrar», el cierre al tocar fuera, Escape, `aria-modal`, el foco que entraba a
la tarjeta, el techo de alto y el desplazamiento interno; y el dibujo volvió a **300 px** con
altura explícita.

**Todo eso vive en `docs/mapa/vista-2d-en-linea.md`**, junto con los dos defectos que Maicol
reportó y sus causas medidas: el movimiento de los carteles con el latido —que **no** era el
`viewBox`, sino la columna `auto` dimensionada por la línea de fase— y el colapso en Safari —el
`flex-basis:0%` contra un contenedor de altura indefinida—.

⚠️ **LAS TABLAS DE LAS SECCIONES 9 Y 10 DESCRIBEN EL Y1b Y EL Y2, NO LO VIGENTE.** Lo que sigue
valiendo de ellas es el reparto de columnas, el contenido de las tarjetas y el mecanismo del «por
qué»; la geometría del panel y el estilo del botón los manda el mapa nuevo.

---

# La tanda «VS» (2026-10-17) — EL CORAZÓN DERECHO A LA TABLA 1 DE LA ASE 2025

⚠️ **El VD, la AD, la VCI y la raíz aórtica se alinearon a la Tabla 1 de la ASE 2025 de corazón
derecho, y todo eso vive en `docs/mapa/corazon-derecho-ase2025.md`.** Ahí están el dueño único
(`ASE25_T1` + `ase25Grado` + `ase25Rango` + `ase25Corte`), las doce filas con su antes y su
ahora, las tres cosas que la tabla NO dice como uno espera —no distingue sexo, el solape
tipográfico del TAPSE y de la onda S′, y el hueco del volumen de la AD—, las superficies una por
una, el 21 mm exacto de la vena cava, el «40 mm o más» del seno de Valsalva, las cuatro tarjetas
con sus cuatro zonas y las ocho trampas.

**Lo que hay que saber antes de tocar esta zona:** los cortes y los operadores ya NO viven acá.
Mover uno es editar `ASE25_T1`, y el assert de arranque exige que las cuatro bandas sigan en
orden y sin hueco.

---

## → La tanda «VAL» (2026-10-17) vive en `docs/mapa/valvulas-val.md`

Lo que esa tanda movió en esta zona, en una línea cada uno:
- **Estenosis tricuspídea:** el gradiente medio pasa a `> 5` mmHg ESTRICTO, el **THP deja de votar**
  y es un signo de APOYO, el veredicto **nombra el criterio que decide** (área → gradiente → VTI)
  y entra un aviso de texto con insuficiencia tricuspídea mayor que leve. La cita del cuadro pasa
  de «ESC/EACTS 2021» a **2025**.
- **Estenosis aórtica:** el **1,50 cm² EXACTO es MODERADA** (`AVA_MOD_MAX`, del que se deriva
  `EA_BANDAS.avaSinMin`). El borde de 1,0 se verificó y **no se tocó**.
- **Insuficiencia aórtica:** la fracción regurgitante es severa con **más** de 50 %.
- **Insuficiencia mitral:** la onda E apoya con **más** de 120 cm/s, el **cociente VTI se retira
  desde la IAo moderada** —y con eso se fue la salvedad de la divergencia— y el **jet/AI gana su
  fuente** (ACC/AHA 2020, Tabla 17, folio e121) sin mover un número.
- **Referencias:** el texto general de integración, al final de la sección de válvulas nativas.

Cada corte con su tabla, su folio impreso y su hoja del PDF está en `docs/fuentes/FUENTES.md` →
«La tanda VAL». Lo declarado y no tocado, en `docs/PENDIENTES.md` → VAL-1 a VAL-8.

---

## La FUGA PARAVALVULAR de la prótesis quirúrgica → `docs/mapa/protesis-fuga-pvl.md`

La tanda **PRO-B** (2026-10-17) extendió el motor de la fuga de la TAVI —`eteTaviRPV`, con su
**fuente inyectable**— a la **prótesis aórtica quirúrgica**, con los cuatro cortes de la **Tabla 8
de la ASE 2024 (folio 23, hoja 22)** que ese motor ya aplicaba y **sin mover ninguno**: tres campos
nuevos (`ea_pvl_origen`, `ea_pvl_ext`, `ea_pvl_vc_area`) y **dos prestados**, el ancho de vena
contracta de `ia_vc` y el THP de `ia_pht`, cuyos cortes ya coincidían dígito por dígito.
En la **mitral** no se movió un solo corte —los cuatro cuantitativos de la **Tabla 13 (folio 30)**
ya eran los de `IM_CORTES`— y lo único que entró es `vm_pvl_origen`, el selector que marca que la
regurgitación es paravalvular. **La Tabla 13 no publica extensión circunferencial, así que la
mitral no la ofrece.**

⚠️ **El reverso diastólico NO alimenta el motor de la quirúrgica**: `IA_VMAX_TD_SEVERA` sigue en
20 cm/s de un solo nivel para la nativa y la SAVR (ESC/EACTS 2025) y la lectura en dos niveles es
de la VARC-3, que es de TAVI.
⚠️ **El Laboratorio tenía una segunda copia de los cuatro cortes** y divergía del dueño en dos
cosas; desde el PRO-B3 le pregunta al dueño, y `RPV_L` ganó el rótulo «Sin RPV».

Cobertura: **TC-497**, 51 condiciones. Fuentes: `docs/fuentes/FUENTES-protesis.md`.
