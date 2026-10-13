<!-- mapa armado sobre la tanda del 2026-10-12; los números de línea NO se guardan a propósito -->
# Mapa — función diastólica del VI, **ASE/EACVI 2016 en ritmo sinusal**

Se abre a demanda. **No guarda números de línea**: la línea cambia en cada edición, el nombre de la
función no. Todo lo de acá vive en el bloque grande de `<script>` de `index.html`.

**Nació como archivo propio y no como sección de `docs/mapa/diastolica.md`** por la regla de la casa:
ese mapa pesaba 32,7 KB y el techo son ~35 KB. Lo que entró allá son dos punteros.

Fuentes verificadas, con folio y corte: `docs/fuentes/FUENTES.md` → `### aseDiast2016 — ASE/EACVI
2016, RITMO SINUSAL`. **Antes de abrir el PDF de la guía, mirá ahí.** La **fibrilación auricular** de
esta misma guía es otra cosa y vive en `docs/mapa/diastolica.md` → «La FIBRILACIÓN AURICULAR».

⚠️ **EL E/e′ POR SITIO Y EL S/D DE ESTA GUÍA SE MOVIERON EL 2026-10-12 Y VIVEN EN OTRO MAPA:**
`docs/mapa/diastolica-complementarios.md`. El E/e′ pasó a tener **tres cortes** (promedio > 14,
septal > 15, lateral > 13, folio 281) y el corte se elige por el sitio MEDIDO; el S/D pasó a leerse
por `venpSdEstado('lt1')`, que es el dueño único de los cinco usos de ese campo.

---

## El dueño único y sus dos consumidores

| Superficie | Nodo | Quién la escribe |
|---|---|---|
| **El cuadro gris** — fila «Función diastólica» del `.calc-box` del Doppler mitral | `#dd-interp` | `calcDiastolASE2016` |
| **La ventana** — overlay del botón «🧭 Algoritmo» | `#diast-algo-cuerpo` | la rama `else` de `diastAlgoRender` |

**Las dos leen `diastASE2016Evaluar()`.** Esa función **lee el DOM y no escribe nada**: devuelve el
veredicto (`clave`, `cls`, `badgeTxt`, `texto`, `textoSuma`), el conteo (`pos`/`total`), la rama que
decidió (`via`), cuál de las dos figuras corrió (`algoritmo`, `'8A'` o `'8B'`) y las **filas** que
dibuja la ventana. Misma forma que `diastASE2025Evaluar` y `diastBSE2024Evaluar`.

⚠️ **HASTA EL 2026-10-12 ERAN DOS CUENTAS Y NO ERAN LA MISMA FIGURA.** El cuadro corría los tres
criterios de la 8B y la ventana las cuatro variables de la 8A con la regla de la mitad: dos
algoritmos distintos de la misma guía sobre el mismo paciente, a un clic de distancia. Medido con la
sonda: **acordaban en 9 de 31 escenas**. Hoy, 32 de 32.

`calcDiastolASE2016` conserva la escritura de las tres celdas compartidas (`ea-val`, `eprom-val`,
`ee-val`) con **la cuenta de HEAD**, que NO es la de `diastCeldasBasicas`: aquélla escribe
`eprom-val` también con un solo anillo y ésta sólo con los dos. Unificarlas cambiaría una celda.

---

## La FEVI elige el algoritmo

```
fevi >= UMBRAL_FEVI_NORMAL (50)  →  FIGURA 8A
fevi <  UMBRAL_FEVI_NORMAL       →  FIGURA 8B, con su rama fiel de «0 positivos → grado I»
fevi sin cargar                  →  FIGURA 8B, SIN tratarla como deprimida
```

El 50 sale del folio 285 («normal LVEF (≥50%)») y **se reusa `UMBRAL_FEVI_NORMAL`**, que ya existía:
declarar una constante nueva con el mismo número es el defecto que este repo ya pagó tres veces.

⚠️ **SIN FEVI NO SE INVENTA NADA.** Se corre la 8B —que es lo que la app hacía— y la ventana lo dice
en su renglón de resultado (`sufFevi`). Lo que **no** se hace es tratarla como deprimida: el S/D no
entra y la rama de «0 positivos → grado I» tampoco, porque esa rama vale para la población de la 8B
y acá no se sabe cuál es.

⚠️ **«ENFERMEDAD MIOCÁRDICA CON FEVI NORMAL» TAMBIÉN VA A LA 8B Y LA APP NO PUEDE DETECTARLA.** Es un
juicio clínico sobre datos 2D que no tienen campo. Esos pacientes corren por la 8A.
`docs/PENDIENTES.md` → A2.

---

## Figura 8A — FEVI normal

Cuatro variables de igual peso, **cada una contada sólo si está medida**:

| # | Variable | Corte | Se evalúa si |
|---|---|---|---|
| 1 | E/e′ promedio | `> 14` | hay E y hay al menos un anillo |
| 2 | e′ anular | septal `< 7` **o** lateral `< 10` cm/s | hay al menos un anillo |
| 3 | Velocidad de la IT | `> 2,8` m/s | `vmax_it` cargada |
| 4 | Vol AI indexado | `> 34` ml/m² | hay Vol AI y ASC |

El e′ es **una** variable con **dos** cortes en OR, no dos variables: contarla dos veces le daría
doble peso al mismo dato.

**La regla, sobre las DISPONIBLES:** `pos/total > 0,5` → disfunción · `< 0,5` → normal · `= 0,5` →
indeterminada.

| `total` | Decisión |
|---|---|
| 0 | `Datos insuficientes` |
| 1 | `Indeterminado` — **decisión declarada, ver abajo** |
| ≥ 2 | la regla de la mitad |

⚠️ **CON UNA SOLA VARIABLE LA APP NO AFIRMA, Y LA GUÍA NO TIENE RAMA PARA ESO.** La regla de la mitad
sobre un denominador de 1 convierte un único parámetro en «hay disfunción» o en «es normal». El
ejemplo del folio 281 usa tres. Se informa indeterminada, que es omitir y no afirmar — la misma
decisión que la casa ya tomó en la ASE 2025 y en la BSE. `docs/PENDIENTES.md` → A3.

⚠️ **LA 8A NO TIENE ATAJOS DE FLUJO MITRAL.** La E/A y la onda E se dibujan en la ventana bajo el
rótulo «No son insumos de la 8A», porque un criterio que desaparece se lee como un dato sin cargar.
Consecuencia medida: un E/A de 2,33 con las cuatro variables positivas sale «Disfunción diastólica»
y **no** «Grado III», que es una casilla de la 8B.

**La frase, que es la única nueva de la tanda:**

> informe: «Disfunción diastólica (N de M criterios positivos, ASE/EACVI 2016); el algoritmo para
> FEVI normal no gradúa.»
> EN SUMA: «Disfunción diastólica.»

Existe porque **la guía no manda graduar con la 8B al que la 8A diagnosticó**: no hay flecha entre
las dos casillas, y la condición de entrada a la 8B es la enfermedad miocárdica.

---

## Figura 8B — FEVI deprimida

**Paso 1, el flujo mitral**, con los dos operadores **inclusivos** de la figura:

| Atajo | Condición | Salida |
|---|---|---|
| G1 directo | `E/A ≤ 0,8` **y** `E ≤ 50` cm/s | grado I, relajación prolongada |
| G3 directo | `E/A ≥ 2` | grado III, restrictivo |

⚠️ **`<=` y `>=`, no `<` y `>`.** La ventana los dibujaba estrictos: un E/A de 0,800 (E 40 / A 50,
enteros los dos) y una E de 50,0 clavada caían del lado equivocado en una superficie y del correcto
en la otra.

**Paso 2, los tres criterios:** `E/e′ > 14` · `IT > 2,8 m/s` · `Vol AI > 34 ml/m²`.

| `pos` / `total` | Decisión |
|---|---|
| `pos ≥ 2` | grado II |
| `pos = 1` **y** `total ≥ 3` | **grado I** (es la rama «2 de 3 negativos») |
| `pos = 1` **y** `total = 2` | indeterminada |
| `total = 1` | indeterminada |
| `pos = 0` **y** FEVI deprimida | **grado I** |
| `pos = 0` **y** `E/A ≤ 0,8` | grado I (criterio EcoSmart, ver abajo) |
| `pos = 0`, el resto | normal |

⚠️ **EL MISMO NUMERADOR CON OTRO DENOMINADOR CAMBIA DE CASILLA.** 1 y 1 sobre DOS es «cannot
determine»; 1 sobre TRES es grado I. Por eso las dos condiciones miran el total.

⚠️ **EL e′ NO VOTA ACÁ.** La figura no lo mira. La fila se dibuja igual, con el rótulo diciendo que
es de la 8A.

**Criterio EcoSmart heredado y conservado:** un `E/A ≤ 0,8` no sale «normal» por la rama de 0
positivos. Ese paciente llega ahí por la figura misma (E/A ≤ 0,8 con E > 50) y un cociente ≤ 0,8 es
relajación prolongada por definición: omitir es aceptable, afirmar normalidad no.

### El S/D venoso pulmonar — tres compuertas

```
feviDeprimida  &&  R.total === 2  &&  sv('venp_sd') === 'menor1'   →  total++, pos++
```

Las tres salen del folio 290 (pie de la figura), del folio 286 y del Key Point 6 del 287. **Sólo suma
del lado positivo**: la guía no dice nada del ≥ 1, y contarlo como negativo convertiría un silencio
de la fuente en un voto hacia «presión normal».

⚠️ **El corte cae JUSTO en el borde de la opción del `<select>`**, que es lo que lo hace usable acá y
no en la ASE 2025, donde el corte es ≤ 0,67 y un S/D de 0,9 es «<1» sin cumplirlo. Misma lectura que
la Figura 18 de la BSE.

---

## Las frases, y la que dejó de emitirse

| Estado | Informe | EN SUMA |
|---|---|---|
| Grado I por atajo | «Llenado diastólico con patrón de relajación prolongada (Disfunción diastólica Grado I).» | «Disfunción diastólica Grado I (relajación prolongada).» |
| Grado I por conteo | «Patrón de relajación alterada con presiones de llenado normales (Disfunción diastólica Grado I).» | «Disfunción diastólica Grado I (relajación alterada).» |
| Grado II | «Llenado diastólico pseudonormal con presiones de llenado elevadas (Disfunción diastólica Grado II).» | «Disfunción diastólica Grado II (pseudonormal, presiones elevadas).» |
| Grado III | «Llenado diastólico restrictivo (Disfunción diastólica Grado III).» | «Disfunción diastólica Grado III (restrictivo).» |
| Normal | «Función diastólica normal.» | ídem |
| Indeterminada | «Función diastólica indeterminada.» | ídem |
| Disfunción sin grado (8A) | «Disfunción diastólica (N de M criterios positivos, ASE/EACVI 2016); el algoritmo para FEVI normal no gradúa.» | «Disfunción diastólica.» |
| Datos insuficientes (8B) | *(sin frase)* | *(sin frase)* |
| Datos insuficientes (8A) | «Completar los parámetros de función diastólica para clasificar.» | *(sin frase)* |

⚠️ **SE DEJÓ DE EMITIR «Función diastólica indeterminada (1/3 criterios de presión de llenado
positivos).»**, que la app tenía. Ese «1/3» era cierto mientras un positivo sobre TRES salía
indeterminado; desde que esa combinación es grado I, la frase sólo podía aparecer con DOS o UN
criterio disponible, o sea afirmando un denominador que el estudio no tiene en un informe FIRMADO.
Se publica la corta, que es la otra frase que la app ya tenía para el mismo estado. **Lo encontró
TC-458, no la lectura.**

---

## El Laboratorio — REPORTADO Y NO TOCADO

`_labDiastGrado` deriva el grado del TEXTO del resumen, y de ahí salen cinco columnas del Excel, la
distribución del panel, el PPT estadístico y el filtro de cohorte.

| Frase del EN SUMA | Clasifica |
|---|---|
| «Disfunción diastólica Grado I (relajación prolongada).» | `I` |
| «Disfunción diastólica Grado I (relajación alterada).» | `I` |
| «Disfunción diastólica Grado II (pseudonormal, presiones elevadas).» | `II` |
| «Disfunción diastólica Grado III (restrictivo).» | `III` |
| «Función diastólica normal.» | `sin` |
| «Función diastólica indeterminada.» | `null` |
| **«Disfunción diastólica.» (nueva, 8A)** | **`null`** |

⚠️ **Y UN `null` NO ES NEUTRO EN EL EXCEL.** La columna `DD_Sin (Sin disfunción)` vale
`(gd === 'sin' || (gd === null && eeDoc)) ? 1 : 0`, así que **un estudio con la frase nueva cuenta
como «Sin disfunción»** si tiene el E/e′ documentado. Es PREEXISTENTE —le pasa igual a la
«indeterminada» que la app ya publicaba— y la frase nueva lo hereda. `docs/PENDIENTES.md` → A4.

---

## Por dónde sale cada dato

El informe narrativo y el EN SUMA leen `window._diastResult.texto` / `.textoSuma`, que escribe
`calcDiastolASE2016`. El **PDF** y el **PPT** salen del mismo texto y del span `#dd-interp`. El
**Excel** no gana ninguna columna: sigue en **435**, con el mismo juego de claves, y lo único que se
mueve son las celdas que derivan del TEXTO (`Grado disfunción diastólica` y los cuatro `DD_*`).

**Ningún campo nuevo.** Los insumos son los que ya existían: `onda_e`, `onda_a`, `e_sep`, `e_lat`,
`ai_vol`, `vmax_it`, `fevi` y `venp_sd`.

---

## Trampas de esta zona

- **`calcDiastol` no está cableado a todo lo que la zona lee.** El Vol AI y la velocidad de la IT no
  lo llaman: una escena que termine de cargar por uno de esos deja el cuadro con el veredicto
  ANTERIOR. Al medir, los `<select>` primero y los campos del Doppler mitral al final.
- **La FEVI sí está cableada** (`oninput` de `#fevi`), y desde esta tanda es un insumo del veredicto.
- **Un borde que no cambia ningún veredicto no prueba que el corte exista.** Los tripletes de TC-458
  dejan UN criterio ya positivo para que cruzar el corte mueva grado I ↔ grado II; sin eso, 0 y 1
  positivos dan los dos grado I con FEVI deprimida y el triplete sale «sin cambios».
- **El corte `e' promedio < 8` sólo podía disparar solo con un anillo septal entre 7 y 8 y sin
  lateral.** Con los dos anillos es imposible (septal ≥ 7 y lateral ≥ 10 dan promedio ≥ 8,5), así que
  cualquier otra escena lo confunde con el corte del lateral.
- **Un regex dentro del cuerpo de un caso o de una sonda:** la barra escapada `\/` se cocina a `/` y
  el regex revienta en tiempo de EJECUCIÓN con «Invalid regular expression flags», no de parseo.
  Mejor `indexOf`.

---

## Cómo medir esta zona

```bash
node scripts/test_clinico.mjs --solo TC-458         # la cobertura, 52 condiciones
node scripts/_probe_ase2016.mjs --solo cuadro,ventana          # A/B del veredicto
node scripts/_probe_ase2016.mjs --solo conteo                  # la regla de la mitad de la 8A
node scripts/_probe_ase2016.mjs --solo fevi                    # el mismo Doppler con las tres FEVI
node scripts/_probe_ase2016.mjs --solo bordes                  # tripletes por corte
node scripts/_probe_ase2016.mjs --solo superficies             # las seis, una por una
node scripts/_probe_ase2016.mjs --solo excelab                 # la fila del Excel clave por clave
node scripts/_probe_ase2016.mjs --solo lab                     # qué clasifica el Laboratorio
node scripts/_probe_ase2016.mjs --solo otras                   # control: ASE 2025, BSE y las tres FA
```

Con `--file /tmp/index.HEAD.html` corre contra una copia de HEAD. **Un grupo por vez**: varios en una
sola sesión de página se cuelgan sobre el árbol de HEAD.
