# Fichas de casos — TC-896 a TC-898 (tanda MEDIR-4b)

Archivo propio porque `docs/mapa/tests-punteros-tandas.md` está en **36,3 KB**, o sea **ya por
encima** del techo de ~35 KB que `CLAUDE.md` fija — la partición de ese archivo sigue pendiente y
esta tanda no la hizo (ver **M4b-f**).

Los tres casos corren sobre un **fixture sintético** de una región 2D isotrópica (`dx = dy = 0,05`),
no sobre el pendrive: `_simpAceptar` rechaza los píxeles no cuadrados, así que la región tiene que
ser isotrópica o no se puede trazar nada. Los que corren contra archivos reales del pendrive son
TC-190, TC-192 y compañía.

---

## TC-896 — bloque A: la ventana una vez, los dos pasos, el «Listo» y rehacer

**Qué fija.** Los tres puntos del bloque A, con **26** condiciones.

- **A1** — la ventana nace declarada en **A4C** y no en `null`; `_simpVentanaLibre()` devuelve
  `'a4c'` para la primera vista; sin contorno todavía se puede cambiar y **vuelve**; con un
  contorno confirmado **`_simpVentanaBloqueada()` pasa a `true`** y el panel lo dice.
- **A2** — **dos** pasos con los rótulos «1 Diástole» y «2 Sístole»; el paso en curso se declara
  con **`aria-current="step"`**; **un** solo `[data-simp-listo]` en todo el documento, que dice
  «Listo»; sin trazado se ve apagado con `aria-disabled` y **sin `disabled`**; con un pendiente se
  prende; apretándolo **confirma la diástole y avanza a sístole**; el paso hecho queda con su
  **✓**; rehacer la diástole **no se lleva la sístole** y deja esa fase como la que se traza; al
  retrazarla la FEVI vuelve **exacta**.
- **A3** — los dos pasos y el «Listo» en **44 px**; **un** solo paso con el acento, medido contra
  el color de acento; la barra de la vista sigue con **siete** botones y no cambió de alto ni de
  orden.

**Denominadores.** Que el árbol traiga `_simpVentanaLibre`, `_simpVentanaBloqueada` y
`medSimpsonRehacer`; y que la herramienta Simpson quede activa con su sesión creada.

⚠️ **EL GESTO ES REAL**: `mousedown` / `mousemove` / `mouseup` sobre el canvas, y el «Listo» se
**aprieta**. Lo que el caso tiene que probar es que el botón está cableado, no que la función
existe.

⚠️ **EL ACENTO SE MIDE CONTRA EL COLOR DE ACENTO Y NO CON «¿tiene relleno?»**: la primera versión
contaba cualquier fondo con alfa > 0,2 y daba **dos de dos**, porque `.btn-ghost` también trae un
fondo propio. La medición decía que los dos estaban prendidos sobre una barra que está bien.

⚠️ **Y `barraDe()` BUSCA POR EL PANEL Y NO SUBIENDO AL PADRE DEL TEXTO GUÍA**: por el padre
devolvía `null` y las dos condiciones de A3 salían rojas sobre una barra que está. Costó una
corrida.

**Contra la línea base cae por 19 condiciones**, ninguna por excepción.

---

## TC-897 — bloques B y C: los dos pares, la calibración, las ventanas iguales y el resultado

**Qué fija.** **30** condiciones, con las **dos vistas abiertas por la puerta real**.

- **A1** — la segunda vista se lleva la ventana **libre**: A4C y A2C.
- **C1** — **dos** pasos en el panel de **cada** vista, la barra de la B **dentro** del panel de la
  B, y **cero** ids duplicados en el visor.
- **A2** — el «Listo» de la **B** confirma **en la B** y **no toca** el par de la A.
- **B1** — los dos pares **conviven**; alimentan el biplano; el cruce es **estable** entre dos
  llamadas y la sesión **no tiene** un campo donde guardarlo; **cero** claves nuevas en el
  navegador.
- **B2** — la calibración puesta en la A deja la B en `null`.
- **C2** — el resultado se ve con **tres** números grandes, con la clasificación de la app, abajo,
  fuera de la columna, **centrado** (desbalance 0), con la tabla **A4C | A2C | Biplano**, columnas
  en mL **y** mL/m², y **sin desbordar**.
- **B3b** — con las dos ventanas **iguales** no hay biplano, el predicado lo dice, el panel lo
  explica **en una línea**, quedan **dos** monoplanares **distinguidas**, y al corregir la ventana
  el biplano vuelve con **el mismo número**.
- **B3a** — cerrar una vista deja **un** panel, descarta el trazado de la cerrada, el biplano
  desaparece y su panel se oculta, la que queda **conserva su monoplanar**, y **cero** ids
  duplicados después.

**Denominadores.** El predicado del bloque B en el árbol; que la vista B **abrió por el selector
real**; que hay superficie corporal; y que **los cuatro contornos entraron** —se publica el motivo
de rechazo de cada uno, por si alguno no entra—.

⚠️ **EL CONTORNO SE SIEMBRA CON `_simpAceptar` Y NO CON EVENTOS DE RATÓN**, que es el patrón de
TC-241, y la razón está medida: **la ventana del arnés mide 756 px de ancho**, o sea por debajo del
corte de dos vistas, así que el canvas de la vista B no tiene ancho útil y las coordenadas mapeadas
por `getBoundingClientRect()` salen degeneradas. La primera versión usaba el ratón y daba
`pendiente:false` en la B — un trazado que no entraba, sobre una vista que **sí** estaba abierta.
**Pero el «Listo» se aprieta de verdad**: lo que hay que probar es que el botón de la B confirma en
la B.

⚠️ **LOS IDS DUPLICADOS SE CUENTAN DENTRO DEL VISOR Y NO EN TODO EL DOCUMENTO**: el censo crudo
devuelve **43** que son **todos** de los SVG de matplotlib embebidos en la app (`figure_1`,
`patch_1`, `DejaVuSans-Bold-50`…), preexistentes y ajenos. Contarlos da 43 siempre y no prueba nada.

⚠️ **SE SUSTITUYE EL ALMACÉN Y SE REPONE EN EL `finally`**: `CeiboCine` y `CeiboImg` los usan otros
casos del lote, y dejarlos sustituidos sería sembrar un defecto en los casos de abajo.

⚠️ **Y EL UUID VA DESPUÉS DE `imgVaciar`**, que lo pone en `null`: al revés, `_vElegirLoop` sale por
su primera guarda y no hay selector que medir. Es la lección 3 de **M4a-h**.

**Contra la línea base cae por 19 condiciones**, ninguna por excepción.

---

## TC-898 — el contrato numérico, las notas en el globo y la integración

**Qué fija.** **19** condiciones.

- **El cálculo no se movió**: los **seis** valores de la línea base, exactos a seis decimales, más
  los **20** discos y las dos clasificaciones.
- **C3** — el globo existe y está registrado con **nueve** párrafos; las **trece** frases del censo
  están **dentro** del globo y **ninguna** quedó en el panel; y **«ASE/EACVI 2015» salió de la
  pantalla** y está en el globo.
- **La integración** sigue escribiendo la FEVI en el campo y el método en «Simpson biplano».

⚠️ **EL CONTRATO SE MIDE SOBRE INSUMOS SEMBRADOS Y NO SOBRE EL GESTO**, y esto se descubrió
midiendo: el mismo triángulo trazado con el ratón da un número **ligeramente** distinto según el
ancho de la ventana, porque las coordenadas de imagen salen de `getBoundingClientRect()` del canvas
y el redondeo cambia. O sea que «los mismos trazados» **no** quiere decir «el mismo gesto»: quiere
decir los mismos `diamCm` y el mismo `Lcm`. Sembrándolos, el contrato es **exacto** y vale igual en
los ocho anchos y en los dos motores. Los diámetros son una **rampa fija**: no representan un
ventrículo, son un **insumo**.

**Los seis valores:**

| | valor |
|---|---|
| VFD monoplanar | **49,362027** mL |
| VFS monoplanar | **20,03344** mL |
| FEVI monoplanar | **59,41528** % |
| VFD biplano | **43,875814** mL |
| VFS biplano | **18,327059** mL |
| FEVI biplano | **58,229699** % |

⚠️ **LA MITAD NUMÉRICA PASA EN LOS DOS ÁRBOLES, A PROPÓSITO**: es una **guarda de regresión**, no
lo que discrimina. El caso discrimina por el globo, y contra la línea base cae por **4**
condiciones —las del globo— mientras las seis igualdades se cumplen a los dos lados. Eso es
exactamente lo que «el cálculo no se movió» significa.

**Denominadores.** Que el motor de volúmenes esté expuesto; que el par quede trazado; y que el
campo FEVI arrancara **vacío**.
