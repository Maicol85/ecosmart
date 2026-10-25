# Mapa — la tanda AJ7 (2026-10-24)

Los pendientes acumulados de **AJ3, AJ5, AJ6, J y J2**, más el **G-a** del agregado. Ocho
commits. Por nombre de función y de constante, no por número de línea.

> Antes de abrir este mapa: si buscás un corte del VD mirá `vd-derecho.md`; si buscás la
> pantalla de la mitral, `aj5-mitral-tipoim-carpentier.md`; si buscás la constricción o el
> VExUS, `j-pericardio-constriccion-vexus.md`. Acá está **sólo lo que esta tanda movió**.

---

## 1 · Fallot — el EN SUMA sin la IP y el `resumen` descriptivo

| Qué | Dónde |
|---|---|
| La línea del EN SUMA | `ccSumaLinea('tdf')`, el `case 'tdf'` |
| La compuerta de esa línea | el `if (!ipHayInsuf(ip) && !fvd && g == null …) return null` **del mismo `case`** |
| El texto descriptivo y el `resumen` | `tdfConclusion()`, constante local `_tdfDesc` |
| Los dos consumidores de `resumen` | `ccHoja(sec[3], c.parrafos \|\| [], c.resumen \|\| null, null)` —la hoja de congénitas del PDF— y `_pptTxt(cc.resumen \|\| cc.txt)` —la diapositiva del PPT— |
| Lo que clasifica el Laboratorio | `clave`, contra `TDF_CONDUCTAS`. **No se tocó** |

**Lo que cambió, en una línea:** la línea del EN SUMA dejó de publicar la insuficiencia
pulmonar —que la sección de la válvula pulmonar ya emite más arriba, desde el **mismo campo**
`ip_grado`— y `resumen` pasó de ser «encabezado + IP + conducta» a ser el **texto descriptivo
completo**. La conducta salió de las dos superficies que la publicaban.

⚠️ **`ipHayInsuf(ip)` SE QUEDA EN LA COMPUERTA**, y no es un olvido. La compuerta decide si el
EN SUMA **nombra** la cardiopatía, no qué dice de ella: sacándola, un estudio cuyo único
hallazgo de la sección fuera la IP dejaría de publicar la línea entera y el EN SUMA no diría
nunca que el paciente tiene una tetralogía reparada. **TC-535 (A7) lo fija por ese lado.**

⚠️ **`conducta` SE DEVUELVE Y NINGUNA SUPERFICIE LA PUBLICA.** Vive en el objeto para que la
cascada de la ESC 2020 siga siendo legible y verificable desde afuera, y porque `clave` —lo que
clasifica el Laboratorio— se decide en las MISMAS ramas.

⚠️ **`sumaTV` SALIÓ, y tenía dos defectos.** Su comentario decía «sube al EN SUMA» y era falso
—el EN SUMA de esta sección lo arma `ccSumaLinea('tdf')`, que tiene su propia cláusula de
taquicardia ventricular—, y su texto, «valorar estudio electrofisiológico», es una **conducta**.
Lo que la TV tiene que decir sigue saliendo por `salvedadTV`, que viaja en `gOtro` y por lo tanto
llega a las tres superficies.

⚠️ **EL GRADIENTE NO SE MOVIÓ.** `g` cae en `vp_gmax` cuando `tdf_grad_tsvd` está vacío, y ése sí
es el gradiente transvalvular pulmonar que la sección de válvulas también publica. La orden
nombraba la IP y nada más. → `PENDIENTES.md` **AJ7-a**.

---

## 2 · HF-PEFF, ateroma y los bloques integrados

### La presión de llenado «Normal»

Una sola línea, en el array `lineas` de la sección del HFA-PEFF del panel, en la rama
`else if (pll === 'normal')`. **Se REESCRIBIÓ, no se agregó una segunda**: agregar habría dejado
dos líneas diciendo casi lo mismo, que es el defecto que AJ2-i declara para el ateroma.

Fuente, la única que el módulo ya cita: **Pieske 2019, folio 3307, hoja 11** — «normal LVEDP or
mPCWP levels at rest do not exclude HFpEF» — verificada en el original por la tanda AJ3, con la
**Figura 4B (folio 3306, hoja 10) renderizada en imagen**. El folio 3305 se conserva porque es de
donde sale la recomendación de seguir durante el ejercicio.

⚠️ **LA SECCIÓN EMITE CADA LÍNEA DOS VECES** —una con sus corchetes de cita y otra en la copia
sin acentos que alimenta el papel—, así que un caso que exija **una sola** aparición da un rojo
que no describe ningún defecto. El denominador correcto es una línea preexistente del mismo
bloque: TC-535 (B3/B3b) lo hace así.

### El ateroma aórtico

| Qué | Dónde |
|---|---|
| Las cuatro filas de la caja | el `calc-box` de `#ete-seccion-aorta` |
| Quién las escribe | `calcAteroAo()` |
| La hoja del ETE que las publica | `_amTxt('ao-atero-desc')`, `_amTxt('ao-riesgo-embol')`, `_amTxt('ao-recomendacion')` |

La fila **«Clasificación — descripción»** (`ao-atero-desc`) se **esconde** —no se borra el span:
lo escribe `calcAteroAo`, lo barre `limpiarCampos` y la guarda `if (d || r || rec)` decide si hay
bloque «Valoración» que emitir—, y su línea **`Descripción | …`** sale de la hoja del ETE. Quedan
las otras dos: «Descripción del hallazgo» y «Grosor medido — grado en la escala». Con el grado 4
la primera decía «Ateroma de más de 5 mm» y la segunda «Ateroma de más de 5 mm (grado 4).»: la
segunda **contiene** a la primera. Cierra **AJ2-i**.

### Los bloques integrados

| Qué | Dónde |
|---|---|
| El refresco por módulo | `amiloRefrescarSiIntacto(k)` |
| El barrido, debounced a 220 ms | `_amiloBarrido` → `amiloRefrescarTodos()` |
| La marca de «editado a mano» | `_amiloEditado` / `am-editados` / `_amiloEstaEditado(k)` |
| El desfase | `_amiloDesfasado(k)` |
| Los rótulos desfasados, para el aviso | `_amiloDesfasadosRot()` **(nuevo)** |
| El aviso al exportar | `generarPDF()`, antes del gate de severidades |

`_AM_VACIA_RETIRA` **se retiró**: el retiro por `gen()` vacío vale ahora para los diecisiete
módulos. Y el refresco pasa a mirar **`sec.hayDatos()`**, que ya existía en el registro y lo
declaran los propios módulos.

⚠️ **CENSADOS LOS DIECISIETE GENERADORES CON EL FORMULARIO VACÍO**, medido en Chrome:
`teer` y `pulm` devuelven texto **vacío** y ya se retiraban; **`pop` declara `hayDatos() === false`
y aun así emitía 377 caracteres de «no consignado»**, o sea que su hoja seguía saliendo del PDF
firmado sobre un módulo que el propio módulo da por vacío. Ésa es la que este commit cierra.
`hfpeff` devuelve `true` con el formulario vacío **y eso es correcto**: su `hayDatos` contesta si
el score APLICA, no si hay datos. Los otros trece no declaran `hayDatos` → `PENDIENTES.md` **AJ7-b**.

⚠️ **EL AVISO VA EN `generarPDF` Y NO EN `generarPDFReal`**: a `generarPDFReal` también lo llama
la pasada de MEDICIÓN de `_pdfAjustarA4` y la reimpresión de un guardado.
**No cambia lo que se publica**: si el médico acepta, el PDF sale idéntico.

---

## 3 · El strain del VD vota, y la mitral protésica bloquea

### El voto

| Qué | Dónde |
|---|---|
| Las tres bandas del campo | `vdStrainPlCat(x)` · `VD_STRAIN_PL_NORMAL` (20) y `VD_STRAIN_PL_LEVE` (15) |
| El OR de la función del VD | `const vdDisf = tapseBajo \|\| spBajo \|\| facBajo \|\| teiAlt \|\| strVota` |
| El grado | `vdDisfGrado(tapse, sp)` y, sólo si ése no pudo, el piso del strain |
| La compuerta de la AFIRMACIÓN | `hayFunc`. **NO se tocó** |

**CÓMO COMBINAN HOY TAPSE Y ONDA S′, medido antes de escribir:** `vdDisf` es un **OR** de
parámetros —cada uno cuenta sólo si está medido y uno alcanza—, y el **grado** lo da
`vdDisfGrado(tapse, sp)`, que mira **sólo esos dos**: le pide su banda a `ase25Grado` para cada
uno, devuelve `null` si **alguno de los dos es normal** —un parámetro normal bloquea el grado— y
si los dos son anormales publica el **rango** entre el menos y el más grave («leve-moderada»).
La FAC y el Tei votan en el OR pero **no** entran en el grado, y la FEVD no vota.

Las tres reglas del strain: **15 a 20 % en valor absoluto → leve**; **por debajo de 15 → «leve
como mínimo»**, nunca moderada ni severa; **por encima de 20 → no vota**. El strain **no puede
subir el grado**, sólo poner un piso.

⚠️ **MODERADA Y SEVERA NO EXISTEN, y se censó otra vez en esta tanda sobre el registro del
proyecto:** `ASE25_T1` no tiene entrada de strain, la Tabla 1 del folio 145 no lo bandea y el
texto del folio 159 publica un único corte, el de normalidad. **La ASE 2025 de corazón derecho
NO publica cortes de moderada ni de severa**, así que no hay nada que reportar sin aplicar.

⚠️ **`hayFunc` NO SE TOCÓ**, y es deliberado: con el strain adentro, un estudio cuyo único dato
de función fuera un strain de −25 % firmaría «función sistólica conservada» sin un solo parámetro
votante medido. Con el strain solo, la oración sigue siendo descriptiva y no gradúa.

### La banda leve en Referencias

Ficha **`FUN-VD-008`**, con `tipo: 'criterio propio de EcoSmart'` y `estado: 'por verificar'`:
`_evRefBiblio` **saltea** toda ficha que no esté `verificado`, así que `B.idx['FUN-VD-008']` es
`undefined` y `_evRefTabla` **no imprime número**. La fila sale **sin corchete**, que es la regla
para un corte que la fuente no publica. Abajo, la nota con el chip **CRITERIO DE ECOSMART**,
armada con **nodos y no con `innerHTML`**. Cierra **AJ5-e**.

### La mitral protésica

`vmProtBloqSync()` —`_VM_PROT_BLOQ = ['vm_tipo_im', 'vm_carp']`— atenúa y bloquea los dos
`<select>` cuando `vmEsProtesis()`, **conservando el valor cargado**. Pinta y no escribe: va en
`RECALC_MODULOS`, en `limpiarCampos` y en los `onchange` de `vm_morf` y de `ete_etiologia`.

⚠️ **`disabled` DEJA EL CAMPO FUERA DE UN `FormData`, pero este formulario NO se serializa así**:
el censo recorre `input[id],select[id],textarea[id]` y lee `.value`, que un `<select>`
deshabilitado conserva. Verificado con el censo de campos y las 440 columnas del Excel.

### El rótulo que entra

`vmMorfFitSync()` mide el **texto seleccionado** contra el ancho útil de hoy —ancho menos los dos
padding menos 18 px de la flecha— y baja el cuerpo **de a 0,25 px** hasta que entre, con piso
declarado `_VM_MORF_FS_MIN = 10`. **Se mide, no se fija un número**: un `font-size: 12px` en el
CSS queda viejo el día que cambie el ancho de la columna, la tipografía o el texto de una opción.

⚠️ **LA PRIMERA LÍNEA BORRA EL INLINE** (`el.style.fontSize = ''`): sin eso cada llamada mediría
contra el cuerpo que dejó la anterior y el campo se achicaría escalón a escalón hasta el piso.
⚠️ **Y SALE TEMPRANO CON ANCHO 0**, a propósito: no se mide un control escondido. Un caso que lo
ejercite tiene que **abrirlo primero**, o lee un ancho útil negativo y un cuerpo sin achicar.

---

## 4 · Constricción y VExUS

| Qué | Dónde |
|---|---|
| Las frases clínicas del informe y del PDF | `cvrFrases(st)` |
| La compuerta del MÓDULO | `cvrEstado()`, `espEval === 0` |
| La compuerta de la EVIDENCIA | `_indConstr()`, la constante local `_propio` **(nueva)** |
| El aviso de la VCI | el bloque de `aviso.innerHTML` de VExUS, con `_vn` |
| La población del estudio | la primera línea del array `art` de `_indVexus()` |

**Las dos frases NO tuvieron el mismo destino.** «El diagnóstico definitivo requiere correlación
clínica e imagenológica (TC/RMC pericárdica)» **sí** la respalda la Recommendation Table 24
(folio 64), cuya primera fila recomienda la imagen multimodal en todo paciente con sospecha de
pericarditis constrictiva, **Clase I · Nivel C** — y la Evidencia **ya la publica** con esa clase
y ese folio desde que la sección nació, así que no hubo nada que mover. «Considerar RMC con
gadolinio» vive en la rama **RESTRICTIVA**, que es una miocardiopatía: la Table 24 no tiene
ninguna fila sobre ella, así que **se retira y no va a Evidencia**.

**La compuerta de la Evidencia** pasa a mirar los datos propios de la constricción: `esep`,
`elat`, `rebote`, `hep` y `hepCoc`. La respirofasicidad —mitral y tricúspide— y la plétora de VCI
**siguen en la sección** y se publican como siempre; lo único que dejaron de hacer es **abrirla**.

⚠️ **SON DOS COMPUERTAS Y SE DECLARA:** `cvrEstado` conserva la suya. Ya no contestan la misma
pregunta: una decide si se **concluye**, la otra si la Evidencia **despierta**.
⚠️ **LO QUE ESTO CUESTA, MEDIDO:** las velocidades anulares están cargadas en casi todos los
estudios, así que un perfil diastólico de rutina **ABRE** esta sección con las filas del
pericardio en «—». El módulo no concluye nada en ese caso. → `PENDIENTES.md` **AJ7-c**.

**El aviso de la VCI** se arma con `[...].join('')`. No es una concatenación para
`ceibo-xss-innerhtml-concat`, así que las tres salen del reporte **sin apagar la regla, sin un
`nosemgrep` y sin volver al número escrito a mano**. El texto es el **mismo byte por byte** en
19, 20 y 21 mm, y el corte no cambia. Semgrep vuelve de **127 a 124 WARNING**.

---

## 5 · Cardio-oncología · 6 · Celular · 8 · El corte de HTP

- **`reevaluar en 3-6 sem`** sale de las **dos** copias de la fila anti-HER2 (la tabla
  «Cardiotoxicidad» y la subtab «Monitoreo eco»). **No se escribe nada en su lugar**: lo que la
  Figura 11 publica son plazos de **vigilancia por riesgo**, que contestan otra pregunta.
- **`.vinfo-btn.vinfo-btn-44`** da el piso táctil **sin la media query**, y lo llevan **sólo** el
  globo del score de amiloidosis y el del bloque de pleura del POP. **Sin márgenes negativos**:
  un área de 44×44 encajada con `margin:-16px` taparía 16 px del campo de abajo. El contenedor
  crece. Verificado con `elementFromPoint` sobre las cuatro esquinas y el centro.
- **`HP_PAPM_MIN`** (20 mmHg, ESC/ERS 2022 folio 30) es el dueño único del corte de hipertensión
  pulmonar, declarado junto a `RVP_ELEVADA_UW` —su vecino de cascada y el **primero de los dos
  bloques `<script>` que lo necesita**, porque un `const` no está en `window`—.
  `POP_PAPM_HP_MMHG` se retiró: cero ocurrencias.

⚠️ **PAPm 20 EXACTO ES INALCANZABLE del lado de hemodinámica**: ahí la PAPm es **derivada**
(0,61 × PSAP + 2) y no hay PSAP binario que dé 18,000 exacto. El borde se prueba por los dos
lados (19,995 y 20,056) y el **20 exacto** del lado del posoperatorio, donde la PAPm es un
promedio directo.

---

## Cobertura

`TC-535`, con su ficha en **`docs/mapa/tests-fichas-535.md`**. El arnés de mutaciones dirigidas
es `scripts/_mut_aj7.py`. La sonda A/B de solo lectura es `scripts/_probe_aj7.mjs`.
