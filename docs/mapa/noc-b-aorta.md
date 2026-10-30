# El TRIV del VD, el índice aórtico calculado y la aortopatía en el papel — «TANDA NOCTURNA, Parte B»

Mapa de la Parte B (AORTA‑1) de la tanda nocturna del **2026-10-30**, commits **B1 a B3**. Por
nombre de función y de constante, nunca por número de línea.

⚠️ **EL COMMIT B4 NO SE HIZO** —los segmentos de la Figura 5 por sexo— y está declarado en
`docs/PENDIENTES.md` → **NOC-B-a**, con los ocho valores ya transcritos en imagen y el inventario
del lado de la app.

Lo anterior de esta zona está en `docs/mapa/y-vd-sexo-aorta.md` (el TRIV y su espejo),
`docs/mapa/g-raiz-aortica.md` y `docs/mapa/aj4-raiz-aortica.md` (la raíz y su índice), y
`docs/mapa/aorta-aortopatias-evidencia.md` (los síndromes).

---

## 1 · El TRIV del VD en sus dos referencias (B1)

**El dato vive en DOS campos espejados** por `vdTrivSync`: `vd-triv` en VD/AD y `dt_triv` en
Doppler → tricúspide. Hasta el B1 su **referencia** sólo se pintaba en `dt_triv_ref`.

| Pieza | Quién |
|---|---|
| el texto, y si está por encima del corte | **`_dtTrivRefTxt()`** — dueño único |
| las dos filas que lo muestran | `calcDopTric`, que pinta `dt_triv_ref` **y** `vd-triv-ref` |
| el `display` de la fila nueva | **`vdRefVisSync`**, que ya era el dueño de las filas condicionales |
| el corte de PANTALLA | `DT_TRIV_HTP_PANEL` = **75**, operador **estricto** |
| el corte del PAPEL | `DT_TRIV_HTP` = **60**, en `htpIndirectosFrase` — **no se tocó** |

⚠️ **LOS DOS CORTES SIGUEN SEPARADOS**, que es lo que este archivo ya pedía antes del B1: el 60
gobierna la frase del informe firmado y el 75 es el comentario de pantalla. Medido: con 65 ms la
frase del informe da «(TRIV tricuspídeo > 60 ms)» y con 55 da cadena vacía.

**Medido en los bordes, por las DOS puertas**: 74 y 75 dan el valor solo, sin color; 76 da
«76 ms (>75 ms: a favor de HTP)» en amarillo, **en las dos filas**. Sin valor la fila **no se
dibuja**.

⚠️ **EL AMARILLO NO ES LA ÚNICA SEÑAL**: el texto dice «a favor de HTP», que es lo que se lee con
el color apagado, impreso o con daltonismo. Es la regla P1.

⚠️ **EL TRIV NO VOTA, Y ESTÁ MEDIDO CON SU DENOMINADOR.** Con la probabilidad de HTP **despierta**
—VRT 3,2 m/s, «Probabilidad INTERMEDIA»— las cinco celdas de la tabla salen idénticas con el TRIV
vacío y con 110 ms. Sin ese denominador, dos cadenas vacías se verían iguales y no probarían nada.

**El ⓘ** es `VINFO['vd-triv']`. Sus tres fuentes —Howard 2012, Cabrita 2013 y Bréchot 2008— **no
están en la biblioteca**, así que la tarjeta dice de dónde viene cada número y qué tipo de trabajo
es cada uno. Referencias **no** gana una entrada: el globo entra en la lista de «tarjetas sin
botón» que `TC-502 (C3)` declara, que pasa de 21 a 22.

**El cuadro del VD pasó de ONCE a DOCE filas**, y la nueva va entre la de la onda S′ y la del
índice de Tei. Lo cuentan `TC-457`, `TC-476` y `TC-549`.

## 2 · El índice de tamaño aórtico, calculado (B2)

**Un solo dueño del cociente.** `aoIndexar(mm, src)` es ahora la única cuenta de «diámetro ÷
superficie corporal»; `aoSegIda` delega en ella y `marfanItaEfectivo` la usa.

**`marfanItaEfectivo(src)`** devuelve `{ val, origen }` con `origen` en `'calculado'` o
`'guardado'`:

- **calculado** = `marfan_ao_ascendente` ÷ BSA. Es la **aorta ascendente** porque es lo que la
  Tabla 58 indexa («ascending ASI >23 mm/m²», folio 3640, leída en imagen);
- **guardado** = el campo `marfan_ita` de un estudio viejo, de **sólo lectura**;
- con los dos, **manda el cálculo**: el guardado es una foto de otra medición.

⚠️ **NADA AUTOMÁTICO ESCRIBE EN EL ESTUDIO.** `marfan_ita` sigue siendo un campo guardado con su
columna de Excel, pero **ninguna función le asigna un valor**. Medido: tras calcular el índice y
tras una pasada completa de `_recalcModulos`, el campo sigue **vacío**. Es la lección que el D-9,
el D-10 y el D-11 pagaron tres veces, y la mutación **08** la fija.

**El campo salió de la pantalla** —queda en el documento, escondido y **sin `oninput`**, porque
sacarlo cambiaría el juego de campos de todo estudio nuevo y borraría la columna— y en su lugar
hay un valor de sólo lectura que además **dice de dónde sale**: un valor viejo y uno recién
calculado se ven igual y no son lo mismo.

**Quién lee el valor efectivo:** la cápsula (`marfanSync`), la conclusión (`marfanEstado`), la
**columna del Excel** y el **panel de Evidencia** (`_indAo`). El **Laboratorio no lo lee**: su
único uso de `marfan_ita` es el predicado de presencia del grupo «Marfan/EHAT», que no mira el
valor.

⚠️ **EL ROUND-TRIP DEL EXCEL CAMBIA PARA ESA COLUMNA** → `NOC-B-c`, con su medición.

## 3 · El iDA con un decimal (B2-2c)

**`aoIdaTxt(ida)`** es el dueño único del texto, y lo usan los **tres** lugares que lo imprimen:
la pastilla de la raíz, el informe narrativo y el EN SUMA. Hasta el B2 los tres hacían
`Math.round(ida)`, o sea un entero.

⚠️ **EL REDONDEO ES PARA MOSTRAR, NUNCA PARA DECIDIR.** La dilatación la decide `aoSegPorIda` con
el valor **crudo**. Eso deja un borde declarado en `NOC-B-b`: un iDA de 22,0208 se muestra «22,0»
junto a «>22».

Medido con raíz 39 mm y superficie 1,4191: «iDA de **27,5** mm/m² (dilatada, iDA >22 mm/m²)»,
«Raíz aórtica 39 mm (dilatada por índice, **27,5** mm/m²)» y «Dilatación raíz aórtica (39 mm, por
índice, **27,5** mm/m²)».

## 4 · La aortopatía hereditaria en el papel (B3)

**Lo que el papel dice ahora**, y nada más: el síndrome, el diámetro y «dilatada» cuando
corresponde. El índice **sólo en Turner**.

| | Antes | Después |
|---|---|---|
| cuerpo | «Aorta sinusal 52 mm. Síndrome de Marfan con diámetro aórtico máximo 52 mm — cirugía de la aorta indicada (ESC 2024, Tabla 62 · folio 114, Clase I · Nivel B desde 50 mm…)» | «Aortopatía por síndrome de Marfan: aorta sinusal 52 mm (dilatada).» |
| EN SUMA | «Aortopatía por síndrome de Marfan con indicación quirúrgica Clase I (ESC 2024, Tabla 62 · folio 114).» | «Aortopatía por síndrome de Marfan — aorta de 52 mm (dilatada).» |

**Medido en diez escenas** —los cinco síndromes más los bordes 44,9 / 45 / 45,1 del Marfan y
45 / 45,1 de Loeys-Dietz, más un estudio ajeno de control—: antes, **cinco** publicaban una clase
en el papel, **las diez** la tabla y el folio y **dos** el umbral. Después: **cero** en las diez.

⚠️ **«DILATADA» SALE DEL DUEÑO ÚNICO DE ESA PALABRA**, que es `aoSegDil`. Escribir acá un corte
propio habría sido la tercera copia del criterio, y la mutación **14** lo fija.

⚠️ **EL ÍNDICE SÓLO EN TURNER ES NUEVO, Y NO ES COSMÉTICO**: desde el B2 el índice **se calcula**,
así que sin esa condición habría aparecido en el informe de **cualquier** aortopatía con la
ascendente y la superficie corporal cargadas.

⚠️ **`r.txt` NO SE BORRA.** Lo sigue publicando la **pantalla** —la cápsula de `marfanSync`— y de
ahí lo lee el panel de Evidencia. Lo que cambia es **quién lo muestra**, y `TC-552 (E9)` lo fija.

## 5 · Las trampas que esta parte pagó

1. **Un control negativo vacuo sobrevive a su mutación.** (E5) afirmaba que el índice va sólo en
   Turner, pero sus seis escenas no-Turner **no tenían aorta ascendente**, así que el índice era
   nulo y el papel no lo mostraba *pase lo que pase*. La mutación 11 sobrevivió en verde. Se cerró
   con una escena de Marfan **con el índice calculable** y su propio denominador, (E5a).
2. **Un worktree creado antes de commitear deja mutaciones «NO APLICA».** Las cuatro del B3 no
   encontraban su ancla porque el commit todavía estaba en el árbol vivo. El veredicto «NO APLICA»
   es honesto —no dice «muerta»—, pero cuesta una corrida.
3. **Los acentos graves dentro del cuerpo de un caso**, otra vez, en TC-131 y TC-552.
   `node --check` sobre el `.mjs` los caza; `check_backticks.py` no.
4. **Una regex escrita en un heredoc de bash no lleva el mismo número de barras que una escrita
   desde Python.** `/[ \\\\t\\\\n]+/` en un heredoc sin interpolación llega al template como
   `/[ \\t\\n]+/`, que es «espacio, barra invertida, t o n»: la sonda se comía **las t y las n**
   del texto medido, y el volcado decía «Calculado co la aor a asce de e».
5. **TC-262 y TC-419 fallan por dependencia de orden y no es de esta tanda** → `NOC-B-g`.
