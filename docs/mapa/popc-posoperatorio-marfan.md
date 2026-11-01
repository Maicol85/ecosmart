# POP-C — el posoperatorio terminado, lo que quedó de Marfan y el dibujo al PDF

**Tanda del 2026-11-02.** Once commits: cuatro de clínico y defectos, cinco del dibujo, uno del
PDF y el de cobertura. Lo que cada uno movió, con su dueño y su medición.

> Este mapa **no guarda números de línea** a propósito: la línea cambia en cada edición, el
> nombre de la función no.

---

## 1 · El selector del tipo de válvula operada (commit 1)

**El defecto, en una línea: el sentido Válvulas → posoperatorio no funcionaba en ninguna de las
cuatro válvulas** — ni al poner la prótesis, ni al cambiarla, ni al sacarla. El médico lo
reportó al retirar una prótesis tricuspídea y ver que el selector seguía diciendo «Prótesis
mecánica».

| pieza | quién es |
|---|---|
| el dueño del tipo | `va_morf`, `vm_morf`, `vt_morf`, `vp_morf`, en **Válvulas** |
| el espejo | los cuatro `pop-esp-v*`, que **no** son campos del estudio (prefijo `pop-esp-`) |
| quién los pinta | `popCxVSync` |
| quién escribe hacia Válvulas | `popCxVGesto`, colgado del `onchange` del selector |
| quién lee para el papel | `popVEstado` → `popCxValvTxt` |

**LA CAUSA:** `popCxVSync` tenía **un solo llamador**, `popSync`, y `ESPEJOS_VIVOS` excluye a
`popSync` a propósito porque escribe campos del estudio. Así que ningún gesto fuera del
posoperatorio repintaba esos cuatro selectores.

**EL ARREGLO:** `popCxVSync` entra en `ESPEJOS_VIVOS`. Cumple su regla —sólo pinta— y es
idempotente, así que no pelea con `popCxVGesto`.

⚠️ **LOS OTROS CINCO ESPEJOS `pop-esp-` NO TIENEN EL DEFECTO**, censado: a `popHemoSync` (la
frecuencia, la PAS, la PAM y la PAD) y a `popPocusSync` (el derrame pericárdico) ya los corre el
barrido, y el comentario del espejo del pericardio lo declara desde POP-A.

⚠️ **EL PAPEL YA LEÍA EL DUEÑO Y NO EL SELECTOR**, verificado: con la prótesis retirada en
Válvulas, el informe, el EN SUMA y el PDF dicen «sin tipo consignado».

---

## 2 · La línea de Marfan y el Z de la raíz (commit 2)

### 2a · La línea del informe dice sólo lo positivo

**La regla, en una línea:** se escribe lo que **está**; de lo que no está, **sólo** la pareja
ectopia + historia familiar, y **sólo** cuando las dos son «No».

| escena | antes | ahora |
|---|---|---|
| los cuatro en «No» | «Ectopia lentis ausente, historia familiar ausente, variante de FBN1 causal ausente, variante de FBN1 con asociación conocida a dilatación o disección aórtica ausente.» | «Sin ectopia lentis ni historia familiar.» |
| los cuatro en «Sí» | los cuatro con «presente» | los dos de FBN1 sin «presente» y con el rótulo corto |
| ectopia Sí, historia familiar No | «Ectopia lentis presente, historia familiar ausente.» | «Ectopia lentis presente.» |
| todo en «—» | nada | nada (sin cambio) |

Las dos variantes de FBN1 en «No» **no se escriben nunca**. El EN SUMA no cambia: sólo publica
el score sistémico.

### 2b · El Z de la raíz se calcula

**LA FUENTE ESTÁ DESDE EL 2026-11-01** y eso cierra `MF2-a`: Devereux RB y cols., *Am J Cardiol*
2012;110(8):1189-94, en `06_Aorta`. MARFAN-2 la había censado por contenido y **no estaba**.

⚠️ **EL FOLIO DE REVISTA NO ES DERIVABLE Y SE DECLARA:** el PDF es el **manuscrito de autor de
NIH-PA**, de catorce hojas, cuyo pie dice «Devereux et al. Page N» — la numeración del
manuscrito, no la de la revista, que son seis páginas. Se cita **por hoja con su pie impreso**.

| qué | dónde, leído en imagen |
|---|---|
| población: 15 años o más (1.207 individuos) | título y abstract, hoja 1 |
| técnica: **en diástole, por convención de borde de ataque** | hoja 3 («Page 3») |
| superficie corporal **DuBois**: `0.007184 × H^0.725 × W^0.425` | hoja 2 («Page 2») |
| la ecuación | hoja 1 (abstract) y hoja 13 (**Tabla 1**), que **coinciden** |
| el desvío, «upon which calculation of z-scores is based» | hoja 4 («Page 4») |

```
predicho (cm) = 2.423 + 0.090 × (edad/10) + 0.461 × BSA_DuBois − 0.267 × sexo   [1=M, 2=F]
Z = (observado_cm − predicho) / 0.261
```

El abstract la escribe por año (0.009) y la Tabla 1 por década (0.090): **es el mismo número**.

| pieza | quién es |
|---|---|
| el cálculo | `mfsZCalc(src)` → `{ z, falta, menor, bsa, pred }` |
| la superficie corporal del método | `mfsZBsaDuBois`, **dentro** de la función del Z |
| el campo manual | `mfs_z_raiz`, campo guardado desde MARFAN-2 |
| el **Z efectivo**, que leen las reglas 1, 2, 3 y 7 | `mfsZ`: manual → calculado → `null` |
| la fila de pantalla | `mfsZCalcPintar`, llamada por `mfsCalc` y por `marfanSync` |
| la **única** puerta al campo | `mfsZUsarCalculado`, colgada del botón |
| los cortes | `MFS_Z_EDAD_MIN` = 15 · `MFS_Z_SEE` = 0.261 |

⚠️ **LA SUPERFICIE CORPORAL SE CALCULA ADENTRO Y NO CON `getBSA`:** la de la app es **Mosteller**
y el artículo normativo es **DuBois**. Con 70 kg y 170 cm, Mosteller da 1.8181 y DuBois 1.8117.
La de la app **no se toca**: la usan el índice cardíaco, la masa y diez cálculos más.

⚠️ **NADA SE ESCRIBE SOLO.** `mfsZCalcPintar` sólo pinta. Es la regla que el D-9, el D-10 y el
D-11 pagaron tres veces.

⚠️ **POR DEBAJO DE 15 AÑOS NO SE CALCULA** y se dice; si falta un insumo, se **nombra**. La
salvedad de la técnica va **en la fila**, no en el globo: la app no registra con qué convención
se midió «Aorta sinusal».

**Las tres cuentas a mano, verificadas contra la app con diferencia menor que 1e-9:**

| caso | BSA | predicho | Z |
|---|---|---|---|
| hombre 40 años, 70 kg, 170 cm, 38 mm | 1.8097 | 3.3503 | **+1.7231** |
| mujer 55 años, 62 kg, 160 cm, 36 mm | 1.6448 | 3.1423 | **+1.7538** |
| borde, 15 años, 55 kg, 165 cm, 30 mm | 1.5984 | 3.0279 | **−0.1068** |

---

## 3 · La hemodinámica del posoperatorio (commit 3)

**La fuente:** Consenso de Shock Cardiogénico de la **SAC 2024** (*Rev Argent Cardiol* 2024;92
Supl. 3), sección **6.14 «Síndrome de bajo gasto posoperatorio»**. Archivado en
`19_Pulmon_POCUS/COMPLETO-B-52.pdf`, o sea **en una carpeta que no es la suya**; no se movió.
**Regla de folio: folio = hoja − 8**, comprobada en el encabezado impreso de tres hojas.

| qué | dónde | leído en imagen |
|---|---|---|
| los cinco criterios de bajo gasto | hoja 91 = folio 83 | PAS < 90 · diuresis < 0,5 mL/kg/h · lactato > 2 · SvO₂ < 65 % · **IC < 2,2**, estricto |
| las presiones de llenado | hoja 92 = folio 84 | las estáticas son «poco útil» como único elemento; se prefieren las dinámicas |
| el ETE ante sospecha | hoja 93 = folio 85 | «en todo paciente con sospecha de taponamiento posoperatorio», **I · B** |

### 3a · El corte de bajo gasto es estricto, y sólo en el posoperatorio

`POP_IC_BAJO_MAX` = 2.2 con `<` estricto, y `_popIcBanda` es su dueño único. Lo leen los cuatro
lugares que rotulan el índice: el eco, el Swan, el PiCCO y la conclusión.

⚠️ **DIVERGE DE `_icBanda` A PROPÓSITO.** Esa función usa `<= 2.2` por la decisión del médico del
**21/10/2026**, que el C1 aplicó a la cápsula «Perfil hemodinámico» y al Forrester. Esta orden
cambia el corte **sólo** en el posoperatorio y prohíbe tocar otras secciones, así que la
divergencia **se declara** — el mismo patrón con que `DPT_VCI_PLETORA_MM` (20, ESC 2025) convive
con el `vciD > 21` del HTP (ESC/ERS 2022).

⚠️ **SÓLO ES OBSERVABLE CON EL PiCCO:** las otras tres fuentes dividen un gasto por la superficie
corporal y el 2,2 exacto es prácticamente inalcanzable; el PiCCO lo trae tipeado.

### 3b · La precarga muestra el valor y no lo juzga

Salió la banda de 12 a 18 —el verde, el amarillo, «en rango», «sugiere hipovolemia» y «sugiere
congestión»— y la palabra «adecuada». La pregunta pasa a **«¿Presión capilar pulmonar?»** y la
respuesta trae el valor, su origen y la salvedad.

⚠️ **LA BANDA NO TENÍA FUENTE Y LA APP YA LO DECLARABA** en su fila de Referencias.
⚠️ **`POP_PCP_PRECARGA_MIN` NO SE BORRA:** lo lee el patrón de hipovolemia, que 3d protege.

### 3c · El pericardio lista sus signos

La fila enumera `dptEstado().signos` —su dueño único— con el veredicto del médico primero cuando
existe. **El patrón «Taponamiento» no se toca** (3d lo protege).

### 3d · Los dos rótulos

El de «Criterio de EcoSmart» del patrón **ya existía** (premisa de la orden parcialmente falsa).
El que faltaba es el del ventrículo derecho: **«cortes de la cápsula de TEP»**, porque el TAPSE
de 17 mm y el VD/VI de 0,9 son `UMBRAL_TAPSE_NORMAL` y `tepVdViDilatado`, de la AHA/ACC 2026.
**Ningún corte se movió.**

### ⚠️ El corte de 21 mm del pericardio NO EXISTE: parado y reportado

La orden pide alinearlo a 20 mm «sólo si el 21 es el corte de gravedad del derrame». Censado:
`DPT_VCI_PLETORA_MM` **ya vale 20** (Tabla 17, ESC 2025) y `DPT_TAM` ya usa 20 (severo >20,
moderado 10-20, leve <10). Los **únicos** 21 mm de la aplicación son la categoría C de la
probabilidad de HTP (ESC/ERS 2022, Tabla 10, folio 28), que es **otra guía y otro módulo**, y el
código ya declara esa divergencia. **No había nada que alinear.**

---

## 4 · Integrar con cualquier dato, y los avisos sin color (commit 4)

### 4a · «Integrar al informe» queda habilitado con cualquier dato

`suficiente` valía `!!icB || tapo`. Hoy es `!!icB || tapo || _popHayAlgunDato()`. **Cierra
POPB-a.** Sin índice el patrón sigue diciendo «Datos insuficientes para clasificar».

⚠️ **EL PREDICADO NO ES UNA LISTA DE CAMPOS:** pregunta por los controles con prefijo
`pop_`/`pop-` comparando contra su **valor por omisión**. Los nueve espejos `pop-esp-` quedan
fuera. Y un `<select>` no tiene `defaultValue`: su omisión es la opción con `defaultSelected`.

| escena | antes | ahora |
|---|---|---|
| peso, talla y Swan | integra | igual |
| Swan **sin** peso ni talla | **deshabilitado**, «falta el PESO y la TALLA» | habilitado, **integra** |
| nada | deshabilitado, con su motivo | igual |

### 4b · Los tres usos globales de `var(--amber)`

`--amber` y `--amber-pale` viven dentro de `.amilo-root` y de `#sp-root`, **no** en el `:root`.

| regla | antes, fuera de `.amilo-root` | ahora |
|---|---|---|
| `.am-stale` color | `rgb(232,236,244)` (el texto **heredado**) | `rgb(245,158,66)` |
| `.am-stale` fondo | `rgba(0,0,0,0)` (**sin** pastel) | `rgba(245,158,66,0.15)` |
| `.am-stale` borde | `rgb(232,236,244)` | `rgb(245,158,66)` |
| `.btn-integrar.revisar` | `box-shadow: **none**` | `rgb(245,158,66) 0 0 0 2px` |

⚠️ **POPB-h DECÍA QUE `color` «CAE EN NEGRO». No:** `color` se **hereda**, así que caía en el
texto del tema. Lo que de verdad desaparecía es el fondo, el borde y el anillo del botón.
⚠️ **EL ASPECTO NO CAMBIA DONDE YA FUNCIONABA:** `--orange` es lo que `.amilo-root` le asigna a
`--amber`, y el literal del fondo es el mismo valor.

---

## 5 · El dibujo (commits 5 a 9)

Todo portado de `docs/3d/demo_posoperatorio_v9_concepto.html`, que es un dibujo del médico y la
orden autoriza expresamente a copiar.

| commit | qué | dueño |
|---|---|---|
| 5 | los símbolos de válvula y su apertura rotatoria | `_popValvVelos`, `_popValvApertura`, `POP_ESQ_VALV_L` = 8, `POP_ESQ_VALV_ANG` = 72, `POP_ESQ_VALV_BIO` = `#c08a4a` |
| 6 | los chorros de insuficiencia | `_popEsqPluma`, `POP_ESQ_JET`, `POP_ESQ_JETPOS`, `_popEsqJetGrado` |
| 7 | los catéteres del Swan y del PiCCO | `n.catSwan`, `n.catPicco`, `n.sgBal`; el dato viaja en `popEsquema().mon` |
| 8 | el tamaño de las cavidades y el anillo | `_popEsqGeo`, leyendo `aiVolClasificar`, `adAreaCat`, `feviClasificar`, el TAPSE y `tep_tabique_d` |
| 9 | los trazados de TAPSE y de E/A | `_popTrzTap`, `_popTrzEA`, `_popTrzBump`, `_popTrzLetra` |

### La comparación obligatoria con la demo

**No se comparan píxeles** —dos motores dan píxeles distintos con el mismo SVG—. Se **extraen**
`valveGeo`, `openFrac` y `plume` del archivo de la demo por marcas literales, exigiendo que cada
una aparezca **una sola vez** —así, si la demo cambia, la extracción falla ruidosamente—, se
evalúan en una página **en blanco**, y se comparan los **números** de las rutas.

**180 escenarios, 180 iguales:** 132 de válvula (3 tipos × 4 válvulas × 11 fases) y 48 de pluma
(4 grados × 4 aperturas × 3 bamboleos).

⚠️ **LA TOLERANCIA DE LA PLUMA ES 0,005 INCLUSIVE Y NO ES ARBITRARIA:** la app redondea la ruta a
dos decimales y la demo deja el valor crudo, así que la diferencia máxima **posible** es medio
ulp, exactamente 0,005. Seis escenarios caen justo ahí.

### ⚠️ La pulmonar habla otro idioma

`im_grado`, `it_grado` e `ia_grado` guardan el **número** (1, 2, 3, 4, el vocabulario de
`_CC_GRADO`) y **`ip_grado` guarda la palabra**: «Sin insuficiencia», «Leve», «Moderada»,
«Severa». Sin esa rama el chorro pulmonar no se dibujaba nunca. `_POP_JET_PAL` traduce.

### La sincronía de los chorros

La insuficiencia ocurre con la válvula **cerrada**, así que cada chorro usa la fase **contraria**
a la apertura de su propia válvula, reusando `_popValvApertura` con la clave de la otra familia.
Medido por muestreo: la mitral y la tricúspide aparecen en ~16 de 40 muestras (la sístole) y la
aórtica y la pulmonar en ~18 de 40 (la diástole).

### Las cavidades y el anillo

| cavidad | dueño del tamaño | sin ese dato |
|---|---|---|
| AI | `aiVolClasificar` sobre el volumen indexado | queda el factor por presión capilar |
| AD | `adAreaCat` sobre el área | queda el factor por presión venosa |
| VI | `feviClasificar` | queda el factor por presión capilar |
| VD | el TAPSE, con `UMBRAL_TAPSE_NORMAL` | queda el factor por presión venosa |
| septo | `tep_tabique_d`, con sus tres estados | queda el abombamiento por presiones |

**El anillo del derrame** (cierra POPB-d): leve **6**, moderado **11**, severo **17**, y el
compromiso **suma 6 por encima**. Valía 8 para los tres tamaños y 14 con compromiso, o sea que lo
que distinguía era el compromiso y no el tamaño.

### ⚠️ El trazado de las ondas va en la mitad inferior de la aurícula

En la demo el rótulo de la cavidad vive en el **techo** de la caja; acá `_popEsqPonerCaja` lo
pone en el **centro**, así que el pico de la onda E subía hasta él y la letra «E» se montaba
sobre el rótulo «AI» — medido, 4×10 px. Se baja el origen y se acorta el alto a la mitad.

---

## 6 · El esquema al PDF (commit 10)

**Cierra POPB-e.** `PDF_DIAG_REG` tenía ocho entradas y ninguna del posoperatorio.

**Los diagramas entran por DOS caminos:**

| camino | quiénes | cómo |
|---|---|---|
| **por casilla guardada** | `contr_be_pdf`, `ete_qx_pdf`, `vab_pdf` | `<input type="hidden">` con id, o sea campos del estudio |
| por slot en «Imágenes» | `oai`, `cia`, `tga3d` | viven en `imgSlots` con su `esqClave` |

La orden prohíbe el segundo, así que se usa el primero — que además es el que «guarda una casilla
propia», la condición con que autoriza el campo nuevo. **Su nombre exacto: `pop_esq_pdf`.** Es el
único campo guardado que esta tanda crea.

La fila: `{ k:'pop', w:2, fam:'pop', lbl:'Esquema del posoperatorio' }`. Familia **propia**, y
`w:2` porque su lienzo es ancho (600×496). **El motor de tercios no se toca.**

**El epígrafe es fijo:** «Esquema ilustrativo: no es una imagen del estudio ni está a escala.»

⚠️ **LA RASTERIZACIÓN ES DIFERIDA Y ES UNA RESTRICCIÓN MEDIDA:** ni `generarPDFReal` ni
`_pdfAjustarA4` son `async`, y `esqRasterizar` devuelve una **promesa**. El dibujo se rasteriza
cuando el esquema se repinta y la casilla está marcada, con su diferido propio de 700 ms —lo
mismo que el esquema de la orejuela desde la NOC-A—. **El bucle se pausa antes de serializar.**

⚠️ **NO VA A `imgSlots` NI A NINGÚN CAMPO:** el dataURL vive en una variable de módulo y muere con
la página.

---

## 7 · Las trampas que esta tanda pagó

1. **El acento grave dentro de un comentario, en CUATRO archivos distintos.** El cuerpo de un
   caso y el de una sonda son template literals. `node --check` las caza todas; contar los
   acentos graves de cada bloque y exigir el número exacto es lo que acabó funcionando.
2. **El bucle del dibujo se apaga cuando el dibujo no se ve.** Sin `scrollIntoView`, los chorros,
   el latido y los trazados se leen **siempre apagados**: un denominador vacío.
3. **Los chorros son pulsátiles.** Una foto cae en un instante al azar del ciclo. Hay que
   muestrear —40 o 110 muestras— o quitar la frecuencia para que el pintor use la amplitud de
   reposo. **Dos mutaciones sobrevivieron por esto.**
4. **Los rects de las cavidades no llevan `data-pop-esq`.** Buscarlos por marca daba `null` en
   todas las escenas. Se le pregunta al dueño, `_popEsqGeo`.
5. **El acordeón del posoperatorio sobrevive entre escenas**, así que un click a ciegas en el
   toggle lo **cierra** y el botón queda oculto.
6. **El botón «Integrar» cae en y≈2218**: con un viewport de 1000 Playwright se niega a
   clickearlo, y el fallo se lee como que el botón no funciona.
7. **`getBBox` sobre un `<g>` devuelve coordenadas locales**, o sea antes de su `transform`, y
   reporta superposiciones que no existen. La caja que sirve es `getBoundingClientRect`.

---

## 8 · Dos hallazgos preexistentes que esta tanda destapó y no tocó

**`popEsqArrancar` no vuelve a arrancar el bucle** (→ **POPC-k**). `popEsqFrame` deja de
re-agendarse cuando el dibujo sale de la vista pero **no limpia** `_popEsq.rafId`, así que al
volver a verse la guarda `if (_popEsq.rafId ...) return` lo deja quieto. Verificado **idéntico en
HEAD byte por byte**.

⚠️ **Y EL DENOMINADOR DEL LATIDO ES `_popEsq.visible`, NO `rafId`.** El id viejo sigue puesto, así
que preguntar por él da un **falso «sí»** mientras `popEsqFrame(0)` deja todo en la fase cero.
Costó una corrida.

**El botón «Usar este valor» mide 95×30** (→ **POPC-l**), porque vive en la guardería y hereda el
piso táctil de la tarjeta de criterios, que **MF2-f** ya declara en 26-30 px con el mouse.

---

## 9 · El estado de la verificación

| qué | resultado |
|---|---|
| comparación con la demo v9 | **180 de 180** escenarios idénticos |
| mutaciones dirigidas | **31 de 31 muertas**, árbol vivo con md5 intacto |
| casos nuevos | TC-595 a TC-600, **95 condiciones** en rojo contra HEAD y **cero excepciones** |
| Semgrep | **124 WARNING / 0 ERROR**, la línea base |
| Excel | **441** columnas con las mismas claves, en las 136 escenas |
| campos guardados | **+1**: `pop_esq_pdf`, el autorizado |
| huérfanos | sin huérfanos nuevos |
| celular | **59 a 360 px y 68 a 390, 17 ALTA**, idéntico a HEAD uno por uno |
| Chrome y WebKit | **16 cruces**, sin una diferencia entre motores; cero errores, cero scroll horizontal, cero textos recortados, cero superposiciones del SVG |
| el dibujo | **32 escenas** sin superposiciones ni elementos fuera del lienzo |
| A/B global | **136 escenas, 153.120 claves**: **8 escenas** con diferencia de papel, todas autorizadas |
