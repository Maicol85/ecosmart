# EcoSmart — pendientes vivos


## Censo W1 · PRÓTESIS mitral y aórtica (2026-10-15) — DECLARADO y NO arreglado

> El censo completo, con sus tablas, sus folios y sus mediciones, vive en
> **`docs/censo/protesis_valvular.md`**. Acá quedan sólo los hallazgos y el orden sugerido.
> ⚠️ **El W1 fue de SOLO LECTURA sobre el código**: no se tocó `index.html`, ni `scripts/`, ni los
> casos de la suite. Lo que sigue lo implementa el W2, con lo que decida Maicol.
> ⚠️ **No se tocó ningún mapa de `docs/mapa/`**: `valvulas.md` está en 27,6 KB y
> `valvulas-mitral-pantalla.md` en 15,9 KB, los dos con margen, pero la orden del W1 prohíbe
> escribir fuera de `docs/censo/` y de este archivo. **El W2 que toque la estenosis mitral
> protésica tiene que medir con `wc -c` antes de agregarle una sección a cualquiera de los dos.**

### [CERRADO 2026-10-15 · W2-A] W1-1 · `calcTHP()` salía temprano sin llamar a `calcEM()`

> **CERRADO.** `calcTHP()` llama a `calcEM()` también en su salida temprana del THP vacío. Los
> cinco nodos vuelven a su estado inicial, la pastilla se apaga y suelta su clave y su dueño, el
> informe pasa a «sin estenosis ni insuficiencia» y el EN SUMA a la frase de normalidad, con el
> Excel exportando el centinela. **El grado fijado a mano se respeta** por la puerta de siempre.
> Cobertura: **TC-473** (bloque A). Mapa: `docs/mapa/valvulas-borrado.md` → sección 6b.
> ⚠️ **Al medir, los DOS gestos de borrado dan resultados distintos** y los dos están en el arnés:
> dígito por dígito el paso intermedio recalcula con un THP fuera de banda y deja `avm_idx` en
> `121.00 cm²/m² (revisar)`; de una vez queda rancio todo, el grado incluido.

### El defecto, como se midió

Es el defecto que reportó Maicol, y es **mayor** que lo reportado. Con el THP como única fuente de
área, borrarlo con teclas reales deja `avm_thp`, `em_avm_thp_display` y la fila del cuadro limpios,
pero **cinco** nodos rancios: `em_grado` (que se queda en `severa`), `avm_idx`,
`#em-sev-integrada`, `#em-clase-thp` y `#em-thp-badge`.

**Y llega al papel.** Medido en los tres estilos: el informe pasa de «con estenosis significativa
(AVm 1.38 cm² por THP)» a «con estenosis **significativa**», o sea **conserva la afirmación y
pierde el número que la sostenía** —el paréntesis sale de `emCategoria()`, que es pura y se
recalcula sola; la afirmación sale de `em_grado`, que nadie reescribe—. El EN SUMA sigue diciendo
«EM significativa.» y el Excel exporta `em_grado = severa`.

**Causa:** `calcTHP()` hace `if (!thp) { setv('avm_thp',''); emThpSalidasLimpiar(); return; }`
**antes** del `calcEM()` que tiene al final. El `else` que vacía `avm_idx` (agregado el 2026-10-09)
**existe y es correcto**: lo que falla es que nadie lo ejecuta.

**Es el ÚNICO campo con ese patrón, y está medido.** Censo de **doce** campos editables de los dos
bloques, cargados y borrados uno por uno con teclas reales: el THP deja cinco rancios y los otros
once (`avm_plan`, `em_vtimit`, `em_dtsvi`, `em_vtitsvi`, `em_gmedio`, `vmax_ao`, `gmedio_ao`,
`itv_ao`, `ea_dtsvi`, `ea_vtitsvi`, `ava_plan`) **cero**. Tres controles negativos limpios: borrar
la planimetría y borrar el VTI mitral limpian todo; borrar el **peso** limpia sólo `avm_idx`, que
es el comportamiento deliberado de `_emAvmiSinBSA`.

**Esfuerzo: chico.** No necesita columna de Excel ni tocar el Laboratorio.

### [CERRADO 2026-10-15 · W2-A] W1-2 · El Laboratorio contaba «Sin estenosis» lo que el informe llama «Gradiente elevado»

> **CERRADO con una línea:** `gmElev` dejó de estar gateado por `gradCuenta`. Lo que sigue gateado
> es `porGrad`, la banda que **afirma** estenosis (`≥ 10`), que es el mismo reparto de
> `emCategoria`. Cambian **cuatro** estudios de `sin` a `grad_elev` —gradiente `≥ 5` con IM
> moderada o severa— y **ninguna otra categoría se mueve**: siguen siendo seis, siguen siendo
> excluyentes, su suma sigue dando el total de estudios con dato (11 de 11), y las dos casillas
> del filtro quedan iguales. **Sin columna nueva y sin categoría nueva.**
> Cobertura: **TC-473** (bloque C) y **TC-469** adaptado en su condición (11).
> Mapa: `docs/mapa/laboratorio-estenosis-mitral.md` → «⚠️ W1-2».
>
> **ALTERNATIVAS CONSIDERADAS Y DESCARTADAS, con el motivo:**
> 1. **Una SÉPTIMA categoría** («gradiente elevado con insuficiencia mitral significativa»): diría
>    la causa en voz alta, pero suma una barra al gráfico, una fila a la mini-tabla del PDF de
>    auditoría y una entrada al PPT, obliga a adaptar TC-469 —que cuenta seis— y toca
>    `_labHallazgosCuenta`, que **corta en ocho** (X5). Más invasiva y con más superficies.
> 2. **Renombrar `grad_elev`** para que diga lo mismo que el papel: movería el rótulo también para
>    los estudios **sin** IM, que es el caso para el que ese nombre se escribió.
> 3. **Dejar la categoría `gradiente_im` de `emCategoria` entrar al Laboratorio tal cual**: exige
>    poder llamar a `emCategoria()` sobre un registro archivado, y esa función **lee el DOM**
>    (`v(id)`, `protNoGradua`). Era el camino largo y ya estaba descartado por el diseño de
>    `_labEmLectura`.
> **Queda declarado** que el rótulo dice «No significativa con gradiente elevado» mientras el
> informe de esos estudios dice sólo «Gradiente transmitral elevado».

### El defecto, como se midió

`_labEmLectura()` **sí respeta** la excepción de la IM —llama a `emImSignificativa()` y
`gradCuenta = !imSig`—, y los conteos por área están bien: con IM severa el **área sigue votando**
(AVm 1,2 → `sig_area_15`), la prótesis y el estudio sin datos quedan fuera de todas las categorías.

Pero `gmElev` **también** está gateado por `gradCuenta`, así que la categoría
`grad_elev` («No significativa con gradiente elevado») **existe y no se alcanza** cuando hay IM
significativa. Resultado medido sobre estudios armados: un estudio con gradiente 12 mmHg e IM
moderada o severa clasifica como **«Sin estenosis»**, mientras su informe firmado dice
**«Gradiente transmitral elevado»**. Es el espejo del defecto que la tanda B3 vino a evitar: allí
se evitó sobre-afirmar, acá quedó una **sub-afirmación**.

⚠️ **Si se agrega una categoría, mirar `_labHallazgosCuenta`, que corta en OCHO** (X5).

### [CERRADO 2026-10-15 · W2-B] W1-3 · El cuadro de referencias de la EM publica cortes NATIVOS sobre una prótesis

> **CERRADO.** Las cuatro filas DECLARAN que el corte nativo no aplica (`EM_CUADRO_PROT_TXT`, y
> la del THP con `EM_CUADRO_PROT_THP_TXT`, que nombra el folio 10). Dueño: `_emCuadroEsProt()`,
> consultado por `_emCuadroFila` y `_emCuadroGm` **antes** de la casilla y de la banda. **Los
> cuatro VALORES no se tocan** —marcar sin borrar—. Se eligió DECLARAR y no traducir: publicar
> acá los cortes de la Tabla 11 dejaría el gradiente y el área por continuidad leídos DOS veces
> en la misma pestaña, que es el defecto que esto cierra. Cobertura: **TC-474**, bloque (C).


Medido con las dos prótesis mitrales: las tres filas de área rotulan «· significativa
(≤1,5 cm²)» y la del gradiente «· significativo (≥10 mmHg)», **a dos centímetros** de la cápsula
que dice «No graduada: los cortes de válvula nativa no aplican a prótesis» y de la que lee **la
misma continuidad** como «posible obstrucción» con el corte de la ASE 2024. Dos lecturas del mismo
número en la misma pantalla.

El patrón para arreglarlo **ya existe en el archivo**: `imCortesPintar()` conmuta el jet/AI
preguntando a `_imVmProt()` en un `try`, y publica los DOS regímenes si no puede decidir.

### [CERRADO 2026-10-15 · W2-B] W1-4 · La fila del AVA del recuadro Doppler aórtico, con prótesis

> **CERRADO.** `_eaPintarRecuadroDoppler` pregunta por la MORFOLOGÍA aórtica —no por
> `_bloqueado`, que también es cierto con una prótesis normal— y reemplaza el badge por la
> declaración de que el área no gradúa una prótesis. El número no se pierde: lo sigue
> publicando la fila «AVA continuidad». Medido en las TRES morfologías protésicas y con el
> control nativo idéntico a HEAD. Cobertura: **TC-474**, bloque (D).


Medido en las **tres** morfologías protésicas: `#ea-sev` publica «— no se gradúa con estos datos —
ver el aviso del cuadro de Estenosis Aórtica» y **justo debajo** «Severa (≤1.0cm²)». El comentario
de `_eaPintarRecuadroDoppler` lo declara («la línea del AVA se sigue pintando: ese badge tiene sus
propias guardas»). La **Tabla 5 de la ASE 2024 no usa ningún corte absoluto de AVA** en prótesis.
**Esfuerzo: chico.**

### [CERRADO 2026-10-15 · W2-B, en pantalla] W1-5 · El PPM AÓRTICO no se calcula

> **CERRADO en pantalla.** `EA_PROT_PPM_CORTES` implementa la **Tabla 7, folio 20** con su rama
> de IMC (>0,85 / ≤0,65 con IMC<30; >0,70 / ≤0,55 con IMC≥30), `eaProtVeredicto` lo calcula
> leyendo `ava-idx` —no recalcula el cociente— y `_eaProtPintar` publica la fila
> `#ea-prot-ppm-row` con las TRES prótesis, TAVI incluida. Medido por sus tres tramos y sus dos
> bordes, con la rama de IMC discriminando sobre el MISMO AVA. La línea del PPM de la ayuda
> `#ref-pao` se reescribió con los cortes de la Tabla 7 y su folio.
> ⚠️ **LO QUE QUEDA ABIERTO ES EL INFORME: ver Z2.** Y **no se agregó ninguna columna de
> Excel**: el libro sigue en 436.


`VM_PROT_PPM_CORTES` implementa la **Tabla 7, folio 20** para la mitral con su rama de IMC
(>1,2 / ≤0,90 con IMC<30; >1,0 / ≤0,75 con IMC≥30), y está verificado contra la imagen del PDF.
**Para la aórtica no hay nada**: sólo un texto de ayuda estático (`#ref-pao`) atribuido a
«ESC 2021 · VARC-3» que dice «AVAi >0.85 normal · 0.65–0.85 mod · <0.65 severo», **sin la rama de
IMC** que la Tabla 7 publica (>0,85 si IMC<30, >0,70 si IMC≥30; severo ≤0,65 / ≤0,55).

Medido: con AVAi **0,40 cm²/m²** —que por la Tabla 7 es PPM severo— la app **no dice nada de PPM**
en ninguna superficie. El AVAi ya se calcula (`ava-idx`) y el patrón está escrito (`vmProtEOA`).
⚠️ **Si se quiere en el libro, es una columna nueva** (hoy 436).

### [CERRADO 2026-10-15 · W2-B] W1-6 · Falta la banda intermedia del AEO protésico mitral

> **CERRADO.** `VM_PROT_EOA_NORMAL_MIN = 2.0` y `porEoa` con sus TRES tramos. Medido: AEO 1,57
> pasa de «sin criterios de obstrucción» a «posible obstrucción», el borde de **1,00 exacto**
> también —significativa sigue siendo menor-estricto que 1— y **2,00 exacto es normal**. No
> cambia el informe firmado: ése sólo publica con `obstr === 'significativa'`. El panel de
> Evidencia también publica la banda del medio. Cobertura: **TC-474**, bloque (B).


`porEoa` tiene dos tramos: `< 1,0` significativa y todo lo demás «normal». La **Tabla 11, folio
27** tiene **tres**: `≥2,0` normal, **`1-2` posible**, `<1` significativa. Medido: EOA **1,50 cm²**
con DVI 2,10 publica «sin criterios de obstrucción», donde la guía dice «possible stenosis».
No sobre-afirma —**sub-afirma**— y es **un tramo más** en una expresión que ya existe.

### [CERRADO 2026-10-15 · W2-A, en lo que la orden autorizaba] W1-7 · La continuidad mitral y el ritmo

> **CERRADO el AVISO, que es lo que la orden autorizaba.** `EM_CONT_FA_TXT` en
> `#em-cont-fa-aviso`, ámbar (`--orange`, medido `rgb(245,158,66)` de noche y `rgb(217,123,31)` de
> día), sale cuando el ritmo efectivo es fibrilación auricular **y** hay un AVm por continuidad
> calculado, y **se suma** al motivo de IM/IAo sin pisarlo. Dueños: `emContRitmoFA(src)`,
> `emContAvisoFA(src)` y `emContFaAvisoSync`. El ritmo entra **por `src`**, repitiendo la cascada
> de `hfRitmoEfectivo()`. Tres columnas: `calcEM`, un oyente de documento sobre `diast_ritmo` y
> `hf_ritmo`, y `RECALC_MODULOS`.
> Cobertura: **TC-473** (bloque B). Mapa: `docs/mapa/valvulas-mitral-pantalla.md` → sección 5b.
> Fuente: `docs/fuentes/FUENTES.md` → «Continuidad mitral», folio **14** comprobado en el pie
> impreso. La ESC/EACTS 2025 **no lo contradice** (censado el PDF completo).
>
> ⚠️ **LO QUE SIGUE ABIERTO ES EL VOTO, Y ES CONTENIDO CLÍNICO — es D1-4.** El área por continuidad
> **sigue votando** en fibrilación auricular: el grado, el informe, el EN SUMA, el PDF, el PPT, el
> Laboratorio y el Excel salen idénticos en los dos ritmos, y eso está medido. Retirar el voto es
> decisión de Maicol y sería otra tanda; el lugar es la misma función
> (`emContMotivoNoVota`), que ya tiene el predicado del ritmo escrito al lado.
> ⚠️ **Y NINGÚN CONSUMIDOR PASA `src` HOY**: la rama existe para que el día que el Laboratorio o el
> Excel pregunten por esta salvedad no divergan de la pantalla. Es código declarado, no muerto por
> descuido.

### El defecto, como se midió

Medido con un gesto real sobre `#diast_ritmo`: el área por continuidad vota **idéntico** en ritmo
sinusal y en fibrilación auricular (`avm_cont = 1.26 cm²`, `em_grado = severa` en los dos), con
`#em-cont-aviso` **vacío en los dos**, y `hfRitmoEfectivo()` devolviendo `rs` y `fa` correctamente
—o sea que **el dato está y nadie lo consulta**—. La **EAE/ASE 2009, folio 14, §B.1.4** dice que la
ecuación de continuidad **no puede usarse** en fibrilación auricular.

**Dónde iría:** `emContMotivoNoVota()` es el dueño único del motivo y `#em-cont-aviso` la
superficie; el ritmo sale de `hfRitmoEfectivo()` / `#diast_ritmo`, que tiene exactamente dos
opciones. **No hace falta ningún campo nuevo.**

⚠️ **PERO `emContMotivoNoVota(src)` TIENE FUENTE INYECTABLE**, porque la consumen el Laboratorio y
la fila del Excel sobre `inf.campos` de un estudio archivado. El ritmo tiene que entrar **por
`src`**, igual que `im_grado` e `ia_grado`: leyéndolo del DOM, la pantalla y el libro dirían cosas
distintas sobre el mismo paciente.

### [CERRADO 2026-10-15 · W2-B] W1-8 · El THP con rótulo nativo sobre una prótesis

> **CERRADO.** El THP es ahora un **parámetro directo** con sus tres tramos de la Tabla 11
> (`<130` / `130-200` / `>200`), publicado en la cápsula, y el cuadro de referencias declara
> que ese MÉTODO no calcula el área de una prótesis, con el folio 10. El valor del área por
> THP se sigue mostrando: marcar sin borrar. Cobertura: **TC-474**, bloques (A) y (C).


Medido: con prótesis mitral el cuadro muestra «AVm por THP 1.38 cm² · significativa (≤1,5 cm²)».
La **ASE 2024, folio 10**, dice que el EOA calculado por el método del THP es **frecuentemente
inexacto y sobreestima** el área, y que el EOA indexado de una prótesis mitral se calcula mejor
**por la ecuación de continuidad** —que es, correctamente, lo que `vmProtEOA` ya hace—. El THP en
prótesis es un **parámetro directo**: `<130` / `130-200` / `>200` ms (Tabla 11, folio 27).
Conviene hacerlo junto con **W1-3**.

### [CERRADO 2026-10-15 · W2-B] W1-9 · La velocidad pico de E y el gradiente medio protésicos

> **CERRADO.** `VM_PROT_T11` y `_vmProtNivelT11`, con los tres operadores que la tabla imprime
> distintos entre sí. Medido por sus SEIS bordes con teclas reales, más el control negativo de
> la morfología nativa y el de fuera de banda. `PROTM_EST_2024` pasa a DERIVAR de esas
> constantes, así que el panel de Evidencia y la cápsula no pueden divergir.
> ⚠️ **LOS TRES NO VOTAN EN EL VEREDICTO: ver Z1.**


Los dos campos existen (`em_vmax` en m/s, `em_gmedio`) y **ninguno se evalúa con el corte
protésico**. Tabla 11, folio 27: velocidad pico `<1.9` / `1.9-2.5` / `≥2.5` m/s; gradiente medio
`≤5` / `6-10` / `>10` mmHg. ⚠️ **Los dos bordes del gradiente difieren del nativo por el
operador**: en nativa la app usa `<5` / `5-9` / `≥10` (ASE 2023), así que a **5 y a 10 exactos** el
veredicto se invierte entre los dos regímenes.

### [CERRADO 2026-10-15 · W2-B] W1-10 · La atribución de la IM protésica

> **CERRADO.** Las tarjetas `im-vc`, `eroa-pisa` y `eroa-cont` citan la **ASE 2024, Tabla 13,
> pág. 30** para la prótesis y publican su nota: esos parámetros cuantitativos están **menos
> validados** que en la IM nativa. El «a tener en cuenta» de `im-vc` dejó de decir que ninguna
> guía leída publica un corte propio para prótesis, que era falso desde que se leyó la Tabla 13.
> **Ningún número cambió**: los cuatro cortes coinciden con los nativos.


⚠️ **La nota del 09/10 es literalmente cierta y clínicamente INOCUA en cuatro de sus cinco filas**,
y conviene que quede escrito para que nadie la reabra como defecto. Vena contracta, EROA, Vol-R y
FR **no** preguntan por `_imVmProt()` —aplican el camino nativo— pero la **ASE 2024, Tabla 13,
folio 30, publica exactamente los mismos números** que la ASE 2017, Tabla 8, folio 332: VC
`<0,3`/`≥0,7` cm, EROA `<0,20`/`≥0,40` cm², Vol-R `<30`/`≥60` ml, FR `<30`/`≥50` %. La onda S dice
lo mismo con otras palabras. **Ningún paciente cambia de grado.** Lo único que la Tabla 13 pide
distinto es el **área del jet**, y eso la app **ya lo conmuta** (`IM_CORTES.jet_prot`, 20 y 50 %),
igual que el cociente VTI (`≥2,5`, Tabla 12 folio 28).

Lo que falta es **la fuente que se cita**: con la mitral protésica, la tarjeta ⓘ y el manual
deberían nombrar la Tabla 13 y su nota `††` —«estos parámetros cuantitativos están **menos
validados** que en la IM nativa»—, que hoy no aparece en ninguna superficie.

### [DECIDIDO 2026-10-15 · W2-B — el número NO se mueve] W1-11 · El jet/AI NATIVO usa `>40 %`

> **DECISIÓN DE MAICOL (15/10/2026): el corte NO cambia.** Nativa por encima del 40 % y
> prótesis por encima del 50 % siguen siendo severa. Lo que se corrigió es el **RÓTULO de la
> fuente** en las dos superficies que lo publicaban —la fila «Ratio jet/AI (%)» de
> «Referencia clínica» y la tarjeta `im-jet-ai`—, que atribuían a la ASE 2017 un corte que
> esa guía no escribe, más el comentario de `IM_CORTES.jet_nat`. Y se VERIFICÓ que con
> prótesis un jet por encima del 50 % cuenta como criterio de severidad: 51 % y 60 % dan
> `im_grado = 4`; el 50 % exacto no vota. Cobertura: **TC-474** y la sonda, grupo `jet`.
>
> **Sigue abierto el número**, que es contenido clínico nativo:

`IM_CORTES.jet_nat` vota severa por encima del **40 %** del área de la AI y cita a la ASE 2017. La
**ASE 2017, Tabla 8, folio 332**, y el **folio 333** escriben severa **`>50 %` del área de la AI**,
y **no publican ni el 20 ni el 40** —el 20/40 es de guías previas—. Censado el PDF entero: las dos
únicas apariciones de un porcentaje de área de AI para la IM dicen `>50 %`.

⚠️ **Es contenido clínico NATIVO y lo decide Maicol**: mover ese corte cambia el grado de la
insuficiencia mitral de pacientes con un jet entre el 40 y el 50 %, en el informe firmado. **No se
toca sin orden expresa.** Se reporta porque la fila cita una guía que dice otra cosa.

## Declarado y NO tocado por la tanda W2-B (2026-10-15)

### Z1 · Los tres parámetros nuevos de la Tabla 11 NO votan en el veredicto de obstrucción
`R.obstr` de `vmProtEOA` sigue saliendo del **AEO y del DVI**, como desde la Fase 2. La velocidad
pico de E, el gradiente medio y el THP se publican en la cápsula con su banda y **no entran**.
Sumarlos cambiaría qué escenas publican «Prótesis mitral con hallazgos sugestivos de obstrucción
(…)» en el **informe FIRMADO**, y **qué parámetros votan es contenido clínico**. Medido y fijado
por TC-474: los tres pueden estar en «significativa» a la vez y el veredicto sigue en nulo.
La nota `*` de la Tabla 11 dice que la exactitud diagnóstica es mejor cuando **la mayoría** de los
parámetros son normales o anormales a la vez, así que una regla de mayoría es la candidata obvia
— pero es una regla de integración nueva y la decide Maicol.

### Z2 · El PPM AÓRTICO no entra en el informe firmado, y el MITRAL sí
El mitral publica «Desajuste protésico-paciente severo (AEO indexada 0,79 cm²/m²)» en el cuerpo y
en el EN SUMA desde la Fase 2; el aórtico se calcula y se muestra **sólo en pantalla**. Es la
opción conservadora: agregar una frase automática al papel es un texto del informe firmado que la
orden del W2-B no autorizaba explícitamente. **Dos alternativas**, con la conservadora marcada:
1. **(conservadora, la de hoy)** dejarlo en pantalla y que el médico lo escriba si quiere;
2. publicarlo con la misma forma que el mitral, que es una línea en `generarInforme`.
⚠️ Y en los dos casos **el Excel no lo lleva**: haría falta una **columna nueva** (hoy 436), que la
orden prohibía abrir sin parar y reportar.

### Z3 · Los identificadores y los comentarios de código siguen diciendo «EOA»
`vmProtEOA`, `VM_PROT_EOA_OBSTR_MAX`, `VM_PROT_EOA_NORMAL_MIN`, `porEoa`, `eoaI` y ~90 comentarios.
**No se renombraron a propósito**, con el mismo criterio con que el renombre PHT → THP dejó sus 44
comentarios: lo que la orden pide cambiar es lo que **se lee**. Renombrar `VM_PROT_EOA_OBSTR_MAX`
además obligaría a tocar el panel de Evidencia, que lo resuelve por `window` con un `_indUmb`, y
su propio assert de arranque.

### Z4 · El panel de Evidencia usa «AEOR» para el orificio REGURGITANTE
Cuatro citas del panel escriben **«AEOR»** (área efectiva del orificio regurgitante) donde el
resto de la app escribe «EROA». Con el renombre del W2-B quedan **tres** nomenclaturas conviviendo
—AEO protésica, EROA regurgitante y AEOR regurgitante—, y **AEO y AEOR difieren en una letra**, que
es la misma clase de confusión que el renombre vino a cerrar. No se tocó: son textos del panel que
citan guías y cambiarlos no estaba en la orden.

### Z5 · Con prótesis y SIN dato cuantitativo, la fila del jet publica el régimen NATIVO
`imCortesPintar` cuelga del **final** de `calcIM_ESC`, que sale temprano cuando no hay parámetros
cuantitativos: la fila de referencia del jet/AI se queda con lo que dejó `limpiarCampos`. Es
**PREEXISTENTE** —medido igual en HEAD— y la sonda lo fija como control negativo. El arreglo sería
llamar al pintor antes de ese `return`, o desde `valvProtSync`.

### Z6 · Cuatro de los cinco hallazgos de la Tabla 12 siguen sin implementar
De la Tabla 12, folio 28, la app aplica **sólo** el cociente VTI `≥2,5`. Faltan la velocidad pico
`≥1,9 m/s`, el gradiente medio `≥5 mmHg`, la Vmax del chorro de IT `>3 m/s` —los tres tienen campo
en la app— y el volumen sistólico del VI por 2D/3D comparado con el sistémico, que no lo tiene. El
panel de Evidencia sí dibuja la fila del patrón de regurgitación con THP normal.

### Z7 · La nota `§` de la Tabla 11: las bioprótesis pueden tener cortes «algo más altos»
La guía lo dice y **no publica cuáles**. La app aplica los mismos cortes a mecánicas y biológicas,
que es lo que la nota `*` autoriza. Queda como está.

### Z8 · El resto de la ayuda `#ref-pao` sigue atribuido a «ESC 2021 · VARC-3»
Esa tarjeta publica además gradiente medio, Vmax, AVA y DVI por tipo de prótesis bajo el título
«Prótesis Aórtica — ESC 2021», y **«ESC/EACTS 2021» tiene CERO entradas en `FUENTES.md`**. En el
W2-B se reescribió **sólo la línea del PPM**, que es la que contradecía al cálculo nuevo; el resto
de la tarjeta es contenido clínico y una revisión aparte.

### W1-12 · La regurgitación paravalvular de una SAVR no tiene dónde cargarse

`eteTaviRPV()` implementa la **Tabla 8, folio 23** con sus tres filas exactas —extensión
circunferencial `<10`/`10-29`/`≥30 %`, VC `<0,3`/`0,3-0,6`/`>0,6` cm, área de VC
`<0,10`/`0,10-0,29`/`≥0,30` cm²— y **los tres coinciden**. Pero el módulo vive **sólo** en la
pestaña ETE/TAVI: una bioprótesis o una mecánica quirúrgicas con un jet paravalvular **no tienen
campo**. La Tabla 8 aplica a toda prótesis aórtica. **Pide campos nuevos.**

### [CERRADO 2026-10-15 · W2-B] W1-13 · `onchange` de `#va_morf` no recalcula

> **CERRADO.** `valvProtSync()` llama a `calcEADetalle()`, igual que ya llamaba a `eaAtPintar()`.
> Va ahí y no en el atributo por el mismo argumento que el resto de esa función: es el dueño
> único de «cambió la morfología». Medido el ida y vuelta: prótesis llena la fila del PPM y
> nativa la esconde Y la vacía. Cobertura: **TC-474**, bloque (D).


Es `valvProtSync()` y nada más; el de `#vm_morf` llama además a `calcIM_ESC()` y `calcEM()`.
**No está medido como defecto** —el censo forzó el recálculo— pero es una asimetría que conviene
cerrar junto con cualquier cambio del veredicto protésico aórtico.

### Lo que NO se puede hacer sin un campo nuevo

- **EOA aórtico protésico contra su referencia.** La Tabla 5 lo expresa en desviaciones estándar
  respecto del EOA de referencia **del modelo implantado**: haría falta **marca, modelo y tamaño**
  de la prótesis más una tabla de referencia (el Apéndice de la ASE 2024 la trae, Tablas A1 a A9).
  La app lo declara hoy en la cápsula, y la declaración es correcta.
- **Criterio específico de TAVI.** Es un cambio respecto de un **basal post-implante en condiciones
  hemodinámicas estables**: hace falta marcar cuál estudio es ese basal. Ya declarado en el código.
- **Regurgitación paravalvular de una SAVR** (W1-12).
- **Dos filas de la Tabla 12**: volumen sistólico del VI por 2D/3D comparado con el sistémico, y
  convergencia sistólica en el VI hacia la prótesis.

### Lo que el censo CONFIRMÓ que está bien, para que nadie lo reabra

- **La aórtica protésica SÍ gradúa con la ASE 2024**, Tabla 5 folio 19, y los **seis** cortes
  coinciden con la imagen del PDF: Vmax `<3`/`3-4`/`≥4`, AT `<80`/`80-100`/`>100`, AT/ET
  `<0,32`/`0,32-0,37`/`>0,37`, gradiente medio SAVR `<20`/`20-34`/`≥35`, DVI
  `>0,35`/`0,25-0,35`/`<0,25`, más la regla de integración de un eje dependiente y uno
  independiente del flujo.
- **La insuficiencia aórtica protésica usa la cascada nativa a propósito**, y la ASE 2024, **folio
  20**, lo respalda: la clasificación de la regurgitación protésica intra y paravalvular es similar
  a la de la válvula nativa (Tabla 8). Verificado renderizando la página.
- **El DVI protésico mitral no concluye con regurgitación significativa**, porque el mismo 2,5
  sugiere **estenosis** en la Tabla 11 y **regurgitación** en la Tabla 13. El número se muestra y
  se retira la afirmación.
- **El PPM mitral** aplica la Tabla 7 con su rama de IMC, verificado contra la imagen.
- **El Laboratorio** respeta la excepción de la IM y los conteos por área son correctos
  (W1-2 **cerrado** el 2026-10-15: el gradiente elevado con IM significativa ya no cuenta como
  «Sin estenosis»).


## Tanda W2-A · las tres correcciones de la mitral nativa (2026-10-15) — DECLARADO y NO arreglado

### Y1 · El VOTO de la continuidad en fibrilación auricular sigue abierto

Es **D1-4**, y es contenido clínico: la EAE/ASE 2009 (folio 14) dice que la ecuación **no puede
usarse** en fibrilación auricular, y el área por continuidad **sigue votando**. Lo que entró el
15/10 es el cartel. El lugar para cerrarlo es `emContMotivoNoVota`, que ya tiene el predicado del
ritmo escrito al lado (`emContRitmoFA`): es una condición más en esa función, y cambiaría el grado,
el informe, el EN SUMA, el PDF, el PPT, el Laboratorio y el Excel. **Decisión de Maicol.**

### Y2 · El aviso de FA puede salir sobre una PRÓTESIS mitral, y se dejó así

Si se cargan los tres insumos de la continuidad con morfología protésica, el área se calcula y el
cartel aparece. Se conservó porque la salvedad es del **método** y la cápsula protésica lee esa
misma continuidad (`vmProtEOA`), así que advertir ahí es si acaso más pertinente. **Medido que no
cambia nada de la prótesis:** con prótesis y FA el grado queda en el centinela, la cápsula sigue
diciendo «No graduada: los cortes de válvula nativa no aplican a prótesis» y el informe no afirma
estenosis. Si Maicol prefiere que el cartel se calle sobre una prótesis, es una guarda
`protNoGradua('vm_morf')` en `emContFaAvisoSync`.

### Y3 · El rótulo de `grad_elev` no dice exactamente lo que dice el papel

El Laboratorio llama a esa categoría «No significativa con gradiente elevado» y el informe de los
estudios con IM significativa dice sólo «Gradiente transmitral elevado», sin la mitad «no
significativa». Las dos afirmaciones son compatibles, pero no son la misma frase. Renombrarla
movería el rótulo también para los estudios **sin** IM, que es el caso para el que ese nombre se
escribió. Las tres alternativas están en el cierre de **W1-2**.

### Y4 · `#em-thp-badge` sólo se nota rancio cuando su texto difiere

De los cinco nodos del censo, el badge es el único cuyo contenido **puede coincidir** antes y
después: su rama por omisión imprime la misma frase explicativa en los dos estados. Se nota rancio
cuando el THP intermedio cayó fuera de banda (el badge se queda con el mensaje de la banda). TC-473
lo fija exigiendo cadena vacía tras el borrado, que es el estado inicial.


## Rediseño de Válvulas · D2 — aórtica, tricúspide, tarjetas, THP y color (2026-10-14) — DECLARADO y NO arreglado

### D2-1 · La FRACCIÓN REGURGITANTE de la insuficiencia tricuspídea no existe — PARADA

La orden pedía tres casillas automáticas en la columna 3 de la IT: EROA, Vol-R y **FR**. Entraron
dos. **Ninguna función de la app calcula la FR de esta válvula** —`calcIT_ESC` produce `eroa` y
`volR` y nada más, e `itRefPintar` publica tres filas: vena contracta, EROA y Vol-R— y la
**Tabla 14 de la ASE 2017, folio 350, tampoco publica una banda de FR para la IT**: sus
parámetros son VCW, EROA, RVol, densidad del chorro por CW, radio PISA y área del jet color.

O sea que faltan **las dos mitades**: la cuenta y el corte. Implementarla pediría elegir un
denominador —el volumen eyectado del TSVD, que la app sí sabe calcular con `tsvd_diametro` y
`vti_tsvd`— y aplicarle una banda que **ninguna guía leída publica para esta válvula**. Las dos
decisiones son clínicas. **Es decisión de Maicol.** Mientras tanto, la columna 3 tiene dos
casillas y el reparto es 3 + 3 + 2; la tarjeta ⓘ de esa lesión publica DOS fórmulas y lo declara.

### [CERRADO 2026-10-15 · G1] D2-2 · `#vd-tei-aviso` tenía el mismo defecto de color

> **CERRADO.** Pasó a `var(--orange)`. Medido en los dos temas: hoy computa `rgb(245, 158, 66)`
> de noche y `rgb(217, 123, 31)` de día, **idénticos al control `#diast-excl-aviso`**, que ya
> estaba bien. El texto y la lógica no se tocaron y el cartel sale en las mismas escenas.
> Captura PNG en los dos temas, con `md5` distinto. Lo fija TC-476.

#### Lo que decía la entrada original (D2-2) · `#vd-tei-aviso` tiene el mismo defecto de color y quedó fuera de alcance

El aviso del índice de Tei del ventrículo derecho lleva `color:var(--amber)` y, como los cinco que
esta tanda corrigió, **`--amber` no existe fuera de `.amilo-root`**. Medido el 2026-10-14 con
`getComputedStyle`: computa **`rgb(232, 236, 244)`** en oscuro y **`rgb(26, 34, 51)`** en claro, el
gris del texto normal, mientras el comentario de su línea dice «ámbar».

**No se tocó** porque la orden del D2 enumeraba el aviso del método de la IM y los de la función
diastólica, y éste es del módulo del VD. Es **una línea** —`var(--amber)` → `var(--orange)`— y
TC-472 lo fija como límite declarado, de modo que el día que se arregle el caso lo note.
⚠️ La otra lectura de `--amber` fuera de esos contenedores (`var(--amber, #f59e0b)`) lleva valor de
respaldo y resuelve bien: no hay un tercer caso.

### [CERRADO 2026-10-15 · G2] D2-3 · El Excel conserva dos encabezados que dicen PHT

> **CERRADO con el mecanismo que esta entrada proponía.** `PHT IAo (ms)` → **`THP IAo (ms)`** y
> `TAVI RPV PHT (ms)` → **`TAVI RPV THP (ms)`**, las dos con el nombre viejo en el **cuarto
> elemento** de su entrada de `LAB_XLS_MAP` — los alias de ENTRADA que `_cabsDe` ya consultaba.
> **El número de columnas no cambia por el renombre**, y el libro queda con una sola
> nomenclatura: `ET THP (ms)` ya decía THP.
> ⚠️ **El prefijo del bloque 8 tuvo que seguir el renombre** (`'PHT IAo'` → `'THP IAo'`): sin eso
> la columna caía al bloque «18 · OTRAS COLUMNAS». Lo caza `_labXlsAssertBloques`.
> **Medido con el importador de verdad:** un Excel con los dos encabezados viejos entra con «1
> fila válida» y **sin ninguna columna ignorada**; con los nombres nuevos, también. TC-477 (D) lo
> fija por los dos lados.

Texto original, para la historia: `PHT IAo (ms)` y `TAVI RPV PHT (ms)` seguían con el nombre viejo —y el prefijo de ordenamiento
`PHT IAo` con ellos— porque **el importador lee por NOMBRE DE ENCABEZADO**: renombrarlos descarta
esas columnas en todo backup ya exportado, y eso es un cambio del Excel que la orden manda parar.
`ET THP (ms)`, en cambio, **ya decía THP**, así que el libro queda con dos nomenclaturas.

La salida limpia, para cuando se decida: una tabla de **alias de ENTRADA** que acepte el nombre
viejo al importar y exporte el nuevo — el mismo patrón que `LAB_XLS_LISTAS_LEGADO` ya usa para los
VALORES de lista, aplicado a los encabezados. **Decisión de Maicol**, porque toca el round-trip.

### D2-4 · El Vol-R de la IAo exige los dos del TSVI aunque su fórmula no los use

`Vol-R = EROA × VTI del chorro` no necesita el tracto de salida, pero en `calcIA_ESC` esa fila vive
dentro del **mismo** `if (vtiIA && itsvi && dtsvi)` que la FR, así que sin el Ø o el VTI del TSVI
se va al `else` y queda en «—». Es **preexistente** y esta tanda no lo movió: lo único que hizo
fue que la casilla nueva lo **declare** («requiere Diám. TSVI, VTI TSVI (en Estenosis)»), que es
mejor que un campo mudo. Separar las dos filas cambia cuándo el Vol-R vota, o sea contenido
clínico. **Decisión de Maicol.**

### D2-5 · Los cuarenta y cuatro comentarios de código siguen diciendo PHT

El rótulo cambió en las superficies que se leen; los comentarios de `index.html` y el nombre de la
función `_avmPorPHT` no. No se muestran, así que no es un defecto de cara al médico, pero el
archivo queda con las dos nomenclaturas y la próxima lectura tiene que saberlo. **Las cinco citas
literales en inglés de las guías NO deben tocarse nunca**: alterar una cita la falsifica.

## Rediseño de Válvulas · D1 — la mitral en pantalla (2026-10-14) — DECLARADO y NO arreglado

### ✅ [CERRADO 2026-10-14, D2] D1-1 · El aviso del selector de método de la IM dice `--amber` y se ve GRIS

`#im-pdf-metodo-aviso` —el renglón que explica por qué la última casilla de «Incluir en el informe»
no se destilda— lleva `color:var(--amber)`, y **`--amber` sólo existe dentro de `.amilo-root`**.
Medido el 2026-10-14 con `getComputedStyle`: computa **`rgb(232, 236, 244)`** en tema oscuro y
**`rgb(26, 34, 51)`** en claro, o sea el gris del texto normal en los dos. Es **exactamente el mismo
defecto** que `X1` declara para los cuatro avisos de la diastólica, en otro módulo.
**No se tocó**: cambiarle el color es una diferencia visible que esta orden no autorizaba, y la
salida limpia sigue siendo la de `X1` —definir `--amber` en `:root` como alias de `--orange` arregla
los cinco de una vez—. **Decisión de Maicol.**
⚠️ Los elementos **nuevos** de esta tanda **no** usan `--amber`: la tarjeta usa `--orange`, `--text2`
y `--accent2`, y los tres se verificaron **computados** en los dos temas (la línea «a tener en
cuenta» da `rgb(245,158,66)` oscuro y `rgb(217,123,31)` claro).

### ✅ [CERRADO 2026-10-14, D2] D1-2 · Los SIETE globos de legado muestran su texto viejo hasta D2

El mecanismo nuevo —toque, tarjeta corta, sin hover, sin manual— rige para los **doce** globos de la
pestaña desde esta tanda, pero sólo **cinco** tienen tarjeta escrita. Los otros siete
(`prot-eoa`, `prot-dvi`, `prot-ppm`, `im-onda-e`, `im-vti-ratio`, `im-vc`, `im-jet-ai`) muestran el
`title` que su fila ya tenía, leído del DOM. Son textos **largos** —de 231 a 1319 caracteres— y
algunos cuentan historia y atribución, que es justo lo que las tarjetas cortas vienen a sacar.
**Es lo que la orden pide**: sus textos se reescriben en **D2**.

### ✅ [CERRADO 2026-10-14, D2] D1-3 · El `title` largo de la fila sigue existiendo en escritorio

Lo que se sacó es el `title` **del globo**; el de la **fila** (`span.calc-lbl[title]`) sigue ahí y
sigue apareciendo al pasar el mouse por el rótulo. No es el globo —el globo ya no muestra nada al
hover, medido: cero `title` en los doce— y es la fuente de la que los siete de legado leen su
tarjeta, así que sacarlo ahora dejaría esas siete tarjetas **vacías**. Se va con D2, cuando sus
textos pasen al registro.

### D1-4 · La continuidad mitral: la guía la excluye con FIBRILACIÓN AURICULAR y la app no

EAE/ASE 2009, **p. 14**, literal: *«The continuity equation cannot be used in cases of atrial
fibrillation or associated significant MR or AR»*. `emContMotivoNoVota` retira el voto con **IM o
IAo significativa** y **no mira el ritmo**, así que en fibrilación auricular el AVm por continuidad
sigue votando la categoría de la estenosis. **Reportado y no corregido**: cambiar cuándo vota un
método es contenido clínico y esta orden lo prohíbe. El dato para decidirlo ya está en la app
(`diast_ritmo`, con `hfRitmoEfectivo()` como dueño único). **Decisión de Maicol.**
⚠️ La **tarjeta** del AVm por continuidad **sí** publica la salvedad de la guía, que es lo que el
médico necesita para leer el número; no afirma que la app la aplique.
⚠️ **ACTUALIZADO 2026-10-15 (W2-A):** desde la tanda W2-A hay además un **aviso en pantalla** al
lado del número (`#em-cont-fa-aviso`, ver **W1-7**, cerrado). **Lo que sigue pendiente es
exactamente esto: el VOTO.** El aviso no lo cambia, y está medido que el grado y las cuatro
superficies firmadas salen idénticos en los dos ritmos.

### D1-5 · El «requiere …» de la FR por PISA es largo con el formulario vacío

Con todo vacío, el placeholder de `vauto-fr-pisa` dice *«requiere radio PISA, Valiasing, Vmax IM,
VTI del jet de IM, Diám. TSVI, VTI TSVI (en Estenosis)»* —seis insumos, porque la FR está al final
de la cadena—. Es exacto y nombra lo que falta, que es la regla de esta zona, pero no entra de una
línea en un campo angosto. Las alternativas son acortarlo a los dos o tres primeros («requiere los
insumos de PISA y los del TSVI») o dejarlo. **Se dejó**, que es el lado que no pierde información.

### D1-6 · El VTI Ao de la estenosis mitral: no había nada que sacar

La orden decía «el VTI Ao NO va en la estenosis mitral». **Censado: no estaba.** La columna 1 tiene
`em_vtimit`, que es el VTI **mitral** por CW, y el VTI del TSVI vive en la columna 2 con su nombre
(`em_vtitsvi`). No se quitó ningún campo.

### D1-7 · Las copias de la fórmula del volumen eyectado que QUEDAN

`_vsTsviCalc` unificó las **tres** de la mitral. Quedan dos más, las dos de otra lesión y por eso
fuera de D1: `calcIA_ESC` (volumen sistólico del TSVI para la FR de la **insuficiencia aórtica**) y
el AVA aórtica por continuidad de `calcAo`. Las dos escriben `Math.PI*((dtsvi/20)**2)` a mano.
**Van en D2**, que es la tanda de las lesiones aórtica y tricuspídea.


## Aviso de exclusiones mitrales y disfunción sistólica del VD (2026-10-14) — DECLARADO y NO arreglado

### X1 · Los otros TRES avisos ámbar de la diastólica NO son ámbar

`--amber` se define **sólo dentro de `.amilo-root`** (es un alias de `--orange` para ese módulo),
así que fuera de ahí `color: var(--amber)` es inválido en tiempo de valor computado y el color cae
al **heredado**. Medido en HEAD el 2026-10-14: `#diast-excl-aviso`, `#diast-fc-aviso`,
`#diast-bse-eprima-aviso` y `#diast-bse-gris-aviso` computaban los cuatro `rgb(232, 236, 244)`, o
sea el gris del texto normal, con el comentario del marcado diciendo «ámbar» al lado.

El de exclusiones pasó a `var(--orange)` —global y theme-aware— y hoy computa `rgb(245, 158, 66)`.
**Los otros tres no se tocaron**: son del protocolo y de la BSE, no de esta tanda, y cambiarles el
color es una diferencia visible que la orden no autorizaba. La salida limpia es una de dos: definir
`--amber` en `:root` como alias de `--orange` (los arregla los cuatro de una vez, y de paso todo
otro uso fuera de `.amilo-root`), o cambiar los tres restantes uno por uno. **Decisión de Maicol.**

### X2 · Las tres guías excluyen la plastia y el TEER mitral, y la app no los puede detectar

`vm_morf` tiene **nueve** opciones —censadas una por una el 2026-10-14— y ninguna es plastia,
anuloplastia ni reparación mitral; tampoco hay campo que diga que ya se hizo un TEER. Las tres
guías los excluyen (ASE 2025 en la nota ¶ de su Figura 3; BSE 2024 en el pie de la Figura 17;
ASE/EACVI 2016 en el folio 286). El aviso **nombra de menos**, que es el lado correcto para un
cartel que no cambia nada, y lo que falta está escrito acá. Cerrarlo pide una opción nueva en la
morfología o un campo propio, o sea contenido clínico. **Decisión de Maicol.**

### X3 · Con el estilo CONCISO la disfunción sistólica del VI no entra en la categoría

Es **PREEXISTENTE** y se midió contra HEAD. La regla del Laboratorio detecta la disfunción del VI
por dos vías —la palabra «disfunción sistólica» o un `FEVI <40-49>` pegado a la sigla—, y la frase
del estilo **conciso** es «FEVI levemente reducida (45 %)»: no tiene ninguna de las dos. En el
**estándar** entra por «FEVI 45» y en el **narrativo** por «compatible con disfunción sistólica
leve». O sea que la misma cohorte da una prevalencia distinta según el estilo con que se firmaron
los informes.

**No se tocó** porque corregirlo cambia **qué estudios entran en la categoría**, que la orden del
2026-10-14 no autorizaba. La salida limpia es que la regla lea «FEVI … reducida» además del número.
**Decisión de Maicol.**

### X4 · No hay columna de Excel para la disfunción sistólica del VI

La tanda del 2026-10-14 agregó `DisfSist_VD` —**una** columna, que era lo que la orden autorizaba—
y el VI sigue sin la suya: su presencia en la estadística sólo se ve en el dashboard, en el PDF de
auditoría y en el PPT, no en la planilla. Un `DisfSist_VI` simétrico costaría una columna más
(436 → 437) y dejaría las dos categorías legibles desde el archivo. **Decisión de Maicol.**

### X5 · `_labHallazgosCuenta` corta en OCHO y ahora hay NUEVE categorías

La lista `_LAB_HALLAZGOS` ordena por `n` descendente y hace `.slice(0, 8)`. Con la categoría nueva,
una cohorte donde la disfunción del VD sea frecuente puede **desplazar** a otra fuera del top 8 del
dashboard, del PDF de auditoría y del PPT. Es el comportamiento de un «top 8» y no una rotura, pero
el corte se eligió cuando había ocho categorías y nadie lo revisó al agregar la novena.
**Decisión de Maicol**: subir el corte, o declararlo al pie de las tres superficies.

## Estenosis mitral nativa en el LABORATORIO (2026-10-14) — DECLARADO y NO arreglado

### L1 · La tabla de ocho válvulas y el gráfico apilado siguen contando la EM por el BOTÓN

El gráfico de distribución propio de la EM, el PDF de auditoría y el PPT pasaron a las seis
categorías, que se calculan desde los **datos**. La **tabla resumen de ocho filas** y el **gráfico
apilado** siguen leyendo `_labEstenSev(inf,'em_grado')`, o sea el token guardado, y por eso su fila
de la EM puede diferir de las barras de la misma tarjeta: un estudio con AVm 2,0 cm² y el botón en
«Significativa» cuenta como «Sev» ahí y como «Sin estenosis» en el gráfico de abajo.
**No se tocaron a propósito**: sus cuatro columnas las comparten las OCHO lesiones, y cambiarle el
conteo o el encabezado a la mitral se los cambia a las otras siete, que esta orden prohíbe. Lo que
sí entró es una **nota al pie** que declara cómo se leen. Cerrarlo pide decidir si la EM sale de
esas dos superficies compartidas y tiene las suyas. **Decisión de Maicol.**

### L2 · `VALVSIG` cuenta la estenosis mitral por una regex sobre el token

El módulo de **asociaciones** (`VALVSIG`, que alimenta «HTP → valvulopatía significativa») hace
`/severa|moderada/` sobre seis campos de grado a la vez, `em_grado` incluido. Con la lectura nueva
disponible, esa estenosis podría contarse por los datos; **no se tocó** porque la función es
transversal a las seis válvulas y cambiarla mueve las otras cinco.

### L3 · El Excel no exporta el gradiente medio mitral, así que las categorías NO se pueden
recalcular desde el libro

**PARADA del punto 7 de la orden, verificada.** El Excel exporta `AVm (cm²)` (por THP),
`AVm continuidad (cm²)`, `AVm planimetría (cm²)`, `AVm indexada (cm²/m²)` y `EM grado`, pero
**`em_gmedio` no tiene columna**: cero apariciones en el bloque del exportador. Sin el gradiente no
se puede derivar «significativa solo por gradiente» ni «no significativa con gradiente elevado» ni
la casilla del gradiente desde el libro que cruza a **CeiboAnalytics**.
**No se agregó ninguna columna** (la orden lo prohíbe expresamente y manda reportar). Las
alternativas, en orden de menor a mayor costo:
1. **Una columna numérica, «Grad medio mitral (mmHg)»**, con su banda ya existente — `[1,60]`, que
   sale de `DCM_RANGO` y la fusiona `_labRango`, **no** de `LAB_XLS_RANGO_PROPIO`, donde este campo
   no tiene entrada propia (medido) — el Excel pasaría a **436**. Es el dato crudo y deja el cálculo del
   lado del consumidor, que es lo que hacen las otras 434.
2. **Una columna de texto con la categoría ya calculada** — también 436, y además congela en el
   libro una clasificación que puede cambiar con la regla; el repo ya documenta que el puntaje del
   HFA-PEFF no se guarda por esa misma razón.
3. **Dos columnas booleanas con las casillas** — 437, y es la más redundante.
La 1 es la conservadora. **Decisión de Maicol.**

### L4 · El estudio con «No significativa» marcada a mano y sin ningún número cae en «Sin estenosis»

`sig_sin_num` existe sólo para el lado que AFIRMA. Un estudio donde el médico marcó «No
significativa» sin cargar un valor entra en **«Sin estenosis»**, que es lo que esa marca afirma,
pero no se distingue del que tiene los números y no alcanza ningún corte. Hacerlo pediría una
séptima categoría («No significativa sin dato numérico») y la orden pide seis.

### L5 · El 10 exacto del gradiente: la ASE 2023 y la EAE/ASE 2009 no coinciden

La app usa `≥10` (ASE 2023, Tabla 1, folio 8, banda `≥10`). La **EAE/ASE 2009** (Tabla 9, p. 17)
escribe `5–10` y `>10`, así que para ella el **10 exacto** es la banda intermedia. **No se movió
ningún operador**: la app sigue a la guía más nueva, que es la que su propia regla cita. Queda
dicho para que nadie lo «corrija» con la tabla de 2009 en la mano.

### L7 · EL SELLO DE VERSIÓN QUEDÓ VIEJO en el tercer commit de esta tanda

**Medido:** `python3 scripts/sellar_version.py --check` dice *«El sello quedó viejo: index.html se
modificó 68 min después de sellarlo»*. `ECO_BUILD` vale **`20261014-0633`** y el commit `5e061e2`
—el último que toca `index.html`— es de las **07:46**. O sea que el pie de la app **miente sobre qué
versión se está mirando**, que es exactamente lo que ese sello existe para evitar: el propio script
declara que ya costó tres diagnósticos, el último medio día.

**No se corrigió en el commit de cobertura y documentación, y el motivo es el protocolo:** re-sellar
escribe dos constantes en `index.html` y `version.json`, o sea tocaría el archivo **después** de que
la línea base de esta tanda se midió sobre él (`md5 a1b06352…`, suite 466/483, Excel con hash
`945166006`). Publicar una línea base medida sobre un `md5` distinto del que queda en el árbol es la
clase de falso que `CLAUDE.md` documenta para el pendrive y para las fechas.

**Qué hacer:** correr `python3 scripts/sellar_version.py` **junto con el próximo commit que toque
`index.html`**, que es cuando la regla de la casa lo pide. No hay nada que arreglar en el código.

### L6 · El PDF imprime «<=» y «>=» en vez de «≤» y «≥»

Es `_labSanPDF`, el saneador **preexistente** del papel: la fuente del PDF no tiene esos glifos.
Alcanza a los rótulos nuevos igual que a todo el resto del documento. No se tocó.


## Modo manual de las pastillas, selector binario de la EM y VTI tricuspídeo (2026-10-13) — DECLARADO y NO arreglado

### M1 · La pastilla no se vuelve a prender sola después de que el médico la cerró

La regla (a) de Maicol dice «ESTADO INICIAL». La marca de manual sí se limpia, pero la **clave de
`localStorage`** queda en `'0'`, y los seis auto-prendidos la leen como «el médico la cerró» —lo
dice el comentario de `_insufAutoPrender`—. O sea que el dato nuevo **se gradúa** (que es lo que el
informe lee desde la etapa 4b) pero el botón sigue apagado hasta que el médico lo toque.
Se eligió no borrar la clave porque eso **deshace un gesto del médico** que el repo declara durable
en cuatro lugares. Si se decide lo contrario, el borrado va al lado del `delete esqSevManual` de
`sevReiniciarManual`. **Decisión de Maicol.**

### M2 · ✅ CERRADO el 2026-10-14 — `limpiarCampos` limpia las TRES fotos de proceso

Lo destapó TC-430. Las tres son la MISMA pieza —la foto de proceso del grado calculado— y el
comentario de `limpiarCampos` explica por qué la de la IAo se borra: «sobreviviendo, el aviso rojo
del paciente B nombra "cálculo automático: Severa" sobre un estudio que no tiene un solo dato». Las
otras dos tienen exactamente el mismo agujero y no están en esa línea. **Consecuencia medida en
TC-430**: tras «Nuevo estudio», apagar la pastilla de la IT deja la marca puesta mientras la de la
ET se limpia, porque el reinicio ve un cálculo que es del paciente anterior.
**CERRADO**: los dos nombres entraron a esa lista, al lado de `_iaGradoCalc`. Reproducido antes de
tocarlo con clics reales en los dos botones del gesto —el de la barra y el «Continuar sin guardar»
del modal—: `_imGradoCalc` y `_itGradoCalc` seguían valiendo `'4'` después de «Nuevo estudio», y
`sevCalcPublicable('im')` y `('it')` publicaban `'4'` sobre un formulario vacío, que es lo que lee el
aviso rojo. Control negativo: la IAo iba a `null` en los dos árboles. Lo fija **TC-468**, y **TC-430**
se adaptó: su condición (5) afirmaba este defecto con el motivo escrito.

### M3 · La estenosis tricuspídea no pinta el aviso de discordancia al apagar la pastilla

Medido en las ocho lesiones: con el dato cargado, apagar la pastilla deja el aviso
«(ajuste manual) · cálculo automático: …» en **siete**, y la ET no. Es su `comparables`, que
—a diferencia de las otras siete— **no incluye el centinela**, así que `sevComparable` devuelve
`false` y `sevDiscrepa` nunca llega a comparar. Es PREEXISTENTE y es también lo que hacía que el
defecto del modo manual fuera **mudo** justo en esa válvula. Agregar `'sin'` a esa lista es una
línea, pero cambia qué publica el aviso rojo en una válvula que esta orden no autoriza a tocar.
**Decisión de Maicol.**

### M4 · El Laboratorio seguirá viendo «Moderada» en estudios que ya no se pueden escribir

`_labEstenSev` clasifica por regex sobre el valor guardado y devuelve `Sin / Leve / Moderada /
Severa`. Los tokens no cambiaron, así que **nada se movió hoy**; lo que cambia de acá en más es el
DATO: el médico ya no puede elegir `moderada` —sólo `leve`, que es lo que escribe «No
significativa»— así que la fila «Esten. Mitral» del Laboratorio va a concentrarse en `Leve` y
`Severa`, con los rótulos viejos. Con la nomenclatura nueva, esa fila debería decir «No
significativa / Significativa».
**Es el trabajo del prompt siguiente**, y éste es el insumo: el único lector del token es
`_labEstenSev`, y de él cuelgan `sevTable('lab-esten-em', …)`, `_labGradoTxt`, el filtro de cohorte
`C.em` y el PDF de auditoría.

### M5 · ✅ CERRADO el 2026-10-14 — las tres afirmaciones de la ayuda de la EM dicen la regla vigente

En el mismo bloque que se reescribió hay tres frases que **ya estaban desactualizadas** y que esta
orden no autoriza a tocar porque son contenido clínico: (1) «con AVm > 1,5 y gradiente medio
**> 4 mmHg** publica "EM con gradiente elevado"» —los cortes son 5 y 10 desde el 2026-10-11—;
(2) «se publican las dos con su método y prevalece el peor, con "**probablemente severa** por …"»
—la categoría `probable` se eliminó ese mismo día—; y (3) «El gradiente medio **≥ 10 mmHg** de la
ASE **no** se usa como criterio de severidad» —hoy **sí** se usa, es la mitad de la regla binaria—.
**CERRADO**: las tres se reescribieron contra la regla vigente, **sin mover ningún corte ni ninguna
cuenta** —los números salen de `AVM_SEVERA_MAX`, `EM_GMEDIO_ELEVADO_MIN` y `EM_GMEDIO_SIGNIF_MIN`,
que son los que `emCategoria` aplica—. De paso, la atribución de la tercera pasó de «la propia ESC
2021» —que **no tiene ninguna entrada** en `docs/fuentes/FUENTES.md`— a la **ESC/EACTS 2025, folio
4680**, que sí está en la biblioteca y escribe el concepto literal. Y se corrigió una **cuarta**, no
listada acá, que repetía el mismo «> 4 mmHg» en el cartel del manual. Lo fija **TC-468**, y **TC-307**
se adaptó: exigía que el manual NO nombrara el «≥ 10 mmHg», que hoy sí es criterio.

### M6 · Por encima de 100 cm el VTI de entrada no vota

La banda de `et_vti_diast` es `[5, 100]` y su techo está elegido —desde el 2026-10-07— para que un
flujo de entrada largo siga votando el área. Con el VTI convertido en criterio, un valor de 101 cm
queda «fuera de rango (no gradúa)» aunque cruce el corte de 60 por casi el doble. Es el lado
conservador —un número de tres cifras en ese campo es, casi siempre, un error de tipeo— pero queda
declarado porque ahora **retira un criterio** y antes sólo retiraba un denominador.

### M7 · ✅ CERRADO el 2026-10-14 — gana la ASE 2023 y el operador pasa a `>=`

Los dos documentos están verificados en su folio impreso. **Decisión de Maicol («VTI de entrada
mayor o igual a 60»): gana la guía más nueva**, que es la ASE 2023 (Pandian, folio 16, leído
renderizando a 600 dpi). La app aplica `>= 60 cm` desde el 2026-10-14, así que **el 60,0 exacto hoy
sí afirma**. Verificado además que no hay una guía más nueva que lo contradiga: ni la ESC/EACTS 2025
ni el Praz 2025 nombran el VTI de entrada tricuspídeo, censados los dos PDF completos. El área por
continuidad —de la que este campo es el denominador— **no se movió**: 0,98 / 0,98 / 1,15 cm² en los
dos árboles. Lo fija **TC-468**; **TC-466**, **TC-141**, **TC-416**, **TC-417** y **TC-429** se
adaptaron.

### M8 · Los dos hallazgos de APOYO de la Tabla 10 siguen sin recogerse

Era el punto A-6 y sigue vivo: **aurícula derecha dilatada ≥ moderada** y **vena cava inferior
dilatada**. La app tiene los dos datos (`ad_area`, `vci_diam`) y no los conecta. La guía los llama
«de apoyo» y no de significación, así que no votarían el veredicto: serían una anotación.

---

## Las cuatro partes de Válvulas (2026-10-14) — DECLARADO y NO arreglado

### Q1 · La regla «la última casilla tildada no se destilda» la decidió Claude, no el médico

La orden la proponía así —«regla que decidió Claude y el médico puede ajustar»— y es la que está
implementada: con una sola casilla tildada, el clic se revierte y el panel escribe «Tiene que quedar
al menos un método incluido en el informe.». La alternativa sería **permitir las dos apagadas** y que
el informe no publique ningún método cuantitativo de la IM. **Decisión de Maicol.**

### Q2 · El aviso del panel es un renglón nuevo que no estaba pedido

`im-pdf-metodo-aviso`. Lo agregué porque un clic que no hace nada y no explica se lee como un control
roto. Es de PANTALLA —no tiene emisor en informe, EN SUMA, PDF, PPT ni Excel, es un `<div>` así que
el recolector de `guardarInforme` no lo toma, y lo vacía el barrido de `[id^="im-pdf-"]`— y su texto
se puede cambiar en una línea (`IM_PDF_AVISO`). **Si sobra, se saca.**

### Q3 · Con PISA destildada y la continuidad sin números, la IM se queda sin método

Es alcanzable: la casilla de continuidad se tilda con valor, después se destilda PISA, y más tarde se
borra un insumo de la continuidad. Ahí `_imPisaIncl` y `_imContIncl` son los dos `false` y el grado
sale de los votos COMUNES solos —vena contracta, ratio jet/AI y onda S—, que es exactamente el
comportamiento de HEAD sin ningún método marcado. **No es una regresión y es el lado conservador**,
pero la regla de la última casilla no lo previene, porque mira el TILDE y no el número.

### Q4 · `im_pdf_pisa` sigue fuera de `_PDF_METODOS`, y por eso necesita su propia restauración

Esa tabla gobierna `_restaurarChkInclusion` y `_pdfMetodoChk`, y se indexa por **campos** que
habilitan la casilla; PISA no tiene campos propios —su valor sale de los span `eroa-val` / `volr-val`
/ `freg-val`— así que no entra. El precio es `imPdfPisaRestaurar`, una función aparte llamada desde
las dos rutas. Meterla en la tabla pidiendo `['pisa_r','pisa_val','im_vmax','im_itv']` unificaría los
dos mecanismos, pero cambiaría también cuándo se **deshabilita** la casilla, que hoy no se deshabilita
nunca. **No se hizo: es más de lo que esta orden autoriza.**

### Q5 · El `tocado` de PISA se escribe y no lo lee nadie

`imPdfMetodoClic` lo pone en las dos casillas. La de continuidad lo persiste (`__tocado`) y lo leen
`_pdfMetodoChk` y las dos restauraciones; la de PISA **no está en `_PDF_METODO_IDS`**, así que su
bandera vive sólo en memoria y nadie la consulta. Se escribe igual por simetría y se borra en
`limpiarCampos`. Si algún día PISA entra a esa lista, la bandera ya está.

### Q6 · El operador del VTI de entrada quedó escrito en DOS líneas

El símbolo que imprime el cuadro sale de `ET_CRIT.vtiEnt.op` y la comparación es un `>=` literal en
`etEstado`. Es la convención de los otros tres criterios de esa tabla —los cuatro tienen su `op` en
la tabla y su comparación en el código— así que unificarlo en uno solo pedía tocar los cuatro. Lo que
hoy impide que se desincronicen es **TC-468**, que compara el símbolo IMPRESO contra el lado del
borde que vota. **Declarado.**

### Q7 · La ESC/EACTS 2025 escribe `<1.5` donde la app aplica `≤1,5` para el área mitral

Apareció al verificar el folio 4680 para la frase de la estenosis severa de bajo gradiente. El corte
de la app sale de la ASE 2023 y de la ACC/AHA 2020, las dos con `≤`, y **no se tocó**. Es una
diferencia de un solo valor —el 1,50 exacto— y es otra fuente y otro trabajo.

### Q8 · TC-395 es un séptimo caso inestable por orden de corrida

Salió rojo en un `--solo` de 20 casos de la zona y **verde corrido solo**, con el mismo árbol, igual
que TC-137 en la misma corrida. Se suma a TC-137, TC-246, TC-249, TC-252, TC-260 y TC-GR-06.
**Repetir antes de sospechar.**

---

## Cartel de PÉPTIDOS del HFA-PEFF y el plan del usuario (2026-10-13) — DECLARADO y NO arreglado

### H1 · ✅ CERRADO el 2026-10-14 — el original ENTRÓ a la biblioteca y los cortes están verificados

El PDF de Pieske 2019 entró al disco el **13/10 a las 18:55**, después del censo que lo daba por
ausente —o sea que el censo no estaba mal, cambió el disco—. Se leyó en texto completo el
2026-10-14, con el folio comprobado en el **pie impreso** (folio = página + 3296) y la **Figura 3
leída de la imagen a 600 dpi**, porque es un bitmap y el texto extraído no la trae.

Los veintidós criterios quedan **verificados al estándar del repo**: documento, año, folio y tabla.
`docs/fuentes/FUENTES.md` → `### hfaPeff2019`, y la tabla completa en
`docs/mapa/hfapeff-criterios.md`.
⚠️ **Lo que SIGUE vigente de esta entrada:** el artículo es un *consensus recommendation* de la HFA
y **no asigna clase ni nivel de evidencia**, así que a estos cortes no se les puede colgar un
`Clase I · Nivel B` en el panel de Evidencia.

### H2 · ✅ CERRADO el 2026-10-14 — la PSAP > 35 mmHg vota

Entró como **segunda vía del mismo criterio** que la velocidad de IT, en el renglón que la Figura 3
imprime junto («TR velocity > 2.8 m/s (PASP > 35 mmHg)»), y **cuenta una sola vez** aunque estén
las dos medidas. Medido por los dos lados del 35 con la velocidad de IT sin cumplir.
⚠️ **La decisión que esta entrada anticipaba quedó resuelta por el lado conservador:** se lee el
campo `psap_calc` tal como está, y cuando `calcPSAP` no pudo calcularlo el campo está **vacío**, así
que el criterio queda sin evaluar en vez de votar con una PSAP a la que le falta el sumando de la
aurícula derecha. Lo que queda abierto es **P1**, abajo.

### H3 · ✅ CERRADO PARCIALMENTE el 2026-10-14 — el IMVI mayor pasa a `>=`; el menor se queda en `>`

Con el original delante, los dos renglones **no dicen lo mismo** y por eso no se tocaron los dos:

| Criterio | TEXTO (f. 3304) | FIGURA 3 (f. 3305) | Quedó |
|---|---|---|---|
| IMVI **mayor** | `≥149 … or ≥122` | `≥ 149/122` | **`>=`** — los dos coinciden, la app estaba mal |
| IMVI **menor** | `≥115 … or ≥95` | **`> 115/95`** | **`>`** — difieren, y gana la figura |

El Word de Cowork (§13.2) transcribía el **texto** en los dos, que es por lo que esta entrada los
daba por iguales. `UMBRAL_MASA_HVI_H/M` **no se tocaron**: el criterio mayor usa literales propios
(149/122) y el menor sigue leyendo esas constantes con el mismo operador, así que ningún otro módulo
cambia.

### H4 · El renglón escondido conserva el texto del estado anterior

Cuando la compuerta de FEVI cierra —FEVI < 50 %— `hfapeffLineaEco` pone la fila en `display:none` y
**sale sin reescribir** el `innerHTML`. Medido: con el péptido cargado y la FEVI bajada a 49, la
fila queda escondida con el texto «4/4 en eco — HFpEF probable» adentro.

**Es invisible y es PREEXISTENTE** —HEAD hace exactamente lo mismo, con el mismo `return`
temprano—, así que no es un defecto de esta tanda y no se corrigió. Lo que lo haría relevante es un
camino futuro que lea ese nodo sin mirar el `display` de su fila.

### H5 · Un ritmo que no es sinusal ni fibrilación cae a los cortes de SINUSAL

**El estado no es alcanzable con un gesto**: `diast_ritmo` ofrece **exactamente dos** opciones
(`sinusal`, `fa`) —medido— y `hf_ritmo` tres (`auto`, `rs`, `fa`). Se llega sólo inyectando un token
ajeno, que es lo que haría un estudio guardado con otro vocabulario o una reimportación: el
`<select>` queda en **`selectedIndex -1`** con `value` vacío y `hfRitmoEfectivo()` devuelve **`'rs'`**,
o sea los cortes de ritmo sinusal (NT-proBNP > 220).

⚠️ **Y ES EL LADO QUE SOBRE-AFIRMA**: los cortes de fibrilación son el **triple**, así que aplicarle
los de sinusal a un paciente con otro ritmo supraventricular cuenta como positivo lo que los cortes
altos llamarían negativo. **No se tocó**: elegir qué hacer ahí —abstenerse, usar los de FA, o pedir
el ritmo— es una decisión clínica. Es el mismo patrón que `et_grado` ya pagó con su legado.
TC-465 lo fija como LÍMITE para que un cambio no pase en silencio.

### H6 · El cartel no ofrece los tildes manuales del dominio humoral

La sección de Avanzado tiene cuatro casillas (`hf_nt_may`, `hf_nt_men`, `hf_bnp_may`, `hf_bnp_men`)
para el caso en que el médico tiene el laboratorio informado **pero no el número exacto**. El cartel
pide un número y nada más.

**Decisión conservadora y declarada**: la orden dice «el cartel pide el TIPO y el VALOR con su
unidad», y con un número cargado `hfHumUI` calcula el tilde y lo **bloquea**, así que el camino del
número está completo. Lo que queda sin puerta en Básico es el caso «sé que supera el corte y no
tengo el valor», que hoy sólo se puede marcar desde Avanzado.

### H7 · Con los dos péptidos cargados, el cartel muestra uno a la vez

`hfPepTipoVigente()` abre con NT-proBNP cuando los dos tienen valor. **El otro no se pierde** —se ve
cambiando el desplegable, y el score vota los dos— pero el renglón del corte del cartel sólo habla
del tipo mostrado, con los puntos del dominio al lado. Alternativa, si molesta: dos filas en el
cartel en vez de un selector, que es un rediseño y no un arreglo.

### H8 · El plan se aplica escondiendo botones, no paneles

No es de esta zona y no se tocó, pero es la causa de fondo y conviene que quede escrito:
`applyViewMode()` esconde `.tabs-special`, `.tabs-tools`, `.tabs-lab-wrap` y cada
`button[data-mod]`, y **`showTab` no chequea nada** —medido sobre su fuente: no nombra `eeGetMode`,
`eeModOn`, `applyViewMode` ni `ett_view_mode`—. Los paneles de las pestañas avanzadas **siguen en el
árbol** con plan Básico, así que cualquier código que active uno entra sin pasar por ninguna
compuerta.

**Al 2026-10-13 no queda ningún otro control que lo haga**: `hfapeffIr` era el único, censado por
grep sobre los diez destinos gateados y por el grupo `X` de la sonda sobre el árbol vivo. Lo que
queda abierto es que **nada lo impide estructuralmente**: el próximo botón que llame a `showTab` con
una pestaña avanzada reabre el agujero y ningún chequeo de arranque lo avisaría. La defensa
equivalente a `EE_MODULES` ↔ `data-mod` —que sí tiene chequeo de consola— sería una guarda dentro de
`showTab`. **Decisión de Maicol**, porque toca el enrutador de toda la app.

## Criterios del HFA-PEFF contra el original (2026-10-14) — DECLARADO y NO arreglado

### P1 · La PSAP se lee REDONDEADA a entero, así que el corte de 35 mmHg se cruza por el redondeo

`calcPSAP` escribe `psap_calc` con `(4·VRT² + PmAD).toFixed(0)`. El criterio lee ese campo, así que
una PSAP real de **35,6 mmHg se lee 36 y cruza** el corte, y una de **35,4 se lee 35 y no**.

**Se eligió leer el campo y no recalcular la fórmula** a propósito: una segunda copia de
`4·VRT²+PmAD` es el defecto de la fórmula duplicada que este repo ya pagó varias veces, y además el
médico audita el número que tiene delante. Es el mismo precio que la PAP diastólica de la ASE 2025
ya paga (**C7**).

**Qué haría falta:** exponer la PSAP sin redondear —`calcPSAP` ya la tiene en una variable local—
y que el criterio lea ésa, dejando el campo como está para la pantalla. Es una decisión de Maicol
porque cambia qué pacientes suman el punto.

### P2 · «La PSAP sola» no es un estado alcanzable, y eso acota el alcance del criterio nuevo

`calcPSAP` **vacía** `psap_calc` cuando no hay velocidad de IT. Así que el paciente que el folio
3303 contempla —PSAP elevada **sin chorro de IT medible**, entre el 40 y el 60 % según la BSE—
sigue **sin sumar el punto**, porque esta app no tiene dónde cargar una PSAP que no venga de la VRT.

Lo que el criterio nuevo sí agrega es el paciente con **VRT por debajo de 2,8 y PmAD alta**: medido,
VRT 2,7 con PmAD 15 da PSAP 44 y ahora vota.

**Qué haría falta:** un campo de PSAP medida por otra vía (cateterismo, o una estimación manual),
que es un campo nuevo y por lo tanto una columna de Excel — y esta orden lo prohíbe expresamente.

### P3 · El puntaje se RECALCULA al reabrir un estudio, así que los cortes nuevos lo alcanzan

No hay ningún campo que guarde el total: censado, no existe `hf_score`, `hf_total` ni `hf_puntaje`.
Viajan los **insumos**. Consecuencia medida: un estudio en FA con NT-proBNP entre **365 y 374** que
se guardó con 4/6 **reabre con 5/6**, o sea pasa de «probabilidad intermedia» a «HFpEF confirmado».

**No se migra nada y es deliberado** —la regla de la casa es que un cambio de criterio no sale a
reescribir lo que ya está en disco—, y el `informe_texto` ya firmado **no cambia**: se guarda como
texto y se reimprime tal cual. Lo que cambia es lo que la pantalla muestra al reabrirlo.
TC-467 fija que no hay campo persistido, para que un cambio futuro a uno sí persistido se vea.

### P4 · La marca `#` de la Figura 3, al lado del RWT, no está explicada en el artículo

No aparece en el pie de la Figura 3 ni en el texto de los folios 3303-3305. **No se implementó**
(decisión 4 de la orden). Si alguna vez se consigue el material suplementario (Supplementary
material online, Table S1), ahí podría estar.

### P5 · El criterio del e′ no distingue «no medido» de «medido y normal» cuando falta un anillo

`hfapeffScore` evalúa cada anillo por separado y el que falta queda en `na`. Es correcto —un dato
que falta no vota— pero con **un solo anillo medido y normal** el criterio mayor del e′ queda en
«no cumple», igual que si los dos estuvieran medidos y normales. El artículo escribe los dos
anillos con un «or», así que un anillo normal **no descarta** que el otro fuera patológico.
No se tocó: cambiarlo es cambiar cuándo la app afirma, y esta orden no lo autoriza.

### P6 · Tres afirmaciones viejas sobre los cortes quedaron en el código y se corrigieron sólo donde mentían

El comentario de `hfUmbrales` afirmaba que **«el 365 no existe en la guía»** y quedaba «CERRADO»;
el de `amiloTextoHFAPEFF` decía «NT-proBNP menor desde **365**» al lado de una constante que valía
**375**. O sea el archivo ya se contradecía a sí mismo. Los dos quedaron alineados con la medición.
⚠️ **Lo que NO se reescribió** son las frases que registran una MEDICIÓN pasada: cambiarlas diría
que aquellas corridas midieron otra cosa, y no fue así.

## Cortes de la estenosis aórtica y estenosis tricuspídea (2026-10-13) — DECLARADO y NO arreglado

### A-1 · Cinco de los seis criterios NO votan «leve», y la guía sí tiene esa banda

La **Tabla 3 de la EAE/ASE 2009, p. 10** publica una columna «Mild» para las seis variables. La app
sólo la vota en la **Vmax** (`2,6-2,9`). Las otras cinco —gradiente medio `<20`, AVA por continuidad
y por planimetría `>1,5`, AVA indexada `>0,85`, DVI `>0,50`— **se abstienen**.

**El motivo**: esa banda no tiene cota inferior que la separe de lo NORMAL. Un gradiente medio de
3 mmHg, un DVI de 0,9, un área de 3,5 cm² y un AVA indexada de 1,8 son los de un corazón sano y caen
todos ahí; la misma p. 10 escribe *«A normal AVA in adults is ∼3.0–4.0 cm²»*. Votar 'leve' pondría
«EAo leve.» en el informe FIRMADO de todo paciente al que se le mida el área. **La Vmax es la única
con techo de normalidad publicado** (la columna «Aortic sclerosis», `≤2,5`).

**Las dos alternativas, si Maicol quiere que voten**: (a) un gate de «hay estenosis» —por morfología
valvular o por la Vmax— delante de esas cinco, de modo que la banda leve sólo se vote cuando algo ya
indique estenosis; (b) un techo de normalidad propio para cada una, que sería **criterio EcoSmart**
y no de la guía. **Decisión de Maicol.**

### A-2 · La planimetría vota con los cortes del área EFECTIVA, y mide el área ANATÓMICA

La Tabla 3 no califica la fila «AVA (cm²)» por método, pero el **§B.2.3 de la p. 8** cierra con
*«effective, rather than anatomic, orifice area is the primary predictor of outcome»* y presenta la
planimetría como *«an acceptable alternative when Doppler estimation of flow velocities is
unreliable»* — una alternativa, no un votante paralelo. Y la **ESC/EACTS 2025 da un corte PROPIO y
distinto para la planimetría por TC o RM: 1,2 cm²** (nota ^f de la Figura 6, folio 4664).

Hoy la planimetría usa los mismos predicados que el AVA por continuidad, porque son los **únicos
cortes publicados para planimetría ecocardiográfica** y porque el área anatómica es sistemáticamente
mayor que la efectiva, de modo que con esos cortes **subestima** la severidad — la dirección
conservadora para una variable que sólo puede agravar. **Lo que falta decidir**: si se la deja así,
si se le pone un corte propio, o si se la limita a cuando el Doppler no es fiable, que es lo que la
guía dice. **Decisión de Maicol.**

### A-3 · «El grado consignado no coincide con las mediciones» alcanza a más escenas

Esa frase del EN SUMA sale de **`eaEscenario().esperado`**, que es una **segunda lectura** del
veredicto: mira el AVA y la pareja Vmax/gradiente y nada más, así que puede diferir del grado que
`eaGradoCalculado` —el dueño único— escribe. Desde que el DVI, la planimetría y el AVA indexada
votan, hay más escenas donde difieren.

⚠️ **ES PREEXISTENTE Y ESTÁ MEDIDO**: la escena «Vmax 3,5 + AVA por continuidad 1,60» la produce
**sin ninguna variable de esta tanda**, idéntica en HEAD y en el árbol de hoy (grupo `C` de
`scripts/_probe_eacortes.mjs`, escena «CONTROL discordancia PREEXISTENTE»). Hoy el informe puede
publicar «EAo moderada.» y, debajo, «el grado consignado (moderada) no coincide con las mediciones
(corresponderían leve) - revisar» sobre un grado que **la propia app acaba de calcular de esas
mismas mediciones**.

**El arreglo de un renglón**: derivar `esperado` del dueño único en vez de recomputarlo, que además
cierra una segunda copia del criterio. **No se hizo porque cambia una frase del informe firmado en
escenas que ya existen en HEAD**, y esta orden no lo autoriza. **Decisión de Maicol.**

### A-4 · `EA_CRIT` repite tres cortes severos y no se unificó

`EA_CRIT = {vmax: 4.0, gmed: 40, avai: 0.6, di: 0.25}` tiene escritos aparte el corte severo del
gradiente medio, el del AVA indexada y el del DVI — los mismos tres que ahora viven en `EA_BANDAS`,
`EA_AVAI_SEV_MAX` y `EA_DVI_SEV_MAX`. **Son seis números para tres cortes.** No se unificaron porque
`EA_CRIT` lo consume `eaEscenario`, que calcula el **subtipo hemodinámico** (bajo flujo, bajo
gradiente, paradojal) y la discordancia, no el grado: fundirlos es tocar esa cadena, que esta orden
no nombra. Es el patrón de la fórmula duplicada que este repo ya pagó varias veces. **Pendiente.**

### A-5 · ✅ **CERRADO 2026-10-13** — El criterio «VTI de entrada tricuspídeo >60 cm» ya vota

La **Tabla 10, p. 19** de la EAE/ASE 2009 lista **cuatro** hallazgos específicos de ET
hemodinámicamente significativa y la app vota **tres**: gradiente medio `≥5`, T½ `≥190` y área
`≤1 cm²`. El cuarto —*«Inflow time-velocity integral >60 cm»*— **tiene campo en la app**
(`et_vti_diast`) y se usa **sólo como denominador del área**, no como criterio propio.

No se agregó entonces porque aquella orden excluía variables nuevas. **Maicol lo decidió el
2026-10-13** («si está en la guía, vota») y entró como cuarto término del mismo OR, con el operador
`>` estricto verificado en el original. Ver `docs/mapa/valvulas-manual-binario.md` §4 y la entrada
de la Tabla 10 en `docs/fuentes/FUENTES.md`. Lo que queda abierto de esa zona está en **M6**, **M7**
y **M8** de este archivo.

### A-6 · Los dos hallazgos de APOYO de la ET tampoco se recogen

La misma Tabla 10 lista, bajo «Supportive findings», **aurícula derecha dilatada ≥ moderada** y
**vena cava inferior dilatada**. La app tiene los dos datos (`ad_area`, `vci_diam`) y no los conecta
a la estenosis tricuspídea. La guía los llama «de apoyo» y no de significación, así que no votarían
el veredicto; serían una anotación. **Pendiente, sin urgencia.**

### A-7 · El corte del gradiente medio salió de la columna AHA/ACC, no de la ESC de 2009

La Tabla 3 trae **dos juegos** para el gradiente medio: AHA/ACC (`<20` · `20-40` · `>40`) y ESC de
2009 (`<30` · `30-50` · `>50`). Se usó el de AHA/ACC porque su corte severo —40— es el que la
**ESC/EACTS 2025 publica hoy** (folio 4663), y tomar la columna ESC de 2009 pondría el severo en 50 y
contradiría a la guía vigente. **Queda declarado**: el corte de moderada (20) es de AHA/ACC y no de
ninguna edición de la ESC. Si aparece una fuente europea con su propia banda de moderada, el 20 es el
número a revisar.

### A-8 · El primer corte de la Vmax pasó de 2,0 a 2,6 y mueve informes hacia lo tranquilizador

El 2,0 no salía de ninguna guía de la biblioteca; la Tabla 3 separa esclerosis `≤2,5` de leve
`2,6-2,9`. Con el corte nuevo, **una Vmax de 2,3 deja de publicar «EAo leve.»** y pasa al centinela.
Es lo que la guía dice y está medido (grupo `V` de la sonda: 2,0 · 2,4 · 2,5 cambian; 2,6 en adelante
no), pero es un cambio en la dirección peligrosa y por eso se declara.
**Y no se emite `'esclerosis'` en esa banda**, aunque el `<select>` tenga la opción y la tabla la
nombre: la esclerosis es un hallazgo **morfológico** y no se deduce de una velocidad —un corazón con
válvula normal también tiene la Vmax por debajo de 2,5—, así que emitirla automáticamente pondría
«con esclerosis valvular» en el informe de todo paciente sano. **Decisión de Maicol si quiere otra
cosa.**

## Borrado en Válvulas: las cuatro lesiones (2026-10-13) — DECLARADO y NO arreglado

### B-1 · La banda de la EROA por continuidad es criterio EcoSmart, no de la guía

La ASE 2017 (Zoghbi, **Tabla 8, folio 332**) califica esa fila: dice literalmente **«EROA, 2D PISA
(cm²)»**. El **folio 312** da la fórmula general `EROA = RVol/VTI_RegJet` dentro del apartado
«Quantitative volumetric method», que es exactamente la que usa `calcContIM`, pero **no publica una
banda propia** para esa EROA. Las filas de **Vol-R y FR** no están calificadas por método, así que
ésas sí valen para los dos.

Desde la regla 3 del 2026-10-13 la EROA por continuidad **vota** con la banda de PISA
(`IM_CORTES.eroa`). Es el lado conservador —no mueve ningún número, no declara una tabla nueva con
los mismos valores— pero **es una decisión de la app**. Lo que falta decidir: si se le pone una
banda propia (ninguna guía leída la da), si se la deja votando con la de PISA (lo de hoy) o si se
la retira del voto y quedan sólo el Vol-R y la FR, que son los dos que la tabla no califica.
**Decisión de Maicol.**

### B-2 · «Gana la continuidad» en la IT se aplicó SÓLO sobre la densidad del chorro

La regla 4 dice «si hay datos de continuidad cargados, GANA la continuidad». Al pie de la letra, el
grado saldría **sólo** de la EROA y el Vol-R, y eso descartaría una **vena contracta severa** — el
parámetro con más peso de la Tabla 14 de la ASE 2017, el único con columna propia en el Excel y en
«Ver detalle».

Lo implementado: con la cadena cuantitativa produciendo un número, **la densidad del chorro deja de
decidir** (sigue mostrando su badge) y la **vena contracta sigue votando**. El síntoma que la regla
contesta nombra la densidad, que es el único votante CUALITATIVO del cuadro. **Es mi lectura y
queda a confirmar:** si Maicol quiere la versión literal, el cambio es una línea
(`p.grupo !== 'cont'` en vez de `p.grupo === 'jet'` en el filtro de `_itDeciden`).

### B-3 · Cerrar a mano una pastilla auto-prendida retira el grado, y reabrirla no lo recupera

No es nuevo: es la cadena `toggleValvPill` → `valvApagarGrado` → `valvSev.aplicar(…, centinela)`,
que pone `esqSevManual` y por eso es durable — y es lo que este archivo ya declara para la
**estenosis tricuspídea** («cerrar y reabrir convierte una ET graduada en *Estenosis tricuspídea.*
sin grado»). Lo que cambió el 2026-10-13 es que **alcanza a tres lesiones más** (IM, IAo e IT),
porque hasta hoy esas pastillas no se prendían solas y `cerrar()` no encontraba nada que apagar.

Medido y fijado como límite en **TC-463**: con la vena contracta en 7 mm el grado es 4; cerrando la
pastilla a mano queda en `'0'` con `esqSevManual.im` puesta; reabriéndola **sigue en `'0'`**.
Cerrarlo exige decidir qué pasa con un grado que la app calculó y el médico ocultó, que es decisión
clínica.

### B-4 · Un dato cargado pero FUERA DE BANDA no sostiene la pastilla

Los calculadores llaman al apagado desde su salida «nadie votó», y a esa salida se llega también
cuando **todo lo cargado quedó fuera de rango**. Ahí el grado ya se retiró por el mismo motivo, así
que apagar el botón va en la misma dirección —la app no puede afirmar la valvulopatía— y el número
sigue a la vista en su campo con el aviso que lo nombra. **Queda declarado**: si se decide que un
número ilegible debe sostener el botón, la guarda va en `_insufApagarAuto`, al lado de
`_INSUF_CAUSAS`.

### B-5 · El formato del grado de la fila no es el mismo en las tres insuficiencias

- **IM y IAo** (nueve filas): `«50.3 mm²»` + un span hermano `«(severa)»`.
- **IT** (tres filas): `«18.1 mm² · Severa (≥40 mm²)»`, el formato de `itRefPintar` desde el
  2026-10-07, con el **rango** del grado adentro.
- **THP, Vmax telediastólica y VTI de la aorta descendente**: un `badge` de color con el grado y su
  rango (`«Leve (>500ms)»`).

Las tres formas dicen el grado, y por eso ninguna se tocó. Unificarlas es decidir cuál gana —y la
de la IT y las de badge dan **más** información, el rango— así que no es un arreglo sino una
elección de diseño. **Decisión de Maicol.**

### B-6 · La vena contracta de la IAo sigue sin fila de referencia

`ia_vc` vota (`<3` leve · `≤6` moderada · `>6` severa) y su valor sólo se ve **en su input**: no
tiene `.calc-val` en el cuadro, así que la regla 5 no tiene dónde escribir su grado. Es el mismo
estado que tenía la vena contracta de la IM hasta el 2026-10-09, cuando se le dio fila. La de la
IAo está declarada desde entonces y sigue así: agregarle una fila es marcado nuevo en el cuadro de
la IAo, que esta orden no pedía.

### B-7 · Con sólo continuidad no hay fila de discordancia intra-método

`_votosDisc` —la lista de la que sale «⚠️ Parámetros discordantes»— sigue siendo **PISA + comunes +
onda S**, y se compone antes de que los votos de la continuidad entren a `params`. Se dejó así a
propósito: tocarla habría cambiado el texto de `im-discordancia` en todas las escenas con los dos
métodos, y con los nombres repetidos (`EROA:severa, EROA:moderada`) se vuelve ilegible. El costo:
un paciente cuantificado **sólo** por continuidad con sus tres parámetros discordando no recibe esa
fila. El aviso «El método volumétrico da X y el integrado Y» sí sale.

### B-8 · `calcIM_ESC` funde las dos bandas intermedias de la Tabla 8

La tabla de la ASE 2017 tiene **cuatro** columnas de cuantitativos: la moderada se subdivide
(`EROA 0.20-0.29` / `0.30-0.39`, `RVol 30-44` / `45-59`, `RF 30-39` / `40-49`) y la nota ‡‡ lo
declara —«Quantitative parameters can help subclassify the moderate regurgitation group»—.
`IM_CORTES` tiene tres bandas. **Pre-existente**, no se tocó en esta tanda.

### B-9 · ✅ CERRADO el 2026-10-14 — el renglón «Severidad (continuidad)» se vacía

Medido en la sonda: en la escena `ninguno` del grupo `metodo` —formulario recién limpiado— el
renglón `im-cont-severidad` seguía diciendo «Severidad (continuidad): Leve · método volumétrico ·
Vol-R 15.7 ml · FR 19%» del paciente anterior. Es un `div` sin `id` dentro de un `calc-row`, así
que el barrido genérico de `limpiarCampos` no lo alcanza, igual que les pasaba a las marcas
«(revisar)» del VD. **Pre-existente y de pantalla** —no lo lee el informe, el EN SUMA, el PDF ni el
Excel, y su `dataset.gradoVolum` sí se borra en las ramas que corresponden—, pero es una afirmación
sobre un paciente que ya no está. El arreglo es una línea en el final de `limpiarCampos`, al lado
de las que entraron en esta tanda; se declara en vez de hacerse porque no es de esta orden.

**CERRADO el 2026-10-14** con esa línea, al lado del barrido de `[id^="im-pdf-"]`. Reproducido antes
con clics reales: el renglón seguía diciendo «Severidad (continuidad): Severa · método volumétrico ·
Vol-R 88 ml · FR 58%» sobre un formulario en blanco. Se vacía con `innerHTML` y no con `textContent`
porque su pintor escribe HTML, que es lo mismo que hace `calcContIM` en su rama de «no hay nada que
decir». Lo fija **TC-468**, con su denominador: primero se comprueba que el renglón dijera algo.

---

## Doppler mitral: el S/D sin legado y los 16 campos en cuatro columnas (2026-10-13) — DECLARADO y NO arreglado

Mapa: `docs/mapa/doppler-mitral-grilla.md` y `docs/mapa/diastolica-complementarios.md`.
Fuente: `docs/fuentes/FUENTES.md` → «El S/D venoso pulmonar — CINCO lecturas y DOS cortes».

### G1 · El bloque quedó 32 px más alto, y son los cuatro divs de marca «(revisar)»

Medido a 1200 px: el alto de la grilla pasó de **254 a 286 px**. Cuatro celdas llevan un div de
marca —THP, Onda L, LARS y strain de contracción de la AI— que reserva **17 px** (`min-height:14px`
+ `margin-top:3px`) aunque esté vacío, y antes caían en DOS filas mientras ahora caen en las
CUATRO. Las dieciséis casillas están ocupadas y las filas son contiguas con el `gap: 12px` de la
grilla: no hay celda vacía. **No se tocó la marca** porque la orden de esta tanda la congela
explícitamente («las marcas «(revisar)» NO cambian»). Si se quisiera recuperar esos 32 px, el
camino es que el div de marca no reserve alto cuando está vacío (`min-height:0` más un
`:empty{display:none}`), y eso cambia la maqueta de los cuatro campos en todos los anchos.

### G2 · No hay etapa de DOS columnas, y la orden la describía

La orden pedía que, «en anchos menores donde la grilla se colapse (2 columnas o 1)», el orden visual
coincidiera con el del Tab, y daba el ejemplo de dos columnas de ocho filas. **La app no tiene hoy
una etapa de dos columnas** para `.grid-4`: el único corte es 768 px y por debajo cae a UNA. No se
inventó un breakpoint nuevo —es la opción conservadora y la que la propia orden sugería («el orden
del marcado en el HTML ya por columnas más posicionamiento explícito solo en la grilla ancha»)—, así
que a 900 px siguen siendo cuatro columnas. Si algún día se agrega la etapa de dos, el orden visual
sale gratis: el marcado ya está por columnas y lo único que hay que respetar es no sacar las
posiciones explícitas de la grilla ancha.

### G3 · Tres rótulos que el médico nombra distinto, y NO se renombraron

La orden escribe «VTI mitral anterógrado», «Duración de la onda A mitral» y «THP mitral»; los
rótulos dicen «VTI mitral de entrada — Doppler pulsado (cm)», «Dur. onda A mitral (ms)» y «THP
mitral (ms) — EM». Los tres quedaron **como estaban**, y la propia orden lo pedía para el primero.
Un rótulo es contenido del informe de pantalla y se reporta, no se cambia.

### G4 · Cinco sondas archivadas siguen nombrando los tokens de legado del S/D

`_probe_diastcompl.mjs`, `_probe_ase2016.mjs`, `_probe_bse2024.mjs`, `_probe_diastfa.mjs` y
`_probe_strainai.mjs` fijan `venp_sd` en `'menor1'` o `'mayor1'` en algunas escenas. **No se
tocaron**: son A/B contra árboles donde esas opciones existen, y reescribirlas cambiaría lo que
aquellas tandas midieron. Consecuencia: corridas futuras de esas sondas contra el árbol de hoy
dejarían el S/D **sin cargar** en esas escenas —sin error, pero midiendo otra cosa—. Si se reusa
una, reemplazar `menor1` por `mid` y `mayor1` por `ge1`, que son los equivalentes vivos para el
corte `< 1`.

### G5 · Safari no se puede probar desde este entorno

La causa del hallazgo del médico quedó verificada de forma **estructural**: las dos `<option>` se
escondían con `hidden`, que Chrome aplica como `display:none` (medido, `getComputedStyle` sobre cada
opción), y un desplegable **nativo** no está obligado a respetar el layout de sus propias opciones.
Lo que este entorno puede afirmar es que las dos opciones ya no existen y que ninguna de las cuatro
que quedan está oculta ni deshabilitada. **Que en Safari ya no aparezcan lo mira el médico.**

## Diagrama de flujo de la BSE 2024 en la ventana 🧭 (2026-10-13) — DECLARADO y NO arreglado

Fuente: `docs/fuentes/FUENTES.md` → «Las tres figuras, caja por caja y flecha por flecha» y
«Licencia de acceso abierto». Mapa: `docs/mapa/diastolica-diagrama.md`.

### D1 · La ASE 2025 y la ASE/EACVI 2016 siguen sin diagrama

Es la decisión de la orden: esta tanda es sólo de la BSE 2024 y las otras dos ventanas quedan
idénticas a HEAD. Cuando les toque, el motor (`_bseDiagSVG`), el envoltorio (`_bseDiagCaja`), la
tabla (`_bseTablaHTML`) y el umbral de ancho ya están: lo que falta por guía es **su plano** y que
su función dueña devuelva `camino` y `nodoFinal`, que hoy no devuelve ninguna de las dos.

### D2 · La Figura 17 dibuja la caja de eco de esfuerzo del original, y la app no

El original cuelga de «Impaired diastolic function with normal filling pressures» una caja que
dice que, si está clínicamente indicado, puede considerarse un eco de esfuerzo. **No se dibujó**:
es una recomendación clínica y agregarla al diagrama sería ponerla en pantalla sin que nadie la
haya decidido. Lo mismo con el tercer motivo de entrada a la Figura 18 —«known myocardial
disease»—, que la app **no mide** y por eso no tiene caja propia.

### D3 · El umbral de 780 px deja el diagrama fuera de una tablet en vertical

Un iPad en vertical son 768 px de viewport: cae **12 px por debajo** del umbral y ve la ventana de
HEAD. Es el lado conservador —el piso de legibilidad medido es de 721 px y bajar el umbral hasta
ahí deja el texto en 11,0 px justos, sin margen—, pero si Maicol quiere el diagrama en esa tablet
hay dos caminos: bajar el umbral a 760 px, o achicar el viewBox a ~640 px, que mete más texto por
caja a costa de renglones más cortos. **No se tocó**: mover el umbral es cambiar qué ve el médico.

### D4 · El rótulo de tres criterios se abrevia en el dibujo y no en la lista

`BSE_DG_ABREV` acorta «Strain de contracción de la AI», «Velocidad de la IT» y «S/D venoso
pulmonar» **sólo** dentro del SVG, porque a 164 px de caja el nombre completo ocupa dos renglones.
La lista larga, la tabla compacta, el informe y el EN SUMA siguen escribiendo el nombre entero, así
que el mismo criterio aparece con dos nombres en la misma ventana. Es de pantalla y no toca ninguna
frase firmada, pero está declarado.

### D5 · La tabla compacta conserva el código de color rojo/verde de la lista

El diagrama es SIN COLORES —lo único en rojo es el camino— pero la tabla que reemplaza a la lista
larga hereda el ✗ rojo y el ✓ verde que esa lista ya usaba, para que el médico no vea dos códigos
distintos para lo mismo en la misma ventana. **El significado no depende del color**: los tres
glifos (✗ / ✓ / –) lo llevan solos. Si se decidiera llevar la tabla también a escala de grises,
`.bse-td.si i` y `.bse-td.no i` son los dos únicos lugares.

### D6 · El diagrama no sale en el PDF, el PPT ni el Excel

Es sólo pantalla, a propósito y por la regla de la casa: «el panel explica, el papel afirma».
Ningún generador lo lee y `@media print` no necesita apagarlo porque vive dentro de un overlay que
ya está en `display:none` cuando la ventana está cerrada. Si alguna vez se quisiera en el informe,
hay que decidir antes qué pasa con el pie de licencia, que en papel es obligatorio.

### D7 · El estado del plegable es de la SESIÓN y no viaja con el estudio

`_bseTablaAbierta` es una variable en memoria: sobrevive al repintado y a cambiar de paciente, y se
pierde al recargar. **No se guarda** con el estudio ni en `localStorage`, porque es una preferencia
de lectura y no un dato clínico.

## Parámetros complementarios de la función diastólica (2026-10-12) — DECLARADO y NO arreglado

Fuente: `docs/fuentes/FUENTES.md` → «Parámetros complementarios de la función diastólica».
Mapa: `docs/mapa/diastolica-complementarios.md`.

### C1 · El importador sigue rechazando un LARS negativo que la pantalla ya no marca — ✅ **CERRADO 2026-10-14**

`LAB_XLS_RANGO_PROPIO` tiene `lars:[0,60]` y lo comparaba sobre el valor **crudo**, así que una
planilla con un LARS de −32 se rechazaba por rango y se perdía la **fila entera**. En pantalla ese
mismo valor ya **no** se marca «(revisar)», porque la cuenta usa `|x|` y 32 está en banda. Las dos
superficies decían cosas distintas sobre el mismo número.

**CERRADO** por orden expresa de Maicol (14/10/2026). La salida no fue cambiarle la banda sino
cambiar **qué número se compara**: `_labRangoValor(dest, v)` devuelve la MAGNITUD para los campos
que la app ya lee en valor absoluto, y **no tiene lista propia** — le pregunta a
`_DIAST_STRAIN_ABS_MARCA`, que es el dueño que la pantalla usa desde el 2026-10-12. Lo consultan la
guarda del importador y la ayuda de la plantilla, que es la otra superficie del mismo rango.
Medido: cambian exactamente **dos** valores de nueve —el −32 y el −60, que HEAD rechazaba y hoy
acepta—, y ±61 y ±80 se siguen rechazando. La banda `[0,60]` **no se tocó** y el valor guardado
sigue siendo el crudo con su signo. Ver `docs/mapa/exclusiones-laboratorio-vd.md` → «BLOQUE R2».

### C2 · La nota ‡ de la Figura 3 y el inciso (d) del folio 555 no dicen lo mismo

La nota ‡ nombra sólo «Ar-A duration > 30 ms»; el inciso (d) pide además «a high amplitude
(>35 cm/s) … **along with** an Ar-A duration >30 ms». La app exige el **AND**, que es la prosa y es
el lado conservador. Si Maicol prefiere el criterio de la figura —el Ar−A solo—, es una línea:
sacar la segunda mitad de `cumple` en la entrada `arA` de `ASE_SUPLEMENTARIOS`.

### C3 · El inciso (d) es un marcador de LVEDP, no de PAI media

El folio 555d lo escribe: «there is an early stage when **LVEDP is elevated but mean LAP is
normal**». La Figura 3 estima la **PAI media**, así que ese parámetro empuja hacia «presión elevada»
un estado que su propia fuente describe con la PAI media normal. Se implementó porque la nota ‡ lo
lista como suplementario de ese algoritmo y porque el §12 del folio 555 manda informar el aumento
aislado de la LVEDP. **Decidirlo es de Maicol**: la alternativa es sacarlo de la lista, o publicar
una frase propia para el aumento aislado de la LVEDP —que sería una frase nueva del informe
firmado—.

### C4 · El informe firmado no nombra los suplementarios que decidieron

El §12 del folio 555 lo pide: «LARS, pulmonary vein S/D ratio or systolic filling fraction, mitral
inflow A duration, pulmonary vein Ar duration, and/or IVRT **should be included in the report if
relied on**». Hoy los suplementarios se nombran en la ventana del 🧭 y en la `via`, y el único que
llega al informe es el de la BSE por `_bseDetalles`. La ASE 2025 no tiene su equivalente.
**Es una frase nueva del informe firmado**, así que no se tocó.

### C5 · El quinto suplementario no tiene campo

La **caída de la E/A ≥ 50 % con Valsalva** (folio 555e y nota ‡). La app no registra la maniobra por
ningún campo. Los dos del inciso (c) —IM diastólica y terminación precoz del llenado antes del QRS—
tampoco, y además no son una medición con corte. La lista `ASE_SUPLEMENTARIOS` está armada para que
agregarlo sea una entrada y nada más.

⚠️ **Y MIENTRAS FALTE UNO, EL LADO NEGATIVO DE LA ETAPA NO PUEDE AFIRMAR NADA.** La flecha «None» de
la figura sale de haber preguntado sus cinco; la app pregunta cuatro. Por eso con los cuatro
negativos el estado se queda en «no estimable».

### C6 · Las dos salvedades del S/D que las guías escriben y la app no avisa

El folio 554 de la ASE 2025: «The ratio is most reliable in patients with LV systolic dysfunction
and **should not be considered in normal subjects with normal echocardiographic results**, when the
ratio can be ≤ 0.67. In patients with normal LVEF, the ratio can be >0.67 despite elevated LV
filling pressures.» La ASE/EACVI 2016 dice lo mismo en los folios 286 y 287, y de ahí sale que su
Figura 8A **no** mire el S/D.

En la ASE 2025 en ritmo sinusal el S/D **sí vota con FEVI normal**, porque su Figura 3 lo pone en el
segundo paso sin condicionarlo a la FEVI. Las dos cosas están impresas en el mismo folio. Un aviso
ámbar —«el S/D es poco fiable con FEVI normal»— sería lo que esta casa hace con una salvedad de la
fuente, pero es un cartel nuevo y no estaba en la orden.

### C7 · El borde de la PAP diastólica es el del campo REDONDEADO

`asePapdSupl()` parsea `ip_papd`, que `calcIP` escribe con `toFixed(0)`. Así un 15,64 real se lee
**16** y cruza el corte. Es deliberado —el número que el médico tiene delante es el que se
clasificó, y la alternativa es una segunda copia de la fórmula— pero significa que el corte efectivo
es `>= 15,5` sobre el valor exacto. Declarado.

### C8 · El redondeo del IMC mueve un borde real, no sólo el del punto flotante

Redondear a un decimal deja NEGATIVO un IMC de **30,03** (86,8 kg con 170 cm), que en HEAD era
positivo. Es el precio del decimal que la orden pide, y es el lado conservador. Si Maicol quiere
cerrar sólo el error de representación, la alternativa es comparar con una épsilon
(`imc > 30 + 1e-9`) en vez de redondear.

### C9 · Con un anillo solo, la BSE deja el cuadro en «—» y el rótulo nombra el sitio

`calcDiastolBSE2024` escribe `eprom-val` sólo con los DOS anillos, así que con uno solo el renglón
queda en «—» mientras su rótulo ya dice «e′ septal». **Es preexistente** —antes decía «e′ promedio»
sobre el mismo «—»— y lo que esta tanda hace es que se vea. La salida limpia es que esa rama llame a
`diastCeldasBasicas`, que sí lo escribe con un anillo; no se tocó porque es la celda de otra guía.

### C10 · La «indeterminada» sigue sumando en DD_Sin

El token nuevo de esta tanda cierra el caso de «Disfunción diastólica.», pero «Función diastólica
indeterminada.» sigue clasificando `null` y, con el E/e′ documentado, sigue contando en
`DD_Sin (Sin disfunción)` por la misma regla. **No le corresponde el token nuevo**: esa frase no
afirma disfunción. Darle uno propio —o cambiar la fórmula de la columna— es una decisión sobre otra
frase. Es lo que queda abierto de **A4**.

---

## Función diastólica ASE/EACVI 2016 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado

Fuente: `docs/fuentes/FUENTES.md` → `### aseDiast2016 — ASE/EACVI 2016, RITMO SINUSAL`.
Mapa: `docs/mapa/diastolica-ase2016.md`.

### A1 · ✅ **CERRADO 2026-10-12** — El E/e′ con un solo anillo se compara contra el corte del PROMEDIO

El folio 281 lo dice: «at times only the lateral e′ or septal e′ velocity is available ... a
**lateral E/e′ ratio > 13** or a **septal E/e′ > 15** is considered abnormal». La app calcula
`eprom` cayendo al anillo que haya y compara ese cociente contra `> 14`, que es el corte del
promedio. Con un septal solo, un E/e′ de 14,5 cuenta como positivo cuando su corte es 15; con un
lateral solo, un 13,5 cuenta como negativo cuando su corte es 13.

~~**No se tocó porque es un umbral clínico que esta orden no autoriza.**~~ **CERRADO el 2026-10-12**
con tres constantes y el corte elegido por el sitio MEDIDO (`ASE16_EE_PROM` 14, `ASE16_EE_SEPTAL` 15,
`ASE16_EE_LATERAL` 13, las tres con `>` estricto). **Es un REEMPLAZO y no un OR**: con los dos
anillos manda el promedio, que es lo que dice el folio 281 («applies to laboratories that acquire
only septal or lateral velocities»). Medido: cambian 3 de 12 escenas, las tres con un anillo solo y
en las dos direcciones. Ver `docs/mapa/diastolica-complementarios.md`.

### A2 · «Enfermedad miocárdica con FEVI normal» no se detecta

El pie de la Figura 8 manda a la 8B a los pacientes con «myocardial disease and normal LVEF after
consideration of clinical and other 2D data». Eso es un juicio clínico sobre datos 2D que no tienen
campo en la app. Hoy esos pacientes corren por la 8A. Para detectarlo haría falta un campo nuevo
—un tilde de «cardiopatía conocida», o derivarlo de la geometría del VI y los trastornos
sectoriales— y esta orden prohíbe agregar campos.

### A3 · Con UNA sola variable disponible la 8A no afirma, y eso es una decisión de la app

La regla de la mitad sobre un denominador de 1 convierte un único parámetro en «hay disfunción» o
en «es normal». La guía no tiene rama para eso y su propio ejemplo usa tres variables. La app
informa indeterminada. Si Maicol prefiere seguir la regla al pie de la letra, es cambiar una sola
condición.

### A4 · ✅ **CERRADO EN PARTE 2026-10-12** — Un `null` del Laboratorio cuenta como «Sin disfunción» en el Excel

`DD_Sin (Sin disfunción)` vale `(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`. La frase nueva de
la 8A («Disfunción diastólica.») y la «Función diastólica indeterminada.» que la app ya publicaba
clasifican las dos en `null`, así que un estudio con el E/e′ documentado **cuenta como «Sin
disfunción»** aunque su propio texto afirme lo contrario.

**CERRADO para la frase de la 8A el 2026-10-12** con exactamente esa salida: el token
`ase2016_sin_grado` en `_labDiastGrado`, con rótulo en la columna de texto y ningún `DD_*`. Medido
antes y después: `DD_Sin` pasa de 1 a 0 y el Excel sigue en 435 columnas. **Sigue abierto para la
«indeterminada»**, que no afirma disfunción y a la que no le corresponde este token — ver C10.

### A5 · ✅ **CERRADO 2026-10-12** — La frase de la 8A no tiene token en el Laboratorio

Era consecuencia de A4. **CERRADO el 2026-10-12**: hoy clasifica `ase2016_sin_grado` y la columna de
texto publica «Disfunción, sin grado (ASE 2016)», así que ya se distingue de «no se pudo
clasificar». Sigue **sin** `DD_*` y fuera de la distribución del panel, del PPT estadístico y del
filtro por grado, y eso es lo correcto: la figura no gradúa. Mismo mecanismo que los cuatro tokens
de la BSE.

### A6 · El TDE y el TRIV no entran, y la app los tiene cargados

Censado en los dos PDF: ninguno aparece en la Figura 8 ni en su prosa como paso de los algoritmos de
ritmo sinusal. La app los guarda y los muestra, y la ASE 2016 no los consulta. No hay nada que
arreglar; queda escrito para que nadie lo reabra.

### A7 · El paciente con E/A ≤ 0,8 y E > 50 sale «grado I» por criterio EcoSmart, no por la figura

Con 0 criterios positivos y FEVI normal o sin cargar, la app fuerza grado I si el E/A es ≤ 0,8.
La Figura 8A diría «normal» (ese paciente tendría 0 de 4) y la 8B lo manda a la caja de los tres
criterios sin más. Es una decisión heredada de HEAD y conservada a propósito —afirmar normalidad
sobre una relajación prolongada es peor que omitir—, pero no sale de la guía.

### A8 · La 8A no distingue su badge del de la 8B

El badge dice «Normal — ASE 2016» o «Indeterminado — ASE 2016» corra la figura que corra; sólo la
ventana del 🧭 nombra cuál se aplicó. Se dejó así para no mover el texto que lee la franja del PPT.
Si conviene que el papel diga por cuál vía se graduó, es agregar el sufijo en un solo lugar.

## Pared del VD e índice de Tei (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda de la pared del VD y del índice de Tei **midió y dejó como está**, con el motivo
de cada uno. La zona está mapeada en `docs/mapa/vd-derecho.md` y la fuente en
`docs/fuentes/FUENTES.md` → `### aseVd2025`.

### V1 · Las filas de TAPSE y S′ del cuadro no vuelven a «—» al borrar el dato

Su `if (tapse)` / `if (sp)` dentro de `calcVD` **sólo pinta**, así que la fila del paciente
anterior se queda en pantalla hasta que `limpiarCampos` barra el `.calc-box`. Las otras cinco
filas —`vd-tam`, `vd-pared-interp`, `fac-interp`, `vd-tei-interp`, `tap-interp`— sí resetean, y
las **dos nuevas siguen a las que resetean**.
**Medido** con teclas reales en la sonda (grupo `refs`, escena `trasBorrarVecinas`): cargar
TAPSE 14 y S′ 9, borrarlos y las dos filas siguen diciendo «Disfunción» sobre campos vacíos,
mientras las cinco que resetean —las dos nuevas incluidas— ya están en «—».
**Por qué no se tocó:** son dos filas que esta orden no nombra, y cambiarlas toca el
comportamiento de pantalla de dos parámetros que la app ya publica. Es un arreglo de dos líneas
cuando se autorice.

### V2 · La pared NORMAL sola no publica oración en el informe

La compuerta del bloque 5 entra con `_hvdInf.hvd`, o sea **sólo con hipertrofia**. Un estudio cuyo
único dato del VD sea una pared de 4 mm no se nombra.
**Por qué así:** la app no dice «sin hipertrofia» en ninguna parte, y sin una frase de normalidad
la oración quedaría en «Ventrículo derecho.» pelado, que es peor que no decir nada. Es además el
mismo trato que ya reciben `fevd` y `vd_vi`, que tampoco llegan al narrativo. Y la guía pide
informarla **si es anormal** (Recomendación 3, folio 144).
**Qué habría que decidir:** si se quiere una frase de pared normal, es texto del informe firmado y
lo decide Maicol.

### V3 · Con el VD no dilatado, el EN SUMA pierde «de dimensiones normales»

Los textos de la orden para la hipertrofia sin dilatación arrancan en «HVD …», así que
`HVD con disfunción sistólica.` reemplaza al `VD de dimensiones normales con disfunción
sistólica.` que HEAD escribía. **Es la decisión de la orden** y está medido en la tabla de 24
escenas: es la única pérdida de la tanda.
**Alternativa, si se quiere recuperar:** `VD de dimensiones normales e hipertrófico, con …`, que
suena contradictorio para un lector no técnico y se aparta del texto aprobado.

### V4 · El Laboratorio cuenta las frases del VD como «Disfunción sistólica VI» — PREEXISTENTE

`_LAB_HALLAZGOS` usa `/disfunci[oó]n\s+sist[oó]lica/i`, que **no distingue el ventrículo**: una
frase del VD («VD dilatado con disfunción sistólica.») cuenta en la fila rotulada «Disfunción
sistólica VI» del dashboard y de la sección 3 del PDF de auditoría. Lo mismo con «Disfunción
diastólica», que no distingue VI de VD.
**No es de esta tanda:** pasa igual en HEAD y está medido con las propias funciones del
Laboratorio. Las frases nuevas no agregan ni quitan nada ahí —**«HVD» no matchea el patrón de
HVI**, verificado—, así que el recuento no se mueve por este trabajo.
**Qué habría que hacer:** anclar el patrón al ventrículo (`del VI` / `del VD` / sigla) o separar
las dos filas. Toca el Laboratorio y la orden lo prohíbe explícitamente.

### V5 · La app no gradúa la pared del VD, y la guía sí

La Tabla 1 del folio 145 la gradúa `≥0,5 a ≤0,7` leve · `>0,7 a ≤0,9` moderada · `>0,9` severa.
La app informa **hipertrofia sí o no**, que es lo que pidió la orden.
**Por qué no se agregó:** una banda intermedia es contenido clínico y decide Maicol. Si se
autoriza, las tres bandas salen de la misma Tabla 1 y los operadores están transcriptos en
`FUENTES.md`.

### V6 · El Tei no tiene columna de Excel, ni la pared

Decisión de la orden («EXCEL: SIN columnas nuevas; queda en 435»). Los dos campos viajan con el
estudio y se restauran, pero **no viajan al Excel**, así que no entran en el Laboratorio ni en
ningún análisis de cohorte, y un backup a Excel + reimportación los PIERDE.
**Lo que habría que hacer si se autoriza:** dos entradas en `LAB_XLS_MAP` en el bloque del VD más
sus bandas en `LAB_XLS_RANGO_PROPIO` —que pueden consumir `VD_NUEVOS_BANDA` por referencia, como
hizo el strain de contracción— y adaptar los casos que afirman 435.

### V7 · El corte del Doppler PULSADO del Tei existe y no se usa

`VD_TEI_PW_ALT_MIN` (0,40) está declarado y **ningún camino lo aplica**: el campo de la app es de
DTI y su corte es 0,55. Está escrito para que un borde se entienda al lado del que no se eligió, y
porque confundir los dos métodos mueve el corte un 27 % sobre un informe firmado.
**Qué haría falta para usarlo:** un campo propio del Tei por Doppler pulsado, o un selector de
método. Es un campo nuevo y no se pidió.

### V8 · Las tres advertencias del Tei que la app NO puede detectar

La guía nombra cuatro condiciones de carga (folio 159) y el cartel ámbar sólo cubre dos:

| Advertencia de la guía | ¿Detectable? | Por qué |
|---|---|---|
| IT severa acorta el IVRT | **sí** | `it_grado === '4'` |
| R-R variables (FA) | **sí** | `diast_ritmo === 'fa'` |
| Precarga aumentada / congestión derecha | **no** | la app no tiene un campo de estado de volumen; la VCI y la PAD estimada son proxies y usarlas sería inventar un criterio |
| HTP / poscarga aumentada | **no decidido** | la PSAP estimada existe (`psap_calc`), pero el cartel diría «puede no ser válido» en casi todo paciente con HTP, que es justamente la población donde la guía más lo recomienda. **Un gate que grita de más se deja de leer.** |
| «No es el único método cuantitativo» (Recomendación 1) | **no se afirma** | es una recomendación de conducta, no un hallazgo del estudio |

### V9 · Los cortes de TAPSE, S′ y FAC no se compararon contra la ASE 2025

La Tabla 1 del folio 145 trae TAPSE `>1,7 cm`, S′ `>9,5 cm/s` y FAC `>35 %`, que **coinciden** con
los que la app aplica desde la ASE 2015 (17 mm, 9,5 cm/s, 35 %) — pero la guía nueva agrega bandas
de severidad para los tres y **la app no las usa**. No se tocó ni un corte: esta orden pedía la
pared y el Tei.
⚠️ Y el **S′ sigue siendo un literal `9.5` dentro de `calcVD` y de `generarInforme`**, no una
constante: son dos copias del mismo número y este archivo ya documenta lo que pasa con eso.

### V10 · La Tabla 6 del folio 169 (función diastólica del VD) no se usó

Trae los cortes diastólicos del VD —E/A, e′/a′, E/e′, TDE— y la app los toma de la **ASE 2010**
(`DT_EA_RELAJ`, `DT_EA_RESTR`, `DT_EEP_ELEV`). **No se compararon.** Cambiarlos es mover umbrales
clínicos de una zona que esta orden no nombra.

---

## Función diastólica BSE 2024 en ritmo sinusal (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda de la BSE 2024 **midió y dejó como está**, con el motivo de cada uno. La zona
está mapeada en `docs/mapa/diastolica.md` → «`diastBSE2024Evaluar`» y las fuentes en
`docs/fuentes/FUENTES.md` → `### bseDiast2024 — RITMO SINUSAL`.

### ✅ B1 — CERRADO el 2026-10-12. El LAPs y la onda L YA tienen campo

La tanda del strain de la AI agregó `ai_strain_ct` («strain de contracción de la AI», que es el
LAPs) y `onda_l`, y los **cuatro** pasos que quedaban en gris votan: las dos cajas de strain de la
Figura 17, las dos de la Figura 18 y la onda L en los suplementarios de las dos. La consecuencia
medida que este punto declaraba —«un paciente con discordancia 1 y 1 y sin LARS queda
indeterminado»— ya no se alcanza por falta de campo: con el strain de contracción cargado la rama
decide. El Excel pasó de 434 a **435 columnas**. Ver `docs/mapa/diastolica.md` → «Los campos de
strain de la AI y la onda L» y la sección nueva de `docs/fuentes/FUENTES.md`.

El texto original, que es lo que se cerró:

### B1 · El LAPs (strain de bomba de la AI) y la onda L no tienen campo

Las Figuras 17 y 18 los usan en la rama del strain: el LAPs como alternativa del LARS en los dos
sentidos (`≥14 %` normal en la 17, `<8 %` elevado y `≥14 %` normal en la 18) y la onda L como
parámetro suplementario (`>20 cm/s`). **La app no los mide y la orden pidió no agregar campos**
(el Excel estaba entonces en 434 columnas), así que los dos quedaron declarados **no evaluables**: se dibujaban
en la ventana con el motivo en su propio rótulo y no cuentan.

**Consecuencia medida:** un paciente con discordancia 1 y 1 y **sin LARS** queda
**indeterminado** aunque tuviera el LAPs medido en otro lado. Es lo que la guía manda hacer
cuando el strain no se puede analizar (folio 36), pero la app llega ahí por no tener el campo,
no por no poder medirlo.

### B2 · «Known myocardial disease» no abre la vía reducida

La entrada de la Figura 18 es `LVEF <50% OR GLS <16% OR known myocardial disease`, y el folio 35
la define: cardiopatía isquémica con alteraciones sectoriales, miocardiopatía, HVI patológica.
**No hay un campo que lo declare**, así que la vía se abre sólo por FEVI o GLS. Un paciente con
FEVI 60 %, GLS −20 % y una miocardiopatía conocida corre la Figura 17 y se le valora la
relajación por el e′, cuando la guía la daría por alterada.

Se podría derivar de campos existentes (trastornos sectoriales, masa del VI), pero eso es
inventar un criterio de entrada que la guía escribe en prosa y no en una fórmula. **Decisión de
Maicol.**

### B3 · La zona gris de FEVI/GLS corre la vía de FEVI normal

Pedido por la orden y conservado. La guía no la resuelve con un número —«LVEF and GLS cannot
provide binary normal/abnormal cut-offs»— y pide interpretar volúmenes, TDI, informes previos,
historia clínica y síntomas. La app lo **declara** con un aviso ámbar y no cambia ningún
veredicto; está medido (FEVI 52 y GLS −17 dan el mismo badge y la misma vía que FEVI 60 con
GLS −20).

### B4 · El Ar−A tiene DOS constantes en la app, con dos operadores

`VENP_AR_A_MS` vale 30 con borde **`>=`** y es el criterio de la ASE/EACVI 2016 que pinta la fila
de la vena pulmonar y la celda del PDF. La BSE escribe **`> 30`** y por eso esta tanda agregó
`BSE_ARA_SUPL`. **No se unificaron**: son dos guías con el mismo número y distinto borde, y
tocar `VENP_AR_A_MS` movería la alerta de la vena pulmonar, que es otro módulo y otro informe.
Un Ar−A de 30,0 exacto es **positivo** para la fila de la vena pulmonar y **negativo** para el
paso suplementario de la BSE, en la misma pantalla.

### B5 · Los cuatro tokens nuevos del Laboratorio salen del denominador

`_labDiastGrado` devuelve ahora `bse_det_normal`, `bse_det_elevada`, `fa_elevada` y
`pres_normal_sin_grado`. Ganan la **columna de texto** del Excel y **no activan ningún `DD_*`**,
que es lo pedido: la BSE abandonó los grados I-III. Pero además:

- **salen de la distribución diastólica del panel y del PPT estadístico**, porque `_labDiastDist`
  sólo cuenta las claves `I`, `II`, `III` y `sin` (guarda de `hasOwnProperty`). No rompe ningún
  gráfico —el denominador `tot` simplemente no los incluye—, pero un laboratorio que informe con
  la BSE va a ver una torta diastólica construida sobre menos estudios de los que tiene;
- **quedan fuera del filtro de cohorte por grado**, porque `#coh-diast` tiene cuatro opciones
  fijas. Es lo que su propio texto de ayuda ya advierte («Un estudio cuyo informe no los nombre
  queda fuera del filtro»);
- **dejan de aparecer en dos indicadores de auditoría** —«E/e' >14 sin clasificación de
  disfunción diastólica» y «Vol AI elevado sin función diastólica documentada»—, que preguntan
  por `_labDiastGrado(i) === null`. Eso es lo correcto: ahora sí tienen clasificación.

Agregar una quinta categoría a la torta o una quinta opción al filtro **cambia un gráfico y una
pantalla del Laboratorio, y es decisión de Maicol.**

### B6 · Dos frases de estudios GUARDADOS siguen sin clasificar

«Presión de llenado del VI elevada (…), compatible con disfunción diastólica significativa.» y
«Disfunción diastólica con presión de llenado del VI elevada, en contexto de función sistólica
deprimida/cardiopatía conocida.» son las que esta app publicó **hasta hoy** con la BSE, viajan en
los estudios ya archivados y `_labDiastGrado` las devuelve en `null` — como antes de esta tanda.
**No se tocaron a propósito:** la orden pide que lo que no tiene las frases nuevas quede idéntico
a HEAD, y reclasificarlas movería la estadística de estudios ya firmados. Verificado con las seis
frases viejas.

### B7 · La indeterminada de la vía reducida no dice que la relajación está deteriorada

La prosa del folio 37 la llama «LV relaxation is therefore impaired but with indeterminate LVFP».
La app publica la plantilla de presión indeterminada, que es una de las cuatro aprobadas, y **no
afirma la relajación deteriorada**: no hay una quinta plantilla y escribir una sería inventar una
frase de informe firmado. **Decisión de Maicol.**

### B8 · La coletilla de contexto de la vía reducida se fue

HEAD escribía «… en contexto de función sistólica deprimida/cardiopatía conocida». Las dos vías
llegan a LA MISMA casilla de la guía, así que comparten la plantilla y esa coletilla desapareció.
El dato que repetía (la FEVI) sigue en su propia línea del informe. **Si Maicol la quiere de
vuelta, es una línea.**

### B9 · El nombre de la categoría 1: la guía dice «Normal diastolic function»

La casilla verde de la Figura 17 se llama, literal, **«Normal diastolic function»** — sin «para
la edad». La plantilla que la app publica es la que escribió Maicol en la orden: **«Función
diastólica normal para la edad»**. Se conservó la suya porque es texto de informe firmado y la
orden la enuncia en su sección de decisiones del médico; el calificativo además es cierto (el
paso del e′ ES específico por edad) y es el lado conservador. **Queda reportado: si prefiere el
nombre literal de la guía, es una línea en `BSE_FRASE`.**

## Función diastólica ASE 2025 (2026-10-12) — DECLARADO y NO arreglado

Lo que la tanda del 2026-10-12 **midió y dejó como está**, con el motivo de cada uno. La zona
entera está mapeada en `docs/mapa/diastolica.md` y las fuentes en `docs/fuentes/FUENTES.md` →
`### aseDiast2025`.

### 1 · [CERRADO 2026-10-12] El cuadro gris se atrasaba: `calcDiastol` no estaba cableado

**Cerrado en la tanda de la fibrilación auricular.** Se cablearon **once** campos al `oninput` de
siempre: `peso`, `talla`, `fevi`, `ai_vol`, `vmax_it`, `it_vmax_cw`, `tde`, `triv`, `venp_sd`,
`vci_diam` y `vci_col`. El TDE y el TRIV no tenían manejador **ninguno**.

Medido en A/B contra HEAD, tipeando en el orden natural: en ritmo sinusal con la ASE 2025, HEAD
decía «No estimable» en los cuatro campos que siguen al Vol AI y sólo se ponía al día al tipear
el LARS, que es el último; el árbol nuevo cambia en el Vol AI mismo. Con la BSE, lo mismo entre
«Normal» e «Indeterminado». **El veredicto final es idéntico en los dos** —es una función pura de
los campos— y lo único que cambió es cuándo se repinta.

No se usó un oyente global: `calcDiastol` arrastra `calcHemo`, `calcVenaPulm`, `imOndaEPintar` y
el aviso de protocolo, y colgarla de cada tecla de la app entera se paga en todas las pestañas.

### 2 · El rojo del E/e' no sigue los tres cortes por sitio

`calcVenaPulm` pinta el E/e' en rojo con `UMBRAL_EE_ELEVADA` (14) y `>`, y `eeCorteEs14()` lo apaga
en la rama de BSE + FA. Con la ASE 2025 los cortes pasaron a ser **septal ≥15 · lateral ≥13 ·
promedio ≥14**, así que con **un solo anillo** el color y el veredicto pueden discrepar: un E/e'
septal de 14,5 se pinta **rojo** y el criterio es **negativo** (su corte es 15). No se tocó porque
el comentario de `UMBRAL_EE_ELEVADA` ya declara que ese número lo comparten **cuatro** lugares más
—los dos BSE, el ASE 2016 y el Laboratorio— y unificarlo toca tres algoritmos y el Laboratorio.

### 3 · Dos rótulos del cuadro mienten con un solo anillo

`#eprom-val` dice **«e' promedio»** y muestra el valor del único anillo medido, y `#ee-val` dice
**«E/e' promedio»** con el cociente de ese único sitio. Pre-existente, sólo de pantalla, y el
cálculo ya no se confunde (`prom` vale `null` con un anillo). Corregir el rótulo es tocar el
marcado de dos celdas del cuadro gris.

### 4 · El S/D venoso pulmonar no es evaluable, y por eso el segundo paso tiene tres patas y no cuatro

El corte de la Figura 3 es **≤0,67** (equivale a una fracción de llenado sistólico ≤40 %) y el
campo `venp_sd` es un `<select>` de **«<1 / >1»**: un S/D de 0,9 es «<1» y **no** cumple el
criterio. El criterio quedó dibujado en **gris** con el motivo en su rótulo. Para habilitarlo hace
falta **un campo numérico nuevo** —el S/D, o la fracción de llenado sistólico— y esta tanda tenía
orden expresa de no agregar ninguno (el Excel estaba entonces en **434 columnas**; desde el
2026-10-12 está en **435**).

⚠️ **EN FIBRILACIÓN AURICULAR EL MISMO CAMPO SÍ ES EVALUABLE** (2026-10-12): el corte de la
Figura 8 de la ASE 2025 y el de la Figura 19 de la BSE es **< 1**, que es exactamente lo que dice
la opción del `<select>`. Es el mismo campo con dos cortes distintos, y el de ritmo sinusal cae
justo en el borde de la opción. Lo que sigue faltando es el campo numérico para el ≤0,67.

### 5 · El estado (a) entra al Laboratorio como «Sin disfunción»

`_labDiastGrado` clasifica por TEXTO, y el EN SUMA del estado (a) —«Presión de llenado del VI
normal.»— matchea su cuarta expresión (`llenado (del VI) normal`), así que ese estudio sale con
**«Sin disfunción»** en la columna «Grado disfunción diastólica» y con **`DD_Sin = 1`**. Medido:
pasa igual en HEAD, porque la frase que el estado (a) reemplaza —«e' reducida con presión de
llenado normal (…), pero el cociente E/A…»— **también** matcheaba esa expresión. O sea que no es
una regresión; es una imprecisión que ya existía y que ahora se ve mejor. Cambiarlo es cambiar
una frase del informe o la heurística del Laboratorio, las dos decisiones de Maicol.

### 6 · Las exclusiones que la app NO puede detectar

El aviso ámbar nombra **estenosis mitral de cualquier grado**, **insuficiencia mitral grave**,
**prótesis mitral** y **válvula mitral calcificada**. El pie de la Figura 3 excluye además:

| Exclusión de la guía | Por qué no se detecta |
|---|---|
| **Calcificación del ANILLO moderada o grave** | no hay campo. `vm_morf = 'Calcificada'` describe la **valva**, no el anillo, y por eso el motivo del aviso lo dice con esas palabras |
| **Plástica mitral** y **TEER ya realizado** | no hay campo que diga «ya operado»; el módulo de TEER evalúa **candidatura**, no antecedente |
| **IM primaria grave** (el mecanismo) | el aviso nombra la IM grave sin pedir el mecanismo: sobre un cartel que no cambia ningún veredicto, avisar de más es el lado seguro |
| **Asistencia ventricular**, **HP no cardíaca**, **trasplante**, **constricción pericárdica** | la app tiene módulos de constricción y de HP, pero ninguno expone un campo binario «este paciente es de ese grupo» |

Y la guía trae **algoritmos propios** para cinco de esos grupos —CAM (Figura 4, folio 558),
trasplante (Figura 5, folio 559), HP no cardíaca (Figura 6, folio 560), FA (Figura 8, folio 563) y
la Tabla 7 del folio 557 para los demás— que la app **no implementa**. Son cinco algoritmos
nuevos, no un parche.

### 7 · [CERRADO 2026-10-12] Con «ASE 2025» y FA se graduaba con la vía SINUSAL de la BSE

**Cerrado en la tanda de la fibrilación auricular**, junto con los otros cinco defectos de esa
zona. Hoy `calcDiastol` decide el ritmo **antes** que la guía y cada una corre su propio
protocolo: Figura 8 (folio 563) para la ASE 2025, Figura 19 (pág. 39) para la BSE y la sección E
del folio 295 para la ASE/EACVI 2016, que **no tiene regla de conteo** y por eso no da veredicto.
La zona entera está en `docs/mapa/diastolica.md` y las fuentes en `docs/fuentes/FUENTES.md`.

#### Lo que esa tanda dejó declarado y NO tocó

1. **El Laboratorio no cuenta los estudios en FA.** La frase nueva —«Disfunción diastólica con
   presión de llenado elevada (con FA).»— no coincide con ninguna de las cuatro expresiones de
   `_labDiastGrado`, así que esos estudios clasifican como `null` y quedan fuera de la
   distribución diastólica y de las cinco columnas `DD_*` del Excel. Verificado en 27 escenas.
   Cambiarlo es cambiar la heurística del Laboratorio o la frase del informe: decisión de Maicol.
2. **El IMC de 30,00 exacto depende de la talla, por punto flotante.** El corte es `> 30` y un 30
   exacto es negativo —verificado con talla 100 y peso 30—, pero `(170/100)**2` vale
   `2.8899999999999997`, así que **86,7 kg con 170 cm da 30.000000000000004 y cruza el corte**. No
   se tocó `getIMC`: es el dueño único y lo comparten `calcBSA`, el encabezado del PDF y el PPM
   mitral, y redondear ahí movería tres superficies por un borde de una.
3. **Tres parámetros de la ASE/EACVI 2016 no son evaluables**: la aceleración pico de la onda E
   (≥1.900 cm/s²), el TD de la onda D de la vena pulmonar (≤220 ms) y el E/Vp (≥1,4) no tienen
   campo. Se dibujan en gris con el motivo en su rótulo. Habilitarlos son **tres campos nuevos** y
   esta tanda tenía orden expresa de no agregar ninguno.
4. **La ventana de la BSE y la de la ASE 2016 siguen calculando por su cuenta EN RITMO SINUSAL.**
   En FA las tres leen el dueño único; en sinusal, sólo la ASE 2025. Medido al cerrar: con la BSE
   en sinusal el cuadro dice «Indeterminado» y su ventana no coincide. Es el punto 8 de abajo.
5. **El rojo del E/e' no sigue los cortes de la FA.** `eeCorteEs14()` apaga el color con BSE + FA
   y lo deja con `>14` en todo lo demás; el corte de la FA es el septal `>11` en las dos guías que
   lo tienen. Es el mismo nudo del punto 2 de este archivo y se arregla con él.
6. **El aviso de FC no mira el ritmo del ECG, mira el selector.** Si el médico carga una FC alta y
   deja `diast_ritmo` en sinusal, el aviso no sale —es correcto: es un límite del algoritmo de FA
   de la BSE—, pero tampoco hay nada que compruebe que el ritmo declarado y la FC son coherentes.

### 8 · Las diferencias B1 a B7 de la BSE 2024 y la ASE/EACVI 2016

Del reporte de la Fase 1, **sin corregir por orden expresa**, y verificadas como control negativo
en esta tanda (12 casos, 0 diferencias):

| # | Qué |
|---|---|
| B1 | **BSE: los cortes de e' son los de la ASE 2025, no los de la BSE.** La BSE los da por edad **y sexo** (Tabla 2, pág. 13: septal 18-40 varón <7,0 / mujer <8,0; 41-65 <5,0; >65 <4,0; lateral <9,0 / <11,0 / <6,0 / <5,0) y **no tiene corte de promedio** |
| B2 | **BSE: el juego de variables está cambiado.** Sus tres claves son E/e' >14, **IT >2,8** y LAVi >34 (págs. 35, 37); la app usa la **E/A** donde va la IT, y arranca por la relajación donde la BSE arranca por las presiones |
| B3 | **BSE: falta la sustitución por strain de AI** en el caso 1 positiva / 1 negativa, y con **una sola** variable evaluada la app afirma «elevada» |
| B4 | **ASE 2016: `pos === 1` sobre 3 disponibles debería ser grado I con PAI normal**, no «Indeterminado» (Figura 8B, folio 290) |
| B5 | **ASE 2016: el e' no vota** en el juego de cuatro variables de la 8A, y el `eprom < 8` que usa la app no existe en la guía |
| B6 | **Ventana ASE 2016: `<0,8` y `<50`** donde el original dice **≤0,8 y ≤50**. El cuadro ya está corregido; la ventana quedó atrás |
| B7 | **Ventana BSE: exige 3 de 3** para «LAP elevada»; la BSE dice **2 o 3** (pág. 35) |

⚠️ **Y las dos ramas no-2025 de la ventana siguen calculando por su cuenta**, con
`_daCriteriosLAP` y `_daContar`: para la ASE 2025 el cuadro y la ventana tienen un dueño único,
para la BSE y la 2016 **no**.

## Frases largas visibles en el panel de Evidencia (2026-10-11) — REPORTADO y NO tocado

Censo pedido al cerrar la tanda del marco del panel: las frases de **más de 25 palabras que
quedan visibles en el cuerpo** de cada sección, con el detalle y los ⓘ CERRADOS, para decidir
cuáles acortar en un trabajo aparte. **No se tocó ninguna.**

⚠️ **El denominador son las QUINCE secciones y con un paciente no se encienden.** La prótesis
mitral apaga las tres mitrales nativas (`vmEsProtesis`) y la insuficiencia mitral secundaria
apaga la primaria, así que el censo se armó con **tres pacientes** —13 + 13 + 12 secciones, 15
distintas— y se consolidó por sección. Un reporte armado sobre nueve y presentado como «todas»
es la forma en que una frase larga queda sin listar.

⚠️ **Y hay que ABRIR las secciones colapsadas antes de medir.** Una sección nace colapsada
cuando ninguna de sus filas trae `ok` ni `alarm` y su recomendación no es `ind` ni `alarma`;
medido sobre el árbol cerrado, la sección entera desaparece del censo y el reporte sale sin una
sola frase de ella. Las aperturas se hacen con un **clic real en el rótulo**, que es el gesto
del médico, y la sonda informa cuántas quedaron cerradas (cero en las tres escenas).

**Total: 22 frases distintas.** Lo que ya NO está en esta lista son las notas de las 34
preguntas, que la tanda del 2026-10-11 movió detrás del ⓘ: ocho de ellas pasaban de 25
palabras y por eso bajaron solas.

⚠️ **Casi todas son `guia.txt`, o sea el CRITERIO VISIBLE de la sección con su clase y su
nivel** —salen en `<b>`—. Eso las pone del lado del contenido clínico: acortar una es reescribir
la frase de una guía, que es decisión de Maicol y no se toca sin orden expresa. Las tres que
salen en `<td>` son notas de fila con marca ⚠️ o ❓, que la compuerta del ⓘ deja visibles a
propósito; las que salen en `<div>` son avisos de sección o notas de recomendación.

| Sección | Palabras | Nodo | Primeras diez palabras |
|---|---|---|---|
| Estenosis aórtica | 35 | `<b>` | Intervención Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia mitral primaria | 33 | `<b>` | Cirugía Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia mitral secundaria | 35 | `<div>` | Las dos tablas de esta sección son distintas: la auricular… |
| Insuficiencia mitral secundaria | 27 | `<b>` | Dos tablas distintas según el tipo: la AURICULAR indica cirugía… |
| Estenosis mitral | 31 | `<b>` | Un área valvular mitral ≤ 1,5 cm² JUNTO CON factores… |
| Estenosis mitral | 29 | `<div>` | Hay una contraindicación de la comisurotomía: Insuficiencia mitral asociada. ·… |
| Prótesis mitral | 42 | `<b>` | En la disfunción protésica significativa la reoperación es Clase I… |
| Insuficiencia aórtica | 38 | `<b>` | Cirugía Clase I · Nivel B en el paciente sintomático… |
| Insuficiencia aórtica | 35 | `<td>` | ⚠️ ≥ 45 mm, pero esa fila exige que la… |
| Insuficiencia aórtica | 32 | `<div>` | Los síntomas son lo que separa la Clase I —que… |
| Válvula tricúspide | 63 | `<b>` | La cirugía tricuspídea concomitante es Clase I · Nivel B… |
| Válvula tricúspide | 36 | `<td>` | ❓ condición no verificable acá: las filas piden HTP severa,… |
| Estenosis pulmonar | 72 | `<b>` | Con un gradiente máximo por Doppler mayor de 64 mmHg,… |
| Estenosis pulmonar | 63 | `<div>` | La estenosis es severa. La tabla se parte en tres… |
| Estenosis pulmonar | 44 | `<td>` | ❓ la fila del asintomático pide PSVD mayor de 80… |
| Comunicación interauricular | 43 | `<b>` | Cierre Clase I · Nivel B con sobrecarga de volumen… |
| Comunicación interventricular | 32 | `<b>` | El cierre de la comunicación interventricular es Clase I en… |
| Ductus arterioso permeable | 37 | `<b>` | El cierre del ductus es Clase I · Nivel C… |
| Coartación de aorta | 32 | `<b>` | Reparación Clase I · Nivel C en pacientes HIPERTENSOS con… |
| Foramen oval permeable | 31 | `<b>` | Recomendación FUERTE a favor del cierre percutáneo en pacientes seleccionados… |
| Miocardiopatía hipertrófica obstructiva | 38 | `<b>` | La terapia de reducción septal para mejorar los síntomas es… |
| Válvula aórtica bicúspide — aorta ascendente | 32 | `<b>` | Cirugía Clase I · Nivel B con diámetro máximo ≥… |

Cómo se vuelve a medir, sin leer este archivo:

```bash
node scripts/_probe_evidmarco.mjs --solo frases
```

---
## Estenosis mitral binaria (2026-10-11) — REPORTADO y NO tocado

De la tanda «significativa / no significativa, con gradiente elevado de 5 a menos de 10»
(`dae0064`, `128dc4f`, `0142b24`). Nada de esto es un defecto que la tanda haya introducido.

### ⚠️ La pestaña Referencias enuncia la regla VIEJA, en prosa y en una tabla

La tarjeta «🟠 EM — Estenosis Mitral» de Referencias es TEXTO FIJO y hoy dice tres cosas que la
app ya no hace:

| Lo que dice la tarjeta | Lo que hace la app desde el 2026-10-11 |
|---|---|
| «Con AVm > 1,5 y **gradiente medio > 4 mmHg** publica «EM con gradiente elevado»» | el corte es `>= 5`, y de `>= 10` publica «estenosis significativa» |
| «Si dos áreas válidas caen a los dos lados del corte, se publican **las dos** con su método y **prevalece el peor**, con «probablemente severa por …»» | prevalece el peor igual, pero la categoría «probable» **se eliminó**: el veredicto es «significativa» a secas |
| la fila de la tabla: «AVm — **estenosis mitral severa** — ≤ 1,5 cm²» | el corte y su fuente (ASE 2023, Tabla 1) son los MISMOS; lo que cambió es la palabra |

**Por qué no se tocó:** es contenido clínico de cara al médico en otra pestaña, y la orden de la
tanda acotaba el papel al informe, al EN SUMA y al cuadro de Válvulas. **Decisión de Maicol.**
Nota a favor de dejarla: esa misma fila ya dice que **«la ESC/EACTS 2021 usa el mismo corte y lo
llama *clínicamente significativa (moderada o severa)*»** — o sea que la nomenclatura nueva
coincide con lo que la tarjeta atribuye a la ESC. Lo que hay que corregir es el «> 4», el
«probablemente severa» y la palabra «severa» de la fila.

### ⚠️ El Laboratorio cuenta la EM con la escalera de cuatro grados

`_labEstenSev(inf, 'em_grado')` hace regex sobre el **valor guardado** y devuelve
`Severa / Moderada / Leve / Sin`. Como `emGradoAuto` sigue escribiendo `'severa'`, **la fila
«Esten. Mitral» del Laboratorio no cambió ni una celda** y por eso la tanda no lo tocó.
Lo que queda dicho: la etiqueta que el Laboratorio imprime es **«Severa»**, mientras el informe
firmado del mismo estudio dice **«significativa»**. Son dos vocabularios para el mismo dato en dos
superficies de la misma app. Es el mismo pendiente que la **estenosis tricuspídea** ya tiene
abierto desde el 2026-10-05 (su `_labEstenSev` devuelve `null` para los dos grados nuevos), así
que conviene resolver los dos juntos y decidir cuántas categorías cuenta esa fila.

### ⚠️ `VALVSIG` de CeiboAnalytics no reconocería «significativa» — hoy no importa, pero importará

Su regex es `/severa|moderada/` sobre el valor guardado. Como el valor sigue siendo `severa`, **una
EM significativa SÍ cuenta** hoy como valvulopatía significativa. Queda anotado porque el día que
alguien renombre el valor guardado —no la palabra visible— esa cuenta se cae en silencio, en otra
app. Es el mismo agujero que la ET ya tiene (ella SÍ escribe «Significativa» como valor).

### ⚠️ La banda `< 5 mmHg` del cuadro no tiene rótulo de veredicto

El pedido definió dos rótulos —«elevado (5 a <10 mmHg; moderada, ASE 2023)» y «significativo
(≥10 mmHg)»— y ninguno para el gradiente por debajo de 5. El cuadro publica la **banda**
(«< 5 mmHg») y ninguna palabra de veredicto, para no inventar redacción clínica. Si Maicol quiere
una, es una línea.

### ⚠️ El EN SUMA de la banda media ya no nombra el gradiente elevado

Es **pedido explícito** (punto 3c): el resumen dice «EM no significativa.» y el gradiente elevado
sale sólo en el cuerpo del informe. Queda anotado porque el EN SUMA es la superficie que se copia
a una interconsulta o a un resumen de alta, y ahí el hallazgo desaparece.

### ⚠️ La nota «a FC de 60-80 lpm» de la Tabla 1 no se verifica

Los dos cortes del gradiente de la ASE 2023 valen **a una frecuencia cardíaca de 60-80 lpm**. La
app no recoge la FC del Doppler transmitral, así que aplica los cortes sin comprobar la condición.
Está dicho en `FUENTES.md` y en el comentario de las constantes.

### Lo que queda citando «ESC/EACTS 2021» fuera de esta tanda

Censado el 2026-10-11 y **no tocado**, porque cada uno es contenido clínico de otro módulo: el
encabezado visible de la tarjeta de **IT** de Referencias, el de **CRITERIOS ANATÓMICOS ESC 2021**
del score de Wilkins / CMP, el subtítulo de la tarjeta de **TEER**, y la prosa de la tarjeta de EM.
La tabla con lo que habría que hacer en cada uno está en `docs/fuentes/FUENTES.md`, en la sección
««ESC/EACTS 2021» NO EXISTE EN ESTE REGISTRO».

---

## Evidencia de la estenosis mitral (2026-10-11) — REPORTADO y NO tocado

De la tanda «estructura por etiología + textos y fuentes de la guía 2025» (`af0eb13`, `90a7630`).
La sección del panel ahora usa la MISMA función y las MISMAS constantes que el informe, así que las
dos divergencias que ese panel tenía quedaron cerradas. Lo que sigue abierto:

### ⚠️ La app aplica a TODA etiología dos cortes que su única fuente escribió para la reumática

`EM_GMEDIO_ELEVADO_MIN = 5` y `EM_GMEDIO_SIGNIF_MIN = 10` salen de la **Tabla 1 de la ASE 2023,
folio 8**, que es un documento de **cardiopatía reumática**, y `emCategoria()` los aplica sin mirar
`vm_morf`. La ESC/EACTS 2025 **no publica cortes de severidad de estenosis mitral** (verificado:
sólo un enunciado en prosa del área en el folio 4680, y el gradiente mencionado como consecuencia
con valor pronóstico, más la «low-gradient severe MS» con gradiente < 10 mmHg como grupo difícil —
ninguna de las dos cosas es un corte).

**Qué hace el panel mientras tanto:** cita a la ASE 2023 **sólo con etiología reumática** —lo fija
TC-327— y con otra etiología publica una nota que declara la discrepancia **sin nombrar el
documento y sin corchete**, porque nombrarlo sin bracket rompe la otra regla del registro. Se
pierde saber cuál es el documento; no se pierde que el corte se está aplicando fuera del alcance de
su fuente.

**Decisión de Maicol:** o se acota el criterio del gradiente a la etiología reumática en
`emCategoria` —que cambia el informe firmado de las degenerativas—, o se verifica una fuente que
escriba esos cortes para cualquier etiología, o se deja como está con la declaración.

### ⚠️ Cuatro contraindicaciones sin contestar NO cortan las filas de la tabla

De las siete de la Tabla 8, la app **mide** dos (área e insuficiencia mitral) y **pregunta** cinco.
El trombo sin contestar **sí** corta —la guía dice que el ETE se hace sistemáticamente en el
candidato para excluir trombo auricular, folio 4680— y el área sin medición también. Las otras
cuatro —calcificación severa o bicomisural, ausencia de fusión comisural, valvulopatía aórtica
severa o enfermedad tricuspídea combinada severa con indicación quirúrgica, y coronariopatía que
requiera revascularización— **no cortan**: exigirlas dejaría las cinco filas en «falta contestar»
para TODO paciente y la sección sería muda de fábrica. El aviso del bloque 2 lo declara con el
conteo («Quedan N contraindicaciones sin contestar, y no cortan las filas de abajo»).

### ⚠️ «No apto para comisurotomía» es una derivación de la aplicación

La fila 3 de la Recommendation Table 8 dice *«MV surgery is recommended in symptomatic patients who
are **not suitable for PMC**»* y la guía **no define** «not suitable»: es un juicio del Heart Team.
El panel lo deriva de «características clínicas desfavorables» —no de la anatomía, porque la fila 4
rutea la anatomía subóptima con clínica favorable a comisurotomía— y **lo declara en la propia
fila**. La alternativa sería preguntarlo como un control más.

### ⚠️ La definición del «score ecocardiográfico > 8» no se pudo leer

> **✅ LA TABLA S3 YA ESTÁ EN LA BIBLIOTECA (2026-10-12).** Vive en
> `.../04_Valvulopatias/ehaf194_supplementary_data.pdf`, p. 5, y está **verificada en texto
> completo** en `docs/fuentes/FUENTES.md`. Define el score de **Wilkins** y el de **Cormier** —así
> que «no se pudo leer qué escala es» dejó de ser cierto—, y **sigue sin dar el corte «> 8»**: ese
> lo ponen las dos notas ^c. El párrafo de abajo es el estado de 2026-10-11 y lo que queda abierto
> es sólo lo del bloque siguiente: **las dos frases del panel que todavía dicen que no se pudo
> leer**.

La nota ^c del folio 4682 escribe el corte y remite a su *Supplementary data online, Table S3*,
que **no está en el archivo de la biblioteca**. El panel publica el corte **«según la guía»** y
**no lo atribuye a Wilkins ni a ninguna escala concreta** — el artículo de Wilkins 1988 no menciona
ningún 8, y atribuírselo (como hacía la versión anterior, con su corchete en la fila) era afirmar
algo que ese documento no dice. Si alguna vez se consigue la Table S3, se verifica qué escala es y
entonces la fila puede nombrarla.

### ⚠️ Glosario del panel (2026-10-12) — TRES COSAS DECLARADAS Y NO TOCADAS

Las tres salieron de la tanda del glosario (`IND_TERMINOS`, los ⓘ de Cormier y del score). **Decisión
de Maicol del 2026-10-12: ninguna se toca en esa tanda**; van a una tanda de TEXTOS del panel.

**1 · Dos frases del panel afirman que la Tabla S3 «no está en el documento consultado», y hoy sí
está.** Son contenido clínico del panel, así que se reportan y se esperan:

| Dónde | Qué dice hoy |
|---|---|
| Nota de detalle de la sección de estenosis mitral (la del corte del score) | «La definición de esa escala vive en su material suplementario (Table S3), **que no está en el documento consultado**: la aplicación usa el corte tal como la guía lo escribe y **no lo atribuye a ninguna escala concreta**.» |
| Comentario de `index.html` sobre la fila del score | «…remite a su Supplementary data online, Table S3, **que no está en el material consultado** — o sea que la definición de la escala no se pudo leer.» |

Lo que la Tabla S3 cambia: la escala **sí** se puede nombrar (es el score de Wilkins, y la tabla lo
llama así). Lo que **no** cambia: el **«> 8» sigue siendo de la guía y no de Wilkins 1988**, que no
menciona ningún 8. O sea que si esas frases se actualizan, hay que conservar esa mitad —es la que
evita atribuirle a un artículo un corte que no publica— y el único cambio honesto es dejar de decir
que no se pudo leer. **La tarjeta nueva del término ya dice lo correcto**, así que durante un rato
el panel tiene las dos versiones.

**2 · El panel muestra DOS rangos del score y los dos son ciertos.**

| Dónde | Rango | Documento |
|---|---|---|
| Tarjeta del término `score_eco` | grados **1 a 4**, total **4 a 16** | ESC/EACTS 2025, Tabla S3, p. 5 (literal: «ranges between 4 and 16») |
| Nota de guías previas de la sección, y `IND_REFS.wilkins1988` | **0 a 4** por ítem, total **0 a 16** | Wilkins 1988, Tabla 2, p. 300 |
| Los `<select>` del módulo ETE y de Calculadoras | rotulados **«(1-4)»**, total **/16** | — |

No es un error de ninguno de los tres: la Tabla S3 reproduce la escala con otro origen.
⚠️ **Unificarlos es elegir a qué documento desmentir**, así que no se hace sin orden expresa. Si
alguna vez se unifica, el camino honesto es declarar los dos rangos con su fuente —no borrar uno—.
Y ojo con el tercero: los selectores de la app coinciden con la **Tabla S3** (1 a 4) y no con el
original, cosa que `FUENTES.md` ya tenía anotada como discrepancia con el artículo.

**3 · El encabezado de la mitad de Wilkins de la Tabla S3 dice «MVA» — probable error del
documento.** Literal: *«Assessment of **MVA** according to the Wilkins score»*. En ese mismo
documento `MVA` es la sigla de **mitral valve area** (está así en el pie de la propia Tabla S3 y en
la Tabla S2), y la mitad de Cormier —dos renglones más abajo— dice *«Assessment of **MV anatomy**»*.
El score de Wilkins puntúa **anatomía**, no área: los cuatro componentes son movilidad,
engrosamiento, calcificación y engrosamiento subvalvular, y ninguno es una medida de superficie.
**Por eso la tarjeta titula «Score de Wilkins (Tabla S3)» y NO traduce ese encabezado** — hacerlo
publicaría «valoración del área mitral según el score de Wilkins», que es falso. Decisión de Maicol
del 2026-10-12. No hay nada que corregir en la app; queda anotado para que nadie lo «arregle»
traduciéndolo, y para el día en que haya una errata de la guía que confirmarlo.

### Lo que QUEDA de la tanda del glosario, medido y no corregido

- **La tarjeta puede superponerse a su propia fila** cuando no entra ni abajo ni arriba del botón: a
  1200 × 900 la del score mide 611 y la caja permitida 844, con el botón al medio. Queda **entera,
  dentro del panel y sin un pixel tapado** —medido con `elementFromPoint` en las cuatro esquinas y
  el centro—; lo que se pierde es ver la fila mientras se lee la tarjeta. La alternativa era
  recortarla y hacerla scrollear siempre, que es peor para una tabla de referencia.
- **Contestar una pregunta clínica con la tarjeta abierta la CIERRA.** Es lo pedido —un control
  clínico está «afuera»— y está medido como tal; el re-anclaje queda para los repintados que no
  vienen de un clic. Si algún día se quiere que sobreviva al clic, lo que hay que cambiar es el
  oyente de «tocar afuera», no el re-anclaje.
- **Tab dentro de la tarjeta se gasta en cerrarla**, así que para seguir tabulando hace falta uno
  más. Es la alternativa a una trampa de teclado sin salida anunciada.
- **`docs/mapa/panel-evidencia.md` quedó en 35,3 KB**, apenas por encima del techo de ~35 KB que
  `ecosmart/CLAUDE.md` fija. El glosario ya salió a su propio archivo
  (`docs/mapa/panel-evidencia-terminos.md`, 15 KB) justamente por eso; **la próxima tanda que lo
  toque conviene que lo parta**, no que lo estire.

### ⚠️ Las dos contradicciones internas de la ESC/EACTS 2025, declaradas y no corregidas

- **El operador del área**: `≤ 1,5 cm²` en el enunciado del folio 4680 y en el título de la Figura
  14 (folio 4681), y `< 1,5 cm²` en el §10.2.3 del folio 4680. La app usa `≤`.
- **«Varias»**: la nota ^c de la Recommendation Table 8 (folio 4682) dice «several of the
  following» sin número, y la nota ^c de la Figura 14 (folio 4681) dice «Favourable = absence of
  unfavourable characteristics», o sea cero. El panel no elige: con «Una» publica las dos lecturas.

### Los dos lugares que siguen enunciando la regla vieja — RE-CENSADOS y NO tocados

Los dos ya estaban abiertos de la tanda anterior y esta tanda **no los modificó**; se re-verificó
que siguen igual (el diff de los dos commits toca sólo la zona del panel y el sello de versión):

1. **La tabla «Referencia clínica» de la ayuda** (`abrirAyudaEco`): su fila de severidad dice «AVm —
   **estenosis mitral severa** — ≤ 1,5 cm²», cita «**ESC/EACTS 2021**» —que tiene **cero** entradas
   en `FUENTES.md`— y su resumen sigue hablando de «**probablemente severa por …**», categoría
   eliminada el 2026-10-11. Ver «La pestaña Referencias enuncia la regla VIEJA» arriba.
2. **`_labEstenSev` del Laboratorio**: hace regex sobre el valor guardado y devuelve «Severa» donde
   el informe del mismo estudio imprime «significativa»; su comentario sigue describiendo el select
   viejo (`sin/esclerosis/leve/moderada/severa`). Ver «El Laboratorio cuenta la EM con la escalera
   de cuatro grados» arriba, y conviene resolverlo junto con el pendiente de la **tricúspide**.

---

## EN SUMA · morfología y prótesis (2026-10-05, parte D) — declarado y NO arreglado

De la tanda «EN SUMA: morfología y prótesis en una línea (pulmonar y tricúspide)». Nada de esto es
un defecto introducido por esa tanda: los tres están **medidos en HEAD y en el cambio con el mismo
resultado**. Los encontró `/sharp-edges` corriendo sobre el propio diff.

### ⚠️ El grado calculado con cortes NATIVOS sobrevive al cambio a prótesis

**Qué se midió.** Dos gestos, en el orden del día a día:

| gesto | pulmonar | tricúspide |
|---|---|---|
| 1 · cargar el dato con la válvula nativa | `vp_vmax = 3.5` → `calcVP` escribe `ep_grado = 'Moderada'` | `et_gmedio = 6` → `calcET` escribe `et_grado = 'Significativa'` |
| 2 · elegir la prótesis en Válvulas | `ep_grado` sigue en `'Moderada'` | `et_grado` sigue en `'Significativa'` |

El `onchange` de `vp_morf` es `vpSync();valvProtSync()` y el de `vt_morf` es `valvProtSync()`:
ninguno limpia el `<select>` de grado ni vuelve a llamar al calculador — y si lo llamara, saldría
por `protNoGraduaPintar` **antes** de tocarlo.

**Qué causa.** El informe firmado gradúa con cortes de válvula nativa lo que la app se niega a
graduar. Y **el cuerpo ya lo hacía en HEAD**: imprime «Válvula pulmonar con prótesis biológica y
estenosis moderada (Vmax 3.5 m/s, Gmax 49 mmHg)». Lo que cambió con D es sólo el renglón del
resumen, que pasó de «EP moderada.» a «VP protésica biológica con estenosis moderada.» — o sea que
D hizo el resumen **coherente con el cuerpo**; la fuga está aguas arriba, en el campo de grado.

**Peor en la pulmonar:** el badge `vp-sev-badge` sigue diciendo «Sugerido automáticamente por Vmax
3.5 m/s → Gmax 49 mmHg…» sobre una válvula cuyo badge debería decir `PROT_SIN_GRADO_TXT`, porque
`calcVP` sólo corre desde el `oninput` del Doppler. La pantalla se contradice con su propia regla.

**Por qué no se corrigió.** Retirar el grado residual al cambiar de morfología cambia el criterio
de una válvula protésica en el informe firmado —decisión de Maicol— y el `onchange` es código
compartido con el resto de la sincronización de válvulas. **Alternativas, sin elegir ninguna:**
(a) que el `onchange` de la morfología devuelva el grado al centinela cuando pasa a prótesis — el
gesto más honesto, pero reescribe un campo que el médico pudo haber fijado a mano;
(b) que el emisor no publique grado de estenosis con prótesis (ni en el cuerpo ni en el resumen),
dejando `VP protésica biológica.` y los valores medidos — no toca ningún campo, pero borra del
papel un grado que el médico quizá fijó a propósito;
(c) repintar el badge al cambiar la morfología y dejar el grado como está — arregla la pantalla y
no el papel.

### ⚠️ «VT protésica biológica con estenosis no significativa.»

El grado de la ET es binario y `No significativa` es un valor elegible a mano (o traído por un
legado), así que la línea única puede decirlo. Es una frase **por la negativa** y, sobre una
prótesis, una afirmación de función conservada construida con cortes que la app declara
inaplicables — justo lo que la compuerta (3b) del bloque de «normofuncionante» existe para
impedir. En HEAD el mismo estado salía como `ET no significativa.`, así que no es nuevo.
No se tocó: es redacción clínica. Alternativa, sin elegir: en la rama protésica empujar la lesión
sólo con grado afirmativo y callar con «No significativa» (callar no es negar).

### ⚠️ El nivel de la EP se cae del EN SUMA con prótesis (no del cuerpo)

Medido: con `vp_morf = 'Prótesis biológica'`, `ep_grado = 'Moderada'` y `ep_nivel = 'Supravalvular'`,
el EN SUMA pasa de «EP moderada a nivel supravalvular.» (HEAD) a «VP protésica biológica con
estenosis moderada.». El **cuerpo lo conserva** («…y estenosis moderada a nivel supravalvular.»),
así que no desaparece del papel; desaparece de la superficie que se copia al resumen de alta.
El formato que Maicol escribió para la línea única no lleva nivel, y agregarlo es cambiar ese
formato. Alternativa: `«VP protésica biológica con estenosis moderada a nivel supravalvular.»`.

### Lo que NO es alcanzable y queda dicho, para no reabrirlo

- **`VP protésica transcatéter tipo TAVI.`** — `VALV_MORF_FRASE` tiene la entrada `TAVI`, así que
  `sumaProtLinea` la redactaría; pero `TAVI` **no es una `<option>`** de `vp_morf` ni de `vt_morf`,
  y el importador descarta la fila entera ante un valor que no está en la lista. No se agregó
  ninguna guarda: agregarla sería código para un estado que no se alcanza.
- **«con estenosis» sin grado en la PULMONAR protésica** — `_epSinGrado` lleva `!_epEsProt` adentro
  desde E5b-1, así que el escalón «botón prendido sin grado» no afirma estenosis en ninguna
  superficie. La tricúspide sí lo alcanza, por `etPill`. Lo fija TC-419 como límite declarado.

## 3D E2 (2026-10-04) — declarado y NO arreglado

De la tanda «color por territorio coronario + captura». Nada de esto es un defecto introducido:
son cosas medidas durante el trabajo que quedan abiertas porque están fuera del alcance del pedido
o porque son decisión de Maicol.

- **El VI 3D no tiene ni un caso en `test_clinico.mjs`.** `grep lv3d scripts/test_clinico.mjs` da
  **cero**: los 429 casos no tocan el panel. Toda su cobertura vive en sondas temporales
  —`scripts/_probe_vi3d.mjs` (tanda E1) y `scripts/_probe_vi3dcolor.mjs` (ésta, 101 aserciones)—
  que están versionadas pero **nadie corre automáticamente**. Es exactamente el patrón de EcoSmart
  S3/S4: cerrados pero sin cobertura automática, que es cómo un arreglo se deshace sin que nadie
  se entere. Pasar las aserciones a la suite es un trabajo aparte.
- **La brújula se corta y se superpone en la vista por defecto.** «Sep» se dibuja con x negativa y
  se recorta contra el borde izquierdo, y «Punta» pisa a «Lat» porque con la rotación identidad el
  eje de la punta proyecta sobre el origen de la brújula. Es **preexistente** (el código de la
  brújula viene de E1 y no se tocó), pero ahora queda horneado dentro del PNG de la captura, que
  es una imagen pensada para un informe. Se ve en `/tmp/vi3d_*_{claro,oscuro}.png`.
- **El comentario de `index.html` sobre la tarjeta del 3D dice «Lo mide TC-408» y es falso.**
  TC-408 es el escalón de estenosis pulmonar. El caso que mediría la maquetación de esa tarjeta no
  existe. Referencia cruzada rota de la tanda E1.
- **`scripts/check_mobile.js` no abre el panel del 3D**, así que no mide ninguno de sus controles.
  Su informe salió **byte a byte idéntico** a HEAD, pero para los controles nuevos eso es un cero
  sin denominador, no un aprobado: lo táctil del panel lo mide `_probe_vi3dcolor.mjs` (`LAY-2`,
  con el panel abierto a 1200/768/390/360 px).
- **La escalera de tonos tiene un paso apretado, y es el de la CD.** Normal ↔ Hipoquinesia de la
  circunfleja derecha da **8,9 ΔE2000**, el peor de los doce pares vecinos. No es «demasiado
  parecido» —8,9 se distingue cómodo— pero es el que menos margen tiene, porque la base de la CD
  (`#3ecf8e`, L\* 74,6) ya es la más clara de las tres y deja poco techo para dos pasos más claros.
  Separarlos más obliga a bajar el extremo oscuro o a mover el color base: **decisión de Maicol**.
- **`_lv3d.fase` sobrevive a `limpiarCampos`.** Abrir un estudio nuevo arranca el latido donde lo
  dejó el anterior en vez de en fin de diástole. No es fuga de dato del paciente —es estado de
  vista y la animación corre igual— pero sí hizo fallar dos veces la sonda, que creía estar
  midiendo con la fase congelada en 0. Si alguna vez molesta, se resetea en `lv3dNuevoPaciente`.

## ✅ CERRADO 2026-10-03 — la aórtica entró, y por una tercera salida

La decisión de Maicol no fue ninguna de las dos que este archivo ofrecía. **El invariante es
«botón prendido = hay valvulopatía», y elegir «Sin» APAGA el botón** — por los dos gestos: el menú ▼
(`valvSev.aplicar`) y el desplegable de grado final (`_gradoManoBorraMarca`, `emGradoManual`,
`imGradoManual`). Con el botón apagado, el estado 3 llega al emisor sin la tercera mitad de la
compuerta, así que `EA_ESCALON_SIN_GRADO` pudo ponerse en `true` **sin tocar la regla de la marca**:
«Aórtica 3b» queda intacta y por el desplegable siguen sin aparecer el aviso rojo ni el cajón.

Eso descartó las dos salidas de antes: la (a) traía el aviso y el cajón por ese camino, que era su
precio, y la (b) dependía de un `dataset.sugerido` ausente en un formulario en blanco.

Commits: `23eb4e2` (el invariante y el escalón) y `e8b03c5` (los defectos hermanos).
Casos: **TC-397** promovido de `casoAbierto` a `caso`; **TC-399** reescrito —pineaba el
comportamiento «en espera» a propósito—; **TC-402 … TC-407** nuevos. Mutaciones en
`scripts/_mut_sinapaga.py`.

### ⚠️ Lo que quedó abierto de la aórtica, medido y NO corregido

- **«Sin» en el desplegable aórtico no es durable.** Apagar el botón es un rastro, pero el
  autocálculo no lo respeta: reabrir el botón corre `sincronizarEADesdeValvulas → calcAo →
  clasificarEA_Vmax`, que no mira la pastilla y no tiene marca que lo frene, así que **regrada a
  «severa»** y el informe firmado publica «EAo severa.» sobre un «Sin estenosis» que el médico
  acababa de elegir. Medido el 2026-10-03 (escena `H-VUELTA-ea`). Control: la mitral lo conserva,
  porque su `onchange` sí enciende `esqSevManual`.
  Es **pre-existente** —no lo causa el escalón— y cerrarlo exige una señal nueva que sobreviva al
  recálculo sin ser `esqSevManual`: por ejemplo un `dataset.sinExplicito` en el `<select>`, que
  `limpiarCampos` barra y que las escritoras automáticas respeten. Eso es la decisión que «Aórtica
  3b» excluyó, así que **es tuya**.
- **Con prótesis aórtica el escalón de insuficiencia calla, a propósito.** La frase protésica tiene
  otra forma: `Válvula aórtica <morf>, <veredicto protésico><, insuficiencia …>`, sin el «con» que
  en la nativa carga el token. Con el escalón corriendo salía «…, sin datos suficientes para graduar
  la estenosis protésica, insuficiencia.» — un sustantivo colgado. Lo destapó el A/B de las 47
  escenas (`H11-prot-ia`), no la lectura. La prótesis quedó **exactamente** como en `42a1f0e` y el
  hueco se declara: una prótesis aórtica con la pastilla de insuficiencia abierta y sin grado sigue
  sin afirmar nada. Darle texto propio es escribir una frase de informe firmado — decisión tuya.
- **Apagar por regla deja la clave `valv-pill-*` en `'0'`**, que para `valvAutoAbrirCajones`
  significa «el médico lo cerró a mano, no reabrir». O sea que elegir «Sin» revoca la apertura
  automática de ese cajón en ese estudio. Se acepta —el médico dijo que no— y el daño que tenía
  (un grado publicado con su bloque invisible) lo cierra la mitad `hayGrado` de `valvGradoVisSync`.

### Lo demás que la tanda del `c808e69` reportó y no corrigió
- **La tricúspide tiene el mismo mecanismo sin gatear**: `etPill` y `hayIT` leen `pillOn` y no
  consultan `esqSevManual.et` / `.it`, que existen y se escriben. `et_grado` no tiene `onchange`
  (no marca, no repinta), el menú ▼ no ofrece «Sin» para esa válvula, y **cerrar su cajón borra el
  grado Y la marca**, así que cerrar y reabrir convierte una ET graduada en «Estenosis tricuspídea.»
  sin grado. Además su EN SUMA dice la frase larga donde la mitral ahora dice la sigla.
- **La pastilla es estado del navegador, no del estudio.** `toggleValvPill` la persiste en
  `localStorage` y `limpiarCampos` la borra; no viaja con el estudio guardado. Desde esta tanda ese
  estado decide texto del informe firmado: **el mismo estudio puede firmar «con estenosis» hoy y
  «sin estenosis ni insuficiencia» al reabrirlo mañana**, y nada en el estudio explica la
  diferencia.
- **El discriminador es una ausencia**, que es el estado de fábrica de todo estudio legado (la marca
  se persiste recién desde que existe el oculto `#sev_manual`). Hoy lo frenan `limpiarCampos`
  borrando las claves `valv-pill-*` y `valvAutoAbrirCajones` abriendo sólo con grado leve o mayor;
  las dos son frágiles frente a un clic.
- **La tarjeta pre-PDF marca sólo `if (cambio)`**: confirmar «Sin estenosis» sin tocarlo no deja
  marca. La tarjeta que existe para evitar el defecto podría producirlo.
- ~~**R6 (`sevSincronizar`) suelta la marca sola y en silencio**, y `eaGradoCalculado` sí emite
  `'sin'`: el camino automático puede dejar grado `'sin'` sin marca y con la pastilla abierta.~~
  **[CERRADO 2026-10-03, `23eb4e2`]** Era exactamente eso, y con el escalón encendido publicaba
  «EAo.» en el firmado sobre un paciente con Vmax 1,8. `sevSincronizar` apaga el botón **dentro de
  la rama de R6** y sólo ahí: aplicar la regla en cada sincronía apagaría el botón del estado 2 y el
  escalón no volvería a dispararse. Lo fija **TC-406**, con su control negativo (R6 que suelta a un
  grado real no apaga nada). El hermano del **retiro por insumo fuera de banda** —que dejaba el
  mismo estado con el badge diciendo «no gradúa»— se cerró con una cuarta compuerta por
  `bloqueado()`, en el mismo caso.
- **Las leves pulmonares perdieron la lista blanca de vocabulario** que el filtro
  `/moderada|severa/` hacía de refilón. El día que `ip_grado` recupere «Fisiológica» o «Trivial»,
  el EN SUMA firmado dirá «Insuficiencia pulmonar fisiológica.» como hallazgo de conclusión sin que
  nadie toque `generarInforme`.

---

## Etapa de cálculos (mitral)

- El AVm por continuidad inválido (IAo moderada o severa) sigue alimentando `avmMax` y la
  contraindicación por área: decisión de voto, pendiente.
- El selector «Incluir en el informe» deja imprimir una continuidad inválida.
- `index.html` ~22263 afirma que `calcEM` vacía `avm_cont` con `emContValido()` falso; no lo hace
  (el gate es la casilla): corregir comentario.
- Negación tranquilizadora del informe con valores fuera de banda en `avm_plan`, `avm_cont` y
  `em_gmedio`. Eran cuatro: `avm_ete` salió el 2026-10-08 al dejar de ser una fuente, y era el único
  de los cuatro **sin banda en ninguna tabla**, o sea el que ni llegaba a `cat.revisar`.
- AVm indexada (`avm_idx`): marca de pantalla cuando viene de la continuidad; el Excel exporta el
  valor crudo.
- Piso de 20 ms del THP: un THP real por debajo se retiraría del informe.
- Estudios de prótesis guardados antes del cambio: el narrativo congelado publica el área y la
  tabla del PDF dice «no evaluable».
- Ratio VTI mitral/VTI TSVI protésico (≥2,5): hoy se retira desde IAo moderada; revisar si
  corresponde (la Tabla 12 de ASE 2024 no condiciona por IAo).
- Calculadora de severidad de IM: gradúa la secundaria con cortes de primaria; hay aviso en
  pantalla, sin decisión de grado propio.
- Abrir un estudio guardado arrastra las respuestas del panel de Evidencia; `cerrarSesionReal` no
  limpia `_indClin`.
- Wilkins: unificar `calcWilkins` y `cxWilkins`; al hacerlo, atribuir el ≤8 de la leyenda a la
  guía ESC; la escala (1-4) de los selectores NO se cambia.

## Aórtica — declarado en la tanda 2/3 (2026-10-01) y NO arreglado

Lo de abajo está **medido en Chrome**, no supuesto, y **espera decisión de Maicol**: son cortes,
fórmulas y rótulos clínicos, que por la regla del repo se reportan y no se tocan.

- **[CORREGIDO 2026-10-01, tanda 2b] La fracción regurgitante de la IAo usaba el denominador
  equivocado y fallaba hacia «menos severa».** Hacía `volR/(volR+vsv)`, donde `vsv` es el volumen
  sistólico del TSVI. La ASE 2017 (Zoghbi, **folio 311**) define *«RF is then derived as the RVol
  divided by the SV through the regurgitant valve. Thus, RVol = SV_RegValv − SV_CompValv;
  RF = RVol/SV_RegValv»*, y la **Tabla 14** (**folio 339**) da el método de la IAo: *«SV method:
  RVol = SV_LVOT − SV_MV»*. En la IAo la válvula regurgitante **es la aórtica** y su SV se mide en el
  TSVI: `vsv` **ya contiene** el regurgitante. Hoy es `volR/vsv`, con guarda `vsv > 0`.
  Medido antes/después con EROA 20 mm², VTI del jet 200 cm, Ø TSVI 20 mm y VTI TSVI 20 cm:
  **39 % → 64 %**, y el grado integrado **moderada → severa** en las cuatro superficies. Fijado por
  **TC-350**. ⚠️ **No es una duplicación con la mitral:** `calcIM_ESC` usa `volR/(volR+vsv)` y ahí
  **está bien**, porque el SV mitral *es* `volR + vsv`; `calcContIM` ya usaba `volR/vmit` con guarda
  `> 0`, que es la forma correcta. Un «dueño único» de la cuenta sería el error.
- **🔴 `itv_tsvi` y `diam_tsvi` NO llaman a `calcIA_ESC`, y la tanda 2b lo volvió mucho más caro.**
  Sus `oninput` llaman `calcAo(); … imSyncSiExiste(); emSyncSiExiste()` — la **mitral** sí se enganchó
  (`imSyncSiExiste` existe exactamente para esto), la aórtica no. Antes `vsv` estaba diluido en
  `volR+vsv`; ahora **`FR ∝ 1/vsv`**, así que corregir el Ø del TSVI de 20 a 22 mm deja en pantalla la
  FR del valor viejo **y no recalcula `ia-sev` ni `ia_grado`**, que es lo único de este bloque que baja
  al informe, al EN SUMA, al PDF y al Excel, y lo que gobierna `_indIA`. También queda obsoleto
  `ia-jet-ratio`, que lee `diam_tsvi`. Se cierra con un `iaSyncSiExiste()` calcado de
  `imSyncSiExiste` en los dos `oninput`. **No se hizo acá**: es cableado nuevo, merece su propio
  commit y su propia mutación. Lo encontró `/sharp-edges` sobre el diff de 2b.
- **La FR de la IAo perdió la cota implícita del 100 %.** `volR/(volR+vsv)` no podía pasar de 100 %;
  `volR/vsv` sí. Con el error de unidad que este repo ya documenta —Ø TSVI tipeado en cm, 2 por 20—
  `vsv` da 0,628 ml y la FR sale **6369 %**, impresa bajo el rótulo «Fracción regurgitante (%)», y
  vota severa. Con la fórmula vieja el mismo error daba 98 %. La IAo **sigue sin banda de
  plausibilidad** (`CHM_RANGO` no cubre `ia_pisa_r`, `ia_pisa_val`, `ia_vmax_cw`, `ia_vti`,
  `itv_tsvi` ni `diam_tsvi`), mientras la mitral publica con `MARCA_REVISAR` y **retira el voto**
  (`if (!_frDud)`). Opciones: tratar `fr > 100` como no valorable —precedente: `calcContIM` con
  «No valorable — revisar mediciones»—, o extender la banda y copiar el patrón `_frDud`. **Es
  decisión clínica de Maicol**, por eso quedó declarado y no resuelto.
- **Los calc-val de la IAo no se limpian cuando el insumo desaparece.** `ia-eroa`, `ia-volr` y
  `ia-jet-ratio` no tienen `else`: borrar el radio del PISA deja la fila afirmando el número
  retirado, y reimprimir un estudio sin PISA encima de otro que sí lo tenía conserva los del
  paciente anterior (`cargarEstudioPorId` corre `calcIA_ESC()` sin barrer los span). La mitral lo
  resolvió con `_pisaLimpiar`. Atenuante **medido**: ningún emisor lee esos tres span —el PDF de
  IAo imprime VC, PHT y AT; el Excel sólo `PHT IAo`—, así que queda en pantalla. Pero en pantalla
  es donde se decide. `limpiarCampos` sí los barre, así que «Nuevo estudio» no arrastra.
- **El VTI del TSVI negativo sigue llegando al PPT.** La tanda 2b lo cerró en `calcIA_ESC`, pero
  `calcAo` hace `if (dtsvi && itsvi)` sin `> 0` y publica `vs-val`, que el PPT entrega como «Volumen
  sistólico». Los inputs no tienen `min`. Queda la app diciendo dos cosas del mismo dato: en IAo
  «no valorable», en el PPT un número negativo. **No se tocó** — fuera del alcance de este diff.
- **⚠️ EFECTO RETROACTIVO SOBRE ESTUDIOS GUARDADOS — segunda entrada (la primera es la del corte de
  velocidad telediastólica, tanda 2/3).** No se migró nada, pero `cargarEstudioPorId` vuelve a correr
  `calcIA_ESC()` al reabrir, así que **la FR se recalcula**. La FR vieja era **siempre menor** que la
  nueva —el denominador era mayor—, de modo que un estudio archivado puede **subir** de grado al
  reabrirse y **nunca bajar**. Sumado al corte de 2/3, un mismo estudio reabierto hoy puede decir
  «severa» donde el papel impreso decía «moderada». Queda declarado, no migrado.
- **El grado 3 («Moderada-severa») lo ofrece el `select` `ia_sev_final` y `calcIA_ESC` no lo emite
  nunca.** La cascada solo produce `'4'`, `'2'` y `'1'`. Solo se llega a 3 eligiéndolo a mano, y
  hacerlo **apaga el panel de conducta**, que abre con `ia_sev_final === '4'`. La categoría sí existe
  en la ASE 2017 (tabla de IAo, folio 340, con cuatro columnas), así que la opción no es inventada:
  lo que falta es que la integración sepa emitirla, o que se retire del `select`.
- **Fail-open por unidad en `ia_vmax_td`, agravado por el corte nuevo.** El campo **no tiene banda de
  plausibilidad** (`CHM_RANGO` cubre `ia_vmax_cw` y `ia_pht`, no éste). Una velocidad tipeada en m/s
  —`0,25` en vez de `25`— cruza la guarda `if (vmaxTD)`, no alcanza los 20 y la pantalla contesta
  «No gradúa (< 20 cm/s) — la guía sólo publica el corte de severa»: un criterio de severa cumplido
  se pierde detrás de una frase con autoridad de guía. Toda la banda fisiológica en m/s (0,2-0,6)
  cae en esa ventana muerta. Igual con negativos (el equipo muestra la reversión con signo).
- **`if (vmaxTD)` descarta el cero medido.** «Busqué la reversión y no hay» se trata como «no hay
  dato». El módulo TAVI ya resolvió esta distinción con `cero()` y `_medidoCero`, y usa
  `velT != null`: dos lectores del mismo parámetro físico con guardas distintas.
- **El rótulo dice «Vmax telediastólica» y la guía pide EDV** (velocidad *al final* de la diástole),
  no el pico del flujo reverso. Son números distintos del mismo trazado y el pico siempre es mayor.
  Con el techo viejo de 200 cm/s la confusión era inofensiva; con el corte en 20 decide el grado, y
  hacia severa. Además el badge **afirma** «reversión holodiastólica» a partir de una sola velocidad,
  mientras el módulo TAVI exige la conjunción (`flujo==='holo' && velT>=20`, con un `select` propio).
- **`ia_vmax_td` no sale en el PDF, ni en el Excel, ni en el importador.** Con `severa >= 1` puede ser
  el **único** votante del grado que firma el informe: un papel que dice «insuficiencia aórtica
  severa» sin la fila que lo sostiene, y un round-trip de Excel que pierde el dato. Era deuda barata
  mientras el parámetro casi no podía votar severa; ahora no lo es.
- **Grado rancio en la IAo, límite ya declarado.** Bajar 25 → 15 cm/s sin limpiar deja el grado
  severo en pie (`params` vacío → early return antes de reescribirlo) y la pantalla se contradice:
  el renglón dice «No gradúa» sobre un grado severo. Retirar el grado auto-derivado en nativa es
  **decisión tomada de Maicol — «NO se toca»** (comentario de `calcIM_ESC`). Queda fijado por TC-348
  para que el límite sea visible y no cambie en silencio.

## Aórtica — declarado en la tanda 1/3 (2026-10-01) y NO arreglado

Sale de `/sharp-edges` sobre el diff de esa tanda. Está medido, no supuesto.

- **Cinco superficies más publican `ea_grado` con cortes nativos sobre una prótesis.** La tanda 1/3
  cubrió tres de ocho (EN SUMA, fila del PDF, `gEA` del Excel). Faltan: `_pptSel('ea_grado')` en el
  PPT; `VALVSIG` en el export a CeiboAnalytics (`sig=1` por `/severa|moderada/`); `_labEstenSev` en
  el PDF de auditoría del Laboratorio; el indicador «EA moderada-severa sin gradiente documentado»;
  y `_tieneValv`/`_labValvCounts`/`sevTable` (buscador, filtro y distribución). Se cierran con una
  línea cada una usando `eaGradoNoPublica(inf.campos.va_morf)`. No se hicieron en la misma tanda que
  el informe firmado para no mover estadísticas del Laboratorio a la vez. El censo está en el
  comentario de `eaGradoNoPublica`.
- **`VALV_PROT_OPCIONES` no tiene assert**, y es la única lista literal paralela a los selects que
  no lo tiene (`_labXlsAssertListas` y `_eteVmAssertPares` son el molde). Una opción de prótesis
  nueva o renombrada apaga SIETE compuertas de un golpe, sin error ni caso rojo. El caso que parece
  cubrirlo (`valvEsProtesis` contra la visibilidad del bloque) compara el predicado contra sí mismo:
  es una tautología en la dirección que importa. Falta un `_valvProtAssertOpciones` que recorra las
  opciones de los cuatro selects y grite si el texto dice prótesis/TAVI/SAVR y el predicado dice no.
- **El `<option>` de `ea_grado` severa dice «Vmax >4 m/s» y el motor decide con `>=`.** La tarjeta de
  pantalla y ahora el PDF dicen `≥4,0`; el selector que el médico lee mientras elige el grado quedó
  con el operador viejo. Es rótulo clínico: se reporta y se espera (`index.html` ~3724).
- **Los decisores no leen `EA_CRIT`.** `clasificarEA_Vmax`, `calcEADetalle` y `_indEA` comparan contra
  literales (`4.0`, `40`) mientras el `ref` del PDF ya deriva de la constante: mover `EA_CRIT.vmax`
  cambiaría la escala impresa y NO el grado. Y `_eaAssertUmbrales` compara valores, no operadores, así
  que un cambio de `>=` a `>` pasa en silencio. Lo correcto es un predicado compartido
  (`eaVmaxEsSevera`/`eaGmedEsSevero`), como `avaEsSevera` ya hace con el AVA. Toca operadores del
  motor: fuera del alcance de la tanda 1/3.
- **La abstención de `calcEADetalle` avisa sólo en pantalla.** Con AVA no valuable el grado anterior
  queda en el `<select>` y las cuatro superficies lo publican; el único aviso es `#ea-ava-badge`. Es
  la convención que `sugerirSeveridadEA` ya fijó, no algo nuevo, pero el canal que podría llevarlo al
  informe —`window._eaBajoGradiente`— tiene tres escrituras y **cero lectores**: hoy es código muerto.
  Decidir si el EN SUMA debe emitir «el grado consignado no se actualizó» (es texto del informe).
- **El Excel afirma el negativo en vez de abstenerse.** Con prótesis `gEA` queda en `''` y `bin()`
  devuelve `0`, así que `EAo_III (Severa)=0` dice «no hay estenosis severa» en lugar de «desconocido
  en esta escala». Un denominador de prevalencia construido sobre esa planilla cuenta la prótesis como
  negativo confirmado. Maicol aprobó los tres binarios en `0` el 2026-10-01; pasarlos a `''` es una
  decisión aparte y toca el round-trip del importador.
- **`va_morf` arranca en «Trivalva normal» y no tiene opción vacía**, así que una prótesis cuya
  morfología no se consignó deja las ocho guardas apagadas. Hay un dato cruzado para detectarlo
  (`vab_cx_valvular`). Migrar o agregar opción vacía toca datos guardados.

## Aórtica (próxima válvula)

- Reordenar el bloque «Estenosis Aórtica — Datos del Doppler»: fila 1 Vmax Ao, G. máx, G. medio;
  fila 2 Ø TSVI (auto), VTI TSVI, VTI Ao, DVI; fila 3 AVA continuidad y campo nuevo AVA por
  planimetría.
- Verificar que los dos «Ø TSVI auto ← Doppler» no se sincronizan con el diámetro de TSVI de la
  pestaña de aorta.
- Estenosis aórtica: el grado final aparece como «Severa (Vmax >4 m/s)» con la leyenda «sugerido
  por AVA continuidad (1,85 cm²)» mientras el recuadro dice «Sin estenosis / leve»: revisar.
- Rótulos «ESC 2021» en las etiquetas de severidad (guía vigente: ESC/EACTS 2025).

## Maquetación de Válvulas — declarado en la tanda del 2026-10-03 y NO arreglado

- **El menú de severidad depende de `:has()`, y sin soporte vuelve el recorte EN SILENCIO.**
  La regla `#tab-valvulas .card:has(.valv-sev-menu.open){overflow:visible;}` es lo único que evita
  que `.card{overflow:hidden}` corte el menú. `:has()` existe en Chrome 105+, Safari 15.4+ y
  **Firefox 121+**; en un navegador anterior la regla se descarta sin error ni aviso y vuelven a
  perderse tres opciones de la aórtica —«Moderada» y «Severa» de estenosis, y la última de
  insuficiencia—. El modo de fallo es «el médico elige Severa y no pasa nada», indistinguible de
  un clic mal dado. **La suite no puede detectarlo**: TC-395 corre por CDP contra el Chrome del
  sistema, así que es cobertura en Chrome, no cobertura del arreglo en otro navegador. La app se
  usa en Chrome, así que hoy no es un defecto activo — pero la dependencia queda declarada.
  Si alguna vez hay que soportar Firefox viejo o iOS <15.4, el camino ya resuelto en la app es el
  de `.igio-menu`: `position:fixed` + `max-height`, que además arregla el menú abierto por debajo
  del pliegue, algo que `:has()` no toca.

- **El rótulo por defecto del grado final quedó con 2 px de margen a 1200 px.**
  «— Sin insuficiencia / no evaluada» mide 197 px y es la opción seleccionada de fábrica de
  `im_sev_final` e `ia_sev_final`. Con el reparto 1:1 viejo le sobraban ~43 px; con el `grow:2` del
  cajón le quedan 2. **Sigue entrando** y está pineado por TC-396, así que si se trunca el caso se
  pone en rojo en vez de descubrirse en un informe. Las dos salidas son decisión de Maicol:
  acortar el rótulo —es texto clínico— o bajar el `grow`. No se tocó.

- **A 756 px ese mismo rótulo de 197 px NO entra, y eso es PREVIO a esta tanda.** Con el reparto
  1:1 el select medía 161 px (útil 129) y ya truncaba; con `grow:2` mide 157 (útil 125). El cambio
  no lo causó ni lo arregló. Mismo par de salidas que el punto anterior.

- **El cajón de la IA es el único sin lista de opciones** (sólo título, label y un input de texto),
  así que el `grow:2` le saca 41 px al select para dárselos a un cajón que no los necesita para
  repartir columnas. Se dejó uniforme en las cuatro filas a propósito —una sola regla— y ahora
  TC-396 lo mide. Si alguna vez molesta, el reparto se acota a los cajones con `.valv-fund-opc`.

## Visor de imágenes (cineloop)

- Modo mínimo: al abrir solo Reproducir, Capturar, Medir y la cruz de cierre; Medir es un
  interruptor que muestra/oculta el resto; siempre arranca en modo mínimo.

## Imágenes (después de las CC)

- Calibración automática por DICOM.
- VI en 3D interactivo a partir de los trazados A4C/A2C/A3C.
- Mitral esquemática animada.

---

## Strain de la AI y onda L (2026-10-12) — DECLARADO y NO arreglado

### S1 · El strain de CONDUCTO no entra en ningún algoritmo, y es de la fuente

Censado en los dos PDF completos: la **BSE 2024** sólo habla del *volumen* de conducto, en la
fisiología de la pág. 7; la **ASE 2025** lo nombra en el protocolo de adquisición y en la tabla de
abreviaturas del folio 546, y en ningún algoritmo. El campo `ai_strain_cd` existe porque Maicol lo
pidió, **se guarda con el estudio, no vota y no tiene columna de Excel**. No es un hueco: es lo que
dicen las guías.

### S2 · La ASE 2025 tiene CINCO parámetros suplementarios y la app implementa UNO

La nota ‡ de la Figura 3 (folio 554) lista: velocidad telediastólica de la IP ≥ 2 m/s, PAP
diastólica ≥ 16 mmHg, **onda L ≥ 50 cm/s**, Ar−A > 30 ms y caída de la E/A ≥ 50 % con Valsalva; el
folio 555b suma la IM diastólica, la terminación precoz del llenado y la amplitud de la Ar > 35 cm/s.
Esta tanda implementa la onda L, que es la única con campo. **Los demás los agrega otro trabajo**, y
la etapa quedó armada como una LISTA (`ASE_SUPLEMENTARIOS`) para que entren sin reestructurar nada.

**Consecuencia declarada:** con la onda L negativa la app **no afirma presión normal** y se queda en
el «No estimable» de HEAD. La flecha «None» de la figura sale de haber preguntado los cinco; la app
puede preguntar uno. Cuando entren los otros cuatro habrá que decidir si con todos evaluados y
negativos se afirma presión normal — y eso es cambiar un texto del informe, o sea decisión de Maicol.

### S3 · El Ar−A de la ASE 2025 no entra en la lista de suplementarios

Existe `venpArA()` y la BSE ya lo usa con su propio corte (`> 30`, `BSE_ARA_SUPL`), y la nota ‡ de
la ASE escribe `Ar-A duration > 30 ms`. **No se agregó** porque la orden lo asignó explícitamente a
otro trabajo, junto con la velocidad de Ar, la IP telediastólica y la PAP diastólica.

### S4 · El `soloE` de la ASE 2025 no mira la onda L

Un paciente con el e′ y la onda L como únicos datos sale «Datos insuficientes para clasificar
presión de llenado» —el texto de HEAD, sin cambios—, porque para llegar a los suplementarios hay que
pasar por las tres principales y por el segundo paso. Es lo conservador y es lo que hace la figura,
pero queda dicho: el dato está cargado y no se usa en esa escena.

### S5 · El informe nombra el strain de contracción con su VALOR ABSOLUTO

`_bseDetalles` escribe «strain de contracción de la AI 13,5 %» aunque el médico haya tipeado −13,5,
porque 13,5 es lo que votó. El campo y el Excel conservan el signo. Si alguna vez se prefiere
imprimir el crudo, es cambiar una frase del informe firmado.

### S6 · Siete comentarios de `index.html` siguen diciendo «434»

Son frases que registran una MEDICIÓN pasada —«verificado en el A/B de 434», «la fila de 434
columnas no se mueve», «las 434 columnas quedan idénticas»— de tandas anteriores. **No se
reescribieron a propósito**: cambiarlas diría que aquellas corridas compararon 435 columnas, y no
fue así. Las frases en presente sí se actualizaron.

### S7 · El conducto y la onda L NO sobreviven a un round-trip por Excel

Los dos viajan con el estudio guardado (el barrido de `guardarInforme` los toma por su `id`) pero
**no tienen columna de Excel**, por orden expresa. Consecuencia: exportar una cohorte a Excel y
volver a importarla deja esos dos campos vacíos, mientras el LARS y el strain de contracción sí
vuelven. No es un defecto del round-trip —ninguna columna se desalinea—, es que esos dos datos no
están en la planilla. Si alguna vez se quieren para análisis, son dos columnas más.

---

## Diagramas de flujo de la ASE 2025 y de la ASE/EACVI 2016 (2026-10-13)

Declarado y NO tocado en la tanda de los diagramas de las cuatro vías de la ASE. Nada de esto es
una regresión: son decisiones conscientes o cosas preexistentes que esta tanda sólo hace visibles.

**E1 · El umbral de 780 px sigue sin probarse en iPad vertical.** Un iPad en vertical son 768 px y
queda **12 px por debajo** del umbral, así que ahí NO se dibuja. Es el mismo punto D3 que la tanda
de la BSE dejó abierto, y ahora alcanza a las cinco guías-vía. **El número está en UN solo lugar**
—una única media query `@media (min-width:780px)`, y TC-462 comprueba que no haya una segunda— así
que bajarlo es cambiar un literal. Lo decide el médico después de probarlo.

**E2 · `a25.fin-sindatos` funde dos claves de categoría.** `incompleto` (sin e′ septal ni lateral)
e `insuf` (sólo el e′ medido) van a la misma casilla del dibujo. Son dos frases distintas en el
informe y el renglón de resultado de la ventana las distingue, pero el dibujo no. Mismo caso que
`g1prol`/`g1alt` en la 8B, que ya estaba así.

**E3 · `a16b.unoyuno` funde las dos entradas a «Cannot determine» de la Figura 8B.** La sub-caja
«1 positivo y 1 negativo» con dos criterios disponibles, y el pie «LAP indeterminate if only 1 of
3 parameters available». Son dos motivos y **una sola casilla** de la figura; el título de la caja
nombra los dos. Si alguna vez hiciera falta separarlos en el dibujo, hay que rehacer la fila 3 de
la 8B: con cinco columnas no entran cuatro salidas del paso 2 más los dos atajos.

**E4 · La caja de entrada del paso 1 de la Figura 3 imprime OCHO renglones de valores** (los tres
e′, los tres E/e′, la IT y la PSAP) en una caja de 688 px de ancho. Es funcional y está medido sin
desbordes, pero queda con mucho aire a los lados. Partirla en tres sub-cajas —una por variable—
daría un dibujo más fiel a la numeración 1-2-3 del original, a costa de tres aristas más.

**E5 · El rótulo del e′ de la 8A se lee «e' septal sep 5 / lat 7 cm/s».** `_bdFilaTxt` corta el
criterio en el primer operador, así que de «e′ septal < 7 o lateral < 10 cm/s (una variable, dos
cortes en OR)» saca «e′ septal», y el valor de esa fila es el string «sep 5 / lat 7». Se entiende
pero es redundante. Un `vals` propio para ese nodo lo arreglaría.

**E6 · La fibrilación auricular de la ASE/EACVI 2016 no tiene diagrama y no es una via pendiente.**
La guía enumera parámetros sugestivos en el folio 295 y **no los combina en ninguna regla de
conteo**, así que la app no publica veredicto y no hay camino que dibujar. Si algún día la app
inventara una regla de conteo para esa sección, sería inventarle a la guía un algoritmo que no
tiene — que es exactamente lo que la tanda de la fibrilación auricular vino a sacar.

**E7 · Las dos guardas conservadoras de la Figura 8 siguen como en HEAD.** El «None or 1 of above»
de la app exige además que no haya ningún criterio sin medir, y el «None» del paso 2 exige los
tres medidos; la figura no pide ninguna de las dos cosas. Son de HEAD, son el lado conservador
—con criterios sin medir la app no afirma normalidad— y esta tanda no las toca. El dibujo las
muestra como la caja punteada «Datos insuficientes», que declara que es un estado de la app.

**E8 · El prefijo `bse-` de las clases, los atributos y las funciones es histórico.** Hoy los
comparten las cinco guías-vía. Renombrarlos a algo neutro obligaría a adaptar TC-460 y
`scripts/_probe_bsediag.mjs` enteros sin cambiar una línea de comportamiento, así que se reusaron
tal cual. Si alguna vez se renombra, es un cambio mecánico de atributos y conviene hacerlo en un
commit propio que no toque nada más.

---

## Tanda «F» (2026-10-15) — declarado y NO corregido

### Bloque F1 — los dos automáticos del VI y el GC del PDF

**F1 · El volumen latido MANUAL (`vol_lat`) y el automático son dos datos que nadie concilia.**
El manual lo tipea el médico, viaja con el estudio y es el que sale en la fila «Vol. lat.» del
PDF; el automático se deriva del VDFVI y del VSFVI y **no viaja**. Hoy pueden decir cosas
distintas sin que nada lo señale. La orden pedía explícitamente que los consumidores actuales
siguieran leyendo lo que leían, así que no se tocó. Tres salidas posibles: (a) dejarlo como está
y que el médico compare; (b) un aviso cuando difieran más de un umbral —que sería un número
clínico nuevo, decisión de Maicol—; (c) espejarlos, que **cambiaría un dato guardado** y es lo
que esta orden prohíbe. La conservadora es la (a), que es la que quedó.

**F2 · El VSFVI automático no viaja al Excel, y el manual tampoco tenía columna.** `vsfvi` y
`vol_lat` no están en `LAB_XLS_MAP` —nunca lo estuvieron—, así que un backup a Excel y su
reimportación pierden los dos. No es de esta tanda; lo que esta tanda agrega es que ahora se ve
que hay un tercer número derivado de ellos. Agregar columnas es lo que la orden prohíbe
expresamente.

**F3 · El automático se muestra también con el VSFVI manual cargado.** Es lo que permite
compararlos y lo que hace que la casilla de abajo tenga que decir cuál usó. La alternativa
—esconderlo cuando hay manual— ocultaría justamente la comparación que el médico pidió. Queda
declarado por si la preferencia cambia.

**F4 · El `*` del gasto cardíaco supuesto se fue, y no hacía falta un pie de página.** Censo del
archivo: ese asterisco **nunca tuvo una nota que lo explicara** en ningún lado del PDF. Hoy la
rama que lo producía ya no existe. Si alguna vez vuelve a hacer falta marcar un valor supuesto en
esa tabla, hay que agregar la nota **en el mismo commit**.

**F5 · El ÍNDICE CARDÍACO desaparece del PDF junto con el GC, y la orden sólo nombraba el GC.**
Es consecuencia aritmética: `IC = GC / ASC`, con la misma FC. Publicar el índice de una magnitud
que la app acaba de negarse a imprimir sería conservar el defecto por la puerta de al lado. Si
Maicol quiere el IC con una FC declarada, es una línea.

**F6 · Sin AVA y sin FC, la sección «AVA / GC / IC» desaparece entera del PDF**, header incluido,
porque el GC y el IC son sus dos únicas filas y `drawTablaCompacta` descarta las secciones
vacías. Es el filtro que esa función **ya** tenía y no un cambio de esta tanda —medido: con el AVA
cargado la sección se queda—, pero conviene saberlo antes de leerlo como una pérdida.

**F7 · Los otros dos sitios que imprimen un gasto cardíaco no se tocaron.** La fila `GC` del
bloque GTP (lee el span `cx-gtp-gc` de la pantalla) y las líneas «GC termodilución» / «GC
ecocardiográfico» de la hoja adjunta hemodinámica. Son otras superficies, con otros insumos, y
esta orden nombra sólo la del PDF.

### Bloque F2 — el AVA indexada y la auditoría de las filas sin grado

**F8 · AUDITORÍA: tres filas del cuadro de Válvulas publican un criterio que VOTA y no muestran
su grado.** Medido sobre el árbol vivo con las ocho lesiones cargadas. **NO se corrigieron**: la
orden autoriza sólo la del AVA indexada.

| fila | criterio y sus cortes | escena medida |
|---|---|---|
| `ea-det-gmedio` | G. medio, `EA_BANDAS.gmedModMin` 20 / `gmedSevMin` 40 | 30 mmHg → «30 mmHg», sin «(moderada)» |
| `ea-det-ava` | AVA por continuidad, `AVA_SEVERA_MAX` 1,0 / `avaSinMin` 1,5 | 1,20 cm² → «1.20 cm²», sin «(moderada)» |
| `ea-det-dvi` | DVI, `EA_DVI_SEV_MAX` 0,25 / `EA_DVI_MOD_MAX` 0,50 | 0,38 → «0.38», sin «(moderada)» |

Y **dos criterios que votan y no tienen fila** en ese cuadro: el **AVA por planimetría** —vota
desde el 13/10, su campo está en la grilla y lo único que publica es el aviso de plausibilidad— y
la **Vmax aórtica**, que sí tiene fila con su grado en el cuadro del **Doppler**.

**Lo que NO es un hallazgo, y está medido por qué:** las cuatro filas de la estenosis mitral
publican su clase en una columna aparte (`.em-clase`: «· significativa (≤1,5 cm²)»); las nueve de
la IM y las cuatro de la IAo llevan su `<span class="calc-grado">` desde D1 y D2; las tres de la
IT y las tres de la ET llevan la leyenda pegada con ` · ` o entre paréntesis; el **G. máximo**
aórtico no es criterio y no vota; y **`ep-ref-gmax` sin grado es una decisión documentada de
Maicol del 2026-10-07** (punto 5d): el gradiente es el número **del que sale** el grado y la
velocidad es la que lo lleva, así que ponerle grado a los dos daría dos veredictos para un solo
cálculo.

**F9 · El valor del AVA indexada se imprime redondeado a dos decimales y su grado se decide sobre
el índice SIN redondear.** Es herencia de `_eaCritAvai` y de la fila gemela del cuadro del
Doppler, que hace exactamente lo mismo desde el 13/10. En una ventana de un centésimo alrededor
del corte, el número impreso puede quedar del otro lado del que el grado afirma. Unificarlo es
cambiar qué escenas gradúan severo, o sea contenido clínico.

**F10 · El cartel `ea-ava-badge` NO se acortó.** La orden lo autorizaba «si resulta redundante».
Lo único que se superpone con el renglón integrado nuevo es su primera cláusula («Grado
calculado: Severa — el peor de los criterios cargados, por AVA indexada»); su contenido real —la
enumeración criterio por criterio con el valor y el grado de cada uno— no está en ninguna otra
superficie. Además ese mismo nodo lo comparten los estados de **prótesis**, de **fuera de banda**
y de **bajo gradiente**, cada uno con su propio texto. Queda a decisión de Maicol.

**F11 · «QS» sigue existiendo en el archivo, fuera de los rótulos visibles.** Censo completo:
`CIV_QPQS_CIERRE` (la constante del cierre de la CIV, Qp/Qs ≥ 1,5) y los textos de **Qp/Qs** de
los módulos congénitos y del panel de Evidencia. Son **otra magnitud** —el cociente de flujos
pulmonar/sistémico— y **otro módulo**: no se tocaron, y ninguno vive en un `<label>`. Medido sobre
el árbol vivo: **cero rótulos visibles con la sigla**, y TC-475 lo fija.

## Tanda «G1» (2026-10-15) — declarado y NO corregido

> El VD en tres columnas, el Qp, la relación VD/VI, la pared graduada, el cociente TAPSE/PSAP y
> el diámetro de la arteria pulmonar. Los mapas: `docs/mapa/vd-derecho.md` y
> `docs/mapa/tapse-psap-ap.md`. Las fuentes: `docs/fuentes/FUENTES.md` → `escErs2022` y la
> sección «`aseVd2025` — lo que esta tanda (G1) le agregó».

### G1-1 · El cociente TAPSE/PSAP está en la categoría C de la app y la guía lo pone en la A

**Medido por coordenadas sobre el PDF**, no por el orden en que el extractor devuelve el texto:
en la **Tabla 10 de la ESC/ERS 2022, folio 28**, el renglón «Cociente TAPSE/PAPs < 0,55 mm/mmHg»
arranca en **x0 = 316**, que es la columna de **«A: Ventrículos»**; los dos renglones del
diámetro de la AP arrancan en x0 = 389, la de «B: Arteria pulmonar». La app lo tiene en `catC`
de `_htp2022Core`, junto a la VCI y el área de la AD, y el rótulo de Avanzado lo dice
(«C · VCI / AD … TAPSE/PSAP < 0.55»).

**No se corrigió**: mover un signo de categoría cambia `nCat` en toda escena donde A ya sea
positiva y C lo sea sólo por el cociente, o sea cambia la **probabilidad de HTP publicada**. Es
una regla de integración clínica y esta orden no la autoriza.

**Qué habría que hacer:** mover `(tapsePsap !== null && tapsePsap < 0.55)` de `catC` a `catA` en
`_htp2022Core`, mover el rótulo de la pantalla de Avanzado al bloque «A · Ventrículos», y
**medir qué escenas cambian de probabilidad**. Los dos checkbox manuales no se tocan.

### G1-2 · El 0,32 de la pantalla de TEP tiene fuente, pero NO es un criterio de TEP

`calcTEP` publica «TAPSE/PSAP N — conservado (>0.32)». El número existe y está publicado:
**ESC/ERS 2022, folio 41**, tabla de estratificación de riesgo en **hipertensión arterial
pulmonar** — `> 0,32` bajo riesgo, `0,19-0,32` intermedio, `< 0,19` alto.

**Ninguna fuente leída lo define como signo de tromboembolia.** Por eso **no se agregó** la frase
«mal pronóstico en IC y probabilidad de TEP» que la orden ofrecía para los valores por debajo de
0,32: sería atribuirle un significado que su fuente no le da. Es la **PARADA declarada** de esa
parte de la orden, y lo demás siguió.

**Qué habría que hacer:** o bien cambiar el rótulo de esa pantalla para que diga de qué tabla
sale el 0,32 —es un texto de pantalla, decisión del médico—, o bien conseguir una fuente que
valide el cociente como marcador de TEP agudo y entonces sí agregar la frase.

### G1-3 · La graduación de la pared NO sale al informe ni al EN SUMA

La fila del cuadro dice «7 mm — hipertrofia del VD, leve (≥5 a ≤7 mm)», y el informe firmado
sigue diciendo «hipertrofia del ventrículo derecho (pared de 7 mm)» y el EN SUMA «HVD», **sin
grado**. Es deliberado: cambiar una frase del informe firmado es contenido clínico.

**Qué habría que hacer, si el médico lo quiere:** `vdHvdClausula` ya recibe el grado
(`vdHvdEstado().grado`), así que es interpolarlo; y la cadena del EN SUMA tiene sus nueve frases
en una tabla. **Hay que medir las nueve y adaptar TC-457**, que las fija letra por letra.

### G1-4 · La FEVD tiene graduación publicada y la app aplica un solo corte

**ASE 2025, Tabla 1, folio 145**, fila `3D RVEF, %`: normal `> 45`, leve `≤45 a <39`, moderada
`≤39 a ≥32`, severa `<32`. La app publica sólo normal / disfunción, porque lo que esta orden
pide es que la fila aparezca con el dato.

⚠️ **Y DE PASO: el comentario que vivía al lado del campo decía «(≥45 %)» y la tabla escribe
`>45`.** No gobernaba nada —la FEVD no se evaluaba en ninguna parte— y se corrigió en el mismo
movimiento, pero vale la pena saber que estuvo escrito mal.

### G1-5 · Dos cortes de VD/VI conviven, sobre dos campos distintos

| Campo | Pestaña | Corte | Quién lo lee |
|---|---|---|---|
| `vd_vi` | VD/AD | **`> 1,0`** | la fila nueva del cuadro y la categoría A de `_htp2022Core`, las dos por `VD_VI_HTP_MIN` |
| `tep_vdvi` | pantalla de TEP | **`>= 0,9`** | el puntaje de sobrecarga aguda de `calcTEP`, y el PDF y el PPT de ese módulo |

Son dos preguntas distintas —probabilidad de HTP y sobrecarga aguda del VD— y las dos tienen su
fuente. **No se unificaron.** La cascada de `calcTEP` sigue prefiriendo `tep_vdvi`, después el
calculado `vd_bas/ddfvi` y sólo al final `vd_vi`.

**Lo que SÍ conviene saber:** un médico que cargue `vd_vi` en VD/AD y no `tep_vdvi` va a ver el
cociente evaluado con **dos cortes distintos** en dos pantallas, sin que nada lo diga. La salida
limpia sería que la pantalla de TEP nombre su fuente al lado de su corte.

### G1-6 · El 0,36 en insuficiencia cardíaca NO está verificado al estándar de la casa

El corte que la app aplica en su tramo rojo nace de **Guazzi M, Bandera F, Pelissero G, et al.
Am J Physiol Heart Circ Physiol 2013;305:H1373-H1381** (cohorte mixta de 293 pacientes), y el
metaanálisis de **Heart Fail Rev 2024** (PMC10904417) reporta que con ese corte el cociente se
asocia de forma independiente con la mortalidad por cualquier causa y que vale en FEVI reducida
y preservada. **Ninguno de los dos está en la biblioteca del Escritorio**: el metaanálisis se
leyó en línea y el original de Guazzi sólo a través de él.

Por la regla de la casa —«verificada» = texto completo leído, con documento, año, tabla y
página— **ese corte no está verificado**, y por eso la tarjeta ⓘ **no lo cita**: su bloque «a
tener en cuenta» dice en voz alta que esos cortes no se pudieron leer en su fuente primaria.
El número no se inventó acá: está publicado, y la **ASE 2025, folio 180**, lo nombra («The
ESC/ERS guidelines recommend a TAPSE/PASP <0.36 mm/mmHg as suggestive of PH») — pero con OTRO
significado, el de sugerir hipertensión pulmonar.

**Qué habría que hacer:** conseguir el PDF de Guazzi 2013 y, con él leído, decidir si el tramo
rojo se queda con el texto de insuficiencia cardíaca o pasa a nombrar lo que la ASE 2025 le
atribuye.

⚠️ **Y el 0,36 NO aparece en la traducción española de la ESC/ERS 2022**, barrido el PDF
completo: su tabla del folio 41 corta en 0,19 y 0,32. O sea que la atribución que la ASE 2025
hace a «the ESC/ERS guidelines» no se pudo confirmar en el documento que esta biblioteca tiene.

### G1-7 · Tres usos del cociente que la orden pedía y no entraron en la tarjeta

| Uso | Lo que decía la orden | Lo que se encontró |
|---|---|---|
| IC con fracción levemente reducida | «alrededor de 0,46» | el metaanálisis de 2024 registra **0,34** para ese fenotipo (Rosa 2020) |
| Terapia de resincronización | «alrededor de 0,45» | aparece como `< 0,45` por análisis de splines, sin texto completo leído |
| Reparación o reemplazo tricuspídeo por catéter | «mediana alrededor de 0,406» | coincide con lo publicado (444 pacientes), sin texto completo leído |

Los tres salen de resúmenes y de títulos; **ninguno se leyó en su texto completo**, así que no se
citan. Y el primero además **no se confirma**: el número de la orden y el del metaanálisis no
coinciden.

### G1-8 · La probabilidad de HTP de Avanzado no puede leer al dueño del cociente

`_htp2022Core` recibe su fuente como argumento (`{num, txt, chk}`) y corre **también sobre un
estudio GUARDADO**, no sólo sobre el DOM. `vdTapsePsap()` lee `v('tapse')` y `v('psap_calc')`,
que son del DOM. Hacerla leer al dueño le rompería la rama de estudio archivado.

**Qué habría que hacer:** darle a `vdTapsePsap` un parámetro `src` opcional con el patrón que
`emThpValido`, `emContValido` y `hfRitmoEfectivo` ya usan —aceptan una fuente y caen al DOM si
no se la pasan—, y entonces `_htp2022Core` puede preguntarle. **El corte y el texto de esa
pantalla no cambian**: es la misma cuenta.

### G1-9 · `cxTP` tampoco lee al dueño, y tiene un motivo distinto

El índice de acoplamiento VD-AP del módulo de constricción/restricción (`cx-tp-res`) calcula el
mismo cociente con cortes propios (`> 0,36` normal · `0,19-0,36` reducido · `< 0,19` severo) y
con **campos de sobreescritura** (`cx_tapse`, `cx_psap`): con esos dos cargados describe OTRO par
de números. Leer al dueño le borraría la sobreescritura.

⚠️ **Su guarda tampoco es la misma** (`psap <= 0` contra el `if (tapse && psap)` del dueño y de
`calcTEP`) y **publica dos decimales donde las otras dos publican tres**. No se tocó nada de eso.

### [CERRADO 2026-10-15 · G2] G1-10 · El diámetro de la arteria pulmonar no tiene columna de Excel

> **CERRADO.** `Diámetro arteria pulmonar (mm)` entró en el **bloque 8 · VÁLVULAS**, pegada a
> «IP etiología», y **SÍ se reimporta**: su entrada en `LAB_XLS_MAP` es
> `['Diámetro arteria pulmonar (mm)', 'ip_ap_diam', 'num']`, o sea un campo de ENTRADA y no una
> derivada. El Excel pasó de 436 a **438** columnas (la otra es `TAPSE/PSAP (mm/mmHg)`).
> ⚠️ **Su banda NO entró en `LAB_XLS_RANGO_PROPIO`, a diferencia de lo que esta entrada preveía**:
> `IP_AP_BANDA` sigue siendo su único dueño, y un segundo lugar con los mismos dos números es
> exactamente la clase de copia que este repo persigue. El importador la valida por el rango
> general de `num`. Queda declarado abajo (**G2-1**).
> Se adaptaron los 65 renglones que contaban **436**, más TC-135 y TC-476 con motivo propio.

Texto original, para la historia. Decisión de la orden: la columna va en el **G2**. Hoy el campo **viaja con el estudio** (su id va
con guión bajo, así que `_noEsDelEstudio` no lo excluye y el barrido de `guardarInforme` lo
guarda y lo repone) pero **un backup a Excel + reimportación lo pierde**, igual que les pasa a
`vd_pared` y `vd_tei` desde el 2026-10-12.

Cuando se agregue: la columna va en `LAB_XLS_COLS`, su banda en `LAB_XLS_RANGO_PROPIO` —hoy no
está ahí a propósito, porque ese mapa lo consume el importador y sin columna no hay nada que
importar— y hay que adaptar los casos que cuentan **436**.

### G1-11 · La comparación «AP > aorta» sigue siendo un checkbox a mano

La **ESC/ERS 2022, Tabla 10, folio 28**, pide dos cosas en su categoría B: «Diámetro de AP
**> 25 mm**» y «Diámetro de AP **> diámetro de RA**», donde **RA es la RAÍZ AÓRTICA** —así lo
escribe la lista de abreviaturas del pie—. En la app las dos están juntas en un solo checkbox,
`htp2022_b3` («Diámetro AP > diámetro Ao o AP > 25 mm»), que el médico tilda a mano.

**Las medidas de aorta que existen hoy**, para el trabajo que las conecte:

| Campo | Rótulo | Pestaña / bloque |
|---|---|---|
| **`ao_sin`** | **Ao sinusal (mm)** | AI/VI, acordeón `sacc-aorta` — **es la raíz aórtica, la que la guía usa** |
| `ao_st` | Ao sinotubular (mm) | AI/VI, `sacc-aorta` |
| `ao_tub` | Ao tubular (mm) | AI/VI, `sacc-aorta` |
| `diam_cayado` | Cayado | AI/VI, `sacc-aorta` |
| `diam_ao_toracica` | Aorta descendente | AI/VI, `sacc-aorta` |
| `ete_tavi_sv` | Seno de Valsalva (mm) | ETE, módulo TAVI |
| `ete_tavi_ust` | Unión sinotubular (mm) | ETE, módulo TAVI |
| `ete_tavi_ao_asc` | Aorta ascendente proximal (mm) | ETE, módulo TAVI |
| `marfan_ao_ascendente` | Ao ascendente (mm) | Congénitas, módulo Marfan |

El campo nuevo quedó **preparado**: id estable `ip_ap_diam` y una sola lectura, `ipApDiamVal()`.
⚠️ **Cuando se conecte, hay que decidir qué pasa si el médico ya tildó el checkbox a mano**: hoy
el tilde es una afirmación suya y un automático que lo pise borraría esa decisión. El patrón que
esta app usa para eso es `dataset.tocado`.

### G1-12 · TAPSE y S′ siguen sin volver a «—» al borrar el dato (era V1)

No se tocó, y ahora hay **cinco** filas que sí resetean (`vd-tam`, `vd-pared-interp`,
`vd-tei-interp`, `tap-interp` y, desde esta tanda, el Qp) contra dos que no. Las filas nuevas de
FEVD y FAC no tienen el problema: se esconden. Sigue abierto como V1.

---

# Tanda G2 (2026-10-15) — lo declarado y NO tocado

### G2-1 · La banda del diámetro de la AP no entró en `LAB_XLS_RANGO_PROPIO`

`G1-10` preveía meterla ahí al darle columna. **No se hizo, a propósito**: `IP_AP_BANDA` ya es su
dueño único y un segundo lugar con los mismos dos números (`[5, 80]` mm) es la clase de copia que
se separa en cuanto alguien afine uno. Consecuencia **medida**: el importador acepta un valor
fuera de banda —no lo rechaza por rango— y la app lo marca «(revisar)» al abrirlo, que es lo que
ya hacía al tipearlo. Si se decide que el importador lo rechace, la entrada va en
`LAB_XLS_RANGO_PROPIO` **leyendo `IP_AP_BANDA` por referencia**, nunca repitiendo los números —
el patrón que `_labRangoValor` usa con `_DIAST_STRAIN_ABS_MARCA` desde el 2026-10-12.

### G2-2 · El mensaje del importador para el cociente es el de «campo no editable», no el de «calculado»

La casa tiene **dos** criterios de columna derivada y el cociente cayó en el que le corresponde
—el de `FAC VD (%)` y `DisfSist_VD`, las derivadas **sin campo**— así que el importador lo lista
como «no corresponde a un campo editable» y no como «un valor que la app calcula sola», que es el
mensaje más informativo y el que recibe `PSAP (mmHg)`.

Para igualarlos habría que inventarle un `dest` que no existe en el DOM, o partir la lista de
«ignoradas» en dos. **No se hizo**: es cosmético y el cambio tocaría el mensaje de las OTRAS
cuatro derivadas sin campo. Declarado.

### G2-3 · El PPT estadístico y la mini-tabla del PDF de auditoría siguen sin contar la tricúspide binaria

Los dos leen `counts`/`bases` de `_labValvCounts` y **no** `bin`, que es lo que mantiene su salida
idéntica a HEAD — y es lo que la orden del G2 autorizaba. Consecuencia: ahí la estenosis
tricuspídea **significativa sigue sin contarse** (`_labEstenSev` devuelve `null` sobre su token), y
la mini-tabla del PDF por lesión la tiene cableada a `() => null` desde antes.

Es el pendiente que la tanda del 2026-10-05 ya había declarado, ahora acotado a esas dos
superficies. **TC-477 (J) lo fija como límite declarado**, de modo que el día que se arregle el
caso lo note. Para cerrarlo hay que decidir si el PPT y el PDF de auditoría adoptan las categorías
binarias — y eso cambia dos documentos firmados.

### G2-4 · La fila «EM» de la tabla general y el gráfico propio de la EM siguen contando distinto

No se unificó, por decisión de la orden: la **tabla** cuenta por el TOKEN guardado sobre el total
del período, y el **gráfico de distribución** de la estenosis mitral por las seis categorías
calculadas desde los DATOS, dejando fuera los estudios sin dato. Un estudio con AVm 2,0 cm² y el
botón en «Significativa» cuenta «Sev» arriba y «Sin estenosis» abajo.

Lo que el G2 agregó es que **cada uno declara su propio n** y que el pie de la tabla nombra al del
otro. Es la misma asimetría que `L1` declara desde el 2026-10-14.

### G2-5 · El p ajustado de las asociaciones vecinas se movió, y es correcto

El ajuste **BH** corre sobre la familia del bloque A, que pasó de 9 a **13** entradas. Medido: el
`pAdj` de «PSAP – TAPSE» pasó de **0,449 a 0,829** en la población de la sonda. **No es un
defecto** —«la multiplicidad la genera el haber mirado, no el haber mostrado», dice el comentario
de `_bh`— y el **p crudo no se mueve**. Se declara porque un lector que compare dos capturas de
distintas fechas va a ver el número cambiado sin que nada más lo explique.

### G2-6 · El panel de ayuda sigue diciendo «429 columnas»

Preexistente y ya declarado en `docs/mapa/informe-pdf-excel.md`: la ayuda de la app declara **429
columnas en 17 bloques** y **129 básicas**, y el conteo real de `_labExcelRow` da **438** (y 138
básicas). La discrepancia no nació en esta tanda —era 434 cuando se registró— y corregirla
significa auditar de dónde salió el 429. **No se tocó.**

### G2-7 · El diámetro de la arteria pulmonar no está en las asociaciones

La orden pedía las cuatro del cociente y nada más. El diámetro **es insumo de la probabilidad de
HTP** (categoría B de la ESC/ERS 2022), así que si algún día entra en el bloque libre hay que
sumarle su propia entrada en `_LIBRE_ACOPLADOS` contra las variables de HTP — el mecanismo ya está
y admite una entrada más sin tocar nada.
