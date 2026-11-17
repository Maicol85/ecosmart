# Mapa — tanda PARTE-2 (2026-11-16)

Nueve cambios con decisión cerrada del médico. **Ninguno mueve un cálculo**; uno solo mueve un
operador clínico (la coartación) y está rotulado. Por nombre de función y de constante, no por
número de línea.

---

## 1 · El corte de 20 mmHg de la coartación opera en `≥ 20` (2.1)

**Dueños que cambiaron de operador** — los tres, y ninguno más:

| Dónde | Qué era | Qué es | Lleva rótulo |
|---|---|---|---|
| `coaSituacion` — rama «significativa» | `gm > 20` (×4: condición, vía y dos del texto) | `gm >= 20` | **sí** (medio Doppler) |
| `coaSituacion` — rama «sin gradiente medio» | `g > 20` | `g >= 20` | sí, por el mismo |
| `_coaNum` en la sección de Evidencia | `'gt'` | **`'ge'`** (operador nuevo) | **no** |

**`_coaNum` ganó `'ge'` y va EXPLÍCITO.** Su ternario tenía dos ramas, así que cualquier operador
que no fuera `'gt'` caía en `v < umbral`: pasarle `'ge'` a la versión anterior habría contestado
«sí» a los valores **por debajo** del umbral, al revés y en silencio, porque ningún valor de `op`
se valida.

**Una rama quedó muerta y se retiró.** El `(gm!=null && gm >= 20)` del `if` de «limítrofe» era
alcanzable sólo por el 20,0 exacto —su propio comentario lo decía— y ahora se lo lleva la rama de
«significativa». El `g >= 12` del máximo, que es criterio propio, sigue vivo y es el único que
queda ahí.

### ⚠️ Qué lleva rótulo y qué no — es una MEDICIÓN, no un criterio de estilo

Censadas las apariciones de «20 mmHg» de la **ESC 2020** de congénitas (edición inglesa, hojas
40 a 47):

| Medida | Operador de la fuente | Folio | Rótulo |
|---|---|---|---|
| Gradiente sistólico brazo-pierna | **≥ 20 mmHg** | 603 y 604 | **no** — es el de la fuente |
| Pico-pico invasivo por manometría | **≥ 20 mmHg** | 604 (texto) y 605 (Figura 6) | **no** — es el de la fuente |
| **Gradiente MEDIO por Doppler** | `> 20` en las dos guías que lo publican | ESC 2024 Figura 44 folio 120 · ACC/AHA 2025 Tabla 25 | **SÍ** |

El rótulo vive en el globo ⓘ de la conclusión (`evTarjetaCoa`), en un bloque **«Criterio de
EcoSmart»**. Es un **bloque y no el chip con borde**: esa tarjeta se arma por nodos y `_evDiv`
escribe con `textContent`, así que inyectar el `<span>` exigiría abrir una ruta de `innerHTML` en
una tarjeta que hoy no tiene ninguna, por un adorno.

**Y la app ya tenía la lectura.** Las dos entradas de Evidencia (`coa.ev.picopico20` y
`coa.ev.gradmmss`) citaban «20 mmHg o más (hoja 42, folio 604)» en su `ref2` desde antes de esta
tanda, mientras sus `lbl` decían «mayor de 20 mmHg» y el `nota` del pico-pico decía «con el
operador de esta guía: mayor que 20 mmHg». Era una **contradicción interna**: la etiqueta
contradecía a su propia cita. Los tres textos quedaron alineados.

**Intactas, por decisión del médico:** las citas de la ACC/AHA 2025 y de la ESC 2024, y los dos
renglones del resumen de coartación de Referencias — que son dos de los quince resúmenes de
**PANT-36**, **generados** por `scripts/_gen_p36resumenes.py` con trazabilidad en
`docs/CONTROL_CONGENITAS_P36.md`. Editarlos a mano desincroniza el generador.

**Consecuencia clínica, declarada:** un gradiente medio de **20,0 exactos** pasa de «limítrofe» a
«significativa», y un máximo de 20,0 exactos pasa a disparar la rama de «sin gradiente medio
registrado». **Ningún otro valor cambia de rama.** Lo fija **TC-512**, con su condición invertida.

---

## 2 · Los rótulos de criterio propio (2.2)

De los seis que la orden pedía, **tres ya estaban**, **uno no existe** y **dos se agregaron**.

| # | Medida | Estado |
|---|---|---|
| a | TEER, velo anterior ≥20 mm | **ya estaba** — su texto dice «es una referencia propia de la aplicación, porque las guías leídas no traen un corte para ese velo» |
| b | TGA, gradiente de 50 mmHg | **NO EXISTE** — ver abajo |
| c | RVS, bandas altas | **agregado** |
| d | Test de burbuja | **ya estaba** desde R8 (20/10) — bloque visible con Pristipino 2019 y Kleindorfer 2021 para el >20, y el **chip** en el corte de 5 |
| e | Festones por ángulo de ETE | **agregado** |
| f | VTI del reverso aórtico >15 cm | **ya estaba** — «sale de la Tabla 20-5 del libro de texto, y por eso va con el marcador de criterio propio» |

**(b) no se pudo hacer porque no hay nada que rotular.** `tga_grad_subaortico` sólo tiene banda de
plausibilidad (0 a 250) y no decide en 50. Los únicos «50 mmHg» del módulo son **citas de guía con
folio** —la presión sistólica del VD de la estenosis de rama pulmonar, hoja 58 folio 620 y hoja 47
folio 609—, o sea lo contrario de un criterio sin fuente.

**(c) RVS — qué cortes quedaron rotulados.** `_rvsBanda` tiene **cuatro** bandas. El chip, en la
tabla de criterios declarados de Referencias, cubre **tres** de ellas:

```
normal 800–1200 · límite alta 1200–1400 · elevada >1400
```

o sea los cortes **1200 y 1400**. El **`<800` NO lleva rótulo**, y es una medición: ese corte lo
respaldan los dos artículos de la vasoplejia que la misma tabla ya cita dos filas más arriba
(Unic-Stojanovic 2025 y Busse 2020). Los que no tienen fuente son el 1200 y el 1400: las dos
referencias de libro que la app cita para la RVS —1.170 ± 270 y 1.100 con intervalo de 700 a
1.600— **no son rangos de normalidad** y no parten el rango ahí.

⚠️ **La decisión del médico nombra «800–1200 y 1200», así que el 1400 va MÁS ALLÁ de lo
autorizado** y queda a su palabra. Se incluyó porque está medido que tampoco tiene fuente.

⚠️ **No se contradice con el globo de Hemodinámica**, que dice que la app publica el número **sin
banda**: eso es cierto en esa cápsula, de donde los rótulos se retiraron. Estas bandas viven en el
**POSOPERATORIO** —las consumen el Swan, el PiCCO y el patrón hemodinámico—, que es otra pantalla.

**(e) Festones.** La tabla se mantiene y gana su rótulo **visible** debajo del dibujo. Su
procedencia ya estaba declarada pero **sólo en un comentario**: es una transcripción de una figura
que no está en la biblioteca de fuentes, así que va sin folio, y de sus cinco filas la de **60°**
es la única verificada en el original. La ⓘ con su fuente completa **queda para otra tanda**, por
orden expresa.

⚠️ **La fila verificada es de Hahn ASE 2022** (Tabla 4, folio 28), **no de Hahn 2013**.

⚠️ **Y el rótulo fue a la tabla VIVA.** `ETE_PROYECCIONES` —otra tabla de festones por ángulo, con
sus propios SVG— es **código sin interfaz**: sus dos contenedores, `#ete-proy-tabs` y
`#ete-proy-nota`, **no existen en el marcado**. La viva es **`ETE_CORTES`**, que gobierna las
letras de las cuatro vistas por ángulo y la línea del plano del dibujo quirúrgico.

---

## 3 · Los cuatro textos medidos (2.3, 2.5, 2.6, 2.7) y el visor (2.8)

- **2.3 · Ficha de coaptación.** El resumen compacto de los criterios COAPT decía «Prof.
  coaptación ≤10mm» y estaba mal **por dos razones a la vez**: el corte del **clip** es `<11 mm` y
  sólo cuenta **con tethering** (Tamburino 2010, Tabla 1, folio 1386, que excluye ≥11 mm), y el de
  10 mm no es del clip sino de la **reparación quirúrgica**, donde la Tabla 7 lo lista como
  característica **desfavorable** a partir de 10 mm, o sea **en el sentido contrario**. Juntaba el
  umbral de un procedimiento con la dirección del otro. Los otros **dos** bloques de la misma
  ficha ya lo decían bien.
- **2.5 · Amiloidosis.** «VPP 100 %» pasa a «especificidad cercana al 100 %» **con su condición**,
  en los **dos textos vivos** —el título y el cuerpo del escenario E2A— que viajan al informe
  firmado y al PDF. **La mitad ya estaba hecha y no había llegado al papel:** R2-E5 corrigió la
  ficha el 21/10, así que la pestaña decía «especificidad» y el informe seguía diciendo «VPP
  100 %» sobre el mismo paciente. La condición estaba **en el código**: el folio 1556 dice
  «the specificity of **grade 2 or 3** bone scintigraphy for cardiac ATTR **when the disease is
  suspected** has been proposed to be almost 100%». Las otras **cinco** apariciones de «VPP 100%»
  son lápidas en comentarios y no se tocan.
- **2.6 · Bioprótesis.** Los dos globos ⓘ de obstrucción protésica —`prot-obstr` (mitral) y
  `ea-prot-sev` (aórtica)— declaran en su `ojo` que la app **evalúa obstrucción y no evalúa
  deterioro estructural de la bioprótesis**. Censado antes: cero apariciones de «deterioro
  estructural» en el archivo. **Sin ningún cálculo nuevo.**
- **2.7 · Simpson.** El ⓘ cita **«Lang 2015»**, autor-año. Nombraba su fuente de **tres** formas
  distintas y ninguna era la de la casa: «(ASE/EACVI 2015)» —sociedad-año— y «la guía» a secas
  dos veces.
- **2.8 · Visor, AVM por continuidad.** Gana la advertencia de validez que el informe ya publica.
  Traía sólo la nota de **procedencia** y no la de validez, así que una tabla de AVM por
  continuidad podía quedar quemada en una imagen de la biblioteca —y de ahí llegar a un PDF— sin
  decir que con regurgitación significativa esa ecuación no vale.
  ⚠️ **No se copió la cadena: se LEE `EM_CONT_AVISO_TXT`**, el dueño único que ya usa el informe.
  Copiarla cumple el pedido hoy y lo rompe el día que alguien reescriba una de las dos; con un
  solo dueño las dos superficies **no pueden** divergir, y por construcción.

---

## 4 · El HFA-PEFF dice con cuántos dominios calculó (2.4)

`hfapeffConclusion`, rama `!r.completo`: la frase agrega **«, calculado con N de 3 dominios»**.

**La mitad de la decisión ya estaba cumplida**, medido antes de tocar: el puntaje parcial **ya** se
calculaba, **ya** salía con su «(puntaje parcial: falta el dominio …)» y **ya** decía «provisoria»
cuando la categoría podía cambiar — eso lo dejó la tanda **E3** el 22/10. Lo que faltaba era el
**denominador explícito**.

⚠️ **El denominador se DERIVA, no se escribe «3» a mano.** En el modo `soloEco` —el renglón de la
tabla del Doppler— el dominio humoral está excluido **por diseño** y los dominios aplicables son
**dos**, así que un «de 3» fijo sería **literalmente falso** en esa superficie: diría que falta un
dominio que esa vista no evalúa. Con el denominador derivado la frase no puede mentir en ninguna
de las dos, y en el módulo completo da 3.

---

## 5 · El menú de angiografía no se corta (2.9)

**Medido en Chrome real antes y después.** La hipótesis de **P2-a** era la correcta.

| | antes (1440×700) | después (los 8 cruces) |
|---|---|---|
| Antecesor que recorta | **`div.card`, `overflow:hidden`** en los dos ejes | **ninguno** |
| Alto del menú / borde de la tarjeta | 499 px / termina 135,5 px antes | — |
| px tapados | **135,5** | **0** |
| `max-height` / `overflow-y` | `none` / `visible` — **no recorrible** | **440px / auto — recorrible** |
| Opciones alcanzables al toque | **7 de 10** (3 tapadas) | **10 de 10** contando las dos posiciones del scroll |

**Se mide por hit-testing y no por geometría**, que es la lección que PANT-38 dejó escrita para
este mismo defecto: «sobresale N px» no cambia con el arreglo; lo que cambia es si la opción se
**pinta** y se puede tocar.

**Y con dos pasadas de scroll**, porque sin eso el arreglo parece incompleto: en cada posición
quedan 9 de 10, y la décima cae debajo del pliegue **propio** del menú —que es exactamente lo que
el `overflow-y:auto` viene a resolver, no un defecto—. Lo que se exige es que **ninguna quede
inalcanzable en ambas**.

⚠️ **El enganche del `:has()` es una CLASE y no `:not([hidden])`.** Este menú se abre poniendo
`style.display` desde `lv3dCoroUI`, no con el atributo, así que la forma que sirvió para el menú
de Documentos no tiene de dónde agarrarse. La clase `open` se pone en la **misma línea** que el
display para que no puedan desincronizarse, y es el patrón de `.valv-sev-menu.open`. El menú de
**arteria** recibe el mismo enganche: son dos menús flotantes dentro de la misma tarjeta
recortada, y hoy entra por tener tres opciones, no por diseño.

### Tres trampas que la primera corrida destapó y la lectura no

1. **Los nombres que supuse no existen** — `lv3dCoroListaToggle`, `lv3dCoroSync`, `lv3dCoro`. El
   API real es `_lv3d.coroLista` + **`lv3dCoroUI()`**.
2. **`_lv3d` es un `const` de nivel de script**, así que **no está en `window`**: con
   `window._lv3d` el menú quedaba cerrado y la medición salía sobre un menú que no se abrió. La
   misma trampa que este archivo documenta para `_cm3d`.
3. **El panel vive a unos 1.350 px del tope del documento**, así que las diez opciones daban
   «FUERA» y el hit-test medía sobre un **denominador vacío** — que se lee igual que «no hay
   defecto». Hay que desplazar la **ventana** antes de medir; `scrollIntoView` sobre el menú no
   sirve, porque está dentro de un antecesor con `overflow:hidden`.

---

## 6 · La verificación de cierre

**Un solo sello: `v20261116-1019`**, md5 `73289048`, 184.940 líneas. `index.html` **no se volvió a
tocar** después de sellar — verificado: el md5 es idéntico antes y después de las dos corridas de
suite y del barrido de mutaciones.

### Cobertura: nueve casos nuevos, uno por cambio

| Caso | Cambio | Qué afirma |
|---|---|---|
| **TC-912** | 2.1 | el 20,0 exacto cruza y el texto lo dice; el rótulo **acotado** al medio Doppler; la atribución del pico-pico con folio; el lector de la Evidencia en el borde |
| **TC-913** | 2.2 | la fila de la RVS con sus dos cortes; el `<800` **sin** rótulo; la nota de los festones **visible** |
| **TC-914** | 2.3 | los dos cortes con su procedimiento; ya no dice «≤10mm» |
| **TC-915** | 2.4 | «N de 3 dominios» con la N real, dentro del paréntesis; **«de 2»** en solo-eco |
| **TC-916** | 2.5 | los dos textos vivos, con las dos mitades de la condición |
| **TC-917** | 2.6 | los dos globos, en el `ojo` y no en el `lee`; son dos y sólo dos |
| **TC-918** | 2.7 | «Lang 2015» tres veces; ni «ASE/EACVI» ni «la guía» |
| **TC-919** | 2.8 | el descargo **ES** el texto del dueño, por identidad |
| **TC-920** | 2.9 | la regla de CSS acotada y enganchada de `.open`; la clase se pone y se **saca** |

**Los nueve caen 0/9 contra `ac4be40`** —mismo archivo de casos, sólo el `index.html` distinto—
por **49 condiciones**, y **ninguno por excepción ni por una guarda de denominador**: contadas,
cero «sin excepciones» y cero «DENOMINADOR:» en rojo.

### Mutaciones: 26 de 26 muertas

En worktree y **nunca** sobre el árbol vivo, con las **26 anclas verificadas antes** de correr y
el md5 del vivo idéntico después. **34,9 min.**

⚠️ **El primer barrido dejó siete sobrevivientes, y se repartieron en tres clases** — es para esto
que está el barrido:

- **Cuatro eran condiciones mías demasiado flojas** (08, 11, 12, 13): buscaban una frase que la
  mutación no tocaba porque estaba en otra oración del mismo texto. Se endureció la **condición**,
  sin tocar la mutación. La peor era la 12: `indexOf('800')` sobrevivía a una mutación que da
  vuelta el **sentido** de la frase.
- **Dos eran escenas sin montar** (03, 04/05): nadie pisaba el lector de la Evidencia en el borde
  de 20 exacto —se leían las etiquetas, nunca la **respuesta**— ni la rama del máximo sin medio
  registrado.
- **Y una era EQUIVALENTE**, declarada en **P2-h**: `g >= 20` → `g > 20` en la rama del máximo no
  puede cambiar nada, porque ese máximo se **deriva** como `4·v²` y **`v·v === 5` no existe en
  doble precisión**. Se reapuntó al umbral, que sí es alcanzable, en vez de aflojar el caso.

### Los dos motores, 16 cruces

Chrome real del sistema y WebKit × cuatro ventanas × dos temas, con **una sola firma de valores** y
**cero errores de consola y de página**. WebKit de Playwright **no es Safari**, y se declara.

⚠️ **La sonda se atrapó a sí misma**: la primera corrida devolvía tema «noche» en los dieciséis,
porque leía la clase en `body` y esta app la pone en **`documentElement`** — ocho configuraciones
medidas dos veces en el tema oscuro, el mismo defecto que PANT-34 encontró en cuatro tandas. Se vio
**porque la sonda devuelve qué tema quedó puesto** en vez de asumirlo.

### Suite final

**928 de 928 ejecutados** en 17 lotes, una sola pasada sobre el árbol sellado, con el pendrive
`DISK_IMG` verificado **diecinueve** veces leyendo DICOMDIR y el md5 idéntico antes y después.
**918 verdes / 10 rojos**, y **ninguno nuevo**:

- **TC-376 y TC-406** — dos de los tres de siempre.
- **TC-147, TC-182, TC-551, TC-903** — los intermitentes que `CLAUDE.md` documenta.
- **TC-99, TC-347, TC-348 y TC-796** — **preexistentes, y está probado**: los cuatro fallan
  idéntico contra `ac4be40` en un worktree, con el mismo archivo de casos. Los dos del PDF caen por
  «NO HAY jsPDF» (la CDN); TC-99 es cardio-onco y el diff toca **cero** líneas de ese módulo;
  TC-796 cae por su propio denominador («0 editables») y esta tanda no toca los documentos.

**Semgrep 126 WARNING / 0 ERROR**, la línea base exacta. Sin huérfanos nuevos. 17 de 17 bloques de
JS inline parsean. `check_backticks` da cero hallazgos en `test_clinico.mjs`.

### Lo que se conserva y lo que se borró

Se conserva **`scripts/_mut_p2.py`**, que es el arnés del barrido —igual que `_mut_medir6.py`— y
lleva su modo `--anclas`. Se borraron las sondas de medición (`_probe_p29*`, `_probe_p29b*`), el
corredor copiado de lotes y sus logs.

⚠️ **El corredor de MEDIR-6 escribe en `/tmp`**, que esta sesión tenía prohibido usar: se copió con
las rutas dentro del proyecto y la copia se borró al terminar.
