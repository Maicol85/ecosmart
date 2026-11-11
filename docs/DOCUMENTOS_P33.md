# Los documentos del Informe — manual del médico (PANT-33, 2026-11-10)

Lo anterior está en `docs/DOCUMENTOS_P30.md` (la hoja y los cuatro documentos que vienen con la
app) y en `docs/DOCUMENTOS_P32.md` (el cajón de Documentos en Configuración).

**Esta tanda reemplaza la parte de PANT-32 que explicaba cómo se edita.** Lo que sigue valiendo
de ahí son las tres advertencias del principio, que se repiten acá porque son las que importan.

---

## Lo primero, y es lo más importante

> **Los textos que vienen con la app son un MODELO.** Son un punto de partida razonable, no un
> documento aprobado por nadie. **La institución que los usa tiene que revisarlos** —con su
> asesoría legal si corresponde— antes de entregárselos a un paciente, y lo que se escriba o se
> pegue en la hoja es responsabilidad de esa institución. La app los imprime; no los valida.

> **Los modelos viven en el navegador de ESTA computadora.** No están en un servidor, no viajan
> con los estudios y no se comparten solos entre computadoras ni entre usuarios del mismo equipo.
> Si se limpian los datos del navegador, **se pierden**.
> ⚠️ **Y ahora no hay exportación**: el médico pidió que Configuración quedara mínima, así que
> «⬇ Exportar modelos» y «⬆ Importar modelos» ya no están. Si hace falta volver a tenerlas, se
> piden.

> **Los modelos no guardan datos de pacientes.** Lo que se guarda son los textos y las casillas.
> El nombre, el documento, la ciudad, la fecha, el logo, la institución y la firma del médico los
> pone la app al imprimir, desde los datos del estudio y de Configuración.

---

## Qué hay en Configuración → 📄 Documentos

Dos cosas, y nada más:

1. **El interruptor «Mostrar el botón Documentos en el Informe».** Apagado, el botón desaparece
   de la pantalla del Informe. No se borra ningún documento.
2. **La lista de los seis documentos**: la constancia, los tres consentimientos y dos
   **documentos en blanco**. Cada fila tiene el nombre, su etiqueta, el interruptor **Mostrar en
   el menú** y el botón **Editar**.

**Ocultar un documento sólo lo saca del menú del Informe.** No se borra nada: el texto que haya
escrito queda guardado, y volver a mostrarlo lo devuelve a su lugar en el menú.

No se agregan documentos y no se borran: son seis, fijos.

---

## Editar un documento: se escribe SOBRE LA HOJA

**Editar** abre la hoja grande, igual a la que se ve en el Informe, sobre toda la pantalla. Lo
que se ve es lo que va a salir impreso.

- **El texto del medio se escribe, se borra y se pega.** Se puede borrar todo y rehacerlo de
  cero.
- **El título de arriba también se edita**, es una línea más.
- **Lo demás se ve en su lugar y no se puede tocar**: el logo y el nombre de la institución, la
  línea del paciente, la fecha, la firma del médico y —en los consentimientos— la declaración del
  paciente, la tabla de firmas y las hojas comunes del final.
- **El paciente que se ve es de prueba** (María Fernanda Pérez). La institución y el logo son los
  suyos, los de Configuración.

### La barra de arriba

| botón | qué hace |
|---|---|
| **Guardar como modelo** | Guarda el texto como modelo de la institución. Desde ahí, cada vez que abra ese documento desde el Informe, sale así. La hoja queda abierta y el botón se apaga hasta el próximo cambio. |
| **↩ Volver al texto original** | Sólo en los cuatro documentos que vienen con la app. Carga el texto de fábrica en la hoja. **Para dejarlo hay que tocar Guardar como modelo**: si cierra sin guardar, el texto que tenía sigue ahí. |
| **?** | La ayuda con las formas de escribir. |
| **✕ Cerrar** | Cierra. Si hay cambios sin guardar, pregunta. |

**Escape** es lo mismo que Cerrar. **Tocar al costado de la hoja no cierra** (en el Informe sí,
acá no: está escribiendo).

### Las seis formas de escribir

El texto se escribe como texto, con seis marcas. **Las marcas se ven mientras escribe**, y en el
papel no salen: sale lo que cada una pide.

| escriba | sale |
|---|---|
| `## Un título` al principio de la línea | un **título de sección**, azul y numerado |
| `• Algo` al principio de la línea | una **viñeta** con sangría |
| `☐ Sí ☐ No Algo` al principio de la línea | una **casilla**. Varias seguidas se imprimen en dos columnas |
| `____` (cuatro guiones bajos o más, solos en la línea) | una **raya** para escribir a mano, con el párrafo de arriba como rótulo |
| `**algo**` | ese tramo en **negrita** |
| una línea en blanco | separa un párrafo del siguiente |

**Pegar** funciona: entra como texto simple, sin los colores ni las negritas del original, y
**conservando los renglones**.

### La constancia tiene una casilla propia

**Frase con los datos del paciente** (tildada de fábrica). Es la primera frase, la que dice «Se
deja constancia que [paciente], [documento], consultó el día de hoy…». Si la destilda, esa frase
desaparece y el texto lo escribe entero usted.

---

## Los dos documentos en blanco

Son dos hojas vírgenes: **no dicen nada**. Traen el encabezado (logo y nombre de la institución),
la fecha arriba a la derecha, el espacio del texto vacío y —si quiere— la firma del médico. Sin
título, sin línea del paciente, sin declaración y sin tabla de firmas.

Sirven para cualquier cosa que haga falta en papel: un pase, una indicación, una constancia que
no es la de la app.

Al editarlos, la barra suma dos cosas:

- **Nombre en el menú.** Lo que escriba ahí es lo que va a aparecer en el menú del Informe, en la
  lista de Configuración y como nombre de la miniatura al guardar en Imágenes. No puede quedar
  vacío.
- **Vaciar.** Borra el texto y el nombre, y deja el documento como vino. Pregunta antes.

**Incluir firma del médico** está en las **dos** barras, y son dos decisiones distintas:

- en **Configuración** decide con qué viene el documento (es parte del modelo);
- en el **Informe** decide para **ese** paciente, sin tocar el modelo.

**La firma nunca queda sola en una hoja.** Si el texto llena la hoja justo, la firma se lleva
consigo el último párrafo a la hoja siguiente.

---

## El encabezado

El nombre de arriba es **su centro de trabajo**, el que tiene cargado en **⚙️ Config → Médicos y
centros**. El logo va **a la derecha**; si no cargó logo, ahí va un círculo con las iniciales.

**Si no tiene centro cargado** aparece una línea gris que dice «Nombre de la institución». Esa
línea **no se imprime**: en el PDF y en la imagen ese espacio queda en blanco.

**En la hoja del Informe el nombre se puede corregir**, y vale sólo para ese paciente: no cambia
nada de la configuración. En la hoja de Configuración no se edita, porque el modelo es de la
institución y no lleva su nombre adentro.

---

## Lo que no cambió

- El botón **Documentos ▾** sigue en la misma fila del Informe.
- En el Informe, la hoja se sigue corrigiendo a mano para **ese** paciente, y eso **no** cambia el
  modelo.
- **🖼️ Guardar en Imágenes** e **🖨️ Imprimir** funcionan igual.
- Los cuatro documentos que vienen con la app, **sin editar**, imprimen **exactamente** igual que
  antes. Lo único que cambia en ellos es el encabezado: el logo a la derecha y el nombre tomado de
  su centro de trabajo.
