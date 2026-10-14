# Mapa — los CRITERIOS del puntaje HFA-PEFF y su procedencia

Armado el **2026-10-14**, sobre los tres commits de esa tanda. **Sin números de línea a
propósito**: la línea cambia en cada edición, el nombre de la función no.

Nació como archivo propio y no como sección de `hfapeff-peptidos.md` —que es el mapa del
**cartel**, o sea de la UI del péptido— por la regla de tamaño que `CLAUDE.md` documenta: ese
archivo pesa 14,2 KB y esta sección lo habría llevado a ~25 KB con dos temas adentro. Acá van los
**criterios y sus fuentes**; allá, el cartel y su ciclo de vida.

---

## 1 · La fuente, y el hecho que cambió

⚠️ **EL ORIGINAL YA ESTÁ EN LA BIBLIOTECA.** `~/Desktop/EcoSmart_Biblioteca_Fuentes/02_Diastolica/HFA PEFF Pieske ESC 2019.pdf`,
21 páginas. Entró el **13/10/2026 a las 18:55**, o sea **después** del censo de la tanda anterior
que lo daba por ausente: ese censo no estaba mal, el disco cambió. `FUENTES.md` quedó actualizado.

**Folio = página del PDF + 3296**, comprobado en el **pie impreso** de las páginas 1, 8, 9 y 10
(no por aritmética sobre el rango del artículo).

| Dónde está cada cosa | Folio | Página PDF |
|---|---|---|
| Criterios funcionales (e′, E/e′, IT, PSAP, GLS) y LAVI | **3303** | 7 |
| IMVI, RWT, espesor de pared, péptidos y la regla del puntaje | **3304** | 8 |
| **Figura 3** — el algoritmo que la app ejecuta | **3305** | 9 |

⚠️ **LA FIGURA 3 ES UN BITMAP Y EL TEXTO EXTRAÍDO NO LA TRAE.** Se lee renderizando la página
(`pymupdf`, `get_pixmap(dpi=600)` con `clip` sobre la celda). Un `pdftotext` sobre esa página
devuelve el texto del cuerpo y **ninguno** de los cortes de la tabla — y el que no lo sabe
concluye que la figura no dice nada.

---

## 2 · Las tres contradicciones internas del artículo

El artículo **se contradice consigo mismo** en tres lugares, y en los tres **los dos textos están
impresos**. La regla que los resuelve es una decisión de Maicol del **13/10/2026**:

> **Cuando el texto y la Figura 3 difieren, gana la FIGURA.**

El motivo: la Figura 3 es el algoritmo que esta app ejecuta, y es la que el lector tiene delante
al auditar un puntaje.

| Criterio | TEXTO | FIGURA 3 | Qué quedó | ¿Cambió la app? |
|---|---|---|---|---|
| NT-proBNP menor en FA | `375–660` (f. 3304) | **`365-660`** (f. 3305) | **365** | **SÍ** (era 375) |
| IMVI **menor** | `≥115 … or ≥95` (f. 3304) | **`> 115/95`** (f. 3305) | **`>`** | no — ya era `>` |
| LAVI y e′ por edad | los publica (f. 3303) | **no los separa** | se aplican | no — ya estaban |

⚠️ **EL IMVI *MAYOR* NO ES UNA CONTRADICCIÓN.** El texto escribe `≥149 … or ≥122` y la figura
escribe `LVMI ≥ 149/122 g/m² (m/w)`: **los dos dicen `≥`**. La app usaba `>` y estaba mal, sin
nada que dirimir.

⚠️ **EL COMENTARIO QUE ESTABA EN `hfUmbrales` AFIRMABA QUE EL 365 NO EXISTE.** Decía, literal,
que era «una errata muy repetida en la literatura secundaria», que rompía el patrón 3× de los
otros tres cortes y que quedaba **«CERRADO, no volver a darlo vuelta»**. Era **falso**: el 365
está impreso en la Figura 3. Se escribió sobre un original que en ese momento nadie podía abrir,
razonando por el patrón 3× (35→105, 80→240, 220→660) — que **el propio artículo rompe sólo acá**.
Por eso este corte se dio vuelta dos veces antes: no era un descuido, era una fuente ausente.

⚠️ **LA MARCA `#` DE LA FIGURA, AL LADO DEL RWT, NO SE IMPLEMENTA.** El artículo **no explica qué
significa** —no está en el pie de la Figura 3 ni en el texto de los folios 3303-3305—, así que no
hay nada que implementar. Decisión (4) de la orden.

---

## 3 · Dónde vive cada cosa

| Pieza | Qué hace |
|---|---|
| `hfapeffScore(soloEco, src)` | **LA función del puntaje.** Única. Los cortes de ECO viven en línea adentro |
| `hfUmbrales(fa)` | los **ocho** cortes de péptidos, con su texto. Un solo dueño del número y del rótulo |
| `hfapeffDatos(src)` | los insumos, derivados incluidos (`imvi`, `rwt`, `lavi`, `ee`, `psap`) |
| `hfapeffInterp(t)` | las bandas del total: `≤1` · `2-4` · `≥5` |
| `hfRitmoEfectivo()` | el ritmo: `hf_ritmo` fijo, o `auto` → `diast_ritmo` del Doppler |
| `_hfDom(mayores, menores)` | 2 puntos con cualquier mayor, 1 con cualquier menor, **sin sumarlos** |
| `hfapeffRender()` | la sección de Avanzado: una columna por dominio |
| `hfapeffLineaEco()` | el renglón del cuadro de referencias del Doppler |
| `amiloTextoHFAPEFF()` | la hoja del PDF |

**Las tres superficies leen el MISMO objeto.** El cartel de péptidos declara su corte con
`hfUmbrales(fa)` y sus puntos con `hfapeffScore(false).hum`: **no reimplementa ninguna
comparación**, así que un corte nuevo le llega solo. Medido en esta tanda: con el piso en 365, el
cartel publica «Corte aplicado: NT-proBNP 365-660 pg/ml — criterio MENOR, 1 punto» **sin que se
tocara una línea de su lógica**.

---

## 4 · La tabla completa, criterio por criterio

Operadores **medidos por sus dos lados** con teclas reales (`scripts/_probe_hfcrit.mjs`, grupos
`I`, `B`, `T`, `L`, `E`, `O`).

### Dominio FUNCIONAL

| Criterio | Peso | Corte y operador | Folio |
|---|---|---|---|
| e′ septal / lateral, **< 75 años** | mayor | `< 7` / `< 10` cm/s | 3303 |
| e′ septal / lateral, **≥ 75 años** | mayor | `< 5` / `< 7` cm/s | 3303 |
| E/e′ promedio | mayor | `>= 15` | 3303 · 3305 |
| **Velocidad de IT `> 2.8` m/s *o* PSAP `> 35` mmHg** | mayor | **un solo criterio, dos vías** | 3303 · 3305 |
| E/e′ promedio | menor | `>= 9 && <= 14` | 3303 |
| GLS | menor | `< 16` % (sobre el valor absoluto) | 3303 |

### Dominio MORFOLÓGICO

| Criterio | Peso | Corte y operador | Folio |
|---|---|---|---|
| LAVI, **ritmo sinusal** | mayor | `> 34` ml/m² | 3303 |
| LAVI, **fibrilación auricular** | mayor | `> 40` ml/m² | 3303 |
| IMVI **`>= 149` (H) / `>= 122` (M)** con RWT `> 0.42` | mayor | **`>=`** | 3304 · 3305 |
| LAVI, ritmo sinusal | menor | `>= 29 && <= 34` | 3303 |
| LAVI, fibrilación auricular | menor | `>= 34 && <= 40` | 3303 |
| IMVI `> 115` (H) / `> 95` (M) | menor | **`>` estricto** (gana la figura) | 3305 |
| RWT | menor | `> 0.42` estricto | 3304 · 3305 |
| Grosor de pared VI | menor | `>= 12` mm | 3304 · 3305 |

### Dominio HUMORAL (`hfUmbrales`)

| | Ritmo sinusal | Fibrilación auricular |
|---|---|---|
| **mayor** | NT-proBNP `> 220` · BNP `> 80` | NT-proBNP `> 660` · BNP `> 240` |
| **menor** | NT-proBNP `125-220` · BNP `35-80` | NT-proBNP **`365-660`** · BNP `105-240` |

Los mayores van con `>` **estricto** y los menores son rangos **cerrados** (`>= lo && <= hi`), que
es lo que hace que el valor del techo caiga del lado menor y el entero siguiente ya sea mayor.

### El total

`≤ 1` poco probable · `2-4` zona gris · `≥ 5` HFpEF. Techo **6**, dos por dominio. Coincide con el
pie de la Figura 3 y con el folio 3304.

---

## 5 · La PSAP: por qué «la PSAP sola» no es una escena

⚠️ **LA PSAP DE ESTA APP NO ES UNA MEDICIÓN INDEPENDIENTE.** `psap_calc` es un `<input readonly>`
que escribe `calcPSAP` como **`(4·VRT² + PmAD).toFixed(0)`**. Tres consecuencias, las tres
medidas:

1. **Deriva de la misma velocidad de IT**, así que no es un segundo dato: es el mismo con la PmAD
   sumada.
2. **Sin velocidad de IT el campo se VACÍA** (`calcPSAP` sale por su rama temprana). Así que el
   escenario «la PSAP cargada y la velocidad no» **no existe**: lo que separa las dos vías es la
   **PmAD**, no la ausencia de VRT.
3. **Se redondea a entero.** Una PSAP real de 35,6 se lee `36` y cruza el corte; una de 35,4 se
   lee `35` y no. Es el mismo precio que la PAP diastólica de la ASE 2025 ya paga
   (`PENDIENTES.md` → C7).

**Se lee el campo y no se recalcula la fórmula**: una segunda copia de `4·VRT²+PmAD` es el defecto
de la fórmula duplicada que este repo ya pagó varias veces, y además el médico audita el número
que tiene delante.

**La PmAD es la palanca** y sale de los dos campos de la VCI (`vci_diam` y `vci_col`, cuyos tokens
son `>50` y `<50` — **no** `si`/`no`):

| diámetro | colapso | PmAD |
|---|---|---|
| `< 21` | `>50` | 3 |
| `< 21` | `<50` | 8 |
| `>= 21` | `>50` | 8 |
| `>= 21` | `<50` | 15 |

⚠️ **ES UN SOLO CRITERIO Y CUENTA UNA VEZ.** La Figura 3 las imprime en el **mismo renglón**, con
la PSAP entre paréntesis debajo de la velocidad. Dos entradas separadas en el array **no
cambiarían el puntaje** —`_hfDom` da 2 puntos con cualquier mayor— pero la pantalla diría que el
paciente tiene **dos** criterios cumplidos sobre un único hallazgo, y el que audita el score
contaría mal. `dato` es un **OR**: alcanza con que una de las dos esté medida.

---

## 6 · El puntaje **se recalcula**, no se guarda

**No existe ningún campo que almacene el total.** Censado: no hay `hf_score`, `hf_total` ni
`hf_puntaje` en el marcado. Lo que viaja con el estudio son los **insumos** (`hf_ritmo`,
`hf_ntprobnp`, `hf_bnp`, `hf_gls`, los cuatro tildes manuales y todos los campos de eco).

**Consecuencia declarada:** un estudio guardado **reabierto recalcula con los cortes de hoy**. Un
paciente en FA con NT-proBNP entre 365 y 374 que se guardó con 4/6 reabre con **5/6**, o sea pasa
de «probabilidad intermedia» a «HFpEF confirmado». Lo que **no** cambia es el `informe_texto` ya
firmado, que se guarda como texto y se reimprime tal cual. TC-467 fija que no hay campo
persistido, para que un cambio futuro a uno sí persistido se vea.

---

## 7 · Trampas medidas en esta zona

- ⚠️ **EL IMVI NO ES UN CAMPO, Y SU OPERADOR NO SE PUEDE PROBAR TIPEANDO VALORES NORMALES.** Es
  masa de Devereux sobre BSA de Mosteller, o sea un derivado **float de cinco campos**
  (`ddfvi`, `siv`, `ppvi`, `peso`, `talla`). Con valores clínicos nunca cae exactamente en
  `149.000…`, así que **`>` y `>=` dan lo mismo en toda escena alcanzable**: un A/B contra HEAD da
  0 diferencias y se lee como «el cambio no hizo nada». Los dos valores que separan los operadores
  salen de una **bisección sobre doubles**:

  | sexo | peso | talla | DDVI | SIV | **PPVI** | IMVI |
  |---|---|---|---|---|---|---|
  | M | 70 | 170 | 50 | 13 | **13.624098525525902** | **149** exacto |
  | F | 60 | 160 | 48 | 11 | **11.427598347830793** | **122** exacto |

  Son artificiales a propósito —15 decimales en un espesor parietal— y son el único valor que
  prueba el operador, igual que el **370** es el único que separa el piso 365 del 375.

- ⚠️ **LOS INSUMOS DEL SCORE VIVEN EN CUATRO PESTAÑAS**, y un campo sin geometría no se puede
  tipear: `ppvi`, `siv`, `ddfvi` y `edad` en **Datos**; `e_sep`, `e_lat`, `onda_e`, `ai_vol`,
  `vmax_it` y la VCI en **Doppler**; los dos péptidos en **Hemodinámica**, detrás de una tarjeta
  plegable. La sonda lleva un **abridor genérico** (`__H.abrirPara(id)`) que sube por el DOM hasta
  la `.tab-section` que contiene al campo y la activa por su propio id, en vez de una lista de
  pestañas cableada que se desactualiza. **Sin eso la sonda aborta con `SIN GEOMETRIA ppvi`, que
  es lo correcto** — y si el lector no mira el aborto, la tabla sale con `imvi: null` en las seis
  filas y dice «ningún corte funciona» sobre cortes que funcionan. **Pasó en la primera corrida
  del grupo `I`.**

- ⚠️ **EL TOKEN DEL COLAPSO DE LA VCI ES `>50` / `<50`, NO `si` / `no`.** La primera versión del
  grupo `T` puso `vci_col = 'no'`, `calcPmAD` salió por su guarda, la PmAD quedó vacía y
  `psap_calc` también: las **seis escenas** informaron `PSAP vacía` y la vía de la PSAP **no se
  midió**, con el A/B diciendo «0 diferencias» sobre el commit que la agrega.

- ⚠️ **UN DOMINIO QUE YA VALE 2 HACE QUE TODOS SUS CORTES PAREZCAN NO FUNCIONAR.** Las escenas del
  grupo `O` usan anillos que **cumplen** el criterio del e′, así que el dominio funcional ya está
  en 2 y los puntos no se mueven al cruzar el corte del E/e′. Lo que se mide es la **FILA** de cada
  criterio (`SI` / `no` / `na`), no los puntos del dominio. Es la lección que este repo ya tiene
  escrita para la ASE 2016 y para los suplementarios de la ASE 2025.

- ⚠️ **`na` NO ES `no`.** `_hfC` distingue «el criterio no se pudo evaluar» de «se evaluó y no
  cumple». Una escena que no llega a un criterio y lo informa como `no` se lee como un corte roto.

- ⚠️ **PARA PROBAR LA VÍA DE LA PSAP HAY QUE DEJAR LA VELOCIDAD DE IT SIN CUMPLIR.** Con VRT > 2,8
  el criterio ya vota por la velocidad y la PSAP no puede cambiar nada: el borde del 35 se mide con
  VRT **2,60** (PSAP 35, no vota) y **2,65** (PSAP 36, vota), las dos por debajo de 2,8.

---

## 8 · Cómo medir esta zona

```bash
node scripts/_probe_hfcrit.mjs --solo I     # el operador del IMVI por su valor EXACTO
node scripts/_probe_hfcrit.mjs --solo B     # el piso del NT-proBNP menor en FA, con su control
node scripts/_probe_hfcrit.mjs --solo T     # velocidad de IT y PSAP, con la PmAD como palanca
node scripts/_probe_hfcrit.mjs --solo L     # el LAVI por ritmo, ocho bordes
node scripts/_probe_hfcrit.mjs --solo E     # el e-prima por edad: 74 / 75 / 76
node scripts/_probe_hfcrit.mjs --solo O     # los criterios que NO cambiaron
node scripts/_probe_hfcrit.mjs --solo C     # el cartel declara el corte nuevo solo
node scripts/_probe_hfcrit.mjs --solo N     # control negativo mayor (diastólica, válvulas, Excel)

node scripts/test_clinico.mjs --solo TC-467  # 36 condiciones
```

**Los grupos se corren de a uno:** varios en una sola página se cuelgan. Para el A/B hay que
copiar HEAD a un archivo y pasarlo con `--file`; la sonda comprueba el `md5` de `index.html` al
principio y al final y lo publica en su salida.

---

## 9 · Dónde está lo demás

| Qué | Dónde |
|---|---|
| El **cartel** de péptidos: su ciclo de vida, el espejo y la accesibilidad | `docs/mapa/hfapeff-peptidos.md` |
| Los cortes con su folio y la frase verificada de cada uno | `docs/fuentes/FUENTES.md` → `### hfaPeff2019` |
| Lo declarado y no tocado | `docs/PENDIENTES.md` → H1 a H8 y P1 a P6 |
| La función diastólica y sus tres algoritmos | `docs/mapa/diastolica.md` |
