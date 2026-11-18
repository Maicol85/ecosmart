# Los CUADROS del PDF y la tarjeta «Cuadros» — tanda CUADROS (2026-11-18)

Mapa de los **doce cuadros de datos** del PDF, de la **grilla de tres**, de las **líneas de
válvula** y del **botón «Cuadros»** del Informe. Armado sobre el commit de cierre de la tanda; sin
números de línea a propósito —la línea cambia en cada edición, el nombre de la función no—.

Lo que esta tanda **reemplaza**: hasta acá el PDF armaba sus cuadros con **cinco literales** dentro
de `generarPDFReal`, cada uno con su llamada a `drawTablaCompacta`, y la pantalla no tenía forma de
verlos: la única manera de saber qué iba a salir era generar el PDF.

---

## 1. El dueño único

| función | qué hace |
|---|---|
| `cuadCtx()` | **los derivados**. Se MUDÓ entero y textual desde el bloque de pre-cálculos de `generarPDFReal`: la lectura con banda del VI, la masa, la geometría, la FEVI, el SGL, los dos volúmenes indexados, el índice de la AI, los cocientes del Doppler mitral, el AVA, el gasto cardíaco con su frecuencia y los tres grados valvulares. `generarPDFReal` lo **destructura** al arrancar. |
| `cuadDefs()` | **los doce cuadros**, en el orden de arranque y sin filtrar: `{id, titulo, items, items2, lineas, nota}`. |
| `cuadConDatos(d)` | ¿este cuadro tiene algo que dibujar? Alguna fila con valor **o** alguna línea de válvula. La nota del asterisco NO cuenta. |
| `cuadVisibles()` | los que de verdad se dibujan: el orden vigente, sin los quitados y sin los que no tienen datos. **Único punto que lo decide**, y lo consultan el papel y la tarjeta. |
| `cuadFilas(n)` | el reparto de la grilla. Devuelve los TAMAÑOS de cada fila. |
| `CUAD_IDS` | el orden de FÁBRICA y los doce identificadores. El id persiste en el estado, así que **no se deriva del título**: dos títulos son condicionales. |

⚠️ **NO HAY SEGUNDA DERIVACIÓN DE NINGÚN NÚMERO.** Con una copia de los derivados, la tarjeta y el
papel firmado podrían publicar dos valores del mismo cociente.

⚠️ **`cuadCtx` y `cuadDefs` NO TOCAN jsPDF.** Sólo leen el formulario y los dueños de cálculo de la
app, así que la tarjeta se pinta sin la biblioteca cargada y sin generar un PDF.

## 2. Los doce cuadros, y qué cambió en cada uno

| # | id | título | qué trae |
|---|---|---|---|
| 1 | `ao` | Aorta torácica | los CINCO segmentos de `AO_SEGS` con **asterisco** en los dilatados, el **Ø TSVI** y, al pie, «* Aorta dilatada» sólo si corresponde |
| 2 | `ai` | Aurícula izquierda | diámetro AP, área, volumen, volumen indexado |
| 3 | `advci` | Aurícula derecha / VCI | área AD, diámetro y colapso de la VCI, PmAD, VEXUS |
| 4 | `viest` | VI — Estructura | SIV, DDVI, DSVI, PP y los **dos volúmenes indexados** |
| 5 | `visis` | VI — Función sistólica | FEVI, FA, SGL, volumen latido, masa indexada, RWT, geometría |
| 6 | `vd` | Ventrículo derecho | TAP, TAPSE, S′, los tres diámetros, FAC, **FEVD y VD/VI** |
| 7 | `vm` | VM — Transmitral / Vena pulmonar | **dos columnas**: Doppler transmitral · vena pulmonar |
| 8 | `dti` | DTI mitral | e′ septal, e′ lateral, e′ promedio, E/e′ |
| 9 | `trip` | Tricúspide / Pulmonar | **dos columnas**: tricúspide · válvula pulmonar y las dos presiones de su insuficiencia |
| 10 | `va` | VA — Gradientes y continuidad | **dos columnas**: los tres gradientes · los dos VTI y el **DVI** |
| 11 | `gc` | Gasto cardíaco | volumen sistólico, VLI, GC (con su FC) e IC — **sin AVA ni AVA indexado** |
| 12 | `otros` | Otros | **UNA** línea: pericardio · masas · pulmón · variantes anatómicas |

⚠️ **DOS CUADROS PUBLICAN MÁS FILAS QUE LAS QUE LA ORDEN ENUMERA, Y ES DELIBERADO.** La orden
lista tres segmentos aórticos y siete filas de VD; acá salen **cinco** y **nueve**. El cayado, la
aorta descendente, la FEVD y la relación VD/VI son **números MEDIDOS** que no se publican en ningún
otro cuadro: retirarlos los borraría del papel, y en esta casa ningún número medido desaparece.
Queda declarado en `docs/PENDIENTES.md` → **CUAD-a**.

⚠️ **EL Ø TSVI VIVE SÓLO EN EL CUADRO DE LA AORTA.** Era además la tercera impresión del mismo
diámetro: esa fila, la fila «Ø TSVI» del cuadro de continuidad y el campo oculto del Doppler
aórtico son mirrors del mismo dato (`_TSVI_DIAM_CAMPOS`). El cuadro de continuidad publica ahora
el **DVI** en su lugar, que sale de `_eaCritDvi` —el dueño que ya lo calcula con sus dos bandas de
plausibilidad puestas—.

⚠️ **LOS DOS TÍTULOS DE DOS COLUMNAS SON FIJOS Y YA NO CONDICIONALES.** Lo fija la orden, que
enumera los doce cuadros por su nombre, y el nombre es además lo que el médico arrastra en la
tarjeta: un título que cambia con los datos sería un cuadro que cambia de nombre entre dos
estudios. Sin datos en la sub-columna, sus ítems salen nulos y el cuadro se dibuja a una sola
columna.

## 3. Lo que SALIÓ del papel

- **La fila de cuadros de válvulas** (Válvula Mitral · Válvula Aórtica · Válvula Tricúspide ·
  Otros), en los **ocho** estilos — también en los que caía en una segunda hoja. Su contenido pasa
  a las **líneas de válvula**.
- **TODOS los valores de referencia.** El mecanismo de `ref` se conserva en `drawTablaCompacta` y
  lo usa **una sola fila**: el gasto cardíaco, para decir con qué frecuencia cardíaca se calculó.
  Eso no es un valor de referencia, es el insumo. **Ninguna constante de corte se tocó**: siguen
  gobernando la pantalla, el informe y la Evidencia.
- **El resumen de la aorta del cuadro «Otros»**, que era la segunda escritura del mismo hallazgo en
  el mismo papel.
- **El AVA y el AVA indexado del cuadro del gasto**, que pasan a la línea de la estenosis aórtica.
  Sin estenosis el papel no los publica: es la consecuencia aceptada de la orden.

## 4. Las líneas de válvula

`cuadLineasVM(CX)` · `cuadLineasVA(CX)` · `cuadLineasTriPulm(CX)` — una línea por hallazgo, dentro
del cuadro de su estructura, **sólo si hay alteración** y **sin repetir** ningún número que el
cuadro ya publica en sus filas.

- La **morfología** va primero y marcada con el color de la plantilla (`_C('TEMA')`), con su número
  de prótesis pegado cuando lo hay.
- Después, **una línea por lesión** con su grado y sus propias medidas.
- Al final, la **nota** que el médico escribió, sin encabezado y sin color.

| ayudante | qué hace |
|---|---|
| `_cuadMorfAlt(v)` | una morfología es un hallazgo cuando no es la opción normal de su válvula (`CUAD_MORF_SIN`) |
| `_cuadPz(rot, val)` | una pieza «rótulo valor»; se omite sola sin valor, así que la línea nunca publica un rótulo pelado |
| `_cuadLinea(enc, piezas, azul)` | arma la línea con « · » entre sus piezas |
| `_cuadMetTxt(partes)` | «26.1 mm² (PISA)» a partir de `_imMetodoPdfPartes` |
| `cuadAvmThpTxt()` | el AVm por THP: con **IAo severa** publica sólo **«no corresponde»** |

⚠️ **`_imMetodoPdfPartes` ES EL DUEÑO Y DEVUELVE LAS PARTES, NO LA CADENA.** Hay DOS formas del
mismo dato: la fila de una tabla escribe «PISA: 26.1 mm²» y la línea de válvula escribe
«26.1 mm² (PISA)». Con dos funciones decidiendo qué método entra, el día que la casilla de PISA
cambie de regla una de las dos superficies se queda con la anterior. `_imMetodoPdfVal` conserva
su salida carácter por carácter.

⚠️ **«no corresponde» ES SÓLO DEL PAPEL Y SÓLO POR LA IAo SEVERA.** El dueño del motivo sigue
siendo `emAvmThpPdfMotivo`, y el panel «🖨️ Incluir en el informe» de la pantalla **conserva el
texto largo**, porque ese panel existe para explicar POR QUÉ no sale. En una celda de 60 mm la
frase entera se llevaba tres renglones. Los otros dos motivos no se tocan.

⚠️ **`it_eroa` NO EXISTE COMO CAMPO** y se conserva así: lo heredó la fila «EROA IT» del cuadro de
válvula tricúspide que esta tanda retira, y esa fila nunca publicó un número en ningún PDF
firmado. Cablearlo agregaría un dato al papel, que es contenido clínico. → **CUAD-b**.

## 5. La grilla — la misma regla en los dos lados

`cuadFilas(n)`: filas de tres; dos cuadros en la última fila van a **mitades**; uno solo se lleva la
**fila entera**; y cuando el total deja **uno suelto**, las dos últimas filas van de a **2 + 2**.

```
12 -> 3·3·3·3   11 -> 3·3·3·2   10 -> 3·3·2·2   7 -> 3·2·2   4 -> 2·2   2 -> 2   1 -> 1
```

- **En el PDF**: una llamada a `drawTablaCompacta` por fila. Una fila es **atómica** —su
  `checkPage` pide hoja con el alto completo—, así que ningún cuadro se corta entre dos hojas y
  las hojas se llenan en orden.
- **En la tarjeta**: una grilla de **SEIS** columnas y un `span` por cuadro (2, 3 ó 6). Con tres
  columnas no hay forma de partir una fila en mitades. El span va en un **atributo** y no en un
  estilo en línea, porque la media query de celular —un cuadro por fila por debajo de 760 px— le
  gana al atributo y no le ganaría a un estilo en línea.

## 6. Lo que `drawTablaCompacta` ganó

1. Una sección sobrevive al filtro **con sólo líneas de válvula** (una aórtica calcificada sin un
   gradiente medido deja el cuadro sin filas y con su línea).
2. `maxR` arranca en **0** explícito: `Math.max()` sin argumentos da `-Infinity`.
3. Con el **rótulo vacío** sale el valor solo, sin los dos puntos delante —es el cuadro «Otros»—.
4. Las **líneas** y la **nota** se miden con la misma fuente con la que se dibujan, van a lo ancho
   de la sección entera y su alto entra en `tblH`, así que el borde de las tres cajas de una fila
   queda a la misma altura.

## 7. El botón y la tarjeta

| función | qué hace |
|---|---|
| `cuadPersonalizado()` | ¿la configuración es la de fábrica? Compara **contenido**, no identidad |
| `cuadBtnSync()` | el **punto** de aviso y las palabras del `title` y del `aria-label` |
| `cuadAbrir()` / `cuadCerrar()` | la tarjeta, con el foco y el Escape |
| `cuadPintar()` | el cuerpo, con nodos (`createElement` + `textContent`) |
| `cuadQuitar` / `cuadRecuperar` / `cuadRestablecer` | la ✕, el chip de la franja y el botón |
| `_cuadArrDown` / `_cuadArrMove` / `_cuadArrUp` | el arrastre con **eventos de puntero** |
| `cuadOrdenDesdeDOM()` | commitea el orden al soltar, **conservando el lugar de los quitados** |

⚠️ **EL AVISO NO VIVE SÓLO EN EL COLOR.** El punto es una **forma** que está o no está, y el
`title` y el `aria-label` lo dicen con palabras en los dos estados. Un cuadro quitado y olvidado
saca un estudio sin ese dato.

⚠️ **EL ARRASTRE VA CON EVENTOS DE PUNTERO Y NO CON EL ARRASTRE NATIVO DE HTML**, que no existe con
el dedo. La manija lleva `touch-action:none` para que el navegador no se quede el gesto. **Se mueve
el nodo y se repinta al soltar**, no en cada movimiento: repintar destruiría la manija que tiene
capturado el puntero y el arrastre se cortaría solo al primer píxel.

⚠️ **EL EJE SE DECIDE POR LA POSICIÓN DE LOS DOS CUADROS** y no por la forma de uno. La primera
versión miraba si el cuadro era más ancho que alto: en celular, donde va uno por fila y mide todo
el ancho, eso daba «más ancho» y el gesto se ordenaba por el eje que ahí no ordena nada.

⚠️ **LA CONFIGURACIÓN VIVE EN MEMORIA Y DURA LO QUE DURA LA APP ABIERTA** (corrección del médico
del 18/11/2026). Ni `localStorage` ni el estudio, así que recargar devuelve el orden de fábrica;
pero **NO la descarta ni «Nuevo estudio» ni la apertura de otro estudio**: vale para todos los
estudios hasta «Restablecer». **Por eso NO hay ningún gancho en `limpiarCampos`**, que es donde
esta casa engancha todo lo que vuelve a cero: la ausencia de ese gancho ES la decisión.

⚠️ **`var(--bg2)` Y NO `var(--card)`: `--card` NO EXISTE en esta aplicación.**

⚠️ **EL OVERLAY LLEVA `if(event.target===this)` LITERAL** en su `onclick`: `enhanceClickables`
saltea exactamente esa cadena, y sin ella el `div` entraría por la rama que le pone `tabindex` y
deja la tecla Espacio cerrando la tarjeta.

## 8. Los casos

**TC-928** a **TC-943** — fichas en `docs/mapa/tests-fichas-928.md`. Los dieciséis caen **0/16**
contra `d3ea944` con el mismo archivo de casos y sólo el `index.html` distinto, y **ninguno por
excepción**.

La sonda de dos motores es `scripts/_probe_cuad.mjs` (+ `_probe_cuad_cuerpo.js`); el generador de
los casos, `scripts/_gen_cuad_casos.py`.
