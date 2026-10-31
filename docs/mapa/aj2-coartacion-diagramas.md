<!-- mapa armado sobre el cierre de AJUSTES-2, 2026-10-31; los números de línea no se guardan a propósito -->
# Mapa de la TANDA AJUSTES-2 (2026-10-31)

Seis commits de código. Qué mueve cada uno, quién es su dueño, qué se midió y qué se paró.
Los números de línea NO se guardan a propósito: la línea cambia en cada edición, el nombre de
la función no.

---

## 1 · La coartación en el papel: sin recomendaciones y sin guías

**Decisión del médico del 30/10/2026**, la misma que gobierna toda la tanda: *el papel describe;
las guías, las clases, los niveles, las tablas, los folios y las recomendaciones viven en la
Evidencia, en Referencias o en el ⓘ.*

### Lo que el médico vio, medido en HEAD antes de escribir una línea

Coartación nativa, istmo 8 mm, gradiente medio 25 mmHg, con la sección **integrada** al informe:

| superficie | HEAD |
|---|---|
| informe | «Coartación de aorta. Diámetro del istmo 8 mm. Gradiente medio 25 mmHg. Coartación nativa con criterios de significación por Doppler (gradiente medio 25 mmHg, por encima de los 20 mmHg de la ESC 2024) — medir el gradiente pico-pico invasivo, que es el criterio de indicación de la ESC 2024 (Figura 44, folio 120).» |
| EN SUMA | «… — criterios de significación por Doppler — medir el pico-pico invasivo» |
| PDF | el recuadro «!!Segun la guia: \<el mismo texto\>» |
| PPT | la fila «Conclusión según guías» con «Clase I · Nivel C (ESC 2024, Tabla 69 · folio 121) … Preferir stent cuando sea técnicamente factible» |

Censo de las cuatro superficies firmadas de esa escena: «ESC 2024» 8 veces, «Figura 44» 4,
«folio» 4 y «medir el gradiente pico-pico invasivo» 4. Con indicación Clase I: «Clase I» 7,
«Nivel C» 4, «Tabla 69» 4 y «ESC 2020» 3 —esta última era **AO2-b**—.

### El dueño único, y por qué no es un parche por emisor

`coaPapel(c)` + el mapa `COA_PAPEL`. **`coaConclusion().txt` lo leen SEIS consumidores y dos no
son papel**: la cápsula de pantalla (`coa-concl`) y el panel de Evidencia (su `aviso` y su fila
«Según la guía»). Esos dos **conservan la cita**, que es lo que la Parte B de la TANDA NOCTURNA ya
decidió para la raíz aórtica. Con un parche por emisor, el día que se agregue un séptimo
consumidor nadie sabría cuál de los dos textos le toca.

`coaConclusion` pasó a ser un **wrapper**: `_coaConclusionTxt` es el cuerpo de siempre, byte por
byte salvo los discriminadores, y el wrapper agrega `apos` y `papel`.

| clave | `via` | `papel` (la cláusula del papel) |
|---|---|---|
| `significativa` | `gmedio` | `, con criterios de significación por Doppler (mayor de 20 mmHg)` |
| `significativa` | `cola` | `, con criterios de significación por Doppler (cola diastólica con gradiente no concluyente)` |
| `sin_indicacion` | — | `, sin criterios de intervención actuales` |
| `no_significativa` | — | `, sin gradiente significativo` |
| `limitrofe` | `sin_gmedio` | `, sin gradiente medio registrado` |
| `limitrofe` | `gradiente` | `, con gradiente limítrofe` |
| `limitrofe` | `istmo` | `, con istmo hipoplásico respecto de la aorta descendente y gradiente no significativo` |
| `no_interpretable` | — | ` — <lo que quedó fuera de banda> fuera de rango: revisar unidades antes de concluir` |
| `indicacion_i`, `indicacion_iia`, `indicacion_iib` | — | **null** |
| `limitrofe` (pico-pico sin HTA, criterios parciales) | — | **null** |
| `incompleto` | — | **null** (ya está en p[0]) |

⚠️ **`via` discrimina las ramas que comparten clave, y lo publica el clasificador sin mover un
solo umbral**: así este mapa no tiene que releer el 20 mmHg y quedar como segunda voz.

⚠️ **Las once claves devuelven `apos`, no sólo `incompleto`.** Hasta hoy «nativa» viajaba DENTRO
de `c.txt`, así que retirarlo sin mover la aposición habría hecho **desaparecer la palabra del
informe firmado**. Medido en HEAD: su p[0] decía «Coartación de aorta.» a secas. Con localización
cargada va con coma —la forma que `incompleto` ya usaba—; sin ella, pegada.

⚠️ **`COA_SIT_APOS` era una segunda copia de `COA_SUMA_SIT`**, con los mismos cuatro rótulos. Hoy
apunta al dueño único.

### Los cuatro emisores

| emisor | antes | hoy |
|---|---|---|
| cuerpo del informe | `p.join('. ') + '.' + ' ' + c.txt + '.'` | la cláusula **pegada al último dato**, y sin `c.txt` |
| hoja del PDF | `ccHoja('coa', p, c.txt, null)` | `ccHoja('coa', p, **null**, null)` — sin el recuadro «Segun la guia» |
| EN SUMA **integrado** (`ccSumaLinea('coa')`) | el mapa `DX` con «Clase I ESC 2020» | el **dueño único**, más los INSUMOS como datos |
| EN SUMA **no integrado** (`coaSumaFrase`) | sin cláusula | `+ (c.papel \|\| '')` |
| **PPT** (`CC_PPT`, entrada con `papel:true`) | `cc.resumen \|\| cc.txt` | el núcleo de `cc.papel` con mayúscula; vacío ⇒ la fila **no se pinta** |

⚠️ **EL PPT REVIERTE LA DECISIÓN DEL 2026-09-10**, que su propio comentario todavía explicaba
(«el PPT es otro documento … así que la fila "Conclusión según guías" sí la lleva»). El principio
nuevo nombra las **cuatro** superficies. **Sólo la coartación**: las otras once entradas de
`CC_PPT` quedan literales y se listan en el barrido del commit 6.

⚠️ **EL A/B DESTAPÓ UN DEFECTO DE ESTE MISMO COMMIT.** Con el texto escrito a mano en el mapa
`DX`, la escena de la **cola diastólica sola** publicaba en el EN SUMA «(mayor de 20 mmHg)» sobre
un paciente sin gradiente medio medido, mientras el informe decía «(cola diastólica con gradiente
no concluyente)». Eran dos voces; hoy el EN SUMA lee el dueño único y le quita el separador.

### La fuente, verificada en imagen

**ESC 2024 de aorta, edición INGLESA, hoja 112 → folio 3649** (folio = hoja + 3537, comprobado
contra el índice del propio documento). Los **seis** criterios de sospecha de la Figura 44, y el
**E** es «Mean gradient >20 mmHg across the CoA region on DUS», **estricto**.

⚠️ **El «>35 mmHg peak gradient» que la extracción de texto devuelve es un rótulo DENTRO de la
imagen del panel E, no un criterio de la lista.** El comentario del trabajo H tiene razón: el
máximo no figura. Leerlo en texto plano da un falso positivo.

⚠️ **No se agregó ninguna cita**: la Evidencia y el ⓘ ya tenían todo lo que salió del papel —el
criterio por Doppler, el pico-pico como criterio de indicación, la Figura 44 con su folio y las
clases de la ESC 2020—. Verificado: la sección de Evidencia, la tarjeta `evTarjetaCoa` y la
cápsula de pantalla salen **idénticas a HEAD, carácter por carácter**.

---

## 2 · Todo diagrama incluido se guarda con el estudio

### El inventario 2a, medido con el caso del médico

Config **prendido**, estudio guardado de verdad con uuid, los cuatro toggles incluidos:

| k | diagrama | control | `on()` | `data()` | ¿se guarda? |
|---|---|---|---|---|---|
| `contr` | Contractilidad | `contr_be_pdf` | true | 55.222 ch | **NO** |
| `sgl` | Strain (SGL) | `sgl_be_pdf` | true | 55.314 ch | **NO** |
| `vab` | Bicúspide | `vab_pdf` | true | 20.086 ch | **NO** |
| `eteqx` | Vista quirúrgica | `ete_qx_pdf` | true | 57.250 ch | **NO** |
| `tavi` | Jet post-TAVI | `ete_tavi_incluir_chk` | false | 88.198 ch | **NO** |
| `lv3d` | 3D del VI | captura en memoria | false | NULL | **NO** |
| — | orejuela | slot de `imgSlots` | — | — | **SÍ**, desde el COR-5 |

**IndexedDB tras guardar: `imgs` = 0 y `esqs` = 0.** Dónde se pierde: los cuatro toggles sólo
levantan un flag; el PDF rasteriza su canvas en el momento de generarse y **nadie escribe esa
imagen en el estudio**.

### La regla, y por qué `esqs` y no `imgSlots`

`diagGuardarIncluidos()` recorre `INF_MIN_DIAG` y, para cada `on()`, llama a
`esqGuardarDataURL(k, lbl, data())`. Los no incluidos se retiran con `CeiboImg.borrarEsquema`.

⚠️ **VAN A `esqs`, NO A `imgSlots`, Y ESO ES LO QUE DEJA EL PAPEL QUIETO.** `imgSlots` es lo que
el PDF imprime en «Imágenes del estudio»; cada uno de estos cuatro **ya tiene su propia sección**
en el PDF, así que meterlos ahí los imprimiría **dos veces**. `CeiboImg.leer` devuelve sólo
`imgs`, y la pantalla de Guardados sí los ve porque `igImgBlobs` concatena las dos listas.

⚠️ **CUELGA DE `_esqAlGuardar`**, el embudo que la orejuela ya usaba —su comentario anticipaba
«el día que haya un segundo esquema»—, así que **lo automático no escribe nada**: es la lección
que el D-9, el D-10 y el D-11 pagaron tres veces. Y resuelve el «queda pendiente y se guarda con
el estudio»: hasta el 💾 no hay uuid.

`esqGuardarDataURL` es el núcleo que `esqGuardarComoImagen` ahora comparte: **las tres compuertas
—hay almacenamiento, Config prendido, el estudio tiene uuid— viven en una sola función.**

### El valor por omisión (2f)

`imgGuardadoActivo()`: `v === null ? true : v === '1'`.

| clave | HEAD | hoy |
|---|---|---|
| ausente | `false` | **`true`** |
| `'1'` | true | true |
| `'0'` | false | false — **el valor ya elegido se respeta** |

⚠️ **El `catch` sigue devolviendo `false`**: si `localStorage` no se puede leer tampoco se va a
poder guardar. ⚠️ **La función sólo LEE**: no migra ni escribe nada, y ningún estudio ya guardado
cambia. La casilla de ⚙️ Config la pinta `cfgOnShow` desde esta misma función —**medirla sin
abrir Config da «sin marcar» siempre, y parece un defecto de la app**—.

### La ✕ que sobrevive (2d) — cierra AJ1-g

`noPdf` entra en las **DOS** allowlists de IndexedDB, la de escritura (`CeiboImg.guardar`) y la de
lectura (`imgRestaurar`). **Son dos listas**, y agregar la marca a una sola deja el defecto en pie
por el otro lado: es la lección del D-11 con `data-espejo`. Medido con una captura real: HEAD
pierde la marca al guardar y reabrir (0), el árbol nuevo la conserva (1).

**Es la única propiedad que esta tanda agrega**, y es la que la orden autoriza.

---

## 3 · La orejuela determinista en el PDF

### La matriz 3a, con el PDF generado de verdad (HEAD)

| caso | botón que se VE | slots | `esqClave` | `esqEstaIncluido` | PDF |
|---|---|---|---|---|---|
| A nada | 📄 Incluir | 0 | — | false | 0 |
| B incluir | ✓ Incluido | 1 | orejuela | true | 1 |
| C incluir **dos** veces | 📄 Incluir | 0 | — | false | 0 |
| D incluir tres veces | ✓ Incluido | 1 | orejuela | true | 1 |
| E incluir + integrar | ✓ Incluido | 1 | orejuela | true | 1 (+tabla) |
| F integrar solo | 📄 Incluir | 0 | — | false | 0 (+tabla) |
| G incluir + guardar | ✓ Incluido | 1 | orejuela | true | 1 |
| **H** incluir+guardar+**REABRIR** | **📄 Incluir** | 1 | **SIN CLAVE** | **FALSE** | 1 |
| I + integrado, reabierto | 📄 Incluir | 1 | SIN CLAVE | FALSE | 1 (+tabla) |
| J incluir + cambiar pestaña | ✓ Incluido | 1 | orejuela | true | 1 |
| K incluir + 2 PDF seguidos | ✓ Incluido | 1 | orejuela | true | 1 |
| **L** REABRIR y tocar ×1 | ✓ Incluido | **2** | SIN CLAVE, orejuela | true | **2** |
| M REABRIR y tocar ×2 | 📄 Incluir | 1 | SIN CLAVE | false | 1 |

**EL PDF SIEMPRE FUE DETERMINISTA**: lo incluido sale en las trece, y Config, el orden de
generación, el cambio de pestaña y generar el PDF dos veces seguidas no lo mueven. **Lo que no
era determinista es lo que el médico CREE.**

### La causa y la corrección

Al reabrir, el slot vuelve con `esquema:true` pero **sin `esqClave`** —esa propiedad no está en
ninguna de las dos allowlists—, así que el botón anuncia «📄 Incluir en el PDF» sobre un estudio
donde el dibujo ya está. El médico le cree, lo toca, y **el PDF imprime el dibujo dos veces**.

`esqSlotIdx` **adopta** un esquema huérfano, y **sólo cuando hay exactamente uno**: con dos o más
no adopta ninguno —adoptar el equivocado sería peor— y el comportamiento queda como hoy, sin
empeorar. Es una marca de **runtime**: no se escribe en disco.

⚠️ **LA CAUSA RAÍZ NO SE ARREGLA Y SE REPORTA.** Lo correcto sería persistir `esqClave` y
`esqNombre`, pero son **dos** propiedades más y la orden autoriza **una**, que el commit 2 ya usó
para `noPdf`. → `PENDIENTES.md` **AJ2-a**.

---

## 4 · La fila de miniaturas, y «Manga de viento»

- **El texto de ayuda salió** y su contenido vive en `VINFO['inf-min']`, con **dos líneas más**
  que el texto no decía: el camino de **teclado** y que la exclusión del PDF **sobrevive** a
  guardar y reabrir, que es verdad desde el commit 2 y antes no lo era. Su CSS huérfano se retiró.
- ⚠️ **UN SOLAPE TÁCTIL REAL, QUE NO ERA COSMÉTICO.** De los cinco puntos del globo nuevo, la
  esquina **inferior izquierda** devolvía `button.inf-min-x` —la ✕ de la primera miniatura—: su
  `::after` se extiende 22 px a la izquierda y 14 hacia **arriba** a propósito, para no pisar la
  tarjeta vecina, y ahí arriba está la cabecera. **Tocar esa esquina quitaba una imagen del PDF
  cuando el médico quería abrir la ayuda.** Cerrado con `position:relative;z-index:1` sobre ese
  globo. Medido después: **5 de 5** puntos dan el propio botón.
- ⚠️ **LA PREMISA DE 4b ERA FALSA: EL ARRASTRE YA EXISTÍA**, y funciona. Lo implementó AJUSTES-1.
  Medido con gestos reales, tres capturas de colores distintos y el PDF generado de verdad: la ▶
  mueve, el arrastre mueve y **el PDF imprime en ese mismo orden**. Las flechas miden 27×30 de
  caja con área táctil de **27×41** —la extiende un `::after` que el rect no ve— y dan 5/5.
  La fila no anima nada propio, así que `prefers-reduced-motion` no tiene nada que respetar.
- **«Manga de viento»** pierde «— riesgo intermedio» (cierra **AJ1-a**). El `value` **no se toca**:
  es campo guardado, viaja al Excel y vive en los estudios ya guardados.

---

## 5 · Los ⓘ del TRIV

### El inventario 5a (HEAD)

| ⓘ | clave | dónde vive | ¿dice del TRIV? |
|---|---|---|---|
| tamaño del VD | `vd-tam-card` | tarjeta dinámica `evTarjetaVDTam` | **nada** |
| función del VD | `vd-fun-card` | tarjeta dinámica `evTarjetaVDFun` | **nada** |
| TRIV (fila de referencia) | `vd-triv` | registro `VINFO`; la fila sólo se dibuja con un TRIV cargado | **todo** |
| Doppler tricúspide | — | la fila `dt_triv_ref` **no tenía ⓘ** | **nada** |

Censo de las doce frases —las seis del parámetro y las seis de sus tres fuentes—: **12/12** en el
globo del TRIV, **0/12** en los otros tres.

### Un solo texto para los tres

`TRIV_DTI_LEE` y `TRIV_DTI_FUENTE`, dos dueños únicos a nivel de módulo, que leen el globo
`vd-triv`, la tarjeta de función (por `_evBloqueTriv`, que arma el bloque **por nodos**) y la fila
del Doppler tricúspide. **Ni una palabra nueva ni una menos.** El bloque de CRITERIO DE ECOSMART
—la frase del gradiente subestimado— **no** entra en el dueño común: es otra cosa.

⚠️ **La fila del Doppler tricúspide REUSA la clave `vd-triv`**, no una entrada nueva. Dos botones
sobre el MISMO registro es literalmente «el mismo texto».
⚠️ **El bloque va en FUNCIÓN y no en tamaño** —el TRIV es un parámetro funcional—, después de las
seis barras y **sin ficha**: no tiene barra en ese cuadro y `_evFuentesPie` cosecha por ficha.
El ⓘ de **tamaño** lleva **una línea que remite**, y nombra «TRIV» una sola vez.

| | HEAD | hoy |
|---|---|---|
| globo del TRIV | 12/12 | 12/12 (idéntico) |
| función del VD | 0/12 | **12/12** |
| tamaño del VD | 0/12 | 0/12, y **remite** |
| botones `vd-triv` | 1 | **2** |

---

## 6 · El barrido del papel

**Denominador: 148 escenas y 3.072.850 caracteres** de superficie firmada —informe en tres
estilos, EN SUMA en tres, PDF en sus **seis** plantillas y PPT—. El papel está casi limpio:

| # | frase | tipo | superficies | módulo | qué se hizo |
|---|---|---|---|---|---|
| 1 | «El grado VEXUS debe integrarse con la clínica.» | **CONDUCTA** | informe, PDF | VExUS | **retirada** |
| 2 | «…requiere seguimiento ecocardiográfico periódico y evaluación de indicación de intervención según evolución clínica.» | **CONDUCTA** | informe (extenso) | insuf. mitral | **retirada** |
| 3 | «Graduación de Beaubien-Souligny et al., Ultrasound J 2020;12(1):16.» | CITA | informe, PDF | VExUS | listada |
| 4 | «Incompleto — ASE 2025» | CITA | PPT | f. diastólica | listada |
| 5 | «Los patrones venosos también se alteran…» | SALVEDAD | informe, PDF | VExUS | listada |

Y dos **avisos de registro** —«Completar cociente E/A para determinar grado» y «completar los
parámetros del segundo paso»— que dicen que falta un dato para poder graduar, no qué hacer con el
paciente; más el «en seguimiento» de la coartación operada, que describe el estado del paciente.

⚠️ **EL CONTENIDO DE LAS DOS YA ESTABA EN LA EVIDENCIA**, verificado ANTES de retirarlas, así que
no hubo que escribir nada nuevo. ⚠️ **De cada una se retira SÓLO la conducta**: de
`VEXUS_SALVEDAD` salen siete palabras y quedan sus otras dos oraciones; de la mitral queda
«hallazgo de relevancia clínica».

⚠️ **La lista de palabras de la orden no cubría las citas por AUTOR ni por REVISTA**, y la de
Beaubien-Souligny sólo apareció cuando el censo se amplió con esos dos patrones.

---

## Las sondas y el caso

| archivo | qué mide |
|---|---|
| `scripts/_probe_ajustes2ab.mjs` | el A/B de superficies, con **17 escenas de coartación** nuevas que cubren las once claves, y su denominador propio |
| `scripts/_ab_ajustes2diff.mjs` | el comparador, que separa superficie firmada de pantalla |
| `scripts/_probe_ajustes2img.mjs` | el inventario 2a y la prueba del commit 2, con el estudio guardado de verdad |
| `scripts/_probe_ajustes2oai.mjs` | la **matriz 3a**, generando el PDF de verdad |
| `scripts/_probe_ajustes2min.mjs` | la fila de miniaturas, con gestos reales |
| `scripts/_probe_ajustes2barrido.mjs` | el barrido 6a sobre un volcado ya medido |
| `scripts/_mut_ajustes2.py` | las **18 mutaciones dirigidas**, en worktree y con guarda de md5 |

⚠️ **CUATRO DE LAS 18 NO REVIERTEN NADA: LA APLICAN DE MÁS.** La 05 le devuelve la guía al PPT,
la 09 hace que el barrido escriba también los diagramas **no** incluidos, la 13 que la adopción se
haga con **dos** huérfanos y la 17 que el ⓘ de tamaño repita el texto entero. Existen porque las
condiciones que las matan son **controles negativos**.
⚠️ **La 11 rompe las dos allowlists de `noPdf` a la vez**, porque están duplicadas a propósito.
⚠️ **La 02 y la 03 son el mismo error por dos puertas** —el cuerpo del informe y el recuadro del
PDF—: cada una sobrevive si la otra la tapa.

### La 05 sobrevivió DOS veces, y las dos por la misma razón

Ninguna condición miraba el **PPT**. La primera versión del arreglo **reproducía la expresión** del
emisor en vez de ejecutarlo, así que medía código escrito en el caso y no el de la app — un
control que no podía fallar, y la mutación siguió viva. Hoy **(A10)** y **(A11)** espían
`PptxGenJS` y generan el mazo, con el número de diapositivas en el diagnóstico para que un cero no
se confunda con «el PPT no trae la sección».

---

## Las trampas que esta tanda pagó

1. **El acento grave dentro de un comentario**, cinco veces, en cuatro archivos distintos. El
   cuerpo de una sonda y el de un caso son template literals. `check_backticks.py` **no caza** el
   que vive en un comentario; **`node --check` sí**.
2. **La barra invertida simple dentro de un template**, dos veces: `\s` llega como la letra ese.
   La primera se vio como un `SyntaxError` («Invalid or unexpected token» por un salto de línea
   dentro de comillas simples); la segunda, como un reemplazo que quitaba la coma y dejaba el
   espacio. **La segunda se cerró no usando ninguna expresión regular.**
3. **La secuencia de cierre de comentario dentro de un literal de expresión regular** cierra el
   bloque `/* */` antes de tiempo, con un `SyntaxError` que apunta a la palabra siguiente.
4. **`guardarInforme` tiene una salida temprana más** que las que el D-11 documenta: el **gate de
   severidades valvulares** abre una card modal y el callback no llega nunca. Se desactiva
   reemplazando `mostrarCardSeveridadValvular`. Y el campo del documento es **`ci`**, no
   `documento`.
5. **`CeiboImg.indice()` devuelve UN REGISTRO POR ESTUDIO** con su array `slots`, no un elemento
   por imagen: contar sus elementos daba 1 y se leía como «la grilla no ve los esquemas».
6. **La casilla de ⚙️ Config la pinta `cfgOnShow`**, o sea al ABRIR la pestaña: medirla sin
   abrirla da «sin marcar» siempre, con la clave puesta en `'1'`.
7. **Tres PNG escritos a mano se parecen tanto** que cualquier rebanada fija cae en su parte
   común y las tres salen con la misma firma. La firma pasó a ser un **hash del dataURL entero**,
   y las capturas se dibujan con un canvas.
8. **Sin abrir la pestaña por su BOTÓN REAL** todos los `getBoundingClientRect` dan 0×0.
9. **Un patrón que es sufijo de otro** hace ambigua una mutación: los dos `noPdf` sólo difieren
   en la sangría, así que el de lectura aparecía **dos** veces. Van anclados en su línea anterior.

---

## ⟶ La tanda IMÁGENES-3 (2026-10-31) — puntero

Lo que el AJUSTES-2 sacó del PAPEL de la coartación salió también de la **pantalla**:
`coaPantalla(c, src)` es el dueño del texto de la cápsula, el clasificador no se movió y `c.txt`
sigue siendo lo que lee el panel de Evidencia. El ⓘ `coa-card` recibió el criterio de sospecha
por Doppler con la Figura 44 y **los dos folios** (120 de la SEC y 3649 de la inglesa).
Y las **once secciones de `CC_PPT`** que el AJ2-e dejó literales se podan hoy con `_ccPptPodar`,
menos la miocardiopatía hipertrófica, que queda declarada.

→ `docs/mapa/img3-visor-tercios.md`
