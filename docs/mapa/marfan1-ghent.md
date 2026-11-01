# Marfan — el score del Box 2, las siete reglas del Box 1 y la figura

Mapa de la tanda **MARFAN-1** (2026-11-01). Por nombre de función y de constante, no por línea.

Fuente única de lo clínico: **Loeys BL, Dietz HC, Braverman AC y cols., «The revised Ghent
nosology for the Marfan syndrome», J Med Genet 2010;47:476-485**, en
`~/Desktop/EcoSmart_Biblioteca_Fuentes/06_Aorta/`. **FOLIO = HOJA + 474**, comprobado en el pie
impreso de las hojas 3, 4, 5 y 6.

---

## 1 · El score sistémico — Box 2, folio 478

`MFS_SCORE` es el dueño único de los trece rasgos con su puntaje; `MFS_SCORE_MAX` **se suma de
la tabla** y no se escribe a mano, y `MFS_SCORE_CORTE` vale 7. `mfsScore(src)` es el dueño del
puntaje: lo leen la tarjeta, la figura, las reglas y el informe.

| rasgo | campo guardado | puntos |
|---|---|---|
| Signo de la muñeca y del pulgar | `mfs_muneca_pulgar` | los dos 3 · uno solo 1 |
| Pectus | `mfs_pectus` | carinatum 2 · excavatum o asimetría 1 |
| Pie | `mfs_pie` | retropié 2 · plano simple 1 |
| Neumotórax espontáneo | `mfs_neumotorax` | 2 |
| Ectasia dural | `mfs_ectasia` | 2 |
| Protrusión acetabular | `mfs_protrusion` | 2 |
| Proporciones del cuerpo | `mfs_proporciones` | 1 |
| Escoliosis o cifosis toracolumbar | `mfs_escoliosis` | 1 |
| Extensión reducida del codo | `mfs_codo` | 1 |
| Rasgos faciales (3 de 5) | `mfs_facies` | 1 |
| Estrías cutáneas | `mfs_estrias` | 1 |
| Miopía de más de 3 dioptrías | `mfs_miopia` | 1 |
| Prolapso mitral (todos los tipos) | `mfs_prolapso` | 1 |

**Máximo 20 exactos.** Los tres con alternativa son **excluyentes**: un campo de tres estados y
no dos casillas, porque con dos casillas marcar las dos sumaba 4 donde la fuente da 3.

### Los cinco defectos que esta tanda cerró, medidos contra el original

1. **La ectopia lentis sumaba 3 puntos y no está en el Box 2.** Es criterio diagnóstico aparte.
2. **El máximo decía 20 y los once rasgos sumaban 19.**
3. **Faltaban cinco rasgos** —proporciones, escoliosis, codo, facies, prolapso— y el retropié.
4. **«Que requiere cirugía» y «moderado»** son calificadores que esta revisión eliminó (folio 480).
5. **Los epónimos «Walker-Murdoch» y «Steinberg» no están en el artículo.** El único que la
   fuente sí trae es la **línea de Köhler**, en la protrusión acetabular, y ése se conserva.

### Un valor sin equivalente

`mfsScore` devuelve `sinEquivalente`: un token que el vocabulario no tiene —por ejemplo un
pectus «que requiere cirugía» de la versión anterior— **no se cuenta ni se convierte solo**. Se
muestra y se pide elegir de nuevo.

---

## 2 · Los criterios aparte

`MFS_APARTE`, seis selectores de tres estados (`''` / `'si'` / `'no'`), con el patrón de los
seis `vab_fr_*`: el tercer estado es el valor vacío. `mfsAparte(src, clave)` los lee.

`mfs_ectopia_lentis` · `mfs_historia_familiar` · `mfs_fbn1_causal` · `mfs_fbn1_ao` ·
`mfs_diseccion_raiz` · `mfs_sin_otros`

⚠️ **Las dos variantes de FBN1 son independientes y no se infiere una de la otra.** El Box 1 las
define por separado: la regla 2 pide la **causal** (Box 3, folio 479) y la regla 4 la **asociada
a la aorta**.

---

## 3 · Las siete reglas — Box 1, folio 477

`mfsReglas(src)` es el dueño único. Lo leen la tarjeta y la figura; **el papel no, por ningún
camino**.

| n | sin / con historia familiar | condiciones | asterisco |
|---|---|---|---|
| 1 | sin | raíz (Z≥2 o disección) **y** ectopia lentis | **sí** |
| 2 | sin | raíz **y** FBN1 causal | no |
| 3 | sin | raíz **y** puntaje ≥7 | **sí** |
| 4 | sin | ectopia lentis **y** FBN1 asociada a la aorta | no |
| 5 | con | ectopia lentis **e** historia familiar | no |
| 6 | con | puntaje ≥7 **e** historia familiar | **sí** |
| 7 | con | raíz (Z≥2 desde los 20 años, Z≥3 por debajo) **e** historia familiar | **sí** |

**Los asteriscos están en 1, 3, 6 y 7 — verificados glifo por glifo sobre la hoja 3.**

**Tres estados por condición**, y la regla es el `Y` de las suyas (`_mfsY`): cualquiera falsa →
no cumple; todas verdaderas → cumple; si no → sin dato. **Una condición desconocida no es una
condición falsa.**

### Lo que hay que saber antes de leer un estado

- **«Ao» no es sólo el Z**: el Box 1 lo define como el diámetro en los senos por encima del Z
  indicado **o la disección de la raíz**. Por eso la disección hace verdadera la condición sin
  mirar el Z, y en la regla 7 tampoco mira la edad. Lo decide `_mfsAo(src, zMin)`.
- ⚠️ **EL Z NO ES UN CAMPO GUARDADO DE ESTA APLICACIÓN.** El único que la app recoge vive en la
  tarjeta (`data-mf-z`, sin id) y no viaja con el estudio, censado el documento entero. Sobre un
  estudio **archivado** las reglas que dependen de él quedan en «sin dato (falta el valor del
  Z)» salvo que haya disección consignada. Ningún Z se calcula con una fórmula que la app no
  tenga. → `docs/PENDIENTES.md` **MF1-a**.
- La **edad** sale de `#edad` (`mfsEdad`), sólo lectura.
- ⚠️ **Con el formulario vacío las reglas 3 y 6 dicen «No cumple», no «Sin dato»**, porque el
  puntaje siempre es calculable: 0 es un número y 0 < 7. El porqué lo aclara con «con lo
  tildado». → **MF1-b**.

---

## 4 · La guardería y el préstamo

Los diecinueve campos viven en `#mfs-campos`, marcado estático dentro de la sección, y la
tarjeta los toma **prestados** con `_mfsPrestar` / `critMarfanColocar` y los devuelve con
`_mfsDevolver`.

**Por qué, y no es estilo:** `critAbrir` hace `innerHTML = render()`. Un campo que viviera dentro
de la tarjeta se destruiría al reabrirla —perdiendo lo cargado— y al abrir **otro** panel de
criterios. Mover el nodo no lo clona: hay **una sola instancia** de cada id en el documento, y
por eso la tarjeta y la figura no pueden mostrar datos distintos.

⚠️ **`_mfsDevolver` RECOGE los tres bloques ANTES de mover la guardería.** `critMarfanColocar`
deja cada bloque dentro de su hueco de la tarjeta, no dentro de la guardería: devolverla sola la
devolvía **vacía**. Lo encontró una medición, no la lectura.

⚠️ **`mfsCamposInit` NO vacía la guardería**: desde el commit 6 contiene también
`#mfs-bloque-figura`, que es marcado estático con el SVG. Un `removeChild` en bucle se lo
llevaría y nadie lo regenera.

---

## 5 · El papel

Lo emite el bloque de Marfan de `generarInforme`, con **su propia compuerta** y **no** colgado de
`marfanEstado().hayDatos`.

**Por qué:** `hayDatos` es «síndrome o diámetro o índice», así que un paciente con nueve rasgos
tildados y sin diámetro salía por ese `return`. Y extender `hayDatos` **no era la salida**: lo
lee el **Laboratorio** para contar un estudio como «Marfan/EHAT», así que sumarle los rasgos
metería en ese panel a todo estudio con una estría consignada.

Ejemplo medido, con nueve puntos:

> Score sistémico de 9 puntos (signos de la muñeca y del pulgar, pectus carinatum, neumotórax
> espontáneo, estrías cutáneas, miopía de más de 3 dioptrías). Ectopia lentis presente, historia
> familiar presente, variante de FBN1 causal presente, variante de FBN1 con asociación conocida
> a dilatación o disección aórtica ausente.

EN SUMA: `Score sistémico de 9 puntos.`

**No sale al papel**: la regla cumplida, la palabra diagnóstico, el umbral de 7, la categoría,
ninguna guía, tabla, clase ni folio, ni conducta.

⚠️ **El texto del papel de una opción no es siempre su rótulo.** La cuarta entrada de una opción
de `MFS_SCORE` es su texto para el papel: «Los dos signos» se lee bajo su rótulo y no dice nada
dentro de una oración. Lo cazó el A/B.

---

## 6 · El cuadro «Conducta aórtica» y su globo

`marfanEstado` separa **`txt`** —el contenido clínico— de **`cita`** —la atribución—, y las dos
salidas se arman de las mismas piezas, así que no pueden discrepar.

| dónde | qué |
|---|---|
| pastilla | el veredicto: «Cirugía indicada», sin la clase |
| «Fundamento» | `r.txt`: el síndrome, el diámetro y el umbral en milímetros |
| «Umbral de este síndrome» | los milímetros, sin las clases |
| globo `mf-conducta` (`_mfConductaInfo`) | la guía, la tabla, el folio, la clase y el nivel |

Las claves `cx_i`, `cx_iia` y `cx_iib` **no se tocan**: las lee el Laboratorio.

⚠️ **Un `dyn` de VINFO devuelve un NODO y no una cadena.** Con HTML, `_vInfoColocar` revienta en
su `try` y la tarjeta publica «No se pudo construir la tarjeta.».

⚠️ **El EN SUMA del estado `sin_sindrome` publicaba «ESC 2024»**, y era el único de los once
estados que llevaba una guía al papel. Retirado; su contenido queda en la cápsula y en el globo.

---

## 7 · Los veintiún globos

Cada rasgo declara su clave en `i:`; las entradas están en `VINFO` con prefijo `mfs-`. Dos más de
cabecera: `mfs-puntaje` y `mfs-reglas`.

⚠️ **El globo lleva `stopPropagation` y va DENTRO del rótulo.** La fila es un `<label>`: un botón
hermano queda igual dentro del área que marca la casilla, así que sin eso **abrir la ayuda
tildaría el rasgo**. Es el defecto que el score de amiloidosis pagó una vez.

**Donde el artículo no define algo, el globo lo dice y no lo completa.**

---

## 8 · La figura

Portada de `docs/3d/demo_marfan_figura_v1_concepto.html`, dibujo propio del médico y **excepción
expresa**: geometría, marcas, cambios de forma y lógica se copian tal cual.

- `mfsFigEstado()` deriva el estado **de los mismos campos**, en cada repintado. **No hay un
  objeto paralelo**, que es lo que hace que la tarjeta y la figura no puedan discrepar.
- `MFS_FIG_REG` son las quince marcas; `mfsFigMarcas` las pinta con el suavizado por cantidad.
- `_mfsFigTarget` / `_mfsFigTween` / `mfsFigFormas` son los ocho factores de forma.
- `mfsFigRefSync` clona el cuerpo en trazo punteado; `mfsFigAlt` escribe la alternativa de texto.
- Con `prefers-reduced-motion` el factor pasa a 1 y el parpadeo queda en `none`.

**No se copió:** el botón «Cargar un ejemplo», el selector del lado del neumotórax —el dibujo
muestra siempre el pulmón derecho— ni los textos de aviso.

⚠️ **La casilla «Superponer la figura de referencia» no es un campo**, y el guión medio **no
alcanza por sí solo**: `_noEsDelEstudio` va por PREFIJO. Hubo que agregar `mfs-fig-` a ese
barrido. Lo cazó una medición.

⚠️ **El SVG de las marcas se adopta parseado y no por `innerHTML`**, y se parsea en el espacio de
nombres de SVG a propósito.

**La figura vive sólo en pantalla**: no está en `PDF_DIAG_REG`, ni en `imgSlots`, ni en ningún
registro de esquemas.

---

## 9 · Cobertura

`TC-586` el score · `TC-587` las siete reglas · `TC-588` el papel y el round-trip · `TC-589` la
pantalla y los globos · `TC-590` la figura. Fichas en `docs/mapa/tests-fichas-586.md`.

Mutaciones: `scripts/_mut_marfan1.py`, dieciocho, **cada una declara su caso**.
Sondas: `_probe_marfan1inv` (inventario) · `_probe_marfan1score` · `_probe_marfan1reglas` ·
`_probe_marfan1papel` · `_probe_marfan1pant` · `_probe_marfan1fig` (contra la demo) ·
`_probe_marfan1ab` (A/B).
