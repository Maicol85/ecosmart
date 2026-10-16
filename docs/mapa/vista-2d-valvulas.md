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
