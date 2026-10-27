# Ficha de TC-536 — la puerta de Eco Estrés

Archivo propio porque `tests-fichas-535.md` y `tests-fichas.md` ya están cerca del techo de los
35 KB, y porque este caso no se parece a los de las tandas clínicas: no prueba un corte ni una
frase, prueba una **ausencia** — y una ausencia necesita más denominador que cualquier otra cosa.

- **Dónde está:** `scripts/test_clinico.mjs`, justo después de TC-535.
- **Qué cubre:** las tres compuertas que mantienen el código de Eco Estrés fuera de las
  superficies firmadas, más las tres familias `ee` que **sí** están vivas.
- **Inventario del módulo:** `docs/mapa/eco-estres-inventario.md`.
- **Lo que falta para borrarlo:** `docs/PENDIENTES.md` → **AJ10-C**.

---

## Por qué existe

El módulo de Eco Estrés **no tiene interfaz** en EcoSmart, pero su JS sigue completo y corre en
cada carga. Hasta esta tanda **ningún caso de la suite lo cubría**, que es exactamente cómo un
cierre se deshace sin que nadie se entere. El escenario que el caso prueba de verdad ya ocurrió
una vez: la bandera `ecoestres_incluir_pdf` quedó guardada en cualquier navegador que usara la
build con interfaz y, con `eeHasData()` en `true`, el PDF estampaba una sección «ECO ESTRÉS» con
los 17 segmentos en NORMAL **sobre un estudio donde no se hizo ningún eco estrés** — un informe
firmado afirmando motilidad normal en pico de un test que no existió.

La limpieza de esa bandera **sólo corre al arrancar**. Encenderla a mitad de sesión la deja viva,
y lo único que para el PDF en esa ventana es que el elemento `ee-incluir-pdf` **no exista en el
DOM**. El caso enciende la bandera después de la carga y pone `eeHasData()` en `true` por el único
camino que queda sin interfaz —`eeSetBullState`, que sigue exportado en `window`— **para llegar
hasta el `if` y medirlo**. Sin eso estaría contando una ausencia en un escenario que ni se acerca
a la compuerta.

---

## Las 24 condiciones

### Denominadores (D1–D6) — van primero a propósito

| # | Qué declara | Por qué |
|---|---|---|
| **D1** | jsPDF llegó por CDN (espera hasta 8 s) | Un caso que se saltea solo es cobertura que no existe. Si no llega, **falla** con el motivo escrito. |
| **D2** | el PDF con formulario vacío tiene páginas y ≥ 15 textos | Contar «cero ECO ESTRÉS» sobre un PDF que no se generó da cero y se lee igual que un documento correcto. |
| **D3** | el PDF con un estudio cargado, ídem | |
| **D4** | el PDF del escenario peligroso, ídem | |
| **D5** | el informe narrativo sale no vacío en los tres estilos (> 120 caracteres cada uno) | Buscarle una ausencia a un informe vacío no prueba nada. |
| **D6** | el escenario peligroso **llegó a la compuerta**: bandera en `'1'` y `eeHasData()` en `true` | Es el denominador del B3, y el que convierte al caso en una prueba de la compuerta y no de la casualidad. |

### (a) El DOM no tiene nada de Eco Estrés

| # | Condición |
|---|---|
| **A1** | no existe `#tab-ee` |
| **A2** | no existe `#ee-incluir-pdf` |
| **A3** | los **únicos** `[id^="ee-"]` del documento son los cinco de la calculadora de E/e′ (`ee-e`, `ee-ep`, `ee-result`, `ee-val`, `ee-lbl`) — lista los intrusos por nombre |
| **A4** | cero nodos con una clase de Eco Estrés (quince selectores: `.ee-tab`, `.ee-pdftog`, `.ee-chk`, `.ee-eye-pop-btn`, `.ee-pdf-panel`, `.ee-result-box`, …) |

A3 es la condición **fuerte**: atrapa cualquier elemento que vuelva, no sólo los dos nombrados.

### (b) El PDF, generado de verdad, tres veces

Se envuelve el **constructor** de jsPDF —`save()` es propiedad de la instancia— y se extraen los
textos del stream. Seis marcadores, buscados **en minúsculas y por fragmentos SIN TILDE**, porque
jsPDF emite el acento con su propio encoding y un marcador con tilde puede no matchear nunca, o
sea dar verde sin haber mirado. Tres de los seis (`tipo de estr`, `atropina administrada`,
`reserva de flujo coronario`) aparecen **una sola vez en todo `index.html`**.

| # | Escena |
|---|---|
| **B1** | formulario vacío |
| **B2** | con un estudio cargado |
| **B3** | **el peligroso**: bandera encendida a mitad de sesión + `eeHasData()` en `true` |

### (c) El informe narrativo

| # | Condición |
|---|---|
| **C1/C2/C3** | estilos Conciso, Estándar y Narrativo: sin el rótulo «Eco Estrés:» ni ninguna mención |
| **C4** | y tampoco en el EN SUMA de ninguno de los tres |
| **C5** | `eeInformeLineas()` existe, devuelve un **array** y está **vacía** |

### (d) `eeHasData()`

| # | Condición |
|---|---|
| **F** | `eeHasData()` da **falso** con el árbol limpio |

### (e) Controles negativos — lo vivo sigue vivo

**No son decoración.** El prefijo `ee` no identifica a Eco Estrés: un caso que sólo contara
ausencias pasaría en verde con las tres familias vivas borradas.

| # | Qué prueba |
|---|---|
| **E1** | la calculadora de E/e′ existe y **calcula**: E 80 / e′ 5 → `ee-result` = `16.0` |
| **E2** | el modo básico/avanzado está vivo: `eeGetMode`, `eeGetModules` y `eeModOn` responden y `#ecoAdvSelect` existe |
| **E3** | y el desplegable **se puebla**, con **menos** secciones en Básico que en Avanzado |
| **E4** | el QR del informe se genera (`data:image/png…`) y `eeStudyUrl()` da una URL |
| **E5** | el score de **Duke** calcula con datos de ergometría: 9 min, ST 1 mm, angina 0 → `4.0` riesgo intermedio |

---

## ⚠️ Dos trampas que este caso pagó, y están dentro del código

1. **El nombre del paciente de prueba no puede contener el marcador que se cuenta.** La primera
   versión llamaba al paciente «Prueba Eco Estres» y el PDF **imprime el nombre**: B2 y B3
   salieron rojos señalando una fuga del módulo **que no existía**. El fixture envenenaba lo que
   el caso mide. Por eso el diagnóstico de cada marcador imprime **55 caracteres de contexto a
   cada lado** — un marcador sin contexto no se distingue de un falso hallazgo, y éste habría
   costado un reporte entero.
2. **El denominador del PDF vacío es distinto del cargado.** Un PDF de formulario vacío tiene
   legítimamente **20 textos**; el umbral original era `> 20` y daba rojo por el denominador, no
   por el hallazgo. Quedó en `>= 15`.

## Higiene de estado

El caso guarda y **repone siempre** (en un `finally`) la bandera `ecoestres_incluir_pdf`, el
estilo de informe `ett_estilo_informe` y `ett_view_mode`, y resetea las tres fases de `eeBull`.
Sin eso le dejaría la bandera encendida al caso siguiente, que es exactamente el acoplamiento por
orden que esta suite ya pagó una vez con TC-507.
