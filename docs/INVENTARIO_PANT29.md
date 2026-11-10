# Inventario de PANT-29 — SOLO LECTURA (commit 1)

Medido el 2026-11-10 sobre el arbol `88f9cb8` (cierre de PANT-28), sello **`v20261109-2009`**,
md5 **`c4fb0ba6`**, 169.360 lineas / 12.514.545 bytes. `index.html` **no se toca en este
commit**: su md5 es el mismo antes y despues.

La sonda es `scripts/_probe_pant29inv.mjs` (nombre propio, verificado con `ls`). Todo se mide
con el **gesto real** —el boton de la pestania por su `onclick`, la solapa por su id, la ficha
por su encabezado, el globo por su boton— y con las transiciones apagadas.

⚠️ **DOS DENOMINADORES VACIOS, CORREGIDOS ANTES DE CREERLE A LA MEDICION.** (1) La primera
corrida buscaba la pestania por el TEXTO del boton y daba `abierta: false` en las seis fichas:
se abre por el `onclick` que contiene `'refs'`, como hacen las sondas de PANT-28, y por
`getComputedStyle(display)` y no por `offsetParent`. (2) El globo `otr-rac` vive DENTRO de la
seccion plegable «variantes» de Otros, que nace cerrada: con el acordeon cerrado el boton mide
**0x0**, `_vInfoColocar` devuelve `null`, la tarjeta no abre y la cuenta da **cero caracteres
sobre un globo que si existe**. Hay que abrir `toggleEteSeccion('variantes')` primero.

---

## (a) REFERENCIAS

### Conteos de hoy (los tres que los casos vigilan)

| que se cuenta | hoy | lo cuenta |
|---|---|---|
| encabezados con `toggleRef` dentro de los nueve paneles | **43** | TC-509 (A?) y TC-761 (A5) |
| claves de `REF_SUBTAB` (9 paneles) | **31** | — |
| entradas del indice del buscador (`_refIndiceArmar`) | **41** | TC-502 y TC-763 (C1) |
| claves del mapa de «Ver referencia» | **50** | TC-762 (A1) |

### Las seis fichas que esta tanda toca

| id | titulo de su encabezado | panel | nace cerrada | caracteres de `textContent` | hijos |
|---|---|---|---|---|---|
| `ref-miocard` | 🧠 Miocardiopatías — Criterios Eco Clave | otros | si | **2702** | 10 |
| `ref-atleta` | 🏃 Corazón de atleta — cómo se diferencia de la miocardiopatía dilatada | otros | si | **20416** | 20 |
| `ref-chagas` | 🦠 Miocardiopatía chagásica — estadios, ecocardiograma y riesgo | otros | si | **25976** | 29 |
| `ref-coronarias` | 🫀 Anomalías coronarias congénitas — trayecto | congenitas | si | **445** | 2 |
| `ref-racong` | 🫀 Anomalías coronarias congénitas — clasificación, riesgo y ecocardiograma | congenitas | si | **36675** | 35 |
| `ref-congenitas` | 🧬 Cardiopatías Congénitas del Adulto (ESC 2020) | congenitas | si | **287** | 1 |

Las tres fichas de PANT-28 suman **83.067** caracteres de `textContent`; las dos que las
reemplazan y la ampliacion de la vieja tienen que caber en la extension del estilo de
`ref-miocard`, medida abajo. Eso es lo que el medico quiere decir con «excede ampliamente».

### El estilo de los resumenes de `ref-miocard`, medido

`ref-miocard` tiene **diez** hijos: cinco pares de `<div>`. El primero de cada par es el
**titulo** (`font-size:12px;font-weight:700;color:var(--accent2);margin-bottom:6px;`) y el
segundo el **cuerpo** (`font-size:12px;color:var(--text);line-height:1.8;margin-bottom:10px;`,
sin `margin-bottom` en el ultimo), con vinietas `• <b>Rotulo:</b> texto<br>`.

| resumen | caracteres (titulo + cuerpo) | vinietas | rotulos en negrita |
|---|---|---|---|
| MCH — Miocardiopatia Hipertrofica | 393 | 5 | 9 |
| MCDI — Miocardiopatia Dilatada | 276 | 3 | 5 |
| MCA — Miocardiopatia Arritmogenica | 641 | 5 | 12 |
| MNC — Miocardio No Compactado | 537 | 6 | 11 |
| ⭐ Amiloidosis Cardiaca | **850** | 7 | 20 |

**El techo de extension de esta tanda es 850 caracteres y 7 vinietas**, que es el de la
amiloidosis, el mas largo de los cinco.

⚠️ **COMO SE CITA: NO SE CITA.** Medido hijo por hijo, **ninguno de los cinco resumenes de
`ref-miocard` lleva linea de fuente**: no hay un `<div>` de 10 px con documento, anio y folio
como el que si tiene `ref-coronarias`. El estilo que la orden manda copiar es ese. Los
resumenes nuevos van **sin linea de fuente en pantalla** y cada frase queda trazada en
`docs/RESUMENES_P29.md`, que es lo que la verificacion del commit 2 exige. Queda declarado en
`docs/PENDIENTES.md` -> **P29-a**, porque es la unica lectura de «con el MISMO estilo» que se
puede medir, y la otra —agregarles una cita que sus cinco hermanas no tienen— seria inventar un
formato para ese sector.

### La ficha original de coronarias y el globo `otr-rac`

`ref-coronarias` son **445** caracteres en **dos** hijos: el cuerpo de 12 px con los tres
trayectos y el riesgo del interarterial, y la linea de fuente de 10 px (ASE 2020 Frommelt,
folio 266).

| medicion del globo | valor |
|---|---|
| `_otrRefClon('ref-coronarias')` (como lo midio PANT-28) | **478** caracteres |
| `#vinfo-card` ABIERTO con su boton real | **494** caracteres |
| boton, con «variantes» abierto | 15x11 px |

La diferencia de **16** caracteres es «Ver referencia →», que el globo agrega y el clon no.
**Los dos numeros son la linea base del commit 3**: los dos tienen que quedar idénticos.

⚠️ **EL MECANISMO: `VINFO['otr-rac'].dyn` llama `_otrRefClon('ref-coronarias')` SIN modo, y sin
modo esa funcion clona `r.children` ENTERO.** Para que la ficha crezca y el globo no, el
cambio minimo es que `_otrRefClon` SALTEE los hijos marcados: lo nuevo se marca y queda solo en
Referencias. No hace falta tocar `VINFO`, ni el boton, ni el modo `'tablas'` de
`otr-burbujas` —que se elige por `<table>` y no por esa marca—.

### La pestania «Cardiopatia congenita» de Referencias

Tiene **tres** fichas (`REF_SUBTAB.congenitas = ['congenitas','coronarias','racong']`). La
primera, `ref-congenitas` («🧬 Cardiopatias Congenitas del Adulto (ESC 2020)»), son **287**
caracteres en **un** hijo, con cuatro renglones `<b>CIA:</b>`, `<b>CIV:</b>`, `<b>PCA:</b>` y
`<b>Contraindicacion:</b>` — o sea que de las cardiopatias congenitas de la app hoy solo tres
tienen texto en Referencias, y ninguna con el formato de titulo + vinietas de `ref-miocard`.

---

## (b) CONTRACTILIDAD

### La pantalla de hoy

Columna del medio: el recuadro del bull's eye de 280 px con el boton **🫀 Ver en 3D**
(`#lv3d-btn`, 103x44 px) debajo; a la derecha, el recuadro «Territorio coronario (borde)».
Debajo, una `.card` con `#lv3d-fila`, que tiene **tres** hijos en este orden:
`#lv3d-bloque-hallazgos`, `#lv3d-bloque-botones` y `#lv3d-panel` —lo fija TC-490—.

`#lv3d-bloque-hallazgos` lleva el titulo «Hallazgos de motilidad» y `#contr-texto-informe`, que
lo escribe **`contrRenderInforme`** desde `contrGetLineasInforme()` —no raspando el div—.
`#lv3d-bloque-botones` lleva «🧹 Limpiar», «📄 Incluir bull's eye en PDF» y el `input` oculto
`contr_be_pdf`.

Los dos bloques comparten `background:var(--bg3);border-radius:10px;padding:10px 12px;` (CSS,
linea 4421). La maqueta la decide **`lv3dMaquetar`**: con el 3D abierto y por encima de 768 px
pone `minmax(0,1fr) minmax(0,210px) minmax(0,calc(46% + 118px))`.

### Medidas de las dos tarjetas, ANTES (linea base)

| ancho | 3D | hallazgos | botones | lienzo | datos | columnas |
|---|---|---|---|---|---|---|
| 1440 | cerrado | 930x120 | 210x120 | — | — | `930px 210px` |
| 1440 | abierto | **264x567** | **210x567** | 532x297 | 110x296 | — |
| 1000 | cerrado | 522x120 | 210x120 | — | — | `522px 210px` |
| 1000 | abierto | **44x636** | **210x636** | 344x192 | 110x296 | — |
| 768 | cerrado | 676x60 | 676x116 | — | — | `676px` |
| 768 | abierto | **676x60** | **676x116** | 676x378 | 676x54 | — |
| 390 | cerrado | 298x79 | 298x116 | — | — | `298px` |
| 390 | abierto | **298x79** | **298x116** | 298x167 | 298x127 | — |

`padding` de las dos: `10px 12px`. **Cero** desplazamiento horizontal en los cuatro anchos.
La fila de orientacion tiene **3** botones `.lv3d-vista`.

⚠️ **LA PREMISA DE LA ORDEN SE REPRODUCE, Y ADEMAS DESTAPA UN DEFECTO PREEXISTENTE QUE EL
ACHIQUE CORRIGE SOLO.** A 1440 px con el 3D abierto la columna de hallazgos mide **264 px** y
la de botones **210**, que es lo que el medico quiere en 220 y 150. Pero **a 1000 px la columna
de hallazgos mide 44 px** —el texto cae a un caracter por renglon— porque la tercera columna se
lleva `calc(46% + 118px)` y la primera es la unica flexible. El propio comentario del codigo lo
declara para 1200 px («baja a unos 150 px»); a 1000 es 44. Con anchos fijos de 220 y 150 y el
3D como columna flexible, a 1440 el panel del 3D **gana 104 px** (650 -> 754) y a 1000 la
columna de hallazgos sube de 44 a 220.

### Como esta hecho el 3D (lo que hay que medir para portar la demo)

**NO es three.js.** `#lv3d-canvas` es un **canvas 2D de 680x380** y el motor es un pintor por
poligonos propio, con matriz de rotacion de 3x3 (`_lv3d.R`), `lv3dProy` y `lv3dPant` con
perspectiva (`LV3D_DIST = 32`, `LV3D_ESC = 26`) y ordenamiento por profundidad
(`polis.sort((a,b) => a.d - b.d)`).

| pieza | donde | que hace |
|---|---|---|
| superficie | `lv3dRing(k,v,G)` + `lv3dMalla` | anillo `k` de 0 (BASE) a `LV3D_N`=20 (APEX); `t=k/N`, factor `b=sqrt(1-t*t)`; radio por angulo `j` de `LV3D_M`=72 |
| coordenadas | `lv3dMalla` | `x=r*LV3D_SX*cos(a)`, `y=r*LV3D_SY*sin(a)`, `z=L*k/N-4.5` con `L=lv3dLargo(v,G)` |
| ejes | brujula de `lv3dPintar` | `+x` Lat, `-x` Sep, `+y` Ant, `-y` Inf, `+z` Punta |
| segmento | `lv3dSegEn(t, d)` | `d` en GRADOS: `60<=d<120` es el 1 (anterior basal); `t<0.3` basal, `<0.6` medio, `<0.85` apical, resto 17 |
| numeracion | `LV3D_SEG_ID[1..17]` | numero AHA -> clave `data-contrseg` de la app |
| animacion | `lv3dCuadro` | `_lv3d.fase = 0.5-0.5*cos(...)` cada cuadro; `lv3dDibujar` repinta |
| toque | `lv3dTocar` | prueba `_lv3d.polis` de atras hacia adelante; salta los que tienen `.g` o no tienen `.s` |
| captura | `lv3dCapturar` -> `lv3dCapturaParaPDF()` | **el MISMO `lv3dPintar`** sobre un canvas fuera de pantalla |
| vistas de punta | `lv3dCablear` | `_lv3d.R = lv3dRotY(+-PI/2)` o la identidad |
| sonda del grafo | `window.lv3dDiag()` | `{abierto, raf, cuadros, G, aviso, modo, hayCaptura}` — es el mecanismo que usaron las sondas anteriores del 3D |

### La tabla de territorios de la app

`CONTR_TERRITORIO` (17 claves) + `CONTR_TERRITORIO_NOMBRE` (color -> nombre) son el **dueno
unico**, y `lv3dTerritorios()` ya los deriva en orden de segmento. Medido segmento por segmento:

| arteria | nombre en la app | segmentos |
|---|---|---|
| DA | `DA` | 1, 2, 7, 8, 13, 14, 17 |
| CD | `CD` | 3, 4, 9, 10, 15 |
| Cx | `CX` | 5, 6, 11, 12, 16 |

**Coincide EXACTAMENTE con la de la demo** (`T={DA:[1,2,7,8,13,14,17],CD:[3,4,9,10,15],CX:[5,6,11,12,16]}`),
asi que no hay nada que reportar por divergencia. La unica diferencia es el **rotulo**: la app
escribe `CX` y la orden pide la linea «Cx: …». La pertenencia sale de la app y el rotulo se
normaliza al que la orden fija.

---

## (c) LA DEMO

**Esta donde la orden dice**: `docs/3d/ecosmart_demo_arterias_coronarias_3d.html`, 367 lineas /
21.556 bytes, sin versionar (aparece como `??` en `git status`) y **solo se lee**. No existe
ningun `ecosmart_demo_contractilidad_coronarias.html` ni en `docs/3d/`, ni en
`~/Desktop/APLICACIONES`, ni en `~/Desktop`.

⚠️ **LA DEMO ESTA HECHA CON three.js r128 Y EL 3D DE LA APP NO.** La demo construye una malla
`BufferGeometry` de 36x72 y las arterias como `TubeGeometry` sobre `CatmullRomCurve3`, con
quaterniones para las vistas y `<div>` absolutos para las letras. Nada de eso existe en el
pintor 2D de la app. Lo que se porta es la **definicion** de cada arteria —puntos sobre la
superficie, por altura y angulo— y las reglas; el dibujo se rehace con el pintor de la app.

### La conversion de coordenadas, medida

| magnitud | demo | app | conversion |
|---|---|---|---|
| altura | `t` de 0 (base) a 1 (apex), `z=L*t` con `L=2.2` | `t=k/20`, `z=L*k/20-4.5` con `L=lv3dLargo()` | **la misma `t`** |
| angulo | `ph`, con `x=-sin(ph)`, `y=cos(ph)` | `d` grados, con `x=cos(d)`, `y=sin(d)` | **`d = ph + 90`** |
| radio | `rr=R*sqrt(1-t*t)` por `k` | `lv3dRing(k,v,G)[j]` | el factor `k` de la demo multiplica el radio de la app |

Verificado en los dos extremos: `ph=0` cae en el segmento **1** en las dos (demo `segOf`, app
`lv3dSegEn(.,90)`), y `ph=60` cae en el **2** en las dos (`d=150`).

### Lo que la demo NO resuelve

**La demo no se anima**: su ventriculo es estatico. El requisito de que las arterias acompanien
la contraccion no tiene respuesta en la demo. La via que la superficie de la app abre es
calcular los puntos de cada arteria **por cuadro** con `lv3dRing(k, _lv3d.fase, G)`, o sea con
la misma funcion que dibuja la pared: asi no pueden despegarse, porque es el mismo radio.

### Los angulos de las vistas, tal como la demo los tiene

OAD caudal `(-30,-25)` · OAI caudal `(40,-30)` · OAD craneal `(-30,20)` · OAI craneal
`(40,30)` · PA craneal `(0,30)` · OAI (CD) `(35,0)`. La demo los declara «tipicos y
aproximados (a verificar con una fuente)». **No se escriben en ninguna pantalla** y van a
`docs/PENDIENTES.md` -> **P29-b**.

---

## (d) LOS CASOS QUE AFIRMAN O CUENTAN LO QUE SE VA A TOCAR

Censados por las dos vias de la leccion (j): por los **literales** (ids, titulos, textos) y por
los **conteos** de fichas, pestanias, botones y bloques.

| caso | que afirma hoy | que le pasa |
|---|---|---|
| **TC-778** a **TC-783** | las tres fichas grandes de PANT-28, bloque por bloque | se adaptan o se reemplazan (commit 8) |
| **TC-509** | `n === 43` encabezados con `toggleRef` | 43 -> **40** |
| **TC-761** (A5) | `total === 43` entradas repartidas | 43 -> **40** |
| **TC-763** (C1) | `idx.length === 41` en el buscador | 41 -> **38** |
| **TC-502** | `_refIndiceArmar(true).length === 41` | 41 -> **38** |
| **TC-762** (A1) | `claves.length === 50` del mapa «Ver referencia» | se mide; cambia solo si una clave apuntaba a una ficha que se quita |
| **TC-563** | que `ref-chagas` y `ref-racong` son las dos unicas fichas que mencionan el desfibrilador fuera de la hipertrofica | cambia al quitarlas |
| **TC-471**, **TC-499** | `ref-miocard` / `ref-coronarias` | se miden: los dos siguen existiendo |
| **TC-490** | los tres hijos de `#lv3d-fila` en orden, y el toggle dentro de `#lv3d-bloque-botones` | el achique NO cambia los hijos; se verifica que siga verde |
| **TC-547** | cuenta de botones `.lv3d-vista` y nodos del panel | gana el boton «Coronarias»: se adapta |
| **TC-GR-14**, **TC-143** | mutacion/regresion de la zona | se corren antes y despues |

La base de esos casos se corre ANTES de tocar nada y queda guardada en
`/tmp/claude-501/base_pant29.txt`.

---

## Detalle de los diez hijos de `ref-miocard` (el molde a copiar)

| # | etiqueta | caracteres | comienzo |
|---|---|---|---|
| 1 | DIV | 33 | MCH — Miocardiopatía Hipertrófica |
| 2 | DIV | 359 | • Diagnóstico: grosor pared ≥15mm (≥13mm con familiar afectado), sin otr |
| 3 | DIV | 30 | MCDI — Miocardiopatía Dilatada |
| 4 | DIV | 245 | • Criterios: DDFVI >58mm (H) / >52mm (M) + FEVI <52% (H) / <54% (M), sin |
| 5 | DIV | 52 | MCA — Miocardiopatía arritmogénica (antes MAVD/ARVC) |
| 6 | DIV | 589 | • Criterio ECO mayor: anomalía regional (aquinesia, disquinesia o aneuri |
| 7 | DIV | 29 | MNC — Miocardio No Compactado |
| 8 | DIV | 507 | • Criterios de Jenni (más usados): ratio NC/C >2 en eje corto en sístole |
| 9 | DIV | 33 | ⭐ Amiloidosis Cardíaca — TTR y AL |
| 10 | DIV | 816 | Signos eco característicos: • Engrosamiento miocárdico biventricular con |

## Detalle de los dos hijos de `ref-coronarias` (lo que se conserva)

| # | etiqueta | caracteres | comienzo |
|---|---|---|---|
| 1 | DIV | 286 | Origen anómalo desde el seno contralateral — tres trayectos posibles: •  |
| 2 | DIV | 158 | ASE 2020 — Frommelt et al, Recommendations for Multimodality Assessment  |

## Detalle del unico hijo de `ref-congenitas`

| # | etiqueta | caracteres | comienzo |
|---|---|---|---|
| 1 | DIV | 287 | CIA: Qp/Qs ≥1.5 + dilatación VD → cierre · Percutáneo si ≤38mm y bordes  |
