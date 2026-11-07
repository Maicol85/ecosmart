# Fichas de los casos TC-748 a TC-752 — tanda PANT-22 (2026-11-07)

Archivo propio porque `tests-fichas.md` está en **34.237 B**, a 1 KB del techo de ~35 KB.
Los cinco corren con `node scripts/test_clinico.mjs --solo TC-748,TC-749,TC-750,TC-751,TC-752`.

**Los cinco caen contra `e727fe2`** —el cierre de PANT-21— **por condiciones y NINGUNO por
excepción**, verificado en un worktree alternando sólo `index.html` con el mismo archivo de casos.

---

## El helper del harness: `__t.avInc(claves)`

Integra uno o más sectores avanzados y devuelve `{ok, falta}`. Lo usan los cuatro casos que
necesitan un sector incluido.

⚠️ **ES IDEMPOTENTE A PROPÓSITO, PORQUE `amiloIntegrar` ES UN TOGGLE:** llamarlo sobre un sector
**ya integrado lo RETIRA**. Medido al escribir TC-752: su escena integraba hemodinámica y la dejaba
**afuera** —`integrar=1 · integrado=false`— porque el bloque `(D6b)` de **TC-537**, que corre en
el mismo lote, ya la había integrado; y retirar **no borra el textarea**, así que su texto seguía
ahí en 736 caracteres y el síntoma no se parecía a la causa.

```
avInc: ks => { const f = [];
  (Array.isArray(ks)?ks:[ks]).forEach(k => {
    if (!amiloIntegrado(k)) amiloIntegrar(k);
    if (!amiloIntegrado(k)) f.push(k); });
  return { ok: f.length === 0, falta: f.join(',') } }
```

Las **cinco** llamadas de los casos pasan por él, y `(D6b)` de TC-537 recibió la misma guarda: hoy
es **más fuerte**, porque ya no depende de en qué estado lo dejó el caso anterior.

---

## TC-748 — el ayudante y las trece secciones

**17 condiciones, 6 bloques.** Mide `_indSectorIncluido` **directo** y el registro `IND_SECS`.

- **(A0)** denominador: existen el ayudante **y** `amiloIntegrado`.
- **(B1)(B2)(B3)** control negativo: sin integrar nada dice **NO** a los doce sectores de clave
  única y **NO** a la amiloidosis, que tiene dos; y **`true` con `null`**, que es lo que deja las
  treinta y dos secciones que no son de un sector avanzado donde estaban.
- **(C1)(C2)(C3)** integrar uno enciende **ése** y ninguno de los otros once; con dos integrados
  dice sí a los dos.
- **(D1)(D2)** con **una sola** de las dos claves de la amiloidosis dice sí, y **la otra sola sigue
  en NO** — que es lo que prueba que `['ett','alg']` no es un alias de una sola.
- **(E1)** retirar apaga.
- **(F1)** son **TRECE** y no una más ni una menos. **(F2)** toda clave declarada existe en
  `amiloSecs`: una mal tipeada dejaría la sección **invisible para siempre** sin un solo error.
  **(F3)** `wilk` y `teer` siguen **sin** sección. **(F4)** cada una está conectada a **SU** sector.

⚠️ **EL ACCESOR VA CON GUARDA**, porque contra el árbol anterior la función no existe: un caso que
cae con `ReferenceError` no dice **qué** invariante se rompió. Es la lección de TC-546.

---

## TC-749 — el caso del médico

**12 condiciones, 3 bloques.** La escena del reporte: TAPSE bajo, E/e′ elevado, **ningún** sector
incluido.

- **(A0)(A0b)** los dos denominadores: ningún sector integrado **y** los campos del eco basal
  entraron. Sin el segundo, «no abre ninguna sección» no se distingue de «no sembré nada».
- **(A1)** el panel **no abre ninguna** de las trece. **(A2)** y muestra el mensaje que la app **ya
  tenía**: cero frases nuevas.
- **(B1)(B2)(B3)(B4)** control positivo: con la constricción incluida **su** sección aparece y es
  la **única**; retirarla la hace desaparecer; y con la **segunda** hoja de la amiloidosis aparece
  igual.
- **(C1)(C2)(C3)** control negativo de las que **no** se tocan: una estenosis aórtica severa y una
  comunicación interauricular abren su sección igual, y **ninguna** de sector avanzado se cuela.

---

## TC-750 — el dato sigue sincronizado

**9 condiciones, 3 bloques.** Es la mitad del pedido que **no** cambia.

- **(A1)(A2)(A3)** sin ningún sector integrado, el perfil hemodinámico **sigue** calculando su
  índice cardíaco y su gasto, el módulo de constricción **sigue** recibiendo el dato y el HFA-PEFF
  **sigue** puntuando.
- **(B1)(B2)** por la vía **muda** —sembrando el campo sin gesto— el dato también llega, y el
  sector **sigue sin estar integrado**: sincronizar no enciende el interruptor.
- **(C1)** y **después** de armar el panel el dato sigue en su lugar.

---

## TC-751 — el censo de textos

**27 condiciones, 7 bloques.** El caso más grande de la tanda.

- **(A0)** **control positivo**: el censo detecta las **SEIS** cadenas viejas, sembradas como
  texto. Sin él, «cero hallazgos» no se distingue de «el censo no mira nada».
- **(B)(C)** Hemodinámica y prótesis mitral, cada una con su denominador de **más de 4.000
  caracteres**: cero formas prohibidas, y **los dieciséis números y folios de Hemodinámica siguen
  estando, uno por uno**.
- **(C2)(C2b)(C2c)** la línea de las **dos definiciones** del desajuste está, sus **cinco cortes
  siguen enteros DENTRO de esa línea** y la sección sigue citando su Tabla 7 y su clase.
- **(C3)** el **«1,1 cm²/m²»** del ejemplo que comparaba las dos definiciones **ya no está**: es el
  **único** valor numérico que esta tanda pierde, declarado en `P22-a`, y esta condición se pone
  roja si alguien lo repone.
- **(F)(G)** la constricción y la reparabilidad ya no declaran una **ausencia** de fuente, y siguen
  diciendo que el recuento y el criterio son **propios de la aplicación**, con su Figura S1.
- **(D0)(D1)** las **notas de tramo**, con su propio denominador y con `PROH_TRAMO`.
- **(E)** Referencias: cero «no coinciden», los números del foramen oval enteros, y la ficha del
  tracto de salida del VD ya **no** dice que los techos difieren ni que la diferencia se muestra
  sin resolver, con sus **NUEVE** números intactos.

⚠️ **DOS LISTAS DE FORMAS PROHIBIDAS Y NO UNA.** `PROH` para las secciones y
`PROH_TRAMO = PROH.concat(['no gradua','no gradúa','no dicen lo mismo','no piden lo mismo'])` para
las notas de tramo. **«no gradúa» tiene usos legítimos** en las secciones de válvula —ahí el sujeto
es un gradiente o una tabla, no una guía—, así que en `PROH` daría un falso rojo.

⚠️ **NI UNA EXPRESIÓN REGULAR, Y SE MIDIÓ POR QUÉ.** El cuerpo de un caso es un template literal,
así que la barra de `/\s+/g` **no sobrevive** y llega como `/s+/g`: reemplaza las «s» por espacios y
«Estenosis aortica» pasa a «E teno i aortica», con lo que **ningún título empareja** y las
condiciones miden sobre la nada. Los dos normalizadores —`N` para espacios y `SIN` para tildes—
recorren `charCodeAt`.

⚠️ **LA FICHA DEL VD SE MIDE EN EL REGISTRO Y NO EN EL DOM**, y eso corrigió un rojo falso:
`evRefPintar` pinta las fichas **sólo cuando se abre su subpestaña**, así que el DOM de Referencias
daba 88.054 caracteres con **cero** apariciones de lo que (E4) vigila. **(E3)** es su denominador.

---

## TC-752 — el papel y el Excel

**6 condiciones.** El control de que esta tanda no movió una palabra del papel.

- **(A0)(A0b)(A1)** tres denominadores: cuatro sectores integrados, el panel **abierto y con
  secciones**, y el informe **emitido y con texto**.
- **(A2)** el informe y el EN SUMA **no** llevan nada del panel: ni clase, ni tabla, ni folio, ni el
  nombre de una sección.
- **(B1)(B2)** el Excel sigue en **457** columnas y **ninguna** nombra la inclusión de un sector.

---

## Los CINCO casos viejos que la corrida completa destapó

⚠️ **NINGUNO LO ENCONTRÓ EL CENSO**, y es el modo de falla que este repositorio ya documenta diez
veces: grepeé por el nombre de lo que toqué y los cinco lo dicen con otras palabras. **Los cinco
pasan 5/5 contra `e727fe2`** con el mismo archivo de casos, así que eran **consecuencia autorizada**
y no una regresión.

### Tres medían una sección de Evidencia sin integrar su sector

| caso | sector | qué se le agregó |
|---|---|---|
| **TC-520 (F)** | `hfpeff` | `avInc('hfpeff')` + **(F0b)**. Su helper `resp()` responde **clickeando** el botón dentro de `indic-cuerpo`: sin el sector incluido la fila no se pinta y la respuesta nunca se registra |
| **TC-553 (A10)** | `oai` | `avInc('oai')` + **(A9b)** |
| **TC-554 (D)** | `htp` | `avInc('htp')` + **(D0b)**, integrado **después** de medir el papel para que (D0) siga midiendo el mismo informe |

⚠️ **EL HELPER DEVUELVE `{ok:[...], falta:[...]}` Y NO `ok:true`**, y las tres condiciones de
denominador se escribieron primero con `=== true`: pasaban el caso a rojo con el sector **bien
integrado**. Hoy piden `falta.length === 0` **y** que la clave esté en `ok`.

### Dos eran el día que ellas mismas anunciaban

**TC-532 (C8)** y **(D8)** y **TC-545 (C6)** exigían «**no tienen fuente**» y «**Ninguna guía de la
biblioteca publica un recuento así**», las dos frases que el commit 5 reescribió por la regla fija
del 04/11. Quedan **INVERTIDAS**: exigen la frase **nueva** —«criterio propio de la aplicación»,
«regla propia de la aplicación» con su **Figura S1**— **y** que la vieja ya no esté, así que pueden
volver a fallar por los dos lados. **Caen contra `e727fe2` por esas tres condiciones**, o sea que
siguen discriminando.
