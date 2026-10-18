# Mapa — las TARJETAS ⓘ de las válvulas y de la función diastólica («Q», 2026-10-17)

> **Mapa nuevo.** Las ocho tarjetas de lesión (insuficiencia y estenosis de las cuatro válvulas),
> la de la función diastólica y la de la fuga paravalvular aórtica. Es **solo presentación**: las
> tarjetas LEEN lo que la app ya calcula y no cambian un corte, un operador, una regla, ni un
> texto del informe, del EN SUMA, del PDF, del PPT o del Excel. Medido: A/B contra el inicio de la
> tanda con **cero diferencias** en los siete commits.

---

## 1 · El mecanismo: es el de L y de M, sin un segundo motor

`VINFO` + `vInfoClic` + `#vinfo-card` + `_vInfoColocar`. Un toque abre, otro cierra, el clic
afuera cierra y Escape también; sin hover y sin llevar al manual. El registro pasó de **34 a 44**
entradas: ocho de lesión (`tarj-<tipo>-<valv>`), una de la función diastólica (`tarj-diast`) y la
de la fuga aórtica (`ea-pvl`). Las diez declaran `ancho: 356` y `dyn`, que es el campo que L
estrenó para una tarjeta que devuelve NODOS en vez de texto.

**Lo que esta tanda NO agregó:** ni un oyente de cierre, ni un segundo colocador, ni un segundo
Escape. Lo fija TC-500 por COMPORTAMIENTO —las diez se cierran con el clic de afuera— y no
contando literales en el fuente, que fue la primera versión y daba cero sobre un mecanismo
perfecto (`innerHTML` devuelve el texto decodificado).

### Dónde está cada botón

| Clave | Dónde | Pestaña |
|---|---|---|
| `tarj-insuf-<valv>` · `tarj-esten-<valv>` | en `.valv-sev-col`, **arriba** de `sevbtn-<tipo>-<valv>` | Válvulas |
| `tarj-diast` | en el `.calc-lbl` de la fila «Función diastólica» | Doppler |
| `ea-pvl` | en el `.calc-lbl` de «Regurgitación paravalvular — severidad» | Válvulas |

⚠️ **VA ARRIBA Y EN FLUJO, Y EL NÚMERO SALE DE MEDIR.** A 390 px la pastilla de lesión mide
**50 px** y la selectora 104: un tercer ítem en la MISMA fila flex la dejaría por debajo de lo
legible —es `flex:1; min-width:0`, así que se come todo el recorte—. Apilado, la fila pasa de
**44 a 58 px** (+14 con el mouse; con el dedo el piso táctil de `.vinfo-btn` reserva 44) y la
pastilla conserva sus **375 px**: ningún campo se superpone, se tapa ni se desplaza en horizontal.
Un botón `position:absolute` sobre la fila de arriba habría tapado el `<select>` de morfología.

⚠️ **EL MENÚ DE SEVERIDAD NO ENTRA EN LA COLUMNA.** `.valv-sev-menu` se coloca con
`position:absolute; top:100%; right:0` contra `.valv-btn-wrap`, que es el `position:relative`:
metido en la columna se anclaría a ella y se abriría 44 px más arriba, encimado con el botón.

---

## 2 · Los DOS dueños de donde sale todo

| Qué | Dueño | Qué devuelve |
|---|---|---|
| la palabra del GRADO y su color | `_v2dPastilla(tipo, valv)` | `{ txt, cls }`, derivados de UNA lectura del `sevbtn-*` |
| las filas, su grado, «decide», el retiro, el «no vota», la línea integrada y el aviso | `_v2dPorQue(clave)` | `{ decide, filas[], aviso }` o `{ manual, aviso, fund }` |

Son **los mismos** que la lista «Ver criterios» y la línea «Decide» de la vista 2D consumen. Por
eso la tarjeta, la vista 2D, el cuadro de referencias y el informe firmado no se pueden
desincronizar: es el mismo texto leído del mismo nodo.

`_qvClave(tipo, valv)` elige la entrada: con morfología protésica la **estenosis** lee
`prot:<valv>` —donde viven los criterios de la ASE 2024— y la **insuficiencia** sigue leyendo la
nativa, porque esa guía remite la regurgitación protésica a los criterios de la válvula nativa.

⚠️ **`_v2dCrit` GANÓ LA CLAVE `id`, INERTE PARA LA VISTA 2D** (que no la lee): la necesitan las
tarjetas para encontrar el encuadre de su barra sin emparejar por el ROTULO, que es texto del DOM
y se mueve con cualquier retoque de un `<label>`.

⚠️ **LA PULMONAR NO ESTABA EN `V2D_PORQUE`,** porque no está en la vista 2D. Entraron sus TRES
entradas a la MISMA tabla —`insuf:pulmonar`, `esten:pulmonar` y `prot:pulmonar`— y son **inertes
para el dibujo por construcción**: los dos lugares que buscan una entrada la buscan por una clave
que sale de `V2D_VALVS`, que tiene TRES válvulas y no se tocó. Lo fija TC-484, cuya afirmación
cambió de nodo y no de sentido: donde decía «`prot:pulmonar` no existe» como proxy, ahora exige el
invariante de verdad (`V2D_VALVS` con tres válvulas, ninguna la pulmonar), que es más fuerte.

---

## 3 · La estructura de la tarjeta

1. **Encabezado** con el grado del paciente, su color heredado de la pastilla, y la morfología
   cuando es protésica.
2. Las **filas** en DOS grupos: las que deciden y las de **APOYO**, con su rótulo.
3. La línea **«Decide»**, cuando la pantalla nombra el criterio.
4. El **aviso** de discordancia que la pantalla ya publica.
5. La **nota** por lesión, donde hace falta.
6. La **FUENTE** al pie, con su folio.

⚠️ **«SIN GRADO» Y «SIN DATOS» NO SON LO MISMO,** y la diferencia la da el dueño: con la pastilla
apagada y parámetros cargados la app no dice que no haya datos, dice que no publica un grado. La
estenosis mitral con gradiente elevado e IM significativa es el caso.

⚠️ **QUIÉN ES DE APOYO LO DICE EL DUEÑO, por TRES formas y ninguna es una lista aparte:** el
`noVota` que `V2D_PORQUE` declara (la velocidad pico de la prótesis mitral, que la Tabla 11
publica y la prosa del folio 24 omite), la palabra «apoyo» que la fila de la estenosis
tricuspídea escribe en su leyenda desde el VAL1, y el «no vota» que la fila del AVm por THP de la
estenosis mitral publica desde el 2026-10-11. Con una lista aparte, el día que un criterio deje
de votar la tarjeta seguiría contándolo entre los que deciden.

⚠️ **UN CRITERIO RETIRADO NO LLEVA BARRA.** El dueño marca `retiro` por las tres formas que el
W2-B y el Z6 declararon («no concluye», «no válida», «no aplica»), pero el DVI de la prótesis
tricúspide se retira con otras palabras —«no se evalúa con insuficiencia tricuspídea», la nota `*`
de la Tabla 19— y sin leerlas la barra le pintaba su banda ROJA a un criterio que la app acaba de
sacar del conteo: el dibujo decía que vota y el «Decide» de dos renglones más abajo decía que no.
El aviso **no** se agregó a `V2D_PQ_RETIRO`, porque eso cambiaría la lista «Ver criterios» de la
vista 2D.

### El grado fijado a mano

Lo garantiza el dueño: `_v2dPorQue` devuelve `{ manual: true, aviso, fund }` cuando `sevDiscrepa`
—el mismo dueño del aviso rojo y del cajón— dice que el médico consignó un grado distinto del
calculado. La tarjeta publica ese aviso (que además nombra el calculado) más el fundamento del
propio cajón, y **ningún criterio**: publicar la lista al lado de un grado que la contradice
invitaría a leerla como si el cálculo hubiera ganado.

---

## 4 · Las barras: `QV_BARRA`, y de dónde sale cada corte

El motor de dibujo es `_evBarra`, el de L y de M, **sin tocarle una línea**. Lo que esta tanda
agrega es `QV_BARRA`, la tabla que dice CÓMO se encuadra cada parámetro. La clave es
**`<clave del dueño>|<id de la fila>`**, y no el rótulo de la lesión.

⚠️ **LA CLAVE LLEVA LA CLAVE DEL DUEÑO, Y LO CAZÓ LA SONDA.** El cuadro de la estenosis aórtica es
el MISMO con válvula nativa y con prótesis, y sus cortes NO son los mismos: con el rótulo de la
lesión, una prótesis recibía las bandas NATIVAS —medido, el gradiente salía con 20/40 en vez de
los 20/35 de la Tabla 5, y el AVA y el AVA indexada con bandas que esa tabla **no publica**, que
es justo lo que el W2-B retiró de esta pantalla—. Es ese defecto reabierto por la puerta de al
lado, y se veía bien.

⚠️ **`bandas` ES UNA FUNCIÓN A PROPÓSITO:** sus cortes se leen del dueño en el momento de dibujar.
Una tabla con los números ya resueltos quedaría vieja el día que alguien mueva un corte, y ése es
el modo de falla que no se ve —la barra mostrando un corte y el informe graduando con otro—.

⚠️ **`lo` Y `hi` NO SON CORTES Y NO LLEVAN FUENTE:** son el rango de lo medible que la barra
encuadra, igual que una banda de plausibilidad. Un valor por fuera se dibuja pegado al borde y el
texto de la fila dice el número real.

### De qué constante sale cada barra

| Lesión | Parámetros con barra | Constante dueña |
|---|---|---|
| IM nativa y protésica | VC · EROA y Vol-R y FR por PISA y por continuidad · jet/AI | `IM_CORTES` (`vc`, `eroa`, `volr`, `fr`, `jet_nat` / `jet_prot`) |
| EM | gradiente medio · AVm por THP, continuidad y planimetría | `EM_GMEDIO_ELEVADO_MIN`, `EM_GMEDIO_SIGNIF_MIN`, `AVM_SEVERA_MAX` |
| EAo nativa | Vmax · G. medio · AVA · AVA indexada · planimetría · DVI | `EA_BANDAS`, `AVA_SEVERA_MAX`, `AVA_MOD_MAX`, `EA_AVAI_*`, `EA_DVI_*` |
| EAo protésica y TAVI | G. medio · DVI | `EA_PROT_CRIT` (`savr_gmed_*`, `savr_dvi_*`) |
| Prótesis mitral | velocidad pico (apoyo) · G. medio · THP · AEO · DVI | `VM_PROT_T11`, `VM_PROT_EOA_*`, `VM_PROT_DVI_*` |
| IT | VC · EROA · Vol-R | `IT_CRIT` (`leveMax` / `modMax`, el molde de `itGradoDe`) |
| ET nativa | gradiente medio · VTI de entrada · THP (apoyo) · área | `ET_CRIT`, con el `op` de cada criterio |
| Prótesis tricúspide | los CINCO de la Tabla 19, de la columna elegida | `VT_PROT_T19` + `vtProtTipo()` |
| IP | THP | `IP_PHT_SEVERA` |
| EP nativa | velocidad máxima · gradiente máximo | `EP_GMAX_*`, con `epVmaxDeGmax` para pasar a m/s |
| Prótesis pulmonar | velocidad pico · gradiente medio, de la columna elegida | `VP_PROT_T15` + `vpProtTipo()` |

Los tres moldes: `_qvAsc` (ascendente, el severo incluido en su piso), `_qvDesc` (descendente, más
bajo es peor), `_qvBin` (binaria) y `_qvBinOp`, que **lee el operador del dueño** para elegir de
qué lado está el positivo: con `>` o `>=` arriba, con `<` o `<=` abajo.

⚠️ **LAS BANDAS NO LLEVAN PALABRAS DE GRAVEDAD, SOLO COLOR,** y el color nunca es lo único que
informa: cada corte lleva su número CON su unidad debajo, la categoría de ese parámetro va en
palabras debajo de la barra y el `aria-label` repite valor, categoría y cortes. El grado de la
lesión va en el encabezado. Lo fija TC-500: ningún rótulo de corte contiene una palabra de la
escala.

⚠️ **TRES PARÁMETROS NO LLEVAN BARRA Y EL MOTIVO ESTÁ MEDIDO:** los cortes del THP (500/200), del
reverso telediastólico (20) y del VTI de la aorta descendente (15/25) de la **insuficiencia
aórtica** viven como LITERAL dentro de `calcIA_ESC` y no en una constante, así que una barra
obligaría a copiarlos. Su fila sale como TEXTO y publica el corte igual, porque el badge que la
app escribe ya lo lleva adentro («Leve (>500ms)»). Sacarlos a una constante es tocar la cascada.

---

## 5 · La fuente: se cosecha, no se escribe

`_qvFuentes(clave)` junta, deduplicado:

1. el nodo `<x>-ref-fuente` de la propia lesión, que publica su constante (`IT_CRIT_FUENTE`,
   `ET_CRIT_FUENTE`);
2. el campo `fuente` de cada globo ⓘ que vive dentro de las cajas de esa lesión (`QV_CAJA`), que
   son las fuentes POR PARÁMETRO del registro `VINFO`;
3. la constante declarada en `QV_FUENTE`, para las dos lesiones que no publican fuente en ningún
   nodo.

⚠️ **SON LAS `caja-*` Y NO LAS `bloque-*`, Y LO MIDIÓ LA SONDA:** el nodo `et-ref-fuente` vive en
`campos-esten-tricuspide`, HERMANO del `bloque-*` y no su hijo, así que con los `bloque-*`
declarados la tarjeta de la IT y la de la ET salían **sin una sola fuente** —indistinguible de
«el cosechador no funciona»—.

⚠️ **DOS FUENTES PASARON A SER DATO Y NO COMENTARIO,** con el patrón de `IT_CRIT_FUENTE` y al lado
de su corte: `IP_CRIT_FUENTE` (el THP de la IP, ASE 2019 folio 463, y la declaración de que
integrar los cuatro signos es criterio de EcoSmart) y `VP_PROT_FUENTE` (ASE 2024 Tabla 15 folio
33). Y `DIAST_ALGO_FUENTE`, con los tres algoritmos.

⚠️ **LA ESTENOSIS PULMONAR NATIVA SIGUE SIN LÍNEA DE FUENTE, A PROPÓSITO:** el comentario de sus
tres cortes dice «(ESC/ASE)» sin folio, así que en este repo no están verificados al estándar de
la casa. Inventarle una cita sería respaldar un corte con una fuente que nadie abrió.
`docs/PENDIENTES.md` → **Q-2**.

---

## 6 · Las notas por lesión

`QV_NOTA`, leída por la clave del **dueño** y no por el rótulo de la lesión —la frase de
integración es de la PRÓTESIS y no de la estenosis nativa—.

- **`prot:tricuspide` y `prot:mitral`** → `QV_INTEGRA_TXT`, **una sola constante** con las
  palabras que fijó Maicol, más su tabla. Las dos aplican la MISMA regla de dos o más positivos y
  su tabla publica la MISMA columna («Suggests significant stenosis»): con dos textos, el día que
  uno se retoque dejan de decir lo mismo de la misma regla. La frase **declara que la regla no es
  de la guía**, que es lo que la orden pide.
- **`insuf:aortica`** → la línea del reverso diastólico. **No escribe ningún número:** los dos
  cortes de la TAVI viven como constante LOCAL dentro de `eteTaviRPV` y copiarlos sería un segundo
  dueño. Dice que hay dos fuentes y cuántos niveles tiene cada una, con su folio.

---

## 7 · La tarjeta de la función diastólica

Lee el dueño del cálculo —`diastASE2025Evaluar`, `diastBSE2024Evaluar`, `diastASE2016Evaluar` o
`diastFAEvaluar(algo)` con fibrilación auricular—, la MISMA función que llena la ventana 🧭 y que
firma el cuadro gris y el informe. Las filas, su estado de TRES valores (positivo, negativo y SIN
EVALUAR) y su agrupación por paso se publican tal como ese objeto las trae.

- La **categoría** se lee de `dd-interp` y no se vuelve a derivar. Medido: la tarjeta publica
  exactamente la misma cadena que el cuadro gris en las SEIS combinaciones (tres guías × dos
  ritmos).
- El **suplementario Ar−A** sale de `ASE_SUPLEMENTARIOS`, cuyo rótulo YA lleva el operador y el
  folio escritos por su dueño (el CORTOS6 los dejó ahí). Sale **solo con la ASE 2025**, porque es
  la nota de SU figura.
- La **fuente** sale de `DIAST_ALGO_FUENTE`.

⚠️ **CON LA ASE 2025 EN RITMO SINUSAL EL ALGORITMO TIENE DIECISIETE FILAS** y la tarjeta se
desplaza **333 px** por dentro. Es lo que esa guía publica; la ventana 🧭 sigue siendo el lugar
donde se ve entera con su diagrama. `docs/PENDIENTES.md` → **Q-3**.

---

## 8 · La fuga paravalvular aórtica

Los **dos textos fijos** que vivían debajo del resultado —tres oraciones de prosa que todo
paciente leía siempre, dijeran algo de él o no— pasaron a `VINFO['ea-pvl']`: la misma información
en menos palabras, con su folio (ASE 2024, Tabla 8, folio 23) y a un toque. **Los cortes no se
repiten en la tarjeta:** los publica la propia fila del resultado y el renglón «Criterio que
decide» de al lado. Lo que la tarjeta explica es la REGLA, que no tenía dónde leerse.

Medido: las dos frases no aparecen en el texto renderizado de la pestaña, contadas sobre un
denominador de 6264 caracteres.

---

## 9 · Trampas de esta zona

1. **LA CLAVE DE LA BARRA SALE DEL DUEÑO Y NO DEL ROTULO DE LA LESION.** Con el rótulo, una
   prótesis aórtica dibuja las bandas NATIVAS y se ve perfectamente bien (§4).
2. **UN CRITERIO RETIRADO SE RECONOCE POR LAS PALABRAS QUE LA PANTALLA ESCRIBE,** y la prótesis
   tricúspide usa unas que no están en `V2D_PQ_RETIRO` (§3).
3. **«HAY ALGO QUE DECIR» INCLUYE LA LINEA INTEGRADA Y NO SOLO LAS FILAS.** La prótesis pulmonar
   sin columna publica el MOTIVO y ninguna fila, así que la tarjeta se iba por la salida de «sin
   parámetros cargados» sobre un paciente con sus dos campos cargados.
4. **BARRER «sever» EN EL `textContent` DE LA TARJETA DE LA PULMONAR DA UN FALSO:** su línea de
   fuente dice «esa tabla no publica una columna de severa», o sea exactamente lo contrario. Se
   barren los nodos que PUBLICAN un veredicto. Es la trampa que el PRO-C ya tiene escrita.
5. **`VINFO`, `QV_INTEGRA_TXT` y `DIAST_ALGO_FUENTE` SON `const` DE MODULO** y no propiedades de
   `window`: un ayudante que use `in window` devuelve «NO EXISTE» sobre constantes que sí existen.
   Es la trampa de `ECO_AYUDA`, pagada otra vez —cuatro condiciones de TC-500 en rojo sobre un
   árbol perfecto—.
6. **LAS CUATRO SECCIONES DE VALVULA SE CIERRAN SOLAS A MITAD DE CORRIDA.** Medido: entre dos
   lecturas CONSECUTIVAS de `ete-seccion-valv-mitral` —sin una sola llamada en medio— pasó de
   `block` a `none`, así que lo cierra un temporizador de la propia app. Sin reabrir, el globo
   EXISTE y mide 0×0 y el clic aborta sobre un botón perfecto.
7. **SE ABRE LA PESTAÑA DEL PROPIO BOTON, NO SIEMPRE VALVULAS.** El globo de la diastólica vive en
   el DOPPLER: abrir Válvulas a ciegas navega FUERA de su pestaña y el clic aborta con
   «tab-doppler:none».
8. **Y SI DESPUES DE ABRIR LA PESTAÑA EL BOTON SIGUE MIDIENDO 0×0, HAY QUE ABRIR SU CAJON.**
   `valvDatosTog` TOGGLEA, así que preguntarle al `caja-*` por su `display` no sirve: lo que está
   escondido es el `bloque-*` de adentro. Se pregunta por la geometría del PROPIO botón.
9. **EL ACENTO GRAVE DENTRO DEL CUERPO DE UN CASO.** Me lo comí **once** veces en esta tanda, todas
   en comentarios míos. `scripts/check_backticks.py` dio la línea exacta las once —y **una se me
   pasó por mandar su salida a `/dev/null`**, que es exactamente lo que este repo prohíbe—.
10. **EL `\s` QUE SE COCINA.** Una barra invertida dentro del cuerpo de un caso o del template de
    una sonda se cocina, así que `\s` llega al motor como la letra `s`: dejó una condición de
    TC-500 en rojo sobre dos reglas de CSS perfectas. Va por `indexOf`.

---

## 10 · Cómo medir esta zona

```bash
node scripts/_probe_qtarj.mjs --solo pos0      # dónde cabe el botón, a tres anchos
node scripts/_probe_qtarj.mjs --solo mec       # los ocho botones y las tres puertas de cierre
node scripts/_probe_qtarj.mjs --solo tarj      # el contenido contra el dueño, ocho lesiones
node scripts/_probe_qtarj.mjs --solo prot3     # mitral y aórtica protésicas
node scripts/_probe_qtarj.mjs --solo trip      # tricúspide bio y mecánica, y la regla
node scripts/_probe_qtarj.mjs --solo pulm      # pulmonar bio, homoinjerto y los tres sin columna
node scripts/_probe_qtarj.mjs --solo diast     # las tres guías por los dos ritmos
node scripts/_probe_qtarj.mjs --solo pvl       # la fuga aórtica y el censo de conteos
node scripts/_probe_qtarj.mjs --solo fijos     # censo de la prosa fija de la pestaña
node scripts/_probe_qtarj.mjs --solo maqueta   # los dos temas y los cuatro anchos
node scripts/_probe_qtarj.mjs --solo ab        # el A/B de controles, con el PDF de verdad
node scripts/test_clinico.mjs --solo TC-500
```

El A/B contra otro árbol se corre con `--file /tmp/index.QHEAD.html`.

---

## → La tanda «P» (2026-10-18): Referencias con subpestañas, buscador y «Ver referencia»

La pestaña **Referencias** pasó a **cinco subpestañas** (Dimensiones · Función · Válvulas · Aorta ·
Otros hallazgos) con un **buscador** y, en las tarjetas ⓘ que tienen entrada, un botón **«Ver
referencia»** con su «Volver». La subpestaña **Aorta** sumó la **tabla de umbrales de cirugía**
verificada contra la ESC 2024, y la entrada **vieja del VD** (`ref-vd`, ASE 2015, con la onda S′
tipeada en «≥ 10») **se retiró**: la que corresponde es `ref-vd2`, derivada del dueño.

**No cambió ningún cálculo, corte, operador ni texto del informe**, y el Excel quedó en 440
columnas idéntico.

**Está todo en `docs/mapa/referencias-subpestanas.md`**: el reparto (`REF_SUBTAB`), el índice del
buscador y su normalización, el mapeo `VINFO_REF` con las cinco tarjetas que no llevan botón, la
tabla `AO_CX_T` con su folio por fila y su sondeo del dueño, y nueve trampas medidas.
