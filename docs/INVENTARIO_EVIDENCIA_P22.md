# Inventario de los sectores avanzados y del censo de textos (PANT-22, commit 1)

Documento de **solo lectura**, escrito ANTES de tocar la aplicación y medido sobre el árbol
`e727fe2` (cierre de PANT-21). El md5 de `index.html` es **`439f6bb0`** antes y después de
escribirlo: este commit no cambia una línea de la app.

Todo lo que sigue está **medido**, con `scripts/_probe_pant22inv.mjs` en el Chrome del sistema y
con grep sobre el archivo. Nada sale de memoria.

---

## 1. Los dieciséis sectores avanzados y su interruptor

El registro es **`amiloSecs()`** y es el dueño único de qué sectores avanzados existen. Tiene
**dieciséis** entradas, y las dieciséis tienen su botón «Integrar al informe» en pantalla
(`.btn-integrar[data-am-k]`), verificado una por una.

El interruptor de «va al informe» es **el mismo para los dieciséis**, así que no hay nada que
parar por `P22-b`:

| pieza | qué es |
|---|---|
| **el interruptor** | el bloque `#am-wrap-<k>` de la tarjeta de integración: visible = incluido |
| **el predicado** | **`amiloIntegrado(k)`** — `!!(w && w.style.display !== 'none')` |
| **valor por defecto** | **no incluido**: la tarjeta `#amilo-card` nace en `display:none` y los `#am-wrap-*` **no existen** hasta que `amiloBuildCard()` corre, así que `amiloIntegrado` devuelve `false` — falla **cerrado**, que es justo el lado que esta tanda necesita |
| **cómo se guarda** | el campo oculto **`#am-integrados`** (un `input type="hidden"`), que `amiloSyncBotones` reescribe en cada integrar, retirar y restaurar: `amiloSecs().filter(s => amiloIntegrado(s.k)).map(s => s.k).join(',')` |
| **cómo se restaura** | al reabrir un estudio, desde ese mismo campo |
| **qué función del informe lo lee** | **`amiloEnInforme()`**, la que arma la hoja del PDF, que pregunta por el MISMO `#am-wrap-<k>` y exige además que el texto no esté vacío; y `amiloIntegrado(k)` directo en el resto de la app |

Medido al abrir la app, con el formulario recién limpiado: los dieciséis dan
`amiloIntegrado = false` y `#am-integrados` vale la cadena vacía.

| k | rótulo | grupo | botón | integrado al abrir |
|---|---|---|---|---|
| `ett` | Score Amiloidosis por ETT | ett | sí | false |
| `alg` | Algoritmo diagnóstico | ett | sí | false |
| `hemo` | Perfil hemodinámico | ett | sí | false |
| `hfpeff` | Score HFA-PEFF (HFpEF) | ett | sí | false |
| `htp` | Probabilidad de HTP (ESC 2022) | ett | sí | false |
| `tep` | Evaluación de sobrecarga del VD | ett | sí | false |
| `vexus` | VEXUS — congestión venosa | ett | sí | false |
| `etem` | Mediciones ETE — Válvula mitral | **ete** | sí | false |
| `teer` | Criterios TEER (MitraClip / PASCAL) | **ete** | sí | false |
| `wilk` | Score de Wilkins | **ete** | sí | false |
| `oai` | Mediciones OAI | **ete** | sí | false |
| `aoete` | Mediciones Aorta (ETE) | **ete** | sí | false |
| `dpt` | Derrame pericárdico / Taponamiento | ett | sí | false |
| `cvr` | Constricción vs Restricción | ett | sí | false |
| `pop` | PostCEC — Cirugía Cardíaca | ett | sí | false |
| `conco` | Cardio-Oncología | ett | sí | false |

⚠️ **`teer` y `pop` no se dejaron integrar con la escena de la premisa**, y es correcto: las dos
declaran `hayDatos` y sin sus datos propios `amiloIntegrar` avisa y no integra. No es un sector
sin interruptor: su interruptor es el mismo y su compuerta de datos es la que ya tenían.

---

## 2. Qué sección de la Evidencia sale de qué sector

`IND_SECS` tiene **45** entradas y **ninguna** declara hoy una propiedad de sector
(`IND_SECS.filter(s => s.av != null)` devuelve la lista vacía, medido).

**Las diez secciones de un sector avanzado que la condición de aparición decide por los datos**,
con el sector al que pertenecen y qué mira hoy su compuerta:

| sección de `IND_SECS` | función | sector | su compuerta de hoy | ¿mira el interruptor? |
|---|---|---|---|---|
| Tromboembolia pulmonar — estratificación del riesgo | `_indTEP` | `tep` | `tepHayDatos()` | **NO** |
| Hipertensión pulmonar — probabilidad ecocardiográfica | `_indHTP` | `htp` | `_htp2022Core(...)` devuelve algo | **NO** |
| Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF | `_indHFPEFF` | `hfpeff` | `hfapeffScore(false)` con algún dominio cargado | **NO** |
| Ecocardiograma transesofágico — trombo en la orejuela izquierda | `_indETETrombo` | `oai` | `oai_trombo === 'si'` | **NO** |
| Reparabilidad de la válvula mitral | `_indReparMV` | `etem` | alguno de `ete_prof_coapt`, `ete_angulo_vp`, `ete_area_tenting` | **NO** |
| Ateroma aórtico — prevención | `_indAtero` | `aoete` | `ao_grado_atero` entre 1 y 5 | **NO** |
| Derrame pericárdico y taponamiento | `_indDerrPeri` | `dpt` | `dptEstado().hayDerrame` | **NO** |
| Constricción pericárdica — diagnóstico | `_indConstr` | `cvr` | `cvrEstado()` con datos propios del pericardio | **NO** |
| Congestión venosa sistémica — VExUS | `_indVexus` | `vexus` | `vexusEstado().score !== null` | **NO** |
| Perfil hemodinámico — presiones y resistencias estimadas por eco | `_indHemo` | `hemo` | alguno de los span de `calcHemo` calculado | **NO** |
| Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento | `_indConco` | `conco` | algún dato de entrada del módulo | **NO** |
| Amiloidosis cardíaca — algoritmo diagnóstico | `_indAmil` | `ett` + `alg` | algún punto del score o un espesor cargado | **NO** |
| Posoperatorio de cirugía cardíaca | `_indPOP` | `pop` | `pop_cx_tipo` o `pop_asist_tipo` consignados | **NO** |

Son **trece** secciones de sector avanzado, no diez: las nombro todas porque las trece caen bajo
la misma decisión del médico. **Ninguna mira el interruptor**, verificado integrando cada uno de
los dieciséis sectores de a uno y comprobando que la lista de secciones del panel **no cambia**.

⚠️ **Los campos de las tres de ETE viven DENTRO del sector ETE**, verificado por su contenedor en
el marcado: `oai_trombo` en `#ete-seccion-oai`, `ete_prof_coapt` en `#ete-seccion-morfo` y
`ao_grado_atero` en `#ete-seccion-aorta`. O sea que las tres son de un sector avanzado y no del
eco basal, aunque su nombre no lo diga.

**El sector `wilk` (Score de Wilkins) y el sector `teer` (Criterios TEER) NO tienen sección propia
de Evidencia**, censado sobre las 45: lo que publica los criterios TEER es la pantalla del módulo
y lo que publica el Wilkins es su propia tarjeta. No hay nada que conectar para esos dos.

---

## 3. Las secciones que NO son de un sector avanzado — **no se tocan**

Son **treinta y dos**, y varias las despiertan datos del eco basal. Esto es intencional y queda
como está, por la decisión (2) del médico:

- **Válvulas y prótesis (once)**: Estenosis aórtica, Prótesis aórtica, Insuficiencia mitral
  primaria, Insuficiencia mitral secundaria, Estenosis mitral, Prótesis mitral, Insuficiencia
  aórtica, Válvula tricúspide, Prótesis tricúspide, Estenosis pulmonar, Prótesis pulmonar.
- **Congénitas (veinte)**: Comunicación interauricular, Comunicación interventricular, Defecto
  del septo auriculoventricular, Anomalía de Ebstein, Circulación de Fontan, Conexión venosa
  pulmonar anómala parcial, Síndrome de Eisenmenger, Ductus arterioso permeable, Ventana
  aortopulmonar, Coartación de aorta, Estenosis subaórtica, Estenosis supravalvular aórtica,
  Foramen oval permeable, Miocardiopatía hipertrófica obstructiva, Miocardiopatía hipertrófica —
  prevención de muerte súbita, Válvula aórtica bicúspide — conclusión, Válvula aórtica bicúspide
  — aorta ascendente, Tetralogía de Fallot reparada — insuficiencia pulmonar, Tetralogía de
  Fallot reparada — ventrículo derecho y arritmias, Transposición de grandes arterias —
  indicaciones y seguimiento.
- **Cavidades y función (una)**: Aorta torácica — dilatación y aortopatía.

---

## 4. La premisa del médico: **REPRODUCIDA**

Medido con el gesto real —`limpiarCampos`, los campos sembrados con sus eventos `input` y
`change`, y el panel abierto por su botón `#indic-btn`—, con **TAPSE 14 mm** (`tapse`) y
**E/e′ elevado** (`onda_e` 95, `e_sep` 5, `e_lat` 7) y **nada más cargado**, y con los dieciséis
sectores **sin integrar** (`amiloIntegrado` en falso para los dieciséis, verificado después de
sembrar):

**El panel armó CUATRO secciones de sectores avanzados que el médico no incluyó:**

1. «Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF» → sector `hfpeff`
2. **«Constricción pericárdica — diagnóstico»** → sector `cvr` ← *la de la captura*
3. **«Perfil hemodinámico — presiones y resistencias estimadas por eco»** → sector `hemo` ← *la de la captura*
4. **«Amiloidosis cardíaca — algoritmo diagnóstico»** → sector `ett` + `alg` ← *la de la captura*

Las tres de las capturas **se reprodujeron las tres**, y apareció una cuarta que la orden no
nombra: el HFA-PEFF, que cae bajo la misma regla y entra en el commit 3.

⚠️ **Y el E/e′ es lo que abre tres de las cuatro**: con sólo el TAPSE no alcanza. El dato del eco
basal que las enciende es el perfil diastólico, que se carga en todos los estudios.

**Al integrar cada uno de los dieciséis sectores de a uno, la lista de secciones del panel sale
IDÉNTICA** —siete nodos `details` en los dieciséis casos, de los que cuatro son secciones y tres
son plegables internos—. O sea que hoy **incluir o no incluir un sector no cambia nada** en el
panel: la condición de aparición lo ignora por completo.

---

## 5. El censo de textos que comparan o juzgan fuentes

Hecho por dos caminos, porque ninguno solo alcanza:

- **sobre el DOM abierto** del panel de Evidencia, con las cuatro secciones de la premisa y
  **todos** sus `details` abiertos (los «Ver detalle» y las bibliografías): **30.793 caracteres**
  revisados, que es el denominador declarado;
- **sobre las cadenas literales del archivo**, contando comillas para quedarse sólo con lo que
  está DENTRO de una cadena. ⚠️ **El grep crudo no sirve**: con los mismos patrones devuelve
  **469** líneas y la enorme mayoría son comentarios, que en esta casa van sin pulir a propósito.
  Con el filtro de comillas quedan **89** cadenas, que son las que el médico puede leer.

### 5.1 SE REESCRIBE — Hemodinámica y prótesis mitral (commit 4)

Las tres cadenas que la orden nombra y las de su misma clase en esas dos secciones:

| # | ubicación | texto exacto de hoy |
|---|---|---|
| 1 | nota `[5]` de la sección Hemodinámica (`_indHemo`) | «Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos, **de modo que el 2,2 justo cae de un lado distinto del que resuelve la clasificación original. Del otro lado coincide: la congestión aparece cuando la presión capilar supera 18, así que el 18 exacto tampoco está definido acá.**» |
| 2 | ⓘ del índice cardíaco (`_indHemo`) | «el rango de referencia normal es 2,5 a 4,0 L/min/m² (ESC/ERS 2022 de hipertensión pulmonar, tabla de valores hemodinámicos normales, folio 30). **El «2,2 o menos» con que la aplicación lo llama bajo sale de la columna del Shock Trial de la Tabla 1 del consenso argentino de shock cardiogénico (folio 2), que es una tabla comparativa de definiciones. La tabla de fórmulas del folio 162 de la guía de corazón derecho no publica el índice cardíaco:** dividir el gasto por la superficie corporal es la definición del indexado.» |
| 3 | ⓘ de la resistencia vascular sistémica (`_indHemo`) | «**los dos libros de referencia no coinciden en un rango único, y por eso** la aplicación publica el número sin banda: 1.170 ± 270 dinas-seg-cm⁻⁵ en una tabla cuyo pie aclara que es la media y la desviación estándar de 37 sujetos sin cardiopatía demostrada —no un intervalo de normalidad— (Tabla 11.2, folio 260), y 1.100 con intervalo de 700 a 1.600 en la otra (Tabla 19-3, folio 375).» |
| 4 | `_indProtM`, bloque del desajuste | «**Las dos definiciones de desajuste protésico-paciente mitral de la misma guía no coinciden.** El texto define moderado por debajo de 1,2 cm²/m² y severo hasta 0,90 cm²/m², sin estratificar por IMC. La Tabla 7 sí estratifica: con IMC menor de 30, normal por encima de 1,2 y severo hasta 0,90; con IMC de 30 o más, normal por encima de 1,0 y severo hasta 0,75.» |
| 5 | `_indProtM`, línea siguiente | «La calculadora de esta aplicación aplica la TABLA 7, la estratificada por IMC. **Para un IMC de 30 o más las dos versiones se contradicen: una AEO indexada de 1,1 cm²/m² es moderada por el texto y normal por la tabla.**» |
| 6 | `_indProtM` | «**Y hay una tercera voz:** la ESC/EACTS 2025 dice que se sabe poco sobre la prevalencia y las consecuencias del desajuste en posición mitral, y que «faltan definiciones establecidas». El desajuste es un hallazgo, no una indicación: no tiene fila en la tabla de recomendaciones.» |
| 7 | `_indProtM` | «La ACC/AHA 2020 **coincide con la europea** en la estenosis protésica sintomática severa: reintervención quirúrgica indicada, Clase 1 · Nivel B-NR, salvo riesgo alto o prohibitivo. Su fila de valve-in-valve percutáneo está escrita para la prótesis AÓRTICA y no se aplica acá.» |

Las **siete son reescribibles sin contenido nuevo**: cada una ya trae lo que cada fuente afirma
con sus números y, donde la cita va por corchete, con su referencia. Lo que sale es la oración o
la parte que compara.

**Son preexistentes.** Las de Hemodinámica las escribió la **tanda J2** (24/10/2026) y las ajustó
el **C2** (28/10); las de la prótesis mitral las escribió **PANT-21** (07/11/2026), que ya las
declaró como preexistentes de su propia tanda en su reporte.

### 5.2 SE REESCRIBE — el resto del censo (commit 5)

| ubicación | forma |
|---|---|
| ficha de Referencias del tracto de salida del VD | «Los techos de normalidad **difieren** de los de la guía de 2025 —33, 34 y 29 milímetros—, **y la diferencia se muestra sin resolver**.» |
| `_indProtA` (prótesis aórtica) | «La ACC/AHA 2020 **coincide con la europea** en la estenosis protésica sintomática severa…» |
| nota de un criterio de prótesis | «**Coincide con la europea y con mejor nivel de evidencia** (B-NR contra C), acotada a…» |
| Válvula tricúspide | «**Y discrepan en la auricular:** la ESC/EACTS 2025 considera…; la ACC/AHA 2020 la considera sólo con…» |
| cuatro títulos de bloque de congénitas | «Las diferencias entre las dos guías, **sin resolver**» / «La diferencia entre las dos guías, **sin resolver**» |
| DSAV, CIA, CIV (tramos) | «con 60 exactos las dos guías **no coinciden**…», «con un Qp:Qs de 1,5 exacto las dos guías **no coinciden**…» |
| CIV | «**La guía no coincide consigo misma**, así que acá no se fija ningún corte» |
| Aorta / bicúspide | «Las dos **coinciden** en el número y **difieren** en el nivel de evidencia.» |
| Fallot reparada — insuficiencia pulmonar | «es como las dos guías definen la insuficiencia pulmonar y **no coinciden**…» |
| Fallot reparada — ventrículo derecho | «**Las dos guías no piden lo mismo: difieren** en qué llaman disfunción valvular pulmonar…» |
| Estenosis subaórtica | «⚠️ **Las dos guías no gradúan igual:** … **y la diferencia se muestra sin resolver**» |
| Estenosis subaórtica | «⚠️ **Y no coinciden en el seguimiento:** …» |
| Constricción pericárdica | «criterio de EcoSmart: … **Ninguna guía de la biblioteca publica un recuento así**, y por eso esta fila no lleva cita.» |
| Reparabilidad de la válvula mitral | «**Ninguna fuente de la biblioteca publica** cifras equivalentes de reparabilidad para la primaria…» |
| Miocardiopatía hipertrófica — muerte súbita | «La edición leída acá es la de 2024, que **coincide con lo que la app aplica**…» |

⚠️ **Varias de éstas están en secciones de congénitas y de válvulas.** La decisión (2) del médico
protege **el comportamiento** de esas secciones —que aparezcan como hoy—, no sus textos: la
decisión (3) dice que los textos se reescriben donde estén. Las dos no se contradicen.

### 5.3 PARÁ — no caen bajo la regla, y quedan como están

La regla del 04/11 excluye expresamente tres cosas, y cada una de éstas es una de ellas:

- **lo que una fuente dice de SÍ MISMA**: «Pieske 2019 es un documento de consenso y **no publica
  clase ni nivel de evidencia** para estos pasos»; «Es un libro de texto: **no publica clase ni
  nivel de recomendación**»; «el documento de posición **no publica esa escala** para ellos»; «Su
  nota al pie c advierte que el nivel de evidencia difiere del de la guía ESC 2020… porque el
  número de pacientes… fue muy bajo». Las cuatro son además **avisos que evitan un error**: que
  nadie busque una clase que esa fuente no publica.
- **lo que la aplicación dice de sí misma y de su propia biblioteca**: «el artículo de 1976 no
  está en la biblioteca de este repositorio»; «esta aplicación publica el número sin banda».
- **dos mediciones del paciente que difieren**: la discrepancia del grado fijado a mano contra el
  calculado, el aviso de 3 mm o más entre dos diámetros, «Discrepancia con Válvulas», la serie
  congelada contra el seguimiento, «No coinciden con lo cargado en el estudio».

Y quedan afuera por no ser texto que el médico lea o por estar fuera de alcance:

- los `console.error` y `console.warn` (no los ve nadie en pantalla);
- los avisos de operación: «No se encontró ese estudio guardado», «No se encontró el campo FEVI»,
  «Ningún estudio coincide con los filtros activos» — no hablan de ninguna fuente;
- **el Laboratorio**, que la orden pone fuera de alcance: «Los denominadores DIFIEREN entre
  medidas…», «el ajustado difiere porque…», «la banda E/A 0,8-2,1 sin E/e′, que la guía deja sin
  resolver».

---

## 6. Los casos existentes que vigilan esto

Censo sobre `scripts/test_clinico.mjs`:

| caso | qué afirma | por qué lo toca esta tanda |
|---|---|---|
| **TC-322** | recorre `IND_SECS` entera y exige **un escenario por sección** que la abra | con el cambio, una sección de sector avanzado no abre sin su inclusión: su escenario tiene que incluir el sector |
| **TC-533** | el conteo de `IND_SECS` (45) | no cambia: esta tanda no agrega ni quita secciones |
| los que cuentan preguntas, citas o globos de las trece secciones | conteos de inventario | hay que correrlos: si una sección deja de abrir en su escenario, su conteo cae |

El censo exacto de cuáles son se corre **antes** de la suite, que es lo que la lección (j) manda.
