# Mapa — la PRÓTESIS AÓRTICA, tanda PANT-18 (2026-11-06)

Lo que esta tanda movió de la estenosis aórtica protésica: el tiempo de eyección y el AT/ET, la
nota del AT, la ficha de Referencias, la tarjeta de severidad, la TAVI, el desajuste y el botón.
Por nombre de función y de constante, no por número de línea.

El inventario completo del estado ANTERIOR está en `docs/INVENTARIO_PROTESIS_AORTICA_P18.md`.

---

## 1 · El tiempo de eyección: un dato y dos puertas

**No se agregó ningún campo guardado.** El tiempo de eyección ya existía:

| | |
|---|---|
| **dueño** | `tango_te`, rótulo «T. eyectivo (ms)», en la pestaña **Doppler** |
| **espejo** | `va-esp-et`, rótulo «ET (ms) — tiempo de eyección, sólo prótesis», al lado del AT en **Válvulas** |
| **sincronizador** | `etEspSync(origenId)` — bidireccional, guarda de reentrada, compara el texto **crudo**, copia el vacío |
| **editor único** | `etEditado(origenId)`, que llaman las **dos** puertas: espeja, corre `calcTango()` y repinta |
| **repintado del espejo** | dentro de `eaAtPintar`, que cuelga de `valvProtSync` y por lo tanto de `RECALC_MODULOS` |

El id del espejo lleva **guión medio** y su prefijo `va-esp-` entra en las **dos** listas
paralelas, `_noEsDelEstudio` y `_CAMPOS_FUERA_DEL_ESTUDIO`. Con guión bajo sería una segunda copia
del mismo dato viajando con el estudio, que es el motivo escrito de `hfpep-`, `vauto-` y
`otr-asia-`.

**Censo de campos 994 → 994 y Excel 441 → 441**, medidos.

## 2 · El AT/ET: dónde vive cada mitad

- **El cálculo del veredicto** ya existía: `eaProtVeredicto` hace `at / tango_te` y clasifica con
  `EA_PROT_CRIT.atet_normal_max` (0,32) y `atet_signif_min` (0,37), con `_eaProtNivel` y el
  operador **estricto** en el borde alto.
- **La fila del cuadro** es nueva: `ea-det-atet-row` / `ea-det-atet`, la pinta **`eaAtEtPintar`**
  y la llama `eaAtPintar` **arriba de sus cuatro salidas tempranas**, para que se esconda y se
  vacíe por todos los caminos por los que se esconde la del AT.
- **El valor de la fila** sale de `_eaAtEtVal()`, que tiene una guarda propia: los dos positivos
  **y el AT menor que el ET**.

⚠️ **La guarda de «AT menor que ET» es de la FILA y no del veredicto.** `eaProtVeredicto` calcula
el cociente en cuanto el ET es positivo, y ese número viaja al paréntesis de medidas del informe
firmado. Cambiarlo movería el papel, y esta tanda tenía autorizados otros dos lugares. La
asimetría está en `docs/PENDIENTES.md` → **P18-b**.

## 3 · La nota del AT

Vive en `ea-det-at-nota`, la escribe `eaAtPintar` y **se muestra cuando el AT sale de su banda
normal** — el disparador **no se tocó**.

Sus dos números salen de `AT_PROT_POSIBLE_MAX` y de `EA_PROT_CRIT.atet_signif_min`, no escritos a
mano: si alguien mueve un corte y el texto no, la pantalla publica una cifra que el código no
aplica.

⚠️ **La frase de la función ventricular se le atribuye al AT y no al cociente**, porque el
asterisco de la Tabla 5 está sobre el contorno del chorro y sobre la fila del AT, y **no** sobre la
del AT/ET. Verificado en la imagen y en la capa de texto. Ver **P18-a**.

## 4 · La tarjeta de severidad

| pieza | quién |
|---|---|
| el veredicto y su color | `_eaProtPintar`, con `EA_PROT_TXT` y la tabla de colores |
| **la línea del porqué** | **`_eaProtPorque(P)`** |
| **hasta dos avisos** | **`_eaProtAvisos(P)`**, con la línea de TAVI primera y `slice(0, 2)` |
| el detalle plegado | las **mismas** `salvedades` de `eaProtNarrativa`, dentro de un `<details>` |

**Ninguna afirmación clínica nueva:** cada línea visible dice lo que una salvedad del plegable ya
decía. El nivel `normal` **no lleva conclusión** a propósito — su texto largo no afirma nada sobre
el porqué, así que su línea publica los valores y nada más.

## 5 · La TAVI

`eaProtVeredicto` **ya no sale temprano** con TAVI: cae en la misma cascada absoluta que la
prótesis quirúrgica y `via` sigue diciendo `'TAVI'`, que es lo que publica su salvedad
(`EA_PROT_SALV.tavi`, reescrita) y lo que lee la guarda de `_protNormofuncionante`.

- `sinGraduar` **ya no existe**.
- `EA_PROT_TXT.tavi` se **retiró**: quedó sin un solo lector.
- `eaProtNarrativa` ya no tiene rama de TAVI: emite la **misma** `frase` y el **mismo** `resumen`.

⚠️ **La guarda `P.via === 'TAVI'` de `_protNormofuncionante` SE CONSERVA**, así que una TAVI normal
no recibe el renglón de «prótesis normofuncionante» que sí recibe una quirúrgica normal. Es otra
línea del papel y esta tanda no la autoriza. Ver **P18-d**.

## 6 · El desajuste

Las dos frases salen de **`ppmFrases`**, su dueño único, y el lado aórtico la llama en **un solo
lugar**, detrás de un solo `if`. La regla nueva es una condición más en ese `if`:

```
if (_eaProtP && (ppm moderado o severo) && _eaProtP.nivel !== 'signif')
```

Es una condición sobre el **veredicto** y no sobre el número: el PPM se sigue calculando y la fila
de pantalla publica la AEO indexada con su categoría, idéntica.

## 7 · El botón «Severidad»

Lo pinta `valvSev.refrescar(tipo, valv)`, que lee `CAMPO[tipo][valv]` — `ea_grado` para la
aórtica. Con prótesis ese campo se queda en su centinela a propósito, así que el botón caía en el
neutro.

La rama nueva está **en el pintor y no en `aplicar`**: pregunta a `eaProtVeredicto()` y pinta
`nivel3` / `nivel2` / `nivel1` según `signif` / `posible` / `normal`; con `faltan` **no pinta**.
**No escribe `ea_grado`.**

Corre **sólo cuando el campo está en su centinela**: con un grado fijado a mano gana el del
médico.

Lo repintan `_eaProtPintar` y `_eaProtNotaOcultar`, que son los dos dueños del estado protésico
del cuadro: un dueño y dos renders.

---

## 8 · Trampas que esta tanda pagó

1. **`informe_texto` y `en_suma` son `<textarea>`.** Leerlos con `textContent` devuelve cadena
   vacía, y entonces «el informe no escribe el desajuste» se lee igual que «el informe está
   vacío». El lector es `e.value || e.textContent`.
2. **La pastilla de la lesión tiene que estar abierta** o el informe no describe la aórtica.
3. **La sección de la válvula aórtica está a dos niveles**: la pestaña Válvulas **y** el acordeón
   `ete-seccion-valv-aortica`, que nace cerrado. Con uno solo sin abrir todo informa 0 × 0.
4. **La ficha de Referencias está a TRES niveles**: la subpestaña `ref-subtab-valv`, la tarjeta
   «Válvulas Protésicas» y la ficha «Prótesis Aórtica».
5. **`limpiarCampos` vuelve a la pestaña Paciente**, así que la pestaña se abre DESPUÉS de sembrar.
6. **El último `base()` de un caso decide el denominador del siguiente bloque**: una escena que
   deja el AT normal esconde la nota y las cinco condiciones que la leen caen sobre la nada.
7. **El acento grave dentro de un comentario propio**, dentro de un template literal. Pagado seis
   veces en esta tanda. Lo caza `node --check`; lo previene contar los acentos graves del bloque y
   exigir el número exacto.
8. **El censo por grep se mide a sí mismo** si el comentario que explica el retiro cita la frase
   retirada textual. El censo va en el navegador, y la cita literal va a `PENDIENTES.md`.

## 9 · Dónde está lo demás

- El estado anterior, campo por campo: `docs/INVENTARIO_PROTESIS_AORTICA_P18.md`
- Las dos lecturas en imagen, con su hoja y su folio: `docs/fuentes/FUENTES.md` → «La tanda PANT-18»
- Lo parado y lo declarado: `docs/PENDIENTES.md` → **P18-a** a **P18-g**
- Las fichas de los seis casos: `docs/mapa/tests-fichas-723.md`
- Los criterios de prótesis que esta tanda **no** tocó: `docs/mapa/protesis-valvular.md`


---

## → PANT-26 (2026-11-09): lo que esta tanda movió de esta zona

El repintado de la cápsula al elegir el modelo (`vModTrasElegir`), el **área efectiva frente a la
del modelo también en la TAVI** con la misma función y los mismos cortes, la **condición de 1
desvío** que la nota al pie de la Tabla 7 le pone al desajuste, la frase **«con posible
estenosis»**, el **desajuste que apaga «normofuncionante»**, la **mitral sin conclusión por
fila** y las **cuatro declaraciones de criterio propio**.

→ **`docs/mapa/pant26-protesis-aortica-mitral.md`**
