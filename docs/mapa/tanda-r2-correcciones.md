# Tanda «R2» — las nueve correcciones del 21/10/2026

Mapa de la tanda que alinea a las guías lo que ya existía, retira lo que no tenía fuente y cierra
los **dos defectos que el R dejó**: los dos pasaban los tests y fallaban en la pantalla real.

**No está por línea a propósito**: la línea cambia en cada edición, el nombre de la función no.

---

## 0 · La regla que gobierna la tanda, y por qué hay una regla nueva

El R escondió dos opciones de un `<select>` con `<option hidden>` y su sonda, que miraba el
**atributo**, lo dio por bueno. Dos cosas que ninguna medición de atributo podía ver:

- ⚠️ **WebKit PINTA una `<option hidden>` en la lista nativa.** `getComputedStyle` devuelve
  `display:none` en los dos motores y Safari la muestra igual: el motor no está obligado a
  respetar el layout de las opciones de un desplegable nativo.
- ⚠️ **Y EN LOS DOS MOTORES LA BÚSQUEDA POR LETRA LA ALCANZA.** Apretando «d» seis veces el
  recorrido pasa por las dos escondidas, así que también en Chrome el médico podía ELEGIRLAS.

De ahí la regla de esta tanda: **lo que se mide es lo RENDERIZADO y lo que el control OFRECE**, no
el atributo ni el fuente. `TC-508` cuenta las opciones por lo que están en el `<select>`, y
`scripts/_probe_r2wk.mjs` las corre con **teclas y clics reales en Chrome y en WebKit**.

⚠️ **EL CUERPO DE UN CASO NO PUEDE MANDAR TECLAS DE CONFIANZA.** Corre dentro de la página, sin el
canal del protocolo, y un `KeyboardEvent` construido a mano no activa la escritura nativa de un
`<input>` ni la búsqueda por letra de un `<select>`. El reparto es el de TC-460 y TC-463: el caso
usa `__t.set` y el gesto equivalente, y las teclas reales van en la sonda.

---

## 1 · E1 · El derrame pericárdico: cinco opciones y tres bordes de traducción

**Dueño del desplegable:** `<select id="pericardio">`, y su `value` **ES su texto** —es lo que
viaja en `campos` y lo que exporta el Excel—.

Las cinco vivas, en orden: `Normal, sin derrame` · `Derrame leve (<10mm)` ·
`Derrame moderado (10-20mm)` · `Derrame severo (>20mm)` · `Engrosamiento / calcificación`.

Las dos viejas —`Derrame mínimo` y `Derrame leve (5-10mm)`— **se van del marcado**, no quedan
escondidas. Y como el `value` es el texto, un token viejo quedaría huérfano: se traduce en **tres
bordes**, y cada uno existe por un motivo distinto.

| borde | dueño | qué pasa sin él |
|---|---|---|
| las dos rutas de restauración y la reimpresión | `_migrarCamposLegacy` | el `<select>` queda en `selectedIndex -1` y el estudio **reabre con el campo vacío**, perdiendo el dato que su propio papel afirma |
| el importador de Excel | `LAB_XLS_LISTAS` con `.concat(LAB_XLS_LISTAS_LEGADO.pericardio)` | para una columna de opción un valor desconocido descarta la **FILA ENTERA**, y «Derrame mínimo» es el valor que trae cada fila de cada backup anterior |
| el grado que el papel y el Laboratorio leen | `dptTamano` | ya mandaba los dos a `leve`, así que no hubo que tocarlo |

⚠️ **`LAB_XLS_LISTAS_LEGADO` SOLO DECLARA; NO ES LO QUE EL IMPORTADOR LEE.** Esa tabla existe para
que el segundo sentido de `_labXlsAssertListas` no grite por una `<option>` que ya no está.
`_labXlsLista` lee **únicamente `LAB_XLS_LISTAS`**, así que los dos legados tienen que estar en la
lista **VIVA**: con la primera versión de este commit, que sólo los declaraba, la medición del
importador devolvió `null` para «Derrame mínimo». **Lo cazó medir el importador, no leer el
código.** La lista viva tiene **7** entradas: las 5 vivas + los 2 legados de entrada.

**No se migra nada en disco.** La traducción es en memoria y el registro guardado queda como está.

⚠️ **EL INFORME YA TRADUCÍA «mínimo» A «leve» Y NO SE TOCÓ**, por orden expresa.

**El filtro de cohorte sigue a las categorías:** `coh-dpt-tam` pierde su `<option value="minimo">` y
la lista de `_labCohorteOk` pasa a `['leve','moderado','severo']`. Con la opción puesta, el panel
ofrecía filtrar por un grado que ningún estudio nuevo puede tener.

---

## 2 · E2 · La sección VAB se repinta con el gesto de la pastilla

**El defecto pasaba los tests y fallaba en la pantalla.** La función dueña
(`vabFuncionDerivada`) estaba bien y el oyente de documento del Y3f3 también: lo que faltaba es que
**el gesto de la PASTILLA no pasa por ningún `input` ni `change` de un control de la sección**, así
que nada la repintaba. El médico prendía «estenosis aórtica» y la sección seguía mostrando el
estado del gesto anterior.

**El arreglo va en el DUEÑO DEL GESTO y no en la pantalla:** al final de `toggleValvPill`, que es
la **única** puerta por la que pasa todo cambio de pastilla —censadas las cinco: el `onclick` del
marcado, el auto-prendido, el auto-apagado, `cargarValvPills` y `valvAutoAbrirCajones`—. Nada
escribe `btn-primary` fuera de ahí.

```js
if (valvula === 'aortica' && typeof vabSync === 'function') { try { vabSync(); } catch (e) {} }
```

⚠️ **ACOTADO A LA AÓRTICA Y EN `try`:** la sección VAB sólo depende de esa válvula, y un
`ReferenceError` en la cola del dueño de las pastillas se llevaría **todas** las ocho.

⚠️ **CÓMO MEDIRLO SIN UN FALSO:** la condición **no** puede llamar a `vabSync()` a mano. Si la
llamara, pasaría igual contra el árbol roto. TC-508 (D1/D2) lee el estado **antes** del clic,
clickea, y vuelve a leer **sin** sincronizar.

⚠️ **Y EL ESTADO SE CAPTURA DENTRO DE CADA ESCENA.** La segunda escena limpia el formulario, así
que leer al final mide la escena de la insuficiencia creyendo medir las dos: mi primera versión lo
hacía y la condición salió **al revés** (`sgEa=false sgIa=true`).

---

## 3 · E3 · Los seis puntos de la probabilidad de HTP

Un dueño único, **`_htp2022Core(S)`**, que toma `{num, txt, chk}` — por eso se puede medir **puro**,
con una fuente sintética, sin tocar el DOM. Lo consumen `calcHTP2022` (la pantalla) y
`_hfSrcCampos` (un estudio **archivado**, desde el panel de cohorte).

**Las tres constantes nuevas, declaradas ANTES de quien las nombra** (zona muerta de `const`):
`HTP_VRT_BAJA_MAX = 2.8` · `HTP_VRT_MEDIA_MAX = 3.4` · `HTP_AP_MM_MIN = 25`.

| punto | antes | ahora | fuente |
|---|---|---|---|
| borde de la VRT | `< 2.8` → el **2,8 exacto** caía en media | `<= 2.8` → cae en **baja** | ESC/ERS 2022, Figura 5, folio 28 |
| VRT no medible sin signos | `INDETERMINADA` | **`BAJA`** | la misma figura: sin VRT y sin signos la probabilidad es baja |
| «VD basal > 41 mm» | contaba en la categoría A | **sale del conteo** | Tabla 10: en la A van la relación VD/VI y el TAPSE/PSAP, no el diámetro basal solo |
| TAPSE/PSAP < 0,55 | no contaba | entra en la **A** | Tabla 10, columna «A: Ventrículos» |
| colapso de la VCI < 20 % | no existía | entra en la **C** (`htp2022_c_col20`) | Tabla 10, columna «C: Vena cava y aurícula derecha» |
| «AP > aorta» y «AP > 25 mm» | un solo signo | **DOS** (`htp2022_b3ao` y `htp2022_b3`) | Tabla 10, columna «B: Arteria pulmonar» |

⚠️ **EL COLAPSO DE LA VCI NO ALCANZA SOLO:** la categoría C pide la VCI **dilatada** más el signo.
Medido por los dos lados en TC-508 (E8/E9).

⚠️ **LOS DOS RÓTULOS DE LA VRT SIGUEN AL CORTE.** Con `< 2.8` y `2.8-3.4` el cuadro publicaba DOS
bandas que se pisan en el 2,8 y ninguna que lo contenga. Hoy son `≤ 2.8` / `2.9–3.4` / `> 3.4`, los
de la Figura 5. **El rótulo y la comparación son dos líneas distintas**: TC-508 (E12) compara el
texto IMPRESO contra el lado del borde que vota.

**El modo automático del diámetro de la AP:** `HTP_AP_AUTO` + `htpApSync()`, con un oyente de
documento sobre `_HTP_AP_ORIG`. Lleva las **dos columnas** —`RECALC_MODULOS` (después de
`vdViSelSync`) y el final de `limpiarCampos`—, porque ningún barrido genérico alcanza un `<div>` de
estado que no termine en `-aviso`.

⚠️ **LO QUE SIGUE ABIERTO Y SE DECLARA:** con la VRT en «no medible» y **cero** categorías, el
informe sigue callando. Es la compuerta PREEXISTENTE y esta orden no la autoriza a tocar.

---

## 4 · E4 · El e′ medial de constricción/restricción, en tres tramos

`CVR_ESEP_CONSTR_MIN = 8` y `CVR_ESEP_RESTR_MAX = 6`, y la fila vota **`> 8` constricción**,
**`< 6` restricción** y **6 a 8 ninguno de los dos**.

El tramo del medio es un voto **nuevo** (`'m'`), y por eso hubo que tocar dos lectores: la celda de
`cvr-tabla` —que pasa a dibujar **`◐`** cuando el voto es `'m'`— y la hoja del PDF, que ganó su
rama. **Con uno solo, la pantalla y el papel firmado graduarían distinto el mismo número.**

```js
voto: d => d.esep > CVR_ESEP_CONSTR_MIN ? 'c' : (d.esep < CVR_ESEP_RESTR_MAX ? 'r' : 'm')
```

⚠️ **LOS DOS BORDES CAEN EN EL TRAMO DEL MEDIO**, porque los dos operadores son estrictos: el **8**
no vota constricción y el **6** no vota restricción. Medido por sus cinco valores (9, 8, 7, 6, 5).

⚠️ **`cvr-esep` PUBLICA EL VALOR Y NO EL VOTO.** El voto está en el HTML de `cvr-tabla`: para
medirlo hay que extraer la fila por su rótulo y leer el glifo.

---

## 5 · E5 · El espesor relativo suma el septo, y el criterio por eco alcanza UN camino

**El espesor relativo** pasa de `(2 × pared posterior) / DDVI` a **`(septo + pared posterior) /
DDVI`** (García-Pavía 2021, Tabla 2, folio 1558). Entra el campo `rwt-septo` y `_AM_CALC.rwt` pasa a
declarar sus insumos por lista:

```js
_AM_CALC.rwt = { ins:['rwt-septo','rwt-pp','rwt-ddvi'], calc:(a,b,c) => c ? (a+b)/c : null }
```

⚠️ **ESTE DEFECTO FUE MÍO Y LO CAZÓ LA MEDICIÓN, NO LA LECTURA.** Cambié los insumos y dejé el
cuerpo de `calcRWT` con la cuenta vieja, así que el septo asimétrico seguía dando el valor de la
pared duplicada. **El `assert` de mi script de edición pasó porque el fragmento que buscaba
existía.** Lo destapó la escena de **septo 18 / pared 11 / DDVI 50**: con la fórmula vieja da
**0,44** y con la nueva **0,58**.

⚠️ **UNA ESCENA CON SEPTO IGUAL A LA PARED NO PRUEBA NADA**: las dos fórmulas dan el mismo número.
TC-508 (G2) la usa justamente como CONTROL.

⚠️ **`rwt-result` ES UN `<input>` Y SE LEE POR `.value`.** `rwt-val` es el nodo del **score** y con
`textContent` devuelve «—» siempre: mi primer lector leía ése y daba el defecto por presente sobre
un cálculo correcto.

**El criterio por eco alcanza por UN camino**, no por los dos: García-Pavía 2021, Tabla 2, folio
1558, literal «Unexplained LV thickness (>=12 mm) **plus 1 or 2**», donde 1 son los criterios
cualitativos (`>=2 of a, b, and c`) y 2 el score (`>=8 points`).

```js
} else if (hvi && (pts >= 8 || cualCount >= 2)) {
```

⚠️ **LA HVI ≥ 12 mm SIGUE SIENDO CONDICIÓN DE LAS DOS VÍAS**: es el «plus» de la frase.
⚠️ **Y EL RÓTULO NOMBRA EL CAMINO Y NO EL SCORE**: por la vía cualitativa el puntaje puede ser 3, y
«Score ALTO (3/10)» se lee como una contradicción en la pantalla. De ahí
«Criterio por eco ALCANZADO (score N/10)» cuando `pts < 8`.

**Las citas:** el algoritmo pasa a nombrarse «Documento de posición del Grupo de Trabajo de la ESC
sobre Enfermedades Miocárdicas y Pericárdicas (García-Pavía, 2021)»; «VPP 100 %» pasa a
**«especificidad cercana al 100 %»** (folio 1556, con proteínas monoclonales negativas); y el ⓘ
declara que el score **no tiene validación externa** («not yet externally validated», folio 1556).

⚠️ **«ESC 2021» SALIÓ COMO ATRIBUCIÓN EN LAS DIEZ, Y EL COMMIT 5 SOLO HIZO LA MITAD.** El commit 5
cambió el bloque del ALGORITMO y la línea de Fuentes y quedaron **diez** lugares con el sello viejo:
cuatro de pantalla, el `interp` de `calcETT`, los dos `L.push` del texto que se integra al informe,
el título de la hoja, el encabezado del PDF y el título del PPT. **Dejar la mitad era peor que no
tocar nada**: la app publicaba «García-Pavía 2021» en el algoritmo y «ESC 2021» en el score del
mismo paciente. Se cerró en el commit 10, con TC-67 y TC-68 adaptados.
**Es un cambio de ROTULO:** ni un corte, ni la banda 5-7, ni el campo `sparkling`, ni la ecografía
tisular, ni una frase clínica se mueven — el número de puntos, la categoría y la interpretación
salen idénticos, medido.
⚠️ **El encabezado del PDF va SIN TILDES** («Garcia-Pavia 2021»), igual que su otra rama
(«Algoritmo diagnostico»): es un `doc.text` directo y no se hace depender de WinAnsi.

---

## 6 · E6 · Cardio-oncología

| qué | antes | ahora | fuente |
|---|---|---|---|
| SGL alterado | `>= 15 %` → el **15 exacto** votaba | **`> 15 %`** | ESC 2022 (Lyon), folio 4259 |
| dosis de alto riesgo de antraciclinas | 400 mg/m² | **`250` mg/m²** (`CO_DOSIS_ALTO_RIESGO`) | la misma |
| eco con antraciclinas | cada 3 ciclos | **cada 2 ciclos** + a los 3 y 12 meses de terminar; **biomarcadores cada ciclo** | la misma |
| calculadora de riesgo basal | se llamaba HFA-ICOS | **«calculadora propia de EcoSmart, no es el HFA-ICOS»** en los tres lugares | sus pesos y cortes **no se tocaron** |
| columna «Acción» de la Referencia rápida | existía | **sale entera** | criterio de producto: la pantalla describe |

Dueño del corte del SGL: **`_ctrcdGlsAlterado(rel)`**, una línea, con `CO_UMBRAL_GLS_REL`.
TC-508 (H1) mide el **15 exacto por sus dos lados** y (H2) que sin dato no vota.

⚠️ **EL ANTI-HER2 YA COINCIDÍA Y NO SE TOCÓ**, por orden expresa, igual que las filas de
inmunoterapia, antiangiogénicos y radioterapia (salvo la columna retirada).

---

## 7 · E7 · Eco pulmonar

**El síndrome intersticial difuso lo deciden las ZONAS:** `PUL_ZONAS_DIFUSO_MIN = 2` y
`PUL_ZONAS_LADO` (los tres checkbox de cada hemitórax), con el dueño **`pulAvDifuso()`**:

```js
return { difuso: (d >= PUL_ZONAS_DIFUSO_MIN && i >= PUL_ZONAS_DIFUSO_MIN), der: d, izq: i };
```

⚠️ **«POR HEMITÓRAX» ES EN CADA UNO, Y ESO ES LO QUE SEPARA DIFUSO DE FOCAL.** Dos zonas de un lado
solo es unilateral, y un síndrome intersticial difuso es bilateral por definición. TC-508 (I2) lo
fija como control negativo.
⚠️ **Y CON NADIE MARCADO DEVUELVE `null`, NO `false`:** «no se evaluó» no es «no es difuso», y el
patrón se nombra entonces **sin adjetivo**.

**«Edema alveolar» sale del rótulo** de las líneas B coalescentes: lo que las fuentes publican de
ese patrón es la DESCRIPCIÓN y su grado de aireación. Hoy dice «Líneas B coalescentes».

**El PUNTO PULMÓN entra como signo** (`pua_punto`, tres estados) con sus tres ramas de neumotórax.
⚠️ **EL PULSO PULMONAR NO SE AGREGÓ**, por orden expresa.

⚠️ **LAS SEIS ZONAS SON CHECKBOX, NO SELECTS**, y la CANTIDAD de líneas B vive en
`pua_lineasb_cant` (`focal` / `multiples` / `coalescentes`) y no en `pua_lineasb`, que sólo dice si
están. Con un `SEL` sobre un checkbox el valor se escribe y el `checked` no se mueve: `pulAvDifuso`
contaba **cero** y la tabla decía «no es difuso» sobre un mecanismo que funciona.

---

## 8 · E8 · Hemodinámica

**Los rótulos declaran que son estimaciones por eco, con su autor:** «PCP estimada por eco
(Nagueh)» y «RVP estimada por eco (Abbas)», en la cápsula, en la lista de pares de
`amiloTextoHemo`, en los perfiles, en el rótulo de Forrester y en las dos filas de `ao-ref`.
**Las dos se calculan IGUAL**: no se movió una fórmula.

**El índice cardiaco pasa a DOS bandas** (`_icBanda`): **`<= 2.2` bajo** · `<= 4.0` normal ·
`> 4.0` elevado. Se va el tramo «límite» de 2,2 a 2,49, que no salía de ninguna fuente.
⚠️ **EL 2,2 CAMBIA DE LADO:** con `< 2.2` el valor exacto era «límite» y hoy es «bajo».
⚠️ **`FORR_IC_CORTE` SIGUE SIENDO EL MISMO NÚMERO Y EL FORRESTER NO SE TOCÓ**: el 2,2 es su borde
inferior y eso era deliberado desde antes.
Rango normal 2,5-4,0 (ESC/ERS 2022) y el «bajo ≤ 2,2» en el ⓘ.
⚠️ **EL CONSENSO SAC 2024 NO ESTÁ EN LA BIBLIOTECA**, censada: no se inventó folio, y el «bajo
≤ 2,2» se declara como el corte que la app ya aplicaba.

**La RVS publica el NÚMERO sin rótulo de banda:** se retiran los 800 / 1200 / 1400 de la cápsula.
⚠️ **Y SE VA TAMBIÉN EL COLOR, no sólo la palabra: el badge entero sale.** Un color sin rótulo
seguiría afirmando la banda —y la regla de la casa es que el color nunca es lo único que informa—.
⚠️ **`_rvsBanda` NO SE TOCA, Y ES LO QUE PROTEGE AL POSOPERATORIO:** de esa función cuelga la
VASOPLEJIA del POP (RVS < 800), que esta orden excluye expresamente, y la leen también el SVRI del
PiCCO y la cápsula del Swan. Lo que se saca es el USO del rótulo acá, no la función. TC-508 (J3) lo
fija por sus cuatro bandas.

⚠️ **`hemo_vs` Y `hemo_pvc` SON READONLY:** el volumen sistólico deriva del TSVI
(`diam_tsvi` + `itv_tsvi`) y la PVC de la VCI. Tipear ahí no es un gesto y la escena mediría un IC
que nunca se calculó — mi primera versión lo hacía y el DENOMINADOR salió en «—».

---

## 9 · E9 · La orejuela no afirma elegibilidad ni deriva al Heart Team

Se retira **«Posiblemente apto — evaluar Heart Team»**. Era una CONDUCTA y una afirmación de
elegibilidad; lo que queda es el hecho medido: **«Ostium dentro del rango de los dispositivos
(17-32 mm)»**.

⚠️ **CENSADO ANTES DE TOCAR: aparecía en UN SOLO lugar**, `calcOAI`, escrito en el nodo
`oai-elegibilidad`, que tiene **un único lector** —su propio marcado de pantalla—. No lo leen el
informe, el EN SUMA, el PDF ni el PPT por ningún camino.

**Lo que la orden excluye sigue en su lugar, y está medido:** los rangos de Watchman (17-31 mm) y el
máximo de Amulet (32 mm) en las notas de la sección, y el «contraindicación cardioversión» del
trombo. El ateroma, el Wilkins, la reparabilidad mitral, la escala de la orejuela y los 40 y 20 cm/s
no se tocaron, y los otros «Heart Team» de la app —los del TEER y los de la VAB— tampoco: son otra
zona y otra orden.

---

## 10 · Cómo medir esta zona

```bash
node scripts/test_clinico.mjs --solo TC-508          # las 71 condiciones
node scripts/_probe_r2wk.mjs --dest /tmp/r2cap       # Chrome y WebKit, teclas y clics reales
node scripts/_probe_r2ab.mjs --file /ruta/index.html # volcado de superficies para el A/B
node scripts/_ab_r2diff.mjs /tmp/a.json /tmp/b.json  # el comparador
```

**Las puertas de cada zona** (sin abrirlas, el campo existe y mide 0×0):

| zona | cómo se llega |
|---|---|
| derrame | `showTab('otros')` + la sección de pericardio |
| VAB | `showTab('valvulas')` + `toggleEteSeccion('valv-aortica')` |
| HTP | `showTab('hemodinamica')` |
| constricción/restricción | `showTab('ete')` + `toggleEteSeccion('constr-restr')` |
| amiloidosis | `showTab('amiloidosis')` |
| cardio-oncología | `showTab('x')` → su subtab |
| eco pulmonar | `showTab('pulmonar')` |
| orejuela | `showTab('ete')` + `toggleEteSeccion('oai')` |

⚠️ **TRES TRAMPAS DEL REPO QUE ESTA TANDA VOLVIÓ A PAGAR.**
1. **El acento grave dentro del cuerpo de un caso o del template de una sonda** — 54 veces en esta
   tanda, todas en comentarios míos nombrando una función en prosa. `scripts/check_backticks.py` da
   la línea exacta en el cuerpo de un `caso(...)`; **no alcanza el template de una sonda**, y ésos
   los da `node --check`. **Correr los dos.**
2. **Un `assert` que falla en un script de edición NO APLICA NADA**, porque la escritura va al
   final — y el paso siguiente informa «SINTAXIS OK» sobre un archivo sin los cambios. Pasó dos
   veces. **Verificar con `grep` que la edición quedó.**
3. **Un `grep -c` que devuelve 0 sale con código 1 y corta una cadena `&&`**: el cierre del commit
   9 se quedó sin Semgrep ni `git commit` por eso, con la edición ya aplicada.
4. ⚠️ **UNA NOTA CON ACENTOS GRAVES DENTRO DE `ECO_AYUDA` CORROMPE EL MANUAL SIN ROMPER EL PARSEO.**
   Un comentario `<!-- -->` dentro del HTML de la tabla de criterios declarados —que vive en un
   **string** de `ECO_AYUDA`— con dos acentos graves adentro: cero errores de sintaxis, cero errores
   de consola, y la suite completa con **SIETE** casos en rojo. Dos de ellos cuentan las pestañas y
   las clases `m*` del manual (TC-123, TC-149) y **cinco son de la MITRAL y de VÁLVULAS** (TC-298,
   TC-307, TC-333, TC-335, TC-468), porque buscan su propio texto en `ECO_AYUDA`.
   **`ECO_AYUDA` es un string que el armador del PDF aplana por REGEX**, así que un comentario HTML
   ahí dentro le mueve el conteo de páginas. Una nota de código va **al lado del dueño del dato**,
   no dentro del manual.

---

## La tanda «E» volvió sobre los seis puntos de HTP (2026-10-22)

El R2-E3 fijó los **seis puntos de la probabilidad ecocardiográfica** —el 2,8 inclusivo, la VRT no
medible, el «VD basal > 41 mm» retirado del conteo, el TAPSE/PSAP en la A, el colapso de la VCI en
la C y los dos signos de la AP con su modo automático y manual—. **La tanda E no movió ninguno**:
los once signos pasaron a una TABLA con su categoría, su corte y su ESTADO, el informe aprendió a
hablar cuando la VRT «no medible» la ELIGIÓ el médico, y el PDF pasó a listar sólo los presentes.

`htpApSync` sigue siendo el dueño único de las dos casillas de la AP y **no se tocó**.

Detalle en **`docs/mapa/htp-hfapeff.md`**.

---

## ⚠️ La tanda J movió esto (2026-10-24) — el mapa está en otro archivo

El colapso de la aurícula derecha pasó a ser **diastólico** con su duración (`dpt_col_ad_dur`,
corte `DPT_COL_AD_DUR_SIG` = 0,34), la plétora de VCI del pericardio bajó a **>20 mm**
(`DPT_VCI_PLETORA_MM`), la constricción perdió el aviso de confirmación invasiva y ganó el
cociente de la vena suprahepática (`cvr_hep_coc`, `CVR_HEP_COC_MIN` = 0,78), VEXUS pasó a usar los
**dos** operadores del artículo (`VEXUS_VCI_MM`, con `≥` para el grado 1 y `>` para el 2 y el 3) y
perdió sus frases de conducta, y entraron **tres Evidencias nuevas** más la ficha de Referencias
de constricción.

**Todo eso está en `docs/mapa/j-pericardio-constriccion-vexus.md`.** Acá no se repite.

---

## Qué de lo que dejó el R2 tocó la tanda «J2» → otro mapa

Puntero. El relato vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`**.

| Lo que dejó el R2 | Qué hizo el J2 |
|---|---|
| **R2-E8**: dos bandas de IC donde había tres, el 2,2 inclusive | **no se tocó**; el globo ⓘ nuevo declara que la definición original usa «por debajo de 2,2» y que el 2,2 exacto cae de lados distintos |
| **R2-E8**: la RVS publica el número sin banda ni color | **no se tocó**; el globo ⓘ publica las dos referencias y por qué no hay un rango único |
| **R2-E8**: `_rvsBanda` intacta, que protege al posoperatorio | **no se tocó**; TC-533 (B2) lo fija en los cuatro bordes |
| **R2-E6**: la columna «Acción» retirada entera | **sigue retirada**; medido en HEAD antes de tocar nada |
| **R2-E5**: «ALTO» con un solo camino —score ≥8 **o** 2 de 3 cualitativos— | **no se tocó**; lo que sale son los tramos de abajo |
| **R2-E7**: el adjetivo «difuso» decidido por las zonas | **no se tocó**; se corrige la ATRIBUCIÓN de ese corte, que decía Figura 4C y es la Figura 3C |
| **R2-E7**: el punto pulmón con las palabras de la fuente | **no se tocó**; entra a la ficha con su enunciado, el D2_2.1 |
