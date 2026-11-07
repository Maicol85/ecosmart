# Fichas de los casos TC-736 a TC-741 — tanda PANT-20 (2026-11-06)

> Archivo propio: `docs/mapa/tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo.
>
> Los seis llevan el **conversor de cuatro elementos** que TC-735 estrenó, y **cada uno lo prueba
> con su control positivo, su control negativo y el caso del CERO en los dos sentidos** antes de
> usarlo —el bloque `(Z)`—. Sin eso, una condición con un valor truthy pasaría en verde **sin
> comparar** y una con `0` fallaría teniendo el valor correcto. Es la lección que PANT-14b dejó
> escrita y PANT-19 volvió a pagar.

---

## TC-736 · la Tabla A7 contra su transcripción, con sus cuatro formas de celda

**Qué fija.** `PROT_CAT_A7` tiene **12 modelos, 26 filas de tamaño y 82 celdas con dato**, los
números de `docs/TRANSCRIPCION_A7_P20.md`; las cinco columnas en el orden de la tabla; la fuente
con su tabla, su hoja y su folio; y **las doce filas con folio**, o sea ninguna sin fuente.

**Las cuatro formas, una fila de control por forma:**
- `(B1)` St. Jude 25 → las cinco columnas como **media ± DE**;
- `(B2)` On-X 29 → **mediana con rango** en el pico y **media ± DE** en el medio, en la misma fila;
- `(B3)` Homograft → **sin tamaño impreso**, con la marca `uno` y un **límite**;
- `(B4)(B5)` nueve celdas de límite y cincuenta y seis con texto impreso.

**Controles negativos.** `(C2)` ningún modelo lleva un tipo que no sea `mec`, `bio` o vacío.
`(D2)` ninguno de los dos de «native outflow» trae el texto «No data» **como tamaño**.

**Denominador.** `(A0)` la tabla existe y tiene modelos; si no, el caso devuelve ahí mismo.

**Cómo hacerlo caer.** Quitar una celda, cambiar un tipo, renombrar una columna o sacarle el folio
a una fila.

---

## TC-737 · las Tablas A9 y A8, y que la A8 queda SIN consumidor

**Qué fija.** `PROT_CAT_A9` con **8 modelos, 28 tamaños, 190 celdas con dato y 6 impresas «NA»**;
las siete columnas en orden; la fuente y el folio de las ocho filas.

**Filas de control leídas en imagen.** `(B1)` St. Jude Medical Standard 27 con sus siete
parámetros; `(B2)` el THP de la Hancock II 31, impreso «NA», cargado `null`; `(B3)` el THP de la
Perimount 33, **impreso sin espacio tras el símbolo**, es `137 ± 53`.

**El tipo.** `(C1)` tres mecánicas y cinco bioprótesis: **los ocho lo tienen**, porque sale del
encabezado del bloque.

**La A8, bloque (D).** `(D1)` su gradiente medio es `3.8 ± 2.0` y su área y su velocidad están en
`NR`; `(D2)` trae sus dos sub-filas por tamaño; `(D3)` **no tiene la forma del catálogo**; `(D4)`
**no está en `VMOD_TABLA`**, o sea que nadie la lee.
`(D5)` es el **control negativo del motivo**: `vt_morf` no ofrece ninguna opción de implante
transcatéter. El día que entre una, este control se pone rojo y hay que decidir.

---

## TC-738 · el componente en la MITRAL, con la fila propia y TC-522 intacto

**Qué fija.** El botón sólo con prótesis y de **44 px**; la **fila propia** y que la grilla de
tres **no se toca**; la sugerencia por palabra; los valores esperados contra la tabla; los **dos
cortes de IMC**; el modo manual; la limpieza al cambiar de morfología; y «Nuevo estudio».

**La condición que vale por todo el commit.** `(A4)` el botón **no está dentro** de
`.valv-morf-row--tres`, y `(A5)` esa grilla conserva sus **tres** hijos con los ids
`vm_morf, vm_tipo_im, vm_carp` — que es exactamente lo que TC-522 (A2) exige.

**Los dos cortes de IMC, medidos sobre el dueño y no sobre la pantalla.** `(D1)` **la misma EOA
indexada cambia de categoría con el corte**: 1,05 es «moderado» con IMC 25 y «sin desajuste» con
IMC 31. Es la única forma de probar que el corte se aplica, porque el ASC y el IMC salen de los
mismos dos campos y no se pueden mover por separado.
`(D2)` los cortes son los **mitrales** de la Tabla 7 (1,2 / 0,9 y 1,0 / 0,75) y no los aórticos.
`(D3)` control negativo: sin indexada no hay categoría.

**Controles negativos.** `(B2)` una consulta sin coincidencias no propone ningún modelo. `(E2)`
con peso y talla el mismo modelo **sí** publica la indexada, o sea que `(E1)` no mide sobre la
nada. `(I0)` antes de «Nuevo estudio» el botón **anunciaba** el modelo.

**Denominadores.** `(A0)` la sección abre y el select tiene geometría; `(A3)` las dos filas
tienen ancho; `(B0)` la card abrió y la lista **no se abre sola**; `(C0)` el modelo existe en la
tabla y el componente lo encuentra.

**`(D4)` — la condición que nació del barrido de mutaciones.** Las otras del bloque `(D)` llaman
a `_vmPpmClasificar` **directo**, así que **la mutación 18** —que le pone a la entrada de la
mitral el clasificador de PPM **aórtico**, que existe, está expuesto y también devuelve una
categoría— **pasaba en verde**: ninguna condición ataba la **publicación** del componente a su
dueño.

`(D4)` **busca su escena en vez de adivinarla**, y es lo que la hace fiable: los cortes mitrales
(0,90 y 1,20) y los aórticos (0,65 y 0,85) **coinciden en casi todo el rango**, así que recorre
tres modelos por cinco pares de peso y talla llamando a `vModIndexada('vm', E)` —que lee el DOM
al instante y no necesita esperar un repintado— hasta dar con uno donde los dos veredictos
difieran. **Si ninguno los separa, el denominador lo DICE** en vez de pasar sobre la nada.

---

## TC-739 · la TRICÚSPIDE: la decisión 6 y la conversión de unidad

**La decisión 6, bloque (C).** `(C1)` la EOA indexada **predicha** sale sólo como número:
**ninguna** de las tres palabras del desajuste. `(C2)` la entrada del registro va con `ppm:null`
y `cortes:null`. `(C4)` la línea de abajo **no publica el IMC**, porque sin cortes no elige
ninguna rama.
`(C3)` es el **control negativo**: la **mitral**, que sí tiene cortes, **sí** trae clasificador.

**La conversión, bloque (D).** Con Carbomedics Standard 31, cuyo esperado es `1.4 ± 0.19 m/s`:
`(D1)` 140 cm/s → **+0.0 DE**; `(D2)` 178 → **+2.0**, *no veinte*; `(D3)` 121 → **−1.0**;
`(D4)` 102 → **−2.0**, con el signo del otro lado. `(D0)` es el denominador: el esperado de esa
fila es el que se dice.

**Y (A3)**: el botón comparte la fila con el select, **al revés que en la mitral**.

---

## TC-740 · la PULMONAR: lo IMPRESO y la marca `uno`

**Lo impreso, bloques (B) y (C).** `(B1)` Carbomedics 23 publica la **mediana con su rango**
—«19 (17-20)», «78 (70-85)»— y no el valor solo; `(B2)` la columna que la tabla imprime como
valor único sale **sin** rango; `(C1)` el Homograft publica los **límites** tal cual —«<25»,
«<15», «<2.5»—.

**Lo que un límite NO produce.** `(C2)` **no** sale una EOA indexada predicha, porque no hay valor
central; `(C3)` lo medido **se publica**, pero **sin** diferencia en desviaciones. Las dos son la
mitad medible de **P20-a**.

**La marca `uno`.** `(C0)` el Homograft publica sus tres cuadritos **sin pedir tamaño**; `(F1)`
cuatro modelos la llevan y **ninguno** tiene tamaño impreso.

**Los tres medidos.** `(E1)` la pulmonar declara `pico`, `medio` y `vpico` con sus ids reales.
`(E2)` es el **control negativo de P20-c**: no existe ningún campo de AT ni de área de la prótesis
pulmonar. El día que se agregue uno, este control se pone rojo.

---

## TC-741 · los doce campos, el Excel de 457 y que el papel no cambia

**Los doce campos, bloque (A).** `(A1)` **ninguno** es `type="hidden"` —en un hidden el `value` y
el `defaultValue` son el mismo atributo y «Nuevo estudio» no lo limpiaría (P14c-g)—; `(A2)` los
doce van con `display:none`; `(A3)` ninguno queda **fuera** del estudio.

**El Excel, bloque (B).** `(B1)` **457** columnas; `(B2)` las doce nuevas con su nombre exacto;
`(B3)` **ningún** encabezado contiene «EOA» ni «AEO», que es lo que un caso existente exige
(P19-g); `(B4)` las columnas vecinas de siempre siguen ahí.

**El filtro de prótesis, bloque (C).** `(C1)` con válvula **nativa** las tres columnas de modelo
salen vacías; `(C2)` con **prótesis** las tres traen el modelo. El par prueba que el filtro
discrimina y no que siempre vacía.

**«Nuevo estudio», bloque (E).** `(E0)` es el denominador: los doce quedaron cargados; `(E1)` los
doce se vacían.

**El papel, bloque (F).** `(F1)` **nada del catálogo llega al informe ni al EN SUMA**: ni un
modelo, ni una tabla, ni un folio, ni la indexada, ni la diferencia en desviaciones. `(F2)` es el
control: el informe **sí** describe las válvulas protésicas, o sea que el denominador no está
vacío.

⚠️ **`__t.informe()` devuelve `{inf, suma}`.** Leerlo con otra clave da `[object Object]`, o sea
un denominador de **15 caracteres**, que se lee igual que «el informe salió vacío». Costó una
corrida.

### El bloque `(G)` — las dos fichas de Referencias del commit 7

Nueve condiciones. `(G0)` y `(G4)` son denominadores: la subpestaña existe con fichas y las dos
nuevas tienen contenido, porque con el contenedor vacío todo lo de abajo cuenta cero y se lee
igual que «las fichas están bien».

- `(G1)` son **siete** y dos nombran la pulmonar y la tricúspide de la ASE 2024.
- `(G2)` **las dos están DENTRO de `ref-protesicas`**, preguntado con `contains` y no por
  existencia. Es la que más importa, y es la que cazó el defecto al escribir el commit 7: una
  ficha puesta **afuera** existe, el buscador la indexa y el médico que navega por las solapas
  **no la encuentra nunca**.
- `(G3)` las dos **nacen cerradas**, como las otras cinco.
- `(G5)` la pulmonar publica **cuatro** parámetros y la tricúspide **cinco**, contados por filas
  **con celda de dato** y no por filas de tabla: la cabecera es una fila y suma.
- `(G6)` cada una cita el folio de **su** tabla (33 y 36).
- `(G7)` cada una publica los tramos de **su** tabla y **no** los de la otra, en los dos
  sentidos: la pulmonar tiene «3,2» y no «200», la tricúspide «200» y no «3,2».
- `(G8)` **control negativo**: ninguna agrega un globo nuevo.

⚠️ **La mutación que lo prueba tuvo que reescribirse.** La primera cambiaba el **rótulo** de una
fila y la fila seguía ahí, así que `(G5)` no podía fallar: ahora borra el `<tr>` entero.
