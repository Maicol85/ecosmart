# Mapa — la escala de velocidad de un Doppler espectral (tanda P10, 2026-11-21)

Por **nombre de función y constante**, no por línea. Sello `v20261121-2349`, md5 `7edbbe06`.

---

## 1. La fila de la línea de cero — `_dcmImgBaseY`

**Dueño único.** Devuelve `RegionLocationMinY0 + ReferencePixelY0`, o sea
`(0018,601A) + (0018,6022)`. Lo leen:

- `_dcmImgVelocidadEn(r, y)` → `(rvy||0) + (y − _dcmImgBaseY(r)) · dy`
- `_dcmImgEscalaVelDudosa(r)` → el chequeo de coherencia
- `_medVelClic` → la fila que guarda en `_medVels[i].ry0`, de la que sale la línea punteada que
  el visor dibuja hasta la base (en `_medPintar`)

**Por qué es un dueño único y no la cuenta escrita tres veces:** con la cuenta repartida, el día
que cambie una de las tres queda vieja — y el dibujo confirmaría el error en vez de delatarlo.

⚠️ **El estándar.** `ReferencePixelY0` **no es una fila de la imagen**: es un desplazamiento desde
el borde de arriba del recuadro. PS3.3 C.8.5.5, US Region Calibration Module, aclarado por el
Supplement 84 (2004). Para una región Doppler ese píxel es la línea de cero velocidad.

⚠️ **El defecto que cerró.** Leerlo como absoluto metía un **offset constante de `y0 · dy` cm/s**
en cada velocidad, que arrastraba la Vmax, los dos gradientes (`4V²`, el error entra al cuadrado)
y el VTI (`offset × tiempo`). Medido sobre el pendrive: de **22,8 a 292,1 cm/s**, mediana
**110,1**.

**NO afecta** el eje del tiempo (`_dcmImgMsEntre` usa una diferencia, el píxel de referencia se
cancela) ni las distancias 2D.

**La medición que lo decide**, en `scripts/_probe_p10regs.mjs` sobre 138 regiones con el eje Y en
cm/s: leído relativo, el cero cae dentro del recuadro en las **138 de 138**; leído absoluto, en
**71**. Y `rx0` cae en un borde del recuadro en **97 de 138** leído relativo y en **ninguna**
leído absoluto.

**La guarda:** `_dcmImgRegionVelocidad` exige además `isFinite(r.y0)`. Sin ella, un archivo roto
que omita `RegionLocationMinY0` (Tipo 1, o sea obligatorio) caería en una fila cero corrida por el
alto entero del recuadro en vez de en «acá no se mide velocidad».

---

## 2. El chequeo de coherencia — `_dcmImgEscalaVelDudosa` y `MED_ESC_DUDOSA`

Devuelve el motivo en una línea, o `null`. **Lo único que comprueba es que el cero caiga dentro
del recuadro del trazo.** Es el detector de la clase de defecto del punto 1: con la lectura vieja
disparaba en **67 de 138** regiones del pendrive, y con la corregida en **ninguna**.

⚠️ **Avisa, no rechaza.** Un equipo puede correr la línea de base fuera del recuadro para ganar
rango en un flujo de un solo sentido; ahí es un falso positivo. Rechazar le sacaría al médico una
medición buena.

⚠️ **No se aplica con la calibración manual puesta:** ahí la del archivo ya no se usa. La
precedencia la decide quien llama, igual que `_vtiVelCmsEn`.

**Quién lo consume:** `_vtiDe` (lo publica en `escalaDudosa` del resultado) y `_medVelClic`. Los
dos guardan la marca en su fila y llaman a `_medEscalaCartel`.

---

## 3. Los tres cuadros propios de EcoSmart

Los tres con el molde de `_medCalPedirMm` (P5): se crean al llamarlos y **se destruyen al
cerrarlos** —así no dejan ningún nodo que los barridos por sufijo de «Nuevo estudio» puedan
alcanzar—, Escape cortado **en captura** con `stopImmediatePropagation` (sin eso cierra el
**visor** con la medición a medio hacer), y todo entra por `textContent`.

| Función | Marca | Qué hace | ¿Devuelve promesa? |
|---|---|---|---|
| `_medCalPedirVel(cual)` | `data-med-calvel` | pide el valor de una marca del eje, con **selector de unidad m/s o cm/s** | **sí** — cm/s o `null` |
| `_medEscalaCartel(motivo)` | `data-med-escdud` | el aviso de escala dudosa, con «Calibrar a mano» y «Entendido» | **no** |
| `_medAviso(titulo, texto)` | `data-med-aviso` | los dos rechazos de la calibración, un botón | **no** |

⚠️ **Los dos últimos NO devuelven una promesa, y es deliberado.** La medición ya está hecha y
guardada cuando salen: informan, no deciden. Una promesa que sólo un clic resuelve es lo que
colgó la pasada de la tanda EQ hora y media en el lote 18.

⚠️ **`_medEscalaCartel` sale UNA vez por imagen** (`_medEscDudAvisado`, que `medCambioDeImagen`
repone). Con el aviso en cada trazo, el médico que mide cinco envolventes lo cierra cinco veces y
a la tercera lo cierra sin leerlo. La marca por fila queda igual en las cinco.

⚠️ **Ningún control de los tres lleva `id`.** El censo del estudio y el del Excel recorren
`input[id]` y `select[id]`: un campo con `id` entraría a las 457 columnas **por existir**. Se
alcanzan por sus atributos `data-`, que es además lo que permite que una prueba los maneje con el
gesto real.

---

## 4. La calibración manual — `_medVelClic`, `_medCalVelDos`, `_medVelCalEn`, `_medCalVelFrase`

`_medVelClic` es **`async`** desde P10. Las dos trampas que eso trae, las dos escritas al lado:

1. **La vista se captura ANTES del `await` y se vuelve a entrar en ella con `_vCon`.** `cv.onclick`
   va envuelto en `_vBind`, cuyo `finally` repone la vista anterior en cuanto vuelve la parte
   sincrónica: sin esto, calibrar en la vista B escribiría en la **A**. Con el `prompt` nativo el
   problema no existía porque bloqueaba el hilo.
2. **Se vuelve a mirar `_medCalibrandoVel` después del `await`.** Si mientras el cuadro estaba
   abierto la imagen cambió, `medCambioDeImagen` ya lo puso en falso. **Falla hacia NO calibrar.**

**Se pregunta el valor de CADA marca y no «la distancia entre las dos»**, que es lo que el pedido
decía: de dos valores salen la escala **y la posición del cero**, y una velocidad sin el cero no se
puede calcular —no es la diferencia entre dos puntos marcados, es la altura de **uno** sobre la
base—. Con la diferencia sola habría que pedir además dónde está el cero, que es justamente lo que
MEDIR-3 sacó porque la base no siempre entra en el recuadro.

`_medCalVelFrase()` es el **dueño único** de la frase: la dicen la confirmación del momento (el
toast) y el panel guía, que la consume con `escHtml` y le pone la negrita.

---

## 5. De dónde salió la escala, dicho en cada fila — `_vtiPanel`

Tres estados, y **se dice siempre**:

- `· escala del archivo` (gris)
- `· escala vel. a mano` (naranja)
- `· ⚠️ escala dudosa` (naranja, con el motivo en el `title`)

⚠️ **Antes la ausencia de la marca significaba «del archivo», y una ausencia no se lee**: una fila
sin marca y una fila de una versión vieja que no la traía se ven igual.

Y la procedencia **viaja hasta el botón que escribe en el informe**: arriba de
`#cine-vti-cargar` sale un renglón naranja si alguna de las **dos asignadas** se midió con escala
a mano o dudosa. Es el último lugar donde el médico la puede ver — de ahí en adelante los VTI son
dos números en dos campos.

---

## 6. Lo que NO se tocó

- **Ningún corte clínico, ninguna fórmula, ningún umbral.** La banda de VTI (0,5–150 cm) sigue
  igual; lo único que cambia en ella es su mensaje, que ahora nombra la escala y ofrece calibrarla.
- **El eje del tiempo.** Sigue saliendo siempre del archivo y sigue sin poder calibrarse a mano.
- **`_medCalVelDos` y `_medVelCalEn`.** La aritmética de la calibración es la de MEDIR-3.
- **Los `prompt` y `alert` del resto del visor.** Salieron sólo los del camino de calibración de
  velocidad, que es lo que esta tanda toca.
- **El Excel: 457 columnas, cero campos guardados nuevos**, por construcción.
