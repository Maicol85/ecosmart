# Fichas de los casos TC-723 a TC-728 — tanda PANT-18 (2026-11-06)

Archivo propio porque `tests-fichas.md` está en **34.237 B**, a menos de 1 KB del techo.

Los seis **caen contra `7f1380a` por 57 condiciones y NINGUNA por excepción**, verificado en un
worktree alternando sólo `index.html` con el mismo archivo de casos. **34/34 mutaciones dirigidas
muertas.**

Todos usan el contrato del runner **sin convertir nada**: `[descripción, BOOLEANO, diagnóstico]`.
Una conversión por caso es como MARFAN-2 dejó pasar condiciones vacuas.

---

## TC-723 — el tiempo de eyección y el AT/ET

**Qué fija.** Que el ET **no es un campo nuevo**: el dueño es `tango_te` y el espejo `va-esp-et`
no viaja con el estudio.

| bloque | qué mide |
|---|---|
| (A0 DENOM) | existen el dueño y el espejo |
| (A1) | el prefijo del espejo está en las **dos** listas paralelas |
| (A2) | **control negativo**: el dueño SÍ es campo del estudio |
| (B1)(B2)(B3) | el espejo en los dos sentidos, y el vacío se copia |
| (C0 DENOM) | la fila del AT/ET publica un valor |
| (C1)…(C5) | los tres tramos y **los dos bordes**: 0,32 y 0,37 caen en «posible» |
| (D1)…(D4) | sin ET, sin AT, con AT = ET y con AT > ET la fila muestra la raya |
| (E1) | **control negativo**: con válvula nativa la fila se esconde y se vacía |
| (F1) | el dueño viaja y el espejo no |
| (F2) | el Excel **no** gana una columna: sigue en 441 |
| (F3) | «Nuevo estudio» borra los dos |
| (G1) | con siembra **muda** el espejo se repinta desde el dueño |

## TC-724 — el AT con sus tres tramos, la nota y Referencias

| bloque | qué mide |
|---|---|
| (A0 DENOM) | la fila del AT publica un valor |
| (A1)(A1b) | 60 y **75** ms son normales — (A1b) nació del barrido: mover el corte a 70 sobrevivía |
| (A2)(A3) | los bordes **80** y **100** caen en «posible» |
| (A4) | 101 ms sugiere estenosis significativa |
| (B0 DENOM) | la nota se muestra con el AT fuera de la banda normal |
| (B1) | la afirmación vieja **no** está |
| (B2)(B3)(B4) | la nueva sí, con sus dos números y con su hoja y su folio |
| (B5) | la función ventricular se le atribuye **al AT** y no al cociente |
| (C1) | la tarjeta da el mismo veredicto con el AT normal, alto y vacío |
| (C2 DENOM)(C2) | **nació del barrido**: con los dos ejes que votan normales y el AT/ET en 0,50, el veredicto sigue siendo «sin criterios» — es la única escena que separa «el AT/ET no vota» de «da lo mismo» |
| (D0 DENOM)…(D6) | la ficha de Referencias: el bloque nuevo con su folio, los tres tramos de cada uno, las filas viejas, cero frases de comparación y **cero globos** |

⚠️ **El último `base()` tiene que ser el de 101 ms**: una escena que deja el AT normal esconde la
nota y las cinco condiciones de (B) caen sobre la nada. Lo pagué escribiendo (A1b) en medio de
las condiciones.

## TC-725 — la tarjeta resumida

| bloque | qué mide |
|---|---|
| (A0 DENOM) | la tarjeta publica su resultado y su nota |
| (A1)(A2) | hay un plegable, **nace cerrado**, y su rótulo es «Ver detalle» |
| (A3) | a la vista quedan como mucho tres líneas |
| (A3b DENOM)(A3b) | **nació del barrido**: con TAVI hay **tres** avisos candidatos y el tope los deja en dos |
| (A4) | el porqué nombra los dos ejes con sus valores |
| (B1)…(B4) | **cada afirmación visible existe en el plegable** |
| (B5) | el detalle es más largo que lo visible |
| (C1) | «sin criterios» publica una sola línea y **no** se le inventa una conclusión |
| (C2)(C3) | «posible» y «falta un dato», con su frase en el detalle |
| (D1) | **control negativo**: con válvula nativa la nota se esconde y se vacía |

## TC-726 — la TAVI graduada

| bloque | qué mide |
|---|---|
| (A0 DENOM) | las dos escenas producen veredicto |
| (A1)…(A4) | ya no dice «sin graduar», da el **mismo nivel** que la mecánica, `sinGraduar` no existe y `via` sigue en TAVI |
| (B1)(B2)(B3) | la misma `frase` y el mismo `resumen` que la quirúrgica |
| (C1)(C2)(C3) | la salvedad del basal, con su hoja y su folio |
| (C4) | **control negativo**: la mecánica **no** lleva esa salvedad |
| (D1) | con todo normal la TAVI dice «sin criterios» igual que la quirúrgica |
| (E1) | la clave muerta `EA_PROT_TXT.tavi` se retiró |

## TC-727 — el desajuste omitido

| bloque | qué mide |
|---|---|
| (A0 DENOM) | las cuatro escenas **emiten informe** (más de 200 caracteres) |
| (A1 DENOM) | las cuatro tienen un desajuste calculado |
| (A2 DENOM) | los cuatro niveles son los buscados |
| (B1)(B2)(B3) | con significativa, el informe y el EN SUMA no escriben el desajuste, en los tres estilos, también con TAVI |
| (C1)…(C4) | **controles negativos**: con «posible» y con «sin criterios» el desajuste **sigue** en los tres estilos |
| (D1) | la pantalla sigue publicando el valor y su categoría |

## TC-728 — el botón «Severidad»

| bloque | qué mide |
|---|---|
| (A0 DENOM) | el botón existe y los cuatro veredictos son los buscados |
| (A1)(A2)(A3) | `nivel3` / `nivel2` / `nivel1` según el veredicto |
| (A4) | con «falta un dato» **no** se pinta |
| (A5) | el círculo amarillo sale con el color |
| (B1) | **`ea_grado` sigue en su centinela en las cuatro escenas** |
| (C1) | **control negativo**: con válvula nativa severa, todo como siempre |
| (C2) | **control negativo**: con un grado fijado a mano gana el del médico |
