# Fichas de los casos TC-842 a TC-851 (tanda ECO-CONECTOR-2, 2026-11-12)

Archivo propio: `tests-fichas-825.md` está en 10,8 KB y `tests-punteros-tandas.md` en 23,8 KB,
pero la regla de esta casa es que la ficha de una tanda nueva nace en su archivo y no engorda el
anterior. Medido con `wc -c` **antes** de escribir.

**Los diez caen contra `8afba18`** —el cierre de ECO-CONECTOR-1, md5 `60ed9c1c`— **por su
DENOMINADOR DECLARADO y NINGUNO por excepción**: 0/10, y cada uno dice «este árbol no tiene el
módulo de ECO-CONECTOR-2» en vez de reventar con un `ReferenceError`. Verificado en un worktree
con el **mismo** archivo de casos y sólo el `index.html` distinto. En el árbol vivo, 10/10.

⚠️ **EL DENOMINADOR VA PRIMERO Y CORTA ANTES DE TOCAR NADA**, que es la lección que PANT-37 tuvo
que deshacer en TC-827 y que ECO-CONECTOR-1 dejó escrita: una excepción tapa a la siguiente, y
las condiciones de abajo saldrían en falso sin haber medido nada. Cada caso pregunta por **dos**
funciones de esta tanda —no por una— porque una sola podría existir por casualidad.

⚠️ **Y EL SEGUNDO DENOMINADOR DE LOS OCHO QUE HABLAN POR LA RED ES EL CONECTOR FALSO.** El arnés
lo publica en `window.__CLNK_FAKE`; si no está, el caso lo DICE en vez de medir sobre cero. Cada
uno apunta el módulo con `window.__clnkBaseTest`, que es la única forma de redirigirlo: no hay
ningún campo editable.

⚠️ **TODOS RESTAURAN EN EL `finally`** el modo de visualización, las dos claves de `localStorage`,
la dirección de pruebas, el `toast` y el `confirm`. Modo Básico esconde las filas de pestañas
especiales, así que dejarlo puesto se lleva puestos los casos siguientes — la lección de TC-230.

---

## TC-842 · El panel compacto

**26 condiciones.** Cuatro bloques:

- **(A) sin vincular**: el código de 6 dígitos se ve, es **lo primero** en el orden de lectura
  —medido con `compareDocumentPosition` y no por su posición en pantalla—, los tres plegables
  quedan escondidos, la cabecera es **un renglón** —medido por el `top` de la luz, la casilla y
  «Actualizar»— y los **tres números se ven igual**, porque `GET /v1/estado` no lleva token.
- **(B) vinculado**: el código desaparece, los tres plegables se ven y **nacen cerrados**, los
  cuatro son `DETAILS` **nativos** y **enfocables**, ninguno de los seis renglones que se tocan
  baja de 44 px, «Desvincular» vive **dentro** de Ajustes y conserva su frase, «Descargar» sigue
  deshabilitado diciendo «próximamente», y la ayuda de las tres vías conserva su marca.
- **(C) el alto**: con todo cerrado mide **menos de la mitad** del panel viejo, abrir una sección
  lo hace **crecer** y cerrarla lo devuelve a su alto compacto.
- **(D) el espacio**: los tres niveles, el piso en bytes, los números inválidos y que el aviso
  rojo nombre al **ECÓGRAFO**.

⚠️ **EL ESCENARIO LLEVA UN SOLO EQUIPO Y AUTORIZADO.** Con uno **pendiente** la sección «Equipos»
se abre **sola** —que es lo que la decisión 12d pide y lo que TC-843 prueba—, así que medir «los
tres nacen cerrados» con el escenario de fábrica daba un rojo sobre una app que se porta bien.

⚠️ **Y LA CONDICIÓN «vinculado no es más alto que sin vincular» SE RETIRÓ PORQUE NO ERA UN
INVARIANTE.** Sin vincular el panel muestra el bloque del código (~95 px) y esconde los tres
plegables; vinculado los muestra (tres renglones de 44) y esconde el código, o sea unos 37 px
**más por construcción**. Medido, daba 375 → 440 y fallaba por **cinco** píxeles. En su lugar se
mide que abrir una sección lo haga crecer, que es lo que prueba que tenerlas cerradas ahorra.

## TC-843 · Equipos

**15 condiciones.** Con un equipo esperando decisión la sección **se abre sola**, el renglón
cerrado dice cuántos hay y que uno espera, «Permitir» y «Bloquear» del pendiente están **a la
vista** sin abrir nada, hay **un renglón por equipo** con **un plegable por equipo** cerrado, y
la ayuda de las tres acciones aparece **una sola vez** —antes se repetía debajo de CADA equipo—.
**Control negativo**: sin pendientes **no** se abre sola y su contador no habla de decisiones.
Sin equipos lo **dice** en vez de dejar un hueco. Y «Permitir» funciona de verdad, por la ruta
del panel.

## TC-844 · El repintado y el apodo

**15 condiciones.** Los **veinticinco** nodos estáticos del panel siguen después de **CINCO**
formas de esconder y repintar: apagar el módulo, esconder los dependientes a mano, una lectura
completa, Modo Básico y reabrir Config. Los dos campos de Ajustes siguen **siendo campos** y con
su valor repuesto del conector, y el botón «Guardar» sobrevivió. Y un apodo
`<img src=x onerror=…>` **no ejecuta nada**, deja **cero** elementos `img`, **cero** atributos de
evento, se ve como **texto literal** y va aislado en un `bdi` —igual que el AET—. El token no
aparece ni en el texto ni en el marcado de la tarjeta.

## TC-845 · El sondeo

**27 condiciones.** Cero pedidos con el módulo **apagado**, **sin vincular** y con la pestaña
**oculta**; el **control positivo** de que vinculado y a la vista sí sondea; que pide el
**estado** —la ruta barata y sin token— y **no** la lista si el estado dice que no hay nada; el
intervalo de los **15 s** declarados; una respuesta en vuelo marcada **no vigente** con su
control positivo; un **401** que borra el token, manda a vincular de nuevo y apaga el sondeo
solo; y la **idempotencia** del sincronizador.

⚠️ **EL CONTADOR DE PEDIDOS ENVUELVE `fetch` Y DEJA PASAR EL PEDIDO DE VERDAD.** Lo que se mide
es **cuántos salen**, no que la app llame a una función que le pusimos: un `fetch` sustituido que
no llama al original no probaría que el pedido viaja.

## TC-846 · La agrupación

**17 condiciones**, y es el único de los diez que **no necesita la red**: le pasa listas armadas
a mano al agrupador. Un envío de tres es **un** aviso; dos equipos a la vez son **dos**; el mismo
equipo separado media hora son **dos** —el **control negativo**: si agrupara por equipo y nada
más saldría uno—; la ventana se prueba por los **dos lados** del corte (119 s agrupa, 121 no); es
**deslizante** —seis imágenes a 100 s de la anterior son un envío, que con un bloque fijo se
partiría en tres—; una fecha que no se entiende hace grupo aparte **sin perder ninguna imagen**;
y los bordes: lista vacía, lista nula y una entrada sin id.

## TC-847 · El aviso

**25 condiciones.** El aviso dice **cuántas**, de qué equipo **por su apodo** y **a qué hora**, y
**ni un dato del paciente** —comprobado contra el nombre que el archivo sintético lleva de
verdad— ni ninguna vista de la imagen. Tres botones apilados con las tres salidas de la decisión.
**No vuelve** por las mismas imágenes, y cerrar **no confirmó ni borró nada**: las tres siguen
esperando en el conector. Si llegan **nuevas**, vuelve a avisar. El aviso es de **un** equipo y
no de los dos juntos. El de **equipo nuevo** usa el mismo molde, nombra el AET, tiene sus tres
salidas con «Más tarde» que cierra y nada más, y el equipo **sigue esperando decisión**. **Una
sola pregunta a la vez.** Y los tres botones **no llevan `onclick`** en el marcado, mientras el
modal de «Nuevo estudio» sigue con los suyos **intactos**.

⚠️ **LA ESCENA DE «SI LLEGAN NUEVAS» TIENE QUE TRAER UN id QUE NO SE HAYA AVISADO.** La escena
`dosEnvios` reúsa `img_a1` e `img_a2`, que es justo lo que el bloque anterior acaba de marcar
como avisadas, y `dosEquipos` tampoco sirve: su `img_b1` es de un equipo que con un solo equipo
autorizado **no sale en la lista** (§3.8). Por eso el conector falso ganó la escena `masNuevas`.

⚠️ **Y SU CONDICIÓN (G2) SALIÓ DE REVISAR EL PROPIO DIFF, NO DE UN CASO:** el aviso podía abrirse
**encima del modal de «¿guardás antes de cerrar?»**. Mide que con esa pregunta abierta el aviso no
salga, que el de equipo nuevo tampoco, y el **control positivo** de que cerrada la otra sí sale.

⚠️ **EL `confirm` DE ESTA ESCENA DICE SÍ, NO NO, Y ESO LO DESTAPÓ EL BARRIDO.** La primera versión
decía no «para que el caso no descarte nada por accidente», y eso **neutralizaba** la mutación que
hace que cerrar el aviso descarte: con el `confirm` diciendo no, la mutación no borraba nada y
sobrevivía. Diciendo sí, la condición «cerrar no confirmó ni borró nada» la caza. Esta escena no
toca ningún camino que abra un `confirm` legítimo. Y **sin sustituirlo**, un `confirm` nativo
colgaba el caso hasta el tope del runner: medido, una mutación tardaba **900 s** en vez de ocho.

## TC-848 · Adjuntar al estudio

**25 condiciones.** Entra por la **puerta única** `mediosImportar` —medido envolviéndola y
dejando pasar la llamada de verdad—, **de a una y en serie**, con `origen: 'ceibolink'` en las
dos, con su nombre de archivo y su tipo `application/dicom`, y llegan a los slots **marcadas**.
El predicado pasa a **sí** y los dos ids quedan **por confirmar**. **No se confirmó nada** al
adjuntar y las tres siguen esperando. El **nombre** se completó del archivo y **no pisó** el sexo
que estaba cargado; el **documento no se escribe nunca**; y un segundo adjuntado **no pisa** el
nombre escrito a mano. «Nuevo estudio» **olvida** los ids por confirmar. Y una imagen en
**cuarentena** no entra ni deja ningún slot.

## TC-849 · Confirmar

**16 condiciones.** Confirma las dos y el conector las **saca de su lista**; el
«`verificada: false`» **se le dice al medico**; si confirmar **falla**, el id **se queda** en la
lista, la imagen sigue en el conector, se avisa que se va a reintentar, y el **reintento la saca**
cuando el conector vuelve; un **404** saca el id **sin alarmar**; **sin vincular** no confirma
nada y **no pierde el id**; y con la lista vacía no hace nada.

## TC-850 · La bandeja

**26 condiciones.** La bandeja vive en una **base propia**; guarda las dos en **un** envío con su
cantidad, su equipo y su fecha, y con el prefijo `clnkb_`. **No tocó el estudio abierto**: cero
slots, el predicado de la regla sigue en **no** y el formulario sigue vacío. **No entra** a la
lista de estudios con imágenes, su sección **no tiene un solo campo** y el PDF sigue leyendo un
`imgSlots` **vacío**. **Sí se confirmó** a CeiboLink, porque la imagen ya quedó guardada. La
pantalla se ve, dice la cantidad, **no tiene miniaturas** —adjuntar desde ahí es
ECO-CONECTOR-3—, tiene su botón «Borrar» y **dice** que no salen en ningún informe. Borrar lo
saca y la sección vuelve a esconderse.

## TC-851 · La regla de paciente

**24 condiciones.** Con una imagen de CeiboLink y **sólo el nombre**, **no guarda**, y lo dice
nombrando las **dos** cosas y explicando que las imágenes vinieron del ecógrafo. El predicado
mira **la lista por confirmar** y **la marca del slot**, con **dos controles negativos**: una
imagen del **pendrive** y una captura del **visor** no activan la regla. El modal de cierre abre
con sus **tres** salidas, «Guardar y continuar» queda **bloqueada**, las otras dos siguen
**vivas**, y el texto dice que las imágenes **no se pierden** y que siguen esperando **hasta su
plazo**. Con el paciente completo «Guardar» **vuelve**, y **sin** imágenes de CeiboLink **no se
apaga nunca** y el texto es el de siempre. **Control negativo**: sin imágenes, con sólo el nombre
el estudio **guarda** y no se queja del documento.

⚠️ **LOS BLOQUES QUE GUARDAN VAN AL FINAL, Y NO ES UN GUSTO DE ORDEN.** Medido: después de un
guardado completo —con su tarjeta de severidades confirmada y el estudio borrado—, la siguiente
escritura sobre un campo del paciente revienta con «Cannot read properties of undefined (reading
'add')» desde un oyente que está **fuera de esta tanda**. Con los bloques que guardan al final,
todo lo que esta tanda tiene que medir se mide antes de llegar ahí. Declarado en **EC2-h**.

⚠️ **Y EL GUARDADO LLEVA UN TOPE PROPIO.** El helper del arnés resuelve su promesa **sólo** cuando
el callback de `guardarInforme` llega, y ese callback no llega si el guardado sale temprano por
cualquiera de sus puertas: el caso se quedó colgado **más de seis minutos** y hubo que matarlo.
Hoy lleva un tope de ocho segundos que informa `TIMEOUT`, y el clic a la tarjeta de severidades
va en el **tick siguiente**, porque esa tarjeta se dibuja dentro del propio guardado.

---

## Cuatro cosas que esta tanda hizo mal al escribir los casos

1. **POR DECIMONOVENA TANDA SEGUIDA, EL ACENTO GRAVE EN MIS PROPIOS COMENTARIOS** dentro del
   cuerpo de un caso —y de una sonda—. **Cuatro veces** en esta tanda. Lo caza `node --check`;
   lo previene no usarlos nunca dentro de un template.
2. **EL `return` DE UN CASO NO PUEDE LEER `.indexOf` NI `.slice` DE UN VALOR QUE EL `try` PUEDE NO
   HABER ASIGNADO**: la excepción del `return` **tapa** el `R.err` que dice la causa. Es hermana
   de «una excepción tapa a la siguiente». Once lecturas blindadas con `String(x || '')`.
3. **LA PESTAÑA DEL PACIENTE SE LLAMA `datos` Y NO `paciente`**: `showTab('paciente')` revienta
   con «null.classList». Y al corregirlo con un reemplazo global me llevé **siete** ocurrencias
   **ajenas**, de casos viejos donde el null estaba dentro de un `try` y era inofensivo; se
   revirtieron una por una, verificado contra HEAD línea por línea.
4. **`xargs` LEE DE stdin Y SE COMIÓ UN HEREDOC** de Python en la misma línea de comando: el
   script no corrió y el resultado se leyó como «no aplicó».
