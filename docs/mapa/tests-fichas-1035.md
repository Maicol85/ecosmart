# Fichas de los casos TC-1035 a TC-1041 — tanda PR6 (2026-11-23)

Línea base **`8618cd9`** (cierre de PR5, sello `v20261123-0743`, md5 `3ebd3272`). **Seis de los
siete caen 0/6 contra ese árbol** con el mismo archivo de casos y sólo el `index.html` distinto,
por **46 condiciones** y **cero excepciones**. Mapa: `docs/mapa/pr6-word-resumen-valvulas.md`.

⚠️ **TODO ACCESO VA POR UN AYUDANTE CON GUARDA Y DEVUELVE UNA FORMA VACÍA.** Contra la línea base
ninguna de las funciones de PR6 existe, y un acceso pelado tira `ReferenceError` que se lleva el
caso **entero**: la condición «sin excepciones» sale roja y las de abajo **no llegan a
evaluarse**. Es lo que TC-827 tuvo que deshacer en PANT-37 y lo que TC-1030 pagó en PR5.

---

## TC-1035 · el texto «tipo Word» con los tres casos de oro

Las tres escenas que la orden pide —**casi vacío**, **normal** y **estenosis aórtica con
insuficiencia mitral**—, el orden de las nueve secciones, `DOPPLER` como título propio, la
cuantificación de la insuficiencia en su renglón, el AVA y el AVA indexado, y **cero** hallazgos de
válvula, **cero** contenido del cuadro «Otros» y **cero** datos del paciente, con la geometría
ventricular **sí** presente.

- **(A1) El casi vacío es el denominador de los otros dos**: una sección sin datos **no sale** y una
  etiqueta sin valor **no se imprime**, así que con un solo dato cargado sale **una** sección con
  **una** línea.
- **(B3)(B4) El AVA sin un grado consignado.** Es el hueco que el barrido destapó: la fila del
  resumen de válvulas gatea el AVA por «hay un grado puesto» y este texto **no**, porque es una
  medición. En la escena de la estenosis el grado **está**, así que ahí las dos formas dan lo mismo
  y la condición no distinguía; esta escena **no tiene grado puesto**, y su (B3) lo declara.
- **(E1) Los patrones van ANCLADOS AL ARRANQUE DE UNA PIEZA y no sueltos.** Sueltos daban **dos**
  falsos positivos sobre un texto correcto: «IT: » cae dentro de «V.Max IT: 3.1 m/s» y el «74» de la
  edad cae dentro de «longitudinal: 74 mm». Una pieza arranca al principio de la línea —tras la
  sangría— o después de un « - ».

## TC-1036 · la regla de completitud, medible

`cuadTextoFaltan()` tiene que dar **cero** y cada valor del cuadro tiene que aparecer **literal** en
el texto.

- **(A1) Se compara SOBRE LAS CLAVES y no sobre el texto final**, y es a propósito: una pieza puede
  faltar porque **este** paciente no tiene el dato —lo correcto— o porque **nadie la ubicó** —el
  defecto—, y comparando cadenas las dos cosas se leen igual.
- **(B1) DENOMINADOR: más de cincuenta claves con valor.** Sin él, cero faltantes sobre cero claves
  se lee igual que cero faltantes sobre ciento veinte.
- **(E1) El armador no lee un solo campo del formulario por su id**, que es lo que garantiza que no
  haya una segunda derivación.

## TC-1037 · los dos botones de copiar

44 px cada uno, su explicación al pasar el mouse y en el `aria-label`, el **portapapeles simulado**
con el gesto real, y la copia **idéntica con tres cuadros quitados**.

- **DENOMINADOR DEL SEGUNDO BOTÓN: el informe hay que GENERARLO.** Con el textarea vacío la función
  devuelve cadena vacía, el copiador dice «no hay nada que copiar» y **no copia** —que es lo
  correcto—, así que sin eso se medirían «1 copiado» sobre dos botones que funcionan.
- **La tarjeta se abre antes de medir**: lo que está en `display:none` **no tiene geometría**, y
  0×0 se lee igual que «el botón no está».

## TC-1038 · el interruptor «Incluir resumen de válvulas»

Apagado de fábrica, **sin `id`** —o entraría a las 457 columnas por existir—, 44 px, las tres
secciones **sin `ref` / sin «Otros» / sin «EROA IT»**, el PDF sin una fila de válvula **con su
denominador**, prendido con las dos, el censo de campos idéntico, «Tipo Word» ignorándolo, y la
supervivencia a «Restablecer» y a «Nuevo estudio» sin tocar el disco.

- **(C0) DENOMINADOR: apagado, el PDF trae los doce cuadros.** Sin eso, cero filas de válvula sobre
  un PDF **sin cuadros** se lee igual que cero filas sobre un PDF completo — que es exactamente el
  defecto que esta tanda se hizo y corrigió.
- **(C2) Se prende por el GESTO REAL**, un clic en la casilla, y no llamando a la función.
- **(D1) «Tipo Word» lo ignora**, medido comparando los **bytes** de su PDF prendido y apagado.

## TC-1039 · el noveno estilo de PDF

Registrado en el **catálogo**, en el **selector de Config** y en el **despachador**; su PDF trae el
texto como texto real en lugar de los doce cuadros, y conserva el informe y el EN SUMA.

- **(B0) DENOMINADOR: con el clásico el PDF trae los doce cuadros y CERO líneas de texto.**
- **(B3) Cero llamadas a `addImage`**: es texto de verdad y no una imagen.
- **(B4b) Dos renglones de la MISMA sección son DOS textos dibujados distintos.** Contar los que
  empiezan con un rótulo **no alcanza** —con las líneas pegadas en un párrafo, la primera sigue
  empezando igual—, y por eso la mutación 22 sobrevivió al primer barrido.
- **(B4c)(B4d)(B4e) El estilo de letra se mide POR TEXTO DIBUJADO**, pegándole a cada `doc.text` el
  estilo vigente, más la raya justo debajo y en su misma `x`. **Un conteo global de negritas no
  sirve**: el clásico pide **865** y «Tipo Word» **130** —las cabeceras de sus doce cuadros—, así
  que «más negritas que el clásico» es **falso sobre un papel correcto**.

## TC-1040 · los cuatro contenidos de la Evidencia y la frase retirada

Los cuatro contenidos **con su guía, su hoja y su folio**, sin comparar dos fuentes, y la frase del
tracto de salida fuera del informe, del EN SUMA y del PDF.

- **(A0) DENOMINADOR: la Evidencia de estenosis aórtica ABRE.** No abre con un área que no es severa
  ni moderada, así que con la escena de la discordancia de grado devolvía `null` y «la sección no
  abre» se lee igual que «las notas no están». Por eso el caso tiene **dos** escenas.
- **(A2) a (A5) Cada contenido se mide DENTRO DE SU PROPIA NOTA y no sobre el join de las nueve.**
  Lo destapó el barrido: «varias ventanas» aparece en **dos** notas, así que sacársela a una seguía
  encontrándola en la otra. Es la misma lección que PANT-22 pagó con sus «dos equivalentes a nivel
  de sección». **(A6b)** exige además que las cuatro sean **cuatro notas distintas**.
- **(A7) Nueve formas prohibidas y cero apariciones**, por la regla fija del 2026-11-04.
- **(B0) DENOMINADOR: la escena monta una discordancia de grado DE VERDAD** —grado consignado
  «moderada» contra mediciones severas, `disc=true`—. Al revés, con el grado severo y mediciones
  leves, el sincronizador de severidad le gana al `select` y el escenario vuelve **sin**
  discordancia: medir la ausencia de la frase ahí no dice nada.
- **(B0b) DENOMINADOR: el informe trae la LÍNEA de la discordancia.** Sin él, (B1) y (B2) pasaban
  **sobre una cadena vacía** —el ayudante devuelve `inf` y no `texto`—, y lo cazó **(B4)**.

## TC-1041 · la TAREA 1, que ya estaba hecha

⚠️ **PASA EN LOS DOS ÁRBOLES A PROPÓSITO.** El arrastre de los cuadros existía desde la tanda
CUADROS (18/11/2026), así que este caso es una **guarda de regresión** y no lo que discrimina. Lo
que agrega sobre TC-939 y TC-941 es la mitad que ninguno de los dos medía: que el orden nuevo
**llega al PDF**, comparado por el orden en que los títulos de los cuadros aparecen en sus bytes.

- **(A0) DENOMINADOR: el arrastre encontró el cuadro de destino debajo del puntero.** La ventana del
  arnés mide 756×469, así que un cuadro lejano cae debajo del pliegue, donde `elementFromPoint`
  devuelve `null`; por eso se arrastra sobre el **siguiente** y la función **devuelve** lo que
  encontró. Sin eso, «no se movió» y «no había nada debajo» se leen igual.
