<!-- ficha armada sobre el cierre de la Parte B, 2026-10-30 -->
# TC-552 — el TRIV del VD, el índice aórtico calculado y la aortopatía en el papel

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**. El mapa del código es
`docs/mapa/noc-b-aorta.md`.

⚠️ **El commit B4 no se hizo y este caso no lo mide** → `docs/PENDIENTES.md` → **NOC-B-a**.

**Qué fija, por grupo.** Contra el cierre de la Parte A caen **22** condiciones y **ninguna por
excepción**; las que pasan en los dos árboles son los denominadores y los controles negativos.

| Grupo | Qué afirma |
|---|---|
| **Z1–Z3** | Las dos constantes del TRIV **siguen separadas** —75 de pantalla y 60 del papel—; la fila nueva, su globo y el dueño único del texto existen; y las tres piezas del índice aórtico existen. |
| **A0–A5** | Sin valor la fila **no se dibuja**; **74 y 75 no llevan la aclaración** y 76 sí, por las **dos puertas**; las dos filas dicen **exactamente lo mismo** en los tres bordes; el amarillo aparece sólo por encima del corte **y el texto lo dice también sin color**; y el espejo sigue copiando en los dos sentidos. |
| **B0–B2** | Con la probabilidad de HTP **despierta** —ése es el denominador—, la tabla sale **idéntica** con el TRIV vacío y con 110 ms. Y la frase del informe **sigue cortando en 60**, no en 75. |
| **C0–C7** | El campo ya no se tipea pero **sigue siendo campo del estudio**; el índice se **calcula** con la ascendente y la superficie corporal; **ni el cálculo ni el barrido escriben en el campo**; sin ascendente manda el **guardado** y la pantalla lo dice; con los dos **gana el cálculo** y el guardado queda intacto; el **Excel** trae uno u otro según se pueda calcular, en **440** columnas; y el Laboratorio no lee el valor. |
| **D0–D4** | El iDA con **un decimal** en la pastilla, el informe y el EN SUMA, los tres con el **mismo número**; y el **borde declarado** —22,0208 se muestra «22,0» junto a «>22»— fijado tal como es. |
| **E0–E9** | Sobre **ocho escenas**: ninguna publica **clase**, **tabla**, **folio** ni **umbral**; el papel dice el síndrome, el diámetro y «dilatada»; el **índice sólo en Turner**, con una escena de Marfan donde **sí se puede calcular**; los bordes del Marfan y del Loeys-Dietz **no se movieron**; un estudio ajeno **no nombra** la aortopatía; y la **cápsula de pantalla sigue publicando** el umbral, la clase y la tabla. |

---

## Los tres defectos que el propio caso tuvo

**1. (E9) caía sobre un denominador vacío.** La última escena que corría era la del estudio
**ajeno**, que limpia el módulo, así que la cápsula decía «Ingresar síndrome y diámetros» y la
condición medía eso. Hoy la escena se vuelve a montar antes de mirarla.

**2. (E5) era un control VACUO, y lo destapó el barrido de mutaciones.** Afirmaba que el índice va
sólo en Turner, pero sus seis escenas no-Turner **no tenían aorta ascendente**: el índice era nulo
y el papel no lo mostraba *pase lo que pase*. La mutación 11 —«el índice entra al papel de
cualquier aortopatía»— sobrevivió **en verde**. Se cerró con **(E5a)**, una escena de Marfan con
la ascendente cargada y su propio denominador, que afirma que el índice **sí se puede calcular**
ahí.

**3. Acentos graves dentro del cuerpo del caso.** El cuerpo es un template literal; `node --check`
los caza y `check_backticks.py` no.
