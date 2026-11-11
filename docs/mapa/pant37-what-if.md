# Mapa — el «WHAT IF» de la estenosis aórtica (tanda PANT-37, 2026-11-11)

Un simulador **ilustrativo** de qué pasaría si el flujo aumentara. **No es una calculadora de eco
dobutamina, no tiene campos nuevos y no guarda nada.** Lo que mueve es el **dibujo 2D** y su
propio panel. Sólo estenosis aórtica **nativa**.

Está por **nombre de función, de constante y de id**, no por número de línea.

---

## 1 · Las piezas

| Qué | Nombre |
|---|---|
| El botón y su ⓘ | `#wi-btn` · `_wiFilaBoton(li)` · `_wiBotonSync(b)` |
| Dónde se engancha | `v2dPintarTarjetas` → `par[0] === 'v2d-esten' && it.valv === WI_VALV_NOM` |
| El nombre de la válvula | **`WI_VALV_NOM`**, derivado de `V2D_VALVS`, nunca escrito a mano |
| **La situación — dueño único** | **`wiSituacion()`** → `{sit, falta, D}` con `sit` en `disc` · `conc` · `faltan` · `prot` |
| Los datos medidos | `wiDatos()` → todo lo que la cuenta necesita, sin reclasificar ningún grado |
| **La cuenta — dueño único** | **`wiCuenta()`** → datos, nunca marcado |
| **La ley del área, pura y expuesta** | **`wiAreaEn(a0, m, q0, q)`** |
| El panel | `#wi-panel` · `wiAbrir()` · `wiCerrar()` · `wiTog()` · `wiReset()` |
| El pintor | `wiPintar()` · `_wiFila(rot, antes, desp)` · `_wiHabilitar(on)` · `_wiSeg(id, on)` |
| Las gráficas | `_wiChart(id, o)` · la paleta, `_wiPal()` |
| El estado de la simulación | `_wiSim` (memoria), de solo lectura por **`wiSimEstado()`** |
| El cableado, una sola vez | `_wiCablear()` con la bandera `_wiCableado` |
| Que no se salga de la pantalla | `_wiAcotar()` |
| La sincronía en vivo | `wiRefrescar()`, con su propia foto `_wiFoto` |
| El globo | `VINFO['wi-aplica']` → `_wiGloboInfo()` ← **`WI_GLOBO`**, dueño único del texto |
| **El puente al dibujo** | **`v2dWhatIf({ampRazon, durRazon, vmax})`** · `v2dWhatIfPuesto()` |
| La marca sobre el dibujo | `#wi-chip` · el rótulo `#wi-dib-vmax` |
| Cobertura | **TC-825 a TC-831** · sondas `_probe_p37a/b/c.mjs` · barrido `_mut_p37.py` |

---

## 2 · La situación (A2) — y por qué el gradiente se pregunta al revés

`wiSituacion()` **no retipea ningún corte**: los lee de `eaGradoCalculado()`, que ya devuelve
`gVel`, `gGrad` y `gAva` calculados con `EA_BANDAS` y con `avaEsSevera`.

```
prot   → eaGradoNoPublica(sv('va_morf'))         — va PRIMERO
faltan → Vmax · G. medio · AVA continuidad · Volumen latido (VSFVI o FEVI) · VDFVI
disc   → gAva === 'severa' && gVel !== 'severa' && gGrad !== 'severa'
conc   → todo lo demás
```

⚠️ **EL GRADIENTE PUEDE SER `null` ESTANDO CARGADO.** Por debajo de `EA_BANDAS.gmedModMin` (20)
`eaGradoCalculado` devuelve `gGrad: null`, que significa «este criterio no se pronuncia» y **no**
«sin estenosis». Para la situación eso sigue siendo **por debajo del rango severo**, así que la
condición se escribe `gGrad !== 'severa'`. Con `gGrad === 'moderada'`, una estenosis de 0,8 cm²
con gradiente de 12 mmHg —el bajo flujo más claro que hay— se leería como **concordante**. Lo
fija la mutación 10 del barrido.

⚠️ **EL AZUL ES EL PAR `btn-primary` / `btn-ghost`**, el mismo de `indicSyncBoton` en el botón
«Evidencia» y el de las ocho pastillas de válvula. Un hex propio sería un cuarto azul que ninguna
variable sigue. **Sólo con `disc`**; nunca se oculta.

---

## 3 · El panel (B1)

Vive **dentro de `#v2d-col-esten` y FUERA del `<ul>`**: `v2dRefrescar` rehace los `<li>` enteros
en cada tecleo, así que un panel adentro de la tarjeta se destruiría —con su estado y su
arrastre— una vez por gesto.

```
#v2d-col-esten{position:relative}
#wi-panel{position:absolute;top:100%;left:0;width:300px;max-width:88vw;z-index:6}
@media (max-width:768px){ #wi-panel{position:static;width:auto;transform:none!important} }
```

⚠️ **SALE DESDE `left:0` Y CRECE HACIA LA DERECHA.** Con `right:0` un panel de 300 px sobre una
columna de 184 se metía 116 px hacia la **izquierda**, o sea **encima del dibujo**, que vive en la
columna 2. Medido: intersección con `#v2d-dibujo` = **0 px**, a 11 px debajo de la tarjeta.

⚠️ **SE OCULTA CON UNA CLASE Y NO CON `hidden`**: `.btn` declara `inline-flex` y le gana al
`[hidden]` de la hoja del navegador. Es lo que PANT-30 pagó.

**El arrastre se portó de la demo**, porque la app no tiene ningún panel arrastrable: lo
arrastrable son lienzos que giran un 3D. `pointerdown` que ignora los clics en un `<button>` —sin
eso la ✕ arranca un arrastre en vez de cerrar—, `setPointerCapture`, `pointermove` que escribe
`transform:translate(…)`, y `_wiAcotar()` al soltar, al abrir y al cambiar el tamaño de la
ventana.

---

## 4 · Las fórmulas (B4 y C2)

```
Q   = VS / tiempo de eyección        (mL/s, con el tiempo en SEGUNDOS)
AVA(Q) = AVA medida + m × (Q − Q0)/100,  acotada [0,15 · 2,5]   ← wiAreaEn, sólo en «Se abre»
G(Q)   = G0 × ( (Q/Q0) × AVA0/AVA(Q) )²
V(Q)   = V0 ×   (Q/Q0) × AVA0/AVA(Q)
```

Con el área **fija**, `AVA(Q) = AVA0` y las dos se reducen a `G0·(Q/Q0)²` y `V0·(Q/Q0)`: **una
sola construcción para los dos modos**, que es lo que hace imposible que divergan.

⚠️ **LA FRECUENCIA NO ENTRA EN EL FLUJO.** El flujo es el de la **eyección**, no el gasto
cardíaco. La frecuencia mueve el latido del dibujo y la línea de lectura, que es la única que
pasa a L/min. Lo fija la mutación 24.

⚠️ **EL TIEMPO DE EYECCIÓN ESTÁ EN MILISEGUNDOS** en su dueño `tango_te`, y la fórmula lo pide en
segundos. Sin la división, un flujo de 180 mL/s sale 0,18.

**El tope:** `WI_VS_MARGEN = 2` mL. Medido con VDF 120 → el deslizador topa en **118** (98 % en
modo FEVI) y el volumen simulado **nunca pasa del VDF**.

**La línea de lectura (B7):** `Q_t = Q0 × √(corte/G0)`, con el corte leído de
`EA_BANDAS.gmedSevMin` y no escrito a mano; `VS_t = Q_t × ET`; el valor en L/min es
`VS_t × FC_sim / 1000`, que es lo que vuelve coherente la frase «con ~X L/min: a H lpm serían ~Y
mL».

**La proyección a 250 mL/s (C3)** sale de la **misma** `wiAreaEn`, y el corte de su frase de
`AVA_SEVERA_MAX`.

---

## 5 · El dibujo (B8)

`v2dWhatIf(o)` vive **dentro de la IIFE del motor** y es lo único que lo alimenta desde afuera.

⚠️ **LA SIMULACIÓN ENTRA ENTRE `v2dEstado()` Y `S`, NUNCA DENTRO DE `v2dEstado()`**, y esa es la
decisión central de la Parte B: `v2dEstado` alimenta también `v2dPintarTarjetas` y
`v2dPintarCav`, así que tocarlo movería las tarjetas y la tabla de cavidades.

⚠️ **LO QUE ENTRA SON RAZONES Y NO VALORES ABSOLUTOS**, y eso le da una propiedad **medible**: con
el panel abierto y **nada movido** las dos razones valen 1, así que `amp` vale `AMP[S.kvi]` y
`dur` vale `DUR0` — el dibujo es **idéntico** al real, verificado por el atributo `d` de sus dos
trazos a una fase fija. Lo fija la mutación 29.

```
amp = clamp(AMP[S.kvi] × FEVIsim/FEVI0, 0.10, 1)      S.dur = clamp(DUR0 × FC0/FCsim, 0.5, 8)
```

⚠️ **NO HAY CHORRO AÓRTICO, Y NO ES UN OLVIDO.** El dibujo de esta app **no tiene aorta** y sus
tres chorros son de **regurgitación**; por debajo del velo aórtico lo dibujado es la **aurícula
izquierda**. La Vmax simulada se publica como **rótulo** dentro del lienzo (`#wi-dib-vmax`, con
halo por `paint-order`), más el chip. Está declarado en `docs/PENDIENTES.md` → **P37-a · 1**.

**Las tres restituciones**, las tres por el mismo camino (`v2dWhatIf(null)`): la ✕, «Volver a lo
medido» y **las cuatro puertas de la vista 2D** —`showTab`, `limpiarCampos` («Nuevo estudio»),
`RECALC_MODULOS` y el botón—, colgadas de **`v2dCerrar`**, que es su embudo.

---

## 6 · Lo que NO hace

- **No escribe un solo campo del estudio.** Los cinco controles llevan prefijo **`wi-`** con guión
  **MEDIO** y están en las **dos** listas (`_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`).
- **No agrega ninguna columna de Excel** (457) ni ningún campo guardado.
- **No toca el informe, el EN SUMA, el PDF ni el PPT**, medido con el panel abierto y simulando al
  máximo.
- **No guarda nada**: `_wiSim` y los dos supuestos viven en memoria y se reinician en cada
  apertura.
- **No mueve ninguna tarjeta, ninguna pastilla ni ningún grado**, medido contra
  `eaGradoCalculado()` entero.

---

## 7 · Las trampas que esta tanda pagó

- **`v2dRefrescar` sale temprano** cuando el JSON de `v2dEstado()` no cambió, y cambiar la Vmax o
  el gradiente **no lo mueve**. Colgar ahí la sincronía del panel lo dejaría con los números del
  gesto anterior justo en los dos campos que más importan: `wiRefrescar` lleva **su propia foto**.
- **Los eventos del propio panel se descartan**: los deslizadores emiten `input`, y sin esa guarda
  cada movimiento se repintaría dos veces y el segundo pisaría el valor recién soltado.
- **La pastilla no se puede prender dentro de la ventana del embudo de restauración**: después de
  `limpiarCampos` hay que **esperar** antes de tocarla, o `cargarValvPills` la apaga sola y la
  escena queda sin tarjeta — que se lee igual que «el botón no se agregó».
- **Sin `showTab('valvulas')` delante, el panel 2D no tiene caja** y todo mide 0×0.
- **`ava_cont` es `readonly`**: lo calcula la continuidad, así que una escena siembra sus **tres**
  insumos (diámetro y VTI del TSVI, y VTI aórtico) y no el área.
- **El acento grave dentro de un comentario propio**, otra vez, en una sonda y en un caso.
- **Una excepción contra el árbol base TAPA A LA SIGUIENTE.** TC-827 caía por `TypeError` con
  **cero** condiciones; arreglar el acceso que la traza señalaba destapaba el próximo, tres
  veces seguidas —el `min` del deslizador, el `parentNode` del campo supuesto y la tarjeta del
  globo—, con el mismo síntoma las tres. Lo que lo cierra es **barrer el bloque entero por
  patrón** y no perseguirlos de a uno.
- **Y ese acento grave fue en el comentario del arreglo, y dejó JS VÁLIDO**: `node --check`
  pasó y lo cazó `check_backticks.py`. Es la agravante que PANT-31 dejó escrita.
