# Ficha de caso — TC-547 (tanda AJ9, 2026-10-29)

> Archivo propio porque `docs/mapa/tests-fichas.md` ya estaba cerca del techo de 35 KB. Lo que
> el caso mide y, sobre todo, **por qué cada condición puede fallar**.

## Qué fija

Treinta y seis condiciones, repartidas en ocho bloques. **Cinco son denominadores.**

| Bloque | Qué fija |
|---|---|
| **D1-D5** | denominadores: las dos constantes y sus seis funciones dueñas; que valgan −18 y −16; los dos nodos de pantalla y los dos campos; **quince** patrones con **quince** celdas pintadas; la ficha `ref-strain` con su tabla poblada |
| **A1-A8** | los **siete bordes** en el dueño y en los dos nodos; el −16 y el −18 exactos del lado limítrofe; la banda de plausibilidad leyendo la constante; la ficha de cardio-oncología con los dos cortes pintados; la alerta del Laboratorio |
| **B0-B7** | el signo: informe y EN SUMA negativos con un +18; el **campo** y la **columna de Excel** sin reescribir; el rótulo clasificando por el valor negativo; los decimales de los dos lados |
| **C0-C4** | el rótulo es SOLO de pantalla: ausente del informe, del EN SUMA y del **PDF generado de verdad** |
| **D6-D10** | los 17 segmentos con su reparto intacto; el aviso en pantalla; las tres reservas de la fuente en el ⓘ; **cero WMSI** |
| **E1-E6** | el patrón de amiloidosis con la definición de la ASE; **cero** patrones con el 2,9; MCH sin relación ápice/base; los quince rótulos ilustrativos **en los dos lectores**; las citas del ⓘ |
| **F0-F4** | los tres bordes del score —2,89 / **2,90** / 2,91—; el ⓘ con su procedencia; **abrir el globo no marca el criterio** |
| **G1-G5** | los folios de la ficha; los **dos** chips; que esté en una subpestaña; el mapeo de las tres tarjetas y el assert de `VINFO_REF`; que no cite a Biering-Sørensen ni a Jiang |
| **H1-H3** | escenario ajeno: sin SGL el informe no lo nombra y los dos nodos quedan vacíos; el **cero** se trata como vacío |

## Lo que el caso encontró, y no estaba buscando

**La fuga del rótulo entre pacientes.** (H2) salió roja sobre mi propio commit 1: después de
«Nuevo estudio» la fila de cálculo volvía a «—» y la pestaña seguía anunciando
`SGL -18% · limítrofe`, **o sea el strain del paciente anterior**. El barrido de `limpiarCampos`
alcanza a `#sgl-interp` —un `span[id]` dentro de un `.calc-row` de un `.calc-box`— pero no a
`#sgl-interp-tab`, que es un `<div>` en otra pestaña. Se cerró llamando al **pintor**, que es el
dueño único de los dos nodos, y no vaciando el nodo a mano.

## Trampas que costaron una corrida

1. **La tilde de «limítrofe» escrita en la letra equivocada.** `String.fromCharCode` con el
   acento en la primera `i` da «límitrofe», y tres condiciones salieron rojas sobre una pantalla
   correcta: el diagnóstico decía `SGL -16% · limítrofe` y el caso decía que no estaba.
2. **El emisor del PDF es `_pdfAjustarA4`**, no `generarPDF`. Con el segundo solo el espía no
   registra un texto y las dos condiciones del PDF salen rojas con el diagnóstico **vacío**.
3. **Hay que esperar a jsPDF.** Sin la espera, (C3) y (C4) salían rojas en la primera corrida con
   «NO HAY jsPDF», que es el mismo diagnóstico intermitente de TC-358 y parece un problema de
   conexión sin serlo.
4. **No se busca la palabra «limítrofe» en todo el informe**: aparece 19 veces en el archivo y el
   generador la usa para otros datos. Se mira el fragmento de 36 caracteres que sigue a «SGL ».
5. **El denominador de (B0) es la FEVI.** El informe publica el SGL pegado a la FEVI
   (`if (fevi !== null)`), así que una escena con SGL y sin FEVI deja la frase fuera del papel y
   el chequeo pasaría sobre una superficie que no se emitió.

## Contra HEAD

Cae con **veintidós** condiciones en rojo, repartidas por los ocho bloques.

## Mutaciones dirigidas

**12/12 muertas en el primer barrido** (`scripts/_mut_aj9.py`, en worktree, con guarda de md5).
Dos de las doce **no revierten nada: aplican de más** —la 05 hace que el rótulo se cuele al
informe firmado y la 11 que el 2,90 exacto sume— y existen porque las condiciones que las matan
son **controles negativos**: un control negativo que ninguna mutación puede romper no está
probando nada.

| # | Qué revierte | Qué condición la mata |
|---|---|---|
| 01 | el corte de normalidad vuelve a −20 | A1, A2, A6 |
| 02 | el −18 exacto cae del lado normal | A1, A5 |
| 03 | el −16 exacto cae del lado anormal | A1, A4 |
| 04 | el papel deja de anteponer el signo | B1, B2, B5, B7 |
| 05 | **de más**: el rótulo se cuela al informe | C1, C2 |
| 06 | los cortes dejan de pintarse en Referencias | A7 |
| 07 | la banda de plausibilidad con su propio número | A6 |
| 08 | el rótulo deja de repintarse en «Nuevo estudio» | H2 |
| 09 | el segmento 15 se pasa a la circunfleja | D7 |
| 10 | el patrón de amiloidosis vuelve al 2,9 | E1, E2 |
| 11 | **de más**: el corte del score deja de ser estricto | F1 |
| 12 | el globo del 2,9 pierde su `stopPropagation` | F4 |
