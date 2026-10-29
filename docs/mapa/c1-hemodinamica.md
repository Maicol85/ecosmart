# Mapa — la tanda C1: VExUS, HTP, Forrester, RVS y el POCUS del posoperatorio (2026-10-28)

Por nombre de función y de constante, **no por número de línea**: la línea cambia en cada
edición y el nombre no. La ficha del caso de prueba vive aparte, en
`docs/mapa/tests-fichas-544.md`.

---

## 1. VExUS — los cuatro rótulos y de dónde salen

| Qué | Dueño |
|---|---|
| Los cuatro textos de grado | `VEXUS_INTERP` |
| La regla que decide el grado | `vexusGrado(diam, sh, pv, ir)` |
| El estado leído del formulario | `vexusEstado()` |
| Quién los pinta en pantalla | `calcVEXUS()` → `vexus-interp` |
| Quién los lleva al **informe firmado** | el emisor del narrativo, `VEXUS ${score} (${detalle}): ${VEXUS_INTERP[score]}` |
| Quién los lleva a la **hoja del PDF** | `amiloTextoVEXUS()` |
| La sección de Evidencia | `_indVexus()` |
| El globo ⓘ del módulo | `VINFO['vexus-lim']` |
| Las dos fuentes | `IND_REFS.vexus2020` (Beaubien-Souligny) y `IND_REFS.vexusRola2021` (Rola) |

**Los cuatro rótulos son los de la Figura 7 de Rola 2021**, leída en imagen a 600 ppp:

```
 <2 cm       ->  Grade 0: No congestion
 0/3 (>2cm)  ->  Grade 1: At risk
 1/3         ->  Grade 2: Moderate congestion
 2-3/3       ->  Grade 3: Severe congestion
```

⚠️ **El texto de la página 8 y su propia figura DISCREPAN en el grado 1, y manda la figura.**
El cuerpo dice «VExUS grade 1 is with only mild congestive findings»; la figura lo rotula
«0/3 → At risk», o sea **cero** patrones severos. Son cosas distintas: con «hallazgos leves» el
grado 1 exigiría una alteración leve, y con «0/3» basta la vena cava dilatada sin ningún patrón
severo — que es, además, lo que `vexusGrado` ya implementa desde la columna VExUS C de
Beaubien-Souligny. **Antes de «corregir» el grado 1 a «leve», leer esto.**

⚠️ **El grado 3 conserva su frase de injuria renal aguda, y no es un olvido.** Esa asociación es
el RESULTADO que mide Beaubien-Souligny 2020 —la fuente de la graduación que esta app
implementa, y que la Evidencia ya cita con sus números (HR 3,69; LR+ 6,37)—, no una lectura de
la Figura 7. Es lo que **M3** del barrido de mutaciones inyecta: sacársela es un defecto, y la
condición **(A4)** de TC-544 lo caza.

### La Evidencia: lo que salió y lo que entró

Salió **entero** el bloque plegado «Conducta por grado — criterio de EcoSmart, sin fuente» con
sus tres líneas. Entró **una**: «Hasta hoy no hay estudios de intervención que prueben una
conducta guiada por el grado», con la cita a Rola 2021 **por `refs`** y no entre paréntesis —el
panel numera con corchete y lista la bibliografía por sección, así que escribir el documento en
la línea lo diría dos veces—. Las tres frases retiradas están transcriptas en
`docs/fuentes/FUENTES.md` → «La tanda C1».

---

## 2. HTP — «sin evaluar» no es «ausente»

El dueño de los signos es `_htp2022Signos(S)`, y devuelve **tres** estados por signo:

| `estado` | Qué significa | Qué dice la celda cuando NO está presente |
|---|---|---|
| `auto` | se decidió con datos cargados | `automático (según datos) — ausente` |
| `sinDatos` | signo automático sin sus insumos | `sin datos`, sin sufijo |
| `manual` | casilla del médico | `marcado a mano — **sin evaluar**` |

Lo escribe **`htpTablaPintar()`**, y sólo ahí: la celda `htp2022-est-<k>` es el único lugar
donde ese sufijo se publica. **El informe firmado y la hoja del PDF no lo tocan**, porque
`amiloTextoHTP()` lista **sólo los signos PRESENTES**.

A nivel de **categoría**, la Evidencia (`_indHTP`) usa `_noEval(g)`: una categoría cuyos signos
son todos casillas sin marcar o automáticos sin datos cae en «—» / «ningún signo de esta
categoría se pudo evaluar con lo cargado». Una categoría evaluada **a medias** sigue diciendo
«evaluada, sin signos», y es deliberado.

⚠️ **Ningún conteo se mueve.** `catA`, `catB`, `catC`, `nCat` y `prob` salen de `_htp2022Core`,
que esta tanda no toca.

---

## 3. El Forrester — los tres mensajes de «falta…»

**Un solo dueño: `forrFaltaTxt(hayIc, hayPcp)`.** Devuelve `null` cuando están los dos, y si no
una de estas tres cadenas:

- `falta el índice cardíaco`
- `falta la presión capilar pulmonar estimada`
- `faltan el índice cardíaco y la presión capilar pulmonar estimada`

Lo leen **tres** sitios: la cápsula (`calcHemo` → `hemo-forrester`), la fila del panel
(`_indHemo`, vía `_indFn('forrFaltaTxt')`) y el gráfico (`hemoForrGrafPintar`). Antes la cápsula
decía «Requiere IC + PCP estimada» en los tres casos y la fila del panel tenía las tres cadenas
tipeadas: con dos copias, el día que una se redacte distinto la pantalla y el panel le piden al
médico cosas distintas sobre el mismo estudio.

⚠️ **El texto de la cápsula VIAJA A TRES SUPERFICIES FIRMADAS**, y por eso la tanda A lo dejó
sin tocar (pendiente A-d): `amiloTextoHemo()` lo integra al informe y a la hoja de ETT Avanzado
del PDF, y `_pptSpan('hemo-forrester')` lo lleva a la diapositiva. **Pero sólo si el médico
integra el bloque**: sin el gesto «📎 Integrar al informe», ninguna de las tres lo ve.

---

## 4. La RVS y el dueño único de la PAM

`calcHemo` pregunta a **`pamEfectiva()`** (cateter → tipeada → calculada), el dueño que dejó la
tanda B. Antes leía `hemo_pam` a secas, así que con la PAM del Swan cargada y el campo de
Hemodinámica vacío la RVS salía «—» mientras la hoja del posoperatorio, en el mismo estudio, ya
la usaba.

El origen de los dos insumos sale de **`RVS_PAM_ORIGEN`**, con tres rótulos cortos:

```
 inv  -> 'PAM por catéter'
 tip  -> 'PAM tipeada'
 calc -> 'PAM calculada de PAS y PAD'
```

y la línea queda `875 dinas·s·cm⁻⁵ · PAM por catéter; PVC estimada por eco`.

⚠️ **Son rótulos NUEVOS y no los de `PAM_FUENTE_LBL`.** Aquéllos («medida (Swan-Ganz)», «de
Hemodinámica») los imprime la hoja del PDF del posoperatorio letra por letra: reusarlos aquí
ataría dos papeles distintos a la misma cadena.

⚠️ **El `popPatron()` del posoperatorio sigue leyendo `v('hemo_pam')` en su rama de respaldo**, y
esta tanda no lo tocó: el posoperatorio está fuera de su alcance. Declarado en `PENDIENTES.md`.

---

## 5. El POCUS del posoperatorio y el VD/VI

`popPocusSync()` tiene ahora **tres** fuentes para el cociente, en este orden:

1. `tep_vdvi` — el campo propio de la cápsula de TEP. **Sigue primero y no se tocó.**
2. `vdViEstado().val`, **sólo la rama `numero`** — el campo `vd_vi` de la pestaña VD/AD, que es
   el que faltaba. Es el lector único que ya usan la tabla del VD del PDF, el PPT y la categoría
   A de la probabilidad de HTP.
3. la derivación `vd_bas / ddfvi`, que ya estaba.

⚠️ **Ningún corte se movió**: la dilatación la sigue decidiendo `vdvi >= TEP_VDVI_DILAT_MIN`
sobre un **número**.

⚠️ **El selector de tramo NO gradúa, y es deliberado.** Sin número, `vd_vi_sel` dice «> 1,0» o
«≤ 1,0» y el corte de este bloque es `>= 1,0`: en el 1,0 exacto el selector y el corte no caen
del mismo lado. Lo que sí hace es publicar su rótulo con `vdViTexto()` y dejar de pedir en
«Completar» un dato ya contestado.

⚠️ **`popPatron()` tiene la MISMA cascada de tres líneas y tampoco mira `vd_vi`.** Está fuera de
esta orden; declarado en `PENDIENTES.md`.

---

## 6. El diagrama de Forrester de la pestaña de Hemodinámica

| Qué | Dueño |
|---|---|
| El contenedor | `<div id="hemo-forr-graf">` |
| Quién lo dibuja | `hemoForrGrafPintar(ic, pcp)` |
| Quién lo llama | **`hemoForrGrafSync()`**, en las TRES columnas de siempre |
| De dónde salen los números | `_forrUlt`, que `calcHemo` **registra** sin pintar |
| El generador del SVG | **`_labForrSVG`**, el MISMO del Laboratorio |
| Los rótulos de cuadrante | **`_LAB_FORR_LBL`**, los MISMOS del Laboratorio |
| La paleta | `_labForrPal()`, con las CSS vars resueltas → sigue el modo día/noche |
| El cuadrante | **`forrCuadrante(ic, pcp)`** |
| El mensaje de vacío | `forrFaltaTxt`, vía la opción `vacioTxt` de `_labForrSVG` |

### ⚠️ `calcHemo` REGISTRA, NO PINTA — y eso lo decidió una medición

La primera versión pintaba en la cola de `calcHemo`. **`calcHemo` corre en el `oninput` de
varios campos, o sea una vez por tecla**, y pintar rearma el SVG entero y lo vuelve a parsear con
`innerHTML`. Medido en Chrome con doce teclas reales sobre `onda_e` y **con el punto dibujado**:

| | media | máximo |
|---|---|---|
| HEAD | 0,53 – 0,58 ms | 0,8 – 0,9 ms |
| pintando por tecla | **0,74 – 0,92 ms** | **2,1 – 2,6 ms** |
| pintando en el barrido | 0,56 – 0,58 ms | 0,9 – 1,0 ms |

Hoy `calcHemo` sólo hace `_forrUlt.ic = ic; _forrUlt.pcp = pcp` —dos asignaciones— y quien dibuja
es `hemoForrGrafSync`, en **las tres columnas** que este archivo usa para todo sincronizador:

1. **`ESPEJOS_VIVOS`**, justo después de `calcHemo` —al revés pintaría con los números del gesto
   anterior—. Es el barrido colgado del debounce de 220 ms: **una** vez tras la última tecla.
2. **`RECALC_MODULOS`**, porque las cinco rutas de restauración pueblan asignando `.value`, que
   no dispara `input`: sin esto, reabrir un estudio dejaba el punto del paciente anterior.
3. **El final de `limpiarCampos`**, que no pasa por `RECALC_MODULOS`, y donde además se vacía
   `_forrUlt` primero: «Nuevo estudio» tiene que dejar el gráfico vacío.

Es además el mecanismo que la orden de la tanda pedía: «que se actualice en vivo con el mecanismo
de espejos (`ESPEJOS_VIVOS` y su barrido), sin temporizador nuevo».

⚠️ **Un caso que llame sólo a `calcHemo` no verá el gráfico repintado.** TC-544 corre `barrer()`
después del montaje, y la sonda de dos motores llama a `_espejosBarrerTodos()`: las dos lo
aprendieron en rojo.

### Los dos cortes, medidos — y por qué la orden suponía otros

```
 humedo = pcp >  UMBRAL_PCP_HUMEDO   (15)
 frio   = ic  <  FORR_IC_CORTE       (2,2)
```

- Una presión capilar de **15 exactos NO es congestión**; una de **18 SÍ lo es**. El corte de la
  app es **15**, no 18. El 18 es el del Braunwald, que la Evidencia cita aparte.
- Un índice cardíaco de **2,2 exactos NO es hipoperfusión** en el Forrester. El «2,2 o menos» es
  de `_icBanda`, que es **otra** cápsula.

**Ninguno de los dos se movió.** Las dos frases de texto clínico que afirman lo contrario
—el `ojo` del globo `hemo-forr` y la tercera línea de `forrLin` en `_indHemo`— quedaron
**reportadas y sin tocar**: ver `PENDIENTES.md` → **C1-a** y **C1-b**.

### Dos cosas que se declaran

⚠️ **Los ejes están al revés de lo que la orden pedía.** `_labForrSVG` tiene X = índice cardíaco
e Y = presión capilar; la orden pedía lo contrario. Girarlos obligaría a una segunda geometría y
a reubicar los cuatro rótulos, que es exactamente lo que el comentario de ese generador previene
(«con dos generadores, el día que se mueva un cuadrante hay que acordarse de los dos»). Se
reutiliza tal cual. → **C1-c**.

⚠️ **Hay DOS vocabularios para los MISMOS cuatro cuadrantes.** La fila de arriba dice «Perfil A /
B / L / C» (Stevenson) y el gráfico «I / II / III / IV» (`_LAB_FORR_LBL`). La correspondencia es
A↔I, B↔II, L↔III, C↔IV, verificada condición por condición. Esta tanda **no unifica ninguno**:
renombrar un rótulo clínico es decisión de Maicol. → **C1-d**.

### Lo que el gráfico NO hace

No entra al informe, al EN SUMA, al PDF, al PPT, al Excel ni al guardado, y **no agrega ningún
campo**: el nodo es un `<div>` sin `id` de campo, así que ni `_noEsDelEstudio` ni el censo lo
ven. Medido: el A/B del commit aislado da **cero** diferencias en las superficies firmadas, con
40 de pantalla como control positivo.

### El Laboratorio ya tenía un diagrama, y NO ubica a este paciente

`_labForrRenderDash(infs)` dibuja **un punto por estudio GUARDADO del período**
(`_labForrPuntos`), con jitter determinista y clic para abrir el estudio. No conoce al paciente
que está cargado en el formulario. Esta tanda **no lo tocó**; la idea de que también ubique al
paciente en curso queda anotada en `PENDIENTES.md`.

---

## ➜ La tanda «C2» (2026-10-28) — el Forrester corta en 18 y en «2,2 o menos»

Puntero. El relato vive en **`docs/mapa/c2-pulmon-constriccion-forrester.md`** §5.

Cierra **C1-a** y **C1-b**: el ⓘ `hemo-forr` y la tercera línea de `forrLin` ya describían 18 y
«2,2 o menos», y eran falsos. La C2 movió el **código** a eso —decisión de Maicol del 6/10 y del
21/10—, así que los dos textos no hubo que reescribirlos; sólo se bajaron dos mayúsculas de en
medio.

`UMBRAL_PCP_HUMEDO` pasó de 15 a **18** y `forrCuadrante` de `ic <` a `ic <=`. Y la **cápsula**
`hemo-forrester`, que tenía su propia cascada con `ic < 2.2` escrito como literal, pasó a
preguntarle a `forrCuadrante`: era la tercera copia de la regla, y justo la que viaja al informe
integrado, a la hoja del PDF y al PPT.

---

## ⇢ Puntero — la tanda «POP-V2» (2026-10-29)

El módulo **«POP Cirugía Cardíaca»** se reordenó de arriba hacia abajo —contexto y monitoreo,
fármacos en un desplegable, hemodinámica, POCUS con el VD primero, dibujo y conclusión—, la dosis
de las vasoactivas **se calcula sola**, apareció la **PAM por línea arterial** en el primer
escalón del dueño único, el dibujo sumó **Impella, ECMO venovenoso y el timing del balón**, la
conclusión publica **señales sueltas con su valor** y el **patrón y las cinco preguntas salieron
del PPT**.

**Todo en `docs/mapa/pop-v2-posoperatorio.md`**, con la tabla de lo que los mapas anteriores decían
y dejó de ser cierto. El caso que lo fija es **TC-548**; los pendientes, **POP-a** a **POP-h**.
