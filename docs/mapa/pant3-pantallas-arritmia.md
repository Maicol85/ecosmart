# PANT-3, segunda mitad — MCA, Fallot, las dos estenosis aórticas, el módulo de arritmia y los rótulos de presión

Mapa de los commits **6 a 10** de la tanda PANT-3 (2026-11-03). La primera mitad —los botones
CIA/CIV, el esquema de la TGA, los carteles de revisión pendiente, el botón «3D» y la pantalla de
MCH— vive en `docs/mapa/pant3-botones-3d-mch.md`.

Está armado sobre un commit y **no guarda números de línea** a propósito: la línea cambia en cada
edición, el nombre de la función no.

---

## 1 · El patrón común de las cuatro pantallas

Las cuatro —MCA, Fallot, estenosis subaórtica y estenosis supravalvular— comparten el mismo
esqueleto, y es el que la regla fija de la casa pide desde el 2026-10-31:

```
#<sec>-fila          grid; una columna por omisión, dos desde 900 px
  ├ #<sec>-campos    min-width:0  — los campos
  └ #<sec>-concl-col 320 px       — la conclusión y el botón «Integrar al informe»
```

La regla de CSS es **una sola** y las cuatro la comparten:
`#mca-fila, #tdf-fila, #esub-fila, #easv-fila`. **El corte va sobre la VENTANA**, que es lo que la
regla fija exige: con `flex-wrap` el punto de quiebre depende del ancho que le quede a la tarjeta
y «a partir de unos 900 px» deja de ser medible.

⚠️ **`repeat(3, …)` y no `auto-fit` por encima de 900 px**, y lo pagó el commit 5 en la MCH: con
`auto-fit` el número de columnas lo decide el ancho disponible, así que a 900 px exactos aparecía
una barra de desplazamiento horizontal. Por debajo de 900 se conserva el `auto-fit` de siempre:
ahí nada cambia.

### Los textos de guía viven en el ⓘ

Las cuatro pantallas perdieron su prosa. El molde del globo es el de siempre —`{ ancho, tit, lee,
fuente, ojo }` en `VINFO`— y el botón es el estándar: `class="vinfo-btn vinfo-btn-44"`, glifo
**U+24D8** (`&#9432;`), `onclick="vInfoClic(this,event)"`.

| globo | de qué habla | lleva fuente |
|---|---|---|
| `mca-sec` | qué es la miocardiopatía arritmogénica | no |
| `mca-eco` | la anomalía regional obligatoria, los umbrales y el diámetro de referencia | te Riele 2014, Tabla 1, hoja 3 de 15 |
| `mca-vi` | por qué el ventrículo izquierdo no puntúa | ídem |
| `mca-score` | qué dice y qué no dice el puntaje | **no**, y es deliberado (→ P3-m) |
| `tdf-sec` | qué sigue la sección en la tetralogía reparada | no |
| `tdf-eco` | de dónde salen los espejos y qué presión estima la IT | no |
| `tdf-vol` | los volúmenes y lo que la guía dice del corte | ESC 2020, hoja 51, folio 613 |
| `esub-sec` | fija contra dinámica, Valsalva, la insuficiencia asociada | no |
| `esub-grad` | **los DOS cortes, cada uno rotulado medio o pico** | ESC 2020 y ACC/AHA 2025, cuatro hojas |
| `easv-sec` | los ostios proximales y el síndrome de Williams-Beuren | no |
| `easv-grad` | qué gradiente gradúa y de dónde sale el corte | ESC 2020, hoja 10, folio 572 |
| `tv-sec` | qué hace el módulo compartido y qué hace el valor nuevo | no |

---

## 2 · MCA — la zona no ecocardiográfica va a TODO EL ANCHO

Es la única de las cuatro con una tercera zona fuera de la fila: `#mca-nocols`, con las **cinco**
categorías del Task Force (`.mca-cat-grid` → `.mca-cat-col`).

⚠️ **Y es una medición, no una preferencia.** Metida dentro de la columna de campos —con la
conclusión al lado comiendo 320 px— sus cinco tablas de criterios largos se estiraban a lo alto y
la sección pasaba de **1254 a 1821 px** a 1440 px, o sea que la disposición nueva era **peor** que
la vieja. A todo el ancho queda en **1345**. La orden decide tres cosas —eco en DOS columnas, no
eco en TRES con tres arriba y dos abajo, conclusión a la derecha desde 900 px— y **no dice cómo se
anidan**: se eligió el anidamiento que mide mejor y se declara.

Los altos, antes → después: **1440 px 1254 → 1345 · 1000 px 1471 → 1985 · 768 px 1849 → 1586 ·
390 px 2365 → 2024**. El costo a 1440 y 1000 está declarado en **P3-j**.

⚠️ **Acá había un párrafo que decía los umbrales DOS VECES**, uno detrás del otro y con distinta
redacción. Pasó entero al ⓘ, una sola vez.

---

## 3 · Fallot — la disposición en tres columnas quedó PARADA

La orden la condiciona a que los grupos estén claros. **No lo están**: de las cinco filas de
campos, **una sola** lleva título. La propuesta de los **cuatro** temas que se leen está en
`docs/PENDIENTES.md` → **P3-i**.

Lo que sí se hizo: los textos al globo y la conclusión a la derecha. Los cuatro anchos bajan:
**651 → 546 · 746 → 721 · 1248 → 1177 · 1405 → 1177**.

⚠️ **Y la pantalla se contradecía a sí misma.** Un recuadro decía «Acá no hay campos de volumen, y
es a propósito» y veinte líneas más abajo están los dos campos de volumen con su grupo propio.
Quedó de cuando no los había.

**La insuficiencia pulmonar NO se gradúa en esta sección** —`tdf_ip_ro` es un espejo de sólo
lectura—. La gradúa **Válvulas**, en `ip_grado`, con `IP_PHT_SEVERA` = 100 ms —binario y
descendente— y `IP_ANCHO_GRADO` por el ancho del chorro; su fuente declarada es `IP_CRIT_FUENTE`:
«Corte del THP: ASE 2019 (Zoghbi), folio 463».

---

## 4 · Las dos estenosis aórticas — los DOS cortes, rotulados

El `ojo` de `esub-grad` es el único lugar de la aplicación donde los dos números conviven con su
rótulo. **El 40 es MEDIO** y es criterio de intervención (ESC 2020, hoja 41, folio 603, Clase I ·
Nivel C; la guía lo bajó expresamente de 50 a 40, hoja 10, folio 572). **El 50 es PICO** y no
tiene clase ni nivel (ACC/AHA 2025, hoja 43, folio e157; y la hoja 53, folio e167, dice que ningún
dato identifica un umbral de gradiente). El 50 vive en la sección de la **transposición**, no acá
— es lo que `T4-a` declara.

Los dueños de los cortes no se movieron: `ESUB_MEDIO_SEVERO` = 40 y `EASV_MEDIO_SEVERO` = 40.

Altos: subaórtica **389 → 304 · 407 → 390 · 616 → 635 · 699 → 635**; supravalvular **361 → 291 ·
383 → 367 · 603 → 622 · 646 → 636**. ⚠️ A 768 px las dos suben 19 px: apiladas, la línea de título
con su globo agrega una fila.

Las frases de conducta que las dos publican están censadas en **P3-n**, y **no se tocaron**.

---

## 5 · El módulo de arritmia ventricular

Es la **primera** sección de «CC frecuentes» (`#tab-congenitas` → el primer `[id^="sacc-cc-"]` es
`sacc-cc-tv`), con su botón «Limpiar» (`tvLimpiar`), su globo y su tarjeta esquemática
(`#tv-tarjeta`, con `tv-ap-mch`, `tv-ap-mca` y `tv-ap-tdf`).

Las tres secciones que lo leen llevan su línea de resumen —`mch-tv-res`, `mca-tv-res`,
`tdf-tv-res`— con un botón «Editar» que llama a `tvIrAlModulo()`.

### El valor nuevo

`tv_tipo` suma **`parada_rec`**, «Parada cardíaca recuperada». Es un **valor** de un campo que ya
existe: **cero campos guardados nuevos y cero columnas de Excel**. Las **cuatro** listas paralelas
que hay que tocar para que un valor nuevo no rompa ningún ramal:

1. el mapa de etiquetas del export (`{id:'tv_tipo', lbl:'Tipo', map:{…}}`);
2. el `_ccLbl` de la columna «TV tipo»;
3. **`LAB_XLS_VOCAB.tv_tipo`**, el del importador — ⚠️ sin esta entrada, reimportar un Excel
   exportado por la propia app devolvía `null` y el guardián descartaba la **fila entera** del
   paciente;
4. la leyenda de valores permitidos de la columna.

Más `TV_TIPO_TXT`, que es el vocabulario del papel.

### Qué hace y qué no hace el valor nuevo

| sección | qué hace |
|---|---|
| **MCH** | cuenta como prevención secundaria, igual que la TV sostenida: `secundaria = sost \|\| paradaRec` |
| **MCA** | **no aporta ningún criterio**: `mayor` y `menorTSVD` llevan `!paradaRec` |
| **Fallot** | se **describe**; esa sección no vota ningún criterio con este dato |

### El espejo condicional de MCH — el caso de tipo 4

`mch_ex_parada` lo **responde la sección** y el módulo sólo **avisa**. Con el módulo en sostenida
o en parada recuperada, el campo se muestra «Sí» y se bloquea; si no, vuelve a ser del médico, que
es el único que puede contestar «No».

⚠️ **Las dos marcas de runtime son lo que hace que esto no pise al médico**, y es la lección del
D-9, el D-10 y el D-11:

- `data-tvderiv="1"` — «este Sí lo escribió el módulo y no el médico»;
- `data-tvprev` — lo que el médico tuviera contestado, para devolvérselo.

**Sólo se reclama la autoría de lo que de verdad se escribió**, y eso lo encontró una medición
sobre este mismo commit: con la marca puesta siempre, un «Sí» que el médico había contestado él
quedaba marcado como escrito por la app y se borraba al apagar la condición.

Las dos marcas entran en el **selector** y en el **cuerpo** de «Nuevo estudio», que son **dos
listas** — la lección que TC-514 cobró en rojo.

### El papel

La **única** diferencia de papel de la segunda mitad es la descripción del valor nuevo:

> «Parada cardíaca recuperada, morfología de bloqueo de rama izquierda con eje superior; 700
> extrasístoles ventriculares en 24 h.»

Con tipo «sostenida» el papel es **idéntico carácter por carácter** en los dos árboles.

⚠️ **La parada encabeza su propia frase y no se cuelga de la de la TV.** Pegándola como tipo, el
papel decía «Taquicardia ventricular documentada, parada cardíaca recuperada», que describe dos
cosas distintas como si fueran una.

⚠️ **Y la primera versión empujaba una nota que nombraba la guía en el informe firmado.** Una
medición la cazó y se retiró. Las otras notas de este bloque **sí** nombran «Task Force 2010» en
el papel: es preexistente y queda en **P3-o**.

---

## 6 · Los rótulos de las presiones pulmonares

**PSAP** la sistólica, **PmAP** la media, **PDAP** la diastólica, en **25 rótulos de pantalla**
—`label`, `calc-lbl`, `th`, el `lbl` de una ficha de Referencias y un texto de criterio—.

**Ningún id, ningún valor, ningún encabezado del Excel y ninguna línea del papel.** El Excel sigue
llamando a su columna «PAP media (mmHg)», que es una cadena distinta de la del rótulo de pantalla.

⚠️ **Tres rótulos no los encontró el censo de origen y sí el caso de prueba**, que censa el
**DOM**: dos «Cociente TAPSE/PAPs» partidos por etiquetas —un `span` dentro de un `label` dentro
de un `td`— y el `<th>` «PAPm» de la tabla de patrones hemodinámicos. Un censo sobre el texto del
archivo no encuentra lo que el DOM arma.

Los rótulos ambiguos que **no** se tocaron están en **P3-p**.

---

## 7 · Dónde está cada cosa

| qué | dónde |
|---|---|
| los casos | `scripts/test_clinico.mjs` → TC-628 a TC-632 |
| las mutaciones | `scripts/_mut_pant3.py` → M22 a M32 |
| la sonda del módulo de arritmia | `scripts/_probe_pant3tv.mjs` |
| la sonda genérica de pantalla | `scripts/_probe_pant3pant.mjs --sec <id>` |
| el A/B | `scripts/_probe_pant3ab.mjs` |
| las fuentes | `docs/fuentes/FUENTES.md` → «La segunda mitad de PANT-3» |
| lo parado | `docs/PENDIENTES.md` → P3-i a P3-p |
