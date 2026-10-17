# La AI y el VI por SEXO — mapa de la tanda «LS» (2026-10-16)

Qué cubre: el **dueño único del sexo efectivo** y la regla del **corte más alto**, los seis
parámetros de la aurícula y el ventrículo izquierdos que pasaron a tener corte por sexo, la
**fracción de eyección en cuatro categorías con un solo dueño**, el **aviso de pantalla** y lo que
cambió en las tarjetas ⓘ, en Referencias y en el registro de evidencia.

Lo que **no** cubre y vive en otros mapas: el mecanismo de las tarjetas y del registro
(`registro-evidencia.md`), la jerarquía de la AI y el símbolo del sexo del PDF
(`auricula-izquierda-pdf.md`), los dos campos automáticos del VI
(`vi-volumenes-automaticos.md`), y la verificación contra el PDF original
(`docs/fuentes/FUENTES.md`, «La tanda LS»).

---

## 1 · El dueño del sexo efectivo

| Función | Qué devuelve | Dónde vive |
|---|---|---|
| `sexoLeido(valor)` | `'M'`, `'F'` o `null` — normaliza **un valor dado** | al lado de `UMBRAL_LAVI_DILATADO` |
| `sexoCargado(src)` | lo mismo, leyendo el **formulario** sin argumento, la clave `sexo` de un objeto de campos, o un texto | idem |
| `sexoEfectivo(src)` | `'M'` o `'F'` — aplica la **regla del corte más alto** | idem |
| `sexoFalta(src)` | `true` cuando el sexo no está cargado o no es masculino ni femenino | idem |
| `SEXO_CORTE_ALTO` | `'M'` — el corte más alto de esta zona es el del varón | idem |

**La regla:** sin sexo cargado se aplica el corte **más alto**, que es el del varón en los seis
parámetros. Es el lado que **no sobre-afirma**: un diámetro AP de 39 mm sale «normal» en vez de
«dilatada».

⚠️ **UN VALOR QUE NO SEA MASCULINO NI FEMENINO CUENTA COMO SIN SEXO.** El `<select>` ofrece
exactamente `''`, `'M'` y `'F'`, así que ese estado sólo se alcanza por un estudio importado o
guardado con otro vocabulario. Inventarle un sexo a un dato que no lo dice es peor que no ubicar
el punto. Medido: `'X'`, `'otro'`, `null` y `''` → `sexoCargado` devuelve `null` y
`sexoEfectivo` el del varón.

⚠️ **ANTES LA MISMA PREGUNTA SE CONTESTABA DE TRES FORMAS** —`sv('sexo') === 'F'`,
`sexo === 'F'` y `String(sexo||'').charAt(0).toUpperCase() === 'F'`— y **las dos primeras no
coinciden con la tercera**: un `'Femenino'` o un `'f'` guardado mandaba a una mujer a los cortes
del varón. Los siete clasificadores de la zona (`calcGeometriaVI`, `hviSeveridad`,
`vdfviInterp`, `vsfviInterp`, `viDimCat`, `evCortes` y `_evSexoCargado`) pasan a leer el dueño.

⚠️ **`sexoEfectivo()` SIN ARGUMENTO LEE EL FORMULARIO, Y ESO ES DELIBERADO**: es lo que hace que
el informe, el EN SUMA, la cápsula y la tarjeta hereden el corte **sin copiarlo**. Los
clasificadores que reciben el sexo como argumento usan `sexoLeido(sexo)` —sin respaldo al DOM—
para no cambiar de respuesta según quién los llame.

---

## 2 · Los seis parámetros por sexo

| Parámetro | Dueño | Varón | Mujer | Operador |
|---|---|---|---|---|
| Diámetro AP de la AI | `aiDiamDilatado` / `aiDiamNormalMax` | normal ≤ 40 mm | normal ≤ 38 mm | `>` dilatada |
| DDVI | `viDimCat` / `ddviCortes` | 58 · 63 · 68 mm | 52 · 56 · 61 mm | `<=` para cada banda |
| DSVI | `dsviBandas` / `EV_BANDAS_REF` | 40 · 43 · 45 mm | 35 · 38 · 41 mm | `<=` |
| Espesor del septum y de la pared | `espesorBandas` / `EV_BANDAS_ESPESOR` | 10 · 13 · 16 mm | 9 · 12 · 15 mm | `<=` |
| Masa indexada | `calcGeometriaVI` / `hviSeveridad` | normal ≤ 115 g/m² | normal ≤ 95 g/m² | `<=` normal, `>` hipertrofia |
| Volúmenes indexados | `vdfviInterp` / `vsfviInterp` | 74 · 89 · 100 y 31 · 38 · 45 | 61 · 70 · 80 y 24 · 32 · 40 | `>` |

**El operador sale de la forma en que la guía publica el dato**: rangos normales que **incluyen
su límite superior** («3.0–4.0», «49–115», «0.6–1.0»), con la banda siguiente empezando en el
entero de arriba. Así que **40,0 mm, 115 y 95 g/m², 58 mm y 10 mm son NORMALES**.

### El DDVI pasó a CUATRO categorías

Antes eran dos números iguales para los dos sexos —58 y 65 mm—: el 58 es el techo normal **del
varón** y **el 65 no estaba en ninguna de las dos columnas** de la Tabla suplementaria 3. Hoy son
las cuatro de la guía, con los adjetivos que `vdfviInterp` y `vsfviInterp` **ya publicaban** para
los volúmenes del mismo ventrículo: «de dimensiones normales», «levemente dilatado»,
«moderadamente dilatado», «severamente dilatado».

⚠️ **NO HUBO QUE TOCAR `EV_COLOR` NI LA VISTA 2D.** `EV_COLOR` ya tenía las dos categorías nuevas
con su color, y la vista 2D mapea el sintagma con `indexOf('normales')` y `indexOf('levemente')`,
así que las dos nuevas caen en el mismo tramo «dilatado» en el que caía la que reemplazan.

⚠️ **EL RESPALDO POR VOLUMEN INDEXADO NO SE MOVIÓ** (61 ml/m² en la mujer, 75 en el varón) y sólo
puede **empeorar** un «de dimensiones normales». Medido en sus cuatro bordes: 0 diferencias.

### El DSVI y los espesores NO se clasifican en el papel

**Censado:** no hay cápsula `dsvi-interp`, `siv-interp` ni `pp-interp` —cero ocurrencias—, y el
informe no los categoriza por ningún camino; lo que el informe publica es la **hipertrofia por
masa**. Lo único que publicaba un número era la **referencia impresa** de la tabla del PDF, que
decía «< 40 mm» y «< 13 mm» sin sexo. Y **el «< 13 mm» no era un límite de normalidad**: es el
techo de la banda *levemente anormal* del varón.

LS4 y LS5 **no agregan clasificación nueva** al informe ni al EN SUMA: lo que gana el sexo es la
referencia impresa y una barra en la tarjeta. TC-493 (a11) lo fija como límite declarado.

### La masa: el 115 y el 95 exactos

Cierra **L-5**. `calcGeometriaVI` decidía con `m < limite`, así que 115 g/m² justos salían
«Hipertrofia» en el informe firmado. Y el defecto era peor que un borde: **la cápsula de pantalla
decía «Normal»** —su operador ya era `>`— y la fila de geometría, dos renglones más abajo, decía
«Hipertrofia excéntrica» **sin gravedad**, porque las bandas de `hviSeveridad` empiezan en 116.

**Bandas sin huecos ni solapes**, sondeadas de 40 a 200 g/m² en los dos sexos: HEAD tenía **un
hueco por sexo** y ahora son **cero**.

⚠️ **PARA TIPEAR UN 115 EXACTO HAY QUE BISECAR.** La masa es la fórmula de Devereux sobre cinco
campos, así que no hay un valor que se pueda escribir: el par de espesores que la deja en cada
valor exacto se busca por **bisección sobre doubles** con la superficie corporal en 2,00. Los
pares medidos: 10,332 → 95 · 10,391 → 96 · 11,855 → 115 · 11,914 → 116.

---

## 3 · La fracción de eyección — un dueño y cuatro categorías

| Clave | Rango | Adjetivo del informe | Color |
|---|---|---|---|
| `preservada` | ≥ 50 % | normal / conservada | verde |
| `leve` | 41 a 49 % | levemente reducida | amarillo |
| `moderada` | 30 a 40 % | moderadamente reducida | naranja |
| `severa` | < 30 % | severamente reducida | rojo |

Dueño: **`feviClasificar(fevi)` / `FEVI_CATS`**, al lado de `UMBRAL_FEVI_NORMAL`, que sigue siendo
el piso de la banda de arriba y **no se duplica**. Constantes nuevas: `FEVI_LEVE_MIN` (41) y
`FEVI_MODERADA_MIN` (30).

**Los 40 y 30 exactos van a «moderadamente reducida»**, y antes el 40 caía en la de arriba. El
corte de arriba es `>= 41` y no `>= 40` porque la ESC 2021 escribe «FEVI ≤40%» para la reducida y
«FEVI 41-49%» para la ligeramente reducida: el 40 pertenece al grupo de abajo.

⚠️ **VIVÍA EN CINCO COPIAS, CENSADAS:**

| Copia | Qué tenía | Hoy |
|---|---|---|
| la cápsula de `calcVI` | cuatro categorías escritas a mano | lee el dueño |
| el bloque del informe | cuatro categorías con sus cuatro juegos de texto | lee el dueño; los textos se mudaron a `FEVI_CATS` |
| `_simpClasificar` (Simpson) | cuatro categorías con sus cuatro colores | lee el dueño |
| `FEVICAT` (asociaciones) | **TRES**: `≥50 / 40-49 / <40` | lee el dueño, cuatro clases |
| la distribución del panel | **TRES** barras: `< 40 %`, `40–49 %`, `≥ 50 %` | cuatro barras derivadas del dueño |

Y `EV_BANDAS_REF.fevi` **se deriva** de `FEVI_CATS` en vez de ser una sexta copia. Medido: bandas
y dueño coinciden en todo el dominio, 10 a 80 % de medio en medio.

⚠️ **DOS LUGARES NO SE TOCARON Y SON BANDAS DE FILTRO, NO CATEGORÍAS:** el criterio de cohorte
`baja`/`media`/`alta` —cuyo propio comentario ya dice que su 40 es «el borde interno de la banda
intermedia, no un umbral de normalidad»— y la comparación de subgrupos «FEVI < 40 % frente a
FEVI ≥ 40 %», que es una dicotomía con su rótulo impreso. Tocarlos cambiaría qué estudios entran
en un filtro guardado. Y el `<select>` `filtro-fevi` tiene cuatro opciones de RANGO (`lt30`,
`lt40`, `lt50`, `gte50`) que tampoco son categorías.

⚠️ **CONSECUENCIA EN EL LABORATORIO:** `FEVICAT` pasa de tres clases a cuatro, así que el chi² de
los tres pares que la usan se calcula con un grado de libertad más y su **p crudo cambia**; y el
ajuste de Benjamini-Hochberg corre sobre la familia del bloque, así que el **p ajustado** de sus
vecinos puede moverse. No es un defecto: es la variable que cambió.

**La línea del criterio.** La tarjeta publica «Criterio de EcoSmart, orientado según guías
clínicas» (`FEVI_CRITERIO_TXT`) **sin nombrar ninguna guía**: las cuatro bandas son una
composición y atribuirlas a un documento sería citarlo por algo que no escribe. El detalle por
corte va **sólo en Referencias**, con dos fichas verificadas (`FUN-VI-002` y `FUN-VI-003`);
`FUN-VI-001` sigue siendo el criterio propio y **no publica fuente**.

---

## 4 · El aviso de pantalla

Nodo: **`#aivi-sexo-aviso`**, al tope de `#tab-ai-vi` y **fuera de los tres acordeones**. Dueños:
`aiviSexoCambian()` (puro, devuelve los nombres) y `aiviSexoSync()` (pinta).

**Cuándo aparece:** sólo cuando **falta el sexo** Y algún valor cargado **cambiaría de categoría**
con él.

⚠️ **NO COPIA NI UN CORTE, Y ES LO QUE LO HACE CORRECTO.** La condición no es «el valor cae entre
38 y 40»: es «la categoría que el DUEÑO devuelve con sexo varón no es la misma que devuelve con
sexo mujer». Se le pregunta **dos veces a la misma función**. Escribir la franja a mano sería una
segunda copia de veinte números, y el día que uno se mueva el aviso avisaría sobre la franja
vieja. De paso cubre los **tres** bordes del DDVI y las **tres** bandas de gravedad de la masa sin
nombrar ninguno.

`AIVI_SEXO_PARAMS` tiene **ocho entradas**: el diámetro AP, el DDVI, el DSVI, el septum, la pared,
la masa y los dos volúmenes indexados. **La masa y los volúmenes son derivados** —la masa de cinco
campos, los volúmenes por la superficie corporal— y sólo entran cuando el derivado existe.

| Escena | ¿Aviso? |
|---|---|
| sin sexo, diámetro AP 39 (entre 38 y 40) | **sí** |
| sin sexo, diámetro AP 37 o 45 (igual en los dos sexos) | no |
| con sexo M o F, diámetro AP 39 | no |
| sin sexo, DDVI 55 · DSVI 37 · septum 10 · pared 10 · masa entre 95 y 115 · VDFVI idx 65 · VSFVI idx 28 | **sí** |
| sin sexo, FEVI 40 | **no** — su criterio no distingue sexo |
| sin sexo y sin ningún dato | no |
| valor **no binario** en el sexo, diámetro AP 39 | **sí** |

**Medido a 1200×700, 1440×800, 1920×1080, 768×1024, 390×844 y 360×740, en los dos temas:**
visible en las doce celdas, sin scroll horizontal, el campo de al lado con su ancho de siempre, y
el color real resuelto en `rgb(245,158,66)` de noche y `rgb(217,123,31)` de día.

⚠️ **EL COLOR ES `--orange` Y NO `--amber`.** `--amber` se define sólo dentro de `.amilo-root` y
de `#sp-root`: fuera de ahí la declaración es inválida en tiempo de valor computado y el texto cae
al heredado, o sea **gris**. Es la trampa que este repo ya pagó cinco veces.

⚠️ **NO ES UN BOTÓN Y NO LLEVA `onclick`.** La regla táctil global matchea **por el atributo**
(`[onclick]{min-height:44px}`) y estiraría la línea a 44 px, **desplazando el campo** —el defecto
que `#ig-img-storage` ya documenta—. Tocar el enlace lleva al campo del sexo abriendo su pestaña;
el enlace es un `<a>` y no entra en esa regla.

⚠️ **LAS DOS PIEZAS DEL ESCONDIDO:** el atributo `hidden` **y** el `display:none` en línea. El
`[hidden]{display:none}` vive en la hoja del **navegador** y cualquier regla de autor le gana.

⚠️ **LLEVA LAS TRES COLUMNAS**, como `vdMarcaSync`: `calcAI`, `calcVI`, `RECALC_MODULOS`, el final
de `limpiarCampos` y un **oyente de documento**, porque el sexo, el peso y la talla viven en
**otra pestaña** y su `onchange` no pasa por ninguno de los dos calculadores. El barrido genérico
de `[id$="-aviso"]` le vaciaría el **texto** dejándole el `display` puesto, o sea una línea
naranja vacía sobre un formulario recién limpiado.

---

## 5 · Las tarjetas ⓘ y Referencias

**La regla «sin sexo, sin punto» SE RETIRÓ.** Antes las tres barras que dependen del sexo se
dibujaban sin punto; hoy las cinco de la tarjeta del VI y el gráfico de geometría **ubican el
punto con el corte más alto** y lo dicen en una línea corta: **«Sin sexo cargado: se usó el corte
más alto.»** (una sola, `AV_SEXO_ALTO`, idéntica en las tres).

**Las dos barras de espesor van en la tarjeta de GEOMETRÍA** (`vi-geo`) y no en la del
ventrículo, y es una medición: esa tarjeta ya mide 475 a 507 px con sus cinco barras y el hueco
útil a 1200 × 700 es de 486. El espesor pertenece a la de geometría por contenido: el espesor
parietal relativo que su gráfico dibuja es 2 × pared / diámetro.
⚠️ **La tarjeta de geometría pasó de 363 px a 528 de alto visible con 562 a 596 de contenido**, o
sea 34 a 68 px de **scroll interno**. Declarado en `PENDIENTES.md`.

**Son dos barras y no una** porque son dos mediciones: una sola obligaría a elegir entre los dos
campos —o a tomar el mayor, que es un criterio que la guía no escribe—. Comparten bandas y ficha
porque la guía imprime los mismos cuatro rangos para los dos.

**Referencias publica SIEMPRE los dos sexos**, con una barra por sexo para el diámetro AP, el
DDVI, el DSVI, el espesor, los dos volúmenes y la masa. **La FEVI va una sola vez**: su criterio
no distingue sexo, y repetir la barra afirmaría que depende de un dato del que no depende.

---

## 6 · El registro de evidencia

Pasa de **28 fichas a 31**: entran `DIM-VI-005` (el espesor del septum y de la pared),
`FUN-VI-002` (los cortes de 50 y de 40 de la FEVI) y `FUN-VI-003` (el de 30). Y cambian de
estado:

| Ficha | Antes | Ahora | Por qué |
|---|---|---|---|
| `DIM-AI-001` diámetro AP | parcial · criterio propio | **verificado · guía** | la Supplemental Table 9 publica el rango por sexo |
| `DIM-AI-002` área | **por verificar** | **verificado · guía** | la guía de 2005 sí publica el área absoluta |
| `DIM-VI-001` DDVI | parcial · criterio propio | **verificado · guía** | las cuatro bandas son las de la tabla |
| `DIM-VI-002` DSVI | verificado, sin dueño | verificado, con `dsviBandas` | le faltaba el dueño |
| `GEO-VI-001` RWT | citaba Tabla 6 **y** Figura 6 | cita **sólo la Figura 6** | la Tabla 6 da el 0,42 como normal y la app lo trata como aumentado |
| `MAS-VI-001` masa | «por debajo de 115» | «hasta 115… la hipertrofia empieza por encima» | el operador |
| `FUN-VI-001` FEVI | por verificar | **sigue por verificar** | las cuatro bandas son una composición: no hay tabla que las publique |

Totales al cierre: **24 verificadas · 4 parciales · 3 por verificar**.

**Los acentos.** Las cadenas que el médico LEE —`zona`, `dato`, `valor`, `tipo`, `ubicacion`,
`fuente_una_linea`, `fuente_original` y el título de las guías— pasaron de **93 palabras sin
tilde a CERO**. El campo `duenio` **no** se acentúa: son nombres de función.
⚠️ **EL DETECTOR COMPARA POR TOKEN COMPLETO Y NO POR SUBCADENA** —«todo» matchea dentro de
«método», que la tanda M ya pagó— y **no** incluye «auricular», «insuficiencia» ni
«cardiaca/cardiacas», que no llevan tilde o la Academia las admite sin ella: una lista que las
incluya pone en rojo una ficha perfecta.

---

## 7 · Nueve trampas de esta tanda

1. **Un `assert` que falla en un script de edición NO deja el archivo a medias**, porque la
   escritura va al final — pero tampoco aplica lo que ya había hecho en memoria. Pasó dos veces:
   el reporte dice «ok» del `jscheck` sobre un archivo **sin** los enganches. **Verificar con
   `grep` que la edición quedó, no confiar en el «ok» del paso siguiente.**
2. **`viVolAutoSync` aparece DOS veces con el mismo patrón exacto** —en `calcVI` y en la ventana
   de reimpresión— así que un `replace` por texto no es único. Se insertó **por número de línea**.
3. **Dentro del template de la sonda no hay regex**, y es por necesidad: una barra invertida se
   **cocina**, así que `\s` llega al motor como la letra `s` y borra todas las eses del texto. Las
   cadenas se parten **por código de carácter**.
4. **Me comí el acento grave CUATRO veces**, todas en comentarios míos: tres dentro del cuerpo de
   TC-491 y una dentro de la sonda. `scripts/check_backticks.py` dio la línea exacta las cuatro
   mientras `node --check` apuntaba a la apertura del template, cientos de líneas antes.
5. **`elementFromPoint` devuelve el artefacto conocido a 768 px**: el centro del enlace del aviso
   cae fuera del viewport y la lectura informa «fuera», no un defecto. Alcanzable en 10 de las 12
   celdas medidas.
6. **El estilo CONCISO no publica el fragmento del ventrículo sin el diámetro diastólico**, así
   que una escena con la FEVI sola dejaba la condición en rojo sobre un informe que dice lo
   correcto en los otros dos estilos. La escena lleva `ddfvi` como **denominador**.
7. **Las claves de las dos tarjetas del VD son `vd-tam-card` y `vd-fun-card`**, no `vd-tam` ni
   `vd-fun`: el control de que la tanda M no se movió salía rojo sobre un árbol perfecto.
8. **Dos corridas de la suite en paralelo**, por un `&` dentro de un comando que el tool ya
   corría en background. Es exactamente lo que la regla de «una sola instancia de Chrome» prohíbe:
   se mataron **por PID propio** y se volvió a medir.
9. **La primera medición del registro contó 93 palabras sin tilde y 101 después de editar**, y la
   subida era mía: los textos nuevos de las fichas también salieron sin acentos. **Medir el
   detector antes y después, no sólo después.**
