# Guía de prueba a mano — ECO-CONECTOR-2

Doce pasos, en orden. Hace falta **CeiboLink corriendo** y un ecógrafo que le mande algo; donde
no haya ecógrafo, el paso lo dice.

> Todo esto vive en **Modo Avanzado** y con **«Activar CeiboLink»** encendido. De fábrica el
> módulo está apagado: si la tarjeta no aparece, el modo está en Básico.

---

**1 · La tarjeta tiene que entrar de un vistazo.** Abrí ⚙️ Config. La tarjeta «🔗 CeiboLink»
ahora son **dos renglones arriba** —la luz con el interruptor y «Actualizar», y los tres números—
y debajo **cuatro renglones plegados**. Medido: con todo cerrado ocupa unos **456 px** contra los
**1195** de antes.

**2 · Sin vincular, lo primero es el código.** Si este navegador no está vinculado, debajo de los
números tiene que estar el campo de los **6 dígitos** con «Vincular», y los tres plegables
escondidos. Los tres números se ven igual, porque para preguntar el estado no hace falta
autorizar nada.

**3 · Los plegables abren con el teclado.** Dale Tab hasta el renglón «Datos para el ecógrafo» y
apretá **Enter** o **Espacio**: tiene que abrirse. Lo mismo con «Equipos», «Ajustes» y «Cómo
conectar el ecógrafo». Son desplegables nativos del navegador, así que también los anuncia un
lector de pantalla.

**4 · Los datos del ecógrafo, en una fila.** Abrí «Datos para el ecógrafo»: el puerto, el nombre
(AET) y la dirección tienen que estar **en la misma fila**, cada uno con su «Copiar» chico. Si
CeiboLink informa **más de una** dirección, salen todas, con el aviso que él manda.

**5 · Un equipo nuevo se ve sin buscarlo.** Mandá algo desde un ecógrafo que CeiboLink no
conozca. Tiene que pasar, **sin que abras nada**:
- un aviso en pantalla: «Un equipo nuevo, <nombre>, mandó imágenes. ¿Permitir o bloquear?», con
  **Permitir**, **Bloquear** y **Más tarde**;
- y si estás en Config, la sección «Equipos» **abierta sola**, con «Permitir» y «Bloquear» a la
  vista en el renglón de ese equipo.

Apretá **Más tarde**: no pasa nada y el equipo sigue esperando. El aviso vuelve solo.

**6 · Permitir, y el aviso de las imágenes.** Apretá **Permitir**. En menos de 15 segundos tiene
que aparecer: «Llegaron N imágenes del equipo <nombre> a las HH:MM», con tres botones.

Fijate en lo que **no** dice: ni el nombre del paciente, ni el documento, ni ninguna vista de la
imagen. No puede: esa lista no los trae.

**7 · Adjuntar al estudio actual.** Con un estudio abierto, apretá **«Adjuntar al estudio
actual»**. El aviso va contando «Bajando 1 de N…». Al terminar: las imágenes están en los slots
de la pestaña **Imágenes**, y si el estudio tenía el **nombre vacío**, se completó con el del
archivo —el sexo y la fecha también, **si estaban vacíos**—. El **documento no se completa
nunca**: el número que trae el DICOM es la historia clínica de la institución, no una cédula.

Y un aviso te dice: **«Guardá el estudio para que queden»**. Hasta que guardes siguen esperando
en CeiboLink.

**8 · Cerrá sin guardar, a propósito.** Apretá «Nuevo estudio» y elegí **«Continuar sin
guardar»**. Volvé a CeiboLink: las imágenes **siguen ahí** y el aviso vuelve a ofrecerlas. No se
perdió nada.

**9 · La regla del paciente.** Adjuntá imágenes otra vez y, con **sólo el nombre** cargado,
apretá **Guardar**. Tiene que **negarse**, diciendo que hacen falta el **nombre Y el documento**.
Cargá el documento y guardá: ahora sí. Y en CeiboLink las imágenes ya **no están**: se
confirmaron recién cuando quedaron escritas de verdad.

Probá también «Nuevo estudio» con imágenes de CeiboLink y sin el documento: el modal abre con sus
**tres** salidas, «Guardar y continuar» **apagada**, y el texto diciendo que si seguís sin
guardar las imágenes siguen esperando en CeiboLink hasta su plazo.

**10 · Guardar sin estudio.** Mandá otro envío y elegí **«Adjuntar a imágenes guardadas»**. En la
pestaña **Imágenes**, al pie, aparece **«🖼 Imágenes sin estudio»** con el envío: cuántas son, de
qué equipo y cuándo llegaron, con su botón **Borrar**.

Comprobá que **no** aparecen en ninguna otra parte: no están en los slots, no salen en el PDF, no
figuran en «Imágenes guardadas» de Guardados y no pertenecen a ningún paciente. Eso es lo que esa
pantalla promete.

**11 · Descartar.** Mandá un envío y elegí **«Descartar»**. Tiene que preguntarte, diciendo que
**no se pueden recuperar**. Si aceptás, se borran de CeiboLink y para volver a tenerlas hay que
mandarlas de nuevo desde el ecógrafo.

**12 · El espacio.** En la tarjeta, el tercer número dice «X de Y». Cuando CeiboLink pase del
**85 %** aparece un aviso ámbar, y del **95 %** —o con menos de 32 MB libres— uno rojo que avisa
que **el ecógrafo** va a empezar a rechazar los envíos. Ese rechazo lo vas a ver en el **equipo**
y no en EcoSmart: el canal no recibe las imágenes, las recibe el receptor DICOM.

---

## Lo que esta tanda NO hace

- **Adjuntar desde «Imágenes sin estudio» a un estudio**: todavía no se puede. Es lo siguiente.
- **Pasar imágenes de un paciente a otro**: tampoco.
- **La carga desde el pendrive no cambió en nada**: «Importar DICOM» sigue igual y sigue
  andando con CeiboLink apagado.
