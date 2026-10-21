# Mapa — la VÁLVULA AÓRTICA BICÚSPIDE (sección VAB de Congénitas)

Mapa de la tanda **Y3d** (2026-10-19), commits 4 a 10. Lo de antes —los campos, los cortes de
`vabConclusion`, la Tabla 68 de la ESC 2024 y el fenotipo aortopático— sigue donde estaba:
`docs/mapa/congenitas-otros.md` y `docs/fuentes/FUENTES.md` → `### escAorta2024`.

**Ningún corte, ningún operador y ninguna cuenta de `vabConclusion` se movieron en esta tanda.**
Lo que cambió es la **disposición**, el **control** de los seis factores de riesgo, el **dibujo**,
la **morfología que sigue al tipo**, **una sola** descripción en el informe y el **PDF**.

---

## 1 · Las piezas, por nombre

| Pieza | Qué es | Dónde |
|---|---|---|
| `#sacc-cc-vab` | la tarjeta de la sección, con su `.sacc-body` plegable | marcado |
| `vabSync()` | el **embudo**: repinta la sección entera. Está en `RECALC_MODULOS` y al final de `limpiarCampos` | — |
| `VAB_FR_CHK` | reparto **casilla → campo oculto** de los seis factores de riesgo | — |
| `vabFrChk(cb)` / `vabFrChkSync()` | las **dos direcciones** del factor de riesgo: el gesto y la reposición | — |
| `vabFactores(src)` | cuenta los factores **marcados** y arma su texto | — |
| `vabGeom(fusion, calc, sym)` | la **geometría pura** del dibujo: devuelve números y cadenas de `path`, no toca el DOM | — |
| `VAB_DIB_FUSION` | tipo de la lista → fusión del dibujo. **Sólo cuatro entradas** | — |
| `VAB_DIB_HIT` | los **tres puntos sensibles** para elegir la fusión tocando el rafe | — |
| `vabDibConstruir()` / `vabDibujar()` | crean los nodos **una vez** (`createElementNS`) y después sólo les cambian atributos | — |
| `vabDibClic(k)` | el toque sobre el rafe: escribe la **lista** y despacha su `change` | — |
| `vabMorfSeguir()` / `vabMorfAviso()` / `vabTipoCambio()` | la morfología de Válvulas siguiendo al tipo, y el aviso de la vuelta atrás | — |
| `vabPdfOn()` / `vabPdfSync()` / `vabIncluirPDF()` | el botón «Incluir en el PDF», con `#vab_pdf` como campo del estudio | — |
| `vabDataURL()` / `vabPintarCanvas(ctx,k)` | el dibujo rasterizado para el papel, desde la **misma** `vabGeom` | — |
| `vabPdfFilas()` | la tabla de características del PDF. Devuelve **`null`** si no hay nada de la válvula que decir | — |
| `vabFraseValv(src)` / `VAB_INF_FENO` / `VAB_SUMA_FENO` / `VAB_INF_SENOS` / `VAB_INF_RAFE` | la **única** descripción de la válvula, y su forma corta para el EN SUMA | — |
| `_vabFenoCola()` | el fenotipo aortopático, que se pega a la frase de la **aorta** | — |
| `#vab-coa-nota` | el recordatorio de la coartación, **sólo en pantalla** | marcado |

---

## 2 · La disposición (Y3d4)

Dos filas flex. La primera: una columna `flex:1 1 420px` con **tres** `grid-3`
—VÁLVULA / FUNCIÓN / AORTA— y, a su derecha, `#vab-dibujo-host` con `flex:0 0 240px`. La segunda:
el contexto quirúrgico en una columna y `#vab-fr-grid` con los seis factores en **dos columnas de
tres**.

**Casi todo el texto largo bajó a SEIS tarjetas ⓘ**, con el mecanismo que ya existía
(`VINFO` + `vInfoClic` + `#vinfo-card`, de las tandas L, M y Q): `vab-tit`, `vab-valv`, `vab-func`,
`vab-aorta`, `vab-cx` y `vab-friesgo`. El registro pasa de 44 a **50** entradas.

> ⚠️ **LA CLAVE DE LA SEXTA ES `vab-friesgo` Y NO `vab-fr`**, a propósito: `vab-fr` es el **id del
> span** que publica el conteo de factores, y una clave que se lee igual que un id es la próxima
> confusión de quien grepee.

> ⚠️ **`VINFO` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`.** `window.VINFO` da
> `undefined` y el identificador **pelado** sí se ve. Es la trampa de `ECO_AYUDA`, y en esta tanda
> puso **una condición de TC-504 en rojo** sobre un árbol perfecto. Lo mismo con
> `_noEsDelEstudio`, `_labExcelRow` y `toggleEteSeccion`.

Lo que queda **visible** es el recordatorio corto de la coartación y los seis ⓘ.

---

## 3 · Los factores de riesgo: de selector de tres opciones a CASILLA (Y3d5)

El dato **no cambió de lugar**: sigue viviendo en los seis `vab_fr_*`, que son los que viajan con
el estudio y los que el Excel exporta. Lo que cambió es el control.

| Lo que la casilla escribe | Valor en el campo |
|---|---|
| marcada | `'si'` |
| sin marcar | `''` (cadena vacía) |

> ⚠️ **SIN MARCAR ESCRIBE `''` Y NO `'no'`.** Una casilla no distingue «no» de «no consta», así
> que escribir `'no'` sería **inventar una respuesta** que el control no pregunta.

**Qué escribe el Excel, medido** (las columnas no cambian y son las mismas seis): el exportador
publica el **token crudo** del campo, así que un estudio anterior sigue leyéndose `si`, `no` o
`no_eval`, y uno nuevo publica `si` o vacío. **Cero columnas nuevas.**

**Migración de un estudio guardado, medida por los cuatro valores posibles:**

| Valor guardado | La casilla reabre |
|---|---|
| `si` | **marcada** |
| `no` | sin marcar |
| `no_eval` | sin marcar |
| vacío | sin marcar |

**No se migra nada**: el valor guardado se conserva tal cual, y lo que cambia es cómo se muestra.

> ⚠️ **`limpiarCampos` NO BARRE `input[type=hidden]`**, y esto lo pagó dos veces en la tanda: un
> factor quedaba en `'si'` después de «Nuevo estudio» y `vabFrChkSync` le volvía a marcar la
> casilla. Los seis se vacían **a mano** al final de `limpiarCampos`, y después se llama a
> `vabSync()`.

> ⚠️ **LAS SEIS CASILLAS NO SON CAMPOS DEL ESTUDIO**: su prefijo es `vabchk-`, con guión **MEDIO**,
> y entra en `_noEsDelEstudio` por el mismo argumento que `hfpep-` y `vauto-`. Si se guardaran,
> habría **dos** copias del mismo hecho y al reabrir podrían contradecirse.

**La conclusión NUNCA afirma «sin factores de riesgo».** Dice «sin factores de riesgo
**marcados**», porque una casilla sin marcar no distingue «lo busqué y no está» de «no lo
pregunté».

---

## 4 · El dibujo (Y3d6)

`vabGeom(fusion, calc, sym)` es **pura**: centro en 120,120, radio 60, y devuelve los tres arcos de
seno, la línea de cierre, el rafe con su color y su opacidad, los cuatro puntos de calcificación y
las tres letras con su opacidad. `vabDibConstruir` crea los nodos **una vez** con
`createElementNS` y `vabDibujar` sólo les cambia atributos.

> ⚠️ **NI UN `innerHTML` CON DATOS CONCATENADOS, Y NI UN `setAttribute('onclick', …)`**: las dos
> cosas las caza Semgrep, y la segunda ya llevó el conteo de 127 a 128 en la tanda Y2 sobre código
> recién escrito.

**La orientación está VERIFICADA**: R arriba, L abajo-derecha, N abajo-izquierda —el eje corto
valvular como lo publica la Figura 7 del consenso de VAB, folio 228—. Lo que **no** se afirma es
lo que no se ve.

| Tipo de la lista | Fusión del dibujo | Qué dibuja |
|---|---|---|
| `fused_rl` | `RL` | comisuras en 210° y 90°, rafe en −30° |
| `fused_rn` | `RN` | comisuras en −30° y 90°, rafe en 210° |
| `fused_ln` | `LN` | comisuras en −30° y 210°, rafe en 90° |
| `dos_senos_ll` | `NONE` | dos senos, **sin rafe y sin letras** |
| `dos_senos_ap` | — | **contorno sin cierre** + rótulo |
| `partial` | — | **contorno sin cierre** + rótulo |
| `no_clasif` | — | **contorno sin cierre** + rótulo |

> ⚠️ **LOS TRES ÚLTIMOS NO SE DIBUJAN INVENTADOS, y el motivo es de cada uno:** `partial` (forme
> fruste) es una trivalva en diástole; `no_clasif` **no tiene forma por definición**; y el de dos
> senos antero-posterior comparte geometría con el latero-lateral **rotada 90°**, que la demo
> aprobada no da. Los tres salen con el contorno y **su rótulo**, para que la ausencia de líneas de
> cierre no se lea como «no se dibujó».

**«Senos asimétricos»** se dibuja como lo que la app ya afirma: los tres radios de arco dejan de
ser iguales (56/56/56 → 53/55/66 según el tipo), o sea un seno más amplio que los otros dos. **No
afirma cuál**: eso la app no lo pregunta.

**El rafe calcificado va en el verde de la paleta** (`--green`: `#3ecf8e` de noche, `#1f9d6c` de
día). ⚠️ **REPORTADO: la app NO tiene un «verde de calcificación»** —`ETE_COLORES` pinta la
calcificación en **GRIS** (`#6b7280`)—, así que este verde **no es ese color** y no se le atribuye.

**Los tres puntos sensibles** son círculos transparentes de radio 24 sobre cada rafe posible, con
`data-vab-hit`. Medido: **44 px de lado efectivo o más** en el celular. «Sin rafe» se elige **sólo
por la lista**, que además es la vía accesible con teclado.

> ⚠️ **EL ACORDEÓN CERRADO RECORTA EL SVG Y SU RECT SIGUE SIENDO DISTINTO DE CERO.** Con la sección
> plegada, `elementFromPoint` sobre el centro de un punto sensible devuelve
> `DIV#sacc-cc-vab`: el clic nunca llega y la lectura informa «el mecanismo no funciona» sobre un
> mecanismo perfecto. La sonda y TC-504 comprueban la **alcanzabilidad del centro del SVG** antes
> de medir, y despejan el aviso legal ANTES de leer el rect.

**El botón «Incluir en el PDF»** alterna, guarda su estado en `#vab_pdf` —un
`input[type=hidden]`, o sea un campo del estudio— y **no tiene columna de Excel**.

> ⚠️ **`_pdfToggleBtnState` SÓLO CAMBIA LA CLASE, NO EL TEXTO.** Esa función la comparten seis
> botones más, así que el texto lo escribe `vabPdfSync` desde `VAB_PDF_TXT` sin tocarla.

> ⚠️ **Y `limpiarCampos` TAMPOCO VACÍA `#vab_pdf`**: se limpia a mano, al lado de `ete_qx_pdf`.

---

## 5 · La morfología sigue al tipo (Y3d7)

`vabTipoCambio()` → `vabMorfSeguir()`, que pone `va_morf` en **«Bicúspide»** y despacha su
`change` para que la cadena de Válvulas corra entera.

> ⚠️ **SÓLO PISA `'Trivalva normal'`**, que es el valor de fábrica. Una morfología que el médico
> eligió —TAVI, prótesis, calcificada— **no se pisa**: eso sería borrar una afirmación suya en
> silencio.

> ⚠️ **`vabMorfSeguir` NO SE LLAMA DESDE `vabSync`**, y es lo que deja volver atrás. `vabSync`
> corre en **cada** gesto de la sección y desde `RECALC_MODULOS`: con el seguimiento adentro,
> poner la morfología en trivalva a mano con un tipo cargado la devolvía a «Bicúspide» en el gesto
> siguiente. El seguimiento cuelga **sólo** del cambio de TIPO.

**El caso inverso**: volver a «Trivalva normal» con un tipo cargado **conserva el tipo** y lo dice
en `#vab-morf-aviso`. **Ese aviso no llega al informe ni al EN SUMA** (medido).

> ⚠️ **EL AVISO NECESITÓ SU PROPIO OYENTE DE DOCUMENTO** sobre `va_morf`: el `onchange` de ese
> `<select>` va a `valvProtSync` y **no pasa por `vabSync`**, así que sin el oyente el aviso se
> quedaba con el estado del gesto anterior. Es el patrón de `emContFaAvisoSync`.

**Quién más depende de la morfología aórtica, censado antes de tocarla:** `valvProtSync` (muestra y
esconde los bloques de prótesis), `_eaEsProtesisSavr` y `eaProtVeredicto` (la fuga paravalvular y
el veredicto protésico), `_eaDviProtNivel`, el badge del AVA, el cuadro de referencias de la
estenosis aórtica, la frase de la aórtica del informe, el PPM de la Tabla 7 y la estadística de VAB
del Laboratorio. **Por eso se despacha el `change`**: ninguno de esos se enteraría de una
asignación muda.

---

## 6 · UNA sola descripción de la válvula (Y3d8)

`vabFraseValv(src)` arma **una** frase y la pega a la que Válvulas ya escribe donde hoy dice
«trivalva normal…». Lleva el **fenotipo**, el **rafe** y los **senos**; con dos senos verdaderos
dice «con dos velos verdaderos» en vez del rafe.

- **Informe:** «Válvula aórtica bicúspide, fenotipo R-L (fusión derecha-izquierda), con rafe
  calcificado y senos simétricos».
- **EN SUMA:** «VAB fenotipo R-L (rafe calcificado), normofuncionante.» —`VAB_SUMA_FENO` se
  **deriva** de `VAB_INF_FENO` sacándole el paréntesis: una segunda tabla a mano se separa de la
  primera en la próxima tanda que mueva un rótulo.

**Lo que se fue:** «resolver la discrepancia antes de firmar» y el recordatorio de la coartación
con su porcentaje. **La raíz aparece UNA sola vez** (medido con un conteo sobre el informe
generado), y el **fenotipo aortopático** se pega a la frase de la **aorta** por `_vabFenoCola()`,
no a la de la válvula.

**Todo en español y en plural**: «simétricos» / «asimétricos», y ni un «fused type».

> ⚠️ **`_ccSumaAo` SE DECLARA ARRIBA DE `generarInforme`**, no dentro: lo leen el bloque de la
> aorta y el del EN SUMA, que son dos lugares distintos del mismo emisor.

---

## 7 · El PDF (Y3d9)

Con el botón tildado, `generarPDFReal` agrega el dibujo —`vabDataURL()`, 480 × 480, rasterizado
desde la **misma** `vabGeom` con los colores del tema claro— y la tabla de `vabPdfFilas()`.

> ⚠️ **`vabPdfFilas` DEVUELVE `null` SI NO HAY NADA DE LA VÁLVULA QUE DECIR, y esa guarda evita un
> papel FIRMADO equivocado.** El grado de EA y de IAo tiene valor de **fábrica** («Sin estenosis» y
> «Ausente»), así que sin ella una sección **vacía** publicaba una tabla «VÁLVULA AÓRTICA
> BICÚSPIDE» con dos filas que nadie consignó, al lado de un contorno de tres senos sin líneas de
> cierre: se lee como «se evaluó y es normal».

**Las palabras de la tabla son las MISMAS del informe**, leídas de las mismas constantes: un
segundo vocabulario para el papel se separa del de la pantalla en la primera tanda que toque un
rótulo.

Sin el botón tildado, **el PDF no se toca** (medido: mismo número de textos y de figuras).

---

## 8 · El recordatorio de la coartación (Y3d10)

Queda **sólo** en pantalla, en `#vab-coa-nota`, con el texto «Excluir coartación de aorta
asociada» y **sin ningún porcentaje**.

> ⚠️ **EL «hasta el 85 %» SE RETIRÓ Y NO SE REEMPLAZÓ POR OTRO NÚMERO.** La afirmación estaba
> **invertida**: lo que la literatura publica es la prevalencia de VAB **entre los coartados**
> (alta), no la de coartación entre los portadores de VAB (baja). **Censada la biblioteca
> completa, ninguna fuente disponible publica ese porcentaje en ninguno de los dos sentidos**, así
> que no se cita ninguno: un número que no se vio no se escribe.

> ⚠️ **SU ID NO TERMINA EN `-aviso`**, y eso no es cosmético: `limpiarCampos` barre
> `[id$="-aviso"]` con `textContent = ''`, así que como `vab-coa-aviso` el recordatorio
> desaparecía en el primer «Nuevo estudio» y no volvía nunca.

---

## 9 · Cómo medir esta zona

- **Sonda:** `scripts/_probe_y3d.mjs` (CDP, teclas y clics reales, A/B de solo lectura con
  `--file`). Grupos propios: `vab`, `fr`, `dib`, `morf`, `inf`, `pdf`, `coa`, `tarj`.
- **Cobertura:** **TC-504**, 63 condiciones.
- **Antes de medir**: abrir la pestaña Congénitas **y** el `.sacc-body` de `#sacc-cc-vab`; después
  comprobar que el centro del SVG es alcanzable. Sin eso, todo lo del dibujo mide 0 × 0.

---

## 10 · «CÚSPIDES», tres categorías y el dibujo por ÁNGULO — «Y3e3» (2026-10-20)

**Decisión de Maicol.** Cierra `PENDIENTES.md` → **Y3d-5** por una salida que esa entrada no
ofrecía: la simetría **sí** está definida en la fuente, y lo que faltaba era dibujarla como la
fuente la define.

### La fuente, verificada en el original

Traducción del resumen del consenso internacional VAB (*Arch Cardiol Mex* 2024). **Regla de
folio = hoja + 218**, comprobada en el número impreso de **seis** hojas (1, 7, 9, 12, 13 y 21).

- **folio 225, hoja 7:** «Simétrico o asimétrico se refiere al **ángulo de las comisuras de la
  cúspide no fusionada** (Fig. 9).»
- **pie de la Figura 9, folio 230, hoja 12:** «… diferentes ángulos comisurales de la cúspide no
  fusionados (**aplicables a los tres fenotipos de la VAB fusionados**…) que definen la simetría.
  … **simétrica (ángulo 160-180°)** … aproximadamente **170°**. … **asimétrica (ángulo 140-159°)**
  … aproximadamente **150°**. … **muy asimétrica (ángulo 120-139°)** … aproximadamente **130°**.»
- **folio 231, hoja 13:** «siempre que esa única línea de coaptación sea **recta o casi recta**
  (Figs. 8 y 9-simétrica), la reparación de la VAB insuficiente es simple y reproducible».

### Nomenclatura: dónde dice «cúspides» y dónde sigue diciendo «senos»

| superficie | antes | ahora |
|---|---|---|
| rótulo del selector | «Simetría de los senos» | **«Simetría de las cúspides»** |
| informe (3 estilos) | «con senos simétricos» | **«con cúspides simétricas»** |
| fila de la tabla del PDF | `Senos \| simétricos` | **`Cúspides \| simétricas`** |
| hoja del PDF de CC (`ccHoja`) | «Senos simétrica.» | **«Cúspides simétricas.»** |
| «Ver detalle» | «Simetría de los senos» | **«Simetría de las cúspides»** |
| tarjeta ⓘ `vab-valv` | — | suma la definición del ángulo y los tres rangos |

⚠️ **EL TIPO «de dos senos» (2-sinus) NO CAMBIA**: es el nombre del fenotipo en el consenso y no
habla de simetría. Tampoco cambian los **ids**, las **claves** ni el **encabezado del Excel**
(`VAB simetría de senos`): renombrarlo dejaría huérfana la columna de todo backup ya exportado.

⚠️ **LA HOJA DEL PDF ARRASTRABA UN DEFECTO DE CONCORDANCIA**: decía «Senos simétric**a**»,
concordando con el singular de `VAB_SIMETRIA_TXT`, que describe la **simetría** y no las
cúspides. `VAB_HOJA_CUSPIDES` se **deriva** de `VAB_INF_CUSPIDES` capitalizando, así que el día
que una etiqueta cambie las dos se mueven juntas; la entrada de `no_val` es la única propia,
porque el informe no la publica y la hoja sí («Simetría de las cúspides no valorable»).

### Las tres categorías

El selector gana **«Muy asimétrica»** entre la asimétrica y «No valorable», que es el orden de
gravedad creciente de la fuente. **Las dos claves viejas no se tocan**: medido, un estudio
guardado con `simetrica` o `asimetrica` reabre en su **misma opción** (`selectedIndex` 1 y 2), que
es lo que evita el `-1` que `et_grado` ya pagó. **No se migra nada.**

El Excel escribe el token de `LAB_XLS_ETIQ` —«Muy asimétrica»— en las **mismas 440 columnas** y
`LAB_XLS_VOCAB` entiende sus cuatro formas de entrada (clave, con tilde, sin tilde y con guión
bajo); las dos que ya estaban no se tocaron.

### El dibujo por ángulo

`vabGeom(fusion, calc, sym)` recibe ahora la **clave cruda** del selector y resuelve el ángulo
por `VAB_SIM_ANG` = `{ simetrica: 170, asimetrica: 150, muy_asimetrica: 130 }`, los tres **puntos
medios** que el pie de la Figura 9 publica. Sin categoría elegida usa `VAB_SIM_ANG_BASE` = **120**,
que es el ángulo de la geometría aprobada: ahí la app **no afirma ninguna simetría**.

La cúspide no fusionada es la que queda frente al rafe —**N** en la R-L, **L** en la R-N, **R** en
la L-N— y su centro vive en `VAB_DIB_CEN`. Sus dos comisuras se abren **simétricamente** respecto
de ese eje (`cen ∓ ángulo/2`) y el rafe queda del lado opuesto (`cen + 180`), **sin moverse**. La V
de cierre une las dos comisuras pasando por el centro del orificio, así que **el ángulo de su
vértice ES el de la categoría**.

| tipo | sin categoría | simétrica | asimétrica | muy asimétrica |
|---|---|---|---|---|
| `fused_rl` | **120** (= antes) | 170 | 150 | 130 |
| `fused_rn` | **120** (= antes) | 170 | 150 | 130 |
| `fused_ln` | **120** (= antes) | 170,1 | 150,1 | 129,9 |
| `dos_senos_ll` | 180 | **180** | **180** | **180** |

El 0,1 de la L-N es el redondeo a un decimal de las coordenadas; es un esquema, no una medición.

- ⚠️ **EL RADIO DE CADA ARCO SE ESCALA CON SU ÁNGULO, Y LA CONSTANTE SALE DE LA GEOMETRÍA
  APROBADA.** Un arco cuyos extremos están a `R0` del centro necesita un radio de al menos
  `R0·sin(ángulo/2)`; por debajo de eso el motor lo escala solo y el seno sale **semicircular**. La
  geometría de Maicol usa 56 para 120°, o sea `K = 56/(R0·sin 60°) = 1,0778` veces ese mínimo. Con
  esa K un arco de 120° vuelve a dar **56 exacto** y uno de 180° da 64,7 ≈ el 64 que el 2-sinus ya
  usaba. **Medido: el data URL del dibujo que viaja al PDF sale IDÉNTICO al de antes de la tanda
  en los cuatro tipos sin categoría elegida.**
- ⚠️ **LOS TRES TRAMOS SE REPARTEN A `s1`/`s2`/`s3` POR SU ÁNGULO DE INICIO**, normalizado al rango
  `[-150, 210)` que esos tres ids ya ocupaban, **no por su papel**. Así, con el ángulo base, cada
  id recibe exactamente el mismo arco que antes: verificado en los tres tipos de fusión.
- ⚠️ **LA CATEGORÍA NO TOCA EL 2-SINUS, y es de la fuente**: el pie de la Figura 9 la acota a los
  tipos **fusionados**, y un 2-sinus no tiene cúspide no fusionada ni rafe. Hasta el Y3d la opción
  «asimétrica» le cambiaba los radios a `[60,5 · 90 · 0]`; eso se retira, porque afirmaba una
  asimetría que la fuente no define para ese tipo. **Es la única escena cuyo dibujo cambia sin que
  el médico haya elegido una categoría nueva**, y está reportada.
- ⚠️ **EL `d` DEL CIERRE NOMBRA LOS MISMOS DOS PUNTOS EN ORDEN INVERSO** en la R-L y en la L-N sin
  categoría: antes el par venía en el orden en que quedó y ahora sale siempre ascendente. El
  dibujo es el mismo —lo prueba el hash del data URL—, así que un A/B sobre el atributo informa una
  diferencia que el píxel no tiene.

### Nada se tapa ni se sale

Medido en las doce escenas con la categoría más cerrada, que es la que más acerca los brazos de
la V al rafe: **cero elementos fuera del lienzo**, distancia mínima de las letras R/L/N y de los
cuatro puntos de calcificación a los brazos de la V **igual a la de antes (30)**, y los tres
puntos sensibles del rafe en **48 × 48 px** con el dedo. La separación angular del rafe a cada
comisura **sube** al crecer el ángulo (120 → 95 / 105 / 115), así que el riesgo va en la dirección
tranquilizadora. Colores reales y distintos en los dos temas.

### Lo que NO cambia

`vabConclusion` **no lee `vab_simetria` en ninguna de sus ramas** —censado—, así que las **14** de
la ESC 2024 salen igual, y el veredicto es el mismo con las tres categorías y sin ninguna. El EN
SUMA no nombra la simetría, así que no se mueve.

---

## 11 · La sección se actualiza SOLA, la función se DERIVA, la conclusión es ESQUEMÁTICA y hay seis dibujos — «Y3f» (2026-10-20)

### 11.1 · Los campos de solo lectura se actualizan EN VIVO (Y3f3)

Los tres `readonly` de la sección —el grado de EA, el de IAo y los diámetros de la aorta— se
quedaban con el valor del **gesto anterior**: `vabSync` corría sólo desde los controles de la
propia sección, y los orígenes viven en **Válvulas** y en **Datos**. Lo cierra un **oyente de
documento** sobre `input` y `change`, con el patrón de `emContFaAvisoSync`:

```js
const _VAB_ORIGENES = ['ao_sin', 'ao_tub', 'ea_grado', 'ia_grado'];
```

⚠️ **ES UN OYENTE DE DOCUMENTO Y NO CUATRO LÍNEAS EN LOS `onchange` AJENOS**, por la misma razón
que el aviso del Tei del VD: `ea_grado` e `ia_grado` los escribe `valvSev.aplicar` por CÁLCULO, no
sólo por el gesto del médico, y los dos campos de la aorta pasan por `calcAorta`. Pegarle una
llamada a cada `onchange` deja afuera el camino del cálculo, que es el frecuente.

⚠️ **MEDIDO CONTRA HEAD ANTES DE TOCAR NADA: los tres quedaban congelados en 6 de 6 escenas**, con
los orígenes cambiando a la vista.

### 11.2 · La función valvular se DERIVA y su `<select>` se retira (Y3f3)

`vabFuncionDerivada(src)` devuelve `normal` / `estenosis` / `insuficiencia` / `mixta` / `null`
leyendo los grados que Válvulas ya publica. **No declara ningún corte**: es un OR de dos grados.

| EA | IAo | función |
|---|---|---|
| sin estenosis | ausente | `normal` |
| con grado | ausente | `estenosis` |
| sin estenosis | con grado | `insuficiencia` |
| con grado | con grado | `mixta` |
| sin datos de la válvula | sin datos | `null` |

El `<select>` pasa a **`<input type="hidden" id="vab_funcion">`**, que `vabSync` escribe. ⚠️ **TIENE
QUE SER UN OCULTO CON ID Y NO UNA VARIABLE**: la columna del Excel y el estudio guardado lo leen de
`campos`, así que un dato que no viaja habría cambiado el libro.

⚠️ **`limpiarCampos` NO BARRE `input[type=hidden]`** —la trampa que el Y3d5 ya pagó dos veces— así
que `vab_funcion` se limpia **a mano** al final de ese barrido.

⚠️ **EL EXCEL NO GANA NI PIERDE UNA COLUMNA, Y LA CELDA SE DERIVA DEL ESTUDIO ARCHIVADO**:
`_labExcelRow` llama a `vabFuncionDerivada(c)` con la rama `src`, porque ahí no hay formulario que
leer. Es el patrón de `emContFueraBanda(src)` y de `_htp2022Core`. **440 columnas, mismas claves.**

⚠️ **UN ESTUDIO GUARDADO CON `vab_funcion` TIPEADO A MANO REABRE CON LO QUE SUS GRADOS DICEN**, que
puede no ser lo que su médico eligió. **No se migra nada**: lo que se reescribe es la **celda
derivada**, no el registro. Está declarado en `PENDIENTES.md`.

### 11.3 · La conclusión: ESQUEMÁTICA en la pestaña, el texto completo en EVIDENCIA (Y3f4)

`vabResumenPintar()` arma **cuatro líneas cortas** y las escribe **por nodos**, nunca con
`innerHTML` concatenando datos —las dos las caza Semgrep—:

```
Fenotipo · Rafe · Cúspides · Aorta
```

**`vabConclusion` NO SE TOCÓ**: su texto completo se publica **igual**, en la fila «Según la guía»
de la sección nueva del panel de Evidencia (`_indVABConcl`). Lo único que cambia es **dónde**.

⚠️ **LA FILA LLEVA SU CORCHETE (`refs:['esc2024ao']`), Y NO ES DECORACIÓN.** El contrato del panel
es que toda sección publique una cita numerada, y **TC-322 lo exige sobre `IND_SECS` entera**: una
fila con una afirmación de guía y sin cita es justo lo que ese caso persigue.

⚠️ **Y EL TÍTULO DE LA SECCIÓN LLEVA «— conclusión».** `IND_SECS` se recorre buscando la sección
por el **PREFIJO** de su título, así que «Válvula aórtica bicúspide» a secas es prefijo de
«Válvula aórtica bicúspide — aorta ascendente»: las dos matchean la misma clave, la primera se
lleva las dos comprobaciones y **la otra queda sin probar**. Lo destapó TC-322 en la suite
completa, no la lectura, y es el mismo argumento por el que las claves de este archivo no se
repiten.

### 11.4 · Los nombres en español y la hoja del PDF que se retira (Y3f6)

«fused type» pasa a español **en todo rótulo visible**; **el Excel conserva el texto viejo** y el
importador entiende las **dos** formas, por el mecanismo de `LAB_XLS_LISTAS_LEGADO`: para una
columna de opción, un valor desconocido descarta la **FILA ENTERA**, así que renombrar el valor
dejaría sin importar todo backup ya exportado.

Y la **hoja «Estudio avanzado – Cardiopatías congénitas» del PDF se retira SÓLO para la VAB**: la
sección publica su propia tabla, así que la hoja duplicaba lo que el papel ya dice. Lo decide
`ccHoja`/`ccEnInforme`, y **las otras cardiopatías congénitas la conservan** — medido.

### 11.5 · Los SEIS dibujos (Y3f7)

`VAB_DIB_FUSION` pasa de tres entradas a **seis**:

```js
{ fused_rl:'RL', fused_rn:'RN', fused_ln:'LN',
  dos_senos_ll:'LL', dos_senos_ap:'AP', partial:'PART' }
```

| tipo | qué dibuja | ángulo |
|---|---|---|
| `fused_rl` / `fused_rn` / `fused_ln` | tres senos, rafe en el par fusionado, **arco del ángulo** | 170 / 150 / 130, o 120 sin categoría |
| `dos_senos_ll` | dos senos, comisuras **arriba y abajo** (cúspides lateral a lateral) | 180 fijo |
| `dos_senos_ap` | dos senos, comisuras **a los costados** (cúspides adelante y atrás) | 180 fijo |
| `partial` | tres senos con **minirafé** derecha-izquierda y apertura triangular | sin arco |

⚠️ **EL LÁTERO-LATERAL ESTABA INVERTIDO Y SE CORRIGIÓ.** Ver `docs/fuentes/FUENTES.md` → «La tanda
Y3f»: el pie de la Figura 11 y el cuerpo del folio 232 describen dónde quedan las **cúspides**, no
las comisuras. **La prueba numérica es el A/B:** el hash del dibujo nuevo de `dos_senos_ap` es
exactamente el que `dos_senos_ll` tenía en HEAD (`-657166111`).

⚠️ **`fusion === 'NONE'` CAE EN `LL` Y NO EN UN CONTORNO VACÍO**, para que una clave desconocida
no deje la sección sin dibujo; y **el arco sólo se dibuja en los tipos fusionados con categoría
elegida** (`!two && !part && !!VAB_SIM_ANG[sym]`), que es lo que el pie de la Figura 9 acota.

`VAB_SIN_RAFE` dice **qué cúspide NO está fusionada** en cada tipo, que es la que el arco mide:

```js
{ fused_rl:'N', fused_rn:'L', fused_ln:'R' }
```

El `aria-label` lo arma `vabDibAria()` y la leyenda del ángulo `vabAngNota()` →
`vabAngNotaPintar()`, en `#vab-ang-nota`. ⚠️ **Es un `<div>` propio y su id NO termina en
`-aviso`**: `limpiarCampos` barre `[id$="-aviso"]` con `textContent = ''`, así que como
`vab-ang-aviso` la leyenda desaparecía en el primer «Nuevo estudio» y no volvía nunca — el defecto
que el `vab-coa-aviso` del Y3d10 ya documenta.

### 11.6 · La animación de la apertura (Y3f8)

Sale de la demo aprobada `docs/3d/demo3_vab_apertura.html`, **sin versionarla**. Piezas:
`VAB_ANIM_MS` (2800), `VAB_ANIM_EPS`, `VAB_ANIM_K`, `_vabAnim`, `vabAnimFrac`, `vabAnimGeom`,
`vabAnimVisible`, `vabAnimPintar`, `_vabAnimCuadro`, `vabAnimVer/Play/Scrub/UI/Apagar`.
Los dos nodos (`#vab-anim-lumen`, `#vab-anim-valvas`) se crean **una vez** con `createElementNS`.

⚠️ **EN REPOSO COINCIDE CON EL DIBUJO ESTÁTICO, Y ES UNA CONDICIÓN MEDIDA, NO UNA INTENCIÓN**: con
la fracción en 0 `vabAnimGeom` devuelve la geometría que `vabGeom` da.

⚠️ **UN `requestAnimationFrame` COLGADO REPINTA SESENTA VECES POR SEGUNDO** con la pestaña abierta
y sin que nada se mueva — es por lo que el panel 3D apaga el suyo al cerrarse. Dos guardas:
`_vabAnimCuadro` **vuelve sin pedir otro cuadro** cuando `!_vabAnim.play`, y `vabAnimVisible`
decide si hay algo que pintar.

⚠️ **`vabAnimVisible` MIRA EL RECT DE CADA ANCESTRO Y NO SU `display`, y eso lo destapó medir.** El
acordeón de la sección se cierra con **`max-height: 0` + `overflow: hidden`**, no con
`display:none`, y **el rect del propio SVG sigue siendo distinto de cero**: con la sección plegada
la sonda contó **54 cuadros en 900 ms**. Hoy se recorre la cadena de ancestros exigiendo
`getBoundingClientRect().height > 0`, y además se mira `document.hidden`.

⚠️ **EL `<input type=range>` DEL SCRUB MIDE 16 px DE ALTO**, así que lleva su
`#vab-anim-scrub { min-height: 44px; }` dentro de `@media (pointer: coarse)` — el piso táctil de la
casa, acotado al dedo para no agrandarlo en escritorio.

**No guarda nada**: ni un campo del estudio, ni una clave de `localStorage`.

### 11.7 · Cómo medir esta zona

```bash
node scripts/_probe_y3f.mjs --solo vabviv,vabcon,tipos,dib,anim
node scripts/test_clinico.mjs --solo TC-506
```

La sonda trae `__Z.irVAB()`, `__Z.vabRo()`, `__Z.vabDib()`, `__Z.animEstado()`,
`__Z.rafCuenta()`, `__Z.cicloVAB()`, `__Z.evid()`, `__Z.tipos()` y `__Z.xlsVab()`.
⚠️ **ABRIR LA SECCIÓN ANTES DE MEDIR**: con el acordeón plegado los nodos existen, el rect del SVG
no es cero y la lectura informa números plausibles sobre una sección que nadie ve.

## La tanda «R» (2026-10-20) — la lesión presente sin grado y dos rótulos

La sección VAB muestra desde hoy **«Estenosis presente» / «Insuficiencia presente»** cuando la
pastilla está prendida y el grado todavía está en el centinela, con un dueño único
(`aoLesionSinGrado`) que replica las cinco compuertas del informe; `vabFuncionDerivada` lo
consulta y **con `src` devuelve siempre `false`**, porque un estudio archivado no tiene
pastillas. Y dos rótulos: `no_clasif` pasa a **«Fusión indeterminada»** y la cúspide a **«no
coronariana»** — ⚠️ en las seis superficies de PANTALLA; **`VAB_TIPO_LBL`, el del Excel, NO se
toca**, porque un valor de opción desconocido descarta la fila entera al reimportar.

→ `docs/mapa/tanda-r-referencias.md` § 1.

---

## La tanda «R2» (21/10/2026) — la sección se repinta con el gesto de la pastilla

**El defecto que el R dejó pasaba los tests y fallaba en la pantalla real:** `vabFuncionDerivada`
estaba bien y el oyente de documento del Y3f3 también, pero **el gesto de la PASTILLA no pasa por
ningún `input` ni `change` de un control de la sección**, así que al prender «estenosis aórtica» la
sección seguía mostrando el estado del gesto anterior.

El arreglo va en el **dueño del gesto**, la cola de `toggleValvPill` —la única puerta por la que
pasa todo cambio de pastilla, censadas sus cinco entradas—, acotado a la aórtica y en `try`.

**Dónde está todo:** `docs/mapa/tanda-r2-correcciones.md`, sección 2 (el censo de las cinco
entradas, por qué la condición no puede llamar a `vabSync` a mano y por qué el estado se captura
dentro de cada escena).
