# Guía de prueba para el médico — tanda PANT-26 (2026-11-09)

Ocho pasos. Cada uno dice **qué cargar** y **qué mirar**. Todo se hace en un estudio de prueba:
nada de esto toca lo guardado.

---

**1 · La escena que reportaste.** Pestaña **Válvulas**, sección **Aórtica**: en morfología elegí
**TAVI** y cargá **velocidad máxima 4,5 m/s** y **gradiente medio 45 mmHg**. No cargues nada más.
Mirá el **informe** y el **EN SUMA**.
→ *Qué se mira:* el informe tiene que decir **«con posible estenosis (Vmax 4.5 m/s, G. medio 45
mmHg)»** en lugar de «sin datos suficientes para graduar la estenosis protésica», y el EN SUMA
**«TAVI con posible estenosis.»**, sin la palabra «protésica». Los dos números medidos siguen
entre paréntesis. Probalo en los tres estilos: conciso, estándar y narrativo.

**2 · Agregale el DVI.** Sobre la misma escena, cargá **Ø del TSVI 21 mm**, **VTI del TSVI 50 cm**
y **VTI aórtico 100 cm** (el DVI queda en 0,50, normal).
→ *Qué se mira:* al aparecer el eje independiente la aplicación **vuelve a graduar** y el informe
dice «con posible estenosis protésica», que es la frase de siempre. La frase del paso 1 sale
**sólo** cuando falta ese eje.

**3 · Elegí un modelo y mirá la cápsula.** Volvé a la escena del paso 1, agregá los dos VTI con
**40 y 100** (DVI 0,40) y un **Ø de TSVI de 16 mm**, y después tocá **«Modelo y tamaño»** en la
fila de morfología y elegí cualquier modelo.
→ *Qué se mira:* la **cápsula de severidad** tiene que cambiar **en el momento**, sin tocar nada
más, y decir lo mismo que el informe. Antes se quedaba con el veredicto anterior mientras el
informe ya decía otra cosa. Mirá también **«Ver detalle»**: ya no dice «no hay un modelo del
catálogo cargado», publica la desviación del área frente a la del modelo. Con **TAVI** el área
ahora **cuenta** para el veredicto, igual que con una prótesis quirúrgica.

**4 · Una TAVI con desajuste y sin velocidad ni gradiente.** Estudio nuevo. **TAVI**, peso 70 kg,
talla 1,70 m, **Ø del TSVI 16 mm**, **VTI 40 y 100**. **No cargues velocidad ni gradiente.**
→ *Qué se mira:* el informe **ya no dice «normofuncionante»**. Antes decía «prótesis transcatéter
tipo TAVI normofuncionante (DVI 0.40)» y en el renglón siguiente «Desajuste protésico-paciente
aórtico severo», dos frases que se contradecían. La línea del desajuste se queda, y el paréntesis
con el DVI también. *(Si ahora elegís un modelo del catálogo y el área queda a más de un desvío
estándar de la del modelo, la línea del desajuste deja de publicarse: es la condición que la tabla
le pone. El número sigue a la vista en la fila de pantalla.)*

**5 · La mitral.** Estudio nuevo, sección **Mitral**: morfología **Prótesis biológica**,
**velocidad pico de E 2,6 m/s** y **gradiente medio 14 mmHg**.
→ *Qué se mira:* cada **fila** muestra ahora el valor y su escala de referencia —«2.60 m/s (<1.9
normal · ≥2.5 significativa)»— y **ya no concluye**. La conclusión está **una sola vez**, en el
renglón del **resumen**, que es el que cuenta los criterios. Antes la fila de la velocidad decía
«sugiere obstrucción significativa» aunque esa fila no entra en el conteo.

**6 · Los dos globos ⓘ.** Abrí el **ⓘ de la prótesis pulmonar** (cargá antes una prótesis
pulmonar biológica con velocidad 3,5 m/s) y el **«Ver detalle»** de la aórtica con una **TAVI**.
→ *Qué se mira:* el de la **pulmonar** ahora declara que informar «posible obstrucción» con un
solo criterio alterado **es un criterio de la aplicación**; su cita de la guía sigue abajo. El de
la **TAVI** declara que los cortes de gradiente y de DVI son los de la prótesis quirúrgica y que
**eso también es criterio de la aplicación** — antes cerraba citando la guía, que no los publica.
Y en el **ⓘ del desajuste** vas a ver la condición nueva: el área dentro de un desvío estándar de
la del modelo.

**7 · El 3D de congénitas.** Pestaña de **Cardiopatías congénitas**: cargá una **CIA**, abrí
**«Ver en 3D»** y tocá el **ⓘ** del recuadro. Después cargá también un **espesor de
miocardiopatía hipertrófica** y mirá la **línea de abajo del dibujo**.
→ *Qué se mira:* el ⓘ tiene ahora **tres párrafos cortos** — qué es el diagrama, qué hace «Según
el estudio» y qué hace «Explorar» — y ya no dice que el dibujo no entra al PDF, que era falso. La
línea de abajo dice **«Cargadas y no representadas en este diagrama: MCH.»**: la misma lista de
siempre, sin la palabra «todavía».

**8 · Una válvula que la tanda no tocó.** Cargá una **prótesis tricúspide biológica** con
**gradiente medio 12 mmHg** y **THP 240 ms**, y mirá su cápsula y su línea del informe.
→ *Qué se mira:* **nada cambió**. Sus filas siguen publicando su propia lectura y su línea del
papel es la de siempre. Lo mismo vale para los catálogos de modelos, para el Excel —sigue en 457
columnas— y para el Laboratorio.
