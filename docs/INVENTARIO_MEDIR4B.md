# INVENTARIO MEDIR-4b — el Simpson biplano del visor (TAREA 0, solo lectura)

Línea base **`74df0b6`** (cierre de MEDIR-4a), sello **`v20261115-0250`**, md5 **`359755ea`**,
**182.653** líneas — los tres verificados con `git log`, `md5 -q` y `wc -l`, y el sello del pie
coincidiendo con el que `CLAUDE.md` publica. `git status -sb` sin «ahead». Pendrive montado en
`/Volumes/DISK_IMG`.

**Este documento no toca `index.html`.** Lo que no se midió se dice.

La sonda es `scripts/_probe_medir4b0.mjs`, Chrome 1500×900, **por el camino real**: el visor se
abre con `_cineAbrir`, la medición con el botón, la vista B con **`vistaBAbrir()`** —la puerta del
médico— y se elige con un **clic sobre la miniatura** del selector. Lo único sustituido es el
**almacén** (`CeiboCine.listar`, `_cineLoopDeDisco`, `CeiboImg.leer`). Los trazados son
`mousedown` / `mousemove` / `mouseup` reales sobre el canvas de medición, con el mismo triángulo
isósceles de TC-190. **Cero errores de consola y de página.**

---

## Las cinco hipótesis de la orden, medidas

| | Hipótesis | Veredicto |
|---|---|---|
| **H1** | «cruza las dos vistas al vuelo y NO guarda los trazados ni el resultado entre vistas» | **MITAD CONFIRMADA, MITAD FALSA** |
| **H2** | «la ventana (A4C o A2C) se pide en cada trazado y no una sola vez» | **FALSA** |
| **H3** | «los trazados viven en un estado que hay que localizar» | **FALSA** |
| **H4** | «la app ya calcula VFD, VFS, FEVI y los indexados, y ya tiene una clasificación de la FEVI» | **CONFIRMADA** |
| **H5** | «el botón y lo que escribe (`_simpEscribirFEVI`, `medVtiDiametro`, `medVtiCargar`) funcionan hoy» | **CONFIRMADA en su mitad, y DOS de las tres funciones NO son del Simpson** |

### H1 — el cruce es al vuelo (cierto), pero los trazados SÍ se conservan (falso)

**Lo cierto:** `_vBiplanoDatos()` **calcula al vuelo** y no guarda nada. Las claves de una sesión
de Simpson son exactamente **nueve** —`vista`, `fase`, `pares`, `nombres`, `pendiente`, `res`,
`avisoCuadro`, `ocultar`, `integrada`— y **ninguna** es el biplano cruzado. Medido: dos llamadas
seguidas dan el mismo número (`biplanoEstable: true`) y el `res` **propio** de cada sesión sigue
diciendo `bi:false` —monoplanar— mientras el cruce da 58,145 %.

**Lo falso:** los trazados **no se pierden**. `simp` es un campo de la **plantilla de vista**
(`_vNueva`), así que cada vista conserva los suyos mientras está abierta, y los dos pares
**coexisten**: medido con los cuatro contornos puestos, `paresA[0] = {d:true, s:true}` **y**
`paresB[0] = {d:true, s:true}` a la vez (`losDosAlaVez: true`).

**Lo que de verdad falta** no es guardar: es que el cruce **se declare y se presente**. Ver **X1**.

### H2 — nada se «pide»: el selector es un control persistente

**Cero cuadros de diálogo** en todo el camino de trazar y confirmar, y los tres caminos lo
confirman por código: `_simpAceptar`, `medSimpsonConfirmar` y `medSimpsonElegirVista` **no
contienen** un `confirm(` ni un `prompt(`.

Lo que hay es un **selector persistente de dos botones** —«A4C» y «A2C»— dibujado **siempre** en
el panel único (`_simpUniSelector`), que el médico puede tocar en cualquier momento. La sesión nace
con la ventana **sin declarar** (`nombres: [null, null]`) y el panel lo dice: «sin declarar — se
rotula por cantidad».

**El hueco real, entonces, es otro:** la ventana es **opcional** —nunca se exige— y se puede
**cambiar a mitad de un par**, entre la diástole y la sístole. El bloque A tiene que elegirla
**una vez al abrir la herramienta**, que es lo que la orden pide; no hay ningún prompt que sacar.

### H3 — no hay nada que localizar: es estado por vista, declarado al lado de la calibración

`Object.keys(_vNueva(...))` trae **`simp`** junto a `medCalib` y `medCalibVel`, y el descriptor de
`window._simp` es un **accesor** (`get` y `set` funciones, `value` ausente) que resuelve contra la
vista activa. O sea: el Simpson ya es por vista, igual que la calibración, y por el **mismo**
mecanismo. La trampa que `CLAUDE.md` documenta —un `let` de módulo que parece por vista— **no
aplica acá**; la que sí la tenía era el cajón de medidas (`_dop` / `_d2`), y eso es **M4a-c**.

### H4 — confirmada, y éstos son los dueños que el bloque C tiene que reusar

| Qué | Dueño | Medido |
|---|---|---|
| Volumen por discos | `_simpVolumenML(a4cm, a2cm, Lcm)` | Σ(a·b)·π/4·(L/N), `SIMP_N` = 20 discos |
| Monoplanar de un par | `_simpMonoDeS(S, i)` | disco circular (b=a); devuelve `vfd`, `vfs`, `vey`, `fevi` |
| Biplano de una sesión | `_simpCalcular()` | L = la más larga de las dos; devuelve además `bi` e `imgs` |
| Biplano entre vistas | `_vBiplanoDatos()` | cruza `pares[0]` de A con `pares[0]` de B |
| **VEyec** | **ya existe**: `vey: vfd - vfs` en `_simpMonoDeS` y en `_simpFilasVivas` | no hay que restar nada nuevo |
| Indexado mL/m² | `getBSA()`, el dueño único de la app | 70 kg / 170 cm → **1,8181 m²** |
| Clasificación | `_simpClasificar` → `feviClasificar` → `FEVI_CATS` | ver abajo |

**`FEVI_CATS`, tal como la app la usa hoy** (el bloque C **no inventa cortes**):

| adj | min | color |
|---|---|---|
| normal | ≥ 50 | `#22d36a` |
| levemente reducida | ≥ 41 | `#fbbf24` |
| moderadamente reducida | ≥ 30 | `#fb923c` |
| severamente reducida | — | `#f87171` |

Comprobada en cuatro puntos: 65 → normal · 52 → normal · 41 → levemente reducida · 28 →
severamente reducida.

**Los indexados YA están en la tabla** (`_simpTablaHTML`, desde MEDIR-2): siete columnas
numéricas, y sin peso o sin talla las de mL/m² **no se dibujan** y la tabla lo dice.

### H5 — el botón funciona; dos de las tres funciones que la orden nombra no son del Simpson

`_simpEscribirFEVI(fevi)` escribe **`fevi`** y **`fevi_met`** (a «Simpson biplano»), y **pregunta
antes de pisar** un valor cargado. Medido por el camino real: con el biplano en 58,145 % se apretó
el botón y el campo quedó en **«58»**, con el método en «Simpson biplano».

⚠️ **`medVtiDiametro` y `medVtiCargar` existen pero NO tienen nada que ver con el Simpson**: son
las funciones del **VTI y del diámetro** del cajón Doppler (líneas 147779 y 147792), y no aparecen
en ningún camino del Simpson. La orden las agrupa con el botón de integrar; **no corresponde**.
Esta tanda no las toca igual, porque la orden lo prohíbe.

**Las DOS puertas que llegan a `_simpEscribirFEVI`**, y hay que conservarlas las dos:
- **`cine-biplano-integ`** — el cruce A × B, en `_vBiplanoPintar`. Medido: existe y es el que se
  apretó.
- **`cine-simp-integ-u`** — el biplano trazado **dentro de una sola vista** (las dos ventanas en
  la misma vista cambiando de cineloop), en `_simpUniCabecera`. Medido: **no** aparece cuando el
  cruce A × B existe, a propósito —serían dos botones para el mismo número—.

---

## X1 — EL CRUCE IGNORA LA VENTANA DECLARADA, Y ES UN DEFECTO DE HOY

Esto no estaba en las hipótesis de la orden: lo encontró la lectura y lo confirmó la medición.

`_vBiplanoDatos()` cruza **`pares[0]` de la vista A con `pares[0]` de la vista B, por POSICIÓN**:
su propio comentario lo dice —«el de la vista A hace de 4C y el de la B de 2C»—. **No mira
`nombres` en ningún momento.**

**Medido, declarando `a4c` en las DOS vistas:**

| | valor |
|---|---|
| `nombresA` | `['a4c', null]` |
| `nombresB` | `['a4c', null]` |
| ¿cruza igual? | **SÍ** |
| FEVI publicada | **58,145 %** — *idéntica* a la del cruce correcto 4C × 2C |
| filas de la tabla | **A4C** 64,0 · **Biplano** 58,1 |
| aviso | **ninguno** |

Y hay un segundo efecto que agrava: `_simpFilasVivas` **deduplica por rótulo**, así que la fila de
la segunda vista —que también se llama «A4C»— **desaparece**. El médico ve **una** monoplanar y un
«Biplano» armado con dos ventanas que son la misma, sin una sola señal.

**Es exactamente lo que la decisión provisoria (b) manda cerrar**, y por eso el bloque B la
implementa como un **defecto a corregir** y no sólo como una función nueva.

---

## (a) Cómo está armado hoy el Simpson en el visor

**La herramienta** es `'simpson'`, una de las de `medHerramienta`, con **cuatro capas** de
compuerta (la cuarta, de MEDIR-4a, la bloquea en una vista de imagen fija: `V.esFija`).

**La sesión** nace en `_simpIniciar()` y vive en `V.simp`:

```
{ vista: 0,                      // ranura en curso: 0 o 1 (DOS ranuras por vista)
  fase: 'd',                     // 'd' diástole, 's' sístole
  pares: [{d,s}, {d,s}],         // los contornos confirmados de cada ranura
  nombres: [null, null],         // la ventana de cada ranura: 'a4c' | 'a2c' | null
  pendiente: null,               // el contorno trazado y SIN confirmar
  res: null,                     // lo que _simpCalcular devolvio
  avisoCuadro: false, ocultar: false, integrada: false }
```

Cada contorno confirmado guarda `pts`, `eje`, `diam` (píxeles, sólo para dibujar), **`diamCm`**,
**`Lcm`**, `cmPorPx` e `imagen`. **Cada trazado lleva la escala de SU imagen** — medido:
`cmPorPx: 0,05`, `Lcm: 10`, `d0: 9,7727`, `imagen: 'A4C-fix'`.

**Las fases y los botones de hoy:**

| Función | Qué hace |
|---|---|
| `_simpAceptar(pts)` | valida el trazado y lo deja en `pendiente`. Rechaza píxeles no cuadrados y ejes de menos de 20 px |
| `medSimpsonConfirmar()` | pasa `pendiente` a `pares[vista][fase]` **y da vuelta la fase** |
| `medSimpsonSegundaVista()` | mueve `vista` a 1 y `fase` a `'d'` |
| `medSimpsonElegirVista(v)` | declara la ventana de la ranura en curso; si ya está en la otra, se va a ésa |
| `medSimpsonReiniciar()` | descarta los trazados de la ranura |

⚠️ **YA HAY UN BOTÓN QUE CONFIRMA Y AVANZA DE FASE**, y es `cine-simp-conf-u` («Confirmar
trazado»). El bloque A **no inventa el mecanismo**: lo que agrega es la **barra de dos pasos con
su tilde** y un rótulo «Listo», y lo que saca es que la ventana se pueda cambiar a mitad de par.

**El reparto de superficies, medido:**

| Superficie | Id | Qué dice hoy | Largo |
|---|---|---|---|
| Panel de cada vista | `cine-med-barra` / `b-cine-med-barra` | sólo la **guía del trazado en curso** | 119 y 200 car. |
| Panel único | `cine-simp-uni` | cabecera, salvedades, tabla, selector y botones | 668 car. |
| Resultado del cruce | `cine-biplano` | el titular A × B y su botón de integrar | 379 car. |

Los dos últimos viven **debajo** de los dos paneles, centrados, y es el lugar que MEDIR-4a dejó
hecho (bloque A de esa tanda).

## (b) Cómo cruza hoy entre las dos vistas, y por qué no guarda el resultado

`_vBiplanoPintar()` llama a `_vBiplanoDatos()`, que:

1. sale si no hay vista B;
2. **comprueba la época de las dos vistas** una por una —que las dos sesiones sean del **mismo
   estudio**—, que es la guarda que evita «una FEVI con la 4C de un paciente y la 2C de otro»;
3. toma `pares[0]` de cada una **por posición** (ver **X1**);
4. L = la **más larga** de las dos, en diástole y en sístole por separado;
5. devuelve `{vfd, vfs, fevi, Ld, Ls}` **sin guardar nada**.

**No guarda el resultado porque no hace falta**: es una función del estado de las dos vistas, y
los trazados ya están guardados en cada una. El bloque B **no tiene que agregar almacenamiento**;
lo que tiene que agregar es la **declaración de la ventana** y el **descarte** al cerrar.

Se repinta desde **seis** sitios, y `_simpUniPintar` cuelga del mismo para no tener que acordarse:
`medSimpsonConfirmar`, `_simpAceptar`, `vistaBAbrir`, `_vCerrarVistaResto`, y dos más en el
sincronizador.

## (c) De dónde salen los números — ver la tabla de **H4**

Ids y zonas, **sin cambiarlos**: `fevi` y `fevi_met` en el formulario; `peso` y `talla` para
`getBSA`; el `hidden` **`simpson_manual`** para la tabla que viaja con el estudio.

## (d) Qué lee y qué escribe el botón de integrar — ver **H5**

Con qué trazados: **sólo biplano**, y no es arbitrario —el campo «Método» ofrece «Simpson
biplano», «Teicholz» y «Visual», y no hay monoplano—. El cruce A × B entra por
`cine-biplano-integ`; el biplano de una sola vista, por `cine-simp-integ-u`.

## (e) Qué dejó listo M4a-f para reusar

Los **seis** puntos que esa entrada enumera, y los seis se confirmaron:

1. `_simp.nombres` **ya** guarda la ventana de cada ranura.
2. `medSimpsonConfirmar` **ya** confirma y avanza de fase.
3. `_simpFilasTabla` **ya** calcula mL y mL/m² por ventana.
4. **`cine-biplano` y `cine-simp-uni` ya están abajo y centrados** — el lugar existe.
5. `_medInfoBoton` + `_MED_INFO` es el mecanismo del ⓘ que MEDIR-3 dejó.
6. El monoplanar **ya** se rotula «monoplanar» en `_simpUniCabecera`.

## (f) Qué pruebas fijan el flujo actual del Simpson

**Veinte casos** lo tocan. Los que lo **fijan** (por cantidad de referencias):

| Caso | Qué fija |
|---|---|
| **TC-190** (63) | FEVI contra un volumen calculable a mano, y L la más larga |
| **TC-192** (32) | la sesión sobrevive al cambio de imagen y cada trazado lleva SU escala |
| **TC-245** (32) | el panel único, y que **el TRAZADO manda sobre el selector** al confirmar |
| **TC-191** (30) | integra sólo el biplano, y el trazado se oculta al reproducir |
| **TC-237** (17) | **la ventana declarada nombra la etiqueta**, y la tabla cierra con el biplano |
| **TC-239** (16) | la tabla viaja con el estudio y no pasa al paciente siguiente |
| **TC-196** (13) | dos vistas: estados ajenos y **Simpson biplano A × B** |
| **TC-895** (11) | el Simpson **bloqueado** en una vista de imagen fija |
| **TC-257** (10) | el cajón 2D (toca el panel) |
| **TC-227** (9) | el resultado quemado en la captura con su método |
| **TC-885** (7) | la tabla publica **mL y mL/m²** indexados |
| **TC-228**, **TC-241** (6) | la etiqueta dice de dónde viene el valor · la tabla cruza las dos vistas |

Y **siete** trazan Simpson sobre fixtures de **un cuadro** —TC-196, TC-227, TC-228, TC-237,
TC-239, TC-241 y TC-245—: es lo que **M4a-d** declara, y es la razón por la que la decisión
provisoria (d) deja eso como está.

**Primer TC libre: `TC-896`.** Medido: **903** casos distintos, **15** de ellos `TC-GR-nn`, y el
numérico más alto es **TC-895**.

## (g) Los textos, advertencias y notas del panel del Simpson

**DIECISIETE** frases distintas, censadas una por una. Doce estaban en pantalla en el momento de
medir; las otras cinco son de ramas que esa escena no alcanzaba (sin BSA, monoplanar, ventana sin
declarar, tabla guardada), y **existen** en el código.

| # | Frase (por su comienzo) | Vive en | En pantalla al medir |
|---|---|---|---|
| 1 | «El método supone que el ápex está bien visualizado…» | `_simpUniTexto` | sí |
| 2 | «No es el promedio de las dos…» | `_simpTablaHTML` | sí |
| 3 | «…producto cruzado de los diámetros…» | `_simpTablaHTML` | sí |
| 4 | «…el eje más largo» | `_simpTablaHTML` | sí |
| 5 | «VEyec = VFD − VFS» | `_simpTablaHTML` | sí |
| 6 | «Todavía NO está en el informe…» | `_simpUniTexto` / `_vBiplanoPintar` | sí |
| 7 | «Indexado por la superficie corporal del estudio…» | `_simpTablaHTML` | sí |
| 8 | «Sólo en mL: falta el peso o la talla…» | `_simpTablaHTML` | no (hay BSA) |
| 9 | «Es monoplanar: asume el ventrículo circular…» | `_simpUniTexto` | no (es biplano) |
| 10 | «La guía recomienda el biplano…» | `_simpUniTexto` | no (es biplano) |
| 11 | «Cada trazado usa la escala de SU imagen» | `_vBiplanoPintar` | sí |
| 12 | **«ASE/EACVI 2015»** | `_vBiplanoPintar` | sí |
| 13 | «La clasificación es la misma que usa el informe» | `_vBiplanoPintar` | sí |
| 14 | «Cada ventana muestra SU monoplanar…» | `_simpTablaHTML` | sí |
| 15 | «…anillo mitral…» (la guía del trazado) | `_simpPanel` | sí |
| 16 | «sin declarar — se rotula por cantidad» | `_simpUniSelector` | no (estaba declarada) |
| 17 | «Los contornos no se guardan…» | `_simpTablaHTML` | no (tabla viva) |

⚠️ **LA FRASE 12 NOMBRA UNA GUÍA EN UNA PANTALLA.** `cine-biplano` imprime «(el más largo de las
dos vistas, **ASE/EACVI 2015**)». La orden de esta tanda dice que los textos de la app no nombran
guías, y `CLAUDE.md` deja la guía, la tabla y el folio **para el globo ⓘ**. **Mudarla al ⓘ lo
resuelve** — y de paso es lo que el bloque C ya tiene que hacer con las notas de método.

**De las diecisiete, las de MÉTODO son las que el bloque C mueve al ⓘ: 1 a 5, 7 a 14 y 17 —
TRECE—.** Quedan en el panel las **cuatro** operativas: la guía del trazado (15), el «sin
declarar» del selector (16) y el «Todavía NO está en el informe» (6), que es la que va **al lado
del botón**. El número definitivo se declara al cerrar el bloque C, con cada frase comprobada
dentro del globo.

---

## Lo que NO se midió, y se dice

- **Safari.** El médico usa Safari y el WebKit de Playwright **no es Safari**. Esta sonda corrió
  en el Chrome del sistema; la verificación de cierre agrega WebKit, y la guía manual
  (`docs/GUIA_PRUEBA_MEDIR4B.md`) es para que Maicol lo pruebe en Safari.
- **El pendrive.** Esta sonda usa un fixture sintético de dos regiones isotrópicas, no un DICOM
  del pendrive. Lo que corre contra archivos reales son TC-190, TC-192 y compañía, en la batería.
- **Los ids duplicados.** El censo crudo devuelve **43**, y los 43 son de los **SVG de matplotlib**
  embebidos en la app (`figure_1`, `patch_1`, `DejaVuSans-Bold-50`…). Son **preexistentes** y no
  tienen nada que ver con abrir y cerrar vistas. El control de la lección 12 tiene que **acotarse
  al visor**, o devuelve 43 siempre y no prueba nada.
- **`localStorage`.** Trazar los cuatro contornos agrega **una** clave, `ecosmart_autosave`, que es
  el autoguardado de la app y no del Simpson. La tabla sí va al `hidden` **`simpson_manual`**, que
  viaja **dentro del estudio** y es lo que ya existía desde MEDIR-2.

## X2 — la línea base numérica, para que el bloque C pruebe que no movió un número

Con el triángulo isósceles de base W y altura H, el monoplanar da `1 − (Ws/Wd)²` y el biplano
`1 − (W2s·W4s)/(W2d·W4d)`. Medido con W4d 200, W4s 120, W2d 180, W2s 126 y H 200:

| | esperado | medido |
|---|---|---|
| FEVI monoplanar | 64,000 % | **64,0175 %** |
| FEVI biplano A × B | 58,000 % | **58,145 %** |
| VFD biplano | — | **235,672 mL** |
| VFS biplano | — | **98,641 mL** |
| Ld / Ls | — | **10,0 / 10,0 cm** |
| BSA | — | **1,8181 m²** |
| Monoplanar de la vista B | — | **51,314 %** |

**Los seis valores de la derecha son el contrato del bloque C**: con los mismos trazados tienen
que dar exactamente lo mismo.

## Decisiones provisorias — cómo está hoy cada una

| | Decisión | Estado HOY |
|---|---|---|
| **(a)** | al cerrar una vista su trazado se descarta y el biplano desaparece; la que queda conserva su monoplanar | **YA PASA.** Medido: `medApagar` anula el `simp` de la cerrada, `_vBiplanoDatos()` devuelve `null`, y la viva conserva su monoplanar en **64,017 %** |
| **(b)** | las dos vistas con la MISMA ventana: mensaje de una línea y cada una su monoplanar | **NO PASA — es X1.** Hoy cruza igual y sin avisar |
| **(c)** | el rótulo «Vista B» de la que queda no se renumera | **YA PASA**, y está declarado en **M4a-a** |
| **(d)** | el Simpson sobre una imagen de un cuadro por otra puerta sigue disponible; las fijas de «+ Vista» siguen sin Simpson | **YA PASA**, y está declarado en **M4a-d** |
