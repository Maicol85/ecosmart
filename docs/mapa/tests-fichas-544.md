# Ficha de TC-544 — la tanda C1 (2026-10-28)

Archivo propio porque `docs/mapa/tests-fichas.md` ya estaba en **34,2 KB**, a 800 bytes del
techo de 35 KB. El mapa de la tanda es `docs/mapa/c1-hemodinamica.md`.

## Qué fija

Treinta y nueve condiciones en siete bloques, **nueve de ellas denominadores** y **cinco
controles negativos**.

| Bloque | Qué fija |
|---|---|
| **(A)** | Los cuatro rótulos de VExUS contra la Figura 7 de Rola 2021, su llegada al informe, la Evidencia sin conducta por grado y las seis limitaciones del ⓘ |
| **(B)** | «sin evaluar» en la casilla manual sin marcar, y que nada más cambie |
| **(C)** | Los tres mensajes del Forrester y su coincidencia con la Evidencia |
| **(D)** | La RVS con las cuatro combinaciones de PAM |
| **(E)** | El POCUS con el VD/VI cargado en VD/AD y sin él |
| **(F)** | Que ninguna cadena nueva se derrame a un informe que no la toca |
| **(G)** | El gráfico: los cuatro cuadrantes, los dos bordes, el vacío, la actualización en vivo y que no salga al papel |

## Los cinco controles negativos, y por qué cada uno

- **(A4)** el **grado 3 conserva** su frase de injuria renal aguda. Sin esto, «se retiró la
  injuria renal» no se distingue de «se retiró de los cuatro». La mutación **M3** la inyecta.
- **(B2)** un signo **automático** medido y ausente conserva «ausente». Sin esto, aplicar «sin
  evaluar» a todo pasaría. La mutación **M7** la inyecta.
- **(D4)** sin ninguna PAM la RVS sigue en «—».
- **(E4)** sin VD/VI por ningún camino el POCUS sigue en «—» y lo sigue pidiendo.
- **(F1)** un estudio sin VExUS, sin hemodinámica y sin HTP no trae **ninguna** cadena nueva.

## Los nueve denominadores, y qué tapan

1. **A**: las cuatro escenas gradúan 0, 1, 2 y 3. *Sin esto, comparar textos vacíos da verde.*
2. **A2**: el informe trae la línea de VEXUS 3.
3. **A3**: la sección de VExUS del panel despierta y tiene más de 300 caracteres.
4. **B**: la tabla tiene casillas manuales sin marcar **y** signos automáticos medidos.
5. **C**: con los dos datos la cápsula publica un **perfil** y no un «falta».
6. **C2**: la fila de la Evidencia existe en los dos casos con algún dato **y no con el estudio
   vacío** — ver abajo.
7. **D**: con PAM tipeada la RVS da un número. *Si diera «—», comparar el resto no prueba nada.*
8. **E**: el bloque del POCUS del VD tiene filas que leer.
9. **G / G2 / G3 / G4**: el contenedor existe; `forrCuadrante` clasifica; antes del cambio el
   punto estaba en el cuadrante I; y hay punto dibujado cuando se mira el papel.

## Tres cosas que costaron, y quedan escritas

### 1. El panel de Hemodinámica NO despierta con el estudio vacío, y la primera versión del caso lo exigía

`_indHemo` tiene compuerta propia: `if (!gc && !ic && !rvs && !pcp && !rvp) return null`. Con el
estudio vacío la sección **no existe**, así que la fila «Perfil de Forrester» tampoco. La
condición (C4) comparaba las **tres** cadenas contra la Evidencia y fallaba sobre el
comportamiento bueno. Hoy compara donde hay fila, y la ausencia de la tercera se fija como
denominador.

### 2. Los dos bordes se le preguntan al dueño, y no se montan desde los campos

El índice cardíaco sale de una cadena de **cinco** campos (diámetro y VTI del TSVI, frecuencia,
peso y talla) y la presión capilar de Nagueh sobre E/e′. Ninguna combinación razonable da 2,2 ni
18 clavados. Montarlos «aproximando» mediría otra cosa. **(G5)** y **(G6)** se los preguntan
directamente a `forrCuadrante`, que es donde el borde vive, y por eso las mutaciones **M12** y
**M13** —que mueven el operador y el corte— las matan.

### 3. El montaje del gráfico corre el BARRIDO, y eso lo aprendió en rojo

El gráfico **no** se pinta en cada tecla: `calcHemo` sólo registra los números y quien dibuja es
`hemoForrGrafSync`, colgado del barrido de espejos. La primera versión del caso llamaba sólo a
`calcHemo` y las cuatro condiciones del cuadrante fallaban **sobre el comportamiento bueno**.
Hoy `montarForr` corre `barrer()` y espera.

⚠️ **M14 cambió de blanco por lo mismo.** Apuntaba al pintado por tecla; ese pintado se retiró
—volvía la escritura más lenta—, así que la mutación que inyecta el defecto hoy es **sacar
`hemoForrGrafSync` del registro de espejos**.

### 4. El caso NO llama a `calc*` a mano donde la app ya tiene su disparador

Los selectores de vaso de VExUS llevan `onchange="calcVEXUSyRefrescar()"`, así que poner el
valor **es** el gesto del médico. Y **(G9)** —el gráfico que sigue al dato— se mide con el
barrido de espejos y **sin** llamar a `calcHemo`: si lo llamara, el caso estaría fabricando el
disparador que la app podría no tener. Es el error que TC-519 cometió y que el E-2a destapó.

## Las catorce mutaciones dirigidas

Todas en un worktree, nunca sobre el vivo, con guarda de md5 antes y después.
**14/14 muertas** en 1 min 42 s. El arnés es `scripts/_mut_c1.py`.

| | Qué inyecta | Qué la mata |
|---|---|---|
| M1 | el grado 0 vuelve a afirmar que la PVC es normal | (A1) |
| M2 | el grado 2 vuelve con la injuria renal aguda | (A3), (A5) |
| M3 | **sobre-aplicación**: el grado 3 pierde su frase | (A4) |
| M4 | vuelve la conducta por grado a la Evidencia | (A6), (A7) |
| M5 | el ⓘ pierde las limitaciones de la página 9 | (A10) |
| M6 | la casilla manual vuelve a decir «ausente» | (B1) |
| M7 | **sobre-aplicación**: el signo automático también dice «sin evaluar» | (B2) |
| M8 | el Forrester vuelve a pedir los dos datos | (C1), (C2), (C3), (G7) |
| M9 | la RVS vuelve a leer `hemo_pam` a secas | (D1), (D3) |
| M10 | la línea de la RVS deja de declarar el origen | (D1), (D2) |
| M11 | el POCUS vuelve a no mirar `vd_vi` | (E1), (E2), (E3) |
| M12 | el borde del índice cardíaco pasa a «≤» | (G5) |
| M13 | el corte de congestión se escribe a mano en 18 | (G6) |
| M14 | el gráfico sale del registro de espejos | (G1)–(G4) |

**Dos de las catorce no revierten un arreglo: lo aplican de más.** M3 y M7 existen porque las
condiciones que las matan son controles negativos, y un control negativo que ninguna mutación
puede romper no está probando nada.

## Los seis casos viejos que esta tanda adaptó

| Caso | Qué medía | Por qué cambió |
|---|---|---|
| **TC-471 (H)** | 57 entradas en `VINFO` | 58, por el globo `vexus-lim` |
| **TC-500** | 57 entradas en `VINFO` | ídem |
| **TC-502 (C3)** | dieciséis tarjetas sin botón «Ver referencia» | diecisiete: `vexus-lim` tampoco tiene ficha propia |
| **TC-532 (F3)** | las tres frases de conducta **viven** en la Evidencia | se **invierte**: exige que no estén y que esté la línea que las reemplaza |
| **TC-535 (K0-K2)** | **tres** globos con `vinfo-btn-44` | cuatro |
| **TC-537 (N4)** | la cápsula **sigue** diciendo «Requiere IC + PCP estimada» | se **invierte**: cierra el pendiente A-d |

⚠️ **TC-532 (F3) necesitó un segundo arreglo.** Buscaba la frase «El artículo no da pasos por
grado», que era la **nota del bloque retirado** y se fue con él. La declaración vive ahora en la
última línea del bloque del artículo original («no publica ninguna conducta por grado»). La
sección sigue declarando lo mismo; lo que cambió es dónde.
