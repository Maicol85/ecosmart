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

## 10 y 11 · Las CÚSPIDES, los seis dibujos y la animación → archivo propio

Las dos secciones largas de este mapa —**«CÚSPIDES», las tres categorías y el dibujo por ÁNGULO**
(Y3e3) y **la sección en vivo, la función derivada, la conclusión esquemática, los seis dibujos y
la animación** (Y3f)— viven desde la tanda AORTA-2 en
**`docs/mapa/vab-cuspides-dibujos.md`**. Se movieron enteras, sin perder una línea: este mapa
estaba en 33,9 KB y la tanda tenía que escribirle un puntero.

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

---

## Puntero — la tanda «AJ4» (2026-10-23)

- **El aviso de la coartación de esta sección dejó de ser estático.** Con la coartación cargada en
  COAO dice «Coartación de aorta cargada (sección COAO)», en gris; sin ella queda como estaba, en
  ámbar. Y la sección de coartación gana el espejo: «Válvula aórtica bicúspide presente
  (Válvulas)». Un solo pintor para los dos, `vabCoaCruceSync()`.
- **`vabConclusion` dejó de tener el 40 escrito a mano**: su rama `dilatacion_leve` pregunta por
  `aoDilCorte(src)`, así que en una mujer arranca en 36. **La clave no se movió** —el Laboratorio
  cuenta por clave— y no se migra ningún estudio guardado.

Detalle en **`docs/mapa/aj4-raiz-aortica.md`** § 2, § 5 y § 6.

---

## → La TANDA AJUSTES-1 (2026-10-30) — puntero

Vive en **`docs/mapa/aj1-orejuela-pdf-ensuma.md`**, en archivo propio. Lo que esta zona
perdió o ganó:

- **el EN SUMA la nombra**: `vabSumaFrase()` publica «Válvula aórtica bicúspide (fenotipo …)»
  para TODA bicúspide cargada en Válvulas —no sólo con la sección integrada—, unida a la línea
  de la aorta cuando hay dilatación. `ccSumaLinea('vab')` deja de describir y conserva su `dx`.
- **el bloque del PDF cambia de maqueta**: el dibujo baja de 70 a 48 mm y va a la izquierda, con
  `vabPdfFilas()` —los MISMOS textos— a su derecha y a la misma altura. El bloque pasa de
  **100,6 a 53,6 mm**.


## → La TANDA AORTA-2 (2026-10-30) — puntero

**Las seis casillas de factores de riesgo salieron de esta pantalla.** Los nueve factores de la
Tabla 68 se preguntan ahora **sólo en la Evidencia**, con **tres estados** —sí, no, sin dato—, y
«sin dato» dejó de contar como «no». El rótulo y su globo se quedan, con una línea que dice dónde
se contestan. Los seis campos guardados siguen vivos, vacíos y ocultos: su clave no se borra.

La sección 3 de este mapa —«de selector de tres opciones a CASILLA»— describe el mecanismo
anterior y **se conserva como historia**: lo que hoy está vigente es el de la tanda AORTA-2.

→ **`docs/mapa/ao2-segmentos-bicuspide.md`** § 4
