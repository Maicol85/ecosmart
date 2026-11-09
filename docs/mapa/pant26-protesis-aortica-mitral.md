# PANT-26 — la aórtica protésica, la mitral y el 3D de congénitas (2026-11-09)

Mapa por **nombre de función y de constante**, no por línea: la línea cambia en cada edición.
Lo que esta tanda movió, y de dónde cuelga cada cosa.

---

## 1 · El repintado de la cápsula — `vModTrasElegir` (D8)

| pieza | quién |
|---|---|
| la función que faltaba | **`vModTrasElegir(pos)`**, definida justo antes de `vModElegir` |
| quiénes la llaman | `vModElegir` y `vModQuitar`, con el `typeof` que ya tenían desde PANT-19 |
| a quién repinta | **sólo `va`**, llamando a `calcEADetalle()` **pelada**, sin `typeof` |

**Por qué sólo la aórtica, y está medido:** de las cuatro posiciones, es la única cuyo veredicto
lee el catálogo — `eaProtEOAz` entra en `indep` de `eaProtVeredicto`. Censados `vmProtEOA`,
`vtProtObstr` y `vpProtObstr`: ninguno llama a `vModEsperados` ni a nada que lea el catálogo, así
que su cápsula no puede cambiar porque se elija un modelo.

**Por qué la llamada va pelada:** `calcEADetalle`, `vModElegir`, `vModQuitar`, `eaProtEOAz` y
`_eaProtPintar` viven en el **mismo** bloque de `<script>` —el 12 de los 19 inline— y
`calcEADetalle` es una declaración de función, o sea está izada. Con un `typeof` que no empareje
volveríamos al defecto que esto arregla: **caer en silencio**.

**El defecto que cerró**, medido en los cuatro momentos con el recuadro `caja-esten-aortica`
visible: con el modelo cargado el informe ya decía «criterios que sugieren estenosis protésica
significativa» y la cápsula seguía diciendo «Posible estenosis protésica», con el plegable
publicando «no hay un modelo del catálogo cargado».

---

## 2 · El área efectiva frente a la del modelo, también en la TAVI (D2)

**Un solo dueño: `eaProtEOAz()`.** Lo único que cambió es su **primera** condición, que pasó de
dos cadenas escritas a mano a preguntarle a **`valvEsProtesis(morf)`**, el dueño único de «qué
token es una prótesis» sobre `VALV_PROT_OPCIONES`.

| lo que NO cambió | |
|---|---|
| los cortes | **`EA_PROT_EOA_Z = { normalMin: -1, signifMax: -2 }`** |
| las otras tres condiciones | modelo **y** tamaño del catálogo (no el manual), desvío mayor que cero, `ava_cont` sin la marca «(revisar)» |
| dónde entra | `nv.eoa` → `indep = [nv.dvi, nv.eoa]` de `eaProtVeredicto` |
| el catálogo | lo elige `vModCatalogo('va')` **por la morfología**, y ya devolvía `PROT_CAT_TAVI` con TAVI |

El retorno de `eaProtEOAz` ganó **dos campos**: `via` (`'TAVI'` o `'SAVR'`) y **`dentro1DE`**, que
es la condición de la Tabla 7 y se explica abajo.

⚠️ **La atribución a la Tabla 5 es sólo de la quirúrgica.** La fila «EOA §» que expresa el área en
desviaciones estándar respecto del modelo está en el bloque **SAVR**; para TAVI la tabla publica
su propia fila, de cambio respecto de un basal. La salvedad de pantalla cierra, por vía:

- **SAVR** → «Es el eje independiente del flujo que la Tabla 5 expresa así.»
- **TAVI** → «La comparación del área efectiva con la referencia del modelo es un criterio de la
  aplicación.»

⚠️ **En `PROT_CAT_TAVI` no hay un modelo sin desvío:** sus **9** modelos y sus **26** celdas de
área lo traen. El único camino sin desvío de la TAVI es el **modo MANUAL**, que construye sus
valores con desvío `null`.

---

## 3 · La condición de la nota al pie de la Tabla 7 — el desajuste (D7)

| pieza | quién |
|---|---|
| la constante | **`EA_PROT_PPM_SD = 1`**, con su cita al lado |
| dónde se calcula | `eaProtEOAz` → `dentro1DE: Math.abs(z) <= EA_PROT_PPM_SD` |
| quién lo publica | `eaProtVeredicto` → **`ppmDentro1DE`** |
| quién lo consume | el `if` del bloque del informe, junto a las dos condiciones que ya tenía |

```js
if (_eaProtP && (_eaProtP.ppm === 'moderado' || _eaProtP.ppm === 'severo')
    && _eaProtP.nivel !== 'signif' && _eaProtP.ppmDentro1DE) { … }
```

**La fuente, leída en imagen a 400 ppp:** hoja **19** del PDF de la ASE 2024 de prótesis, folio
impreso **20** comprobado en la **cabecera** («20 Zoghbi et al — Journal of the American Society
of Echocardiography, January 2024»). La Tabla 7 es «Doppler parameter criteria of aortic valve and
mitral valve PPM» y el asterisco de sus dos filas —«Aortic EOA\*» y «Mitral EOA\*»— remite a una
sola nota, textual:

> \*Valve structure and motion are normal; measured EOA is within 1 SD of the reference EOA.

**Sin modelo o sin desvío vale `true`**, o sea el papel es el de siempre: la condición sólo se
puede comprobar cuando hay con qué. **Falla hacia lo de siempre y no hacia el silencio.**

⚠️ **La fila de pantalla no se toca**: sigue publicando la AEO indexada con su categoría. Lo que
se retira es la **oración**, y **no se escribe nada en su lugar**. Es el reparto que PANT-18-7
dejó escrito para la otra condición del mismo `if`.

⚠️ **El número vive en su propia constante y no se deriva de `EA_PROT_EOA_Z.normalMin`**, aunque
hoy valgan lo mismo: son **dos tablas distintas** —la 5 gradúa estenosis, la 7 desajuste— y
atarlas haría que mover el corte de una moviera el de la otra sin que nadie lo vea.

---

## 4 · «Con posible estenosis» (D1)

| pieza | quién |
|---|---|
| las tres frases | **`EA_PROT_POSIBLE_SD`**, al lado de `EA_PROT_NORMO` |
| el predicado | **`_posibleSD`**, en `eaProtNarrativa` |
| la marca para el EN SUMA de la TAVI | **`posibleSDTavi`** en el retorno |
| el emisor | `suma.push(EA_PROT_POSIBLE_SD.suma)` entre la rama de normofuncionante y la de `resumen` |

```js
const _posibleSD = P.nivel === 'faltan' && P.pIndep == null &&
                   (P.pDep === 'posible' || P.pDep === 'signif');
```

```js
const EA_PROT_POSIBLE_SD = Object.freeze({
  frase:   'con posible estenosis',      // el cuerpo, SIN la palabra «protésica», + el paréntesis
  resumen: 'posible estenosis',          // el EN SUMA de la QUIRÚRGICA, con su prefijo de siempre
  suma:    'TAVI con posible estenosis.' // el EN SUMA de la TAVI, línea entera
});
```

**La condición pregunta por `pDep`**, que ya es el peor de los dos ejes dependientes calculado con
`EA_PROT_CRIT`: leer `P.vmax` y `P.gmed` acá sería un segundo dueño de la misma clasificación.
Se exige además que **falte** el eje independiente aunque hoy sea redundante, para que la
condición diga lo que la decisión dice y no dependa de una invariante de otra función.

**Los dos esqueletos del EN SUMA, cada uno escrito una sola vez:** el de la TAVI es `suma` —con la
misma forma que `EA_PROT_NORMO.suma`— y el de la quirúrgica es el `Prótesis aórtica: <resumen>.`
que esa válvula ya tenía.

**Medido, el censo combinatorio de 64 escenas**: cambian exactamente **24** —12 TAVI y 12
quirúrgicas— y las otras **40** quedan idénticas. Los **10** que conservan la frase vieja son los
cinco de cada morfología con los dos ejes dependientes en banda **normal** o **ausentes**; en la
TAVI esos cinco ya decían «normofuncionante».

---

## 5 · El desajuste apaga «normofuncionante» (D3)

Un solo predicado, **`_normoTavi`** en `eaProtNarrativa`, que ganó dos comparaciones:

```js
const _normoTavi = P.via === 'TAVI' && P.nivel === 'faltan' &&
  P.ppm !== 'moderado' && P.ppm !== 'severo' && (function(){ … })();
```

**Por qué alcanza con un lugar:** los **seis** caminos que publican la palabra —el cuerpo en los
tres estilos, el EN SUMA, el PDF, el PPT, Guardados y el texto que indexa el Laboratorio— cuelgan
de esta marca, porque los cuatro últimos heredan `informe_texto` y `en_suma`.

⚠️ **Mira el GRADO y no si la oración se publica:** con la condición de la Tabla 7 el papel puede
**callar** el desajuste y el desajuste seguir existiendo. Llamar normofuncionante a esa prótesis
sería afirmar sobre lo que la aplicación decidió no publicar. **Falla cerrado.**

Con `ppm` en `'no'` o en `null` —sin desajuste, o sin con qué medirlo— no cambia nada.

---

## 6 · La mitral: cada fila publica el valor y la escala, y no concluye (D5)

| fila | nodo | qué publica hoy |
|---|---|---|
| velocidad pico de E | `#vm-prot-vmax` | `2.60 m/s  (<1.9 normal · ≥2.5 significativa)` |
| gradiente medio | `#vm-prot-gmed` | `14.0 mmHg  (≤5 normal · >10 significativa)` |
| THP | `#vm-prot-thp` | `240 ms  (<130 normal · >200 significativa)` |
| AEO | `#vm-prot-eoa` | el valor en cm², a secas |
| DVI | `#vm-prot-dvi` | el valor, con su motivo si no concluye y su marca «consignado» |
| **el resumen** | `#vm-prot-obstr` | **ahí SÍ**: los criterios positivos y el conteo |

El cambio vive en **`_t11Fila`** y en las dos líneas del AEO y del DVI, dentro de
**`vmProtEOAPintar()`**. `OBSTR_TXT` sigue existiendo y lo usa **sólo** el resumen.

**Lo que motivó la decisión, medido:** la fila de la velocidad pico de E decía «sugiere
obstrucción significativa» mientras el renglón del veredicto decía «hallazgo aislado — posible
obstrucción (1 de 1 criterio)». Esa fila **no vota**: `VM_PROT_OBSTR_VOTAN` son el AEO, el DVI,
el gradiente medio y el THP.

⚠️ **La escala se conserva** —es la referencia de la Tabla 11, con el operador que esa tabla usa
por parámetro, y no la publica ninguna otra superficie—, y **los motivos también**: «sin medir»,
«revisar la unidad» y «no concluye: …» dicen por qué la fila **no** afirma, que es lo contrario de
afirmar. Declarado en `docs/PENDIENTES.md` → **P26-a § 3**.

⚠️ **El papel no lee el pintor:** el informe usa `vmProtObstrCrit(R)` y `R.obstr`, que salen de
`vmProtEOA()`. Verificado con el A/B: cero diferencias de papel.

---

## 7 · Las cuatro declaraciones de criterio propio

| qué | dónde vive | texto |
|---|---|---|
| los **cortes** de la TAVI | `EA_PROT_SALV.tavi` (plegable «Ver detalle») | «Los cortes de gradiente y de DVI para la TAVI son los de la prótesis quirúrgica: es un criterio de la aplicación.» — y sale el cierre «(ASE 2024, hoja 18, folio 19)» |
| el **área** de la TAVI | la salvedad del `eoaZ`, rama TAVI, en `eaProtNarrativa` | «La comparación del área efectiva con la referencia del modelo es un criterio de la aplicación.» |
| la regla de la **pulmonar** | **`QV_NOTA['prot:pulmonar']`**, clave nueva | «Con velocidad o gradiente alterados, la aplicación informa posible obstrucción: es un criterio de la aplicación.» |
| la condición del **desajuste** | el bloque `ojo` del globo `VINFO['ea-prot-ppm']` | «El desajuste se define con el área efectiva dentro de 1 desvío estándar de la del modelo implantado. Con el modelo cargado, la aplicación lo comprueba.» |

**La pulmonar va en `QV_NOTA` y no en `QV_FUENTE`**: lo segundo es una **cita** —la Tabla 15, con
su folio— y una declaración no es una fuente. La cita se queda donde estaba.

**Ninguno de estos textos va al papel.** Y `VINFO['ea-prot-sev']` **no se tocó**.

---

## 8 · Los dos textos del 3D de congénitas

| pieza | quién |
|---|---|
| el globo | **`VINFO['cc-3d']`**, campo `lee` |
| la línea de abajo | **`cc3dTextoSync()`**, que escribe en `#cc3d-faltan` por `textContent` |
| la lista | **`cc3dNoDibujadas()`** → `r.falta.join(', ')` |

El globo pasa al texto aprobado, de **tres párrafos**, y reemplaza entero al anterior. La línea
dice ahora `Cargadas y no representadas en este diagrama: <lista>.`, con la **lista idéntica**.
Las otras **cinco** formas de `cc3dTextoSync` no se tocaron.

⚠️ **Va en párrafos simples y sin negritas, y se midió por qué:** el renderizador del registro
pasa `lee` por `esc()` y recién después cambia los saltos de línea por `<br>`, así que una
etiqueta escrita ahí saldría como texto literal.

**Las tres mediciones que respaldan lo que el texto afirma:**

1. los rótulos del control segmentado son **«Según el estudio»** y **«Explorar»** —los dos botones
   `.cm3d-md`, con su `data-m`—;
2. **el modo del estudio SÍ puede incluir el diagrama en el PDF**: `cmPdfSync()` apaga
   `#cm3d-pdfb` con `_cm3d.modo !== 'estudio'` o sin nada cargado, y lo **enciende** en el otro
   caso. ⚠️ El texto **anterior** decía «no entra al informe ni al PDF», que es **falso** desde
   PANT-13;
3. **tocar una estructura la vuelve transparente**: `cmTocar(e)` lanza un rayo sobre
   `root.children` y pone la pieza en `_cm3d.sinColor`, que `cmSinColorAplicar()` pinta con el
   sombreado de silueta de alfa por píxel (`_matSC`).

**Los cuatro rótulos que la lista puede nombrar** siguen siendo `_CC_SECS` menos `CC3D_DIBUJA`
menos `CC3D_PROPIO`: **VAB · MCH · MCA · Marfan/EHAT**.

---

## 9 · Qué NO se tocó

- La **tricúspide**, entera: `vtProtObstr`, su pintor y `VMOD_POS.vt`, que sigue con `ppm: null` y
  `cortes: null`. Sus filas **siguen** publicando su lectura por fila: la decisión D5 es **sólo**
  de la mitral.
- Los **cinco catálogos** de modelos y las tablas P20-a, P20-b y P20-c.
- El **Excel**: 457 columnas, cero campos guardados nuevos, cero ids cambiados.
- El **Laboratorio** y la sincronización.
- El **trombo protésico grande** de la aórtica y de la tricúspide.

---

## 10 · Dónde está lo demás

- El inventario del commit 1, con el texto exacto de cada superficie antes de la tanda:
  `docs/INVENTARIO_PANT26.md`.
- Lo que se paró y las premisas que no se reprodujeron: `docs/PENDIENTES.md` → **P26-a**.
- Las fichas de los nueve casos: `docs/mapa/tests-fichas-769.md`.
- La guía manual para el médico: `docs/GUIA_PRUEBA_PANT26.md`.
- La auditoría de solo lectura que sirvió de mapa: `docs/AUDITORIA_PROTESIS.md`.
