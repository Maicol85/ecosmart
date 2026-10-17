# Mapa — PRÓTESIS valvular mitral y aórtica: los criterios propios

Mapa de la tanda **W2-B** (2026-10-15), que implementa los criterios de prótesis del censo W1
(`docs/censo/protesis_valvular.md`). **No hay números de línea a propósito**: la línea cambia en
cada edición, el nombre de la función no.

Lo que este mapa NO cubre: la válvula **nativa** —sus cortes viven en `docs/mapa/valvulas.md`,
`docs/mapa/aortica-cortes.md` y `docs/mapa/valvulas-constantes.md`— y la **pantalla** de la mitral
y de las insuficiencias, que están en `docs/mapa/valvulas-mitral-pantalla.md` y
`docs/mapa/valvulas-ia-it-pantalla.md`.

---

## 1 · Qué activa la lógica de prótesis, y por válvula

Cada válvula usa los criterios de prótesis cuando **su propia** morfología lo es. Las dos
preguntas son independientes: una mitral protésica con una aórtica nativa corre la Tabla 11 de un
lado y los cortes nativos del otro.

| Pregunta | Dueño único | Falla hacia |
|---|---|---|
| ¿este TOKEN es una prótesis? | `valvEsProtesis(val)` sobre `VALV_PROT_OPCIONES` | `false` con cadena vacía |
| ¿esta MITRAL es protésica? | `_imVmProt()` (lee `#vm_morf`) | **`true`** sin el campo: la app se abstiene, que es la mitad barata del error |
| ¿esta prótesis se abstiene de graduar la estenosis? | `protNoGradua(morfId)` sobre `PROT_SIN_GRADO_VALVS` | la **aórtica NO está** en esa lista: sí gradúa |

`#vm_morf` tiene **nueve** opciones y **dos** activan la lógica protésica (biológica y mecánica).
`#va_morf` tiene **nueve** y **tres** la activan: biológica (SAVR), mecánica (SAVR) y **TAVI**.

**El TAVI**, medido: corre la vía `TAVI` de `eaProtVeredicto`, publica los ejes del bloque
«todas las prótesis aórticas» —que son de corte absoluto—, **no emite veredicto de estenosis** y
lo declara en la cápsula. El motivo es de la guía: su criterio específico es el **cambio respecto
de un basal post-implante en condiciones hemodinámicas estables**, y elegir cuál estudio es ese
basal es una decisión clínica que la app no toma sola. **Desde el W2-B el TAVI SÍ publica el PPM**,
porque la Tabla 7 no abre ramas por tipo de prótesis: su fila dice «Aortic EOA», no «SAVR».

⚠️ `valvProtSync()` es el dueño de «cambió la morfología»: muestra u oculta los cuatro bloques de
prótesis, repinta la cápsula mitral (`vmProtEOAPintar`), la fila del AT (`eaAtPintar`) y —desde el
W2-B, que cierra la asimetría **W1-13**— recalcula el cuadro aórtico (`calcEADetalle`).

---

## 2 · La nomenclatura: AEO, EOA y EROA

Decisión de Maicol (15/10/2026). **AEO = área efectiva del orificio protésico**, que las guías
anglosajonas llaman *EOA*; **AEO indexada** es la del PPM. **EROA NO se renombra**: es el área del
orificio **regurgitante** de las insuficiencias.

- **Cambia lo que se LEE**: la cápsula de la prótesis mitral con sus dos `aria-label`, los cuatro
  párrafos de «Referencia clínica», las tarjetas ⓘ, las **dos** líneas del informe firmado y del
  EN SUMA, la salvedad de la cápsula aórtica, la entrada bibliográfica del panel y las siete filas
  y notas del panel de Evidencia.
- **No cambia** lo que no se ve: los identificadores (`vmProtEOA`, `VM_PROT_EOA_OBSTR_MAX`,
  `porEoa`, `eoaI`) y los comentarios de código. Mismo criterio que el renombre PHT → THP.
- **No cambia** ninguna **cita literal en inglés** de las guías: alterar una cita la falsifica.
- **El Excel y el importador no se tocan**: censados, ningún encabezado dice «EOA» —los de la zona
  son `DVI mitral` y `DVI mitral (fuente)`—, así que **no hizo falta ninguna tabla de alias** y la
  lectura por nombre de encabezado queda intacta.
- Apariciones de «EOA» que hablaran de **regurgitación**: **cero**. Las siete que nombran
  regurgitación en su línea se refieren al orificio protésico (la regurgitación es lo que
  invalida el volumen sistólico del TSVI, no lo que el AEO mide).

⚠️ **El panel de Evidencia usa «AEOR» para el orificio regurgitante** en cuatro citas suyas, y eso
NO se tocó: es una tercera nomenclatura, está declarado en `docs/PENDIENTES.md`.

---

## 3 · Prótesis MITRAL — la estenosis (Tabla 11, folio 27)

Dueño único: **`vmProtEOA(src)`**, que devuelve DATOS y nunca HTML; la pintan `vmProtEOAPintar()`
y la consumen el narrativo, el EN SUMA y la fila del Excel. La fuente es **inyectable** (`src`)
porque `_labExcelRow` deriva todo de `inf.campos`.

| Parámetro | Constante | Normal | Posible | Significativa |
|---|---|---|---|---|
| Velocidad pico de E (`em_vmax`, m/s) | `VM_PROT_T11.vmax*` | `< 1,9` | 1,9 a < 2,5 | **`≥ 2,5`** |
| Gradiente medio (`em_gmedio`, mmHg) | `VM_PROT_T11.gmed*` | **`≤ 5`** | > 5 a 10 | **`> 10`** |
| DVI = VTI prótesis / VTI TSVI | `VM_PROT_DVI_*` | `< 2,2` | 2,2 a 2,5 | `> 2,5` |
| AEO por continuidad (cm²) | `VM_PROT_EOA_OBSTR_MAX` y `VM_PROT_EOA_NORMAL_MIN` | **`≥ 2,0`** | 1 a < 2 | `< 1` |
| THP (`thp`, ms) | `VM_PROT_T11.thp*` | `< 130` | 130 a 200 | `> 200` |

⚠️ **LOS TRES OPERADORES NUEVOS SON DISTINTOS ENTRE SÍ Y ES DE LA TABLA**: la velocidad incluye su
corte alto y los otros dos no; el gradiente incluye su corte bajo y los otros dos no. Un helper
con un solo par de operadores publicaría el veredicto contrario en los seis bordes exactos, que
son justo los números que se tipean. Lo resuelve `_vmProtNivelT11(x, normalMax, signifMin,
normalIncl, signifIncl)`.

⚠️ **LA BANDA DEL MEDIO DEL GRADIENTE TIENE UN HUECO IMPRESO**: la tabla escribe «≤5» y «6-10», así
que un 5,5 no cae en ninguna columna. Se resuelve por **complemento**, que es lo único que no deja
un valor sin leer.

⚠️ **LOS TRES NUEVOS NO ENTRAN EN `R.obstr`.** El veredicto sigue saliendo del **AEO y del DVI**,
que es lo que alimenta la línea «Prótesis mitral con hallazgos sugestivos de obstrucción (…)» del
informe firmado. Sumarlos cambiaría qué escenas publican esa frase, y **qué parámetros votan es
contenido clínico**. Declarado en `docs/PENDIENTES.md`.

⚠️ **EL MISMO 2,5 DICE DOS COSAS OPUESTAS Y LA APP PUBLICA LAS DOS.** `VTI_PrMV / VTI_TSVI` aparece
en la **Tabla 11** (`> 2,5` sugiere **estenosis**) y en la **Tabla 12, folio 28** (`≥ 2,5` apoya
**regurgitación** protésica significativa). No es una contradicción de la guía: el cociente sube
por cualquier flujo transmitral aumentado. Por eso con regurgitación significativa el DVI **se
muestra y no concluye**, y el AEO se retira — el motivo sale de `emContMotivoNoVota`, compartido
con el aviso de la continuidad.

⚠️ **EL THP NO CALCULA EL ÁREA DE UNA PRÓTESIS** (folio 10): es frecuentemente inexacto y la
**sobreestima**, sobre todo en válvulas normales. El área sale de la ecuación de continuidad. Por
eso el THP es un **parámetro directo** y el cuadro de referencias retira ahí la clasificación.

### El cuadro de referencias con prótesis (W1-3 y W1-8)

Dueños: `_emCuadroEsProt()`, `EM_CUADRO_PROT_TXT` y `EM_CUADRO_PROT_THP_TXT`, consultados por
`_emCuadroFila` y `_emCuadroGm` **antes** de la casilla y de la banda.

- Las tres filas de área y la del gradiente **declaran que el corte nativo no aplica**;
- la del THP lleva su propio texto, porque lo que no aplica ahí no es el corte sino el **método**;
- **los cuatro VALORES no se tocan**: es «marcar sin borrar», la regla de la casa.

**Por qué DECLARAR y no traducir**: publicar acá los cortes de la Tabla 11 dejaría el gradiente y
el área por continuidad leídos **dos veces** en la misma pestaña —una acá y otra en la cápsula,
que es su dueño desde la Fase 2—, que es el defecto que W1-3 viene a cerrar, no a mover.

---

## 4 · Prótesis MITRAL — la insuficiencia (Tablas 12 y 13)

**Ningún número cambia en esta tanda**, y el censo explica por qué: la **Tabla 13, folio 30**
publica para la prótesis exactamente los mismos cortes que la **ASE 2017, Tabla 8, folio 332**
publica para la nativa — vena contracta `<0,3 / 0,3-0,69 / ≥0,7` cm, volumen regurgitante
`<30 / 30-59 / ≥60` mL, fracción regurgitante `<30 / 30-49 / ≥50` % y EROA
`<0,20 / 0,20-0,39 / ≥0,40` cm². La onda S dice lo mismo con otras palabras.

Lo único que la Tabla 13 pide distinto es el **área del jet**, y eso la app ya lo conmuta:
`IM_CORTES.jet_prot` (`<20` leve · «Variable» · `>50` severa) contra `IM_CORTES.jet_nat`
(`<20` · `20-40` · `>40`), por `imCortesPintar()` y por la rama de `_imVmProt()` dentro de
`calcIM_ESC`. **Medido**: con prótesis, 51 % y 60 % dan `im_grado = 4`; el **50 % exacto no vota**.

**W1-10, lo que SÍ cambió: la ATRIBUCIÓN.** Las tarjetas `im-vc`, `eroa-pisa` y `eroa-cont` citan
la Tabla 13 cuando la mitral es protésica y publican su nota: esos parámetros cuantitativos están
**menos validados** que en la IM nativa.

**W1-11, decisión de Maicol: el jet/AI NO cambia de corte.** Lo que se corrigió es el **rótulo**:
la ASE 2017 publica severa por encima del **50 %** del área de la AI y **no publica ni el 20 ni el
40** —el 20/40 viene de guías previas que este repo no tiene verificadas—. Las dos superficies que
lo atribuían mal (la fila de «Referencia clínica» y la tarjeta ⓘ) lo declaran.

---

## 5 · Prótesis AÓRTICA

Dueño del veredicto de estenosis: **`eaProtVeredicto()`**; lo pinta `_eaProtPintar(P)` y lo apaga
`_eaProtNotaOcultar()`. La regla de integración exige **las dos mitades**: un eje dependiente del
flujo (velocidad pico o gradiente medio) y uno independiente (el DVI — el AEO no es evaluable).

| Parámetro | Constante | Normal | Posible | Significativa |
|---|---|---|---|---|
| Velocidad pico (m/s), las tres prótesis | `EA_PROT_CRIT.vmax_*` | `< 3` | 3 a < 4 | `≥ 4` |
| AT / tiempo de eyección, las tres | `EA_PROT_CRIT.atet_*` | `< 0,32` | 0,32-0,37 | `> 0,37` |
| Tiempo de aceleración (ms), las tres | `AT_PROT_*` | `< 80` | 80-100 | `> 100` |
| Gradiente medio (mmHg), SAVR | `EA_PROT_CRIT.savr_gmed_*` | `< 20` | 20-34 | `≥ 35` |
| DVI, SAVR | `EA_PROT_CRIT.savr_dvi_*` | `> 0,35` | 0,25-0,35 | `< 0,25` |
| AEO | — | **no evaluable y declarado** | | |

**El AEO aórtico no es evaluable**: la Tabla 5 lo expresa en desviaciones estándar respecto del
valor de referencia del **modelo implantado**, y la app no registra marca ni modelo. El DVI queda
como único eje independiente del flujo.

### W1-4 — la fila del AVA del recuadro Doppler

`_eaPintarRecuadroDoppler(avaHtml)` pregunta por la **morfología aórtica** —no por `_bloqueado`,
que también es cierto con una prótesis normal— y con prótesis **reemplaza** el badge
«Severa (≤1.0cm²)» por la declaración de que el área no gradúa una prótesis. El número no se
pierde: lo sigue publicando la fila «AVA continuidad» del cuadro de Estenosis Aórtica.

### W1-5 — el PPM aórtico (Tabla 7, folio 20)

`EA_PROT_PPM_CORTES`, con la **misma forma** que `VM_PROT_PPM_CORTES`: `normalMin` EXCLUSIVO y
`severoMax` INCLUSIVO, y la banda moderada por diferencia.

| | Normal | Moderado | Severo |
|---|---|---|---|
| IMC `< 30` | `> 0,85` | 0,85 a 0,66 | `≤ 0,65` |
| IMC `≥ 30` | `> 0,70` | 0,70 a 0,56 | `≤ 0,55` |

- El **AVA indexada se LEE** de `ava-idx`, que `calcAo` ya escribe: un segundo dueño del mismo
  cociente publicaría dos PPM del mismo paciente.
- Con el AVA marcada **«(revisar)» no se clasifica**.
- Sin IMC se usa la rama de **IMC < 30**, la más exigente; es casi inalcanzable, porque el indexado
  necesita la BSA, que sale de los mismos dos campos.
- El **30** sale de `VM_PROT_IMC_OBESIDAD`: es el mismo 30 de la misma tabla.
- **El PPM aórtico NO entra en el informe firmado**, y el mitral sí. Es la opción conservadora y la
  asimetría queda declarada en `docs/PENDIENTES.md`. **No hay columna nueva de Excel**: sigue 436.

### La insuficiencia aórtica protésica

Corre la **cascada nativa, a propósito**: la ASE 2024 (folio 20) dice que la clasificación de la
regurgitación protésica intra y paravalvular es similar a la de la válvula nativa. La
regurgitación **paravalvular de una SAVR** no tiene dónde cargarse —`eteTaviRPV` vive sólo en el
módulo ETE/TAVI— y eso es **W1-12**, que pide campos nuevos y queda fuera de esta tanda.

---

## 6 · Las tarjetas ⓘ

Registro **`VINFO`**, **21 entradas**, tarjeta única `#vinfo-card`, mecanismo `vInfoClic` /
`_vInfoColocar`. Los 21 globos de la pestaña son `<button>`, **cero con `title`** y **cero con
`abrirAyudaEco`**: un globo sin entrada en el registro cae al camino de legado y abriría una
tarjeta **vacía**.

**Las cinco del W2-B**: `prot-vmax`, `prot-gmed`, `prot-thp` (las tres de la cápsula mitral),
`ea-prot-sev` (la fila de severidad aórtica) y `ea-prot-ppm` (el PPM aórtico). Las cuatro primeras
publican los **dos regímenes** con el formato «Nativa: … · Prótesis: …»; la del PPM aórtico no,
porque el desajuste prótesis-paciente **no existe en una válvula nativa**.

**Reescritas**: `prot-eoa` (los tres tramos y el contraste con 1,5 cm² de la nativa), `im-vc`,
`eroa-pisa` y `eroa-cont` (la Tabla 13 y su nota), `im-jet-ai` (el rótulo de la fuente) y
`prot-ppm` (la equivalencia AEO/EOA).

---

## 7 · Las trampas medidas en esta tanda

1. **`diam_tsvi` e `itv_tsvi` no son campos tipeables**: viven en un `.fg` con `display:none` desde
   que la medición se mudó a AI/VI. Las puertas visibles del bloque de Estenosis Mitral son
   **`em_dtsvi` y `em_vtitsvi`**, que son además las que `calcEM` y `vmProtEOA` prefieren.
2. **`valvDatosTog` recibe el ID DEL CONTENEDOR** (`caja-esten-aortica`), no el nombre de la
   válvula. Con el nombre devuelve `null` y no abre nada; en escritorio no se nota por un respaldo
   que escribe `display:block` en línea, y **a 390 y 360 px ese respaldo no gana** porque el CSS
   del celular usa la clase con `!important`.
3. **El rótulo de la fila del jet sólo se repinta cuando hay votos**: `imCortesPintar` cuelga del
   **final** de `calcIM_ESC`, que sale temprano sin parámetros cuantitativos. Consecuencia
   declarada: con prótesis y sin un solo dato, esa fila publica el régimen nativo.
4. **La banda de `ai_area` es `[3,60]`**: un área de 100 cm² marca el cociente con «(revisar)» y el
   jet deja de votar — una tabla entera puede salir en cero y parecer que el corte no funciona.
5. **Medir la visibilidad desde la pestaña equivocada**: `itv_ao`, `vmax_ao` y `gmedio_ao` viven en
   Doppler, así que al terminar de tipear la pestaña activa es ésa y `vis()` informa «oculto por
   `tab-valvulas`» sobre una fila perfecta.
6. **Los dos bordes del AEO se miden con el DVI normal**: `AEO = área / DVI`, así que fijado el
   AEO el DVI queda determinado por el Ø del TSVI. Sin cuidarlo, lo que se mide es el peor de los
   dos votantes y no el tramo.
7. **Una condición que busca «no grad» en un texto que dice «no SE gradúa»** sale roja sobre un
   badge perfecto. Lo delató instrumentar la propia condición para que publicara sus `indexOf`.

---

## El PPM AÓRTICO entra al informe y gana su columna — tanda «Z» (2026-10-15)

Cierra la propuesta **Z2** del censo W1, con la **opción 2** de las dos que esa entrada ofrecía: el
PPM mitral publicaba su línea en el papel desde la Fase 2 y el aórtico se calculaba y se veía
**sólo en pantalla**.

### El dueño único de la cascada

```
_eaPpmAoClasificar(avai, imc)  ->  { ppm: 'no' | 'moderado' | 'severo' | null, cortes }
```

**Sale a función propia y no es un refactor de estilo.** `eaProtVeredicto` lee el DOM —toma el AVA
indexada del `textContent` de `ava-idx`— y desde el Z el mismo veredicto lo necesita
`_labExcelRow`, que trabaja sobre los `campos` de un estudio **ARCHIVADO** y no tiene formulario
que leer. Con la cascada adentro, la celda habría publicado el PPM del paciente **abierto en
pantalla** repetido en las N filas — y eso se ve perfectamente correcto. Es la lección que
`vmProtEOA(src)` y `valvProtDato` ya tienen escrita, resuelta acá con la variante más barata: la
función **no lee nada**, recibe los dos números ya calculados.

**NINGÚN CORTE SE MOVIÓ** — medido: `ppm` idéntico a HEAD en las seis escenas. Los de la **Tabla 7
de la ASE 2024, folio 20**, siguen siendo:

| IMC | normal | moderado | severo |
|---|---|---|---|
| **< 30** | > 0,85 | 0,66 a 0,85 | **≤ 0,65** |
| **≥ 30** | > 0,70 | 0,56 a 0,70 | **≤ 0,55** |

⚠️ **CON OBESIDAD LOS DOS CORTES BAJAN, ASÍ QUE EL MISMO INDEXADO ES MENOS GRAVE**: la tabla
tolera un área efectiva menor en un paciente con más superficie corporal. Medido: **0,60 es SEVERO
con IMC 24 y MODERADO con IMC 34**. (La primera versión de la condición de TC-479 lo tenía al
revés, y el caso lo cazó.)
⚠️ **SIN IMC SE USA LA RAMA DE < 30, QUE ES LA MÁS EXIGENTE.** Suponer obesidad sobre un paciente
sin peso ni talla sería el lado permisivo — y la rama es casi inalcanzable, porque el indexado
necesita la BSA, que sale de los mismos dos campos.

### La línea del informe y del EN SUMA

Con la forma del mitral, tal cual: sale **sólo** con desajuste **moderado o severo** —sin desajuste
no se escribe nada—, nombra la AEO indexada que lo disparó, y el **mismo texto** va al cuerpo y al
EN SUMA.

> «Desajuste protésico-paciente aórtico severo (AEO indexada 0.55 cm²/m²).»

⚠️ **ÚNICA DIFERENCIA CON EL MITRAL, Y ESTÁ DECLARADA: esta frase dice «aórtico».** El mitral no
nombra su válvula, y con las **dos** prótesis desajustadas el EN SUMA publicaría dos oraciones
idénticas que sólo se distinguen por el número. El adjetivo es lo mínimo que las separa; la forma
de la oración es la misma. `docs/PENDIENTES.md` → **Z2-1**.
⚠️ **Y ES OTRA PREGUNTA QUE LA ESTENOSIS**, así que va en su propia línea: una prótesis puede estar
obstruida sin PPM y tener PPM sin estar obstruida.
⚠️ **CON TAVI TAMBIÉN SALE**, y es correcto: la Tabla 7 **no abre ramas por tipo de prótesis** —lo
que el W2-B ya midió para la pantalla— y la TAVI, que **no** se gradúa por estenosis, sí publica
su PPM. Por eso la línea **no** cuelga de `_eaProtN.resumen`, que es `null` justamente en la TAVI.

### La columna de Excel

`PPM aórtico`, **derivada sin campo** (criterio (b) del G2): no entra en `LAB_XLS_MAP`, no se
reimporta, se declara por NOMBRE en `LAB_XLS_BLOQUES` y cae en el **bloque 8 · VÁLVULAS**, pegada a
`AVA (cm²)`. Con su fila en la hoja **Leyenda** y su origen en `LAB_XLS_CALC_ORIGEN`. El
vocabulario de la celda es **uno** (`PPM_AO_XLS_TXT`), al lado de los cortes.
Ver `docs/mapa/excel-origen-ida-vuelta.md`.

**Medido con teclas reales, seis escenas por los dos IMC (24,2 y 32,9):** imc24 → 0,55 severo /
0,67 moderado / 0,91 sin desajuste; imc33 → 0,41 severo / 0,51 severo / 0,74 sin desajuste.
**CONTROL NEGATIVO:** válvula NATIVA con el **mismo** AVA indexada de 0,55 → fila escondida, celda
**vacía** y el informe sin una sola mención.

### ⚠️ UN DEFECTO PREEXISTENTE QUE SE MIDIÓ DE PASO Y NO SE TOCÓ

La **fila de pantalla** `ea-prot-ppm` se queda en «— (requiere el AVA por continuidad y la
superficie corporal)» en escenas donde el veredicto **sí** está calculado: `_eaProtPintar` corrió
cuando `ava-idx` todavía no estaba pintado. **Medido IDÉNTICO en HEAD** en las seis escenas. La
línea del informe y la celda del Excel **no** dependen de ese nodo —leen el objeto de
`eaProtVeredicto`— así que el papel sale bien. `docs/PENDIENTES.md` → **Z2-2**.

### Z1 — los tres parámetros de la Tabla 11 siguen SIN votar: la guía no da la regla

Ver `docs/fuentes/FUENTES.md` y `docs/PENDIENTES.md` → **Z1**. En una línea: la **Tabla 11** da
bandas por parámetro, su nota `*` dice que «diagnostic accuracy is best if **most** of the
parameters listed are normal or abnormal» —una afirmación sobre la **confianza**, sin umbral de
conteo ni regla para el desacuerdo—, el **folio 24** enumera cuatro «main criteria» sin decir
cuántos hacen falta, **no hay figura de algoritmo** para la estenosis protésica mitral, y los Key
Points no agregan nada. **Sin regla explícita no se inventa una**: el veredicto queda como estaba.

---

---

## El VOTO de la prótesis mitral, el PPM de las dos y sus frases — tanda «Z5» (2026-10-15)

Cierra **Z1** (con una regla de integración que es de Maicol y no de la guía), **Z2-1** y
**Z2-2**. Lo del **DVI aórtico** y el **renglón integrado** vive en `docs/mapa/aortica-cortes.md`.

### 1 · La regla de conteo — criterio EcoSmart, declarado

| Pieza | Dueño | Qué hace |
|---|---|---|
| el umbral | `VM_PROT_OBSTR_MIN` (= 2) | dos o más positivos → significativa |
| quiénes votan | `VM_PROT_OBSTR_VOTAN` | `eoa`, `dvi`, `gmed`, `thp` — **la velocidad pico NO** |
| el veredicto | `R.obstr` dentro de `vmProtEOA` | la cascada de abajo |
| los positivos | `R.obstrPos` / `R.obstrMed` | arrays de claves, para contar y para nombrar |
| cómo se nombran | `vmProtObstrCrit(R)` | lista con el valor de cada positivo |
| la fila | `#vm-prot-obstr`, la pinta `vmProtEOAPintar` | veredicto + criterios + conteo |
| la tarjeta ⓘ | `VINFO['prot-obstr']` | la regla, la nota de la guía, los cuatro cortes |

```
n positivos >= 2  ->  'significativa'
n positivos == 1  ->  'posible'   (hallazgo aislado, NO sube al papel)
n positivos == 0  ->  ningun criterio medido ? null
                      : algun medido en banda intermedia ? 'posible' : 'normal'
```

⚠️ **CON CERO POSITIVOS EL VEREDICTO NO SE VACÍA, y es deliberado.** Lo que la Tabla 11 publica
para un parámetro en la banda del medio es literalmente *«possible stenosis»*, así que ese estado
se conserva. `null` queda **sólo** sin ningún criterio medido, que es «no se pudo evaluar» y no
«no hay obstrucción».

⚠️ **«ENTRE LOS MEDIDOS» SE LEE DEL NIVEL Y NO DEL CAMPO.** `porDvi` y `porEoa` quedan en `null`
con regurgitación significativa y `porGmed`/`porThp` fuera de banda: un criterio retirado no cuenta
ni como positivo ni como negativo, y por eso el denominador del conteo es el de los que de verdad
se pudieron leer. Medido: con IM moderada, «2 de 2» alcanza.

⚠️ **EL ORDEN DE `VM_PROT_OBSTR_VOTAN` ES EL DEL TEXTO QUE SE FIRMA**, no el de la tabla. El
informe ya publicaba «(AEO …, DVI …)» desde la Fase 2; empezar por el gradiente le cambiaría la
oración a todo estudio que hoy la emite sin que ningún veredicto se mueva.

### 2 · Qué dice la guía, y qué no

- **Tabla 11, folio 27** (folio = página 1-based + 1, comprobado en el pie impreso), leída
  **renderizando a 400 dpi** porque la fuente codifica `≥` como `$` y `≤` como `#`.
- **Folio 24, prosa**: enumera **cuatro** criterios principales —gradiente medio `>10`, THP `>200`,
  DVI `>2,5`, AEO `<1`— y **omite la velocidad pico**, que la tabla sí incluye. Ésa es la única
  diferencia entre las dos, y es la que decide quién vota.
- **Nota `*`**: la exactitud diagnóstica es mejor cuando la mayoría de los parámetros coincide. Es
  una afirmación sobre la **confianza**, no un umbral de conteo.
- **Nota `‡`**: marca velocidad pico, gradiente medio y DVI como también anormales con
  regurgitación protésica significativa. **No marca el AEO ni el THP.**
- **Ningún corte se movió**: los cuatro de la app coinciden letra por letra con la tabla.

⚠️ **PARADA DE SUB-PARTE (Z5-1): el gradiente medio NO se retira con regurgitación.** La orden
autorizaba retirarlo **sólo si** el umbral con que la app ya retira el DVI fuera «severa». Medido:
`EM_CONT_REGURG_MIN` vale **2**, o sea **moderada**. No se tocó nada del gradiente, y TC-480 lo
fija como límite declarado para que el día que se decida se note.

### 3 · El PPM: la fila y las dos frases

| Pieza | Dueño | Para |
|---|---|---|
| el texto de la fila | `ppmFilaTxt(indexada, grado, faltan, cortesAltos)` | las **dos** prótesis |
| qué falta | `ppmFaltan(hayArea, nomArea, src)` | pregunta a `getBSA`, su dueño único |
| el repintado aórtico | `eaProtPpmSync(P)` | llamado por `_eaProtPintar` **y por la cola de `calcAo`** |
| las dos frases | `ppmFrases(valv, grado, indexada)` → `{inf, suma}` | informe y EN SUMA |
| los adjetivos | `PPM_VALV` | `mitral` / `aórtico`, y la sigla del EN SUMA |

⚠️ **Z2-2 NO ERA UN PROBLEMA DE TEXTO.** Medido en HEAD con el orden del médico —los VTI primero y
el peso después—: la fila aórtica decía «requiere el AVA por continuidad y la superficie corporal»
con `eaProtVeredicto()` devolviendo `ppm:'severo'` y `avai:0.55`. `_eaProtPintar` había corrido
cuando `ava-idx` seguía en «—» y **después nadie repintaba la fila**. Por eso `eaProtPpmSync` se
llama también desde la cola de `calcAo`, que es el dueño de `ava-idx`.

⚠️ **EL MOTIVO DEL INDEXADO VIAJA CON EL VALOR** (`P.avaiMotivo`), derivado en `eaProtVeredicto`,
que es el único lugar que lee el nodo. Con el indexado marcado «(revisar)» la fila **no pide
datos**: el AVA y la superficie están los dos cargados y pedirlos manda al médico a corregir el
campo equivocado.

⚠️ **EL EN SUMA LLEVA LA SIGLA Y EL CUERPO LA FRASE LARGA** (decisión de Maicol). Lo que el EN SUMA
pierde es el valor de la AEO indexada, que sigue entero en el informe, en la fila y en el Excel.

### 4 · Las trampas medidas en esta tanda

1. **`im_grado` es un `input type=hidden`, no un `<select>`.** El ayudante `sel()` de las sondas
   busca `e.options` y devuelve un error: las cuatro escenas de regurgitación midieron el **mismo**
   grado. El gesto real es el menú de la pastilla, cuyo `onchange` llama a `valvSev.aplicar`.
2. **La opción nativa se llama distinto en cada válvula**: `vm_morf` → «Normal», `va_morf` →
   «Trivalva normal». Con el literal cableado, el control negativo midió la **prótesis anterior**
   creyendo que medía una nativa, e informó una diferencia que era suya. Se deriva de la lista.
3. **Un denominador que mira sólo el `display` del nodo no ve a sus ancestros.** `bloque-prot-vm-res`
   vive dentro de `#ete-seccion-valv-mitral`, que nace oculto: la caja informaba «visible» con el
   globo midiendo 0×0, y «no abre» se leía como «el mecanismo no funciona».
4. **`_vInfoColocar` se ancla al rect del botón y sale por su guarda sin geometría**, así que la
   pestaña tiene que estar activa antes de medir la tarjeta.
5. **Semgrep caza un error de sintaxis que `check_backticks.py` no puede ver.** Al reemplazar una
   cascada, un párrafo quedó **fuera** del comentario que lo precedía: `PartialParsing — 5 líneas`
   donde HEAD daba 127 limpio, y la sonda fallaba con «SIN GEOMETRIA diam_tsvi», que es como se ve
   un `<script>` abortado desde afuera.
6. **Toda constante nueva se lee por `window` en un caso de la suite.** TC-480 nombraba
   `VM_PROT_OBSTR_MIN` pelada y contra HEAD moría con un `ReferenceError` que se llevaba las otras
   46 condiciones. Las dos que **no** están en `window` —`EM_CONT_REGURG_MIN` y `VINFO`— existen en
   HEAD, así que ahí `typeof` alcanza.

---

## La tanda Z6 (2026-10-15) — el gradiente medio deja de votar en dos escenas

### Z6-1 · Con regurgitación protésica significativa, el gradiente medio se retira

La nota `‡` de la **Tabla 11 (folio 27)** marca **tres** parámetros —velocidad pico, gradiente medio
y DVI— y dice que también son anormales con una regurgitación protésica **significativa**. El AEO y
el THP no la llevan. Hasta el Z5 la app retiraba el AEO y el DVI y el gradiente seguía contando: era
la entrada **Z5-1** de `PENDIENTES`, declarada como límite en TC-480.

**Hoy el gradiente se retira con el MISMO dueño y el MISMO umbral que el DVI**:
`emContMotivoNoVota` (`EM_CONT_REGURG_MIN` vale 2, o sea **moderada**). Un segundo umbral acá sería
la lista paralela que este bloque ya pagó, y la pantalla diría dos cosas sobre el mismo paciente.

| escena (prótesis mecánica, AEO 1,57 · DVI 2,00 · gradiente 12 · THP 250) | HEAD | hoy |
|---|---|---|
| sin IM | significativa (2 de 4) | **igual** |
| IM leve | significativa (2 de 4) | **igual** |
| **IM moderada** | significativa (2 de 2) + línea en el informe | **posible (1 de 1), la línea SALE** |
| **IM severa** | significativa (2 de 2) + línea en el informe | **posible (1 de 1), la línea SALE** |

⚠️ **LA VELOCIDAD PICO NO SE TOCA** aunque la nota la marque: no vota —la prosa del folio 24 la
omite— así que retirarla no cambiaría ningún veredicto y sólo le quitaría al médico la banda que la
tabla sí publica. Es la entrada **Z5-2**, y la orden lo prohíbe.

### Z6-2 · Con el THP normal y prótesis MECÁNICA, el gradiente no vota estenosis

**Tabla 12, folio 28**: hallazgos sugestivos de regurgitación protésica significativa **en válvulas
mecánicas con THP normal**, y el gradiente medio `≥ 5` mmHg es uno de ellos (sensibilidad 90 %,
especificidad 70 %). El mismo número que la Tabla 11 lee como estenosis, la Tabla 12 lo lee como
regurgitación cuando el THP es normal.

| escena (mecánica, AEO 1,21 · DVI 2,60 · gradiente 12) | HEAD | hoy |
|---|---|---|
| sin THP | significativa | **igual** |
| **THP 100 (normal)** | significativa + línea | **posible (1 de 3), la línea SALE** |
| **THP 129** | significativa | **posible** |
| THP 130 (ya «posible») | significativa | **igual** — el borde separa |
| THP 250 (anormal) | significativa | **igual** |
| **biológica, THP 100** | significativa | **igual** — la Tabla 12 es de mecánicas |
| mecánica, THP 100, gradiente 4 (banda normal) | — | **no se retira**: no hay nada que reinterpretar |

⚠️ **LA ACOTACIÓN A LAS MECÁNICAS ES DE LA GUÍA Y NO DE LA ORDEN**, que no la pedía: el título de la
Tabla 12 dice «in mechanical valves». Extenderlo a las biológicas sería aplicar un corte fuera del
alcance de su fuente.
⚠️ **NO SE AGREGA NINGÚN HALLAZGO AL INFORME.** La guía propone además *decir* que eso orienta a
regurgitación; la orden lo prohíbe y queda como propuesta en `PENDIENTES` → **Y1-5**.

### Las dos filas y sus motivos

`R.gmedRetiro` viaja con el nivel y la fila lo publica: «12.0 mmHg (no concluye: …)».
⚠️ **EL MOTIVO ES PROPIO Y NO EL DE LA CONTINUIDAD.** Copiar `EM_CONT_AVISO_TXT` publicaba «AVm por
continuidad no válida con regurgitación significativa» en la fila del **gradiente**, que no se
calcula por continuidad. Hoy dice «sube igual con la regurgitación protésica significativa»
(`VM_PROT_GMED_RETIRO_TXT`) o «con el THP normal, un gradiente elevado orienta a regurgitación»
(`VM_PROT_GMED_THP_TXT`). Son textos de **pantalla**: ese renglón no viaja al informe, al PDF ni al
Excel.
⚠️ **Y `_t11Fila` GANÓ LA RAMA DEL RETIRO**: sin ella imprimía **«undefined»** al lado del número,
que es como una pantalla clínica publica un error de programa donde iba un veredicto.

### Z6-3a · La fila del PPM no pide un AEO que ya existe

Con el AEO **retirado** —por regurgitación o por un insumo fuera de banda— la fila publicaba «falta
el AEO por continuidad»: no era falso, pero «falta» se lee como «cargalo» sobre un área que sí se
midió. **Se eligió no decir nada** (la conservadora de las dos salidas de la orden): el motivo real
ya lo publica la fila del AEO dos renglones más arriba, y repetirlo serían dos filas contiguas con
el mismo texto. **El pedido legítimo se conserva**: con el AEO de verdad ausente la fila lo sigue
pidiendo, y la superficie corporal también.

### La tarjeta ⓘ describe exactamente lo que la app hace

`VINFO['prot-obstr']`, bloque «a tener en cuenta», nombra hoy **los dos retiros** del gradiente y ya
no dice «el gradiente medio sigue contando». TC-481 lo exige por los dos lados: que el texto nuevo
esté y que el viejo **no**.

---

## Los TRES cortes de la tanda «PRO» (2026-10-17) — en su propio mapa

Los commits 1 a 3 de la tanda PRO alinean tres cortes de prótesis a lo que dicen las guías, y
viven en **`docs/mapa/protesis-pro.md`** (17,6 KB):

- **PRO1 · el cociente VTI de la prótesis mitral** pasa a apoyar **sólo en prótesis MECÁNICAS con
  THP normal** (ASE 2024, Tabla 12, folio 28: su título es la condición entera). Tres regímenes
  donde había dos: con **biológica la fila no se publica**, y con mecánica fuera del THP normal se
  publica el número **pelado**. El dueño del régimen es `_ratioReg` y le pregunta a **`vmProtEOA`**,
  que ya era el dueño del `/mec/i` y del corte de THP normal (`VM_PROT_T11.thpNormalMax`, `<130` ms).
  ⚠️ **El cociente NO votaba ni vota** —no entra en `scores` ni en `params`— y **la regla de «dos o
  más de cuatro» de la obstrucción mitral no se tocó**.
  ⚠️ Y el THP pasó a ser **insumo de `calcIM_ESC`**: el recálculo se cuelga de `thpEditado`, el dueño
  del gesto. Sin eso el apoyo desaparecía en la única escena para la que existe.
- **PRO2 · la insuficiencia aórtica protésica** usa la **Tabla 8, folio 23**: jet/TSVI **≤25 % leve**
  y fracción regurgitante **≥50 % severa**, en las **tres** prótesis aórticas (la TAVI incluida,
  porque esa tabla no abre ramas por tipo y la TAVI corre la misma cascada). Los otros cuatro
  parámetros de la tabla coinciden con los nativos. El dueño es `_iaProt`, leído **una sola vez**.
  Esto deja a medias el párrafo «La insuficiencia aórtica protésica» de la sección 5 de este mapa:
  la cascada sigue siendo la nativa en todo **menos** en esos dos bordes.
- **PRO3 · el reverso diastólico de la TAVI** gradúa en **dos niveles** —`≥30` severa y `20 a <30`
  moderada— por la **VARC-3, Tabla 16, folio 1846**, que es la única fuente con cifras: la ASE 2024
  escribe «prominent, holodiastolic» sin número. La compuerta del flujo **holodiastólico** se
  conserva, porque las dos celdas de la VARC-3 empiezan con esa palabra.

⚠️ **LOS COMMITS 4, 5 Y 6 DE ESA ORDEN NO SE HICIERON**: la fuga paravalvular de la prótesis
**quirúrgica** (que es el **W1-12** de esta serie), la graduación de las prótesis **tricúspide y
pulmonar** —que hoy siguen en `PROT_SIN_GRADO_VALVS` con el texto «No graduada»— y su cobertura.
Están declarados en `docs/PENDIENTES.md` → **PRO-1 a PRO-4**, y **las seis tablas de las guías que
necesitan ya están verificadas y transcritas** en `docs/fuentes/FUENTES-protesis.md`.
