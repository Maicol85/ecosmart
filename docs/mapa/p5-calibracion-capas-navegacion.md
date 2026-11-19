# Mapa — la calibración a mano en milímetros, el cartel que tapaba el visor, los dos textos de
# CeiboLink y «Ir al estudio» (prompt 5, 2026-11-19)

Armado sobre el commit del sello `v20261119-1634`. **Por nombre de función y de constante, nunca
por número de línea**: la línea cambia en cada edición y el nombre no.

Cuatro arreglos chicos, los cuatro de la misma clase: **nada de cálculo cambió**. No se movió un
corte, un umbral, una fórmula ni una unidad interna. Lo que cambió son textos, un orden de capas y
dos líneas de navegación.

---

## 1 · La calibración de distancia: una sola unidad, y el campo que hay que escribir

### El defecto, que era de seguridad clínica

El cartel de la guía decía *«escribí cuántos **centímetros** hay entre los dos»* y el cuadro que
aparecía después preguntaba *«¿Cuánto mide esa línea, en **milímetros**?»* **con «10» ya escrito**.
Quien leía el cartel y aceptaba ese 10 se quedaba con la escala **diez veces mal**, y desde ahí
cada distancia de esa imagen salía diez veces chica **con el aspecto de un número medido**. No hay
segunda red: en una fija JPG o PNG del ecógrafo la escala manual es la única que esa imagen tiene.

### Lo que hay hoy

| pieza | dueño | notas |
|---|---|---|
| el cuadro que pide los milímetros | `_medCalPedirMm()` | devuelve una **promesa** con el largo en mm, o `null` si se canceló |
| la frase de la confirmación | `_medCalFrase()` | **dueño único**: la dicen el aviso del momento y el panel guía |
| el gesto | la rama `_medCalibrando` de `_medClic` | ahora `async` |
| el texto del cartel de la guía | `_medCalFalta('dist')` | dice MILÍMETROS y «1 cm = 10 mm» |
| los dos textos del panel | `_medEstado` | las ramas «calibrando» y «sin escala» |
| el texto de la velocidad | `_medCalFalta('vel')` | nombra **m/s**, que es la unidad que pide su propio cuadro |

- **El campo nace vacío** y el botón de aceptar **arranca deshabilitado**: se habilita recién con
  un número mayor que cero. Con un 10 ya escrito, aceptar sin leer era un gesto de un clic.
- **La unidad «mm» va al lado del campo** y debajo la pista **«1 cm = 10 mm»**, que es la
  conversión que el médico necesita justo cuando está mirando la regla del ecógrafo, que viene en
  centímetros.
- **La confirmación**: «**Escala fijada: la línea marcada = N mm**», en el toast del momento y en
  el panel guía **cada vez que se vuelve a medir**, delante del factor por píxel —que se queda,
  porque es lo único que permite auditar una medición—.
- **`type=text` con `inputmode="decimal"` y no `type=number`**: el `number` deja pegar signos y
  notación científica, y el filtro tiene que correr igual. La coma vale como separador decimal.

⚠️ **NI UN SOLO `id` EN SUS NODOS, y no es un gusto.** El censo del estudio, el Excel y
`limpiarCampos` recorren `input[id]`: un campo con id acá entraría a las **457** columnas por
existir. Se alcanza por `data-med-calmm` (`ov`, `inp`, `ok`, `no`), que es el mismo recurso que usa
el selector de cineloop con `data-vpick-i` — y lo que permite que una prueba lo maneje **con el
gesto real**, escribiendo y apretando, en vez de sustituir una función del navegador.

⚠️ **LA VISTA SE CAPTURA ANTES DEL `await` Y SE VUELVE A ENTRAR EN ELLA PARA ESCRIBIR.**
`cv.onclick` va envuelto en `_vBind`, cuyo `finally` repone la vista anterior en cuanto la parte
**sincrónica** vuelve: con un `await` en el medio, todo lo de abajo correría con `_V` apuntando
otra vez a `_vistaA`, así que calibrar en la vista B escribiría en la A. Se resuelve con
`_vCon(V, …)`. Con el `prompt` nativo el problema no existía porque bloqueaba el hilo — es el
precio de haberlo cambiado, y es la misma trampa que este archivo documenta para «Listo» del
Simpson y para `vistaCerrarUna`.

⚠️ **Y SE VUELVE A MIRAR EL ESTADO DESPUÉS DEL `await`**: si mientras el cuadro estaba abierto la
imagen cambió, `medCambioDeImagen` ya puso `_medCalibrando` en falso y el largo recién escrito es
de una imagen que ya no está. **Falla hacia NO calibrar.**

⚠️ **`_medCalFrase` devuelve cadena vacía si la calibración no trae su largo de referencia**
(`mmRef`). Una calibración armada a mano desde una prueba —hay tres casos que lo hacen— tiene el
factor y no el largo: ahí el panel dice lo que decía antes en vez de inventar un número.

⚠️ **Escape va cortado con `stopImmediatePropagation` EN CAPTURA.** Sin eso, Escape sobre este
cuadro cierra **el visor** y se lleva la medición a medio hacer. Es el mismo molde que
`_medInfoAbrir` y `_medCalCartel`, y el cuadro **se destruye al cerrar**, así que no deja ningún
nodo que los barridos por sufijo de «Nuevo estudio» puedan alcanzar.

### El eje del tiempo sigue sin calibrarse a mano

No se tocó: lo tiene que traer el archivo, y su rama del cartel sale **sin botón**, porque un
«Calibrar ahora» que no puede calibrar nada es peor que no ofrecerlo.

---

## 2 · El cartel de la vista previa dejaba de tapar el visor

### La causa, medida

`#clnkav-ov` vive en la **capa 700** y los dos visores que la vista previa abre viven más abajo:
el de cineloop (`cine-ov`) en la **400** y el lightbox de una fija (`clnkb-ver`) en la **402**. Al
tocar una miniatura, `clnkPrevAbrir` abría el visor **y no tocaba el cartel**, así que el visor
quedaba debajo y la caja opaca de 440 px centrada le tapaba el medio. **No es de un sistema
operativo: es orden de capas**, y por eso pasaba igual en Windows y en Mac.

### Las tres piezas

| pieza | qué hace |
|---|---|
| `_clnkPrevVisorALaVista()` | ¿hay un visor a la vista? Mira el `display` y el ancho de `cine-ov`, y la existencia de `clnkb-ver` |
| `_clnkPrevTapar()` | esconde el cartel **sólo si** hay un visor a la vista; idempotente |
| `clnkPrevDestapar()` | lo repone; lo llaman `cineCerrar` y `_clnkbVerCerrar` |

⚠️ **SE ESCONDE Y NO SE CIERRA, y es toda la diferencia.** `clnkAvisoCerrar` apaga
`_clnkAvisoAbierto`, **olvida el grupo**, borra los cinco manejadores y vacía el cuerpo — o sea que
«← Volver a la pregunta» se quedaría sin nada a donde volver. Moviendo **un** `display` los nodos
siguen enteros: el título, el texto, la tira de miniaturas y los cinco botones con sus manejadores
vuelven tal cual estaban.

⚠️ **NO SE TOCÓ LA CAPA DE NINGÚN MODAL.** Subirle la capa al visor —la otra forma de arreglarlo—
lo pondría por encima de los demás modales de la app.

⚠️ **SE TAPA DESPUÉS DE ABRIR EL VISOR, no antes.** Si el visor no llegó a abrirse —un archivo que
no se pudo leer—, `_clnkPrevTapar` no ve ningún visor y el cartel se queda visible, que es el lado
seguro: el médico no se queda con la pantalla vacía.

⚠️ **NO REPONE UN CARTEL QUE YA SE CERRÓ.** Si mientras el visor estaba abierto algo cerró el aviso
de verdad, `_clnkAvisoAbierto` quedó en falso y reponer el `display` dibujaría un **modal fantasma**
con sus botones apuntando a una pregunta que ya no existe.

El `display` que se repone es **`flex`** y no la cadena vacía, porque el marcado del overlay
declara `display:none` en línea: con `''` quedaría en `block` y la caja se iría a la esquina.

---

## 3 · Los dos textos de la tarjeta de CeiboLink

### (a) «CeiboLink sugiere ésta.»

Era **«Es la que conviene dar.»**, y se lee como una recomendación de EcoSmart. La marca de
`probable` la pone **el conector** y esta app **no la puede verificar**: no sabe si el adaptador que
el sistema llama «Wi-Fi» es inalámbrico, ni al revés. Dicho como recomendación propia, un acierto
del conector y un error suyo se leen igual; dicho como sugerencia, el médico sabe de quién es el
criterio. Lo único que EcoSmart juzga por su cuenta sigue siendo el `169.254`.

### (b) El mensaje de la vinculación no queda pegado

`cfg-clnk-vmsg` es el renglón donde `clnkVincular` y `clnkDesvincular` escriben su resultado. Se
vaciaba **sólo** con el módulo apagado o en Modo Básico, así que «EcoSmart se desvinculó en este
navegador…» se volvía a ver cada vez que el médico entraba a Configuración, debajo del campo del
código, como si fuera de un intento recién hecho.

| pieza | qué hace |
|---|---|
| `_clnkVmsgLimpiar()` | el vaciado, en **un** solo lugar |
| `clnkActualizar()` | el botón «🔄 Actualizar»: vacía el mensaje y después relee el estado |
| `clnkOnMostrar()` | al abrir el panel, lo vacía antes de repintar |

⚠️ **EL VACIADO NO VA DENTRO DE `clnkLeerEstado`, Y ES LA DECISIÓN DE FONDO.** `clnkVincular` y
`clnkDesvincular` escriben su mensaje y **la llaman al final**: vaciarlo ahí borraría el resultado
que acaban de escribir, o sea que el médico no vería ninguno de los dos. Por eso el botón pasó a
tener su propia función en vez de llamar a `clnkLeerEstado()` desde el marcado. **Lo fija TC-959
con un control explícito**: leer el estado por su cuenta NO lo limpia.

---

## 4 · «Ir al estudio» desde una imagen de la galería

### La causa, en dos líneas

```
if (!_igVisor || _igVisor.id == null) return;
igImgVisorCerrar();                       // ← pone _igVisor en null
verDetalleInforme(_igVisor.id);           // ← lee null.id
```

`igImgVisorCerrar` pone `_igVisor` en `null`, y la línea de abajo leía `_igVisor.id`: el
**TypeError** se llevaba el manejador entero. La imagen se cerraba —esa parte sí corría— y
`verDetalleInforme` **no llegaba a correr nunca**, con lo que el médico volvía a la galería tal como
estaba. Medido contra el árbol anterior: `Uncaught TypeError: Cannot read properties of null
(reading 'id')`.

⚠️ **Y DOS FUNCIONES MÁS ABAJO, `igImgVisorMedir` YA TENÍA EL ARREGLO ESCRITO, con su comentario
explicando esta misma trampa.** Eran las mismas dos líneas, una con la copia del id y la otra sin
ella — por eso «Medir» abría el estudio y «Ir al estudio» no.

El arreglo es copiar el id a una local antes de cerrar. **No toca ninguna otra pantalla**: las tres
vistas de Guardados ya se reparten bien —`ig-img-view` vive **dentro** de `ig-lista-view`, así que
esconder la lista esconde la galería— y `verDetalleInforme` no se tocó.

**NO se tocó «Medir» desde Imágenes guardadas**, que avisa que hay que abrir el estudio para medir:
queda como está, por orden del médico.

---

## 5 · Los casos

| caso | qué fija |
|---|---|
| **TC-957** | los dos textos en milímetros, el campo vacío, el botón que no acepta vacío ni basura ni cero ni negativo, 10 mm y 100 mm dando escalas distintas con la identidad exacta corregida por los dos largos, la confirmación en el panel y en el momento, cancelar sin escala, y el control de que no se abre ni un cuadro del navegador |
| **TC-958** | las dos capas medidas, esconder y reponer con los cinco botones y su manejador vivo, **los DOS visores** —el del cineloop y el lightbox de una fija, que es la otra mitad del arreglo—, el control negativo de que sin visor no se esconde, y que un cartel cerrado de verdad no resucita |
| **TC-959** | el mensaje que se limpia por las tres puertas, el control de que `clnkLeerEstado` no lo limpia, y que el botón del marcado llama a `clnkActualizar` |
| **TC-960** | «Ir al estudio» abre la vista de detalle con el nombre de su paciente, con la lista escondida y **sin una sola excepción** |

**Adaptados:** **TC-187**, que pasa a manejar el cuadro propio con el gesto real y gana una
condición (y conserva el sustituto del `prompt` **como red**, para que contra un árbol viejo el
cuadro nativo no cuelgue la batería entera); y **TC-838**, **invertido**: exige la frase nueva **y**
que la vieja ya no esté.

⚠️ **TC-187 ES SENSIBLE AL LOTE Y NO ES DE ESTA TANDA**, y está medido: corrido con `--solo` sobre
**el árbol anterior y con el archivo de casos anterior** falla por las mismas cuatro condiciones de
su primer bloque, con la misma tolerancia. Lo que pasa ahí es que el canvas no tiene ancho útil
cuando el caso corre solo, así que los dos clics caen en el mismo punto y la medición no sale. Se
evalúa **en su lote**, que es donde la batería lo corre.
