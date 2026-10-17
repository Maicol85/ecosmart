# Mapa — el REGISTRO DE EVIDENCIA y las tarjetas ⓘ gráficas de AI/VI (tanda «L», 2026-10-16)

> **Mapa NUEVO.** Medido con `wc -c` **ANTES** de escribir: los dos mapas que esta tanda toca
> —`auricula-izquierda-pdf.md` (23,2 KB) y `vi-volumenes-automaticos.md` (10,5 KB)— quedaban a
> más de 10 KB del techo con un puntero, así que lo que entró allá es un puntero y el contenido
> vive acá.
> Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

---

## 1 · Qué es el registro y qué NO es

`EV_REG` es una lista congelada de **fichas de evidencia**: una por cada corte que las tarjetas ⓘ
y la pestaña Referencias muestran de la aurícula y del ventrículo izquierdos. Son **datos puros**
—sin HTML, sin funciones, sin nodos— y pasan por `JSON.stringify` y vuelven iguales; TC-491 lo
comprueba. Es la semilla de un registro que después van a leer otras tarjetas y un mapa de
evidencia.

⚠️ **LA FICHA NO ES EL DUEÑO DE NINGÚN CORTE.** El campo `valor` describe en palabras lo que la
app aplica y el campo `duenio` **nombra** la función o la constante que lo decide. Lo que las
tarjetas **dibujan** no sale de la ficha: sale de **sondear** a ese dueño (ver §4). Con los
números en los dos lados, el día que alguien mueva un corte en la función la tarjeta seguiría
dibujando el viejo, que es el defecto que este archivo ya pagó cuatro veces.

### Campos

| campo | qué es |
|---|---|
| `id` | `DIM-AI-001`, `FUN-VI-001`, `MAS-VI-002`, `GEO-VI-001`… **nunca se reusa** |
| `zona` | pestaña y bloque donde vive el dato |
| `dato` | el nombre del dato |
| `valor` | el corte **tal como lo aplica la app**, con su operador y su unidad, y por sexo si corresponde |
| `duenio` | la función o la constante que lo decide (vacío si la app no clasifica ese dato) |
| `guia` | autores, título corto y año |
| `ubicacion` | tabla o figura |
| `folio` | la página **IMPRESA** |
| `hoja_pdf` | la página del PDF |
| `doi` | leído en el propio documento |
| `fuente_original` | el estudio que la guía cita para ese número, si lo cita |
| `tipo` | `guia`, `consenso de expertos` o `criterio propio de EcoSmart` |
| `estado` | `verificado`, `parcial` o `por verificar` |
| `fecha_verificacion` | |
| `fuente_una_linea` | el texto corto que publica la tarjeta |

⚠️ **SIN NOTAS INTERNAS NI RESERVAS DENTRO DE LA FICHA: el repositorio es PÚBLICO.** Lo que hay
que discutir va a `docs/PENDIENTES.md` y lo que hubo que leer para verificar, a
`docs/fuentes/FUENTES.md`. TC-491 barre el vocabulario de reserva («pendiente», «revisar»,
«dudoso», «no se pudo», «habría que»…) sobre cada ficha.

### Qué significa cada estado

* **`verificado`** — el dato se **vio en el PDF original**, y se anotó su tabla o figura, su
  folio impreso y su hoja del PDF. Que el documento extenso lo cite **no alcanza**.
* **`parcial`** — el número está en el original pero **la app lo aplica de otra forma**; por
  ejemplo un corte único donde la guía da uno por sexo.
* **`por verificar`** — no se encontró en el original.

⚠️ **LA LÍNEA DE FUENTE SE PUBLICA SOLO DESDE UNA FICHA «verificado»**, y por eso existe
`evFuenteLinea(id)` en vez de leer el campo directo: con el estado mezclado en cada llamador, el
día que una ficha baje a «parcial» la tarjeta seguiría publicando su fuente. Mejor sin línea que
con una fuente no comprobada.

⚠️ **EL FOLIO Y LA HOJA DEL PDF NO COINCIDEN EN EL APÉNDICE.** En el cuerpo de la ASE/EACVI 2015
el pie dice «Lang et al 7» en la hoja 7; en el apéndice, la hoja 47 lleva el folio **39.e8** y la
53 el **39.e14**. Comprobado en el pie de cada página citada.

---

## 2 · Las doce fichas

| id | dato | dueño | ubicación · folio · hoja | estado |
|---|---|---|---|---|
| `DIM-AI-001` | Diámetro AP de la AI | `aiDiamDilatado` / `UMBRAL_AI_DIAM_DILATADO` | Tabla supl. 9 · 39.e14 · 53 | parcial |
| `DIM-AI-002` | Área de la AI | `aiAreaDilatada` / `UMBRAL_AI_AREA_DILATADA` | — | por verificar |
| `DIM-AI-003` | Volumen indexado de la AI | `aiVolClasificar` / `AI_VOL_BANDAS` | Tabla 4 · 10 · 10 | verificado |
| `DIM-VI-001` | DDVI | `viDimCat` | Tabla supl. 3 · 39.e8 · 47 | parcial |
| `DIM-VI-002` | DSVI | — (la app no lo clasifica) | Tabla supl. 3 · 39.e8 · 47 | verificado |
| `DIM-VI-003` | Volumen telediastólico indexado | `vdfviInterp` | Tabla supl. 3 · 39.e8 · 47 | verificado |
| `DIM-VI-004` | Volumen telesistólico indexado | `vsfviInterp` | Tabla supl. 3 · 39.e8 · 47 | verificado |
| `FUN-VI-001` | Categorías de FEVI | `calcVI` **y** `generarInforme` (DOS copias) | — | por verificar |
| `MAS-VI-001` | Masa indexada, límite normal | `UMBRAL_MASA_HVI_H/M` vía `calcGeometriaVI` | Tabla 6 · 17 · 17 | verificado |
| `MAS-VI-002` | Gravedad de la hipertrofia | `hviSeveridad` | Tabla supl. 3 · 39.e8 · 47 | verificado |
| `GEO-VI-001` | Espesor parietal relativo (RWT) | `calcGeometriaVI` | Tabla 6 y Figura 6 · 17 · 17 | verificado |
| `GEO-VI-002` | Geometría del VI | `calcGeometriaVI` | Figura 6 · 17 · 17 | verificado |

---

## 3 · Las TRES tarjetas, y el mecanismo que reusan

Son tres globos `[data-vinfo]` con el **mismo** mecanismo que los veintitrés que ya existían
(`VINFO` + `vInfoClic` + `#vinfo-card`): toque abre, otro toque cierra, tocar afuera cierra y
Escape también, sin hover y sin llevar al manual, con el foco volviendo al globo.

| clave | qué muestra | ancho |
|---|---|---|
| `ai-card` | tres barras de la AI: diámetro AP, área y volumen indexado | 348 px |
| `vi-card` | cinco barras del VI: DDVI, DSVI, los dos volúmenes indexados y la FEVI | 360 px |
| `vi-geo` | el gráfico de geometría de cuatro cuadrantes | 360 px |

Lo único que se extendió del mecanismo son **dos campos opcionales** de una entrada de `VINFO`:

* **`dyn`** — una función que devuelve **NODOS**. Un gráfico no se puede escribir en el campo
  `lee`, y un SVG puesto por `innerHTML` no hereda su espacio de nombres. Además es la regla de
  Semgrep de esta casa: nada de HTML concatenado con datos.
* **`ancho`** — una tarjeta con barras en 300 px deja los números de los cortes encimados. Lo que
  no lo declara sigue en `VINFO_ANCHO`, así que las veintitrés anteriores no se mueven un píxel.

### El repintado en vivo

Un oyente de documento (`input` y `change`, en captura) repinta la tarjeta abierta cuando cambia
un dato de la pantalla.

⚠️ **NO PUEDE IR EN `requestAnimationFrame`, Y ESTÁ MEDIDO:** en Chrome sin ventana visible rAF
**no se dispara** —una sonda lo esperó 1,5 s y nunca llegó—, así que el repintado quedaba sin
hacer y la tarjeta se veía perfecta con la categoría del gesto **anterior**. Va con un
`setTimeout(…, 0)`, que además es una macrotarea: corre **después** de que el despacho del evento
terminó, que es lo que hace falta porque el oyente va en captura y corre **antes** que el
`oninput` del propio campo.

⚠️ **LA CLAVE VIVA SE MARCA EN EL PROPIO NODO (`data-ev-dyn`)** y no se deduce de la variable de
módulo `_vInfoId`: el repintado tiene que seguir **lo que está en pantalla**.

### Dónde va el globo

En una fila del **CUERPO** del acordeón, no dentro de su encabezado: ese encabezado **es** un
`<button>` con `onclick="secToggle(...)"`, y un botón dentro de otro botón no es marcado válido
—el navegador lo saca del padre al parsear y el globo deja de estar donde dice el fuente—.

---

## 4 · Los cortes se SONDEAN, no se copian

`evCortes(sexo)` barre el dominio de cada función dueña y anota dónde cambia de categoría:

```
aiDiam · aiArea · aiVol · ddvi · vdfvi · vsfvi · masa · rwtMasaNormal · rwtMasaAumentada
```

Con eso, la barra y el papel firmado no se pueden desincronizar **ni en un decimal**. El paso
define la precisión del corte que se publica: 0,1 para todo salvo el RWT, que va con 0,01 porque
sus cortes son centésimas. Ningún dueño de esta zona tiene cortes con más de un decimal.

Para que el sondeo los alcance, `hviSeveridad`, `vdfviInterp` y `vsfviInterp` pasaron a
exportarse. Su comportamiento no cambia.

### Los DOS datos que no tienen dueño

Viven en `EV_BANDAS_REF`, que es el **único** lugar de la app con esos números:

* el **DSVI** no lo clasifica ninguna superficie —censado: alimenta la fracción de acortamiento y
  el módulo de TEER y no produce categoría en pantalla, informe, PDF, PPT ni Laboratorio—, así
  que no hay dueño al que preguntarle. La barra publica la banda de la guía y lo dice con esas
  palabras;
* la **FEVI** sí se clasifica, pero sus cortes viven **en dos copias** —la cápsula de `calcVI` y
  el bloque del informe—, ninguna reutilizable. Esta tanda **no agrega una tercera cuenta**:
  dibuja con esas bandas y **copia** la categoría de la cápsula; TC-491 las ata a lo que la app
  publica.

---

## 5 · Qué dice la tarjeta, y de dónde sale cada palabra

| pieza | de dónde sale |
|---|---|
| categoría del volumen de la AI | `AI_VOL_BANDAS[].adj` — **literalmente** lo que imprime el informe |
| categoría del diámetro AP y del área | el `textContent` de su cápsula de pantalla, copiado |
| categoría del DDVI | `viDimCat()` — el mismo sintagma que el informe |
| categoría de los volúmenes indexados | `vdfviInterp().txt` / `vsfviInterp().txt` |
| categoría de la FEVI | el `textContent` de `#fevi-interp`, copiado |
| geometría y su gravedad | `calcGeometriaVI()` + `hviSeveridad()`, con el formato del informe |

**Las bandas no llevan escrita ninguna palabra de gravedad: solo color.** Y el color nunca es lo
único que informa — cada corte lleva su número **con su unidad**, la categoría va en palabras en
su propia línea, y el `aria-label` del dibujo repite valor, categoría y cortes.

⚠️ **LOS LÍMITES DEL DIBUJO (`lo` y `hi`) NO SON CORTES Y NO LLEVAN FUENTE:** son el rango de lo
medible que la barra encuadra, igual que una banda de plausibilidad. Un valor por fuera se dibuja
pegado al borde y el texto dice el número real.

### El sexo, barra por barra

La regla «sin sexo, sin punto» se aplica **por barra** y no por tarjeta: existe porque los cortes
dependen del sexo, así que aplicarla a una barra cuyo corte **no** depende de él escondería una
información que no falta. En la AI ninguno de los tres cortes depende del sexo —la Tabla 4
imprime los mismos cuatro valores en las dos columnas— así que su tarjeta nunca esconde el punto.
En el VI, el DDVI y la FEVI lo conservan y las otras tres barras no.

---

## 6 · El gráfico de geometría

Cuatro cuadrantes tipo Forrester: masa indexada en un eje, espesor parietal relativo en el otro.

⚠️ **LOS DOS EJES SON SIMÉTRICOS Y POR TRAMOS, NO LINEALES.** Las dos mitades de cada eje miden lo
mismo. La consecuencia hay que saberla: **la distancia en píxeles no es proporcional a la
diferencia en gramos**. Es un esquema de clasificación, no una escala de medida.

La mitad de la hipertrofia se parte en **tres bandas de igual alto** por los cortes de gravedad
del sexo cargado —sondeados—, **sin rayas entre ellas**: lo único que cambia es el tono, más
saturado cuanto más grave. El remodelado concéntrico y la geometría normal van de un solo tono:
la gravedad que la app calcula es la de la hipertrofia, y atribuírsela a una masa normal sería
inventar un grado.

⚠️ **VA EN UN GLOBO PROPIO Y ES UNA MEDICIÓN, NO UNA PREFERENCIA:** con sus cinco barras la
tarjeta del VI mide hasta 488 px y el gráfico suma 365, así que a 1200 × 700 —donde el hueco útil
arriba o abajo del globo es menor que la ventana— las dos juntas obligaban a scroll **interno**.

---

## 7 · La pestaña Referencias

Dos entradas nuevas, con la forma que las demás ya tienen: `ref-ai` («AI — Aurícula izquierda:
cortes por sexo») y `ref-vi2` («VI — Dimensiones, función y masa: cortes por sexo»).

⚠️ **EL ID DE LA SEGUNDA ES `vi2` Y NO `vi`:** `ref-vi` ya existe y es la tarjeta de geometría y
función diastólica de la ASE 2016, con su propia fuente. Reusar su id habría fundido dos entradas
distintas en una.

Su cuerpo **no es HTML estático**: lo arma `evRefPintar(id)` la primera vez que se abre, desde el
registro y desde los mismos dueños que la tarjeta, así que no hay un tercer juego de números.
Lleva las dos columnas de sexo **siempre** —aunque la app no distinga, porque esta pestaña es la
referencia y no el informe de un paciente—, las mismas gráficas **sin el punto del paciente**, y
la bibliografía **por sección numerada desde [1]**, con sólo las fichas «verificado». Una fila
cuya ficha no lo está sale **sin corchete**.

---

## 8 · Trampas medidas en esta tanda

1. **`requestAnimationFrame` NO CORRE en Chrome sin ventana visible.** Lo esperó 1,5 s y nunca
   llegó. Todo repintado diferido de esta zona va con `setTimeout`.
2. **El `clip` de `Page.captureScreenshot` va en coordenadas de PÁGINA** y
   `getBoundingClientRect` da las del viewport: hay que sumarle el desplazamiento aunque el nodo
   sea `position:fixed`. Sin eso el PNG salió con la botonera de la app, y se ve perfectamente
   bien.
3. **Y con `deviceScaleFactor: 2` el `clip` se interpreta en píxeles de DISPOSITIVO:** el recorte
   cae a la mitad de la coordenada pedida. El factor va en 1 y la escala en el `clip`.
4. **`data-ev-cuad` de una banda ya lleva su nivel con una barra adentro**, así que concatenarle
   las medidas y partir por barra las corre un lugar: la primera versión de TC-491 leyó el ancho
   como alto e informó 420 contra 82 sobre un dibujo simétrico.
5. **Los valores del selector de sexo son `M` y `F`, no `Masculino` y `Femenino`:** con el texto
   de la opción el `<select>` queda en `selectedIndex -1` y toda la corrida se mide como «sin
   sexo». La captura de la mujer salió con los cortes del varón sobre un árbol perfecto.
6. **Los rótulos de los cortes se encimaban y lo vio la CAPTURA, no la medición:** con los tres
   cortes del volumen indexado a 37 px uno de otro, el texto salía como «34 ml/m²41 ml/m²48 ml/m²».
   Se escalonan en dos renglones, y la detección de choque compara **la mitad de cada uno** —con
   medio ancho solo decía «no chocan» sobre rótulos pegados—.
7. **El conteo de nodos hay que tomarlo justo antes del bucle:** entre medio se cambia el volumen
   de la aurícula, y eso repinta la diastólica y el HFA-PEFF, que **sí** agregan nodos. Con el
   conteo del arranque, la sonda informó 36 nodos de más sobre una tarjeta que no acumula ninguno.
8. **Hay que cerrar la tarjeta antes del bucle de veinte:** con la tarjeta abierta, cuarenta
   clics la dejan **abierta** y el grupo informa «no cierra» sobre un mecanismo que alterna
   perfecto.

---

# La tanda «M» (2026-10-16) — dieciséis fichas más

El registro pasa de **doce a veintiocho fichas**: entran las de AD/VCI, el ventrículo derecho y
la aorta, con el mismo formato y **ninguna reusa un id del L**: `DIM-AD-001`, `VCI-001`,
`VCI-002`, `DIM-VD-001` a `004`, `FUN-VD-001` a `006` y `AOR-001` a `003`. Diez quedan
«verificado», cuatro «parcial» y dos «por verificar».

Con ellas entra una segunda guía al registro —`EV_GUIA_ASE2025VD`, con su DOI leído en el pie de
la hoja 1 del propio PDF— y **doce dueños puros nuevos** que `evCortes` sondea.

⚠️ **`_evBarra` GANÓ DOS CAMPOS OPCIONALES, los dos aditivos**: `colores`, para que una barra
pida otro color para una categoría sin tocar `EV_COLOR` —«disfunción» es la banda del medio en la
FAC y la peor en el TAPSE—, y `corteEn` como **LISTA**, una entrada por corte, porque el operador
no tiene por qué ser el mismo en los tres cortes de una barra. Las tres tarjetas del L no se
mueven un píxel.

**El detalle está en `docs/mapa/evidencia-derecho-aorta.md`.**

---

## → La tanda «LS» (2026-10-16): la AI y el VI por SEXO

Los cortes de la aurícula y el ventrículo izquierdos pasaron a ser **por sexo**, con la regla del
**corte más alto** cuando el sexo falta, y la fracción de eyección a **cuatro categorías con un
solo dueño**. Entró además un **aviso de pantalla** que aparece sólo cuando falta el sexo y algún
valor cambiaría de categoría con él.

**Todo está en `docs/mapa/ai-vi-por-sexo.md`**: el dueño del sexo efectivo (`sexoLeido`,
`sexoCargado`, `sexoEfectivo`, `sexoFalta`), la tabla de los seis parámetros con su operador, las
cinco copias de la FEVI que pasaron a leer `feviClasificar`, el aviso con su medición en seis
anchos por dos temas, lo que cambió en las tarjetas y en Referencias, las tres fichas nuevas del
registro y nueve trampas.

La verificación contra el PDF original —folio por folio, con la regla de folio de cada una de las
tres guías comprobada en el pie impreso— está en `docs/fuentes/FUENTES.md` → «La tanda LS».
