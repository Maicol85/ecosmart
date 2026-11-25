# Fichas de los casos TC-1068 a TC-1071 (tanda PR13, 2026-11-25)

Archivo propio, y la regla se aplicó **antes** de escribir: medido con `wc -c`,
`docs/mapa/tests-punteros-tandas.md` está en **36,4 KB** y `docs/mapa/tests-fichas.md` en
**34,2 KB**, los dos **en el techo o por encima** de los ~35 KB que `CLAUDE.md` fija. Agregarle un
puntero a cualquiera de los dos es exactamente lo que esa regla viene a evitar.

Los cuatro corren con el Chrome del sistema por CDP. **Ninguno depende del pendrive.** Los cuatro
miden **sólo** el mapa de strain por territorios del visor y su leyenda: ninguno toca la pestaña
SGL, la paleta, el informe ni el papel.

**Los cuatro caen contra `e4ee124`** —el cierre de PR12— con el **mismo** archivo de casos y sólo
el `index.html` distinto, **por sus condiciones y ninguno por excepción**: cada acceso a lo que la
tanda estrena va por un resolvedor con guarda que devuelve una forma vacía, que es la lección de
**TC-827**.

---

## TC-1068 — la leyenda: nueve rótulos en los bordes y el texto entero

**Qué fija.** Que la escala de la leyenda vaya de **−20 a +20** con **nueve** rótulos puestos
**sobre las líneas de unión** entre cuadritos y no en su centro; que los dos extremos digan
**`≤ −20`** y **`≥ +20`** **y que la medición lo justifique**; que el cuadrado gris de SIN DATO
quede en su **propia fila**; y que el texto explicativo salga **entero**, centrado y **sin
cortarse**, en hasta dos renglones.

**Cómo mide.** Siembra las seis paredes, llama al dibujante sobre un canvas propio **envolviendo
`fillText` y `measureText`** para quedarse con cada texto dibujado y su rectángulo real, y después:

- **los nueve rótulos salen de `STRAIN_MARCAS`** y no escritos a mano: los compara contra lo que
  `_strBordes()` deriva de la paleta.
- **la justificación de los extremos**: llama a `strainTramoDe` con **−20,01, −25 y −30,1** y exige
  **tramo 1** en los tres, y con **+20, +20,01 y +30,1** exige **tramo 8**. Sin esto, el `≤` y el
  `≥` serían una afirmación sin respaldo.
- **el borde y no el centro**: compara la `x` de cada rótulo con la línea de unión que le toca y
  con el centro del cuadrito, y exige que esté en la primera.
- **no se pisan**: recorre los rectángulos de los nueve y exige **cero** solapes.
- **el texto entero**: exige que la unión de los renglones dibujados sea el texto completo, que
  sean **a lo sumo dos**, que estén **centrados** y que **ningún** rectángulo se salga del canvas,
  **en los dos tamaños** —300 de pantalla y 640 de captura—.
- **la captura sigue entrando**: con `conTitulo` en verdadero, exige que las **dos líneas del
  descargo** que `_strBullsCanvas` dibuja debajo de la base devuelta quepan en el canvas.
- **y declara el límite de la medición**: el canvas dibuja en sus propias unidades y el CSS lo
  escala, así que el dibujo **no depende del ancho de la ventana** — los tres anchos dan lo mismo,
  y la condición lo afirma en vez de dejarlo implícito.

**Contra `e4ee124`** cae porque ahí los rótulos son **ocho**, el último es **+15**, no hay ningún
`≤` ni `≥`, y el texto explicativo se dibuja en **una** línea que se sale por los dos lados.

---

## TC-1069 — seis sectores, uno por pared

**Qué fija.** Que el diagrama sean **SEIS** sectores del disco al borde, **sin anillos**, cada uno
de **un solo** color, el que la paleta le da a **su** valor; que el nombre y el número entren
**dentro del polígono**; que el número lleve **coma**; que una pared sin dato salga **gris** con
«Sin dato»; que el disco central siga **gris con el 17**; y que el pie diga las vistas, las paredes
**que de verdad tienen valor** y que el ápex no se mide.

**Cómo mide.** Toma la geometría **que el dibujante publica** —`cx`, `cy`, `r`, `rIn`— en vez de
copiarse sus constantes, y muestrea el color del canvas **a dos radios distintos de cada sector**,
los dos elegidos para **cruzar las circunferencias donde estaban los anillos**:

- **un solo color**: exige que las dos muestras de un sector sean **el mismo** color. Y
  **descarta** las muestras que cayeran dentro de alguno de los rectángulos de texto que registró,
  porque un pixel sobre un glifo no es el relleno del sector — ese fue el falso positivo que la
  primera versión de la sonda produjo.
- **el color es el de su valor**: lo compara con `_strColorPct(valor)`.
- **cruzado contra la pestaña SGL**: siembra el **mismo** valor en un segmento de la pestaña y
  exige que el mapa del visor lo pinte del **mismo** color. Es la condición que prueba que las dos
  superficies comparten la referencia.
- **el texto entra**: por los **cuatro vértices** del rectángulo de cada nombre y de cada número,
  con `_strEnSector`.
- **los sesenta grados y la Anterior arriba**, leídos de `_STR_SECTORES`.
- **y los anillos se retiraron**: exige que `_STR_ANILLOS`, `_STR_SEG_FUENTE` y `_STR_SEG_ROTULO`
  **ya no existan**. Esa condición es la que se pone roja el día que alguien los reponga.

**Contra `e4ee124`** cae porque ahí hay **diecisiete** entradas de anillo, cada pared se pinta en
**tres** piezas, el número sale sólo en la del medio y las constantes retiradas **siguen
existiendo**.

---

## TC-1070 — el color del texto, con contraste medido

**Qué fija.** Que el texto del mapa se escriba con el color que **la pestaña SGL ya declara** por
tramo donde ese color **alcanza 4,5:1**, que se **endurezca sólo donde no alcanza**, y que la
pestaña **siga publicando el suyo** —o sea que esta tanda no la tocó—.

**Cómo mide.** Recorre los **nueve** tramos; para cada uno saca el relleno con `_strPalColor` y el
texto con `_strTxtSobre`, y calcula el contraste con `_medLumDe` y `_medContraste`, los dos dueños
que esta casa ya usa. Después exige, en este orden:

- los **nueve** llegan a **4,5:1 o más**;
- **ocho de los nueve** son **exactamente** el color que `STRAIN_PAL[i].txt` declara;
- el que falta es el que **no llegaba**, y la condición lo mide: con la regla de la pestaña sola
  ese tramo queda **por debajo** de 4,5:1 — así que el endurecimiento no es un gusto, es lo único
  que cierra el hueco;
- **`STRAIN_PAL[i].txt` sigue intacto** en los nueve, que es el control de que la pestaña no se
  movió;
- y el mapa **ya no** escribe con el oscuro fijo sobre el violeta intenso.

**Contra `e4ee124`** cae por su **denominador**: la regla de color de texto del mapa **no existe**
en ese árbol.

---

## TC-1071 — la fórmula, por el camino real del código

**Qué fija.** Que el strain por pared sea **(Ls − Ld) / Ld**, verificado **por el camino real** y
**sin reimplementar la cuenta en la prueba**; que sea un **cociente**, o sea que no dependa de la
calibración en mm por píxel; y que el SGL del pie sea el **promedio de los seis**.

**Cómo mide.** Siembra los dos trazados por el mismo camino por el que el visor los guarda y lee el
resultado con `_strResultadoVivo()`, que es el dueño. Exige:

- **100 → 80 da −20,0 %**, **100 → 120 da +20,0 %** y **100 → 100 da 0**;
- **es un cociente**: multiplica **los dos** largos por un factor y exige que el porcentaje **no
  cambie** — con una diferencia en vez de un cociente, ese escalado movería el número. Es la
  condición que prueba que la calibración no entra;
- los **seis valores conocidos** salen exactos: **−16,3 · −30,1 · −10,1 · −11,4 · −27,3 · −23,1**;
- su suma es **−118,3** y el SGL es su **promedio**;
- y el SGL **publicado** en el pie dice **−19,7** **con coma**.

⚠️ **ES UNA PRUEBA DE VERIFICACIÓN Y NO DE CAMBIO: la fórmula no se tocó.** Si alguna vez el
resultado real difiriera de `(Ls − Ld) / Ld`, la orden de esta tanda manda **reportarlo y no
cambiarlo**. Lo que el caso fija es que el camino real da esos números.

**Contra `e4ee124`** cae por su **denominador** declarado y por el formato del número del pie, que
en ese árbol sale del dibujante viejo.

---

## TC-201 — adaptado, y con tres condiciones RETIRADAS

Ese caso es de PR7 y medía el mapa del visor. Quedó **adaptado** y con su título nuevo: «Mapa de
strain del visor: SEIS sectores…».

**Qué cambió.** Su lector pasa a muestrear **seis paredes** usando la geometría que el dibujante
publica, en vez de los diecisiete anillos; acepta el número **con coma**; y su condición de pintado
y la de «un solo valor» pasan a contar **por pared**.

**Las TRES condiciones retiradas, con su motivo escrito donde vivían.** Afirmaban que los segmentos
**14 y 16** —los **dos únicos** que dos paredes compartían— salían **grises**, que seguían grises
con dos vistas y que **promediaban** sus dos paredes. Eso **desapareció con los anillos**: con **un
sector por pared** no hay ningún segmento que dos paredes puedan reclamar ni nada que promediar.
**No se aflojó ninguna**: lo que esas tres protegían —que una pared no herede el valor de otra— lo
cubren hoy la condición de que cada pared lleve el color del **tramo de SU valor** y la de que cada
sector sea de **UN solo** color, las dos en este caso y en TC-1069.

**Y se le agregó una condición de denominador con guarda**, porque contra `e4ee124`
`_STR_SECTORES` **no existe** y un acceso pelado tiraba `ReferenceError`, que se lleva el caso
entero y deja las de abajo sin evaluar. Hoy cae **por condición**.
