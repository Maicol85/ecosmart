# Mapa — Lote post-PR13 (2026-11-28)

Ocho grupos independientes, A a H, cada uno con su commit. Este mapa dice **dónde vive cada cosa
por nombre de función y de constante**, no por línea.

---

## A · El descargo quemado en la captura del mapa de strain

| qué | dónde |
|---|---|
| Las dos líneas del aviso, con **un solo dueño** | `_STR_CAP_L1` y `_STR_CAP_L2`, justo antes del dibujante |
| Quién las **mide y las parte** | `_strBullsDibujar`, en el mismo bloque donde mide la leyenda |
| Quién las **dibuja** | el mismo `_strBullsDibujar`, al final, sólo con `conTitulo` |
| El alto que reservan | `uCap = 16 + 12 × (renglones − 1) + 6`, dentro de `uDebajo` |
| Lo que el dibujante publica | `{ly, lyFin, esc, cx, cy, r, rIn, capL1, capL2}` |

**Por qué ahí y no en `_strBullsCanvas`.** El alto que ocupa el descargo entra en la cuenta del
radio, y esa cuenta la hace el dibujante. Con el texto en un lado y la reserva de alto en el otro,
el día que una palabra cambie el radio se queda viejo y el renglón vuelve a salirse.

**`ly` conserva su significado** —la base del último renglón del diagrama— y `lyFin` es la base
del último renglón dibujado, descargo incluido: así quien mida `ly` no se mueve.

**Medido**: a 300, 640 y 1000 px, **cero** textos fuera del canvas, el descargo **entero** palabra
por palabra, **cero** puntos suspensivos y margen de 4 px o más a los dos lados. Antes, a 640 px
la primera línea medía **850 px contra un canvas de 640**.

### ⚠️ Lo que esto trajo, y que el barrido destapó: el radio depende del descargo

Como el radio **se deriva** de lo que el resto necesita, y el descargo ahora ocupa los renglones
que hagan falta, **ese alto varía con el largo de la etiqueta del resultado**: con la etiqueta
corta sale en tres renglones y con una larga en cuatro, y entre los dos casos el radio cambia un
8 %. Medido: con cuatro renglones, **«Anterolateral» y «Anteroseptal»** —los dos nombres más
largos— ya no entraban en su sector **ni en el tamaño mínimo de letra**, y `_strFontEnSector` los
dibujaba en el mínimo igual, o sea desbordando el polígono. Lo cazó **TC-1069**, que prueba las
cuatro esquinas del rectángulo contra el polígono real.

**Se cerró por dos lados:**

1. **El nombre de la pared se abrevia si no entra** (`_STR_PARED_CORTA`, cuatro entradas), y
   **sólo** si no entra: con el nombre entero entrando, se dibuja entero. **Se abrevia y no se
   baja la letra**, que es la decisión de fondo: bajar el mínimo deja un rótulo que no se lee, que
   es justamente lo que PR13 vino a arreglar.
2. **El lado de la captura pasa de 640 a 760**, así el caso típico dibuja los nombres **enteros** y
   la abreviatura queda como red. 760² son un 41 % más de píxeles, y la captura va al PDF y a la
   biblioteca: lo que se gana es resolución.

Medido después: **cero** rótulos fuera del polígono en 640, 760 y 900 px. Y **TC-1069 pasa a
derivar el lado del propio `_strBullsCanvas`** en vez de escribirlo a mano, así que el día que
cambie otra vez lo sigue solo.

---

## B · El tamaño del texto que se copia

| qué | dónde |
|---|---|
| El dueño único del tamaño | `CW_PT`, hoy **`'11px'`** |
| El estilo que lo lleva | `CW_FS`, que lo lee de `CW_PT` |
| Los dos armadores | `cuadTextoHTML` y `cuadInformeHTML` |
| La negrita y el subrayado con su tamaño propio | `_cwB` |
| Los párrafos | `_cwP` |
| Las tres vías del portapapeles | `_cuadCopiar` |

**La causa, medida con `textutil`** —el motor de Cocoa que Pages usa al pegar HTML; el `\fs` del
RTF va en **medios puntos**:

| lo que se declara | lo que llega | lo que Pages muestra |
|---|---|---|
| `font-size:11pt` | `\fs29` | **14,5 pt** |
| `font-size:11px` | `\fs22` | **11,0 pt** |
| `font-size:14pt` | `\fs37` | 18,5 pt |

Cocoa resuelve los puntos a píxeles a 96 ppp —11 pt son 14,667 px— y después lee esos píxeles
**como puntos**. **Se aparta de la letra de la orden**, que pedía puntos; lo que la orden pide
*ver* es 11 en Pages, y 11 pt es justamente lo que da 14.

**Lo que no se pudo medir desde acá: Word.** Tiene su propio importador y respeta los puntos. Si
ahí sale chico, el valor a probar es `'14.6667px'`, que da los mismos 11 pt por el camino de
Cocoa. → **L13-b**

---

## C · El NT-proBNP de cardio-oncología, y AF-4/AF-5

| qué | dónde |
|---|---|
| La casilla | `hfaicos_bnp`, columna Humoral del HFA-ICOS |
| Su texto de ayuda | el `<span>` sin `id` dentro de su `<label>` |
| Su globo | `'hfaicos-bnp'` en `VINFO`, con `fuente: 'Lyon 2022'` |
| Las notas del Simpson | `_SIMP_NOTAS_METODO`, nueve entradas |

**El globo lleva `preventDefault` y `stopPropagation`** porque vive **dentro** del `<label>` que
envuelve la casilla: sin eso, abrirlo tildearía el factor y le movería el puntaje al médico. Es la
única diferencia con los otros globos de la app.

**Las tres frases retiradas**, identificadas contra `Pendientes_de_decision.docx` (sección 22,
filas AF-4 y AF-5, cotejadas contra Lang 2015 **en imagen** el 16/11/2026):

| id | frase | qué queda |
|---|---|---|
| AF-4 · 1 | «Qué lado queda más alto depende de la geometría…» | «El biplano no es el promedio…: usa el producto cruzado…» |
| AF-4 · 2 | «en diástole y en sístole **por separado**» | «…el más largo de las dos ventanas (Lang 2015).» |
| AF-5 | «y los valores normales con los que se clasifica salen de biplano» | «Lang 2015 recomienda el biplano.» |

Las **nueve** entradas siguen siendo nueve: no se borró ninguna, sólo frases dentro de tres.

**`VINFO` pasa de 156 a 157** entradas. **AF-2 y el NT-proBNP de FA del HFA-PEFF no se tocaron.**

---

## D · Retroceder mientras se traza

| qué | dónde |
|---|---|
| El predicado, **puro y expuesto** | `medRetroIndice(pts, p, radio, salto, min)` |
| Los tres números | `MED_RETRO_RADIO` 7 px de imagen · `MED_RETRO_SALTO` 4 · `MED_RETRO_MIN` 8 |
| Dónde se usa | `_medAreaMove`, **antes** de la decimación |
| La frase de la pantalla | `MED_RETRO_AYUDA`, pegada a las cuatro de contorno de `_MED_COMO` |

**Alcanza a las seis herramientas de arrastre a la vez** —área, Simpson, strain del VI, LARS,
strain del VD y la envolvente del VTI, las que `_MED_HERR_ARRASTRE` declara— porque comparten ese
único recolector de puntos. No hay una segunda copia que se pueda quedar vieja.

**Se decide por cercanía a un punto viejo y no por ángulo**: con el ángulo entre los dos últimos
segmentos, un trazo lento y tembloroso sobre el endocardio da vueltas de más de 90° todo el tiempo
y el contorno se desarmaría solo.

**El orden importa.** El retroceso se mira **antes** de decimar: un dedo que vuelve despacio
produce justamente puntos a menos de 2 px del último, así que con el orden al revés retroceder
lento no haría nada. Medido con un trazo **en U**, donde el último punto queda al lado de uno
viejo: ahí decimar primero mata el retroceso.

**Se vuelve al punto más NUEVO** dentro del radio: con el más viejo, un trazo que se cruza a sí
mismo —una envolvente de dos latidos— se borraría entero de un golpe.

---

## E · «‹ Cambiar vista» en el strain del VI

| qué | dónde |
|---|---|
| La marca de «estoy eligiendo» | `_strain.eligiendoVista`, que `_strainPaso` respeta |
| Ir a la elección | `medStrainCambiarVista` |
| Volver sin elegir | `medStrainSeguirEnVista` |
| Los dos botones | `cine-str-cambiar` y `cine-str-seguir` |
| Las tres puertas que la apagan | `medStrainElegirVista`, `medStrainOtroLoop` y la propia salida |

**Hace falta una marca y no alcanza con poner la vista en `null`**: `_strainPaso` exige además un
par trazado **sin declarar**, y después de cambiar de vista no hay ninguno.

**No pierde nada, y es por construcción**: lo único que esto toca es el puntero de en qué pantalla
estamos. Cada ventana guarda su par en `_strain.vistas[k]`, así que cambiar de vista mueve el
puntero y no el contenido — los valores de dos ventanas **no pueden mezclarse** porque nunca
comparten el mismo lugar.

**Lo único que se puede perder es el trazo sin confirmar**, y por eso se pregunta. El camino sin
nada pendiente queda **sincrónico de punta a punta**, que es la receta de `medStrainElegirVista`.

---

## F · LARS y strain del VD

| qué | dónde |
|---|---|
| Los cuatro textos del trazado del VD | `medVdConfirmar`, `_vdPanel` (cabecera y paso) y `_MED_COMO.vd` |
| Las notas con su fuente | `_VD_NOTAS` y `_LARS_NOTAS`, en el globo de cada panel |
| Los dos globos del visor | `_medInfoBoton('vd-metodo', …)` y `_medInfoBoton('lars-metodo', …)` |
| El cuadro de cada trazo | `_contornoLargo` guarda `loop` y `cuadro`; `_medPintar` los respeta |
| La pre-contracción | `_LARS_PASOS[2].guia` |
| Los dos cortes | `VD_STRAIN_NORMAL` −20 · `LARS_RESERVORIO_NORMAL` 18 |

**La contradicción que el médico vio.** El texto decía «del anillo tricuspídeo lateral, por el
ápex, **hasta el anillo septal**» y dos líneas después «no incluyas el septo»: un trazo de un
anillo al otro pasando por el ápex recorre la pared libre **y** el septo, que es el strain
**global**. Hoy dice «del anillo tricuspídeo lateral **hasta el ápex del VD**».

**El cálculo no hubo que tocarlo, y está medido**: `_vdCalcular` hace `(Ls − Ld)/Ld` sobre
`bordeCm`, que es el largo del trazo que el médico dibujó. **Mide exactamente lo que se traza**, y
lo que estaba mal era lo que la pantalla le pedía trazar.

**El doble signo.** El texto anteponía un menos a cada magnitud, y con el orden de los tres cuadros
invertido el conducto o la contracción salen **negativos**, así que el menos quedaba encima:
«−−39,0». Hoy se publica el **valor absoluto** con su único menos. Que el orden esté mal lo sigue
diciendo el aviso de abajo, que es su lugar.

### La fuente del reservorio, y por qué el corte no se tocó

**La premisa de la orden no se reprodujo.** Decía que el 18 % «corresponde a otro contexto (guía
diastólica)» y que el límite inferior de lo normal es 23 %.

Leída la **guía de strain de la ASE** en la biblioteca —**Thomas y cols., JASE 2025;38(11)**, con
la regla **`folio = hoja + 984`** comprobada en el pie impreso de las hojas **1 (985), 11 (995) y
23 (1007)**—:

| dato | dónde | qué dice |
|---|---|---|
| El corte del comité | hoja 23, **folio 1007** | «the committee believes that using **LASr < 18%** would provide the…» y, entre sus puntos clave, «Impaired LASr of **<18%** is associated with elevated LV filling pressures» |
| El 23 % | la misma hoja | «in **139 patients**, LASr < 23% had superior prediction of invasive LV…» — es **un estudio citado**, no la recomendación |
| El normal del reservorio | hoja 11, **folio 995** | **39 %** (IC 95 % 38-41), metaanálisis de 2.542 sanos en 40 estudios |
| Conducto y contracción normales | la misma hoja | **23 %** (IC 21-25) y **17 %** (IC 16-19) |

**El corte de 18 % es el que el comité respalda: no se toca.** El valor normal sí se precisó a
39 %. Y los normales de conducto y contracción —que hoy la app muestra como «sin corte
publicado»— **no se agregaron**: es contenido clínico nuevo y lo decide el médico. → **L13-f**

El corte del VD, **−20 %**, sigue respaldado por la Tabla 1 de la ASE 2025 de corazón derecho,
hoja 5, **folio 145** impreso en el pie, releída en imagen por la tanda 3A.

### La cuerda del plano mitral

**Confirmado midiendo**: `_strainLargoPx` suma los segmentos del **primer punto al último y NO
cierra**, así que el perímetro es sólo la pared recorrida. El **dibujo** sí cierra la figura —con
`closePath`—, que es lo que puede hacer pensar lo contrario, y por eso la frase del globo lo dice.

### Cada trazo en su cuadro

Cada contorno guarda su `loop` y su `cuadro`, y `_medPintar` sólo dibuja el que corresponde al
cuadro que se está viendo. **Falla hacia dibujar**: un trazo sin cuadro —guardado antes de este
lote— se sigue mostrando, porque esconderlo le sacaría al médico algo que hoy ve.

**Lo que no se cambió**: se siguen pidiendo los **tres** trazados. → reportado, decisión del médico.

---

## G · La flecha de la tabla de cálculos del SGL

**Verificado y sin cambios.** El diseño acordado ya estaba hecho desde PR9:

| qué | dónde |
|---|---|
| El icono y su área táctil | `.sc-ico` 14 px con `::after` de 44×44 |
| El botón, sin `disabled` | `_scBoton`, con `aria-disabled` y el motivo en el `title` |
| La flecha | `scUsarComoSGL`, que escribe en `sgl_gls` |
| El redondeo | `_scRed(n, 1)`, el mismo que publica la celda |

**Medido el flujo de dos pasos**: con doce segmentos en −16 y cinco en −15, tras calcular la flecha
se enciende y escribe **−15.7**, o sea el promedio **redondeado**.

---

## H · El visor a pantalla completa

| qué | dónde |
|---|---|
| El botón | `cine-fs`, en el racimo `cine-imgbtns-tr`, **debajo** de `cine-pan` |
| Pedir y salir | `cineFsToggle` |
| **Quién decide el estado** | `cineFsSync`, colgado de `fullscreenchange` |
| Saber si está activa | `cineFsActiva` |
| El autoocultado | `_cineFsDespertar` / `_cineFsMostrar`, con `CINE_FS_OCULTAR_MS` = 3000 |
| La señal ▶/⏸ | `_cineFsSenial`, en `#cine-fs-senial` |
| La pausa al tocar | `cineFsPausaToggle` y `_cineFsPuedePausar` |
| La barra espaciadora | el **mismo** oyente de `keydown` que las flechas de P11 |

**Es `requestFullscreen` y no otra clase de «grande».** El visor ya tenía `cine-max`, que es el
**tamaño grande**: ocupa casi toda la ventana del navegador y deja su barra de direcciones arriba.
Esto es la pantalla completa del sistema, y es lo que hace que Escape salga por el camino nativo.
Antes de este lote el archivo tenía **cero** apariciones de esa API.

**El estado lo dice el navegador y no una bandera propia.** La clase `cine-fs` la pone y la saca el
oyente de `fullscreenchange`: se puede salir por Escape, por el gesto del sistema o porque el
navegador la cancela, y una bandera propia se quedaría diciendo que seguimos ahí con el visor ya en
su tamaño. **El botón pide, el evento decide.** Sin la API no se finge: se cae al tamaño grande.

**El racimo de arriba a la derecha se apila en columna.** Era `flex` en **fila** y los tres botones
quedaban al lado con el mismo borde de arriba, así que «debajo del de columna» no se cumplía. Los
otros dos racimos siguen en fila.

**Los controles se esconden con `opacity` y `pointer-events`, no con `display`**: con `display` el
alto cambia, la imagen se reacomoda y el visor latiría cada tres segundos. **El botón de pantalla
completa y el de tamaño no se esconden**: son la única forma de salir con el mouse.

**El clic sobre la imagen cede en tres casos**: con la columna a la vista y fuera de pantalla
completa no hace nada —el pedido literal—; **mientras se mide tampoco**, porque el clic para medir
sigue midiendo; y un clic sobre un botón de los racimos que flotan encima no pausa. Va en `click`
y no en `pointerdown`: un arrastre que empieza sobre la imagen —el trazado de un contorno— no tiene
que pausar.

**La barra espaciadora entra por el mismo oyente que las flechas y con las mismas cuatro guardas**:
con dos oyentes, el día que una guarda cambie uno de los dos queda viejo. Y respeta un **botón
enfocado**, que la lista de las flechas no necesitaba.

---

## Dos defectos que la sonda cazó y la lectura no

1. **`cinePlay` NO EXISTE.** El dueño del play y de la pausa es **`cineToggle`**, que ya hace el
   toggle. La primera versión llamaba a `_cineDetener` y a `cinePlay`.
2. **La fila de controles de reproducción no tenía `id`**, así que la regla que la hace flotar no
   aplicaba a nada. Hoy es `cine-ctrl`, prefijada como todo lo de la plantilla.

## Lo que el barrido de mutaciones destapó

**38/38 muertas**, y hubo que correrlo **cuatro veces**:

- **Seis huecos reales de cobertura**, cerrados con condiciones nuevas y **sin aflojar una sola
  mutación**: los márgenes parejos del descargo; el piso de puntos del retroceso, que con cinco
  puntos no se ejercitaba; el orden «retroceso antes de decimar», que un trazo recto no podía
  probar; el cuadro de referencias del VD, que sólo se dibuja con resultado; el guardado del cuadro
  en `_contornoLargo`, que el caso salteaba sembrando a mano; y el botón de salida que no se
  esconde, cuya opacidad **transiciona**.
- **Dos mal escritas**: la del botón «arriba del de columna», que agregaba otro botón y dejaba el
  real en su lugar, y la del doble signo, que buscaba dos menos **tipográficos** cuando el defecto
  real mezcla el tipográfico con el ASCII que `toFixed` produce.
- **Dos equivalentes, declaradas**: quitarle el `preventDefault` al globo —Chrome **no** activa el
  label cuando el clic cae sobre un botón hijo, así que el clic sintético no tildea ni con la
  guarda ni sin ella— y «la flecha escribe en otro campo», porque `sgl` y `sgl_gls` están
  espejados. Las dos se reapuntaron a algo del mismo grupo que sí se ve.
