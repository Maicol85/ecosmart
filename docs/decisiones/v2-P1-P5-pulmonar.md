<!-- Tanda P1-P6 de la pulmonar (2026-10-04), posterior a E7. Es la medición y las decisiones,
     no el reglamento. El reglamento sigue en `valvulas-botones.md` §1. -->

# Pulmonar — P1 (fuga de `localStorage`), P4 (dos columnas) y P5 (una oración en el estándar)

Sobre `0ab956e`. Tres premisas del prompt se midieron antes de tocar nada y **dos eran falsas**:
ya estaban implementadas. Lo que estaba roto era otra cosa, y más grave.

## P1 — la premisa era falsa; el defecto real es una fuga de `localStorage`

**Premisa del prompt:** «velocidad pulmonar 4 m/s (Gmax 64) prende sólo la pastilla de severidad
"moderada", pero el botón Estenosis queda apagado».

**Medido sobre un estudio limpio:** el botón **SÍ** se prende. `vp_vmax` 4 → `pill-esten-pulmonar`
prendido, `ep_grado='Moderada'`, sub-botón «Moderada ▼»; corregir a 1,4 → **los dos se apagan**
(`ep_grado='sin'`, pastilla «🟡 Severidad ▼»). Eso lo hacen `valvAutoPrenderEsten` /
`valvAutoApagarEsten`, que entraron en E5b-0 punto 2 y en «EP presente» (E5b-1). O sea: lo que P1
pedía ya existía.

**Lo que sí estaba roto, y explica el síntoma:** `limpiarCampos` borraba las claves
`valv-pill-<tipo>-<valvula>` de `['mitral','aortica','tricuspide']` y **la pulmonar no estaba en la
lista**, mientras `cargarValvPills` sí la restauraba desde E5. Las dos claves de la pulmonar
**sobrevivían a «Nuevo estudio»**. Medido en las dos direcciones, con control negativo:

| Escena | Antes del arreglo | Después |
|---|---|---|
| Clave en `'0'` (el médico cerró la pastilla una vez) + «Nuevo estudio» + `vp_vmax` 4 | `ep_grado='Moderada'`, sub-botón «Moderada ▼», **botón APAGADO** — el síntoma del prompt, y no caduca nunca | botón **prendido** |
| Clave en `'1'` + «Nuevo estudio» + `cargarValvPills` | las dos pastillas **prendidas sobre un estudio VACÍO**; informe firmado «Válvula pulmonar de morfología normal, con estenosis e insuficiencia.» y EN SUMA «EP presente. / IP presente.» **sin un solo dato pulmonar** | «Válvula pulmonar normal.» y «Estudio sin alteraciones…» |
| **Control negativo** — la MITRAL por el mismo camino | clave borrada, vuelve a auto-prenderse (`avm_plan` 1,2 → pastilla prendida, `em_grado='severa'`) | idéntico |

La segunda dirección es la cara cara: una valvulopatía afirmada en un informe firmado por herencia
del paciente anterior. `valvAutoPrenderEsten` sale por su `guardado !== null` (respeta el apagado
manual, que es correcto), así que con la clave pegada el auto-prendido quedaba muerto **para
siempre** en ese navegador.

**Arreglo:** la tupla pasó a `VALV_PILL_VALVS`, declarada junto a `limpiarCampos` y usada por los
dos lados del ciclo de vida de la clave (el que borra y el que restaura). Se declara **antes** de
`limpiarCampos` y no junto a `cargarValvPills` porque ése vive en un bloque `<script>` posterior y
un `const` leído desde un bloque anterior es un `ReferenceError` por TDZ.

## P2 — los cortes de la EP (SÓLO REPORTADO, no se tocó)

`epGradoPorGmax` clasifica **por gradiente pico**, no por velocidad:

| Banda | Corte en el código | Equivalente en velocidad |
|---|---|---|
| Normal | `Gmax < 9` mmHg | < 1,5 m/s |
| Leve | `Gmax < 36` | < 3 m/s |
| Moderada | `36 ≤ Gmax ≤ 64` | 3–4 m/s |
| Severa | `Gmax > 64` | > 4 m/s |

Constantes: `EP_GMAX_NORMAL_MAX=9`, `EP_GMAX_LEVE_MAX=36`, `EP_GMAX_MOD_MAX=64`.

**La referencia que recordaba Maicol coincide con el código:** severa > 4 m/s (> 64 mmHg). Con
**4,0 m/s exactos** el gradiente es 64, y 64 cae en moderada porque el corte es `<=` —la severa
empieza **por encima** de 64—. Así que «con 4,0 la app dice moderada» no es un desacuerdo con la
referencia: es el borde de la banda, del lado que la propia referencia pone. No se cambió nada.

**Fuente citada en el código:** el comentario dice «(ESC/ASE)» y el de `calcVP` «ESC/ASE», sin
documento, año, tabla ni página. **No hay fuente verificada escrita** para estos cortes: no están
en `docs/fuentes/FUENTES.md` con la ficha que exige la regla de citación («verificada = texto
completo leído, con documento, año, tabla y página»). El panel de Evidencia de la pulmonar tampoco
los respalda con un corchete. Queda como deuda de fuente, no como hallazgo clínico.

## P3 — también ya estaba implementado

`calcIP` prende `pill-insuf-pulmonar` al cargar `ip_vmax` (> 0) desde E5, respetando el apagado
manual. **Medido:** `ip_vmax` 3 → botón Insuficiencia prendido. Control negativo (sin `ip_vmax`):
apagado. El grado de IP sigue siendo manual, sin clasificación automática. No se tocó.

## P4 — dos columnas, y por qué se aparta de la regla 15

**Decisión de Maicol, preguntada antes de tocar:** insuficiencia a la izquierda, estenosis a la
derecha, cada bloque debajo de su propio botón, apiladas por debajo de 768 px. La fila de botones
**no se toca** (sigue «Insuficiencia | Estenosis», como las otras tres válvulas). Las otras tres
quedan a ancho completo y se llevarán a este formato después, de a una — así que la divergencia de
la **regla 15** es deliberada y está declarada, no colada.

Dos trampas de maquetación que la medición destapó:

- **La columna va fijada a mano (`grid-column`), no por auto-placement.** Los dos bloques se
  muestran y se ocultan por separado, y un hijo en `display:none` **no es un ítem de grid**: con
  colocación automática, con la insuficiencia cerrada la estenosis se corría a la columna izquierda
  y quedaba debajo del botón de la otra lesión. Medido: escena `solo-estenosis` a 1200 px, el bloque
  se queda en `x=686` (su columna) y no salta a `x=191`.
- **El media query tiene que devolverlas a la columna 1.** `grid-column:2` sobre una grilla de una
  sola columna no se ignora: **crea una segunda columna implícita**, así que sin esa mitad el
  celular seguía mostrando dos columnas con la izquierda vacía.

El bloque de insuficiencia se movió **antes** del de estenosis en el DOM, no sólo en la pantalla:
el orden del código manda en el foco del teclado y en el apilado del celular, y los dos tienen que
coincidir con el orden de los botones.

Orden de campos dentro de cada bloque (pedido de Maicol): **estenosis** → aviso rojo, «Fundamento
del ajuste», grado final, nivel, etiología; **insuficiencia** → etiología, grado IP. El aviso y el
cajón salieron de dentro del `div.fg` del grado y pasaron a ser hermanos suyos; el badge del
auto-grado se queda pegado al `<select>` porque explica de dónde salió ese valor. El `grid-2` que
ponía nivel y etiología en paralelo se quitó: dentro de una columna de media pantalla quedaban de
~110 px con opciones como «Subvalvular (infundibular)» adentro.

### Medido a tres anchos (geometría real, con las dos pastillas prendidas)

| Ancho | Insuficiencia | Estenosis | Scroll horizontal |
|---|---|---|---|
| 1200 px | `x=191 w=483` | `x=686 w=483`, misma `y` | no |
| 390 px | `x=31 w=328` | `x=31`, `y` mayor (apilada debajo) | no |
| 360 px | `x=31 w=298` | `x=31`, `y` mayor | no |

Las cuatro pastillas y sub-botones miden **44 px de alto** a los tres anchos. Los `<select>` miden
29 px de alto, que es el patrón preexistente de toda la app (no lo introduce esta tanda).

## P5 — una sola oración, SÓLO en el estilo estándar

E5b-4 dejó la oración única acotada a «morfología Normal y SIN mediciones» y declaró por qué: meter
los números adentro era «otra decisión de wording del informe firmado, que es de Maicol». **Ésta es
esa decisión, tomada.** La frase «Para estimar las presiones pulmonares … falta la PmAD» se fue del
estándar, y las presiones sólo aparecen si están calculadas (sin PmAD no se publican: 4·V² es el
gradiente, no la presión).

La **morfología abre la oración** y las frases de P5 van adentro (segunda decisión de Maicol, al
cerrar el hueco que su primer formato dejaba): la morfología y la prótesis no desaparecen del
informe firmado.

### Los casos, con el texto exacto medido

Dos correcciones de Maicol sobre su primer formato, ya aplicadas acá: las siglas son **`PAPm` /
`PAPd`** (las de la pantalla del Doppler, no «PmAP/PdAP»), y la lesión va **sin el adjetivo
«pulmonar»** cuando la oración ya abre con «Válvula pulmonar» — con él, el informe firmado decía
«pulmonar» tres veces en una oración, que es lo que TC-139 defendía. Con «Se observa …» el adjetivo
sí va, porque esa oración no tiene sujeto donde apoyar la válvula.

| Escena | Informe estándar | EN SUMA |
|---|---|---|
| Sólo IP, sin grado | `Válvula pulmonar de morfología normal, con insuficiencia.` | `IP presente.` |
| Sólo IP con grado | `… con insuficiencia leve.` | `IP leve.` |
| IP + las dos presiones | `… con insuficiencia leve, que permite estimar PAPm de 41 mmHg y PAPd de 21 mmHg.` | `IP leve.` |
| IP con presiones, sin grado | `… con insuficiencia, que permite estimar PAPm de 41 mmHg y PAPd de 21 mmHg.` | `IP presente.` |
| IP con una sola presión | `… con insuficiencia leve, que permite estimar PAPm de 41 mmHg.` | `IP leve.` |
| Velocidad de IP **sin PmAD** | `… con insuficiencia leve.` — sin presiones y sin la frase de la PmAD | `IP leve.` |
| Sólo estenosis | `… con estenosis moderada (Vmax 4 m/s, Gmax 64 mmHg).` | `EP moderada.` |
| IP + estenosis, UNA oración | `… con insuficiencia leve, que permite estimar PAPm de 41 mmHg, y estenosis moderada (Vmax 4 m/s, Gmax 64 mmHg).` | `EP moderada.` / `IP leve.` |
| Ajuste a mano CON nota | `… con estenosis severa (Vmax 4 m/s y Gmax 64 mmHg, pero con ventana suboptima).` | `EP severa.` |
| Ajuste a mano SIN nota | `… con estenosis severa (Vmax 4 m/s y Gmax 64 mmHg).` | `EP severa.` |
| Morfología anormal + estenosis | `Válvula pulmonar con afectación carcinoide y estenosis severa (Vmax 4.5 m/s, Gmax 81 mmHg).` | `EP severa.` |
| Morfología anormal + IP + estenosis | `Válvula pulmonar con afectación carcinoide y insuficiencia leve, que permite estimar PAPm de 41 mmHg, y estenosis severa (Vmax 4.5 m/s, Gmax 81 mmHg).` | `EP severa.` / `IP leve.` |
| Morfología «No especificada» + IP | `Se observa insuficiencia pulmonar leve.` | `IP leve.` |
| Morfología «No especificada» + estenosis | `Se observa estenosis pulmonar moderada (Vmax 4 m/s, Gmax 64 mmHg).` | `EP moderada.` |
| Nivel y etiología de las dos | `… con insuficiencia leve, de etiología HTP (dilatación anular), y estenosis moderada a nivel subvalvular (infundibular), de etiología Carcinoide (Vmax 4 m/s, Gmax 64 mmHg).` | `EP moderada a nivel subvalvular (infundibular).` / `IP leve.` |
| **Prótesis + estenosis** (no se tocó) | `Válvula pulmonar con prótesis mecánica (Vmax 4.5 m/s, Gmax 81 mmHg).` | idéntico a HEAD |
| **Prótesis + IP** (no se tocó) | `Válvula pulmonar con prótesis mecánica.` + `Insuficiencia pulmonar leve (PAP media 41 mmHg).` | `IP leve.` |

**Controles negativos** (la rama nueva NO debe entrar): morfología anormal sin lesión → `Válvula
pulmonar con afectación carcinoide.`; todo normal → `Válvula pulmonar normal.`; `vp_vmax` 1,4 →
`Válvula pulmonar normal (Vmax 1.4 m/s, Gmax 7.8 mmHg).` Los tres salen por el camino de siempre.

### Cuándo sale «Se observa …» y cuándo no (pregunta de Maicol)

«Normal» es la opción 0 de `vp_morf` y es lo que deja «Nuevo estudio», así que el médico que no
toca el select cae siempre en «Válvula pulmonar de morfología normal, con …». «Se observa …» sale
**sólo con `vp_morf = 'No especificada'`**, que son dos caminos:

1. **los estudios legados**, porque `_migrarCamposLegacy` traduce el viejo `vp_morf` que graduaba
   («Estenosis moderada») a `{vp_morf:'No especificada', ep_grado:'Moderada'}` — medido al reabrir
   un blob de contrato viejo: el informe pasa de «Válvula pulmonar con estenosis moderada (Vmax 3.5
   m/s).» a «Se observa estenosis pulmonar moderada (Vmax 3.5 m/s).»;
2. **cuando el médico la elige a mano**, que es el «no la valoré».

O sea: en un estudio nuevo «Se observa …» es la excepción, no la regla.

### Dos detalles de redacción que se invierten solos

- **`_unirEIp` NO se reusa.** Esa helper pone « e » ante vocal, y en el orden nuevo el segundo
  término empieza con «estenosis»: habría escrito «insuficiencia leve **e** estenosis moderada». La
  « e » va ante i-/hi-, no ante e-. En el orden de E5b-4 (estenosis primero) la helper acierta; dada
  vuelta, no. El nexo nuevo es «, y» cuando la cláusula de la IP ya trae una coma adentro y « y »
  cuando no.
- **El paréntesis tiene dos formas** por orden de Maicol: con el grado **ajustado a mano** los dos
  valores se separan con « y » y se les cuelga el motivo («, pero con …»); con el grado automático,
  con coma y sin motivo. La señal de «ajustado a mano» es `sevDiscrepa('ep')`, **la misma** que
  pinta el aviso rojo y abre el cajón, así que el informe y la pantalla no pueden discordar. La nota
  sale de `sevNotaInforme('ep')`, el emisor único del registro (trim, colapso de espacios, corte a
  100), y se le quita el punto final.

### Censo de siglas de presión pulmonar (reportado, NO cambiado)

Las siglas de la oración nueva son **`PAPm`** (media) y **`PAPd`** (diastólica), y **`PmAD`** para
la de aurícula derecha. No es una preferencia: son las que la app YA usa, en la **misma pantalla y
con la misma fórmula** que alimenta esta oración — la fila del Doppler Pulmonar dice literalmente
`PAPm = 4 × Vmax-IP² + PmAD · PAPd = 4 × Vmax-TD-IP² + PmAD` — y también la tarjeta pre-PDF
(`PAPm (IP)` / `PAPd (IP)`). Verificado contra el archivo: **`PmAP` y `PdAP` no existen en ningún
texto emitido** de la app. Confirmado en Chrome: la oración sale con `PAPm` y `PAPd`.

Dónde las MISMAS presiones se nombran de otra forma. Todo esto queda **sin tocar**:

| Superficie | Cómo las nombra hoy | Nota |
|---|---|---|
| **Informe, estilos conciso y narrativo** (bloque 10b de la IP) | `PAP media 41 mmHg` · `PAP diastólica 21 mmHg`, **en palabras** | Es la divergencia real dentro del informe firmado: el estándar dice «PAPm de 41 mmHg» y los otros dos «PAP media 41 mmHg». No se tocó por la orden de no cambiar los otros estilos. |
| **Pantalla del Doppler Pulmonar** | la **fórmula** usa `PAPm`/`PAPd`; las **etiquetas** de los dos renglones de resultado dicen `PAP media (IP proto-diast.)` / `PAP diastólica (IP tele-diast.)` | La propia pantalla usa las dos formas: sigla en la fórmula, palabras en las etiquetas. |
| **Tarjeta pre-PDF / tabla del PDF** | conviven `PAP media` (del campo manual `pap_med`) y `PAPm (IP)` / `PAPd (IP)` (las calculadas) | **No es un nombre inconsistente: son dos magnitudes distintas** —una tipeada, otra derivada de la IP—, pero el lector las ve juntas en la misma tabla. |
| **Excel** | la columna es `PAP media (mmHg)` → el campo manual `pap_med` | ⚠️ **Las `PAPm`/`PAPd` derivadas de la IP NO tienen columna propia**, y tampoco hay columna para `ip_vmax`/`ip_vtd`: lo único exportado es `PmAD (mmHg)`, `IP grado` e `IP etiología`. O sea que **los números que la oración publica no viajan al Excel** ni como resultado ni como insumo. Es deuda previa a esta tanda, no la introduce. |
| **PSAP** | `PSAP estimada … mmHg`, y en pantalla `… (PmAD X mmHg)` | Sigla propia y coherente en informe, PDF, PPT y Excel. |
| **PmAD** | `PmAD` en pantalla, PDF, PPT y Excel; el informe dice «permite estimar una PmAD de X mmHg» (línea de la VCI) | Coincide con la nomenclatura pedida. Coherente en todas las superficies. |
| **`PAPs`** (sistólica) | aparece en los módulos de **congénitas** (CIA, CIV, ductus) y en el de Swan-Ganz | Otra sigla para otra presión, en otros módulos. Fuera del alcance de la pulmonar. |

### Lo acotado y lo reportado, SIN cambiar

1. **Sólo el estilo estándar.** La condición es la misma que usa `estiloPick` para elegir su segundo
   argumento (todo lo que no es conciso ni narrativo), no `=== 'estandar'`: si se agrega un cuarto
   estilo que cae en ese slot, el texto y el emisor no se separan en silencio.
2. **El conciso y el narrativo quedan como estaban, byte por byte** (orden expresa), y el A/B lo
   prueba con 0 diferencias en 35 escenas. Divergencias vivas declaradas: siguen diciendo «PAP media
   / PAP diastólica» donde el estándar dice «PAPm / PAPd»; siguen emitiendo **dos** oraciones con
   EP + IP; y la frase «falta la PmAD» **sigue viva en los dos**. Sólo se fue del estándar.
3. **No hay estilo «CC».** El informe tiene exactamente tres estilos (`conciso`, `estandar`,
   `narrativo`). Los nombres `cc*` del emisor (`ccMarcarParrafo`) son la contabilidad del párrafo
   del EN SUMA, y el subtab «CC / Genéticas» es del Laboratorio: ninguno es un estilo de informe.
4. **El decimal del informe es el PUNTO** («Vmax 4.5 m/s», «AVm 1.20 cm²»), mientras la pantalla y
   la documentación usan coma. No se tocó (orden expresa); queda reportado: el informe firmado no
   mezcla las dos dentro de una misma cifra, pero sí difiere del resto de la interfaz.
5. **El nivel y la etiología se conservan** en la oración nueva. No estaban en el formato que pidió
   Maicol; quitarlos habría borrado del informe firmado dos campos que la pantalla pide y el médico
   cargó. Queda reportado por si el formato los quería afuera.

## P6 — el EN SUMA no se modificó, y se verificó caso por caso

«EP severa», «EP moderada», «IP presente» siguen idénticos. En **ninguno** de los casos de la tabla
el EN SUMA contradice al informe: donde el cuerpo afirma una lesión, la conclusión la lleva con su
sigla; donde el cuerpo no afirma nada, dice «Estudio sin alteraciones…». El bug histórico —informe
que afirmaba la IP y EN SUMA que decía «sin alteraciones»— **no reaparece**: `suma.push` vive fuera
del guard `_ipEnOracion`, así que mover la frase a la oración única no se lleva la sigla con ella.
La fuga de P1 era, de hecho, una forma nueva de esa misma contradicción (conclusión que afirma sobre
un estudio vacío) y quedó cerrada.

## Cobertura automática y mutaciones

Los cinco rojos que esta tanda produjo en la suite eran **tests que afirmaban el texto viejo**,
ninguno una falla funcional. Al quitar el adjetivo repetido, **cuatro volvieron a verde solos**
(TC-51, TC-137, TC-139, TC-408): sus aserciones —`'con estenosis leve'`,
`'con insuficiencia severa'`, `'con estenosis'`, «sin repetir *Válvula pulmonar*»— vuelven a
cumplirse con el wording final. El único que hubo que reescribir fue **TC-412**, porque cambió el
orden (la insuficiencia va primero) y con él el nexo: « e » va ante i-/hi-, así que con «estenosis»
como segundo término lo correcto es « y ».

Dos casos **nuevos**, porque las dos piezas centrales de la tanda no tenían ninguna cobertura y
«un arreglo sin caso se deshace sin que nadie se entere»:

- **TC-413 — la fuga de `localStorage`.** Las dos direcciones (clave en `'0'` que mata el
  auto-prendido, clave en `'1'` que afirma una valvulopatía sobre un estudio vacío), el censo de las
  ocho claves tras «Nuevo estudio», y el **control negativo de la mitral**, que distingue «se
  arregló la pulmonar» de «el barrido dejó de correr».
- **TC-414 — la oración única del estándar.** Las siete escenas de wording con las mediciones
  adentro, y como **control negativo el conciso y el narrativo**, que tienen que seguir diciendo
  «PAP media» y emitiendo dos oraciones. Sin esa mitad el caso no distingue «se cambió el estándar»
  de «se cambiaron los tres estilos».

`scripts/_mut_pulmo.py` — **8/8 mutaciones MUERTAS**, con la línea base verificada verde antes del
barrido, la exigencia de `RESULTADO` en la salida y el md5 del archivo vivo igual antes y después
(el barrido corre sobre una copia en `/tmp`, nunca sobre `index.html`). Las mutaciones revierten: la
tupla de `limpiarCampos`, el adjetivo, las siglas `PAPm/PAPd`, el orden de las lesiones, el cableado
de la rama del estándar, el motivo del ajuste, el separador del paréntesis y la guarda de la PmAD.

**ME9 queda declarada SIN cobertura:** cambiar `grid-column: 2` por auto-placement (el defecto de
maquetación que P4 viene a evitar) no pone ningún caso en rojo, porque la suite no mide geometría.
Eso lo cubre hoy sólo la sonda `_probe_pulmo.mjs`, que no corre en el suite. Se dice en vez de
contarla como muerta.

## Verificación al cierre

- **Suite clínica: 425/429.** Los 4 rojos son los conocidos y ninguno es de esta tanda: **TC-223**
  (fecha, documentado), **TC-376**, **TC-390** y **TC-406** (los tres ⚠ que E7 dejó abiertos como
  decisión de Maicol). Cero rojos nuevos.
- **Los 17 casos del pendrive Vivid (TC-181…TC-197) están los 17 en VERDE.** `/Volumes/DISK_IMG`
  está montado, así que esta vez **sí son cobertura** —a diferencia de la línea base 406/427, donde
  salían rojos por entorno y «no probaban nada»—. No se arreglaron ni se dejaron de contar: estaban
  rojos porque el pendrive no estaba puesto.
- **Semgrep: 127 / 0 ERROR**, la línea base exacta.
- **Excel: 434 columnas**, 35 escenas. Cambian **dos**: `Informe (texto completo)` (22 escenas, el
  cambio pedido) y `EN SUMA (texto completo)` en **una sola** escena —el estudio vacío de la fuga,
  donde HEAD decía «EP presente. / IP presente.» y ahora dice «Estudio sin alteraciones…»—. Las
  otras 432 idénticas. ⚠️ El primer A/B dio «0 columnas cambian» porque la fila se capturaba
  **antes** de generar el informe y las dos columnas de texto venían vacías **de los dos lados**:
  comparaba nada y lo informaba como idéntico.
- **Conciso y narrativo: 0 diferencias** en las 35 escenas (control negativo del alcance).
- **Estudio guardado y estudio LEGADO: todos los datos idénticos a HEAD** al reabrir —pastillas,
  grados, Vmax, Gmax, PmAD y sub-botones—, EN SUMA idéntico, y sólo cambia la oración del estándar.
  No se migra ni se reescribe nada: el diff no toca el guardado, la carga ni la migración.
- **Móvil: 2 ALTA a 360 y 390 px, las dos `#caso_interes`**, que es la línea base preexistente que
  E5 ya documentó. **Cero** hallazgos sobre cualquier nodo de la pulmonar.

### Cuatro veces que la instrumentación mintió en esta tanda

Queda escrito porque todas iban en la dirección de dar un verde falso:

1. **`pgrep -f 'node scripts/test_clinico'` se matcheaba a sí mismo** (el patrón está en la línea de
   comandos del propio `until`), así que el contador nunca bajaba a cero y la espera no terminaba
   nunca. Se arregló con el truco del corchete (`test_clinico[.]mjs`).
2. **El grep del total usaba `^RESULTADO`** y la suite imprime la línea con dos espacios delante:
   la corrida «no dijo nada» y por un rato pareció que no había total.
3. **La escena de guardar+reabrir comparó un estudio vacío contra otro vacío** y lo informó como
   «igual a HEAD». Tres causas en fila: `guardarInforme` devuelve `false` y deja el guardado real al
   callback de la tarjeta de severidades; `window.valvSevConfirmada = true` no sirve porque la
   variable es un `let` de nivel superior (binding léxico); y `cargarEstudioPorId` busca por
   **`estudioId`**, no por `id`. Con las tres sin resolver, la escena medía cero.
4. **El filtro de líneas del caso nuevo buscaba «pulmonar» y `^VP`**, y el conciso escribe la IP en
   sigla («IP leve (PAP media 41 mmHg).»): el control negativo medía **una** oración donde hay dos.
   Es exactamente la trampa del analizador que `valvulas-botones.md` §7 ya documenta.

Y una que colgó la corrida sin mentir: una promesa esperando un callback que nunca llega, con
`awaitPromise`, deja la llamada de CDP colgada **para siempre** — 30 minutos y siete Chrome
zombies. Toda espera de la sonda lleva timeout desde entonces.
