# Fichas de los casos TC-650 a TC-655 — tanda PANT-7

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo.
El mapa de la tanda es `docs/mapa/pant7-vd-cia-globos.md`.

Los seis caen contra HEAD (`437834d`, md5 `bb6adf41`) por **69 condiciones y ninguna por
excepción**, verificado en un worktree con el mismo archivo de casos, alternando sólo
`index.html`.

---

## TC-650 · el dibujo del VD con la caja y la letra del esquema valvular 2D

**Qué fija.** (A) Que la regla de caja de `#vdsc-svg` declare el **mismo** ancho y alto que
`#v2d-svg` y que `.vdsc-lbl` y `.vdsc-cn` declaren la **misma** letra que `.v2d-lbl` y `.v2d-cn`
—comparando una regla contra la otra, no contra un número escrito en el caso, así que mover las
dos juntas sigue pasando y mover una sola lo pone en rojo—. (B) Que los dos rótulos digan «SIV
desplazado» y «Sg McConnell» con **un `tspan` cada uno**, con cero cruces entre rótulos medidos
con `getBBox` y cero textos fuera del lienzo. (C) **Control negativo:** sin datos, cero textos
visibles, con el contorno dibujado como denominador. (D) Un solo control dentro de la caja del
dibujo, y es el botón de pausa.

**Denominadores:** (A1) las dos reglas de caja existen; (B0) el dibujo tiene textos visibles con
la escena cargada; (C0) el contorno está dibujado (más de 100 caracteres de `d`).

⚠️ **Las reglas se leen del TEXTO de los elementos `<style>` y no de `document.styleSheets`**,
que en este arnés devuelve vacío —medido: la primera versión daba cero reglas y los dos
denominadores en false—.

**Mutaciones que lo matan:** 01 a 06.

---

## TC-651 · los bordes de la CIA dentro de su sector y la miniatura del diagrama

**Qué fija.** (A) Que `_ciaSegAnchoDisp` devuelva un ancho mayor que cero dentro del anillo y
cero fuera de él. (B) Que `ciaDonutDataURL` publique su lista de los que no entraron y que con
datos plausibles esté **vacía**. (C) Que la línea de corrido no se emita y que la velocidad del
jet entre **sólo** cuando el párrafo de la CIA no se va a emitir. (D) Que `INF_MIN_DIAG` tenga la
entrada de la CIA, que su puerta sea la casilla **y** que haya algún borde medido, y que la fila
«En el PDF» cuente una tarjeta.

**Denominadores:** la función existe; el dataURL tiene bytes; la casilla está marcada y los
bordes cargados.

**Guardada a propósito:** el ayudante que llama a `_ciaSegAnchoDisp` devuelve `'SIN FUNCION'` en
lugar de reventar, porque contra el árbol anterior esa función no existe y un `ReferenceError`
mata el caso por **excepción**, que no dice qué invariante se rompió. Es la lección de TC-546.

**Mutaciones que lo matan:** 07 a 13.

---

## TC-652 · los globos que no abrían, los dos nuevos, el resalte y la barra

**Qué fija.** (A) Que con el **segundo** botón de una clave en la mano el ancla sea **ese** y no
el primero del documento, para `vd-triv` y para `pul-balik`. (B) Que `VINFO` tenga las dos claves
nuevas y que su texto traiga los cortes por método con sus cuatro grados, la diferencia entre las
dos guías y, en el del 60/60, las dos condiciones y la muesca mesosistólica — con el control de
que **no** dice la palabra «positivo». (C) Que `VINFO_REF` las incluya a las dos. (D) Que el
resalte pinte los dos rótulos con 59 ms y **no** con 60 exactos ni con el campo vacío, y que
**no toque la respuesta del médico**. (E) Los cuatro tramos de `vdTapGrado`, borde por borde.
(F) **Control:** `UMBRAL_TAP_HTP` sigue en 105 y `vdTapCat` sigue dando `htp` en 104 y `normal`
en 105.

**Denominadores:** (A0) la tarjeta existe en el marcado; (A1) las dos claves tienen **dos**
botones cada una; (D0) los dos rótulos del signo existen; (D0b) el médico contestó «No»; (E0) la
tabla tiene la fila del tiempo de aceleración.

⚠️ **(D0b), (D1b) y (D5) son el control de que el resalte no escribe el campo, y la primera
versión no podía fallar:** leía el campo **después** de haber corrido el resalte con 59 ms, así
que si escribía ya había escrito. Hoy el médico contesta «No» **antes** del primer resalte —una
respuesta que el resalte contradice— y se exige que siga en «No». Nació del barrido de
mutaciones.

**Mutaciones que lo matan:** 14 a 21.

---

## TC-653 · la franja del TEER legible, «no determinable» fuera del papel y PSAP

**Qué fija.** (A) Que la franja exista, que **tras «Nuevo estudio»** tenga su texto completo
palabra por palabra, que se muestre sin tipo de IM elegido y que el tema claro le dé un color
propio **con el selector exacto**. (B) Que sin datos el bloque de hemodinámica **no** escriba la
línea del Forrester ni la del perfil hemodinámico con «no determinable», y que **con** el
Forrester resuelto la línea **sí** se emita. (C) Que el papel diga «PSAP estimada por CIV» y
**no** el rótulo viejo.

⚠️ **La franja se mide DESPUÉS de `limpiarCampos` y de `calcTEER`, que es como la ve el médico.**
Su id termina en «-aviso», así que `limpiarCampos` la vacía; lo que la repone es `calcTEER` al
mostrarla. **Medirla sobre una página recién cargada es lo que hizo que PANT-6 contara 50
caracteres y concluyera que el defecto no se reproducía.**

⚠️ **(A2) exige el selector EXACTO y no que contenga el id:** `#teer-tipo-aviso-X` también lo
contiene, y la mutación que renombra el selector **sobrevivía**. Nació del barrido.

**Denominadores:** (A0) la franja tiene más de 40 caracteres tras limpiar; (B0) el emisor existe;
(B1) sin datos el bloque igual publica texto; (B3b) el span del Forrester tiene texto; (C0) el
informe trae el párrafo de la CIV.

**Mutaciones que lo matan:** 22 a 25.

---

## TC-654 · las cuatro pantallas y el dato con dos puertas de Wilkins

**Qué fija.** Las cuatro disposiciones por la **regla de la hoja de estilos** y por la
**estructura**, más el **censo de ids de cada sección**, que es lo que prueba que no se perdió ni
se ganó un campo al mover los envoltorios —el modo de falla que esta tanda pagó **tres** veces con
un `</div>` de más—. (B) La sincronía de Wilkins en los dos sentidos, el centinela en los dos
sentidos, la idempotencia y el **control negativo** de que un `change` que no es de confianza
devuelve `false` y no copia nada. (F) **Control:** Marfan no se tocó.

⚠️ **La suite corre Chrome a ~756 px, por debajo del corte de 900**, así que la geometría lado a
lado la miden las sondas en los cuatro anchos; el caso mide la regla y la estructura.

⚠️ **No se recorren bloques de media query por balance de llaves, y es por una medición:**
delimitarlos así se desalinea en cuanto un **comentario** de la hoja menciona «900 px» —esta hoja
tiene varios—, y entonces el bloque que se devuelve es otro: una versión anterior daba false en
cinco condiciones sobre reglas que **sí** existen. Lo que se hace es buscar el **selector** y
preguntar si la media query más cercana hacia atrás declara ese ancho.

⚠️ **Y se acumulan TODAS las coincidencias, no se devuelve la primera:** un mismo selector tiene
la regla de fuera y la de la media query, y la de fuera también queda «después de un @media» si
hay una query anterior en la hoja.

⚠️ **(A2) pregunta por `display:grid` y (A3) por la declaración completa `grid-template-columns:
1fr;`**, porque la palabra «grid» la cumple `grid-template-columns` con `display:block` y «1fr» lo
cumple «1fr 1fr»: las dos mutaciones **sobrevivían**. Nacieron del barrido, igual que **(C1b)**,
que exige que la regla que **ubica** la conclusión de la orejuela exista —estar dentro de la fila
en el DOM no dice en qué celda cae—.

⚠️ **(B4c) es lo que mata la mutación del centinela, y hace falta decir por qué.** El **valor**
del campo no la distingue: `cx_wilk_*` no tiene opción `value="0"`, así que asignarle el centinela
crudo lo deja igual en cadena vacía —medido «,,,» en los dos árboles—. Lo protege el **DOM**, no
la línea, así que por ese camino la mutación es **equivalente**. Lo observable es la
**idempotencia**: sin traducir el centinela, el destino nunca llega a coincidir con el origen y el
sincronizador informa los cuatro campos movidos en **cada** pasada, para siempre —medido 4/4/4
contra 4/0/0—.

**Denominadores:** (A0) la hoja de estilos se pudo leer; (A4) la fila tiene sus dos hijos; (B0)
el sincronizador existe; (B1) los ocho campos existen; (C0), (D0), (E0) y (F0) cada fila existe.

**Mutaciones que lo matan:** 26 a 34.

---

## TC-655 · todos los carteles ⓘ usan la letra de la tarjeta

**Qué fija.** Que `#vinfo-card` declare su tamaño de cuerpo en línea, que **ningún** cartel se
declare el suyo propio, y que el de la orejuela —el único que lo hacía— conserve su contenido
entero con el `line-height` intacto.

**Denominador:** la tarjeta existe y el cartel de la orejuela tiene sus 3.110 caracteres.

**Mutación que lo mata:** 35.
