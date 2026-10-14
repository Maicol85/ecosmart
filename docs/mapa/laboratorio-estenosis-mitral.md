# Mapa — la ESTENOSIS MITRAL NATIVA en el Laboratorio

Armado el **2026-10-14**, sobre el commit de la tanda. **Sin números de línea a propósito**: la
línea cambia en cada edición, el nombre de la función no.

Cubre sólo la estenosis mitral **dentro del Laboratorio** (estadísticas, gráficos, filtros, PDF de
auditoría y PPT del análisis). La regla clínica vive en la pestaña Válvulas y su mapa es
`docs/mapa/valvulas.md` → `emCategoria()`; **este archivo no la define, la consume**.

---

## El problema que resuelve

Hasta el 2026-10-14 el Laboratorio leía la estenosis mitral por **`_labEstenSev(inf,'em_grado')`**,
que es una **regex sobre el token guardado**. Eso alcanza para las otras siete lesiones y no para
ésta, por dos motivos medidos:

- **El token es binario desde el 2026-10-13.** El selector ofrece sólo «No significativa» (valor
  interno `leve`) y «Significativa» (`severa`), así que la cubeta **«Moderada» quedó vacía por
  construcción** y la palabra que el Laboratorio imprimía —«Severa»— no es la que el informe
  firmado publica desde el 2026-10-11, que es «significativa».
- **El token no dice POR QUÉ.** Una estenosis afirmada por un AVm de 0,8 cm², otra por un AVm de
  1,4 y otra sólo por un gradiente de 12 mmHg salen las tres como «Severa».

---

## Los dueños, por nombre

| Función / constante | Qué hace |
|---|---|
| `_labEmLectura(inf)` | **La única lectura.** Desde `inf.campos`, devuelve la categoría (A), las dos casillas (B), el peor AVm que vota y el gradiente. `null` = el estudio no tiene ningún dato de esta válvula. |
| `LAB_EM_CAT` | Las seis claves y sus rótulos. |
| `LAB_EM_CAT_ORDEN` | El orden del gráfico: de lo más grave a lo menos, con el estado del botón al final. |
| `LAB_EM_CAT_COLOR` | El color de cada barra. |
| `LAB_EM_AVM_SUBRANGO` | El **1,0 cm²** que parte el rótulo de «Significativa» en dos. **No gradúa nada.** |
| `_labEmSevVis(sev)` | Traduce el rótulo de severidad **sólo para la mitral**: `Severa`→«Significativa», `Leve`/`Moderada`→«No significativa», `Sin`→«Sin estenosis». |
| `_labEmBarras(id, infs)` | El gráfico de distribución de la EM en pantalla, con su pie y su denominador. |
| `_labEmCasillas(infs)` | Los tres números de las casillas: por área, por gradiente y por los dos. |
| `_labEmConteoPintar()` | Pinta ese renglón al lado de las casillas del filtro. |

---

## Las seis categorías (A) — mutuamente excluyentes

| Clave | Rótulo | Condición |
|---|---|---|
| `sig_area_1` | Significativa, AVm ≤1,0 cm² | el peor AVm que vota es `≤ 1,0` |
| `sig_area_15` | Significativa, AVm >1,0 a ≤1,5 cm² | el peor AVm que vota está en `(1,0 , 1,5]` |
| `sig_grad` | Significativa solo por gradiente | ningún AVm alcanza el corte (o no hay) **y** gradiente `≥ 10` |
| `grad_elev` | No significativa con gradiente elevado | no es significativa **y** gradiente `≥ 5` y `< 10` |
| `sin` | Sin estenosis | hay datos de EM y ningún criterio se cumple |
| `sig_sin_num` | Significativa sin dato numérico | `em_grado` significativa **y** ningún valor numérico |

**El orden de la cascada es el de la tabla**, y por eso el área va primero: con AVm ≤1,5 **y**
gradiente ≥10 la categoría es por área, que es lo que el médico midió.

### Las dos casillas (B) — se superponen

- **`porArea`** = el peor AVm que vota es `≤ AVM_SEVERA_MAX` (1,5).
- **`porGrad`** = el gradiente es `≥ EM_GMEDIO_SIGNIF_MIN` (10) **y la IM no lo retira**.

Marcadas las dos en el filtro, se exigen **las dos**: eso es lo que permite contar la intersección.

---

## Lo que NO se reimplementa

`_labEmLectura` **le pregunta a los dueños de la regla**, no a una copia:

- `emThpValido(c)` / `emContValido(c)` / `emImSignificativa(c)` — las tres aceptan `src`
  justamente para esto, porque acá no hay formulario que leer.
- `AVM_SEVERA_MAX` (1,5) · `EM_GMEDIO_ELEVADO_MIN` (5) · `EM_GMEDIO_SIGNIF_MIN` (10) — las mismas
  constantes que usa `emCategoria`.
- `_labRango(id)` para la banda de plausibilidad, con el patrón de `emContFueraBanda(src)`.

⚠️ **`emCategoria()` NO se puede llamar**: lee el DOM (`v(id)`, `document.getElementById`) y el
Laboratorio trabaja sobre un registro archivado.

---

## Las siete decisiones que quedan escritas

1. **Se calcula desde los DATOS y no desde el botón.** Con un valor numérico cargado manda el
   número, aunque `em_grado` diga «Significativa»: medido, área 2,0 con el botón en «severa» da
   «Sin estenosis». `sig_sin_num` es la **única** entrada donde decide el botón.
2. **Sin ningún dato de EM el estudio queda fuera de TODAS las categorías**, ni siquiera en «Sin
   estenosis»: afirmar ausencia sobre una válvula que nadie midió no es medir prevalencia. La
   diferencia se declara al pie del gráfico.
3. **Con IM significativa el gradiente no vota, las dos bandas**, igual que `emCategoria` —es la
   decisión de Maicol del 2026-10-11—. El **área sigue votando**. Si el Laboratorio lo contara
   igual, diría «significativa solo por gradiente» sobre un estudio cuyo informe firmado dice
   «Gradiente transmitral elevado» **sin** la palabra estenosis.
4. **Un método que el médico sacó de «Incluir en el informe» no vota, y con la clave AUSENTE sí.**
   Es el espejo de `emMetodoIncluido`: un estudio anterior al selector (2026-10-11) no trae
   `em_pdf_plan__chk`, y leerlo como desmarcado le borraría la estenosis que su PDF firmado afirma.
5. **El cero no es una medición** y un valor fuera de banda no vota — las dos guardas de
   `emCategoria`, aplicadas acá por la misma razón.
6. **Sobre prótesis mitral no se clasifica**: la regla es de válvula nativa.
7. **El sub-rango de 1,0 cm² es la frontera de un RÓTULO, no un corte clínico.** La app sigue
   graduando con un solo corte de área. El rótulo lleva el **rango** y no un nombre de guía porque
   los nombres chocan: el mismo 1,2 cm² es «moderada» en la EAE/ASE 2009 y «severa» en las otras
   tres (ver `docs/fuentes/FUENTES.md`).

---

## Dónde aparece, superficie por superficie

| Superficie | Qué cambió | Qué NO |
|---|---|---|
| **Gráfico de distribución de la EM** (`lab-esten-em`) | seis barras por categoría, con pie y denominador | — |
| **Tabla resumen de ocho válvulas** (`lab-valv-tabla`) | **sólo el pie**, que declara cómo se leen sus columnas para la EM | los ocho conteos, idénticos |
| **Gráfico apilado** (`_labValvCounts`) | nada | las ocho columnas, idénticas |
| **Filtro de cohorte** | `coh-em` pasa a las seis categorías; `coh-em-area` y `coh-em-grad` nuevas; `coh-em-conteo` publica los tres números | los otros cuatro desplegables de válvula |
| **PDF de auditoría** | la mini-tabla de la EM pasa a seis filas de categoría; el pie de «válvula más frecuente» dice «significativa» | las otras cinco mini-tablas y el resto del documento |
| **PPT del análisis** | tabla propia de la EM por categoría + la nota de la tabla de ocho | la tabla de ocho y el resto |
| **Excel** | **nada: 435 columnas** | — |
| **`VALVSIG`** (asociaciones) | nada — es transversal a seis válvulas y lee el token crudo | — |
| **Indicadores automáticos** | nada — ninguno nombra la EM | — |

---

## Las trampas medidas en esta tanda

- ⚠️ **Un booleano en `false` dejaba la cohorte ACTIVA para siempre.** `_labCohorteLeer` decide si
  hay filtros con «distinto de vacío, null y undefined», y una casilla sin tildar pasa los tres: el
  panel habría declarado filtros activos sobre la población entera. Los booleanos se miran **antes**
  de esa guarda.
- ⚠️ **El reset de filtros escribe `e.value = ''`**, que en un checkbox cambia el *value* y **deja
  el tilde puesto**: las dos casillas van en su propia línea de `labCohorteLimpiar`.
- ⚠️ **Un criterio de cohorte INCOMPLETO rechaza todo.** `_labCohorteOk` evalúa todos los
  criterios, y una clave ausente deja comparaciones contra `undefined`. La primera corrida del
  grupo `filtro` de la sonda dio **cero en las cuatro cuentas** con pinta de medición buena. La
  base se le pide al dueño (`_labCohorteLeer`) y **no se escribe a mano**: una lista cableada se
  desactualiza el día que el panel gane un filtro.
- ⚠️ **`_pc` es LOCAL del PDF de auditoría.** Nombrarla desde el PPT —otra función, otro scope— es
  un `ReferenceError` que se lleva la exportación entera.
- ⚠️ **El pie de «válvula más frecuente» habría dicho «Estenosis mitral (EM) moderada».** Su
  ternario compara `b.Severa > b.Moderada`, y con las cubetas de la EM en cero cae en la rama del
  empate. Lleva su propia palabra.
- ⚠️ **jsPDF llega por CDN y a veces no llega** —el defecto de entorno de TC-148 y TC-318—. Un A/B
  contra una corrida sin librería compara una tabla que no se dibujó contra una que sí, y eso se
  lee como una diferencia del commit. La sonda espera hasta 12 s y lo declara.
- ⚠️ **`scripts/check_backticks.py` no alcanzó a los acentos graves de los comentarios dentro del
  template de la sonda**, tres veces en esta tanda. Los cazó `node --check`. **Correr los dos.**

---

## Cómo medir esta zona

```bash
node scripts/_probe_labem.mjs --solo lectura        # la matriz 7 areas x 6 gradientes
node scripts/_probe_labem.mjs --solo excluy,sindato,legado,controles
node scripts/_probe_labem.mjs --solo barras         # el grafico, con su denominador
node scripts/_probe_labem.mjs --solo filtro         # las dos casillas y la interseccion
node scripts/_probe_labem.mjs --solo pdf --pdfdump /tmp   # el PDF y el PPT generados de verdad
node scripts/_probe_labem.mjs --solo teclas         # de punta a punta, con teclas reales
node scripts/_probe_labem.mjs --file /tmp/index.HEAD.html --solo ...   # el A/B contra HEAD
node scripts/test_clinico.mjs --solo TC-469
```

**Cobertura: TC-469**, **55 condiciones** —contadas, no estimadas— con cuatro denominadores y
nueve controles negativos. **Verificado que sabe fallar contra HEAD en un worktree aparte: 51 de
las 55 en rojo, y ninguna por excepción**; las cuatro que pasan son exactamente los cuatro
controles negativos, o sea lo que esta tanda no mueve.
