# Guía de prueba manual — tanda PR5 (2026-11-23)

> Dieciséis pasos. Sello **`v20261123-SELLO`**. Abrí `index.html` en Chrome.
> Lo que esta tanda tocó: el valor esperado de los senos de Valsalva, las tres colas del bloque
> de bajo flujo / bajo gradiente de la estenosis aórtica, y el folio del cor triatriatum.

---

## A · El valor esperado de los senos (TAREA 1)

**1.** Pestaña **Paciente**: sexo **Masculino**, edad **50**, peso **80**, talla **175**.
Pestaña **AI / VI** → sección **Aorta torácica** → campo **Ao sinusal**: escribí **42**.
→ Debajo del campo tiene que aparecer, en letra chica y gris:
**«Esperado para edad, sexo y superficie corporal: 35,1 mm · medido 42,0 mm, +6,9 mm (z +2,65)»**.
Sin color de alarma y sin la palabra «dilatada».

**2.** Mirá la **pastilla** de ese mismo campo: tiene que seguir diciendo **«Dilatada (≥40mm)»**.
Este cálculo **no gradúa nada**: lo que gradúa es el corte por sexo de siempre.

**3.** Cambiá la edad a **14** → **la línea desaparece por completo**, sin ningún texto de «falta
tal dato». Volvé a **50** y reaparece.

**4.** Borrá el **sexo** → desaparece. Ponelo de vuelta. Borrá el **peso** y la **talla** →
desaparece. Ponelos de vuelta.

**5.** Borrá el **Ao sinusal** → tiene que quedar **sólo** «Esperado para edad, sexo y superficie
corporal: 35,1 mm», **sin** la diferencia ni el z. Volvé a poner 42.

**6.** Poné el Ao sinusal en **900** → la pastilla dice «Valor fuera de rango» y la línea vuelve a
quedar **sin** diferencia: un valor ilegible no produce un número que el papel publique.
Volvé a 42.

**7.** Cambiá el sexo a **Femenino**, peso **60**, talla **160** → el esperado tiene que bajar a
**30,9 mm**. Volvé a Masculino, 80 y 175.

## B · El papel

**8.** Pestaña **Informe** → **Generar Informe**. Buscá la oración:
**«Senos de Valsalva 42,0 mm (esperado 35,1 mm para edad, sexo y superficie corporal).»**
Tiene que aparecer **una sola vez**, y **no** tiene que nombrar ninguna guía, ni folio, ni clase,
ni la palabra «dilatada».

**9.** Mirá el **EN SUMA**: la frase **no** tiene que estar ahí.

**10.** **Exportar PDF** y buscá esa misma oración en el papel. Tiene que estar.

**11.** Borrá el **sexo** y volvé a **Generar Informe** → la oración **desaparece** del informe
(y del PDF).

## C · El globo y Referencias

**12.** Volvé a poner el sexo. En la sección **Aorta torácica**, tocá el **ⓘ** de «Cortes y
nomograma de la raíz aórtica». La tarjeta tiene que traer, **debajo** del gráfico y del corte de
dilatación, estos cinco bloques en este orden:
*De dónde sale el cálculo* · *Criterio de EcoSmart* · *Lo que dice la ESC 2024* · *Lo que dice la
ACC/AHA 2022* · *Lo que este cálculo no cubre*.
Y arriba de ellos, **«En este paciente el valor esperado es de 35,1 mm…»**.

**13.** Comprobá que en esos bloques estén los folios **3562**, **3565**, **3566**, **3603**,
**e344**, **e345** y **e350**, y las cifras **1.207**, **1,96** y **0,261 cm**.

**14.** Pestaña **Referencias** → sub-pestaña **Aorta** → abrí **«🩸 Aorta — Cortes por segmento y
nomogramas de los senos de Valsalva»**. Al final, antes de la bibliografía, tienen que estar **los
mismos cinco bloques** — pero **sin** la línea «En este paciente»: Referencias es material de
consulta.

## D · Las tres colas del bajo gradiente (TAREA 2)

**15.** **Nuevo estudio**. Sexo **Masculino**, edad **70**, peso **80**, talla **175**.
Pestaña **Doppler** → aórtica: **Ø TSVI 20**, **VTI TSVI 15**, **VTI Ao 59**, **Gmedio 28**,
**Vmax 3.4**. FEVI **60**. Pastilla de estenosis aórtica en **Severa**.
**Generar Informe** → la oración de la estenosis tiene que decir «de bajo flujo y bajo gradiente
paradojal» con su paréntesis de números completo, y **NO** tiene que decir
«Considerar score de calcio valvular por TAC».

Ahora, sobre la misma escena, estas tres variantes:

| Cambio | Lo que la oración dice | Lo que **ya no** dice |
|---|---|---|
| **Ø TSVI 24 · VTI TSVI 16 · VTI Ao 90**, FEVI 60 | «con bajo gradiente y **flujo normal**» | «Considerar medición incorrecta del TSVI» |
| los mismos tres, FEVI **40** | «y FEVI reducida … **No configura la forma clásica** de bajo flujo / bajo gradiente.» | «revisar el diámetro del tracto de salida y el trazado de las integrales…» |
| **Ø TSVI 20 · VTI TSVI 15 · VTI Ao 59**, FEVI **40** | «de bajo flujo y bajo gradiente (**BF/BG clásica**)» | — |

En las cuatro, el paréntesis con el AVA, el AVA indexada, la Vmax, el gradiente medio, el índice
adimensional, el volumen latido indexado y la FEVI tiene que seguir **entero**.

**16.** Y lo que **NO** se tocó: con la pastilla en **Moderada** y **Gmedio 55 · Vmax 4.6** sobre
esa misma escena, el informe tiene que seguir trayendo
**«El grado de estenosis aórtica consignado (moderada) no coincide con las mediciones del
estudio … Revisar el diámetro del tracto de salida y el trazado de las integrales
velocidad-tiempo.»** Esa línea **no** es del bloque de bajo gradiente y se conserva.

## E · El cor triatriatum (TAREA 3)

**17.** Pestaña **Otros** → **Variantes anatómicas** → tocá el **ⓘ** de **Cor triatriatum**.
En el bloque de abajo, la oración del gradiente tiene que decir que el umbral de 15 mmHg
**«aparece en el texto de apoyo de la recomendación de resección en el paciente asintomático
(folio e165) y no lleva clase ni nivel propios»**.
Y la línea de **fuente** tiene que publicar **«folios e163 a e165 —el umbral del gradiente medio,
en el folio e165—»** y **«folios 195 y 196 del original en inglés»**.
Lo que **se conserva**: el **«clase 2a, nivel B-NR»** de la recomendación del transesofágico, en su
propia oración.
