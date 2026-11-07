# Mapa — la Evidencia de un sector avanzado y los textos que comparaban fuentes (PANT-22)

Tanda del **2026-11-07**. Dos cosas: (1) una sección de Evidencia de un **sector avanzado** sólo
existe si el sector está **incluido en el informe**; (2) los textos de la Evidencia y de
Referencias que decían que dos fuentes no coinciden se reescribieron con cada fuente en su propia
oración.

---

## 1. El ayudante: `_indSectorIncluido(av)`

Vive **justo antes de `const IND_SECS`** y se expone en `window`. Es el único lugar que decide si
una sección de un sector avanzado existe.

```
function _indSectorIncluido(av)   ->  true | false
```

| qué hace | cómo |
|---|---|
| sin sector declarado | `av == null` → **`true`**: la sección no se filtra. Es lo que deja intactas las treinta y dos que no son de un sector avanzado |
| una clave | `amiloIntegrado('cvr')` |
| una lista | alcanza con **UNA**: la amiloidosis son dos hojas (`ett` y `alg`) y el ETE son cinco |

⚠️ **LEE EL MISMO INTERRUPTOR QUE LEE EL INFORME, Y NO UNA COPIA DEL CRITERIO.** El dueño único de
«este sector está en el informe» es **`amiloIntegrado(k)`** —el bloque `#am-wrap-<k>` visible—, que
es el que `amiloEnInforme()` consulta para armar la hoja del PDF y el que `#am-integrados` persiste
con el estudio. Con un predicado propio acá, el día que ese interruptor cambie el panel y el
informe discreparían sobre el mismo sector.

⚠️ **LA LLAMADA A `amiloIntegrado` ES PELADA, SIN `typeof`.** Es el mismo fail-closed que
`amiloEnInforme` aplica a `omitir`: si no existiera, un `typeof` devolvería falso en silencio;
pelada tira `ReferenceError`, lo caza el try/catch de `indicRender` y la sección no se pinta. Las
dos formas de fallar terminan del lado que el médico pidió.

---

## 2. Dónde se consulta: `indicRender`, y en ningún otro lado

```
    try { if (s.av != null && !_indSectorIncluido(s.av)) return;
          r = s.fn(); if (r) hs = _indSecHTML(s.tit, r); }
    catch (e) { fallos++; … return; }
```

`indicRender` es el **único** punto por el que el panel se arma: lo llaman `indicAbrir` y
`_indRepintarConservando`, censado. Por eso el mecanismo es **uno** y no trece copias de un `if` al
principio de cada sección.

⚠️ **EL `return` DE ESA LÍNEA NO CUENTA COMO FALLO**: la sección no está caída, está fuera de
alcance, así que no incrementa `fallos` ni se declara al pie.

⚠️ **POR ESO TC-322 NO SE ROMPE**, y la premisa de la orden no se reprodujo: ese caso llama a
`S.fn()` **directo** y el filtro no lo alcanza. No se adaptó.

⚠️ **EL PANEL SÓLO SE ARMA AL ABRIR.** Medido: es un overlay `position:fixed` con `z-index:300`, y
el botón «Integrar al informe» de un sector queda **tapado** por él (`document.elementFromPoint`
devuelve `indic-overlay`). Así que para incluir o sacar un sector hay que cerrar el panel, y al
reabrirlo se rearma. **No se agregó ningún mecanismo de repintado.**

Si el panel queda **sin ninguna sección**, muestra lo que ya mostraba: «Sin criterios de
intervención detectados con los datos actuales». Cero frases nuevas.

---

## 3. Las TRECE secciones y su sector

La propiedad es **`av`** en la entrada de `IND_SECS`, el mismo patrón con que `amiloSecs` declara
`soloHoja`, `omitir`, `enCuerpo` y `hayDatos`.

| sección de `IND_SECS` | función | `av` |
|---|---|---|
| Tromboembolia pulmonar — estratificación del riesgo | `_indTEP` | `'tep'` |
| Hipertensión pulmonar — probabilidad ecocardiográfica | `_indHTP` | `'htp'` |
| Insuficiencia cardíaca con FE preservada — HFA-PEFF | `_indHFPEFF` | `'hfpeff'` |
| Ecocardiograma transesofágico — trombo en la orejuela | `_indETETrombo` | `'oai'` |
| Reparabilidad de la válvula mitral | `_indReparMV` | `'etem'` |
| Ateroma aórtico — prevención | `_indAtero` | `'aoete'` |
| Derrame pericárdico y taponamiento | `_indDerrPeri` | `'dpt'` |
| Constricción pericárdica — diagnóstico | `_indConstr` | `'cvr'` |
| Congestión venosa sistémica — VExUS | `_indVexus` | `'vexus'` |
| Perfil hemodinámico — presiones y resistencias | `_indHemo` | `'hemo'` |
| Cardiotoxicidad por tratamiento oncológico | `_indConco` | `'conco'` |
| Amiloidosis cardíaca — algoritmo diagnóstico | `_indAmil` | `['ett','alg']` |
| Posoperatorio de cirugía cardíaca | `_indPOP` | `'pop'` |

⚠️ **LAS TRES DEL ETE NO LO DICE SU NOMBRE**, y se verificaron por el contenedor de sus campos:
`oai_trombo` en `#ete-seccion-oai`, `ete_prof_coapt` en `#ete-seccion-morfo` y `ao_grado_atero` en
`#ete-seccion-aorta`.

⚠️ **`wilk` Y `teer` NO TIENEN SECCIÓN DE EVIDENCIA**, censado sobre las 45. El día que la ganen,
**TC-748 (F3)** se pone rojo.

**Las treinta y dos restantes no se tocan** (once de válvulas y prótesis, veinte de congénitas y la
aorta torácica): no son de un sector avanzado y se comportan como siempre.

---

## 4. Lo que NO cambia, y es la mitad del pedido

- **La sincronización del dato**: el campo del estudio sigue llegando al sector. Medido con el
  gesto real y con una siembra muda, antes y después de armar el panel. Lo fija **TC-750**.
- **El informe**: sigue sin escribir nada de un sector no incluido.
- **El papel**: A/B de 114 escenas con el PDF y el PPT generados de verdad, **cero diferencias**.
- **Los cortes del panel**: 820 px desde 1000 px y `IND_COLS_CORTE` intactos.

---

## 5. Los textos: cada fuente en su propia oración

Lo que sale es **la oración o la parte** que compara, juzga o dice una ausencia como hallazgo. Lo
que cada fuente afirma queda, con su hoja y su folio.

**Las siete del commit 4** (Hemodinámica y prótesis mitral) y **las veintisiete del commit 5** están
listadas una por una, con su texto de antes y de después, en el mensaje de cada commit y en
`docs/fuentes/FUENTES.md` → «La tanda PANT-22».

⚠️ **NINGÚN NÚMERO, HOJA, FOLIO, TABLA NI CLASE SE PERDIÓ**, contado valor por valor contra HEAD en
las diez secciones medidas y en Referencias. **El único valor que salió es el «1,1 cm²/m²»** del
ejemplo de la prótesis mitral, declarado en `P22-a`: vivía dentro de la oración que comparaba y no
se puede conservar sin conservar la comparación. Lo **fija** TC-751 (C3), que se pone rojo si
alguien repone el ejemplo.

### El censo: cómo se hace y cómo NO

- **En el navegador**, sobre el DOM abierto con los globos de cada fila desplegados, y sobre las
  **cadenas de datos** de los quince registros `*_PREG`.
- ⚠️ **EL GREP CRUDO NO SIRVE**: con los mismos patrones devuelve **469** líneas y la enorme
  mayoría son comentarios. El filtro que sí sirve cuenta comillas y se queda sólo con lo que está
  DENTRO de una cadena literal: **89** cadenas al abrir la tanda, **46** al cerrarla, y las 46 son
  las que no caen bajo la regla.

### Dos formas que NO están en la lista, y por qué

| forma | por qué |
|---|---|
| **«coincide con»** | la usan las **reglas de folio** —«el folio impreso coincide con la hoja del PDF»—, que dicen cómo se numera una fuente y no la comparan con otra |
| **«no gradúa»** en una sección | ahí habla de lo que un gradiente, un cociente o una tabla **hacen** —«esta lista no gradúa ni concluye»—, que es lo que la app dice de sí misma. **Sí** entra en el censo de **notas de tramo**, donde el sujeto es siempre una guía: va en `PROH_TRAMO` y no en `PROH` |

---

## 6. Qué quedó PARADO

En `docs/PENDIENTES.md` → **P22-a**: la tabla de siete filas de la tarjeta de criterios de la
miocardiopatía hipertrófica (comparativa por diseño: sólo se le cambió el encabezado) y la entrada
de bibliografía `escGuchCiv`, cuyo aviso de que el criterio de la app diverge de su fuente no se
puede reescribir sin una decisión clínica.
**P22-b queda vacío**: los dieciséis sectores tienen el **mismo** interruptor, así que no hubo
ninguno que parar por falta de criterio.

---

## 7. Los casos y el barrido

`TC-748` el ayudante y el mapeo · `TC-749` el caso del médico · `TC-750` el dato sincronizado ·
`TC-751` el censo de textos · `TC-752` el papel y el Excel. Las fichas, en
`docs/mapa/tests-fichas-748.md`.

El helper **`__t.avInc(claves)`** vive en el harness y es **idempotente**, porque `amiloIntegrar`
es un **TOGGLE**: llamarlo sobre un sector ya integrado lo RETIRA. Medido: el bloque (D6b) de
TC-537 volvía a integrar hemodinámica y la dejaba afuera, con su texto intacto en 736 caracteres,
porque retirar no borra el textarea.

**35/35 mutaciones dirigidas muertas** (`scripts/_mut_pant22.py`). El primer barrido dejó trece
sobrevivientes: siete huecos reales, dos equivalentes y cuatro mal escritas. La **35 se retiró
declarada**.

⚠️ **SIN UNA SOLA EXPRESIÓN REGULAR EN LOS CASOS NUEVOS**, y se midió por qué: el cuerpo de un caso
es un template literal, así que la barra de `/\s+/` no sobrevive y llega como `/s+/`, que reemplaza
las «s» por espacios. «Estenosis aortica» llegaba como «E teno i aortica».

---

## 8. El commit 5b: las tres que el censo no vio

⚠️ **EL CENSO DEL COMMIT 1 MIDIÓ REFERENCIAS SIN RECORRER TODAS SUS FICHAS, Y SE LE PASARON TRES
CADENAS DE «ninguna guía».** Las fichas se pintan **al abrir su subpestaña** (`evRefPintar`), así
que un censo del DOM de esa pestaña ve sólo lo ya pintado. Es el mismo modo de falla que TC-751
(E4) cobró en su momento, por el otro lado.

**Las encontró la sonda de dos motores al cerrar la tanda**, con una lista de formas más amplia que
la del censo, y se cerraron en el commit `1c4ace3`: la ficha de la orejuela, la del taponamiento y
la de la constricción. **Referencias pasa de tres hallazgos a CERO** sobre 75.030 caracteres con
todas las fichas abiertas, y los folios (2052), las tablas (1227) y las hojas (1176) salen
**idénticos**.

**La lección, para la tanda 2: un censo del DOM de Referencias tiene que abrir sus subpestañas una
por una ANTES de medir, y declarar cuántas abrió.** La sonda `_probe_pant22wk.mjs` lo hace.
