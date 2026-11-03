# PANT-4 — las dos estenosis aórticas, el papel de MCA, los textos contra su fuente, la Evidencia de aortopatías y los estadios

Mapa de la tanda **PANT-4** (2026-11-03). Como todos los de esta carpeta, está armado **por
nombre de función y de constante**, no por número de línea: la línea cambia en cada edición y el
nombre no.

---

## 1. Las dos estenosis aórticas — la alineación de sus campos

**Dónde:** la regla `.esa-grid`, justo debajo de `#tdf-campos, #esub-campos, #easv-campos`.
Las **cuatro** grillas llevan **las dos clases**: `class="grid-3 esa-grid"`.

**Qué estaba mal, y no era lo que parecía.** El médico lo vio como «campos de anchos distintos».
Medido en Chrome a 1440, 1000, 768 y 390 px, los tres controles de cada fila ya medían **igual**
—diferencia 0,0 px—. Lo que estaba corrido era la **línea de base**: el globo ⓘ de «Gradiente
medio» es un `inline-flex` de 44 px dentro del `<label>`, así que ese rótulo mide 44 px de alto y
su control bajaba **31 px** respecto de los otros dos de la misma fila; a 1000 px la diferencia
era de **44 px**, y en la fila de abajo un rótulo de dos líneas corría su control **13 px**.

**El arreglo es `subgrid` y no un número.** Cada `.fg` cede sus tres bandas —rótulo, control y
ayuda— a las filas de la grilla de afuera, así que los rótulos comparten alto, los controles
comparten línea de base y una ayuda chica no empuja a los vecinos. Fijarlo con un `min-height`
por banda sería un número a mantener sincronizado con la tipografía.

⚠️ **`minmax(0,1fr)` y no `1fr`:** con `1fr` el ancho mínimo de un `<select>` lo decide su opción
más larga, así que la columna «Tipo» puede ensancharse sola el día que se agregue una opción más
larga. Hoy no pasa, y así no puede pasar.

⚠️ **El `row-gap` va en la grilla de AFUERA.** Un subgrid ignora su propio `gap` en el eje
subgrillado y usa el del padre: sin esa línea, los 3 px entre rótulo y control pasarían a los
12 px del `gap`.

⚠️ **Por debajo de 768 px el subgrid se RETIRA, y lo pidió una medición.** Ahí la grilla ya cae a
una columna, así que no hay nada que alinear entre columnas y el `row-gap: 3px` pasaba a ser la
separación **entre campos**: los seis quedaban a 3 px uno del otro y la sección bajaba 27 px por
eso, que se lee como una mejora y es texto apretado.

| ancho | subaórtica antes → después | supravalvular antes → después | yDif antes → después |
|---|---|---|---|
| 1440 px | 289 → **293** | 276 → **281** | 31 y 0 → **0 y 0** |
| 1000 px | 308 → **337** | 296 → **313** | 44 y 13 → **0 y 0** |
| 768 px | 630 → **630** | 617 → **617** | 0 → 0 |
| 390 px | 644 → **644** | 631 → **631** | 0 → 0 |

Sonda: `scripts/_probe_pant4alin.mjs`.

---

## 2. El papel de las dos estenosis — `papel` y `suma`

**Los dueños:** `esubEstado()` y `easvEstado()` devuelven, además de lo que ya devolvían, dos
cosas nuevas:

- **`papel`** — la lista de **oraciones** del informe, una por tema y en orden lógico;
- **`suma`** — la **única** línea del EN SUMA.

Los dos emisores del informe —las dos IIFE de `etePars`— ya no redactan nada: hacen
`etePars.push(r.papel.join('. ') + '.')` y `sumaCC(r.suma)`. Las dos salidas se arman de las
**mismas piezas** que lee la pantalla, así que no pueden divergir.

**El orden de las oraciones.** Subaórtica: tipo (+ longitud del túnel) → gradiente medio →
gradiente pico → valor fuera de rango → obstrucción severa → Valsalva → insuficiencia aórtica.
Supravalvular: forma → gradiente medio → gradiente pico → fuera de rango → obstrucción severa →
ostios → síndrome → estenosis pulmonar.

**Qué queda FUERA del papel, y sigue en la pantalla:** el nombre de la guía, todo seguimiento y
toda derivación a cirugía, la interpretación clínica y las frases de dato faltante.

**La asociación principal del EN SUMA** sale de la prioridad que la propia lista de `alertas` ya
usa: en la subaórtica, la insuficiencia aórtica antes que el comportamiento con Valsalva; en la
supravalvular, los ostios comprometidos, después el síndrome, después la estenosis pulmonar. La
dilatación coronaria no entra, por la misma razón por la que su alerta no tenía línea de EN SUMA.

⚠️ **«Valor fuera de rango» SE QUEDA, y se declara.** No es el nombre de una guía, ni conducta, ni
interpretación, ni un dato faltante —el dato está y es implausible—, y es lo único que avisa que
un número cargado no se publicó.

**Tres frases preexistentes mal construidas, que destapó el A/B al imprimir la tabla de
combinaciones**, y una repetición: «Con la maniobra de Valsalva el gradiente sin cambios»,
«Insuficiencia aórtica asociada sin insuficiencia aórtica», «Ostios coronarios con compromiso de
los ostios» y la longitud que repetía «túnel subaórtico» dos oraciones seguidas. Las cuatro
corregidas; `ESUB_VALS_TXT` y `EASV_COR_TXT` quedan intactos para la pantalla, y el papel usa su
propio verbo y su propio mapa `COR_PAPEL`.

---

## 3. La conclusión de pantalla

`esubSync` y `easvSync` perdieron su fila **«Seguimiento»**, y las alertas perdieron la
interpretación quirúrgica. **Lo que se queda:** la pastilla «Sin gradiente medio no se gradúa la
severidad», la severidad con su guía —en pantalla sí se puede nombrar— y los dos cortes rotulados
de PANT-3, que viven en el globo `esub-grad`.

---

## 4. La Evidencia de las dos lesiones — `_indESUB` y `_indEASV`

Hasta esta tanda las dos lesiones **no tenían Evidencia**. `IND_SECS` pasa de **33 a 35**
secciones; las dos van pegadas a la coartación, que es donde el médico busca las otras
obstrucciones fijas del lado izquierdo.

**Las piezas:**

| nombre | qué |
|---|---|
| `ESUB_PREG` | las **siete** preguntas de la subaórtica |
| `EASV_PREG` | las **ocho** de la supravalvular |
| `_indObsPreg(PREG)` | el cuerpo común: las preguntas, el balance y la lista de lo contestado |
| `_indObsAplican(siDet)` | el bloque «Recomendaciones que aplican con lo contestado» |
| `OBS_NOTAS` | las tres notas del pie, iguales en las dos |

Rige la **ACC/AHA 2025** y la **ESC 2020** queda como línea de referencia (regla E-2), que es lo
que esta pestaña ya aplica a la CIA, la CIV y la transposición.

⚠️ **La línea de referencia de la ACC/AHA va dentro de `nota` y no de `ref`.** `_indPregNota`
imprime `ref` **siempre** con el prefijo «ESC 2020 (anterior)», y ese helper lo comparten la CIA,
la CIV, la transposición y la muerte súbita de la MCH: tocarlo movería las cuatro.

**Las cuatro hojas, leídas en imagen**, con su regla de folio comprobada en el pie impreso:
ESC 2020 inglesa (folio = hoja + 562) hojas 40 y 41 → folios 602 y 603; ACC/AHA 2025
(folio = e(hoja + 114)) hojas 52, 53, 55 y 56 → folios e166, e167, e169 y e170.

---

## 5. «Task Force 2010» fuera del papel de MCA

**Diecisiete frases reescritas**, cada una dejando el hallazgo y el número intactos. Las que
importan por dónde viven:

- `partes.push('Puntaje de criterios diagnósticos: ' + sc.total …)` — el informe;
- `l += ' — criterios diagnósticos ' + sc.total …` — el EN SUMA;
- **`resumen` y `resumenF`** — los lee la **hoja del PDF** y la **diapositiva del PPT**, no sólo
  el EN SUMA. **Las dos las encontró el A/B y no el censo**, porque el espía de jsPDF de
  `_probe_pant4tf.mjs` devolvió **cero** caracteres de PDF: un denominador vacío.

**El nombre queda en la pantalla:** el título de la sección, la fila «Interpretación Task Force
2010» y el rótulo de la tabla de categorías. **El Laboratorio y el Excel no se tocaron.**

---

## 6. Los tres textos contra su fuente

| texto | qué decía | qué dice la hoja | qué dice ahora |
|---|---|---|---|
| la resonancia (globo `mca-score` **y el papel**) | «estándar de referencia para la caracterización tisular del miocardio» | te Riele 2014, **hoja 7 de 15**: estándar de referencia para la **morfología y la función del VD**; la resonancia sola **no** es el patrón de oro; el realce tardío **no** está incorporado a los criterios | lo que la hoja dice, **con su cita** — cierra **P3-m** |
| el realce tardío (globo `mch-msub`) | ya decía lo correcto | AHA/ACC 2024, hoja 29, folio e1267: el realce **sí** aparece, pero **dentro** del cuarto factor mayor, y ninguno de los marcadores nuevos entra en la calculadora | gana esas dos precisiones |
| los cuatro rótulos de la Tabla 1 | sin morfometría, sin los 14 años, sin la condición del QRS, sin «configuración del TSVD» | te Riele 2014, Tabla 1, hoja 3 de 15 | los cuatro corregidos, en **las dos listas** (la tabla del marcado y `MCA_CATS`) |

⚠️ **Los cortes indexados NO se corrigieron y no hacía falta:** la app no los aplica y **ya lo
dice** en el globo `mca-eco`, con sus seis números. No es una afirmación falsa: es una ausencia
declarada, y aplicarlos sería un corte nuevo que la app usaría para calcular.

---

## 7. La Evidencia de aortopatías

**La cita reconciliada.** Los folios que `AO_EV_FTE` usaba —80, 111, 112, 113, 114, 116, 119,
121, 76 y 120— son los de `Mazzolai_2024_Aorta.pdf`, que tiene **199 hojas** y es **otra edición**
de la misma guía; el registro de citas y `FUENTES.md` usan la **inglesa de 163 hojas** con
«folio = hoja + 3537». Las quince entradas se unifican a la inglesa, con **hoja y folio**.
**Regla comprobada en cinco hojas:** 101 → 3638, 103 → 3640, 105 → 3642, 107 → 3644, 111 → 3648.

**La situación que faltaba.** De las que la orden lista, la única sin Evidencia era la
**insuficiencia aórtica con aorta dilatada**. Entra como **bloque aparte** y no como una novena
situación de `AO_EV`, porque `derivada` elige **una sola** y la insuficiencia aórtica no excluye a
ninguna: un paciente con Marfan y una insuficiencia severa tiene que ver las dos. Se abre con
`ia_grado === '4'` **y** aorta dilatada.

---

## 8. Los estadios — `_indEstEA` y `_indEstIA`

El estadio A, B, C o D se muestra **sólo en la Evidencia**, rotulado «AHA/ACC 2020», en la lista
**clínica** y no en la de datos del eco: lo que separa C de D son los **síntomas**.

| pieza | qué |
|---|---|
| `IND_EST_FTE` | el nombre del documento |
| `_indEstFila(e)` | la fila, igual para todas las válvulas |
| `_indEstSint(clave)` | lee la pregunta de síntomas que la sección **ya tiene** |
| `_indEstEA()` | Tabla 13, hoja 20, folio e91 |
| `_indEstIA()` | Tabla 15, hoja 34, folio e105 |

**Lo que no se infiere:** sin los síntomas, «C o D, según síntomas»; sin el dato que separa dos
subestadios, se dice cuál falta. El grado «moderada-severa» de la insuficiencia aórtica, que la
tabla **no tiene como fila**, sale como «B o C, según la severidad».

⚠️ **Una diferencia de corte que se declara y no se resuelve:** el estadio C2 de la insuficiencia
aórtica usa una fracción de eyección del **55 % o menos**, y la app usa el **50 %** para su
indicación. Son dos preguntas distintas y la tabla publica la suya.

⚠️ **AL MEDIR, EL GRADO VA DESPUÉS DEL GRADIENTE.** La app reclasifica `ea_grado` desde la
velocidad máxima en cuanto ésta cambia, así que una escena de bajo gradiente severo montada al
revés deja el grado en «moderada» y el estadio cae a B. **No es un defecto del estadio**: es el
dueño de la severidad haciendo su trabajo.

**Faltan cuatro válvulas** —estenosis mitral, insuficiencia mitral primaria y secundaria e
insuficiencia tricuspídea—, con su tabla, su hoja y su folio anotados en `docs/PENDIENTES.md`.

---

## 9. Las sondas y el arnés de esta tanda

| archivo | qué mide |
|---|---|
| `scripts/_probe_pant4alin.mjs` | la alineación de los campos en los cuatro anchos |
| `scripts/_probe_pant4evid.mjs` | las dos secciones nuevas del panel, con el panel maximizado |
| `scripts/_probe_pant4tf.mjs` | el censo de «Task Force» en las superficies de papel |
| `scripts/_probe_pant4alto.mjs` | el alto de MCA y de Fallot, con y sin datos |
| `scripts/_probe_pant4ab.mjs` | el A/B de superficies, 26 escenas con PDF y PPT de verdad |
| `scripts/_probe_pant4wk.mjs` | Chrome y WebKit, cuatro anchos y dos temas |
| `scripts/_mut_pant4.py` | el barrido de mutaciones dirigidas |

⚠️ **Dos trampas de medición que esta tanda pagó.** La grilla de las preguntas del panel es
`[data-ind-pregcols]` y **no** `[data-ind-compacta]`, que es el contenedor de toda la sección:
medirle los hijos da siempre una columna. Y MCA y Fallot viven en **«CC frecuentes»**
(`tab-congenitas`), no en «CC complejas»: abrir la sub-pestaña que no es deja la sección con un
rect de 0×0, que se lee igual que «la pantalla no existe».
