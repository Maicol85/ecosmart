# Inventario PANT-28 — las tres zonas de Referencias, los enlaces, el formato, los casos, el trombo aortico y la cuenta de la suite

**Commit 1 de la tanda PANT-28, 2026-11-09. SOLO LECTURA: no cambia una linea de `index.html`.**
Linea base medida al abrir: `HEAD` = `origin/main` = **`36b7bb0`**, sello **`v20261109-1705`**,
md5 **`e2ebb637397fcef3f857c17f875bea5a`**, **169.251** lineas, **12.342.200** bytes. El sello del
pie (`#eco-build-sello`) imprime `v20261109-1705`, identico al que `CLAUDE.md` publica. Pendrive
`DISK_IMG` montado. Alarma presente y **ENCENDIDA**.

> Las afirmaciones de la orden se trataron como hipotesis. Las que NO se reprodujeron estan
> marcadas con ⚠️ y van a `docs/PENDIENTES.md` → **P28-a**.

---

## (a) LAS TRES ZONAS

### a.1 · La subpestania «Anomalias coronarias» — que contiene HOY

`REF_SUBTAB` es el dueno UNICO del reparto (linea 80565). `coronarias` es una **entrada dentro
del panel `congenitas`**, que es lo que PANT-25 llamo «una subpestania de la cardiopatia
congenita»:

```
congenitas: Object.freeze(['congenitas', 'coronarias']),
```

La entrada es la ficha `ref-coronarias`, lineas **23750 a 23768**, md5 del bloque
**`a71e0ce7b789972f2a50bf22f7ad9ee9`**. Titulo: **«🫀 Anomalias coronarias congenitas — trayecto»**.
Su cuerpo son **trece lineas** y dice, textual:

- «Origen anomalo desde el seno contralateral — tres trayectos posibles:» con los tres:
  **anterior a la arteria pulmonar**, **posterior a la aorta (retroaortico)** e **interarterial
  (entre la aorta y la arteria pulmonar)**.
- «Riesgo: el trayecto **interarterial** es el que se asocia a mayor riesgo de eventos cardiacos.»
- Pie de fuente: ASE 2020 — Frommelt et al, *Recommendations for Multimodality Assessment of
  Congenital Coronary Anomalies*, J Am Soc Echocardiogr 2020;33(3):259-294, **folio 266**.

**No hay ninguna tabla, ningun bloque numerado, ninguna clase ni nivel, y ningun esquema.**

### a.2 · Las fichas de miocardiopatias — que existe HOY

⚠️ **SI existe una ficha de miocardiopatias**, asi que la parte (6) de la orden NO se para.
Es `ref-miocard`, lineas **23666 a 23726**, md5 del bloque **`fb7db81b855b313e41e068e26cb00546`**,
titulo **«🧠 Miocardiopatias — Criterios Eco Clave»**, y vive en el panel **`otros`**:

```
otros: Object.freeze(['oai','burbujas','fop','pericardio','pulmon','tumores','embolig','miocard','formulas'])
```

Sus bloques —rotulos a 12 px, `--accent2`, en negrita, **sin numerar**— son: **MCH**,
**MCDI (dilatada)**, **MCA (arritmogenica)**, **MNC (no compactado)** y **Amiloidosis cardiaca**.
Son listas con viñetas (`•`), **sin tabla y sin pie de regla de folio**: es una ficha del formato
VIEJO, anterior a PANT-25.

⚠️ **No hay NINGUNA pestania ni panel principal «Miocardiopatias» en Referencias.** Las nueve son
`calc, dim, fun, valv, ao, congenitas, cardiotox, hemo, otros` (`REF_SUB_ORDEN`, linea 80620).
Por eso **«las referencias de MIOCARDIOPATIAS» de la decision (6) se resuelve, medido, como
«pegadas a `miocard`, dentro del panel `otros`»**, que es donde el medico las tiene hoy.

### a.3 · Donde vive hoy cada dato de los tres temas, en TODA la app

| tema | donde | que dice |
|---|---|---|
| **Anomalias coronarias** | ficha `ref-coronarias` (23750) | los tres trayectos y el riesgo del interarterial (a.1) |
| | casilla `otr_rac` de **Otros** (11399) | «Arteria circunfleja retroaortica (RAC)», con su boton ⓘ `otr-rac` |
| | globo ⓘ `otr-rac` (49224) | **CLONA la ficha `ref-coronarias` ENTERA** — ver (b) |
| | ESC 2020 congenitas, nota de aorta (104861) | la resonancia o la tomografia para la evaluacion preoperatoria de las coronarias |
| **Corazon de atleta** | campo `mch_ex_atleta` (19445) | «Atleta de competicion», **exclusion** del HCM Risk-SCD; su vocabulario de Excel (147154, 148724) y su chequeo (86151) |
| | notas del HCM Risk-SCD (50134, 88212) | que el modelo no esta pensado ni validado en atletas de competicion |
| | ficha `ref-miocard` | **nada**: ni la palabra atleta |
| **Miocardiopatia chagasica** | — | ⚠️ **CERO apariciones de «Chagas» en todo `index.html`** (medido con `grep -ci`). La ficha es enteramente nueva. |

**Nada de esto se cambia en el commit 1.**

### a.4 · El mecanismo de una ficha y como se indexa

Una ficha de Referencias es un `div.card` con **dos** hijos:

```html
<div class="card">
  <h2 class="card-head" style="cursor:pointer;user-select:none;" onclick="toggleRef('<id>',this)">
    <emoji> Titulo
    <span style="float:right;">&#9654;</span>
  </h2>
  <div id="ref-<id>" style="display:none;" class="card-body"> ... </div>
</div>
```

y **se registra en `REF_SUBTAB`** en el mismo commit. `refSubInit()` (80647) busca
`ref-<id>`, sube al `.card` que lo contiene con `closest('.card')` y lo **mueve** al panel
`#ref-sub-<sub>`. Corre una sola vez (`dataset.refSubInit`). Una ficha fuera de `REF_SUBTAB`
existe, se abre desde su encabezado y el buscador la indexa, **pero el medico que navegue por las
solapas no la encuentra nunca** — es la leccion que `constriccion` dejo en la tanda J, escrita en
el propio comentario de la tabla.

**El buscador** (`_refIndiceArmar`) recorre las entradas **de cada panel** y exige un
`h2.card-head` con `toggleRef('...')` y un `ref-<id>` hermano. No hay un indice de palabras clave
escrito a mano: indexa el **textContent** completo de la entrada. Las fichas que arman su cuerpo
al abrirse se **fuerzan** antes de leer; **una ficha de marcado estatico no necesita forzado**.

---

## (b) LOS ENLACES

| quien | que es | a donde cae | que pasa si crece `ref-coronarias` |
|---|---|---|---|
| `toggleRef('coronarias',this)` (23751) | el encabezado plegable de la ficha | abre/cierra `#ref-coronarias` | nada |
| `REF_SUBTAB.congenitas` (80614) | el reparto | pone la ficha en el panel «Cardiopatia congenita» | nada |
| `MAPA['otr-rac'] = 'coronarias'` (81132) | el mapa de **«Ver referencia»** | `refIr` abre Referencias en el panel `congenitas` y despliega la ficha | nada |
| **`VINFO['otr-rac'].dyn = _otrRefClon('ref-coronarias')`** (49224) | el **globo ⓘ** de la casilla RAC de Otros, `ancho: 360` | **clona la ficha ENTERA** (`modo` sin definir → `nodos = r.children`) | ⚠️ **el globo publicaria los siete bloques nuevos dentro de una tarjeta de 360 px** |
| buscador (`_refIndiceArmar`) | indice | el textContent de la entrada | el buscador encontraria el contenido nuevo |

### ⚠️ b.1 · LA CONSECUENCIA QUE OBLIGA A UNA DECISION, Y LA MEDICION QUE LA FUNDA

`_otrRefClon('ref-coronarias')` **sin `modo`** clona **todos los hijos** del cuerpo de la ficha.
Su comentario de origen (CORTOS11/12, 2026-10-17) lo dice: el globo muestra «lo que Referencias ya
tiene», **sin texto nuevo**, y se clona en vez de copiarse para que las dos versiones no se
separen. Es decir: **todo lo que entre a `ref-coronarias` entra tambien al globo ⓘ `otr-rac`**,
que mide 360 px y esta anclado a una casilla de la pestania Otros.

La orden prohibe las dos salidas obvias:
- **tocar el globo** (darle `modo` o una lista) — «NO toques … los ⓘ», y «si lo nuevo alterara
  … un ⓘ, PARA esa parte»;
- **dejarlo crecer** — seria alterar ese ⓘ sin que nadie lo haya decidido.

**Lo que se hace, y es lo que la propia decision (1) escribe:** «lo nuevo se AGREGA con el
mecanismo que Referencias ya usa (**fichas** con bloques numerados, como las de Masas y Fuentes
embologenas de PANT-25)». O sea: **los bloques nuevos van en una FICHA PROPIA, hermana de
`ref-coronarias`, dentro del MISMO panel `congenitas`**, registrada en `REF_SUBTAB`. Con eso:

1. el contenido existente de `ref-coronarias` queda **identico caracter por caracter** —no se le
   agrega ni se le quita un nodo—;
2. el globo ⓘ `otr-rac` **no cambia ni un pixel**, porque clona `ref-coronarias` y esa ficha no
   se toca;
3. «Ver referencia» de `otr-rac` sigue cayendo en el mismo panel, donde ahora hay dos fichas del
   tema, una al lado de la otra;
4. el buscador indexa la ficha nueva con el mismo mecanismo, sin forzado, porque su marcado es
   estatico.

Queda **declarado en P28-a** como decision tomada por medicion, no por preferencia.

### b.2 · El solapamiento entre lo que ya hay y lo nuevo

La ficha vieja publica **los tres trayectos** del origen contralateral y **que el interarterial es
el de mayor riesgo**, de Frommelt folio 266. Esos dos hechos **no se vuelven a escribir** en la
ficha nueva: su bloque de clasificacion publica las **categorias** de anomalia que cada fuente
describe y su bloque de riesgo, los **rasgos anatomicos** que cada fuente relaciona con el riesgo,
remitiendo al trayecto sin repetir la lista. Medido y declarado, como la decision (1) pide.

---

## (c) EL FORMATO DE UNA TABLA DE REFERENCIAS (medido sobre `ref-tumores` y `ref-embolig`, PANT-25)

**Rotulo de bloque numerado**
```html
<div style="font-size:11.5px;font-weight:700;color:var(--accent2);margin:14px 0 6px;">N &middot; Titulo</div>
```
(el primero del cuerpo usa `margin:2px 0 6px;`; un sub-rotulo sin numero usa `margin:12px 0 6px;`)

**Tabla de tres columnas** (la forma habitual: Dato · Que dice la fuente · Fuente)
```html
<table style="width:100%;border-collapse:collapse;font-size:12px;">
<tr style="background:var(--section-head);">
  <th style="padding:6px 8px;text-align:left;color:var(--accent2);">Dato</th>…</tr>
<tr style="border-bottom:1px solid var(--border);background:var(--bg3)"><td style="padding:5px 8px;">…</td>…</tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:5px 8px;">…</td>…</tr>
</table>
```
Las filas **alternan** `background:var(--bg3)` y sin fondo. Todos los colores son **tokens**
(`--section-head`, `--border`, `--bg3`, `--accent2`, `--text2`), asi que dia y noche salen del
tema sin una sola regla nueva.

**Pantalla angosta — el mecanismo que ya usa Referencias**: una tabla de **cuatro columnas o
mas** va envuelta en
```html
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;"><table style="width:100%;min-width:560px;…">
```
Asi la **tabla** se desplaza por dentro y **la pagina no desborda**. Las de tres columnas van
**sin** envoltorio y sin `min-width`: se acomodan solas. Medido: tres usos de ese envoltorio con
`min-width:560px` en `ref-tumores` y `ref-embolig`.

**Pie de fuente / regla de folio**
```html
<div style="font-size:11px;color:var(--text2);margin-top:6px;line-height:1.5;">…</div>
```
Es donde PANT-25 escribe la **regla de folio comprobada** y la frase de que el documento no
imprime clase ni nivel. **La cita va en la celda «Fuente» de cada fila**, con documento, hoja y
**folio en negrita**; la clase y el nivel se escriben con el formato `Clase I · Nivel B` **solo
donde la fuente los imprime**.

---

## (d) LOS CASOS QUE AFIRMAN LO QUE SE VA A TOCAR (buscados por los literales exactos)

| caso | que afirma | que le pasa |
|---|---|---|
| **TC-502** (79567) | `censo.n === 40` (total de entradas); `porSub.congenitas === 2`, `porSub.otros === 9` y la suma en 40; `_refIndiceArmar(true).length === 38`; `Object.keys(MAPA).length === 50` | **se adapta**: el reparto gana tres entradas (congenitas 2→3, otros 9→11, total 40→**43**, indice 38→**41**). `MAPA` **no cambia** |
| **TC-761** (124706) | «las CUARENTA entradas sin perder ninguna» y el reparto panel por panel | **se adapta** por lo mismo |
| **TC-762** (124797) | las **cincuenta** claves de «Ver referencia», y `MAPA['otr-rac'] === 'coronarias' && panelDe('coronarias') === 'congenitas'` | **NO se toca**: ninguna clave cambia y `coronarias` sigue en `congenitas` |
| **TC-509** (83451) | `ORDEN.length === 9`, el orden de los nueve paneles, y que ninguna entrada quede sin panel | **NO se toca**: no se agrega ni se quita un panel |
| **TC-520** (87974) | los modulos del registro del ETT avanzado | **NO se toca** |

⚠️ **Ni «ref-coronarias», ni «ref-miocard», ni «Anomalias coronarias», ni «Criterios Eco Clave»,
ni «trombGrande» aparecen en una sola linea del archivo de casos** (medido con `grep -F`). O sea:
el contenido de las dos fichas y la pregunta aortica del trombo **no tienen hoy cobertura por
texto**, y eso es lo que el commit 8 cierra.

La base de los cinco casos se corre ANTES de tocar nada y se guarda.

---

## (e) EL TROMBO PROTESICO GRANDE EN LA AORTICA MECANICA — la parte (5) NO se para

| pregunta del inventario | medicion |
|---|---|
| ¿Donde vive la pregunta aortica del trombo grande? | `PROTA_PREG`, entrada **`prota.trombGrande`**, linea **95982**. Rotulo: «Trombo protesico grande, de 10 mm o mas, complicado con embolia». `guia:'vhd25'`. Trae `rec` (Clase IIa · Nivel C, hoja 66, folio 4700) y `nota` («su Figura 20 (hoja 65, folio 4699) imprime el tamanio del trombo grande como «10 mm o mas»») |
| ¿La app distingue protesis mecanica de biologica en esa seccion? | **SI, y en un campo que YA existe**: `#va_morf` (linea 8941) tiene las opciones `Protesis biologica (SAVR)` con `value="Protesis biologica"`, `Protesis mecanica (SAVR)` con `value="Protesis mecanica"` y `TAVI`. `_indProtA()` (96032) deriva `esMec = morf === 'Protesis mecanica'` y `esBio = morf === 'Protesis biologica' \|\| morf === 'TAVI'` |
| ¿Como se acota la pregunta hoy? | **YA esta acotada a lo mecanico**, linea **96089**: `if (p.clave === 'prota.icAguda' \|\| p.clave === 'prota.trombGrande') { if (!esMec \|\| _trb !== 'si') return; }`. Con biologica, con TAVI o sin tipo la pregunta **no se dibuja** |
| ¿Donde vive la oracion en la mitral mecanica, y como se acota? | `_protmRecom`, ramal **`if (tipo === 'mec')`**, linea **95849**, campo `nota` de `o.mod`. Su comentario de PANT-27 lo declara: ese ramal es el UNICO lugar de la aplicacion acotado a protesis mecanica |
| La oracion, textual, tal como esta en la mitral | **«La cirugia se considera ante un trombo protesico grande, no obstructivo, que se complico con embolia o que persiste a pesar de anticoagulacion optima (folio 4698).»** |

⚠️ **Y ESTO CORRIGE UNA FRASE DE PANT-27**: su comentario de la linea 95843 dice que
«las preguntas `prota.trombGrande` y `prott.trombGrande` **no estan acotadas por tipo**». Medido,
`prota.trombGrande` **SI lo esta** —el `esMec` de la linea 96089 es de la misma seccion y es
anterior a PANT-27—; la que no lo esta es **`prott.trombGrande`** (la tricuspide), cuyo filtro
(96367) solo pregunta `_trb !== 'si'`. Por eso la parte (5) **se puede hacer en la aortica** y
**no** en la tricuspide, que es exactamente lo que la decision (5) manda.

**Lo que hace el commit 5, entonces:** agregar la oracion al campo `nota` de `prota.trombGrande`,
que es el lugar donde la seccion aortica publica lo que la Figura 20 y el folio 4698 dicen, y que
el `esMec` de la linea 96089 ya acota a lo mecanico. **Cero campos nuevos, cero ids nuevos y
ninguna pregunta nueva.**

---

## (f) LA CUENTA REAL DE LA SUITE

Medido sobre `scripts/test_clinico.mjs` (127.286 lineas), contando por nombre y sin duplicados:

| que | cuantos |
|---|---|
| llamadas `caso('TC-…')` | **792** |
| ids **distintos** | **792** (cero duplicados) |
| casos **TC numericos** (`TC-001` a `TC-777`) | **777** |
| casos **TC-GR** | **15** |
| `casoAbierto('TC-…')` | **0** |
| ultimo TC numerico usado | **TC-777** → el primer libre es **TC-778** |

⚠️ **La corrida final de PANT-26 reporto «777 de 777 ejecutados» y NO incluyo los 15 TC-GR.**
777 es exactamente el conteo de los TC **numericos** de ese arbol (768 + sus nueve nuevos), asi que
los TC-GR quedaron fuera de los lotes. El total real del archivo es **792**, y es el que esta
tanda corre. Queda en `docs/PENDIENTES.md` → **P28-c**.

---

## Cierre del commit 1

`index.html` **no se toco**: md5 antes y despues **`e2ebb637397fcef3f857c17f875bea5a`**, identico.
