<!-- L1:INDICE -->
# EcoSmart — pendientes CERRADOS (archivo)

Lo que esta aca **esta cerrado**: cada bloque dice en su propio encabezado la fecha y la
tanda o el commit que lo cerro. Salio de `docs/PENDIENTES.md` en la tanda **LIMPIEZA-1**
(2026-11-08), **textual y en su orden original**: no se resumio, no se reescribio y no se
borro una linea.

## Como se busca aca

```bash
grep -rn "P17b-" docs/archivo/        # todas las apariciones de un id cerrado
grep -n "W1-2" docs/archivo/PENDIENTES_CERRADOS.md
grep -nE "^#{2,3} " docs/archivo/PENDIENTES_CERRADOS.md | head -40   # el indice real
```

**Un id vive en UNO de los dos archivos, nunca en los dos**: si `grep` lo encuentra aca,
no esta en `docs/PENDIENTES.md`. Lo que sigue abierto esta alla.

⚠️ **Este archivo NO se lee entero** (unos 139 KB). Se busca con `grep -n` y se lee el
bloque con `sed -n` por su rango de lineas.

Las lineas entre `<!-- L1:INDICE -->` y `<!-- /L1:INDICE -->` son las unicas que esta
tanda escribio: el encabezado y la marca de contexto de cada bloque. Todo lo demas es
texto movido byte por byte, y el manifiesto de
`docs/INVENTARIO_LIMPIEZA_L1.md` permite reconstruir el original para comprobarlo.

---

<!-- /L1:INDICE -->
<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1475..1486 (bloque de nivel2), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
## P3-h · [CERRADO 2026-11-03] Los commits 6 a 10 de PANT-3 se hicieron

Quedaron declarados como no hechos al llegar al 95 % de contexto de la primera mitad. El médico
pidió seguir en la misma sesión y los cinco se completaron: **MCA (6)**, **Fallot (7)**,
**estenosis subaórtica y supravalvular (8a y 8b)**, **arritmia ventricular (9)** y **rótulos de
las presiones pulmonares (10)**, cada uno con su inventario, su A/B contra el árbol anterior y
su caso de cobertura. Lo que quedó parado de ellos está en **P3-i** a **P3-p**.

⚠️ **El texto exacto de esos cinco commits NO se reconstruyó de memoria.** Se recuperó del
transcripto de la sesión en disco (`~/.claude/projects/…/80759c74-….jsonl`), que guarda la orden
del médico palabra por palabra, y se dejó copiado en el scratchpad de la sesión antes de empezar.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1543..1561 (bloque de nivel2), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
## P3-m · [CERRADO 2026-11-03 · PANT4-3] La app afirmaba que la resonancia es el estándar de referencia

> **Cerrado.** Releída la **hoja 7 de 15** de te Riele 2014 —pie impreso «Page 7 of 15»—, la
> fuente **sí** sostiene «estándar de referencia», pero para la **morfología y la función del
> ventrículo derecho**, no para la caracterización tisular; y dice además que la resonancia sola
> no es el patrón de oro del diagnóstico y que el realce tardío **no** está incorporado a los
> criterios. El texto se corrigió en los dos lugares donde vivía —el globo `mca-score` y el
> párrafo que llega al papel— y, **con el texto corregido, la frase ya tiene fuente**, así que
> ahora se cita. Lo fija **TC-637 (A1) a (A8)**.

### Lo que decía antes


La frase «La resonancia cardíaca con gadolinio es el estándar de referencia para la
caracterización tisular del miocardio» pasó de la pantalla de MCA al ⓘ `mca-score`, **y va SIN
cita**. El único documento de la biblioteca que trata el tema —te Riele 2014— dice en el cuerpo
de la misma hoja 3 que la evaluación «no debería basarse en una sola prueba, en particular la
resonancia», y que su sensibilidad es baja. **Regla de la casa: reportar y esperar.**

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1603..1617 (bloque de nivel2), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
## P3-q · [CERRADO 2026-11-03 · PANT3-12] La fila del TEP decía la sigla dos veces

> **Cerrado.** La fila se leía **«PSAP  PSAP 45 mmHg — elevada (≥60 mmHg)»**: el `span` de al lado
> escribe la sigla **con** su valor y su corte, así que poner «PSAP» también en la etiqueta la
> decía dos veces. La regla del commit 10 es que el rótulo nombre el **parámetro** —y las dos
> filas de arriba la cumplen porque su sigla, VD/VI y TAPSE, no es su nombre—, así que la
> etiqueta dice **«Presión sistólica pulmonar»**. Lo fija **TC-519 (O6)**, que exige que la
> etiqueta no contenga la sigla, y que es el caso que lo encontró. Los rótulos de la hoja del PDF
> viven en `amiloTextoTEP` y no se tocaron.

**Lo que queda para la próxima tanda:** la regla «el rótulo nombra el parámetro» choca con «la
sigla se unifica» cada vez que el valor de la fila ya la trae. Hoy sólo pasaba en esa fila, pero
no hay nada que lo impida en otra: **conviene un barrido de `calc-row` donde el texto del `span`
empiece con la misma palabra que su `calc-lbl`**. No se hizo acá porque la orden no lo pide.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1618..1644 (bloque de nivel2), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
## P3-r · [CERRADO 2026-11-03 · PANT4-7b] El estilo de informe es estado de sesión, y TC-502 no lo devolvía

> **Cerrado por el lado que quedaba.** TC-502 **restaura el estilo estándar al salir** y tiene
> una condición **(I4)** que lo comprueba, para que la restauración no se pueda perder en
> silencio. Medido: `TC-502 + TC-535 + TC-533` pasa **3/3** en el mismo lote.

### Lo que decía antes


Cerrando los rojos de la corrida completa apareció esto, **medido**: el bloque (E) de **TC-535**
salía **verde aislado** —1/1, y también contra el árbol anterior en un worktree— y **rojo** en
cuanto corría **después de TC-502**, que llama a `setEstiloInforme` y no lo restaura. Entonces su
(E0) daba `0/0/0/0/0/0` y su (E7) `largo=0`: el informe se emitía en otro estilo, donde la oración
del ventrículo derecho se redacta distinto, así que el filtro no encontraba ninguna línea. **El
dato estaba y la condición no lo veía** — un denominador de cero, no un hallazgo. Es la misma
clase de dependencia de orden que este repositorio ya documenta para **TC-507**, **TC-537** y
**TC-547**.

**Cerrado por el lado de TC-535**: su escena fija su propio estilo antes de emitir. Medido,
`TC-502 + TC-535` pasa de **1/2 a 2/2**.

**Lo que queda:** la causa sigue en pie. **TC-502 cambia el estilo y no lo devuelve**, así que
cualquier caso posterior que mida el informe por su redacción es frágil. Son dos arreglos posibles
y no se hizo ninguno porque la orden no los pide: que TC-502 restaure el estilo al salir —el
patrón que ya usan los casos de la línea 50411—, o que el arnés lo restaure entre casos, que
cerraría la familia entera de una vez.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1667..1687 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-4a] J-a · Dos conductas siguen en el informe firmado de constricción y restricción

> **Cerrado, y las dos NO tuvieron el mismo destino.** «requiere correlación clínica e
> imagenológica» la respalda la Recommendation Table 24 (folio 64, I · C) y la Evidencia **ya la
> publicaba**: sale del papel y no hubo nada que mover. «Considerar RMC con gadolinio» vive en la
> rama RESTRICTIVA, que esa tabla no cubre: **se retira y no va a Evidencia**. Medido sobre el
> PDF generado de verdad: 1 → 0 y 2 → 0 apariciones.

Esta orden sacó del papel el **aviso de confirmación invasiva** y la **recomendación de
cateterismo** de la rama de criterios mixtos. Quedan dos frases que también son conductas y que la
orden **no nombra**, así que no se tocaron:

- rama **restrictiva**: «… sin respirofasicidad significativa. **Considerar RMC con gadolinio.**»
- rama **constrictiva**: «… El diagnóstico definitivo **requiere correlación clínica e
  imagenológica (TC/RMC pericárdica)**.»

Las dos salen en el cuerpo del informe, en el EN SUMA no, y en la hoja del PDF sí. La regla de
producto dice que las conductas van sólo a Evidencia, así que son candidatas a salir por el mismo
criterio — pero cambiar una frase clínica que la orden no nombra es decisión de Maicol.
**Decidir:** si salen del papel y pasan a la Evidencia de constricción, que ya existe.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1688..1703 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-4b] J-b · La Evidencia de constricción despierta sobre un estudio de taponamiento

> **Decidido: una compuerta propia.** `_indConstr` mira los datos propios de la constricción —e′
> medial y lateral, rebote septal, patrón venoso hepático y su cociente—. Un estudio de solo
> taponamiento ya no la despierta. **Lo que eso cuesta está medido y declarado en AJ7-c.**

Su compuerta es la del módulo, `cvrEstado().espEval` —«al menos un criterio específico del
pericardio evaluado»—, y la **variación respiratoria de la onda E mitral** cuenta como uno de
esos criterios **y** se carga en el módulo de derrame y taponamiento. Así que un estudio en el que
sólo se evaluó taponamiento despierta además la sección «Constricción pericárdica — diagnóstico»,
con todas sus filas en «—» salvo esa.

Se dejó el dueño del módulo a propósito: una segunda copia de la compuerta es cómo las dos
divergen. **Decidir:** si esa sección debería pedir dos criterios específicos, o uno que no sea
compartido con el módulo de taponamiento.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 1935..1949 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### ✅ Y3-7 · CERRADO el 2026-10-16 — las dos calculadoras del Wilkins SE UNIFICARON

**Resuelto en la tanda «Wilkins».** La regla salió a `_wilkCalc(crudos, delib)`, pura, con dos
lectores —`wilkinsScore(src)` para la pantalla y `wilkinsScoreDeCampos(campos, src)` para un estudio
archivado—, y `calcWilkins` y `cxWilkins` pasaron a **sólo pintar**, cada una con su formato. Las
tres divergencias que esta parada declaraba se resolvieron así:

- **el dominio del centinela** → los dos se tratan igual (el `0` de ETE y la cadena vacía), y el
  `1/1/1/1` queda «sin puntuar» en las dos salvo que haya una **marca de gesto** (opción C);
- **la banda >11** → «No favorable para valvuloplastia» en las dos (reemplaza «desfavorable»);
- **el parcial** → el texto de ETE, que explica el motivo, en las dos.

**Lo medido y lo que sigue abierto está en `docs/mapa/wilkins-unificado.md`.** Lo que queda de esta
entrada, abajo, es el estado en el que la parada se declaró.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2006..2038 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-16 · Y1c] Y3-2 · La vista 2D del Y1b, en Safari y en Chrome

Dos defectos de la **vista 2D** (`#v2d-card`), que esta tanda no toca y que van en su propio
prompt:

- **Safari:** la tarjeta flotante se ve **colapsada**, con unos 60 px de alto: se ve la cabecera y
  apenas los rótulos «Insuficiencias» y «Estenosis», y el dibujo y las tarjetas quedan cortados.
  En Chrome se ve bien. Causa probable, según el reporte: alturas en **porcentaje**, o un SVG con
  altura automática, dentro de un contenedor sin alto definido, que WebKit resuelve a casi cero.
- **Chrome:** los carteles de la izquierda, de la derecha y de abajo **se mueven con el latido**.
  El patrón de fondo es el mismo: la caja del dibujo cambia de tamaño en cada cuadro y arrastra el
  layout de al lado. ⚠️ **No está diagnosticado**: `fitView()` se llama sólo desde `v2dSync` y no
  por cuadro, así que la causa no es el `viewBox`; hay que medirlo en el navegador. Candidato a
  mirar primero: `#v2d-grid{grid-template-columns:184px auto 184px}`, cuya columna del medio es
  `auto` y la dimensiona el SVG.

⚠️ **EL PANEL 3D DEL Y3 NO REPITE EL PATRÓN**, a propósito: su lienzo tiene alto **fijo en px** y
no hay una sola altura en porcentaje, así que lo que el dibujo haga adentro no puede mover nada de
afuera. Ver `docs/mapa/mitral-3d-ete.md` § 6.

**CERRADO el 2026-10-16 por la tanda Y1c, y el candidato que este ítem dejaba anotado era el
correcto a medias.** El de Chrome **reproduce** y la causa **no** es el `viewBox` —el `<svg>` da
dw=0 y dh=0 a lo largo de 120 fases—: es la columna `auto` de `#v2d-grid`, pero dimensionada por la
**línea de fase** y no por el SVG. Su techo es siempre 218,25 px y el piso depende de la escena
—compite el min-content de la tabla de cavidades—: **63,00 px de recorrido** en la escena de la
sonda y **87,42** en una de tabla más angosta, con las tarjetas moviéndose 31,5 y 43,7 px. Sólo
pasa en escritorio: a 390 px la grilla es de una columna y el recorrido en HEAD es **0,00**. Hoy
la columna mide 240 px fijos y la línea de fase es un renglón de alto fijo: **peor delta 0,00 px**
en los dos motores. El de Safari **no reproduce** en WebKit 27.2 —los ocho viewports dan números
idénticos a Chrome— pero su mecanismo está medido: `flex-basis:0%` contra un contenedor de altura
indefinida. Lo que queda por probar a mano está abajo, en **Y1c-1**.
Todo en `docs/mapa/vista-2d-en-linea.md`.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2046..2059 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### ✅ Y3-4 · CERRADO el 2026-10-16 — el chorro severo ya no sale del cuadro

**Resuelto en la tanda «K0a», y la causa principal era OTRA.** Lo que producía la masa roja con
borde recto que el médico reportó no era el largo del chorro sino que `m3dPintar` **no limpiaba
el lienzo entero**: `clearRect(0, 0, M3D_W, M3D_H)` corría con el transform del encuadre puesto y
dejaba sin borrar una franja de 51 px arriba, donde lo pintado en un cuadro cualquiera se quedaba
para siempre. Medido en HEAD: 38 píxeles del chorro en la fila 0 que no cambiaban ni al girar ni
al cambiar de vista ni al acortar el chorro.
Corregido eso, 7 de las 8 cámaras quedan limpias y el **corte lateral** todavía recortaba: entra
`M3D_JET_LEN_MAX = 3.6`, el valor **más grande** con el que el borde superior queda en cero en las
360 orientaciones del barrido —se eligió midiendo, no a ojo—. De las tres salidas que esta entrada
ofrecía se tomó la primera (acortar), y se descartó abrir el encuadre porque achica el modelo
entero. Todo en `docs/mapa/mitral-3d-ete.md` → sección 13.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2090..2100 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-15 · W2-A] W1-1 · `calcTHP()` salía temprano sin llamar a `calcEM()`

> **CERRADO.** `calcTHP()` llama a `calcEM()` también en su salida temprana del THP vacío. Los
> cinco nodos vuelven a su estado inicial, la pastilla se apaga y suelta su clave y su dueño, el
> informe pasa a «sin estenosis ni insuficiencia» y el EN SUMA a la frase de normalidad, con el
> Excel exportando el centinela. **El grado fijado a mano se respeta** por la puerta de siempre.
> Cobertura: **TC-473** (bloque A). Mapa: `docs/mapa/valvulas-borrado.md` → sección 6b.
> ⚠️ **Al medir, los DOS gestos de borrado dan resultados distintos** y los dos están en el arnés:
> dígito por dígito el paso intermedio recalcula con un THP fuera de banda y deja `avm_idx` en
> `121.00 cm²/m² (revisar)`; de una vez queda rancio todo, el grado incluido.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2127..2151 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2167..2185 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2186..2200 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2201..2222 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2223..2236 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2237..2258 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2276..2290 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2291..2305 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2306..2327 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2328..2348 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2361..2370 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-15 · Z] Z2 · El PPM AÓRTICO no entra en el informe firmado, y el MITRAL sí
El mitral publica «Desajuste protésico-paciente severo (AEO indexada 0,79 cm²/m²)» en el cuerpo y
en el EN SUMA desde la Fase 2; el aórtico se calcula y se muestra **sólo en pantalla**. Es la
opción conservadora: agregar una frase automática al papel es un texto del informe firmado que la
orden del W2-B no autorizaba explícitamente. **Dos alternativas**, con la conservadora marcada:
1. **(conservadora, la de hoy)** dejarlo en pantalla y que el médico lo escriba si quiere;
2. publicarlo con la misma forma que el mitral, que es una línea en `generarInforme`.
⚠️ Y en los dos casos **el Excel no lo lleva**: haría falta una **columna nueva** (hoy 436), que la
orden prohibía abrir sin parar y reportar.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2415..2426 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-15 · W2-B] W1-13 · `onchange` de `#va_morf` no recalcula

> **CERRADO.** `valvProtSync()` llama a `calcEADetalle()`, igual que ya llamaba a `eaAtPintar()`.
> Va ahí y no en el atributo por el mismo argumento que el resto de esa función: es el dueño
> único de «cambió la morfología». Medido el ida y vuelta: prótesis llena la fila del PPM y
> nativa la esconde Y la vacía. Cobertura: **TC-474**, bloque (D).


Es `valvProtSync()` y nada más; el de `#vm_morf` llama además a `calcIM_ESC()` y `calcEM()`.
**No está medido como defecto** —el censo forzó el recálculo— pero es una asimetría que conviene
cerrar junto con cualquier cambio del veredicto protésico aórtico.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2510..2529 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2530..2551 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2570..2583 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2584..2592 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### ✅ [CERRADO 2026-10-14, D2] D1-2 · Los SIETE globos de legado muestran su texto viejo hasta D2

El mecanismo nuevo —toque, tarjeta corta, sin hover, sin manual— rige para los **doce** globos de la
pestaña desde esta tanda, pero sólo **cinco** tienen tarjeta escrita. Los otros siete
(`prot-eoa`, `prot-dvi`, `prot-ppm`, `im-onda-e`, `im-vti-ratio`, `im-vc`, `im-jet-ai`) muestran el
`title` que su fila ya tenía, leído del DOM. Son textos **largos** —de 231 a 1319 caracteres— y
algunos cuentan historia y atribución, que es justo lo que las tarjetas cortas vienen a sacar.
**Es lo que la orden pide**: sus textos se reescriben en **D2**.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2593..2600 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### ✅ [CERRADO 2026-10-14, D2] D1-3 · El `title` largo de la fila sigue existiendo en escritorio

Lo que se sacó es el `title` **del globo**; el de la **fila** (`span.calc-lbl[title]`) sigue ahí y
sigue apareciendo al pasar el mouse por el rótulo. No es el globo —el globo ya no muestra nada al
hover, medido: cero `title` en los doce— y es la fuente de la que los siete de legado leen su
tarjeta, así que sacarlo ahora dejaría esas siete tarjetas **vacías**. Se va con D2, cuando sus
textos pasen al registro.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2781..2795 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2818..2833 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2842..2852 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### M7 · ✅ CERRADO el 2026-10-14 — gana la ASE 2023 y el operador pasa a `>=`

Los dos documentos están verificados en su folio impreso. **Decisión de Maicol («VTI de entrada
mayor o igual a 60»): gana la guía más nueva**, que es la ASE 2023 (Pandian, folio 16, leído
renderizando a 600 dpi). La app aplica `>= 60 cm` desde el 2026-10-14, así que **el 60,0 exacto hoy
sí afirma**. Verificado además que no hay una guía más nueva que lo contradiga: ni la ESC/EACTS 2025
ni el Praz 2025 nombran el VTI de entrada tricuspídeo, censados los dos PDF completos. El área por
continuidad —de la que este campo es el denominador— **no se movió**: 0,98 / 0,98 / 1,15 cm² en los
dos árboles. Lo fija **TC-468**; **TC-466**, **TC-141**, **TC-416**, **TC-417** y **TC-429** se
adaptaron.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2925..2938 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2939..2948 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### H2 · ✅ CERRADO el 2026-10-14 — la PSAP > 35 mmHg vota

Entró como **segunda vía del mismo criterio** que la velocidad de IT, en el renglón que la Figura 3
imprime junto («TR velocity > 2.8 m/s (PASP > 35 mmHg)»), y **cuenta una sola vez** aunque estén
las dos medidas. Medido por los dos lados del 35 con la velocidad de IT sin cumplir.
⚠️ **La decisión que esta entrada anticipaba quedó resuelta por el lado conservador:** se lee el
campo `psap_calc` tal como está, y cuando `calcPSAP` no pudo calcularlo el campo está **vacío**, así
que el criterio queda sin evaluar en vez de votar con una PSAP a la que le falta el sumando de la
aurícula derecha. Lo que queda abierto es **P1**, abajo.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 2949..2962 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3146..3158 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3275..3293 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3408..3423 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3424..3437 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### C2 · La nota ‡ de la Figura 3 y el inciso (d) no dicen lo mismo — ✅ **CERRADO 17/10/2026 (CORTOS6)**

Decisión de Maicol: **manda la figura**. El Ar−A vota con su **duración sola**, con `> 30 ms`
estricto; el AND con la amplitud de la Ar se retiró y `ASE_ARVEL_SUPL` queda declarada, nombrada en
el rótulo de la fila como la salvedad de la prosa. **Escena que cambia:** con el Ar−A por encima de
30 ms y la amplitud sin cargar o por debajo de 35, el suplementario ahora vota.

#### Lo que decía la entrada original

La nota ‡ nombra sólo «Ar-A duration > 30 ms»; el inciso (d) pide además «a high amplitude
(>35 cm/s) … **along with** an Ar-A duration >30 ms». La app exige el **AND**, que es la prosa y es
el lado conservador. Si Maicol prefiere el criterio de la figura —el Ar−A solo—, es una línea:
sacar la segunda mitad de `cumple` en la entrada `arA` de `ASE_SUPLEMENTARIOS`.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3516..3530 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3546..3557 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### A4 · ✅ **CERRADO EN PARTE 2026-10-12** — Un `null` del Laboratorio cuenta como «Sin disfunción» en el Excel

`DD_Sin (Sin disfunción)` vale `(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`. La frase nueva de
la 8A («Disfunción diastólica.») y la «Función diastólica indeterminada.» que la app ya publicaba
clasifican las dos en `null`, así que un estudio con el E/e′ documentado **cuenta como «Sin
disfunción»** aunque su propio texto afirme lo contrario.

**CERRADO para la frase de la 8A el 2026-10-12** con exactamente esa salida: el token
`ase2016_sin_grado` en `_labDiastGrado`, con rótulo en la columna de texto y ningún `DD_*`. Medido
antes y después: `DD_Sin` pasa de 1 a 0 y el Excel sigue en 435 columnas. **Sigue abierto para la
«indeterminada»**, que no afirma disfunción y a la que no le corresponde este token — ver C10.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3558..3565 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### A5 · ✅ **CERRADO 2026-10-12** — La frase de la 8A no tiene token en el Laboratorio

Era consecuencia de A4. **CERRADO el 2026-10-12**: hoy clasifica `ase2016_sin_grado` y la columna de
texto publica «Disfunción, sin grado (ASE 2016)», así que ya se distingue de «no se pudo
clasificar». Sigue **sin** `DD_*` y fuera de la distribución del panel, del PPT estadístico y del
filtro por grado, y eso es lo correcto: la figura no gradúa. Mismo mecanismo que los cuatro tokens
de la BSE.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3591..3603 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### V1 · Las filas de TAPSE y S′ del cuadro no vuelven a «—» al borrar el dato — ✅ **CERRADO 18/10/2026 (ARR2)**

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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3696..3707 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### ✅ B1 — CERRADO el 2026-10-12. El LAPs y la onda L YA tienen campo

La tanda del strain de la AI agregó `ai_strain_ct` («strain de contracción de la AI», que es el
LAPs) y `onda_l`, y los **cuatro** pasos que quedaban en gris votan: las dos cajas de strain de la
Figura 17, las dos de la Figura 18 y la onda L en los suplementarios de las dos. La consecuencia
medida que este punto declaraba —«un paciente con discordancia 1 y 1 y sin LARS queda
indeterminado»— ya no se alcanza por falta de campo: con el strain de contracción cargado la rama
decide. El Excel pasó de 434 a **435 columnas**. Ver `docs/mapa/diastolica.md` → «Los campos de
strain de la AI y la onda L» y la sección nueva de `docs/fuentes/FUENTES.md`.

El texto original, que es lo que se cerró:

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3809..3823 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 3881..3914 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 4315..4388 (bloque de nivel2), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 4813..4835 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### G1-2 · ✅ **CERRADO el 21/10/2026 (tanda C, commit 1)** — el 0,32 salió de la pantalla de TEP

> Esta entrada ofrecía dos salidas: «decidir que la pantalla de TEP diga de dónde sale el 0,32»
> o «conseguir una fuente que valide el cociente como marcador de TEP agudo». Se tomó una
> tercera, que es la de Maicol: **censada la biblioteca, ninguna fuente lo valida para TEP
> agudo, así que el corte se retira y el cociente queda como número.** La ficha de Referencias
> sí dice de dónde sale el 0,32 que suele citarse, y declara que describe otra población.

Lo que decía:

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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 4871..4894 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
### [CERRADO POR RETIRO 2026-10-15 · Z] G1-6 · El 0,36 en insuficiencia cardíaca NO está verificado al estándar de la casa

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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 4928..4948 (bloque de nivel3), de la seccion
«EcoSmart — pendientes vivos».*

<!-- /L1:INDICE -->
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

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5007..5023 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### G2-2 · [CERRADO 2026-10-15 · G3] El mensaje del importador para el cociente es el de «campo no editable», no el de «calculado»

> **CERRADO por el G3.** Las DOS familias de columna calculada —las 18 con campo y las 75 sin
> campo— reciben hoy el MISMO mensaje, con los datos de origen de cada una, por un dueño único
> (`_labXlsCalcMsg`) que publican el modal del importador y el comentario de celda de la
> plantilla. Cero columnas quedan en «no corresponde a un campo editable». El censo de las 75 se
> CALCULA y no se cablea. Ver `docs/mapa/informe-pdf-excel.md`.

La casa tiene **dos** criterios de columna derivada y el cociente cayó en el que le corresponde
—el de `FAC VD (%)` y `DisfSist_VD`, las derivadas **sin campo**— así que el importador lo lista
como «no corresponde a un campo editable» y no como «un valor que la app calcula sola», que es el
mensaje más informativo y el que recibe `PSAP (mmHg)`.

Para igualarlos habría que inventarle un `dest` que no existe en el DOM, o partir la lista de
«ignoradas» en dos. **No se hizo**: es cosmético y el cambio tocaría el mensaje de las OTRAS
cuatro derivadas sin campo. Declarado.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5024..5041 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### G2-3 · [CERRADO 2026-10-15 · G3] El PPT estadístico y la mini-tabla del PDF de auditoría siguen sin contar la tricúspide binaria

> **CERRADO por el G3.** Las tres superficies de tabla leen hoy el MISMO dueño,
> `_labValvFila`, y la frase que declara las dos binarias es UNA constante
> (`LAB_VALV_BIN_NOTA`). Medido con el PPT y el PDF generados de verdad: las seis lesiones
> ajenas IDÉNTICAS a HEAD, y la tricúspide pasa de «(n = 3) 2 | 1 | 0 | 0» a «(n = 6) — | — | —
> | 2». Ver `docs/mapa/laboratorio-asociaciones-valvulas.md`.

Los dos leen `counts`/`bases` de `_labValvCounts` y **no** `bin`, que es lo que mantiene su salida
idéntica a HEAD — y es lo que la orden del G2 autorizaba. Consecuencia: ahí la estenosis
tricuspídea **significativa sigue sin contarse** (`_labEstenSev` devuelve `null` sobre su token), y
la mini-tabla del PDF por lesión la tiene cableada a `() => null` desde antes.

Es el pendiente que la tanda del 2026-10-05 ya había declarado, ahora acotado a esas dos
superficies. **TC-477 (J) lo fija como límite declarado**, de modo que el día que se arregle el
caso lo note. Para cerrarlo hay que decidir si el PPT y el PDF de auditoría adoptan las categorías
binarias — y eso cambia dos documentos firmados.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5078..5102 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-15 · Z] G3-1 · La ida y vuelta del TAPSE/PSAP no se reproducía: la velocidad de la IT no tenía columna

**Medido**, exportando la fila COMPLETA de 438 columnas de un estudio y reimportándola tal cual:
el cociente **no se puede recalcular**. La cadena es `TAPSE/PSAP ← TAPSE + PSAP ← VRT + PmAD`, y
el eslabón que falta es la **velocidad máxima de la insuficiencia tricuspídea**: `vmax_it` no
está en `LAB_XLS_MAP` —censado— y las dos columnas que la contienen, `PSAP (mmHg)` y
`Grad VD-AD (mmHg)`, son CALCULADAS y no se importan. El TAPSE sí viaja, y la PmAD la app la
deriva de `vci_diam` + `vci_col`, que también viajan.

La orden del G3 lo declara como PARADA y prohíbe arreglarlo. **Las dos alternativas, para que
las decida el médico:**

- **(a) Agregar una columna de ORIGEN** — «Vmax IT (m/s)», campo de entrada, en el bloque del
  Doppler tricuspídeo. Reproduce la ida y vuelta del cociente **y** de la PSAP, y es el único
  camino que no inventa una segunda fuente. **Es una PARADA de columna**: el Excel pasaría de
  438 a 439.
- **(b) Aceptar el valor del archivo marcado como «importado»** — el cociente entraría como
  dato y no como derivado. Deja DOS fuentes del mismo número, que es exactamente lo que esa
  columna existe para evitar, y además no arregla la PSAP.

Lo que **sí** se hizo: el modal del importador lo DICE con todas las letras —«falta la
velocidad máxima de la insuficiencia tricuspídea, que NO tiene columna en este Excel»— en vez
de informar un faltante genérico. TC-478 lo fija para que el día que entre una columna de
origen se note.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5198..5206 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### [CERRADA 2026-10-15 · Z5, opción (b)] Z2-1 · La línea del PPM aórtico dice «aórtico» y la del mitral no nombra su válvula

El mitral publica «Desajuste protésico-paciente severo (AEO indexada 0,79 cm²/m²)» desde la Fase 2
y el aórtico, desde el Z, «Desajuste protésico-paciente **aórtico** severo (…)». La asimetría es
deliberada: con las **dos** prótesis desajustadas el EN SUMA publicaría **dos oraciones idénticas
que sólo se distinguen por el número**. El adjetivo es lo mínimo que las separa.
**Las dos salidas, para que las decida Maicol:** (a) dejarlo así; (b) agregarle «mitral» a la línea
del mitral, que es un texto del informe firmado y esta orden no lo autorizaba.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5207..5218 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### [CERRADA 2026-10-15 · Z5] Z2-2 · La fila de pantalla del PPM aórtico se queda en «requiere …» con el veredicto calculado

`ea-prot-ppm` publica «— (requiere el AVA por continuidad y la superficie corporal)» en escenas
donde `eaProtVeredicto()` **sí** devuelve un PPM: `_eaProtPintar` corrió en un momento en que
`ava-idx` todavía no estaba pintado. **Medido IDÉNTICO en HEAD** en las seis escenas del A/B, así
que es **PREEXISTENTE** y no lo trae esta tanda.
**No afecta al papel:** la línea del informe y la celda del Excel leen el OBJETO de
`eaProtVeredicto`, no ese nodo. Lo que está mal es lo que el médico ve en pantalla.
**Qué habría que hacer:** repintar la fila desde la cola de `calcAo` —después de `ava-idx`— o
hacer que `eaProtVeredicto` derive el indexado en vez de parsear el `textContent`. Lo segundo es
lo que el W2-B eligió NO hacer, y por un motivo (el nodo lleva la marca «(revisar)»).

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5219..5231 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### [CERRADA 2026-10-15 · Z5, salida (a)] Z3-1 · El renglón integrado etiqueta por el AVA por continuidad y nombra el criterio GLOBAL

Con Ø TSVI 20 · VTI TSVI 20 · VTI Ao 56 · G. medio 30 · planimetría 0,90, el renglón dice
**«Moderada — por AVA por planimetría»** mientras el `<select>`, el informe y la fila de la
planimetría dicen **severa**. La rama `else if (ava)` de `calcEADetalle` arma su etiqueta con la
banda del **AVA por continuidad** (`avaEsModerada(avaR)` → «Moderada») y le pega el sufijo del
criterio **global** (`_eaPorCriterio(_RCalc)`), que es otro.
**Medido IDÉNTICO en HEAD**: es **PREEXISTENTE desde la tanda F**, que agregó el sufijo. Lo que el
Z cambia es que ahora se **ve**, porque la fila de la planimetría publica su «(severa)» al lado.
**No se corrigió**: es el texto que la línea publica en un estado cargado y cambiarlo es cambiar
qué palabra firma esa pantalla. **Las dos salidas:** (a) que la etiqueta salga de `_RCalc.grado`,
como ya hace la rama `if (vmax)`; (b) dejar la etiqueta y quitar el sufijo en esa rama.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5253..5298 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### Z4-TEP · ✅ **CERRADO el 21/10/2026 (tanda C, commit 1)** — el 0,32 salió de todo veredicto

> **Decisión de Maicol, 22/10/2026:** el 0,32 no es un corte de TEP — es el umbral de bajo
> riesgo en hipertensión arterial pulmonar (ESC/ERS 2022, Tabla 16, folio 41) — y sale de TODO
> veredicto, frase y score del TEP. Con él se fue el renglón de clase de riesgo entero
> (commit 2), así que la «salida intermedia» que esta entrada declaraba peor que las dos ya no
> existe: no queda ningún veredicto colgando de un corte invisible. **Las escenas que cambian
> están medidas en la ficha de TC-510 y en `docs/mapa/tep-score.md`.**

Lo que decía esta entrada, que sigue siendo la medición válida de por qué no se podía tocar
sola:

La orden corregida mandaba **quitar la etiqueta con el corte** y dejar el valor sin corte **sólo
si** el 0,32 fuera una etiqueta que no participa del score, de la interpretación ni del riesgo.
**Medido, con dos criterios positivos fijos y la PSAP en 61 mmHg:**

| | score de criterios del VD | interpretación | riesgo |
|---|---|---|---|
| ¿usa el 0,32? | **NO** — su bloque no tiene ni un `score++` ni un `criterios.push` | **NO** — `interpEl` ramifica sólo sobre `score` | **SÍ** — `score >= 2 && desacoplado` |

**Las escenas que cambiarían si se retirara, una por una** (todas con `score >= 2`):

| cociente | hoy | si se quita el corte |
|---|---|---|
| 0,311 | 🔴 Disfunción VD significativa | 🟠 Riesgo INTERMEDIO-ALTO |
| **0,320 EXACTO** | 🔴 Disfunción VD significativa | 🟠 Riesgo INTERMEDIO-ALTO |
| 0,328 | 🟠 Riesgo INTERMEDIO-ALTO | 🟠 Riesgo INTERMEDIO-ALTO (no cambia) |
| 0,344 | 🟠 Riesgo INTERMEDIO-ALTO | 🟠 Riesgo INTERMEDIO-ALTO (no cambia) |

O sea: **todo estudio con dos o más criterios del VD positivos y un cociente ≤ 0,32** perdería el
veredicto rojo. Y **el rótulo viaja al PDF de TEP** (`tep-acoplamiento` está en la lista que el
armador recorre), así que no es sólo pantalla.

⚠️ **Y LA SALIDA INTERMEDIA ES PEOR QUE LAS DOS.** Retirar SÓLO la etiqueta —dejar
«TAPSE/PSAP 0,320 mm/mmHg» a secas y no tocar `desacoplado`— no cambiaría ningún veredicto, pero
dejaría el veredicto rojo colgando de un corte que **ya no se ve en ninguna parte**: el médico
leería «Disfunción VD significativa» sin un solo número en pantalla que explique por qué esa
escena es roja y la de al lado naranja. Por eso la etiqueta tampoco se retiró sola.

**No se tocó NADA de esa pantalla.** Lo que sigue abierto es lo de G1-2: el 0,32 es el umbral de
**riesgo bajo en hipertensión arterial pulmonar** (ESC/ERS 2022, **Tabla 16**) y **ninguna fuente
leída lo define como criterio de tromboembolia**, pero la app lo usa para decidir un veredicto de
sobrecarga del VD. **Qué habría que hacer:** decidir si ese veredicto se queda con el 0,32
—rotulándolo por lo que es— o si el cociente sale de la estratificación de esa pantalla. Las dos
son decisiones clínicas.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5451..5457 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### ✅ [CERRADO 2026-10-16 · Y2] Y1-1 · El «por qué» de cada tarjeta es el Y2 y no está

Las tarjetas publicaban la frase cualitativa corta **sin los valores**: «IM severa», no «IM severa
(EROA 45 mm²)». **Lo cierra la tanda Y2**: cada tarjeta lleva ahora la lista de criterios con su
valor y su grado, y —donde la pantalla lo nombra— la línea «Decide». Lo que queda abierto de ese
trabajo está en **Y2-1 a Y2-6**, abajo.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5869..5888 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### Y3b-5 · La fórmula de Balik — ✅ **CERRADO 17/10/2026 (CORTOS13): TIENE FUENTE**

No es el artículo original —que sigue sin estar en la biblioteca— sino una **guía que la publica
con su alcance**: «International evidence-based recommendations for point-of-care lung ultrasound —
2025 focused update» (Volpicelli et al, *Intensive Care Med* 2026, DOI 10.1007/s00134-026-08487-2),
enunciado **D6_11**, **hoja 19**: «V (ml) = D (mm) × 20 … validated in critically ill patients in
intensive care units undergoing invasive ventilation». Es exactamente lo que la app calcula y **no
se movió un número**. Ese documento es *online first* y no tiene folio impreso, así que se cita por
enunciado y hoja. El **alcance** va en el globo ⓘ del campo.

#### Lo que decía la entrada original

`_balikVol` convierte la separación pleural en volumen con `ml = mm × 20` y ya lo publicaba antes de
esta tanda. **Censada la biblioteca entera**: no hay un solo documento que contenga la fórmula ni el
nombre. Lo que sí hay es el **método de Capper** (área de sección máxima × longitud axial), en
*Current Pulmonology Reports* 2024;13:152-172, **folio 167** — otro método, que necesitaría campos que
no existen. Así que la fórmula **se reusa tal cual, no se escribió de memoria y no se agregó ninguna
entrada a `FUENTES.md`**. Para cerrarlo hace falta el artículo original (Balik M, et al. *Intensive
Care Med* 2006) en la biblioteca.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 5941..5956 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### J-2 · El PDF de amiloidosis imprimía sólo el documento — ✅ **CERRADO 17/10/2026 (CORTOS9)**

Sus **dos** encabezados —el principal y el `titPagina` de las hojas de continuación— preguntan hoy
a `pacIdImpreso`, con `'CI'` como etiqueta por omisión para que el texto salga igual que antes
cuando `doc_tipo` está sin elegir.

#### Lo que decía la entrada original

`amiloImprimirPDF` dibuja su encabezado con `_s('ci')` y `_s('doc_tipo')` en **dos** lugares
—el encabezado y el `titPagina` de las hojas de continuación— y **no** le pregunta a
`pacIdImpreso`. Así que el médico que elige la matrícula la ve en el informe y **no** en la hoja
de ETT Avanzado del mismo taco.

**No se tocó**: la orden autoriza «el PDF» y «el PPT», y esto es otro generador. Es **una línea
por sitio** y el dueño ya existe.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6048..6060 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### K-3 · Los otros dos toggles de PDF estaban en `localStorage` — ✅ **CERRADO 17/10/2026 (CORTOS9)**

Hoy son campos del estudio: `sgl_be_pdf` y `ete_qx_pdf`, con el patrón de `contr_be_pdf`. Las dos
claves viejas ya no se leen y se siguen borrando en «Nuevo estudio». Medido con clics reales.

#### Lo que decía la entrada original

K1 movió el estado del bull's eye de contractilidad a un campo DEL ESTUDIO (`contr_be_pdf`). Sus
dos hermanos —`sgl_incluir_pdf` (bull's eye del strain) y `mitral_qx_incluir_pdf` (vista
quirúrgica)— **siguen siendo preferencias globales de `localStorage`**, con exactamente el mismo
modo de falla: aparecen prendidos solos al encadenar estudios. `mitral_qx_incluir_pdf` sí se borra
en `limpiarCampos`; `sgl_incluir_pdf` no. Quedaron fuera de esta orden.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6237..6252 (bloque de nivel3), de la seccion
«Tanda G2 (2026-10-15) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### L-9 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en la tarjeta

> **CERRADO el 2026-10-18 (tanda P, commit 3).** `VINFO_REF` mapea **39 de las
> 44 claves** de tarjeta a su entrada, y `refIr(id)` activa la subpestaña, abre el agrupador y la
> entrada, desplaza hasta ella y la resalta. Un botón «Volver» repone la pestaña y la posición.
> Las **cinco** que siguen sin botón —`tarj-insuf-pulmonar`, `tarj-esten-pulmonar`,
> `tarj-esten-tricuspide`, `et-avt-cont` y `pul-balik`— es porque **la entrada no existe**: ver
> **P-1**.
La orden lo pedía **sólo si abrir Referencias en esa entrada costaba poco**. No hay mecanismo
para abrir la pestaña en una sección concreta: `toggleRef` no tiene una entrada por URL ni por
parámetro, y `showTab('refs')` deja todas las secciones como estaban. Construirlo es agregar un
mecanismo de navegación a una pestaña que un trabajo posterior va a reestructurar en subpestañas.
**No se construyó**, y la tarjeta nombra «ver Referencias» en palabras donde hace falta.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6336..6347 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### M-11 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en las tarjetas nuevas

> **CERRADO el 2026-10-18 (tanda P, commit 3).** `VINFO_REF` mapea **39 de las
> 44 claves** de tarjeta a su entrada, y `refIr(id)` activa la subpestaña, abre el agrupador y la
> entrada, desplaza hasta ella y la resalta. Un botón «Volver» repone la pestaña y la posición.
> Las **cinco** que siguen sin botón —`tarj-insuf-pulmonar`, `tarj-esten-pulmonar`,
> `tarj-esten-tricuspide`, `et-avt-cont` y `pul-balik`— es porque **la entrada no existe**: ver
> **P-1**.
Por el mismo motivo que en el L (**L-9**): no hay mecanismo para abrir la pestaña Referencias en
una sección concreta. La orden de esta tanda lo prohíbe expresamente. Queda para el trabajo que
reestructure esa pestaña en subpestañas.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6407..6425 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### LS-5 · El aviso del importador del diámetro AP no miraba el sexo — ✅ **CERRADO 17/10/2026 (CORTOS8)**

`DCM_RANGO_CLIN` acepta hoy un **par** o una **función del sexo**, la resuelve `_dcmRangoClin` —que
comparten las dos vías del importador— y el corte se le pide a `aiDiamNormalMax`. El sexo llega del
propio archivo, **(0010,0040) PatientSex**. ⚠️ **El CHM del Vivid no trae sexo**, así que por esa
vía el comportamiento es el de hoy: queda declarado abajo como `CORTOS-7`.

#### Lo que decía la entrada original

`LAB_XLS_RANGO_NORMAL.ai_diam` deriva de `AI_DIAM_NORMAL_MAX_H` (40 mm) y esa tabla es estática:
no tiene el sexo de la fila. Con el corte más alto **nunca avisa de más**, que es el lado
correcto, pero en una mujer un diámetro de **39 mm es dilatado y entra sin advertencia**.
De paso se cerró el hueco de un valor que esta tabla tenía declarado: su aviso ya era `>`
estricto y la dilatación pasó de `>= 40` a `> 40`, así que los dos bordes coinciden.

**Salida:** que esa tabla acepte una función por campo en vez de un par de números, para que el
rango se resuelva con el sexo de la fila importada. Toca el consumidor, que lo comparten los 40
campos de la tabla.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6426..6443 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### LS-6 · `FEVICAT` pasó de tres clases a cuatro — ✅ **CERRADO 17/10/2026 (CORTOS7)**

El **orden de lectura** (`ORD`) tenía escritas las tres etiquetas viejas y ninguna matcheaba, así
que la tabla de contingencia salía en orden **alfabético**; hoy se deriva de `FEVI_CATS`.
⚠️ **EL VALOR DE p NO SALÍA MAL:** `chi2test` deriva R, C, los esperados y `df` de las propias
filas, y el chi² es invariante a permutar filas. Lo que sí cambió con la cuarta clase es que hay
más celdas, el esperado mínimo baja y el semáforo cae a 🟡 con `fe<5` más seguido — eso sigue
siendo una consecuencia declarada, no un defecto.

#### Lo que decía la entrada original

Es **consecuencia declarada** y no un defecto. El chi² de los tres pares que usan esa variable
—FEVI contra HTA, contra DM y contra FA— se calcula con **un grado de libertad más**, así que su
**p crudo** cambia; y el ajuste de Benjamini-Hochberg corre sobre la familia del bloque, así que
el **p ajustado** de sus vecinos puede moverse. Lo mismo vale para la distribución del panel, que
pasó de tres barras a cuatro. Queda anotado para que una auditoría que compare dos corridas del
Laboratorio sepa por qué.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6444..6460 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### LS-7 · Dos lugares usaban un 40 pelado — ✅ **CERRADO 17/10/2026 (CORTOS7)**

Los dos pasan a leer al dueño: el **filtro de cohorte** ofrece las cuatro categorías de
`FEVI_CATS` (con los tres valores viejos aceptados y traducidos) y la **comparación de subgrupos**
del PPT parte por reducida = moderada o severa. **Escena que cambia en los dos: el estudio con
FEVI 40 exacta.** El `<select>` `filtro-fevi` —que es otro control, con cuatro rangos `lt30`,
`lt40`, `lt50`, `gte50`— **no se tocó**: no son categorías clínicas sino bandas de filtro.

#### Lo que decía la entrada original

El criterio de cohorte `baja`/`media`/`alta` —cuyo propio comentario ya dice que su 40 es «el
borde interno de la banda intermedia, no un umbral de normalidad»— y la comparación de subgrupos
«FEVI < 40 % frente a FEVI ≥ 40 %», que es una dicotomía con su rótulo impreso. **No se tocaron a
propósito:** cambiarlos cambiaría qué estudios entran en un filtro guardado y qué dice el rótulo
de una tabla del PDF de auditoría. El `<select>` `filtro-fevi` tiene además cuatro opciones de
rango (`lt30`, `lt40`, `lt50`, `gte50`) que tampoco son categorías clínicas.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6467..6479 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### LS-9 · El enlace del aviso a 768 px — ✅ **CERRADO 17/10/2026 (CORTOS8): NO ERA UN DEFECTO**

Era el artefacto de `elementFromPoint` que este repo ya tiene escrito: hay que **desplazar la
página antes de medir**. No se tocó una línea de la app; el enlace tiene geometría y el aviso se
ve.

#### Lo que decía la entrada original

`elementFromPoint` sobre el centro del enlace devolvió «fuera del viewport» en las **dos** celdas
de 768 × 1024 y fue alcanzable en las otras diez. Es el artefacto que este repo ya tiene escrito
—el mismo que el globo del cociente TAPSE/PSAP pagó en la tanda Z— y no un defecto: el enlace
tiene geometría y el aviso se ve. Para cerrarlo hay que desplazar la página antes de medir.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6480..6503 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### LS-10 · El aviso de sexo de las tarjetas vivía en DOS constantes — ✅ **CERRADO 17/10/2026 (CORTOS8)**

Sube a `EV_AV_SEXO`, a nivel de módulo y al lado de `EV_BANDAS_ESPESOR`. **Ni una letra del texto
cambia.** De paso se fue el ternario redundante de `_avSx`.

#### Lo que decía la entrada original

`AV_SEXO_ALTO` (dentro de `evTarjetaVI`) y `AV_SEXO_GEO` (dentro de `evTarjetaGeo`) tienen
**exactamente el mismo texto**: «Sin sexo cargado: se usó el corte más alto.». Son dos funciones
distintas y por eso cada una declaró la suya, pero es la clase de duplicación que esta misma
tanda vino a sacar: el día que una se reescriba, las dos tarjetas dirán cosas distintas del mismo
estado.

**No se unificó** porque el defecto se vio **después** de sellar la versión y de lanzar la suite
completa, y tocar `index.html` ahí mueve el `md5` en medio de la medición, que es exactamente lo
que la regla de la casa prohíbe. **Es una línea**: subir la constante a nivel de módulo, al lado
de `EV_BANDAS_ESPESOR`, y que las dos la lean.

De paso, `_avSx` de la tarjeta del VI quedó con un ternario redundante
—`(!sx && hay dato) ? X : (!sx ? X : '')`, que es `!sx ? X : ''`— y se simplifica en el mismo
movimiento. No cambia su resultado en ninguna escena: está medido en las tres de la tarjeta.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6509..6524 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### ✅ Cerrados por esta tanda

* **M-3 · CERRADO.** El área de la AD cortaba en 18 cm² donde la Tabla 1 corta en 19. Hoy corta
  en 19 y gradúa en cuatro bandas.
* **M-4 · CERRADO.** El diámetro longitudinal del VD usaba 86 mm, que no estaba en ninguna de las
  dos guías. Hoy usa las cuatro bandas de la Tabla 1 (82 / 89 / 96).
* **M-5 · CERRADO.** La FAC severa en 25 % no tenía fuente. Hoy es `≤22`, el corte de la Tabla 1.
* **M-7 · CERRADO.** El seno de Valsalva aplicaba `>` y Maicol había decidido que 40 exactos
  cuenten como dilatado. Hoy es `≥`, y es el único segmento con esa marca.
* **M-6 · CERRADO.** La entrada vieja `ref-vd` decía «S′ ≥10 cm/s» mientras la app aplicaba 9,5 —
  hoy **todas** las filas de `ref-vd2` se derivan del dueño, así que ninguna puede quedar vieja.
  ⚠️ **`ref-vd` (la tabla estática de cinco filas de la ASE 2015) NO se tocó**, por orden expresa:
  la reemplaza el trabajo de Referencias. Sigue publicando «S′ ≥10 cm/s».
* **M-1 y M-2 · CERRADOS en parte.** El diámetro de la VCI pasó a `≤21` como escribe la guía. El
  resto de M-1 (el 18 cm² como signo de PAD elevada) no era un corte de tamaño.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6667..6711 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### PRO-1 · La FUGA PARAVALVULAR de la prótesis QUIRÚRGICA — **CERRADO 17/10/2026 (tanda PRO-B)**

> **Se hizo, y con el diseño que esta entrada recomendaba.** El motor es `eteTaviRPV` con su
> **fuente inyectable** (`src`), así que no se copió ningún corte y **el camino de la TAVI es el
> mismo byte por byte**. Las cuatro decisiones que esta entrada dejaba abiertas se resolvieron así:
> **(1)** la mitral **no** ofrece extensión circunferencial —la conservadora—;
> **(2)** los **cinco** niveles del motor **no se colapsaron**, porque eso habría movido lo que la
> TAVI publica; **(3)** manda el **0,3 cm** de la ASE 2024, que el motor ya aplicaba; y **(4)** el
> rótulo pasó a «aorta descendente» con la autorización de Maicol (PRO-B2).
> Entraron **tres** campos en la aórtica (`ea_pvl_origen`, `ea_pvl_ext`, `ea_pvl_vc_area`) y
> **uno** en la mitral (`vm_pvl_origen`), los cuatro **sin columna de Excel**: 440, medido.
> Dónde está: `docs/mapa/protesis-fuga-pvl.md` · `docs/fuentes/FUENTES-protesis.md` · **TC-497**.
> Lo que esta tanda **dejó abierto** está en **PRO-B1 a PRO-B5**, al final de este archivo.

El texto original de la entrada, que sigue describiendo el punto de partida:


Es el **W1-12** de esta serie y la orden lo marcaba como «MUY IMPORTANTE para Maicol». Hoy **sólo el
módulo TAVI tiene campos de fuga paravalvular** (`ete_tavi_ext_circ`, `ete_tavi_vc_ancho`,
`ete_tavi_vc_area`, `ete_tavi_pht`, `ete_tavi_flujo_rev`, `ete_tavi_vel_tele`), y viven en la
pestaña ETE detrás de dos puertas.

**El diseño que la lectura previa recomienda, y por qué:** reusar **`eteTaviRPV()` como dueño
único** y extenderlo a la prótesis quirúrgica. No es sólo lo más simple: **los cortes de ese motor
son EXACTAMENTE los de la Tabla 8 de la ASE 2024 para la aórtica**, verificado fila por fila —
extensión circunferencial `<10 / 10-29 / ≥30 %`, VC width `<0,3 / 0,3-0,6 / >0,6` cm, área de VC
`<0,10 / 0,10-0,29 / ≥0,30` cm² y THP `>500 / 200-500 / <200` ms—. O sea que el módulo de la TAVI
**ya implementa la tabla aórtica**, y extenderlo no copia ningún corte.

**Lo que hay que decidir, y que la lectura dejó medido:**
1. **La MITRAL no tiene parámetro de extensión circunferencial en su tabla.** La **Tabla 13, folio
   30**, censada entera, publica VC width, RVol, RF, EROA, área de jet, convergencia, densidad,
   contorno y flujo venoso pulmonar — y **ninguna fila de extensión circunferencial de la fuga**. O
   el campo no se ofrece en la mitral, o se ofrece citando la ASE 2019 / la VARC-3 (que son de la
   aórtica). La conservadora es **no ofrecerlo**.
2. **Los grados del motor son CINCO y la orden pide TRES.** Hoy `eteTaviRPV` devuelve
   `Sin RPV / Trivial / Leve / Moderada / Severa`. Colapsarlo a tres cambia lo que la TAVI publica
   hoy, que la orden **congela** salvo lo del reverso: hace falta una decisión explícita de Maicol.
3. **El ancho de vena contracta difiere entre las dos fuentes**: la ASE 2024 pone el borde
   leve/moderada en **0,3 cm** y la VARC-3 en **0,4 cm**. Manda la ASE 2024 (más nueva), que es la
   que el motor ya aplica.
4. **El rótulo del campo de velocidad telediastólica de la TAVI dice «aorta abdominal»** y las dos
   guías hablan de la aorta **descendente** (la VARC-3, de la «descendente proximal»). Es un rótulo
   clínico: se reporta y no se toca.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6712..6755 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### PRO-2 · Las prótesis TRICÚSPIDE y PULMONAR siguen sin graduar — **CERRADO 17/10/2026 (tanda PRO-C)**

> **Se hizo, y con las cuatro tablas que esta entrada dejaba verificadas.** Las dos válvulas
> tienen hoy un veredicto protésico propio, con el MISMO reparto que la prótesis mitral:
> `PROT_SIN_GRADO_TXT` **se conserva** en la fila de «Severidad sugerida» —es literalmente
> cierto— y el veredicto vive en su propia cápsula, así que **`calcET` y `calcVP` no cambiaron
> una línea**.
> **Tricúspide (Tabla 19, folio 36):** cinco criterios con umbral único por tipo, **sin graduar**,
> con el AEO como único operador `<` y el DVI retirado «in the absence of AR or TR» leyendo
> `EM_CONT_REGURG_MIN`.
> **Pulmonar (Tabla 15, folio 33):** dos criterios por tipo y un único veredicto positivo,
> «posible obstrucción» — **la app no puede decir «severa» por ese camino**, porque el motor no
> tiene un segundo nivel al que escalar. Los tres estados sin columna (mecánica, percutánea y
> tipo sin elegir) publican su motivo propio.
> **La regurgitación de las dos NO se movió**: las Tablas 21 (folio 39) y 16 (folio 34) coinciden
> con lo que la app aplica, medido con el grado idéntico en las tres morfologías.
> Entraron **tres** campos (`et_e_vmax`, `vp_tipo_prot`, `ep_gmedio`), los tres **sin columna de
> Excel**: 440, medido clave por clave.
> Dónde está: `docs/mapa/protesis-tri-pulm.md` · `docs/fuentes/FUENTES-protesis.md` · **TC-498**.
> Lo que esta tanda **dejó abierto** está en **PRO-C1 a PRO-C7**, al final de este archivo.

El texto original de la entrada, que sigue describiendo el punto de partida:


Hoy las dos están en `PROT_SIN_GRADO_VALVS` y publican `PROT_SIN_GRADO_TXT` («No graduada: los
cortes de válvula nativa no aplican a prótesis»). **Las cuatro tablas están verificadas** (ASE 2024
T15 folio 33, T16 folio 34, T19 folio 36 y T21 folio 39, más la prosa del folio 35 para la fracción
regurgitante pulmonar).

**Censo de campos, hecho: faltan TRES como mínimo.**
- **Pulmonar:** existen `ep_vmax` y `ep_gmax` (gradiente **máximo**), y la Tabla 15 pide el gradiente
  **MEDIO** → falta `ep_gmedio`. Y falta el **tipo de prótesis pulmonar** (bioprótesis u
  homoinjerto), que es lo que elige la columna de cortes.
- **Tricúspide:** existen `et_gmedio`, `et_thp`, `et_avt`, `et_vti_diast`, `et_tsvd_diam`,
  `et_vti_tsvd` y `vt_dvi`; la Tabla 19 pide además la **velocidad pico de E** de entrada
  tricuspídea, que no tiene campo (`it_vmax_cw` es la Vmax de la **regurgitación**, otra medición).
- La Tabla 21 pide **flujo de vena hepática**, que tampoco tiene campo.

⚠️ **LA TABLA 15 NO TIENE COLUMNA DE «SEVERA»**: sus dos columnas son «Normal» y «Possible
obstruction». La app **no debe afirmar «severa»** en la obstrucción pulmonar por ningún camino.
⚠️ **LA TABLA 19 NO GRADÚA**: es un umbral único por tipo de prótesis, «suggestive of stenosis».
⚠️ **Las prótesis pulmonares percutáneas y las mecánicas sin criterios propios en la guía quedan sin
graduar y lo tienen que decir.**

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6795..6804 (bloque de nivel3), de la seccion
«Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA».*

<!-- /L1:INDICE -->
### PRO-6 · El mapa de prótesis quedó a 754 bytes del techo — **CERRADO 17/10/2026 (PRO-B1)**

`docs/mapa/protesis-valvular.md` quedó en **34,2 KB** y el techo es 35, así que la tanda PRO-B lo
**partió antes de escribir una línea**, medido con `wc -c`: las tres tandas históricas Z, Z5 y Z6
salieron completas a `docs/mapa/protesis-z-z5-z6.md` (**20,4 KB**) y el mapa de origen quedó en
**16,7 KB** con su puntero. El contenido de la tanda PRO ya había salido a archivo propio
(`docs/mapa/protesis-pro.md`, 17,6 KB) por el mismo motivo.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6895..6909 (bloque de nivel3), de la seccion
«Tanda PRO-C (2026-10-17) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### PRO-C4 · Dos rótulos de la IP describían la válvula NATIVA — ✅ **CERRADO 17/10/2026 (CORTOS5)**

Los dos —y una tercera superficie que nadie había contado, el `rotulo` con que el reverso entra en
la fila de discordancia— nombran hoy el **anillo pulmonar** y el **tronco pulmonar distal**, que es
lo que escribe la Tabla 16. Sólo texto: ni un corte, ni un operador, ni un voto.

#### Lo que decía la entrada original

- El `<option>` «Ancho (**>50–65 % del TSVD**)» de `ip_ancho`: la **Tabla 16** escribe «jet width
  >50 % of **pulmonary annulus**», no del TSVD. El corte numérico coincide en el 50; el
  **denominador** que el rótulo nombra, no.
- El rótulo de `ip_reversion` dice «En las **ramas** de la arteria pulmonar» y la Tabla 16 dice
  «in the **distal main PA**» —el tronco distal, no las ramas—.
Los dos son **rótulos clínicos** y esta orden no autoriza cambiarlos: se reportan.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6942..6958 (bloque de nivel3), de la seccion
«Tanda PRO-C (2026-10-17) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### CORTOS-1 · El test de burbuja tiene DOS escalas en la app — ✅ **CERRADO 18/10/2026 (ARR8), por la salida (a)**

La sección FOP de «CC frecuentes» conserva `fop_contraste` y `fop_burbujas` con su escala
(`pocas` <5 · `moderado` 5-20 · `abundante` >20) y su propio párrafo; el bloque nuevo de Otros usa
las bandas de la ficha de Referencias (`<10` / `10-30` / `>30`), que son las que la orden dicta. El
Laboratorio cuenta su barra «Paso de burbujas con contraste» leyendo `fop_burbujas`.

**Por qué no se unificó, medido:** cambiar los `value` de ese `<select>` deja a **todo estudio
guardado** con un valor que su selector ya no ofrece —`selectedIndex -1`, la trampa que `et_grado`
pagó— y mueve el texto del módulo FOP (`FOP_BURB_TXT`) y las categorías de la barra del Laboratorio.
Nada de eso estaba autorizado.

**Consecuencia que hay que saber:** un estudio puede llevar las dos cosas y el informe diría dos
oraciones sobre el mismo test con dos escalas. **Salidas:** (a) que el módulo FOP LEA el bloque
nuevo y su `<select>` quede sólo para los estudios viejos; (b) agregar una tabla de alias de
entrada, el patrón de `LAB_XLS_LISTAS_LEGADO`; (c) dejarlo y documentar las dos escalas.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 6980..6987 (bloque de nivel3), de la seccion
«Tanda PRO-C (2026-10-17) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### CORTOS-5 · El Ar−A tenía DOS constantes con dos operadores — ✅ **CERRADO 18/10/2026 (ARR5)**

`VENP_AR_A_MS` vale 30 con borde **`>=`** —criterio de la ASE/EACVI 2016, que pinta la fila de la
vena pulmonar y la celda del PDF— y `ASE_ARA_SUPL` vale 30 con **`>`**. Un Ar−A de **30,0 exactos**
es positivo para la fila y negativo para el paso suplementario, **en la misma pantalla**. No se
unificaron: son dos guías con el mismo número y distinto borde, y tocar `VENP_AR_A_MS` movería la
alerta de otro módulo.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7071..7088 (bloque de nivel3), de la seccion
«Tanda PRO-C (2026-10-17) — lo declarado y NO tocado».*

<!-- /L1:INDICE -->
### Q-4 · [CERRADO 2026-10-18, tanda P] No hay botón «Ver referencia» en las nueve tarjetas nuevas (es `L-9` y `M-11`, otra vez)

> **CERRADO el 2026-10-18 (tanda P, commit 3).** `VINFO_REF` mapea **39 de las
> 44 claves** de tarjeta a su entrada, y `refIr(id)` activa la subpestaña, abre el agrupador y la
> entrada, desplaza hasta ella y la resalta. Un botón «Volver» repone la pestaña y la posición.
> Las **cinco** que siguen sin botón —`tarj-insuf-pulmonar`, `tarj-esten-pulmonar`,
> `tarj-esten-tricuspide`, `et-avt-cont` y `pul-balik`— es porque **la entrada no existe**: ver
> **P-1**.

Las ocho tarjetas de lesión y la de la función diastólica publican su fuente **como texto**, y no
hay forma de saltar desde ahí a la ficha de la pestaña Referencias: no existe mecanismo para abrir
esa pestaña en una sección concreta. Es la misma entrada que **L-9** (2026-10-16) y **M-11**
dejaron abierta para las tarjetas de la AI, del VI, del VD, de la AD y de la aorta, y hoy alcanza
a nueve tarjetas más.

**Lo que haría falta:** un `showTab('referencias')` que además desplace a un `id` de sección, y un
mapa tarjeta → sección. El mapa es la parte barata; lo que no existe es el desplazamiento.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7161..7174 (bloque de nivel3), de la seccion
«Tanda ARR (2026-10-18) — lo que queda declarado».*

<!-- /L1:INDICE -->
### ARR-5 · [CERRADO 2026-10-22 por el trabajo D] La indicación de cierre del FOP según la edad

**Cerrado en el D-E3 y el D-E4, y la fuente no era la que esta entrada suponía.** La indicación no
es «Clase IIa de la ESC»: la app la publica hoy en la **ficha de Referencias del FOP** y en el panel
de Evidencia con la **AHA/ASA 2021** (Kleindorfer, **folio e411**, apartado 5.4.5) —COR 1 · LOE C-EO
para la decisión conjunta, COR 2a · LOE B-R entre 18 y 60 años con rasgos de alto riesgo tras una
evaluación exhaustiva, y dos COR 2b— más la **posición europea** (Pristipino, **Tabla 5, folio
1396**), que es una declaración fuerte GRADE de 18 a 65 años y **no** una clase de recomendación.
Las dos leídas en el PDF original con el folio comprobado en el pie impreso.
⚠️ **Y SALIÓ DEL INFORME Y DEL EN SUMA, QUE ES LA OTRA MITAD:** el D-E2 los dejó **descriptivos**,
así que la edad ya no gobierna ninguna frase del papel firmado. Lo que la conserva es
`fopConclusion().txt`, que hoy consume **sólo la pantalla**: la hoja de `ccHoja('fop', …)` se retiró
y el PDF publica una tabla de características sin una sola indicación.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7189..7203 (bloque de nivel3), de la seccion
«Tanda ARR (2026-10-18) — lo que queda declarado».*

<!-- /L1:INDICE -->
### ARR-8 · [CERRADO 2026-10-22 por el trabajo D] El informe esquemático del FOP alcanzaba a seis de las diez claves

**Cerrado por el otro lado, y hay que decirlo: no se escribieron las cuatro cláusulas que faltaban,
se retiraron seis de las que había.** Las cuatro claves sin `esq` (`sin_contexto`, `sin_contraste`,
`incidental`, `no_interpretable`) caían en el **párrafo entero** —con su conducta— dentro del papel
FIRMADO, que es el defecto que esta entrada declaraba. Desde el D-E2 el informe es **descriptivo**:
`no_interpretable` ganó su cláusula corta y **siete** de las diez dejan `esq` en `null` a propósito,
porque lo único que decían era el **ACV criptogénico** —o su ausencia—, que es un dato CLÍNICO del
paciente y va al PDF como «Motivo del estudio», no al narrativo.
Las **tres** que sí la llevan dicen algo que no es ese antecedente: `descartado` niega el hallazgo,
`no_interpretable` declara una medición ilegible y `trombofilia` consigna otra condición.
⚠️ **LO QUE `alto_riesgo_sin_evento` DEJA DE DECIR NO SE PIERDE:** sus dos rasgos —el aneurisma y el
pasaje severo— están en las dos oraciones de arriba del MISMO párrafo, con su número. **Medido en
las diez claves por los tres estilos.**

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7291..7312 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-20 · Y3e2] Y3d-1 · La orientación de la vista TRANSGÁSTRICA no coincidía con la guía

**Censadas las OCHO guías de ETE de la biblioteca**, la única que describe esa orientación es la
**ASE/SCA 2013** (Hahn, JASE 2013;26(9):921-964), **folio 939, hoja 19** —regla de folio = hoja +
920, comprobada en el pie impreso—:

> «… with the **anterior leaflet on the left of the display and the posterior leaflet on the
> right**. The **medial commissure is in the near field, with the lateral commissure in the far
> field**.»

Eso es un giro de unos **90°**. La demo aprobada rota **180°**, lo que deja la anterior **abajo**,
la posterior **arriba**, AL a la derecha y PM a la izquierda. **No coincide.**

✅ **CERRADO el 2026-10-20 (Y3e2) por la salida (b), DECISIÓN DE MAICOL.** `ETE_QX_VISTAS.tg`
pasa de `rot: 180` a `rot: 270`, o sea el dibujo del cirujano girado **90° ANTIHORARIO y sin
espejo**. Las cuatro afirmaciones de la guía se verificaron una por una sobre el lienzo
renderizado: anterior a la izquierda (marca `Ao` en 110,219), posterior a la derecha (P1-P3 con
x 237-275), `PM` arriba (210,61) y `AL` abajo (210,377). Las seis letras siguen visibles.
**El PDF no se movió**: el hash de su data URL es el mismo en las tres vistas. **La vista ETT no
se tocó** y sigue siendo criterio de Maicol, sin fuente. **`docs/3d/` tampoco**: la demo conserva
su giro de 180°.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7331..7346 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-21 · trabajo H] Y3d-4 · El «hasta el 85 %» de la coartación se retiró y no se reemplazó

✅ **CERRADO el 2026-10-21 (trabajo H): la fuente apareció y el número está verificado.** La
ESC 2024 de enfermedad arterial periférica y aórtica publica, en su **folio 119 (hoja 120)**, que
la coartación se asocia a válvula aórtica bicúspide en el **50 al 85 %** de los casos — o sea en el
sentido que esta entrada anticipaba. La frase vive **sólo en el panel de Evidencia** (`_indCoAo`),
no en el informe ni en el EN SUMA, por la decisión de la orden del trabajo H.

Lo que esta entrada decía, para que se entienda el cierre:

La afirmación estaba **invertida**: lo que la literatura publica es la prevalencia de **VAB entre
los coartados** —alta—, no la de coartación entre los portadores de VAB, que es baja. **Ninguna
fuente de la biblioteca publica ese porcentaje en ninguno de los dos sentidos**, así que el
recordatorio quedó con la indicación clínica y **sin número**. El día que aparezca una fuente, el
número va **con su folio** y en el sentido correcto.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7347..7357 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-20 · Y3e3] Y3d-5 · «Senos asimétricos» no estaba definido en ninguna fuente

✅ **CERRADO el 2026-10-20 (Y3e3) por una salida que esta entrada no ofrecía: la simetría SÍ
está definida en la fuente, y lo que no estaba definido eran los SENOS.** El consenso la define
por el **ángulo entre las comisuras de la cúspide no fusionada** (folio 225, hoja 7) y publica
**tres** categorías con su punto medio (pie de la Figura 9, folio 230): simétrica 160-180° (≈170),
asimétrica 140-159° (≈150) y muy asimétrica 120-139° (≈130). La app pasa a decir **«cúspides»**,
el selector gana la tercera categoría y el dibujo abre la V de cierre al ángulo que corresponde.
⚠️ **Y la fuente acota las categorías a los tipos FUSIONADOS**, así que el 2-sinus dejó de
representar una asimetría que nadie define para él.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7373..7383 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-20 · Y3e4] Y3d-7 · `tests-fichas.md` quedó en 28,9 KB

✅ **CERRADO el 2026-10-20 (Y3e4): se partió ANTES de escribir y no después.** Medido con
`wc -c` antes de tocarlo: estaba en **28,9 KB** y la ficha de TC-505 lo cruzaba. Las fichas de
**TC-499 a TC-501** salieron a `docs/mapa/tests-fichas-499-501.md` (15,6 KB) y el archivo de
origen volvió a **14,2 KB** antes de recibir la ficha nueva; con ella quedó en **19,0 KB**. Es la
cuarta partición de este archivo y la segunda que se hace a tiempo.


---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7386..7401 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### ✅ [CERRADO 2026-10-20, tanda Y3f6] Y3e-1 · El PDF sigue diciendo «fused type» en la hoja de cardiopatías congénitas

> **CERRADO por las DOS salidas a la vez, y es lo que la decisión de Maicol pide:** «fused type»
> pasa a español en todo rótulo visible -la salida (a)- **y** la hoja de CC **se retira para la
> VAB**, porque la sección publica su propia tabla y la hoja duplicaba lo que el papel ya dice.
> El **Excel conserva el texto viejo** y el importador entiende las dos formas.

Medido con el PDF **generado de verdad**: la hoja de CC publica «Válvula aórtica bicúspide -
**fused type** R-L (fusión derecha-izquierda).», en inglés y dentro de un papel firmado en
español. Sale de `VAB_TIPO_TXT`, que el **Y3d8** decidió conservar «para la pantalla, el Excel y
Ver detalle» mientras el **informe** pasaba a `VAB_INF_FENO`, en español. Lo que ese reparto no
contempló es que `ccHoja` es una **tercera** superficie y que sí llega al papel.
**No se tocó**: es un texto del informe firmado y esta orden no lo autoriza. **Decidir:** (a)
que la hoja use `VAB_INF_FENO`, como el informe; (b) dejarlo, porque es el nombre técnico del
consenso.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7402..7415 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### ✅ [CERRADO 2026-10-20, tanda Y3f7] Y3e-2 · El aria-label del dibujo de la VAB no nombra la simetría, así que no hubo nada que renombrar

> **CERRADO por la salida que esta entrada proponía:** `vabDibAria()` arma el nombre accesible y
> **publica el tipo de fusión Y la categoría de simetría con su ángulo**, así que el lector de
> pantalla ya no depende de leer el selector. Y el dibujo ganó además el **arco del ángulo** con su
> leyenda (`vabAngNota`), que es la misma información para quien mira.

La orden incluía «el aria-label del dibujo» entre los lugares donde «senos» pasa a «cúspides».
Censado: el nombre accesible del SVG es un `<title>` **estático** —«Esquema de la válvula aórtica
en eje corto»— y los `aria-label` de los tres puntos sensibles nombran la **fusión**, no la
simetría. **Ninguno dice «senos»**, así que no se cambió ninguno y **no se inventó uno nuevo**.
**Decidir:** si el nombre accesible debería publicar además la categoría y el tipo, que hoy el
lector de pantalla sólo obtiene del selector.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 7516..7531 (bloque de nivel3), de la seccion
«Lo que la tanda «P» declaró y NO tocó (2026-10-18)».*

<!-- /L1:INDICE -->
### R2-1 · [CERRADO 2026-10-22, tanda E] El informe callaba con la VRT «no medible» y cero categorías

La probabilidad pasa a **BAJA** en ese estado (era «INDETERMINADA»), que es lo que la Figura 5
publica. Pero la compuerta que decide si el informe escribe la línea de probabilidad **no cambió**
en el R2: con la VRT no medible y ninguna categoría presente, el papel seguía sin decir nada.

**Cerrado en el commit E2**, y lo que lo cerró es distinguir **`vrtSel` de `vrtCat`**: «no medible»
ELEGIDA en el desplegable y «automático» sin IT cargada daban el mismo `vrtCat` y son cosas
distintas. Hoy la primera publica la línea —«probabilidad baja (VRT no medible; sin signos
adicionales)»— y la segunda **sigue callando**, que es el lado conservador: no se afirma sobre un
estudio al que no se le cargó nada. El estado que esta entrada nombraba —el paciente **sin chorro de
IT medible**, entre el 40 y el 60 % según la BSE— es el primero.

⚠️ **No se escribió ninguna frase nueva**: la línea que ya existía produce ese texto con esos datos.
Ver `docs/mapa/htp-hfapeff.md` §3.

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 8174..8199 (bloque de nivel3), de la seccion
«Lo que el trabajo «D» declaró y NO tocó (2026-10-22)».*

<!-- /L1:INDICE -->
### D2b-9 · Seis comentarios de `index.html` de esta tanda llevan la fecha equivocada — **CERRADO el 2026-10-21 (D3)**

**Cerrado:** el **D3** tocó `index.html`, que es la condición que esta entrada ponía, y los seis
pasaron a `2026-10-21` de paso. Verificado: `grep -c "D2-E., 2026-10-22" index.html` da **0** y
`grep -c "D2-E., 2026-10-21"` da **6**. La línea base entera se volvió a medir sobre el árbol ya
re-sellado, así que no queda nada medido sobre el `md5` anterior.

Lo que decía:

Dicen **2026-10-22** y la fecha real es el **21**: el reloj del sistema, el encabezado que imprime
la suite (`21/10/2026`) y el sello del propio commit (`v20261021-1443`) dicen los tres 21. Copié la
fecha de las tandas B2 y D, que la escribieron mal en sus comentarios de caso.

Son **dos** de `D2-E1`, **uno** de `D2-E3` y **tres** de `D2-E4`, los seis en bloques de comentario.
La documentación y los comentarios de `scripts/test_clinico.mjs` **sí** quedaron en `2026-10-21`.

**Por qué no se corrigió acá:** `index.html` está **sellado** y la línea base entera —la suite en
dos mitades, Semgrep, el chequeo de celular y los cuatro A/B— se midió sobre ese `md5`. Tocar un
comentario obliga a volver a sellar y a volver a medir todo para cambiar seis caracteres, y una
línea base que no corresponde al árbol sellado es peor que una fecha mal escrita.

**Salida:** la próxima tanda que toque `index.html` los arregla de paso, con
`grep -n "D2-E., 2026-10-22" index.html`.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 8954..8976 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-3h] AJ5-d · El strain del VD no vota, así que puede quedar «conservada» con el strain alterado

> **Cerrado.** El strain vota: de 15 a 20 % en valor absoluto, leve; por debajo de 15, «leve como
> mínimo»; por encima de 20 no vota. **No puede subir el grado** que TAPSE y onda S′ ya dieron.
> `hayFunc` no se tocó. Medido A/B en las tres bandas y en los dos bordes.

**Qué se encontró.** La orden dice, textual, «si no la incluye, el campo muestra su grado y aparece
como dato en la oración de función del VD, **sin votar**». `vdDisfGrado` lee TAPSE y onda S′ y nada
más —medido—, así que el campo no vota. Consecuencia: con TAPSE 22 mm y S′ 13 cm/s (los dos
normales) y un strain de −18 % (leve), el informe firma «función sistólica conservada (strain de
pared libre −18 %)».

**Qué puede causar.** Una afirmación de normalidad al lado de un parámetro alterado del mismo
ventrículo. **Se mitigó lo que se podía sin cambiar la lógica de integración**: al papel va el
NÚMERO y no la categoría, así que la frase no dice «conservada (leve)»; el grado se ve en la
pantalla, al lado del campo.

**Cómo se corrige.** Sumarlo al OR de `vdDisf` cambiaría qué escenas publican «disfunción
sistólica» en el informe firmado, que es lógica de integración y decisión de Maicol — el mismo
argumento con el que la FEVD sigue sin votar.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 8977..9011 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-3i] AJ5-e · La banda «leve 15-20 %» del strain NO estaba en el AJ1, y no está declarada en Referencias

> **Cerrado por el camino (a):** ficha propia `FUN-VD-008`, `criterio propio de EcoSmart` y
> `por verificar`, con la banda **derivada de `VD_STRAIN_PL_LEVE`** y la fila del cuadro **SIN
> CORCHETE** (`_evRefBiblio` saltea las fichas no verificadas). Abajo, la nota con el chip. Y se
> reescribió el comentario que decía que el dueño era un corte BINARIO. **Moderada y severa
> siguen sin existir**, y se censó de nuevo: no están ni en `ASE25_T1`, ni en el folio 145, ni
> en el 159.

**Qué se encontró.** Dos cosas, y la segunda la cazó `/sharp-edges`:

1. La orden dice que los cortes «ya [estaban] aplicados en el AJ1». **Es falso**: el AJ1 unificó el
   corte de NORMALIDAD por sexo (−20 %, un solo corte para los dos) y **no abrió ninguna banda
   intermedia**. La ficha `FUN-VD-007` lo declara textual: «el dueño no gradúa… es un corte
   BINARIO, no las tres bandas de la Tabla 1». El 15 se aplica porque **la orden fija el número**,
   igual que el 36 mm de la AJ4-1.
2. La fila del cuadro de Referencias del VD (`FUN-VD-007`) publica **un solo corte**, el de
   normalidad, con el comentario de arriba diciendo que el dueño es binario. Desde la AJ5-5 la
   pantalla aplica una banda intermedia que **esa fila no declara**: la misma aplicación afirma en
   una superficie que no gradúa y gradúa en otra.

**Y moderada y severa no existen en ningún lado.** Censado: ni la Tabla 1 de la ASE 2025 de mayo,
ni el texto del folio 159, ni `ASE25_T1`, ni ninguna ficha de `IND_REFS`. La orden dice «usá los
que ya tiene la app… no inventes ninguno», así que **no se inventó ninguno**: por debajo de 15 el
campo dice «por debajo de leve», que es la negación de las dos bandas que sí existen y no un grado
nuevo.

**Cómo se corrige.** Dos caminos, los dos de contenido: (a) publicar la banda en la fila de
Referencias derivándola de `VD_STRAIN_PL_LEVE` —sin escribir un número nuevo— y reescribir el
comentario que dice que el dueño es binario; o (b) retirar la banda `leve` hasta que tenga fuente.
**`_vdStrainPlAssert` vigila el corte de normalidad pero nada vigila que el 15 exista en
Referencias.**

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9012..9031 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-3j] AJ5-f · Qué hace la PANTALLA con el Tipo de IM y el Carpentier sobre una prótesis

> **Decidido: se atenúan y se bloquean, conservando el valor.** `vmProtBloqSync()`. No se
> esconden —un valor cargado que desaparece de la vista no deja rastro— y no se borra nada.

**Qué se encontró.** La orden dice que no está decidido, y pide dejarlos visibles y sin cambios.
Así quedaron: con `vm_morf` en «Prótesis biológica» o «Prótesis mecánica», los dos `<select>` de la
fila siguen **visibles, habilitados y conservando su valor**. Lo que cambia es sólo el papel: el
paréntesis no se escribe (`_vmProt`).

**Qué puede causar.** El médico ve dos campos cargados cuya información no sale en ninguna parte, y
no hay nada en la pantalla que lo diga. Es el mismo estado que ya tienen el Carpentier, el
mecanismo y el score de Wilkins del ETE sobre una prótesis, que `vmEsProtesis` gobierna.

**Cómo se corrige.** Tres opciones y las tres son decisión de Maicol: esconderlos como hace
`vmEsProtesis` con los descriptores nativos del ETE; dejarlos y agregar una línea gris que diga
que no van al informe; o dejarlos tal cual.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9032..9064 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-3k] AJ5-g · «Mixomatosa / Barlow» se recorta 6 px en el control cerrado, y las tres exigencias de la orden no son simultáneas

> **Cerrado por el primer camino, y MIDIENDO en vez de fijar un número:** `vmMorfFitSync()` mide
> el rótulo seleccionado contra el ancho útil de hoy y baja el cuerpo de a 0,25 px hasta que
> entre, con piso declarado de 10 px. Medido: 12,48 → 11,98 px, y el rótulo pasa de 125 px a
> 120 contra 121 de ancho útil. «Isquémica (disfunción/rotura músculo papilar)» llega al piso y
> se queda ahí: ya se recortaba antes de la AJ5 y la orden no la nombra.

**Qué se encontró.** La orden pide tres cosas a la vez: tres campos **del mismo ancho** (un tercio
cada uno), un **largo total no mayor al del botón «Insuficiencia»**, y las **opciones largas
legibles**. Medido en Chrome con `measureText` sobre la tipografía real del `<select>`:

| ancho de la fila | celda | ancho útil | «Mixomatosa / Barlow» (125 px) | «Isquémica (disfunción/rotura músculo papilar)» (275 px) |
|---|---|---|---|---|
| 573 (la pastilla entera) | 186 | 156 | cabe | recorta |
| **463 (el botón)** | **149** | **119** | **recorta por 6 px** | recorta |
| 415 (a 1280 px, dos columnas) | 204 | 174 | cabe | recorta |

Con el ancho del botón —que es lo que la orden fija— «Mixomatosa / Barlow» no entra por **6
píxeles** en el control CERRADO. El desplegable abierto sí lo muestra completo, y la opción
«Isquémica…» ya se recortaba antes de esta tanda (a 420 px el ancho útil eran ~390 px, así que
entraba; hoy no).

**Qué puede causar.** El médico elige la morfología y después no puede verificar de un vistazo
cuál eligió.

**Cómo se corrige.** Tres caminos, los tres de maquetación y decisión de Maicol: bajar un punto la
tipografía **de esa fila sola** (a 12 px el rótulo mide 115 y entra); dejar la fila en el ancho de
la **pastilla** (573) en vez del botón, y entonces entran las dos primeras pero no la «Isquémica…»;
o acortar el rótulo de la opción.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9112..9139 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-1a] AJ6-a · El EN SUMA repite la insuficiencia y la estenosis pulmonar que la sección de válvulas ya publicó

> **Cerrado por la tanda AJ7, commit 1a.** La línea de Fallot del EN SUMA dejó de publicar la
> insuficiencia pulmonar: hoy dice sólo lo propio de la cardiopatía. Medido en Chrome con un
> estudio de Fallot con IP severa, gradiente TSVD 36 mmHg, VD normal e IT moderada —la línea pasa
> de «Tetralogía de Fallot reparada — **insuficiencia pulmonar severa** — gradiente TSVD 36 mmHg
> — VD con función normal — IT moderada — volúmenes…» a la misma sin la segunda cláusula—, con
> `txt` y `lineasInf` **idénticos** (el cuerpo del informe y la caja «Conclusión» no se tocaron).
> **El gradiente NO se movió** y queda declarado aparte: ver **AJ7-a**.

**Qué se encontró.** La línea de Fallot del EN SUMA (`ccSumaLinea('tdf')`) empieza con
«Tetralogía de Fallot reparada — insuficiencia pulmonar severa — gradiente TSVD 36 mmHg — …», y
esas dos cosas ya figuran más arriba en el mismo EN SUMA, emitidas por la sección de la válvula
pulmonar. **La orden lo nombra y pide no tocarlo**: «la repetición de EP e IP que ya figura arriba
no se toca, reportala».

**Qué puede causar.** Un EN SUMA más largo de lo necesario, con el mismo hallazgo dicho dos veces
con palabras distintas («IP severa» arriba, «insuficiencia pulmonar severa» abajo). No hay
contradicción: son el mismo dato leído del mismo campo (`ip_grado`).

**Cómo se corregiría.** Hay dos caminos y los dos son decisión clínica: (1) que la línea de Fallot
omita la IP y el gradiente cuando la sección de válvulas ya los publicó —y entonces un lector que
sólo mire la línea de la cardiopatía no ve la severidad de la válvula—; o (2) que la línea de
Fallot los conserve y la de válvulas los omita cuando hay Fallot integrada, que invierte la
dependencia entre dos módulos que hoy no se conocen. **Decisión de Maicol.**

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9140..9163 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-1b] AJ6-b · La hoja del PDF de Fallot sigue publicando la conducta, y el informe ya no

> **Cerrado por la tanda AJ7, commit 1b.** `resumen` pasó a ser DESCRIPTIVO y con eso salieron la
> indicación y la clase de los **dos** consumidores que tiene —la hoja de congénitas del PDF y la
> diapositiva del PPT—. Medido sobre el **PDF generado de verdad**: «reemplazo valvular pulmonar»,
> «Clase I», «Clase IIa» y «medidas seriadas» pasan de **1 aparición cada una a 0**. De paso la
> hoja gana el detalle que no tenía (gradiente, función del VD, IT), porque `resumen` ya no era el
> encabezado más la conducta sino el texto descriptivo completo.

**Qué se encontró.** `ccHoja('tdf', …)` recibe `c.resumen`, que **conserva la conducta** —es el
mismo campo que consume el PPT—. Así que un estudio con el botón «Incluir en el PDF» de congénitas
tildado imprime una hoja con «Segun la guia: … sin síntomas ni otros criterios de reintervención —
seguimiento», una frase que la orden AJ6-1 sacó del cuerpo del informe.

**Qué puede causar.** El mismo PDF firmado puede decir las dos cosas: el cuerpo describe y la hoja
recomienda. No se contradicen —la hoja dice lo que la guía dice— pero la regla de producto de esta
tanda («indicaciones y clase sólo en Evidencia») queda cumplida en el cuerpo y no en esa hoja.

**Cómo se corregiría.** Pasarle a `ccHoja` un texto propio sin conducta, o no pasarle conclusión.
Las dos cosas cambian el PDF firmado, que esta orden no autoriza: la orden nombra el informe, el
EN SUMA y la caja «Conclusión», y nada más. **Decisión de Maicol.**

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9260..9281 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-5] J2-a · «Reevaluar en 3-6 sem» en la fila anti-HER2 no tiene fuente, y sigue en pantalla

> **Cerrado.** Retirado de las **dos** copias, y **nada en su lugar**: lo que la Figura 11 publica
> son plazos de VIGILANCIA por riesgo, que contestan otra pregunta. Medido: de 2 apariciones a 0.

**Qué se encontró.** La tabla «Cardiotoxicidad» y la subtab «Monitoreo eco» de la pestaña de
cardio-oncología dicen, para los anti-HER2: «Si la FEVI cae ≥10 pp o baja de 50%: **reevaluar en
3-6 sem** y graduar la CTRCD…». Ese plazo **no** figura en el pie de la Figura 11 (folio 4260) ni
en ninguna de las tablas de recomendaciones de seguimiento de la ESC 2022 que se leyeron.

**Por qué no se tocó.** La orden de esta tanda nombra el plazo de «2-4 semanas» y el de «control
en 4 semanas», y los dos salieron. Este no lo nombra. Mover un plazo clínico que la orden no
nombra sería tocar contenido clínico sin permiso, que es lo que `CLAUDE.md` prohíbe.

**Qué puede causar.** Un plazo sin respaldo al lado de otro que sí lo tiene, en la misma tabla:
el médico no puede distinguir cuál sale de la guía.

**Cómo se corregiría.** Igual que el de 2-4 semanas: retirar la fecha y dejar «graduar la CTRCD
con la subtab “CTRCD”». Es una línea en dos lugares. Decisión de Maicol.

---

<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 9359..9389 (bloque de nivel3), de la seccion
«La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)».*

<!-- /L1:INDICE -->
### [CERRADO 2026-10-24 · AJ7-6a] J2-f · Un hallazgo ALTA más en el celular: el ⓘ del score es el decimoquinto `.vinfo-btn`

> **Cerrado junto con el de la tanda G.** Los **dos** globos llevan la clase `.vinfo-btn-44`, que
> da el piso táctil sin la media query. `check_mobile.js` vuelve de **65/74 con 19 ALTA** a
> **63/72 con 17**. Los otros quince no se tocaron → **AJ7-e**.

**Qué se encontró.** `check_mobile.js` pasa de **17 a 18 ALTA** en los dos anchos (360 y 390 px).
El hallazgo nuevo es el globo ⓘ del score de amiloidosis, medido en **13×13 px** contra el piso de
44×44 que el checker exige, y entra en ALTA porque la regla marca así todo control de menos de
28 px sin etiqueta envolvente.

**Por qué no es una clase nueva de defecto.** La línea base ya contaba **catorce** `.vinfo-btn`
con exactamente el mismo hallazgo y la misma medida (16×12 y 15×11 px): el de la función
diastólica, los de AI/VI, VD, AD, aorta, los de prótesis y los de la bicúspide. Es **el mismo
componente**, y su piso táctil está acotado a propósito a `@media (pointer: coarse)` —con el
mouse, 44 px alrededor de un glifo de 13 serían un blanco enorme—. `check_mobile.js` **no emula
un puntero grueso**, así que mide el tamaño de escritorio: en un teléfono real ese botón mide
44×44 y el hallazgo no describe lo que el médico toca.

**Lo que sí se corrigió.** El botón nacía en **11×11 px**, más chico que sus catorce hermanos,
porque heredaba el `font-size:11px` del rótulo en mayúsculas que lo envuelve. Hoy lleva
`font-size:13px`, el mismo que los demás, y mide 13×13.

**Cómo se corregiría del todo.** O que `check_mobile.js` emule `pointer: coarse` —y entonces los
quince dejan de aparecer, que es lo que un teléfono ve—, o sacarle el gate al piso táctil de
`.vinfo-btn` y aceptar 44 px también con el mouse. Las dos tocan los quince botones a la vez, así
que es una tanda propia. Decisión de Maicol.

---


<!-- L1:INDICE -->

*Archivado de `docs/PENDIENTES.md`, lineas 10490..10572 (bloque de nivel2), de la seccion
«Corrección D-11 (2026-10-28)».*

<!-- /L1:INDICE -->
## D-r · [CERRADO 2026-10-28] La suite completa del D-11 — retomada y cerrada

**Cerrado al retomar tras el reinicio.** Suite **554/558**, 558 de 558 casos distintos ejecutados,
rojos **TC-223, TC-376, TC-390 y TC-406** y ninguno más —**TC-358 salió verde**—, con el pendrive
verificado al abrir, entre lotes y al cerrar. ⚠️ **El lote 10 destapó una regresión del D-11**
—`TC-514`, la declaración `data-espejo` borrada en «Nuevo estudio»—, corregida y fijada con la
mutación M15; está contada en **D-s**. Lo de abajo queda como registro de lo que faltaba.

### Lo que decía cuando quedó pendiente

El commit del D-11 es **de resguardo**: Maicol tuvo que cortar la corrida porque se llevaba la
computadora y el pendrive. **No es una línea base cerrada.**

### Qué quedó medido y cerrado

| | |
|---|---|
| Casos de la zona (amiloidosis, espejos, estudio nuevo) | **8/8 verdes** |
| Mutaciones dirigidas | **14/14 muertas**, en worktree, con guarda de md5 |
| TC-543 contra el HEAD del D-10 | **cae en 6 de 27 condiciones** |
| Casos viejos adaptados | **cinco**, con el motivo escrito |
| A/B contra el HEAD del D-10 | **703 claves, 1 diferencia** (el id generado del estudio) |
| Semgrep | **124 WARNING / 0 ERROR** |
| Censo de campos | **1025**, 0 huérfanos |
| Celular | **63 a 360 px y 72 a 390, 17 ALTA en cada ancho** — idénticos a la base |
| Chrome y WebKit | los **ocho cruces** coinciden valor por valor, **0 errores de consola** |
| Tiempos de escritura | media **0,14 a 0,19 ms**, contra 0,12 a 0,22 del D-10 |
| Excel | **440** columnas (en el A/B, clave por clave) |

### Qué FALTA

**Sólo la suite completa.** Corrieron **9 de los 11 lotes**: 495 casos, 491 verdes y 4 rojos
—**TC-223, TC-376, TC-390 y TC-406**, los cuatro de siempre—, **sin un rojo nuevo**. Faltan:

1. **Los lotes 10 y 11**, que son 63 casos: `TC-481` a `TC-543` más los quince `TC-GR`.
2. **La repetición del lote de TC-358**, el intermitente por el CDN de jsPDF (**E-h**).

**El pendrive `DISK_IMG` tiene que estar montado**, porque `TC-181` a `TC-197` dependen de él.
Verificarlo antes de arrancar: si el `ls` no lista nombres reales, esos diecisiete fallan y no
prueban nada.

```bash
cd ~/Desktop/APLICACIONES/ecosmart && ls /Volumes/DISK_IMG/GEMS_IMG/
```

**Para correr sólo lo que falta** (los lotes 10 y 11, más el lote de TC-358):

```bash
cd ~/Desktop/APLICACIONES/ecosmart && bash /dev/stdin <<'EOF'
set -e
ls /Volumes/DISK_IMG/GEMS_IMG/ >/dev/null || { echo "PARA: falta el pendrive"; exit 3; }
M0=$(md5 -q index.html)
python3 - > /tmp/lotes_resto.sh <<'PY'
import re, io
s = io.open("scripts/test_clinico.mjs", encoding="utf-8").read()
ids = re.findall(r"^caso\('(TC-[0-9A-Za-z-]+)'", s, flags=re.M)
v = []
for i in ids:
    if i not in v: v.append(i)
lotes = [v[k:k+55] for k in range(0, len(v), 55)]
print("#!/bin/bash")
for n in (10, 11):                      # los dos que faltan
    if n <= len(lotes):
        print('echo "=== LOTE %d ==="' % n)
        print('ls /Volumes/DISK_IMG/GEMS_IMG/ >/dev/null || { echo "PARA: falta el pendrive"; exit 3; }')
        print('node scripts/test_clinico.mjs --solo %s 2>&1 | grep -E "RESULTADO|✗"' % ",".join(lotes[n-1]))
print('echo "=== LOTE de TC-358, repetido ==="')
print('node scripts/test_clinico.mjs --solo %s 2>&1 | grep -E "RESULTADO|✗"' % ",".join(lotes[7]))
PY
bash /tmp/lotes_resto.sh
ls /Volumes/DISK_IMG/GEMS_IMG/ >/dev/null && echo "pendrive OK al cerrar"
[ "$M0" = "$(md5 -q index.html)" ] && echo "GUARDA OK: index.html no cambio" || echo "GUARDA ROTA"
EOF
```

**Criterio de cierre:** los cuatro rojos conocidos y ninguno más (TC-358 cuenta aparte: si queda
rojo, es **E-h** y no una regresión — verificado tres veces el 27/10 contra dos árboles distintos).
Si aparece cualquier otro rojo, **es una regresión del D-11** y hay que mirarla antes de pushear.

⚠️ **Y no hace falta rehacer nada de lo que ya está en la tabla de arriba**: el A/B, las
mutaciones, los dos motores, el celular, Semgrep y el censo se corrieron sobre **este mismo árbol**
—sello `v20261028-1137`— y el md5 de `index.html` no cambió desde entonces.

## P18-b · [CERRADO 2026-11-08 · PANT24-3] El informe puede publicar un AT/TE mayor o igual que 1 que la fila se niega a clasificar

`eaProtVeredicto` calcula `at / tango_te` en cuanto el ET es positivo, **sin pedir que el AT sea
menor que el ET**, y ese número viaja al paréntesis de medidas del informe firmado como
«AT/TE 1.01». La **fila** del cuadro sí tiene esa guarda y muestra la raya.

**Por qué quedó así:** cambiar `eaProtVeredicto` movería el papel, y esta tanda tenía autorizados
dos lugares y éste no era uno.

**Qué habría que hacer, cuando se decida:** mover la guarda de `_eaAtEtVal` a `eaProtVeredicto`,
que es una línea. **Mueve el papel** —el paréntesis de medidas del informe, del EN SUMA, del PDF y
del PPT de todo estudio con un AT mayor o igual que el ET—, así que lo decide Maicol.

## P18-d · [CERRADO 2026-11-08 · PANT24-2] Una TAVI normal no recibe el renglón de «prótesis normofuncionante» y una quirúrgica sí

La guarda `P.via === 'TAVI'` de `_protNormofuncionante` **se conserva**: lo que esta tanda autoriza
a mover del papel es la **frase de severidad**, y ese renglón es otra línea.

⚠️ **Y esa guarda dejó de ser redundante.** Su comentario decía que «con TAVI el veredicto no trae
`nivel`, así que la guarda de abajo ya la caza»; desde el commit 6 **sí** lo trae, así que hoy esa
línea es la única que lo impide. El comentario quedó corregido en el código.

**Qué habría que hacer:** retirar la guarda, que es una línea. **Mueve el papel** de toda TAVI con
el veredicto en «sin criterios».

## Los dos de arriba, cerrados por la tanda PANT-24 (2026-11-08)

**P18-b** lo cierra el commit 3 exactamente como su propio texto lo anticipaba: la guarda se movio
de `_eaAtEtVal` a `eaProtVeredicto`, que es una linea, y el papel se movio -el parentesis de
medidas del informe, del EN SUMA, del PDF y del PPT de todo estudio con un AT mayor o igual que el
ET deja de publicar el cociente-. Lo decidio Maicol el 08/11/2026 y es una de las DOS diferencias
de papel que esa tanda tenia autorizadas. Y se hizo con el LECTOR del dueno de la fila, no
repitiendo la guarda: hoy el cociente tiene un solo dueno. Lo fija **TC-758**, con sus siete
bordes -el 1,67, el 1 EXACTO, el 0,99, el 0,50, el 0,37, el 0,32 y una protesis quirurgica con los
mismos valores-, y la fila publica «Revisar los valores» en vez de la raya, que es lo que
distingue «es imposible» de «falta un dato».

**P18-d** lo cierra el commit 2, y por el camino que la decision del medico eligio, que NO es el
que este texto proponia. La guarda `P.via === 'TAVI'` de `_protNormofuncionante` **SE CONSERVA**:
retirarla afirmaria «normofuncionante» tambien sobre una TAVI con el veredicto en «sin criterios»,
que es otra escena. En su lugar, el bloque del informe emite el renglon cuando la TAVI no tiene UN
SOLO dato que indique estenosis o insuficiencia protesica, y el bloque del final se apaga solo
porque «TAVI» ya era un token de `yaDicho` de esa valvula. Asi la asimetria desaparece en la
escena que el medico reporto -una TAVI sin datos- sin tocar la que no autorizo. Lo fijan
**TC-757** y **TC-303**, que es el que aisla la guarda.

⚠️ **Y el commit 2 encontro una TERCERA fuente de insuficiencia protesica que ninguno de los dos
textos nombraba**: la regurgitacion PARAVALVULAR del modulo TAVI, `eteTaviRPV()`, que no pasa por
`ia_grado` ni por el escalon sin grado. La encontro **TC-289** al ponerse rojo, no la lectura.
