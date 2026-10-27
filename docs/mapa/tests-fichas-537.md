# Ficha de TC-537 — tanda A: textos de Evidencia y de Referencias

Archivo propio porque `docs/mapa/tests-fichas.md` quedó en 34,2 KB en la tanda AJ7 y cualquier
sección nueva lo cruza. Mismo criterio que `tests-fichas-535.md` y `tests-fichas-536.md`.

## Qué vigila

La tanda A cambió **cómo está escrito** lo que se lee en la pantalla de Evidencia y en las fichas
de Referencias, sin cambiar ningún dato clínico. Eso es exactamente lo que se deshace sin que nada
chille: una nota de trabajo que vuelve a la pantalla, una mayúscula que vuelve, una clase que se
pierde al acortar una línea, un dato que se mueve al ⓘ y se pierde en el camino, o una cita del
panel que se filtra al papel firmado.

Las cuatro cosas que la orden pide, y dónde están:

| Pedido | Condiciones |
|---|---|
| (a) ninguna frase de trabajo visible, ningún nombre interno del código | **A1, A2, A3**, y **A4** para las mayúsculas |
| (b) cada recomendación movida conserva su clase y su nivel | **B1, B1b, B1c, B2, B3** |
| (c) ningún dato clínico perdido: está en el ⓘ o en la bibliografía | **C1, C1b, C2, C3, C4, C5, C6** |
| (d) informe (tres estilos), EN SUMA y PDF sin nada del panel | **E1, E2, E3** |

Y además **B4** y **B5**, que son los dos cambios estructurales: la línea de umbrales una sola vez
y el orden de las ocho secciones.

## La distinción que hace que el caso sirva: `VIS()` contra `TODO()`

`textContent` **incluye** el contenido de un `<details>` cerrado. Medir «la frase no está» sobre
el textContent del panel daría verde también si la frase siguiera a la vista, porque el ⓘ es
justamente el destino de casi todo lo que esta tanda movió.

- **`VIS(el)`** clona el nodo y le saca a cada `<details>` cerrado todo lo que no sea su
  `<summary>`: es lo que el médico ve **sin hacer un clic**. Lo usan (a) y los controles.
- **`TODO(el)`** es el textContent completo. Lo usa (c), que prueba que el dato **no** se perdió.

Sin las dos, el caso o no prueba nada o prueba lo contrario.

## Los nueve denominadores

| # | Qué asegura | Por qué, si falta |
|---|---|---|
| **D1** | los 49 campos de los ocho módulos entraron | un `set` que falla deja la escena a medias y el caso mide un panel vacío |
| **D2** | las **ocho** grillas compactas están despiertas a la vez | con una sola sección despierta, cualquier «no está» es trivial |
| **D2b** | las diecisiete preguntas del panel quedaron contestadas | las ramas de recomendación que dependen de una respuesta no se alcanzan, y (B1) acusa a la app de perder clases que nunca se publicaron |
| **D3** | el panel pintó texto, y el globo guarda más que lo visible | si `PT.length === PV.length`, `VIS()` no está plegando nada y (a) mide el total |
| **D3b** | las ocho secciones tienen su texto **dentro de lo visible** | una sección es un `<details>` que **nace cerrado** si ninguna fila marca ✅ ni 🔴: `VIS()` se la lleva entera y (A1) y (A4) dan verde sin haber mirado |
| **D4** | las dos fichas existen y tienen texto | ídem, para (A2) y (C2) |
| **D5** | el panel publica **veinte o más** pares clase-nivel | (b) compara contra un universo, no contra cero |
| **D6** | el informe y el EN SUMA salieron en los **tres** estilos | (E1) sobre un informe vacío no encuentra fugas porque no hay texto |
| **E2** | el PDF se generó de verdad y escribió textos | (E3) sobre cero textos no encuentra fugas |

## Los seis controles negativos, y las dos fronteras

| # | Qué | Qué atrapa |
|---|---|---|
| **N1** | «no se combinan» de Fallot sigue **visible** | el barrido de notas se llevó una leyenda clínica que sí tiene que estar |
| **N2** | «definición propuesta» de la vasoplejia sigue **visible** | ídem, para el rótulo que califica una etiqueta clínica |
| **N3** | «leve como mínimo» del strain del VD no se tocó | pertenece a otro cambio, de otra tanda |
| **N4** | **FRONTERA**: la cápsula de `calcHemo` sigue diciendo «Requiere IC + PCP estimada» | su texto viaja al informe integrado, a la hoja de ETT Avanzado del PDF y al PPT. Si alguien lo «arregla» sin medir esas tres superficies, esto se pone rojo |
| **N5** | y la fila de la Evidencia, en esa **misma** escena, nombra el que falta | prueba que el arreglo está donde tiene que estar y no en la cápsula |
| **N6** | **FRONTERA**: el globo del glosario `hemo-forr`, que la tanda no alcanza, conserva sus mayúsculas | si se hubieran ido, el barrido habría sido un minusculizado **global** y no el cambio acotado que la orden pide |

⚠️ **N5 se mide sobre `TODO` y no sobre `VIS`, y el motivo es del producto:** en esa escena
ninguna fila de la sección hemodinámica marca ✅ ni 🔴 —son «—» y «❓»—, así que la sección nace
colapsada y `VIS` se la lleva entera. Con `VIS` la condición daba falso y parecía que la fila no
decía nada. Lo que se vigila es **qué** dice la fila, no si la sección está abierta.

## Tres cosas que la primera versión de este caso hizo mal

1. **Pedía `Clase 1 · Nivel B-NR` y `Clase 2a · Nivel B-NR` en la misma escena.** Son las ramas
   del sintomático y del asintomático de la guía estadounidense: **excluyentes**. El caso acusaba
   a la app de haber perdido una clase. Hoy la del sintomático se mide en **B1b**, con su propia
   escena y con el control de que al prender los síntomas la 2a se apaga.
2. **Abría el panel con `indicRender` y no con `indicAbrir`.** `_indClinCablear` corre desde
   `indicAbrir`, así que los clics de las preguntas no hacían nada y las ramas que dependen de una
   respuesta quedaban sin alcanzar.
3. **Pedía el localizador de la cirugía mitral en una escena con revascularización cargada.** Los
   localizadores del ⓘ **siguen** a la cirugía cargada, que es lo correcto. Hoy eso se mide en
   **C1b**, con su control de exclusión.

## Cómo cae contra la versión anterior

Medido en un worktree en `7d71583`, con el `test_clinico.mjs` de esta tanda copiado adentro:
**trece condiciones en rojo** — A1, A2, A3, A4, B2, B4, B1c, C1 (once de los veinte datos), C2,
C4, C5 y N5. Cada una apunta a su cambio.

⚠️ **El diagnóstico de B2 mentía en la primera versión:** imprimía sólo la primera mitad de la
cadena, así que contra HEAD la condición daba falso y el diagnóstico decía «presente=true»
—la línea existe, pero ahí dice «ANTES» en mayúscula—. Hoy imprime las dos mitades.

## Las mutaciones

`scripts/_mut_a.py`, quince, en un worktree y con md5-guard sobre el árbol vivo. Corre la línea
base primero y exige `RESULTADO` en la salida antes de puntuar, porque sin eso una suite que no
arranca da «todas sobrevivieron», que es indistinguible de «no hay cobertura».
