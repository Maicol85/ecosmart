<!-- ficha armada sobre 08dd2e9, 2026-10-30 -->
# TC-551 — el esquema de la orejuela: lugar, rótulos, movimiento, controles, ⓘ y recolectores

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**, a 800 bytes del techo. El
mapa del código es `docs/mapa/noc-a-orejuela.md`.

**Qué fija, por grupo.** Las letras son las de las condiciones del caso. Son **52 condiciones**, y
contra HEAD caen **30**; las 22 que pasan en los dos árboles son los denominadores y los controles
negativos. **Ninguna cae por excepción.**

| Grupo | Qué afirma |
|---|---|
| **Z1–Z4** | Lo que tiene que EXISTIR: la fila `#oai-fila` con la grilla y la caja del dibujo como **hermanas y en ese orden**; los tres controles; las ocho funciones del movimiento y del ⓘ; y que **las tres tiendas** tengan recolector. Van primero y como condiciones, no como una guarda que devuelve. |
| **D0** | DENOMINADOR: la caja del esquema se muestra y hay un SVG adentro. Sin esto, «sin solapes» pasa en verde sobre cualquier árbol. |
| **A1–A3** | La **regla** de 900 px que le pone `display:flex` a `#oai-fila`, leída del CSSOM; la **coherencia** entre lo que dice `matchMedia` y lo que hace la geometría a este ancho; y que el dibujo conserve el ancho de la demo. |
| **B0–B2** | Sobre **72 combinaciones** —cuatro morfologías × dos ostium × tres profundidades × tres velocidades—: ningún par de rótulos se pisa y ninguna línea cruza la caja de un rótulo. El denominador exige que recorriera las 72 y que cada dibujo traiga al menos siete rótulos. |
| **C0–C5** | El dibujo trae las dos valvas, el chorro y las partículas; el **radio está en cada círculo y no heredado**; las valvas y el chorro se mueven solos y el contraste también; el chorro lee el grado por **`_emRegurgGrado`** y no por un campo propio; y la frecuencia de la animación es 70 lpm **sin quedar en ningún campo** cuando no está cargada, y la del estudio cuando sí. |
| **D1–D7** | Antes de pausar se ofrece «Pausar» y no «Seguir»; **pausado el cuadro queda quieto** en sus tres partes; «Incluir en el PDF» guarda **una** imagen con la clave de la orejuela; el guardado automático **no la pisa** tras teclear y esperar más que el diferido; «Seguir» retoma; y con la sección **plegada** la animación no corre. |
| **E0–E7** | El ⓘ abre con sus **siete bloques más las fuentes**; **no** lleva el bloque de dispositivos, la frase de los rangos ni el pie de Referencias; marca el contraste como criterio de la aplicación; cita las **cuatro** fuentes con corchetes; **no** afirma un valor normal de la velocidad **y lo declara**; nombra la cardioversión y el cierre y **no** la ablación; y el ⓘ **ámbar sigue trayendo las dos tablas** con sus rangos. |
| **F1–F2** | La leyenda del guardado apagado nombra **la pestaña, la sección y la casilla**; y el estado por omisión **sigue apagado**. |
| **G0–G2** | Con un video huérfano y otro de un estudio **vivo**: el recolector se lleva el primero y **no toca** el segundo; y la puerta única nombra a las tres tiendas. |
| **H1–H3** | El Excel sigue en **440** columnas; ni el informe ni el EN SUMA nombran el esquema, el latido ni la frecuencia de la animación; y **ninguno de los ocho nodos nuevos** entra en los campos del estudio. |

---

## Lo que el caso NO puede medir, y dónde se mide

**El ancho de ventana no se puede cambiar desde el cuerpo de un caso** —eso es
`Emulation.setDeviceMetricsOverride`, del lado del runner— y el arnés corre a ~756 px, donde la
fila **apila**. Por eso (A1) lee la regla del CSSOM y (A2) exige coherencia con `matchMedia` en
vez de afirmar «lado a lado». La geometría **real** en los cuatro anchos, en dos motores y en dos
temas, la mide `scripts/_probe_oaiwk.mjs`.

---

## Los defectos que el propio caso tuvo, y que son trampas de método

**1. `_noEsDelEstudio` es una lista de PREFIJOS, y `oai-` no está en ella.** La primera versión de
(H3) preguntaba `_noEsDelEstudio('oai-esq-estado')` y daba false — pero no importaba, porque
`oai-esq-estado` es un `<span>` y el recolector de `guardarInforme` barre
`input[id], select[id], textarea[id]`: un span no entra nunca. La condición medía algo que no era
el invariante. Hoy mira **lo que el recolector toma**, con su denominador.

**2. Once acentos graves dentro del cuerpo del caso.** El cuerpo es un template literal y un
backtick —aunque esté en un comentario— cierra la cadena: `SyntaxError: missing ) after argument
list`, apuntando a la primera línea del caso. `node --check` sobre el `.mjs` lo caza;
`check_backticks.py` **no**, porque sus cuatro hallazgos son los preexistentes de
`_probe_aj2.mjs`.

**3. `_imgUuidActual` es un `let` del bloque, no una propiedad de `window`.** La sonda hermana
asignaba `window._imgUuidActual = uuid` y medía «el estudio todavía no está guardado» creyendo
que medía el guardado. La puerta real es **`imgPersistir(uuid)`**, y el caso la usa.

**4. El guardado necesita DOS cosas, no una.** Un uuid válido **y** el toggle de imágenes
prendido. (D3) es el denominador que lo dice: sin él, (D4) mide la guarda y no el guardado.

---

## Las dos mutaciones que sobrevivieron al primer barrido, y por qué

Ninguna de las dos era falta de cobertura: las dos estaban **mal escritas**.

- **04** agregaba un `<div>` vacío **después** del cierre de `#oai-fila`, lo que no cambia de
  quién es hermana la caja del dibujo. Reescrita, cierra la fila **justo después de la grilla** y
  mueve las **dos** etiquetas a la vez: dejar una sola desbalancea el marcado y el navegador lo
  repara solo, tapando la mutación.
- **13** no encontraba su ancla, porque la buscaba sin la palabra inicial de la oración.

**14/14 muertas** tras corregirlas, en 1 min 34 s.
