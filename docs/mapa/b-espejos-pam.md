<!-- Mapa de la tanda B — 2026-10-27. Se abre a demanda; no se carga solo.
     Armado sobre el árbol sellado de la tanda. SIN números de línea a propósito: la línea
     cambia en cada edición, el nombre de la función no. -->

# Mapa — cuándo se actualiza un espejo, y de quién sale la PAM

Dos cambios de **mecánica**. Ninguno mueve un corte, un umbral, un rótulo de grado ni una frase
del informe. Lo que cambia es **cuándo** se repinta un campo que lee otra pestaña y **de cuál de
las tres fuentes** sale la presión arterial media.

---

## 1 · Qué es un «espejo» en esta app

Tres formas, y las tres muestran un dato que **vive en otra pestaña**:

| Forma | Cómo se reconoce | Cuántos |
|---|---|---|
| Campo de solo lectura | `<input readonly>` con id terminado en `_ro` | **28** |
| Campo declarado espejo | atributo `data-espejo` — `<select disabled>` o `<input hidden>` | 5 |
| Texto calculado | un `<span>`/`<div>` con id que un pintor reescribe | los de la tabla de §3 |

Un espejo **no se vuelve a pedir**: el rótulo de su caja lo dice («Tomados de otras pestañas —
no se vuelven a pedir», «Peso y talla NO se vuelven a pedir»). Dos campos para la misma medida
es el patrón del espesor parietal, que este archivo ya pagó tres veces.

## 2 · El defecto, medido antes de tocar nada

Cada espejo se repintaba sólo desde el `oninput` de **sus** campos y desde `RECALC_MODULOS`, que
es el embudo de las cinco rutas de restauración. **Cambiar la fuente no avisaba a nadie.**

Medición: las **veinticuatro fuentes** de otra pestaña cambiadas de a una, esperando 1.400 ms, y
después preguntando a cada una de las 94 funciones del embudo si movía algo. Lo que movía estaba
mostrando el dato anterior.

| Pintor | Fuentes que lo dejaban viejo |
|---|---|
| `popSync` | 14 |
| `tvSync` | 5 |
| `dapSync` · `vapSync` | 4 cada uno |
| `eteShuntSync` · `ebsSync` | 3 cada uno |
| `dsavSync` | 2 |
| `calcVD` (vía `calcTEP`) · `coaSync` · `tgaSync` · `cvpaSync` | 1 cada uno |

**Once pintores.** Tras la tanda, la misma medición da **cero** en las veinticuatro.

### Los dos síntomas que el médico vio, confirmados

- **S1** — con Swan-Ganz, cambiar GC, PAM, PAPs, PAPd, PCP o PAD **no** actualizaba el esquema,
  el texto de abajo ni la conclusión. Causa: esos siete campos llaman sólo a `popHemoSync()`,
  que pinta su propia caja; el esquema (`popEsqPintar`), la conclusión (`popConclSync`) y el
  POCUS (`popPocusSync`) cuelgan de `popSync()`, que **sólo** lo llaman el selector de
  monitoreo, las casillas de droga y el tipo de asistencia.
- **S2** — el texto de dosis de una dilución no seguía al peso. Causa: `popDosisDilucion` lee
  `v('peso')`, que vive en otra pestaña, y corría sólo desde el `oninput` de sus tres campos.

## 3 · El mecanismo: un registro y el debounce que ya existía

```
ESPEJOS_VIVOS()        → la lista declarada de pintores, al lado de RECALC_MODULOS
_espejosBarrerTodos()  → la recorre con try/catch por pintor
_amiloBarrido          → el oyente de input/change en CAPTURA, con su debounce de 220 ms
```

**No hay temporizador nuevo y la frecuencia no sube.** El barrido cuelga del mismo debounce que
los bloques integrados ya tenían, y corre **antes** de `amiloRefrescarTodos()`: aquél regenera
el texto de las hojas leyendo la pantalla, así que repintar los espejos después dejaría la hoja
armada con el dato anterior.

### Los dieciocho pintores del registro

| Pintor | Qué mantiene al día | De dónde lee |
|---|---|---|
| `tvSync` | `mch_tvns`, `tdf_tv`, `mca_v_*` y, por cascada, `mch_siv_ro`, `mch_ai_ro`, `mch_fevi_ro`, `mca_plax_ro`, `tdf_tsvd_ro` | arritmia ventricular, AI/VI, VD |
| `dapSync` · `vapSync` | `dap-qpqs`, `vap-qpqs`, `vap_paps_ro` | TSVI, TSVD, PSAP |
| `coaSync` | `coa_ao_asc_ro` | `ao_tub` |
| `ebsSync` | `ebs_it_ro`, `ebs_areas_ro`, `ebs-desp-idx` | AI, AD, válvulas |
| `tgaSync` | `tga_dilatacion_ro`, `tga_it_ro` | VD, válvulas |
| `dsavSync` | `dsav_vi_ro` | FEVI y DTSVI |
| `cvpaSync` | `cvpa_cia_ro`, `cvpa_vd_ro` | tipo de CIA, VD |
| `eteShuntSync` | los seis `ete_shunt_*_ro`, `ete-cia-paps-it`, `ete-civ-paps-it`, `ete-shunt-ddvii`, el donut | peso, talla, TSVI, TSVD, DDVI, PSAP |
| `calcTEP` | `tep-vdvi-interp`, `tep-tapse-psap` | DDVI, VD basal, TAPSE |
| `popHemoSync` | la caja del Swan, la del eco y la concordancia | peso, talla, TSVI, VTI, FC |
| `popPocusSync` | pericardio, pleura, pulmón y VD del POCUS | Otros, VD/AD, Doppler |
| `popEsqPintar` | el esquema y su texto | todo el POP |
| `popConclSync` | la conclusión y las cinco preguntas | todo el POP |
| `popDosisTodas` | el texto de dosis de las diez drogas | **el peso del paciente** |
| `pamAvisoSync` | la línea del dueño único de la PAM, en dos lugares | las tres fuentes de PAM |
| `aoRefPintar` | la columna de referencias del Doppler aórtico | su propia pestaña |
| `calcHemo` | la fila «PAM» de esa columna, vía `aoRefHemo` | ídem |

### Qué queda FUERA, y por qué

Sólo entran pintores que escriben **texto** o campos de **solo lectura**. Medido: el barrido
corrido tres veces seguidas no mueve **un solo** campo que el médico pueda tipear — 940 en la
foto, más tres centinelas sembrados en los campos que escriben las excluidas.

⚠️ **Con una excepción, declarada porque esconderla sería peor.** `tvSync` vacía `tv_tipo` y
`tv_morfologia` cuando la taquicardia ventricular **no** está documentada — y en el mismo gesto
los **deshabilita**, que es por lo que una foto de campos editables no los ve. No es una pérdida
nueva: `tvSync` ya estaba en `RECALC_MODULOS`, así que esa compuerta corría en las cinco rutas de
restauración. TC-538 **(d1b)** la fija de los dos lados.

| Excluida | Motivo |
|---|---|
| `popSync` | **borra campos**: apaga la dosis de una droga desactivada y los detalles de la asistencia. Entran en su lugar sus cinco pintores puros, que cubren los mismos nodos |
| `calcVD` | escribe `vd_fac`, que es un campo del estudio y sale al informe firmado. Lo único que dejaba viejo es `tep-vdvi-interp`; ése lo pinta `calcTEP`, que no escribe nada |
| `imEspejosRestaurar` · `sincronizarTEERDesdeGlobal` | no son desfase: se pasan la marca `espejoVivo` el uno al otro y mueven en **cada** pasada con el dato quieto |
| `v2dCerrar` · `m3dBotonSync` | cierran la vista 2D y el 3D. Un barrido que corre con cada tecla cerraría el panel que el médico acaba de abrir |

⚠️ **La exclusión la vigila TC-538 (d3).** Sin ese control, «completar» la lista más adelante
cerraría un panel cada 220 ms y nadie sabría por qué.

### Lo que cuesta

Doce teclas reales sobre un estudio con los **diecisiete** bloques integrados: **0,6 a 0,8 ms**
cada una en régimen, idéntico al árbol anterior. El barrido de espejos corre **una** vez, 220 ms
después de la última tecla, y tarda **1,7 ms**. El de los bloques integrados, 5 ms.

---

## 4 · La PAM: un solo dueño

**Decisión de Maicol**, aplicada: (1) la medida por catéter o línea arterial; (2) si no hay, la
tipeada; (3) si no hay, la calculada de PAS y PAD.

### Dónde vive cada una

| Nivel | Campo | Compuerta |
|---|---|---|
| (1) invasiva | `pop_sw_pam` | sólo con `pop_monitor` en `swan` — la misma compuerta que `popPatron` ya aplicaba |
| (2) tipeada | `hemo_pam` **sin** la marca `dataset.derivadoDe` | — |
| (3) calculada | `hemo_pam` **con** la marca; el valor **redondeado** que `aoPresionSync` materializa | — |

⚠️ **(2) y (3) comparten campo**, y lo que las distingue es la marca que pone `aoPresionSync`
cuando la app lo escribe. Por eso `aoPresionSync` no se tocó: sigue siendo el único que
**escribe**; `pamEfectiva()` sólo **lee**.

⚠️ **LA CALCULADA GANA CON EL REDONDEADO, NO CON EL CRUDO.** `aoPresionSync` escribe
`pam.toFixed(0)`, así que lo que hoy alimenta la vasoplejia del posoperatorio es **87** y no
86,666…. El A/B lo destapó: devolver el crudo movía el número que entra a un corte clínico
(PAM < 65 mmHg) sin que nadie lo pidiera. El crudo se conserva aparte, y **sólo para comparar**.

### Quién la lee

| Lugar | Antes | Hoy |
|---|---|---|
| Fila «PAM» de la columna del Doppler aórtico (`ao-ref-pam`) | `hemo_pam` a secas — **ignoraba la del catéter** | `pamEfectiva()` |
| Vasoplejia del posoperatorio (`popPatron`) | (1) › `hemo_pam` | `pamEfectiva()` |
| Esquema del posoperatorio (`popEsquema`) | (1) › `hemo_pam` | `pamEfectiva()` |
| **RVS de Hemodinámica** (`calcHemo`) | `hemo_pam` a secas | **sin cambiar** — ver `PENDIENTES.md` **B-a** |
| Columna del Excel · Laboratorio | `hemo_pam` crudo | **sin cambiar**: es el campo, no el dueño |
| Caja del Swan (`pop-sw-rvs`) | `pop_sw_pam` | **sin cambiar**: es la fuente, no un lector |

### El aviso

Una línea, sin color de alarma, en **dos** lugares: bajo la PAM de Hemodinámica
(`hemo-pam-auto`) y bajo la del Swan (`pop-pam-aviso`, **nuevo**).

> PAM en uso 58 mmHg, medida por catéter (Swan-Ganz) · difiere de la tipeada en Hemodinámica (95 mmHg)

- Sale **sólo** cuando dos fuentes cargadas difieren **después de redondear al mmHg que se
  muestra**. No hay ningún umbral clínico nuevo: inventarlo estaba prohibido.
- **No entra** al informe, al EN SUMA, al PDF ni al PPT. Los dos nodos son `<div>` de pantalla.
- Con **una sola** fuente el texto es el de siempre, letra por letra: «auto ← PAS/PAD del
  Doppler aórtico» cuando la calculada es la única, y vacío en todo lo demás. Lo cuenta TC-424.

### Las nueve combinaciones, medidas contra el árbol anterior

| Fuentes | Gana | Fila «PAM» | Aviso | Papel |
|---|---|---|---|---|
| ninguna | — | `—` | — | **idéntico** |
| catéter | catéter 58 | `58 mmHg (Swan-Ganz)` | — | **idéntico** |
| tipeada | tipeada 95 | `95 mmHg` | — | **idéntico** |
| calculada | calculada 87 | `87 mmHg (auto)` | «auto ←…» | **idéntico** |
| catéter + tipeada | catéter 58 | `58 mmHg (Swan-Ganz)` | nombra la tipeada | **idéntico** |
| catéter + calculada | catéter 58 | `58 mmHg (Swan-Ganz)` | nombra la calculada | **idéntico** |
| tipeada + calculada | **tipeada** 95 | `95 mmHg` | nombra la calculada | **idéntico** |
| las tres | catéter 58 | `58 mmHg (Swan-Ganz)` | nombra las otras dos | **idéntico** |
| calculada con `hemo_pam` borrado a mano | — | `—` | — | **idéntico** — ver **B-c** |

«Papel» = `popPatron()`, la hoja del posoperatorio, el informe y el EN SUMA.

---

## 5 · Lo que se midió y NO se arregló

Está en `docs/PENDIENTES.md`, de **B-a** a **B-f**. Los dos del pedido:

- **S5** — `vd_vi` **sí** llega al PDF: la tabla del VD imprime `VD/VI: 1.30`. Lo que no llega
  es al **POCUS del posoperatorio**, que lee `tep_vdvi` y, si falta, `vd_bas ÷ ddfvi`, pero
  **nunca** `vd_vi`. En el **mismo PDF**, cinco páginas después, la hoja del posoperatorio
  imprime `TAPSE 16 mm · VD/VI -`. Y la pantalla dice «Completar: VD/VI (tab VD/AD)» sobre un
  campo que está cargado en esa misma pestaña. Arreglarlo cambia una hoja firmada → **B-d**.
- **S6** — la dosis **sí** llega: `Noradrenalina 0.25 mcg/kg/min` está en la hoja del PDF y en
  el PPT. Lo que no la lleva es el **cuerpo del informe** ni el **EN SUMA**, porque el módulo
  `pop` no declara `enCuerpo` en `amiloSecs()`. Cambiarlo es agregar el posoperatorio al cuerpo
  del informe → **B-e**.

Y el borde de la PAM: la **tipeada sí se conserva** al recargar —medido—, lo que no sobrevive es
la marca `derivadoDe` → **B-b**.

---

## 6 · El A/B, y la trampa de instrumentación que destapó

`scripts/_probe_bab.mjs` + `scripts/_ab_bdiff.mjs`, dieciocho escenas —cuatro nuevas con una,
dos y tres fuentes de PAM—:

- **A · superficies firmadas y de cálculo: CERO diferencias.** Informe en los tres estilos, EN
  SUMA, las **440** columnas del Excel clave por clave, los 960 campos, el Laboratorio por sus
  ocho funciones dueñas, las cápsulas de pantalla, el **PDF generado de verdad** en sus seis
  plantillas y el PPT (23 textos).
- **B · pantalla: 21 diferencias**, y son el **control positivo**: sin ellas, el cero de arriba
  no se distingue de «la sonda no está mirando nada». Son los tres nodos de la PAM —
  `ao-ref-pam` cambia en las dos escenas donde el dueño pasa a ser el catéter, el aviso aparece
  en la única escena con dos fuentes que difieren, y `pop-pam-aviso` pasa de «NO EXISTE» a
  cadena vacía en las dieciocho, porque el nodo es nuevo.

⚠️ **EL A/B DE LAS TANDAS ANTERIORES NO PASABA POR EL EMBUDO DE RESTAURACIÓN, Y VENÍA ASÍ DESDE
`_probe_r2ab.mjs`.** El montaje hacía `RECALC_MODULOS.forEach(...)` y `RECALC_MODULOS` es una
**función**: tiraba `TypeError`, el `catch` lo tragaba y el embudo **nunca corría**. Lo destapó
esta tanda al agregarle una entrada (`pamAvisoSync`) y ver que el A/B no la tocaba. Corregido a
`_recalcModulos('ab')` en `_probe_bab.mjs`; **las copias viejas siguen con el defecto**.

⚠️ **Y HAY QUE ESPERAR AL DEBOUNCE ANTES DE MEDIR.** Los campos se ponen despachando `input` y
`change`, así que el barrido queda **agendado**: midiendo en el acto se lee el árbol de antes.
Sin la espera de 500 ms el control positivo daba cero y el A/B se leía como «no cambió nada».

## 7 · El caso

`TC-538`, con su ficha en `docs/mapa/tests-fichas-538.md`.

---

## ⚠️ La tanda D sumó un pintor al registro (2026-10-27)

`amiloScoreSync` entró en `ESPEJOS_VIVOS()`: trae los insumos del score de amiloidosis desde las
otras pestañas y deja que el módulo marque sus casillas. Cuelga del **mismo** debounce de 220 ms
y **no escribe un solo campo del estudio**, que es la regla con la que este registro excluye a
`popSync` y a `calcVD`.

El sentido inverso —módulo → estudio— **no** entró acá a propósito: cuelga del `oninput` del
propio calculador, que es un gesto del médico. Y cuando el campo del estudio ya tiene otro valor,
**no lo pisa**: lo declara, con el mismo criterio que el aviso de discrepancia de la PAM.

Detalle en `docs/mapa/d-cardioonco-amiloidosis.md` § 2.
