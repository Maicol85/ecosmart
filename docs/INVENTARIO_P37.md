# Inventario PANT-37 — el «What if» de la estenosis aórtica

Commit 1 de la tanda. **Solo lectura: no toca `index.html` ni un byte.** Linea base
`f1412a2`, sello `v20261111-0442`, md5 `44207a10`, 174.869 lineas — verificado con
`git rev-parse` (HEAD = origin/main), `wc -l`, `wc -c` y `md5`, y contra lo que
`CLAUDE.md` publica en «Estado vigente» tras PANT-36. **Coincide en las cuatro cifras.**

La referencia de diseno es `docs/3d/ecosmart_demo_what_if.html` (322 lineas, 27.787 B),
leida entera. **No se versiona, no se mueve y no se borra** — es del medico.

Todo lo de abajo esta por **nombre de funcion, de constante y de id**, no por numero de
linea: la linea cambia en cada edicion, el nombre no.

---

## 0 · Las hipotesis de la orden, una por una

| # | Hipotesis de la orden | Veredicto | Lo medido |
|---|---|---|---|
| a1 | «La tarjeta de Estenosis aortica de Valvulas» | **PRECISADA** | La tarjeta que la demo refleja es el `<li>` de la **columna «Estenosis» de la vista 2D** (`#v2d-esten`), no una tarjeta del formulario de Valvulas. Su «Ocultar criterios» es `V2D_PQ_OCULTAR`, su tabla de criterios es el desplegable «por que» del Y2 |
| a2 | El boton va «abajo a la derecha de la tarjeta», SIEMPRE visible | **FALSA en su letra** | El `<li>` aortico **existe solo** si la pastilla de estenosis esta prendida o si hay veredicto protesico publicado (`v2dEstado`: «SOLO LAS LESIONES QUE EXISTEN»). Sin lesion consignada la columna publica una linea gris y no hay tarjeta donde poner nada |
| a3 | El azul de «Evidencia» | **CONFIRMADA** | `indicSyncBoton()` hace `classList.toggle('btn-primary', hay)` / `toggle('btn-ghost', !hay)`. `.btn-primary{background:var(--accent);color:#fff}` |
| a4 | Con protesis aortica, ¿que muestra la tarjeta? | **CONFIRMADA** | La tarjeta **existe** y publica el **veredicto protesico** (`_v2dVeredictoProt('ea-det-sev')`), **sin chip y sin grado**: la app no gradua la estenosis protesica con la escala nativa |
| b1 | Los datos de la EAo nativa existen y tienen dueno | **CONFIRMADA** | Ver §2 |
| b2 | «bajo flujo = VS indexado < 35 mL/m²» | **CONFIRMADA — la app ya usa ese 35** | La formula TANGO publica «VS normalizado = 35 ml/m² × ASC» y `cxTango()` calcula `const vsn = 35 * asc`. **No hay otro corte de bajo flujo en la app**, asi que el texto del globo no contradice nada |
| c1 | El dibujo 2D «como se anima» | **CONFIRMADA** | `S.phi` avanza `dt/S.dur` en `_v2dLoop`, con un cuadro sincronico al abrir |
| c2 | «que controla … la frecuencia» | **FALSA** | **El dibujo no tiene frecuencia del paciente.** `S.dur` nace en **2,6 s por ciclo** y **nadie la escribe nunca**: la unica aparicion fuera de su declaracion es la lectura de `_v2dLoop`. El latido es siempre el mismo, con cualquier FC cargada |
| c3 | «el chorro aortico» | **FALSA** | **No existe.** `updJet(k,…)` dibuja **tres** chorros y los tres son de **regurgitacion** — `D.JET` tiene las claves `it`, `iao` e `im`, con tres variantes por grado. El esquema **no dibuja la aorta**: es un sector de cuatro camaras con el apex arriba (`yTop:54`) y las auriculas abajo (`yBot:250`), y por debajo de la valvula aortica lo que hay dibujado es la auricula izquierda |
| c4 | «se puede alimentar desde afuera … SIN alterar los datos cargados» | **CONFIRMADA, con una salvedad que decide el diseno** | `v2dSync()` es el **unico** puente estado→dibujo y copia 16 claves a `S`. Pero `v2dEstado()` alimenta **ademas** las tarjetas y la tabla de cavidades, asi que la simulacion **no puede** entrar por `v2dEstado` sin mover las tarjetas, que es justo lo que la orden prohibe |
| d1 | «la columna derecha donde ira el panel flotante» | **CONFIRMADA y medida** | `#v2d-col-esten`, `grid-column:3`, **184 px fijos**; ver §4 |
| d2 | «si existe algun panel arrastrable en la app que sirva de patron» | **FALSA** | **No hay ningun panel arrastrable.** Lo arrastrable de la app son **lienzos** que giran un 3D (`#m3d-cv`, el del `lv3d`, el del pulmon) y el buscador de Referencias, que solo marca el gesto. El patron de arrastre hay que portarlo de la demo |
| e1 | «los graficos que la app ya dibuja … y su paleta» | **CONFIRMADA** | 71 `<svg>` y 15 `createElementNS`; paleta en §5 |
| f1 | «que pruebas fijan el texto o la estructura de la tarjeta» | **CONFIRMADA — y son muchas** | Ver §6 |

---

## 1 · La tarjeta, por nombre

| Que | Nombre |
|---|---|
| La columna derecha | `#v2d-col-esten` → `<ul class="v2d-lista" id="v2d-esten">` |
| Quien crea cada tarjeta | `v2dPintarTarjetas(E)` → **`_v2dLi(item)`** |
| De donde sale el item | `v2dEstado().esten`, una entrada por valvula con lesion |
| El orden de los hijos del `<li>` | `.v2d-valv` (nombre) · `.v2d-morf` (opcional) · frase · `.v2d-chip` (opcional) · el «por que» (`_v2dPqPintar`) |
| El desplegable | `.v2d-vercrit` con `V2D_PQ_VER` / `V2D_PQ_OCULTAR` («Ver criterios» / «Ocultar criterios») |
| El manejador del desplegable | **por propiedad** (`b.onclick = …`), nunca `setAttribute('onclick')` |
| Quien repinta en vivo | **`v2dRefrescar()`**, colgado de UN oyente de documento (`input` y `change`, en burbuja), con foto JSON `_v2dFoto` |
| Las cuatro puertas que cierran la vista | `showTab`, `limpiarCampos`, `RECALC_MODULOS` y el propio boton — todas `v2dCerrar()`, idempotente |

⚠️ **`v2dRefrescar` REHACE LOS `<li>` ENTEROS.** Todo lo que se agregue adentro de la
tarjeta se **destruye y se vuelve a crear** en cada repintado: el manejador va por
**propiedad** (como `.v2d-vercrit`) y **el panel no puede vivir adentro del `<li>`**.

⚠️ **EL TEXTO DE LA TARJETA ES UNA ASERCION DE LA SUITE.** `_v2dLi` no escribe un solo
`innerHTML`: todo por `textContent`. Y TC-482 y TC-483 comparan
`String(li.textContent).trim()`, asi que **cualquier** texto nuevo dentro del `<li>`
—el rotulo de un boton incluido— mueve esas aserciones. Ver §6.

---

## 2 · Los datos de la estenosis aortica nativa, y su dueno

**El dueno unico del grado es `eaGradoCalculado()`**, que devuelve ya calculado todo lo
que la situacion del What if necesita: `grado`, `criterio`, `gVel`, `gGrad`, `gAva`,
`gVelGrad`, `gDvi`, `gPlan`, `gAvai`, `dvi`, `plan`, `avai`, `vmax`, `gmedio`, `ava`.
**No hay que reclasificar ni un numero.**

| Dato | id / dueno | quien lo pone | unidad |
|---|---|---|---|
| Vmax aortica | `vmax_ao` | **el medico** | m/s |
| Gradiente medio | `gmedio_ao` | **el medico** | mmHg |
| Area valvular por continuidad | `ava_cont` | **el medico** (o la continuidad) | cm² |
| Area indexada | `ava-idx` (celda calculada) · `eaGradoCalculado().avai` | **calculada** | cm²/m² |
| DVI | `dvi-val` (celda calculada) · `eaGradoCalculado().dvi` | **calculada** | — |
| Diametro del TSVI | `diam_tsvi` | el medico | mm |
| VTI del TSVI | `itv_tsvi` | el medico | cm |
| VDF del VI | `vdfvi` | **el medico** | ml |
| VSF del VI | `vsfvi` (manual) · `vauto-vsfvi` (auto) | medico / **calculado** | ml |
| FEVI | `fevi` | **el medico** | % |
| Volumen latido (VS) | `vauto-vol-lat` · dueno **`viVolAutoSync()`** | **calculado** = `VDFVI − VSFVI` | ml |
| Frecuencia cardiaca | **`ao_fc`**, espejado con `hemo_fc` por `aoFcSync` | el medico | lpm |
| Tiempo de eyeccion | **`tango_te`** (dueno) · espejo `va-esp-et`, por `etEditado` | el medico | **ms** |
| Superficie corporal | **`getBSA()`** | calculada del tab Paciente | m² |

⚠️ **EL TIEMPO DE EYECCION ESTA EN MILISEGUNDOS** y la formula del flujo lo pide en
segundos. **`tango_te` es el dueno**, no `va-esp-et`: el espejo se repinta desde el dueno
en `eaAtPintar`.

⚠️ **`vauto-` y `va-esp-` NO SON DEL ESTUDIO** y estan en las **dos** listas
(`_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`). Es la convencion que todo control
auxiliar nuevo tiene que seguir, con **guion MEDIO**.

### Los cortes, y donde viven — **ninguno se retipea**

| Corte | Dueno | Valor |
|---|---|---|
| Vmax: esclerosis / leve / moderada / severa | `EA_BANDAS.vmax` | `<2,6` · `<3,0` · `<4,0` · resto |
| Gradiente medio severo | `EA_BANDAS.gmedSevMin` | **40** mmHg, con `>=` |
| Gradiente medio moderado | `EA_BANDAS.gmedModMin` | 20 mmHg, con `>=`; **por debajo se abstiene** |
| AVA severa | **`AVA_SEVERA_MAX`** / `avaEsSevera(ava)` | **≤ 1,0** cm² |
| AVA moderada | `AVA_MOD_MAX` / `avaEsModerada(ava)` | ≤ 1,5 cm² |
| AVA que no gradua | `EA_BANDAS.avaSinMin` (= `AVA_MOD_MAX`) | `>` 1,5 cm² |
| VS normalizado («bajo flujo») | literal de `cxTango()` | **35** ml/m² × ASC |

**«Severa por area» es exactamente `eaGradoCalculado().gAva === 'severa'`**, que sale de
`avaEsSevera` tras `avaEsValida` —que falla CERRADO ante vacio, NaN, 0 y negativos—.

⚠️ **EL GRADIENTE PUEDE SER `null` ESTANDO CARGADO.** Con `gmedio < 20` la funcion
devuelve `gGrad: null`, que significa «este criterio no se pronuncia» y **no** «sin
estenosis». Para la situacion del What if eso sigue siendo **por debajo del rango
severo**, asi que la condicion se escribe `gGrad !== 'severa'` y no `gGrad === 'moderada'`.

---

## 3 · El dibujo 2D

| Que | Nombre |
|---|---|
| El lector del estado | `v2dEstado()` → datos, **nunca HTML** |
| El puente estado → dibujo | **`v2dSync()`**, que copia 16 claves a `S` y llama a `applyAo()` y `fitView()` |
| El estado del motor | `var S={it,iao,im,et,eao,em,dvi,dai,dvd,dad,kvi,kvd,pt,pao,pm,geo,aoup,play,dur:2.6,phi:0}` |
| El bucle | `_v2dLoop` · `v2dArrancar()` · `v2dParar()` · `v2dCorriendo()` |
| Una fase fija | `v2dFase(p)` — **expuesta**, no cambia ningun dato |
| La contraccion del VI | **`S.kvi`**, con `AMP=[1,0.55,0.25]` — **TRES tramos, no un continuo** |
| De donde sale `kvi` | `_v2dTramo(_v2dTxt('fevi-interp'), [['severamente',2],['moderadamente',1],['levemente',1]])` |
| La apertura de la valvula | `FR=[1,0.72,0.5,0.3]` por grado de estenosis (`S.eao`) |
| Los chorros | `updJet(k,sev,I,sh,t)` con `JORG`, `JOFF`, `JALPHA` — **solo `it`, `iao`, `im`** |
| La duracion del ciclo | **`S.dur`, fija en 2,6 s, que nadie escribe** |

⚠️ **TRES COSAS QUE ESTO DECIDE.**
1. **La contraccion simulada no puede entrar como FEVI**: el dibujo solo entiende tres
   tramos. Hace falta una **amplitud** propia del What if, o traducir la FEVI simulada a
   esos tres tramos con los mismos sintagmas que la capsula publica.
2. **La frecuencia simulada no tiene por donde entrar hoy**: `S.dur` es una constante.
3. **El chorro aortico anterogrado no existe y no tiene lugar geometrico.** Las bisagras
   del velo aortico estan en `y≈171-178` y las puntas en `y≈188-191`, o sea que el
   ventriculo queda **arriba** (y por eso el chorro de insuficiencia aortica de `D.JET.iao`
   sube) y la aorta quedaria **abajo** — donde lo dibujado es la auricula izquierda y, mas
   abajo, el borde del sector. **No hay lugar para un chorro anterogrado sin pintarlo
   encima de la AI.**

⚠️ **Y UNA CUARTA, QUE ES LA QUE ORDENA LA PARTE B**: la simulacion tiene que entrar
**entre `v2dEstado()` y `S`**, nunca dentro de `v2dEstado()`. `v2dEstado` alimenta tambien
`v2dPintarTarjetas` y `v2dPintarCav`: tocarlo ahi moveria las tarjetas y la tabla de
cavidades, que es exactamente lo que la orden prohibe.

---

## 4 · La columna derecha

```
#v2d-card    { width:min(900px,100%); margin:0 auto }
#v2d-grid    { display:grid; grid-template-columns:184px 240px 184px; gap:8px 10px;
               justify-content:center }
#v2d-dibujo  { grid-column:2 }      /* 240 px, medidos: el texto de fase pide 218,25 */
#v2d-col-insuf { grid-column:1 }    /* 184 px */
#v2d-col-esten { grid-column:3 }    /* 184 px  ← aca va el panel */
#v2d-cav     { grid-column:1/-1; grid-row:2 }
@media (max-width:768px) { una sola columna; #v2d-card{width:auto;margin:0} }
```

- Las tres zonas suman **608 px + 20 de gap = 628**, centradas en un panel de hasta
  **900 px**: sobran unos **136 px a cada lado**. Un panel flotante de ~300 px anclado a
  la columna derecha **cabe** sin salirse de la tarjeta.
- **El dibujo esta a la IZQUIERDA del panel** (columna 2 contra columna 3), asi que un
  panel que se expande a la derecha y hacia abajo **no lo tapa** por construccion.
- **A 768 px o menos la grilla se vuelve de una sola columna** y el orden visual pasa a
  ser el del marcado (dibujo, insuficiencias, estenosis, cavidades). Ahi un panel
  flotante de ancho fijo **desborda**: tiene que pasar a estatico y a ancho completo.
- `#v2d-cuerpo` **no tiene techo de alto ni `overflow`**, a proposito (Y1c): no hay nada
  que recorte un panel que crezca.

**El arrastre hay que portarlo de la demo**, porque la app no tiene ningun panel
arrastrable: `pointerdown` que ignora los clics en un `<button>`, `setPointerCapture`,
`pointermove` que escribe `transform:translate(tx,ty)`, `pointerup` que lo suelta, y
`touch-action:none` + `cursor:grab` en el encabezado — que es la convencion que los
cuatro lienzos giratorios de la app ya usan.

---

## 5 · La paleta y los graficos que la app ya dibuja

Variables de los dos temas (`:root` y `html.light-mode`), las que sirven para un grafico:

| variable | noche | dia |
|---|---|---|
| `--accent` | `#4f8ef7` | `#2f6fe0` |
| `--accent2` | `#7ec8e3` | `#1f5fb8` |
| `--text2` | `#9aa3bc` | `#5b6478` |
| `--border` | `#2a3050` | `#d6dce6` |
| `--bg3` | `#1e2333` | `#eef1f6` |

Mas las **43** apariciones de `--v2d-*`, que son la paleta propia de la vista 2D en los
dos temas.

⚠️ **UN DIBUJO NO ESCRIBE `var()` EN UN ATRIBUTO** — la regla fija del archivo, que
PANT-13 pago con `--card` y POP-B con `--amber`: un `fill="var(--x)"` como atributo de
presentacion con la variable inexistente es invalido en tiempo de computo y, como `fill`
se hereda, **cae en el negro de la raiz** sin avisar. El color se resuelve **al dibujar**,
desde los estilos calculados, con respaldo explicito por tema. Es lo que hacen el esquema
de la orejuela, el de la TGA y el de las anomalias coronarias.

⚠️ **Y EL TEMA DE ESTA APP NO ES `prefers-color-scheme`**: es la clase `light-mode` que
`loadTheme()` pone leyendo `localStorage.ett_theme`. Dos sondas de PANT-34 midieron **dos
veces el tema oscuro** antes de que lo cazaran.

---

## 6 · Las pruebas que fijan la tarjeta

La suite tiene **837 casos distintos** —**822** `TC-<numero>` mas **quince** `TC-GR-nn`—,
contados con el patron completo del id. **El ultimo numero usado es TC-824**, asi que los
casos nuevos de esta tanda **arrancan en TC-825**.

Los que tocan la vista 2D o el grado de la aortica (47 y 8 casos):

- **Comparan `li.textContent` de las dos columnas** → **TC-482** (45 condiciones, el caso
  dueno de la vista) y **TC-483**. Su ayudante `TARJ(id)` recorre `ul.children` y devuelve
  `{txt, vacio, chip, cls, bg}` con `txt` = `String(li.textContent||'').trim()`.
  **Un boton nuevo dentro del `<li>` mueve ese `txt`.**
- **TC-484** cuenta hijos de `v2d-insuf`; **TC-486** compara `v2d-insuf` antes y despues
  (**solo insuficiencias**: no lo mueve un cambio en la columna de estenosis).
- **TC-500** y **TC-501** miran el reparto de la vista.
- `eaGradoCalculado` lo fijan **TC-367 a TC-371**, **TC-464**, **TC-475** y **TC-495**:
  ninguno se mueve si el calculo no cambia, y **esta tanda no cambia ni un corte**.

Los otros 40 casos de la lista nombran `v2d` o «Ver criterios» de paso. **Cuales se
mueven de verdad se mide corriendolos**, no leyendolos: es el modo de falla que este repo
documenta una decena de veces —el censo no ve lo que la corrida completa si—.

---

## 7 · Lo que este inventario deja decidido para los commits 2 a 4

1. El boton y su ⓘ van **dentro del `<li>` aortico**, como ultimo hijo, en una fila
   alineada a la derecha. Manejador **por propiedad**. Se acepta y se declara que mueve
   el `txt` de TC-482 y TC-483.
2. **El panel vive fuera del `<li>`**, como nodo fijo del marcado dentro de
   `#v2d-col-esten`, oculto **con una clase** y no con `hidden` (`.btn` declara
   `inline-flex` y le gana al `[hidden]` del navegador).
3. La simulacion entra **entre `v2dEstado()` y `S`**, con un dueno unico, y las tarjetas,
   la tabla de cavidades y todos los datos quedan intactos por construccion.
4. Los ids nuevos llevan prefijo **`wi-`**, con **guion MEDIO**, agregado a las **dos**
   listas de exclusion. Ninguno termina en `-aviso` ni en `-badge`.
5. El refresco en vivo y el cierre se cuelgan de **`v2dRefrescar()`** y **`v2dCerrar()`**,
   que ya son los embudos de las cuatro puertas.
6. Ningun corte se retipea: salen de `EA_BANDAS`, `AVA_SEVERA_MAX` y `eaGradoCalculado()`.
