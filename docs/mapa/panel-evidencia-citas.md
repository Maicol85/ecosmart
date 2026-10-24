# Mapa — Panel de Evidencia · las citas, la numeración y el marcador `ecosmart`

> **Salió de `docs/mapa/panel-evidencia.md` el 2026-10-24 (tanda AJ6), que estaba en 35,3 KB —ya
> por encima del techo de ~35 KB— y tenía que partirse antes de que entrara una línea más. No se
> movió ni una palabra: es el mismo texto, con el mismo orden y los mismos números de caso.
> Lo que quedó allá es un puntero de cinco líneas.
>
> Acá vive TODO el mecanismo de citación del panel: el registro `IND_REFS`, el marcador
> `ecosmart`, el allowlist `IND_REF_IDX` y la numeración por sección. El resto del panel —el
> marco, las preguntas, qué devuelve una sección, las quince secciones, los sub-bloques y cómo
> agregar una sección— sigue en `panel-evidencia.md`.

---

## Registro de referencias — `IND_REFS`

`const IND_REFS = Object.freeze([ … ])`. Cada entrada tiene **exactamente dos campos**:

```js
{ k:'esc2025vc',
  full:'ESC/EACTS 2025 — … Eur Heart J 2025;46(44):4635-4736. doi:… Páginas de revista: …' }
```

- `k` — clave corta y única. Es por lo que citan las secciones.
- `full` — el texto completo tal como se publica en la bibliografía: autores, título, revista, año,
  volumen, páginas, DOI, y la **tabla y página** cuando la hay.

No hay más campos. **La clase y el nivel NO viven acá**: son propiedad de la recomendación, no del
documento (seis secciones citan la ESC/EACTS 2025 con clases distintas).

Claves registradas hoy: `esc2025vc`, `esc2020guch`, `escGuchCiv`, `esc2023mioc`, `esc2024ao`,
`fop2019`, `aseProtAo`, `ecosmart`, `aseVr2017`, `ahaVc2020`, `eaeAseEst2009`, `wilkins1988`,
`aseProtM2024`, `ahaProtM2020`, `asePandian2023`.

Reglas declaradas en su propia cabecera: **las entradas nuevas van al final** (el orden de la lista
es el orden histórico de los números); la bibliografía lista **solo lo que se citó en ese pintado**
—una entrada numerada sin corchete que la invoque se lee como «hay una cita que no encontrás», caso
real `aseProtAo`—; y en `full` va lo que la app **ya puede sostener**: donde falta autor o páginas es
porque no se verificaron, y no se completan de memoria.

### El marcador `ecosmart`

Es una entrada de `IND_REFS` como las otras (`k:'ecosmart'`) y su `full` es «Criterio EcoSmart:
decisión clínica de la aplicación cuando la evidencia no ofrece un único corte aplicable.».
**No cuenta como bibliografía de guía**: marca una decisión propia de la app. Hoy no lo usa ningún
`guia:` —las secciones afirman recomendaciones de documentos— y se cita solo desde `refs:` de notas.
**Quiénes lo citan hoy (censado por `grep` el 2026-10-11): `_indIM` e `_indIA`**, dos notas en cada
una. ⚠️ **La estenosis mitral DEJÓ de citarlo** en esa fecha: su único uso era la nota que declaraba
el «2 o más» de `EM_CRIT_2025.clin_desfav_min`, y esa constante se eliminó con el veredicto único —
el panel ya no decide cuántas características desfavorables son «varias». La entrada **no quedó
huérfana** en el registro, y eso se verificó antes de sacarla: una entrada numerada que nadie
invoca se lee como «hay una cita que no encontrás», que es el caso real de `aseProtAo`.

### `IND_REF_IDX` — allowlist, no numeración

`const IND_REF_IDX = (función inmediata que recorre IND_REFS y guarda m[r.k] = i + 1)`.

**Ya no da el número de la cita.** Confirmado: sus dos únicos consumidores son
- `_indRefValida(k)` → `hasOwnProperty.call(IND_REF_IDX, k)`, o sea «¿la clave está registrada?»; y
- `_indRefDoc(k)` → usa el `i + 1` solo para indexar `IND_REFS[i - 1]` y devolver el objeto de la
  referencia (evita un segundo mapa clave→objeto en paralelo).

El número publicado lo asigna `_indRefNum`. Una `k` duplicada es la única discrepancia que la
construcción no impide: el `forEach` se queda con la **última** y grita por `console.error` al
arrancar; `_indBiblioHTML` repone la señal visible con «[clave repetida en el registro…]».

---

## Numeración por sección

Decisión de Maicol del 2026-09-29: **cada sección lleva su numeración, arranca en `[1]`, y su propia
bibliografía al pie**, por orden de primera aparición dentro de esa sección. Lo que se pierde, y
está declarado: el número ya no identifica al documento entre secciones — dos secciones que citen la
ESC/EACTS 2025 muestran las dos un `[1]`, y son entradas distintas.

Un solo dueño del acumulador: **`_indRefCtx`**.

| Identificador | Rol |
|---|---|
| `var _indRefCtx` | El acumulador de la sección que se pinta, o `null` fuera de un pintado. |
| `_indRefCtxNuevo()` | `{ orden:[], num:Object.create(null) }` — orden de primera aparición y número de cada clave. |
| `_indSecHTML(tit, r)` | **Abre** el contexto (guardando el anterior en `prev`) y lo repone en un `finally`, delegando el cuerpo a `_indSecHTMLCuerpo`. Única puerta: sin pasar por acá los corchetes salen «[cita fuera de sección]». |
| `_indRefNum(k)` | **Lo único que ASIGNA.** Clave válida y contexto abierto → la empuja a `ctx.orden` y le da `ctx.orden.length`. |
| `_indRefValida(k)` | Allowlist contra `IND_REF_IDX`. Partición obligatoria: `_indRefAbrir` valida desde un clic, fuera de todo pintado, donde `_indRefNum` daría `null`. |
| `_indRefDoc(k)` | El objeto de `IND_REFS` para esa clave. |
| `_indRefMarca(k)` | Pinta el corchete, un `[data-ind-ref]` con `role="button"` (declarado: no llega a los 44 px táctiles). Dos errores separados: «[referencia no registrada]» (clave mal escrita) y «[cita fuera de sección]» (cableado: se llamó a `_indGuiaHTML`/`_indRecomHTML` sin pasar por `_indSecHTML`). |
| `_indBiblioHTML(ctx)` | **Solo LEE.** Recorre `ctx.orden` —ya ascendente por construcción— y publica `<b>[n]</b> ` + el `full`, en un `<details data-ind-biblio>` que **nace colapsado**. Nunca llama a `_indRefNum`. |
| `_indRefAbrir(c, k, desde)` | Abre la bibliografía y marca su entrada (`[data-ind-refitem]`). La clave se valida **antes** del `querySelector`: saneo en el borde. |

En `_indSecHTMLCuerpo` el `_indBiblioHTML(_indRefCtx)` va **última** (el acumulador se puebla al
pintar) y **dentro** del `<div>` del cuerpo, o sea como hija del `<details>` de la sección — eso le
da clave única en `_indRepintarConservando`.

Dentro de una sección el número **puede moverse con el paciente**. El ejemplo que este mapa daba
—`wilkins1988` como `[2]` con score desfavorable y `[5]` si no— **ya no vale**: desde el 2026-10-11
la fila del score **no cita a Wilkins** (la guía remite a su Table S3 suplementaria, que no está en
la biblioteca, así que el corte va «según la guía» y sin atribución), y la clave aparece sólo en la
nota de guías previas, que es siempre la penúltima. El mecanismo sigue siendo el mismo —primera
aparición dentro de la sección— y lo que se mueve con el paciente hoy es la **presencia** de
`asePandian2023`, que se cita **sólo con etiología reumática**. Lo fijan TC-322, TC-327 y TC-328.
