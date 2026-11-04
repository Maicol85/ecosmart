# Guía de prueba manual — tanda PANT-7

Veintidós pasos, en el orden en que conviene hacerlos. Cada uno dice **qué hacer**, **qué tiene
que pasar** y, donde corresponde, **qué NO tiene que pasar**. Abrí `index.html` en Chrome.

El pie de la página tiene que decir el sello **`v20261104-0136`**.

---

## El dibujo de sobrecarga del VD (commit 1)

**1.** Andá a **Hemodinámica** → abrí **«Evaluación de sobrecarga del VD»**. Cargá: McConnell
«Sí», tabique en D «Sí», TAPSE 12, IT severa, velocidad máxima de la IT 4,2 y tiempo de
aceleración 45.
→ El dibujo aparece **a la derecha de los campos** y mide más o menos **un cuarto del ancho**, no
medio. Los campos ocupan todo el resto.
→ **No** tiene que quedar un hueco grande entre los campos y la lista «Criterios de sobrecarga
del VD»: hoy son 10 px.

**2.** Abrí **Válvulas** → el **esquema 2D** (el botón «Ver esquema»). Comparalo con el dibujo del
paso 1.
→ Los dos tienen que verse **del mismo tamaño** y con la **misma letra**.

**3.** Mirá los dos rótulos del dibujo del VD.
→ Dicen **«Sg McConnell»** y **«SIV desplazado»**, cada uno **en una sola línea**, y no se pisan
entre ellos ni con el chorro de la insuficiencia tricuspídea.

**4.** Hacé **«Nuevo estudio»** y volvé a mirar el dibujo.
→ El contorno del corazón sigue dibujado y **no hay ni un solo texto**. El botón de pausa sigue
siendo el único control dentro de la caja.

**5.** Achicá la ventana a menos de 768 px de ancho.
→ El dibujo se **apila debajo** de los campos y ocupa todo el ancho.

---

## Los bordes de la CIA en el PDF (commit 2)

**6.** Andá a **ETE** → **«CIA / CIV»**. Marcá la lesión **CIA**. Cargá los cinco bordes: VCS 4,
aórtico 7, AV 10, VCI 12 y posterior 2. Tildá **«Incluir en el PDF»**.
→ Entre los botones del informe aparece el bloque **«En el PDF»** con la **miniatura del
diagrama de la CIA** y el contador en **1**.

**7.** Generá el **PDF**. Buscá la hoja del diagrama de la CIA.
→ Cada uno de los **cinco valores está escrito DENTRO de su sector** del anillo, con su sigla
arriba y el número abajo.
→ **No** tiene que haber ninguna línea de corrido debajo del dibujo con «VCS 4 mm (adecuado) ·
Aórtico 7 mm …».

**8.** Con la sección de la CIA **sin integrar al informe**, generá el PDF otra vez.
→ Debajo del diagrama aparece **una sola línea**: «Velocidad pico del jet N m/s». Nada más.

**9.** Ahora **integrá** la sección al informe y generá el PDF.
→ Esa línea **ya no está** —el párrafo de arriba ya dice la velocidad del jet—, y el centro del
diagrama sigue mostrando la dirección del shunt y el Qp/Qs.

**10.** Guardá el estudio, hacé **«Nuevo estudio»** y volvé a abrirlo desde **Guardados**.
→ **Este es el paso que no se pudo medir desde el arnés** (`P7-h`): los cinco bordes y la casilla
«Incluir en el PDF» tienen que volver como estaban, y el bloque «En el PDF» tiene que volver a
contar **1**.

---

## Los globos y el signo 60/60 (commit 3)

**11.** Andá a **VD / AD** y tocá el **ⓘ** del **TRVI** (tiempo de relajación isovolumétrica).
Después andá a **Doppler** y tocá el **ⓘ del TRVI de ahí**.
→ **Los dos abren.** Antes el de Doppler no abría.

**12.** Andá a **Pericardio** y tocá el **ⓘ de la pleura**; después andá al **posoperatorio** y
tocá el **ⓘ de la pleura de ahí**.
→ **Los dos abren.**

**13.** En **VD / AD**, tocá el **ⓘ del índice de Tei**.
→ Dice la fórmula, los cortes **por Doppler tisular y por pulsado con sus cuatro grados**, las
limitaciones, y **muestra** que la otra guía marca otros cortes sin resolver la diferencia. Lleva
el botón **«Ver referencia»**.

**14.** Cargá el **tiempo de aceleración pulmonar en 59** ms.
→ El rótulo del campo **y** el de su fila en «Criterios de sobrecarga del VD» se ponen
**naranjas y en negrita**.
→ **No** tiene que cambiar nada más: el selector del signo 60/60 sigue en «No evaluado», el score
sigue en «—» y el informe no gana una palabra.

**15.** Poné el tiempo de aceleración en **60** exactos, y después **borralo**.
→ En los dos casos los rótulos **vuelven al color normal**.

**16.** Contestá el selector del signo 60/60 en **«No»** y volvé a poner 59 ms.
→ Los rótulos se pintan, pero **el selector sigue diciendo «No»**: el resalte no contesta por vos.

**17.** Tocá el **ⓘ del signo 60/60** y mirá la **barra del tiempo de aceleración** en
Referencias.
→ El globo dice las **dos** condiciones y nombra la muesca mesosistólica; **no** dice la palabra
«positivo» ni recomienda nada.
→ La barra tiene **cuatro tramos** con los cortes **«60 ms · 80 ms · 105 ms»** y, debajo, una
nota de dos renglones que remite a Referencias.

---

## Los cuatro arreglos (commit 4)

**18.** Pasá la aplicación al **tema claro**. Andá a **ETE** → **criterios TEER**, **sin** elegir
el tipo de IM. Si venís de otro paciente, hacé **«Nuevo estudio»** primero.
→ La franja rosada **se lee**: dice «Definir tipo de IM para ver criterios específicos.» en rojo
oscuro. **No** tiene que quedar una franja con un borde a la izquierda y nada adentro.
→ Volvé al tema oscuro: la franja se sigue leyendo igual que antes.

**19.** Con **Hemodinámica vacía** —sin índice cardíaco ni presión capilar—, integrá el bloque al
informe y generá el PDF.
→ **No** aparece ninguna línea que diga «Perfil de Forrester (estimado por eco): no
determinable» ni «Perfil hemodinámico (estimado por eco): no determinable».
→ Cargá los datos para que el Forrester se resuelva: la línea **vuelve**, con su perfil.

**20.** Cargá una **CIV** con su velocidad y su presión arterial sistólica y mirá el informe.
→ Dice **«PSAP estimada por CIV N mmHg»**. **No** dice «PAPs».

---

## Las cuatro pantallas (commits 5 a 8)

**21.** Con la ventana en más de 900 px de ancho, mirá estas cuatro pantallas:

| pantalla | qué tiene que verse |
|---|---|
| **Score de Wilkins** (ETE) | los cuatro campos en **una sola columna** y la conclusión **al lado, a la derecha** |
| **Orejuela** (ETE) | la conclusión **arriba, al lado del dibujo**, sin el hueco grande que había |
| **Aorta del ETE** | los campos en **dos columnas** y la conclusión **a la derecha** |
| **Válvula aórtica bicúspide** | los campos en **cuatro columnas** cortas y el resumen **metido arriba**, junto a ellas |

→ Achicá la ventana por debajo de 900 px: las cuatro se **apilan**, campos arriba y conclusión
abajo, como antes.
→ En la bicúspide, entre 1200 y 1360 px el dibujo baja a su propia fila; desde 1360 vuelve al
costado. Las dos cosas son correctas.

**22.** En el **score de Wilkins**: cargá los cuatro criterios en la sección del **ETE** y andá a
mirar el juego de **cirugía**.
→ Tiene los **mismos cuatro valores** y el **mismo puntaje**. Cambiá uno en cirugía: el del ETE
lo sigue.
→ **Borrá** los cuatro en cirugía: los del ETE vuelven a «—» y los dos totales también.
→ **No** tiene que pasar nada de esto al abrir un estudio **guardado**: la copia sólo ocurre
cuando **vos** tocás un selector.

---

## Lo que esta tanda NO hizo, y es a propósito

- **El punto 10a** —las referencias del tronco de la arteria pulmonar, sus ramas y el tracto de
  salida del VD— y el **commit 11** —el molde de Evidencia de la válvula pulmonar y de la prótesis
  mitral—. Están en `docs/PENDIENTES.md` como **P7-a** y **P7-b**, con lo que ya quedó leído y
  verificado para que la próxima tanda no lo relea.
- **La profundidad de coaptación no se sincronizó** (`P7-c`): copiar el valor convertiría un
  criterio del TEER que hoy está **sin dato** en **no cumplido**, y es un criterio de exclusión
  que decide APTO / NO APTO. Falta conseguir Tamburino 2010.
- **Los dos cuadros de notas** de la orejuela y de la aorta del ETE **se dejaron** (`P7-d`): no son
  recuadros explicativos, son campos donde **vos** escribís y su contenido llega al informe. La
  pregunta es si querés **moverlos** o si te referías a otro recuadro.
