# Guía de prueba manual — PANT-30 (2026-11-10)

Ocho pasos. Cada uno dice **qué tocar**, **qué tiene que pasar** y **qué sería un defecto**.
Usá un paciente **ficticio**: estas pruebas generan papel.

---

## 1 · El botón y el menú

**Tocá:** pestaña **📝 Informe**. Mirá la fila de abajo de la tarjeta «✅ En Suma / Conclusión».

**Tiene que pasar:** hay **cinco** botones: «🔄 Regenerar Informe», «⬇️ Exportar PDF»,
«💾 Guardar Informe», «🔀 Modo comparativo» y el nuevo **«📄 Documentos ▾»**. Al tocarlo se
abre un menú con **cuatro** opciones, las cuatro activas: Constancia, y los consentimientos de
cardioversión eléctrica, ETE con sedación y test de burbujas. **Escape** lo cierra y el foco
vuelve al botón; un clic afuera también lo cierra.

**Sería un defecto:** que alguno de los cuatro botones viejos se haya movido o encogido; que al
abrir el menú los botones de al lado se corran; que haya una quinta opción de transtorácico o de
eco de estrés (no debe haberla); que alguna opción esté gris.

---

## 2 · La constancia, y el artículo del sexo

**Tocá:** cargá en 🧍 Datos el nombre, el documento (probá **CI**, **DNI** y **CPF**) y el sexo.
Abrí **Documentos → Constancia**.

**Tiene que pasar:** la hoja dice «Se deja constancia que **la paciente** [nombre], **CI**:
[número], consultó el día de hoy, [fecha de hoy], en [institución], para realizarse **un
ecocardiograma transtorácico**…». Los datos de la app se ven en **azul**. Abajo, bien separada,
la línea de firma con el nombre y la matrícula del médico **Principal** de ⚙️ Config.

**Probá los tres estados del sexo:** con **Femenino** dice «la paciente», con **Masculino** «el
paciente», y **sin sexo cargado** dice «**el/la paciente**» — no elige por vos.

**Probá el tipo de estudio:** marcá la casilla «Ecocardiograma Transesofágico» en la pestaña
🔬 ETE y volvé a abrir la constancia: ahora dice «un ecocardiograma **transesofágico**».

**Sería un defecto:** ver un `{{algo}}` sin reemplazar; que con el sexo vacío diga «el paciente»;
que el nombre del estudio no cambie con la casilla; que aparezca un «Dr.» que no cargaste.

---

## 3 · Editar la hoja, y que nunca se pise

**Tocá:** en la hoja abierta, hacé clic sobre el párrafo y **escribí algo**. Cerrá con la **✕** y
volvé a abrir el mismo documento.

**Tiene que pasar:** tu corrección sigue ahí.

**Ahora:** cerrá la hoja, cambiá el **nombre del paciente** en 🧍 Datos, y volvé a abrir el
documento.

**Tiene que pasar:** arriba aparece el aviso **«Los datos de la app cambiaron después de que
editaste la hoja»** con el botón **«Actualizar con los datos»**. La hoja **sigue como la
dejaste**: con tu corrección y con el nombre viejo. Recién al apretar ese botón se rearma con el
nombre nuevo, y tu corrección se descarta.

**Sería un defecto:** que la hoja se rearme sola, pisando lo que escribiste; que el aviso no
aparezca; que aparezca el aviso sin haber editado nada.

⚠️ **Lo que SÍ se pierde, y está declarado:** si **recargás la página**, las correcciones a mano
se descartan. No se guardan en ningún lado nuevo.

---

## 4 · Imprimir, y contar las hojas

**Tocá:** en cada uno de los cuatro documentos, **🖨️ Imprimir**. Se descarga un PDF.

**Tiene que pasar**, abriendo cada PDF:

| Documento | Hojas |
|---|---|
| Constancia | **1** |
| Cardioversión eléctrica | **2** (el consentimiento + «HOJAS COMUNES A LOS CONSENTIMIENTOS») |
| Test de burbujas | **2** (igual) |
| ETE con sedación | **3** (dos del consentimiento + la hoja común) |

Y además: el pie dice el título del documento y **«Página X de Y»** en **todas** las hojas; en el
ETE, **«Antes del estudio» arranca la hoja 2**; y en los tres consentimientos la sección
**«Declaración y consentimiento» y la tabla de firmas están en la MISMA hoja**, nunca partidas.

**Sería un defecto:** cualquier otro número de hojas; una hoja sin pie; la tabla de firmas sola
en una hoja; una casilla que salga como un cuadradito raro o como basura (tiene que ser un
rectángulo prolijo dibujado); un acento mal impreso.

⚠️ **Ojo con el test de burbujas:** cierra con **5,3 mm** libres. Si tu institución tiene un
nombre largo que envuelve a dos líneas, puede pasarse a dos hojas. Si eso te pasa, decilo.

---

## 5 · Guardar en Imágenes, actualizar y quitar

**Tocá:** primero prendé **⚙️ Config → 🖼️ Imágenes del estudio → «Guardar imágenes con los
estudios»**. Después **💾 Guardar Informe** (hace falta: hasta ahí el estudio no tiene
identificador). Volvé al Informe, abrí la **Constancia** y tocá **🖼️ Guardar en Imágenes**.

**Tiene que pasar:** abajo de la barra aparece «Guardado en «Imágenes» como «Constancia»…» y
aparece el botón **«Quitar de Imágenes»**. En **💾 Guardados → Imágenes guardadas** está la
miniatura, y al abrirla se lee la hoja.

**Probá el actualizar:** editá la hoja, volvé a tocar «Guardar en Imágenes», y mirá que en
Imágenes guardadas siga habiendo **UNA** miniatura de la constancia, con el texto nuevo — no dos.

**Probá el quitar:** tocá «Quitar de Imágenes». La miniatura desaparece y el botón se esconde.

**Probá los motivos:** apagá la casilla de Config, o probá sobre un estudio **sin guardar**, y
tocá «Guardar en Imágenes»: la app tiene que **decir por qué no puede**, no quedarse callada.

**Sería un defecto:** que queden dos miniaturas del mismo documento; que el documento aparezca
**dentro del PDF del informe** del paciente (no debe: no es una imagen del estudio); que no
guarde y no diga por qué.

---

## 6 · La sección nueva del Laboratorio

**Tocá:** **🔬 Laboratorio → Mediciones**. Bajá hasta **«🫀 Valvulopatías»**.

**Tiene que pasar:** justo **debajo** hay **«🔧 Prótesis valvulares»**, y debajo de ella sigue
«🔺 Doppler tricuspídeo». Abrila.

Arriba dice **«Se cuentan estudios, no pacientes: un paciente con varios controles se cuenta
varias veces»** y que los trastornos se leen del texto del informe. Después, cuatro bloques:

1. **Resumen** — tres tarjetas con el número y el porcentaje sobre el total del período.
2. **Por posición y tipo** — una barra horizontal por válvula (aórtica, mitral, tricúspide,
   pulmonar), con mecánica, biológica y TAVI apiladas, y **las reparaciones (plastia y TEER) en
   su propio tramo, separado**, con su rótulo.
3. **Modelos** — tabla de más a menos usado, con sus dos filtros (posición y tipo).
4. **Trastornos** — el total «Con alguna alteración» y una barra por conclusión.

**Sería un defecto:** que la sección esté en otro lugar; que las reparaciones se sumen a las
prótesis en la misma barra; que la tarjeta tenga una casilla de «PPT» (no debe tenerla).

---

## 7 · Que las cuentas cierren

**Tocá:** guardá varios estudios ficticios con prótesis de distintas posiciones y tipos —una
aórtica mecánica, una TAVI, una mitral biológica, una plastia mitral, un TEER— y volvé a la
sección.

**Tiene que pasar:** «Estudios con prótesis o reparación» = los que tengan cualquiera de las
dos; «Con prótesis» no incluye las plastias ni los TEER; «Con plástica o TEER» los cuenta
aparte. En la tabla de modelos, un modelo con **menos de 10 estudios** sale con un `*` y en
gris, con la nota **«Pocos casos: no alcanza para sacar conclusiones.»**. Los dos filtros
recortan la tabla y al limpiarlos vuelven todas las filas.

En **Trastornos**: «Sin datos suficientes» y «Hallazgo aislado, sin veredicto» aparecen
marcados **«(aparte)»** y **no** se suman a «Con alguna alteración».

**Probá el vacío:** poné el período en 30 días sin estudios con prótesis. Tiene que decir **«Sin
estudios con prótesis en este período.»** y **no** mostrar gráficos vacíos.

**Sería un defecto:** que una plastia cuente como prótesis; que un estudio con prótesis aórtica
alterada y mitral sana marque la mitral como alterada; que «Con alguna alteración» incluya los
dos de «(aparte)»; que con cero estudios queden los números del corte anterior.

---

## 8 · La sección en el PDF de auditoría

**Tocá:** **🔬 Laboratorio** → generá el **PDF de auditoría**.

**Tiene que pasar:** después de «Valvulopatías — distribución de severidad» y **antes** de
«Función VD (TAPSE)» viene **«Protesis valvulares»**, con la nota del denominador, el resumen, la
gráfica apilada, la tabla de trastornos con sus dos filas «(aparte)», y la tabla de modelos
**limitada a 15** con la línea **«y N modelos más.»** cuando hay más.

**Sin estudios con prótesis** la sección sigue estando pero dice sólo «Sin estudios con protesis
en este periodo.», sin ninguna tabla ni gráfica.

**Sería un defecto:** que la sección falte, que esté en otro lugar, que imprima más de 15
modelos sin declarar los que faltan, o que dibuje tablas vacías cuando no hay prótesis.

---

## Al terminar

Si algo no coincide, decí **qué paso** y **qué viste**. Tres cosas quedan declaradas de
antemano y **no** son defectos nuevos:

1. Las correcciones a mano de una hoja se pierden al **recargar la página** (**P30-a**).
2. El consentimiento del test de burbujas entra en una hoja con **5,3 mm** de margen (**P30-b**).
3. La fuente **no es condensada**: jsPDF no trae ninguna (**P30-c**).
