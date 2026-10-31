# EcoSmart — pendientes vivos


## Tanda J · pericardio, constricción y VEXUS (2026-10-24) — DECLARADO y NO arreglado

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

### J-c · El corte de 3 mm del engrosamiento pericárdico no tiene fuente verificada

El selector `cvr_pericardio_tc` ofrece «>3 mm — engrosado», y ese número **no figura** en el texto
de la ESC 2025 que se leyó. Queda con el chip «Criterio de EcoSmart» en la ficha de Referencias y
declarado en el ⓘ de su fila de la Evidencia, **sin corchete**. **Decidir:** conseguir la fuente o
dejarlo como criterio propio.

### J-d · Las reglas de conteo de constricción siguen sin fuente

Cuántos criterios hacen falta de cada lado, y cuáles cuentan, es una regla propia: ninguna guía de
la biblioteca publica un recuento así — la ESC razona por el algoritmo de la Figura S1. Esta orden
las excluía expresamente, así que **no se tocaron** y hoy se **declaran** con el chip en la
pantalla, en la ficha y en la Evidencia. **Decidir:** si el módulo debería seguir el algoritmo de
la Figura S1 en vez de contar.

### J-e · Las filas de TRATAMIENTO de la Recommendation Table 24 no se publican

La Tabla 24 trae, además de las dos filas de diagnóstico que la Evidencia sí publica,
antiinflamatorios en la constricción transitoria con inflamación concomitante y pericardiectomía
en la constricción permanente, **las dos Clase I · Nivel C** (folio 64). No se escribieron porque
la aplicación **no registra** inflamación pericárdica ni respuesta al tratamiento: serían filas
que ningún dato del estudio puede encender ni apagar. **Decidir:** si se agregan como preguntas al
médico, como se hizo con el cateterismo.

### J-f · Los dos campos nuevos no viajan al Excel, y su reimportación los pierde

`dpt_col_ad_dur` —la duración del colapso auricular derecho— y `cvr_hep_coc` —el cociente de la
vena suprahepática— son campos del estudio: se guardan, sobreviven a «Nuevo estudio» y vuelven al
reabrir, **verificado**. Pero **no tienen columna de Excel**, porque la orden pedía que el Excel
quedara idéntico en 440 columnas. Es el mismo caso que `wilkins_delib`, `pericardio_hemo` y los
otros cuatro que esta lista ya declara: una exportación y reimportación los pierde.
**Decidir:** si entran al Excel en una tanda que lo autorice.

### J-g · «VEXUS 2» sobre estudios guardados con la vena cava en 20,0 mm exactos

El grado **no se persiste**: se recalcula desde los cuatro datos crudos. Así que un estudio viejo
con la vena cava en 20,0 mm exactos y uno o dos vasos severos abre hoy mostrando **VEXUS 1** donde
antes mostraba 2 o 3. Es el alineamiento al artículo que esta orden pide, y no se migró nada
—no hay nada que migrar—. Queda **declarado**: el informe firmado de ese estudio, si se guardó con
su texto, sigue diciendo lo que decía; lo que cambia es lo que la pantalla y un informe
regenerado muestran.


## Tanda R · referencias y fuentes (2026-10-20) — DECLARADO y NO arreglado

### R-1 · El diámetro AP de la AI sigue sin graduar, y es de la fuente

El **área** pasa a graduar en cuatro con la Tabla 9 de Lang 2005 y el **volumen indexado** sigue
mandando, pero el **diámetro AP** sigue siendo binario («dilatada» / «de dimensiones normales»).
No es un olvido: **ninguna guía de la biblioteca lo gradúa** — el corte por sexo que la app
aplica contesta sí o no, y la Tabla 9 publica su rango de normalidad sin bandas de severidad.
Censado antes de decidir. Graduarlo sería inventar una escala.

**Consecuencia medida:** con el diámetro como único dato el informe dice «Aurícula izquierda
dilatada (diámetro AP 50 mm).» sin adjetivo, y con el área cargada la oración sí gradúa. Las dos
conductas conviven a propósito y TC-294 las fija por los dos lados.

---

### R-2 · El rango con guión de la disfunción del VD no tiene fuente que lo nombre

Con el TAPSE en una banda y la onda S′ en otra, `vdDisfGrado` publica **«leve-moderada»**. La
Tabla 1 de la ASE 2025 da las bandas de cada parámetro por separado y **no dice qué hacer cuando
discrepan**: el rango es una decisión de la app, conservadora —no elige el peor ni el mejor—, y
está declarada acá. Lo que la app NO hace es inventar un grado único.

**Alternativas, si alguna vez se decide:** (a) publicar el PEOR de los dos, que es lo que la app
hace con el tamaño del VD; (b) dejar el rango, que es lo de hoy; (c) no graduar cuando discrepan.

---

### R-3 · Los tres cortes del taponamiento son el límite INFERIOR de los rangos de la guía

La app marca plétora con diámetro **>21 mm** y colapso **<50 %**, y la variación respiratoria con
**>25 %** en la onda E mitral y **>40 %** en la tricuspídea. La **Tabla 17 de la ESC 2025**
publica **>20 mm con reducción <50 %** y **rangos** de >25-30 % y >40-60 %. O sea que **la app
afirma antes que la guía**. Los tres se mantienen con su valor —cambiarlos es contenido clínico—
y desde el R6 se **declaran** con el chip «CRITERIO DE ECOSMART» debajo del módulo.

---

### R-4 · El corte de 5 burbujas no está publicado en ninguna de las dos fuentes

**SIGUE ABIERTO, y el trabajo D lo midió otra vez.** La tabla de la ficha separa el shunt pequeño
del moderado en **5 burbujas**, y ni Pristipino 2019 (suplemento, Tabla 1) ni Kleindorfer AHA/ASA
2021 (folio e413) lo publican: las dos fijan el **20** del shunt grande y nada más. El 5 queda como
referencia propia, declarada con el chip «CRITERIO DE ECOSMART» en las **dos** fichas que lo citan
—la del test de burbuja y la del FOP, que el D-E3 agregó—.

⚠️ **LAS DOS FUENTES NO COINCIDEN SOBRE CÓMO EL RESPECT DEFINIÓ EL SHUNT GRANDE, Y EL D LOCALIZÓ
LOS DOS TEXTOS**: Kleindorfer escribe «larger shunt size (>20 microbubbles)» en el **folio e413**
(hoja 50) y Pristipino, describiendo el MISMO ensayo, «more than 10 microbubbles» en su **apéndice
suplementario 4** (hoja 35, sin folio de revista). Por eso el panel de Evidencia del D-E4
**PREGUNTA** si el shunt es grande en vez de deducirlo de la escala de la app: con dos definiciones
del mismo corte, derivarlo sería elegir una y no decirlo. En `docs/fuentes/FUENTES.md` → «El
trabajo D».

---

### R-5 · El informe no dice la severidad de la disfunción del VD cuando un parámetro está normal

`vdDisfGrado` devuelve `null` si **alguno** de los dos parámetros medidos cae en la banda normal,
así que la oración sale como hasta hoy, sin adjetivo. Es el lado conservador —con el TAPSE
conservado no se puede afirmar un grado de disfunción global— y deja sin graduar el caso del
parámetro único alterado. **Decisión de la app, no de la guía.**

---

### R-6 · Dos mapas quedaron a 3 KB del techo

Medido con `wc -c` **al cerrar**: `mitral-dibujo-estatico.md` en **31,9 KB** y `vd-derecho.md` en
**31,5 KB**, los dos con su puntero de la tanda R ya adentro. **La próxima tanda que los toque
conviene que mida antes de escribir**, y si el bloque pasa de ~3 KB, que lo saque a archivo
propio. El de esta tanda nació aparte (`tanda-r-referencias.md`, 13,3 KB) justamente por eso.

---

### R-7 · El EN SUMA del área de la AI y el informe tenían dos redacciones, y lo destapó la suite

Está **arreglado** en esta misma tanda y queda escrito porque la causa vuelve: la línea del
resumen (`suma.push`) no consultaba el clasificador que la oración del informe ya usaba, así que
las dos superficies firmadas del mismo papel decían cosas distintas del mismo número. **Ninguna
medición de zona lo vio** —mis escenas leían el informe y no el resumen— y lo cazó la SUITE
COMPLETA, en TC-487 (6). **Al tocar una frase del informe, medir también su EN SUMA.**





## Tanda Y3c · el dibujo estático de la mitral, el plano de corte y las medidas TEER (2026-10-18) — DECLARADO y NO arreglado

### Y3c-1 · La tabla del 3D y la del dibujo DIVERGEN en dos filas

`ETE_CORTES` (el dibujo, los cuatro esquemas y la línea del plano) y `M3D_VIS` (el 3D) contestan la
misma pregunta —qué festones corta el plano en cada ángulo— y **no dicen lo mismo**:

| ángulo | `ETE_CORTES` | `M3D_VIS` |
|---|---|---|
| 0°   | P1 · P2 · A2 · A3      | A2 · A3 · P1 · P2 ✓ |
| 45°  | P1 · P2 · A2 · A3 · P3 | **P3 · A2 · P1** ✗ |
| 60°  | P1 · A2 · P3           | P3 · A2 · P1 ✓ |
| 90°  | A1 · A2 · P2 · P3      | **P3 · A1 · A2 · A3** ✗ |
| 120° | P2 · A2                | A2 · P2 ✓ |

**No se tocó `M3D_VIS` porque la orden de esta tanda lo prohíbe expresamente** («el 3D de la mitral
NO cambia… ni su cuenta del plano»). Unificarlas cambia **qué festones se ven** en el modelo 3D en
esos dos ángulos, que es contenido de pantalla y decisión de Maicol. Es exactamente el defecto que
esta tanda vino a cerrar en los cuatro esquemas, por la otra puerta.

### Y3c-2 · Tocar dos veces el mismo ángulo deja el botón del 3D marcado y el dibujo sin línea

`m3dAngulo` **no togglea** —hace `_m3dAng = a` siempre—, así que el dibujo lleva su propio toggle
para poder cumplir «al volver a tocar el mismo ángulo la línea desaparece» sin tocar el 3D. El
precio: en ese estado el botón del 3D sigue marcado. Las dos salidas son hacer que `m3dAngulo`
togglee —cambia el 3D— o que el dibujo no toggle —cambia lo que la orden pide—.

### Y3c-3 · El dibujo IMPRESO se achica

La caja del PDF pasa de 120 × 66,9 mm a 100 × 100 mm, pero el lienzo nuevo tiene el **aire que el
dibujo necesita para girar en pantalla**: el modelo ocupa un 57 % del ancho del lienzo, así que
mide unos **57 mm** impresos contra los **76** del dibujo viejo. Recortar el lienzo del canvas al
contenido dejaría las cuatro marcas pegadas al borde; subir la caja a 120 mm dejaría el bloque en
120 mm de alto (+53 contra los 67 de hoy).

### Y3c-4 · ETT y transgástrica van sin letras de festón

Ninguna fuente de la biblioteca publica de qué lado quedan las comisuras en el eje corto
paraesternal mitral ni en la transgástrica basal (censo en `docs/fuentes/FUENTES.md` → «La tanda
Y3c»). Las dos vistas se muestran igual pero **sin letras**. El día que aparezca la fuente, lo
único que hay que cambiar es el campo `letras` de `ETE_QX_VISTAS`.

### Y3c-5 · El bloque del dibujo pasa de 500 × 279 px a 420 × 420

El dibujo de la demo es cuadrado y no se reescaló ningún número, así que la pestaña ETE crece en
alto. A 1200 y 768 px mide 420 × 420; a 390 px, 328 × 328; a 360 px, 298 × 298. Cero scroll
horizontal en las ocho celdas medidas.

### Y3c-6 · Los cortes de TEER, y el campo del flail gap que nadie lee

**Reportado y NO tocado** (son contenido clínico). El detalle, con la tabla completa, está en
`docs/fuentes/FUENTES.md` → «Los cortes de TEER que la app aplica hoy». Los tres puntos:
1. **`teer_flail_gap` no lo lee ningún veredicto.** El campo que **sí** es el flail gap no vota; el
   que vota contra `<= 10` es `teer_gap`, rotulado «Longitud coaptación» con la ayuda «Req: >2mm».
   Es un defecto **preexistente** que el propio código ya declara.
2. **La anchura de flail diverge en el valor exacto**: el código cumple con `<= 15` y la ayuda dice
   «Excl: ≥15mm».
3. **Las definiciones de EVEREST II y del protocolo EXPAND no están en la biblioteca**, así que los
   cuatro dibujos muestran lo que se mide **sin línea de fuente**.

### Y3c-7 · El valor del dibujo TEER achica el campo a 1200 px

Con la imagen al lado, el `<input>` pasa de unos 238 px a **138 px** a 1200 px de ventana. Sigue
siendo cómodo para un número de dos dígitos y a 768 px y por debajo la imagen baja y el campo
recupera su ancho entero. Si 138 px resulta poco, la alternativa mínima es bajar la imagen también
en escritorio o achicarla a 72 px.

### Y3c-10 · No existe un «bull's eye quirúrgico» de la mitral, y hay que decirlo

La orden pide que el ciclo de lesiones se refleje «en los cuatro esquemas de ETE, el dibujo
estático, el 3D y el bull's eye quirúrgico». **Censado: ese bull's eye no existe en la app.** El
único bull's eye es el de **Contractilidad** (17 segmentos del VI), que no tiene nada que ver con
la mitral y que esta orden prohíbe tocar. Lo que más se le parece es la proyección **transgástrica
de `ETE_PROYECCIONES`**, que dibuja los seis festones en eje corto — pero **ese módulo entero es
código legado que no se renderiza en ninguna parte**: `eteProy = ETE_PROYECCIONES[0]` se asigna y
nunca se pinta, y su manejador `eteClickSeg` tiene su **propio estado** (`eteEstado`), desconectado
del módulo vivo. TC-485 lo usa sólo como control negativo, leyendo el fuente y no el DOM.

**Lo que sí está sincronizado, y medido:** dibujo estático → cuatro esquemas de proyección →
espejo del estudio (`ete_seg_*`) → **3D**, que lee esos mismos espejos. Son un solo estado.

### Y3c-9 · La segunda corrida de la suite se midió SIN el pendrive

El `DISK_IMG` **se desconectó físicamente** entre las dos corridas completas —verificado con
`diskutil list`: el volumen ya no existe, no es que se desmontó—, así que la corrida de cierre
sale con los **diecisiete** de **TC-181…TC-197** en rojo por ENTORNO. **No se restan las dos
cifras**: la primera, **con el pendrive montado**, dio **510/517** y sus siete rojos están
explicados uno por uno en `CLAUDE.md`; los dos que eran trabajo pendiente se adaptaron y los tres
casos de la zona dan 3/3 ✓. Cuando el pendrive vuelva, conviene medir la suite entera de un tirón
para dejar la cifra limpia.

### Y3c-8 · El celeste `#1BA3B8` es un literal y no una variable del tema

Lo fija la orden («LO QUE SE MIDE va en celeste #1BA3B8») y es lo que lo separa de los seis colores
de lesión. Su contraste contra el fondo claro (#ffffff) es bajo para texto chico; contra el oscuro
(#181c27) es cómodo. Los trazos del corazón sí van con `var(--text)` y `var(--text2)`, medidos
reales y distintos en los dos temas.

## Tanda Y3 · el 3D de la mitral en ETE y la fila de la Vmax (2026-10-16) — DECLARADO y NO arreglado

> Lo implementado está en `docs/mapa/mitral-3d-ete.md`. Acá queda lo que la tanda **no** hizo.

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

### ⏸️ Y3-7 · PARADA — las DOS calculadoras del Wilkins no se unificaron (estado del 2026-10-16, cerrado)

La orden pedía UN solo cálculo para las dos pantallas y añade: «Si las dos discrepan hoy en un
corte, un rango o un texto, NO elijas: PARADA de esta sub-parte». **Discrepan.**

**Los cortes son idénticos** (≤8 favorable · 9-11 «El score no predice el resultado» · >11 no
favorable) y los totales también: `calcWilkins` ya consume `wilkinsScore()` y las dos comparten la
constante `WILK_9_11`. Lo que no coincide es lo que cada pantalla **publica**.

| entradas | ETE (`wilkins-total` / `wilkins-interp`) | Calculadoras (`cx-wilkins-total`) |
|---|---|---|
| 1/1/1/1 | `4 / 16` · «Score 4 — **Favorable** para valvuloplastia percutánea» | «**sin puntuar** — reingresá los cuatro criterios» |
| 2/2/2/2 (8) | «Score 8 — Favorable para valvuloplastia percutánea» | «8/16 favorable para valvuloplastia percutánea» |
| 3/2/2/2 (9) | «Score 9 — El score no predice el resultado» | «9/16 El score no predice el resultado» |
| 3/3/3/2 (11) | ídem, 11 | ídem, 11 |
| 3/3/3/3 (12) | «Score 12 — **No favorable** para valvuloplastia» | «12/16 **desfavorable** para valvuloplastia» |
| 4/4/4/4 (16) | ídem, 16 | ídem, 16 |
| parcial, 3 de 4 | `6 / 16 (parcial)` · «Score incompleto — 3 de 4 criterios puntuados. No se interpreta: faltan criterios y el total quedaría sesgado a favorable.» | «6/16 parcial — 3 de 4 criterios; sin interpretación» |
| sin puntuar | «—» | «—» |

**Las tres discrepancias:**

1. ⚠️ **LA MÁS GRAVE ES DE RANGO Y NO DE REDACCIÓN:** con los cuatro criterios en «1» una pantalla
   publica un **veredicto** y la otra se niega a puntuar. Calculadoras tiene una regla extra que
   ETE no tiene, y su comentario explica por qué existe: la primera opción de esos cuatro selects
   era `value="1"` y `guardarInforme` persiste todo select por id, así que **todo estudio guardado
   antes de ese cambio lleva 1/1/1/1** haya abierto alguien la tarjeta o no — al reimprimirlo salía
   «4/16, favorable para valvuloplastia percutánea» sin que nadie lo hubiera escrito.
2. El texto de la banda >11: «**No favorable** para valvuloplastia» contra «**desfavorable** para
   valvuloplastia».
3. El texto del parcial: el de ETE nombra el sesgo hacia favorable y el otro no.

**Y una cuarta, de dominio:** el centinela de «sin puntuar» es el valor `"0"` en los selects de ETE
y la cadena vacía en los de Calculadoras. Es lo que hace alcanzable la discrepancia 1.

**Qué hace falta para cerrarla — tres decisiones de Maicol:**
(a) cuál de las dos frases de la banda >11 se publica en las **dos** pantallas;
(b) cuál texto de parcial;
(c) si la regla del legado 1/1/1/1 vale para las dos o para ninguna.
⚠️ **No hay opción neutra:** o ETE adopta esa regla —y entonces un 4/16 **real** deja de
interpretarse— o Calculadoras la pierde —y vuelve el veredicto fabricado sobre los estudios
legados—. Las dos cambian una interpretación publicada.
Con esas tres decididas la unificación es mecánica: `wilkinsScore()` ya existe como dueño del
puntaje y los cortes ya coinciden.

**Y no hay 3D del Wilkins**, que la orden excluía explícitamente.

### Y3-1 · No hay captura del 3D al PDF ni al PPT

«Incluir en PDF» (`eteQxIncluirPDF`) sigue incluyendo **sólo** la vista quirúrgica, como hasta hoy.
La orden lo dejaba para después. Si alguna vez entra: el lienzo es un `<canvas>`, así que
`toDataURL()` alcanza, y el precedente es `eteQxDataURL()` —supermuestreo 2× sobre base blanca—.
⚠️ **El dibujo depende de la FASE del ciclo**, así que habría que decidir en qué fase se captura:
la sístole muestra el chorro de la IM y la diástole el orificio de la estenosis. Capturar «la que
estaba» haría que dos PDF del mismo estudio salieran distintos.

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

### Y3-3 · No se pudo verificar en Safari / WebKit

El médico usa Safari y la verificación corrió en **Chrome**. El dibujo es **canvas 2D** —sin
WebGL, sin API de Chrome—, y el CSS del panel usa sólo propiedades con soporte universal (se evitó
a propósito animar `grid-template-columns`, que pide Safari 16+). Aun así, **no está medido en
WebKit**: ver el intento de instalar Playwright/WebKit en el reporte de la tanda.

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

### Y3-5 · Lo que la demo no trae y NO se agregó

La orden decía: «Si la demo no trae alguno de estos elementos, NO lo agregues en este commit:
reportalo». La demo trae **todos** los elementos que la orden enumera —lesiones por festón con
separación entre valvas, chorro con cuello, aurícula que se agranda, orificio con valvas
engrosadas y doming, siglas, valvas aórticas y orejuela con humo—, así que no quedó ninguno sin
dibujar. Lo único que **no** salió de la demo es la **orientación** de AL y PM, que allá ya era
correcta y en la app 2D estaba invertida.

### Y3-6 · La proyección transgástrica de ETE

`ETE_PROYECCIONES` → `tg` («TG — eje corto») tiene AL a la izquierda junto a A1/P1 y PM a la
derecha junto a A3/P3: **su par de rótulos es internamente coherente**, así que la tanda Y3-1 no lo
tocó. Queda abierta otra pregunta, que es sobre el **dibujo** y no sobre los rótulos: una
transgástrica de eje corto se mira desde el ápex, o sea desde el lado contrario a la vista del
cirujano, así que podría corresponderle estar espejada entera. Esta orden prohíbe mover el dibujo.

---

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

### [REVISADO 2026-10-15 · Z · PARADA CONFIRMADA] Z1 · Los tres parámetros nuevos de la Tabla 11 NO votan en el veredicto de obstrucción
`R.obstr` de `vmProtEOA` sigue saliendo del **AEO y del DVI**, como desde la Fase 2. La velocidad
pico de E, el gradiente medio y el THP se publican en la cápsula con su banda y **no entran**.
Sumarlos cambiaría qué escenas publican «Prótesis mitral con hallazgos sugestivos de obstrucción
(…)» en el **informe FIRMADO**, y **qué parámetros votan es contenido clínico**. Medido y fijado
por TC-474: los tres pueden estar en «significativa» a la vez y el veredicto sigue en nulo.
La nota `*` de la Tabla 11 dice que la exactitud diagnóstica es mejor cuando **la mayoría** de los
parámetros son normales o anormales a la vez, así que una regla de mayoría es la candidata obvia
— pero es una regla de integración nueva y la decide Maicol.

### [CERRADO 2026-10-15 · Z] Z2 · El PPM AÓRTICO no entra en el informe firmado, y el MITRAL sí
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
> ⚠️ **SIGUE ABIERTO al 2026-10-17.** La tanda VAL tocó el TECHO de la banda moderada del AVA
> (1,5 inclusive) y no la banda leve, que es lo que esta entrada declara.


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

> **Línea base de CIERRE, medida el 2026-10-15 con el pendrive `DISK_IMG` MONTADO:**
> **suite 487/491**, **Semgrep 127 / 0 ERROR**, **Excel en 438 columnas**, **celular 43 a 360 px
> y 52 a 390 px con 1 ALTA cada uno** (y `--todo` en **375/384**, el mismo par que dejó el G1).
> **CERO REGRESIONES**: los cuatro rojos son exactamente los de entrada —**TC-223**, **TC-376**,
> **TC-390** y **TC-406**— y no apareció ninguno fuera de esa lista. `md5` de `index.html`
> `4d95fd14…`, idéntico al empezar y al terminar; sello `v20261015-1336`.
>
> ⚠️ **Se midió en una segunda sesión**: al cerrar la tanda el pendrive se había desmontado y la
> corrida se detuvo antes de empezar, como manda la regla — con él afuera habrían caído además
> los diecisiete de TC-181…TC-197, que son ENTORNO, y restar esas dos cifras daría una
> «regresión» de 17 casos que no existe. Se remidió sobre el MISMO árbol, sin tocar nada.

### G2-1 · La banda del diámetro de la AP no entró en `LAB_XLS_RANGO_PROPIO`

`G1-10` preveía meterla ahí al darle columna. **No se hizo, a propósito**: `IP_AP_BANDA` ya es su
dueño único y un segundo lugar con los mismos dos números (`[5, 80]` mm) es la clase de copia que
se separa en cuanto alguien afine uno. Consecuencia **medida**: el importador acepta un valor
fuera de banda —no lo rechaza por rango— y la app lo marca «(revisar)» al abrirlo, que es lo que
ya hacía al tipearlo. Si se decide que el importador lo rechace, la entrada va en
`LAB_XLS_RANGO_PROPIO` **leyendo `IP_AP_BANDA` por referencia**, nunca repitiendo los números —
el patrón que `_labRangoValor` usa con `_DIAST_STRAIN_ABS_MARCA` desde el 2026-10-12.

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

---

## La tanda «G3» (2026-10-15) — lo declarado y NO tocado

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

### G3-2 · El selector de VD/VI no tiene columna de Excel

El NÚMERO sigue viajando por la suya; **la elección manual no viaja**. Un estudio cuya relación
VD/VI se consignó sólo por tramo exporta esa columna vacía, así que la cohorte del Laboratorio
—que lee el Excel por nombre de encabezado— no la ve. **Sí** viaja con el estudio guardado, así
que la pantalla, la probabilidad de HTP, el PDF y el PPT la leen. Agregarla es una PARADA de
columna (439) y la orden del G3 la prohíbe.

### G3-3 · El n por fila no entró en la tabla de válvulas del PPT

Su tabla no lo lleva en ninguna de las ocho lesiones y agregarlo cambiaría también las SEIS que
esta orden congela. El n del grupo sigue en el pie, y las bases por válvula pueden diferir entre
filas —la tricúspide binaria cuenta 6 donde `counts` cuenta 3—. En el PDF de auditoría la fila
**ya** lo llevaba. Unificarlo es un trabajo del PPT entero, no de las dos binarias.

### G3-4 · El origen de 93 columnas calculadas está nombrado sólo en parte

`LAB_XLS_CALC_ORIGEN` nombra el origen de las que se pueden nombrar **con certeza** —el cociente,
la PSAP, la PmAD, el gradiente VD-AD, la FAC, la masa, el RWT, la geometría, los cocientes
diastólicos, las áreas valvulares, el Qp/Qs y una docena más— y las familias de indicadoras van
por prefijo. **Lo que no está no se inventa**: cae al texto común «se recalcula desde las
mediciones que la alimentan», que sigue siendo verdadero. Las que hoy quedan ahí son sobre todo
los bloques `DPT `/`CVR ` ya cubiertos por prefijo y las cinco de arritmia ventricular
(`MCH TVNS en Holter`, `TdF taquicardia ventricular`, las tres `MCA`). Nombrarlas pide leer el
`tvSync` que las espeja.

### G3-5 · El mapa del VD quedó a 600 bytes del techo

`docs/mapa/vd-derecho.md` cerró el G3 en **34,4 KB** sobre un techo de 35. La sección del
selector ya salió a archivo propio (`docs/mapa/vd-vi-selector.md`, 8,7 KB) justamente por eso.
**La próxima tanda que lo toque tiene que partirlo**, midiendo con `wc -c` ANTES de escribir —la
regla que `valvulas.md` aprendió pagándola dos veces.

### G3-6 · El PPT clínico no se genera en la sonda del G3

`generarPPT(id)` exige un estudio GUARDADO, un informe narrativo ya escrito y DOS modales
encadenados —tema y presentador—, así que medirlo de verdad es automatizar esa cadena entera. La
fila «VD/VI» del PPT se mide **por el fuente** —que llame a `vdViTexto`— y el valor por el dueño,
que sí se mide con teclas reales; la del PDF se genera de verdad. El PPT **estadístico** del
Laboratorio sí se genera de verdad, porque su generador (`_labPPTGenerar`) toma la población
directo.

---

## Tanda «Z» (2026-10-15) — DECLARADO y NO arreglado

> El PPM aórtico al informe, la columna de la velocidad de la IT y la ida y vuelta del TAPSE/PSAP,
> el borrado de la estenosis aórtica con sus cinco filas graduadas, y la fila y la tarjeta del
> cociente. Los mapas: `docs/mapa/excel-origen-ida-vuelta.md` (**nuevo**),
> `docs/mapa/tapse-psap-ap.md`, `docs/mapa/aortica-cortes.md` y `docs/mapa/protesis-valvular.md`.
> Las fuentes: `docs/fuentes/FUENTES.md` → «La tanda Z — el cociente TAPSE/PSAP, uso por uso».

### [CERRADA 2026-10-15 · Z5 — con una regla que es de MAICOL y no de la guía] Z1 · PARADA · La ASE 2024 NO da una regla de integración para la estenosis protésica mitral

**Qué pedía la orden:** que la velocidad pico de E, el gradiente medio y el THP **voten** el
veredicto de obstrucción **si la guía lo respalda**, implementando la regla **exactamente**; y que
si no hay regla explícita, **no se invente una**.

**Lo que la guía da, leído en el PDF (`Zoghbi_2024_Protesis.pdf`, folio = página + 1):**

1. **Tabla 11, folio 27** — «Doppler findings suggestive of prosthetic mitral valve stenosis»,
   **cinco** parámetros con tres bandas cada uno (normal / possible stenosis / suggests significant
   stenosis). **Leída renderizando a 400 dpi**, porque la fuente del PDF codifica `≥` como `$` y
   `≤` como `#`. La app ya aplica esas cinco bandas y publica las tres nuevas en la cápsula.
2. **Su nota `*`** — «For either mechanical or bioprosthetic valves; **diagnostic accuracy is best
   if most of the parameters listed are normal or abnormal, respectively**.» Es una afirmación
   sobre la **confianza diagnóstica**: no define un umbral de conteo, no dice cuántos hacen falta
   y **no dice qué hacer cuando los parámetros se contradicen**.
3. **Folio 24, prosa** — «The main criteria for the diagnosis of significant mitral stenosis are a
   mean gradient >10 mm Hg at a normal heart rate, a PHT >200 msec, a DVI >2.5, and an EOA <1
   cm2.» Enumera **cuáles** son los criterios principales; **no dice cuántos** tienen que
   cumplirse. Y **omite la velocidad pico**, que la Tabla 11 sí incluye.
4. **No hay figura de algoritmo** para la estenosis protésica mitral. Las tres que existen son la
   **Figura 13** (evaluación inicial de la velocidad pico AÓRTICA), la **16** (severidad de la
   insuficiencia aórtica protésica) y la **21** (severidad de la insuficiencia **mitral**
   protésica). Censadas las 27 figuras del documento.
5. **Los «Key Points for Assessing Prosthetic Mitral Valves» (folio 29)** enumeran qué medir y
   reportar; **ninguno** da una regla de combinación. Tampoco los de PHV ni los generales.

**Conclusión: la guía NO da una regla de integración.** Convertir «most of the parameters» en un
«≥ 3 de 5» es inventar un umbral que el documento no publica, y es contenido clínico. **El
veredicto `R.obstr` queda como estaba** —del AEO y del DVI, el peor— y TC-474 lo sigue fijando.

⚠️ **Y HAY UNA SEGUNDA RAZÓN, QUE LA LECTURA DESTAPÓ Y QUE AGRAVA LA PRIMERA.** La **nota `‡`** de
la misma Tabla 11 marca que la velocidad pico, el gradiente medio **y el DVI** «are also abnormal
in the presence of significant prosthetic MR». La app **ya gatea el DVI** con
`emContMotivoNoVota` por exactamente eso (la colisión de las Tablas 11 y 13, que el W2-B
documentó). Hacer votar al gradiente y a la velocidad **sin decidir si se los gatea igual**
reabriría el defecto que ese gate cerró — y esa decisión tampoco está en la guía.

**Qué habría que hacer:** que Maicol fije la regla de integración —por ejemplo «significativa si
≥ N de los cinco caen en la columna de significativa, con los tres marcados `‡` retirados cuando
hay regurgitación protésica significativa»— y entonces sí implementarla, como criterio **EcoSmart**
declarado y no como criterio de la ASE 2024.

### [CERRADA 2026-10-15 · Z5, opción (b)] Z2-1 · La línea del PPM aórtico dice «aórtico» y la del mitral no nombra su válvula

El mitral publica «Desajuste protésico-paciente severo (AEO indexada 0,79 cm²/m²)» desde la Fase 2
y el aórtico, desde el Z, «Desajuste protésico-paciente **aórtico** severo (…)». La asimetría es
deliberada: con las **dos** prótesis desajustadas el EN SUMA publicaría **dos oraciones idénticas
que sólo se distinguen por el número**. El adjetivo es lo mínimo que las separa.
**Las dos salidas, para que las decida Maicol:** (a) dejarlo así; (b) agregarle «mitral» a la línea
del mitral, que es un texto del informe firmado y esta orden no lo autorizaba.

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

### [CERRADA 2026-10-15 · Z5, salida (a)] Z3-2 · PARADA · El DVI no se calcula sin el diámetro del TSVI, y matemáticamente no lo necesita

El médico lo reportó: con VTI TSVI 20 y VTI Ao 56 **sin** diámetro, el campo del DVI queda sin
resultado. **El cociente es `VTI TSVI / VTI Ao` y no usa el diámetro.**

**Por qué no calcula, medido:** el bloque que escribe las filas del cuadro —y los dos `input
readonly` `ea_ava_display` y `ea_dvi_display`— vive dentro de `if (itsvi && itvao && dtsvi)` en
`_eaDetCuentaPura`, porque comparte el `if` con el AVA por continuidad, que **sí** necesita el
diámetro. El **criterio** no tiene ese problema: `_eaCritDvi()` lee `itv_tsvi` e `itv_ao` y **ya
vota sin el diámetro** — por eso borrando sólo el Ø TSVI la línea dice «Moderada — por DVI» con la
fila del DVI en «—», que es el síntoma 2 del reporte, visto por el otro lado.

**NO SE CAMBIÓ, y es PARADA**: `ea_dvi_display` es un `input[id]`, así que `guardarInforme` lo
barre y viaja en `campos`, y es además **la primera fuente que lee `eaProtVeredicto`** con
`parseFloat`. Despegarlo del diámetro cambia qué número lee el veredicto protésico aórtico en los
estudios donde hoy queda vacío — o sea cambia cuándo vota.
**Las dos salidas:** (a) sacar el DVI de ese `if` y darle el suyo (`itsvi && itvao`), aceptando que
el veredicto protésico empiece a leerlo en más escenas; (b) dejar el campo y pintar **sólo la
fila** `ea-det-dvi` desde `_eaCritDvi`, que no toca ningún `input` ni ninguna fuente del veredicto
— **es la conservadora** y la que este archivo marcaría si tuviera que elegir.

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

### Z4-1 · La serie de embolia pulmonar quedó verificada y sin usar

**Lyhne MD y col., Eur Heart J Acute Cardiovasc Care 2024;13:817-825**, registro RIETE, 4.478
pacientes: TAPSE/PASP **< 0,44**, y **< 0,34** en los de riesgo intermedio-alto (aOR 4,37; IC 95 %
1,27-15,0), asociados a mortalidad a 30 días. **Está en la biblioteca y se leyó en texto completo.**
Decisión de Maicol: **no entra en la tarjeta**. Queda en `FUENTES.md` como fuente disponible y no
usada, para que la próxima tanda no la vuelva a buscar ni crea que falta.

### Z4-2 · Las otras tres superficies del cociente siguen con sus propios cortes

`_htp2022Core` (`< 0,55`, categoría C), `cxTP` (`> 0,36` · `0,19-0,36` · `< 0,19`, con campos de
sobreescritura propios) y `calcTEP` (`> 0,32`) **no** leen la fila nueva. Las dos primeras ya
estaban declaradas en **G1-8** y **G1-9** y no cambian; lo que cambia es que la fila del Doppler
tricuspídeo ya **no** usa el 0,36, así que hoy `cxTP` es el **único** lugar de la app que lo
aplica — y ahí sale de otra fuente y con otro significado.

### Z5 · «ET grado» cae en el bloque «18 · OTRAS COLUMNAS» del Excel

Medido de paso: `_labXlsBloqueDe('ET grado')` devuelve el bloque 18, a 250 columnas de las otras
cuatro de la estenosis tricuspídea, que sí están declaradas (`ET grad medio`, `ET THP`,
`ET VTI diast`, `ET área`). **Es PREEXISTENTE** y no lo trae esta tanda; se arregla agregando
`'ET grado'` a los nombres del bloque 8, que es una línea, y `_labXlsAssertBloques` lo verificaría.
No se tocó porque mueve la posición de una columna que esta orden no nombra.

---

## Tanda «Z5» (2026-10-15) — declarado y NO corregido

> El voto de los cuatro criterios de la prótesis mitral, el DVI aórtico sin el diámetro, la fila y
> las frases del PPM y el renglón integrado de la estenosis aórtica. Los mapas:
> `docs/mapa/protesis-valvular.md` y `docs/mapa/aortica-cortes.md`. Las fuentes:
> `docs/fuentes/FUENTES.md` → «La tanda Z5 — la Tabla 11 completa, criterio por criterio».

### [CERRADO 2026-10-15 · Z6] Z5-1 · El gradiente medio NO se retira con regurgitación protésica

> **CERRADO con la salida (b), la conservadora de las tres.** Re-leída la nota `‡` en el original
> —folio 27, renderizado a 400 dpi— dice regurgitación **«significativa»**, sin graduarla, así que
> la rama que la orden del Z6 condicionaba quedó habilitada: el gradiente medio se retira con el
> MISMO dueño y el MISMO umbral que el DVI (`emContMotivoNoVota`, moderada o mayor). Cambian DOS
> escenas: con IM moderada o severa el veredicto baja de «significativa» a «posible» y la línea
> SALE del informe firmado. La velocidad pico sigue sin retirarse (Z5-2): no vota.
> Ver `docs/mapa/protesis-z-z5-z6.md` → «La tanda Z6» (salió de `protesis-valvular.md` en la
> partición del 17/10) y `docs/fuentes/FUENTES.md` → «La tanda Z6».

### Z5-1 (texto original) · PARADA · El gradiente medio NO se retira con regurgitación protésica, y la nota ‡ lo marca

**Qué pedía la orden:** que con regurgitación protésica **severa** el gradiente medio y el DVI no
se cuenten (nota `‡` de la Tabla 11), **aplicando el MISMO retiro que la app ya hace con el DVI** —
y que si el umbral de ese retiro **no** es «severa», no se cambie nada del gradiente y se reporte.

**Medido:** el umbral es `EM_CONT_REGURG_MIN = 2`, o sea **moderada**, y lo decide
`emContMotivoNoVota`, que es el dueño compartido con el aviso de la continuidad. **No es severa**,
así que la sub-parte queda **sin hacer** y el gradiente medio **sigue contando**.

⚠️ **Y ESO TIENE CONSECUENCIA EN EL INFORME FIRMADO, con la regla de conteo nueva.** Con IM
moderada o mayor el AEO y el DVI se retiran, el denominador baja a **2 de 2**, y basta que el
gradiente medio y el THP sean positivos para publicar «Prótesis mitral con hallazgos sugestivos de
obstrucción». Medido contra HEAD, que en esa escena no decía nada:

| escena | HEAD | hoy |
|---|---|---|
| IM severa + gradiente 12 + THP 250 | sin línea (`R.obstr = null`) | «… obstrucción (gradiente medio 12.0 mmHg, THP 250 ms).» |

El THP **no** está marcado con `‡`, así que su voto ahí es legítimo; el que la guía marca es el
gradiente. TC-480 lo fija como **límite declarado** para que el día que se decida se note.

**Las tres salidas, para que las decida Maicol:** (a) dejarlo así; (b) retirar el gradiente medio
con el mismo umbral que el DVI (moderada o mayor), que es lo más parecido a lo que la nota `‡`
dice y lo conservador; (c) bajar el umbral del retiro a «severa» para los tres, que cambiaría
además cuándo vota el DVI y el AEO en toda la app.

### Z5-2 · La velocidad pico está marcada con `‡` y tampoco se retira — pero no vota, así que no se ve

La nota `‡` marca **tres** parámetros y la app sólo gatea el DVI. La velocidad pico no entra en el
conteo (la prosa del folio 24 la omite), así que su no-retiro no cambia ningún veredicto: lo único
que hace es que su **banda** se siga publicando en la cápsula con regurgitación significativa.
Queda dicho junto a Z5-1, porque la decisión es la misma.

### [CERRADO 2026-10-15 · Z6] Z5-3 · La fila del PPM mitral pedía un AEO que ya existe

> **CERRADO sin decir nada**, que es la conservadora de las dos salidas: con el AEO retirado —por
> regurgitación o por un insumo fuera de banda— la fila ya no lo pide, y el motivo real sigue
> publicándose en la fila del AEO dos renglones más arriba. El pedido legítimo se conserva: con el
> AEO de verdad ausente lo sigue pidiendo, y la superficie corporal también.

### Z5-3 (texto original) · La fila del PPM mitral dice «falta el AEO» también cuando el AEO está RETIRADO

Con el AEO fuera de banda o retirado por regurgitación, la fila del PPM publica «falta el AEO por
continuidad». No es falso —el AEO no está disponible— pero el motivo real lo dice la fila del AEO
dos renglones más arriba, y «falta» se lee como «cargalo». La alternativa es propagar `R.motivo` /
`R.fuera` al texto del PPM, que duplicaría el motivo en dos filas contiguas.

### Z5-4 · El EN SUMA del PPM perdió el valor de la AEO indexada

Decisión de la orden: la sigla en el EN SUMA y la frase larga en el cuerpo. El número sigue en el
informe, en la fila de pantalla y en la columna del Excel, pero un resumen que se lea solo ya no
lo trae. Si se quisiera, la salida es «PPM mitral severo (0.54).».

### [CERRADO 2026-10-15 · Z6] Z5-5 · `_eaDviProtNivel` calculaba el DVI por su cuenta

> **CERRADO por donde esta entrada proponía:** `eaProtVeredicto` devuelve el NIVEL del DVI
> (`dviNivel`) en sus dos vías —SAVR y TAVI— y la fila lo lee de ahí. **Y los dos caminos SÍ
> discrepaban**, medido: con VTI TSVI 20 y VTI aórtico 56,4 (crudo 0,35461) o 57 (0,35088) la
> pantalla publica «0.35» en los dos, así que la fila decía «(sin criterios)» —el crudo supera el
> 0,35 estricto— mientras el veredicto decía «posible». Hoy las dos dicen «posible», que es la
> lectura del número publicado. Ver `docs/mapa/aortica-cortes.md`.

### Z5-5 (texto original) · `_eaDviProtNivel` calcula el DVI por su cuenta y no lo lee de `eaProtVeredicto`

La referencia protésica de la fila usa `_eaCritDvi()` + `_eaProtNivel()`, mientras el **veredicto**
lee el DVI de `dvi-val` o de `ea_dvi_display`. Son dos caminos al mismo número y hoy coinciden
—medido en las ocho escenas de la tabla—, pero el día que uno de los dos cambie de redondeo la
fila y el veredicto podrían discrepar. La salida es que `eaProtVeredicto` devuelva el **nivel** del
DVI y la fila lo lea de ahí.

### Z5-6 · Las otras cuatro filas del cuadro aórtico siguen mudas con prótesis

La Tabla 5 no publica cortes absolutos de AVA ni de AVA indexada para una prótesis, así que sólo
la fila del DVI gana referencia protésica. El gradiente medio protésico **sí** tiene banda en esa
tabla (`<20` / 20-34 / `≥35` en SAVR) y hoy lo publica el veredicto, no la fila. Si se quisiera
que la fila lo publique, el corte ya existe en `EA_PROT_CRIT.savr_gmed_*`.

---

## Lo que dejan abiertas las tandas Z6 y Y1 (2026-10-15)

### Z6-1 · La guía propone MOSTRAR que el gradiente orienta a regurgitación, y la app no lo dice

La **Tabla 12, folio 28** no sólo dice que el gradiente medio `≥ 5` mmHg con el THP normal no es
estenosis: dice que **sugiere regurgitación protésica significativa**, con sensibilidad 90 % y
especificidad 70 %. La orden del Z6 prohibía expresamente agregar ese texto —«NO agregues ningún
texto ni hallazgo nuevo al informe»— así que la app **retira el voto y calla**. Queda como propuesta
para el médico: la fila podría decirlo en pantalla (no en el informe), con la forma «con el THP
normal, un gradiente de N mmHg orienta a regurgitación», y las otras dos filas que la Tabla 12
publica —la velocidad pico `≥ 1,9` y el DVI `≥ 2,5`— podrían sumarse a la misma lectura.
**Decisión de Maicol.**

### Z6-2 · La regla del THP normal se aplica sólo a la prótesis MECÁNICA

Es lo que dice el título de la Tabla 12 («in mechanical valves») y es el lado que no inventa nada.
Si el médico quisiera extenderla a las biológicas, es **una condición** (`R.mecanica` sale del
predicado) y cambia las escenas de la tabla del mapa. Hoy, con una biológica y el THP normal, el
gradiente vota como siempre.

### Z6-3 · El retiro del gradiente no llega al EXCEL de un estudio archivado por el camino del THP

`vmProtEOA(src)` lee `vm_morf` del registro para decidir mecánica/biológica, así que la columna
derivada del Excel aplica la misma regla. **Medido en pantalla y no en la columna**: la verificación
del Z6 comparó las 440 columnas con el formulario abierto, no con un estudio archivado que tenga
prótesis mecánica y THP normal. No hay motivo para que difiera —es el mismo dueño— pero no está
medido por ese camino.

### ✅ [CERRADO 2026-10-16 · Y2] Y1-1 · El «por qué» de cada tarjeta es el Y2 y no está

Las tarjetas publicaban la frase cualitativa corta **sin los valores**: «IM severa», no «IM severa
(EROA 45 mm²)». **Lo cierra la tanda Y2**: cada tarjeta lleva ahora la lista de criterios con su
valor y su grado, y —donde la pantalla lo nombra— la línea «Decide». Lo que queda abierto de ese
trabajo está en **Y2-1 a Y2-6**, abajo.

### Y1-2 · Una prótesis sin lesión ni veredicto no tiene tarjeta

La mitral y la aórtica publican su veredicto protésico aunque no haya lesión, porque la app lo
calcula. La **tricuspídea no tiene veredicto protésico** en esta app, así que una prótesis
tricuspídea normal se **dibuja** y no se nombra en ninguna tarjeta. No es falso —no hay lesión que
declarar— pero el médico ve una prótesis dibujada y ninguna línea que la mencione. La salida sería
una tarjeta de «morfología» sin grado, que es justamente la tarjeta sin grado que la orden pedía
evitar. **Decisión de Maicol.**

### Y1-3 · La válvula PULMONAR no está en la vista

La apical de cinco cámaras no la incluye, así que ni la EP ni la IP ni la prótesis pulmonar
aparecen. Está declarado en el pie de la vista y lo fija TC-482 como límite. Agregarla es otra
proyección, no una válvula más en ésta.

### Y1-4 · Sin captura y sin inclusión al PDF

La orden las deja para después. Hoy la vista no se puede llevar al informe ni al PPT, y no hay
botón de captura. El dibujo es un SVG en el DOM, así que la ruta natural es la que `_svgToPng` ya
usa para otras figuras — con la salvedad que este archivo ya documenta: **`currentColor` no
sobrevive a serializar un SVG suelto**, y acá el color sale de 21 variables de tema, que tampoco.

### Y1-5 · El tramo del dibujo se lee de la PALABRA que publica el cuadro de referencias

`_v2dTramo` busca «leve», «moderada», «severa», «dilatado»… en el `textContent` del cuadro. Es lo
que evita una segunda tabla de cortes —y es el mismo criterio con que `eaProtVeredicto` lee
`dvi-val`— pero tiene un precio declarado: **si alguien cambia la palabra de una categoría sin
avisar, el tramo cae a 0 y el dibujo se ve normal**. TC-482 compara la categoría de la tabla contra
el `textContent` del cuadro, así que un cambio de palabra lo pone en rojo; lo que no cubre es un
cambio de palabra en una categoría que la tabla no lista.

### Y1-6 · `prefers-reduced-motion` ya estaba contemplado, y conviene decirlo

La demo aprobada lo respeta y la vista lo conserva: con la preferencia puesta **no hay bucle**, hay
un cuadro fijo en la sístole. **No hay nada que hacer acá** — queda escrito porque la orden pedía
sugerirlo si el archivo no lo contemplaba, y lo contempla.

### Y1-7 · La vista no se guarda ni se exporta, a propósito

Nada de lo que se ve se persiste: ni la fase del latido, ni el estado del panel. Reabrir la vista la
arma de nuevo desde el estudio. Es lo que la orden pedía y lo que evita que un dibujo viejo
sobreviva a un cambio de datos.


## Vista 2D de las válvulas — tandas «Y1b» y «Y2» (2026-10-16)

### Y1b-1 · El dibujo queda en 200 px a 1200×700, y no en los 300 del punto de partida

La orden proponía «unos 300 px de alto a 1200×700» y, medido, con 300 la **tabla de cavidades
completa —sus once filas— no entra** en el 85 % de una ventana de 700 px: aparece desplazamiento
interno, que es justo lo que esa tanda vino a cerrar. La condición que manda es «todo se ve sin
desplazamiento a 1200×700», así que el alto del dibujo es la variable que se ajustó:
`clamp(200px, calc(100vh - 520px), 320px)` da **200** a 700 px de ventana, **280** a 800 y **320**
desde 840. Si algún día la tabla pierde filas —o el médico prefiere el dibujo más grande que la
tabla completa— lo que se mueve es el restador del `clamp`.

### Y1b-2 · El piso táctil de 44 px del botón NO se bajó

La orden pedía un botón «más chico». La regla global de la app (`button, .btn, .tab-btn …
{ min-height:44px }`) **no está acotada a `pointer`**, así que una pestaña de válvula en reposo
también mide 44 px de alto en escritorio: bajarlo haría que el botón dejara de tener el tamaño de
una pestaña —que es lo que la misma orden pide— y revertiría la decisión de Maicol del 2026-09-25.
Lo que bajó es el peso visual: el azul se fue, la tipografía y el relleno pasaron a los de una
pestaña y el ancho cayó de 109 a 93 px. **Si se quisiera un botón de 27 px en escritorio**, hay que
acotar el piso a `pointer:coarse` sólo para ese id, y entonces deja de coincidir con la pestaña.

### Y2-1 · Cuatro lesiones no tienen línea «Decide», y no se inventa

La IM, la IAo, la IT y la ET publican en su renglón integrado **el grado** («Severa», «Moderada»,
«Significativa») y **no nombran el criterio** que lo produjo: su regla es un conteo —«una severa
manda», «dos moderadas mandan», «basta con que se cumpla uno»— y atribuírselo a una fila sería una
segunda lectura de esa regla escrita en la vista. Esas cuatro tarjetas llevan la **lista** y no
llevan la línea. **La salida limpia es que la pantalla lo diga**: el día que uno de esos cuatro
renglones gane su sufijo «— por X», como lo ganó la aórtica en la tanda F, la tarjeta lo publica
sin tocar una línea de la vista.

### Y2-2 · La Vmax de la estenosis aórtica vota y no tiene fila en ese cuadro

Es la mitad de **F8** que sigue abierta: la velocidad máxima es criterio y el cuadro de referencias
de la aórtica **no tiene fila para ella**, así que el renglón integrado puede decir «Severa — por
velocidad» y la lista de la tarjeta no tener esa fila. No se inventó la fila: sería publicar un
valor que ese cuadro no publica. **Agregarla al cuadro de Válvulas cierra las dos cosas a la vez.**

### Y2-3 · La prótesis aórtica no lleva línea «Decide»

Su veredicto no sale de un criterio sino de **dos mitades** —un eje dependiente del flujo y uno
independiente— y eso lo dice la nota que el renglón ya publica, que va **al pie de la lista** y no
en la tarjeta cerrada. Nombrar un criterio ahí sería inventar una atribución que la Tabla 5 no
hace.

### Y2-4 · El grado de cada fila llega con el formato de SU pantalla, y no son iguales

La IM, la IAo y la EAo publican el grado como una palabra en un span hermano («moderada»); la IT y
la ET lo publican **con su corte pegado al valor** («Severa (≥7 mm)», «significativa (≥5 mmHg)»); la
EM, con su corte y a veces con la marca «peor»; y las cápsulas protésicas, con su banda entera. La
tarjeta publica lo que cada pantalla imprime, así que **el formato de la lista no es el mismo en
todas las lesiones**. Unificarlo sería reformatear un texto clínico, que es lo que esta tanda no
hace. Lo que lo haría uniforme es unificarlo **en la pantalla**.

### Y2-5 · El PPM no entra en la lista de la prótesis mitral

Decisión de la orden: no es un criterio de obstrucción. La fila sigue en la cápsula y en el informe.

### Y2-6 · Las listas de las prótesis no llevan pastilla de color

La ASE 2024 no publica escala de severidad para la estenosis protésica —el W2-B la retiró de esa
pantalla— así que el grado va como texto con su banda al lado. Es la misma asimetría que el Y1 ya
declaró para el chip de la tarjeta. Pintarlo sería republicar la escala retirada.

### Y2-7 · Control de SOLO LECTURA del DVI protésico aórtico — medido, SIN cambios

Pedido por la orden del Y2 como verificación. **La Tabla 5 de la ASE 2024, folio 19** —folio
comprobado en el pie impreso («Journal of the American Society of Echocardiography · Volume 37
Number 1 · Zoghbi et al · 19»)— publica el DVI de la prótesis aórtica como **`>0.35` normal ·
`0.25-0.35` posible · `<0.25` sugiere estenosis significativa**, que es exactamente lo que
`EA_PROT_CRIT.savr_dvi_normal_min` (0,35, estricto) y `savr_dvi_signif_max` (0,25) aplican.
**Los dos consumidores comparan el MISMO valor —el PUBLICADO, redondeado a dos decimales— y por eso
coinciden**, que es lo que el Z6 arregló: la fila lo toma de `_eaDviProtNivel` → `eaProtVeredicto`
→ `dvi-val`/`ea_dvi_display`, y el veredicto del mismo lugar. Medido con cuatro VTI aórticos:

| VTI Ao | DVI crudo | publicado | fila | veredicto |
|---|---|---|---|---|
| 56,4 | 0,35461 | **0.35** | (posible) | Posible estenosis protésica |
| 57 | 0,35088 | **0.35** | (posible) | Posible estenosis protésica |
| 56 | 0,35714 | **0.36** | (sin criterios) | Posible estenosis protésica *(por otro eje, no por el DVI)* |
| 90 | 0,22222 | **0.22** | (significativa) | Posible estenosis protésica |

**No se tocó nada**: es un corte, y la fila, el veredicto y la tarjeta son coherentes. Lo único que
queda dicho es que el nivel se decide sobre el valor **publicado** y no sobre el crudo —si algún día
se quisiera sobre el crudo, el 0,35461 pasaría de «posible» a «normal»—.

---

## La vista 2D EN LÍNEA — tanda «Y1c» (2026-10-16) — DECLARADO y NO arreglado

### Y1c-1 · El colapso de Safari no se pudo REPRODUCIR, y qué probar a mano

WebKit **sí** estaba disponible (Playwright, build 27.2 ≈ Safari 26/27) y se midió en los **ocho**
viewports de la tabla del mapa: los números son **idénticos** a los de Chrome 155, con la tarjeta
del Y1b en 900×550,4 y **sin colapso**. O sea que el defecto no está en el WebKit de hoy.

Lo que **sí** quedó medido es el mecanismo, y la aritmética cierra con el reporte: `#v2d-cuerpo`
computaba `flex-basis: 0%` —un porcentaje contra `#v2d-card{height:max-content}`, de altura
indefinida—, y un motor que lo resuelva a cero deja la cabecera de 53 px más los dos bordes, que
son los «unos 60 px» con los rótulos asomando por el recorte de `overflow:auto`.

**El arreglo no depende de haberlo reproducido**: se fueron `flex:1`, `overflow:auto`,
`height:max-content`, `max-height:85vh` y `position:absolute`, y no queda ninguna altura en
porcentaje ni en `vh` en toda la cadena. Es la misma regla con la que el panel 3D de ETE se midió
bien en WebKit.

**Lo que Maicol puede probar a mano, en su Safari**, y lo que hay que anotar si algo falla:
1. Abrir Válvulas, tocar «Ver en 2D» y mirar si el panel se ve **entero** (dibujo, dos columnas de
   tarjetas, tabla de cavidades y nota).
2. Decir la **versión exacta** de Safari (menú Safari → Acerca de Safari). Si el panel se viera
   bien, eso confirma el mecanismo y el ítem se puede cerrar del todo.
3. Si se viera mal, medir el alto del panel con el inspector sobre `#v2d-card` y `#v2d-cuerpo`, y
   mirar si `#v2d-svg` conserva sus **300 px**: eso separa «colapsa el panel» de «colapsa el
   lienzo», que tienen causas distintas.

### Y1c-2 · El lienzo deja 12 px de aire a cada lado, y es el precio de la caja fija

El lienzo mide **220×300** y el dibujo se encuadra en **196×300** (`preserveAspectRatio` por
omisión). Los 220 salen de que la columna central tenga un ancho que **no dependa del paciente ni
de la fase**, que es lo que cierra el defecto de Chrome. Medido: el `viewBox` que `fitView`
produce es **el mismo para todo paciente** (`25.49 38.52 155.16 237.17`, idéntico con el
formulario vacío y con las cuatro cámaras dilatadas), así que ese aire es constante y nunca se
recorta nada.

Si algún día molestara, lo que se mueve es el `width` del lienzo **y** el de la columna central,
los dos juntos: bajarlo a 200 px dejaría el texto de fase más largo (218,25 px) sin lugar y
volvería el recorte por puntos suspensivos.

### Y1c-3 · El `title` de la línea de fase es la ÚNICA superficie nueva, y hoy no se usa

El renglón de fase lleva `text-overflow:ellipsis` como red por si un texto creciera, y el texto
completo viaja en el `title` de `#v2d-fase2`. **Hoy ninguno de los cinco se recorta** a 11 px en
una columna de 240, así que el `title` duplica lo que ya se lee. Queda declarado para que nadie lo
lea como información que la pantalla no muestra.

### Y1c-4 · La sincronía en vivo repinta por un oyente de documento, y eso tiene un costo

`v2dRefrescar` cuelga de un oyente de `input` y `change` sobre `document`. Con el panel **apagado**
sale en la primera línea (`v2dVisible()`); con el panel prendido, cada tecla construye un
`v2dEstado()` —unas treinta lecturas de DOM más el «por qué» de las ocho lesiones— para comparar
su JSON contra la foto anterior. Medido: no se nota, y el repintado sólo ocurre cuando el estado
cambió de verdad. Si algún día pesara, lo que corresponde es **debounce por `requestAnimationFrame`**
y no sacar la comparación, que es lo que protege a las listas «Ver criterios» abiertas.

### Y1c-5 · Las listas abiertas se reponen por NOMBRE DE VÁLVULA

`_v2dPqReponer` reabre una lista si en la columna repintada hay un `<li>` cuyo `.v2d-valv` dice lo
mismo. Si dos tarjetas de la misma columna llegaran a tener el mismo nombre de válvula —hoy no
pasa: las columnas son «Insuficiencias» y «Estenosis», con una entrada por válvula— se reabrirían
las dos. La salida limpia sería una clave propia por `<li>`, que es lo que `_v2dPqPintar` ya
recibe y no usa (su tercer argumento `clave`).

### Y1c-6 · Dos sondas archivadas quedaron rotas, y se declara

`scripts/_probe_y1.mjs`, `scripts/_probe_y1b.mjs` y `scripts/_probe_y3.mjs` cierran la vista
clickeando `#v2d-cerrar`, que ya no existe; `_probe_y3.mjs` además lo usa en cuatro grupos. Son
sondas **históricas** de tandas cerradas y no se adaptaron. El grupo `controles` de `_probe_y3.mjs`
**sigue sirviendo** —no toca la vista 2D— y es el que se usó para el A/B de las superficies
firmadas de esta tanda.

### Y1c-7 · `scripts/_probe_y1c.mjs` necesita Playwright, y no está en el repo

Es la primera sonda de este repo que **no** usa la infra de CDP: necesita medir en **dos motores**
—Chrome y WebKit, el de Safari—, y `cdp.mjs` sólo habla con Chrome. Resuelve `playwright` por ruta
(`/tmp/node_modules`, el global de npm o el del `$HOME`) y, si no lo encuentra, **lo dice** y sale
con código 2 en vez de reventar con un stack. `/tmp` se vacía, así que la próxima tanda que la
necesite probablemente tenga que reinstalarlo:

```bash
mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit
```

La alternativa limpia sería una carpeta fija fuera de `/tmp`, pero eso es agregarle una dependencia
instalada a un repo que hoy no tiene ninguna.

### Y1c-8 · El apagado al limpiar y al cargar un estudio es una DIFERENCIA con la orden

La orden decía «al limpiar o cargar un estudio nuevo **si hoy la vista se cerraba en esos casos**»,
y medido: **no se cerraba** —`v2dCerrar` sólo se llamaba desde sus tres caminos de ventana—. Se
agregó igual, en `limpiarCampos` y en `RECALC_MODULOS`, porque con el panel **en línea** dejarlo
prendido publicaría las tarjetas, la tabla y el dibujo del paciente **anterior** sobre un
formulario en blanco, y ningún barrido genérico alcanza a esos nodos. Es la misma decisión que el
panel 3D de ETE, dos líneas más arriba en el mismo archivo. Si Maicol prefiere que el panel
sobreviva a «Nuevo estudio», lo que se saca son esas dos líneas y lo que entra en su lugar es una
llamada a `v2dRefrescar()` forzada.

### Y1c-9 · El botón mide 2 px menos prendido, y es lo mismo que le pasa a una pestaña

Medido: `btn-ghost` lleva **1 px de borde** y `btn-primary` **0**, así que el botón pasa de
**93,2 px** a **91,2** al prenderse y, como `.v2d-pie` es `text-align:center`, se corre **1 px**
hacia la derecha. **La pestaña de válvula hace exactamente lo mismo** —`pill-insuf-mitral` va de
1 px de borde en reposo a 0 px prendida—, que es la consecuencia de haber reusado sus dos clases
en vez de declarar colores propios, y es lo que la orden pedía.

**No tiene nada que ver con la estabilidad durante el latido**, que está medida en **0,00 px**: es
una diferencia entre los dos estados del botón, no entre dos cuadros. Si alguna vez molestara, lo
que se agrega es un borde transparente de 1 px al estado prendido — y entonces el botón deja de
verse exactamente como una pestaña activa.

---

## Tanda «H» — la AI por volumen y las dos correcciones del PDF (2026-10-16)

### ✅ H-1 · CERRADO el 2026-10-16 (tanda J, commit 1) — por la salida (a)

**Resuelto.** El informe ya no afirma normalidad: **declara** el volumen medido sin indexar y
dice que no se clasifica, con su frase en los tres estilos; la cápsula publica
«Sin indexar (falta ASC)» donde tenía la raya, y la fila «Vol. indexado» del PDF dice por qué no
hay índice en vez de desaparecer de la tabla. **Con área o diámetro cargados la cascada los usa
como antes** —la línea nueva sólo habla cuando no hay nada más con qué clasificar—.
Medido: **4 escenas de 18 cambian** contra HEAD. Lo implementado está en
`docs/mapa/auricula-izquierda-pdf.md` § 9. **TC-487 (7b) se adaptó**: era el límite declarado y
hoy afirma lo contrario.

⚠️ **El prompt de la tanda J la llamó «opción B» y describió la (a).** Lo que manda es la
descripción; la (b) de abajo era «pedir el dato». Queda anotado para que la letra no confunda.

Lo que sigue es el estado en el que la parada se declaró.

### ⏸️ H-1 · El volumen medido SIN superficie corporal hacía que el informe AFIRMARA normalidad (estado del 2026-10-16, cerrado)

**Medido, y es PREEXISTENTE.** Con `ai_vol = 98` y sin peso ni talla, el informe firmado publica
«Aurícula izquierda de dimensiones normales.» sobre una aurícula cuyo único dato es un volumen
que, indexado, sería **severo**. La cadena del bloque 4 de `generarInforme` es
`if (ai_vol && bsa) … else if (aiGeoMedido) … else if (!aiGeoFuera) → normalidad`, y un volumen
sin BSA no entra en las dos primeras.

La orden de esta tanda mandaba **tratarlo como «sin volumen» (la opción conservadora) y
reportarlo**, que es exactamente lo que la app hace, así que **no se corrigió**. TC-487 lo fija
como **límite declarado**, para que el día que se decida el caso lo note.

Es el reverso de lo que la rama `aiGeoFuera` ya cierra para los valores ilegibles —«la negación
necesita evidencia de haber podido leer algo»—.

**Tres salidas, con la conservadora marcada:**
* **(a) ★** declarar la medición sin afirmar: una línea del tipo «Aurícula izquierda: el volumen
  está cargado (98 ml) pero no se puede indexar sin peso y talla; no se informa el tamaño
  auricular por esa vía», con `ccMarcarParrafo()`, calcada de la rama de `aiGeoFuera`. No cambia
  ninguna otra frase y cierra la negación falsa;
* **(b)** pedir el dato en vez de declararlo («completar peso y talla para graduar»), que es
  una instrucción para quien mide y no un hallazgo del paciente — el criterio que la rama del
  diámetro ya usa para su invitación;
* **(c)** dejarlo como está. Es lo que hay hoy.

Cualquiera de las tres **cambia una frase del informe firmado**, así que la decide Maicol.

### H-2 · La CÉDULA del médico no existe: la parte de la firma quedó SIN HACER

**La lectura del asistente es incorrecta, y la orden lo preveía.** Censado:

| Dato | id | De quién |
|---|---|---|
| Matrícula del **médico** | `med-matricula` / `cfg-medico-matricula` | médico |
| Nº de documento | `ci` + `doc_tipo` (`CI`/`DNI`/`CPF`) | **paciente** |
| «Matrícula», placeholder **«Nº mutualista»** | `matricula` | **paciente** |

**No hay ninguna cédula del médico**, así que la regla «si están las dos se imprime la cédula,
salvo que prefiera la matrícula» no es aplicable: no hay dos datos entre los que elegir. Agregar
una casilla de preferencia habría sido agregar un control que no gobierna nada.

Además, la identificación que hoy se imprime en la firma va **sin rótulo**: `_num` se une a la
especialidad con `·`, no como «Matrícula: …».

**Tres salidas:**
* **(a)** agregar un campo de **cédula del médico** en ⚙️ Config → «👨‍⚕️ Médicos», persistido con
  el resto de la configuración del médico (nunca con el estudio), más la casilla de preferencia
  que la orden describe. Es lo que la orden quería;
* **(b)** sólo **rotular** lo que ya se imprime («Matrícula: 12345») sin agregar ningún campo. Es
  el cambio más chico y ya mejora el papel;
* **(c) ★** dejarlo como está hasta que Maicol decida si la cédula del médico tiene que ser un
  dato de la app.

### H-3 · El Laboratorio clasifica la AI por su cuenta, y NO se tocó

La orden lo prohíbe expresamente y se respetó. Son dos lecturas independientes de la misma
aurícula:
* la fila «Dilatación AI» de `_LAB_HALLAZGOS` es un **regex sobre el TEXTO** del informe
  (`/dilataci[oó]n.{0,10}auricular|AI\s+(?:dilata|agrand)/i`);
* `_labLavi(inf)` recalcula el indexado desde `ai_vol`, `peso` y `talla` y corta en
  `> UMBRAL_LAVI_DILATADO` para la fila «Vol AI elevado sin función diastólica documentada».

Como esta tanda **no cambia ni una letra del informe**, el recuento del Laboratorio **no se
mueve** — verificado: `_labDiastGrado` y las 440 columnas del Excel salen idénticas en las
cuatro escenas de control. Lo que queda abierto es que un cambio futuro en la redacción de la
frase de la AI **le cambia la estadística al Laboratorio sin que nada lo avise**.

### H-4 · El Excel no exporta ninguna clasificación de la AI, sólo valores

Cuatro columnas: `Vol AI (LAVI) (ml/m²)` (derivada), `Diám. AP AI (mm)`, `Área AI (cm²)` y
`Volumen AI (ml)`. **Ninguna dice si la aurícula está dilatada ni con qué grado**, así que la
clasificación no se puede reconstruir desde el libro sin recalcularla. Una columna nueva es
**PARADA de columna** y esta orden la prohíbe. Queda declarado.

### H-5 · El PPT publica el volumen de AI en ml y no el indexado

`fila(DER, 'Volumen AI', _pptNum('ai_vol'), ' ml')`. El indexado —que es lo que gradúa— **no
aparece** en el PPT por ningún camino. No se tocó: agregarlo cambia una diapositiva.

### H-6 · El símbolo del sexo no llega al PPT, al informe ni al EN SUMA

La orden lo acota al PDF y así quedó. Censado: el **informe** y el **EN SUMA** no nombran el sexo
del paciente en ninguna frase, y el **PPT** lo publica como la palabra entera. O sea que no hay
ninguna superficie que use una letra sola y quede desalineada.

### H-7 · El hueco del símbolo asume que la celda del sexo no envuelve POR OTRO motivo

El ancho del hueco se le devuelve al medidor del envoltorio en los tres sitios, así que el corte
se decide como si el símbolo no existiera. Pero si un día esa celda envolviera **por su propio
contenido** —una edad de cuatro dígitos, un sexo con una palabra más larga—, el hueco podría
quedar en una línea y la figura dibujarse igual: `_tSexo` la pinta en la línea que lo contiene,
así que el símbolo acompañaría a la palabra, pero el ancho extra ya no cabría en el colchón.
Medido hoy: no ocurre en ninguna de las seis plantillas. Declarado.

### H-8 · Los rótulos de las bandas asumen cortes ENTEROS

`aiVolRotulo` arma «Dilat. leve (35-41)» con `banda_anterior.hasta + 1`. El límite real es
`> 34`, así que un volumen indexado de 34,5 cae en leve y el rótulo lo rotula «35-41». Es
**preexistente** —el rótulo cableado decía lo mismo— y es la misma trampa que `hviSeveridad` ya
tiene escrita. Lo que gradúa es la banda, no el rótulo. No se tocó: cambiarlo cambia un texto de
pantalla.

---

## Tanda «Y3b + Wilkins + I» (2026-10-16) — DECLARADO y NO arreglado

### Y3b-1 · El «corte lateral» y los cinco ángulos siguen tocando el borde de ABAJO

**Medido en 24 celdas** (tres grados de IM × tres vistas y cinco ángulos): con el cuadro nuevo
(340×300, ventana 462×408, aire 55) el margen de **arriba** nunca baja de 9 px y en la vista del
cirujano llega a 70, pero el margen de **abajo** queda en 0 en el corte lateral y en los cinco
ángulos. **Ya quedaba en 0 en HEAD** (0 a 3 px), así que no es una regresión.

**Por qué no se puede arreglar creciendo el marco:** medido con la ventana puesta en el espacio de
dibujo COMPLETO de la demo (680×380, o sea el modelo a la mitad de escala), esas mismas celdas siguen
con el margen de arriba en **cero**. O sea que su contenido —los rótulos que `spread()` separa, y las
líneas de la aurícula vistas de canto— **se sale del propio espacio de dibujo de la demo**.

**Salidas:** (a) dejarlo como está; (b) acotar el `spread()` de los rótulos al rectángulo del lienzo,
que es tocar el dibujo y esta orden lo prohíbe; (c) dar a esas seis cámaras un zoom propio más
cerrado, que achicaría el modelo sólo en ellas. **Es decisión de Maicol.**

### Y3b-2 · A 1200 px la vista quirúrgica baja de 466 a 356 px

El panel pasó de 500 a 610 px de ancho para que la tabla entre en su columna derecha de 250. El
contenedor de esa tarjeta mide **978 px**, así que `978 − 12 − 610 = 356` para la vista quirúrgica,
que tiene `flex:0 1 500px` y puede encogerse. **Nada se pisa y no hay scroll horizontal** —medido—,
y a 1440 px las dos vuelven a sus 500. Si 356 px resulta poco para leer la vista quirúrgica, las
salidas son bajar la columna derecha a 250 → 230 px, o pasar el panel a ocupar la línea entera por
debajo de cierto ancho. **No se tocó.**

### Y3b-3 · El Laboratorio sigue contando un 1/1/1/1 legado como un score completo de 4

`_labWilkinsResumen` cuenta sobre registros archivados con `_labNum(i, k) > 0`, así que un estudio
legado con los cuatro criterios en 1 y sin la marca de gesto entra en su promedio y en su barra de
«≤8 favorable», mientras la pantalla, el PDF y el Excel del MISMO estudio dicen «sin puntuar».
**El Laboratorio está en los NO TOQUES de esta orden.** La corrección es una línea: pasarle
`wilkinsScoreDeCampos(i.campos, 'ete').interpretable`. **Es decisión de Maicol**, porque cambia un
agregado estadístico ya publicado.

### Y3b-4 · El desglose del PDF de ETE lista los cuatro «1 / 4» con el total en «no calculado»

Con un 1/1/1/1 sin marca, `amiloTextoWilkins` publica «Score de Wilkins | no calculado» y
«Interpretación | sin puntuar — reingresá los cuatro criterios», y **debajo sigue listando** los
cuatro criterios en 1/4. Es factual —son los valores que el estudio trae— pero convive con un total
que la app declara no interpretable. **No se tocó**: cambiar ese desglose es cambiar el papel firmado.

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

### Y3b-6 · Las dos separaciones de líneas B — ✅ **RETIRADAS 18/10/2026 (ARR7), por la misma falta de fuente**

El selector existe con las dos separaciones que **dicta Maicol** (≈7 mm y ≈3 mm) y sus opciones son
**descriptivas**: dicen la separación que el médico midió, **no la interpretan** —ni «septal» ni
«vidrio deslustrado»—, **no llevan cita** y el dato **no tiene globo**. El barrido de la biblioteca
se repitió y sigue dando **cero**: ver `docs/fuentes/FUENTES.md` → «Las dos separaciones de LÍNEAS
B: NO HAY FUENTE EN LA BIBLIOTECA». Lo que queda abierto es la fuente, no el control.

#### Lo que decía la entrada original

No hay **ningún protocolo POCUS pulmonar** en la biblioteca. Lo único sobre líneas B es la misma
revisión de ETE en cuidados críticos, que dice que **tres o más** indican edema o enfermedad
intersticial (folio 167) y **no menciona ninguna separación en milímetros**. El selector
`pul_lineasb_pat` sigue ofreciendo focal y difuso y la oración del informe no cambió. Para cerrarlo
hace falta el protocolo (Volpicelli 2012 o equivalente) en la biblioteca, con su rótulo literal.

### Y3b-7 · Los cinco campos nuevos no se reimportan desde el Excel

`wilkins_delib`, `cx_wilk_delib`, `pericardio_hemo`, `pul_derrame_lado` y `pul_consol_nota` viajan
con el estudio pero **no están en `LAB_XLS_MAP`**, así que no tienen columna y un backup a Excel con
su reimportación los pierde: el derrame pleural vuelve sin lado, la consolidación sin nota, el
pericardio sin su compromiso y el Wilkins sin su marca —o sea un 1/1/1/1 reimportado queda «sin
puntuar», que es el lado conservador—. Agregarles columna es **PARADA de columna** (el Excel tiene
440). **Es decisión de Maicol.**

---

## Tanda «J» (2026-10-16) — DECLARADO y NO arreglado

> Lo implementado está en `docs/mapa/auricula-izquierda-pdf.md` §§ 9-10,
> `docs/mapa/identificacion-paciente.md` y `docs/mapa/panel-frases.md`.
> Cierra **H-1** por su salida (a).

### J-1 · La línea nueva de la AI NO marca párrafo, así que el EN SUMA puede seguir negando

Con el volumen medido, sin superficie corporal y sin nada más, el informe declara
«Volumen de la aurícula izquierda de 98 ml, sin indexar…» **y el EN SUMA puede caer en su
fallback** —«Estudio sin alteraciones estructurales ni funcionales significativas»— sobre un
informe que dos renglones arriba declara un volumen auricular sin clasificar.

**No se corrigió a propósito.** La rama hermana de `aiGeoFuera` sí llama a `ccMarcarParrafo()`
por este mismo argumento —«negar *sin alteraciones* cuando una medición no se pudo leer deja al
lector sin saber si se perdió un hallazgo»—, pero marcar cambia el texto **GLOBAL** del EN SUMA
y la orden de esta tanda dice que el EN SUMA **no menciona la AI en ese caso** y no autoriza
tocar sus demás frases. Es **menos grave que antes**: hoy el cuerpo declara el volumen, donde
antes afirmaba normalidad.

**Dos salidas, con la conservadora marcada:**
* **(a) ★** dejarlo como está, y que el cuerpo sea el que informa;
* **(b)** llamar a `ccMarcarParrafo()` en la rama nueva: el EN SUMA pasa a «Sin OTRAS
  alteraciones significativas — ver los hallazgos descritos en el cuerpo». **Una línea.**

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

### J-3 · El `aria-label` de los marcadores no dice el estado en palabras

Los dos marcadores anuncian su estado con `aria-pressed`, que es el patrón estándar de un botón
de alternancia y lo que un lector de pantalla lee como «pulsado». El botón del panel de
Evidencia, en cambio, **declara su estado en el `aria-label`** porque ahí el estado vive sólo en
el color y no hay `aria-pressed`.

Se eligió `aria-pressed` por ser el mecanismo nativo; queda anotado que las dos superficies de
esta app resuelven lo mismo de dos maneras distintas.

### J-4 · El nombre del ARCHIVO del PDF no sigue la elección

`_fmtOpts` ya ofrece cinco formatos de nombre de archivo —dos con el documento y dos con la
matrícula— y los gobierna `localStorage ett_filename_fmt`, una preferencia aparte. **No se
tocó**: es el nombre del archivo, no la identificación impresa, y la orden habla de lo que se
imprime. Hoy un médico puede tener el PDF llamado por el documento y la matrícula impresa
adentro.

### J-5 · El importador de Excel no trae la elección

Un estudio importado desde Excel no trae `pac_id_print` en `campos`, así que al abrirlo
`pacIdRestaurar` lo deja en el **documento**, que es el default. Es el comportamiento correcto y
queda declarado. **No se agregó ninguna columna al Excel** (la orden lo marca como PARADA): el
libro sigue en **440**.

La **exportación e importación JSON sí conservan la elección**, por construcción: `campos` viaja
entero y el validador de `_INF_CAMPOS_PERMITIDOS` acota las claves de **nivel superior**, no las
de `campos`.

### J-6 · El formato del rótulo impreso no se unificó entre el PDF y el PPT

El PDF imprime el rótulo en su **propia celda** («CI» / «Matrícula» en una columna y el valor en
otra) y el PPT lo pega al valor en una tira («CI 4455667»). Y con `doc_tipo` vacío el PDF escribe
«Cédula» y el PPT «CI». **Las dos diferencias ya existían** y cada superficie conserva su
literal: unificarlas cambiaría uno de los dos papeles sin que nadie lo haya pedido.

### J-7 · La columna de frases a 1200 px angosta el informe a su mínimo cómodo

Con el panel abierto a 1200 px el informe y el EN SUMA pierden 290 px de ancho. Es lo pedido
—«el informe y el EN SUMA conservan un ancho cómodo»— y a ese ancho quedan en unos 630 px, que
sigue siendo más que el ancho de lectura de un párrafo. **A 1440 y 1920 px no hay nada que
declarar.** Los números medidos están en `docs/mapa/panel-frases.md`.

### J-8 · Los dos marcadores suman 2 hallazgos y 2 ALTAS al chequeo de celular

`node scripts/check_mobile.js` pasa de **43 / 52 con 1 ALTA** a **45 a 360 px y 54 a 390 px, con
3 ALTA cada uno**. Los dos de más son los marcadores: `check_mobile.js` mide el **rect del
nodo** y los dos `<button>` miden **7 × 11 px**; su área táctil real la da un `::after` absoluto,
que el chequeo no ve. Es el mismo precedente que el botón del «porqué» de la vista 2D ya dejó
declarado. La severidad sale ALTA porque la excepción del «label envolvente» de ese script sólo
alcanza a `checkbox` y `radio`.

**No se corrigió, y el motivo está medido:** el `.fg` mide 44-49 px de alto entre el rótulo y el
campo, así que un botón de 44 × 44 **o desplaza el campo** —lo que la orden prohíbe— **o tapa
el input**. El área efectiva medida con `elementFromPoint` es **35 × 41 px**, y **18 de 18**
toques llegan al botón a 1200, 768 y 390 px en los dos temas.

**Tres salidas, con la conservadora marcada:**
* **(a) ★** dejarlo y declararlo, que es lo que hay;
* **(b)** ensanchar el `::after` de 14 a 16,5 px por lado para llegar a **40 × 41**, el número
  que el botón del «porqué» usa. **No cambia el conteo** —el chequeo sigue midiendo el nodo—
  pero mejora el área real. Dos valores de CSS;
* **(c)** enseñarle a `check_mobile.js` a mirar el `::after` cuando existe. Toca el arnés, no el
  producto, y le cambiaría el conteo a los otros botones que usan el mismo recurso.


## Tanda K · el 3D de la mitral, el bull's eye al PDF y el 3D del ventrículo (2026-10-16) — DECLARADO y NO arreglado

> Lo implementado está en `docs/mapa/mitral-3d-ete.md` (secciones 13, 14 y 15) y en
> `docs/mapa/contractilidad-3d-vi.md`. Acá queda lo que la tanda **no** hizo.

### K-1 · El chorro todavía recorta el borde de ABAJO con el modelo volcado

Con el tope en 3,6 el borde **superior** queda en cero en las 1794 orientaciones del barrido, que
es donde el médico vio el artefacto. Quedan **479 de 1794** que recortan el borde **inferior**, y
todas tienen el modelo volcado (pitch ≥ 45 o ≤ −75). Es el mismo borde que el modelo ya tocaba en
HEAD y que el Y3b-1 declaró para el corte lateral y los cinco ángulos.
Las salidas: bajar más el tope (2,4 deja 18 de 360 en el barrido grueso, pero acorta el chorro un
43 % respecto de la demo), subir `M3D_AIRE` (mueve el modelo y rehace la medición del Y3b-2), o
dejarlo. **No se tocó**: el síntoma reportado es el de arriba.

### K-2 · En la vista del cirujano el chorro se proyecta como una RAYA RECTA

Las nueve rayas del chorro son **coplanares** —el abanico se abre sólo en x—, así que mirándolo a
lo largo de su eje (la vista del cirujano) se proyecta como un segmento recto horizontal que cruza
por encima de la válvula. **No es un recorte**: el chorro está entero y conectado. Con el tope de
K0a ese segmento pasa de 5,8 a **5,1 unidades** de ancho, contra **3,4** del anillo mitral.
Que un chorro sea más ancho que el anillo es una decisión sobre el MODELO, que esta orden prohíbe
tocar. Las salidas: abrir el abanico en un cono en vez de un plano (cambia la geometría de la
demo), acotar `sf`, o dejarlo. **No se tocó.**

### K-3 · Los otros dos toggles de PDF estaban en `localStorage` — ✅ **CERRADO 17/10/2026 (CORTOS9)**

Hoy son campos del estudio: `sgl_be_pdf` y `ete_qx_pdf`, con el patrón de `contr_be_pdf`. Las dos
claves viejas ya no se leen y se siguen borrando en «Nuevo estudio». Medido con clics reales.

#### Lo que decía la entrada original

K1 movió el estado del bull's eye de contractilidad a un campo DEL ESTUDIO (`contr_be_pdf`). Sus
dos hermanos —`sgl_incluir_pdf` (bull's eye del strain) y `mitral_qx_incluir_pdf` (vista
quirúrgica)— **siguen siendo preferencias globales de `localStorage`**, con exactamente el mismo
modo de falla: aparecen prendidos solos al encadenar estudios. `mitral_qx_incluir_pdf` sí se borra
en `limpiarCampos`; `sgl_incluir_pdf` no. Quedaron fuera de esta orden.

### K-4 · A 1200 px la columna de hallazgos de motilidad baja a unos 150 px

Para que el cuadro gris del 3D del ventrículo **no se achicara** —la orden lo pide— el panel pasó
a `calc(46% + 118px)`, o sea creció exactamente lo que ocupa la columna de los cinco cuadros. Lo
que se angosta es la columna de hallazgos: **151 px a 1200**, 264 a 1440 y 511 a 1920. Es texto y
se lee, pero a 1200 queda apretado. Las salidas: bajar la columna de botones de 210 a 180 px,
achicar la columna de datos, o que a 1200 la fila pase a dos columnas con el panel abajo (deja de
ser la fila de tres que la orden pide). **No se tocó.**

### K-5 · La leyenda «modelo esquemático» de la CAPTURA no existe

La orden la enumera entre los controles del bloque de captura del 3D del ventrículo. **No existe**:
la única con ese texto («Modelo esquemático, ilustrativo: no es una imagen del paciente») está
debajo del botón «Ver en 3D», en la columna del bull's eye, y ese botón no se movió. El bloque de
captura tiene su propio rótulo («Sin captura.»). **No se creó nada**, como manda la orden.

### K-6 · Con la pestaña del navegador oculta el 3D del ventrículo sigue pidiendo cuadros

Medido con la emulación de `document.hidden`: 54 cuadros en 900 ms con la pestaña oculta, contra 0
con el panel cerrado. **Es PREEXISTENTE** —HEAD da el mismo 54 con la misma emulación—, así que no
es una regresión de esta tanda. El 3D de la MITRAL sí se detiene con la pestaña oculta.
Puede ser además un artefacto del medidor: redefinir `document.hidden` con `defineProperty` no es
lo mismo que ocultar la pestaña de verdad. **No se tocó.**

---

## Tanda «L» — el registro de evidencia y las tarjetas ⓘ de AI/VI (2026-10-16)

Nada de lo de abajo se tocó: todo es contenido clínico, un corte o un texto del informe firmado,
y esta orden no lo autoriza.

### ✅ L-1 · CERRADO el 2026-10-16 (tanda LS2) — el diámetro AP de la AI tiene corte POR SEXO

**Resuelto.** Normal hasta **40 mm en el varón y 38 en la mujer**, con el operador `>` para la
dilatación —la guía publica un rango normal que incluye su techo— y el corte del varón cuando el
sexo falta. Verificado en la Supplemental Table 9 de la ASE/EACVI 2015 (folio 39.e14, hoja 53):
«AP dimension (cm): Women 2.7–3.8 / Men 3.0–4.0». El comentario del código que atribuía «3,9 y
4,1» a la guía era **falso en las dos mitades** y se corrigió. Ver `docs/mapa/ai-vi-por-sexo.md`.

<details><summary>Lo que decía esta entrada</summary>

### L-1 · El diámetro AP de la AI usa un corte único donde la guía da uno por sexo
La app marca dilatación con **≥ 40 mm** para los dos sexos. La ASE/EACVI 2015, **Tabla
suplementaria 9, folio 39.e14**, da el techo de normalidad en **4,0 cm en el varón y 3,8 cm en la
mujer**; el comentario de `UMBRAL_AI_DIAM_DILATADO` declara que el valor único es una decisión de
Maicol del 2026-09-27, tomada sobre la edición 2006. La ficha `DIM-AI-001` queda «parcial» y su
barra **no publica línea de fuente**.
Salidas: (a) dejarlo como está y documentarlo en la tarjeta; (b) separar por sexo, que mueve el
informe de toda mujer con un diámetro entre 38 y 39 mm.

</details>

### ✅ L-2 · CERRADO el 2026-10-16 (tanda LS3) — el DDVI pasa a CUATRO categorías por sexo

**Resuelto.** Varón 58 / 63 / 68 mm y mujer 52 / 56 / 61, las cuatro bandas de la Tabla
suplementaria 3 (folio 39.e8, hoja 47), con los adjetivos que `vdfviInterp` y `vsfviInterp` ya
publicaban. **El 65 mm que la app usaba no estaba en ninguna de las dos columnas** de esa tabla.

<details><summary>Lo que decía esta entrada</summary>

### L-2 · El diámetro diastólico del VI tampoco separa por sexo
`viDimCat` usa **58 y 65 mm** para los dos, más un respaldo por volumen telediastólico indexado
(61 en la mujer, 75 en el varón). La guía, **Tabla suplementaria 3, folio 39.e8**, da cuatro
bandas por sexo, y su techo de normalidad es 5,8 cm en el varón y **5,2 en la mujer**. Ficha
`DIM-VI-001`, «parcial».

</details>

### ✅ L-3 · CERRADO el 2026-10-16 (tanda LS7) — la FEVI tiene UN dueño y CUATRO categorías

**Resuelto, y eran CINCO copias y no dos.** Las tres de cuatro categorías —la cápsula de
`calcVI`, el bloque del informe y `_simpClasificar`— y **dos de TRES** —`FEVICAT` del módulo de
asociaciones y la distribución del panel del Laboratorio, que fundían la moderada con la severa
en un «< 40 %»—. Las cinco leen `feviClasificar` / `FEVI_CATS`, y `EV_BANDAS_REF.fevi` se
**deriva** de esa tabla. Los cortes de 50 y de 40 quedaron verificados en la guía ESC 2021 de
insuficiencia cardíaca (Tabla 3, folio 523.e11) y el de 30 en la ASE/EACVI 2015 (Tabla 4, folio
10) y en la de 2005 (Tabla 6, folio 1448). Las cuatro bandas **como conjunto** siguen siendo un
criterio de la aplicación y la tarjeta lo declara sin nombrar ninguna guía.

<details><summary>Lo que decía esta entrada</summary>

### L-3 · Las categorías de FEVI viven en DOS copias y no se verificaron
Los cortes **≥ 50 / 40-49 / 30-39 / < 30** están escritos dos veces —la cápsula de `calcVI` y el
bloque de `generarInforme`— y **ninguno de los dos es reutilizable**. Además no coinciden con la
ASE/EACVI 2015, que corta por sexo en 52 y 54 % con bandas 41-51 y 41-53, y no se encontró en la
biblioteca el documento que publique la partición que la app usa. Ficha `FUN-VI-001`, «por
verificar»; su barra sale sin fuente.
Esta tanda **no agregó una tercera copia**: la tarjeta dibuja con las bandas de `EV_BANDAS_REF` y
**copia** la categoría de la cápsula, y TC-491 las ata a lo que la app publica.
Salidas: (a) extraer un dueño único sin cambiar los números —no cambia nada visible—; (b)
además, decidir si se adoptan los cortes por sexo de la guía, que sí mueve el informe.

</details>

### ✅ L-4 · CERRADO el 2026-10-16 (tanda LS4) — SIGUE sin clasificarse, y es la decisión

**Resuelto por confirmación, no por cambio de conducta.** Se volvió a censar: ninguna superficie
clasifica el diámetro sistólico —no hay cápsula `dsvi-interp`, cero ocurrencias— y el «menor de
40 mm» que se le atribuía es la **referencia impresa** de la tabla del PDF, no una clasificación.
LS4 **no agregó** una al informe ni al EN SUMA: eso sería inventar un texto. Lo que ganó el sexo
es la referencia impresa («H<=40 M<=35 mm»), el punto de la tarjeta sin sexo y una barra por sexo
en Referencias. TC-493 (a11) lo fija como límite declarado.

<details><summary>Lo que decía esta entrada</summary>

### L-4 · El diámetro sistólico del VI no se clasifica en ninguna superficie
Censado: `dsfvi` alimenta la fracción de acortamiento y el módulo de TEER, y **no produce
categoría** en la pantalla, el informe, el PDF, el PPT ni el Laboratorio. La barra de la tarjeta
publica la banda de la **guía** (Tabla suplementaria 3, folio 39.e8, verificada) y lo dice con
esas palabras, porque no hay dueño al que preguntarle. Decidir si la app debe clasificarlo.

</details>

### ✅ L-5 · CERRADO el 2026-10-16 (tanda LS6) — los 115 y 95 EXACTOS son NORMALES

**Resuelto.** `calcGeometriaVI` pasó de `m < limite` a `m <= limite`: las dos tablas de la
ASE/EACVI 2015 publican la masa normal como un rango que **incluye su techo** («Women 43–95 / Men
49–115») y hacen empezar la banda leve en 116 y 96, que es donde `hviSeveridad` ya graduaba.
**El defecto era peor que un borde:** con 115 exactos la cápsula decía «Normal» —su operador ya
era `>`— y la fila de geometría, dos renglones más abajo, «Hipertrofia excéntrica» sin gravedad.
Medido: HEAD tenía **un hueco por sexo** y hoy son **cero**, barriendo de 40 a 200 g/m².

<details><summary>Lo que decía esta entrada</summary>

### L-5 · En el valor exacto del umbral de masa, la app dice «hipertrofia» SIN gravedad
`calcGeometriaVI` llama hipertrofia a la masa que **no es menor** que el umbral —o sea **115 g/m²
exactos ya son hipertrofia en el varón, y 95 en la mujer**— mientras `hviSeveridad` empieza a
graduar en 116 y en 96. En ese valor exacto la pantalla y el informe publican «HVI» sin grado.
El comentario de `hviSeveridad` ya lo anticipaba. TC-491 lo fija como **límite declarado**, para
que el día que se decida el caso lo note.
Y la Figura 6 de la guía escribe `≥ 0,42` y `≤ 0,42`, que **se solapan en el 0,42 exacto**: la
app lo resuelve del lado concéntrico.

</details>

### L-6 · J-1 sigue abierto, y esta tanda lo volvió a medir
Reproducido con teclas reales en los **tres** estilos, con el volumen de la AI medido y **sin
superficie corporal**:

| escena | informe (estándar) | EN SUMA |
|---|---|---|
| volumen 98 y nada más | «Volumen de la aurícula izquierda de 98 ml, sin indexar por falta de superficie corporal; no se informa el tamaño auricular.» | **vacío** |
| volumen 98 + diámetro **normal** 38 | «Aurícula izquierda de dimensiones normales (diámetro AP 38 mm).» | vacío |
| volumen 98 + área **normal** 15 | «Aurícula izquierda de dimensiones normales (área 15 cm²).» | vacío |
| volumen 98 + diámetro dilatado 50 | «Aurícula izquierda dilatada (diámetro AP 50 mm).» | «AI dilatada (diámetro AP 50 mm).» |
| volumen 98 + área dilatada 25 | «Aurícula izquierda dilatada (área 25 cm²).» | «AI dilatada (área 25 cm²).» |
| CONTROL, el mismo 98 **con** ASC 2,00 | «Aurícula izquierda severamente dilatada (Vol Index 49.0 ml/m²).» | «AI severamente dilatada…» |

**El EN SUMA no contradice al informe en ninguna escena**, y eso es lo que J-1 declaraba. Lo que
sigue abierto son dos cosas, las dos **preexistentes**:
1. el EN SUMA **calla** la declaración del volumen sin indexar, así que un resumen leído solo
   deja fuera el único dato de esa aurícula (es la decisión de la tanda J, que no llama a
   `ccMarcarParrafo()`);
2. con un diámetro o un área **normales**, el informe afirma **«de dimensiones normales»** y la
   declaración del volumen sin indexar **desaparece**, sobre una aurícula cuyo volumen medido,
   indexado, sería severo. La rama que J1 cerró es la de «volumen y nada más».

La tarjeta ⓘ de la AI **sí** lo dice en los dos casos, porque cada barra publica su propio
estado: el aviso «Volumen de 98 ml, sin indexar: cargar peso y talla» aparece aunque el diámetro
sea normal. Es pantalla, no papel.

### L-7 · Lo que la tarjeta del VI deja en scroll interno
A **1200 × 700** —el viewport que la orden fija— **ninguna** de las tres tarjetas tiene scroll
interno, en Chrome ni en WebKit. En **390 × 844 y 360 × 740** la del ventrículo sí lo tiene en
algunas escenas, y en Chrome también a **1920 × 1080** cuando el globo queda a 550 px del borde:
en los dos casos lo que manda no es el alto de la tarjeta sino el **hueco** que queda del lado
donde se abre, y el `overflow:auto` es lo que corresponde. Si se quisiera evitar también ahí,
habría que partir la tarjeta del VI en dos más.

### L-8 · El botón ⓘ va en el cuerpo del acordeón, no pegado al título
La orden pedía el globo «junto al título». El encabezado de esos dos acordeones **es** un
`<button>` con `onclick="secToggle(...)"`, y un botón dentro de otro botón no es marcado válido:
el navegador lo saca del padre al parsear. Quedó en una fila propia inmediatamente **debajo** del
título, con su rótulo. Si se quisiera a la derecha del título habría que reestructurar la
cabecera del acordeón, que gobierna todas las secciones de la app.

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

# Tanda «M» (2026-10-16) — las tarjetas ⓘ de AD/VCI, del VD y de la AORTA

Todo lo de abajo está **medido y NO corregido**: son cortes, operadores o mecanismos que la orden
de esta tanda no autoriza a tocar.

### M-1 · El área de la aurícula derecha: la app corta en 18 cm² y esta guía corta en 19
La ASE 2025 (Mukherjee), **Tabla 1, folio 145**, fila `RA area, cm2`: normal `< 19`; leve
`≥19 a ≤22`; moderada `>22 a ≤24`; severa `>24`. Su Key Point del folio 143 lo repite: «Normal
thresholds are RA area < 19 cm²». La app usa `≤ 18` normal / `> 18` dilatada, sin graduar.
**El 18 SÍ está en esa guía**, pero en otro contexto: el folio **164** lo nombra como signo de
presión auricular derecha elevada («RA area > 18 cm2»), junto con la VCI > 2,1 cm.
Hay dos cosas para decidir: mover el corte a 19 y, si se quiere, **graduar** el área en cuatro
bandas como la tabla. Las dos cambian el informe firmado.

### M-2 · El diámetro de la vena cava: `< 21` contra «normal ≤ 2,1 cm»
Folio 160: «A normal IVC diameter is ≤2.1 cm», y el Key Point habla de «an IVC diameter cutoff of
2.1 cm». La app aplica `diam < 21` para la rama «no dilatada», así que **a 21,0 mm exactos ya la
trata como dilatada** y la PmAD pasa de 3 a 8 mmHg. Un milímetro entero de diferencia en el valor
que después entra en la PSAP.
⚠️ Y el `<select>` del colapso ofrece **«>50 %» y «<50 %»**, mientras la guía escribe
**«collapses ≥50%»**: el 50 exacto no es expresable con ese control.

### M-3 · El diámetro longitudinal del VD: 86 mm no está en ninguna de las dos guías
Lang 2015, **Tabla 8, folio 20**: «RV longitudinal diameter (mm): 71 ± 6, **normal range 59-83**».
ASE 2025, **Tabla 1, folio 145**: «RV diameter longitudinal, cm: **< 8.2**». La app usa **86**.
Censadas las dos guías completas, no aparece. La ficha `DIM-VD-003` queda «por verificar» y su
barra sale sin línea de fuente.

### M-4 · La FAC severa en 25 % tampoco está
Lang 2015, §8.3, folio 19, verifica el **35 %**. El segundo corte —`< 25 %` para «disfunción
severa», que el EN SUMA usa— no está en ninguna de las dos: la ASE 2025 gradúa `≤35 a >29` leve,
`≤29 a >22` moderada y `≤22` severa. La ficha `FUN-VD-003` queda «parcial».

### M-5 · Los bordes de TAPSE, onda S′ y FAC: la app es la ASE 2015 y la ASE 2025 corta al revés
Los tres operadores de la app (`≥17`, `≥9,5`, `≥35` = normal) son **exactamente** los de Lang
2015, que define el lado anormal con `<`. La **Tabla 1 de la ASE 2025** define el normal con `>`
(`TAPSE >1.7`, `S′ >9.5`, `FAC >35`), así que **el valor exacto del corte cambia de lado**: un
TAPSE de 17,0 mm es normal para la app y «leve» para esa tabla. Lo mismo con 9,5 y con 35.
Y la banda «leve» del **diámetro basal** de la app llega a 45 mm donde la ASE 2025 la corta en
4,4 cm. No se alineó: un prompt posterior lleva el VD a la ASE 2025 con grados, y **las tarjetas
leen del dueño, así que se van a actualizar solas**.

### M-6 · La entrada vieja `ref-vd` de Referencias dice «S′ ≥10 cm/s» y la app aplica 9,5
Es una tabla estática de cinco filas con el rótulo «VD — Parámetros Normales y Disfunción
(ASE 2015)». Su fila de la onda S′ publica **≥10 / <10** mientras `calcVD` aplica **≥9,5**.
Es **preexistente** y no se tocó: cambiarla es tocar una tabla de referencia que esta orden no
nombra. La entrada nueva `ref-vd2` publica el 9,5 leído del dueño, así que hoy las dos conviven.

### M-7 · El operador del corte de 40 mm de la raíz aórtica
`aoSegGrado` marca dilatación con **`x > sg.ref`**, así que **40,0 mm exactos salen «Normal
(≤40mm)»**. Maicol decidió que 40 mm exactos cuenten como dilatado. **No se cambió** —es un corte
que decide el informe firmado y el cambio va en otro prompt—; la tarjeta **lee el operador del
mismo dueño**, así que el día que se mueva, la línea del gráfico y el texto se mueven con él.

### M-8 · La tarjeta de FUNCIÓN del VD se desplaza por dentro a 1200 × 700
Medido: mide **594 px** y el hueco útil debajo del globo a 1200 × 700 es de **440**. Ya está
partida en dos (tamaño | función), que es el remedio que la orden prescribe; con seis barras y su
línea de categoría cada una, la mitad de función no entra en 440 px sin apretarla. A 1440 × 800
faltan **4 px** y desde 1920 × 1080 hacia abajo —768, 390 y 360 px incluidos— no se desplaza.
Las salidas: (a) dejarlo así; (b) partir función en dos globos más; (c) sacar el tiempo de
aceleración pulmonar, que es una medida de flujo pulmonar y no de función del VD.

### M-9 · Lo que la app NO clasifica y por eso no lleva barra
* **Relación VD/VI**: tiene corte (`> 1,0`, `VD_VI_HTP_MIN`) pero lo que publica es un **signo de
  la categoría A de la probabilidad de hipertensión pulmonar**, no un tamaño del ventrículo. Se
  dejó fuera por indicación de la orden.
* **Diámetro de la arteria pulmonar**: la app no lo clasifica —sólo tiene la banda de
  plausibilidad `IP_AP_BANDA [5,80]`—, y la **Tabla 1 de la ASE 2025, folio 145**, sí lo gradúa:
  `< 2,5 cm` normal · `≥2,5 a ≤3,0` leve · `>3,0 a ≤3,5` moderada · `>3,5` severa.
* **Diámetro y VTI del tracto de salida del VD**: Lang 2015, Tabla 8, folio 20, da rangos
  normales (`RVOT PLAX 20-30`, `proximal 21-35`, `distal 17-27` mm) y la ASE 2025 también; la app
  no los clasifica.
* **Volumen sistólico pulmonar (Qp)**: no tiene corte y la fila lo dice.
* **Áreas telediastólica y telesistólica del VD**: alimentan la FAC y no se clasifican por sí
  mismas, aunque las dos guías publican sus rangos.

### M-10 · Los cuatro globos nuevos suben el chequeo de celular +4 ALTA, y es el artefacto de siempre
`check_mobile.js` mide el rect del NODO **sin emular puntero grueso**, y `.vinfo-btn` mide
**16 × 12 px con el mouse y 44 × 44 con el dedo**, por su `@media (pointer: coarse)`. Medido con
emulación táctil: los cuatro pasan a 44 × 44 exactos, igual que los tres del L. **No se
agrandaron**: hacerlo desplazaría los campos de la fila. Es el mismo precedente que el botón del
«porqué» de la vista 2D y los dos marcadores de identificación del J.

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

### M-12 · El informe firmado no publica nada del nomograma, y eso es deliberado
La lectura del gráfico por edad y superficie corporal vive **sólo en pantalla**. El informe, el
EN SUMA, el PDF y el PPT siguen diciendo lo de siempre, que sale del corte único de 40 mm. Es la
regla de la casa —«el panel explica, el papel afirma»— y además agregar una frase al informe
firmado no está autorizado en esta tanda.

---

## Tanda LS · la AI y el VI por SEXO (2026-10-16) — DECLARADO y NO arreglado

> Lo implementado está en `docs/mapa/ai-vi-por-sexo.md` y la verificación contra el original en
> `docs/fuentes/FUENTES.md` → «La tanda LS». Acá queda lo que la tanda **no** hizo.
> **Cierra L-1, L-2, L-3, L-4 y L-5.**

### LS-1 · El espesor parietal relativo: la Tabla 6 y la Figura 6 se contradicen en el 0,42

La **Tabla 6 (folio 17)** de la ASE/EACVI 2015 publica «Relative wall thickness (cm): Women
0.22–0.42 / Men 0.24–0.42», o sea con el **0,42 ADENTRO del rango normal**. El pie de la **Figura
6**, en la misma página, escribe «concentric remodeling (normal LV mass with increased RWT
**$ 0.42**)» y «normal geometry (RWT **# 0.42**)» —y en esa fuente `$` es `≥` y `#` es `≤`, la
codificación que la ASE 2025 ya tiene documentada—, así que **la figura se contradice a sí misma**
en el 0,42 exacto.

La app usa `< 0,42` normal, que es la lectura de la figura. **El RWT estaba fuera del alcance de
esta orden y no se tocó.** Lo único que se hizo fue que la ficha `GEO-VI-001` cite **sólo la
Figura 6** —la que respalda lo que la app hace— en vez de la Tabla 6, que lo niega. Y queda una
contradicción impresa: la tabla del PDF publica `RWT ref '<=0.42'` mientras el código trata el
0,42 como aumentado.

**Salidas:** (a) dejarlo así y declarar la contradicción de la guía en la tarjeta; (b) adoptar la
Tabla 6 y pasar a `<= 0,42` normal, que cambia la geometría de todo paciente con RWT exactamente
0,42; (c) corregir sólo la referencia impresa del PDF a `<0.42` para que el papel y el código
digan lo mismo. **La (c) es la mínima y sólo toca un rótulo.**

### LS-2 · El límite de normalidad de la FEVI por sexo

La ASE/EACVI 2015 corta la FEVI en **52 % en el varón y 54 % en la mujer** (Tabla 4, folio 10).
La app usa **50 sin sexo**, que es decisión de Maicol del 2026-09-20 y el comentario de
`UMBRAL_FEVI_NORMAL` ya lo declara. **No se tocó**: mover ese corte cambia la premisa del
HFA-PEFF, la compuerta de la función diastólica y el panel de Evidencia, que lo leen todos.

### LS-3 · El área de la AI se gradúa en la edición de 2005 y la app la deja binaria

La Tabla 9 de Lang 2005 (folio 1456) publica el área con **cuatro bandas** —`≤20` normal, 20-30
leve, 30-40 moderada y `>40` severa—; la de 2015 no publica el área absoluta. La app dice
«dilatada» sí o no. **Está fuera del alcance de esta orden** («el área de la AI NO cambia») y el
corte coincide con la fuente, así que lo único abierto es si conviene graduarla.

### LS-4 · La tarjeta de GEOMETRÍA se desplaza por dentro

Con las dos barras de espesor pasó de **363 px a 528 de alto visible y 562 a 596 de contenido**,
o sea **34 a 68 px de scroll interno** —los 68 sin sexo, donde cada barra agrega su línea de
aviso—. Es el mismo precedente que `vd-fun-card` de la tanda M, que ya está declarado como M-8.

**Salidas:** (a) dejarlo, que es lo que esta tanda hizo; (b) partir la tarjeta en dos globos
—«geometría» y «espesores»—, lo que agrega una entrada a `VINFO` y sube el conteo de TC-471;
(c) una sola barra de espesor, que obliga a elegir entre el septum y la pared o a tomar el mayor,
que es un criterio que la guía no escribe.

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

### LS-8 · El aviso no llega al PDF, al PPT ni al informe, y es la decisión

La orden lo pide así y está medido en los tres estilos. Queda anotado que un estudio **guardado**
sin sexo y reimpreso no lleva ninguna señal de que sus categorías se calcularon con el corte más
alto: el papel firmado no lo dice por ningún camino.

### LS-9 · El enlace del aviso a 768 px — ✅ **CERRADO 17/10/2026 (CORTOS8): NO ERA UN DEFECTO**

Era el artefacto de `elementFromPoint` que este repo ya tiene escrito: hay que **desplazar la
página antes de medir**. No se tocó una línea de la app; el enlace tiene geometría y el aviso se
ve.

#### Lo que decía la entrada original

`elementFromPoint` sobre el centro del enlace devolvió «fuera del viewport» en las **dos** celdas
de 768 × 1024 y fue alcanzable en las otras diez. Es el artefacto que este repo ya tiene escrito
—el mismo que el globo del cociente TAPSE/PSAP pagó en la tanda Z— y no un defecto: el enlace
tiene geometría y el aviso se ve. Para cerrarlo hay que desplazar la página antes de medir.

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

## Tanda VS · el corazón derecho y la raíz aórtica a la Tabla 1 de la ASE 2025 (2026-10-17) — DECLARADO y NO arreglado

> Lo implementado está en `docs/mapa/corazon-derecho-ase2025.md`. Acá queda lo que la tanda
> **no** hizo, y lo que cerró de la tanda M.

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

### VS-1 · El diámetro del TSVD NO se gradúa, y es por falta de la VISTA

La Tabla 1 le da **TRES** filas con cortes distintos —PLAX `<3,3 cm`, PSAX proximal `<3,4`, PSAX
distal `<2,9`— y el campo de la app (`tsvd_diametro`, rotulado «Diám. TSVD (mm)») **no dice en
qué vista se mide**. Graduarlo obligaría a elegir una de las tres por el médico.
**Salidas:** (a) agregar un selector de vista al lado del campo —cambia el juego de campos del
estudio—; (b) graduar por la vista más conservadora y declararlo; (c) dejarlo como está.

### VS-2 · El diámetro de la arteria pulmonar sigue sin graduarse

La Tabla 1 lo gradúa (`<2,5 cm` normal, hasta `>3,5` severa) y la app sólo tiene una banda de
plausibilidad. Es el mismo estado que M-9 declaraba; esta orden no lo pide.

### VS-3 · La relación VD/VI sigue sin ser un grado de tamaño

Tiene corte (`> 1,0`) pero lo que publica es un signo de la categoría A de la probabilidad de
hipertensión pulmonar. No entra en la graduación del tamaño. Igual que M-9.

### VS-4 · La función sistólica del VD NO tiene un GRADO global en el informe

Cada parámetro tiene hoy su grado en la cápsula, en la tarjeta y en Referencias, pero el informe
y el EN SUMA siguen diciendo «disfunción sistólica» sin graduar. El motivo es que el informe
nunca publicó una categoría por parámetro —publica UN veredicto combinado por un OR— y graduar
ESE veredicto pide una regla de integración que la orden difiere expresamente («reportá cómo se
combinan hoy, para decidirlo después con ejemplos»).
**Ejemplos para decidir:** TAPSE leve + FAC severa; TAPSE moderado solo; TAPSE normal + Tei
severo; cuatro parámetros leves. **Salidas:** (a) el PEOR de los medidos; (b) el peor sólo si dos
o más coinciden; (c) seguir sin graduar.

### VS-5 · La quinta categoría de presión auricular derecha (20 mmHg) no se implementó

La guía la admite con VCI muy dilatada (`>2,5 cm`) **sin variación respirofásica** y **con
contraste espontáneo o reflujo de color** (folio 160). La app **no tiene campo** para los dos
últimos insumos. La tabla de 3 / 8 / 15 mmHg no se tocó.
**Salidas:** (a) dos casillas nuevas en la sección de VCI —cambia el juego de campos—; (b)
dejarlo declarado.

### VS-6 · El `adA > 18` y el `vciD > 21` de la probabilidad de HTP NO se tocaron

`_htp2022Core` los usa como **signos de categoría C** de la ESC/ERS 2022, con el corte de ESA
tabla. Son otra pregunta —igual que el `vdBas > 41` de su misma línea, que ya estaba declarado— y
mover un signo de categoría cambia `nCat` y con él la probabilidad publicada. Consecuencia
medida: con el área de la AD en 18,5 cm² la app dice «de dimensiones normales» y la categoría C
cuenta el signo.

### VS-7 · Tres huecos de UN VALOR en los rangos de ADVERTENCIA del importador

`DCM_RANGO_CLIN` es un rango de **advertencia** y no la definición de normalidad, y su disparo es
estricto. Con los operadores nuevos quedan tres bordes donde la app clasifica y el importador no
avisa, siempre del lado conservador —avisa de menos sobre un dato que la app ya marca—:
`tapse` en 17,0 · `s_prime` en 9,5 · `vd_bas` en 41 · `ao_sin` en 40,0.
**No se tocó**: cambiarlo mueve qué filas entran con advertencia en toda planilla ya exportada.

### VS-8 · El PPT no publica ninguna categoría de esta zona

`_pptNum('vd_bas')` y `_pptNum('ad_area')` publican el VALOR. Agregarles la categoría cambiaría
seis filas de una diapositiva que esta orden congela.

### VS-9 · `DisfSist_VD` sigue siendo BINARIA

Es la decisión de la orden: «si guarda un binario, SIGUE binario y el grado no se guarda». Sale
del TEXTO del informe por `_labDisfSistVent` y cambia sólo en las escenas donde el OR cambia.
Guardar el grado pediría una columna nueva, que es una PARADA.

### VS-10 · Los estudios guardados NO se migran

Un estudio archivado abre con los campos que guardó y se **reclasifica solo** al calcular, porque
la app no guarda la categoría: guarda el valor. Su `informe_texto` y su `en_suma` ya firmados se
reponen tal cual y no se reescriben.

---

## Tanda «VAL» · las válvulas NATIVAS alineadas a las guías (2026-10-17) — DECLARADO y NO arreglado

### VAL-1 · El borde de 1,0 cm² del AVA aórtico: las dos guías se contradicen

**Verificado y NO cambiado** (lo pedía la orden). La **EAE/ASE 2009, Tabla 3, folio 10** escribe la
severa como **`<1.0`** —o sea que el 1,00 exacto sería MODERADA— y la **ESC/EACTS 2025, folio 4670**
escribe «AVA **≤1.0 cm²**». La app aplica `≤ 1,0` → severa, que es la guía más nueva y el lado que
no suaviza. Moverlo cambia el grado de todo paciente con un AVA de exactamente 1,00 en un informe
FIRMADO, y es contenido clínico.

### VAL-2 · La estenosis tricuspídea sigue BINARIA aunque la ASE 2023 gradúe el área

El **folio 16** de esa guía escribe «TS is considered to be mild with a TVA >1.5 cm², and moderate
with a TVA 1-1.5 cm²», o sea que publica tres bandas de área. La app conserva los DOS estados
—decisión de Maicol, punto (f) de la orden— y no muestra leve ni moderada. Pasar a tres bandas
cambiaría el `<select>`, el informe, el EN SUMA, el Excel y la celda del Laboratorio.

### VAL-3 · El criterio que decide en la ET: la precedencia es de la app, no de la guía

Con dos o tres criterios cumplidos, el que se nombra es el primero de **área → gradiente medio →
VTI de entrada**. La regla sigue siendo un OR —los tres pesan igual, que es lo que la Tabla 10 de
la EAE/ASE 2009 dice— y ninguna guía dice cuál nombrar cuando coinciden. Es un **desempate de
presentación**, no de cálculo, y está escrito en `etEstado`.

### VAL-4 · El informe nombra el criterio en el paréntesis y no con un sufijo

La pantalla publica «Significativa **— por** área valvular» y el informe «estenosis significativa
**(por** área valvular 0.80 cm²; gradiente medio 8 mmHg)». Son **dos formas de la misma cosa**: el
papel nombra el criterio con su valor, como ya hace la mitral («AVm 1.20 cm² por planimetría»), y
la pantalla con el sufijo que la aórtica usa desde la tanda F. Unificarlas es un cambio de
redacción del informe firmado.

### VAL-5 · El AVA por PLANIMETRÍA se movió con el de continuidad

`_eaCritPlan` usa el **mismo** `avaEsModerada`, así que el 1,50 por planimetría también pasó a
moderada. Es correcto —es la banda del ÁREA y no la del método— y se declara porque la orden sólo
nombraba el AVA por continuidad. Separarlos exigiría una segunda tabla de cortes, que es el defecto
que `AVA_MOD_MAX` viene a cerrar.

### VAL-6 · La ACC/AHA 2020 publica ESTADIOS y la app los llama grados

La Tabla 17 del folio e121 reparte el jet/AI en estadio A (`<20 %`), estadio B «Progressive MR»
(`20-40 %`) y estadios C-D (`>40 %`). La app los mapea a leve / moderada / severa, que es lo que ya
hacía. **Ningún número cambió**; lo que se corrigió es que el corte dejara de figurar como «sin
fuente». Renombrar las bandas es contenido clínico.

### VAL-7 · Lo que esta orden dejó explícitamente afuera

El **VTI del reverso en aorta descendente** (15 / 25 cm), cuya fuente sigue pendiente; el **piso de
9 mmHg de la estenosis pulmonar**; el **área mitral por continuidad en fibrilación auricular**; la
**insuficiencia tricuspídea de tres grados**; el **THP con insuficiencia mitral significativa**; y
las **prótesis**, que van en el trabajo «PRO». Ninguno se tocó.

### VAL-8 · `panel-evidencia.md` sigue por encima del techo y esta tanda no lo tocó

Ese mapa está en **35,3 KB**, o sea ya cruzado, desde el 2026-10-12. La nota del panel sobre el
cociente VTI se reescribió en `index.html` y lo que la documenta vive en
`docs/mapa/valvulas-val.md` §5, para no agrandarlo. **La próxima tanda que lo toque tiene que
partirlo**, igual que `diastolica.md` (35,2 KB).

---

## Tanda «PRO» (2026-10-17) — commits 1 a 3 hechos, 4 a 6 NO

⚠️ **LA ORDEN PEDÍA SEIS COMMITS Y SE HICIERON LOS TRES PRIMEROS MÁS SU COBERTURA.** El corte es
uno de los que la propia orden ofrece («commits 1 a 3 / commit 4 / commit 5 / commit 6»). Lo hecho
está en `docs/mapa/protesis-pro.md`; lo que falta, acá. **Las seis tablas de las guías que los tres
commits restantes necesitan ya están VERIFICADAS y transcritas** en
`docs/fuentes/FUENTES-protesis.md`, con su folio y su hoja: ese trabajo no hay que repetirlo.

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

### PRO-3 · Sin columnas nuevas de Excel, y dos propuestas si alguna vez se necesitan

Esta tanda **no agregó ninguna columna**: el Excel sigue en **440**, medido clave por clave. Si
PRO-1 y PRO-2 entran, los campos nuevos viajan con el estudio (el JSON los conserva) y **no hace
falta** columna para que la app funcione. Si el Laboratorio los necesitara, las dos que
corresponderían son:
- **`Fuga paravalvular (grado)`**, derivada sin campo, en el bloque «8 · VÁLVULAS», pegada a
  `AVA (cm²)`;
- **`Tipo prótesis pulmonar`**, campo de entrada, en el bloque de la pulmonar, pegada a
  `IP etiología`.
**No se crearon**: una columna nueva es PARADA.

### PRO-4 · Cobertura de PRO-1 y PRO-2 — **CERRADO 17/10/2026 (tanda PRO-C)**

> Las dos mitades tienen su caso: **TC-497** para la fuga de la prótesis quirúrgica (51
> condiciones, 34 en rojo contra el inicio de su tanda) y **TC-498** para la graduación de las
> prótesis tricúspide y pulmonar (**47 condiciones, 34 en rojo** contra el inicio de la tanda
> PRO-C y **ninguna por excepción**). Su ficha está en `docs/mapa/tests-fichas.md`.

### PRO-4 (texto intermedio) · la mitad de PRO-1 CERRADA 17/10/2026

> La fuga de la prótesis quirúrgica tiene su caso: **TC-497**, 51 condiciones, **34 en rojo**
> contra el inicio de la tanda y ninguna por excepción. Lo que sigue sin cobertura es **PRO-2**,
> la graduación de las prótesis tricúspide y pulmonar, que es el PRO-C.

### PRO-4 (texto original) · Cobertura de PRO-1 y PRO-2

**TC-496 cubre sólo los commits 1 a 3.** La fuga quirúrgica y las dos prótesis necesitan su propio
caso (el siguiente número libre es **TC-497**) con los bordes de cada criterio, las capturas en los
dos temas y los dos motores, y el chequeo de celular de los campos nuevos.

### PRO-5 · Los dos cortes del reverso diastólico ya NO coinciden, y es correcto

`IA_VMAX_TD_SEVERA` (aorta descendente de la nativa y de la SAVR) sigue en **20 cm/s** con un solo
nivel, por la **ESC/EACTS 2025, Figura 4, folio 4659**; el del módulo TAVI pasó a **dos niveles**
(20 a <30 moderada, ≥30 severa) por la **VARC-3, Tabla 16, folio 1846**. **Son dos territorios y dos
fuentes**, y el comentario de esa constante ya pedía que mover uno no dejara al otro atrás: quedó al
día. Unificarlos es decisión clínica de Maicol, no una refactorización.

### PRO-6 · El mapa de prótesis quedó a 754 bytes del techo — **CERRADO 17/10/2026 (PRO-B1)**

`docs/mapa/protesis-valvular.md` quedó en **34,2 KB** y el techo es 35, así que la tanda PRO-B lo
**partió antes de escribir una línea**, medido con `wc -c`: las tres tandas históricas Z, Z5 y Z6
salieron completas a `docs/mapa/protesis-z-z5-z6.md` (**20,4 KB**) y el mapa de origen quedó en
**16,7 KB** con su puntero. El contenido de la tanda PRO ya había salido a archivo propio
(`docs/mapa/protesis-pro.md`, 17,6 KB) por el mismo motivo.

---

# Tanda PRO-B (2026-10-17) — lo declarado y NO tocado

### PRO-B1 · La extensión circunferencial de la fuga NO se ofrece en la mitral

**Es de la fuente y está censado:** la **Tabla 13 de la ASE 2024 (folio 30, hoja 29)** publica
ancho de vena contracta, volumen regurgitante, fracción regurgitante, EROA, área del jet,
convergencia, densidad, contorno y flujo venoso pulmonar — y **ninguna fila de extensión
circunferencial**. Las dos guías que sí la publican (ASE 2019 y VARC-3) son de la **aórtica**.
Si alguna vez se quiere ofrecer en la mitral hay que decidir **con qué fuente**, y hoy no hay una.
TC-497 (d1) lo fija por su ausencia: `vm_pvl_ext` **no existe**.

### PRO-B2 · Tres parámetros de la Tabla 13 no tienen campo en la app

**Convergencia del flujo**, **densidad del chorro** y **contorno del chorro (CW)** son tres de las
nueve filas de la Tabla 13 y la app no tiene dónde registrarlos. No se inventaron: lo que la app
aplica son los cuatro cuantitativos más el área del jet y el flujo venoso pulmonar. Agregarlos es
una decisión de Maicol —son tres campos cualitativos nuevos— y **no cambiaría ningún corte**: la
tabla los publica sin número.

### PRO-B3 · La fuga aórtica no gana filas en la TABLA DE DATOS del PDF

La oración de la fuga llega al papel **por el narrativo**, que es exactamente como viaja la de la
TAVI. Lo que **no** se hizo es darle filas propias a `ea_pvl_ext` y `ea_pvl_vc_area` en la tabla
de datos del PDF: los seis campos de la TAVI tampoco las tienen. Si se quisieran, son dos filas en
el bloque aórtico y **no mueven ninguna cuenta**.

### PRO-B4 · Dos escenas del Laboratorio cambiaron, y es consecuencia de leer al dueño

`_labTaviResumen` tenía su **propia copia** de los cuatro cortes y divergía del dueño en dos cosas:
el **reverso de 20 a 29 cm/s** contaba **Severa** (el PRO3 lo partió en dos niveles y esta copia no
lo siguió) y la **extensión circunferencial de 0 %** contaba **Leve** (el «cero medido» no existía
acá). Desde el PRO-B3 lee al dueño, así que esas dos escenas pasan a **Moderada** y **Sin RPV**.
Es la consecuencia buscada de tener **un solo dueño**, está medida y TC-497 (g5) y (g6) la fijan.
`RPV_L` ganó el rótulo **«Sin RPV»**, que es una categoría nueva de esa distribución.

### PRO-B5 · El mapa `aortica-cortes.md` quedó en 33,2 KB

A **1,8 KB del techo** de 35, medido con `wc -c` DESPUÉS de recibir su puntero de veinte líneas.
**La próxima tanda que lo toque conviene que lo parta.** Los otros cuatro que esta tanda tocó
quedaron con margen: `vista-2d-valvulas.md` 32,4 KB · `tests-fichas.md` 28,3 ·
`valvulas-mitral-pantalla.md` 23,9 · `protesis-pro.md` 19,2 · `laboratorio-asociaciones-valvulas.md`
16,3. El mapa nuevo, `protesis-fuga-pvl.md`, nació en **15,3 KB**.

---

# Tanda PRO-C (2026-10-17) — lo declarado y NO tocado

### PRO-C1 · La Tabla 19 no publica regla de integración — ✅ **DECIDIDO 17/10/2026 (CORTOS4): DOS O MÁS**

Decisión de Maicol: hacen falta **dos o más** criterios positivos (`VT_PROT_OBSTR_MIN = 2`, el
mismo umbral que `VM_PROT_OBSTR_MIN` de la mitral) y con **UNO** solo el veredicto es `aislado` —la
cápsula lo nombra con su valor y **no sube al papel**—. La Tabla 19 sigue sin publicar una regla:
el umbral es criterio de EcoSmart y la cápsula lo declara. Ver `docs/mapa/cortos-arreglos.md`.

#### Lo que decía la entrada original

**Es de la fuente y está censado:** el título de la **Tabla 19 (folio 36, hoja 35)** dice
«Doppler parameters **suggestive of** prosthetic TV stenosis» y **no dice cuántos hacen falta**,
igual que la Tabla 11 de la mitral (ver `Z1`). La app aplica un **OR** —basta uno— porque es la
regla que ya usa en todos sus umbrales únicos: la estenosis tricuspídea **nativa** es un `some`
de sus tres criterios desde que es binaria. El veredicto nombra los positivos con su valor, así
que el médico ve cuántos lo sostienen.
Si alguna vez se quiere un umbral de conteo como el de la mitral (`VM_PROT_OBSTR_MIN = 2`), es una
decisión clínica de Maicol y cambia qué escenas publican la línea en el informe **firmado**.

### PRO-C2 · Cuatro parámetros de la Tabla 21 y uno de la 19 no tienen campo

**Tabla 21 (folio 39, hoja 38):** el **flujo de vena hepática** —orden expresa de no agregarlo—,
el **área del jet en color**, la **zona de convergencia** y el **llenado tricuspídeo** no tienen
campo en la app. El **radio de PISA** sí lo tiene (`it_pisa_r`) y vota **por la EROA**, no como
criterio propio: agregarlo como criterio cambiaría el grado de la IT, que esta tanda congela.
**Tabla 16 (folio 34):** el **flujo sistólico pulmonar comparado con el sistémico** tampoco tiene
campo, y la **fracción regurgitante** de la prosa del folio 35 (`<30 %` leve, `>50 %` severa)
tampoco. Los cinco quedan **declarados, no inventados**.

### PRO-C3 · La reversión del flujo en las ramas de la AP vota «Severa» y la fuente dice «al menos moderada»

**Medido en el PDF original**, prosa del folio 35 (hoja 34), literal: «Reversal of flow in the
distal main PA by PW Doppler is **suggestive of at least moderate PR**», y la **Tabla 16** pone
«Present» en las columnas de **moderada Y severa** —o sea que su presencia sola no distingue—.
La app vota **Severa** con `ip_reversion` (`IP_SIGNOS` → `rev: 'Severa'`).
**NO SE TOCÓ, y hay tres motivos:** (1) la regla de integración de la IP es «el peor de los signos
cargados», declarada **criterio de la app** por decisión de Maicol del 2026-10-07, no de una guía;
(2) el signo es **compartido con la válvula nativa**, que esta orden congela, así que cambiarlo
sólo en el régimen protésico crearía dos reglas de la app donde hay una; y (3) la orden del PRO-C3
enumera qué criterios de regurgitación pulmonar aplicar —ancho del jet, fracción regurgitante y
THP— y **no nombra la reversión**.
Cambiarlo haría que un paciente con reversión aislada pase de «IP severa» a «IP moderada» en el
informe firmado. Es decisión clínica de Maicol.

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

### PRO-C5 · El `vpProtObstr` no tiene fuente inyectable, y hoy no la necesita

`vmProtEOA(src)`, `eteTaviRPV(src)` y `valvProtDato(…, src)` aceptan una fuente para poder leer un
estudio **archivado**; `vtProtObstr()` y `vpProtObstr()` leen el DOM y nada más. Hoy **ningún
consumidor archivado los necesita**: no hay columna de Excel, el Laboratorio no los lee y el
informe trabaja sobre el formulario, donde el formulario ES el estudio. El día que el Laboratorio
quiera contar obstrucciones protésicas tricuspídeas o pulmonares hay que agregarles `src` —y al
AEO tricuspídeo, que hoy se le pide a `etEstado()`, que tampoco lo tiene—. Es el mismo camino que
`_htp2022Core` recorrió cuando el panel de cohorte lo consumió.

### PRO-C6 · El Laboratorio no cuenta las dos obstrucciones protésicas

Medido: `_labEstenSev` lee el **token** del `<select>` (`et_grado` / `ep_grado`), que esta tanda no
toca, así que la fila de las ocho válvulas y el gráfico apilado siguen contando lo de siempre; y
ninguna categoría de `_LAB_HALLAZGOS` matchea las dos frases nuevas, así que esos estudios no
entran en ninguna. **No se tocó el Laboratorio** (orden expresa): el A/B dedicado da cero
diferencias en el PPT estadístico (21 textos), en el PDF de auditoría (105) y en el Excel de los
tres estudios de la población. Si alguna vez hay que contarlas, hace falta decidir si son
categorías nuevas de `_LAB_HALLAZGOS` —que corta en OCHO, ver `X5`— o columnas derivadas, y lo
segundo es una **PARADA de columna**.

### PRO-C7 · Dos mapas quedaron cerca del techo

Medido con `wc -c` DESPUÉS de escribir: `docs/mapa/tests-fichas.md` quedó en **34,1 KB** —a 855
bytes del techo de 35— y `docs/mapa/vista-2d-valvulas.md` en **33,3 KB**. **La próxima tanda que
toque cualquiera de los dos tiene que partirlo ANTES de escribir.** Sigue esperando
`docs/mapa/aortica-cortes.md` (33,2 KB), que esta tanda no tocó.

---

## Tanda «CORTOS» (2026-10-17) — DECLARADO y NO arreglado

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

### CORTOS-2 · «Engrosamiento / calcificación» no dice «pericárdico»

El dueño nuevo (`_periTxt`) sólo reescribe los tokens que empiezan con «Derrame», así que el
informe sigue publicando «Engrosamiento / calcificación.» a secas. Nombrarle el pericardio es
redactar una frase clínica que esta orden no autoriza. **Es una línea** y el dueño ya existe.

### CORTOS-3 · Los dos campos de la prótesis tricúspide quedan detrás del cajón «Datos» en celular

Desde que viven dentro de `#campos-esten-tricuspide`, por debajo de **768 px** el CSS del celular
cierra ese cajón con `!important`, así que el DVI y la velocidad pico de E ya no están siempre a la
vista en celular —igual que los seis campos de la estenosis—. Es el precio de ponerlos con los
demás y lo pidió la orden. **Salida:** sacarlos del cajón con un envoltorio propio, que es lo que
hacía el PRO-C1.

### CORTOS-4 · El selector de origen de la prótesis mitral no se ve sin la pastilla de insuficiencia

Su padre es `#bloque-insuf-mitral`, **el mismo antes y después de la mudanza**, así que esto es
**preexistente** y no lo trae esta tanda: medido en los dos árboles, con prótesis mecánica y la
pastilla cerrada la visibilidad es `false` en HEAD y hoy. Lo mismo le pasa a los campos de
cuantificación que lo rodeaban.

### CORTOS-5 · El Ar−A tenía DOS constantes con dos operadores — ✅ **CERRADO 18/10/2026 (ARR5)**

`VENP_AR_A_MS` vale 30 con borde **`>=`** —criterio de la ASE/EACVI 2016, que pinta la fila de la
vena pulmonar y la celda del PDF— y `ASE_ARA_SUPL` vale 30 con **`>`**. Un Ar−A de **30,0 exactos**
es positivo para la fila y negativo para el paso suplementario, **en la misma pantalla**. No se
unificaron: son dos guías con el mismo número y distinto borde, y tocar `VENP_AR_A_MS` movería la
alerta de otro módulo.

### CORTOS-6 · `ASE_ARVEL_SUPL` queda declarada — ⚠️ **RE-MEDIDO 18/10/2026: NO está sin consumidor**

Es el corte de la amplitud de la Ar de la **prosa** del folio 555d (35 cm/s). No vota desde el
CORTOS6 y se nombra en el rótulo de la fila como salvedad. **No es una cadena viva sin dueño: es un
dato de la fuente**, y el día que Maicol vuelva al AND está ahí con su folio.

### CORTOS-7 · El importador CHM del Vivid no trae sexo, así que su aviso usa el corte más alto

`_chmPaciente` devuelve `sexo: ''` —ese formato no publica el sexo—, así que por esa vía el rango de
advertencia del diámetro AP sigue resolviéndose con el techo del varón, que es el lado que **nunca
avisa de más**. El SR DICOM sí trae `(0010,0040)` y resuelve bien.

### CORTOS-8 · Los seis hallazgos de Otros llegan al papel SÓLO por el informe narrativo

El PDF del informe y el PPT clínico imprimen `informe_texto` y `en_suma`, así que heredan las
frases nuevas por ese camino. **Lo que NO tienen es una fila propia** en la tabla de datos del PDF
ni una entrada en el PPT estadístico, y **ninguna columna de Excel** —que es lo que la orden pide—.
Un estudio exportado a Excel y reimportado **conserva los campos** (viajan en `campos`, no en el
libro), pero un backup hecho **sólo** con el Excel los pierde, igual que el resto de los campos que
no tienen columna.

### CORTOS-9 · El Laboratorio sigue sin contar las dos obstrucciones protésicas (era `PRO-C6`)

Ni la tricuspídea ni la pulmonar entran en la tabla de las ocho válvulas ni en el apilado: esa
tabla cuenta por el token del `<select>` de severidad, y estas dos no escriben uno. Sigue abierto y
esta tanda no lo movió.

### CORTOS-10 · Lo que TC-499 no puede medir

El **ancho de la ventana** —el cuerpo de un caso corre dentro de la página—, los **dos motores** y
el **ciclo de 20 aperturas** de la vista 2D con su conteo de nodos. Lo mide
`scripts/_probe_cortos.mjs`; las condiciones de maqueta del caso **declaran** el ancho en el que
corrieron. Es el reparto de TC-460.


---

## Tanda «Q» (2026-10-17) — DECLARADO y NO arreglado

### Q-1 · Tres parámetros de la insuficiencia aórtica no pueden llevar barra sin copiar su corte

Los cortes del **THP** (`>500` leve, `200-500` moderada, `<200` severa), del **reverso
telediastólico** (`≥20 cm/s`) y del **VTI de la aorta descendente** (`<15`, `<25`, resto) viven
como **literal dentro de `calcIA_ESC`** y no en una constante dueña, así que dibujarles una barra
obligaría a una segunda copia del corte — que es el defecto que este repo documenta cuatro veces.
Sus filas salen como **texto** y publican el corte igual, porque el badge que la app escribe ya lo
lleva adentro («Leve (>500ms)», «Severa (≥20 cm/s)»).

**Medido:** las otras cuatro filas de esa lesión (jet/TSVI, EROA, Vol-R y FR) tampoco tienen
constante, y sus cortes (10/30 para la EROA) están también en la cascada.

Salidas: **(a)** sacar los siete a una tabla `IA_CORTES`, con el patrón de `IM_CORTES` y sin mover
un número, y darles barra; **(b)** dejarlas como texto. Esta tanda eligió (b), porque extraer un
literal es tocar la cascada y esta orden no lo autoriza. La (a) es un trabajo de una tanda propia:
hay que medir que ni un grado se mueva en los dos regímenes.

### Q-2 · Los tres cortes de la estenosis pulmonar nativa no tienen folio verificado

El comentario de `EP_GMAX_NORMAL_MAX`, `EP_GMAX_LEVE_MAX` y `EP_GMAX_MOD_MAX` (9, 36 y 64 mmHg)
dice «(ESC/ASE)» **sin documento, sin tabla y sin página**. Por la regla de la casa —«verificada» =
texto completo leído, con documento, año, tabla y página— no están verificados, así que su tarjeta
**no publica línea de fuente**: inventarle una cita sería respaldar un corte con una fuente que
nadie abrió.

⚠️ **Y el piso de 9 mmHg es criterio propio de la app**, declarado como tal: la tarjeta lo muestra
como corte y **no escribe ningún «por qué»** (orden expresa, ese texto está sin aprobar).

Salidas: **(a)** verificar los tres en el original y declarar la fuente como dato, con el patrón de
`IP_CRIT_FUENTE`; **(b)** dejarlos sin cita y declarar el piso como criterio EcoSmart en la tarjeta,
con el texto que Maicol apruebe.

### Q-3 · La tarjeta de la función diastólica con la ASE 2025 en ritmo sinusal se desplaza por dentro

Ese algoritmo tiene **DIECISIETE** filas y la tarjeta mide más que el hueco: se desplaza **333 px**
por dentro, medido a 1200 × 900. Es lo que esa guía publica, y la ventana 🧭 sigue siendo el lugar
donde se ve entera con su diagrama. Las otras dos guías no desplazan (BSE 0 px, ASE/EACVI 2016
42 px).

Salidas: **(a)** dejarlo así —el `overflow:auto` de la tarjeta es para esto—; **(b)** partirla en
dos globos, como el L partió la del VI y su gráfico de geometría; **(c)** mostrar sólo los pasos
que el paciente recorrió, que es lo que el diagrama de la ventana ya hace. La (c) es la más
informativa y la que cambia más: hay que decidir qué pasa con un paciente que no llegó al paso 2.

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

### Q-5 · Los ocho globos nuevos suman hallazgos en `check_mobile.js`, y es el precedente de L y de M

`check_mobile.js` mide el rect del NODO **sin emular puntero grueso**, y `.vinfo-btn` mide
**16 × 12 px con el mouse y 44 × 44 con el dedo**, por su `@media (pointer: coarse)`. Es exactamente
lo que las tandas **L** (+3 ALTA) y **M** (+4 ALTA) ya declararon, y esta tanda agrega **nueve** en
la pestaña Válvulas más uno en el Doppler.

**No se agrandaron, y el motivo está medido:** a 390 px la pastilla de lesión mide 50 px y la
selectora 104, así que un globo de 44 px en la misma fila la dejaría por debajo de lo legible; y
apilado ya crece la fila 14 px con el mouse. El piso táctil real del dedo **sí** son 44 px.

### Q-6 · Tres textos fijos de más de dos líneas quedan en la pestaña Válvulas

Censados en el árbol vivo, con las cuatro morfologías protésicas puestas, a 1200 px (grupo `fijos`
de `scripts/_probe_qtarj.mjs`). **Sólo reportados: Maicol decide cuáles pasan a un globo ⓘ.**

| # | Tamaño | Dónde | Texto |
|---|---|---|---|
| 1 | 306 caracteres · 4 renglones | `bloque-prot-vt-res` < `campos-esten-tricuspide` | «Criterios: ASE 2024, Tabla 19. La estenosis protésica tricuspídea no se gradúa. La guía sugiere integrar varios parámetros y no fija una regla numérica: EcoSmart considera…» |
| 2 | 301 caracteres | `v2d-cuerpo` < `v2d-card` | «Esquema cualitativo: no está a escala y no mide. La apertura de cada válvula, el tamaño de los chorros y de las cámaras muestran sólo el grado que la aplicación ya publicó…» (sólo se ve con el panel prendido) |
| 3 | 135 caracteres · 2 renglones | `bloque-ea-detalle` < `caja-esten-aortica` | «Los valores se sincronizan automáticamente desde el módulo Doppler Aórtico. Si no fueron ingresados antes, ingresalós acá directamente.» |

El **1** es el candidato más claro: dice lo mismo que la nota de integración que la tarjeta de esa
prótesis ya publica, así que pasarlo a ⓘ **retiraría una duplicación** y no sólo prosa. El **2** es
una salvedad sobre el dibujo y pertenece a la vista 2D, que esta orden no toca. El **3** es una
instrucción de uso y no contenido clínico.

### Q-7 · Tres mapas quedaron cerca del techo

Medido con `wc -c` al cerrar: `vista-2d-valvulas.md` **34,0 KB**, `aortica-cortes.md` **33,9** y
`valvulas.md` **33,9** — los tres a poco más de 1 KB del techo de 35, y los tres sólo con el
puntero de esta tanda adentro. La próxima tanda que toque cualquiera de los tres conviene que lo
parta ANTES de escribir.

⚠️ **`diastolica.md` SÍ se partió, y había que hacerlo:** estaba en **35,2 KB**, o sea ya cruzado
desde el 2026-10-12. Su bloque de fibrilación auricular salió a `docs/mapa/diastolica-fa.md`
(6,6 KB) **verificado byte por byte con un `diff` contra HEAD**, y el mapa volvió a **30,4 KB**
antes de recibir el puntero.

---

# Tanda ARR (2026-10-18) — lo que queda declarado

### ARR-1 · `aortica-cortes.md` está a 1,1 KB del techo y NO se tocó

Mide **33.881 bytes** y el techo son 35 KB. El puntero del defecto de la aorta se puso en
`evidencia-derecho-aorta.md` (16,4 → 17,1 KB), que es el otro mapa que documenta `calcAorta` y
tiene margen. **La próxima tanda que necesite escribir en `aortica-cortes.md` tiene que partirlo
ANTES**, medido con `wc -c`.

### ARR-2 · El Ar−A de la ASE/EACVI 2016 aplica hoy el operador de la ASE 2025

Verificado en su propio original (hojas 13 y 20): esa guía escribe **`≥ 30 msec`**, así que el
`>=` de la fila de la vena pulmonar **era correcto para su fuente**. Unificar con el `>` de la
Figura 3 de la ASE 2025 es la decisión de Maicol y hace que un Ar−A de **30,0 exactos** deje de
alertar ahí. **Salidas:** (a) dejarlo como está y documentarlo —lo que se hizo—; (b) volver a dos
constantes, con la discrepancia del 30,0 exacto de vuelta; (c) que la fila declare en su rótulo
qué guía aplica.

### ARR-3 · La nota `*` de la Tabla 19 tiene una segunda mitad sin implementar

«Upper limits of normal DVI **vary by valve size and type**». La app aplica los dos cortes de la
tabla (≥3,3 bio y ≥2,1 mec) y **no tiene el tamaño de la prótesis**: no hay campo. Declarado y no
inventado.

### ARR-4 · La escala del test de burbuja no tiene fuente en la biblioteca

Censada entera (ver `FUENTES.md` → «La escala del TEST DE BURBUJA»). Se conservó la del módulo FOP
porque el Laboratorio la cuenta, porque tiene nombres de grado y porque es la antigua. **Salidas:**
(a) conseguir un documento que gradúe el paso de burbujas y citarlo; (b) dejar la escala sin
nombres de grado, sólo con el rango; (c) dejarlo como está, declarado.

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

### ARR-6 · Tres spans de módulos ajenos se quedan atrás en la recarga, no en el borrado

`vab-fr`, `ete-shunt-ddvii` y `pop-eco-src` aparecen en el grupo `pares` de la sonda en la
dirección **contraria** —el camino de borrado deja **más** limpio que la recarga— y son
**idénticos en los dos árboles**, así que no los trae esta tanda: la recarga tipea en otro orden y
esos módulos no se enteran. **Salida:** medirlos con su propia escena y, si corresponde, agregar
su `*Sync` a `RECALC_MODULOS`.

### ARR-7 · `vd-tam-card` no se mueve con la escena del censo de tarjetas

Su «volvió al texto de base» pasa, pero sin denominador propio: la carga del grupo `qtar` no
cambia su contenido. No arrastraba en ninguno de los dos árboles. **Salida:** darle una escena con
los tres diámetros del VD.

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

### ARR-9 · `check_mobile.js` sigue sin llegar al contenido de la pestaña Otros

Declarado en el CORTOS (CORTOS-10) y **no se cerró en esta tanda**: ampliar ese script para que
abra la pestaña Otros y las tarjetas del Q con emulación táctil es un trabajo propio, y lo que
esta tanda agrega a esa pestaña es un `<select>` con otros `value` y **un campo menos**.

---

# Lo que la tanda «P» declaró y NO tocó (2026-10-18)

### P-1 · Cinco tarjetas ⓘ sin entrada en Referencias

`tarj-insuf-pulmonar`, `tarj-esten-pulmonar`, `tarj-esten-tricuspide`, `et-avt-cont` y
`pul-balik` **no llevan botón «Ver referencia»**, y es porque la entrada que les correspondería no
existe: Referencias no tiene una entrada de **insuficiencia pulmonar**, ni de **estenosis
pulmonar**, ni de **estenosis tricuspídea**, ni de la **fórmula de Balik**.

Crearlas es escribir contenido clínico nuevo con su fuente verificada, que esta orden no autoriza.
**Lo que haría falta**, por entrada: el corte, su operador, la guía con folio y hoja, y la decisión
de si deriva del dueño o se transcribe. Para la de Balik, además, la fuente es la **ICM 2026**
(`icmPocus2026` en `FUENTES.md`), que ya está verificada: ésa es la más barata de las cuatro.

### P-2 · El censo de entradas se movió dos veces dentro de la tanda, y está declarado

| momento | entradas | por qué |
|---|---|---|
| al empezar y tras el commit 1 | **30** | la reubicación no pierde ninguna |
| tras el commit 5 | **31** | entra «Aorta — Umbrales de cirugía» |
| tras el commit 6 | **30** | sale la vieja del VD (`ref-vd`, ASE 2015) |

Lo que P1 pide —que la **reubicación** no pierda ninguna— se cumplió con 30 → 30. Los otros dos
movimientos son contenido autorizado por P5 y P6.

### P-3 · La Figura 24 publica un tramo que la tabla de cirugía no tiene

El algoritmo de la **Figura 24 (folio 76)** de la ESC 2024 da, para 50-52 mm con fenotipo
ascendente y **sin** características de riesgo alto, «Cirugía si riesgo operatorio bajo (**Clase
IIb**)». La **Tabla 68** —que es la que lleva clase y nivel y la que la app aplica— no publica ese
tramo, y `vabConclusion` tampoco. **No se escribió.**

Decidir: (a) dejarlo así —la tabla publica las tablas de recomendaciones y lo declara—; (b)
agregar la fila citando la figura, que es un diagrama y no una tabla de recomendaciones; (c)
implementarlo en `vabConclusion`, que es mover una conducta.

### P-4 · Los umbrales de `vabConclusion` siguen siendo literales

Los cinco viven escritos a mano dentro de esa función, y la tabla de Referencias los **sondea** en
vez de copiarlos —así no hay una segunda copia y la divergencia se ve en pantalla—. Lo que no hay
es una constante dueña.

**No se extrajo a propósito**: `vabConclusion` escribe el informe firmado, y esta orden prohíbe
tocar un cálculo. Si alguna vez se extrae, la tabla debería pasar a leer la constante y el sondeo
quedaría como centinela.

### P-5 · «Otros hallazgos» es el cajón, y `formulas` cayó ahí

La entrada **«Fórmulas — Cálculos Ecocardiográficos y Hemodinámicos»** no es una dimensión, ni una
función de una cámara, ni una válvula, ni la aorta: quedó en «Otros hallazgos», con su propio
rótulo de bloque. Es el cajón que la propia orden prevé.

⚠️ **Y esa entrada tiene números tipeados que NO coinciden con sus dueños**, censados y **no
tocados** porque son contenido clínico: publica **«TAPSE/PSAP … >0.32 mm/mmHg»** cuando el dueño de
la pantalla corta en **0,55** desde la tanda Z, y **«Relación VD/VI … <0.9»** cuando `VD_VI_HTP_MIN`
corta en **1,0** desde el G1. Las dos son filas de una tabla de fórmulas, no de cálculo, pero las
dos contradicen a la app. Decidir si se derivan del dueño o se retiran.

### P-6 · La entrada `ref-vi` (ASE 2016) quedó en Dimensiones y tiene dos mitades

Su primer bloque es la **geometría** del VI (masa, RWT, los cuatro cuadrantes) y el segundo la
**disfunción diastólica de la ASE 2016**. Se la puso en **Dimensiones** porque es la única que
nombra el **RWT**, que es lo que el buscador tiene que encontrar junto a `vi2`.

Decidir: (a) dejarla ahí; (b) partirla en dos entradas, una por subpestaña —lo que cambia el censo
y obliga a adaptar TC-502—; (c) moverla entera a Función, con lo que «RWT» dejaría de salir en
Dimensiones.

### P-7 · El botón «Ver referencia» puede sumar un hallazgo en `check_mobile.js`

Es un `<button>` dentro de `#vinfo-card`, que `check_mobile.js` **no abre** —la tarjeta nace
cerrada y lo que está en `display:none` no tiene geometría—, así que hoy no entra en la cuenta.
El día que ese script aprenda a abrir las tarjetas ⓘ, los 39 botones aparecerán. Es el mismo
precedente que **Q-5**, **L-10** y **M-10** ya tienen escrito.

---

## Tanda Y3d (2026-10-19) — declarado y NO tocado

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

### Y3d-2 · Las seis tarjetas ⓘ de la VAB no tienen entrada en Referencias

`VINFO_REF` mapea 39 de las 50 claves; las **once** que quedan sin botón «Ver referencia» son las
cinco que ya estaban (`et-avt-cont`, `pul-balik`, `tarj-esten-pulmonar`, `tarj-esten-tricuspide`,
`tarj-insuf-pulmonar`) y las **seis de la VAB**. El motivo es el mismo: **Referencias no tiene esas
entradas**, y crearlas sería contenido clínico nuevo que esta orden no autoriza. Lo fija TC-502
(C3) como límite declarado. **Decidir:** crear una entrada de Referencias para la VAB —con su
tabla y su folio— o dejarlo.

### Y3d-3 · Las fuentes de los criterios TEER no están en la biblioteca

**Censada entera:** no hay **EVEREST II** (Eur Heart J 2010;31(11):1382-1389 · PMC2878966) ni el
protocolo **EXPAND** (NCT03502811). Los tres cortes que esta tanda cablea —flail gap `<10 mm`,
ancho del flail `<15 mm`, longitud de coaptación `≥2 mm`— son **los que la app ya aplicaba**: el
valor no se movió, lo que cambió es a qué campo y con qué operador. Por eso las filas **no llevan
línea de fuente**. El día que alguno de esos dos PDF entre a la biblioteca, hay que verificar los
tres contra su tabla y recién entonces citarlos.

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

### [CERRADO 2026-10-20 · Y3e3] Y3d-5 · «Senos asimétricos» no estaba definido en ninguna fuente

✅ **CERRADO el 2026-10-20 (Y3e3) por una salida que esta entrada no ofrecía: la simetría SÍ
está definida en la fuente, y lo que no estaba definido eran los SENOS.** El consenso la define
por el **ángulo entre las comisuras de la cúspide no fusionada** (folio 225, hoja 7) y publica
**tres** categorías con su punto medio (pie de la Figura 9, folio 230): simétrica 160-180° (≈170),
asimétrica 140-159° (≈150) y muy asimétrica 120-139° (≈130). La app pasa a decir **«cúspides»**,
el selector gana la tercera categoría y el dibujo abre la V de cierre al ángulo que corresponde.
⚠️ **Y la fuente acota las categorías a los tipos FUSIONADOS**, así que el 2-sinus dejó de
representar una asimetría que nadie define para él.

### Y3d-6 · Seis hallazgos ALTA y seis MEDIA nuevos en `check_mobile.js`, con causa medida

La cuenta pasa de **53 / 62 con 11 ALTA** a **65 / 74 con 17 ALTA**, y con `--todo` de **389 / 398**
a **394 / 403**. Medido contra el árbol base **el mismo día**, el delta se explica entero:

| delta | qué es | medido |
|---|---|---|
| **+6 ALTA** | los seis botones ⓘ nuevos (`button.vinfo-btn`) | **16 × 12 px con el mouse y 44 × 44 EXACTOS con el dedo**, por su `@media (pointer: coarse)`. `check_mobile.js` mide el rect del nodo **sin emular puntero grueso**: es el precedente de **L-10**, **M-10** y **Q-5** |
| **+6 MEDIA** | las seis casillas de factor de riesgo | el cuadradito mide **13 × 13** y la **etiqueta clicable 328 × 14 px** a 390 px: ancha y **baja**. Es el mismo patrón que las ~50 `input.ind-chk` del panel de Evidencia |
| **−7 BAJA** | los **seis `<select>`** de factor de riesgo que se retiraron (hoy son `input[type=hidden]`, sin geometría) y **`vab_morf_ro`**, que pasó a `display:none` | −6 y −1 |

**No se agrandó ninguno de los doce**, y el motivo es el mismo en los dos casos: el piso de 44 px
desplazaría la fila —lo que la orden prohíbe en la grilla de dos columnas de tres— y el ⓘ ya tiene
sus 44 px donde importa, que es con el dedo.

### [CERRADO 2026-10-20 · Y3e4] Y3d-7 · `tests-fichas.md` quedó en 28,9 KB

✅ **CERRADO el 2026-10-20 (Y3e4): se partió ANTES de escribir y no después.** Medido con
`wc -c` antes de tocarlo: estaba en **28,9 KB** y la ficha de TC-505 lo cruzaba. Las fichas de
**TC-499 a TC-501** salieron a `docs/mapa/tests-fichas-499-501.md` (15,6 KB) y el archivo de
origen volvió a **14,2 KB** antes de recibir la ficha nueva; con ella quedó en **19,0 KB**. Es la
cuarta partición de este archivo y la segunda que se hace a tiempo.


---

## Tanda Y3e (2026-10-20) — lo declarado y no tocado

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

### Y3e-3 · El `d` del cierre nombra los mismos dos puntos en orden inverso, sin categoría

En la R-L y en la L-N, con el selector vacío, el atributo `d` de la V de cierre pasó a listar sus
dos extremos en orden ascendente donde antes salían en el orden en que la tabla los tenía. **El
dibujo es idéntico** —verificado por el hash del data URL que viaja al PDF, igual en los cuatro
tipos—, así que es un A/B sobre el atributo el que informa una diferencia que el píxel no tiene.
Se deja la regla consistente en vez de replicar la inconsistencia anterior.

### Y3e-4 · El ángulo de la fusión L-N sale con un decimal (170,1 · 150,1 · 129,9)

Es el redondeo a un decimal de las coordenadas (`r1` en `vabGeom`), no un error de la tabla: su
centro cae en −90° y los dos extremos quedan en posiciones cuyo redondeo mueve el ángulo
reconstruido 0,1°. Es un **esquema**, no una medición, y ningún texto de la app afirma un ángulo
de este paciente. **Decidir:** si conviene subir la precisión de `r1` a dos decimales, lo que
movería el `d` de **todos** los dibujos de la zona.

### Y3e-5 · Las dos fuentes de los criterios TEER siguen sin estar en la biblioteca

Sin cambios respecto de **Y3d-3**: no hay EVEREST II ni el protocolo EXPAND. Esta tanda **no
movió ningún corte** del TEER ni del COAPT —los cuatro bordes están medidos—, así que las filas
siguen sin línea de fuente por el mismo motivo.

### Y3e-6 · TC-323 es un inestable por orden de corrida más

Salió rojo en una corrida de zona de 28 casos y **verde corrido solo** sobre el mismo árbol, con
una condición («`_indIM` sigue sin corchete propio») que esta tanda no toca. Se suma a la lista
de `CLAUDE.md`: TC-137, TC-246, TC-249, TC-252, TC-260, TC-395 y TC-GR-06.

---

## Tanda Y3f (2026-10-20) — lo declarado y no tocado

### Y3f-1 · Un estudio guardado con `vab_funcion` tipeado a mano reabre con lo que sus GRADOS dicen

Desde el Y3f3 la función valvular de la VAB se **deriva** de los grados de EA y de IAo, así que la
celda del Excel y el campo oculto de un estudio archivado se recalculan al leerlo. Un estudio
anterior cuyo médico hubiera elegido una función **distinta** de la que sus grados implican sale
hoy con la derivada. **No se migró ningún registro**: lo que se reescribe es la celda derivada, no
el disco. **Decidir:** (a) dejarlo —la derivada es la que no puede contradecir a Válvulas—;
(b) conservar el valor guardado cuando exista y derivar sólo si falta, que reabre la posibilidad de
que la sección diga una función y el cuadro de al lado otra.

### Y3f-2 · La compuerta de «normofuncionante» es «la VÁLVULA tiene datos» y no «IAo con grado cero»

La orden decía «IAo con grado calculado cero». **Medido en el archivo: ese estado es inalcanzable**
—la cascada de `calcIA_ESC` sólo emite `'1'`, `'2'` y `'4'` y deja `null` cuando no hay nada que
graduar—, así que la regla literal se anularía a sí misma y la coletilla no saldría nunca. Se usó
«la válvula tiene datos», que es el estado en el que el informe ya dice «sin estenosis ni
insuficiencia» (medido). **Decidir:** si «normofuncionante» tiene que exigir además que la EA esté
explícitamente en «sin estenosis», que hoy entra por el mismo camino.

### Y3f-3 · `VAB_INF_FENO` dice «no coronaria» y el selector dice «no coronariana»

Las dos formas conviven: el informe firmado escribe «fusión derecha-no coronaria» y la `<option>`
del tipo de fusión dice «no coronariana». **No se tocó**: es una palabra de una frase clínica del
informe firmado y de un rótulo que el médico eligió, y esta orden sólo autorizaba traducir
«fused type». La fuente —el consenso, folio 232— usa **las dos** en la misma página («la cúspide
«no coronaria»» en el pie de la Figura 11 y «la cúspide no coronariana normal» dos líneas después),
así que ninguna está mal. **Decidir:** cuál de las dos queda.

### Y3f-4 · El `<input type=range>` del scrub de la animación no tiene equivalente por teclado propio

Es un `range` nativo, así que las flechas lo mueven y el foco lo alcanza: la accesibilidad básica
está. Lo que **no** tiene es un rótulo que anuncie la fase en palabras mientras se arrastra —el
dibujo cambia y el lector de pantalla sólo oye el número del `range`—. **No se agregó** un `aria`
en vivo: un atributo que se desincroniza miente con más convicción que no tenerlo, y esta orden no
pedía el anuncio. **Decidir:** si la fase debería publicarse en un `aria-valuetext` derivado del
mismo `vabAnimFrac` que dibuja.

### Y3f-5 · `informe-pdf-excel.md` quedó a 1 KB del techo

**33.973 bytes** de los 35.000, medido con `wc -c` DESPUÉS de escribirle su puntero de doce líneas.
Es el mismo lugar en el que estuvo `panel-evidencia.md` antes de cruzar dos veces. **La próxima
tanda que lo toque tiene que partirlo**, y el corte natural es el bloque de la importación, que ya
salió una vez a archivo propio (`importacion-excel.md`) y podría llevarse también la exportación.

### Y3f-6 · La animación no está conectada a ninguna superficie firmada

`vabAnimPintar` dibuja sólo en pantalla: el PDF sigue llevando el **dibujo estático** en la vista
que el Y3f7 corrigió, y no hay captura de la animación en ningún lado. Es lo conservador —una fase
intermedia en un papel firmado afirma una apertura que nadie midió— y es lo que la orden pedía.
**Decidir:** si el papel debería llevar el cuadro de **apertura máxima**, que es el que el pie de
la Figura 13 llama «la vista con que se diagnostica».

### Y3f-7 · El censo de textos de conducta y de datos faltantes está hecho y NO se cambió ninguno

`docs/censo/textos-conducta.md`: **248 textos listados** —**73 de conducta y 175 de datos
faltantes**, más **3 descartados** por ser fragmentos de código y no textos—, cada uno con su
texto exacto, su función, su área y por dónde sale.
⚠️ **EL RESUMEN DE ESE CENSO DECÍA 76 / 251 Y SUS FILAS SON 73 / 248**: lo escribí antes de
contarlas. Se corrigió contando con un barrido sobre el archivo, y quedó anotado ahí mismo.

**Es una lista, no un cambio**: la orden lo pedía así. **Decidir:** cuáles se unifican,
porque el censo deja a la vista que el mismo estado se declara con redacciones distintas según el
módulo que lo escriba.

---

## Tanda «R2» (2026-10-21) — lo declarado y NO tocado

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

### R2-2 · El «índice cardiaco bajo ≤ 2,2» no tiene fuente verificada en la biblioteca

El rango **normal 2,5-4,0** sí está verificado (ESC/ERS 2022, Tabla 10, folio 28). El **«bajo
≤ 2,2»** sale del consenso SAC 2024, y **ese documento NO está en la biblioteca** —censada entera
buscando «SAC», «Sociedad Argentina de Cardiología» y «consenso»: cero—.

**No se inventó folio.** El corte es el que la app ya aplicaba, el ⓘ lo declara como tal, y el valor
**no se movió**: lo único que cambió es que el 2,2 exacto pasó de «límite» a «bajo».
**Decidir:** conseguir el documento o declarar el corte como criterio de EcoSmart.

### R2-3 · El borde del índice cardiaco se compara contra el valor CRUDO y la pantalla imprime dos decimales

`_icBanda` recibe el IC sin redondear y la cápsula lo publica con `toFixed(2)`. Así que un IC real
de **2,204** se imprime «2.20» y la banda dice **«bajo»**, que es lo correcto por la cuenta y se lee
como si el 2,20 impreso estuviera del lado bajo del corte — que en ese caso lo está, pero por una
razón que el número impreso no muestra.

Es el mismo precio que la PAP diastólica de la función diastólica ya paga, y es el lado conservador.
**Decidir:** si el borde debería mirar el valor redondeado, que es el que el médico ve.

### R2-4 · La advertencia de la ASE 2025 sobre la PCP y la RVP estimadas NO se agregó

Por orden expresa. Los rótulos sí declaran que son **estimaciones por eco**, con su autor (Nagueh y
Abbas), en la cápsula, en los perfiles, en la clasificación pre/postcapilar y en Forrester.
**Decidir:** si además hace falta la salvedad de la ASE 2025 sobre la confiabilidad de esas dos
estimaciones.

### R2-5 · El Forrester no se tocó, y éstos son los cortes que usa hoy

**Medido, sin cambiar nada:** `FORR_IC_CORTE = 2.2` para la columna frío/caliente y
`UMBRAL_PCP_HUMEDO = 15` para húmedo/seco. Los cuatro perfiles salen de
`(!frío && !húmedo) → I · (húmedo && !frío) → II · (frío && !húmedo) → III · resto → IV`.

⚠️ **EL 2,2 DEL FORRESTER Y EL 2,2 DEL ÍNDICE CARDIACO SON EL MISMO NÚMERO Y NO LA MISMA REGLA**: el
Forrester corta con `<` estricto y la banda del IC con `<=`. Eso era deliberado desde antes de esta
tanda y **no se unificó**: son dos preguntas distintas sobre el mismo valor.
**Decidir:** si el borde del Forrester también debería incluir el 2,2.

### R2-6 · El pulso pulmonar sigue sin existir

Por orden expresa: entró el **punto pulmón** y el pulso pulmonar no. **Decidir** si se agrega.

### R2-7 · La atribución «ESC 2021» quedó en otras zonas, que esta orden no toca

Las **diez** apariciones de la zona de **amiloidosis** se corrigieron a «García-Pavía 2021». Quedan,
censadas, en zonas que esta orden excluye:

| zona | dónde |
|---|---|
| **Válvulas** (Referencias) | los títulos de las tarjetas de IM, IAo, IT, prótesis aórtica y prótesis mitral, más «Indicaciones IM primaria (ESC 2021)» y el pie «ESC 2021 · VARC-3» |
| **Aorta torácica** | los umbrales de los tres segmentos y la tabla de dilatación del informe |
| **Insuficiencia cardíaca** | `EV_GUIA_ESC2021IC` y su línea de fuente, que **sí** es una guía ESC 2021 real y está bien atribuida |

⚠️ **LA DE INSUFICIENCIA CARDÍACA ESTÁ CORRECTA Y NO HAY QUE TOCARLA**: ahí «ESC 2021» sí nombra una
guía de práctica clínica. Las de válvulas son el caso dudoso: `FUENTES.md` **no registra ninguna
guía valvular ESC 2021**, y eso ya está declarado en este archivo desde el 2026-10-03.

### R2-8 · `informe-pdf-excel.md` sigue a 1 KB del techo y NO se tocó

Está en **34,0 KB** y la regla pide partirlo. Esta tanda **no le escribió nada** —el Excel no gana
columnas, así que no hacía falta puntero— y por eso sigue sin partirse. El mapa de la tanda nació a
archivo propio (`tanda-r2-correcciones.md`, 19,6 KB) justamente para no tocarlo.
**La próxima tanda que lo toque tiene que partirlo.**

### R2-9 · Las conductas de la columna «Acción» no quedaron en ninguna superficie, y está medido

La orden pedía comprobar si los textos de esa columna aparecían además en el informe, el PDF o el
EN SUMA. **Censado: no.** Las únicas apariciones de «Suspender» que quedan en el archivo son mi
propio comentario del commit y la función `autosaveSuspender`, que es otra cosa. «Cardioprotección»
queda **sólo** en la nota del nivel de riesgo (`alto: 'Monitoreo intensificado recomendado…'`), que
es otra fila y la orden no la nombra.
**Decidir:** si esa nota del nivel de riesgo, que también es una conducta, sale por el mismo
criterio de producto.

### R2-10 · Me comí el acento grave 54 veces, y la mitad el script no las alcanza

Todas en comentarios míos dentro del cuerpo de un caso o del template de una sonda, nombrando una
función o un atributo en prosa — que es como el resto del archivo lo escribe.
`scripts/check_backticks.py` da la línea exacta en el cuerpo de un `caso(...)`; **no alcanza el
template de una sonda**, y ésos los dio `node --check`, apuntando a la apertura del template
cientos de líneas antes. **Correr los dos, siempre.**

### R2-11 · Una nota con acentos graves dentro de `ECO_AYUDA` corrompe el manual sin romper el parseo

Puse un comentario `<!-- -->` dentro del HTML de la tabla de criterios declarados, que vive en un
**string** de `ECO_AYUDA`, con dos acentos graves adentro. **Cero errores de sintaxis y cero
errores de consola**, y la suite completa con **SIETE** casos en rojo: TC-123 y TC-149 —que cuentan
las pestañas y las clases `m*` del manual— y **TC-298, TC-307, TC-333, TC-335 y TC-468**, que
buscan su propio texto en `ECO_AYUDA` y son de la **mitral** y de **válvulas**, zonas que esta tanda
no toca.

**Dos cosas que hay que saber:** `ECO_AYUDA` es un string que el armador del PDF **aplana por
regex**, así que un comentario HTML ahí dentro le mueve el conteo de páginas; y una nota de código
no va dentro del manual, va **al lado del dueño del dato**.

**Decidir:** si conviene un chequeo de arranque que falle cuando `ECO_AYUDA` contenga un `<!--`,
que es una línea y cerraría esto por construcción.

⚠️ **Y DOS TRAMPAS DE MÉTODO QUE ESTA TANDA PAGÓ:**
- **Un `assert` que falla en un script de edición NO APLICA NADA**, porque la escritura va al final
  — y el paso siguiente informa «SINTAXIS OK» sobre un archivo sin los cambios. Pasó **dos veces**
  (el comentario de la dosis y el bloque de líneas B, los dos por anclar a un fragmento que no era
  único o tenía otra sangría). **Verificar con `grep` que la edición quedó.**
- **Un `grep -c` que devuelve 0 sale con código 1 y corta una cadena `&&`**: el cierre del commit 9
  se quedó sin Semgrep ni `git commit` por eso, con la edición ya aplicada en el árbol.

---

### B-1 · El prompt decía «9 → 5» botones arriba y el conteo real es «10 → 6»

**Medido:** la fila de arriba tiene hoy **10** botones —7 en `.tabs-special` y 3 en
`.tabs-tools`— y queda con **6**. La diferencia es **Amiloidosis**, que vive en esa fila y que
este trabajo **no mueve**. La corrección del médico del 21/10 lo confirmó y manda el conteo
medido. **No hay nada pendiente**: queda escrito para que el próximo que lea el prompt original
no vaya a buscar un botón que falta.

⚠️ Y de paso: `.tabs-lab-wrap` tiene CSS y **no existe en el marcado** —sólo `applyViewMode` lo
busca y recibe `null`—. El botón del Laboratorio vive en `.foot-actions`, al pie. Es inofensivo,
y si alguna vez se quiere una fila para el Laboratorio ahí está la regla esperándola.

### B-2 · «Pericardio y masas» sigue en una sola columna, y el rediseño es otro prompt
> ⚠️ **SIGUE ABIERTO tras el B2 (2026-10-22), y es una orden expresa de esa tanda:** «NO rediseñes
> el contenido de Pericardio y masas (el diseño en tres columnas es otro trabajo)». Lo que el B2
> sí cambió es dónde vive la pantalla —apilada con el eco pulmonar, detrás del botón
> «Pericardio y pulmón»— y el mapa de la zona pasa a ser
> `docs/mapa/pestanas-reorganizacion.md` §12.

La pestaña nueva lleva el contenido **tal cual**: los mismos once campos en la misma disposición
y con el mismo acordeón interno. La orden lo pide así —«NO rediseñes su contenido ni lo pases a
tres columnas: es otro prompt»—. Cuando se haga ese rediseño, el mapa de la zona es
`docs/mapa/pestanas-reorganizacion.md` §1 y el de su contenido clínico
`docs/mapa/otros-pericardio-pulmon.md`.

### B-3 · El acordeón interno de cada sub-pestaña es redundante y no se tocó
> ✅ **CERRADO POR LA MITAD el 2026-10-22 (B2-E1 y B2-E3), por la salida (b) de hecho.** Las
> sub-pestañas de Otros **ya no existen**: sus dos secciones quedaron apiladas, cada una con su
> barra, así que el doble nivel —botón de sub-pestaña más acordeón— se fue. Lo mismo en
> «Pericardio y pulmón», que es una pantalla con dos barras y no dos pestañas. **Lo que sigue
> abierto es el acordeón en sí**: el médico entra a la pantalla y tiene que abrir la sección. Las
> dos barras nacen cerradas a propósito —es el estado inicial que la orden del B2 fija, el mismo
> de las de Hemodinámica—, así que abrir una sola al entrar sigue siendo decisión de Maicol.

El médico entra a «Test de burbuja» y tiene que abrir «Test de burbuja». Lo mismo en
«Variantes anatómicas» y en «Pericardio y masas». Abrir la sección sola al activar la
sub-pestaña sería un **cambio de conducta** que esta orden no autoriza, y el estado plegado lo
gobiernan `toggleEteSeccion` y `secAutoOpen`, que no se tocan. Las dos salidas:
(a) que `otrSubTab` abra la sección de su panel si está cerrada;
(b) retirar el acordeón de las secciones que hoy son la única de su sub-pestaña.
Las dos cambian cuántos gestos hace el médico, así que las decide Maicol.

### B-4 · El informe no dice de qué hemitórax es el derrame cuando sale del módulo AVANZADO sin lado
> ✅ **CERRADO el 2026-10-22 (B2-E2).** Ya no hay dos redacciones conviviendo: los dos módulos se
> unificaron en una pantalla y el único emisor es `pulAvFrases`. El lado sale de
> `pua_derrame_lado`, que **ganó el estado «— sin consignar —»** y cuya cláusula se OMITE cuando
> está vacío, en vez de caer en «bilateral» por el valor de fábrica. O sea que el informe ya no
> afirma un hemitórax que nadie consignó, que es la mitad que faltaba.

El básico ganó su selector de lado en el CORTOS12 y el avanzado tiene `pua_derrame_lado` con
«bilateral» por omisión, así que ahí el lado **siempre** sale. No es un pendiente del trabajo B
—no se tocó ninguno de los dos— pero queda anotado porque las dos redacciones conviven en el
mismo informe: el básico escribe «derecho» y el avanzado «unilateral derecho».

### B-5 · Los tres textos de ayuda de la app no nombran la organización nueva

Censado: `ECO_AYUDA` describe las pestañas por su nombre y algunas de esas descripciones quedaron
viejas —«la pestaña Otros», «el botón Eco Pulmonar»—. **No se tocaron**: `ECO_AYUDA` es un
string que el armador del PDF aplana por regex, y el R2-11 ya documenta que una edición
descuidada ahí corrompe el manual y pone en rojo casos de otras zonas **sin romper el parseo**.
Es una tanda propia, con su medición del conteo de páginas del PDF.

### B-6 · El rail a 768 px y por debajo sigue escondiéndose, y el drawer es la única puerta

Es **preexistente** (`@media max-width:768px { .rail{display:none!important} }`) y este trabajo no
lo cambia. Lo que sí cerró es que el drawer respete `data-mod`, que era un agujero NUEVO que el
pulmonar en el rail abría. Con doce botones el drawer sigue entrando; si alguna vez no entrara,
el rail de escritorio ya tiene `overflow-y:auto` y se desplaza solo.

> ⚠️ **ACTUALIZADO el 2026-10-22 (B2-E1): son ONCE botones y ninguno lleva `data-mod`.** El
> gateado del drawer por `style.display` **se conserva** —sigue siendo correcto y es lo que
> protege a cualquier botón que gane un `data-mod` mañana— pero hoy no filtra nada: medido, las
> dos listas son idénticas en Básico y en Avanzado.

---

# Tanda «C» — el TEP (2026-10-21)

> El score de sobrecarga aguda del VD con el TAPSE a `< 16`, la PSAP desde 35, el 0,32 afuera y
> el rótulo del VD/VI en 1,0; pantalla e informe con la misma regla, sin clases de riesgo y sin
> la Salvedad del PDF; la ficha de Referencias con cada criterio y su folio; y la Evidencia del
> TEP por la Tabla 8. Mapa: `docs/mapa/tep-score.md`.

### C-1 · El rótulo del score dice «(+/7)» y los criterios que cuentan son SEIS

La fila publica «Score criterios VD **(+/7)**» y el span escribe «5/5 criterios positivos»: el
rótulo afirma un denominador de siete y la celda de al lado publica otro. Los criterios que
suman son **seis** (VD/VI, TAPSE, PSAP, McConnell, 60/60 y tabique en D); el séptimo renglón de
la tabla es el cociente TAPSE/PSAP, que **no vota** —y desde esta tanda tampoco tiene corte—.

Es **preexistente** y esta orden no lo nombra, así que **no se tocó**. Es un rótulo, no un
cálculo: ningún veredicto depende de él.

**Qué haría falta:** cambiar el literal por «(+/6)», o derivarlo del número de criterios que
`calcTEP` empuja a `criterios`, que es lo que ya cuenta el denominador del span.

### C-2 · La PSAP se lee REDONDEADA, así que el corte de 35 se cruza por el redondeo

`calcPSAP` escribe `psap_calc` con `(4·VRT² + PmAD).toFixed(0)`, y el criterio lee ese campo. Una
PSAP real de **34,6 mmHg se lee 35 y ahora cruza** el corte; una de **35,4 se lee 35 y también**.
Es el mismo hueco que **P1** declara para el criterio de la función diastólica, con el operador
dado vuelta: desde que el corte es `>=`, el redondeo empuja hacia el lado que AFIRMA.

No se tocó: exponer la PSAP sin redondear cambia lo que leen los otros nueve consumidores de
`psap_calc`, y eso es otro trabajo. **Medido**: las tres escenas de TC-510 se paran en 34, 35 y
36 enteros a propósito, para que el borde se pruebe sobre el valor que el criterio ve.

### C-3 · El informe no publica el cociente cuando falta el TAPSE o la PSAP, y es correcto

La línea «Índice TAPSE/PSAP N mm/mmHg.» sólo sale con los dos cargados, porque el predicado es
`(tapse && psap)`. Queda dicho para que no se lea como una pérdida: sin uno de los dos no hay
cociente que publicar.

### C-4 · «Troponina elevada» ya es una columna del Excel, y es de amiloidosis

La columna existe desde antes y **no** tiene nada que ver con el cuestionario de Evidencia del
TEP, cuyas respuestas no se guardan con el estudio. Queda anotado porque un control que la filtre
como «columna nueva de TEP» sale rojo sobre un libro perfecto — le pasó a la primera versión de
(I6) de TC-510.

### C-5 · La guía se contradice consigo misma en el operador del VD/VI

La **Figura 3 B** (folio 497.e15) escribe `VD/VI > 1,0` y el **cuerpo del folio 497.e17** escribe
`≥ 1,0`. La app aplica el del cuerpo, que es el que **no suaviza** y el que el R7 ya había
elegido. Los dos textos están impresos y la discrepancia está declarada en
`IND_REFS.escTep2019`. **No se cambió nada**: es contenido clínico.

### C-6 · `scripts/check_backticks.py` NO alcanzó el cuerpo de TC-510

El script dio **«OK — sin acentos graves dentro de los cuerpos»** con **cuatro** acentos graves
dentro del cuerpo de TC-510, y los cazó `node --check` con su `SyntaxError: missing ) after
argument list`. El cuerpo de ese caso empieza con `return (async () => {`, que es la forma que
usan varios casos recientes; no se investigó si es eso lo que lo saca de su cobertura.

**Mientras tanto:** correr **los dos**, y para un caso nuevo contar los acentos graves del cuerpo
a mano (`s[i:j].count` entre el primer y el último acento grave del `caso(...)`).

### C-7 · El informe conserva sus frases descriptivas, y no son clases de riesgo

El narrativo publica «Disfunción VD significativa…», «Disfunción VD con N criterios positivos…»,
«Criterio aislado de disfunción VD…» y «Sin criterios ecocardiográficos de disfunción VD…».
**Ninguna es una clase de la Tabla 8** y esta orden no las nombra, así que no se tocaron. Lo que
salió —«Riesgo INTERMEDIO-ALTO» y «Riesgo INTERMEDIO-BAJO»— vivía **sólo** en el span de la
pantalla, y de ahí lo copiaba la hoja del PDF.

### C-8 · La sección de Evidencia del TEP no entra en los mapas de TC-273

`EVID_DATOS` y `EVID_FNS` son dos mapas **fijos de trece** que TC-273 recorre, así que la sección
nueva **no** se cuenta ahí. Sí la recorre **TC-322**, que itera `IND_SECS` —por eso su
denominador la nombró— y la cubre **TC-510** por sus siete ramas.

**Qué haría falta:** agregarle su entrada a los dos mapas y adaptar el texto de TC-273, que dice
«las trece secciones». No se hizo para no mover un caso que esta orden no nombra.

---

# Trabajo «B2» — las correcciones de la reorganización (2026-10-22)

### B2-1 · El Modo Básico GANA el eco pulmonar, y es el lado conservador de una incompatibilidad

**Medido en HEAD antes de tocar nada:** en Modo Básico el rail mostraba **11** botones
—«Pericardio y masas» **sí**, «Eco pulmonar» **no**— porque el botón del pulmonar llevaba
`data-mod` y `applyViewMode` lo escondía. Con **un solo** botón para las dos pantallas, las dos
opciones son incompatibles:

- dejarle el `data-mod` → en Básico desaparece el botón **y con él «Pericardio y masas»**, que el
  médico hoy sí ve: pierde campos;
- quitárselo → en Básico aparece también el eco pulmonar, que hoy no ve: **gana** una pantalla.

Se eligió la segunda, que es la que **no le quita nada a nadie**, y además repara algo que el B
había causado sin decirlo: hasta el B el módulo pulmonar **básico** vivía en «Otros» (sin
`data-mod`) y el Básico lo veía; al mudarlo a una pestaña gateada, el B se lo quitó.

**Lo que se pierde es un CONTROL, no un campo:** `pulmonar` salió de `EE_MODULES`, así que ya no
hay casilla en Config para apagar el eco pulmonar. Si Maicol quiere recuperarla, hay dos salidas:
(a) un `data-mod` nuevo sobre un `<button>` propio dentro de la pantalla, que gatee **sólo** la
barra pulmonar (hay que escribir esa sincronía: `applyViewMode` escribe `style.display` sobre el
botón, no sobre una sección); (b) volver a partir el botón en dos, que es deshacer este trabajo.

### B2-2 · `pul_derrame_tam` y `pul_consol_nota` conservan su prefijo `pul_` en una pantalla de `pua_`

Son los dos campos que el módulo básico tenía y el avanzado no, así que **no hay contraparte a la
que traducirlos**. Conservar su id es lo conservador —un estudio guardado los abre solo, sin pasar
por ninguna migración— y el precio es que la pantalla unificada tiene dieciocho ids `pua_` y dos
`pul_`. Renombrarlos obligaría a migrar en memoria dos valores que hoy no necesitan nada.

### B2-3 · El valor «no» del módulo básico no se traduce, así que un estudio que lo tenía queda «no evaluado»

**Es deliberado y es la decisión de fondo de la migración.** Los tres selects del básico nacían en
`'no'`, así que ese valor lo trae **cada** estudio guardado, lo haya mirado el médico o no:
traducirlo pondría los tres primarios del avanzado en «no» y todo informe anterior pasaría a
publicar «Sin derrame pleural. Sin líneas B. Sin consolidaciones.» — tres negaciones que nadie
evaluó, en un informe firmado. **Consecuencia declarada:** un médico que de verdad miró y anotó
«no» pierde esa constancia al reabrir. La app nunca publicaba esa negación desde el básico (sólo
emitía con hallazgos positivos), así que **ninguna superficie firmada cambia**.

### B2-4 · El «aspecto libre», el «bilateral» y el «con broncograma aéreo» por omisión ya no se afirman

Los tres dependientes del avanzado ganaron «— sin consignar —» y sus frases **omiten la cláusula**
cuando está vacío. **No cambia ningún texto alcanzable antes del B2** —hasta hoy ninguno podía
valer cadena vacía— y hace falta por la migración. Lo que sí cambia, y queda declarado: en un
**estudio nuevo**, el médico que marque «Derrame: Sí» y no toque el tipo ya no verá «de aspecto
libre» en el informe. Es la regla que los cinco selects primarios ya aplican desde el 2026-10-16.

### B2-5 · La palabra «avanzado» salió de la pantalla pulmonar y queda en el resto de la app

**Censado y retirado:** el título de la barra («Ecografía pulmonar — evaluación avanzada»), el
`lbl` de la tarjeta de integración («Eco Pulmonar (avanzado)»), el `tit` de la sección del PDF
(«ECOGRAFIA PULMONAR - EVALUACION AVANZADA») y la línea del manual que describía «versión básica y
versión avanzada». **Medido: cero apariciones en el texto renderizado de la pestaña**, en los dos
motores.

**Lo que NO se tocó, a propósito:** «Hemodinámica avanzada», el bloque «ETT Avanzado» del PDF —que
sigue existiendo para los otros módulos—, la sub-pestaña «Avanzado» del Laboratorio, el `<select>`
«Sección avanzada…» del celular y las menciones clínicas («enfermedad vascular pulmonar avanzada»,
«edad avanzada»). La orden lo acota a esta pestaña.

⚠️ **Y QUEDA UNA MENCIÓN VIEJA EN `ECO_AYUDA` QUE NO SE TOCÓ:** el manual nombra «Eco Pulmonar»
entre las pestañas especiales del Modo Avanzado, y desde el B2 el eco pulmonar no es un módulo
avanzado ni tiene pestaña propia. **Es exactamente lo que `B-5` ya declara** —`ECO_AYUDA` es un
string que el armador del PDF aplana por regex, y el R2-11 documenta que una edición descuidada
ahí corrompe el manual y pone en rojo casos de otras zonas **sin romper el parseo**—. El B2 sí
reescribió **una** línea de esa ayuda, la que describía el eco pulmonar con sus dos versiones,
porque afirmaba algo que este trabajo acababa de hacer falso; el resto es la tanda de `B-5`.

### B2-6 · Los botones de C. Congénitas YA tenían el formato de los de la fila de arriba

**Medido antes de tocar nada, y la premisa del pedido era falsa a medias:** coinciden en las siete
propiedades —fondo, color, borde, ancho de borde, cuerpo, relleno y radio— en reposo y en activo,
en los dos temas y en los dos motores. La causa: los botones de arriba también viven dentro de un
`.subtabs-wrap`, y `.subtabs-wrap .tab-btn` (0,2,1) le gana a `.tab-special` (0,1,0), así que las
cinco declaraciones de esa clase —10 px, 4px 10px, `--accent2`, `--bg3`— **no se aplican a ninguno
de los dos**.

**O sea que `.tab-special` es hoy casi inerte.** El B2 les dio igual la clase a los cuatro botones
de CC, que es estructural: ata los dos grupos. Lo que queda abierto es si esa regla tiene que
seguir existiendo con valores que nadie ve: arreglarle la especificidad **cambiaría el aspecto de
los seis botones de la fila de arriba**, que esta orden no autoriza.

### B2-7 · El eco pulmonar sigue sin una sola columna en el Excel

Censado: ninguno de los veinte campos de la pantalla tiene columna. Un backup a Excel más
reimportación **pierde el eco pulmonar entero**. No es del B2 —era igual antes— y agregar columnas
es una PARADA que esta orden declara.

---

## El trabajo «H» — LA AORTA (2026-10-21)

### H-1 · El cuerpo de la guía y su Figura 24 discrepan en el OPERADOR de la dilatación

**Los dos textos están impresos.** El cuerpo del **folio 71** escribe «> 40 mm en hombres adultos y
> 36 mm en mujeres»; la **Figura 24 (folio 76)** bracketea su primera banda como «40-44 mm» y su
nota `a` dice «36-44 mm en mujeres», o sea los dos **inclusivos**.

**La app aplica el inclusivo** (`>= 40` / `>= 36`), con el motivo escrito al lado de la constante:
es el algoritmo que la sección reproduce, el cuadro descriptivo ya trata 40,0 mm exactos como
dilatado desde el VS5 —así que el estricto haría que el panel contradijera a la pantalla en ese
valor exacto— y es el lado que no deja de avisar. **Si Maicol prefiere el estricto, el cambio es
el operador de `aoDilatada` y un valor de TC-512**, y entonces hay que mover también el cuadro
descriptivo para que las dos superficies no discrepen.

### [CERRADO 2026-10-22 · AJ1-E4] H-2 · El índice de dimensión aórtica (iDA > 22 mm/m²) no se usaba

El mismo folio 71 ofrece una **segunda** definición: diámetro indexado por superficie corporal
**> 22 mm/m²**. El motor de aorta arranca **sólo por el diámetro absoluto**, así que el paciente de
talla pequeña con un diámetro absoluto normal y un índice patológico **no abre la sección**.
Implementarlo es una línea en `aoDilatada` —el iDA se calcula con `aoDilMax()` y la superficie
corporal, que la app ya tiene— pero **cambia qué pacientes ven la sección**, que es contenido
clínico. Para Turner la guía ya manda medir por índice y la sección lo publica (Tabla 57).

**CERRADO el 22/10/2026 (AJ1-E4), por decisión de Maicol.** Entraron `AO_IDA_MAX = 22` —operador
**estricto**, que es el del texto: la Figura 24 no bracketea el índice—, `aoIdaVal()` y
`aoIdaDilatado()`, y `_indAo` abre con `(diámetro ≥ corte) || porIda`. **Sin superficie corporal
el índice es `null` y no se aplica**: un campo vacío es SIN DATO. La **fila del iDA se dibuja
igual**, con `ask`, para que su ausencia no se lea como un valor normal.
⚠️ **`_indVAB` CONSERVA `aoDilatada()`, O SEA SÓLO EL DIÁMETRO ABSOLUTO** —ver AJ1-3—.

**H-1 NO se cerró**: el operador del diámetro absoluto no se movió. Lo que entró es la **nota del
globo ⓘ** que declara las dos lecturas y cuál aplica la app (AJ1-E3).

### H-3 · Las tres listas de factores de riesgo siguen sin unificar, y ahora son CUATRO fuentes

La **Tabla 68** publica nueve factores, la **Tabla 38** ocho, el pie de la **Figura 24** seis y la
**Tabla 66** da los suyos propios para el Loeys-Dietz. Cada superficie publica la lista de SU tabla
—que es lo correcto— pero el médico ve cuatro listas distintas según dónde mire. Unificarlas sería
inventar una quinta que ninguna guía publica.

### H-4 · El motor de aorta no pregunta la LONGITUD de la aorta ascendente ni la ALTURA

Dos de los ocho factores de la Tabla 38 son «longitud aórtica mayor de 11 cm» y «estatura menor de
1,69 m». La app **tiene la talla** (`talla`) y **no tiene la longitud**. Hoy los ocho factores se
resuelven con **una** pregunta de sí/no («alguno de ocho factores»), que es el lado conservador:
pedir los ocho por separado son ocho controles nuevos. Si se decide desglosarlos, la talla sale
del campo y la longitud necesita un campo nuevo — y un campo nuevo **sin** columna de Excel, que es
lo que esta orden permitía.

### H-5 · La coartación: el gradiente pico-pico INVASIVO no tiene campo

La indicación de la Figura 44 sale del cateterismo y la app no tiene dónde consignar ese número:
lo que hace es **mandar a medirlo**, con su cita. Mientras no haya campo, ninguna superficie de la
app puede publicar la indicación de la coartación, sólo la sospecha.

### H-6 · Con Ehlers-Danlos vascular el EN SUMA no nombra la aortopatía

El cuerpo del informe la publica con su folio; el **EN SUMA no**, porque al resumen sólo suben las
tres clases de indicación y los dos estados de «falta un dato», y `sin_umbral` no es ninguno de los
dos. **Medido.** No es una pérdida contra el árbol anterior —esa opción no existía— pero deja el
resumen de un paciente con Ehlers-Danlos y 46 mm de aorta sin mencionar la enfermedad. Las dos
salidas: (a) sumar `sin_umbral` a la lista que sube, con su frase; (b) dejarlo así y que el
resumen hable sólo de lo accionable. **Es una frase del informe firmado: la decide Maicol.**

### H-7 · `panel-evidencia.md` y `aortica-cortes.md` no se tocaron, los dos por tamaño

`panel-evidencia.md` está en **35,3 KB**, o sea **ya cruzado** desde el 2026-10-12, y
`aortica-cortes.md` en **33,9 KB**, a 1,1 KB del techo. Por eso el mapa de este trabajo salió a
archivo propio (`docs/mapa/aorta-aortopatias-evidencia.md`, **22,1 KB**, con la ficha de TC-512
adentro) y los dos punteros fueron a `evidencia-derecho-aorta.md` (19,2 KB) y
`congenitas-otros.md` (26,7 KB), que tienen margen. **`tests-fichas.md` tampoco se tocó**: estaba
en 33,5 KB y la ficha lo cruzaba. **La próxima tanda que toque `panel-evidencia.md` tiene que
partirlo.**

### H-8 · TC-273 y TC-274 son inestables por orden de corrida en una lista de zona

Salen rojos con un `--solo` de 58 casos que saltea los de en medio —el síntoma es «siguen vivas:
CoAo» y el botón de Evidencia en azul con el formulario vacío— y **verdes corridos solos**.
**Fallan idénticamente contra el árbol de entrada con la MISMA lista**, así que no son del trabajo
H: es aislamiento del suite, que corre todos sus casos en una sola página. En la suite completa
están verdes. Lo que falta es encontrar qué caso deja `_indClin` o un campo de coartación puesto.

---

# Lo que el trabajo «D» declaró y NO tocó (2026-10-22)

### D-1 · La clave `cierre_iia` conserva su nombre, y hoy ese nombre ya no describe lo que publica

`fopConclusion` devuelve diez claves y una se llama **`cierre_iia`**. Desde el D-E2 su texto es
descriptivo —«Con ACV criptogénico, en paciente de N años»— y no indica ningún cierre ni ninguna
clase. **No se renombró, y el motivo está medido:** el Laboratorio cuenta la distribución del FOP
**por clave** y un filtro de cohorte guardado la trae, así que renombrarla deja esos estudios fuera
del recuento. El nombre es interno y no se publica en ninguna superficie.
**Salidas:** (a) renombrarla con una tabla de alias de ENTRADA, el mecanismo de
`LAB_XLS_LISTAS_LEGADO`; (b) dejarla, declarada. Se eligió la (b).

### D-2 · Los rótulos de conducta del Laboratorio siguen nombrando la ESC

El módulo del FOP ya no nombra ninguna guía en la pantalla, el informe, el EN SUMA ni el PDF
—censado—, pero el **Laboratorio** sigue publicando sus propios rótulos de distribución con la
palabra «indicación» y, en uno, «ESC». Es otro módulo y esta orden no lo nombra: tocarlo cambia lo
que una cohorte guardada muestra. **Salida:** reescribir esos rótulos con el vocabulario
descriptivo, en un trabajo del Laboratorio.

### D-3 · `otr_burb_mom` y `otr_burb_lat` se pisan parcialmente

El test de burbuja de «Otros» ya tenía un selector de **momento de aparición** (`otr_burb_mom`:
en reposo / con Valsalva / las dos) y esta tanda le agregó el de **número de latidos**
(`otr_burb_lat`, 3 a 6). Son dos preguntas distintas —cuándo aparece el pasaje y en cuántos ciclos—
y conviven sin contradecirse, pero un lector apurado puede leer «momento» como «latido».
**Salida:** agruparlos bajo un rótulo común, que es maquetación de esa pestaña.

### ✅ D-4 · CERRADO el 2026-10-21 (tanda D2, commit 1) — el operador pasa a `>` ESTRICTO

**Lo decidió Maicol con la fuente delante, que es lo que esta entrada pedía.** El folio 916 escribe
el corte de un lado como «**greater than** 10 mm», así que ahí el estricto es de la guía; para la
excursión **total** la fuente no escribe operador en ninguno de los dos folios, y se elige el
estricto por ser el lado que **no afirma**. Medido: 10 mm hacia un lado y 15 mm de excursión total
**NO** cumplen; 11 y 16 sí. Los dos textos impresos están en `docs/fuentes/FUENTES.md` → «El
trabajo D2». **Texto original de la entrada, para que se entienda el cambio:**

### D-4 · El operador del corte del ASIA es `>=` y la fuente se contradice consigo misma

Silvestry 2015 escribe el corte de un lado como «**greater than** 10 mm» en el **folio 916** y
—en la misma oración— la excursión total «**of** 15 mm», sin operador; el **folio 938** reescribe
los dos **sin** «greater than». La app aplica **`>=` en los dos**, que es lo que ya aplicaba antes
de este trabajo y el lado que no deja de avisar. **No se movió ningún operador** (la orden lo
prohíbe expresamente). **Salida:** decidir el operador con la fuente delante, que es contenido
clínico.

### D-5 · El DIBUJO interactivo del FOP, como trabajo futuro

Esta orden dice, con todas las letras, «sin dibujo», y el hueco donde iría quedó **vacío**: la
columna de anatomía no reserva espacio ni dibuja un contorno. El día que se haga, el precedente es
`vabGeom` —una función **pura** que devuelve números y cadenas de `path`, con el dibujo construido
por `createElementNS` y nunca por `innerHTML` con datos concatenados— y el PDF rasterizando **desde
la misma geometría** que la pantalla, para que no haya dos dibujos del mismo órgano.

### ✅ D-6 · CERRADO el 2026-10-21 (tanda D2, commit 2) — el selector nace SIN CONSIGNAR

Se eligió la **salida (a)** que esta entrada ofrecía: la opción vacía pasa al **primer** lugar, con
lo que nada se publica hasta que el médico elija. Decisión de Maicol, que revierte el «3 por
defecto» del D. Medido con teclas reales en las cinco escenas: con el selector vacío el informe, la
conclusión, el EN SUMA y la tabla del PDF **no** dicen «a los N latidos» y la fila del FOP dice
«— sin consignar»; con 3, 4, 5 y 6 las cuatro superficies salen idénticas a antes.
⚠️ **UN ESTUDIO GUARDADO CON 3 ABRE CON 3**, porque el guardado no distingue un 3 elegido de un 3
por omisión; uno sin la clave abre vacío. No se migra nada. Ver `D2b-2`.
**Texto original de la entrada:**

### D-6 · El 3 es el valor de fábrica, así que el informe publica «a los 3 latidos» sin que nadie lo haya elegido

El número de latidos vive en `otr_burb_lat`, cuyo único control está en la pestaña **Otros · Test
de burbuja**, dentro del bloque que aparece **con pasaje documentado**. El módulo FOP lo **lee** y
lo publica en un `<span>` con guión MEDIO; no tiene un segundo control propio, que es lo que evita
una segunda copia del dato.
⚠️ **LO QUE QUEDA ABIERTO ES EL VALOR DE FÁBRICA, Y ES LO QUE LA ORDEN PIDIÓ:** el selector nace en
**3** —la primera `<option>`—, así que todo estudio con pasaje documentado publica «a los 3
latidos» en el informe FIRMADO aunque el médico no haya tocado ese control. **La compuerta de
`fopLatidos` acota el daño y no lo cierra:** sin pasaje documentado devuelve `null` y ninguna de las
cuatro superficies dice nada, pero con pasaje el 3 se afirma solo.
**Medido en la ruta real de reapertura:** un estudio guardado **antes** de esta tanda no trae la
clave, y la restauración hace `el.selectedIndex = 0` para un `<select>` cuya clave falta —no
`.value = ''`—, o sea que también reabre en **3**. Lo que lo protege es otra cosa: la reimpresión
**no reescribe** `informe_texto`, que es un `<textarea>` con id y viaja con el estudio, así que el
papel de un informe ya firmado sale con su texto original. **No se migra nada.**
**Salidas:** (a) mover la opción vacía al PRIMER lugar, con lo que nada se publica hasta que el
médico elija —y el informe de un estudio nuevo deja de nombrar los latidos salvo que se consignen—;
(b) dejar el 3, declarado. Se eligió la (b) porque es lo que la orden fija («3 a 6, con 3 por
defecto»). **Cambiar el valor de fábrica mueve una frase del informe firmado: lo decide Maicol.**

### D-7 · Los dos campos nuevos no tienen columna de Excel

`otr_asia_lado` y `otr_burb_lat` **viajan con el estudio** —guión BAJO, los toma el recolector— y
**no** se agregaron al Excel: el libro sigue en **440 columnas**, comparadas clave por clave. Es lo
que la orden pide («una columna nueva en el Excel es PARADA»). **Consecuencia:** un backup a Excel y
su reimportación pierden el lado del aneurisma y el número de latidos. **Salida:** dos columnas en
el bloque que corresponda, que es una PARADA y la decide Maicol.

### D-8 · El panel de Evidencia del FOP no publica el RoPE ni el `aria-label` del cuestionario

La sección nueva **pregunta** tres cosas (ACV o AIT previo, criptogénico tras evaluación completa,
shunt grande) y **lee** cuatro (edad, ASIA, grado del pasaje, latidos). Lo que el médico contesta
vive en `_indClin` y **no se guarda con el estudio** —medido por el juego de ids del recolector—.
Lo que **no** hay es una puntuación RoPE: la sección la nombra en su bloque de contexto y no la
calcula, porque pide datos que la app no tiene. **Salida:** agregar los campos del RoPE, que es un
módulo propio.

### D-9 · `tests-fichas.md` quedó a 763 bytes del techo

Medido con `wc -c` **ANTES** de escribir: estaba en 33,5 KB y la ficha entera lo cruzaba, así que la
de TC-513 vive **dentro** de `docs/mapa/fop-burbuja-unificado.md` y lo que le entró son **cuatro
líneas de puntero**. Quedó en **34,2 KB**. **La próxima tanda que lo toque tiene que partirlo.**
Lo mismo con `panel-evidencia.md`, que sigue en **35,3 KB**, o sea **ya cruzado** desde el
2026-10-12, y con `vab-bicuspide.md`, que esta orden declaraba a menos de 4 KB del techo: **ninguno
de los dos se tocó**.

### D-10 · `CLAUDE.md` pesa **1,0 MB** y se carga en CADA sesión

Medido con `wc -c` al cerrar este trabajo: **1.018.734 bytes / 11.959 líneas**, de los que la
entrada de esta tanda son 201. Ese archivo **no es un mapa**: se carga entero al arrancar cada
sesión, antes de que nadie pida nada, así que su tamaño se paga **siempre** y no sólo cuando se
abre la zona que documenta. La regla de los 35 KB de los mapas no lo alcanza, y el que la escribió
tenía el mismo motivo: presupuestar contexto.
Lo que lo hace crecer es **«Estado vigente»**, que acumula una entrada por tanda y hoy tiene
**cuarenta y tantas**, desde el trabajo D1 del 14/10 hasta éste.
**Salidas:** (a) dejar en `CLAUDE.md` las **tres o cuatro últimas** entradas y mudar el resto a
`docs/historial/`, con el mecanismo que ese archivo ya usa —se busca con `grep -n` por título y se
leen 20-80 líneas con `sed`— y un puntero por tanda; (b) partir «Estado vigente» en un archivo
propio al que `CLAUDE.md` apunte; (c) dejarlo, declarado. **No se tocó: es el archivo de reglas de
Maicol y mover sus secciones cambia qué lee una sesión al arrancar.**


---

## Tanda «D2» — las cuatro correcciones del 21/10/2026

⚠️ **LAS CLAVES DE ESTA TANDA LLEVAN EL PREFIJO `D2b` Y NO `D2`, y no es capricho:** ya existen
`D2-1`, `D2-4` y `D2-5` de **otra** tanda llamada «D2» —la del **14/10/2026**, la de la aórtica y
la tricúspide en pantalla—. Dos entradas con la misma clave dejan una de las dos sin encontrar.

### D2b-1 · Un estudio guardado SIN el lado deja de afirmar el aneurisma por su excursión

Desde el D2-E1 la regla del aneurisma del septum **exige el lado**: sin él no hay umbral que
comparar y no se publica veredicto. **Consecuencia medida** sobre un estudio guardado **antes** de
la tanda D —que no trae `otr_asia_lado`—: si el aneurisma estaba afirmado **sólo** por su
excursión, al reabrirlo la conclusión pasa de `alto_riesgo_sin_evento` a `incidental`. El que tiene
el desplegable `fop_asa` en «Sí» no cambia: ese dato lo declaró el médico.
**Lo que protege al papel ya firmado:** `informe_texto` y `en_suma` son `<textarea>` con id, viajan
con el estudio y la reimpresión **no los reescribe**. **No se migra nada.**
**Salidas:** (a) dejarlo, declarado —lo elegido—; (b) tratar la ausencia del lado como «un lado» y
aplicar el corte de 10 mm, que es lo que la app hacía y lo que esta tanda vino a cerrar.

### D2b-2 · El 3 de un estudio guardado no se distingue de un 3 por omisión

El guardado persiste el **valor** de `otr_burb_lat`, no si el médico lo tocó, así que todo estudio
guardado entre la tanda D y ésta trae un `3` que puede ser elegido o de fábrica, y **abre con 3**.
No se migra nada: reescribir esa clave en disco sería decidir por el médico. El informe ya firmado
de esos estudios no cambia, por lo mismo que `D2b-1`.
**Salida:** ninguna razonable sin un campo de «lo tocó el médico», que sería un dato nuevo.

### D2b-3 · La caja de detalle del ASIA en Otros sigue siendo texto libre

`otr_asia_nota` es una caja de texto de 120 caracteres cuyo marcador de posición sugiere «(de … mm
por … mm en eje L y T)». Es donde el médico escribió el «16» que el informe publicaba pelado. Desde
el D2-E1 la frase de la excursión la compone la app y la nota va **después**, así que un estudio en
el que el médico escribió el número a mano lo publica **dos veces**: «…con excursión de 16 mm hacia
ambos lados (total) 16.». **No se toca**: es texto del médico y la app no puede parsearlo.
**Salidas:** (a) dejarlo —lo elegido—; (b) cambiar el marcador de posición para que no invite a
escribir la excursión, que es un texto de pantalla y lo decide Maicol.

### D2b-4 · `otr_asia_lado` y `otr_burb_lat` siguen sin columna de Excel

Lo que `D-7` ya declara, sin cambios: los dos **viajan con el estudio** y **no** están en el Excel,
que sigue en **440 columnas**. Un backup a Excel y su reimportación pierden el lado del aneurisma y
el número de latidos. Una columna nueva es PARADA y la decide Maicol.

### D2b-5 · El rótulo del PDF del FOP sigue sin acentos, y su celda ahora los lleva

`fopPdfFilas` escribe sus **rótulos** sin acentos («Excursion del aneurisma», «Latidos del
pasaje»), que es como los dejó el D-E2. Desde el D2-E1 el **valor** de la fila de la excursión sale
de `asiaExcFrase().corto` y lleva los suyos («hacia la aurícula derecha»), igual que `vabPdfFilas`
escribe «Cúspides» y «Estenosis aórtica». **Es seguro**: `amiloSanPDF` sólo borra lo que está fuera
de `\x20-\xFF` y los acentos latinos no lo están. **Queda la inconsistencia de rótulo**, que esta
orden no autoriza a tocar.
**Salida:** reescribir los rótulos de esa tabla con acentos, en una tanda que los nombre.

### D2b-6 · Dos superficies de la pantalla del FOP siguen mostrando una lectura automática distinta

Con el ASIA en «No» la fila «Se abomba hacia» muestra «—» y la de «Interpretación» muestra los
milímetros con el motivo. **Son dos textos y no uno a propósito**: la primera es el dato que se lee
de Otros y la segunda es lo que la app concluye de él. La alternativa —apagar las dos— perdería la
excursión de la pantalla, que es un dato cargado.

### D2b-7 · `tests-fichas.md` sigue a 763 bytes del techo, y la ficha de TC-514 vive en otro archivo

Medido con `wc -c` **ANTES** de escribir: `docs/mapa/tests-fichas.md` está en **34,2 KB** y la ficha
entera lo cruzaba, igual que en la tanda D. La de **TC-514** vive dentro de
`docs/mapa/d2-correcciones.md` (§6) y a `tests-fichas.md` **no se le escribió nada**. Lo que `D-9`
pide sigue pendiente: **la próxima tanda que lo toque tiene que partirlo.**

### D2b-8 · El puntaje RoPE sigue sin existir, y es un trabajo propio

Lo que `D-8` ya declara. Esta orden lo excluye expresamente («el RoPE es otro trabajo, a la espera
de fuentes»). La sección de Evidencia del FOP lo **nombra** en su bloque de contexto y no lo
calcula, porque pide datos que la app no tiene.

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

## Tanda D3 (2026-10-21) — la excursión del ASIA desde «Otros»

### D3-1 · La caja de detalle del ASIA sigue admitiendo un número suelto

`otr_asia_nota` es **texto libre** y su placeholder pide milímetros: «(de … mm por … mm en eje L y
T)». Con el campo de excursión al lado y rotulado el dedazo deja de ser el camino natural —es lo que
el D3 cierra— pero el estado sigue siendo alcanzable: un médico que escriba «11» ahí y deje la
excursión vacía ve «Aneurisma del septum interauricular 11.», igual que antes.

**No se tocó, y el motivo está escrito en el propio código:** la nota es texto clínico que el médico
redacta y la app no le pone comillas, paréntesis ni interpreta su contenido. Adivinar que un número
suelto es la excursión sería leer el significado de un texto libre.

**Salidas, de la más conservadora a la menos:** (a) dejarlo así —lo que se hizo—; (b) cambiar el
placeholder para que no pida milímetros, ahora que el campo de al lado los pide; (c) un aviso de
pantalla cuando la nota sea un número puro y la excursión esté vacía. Las tres son decisión de
Maicol: (b) y (c) tocan texto de cara al médico.

### D3-2 · La excursión sigue sin columna de Excel

`fop_asa_mm` no está en `LAB_XLS_MAP` —lo que tiene es una fila del PDF de congénitas— así que un
backup a Excel y su reimportación pierden la excursión, y con ella la frase del ASIA. Es lo que
`D-7` ya declara para los dos datos del trabajo D; el segundo control del D3 **no cambia nada de
esto**: no agrega ni quita columnas, medido en 440.

**Salida:** una columna nueva es PARADA y la decide Maicol.

### D3-3 · El lado y la casilla del ASIA viajan con el estudio y la excursión también, pero por el dueño

Tres claves del bloque son del estudio (`otr_asia__chk`, `otr_asia_nota`, `otr_asia_lado`) y la
cuarta —la excursión— viaja por `fop_asa_mm`, que vive en otra pestaña. **Medido: al reabrir un
estudio el espejo la repone y la frase sale**, así que el médico no nota la diferencia. Lo que
queda declarado es que son dos pestañas distintas para un mismo bloque clínico.

**No hay nada que arreglar hoy**; se escribe para que la próxima tanda que mueva uno de los cuatro
sepa que el cuarto no está donde parece.

---

# La tanda AJ1 — lo declarado y no tocado (22/10/2026)

### AJ1-1 · La edición y el año del libro de la Tabla 20-5 los confirma Maicol

El corte de **15 cm** del VTI del flujo reverso sale de la **Tabla 20-5** del libro
*Ecocardiografía avanzada* (Moya Mur, capítulo 20). La ficha de Referencias lo rotula **«libro de
texto; no figura en las guías de la biblioteca»**, que es lo que la honestidad de la cita pide,
pero **el ejemplar consultado no imprime la edición ni el año en la página de la tabla**.

**No se inventó ninguno de los dos.** Cuando Maicol los confirme, el único lugar que hay que tocar
es la línea de fuente de `ref-ia`.

### AJ1-2 · Los dos operadores de la velocidad telediastólica no coinciden, y no se movió ninguno

`IA_VMAX_TD_SEVERA` vale **20 cm/s con `>=`**, que es lo que escribe la **ESC/EACTS 2025 (Figura 4,
folio 4659)**, la más nueva de las tres y ya verificada en este repo. La **EACVI 2013** y la
**Tabla 20-5** escriben `> 20`, así que **una velocidad de 20,0 exactos es severa para una fuente y
no para las otras dos**.

**No se tocó**: mover un operador es contenido clínico y esta orden lo prohíbe. **Salidas:** (a)
dejarlo —lo que se hizo, y es el lado que no deja de avisar—; (b) pasarlo a `>` estricto, que son
una línea y un valor de TC-516.

### AJ1-3 · La Evidencia de la BICÚSPIDE sigue abriendo sólo por el diámetro ABSOLUTO

`_indVAB` conserva `aoDilatada()` mientras `_indAo` ya abre también por el **iDA**. Son **dos
predicados** donde el trabajo H había dejado **uno**, y es deliberado: las filas de la **Tabla 68**
de la bicúspide están escritas sobre el **diámetro absoluto**, así que abrirlas por el índice
publicaría recomendaciones cuya fuente no las condiciona así.

**Medido: con iDA 23 y diámetro por debajo del corte, la sección de aorta abre y la de la
bicúspide no.** **Salida:** si Maicol quiere que las dos abran igual, es cambiar el predicado de
`_indVAB` por `aoDilatada() || aoIdaDilatado()` y un valor de TC-516 — y hay que decidir qué hace
la sección con una recomendación cuyo umbral es absoluto.

### AJ1-4 · El corte alternativo de la IM secundaria es de PANTALLA y no gradúa

La frase de `#im-sec-alt` dice si el paciente alcanza el **ORE ≥ 30 mm²** o el **volumen ≥ 45 ml**
de la ESC/EACTS 2025, y **no cambia `im_grado`**, que sigue saliendo de los cortes de la
**ACC/AHA 2020**. O sea que el médico puede ver «alcanza el corte alternativo de grave» al lado de
un grado **moderado**, y eso es exactamente lo que la orden pide mostrar: dos guías con dos cortes.

**Tampoco sube al informe ni al EN SUMA**, y por eso **no viaja con el estudio**: su id lleva guión
MEDIO. **Salidas:** (a) dejarlo —lo que se hizo—; (b) subirlo al informe como salvedad; (c) hacer
que gradúe, que es cambiar qué guía manda en esta válvula. Las tres son decisión de Maicol.

### AJ1-5 · El campo de la duración del reverso no tiene columna de Excel

`ia_rev_dur` **viaja con el estudio** y se restaura, pero **no está en `LAB_XLS_MAP`**: un backup a
Excel y su reimportación **pierden la duración**, y con ella el grado que el reverso vota. Es lo
mismo que `D-7` y `D3-2` ya declaran para otros dos datos.

**Medido: 440 columnas antes y después.** Una columna nueva es **PARADA** y la decide Maicol.

### AJ1-6 · El strain de pared libre del VD no tiene cobertura automática por su CÁLCULO

`_vdCalcular` necesita los **dos contornos dibujados a mano** sobre el visor, que el cuerpo de un
caso no puede trazar. **TC-516 lo mide por COMPORTAMIENTO** —la fila de `ref-vd2` que deriva del
corte, que publica el mismo valor en las dos columnas de sexo— y la clasificación por el cálculo
queda sin caso.

**Salida:** un arnés que inyecte `_vd.trazos` necesitaría que esa variable de módulo esté
exportada, y hoy no lo está. No se exportó una variable interna sólo para medirla.

### AJ1-7 · Tres diferencias de la versión de MAYO quedan sin aplicar, y dos no son de esta tabla

El diff de la hoja 5 entre febrero y mayo da **once** diferencias. Las que esta app implementa
están aplicadas; de las que no, **«RAV index (area-length)»** no tiene campo —la app no mide
volumen de la AD—, y **«RV E/A ratio»** y **«Deceleration time»** son de la **función diastólica
del VD**, que `ASE25_T1` no implementa.

**No hay nada que arreglar hoy**; se escribe para que la próxima tanda que agregue esas filas sepa
que la versión de mayo ya las corrige y de dónde salen los valores buenos.

### AJ1-8 · La sonda de esta tanda tenía una escena de coartación VACÍA, y lo cazó el caso

`_probe_aj1.mjs` escribía `coa_gmax_vmax`, que **no existe** —el campo es `coa_vmax`—, así que su
escena de coartación **no producía el párrafo del informe** y su medición «no está el seguimiento»
se cumplía sobre un informe que no hablaba de la coartación. **TC-516 lo destapó con su
DENOMINADOR**, que es para lo que está, y el caso usa los ids reales.

**La sonda quedó como está** —ya se corrió y su conclusión no cambia: el seguimiento tampoco
aparece en la escena buena, medido por el caso—. Si se vuelve a usar, hay que corregirle los ids.

---

## Tanda «E» (2026-10-22) — HTP y HF-PEFF: lo declarado y NO tocado

Esta tanda **cierra R2-1** (arriba) y la fila 99 de la Lista. Lo que queda:

### E-1 · El informe reusa la frase que la app ya emite, y no el literal del pedido

La orden pedía, textual, «Probabilidad baja de HTP (VRT no medible, sin signos ecocardiográficos
adicionales)». La línea que la app ya tenía produce ese MISMO contenido con esos datos, con otro
envoltorio: «…probabilidad baja de hipertensión pulmonar (VRT no medible; sin signos adicionales)».

**Se eligió reusarla**, que es la opción conservadora: redactar la frase aparte habría dejado **DOS
formatos para la misma afirmación en el mismo informe firmado**, y el que se olvida de actualizar es
el que termina contradiciendo al otro. **Decidir:** si el literal del pedido tiene que reemplazar al
de la app, es un cambio de texto del informe y hay que hacerlo en el dueño, no agregando una rama.

### E-2 · La pantalla del HF-PEFF sigue diciendo «el puntaje es parcial» en su columna de resultado

La orden congela la pantalla de HF-PEFF («no toques su diseño ni sus campos»), y esa pantalla tiene
su propio renglón «Faltan datos en algún dominio: el puntaje es parcial.» en la columna de
resultado, **además** de la conclusión, que ahora dice «(puntaje parcial: falta el dominio X)» y
NOMBRA cuál. O sea que en la pantalla la idea aparece **dos veces** —una genérica y una con el
dominio—, aunque en el informe y en el PDF aparezca una sola.

**No se tocó**, por la congelación. **Decidir:** si ese renglón sale, es una línea.

### E-3 · «Investigar causas alternativas de disnea» también salió de la conclusión

La orden nombra explícitamente la frase del cateterismo. «Investigar causas alternativas de disnea»
—que la conclusión publicaba con puntaje ≤ 1— **es una conducta por el mismo criterio**, así que
salió con ella y su idea pasó a Evidencia, con su folio (Pieske 2019, folio 3304).

**Declarado** porque es un retiro que la orden no nombra. **Decidir:** si tenía que quedarse, vuelve
en una línea de `hfapeffConclusion`.

### E-4 · Las líneas de Evidencia del HF-PEFF no llevan clase ni nivel

Pieske 2019 es un **consenso** de la HFA y no publica ninguno; censada la ESC 2021 de insuficiencia
cardíaca, que nombra el score y repite los mismos pasos **también sin clase ni nivel propios**, y
que además declara que el rendimiento diagnóstico de los scores varió entre cohortes.

**No se les inventó ninguno.** La sección de HTP sí los lleva, porque su fuente los imprime.
**Decidir:** si algún día aparece una guía que les asigne clase, hay que citarla a ella y no a
Pieske.

### E-5 · Las cinco casillas automáticas de la tabla de HTP no viajan con el estudio

Van **sin `id`** a propósito: el recolector barre `input[id]`, así que una casilla sin id no agrega
una clave al estudio ni puede agregar una columna de Excel —que es PARADA—. Las escribe el cálculo
en cada repintado y se ven bloqueadas.

**Consecuencia declarada:** su estado no se persiste, y no hace falta que se persista porque se
**deriva** de los campos que sí viajan. Lo que sí queda abierto es que un estudio **archivado** de
antes de la tanda R2 puede traer la casilla con id de la AP tildada a mano con un valor que hoy el
cálculo contradice: ahí manda la casilla, que es lo que ya estaba en disco. **No se migra nada.**

### E-6 · El `presente` de los dos signos de la AP se lee de la casilla y no del cálculo

`htpApSync` escribe y bloquea las dos casillas con id de la arteria pulmonar en la **pantalla**,
pero `_htp2022Signos` lee su `presente` de la CASILLA. Es deliberado: `_htp2022Core` corre **también
sobre un estudio archivado** —el panel de cohorte—, que nunca pasó por `htpApSync`, así que
recalcularlas ahí le cambiaría el resultado a lo que ya está en disco.

**Consecuencia declarada:** es la única asimetría de la tabla —los otros nueve signos derivan su
`presente` del mismo lugar que su `estado`—.

### E-7 · El mapa nuevo nació porque tres mapas están cruzados o al borde

Medido con `wc -c` **antes** de escribir: `panel-evidencia.md` **35,3 KB** (ya cruzado desde el
2026-10-12), `tests-fichas.md` **34,2** e `informe-pdf-excel.md` **34,0**, los tres a menos de 1 KB
del techo o pasados. Por eso la documentación de esta zona salió a **`docs/mapa/htp-hfapeff.md`**
(17,4 KB) con la ficha de TC-517 adentro, y a los otros tres mapas con margen les entró un puntero.

**Los tres siguen esperando que alguien los parta.**

### E-8 · El marco del panel de Evidencia recorta el valor largo, y no se tocó

La celda del VALOR de una fila del panel lleva **`white-space: nowrap`**: el marco espera ahí una
cifra —«> 3,4 m/s», «2 de 3»— y un texto largo **no envuelve**, ensancha la tabla de la sección y
hace que **todas** sus filas queden cortadas por la derecha. Medido: con la lista de nombres en el
valor, la sección de HTP daba **928 px contra los 788 de su caja** y era la **única de las
cincuenta** del panel que recortaba.

**Se corrigió del lado del contenido** —el conteo en el valor y los nombres en la nota, que sí
envuelve—, **no del marco**, que esta orden no autoriza a tocar.

**Decidir:** si el marco tendría que acotar esa celda (por ejemplo con `max-width` y envolviendo),
para que la próxima sección con un valor largo no vuelva a recortarse en silencio. Hoy nada lo
señala: el cuerpo del panel **no desborda** (818 = 818) y la página tampoco, así que ninguna
medición numérica lo ve — **lo destapó mirar la captura**.

---

# La tanda «I» — la ETE, la ET y la IP en Fallot reparada (22/10/2026)

Declarado y **no tocado**. Nada de esto es un defecto que esta orden autorizara a corregir.

### I-1 · El área de tenting: la fuente da un RANGO y la app aplica un número

La Tabla 7 del documento de regurgitación valvular nativa (hoja 25, **sin folio impreso**) escribe
el área de tenting como **«> 2,5-3 cm²»**, no como un corte único. La app aplica el extremo **BAJO**
(2,5), que es el lado que **no deja de marcar**, y lo declara en las cuatro superficies que lo
publican: la ficha de Referencias, el pie de la pantalla, el rótulo del campo y acá.

**Decidir:** si se conserva el 2,5, si se sube a 3, o si la fila publica los dos extremos y no vota
en la franja intermedia. **Un corte único donde la fuente da un rango es una DECISIÓN y no una
lectura**, y por eso no se resuelve sola.

### I-2 · La sección del trombo se abre SÓLO con el trombo confirmado

`_indETETrombo` devuelve `null` con el trombo descartado. Abrirla para decir que no aplica sería
publicarle una tabla de conductas a un paciente que **no está en ninguna de sus filas**.
**Decidir** si el médico querría ver igual las filas en gris, como hacen otras secciones del panel.

### I-3 · La Tabla 8 de la ESC/EACTS 2025 no lleva clase ni nivel

Las contraindicaciones de la comisurotomía mitral percutánea se publican **sin** clase y **sin**
nivel, porque esa tabla no los trae, y la sección lo dice con todas las letras. No hay nada que
arreglar: queda escrito para que nadie se los invente.

### I-4 · La tabla de dimensionamiento del WATCHMAN FLX Pro no se pudo leer

Del IFU 51245861-01 rev. A (2023-07) se publican los **seis tamaños de 20 a 40 mm** y nada más: su
tabla de dimensionamiento por diámetro de ostium no se pudo leer y **no se cita**. La línea de
elegibilidad de la app usa la **zona de anclaje del Amulet** (11 a 31 mm), que sí es un dato de
fabricante verificable.

**Decidir** si vale la pena buscar una fuente legible para el segundo dispositivo, o si la línea se
queda con uno solo y lo nombra.

### I-5 · La referencia 33 de la Tabla 7 no está en la biblioteca

Ese documento atribuye su Tabla 7 a **Lancellotti P, Marwick T, Pierard LA, «How to manage
ischaemic mitral regurgitation», Heart 2008;94:1497-1502**, que **no está en la biblioteca**. La
app cita la tabla por su documento y su hoja, que es lo que se pudo ver.

### I-6 · De la ESC 2020 de congénitas del adulto sólo está la TRADUCCIÓN

La biblioteca tiene `Baumgartner_2020_Cardiopatias_Congenitas.pdf`, la traducción de la SEC
(*Rev Esp Cardiol* 2021;74(5):436.e1), que **pagina distinto** que el original inglés
(*Eur Heart J* 2021;42:563-645). Lo que se leyó son **números, operadores y clases**, en imagen; la
entrada del registro del panel es **propia** (`escGuch2020Es`) y declara las dos cosas.

⚠️ **Y el archivo ya tenía una entrada que cita la edición INGLESA (`esc2020guch`), sin folio.** No
se fusionaron: son dos publicaciones con paginación distinta, y citar una revista al lado del folio
de la otra manda al lector a otra página — la lección que `fop2019` ya pagó.

**Decidir** si se consigue el original inglés y se unifican, o si las dos entradas conviven.

### I-7 · El módulo de Fallot reparada sigue publicando su CONDUCTA en el informe firmado

`tdfConclusion` produce la conclusión y la conducta de reintervención, y con «Integrar al informe»
tildado eso entra al papel y al PDF. La regla de producto de la casa —el informe es DESCRIPTIVO y
las conductas van a Evidencia— mandaría mudarlo, igual que se hizo en esta misma tanda con el
trombo de la orejuela y con el ateroma.

**No se tocó**: es un cambio clínico de la pestaña de congénitas que esta orden no autoriza, y
alcanza además al Laboratorio (`TDF_CONDUCTAS`, `_claveDe(tdfConclusion)`) y al PPT.

### I-8 · Un criterio de la guía estadounidense no se puede evaluar

«RV end-diastolic volume ≥ 2× LV end-diastolic volume» (recomendación 10). El volumen del VD se
**transcribe** de la resonancia y está **indexado**; el del VI lo mide este ecocardiograma y está en
mililitros. Compararlos sería un cociente entre **dos métodos y dos unidades**, que no es lo que la
tabla pide. La sección lo declara en su bloque clínico y **dice cuántos criterios pudo evaluar**,
así que el conteo nunca se presenta como completo.

**Decidir** si vale un campo para el volumen telediastólico del VD **absoluto**, o si queda
declarado para siempre.

### I-9 · La fila del implante percutáneo de la ESC 2020 se publica y no se evalúa

Su nota ᵉ define al paciente «sin tracto de salida nativo» como el que tuvo cirugía previa con
homoinjerto, injerto de vena yugular bovina o bioprótesis o conducto. **La app no registra ese
antecedente**, así que la fila se publica como contexto y la sección lo dice.

### I-10 · `ip_grado` nace en «Sin insuficiencia», y la corrección es LOCAL

Ese token **no distingue** «no hay insuficiencia pulmonar» de «nadie la evaluó» — la misma trampa
que `it_grado` resolvió con `_indITEvaluada`. La sección nueva lleva su propio predicado
(`ipEv`) y no afirma nada sin un parámetro de IP medido.

**Lo que queda abierto es que no hay un dueño ÚNICO**: `_indITEvaluada` vive en el panel y sirve a
varias secciones; el equivalente pulmonar es hoy una variable local de `_indTdFIP`. La próxima
sección que lea `ip_grado` va a tener que escribirlo otra vez, que es exactamente el defecto que un
dueño único evita.

⚠️ **Y `ip_reversion` queda FUERA de ese predicado y no es un olvido: es un CHECKBOX**, y `sv()`
devuelve su `.value`, que vale **«on» SIEMPRE**, marcado o no. Con él adentro el predicado era
verdadero en todo paciente.

### I-11 · El mapa nuevo nació porque tres mapas están cruzados o al borde

Medido con `wc -c` **antes** de escribir: `panel-evidencia.md` **35,3 KB** (ya cruzado desde el
2026-10-12), `tests-fichas.md` **34,2** y `vista-2d-valvulas.md` **34,0**. Por eso la documentación
de esta zona salió a **`docs/mapa/tanda-i-ete.md`** (19,8 KB) con la ficha de TC-518 adentro, y a
los cinco mapas con margen les entró un puntero.

**Los tres siguen esperando que alguien los parta.**

---

## Tanda «AJ2» — lo declarado y NO tocado (2026-10-23)

### AJ2-a · `vabConclusion` conserva una CONDUCTA en el informe firmado
La rama de 40 a 44 mm publica «Dilatación de la aorta de N mm — **control por imagen y
seguimiento del ritmo de crecimiento**». El AJ2-6 le retiró el grado («leve») porque estaba en su
lista; la conducta **no está** en la lista de esa orden. Medido: sale en el informe en los tres
estilos.
**Salida**: retirarla y dejar el hecho, como ya se hizo con «vigilancia estrecha» y «Heart Team»
en el trabajo «H». El intervalo de la ESC 2024 (Tabla 68, folio 119) vive en Evidencia.

### AJ2-b · `VAB_CONDUCTAS` del Laboratorio conserva un grado Y una conducta
Dos rótulos: `vigilancia_45` → «Vigilancia - 45 a 49 mm» con `crit:'Dilatacion moderada - control
por imagen'`, y `dilatacion_leve` → «Dilatacion leve - 40 a 44 mm» con `crit:'Control periodico'`.
El AJ2-6 acotaba su alcance al informe, el EN SUMA, el ⓘ, la conclusión de la VAB, Evidencia y el
PDF: **el Laboratorio no estaba**.
⚠️ **LAS CLAVES NO SE PUEDEN TOCAR**: el Laboratorio clasifica estudios guardados por ellas. Los
**rótulos** sí, como ya se hizo con `vigilancia_50` en el trabajo «H».

### AJ2-c · el informe pulmonar sigue siendo UN párrafo y no una línea por bloque
`pulAvFrases()` ya devuelve **una frase por bloque cargado** y el bloque 13c las une en un párrafo.
Esa unión es una decisión documentada de Maicol del **B2-E2** (2026-10-17), con su motivo escrito
en el código: «UN SOLO PÁRRAFO Y UNA SOLA LÍNEA, que es lo que la orden pide, y COMPUESTOS CON LAS
FRASES QUE YA EXISTEN». Partirlo en una entrada de `inf` por bloque **revierte** esa decisión.
**Salida**: decidir cuál de las dos lecturas vale, y si es la de AJ2 dejar escrito que reemplaza al
B2-E2.

### AJ2-d · el signo de McConnell afirma una propiedad del signo
El span publica «Presente — **altamente específico de TEP** ✓». Es una propiedad del SIGNO y no del
paciente, así que no es una probabilidad diagnóstica del estudio; por eso el AJ2-10 no la tocó, y
tampoco está en la lista. Queda declarado por si la próxima lectura quiere que el papel describa
sólo el hallazgo.

### AJ2-e · AJ2-16b NO SE ENCONTRÓ
«Una PSAP mostrada sin redondear». Censados los **quince** ids que nombran la PSAP y sus
escritores: `psap_calc` es un `input readonly` escrito con `.toFixed(0)`; `psap-interp` y
`tep-psap-interp` lo **leen**; `hb-psap-val`, `ht-psap` y `lab-psap-prom` usan `toFixed(0)`;
`cx-tp-res` imprime el **cociente** TAPSE/PSAP con `toFixed(2)` —tres decimales en la pantalla de
TEP, que es su precisión declarada— y `cx-gtp-papm` es la PAP **media** con `toFixed(1)`.
**No se inventó ningún arreglo.** Si el reporte apuntaba a otro nodo, hace falta el nombre.

### AJ2-f · AJ2-2 NO REPRODUCE
«La Evidencia de HTP listaba "Muesca; Diámetro de la arteria pulmonar" con la muesca y la
velocidad de la IP tildadas». Medido por los dos caminos: muesca + velocidad de la IP lista
exactamente esos dos signos, y el control cruzado (muesca + diámetro) lista los suyos.
`HTP_SIGNOS` y el marcado de la tabla concuerdan.
**La única escena que publica «Diámetro de la arteria pulmonar» sin que nadie lo tilde** es
`ip_ap_diam > 25`, donde `htpApSync` marca y **deshabilita** esa casilla — y ahí la lista tiene
**tres** signos, no dos.

### AJ2-g · `scripts/check_backticks.py` da falsos sobre una concatenación
El patrón legítimo `` `…` + k + `…` `` —tres apariciones en el grupo `suma` de
`scripts/_probe_aj2.mjs`— lo informa como acento grave suelto. Y **no alcanza un `ev()` suelto**,
que es donde se escapó uno esta tanda. **Salida**: enseñarle la concatenación, o aceptar los dos
límites y correr siempre `node --check` al lado.

### AJ2-h · TC-476 y TC-478 son inestables por orden de corrida
Su condición lee la clase `numdec` que la maquinaria de arranque pone sobre los `type=number`.
Corridos en una lista de dos o tres casos fallan; en la suite completa están verdes. **Medido en un
worktree de `2b9f3ef` con la misma lista: fallan igual allá.** Se suman a TC-137, TC-246, TC-249,
TC-252, TC-260, TC-395 y TC-484.

### AJ2-i — las TRES filas del ateroma dicen casi lo mismo (23/10/2026)

**Qué se encontró.** Con el grado 4 cargado, la caja de la aorta publica tres filas seguidas:
«Clasificación — descripción: *Ateroma de más de 5 mm*», «Descripción del hallazgo: *Ateroma de
más de 5 mm (grado 4).*» y «Grosor medido — grado en la escala: *6 mm — en la escala de Nicoara
corresponde al grado 4 (ateroma de más de 5 mm)*». La segunda **contiene** a la primera.
**Lo destapó MIRAR una captura**, no una medición.

**Qué puede causar.** Es consecuencia de AJ2-7a: hasta el 22/10 la primera decía «Ateroma de más
de 5 mm **— alto riesgo embólico**», o sea se distinguía de la segunda. Al retirar el riesgo —que
la fuente no publica— las dos quedaron casi idénticas. Dos redacciones de la misma afirmación en
la misma caja son dos cosas que se separan en la primera edición.

**Cómo se corrige.** Tres salidas, ninguna aplicada porque **no está en los diecisiete ítems** y
cambiar qué filas se muestran no estaba pedido: (a) esconder «Clasificación — descripción», cuyo
texto hoy está contenido en el de abajo; (b) dejarle sólo el nombre del grado («Grado 4»), sin su
descripción; (c) dejarlo como está y aceptar la repetición. **Lo decide Maicol.**

---

## Tanda «AJ3» — lo declarado y NO tocado (2026-10-23)

### AJ3-a · «Integrar al informe» sobre un bloque ya integrado: la lectura estrecha

**Qué se encontró.** El ítem AJ3-2c pide que volver a tocar «Integrar al informe» **regenere** el
bloque, con una confirmación si estaba editado a mano. Hoy ese botón es un **toggle**: sobre un
módulo ya integrado **retira**, y eso es una decisión documentada y deliberada —el comentario de
`amiloIntegrar` dice que evita ir a buscar el «✕ Retirar» de la tarjeta estando parado en la
calculadora—.

**Qué puede causar.** Aplicar el ítem a todos los casos **borra ese atajo** sin que nadie lo haya
pedido, y el ítem AJ3-2d dice explícitamente que «Retirar» queda como está.

**Cómo se corrigió, y qué queda.** Se aplicó la **lectura estrecha**: el botón pide confirmación y
regenera **sólo** si el bloque está editado a mano; en todos los demás casos retira, como siempre.
Con el barrido automático puesto, un bloque **no** editado ya está regenerado antes de que nadie
apriete nada, así que la lectura estrecha no pierde ninguna función. **Decisión de Maicol:** si se
prefiere que regenere siempre, es sacar el `if (!_amiloEstaEditado(k)) { amiloRetirar(k); return; }`
de `amiloIntegrar` — y entonces hay que decidir desde dónde se retira.

---

### [CERRADO 2026-10-24 · AJ7-2a] AJ3-b · la presión de llenado en reposo con «Normal» YA publica su línea

> **Cerrado.** La línea existente se **reescribió** —no se agregó una segunda, que era el riesgo
> que esta entrada nombraba— para incluir el «NO descarta». Fuente: Pieske 2019, folio 3307,
> hoja 11, la misma que el módulo ya cita. Medido en Chrome con la escena de puntaje intermedio.

**Qué se encontró.** El ítem AJ3-3 pedía agregar, **si no mostraba nada**, la frase «Una presión de
llenado normal en reposo no descarta el diagnóstico: la guía recomienda la prueba de esfuerzo». La
pregunta **sí muestra**: «Con una presión de llenado normal en reposo la guía recomienda continuar
la evaluación durante el ejercicio, por ecocardiografía de esfuerzo o por hemodinámica invasiva
(texto folio 3305).» Medido en Chrome con la escena de puntaje intermedio.

**Qué puede causar.** Agregar la frase pedida dejaría **dos** líneas diciendo casi lo mismo en el
mismo bloque, que es el defecto que AJ2-i ya tiene declarado para el ateroma.

**Cómo se corrige.** No se tocó. Lo que la frase pedida **agrega** y la actual no dice es el «**no
descarta**», y está verificado: Pieske 2019, **folio 3307, hoja 11** — «normal LVEDP or mPCWP levels
at rest do not exclude HFpEF» —, con la **Figura 4B del folio 3306** leída en imagen. Si Maicol lo
quiere, lo correcto es **reescribir la línea existente** para que lo incluya, no agregar una
segunda.

---

### [CERRADO 2026-10-24 · AJ7-2d] AJ3-c · el PDF NO avisa al exportar con un bloque editado y desfasado

> **Cerrado.** `generarPDF()` pregunta «¿Exportar igual?» nombrando los bloques desfasados.
> **No cambia lo que se publica**: si el médico acepta, el PDF sale idéntico. Medido: pregunta
> UNA vez nombrando «PostCEC — Cirugía Cardíaca», un «no» detiene y sin bloque editado no
> pregunta nada.

**Qué se encontró.** Caso no decidido del prompt, medido generando el PDF **de verdad** con el
bloque de HTP editado a mano y ya desfasado: 82 textos, **cero** menciones de «desactualizado»,
«sin actualizar», «edición», «cambiaron» ni «revisá este bloque», y el texto viejo del médico
impreso tal cual. El aviso ámbar es **sólo de pantalla**.

**Qué puede causar.** Un informe firmado puede salir con una hoja del ETT avanzado que el médico
escribió sobre datos que después cambió, sin ninguna señal en el papel ni en el momento de
exportar.

**Cómo se corrige.** Sin decidir. Las dos opciones razonables son un `confirm` al exportar
nombrando los bloques desfasados, o una marca en la propia hoja. **Ninguna se aplicó**: no estaba
pedido.

---

### [CERRADO EN PARTE 2026-10-24 · AJ7-2c] AJ3-d · «el médico borra todos los datos del módulo»: qué pasa HOY, medido en los diecisiete

> **Decidido:** un bloque cuyo módulo quedó sin datos **se retira solo**, salvo que esté editado
> a mano. `_AM_VACIA_RETIRA` se retiró y el refresco pasa a mirar `sec.hayDatos()`. Lo que eso
> alcanza hoy son **cuatro** módulos de diecisiete; los otros trece no declaran `hayDatos`.
> → **AJ7-b**, con el censo de los diecisiete al lado.

**Qué se encontró.** El otro caso no decidido. Vaciando los campos de los que cada módulo depende:

- **Dieciséis de diecisiete** generadores siguen produciendo texto («VRT sin datos», «no
  consignado», «Sin mediciones cargadas»), así que el bloque **se regenera con el texto de “sin
  datos” y sigue integrado**. El retiro automático **no se dispara**, porque sólo mira si `gen()`
  quedó **vacío**.
- **El único cuyo `gen()` queda vacío es `teer`**, y ya estaba en la lista de los que se retiran
  solos, así que **se retira** — igual que antes de esta tanda.

**Qué puede causar.** Un módulo vaciado sigue publicando su hoja en el PDF firmado, diciendo «sin
datos» línea por línea. Puede ser lo correcto —deja constancia de que se buscó— o no.

**Cómo se corrige.** Sin decidir, y por eso `_AM_VACIA_RETIRA` acota el retiro automático a los
ocho módulos que ya lo tenían: los nueve que estrenan refresco **no** heredaron esa conducta.
Cuando se decida, es borrar la lista y su `if` en `amiloRefrescarSiIntacto`.

---

### AJ3-e · la FOTO contra la que se mide el desfase NO viaja con el estudio

**Qué se encontró.** `am-editados` guarda **qué** bloques editó el médico, pero no **contra qué**
texto se compara. Al reabrir un estudio, la foto se vuelve a tomar con el `gen()` de ese momento.

**Qué puede causar.** Un estudio guardado con un bloque **editado y ya desfasado** reabre **sin** el
aviso ámbar, y lo gana recién cuando cambie un dato.

**Cómo se corrige.** Persistir la foto sería duplicar el texto de cada hoja dentro de cada estudio,
y el campo oculto viaja en `campos` al backup y al Excel del Laboratorio. Queda declarado y
cubierto por TC-520 (E3…E5).

---

### AJ3-f · el ⓘ del resultado NO es un término del glosario, y es a propósito

**Qué se encontró.** El ítem pedía «un ⓘ que diga que el resultado lo decide el médico y la
aplicación no lo calcula». El glosario del panel (`IND_TERMINOS`) exige `fuente`, `pagina` y
`referencia` **obligatorias**, y esto es una propiedad **de la app**, no una cita.

**Qué puede causar.** Meterlo al glosario obligaba a inventarle un documento, que es exactamente lo
que el registro de citas existe para impedir.

**Cómo se corrige.** Va por la **nota de la fila**, que es el mecanismo de ⓘ que el panel ya tiene
para una pregunta (`<details data-ind-info>`). No se agregó maquinaria. ⚠️ **La marca de esa fila
nunca puede ser `warn` ni `alarm`**: `_indFilaHTML` sólo pliega la nota cuando la marca no es una de
esas dos, y con cualquiera de las dos el ⓘ **desaparece**.

---

### AJ3-g · la Figura 5 de Pieske 2019 no se leyó en imagen

**Qué se encontró.** El texto del folio 3307 invoca la Figura 5A/B para el detalle del paso 4. La
figura es una **imagen** dentro del PDF y **no se renderizó**.

**Qué puede causar.** Citarla sería citar lo que no se leyó.

**Cómo se corrige.** No se cita. Lo que la app publica sobre la etiología sale del **texto** del
folio 3307 y de la **Figura 2** (folio 3300), las dos verificadas.

---

### AJ3-h · `check_backticks.py` volvió a dejar pasar trece acentos graves

**Qué se encontró.** Trece, todos en comentarios míos: doce dentro de `evCrudo` sueltos de las
sondas nuevas y uno dentro del cuerpo del caso nuevo antes de que existiera. El script **no
alcanza** un `evCrudo` suelto, y su cobertura del cuerpo de un caso depende de que el caso ya esté
en el archivo.

**Qué puede causar.** El `SyntaxError` apunta a la **apertura** del template, decenas de líneas
antes del culpable.

**Cómo se corrige.** Correr **los dos**: `python3 scripts/check_backticks.py` **y** `node --check`
sobre cada archivo tocado. Y ojo con quitarlos en lote: un `replace('`','')` sobre el bloque del
caso **se lleva también el acento grave que ABRE el template**, y el error que sale después apunta
al `return` de la primera línea.

---

## Tanda AJ4 · la aorta integrada (2026-10-23) — DECLARADO y NO arreglado

### AJ4-a · El índice de dimensión aórtica existe TRES veces y las tres son distintas

**Qué se encontró.** Después del AJ4-1 la aplicación tiene **tres** magnitudes que se llaman
«índice» sobre la aorta, y ninguna es la otra:

| Cuál | Qué divide | Quién lo usa |
|---|---|---|
| `aoSegIda(sg, x, src)` — **nuevo del AJ4-1** | el diámetro **de la raíz** sobre la superficie corporal | el grado de la raíz en pantalla, informe, EN SUMA y PDF |
| `aoIdaVal()` — del AJ1-E4 | el **mayor** de raíz, ascendente y los dos campos del módulo de aortopatía, sobre la superficie corporal | la apertura de la sección de aorta del panel de Evidencia y su fila del iDA |
| `marfan_ita` — campo que el médico tipea | el **iDA ascendente** de la Tabla 57, que es lo que la guía pide en el síndrome de Turner | los dos cortes de Turner (23 y 25 mm/m²) en `marfanEstado` |

**Qué puede causar.** Los tres coinciden en el paciente común —raíz mayor que ascendente, sin
módulo de aortopatía cargado— y **divergen justo en el paciente que los necesita**: con la
ascendente mayor que la raíz, el panel puede abrir por índice mientras la cápsula de la raíz dice
normal. Eso es **correcto** —la dilatada es la ascendente— pero se lee como una contradicción, y
nada en la pantalla explica que son dos preguntas distintas.

**Cómo se corrige.** No se unifican: cada uno contesta otra cosa y la guía los publica por
separado (el iDA del apartado 9.2.1.1 es de la raíz, el de la Tabla 57 es ascendente). Lo que falta
es que la fila del iDA del panel **diga qué diámetro está indexando**, y que `marfan_ita` se rotule
«iDA ascendente» en vez de «Índice de tamaño aórtico». Las dos son texto clínico: decisión de
Maicol.

---

### AJ4-b · La ESC 2024 da DOS cortes para la raíz de la mujer, 36 y 34 mm

**Qué se encontró.** El apartado 9.2.1.1 (folio 71) y la Figura 24 (folio 76) dicen **36 mm**. La
**Figura 5 (folio 28)** del mismo documento, «valores en el límite superior de la normalidad»,
imprime para el seno de Valsalva **40 mm en el varón y 34 mm en la mujer**. Verificado
**renderizando la figura**: por texto extraído sus dieciséis números salen sin emparejar.

**Qué puede causar.** Entre 34 y 35,9 mm la aplicación llama normal a una raíz que la Figura 5 de
su propia fuente ya cuenta por encima del límite de normalidad.

**Cómo se corrige.** La orden de esta tanda fija 36 citando las dos primeras, y eso es lo que se
aplica. Mover el corte a 34 es contenido clínico: decisión de Maicol. Queda registrado en
`docs/fuentes/FUENTES.md` → «La tanda AJ4» y en el `valor` de la ficha `AOR-004`.

---

### AJ4-c · Los cortes de los otros cuatro segmentos: uno coincide, tres no

**Qué se encontró.** La orden decía «verificá su fuente en la biblioteca y reportá». No hay fuente
que los publique con esos valores. La nota del Laboratorio los atribuía a la **«ESC 2021»** y **ese
documento no existe en la biblioteca** —censada entera, las tres guías de 2021 son de insuficiencia
cardíaca, de amiloidosis y de prevención del ictus—. Contra la **Figura 5 de la ESC 2024**, que es
el único sitio que publica límites por segmento y **por sexo**:

| Segmento | La app | La Figura 5 (varón / mujer) |
|---|---|---|
| Unión sinotubular | > 38 mm | 38 / **33** |
| Aorta ascendente | > 40 mm | 40 / **36** |
| Cayado | > 40 mm | **37 / 34** (arco proximal) |
| Aorta torácica descendente | > 35 mm | **29 / 26** proximal · **23 / 20** distal |

**Qué puede causar.** En la mujer, los cuatro cortes de la app son **más altos** que el límite que
su propia fuente publica, así que la app calla dilataciones que esa figura marcaría. Y la
descendente no tiene un solo valor: la guía la parte en dos tramos y la app la mide como uno.

**Cómo se corrige.** Esta orden prohíbe tocarlos. Lo único que se hizo es retirar la atribución
falsa a la «ESC 2021». Alinearlos —y, en la descendente, decidir si se parte en dos tramos— es
contenido clínico: decisión de Maicol.

---

### AJ4-d · `ao_sin` y `marfan_ao_seno` siguen siendo dos entradas del mismo diámetro

**Qué se encontró.** Es la deuda **G1-11**, que esta tanda vuelve a tocar: el módulo de aortopatía
hereditaria tiene sus propios `marfan_ao_seno` y `marfan_ao_ascendente`, que son una segunda copia
de `ao_sin` y `ao_tub`. El AJ4-1 no los unificó porque no estaba autorizado a hacerlo.

**Qué puede causar.** El nuevo criterio de la raíz actúa sobre `ao_sin`; `marfanEstado` decide con
`marfan_ao_seno`. Un paciente con los dos cargados y distintos tiene dos verdades sobre su raíz en
el mismo estudio. Y es lo que bloquea el ítem **AJ4-3**: su paréntesis —«Síndrome de Turner (raíz
aórtica 38 mm; …)»— tendría que publicar **cuál** de los dos.

---

### AJ4-e · Los cuatro insumos que la Evidencia lee de la pantalla, y los que no

**Qué se encontró (inventario del AJ4-0).** La sección de aorta del panel lee de la sección VAB
`vab_cx_valvular`, `vab_fr_crecimiento`, `vab_fr_familiar` y `vab_riesgo_qx`, **en un solo
sentido**. Y **pregunta de nuevo** dos cosas que la pantalla ya tiene:

| La Evidencia pregunta | La pantalla ya lo tiene | Por qué no se unificó |
|---|---|---|
| «Deseo de embarazo» (`ao.embarazo`, tres estados) | `vab_fr_embarazo` (casilla: marcada o nada) | **La casilla no distingue «no» de «no consta»** y la pregunta del panel sí. Unificarlas convierte un «no contestado» en un «no», que es la dirección peligrosa |
| «Otra cirugía cardíaca prevista» (`ao.cxotra`, tres estados) | `vab_fr_cx` (casilla) | idem |
| «Hipertensión resistente» (fila clínica, sin control) | `vab_fr_hta` (casilla) | la fila clínica es de SOLO LECTURA y no se puede contestar |
| «Longitud de la aorta ascendente» (fila clínica, sin control) | `vab_fr_longitud` (casilla) | idem |

**Qué puede causar.** `S.nFact` del motor de aorta cuenta **tres** factores (crecimiento, familiar
y embarazo) y la Tabla 38 tiene **ocho**: un paciente cuyo único factor marcado sea la hipertensión
resistente o la longitud **no dispara** la fila Clase IIb · Nivel B que le corresponde.

**Cómo se corrige.** Es lo que el ítem **AJ4-5** llama «cada pregunta una sola vez» y es lo que
esta tanda **no** hizo: la orden misma dice «si un dato tiene estados distintos y no hay forma
limpia de unificarlo, no inventes: dejá ambos y reportá el conflicto». El conflicto es el de la
tabla de arriba. La salida limpia es que las seis casillas `vab_fr_*` pasen a **tres estados**
—Sí / No / No consta—, que es un cambio de interfaz y de vocabulario de Excel: decisión de Maicol.

---

### AJ4-f · Lo que esta tanda NO hizo: AJ4-3, AJ4-6 y la fusión de AJ4-5

**Qué se encontró.** Los tres ítems reescriben lo que dice un informe **firmado** o la arquitectura
del panel, y los tres dependen de decisiones que el inventario del AJ4-0 recién destapó:

- **AJ4-3** (el bloque único de aorta en informe y EN SUMA) necesita: cuál de los tres índices se
  publica entre paréntesis (**AJ4-a**), cuál de los dos diámetros de la raíz (**AJ4-d**), y que se
  confirme que la aortopatía hereditaria pierde del papel firmado su umbral, su clase y su folio
  —hoy el EN SUMA publica «indicación quirúrgica Clase I»—, que es lo que la regla de la orden
  pide pero no está escrito como ítem.
  **Medido y verificado para cuando se haga:** la guía indexa **sólo Turner**; Marfan y
  Loeys-Dietz son absolutos (ver `docs/fuentes/FUENTES.md` → «La tanda AJ4»). O sea que el «si la
  guía lo confirma, Loeys-Dietz» del ítem **se resuelve que NO**.
- **AJ4-6** (el PDF) depende de AJ4-3: su hoja «COARTACION DE AORTA» es el mismo texto que el
  párrafo del informe, así que recién se puede desduplicar cuando ese párrafo se mueva.
- **La fusión de los cuatro paneles de Evidencia en uno** (resto de AJ4-5) depende de **AJ4-e**, y
  además toca `IND_SECS`, la numeración de citas por sección y la regla de que ningún título sea
  prefijo de otro — con TC-322 y TC-512 midiendo las dos cosas.

**Lo que SÍ se hizo de AJ4-5** está en el commit `1ba0cee`: las cuatro recomendaciones de la VAB a
la vista, el tono neutro, el texto que el panel decía dos veces y el aviso de Turner.

---

### AJ4-g · `check_backticks.py` dejó pasar DOS acentos graves más

**Qué se encontró.** Uno dentro de un `evCrudo` suelto de la sonda nueva —que el script no
alcanza, como ya declaró **AJ3-h**— y uno dentro del cuerpo de `TC-521` escrito antes de que el
caso existiera en el archivo.

**Qué puede causar.** El `SyntaxError` apunta a la **apertura** del template, decenas de líneas
antes del culpable: la primera vez señaló el `caso('TC-494'` y el culpable estaba 260 líneas más
abajo.

**Cómo se corrige.** Correr **los dos**, siempre: `python3 scripts/check_backticks.py` **y**
`node --check`, y en ese orden — `node --check` sin el otro no dice dónde está.

---

## Tanda «AJ5» · Tipo de IM y Carpentier en Válvulas, y el strain del VD (2026-10-24) — DECLARADO y NO arreglado

### AJ5-a · `_labUsaTeer` cuenta ahora transtorácicos en «Estudios con evaluación TEER»

**Qué se encontró.** `_labUsaTeer` devuelve verdadero en cuanto `teer_tipo_im` tiene texto
(`_labCampoRaw(i,'teer_tipo_im') !== ''`). Desde la AJ5-2 el campo de Válvulas escribe ese nodo
**sin guarda** —y tiene que escribirlo, porque es lo que hace funcionar la frase del corte
alternativo, `calcTEER` y el recuadro de reparabilidad—, así que un transtorácico con el Tipo de IM
consignado en Válvulas entra a ese denominador.

**Qué puede causar.** El panel del Laboratorio baja todos sus porcentajes sin que nadie haya
cambiado de práctica, que es textual el argumento con el que la guarda de `tipo !== 'coapt'` se
puso en el segundo brazo de esa misma función.

**Cómo se corrige.** Gatear el primer brazo por un campo que sólo se cargue dentro del módulo TEER
—`teer_pasp`, `teer_area_mitral` o uno de los seis criterios anatómicos— en vez de por el tipo de
IM, que desde hoy es un dato de Válvulas. Es otro módulo y el criterio del denominador es clínico:
**no se tocó**.

---

### AJ5-b · El Carpentier de un transtorácico no llega a la columna «Carpentier ETE» del Excel

**Qué se encontró.** `ete_carpentier` NO tiene columna en el libro de 440 —verificado— pero sí
viaja al PPT (`_pptSel('ete_carpentier')`) y a la tabla de datos usados del 3D
(`M3D_TABLA`). Con la guarda de «es un ETE» funcionando como debe, un transtorácico con el
Carpentier consignado en Válvulas deja esos dos vacíos mientras el informe firmado dice
«(Carpentier II)».

**Qué puede causar.** El ateneo proyecta un PPT sin el Carpentier al lado de un informe que lo
publica.

**Cómo se corrige.** Que esos dos lectores pregunten por `vmCarpEfectivo()` en vez de por el nodo
del ETE. Son dos superficies firmadas y el cambio es de contenido: **se reporta**.

---

### AJ5-c · Dos paréntesis seguidos en la oración de la mitral

**Qué se encontró.** `_imFundG` —el fundamento que el médico escribe a mano, y que sólo aparece
cuando el grado manual discrepa del calculado— ya es un paréntesis. Con él puesto, la frase sale
«insuficiencia severa (jet excéntrico) (mecanismo secundario; Carpentier II)».

**Qué puede causar.** Nada falso: los dos dicen cosas distintas. Es redacción del papel firmado.

**Cómo se corrige.** Fusionarlos reescribiría el texto del médico, así que quedan separados hasta
que Maicol decida. Lo mismo pasa en el VD con el strain, que viaja dentro de `funcTxt` mientras el
TAPSE y la S′ viajan en su propio paréntesis.

---

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

### AJ5-h · El scroll horizontal a 820 px de la pestaña Válvulas es PREEXISTENTE

Medido en los dos árboles, sin tocar nada: `scrollWidth` 930 contra `clientWidth` 820, **el mismo
par en HEAD y en el árbol nuevo**. No es de esta tanda y la fila de los tres campos no desborda su
contenedor en ninguno de los cinco anchos medidos. Queda anotado para que la próxima tanda que
mida esa franja no lo cuelgue de la AJ5. `check_mobile.js` mide 360 y 390, así que 820 px no está
cubierto por ningún barrido automático.

---

### AJ5-i · El `pattern` global de los campos numéricos excluye el signo menos

El bloque que convierte los `input[type=number]` a `type="text" inputmode="decimal"` les pone
`pattern="[0-9]*[.,]?[0-9]*"`, que **no admite el signo menos** — y `vd_strain_pl` es un campo que
pide signo. Hoy es **inerte**: nada llama `checkValidity()` en todo el archivo (verificado, cero
coincidencias) y el `pattern` sin un `form` que valide no hace nada. Queda declarado porque el día
que alguien active validación, este campo quedaría inválido y el único síntoma sería un borde rojo
sin mensaje. También lo cazó `/sharp-edges`.

---

### AJ5-j · El arnés levantaba el login a mitad de la corrida, y era un falso rojo de dos horas

**Qué se encontró.** Hay casos que ejercitan `cerrarSesionReal()` —el botón «Cerrar»— y eso borra
`ett_auth` y levanta `#login-overlay`, que es `position:fixed` con z-index altísimo: **todo caso
posterior que CLIQUEE mide debajo de él y sus clics no llegan**. TC-421(e) ya se reabría a mano por
este motivo y lo dice en su comentario; el caso de la corrección del Doppler esconde el overlay
pero **no repone la clave**.

**Cómo se vio.** Agregar los cinco casos de la AJ5 no cambió el árbol pero sí el **ORDEN**, y
TC-252 y TC-246 pasaron a correr DESPUÉS del que cierra sesión: salían rojos en la corrida completa
y **verdes aislados**, dos veces, en el mismo árbol sellado. El mensaje de TC-252 lo decía con
todas las letras: «TAPADO POR: DIV#login-overlay[fixed]». Y una segunda corrida completa los dio
**verdes** sin tocar nada, así que el patrón era de orden y no de código.

**Qué puede causar.** Es el modo de falla más caro de este arnés: un rojo que no apunta a su causa
y que aparece y desaparece según cuántos casos haya. Con la suite creciendo, cada tanda nueva puede
mover el orden y romper otro puñado de casos que cliquean.

**Cómo se corrigió.** Una línea en el bucle de casos, al lado de `resetVisor` y por el mismo
argumento —un caso que hereda estado falla con un diagnóstico que no apunta a su causa—: antes de
cada caso se repone `ett_auth` y se baja el overlay. **No se tocó el código de la app.**

---

## Tanda «AJ6» · Fallot, eco pulmonar en columnas, Config y el buscador (2026-10-24) — DECLARADO y NO arreglado

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

### AJ6-c · Las dos salvedades de la taquicardia ventricular siguen nombrando criterios y manejo

> **DECISIÓN DE MAICOL, 2026-10-24 (tanda AJ7, commit 1):** se dejan como están **hasta tener
> fuente**. No se tocaron. Lo único que la AJ7 movió del territorio de la TV es `sumaTV`
> —«Taquicardia ventricular sostenida documentada — valorar estudio electrofisiológico»—, que
> viajaba en `resumen` y por lo tanto al PDF de congénitas y al PPT: eso **sí** es una conducta y
> salió con el resto. Lo que la TV tiene que decir sigue saliendo por `salvedadTV`, que viaja en
> `gOtro` y llega a las tres superficies a la vez.

**Qué se encontró.** `salvedadTV` tiene cuatro ramas y dos de ellas dicen, dentro del cuerpo del
informe, cosas como «su manejo —estudio electrofisiológico, mapeo de istmos anatómicos— es una
indicación por sí misma» y «no modifica la indicación, que ya es Clase I por la situación
clínica». Eso es **manejo y clase**, que es justo lo que esta tanda mandó a la Evidencia.

**Por qué NO se tocó.** La Evidencia de Fallot (`_indTdFIP`) **no tiene ninguna fila ni
recomendación sobre la taquicardia ventricular**: sus dieciséis filas son la IP, el gradiente, la
presión del VD, las dos fracciones de eyección, los volúmenes, el ejercicio, la IT y las cinco
preguntas clínicas. Sacar la salvedad del informe sin tener dónde ponerla **perdería contenido
clínico**, que es lo contrario de lo que la orden pide («ese contenido ya está en la Evidencia: no
lo agregues, verificá que esté» — y ahí no está).

**Cómo se corregiría.** Agregar a `_indTdFIP` las filas de la TV con su folio de la ESC 2020 y
recién entonces retirar la salvedad del cuerpo. Es contenido clínico nuevo en el panel.
**Decisión de Maicol.**

---

### AJ6-d · El orden de los campos de la pantalla de Fallot no se tocó, por orden expresa

**Qué se encontró.** La pantalla de la tetralogía sigue con sus campos en el orden de siempre, que
**no es** el de los renglones del informe: en pantalla el gradiente del TSVD viene después de la
función del VD, y en el papel va en el primer renglón, con el diámetro.

**Por qué no se tocó.** La orden lo excluye con todas las letras: «El orden de los campos de la
pantalla de Fallot NO entra acá (queda para otro prompt, tras un esquema)».

**Cómo se corregiría.** Con el esquema que la orden anuncia. Hoy el único dueño del orden del
papel son los tres grupos de `tdfConclusion`, y el de la pantalla es el marcado.

---

### AJ6-e · «Lo que falta contestar» es el único bloque plegado del panel que nace cerrado con algo adentro

> **DECISIÓN DE MAICOL, 2026-10-24 (tanda AJ7, commit 1):** **queda plegado**. No se tocó.
> ⚠️ La orden de la AJ7 lo nombra «AJ6-d»; en este archivo **AJ6-d** es el orden de los campos de
> la pantalla de Fallot y el bloque plegado es **AJ6-e**. La decisión se anota donde corresponde.

**Qué se encontró.** El bloque de lo que falta nace **plegado**, que es lo que la orden pide
(«compacto»). La estenosis mitral tiene el otro bloque plegado del panel, pero el suyo describe una
condición hipotética («Si fuera reumática»); éste enumera **lo que el médico tiene que contestar
para que la guía decida**.

**Qué puede causar.** Que el médico no vea que faltan datos: el panel tiene un bloque cerrado
donde antes tenía una lista a la vista.

**Cómo se corregiría.** Tres caminos, todos cosméticos y los tres una decisión: dejarlo abierto
cuando hay **más de N** faltantes; nacer abierto siempre y plegarse sólo cuando no hay ninguno
(hoy en ese caso el bloque no se emite); o poner el conteo **afuera** del summary —adentro no
puede ir, porque `_indRepintarConservando` indexa por ese texto y el bloque se cerraría solo al
contestar—. **Decisión de Maicol.**

---

### AJ6-f · El desborde horizontal de la tabla del panel se cerró SÓLO para la sección compacta

**Qué se encontró.** A 390 px, la tabla de una sección del panel desborda su caja cuando una fila
tiene un valor largo con `white-space:nowrap` —medido: «telesistólico 24 ml/m² · telediastólico 70
ml/m²» mide 362 px en un panel de 310—. **Viene de antes de esta tanda**, medido en el árbol de
HEAD. El modo compacto de AJ6-2 lo cierra para la Fallot porque le saca el `nowrap` al valor; las
otras catorce secciones lo conservan.

**Qué puede causar.** Texto escondido a la derecha dentro del panel, sin que la página desborde:
el médico tiene que arrastrar la tabla. No afecta al informe ni al papel.

**Cómo se corregiría.** Sacar el `nowrap` del valor en todas las secciones, o acotarlo con una
media query por debajo de 560 px. Toca las quince secciones del panel, así que es una tanda propia.

---

### AJ6-g · Quedan ~7.000 perfiles temporales de Chrome en `$TMPDIR`

**Qué se encontró.** Al barrer los procesos de una corrida interrumpida se contaron **~7.285**
entradas con «chrome» en `/var/folders/*/*/T/`. Es la cola del defecto que `CLAUDE.md` ya documenta
(«10 Chrome huérfanos con 60 hijos y 1075 perfiles temporales sin borrar, 2,9 GB»), que el arnés
cerró para las corridas **nuevas** con su barrido de `exit`: lo que quedó es de antes.

**Qué puede causar.** Disco ocupado y nada más: son perfiles vacíos de Chrome headless.

**Cómo se corregiría.** Un borrado manual con el Chrome del arnés cerrado. No se hizo acá: esta
tanda no tenía orden de tocar `$TMPDIR` y un borrado por patrón con una corrida en curso es
exactamente el `pkill` que este repo ya pagó una vez.

---

## Tanda «J2» — lo que quedó declarado y no tocado (2026-10-24)

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

### J2-b · El puntaje 0 del score de amiloidosis no distingue «ausente» de «sin cargar»

**Qué se encontró.** Con hipertrofia cargada y los cinco criterios del score marcados como
ausentes, el puntaje es **0** y la pantalla dice «Completá los parámetros» — el mismo texto que da
un formulario en blanco. Los cinco campos de puntos son `<input type="hidden">` que nacen en `'0'`,
así que la aplicación no puede distinguir los dos estados.

**Por qué no se tocó.** La rama del puntaje 0 es la del primer `if` y esta tanda no la nombra.
Resolverlo bien exige un tercer estado en esos cinco campos —«no evaluado» frente a «ausente»—,
que es un cambio de modelo de datos con efecto en el Excel y en los estudios guardados.

**Qué puede causar.** Un score genuinamente 0, con los cinco criterios mirados y ausentes, se
publica como si nadie hubiera cargado nada. No afirma de más, que es el lado seguro, pero pierde
una medición real.

**Cómo se corregiría.** Dar a los cinco hidden un valor vacío de fábrica y tratar `''` como «no
evaluado», con su migración para los estudios guardados. Es una tanda propia.

---

### J2-c · El Laboratorio conserva su propia banda del score, con otros cortes

**Qué se encontró.** `_labAmilBanda` clasifica el score ETT en **Baja (<6) / Intermedio (6-7) /
Probable (≥8)**, que no son los cortes de la pantalla —la pantalla tiene **un** corte, el de 8— y
cuyas etiquetas «Baja» e «Intermedio» son las dos que esta tanda retiró de la pantalla por no
tener fuente. Lo usan el filtro de cohorte `coh-amil`, el gráfico del dashboard de la subtab
Avanzado y la diapositiva del PPT estadístico.

**Por qué no se tocó.** Es un clasificador de **cohorte**, con otro dueño y otro propósito: agrupa
estudios para una estadística, no gradúa a un paciente. La orden pide **reportar** las superficies
que usaban «intermedio» o «bajo», no cambiarlas, y mover estos cortes cambia un filtro guardado y
el eje de un gráfico.

**Qué puede causar.** Un mismo estudio con 6 puntos sale «no alcanza el corte de 8» en la pantalla
y «Intermedio (6-7)» en el Laboratorio. Las dos cosas son ciertas en su propio contexto, pero la
palabra «Intermedio» sigue viva en una superficie de la app.

**Cómo se corregiría.** O renombrar los tres tramos del Laboratorio a algo que no afirme un grado
—por ejemplo «menos de 6», «6 a 7», «8 o más»—, o alinearlos al corte único de 8. Lo primero no
cambia ningún dato y es reversible. Decisión de Maicol.

---

### J2-d · La Evidencia de hemodinámica no puede publicar una clase ni un nivel

**Qué se encontró.** Las dos recomendaciones de la ASE 2025 sobre qué informar (folio 167) **no
traen clase ni nivel**: ese documento no usa esa escala. Lo mismo con Grossman y Braunwald, que
son libros de texto, y con el «2,2 o menos» del consenso argentino, que vive en una columna
comparativa de su Tabla 1.

**Por qué queda así.** Escribir una clase que la fuente no publica es inventarla, que es lo que
este repositorio prohíbe. La sección lo declara en la nota de cada bloque.

**Qué puede causar.** Es la única sección del panel sin una sola fila graduada. Un médico
acostumbrado a las otras puede leer esa ausencia como un olvido.

**Cómo se corregiría.** No se corrige: se declara, que es lo que se hizo. Si alguna vez entra a la
biblioteca una guía que gradúe estas mismas afirmaciones, la fila la puede citar.

---

### J2-e · La geometría de las media queries sigue sin medirse en el arnés de la suite

**Qué se encontró.** La ventana de las media queries del panel y de la pestaña de cardio-oncología
abre por debajo de 1100 px y el arnés de `test_clinico.mjs` corre por encima, así que TC-533 no
puede medir el reparto de columnas en el celular. Es la misma limitación que TC-522 (A4c) del AJ5
y TC-529 del AJ6 ya declararon.

**Qué puede causar.** Nada nuevo: lo cubren `scripts/check_mobile.js` y las capturas de la sonda
`_probe_hcae.mjs`, que sí emulan el viewport. Queda escrito para que nadie lea el verde de TC-533
como una medición del celular.

**Cómo se corregiría.** Emular el viewport por CDP dentro del arnés de la suite, como hace la
sonda. Toca el arnés de los 547 casos, así que es una tanda propia.

---

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


# Tanda «AJ7» — los pendientes de AJ3, AJ5, AJ6, J y J2, y el G-a (2026-10-24)

## Lo que esta tanda CERRÓ

**AJ6-a**, **AJ6-b**, **AJ3-b**, **AJ3-c**, **AJ3-d** (en parte), **AJ2-i**, **AJ5-d**,
**AJ5-e**, **AJ5-f**, **AJ5-g**, **J-a**, **J-b**, **J2-a**, **J2-f**, **G-a** y **G-e**.
Cada una lleva su nota de cierre arriba, en su propia entrada.

Y dos decisiones tomadas sin tocar código: **AJ6-c** —las salvedades de taquicardia ventricular
se dejan como están hasta tener fuente— y **AJ6-e** —«Lo que falta contestar» queda plegado—.

---

## AJ7-a · El gradiente de la línea de Fallot sigue pudiendo salir de la válvula pulmonar

**Qué se encontró.** La línea del EN SUMA dejó de publicar la insuficiencia pulmonar, pero el
gradiente que publica (`g`) **cae en `vp_gmax`** cuando el campo propio de la sección
(`tdf_grad_tsvd`) está vacío — y `vp_gmax` es el gradiente **transvalvular pulmonar**, que la
sección de la válvula pulmonar también publica más arriba en el mismo EN SUMA.

**Por qué no se tocó.** La orden nombra la IP y nada más. Mover un segundo dato clínico que la
orden no nombra es lo que `CLAUDE.md` prohíbe.

**Qué puede causar.** Para un estudio sin `tdf_grad_tsvd` cargado, el mismo número puede
aparecer dos veces en el EN SUMA con dos rótulos distintos. Con el campo propio cargado —que es
el caso para el que ese campo existe— no pasa.

**Cómo se corregiría.** Que la línea publique el gradiente **sólo** cuando viene del campo
propio, y que la reserva (`vp_gmax`) siga alimentando el CUERPO del informe, donde ya se declara
de dónde salió («gradiente transvalvular pulmonar del estudio»). Es contenido clínico y lo decide
Maicol.

---

## AJ7-b · Trece de los diecisiete módulos integrables no declaran `hayDatos`

**Qué se encontró.** El retiro automático del bloque pasa a mirar `sec.hayDatos()`. Censados los
diecisiete generadores con el formulario vacío, medido en Chrome:

| Módulo | `hayDatos()` con el formulario vacío | Lo que su `gen()` emite |
|---|---|---|
| `teer` | **false** | vacío — ya se retiraba |
| `pulm` | **false** | vacío — ya se retiraba |
| `pop` | **false** | **377 caracteres** de «no consignado» — **ésta es la que la AJ7 cierra** |
| `hfpeff` | **true**, y es correcto | su `hayDatos` contesta si el score APLICA, no si hay datos |
| los otros **trece** | **no la declaran** | texto de «sin datos»: «VRT sin datos», «no consignado», «Sin mediciones cargadas», «Score… 0 / 10 puntos» |

**Qué puede causar.** Un módulo vaciado sigue publicando su hoja en el PDF firmado, diciendo «sin
datos» línea por línea. Puede ser lo correcto —deja constancia de que se buscó— o no.

**Cómo se corregiría.** Darle `hayDatos` a los trece. Cada uno necesita saber cuál es el conjunto
de **sus** campos propios: es conocimiento clínico por módulo y esta orden no autoriza a
inventarlo. Un predicado genérico leído del TEXTO —«no hay ninguna línea `rótulo | valor` con
valor»— se descartó midiendo: con el formulario vacío, `aoete` ya emite dos valores reales
(«Ulceración | No», «Calcificación | No / mínima») y `dpt` otro («Tamaño | Normal, sin derrame»),
así que la heurística los conservaría igual y agregaría fragilidad sin cambiar el resultado.

---

## AJ7-c · La Evidencia de constricción ahora SÍ abre con un perfil diastólico de rutina

**Qué se encontró, y está medido.** La compuerta nueva de `_indConstr` incluye `e′` entre los
datos propios, que es lo que la orden pide. Las velocidades anulares están cargadas en casi
todos los estudios, así que un perfil diastólico de rutina —`e_sep 8`, `e_lat 10`, `onda_e 70`,
**cero** datos del pericardio— **abre** la sección, con todas las filas del pericardio en «—».
Medido A/B contra HEAD: ese escenario pasa de `_indConstr() === null` a devolver un objeto.

**Por qué quedó así.** La orden nombra los cuatro datos propios y `e′` es uno de ellos.

**Qué puede causar.** Ruido: una sección más en el panel para cualquier estudio con el Doppler
tisular cargado. **No cambia el papel firmado**: el módulo no concluye nada —su compuerta,
`espEval`, no se movió— y el informe no gana una sola línea.

**Cómo se corregiría.** Sacar `e′` de la lista de datos propios y dejar los tres del pericardio
—rebote septal, patrón venoso hepático y su cociente—, que es lo que de verdad no se comparte
con ningún otro módulo. Es una línea. **Decisión de Maicol.**

---

## AJ7-d · «Un solo centro» no se escribió en la Evidencia de VExUS

**Qué se encontró.** La orden pedía que la Evidencia dijera «145 pacientes de cirugía cardíaca,
**un solo centro**». El registro de fuentes de este proyecto verifica, del resumen de la página 1,
la población (145 pacientes de cirugía cardíaca) y el número de valoraciones (706). **No**
verifica que el estudio sea unicéntrico.

**Por qué no se escribió.** La orden de esta tanda prohíbe abrir archivos fuera del proyecto, y
la biblioteca de guías vive fuera. Lo que no se verificó no se publica.

**Cómo se cierra.** Abrir `Vexus.pdf` y leer la sección de métodos. Si lo dice, es una palabra.

---

## AJ7-e · Los otros quince `.vinfo-btn` siguen contados por `check_mobile.js`

**Qué se encontró.** Los dos globos que la J2 y la G sumaron llevan el piso táctil sin la media
query y el barrido vuelve a **63 / 72 con 17 ALTA**. Los otros quince siguen midiendo entre
15×11 y 17×13 px con el mouse, y 44×44 con el dedo.

**Por qué no se tocaron.** Sacarles el gate a los diecisiete cambia el blanco de clic de quince
controles a la vez, y bajaría el barrido muy por debajo del objetivo que la orden fija.

**Cómo se corregiría.** O que `check_mobile.js` emule `pointer: coarse` —y entonces los
diecisiete dejan de aparecer, que es lo que un teléfono ve—, o sacarle el gate a `.vinfo-btn`
entero. **Es una tanda propia.**

---

## AJ7-f · La tanda G no ejecutó quince casos, y nadie lo notó

**Qué se encontró, contando.** La suite tiene **549 casos**: `TC-1` a `TC-534` —sin huecos y sin
duplicados— **más quince `TC-GR-01` a `TC-GR-15`**. El reporte de la tanda **G** dice «suite
530/534, corrida en nueve lotes de 60»: ese 534 es el conteo de los **numerados**, así que sus
lotes **no incluyeron un solo `TC-GR-*`**. El reporte de la J2 decía 548, que es 549 menos el
TC-318 excluido, y ése sí los cubría.

**Qué puede causar.** Quince casos sin correr durante una tanda entera, con un total que se lee
como completo.

**Cómo se corrige, y ya se aplica.** El denominador se **cuenta** antes de armar los lotes
(`grep -oE "^caso\('[^']+'" scripts/test_clinico.mjs | sort -u | wc -l`) y la suma de lo
ejecutado se compara con ese número. La AJ7 corrió en lotes de 55 cubriendo los 549.

---

## AJ7-g · Los perfiles temporales viejos siguen ahí, y NO se borraron

**Censado**, en `$TMPDIR`:

| Qué | Cuántos | Cuánto ocupan |
|---|---|---|
| `com.google.Chrome.*` | **7.836** | **16 KB** en total — son entradas vacías |
| `ecosmart-test-*` (perfiles de la suite) | **4** | **414 MB** |
| `ecosmart-aj7-*` (los de esta tanda) | **0** | el barrido de `exit` de la sonda los borra |
| **todo `$TMPDIR`** | **7.840** | **793 MB** |

El más viejo es del **19 de septiembre**. Los 414 MB están en **cuatro** directorios, todos del
24/10: son perfiles de Chrome que la suite dejó al morir una corrida.

**No se borró nada**, que es lo que la orden pide. Para borrarlos, con el Chrome del arnés
cerrado:

```bash
rm -rf "$TMPDIR"/ecosmart-test-*
```

⚠️ **Nunca con una corrida en curso**: es el `pkill` que este repo ya pagó una vez.

---

## AJ7-h · G-c: qué pierde el Laboratorio, y una propuesta SIN aplicar

**Qué lee hoy.** `_labPopResumen(infs)` saca el patrón del **TEXTO integrado** del estudio
guardado, con `txt.match(/## Patrón hemodinámico\n([^\n]+)/)` sobre `campos['am-txt-pop']`.
Por el mismo camino saca el índice cardíaco promedio, con `/Índice cardíaco \| ([0-9.]+)/`.
El tipo de cirugía y el soporte por droga **no** salen del texto: salen de los campos
(`_labCampoRaw(i, 'pop_cx_tipo')` y `c['pop_' + k + '_activa__chk']`).

**Qué estudios quedan sin dato.** Los que se integren **desde la tanda G**, porque esa tanda
sacó la sección «## Patrón hemodinámico» del texto. Los **ya guardados conservan su texto y
siguen contando**: no se migró nada, y esta tanda tampoco migra nada. O sea que la distribución
de patrones del panel va a ir quedando congelada, no vacía: cuenta los viejos y no los nuevos,
que es peor que estar vacía porque se lee como una distribución al día.

**Propuesta, SIN aplicar.** Un campo oculto `pop_patron_k` —la **clave** del patrón
(`taponamiento`, `hipovolemia`, `falla_vi`, `falla_vd`, `vasoplejia`, …), no su rótulo— escrito
por `popConclSync()` desde el MISMO `popEsquema()` que pinta la pantalla. Viaja en `campos` con
el estudio, como cualquier campo oculto, y `_labPopResumen` lo lee con `_labCampoRaw(i,
'pop_patron_k')` cayendo al `match` del texto para los estudios viejos.
**No agrega una columna de Excel**: `LAB_XLS_MAP` no tiene un solo `pop_`, verificado otra vez en
esta tanda, así que un campo `pop_*` nuevo no mueve las 440 columnas — es exactamente lo que pasó
con `pop_lactato` en la tanda G, que subió el censo de campos de 1038 a 1039 y dejó el Excel
intacto. **Cuesta un campo persistido más y no se aplicó porque la orden decía «solo reportar».**

---

## AJ7-i · Cuatro frases de tono de conducta siguen en el POCUS del posoperatorio

**Qué se encontró**, con su texto exacto y su superficie:

| Frase | Dónde se arma | En qué superficies sale |
|---|---|---|
| «PRESENTE — **evaluar drenaje urgente**» (neumotórax) | `popPocusSync()`, bloque PULMÓN | **sólo pantalla** (`#pop-pocus-pulmon`) |
| «Sospecha — **confirmar**» (neumotórax) | `popPocusSync()`, bloque PULMÓN | **sólo pantalla** |
| «Disfunción del VD con dilatación — **descartar taponamiento y TEP**» | `popPocusSync()`, bloque VENTRÍCULO DERECHO | **sólo pantalla** (`#pop-pocus-vd`) |
| «Compromiso del VD — **revisar contexto**» | `popPocusSync()`, bloque VENTRÍCULO DERECHO | **sólo pantalla** |

**Verificado**: las cuatro se escriben con `setH('pop-pocus-pulmon' / 'pop-pocus-vd', …)` y
**nadie lee esos nodos** — ni `amiloTextoPOP`, ni el informe, ni el PDF, ni el PPT. No llegan al
papel firmado.

⚠️ **Y hay una quinta que SÍ llega al papel**, y no es del POCUS: «Concordancia Swan vs eco | N %
— **revisar posición del catéter o la ventana**», en `amiloTextoPOP`, o sea en el cuerpo del
informe y en la hoja del PDF del bloque integrado.

**No se tocó ninguna**: la orden decía «solo reportar».

---

## AJ7-j · El denominador de la fila de TEER del Laboratorio

**Qué cuenta hoy.** `_labUsaTeer` da un estudio por «con evaluación TEER» **en cuanto
`teer_tipo_im` tiene texto**. Desde la AJ5, `teer_tipo_im` está espejado con `vm_tipo_im` de
Válvulas, así que **un transtorácico con el Tipo de IM cargado entra a ese denominador**, sin que
nadie haya abierto el módulo de TEER.

**Qué cuenta como «positivo».** Lo decide `teerEstado()`, que es el mismo dueño que gobierna la
hoja del PDF y el `hayDatos` del bloque integrable.

**Ya estaba declarado** como **AJ5-a**, y esta tanda sólo lo vuelve a reportar: cambiar el
predicado es criterio de Maicol y toca otro módulo.

# Tanda «G» — el posoperatorio de cirugía cardíaca (2026-10-24)

## Lo que esta tanda CERRÓ

- **La vasoplejia no miraba la PAM.** Hoy exige las tres cosas de la definición que publican
  Unic-Stojanovic 2025 y Busse 2020.
- **El pie del cuadro del VD del POP declaraba «VD/VI 0,9»** mientras las dos filas de arriba del
  mismo cuadro imprimían «≥1.0» leyendo `TEP_VDVI_DILAT_MIN`. Hoy sale de la constante.
- **El papel firmado del posoperatorio se contradecía:** con IC 2,18 decía «Índice cardíaco | 2.18
  — bajo» ocho renglones antes de «Sin patrón de bajo gasto», y el EN SUMA lo decía en la MISMA
  oración. Hoy el patrón no viaja al papel.
- **La mitad derecha de las diez filas de drogas era un rectángulo vacío** (374 → 184 px).
- **Los grados del derrame pleural y la banda de precarga no declaraban que no tienen fuente.**
- **La conducta del derrame pleural vivía en la pantalla** colgada de una graduación sin fuente.

## [CERRADO 2026-10-24 · AJ7-8] G-a · Dos copias del umbral de hipertensión pulmonar (20 mmHg)

> **Cerrado.** `HP_PAPM_MIN` es el dueño único, declarado junto a `RVP_ELEVADA_UW`.
> `POP_PAPM_HP_MMHG` se retiró: cero ocurrencias. **Ningún corte cambió**, medido en las DOS
> superficies con sus denominadores, en 19, 20 y 21 mmHg.

`POP_PAPM_HP_MMHG` vale 20 en el módulo del posoperatorio, y el **mismo 20** está escrito INLINE en
`calcHemodinamica` (`papm <= 20`), que esta orden no autorizaba a tocar. Si alguna vez se mueve,
hay que moverlo en los dos lugares. **Lo correcto es un único `HP_PAPM_MIN` con dueño**, igual que
`RVP_ELEVADA_UW`, y que las dos superficies lo pregunten.

## G-b · La clasificación pre/poscapilar está inline y no se puede reusar

El esquema del POP publica los NÚMEROS del circuito pulmonar —PAP media, PCP, gradiente
transpulmonar y RVP— y **no** dice «precapilar» ni «poscapilar», porque esa cascada vive dentro de
`calcHemodinamica` sin ser una función, y copiarla habría puesto dos veces los mismos cortes en la
misma app. Extraerla a un `_hpPatron(papm, pcp, rvp)` que las dos superficies pregunten es trabajo
de una tanda de la hemodinámica general.

## G-c · El Laboratorio pierde la distribución de patrones del POP

`_labPopResumen` lee el patrón del TEXTO integrado con
`match(/## Patrón hemodinámico\n([^\n]+)/)`, y esa sección ya no se emite: su contador queda vacío
para los estudios que se integren desde hoy. Los **ya guardados** conservan su texto y siguen
contando — no se migró nada. El resto de ese panel (tipo de cirugía, soporte por droga, índice
cardíaco promedio) no depende de esa sección. **Si esa estadística importa**, la salida limpia es
que el Laboratorio lea `popPatron()` sobre los campos guardados —hay una fuente inyectable,
`_pcCon(campos, fn)`— en vez de leer el texto del informe. Decisión de Maicol.

## G-d · El dibujo no entra al PDF

La hoja del POP se arma como texto tabulado; meter el SVG exigiría rasterizarlo a canvas y pegarlo
como imagen. La orden permitía dejarlo afuera («sin dibujo si no entra de forma limpia») y así se
hizo. **Todo lo que el dibujo muestra está en la tabla de datos medidos de la hoja**, que esta
tanda completó con la PAM, la PAD, la PAP, el gradiente transpulmonar y la RVP.

## [CERRADO 2026-10-24 · AJ7-6a] G-e · Un hallazgo más de `toque-chico` en el celular

> **Cerrado junto con el de la tanda J2**: ver **J2-f** arriba y **AJ7-e** abajo.

La línea base era **64 hallazgos a 360 px y 73 a 390, con 18 ALTA cada uno**; hoy es **65 y 74,
con 19 ALTA**. El hallazgo nuevo es el globo ⓘ que el bloque de pleura del POP agrega, medido en
**16×12 px**: es **el mismo componente** que los otros dieciocho `.vinfo-btn` ya contados, con la
misma medida. Vale lo que ya dice la entrada del J2 sobre ese piso táctil: está acotado a
`@media (pointer: coarse)` y `check_mobile.js` no emula un puntero grueso, así que mide el tamaño
de escritorio. En un teléfono real ese botón mide 44×44.

## G-f · El híbrido con el corazón anatómico y la frecuencia cardíaca en las animaciones

Las dos quedan **fuera de esta tanda por orden expresa**, y se dejan anotadas como trabajos
futuros:

- **El híbrido con el corazón anatómico del Laboratorio.** El esquema del POP usa las cuatro
  cavidades cuadradas de la demo aprobada del 17/10 y **no** el corazón anatómico. Unirlos no está
  decidido.
- **La frecuencia cardíaca real en las animaciones.** Hoy el latido del dibujo dura
  `POP_ESQ_PER_MS` (1700 ms), que es la velocidad a la que el esquema se ve bien y **no** la
  frecuencia del paciente. Atarla a `hemo_fc` es una decisión de producto que esta orden excluye.

## G-g · El PPT del paciente no se midió de punta a punta

El PPT del **Laboratorio** (21 textos) y el **PDF de auditoría** (104 textos) salieron IDÉNTICOS en
el A/B contra el HEAD de la tanda. El PPT **del paciente** no se pudo medir así: `generarPPT(id)`
exige un estudio guardado y la sonda no logró completar el guardado —cuelga de la card de
severidades—. Lo que sí está medido: la rama `integrado('pop')` del PPT lee `popPatron()`, que esta
tanda **no cambió** (TC-534, condición L9), y los casos de la suite que cubren el PPT están en
verde. Cerrar esto es agregarle a la sonda el guardado real.

# Tanda AJ10-B — blindaje de Eco Estrés (2026-10-26)

## AJ10-C · Borrado del código de Eco Estrés

**DECISIÓN DE MAICOL DEL 25/10/2026: NO se borra hasta modularizar la app.** Esta entrada queda
para que el día que se modularice no haya que volver a medir todo.

### Qué se borraría

Las **cinco piezas (A)** del inventario, que son las exclusivas de Eco Estrés:

| Pieza | Líneas | Bytes |
|---|---|---|
| A1 · bloque principal (la IIFE con la diana, los evaluadores, las galerías, los dos listeners y el `setTimeout`) | 436 | 31.770 |
| A2 · sección «ECO ESTRÉS» del PDF | 161 | 9.496 |
| A3 · `eeIncluirPDF` y su comentario | 22 | 1.997 |
| A4 · `EE_PROTO`, `EE_PDF_KEYS` y los toggles de PDF por sección | 208 | 13.138 |
| A5 · limpieza de la bandera al arrancar | 5 | 346 |
| **TOTAL** | **832** | **56.747** |

Son el **0,61 %** de las 137.115 líneas y el **0,58 %** de los 9,72 MB.

> ⚠️ **La cifra de «unas 738 líneas, 0,5 %» que traía el inventario AJ10-A NO reproduce.** Medido
> pieza por pieza con `sed -n 'a,bp' | wc -l` y `wc -c`: son **832 líneas**. La diferencia es del
> tamaño de A2, así que lo más probable es que esa cuenta no incluyera la sección del PDF. Para
> presupuestar el borrado vale **832**.

Más **dos enganches**, que son lo que hay que retirar además del bloque:

1. **El enganche del informe narrativo** (5 líneas, 241 B, dentro de `generarInforme`): el
   `if (typeof eeInformeLineas === 'function')` que agrega el rótulo «Eco Estrés:». Con A1 borrado
   falla cerrado y no rompe nada, pero queda nombrando una función que no existe.
2. **La llamada a `eePdfOn` desde la sección del PDF**: se va junto con A2, pero si alguna vez A2
   se conserva y A4 se borra, ese `_eeOn` cae al `function(){ return true; }` de respaldo y **todas
   las subsecciones quedarían encendidas**.

### Qué hay que revisar ANTES de borrar

- **Las otras tres familias «ee», que están VIVAS.** El prefijo `ee` **no identifica** a Eco
  Estrés. Un borrado por prefijo apaga: la **calculadora de E/e′** (`ee-e`, `ee-ep`, `ee-result`,
  `ee-val`, `ee-lbl`, `calcEE`), el **modo básico/avanzado del ETT** (`EE_MODULES`, `EE_DEF_KEY`,
  `eeGetMode`, `eeGetModules`, `eeModOn`, `eeDefOn`, que alimentan el desplegable «Sección
  avanzada») y el **QR del informe** (`EE_QR_ROWS`, `eeStudyUrl`, `eeQrDataURL`, `eeQrEnabled`).
  Las tres tienen control negativo en TC-536 (condiciones E1 a E4) precisamente para que un
  borrado que se las lleve salga en rojo.
- **`cx_duke_*` y el score de Duke NO son de Eco Estrés** —salen de una ergometría en cinta— pero
  su rama del PDF estuvo tapada por la doble condición de Eco Estrés. Hoy depende sólo de su
  propio toggle. Cubierto por TC-536 (E5).
- **`EE_SEGS` es la autoridad declarada de la numeración de 17 segmentos de Contractilidad**
  (decisión de Maicol del 20/09/2026). No es una dependencia de código —`_STR_ANILLOS` tiene los
  números escritos a mano— pero sí documental: borrar A1 deja el comentario de Contractilidad
  citando una constante que no existe. **Mover esa tabla a una constante propia antes de borrar.**
- **El orden de los dos listeners de `paste`.** El de Eco Estrés se registra antes que
  `imgPasteHandler`. Hoy sale por su guarda; el día que vuelva la interfaz habría que decidir el
  orden. Si se borra, el problema desaparece — y la nota que lo documenta también tiene que irse.
- **`localStorage['ecosmart_pdf_toggles']` se puede borrar con A4.** El nombre engaña: suena a
  preferencia global de PDF y, medido, **sólo Eco Estrés la lee y la escribe**.
- ⚠️ **`ptpCad()` — la probabilidad pre-test de enfermedad coronaria de la ESC 2019 — vive DENTRO
  de A1 y se borraría con él.** Son 25 líneas (1.417 B) con la tabla de porcentajes por grupo
  etario y sexo y las cuatro recomendaciones de la guía. Hoy está **tan muerta como el resto**
  —nadie la llama y sus cinco campos `ee-ptp-*` no existen— **pero no es maquinaria de Eco
  Estrés: es una calculadora clínica independiente y completa que sólo necesita que le devuelvan
  sus cinco campos.** La encontró TC-536. **Decidir si se rescata ANTES de borrar A1, y eso es
  decisión de Maicol.**

### La medición que FALTA, y es la que decide

**Cuántos estudios reales guardados tienen claves `ee-*` de Eco Estrés dentro de sus `campos`.**

`guardarInforme` barre `input[id], select[id], textarea[id]` de **todo** el documento y congela
cada valor en `campos`. Hoy no captura nada de Eco Estrés porque los elementos no existen, pero
**cualquier estudio guardado con una build que tuviera la interfaz puede llevar esas claves
adentro**. No se midió en esta tanda, y la razón está escrita: la orden del AJ10-B prohíbe tocar
el almacenamiento real del médico, y los estudios de verdad viven ahí.

Qué hay que contar, sobre una copia del store y nunca sobre el original:

- cuántos estudios tienen al menos una clave `ee-*` que no sea de la calculadora de E/e′
  (`ee-e`, `ee-ep`, `ee-result`, `ee-val`, `ee-lbl`);
- de ésos, cuántos tienen un **valor no vacío** — un campo vacío no es un dato clínico;
- y si alguno tiene `ee-res-global` o `ee-narrativa` cargados, que es lo que convertiría al
  estudio en uno donde **sí se hizo** un eco estrés y cuyo resultado hoy no sale por ninguna
  superficie firmada.

De ese último número depende la decisión: si hay estudios con un eco estrés real guardado, borrar
el código los deja sin forma de reimprimir lo que ya se midió. **Nada de esto se migra ni se borra
sin orden expresa** — es la regla de EcoSmart sobre estudios guardados.

**Dónde está el detalle:** `docs/mapa/eco-estres-inventario.md`.

---

## A-a · La cabecera de la columna de la ficha del VD sigue diciendo «Mujer»

El punto 3c de la tanda A pedía que la fila «Strain de pared libre — disfunción leve (valor
absoluto)» dejara de repetir «de 15 a 20 %» «en la columna de fuente» y dijera «Decisión de la
aplicación». **Esa tabla no tiene columna «Fuente»:** sus tres columnas son **Parámetro | Varón |
Mujer**, medido en Chrome, y la fila repetía el número en la de **Mujer** porque la guía no separa
por sexo y los dos valores salen del mismo dueño.

Se hizo lo que el texto pide: la celda dice «Decisión de la aplicación». El campo `fuente` que lo
permite es **opcional** y lo trae **una sola fila** de las **cuarenta y ocho** que pasan por
`_evRefTabla` en sus cinco llamadas, así que las otras **cuarenta y siete** se pintan exactamente
igual y ninguna banda de guía se tocó. Pero la cabecera de esa columna sigue diciendo «Mujer».

**Las tres salidas, y la decisión es de Maicol:**
1. renombrar la columna a «Varón / Mujer» y agregar una cuarta de «Origen», que es la forma
   honesta y la que más toca (hay cuarenta y siete filas en esa tabla);
2. dejarlo como está y asumir que una fila usa esa celda para otra cosa, declarado acá;
3. volver atrás y que la fila repita el valor.

## A-b · El resto de las tablas de Cardio-Oncología sigue sin tildes

El punto 4a acotaba el cambio a la tabla «Monitoreo recomendado». Medido: la sección de referencia
de Cardio-Oncología tiene **siete** tablas, y las dos que no son la nombrada están escritas sin
tildes **de punta a punta** — «Mieloma multiple», «constriccion», «esofago», «cronica», «pulmon»,
«disfuncion VI», «Definicion», «Elevacion», «caida», «reduccion», «infusion», «metabolico».

Se corrigió entera la tabla que la orden nombra, y de las otras dos sólo lo que **duplica** su
contenido: el calendario tras radioterapia (las dos celdas decían exactamente lo mismo) y la
cabecera «Seguimiento ecocardiográfico». El resto queda como está, porque **tocar una celda y no
su vecina de la misma fila es peor que no tocar ninguna**: la fila de radioterapia de la matriz
grande quedaría con «Radioterapia toracica» sin tilde al lado de «desde los 5 años» con ñ.

Lo que falta decidir: si se acentúa esa sección **completa** —son unas sesenta palabras, y hay que
mirar una por una que no sea una sigla ni una cita en otro idioma— o si se deja como una
convención del bloque. Si se acentúa, caen por lo menos **TC-99**, **TC-111** y **TC-533**, que
afirman los textos sin tilde, y hay que adaptarlos con el motivo escrito.

## A-c · La leyenda de los corchetes del panel no se movió, y se declara

La regla R1 de la tanda A nombra la leyenda «[n] numera las citas DENTRO de cada sección…» entre
las notas de trabajo que tienen que salir de la pantalla. **No se movió**, y el motivo está en el
comentario que la puso ahí: no es una nota de método, es el **reparo de un número que cambió de
significado**. La numeración por sección hace que el [1] de la aórtica y el [1] de la pulmonar
sean documentos distintos en el mismo panel del mismo paciente, y un médico que compare corchetes
entre secciones se equivoca. Son dos renglones y ya son la versión corta.

Si Maicol quiere igual sacarla, lo que la reemplaza no puede ser nada: tendría que ser un ⓘ al
lado del primer corchete de cada sección, que son quince globos nuevos.

## A-d · El mensaje «Requiere IC + PCP estimada» sigue mal en la cápsula del módulo

El punto 2d(iv) se aplicó **en la fila de la Evidencia** y no en su origen. La cápsula de
`calcHemo` sigue publicando «Requiere IC + PCP estimada» cuando falta **uno solo** de los dos, y
lo mismo hacen sus dos hermanas: «Requiere IC + RVS (VFD/VFS, FC, PAM, PVC, ASC)» y
«Requiere PAPm (PSAP) + PCP (E/e′)».

**Por qué no se tocó:** el texto de `hemo-forrester` lo leen `amiloTextoHemo()` —que se integra al
informe y sale en la hoja de ETT Avanzado del PDF— y la diapositiva del PPT (`_pptSpan`).
Cambiarlo ahí cambia **tres superficies firmadas**, y esta tanda tenía orden expresa de dejarlas
idénticas. Medido: la cápsula sale igual en los dos árboles en las tres escenas.

Para arreglarlo en su origen hay que decidir primero **qué tiene que decir el informe** cuando el
perfil no se puede calcular. Hoy dice «Perfil de Forrester (estimado por eco): Requiere IC + PCP
estimada», que es una instrucción de pantalla dentro de un papel firmado.

## A-e · No hay «mensaje equivalente en la ficha de Referencias» del Forrester

El punto 2d(iv) pedía aplicar el arreglo «también al mensaje equivalente de la ficha de
Referencias». **Censadas las 35 fichas de Referencias (`toggleRef`): ninguna publica un mensaje de
ese tipo.** Los tres únicos emisores de «Requiere …» viven en `calcHemo`, y el globo ⓘ del
Forrester (`hemo-forr`) no lo tiene. No había nada que cambiar, y se declara en vez de inventar un
objetivo.

## A-f · Las mayúsculas de en medio que quedaron fuera del alcance

La regla R3 se aplicó a la pantalla de Evidencia y a las tres fichas que la tanda toca. Siguen con
mayúsculas en medio de la frase, **fuera del alcance de esta orden**, los globos ⓘ del formulario
(`hemo-ic`, `hemo-rvs`, `hemo-forr` y los demás del glosario: «LOS DOS BORDES EXACTOS NO ESTÁN
DEFINIDOS», «MEDIDA por catéter», «el NÚMERO») y las otras siete secciones no compactas del panel.
Son otra tanda, y conviene que sea una sola: hoy el panel tiene dos registros de tono distintos
según la sección que se abra.

## A-g · La regla R4 queda sin aplicar en «Aorta torácica — dilatación y aortopatía»

De las secciones del panel que duplicaban su bloque en el «ⓘ Ver detalle» —`notas` armado como
`lineas.map(l => l.txt)`—, la tanda A cerró **todas menos una**: `_indAo`.

**El intento está medido y se revirtió.** Vaciar su `notas` deja a esa sección **sin su control de
detalle**, y «un control de detalle por sección» es un invariante del panel que **TC-293** cuenta:
midió 13 secciones y 12 controles. Las otras siete pudieron cerrar la duplicación porque tenían
contenido **propio** para el globo —lo que las reglas R1 y R2 les sacaron de la línea visible—.
Esta sección no perdió nada de su línea visible: el punto 2e de la orden acota el cambio a la de
«aorta ascendente», así que no hay con qué llenar el globo sin escribir texto clínico nuevo, que
la orden prohíbe.

**Las dos salidas:**
1. aplicarle a `_indAo` lo mismo que a las otras —sacar de sus ocho líneas visibles el folio y la
   tabla, que hoy van inline, y mandarlos al globo—, con lo que el globo se llena con contenido
   real y la duplicación se cierra. Es una tanda propia: son ocho líneas con su clase y su nivel;
2. aceptar que el marco permita una sección sin detalle, lo que obliga a cambiar TC-293 y a
   decidir si el invariante sigue siendo un invariante.

# Tanda B — espejos en vivo y el dueño único de la PAM (2026-10-27)

## B-a · Que la RVS de Hemodinámica lea al dueño único de la PAM

**Qué se encontró.** El punto 6 del pedido dice que *todos* los lugares lean la PAM del mismo
dueño. Se aplicó en tres —la fila «PAM» de la columna del Doppler aórtico, la vasoplejia del
posoperatorio y su esquema— y **se paró en el cuarto**: la RVS de `calcHemo`.

**Qué pasaría si se aplicara.** `calcHemo` calcula `RVS = (PAM − PVC) / GC × 80` con
`v('hemo_pam')` a secas: hoy **ignora por completo** la PAM medida por catéter. Con el Swan en
58 mmHg y `hemo_pam` vacía, la cápsula dice «—». Leyendo al dueño único diría un número.

**Por qué se paró.** Esa cápsula **no es de pantalla**: `amiloTextoHemo()` lee el span
`hemo-rvs` y lo manda al bloque «Perfil hemodinámico», que sale a la **hoja de ETT Avanzado del
PDF** y a la diapositiva del PPT. O sea que el cambio mueve un papel firmado en un estudio con
**una sola** fuente de PAM —el catéter—, que es exactamente lo que el encabezado de esta tanda
prohíbe («Informe, EN SUMA, PDF, PPT, Excel y Laboratorio tienen que quedar IDÉNTICOS a HEAD en
todo estudio donde la PAM tenga UNA sola fuente»). Y además mezclaría una PAM **medida** por
catéter con una PVC **estimada por eco**, sin decirlo, que es la mezcla que el módulo del
posoperatorio declara en cada línea.

**Qué costaría.** Un renglón: cambiar `const pam = v('hemo_pam')` por `pamEfectiva().val`. Lo
caro es lo otro: decidir si la cápsula tiene que declarar de dónde salió la PAM —como ya hace
el posoperatorio— y volver a correr el A/B de las seis plantillas del PDF y del PPT.

## B-b · Persistir la marca «esta PAM la escribió la app»

**Qué se encontró.** El síntoma S4 decía que la PAM tipeada no se conserva al recargar.
**Medido: sí se conserva.** El autoguardado repone `hemo_pam` y el valor vuelve intacto.

Lo que **no** sobrevive es `dataset.derivadoDe`, la marca que distingue «la escribió la app
desde PAS/PAD» de «la tipeó el médico». Consecuencias, las dos medidas:

1. una PAM que la app había **derivado** vuelve pareciendo **tipeada**, así que desde ahí la app
   ya no la vuelve a derivar aunque cambien PAS o PAD;
2. el aviso «auto ← PAS/PAD del Doppler aórtico» desaparece al reabrir.

**Por qué se paró.** Conservarla exige un campo nuevo en el guardado. `capturarForm` barre
`input[id]`, así que alcanzaría con un `<input hidden>` — y eso **mueve el censo de campos**
(1023 → 1024) y entra al JSON de cada estudio. El punto 7 del pedido lo dice con todas las
letras: parar y reportar con su costo.

**La alternativa que NO se tomó y por qué.** Re-derivar la marca al abrir, comparando
`hemo_pam` con `aoPamCalc()` redondeado, no agrega ningún campo. Pero cambia lo que la app hace
con un estudio ya guardado —pasaría a pisar una PAM que hoy respeta— y eso es migrar en
silencio, que SEGURIDAD prohíbe. **Es decisión de Maicol.**

⚠️ **TC-538 (e) mide las dos mitades a propósito**: que la tipeada sobreviva y que la marca no.
El día que se decida persistirla, ese renglón se pone rojo y hay que adaptarlo.

## B-c · Que la calculada gane con `hemo_pam` borrado a mano

**Qué se encontró.** La PAM calculada no es una fuente independiente: vive **dentro** de
`hemo_pam`, donde `aoPresionSync` la materializa redondeada y marcada. El único estado en que
existe como fuente sola **sin** estar en el campo es el que deja el médico borrando `hemo_pam` a
mano con PAS y PAD cargadas.

**Qué pasaría si se aplicara.** Medido en los dos árboles: hoy ahí no hay PAM para nadie, y con
la calculada ganando la hoja del posoperatorio pasa a imprimir `PAM | 87 mmHg (de
Hemodinámica)`. Es **una línea nueva en un PDF firmado** en un estudio con **una sola** fuente.

**Por qué se paró.** Por lo mismo que B-a. Y porque el estado es transitorio: el primer gesto
del médico sobre PAS o PAD vuelve a materializar la calculada en el campo, y desde ahí la
precedencia aplica normalmente.

## B-d · El POCUS del posoperatorio no lee `vd_vi` — y el mismo PDF se contradice

**Qué se encontró (S5 del pedido, medido).** La mitad del síntoma es **falsa** y la otra es peor
de lo que decía.

- **`vd_vi` SÍ llega al PDF.** Con `vd_vi = 1.30` cargado y `tep_vdvi`, `vd_bas` y `ddfvi`
  **vacíos** —ése es el denominador: los otros dos caminos dan el mismo cociente por otra
  puerta—, la tabla del VD imprime `VD/VI: 1.30`.
- **El POCUS del posoperatorio NO lo lee.** `popPocusSync` toma `v('tep_vdvi')` y, si falta,
  calcula `vd_bas ÷ ddfvi`. **Nunca** mira `vd_vi`. La pantalla muestra `VD/VI —` y
  «Completar: VD/VI (tab VD/AD)» **sobre un campo que está cargado en esa misma pestaña**.
- **Y el mismo PDF se contradice.** Cinco páginas después de `VD/VI: 1.30`, la hoja del
  posoperatorio imprime `TAPSE 16 mm · VD/VI -`. Un documento firmado dice el número y dice que
  falta.

**Por qué se paró.** Agregar `vd_vi` a la cadena de lectura cambia lo que publica una hoja
firmada y puede mover la conclusión del bloque («Compromiso del VD» ↔ «Disfunción del VD con
dilatación»). Es contenido clínico y es decisión de Maicol.

**Cómo se arreglaría.** `popPocusSync` y `popEsquema` tienen la misma cadena escrita dos veces;
lo correcto es un lector único —el mismo `vdViTexto`/`vdViEstado` que ya usan el PDF, el PPT y
la categoría A de la probabilidad de HTP— y que el posoperatorio lo llame. Ver
`docs/mapa/vd-vi-selector.md`, que lista los cuatro lectores: el posoperatorio sería el quinto,
y hoy es el único que deriva el cociente por su cuenta.

## B-e · La dosis de una droga no entra al cuerpo del informe ni al EN SUMA

**Qué se encontró (S6 del pedido, medido).** También es **falso a medias**. Con Noradrenalina
marcada y la dosis en 0,25 y el bloque integrado:

- **la hoja del PDF SÍ la lleva**: `Noradrenalina 0.25 mcg/kg/min`, en la fila «Vasoactivos»;
- **el PPT también**, por `_pptNum('pop_<k>_dosis')`;
- **el cuerpo del informe y el EN SUMA no**, y eso **no es un olvido**: el módulo `pop` no
  declara `enCuerpo` en `amiloSecs()`, así que por diseño es un módulo de **hoja**, no de
  cuerpo. Ningún dato del posoperatorio entra al párrafo narrativo.

**Por qué se paró.** Cambiarlo es agregar el posoperatorio entero al cuerpo del informe firmado,
que es una decisión de qué dice el papel. No está pedido y no se hace sin orden expresa.

## B-f · «Presión arterial invasiva solamente» no abre ningún campo

**Qué se encontró.** El punto 6 nombra «la PAM medida por catéter **o línea arterial**». El
selector `pop_monitor` tiene la opción `pai` — «Presión arterial invasiva solamente» — pero
`popMonSync` sólo muestra el acordeón con `swan` o `picco`: con `pai` elegido **no hay un solo
campo donde cargar esa PAM**. Hoy la única PAM por catéter que la app sabe recibir es la del
Swan-Ganz, y `pamEfectiva()` la lee con esa compuerta.

**Qué costaría.** Un campo nuevo, persistido, que **mueve el censo** (1023 → 1024) y entra al
JSON de cada estudio — el mismo costo que B-b, y por eso queda en la misma lista en vez de
aplicarse. Decidirlo es de Maicol.

## B-g · El arnés de A/B de varias tandas no pasaba por el embudo de restauración

**Qué se encontró.** El montaje de escenas de `scripts/_probe_r2ab.mjs` —y de su copia
`_probe_aab.mjs`, que usó la tanda A— hace:

```js
try { if (typeof RECALC_MODULOS !== 'undefined') RECALC_MODULOS.forEach(n => { … }) } catch (e) {}
```

`RECALC_MODULOS` es una **función**, no un arreglo. Eso tira `TypeError`, el `catch` lo traga en
silencio y **el embudo de restauración nunca corre**: ninguna de esas mediciones ejercitó el
camino por el que reponen `editarInforme`, el QR del PDF, el autoguardado y las dos
reimpresiones.

**Cómo se destapó.** No leyendo: la tanda B le agregó una entrada a `RECALC_MODULOS`
(`pamAvisoSync`) y el A/B no la movía ni en la escena que debía. El control positivo de los tres
nodos de pantalla fue lo que lo hizo visible — sin él, «cero diferencias» no se distingue de «la
sonda no mira nada».

**Qué se hizo.** `scripts/_probe_bab.mjs` llama `_recalcModulos('ab')` y espera 500 ms para que
corra el debounce de 220 ms antes de medir. **`_probe_aab.mjs` y `_probe_r2ab.mjs` NO se
tocaron**: arreglarlos cambia lo que midieron tandas ya cerradas, y no está pedido.

**Qué queda.** La próxima tanda que use uno de esos dos arneses conviene que aplique el mismo
arreglo antes de apoyarse en su A/B. No invalida los resultados publicados —los dos lados del
A/B estaban igualmente afectados, así que la comparación sigue valiendo— pero **cubrían menos
de lo que decían**.

## E-e · La distancia más corta entre la zona de implante y la arteria pulmonar (idea, no implementada)

**Qué es.** Abbott publicó un aviso de seguridad de campo —**FA-Q326-SH-1, del 10/9/2026**— sobre
el Amplatzer Amulet, que introduce la **distancia más corta entre la zona de implante y la arteria
pulmonar** como medida de planificación, con **tres categorías de riesgo**. Sería un campo nuevo de
la sección de orejuela del ETE, con su tabla en el ⓘ.

**Por qué NO se implementó en la tanda E.** La orden lo pide explícitamente como idea para después
(punto 4g) y prohíbe incluirlo ahora (punto 4d). El motivo de fondo es que las tres categorías de
riesgo viven en un aviso de campo y **no en el manual del dispositivo**: el manual que la app cita
hoy es la aprobación FDA P200049 de 2021, que no las tiene. Publicar tres bandas de riesgo citando
un manual que no las contiene sería exactamente lo que la regla de citación de este repo prohíbe.

**Cuándo retomarlo.** Cuando esté publicado el **manual actualizado del Amulet** que incorpore esa
medida, para poder citar documento, tabla, hoja y folio como las otras dos tablas de esta sección.
El PDF del aviso está en la biblioteca
(`23_Orejuela_izquierda/Abbott_Amulet_aviso_seguridad_arteria_pulmonar_2026-09_FR.pdf`) y **esta
tanda no lo abrió**: no hacía falta para nada de lo que sí hizo, y abrirlo habría sido empezar a
trabajar sobre una fuente que la orden dejó fuera.

**Qué costaría.** Un campo nuevo persistido —**mueve el censo**, 1023 → 1024, y entra al JSON de
cada estudio—, más una decisión clínica sobre si la app publica las tres categorías o sólo la
medida. Por la regla de la casa («la orejuela publica las medidas y no juzga»), lo segundo.

## E-a · Carpentier: un estudio con los dos nodos en valores distintos

**Qué se encontró.** Desde la tanda E el Carpentier tiene **un solo dato** y gana el del ETE. El
campo de Válvulas queda deshabilitado mostrando ese valor, y `vmCarpOrigenSync` **llena el hueco**
cuando `vm_carp` está vacío. Pero si `vm_carp` ya trae un valor **distinto** —un estudio importado
o editado a mano— **no se toca**: el informe publica el del ETE y el `<select>` sigue mostrando el
suyo, deshabilitado.

**Por qué no se corrigió.** Pisar el valor guardado para que coincidan es **migrar un estudio
guardado**, que la regla de la casa prohíbe. El enlace nombra el valor que manda («Carpentier
«IIIa» — lo consigna el ETE»), así que la pantalla no miente: dice de dónde sale el dato del papel.

**Qué queda.** Decidir si en ese estado la app tiene que avisar explícitamente que los dos nodos
difieren. Es un aviso nuevo, y el que había (`vm-carp-aviso`) se retiró por orden expresa. Está
cubierto por **TC-539 (A11)**, que fija que el efectivo es el del ETE.

## E-b · La geometría de dos avisos no se puede medir dentro del suite

**Qué se encontró.** TC-539 no puede medir la caja de `vm-carp-origen` ni de `et-evid-aviso`. Se
intentó por tres caminos —`display:block` a mano sobre cada ancestro escondido, el abridor propio
de la sección (`toggleEteSeccion`, el que TC-522 usa para medir **esta misma fila**) y descartando
el primer rect— y los tres dejan el nodo en `display:block` y `visibility:visible` con
`offsetParent` en `null`, o sea sin caja.

**Por qué importa.** Un aviso sin geometría no existe para el médico, y este repositorio ya pagó
ese defecto dos veces: el aviso del Carpentier de la AJ5 y el de la morfología del ETE. El
invariante merece cobertura automática.

**Qué se hizo mientras tanto, y la causa QUEDÓ ENCONTRADA.** Las dos geometrías están medidas
fuera del suite: el aviso de la tricúspide da **28 × 545** con el gesto real en
`scripts/_probe_te.mjs` (y **0 × 0** contra HEAD), y **565 × 28** a 1440 px en los dos motores; el
enlace del Carpentier da **156 × 44 px** con `offsetParent`.

⚠️ **Lo que les falta a los tres arneses es abrir la TARJETA, no la sección.** Midiendo con la
pestaña abierta por su **botón real** (`.tab-btn` → `click()`) más `toggleEteSeccion`, el enlace
aparece con sus 156 × 44. Con `showTab(...)` programático, la `.card` de adentro queda sin caja y
todo lo que hay dentro informa 0 × 0 — que es lo que hacía parecer que el pintor lo dejaba
escondido.

**Qué queda.** Llevar ese gesto —abrir por el botón de la pestaña— al arnés del suite y mover los
dos invariantes de geometría a TC-539. Es un cambio del arnés compartido, así que toca a muchos
casos y no entra en esta orden.

## E-c · La celda «Decisión de la aplicación» en la columna «Mujer» (punto 3c, reportado)

**Qué se encontró, medido y no estimado.** La tabla de la ficha del VD tiene cabecera **«Parámetro
| Varón | Mujer»** y **47 filas** de cuerpo. De esas, **46 no distinguen sexo** (las dos celdas
dicen lo mismo) y **1 sí**. Y hay exactamente **una** celda que no es un valor: la columna
**«Mujer»** de la fila del strain de pared libre, que dice «Decisión de la aplicación». El
`colspan` **no se usa hoy** en ninguna fila de esa tabla.

**Solución mínima propuesta.** Que `_evRefTabla` admita una celda con `colspan=2` para las filas
sin distinción de sexo, y usarla en esa **única** fila → **1 fila afectada**.

**La variante amplia, y por qué es otra orden.** Aplicarlo a las 46 filas sin distinción mejora la
lectura, pero `_evRefTabla` se usa en **cinco** fichas: cambiarlo ahí cambia la maqueta de todas.

**Por qué no se aplicó.** El punto 3c de la orden dice «SOLO REPORTAR, sin cambiar».

## E-d · La rama del trombo sigue dando un veredicto de aptitud

**Qué se encontró.** La tanda E retiró del informe las tres ramas que juzgaban la aptitud para el
cierre percutáneo **por rango de tamaño**. Queda una: con trombo confirmado, el informe publica
«ostium N mm, profundidad N mm — **no apto para cierre percutáneo (trombo presente)**».

**Por qué se conservó.** Tres razones, y las tres están en el código:

1. es una **contraindicación absoluta**, no un rango de tamaño, y la orden de esta tanda nombra los
   rangos;
2. el párrafo anterior **depende de ese gate**: su propio comentario dice que sin él el informe
   salía con dos párrafos seguidos donde uno manda a considerar el cierre percutáneo y el otro
   declara al paciente no apto para ese mismo cierre;
3. el EN SUMA ya nombra el trombo por su cuenta.

**Qué queda.** Si la regla «la orejuela publica las medidas y no juzga» va a ser absoluta, esta
rama también sale — y entonces hay que decidir qué dice el párrafo del trombo en su lugar. Es
contenido clínico y la decisión es de Maicol. Cubierto como **control negativo** en TC-539 (D8),
así que si se cambia, el caso lo dice.

## E-f · `docs/mapa/informe-pdf-excel.md` no recibió puntero, y hay que partirlo

**Qué se encontró.** Ese mapa está en **34.382 bytes**, a 600 bytes del techo de 35 KB, y
`CLAUDE.md` dice desde la tanda G que «la próxima tanda que lo toque tiene que partirlo». La tanda
E **toca el informe** en tres zonas (el Carpentier, la línea de la orejuela y la frase del strain
del VD), así que le correspondía un puntero.

**Qué se hizo.** **No se le agregó el puntero**, porque agregarlo lo cruza y partirlo no está en
esta orden. Todo lo de la tanda E vive en `docs/mapa/e-carpentier-tricuspide-orejuela.md`, que
figura en la tabla de `ecosmart/CLAUDE.md` — que es el índice que se lee primero.

**Qué queda.** Partirlo. El bloque candidato más grande y más autónomo es el del **Excel y la
reimportación**, que ya tiene mapas vecinos (`excel-origen-ida-vuelta.md`,
`importacion-excel.md`). Después, agregarle el puntero de la tanda E.

## E-g · El cuerpo y el EN SUMA no dicen lo mismo con el strain como único dato de función

**Qué se encontró, medido en los dos árboles.** Con un strain de pared libre de −20 % y **ningún**
otro parámetro de función del VD cargado:

- el **cuerpo** del informe dice «Ventrículo derecho con strain de pared libre −20 %.» —describe y
  no gradúa, que es lo que `hayFunc` decide a propósito—;
- el **EN SUMA** dice «VD con disfunción sistólica leve.» —gradúa—.

**Es PREEXISTENTE**, no lo trajo esta tanda: viene del AJ7, cuando el strain pasó a votar. El voto
entra en `vdDisf` (que es lo que lee la cascada del EN SUMA) y **no** en `hayFunc` (que es la
compuerta de la afirmación del cuerpo), y las dos decisiones están razonadas en su comentario.

**Por qué no se corrigió.** Alinearlas es cambiar qué afirma una superficie firmada: o el cuerpo
empieza a graduar con el strain solo, o el EN SUMA deja de hacerlo. Las dos son decisiones de
Maicol, y la orden de esta tanda no las nombra.

## E-h · TC-358 no espera a jsPDF, y por eso es inestable

**Qué se encontró.** En la corrida completa de la tanda E, TC-358 salió rojo con «NO HAY jsPDF» en
sus dos denominadores de PDF. **No es una regresión**, y está verificado de la forma que no deja
dudas: en el **mismo directorio**, con los **mismos scripts**, alternando sólo el `index.html`
entre HEAD y el árbol nuevo, dos rondas seguidas dieron **rojo en los dos** (ronda 1) y **verde en
los dos** (ronda 2).

**La causa.** El helper `pdfTxt` de `AO3B_SONDAS` lee `window.jspdf` **sin esperar**:

```js
const ns = window.jspdf;
if (!ns || typeof ns.jsPDF !== 'function') return 'NO HAY jsPDF';
```

Medido con Playwright sobre los dos árboles: jsPDF llega **en menos de 1 segundo**, sin un solo
fallo de red ni de SRI, y los tags de CDN son **idénticos** a los de HEAD. O sea que la biblioteca
llega — lo que falta es la espera.

**Cómo se arregla.** El bucle de espera que **TC-537 ya tiene**:

```js
for (let i = 0; i < 40 && !(window.jspdf && window.jspdf.jsPDF); i++)
  await new Promise(r => setTimeout(r, 200));
```

**Por qué no se hizo en esta tanda.** `AO3B_SONDAS` lo comparten **varios** casos de la zona de
estenosis aórtica (TC-345, TC-358, TC-359, TC-360…), así que meterle una espera cambia el arnés de
todos ellos, y esta orden no lo autoriza. El riesgo de dejarlo es concreto: **un rojo que parece
una regresión y no lo es**, en una zona que nada de esta tanda toca.

---

# Tanda D — cardio-oncología y amiloidosis (2026-10-27)

## D-a · La app no distingue antraciclina ANTES del anti-HER2 de antraciclina CONCURRENTE

**Qué pasa.** La Tabla 4 de la guía ESC 2022 tiene **dos cosas distintas**: la fila «Includes
anthracycline **before** HER2-targeted therapy», que vale **M1** en la columna del anti-HER2, y su
nota al pie **g**, que dice que es **riesgo alto** cuando la antraciclina y el trastuzumab se dan
de forma **concurrente**. Ningún campo de esta aplicación dice cuál de las dos es.

**Qué hace hoy.** Con `co_farmaco = trastuzumab` y una dosis cargada en `co_dosis_antrac`, aplica
el **lado seguro**: el piso de la nota g, o sea alto. Un paciente que recibió la antraciclina
**antes** —donde la tabla da sólo M1— puede salir una banda por encima.

**Qué haría falta.** Un control que distinga «antes» de «concurrente». Es un **campo nuevo
guardado**: censo y, si se exporta, una columna de Excel. Decisión de Maicol.

## D-b · Faltan cuatro columnas de la Tabla 4

**Qué pasa.** La Tabla 4 trae **seis** columnas y esta tanda aplica **dos** (antraciclinas y
anti-HER2), porque la orden lo dice expresamente. Las otras cuatro —**anti-VEGF**, **BCR-ABL**,
**mieloma múltiple** y **RAF/MEK**— están transcritas en imagen pero no implementadas: esos
fármacos pasan por el puntaje propio de la aplicación, que lo **declara** en su línea de alcance.

**Dónde difieren, con un ejemplo cada uno.** Un paciente con **hipertensión y diabetes** y nada
más, que hoy la app clasifica **ALTO** (2 puntos de su puntaje propio) con cualquiera de ellos:

| Fármaco | Celdas de la Tabla 4 | La Tabla 4 da | ¿Coincide? |
|---|---|---|---|
| anti-VEGF | hipertensión **H** · DM M1 | **alto** (cualquier factor H manda) | **sí** |
| BCR-ABL | hipertensión M2 · DM M1 | 3 puntos → **moderado** | no: la app sobreestima |
| mieloma múltiple | hipertensión M1 · DM M1 | 2 puntos → **moderado** | no: la app sobreestima |
| RAF/MEK | hipertensión M2 · DM M1 | 3 puntos → **moderado** | no: la app sobreestima |

⚠️ **Y DOS DE ESAS COLUMNAS NO TIENEN FÁRMACO EN LA APP**: el selector `co_farmaco` no ofrece
mieloma múltiple ni RAF/MEK, así que implementarlas exige además agregar sus opciones —y eso toca
el vocabulario de una columna del Excel.

Las seis columnas están transcritas en `docs/fuentes/FUENTES.md` → «La tanda D»; implementar
anti-VEGF y BCR-ABL es agregar dos claves por factor en `coT4Pesos()` y dos valores en
`coT4Columna()`, sin tocar ningún campo guardado.

⚠️ **Y PARA INMUNOTERAPIA Y RADIOTERAPIA LA TABLA 4 NO TIENE COLUMNA**: ésas no se pueden
implementar aunque se quiera, y su línea de alcance lo dice con otras palabras.

## D-c · Tres tablas de referencia publican el esquema que el D-1 retiró

**Qué pasa.** En la sub-pestaña «HFA-ICOS» de Cardio-Oncología viven la tabla de factores con
**puntos fijos**, la de riesgo **por fármaco** y la de **riesgo global** («≥4 puntos de la sección
A o fármaco de muy alto riesgo»). Ninguna de las tres describe cómo clasifica la app desde esta
tanda, y ninguna es la Tabla 4 de la guía.

**Qué se hizo.** Su aviso visible se corrigió —decía los cortes viejos de la calculadora y traía
un «ejemplo real» que ya no ocurre— y hoy dice que son referencia de lectura y que sus puntos no
deciden. Las tablas **quedan**.

**Por qué no se retiraron.** Es contenido clínico que la orden de esta tanda no nombra, y este
repo tiene escrito que una tabla estática que contradice al clasificador de al lado es de lo peor
que le puede pasar a esta pestaña. Decidir entre retirarlas, reemplazarlas por la matriz real de
la Tabla 4, o dejarlas con el aviso, es de Maicol.

## D-d · «Radioterapia toraxica» tiene una x por una c, y corregirlo cambia el Excel

**Qué pasa.** La etiqueta de la opción `radioterapia` del selector `co_farmaco` dice
«Radioterapia **toraxica**»: le falta la tilde y además tiene **x** donde va **c**. El mismo texto
está en el mapa de vocabulario del Excel y es lo que se publica en la columna «Fármaco
cardiotóxico».

**Por qué no se corrigió.** Cambiarlo cambia un **valor** del Excel y el round-trip de
reimportación. La regla de la casa es que eso va con orden expresa.

## D-e · La Central Illustration de Boldrini no está en la copia de la biblioteca

**Qué pasa.** La orden afirma que «el artículo no propone un corte para este score». La página de
figuras del manuscrito trae **sólo las leyendas** —ninguna página del PDF contiene una imagen—, y
la leyenda de la Central Illustration dice que propone cortes para los **dos** scores, con el IWT
en su panel inferior.

**Qué se hizo.** No se escribió esa frase absoluta. El ⓘ dice lo que **sí** está verificado en
texto: que el corte de 8 sale del documento de posición y que el «<1 y ≥5» es del score AL.

**Qué haría falta.** La versión publicada del artículo, o una copia con las figuras.

## D-f · «La tabla del score se muestra en gris» quedó sin aplicar

**Qué pasa.** El punto 3e lo pide, pero no dice **qué** elemento va en gris: el título, la barra
de puntaje, la categoría o las filas de criterios. El peso visual de ese bloque lo fijó la tanda
R2-E5 a propósito («con el peso visual de una caja de resultado de Hemodinámica»), así que
cambiarlo a ciegas desharía una decisión anterior.

## D-g · Las filas de ICI y anti-VEGF de «Monitoreo recomendado» subestiman lo que la guía pide

**Qué pasa.** Verificadas fila por fila contra la guía, dos de las cinco no coinciden:

| Fila | La app dice | La guía publica |
|---|---|---|
| ICI — Inmunoterapia | «ECG y troponina basal y ante síntomas» | Figura 20, folio 4273: vigilancia programada con CV assessment, ECG, TTE, cTn y NP, por ciclos y por riesgo |
| Anti-VEGF | «PA, eco si síntomas o FEVI límite» | Rec.-tabla 10, folio 4264: eco **cada 4 meses** en riesgo moderado y **cada 3 meses** en alto y muy alto durante el primer año; PA en cada visita y PA domiciliaria diaria el primer ciclo |

**Por qué no se corrigió.** La orden decide el calendario del **anti-HER2** y manda a no mostrar
calendarios inventados; estas dos filas no son anti-HER2 y reescribirlas es escribir
recomendaciones clínicas nuevas, con sus clases y sus niveles. Se reporta con la cita exacta para
que la decisión sea de una línea.

## D-h · Las tres casillas nuevas no se exportan al Excel

**Qué pasa.** Maicol autorizó tres columnas nuevas (440 → 443) al partir el antecedente CV. **No
se agregaron**, y el Excel quedó en **440**: ninguna de las doce casillas `hfaicos_*` se exportaba,
así que agregar sólo las tres nuevas habría dejado el Excel con tres de quince. El censo sí
cambió: **1023 → 1025** (tres casillas nuevas menos el selector `hfaicos_farmaco` retirado).

**Qué haría falta.** Si se quieren, van las **quince**, al final y sin mover ninguna existente.

## D-i · El globo de la calculadora no entra a 390 px

**Qué pasa.** El ⓘ `co-riesgo-basal` ocupa **1140 px** de alto con el ancho estándar de 300. Se le
dio ancho propio de **560**, con lo que entra entero a 1440 px en Chrome y en WebKit. A **390 px**
la tarjeta se acota al ancho de la pantalla y **no entra**: lo que sobra scrollea adentro
(`overflow:auto`, no se pierde nada), pero se lee cortado.

**Por qué no se acortó el texto.** Ahí viven las clases y los niveles de las cuatro categorías de
derivación y los dos calendarios de eco, que la regla **R2** de esta tanda saca expresamente de la
línea visible. Acortarlo costaría una de esas clases.

**Qué haría falta.** Decidir qué sale del globo y adónde va: una ficha en Referencias para
`co-riesgo-basal` resolvería las dos cosas a la vez —también le daría el botón «Ver referencia»
que hoy no tiene, que es el límite que **D-c** y TC-502 declaran—.

---

# Corrección D-9 (2026-10-27)

## D-j · Inventario de direcciones del módulo de amiloidosis — SOLO REPORTADO

Para **cada** campo de entrada del módulo, qué sincronización existe hoy y qué costaría completar
la que falta. **Nada de esto se implementó**: el punto 3 de la orden pide reportarlo.

| Campo del módulo | Campo del estudio | Hoy | Qué falta y qué costaría |
|---|---|---|---|
| `rwt-septo` | `siv` | **los dos sentidos** | — |
| `rwt-pp` | `ppvi` | **los dos sentidos** | — |
| `rwt-ddvi` | `ddfvi` | **los dos sentidos** | — |
| `ee-e` | `onda_e` | **los dos sentidos** | — |
| `tapse-val` | `tapse` | **los dos sentidos** | — |
| `sgl-val` | `sgl` | **los dos sentidos** | — |
| `ett-septo` | `siv` | **módulo → estudio** | la vuelta NO se puede dar: `_amHayDatos` —la línea de pendientes de la miocardiopatía hipertrófica— lee este campo como «el médico está evaluando amiloidosis acá», así que autollenarlo pondría esa frase en el informe de cualquier estudio con el septo cargado. Para la condición de 12 mm, `calcETT` ya **lee** `siv`. Costaría separar esa señal de ese campo. |
| `ett-pp` | `ppvi` | **módulo → estudio** | lo mismo que el anterior |
| `ett-fevi` | `fevi` | **módulo → estudio** | la vuelta es trivial —mismo dato, misma unidad— y no toca ningún campo guardado. **Es la que el médico reportó que falta.** Sólo hay que agregarle la entrada al registro sin la marca de «un solo sentido». |
| `ee-ep` | `e_sep` + `e_lat` | **estudio → módulo** | la vuelta **no es definible**: un promedio no se reparte en dos mediciones sin inventarlas. |
| `ap-apic` | — | **ninguno** | el strain por segmentos de la app no publica el apical por separado. Haría falta un campo nuevo guardado. |
| `ap-base` | — | **ninguno** | ídem |
| `ett-derrperic` | `pericardio` | **ninguno** | la vuelta exige **traducir vocabularios**: el estudio tiene cinco opciones («Normal, sin derrame», «Derrame leve (<10mm)», «Derrame moderado (10-20mm)», «Derrame severo (>20mm)», «Engrosamiento / calcificación») y el módulo tres («— no evaluado —», «No», «Sí (mínimo o moderado)»). Mapear «severo» a «Sí (mínimo o moderado)» sería **falsear el grado**, y el módulo no tiene opción para un derrame severo. **Es la otra que el médico reportó.** Decidir: agregarle una cuarta opción al módulo, o leer el del estudio y mostrarlo sin graduar. |
| `ett-sparkling` | — | **ninguno** | el patrón granular no existe como campo en ninguna otra pestaña |
| `ett-valvular` | — | **ninguno** | el engrosamiento valvular por amiloidosis tampoco |
| `alg-motivo` · `alg-ett-score` | — / propio | **no corresponde** | `alg-ett-score` lo escribe el propio módulo desde el D-3 |

**Las dos que el médico notó** —la FEVI y el derrame pericárdico que no aparecen en «otros
hallazgos»— son las filas en negrita: la FEVI es **una línea de registro**; el derrame **no se
puede hacer sin decidir qué pasa con el grado severo**, que el módulo hoy no sabe decir.

## D-k · Los diecisiete casos del pendrive no son cobertura de esta corrección

La orden pedía la suite completa «con el pendrive montado y legible al abrir y al cerrar».
**Al abrir lo estaba; a mitad de la corrida se desmontó.** `/Volumes/` quedó con `Macintosh HD`
solo, y los casos **TC-181 a TC-197** —los que leen archivos reales del ecógrafo— fallaron los
diecisiete con «hace falta el pendrive del Vivid montado». No se tocó nada para forzarlos.

Esos diecisiete **no prueban nada en esta pasada** y no se cuentan como verdes. Hay que volver a
correr ese lote con el pendrive puesto:

```bash
node scripts/test_clinico.mjs --solo TC-181,TC-182,TC-183,TC-184,TC-185,TC-186,TC-187,TC-188,TC-189,TC-190,TC-191,TC-192,TC-193,TC-194,TC-195,TC-196,TC-197
```

Ninguno de los diecisiete toca el módulo de amiloidosis ni los espejos: son el visor de imágenes
y la calibración. El riesgo de que escondan una regresión de esta corrección es bajo, pero **bajo
no es cero y por eso queda declarado**.

⚠️ **Se volvió a pedir la corrida con el pendrive puesto y NO estaba montado, medido por tres
caminos:** `/Volumes/` tiene sólo `Macintosh HD`, `diskutil list external` no devuelve nada y la
tabla de `mount` tiene diez entradas, todas internas. Tampoco hay copia local del árbol
`GEMS_IMG` en el home, así que no sirve apuntar `ECO_PENDRIVE` a una carpeta. **Antes de relanzar
el lote, confirmar con `ls /Volumes/DISK_IMG/GEMS_IMG/` que lista nombres reales**: si ese `ls`
falla, los diecisiete van a fallar igual y no van a probar nada.

---

# Corrección D-10 (2026-10-28)

## D-l · El `e′` promedio del módulo es el único insumo sin camino de vuelta — SOLO REPORTADO

El reflejo app → módulo ahora manda **siempre**, porque el campo del estudio es el dueño del dato.
Eso vale para los seis insumos que tienen camino de vuelta: lo que el médico escriba en ellos viaja
al campo del estudio, así que reflejarlo de nuevo devuelve el mismo número y no se pierde nada.

**El `e′` promedio del calculador de E/e′ es la excepción, y queda con la regla del D-9.** Su fuente
son `e′` septal y `e′` lateral, y **un promedio no se reparte en dos mediciones sin inventarlas**:
si el reflejo lo pisara, lo que el médico midió ahí no tendría dónde vivir. Así que el reflejo no lo
toca cuando ya tiene un valor que no puso esta maquinaria.

**La consecuencia, declarada:** una vez que el médico escribe ahí a mano, ese campo deja de seguir a
las `e′` del estudio para el resto de la sesión. La marca muere con el DOM, así que una recarga lo
devuelve a seguir el dato.

**Qué haría falta para cerrarlo.** Decidir una de dos, y es decisión de Maicol porque las dos
cambian lo que el médico ve:
1. **Un campo guardado nuevo** para el `e′` promedio medido a mano, con su columna en el Excel —lo
   que esta corrección tenía prohibido hacer sin reportar primero—; o
2. **Dos campos en el calculador** en vez de uno, septal y lateral, con el promedio como resultado
   calculado y no como entrada. Eso lo convierte en un insumo con vuelta, como los otros seis, y la
   excepción desaparece. Es el cambio más limpio y el más grande: toca la pantalla del calculador.

## D-m · La guía de prueba del D-9 pedía un defecto en su paso 3

Decía que el cartel «HVI ≥12 mm» tenía que irse al borrar **sólo** el septo. Es incorrecto: el
criterio es el **mayor** de los dos espesores, así que con la pared posterior en 12 el cartel debe
seguir — y hoy cae a 12,0 mm, que es lo correcto. Si esa guía se reusa, el paso 3 va con los **dos**
espesores vaciados. **TC-542 (H3b)** lo fija para que no se vuelva a pedir al revés.

## D-n · La marca de espejo del D-9 sobrevive a «Nuevo estudio» — SOLO REPORTADO

Medido al cerrar el D-10: después de `limpiarCampos`, un insumo del módulo que había traído el
reflejo conserva su `data-espejo`. No está en la lista cerrada de marcas que «Nuevo estudio» borra
—la misma que esta corrección tuvo que ampliar con sus dos marcas nuevas—, así que es la misma fuga
que ese bloque del archivo documenta, entrando por la puerta del D-9.

**Hoy no cambia nada, y por eso no se tocó dentro de esta corrección.** Desde el D-10 esa marca ya
no decide si el reflejo actúa: su único lector es la regla del insumo **sin camino de vuelta**, que
hoy es el `e′` promedio. Y una marca heredada ahí empuja hacia el lado **seguro** —hace que el
reflejo SÍ escriba, o sea que el campo siga al estudio del paciente nuevo—.

**Qué haría falta:** agregar `[data-espejo]` al selector **y** `delete el.dataset.espejo` al cuerpo,
que son las dos listas que el archivo advierte hay que tocar juntas. Es una línea en cada una, y
después hay que correr la suite completa: TC-541 y TC-542 miden esa marca en varias condiciones.
Quedó afuera porque llegó al final de la verificación y meterla habría exigido rehacer las cinco
rondas de mutación, el A/B, los dos motores y los once lotes.

---

# Corrección D-11 (2026-10-28)

## D-o · El `e′` promedio es el único de los ocho datos que no tiene dos puertas — SOLO REPORTADO

Con el modelo nuevo, siete de los ocho datos compartidos se editan por las dos puertas. El `e′`
promedio del calculador de E/e′ **no**: su fuente son `e′` septal y `e′` lateral del estudio, y un
promedio no se reparte en dos mediciones sin inventarlas.

**Medido:** teclear ahí deja el valor en el módulo y **no cambia el estudio**; vaciarlo hace que el
reflejo lo repueble con el promedio de las dos `e′`. TC-543 lo fija con esa expectativa propia, y
es el único de los ocho que la tiene.

Lo que haría falta para cerrarlo es lo mismo que **D-l** ya plantea: o un campo guardado nuevo, o
partir el calculador en dos entradas —septal y lateral— con el promedio como resultado calculado.
Lo segundo lo convierte en un dato de dos puertas como los otros siete y hace desaparecer la
excepción; también es lo más grande, porque toca la pantalla del calculador.

## D-p · Los tres campos del encabezado del módulo siguen en un solo sentido — PARADO Y REPORTADO

El punto 2(b) pide que lo tecleado en el estudio se vea en el módulo. Vale para los siete insumos
de los calculadores, y **no** para los tres del encabezado —`ett-septo`, `ett-pp` y `ett-fevi`—,
que siguen escribiendo hacia el estudio y no al revés.

**Por qué se paró.** `_amHayDatos` —la línea de pendientes de la miocardiopatía hipertrófica— lee
`ett-septo` y `ett-pp` como «el médico está evaluando amiloidosis en esta aplicación». Autollenarlos
desde `siv` y `ppvi` haría aparecer esa frase en el **informe de cualquier estudio con el septo
cargado**: es un cambio del papel firmado en pacientes que nadie evaluó por amiloidosis, y esta
corrección tenía prohibido tocarlo sin reportar primero.

**No es un agujero funcional:** el criterio de pared de 12 mm o más que esos campos alimentan lo
resuelve `calcETT` **leyendo** `siv` y `ppvi` cuando los del módulo están vacíos, que es un cálculo
y no una escritura. Lo que falta es que el número se **vea** ahí.

**Qué haría falta:** separar la señal «se está evaluando amiloidosis» de esos dos campos —una marca
propia, o un tercer campo— y recién entonces agregarlos al reflejo. Decisión de Maicol, porque la
señal que hay que mover es la que decide una frase del informe.

## D-q · El botón «↓ Traer del formulario» quedó sin trabajo, y además avisa al revés — SOLO REPORTADO

Es el punto 3 de la orden. **Qué hace hoy:** llama a `amAutoLlenar(k)`, que escribe los insumos de
ese criterio desde el estudio **sólo si están vacíos**, recalcula el criterio y avisa por `toast`.

**Medido con el reflejo en vivo:** con los ocho datos cargados en el estudio, `amAutoLlenar`
devuelve **false** en los cuatro criterios que tienen el botón —no hay nada vacío que llenar,
porque el reflejo ya lo trajo— y de **22** valores fotografiados (los nueve insumos, los cinco
puntajes, las cinco etiquetas, los resultados y el score) **no cambia ninguno**.

⚠️ **Y el aviso quedó al revés.** Como `amAutoLlenar` devuelve false, el botón muestra
«⚠️ No hay datos suficientes cargados en las otras pestañas para este criterio» **justo cuando los
datos están todos cargados**. Es lo peor de los dos mundos: no hace nada y dice que falta el dato.

**Qué pasaría si se retirara.** Nada del flujo de datos: los insumos llegan igual por el reflejo.
Se perdería un gesto explícito para repoblar un insumo que el médico haya vaciado **en el
calculador** sin querer vaciar el del estudio — pero con el modelo nuevo vaciar en el calculador
vacía el estudio, así que ese gesto ya no existe como tal. **Queda un solo caso de uso real:** el
`e′` promedio de **D-o**, que no tiene vuelta y donde el botón sí puede repoblar lo que el médico
borró. Si se retira, conviene retirarlo de los otros tres y dejarlo en ése, o cambiarle el aviso.

**No se tocó** porque retirar un control o reescribir su mensaje es decisión de Maicol y es texto
de cara al usuario.

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

## D-s · `data-espejo` significa dos cosas, y no hay nada que lo impida

Lo encontró **TC-514 en rojo** al retomar la verificación del D-11, y era una regresión de esa
misma corrección. El atributo se usa para **dos cosas distintas**:

| | Quién la pone | Valor |
|---|---|---|
| marca de **runtime** | el reflejo de amiloidosis, en vivo | `'1'` |
| **declaración** del marcado | está escrita en el HTML | sin valor (cadena vacía) |

La declaración la llevan **catorce** elementos: `im_espejos`, `im_pisa`, `vab_funcion`,
`mch_tvns`, `tv_legacy_ev`, `mca_v_may`, `mca_v_men1`, `mca_v_men2`, `tdf_tv`, `dsav_vi_ro`,
`cvpa_cia_ro`, `cvpa_vd_ro` y los dos restantes. **Nada en el código impide confundirlas**, y el
D-11 las confundió: al anotar la marca en la lista cerrada de «Nuevo estudio» se llevaba la
declaración de los catorce en cada estudio nuevo.

**Hoy está cerrado por el valor**: el selector pide `[data-espejo="1"]` y el cuerpo comprueba
`=== '1'` antes de borrar. Las dos mitades son redundantes entre sí —romper una sola sobrevive a
la mutación— y **se conservan las dos a propósito**, porque la convención que ese bloque declara
es que el selector y el cuerpo van juntos.

**Lo que quedaría mejor, y es decisión de Maicol:** darle a la marca de runtime un nombre propio
—`data-espejo-amilo`, por ejemplo— para que no pueda volver a chocar con la declaración. Son dos
lecturas en el reflejo, una en `amAutoLlenar`, una en `amiloGestoEnModulo`, una en `eaTaviEspejar`
y las dos de la lista cerrada; **el riesgo es que `eaTaviEspejar` usa la misma marca de runtime
sobre `ete_tavi_ava`**, así que el renombre tiene que cubrirlo o quedarse sin limpiar. Después hay
que correr la suite completa: TC-514 y TC-543 miden las dos caras.

---

# Tanda C1 (2026-10-28) — lo que quedó declarado

## C1-a · Dos textos clínicos declaran un corte de congestión que la app NO usa

**Medido.** El corte de congestión del Forrester en esta aplicación es `UMBRAL_PCP_HUMEDO`, que
vale **15** y se aplica como `pcp > 15`. Una presión capilar de **18 SÍ es congestión** acá.

Dos textos de pantalla dicen lo contrario:

- el `ojo` del globo ⓘ **`hemo-forr`**: «…la app no define la presión capilar de 18 exacta,
  porque la congestión aparece cuando esa presión **SUPERA 18**»;
- la tercera línea de `forrLin` en **`_indHemo`**: «Del otro lado coincide: la congestión
  aparece cuando la presión capilar **supera 18**, así que el 18 exacto tampoco está definido
  acá.»

El **18 es el corte del Braunwald**, que la línea anterior de ese mismo bloque cita bien
(folio 1125). Lo que está mal es atribuírselo a la aplicación. El propio comentario de
`UMBRAL_PCP_HUMEDO` registra que el pedido de mover el corte a 18 se hizo el 2026-09-16 y **no
se aplicó**, con su motivo.

**No se corrigió**: es texto clínico y la regla de la casa es reportar y esperar. Son dos
cadenas y el arreglo es de una línea cada una, pero decide Maicol.

## C1-b · Y el borde del índice cardíaco está declarado del lado que no es

**Medido.** En el Forrester, `frio = ic < FORR_IC_CORTE` (2,2), así que un índice cardíaco de
**2,2 exactos NO es hipoperfusión**. El «2,2 o menos» es de **`_icBanda`**, que es otra cápsula
y otra pregunta.

Los mismos dos textos dicen «Con un índice cardíaco de 2,2 justo, la app marca hipoperfusión» y
«Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos». Es cierto de
`_icBanda` y **falso del Forrester**, que es de lo que esas dos líneas hablan.

**No se corrigió, por lo mismo que C1-a.** TC-544 **(G5)** fija el borde real, así que si algún
día el corte se mueve el caso se pone rojo.

## C1-c · Los ejes del diagrama están al revés de lo que la orden pedía

La orden pedía la presión capilar en el eje horizontal y el índice cardíaco en el vertical.
`_labForrSVG` —el generador **único**, que el Laboratorio ya usa— los tiene al revés.

Girarlos obliga a una segunda geometría y a reubicar los cuatro rótulos de cuadrante, que es
exactamente lo que el comentario de ese generador previene. Se reutilizó tal cual.

**Si Maicol quiere la orientación de la orden**, la forma correcta es parametrizar
`_labForrSVG` con un `ejes:'pcp-x'` y mover los dos diagramas a la vez, no escribir un segundo
dibujo.

## C1-d · Dos vocabularios para los mismos cuatro cuadrantes

La cápsula dice **«Perfil A / B / L / C»** (Stevenson) y el diagrama **«I / II / III / IV»**
(`_LAB_FORR_LBL`, que el Laboratorio ya publica).

La correspondencia está verificada condición por condición: **A↔I, B↔II, L↔III, C↔IV**, con los
mismos dos operadores. No hay contradicción clínica; hay dos nombres para lo mismo, uno encima
del otro en la misma tarjeta.

**No se unificó**: renombrar un rótulo clínico es decisión de Maicol, y la orden pedía
explícitamente no inventar nombres de cuadrante.

## C1-e · El Laboratorio tiene un diagrama de Forrester, y NO ubica al paciente en curso

`_labForrRenderDash(infs)` dibuja **un punto por estudio GUARDADO del período**, con jitter
determinista y clic para abrir el estudio. **No conoce al paciente cargado en el formulario.**

La orden pedía anotarlo como idea si no lo ubicaba: **ubicarlo también ahí**, con una marca
distinta (un punto más grande o con borde) para distinguirlo de la cohorte. El generador ya
acepta una lista de puntos, así que es agregar un punto y distinguirlo, no un dibujo nuevo.
**Esta tanda no tocó el Laboratorio.**

## C1-f · `popPatron()` del posoperatorio tiene los DOS defectos que C1-3 cerró en otros lados

Medido, y queda fuera del alcance de esta orden (el posoperatorio está excluido salvo lo
listado):

1. Su rama de respaldo de la RVS lee **`v('hemo_pam')` a secas**, no `pamEfectiva()`. Las dos
   ramas de arriba (Swan y PiCCO) sí usan datos medidos, así que el defecto sólo aparece cuando
   se cae a la estimación por VCI — pero es el mismo que C1-3a cerró en la cápsula.
2. Tiene la **misma cascada de tres líneas** del VD/VI que `popPocusSync` tenía —`tep_vdvi`,
   después `vd_bas / ddfvi`— y **tampoco mira `vd_vi`**.

## C1-g · El arnés de A/B heredado sólo espiaba `addText` del PPT

`_probe_aab.mjs`, `_probe_bab.mjs` y los que derivan de ellos envolvían `addText` y **no**
`addTable`. La fila «Perfil de Forrester» de la diapositiva de Hemodinámica es una fila de
**tabla**, así que el A/B daba cero sobre ella sin que eso probara nada — el denominador vacío
que este repositorio ya documenta.

**Corregido en `_probe_c1ab.mjs`** (el PPT pasó de 27 a 30 textos capturados y la diferencia
apareció). **Los otros dos siguen con el defecto**, igual que `_probe_aab.mjs` y
`_probe_r2ab.mjs` siguen con el de `RECALC_MODULOS.forEach` que la tanda B declaró en B-g.

## C1-h · Dos mapas no recibieron puntero, y es a propósito

- **`docs/mapa/informe-pdf-excel.md`** está en **34,4 KB**, a 600 bytes del techo, y la orden
  pide explícitamente no agregarle nada. **No se tocó.**
- **`docs/mapa/tests.md`** está en **34,8 KB**, a **246 bytes** del techo. Un puntero lo cruza.
  **No se tocó.** La próxima tanda que necesite escribir en cualquiera de los dos tiene que
  partirlo primero.

## C1-i · La diferencia (d) de la RVS alcanza a MÁS casos que los que la orden autorizaba

La orden autoriza como diferencia permitida «(d) la RVS cuando hay PAM por catéter», y el punto
3a pide que la línea declare de dónde sale cada insumo. Las dos cosas no se superponen del todo:
**el origen se escribe siempre**, así que la línea de la RVS también cambia cuando la PAM es
tipeada o calculada —el **número** no, sólo el texto que lo acompaña—.

Medido: con PAM tipeada en 90, HEAD decía `1385 dinas·s·cm⁻⁵` y hoy dice
`1385 dinas·s·cm⁻⁵ · PAM tipeada; PVC estimada por eco`.

Se aplicó así porque el punto 3a lo pide por su nombre y da el ejemplo de la redacción. **Si la
intención era limitar el añadido al caso del catéter**, es un `if` de una línea sobre
`_pamRvs.clave === 'inv'`. Decide Maicol.

---

# La tanda C2 (2026-10-28) — lo que queda declarado

## C2-a · El médico perdió el interruptor del eco pulmonar, y es el precio del 1h

Hasta esta tanda el eco pulmonar llegaba al informe **sólo si el médico apretaba «📎 Integrar al
informe»**. El C2-1h retiró el bloque «Eco Pulmonar» del ETT Avanzado porque publicaba, palabra
por palabra, lo que el cuerpo del informe ya publica —y el PPT lo imprimía dos veces—, y con él
se fue el botón.

`pulAvanzadoIntegrado` preguntaba por `amiloEnInforme`, o sea por el registro: sin la entrada, el
predicado quedaba **falso para siempre** y el informe habría quedado mudo sobre el pulmón. Por eso
la compuerta pasó a ser el **dato** (`pulAvanzadoHayDatos`).

**Medido:** un estudio con eco pulmonar cargado y **sin** integrar pasa de informe mudo a informe
con sus líneas. Antes: nada. Hoy: «Derrame pleural bilateral moderado (volumen estimado por
ecografía de aproximadamente 500 ml).»

**Decide Maicol.** Si el interruptor tiene que volver, la forma barata es un checkbox propio de la
pantalla pulmonar —no una entrada en `amiloSecs`, que es lo que traía el bloque duplicado—. Un
`if` de una línea sobre ese campo en el bloque 13c alcanza.

## C2-b · La anotación de congestión del «Perfil hemodinámico» se movió con la constante

`UMBRAL_PCP_HUMEDO` pasó de 15 a 18, y tiene **cuatro** lectores. Tres son el Forrester —la
cápsula, el gráfico y el diagrama del Laboratorio— y el cuarto **no**: es la anotación que la
cápsula «Perfil hemodinámico» le cuelga al shock cardiogénico, «con congestión (PCP >N)».

Se movió igual, a propósito: dos cortes de congestión distintos en la **misma pantalla** —uno
diciendo 15 y el otro 18— se leen como un error de la app. Pero es una decisión de redacción
clínica que esta tanda no tenía orden explícita de tomar, y por eso se declara.

**Medido:** con IC bajo, RVS alta y PCP de 17, HEAD decía «Shock cardiogénico — GC bajo + RVS
elevada con congestión (PCP >15)» y hoy dice «Shock cardiogénico — GC bajo + RVS elevada», porque
17 ya no supera el corte.

Si la intención era mover **sólo** el Forrester, hace falta una segunda constante para esa
anotación. Decide Maicol.

## C2-c · Los tres `ic < 2.2` del «Perfil hemodinámico» conservan su operador estricto

`forrCuadrante` pasó a `<=` y `_icBanda` ya usaba `<=`, así que con un índice cardíaco de **2,2
exactos** la app dice hoy «bajo» en `hemo-ic`, «frío» en el Forrester y **no entra** en las tres
ramas del «Perfil hemodinámico» —shock cardiogénico, distributivo y mixto—, que siguen con `<`.

**No se tocaron porque son otro criterio**: cruzan IC con **RVS**, no con presión capilar, y esta
orden los excluye. Queda declarado como discrepancia conocida, no como olvido.

## C2-d · El bloque de ETT Avanzado se llevó un campo guardado: `am-txt-pulm`

Retirar la entrada `pulm` de `amiloSecs` retira el textarea que `amiloBuildCard` construía, así
que **el censo de campos del DOM baja uno** en las escenas donde la tarjeta se arma: 962 → 961.

- El **Excel sigue en 440 columnas**: `am-txt-*` nunca fue columna.
- El censo oficial de `detectar_huerfanos.py` **no cambia**: ese cuenta campos nombrados en el JS.
- **Los estudios ya guardados conservan su `am-txt-pulm`** —no se migró nada— y al reabrirlos ese
  texto queda sin lector. El contenido pulmonar vuelve a salir solo, compuesto desde los campos
  `pua_*` que el mismo estudio guarda.

## C2-e · El PPT perdió su diapositiva «Ecografía Pulmonar», y es lo que el 1h pedía

Leía `am-txt-pulm`. El contenido **no se pierde**: las primeras diapositivas del mazo llevan
`informe_texto`, y desde el B-E3 ese informe ya trae las frases del pulmón en su cuerpo. Lo que
desaparece es la **copia** — «el contenido pulmonar queda publicado UNA vez», que es lo que la
orden pide.

## C2-f · Faltan en la biblioteca las tres referencias del enunciado D6_11

Censado el 28/10/2026: **no están Balik 2006, ni Peris 2010, ni Remérand 2010**, que son las
[154–156] que el consenso cita juntas para la fórmula del volumen del derrame. Lo que la app
publica sale del consenso, que **sí** está y se leyó en imagen. Ninguna de las tres se cita en
pantalla.

## C2-g · El artículo original de Forrester tampoco está, y esta vez se censó por contenido

Se abrieron todos los PDF de las 28 carpetas buscando «Forrester»: **once lo contienen y ninguno
es el artículo** —nueve son la regla de Diamond-Forrester y dos son listas de autores—. Los dos
cortes salen de Braunwald, folio 1125, que lo reproduce y que ya estaba citado en pantalla. **No
se agregó ninguna fuente nueva.**

## C2-h · El efecto en los estudios guardados y en el Laboratorio: la regla, no el recuento

La orden pide «cuántos estudios cambian de cuadrante». **No se leyó el almacenamiento real del
médico** —la regla de seguridad de esta tanda lo prohíbe, y la sonda corre sobre un perfil limpio
de Playwright, con `localStorage` vacío—, así que lo que se puede dar es la **regla exacta**, que
es determinista:

- **Cambian de «húmedo» a «seco»** todos los estudios con presión capilar estimada **mayor de 15 y
  menor o igual a 18 mmHg**. En la fórmula de Nagueh (`1,24 × E/e′ + 1,9`) eso es un **E/e′ entre
  10,57 y 12,98**, que es una banda frecuente.
- **Cambian de «caliente» a «frío»** los que tengan un índice cardíaco de **exactamente 2,2**.
- Ningún otro estudio se mueve.

Sobre los cuadrantes: un estudio en **II** con PCP en esa banda pasa a **I**; uno en **IV**, a
**III**. La distribución del Laboratorio se corre en ese sentido. **No se migró ni se borró nada**:
el cuadrante se recalcula al abrir el estudio, no está guardado.

**Lo que falta medir**, y que sólo Maicol puede hacer con su navegador: abrir el Laboratorio sobre
sus estudios reales y anotar la distribución por cuadrante antes y después. La guía de prueba del
reporte lo deja como paso.

## C2-i · Los dos vocabularios de cuadrante siguen conviviendo (4e, sólo reportado)

**A / B / L / C** lo usa la cápsula `hemo-forrester` y, por ella, el informe integrado, la hoja de
ETT Avanzado del PDF y el PPT. **I / II / III / IV** lo usan `forrCuadrante`, `_labICPCP` /
`_labForrester`, el gráfico de Hemodinámica y el diagrama del Laboratorio.

La **regla** es una sola desde el C2-4b; los **rótulos** son de cada superficie. No se unificaron
porque unificarlos cambiaría el texto de un informe firmado. Los ejes del gráfico tampoco se
tocaron: decisión de Maicol.

---

# Tanda TEP (2026-10-29) — lo declarado

## TEP-a · Las tres referencias de la Tabla 4 que la app no tiene

La fila `RV/LV >0.9` de la **Tabla 4** de la AHA/ACC 2026 cita **[42, 51]**, y la del TAPSE cita
**[44, 51]**. Ninguno de esos tres trabajos está en la biblioteca, así que **el corte se cita a la
guía y no al estudio primario**, que es lo correcto, pero quiere decir que no se pudo verificar
cómo esos trabajos derivaron el 0,9 ni el 1,7 cm.

**Lo que falta:** conseguir las referencias 42, 44 y 51 y registrarlas.

## TEP-b · El trabajo original de McConnell (1996) no está en la biblioteca

Las cifras del globo —77 %, 94 %, VPP 71 %, VPN 96 %— se citan **como las reproduce Hotelling
2024**, y el texto lo dice. **No se leyó el original.**

**Lo que falta:** McConnell MV y colaboradores, *Am J Cardiol* 1996. Con el original leído, la
cita del globo puede pasar a ser directa.

## TEP-c · La sección de TEP no vive en «la pestaña de ventrículo derecho y TEP»

La orden de esta tanda la ubicaba ahí. **Medido: vive en `tab-hemodinamica`**, la pestaña
**🫀 Hemodinámica**, dentro de la tarjeta `tep-seccion`. No hay ninguna pestaña que se llame
«ventrículo derecho y TEP»: el VD vive en su propia pestaña y el TEP en Hemodinámica.

**Decidir:** si conviene mudarla, o si la ubicación actual es la correcta y lo que hay que
corregir es la documentación que la nombra de otra forma.

## TEP-d · La app SÍ asigna categorías de riesgo de TEP, en el panel de Evidencia

Respuesta al punto 3d, **reportada y no retirada**, como pedía la orden.

`_indTEP` publica **cinco categorías de la Tabla 8 de la ESC 2019** —«Riesgo ALTO»,
«INTERMEDIO-ALTO», «INTERMEDIO-BAJO», «INTERMEDIO» y «BAJO»— más una rama «la tabla no publica
esta combinación». Se deciden con **las cuatro respuestas que el médico contesta en el panel**
(`tep.ih`, `tep.vd`, `tep.pesi`, `tep.tropo`), **nunca con el conteo del eco**.

**Ejemplo medido:** con «Inestabilidad hemodinámica = Sí» y «Disfunción del ventrículo derecho =
Sí», la sección publica «**Riesgo ALTO** — Inestabilidad hemodinámica con disfunción del
ventrículo derecho…».

**Dónde NO aparece, verificado:** la cápsula de pantalla, el informe narrativo, el EN SUMA, la
hoja del PDF y el PPT. El span `tep-estratificacion` que las publicaba se retiró en el C-E2 y hoy
**no existe en el archivo** (censado: cero ocurrencias).

**Decidir:** si esas categorías se quedan donde están —que es lo que la decisión (4) parece
permitir, porque el panel no es el papel firmado— o si también salen.

## TEP-e · Las categorías A a E de la AHA/ACC 2026 no están en ninguna parte

La **Tabla 5** (hoja 13, folio e989) publica el esquema de categorías clínicas **A a E** de este
documento. La app **no lo implementa**, que es lo que la decisión (4) pide.

**Queda escrito** para que nadie lo agregue creyendo que falta: está ausente a propósito.

## TEP-f · TC-476 y TC-478 son intermitentes por una carrera propia

Los dos miden que la maquinaria `numdec` haya tomado el campo `vd_vi` (clase `numdec` e
`inputmode=decimal`). Con la máquina cargada, el caso lee **antes** de que esa pasada termine y
reporta `INPUT//null`.

**Medido, y no es de esta tanda:** los dos árboles convierten **384** inputs, con `vd_vi` en
`INPUT/numdec/decimal` y **cero errores de consola**, y los dos casos pasan **3 de 3** al
repetirlos sin carga.

**Lo que falta:** que los dos casos **esperen** a que la conversión termine en vez de leer el
atributo en el primer turno, igual que `pdfTxt` tiene que esperar a `window.jspdf` (**E-h**).

## TEP-g · El pie del cuadro POCUS vuelve a poder mentir

Dice «los cortes son los que la app ya aplica en la cápsula de TEP (TAPSE 17 mm · VD/VI 0.9)».
El **VD/VI** sale del dueño único, así que no puede desincronizarse. El **TAPSE** sale de
`UMBRAL_TAPSE_NORMAL` (ASE 2025) mientras la cápsula usa `TEP_TAPSE_BAJO_MAX` (AHA/ACC 2026):
**hoy coinciden en 17 y el día que una de las dos guías lo mueva, ese pie afirma algo falso.**

**Decidir:** si ese cuadro debe leer el del TEP —que es lo que su propio texto afirma— o si el
texto debe decir que son dos cortes de dos fuentes.

---

# Tanda G — pantallas y anchos (F) más la aorta integrada (AJ8) (2026-10-29)

## La medición del COMMIT 1, con su denominador

Sonda nueva: `scripts/_probe_gpant.mjs`. Recorre **27 puertas** —las 17 pestañas más las 10
subpestañas con barra propia— a **1000, 768 y 390 px**, en tema **claro y oscuro**, con un estudio
**lleno** (1.042 campos escritos) y uno **vacío**: **324 cruces**. Abre lo colapsado con el gesto
real de cada cabecera y abre y mide **618 tarjetas ⓘ**. Mide siete cosas: desplazamiento
horizontal del cuerpo, texto recortado, elementos superpuestos, controles por debajo de 44 px
donde esa regla existe, SVG que desborda o queda chico, tablas sin scroll dentro de su contenedor,
y lo que se sale del viewport.

**Línea base medida sobre el sello `v20261029-0019`:** **30 ALTA · 36 MEDIA · 738 BAJA**, y
**cero** desplazamiento horizontal del cuerpo, **cero** tablas sin scroll, **cero** elementos
superpuestos, **cero** elementos fuera del viewport y **cero** errores de consola en los 324
cruces. Las **30 ALTA son una sola causa**: diez pastillas de la pestaña Válvulas con el rótulo
recortado a 390 px.

⚠️ **LA PRIMERA CORRIDA DECÍA 44 ALTA Y VEINTICUATRO ERAN MÍAS.** La sonda medía el área táctil
con `getBoundingClientRect`, y este archivo extiende el área de varios botones con un `::after`
**absoluto**, que no ocupa lugar en el flujo y que el rect no ve. Medido con `elementFromPoint`:
`#pac-id-mk-ci` y `#pac-id-mk-matricula` informan **7×11 px de caja** y su área táctil real es
**35×41**, con las cuatro esquinas devolviendo el propio botón. No son un defecto: son el patrón
que el J3 documenta para no estirar la línea del rótulo a 44 px y desplazar el campo.
⚠️ **Y el comentario de ese CSS dice «Queda en 40 × 40», que es falso**: `left:-14px;right:-14px`
sobre una caja de 7 px dan **35**, y `top:-15px;bottom:-15px` sobre 11 px dan **41**. Corregido en
el COMMIT 2 — es un comentario, no un valor.

⚠️ **La severidad NO es la de `check_mobile.js` y no se suman.** Son dos instrumentos con
denominadores distintos: aquél mide 360 y 390 px en un tema; éste mide tres anchos, dos temas y
dos escenas por puerta. La línea base del celular que la orden fija —63 a 360 px y 72 a 390, con
17 ALTA— se sigue midiendo con `check_mobile.js`.

## F-a · Los 522 globos ⓘ de 16×12 px — BAJA, y es el estado conocido

De los **63** globos del archivo, sólo **8** llevan `vinfo-btn-44`. Los otros 55 son `vinfo-btn` a
secas y miden **16×12, 15×11 o 17×13 px** según el ancho. Repartidos por los 324 cruces dan 522
hallazgos.

⚠️ **Marcarlos ALTA sepulta lo que importa, y por eso no se hace.** Con ellos en ALTA el reporte
salía con **1.068** hallazgos de esa gravedad en vez de 44; es la misma lección que
`check_mobile.js` tiene escrita sobre los 56 ALTA de checkboxes etiquetados. ALTA queda para la
**regresión**: un globo que *lleva* la clase de 44 y mide menos. Hoy no hay ninguno.

**Decidir:** si la clase `vinfo-btn-44` pasa a ser la de todos los globos. El precio está medido
en la tanda AJ7: un área de 44×44 encajada con `margin:-16px` tapa 16 px del campo de abajo, así
que la mudanza no es poner una clase, es rehacer el espaciado de cada fila que lleva un globo.

## F-b · Ciento veinte botones entre 28 y 44 px de área táctil — BAJA

Por debajo del mínimo de WCAG 2.5.5 pero alcanzables, y **medidos por su área táctil real**, no
por su caja. Los tres grupos: 68 de **44×35**, 28 de **44×29** y 24 de **35×41** (los dos
marcadores de «este dato va al PDF», que son los del `::after`). No se tocaron.

## F-c · Los 96 SVG de muestra de Config — BAJA

Las miniaturas de tema y de diseño del panel de Configuración miden **94×54 px** (algunas 66×54)
con 18 a 27 nodos cada una. Son **muestras por diseño**, no gráficos de datos: se ven chicas
porque son una vista previa. Quedan como están.

## F-d · Doce tarjetas ⓘ que se leen scrolleando — MEDIA

Su contenido es más alto que la caja y se alcanza scrolleando dentro de la tarjeta
(`overflow:auto`, **no se pierde nada**), pero se lee cortada. Medidas, peor primero:

| Tarjeta | Ancho de ventana | Contenido | Caja |
|---|---|---|---|
| `co-riesgo-basal` | 390 px | 950 px | 571 px |
| `tarj-insuf-mitral` | 390 px | 804 px | 452 px |
| `tarj-esten-mitral` | 390 px | 658 px | 452 px |
| `vd-fun-card` | 390 px | 646 px | 621 px |
| `vi-geo` | 1000 y 390 px | 615 px | 564 / 445 px |
| `vi-card` | 1000 y 390 px | 591 px | 547 / 438 px |
| `hemo-ic` | 1000, 768 y 390 px | 582 px | 549 / 462 / 559 px |
| `hemo-rvs` | 1000 y 768 px | 553 px | 530 / 482 px |

(Doce tarjetas distintas en 36 cruces; la lista es la de la corrida final.)

**Decidir:** si la altura de la tarjeta debe poder usar toda la pantalla en vez de sólo el lado
del globo donde se coloca. Hoy se acota al lado elegido **a propósito**, para que la tarjeta nunca
tape su propio ancla —si lo tapa, el segundo toque, que es una de las tres formas de cierre, no
llega al botón—. Cambiar eso reabre ese defecto, así que no se tocó.

## F-e · El punto 2a no se reproduce, y está medido

La orden describe, en la pestaña **⚪ Pericardio y pulmón** a 1000 px y menos, «una frase con su
dibujo que no entra en la columna». **No ocurre.** Medido en los 12 cruces de esa puerta
—1000, 768 y 390 px × dos temas × lleno y vacío— con 114 elementos visibles en la escena llena y
las dos secciones abiertas con su gesto real: **cero** hallazgos de cualquier gravedad, y cero
desplazamiento horizontal.

Se le dio además la oportunidad que el barrido genérico no le daba: la rama del **derrame pleural
presente**, que es la que despliega «Distancia máxima entre pleuras (mm)» con su globo, más la
consolidación presente y las seis zonas marcadas, medida a **1200, 1000, 900 y 768 px**. Cero
elementos fuera de su columna en los cuatro anchos. Y la única tarjeta ⓘ de la pestaña,
`pul-balik`, mide **300×431 px** y entra entera a 1440, 1000, 768 y 390 px.

**Y la pestaña no tiene ningún SVG**: censado, cero. El único dibujo de esa pantalla es la grilla
de zonas por hemitórax, que son casillas y entran en las dos columnas en los cuatro anchos.

**Decidir:** si el hallazgo era de otra pestaña, o de un estado que esta medición no alcanzó. Sin
un estado concreto que lo muestre no se puede arreglar sin inventar el defecto.

## F-f · El punto 2c NO se puede resolver con el mecanismo de ancho, y está medido

La orden pide que el globo `co-riesgo-basal` «entre entero a 390 px con el mecanismo de ancho por
clave que ya existe, sin cambiar su texto». **Ese mecanismo no puede hacerlo**, y no es una
opinión: `_vInfoColocar` calcula `w = max(150, min(ancho, vw - 16))`, así que a 390 px el ancho se
topa en **374** para cualquier valor de la clave.

Medido con la clave puesta en **300, 374, 560, 640, 900 y 2000**, a 390×844 y a 390×900:

| `ancho` | Ancho real | Caja | Contenido | ¿Entra? |
|---|---|---|---|---|
| 300 | 300 px | 298×520 | 298×**1140** | no |
| 374 | 374 px | 372×520 | 372×**950** | no |
| 560 | **374 px** | 372×520 | 372×**950** | no |
| 640 | **374 px** | 372×520 | 372×**950** | no |
| 900 | **374 px** | 372×520 | 372×**950** | no |
| 2000 | **374 px** | 372×520 | 372×**950** | no |

A 768 y a 1440 px el mismo barrido confirma los números que la tanda D dejó escritos: con 560 el
contenido queda en **662** contra 648 de hueco —los catorce píxeles— y con **640** entra en 614.

**Lo que falta es una decisión, no un ancho.** El problema es de **alto**, no de ancho: el
contenido mide 950 px y la pantalla entera a 390×844 deja como mucho 828. Ninguna anchura lo
arregla y acortar el texto cuesta una clase o un calendario, que es justo lo que **D-i** declara.
El camino que D-i propone —una ficha en Referencias para `co-riesgo-basal`, que además le daría el
botón «Ver referencia» que hoy no tiene— sigue siendo el que resuelve las dos cosas a la vez.

**Esta parte se paró y se reporta, no se aplicó.**

## G-a · Los tres `2.2` del Perfil hemodinámico se alinearon, y su efecto hoy es CERO — medido

El COMMIT 3 cerró **C2-c**: las tres comparaciones del «Perfil hemodinámico» —shock cardiogénico,
perfil distributivo y la línea gris de IC con RVS baja— leen `FORR_IC_CORTE` en vez de un literal
`2.2`, y pasaron de `<` a `<=` (la tercera, de `>=` a `>`, para que la partición siga siendo
exhaustiva y el 2,2 no caiga en dos ramas).

⚠️ **PERO EL BORDE ES INALCANZABLE EN ESA CÁPSULA, Y ESTÁ MEDIDO.** El índice cardíaco que llega a
`calcHemo` tiene **una sola fuente**: el volumen sistólico por TSVI, o sea
`π × (Ø/20)² × VTI × FC / 1000 / ASC`. Barrido de **3.812.589 combinaciones** —nueve diámetros,
121 frecuencias y 3.501 valores de VTI— sobre el `double` que el código produce:
**cero dan 2,2 exactos**. Lo más cerca que se llega es **2,1999990587652083**, a 9,4 × 10⁻⁷.

Consecuencia: la diferencia entre `<` y `<=` **no se puede observar hoy** en esa cápsula, y el A/B
de este commit da cero diferencias por esa razón y no porque la sonda no mire. Las nueve escenas
medidas —IC 2,1999 / 2,1999990 / 2,64 cruzados con RVS alta, baja y media— dan el mismo texto
**antes y después**, palabra por palabra.

El cambio igual vale: quita el literal duplicado, deja un solo dueño del número y pasa a ser
observable el día que esa cápsula reciba un índice cardíaco **tipeado**. Hoy el único tipeado es
`pop_picco_ic`, que no entra por acá y que lee `_icBanda`.

**Lo que queda, y por eso esto es un pendiente:** `_icBanda` (línea del seam compartido con el
posoperatorio) **sigue escribiendo el literal `2.2`** en vez de leer `FORR_IC_CORTE`. Su
comportamiento ya es el correcto —`<= 2.2`— así que cambiarlo no movía nada y no se tocó, pero es
el mismo corte escrito dos veces. **Decidir** si pasa a leer la constante.

⚠️ **Y UNA PREMISA DE LA ORDEN ES FALSA, MEDIDA:** el punto 3 dice que no se toque «el semáforo
del posoperatorio, cuyo diseño es "IC mayor de 2,2"». **El posoperatorio no tiene corte propio**:
usa `_icBanda` y `_rvsBanda`, las mismas de Hemodinámica. Su propio comentario lo dice —«el pedido
de POP-2 traía su propia escala (1.8 / 2.2) y NO se aplicó — decisión de Maicol: manda la de la
app»—. No había nada que excluir.

## G-b · Los COMMITS 5, 6, 7 y 8 de la tanda G NO SE HICIERON

La orden pedía nueve commits. Se cerraron **cinco** —el 1, el 2, el 3, el 4 y el 4c—, cada uno con
su A/B, sus casos y su medición. Los cuatro de la PARTE AJ8 que faltan quedan **declarados y sin
empezar en el código**, no a medio hacer: ninguna línea de la app se tocó por ellos.

**Lo que sí queda hecho para el que siga, y es la mitad del trabajo:**

- **Las cuatro fuentes están leídas EN IMAGEN y transcritas** en `docs/fuentes/FUENTES.md` →
  «La tanda G»: la **Figura 5** (folio 28) con sus ocho segmentos por sexo y la duda de la
  descendente resuelta (♂ primero), el **apartado 9.2.1.1** (folio 71) literal, la **Tabla 38**
  (folio 80) con sus ocho recomendaciones y los ocho factores uno por uno, y la **Tabla 62**
  (folio 114) de Marfan con su nota ^c.
- **La regla de folio de ese documento está comprobada**: folio = hoja del PDF, 0-based, sin
  offset, verificado en el pie impreso de cuatro páginas.
- **El inventario de la raíz está hecho y medido** (→ `docs/mapa/g-raiz-aortica.md` § 1).

**Lo que falta, por commit:**

- **COMMIT 5** — los índices aórticos calculados solos (`marfan_ita` fuera de la pantalla, la
  clave guardada intacta) y la aortopatía hereditaria publicada en el informe y el EN SUMA **sólo**
  con el síndrome, el diámetro y «dilatada», sin umbral, clase, nivel ni índice —salvo Turner—.
  Hoy el EN SUMA dice «Aortopatía por … con indicación quirúrgica Clase I/IIa/IIb (…)», que es lo
  que el punto (ii) retira. **El punto 5a exige verificar antes que la Evidencia ya traiga esos
  umbrales, clases y niveles**: de las tres tablas que nombra, la **62 ya está leída en imagen**;
  faltan la **66** (folio 116, Loeys-Dietz) y la **67**.
- **COMMIT 6** — los otros segmentos contra la Figura 5. Los valores ya están transcritos. Lo que
  falta es el cableado: unión sinotubular y ascendente por sexo con el texto «por encima del
  límite superior de lo normal (ESC 2024, Figura 5)», y el cayado y la descendente con su chip
  «Criterio de EcoSmart». ⚠️ **Y la Figura 5 parte el arco en DOS tramos —proximal 37/34 y medio
  34/31— mientras la app tiene uno solo**, que es justamente lo que esa decisión manda declarar.
- **COMMIT 7** — bicúspide nombrada una sola vez y la coartación al EN SUMA. **No se midió nada**
  de esta parte: el punto 7a empieza por «verificá primero si ya están resueltos estos
  pendientes», y esa verificación no se hizo.
- **COMMIT 8** — los ocho factores de la Tabla 38 con tres estados. La orden misma (T7) lo nombra
  como el que puede quedar incompleto. ⚠️ **Está medido que hoy la Evidencia cuenta TRES factores
  y la tabla tiene OCHO**: `nFact` en `_indAo` es `crecimiento + familiar + embarazo`, así que un
  paciente cuyo único factor es la hipertensión resistente o la longitud aórtica **no dispara la
  recomendación**. Es un defecto con consecuencia clínica y sigue abierto.

## ~~G-c · La Tabla 62 dice «≥ 45 mm» y la app aplica «> 45»~~ — **CERRADO: ERA FALSO** (tanda Y, 2026-10-29)

⚠️ **ESTE PENDIENTE ERA UN ERROR DE LECTURA MÍO, Y QUEDA ESCRITO PARA QUE NADIE LO «ARREGLE».**

La fila 3 de la Tabla 62 (folio 114, releída en imagen en la tanda Y) dice efectivamente
«… un diámetro máximo de los senos aórticos **≥ 45 mm** y factores de riesgo adicionales^c» —
**IIa · C**. Lo que es falso es la segunda mitad: **`marfanEstado` NO aplica `maxAo > 45` para el
Marfan, aplica `maxAo >= u.iia` con `UMBRAL.marfan.iia = 45`.** O sea que **ya está alineado**.

**Medido sobre el árbol de HEAD**, con síndrome de Marfan y factores de riesgo consignados:

| diámetro | clave | texto |
|---|---|---|
| 44,9 mm | `sin_indicacion` | «sin criterios quirúrgicos aórticos actuales» |
| **45,0 mm** | **`cx_iia`** | «considerar cirugía de la aorta (ESC 2024, Tabla 62 · folio 114, Clase IIa · Nivel C desde 45 mm con factores)» |
| 45,1 mm | `cx_iia` | ídem |
| 50,0 mm | `cx_i` | «cirugía de la aorta indicada (… Clase I · Nivel B desde 50 mm …)» |

**El `maxAo > 45` que este pendiente citaba es el de LOEYS-DIETZ**, dentro de
`if (sind === 'lds')`, y ahí el operador estricto es **correcto**: su Tabla 66 (folio 116) dice
«cuando el diámetro es **SUPERIOR A** 45 mm». Las dos ramas están bien y no hay nada que mover.

**G-d sigue abierto y es otra cosa**: el `incRef` de la raíz, que va al revés que su fuente.

## G-d · El `incRef` de la raíz va al revés que su fuente, y conviven a propósito

El apartado 9.2.1.1 escribe **`> 40`** y **`> 36`**: estrictos. La app cuenta el valor **exacto**
como dilatado (`incRef:true`, decisión de Maicol del VS5, 2026-10-17), así que 40,0 mm exactos son
dilatados acá y no en la guía.

**No se tocó, que es lo que el punto 4a pide** («Mantené los operadores actuales de los cortes
(40, 36) en los bordes y reportalos»). Queda escrito para que nadie lo «arregle» creyendo que es
un descuido: está decidido y la fuente ahora está transcrita al lado.

## G-e · Un estudio guardado con la raíz en los DOS campos y con valores distintos no se reconcilia

`aoRaizReconciliar` sólo copia cuando **uno de los dos está vacío**. Con los dos cargados y
distintos —un estado legítimo de un estudio viejo, porque hasta esta tanda no se sincronizaban— no
toca nada: elegir cuál vale es decidir por el médico, y reescribir lo guardado es justo lo que la
regla «no migrar estudios guardados» prohíbe.

La discrepancia queda a la vista: `_indAo` ya toma el máximo de los dos y lo publica.

**Decidir:** si esa reconciliación debe avisar en pantalla, o si conviene dejarla muda.

## G-f · `_icBanda` sigue escribiendo el literal 2.2

Ver **G-a**. Es el mismo corte escrito dos veces; su comportamiento ya es el correcto, así que no
se tocó.

---

# Tanda AJ9 (2026-10-29) — lo declarado

## AJ9-a · La diferencia del segmento 15 entre Lang y Cerqueira no se pudo verificar

La orden pide escribir en el ⓘ de los territorios que **Lang 2015 asigna el segmento 15 a la
descendente anterior** y Cerqueira a la coronaria derecha. **No hay hoja de Lang 2015 donde eso
se pueda leer**: su **Figura 5** (folio 13) es un dibujo anatómico con categorías de color
—RCA, LAD, CX, «RCA o CX», «LAD o CX» y «RCA o LAD»— y **no numera los segmentos**. La Figura 4
(folio 12) sí los numera, pero es la orientación de las vistas apicales, no el territorio.

**Se paró esa parte y no se escribió.** Citar una diferencia que la fuente no publica sería
inventar una cita.

**Decidir:** si hay otro documento de la biblioteca que la sostenga, o si la diferencia se retira
del pedido.

## AJ9-b · El patrón «Normal» sigue diciendo «SGL típico: < -20%»

El corte de normalidad de la aplicación es **−18** desde esta tanda, y el rango ilustrativo del
patrón normal sigue en **−20**. Los dos conviven en la misma pestaña, a dos pantallas de
distancia: el rótulo de la fila de cálculo clasifica un −19 como **normal** y la tarjeta del
patrón sugiere que lo típico empieza en −20.

**No se tocó porque cambiar un rango clínico es decisión de Maicol**, y el punto 3c de la orden
pide explícitamente conservarlos con su rótulo ilustrativo. Hoy el rango lleva pegado «Criterio
de EcoSmart (ilustrativo)», así que ya no se lee como un corte validado.

**Decidir:** si los rangos de los patrones se alinean con los cortes de la ASE 2025 o se quedan
como ilustración.

## AJ9-c · El panel de cardio-oncología del Laboratorio cuenta mal el strain tipeado en positivo

`glsAn` filtra con `g > SGL_NORMAL_MAX` sobre `co_gls_actual`, y ese campo acepta los dos signos:
**todo lo tipeado en positivo cuenta como anormal**. Es el mismo defecto que el filtro de
auditoría de la misma pantalla ya cerró con `Math.abs`.

El número NO se movió en esta tanda —sólo dejó de estar tecleado—, porque arreglar el signo
**mueve la distribución publicada del Laboratorio** y eso está fuera de la orden.

**Decidir:** aplicar `Math.abs` ahí también, sabiendo que el porcentaje publicado va a cambiar.

## AJ9-d · «Patognomónico» en el patrón de amiloidosis

La descripción del patrón dice «Patrón patognomónico». La biblioteca no lo sostiene: Phelan 2012
publica sensibilidad **93 %** y especificidad **82 %** —o sea casi uno de cada cinco controles da
positivo— y la propia **Figura 6** de la ASE 2025 ilustra una **insuficiencia renal terminal con
un patrón que lo imita**.

**Se reporta y no se corrige**: cambiar un rótulo clínico es decisión de Maicol. El aviso del
imitador sí entró, en la tarjeta ⓘ de la sección.

## AJ9-e · La app no dice de qué paredes sale la relación ápice/base del score

`calcApice` divide el valor absoluto del campo «Strain apical» por el del campo «Strain basal»,
los dos **genéricos**. Boldrini define el SAB como la relación **septal**, medida en la vista de
**cuatro cámaras**.

**Ejemplo medido, el mismo paciente de las dos formas:** apical −18 % y basal −6 % (septal de
cuatro cámaras) → **3,00**, criterio marcado, **+3 puntos**. El mismo apical −18 % con un basal
**global** de −7,5 % → **2,40**, sin marcar, **0 puntos**. Son tres puntos de un score que se
considera diagnóstico desde ocho.

Y hay un tercer mezclado: el texto del criterio dice «strain apical relativamente preservado
**vs base y segmentos medios**», que es el denominador de **Phelan** —ápex sobre la suma de basal
y medio, con corte de 1,0— y no el de este corte, que es ápex sobre base.

**El corte conserva su valor, que es lo que la orden pide.** La procedencia está hoy en la
tarjeta ⓘ.

**Decidir:** si los rótulos de los dos campos pasan a decir «septal, cuatro cámaras» y si el
texto del criterio se corrige.

## AJ9-f · El Excel sigue exportando el SGL con el signo que el médico tecleó

La columna `GLS (%)` exporta `sgl` crudo. En un estudio con el strain tipeado en positivo, el
informe firmado dice «SGL −18 %» y la columna dice **18**.

**No se tocó a propósito**: la orden prohíbe cambiar una columna de Excel sin parar y reportarlo,
y reescribir el campo del estudio habría tocado lo que el médico escribió. El Laboratorio ya
promedia en valor absoluto, así que su media no se ve afectada.

**Decidir:** si la columna publica el valor negativo, sabiendo que eso cambia el Excel de los
estudios con strain positivo.

## AJ9-g · `check_backticks.py` no caza un acento grave dentro de un comentario del template

Cuatro veces en esta tanda un backtick dentro de un comentario de una sonda o de un caso cerró el
template literal y mató el archivo con un `SyntaxError` que apunta decenas de líneas antes del
culpable. **El chequeo no lo encontró ninguna de las cuatro**: lo que sirve es `node --check`
sobre el archivo.

**Decidir:** si `check_backticks.py` pasa a correr `node --check` sobre cada `.mjs` que toca, o
si se documenta que el chequeo real es ése.

---

## Tanda POP-V2 · el posoperatorio reordenado (2026-10-29) — DECLARADO y NO arreglado

## POP-a · La vasopresina (y la terlipresina) llevan mcg/kg/min, que es una unidad POR PESO

La orden de esta tanda dice, textual, «la vasopresina no se dosifica por peso: conservá su unidad
actual». Las dos cosas no pueden ser verdad a la vez: la unidad que esta app le declara hoy —en el
`placeholder` y en el `aria-label` de `pop_vaso_dosis`— es **mcg/kg/min**, que sí es por peso.

Se hizo lo único que no afirma nada nuevo: la vasopresina **no escribe su dosis sola** —se le
sigue mostrando la estimación al lado, con una línea que dice por qué no se escribe— y la unidad
**no se tocó**.

**La terlipresina está en la misma situación** y la orden no la nombra: la app le declara
mcg/kg/min y en la práctica se dosifica en bolos de mg. Se trata como lo que la app declara, o
sea con dosis automática.

**Decidir:** si las dos cambian de unidad —vasopresina a U/min, terlipresina a mg— sabiendo que
eso es un rótulo clínico en una superficie que el médico lee, y que la dosis de un estudio
guardado quedaría con la unidad vieja.

## POP-b · El PiCCO no tiene campo de PAM, y la cascada lo nombra como si lo tuviera

La orden describe el primer escalón del dueño único como «la medida por catéter (Swan-Ganz,
**PiCCO** o línea arterial)». Censado: los cinco campos del PiCCO de este módulo son `pop_picco_gc`,
`pop_picco_ic`, `pop_picco_itbvi`, `pop_picco_evlwi` y `pop_picco_svri`. **No hay PAM.**

Con «PiCCO» elegido, `pamEfectiva` cae al segundo escalón —la tipeada en Hemodinámica— y la hoja
del PDF la rotula «de Hemodinámica», que es correcto pero no es lo que la orden describe.

Agregarle el campo sería un **segundo campo guardado**, y esta tanda autoriza uno solo.

**Decidir:** si se autoriza `pop_picco_pam` con su rótulo «medida (PiCCO)».

## POP-c · La RVS de `popPatron` sigue sin leer el dueño único, y ahora se ve

La tanda C1 dejó esto declarado: la tercera rama de `popPatron` calcula la resistencia con
`v('hemo_pam')` directo, no con `pamEfectiva()`. La cápsula «Perfil hemodinámico» **sí** lee el
dueño único desde el C1-3a.

**La línea arterial lo hace visible.** Medido en esta tanda:

| escena | cápsula de Hemodinámica | `popPatron` |
|---|---|---|
| sólo línea arterial 62 | **1009** dinas·s·cm⁻⁵ | **ninguna** |
| línea arterial 62 + tipeada 95 | **1009** | **1574** |

O sea dos resistencias del mismo paciente en la misma pestaña, y la del módulo es la que viaja a
su hoja del PDF cuando está integrado.

**No se tocó:** cambiar la fuente de la RVS del módulo mueve un número clínico en una superficie
firmada, y esta orden no lo lista.

**Decidir:** si `popPatron` pregunta a `pamEfectiva()` en su tercera rama, sabiendo que eso cambia
la RVS publicada de los estudios donde las dos fuentes difieren.

## POP-d · El timing del balón no sobrevive a reabrir el estudio

`#pop-bcia-timing` va con **guion medio** y entra en las dos listas de «esto no es del estudio»,
porque la orden autoriza **un solo** campo guardado nuevo y ése es la PAM por línea arterial.

**El precio:** el médico elige «verificado» o «inconsistente», cierra el estudio, lo reabre y el
selector vuelve a «Sin verificar». No llega a ninguna superficie firmada, así que el papel no
miente — pero una observación clínica que el médico hizo se pierde.

**Decidir:** si se autoriza `pop_bcia_timing` como segundo campo guardado (censo 1026 → 1027 de
campos del estudio; el Excel **no** se movería: `LAB_XLS_MAP` no tiene un solo `pop_`).

## POP-e · «Edema pulmonar» es un diagnóstico que este módulo no emite

El punto 5c de la orden pide que la conclusión «nombre el derrame pleural y el **edema pulmonar**
cuando están cargados». El módulo de POCUS de esta misma pantalla llama a eso **«síndrome
intersticial»**, y la quinta pregunta lo gradúa como **«congestión pulmonar»**. «Edema pulmonar»
no aparece en ninguna otra superficie de este módulo.

Se usó el vocabulario que la app ya tiene: «Líneas B difusas bilaterales — síndrome intersticial,
que es el signo de congestión pulmonar que esta pantalla gradúa».

**Decidir:** si el módulo estrena la palabra «edema pulmonar», sabiendo que es un diagnóstico y
que hoy la app describe el signo.

## POP-f · `popAbrirEnEscritorio` es código muerto desde la tanda G

Recorre cinco ids —`pop-ctx`, `pop-soporte`, `pop-hemo`, `pop-pocus`, `pop-concl`— que **no
existen**: las secciones del módulo llevan `data-pop`, no `id`. Censado: cero coincidencias de
`id="pop-ctx"` y compañía en todo el archivo. Es un no-op desde que la G las convirtió en
tarjetas.

No se tocó porque esta tanda tiene un tipo de cambio por commit y borrar código muerto no es
ninguno de los siete.

**Decidir:** si se retira la función con su llamada, o si se le devuelven los ids.

## POP-g · Cinco arneses de A/B miden el PPT con todas las casillas apagadas

`generarPPT` carga el estudio guardado en el formulario (`pdfDeInformeGuardado`) y la reposición
lee las casillas de `c[el.id + '__chk']`, no de `c[el.id]`. El estudio sintético que el arnés
heredado construye **no tiene esa clave**, así que todas las casillas vuelven apagadas.

Medido: la franja de drogas del posoperatorio decía «sin infusión activa» sobre una escena con la
noradrenalina marcada, **en los dos árboles**. Es un denominador envenenado del arnés, no un
defecto de la app, pero tapa cualquier diferencia que dependa de una casilla.

Corregido en `scripts/_probe_popab.mjs`. **Siguen con el defecto** `_probe_r2ab.mjs`,
`_probe_aab.mjs`, `_probe_bab.mjs`, `_probe_c1ab.mjs` y `_probe_c2ab.mjs`.

**Decidir:** si se corrige en los cinco, o si se documenta que las tandas R2, A, B, C1 y C2
midieron su PPT con las casillas apagadas.

## POP-h · El PPT imprime la CLAVE de la droga, no su nombre

La rama del posoperatorio del PPT busca el nombre con
`document.querySelector('label[for="pop_<k>_activa"]')`, y ese `label` **no existe**: en el
marcado la etiqueta **envuelve** al `input` y no lleva `for`. El `|| k` de respaldo hace que la
diapositiva imprima `nor 0.2` donde debería decir `Noradrenalina 0.2`.

Medido en los dos árboles: es un defecto preexistente que esta tanda **destapó** al corregir el
estudio sintético del arnés (POP-g), no uno que haya introducido.

**No se tocó:** corregirlo cambia el texto de una superficie firmada y no está en la lista de
diferencias que esta orden autoriza.

**Decidir:** si el PPT lee el nombre de `c.parentNode.textContent`, que es de donde ya lo leen
`amiloTextoPOP` y `popEsquema`.


## La tanda Y, Parte 1 (2026-10-29) — lo declarado y lo que quedó sin hacer

### Y-a · El censo del script pasó de 1027 a 1028, y es un control de PANTALLA

El campo nuevo `vd-triv` —el espejo del TRIV tricuspídeo en VD / AD— es un `<input>`, así que
`detectar_huerfanos.py` lo cuenta. **No es un campo guardado**: su prefijo entra en
`_noEsDelEstudio`, el recolector no lo toma, el juego de campos guardados de todo estudio que se
guarde desde hoy no se movió y el Excel sigue en **440** columnas con las mismas claves.
Medido en Chrome: el recolector da 946 campos y `vd-triv` no está entre ellos.

**No hay nada que decidir**: queda escrito para que la próxima medición del censo no lo lea como
un campo guardado nuevo.

### Y-b · El corte de 75 ms del TRIV no tiene fuente — EL COLOR Y EL SIGNIFICADO ESTÁN PARADOS

La orden pedía que, por encima de 75 ms, las **dos** referencias del TRIV lo marcaran en amarillo,
y que la referencia nueva de VD / AD llevara el mismo texto y la misma fuente que la del Doppler.
Las dos cosas estaban condicionadas a **verificar el corte y su fuente en la biblioteca, en
imagen**. Se verificó y **no se pudo**:

| Qué | Valor | Dónde |
|---|---|---|
| ASE 2025 de corazón derecho, texto | **≤ 73 ms** «in normal healthy adults» | hoja 28, folio 168 |
| ASE 2025, **Tabla 6**, fila «RV IVRT, ms» | **≤ 73 / > 73** | hoja 29, folio 169 |
| `DT_TRIV_HTP_PANEL` (pantalla, «a favor de HTP») | **75** | **sin fuente publicada** |
| `DT_TRIV_HTP` (informe firmado, signos indirectos) | **60** | **sin fuente registrada** |

Y los 73 ms de la guía contestan **otra pregunta**: son criterio de **pseudonormal** en la función
diastólica del VD, no de hipertensión pulmonar. El código ya declara, desde el 2026-10-07, que el
75 es «el comentario de pantalla que pidió Maicol para este cuadro».

**Lo que SÍ se hizo** (la orden lo autoriza sin condición): el campo nuevo y la sincronización en
los dos sentidos.

**Decidir, y es decisión clínica:**
1. **dejar el 75 como criterio propio** y darle el amarillo y la referencia nueva, declarándolo
   con el chip «CRITERIO DE ECOSMART» y **sin corchete**, como la banda leve del strain del VD; o
2. **mover el corte a los 73 ms de la ASE 2025** — pero eso cambia un corte clínico, y además el
   73 es de otra pregunta, así que habría que decidir primero qué afirma esa fila; o
3. dejarlo como está, con el campo en las dos pestañas y el significado sólo en el Doppler.

### Y-c · La pastilla de la raíz puede decir «iDA de 22 mm/m² (dilatada, iDA >22 mm/m²)»

El valor del índice se redondea con el **mismo `Math.round`** que el informe ya usa para él, así
que un índice entre 22,0 y 22,5 se imprime como «22» justo al lado del corte «>22» y la frase se
lee como una contradicción.

**Medido:** peso 45, talla 156, raíz 31 mm → superficie 1,3965 m², índice **22,1996** → la pastilla
dice «iDA de 22 mm/m² (dilatada, iDA >22 mm/m²)». Con peso 45 y talla 150 el índice es 22,64 y
dice 23, que se lee bien.

**El informe tiene el mismo efecto desde el G-4** («dilatada por índice, 22 mm/m²»), así que no es
nuevo: lo que esta tanda hizo fue ponerlo al lado del corte, donde se ve.

**No se cambió el redondeo**: es la convención que la pantalla y el papel comparten, y moverla es
decisión de Maicol. **TC-521 (B3) lo fija tal como es**, para que se ponga rojo el día que se
decida. **Decidir:** una decimal en las dos superficies, o dejarlo.

### Y-d · COMMIT 4 de la orden — la aorta: índices solos y aortopatía en el papel — **NO SE HIZO**

Ninguna línea de la app se tocó por este commit. Lo que ya está medido y listo para la próxima
sesión:

- **4b: no hay nada que alinear.** Medido — ver `G-c`, que era un pendiente falso y queda cerrado.
- **4a: la Evidencia de aortopatías ya trae clases, niveles, tablas y folios**, medido con el
  panel renderizado sobre un Marfan de 46 mm con factores: publica tres recomendaciones Clase I ·
  Nivel C de la **Tabla 60 (folio 113)**, nombra la **Tabla 62 (folio 114)** y la **Tabla 63
  (folio 114)**, y transcribe el apartado 9.2.1.1 (folio 71) y la Figura 24 (folio 76).
  **PERO le falta lo que el informe publica hoy**: las filas de la Tabla 62 como
  **recomendaciones aplicables** —«≥ 50 mm, Clase I · Nivel B» y «≥ 45 mm con factores, Clase IIa
  · Nivel C»—. Hoy el 45 sólo aparece bajo «Lo que falta para decidir otras filas», y el 50 no
  aparece. La Tabla 62 ya está **transcrita fila por fila en imagen** en `FUENTES.md` → «La tanda
  Y», así que agregarlas no exige volver a abrir el PDF.
- **(i) los índices solos:** el campo `marfan_ita` vive en `#marfan-ita-wrap`, que ya nace con
  `display:none` y lo muestra `marfanSync` sólo para Turner. El índice de Turner tendría que
  salir de `marfan_ao_ascendente / getBSA()`.
  ⚠️ **Y ACÁ HAY UNA DECISIÓN QUE LA ORDEN NO TOMA, Y POR ESO SE PARÓ:** `marfan_ita` es un campo
  **guardado** y una **columna de Excel** («Marfan/EHAT índice tamaño aórtico (mm/m2)»), y además
  el Laboratorio lo lee (`_labCampoRaw(i,'marfan_ita')`) para decidir si un estudio cuenta como
  Marfan/EHAT. Si el valor se **calcula y se escribe solo**, eso es un automatismo escribiendo en
  el estudio, que es justo lo que el modelo «un dato, dos puertas» del D-11 prohíbe. Si se
  **calcula y no se escribe**, la columna de Excel queda vacía para todo estudio nuevo y el
  Laboratorio deja de contarlos — y el Laboratorio está **fuera** de esta tanda.
  **Decidir cuál de las dos**, o una tercera.
- **(ii) la aortopatía en el papel:** medido en HEAD, hoy el informe publica
  «… Síndrome de Marfan con diámetro aórtico máximo 46 mm con factores de riesgo — considerar
  cirugía de la aorta (ESC 2024, Tabla 62 · folio 114, Clase IIa · Nivel C desde 45 mm con
  factores).» y el EN SUMA «Aortopatía por síndrome de Marfan con indicación quirúrgica Clase IIa
  (ESC 2024, Tabla 62 · folio 114).» Los dos emisores están en el mismo bloque, alrededor de la
  línea 58.320 (`/* ── Marfan / EHAT — aortopatía hereditaria ── */`). El trabajo es reescribir
  las ramas de `marfanEstado` para que el `txt` que va al papel no lleve umbral, clase, nivel ni
  tabla, **conservándolos** para la Evidencia — hoy son **la misma cadena**, así que hay que
  partirla en dos.

### Y-e · COMMIT 5 de la orden — los otros segmentos (Figura 5) — **NO SE HIZO**

Ninguna línea se tocó. La **Figura 5 (folio 28)** ya está transcrita en imagen en `FUENTES.md` →
«La tanda G», con sus ocho segmentos por sexo y con la duda de la descendente **resuelta**
(el símbolo de varón va a la izquierda: proximal 29/26 y distal 23/20 son varón/mujer).

Lo que falta decidir y hacer: `AO_SEGS` tiene **cinco** segmentos (`ao_sin`, `ao_st`, `ao_tub`,
`diam_cayado`, `diam_ao_toracica`) y la figura tiene **ocho**; el **arco viene partido en dos
tramos** (proximal 37/34 y medio 34/31) y la app tiene uno solo, y la **descendente** también
(proximal y distal) y la app tiene una. La orden sólo pide alinear la **unión sinotubular** y la
**aorta ascendente**, que sí tienen correspondencia directa, con el texto «por encima del límite
superior de lo normal (ESC 2024, Figura 5)» y **no** «dilatada». Hoy `AO_REF` da `st:38` y
`tub:40` sin sexo; la figura da 38/33 y 40/36.

### Y-f · COMMIT 6 de la orden — bicúspide y coartación — **NO SE HIZO**

Ninguna línea se tocó. **El punto 6b sí se contestó**: la Tabla 38 (folio 80) se leyó en imagen y
está transcrita fila por fila en `FUENTES.md` → «La tanda Y». **Tiene OCHO recomendaciones**, la
de los ocho factores es la **fila 8 (IIb · B)**, y el valor de 50 mm aplica a **tres** filas
distintas (la 5, la 7 y la 8) — que es de dónde venía la discrepancia entre las dos lecturas
previas: las dos eran ciertas y describían cosas distintas.

Lo que queda sin hacer es 6a: la coartación con sus tres textos largos al ⓘ, la coartación en el
EN SUMA, el «sin alteraciones» que no puede convivir con una bicúspide o una coartación, y la
Evidencia de la bicúspide con cada umbral una sola vez.

### Y-g · PARTE 2 ENTERA (commits 8 a 13) — **CERRADO el 2026-10-29 por la tanda IMÁGENES**

Los seis commits se hicieron: la medición de dónde y cómo se guardan las imágenes con su sonda de
rendimiento reutilizable, la página «Imágenes guardadas» de Guardados, la estrella de imagen con su
nota, la privacidad y el armado del PPT, y la función común que guarda un esquema de la app como
imagen del estudio con su primer uso en la orejuela. Lo que quedó declarado de esa tanda son
**IMG-a** a **IMG-g**, arriba. El texto original de este pendiente queda debajo.

### Y-g (texto original) · PARTE 2 ENTERA (commits 8 a 13) — **NO SE HIZO**

Ninguna línea se tocó, y **las referencias visuales aprobadas en `docs/3d/` no se abrieron ni se
modificaron**. Queda entera: medir cómo y dónde se guardan hoy las imágenes, la sonda de
rendimiento con 100 a 120 estudios sintéticos, la página «Imágenes guardadas» de Guardados, la
estrella de imagen con su nota, la privacidad y el armado del PPT, y la función común que guarda
un esquema de la app como imagen con el primer uso en la orejuela.

### Y-h · Cinco arneses viejos leen el nodo del strain que esta tanda retiró

`_probe_aj5.mjs`, `_probe_aj7.mjs`, `_probe_te.mjs`, `_probe_ewk.mjs` y `_ab_e.mjs` leen
`vd_strain_pl-grado`, que ya no existe: devolverán «NO EXISTE» en los dos árboles, que es un
denominador envenenado — exactamente el defecto que esta tanda encontró en su propia sonda con el
guion del TRIV. **Son de tandas cerradas y no se corrigieron**, que es lo que la regla T9 manda
para los arneses viejos. El que vuelva a usar uno de ellos tiene que cambiar ese id por
`vd-strain-interp` antes de creerle al resultado.

---

## Tanda IMÁGENES (2026-10-29) — lo que el commit 1 midió y hay que reportar

### IMG-a · El video de un estudio borrado sobrevive para siempre, y está MEDIDO

Las tres bases de contenido tienen tres suertes distintas al borrar un estudio:

| Base | Store | Recolector | Quién lo llama |
|---|---|---|---|
| `ceibomed_img` | `imagenes` | `CeiboImg.recolectar` | `imgRecolectarHuerfanas`, desde `eliminarInforme`, `limpiarTodosInformes` y `eliminarInformeYVolver` |
| `ceibomed_cine` | `cineloops` | `CeiboCine.recolectar` | `cineRecolectarHuerfanos`, **sólo al entrar a la pestaña 🖼️ Imágenes** |
| `ceibomed_video` | `videos` | **no existe** | — |

Medido en el entorno de prueba: se sembró un estudio con un video de 32.768 bytes, se borró el
estudio y se corrieron **los dos** recolectores que la app tiene. `CeiboImg.recolectar` se llevó
las 3 imágenes huérfanas; `CeiboVideo.uso()` siguió devolviendo `{n:1, bytes:32768}`. Los bytes
del video quedan en disco sin ningún estudio dueño y sin ninguna vía que los alcance.

**No se borró nada** —la orden prohíbe migrar o borrar imágenes— y **no se agregó el
recolector**: `CeiboVideo` no tiene índice de huérfanos y escribir uno es una decisión sobre
borrado de dato clínico, que es de Maicol. Lo que esta tanda sí hace es no empeorarlo: la página
nueva de imágenes lista por estudio vivo, así que un video huérfano no aparece en pantalla.

### IMG-b · La barra de memoria de Guardados pone DOS denominadores en la misma línea

La línea principal dice, textual, `█░░░░░░░░░<1% · 769 KB usado`, y esos dos números no son del
mismo conjunto:

- el **porcentaje** sale de `navigator.storage.estimate()`, o sea del **origen entero** —todas
  las bases, más `localStorage`— sobre la cuota del navegador;
- los **KB** salen de `CeiboImg.uso().bytes`, o sea **sólo** del store `imagenes`.

Medido sobre la misma siembra de 12 imágenes: origen 795.798 bytes, imágenes 786.964. La
diferencia es chica hoy porque casi todo el consumo del origen SON las imágenes, y crece con
cada cineloop y cada video guardado — que no entran en los KB que la línea publica. El detalle
desplegable sí los separa bien («💾 780 KB usados de 10240.8 MB disponibles», que es el origen).

**Reportado y no corregido**: cambiar un texto de pantalla o el número que publica es decisión de
Maicol. Esta tanda no lo toca.

### IMG-c · Un esquema NO entra al backup, y se pierde al resetear el navegador

`exportBackup` lee las imágenes por `CeiboImg.leer(uuid)`, que devuelve **sólo `imgs`** —los slots
del estudio—. Los esquemas viven en `esqs`, en el mismo registro, y esa lista no se exporta: un
backup de nivel «Informes + imágenes» no los lleva, no sobreviven a un reseteo del navegador y un
import que promete reemplazar todo los deja fuera.

Es el mismo patrón que la deuda de CardioSalud documenta para `cardiosalud_syntax`, y se declara
por el mismo motivo: tocar el exportador cambia el formato del backup, y eso es otra orden. El
costo real es acotado —un esquema se vuelve a generar solo en cuanto el médico toca cualquiera de
los cuatro campos de la orejuela— pero la imagen que estaba guardada no es la que vuelve.

### IMG-d · Las etiquetas por tipo (2D, color, Doppler) no se implementaron, y es correcto

El punto 3b de la orden dice: «Si la demo aprobada trae otras etiquetas por tipo (2D, color,
Doppler), implementalas solo si están en la demo». **Censada la demo: no las trae como rótulos.**
Lo que tiene es un array `TYPES` con cuatro valores —`2d`, `dop`, `col`, `mm`— que usa **para
generar los dibujos sintéticos** de sus 40 imágenes de ejemplo, no para etiquetarlas en pantalla:
ninguna miniatura ni el visor muestran ese valor. No hay nada que implementar, y si alguna vez se
quiere, hace falta decidir de dónde saldría el tipo de una imagen real —el DICOM lo declara, un JPG
importado no—.

### IMG-e · El PPT de imágenes no se probó en PowerPoint, sólo en el formato

El archivo se genera y se abre: 24 diapositivas, 25 medios, 1,39 MB, los textos censados uno por
uno y cero nombres de paciente en los 24 XML. Lo que **no** se hizo es abrirlo en PowerPoint o en
Keynote y mirarlo. Va por `_pptxDescargarSaneado`, que es el camino que ya corrige el defecto de
`[Content_Types].xml` que hacía pedir reparación, así que el riesgo es bajo — pero está declarado.

### IMG-f · El espacio que ocupa el esquema no se le avisa al médico

Un esquema de la orejuela pesa unos 40.000 caracteres de `dataURL`, o sea del orden de media
captura en calidad media, y se escribe solo. `CeiboImg.uso()` lo cuenta —y la barra de memoria lo
incluye en sus KB, con `esquemas` como contador propio— pero no hay ningún aviso de que la app
empezó a guardar imágenes que el médico no capturó. Con un esquema por estudio y 500 estudios son
~20 MB. Decidir si eso merece un aviso, o un interruptor propio, es de Maicol.

### IMG-g · El esquema sólo se guarda si el médico toca uno de los cuatro campos

Es deliberado y es la mitad del punto que el D-9, el D-10 y el D-11 pagaron tres veces: el
guardado cuelga del gesto y no del barrido de recálculo, porque si colgara del barrido **abrir un
estudio guardado le escribiría un esquema que nadie pidió**. La consecuencia, declarada: un
estudio que ya está guardado con datos de orejuela **no** recibe su esquema al abrirlo. Lo recibe
en cuanto alguien toca un campo, o al guardarlo de nuevo. Si se quiere que los estudios viejos lo
tengan, eso es una migración y necesita su propia orden.

---

## TANDA NOCTURNA — Parte A (la orejuela del ETE y los videos), 2026-10-30

### NOC-A-a · El chorro de insuficiencia es CENTRAL siempre: falta el «velo afectado»

La demo aprobada orienta el chorro con **dos** datos: el Carpentier y el velo afectado —en el
tipo II va hacia el lado opuesto al velo que prolapsa, y en los dos tipos III hacia el mismo lado
del velo restringido—. El Carpentier **sí existe** en la app, en dos campos espejados (`vm_carp`
en Válvulas y `ete_carpentier` en el ETE, que sincroniza `vmCarpPropagar`).

**El velo afectado NO existe**, censado el documento entero: no hay ningún campo guardado que
diga qué velo o qué festón está comprometido. La vista quirúrgica dibuja los seis festones pero
no persiste cuál se eligió. Con el Carpentier solo no se puede decidir un lado —el tipo II manda
el chorro a un lado o al otro **según el velo**—, así que dibujar uno sería inventar una
dirección. El chorro queda central, y su TAMAÑO sí sigue al grado leído de Válvulas.

**Lo que costaría:** un campo guardado nuevo, que esta tanda tiene prohibido agregar, más su
columna de Excel si se quiere que viaje. Es decisión de Maicol.

### NOC-A-b · «Lo normal es 40 cm/s o más» NO se escribió, y no es un olvido

El borrador del ⓘ lo pedía. **Ninguna de las cuatro fuentes leídas publica un valor normal de la
velocidad de vaciamiento.** Lo que Hahn 2013 dice en el folio 954 es que por encima de 40 cm/s se
predice mayor probabilidad de mantener el **ritmo sinusal normal** tras la cardioversión: el
adjetivo «normal» de esa oración es del ritmo, no de la velocidad. La ficha de Referencias de la
app ya decía, desde la I-E2, que «la guía da los números y no los nombres».

El ⓘ lo declara en su bloque «Lo que no se pudo verificar». Si Maicol quiere publicar un valor
normal, hace falta una fuente que lo publique.

### NOC-A-c · «Hahn 2021 (ASE, ETE en intervenciones estructurales)» no está en la biblioteca

La orden lo citaba con las hojas 47, 52 y 53. Censadas las 186 PDF, lo que hay es **Little SH,
Rigolin VH y cols.** (Hahn figura entre los autores), *Recommendations for Special Competency in
Echocardiographic Guidance of Structural Heart Disease Interventions*, ASE, en
`Estandar Informe/ASE ECO cardiopat estructural.pdf`, de **16 hojas**: las hojas 47, 52 y 53 no
existen. Su hoja 12 sí publica los cuatro ángulos, pero el ⓘ cita a Glikson, que es la fuente que
se leyó para ese punto. **No se citó lo que no se pudo abrir.**

### NOC-A-d · Los folios 3355 y 3359 de la ESC 2024 de FA no hablan de la orejuela

La guía **sí está** en la biblioteca —Van Gelder IC y cols., *Eur Heart J* 2024;45:3314-3414—
pero archivada en la carpeta equivocada: `22_Hemodinamica_avanzada/ehae176.pdf`. Censada por
contenido, porque por nombre de archivo no aparece. La regla de folio es hoja + 3313.

**Los dos folios que la orden nombra son de otra cosa:** el 3355 (hoja 42) es dronedarona y el
ensayo CASTLE-AF, y el 3359 (hoja 46) es ablación en insuficiencia cardíaca. Lo que esa guía
publica sobre la orejuela está en los folios 3346 a 3349 y son **recomendaciones de cierre
percutáneo**, que es justo lo que este ⓘ tiene prohibido llevar. No se citó.

Queda pendiente **moverla a su carpeta** (`24_Arritmias_y_sincope`), que es un cambio en la
biblioteca y no en el proyecto.

### NOC-A-e · La ficha `ref-oai` de Referencias sigue repitiendo lo que ahora dice el ⓘ

La orden pide que «la ficha de Referencias del tema, si existe, no repita el texto: lo cite».
**No se hizo, y el motivo es el costo medido.** Hasta el A3 el ⓘ CLONABA esa ficha, así que había
un solo texto; desde el A3 el ⓘ tiene el suyo y la ficha quedó con su contenido anterior, que se
superpone en tres puntos: la morfología, la velocidad de vaciamiento con el folio 954 y el SEC.

Vaciar esos tres bloques de la ficha saca de **Referencias**: el bloque de la velocidad con su
cita, y el chip **«CRITERIO DE ECOSMART»** de esa ficha. Ese chip lo CUENTA `TC-507`, y los
censos de Referencias de `TC-471`, `TC-500`, `TC-502` y `TC-509` cuentan fichas y entradas. No es
un cambio de redacción: es un cambio de inventario de Referencias, y hay que decidir **qué queda
en la ficha** —lo razonable es que queden las dos tablas de dispositivos, que el ⓘ no lleva—.
Es decisión de Maicol y necesita su propia orden.

### NOC-A-f · Los huérfanos YA EXISTENTES de video y cineloop NO se pudieron contar

El A4 cierra la causa —`CeiboVideo` no tenía recolector y nadie llamaba al de `CeiboCine`— y
desde ahora **las bajas sí se los llevan**. Lo que quedó sin hacer es el recuento de los que ya
están huérfanos, y el motivo es que **viven en el perfil de Chrome del médico**: la orden prohíbe
tocar el almacenamiento real y toda prueba va en el entorno de prueba. Desde una sonda con perfil
temporal esas bases están vacías por construcción, así que un cero ahí no significa nada.

**Cómo contarlos, sin borrar nada** — abrir EcoSmart en el navegador de siempre, abrir la consola
y pegar esto, que sólo LEE:

```js
(async () => {
  const vivos = new Set((getInformes() || []).map(i => i && i.uuid).filter(Boolean));
  const cine = (typeof CeiboCine !== 'undefined')
    ? await new Promise(r => { const q = indexedDB.open('ceibomed_cine');
        q.onsuccess = e => { const db = e.target.result;
          const t = db.transaction(db.objectStoreNames[0]).objectStore(db.objectStoreNames[0]).getAll();
          t.onsuccess = () => r(t.result || []); }; }) : [];
  const vid = await new Promise(r => { const q = indexedDB.open('ceibomed_video');
      q.onsuccess = e => { const db = e.target.result;
        const t = db.transaction(db.objectStoreNames[0]).objectStore(db.objectStoreNames[0]).getAll();
        t.onsuccess = () => r(t.result || []); }; });
  const hc = cine.filter(x => !vivos.has(x.uuid)), hv = vid.filter(x => !vivos.has(x.uuid));
  console.log('estudios vivos:', vivos.size,
              '· cineloops huerfanos:', hc.length, 'de', cine.length,
              '· videos huerfanos:', hv.length, 'de', vid.length,
              '· bytes huerfanos:', [...hc, ...hv].reduce((a, x) => a + (x.bytes || 0), 0));
})();
```

Para **borrarlos** —que esta tanda NO hace— alcanza con una baja cualquiera desde hoy, porque el
recolector nuevo recoge todo lo que no tenga estudio dueño, no sólo lo del estudio que se borra.

### NOC-A-g · La frase del trombo no nombra la ablación

El borrador decía «hay que descartarlo antes de la cardioversión, la ablación y el cierre
percutáneo». La cardioversión (Saric 2016, folio 13) y el cierre (Meier 2014, folio 1401) están
verificados. **La ablación no**: censadas las tres fuentes de la orejuela, ninguna recomienda
descartar el trombo antes de una ablación —Meier la nombra sólo para dar la incidencia de trombo
en pacientes anticoagulados que van a ablación—. El ⓘ dice las dos que sí.

### NOC-A-h · El cuadro que el médico elige NO sobrevive a reabrir el estudio

`_oaiEsqManualUuid` es una variable de ejecución y no se persiste, así que al reabrir el estudio
el guardado automático vuelve a mandar y el primer tecleo reemplaza el cuadro elegido. **Es
deliberado**: la elección fue sobre un cuadro de esa sesión y no es una preferencia del estudio, y
persistirla sería un campo guardado nuevo, que esta tanda tiene prohibido. Declarado porque el
médico puede esperar lo contrario.

---

## TANDA NOCTURNA — Parte B (AORTA-1), 2026-10-30

### NOC-B-a · EL COMMIT B4 NO SE HIZO, y no quedó a medias

Los segmentos de la Figura 5 por sexo —alinear la **unión sinotubular** y la **aorta ascendente**
a los valores de la guía, con el texto «por encima del límite superior de lo normal» en vez de
«dilatada», y el cayado y la descendente conservando su corte con el chip «Criterio de
EcoSmart»— **no se implementó. Ninguna línea de la app se tocó por él.**

**El motivo es de capacidad, y es explícito.** Ese commit son DOS cambios clínicos distintos
sobre el papel firmado —cortes nuevos por sexo y un vocabulario nuevo para graduar— y cada uno
necesita sus bordes medidos por segmento y por sexo, antes y después, más la adaptación de los
casos que hoy afirman «dilatada» para esos dos segmentos. Empezarlo y no poder cerrar la Parte B
por completo —suite, A/B, dos motores— habría dejado un cambio clínico a medias, que es
exactamente lo que la orden prohíbe.

**La mitad del trabajo ya está hecha**: los ocho valores de la Figura 5 están transcritos **en
imagen**, con su folio comprobado en el pie impreso, en `docs/fuentes/FUENTES.md` → «La TANDA
NOCTURNA, Parte B». Y el inventario del lado de la app también:

- `AO_REF` vale hoy `{ sin:40, st:38, tub:40, cay:40, desc:35 }` y **sólo la raíz** tiene corte
  por sexo (`refSexo: AO_DIL_MM`, 40/36) y segunda puerta por índice (`idaMax: 22`);
- los dos segmentos que la orden quiere alinear son `ao_st` (38 → **38/33**) y `ao_tub`
  (40 → **40/36**);
- el cayado (40) y la torácica descendente (35) **no tienen correspondencia directa** con la
  figura, que parte el cayado en proximal (37/34) y medio (34/31) y la descendente en proximal
  (29/26) y distal (23/20);
- `aoSegRef` ya resuelve el corte por sexo con `refSexo`, y `aoSegDil` ya tiene la rama que lo
  usa. ⚠️ Esa rama compara con `>=` sin mirar `incRef`: hoy da igual porque el único segmento con
  `refSexo` es la raíz, que **sí** lleva `incRef:true` por decisión de Maicol. Para los dos
  nuevos hace falta el operador **estricto** —la figura publica «upper normal values», o sea que
  el valor del corte es normal—, así que esa rama tiene que pasar a respetar `incRef`.

### NOC-B-b · El borde del redondeo del iDA, un decimal más abajo

El B2-2c dejó el iDA con **un decimal** en la pastilla, el informe y el EN SUMA, y el redondeo es
**para mostrar, nunca para decidir**: la dilatación se decide con el valor crudo. Eso deja un
borde: un iDA de **22,0208** se muestra «22,0» junto a «>22», o sea que leído literal se
contradice. Medido con una raíz de 31,25 mm y superficie corporal 1,4191.

**Esto CIERRA el pendiente `Y-c`** para la escena que lo motivó —un índice de 22,13 que el entero
mostraba como «22» y que ahora dice «22,1»— y corre el problema un decimal. Es inherente a
redondear para mostrar: redondear antes de comparar movería el borde, que es peor. Si se quiere
cerrarlo del todo, la salida es no mostrar el valor cuando cae dentro de un decimal del corte, o
mostrar dos decimales en ese caso. Es decisión de Maicol.

### NOC-B-c · El round-trip del Excel cambia para la columna del índice

Desde el B2 la columna «Marfan/EHAT índice tamaño aórtico (mm/m2)» exporta el valor **calculado**
—aorta ascendente ÷ superficie corporal— y no el campo. Consecuencia medida: en un estudio con
ascendente 44,2 y superficie 2,00 y un índice guardado de 23,5, la columna trae **22,1**, y al
reimportar el campo queda en 22,1.

**No cambia nada aguas abajo**, y está medido por los dos lados: en un estudio donde el índice se
puede calcular el valor guardado **no lo lee nadie** —gana el cálculo—, así que la conclusión, la
cápsula y la propia columna salen idénticas; en un estudio donde NO se puede calcular, la columna
trae el guardado y el round-trip es exacto. `TC-131` lo fija con dos condiciones nuevas.

Queda declarado porque es un cambio en lo que esa columna significa, y el round-trip es un
invariante que este repositorio cuida.

### NOC-B-d · La Tabla 58 publica DOS índices y un z-score, y la app aplica uno

La Tabla 58 (Turner, folio 3640) condiciona sus dos recomendaciones a **tres** medidas a la vez:
el **ASI** (diámetro ÷ superficie corporal, mm/m²), el **AHI** (diámetro ÷ talla, mm/m) y el
**z-score**. La app sólo tiene el ASI, así que su cascada se cumple con una de las tres.

**No se tocó**: agregar el AHI y el z-score son dos medidas nuevas, y el z-score además necesita
un nomograma que la app no tiene para ese segmento. Es decisión de Maicol.

### NOC-B-e · La Figura 5 y el apartado 9.2.1.1 no dicen lo mismo del seno, y la app sigue al apartado

El apartado 9.2.1.1 (folio 3603) da **>40 mm en el varón y >36 mm en la mujer** para la
dilatación de la raíz; la **Figura 5** (folio 3563) da **40 y 34** como límite superior normal del
seno de Valsalva. La app aplica **40 / 36**, que es el del apartado y lo que la tanda G verificó.

**No se tocó, y se reporta**: son dos partes del MISMO documento que publican cortes distintos
para la misma medición en la mujer. Cambiar el de la mujer de 36 a 34 movería el grado de la raíz
de todas las pacientes entre esos dos valores, y eso es decisión de Maicol.

### NOC-B-f · La Parte C no se empezó

La orden la condiciona a que A y B cierren sin rojos y a que quede capacidad. A cerró sin rojos
nuevos; B cierra con tres de sus cinco commits y el cuarto declarado arriba. **La Parte C no se
empezó: ninguna línea de la bicúspide, de la coartación ni de los cuestionarios de factores de
riesgo se tocó.**

### NOC-B-g · TC-262 y TC-419 fallan por dependencia de orden, y no es de esta tanda

Los dos tienen la condición «ni aparecio ninguna de mas» sobre el inventario de filas del cajón
Doppler, y en ciertos lotes la rompen con **`ao:AVAi (BSA 2.00)`**: un caso anterior deja el peso
y la talla cargados, y con superficie corporal el cajón gana la fila del AVA indexada.

**Verificado en un worktree sobre el commit B1, con los mismos scripts y el mismo lote: falla
idéntico.** En la corrida completa de once lotes los dos salen verdes, porque el lote que los
contiene es otro. Es el mismo modo de falla que el AJ7 documentó con TC-507 y la tanda A con
TC-537: una condición que depende de lo que dejó el caso anterior.

---

# La TANDA CORRECCIONES (2026-10-30) — lo que se paró y se declara

### COR-a · «Considerar mayor complejidad para el cierre percutáneo» sigue en el papel firmado

El barrido 1c —64 escenas y 1.315.598 caracteres de superficie firmada, contra trece palabras de
veredicto y conducta— encontró **tres frases y nada más**. Una se retiró (el «no apto»). Esta es
la segunda, y **vive en la misma sección de la orejuela**:

> «Orejuela izquierda multilobulada sin trombo. **Considerar mayor complejidad para el cierre
> percutáneo.**»

Sale con tres o más lóbulos y sin trombo pendiente. Su propio comentario argumenta que es «una
nota sobre la ANATOMÍA … no una recomendación de conducta: no dice si cerrar ni con qué», y la
orden de esta tanda sólo manda retirar **el veredicto de aptitud**. Queda **reportada y sin
tocar**: empieza con un verbo de conducta en un documento que la aplicación declara descriptivo,
y decidir si eso se retira es de Maicol.

### COR-b · El cuadro de referencias del VD no sigue el orden nuevo de la grilla

El COR-3 reordenó los dieciocho campos a tres columnas de seis. **El cuadro de referencias de
abajo NO se reordenó**, y el comentario del marcado que decía «las referencias de abajo siguen
ESE mismo orden» dejó de ser cierto —está corregido en el código—.

No se tocó porque el pedido es sobre la grilla de CAMPOS, y porque **tres casos de prueba cuentan
ese cuadro fila por fila** (TC-457, TC-476 y TC-549, con su conteo de doce filas y cuatro
condicionales). Reordenarlo es otra tanda.

### COR-c · Hay DOS cuentas de «disfunción del VD» en la aplicación

El COR-2c extrajo `vdDisfPresente()` como dueño único del `OR` de cinco parámetros que el informe
firmado usa. **No es la única cuenta de esa pregunta que existe**: la vista 2D de válvulas cuenta
cuántos de los textos `tapse-interp`, `sprime-interp` y `fac-interp` dicen «disfunci» para elegir
el trazo del dibujo —**tres** parámetros, no cinco, y sin el índice de Tei ni el strain—.

No se unificó, y por un motivo: la de la vista 2D es un **heurístico de trazo** que no afirma
nada en ninguna superficie firmada, y le pregunta a los TEXTOS ya pintados en vez de a los
valores. Unificarlas cambiaría el dibujo de estudios que hoy se ven de una manera. **Medir primero
cuántos estudios reales cambiarían de trazo.**

### COR-d · La aorta ascendente de AI/VI no está espejada con la de Marfan

El espejo del G-4 cubre **sólo la raíz** (`ao_sin` ↔ `marfan_ao_seno`). La **ascendente** tiene
dos campos que no se hablan: `ao_tub` en AI/VI y `marfan_ao_ascendente` en la pantalla de
aortopatía, que es el que el índice de tamaño aórtico del síndrome de Turner divide.

Medido: con la ascendente cargada en AI/VI y Turner elegido, el mensaje decía «falta la aorta
ascendente» sobre una pantalla donde el médico creía haberla cargado. **El COR-4b lo hace menos
confuso** —el mensaje dice ahora «la aorta ascendente **de esta pantalla**»— pero no lo cierra.

No se espejó porque **es exactamente el riesgo que el G-4 midió para la raíz**: `marfanEstado()`
cuenta `asc` entre sus datos, así que poblarlo desde AI/VI encendería la tarjeta de aortopatía en
todo estudio con la ascendente medida, y el Laboratorio y una columna de Excel cambiarían con
ella. El espejo tendría que ser **condicional**, como el de la raíz, y eso es una decisión.

### COR-e · La inclusión en el PDF no sobrevive a cerrar y reabrir el estudio

El COR-5 pone el esquema incluido en `imgSlots`, que es memoria. Con Config **prendido**, al
guardar el estudio la imagen se escribe en disco y vuelve con él, así que ahí sí sobrevive. Con
Config **apagado** la inclusión vale para la sesión y nada más.

Es consecuencia directa de **5c**, que prohíbe campos guardados nuevos y manda reusar el
mecanismo de las imágenes del estudio. Queda declarado porque el médico puede esperar lo
contrario: el botón dice «Incluir en el PDF» y no «Incluir en el PDF de ahora».

### COR-f · TC-551 mide el chorro sin pausar, y es intermitente

En una corrida en lote, las condiciones **(C1)** y **(C3)** de TC-551 cayeron con «chorro false»;
corrido solo, el caso pasa **3 de 3**. La causa es del caso y no de la aplicación: el chorro de
insuficiencia **sólo se dibuja en sístole**, y esas dos condiciones leen su atributo `d` sin
pausar la animación, así que lo que miden depende del instante.

**No se tocó**: es un caso de otra tanda y arreglarlo es cambiar lo que mide. El que lo vea rojo
tiene que pausar antes de leer, no mirar el dibujo.

### COR-g · El commit 7 de la orden no existía como tal

La orden numera siete commits y el séptimo es «cobertura y documentación». Se hizo. **Lo que no
se hizo es ningún cambio de código fuera de los seis primeros**, y eso es deliberado: la orden
dice que los commits van en orden de prioridad y que si hay que dejar algo afuera es el 6. No
hizo falta dejar nada afuera.


---

## Tanda AJUSTES-1 (2026-10-30)

### AJ1-a · «Manga de viento — riesgo intermedio» sigue diciendo un riesgo que la fuente no da

La orden del 30/10 saca «— riesgo intermedio» del **cactus** con el argumento de que ninguna
fuente de la biblioteca le asigna riesgo a esa morfología. **El mismo argumento vale para la
manga de viento**, y su `<option>` lo sigue diciendo.

Medido: las otras DOS superficies que nombran las cuatro formas —la ficha `ref-oai` de
Referencias y la entrada «Morfología» de `OAI_GLOBO`— publican «ala de pollo (menor riesgo) ·
coliflor (mayor riesgo) · cactus · manga de viento», o sea **sin riesgo para las dos últimas**.
El `<select>` era el único lugar donde las dos lo afirmaban, y hoy lo afirma una sola.

**No se tocó** porque la orden nombra sólo el cactus, y cambiar un rótulo clínico que no nombra
es decisión de Maicol. El cambio es de una línea: el texto del `<option value="veleta">`; el
`value` **no** se toca, que es campo guardado.

### AJ1-b · «Considerar mayor complejidad» salió del papel y no quedó en ningún lado

La orden manda retirar la frase del informe y, «si existe en la Evidencia o en Referencias»,
rotularla «CRITERIO DE ECOSMART — sin fuente verificada». **Censado el documento entero: no
existe en ninguna de las dos.** Su única aparición era el papel.

O sea que el contenido —que una orejuela multilobulada complica el sellado del dispositivo— **se
perdió de la aplicación**. El hecho anatómico no: el informe sigue diciendo «Orejuela izquierda
multilobulada».

**Qué falta decidir:** si ese contenido va a la Evidencia de la orejuela, y con qué fuente. La
biblioteca tiene la ASE 2021 de ETE (folio 50), que manda **medir** la profundidad y la zona de
anclaje en los cuatro planos pero no publica nada sobre el número de lóbulos.

### AJ1-c · Contractilidad y SGL no tienen el resumen al costado

La orden pide verificarlo y reportar si no. Se verificó: su maqueta es **«cada una con su imagen
arriba y su texto debajo»**, con la leyenda de colores al costado en 34 mm reservados. O sea que
el resumen va **debajo**, no al lado, al revés que la VAB después del AJ1-2b.

**No se tocó**: la orden dice «si no, reportalo». Cambiarlo es rehacer `_dibujarFila`, que
reparte hasta tres columnas —contractilidad, strain y la captura del 3D— con una regla que cubre
las ocho combinaciones de tres casillas independientes; moverles el texto al costado reduce el
ancho de imagen de cada columna y hay que volver a medir los ocho casos.

### AJ1-d · El orden de los diagramas en la fila de miniaturas

La orden lo pide explícitamente y lo condiciona: «si el orden o la inclusión de los diagramas
exige un campo guardado nuevo, PARÁ esa parte y reportala».

**Lo exige.** Cada diagrama tiene hoy **su propia sección** en el PDF, en un lugar que decide el
código —el bull's eye de contractilidad y el de strain comparten fila, la bicúspide va después
del reloj del TAVI, la vista quirúrgica mitral después—. No hay ningún orden almacenado:
inventarlo significa crear un campo por diagrama o una lista, y persistirla.

En la fila **se ven y se pueden quitar**, que es lo que la orden pide de ellos.

### AJ1-e · `vab-bicuspide.md` quedó a 1,1 KB del techo

Medido **antes** de escribirle el puntero: 33,2 KB; después, **33,9**. El techo que este
repositorio se fijó es 35 KB. **La próxima tanda que lo toque tiene que partirlo**, igual que
hicieron la C2 con `informe-pdf-excel.md` y la COR con `vd-derecho.md`.

### AJ1-f · El resumen de la orejuela se calcula aunque no se use

`oaiResumenPDF()` corre una vez por generación de PDF, dentro del bloque de imágenes, aunque el
esquema no esté incluido o no haya ninguna imagen. Es barato —lee ocho campos— y se calcula
fuera del bucle, que es lo que importaba. Se anota por si alguna vez ese bloque se mueve a un
lugar donde el costo sí cuente.

### AJ1-g · La ✕ de una captura vale para la sesión, no para el estudio guardado

`noPdf` es una propiedad del slot y **no viaja al disco**. Las dos puertas que lo impiden son
allowlists explícitas, leídas en el código:

- `CeiboImg.guardar` escribe `{dataURL, ampliada, calidad, star, nota, esquema, videoId,
  videoNombre}` y nada más;
- `imgRestaurar` reconstruye cada slot con esa misma lista.

O sea que el médico que quita una captura del PDF, **guarda el estudio y lo vuelve a abrir**, se
la encuentra incluida otra vez. La imagen **no se pierde** —se sigue guardando, que es lo que la
orden pide—; lo que no sobrevive es la exclusión.

**No se tocó**, y el motivo es la regla 4 de la orden: si una decisión no está en la orden, se
para. La orden dice que la ✕ quita del PDF y no borra la imagen, y que se puede volver a
incluir; **no dice que la exclusión tenga que sobrevivir a cerrar el estudio**. Hacerla durar es
agregar `noPdf` a esas dos allowlists —dos palabras—, pero es cambiar lo que se escribe en el
registro persistido de cada estudio con imágenes, y eso es decisión de Maicol.

Es la misma clase de salvedad que `COR-e` declara para «Incluir en el PDF» con Config apagado.

---

# TANDA AORTA-2 (2026-10-30) — lo declarado

## AO2-a · INVENTARIO de la válvula aórtica TRICÚSPIDE (punto 3c) — sólo reportado

La orden pide inventariar y **no implementar nada**. Esto es el inventario.

**Qué trae hoy la aplicación para la dilatación aórtica con válvula tricúspide.** No hay un módulo
de «aorta tricúspide»: lo que hay es la **aortopatía hereditaria no sindrómica** (`marfan_sindrome`
= `ehat` u `otro`), cuyos umbrales la propia aplicación declara tomados de la Tabla 38 —
`MARFAN_FTE.ehat` y `MARFAN_FTE.otro` dicen «ESC 2024, Tabla 38 · folio 80» (folio de la edición
SEC; el de la inglesa es **3611**)— y cuya lista de factores publica `MARFAN_FR_TXT.ehat`:
«crecimiento de 3 mm o más al año, hipertensión resistente, estatura menor de 1,69 m, fenotipo de
raíz aórtica, longitud aórtica mayor de 11 cm, edad menor de 50 años, deseo de embarazo o
coartación aórtica».

**Qué DIFIERE de la Tabla 38, leída en imagen** (hoja 74, folio 3611; la transcripción completa
está en `docs/fuentes/FUENTES.md` → «La tanda AORTA-2» § 3):

| La Tabla 38 publica | Qué hace hoy la aplicación |
|---|---|
| **Ocho** recomendaciones | Publica **un umbral por síndrome** y la lista de factores; no publica las ocho |
| **≥ 55 mm** — I·B | Lo aplica como umbral del `ehat` |
| Reemplazo de raíz con **preservación valvular** — I·B | **No figura** en ninguna superficie |
| **AVK de por vida** con Bentall mecánico — I·B | **No figura** |
| Ascendente tubular con riesgo bajo, **> 52 mm** — IIa·B | **No figura** |
| Cirugía de la válvula con **≥ 45 mm, «otherwise» ≥ 50 mm** — IIa·B | **No figura**; y la fila es **ambigua en el original** |
| **Aspirina** 75-100 mg/día 3 meses tras cirugía con preservación valvular — IIa·C | **No figura** |
| Cirugía cardíaca no valvular aórtica con **≥ 50 mm** — IIa·C | **No figura** |
| **≥ 50 mm** con riesgo bajo y alguno de **ocho** factores — IIb·B | La lista de factores SÍ está, pero **sin su umbral, sin su clase y sin su nivel** |

**La diferencia que más importa: el 50 mm aparece en TRES filas con condiciones distintas** —la
cirugía valvular concomitante, la cirugía cardíaca no valvular y los ocho factores—, así que no
puede mostrarse como un umbral único. Hoy la aplicación no lo muestra en ninguna de las tres.

**Y la lista de factores de la Tabla 38 NO es la de la Tabla 68**, aunque se parezcan: la 38 tiene
«fenotipo de raíz» y «talla baja < 1,69 m» a secas, y **no** tiene historia familiar de síndrome
aórtico agudo ni cirugía cardíaca concomitante; la 68 tiene esas dos, no tiene el fenotipo de raíz
y define la talla como «entre 1,50 y 1,69 m con cociente área/talla > 13 cm²/m». `MARFAN_FR_TXT`
publica hoy la de la **38**, que es la correcta para el `ehat`.

**No se tocó nada.** Implementar las ocho recomendaciones es contenido clínico nuevo sobre el
papel firmado y es decisión de Maicol.

## AO2-b · La línea INTEGRADA de la coartación en el EN SUMA publica clase y guía

Con la sección **integrada al informe**, `ccSumaLinea('coa')` publica su mapa `DX`, que incluye
«indicación de intervención Clase I ESC 2020», «indicación a considerar Clase IIa ESC 2020» y
«indicación posible Clase IIb ESC 2020». **Medido** en el árbol del commit 1 y en el de cierre:
con pico-pico 25 mmHg e hipertensión confirmada, el EN SUMA dice «Coartación de aorta nativa —
istmo 8 mm — gradiente medio 25 mmHg — **indicación de intervención Clase I ESC 2020**».

Eso choca con el encabezado de esta orden —«el informe y el EN SUMA describen; clase, nivel,
umbral y tabla viven en la Evidencia»—, pero **cambiarlo no está en los puntos de la orden**, y la
orden además protege expresamente el texto de una de esas claves («Coartación de aorta
post-cirugía — en seguimiento — datos incompletos para clasificarla»). Por la regla 4, **se paró y
se reporta**.

La línea que esta tanda SÍ agregó —la de la sección **sin** integrar— es descriptiva: sin clase,
sin nivel y sin tabla. Así que hoy el EN SUMA dice una cosa u otra según el interruptor, y eso
está declarado.

## AO2-c · La conclusión de la coartación lleva clase, nivel, tabla y folio al informe

`coaConclusion().txt` arma frases como «…con indicación de intervención **Clase I · Nivel C (ESC
2024, Tabla 69 · folio 121)**…», y ese texto llega al **cuerpo del informe** por el bloque de
coartación de `generarInforme` (gateado por `coart_incluir_chk`). Es la misma clase de cosa que
`AO2-b`, un nivel más arriba: el papel firmado llevando una cita y una clase.

**No se tocó**, por el mismo motivo, y es la frontera más grande que esta tanda deja abierta.

## AO2-d · Un segmento «sin clasificar» no bloquea la negación global del EN SUMA

Medido en los dos árboles, idéntico: con la unión sinotubular en 38 mm y **sin sexo cargado**, la
cápsula dice «No se puede clasificar sin el sexo», el cuerpo del informe dice «Aorta torácica:
Unión sinotubular 38 mm.» y el **EN SUMA dice «Estudio sin alteraciones estructurales ni
funcionales significativas.»**

O sea que el resumen afirma normalidad sobre un segmento que la aplicación se negó expresamente a
clasificar. Es **preexistente** —la raíz hace lo mismo desde el G-4, verificado en HEAD— y es la
misma clase de defecto que el punto 2b(ii) cierra para la bicúspide y la coartación. La orden no
lo nombra, así que **se reporta**. El arreglo sería marcar el párrafo (`ccMarcarParrafo`) cuando
hay segmentos en la franja ambigua, que haría que el resumen dijera «Sin otras alteraciones… — ver
los hallazgos descritos en el cuerpo del informe».

## AO2-e · Lo contestado en el panel sobre los nueve factores no viaja con el estudio

Es el **costo declarado del punto 3b**, y la orden lo anticipa. El mecanismo que la Evidencia usa
para sus preguntas clínicas (`_indClin`) es **efímero a propósito**: su propio comentario explica
que no puede ser un campo del formulario porque `guardarInforme` barrería esas respuestas al
Excel, al backup y al informe firmado de cada estudio.

Entonces: un factor contestado en el panel vale para la sesión. Lo que **sí** persiste es lo que
un estudio viejo ya tenga en `vab_fr_*`, y la Evidencia lo lee con prioridad (`_indOrigen`).
Hacerlo persistir exigiría escribir desde el panel al campo guardado —un mecanismo que la
Evidencia no tiene— o un campo nuevo, que la orden prohíbe. **Se paró y se reporta con su costo**,
que es lo que el punto 3b pide.

## AO2-f · `vabFrChk` y `vabFrChkSync` quedaron sin elemento que tocar

Las seis casillas `vabchk-*` salieron de la pantalla, así que esas dos funciones recorren el mapa
y no encuentran nada. **No se borraron**: `vabSync` y `limpiarCampos` las llaman, y retirarlas
obliga a cambiarles la forma a esas dos. `VAB_FR_CHK` **sí** sigue haciendo falta —es la lista de
los seis campos guardados y de ahí los vacía «Nuevo estudio»—. Es código muerto declarado, de tres
líneas, y la próxima tanda que toque esa zona puede retirarlo.

## AO2-g · Dos mapas quedaron a menos de 1 KB del techo

Medidos al cerrar: **`docs/mapa/congenitas-otros.md` en 34,5 KB** y
**`docs/mapa/panel-evidencia.md` en 34,1 KB**. Los dos recibieron un puntero de esta tanda. **La
próxima tanda que necesite escribir en cualquiera de los dos tiene que partirlo primero**, que es
la regla de `ecosmart/CLAUDE.md` y lo que esta tanda hizo con `vab-bicuspide.md` (33,9 → 18,3 KB,
con las secciones 10 y 11 a `docs/mapa/vab-cuspides-dibujos.md`).

## Cerrado por esta tanda

- **`AJ4-c`** — «la Figura 5 publica límites superiores de normalidad POR SEXO para todos los
  tramos y la app no los aplica». Hoy los aplica en los **dos** segmentos con correspondencia
  directa (unión sinotubular y aorta ascendente); los otros dos no la tienen —la figura los parte
  en dos tramos cada uno— y conservan su corte propio, que la pantalla **declara** con el chip
  gris. La ficha `AOR-001` quedó con esos dos y lo dice; la `AOR-005` nace verificada.
- **`AJ1-e`** — «`vab-bicuspide.md` quedó en 33,9 KB, a 1,1 KB del techo: la próxima tanda que lo
  toque tiene que partirlo». Esta tanda tenía que escribirle un puntero y lo **partió antes** de
  escribirlo: las secciones 10 y 11 salieron a `docs/mapa/vab-cuspides-dibujos.md` (16,9 KB) y el
  mapa volvió a **18,3 KB**, con un puntero de seis líneas. Cero líneas perdidas, movidas byte por
  byte.

---

# TANDA D2 (2026-10-30) — lo declarado

## D2-a · La casilla de antecedente coronario junta tres filas de la Tabla 4, y con anti-VEGF no valen lo mismo

**Qué pasa.** `hfaicos_cv_coron` cubre «Infarto, angioplastia o cirugía coronaria, angina estable
o valvulopatía severa», que en la Tabla 4 son **tres filas separadas**: «Severe VHD», «MI or PCI
or CABG» y «Stable angina».

| Columna | Severe VHD | MI/PCI/CABG | Stable angina | Lo que aplica la app |
|---|---|---|---|---|
| antraciclinas | H | H | H | H — las tres coinciden |
| anti-HER2 | H | H | H | H — las tres coinciden |
| **anti-VEGF** | **–** | **VH** | **VH** | **VH** (el mayor) |
| BCR-ABL | – | – | – | – |
| mieloma múltiple | – | – | – | – |
| RAF/MEK | H | H | H | H |

**Qué se hizo.** Se aplica el **mayor** de las tres, que es el lado seguro y el mismo criterio que
la nota al pie g ya usaba para la antraciclina concurrente. **El precio, medido:** con un
anti-VEGF, un paciente cuyo único antecedente sea una **valvulopatía severa** —a la que esa
columna no le da peso— se clasifica **muy alto**, igual que uno con un infarto.

**Qué haría falta.** Partir la casilla en tres, como la tanda D partió la de antecedente CV. Eso
agrega **dos campos guardados** (el censo pasaría de 946 a 948), y esta tanda tiene prohibido
agregar ninguno. Es decisión de Maicol.

## D2-b · La tabla B de HFA-ICOS no tiene equivalente en la Tabla 4

**Qué pasa.** «B · Riesgo por fármaco» agrupa fármacos en cuatro bandas (muy alto, alto, medio,
bajo). La Tabla 4 **no hace eso**: ahí el fármaco es una **columna**, nunca un piso ni una banda.

**Qué se hizo.** No se tocó, que es lo que la orden pide para una tabla sin equivalente. Lo que
cambió es el aviso de arriba, que ahora dice que las tablas A y C son las que la app aplica y que
**las bandas de la B no entran en la clasificación**.

**Qué haría falta.** Decidir entre retirarla, dejarla como está con su aviso, o reemplazarla por
la fila de encabezados de la Tabla 4. Es contenido clínico y la orden no la nombra.

## D2-c · «Radioterapia toraxica» sigue con la x, y corregirlo sigue cambiando el Excel

**Es el pendiente D-d, que esta tanda vuelve a declarar sin resolver.** La etiqueta de la opción
`radioterapia` del selector `co_farmaco` dice «Radioterapia **toraxica**»: le falta la tilde y
tiene **x** donde va **c**. El mismo texto es lo que la columna «Fármaco cardiotóxico» del Excel
publica, así que cambiarlo cambia un **valor** del Excel y el round-trip de reimportación.

⚠️ **Y AHORA ES MÁS VISIBLE QUE ANTES**, porque las dos opciones que esta tanda agregó
—«Mieloma múltiple (inhibidores de proteasoma, IMiD)» e «Inhibidores RAF/MEK»— están bien
escritas y quedan al lado. Sigue necesitando orden expresa.

## D2-d · La Central Illustration de Boldrini sigue sin estar en la copia de la biblioteca

**Es el pendiente D-e, sin cambios.** La página de figuras del manuscrito trae **sólo las
leyendas**: ninguna página del PDF contiene una imagen. La leyenda de la Central Illustration dice
que propone cortes para los **dos** scores, con el IWT en su panel inferior, y eso no se puede
verificar sin la versión publicada o una copia con las figuras. Esta tanda no lo tocó —no es
cardio-oncología sino el score de amiloidosis— y lo repite porque la orden lo pide.

## D2-e · El globo del monitoreo scrollea adentro, igual que el de la calculadora

**Qué pasa.** La tarjeta de `co-monitoreo` sale en **620 × 476 px**, dentro de la pantalla y sin
cortarse a lo ancho, pero sus **2989 caracteres** no entran en ese alto: lo que sobra scrollea
adentro (`overflow:auto`, no se pierde nada).

**Por qué no se acortó.** Ahí viven los dos calendarios completos por riesgo con sus clases y las
dos fuentes con su folio, que es exactamente lo que la regla R2 manda sacar de la línea visible.
Acortarlo costaría una de esas clases.

**Qué haría falta.** Lo mismo que **D-i** propone para `co-riesgo-basal`: una ficha en Referencias
para cardio-oncología resolvería las dos cosas a la vez, y les daría el botón «Ver referencia»
que hoy ninguna de las dos tiene —el límite que **D-c** y TC-502 declaran—.

## D2-f · Las filas de monitoreo viven en TRES tablas, y nada las ata

**Qué pasa.** El monitoreo de cada clase farmacológica está escrito en tres lugares de la
sub-pestaña «Referencia rápida»: la columna «Monitoreo recomendado» de **Cardiotoxicidad**, la
tabla por clase de **Seguimiento** y la tabla de **Clases**. Las tres son HTML estático y nada
impide que vuelvan a divergir: esta tanda las encontró diciendo **tres cosas distintas** de
inmunoterapia y de anti-VEGF, y la intro de «Seguimiento» afirmaba ser «la misma columna» de la
primera cuando no lo era.

**Qué se hizo.** Se corrigieron las tres al mismo texto y la intro dejó de afirmarlo.

**Qué haría falta.** Un dueño único —un registro de clase → texto, dibujado como la matriz de la
Tabla 4— para que no puedan discrepar. Es un cambio de mecanismo que la orden no pide.

## D2-g · La `_hfaicosAlcance` quedó con un solo texto y su parámetro sin usar

**Qué pasa.** La función recibe `farmaco` y ya no lo mira: los tres fármacos que llegan al puntaje
propio son exactamente los que no tienen columna en la tabla, así que la frase es la misma para
los tres. Se dejó el parámetro porque el día que vuelva a haber un fármaco con columna sin aplicar
—o uno al que la guía sí defina de otra forma— la rama vuelve, y el comentario lo dice.

**Qué haría falta.** Nada, si no vuelve a pasar. Si se decide que nunca volverá, la función se
puede reemplazar por una constante.

---

## Tanda AJUSTES-2 (2026-10-31)

### AJ2-a · `esqClave` y `esqNombre` no se persisten, y por eso hubo que adoptar el huérfano
**Qué pasa.** Al reabrir un estudio guardado, el slot del esquema vuelve con `esquema:true` pero
**sin su clave**: ninguna de las dos allowlists de IndexedDB —`CeiboImg.guardar` e
`imgRestaurar`— la incluye. Esa es la causa raíz del «a veces sale y a veces no» que el médico
reportó: el botón decía «📄 Incluir en el PDF» sobre un estudio donde el dibujo ya estaba, y al
tocarlo el PDF imprimía el dibujo **dos veces** (caso L de la matriz 3a).
**Qué se hizo.** El commit 3 lo cierra **sin persistir nada**: `esqSlotIdx` adopta un esquema
huérfano cuando hay **exactamente uno**.
**Lo que falta, y su costo.** Persistir `esqClave` y `esqNombre` serían **dos propiedades más** en
los registros de imagen, y la orden autoriza **una** —la que el commit 2 usó para `noPdf`—. Son
~40 bytes por esquema. Con ellas, la adopción se podría retirar y el caso de **dos o más**
esquemas en `imgSlots` quedaría cubierto; hoy, con dos huérfanos, no se adopta ninguno y el botón
vuelve a mentir (es lo que mide TC-557 (C2) como control negativo). Hoy **sólo la orejuela** entra
a `imgSlots`, así que el caso no se da.

### AJ2-b · `congenitas-otros.md` está a 500 bytes del techo y no se tocó
Mide **34.540 bytes**; el techo que este repo se fijó es ~35 KB. La coartación vive ahí y esta
tanda la movió, pero escribirle el puntero lo cruzaría. **El mapa de la tanda salió a archivo
propio** (`docs/mapa/aj2-coartacion-diagramas.md`, 21,1 KB) y el puntero se escribió en
`ao2-segmentos-bicuspide.md` y en la tabla de `CLAUDE.md`. **La próxima tanda que necesite
escribir en `congenitas-otros.md` tiene que partirlo primero.** `valvulas.md` (33,9 KB) sigue
esperando lo mismo.

### AJ2-c · Las TRES menciones del papel que el barrido 6a listó y NO tocó
La orden dice retirar sólo las recomendaciones y **listar las demás para que las decida el
médico**. Son éstas, con su módulo y su superficie:

| frase | tipo | superficies | módulo |
|---|---|---|---|
| «Graduación de Beaubien-Souligny et al., Ultrasound J 2020;12(1):16.» | cita bibliográfica | informe, PDF | VExUS |
| «Incompleto — ASE 2025» | cita de guía | PPT | función diastólica |
| «Los patrones venosos también se alteran, sin que haya congestión, en fibrilación auricular y en ventilación mecánica.» | salvedad descriptiva | informe, PDF | VExUS |

Y dos **avisos de registro**, que dicen que falta un dato para poder graduar y no qué hacer con el
paciente: «Completar cociente E/A para determinar grado» y «No se puede estimar la presión de
llenado del VI con los datos disponibles; completar los parámetros del segundo paso (Vol AI,
LARS, S/D o TRIV)». Más el «— en seguimiento» de la coartación operada, que describe el estado del
paciente y que la orden deja fuera del barrido.
**Si el médico quiere que salgan**, la primera vive en `VEXUS_SALVEDAD`, la segunda en el badge
que arma `R.badgeTxt = 'Incompleto — ASE 2025'` y la tercera en la misma constante que la primera.

### AJ2-d · El rótulo «Conclusión según guías» del PPT es de las ONCE secciones
La fila del PPT de congénitas se llama así para las doce entradas de `CC_PPT`. Esta tanda cambió
**sólo** lo que publica la coartación; el **rótulo** sigue igual porque cambiarlo movería las once
restantes, que están fuera del alcance de la orden. Hoy, en la coartación, ese rótulo encabeza una
frase que no nombra ninguna guía.

### AJ2-e · Las otras once secciones de `CC_PPT` siguen publicando su `txt` con la guía
`dapConclusion`, `vapConclusion`, `fopConclusion`, `vabConclusion`, `mchConclusion`,
`ebsConclusion`, `tdfConclusion`, `tgaConclusion`, `mcaConclusion` y las dos de shunt. La orden
acota las diferencias a los estudios con coartación cargada, así que no se tocaron. Aplicarles el
mismo principio del médico es una orden propia: son once textos clínicos.

### AJ2-f · El punto 2f no cambia los estudios ya guardados, y se declara qué sí cambia
`imgGuardadoActivo()` sólo **lee**: no migra ni escribe nada. Lo que cambia es lo que pasa con el
**próximo** estudio que se guarde en un navegador que nunca tocó el control: sus imágenes y sus
diagramas incluidos ahora **sí** se guardan. Un médico que prefiera lo contrario tiene que
apagarlo en ⚙️ Config, y ese valor se respeta. **Ningún estudio existente se toca.**

### AJ2-g · El `catch` de `imgGuardadoActivo` sigue devolviendo `false`
Es el único caso en que el valor por omisión **no** aplica, y es deliberado: si `localStorage` no
se puede leer tampoco se va a poder escribir la preferencia, y prometer que se guarda sería la
promesa que el informe no cumple. Si alguna vez se quiere que el modo privado también guarde, hay
que decidir qué hacer con la preferencia, no sólo con el valor.

---

## Tanda IMÁGENES-3 (2026-10-31)

### IMG3-a · El bucle del video en el PPT no se puede marcar con la librería que la app tiene
Verificado por dos caminos: el XML de un paquete generado de verdad **no tiene** `<p:timing>`,
ni `repeatCount`, ni `cMediaNode`, ni `<p:video>`; y los **477.529 bytes** del bundle de
PptxGenJS 3.12.0 tienen **cero** apariciones de `repeatCount`, `p:timing`, `cMediaNode` y de
cualquier `loop*`. «Repetir hasta detener» vive en el árbol de tiempos de la diapositiva.
**Lo que haría falta**, para quien lo retome: un `<p:timing>` en la diapositiva con un
`<p:video><p:cMediaNode vol="80000"><p:cTn id="N" fill="hold" display="0"
repeatCount="indefinite">…</p:cTn><p:tgtEl><p:spTgt spid="3"/></p:tgtEl></p:cMediaNode></p:video>`,
inyectado post-procesando el zip con el JSZip que `_pptxDescargarSaneado` ya usa. El `spid` es
el `id` del `<p:cNvPr>` del `<p:pic>` que lleva el `videoFile` (medido: 3).
**Por qué NO se hizo**: no se puede verificar sin PowerPoint, y este repositorio ya documenta
que una parte OOXML mal formada hace que PowerPoint pida reparar **y que al reparar borre la
diapositiva completa**. El video sigue incrustado como estaba.

### IMG3-b · Una captura AMPLIADA pasó de media página a una franja
La maqueta vieja repartía las ampliadas de a dos por página; el motor de tercios le da una
franja entera, o sea un tercio de hoja. La orden dice «de a dos por franja» y no menciona la
marca de ampliada; mapearla a franja completa es la traducción mínima de lo que significaba.
**Salida**: decidir si una ampliada merece media hoja —que serían franja y media, lo que el
motor no modela— o si un tercio alcanza.

### IMG3-c · Un estudio con dos diagramas y nada más gana una hoja
Medido: con el jet post-TAVI y la bicúspide, HEAD los dibujaba inline en la hoja del cuerpo
(1 hoja) y hoy los diagramas tienen hoja propia (2). Es lo que R-1 pide y se paga una vez por
estudio; las escenas con más diagramas **bajan** de hojas. **Salida**: si molesta, la regla
sería «si los diagramas entran en lo que queda de la última hoja del cuerpo, no abrir hoja»,
que rompe R-1.

### IMG3-d · La demo de tercios no lleva el sufijo `_aprobado`
La orden la nombra `demo_pdf_diagramas_tercios_aprobado.html` y el archivo es
`docs/3d/demo_pdf_diagramas_tercios.html`. Es el único de los tres así. Su contenido coincide
con lo que la orden describe —marcadores de lugar, R-1 a R-6— y su preset «Mi estudio de
prueba» da las dos hojas que la orden espera, así que se usó como referencia.
**Salida**: renombrarlo, o dejar escrito que ese es su nombre.

### IMG3-e · «Hipoquinesia: cara (undefined)» en la línea de contractilidad
Preexistente, no de esta tanda: `contrGetLineasInforme()` arma «Hipoquinesia: cara
(undefined).» cuando el territorio no tiene nombre. Se ve en el papel firmado, y el motor de
tercios lo hace más visible porque ahora esa línea va debajo del dibujo. **No se tocó**: es
contenido clínico. Reproducible pintando `contrEstado['s1']=1`.

### IMG3-f · El registro de Evidencia sigue citando el folio 120 de la SEC
`IND_REFS.f44` dice «ESC 2024, Figura 44 · folio 120», que es la edición en español. La lectura
en imagen que la orden trae es la inglesa, donde la Figura 44 está en la hoja 112 y su folio
impreso es el **3649**. El ⓘ de la coartación cita **los dos con su edición**; el registro no
se movió, porque cambiarlo toca la numeración del panel. **Salida**: decidir cuál edición es la
de referencia del registro.

### IMG3-g · El PPT de congénitas deja la miocardiopatía hipertrófica sin podar
Su conclusión entrelaza la recomendación con el recuento —«AHA/ACC 2020: 2 factores mayores de
5 — desfibrilador razonable (3 sin evaluar)»— y podarla perdía el 3, así que la guarda de
«ningún número medido desaparece» la deja entera. Su diapositiva sigue nombrando la AHA/ACC y
su clase. **Salida**: que el médico decida el texto descriptivo de esa sección; la app no lo
puede derivar sin escribir contenido clínico nuevo.

### IMG3-h · LA PARTE D NO SE HIZO — el diagrama 3D de la TGA
Ninguna línea de la app se tocó por ella. El **inventario 10a sí está hecho** y es la mitad del
trabajo:

| lo que la demo necesita | lo que la app tiene |
|---|---|
| anatomía: `norm` / `dtga` / `ltga` | `tga_tipo` con tres valores: `cctga`, `mustard`, `senning` |
| cirugía: `none` / `mus` / `jat` / `ras` | **no existe**: el tipo y la cirugía van en el mismo campo |
| comunicaciones: CIA o FOP, CIV, DAP | `tga_civ_residual`; la CIA y el DAP viven en sus módulos |
| frecuencia cardíaca | existe |
| «ver por dentro», nombres, pausa, vista de frente | controles de pantalla, sin dato que guardar |

**Lo alcanzable desde los datos de la app son DOS de los seis escenarios de la demo**:
`cctga` → anatomía L-TGA sin cirugía, y `mustard`/`senning` → d-TGA con switch auricular. El
corazón normal, la d-TGA sin cirugía con sus tres comunicaciones, el switch arterial (Jatene) y
el Rastelli **no se pueden representar sin campos guardados nuevos**, que esta orden prohíbe.
Otras dos cosas para quien lo retome: la librería sería `three.js r128` de cdnjs, que exige un
`integrity` como los otros cuatro scripts del encabezado; y **capturar un canvas WebGL para el
PDF exige `preserveDrawingBuffer:true`**, que la demo no pone, así que portarla «sin
reinterpretar» y además capturarla pide una decisión que esta orden no toma.

### IMG3-i · El rótulo de la diastólica se podó en sus NUEVE etiquetas, no sólo en «Incompleto»
La orden nombra «Incompleto — ASE 2025». Medido: el mismo span publica además «DD Grado I/II/III
— ASE 2025», «DD — Presión elevada (ASE 2025)», «Indeterminado», «Datos insuficientes»,
«Función diastólica normal» y la variante de BSE 2024, y todas llegan al PPT por la misma fila.
Sacarlo de una sola dejaba el mismo PPT citando la guía en ocho de las nueve escenas, así que
se sacó en el único punto por el que las nueve pasan al papel. **Salida**: confirmar que es lo
que el médico quería, o acotarlo a la etiqueta nombrada.

### IMG3-j · El «qué mirar en la ecografía» de la demo de la TGA, sin verificar
La demo trae, por escenario, un párrafo de «qué mirar» (raíz neoaórtica, estenosis supravalvular
pulmonar, función del VD sistémico, gradiente del conducto…). La orden dice que es **de ejemplo
y NO se implementa**, y que quede anotado para verificarlo contra la guía. Queda anotado: está
en `docs/3d/demo_tga_3d_esquema_aprobado.html`, en el objeto `INFO`, y ninguna de sus frases se
copió a la app.

### Cierra AJ2-e (en parte)
Las once secciones de `CC_PPT` dejaron de publicar la guía en el PPT, **menos la
miocardiopatía hipertrófica** → IMG3-g.

---

# TANDA TGA (2026-10-31) — el diagrama 3D de la transposición

### TGA-a · Jatene y Rastelli, PARADOS: el informe firmado afirma lo contrario para ellos
La autorización del médico da **cuatro** valores de cirugía; esta tanda publica **dos**
(`ninguna`, `auricular`). Faltan «switch arterial (Jatene)» y «Rastelli».

**Por qué se paró.** En los dos, el ventrículo sistémico es el **izquierdo**. `tgaConclusion` abre
el informe **firmado** con «el ventrículo derecho es el ventrículo sistémico» y sigue con tres
oraciones más que dependen de eso:
- «Función del ventrículo **derecho** sistémico …»
- «Diámetro basal del ventrículo sistémico …» (lee `vd_bas`)
- «Insuficiencia de la válvula auriculoventricular sistémica (**tricúspide**) …»

Publicar Jatene o Rastelli exigía reescribir esas cuatro frases del informe, que es decisión del
médico. Lo mismo vale para la **conducta** de la cascada —«el deterioro del ventrículo derecho
sistémico es progresivo y es la principal causa de muerte en esta población»—, que es verdadera
para la ccTGA y el switch auricular y no para el switch arterial.

**Y hay dos textos de PANTALLA que esta tanda tampoco tocó y que ya quedan inexactos:**
1. El **título de la sección** dice «TGA — Transposición de grandes arterias **corregida**». Con
   `tga_tipo = dtga` + «sin cirugía» —una d-TGA no operada— la palabra «corregida» no corresponde.
2. El **párrafo de encabezado** de la sección afirma «el ventrículo derecho es el ventrículo
   sistémico, y su deterioro progresivo es inevitable». Es verdadero para ccTGA, para el switch
   auricular y para la d-TGA no operada —o sea para **todo lo que esta tanda publica**— y sería
   falso el día que entren Jatene o Rastelli.

**Salida.** Decidir el wording de las cuatro frases del informe, del título y del párrafo para un
ventrículo sistémico izquierdo; después, agregar los dos valores a `TGA_CIR_VAL`, `TGA_CIR_LBL`,
`TGA_CIR_XLS` y `LAB_XLS_VOCAB.tga_cirugia`, y las dos ramas de `tga3dEscena` ya portadas de la
demo (`jat` y `ras`), cuya geometría está **medida y es idéntica a la demo** en
`scripts/_probe_tga2demo.mjs` — las 10 diferencias de ese barrido son exactamente estos dos
escenarios.

### TGA-b · El «qué mirar en la ecografía» de la demo, sin verificar (cierra en parte IMG3-j)
Decisión (b) del médico: es de ejemplo y **no se implementa**. Lo que la app publica en pantalla es
la **descripción anatómica** de cada escenario, portada de la demo; las oraciones «Qué mirar: …»
—raíz neoaórtica, estenosis supravalvular pulmonar, función del VD sistémico, gradiente del
conducto, CIV residual— **no se copiaron**. Están en `docs/3d/demo_tga_3d_esquema_aprobado.html`,
objeto `INFO`, claves `mus`, `jat` y `ras`.

**Y la descripción anatómica que SÍ se copió tampoco está verificada contra una guía**: sale de la
demo, que es material de referencia del médico y no un documento leído en texto completo. Por eso
el globo ⓘ del diagrama **no lleva una sola cita** y explica sólo de dónde saca el dibujo cada
cosa, que es verificable en el código. **Salida**: verificar las dos cosas contra las guías de
congénitas (Cowork) y, si corresponde, citarlas en el ⓘ.

### TGA-c · La Parte B PARADA: la recomendación de la MCH no vive fuera del papel
El commit 4 pedía separar, en el PPT de congénitas, el **recuento** de la **recomendación** de la
miocardiopatía hipertrófica, retirando la segunda del texto visible — «verificalo antes de retirar;
si no está en la Evidencia o el ⓘ con su fuente, PARÁ y reportá».

**Se verificó y no está.** Censo con control positivo:

| dónde | menciones de «desfibrilador» |
|---|---|
| el papel (`mchConclusion().txt` + `.resumen`) | **2** ← control positivo del censo |
| la Evidencia de la MCH (`_indMCH()`, despierta) | **0** — es toda sobre terapia de reducción septal, Clase I · B |
| los **74** globos ⓘ (registro `VINFO`) | **0** |
| las **62** fichas de Referencias | **0** |

El texto exacto es `AHA/ACC 2020: N factores mayores de 5 — desfibrilador razonable (Clase IIa)
(M sin evaluar)`, y el podador lo deja **entero** porque retirar el segmento perdería el recuento
`M`, que es la guarda «ningún número medido puede desaparecer».

**Retirarlo del PPT lo perdería de la aplicación entera**, y escribirlo en la Evidencia sería
contenido clínico nuevo, que la orden prohíbe. **Salida**: escribir la recomendación de la AHA/ACC
2020 en la Evidencia de la MCH con su tabla y su folio —leídos en texto completo— y recién después
podar el PPT. `TC-563` bloque C es el guardián: el día que entre, sus condiciones se ponen rojas.

### TGA-d · Un defecto del podador del PPT, preexistente y no tocado
Medido sobre `_ccPptPodar` con una escena de MCH que **sí** se poda: el resultado queda con
**dos puntos colgados** —«… (detalle en el cuerpo del informe)**.:** consta realce tardío …»— porque
los segmentos que nombran una guía se descartan y su separador (`:`) sobrevive pegado al anterior.
Es de IMÁGENES-3 y no de esta tanda; afecta a toda sección cuyo texto empiece con el nombre de una
guía seguido de dos puntos. **Salida**: limpiar el separador huérfano en el paso 2 del podador.

### TGA-e · PptxGenJS 3.12.0 emite dos shapes con el mismo `id` en la misma diapositiva
Medido sobre el paquete que genera de verdad: una diapositiva con dos cuadros de texto y un video
sale con `<p:cNvPr id="3">` **dos veces** —el segundo texto y el video—. Un `spid` duplicado es
ambiguo para cualquier árbol de tiempo que apunte a un shape. El experimento de abajo le pone al
video un id libre justamente por eso. Es un defecto de la librería, no de la app, y hoy no
molesta porque la app no escribe `p:timing`. **Salida**: tenerlo en cuenta el día que se integre
el bucle.

### TGA-f · El experimento del bucle del video en el PPT (IMG3-a) — listo para abrir
**Fuera del producto. Nada se integró a la app.**

**Archivo para abrir en PowerPoint:**
`/Users/maicoldossantos/Desktop/ceibo-experimento-ppt-bucle/experimento_bucle_video.pptx`
(65.683 bytes, 41 partes, con un MP4 H.264 de 8.689 bytes y 2 segundos adentro).

**Qué hay que mirar al abrirlo**: (1) si PowerPoint pide **reparar** — y si al reparar **borra** la
diapositiva; (2) si el video **se repite solo** hasta que se lo detiene.

**El XML que se escribió**, dentro de `ppt/slides/slide1.xml`, después de `</p:clrMapOvr>`:

```xml
<p:timing><p:tnLst><p:par>
 <p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>
  <p:video><p:cMediaNode vol="80000" showWhenStopped="1">
   <p:cTn id="2" fill="hold" display="0" repeatCount="indefinite">
    <p:stCondLst><p:cond delay="indefinite"/></p:stCondLst>
   </p:cTn>
   <p:tgtEl><p:spTgt spid="10"/></p:tgtEl>
  </p:cMediaNode></p:video>
 </p:childTnLst></p:cTn>
</p:par></p:tnLst></p:timing>
```

**La fuente de cada pieza, leída:**

| pieza | de dónde sale |
|---|---|
| `p:timing` es padre de `p:tnLst` | Microsoft Learn, página de **TimeNodeList**: «Parent Elements: timing (§19.3.1.48); tmpl (§19.5.84)» |
| `p:par` es hijo de `p:tnLst` | la misma página |
| `p:video` es hijo de `childTnLst` / `subTnLst` / `tnLst` | Microsoft Learn, página de **Video** |
| `p:cMediaNode` es el único hijo declarado de `p:video` | la misma página (§19.5.29) |
| `p:cMediaNode` es padre de `p:cTn` | Microsoft Learn, página de **CommonTimeNode**: «Parent Elements: cBhvr (§19.5.22); **cMediaNode (§19.5.29)**; …» |
| `repeatCount` es atributo de `p:cTn` | la misma página: «This attribute describes the number of times the element should repeat, in units of thousandths. The possible values … are defined by the *ST_TLTime* simple type (§19.7.38)» |
| `p:tgtEl` > `p:spTgt spid` apunta al shape del video | el **ejemplo** de la página de Video: «its child spTgt element specifies that the shape which contains the video to be played has a shape ID of 4» |

**⚠️ LO QUE NO ESTÁ VERIFICADO, Y POR ESO ESTO ES UN EXPERIMENTO:**
- **El valor del bucle.** Las páginas de Microsoft Learn **no contienen la palabra «indefinite»**
  ni listan valores literales de `repeatCount`: remiten a `ST_TLTime` (§19.7.38), que **no se pudo
  leer en el texto de ISO/IEC 29500-1**. La reproducción del esquema de **datypic**
  (`http://www.datypic.com/sc/ooxml/t-p_ST_TLTime.html`) lo describe como «Union of:
  `xsd:unsignedInt` | from type `p:ST_TLTimeIndefinite` … Valid value: **indefinite**», y es la
  **única** fuente leída que admite el literal. **No es la norma: es una reproducción de tercero.**
- Los atributos del nodo raíz (`dur`, `restart`, `nodeType`) y del nodo de medio (`vol`,
  `showWhenStopped`, `fill`, `display`) son **valores convencionales elegidos acá**; ninguna de las
  páginas leídas los prescribe para este caso.
- **No se encontró** ninguna página que diga qué escribe la interfaz de PowerPoint para «Repetir
  hasta detener».

**Validación hecha** (la hace el propio script): ZIP coherente (`testzip`), **20 de 20** partes XML
bien formadas, 41 partes, `repeatCount="indefinite"` presente, `spTgt spid="10"`, el MP4 embebido,
y **sin ids de shape duplicados**. ⚠️ La primera versión del XML tenía un `</p:spTgt>` sobrante
tras una etiqueta autocerrada y la validación lo cazó: **19 de 20**.

**Reproducible**: `node scripts/_exp_pptbucle_gen.mjs <dir>` y luego
`python3 scripts/_exp_pptbucle.py <dir>`.

**Si el médico dice que repite y no pide reparar**, el siguiente paso es integrarlo en
`_pptxDescargarSaneado`, que ya post-procesa el paquete con JSZip. **Si pide reparar**, el
experimento que sigue es el mismo XML con `repeatCount` **numérico** (por ejemplo `999000`, que son
999 repeticiones en milésimas), que es el otro miembro de la unión `ST_TLTime`.

### TGA-g · La columna nueva es la última de su BLOQUE, no la última del archivo
La orden pide la columna «al final». `_labOrdenarCols` recorre `LAB_XLS_MAP` en su orden y
**después** reagrupa por bloque, así que con la entrada al final del mapa la columna sale última de
«15 · CARDIOPATÍAS COMPLEJAS» —por el prefijo «TGA» que ese bloque declara— y queda en el **índice
292 de 441**. Las 440 anteriores conservan su encabezado y su orden relativo, medido contra HEAD.
Forzarla al final del archivo exigía un bloque nuevo o un nombre que no matcheara ningún prefijo.
**Salida**: confirmar que así está bien, o decidir cuál de las dos.

### TGA-h · TC-557 es un INTERMITENTE NUEVO, y no es de esta tanda
Apareció rojo en la corrida completa y se caracterizó como manda este repositorio —mismo
directorio, mismos scripts, alternando sólo `index.html`—:

| árbol | corridas | rojas |
|---|---|---|
| HEAD (`c5dc409`) | 9 | **2** |
| el de esta tanda | 6 | **2** |

Siempre la **misma** condición: `(D4) el ⓘ de la fila mide 44x44 y sus CINCO puntos dan el propio
botón`, con el diagnóstico `00000 44x44` — el botón **mide bien** y los cinco puntos dan `null`,
que es la firma de `elementFromPoint` **fuera del viewport**, una trampa que este repositorio ya
documenta para otras sondas.

**No es una regresión**: falla igual en los dos árboles, en la misma proporción. **Salida**: en
`(D4)`, traer el botón a la vista con `scrollIntoView` —y verificar que quedó dentro— antes de
pedir los cinco puntos, que es lo que hacen las sondas de esta tanda. Mientras tanto, sumarlo a la
lista de intermitentes conocidos junto a TC-358, TC-551 y TC-182: **repetir su lote antes de
declararlo**.

---

# TANDA TGA-2 (2026-10-31) — lo declarado

### TGA2-a · Tres campos de la TGA quedan sin redacción neutra, y por eso no se publican con Jatene ni con Rastelli
La orden del 31/10/2026 dice: «los datos cargados con la redacción que el informe ya usa para cada
campo, SIN las oraciones del ventrículo derecho sistémico. Si algún campo cargado no tiene
redacción neutra, PARÁ ese campo y reportalo». Son **tres**:

| Campo | Lo que la sección dice hoy | Por qué no sirve |
|---|---|---|
| `tga_func_vd` | «Función del ventrículo derecho sistémico …» | en Jatene y Rastelli el sistémico es el **izquierdo** |
| `vd_bas` | «Diámetro basal del ventrículo sistémico … mm» | ídem |
| `it_grado` | «Insuficiencia de la válvula auriculoventricular sistémica (tricúspide) …» | ídem |

**Qué se perdió, exactamente**: con esas dos cirugías, el párrafo de la TGA deja de nombrar los
tres. El valor **no se borra** —nada automático escribe en el estudio, y la fila de la función se
esconde sin vaciarla—, y el grado de insuficiencia tricuspídea **sigue saliendo por Válvulas**, que
es su dueño, así que del informe no desaparece. Los otros dos sí dejan de verse en el papel de esos
pacientes.

**Salida**: decidir la redacción neutra de cada uno. Lo más corto sería «Función del ventrículo
derecho», «Diámetro basal del ventrículo derecho» e «Insuficiencia tricuspídea», que son
descripciones y no afirmaciones sobre cuál ventrículo sostiene la circulación — pero eso es
contenido clínico y es decisión del médico.

### TGA2-b · Una frase del párrafo de la sección de la TGA deja de estar en la aplicación
El párrafo de encabezado pasó a ser neutro, y de sus dos oraciones:

- «El **ventrículo derecho es el ventrículo sistémico**, y su deterioro progresivo es inevitable y
  es la principal causa de muerte» → **sigue en la aplicación**: lo dicen `TGA3D_INFO.ltga` y
  `TGA3D_INFO.mus` por escenario, y `tgaConclusion` en el informe de la ccTGA y del switch
  auricular, con la frase completa de «la principal causa de muerte en esta población».
- «La válvula tricúspide de estos pacientes es la auriculoventricular **sistémica**: su
  insuficiencia pesa como pesaría una mitral» → la **primera mitad** sobrevive en el rótulo del
  campo «IT sistémica — grado (de Válvulas)» y en la oración del informe; la **segunda** —«pesa
  como pesaría una mitral»— es la única prosa que deja de estar en algún lado.

**Salida**: decidir si esa comparación vuelve, y dónde. El lugar natural sería el ⓘ de la sección o
su Evidencia, no un párrafo fijo que la afirma para las cuatro anatomías.

### TGA2-c · La poda de la recomendación de desfibrilador del PPT sigue PARADA (IMG3-g)
La Parte C se hizo **a medias por una fuente que no está**, y la regla de la orden es «si no se lee
con certeza o la hoja no coincide: PARÁ y reportá sin cambiar el papel».

| Mitad de la línea | Fuente que cita | ¿Está en la biblioteca? | Qué se hizo |
|---|---|---|---|
| «riesgo … — desfibrilador a considerar (Clase IIa, ESC)» | ESC 2023 de miocardiopatías | **sí** (`ehad194.pdf`) | se transcribió a la Evidencia, sección nueva `_indMCHSCD` |
| «AHA/ACC 2020: N factores mayores de M — desfibrilador razonable (Clase IIa)» | AHA/ACC **2020** de MCH | **no** | nada |

Lo que hay en `11_Miocardiopatias` es la guía de **2024** (Ommen y cols., *Circulation*
2024;149:e1239-e1311, 137 hojas) y su resumen de una página, no la de 2020. La línea del PPT es
**una sola cadena** con las dos mitades: retirar la de la ESC y dejar la de la AHA publicaría media
recomendación, con la mitad que queda sin fuente verificable.

**Salida**: (a) conseguir la guía AHA/ACC 2020 de miocardiopatía hipertrófica y transcribir su
recomendación a la Evidencia, y recién entonces podar la línea entera; o (b) decidir que la app
pasa a citar la AHA/ACC **2024**, que sí está — pero eso cambia lo que la aplicación afirma y es
contenido clínico.

### TGA2-d · La guía AHA/ACC 2025 de congénitas del adulto está en la carpeta 08 y no se usó
Censo de `08_Cardiopatias_congenitas`, que la orden pide reportar:

| Archivo | Qué es |
|---|---|
| `ESC congenitos en ingles 2020.pdf` | **la que se usó**: ESC 2020, edición inglesa, 84 hojas, folio = hoja + 562 |
| `Baumgartner_2020_Cardiopatias_Congenitas.pdf` | la misma guía, traducción |
| `gurvitz-et-al-2025-…-a.pdf` y `…-a-2.pdf` | **ACC/AHA/HRS/ISACHD/SCAI 2025**, *Circulation* 2026;153:e115-e251, 137 hojas. Dos copias de distinto md5 y el mismo contenido |
| `krittanawong-et-al-2025-…guideline-at-a-glance.pdf` | su resumen de 7 páginas |
| `jeaa314.pdf` | documento de posición EACVI/ESC sobre imagen en shunts simples, 13 hojas |
| `ConCoronary_March2020.pdf`, `sachdeva-et-al-2020-…`, `VAB resumen consenso Mx.pdf` | no son guías de manejo de congénitas |

**La ACC/AHA 2025 no se leyó ni se citó.** La orden nombra la ESC 2020 como fuente y pide del resto
«decime qué hay». Sus recomendaciones de CIA, CIV y transposición podrían diferir de las de la ESC,
y publicar las dos exige decidir cuál manda cuando discrepan.
**Salida**: decidir si los paneles de congénitas pasan a publicar también la ACC/AHA 2025 y, si sí,
cómo se presentan las discrepancias.

### TGA2-e · Lo que las recomendaciones piden y la app no tiene campo para medir
Salió de armar las preguntas: cada una de éstas es una condición que una recomendación nombra y que
hoy se **pregunta** porque no hay dónde cargarla. La orden del 31/10 dice expresamente que la raíz
neoaórtica, la estenosis supravalvular pulmonar y el gradiente del conducto **no se agreguen** y se
dejen para más adelante; esta entrada es ese «más adelante», con lo que el trabajo encontró:

| Dato | Para qué recomendación | Guía |
|---|---|---|
| Diámetro de la **raíz neoaórtica** | cirugía con más de 55 mm tras el switch arterial, Clase IIa · C | ESC 2020, folio 620 |
| **Estenosis supravalvular pulmonar** y de ramas, con el porcentaje de reducción | stent de rama, Clase IIa · C | ESC 2020, folio 620 |
| **Gradiente del conducto** ventrículo derecho-arteria pulmonar | las dos filas de la tabla del conducto | ESC 2020, folio 622 |
| **Fracción de eyección del ventrículo sistémico** (número, no graduación) | separa Clase I, IIa y IIb en la ccTGA y en el switch auricular | ESC 2020, folios 619 y 621 |
| **Volumen latido** del ventrículo derecho y del izquierdo | la nota al pie c de la sobrecarga de volumen, en CIA y en CIV | ESC 2020, folios 592 y 595 |
| **Resistencia vascular pulmonar** por cateterismo | las cuatro bandas de CIA y las tres de CIV | ESC 2020, folios 592 y 595 |
| **Volúmenes del ventrículo derecho** por resonancia (VTSVDi, VTDVDi) | uno de los cuatro criterios del conducto | ESC 2020, folio 622 |

**Salida**: decidir cuáles pasan a ser campos guardados. Mientras no lo sean, se contestan en el
panel y no viajan con el estudio.

### TGA2-f · Las respuestas de la Evidencia no sobreviven a cerrar el panel, y eso es el diseño
Las **treinta y ocho** preguntas distintas que esta tanda agrega —19 en la TGA, repartidas en
siete con el switch auricular, cuatro con el arterial, seis con el Rastelli y tres con la ccTGA, de
las que una la comparten dos situaciones; nueve en la CIA; siete en la CIV; tres en la muerte
súbita— viven en `_indClin`, que
`_indClinLimpiar()` vacía al cerrar el panel. Es lo que la orden pide («lo contestado en el panel no
viaja con el estudio») y es el mismo mecanismo de la bicúspide, pero con una diferencia: la
bicúspide tiene además seis campos guardados, así que lo suyo sobrevive si se carga por ahí.

**El precio**: un médico que conteste ocho preguntas de la CIA, cierre el panel y lo vuelva a abrir
las encuentra todas en blanco.
**Salida**: decidir si alguna de las treinta y ocho merece campo propio —ver **TGA2-e**— o si el panel
debería conservarlas mientras dure la sesión del estudio.

### TGA2-g · Dos mapas quedan al techo y uno no se pudo tocar
Medido con `wc -c` antes de escribir, que es la regla:

| Mapa | Tamaño | Qué pasó |
|---|---|---|
| `congenitas-otros.md` | 34.540 B | **no se tocó**, que es lo que la orden pide |
| `panel-evidencia.md` | 34.065 B | recibió un puntero corto |
| `tests.md` | 34.410 B | recibió un puntero corto |

**Salida**: la próxima tanda que necesite escribir en cualquiera de los tres tiene que partirlo
primero.

### TGA2-h · Los botones de respuesta del panel de Evidencia miden 22 px, y el código dice 44
Lo destapó la sonda de dos motores de esta tanda, y **es preexistente**: medido en el árbol de
`61f6968` y en el de hoy, los **24** botones que la Evidencia de la bicúspide ya tenía dan
**22 px de alto** en los dos, con `min-height: 0px` y `padding: 4px 11px`.

El comentario de `_indCtrlHTML` dice textualmente «El alto lo fija la regla táctil global de
`button` (44 px). No se pelea con ella: esto se toca con el dedo en una tablet al lado del
ecógrafo». **La regla global no gana**: algo de la hoja de estilos del panel la pisa con
`min-height: 0`.

**Qué cambió con esta tanda**: nada del mecanismo, pero las preguntas pasan de 24 a **cincuenta**
—se agregan las 26 de la transposición, la CIA, la CIV y la muerte súbita—, así que el mismo
defecto afecta a el doble de controles.

⚠️ **`check_mobile.js` no lo ve**, y por eso no aparece en los 17 hallazgos ALTA: ese barrido abre
las pestañas y los acordeones, pero el panel de Evidencia es un modal que se abre con su botón y
queda fuera de la medición. Los 17 ALTA de 360 px y los 17 de 390 son los de la línea base, uno
por uno.

**Salida**: encontrar qué regla pisa el `min-height` global y decidir si estos botones suben a 44
px —lo que ensancha cada fila del panel— o si se les extiende el área táctil con un `::after`
absoluto, que es el patrón que `.pac-id-mk` y los globos `vinfo-btn-44` ya usan en este archivo.
