# PANT-14 — el esquema sin cajas negras, el botón del PDF, la transposición y las siete lesiones

Mapa de la tanda **PANT-14** (2026-11-05). Sello `v20261105-1004`.
No lleva números de línea a propósito: se busca por nombre de función y de constante.

---

## 1. Por qué el esquema de circulación salía negro — y la regla que queda

**La causa es de una línea: `--card` NO EXISTE en esta aplicación.** Medido en los dos motores,
en los dos temas y en los cuatro anchos: `getPropertyValue('--card')` devuelve la **cadena
vacía** en la raíz, en la caja del esquema y en el propio SVG, mientras `--border`, `--text` y
`--text2` sí resuelven (un rect de prueba con `fill="var(--border)"` sale `rgb(42,48,80)`).

Un `var()` sin valor y sin respaldo es inválido en tiempo de cómputo, así que:
- **`fill`** —que es una propiedad **heredada**— cae en el **negro** que viene de la raíz;
- **`stroke`** cae en `none`.

Por eso el médico veía Pulmones, VD, AI, AD, VI y Cuerpo **negros con el texto encima**: los
textos llevan las clases `.cm3d-tp` y `.cm3d-ts`, cuyas **reglas de CSS** sí resuelven, así que
quedaban en su color sobre un fondo negro — **contraste 1,32** en el tema claro. Las flechas y la
leyenda se veían bien porque usan los hexadecimales literales `CM_SCH_B`, `CM_SCH_R`, `CM_SCH_O`.

**No es de Safari y no es intermitente:** 53 elementos negros en **cada uno de los 16 cruces**
(dos motores × dos temas × cuatro anchos), en los siete estados medidos.

Es el mismo defecto que **POP-B** pagó con `--amber` y **PANT-2** con el esquema que se
rasterizaba.

### La regla que queda

> **El esquema NO escribe `var()` en un atributo de presentación.** Los colores se resuelven
> **al dibujar**, desde los estilos calculados de su contenedor, y cada uno lleva su respaldo
> explícito por tema.

El dueño es **`cmSchPal()`**, con `CM_SCH_RESP` como tabla de respaldos (claro y oscuro). El de
`--card` es **`--bg2`**, que es el fondo de tarjeta de la app y sí existe. El valor se valida
contra un patrón de color antes de entrar al marcado: hexadecimal, `rgb()`/`rgba()`,
`hsl()`/`hsla()` o un nombre de color; cualquier otra cosa cae en el respaldo.

**Y así también sale bien el marcado que se rasteriza para el PDF**, que vive fuera del documento
y donde ninguna variable existe: `_esqSustVars` cambia un `var()` sin valor por `currentColor`,
que fuera del documento es negro. Medido por **píxeles** sobre el JPEG que `esqRasterizar`
devuelve, muestreando dentro de cada caja (y **no en su centro**, que es donde está el rótulo):
**0 de 6 negras** en los dos temas, y el **control positivo** —reponer `fill="var(--card)"` en el
marcado serializado— las devuelve a **6 de 6 negras**.

### Dónde se redibuja

| gesto | quién lo dispara |
|---|---|
| al abrir el esquema | `cmSchSet` |
| al cambiar de modo, de base o de lesión | `cm3dBuild` → `cmSchRender` |
| **al cambiar de tema** | `toggleTheme`, agregado en esta tanda |
| **al cambiar de ancho** | el oyente de `resize` del motor, agregado en esta tanda |

### La letra de la válvula dorada

El círculo de la válvula desplazada del Ebstein lleva un amarillo **fijo** (`CM_SCH_Y`) en los
dos temas, así que con la letra en el color del texto quedaba en **1,62** de contraste de noche.
Pasa a `CM_SCH_TINTA`, una tinta fija y oscura, con clase propia **`cm3d-tp-f`** para que la
regla de la hoja no se la vuelva a llevar al color del tema.

### ⚠️ Y un segundo defecto del esquema, preexistente

La demo v13 declara su objeto de cajas con `var`; **PANT-13 lo portó con `const`** y la rama del
**switch auricular** lo **reasigna entero**, así que lanzaba «Assignment to constant variable» y
**`cmSchRender` ABORTABA**. Medido en HEAD sembrando un centinela en el SVG: con la variante
`mus` el centinela **sobrevivía**, el esquema quedaba en **un** nodo y **cero** textos, mientras
las otras cuatro dibujaban sus 28 a 30. Con un Mustard o un Senning cargado **el esquema no se
dibujaba** y lo que quedaba a la vista era el de la variante anterior. Corregido con `let`.

---

## 2. «Incluir en el PDF»: funciona, y no se cambió una línea

El recorrido completo con el gesto real está medido en `scripts/_probe_pant14pdf.mjs` y
`_probe_pant14pdf2.mjs`. **Los diez pasos pasan**, así que no se tocó código.

**Dos trampas del arnés, no de la app:**
1. **El botón del encabezado NO genera el PDF**: abre la tarjeta «Revisión de severidades», y el
   documento sale al **confirmarla**. Sin ese clic el espía mide cero textos y cero imágenes —un
   denominador vacío— y la superposición abierta bloquea todo lo que viene después. **Guardar pasa
   por la misma tarjeta.** No alcanza con poner `valvSevConfirmada` desde afuera: es una variable
   de módulo y no está en `window`.
2. **El botón de «Nuevo estudio» es `nuevoEstudio()` y no `limpiarCampos`**, y abre un modal cuyo
   «Continuar sin guardar» es el que limpia.

**Con qué modo abre el módulo (P14-a):** **siempre «Según el estudio»**, medido en cuatro
escenarios al abrirlo y al reabrirlo. Lo que sí pasa es que **el panel se cierra al salir de la
pestaña de congénitas** (`cc3dPieSync`, a propósito), así que quien carga el dato en otra
sub-pestaña y vuelve se encuentra el panel cerrado.

---

## 3. La transposición: las reglas son las del 3D de la pestaña

**Las reglas se midieron, no se leyeron** (`scripts/_probe_pant14tgareglas.mjs`): se llama a
`tga3dEscena` —el dueño único de lo que el 3D de la pestaña dibuja— con cada par
anatomía-cirugía y con cada combinación de comunicaciones, y se compara la huella de la escena
contra la escena sin ninguna.

| anatomía / cirugía | CIA | CIV | ductus |
|---|---|---|---|
| d-TGA sin cirugía | **sí** | **sí** | **sí** |
| d-TGA Jatene | **sí** | **sí** | no |
| d-TGA switch auricular | no | **sí** | no |
| d-TGA Rastelli | **sí** | no | no |
| ccTGA | **sí** | **sí** | no |

Los motivos clínicos de las dos exclusiones son los que PANT-13 declara: con el switch auricular
el tabique auricular se resecó y la sangre va por los dos túneles que esa rama dibuja; con el
Rastelli esa rama ya pone un anillo en el tabique interventricular, que es el túnel del
ventrículo izquierdo a la aorta.

**Y todo lo demás queda bloqueado en las cinco variantes, incluida la cava izquierda**, porque
`tga3dEscena` recibe **únicamente** `{ asd, vsd, pda }`: la ventana aortopulmonar, la conexión
venosa anómala, la coartación, las dos estenosis, el Eisenmenger y la cava izquierda **no
existen** para el 3D de la pestaña. Ningún dato se pierde: el campo sigue cargado y la línea de
abajo del dibujo lo lista.

### La obstrucción subaórtica SÍ se dibuja

Decisión del médico (05/11/2026). Anillo gris con la posición por variante de la demo v13, número
por número, que es la **misma forma** que el módulo ya dibuja para la membrana de la estenosis
subaórtica. El esquema ya ponía su barra gris desde PANT-13. Es la **única diferencia esperada**
con el dibujo viejo.

### ⚠️ El dibujo viejo NO se retiró, y lo impide el esquema de circulación

| | escenas | distintas **con** obstrucción | distintas **sin** obstrucción |
|---|---|---|---|
| HEAD | 160 | 23 | **23** |
| árbol nuevo | 160 | 80 (por diseño: el anillo) | **0** |

La **geometría** cierra. Lo que no cierra es el esquema: medido con
`scripts/_probe_pant14tgaesq.mjs` (cinco variantes × cinco combinaciones, comparando cada `rect`,
`path`, `circle` y `text` con su posición y su texto), **0 de 25 escenas iguales**. Son **dos
dibujos distintos**, portados de dos demos distintas:
- el **tamaño de letra**: el módulo pone 12 px en el título de cada caja y 9 en el subtítulo, la
  pestaña pone **15 y 12**, y las posiciones difieren en un punto;
- el **rótulo de cada comunicación**: el módulo escribe «CIA O.S.» y «CIV perim.», la pestaña no;
- el **sentido de la flecha** del cortocircuito, que sale invertido entre los dos.

Retirar el recuadro de la pestaña le cambiaría al médico el esquema que ve. Queda en
`docs/PENDIENTES.md` → **P13-c**: unificar los dos esquemas en un dueño único. Por eso tampoco se
agregó el botón «Ver en 3D» ni se reacomodaron los campos: eso es el 3e, que es condicional.

---

## 4. «Según el estudio»: cómo se conectó cada lesión

**«Cargada» se le pregunta a `_CC_SECS`**, el registro del Laboratorio, que es el dueño único: lo
usan el filtro de cohorte, las tarjetas del Laboratorio y la propia línea de «cargadas y no
dibujadas» de este módulo. El helper es **`_cmSecsOn()`**, que arma el **mismo** objeto `inf` que
`cc3dNoDibujadas` — el mismo barrido y la misma exclusión de `_noEsDelEstudio`.

El inventario campo por campo está en **`docs/INVENTARIO_SEGUN_EL_ESTUDIO_P14.md`**.

### La única base, con su orden de prioridad

`CM_BASE_PRIO` declara el orden que el médico fijó: **transposición → Fallot → defecto AV →
Ebstein → Fontan**. Las que pierden se listan en `chocan`, que la línea publica como «No se
dibujan juntas». Medido en los **diez pares**: los diez dibujan la correcta y los diez lo dicen.

### Cada lesión

| lesión | predicado | variante | casillas |
|---|---|---|---|
| **Fallot** | `_CC_SECS.tdf` | **`op` fija, sin preguntar** | `ip` (de `ip_grado` ≠ «Sin insuficiencia»), `rciv` (`tdf_civ_residual`=si), `rest` (`tdf_ep_stent`=si) |
| **Coartación** | `_CC_SECS.coa` | `coa_situacion`: nativa→`nat`; recoartación / post stent / post cirugía→`rep` | `rec` sólo con `recoartacion` |
| **Estenosis pulmonar** | **propio**: `ep_grado` ≠ «sin» **o** nivel **o** etiología consignados | `ep_nivel`: Valvular→`valv`, Subvalvular→`sub`, Supravalvular y Ramas→`sup` | — |
| **Est. subaórtica** | `_CC_SECS.esub` | `ea`=`sub` (las cuatro opciones) | `iao` (de `esub_ia_asociada` ≠ «no») |
| **Est. supravalvular** | `_CC_SECS.easv` | `ea`=`sup` (las cuatro opciones) | — (no tiene campo de IAo) |
| **Defecto AV** | `_CC_SECS.dsav` | `parcial`→`par`, **`intermedio`→`tra`**, `completo`→`com` | `iav` (de `dsav_regurg_av_izq` ≠ «no») |
| **Ebstein** | `_CC_SECS.ebs` | sin variantes (`std`) | `eit` (de **`it_grado` ≠ «0»**) |
| **Fontan** | `_CC_SECS.fontan` | `extra`→`ext`, `tunel`→`tun`, `ap`→`atr` | `fen` sólo con `presente` y sólo en `ext`/`tun` |

**Lo que la pestaña no tiene no se inventa.** Sin el dato que define la variante la lesión **no se
dibuja** y la línea la lista: `coa_situacion` vacía, `ep_nivel` en «Mixto» o «No especificado»,
`dsav_tipo` y `fontan_tipo` en «noesp». La **única** variante que se fija sin dato es «Fallot
operado», porque la pestaña es la de la Fallot reparada: **«Fallot sin operar» no se dibuja nunca
desde el estudio**.

### ⚠️ Tres trampas que la medición destapó

1. **La estenosis pulmonar no tiene entrada en `_CC_SECS`** (censado el registro entero, 19
   entradas): es la única de las siete sin dueño ahí.
2. **Y su predicado no puede ser «su campo no está vacío»**: sin tocar nada `ep_nivel` vale
   **«No especificado»**, `ep_etiologia` **«No especificada»** y `ep_grado` **«sin»**, y sus
   opciones **no llevan atributo `value`**. Lo que se pregunta es `ep_grado`, el grado que la app
   calcula sola: medido barriendo la velocidad, vacía y **1,0 m/s dan «sin»**; 1,8 «Leve», 3,5
   «Moderada» y 4,5 «Severa». Así que **una velocidad pulmonar normal no enciende la lesión**.
3. **`tdfConclusion()` deja de ser nula con sólo una velocidad pulmonar cargada**, porque lee
   `vp_gmax`, el espejo de `ep_vmax`. Por eso el predicado de la Fallot no es «su conclusión no es
   nula».

### El grado de insuficiencia se lee del dueño, no del espejo

`ip_grado` para la IP del Fallot y `it_grado` para la IT del Ebstein, **no** `tdf_ip_ro` ni
`ebs_it_ro`. Y el centinela de «sin grado» **no es el mismo campo**: el de la insuficiencia
pulmonar es la frase **«Sin insuficiencia»** y el de la tricuspídea es el **cero**. El dueño de
esa pregunta es `_cmGrado(valor, sinGrado)`.

### La línea de abajo del dibujo

`cc3dTextoSync` la arma con cuatro piezas; las dos últimas las llena `cmDesdeEstudio`:
1. el estado («Sin lesiones cargadas que dibujar…» / «Cargadas y no dibujadas todavía: …» /
   «Todas las lesiones cargadas están dibujadas.»);
2. `_cm3d.omitidas`, con el mapa `ROT` — **toda clave que `cmDesdeEstudio` pueda poner ahí tiene
   que estar en `ROT`**, o la línea publica la sigla interna;
3. `_cm3d.chocan`, que trae lo que `cmBloqueado` rechazó **y** las bases que perdieron por
   prioridad.

⚠️ **«Todas las lesiones cargadas están dibujadas» sólo se dice si es cierto.** Hasta esta tanda
salía en cuanto la lista de faltantes estaba vacía, y eso dejó de alcanzar desde que las bases se
eligen por prioridad: con una transposición y un Fallot cargados las dos secciones están en
`CC3D_DIBUJA`, así que la lista quedaba vacía y la línea afirmaba que estaba todo dibujado **al
lado** de «No se dibujan juntas — Fallot…». Ahora la frase se dice sólo cuando las **tres** listas
están vacías.

**La línea se lee completa a los cuatro anchos**: cero recortes y cero desplazamiento horizontal
a 1440, 1000, 768 y 390 px, en cuatro escenarios.

---

## 5. Las sondas de la tanda

| sonda | qué mide |
|---|---|
| `_probe_pant14color.mjs` | los **colores** del esquema en 16 cruces, con contraste |
| `_probe_pant14raster.mjs` | el esquema del **PDF** por píxeles, con control positivo |
| `_probe_pant14demo.mjs` | la **geometría** del esquema contra la demo, sin color |
| `_probe_pant14tgareglas.mjs` | qué comunicaciones dibuja el **3D viejo**, por par |
| `_probe_pant14tgaesq.mjs` | el esquema del módulo contra el de la **pestaña** |
| `_probe_pant14pdf.mjs` · `pdf2` · `pdf3` | el **botón del PDF** de punta a punta y su A/B |
| `_probe_pant14inv.mjs` | el **inventario** de las siete pestañas |
| `_probe_pant14lesiones.mjs` | cada lesión contra «Explorar», gesto y siembra muda |
| `_probe_pant14bases.mjs` | la única base y los **diez pares** |
| `_probe_pant14linea.mjs` | la **línea** a los cuatro anchos |
| `_probe_pant14ab.mjs` | el A/B de **superficie firmada** |
| `_probe_pant14wk.mjs` | Chrome y WebKit, dos temas, cuatro anchos |
| `_mut_pant14.py` | las **34** mutaciones dirigidas |

⚠️ **`_cm3d` NO está en `window`**: es un `const` de nivel de script, así que vive en el ámbito
léxico global y se alcanza **por su nombre pelado**. Con `window._cm3d` el guardia corta y la
medición sale sobre un denominador vacío, que se lee igual que «todo bien». `cmEscena`,
`cmBloqueado`, `cmSchRender` y `cmSchPal` **sí** están en `window`.

⚠️ **`getBBox()` dentro de un subárbol en `display:none` devuelve CEROS.** El panel del esquema
nace cerrado, así que una condición que empareje cajas con textos por su caja medida los encuentra
**todos en el origen** y no empareja ninguno: pasa sobre nada. La geometría del esquema se compara
por **atributos** (`x`, `y`, `width`, `height`, `cx`, `cy`), que son exactos y no necesitan
maquetado.
