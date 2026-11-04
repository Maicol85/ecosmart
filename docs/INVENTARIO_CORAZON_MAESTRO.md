# Inventario del corazón maestro en 3D — SOLO LECTURA

> Escrito en la tanda **PANT-12, commit 1** (2026-11-04), sobre el árbol **`9c5ab8f`**, sello
> `v20261104-1554`, md5 de `index.html` **`a78bd6ce`**. **Este commit no cambia una línea de la
> aplicación**: el md5 antes y después es el mismo, verificado.
> Todo lo que está acá se **midió** en Chrome con una sonda, o se leyó del código con `grep`.
> Las sondas son `scripts/_probe_pant12inv.mjs` y `scripts/_probe_pant12reloj.mjs`.

---

## 1 · Dónde vive el 3D hoy, y de qué se alimenta

**Hay UN SOLO motor 3D en la aplicación.** Censado: una sola aparición de
`CatmullRomCurve3` en todo `index.html` y un solo `getPointAt` animado por tiempo (el de la
línea del bucle de partículas). Todos los demás `getPointAt` del archivo reciben un parámetro
fijo y en rango, y los `getPointAtLength` son de SVG y no de este motor.

### 1.1 Las dos puertas

| Puerta | Dónde | Qué hace |
|---|---|---|
| **«Ver en 3D»** de la fase 1 | `#cc3d-abrir`, en `#cc3d-wrap`, **hermano** de `#tab-congenitas` y de `#tab-congenitas2` | **PRESTA** el recuadro `#tga-3d-box`: lo mueve a `#cc3d-host` y al cerrar lo devuelve a su lugar exacto (recuerda el padre y el hermano siguiente en `_cc3d.padre` / `_cc3d.antes`) |
| **El recuadro de la transposición** | `#tga-3d-box`, dentro de `#sacc-cc-tga` | Es el dueño del lienzo, del motor, de los controles y del esquema de circulación |

El pie va **fuera** de las dos sub-pestañas a propósito: son dos `.tab-section` distintas y la
que no está activa no se dibuja, así que un botón dentro de una no se vería en la otra. Lo
muestra y lo esconde `cc3dPieSync`, colgado de `showTab`, que además **cierra** el panel al salir
de congénitas —un panel abierto con el recuadro prestado dejaría la sección de la transposición
sin su diagrama al volver—.

**No hay un segundo lienzo y es deliberado:** una segunda instancia habría exigido otro id y con
él una segunda copia del cableado del 3D y del esquema, o sea dos dibujos del mismo paciente que
pueden divergir.

### 1.2 Las piezas del recuadro

| Pieza | Id / función | Nota |
|---|---|---|
| Lienzo | `#tga-3d-cv` (el `<canvas>` lo crea el motor) | alto fijo `TGA3D_ALTO = 420` |
| Carga de la librería | `TGA3D_URL` (three.js **r128** de cdnjs) + `TGA3D_SRI` (SHA-512) | `tga3dBoot` la baja **sólo** cuando el dibujo se ve |
| «¿Se ve?» | `_tga3dVisible()` | pregunta por `document.hidden`, por la clase `open` del acordeón —`offsetParent` **no alcanza**, porque `secToggle` cierra con `max-height:0`— y por `offsetParent` |
| Movimiento reducido | `_tga3dReducido()` | `prefers-reduced-motion` |
| Controles | `#tga-3d-ins` (ver por dentro), `#tga-3d-nom` (nombres), `#tga-3d-fc` (frecuencia), `#tga-3d-pausar`, `#tga-3d-frente`, `#tga-3d-pdf` (incluir en el PDF), `#tga-3d-norm` (vista de referencia) | los siete presentes, medido |
| Esquema de circulación | `#tga-esq-box` | SVG propio, al lado del 3D desde 1200 px |
| Estado del motor | `_tga3d` (`cargando`, `listo`, `fallo`, `ref`, `ins`, `noms`, `pausado`, `fc`) | vive en memoria |
| Al PDF | `tgaEsqPdfOn()` + `_tga3dEsDato()` + `tgaEsqPdfRaster()` | rasteriza el lienzo con el bucle en pausa; la compuerta es `esqEstaIncluido` sobre la clave del 3D |
| Línea de lo no dibujado | `cc3dNoDibujadas()` / `cc3dTextoSync()` | lee `_CC_SECS`, el registro del Laboratorio, que es el **dueño único** de «esta lesión está cargada» |

### 1.3 Cómo se construye el escenario, y de qué se alimenta

- `tga3dEscena(anat, cir, coms)` arma el escenario. **Pide argumentos**: llamarla sin ellos tira
  `Cannot read properties of undefined (reading 'asd')`, medido —no es un defecto, es su firma—.
- `_tga3dClave(anat, cir)` traduce al vocabulario de la demo, con `TGA_CIR_OP` como dueño único
  de la cirugía.
- **`tga3dComs(src)` es el dueño único de las comunicaciones**, y las lee de **sus propias
  pestañas**:

| Comunicación | Campos que la encienden |
|---|---|
| `asd` (interauricular) | `ete_cia_tipo`, `ete_cia_tam_max`, `ete_cia_tam_min` **o** el foramen oval: `fop_tunel` (numérico), `fop_shunt_reposo = si`, `fop_shunt_valsalva = si` |
| `vsd` (interventricular) | `ete_civ_tipo`, `ete_civ_tam` **o** `tga_civ_residual = si` |
| `pda` (ductus) | `dap_tipo` **o** `dap_diam` |

⚠️ El predicado del foramen oval **no** es el `hayDato` de `fopConclusion`, a propósito: ese lo
llena también un test de burbujas **negativo**, que es justo como se **descarta** un foramen.

- `CC3D_DIBUJA = ['cia','civ','dap','fop','tga']`: **lo único que el diagrama dibuja hoy.** Todo
  lo demás se **declara** en la línea `#cc3d-faltan` y no se dibuja.
- Es **solo lectura**: no escribe un campo, no se guarda, no llega al informe, al EN SUMA, al PDF
  ni al PPT (verificado: el único estado es `_cc3d`, en memoria).

---

## 2 · Los campos de congénitas: lo que el 3D lee hoy y lo que la demo necesitaría

**Lo que el 3D lee HOY** son los nueve campos de `tga3dComs` de la tabla de arriba, más
`tga_tipo`, `tga_cirugia` y `tga_civ_residual` de la transposición. **Nada más.**

**Lo que la demo aprobada necesitaría leer** (id, rótulo, sección, opciones medidas con `grep`
sobre el marcado, no supuestas):

| Módulo de la demo | Campo de la app | Sección | Opciones (valor = rótulo) |
|---|---|---|---|
| CIA, tipo | `ete_cia_tipo` | CIA / CIV | `secundum`=Ostium secundum · `primum`=Ostium primum · `sv_vcs`=Seno venoso VCS · `sv_vci`=Seno venoso VCI · `seno_coronario`=Seno coronario |
| CIA, dirección | `ete_cia_dir` | CIA / CIV | `id`=Izquierda → derecha · `di`=Derecha → izquierda · `bi`=Bidireccional |
| CIA, tamaño | `ete_cia_tam_max`, `ete_cia_tam_min` | CIA / CIV | numéricos (mm) |
| CIV, tipo | `ete_civ_tipo` | CIA / CIV | `perimembranosa` · `muscular` · `infundibular` · `inlet` |
| CIV, dirección | **NO EXISTE** (`ete_civ_dir` no está en el archivo) | — | lo más cercano es `ete_civ_pas`, un **numérico** en mmHg |
| Ductus, tipo | `dap_tipo` | Ductus | `silente` · `restrictivo` (pequeño) · `no_restrictivo` (grande) |
| Ductus, dirección | `dap_dir` | Ductus | `id` · `bi` · `di` |
| Ventana aortopulmonar, tipo | `vap_tipo` | Ventana aortopulmonar | `i`=Tipo I — proximal · `ii`=Tipo II — distal · `iii`=Tipo III — total |
| Ventana, dirección | `vap_dir` | Ventana aortopulmonar | `id` · `bi` · `di` |
| Conexión venosa anómala, drenaje | `cvpa_conexion` | CVPA parcial | `vcs`=Vena cava superior · `vci`=Vena cava inferior · `ad`=Aurícula derecha directa · `acigos`=Vena ácigos · `otra`=Otra |
| CVPA, lado | `cvpa_lado` | CVPA parcial | `der` · `izq` · `bil` |
| CVPA, CIA asociada | `cvpa_cia_ro` | CVPA parcial | **espejo de solo lectura** (`data-espejo`), no un selector |
| Eisenmenger, lesión de base | `eis_lesion_base` | Eisenmenger | `civ` · `cia` · `dap` · `dsav` · `tronco`=Tronco arterioso · `tga` · `otra`=Otra CC compleja |
| Eisenmenger, dirección | **NO EXISTE** | — | la dirección la publica cada shunt en su propia pestaña |

**Para la parte 2 de esta obra** (no se usan en esta tanda, quedan inventariados):

| Módulo | Campo | Opciones |
|---|---|---|
| Coartación, situación | `coa_situacion` | `nativa` · `recoartacion` · `post_stent` · `post_cirugia` |
| Coartación, localización | `coa_loc` | `preductal` · `yuxtaductal` · `posductal` |
| Estenosis pulmonar, nivel | `ep_nivel` | ⚠️ **sus `<option>` NO llevan `value`**: el valor ES el texto — «No especificado», «Valvular», «Subvalvular (infundibular)», «Supravalvular», «Ramas pulmonares», «Mixto» |
| Estenosis pulmonar, etiología | `ep_etiologia` | ídem, sin `value`: «No especificada», «Congénita valvular», «Displasia valvular (Noonan)», «Supravalvular (Williams)», «Carcinoide», «Post-quirúrgica», «Ramas pulmonares» |
| Estenosis subaórtica | `esub_tipo` | `membrana` · `tunel` · `noesp` |
| Estenosis subaórtica, IA asociada | `esub_ia_asociada` | `no` · `leve` · `moderada` · `severa` |
| Supravalvular aórtica | `easv_tipo` | `reloj` · `difusa` · `membranosa` · `noesp` |
| Defecto del septo AV, tipo | `dsav_tipo` | `parcial` · `completo` · `intermedio` · `noesp` |
| Defecto AV, regurgitación izquierda | `dsav_regurg_av_izq` | `no` · `leve` · `moderada` · `severa` |
| Ebstein | `ebs_desplazamiento` (mm), `ebs_atrializacion` (%), `ebs_it_ro` (espejo), `ebs_area_*` | numéricos |
| Fontan, tipo | `fontan_tipo` | `tunel`=Túnel lateral · `extra`=Conexión cavopulmonar total extracardíaca · `ap`=Aurícula-pulmonar (antiguo) · `noesp` |
| Fontan, fenestración | `fontan_fenestracion` | `sin` · `presente` · `cerrada` |
| Fallot **reparado** | `tdf_civ_residual` (`no_eval`/`no`/`si`), `tdf_ip_ro` (espejo), `tdf_grad_tsvd`, `tdf_func_vd`, `tdf_vtdvdi` | — |

---

## 3 · El cruce demo ↔ pestaña: qué dibuja qué, qué no tiene dibujo y qué no tiene opción

### 3.1 Las opciones de la pestaña que **SÍ** tienen variante en la demo

| Pestaña | Variante de la demo |
|---|---|
| `ete_cia_tipo = secundum` | `cia:sec` |
| `ete_cia_tipo = primum` | `cia:pri` |
| `ete_cia_tipo = sv_vcs` | `cia:sv` |
| `ete_civ_tipo = perimembranosa` | `civ:pm` |
| `ete_civ_tipo = muscular` | `civ:mus` |
| `ete_civ_tipo = infundibular` | `civ:sal` (de salida / subarterial) |
| `ete_civ_tipo = inlet` | `civ:ent` (de entrada) |
| `dap_tipo` (los **tres** valores) | `dap:std` — la demo no distingue el tamaño del ductus |
| `vap_tipo = i` | `vap:prox` |
| `vap_tipo = ii` | `vap:dis` |
| `cvpa_conexion = vcs` | `cvpa:cs` |
| `eis_lesion_base = civ / cia / dap / dsav` | `eis:std` con esa comunicación |
| `dsav_tipo = parcial` | base `dsav` variante `par` |
| `dsav_tipo = intermedio` | base `dsav` variante `tra` (transicional) |
| `dsav_tipo = completo` | base `dsav` variante `com` |
| `fontan_tipo = extra` | base `fon` variante `ext` |
| `fontan_tipo = tunel` | base `fon` variante `tun` |
| `fontan_tipo = ap` | base `fon` variante `atr` |
| `fontan_fenestracion = presente` | casilla `fen` |
| `coa_situacion = nativa` | `coa:nat` |
| `coa_situacion = post_stent / post_cirugia` | `coa:rep` |
| `coa_situacion = recoartacion` | `coa:rep` + casilla `rec` |
| `ep_nivel = Valvular` | `ep:valv` |
| `ep_nivel = Subvalvular (infundibular)` | `ep:sub` |
| `ep_nivel = Supravalvular` / `Ramas pulmonares` | `ep:sup` |
| `esub_tipo` (cualquiera) | `ea:sub` |
| `easv_tipo` (cualquiera) | `ea:sup` |
| `esub_ia_asociada = leve/moderada/severa` | casilla `iao` |
| `dsav_regurg_av_izq = leve/moderada/severa` | casilla `iav` |
| `ebs_*` cargado | base `ebs` variante `std` |
| `ebs_it_ro` con grado | casilla `eit` |
| `tdf_*` cargado | base `fal` variante `op` (**reparado**) |
| `tdf_civ_residual = si` | casilla `rciv` |
| `tdf_ip_ro` con grado | casilla `ip` |

### 3.2 Opciones de la pestaña **SIN** dibujo en la demo

| Pestaña | Por qué |
|---|---|
| `ete_cia_tipo = sv_vci` | la demo sólo dibuja el seno venoso **superior** |
| `ete_cia_tipo = seno_coronario` | la demo no dibuja esa variante |
| `vap_tipo = iii` (total) | la demo dibuja proximal y distal, no la total |
| `cvpa_conexion = vci / ad / acigos / otra` | la demo dibuja sólo el drenaje a la cava **superior** |
| `cvpa_lado = izq / bil` | la demo dibuja la vena **derecha** |
| `ep_nivel = Mixto` | la demo tiene un solo nivel por vez |
| `eis_lesion_base = tronco / tga / otra` | la demo necesita una CIA, una CIV, un ductus o una ventana |
| `coa_loc` (las tres) | la demo dibuja el istmo y no distingue la localización |
| `fontan_fenestracion = cerrada` | la demo dibuja la fenestración o nada |
| `dsav_tipo = noesp`, `esub_tipo = noesp`, `easv_tipo = noesp`, `fontan_tipo = noesp` | «no especificado» no elige variante |

### 3.3 Variantes de la demo **SIN** opción en la pestaña

| Variante de la demo | Estado en la app |
|---|---|
| **`fal:sin` — Fallot sin operar** | **La pestaña de Fallot es de Fallot REPARADO** (`tdf_*`: CIV residual, insuficiencia pulmonar, gradiente del tracto de salida). No hay forma de consignar un Fallot sin operar. |
| **`vcs:std` — cava superior izquierda persistente** | **No existía el dato.** Lo agrega el **commit 3** de esta tanda, como casilla en «Variantes anatómicas» de la pestaña Otros. |
| `coa_nat` + casilla `col` (colaterales) | no hay campo de colaterales en la coartación |
| `coa_rep` + casilla `ane` (aneurisma) | no hay campo de aneurisma en la coartación |
| `ea_sup` + casilla `iao` | `easv_*` no tiene campo de insuficiencia aórtica asociada (sí lo tiene `esub_*`) |
| `fal_op` + casilla `rest` / `rvd` | la app los tiene como numéricos (`tdf_grad_tsvd`, `tdf_vtdvdi`) y no como una casilla |
| `eis` con dirección propia | la dirección la publica cada shunt en su pestaña, no la sección de Eisenmenger |

---

## 4 · Alto y ancho del módulo actual, medido

Con la pestaña **C. frecuentes** delante, el panel abierto por su botón real y las transiciones
apagadas. `#cc3d-panel` es el módulo; el lienzo es el `<canvas>` de `#tga-3d-cv`.

| Ventana | Botón «Ver en 3D» | Panel (ancho × alto) | Lienzo | three.js | Errores de consola |
|---|---|---|---|---|---|
| 1440 px | 103 × 44 | **1232 × 711** | 926 × 420 | r128 | 0 |
| 1000 px | 103 × 44 | **808 × 1193** | 780 × 420 | r128 | 0 |
| 768 px | 103 × 44 | **736 × 1208** | 708 × 420 | r128 | 0 |
| 390 px | 103 × 44 | **358 × 1383** | 330 × 420 | r128 | 0 |

A 1440 px el esquema de circulación va **al lado** del 3D y el panel mide 711 px; por debajo de
1200 px se apila y el panel pasa de 1193 a 1383 px. El botón mide **44 px de alto** en los cuatro
anchos. La línea de lo no dibujado dice, con el formulario vacío: «Sin lesiones cargadas que
dibujar: se muestra el corazon normal.»

---

## 5 · Los casos de la suite que afirman el 3D actual o las variantes anatómicas

Censados por posición dentro de cada `caso('TC-…')`: **veinte** casos lo nombran.

| Caso | Qué nombra |
|---|---|
| TC-471 | el globo `cc-3d` en el registro |
| TC-500 | `cc-3d` y `tga-3d` en el conteo del registro de globos |
| TC-502 | `cc-3d` y `tga-3d` entre las tarjetas sin ficha en Referencias |
| TC-535 | `cc-3d` y `tga-3d` entre los globos de 44 × 44 |
| TC-561 | el campo de la cirugía y el Excel de 441 columnas |
| TC-562 | **el caso grande del 3D**: `tga3dEscena`, `tga3dComs`, `tga3dSync`, `tga3dBoot`, `tga3dLineaPDF`, `tga3dNormToggle` |
| TC-564, TC-574 | la geometría y las comunicaciones |
| TC-570, TC-573, TC-601, TC-604 | la pantalla y el esquema de circulación |
| TC-615, TC-619 | la línea del PDF |
| TC-625, TC-626 | `cc3d`: el pie del corazón maestro |
| TC-499, TC-509, TC-514, TC-515 | **las variantes anatómicas** (`OTR_HALL`, `otrHallazgos`, `otr_var_senocor`) — son los que el commit 3 puede mover |

---

## 6 · El defecto del reloj del commit 2: medido, y **NO se reproduce**

La orden describe un error intermitente: en el primer cuadro el reloj de
`requestAnimationFrame` puede ser anterior al instante tomado al iniciar el motor, el tiempo
transcurrido sale negativo y el parámetro de la curva se evalúa fuera de rango, con el error
«Cannot read properties of undefined (reading 'x')».

**Se reprodujo con una sonda y la medición es concluyente.** `scripts/_probe_pant12reloj.mjs`
instala, **antes de que la página corra una línea**, un `requestAnimationFrame` que entrega a las
diez primeras llamadas un reloj **cinco segundos anterior** al real, y un contador sobre
`CatmullRomCurve3.prototype.getPointAt` que cuenta cuántas veces el parámetro sale del intervalo
de cero a uno.

| Árbol | Parámetros fuera de rango | Llamadas (denominador) | Peor valor | Errores de página |
|---|---|---|---|---|
| **El de hoy** (`a78bd6ce`) | **0** | 13.088 | 0 | **0** |
| **Copia mutada** sin las dos guardas | **2** | 12.964 | **−0,0094** | **2 × «Cannot read properties of undefined (reading 'x')»** |

**La copia mutada es el control positivo**, y hubo que fabricarla porque **el árbol de hoy ya
lleva las tres guardas**: `Math.max(0, …)` en el tiempo transcurrido, el **doble módulo** del
parámetro de la curva y el `last = performance.now()` puesto en hora justo antes de arrancar el
bucle. Las tres las puso la tanda **TGA** del 31/10/2026, que encontró el defecto al portar la
demo, y el código las documenta con su comentario.

**Y no hay otro lugar donde buscarlo**, censado: una sola aparición de `CatmullRomCurve3` y un
solo `getPointAt` animado por tiempo en todo el archivo. La fase 1 **no tiene motor propio**:
presta el de la transposición.

**Conclusión: el commit 2 no cambia una línea.** La lección se aplica donde sí vale —el motor
**nuevo** del commit 4 nace con las tres guardas— y la sonda queda como la evidencia, con su
control positivo, de que el árbol de hoy no tiene el defecto.

⚠️ El único error de consola de las corridas es `ERR_FILE_NOT_FOUND`, **del arnés**: la copia se
carga desde el directorio temporal y ahí un recurso relativo no resuelve. Es lo que la tanda D2 ya
documenta; el árbol vivo da **cero**.
