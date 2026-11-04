# Inventario · el dibujo del pulmón del posoperatorio y su reúso en la ecografía pulmonar

**Tanda PANT-8, commit 7c (2026-11-04). SOLO LECTURA: este documento no cambió una línea de
`index.html`.** Todo lo que sigue está medido en la aplicación. **No se diseña nada acá.**

---

## 1 · Cómo está armado el dibujo

| pieza | qué es |
|---|---|
| elemento | `<svg id="pop-esq-svg" class="pop-esq-svg" viewBox="0 0 600 496" role="img">` |
| tecnología | **SVG**, no canvas. El contenido lo construye `popEsqPintar()` con `createElementNS`: **ni un nodo sale de `innerHTML`** |
| tamaño renderizado | **581 × 483 px** a 1440 px y **328 × 274** a 390 px (medido en la tanda POP-B, en los dieciséis cruces de Chrome y WebKit) |
| latido | `popEsqFrame()` con `requestAnimationFrame`; el período lo fija `POP_ESQ_PER_MS` y se apaga con `prefers-reduced-motion` |
| texto al pie | `<div id="pop-esq-txt">` con `aria-live="polite"` — la alternativa accesible |
| al PDF | entra por el botón `#pop-esq-pdf-btn`, con el campo guardado `pop_esq_pdf` (tanda POP-C) |

## 2 · De qué datos del pulmón se alimenta HOY

`popPatron()` publica tres claves que el dibujo consume, y **sólo tres**:

| clave | campo | qué dibuja |
|---|---|---|
| `pleD` | `pop_pleura_der` | **nivel de líquido** en el hemitórax derecho, recortado con la MISMA ruta que dibuja el pulmón (POP-B-5c) |
| `pleI` | `pop_pleura_izq` | ídem, izquierdo |
| `lineasB` | `pop_pulmon_lineasb` | los cuatro pares de marcas de líneas B, cableados desde la tanda G2 |

**La altura del nivel de líquido gradúa:** leve, moderado y severo dibujan tres alturas distintas,
y «ausente» o sin cargar no dibujan nada. Eso es lo que POP-B cambió: hasta entonces el derrame
era **una elipse de 44 × 22 px, la misma para los tres grados**.

## 3 · Lo que el dibujo NO muestra

| dato | campo | por qué no |
|---|---|---|
| consolidación | `pop_pulmon_consol` | no está cableado al dibujo; el campo existe y llega al papel |
| neumotórax | `pop_pulmon_neumo` | ídem |
| característica del derrame | `pop_pleura_caract` (libre · loculado · hemotórax) | ídem |

Los tres se **dicen** en el texto del pie y en el papel, y **no se ven** en el dibujo.

## 4 · Qué haría falta para reusarlo en la ecografía pulmonar del básico, sin duplicar código

El dibujo es **un corazón con sus caños más dos hemitórax**: su `viewBox` de 600 × 496 incluye las
cavidades, la vasoplejia, los catéteres, los drenajes, las válvulas operadas y los dos pulmones.
Reusarlo entero en la pestaña de ecografía pulmonar pondría ahí un corazón posoperatorio que ese
estudio no tiene.

**Lo que hay que resolver, en orden:**

1. **Separar la parte pulmonar.** Hoy `popEsqPintar()` dibuja todo en una sola pasada sobre el
   mismo `viewBox`. Reusar sólo los pulmones exige extraer su trazado y su recorte a una función
   propia que reciba el estado y devuelva los nodos, con **un dueño único** — el patrón que
   `_pdfTile` y `esqIncluirEnPDF` ya usan para no tener dos copias del mismo dibujo.
2. **Un contrato de datos propio.** Hoy la entrada es `popPatron()`, que calcula el índice
   cardíaco, la RVS, la PAM y el patrón de bajo gasto: nada de eso existe en la ecografía
   pulmonar del básico. El dibujo pulmonar tendría que recibir **sólo** su estado —derrame por
   lado, líneas B, y lo que se decida agregar— y no un objeto del posoperatorio.
3. **Decidir el `viewBox`.** El de 600 × 496 está repartido entre el corazón y los dos
   hemitórax; uno sólo de pulmones necesita su propia caja, y con ella su propio tamaño mínimo
   para que la tipografía no baje de 12 px —que es la regla de la casa y lo que PANT-6 y PANT-7
   pagaron con el dibujo del VD—.

## 5 · Qué datos de la ecografía pulmonar alcanzan hoy a alimentarlo, y cuáles faltan

| lo que el dibujo necesita | ¿lo tiene el básico? | cómo |
|---|---|---|
| derrame por lado, graduado | **NO del todo** | tiene `pua_derrame` (sí/no), **una** severidad `pul_derrame_tam` y un lado `pua_derrame_lado`: no puede decir «leve a la derecha y severo a la izquierda». Ver `docs/INVENTARIO_PLEURA_Y_PULMON.md` |
| líneas B | **SÍ, y con más detalle** | `pua_lineasb` + `pua_lineasb_cant` (focal · múltiples · coalescentes) + **seis casillas de zona** (anterior, lateral y basal, por lado) |
| consolidación | **SÍ, y con más detalle** | `pua_consol` + `pua_consol_bronco` + nota; el dibujo no la muestra en ninguna de las dos pantallas |
| neumotórax | **SÍ, por deducción** | `pua_punto` (punto pulmón) y `pua_desliz` abolido; el posoperatorio lo consigna en un campo propio |
| deslizamiento pleural | **SÍ** | `pua_desliz` + `pua_desliz_lado`; el posoperatorio **no lo tiene** |
| líneas A | **SÍ** | `pua_lineasa`; el posoperatorio **no las tiene** |
| medida del derrame | **SÍ** | `pua_balik`, distancia máxima entre pleuras en mm; el posoperatorio **no la tiene** |

**El resumen, en una línea:** el básico tiene **más** datos pulmonares que el posoperatorio en
todo salvo en una cosa — **la severidad por lado**, que es justamente la que el dibujo usa para
graduar el nivel de líquido.

---

## Decisiones que le tocan al médico

1. **¿El dibujo del pulmón se reusa, o la ecografía pulmonar tiene el suyo?** Reusarlo exige
   partir el dibujo del posoperatorio en dos y darle un contrato de datos propio; uno nuevo
   duplica trazado.
2. **¿El dibujo debería mostrar la consolidación y el neumotórax?** Hoy no los muestra en ninguna
   de las dos pantallas, aunque los dos campos existen en el posoperatorio y con más detalle en el
   básico.
3. **¿Las seis zonas de líneas B del básico deberían verse en el dibujo?** Es el dato más rico que
   el básico tiene y el que un dibujo por zonas aprovecharía; el posoperatorio no lo tiene.
4. **Primero hay que resolver la severidad por lado** (decisión 1 del inventario de pleura): sin
   ella el dibujo no puede graduar el nivel de líquido con los datos del básico.
