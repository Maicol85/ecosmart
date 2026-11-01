# Marfan — la pantalla en columnas, la tarjeta en una sola pantalla y el Z de la raíz

Mapa de la tanda **MARFAN-2** (2026-11-02). Por nombre de función y de constante, no por línea.
Lo clínico del score, de las siete reglas y de la figura sigue en `docs/mapa/marfan1-ghent.md`:
**esta tanda no movió un corte, un umbral, un rótulo de grado ni una frase del informe.**

---

## 1 · La sección, en dos columnas (commit 1)

`#mfs-fila` → `#mfs-campos-col` (dos `.mfs-subcol` **explícitas**) + `#mfs-concl-col`.

| columna | qué lleva | por qué |
|---|---|---|
| 1 | Síndrome · Factores de riesgo | lo que **elige** el umbral |
| 2 | Aorta sinusal · Aorta ascendente · índice de tamaño aórtico | lo que se **compara** contra él |
| derecha | la conclusión, con «Integrar al informe» debajo | |

⚠️ **Las subcolumnas son explícitas y no un `grid-2` de flujo por filas**, por la misma razón
medida de MARFAN-1: el índice sólo se muestra en Turner, así que con flujo por filas la
ascendente subiría a la celda que el índice deja libre. El índice va con los diámetros porque se
**deriva** de la ascendente que tiene encima.

El corte es `@media (min-width: 900px)` sobre la **ventana**, que es la regla fija del archivo.

### El texto largo se fue al globo

`MARFAN_FR_TXT` —la lista de factores de riesgo, con el nombre de la guía, su tabla y su folio—
vivía en `#marfan-fr-hint`, debajo del campo. **Ese nodo ya no existe**: su único lector es ahora
`_mfConductaInfo`. `MARFAN_FR_TXT` y `MARFAN_FR_SIN` siguen siendo el dueño único de la lista.

⚠️ **El reparo que TC-116 cazó una vez deja de aplicar**: el hint se limpiaba antes de la salida
temprana de `marfanSync` porque ningún barrido genérico lo alcanzaba. El globo se construye de
cero en cada apertura, así que no hay nada que limpiar.

⚠️ **La lectura de la raíz cargada en AI/VI (`#marfan-ao-lectura`) SE QUEDA**: es un dato, no una
cita. Y sólo sale con el módulo **sin usar** — con el síndrome cargado, el espejo condicional del
G-4 copia `ao_sin` a `marfan_ao_seno` y el campo propio deja de estar vacío.

---

## 2 · La tarjeta, en una sola pantalla (commit 2)

**El defecto, medido en HEAD:** 538 px de scroll interno a 1440×900 (1388 de alto en 850 de caja).
Hoy **826 de 826: cero**, con 26 px de margen contra el tope de 852, idéntico en Chrome y WebKit.

⚠️ **EL QUE SCROLLEA ES `#crit-card`, NO `#crit-cuerpo`.** La tarjeta lleva su `max-height` y su
`overflow:auto` en la **caja**, así que el cuerpo informa su alto **completo** aunque no entre, y
medirlo a él da «scroll interno 0» sobre una tarjeta que se corta. Y el alto del modal tampoco
sirve de presupuesto: en cuanto el contenido entra, la caja **se encoge** a su contenido.

### La maqueta

`.mfs-tarj` → `.mfs-tarj-izq` (tres `.mfs-banda`: score, criterios aparte, reglas) +
`.mfs-tarj-der` (la figura, intacta). Por debajo de 760 px todo se apila.

- `#mfs-bloque-score` y `#mfs-bloque-aparte` son **grillas de dos columnas**.
- Los **tres selectores** llevan `.mfs-fila-ancha` y ocupan las dos: su texto más largo necesita
  ~230 px y una celda mide ~285. ⚠️ **Abreviar la opción NO era la salida**: su texto es el que el
  **papel** publica cuando la opción no declara un texto propio (`op[3] || op[1]`).
- Los dos grupos de reglas van **lado a lado** en `.mfs-reg-cols`; apilados no entraban.

### El piso táctil

`.mfs-fila` pasa a **30 px con puntero fino y 44 con `pointer: coarse`** (24/44 las de casilla,
26/44 las de selector). Es el recurso de `.vinfo-btn` de este archivo, **no** el de AJUSTES-3 —
aquélla quitó su media query porque había **solape** entre controles; acá es densidad.
**Precio:** en una pantalla táctil de 1440×900 la tarjeta scrollea. → `PENDIENTES.md` **MF2-f**.

### Los cuatro globos, y el glifo

⚠️ **EL GLOBO QUE «PASABA DESAPERCIBIDO» NO ERA OTRO COMPONENTE: ERA OTRO CARÁCTER.** Censado en
HEAD: **74** botones usan `&#9432;` / `U+24D8` —la «i» dentro de un círculo, **ⓘ**— y **20**
usaban `&#8505;` / `U+2139` —INFORMATION SOURCE, una «i» suelta, **ℹ**—, que son los de MARFAN-1.
Misma clase `.vinfo-btn vinfo-btn-44`, mismo tamaño, mismo color.

De **veintiuno** a **cuatro**: `mfs-puntaje`, `mfs-aparte` (nuevo), `mfs-reglas` y `mf-conducta`
(el de la sección).

⚠️ **LAS DIECINUEVE DEFINICIONES NO SE PIERDEN, Y ES POR CONSTRUCCIÓN.** Siguen siendo las entradas
`mfs-*` de `VINFO` —su dueño único— y los dos globos de grupo las **leen** de ahí:

- `MFS_DEF_GRUPOS` — las **diez zonas del cuerpo** (mano; tórax; pie; pulmón, columna y cadera;
  proporciones y columna; codo; cara; piel; ojo; corazón) con los trece rasgos del score.
- `MFS_DEF_APARTE` — los seis criterios aparte en cinco bloques.
- `_mfsDefCard(titulo, intro, grupos)` arma el cuerpo; `_mfsLineas` pinta los saltos por nodos.
- `_mfsScoreInfo`, `_mfsAparteInfo` y `_mfsReglasInfo` son los tres `dyn`.

⚠️ **Son DIECINUEVE y no dieciocho**, que es lo que la orden anticipa: trece rasgos del Box 2 más
seis criterios aparte, contados sobre `MFS_SCORE` y `MFS_APARTE`.

⚠️ **`intro` y no `lee` en una clave con `dyn`**: `_vInfoColocar` toma una rama **o** la otra, así
que un `lee` junto a un `dyn` queda escrito sin que nadie lo muestre.

⚠️ **Un `dyn` devuelve un NODO y no una cadena**, que es la trampa que MARFAN-1 ya pagó.

**La guía, la tabla y el folio viven SÓLO en los globos:** el cuerpo de la tarjeta da **0**
«folio», **0** «Box N» y **0** «J Med Genet». La cita salió del pie y «(Box 1)» del rótulo.

### El puntaje de la opción elegida

⚠️ **En HEAD «Pie plano simple» anunciaba 2 y vale 1** — el total sí usaba el 1, o sea que la fila
contradecía a su propio badge. `filaSel` marca el `<b>` con `data-mf-pts` y **`mfsCalc`** lo
repinta leyendo `MFS_SCORE`, que es el mismo dueño que suma. **Sin opción elegida muestra el
máximo**, que es lo que el rasgo puede aportar — el mismo significado que el número fijo de una
casilla sin marcar.

### Las reglas, una línea

`mfsReglasPintar` publica `(N) ` + **`g.corto`** + el estado, y **nada más**. `_mfsY` devuelve
además **`faltan`**, la lista cruda, y la unión sin repetir va en **una sola** línea
(`.mfs-falta`) debajo de las siete. La advertencia «no es un diagnóstico» aparece **una vez**.

⚠️ **La lógica no cambia**: `mfsReglas` sigue siendo el dueño único, con sus tres estados, y `txt`
y `por` quedan palabra por palabra. Lo que se agrega es `corto` y `faltan`.

En HEAD «falta el valor del Z de la raíz» salía en **cuatro** de las siete y «contestar si hay
rasgos de otros síndromes» en otras cuatro.

---

## 3 · La conclusión y el veredicto (commit 3)

**Ampliación de la regla fija, decisión del médico del 02/11/2026: la pantalla tampoco da
indicaciones.** Ni «indicada», ni «se recomienda», ni «considerar», ni «seguimiento por imagen».

Cuatro filas, en este orden:

| # | fila | dueño |
|---|---|---|
| 1 | Criterios de Ghent | `_mfGhentFrase()` — lee `mfsReglas` |
| 2 | Otros datos cargados | `_mfOtrosDatos()` — lee `mfsAparte` y el campo de factores |
| 3 | Umbral de este síndrome | el mapa `U` **más** `r.maxAo` (o el índice en Turner) |
| 4 | Conducta aórtica | la pastilla, con el globo `mf-conducta` |

⚠️ **LAS DOS PRIMERAS VAN ANTES DE LA SALIDA TEMPRANA DE `!r.hayDatos`**, y está medido:
`hayDatos` es «síndrome o diámetro o índice», así que un paciente con nueve rasgos tildados y sin
diámetro salía por ese `return`. Extender `hayDatos` **no** es la salida: lo lee el Laboratorio.

La fila **«Fundamento» se retira**: publicaba `r.txt`, que arrastra la conducta. Su contenido
clínico queda entero en la fila 3. **Ningún número medido desaparece.**

⚠️ **`maxAo` entra en el objeto de `marfanEstado`**, aditivo, para que la fila 3 no reimplemente
«el diámetro que decide es el MAYOR de seno y ascendente».

### Los once estados de la pastilla

| clave | antes | después |
|---|---|---|
| `cx_i` | Cirugía indicada | **Cumple criterios para cirugía** |
| `cx_iia` | Considerar cirugía | **Cumple criterios para cirugía** |
| `cx_iib` | Puede considerarse | **Cumple criterios para cirugía** |
| `umbral_iia_sin_fr` | En zona de vigilancia | **No cumple criterios para cirugía** |
| `sin_indicacion` | Sin criterios quirúrgicos | **No cumple criterios para cirugía** |
| `sin_sindrome` | Falta el síndrome | **Sin datos suficientes** |
| `falta_diametro` | Falta el diámetro | **Sin datos suficientes** |
| `falta_ita` | Falta el índice indexado | **Sin datos suficientes** |
| `sin_umbral` | Sin umbral de diámetro **en la guía** | **Sin umbral de diámetro publicado** |
| sin datos | Ingresar síndrome y diámetros | igual |

**Las once claves NO se tocan** —las lee el Laboratorio para su distribución— y **los colores
tampoco**: el color sigue graduando I, IIa y IIb, así que la información no se pierde; lo que se
deja de hacer es **afirmar una conducta**. `ETQ` es local de `marfanSync`: censado, **ningún otro
módulo lo lee**; el Laboratorio tiene su propio `CX_RESTO`.

⚠️ **`sin_umbral` es el único estado que las tres frases de la orden no cubren** → **MF2-c**.

### El globo de la sección

`_mfConductaInfo` abre **describiendo** lo que la guía fija y lo que la aplicación hace con eso, y
dice que la conducta no se decide por ese número solo. **Cero** «se debe», «se recomienda»,
«indicada», «considerar» y «seguimiento». La fuente, la tabla, el folio y la clase quedan tal cual
—salen de `MARFAN_FTE` y de `r.cita`— y **ningún corte se movió**. Desde el commit 1 lleva además
la **lista de factores de riesgo**.

---

## 4 · El Z de la raíz aórtica (commit 4)

`mfs_z_raiz` — **campo guardado**, numérico con decimales, primera fila de los criterios aparte,
**sin columna de Excel** (441 → 441). Censo de campos guardados **984 → 985**.

- Vive en la **guardería** y no en la tarjeta, por lo mismo que los otros diecinueve:
  `critAbrir` hace `innerHTML = render()`.
- **Guión bajo**, que es lo que lo hace guardarse: `_noEsDelEstudio` va por prefijo y excluye
  `mfs-fig-` con guión **medio**.
- `mfsZ(src)` lo lee del **registro** con `src`, así que sobre un estudio archivado las reglas 1,
  2, 3 y 7 **ya concluyen** — lo que MARFAN-1 no podía.
- Los dos cortes de edad de la regla 7 **no se movieron**: 19 con Z 2,0 → sin dato; 20 con Z 2,0 →
  cumple; 15 con Z 3,1 → cumple; disección sin Z ni edad → cumple.
- La tarjeta **ya no tiene su propio control** (`data-mf-z` se retiró): un dato, una puerta.

### El Z calculado está PARADO

**Devereux 2012 no está en la biblioteca**, censado por contenido sobre los 245 PDF con control
positivo. Y lo que el Loeys cita para el Z de borde de ataque a borde de ataque en diástole es su
**referencia 13** (Roman MJ y cols., *Am J Cardiol* 1989;64:507-12), que tampoco está. El globo
dice «Z calculado: no disponible (falta la fuente del método)». → **MF2-a**.

**Referencias 13 y 14 del Loeys, leídas en imagen** (hojas 9 y 10, folios 483 y 484):
- **13.** Roman MJ, Devereux RB, Kramer-Fox R, O'Loughlin J. *Am J Cardiol* 1989;**64**:507-12.
- **14.** Lin FY, Devereux RB, Roman MJ y cols. *J Cardiovasc Comput Tomogr* 2008;**2**:298-308 —
  citada para la **tomografía y la resonancia**, no para el eco.

---

## 5 · Cobertura

`TC-591` la sección y su globo · `TC-592` la tarjeta · `TC-593` la conclusión y la pastilla ·
`TC-594` el Z. Fichas en `docs/mapa/tests-fichas-591.md`.

Mutaciones: `scripts/_mut_marfan2.py`, **dieciocho**, cada una declara su caso; cuatro **no
revierten nada: la aplican de más**, porque las condiciones que las matan son controles negativos.

Sondas: `_probe_marfan2inv` (inventario y la tarjeta en cinco anchos) · `_probe_marfan2tarj`
(los cuatro globos y las diecinueve definiciones) · `_probe_marfan2z` (el campo y su round-trip)
· `_probe_marfan2ab` (A/B contra HEAD, con `--pdf` para el PDF y el PPT reales) ·
`_probe_marfan2wk` (los dos motores).

⚠️ **El suite corre Chrome a 756 px**, o sea en la maquetación de celular: lo lado a lado y el
«entra en 1440×900» los miden las **sondas**, y los casos miden la **regla** de la hoja de estilos
y la **estructura**. TC-592 (B7) fija además el techo a ese ancho: HEAD daba 1850 px.
