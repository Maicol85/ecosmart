# Las opciones de plastia, TEER y TAVI, y el PPT del banco — tanda VAL-PPT (2026-11-02)

Mapa de la tanda **VAL-PPT**. Como todos los de esta carpeta, va **por nombre de función y de
constante**, no por número de línea: la línea cambia en cada edición y el nombre no.

---

## 1 · Las cuatro opciones nuevas, y dónde vive cada pieza

| Qué | Quién es su dueño |
|---|---|
| Las dos opciones de la mitral | el `<select id="vm_morf">`: «Plastia mitral» y «TEER mitral» |
| Las dos de la tricúspide | el `<select id="vt_morf">`: «Plastia tricuspídea» y «TEER tricuspídeo (T-TEER)» |
| Su redacción en el papel | `VALV_MORF_FRASE` (**no** `VALV_MORF_ETIOL`) |
| Que el importador las acepte | `LAB_XLS_LISTAS.vm_morf` y `.vt_morf` |
| Qué ofrece el selector del posoperatorio | `POP_TIPO_OP_PREFIJOS` + `_popVEsTipoOp` |
| El tipo corto que consume el dibujo | `popVTipoCorto` |

### ⚠️ SON TRES LISTAS PARALELAS Y HAY QUE TOCAR LAS TRES
Medido en el árbol de HEAD, inyectando la opción al vuelo —un `value` que no es ninguna
`<option>` deja el select en cadena vacía, así que **no se puede medir un valor desconocido
asignándolo**—:

1. **Sin la entrada en `LAB_XLS_LISTAS`**, `_labXlsLista` devuelve `null` y el importador
   **descarta la FILA ENTERA** del paciente —nombre, cédula, FEVI, informe—, no la celda.
   `_labXlsAssertListas()` compara las dos al arrancar y grita en consola.
2. **Sin la entrada en `VALV_MORF_FRASE`**, el fallback de `_valvMorfF` pasa la opción a
   minúsculas y el informe **firmado** publicaba «Válvula tricúspide de morfología **teer
   tricuspídeo (t-teer)**». Es el mismo defecto que la nota de esa tabla documenta para TAVI.
3. La tercera es el propio `<select>`.

### ⚠️ EL REPARTO POR VÁLVULA NO SE TRANSCRIBE EN NINGÚN LADO
Sale **por construcción** de las `<option>` del propio dueño: la aórtica no tiene plastia ni
TEER entre las suyas y la pulmonar no tiene ninguno de los tres extras. Medido:

| válvula | lo que ofrece el selector del posoperatorio |
|---|---|
| aórtica | prótesis biológica · prótesis mecánica · **TAVI** |
| mitral | las dos prótesis · **Plastia mitral** · **TEER mitral** |
| tricúspide | las dos prótesis · **Plastia tricuspídea** · **TEER tricuspídeo (T-TEER)** |
| pulmonar | sólo las dos prótesis |

Una segunda lista por válvula nacería desincronizada el día que Válvulas agregue una opción,
que es el motivo por el que el clonado de POP-A existe.

### `VALV_MORF_FRASE` y no `VALV_MORF_ETIOL`, y la diferencia no es cosmética
Pertenecer a `ETIOL` dispara además `ccMarcarParrafo()`, que es **conducta del EN SUMA**. Una
plastia y un TEER son, como una prótesis, el **descriptor de una válvula intervenida** —no una
etiología—, así que su lugar es el de las prótesis.

---

## 2 · Cómo se gradúa cada tipo — ningún corte nuevo

**Decisión del médico: las opciones nuevas SÓLO describen.** La plastia y el TEER caen al ramal
**nativo** sin tocar nada, porque `valvEsProtesis` los deja fuera y `protNoGradua` también.
Medido con la misma medición en las cuatro morfologías: la cápsula de estenosis mitral dice lo
mismo con «Mixomatosa», con «Plastia mitral» y con «TEER mitral», y con «Prótesis mecánica»
dice «No graduada: los cortes de válvula nativa no aplican a prótesis».

**Cero campos de graduación se esconden**: PISA, EROA, vena contracta, jet, gradiente y área
quedan como estaban (medido: 0 campos movidos entre nativa y TEER).

### Lo que la lectura respalda, con su folio
Los tres globos nuevos —`vm-morf-tipos`, `vt-morf-tipos`, `va-morf-tipos`— dicen lo que la
fuente dice **y lo que NO define**. Sus reglas de folio están comprobadas en el pie impreso:

| documento | regla de folio | qué aporta |
|---|---|---|
| ASE 2019 de intervenciones percutáneas (Zoghbi, *JASE* 2019;32:431-75) | folio = hoja + 430 | los **tres grados** (folio 460); **PISA descartado** tras el borde a borde (450, 451, 458); el gradiente de 5 mmHg como **predictor** (452, 459); la tabla de la fuga paraprotésica (440) |
| ETE para decisiones quirúrgicas (Nicoara, *JASE* 2020;33:692-734) | folio = hoja + 691 | los cortes de **6 mmHg y 1,8 cm²** de la estenosis mitral **iatrogénica** (folio 702) |
| ESC/EACTS 2025 de valvulopatías (`ehaf194`) | folio = hoja + 4634 | el **T-TEER** en la Recommendation Table 9 (hoja 53 = folio **4687**), **sin cortes propios** |
| ASE 2024 de prótesis (Zoghbi, *JASE* 2024;37:2-63) | folio = hoja + 1 | el **estudio de base de 1 a 3 meses** de la TAVI (folio 20) |

⚠️ **Los cortes de 6 mmHg y 1,8 cm² NO se aplican**: son de la evaluación **en el quirófano**,
al salir de circulación extracorpórea. El globo lo dice.
⚠️ **El «seguimiento anual» del TEER no está en la fuente**: su único «annually» (hoja 36) es
de la válvula pulmonar transcatéter. Parado y no escrito en ninguna parte.
⚠️ **El «baseline 1-3 meses» está en la Table 6, no en la Table 5** —la 5 es «Doppler parameters
of prosthetic valves in the aortic valve position»—. El globo cita la 6.

---

## 3 · El papel, y el EN SUMA que dejó de negar

El cuerpo del informe describe el tipo con la redacción de `VALV_MORF_FRASE`. Ejemplos:

> «Válvula mitral **con plastia mitral**, con estenosis significativa (por AVm: AVm 1.50 cm² por
> planimetría; gradiente medio 7 mmHg) e insuficiencia leve.»
> «Válvula tricúspide **con reparación transcatéter borde a borde (T-TEER)**.»

### El defecto que el commit 3 cierra, y por qué sólo toca a la mitral
Con la plastia o el TEER mitral como **único hallazgo**, el cuerpo describía la plastia y el EN
SUMA decía «Estudio sin alteraciones estructurales ni funcionales significativas». Medido, con
el tipo nuevo como único hallazgo:

| válvula | antes | por qué |
|---|---|---|
| **mitral** | «Estudio sin alteraciones…» | ← el defecto, se cierra acá |
| tricúspide | «VT con plastia tricuspídea.» | su rama de morfología ya subía |
| aórtica | «Sin OTRAS alteraciones… ver el cuerpo» | TAVI es prótesis: la toma el bucle |
| pulmonar | — | sin opciones nuevas |

La pasada nueva vive **dentro del mismo IIFE** del bloque de «prótesis normofuncionante» y usa
sus mismas funciones (`lineaCuerpo`, `reusar`, `yaDicho`): **no agrega una palabra de texto
clínico**, empuja la línea que el cuerpo ya imprimió.

### ⚠️ DOS GUARDAS, Y ROMPER UNA SOLA NO PRODUCE DEFECTO
El filtro por tipo (`tc !== 'plastia' && tc !== 'teer'`) y `yaEnSuma` se tapan mutuamente:
medido, aflojar **sólo** el filtro deja el EN SUMA idéntico en los tres escenarios —es una
mutación **equivalente**—. La mutación que vale rompe **las dos a la vez**. Es la lección del
D-11 con `data-espejo`.
⚠️ Y acá vivía una **tercera** guarda, `valvEsProtesis`, que se retiró porque no hacía nada:
`popVTipoCorto` ya devuelve 'mec', 'bio' o 'tavi' para las tres prótesis.

---

## 4 · Los tres símbolos del dibujo del posoperatorio

Portados de `valveGeo` de `docs/3d/demo_posoperatorio_v9_concepto.html`, con sus números sin
reescalar. **Las piezas se montan UNA vez** y el pintor las prende y las apaga.

| tipo | piezas que prende | piezas que apaga |
|---|---|---|
| **plastia** | `o.aro` (semicírculo `M-10 0A10 10 0 1 1 10 0`, verde `#1d9e75`) + velos nativos | el círculo |
| **TEER** | el círculo verde + `o.clip` (rect 3,2×10) + `o.ori` (**dos elipses**) + velos cortos | el aro, el stent |
| **TAVI** | `o.stent` (rect 18×22 rx 3) + `o.malla` + velos del tejido en dorado | el círculo |
| sin tipo | el círculo **punteado** (`3 3`), **sin velos** | todo lo demás |

Los **dos orificios del TEER se encienden con la apertura**: `_popValvOrificios(a)` devuelve
`cy = -2,2a`, `ry = 0,3 + 2,2a` y opacidad `0,25 + 0,6a`, los tres números de la demo.

### ⚠️ LA TAVI TIENE SUS PROPIOS VELOS, Y LO ENCONTRÓ LA COMPARACIÓN CON LA DEMO
La primera versión le dio los velos de la **biológica** —bisagras en ±8 y largo 8— y la demo los
dibuja en **±7 con largo 6**, porque el stent ocupa el borde. Las 44 escenas de TAVI salieron
distintas. Por eso `_popValvVelos` tiene un modo `'tavi'`.

### ⚠️ EL ACRÓNIMO SE DESTRUÍA POR UNA TERCERA PUERTA
El texto de características del esquema baja la inicial del tipo para armar «mitral con prótesis
mecánica», y eso daba «mitral con **tEER** mitral» y «aórtica con **tAVI**». Hoy la minúscula no
se le aplica a una palabra con otra mayúscula adentro.

---

## 5 · Las tres etiquetas del TEER fuera del papel

**Decisión del médico**: «NO apto», «Heart Team» y «anatomía compleja» salen del papel y se
quedan en la pantalla.

Medido **con el módulo integrado** —sin eso un cero no prueba nada—: la hoja del PDF las traía
en sus **seis plantillas**, «NO apto» ×5, «Heart Team» ×2 y «anatomía compleja» ×1 sobre 3.562
caracteres. El informe en los tres estilos, el EN SUMA en los tres y el PPT daban cero.

Dos piezas, y ninguna reescribe un texto:
- **`_teerTxtSinJuicio(txt)`** corta en la raya larga. Los textos de fallo tienen **siempre** la
  forma «medición — juicio» y los de éxito no llevan raya, así que la medición queda entera sin
  una lista de frases que mantener al día.
- **`teerEstado().papel`** se arma con las **mismas piezas** que `titulo` y `nota` —`fallos`,
  `noIngresados`, `faltantes` y `trombo`—, que quedan intactos para la pantalla.

> antes: «Velo anterior >=20 mm | 18mm <20mm **- NO apto**» · «**NO apto para TEER** según
> criterios actuales» · «5 criterios no cumplidos. **Evaluar cirugía o Heart Team.**»
> ahora: «Velo anterior >=20 mm | 18mm <20mm» · «5 criterio(s) no cumplido(s).» · «Faltan 2
> criterio(s) por ingresar: …»

**Ningún número medido desaparece**, verificado número por número sobre el bloque del papel.

---

## 6 · El PPT del banco de imágenes

### La disposición, `igPptDisposicion(ars, W, HB)` — función **pura**
Elige, entre las candidatas, la que **maximiza el área total ocupada sin deformar**: para una
grilla de `cols × rows` cada elemento ocupa `min(cw, ch·ar) × min(ch, cw/ar)` y se suman.
Candidatas: 2 → `2x1` o `1x2`; 4 → `2x2`, `4x1` o `1x4`.
**Tolerancia `IG_PPT_DISPOS_TOL` = 1 %** del área de la hoja, y ante un empate gana la primera
—la que la app ya usaba—.

| caso | sale | área (de 50,10 in² de hoja) |
|---|---|---|
| dos apaisadas (control) | `2x1` | 28,13 contra 22,31 de `1x2` |
| dos verticales | `2x1` | 28,24 contra 7,06 |
| **cuatro verticales** | **`4x1`** | **44,4 contra 14,1** ← la diferencia |
| cuatro de eco 4:3 (control) | `2x2` | — |
| sin relación de aspecto | `2x1` | cae a 4/3 |

⚠️ **En una hoja 16:9 el apilado no gana nunca** —partir la altura es justo lo que mata a un
elemento vertical—, así que «`2x1` siempre» no distinguiría una regla que funciona de una que
devuelve lo mismo. El control es la **hoja vertical**: ahí la misma función elige `1x2`.

### Lo demás
- **El número es opcional**: casilla `ig-ppt-num`, nace **encendida**, no es campo del estudio
  (el prefijo `ig-` ya está en `_noEsDelEstudio`).
- **La inicial**: «Selección de imágenes — CeiboMed», la fecha, el centro y el médico (de los
  **mismos** campos que el PPT del informe) y el logo. **Sin nombres de pacientes.**
- **La final**: «Gracias» en un **cuadro de texto real** (`addText` escribe un `p:sp` con su
  `p:txBody`), editable en PowerPoint.
- **El tema se elige** con `_pptElegirTema`, el **mismo** modal del PPT del informe y la misma
  clave de `localStorage`: los dos caminos no pueden quedar con temas distintos.

### El bucle con varios videos — ya funcionaba, y está verificado
`_pptxBucleEnDiapo` **recorre todos** los `<p:pic>` con video de la diapositiva y escribe un
`<p:video>` por cada uno. Validado sobre el `.pptx` generado de verdad con un MP4 **real**
(H.264, `moov` antes de `mdat`): 28/28 XML bien formados, **dos videos en la misma diapositiva**
con `repeatCount="indefinite"` y spids **distintos** (9 y 10), 0 referencias colgadas.

⚠️ **Cada video arranca con su propio clic.** El XML pone `<p:cond delay="indefinite"/>` en cada
uno, así que no se inician juntos. Hacerlo exigiría un `<p:seq>` con disparador de diapositiva,
que no se puede verificar sin PowerPoint: la orden pide no inventar un truco frágil.

### La caída sin bucle, probada de verdad
Con `DOMParser` roto —que es de lo que `_pptxBucleVideos` depende— el archivo sale **igual y
sano**: 95.009 bytes contra 95.656, los **dos videos incrustados**, **0 árboles de tiempo**,
0 referencias colgadas, validación **OK**. Y la línea de resultado lo dice. Vale para los **dos**
exportadores, porque el post-proceso vive en `_pptxDescargarSaneado`, su único punto de descarga.

---

## 7 · Dónde están las sondas

| qué mide | sonda |
|---|---|
| el inventario 1a, empíricamente | `scripts/_probe_valppt_inv.mjs` |
| la sincronía en los dos sentidos, con gestos reales | `scripts/_probe_valppt_sinc.mjs` |
| la graduación de cada tipo y los tres globos | `scripts/_probe_valppt_grad.mjs` |
| los tres símbolos contra la demo v9 | `scripts/_probe_valppt_demo.mjs` |
| las piezas del dibujo y su latido | `scripts/_probe_valppt_simb.mjs` |
| las 30 escenas del dibujo sin superposiciones | `scripts/_probe_valppt_dib.mjs` |
| las etiquetas del TEER en el papel | `scripts/_probe_valppt_teer.mjs` |
| la regla de disposición y la casilla | `scripts/_probe_valppt_ppt.mjs` |
| el mazo generado de verdad | `scripts/_probe_valppt_mazo.mjs` |
| el bucle con varios videos | `scripts/_probe_valppt_bucle.mjs` |
| la validación del `.pptx` | `scripts/_val_pptx.py` |
| el A/B de superficies | `scripts/_probe_valpptab.mjs` + `scripts/_ab_popcdiff.mjs` |
| las 24 mutaciones dirigidas | `scripts/_mut_valppt.py` |

---

## 8 · Lo que la corrida completa obligó a cambiar en los casos viejos

**Diecisiete casos viejos afirmaban el comportamiento anterior**, y a los diecisiete los destapó
la corrida completa, no el censo. Lo que sigue es lo que la próxima tanda necesita saber para no
volver a escribir un control frágil.

**El filtro del selector del posoperatorio se le pregunta a `popVTipoCorto`.** Tres casos
—TC-580 (D1), TC-583 (B2)(B5) y TC-595 (A1)— contaban «sólo prótesis» y «tres opciones». El
invariante real no es el conteo: es que **no se pueda elegir un tipo que el dibujo no sabe
dibujar**. `popVTipoCorto` es el dueño único de los símbolos y devuelve **cadena vacía** para
una morfología nativa, así que preguntarle a él hace la condición más fuerte y la deja sin
mantenimiento. El conteo por válvula, medido: **aórtica 4** (vacío + dos prótesis + TAVI),
**mitral 5** y **tricúspide 5** (vacío + dos prótesis + plastia + TEER), **pulmonar 3**.
El reparto por válvula lo fijan TC-583 **(B3)** —la TAVI **sólo** en la aórtica— y **(B3b)** —la
plastia y el TEER **sólo** en mitral y tricúspide—.

**⚠️ Contar las rutas del grupo de una válvula mide el montaje, no el latido.** TC-585 (E9b)
exigía **DOS** `path` en `valv-ao`, y hoy hay **cuatro**: los dos velos más el semicírculo de la
plastia y la malla de la TAVI. Este dibujo **monta cada pieza una vez y el pintor la prende y la
apaga**, así que el conteo sube cada vez que una tanda agrega un símbolo. Lo que se mide ahora
son los dos velos **por posición** —son los dos primeros `path`, con `M-8 0` y `M8 0`— y, en
**(E9c)**, que sobre una prótesis **mecánica** no haya **ninguna** pieza de plastia, de TAVI ni
de TEER encendida. La mata la **mutación 23**.

**Las cuatro etiquetas del TEER en los casos viejos.** TC-74, TC-86, TC-92 y TC-GR-07 exigían el
veredicto en la hoja del PDF. Hoy la hoja publica la **medición entera** de cada criterio y el
**conteo** de los no cumplidos, y el veredicto se le pregunta a la **pantalla**. Las cadenas que
la pantalla sigue dando, medidas: `❌ NO apto para TEER según criterios actuales`,
`✅ APTO para TEER — criterios cumplidos` y
`4mm <7mm — Advertencia: agarre difícil, evaluar con el operador. No modifica el veredicto.`
Las que el papel da hoy: `Velo posterior >=7 mm | 4mm <7mm`,
`Todos los criterios evaluados se cumplen.` y `2 criterio(s) no cumplido(s).`
⚠️ En el papel la raya larga sale como **guión** —lo convierte `_teerAsciiPDF`—, así que un
control que busque la raya en la hoja no encuentra nada.

**TC-585 pasa contra `5ae3959` y eso es correcto.** Es un caso de POP-B, no de esta tanda: lo que
se arregló fue su fragilidad, no un cambio de comportamiento. Los otros siete del 9d **caen**
ahí por catorce condiciones y ninguna por excepción.

---

## ⟶ La tanda CORR-EVID (2026-11-02) — lo que corrigió y lo que midió de esta tanda

- **El EN SUMA de la válvula reparada se reescribió.** La pasada de la sección 3 —el IIFE que
  reusaba la línea del cuerpo— **se retiró**: su `yaEnSuma` era la causa de que la reparación
  desapareciera del resumen en cuanto la válvula tenía una lesión graduada. Hoy lo emite
  `valvRepSuma`, en estilo corto y con la insuficiencia adentro.
- **Los tres símbolos de la sección 4 se midieron sobre el SVG que renderiza la app**, no sólo
  sobre las funciones: **8 de 8 escenas iguales** a la demo v9, número a número, tolerancia
  0,005. El dato llega bien y los cuatro símbolos son distintos; lo que falta es la casilla de
  válvula operada, que es una decisión de diseño.

→ `docs/mapa/correvid-evidencia-congenitas.md`
