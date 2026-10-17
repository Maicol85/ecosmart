# La tanda «CORTOS» — PARTE 1: los nueve arreglos (2026-10-17)

Mapa de los commits **CORTOS1 a CORTOS9**: prótesis tricúspide y pulmonar, función diastólica,
Laboratorio y PDF. Lo de la pestaña **Otros** (CORTOS10 a 13) está en
`docs/mapa/otros-hallazgos.md`. La ficha del caso que lo cubre, en `docs/mapa/tests-fichas.md` →
TC-499.

---

## 1 · Las dos mudanzas de nodo (CORTOS1 y CORTOS2)

| Qué | De dónde | A dónde | Quién lo muestra |
|---|---|---|---|
| `#bloque-prot-vm-pvl` (origen de la regurgitación protésica mitral) | entre los campos de cuantificación de la IM | **debajo** del cuadro de referencias, hermano del `.calc-box` | `imPvlPintar`, llamado desde `valvProtSync` |
| `#bloque-prot-vt` (DVI + velocidad pico de E) | al lado de las pastillas, por encima de `#vt-lesiones` | **dentro** de `#campos-esten-tricuspide`, tercera fila | `valvProtSync` con `ver('bloque-prot-vt', …)` |
| `#bloque-prot-vt-res` (las cinco filas de la Tabla 19 y el veredicto) | cápsula `.calc-box` aparte | **dentro** del `.calc-box` de la estenosis, debajo de `#et-sev` | `vtProtObstrPintar` |

- **Son mudanzas de nodo y nada más.** Ni un `id`, ni un `oninput`, ni un `step`, ni un `value` de
  opción cambian: los tres dueños buscan por `getElementById`, así que no dependen de dónde
  cuelgue el nodo. Lo midió el grupo `pos` de `scripts/_probe_cortos.mjs` contra `68d64f5`: las
  **únicas** seis diferencias son la contención, el orden en el documento, el padre y las dos
  clases.
- **`#bloque-prot-vt` pasa de `grid-2` a `grid-3`** para que sus dos campos midan lo mismo que los
  seis de las dos filas de arriba. Con dos hijos en una grilla de tres ocupan las dos primeras
  columnas con el ancho de esas columnas.
- **El envoltorio de la cápsula pierde la clase `calc-box`** —dibujaría una caja dentro de otra— y
  **conserva su `id`**, que es lo que `vtProtObstrPintar` y `valvProtSync` muestran y esconden. Su
  `display:none` en línea se queda: el pintor escribe `''`, que cae al `block` del div.
- ⚠️ **CONSECUENCIA DECLARADA:** desde que los dos campos viven dentro de
  `#campos-esten-tricuspide`, **por debajo de 768 px quedan detrás del cajón «Datos»** —el CSS del
  celular lo cierra con `!important`—, igual que los seis campos de la estenosis. Antes estaban
  siempre a la vista en celular. Es el precio de ponerlos con los demás y lo pidió la orden.
- ⚠️ **LA FILA DE RESULTADO DEL ORIGEN MITRAL (`#im-pvl-interp`) SE QUEDA DENTRO DEL CUADRO:** el
  valor se carga abajo y se interpreta arriba, que es el reparto de la fuga aórtica del PRO-B3.
- ⚠️ **EL SELECTOR MITRAL NO SE VE SIN LA PASTILLA DE INSUFICIENCIA, Y ES PREEXISTENTE:** su padre
  es `#bloque-insuf-mitral`, el mismo antes y después de la mudanza. Medido en los dos árboles: con
  prótesis mecánica y la pastilla cerrada, `vis` da `false` en HEAD y hoy.

---

## 2 · La onda E tricuspídea es UN dato con DOS campos (CORTOS3)

- `dt_onda_e` (pestaña Doppler, bloque tricuspídeo, «Onda E tricuspídea (cm/s)») y `et_e_vmax`
  (pestaña Válvulas, bloque de la prótesis) son la **misma** medición: la velocidad pico de la onda
  E de la **entrada** tricuspídea por Doppler **pulsado**.
- **Los dos en cm/s**, espejados en los dos sentidos por `etOndaESync(origenId)`, con el patrón de
  `itVmaxSync` y `dtTapSync`: guarda de re-entrada (`_etOndaESinc`), salida temprana por valor
  igual —evita el salto del caret— y borrado incluido.
- **El corte se CONVIERTE una vez, en `VT_PROT_T19`:** 2,1 m/s = **210 cm/s** y 1,9 m/s = **190
  cm/s**. El valor del borde no se movió y **no se muestra en m/s en ninguna superficie**, que es la
  regla de la casa: un corte se publica sólo en la unidad del campo que lo recibe.
- **La banda de plausibilidad pasa de `[0,2 – 4]` a `[20 – 400]` cm/s.** El dedazo que caza es el
  inverso del de antes: tipear «2,1» por 210 cae **debajo** del piso, la fila publica «fuera de
  rango: no gradúa» y **no vota**.
- `etOndaESync` entra en **`RECALC_MODULOS`** al lado de `dtTapSync`, o sea que en las cinco rutas
  de restauración copia **del dueño (`dt_onda_e`) al espejo**.
- ⚠️ **ESTUDIOS GUARDADOS: NO SE MIGRA NINGUNO, y hay que saber qué hace cada camino.** Con la onda
  E cargada en el Doppler, el espejo la toma y el criterio de la Tabla 19 la ve en cm/s. Un estudio
  del PRO-C que traiga **sólo** `et_e_vmax` en m/s reabre con el campo **vacío**, porque el espejo
  sigue al dueño: no se reinterpreta un 2,4 m/s como 2,4 cm/s —sería afirmar una medición que nadie
  hizo— y no se reescribe el registro en disco.
- **SIN columna nueva de Excel:** la onda E ya viaja por la columna de su dueño, «E tricuspidea
  (cm/s)». Medido: 440 columnas.
- ⚠️ **LOS OTROS DOS CAMPOS DEL PRO-C NO DUPLICAN NADA** (reportado sin tocar): `ep_gmedio` es el
  gradiente **medio** pulmonar y lo único que existía era el **máximo** (`vp_gmax` / `ep_gmax`), que
  se deriva de 4·V²; y `vp_tipo_prot` reparte entre **bioprótesis** y **homoinjerto**, que no es el
  eje de `vp_morf` (biológica / mecánica). Los dos están en la unidad de su familia.

---

## 3 · La obstrucción de la prótesis tricúspide pide DOS o más positivos (CORTOS4)

- `VT_PROT_OBSTR_MIN = 2`, declarado al lado de `VT_PROT_T19` y **el mismo número** que
  `VM_PROT_OBSTR_MIN` de la prótesis mitral.
- **Cuatro estados donde había tres:**

| `R.obstr` | cuándo | qué publica la cápsula | ¿sube al papel? |
|---|---|---|---|
| `estenosis` | **2 o más** positivos | `VT_PROT_OBSTR_TXT` + los positivos con su valor | **sí**, cuerpo y EN SUMA |
| `aislado` | **1** positivo | `VT_PROT_AISLADO_TXT` + ese positivo con su valor | **no** |
| `sin` | criterios medidos, ninguno positivo | «sin criterios de estenosis (N medidos)» | no |
| `null` | ninguno medido | «— (sin criterios medidos …)» | no |

- **El emisor del informe no se tocó:** pregunta por `'estenosis'` y nada más, así que la frase del
  papel se apaga sola con un solo positivo.
- **La línea de criterios de la cápsula declara la regla y su autoría** —la guía sugiere integrar
  varios parámetros y no fija una regla numérica— sin usar la palabra «pendiente», que el
  repositorio público prohíbe.
- ⚠️ **LA NOTA `*` DE LA TABLA 19 ALCANZA SÓLO AL DVI, y está verificado en el PDF:** el asterisco
  está en la fila del DVI y su pie dice «Assessed in the absence of AR or TR. Upper limits of normal
  DVI vary by valve size and type.» La app retira **sólo** el DVI, con el umbral de
  `EM_CONT_REGURG_MIN` (moderada o mayor). Con el DVI retirado y un solo positivo más, el veredicto
  es `aislado`.
- ⚠️ **CÓMO SE CALCULA EL DVI QUE MUESTRA LA APP** (reportado sin tocar): **no se calcula**.
  `vt_dvi` es un campo que **tipea el médico** —`<input type="number">` con `oninput` al pintor— y
  no hay ninguna fórmula detrás. El rótulo de su fila dice «DVI — VTI prótesis / VTI TSVI», y eso
  **coincide con la Tabla 19 al pie de la letra**: la tabla escribe `DVI (VTI_PrTV/VTI_LVOT)`, o sea
  el VTI de la prótesis tricúspide sobre el del tracto de salida **IZQUIERDO**. Sorprende y es lo
  que dice la fuente.
- **La pulmonar no cambia:** tiene dos criterios y cualquiera alcanza, como dice su tabla.

---

## 4 · Los dos rótulos de la insuficiencia pulmonar (CORTOS5)

Cierra `PRO-C4`. **Tabla 16 de la ASE 2024, folio 34 (hoja 33)**, leída en el original:

| Dónde | Decía | Dice | Qué dice la Tabla 16 |
|---|---|---|---|
| `<option>` «ancho» de `ip_ancho` | «Ancho (>50–65 % del **TSVD**)» | «… del **anillo pulmonar**» | «jet width >50% of **pulmonary annulus**» |
| rótulo de `ip_reversion` | «En las **ramas** de la arteria pulmonar» | «En el **tronco pulmonar distal**» | «Diastolic flow reversal in the **distal main PA**» |
| fila `#ip-ref-rev` y el `rotulo` del signo | «Reversión en ramas» | «Reversión en el tronco distal» | la misma |

- **SOLO TEXTO:** ni un corte, ni un operador, ni un `value` de opción, ni un voto cambian. El
  número no se movió —el 50 coincide y el 65 es el que la app ya publicaba—: lo que estaba mal era
  el **denominador** que el rótulo nombra.
- **Son TRES superficies y no dos**, porque el `rotulo` con que el reverso entra en la fila de
  discordancia es una tercera copia de la misma palabra.

---

## 5 · El Ar−A de la ASE 2025 vota con su duración sola (CORTOS6)

Cierra `C2`. **El parámetro ya estaba** —entró el 12/10 con la tanda de complementarios— y con el
operador correcto; lo que cambió es que exigía además la amplitud de la Ar.

| | Nota de la Figura 3 (folio 554, hoja 18) | Prosa del folio 555d | Tabla 7 (folio 557) |
|---|---|---|---|
| texto | «Ar-A duration **> 30 ms**» | «a high amplitude (>35 cm/s) **and** long duration … **along with** an Ar-A duration >30 ms» | «Ar-A (**≥30 ms**)» |
| operador | `>` estricto | `>` estricto | `>=` |

- **Manda la FIGURA**, que es la regla de la casa: gana la figura del algoritmo que la app ejecuta.
  El operador es `>` y no se movió.
- **Lo que se fue es el AND de la amplitud.** `ASE_ARVEL_SUPL` **queda declarada y sin consumidor a
  propósito**: es el corte de la prosa, el rótulo de la fila lo nombra como salvedad, y el día que
  Maicol vuelva al AND está ahí con su folio.
- **ESCENA QUE CAMBIA:** con el Ar−A por encima de 30 ms y la amplitud de la Ar **sin cargar** o por
  debajo de 35 cm/s, el suplementario **ahora vota**. Alcanza únicamente al paciente que llegó al
  paso suplementario, o sea el que no tiene ninguno de los cuatro parámetros del segundo paso.
- ⚠️ **EL Ar−A SIGUE TENIENDO DOS CONSTANTES EN LA APP, y es `B4`:** `VENP_AR_A_MS` vale 30 con
  borde **`>=`** y es el criterio de la ASE/EACVI 2016 que pinta la fila de la vena pulmonar y la
  celda del PDF; `ASE_ARA_SUPL` vale 30 con **`>`**. Un Ar−A de 30,0 exactos es positivo para la
  fila y negativo para el paso suplementario, en la misma pantalla. **No se unificaron:** son dos
  guías con el mismo número y distinto borde.

---

## 6 · El Laboratorio lee la FEVI de su dueño (CORTOS7)

Tres sitios que la leían a mano. **El dueño es `feviClasificar` / `FEVI_CATS`**, con sus cuatro
categorías (`preservada ≥50%` · `leve 41-49%` · `moderada 30-40%` · `severa <30%`).

### (a) `ORD`, el orden de lectura de las categóricas — y el p NO estaba mal

- La lista tenía escritas las **tres** etiquetas viejas (`≥50`, `40-49`, `<40`) y desde el LS7
  `FEVICAT` devuelve el `rango` de las **cuatro**, que además lleva el `%` pegado: ninguna
  matcheaba, `ordCmp` caía a `999` y de ahí al orden **alfabético**. La tabla de contingencia de las
  tres chi² de FEVI salía con sus filas en «30-40% · 41-49% · <30% · ≥50%».
- ⚠️ **EL VALOR DE p NO SALÍA MAL, y hay que decirlo:** `chi2test` deriva **R** y **C** de las
  propias filas, los esperados de las marginales y `df = (R-1)(C-1)`, así que ya contaba las cuatro
  clases bien — y el chi² es **invariante a permutar filas**. Lo que estaba mal era el **orden de
  lectura**, que es lo que el médico mira al lado del p.
- **Lo que SÍ cambió con la cuarta clase** —y `LS-6` ya lo declaraba— es que hay más celdas, así que
  el esperado mínimo baja y el semáforo cae a 🟡 con `fe<5` más seguido.
- Hoy las cuatro se **derivan** de `FEVI_CATS`, que es lo que impide que vuelva a pasar el día que
  un corte se mueva.

### (b) El filtro de cohorte `coh-fevi`

- Tenía **tres** bandas con un **40 escrito a mano**, cuyo propio comentario declaraba que era «el
  borde interno de la banda intermedia, no un umbral de normalidad». Eso lo dejaba discrepando del
  dueño en un valor.
- Hoy ofrece las **cuatro** categorías (sus `value` son las claves del dueño) y la función **no
  tiene ningún número**. Los rótulos de `_COH_LBL.fevi` se **derivan** de `FEVI_CATS`.
- **Los tres valores viejos se siguen aceptando** (`_COH_FEVI_LEGADO`: `baja` → moderada+severa,
  `media` → leve, `alta` → preservada).
- **Medido sobre una población de cinco estudios (FEVI 60, 45, 41, 40 y 25):**

| clave | HEAD | hoy |
|---|---|---|
| `baja` | 1 (sólo 25) | **2** (40 y 25) |
| `media` | 3 (40, 41, 45) | **2** (41 y 45) |
| `alta` | 1 (60) | 1 (60) |
| `preservada` / `leve` / `moderada` / `severa` | no existían | 1 / 2 / 1 / 1 |

  O sea que **cambia de banda exactamente un estudio: el de FEVI 40 exacta**, que es
  «moderadamente reducida» para el dueño.

### (c) La comparación de subgrupos del PPT

- Partía la cohorte en `f < 40` contra `f >= 40`, con ese rótulo impreso en el **título de la hoja**,
  en el pie y en las **cuatro series** de sus dos gráficos.
- Hoy el corte es el del dueño —reducida = `moderada` o `severa`— y los rótulos salen de dos
  constantes: «FEVI moderada o severamente reducida» y «FEVI normal o levemente reducida».
- **El `f > 0` se conserva:** un cero no es una medición, y sin esa guarda caería en «severamente
  reducida» y entraría en el subgrupo reducido.

---

## 7 · Los tres chicos del LS (CORTOS8)

- **LS-5 — el rango de ADVERTENCIA del importador mira el sexo de la fila.** `DCM_RANGO_CLIN` era
  una tabla estática y para el diámetro AP de la AI usaba el techo del **varón** para los dos sexos:
  nunca avisaba de más, pero en una mujer un diámetro de 39 mm es dilatado y entraba sin
  advertencia. Hoy una entrada puede ser un **par** o una **función del sexo**, la resuelve
  `_dcmRangoClin(campo, sexo)` —que comparten las **dos** vías del importador, el SR DICOM y el CHM
  del Vivid— y el corte se le pide a `aiDiamNormalMax`, su dueño único.
  El sexo llega del propio archivo: **(0010,0040) PatientSex**. Sin sexo cae al corte más alto.
  ⚠️ **EL CHM DEL VIVID NO TRAE SEXO** (`_chmPaciente` devuelve `sexo: ''`), así que por esa vía el
  comportamiento es el de hoy.
- **LS-10 — el aviso de sexo de las tarjetas, en una sola constante.** `AV_SEXO_ALTO` (en
  `evTarjetaVI`) y `AV_SEXO_GEO` (en `evTarjetaGeo`) tenían **el mismo literal**. Sube a
  `EV_AV_SEXO`, a nivel de módulo y al lado de las bandas que esas dos tarjetas ya comparten. **Ni
  una letra del texto cambia.** De paso se fue el ternario redundante de `_avSx`, cuyas dos ramas
  devolvían lo mismo.
- **LS-9 — no es un defecto de la app y no se tocó nada.** `elementFromPoint` sobre el centro del
  enlace devolvía «fuera del viewport» a 768 px porque hay que **desplazar la página antes de
  medir**; el enlace tiene geometría y el aviso se ve.

---

## 8 · El PDF (CORTOS9)

- **K-3 — los otros dos toggles pasan a ser campos del ESTUDIO.** `sgl_incluir_pdf` (bull's eye de
  strain) y `mitral_qx_incluir_pdf` (vista quirúrgica mitral) eran preferencias globales de
  `localStorage` con el mismo modo de falla que el K1 cerró: aparecían prendidas solas al encadenar
  estudios y no viajaban con el estudio.
  Hoy el estado vive en `sgl_be_pdf` y `ete_qx_pdf`, dos `input[type=hidden]` con **guión BAJO**, con
  el patrón exacto de `contr_be_pdf`: entran al recolector, viajan, la reimpresión los repone,
  `limpiarCampos` los vacía y los repinta, y las rutas de restauración los vacían cuando la clave no
  está. Los pintores (`sglPdfSync`, `eteQxPdfSync`) entran en `RECALC_MODULOS`.
  **Las dos claves viejas ya no se leen**; se siguen borrando en «Nuevo estudio» para no dejar basura.
  **Medido con clics reales:** nacen apagadas, el gesto las prende (`btn-primary` y el campo en
  `'1'`), «Nuevo estudio» las apaga, y una clave vieja puesta en `'1'` **no** las enciende.
- **J-2 — el PDF de amiloidosis pregunta al dueño.** `amiloImprimirPDF` armaba la identificación a
  mano, con `_s('ci')` y `_s('doc_tipo')`, en **dos** lugares —el encabezado y el `titPagina` de las
  hojas de continuación— y no le preguntaba a `pacIdImpreso`. El médico que elige imprimir la
  **matrícula** la veía en el informe y **no** en la hoja de ETT Avanzado del mismo taco. Medido:
  con el documento elegido imprime «CI: 1234567» y con la matrícula, «Matrícula: M-777».
  `'CI'` se le pasa como etiqueta por omisión para que el texto salga igual que antes cuando
  `doc_tipo` está sin elegir.

---

## 9 · Las trampas que esta parte pagó

1. **`_labCohorteOk(inf)` TOMA UN SOLO ARGUMENTO** y lee la variable de módulo `_LAB_COHORTE`:
   pasarle un criterio por parámetro lo **ignora**, y con la cohorte vacía devuelve `true` para
   todo. Medido: las siete claves daban el total de la población —un denominador roto con pinta de
   medición buena—.
2. **UN CRITERIO DE COHORTE INCOMPLETO RECHAZA TODO.** Esa función evalúa **todos** sus criterios y
   una clave ausente deja comparaciones contra `undefined`: `undefined !== null` es verdadero, así
   que entra en la rama de la edad y descarta todo estudio sin edad. Se parte **siempre** de un
   objeto completo leído del panel.
3. **UN `const` DE NIVEL SUPERIOR NO ES UNA PROPIEDAD DE `window`** —la trampa de `ECO_AYUDA`— y
   **cazó SEIS condiciones de TC-499**: `VINFO`, `_COH_LBL`, `VM_PROT_OBSTR_MIN`,
   `VM_PVL_ORIGEN_PVL`, `EM_CONT_REGURG_MIN` e `IP_PHT_SEVERA` dan «NO EXISTE» por `in window` y
   existen. El cuerpo de un caso se evalúa en el scope global de la página: se los nombra **pelados**,
   con su guarda de `typeof`.
4. **NI UN REGEX CON BARRA DENTRO DEL CUERPO DE UN CASO:** el cuerpo es un template literal y la
   barra escapada se cocina. Medido: `/210 cm\/s/` llegó al motor como `/210 cm/s/` y tiró
   «Unexpected token .», que el runner informó como **excepción del caso**. Va por `indexOf`.
5. **«cm/s)» CONTIENE «m/s)»:** la condición que exigía que la fila **no** dijera m/s salía roja
   sobre una fila perfecta.
6. **EL AEO DE LA ESCENA BASE ES UN TERCER CRITERIO MEDIDO.** La escena de la tricúspide carga los
   tres insumos del área, así que el denominador del veredicto es **3** y no 2, y con un valor fuera
   de banda el veredicto queda en `sin` y no en `null`. **El denominador lo pone la escena, no la
   regla.**
7. **LOS BOTONES DE LOS DOS TOGGLES NO TIENEN GEOMETRÍA SIN ABRIR SU CONTENEDOR:** el clic real
   informó «SIN GEOMETRIA» sobre dos botones que existen. Se abre con `abrirPara`, que sube por el
   DOM.
8. **Me comí el acento grave CINCO veces**, todas en comentarios míos dentro del cuerpo de un caso o
   del template de la sonda. `scripts/check_backticks.py` dio la línea exacta las cinco; una de
   ellas estaba dentro de `SONDA2`, que ese script **no** alcanza, y la dio `node --check`.
   **Correr los dos.**
