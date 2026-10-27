# Guía de prueba manual — tanda D

Abrí `ecosmart/index.html` en Chrome. El pie tiene que decir **v20261027-1826**; si dice otra
cosa, recargá con ⇧+recargar (es una pestaña vieja servida de caché).

## A · La calculadora de riesgo CV — pestaña ❤️ Cardio-Oncología

1. Abrí **🧮 Calculadora de Riesgo CV**. En la cuarta columna, «Fármaco», elegí
   **Trastuzumab / Anti-HER2** y no toques ninguna casilla.
   → Tiene que decir **Riesgo BAJO**. (Antes decía alto o muy alto: ése era el error.)
   → El seguimiento tiene que decir **«cada 3 meses»**, nunca «cada ciclo».
   → No tiene que aparecer ninguna línea de derivación.
2. Bajá a **📊 Datos basales** y mirá el campo «Fármaco oncológico»:
   → Tiene que mostrar **Trastuzumab / Anti-HER2** y **no se puede editar**. El selector es uno
     solo y vive arriba.
3. En «Datos basales», cargá **Dosis acumulada antraciclinas = 240**.
   → La calculadora pasa a **Riesgo ALTO**, con la línea «Hay una dosis de antraciclinas cargada
     junto al anti-HER2», y aparece **«Derivación a cardiología antes de iniciar el tratamiento,
     salvo urgencia oncológica»**.
4. Borrá la dosis. Cambiá el fármaco a **Antraciclinas** y tildá **«Arritmia previa (FA, aleteo,
   TV o FV)»**.
   → Sigue en **BAJO**: en la columna de antraciclinas esa fila de la tabla no suma.
   → Ahora cambiá el fármaco a **Trastuzumab**: con la misma casilla pasa a **MEDIO**. Ésa es la
     diferencia que un puntaje único no puede representar.
5. Destildá la arritmia y tildá **«Insuficiencia cardíaca o miocardiopatía previa»**.
   → **MUY ALTO** con cualquiera de los dos fármacos.
   → Cambiala por **«Infarto, angioplastia o cirugía coronaria…»** → **ALTO**.
6. Con **Antraciclinas**, tildá **sexo femenino** y **GLS basal deteriorado**.
   → Siguen en **BAJO**, y aparece la línea **«No puntúan con este fármaco: …»**. En la columna
     de puntos de esas dos filas vas a ver un **guion**.
7. Elegí **Inmunoterapia (ICI)** y tildá HTA y diabetes.
   → Aparece **«Puntaje propio de la aplicación; la guía no lo define para este fármaco»** y
     **ningún calendario**. Con **Anti-VEGF** el texto cambia a «…todavía no se aplica la tabla
     de la guía para este fármaco».
8. Tocá el globo **ⓘ** del encabezado de la calculadora.
   → Ahí están las **clases y los niveles** (I·C, IIb·C) y las citas de la guía. En la pantalla
     no tiene que aparecer ninguna.
9. **El de limpieza**: con una casilla tildada, mirá que «Datos basales» muestre la banda.
   Ahora **destildala** y no toques nada más.
   → Las **dos** cajas tienen que quedar vacías. Antes la de abajo —que es la que baja al PDF y
     al PPT— se quedaba con la banda del paciente anterior.

## B · El score de amiloidosis — pestaña 🧬 Amiloidosis

10. **Sin abrir la pestaña de amiloidosis**, cargá en las otras pestañas: septo 16, pared
    posterior 14, DDVI 42, TAPSE 16, onda E 90, e′ septal 4, e′ lateral 6 y strain −12.
    Después abrí 🧬 Amiloidosis.
    → El score tiene que estar en **7/10** con cuatro criterios tildados solos, y el badge de HVI
      en **«✅ HVI ≥12mm (16.0mm)»**.
    → Abajo del puntaje, la línea gris dice que **el cociente ápex/base no se marca solo** y por
      qué.
11. Mirá la pestaña **🔬 Algoritmo diagnóstico**: el campo «Score Amiloidosis por ETT» tiene que
    decir **7** solo. **El botón «→ Pasar score al Algoritmo» ya no existe.**
12. Tocá la fila del **TAPSE** para destildarla.
    → Baja a **5/10**. Esperá unos segundos y movete por la app: **no se vuelve a marcar**. Esa
      decisión tuya se respeta y sobrevive a guardar y reabrir.
13. Con un estudio nuevo, escribí **TAPSE 15** en el calculador del criterio de amiloidosis.
    → Andá a la pestaña del ventrículo derecho: el TAPSE **tiene que decir 15**.
14. Ahora al revés: estudio nuevo, cargá **TAPSE 21** en el ventrículo derecho y después escribí
    **15** en el calculador de amiloidosis.
    → El 21 **no se pisa**, y la línea gris avisa: «No coinciden con lo cargado en el estudio, y
      no se pisó: TAPSE (acá 15, en el estudio 21)».
15. Tocá el **ⓘ** del «Score multiparamétrico».
    → Se tiene que ver **entero**, sin cortarse, y decir que el score sirve para **cualquier**
      amiloidosis cardíaca (no sólo transtiretina), que se aplica con pared ≥12 mm, y que **por
      debajo de 8 no se descarta**.
    → El título del módulo ya **no lleva el apellido del autor**: dice «Score de amiloidosis por
      ecocardiografía». La cita completa está en el ⓘ y en Referencias.

## C · Lo que NO tiene que cambiar

16. Abrí cualquier estudio **sin** cardio-oncología ni amiloidosis y generá el informe y el PDF.
    → Tienen que salir **iguales** a antes. La única diferencia en todo estudio es **un
      encabezado del PDF**, que pasó de «SCORE DE PROBABILIDAD DE AMILOIDOSIS CARDÍACA —
      GARCÍA-PAVÍA 2021» a «SCORE DE AMILOIDOSIS POR ECOCARDIOGRAFÍA».
