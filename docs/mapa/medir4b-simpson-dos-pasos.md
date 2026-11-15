# Mapa — MEDIR-4b: el Simpson en dos pasos, los trazados entre vistas y el resultado integrado

Tanda **MEDIR-4b** (2026-11-15). Línea base **`74df0b6`** (cierre de MEDIR-4a). Sello
**`v20261115-0555`**, md5 **`c875ae0f`**.

Este mapa está armado por **nombre de función y de constante**, no por número de línea: la línea
cambia en cada edición, el nombre no.

El inventario del bloque 0 —con las cinco hipótesis medidas y el defecto **X1**— está en
`docs/INVENTARIO_MEDIR4B.md`. Lo que esta tanda **continúa** es el bloque D que **M4a-f** dejó
escrito.

---

## 1 · La ventana se elige UNA vez, al abrir la herramienta (A1)

| Pieza | Qué hace |
|---|---|
| `_simpIniciar()` | declara la ventana de la **ranura 0** al crear la sesión |
| **`_simpVentanaLibre()`** | la ventana que **ninguna otra vista** esté usando |
| **`_simpVentanaBloqueada()`** | ¿la ranura en curso ya tiene un contorno? |
| `medSimpsonElegirVista(v)` | el selector, endurecido |
| `medSimpsonSegundaVista()` | declara la **otra** apical en la ranura 1 |

⚠️ **NO HABÍA NINGÚN PROMPT QUE SACAR.** La hipótesis H2 decía que la ventana «se pide en cada
trazado»; medido, ni `_simpAceptar` ni `medSimpsonConfirmar` ni `medSimpsonElegirVista` abren un
cuadro de diálogo, y la sesión nacía con `nombres: [null, null]` — o sea con la ventana **sin
declarar para siempre**, rotulándose «por cantidad». **El hueco real era otro:** la ventana era
**opcional** y se podía cambiar **a mitad de un par**, dejando los dos contornos del mismo par
atribuidos a ventanas distintas. De `nombres` sale el rótulo de la fila de la tabla, así que el
médico habría visto una fila «A2C» cuyo contorno de diástole se trazó sobre la 4C.

⚠️ **`_simpVentanaLibre` LE PREGUNTA A LA OTRA VISTA Y NO A UN CONTADOR.** Con un contador, cerrar
la vista de la A4C y abrir otra dejaría a las dos en A2C. Recorre **las dos ranuras** de cada
vista, porque un biplano trazado dentro de una sola vista declara las dos; si no queda ninguna
libre devuelve la A4C y es el bloque B el que impide que dos ventanas iguales den un biplano.

⚠️ **Y SALTEA LA SESIÓN EN CURSO (`S === _simp`)**, para que al nacer no se cuente a sí misma. Por
eso `medSimpsonSegundaVista` **no la usa**: ahí devolvería la ventana que la ranura 0 de esa misma
sesión ya tiene. La segunda ventana de una vista es, por definición, **la otra apical**.

⚠️ **`medSimpsonElegirVista` DEJÓ DE EXIGIR QUE LA RANURA TUVIERA NOMBRE.** Su condición era
`_simpNombre(vista) && (P.d || P.s)`, así que una ranura **con** contorno y **sin** nombre —una
sesión restaurada— se renombraba igual, que es justo lo que sus dos líneas de comentario dicen que
no hay que hacer. Hoy la condición es sólo `(P.d || P.s)`.

**Dónde se ve:** el panel de cada vista dice «Ventana de este par: **A4C**» y, con un contorno
confirmado, «— ya no se cambia».

---

## 2 · La barra de dos pasos y el único «Listo» (A2, A3, C1)

| Pieza | Qué hace |
|---|---|
| **`_simpPasoChip(pfx, f, act, hecho, rot)`** | un paso: su tilde, su número, su acento |
| `_simpPanel()` | la barra, **una** línea de instrucción y el «Listo» |
| `medSimpsonConfirmar()` | confirma la fase **y la avanza** — ya existía |
| **`medSimpsonRehacer(f)`** | rehace **una** fase sin perder la otra |
| el oyente delegado de `[data-simp-paso],[data-simp-listo]` | el ruteo |

⚠️ **EL MECANISMO DE CONFIRMAR Y AVANZAR NO SE INVENTÓ**: `medSimpsonConfirmar` ya pasaba el
pendiente al par **y** daba vuelta la fase desde antes de esta tanda. Lo que se agrega es la barra
—para que el médico vea en cuál paso está y cuál ya hizo— y el poder rehacer uno sin perder el otro.

⚠️ **LOS IDS VAN PREFIJADOS**, y no es un detalle: esto se dibuja en el panel de **cada** vista, así
que un id sin prefijo quedaría **duplicado** con las dos abiertas y `getElementById` devolvería
siempre el de la primera — el botón de la vista B se vería y no haría nada.

⚠️ **Y EL RUTEO VA POR `data-simp-pfx`, NO POR LA VISTA ACTIVA.** `_V` fuera de un manejador
envuelto en `_vBind` es **siempre** `_vistaA`, así que un «Listo» que mirara la vista activa
confirmaría en la A estando parado en la B. El prefijo viaja en el atributo y el oyente resuelve la
vista con él.

⚠️ **UN SOLO OYENTE DELEGADO PARA LAS DOS VISTAS**, por lo mismo que el del globo ⓘ: el panel se
repinta **entero** en cada confirmación y un manejador por botón se iría con el nodo viejo.

⚠️ **NO LLEVA `disabled`.** Un control deshabilitado **no emite click**, así que el médico tocaría
el único control que tiene que **explicarle** por qué no puede y no pasaría nada. Lleva
`aria-disabled`, se ve apagado, y al tocarlo `medSimpsonConfirmar` dice qué falta.

### El «Listo» de rescate — y por qué el viejo botón no se retiró

⚠️ **`_simpPanel` SE DIBUJA SÓLO CON LA HERRAMIENTA SIMPSON ACTIVA** (`_medEstado`), así que
retirar «Confirmar trazado» del panel de abajo **reintroducía un defecto documentado**: con el
contorno de diástole trazado y sin confirmar, tocar «medir» en el cajón 2D pasa la vista a
Distancia, la barra de pasos se esconde **con su «Listo» adentro**, el médico cambia de cuadro,
`medReset` mata el pendiente y lo trazado se pierde. Lo cazó `/sharp-edges` en su momento.

La solución: `cine-simp-conf-u` **se conserva, con su id**, y se emite **sólo** cuando la barra de
pasos no está en pantalla para la vista que tiene el pendiente —`VP.medHerr !== 'simpson'`—. Hay
**un botón visible a la vez**, que es lo que «un único botón» quiere decir, y no hay estado en el
que confirmar sea imposible. Lo fijan **TC-896 (A2)** y **TC-257**, que hoy exige exactamente
**una** superficie en cada estado y por eso quedó más fuerte.

**Medido:** los dos pasos y el «Listo» en **44 px exactos**, **un** solo paso con el acento,
el peor contraste **5,96 de noche y 4,70 de día**, y la barra de **siete** botones de la vista
**intacta** —misma cantidad, mismo alto, mismo orden—.

---

## 3 · Los trazados conviven, y dos ventanas iguales no son un biplano (B1, B2, B3)

| Pieza | Qué hace |
|---|---|
| `V.simp` | **ya era** estado por vista (`_vNueva`) |
| `_vBiplanoDatos()` | el cruce A × B, al vuelo |
| **`_vBiplanoMismaVentana()`** | ¿las dos vistas declaran la misma ventana? |
| `_simpFilasVivas()` | la tabla, con el rótulo repetido **distinguido** |

**No hubo que agregar almacenamiento, y es la mitad falsa de H1.** Los trazados **no se pierden**:
`simp` es un campo de la plantilla de vista, declarado al lado de `medCalib` y `medCalibVel`, y
`window._simp` es un **accesor** sobre la vista activa. Los dos pares **coexisten** mientras las
dos vistas están abiertas. Lo que sí es cierto de H1 es que el **resultado** se calcula al vuelo:
las nueve claves de una sesión no incluyen el cruce, y dos llamadas dan lo mismo.

### X1 — el defecto que esta tanda cerró

`_vBiplanoDatos` tomaba `pares[0]` de cada vista **por posición** —«el de la vista A hace de 4C y
el de la B de 2C»— y **no miraba `nombres` en ningún momento**. Medido en el inventario: con `a4c`
declarado en **las dos** vistas seguía cruzando y publicaba **58,145 %**, *idéntica* a la del cruce
correcto, **sin un solo aviso**; y como `_simpFilasVivas` **deduplica por rótulo**, la fila de la
segunda vista **desaparecía**. El médico veía **una** monoplanar y un «Biplano» armado con la misma
ventana dos veces.

Hoy: `if (na && nb && na === nb) return null;`, más la línea de una sola oración que
`_vBiplanoPintar` dibuja, más el rótulo repetido **desambiguado** con el nombre de su vista
(«A4C» y «A4C · Vista B») en vez de descartado.

⚠️ **SI UNA NO ESTÁ DECLARADA, NO SE BLOQUEA**, y es a propósito: desde A1 toda sesión nueva nace
con su ventana, así que ese caso es el de una sesión vieja o restaurada, y ahí no se sabe si son
iguales o distintas. Bloquear por no saber le quitaría al médico un biplano que hoy tiene.

⚠️ **EN EL CASO NORMAL —una 4C y una 2C— LA DESAMBIGUACIÓN NO CAMBIA NADA**: los rótulos no chocan,
así que no se agrega nada y la etiqueta sigue siendo la que la ventana declarada le da, que es lo
que **TC-237** fija.

**Las cuatro decisiones provisorias, y cómo quedó cada una:**

| | Decisión | Cómo quedó |
|---|---|---|
| **(a)** | cerrar una vista descarta su trazado y el biplano desaparece; la que queda conserva su monoplanar | **ya pasaba**, y queda medido: `medApagar` anula el `simp` de la cerrada, el cruce devuelve `null` y la viva conserva su número |
| **(b)** | dos ventanas iguales: una línea y cada una su monoplanar | **implementada** — era **X1** |
| **(c)** | el rótulo «Vista B» de la que queda no se renumera | **sin cambios**, declarado en **M4a-a** |
| **(d)** | el Simpson de un cuadro por otra puerta sigue disponible; las fijas de «+ Vista» siguen sin Simpson | **sin cambios**, declarado en **M4a-d** |

**La calibración sigue siendo por vista** y no se mezcla: puesta en la A, la B sigue en `null`.
**Cero claves nuevas** en el almacenamiento del navegador — la única que aparece al trazar es
`ecosmart_autosave`, el autoguardado de la app.

---

## 4 · El resultado integrado y el globo ⓘ (C2, C3, C5)

| Pieza | Qué hace |
|---|---|
| **`_simpStat(rot, val, uni, bsa, col, gr)`** | un número grande con su unidad y su indexado |
| **`_SIMP_NOTAS_METODO`** | las **nueve** notas de método, en un solo lugar |
| `_vBiplanoPintar()` | los tres números, la clasificación, el ⓘ y el botón |
| `_simpTablaHTML()` | la tabla de tres filas — **ya existía** |
| `_simpUniTexto()` | lo que se queda en el panel |

**Los tres números GRANDES**, medidos por su tamaño computado: **20, 20 y 26 px**. La
clasificación sale de **`FEVI_CATS`** por `_simpClasificar` — **no se inventa un corte** —, y el
indexado de **`getBSA()`**, el dueño único; **sin peso o sin talla no se dibuja**, que es lo que
MEDIR-2 ya dejó escrito.

**La tabla de tres filas ya existía** (`_simpTablaHTML`, desde MEDIR-2): A4C, A2C y Biplano, con
ocho columnas en mL y mL/m². Lo que esta tanda hizo fue poner los números grandes arriba y sacarle
la prosa de método al pie.

⚠️ **`integrada` SE MARCA EN LAS DOS VISTAS TRAS INTEGRAR, Y `_simpEscribirFEVI` NO SE TOCÓ**: lo
que escribe, a qué campos y su pregunta antes de pisar un valor cargado quedan exactamente como
estaban, y sólo se lee lo que **devuelve**. Sin esa marca el panel decía «Todavía NO está en el
informe» después de integrarlo, porque esta puerta —la del cruce A × B— nunca ponía la bandera que
la otra sí ponía. Se marcan **las dos** porque el número salió de las dos.

### Las notas de método, en el globo

**NUEVE párrafos** en `_SIMP_NOTAS_METODO`, que contienen las **TRECE** frases del censo del
inventario. **Las trece están dentro del globo y ninguna quedó en el panel**, medido frase por
frase por **TC-898**.

⚠️ **VIVEN EN UNA CONSTANTE Y NO REPARTIDAS EN LOS TRES PINTORES**, que es de donde venían: la
misma nota estaba en `_simpUniTexto` y en `_vBiplanoPintar` con **dos redacciones**, así que el
médico leía dos veces lo mismo con palabras distintas.

⚠️ **Y ES DONDE «ASE/EACVI 2015» PUEDE ESTAR.** Hasta esta tanda ese nombre se imprimía **en la
pantalla**; la orden dice que los textos de la app no nombran guías y `CLAUDE.md` deja la guía, la
tabla y el folio **para el globo ⓘ**.

⚠️ **EL ⓘ SE EMITE TAMBIÉN EN `_simpUniTexto`** y no sólo en `cine-biplano`: con un monoplanar —o
con las dos ventanas iguales— ese panel no se dibuja, y las notas quedarían **sin puerta**.

**Lo que SE QUEDA en el panel, y es una decisión:** las **dos** advertencias que dependen de **este
paciente** —que los cuatro trazados salieron de la misma imagen, y de qué archivos salieron—. No
son notas de método sino un hallazgo sobre los datos en pantalla, y mandarlas a un globo que el
médico puede no abrir es esconder el único aviso de que el número de arriba **no** es un biplano.
Declarado en **M4b-b**. Se queda también la línea de que todavía no está en el informe, que es
operativa y va al lado de su botón, y la palabra «monoplanar» del rótulo.

---

## 5 · Qué NO se tocó

El cálculo del Simpson —discos, fórmulas, indexados—, `_simpEscribirFEVI`, «Guardar en
biblioteca», qué se guarda, los nombres entre el visor y la app, las coordenadas, la calibración,
los recortes y el zoom de las imágenes, la disposición y los siete botones de MEDIR-4a con su corte
de 1369 px, la casilla de Anahí ya retirada, **la tabla de medidas** (queda tal como la dejó
MEDIR-4a, con su marca de origen por fila), el conector, el papel, el PDF, el PPT y el Excel.

**Ningún campo del informe se escribe en esta tanda** — eso es MEDIR-4c.

**El contrato numérico**, medido sobre insumos sembrados (ver **M4b-a**): VFD monoplanar
**49,362027**, VFS **20,03344**, FEVI **59,41528**; VFD biplano **43,875814**, VFS **18,327059**,
FEVI **58,229699**; **20** discos; las dos clasificaciones en «normal».

---

## 6 · Cobertura

| Caso | Qué fija |
|---|---|
| **TC-896** | bloque A entero: A1, A2 y A3. Cae por **19** condiciones contra la base |
| **TC-897** | bloques B y C: B1, B2, B3a, B3b, C1 y C2. Cae por **19** |
| **TC-898** | el contrato numérico, las trece notas en el globo y la integración. Cae por **4** |

**Seis adaptados**, cada uno con su motivo donde vive la condición: **TC-257** (más fuerte),
**TC-190** (tres condiciones), **TC-191**, **TC-237** (invertida), **TC-228** (invertida en dos
mitades y partida en tres) y **TC-245** (ruta y denominador; **pasa en los dos árboles**, declarado
en **M4b-c**).

Las sondas: `scripts/_probe_medir4b0.mjs` (el inventario) y `scripts/_probe_medir4b.mjs` con su
cuerpo en `scripts/_probe_medir4b_cuerpo.js`.

⚠️ **EL CUERPO DE LA SONDA VIVE EN UN ARCHIVO APARTE, y es una mejora de método de esta tanda.**
Dentro de un template literal un acento grave en un comentario lo cierra antes de tiempo, y cuando
lo que queda es JS **válido** `node --check` **no lo ve**. Esta casa lo pagó veintiocho tandas
seguidas; esta tanda lo pagó **cinco veces más**. Leído con `readFile` y pasado como texto, el
problema no existe.

El barrido es `scripts/_mut_medir4b.py` (**25** anclas, las 25 verificadas con `--anclas` antes de
correr). La **04** es la que **M4a-f** dejó pendiente: «Listo» confirma pero no pasa a la sístole.
