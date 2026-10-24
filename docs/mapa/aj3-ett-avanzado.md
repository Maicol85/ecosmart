<!-- mapa armado sobre a621933, 2026-10-23; los números de línea no se guardan a propósito -->

# Mapa de funciones — La tanda AJ3

Archivo **propio** y no una sección más de otro mapa. Medido con `wc -c` **antes** de escribir:
`congenitas-otros.md` 29,7 KB —el mapa que hoy describe el motor `amilo*`— e
`informe-pdf-excel.md` 34,0 KB. Agregarle a cualquiera de los dos una sección de este tamaño lo
cruzaba, así que lo que entró allá fue **un puntero** y el relato vive acá.

Dos cosas, nada más: **(A)** el bloque del ETT avanzado deja de quedar viejo, y **(B)** la
Evidencia del HFA-PEFF pregunta el **resultado** del paso 3.

---

## Los commits, y el orden de revertido

| # | Commit | Qué trae |
|---|---|---|
| 1 | `b6c8299` | AJ3-2 — el barrido, la marca de edición manual, el aviso ámbar y la confirmación |
| 2 | `a621933` | AJ3-3 — la pregunta nueva de la Evidencia del HFA-PEFF |
| 3 | — | la cobertura (TC-520) y las dos sondas |
| 4 | — | la documentación y el sello |

**El orden de revertido seguro es el inverso del de aplicación.** Los dos primeros **no se
nombran entre sí**: tocan funciones distintas (`amilo*` contra `_indHFPEFF`) y se pueden revertir
por separado. **TC-520 sí cuelga de los dos**: revertir uno sin revertir el caso deja el suite en
rojo con un diagnóstico que apunta a la app y no al revertido.

---

## (A) El bloque del ETT avanzado — AJ3-2

### El defecto, con su medición

El texto de cada módulo se **congela** en su `<textarea am-txt-<k>>` al apretar «Integrar al
informe» y nada lo volvía a calcular. El refresco existía —`amiloRefrescarSiIntacto(k)`— pero se
cableaba **a mano** al final de la calculadora de cada módulo, y estaban cableados **ocho de
diecisiete**: `hfpeff`, `vexus`, `dpt`, `cvr`, `teer`, `wilk`, `oai` y `pulm`.

**A/B contra `2b9f3ef`, con una escena que mueve el dato propio de cada módulo: ONCE de los
diecisiete quedaban viejos** —`ett`, `alg`, `hemo`, `hfpeff`, `htp`, `tep`, `etem`, `wilk`,
`aoete`, `pop` y `conco`—. **Dos de los once estaban en la lista de los «cableados»**
(`hfpeff` y `wilk`): su llamada cuelga de **una** calculadora y los insumos entran por otras, así
que el cableado por módulo ya tenía agujeros adentro. Es literalmente lo que
`_evTarjetaViva` tiene escrito: *colgarse de cada campo es como uno se queda sin cablear*.

El caso que lo destapó: informe y EN SUMA en «probabilidad intermedia» y la hoja de HTP del PDF
todavía en «baja». Un informe firmado contradiciéndose a sí mismo.

### Las piezas, por nombre de función

| Pieza | Qué hace |
|---|---|
| `amiloRefrescarTodos()` | repasa los diecisiete: si no está integrado, apaga el aviso; si está editado a mano, **sólo** evalúa el aviso; si no, delega en `amiloRefrescarSiIntacto` |
| `_amiloBarrido(ev)` | el oyente. `input` y `change` en **captura**, con temporizador de **220 ms**. Ignora lo que pase dentro de `#amilo-card` —tipear ahí es el médico editando, no un dato que cambió— |
| `_amiloEditado` | la marca. **Guarda un TEXTO, no un booleano**: la clave existe ⇔ hubo edición, y su valor es la foto de lo que la app decía **en ese momento** |
| `_amiloEstaEditado(k)` / `_amiloDesmarcarEditado(k)` | los dos accesos |
| `_amiloGenSeguro(k)` | `gen()` sin poder tumbar a quien pregunta: corre detrás de cada tecla |
| `_amiloDesfasado(k)` | integrado **y** editado **y** `gen()` de hoy ≠ la foto |
| `_amiloAvisoPintar(k, on)` | pinta el aviso en sus **dos** lugares |
| `_AM_AVISO_TXT` | la frase única: «Los datos cambiaron desde la edición: revisá este bloque.» |
| `_amiloSyncEditados()` | vuelca las claves marcadas al campo oculto `am-editados` |
| `amiloTxtInput(k)` | el `oninput` del textarea. Reemplazó a `amiloPreview(k)` ahí, y **sigue llamándolo**: lo que agrega es la marca |
| `_AM_VACIA_RETIRA` | los **ocho** módulos que ya se retiraban solos al vaciarse su `gen()` |

### El aviso ámbar — dónde va, y por qué ahí

Dos lugares, los dos **medidos**:

1. **En el bloque**, `<div class="am-stale" id="am-stale-<k>">`, **hermano de `.am-cuerpo` y no
   hijo**. La regla `.am-wrap.cerrado .am-cuerpo{display:none}` lo escondería justo cuando el
   médico tiene el acordeón cerrado, que es como se mira un bloque ya revisado: dentro del
   cuerpo el aviso sólo se vería al desplegar, o sea nunca.
2. **En el botón del módulo**, que vive en otra pestaña: `.btn-integrar.revisar` (anillo ámbar) y
   un `title`. **Sin texto nuevo y sin cambio de alto**: el rótulo lo escribe `amiloSyncBotones`
   y hay casos que lo miden. Es el lugar menos invasivo que el ítem pedía.

Medido en Chrome y WebKit, 1440 y 390 px, los dos temas: el aviso dibuja **1194 × 26 px** en
escritorio y **328 × 42 px** en celular (dos renglones), **cero recorte** en los dos.

### La marca viaja con el estudio

Campo oculto **`am-editados`**, hermano de `am-integrados` y con el mismo mecanismo:
`amiloSyncBotones` lo reescribe en el punto único por el que pasan integrar, retirar y restaurar,
y `amiloTxtInput` también, porque editar no pasa por ahí.

- **No migra nada.** Un estudio anterior no trae la clave, se lee vacía, ningún bloque queda
  marcado y todo se comporta como hasta ayer. Hay una condición de TC-520 que es exactamente eso.
- **`limpiarCampos` la vacía**, igual que `_amiloUltimo`: los `input[type=hidden]` no entran en el
  barrido genérico y sin esa línea la clave del paciente anterior viajaba dentro del estudio del
  siguiente.
- **La reimpresión la respalda y la repone**, en los mismos dos puntos que `_amiloUltimo`.
- ⚠️ **LA FOTO NO SE PERSISTE, SÓLO LA LISTA DE CLAVES.** Al reabrir, la foto se vuelve a tomar
  con el `gen()` de ese momento: un estudio guardado con un bloque editado **y ya desfasado**
  reabre **sin** el aviso, hasta que cambie un dato. Persistirla sería duplicar el texto de cada
  hoja dentro de cada estudio. **Declarado**, y medido: TC-520 (E3…E5).

### La guarda está DOS veces, y las dos hacen falta

`amiloRefrescarTodos` consulta `_amiloEstaEditado` antes de delegar, y `amiloRefrescarSiIntacto`
lo vuelve a consultar como **primera** línea. No es redundancia: **ocho módulos llaman a
`amiloRefrescarSiIntacto` directamente desde su calculadora**, sin pasar por el barrido. Para ese
camino la marca persistida es la **única** guarda, porque `amiloRestaurarDesdeCampos` repone
`_amiloUltimo = ta.value` y entonces la comparación de siempre deja de ver la edición.

⚠️ **ESTO LO DESTAPÓ UNA MUTACIÓN QUE SOBREVIVIÓ.** La primera versión de TC-520 medía ese camino
llamando a `hfapeffRender()` — y la llamada vieja de `hfpeff` **vive en `calcVI`**. La condición
no tocaba el camino que decía medir: una condición vacía con pinta de cobertura. Hoy llama a
`calcVI()` y muere con la mutación.

### «Integrar al informe» sobre un bloque ya integrado

| Estado | Qué hace el botón |
|---|---|
| no integrado | integra, como siempre |
| integrado y **sin** editar | **retira**, como siempre (el atajo documentado) |
| integrado y **editado a mano** | pide `confirm('Se reemplazará el texto editado.')`; con **No** no toca nada, con **Sí** regenera, borra la marca y apaga el aviso |

⚠️ **ES LA LECTURA ESTRECHA DEL ÍTEM, Y ESTÁ DECLARADA.** El ítem decía «volver a tocar regenera
el bloque». Aplicarlo a todos los casos borraba el atajo de retirar desde la calculadora —que es
una decisión documentada y deliberada— sin que nadie lo haya pedido. Y con el barrido puesto, un
bloque **no** editado ya está regenerado antes de que nadie apriete nada: la lectura estrecha no
pierde ninguna función. **Decisión pendiente de Maicol** → `PENDIENTES.md` AJ3-a.

---

## (B) El resultado del paso 3 — AJ3-3

Vive entero en **`_indHFPEFF()`**, la sección del panel de Evidencia. Tres piezas:

1. **La fila.** `clinica.splice(1, 0, _indFilaCtrl('Resultado del paso 3', 'hfpeff.p3res', …))`,
   dentro de `if (p3 === 'hecha')`. Va por `splice` y no dentro del literal: la fila existe o no
   existe, y un `.filter(Boolean)` dejaría la decisión escrita dos veces. Entra en el **índice 1**,
   pegada a la pregunta que la habilita y antes de la presión de llenado.
2. **La marca.** `ok` con «Positivo», `none` con los otros dos, `ask` sin contestar.
   ⚠️ **NUNCA `warn` NI `alarm`**: `_indFilaHTML` sólo pliega la nota de una pregunta cuando la
   marca no es una de esas dos, así que con cualquiera de las dos **el ⓘ de esta fila
   desaparecería** y su explicación saldría estirada en la celda.
3. **Las líneas.** Dos por resultado, en `lineas` → bloque «Pasos que propone la guía», **dentro
   de la rama de puntaje intermedio**, por el mismo motivo que las de la presión de llenado que ya
   estaban ahí: con 5 puntos o más el diagnóstico ya está hecho y con 1 o menos la Figura 2 ni
   siquiera llega al paso 3. La **pregunta** en cambio no está gateada por el puntaje —igual que
   la de la presión—, para que un resultado contestado no desaparezca al corregir un dato.

**El ⓘ no es un término del glosario.** `IND_TERMINOS` exige `fuente`, `pagina` y `referencia`, y
esto es una propiedad **de la app** —«el resultado lo decide el médico, la aplicación no lo
calcula»—, no una cita. Va por la **nota de la fila**, que es el mecanismo de ⓘ que el panel ya
tiene para una pregunta. No se agregó maquinaria.

**Lo que NO cambia:** el informe, el EN SUMA, el puntaje y la hoja del PDF del HFA-PEFF. Medido:
las cuatro superficies **idénticas** con y sin resultado.

**«Falta consignar el resultado del paso 3.»** reemplaza a «Falta consignar si el paso 3 ya se
realizó» en cuanto ese paso se contesta: la pregunta pendiente deja de ser si se hizo y pasa a ser
con qué resultado. La vieja sigue viva para `p3 == null`, que es cuando todavía aplica.

**La presión de llenado en reposo NO se tocó.** El ítem pedía agregarle una frase **si no mostraba
nada**, y muestra: «Con una presión de llenado normal en reposo la guía recomienda continuar la
evaluación durante el ejercicio, por ecocardiografía de esfuerzo o por hemodinámica invasiva
(texto folio 3305).» Medido en Chrome. → `PENDIENTES.md` AJ3-b.

Los folios están en `docs/fuentes/FUENTES.md` → «La tanda AJ3».

---

## Los dos casos NO decididos — AJ3-2e, medidos y sin tocar

### (1) El médico borra todos los datos del módulo

Medido sobre los **diecisiete**, vaciando los campos de los que cada uno depende:

- **Dieciséis de diecisiete** generadores siguen produciendo texto («VRT sin datos», «no
  consignado», «Sin mediciones cargadas»), así que el bloque **se regenera con el texto de “sin
  datos” y sigue integrado**. El retiro automático **no se dispara**, porque sólo mira si `gen()`
  quedó **vacío**.
- **El único cuyo `gen()` queda vacío es `teer`**, y está en `_AM_VACIA_RETIRA`, así que **se
  retira solo** — exactamente como antes de esta tanda.

O sea: **nada cambió** para este caso. `_AM_VACIA_RETIRA` existe para que los nueve módulos que
estrenan refresco **no hereden** el retiro automático, que no estaba decidido. Cuando se decida,
es borrar la lista y su `if`.

### (2) El PDF al exportar con un bloque editado y desfasado

**No avisa nada.** Medido generando el PDF de verdad con el bloque de HTP editado a mano y
desfasado: 82 textos, **cero** menciones de «desactualizado», «sin actualizar», «edición»,
«cambiaron» o «revisá este bloque», y el texto viejo del médico impreso tal cual. El aviso ámbar
es **sólo de pantalla**. Sin cambios. → `PENDIENTES.md` AJ3-c.

---

## Las sondas

- **`scripts/_probe_aj3.mjs`** — CDP sobre el Chrome del sistema. Grupos: `inv` (el registro),
  `diag` (por qué un módulo no deja integrarse), `auto` (los diecisiete, con su denominador),
  `edit` (los siete momentos de la edición manual), `vacio` (los dos casos no decididos), `hf`
  (AJ3-3), `ctrl` (el A/B de control) y `maq`.
  Se corre contra HEAD con `--file`.
- **`scripts/_probe_aj3wk.mjs`** — Playwright, Chrome **y** WebKit, 1440 y 390 px, dos temas.
  El centinela es el `<div>` sin cerrar: **17/17 pestañas con geometría y cero en 0×0**.

### Las trampas que estas sondas pagaron

1. **`indicAbrir()` llama a `_indClinLimpiar()` SIEMPRE**, no sólo al abrir desde cerrado. Dos
   llamadas seguidas a `evidResp` borran la primera respuesta, y la sonda informaba «no hay botón
   con clave `hfpeff.p3res`» sobre un panel que ella misma acababa de vaciar. Se contesta todo en
   **una** apertura (`__W.respMulti`), volviendo a buscar el botón después de cada clic porque el
   repintado destruye el nodo anterior.
2. **Tres módulos tienen compuerta `hayDatos` y se medían SIN HABER SIDO INTEGRADOS** (`teer`,
   `pop`, `pulm`): el resultado salía «no coincide» sobre un textarea vacío. Hay una tabla `PRE`
   de precondiciones.
3. **El botón de POP nace `disabled`** y lo habilita `popSync()`. Sin esa llamada el clic no hace
   nada y `suficiente` daba `true` igual: la compuerta estaba bien y el botón no.
4. **Seis parámetros del perfil hemodinámico son DERIVADOS.** Mover `hemo-gc`/`hemo-ic` —que son
   *spans*— no mueve nada; los insumos son `diam_tsvi`, `itv_tsvi`, `hemo_fc`, `hemo_pam` y `pmad`.
5. **La tarjeta del ETT avanzado vive en la pestaña «Informe».** Sin traerla al frente, los
   diecisiete bloques miden **0×0** y «cero recortes» sale sobre nodos que no están dibujados.
6. **El primer `getBoundingClientRect()` después de un repintado del panel devuelve 0×0** y se lee
   igual que «el botón no se dibuja». Se descarta la primera medición y se vuelve a medir.
7. **`clip` de una captura es en coordenadas de PÁGINA y el panel tiene su propio scroll.** El
   `<tr>` salía en y=1310 sobre una ventana de 900 y Playwright contestaba «Clipped area is either
   empty or outside the resulting image» — **dentro de un `try` que se lo comía en silencio**. Hoy
   la captura de la fila sólo se toma si la fila quedó dentro de la ventana, y si no se **declara**.
8. **Me comí el acento grave trece veces**, todas en comentarios míos, y `check_backticks.py` no
   alcanzó ni al `evCrudo` suelto ni al cuerpo del caso nuevo. **Correr `node --check` también.**

---

## La cobertura — TC-520

**43 condiciones** en seis grupos —contadas instrumentando el propio caso para que publicara su
`ex.length`, no a ojo sobre los `ex.push`—: (A) el registro, (B) los trece módulos con denominador
propio, (C) la edición manual y su aviso, (D) la confirmación con su control negativo, (E) la
marca que viaja y el camino viejo, (F) la Evidencia con sus folios y sus dos controles negativos,
más el denominador global.

⚠️ **EL CASO NO ESPERA A UNA LLAMADA PROPIA: ESPERA AL OYENTE.** La primera versión hacía
`amiloRefrescarTodos()` a mano después de mover el dato, y con eso **desconectar el oyente dejaba
el caso en verde**: probaba la función y no el cableado, que es la mitad que fallaba.

**Verificado por mutación, cuatro, cada una en rojo donde le toca:**

| Mutación | Qué saca | Qué se pone en rojo |
|---|---|---|
| M1 | el oyente de documento | B3, C5, C6, E5 |
| M2 | la guarda de la marca en `amiloRefrescarSiIntacto` | B3 (vía `ett`) |
| M3 | la fila del resultado del paso 3 | ocho condiciones de (F) |
| M4 | **las dos** guardas de la marca | C5, C6, E5, **E7b** |

Las mutaciones se aplicaron **sobre `index.html` con los dos commits ya hechos** y se restauraron
con `git checkout -- index.html`, verificando el `md5` después de cada una. No hizo falta un
worktree.

---

## La tanda «J2» verificó el barrido sobre sus cuatro módulos → otro mapa

Puntero. El relato vive en **`docs/mapa/j2-hemo-onco-amiloide-pulmon.md`** §6.

TC-533 (I1) a (I4) miden el bloque de **hemodinámica**: se integra, se actualiza solo al mover la
PAM sin volver a integrar, y **editado a mano NO se pisa**.

⚠️ **DOS COSAS QUE HAY QUE SABER PARA MEDIRLO, Y LAS DOS COSTARON UNA CORRIDA:**
1. **El barrido está debounced a 220 ms.** Leer el textarea justo después de tipear devuelve el
   texto VIEJO y el caso informa «no se actualiza solo» sobre un mecanismo sano: un rojo que
   apunta a la app y nace en la sonda. Hay que esperar.
2. **El bloque de hemodinámica NO va al cuerpo del informe**, va a la HOJA del PDF — lo decide
   `enCuerpo` en el registro de `amiloSecs`. Leer `#informe_texto` buscándolo da cero caracteres.
   Lo que se mide es el texto congelado en `am-txt-hemo`.
