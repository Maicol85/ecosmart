# Mapa — el cartel de PÉPTIDOS del HFA-PEFF y el plan del usuario

Armado el **2026-10-13**, sobre los tres commits de esa tanda. **Sin números de línea a
propósito**: la línea cambia en cada edición, el nombre de la función no.

Nació como archivo propio y no como sección de otro mapa, por la regla de tamaño que
`CLAUDE.md` ya documenta: un mapa que crece con cada tanda termina siendo imposible de
presupuestar.

---

## 1 · El defecto que esto cierra, y por qué el plan no lo frenaba

El renglón **«HFA-PEFF (eco)»** del cuadro gris de referencias del **Doppler** lo dibuja
`hfapeffLineaEco()` y lleva un botón de péptidos. Hasta el 2026-10-13 ese botón llamaba a
`hfapeffIr()`, que hacía **`showTab('hemodinamica')`**.

⚠️ **`showTab` NO CHEQUEA EL PLAN.** Medido sobre su propia fuente: no nombra `eeGetMode`,
`eeModOn`, `applyViewMode` ni `ett_view_mode`. Lo único que hace es mover las clases `.active`.

**El plan no es una licencia de servidor: es `localStorage`.**

| Pieza | Qué es |
|---|---|
| `localStorage['ett_view_mode']` | `'basico'` o `'avanzado'`. **Con la clave ausente, `eeGetMode()` devuelve `'avanzado'`** |
| `localStorage['ett_modules']` | qué módulos avanzados se ven; `eeModOn(k)` devuelve `true` cuando la clave falta |
| `applyViewMode()` | lo ÚNICO que aplica el plan: esconde `.tabs-special`, `.tabs-tools`, `.tabs-lab-wrap` y **cada `button[data-mod]`** |
| `EE_MODULES` | la lista que dibuja las casillas de Config, paralela a los `data-mod` |

O sea: **el plan se aplica escondiendo BOTONES, no paneles.** `#tab-hemodinamica` sigue en el
árbol con plan Básico —medido—, así que cualquier código que lo active entra igual.

**Reproducido con teclas reales**, plan Básico: el botón del rail de Hemodinámica en
`display:none` y la fila `.tabs-special` entera escondida —el plan SÍ estaba aplicado— y un clic
de mouse sobre «confirmar con péptidos →» movía la pestaña activa de `tab-doppler` a
**`tab-hemodinamica`**, con la sección HFA-PEFF visible.

**Censo del resto (punto 6 de la orden, sólo reportado):** `hfapeffIr` era el **único** control de
toda la app que llamaba a `showTab` con una pestaña gateada desde fuera del rail de botones.
Verificado por grep sobre los diez destinos gateados (`hemodinamica`, `pulmonar`, `ete`,
`cardioOnco`, `amiloidosis`, `congenitas`, `congenitas2`, `calculadoras`, `fono`, `refs`) y por el
grupo `X` de la sonda, que censa los `[onclick]` del árbol vivo.

---

## 2 · Las piezas nuevas

| Nombre | Qué hace |
|---|---|
| `#modal-hfpep` | el cartel. Marcado ESTÁTICO, `role="dialog" aria-modal="true" aria-labelledby="hfpep-titulo"` |
| `#hfpep-caja` | la caja interior; es la que se mide en la pasada de anchos |
| `#hfpep-tipo` | `<select>` de dos opciones: `nt` / `bnp` |
| `#hfpep-val` | el valor en pg/ml. **Es un ESPEJO, no el dato** |
| `#hfpep-ritmo` | el ritmo en palabras, de `hfPepRitmoTxt()` |
| `#hfpep-corte` | el corte que aplicó y los puntos, de `hfPepPintar()` |
| `HFPEP_CAMPO` | `{ nt: 'hf_ntprobnp', bnp: 'hf_bnp' }` — el único lugar donde vive el par tipo→dueño |
| `hfPepTipoVigente()` | con qué tipo abre: el que tenga valor; con los dos, NT-proBNP; con ninguno, NT-proBNP |
| `hfPepSync(origenId)` | el espejo, en los dos sentidos |
| `hfPepRitmoTxt()` | el renglón del ritmo |
| `hfPepPintar()` | repinta los dos `div` de texto. PINTA Y NADA MÁS |
| `hfPepAbrir/Cerrar/Confirmar()` | el ciclo de vida, con el foco |
| `hfPepEditado()` / `hfPepTipoCambio()` | los dos gestos del médico dentro del cartel |

**`hfapeffIr()` se conserva con el nombre y cambia el destino** (`hfPepAbrir()`), en vez de
arreglar los dos `onclick`: así ningún llamador futuro reabre el agujero por la puerta de al lado.

---

## 3 · UN dato, DOS controles, y quién es el dueño

El péptido tiene **un dueño** y el cartel es un espejo:

```
hf_ntprobnp  (Hemodinámica → sección HFA-PEFF)  ←→  #hfpep-val con #hfpep-tipo = 'nt'
hf_bnp       (ídem)                             ←→  #hfpep-val con #hfpep-tipo = 'bnp'
```

Mismo mecanismo que `aoFcSync` y `avaPlanSync`, con **una diferencia**: el par no es fijo, lo
elige el desplegable de tipo, así que `hfPepSync` pregunta por el tipo vigente en cada llamada en
vez de cerrar sobre dos ids.

- **No hay bucle, y NO es por la guarda**: asignar `.value` por código no dispara `oninput`. La
  guarda `_hfPepSinc` está para el día en que alguien despache un `input` a mano (los arneses lo
  hacen).
- **La salida temprana por valor igual no es cosmética**: escribir `.value` con el mismo contenido
  manda el caret al final, y los dos lados del par pueden estar visibles a la vez (el cartel es un
  overlay y queda a la vista con cualquier pestaña debajo). Se compara el **texto crudo**.
- **Llamada sin argumento copia DUEÑO → CARTEL.** Así la llaman `hfPepAbrir`, `RECALC_MODULOS` y
  `limpiarCampos`.
- **Cambiar el tipo NO mueve ningún valor: TRAE el del tipo elegido.** Los dos péptidos sobreviven
  —la sección de Avanzado acepta los dos y el score los vota a los dos—; el cartel muestra uno a
  la vez y no pisa el otro. Medido como control negativo en los dos tipos.

### ⚠️ EL CARTEL NO ES DEL ESTUDIO, Y ES DELIBERADO

Los dos ids van con **guión MEDIO** y `_noEsDelEstudio` los excluye por prefijo (`hfpep-`), así que
el recolector de `guardarInforme` **no los guarda**. Persistir el espejo dejaría una SEGUNDA copia
del péptido que al reabrir puede contradecir al dueño — el defecto de la fórmula duplicada que este
repo ya pagó varias veces. El cartel **deriva** su valor del dueño cada vez que se abre.
Los dueños (`hf_ntprobnp`, `hf_bnp`, con guión BAJO) sí viajan, y **ya tenían columna de Excel**
(«NT-proBNP (pg/ml)» y «BNP (pg/ml)»): **el Excel sigue en 435 columnas y no se agregó ninguna.**

### Las dos columnas

`hfPepSync` y `hfPepPintar` están en **`RECALC_MODULOS`** —el embudo de las cinco rutas de
restauración, que pueblan asignando `.value` y no disparan `input`— y `hfPepPintar` se repite **al
final de `limpiarCampos`**, que no pasa por ese embudo. Los dos *controles* sí los barre
`limpiarCampos` por sus selectores genéricos (`input[type=number]` y `select`); los dos `div` de
texto, no.

---

## 4 · El ritmo se LEE, no se pregunta

`hfRitmoEfectivo()` ya era el dueño único y no se tocó:

```
hf_ritmo = 'rs' | 'fa'   → manda eso (el médico lo fijó a mano en el score)
hf_ritmo = 'auto'        → manda diast_ritmo de la pestaña Doppler ('fa' → 'fa', cualquier otro → 'rs')
```

El cartel imprime el resultado en palabras y **no ofrece cambiarlo**: los cortes de fibrilación
auricular son el triple, y dos lugares donde elegir el ritmo son dos verdades.

⚠️ **CON EL CARTEL ABIERTO, EL RITMO PUEDE CAMBIAR DETRÁS.** El cartel es un overlay `inset:0`, así
que el médico puede mover el selector del Doppler con el cartel a la vista. `hfPepPintar` entró al
**oyente de documento** que ya repintaba el renglón —y no al `onchange` del selector— porque sus
insumos (`diast_ritmo`, `hf_ritmo` y los dos dueños) viven en **tres pestañas**, y son tres puertas
que se separan en cuanto se toque una. **Va en `try`:** ese oyente no envuelve sus llamadas y una
excepción ahí se lleva todo lo que viene después, para cada evento de input del documento.

---

## 5 · El puntaje sale de UNA sola función

`hfapeffScore(soloEco, src)` era y sigue siendo la única. Lo que cambió es **el argumento**:

```
hfapeffLineaEco():  r6 = hfapeffScore(false)
                    hayHum = r6.hum.hayDatos
                    r = hayHum ? r6 : hfapeffScore(true)
```

- **Con péptido** el renglón publica `N/6 — <interpretación de hfapeffInterp>` y el rótulo deja de
  decir «(eco)», porque con los tres dominios en juego ese paréntesis sería falso.
- **Sin péptido** la rama de HEAD se conserva entera: «4/4 en eco — HFpEF probable» o «N pts eco»,
  y el rótulo «HFA-PEFF (eco)». El punto «sin péptido, idéntico a HEAD» queda **garantizado por
  construcción** y no por una medición a posteriori.
- **La compuerta de visibilidad sigue exigiendo los DOS dominios de ECO**, también con péptido:
  este renglón es del cuadro del Doppler y un péptido suelto no es un hallazgo ecocardiográfico.

El cartel declara el corte **antes de confirmar** leyendo `hfUmbrales(fa)` para el texto y
`hfapeffScore(false).hum` para los puntos: **no reimplementa ninguna comparación**, así que lo que
muestra es por construcción lo que el score va a sumar. Y **filtra por el tipo que muestra**: el
otro péptido puede cumplir su propio corte, y atribuirle esos puntos a este valor sería afirmar lo
que el valor no dice.

**«Confirmar» cierra y nada más**, y eso es correcto: el espejo ya escribió el dueño al tipear.
Las **cuatro** puertas de salida —Confirmar, Cerrar, Escape y el clic en el fondo— pasan por
`hfPepCerrar` y las cuatro repintan, así que no hay un estado donde el dueño y lo que se ve
discrepen.

---

## 6 · Accesibilidad: qué sale gratis y qué no

El bloque de accesibilidad del final del archivo tiene **dos oyentes genéricos por selector**, y el
cartel entra en los dos:

- **Escape** busca el `[role="dialog"][aria-modal="true"]` visible más alto y **clickea el primer
  botón** cuyo texto u `onclick` matchee `/cerrar|✕|✖|×|close|cancel|hide|ocultar/i`. Por eso el
  cartel tiene un botón que dice **«Cerrar»** y no hace falta un oyente propio — y sin oyente
  propio no hay un segundo camino que se desincronice. ⚠️ **Si alguien le cambia el rótulo a
  «Listo», Escape deja de funcionar y nada más lo avisaría.** TC-465 lo fija.
- **La trampa de Tab** también lo alcanza por selector. Medido: el recorrido cicla Confirmar →
  Cerrar → tipo → valor y vuelve, **sin escaparse** a la página de atrás.

**Lo que NO sale gratis es el foco:** `STATIC_MODALS` vigila cuatro ids y éste no es uno, así que
`openModal`/`closeModal` —los que guardan y reponen el foco— no corren.

⚠️ **EL FOCO VUELVE POR POSICIÓN Y NO POR REFERENCIA, y lo encontró la sonda.**
`hfapeffLineaEco` reescribe el `innerHTML` del renglón, así que el `<button>` que abrió el cartel
queda **DESCONECTADO** del documento: `document.contains` da `false` y el foco se caía al `<body>`.
Se recuerda **si** el nodo vivía dentro del renglón —ANTES de repintar, que es cuando todavía está
conectado— y después se enfoca el botón **NUEVO** de ese renglón.

---

## 7 · Trampas medidas en esta zona

- ⚠️ **LOS DOS CAMPOS DUEÑOS NO TIENEN GEOMETRÍA HASTA QUE SE ABREN DOS PUERTAS**: la pestaña
  Hemodinámica (que el plan Básico esconde del rail) y la tarjeta plegable `#hfapeff-seccion`. Una
  sonda que les tipee sin abrirlas **aborta** con «SIN GEOMETRIA hf_ntprobnp», que es lo correcto —
  y si el lector no mira el aborto, la tabla sale con **todos los puntos en cero** y dice «ningún
  corte funciona» sobre cortes que funcionan. **Pasó tres veces en esta tanda** (grupos `B`, `R` y
  `N`). La puerta la abre `__H.abrirAvanzado()`.
- ⚠️ **ENFOCAR UN CAMPO EN UNA PESTAÑA OCULTA FALLA EN SILENCIO.** Para medir el espejo EN VIVO con
  el cartel abierto hay que poner la pestaña de Avanzado **debajo** del cartel: el overlay queda a
  la vista igual y el campo recupera geometría. Y el foco va **por DOM**, porque un clic de mouse
  se lo comería el overlay.
- ⚠️ **EL ID DEL BOTÓN DEL RENGLÓN SE VUELVE A RESOLVER EN CADA APERTURA.** Al cerrar, el renglón se
  repinta y el nodo al que la sonda le había puesto un id **ya no existe**: con el id viejo,
  `clicEn` informa «NO SE PUDO» y las escenas siguientes miden con el cartel **cerrado** — el Tab
  «se escapaba» de un diálogo que no estaba abierto.
- ⚠️ **`check_backticks.py` NO ALCANZA A LOS TEMPLATES INLINE DE UNA SONDA.** Cubre el cuerpo de un
  `caso(...)` y el de la sonda inyectada, pero no un `` J(`…`) `` suelto: dos acentos graves en un
  comentamio mío ahí pasaron su chequeo y los cazó `node --check`. **Correr los dos.**
- ⚠️ **TC-GR-06 ES INESTABLE POR ORDEN DE CORRIDA**, al lado de TC-246, TC-249, TC-252 y TC-260.
  Sale rojo en una corrida de 15 casos de la zona y **verde dos veces corrido solo**, con el mismo
  árbol. Un bisect sobre un caso inestable «confirma» lo que uno quiera. **Repetir antes de
  sospechar.**

---

## 8 · Cómo medir esta zona

```bash
node scripts/_probe_hfpep.mjs --solo P            # el plan: a qué pestaña manda el botón
node scripts/_probe_hfpep.mjs --solo A            # foco, Escape, clic en el fondo, trampa de Tab
node scripts/_probe_hfpep.mjs --solo S            # sincronía en los dos sentidos, con teclas reales
node scripts/_probe_hfpep.mjs --solo B            # la tabla de bordes, 24 filas
node scripts/_probe_hfpep.mjs --solo R            # cambiar el ritmo con el péptido cargado
node scripts/_probe_hfpep.mjs --solo V            # SIN péptido: tiene que dar 0 contra HEAD
node scripts/_probe_hfpep.mjs --solo G            # guardado, «Nuevo estudio» y reapertura
node scripts/_probe_hfpep.mjs --solo W            # 1200 / 390 / 360 px en los dos temas
node scripts/_probe_hfpep.mjs --solo N            # control negativo mayor (diastólica, válvulas, Excel)
node scripts/_probe_hfpep.mjs --solo Q            # FEVI < 50 % y el ritmo que no es ninguno de los dos
node scripts/_probe_hfpep.mjs --solo X            # censo de botones que van a Avanzado

node scripts/test_clinico.mjs --solo TC-465       # 39 condiciones
```

**Los grupos se corren de a uno:** varios en una sola página se cuelgan. Para el A/B hay que
copiar HEAD a un archivo y pasarlo con `--file`; la sonda comprueba el `md5` de `index.html` al
principio y al final y lo publica en su salida.

---

## 9 · Dónde está lo demás

| Qué | Dónde |
|---|---|
| Los cortes, con su procedencia y por qué NO están verificados | `docs/fuentes/FUENTES.md` → `### hfaPeff2019` |
| Lo declarado y no tocado | `docs/PENDIENTES.md` → H1 a H8 |
| La función diastólica y sus tres algoritmos | `docs/mapa/diastolica.md` y los tres mapas que cuelgan de él |
