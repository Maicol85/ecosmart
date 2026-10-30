# La raíz aórtica como un solo dato, el grado «sin sexo», el voto del índice y los arreglos de pantalla

Mapa de la tanda **G** (2026-10-29). Lo que vive acá: la **sincronización de los dos campos de la
raíz**, el grado nuevo **`sinsexo`**, el **voto del índice en el papel**, las dos líneas nuevas del
**ⓘ de la raíz**, los **tres arreglos de pantalla** del COMMIT 2 y la **sonda sistemática** del
COMMIT 1.

Lo que **NO** vive acá: el criterio único de dilatación de la raíz y sus siete superficies, que es
de la tanda AJ4 → `docs/mapa/aj4-raiz-aortica.md`; las citas por aortopatía y el motor `_indAo` →
`docs/mapa/aorta-aortopatias-evidencia.md`; el dibujo y los seis tipos de la VAB →
`docs/mapa/vab-bicuspide.md`; lo declarado y no hecho → `docs/PENDIENTES.md` → **F-a** a **F-f** y
**G-a** a **G-f**; las fuentes con sus folios → `docs/fuentes/FUENTES.md` → «La tanda G».

**Commits:** `4b9fde9` (G-1) · `8f920c2` (G-2) · `dfcae42` (G-3) · `9b0e67f` (G-4) · `3d08988`
(G-4c) · el de cobertura y documentación.

---

## 1 · El defecto más grande que cerró, en una línea

**Una raíz de 43 mm cargada en la pantalla de aortopatía hereditaria no llegaba al informe
firmado.** La cápsula de la aorta decía «—», el informe no nombraba la aorta y el EN SUMA tampoco.
Medido en HEAD antes de tocar una línea.

La causa: el diámetro de la raíz vivía en **dos campos guardados que no se hablaban**.

| id | Dónde | Quién lo lee |
|---|---|---|
| `ao_sin` | AI/VI → «Aorta torácica» → «Ao sinusal» | `aoSegsMedidos`, `calcAorta`, `evTarjetaAo`, `vabConclusion`, `_indAo`, el informe, el EN SUMA, los bloques 1 y 5 del PDF, el Excel, Referencias |
| `marfan_ao_seno` | C. Congénitas → «Marfan / aortopatía hereditaria» | `marfanEstado`, `_indAo`, el Excel, el predicado del Laboratorio |

El único puente era `_indAo`, en el panel de Evidencia, que toma el **máximo** de los dos — un
arreglo que admite que pueden discrepar.

---

## 2 · Las piezas, por nombre de función

| Nombre | Qué hace | ⚠️ |
|---|---|---|
| `aoRaizSync(origen)` | copia el texto crudo de un campo de la raíz al otro | cuelga del **gesto** (`oninput`), no del barrido de espejos: `ESPEJOS_VIVOS` excluye a los pintores que escriben campos del estudio |
| `_aoRaizModuloEnUso()` | ¿el módulo de aortopatía está en uso? | es lo que hace **condicional** el sentido estudio → módulo. Sin esto, el Laboratorio y el Excel cambiaban |
| `aoRaizReconciliar()` | reconcilia al **cargar** un estudio | entra en `RECALC_MODULOS` y va **primero**. Sólo copia cuando uno de los dos está vacío |
| `aoSegPorIda(sg, x, src)` | ¿el voto lo dio el índice y no el diámetro? | es el dueño de la pregunta del punto (iv). La cápsula ya lo decía; el papel no |
| `aoSegGrado` → `'sinsexo'` | el grado nuevo | los cortes salen de `sg.refSexo`, no se escriben |
| `AO_BADGE_COLOR.sinsexo` | gris | no es un grado: dice «no se puede contestar» |

### La regla de la sincronización, en una frase

**Módulo → estudio SIEMPRE; estudio → módulo SÓLO si el módulo ya está en uso.**

⚠️ **Y eso no es timidez: es una consecuencia medida.** Con el espejo simétrico, escribir la raíz
en AI/VI poblaba `marfan_ao_seno` en **todo** estudio con aorta, y ese campo decide tres cosas
fuera de ahí:

1. `marfanEstado().hayDatos` —que es `sind || seno || asc || ita`— pasaba de `false` a **`true`**
   con `ao_sin` = 40 y nada más: la tarjeta de aortopatía se encendía con su badge «cargada» y el
   módulo concluía «Aortopatía hereditaria — falta declarar el síndrome» sobre un paciente que no
   tiene ninguna. **Medido.**
2. El **Laboratorio** cuenta un estudio como «Marfan/EHAT» con `marfan_ao_seno !== ''`, así que su
   panel habría pasado a incluir todos los estudios con la raíz medida. **El Laboratorio está
   fuera de esta tanda.**
3. La columna de Excel «Marfan/EHAT aorta sinusal (mm)» habría pasado a traer valor siempre.

El **papel firmado no corría riesgo** —ese bloque está detrás del botón «Integrar al informe»,
verificado—, pero las otras tres sí.

---

## 3 · El grado `sinsexo`, y por qué toca tres lugares y no uno

Entre el corte de la mujer (36) y el del varón (40) el mismo número es **normal en un varón y
dilatado en una mujer**. `sexoEfectivo` devolvía el corte del varón cuando el sexo faltaba, así
que una raíz de 39 mm salía «de calibre normal» en el informe **firmado**.

Hoy: con 40 o más, dilatada en los dos sexos; con menos de 36, normal en los dos; **y si el índice
vota, dilatada y el sexo deja de importar** — por eso esa rama se chequea primero.

⚠️ **Dos trampas del cableado, y las dos habrían afirmado lo contrario de lo que se quiere:**

- `aoSegsMedidos` calculaba `dil: grado !== 'normal'`. Con el grado nuevo, eso lo contaba como
  **dilatado**.
- El informe filtraba los normales con `aoM.filter(x => !x.dil)`. Eso metía a los sin clasificar
  entre los normales y el papel los llamaba **«de calibre normal»**.

Por eso hay un conjunto propio, `aoS`, y la rama «ninguno dilatado» se partió en dos: con alguno
sin clasificar **no se afirma normalidad**.

---

## 4 · Cómo medir esta zona

```bash
node scripts/_probe_graiz.mjs --file /tmp/head.html --out /tmp/raiz.HEAD.json
node scripts/_probe_graiz.mjs                       --out /tmp/raiz.NUEVO.json
node scripts/_probe_gpant.mjs                       > /tmp/gpant.json
```

`_probe_graiz.mjs` tiene **22 escenas**: los bordes del punto 4d —varón, mujer y sin sexo con 35,
36, 39, 40 y 45 mm—, el índice votando y no votando con su borde de 22, las dos direcciones del
espejo, el **control positivo** del sentido condicional (`sync_modulo_en_uso`) y el **control
negativo** (`ajeno`). Seis escenas cambian y son las seis buscadas.

⚠️ **`informe_texto` y `en_suma` son `<textarea>`**: su contenido vive en `.value`, no en
`textContent`. Leyendo sólo el `textContent` las dos superficies firmadas salían **vacías** y el
A/B habría dicho «cero diferencias» sobre un denominador de cero. Pasó en esta tanda.

⚠️ **El arnés general `_probe_c2ab.mjs` da CERO diferencias para el G-4, y eso es el control
negativo, no la prueba**: ninguna de sus 62 escenas carga la raíz sin sexo ni con el índice
votando. La prueba es la sonda dedicada.

---

## 5 · La sonda sistemática de pantalla — COMMIT 1

`scripts/_probe_gpant.mjs`: 27 puertas × 3 anchos × 2 temas × 2 escenas = **324 cruces**, y 618
tarjetas ⓘ abiertas y medidas.

⚠️ **Tres calibraciones, y las tres cambiaron el número final:**

1. Los globos se contaban **dos veces** —como globo y como botón— con dos nombres distintos.
2. Marcar ALTA los 55 globos `vinfo-btn` que **no** llevan la regla de 44 daba **1.068** ALTA en
   vez de 30. ALTA queda para la **regresión**: un globo que *lleva* la clase y mide menos.
3. **El área táctil no es el rect.** Este archivo extiende el área de varios botones con un
   `::after` **absoluto** que `getBoundingClientRect` no ve. Medido con `elementFromPoint`:
   `#pac-id-mk-ci` informa **7×11 px de caja** y su área real es **35×41**. Eran 24 ALTA falsas.

⚠️ **Y la expansión de lo colapsado va con el GESTO REAL de cada cabecera**, no forzando
`display`: forzarlo deja la `.card` de adentro sin caja (lección de la tanda E) y abre ramas que
la app esconde a propósito, fabricando superposiciones falsas. La lista de abridores es **cerrada**
—`eteInclToggle` y `toggleValvPill` no son estructurales: cambian lo que el informe dice—.

---

## 6 · Los tres arreglos de pantalla — COMMIT 2

| Qué | Antes | Ahora |
|---|---|---|
| Las ocho pastillas de Válvulas a 390 y 360 px | **8/8 recortadas**; la pastilla en 49 px de caja para un rótulo de 61 | 0/8; la fila apila sola y la pastilla va a 218 px |
| El nomograma de la raíz en Referencias | 316×150 px perdido en una caja de 1194, cita a 4 px | 560×266 px, cita a 10 px |
| La fila de la banda leve del strain del VD | «Decisión de la aplicación» bajo la cabecera «Mujer» | una celda que ocupa las dos columnas de sexo |

⚠️ **Los 200 px del `flex-basis` no son un número inventado: se derivan.** Columna de severidad
104 + `gap` 6 + padding 28 + rótulo 61 = **199**. Por encima no cambia nada: `flex:1` es `1 1 0%`
y `flex:1 1 200px` reparte igual el sobrante en cuanto las dos caben.

⚠️ **El primer intento del colspan BORRÓ la banda «de 15 a 20 %» de la tabla** —pérdida de
contenido clínico que ninguna sonda de geometría ve, porque la fila seguía existiendo— y lo cazó
**TC-535 (F1)**. La celda lleva el valor **y** su origen.

---

## 7 · Una trampa nueva: HAY DOS TANDAS LLAMADAS «G»

La del **posoperatorio de cirugía cardíaca** (2026-10-24) y ésta, la de **pantallas y aorta**
(2026-10-29). Las dos quisieron llamar a su sonda de dos motores `scripts/_probe_gwk.mjs`, y al
escribir la segunda **le pisé el archivo a la primera** —292 líneas— sin que nada lo dijera:
`git status` la mostró como `M` y no como `??`, que es lo único que lo delató. Se restauró desde
git y la de esta tanda se llama **`_probe_gpantwk.mjs`**.

**Antes de crear un `scripts/_probe_*.mjs`, mirar si el nombre ya está tomado.** La convención de
nombrar la sonda por la letra de la tanda se rompe en cuanto una letra se repite, y en este
repositorio ya se repitió.

Lo mismo vale para los mapas: el de la tanda G del posoperatorio es `docs/mapa/g-posoperatorio.md`
y el de ésta es `docs/mapa/g-raiz-aortica.md` — ninguno de los dos se llama `g.md`, justamente por
esto.

---

## 8 · Dos trampas más de medición, de esta tanda

**(a) La copia de HEAD en `/tmp` fabrica un error de consola que no existe.** El A/B de dos
motores daba **1 error en HEAD y 0 en el árbol nuevo**, en los dieciséis cruces, y parecía una
mejora. No lo es: el archivo carga su tipografía por ruta **relativa**, así que una copia puesta
en `/tmp` busca `file:///tmp/fonts/Inter.woff2` y no la encuentra —`ERR_FILE_NOT_FOUND` en Chrome,
«Not allowed to load local resource» en WebKit—. **La copia de HEAD va en el directorio del
proyecto, o el conteo de errores de consola del lado viejo no vale.**

**(b) Por debajo de 768 px las pestañas informan `0/25` con caja, y es el diseño.** La barra
lateral se reemplaza por el desplegable móvil (`#ecoAdvSelect`). Verificado **idéntico en HEAD**
en los dos motores: no lo causó esta tanda. Un conteo de «pestañas con caja» que no distinga ese
ancho se lee como una pantalla rota.

---

## → La tanda Y (2026-10-29): el sexo re-evalúa en el acto, y `G-c` era falso

El grado `sinsexo` sigue igual en la pantalla y **sale del papel**: el informe publica sólo el
diámetro. Y cargar o cambiar el sexo ya re-evalúa las cápsulas de AI/VI y de la aorta, con
`sexoRecalcSync`, el dueño único colgado del gesto.

⚠️ **`G-c` ERA UN PENDIENTE FALSO Y QUEDA CERRADO.** La app **ya aplica `≥ 45`** para el Marfan
(`UMBRAL.marfan.iia = 45` con `maxAo >= u.iia`): medido, 45,0 mm exactos dan `cx_iia`. El
`maxAo > 45` que ese pendiente citaba es el de **Loeys-Dietz**, y ahí el estricto es correcto.
→ `docs/mapa/y-vd-sexo-aorta.md` §3 y §5


## → La TANDA AORTA-2 (2026-10-30) — puntero

La franja **«no se puede clasificar sin el sexo»** que el G-4 creó para la raíz dejó de estar
escrita: hoy se **deriva** del mismo operador que decide el voto (`aoSegPasa`), porque al entrar
la unión sinotubular y la aorta ascendente —que cortan con `>` estricto— la comparación
`x >= _bajo && x < _alto` daba la franja al revés en esos dos. El de la raíz **no se movió**.

→ **`docs/mapa/ao2-segmentos-bicuspide.md`** § 2
