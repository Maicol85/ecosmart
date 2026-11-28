# Guía de prueba — Lote post-PR13 (2026-11-28)

Un paso por grupo. Lo que hay que mirar y lo que tiene que pasar. Nada de esto necesita abrir la
consola: todo se ve en pantalla.

---

## A · El aviso quemado en la captura del mapa

1. Visor → **Medir** → herramienta **Deformación** (strain del VI) → trazá las dos fases de una
   vista y confirmá, hasta que abajo aparezca el mapa **«Strain por territorios»**.
2. Apretá **📸 Capturar** (o «Guardar en imágenes»).
3. Abrí la imagen que quedó guardada y mirá **las dos líneas de abajo**.

**Qué tiene que pasar:** las dos líneas se leen **enteras**, sin cortarse a los costados ni
quedar mordidas arriba o abajo. Si no entran en una línea, se parten en dos o tres renglones
centrados, con aire a los dos lados. **Ninguna palabra puede faltar** y no tiene que haber
puntos suspensivos.

> Antes: a 640 px la primera línea medía 850 px contra un canvas de 640, o sea **105 px cortados
> a cada lado**. El PDF usa la misma imagen, así que sale igual.

---

## B · Copiar el informe a Pages en letra 11

1. Informe → **Cuadros** → el botón de **copiar el informe** (el de la derecha).
2. Abrí **Pages** con un documento en blanco y pegá.
3. Seleccioná todo el texto pegado y mirá el **tamaño de letra** en el panel de la derecha.

**Qué tiene que pasar:** **11**, en todo el texto — títulos, párrafos y viñetas. Las negritas, los
subrayados y las viñetas tienen que seguir igual que antes.

> Esto estaba en 14. La causa: macOS convierte los puntos a píxeles a 96 ppp y después lee esos
> píxeles **como puntos**, así que «11 puntos» llegaba como 14,5. Ahora se declara en píxeles.
>
> ⚠️ **Lo que falta probar, y es de Maicol: pegarlo también en WORD.** Word tiene su propio
> importador y respeta los puntos; si ahí sale chico, avisá y es cambiar **una línea**.

---

## C · El NT-proBNP de cardio-oncología, y el ⓘ del Simpson

1. **Cardio-oncología** → HFA-ICOS → columna **Humoral** → la casilla
   **«BNP / NT-proBNP basal elevado»**.

**Qué tiene que pasar:** debajo del rótulo dice **«por encima del límite superior del laboratorio
local»** — sin el «375–600» y sin el cartelito «CRITERIO DE ECOSMART» — y al lado hay un **ⓘ**.
Tocá el ⓘ: abre una tarjeta que explica qué es el marcador y cita **Lyon 2022**, y **la casilla
NO se tilda** al abrirlo.

2. Visor → **Medir** → **Simpson** → el **ⓘ** de «Simpson — notas de método».

**Qué tiene que pasar:** ya **no** están las frases «en diástole y en sístole **por separado**»,
«qué lado queda más alto **depende de la geometría**» ni «**los valores normales** con los que se
clasifica salen de biplano». Lo demás sigue igual.

---

## D · Corregir el trazado sin soltar

1. Visor → **Medir** → cualquier herramienta de contorno (**Área**, **Simpson**, **Deformación**,
   **LARS** o **Strain VD**).
2. Empezá a trazar y, **sin soltar**, volvé con el dedo (o el mouse) **sobre la línea que ya
   dibujaste**.

**Qué tiene que pasar:** la línea **se va borrando** hasta donde retrocediste. Si volvés a
avanzar, sigue dibujando desde ahí. **Soltar sigue cerrando y midiendo igual que siempre.**

**Probá también:** un trazo corto de dos o tres puntos no tiene que borrarse, y acercarse al otro
lado de la pared (sin volver sobre tu propia línea) no tiene que borrar nada.

---

## E · Volver atrás si elegiste mal la vista

1. Visor → **Medir** → **Deformación** → elegí un cineloop y declará una ventana (A4C, A2C o A3C).
2. Buscá el botón **«‹ Cambiar vista»** y tocalo.

**Qué tiene que pasar:** vuelve a la pantalla donde se elige la ventana, con un botón
**«Seguir en A4C»** (o la que estabas usando) para volver sin cambiar nada. **Lo que ya
confirmaste en otras ventanas no se pierde.**

3. Ahora trazá un contorno y, **sin confirmarlo**, tocá «‹ Cambiar vista».

**Qué tiene que pasar:** **pregunta** si querés descartar ese trazado. Si decís que no, todo
queda como estaba.

---

## F · LARS y strain del VD

1. Visor → **Medir** → **Strain VD**.

**Qué tiene que pasar:** el texto pide trazar **del anillo tricuspídeo lateral hasta el ápex del
VD** — ya **no** dice «hasta el anillo septal», que se contradecía con «no incluyas el septo».
El nombre de la guía, su tabla y su folio **ya no están en la pantalla**: están en el **ⓘ** nuevo
del panel, con autor y año.

2. **LARS**: trazá los tres contornos **en tres cuadros distintos** del ciclo.

**Qué tiene que pasar:**
- Cada contorno **se ve sólo en su cuadro**. Movés el cuadro y los otros dos no aparecen encima.
- En el paso 3 el panel explica que la **pre-contracción** es el punto donde **empieza la onda P**,
  y avisa (sin bloquear) que **sin ECG a la vista o en fibrilación auricular** ese punto no se
  puede identificar y sólo el **reservorio** es confiable.
- El renglón del reservorio dice **«normal 18 % o más»**, sin nombrar la guía; el **ⓘ** del panel
  cita autor, año y folio.
- Si los tres cuadros quedaron en el orden equivocado, el conducto y la contracción salen con **un
  solo signo menos** (antes salía «−−39,0»), y el aviso de orden sigue apareciendo.

> ⚠️ **El corte de 18 % NO se cambió, y es a propósito.** Lo pedido era revisarlo contra el 23 %:
> leída la guía de strain de la ASE (Thomas 2025, hoja 23, folio 1007), ahí dice que **el comité
> respalda el < 18 %**; el 23 % es de **un estudio de 139 pacientes** que esa guía cita, no su
> recomendación. El valor **normal** del reservorio sí se precisó: **39 %** (hoja 11, folio 995).
>
> **Queda una decisión tuya:** esa misma hoja publica normales para el **conducto (23 %)** y la
> **contracción (17 %)**, que hoy la app muestra como «sin corte publicado». Agregarlos es
> contenido clínico y lo decidís vos.

---

## G · La flecha de la tabla de cálculos del SGL

1. **Contractilidad** → pestaña del **SGL** → cargá los diecisiete segmentos con números.
2. En la tabla **«Cálculos de strain»**, en la fila del promedio de 17 segmentos, tocá el ícono de
   **calculadora** y después la **flecha**.

**Qué tiene que pasar:** la flecha escribe ese promedio en el campo **«SGL global (%)»**. Los
íconos se ven **chicos** (14 px) pero **se tocan cómodo** (44 px alrededor). Antes de calcular, la
flecha está apagada y al tocarla **dice por qué**.

> **Esto ya estaba hecho y no se cambió nada**: se verificó que coincide con lo acordado.

---

## H · El visor a pantalla completa

1. Visor → arriba a la derecha de la imagen hay tres botones apilados: **tamaño**, **columna** y,
   **debajo de ése**, el de **pantalla completa**. Tocalo.

**Qué tiene que pasar:**
- La imagen pasa a **pantalla completa de verdad** (sin la barra del navegador).
- Los controles **flotan sobre la imagen** y **se esconden solos a los ~3 segundos** sin mover
  nada. Movés el mouse, tocás la pantalla o apretás una tecla y **vuelven**. El botón para salir
  **nunca se esconde**.
- **Esc** sale de pantalla completa.
- **Clic o toque sobre la imagen**: pausa y reanuda, con un **▶ / ⏸** que se desvanece en menos de
  un segundo. Con la **columna de medidas a la vista** y fuera de pantalla completa, el clic
  **no** cambia nada de lo que hacía antes.
- **Barra espaciadora**: pausa y reanuda.
- **Mientras estás midiendo**, el clic **sigue midiendo** y **no pausa**.

**Probá también:** con un botón enfocado, la barra espaciadora tiene que **apretar ese botón** y
no pausar el video.

---

## Si algo no cumple

Decime **cuál paso** y **qué viste**. Todo lo de este lote está en commits locales, **sin push**:
volver atrás es un comando.
