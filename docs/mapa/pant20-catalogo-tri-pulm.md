# El catálogo de prótesis en la mitral, la tricúspide y la pulmonar — tanda PANT-20 (2026-11-06)

> Qué tocar cuando haya que mover el catálogo de modelos de las **tres válvulas que esta tanda
> conectó**, el botón «Modelo y tamaño» de cada una, los valores esperados, la EOA indexada o las
> dos fichas de Referencias de obstrucción protésica.
>
> El componente y la **aórtica** están en `docs/mapa/pant19-catalogo-protesis.md`, que sigue
> siendo la referencia de cómo funciona: **esta tanda no lo reescribió, le agregó tres entradas**.

---

## 1 · Las tres tablas de datos que entraron

| constante | qué trae | de dónde | transcripción |
|---|---|---|---|
| `PROT_CAT_A7` | **12** modelos pulmonares, 26 filas de tamaño, 82 celdas | ASE 2024, Tabla A7, hoja 61, **folio 62** | `docs/TRANSCRIPCION_A7_P20.md` |
| `PROT_CAT_A9` | **8** modelos tricúspides, 28 tamaños, 196 celdas (190 con dato, 6 «NA») | Tabla A9, hoja 62, **folio 63** | `docs/TRANSCRIPCION_TRICUSPIDE_P20.md` |
| `PROT_CAT_A8` | la tabla de ViV/ViR tricúspide transcatéter, **con su propia forma y sin consumidor** | Tabla A8, hoja 61, **folio 62** | la misma |

**La regla de folio es folio = hoja + 1**, comprobada en el pie impreso de las hojas **pares** y
en el encabezado de las **impares**, hoja por hoja.

⚠️ **TRES CASOS COMPARAN EL CÓDIGO CONTRA SU TRANSCRIPCIÓN** —TC-736, TC-737 y el bloque (D) del
segundo—: cuentan los modelos, los tamaños, las celdas con dato y las «NA», y verifican las filas
de control leídas en imagen. Quitar una celda los pone en rojo.

## 2 · La Tabla A7 y las CUATRO formas de celda

**Es lo que obligó a extender la forma del dato, y vale para cualquier tabla futura.** La A7
mezcla media ± DE, **mediana con rango intercuartílico**, valor único y **límite superior**, y su
nota al pie declara sólo las dos primeras.

**La celda ganó un TERCER elemento opcional: el TEXTO IMPRESO.** Se carga sólo cuando lo impreso
no es «valor» ni «valor ± desvío», y `_vmPar` lo publica **tal cual** cuando está. Así no se
pierde ni se inventa nada.

```js
[16, 5]                      // «16 ± 5»
[11, null, '11 (8-17)']      // la mediana con su rango, tal como la imprime
[2.2, null]                  // «2.2»
[null, null, '<15']          // el límite, sin valor central
```

⚠️ **UN LÍMITE NO TIENE VALOR CENTRAL**, así que de él **no sale** ni una diferencia en
desviaciones estándar ni una EOA indexada predicha. Lo fija **TC-740 (C2)(C3)**. → **P20-a**.

## 3 · De dónde sale el nombre, el descriptor y el tipo

| | A7 (pulmonar) | A9 (tricúspide) |
|---|---|---|
| **el nombre** | lo que va **entre paréntesis**; sin paréntesis, lo que va después del descriptor conocido | el encabezado de columna |
| **el descriptor** | el subtítulo de sección (`Mechanical valves`, `Valved conduits`, …) | el encabezado del bloque |
| **el tipo** | `mec` en las tres mecánicas, `bio` en «Bioprosthetic valves», **sin dato en las otras ocho** | los **ocho** lo tienen: `Mechanical` → `mec`, `Bioprosthesis` → `bio` |

**El tipo se asigna sólo cuando el descriptor nombra el mecanismo o el tejido**, que es la regla
que PANT-19 fijó para la A4. `Valved conduits` describe el conducto, `Percutaneous…` la vía de
implante y `Homograft` el injerto: los seis quedan **sin dato** y se ofrecen bajo **cualquier**
morfología de prótesis, que es el lado seguro.

⚠️ **Y la A9 está TRANSPUESTA**: los modelos son columnas y los parámetros filas, en cuatro
bloques. **El reparto de cada tamaño a su modelo se LEYÓ EN IMAGEN**: asignarlo por la proximidad
del encabezado centrado da mal en **dos de los cuatro** bloques, medido.

## 4 · La marca `uno`, hermana de `viv`

Cuatro modelos de la A7 —`Homograft`, `Bioprosthetic valves`, `Alterra Stent with SAPIEN` y
`Harmony`— **no llevan tamaño impreso**. Su única fila va con el tamaño vacío y la marca `uno`,
que hace que se elija **sola**, igual que un valve-in-valve. Y una fila con el tamaño vacío **no
genera opción** en el select, porque duplicaría el «—» de arriba.

⚠️ **En los dos de «native outflow» la celda de la columna `Size` imprime «No data»**, que
significa que la tabla **no publica datos** para ellos —no que su tamaño se llame así—: sus seis
celdas van en `null` y **no se inventa ningún tamaño**. Lo fija **TC-736 (D1)(D2)**.

## 5 · Dónde va el botón en cada válvula, y por qué

| válvula | dónde | por qué |
|---|---|---|
| aórtica *(PANT-19)* | **en la fila del select** | `.valv-morf-row` flex con un solo hijo, 774 px libres a 1440 |
| **mitral** | **en una FILA PROPIA debajo** | su fila es `.valv-morf-row--tres`, un grid de tres con el ancho **acotado al botón «Insuficiencia»** (483 px a 1440) que **TC-522 vigila**, y a 1000 px ya está en UNA columna de 275 |
| **tricúspide** | **en la fila del select** | igual que la aórtica: flex con un solo hijo, 774 / 358 / 286 px libres |
| **pulmonar** | **en la fila del select** | ídem |

⚠️ **LA FILA PROPIA DE LA MITRAL ES HERMANA Y NO TOCA LA DE ARRIBA**, y eso es lo que deja TC-522
verde **por construcción**: ese caso cuenta los hijos `.fg` de `.valv-morf-row--tres` (A2) y mide
su ancho contra el del botón (A3). Medido en los cuatro anchos, antes y después: la grilla queda
en **483 / 275 / 706 / 328** px, idéntica. Lo fija **TC-738 (A3)(A4)(A5)**.

La fila propia es `.valv-morf-row.vmod-row`, con una sola regla de CSS —`margin-top:-6px`— que no
declara ancho ni columnas.

## 6 · Lo que cambia por posición, y nada más

`VMOD_POS` pasa de **una** entrada a **cuatro**. `VMOD_TABLA` es el dueño único del mapeo
posición → catálogo, y reemplazó la cascada de ternarios que la cuarta válvula habría vuelto
ilegible.

| | mitral | tricúspide | pulmonar |
|---|---|---|---|
| morfología | `vm_morf` | `vt_morf` | `vp_morf` |
| campos | `vm_prot_*` | `vt_prot_*` | `vp_prot_*` |
| catálogo | `PROT_CAT_A5` | `PROT_CAT_A9` | `PROT_CAT_A7` |
| **medidos** | 4 | 6 | **3** |
| **PPM / cortes** | `_vmPpmClasificar` + Tabla 7 | **ninguno** | **ninguno** |

**`vModSyncTodos` recorre `Object.keys(VMOD_POS)`**, así que las tres columnas del repintado
—`ESPEJOS_VIVOS`, `RECALC_MODULOS` y el final de `limpiarCampos`— cubrieron las tres posiciones
nuevas **sin tocar una línea**, en el orden que TC-676 (D2) y TC-700 (A5)(A6) fijan.

### 6a · El dueño único del PPM mitral

La regla vivía **dentro** de `vmProtEOA`, que lee del DOM, así que el componente no podía usarla
sin copiarla. Se extrajo **`_vmPpmClasificar(eoai, imc)`**, con la misma forma que
`_eaPpmAoClasificar`, y `vmProtEOA` la llama.

⚠️ **SU GUARDA NO EXIGE «mayor que cero», al revés que la aórtica**, y es deliberado: `vmProtEOA`
ya decide cuándo llamarla y agregar esa condición **cambiaría** el resultado de un área de cero,
que hoy sale «severo». La extracción **no mueve una sola salida**, verificado en los once bordes y
por el A/B.

### 6b · La decisión 6: sin cortes, sólo el número

La Tabla 7 **no publica** cortes de EOA indexada tricúspide ni pulmonar, así que esas dos
entradas van con `ppm:null` y `cortes:null`, y el pintor y el borrador publican **sólo el
número**. Y **el IMC deja de publicarse donde no elige ninguna rama de cortes**.

### 6c · La conversión de unidad

La Tabla A9 imprime la velocidad de E en **m/sec** y el campo (`et_e_vmax`) está en **cm/s**. El
medido lleva **`fac:100`**, que lleva lo esperado a la unidad del **campo** antes de restar; el
cuadrito del valor esperado sigue publicando la unidad de la tabla. Es la misma regla que
`VT_PROT_T19` aplica a su corte.
Medido con Carbomedics Standard 31 (1,4 ± 0,19 m/s = 140 ± 19 cm/s): **140 → +0.0 DE**, **178 →
+2.0**, **121 → −1.0** y **102 → −2.0**.

### 6d · `lblMed`

Una etiqueta de medido cuyo género no cierra con el sufijo « medido» trae la suya
(«Velocidad pico medida»). Sin ella, el sufijo de siempre. La aórtica no cambia.

## 7 · Los doce campos y las doce columnas

| | mitral | tricúspide | pulmonar |
|---|---|---|---|
| `Modelo de prótesis …` | `vm_prot_modelo` | `vt_prot_modelo` | `vp_prot_modelo` |
| `Tamaño de prótesis …` | `vm_prot_tam` | `vt_prot_tam` | `vp_prot_tam` |
| `G. medio de referencia … (mmHg)` | `vm_prot_gmref` | `vt_prot_gmref` | `vp_prot_gmref` |
| el área de referencia | **`AVm`** de referencia mitral | **`AVT`** de referencia tricúspide | **`Área`** de referencia pulmonar |

**Excel 445 → 457. Censo de campos 1004 → 1016.**

⚠️ **NINGÚN ENCABEZADO NUEVO CONTIENE «EOA» NI «AEO», y lo decidió un caso existente** (P19-g),
no una preferencia. Las tres siglas elegidas son las que el propio Excel ya usa para esas áreas.

⚠️ **Guión BAJO** para que `_noEsDelEstudio` —que excluye por prefijo con guión **medio**— no los
saque del estudio, y **`display:none` y no `type="hidden"`**, porque en un hidden el `value` y el
`defaultValue` son el mismo atributo y «Nuevo estudio» no los limpiaría (P14c-g).

## 8 · Las dos fichas de Referencias

`ref-protesicas` pasa de **cinco** fichas a **siete**: «Prótesis Pulmonar — ASE 2024» con la
**Tabla 15** (hoja 32, folio 33) y «Prótesis Tricúspide — ASE 2024» con la **Tabla 19** (hoja 35,
folio 36).

⚠️ **VAN DENTRO DE `ref-protesicas`, así que `REF_SUBTAB` NO SE TOCA**: ese registro reubica el
**contenedor** entero y no cada ficha, y `valv` ya lo lista. **La primera versión las dejó
afuera** —el ancla que elegí cerraba la card de endocarditis *y* el contenedor en el mismo
tramo— y **lo cazó la medición, no la lectura**: una ficha fuera del contenedor existe, se abre
desde su encabezado y el buscador la indexa, pero el médico que navegue por las solapas no la
encuentra nunca. Es la lección que `constriccion` dejó en la tanda J.

**La premisa del commit no se reprodujo, y a favor:** pedía medir si la app gradúa la prótesis
tricúspide o pulmonar con cortes de **válvula nativa**. **No.** Usa `VT_PROT_T19` y
`VP_PROT_T15`, que coinciden **fila por fila** con lo leído en imagen. Lo que sí faltaba es que
esas dos tablas **no tenían ficha**.

## 9 · Lo que esta tanda NO hizo

- **La Tabla A6** (SAPIEN mitral) sigue afuera, por los dos motivos de **P19-d**. → **P20-e**.
- **La Tabla A8** queda cargada y **sin consumidor**, por los mismos tres motivos. → **P20-b**.
- **La pulmonar compara tres de sus cinco columnas**, porque la app no tiene campo de AT ni de
  área de la prótesis pulmonar. → **P20-c**.

## 10 · Dónde está lo demás

| qué | dónde |
|---|---|
| el componente y la aórtica | `docs/mapa/pant19-catalogo-protesis.md` |
| el inventario de solo lectura del commit 1 | `docs/INVENTARIO_PROTESIS_P20.md` |
| las dos transcripciones celda por celda | `docs/TRANSCRIPCION_A7_P20.md` · `docs/TRANSCRIPCION_TRICUSPIDE_P20.md` |
| las reglas de folio y la tabla de cambios de evidencia | `docs/fuentes/FUENTES.md` → «La tanda PANT-20» |
| las fichas de los seis casos | `docs/mapa/tests-fichas-736.md` |
| lo declarado y lo parado | `docs/PENDIENTES.md` → **P20-a** a **P20-f** |
| la guía de prueba manual | `docs/GUIA_PRUEBA_PANT20.md` |
| el barrido de mutaciones | `scripts/_mut_pant20.py` |
| la suite en lotes | `scripts/_lotes_pant20.sh` |
| las sondas | `_probe_pant20inv.mjs` · `_probe_pant20mod.mjs` · `_probe_pant20geo.mjs` · `_probe_pant20ab.mjs` |

## 11 · El barrido de mutaciones, y los tres sobrevivientes del primero

`scripts/_mut_pant20.py` corre **40** mutaciones dirigidas en un worktree y **nunca** sobre el
árbol vivo, con el md5 del vivo comparado al abrir y al cerrar. Cada mutación declara **su**
caso: con los seis corriendo por cada una, un reparto mal hecho queda tapado por el caso de
otro commit. Reparto: TC-736 **8** · TC-737 **6** · TC-738 **8** · TC-739 **5** · TC-740 **4** ·
TC-741 **8** · TC-731 **1**.

Las 40 anclas se verifican con `index.html` **antes** de correr el barrido y tienen que aparecer
exactamente una vez, con el **carácter real** y no una secuencia `\uXXXX` — que es lo que PANT-19
pagó con siete anclas que no aplicaron.

**El primer barrido dio 37/40, y los tres sobrevivientes dijeron tres cosas distintas:**

| # | qué hacía | diagnóstico |
|---|---|---|
| **18** | le pone a la entrada de la mitral el clasificador de PPM **aórtico** | **hueco real** → nació **(D4)** de TC-738 |
| **21** | la sugerencia busca en cualquier posición y no al principio de una palabra | **mal dirigida**: la mata **(B3b) de TC-731**, de PANT-19 |
| **40** | «la pulmonar pierde una fila» | **mal escrita**: cambiaba el **rótulo** y la fila seguía ahí |

### Por qué la 18 era un hueco y cómo se cerró

Las condiciones (D0) a (D3) llaman a `_vmPpmClasificar` **directo**, así que ninguna ataba la
**publicación** del componente a su dueño — y el clasificador aórtico existe, está expuesto en
`window` y también devuelve una categoría, así que el cuadrito seguía saliendo con un veredicto
plausible.

**(D4) busca su escena en vez de adivinarla**, y eso es lo que la hace fiable: los cortes
mitrales (0,90 y 1,20) y los aórticos (0,65 y 0,85) **coinciden en casi todo el rango**, así que
recorre tres modelos por cinco pares de peso y talla llamando a `vModIndexada('vm', E)` —que lee
el DOM al instante y no necesita esperar un repintado— hasta dar con uno donde los dos veredictos
difieran. **Si ninguno los separa, el denominador lo DICE** en vez de pasar sobre la nada.

### Por qué la 21 no era un hueco

La línea mutada es la del **componente único**, compartida con la aórtica, y PANT-19 ya la había
cubierto: **«ifecta» cae en MEDIO de «Trifecta»**, que es lo único que separa «buscar por palabra»
de «buscar en cualquier posición» —«han» y «mosa» caen al principio de una y pasan con las dos
reglas—. Declararla a TC-738 la dejaba sobreviviendo **sobre cobertura que ya existía**.

⚠️ **Y arreglar el arnés costó una corrida por un resbalón propio:** los dos comentarios nuevos
se escribieron con `/* */`, que en un archivo de Python **no es un comentario**. Es la trampa que
`CLAUDE.md` ya documenta.

## 12 · La verificación de cierre, con sus denominadores

| qué | resultado |
|---|---|
| **barrido de mutaciones** | **40/40 muertas**, 0 sobrevivieron, 0 no aplicaron, en 2,2 min, md5 del vivo idéntico |
| **caída de los casos nuevos** | los seis caen contra `694e9e3` por **52 condiciones y NINGUNA por excepción** |
| **suite completa** | **750/756**, catorce lotes, **756 de 756 ejecutados**, md5 idéntico, pendrive verificado 16 veces |
| **rojos** | los cuatro de siempre más **TC-551** (pasa 2/2 aislado) y **TC-557** (cae idéntico contra `694e9e3`) |
| **A/B** | 104 escenas, 127.696 claves, 47.528 celdas: **2.808 diferencias y las 2.808 son el inventario** |
| **dos motores** | dieciséis cruces, **una** diferencia entre motores: 3 px de ancho de botón |
| **celular** | **59 a 360 px y 67 a 390, con 18 ALTA** — la línea base exacta |
| **Semgrep** | **124 WARNING / 0 ERROR**, sin un aviso nuevo |
| **huérfanos** | ninguno nuevo |

⚠️ **El «0 diferencias de pantalla» del A/B es un CONTROL NEGATIVO y se declara**: ese arnés no
abre el componente ni mira su tarjeta. Lo que lo mide son `scripts/_probe_pant20mod.mjs` —una
corrida por posición— y `scripts/_probe_pant20wk.mjs`, la de los dieciséis cruces.

⚠️ **Y la sonda de dos motores midió sobre un denominador vacío en su primera corrida:** los tres
botones informaban **0×0** y la tarjeta no abría en los dieciséis cruces, que se lee igual que «el
componente no está». Faltaba abrir las tres secciones con `toggleEteSeccion` sobre los ids
`ete-seccion-valv-*`. La segunda versión se validó **en un cruce** antes de gastar la corrida
entera.

⚠️ **El área táctil no se cuenta como «5 de 5».** Los tres botones son `.btn`, con
`border-radius`, así que el punto a 2 px de la esquina cae **fuera** de la forma redondeada y
`elementFromPoint` devuelve el contenedor. Lo que se cuenta es que **ningún** punto caiga en
**otro control**: `ajeno=0` en los 48 —tres botones por dieciséis cruces—, con el alto en 44 px.

