# Fichas de casos por tanda

Sale de `docs/mapa/tests.md`, que cruzó el techo de 35 KB el 2026-10-16 al agregarle TC-485.
**Lo que está acá es la ficha de cada tanda**: qué cubre su caso, cuántas condiciones tiene y
cuántas quedan en rojo contra HEAD. **Lo que está allá es el mecanismo**: cómo se agrega un caso,
cómo se corre la suite, los dos juegos de helpers, los arneses y las trampas.

> ⚠️ **ARCHIVO PARTIDO el 2026-10-17 (tanda VS):** las fichas de **TC-481 a TC-490** salieron a
> `docs/mapa/tests-fichas-481-490.md`. Estaba en 33,4 KB y la ficha de TC-494 lo cruzaba; se midio
> con `wc -c` ANTES de escribir, que es lo que `CLAUDE.md` pide y lo que las tres particiones
> anteriores tuvieron que hacer DESPUES de cruzar.

> ⚠️ **ARCHIVO PARTIDO OTRA VEZ el 2026-10-17 (tanda CORTOS):** las fichas de **TC-491 a TC-495**
> salieron a `docs/mapa/tests-fichas-491-495.md`. Estaba en **34,1 KB** —a 855 bytes del techo— y
> la ficha de TC-499 lo cruzaba; se midió con `wc -c` ANTES de escribir.

## TC-496 — la tanda «PRO», commits 1 a 3 (2026-10-17)

**33 condiciones**, cuatro denominadores y cinco controles negativos. **Sabe fallar contra el inicio
de la tanda (`3188950`) en un worktree aparte: 11 de las 33 en rojo, y NINGUNA por excepción.**

**Qué cubre, bloque por bloque:**

- **DENOM** (4): que `VM_PROT_T11.thpNormalMax` sea el único dueño del THP normal y valga **130**;
  que `vmProtEOA` publique **las dos** preguntas del régimen de la Tabla 12 (`mecanica` y `porThp`);
  que `_eaEsProtesisAo` distinga las **tres** prótesis aórticas de la nativa; y que el motor de la
  fuga de la TAVI exista.
- **(b) PRO1**, diez condiciones: el apoyo con mecánica y THP normal · el **borde 129/130** del THP ·
  el número **pelado** con THP anormal y sin THP · la **biológica** sin fila en los tres estados ·
  el control negativo de la **nativa** · el **borde 2,49/2,50** del corte · que el cociente **no
  vota** (mismo `im_grado` con 3,00 y con 1,00) · que la regla de **«dos o más»** siga intacta · que
  **`thpEditado` llame a `calcIM_ESC`** (medido sobre el fuente de la función) · y que el rótulo
  nuevo esté **y la frase vieja no**.
- **(a) PRO2**, nueve condiciones: el **25 % exacto** leve en las tres prótesis · el control negativo
  de la nativa en ese mismo valor · los dos **vecinos** del borde iguales en los dos regímenes · el
  **50 % exacto** severo en las tres prótesis · su control negativo nativo · los dos vecinos de la FR ·
  el informe y el EN SUMA en los **tres estilos** · la **pastilla** · y la nota al pie de
  «Referencia clínica» con su folio.
- **(c) PRO3**, seis condiciones: los **cuatro niveles** del reverso (20, 29, 30, 45) · el borde de
  abajo (19 no vota) · la **compuerta del holodiastólico** («proto» no vota) · el control negativo de
  los **otros cuatro** parámetros de la fuga · que el reverso **siga integrando** (25 cm/s + 5 % de
  extensión da moderada) · y que el corte de la aorta descendente de la nativa **no se haya movido**.
- **(g) CONTROLES**, cuatro: las **440 columnas** del Excel con el formulario vacío y con escenario
  cargado · los **tres asserts** de arranque del Excel limpios · un control negativo mayor con una
  escena nativa cargada (los ocho grados y la diastólica) · y que el Wilkins, la pestaña Otros, el
  cuadro de frases y la identificación del paciente sigan en pie.

**Las cuatro trampas del medidor que este caso pagó**, y que están en `docs/mapa/protesis-pro.md`
con su medición: el `innerHTML` de `documentElement` devuelve el texto **decodificado**;
`IA_VMAX_TD_SEVERA` es un `const` de módulo y se mide por **comportamiento**; `ea_grado` guarda un
**token de texto** (`severa`) y no el 0-4 de las insuficiencias; y los cuatro calculadores hay que
llamarlos **a mano**, porque `__t.set` no dispara el `oninput` del marcado.

---

## TC-497 — la tanda «PRO-B» (2026-10-17)

**Qué afirma:** la **fuga paravalvular de la prótesis aórtica quirúrgica** con el motor de la TAVI
y su fuente inyectada; el **origen** de la regurgitación de la prótesis **mitral** sin mover un
corte de la Tabla 13 y sin ofrecer extensión circunferencial; el rótulo **«aorta descendente»**;
que la **TAVI publique exactamente lo mismo** que antes; y que no se mueva nada ajeno.

**51 condiciones · 34 en rojo contra el inicio de la tanda** (worktree aparte sobre `7f14781`),
**ninguna por excepción** —los centinelas `SIN FN` / `NULL` / `'NO EXISTE'` hicieron su trabajo—.
Las 17 que pasan en los dos árboles son, exactamente, lo que esta tanda **no mueve**: los cinco
casos del motor de la TAVI y sus bordes del reverso, los cuatro cortes de la Tabla 13, las 440
columnas del Excel, la ausencia de extensión circunferencial mitral, el control de la vista 2D y
los seis controles de la zona ajena.

### Los cuatro denominadores

1. el motor acepta su **fuente por parámetro** —`eteTaviRPV({ext:35})` devuelve «Severa»—, que es
   lo que deja reusarlo sin una segunda copia de los cortes;
2. **`_eaEsProtesisSavr` NO es `_eaEsProtesisAo`**: dice `false` sobre la nativa **y sobre la
   TAVI**, y `true` sobre las dos quirúrgicas;
3. los **tres** campos nuevos de la fuga aórtica existen;
4. **el ancho de vena contracta y el THP no se duplican**: `ea_pvl_vc_ancho` y `ea_pvl_pht` **no
   existen**, y `ia_vc` e `ia_pht` sí.

### Lo que cubre, por bloque

- **(a) LOS CUATRO CORTES DE LA TABLA 8 POR SU BORDE EXACTO**, ocho condiciones, un parámetro por
  escena: extensión 9/10 y 29/30 · área de VC 0,09/0,10 y 0,29/0,30 · **ancho de VC en MILÍMETROS**
  2,9/3,0 y 6,0/6,1 —que es lo que prueba que la conversión mm→cm está puesta— · THP 199/200 y
  500/501.
- **(b) LA INTEGRACIÓN**, ocho: gana el peor **por los dos lados** · «Trivial» exige **tres de
  cuatro** · el **cero medido niega** · la fuga **no reemplaza** la regurgitación central
  (`ia_grado` sigue en 4 con la fuga severa) · **el reverso NO entra** (con `ia_vmax_td` en 25 la
  fuga sigue Trivial y `ia_grado` pasa a severa) · el origen sin parámetros no gradúa · las dos
  compuertas (sin origen y con «central» no se afirma nada) · y el origen **mixto** sí gradúa.
- **(c) LA TAVI, IDÉNTICA**, cuatro: sus cinco salidas · los cuatro bordes del reverso del PRO3 ·
  la compuerta del holodiastólico · y que la TAVI **no muestre** el bloque de la quirúrgica.
- **(d) LA MITRAL**, siete: **`vm_pvl_ext` NO EXISTE** · el selector aparece sólo con prótesis ·
  **`im_grado` vale 4 en los cuatro estados del origen** con la misma vena contracta, que es la
  prueba de que no se movió un corte · los cuatro bordes de la VC de la Tabla 13 · la frase dice el
  origen y **no repite el grado** · «central» no escribe nada · y la mitral nativa no afirma origen.
- **(e) EL RÓTULO**, tres: dice «aorta descendente» · **ningún `<label>` ni `<option>` del
  documento** dice ya «aorta abdominal» en ese campo · y el control negativo del rótulo nativo y
  del `<select>` del flujo.
- **(f) EL ESTUDIO Y EL EXCEL**, cinco: los cuatro campos **no están** en `_noEsDelEstudio` ·
  **440 columnas** vacío y cargado · **ningún encabezado** nombra la fuga quirúrgica · un estudio
  **anterior** abre con los cuatro campos vacíos · y «Nuevo estudio» esconde los dos bloques.
- **(g) LAS SUPERFICIES**, seis: informe y EN SUMA en los **tres estilos** · el cero medido niega y
  el EN SUMA calla · las dos filas entran en las listas de la **vista 2D** · su control negativo
  con válvula nativa · y las **dos** escenas del Laboratorio que cambian al leer del dueño.
- **(h) LOS CONTROLES**, seis: la tricúspide y la pulmonar protésicas siguen «No graduada» · la
  válvula nativa no nombra «paravalvular» · el cociente VTI del PRO1 · el borde del jet del PRO2 ·
  el formulario vacío · y los tres asserts de arranque del Excel.

### Trampas que este caso pagó al escribirse

- **`__t.set` no dispara el `oninput`**, así que los **dos pintores nuevos** (`eaPvlPintar` y
  `imPvlPintar`) se llaman a mano **al final** del helper de escena, después de los calculadores:
  leen lo que ésos acaban de publicar.
- **El censo del rótulo va sobre los `<label>` y `<option>` renderizados**, no sobre el fuente: el
  comentario que explica el cambio **nombra** el texto viejo, que es la trampa que TC-476 y TC-479
  ya pagaron.
- ⚠️ **AL LIMPIAR LOS ACENTOS GRAVES DE UN RANGO DE LÍNEAS ME LLEVÉ EL QUE ABRE EL CUERPO DEL
  CASO.** El síntoma fue que `check_backticks.py` señaló una línea **350 líneas después**, dentro
  del runner, que es código normal. **El acento grave que FALTA se ve igual que uno que SOBRA.**

---

## TC-498 — la OBSTRUCCIÓN de las prótesis TRICÚSPIDE y PULMONAR (tanda «PRO-C», 2026-10-17)

**47 condiciones**, contadas sobre el propio caso (`ex.push`), con **cinco denominadores** y
**nueve controles negativos**. **Verificado que sabe fallar contra el inicio de la tanda
(`d6539fb`, md5 `9854beaa…`) en un worktree aparte: 34 de las 47 en rojo, y NINGUNA por
excepción** —las 34 informan `SIN FN`, `NO EXISTE` o `false`, que es lo que producen los
centinelas—. Las 13 que pasan son los controles y lo que esta tanda no mueve.

### Qué cubre

| grupo | condiciones | qué afirma |
|---|---|---|
| DENOM1-5 | 5 | los tres campos existen y son los tres; la velocidad pico de E es un campo PROPIO y no `it_vmax_cw`; el selector del tipo ofrece exactamente cuatro opciones; las dos tablas de cortes con sus operadores de la fuente; y el AEO **sale de `etEstado()`** y no de una segunda cuenta |
| a1-a8 | 8 | los **cinco criterios de la Tabla 19** por su borde exacto **en las dos columnas**, la columna elegida por la morfología medida **por los dos lados**, y la compuerta del DVI con su umbral medido por comportamiento |
| b1-b4 | 4 | los **dos criterios de la Tabla 15** por su borde exacto en las dos columnas, la columna elegida por el tipo, y que el gradiente MEDIO no es el MÁXIMO |
| c1-c4 | 4 | los **tres estados pulmonares que no gradúan** con su motivo propio, y que con morfología nativa las dos cápsulas se esconden |
| d1-d4 | 4 | que la obstrucción pulmonar **nunca dice «severa»**, que su único veredicto positivo es «posible», que la tricuspídea **no se gradúa**, y que la palabra del veredicto vive en UNA constante |
| e1-e6 | 6 | las superficies: informe en los **tres estilos**, EN SUMA, que «sin criterios» no sube al papel, que los estados que no gradúan tampoco, y la **vista 2D** con su entrada propia |
| f1-f5 | 5 | que la **regurgitación** de las dos **no movió un corte**: la Tabla 21 contra `IT_CRIT` dígito por dígito, el grado idéntico en las tres morfologías, el borde del 7, el de la IP y el THP, y que la FR pulmonar no tiene campo |
| g1-g5 | 5 | los tres campos **viajan con el estudio** sin columna de Excel, **nada en el navegador**, «Nuevo estudio» los vacía, y las cápsulas son de **sólo lectura** |
| h1-h6 | 6 | los controles: la ET **nativa**, la prótesis **mitral**, la **fuga paravalvular** y el **reverso de la TAVI**, el formulario vacío, los asserts del Excel y el límite declarado de la maqueta |

### Las escenas y sus denominadores

- **`escVT`** fija morfología protésica y los tres insumos del área: diámetro del TSVD 20 mm, VTI
  del TSVD 20 cm y VTI de entrada 20 cm → numerador 62,83 y **área 3,14 cm²**, que no alcanza el
  criterio en ninguna de las dos columnas. Es lo que deja que cada escena mida **un** parámetro.
  ⚠️ **El VTI de entrada es ADEMÁS criterio de la ET nativa (`≥60` cm) y su banda es 5-100 cm**:
  los valores usados (20, 32, 41,89, 42,2, 45) están dentro y ninguno llega a 60, así que no
  mueven el veredicto nativo.
- **El borde del AEO se alcanza por el VTI de entrada y NO tipeando el área**: el campo es de
  solo lectura y lo escribe la continuidad. VTI 41,89 → 1,50 cm² (que **no** vota, porque el
  corte es `< 1,5`) y 42,2 → 1,49, que sí.
- **El grado de la IT se produce por CÁLCULO**, con la vena contracta: 2 mm es leve y 5 mm
  moderada. Setear `it_grado` a mano no sirve, porque `calcIT_ESC` lo vuelve a escribir.

### Siete cosas que pusieron el caso en rojo sobre un árbol perfecto

1. **TRES CONSTANTES DE MÓDULO NO ESTÁN EN `window`** y rompieron tres condiciones:
   `EM_CONT_REGURG_MIN`, `IP_PHT_SEVERA` e `IA_VMAX_TD_SEVERA`. Se miden por su
   **COMPORTAMIENTO**, por los dos lados del borde. Es la trampa de `ECO_AYUDA` y de `AO_SEGS`.
2. **UNA ESCENA QUE SE PISA A SÍ MISMA**: `escVP` llama a `__t.limpiar()`, así que leer el
   veredicto tricuspídeo DESPUÉS de montar la escena pulmonar informa `null` sobre una escena que
   sí produjo «sin». El veredicto se captura **en el momento** de cada escena.
3. **EL ATRIBUTO `style` SALE NORMALIZADO POR EL MOTOR** —«margin-bottom: 8px; display: none;»—
   así que buscar `display:none` sin el espacio falla sobre un marcado correcto.
4. **CON EL DVI RETIRADO Y SIN LOS INSUMOS DEL ÁREA NO QUEDA NINGÚN CRITERIO MEDIDO**, así que el
   veredicto cae en `null` —abstenerse— y no en «sin». La escena de la compuerta lleva los
   insumos del AEO a propósito.
5. **`__t.set` NO DISPARA EL `oninput` DEL MARCADO**: los calculadores se llaman a mano, y los dos
   pintores nuevos **al final**, porque leen lo que los calculadores acaban de publicar.
6. **BARRER «sever» EN EL CONTENEDOR DA UN FALSO**: la línea de fuente de la cápsula dice «no
   gradúa la **SEVER**idad». Se barren los nodos que publican un veredicto, con la palabra
   completa.
7. ⚠️ **EL ACENTO GRAVE, DOS VECES.** La segunda fue la peor: al limpiarlos de un **rango de
   líneas** me llevé el que **CIERRA** el cuerpo del caso, y `check_backticks.py` señaló una línea
   del **runner**, 400 líneas después, que es código normal. **El que FALTA se ve igual que uno
   que SOBRA.**

### Límite declarado

El cuerpo de un caso **no puede cambiar el ancho de la ventana ni correr en WebKit** —corre
DENTRO de la página y no tiene el canal del navegador—, así que la maqueta a los seis anchos por
los dos temas, el **color REAL resuelto** y el ciclo de 20 aperturas de la vista 2D los mide
`scripts/_probe_proc.mjs` con `--solo maqueta,v2d`. Es el reparto de TC-460. Lo que **sí** se
afirma desde el caso es la REGLA que produce el comportamiento: las dos cápsulas nacen en
`display:none`, son `.calc-box` y **no declaran ni un color propio**, así que heredan el del tema.

---

## TC-499 — la tanda «CORTOS» (2026-10-17)

**35 condiciones**, con **dos denominadores** y **cuatro controles**. **Verificado que sabe fallar
contra HEAD (`68d64f5`) en un worktree aparte: 29 de las 35 en rojo, y NINGUNA por excepción.**
Las seis que pasan son lo que esta tanda no mueve: la regla y los cortes de la prótesis mitral, los
umbrales nativos, el Wilkins, el PPM y la pulmonar.

### Qué afirma, por bloque

- **(DENOM1-2)** las piezas existen: `VT_PROT_OBSTR_MIN === 2`, `VT_PROT_AISLADO_TXT`, las ocho
  entradas de `OTR_HALL`, los cuatro dueños nuevos, y los 18 controles nuevos con **guión BAJO**
  —que es lo que los hace viajar con el estudio—.
- **(b1-b3)** la POSICIÓN de lo que se mudó, medida por **contención** y por **orden en el
  documento** y no por geometría: con la pestaña cerrada los nodos miden 0×0. El selector mitral no
  está dentro del cuadro y la fila de resultado lo precede; los dos campos tricuspídeos están dentro
  de `#campos-esten-tricuspide` en una `grid-3`; las cinco filas están dentro del `.calc-box` de la
  estenosis, debajo de `#et-sev`, y **sin** la clase `calc-box`.
- **(a1-a8)** la regla de DOS O MÁS: cero → `sin`, uno → `aislado`, dos → `estenosis`, con el mismo
  umbral que la mitral; con un solo positivo la frase **no sube al papel en ninguno de los tres
  estilos** y con dos sube al cuerpo y al EN SUMA; la cápsula nombra el hallazgo aislado con su
  valor; la onda E vota en **cm/s** por su borde exacto en las dos columnas (209/210 y 189/190) y el
  corte se publica **sólo** en cm/s; el dedazo de «2,1» cae fuera de banda y no vota; el espejo con
  el Doppler copia en los dos sentidos y el borrado borra en los dos; el DVI se sigue retirando con
  IT moderada o mayor; y **la pulmonar no cambia**.
- **(c1-c2)** el Ar−A por su borde (`29 no · 30 no · 31 sí`) y que la amplitud de la Ar **ya no es
  una condición**, con los dos cortes leídos del **rótulo** de la fila.
- **(d1-d3)** las cuatro clases de FEVI del dueño en el orden de lectura, las cuatro opciones del
  filtro de cohorte con sus rótulos derivados de `FEVI_CATS`, y que **40 exactos son
  «moderadamente reducida»**.
- **(e1-e2)** los dos toggles de PDF como campos del estudio —nacen apagados, el gesto los prende,
  «Nuevo estudio» los apaga y **la clave vieja de `localStorage` no los enciende**— y que el PDF de
  amiloidosis pregunta al dueño de la identificación impresa, con el censo de que ya no queda
  ninguna copia de la expresión que lo armaba a mano.
- **(f1-f9)** los seis hallazgos de Otros con su **frase exacta** en el informe y en el EN SUMA: ASIA
  sola y con nota, **la nota con la casilla apagada que no entra por ningún camino**, las seis
  variantes que van al cuerpo y **ninguna** al EN SUMA, la RAC con su nombre completo abajo y su
  sigla arriba, las tres frases del test de burbuja, que ese informe **no interpreta**, el derrame
  pericárdico con el token del selector **intacto**, la separación de las líneas B con y sin
  consignar, y los cuatro globos nuevos con NODOS de su ficha.
- **(g1-g6)** los controles: el Excel en **440** columnas con los campos nuevos viajando, **cero**
  claves en el navegador, la prótesis mitral sin moverse, los umbrales nativos y el Wilkins, los dos
  rótulos de la IP, y la maqueta al ancho de la corrida sin desborde ni superposición.

### Lo que este caso NO puede medir y mide la sonda

El **ancho de la ventana** —el cuerpo de un caso corre dentro de la página y no puede emular un
viewport, que es el reparto de TC-460—, los **dos motores** y el **ciclo de 20 aperturas** de la
vista 2D con su conteo de nodos. Las condiciones de maqueta de acá **declaran el ancho** en el que
corrieron. Todo eso lo mide `scripts/_probe_cortos.mjs`.

### Trampas que pagó al escribirlo

1. **UN `const` DE NIVEL SUPERIOR NO ES UNA PROPIEDAD DE `window`** —la trampa de `ECO_AYUDA`— y
   **cazó SEIS condiciones**: `G()` usa `in window` y devuelve «NO EXISTE» sobre `VINFO`,
   `_COH_LBL`, `VM_PROT_OBSTR_MIN`, `VM_PVL_ORIGEN_PVL`, `EM_CONT_REGURG_MIN` e `IP_PHT_SEVERA`, que
   **sí existen**. El cuerpo de un caso se evalúa en el scope global de la página: se los nombra
   **pelados**, con su guarda de `typeof`, que es lo que TC-471 ya hacía.
2. **NI UN REGEX CON BARRA DENTRO DEL CUERPO:** `/210 cm\/s/` llegó al motor como `/210 cm/s/` y el
   runner informó **excepción del caso**, no una condición en rojo. Va por `indexOf`.
3. **«cm/s)» CONTIENE «m/s)»:** la condición que exigía que la fila no dijera m/s salía roja sobre
   una fila perfecta.
4. **EL AEO DE LA ESCENA BASE ES UN TERCER CRITERIO MEDIDO:** el denominador del veredicto es 3 y no
   2, y con un valor fuera de banda queda en `sin` y no en `null`. **El denominador lo pone la
   escena, no la regla.**
5. **Me comí el acento grave DOS veces** dentro de los comentarios de este caso, con el archivo que
   documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta las dos.

### Casos adaptados por esta tanda: DOS

- **TC-498**, en **quince** lugares: los valores de la onda E pasan a cm/s, las nueve escenas de UN
  solo criterio positivo pasan de `estenosis` a `aislado`, dos escenas pasan a **dos** positivos
  —(d4) y (e5), que exigen que el veredicto suba al papel y a la vista 2D—, y su (h6) deja de
  exigirle la clase `calc-box` a la cápsula tricuspídea y le exige que su **ancestro** lo sea.
  Ninguna de las quince estaba mal escrita: las quince describían la app de ayer.
- **TC-471**, una línea: el registro `VINFO` pasa de **30 a 34** entradas. Las cuatro nuevas no
  están en la pestaña Válvulas, así que lo que ese caso afirma del marcado de Válvulas no cambia.
