# La orejuela del ETE: el lugar, el movimiento, el ⓘ y los videos — «TANDA NOCTURNA, Parte A»

Mapa de la Parte A de la tanda nocturna del **2026-10-30**. Por nombre de función y de constante,
nunca por número de línea: la línea cambia en cada edición y el nombre no.

Lo anterior del esquema de la orejuela está en `docs/mapa/img-guardadas.md` § «La función común
que guarda un esquema», que es donde nació; las dos tablas de dispositivos están en
`docs/mapa/e-carpentier-tricuspide-orejuela.md`.

---

## 1 · El lugar: la fila `#oai-fila`

**Marcado.** La grilla de los diez campos de la orejuela y la caja del dibujo son **hermanas**
dentro de `#oai-fila`, con la grilla primero. Antes la caja vivía después del recuadro de
resultados, o sea tres niveles más abajo, y por eso quedaba apilada.

**Regla.** Una sola consulta de medios:

```css
#oai-fila > #oai-esq-caja { margin-top:10px; }
@media (min-width: 900px) {
  #oai-fila { display:flex; gap:14px; align-items:flex-start; }
  #oai-fila > .grid-3 { flex:1 1 auto; min-width:0; }
  #oai-fila > #oai-esq-caja { flex:0 0 360px; margin-top:0; }
}
```

⚠️ **El corte va sobre la VENTANA y no sobre el contenedor, a propósito.** Con `flex-wrap` el
punto de quiebre depende del ancho que le quede a la tarjeta, que cambia con la pestaña y con el
plan, y entonces «a partir de unos 900 px» deja de ser una afirmación medible. Con la consulta de
medios, 899 apila y 900 no.

⚠️ **El `margin-top` salió del `style=` en línea.** Un estilo en línea le gana a la hoja, así que
el margen de la versión apilada reaparecía en la versión lado a lado. El `display:none` en línea
**sí** se queda: lo gobierna `oaiEsqSync`.

⚠️ **La demo aprobada pone el dibujo a la IZQUIERDA.** El médico lo pidió a la derecha (30/10) y
en ese punto manda el médico; en todo lo demás se sigue la demo.

**Medido**, con los tres rect con caja en los cuatro anchos: antes **apilado en 1440, 1000, 768 y
390**; después **lado a lado en 1440 y 1000**, apilado en 768 y 390, con el dibujo en los mismos
360 px (328 a 390 px, que es el ancho de la tarjeta).

## 2 · Los dos rótulos que se pisaban

Los dos defectos que el médico reportó, medidos sobre **640 combinaciones** —cuatro morfologías ×
ostium 10 a 40 × profundidad 10 a 50 × velocidad 10 a 80—:

| Qué | Antes | Después | Dónde |
|---|---|---|---|
| «VM» pisado por «prof. N mm» | **160 de 640** | 0 | el valor pasa de `L(tip[0], tip[1]+22, …, 'middle')` a `L(tip[0]+14, tip[1]+26, …, 'start')` |
| la línea punteada cruzando «Cx» | **640 de 640** | 0 | el rótulo pasa de `L(203, 170, 'Cx', 'start')` a `L(190, 176, 'Cx', 'end')` |

⚠️ **Los 160 son exactamente la morfología «ala de pollo»**, con cualquier medida: su punta en
(216,179) deja la caja del valor en x 188..244 / y 193..204 y «VM» está en 176..196 / 192..203.
Un caso con una sola escena pasa en verde sobre ese defecto.

⚠️ **A la derecha de «Cx» no hay lugar**: la línea punteada baja justo por ahí para las cuatro
puntas. A la izquierda, en la franja y=168..180, la línea ya va por x=211 o más en la más tendida
de las cuatro.

## 3 · El movimiento: quién es dueño de cada regla

**Un solo emisor, con fase.** `oaiEsqSVG(fase, remolino)` arma la cadena entera; el animador mueve
los atributos cuadro a cuadro **con las mismas funciones**. Eso es lo que sostiene que «lo que se
guarda es lo que se está viendo» con el dibujo en movimiento: el guardado llama al emisor con la
fase congelada.

| Regla | Dueño | Qué lee |
|---|---|---|
| frecuencia con que se anima | `_oaiFcAnim()` | `ao_fc`, y si no `hemo_fc`; si ninguno, 70 lpm con `cargada:false` |
| apertura de las valvas | `_oaiApertura(p)` | la fase |
| tamaño del chorro en el ciclo | `_oaiJetS(p)` | la fase |
| grado de insuficiencia | `_oaiImGrado()` → **`_emRegurgGrado('im_grado')`** | Válvulas, **sin campo propio** |
| geometría de las valvas | `_oaiValvas(o, g)` | apertura y grado |
| silueta del chorro | `_oaiChorroD(g)` | el grado |
| transformación del chorro | `_oaiChorroTr(s)` | la fase |
| partículas del contraste | `_oaiSecArmar(morf, grado)` + `_oaiSecPos(p, c, t)` | `oai_sec` y la morfología |
| velocidad del remolino | `_oaiRemolinoK()` | `oai_vel_vac` |
| el trombo | `_oaiTromboSVG(morf, estado, C, L)` | `oai_trombo` |

**Los nodos animados son una lista cerrada**: `#oai-lf1`, `#oai-lf2`, `#oai-mr` y los hijos de
`#oai-sec`. No hay una segunda declaración de qué se mueve, porque el emisor los escribe con esos
mismos `id`.

⚠️ **EL CHORRO ES CENTRAL SIEMPRE.** La demo lo orienta con el Carpentier **y el velo afectado**;
el Carpentier existe (`vm_carp` / `ete_carpentier`, espejados por `vmCarpPropagar`) y **el velo
afectado no existe** en toda la app. Con el Carpentier solo no se puede decidir un lado.
→ `docs/PENDIENTES.md` **NOC-A-a**.

⚠️ **`r` NO SE HEREDA.** El color y la opacidad del contraste van en el `<g id="oai-sec">` —son
propiedades heredadas y ahorran ~1.600 caracteres de cadena por repintado—, pero el radio va en
cada círculo. Medido en los dos motores sobre un documento mínimo: con `r` en el grupo, el
círculo informa un `getBBox` de **0 × 0** y `getComputedStyle(...).r` da **`0px`** en Chrome y en
WebKit, o sea que el contraste habría quedado **invisible sin un solo error de consola**. La
primera versión de este bloque lo ponía en el grupo. Lo fija **TC-551 (C0b)**.

**Cuándo NO corre:** `_oaiVisible()` —una sola pregunta, `offsetParent !== null && !document.hidden`,
que cubre la sección plegada, la pestaña oculta y la pestaña del navegador en segundo plano— y
`_oaiReducido()`, que con `prefers-reduced-motion` deja un cuadro quieto **del mismo emisor**.

**Las partículas se mueven un cuadro sí y uno no** (`saltar` en `_oaiPintarCuadro`), y es una
decisión medida: son hasta 56, o sea 112 escrituras de atributo por cuadro. El humo es difuso y a
la mitad de cuadros se ve igual; las valvas y el chorro siguen moviéndose en todos.

## 4 · Los tres controles, y quién gana el cuadro guardado

`oaiEsqPausar()` congela y guarda la fase; `oaiEsqSeguir()` corre `_oaiT0` hacia atrás para
retomar **donde quedó** y no desde el principio del latido; `oaiEsqIncluirPDF()` rasteriza el
cuadro actual.

**Una sola imagen de esquema por estudio sale de `CeiboImg.guardarEsquema`, que reemplaza por
clave.** Lo que la Parte A agrega es la convivencia: `_oaiEsqManualUuid` guarda el uuid del
estudio cuyo cuadro eligió el médico, y mientras coincida con el estudio abierto el guardado
automático de `oaiEsqGuardarDiferido` **sale temprano**. Abrir otro estudio devuelve el mando al
automático sin ninguna limpieza explícita, porque la comparación es por uuid.

⚠️ **No se persiste**, así que al reabrir el estudio el automático vuelve a mandar.
→ `docs/PENDIENTES.md` **NOC-A-h**.

**Medido**: tras incluir, teclear otro ostium y esperar 1,5 s —más que el diferido de 700 ms—
deja el `ts` **idéntico**.

## 5 · El ⓘ de «Orejuela izquierda»

**Dejó de clonar la ficha de Referencias.** El registro `VINFO['oai-ref']` pasó de
`dyn: () => _otrRefClon('ref-oai')` a `dyn: () => _oaiRefGlobo()`.

El contenido vive en dos constantes congeladas: **`OAI_GLOBO`** (siete pares de rótulo y texto) y
**`OAI_GLOBO_FUENTES`** (cuatro entradas numeradas). `_oaiRefGlobo()` arma nodos con
`createElement` y `textContent`, igual que `oaiTablasGlobo`: no hay una sola concatenación hacia
un `innerHTML`.

Lo que **salió** con el clon: el bloque «Dispositivos de cierre percutáneo — dato de fabricante»,
la frase «Ninguna guía de la biblioteca publica rangos de tamaño de dispositivo…» y el pie «Ficha
de la pestaña Referencias».

Lo que **no se escribió**, y por qué, está en `docs/fuentes/FUENTES.md` → «La TANDA NOCTURNA,
Parte A»: el valor normal de la velocidad, la ablación y la ventana medioesofágica.

⚠️ **El ⓘ ÁMBAR de «Medidas de la orejuela» no se tocó.** Es un `<details>` que arma
`oaiTablasGlobo()` y que `calcOAI` cuelga de `#oai-notas` cuando hay diámetro. TC-551 (E7) lo
cuenta como control.

⚠️ **La ficha `ref-oai` tampoco se tocó, y eso es una decisión declarada** → `NOC-A-e`.

## 6 · Los videos al borrar un estudio

**El defecto:** `CeiboImg` y `CeiboCine` tenían recolector; **`CeiboVideo` no tenía ninguno**, y
al de `CeiboCine` **no lo llamaba nadie** —su propio comentario decía «Sin esto, eliminar un
estudio dejaría sus cineloops ocupando disco para siempre»—. Los tres caminos de borrado
(`eliminarInforme`, `eliminarInformeYVolver`, `limpiarTodosInformes`) llamaban sólo a
`imgRecolectarHuerfanas`.

**El arreglo:** `CeiboVideo.recolectar(uuidsVivos)`, calcado del de `CeiboCine`, y
`imgRecolectarHuerfanas` recoge **las tres tiendas** en un `Promise.all`. Las dos guardas que ya
tenía —no recoger si la lista de estudios no se pudo leer, y no recoger si algún estudio vivo no
tiene uuid válido— valen igual para las tres.

⚠️ **Sigue devolviendo el número de IMÁGENES**, a propósito: TC-550 (G1) exige
`recolectados >= 1` sobre ese número.

⚠️ **Los huérfanos que ya existen no se contaron** —viven en el perfil de Chrome del médico— y el
recuento se hace con el fragmento de consola de `NOC-A-f`, que sólo lee.

## 7 · La leyenda del guardado apagado

El motivo que devuelve `esqGuardarComoImagen` cuando `imgGuardadoActivo()` es falso pasó de «el
guardado de imágenes está apagado» a nombrar **la pestaña, la sección y la casilla**: «⚙️ Config»
→ «🖼️ Imágenes del estudio» → «Guardar imágenes con los estudios». **El estado por omisión no se
tocó**: `imgGuardadoActivo` pregunta por `localStorage['cfg-guardar-imagenes'] === '1'` y esa
clave no existe hasta que alguien toca el control, así que sigue apagado de fábrica.

## 8 · Las trampas que esta parte pagó

1. **`/\s+/g` dentro de un template literal llega como `/s+/g`** y reemplaza las **eses**: el
   volcado del A/B decía «Doppler pul ado» y «24 cm/». En el archivo van **dos** barras, o una
   clase explícita `[ \t\n\r]`.
2. **El acento grave dentro de un comentario del cuerpo de la sonda**, dos veces. `node --check`
   sobre el `.mjs` no alcanza: hay que correr `new Function(cuerpo)` sobre lo que está entre los
   acentos graves.
3. **`_imgUuidActual` es un `let` del bloque, no una propiedad de `window`**: asignarle a
   `window._imgUuidActual` no lo mueve, y la sonda medía «el estudio todavía no está guardado»
   creyendo que medía el guardado. La puerta real es `imgPersistir(uuid)`.
4. **El tiempo de escritura DERIVA con la posición dentro de la corrida**: la misma función de
   teclas dio 1,42 ms corrida temprano y 2,90 ms corrida tarde, sobre el mismo árbol. Y un
   microbanco de 60 iteraciones antes **calienta el JIT** y baja el número a la mitad. Por eso
   existe `scripts/_probe_oaitecla.mjs`, que abre la página, monta la escena y teclea: nada más
   pasa antes, y los dos árboles se miden con la misma estructura.
5. **`r` en el grupo** (ver § 3).

---

## 9 · El sexto commit: una tarjeta de globo no puede ser más alta que la pantalla

**Dónde:** `_vInfoColocar`, que es la función compartida que coloca **las ochenta y pico de
tarjetas ⓘ** de la app, no sólo la de la orejuela.

**El defecto, que es LATENTE y el ⓘ nuevo sólo destapó.** Esa función acota el alto de la tarjeta
al hueco del lado donde la pone —arriba o abajo del botón—, y eso es lo que impide que la tarjeta
tape su propia ancla (un defecto que el D2 ya pagó). Pero cuando el ancla queda **por debajo del
pliegue**, `r0.top` vale más que `innerHeight` y el «hueco de arriba» da **mayor que la pantalla
entera**: la tarjeta deja de scrollear y se sale por abajo.

**Medido** en los cuatro anchos, los dos motores y los dos temas, con la sonda
`scripts/_probe_oaiwk.mjs`:

| | 1440 px | 1000 px | 768 px | 390 px |
|---|---|---|---|---|
| ⓘ de HEAD (1.882 caracteres) | 360 × 574 | 360 × 572 | 360 × 568 | 360 × 649 |
| ⓘ nuevo, antes del arreglo (3.092) | 360 × 845 | 360 × 845 | **360 × 1215** | **360 × 1215** |
| ⓘ nuevo, después | 360 × 845 | 360 × 845 | **360 × 884** | **360 × 884** |

El de HEAD cabía en ese hueco falso y por eso nadie lo había visto.

**El arreglo** es un `Math.min` contra el alto útil de la ventana (`B - T`). Con el botón
**dentro** de la pantalla los dos huecos ya son menores que ese alto, así que **no mueve un píxel**
de ninguna tarjeta anterior.

⚠️ **Y una trampa de medición al lado: `elementFromPoint` devuelve null FUERA del viewport**, no
«tapado». Los tres controles del esquema caen en y=986 con una ventana de 900 de alto, y la
primera versión de la sonda daba **0/5** sobre botones que miden 44 × 44 de verdad y no están
tapados por nada. Es la hermana de la trampa del `#login-overlay`: el 0/5 se lee igual en los dos
casos. Hay que traer el botón a la vista antes de medir.

---

## → La TANDA CORRECCIONES (2026-10-30) — puntero

Vive en **`docs/mapa/cor-correcciones.md`**, en archivo propio. Lo que esta zona perdió o ganó:

- **§ 1** · el informe de la orejuela publica las medidas con mayúscula y **sin veredicto de
  aptitud**; «no apto para cierre percutáneo (trombo presente)» se fue y el hecho pasó a la
  Evidencia con Meier 2014, folio 1401. Incluye el **barrido 1c** de veredictos del papel
  firmado, con su denominador.
- **§ 2** · **un solo corte de 75 ms** para el TRIV: `DT_TRIV_HTP_PANEL` se retiró. Y las tres
  formas de la frase de elementos a favor de hipertensión pulmonar, con `vdDisfPresente()` como
  dueño único de «VD disfuncionante».
- **§ 3** · la grilla de VD/AD en **tres columnas de seis**, sin la fila 7, con el VD/VI y su
  selector en una fila.
- **§ 4** · la raíz de AI/VI **leída** en la pantalla de Marfan sin escribirse, y el mensaje del
  índice de Turner nombrando lo que falta.
- **§ 5** · «Incluir en el PDF» **independiente de Config** y con el estudio sin guardar, como
  interruptor. El inventario 5a está medido generando el PDF de verdad.
- **§ 6** · el dibujo de la orejuela **portado de la demo**: aurícula izquierda, VPSI, sin el
  triángulo del VI, trombo adentro, dos capas de silueta y «Manga de viento».
