# Fichas de los casos TC-586 a TC-590 — tanda MARFAN-1 (2026-11-01)

Archivo propio porque `tests-fichas.md` está en 34,2 KB, al techo.

Los cinco **caen contra HEAD por CONDICIONES y ninguno por excepción**: 24, 34, 12, 19 y 14
condiciones en rojo. Eso último no es un detalle: un caso que muere por `TypeError` no dice qué
invariante se rompió, que es la lección que TC-546 dejó escrita.

---

## TC-586 · el score sistémico del Box 2

**Denominador (A)**: `MFS_SCORE` existe y tiene trece rasgos; los diecinueve campos existen en el
documento **sin abrir la tarjeta** y los diecinueve son del estudio; la casilla de la figura no.

- **(B)** el máximo es 20 y el corte 7; con todo en su alternativa **mayor** el puntaje da **20
  exactos** y trece rasgos tildados; con las tres alternativas **menores**, 16.
- **(C)** los tres grupos son **excluyentes**, probados por los dos lados: ambos 3 / uno 1 /
  vacío 0, carinatum 2 / excavatum 1, retropié 2 / plano 1.
- **(D)** la **ectopia lentis no suma** y no está en la tabla, pero sí se lee como criterio
  aparte. **Control negativo**: el neumotórax, en el mismo escenario, sí suma 2.
- **(E)** un pectus «que requiere cirugía» de la versión anterior **no se cuenta** y se declara
  como dato sin equivalente.
- **(F)** el **préstamo**: con la tarjeta abierta los campos están adentro y hay **una sola
  instancia** de cada id; al cerrarla vuelven a la sección; al reabrirla el puntaje es el mismo;
  y **abrir otro panel de criterios** no se los lleva —que es el caso que de verdad rompía—.
- **(G)** un estudio **sin ningún campo nuevo** da 0 y no tira, sus criterios aparte se leen
  «sin dato», y leerlo **no le escribe nada**. Control: el formulario sigue vacío.

## TC-587 · las siete reglas del Box 1

⚠️ **Denominador (A0)**: el Z vive en la **tarjeta** y no es un campo guardado, así que la
tarjeta tiene que estar **abierta** o las siete dan «sin dato» y el caso mediría un denominador
vacío.

- **(B)** las siete **cumplen**, una por una, con su escenario mínimo.
- **(C)** **no cumplen** con una condición falsa, y con el puntaje por debajo de 7 lo dice «con
  lo tildado».
- **(D)** quedan **sin dato** con una condición desconocida, diciendo cuál falta.
- **(E)** **el asterisco**: las reglas 2, 4 y 5 **cumplen sin contestarlo**; y con rasgos de otro
  síndrome caen exactamente 1, 3, 6 y 7 mientras 2, 4 y 5 siguen cumpliendo. Las dos direcciones.
- **(F)** **la regla 7** con sus bordes: 20 años exactos alcanza con Z 2,0; a los 19 el umbral
  sube a 3 y Z 2,0 ya no alcanza; con Z 3,0 sí. Y los dos motivos de «sin dato»: falta la edad,
  falta el valor del Z.
- **(G)** la **disección** cumple sin Z ni edad.
- **(H)** **las dos FBN1 son independientes**: sólo la causal hace cumplir la 2 (y deja la 4 sin
  dato) y sólo la asociada a la aorta hace cumplir la 4 (y deja la 2 sin dato).
- **(I)** control negativo: con todo vacío **ninguna** cumple, el texto fijo está, y se pintan
  las siete.

## TC-588 · el papel

**Denominador doble (A)**: el puntaje de la escena es 9, **y al menos una regla CUMPLE** con la
tarjeta cargada. Ese segundo es el escenario **peligroso**: si una regla cumplida pudiera
filtrarse al papel, es ahí donde pasaría.

- **(B)** el informe describe el puntaje con sus nueve puntos, nombra los rasgos, los nombra
  **por lo que son** —«signos de la muñeca», no «los dos signos»— y describe los criterios aparte
  con su estado; el EN SUMA lo resume en **una línea corta** y **no** enumera los rasgos; los
  tres estilos traen la línea.
- **(C)** cero guía, cero folio ni Box, cero clase ni nivel, cero regla cumplida, cero
  diagnóstico, cero umbral de 7 y cero máximo de 20.
- **(D)** el Excel sigue en **441** columnas, ninguna se llama como un campo nuevo y ningún valor
  trae el puntaje.
- **(E)** **round-trip**: los diecinueve están en el blob; el puntaje leído desde el blob es el
  vivo; tras «Nuevo estudio» vuelve a 0 y al reponer desde el blob vuelve a 9 con sus criterios.
- **(F)** control negativo: un estudio **sin rasgos** no nombra el puntaje, y la aortopatía se
  sigue describiendo.

## TC-589 · la pantalla y los globos

⚠️ El suite corre Chrome **por debajo de 900 px**, así que lo lado-a-lado se mide por la **regla
de la hoja de estilos** y por la **estructura**, no por geometría. La geometría la miden las
sondas, en los ocho cruces.

⚠️ **Chrome normaliza el texto de la media query y le agrega paréntesis** —«min-width: 900px»
sale «(min-width: 900px)»—. Es la misma trampa que POP-A midió con `minmax(0, 1fr)`.

- **(B)** la fila y sus dos columnas existen; los campos van en **dos subcolumnas**; la
  ascendente está en la **misma** subcolumna que la sinusal y **después** en el orden del
  documento; la conclusión vive a la derecha y «Integrar al informe» debajo; el corte es una
  media query de **900 px sobre la ventana**.
- **(C)** el cuadro **no** nombra la guía, la tabla, el folio ni la clase, **pero sí conserva el
  umbral en milímetros**, y su globo trae las cuatro cosas.
- **(D)** los 21 globos abren y traen su folio; **abrir los 21 no movió el puntaje, no tildó
  ningún rasgo y no contestó ningún criterio** —el control que importa—; y tres globos dicen lo
  que el artículo **no** define.

## TC-590 · la figura

- **(A)** la figura existe **sin abrir la tarjeta**; dentro, la tarjeta tiene tres columnas; sin
  rasgos no hay marcas.
- **(B)** los **quince** rasgos ponen **su** marca y sólo la suya, y al quitarlos se va.
- **(C)** la figura **deriva su estado del campo**, lo sigue al cambiarlo, coincide con el
  puntaje de la lista, y **no expone ningún estado propio que se pueda escribir**.
- **(D)** los cambios de forma siguen al dato: el pulgar se alarga y **vuelve** al soltarlo.
- **(E)** la casilla de referencia **no es un campo**, prende y apaga el contorno, y la
  alternativa de texto existe.
- **(F)** con el papel trayendo el puntaje como denominador, **ninguna figura, svg ni contorno**
  llega al informe ni al EN SUMA, y no está en `PDF_DIAG_REG`.
