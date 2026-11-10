# Los documentos del Informe — manual del médico (PANT-32, 2026-11-10)

Lo anterior, la hoja y los cuatro documentos que vienen con la app, está en
`docs/DOCUMENTOS_P30.md`. Acá va lo que esta tanda agregó: **el cajón de Documentos en
Configuración**, donde se cambia el texto de los documentos y se agregan documentos propios.

---

## Lo primero, y es lo más importante

> **Los textos que vienen con la app son un MODELO.** Son un punto de partida razonable, no un
> documento aprobado por nadie. **La institución que los usa tiene que revisarlos** —con su
> asesoría legal si corresponde— antes de entregárselos a un paciente, y lo que se escriba o se
> pegue en el editor es responsabilidad de esa institución. La app los imprime; no los valida.

> **Los modelos viven en el navegador de ESTA computadora.** No están en un servidor, no viajan
> con los estudios y no se comparten solos entre computadoras ni entre usuarios del mismo
> equipo. Si se limpian los datos del navegador, **se pierden**: para llevarlos a otra máquina o
> para tener una copia, está «⬇ Exportar modelos».

> **Los modelos no guardan datos de pacientes.** Lo que se guarda son los textos y las casillas.
> El nombre, el documento, la ciudad, la fecha, el logo, la institución y la firma del médico los
> pone la app al imprimir, desde los datos del estudio y de Configuración.

---

## Dónde está

**Config → 📄 Documentos**, entre «Imágenes del estudio» y «Modo de visualización».

## El interruptor del botón

**«Mostrar el botón Documentos en el Informe»** viene encendido. Apagado, el botón desaparece de
la pantalla del Informe. **No se borra ningún documento**, y vale también al recargar la app.

## La lista «Mis documentos»

Arriba dice cuántos hay de los seis que caben. Cada fila trae:

- el **nombre** con el que aparece en el menú del botón Documentos;
- si es una **constancia** o un **consentimiento**;
- si **viene incluido** con la app o es **propio**;
- **«Mostrar en el menú»**, para sacarlo del menú sin borrarlo ni perder sus cambios;
- **«Editar»**;
- **«Borrar»**, sólo en los propios. Los cuatro que vienen con la app **no se pueden borrar**: se
  pueden ocultar, o volver a su texto original.

Un documento oculto **sigue ocupando lugar** en el cupo: lo que libera lugar es borrar uno propio.

## El editor

«Editar» abre el editor en la misma pantalla. A la izquierda se escribe; a la derecha se ve
**«Así se ve con un paciente de ejemplo»**, que se actualiza mientras se escribe y muestra cuántas
hojas va a tener el papel. **Ese paciente es inventado**: nunca es el del estudio abierto.

### Qué se edita

- **Nombre en el menú** y **título del documento**.
- En una **constancia**: la casilla «Frase con los datos del paciente» —la frase «Se deja
  constancia que …», que la app arma con los datos del estudio— y el **texto** libre. Si se
  destilda la casilla, hay que escribir todo a mano.
- En un **consentimiento**: la lista de **preguntas**, cada una con su título y su texto. Se
  pueden cambiar, agregar («＋ Agregar pregunta») y quitar («✕»). **Una pregunta con el texto
  vacío no se imprime**, y el editor lo avisa.
- Las **piezas** que agrega la app, con su casilla, las tres tildadas de fábrica:
  - **Declaración del paciente** — el texto estándar, con la casilla de investigación;
  - **Tabla de firmas** — paciente, testigo y médico. Si se destilda, **queda igual la firma del
    médico**;
  - **Hojas comunes** — la de niño o paciente imposibilitado, y la de negativa o revocación.
  
  Si el texto que se escribió **ya trae** declaración, firmas u hojas comunes, hay que destildar
  esas piezas para que no salgan dos veces. El editor lo avisa.

Los bloques grises con borde punteado no se editan: dicen qué pone la app por su cuenta.

### Cómo se escribe

| para que salga | escribir |
|---|---|
| una **viñeta** | empezar la línea con `• ` |
| una **casilla** para marcar | empezar la línea con `☐ Sí ☐ No ` |
| una **raya** para escribir a mano | una línea con sólo guiones bajos: `________` |
| **negrita** | entre dos asteriscos: `**así**` |
| un **párrafo nuevo** | una línea en blanco |

Dos o más casillas seguidas salen **en dos columnas**, como la lista del ETE. Una raya toma como
rótulo el párrafo que tiene arriba.

### Los tres botones de abajo

- **📋 Pegar texto de la institución** — abre un cuadro; al aceptar, **reemplaza** el texto del
  documento por el que se pegó (en una constancia, el texto libre; en un consentimiento, todas
  las preguntas por un solo bloque sin título). Entra siempre como **texto simple**: si el texto
  pegado tiene formato, negritas o etiquetas, se ven como letras y no como formato.
- **↩ Volver al texto original** — sólo en los cuatro incluidos. **Carga** el texto que viene con
  la app en el editor; recién «Guardar» lo deja. Para arrepentirse, «Cancelar».
- **Guardar** y **Cancelar**. Cancelar con cambios sin guardar pregunta antes de salir, y el
  nombre no puede quedar vacío.

## Agregar un documento propio

**«＋ Agregar documento»** pregunta si es una **constancia** o un **consentimiento** y abre el
editor con una plantilla. El consentimiento viene con cinco preguntas vacías orientativas —«¿Qué
es?», «¿Para qué sirve?», «¿Cómo se realiza?», «¿Qué riesgos tiene?», «¿Hay otras alternativas?
¿Qué pasa si decide no realizarlo?»— y las tres piezas tildadas. Al guardar se pregunta el
nombre, que es el que va a aparecer en el menú.

**Se pueden tener hasta DOS documentos propios.** Con dos, el botón queda apagado y la línea del
cupo lo dice; borrar uno libera el lugar.

En la declaración de un consentimiento propio, la app escribe **«el procedimiento»** y no el
nombre del estudio: no tiene manera de saber de qué procedimiento se trata. Si el nombre tiene
que aparecer, va en el texto que escribe la institución.

## Cómo se imprime un documento propio

Igual que los que vienen con la app: desde el **botón Documentos del Informe**, en la hoja
editable, con «Imprimir» y «Guardar en Imágenes». El texto corre de una hoja a la siguiente, la
declaración y la tabla de firmas salen **siempre juntas** —si no entran donde terminó el texto,
pasan completas a la hoja siguiente— y las hojas comunes van a continuación, aparte. El
encabezado lleva el logo y el nombre de la institución, y los consentimientos llevan la línea del
paciente.

## Llevar los modelos a otra computadora

- **⬇ Exportar modelos** baja un archivo `ecosmart_modelos_documentos_<fecha>.json` con **sólo
  los textos y las casillas**. No lleva datos de pacientes, ni el logo, ni el nombre de la
  institución.
- **⬆ Importar modelos** pide el archivo, lo **revisa entero antes de cargar nada** y pregunta
  antes de reemplazar. Si el archivo no es de EcoSmart, está dañado o trae más de dos documentos
  propios, **no se carga nada** y se dice por qué. Si se acepta, **reemplaza** todos los modelos
  de esta computadora por los del archivo.

## Lo que sigue valiendo de PANT-31

La hoja que se abre desde el Informe se puede **corregir a mano**, y esa corrección vale **sólo
para ese paciente**: el modelo de Configuración no se toca. Si los datos del estudio cambian
mientras la hoja está abierta, aparece «Actualizar con los datos» y nada se pisa hasta que se
toque ese botón.
