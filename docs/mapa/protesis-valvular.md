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


## 8 · Lo que vive en otros mapas

Este mapa se **partió el 2026-10-17** (tanda PRO-B, commit 1): estaba en **34,2 KB**, a 754 bytes
del techo de 35 KB, y la tanda de la fuga paravalvular lo cruzaba. Se midió con `wc -c` **ANTES**
de escribir, que es lo que este repositorio pide y lo que varias particiones anteriores tuvieron
que hacer DESPUÉS de cruzar. Quedó en 15,0 KB antes de recibir este puntero.

- **Las tandas Z, Z5 y Z6** —el PPM aórtico que entra al informe y gana su columna, el voto de los
  cuatro criterios de obstrucción de la prótesis mitral con su regla de conteo, las dos frases del
  PPM, y los dos retiros del gradiente medio— están en **`docs/mapa/protesis-z-z5-z6.md`**
  (20,4 KB), completas y sin cambios.
- **Los TRES cortes de la tanda PRO** (2026-10-17) están en **`docs/mapa/protesis-pro.md`**
  (17,6 KB): el cociente VTI de la prótesis mitral, que apoya **sólo en mecánicas con THP normal**
  (ASE 2024, Tabla 12, folio 28); la insuficiencia aórtica protésica con la **Tabla 8, folio 23**
  —jet/TSVI **≤25 %** leve y fracción regurgitante **≥50 %** severa, en las tres prótesis
  aórticas—; y el reverso diastólico de la TAVI en **dos niveles** por la VARC-3, Tabla 16,
  folio 1846.
  ⚠️ Eso deja a medias el párrafo «La insuficiencia aórtica protésica» de la sección 5: la cascada
  sigue siendo la nativa en todo **menos** en esos dos bordes.
- **La FUGA PARAVALVULAR de la prótesis quirúrgica** —aórtica y mitral— está en
  **`docs/mapa/protesis-fuga-pvl.md`**: el motor único con su fuente inyectable, los tres campos
  nuevos de la aórtica, la marca de origen de la mitral y por qué la Tabla 13 no ofrece extensión
  circunferencial.

---

## La tanda «PRO-C» (2026-10-17) — las prótesis TRICÚSPIDE y PULMONAR se gradúan

**Está en `docs/mapa/protesis-tri-pulm.md`** (15,1 KB). Lo que hay que saber desde acá:

- Las dos válvulas que publicaban `PROT_SIN_GRADO_TXT` y nada más tienen hoy un **veredicto
  protésico propio**, con el MISMO reparto que la mitral: la fila de «Severidad sugerida» sigue
  diciendo `PROT_SIN_GRADO_TXT` —es literalmente cierto— y el veredicto vive en su propia
  cápsula. **`calcET` y `calcVP` no cambiaron una línea.**
- **Tricúspide — ASE 2024, Tabla 19, folio 36:** cinco criterios con umbral único por tipo
  (bioprotésica / mecánica), **sin graduar**. El AEO es el único con operador `<`. El DVI se
  retira «in the absence of AR or TR» leyendo `EM_CONT_REGURG_MIN`.
- **Pulmonar — ASE 2024, Tabla 15, folio 33:** dos criterios por tipo (bioprótesis /
  homoinjerto). ⚠️ **ESA TABLA NO TIENE COLUMNA DE SEVERA**: el único veredicto positivo es
  «posible obstrucción» y la app no puede afirmar «severa» por ese camino. Tres estados no
  gradúan y cada uno dice por qué: mecánica, percutánea y el tipo sin elegir.
- **La REGURGITACIÓN de las dos no se movió**: las Tablas 21 (folio 39) y 16 (folio 34) coinciden
  con lo que la app aplica, medido con el grado idéntico en nativa y en las dos prótesis.
- **Tres campos nuevos y CERO columnas de Excel**: `et_e_vmax`, `vp_tipo_prot` y `ep_gmedio`.
- Cobertura: **TC-498**, 47 condiciones, 34 en rojo contra el inicio de la tanda.

## Las TARJETAS ⓘ de las válvulas — están en otro archivo

Las ocho tarjetas de lesión (una arriba de cada pastilla selectora de severidad), la de la función
diastólica y la de la fuga paravalvular aórtica están en
**`docs/mapa/valvulas-tarjetas-info.md`** (tanda «Q», 2026-10-17): el mecanismo reusado de L y de
M, los dos dueños de donde sale todo (`_v2dPastilla` y `_v2dPorQue`), la tabla `QV_BARRA` con la
constante dueña de cada corte, la cosecha de fuentes, la frase de integración y diez trampas.

⚠️ Es **solo presentación**: ni un corte, ni un operador, ni una regla, ni un texto del informe,
del EN SUMA, del PDF, del PPT o del Excel. A/B contra el inicio de la tanda: **cero diferencias**.

---

## ⚠️ La tanda E bajó los dos bloques protésicos de la MITRAL (27/10/2026)

`bloque-prot-vm` (el DVI) y `bloque-prot-vm-res` (las siete filas de la Tabla 11) vivían **entre**
los cajones de grado de las dos lesiones y el envoltorio `#vm-lesiones`. Hoy van **debajo** de él.
Medido: y = 429 y 437 contra y = 1306 y 1314, con los dos cuadros de referencias en 729 y 809.

**La aórtica NO tenía el mismo problema**: `bloque-prot-va` ya vive **dentro** de
`#caja-esten-aortica`, y sus filas protésicas (`ea-det-*`) en ese mismo cuadro — la decisión del
CORTOS2 que la mitral no había seguido. Del lado aórtico no se tocó nada.

**`docs/mapa/e-carpentier-tricuspide-orejuela.md` § 5.**
