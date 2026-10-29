<!-- ficha del caso de la tanda C2, 2026-10-28 -->
# TC-545 — la tanda «C2»

Archivo propio, por la misma razón que TC-537 a TC-544: `docs/mapa/tests-fichas.md` está en
34,2 KB y un caso más lo cruza.

## Qué fija

Cinco bloques, uno por zona, y **cada uno abre con su denominador**: sin él, «la frase no está»
no se distingue de «la escena no llegó a la zona», que es el modo de falla que TC-507, TC-519 y
TC-537 ya pagaron en este repositorio.

| Bloque | Qué afirma |
|---|---|
| **(A)** | el rótulo del campo del derrame dice qué se mide y no nombra a un autor; el id y la cuenta no se movieron; **«Balik» no aparece** en la pantalla, ni en el globo ⓘ, ni en la ficha de Referencias; **y el globo conserva** la fórmula, la medición, la fuente y el alcance |
| **(B)** | el informe publica el volumen sin autor (25 mm → 500 ml), **una línea por hallazgo**, **sin** «Patrón global» —que sigue en pantalla—; el EN SUMA en **dos oraciones**, el derrame primero; el bloque de ETT Avanzado retirado en sus **cuatro** mitades; el contenido **sigue publicado una sola vez** sin apretar nada; sin dato, el informe calla; «Correlacionar con la clínica» sólo en pantalla |
| **(C)** | la lectura y el veredicto del cociente **no se movieron** a los dos lados de 0,78; los dos textos quedaron en una línea corta y su contenido **íntegro** vive en las tarjetas `cvr-coc` y `cvr-ecosmart` |
| **(D)** | no queda el botón, ni su manejador, ni su autollenado, ni su aviso; los botones del calculador bajan de nueve a cinco; **y el resto del módulo sigue entero** — el reflejo llena los insumos y el score calcula |
| **(E)** | las dos constantes valen 18 y 2,2 y la cápsula no tiene literal propio; los **bordes** de la presión capilar (15, 18, 18,01 y 19) y del índice cardíaco (2,1; 2,2 y 2,3); los dos juntos; **la cápsula y el Laboratorio leen al mismo dueño**; el globo coherente y sin gritar; y la clasificación pre/poscapilar **conserva su 15** |

## Dos decisiones de método que costaron una corrida cada una

> ⚠️ **`document.body.textContent` NO ES EL TEXTO DE PANTALLA.** Los diecisiete bloques de JS
> inline **viven dentro del body**, así que su `textContent` trae el **código fuente con todos
> sus comentarios**. El censo de «Balik» daba positivo sobre los comentarios que explican por qué
> se retiró —el arnés se medía a sí mismo— y el del aviso del botón, sobre el comentario que
> cuenta que el aviso ya no existe. Hoy se clona el body y se le sacan `script`, `style`,
> `noscript` y `template` antes de leer (`textoVisible()`).

> ⚠️ **(D2) PASABA EN LOS DOS ÁRBOLES, Y ERA UN CHEQUEO QUE NO PODÍA FALLAR.** Buscaba el aviso
> «No hay datos suficientes cargados» en la página, y ese aviso es un `toast`: sólo aparece
> cuando alguien aprieta el botón, y el caso no lo aprieta. Hoy cuenta los botones
> `.crit-calc-btn`, que bajan de nueve a cinco, y exige que ninguno diga «Traer».

> ⚠️ **LOS BORDES SE LE PREGUNTAN AL DUEÑO DIRECTO.** Montarlos desde los campos es imposible sin
> inventar decimales: el índice cardíaco sale de una cadena de cinco campos y la presión capilar
> de la fórmula de Nagueh, y **la cápsula los imprime REDONDEADOS**, así que una escena que
> muestra «18.0» puede valer 18,04. Es la misma decisión que TC-544 documenta. Lo que **sí** se
> monta desde los campos es la coincidencia entre la cápsula y el dueño, que es lo que el C2-4b
> cableó y lo que la mutación M15 ataca.

## Las mutaciones

`scripts/_mut_c2.py`, **dieciséis dirigidas, 16/16 muertas**, en worktree y nunca sobre el vivo,
con guarda de md5 antes y después.

**Dos no revierten un arreglo: lo aplican de más** —M4 saca el patrón global también de la
pantalla y M12 mueve también el corte de la clasificación pre/poscapilar—, porque las dos
condiciones que las matan son **controles negativos**, y un control negativo que ninguna mutación
puede romper no está probando nada.

> ⚠️ **M12 SOBREVIVIÓ AL PRIMER BARRIDO, Y ERA UN HUECO REAL.** El control (E8) usaba `indexOf`,
> y la clasificación pre/poscapilar escribe su 15 **tres** veces: mover **una sola** a la
> constante dejaba las otras dos en pie, el `indexOf` seguía encontrando una y el control pasaba
> en verde sobre una app que ya clasificaba la HTP con el corte del Forrester en una de sus
> ramas. Hoy cuenta las tres y exige además que ninguna lea la constante.

## Contra HEAD

TC-545 cae contra el HEAD de la C1 (`c53d350`) en **diecinueve** condiciones, repartidas en los
cinco bloques. Los controles negativos —B3, B4, B8, B9, C1, C2, D3, D4, E5, E6 y E8— pasan en los
dos árboles, que es lo que un control tiene que hacer.
