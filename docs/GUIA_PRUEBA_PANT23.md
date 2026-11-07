# Guía de prueba manual — tanda PANT-23 (2026-11-07)

Ocho pasos, **un dato por línea**. Abrí `index.html` en Chrome (o ecosmart.ceibomed.com cuando esté
publicada), ventana a **1440 px** de ancho salvo donde diga otra cosa. Empezá siempre con
**«Nuevo estudio» → «Continuar sin guardar»**.

Las dos cosas que esta tanda cambia son **dónde va el recuadro «Con lo contestado»** y **dónde se
abre el texto de un ⓘ**. Nada más: ni un texto, ni un número, ni una guía, ni un folio.

---

## A. El orden de los bloques en congénitas (pasos 1 a 3)

**1.** Pestaña **🫀 C. Congénitas** → sección **CIA / CIV** → en «Tipo de CIA» elegí **Ostium
secundum** y en «Diámetro máximo (mm)» escribí **18**.
→ Qué se mira: que la sección quede con datos, que es lo que hace aparecer su Evidencia.

**2.** Tocá **📋 Evidencia** (arriba a la derecha) y abrí **«Comunicación interauricular»**.
→ **TIENE QUE SALIR, de arriba hacia abajo:** los datos del estudio, las **preguntas** con sus
botones «Sí | No | ?», y recién **DEBAJO** el recuadro **«Con lo contestado»**, y más abajo el
**«ⓘ Ver detalle de la guía»** plegado y la **«ⓘ Bibliografía»**.
→ **Antes de esta tanda el recuadro salía ARRIBA de las preguntas**, que es lo que reportaste.

**3.** En ese mismo panel abrí también **«Comunicación interventricular»**, **«Ductus arterioso
permeable»** y **«Coartación de aorta»**, y después **«Prótesis aórtica»** (para esta última,
cerrá el panel, andá a **🔬 ETE → Válvulas** y poné la válvula **aórtica** en **Prótesis
mecánica**).
→ Qué se mira: que las cinco tengan **el mismo orden**. Las de prótesis ya lo tenían desde
PANT-21; las de congénitas son las que se corrigieron.

## B. El ⓘ de Hemodinámica, que es el que viste mal (pasos 4 a 6)

**4.** Cerrá el panel. Pestaña **〰️ Doppler** → «Onda E (cm/s)» **95**, «e′ septal» **6**,
«e′ lateral» **8**. Pestaña **▶️ VD / AD** → «TAPSE (mm)» **14**.
Después, en **💉 Hemodinámica**, tocá su botón **«📎 Integrar al informe»**.
→ Qué se mira: sin integrar el sector su sección de Evidencia no existe, que es la regla de
PANT-22.

**5.** Tocá **📋 Evidencia** y abrí **«Perfil hemodinámico — presiones y resistencias estimadas
por eco»**. Tocá el **ⓘ** de la fila **«Gasto cardíaco»**.
→ **La fila NO se tiene que mover ni cambiar de alto**, y el texto tiene que salir en un **cajón
que cuelga debajo de la fila**, ancho y legible.
→ **Antes de esta tanda esa fila pasaba de 43 a 637 píxeles de alto** y el texto se dibujaba en
una tira de 56 px de ancho, empujando todo lo de abajo.

**6.** Con ese cajón abierto, probá las tres formas de cerrarlo: tocá **el mismo ⓘ** otra vez,
tocá **afuera** del cajón, y apretá **Escape**. Después abrí un ⓘ y, sin cerrarlo, abrí **otro**.
→ Qué se mira: que cierre de las tres formas, que **quede una sola abierta** a la vez, y que el
panel siga respondiendo.

## C. Que nada más se movió (pasos 7 y 8)

**7.** En la misma Evidencia, abrí **«Estenosis aórtica»** (cargá antes «Vmáx Ao» **4,5** en
**🫀 Válvulas**) y tocá uno de sus ⓘ.
→ Qué se mira: que se comporte **exactamente igual** que el de Hemodinámica. Ésa es la sección
que elegiste como modelo y es la que **no se tocó**.

**8.** Angostá la ventana a **390 px** (o abrí la app en el celular), volvé a abrir el panel y
tocá algunos ⓘ de las secciones de los pasos 2, 5 y 7.
→ Qué se mira: que **no aparezca una barra de desplazamiento horizontal**, que el cajón **entre
dentro del panel** y que ningún texto quede cortado.

---

**Lo que esta tanda NO cambió, y conviene confirmar de paso:** el informe en los tres estilos, el
EN SUMA, el PDF, el PPT y el Excel del Laboratorio son **idénticos** a los de antes —medido con el
PDF y el PPT generados de verdad sobre 114 escenas—, y **ningún texto del panel cambió**: lo único
distinto es el orden de los bloques y el lugar donde abre el ⓘ.

**Lo que quedó sin hacer, y es decisión tuya** (está en `docs/PENDIENTES.md` → **P23-a**): el
cajón **no tiene una X** de cierre —el de la estenosis aórtica tampoco la tenía, cierra de las
otras tres formas—, y el ⓘ de una fila sigue midiendo 14 px de alto, porque agrandarlo a 44
cambiaría el alto de la fila, que es justo lo que había que dejar quieto.
