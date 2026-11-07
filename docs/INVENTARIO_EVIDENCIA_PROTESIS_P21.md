# Inventario — la Evidencia de prótesis (tanda PANT-21, commit 1)

**Documento de SOLO LECTURA.** No cambia una línea de `index.html`: su md5 al abrir y al cerrar el
commit es el mismo. Mide lo que hay HOY, antes de tocar nada.

Árbol medido: `e716871`, sello `v20261106-2156`, md5 `a99b0db9`, 167.918 líneas.

---

## 1 · Cómo decide hoy la Evidencia mostrar la sección de PRÓTESIS MITRAL

- **Función dueña:** `_indProtM()`. Registrada en `IND_SECS` con el título **`Prótesis mitral`**,
  colocada ENTRE las mitrales nativas y no al final, con su motivo escrito: es la que ocupa su
  lugar cuando la válvula es una prótesis.
- **Compuerta única, primera línea:** `if (!_indFn('vmEsProtesis') || !vmEsProtesis()) return null;`
  `vmEsProtesis()` pregunta por `vm_morf` **o** por `ete_etiologia`, y falla cerrada.
- **La compuerta de la sección tiene DOS puertas y los números UNA:** `vmProtEOA()` y los cortes
  protésicos de `calcIM_ESC` preguntan a `_imVmProt()`, que mira **sólo** `#vm_morf`. El estado
  asimétrico —el ETE dice prótesis y Válvulas una morfología nativa— está **declarado** en el
  `aviso` de la sección y no se unifica. Esto NO se toca en esta tanda.
- **Qué devuelve:** `{ filas, clinica, aviso, recom, guia, notas }`.
  **No devuelve `preguntas`, ni `adapt`, ni `cuenta`, ni `faltan`, ni `compacta`, ni `molde`.**
  O sea que **no** está en el formato de PANT-17b: no tiene el recuadro «Con lo contestado», ni la
  grilla de preguntas en dos columnas, ni la fila de respuestas, ni el «Ver detalle de la guía».

### 1.1 · Las preguntas que ya tiene (claves `protm.*`, memoria efímera `_indClin`)

| clave | rótulo | opciones | para qué |
|---|---|---|---|
| `protm.sintomas` | Síntomas | Sí / No | separa la reoperación del sintomático de la fila del asintomático |
| `protm.peri` | Fuga periprotésica | Sí / No | abre el bloque de fuga |
| `protm.tromb` | Disfunción atribuible a trombosis | Sí / No | las dos filas de reoperación exigen que NO lo sea |
| `protm.riesgo` | Riesgo quirúrgico | Bajo / Intermedio o alto | la del asintomático exige BAJO; la del valve-in-valve, INTERMEDIO O ALTO |
| `protm.hemol` | Repercusión de la fuga periprotésica | Alguna de las tres / Ninguna | **condicional**: sólo con `protm.peri === 'si'` |
| `protm.anat` | Anatomía apta para valve-in-valve | Sí / No | **condicional**: sólo con síntomas + riesgo alto + sin trombosis + sin fuga |

**Son SEIS como máximo y CUATRO en el estado inicial.** Ninguna se guarda con el estudio
(`_indClin` es memoria del panel y se borra al cerrarlo; la sección lo dice en su última nota).

### 1.2 · Qué pre-responde desde campos

**Ninguna de las seis.** Las seis son de tres estados y las contesta el médico. Lo que SÍ sale de
campos son las **filas de datos** (`filas`), que leen `em_vmax`, `em_gmedio`, `thp`, `im_vc`,
`im_grado` y los derivados de `vmProtEOA()` (`dvi`, `eoa`, `obstr`, `ppm`).

### 1.3 · La compuerta `disf`

`disf` existe para que las cuatro filas transvalvulares de la Tabla 17 —que dicen «con disfunción
significativa»— no se publiquen sobre una prótesis sana. Se arma con lo que la sección YA leyó:
`P.obstr === 'significativa'` **o** `im_grado === '4'` **o** vena contracta / gradiente medio /
velocidad pico / THP por encima de su corte, siempre con `_ge`/`_gt`, que son nulo-seguros.

### 1.4 · Qué publica hoy (`recom`, por `_protmRecom`)

Reoperación Clase I · Nivel C en el sintomático y valve-in-valve transvenoso mitral Clase IIa ·
Nivel B con riesgo intermedio o alto. **Fuente `PROTM_REF_ESC`.** Sus trece `notas` citan
`PROTM_REF_ASE`, `PROTM_REF_ESC` y `PROTM_REF_AHA`.

---

## 2 · La nota «no aplica» de la PRÓTESIS AÓRTICA

Vive **dentro de `_indEA()`** —la sección `Estenosis aórtica`—, como una rama que corta antes de
construir las filas nativas:

```
if (typeof valvEsProtesis === 'function' && valvEsProtesis(_indS('va_morf'))) {
  return { filas: [_indFila('Morfología de la válvula', _indS('va_morf'), 'warn',
      'Prótesis — las filas de esta sección son para válvula nativa')],
    recom: { tipo:'no', tit:'Prótesis aórtica: esta sección no aplica', txt: ... } };
}
```

El texto dice, literal, «eso es otra tabla, la de reintervención, **que esta aplicación todavía no
implementa**». **No hay sección de Evidencia de prótesis aórtica, ni de tricúspide, ni de
pulmonar**, censado sobre `IND_SECS`: la única con «Prótesis» en el título es la mitral.

⚠️ **Esa rama sólo se alcanza si antes pasó la compuerta de severidad de `_indEA`**
(`ea_grado === 'severa'` o Vmax ≥ 4 o gradiente medio ≥ 40 o AVA ≤ corte o un insumo fuera de
banda). Con una prótesis y sin ninguno de esos disparadores, `_indEA` ya devuelve `null` y la
tarjeta no existe.

---

## 3 · El emisor compartido (PANT-17b) y dónde fija el orden

`_indSecHTML(tit, r)` abre el contexto de numeración de citas y delega en
**`_indSecHTMLCuerpo(tit, r)`**, que emite, en este orden:

1. `<details>` + `<summary>` con el título. Abre solo si hay `aviso`, alguna fila `ok`/`alarm` o
   una `recom` de tipo `ind`/`alarma`.
2. El `aviso` ámbar, si lo hay.
3. **La fila de encabezado** —sólo con `r.preguntas` y `r.clinica`—: el contador
   `N Sí · N No · N sin dato` (de `r.cuenta`) y el botón `⇔ columnas`.
4. **`_indAdaptHTML(r.adapt, r.faltan)`** — el recuadro **«Con lo contestado»**, **ARRIBA de las
   preguntas**, si hay `r.adapt`.
5. La grilla `data-ind-grid`: con `r.preguntas`, los datos a todo el ancho en dos columnas
   (`data-ind-col="eco"`) y las preguntas debajo (`data-ind-col="clin"`); sin `r.preguntas`, los
   datos en la columna izquierda y las preguntas en la derecha.
6. **`_bloRec()`** = `r.bloques` + `r.recom`. Con `r.adapt`, los dos quedan envueltos en un
   `<details data-ind-bloque="1">` rotulado **«ⓘ Ver detalle de la guía»**.
7. **`_indSecPie(h, r)`**: `_indGuiaHTML(r.guia)` + `_indDetalleHTML(notas)` + `_indBiblioHTML`.
   **La bibliografía va última y el orden es lo que la hace correcta**: el acumulador de citas se
   puebla mientras se pinta.

**El orden de los bloques está CABLEADO en `_indSecHTMLCuerpo`**: no hay ninguna opción por
sección que lo mueva. Es lo que el commit 2 agrega.

### 3.1 · Las dos columnas de preguntas

`IND_COLS_CORTE = 900` y lo aplica `_indColsSync` midiendo **la caja del PANEL**, no la ventana:
el panel sin maximizar mide 820 px a 1440 y a 1000 px. **No se toca.**

### 3.2 · El tope de preguntas por sección

**No existe ninguna constante.** Es la convención de las órdenes de esta casa, y `P17b-c` lo
declara con todas las letras: **catorce**. Cinco secciones están en el tope (CIA, CIV,
Eisenmenger, Fontan y Fallot reparada).

---

## 4 · Qué resultado muestra HOY la pantalla de cada válvula protésica

Éstos son los que gobiernan el bloque de causas.

| válvula | función dueña | clave | resultados posibles | el «alterado» de la decisión (4) |
|---|---|---|---|---|
| **aórtica** | `eaProtVeredicto()` | `nivel` | `null` (no es prótesis) · `faltan` · `normal` · **`posible`** · `signif` | **`posible`** |
| **mitral** | `vmProtEOA()` | `obstr` | `null` · `normal` · **`posible`** · `significativa` | **`posible`** |
| **tricúspide** | `vtProtObstr()` | `obstr` | `null` · `sin` · **`aislado`** · `estenosis` | **`aislado`** |
| **pulmonar** | `vpProtObstr()` | `obstr` | `null` · `sin` · **`posible`** | **`posible`** |

- **Aórtica:** `nivel = 'posible'` sale cuando el eje dependiente del flujo y el independiente **no
  coinciden** (`pDep`/`pIndep`): uno dice `signif` y el otro no, o alguno dice `posible`. Con los
  dos en `signif` → `signif`; con los dos en `normal` → `normal`; con un dato faltante → `faltan`.
- **Tricúspide:** `VT_PROT_OBSTR_MIN = 2`. Con **un solo** criterio positivo el veredicto es
  `aislado`, que es exactamente «sin criterios de estenosis pero con gradiente alterado».
- **Pulmonar:** cualquier criterio positivo da `posible`; ninguno y con algo medido, `sin`.
- **Mitral:** `VM_PROT_OBSTR_MIN`; con un solo votante positivo, `posible`.

---

## 5 · Campos de la app que pueden pre-responder

Una pregunta se pre-responde **sólo desde un campo que signifique EXACTAMENTE lo mismo**; el resto
queda en «Requiere datos clínicos».

| dato | id real | válvula | ¿sirve para pre-responder? |
|---|---|---|---|
| morfología | `va_morf` · `vm_morf` · `vt_morf` · `vp_morf` | las cuatro | **sí**, para «es una prótesis» y para el tipo (mecánica / biológica / TAVI) |
| fuga paravalvular, origen | `ea_pvl_origen` · `vm_pvl_origen` | aórtica, mitral | **sí**: dice si la regurgitación es paravalvular |
| fuga paravalvular, extensión | `ea_pvl_ext` | aórtica | no: es un grado, no una pregunta de la tabla |
| fuga paravalvular, vena contracta | `ea_pvl_vc_area` | aórtica | no |
| grado de insuficiencia | `ia_grado` · `im_grado` · `it_grado` · `ip_grado` | las cuatro | no para una pregunta de conducta: es severidad, no indicación |
| gradiente medio | `gmedio_ao` · `em_gmedio` · campos de `VT_PROT_T19` / `VP_PROT_T15` | las cuatro | no: alimenta el veredicto, no una pregunta |
| DVI | `dvi-val` (texto) / `ea_dvi_display` | aórtica | **sí**, para la rama automática de la Figura 13 |
| EOA indexada | `ava-idx` (texto) | aórtica | **sí**, para la rama automática de la Figura 13 |
| AT y tiempo de eyección | `va_at` · `tango_te` | aórtica | no: ya votan en la tarjeta de severidad |
| THP | `thp` | mitral | no |
| síntomas | **no existe un campo de síntomas de prótesis** | — | **no**: la pregunta se contesta a mano, como en la mitral |
| riesgo quirúrgico | **no existe** | — | **no** |
| trombosis | **no existe un campo propio** | — | **no** |

⚠️ **Censado: la aplicación NO tiene campo de síntomas, de riesgo quirúrgico ni de trombosis
protésica.** Las preguntas que dependen de ellos se contestan a mano, igual que en la mitral.

---

## 6 · Censo de casos existentes que vigilan estas secciones

Suite al abrir: **756 casos distintos**. El siguiente TC libre es **TC-742**.

| caso | qué afirma | lo toca esta tanda |
|---|---|---|
| **TC-322** | recorre `IND_SECS` entera y exige **un escenario por sección** | **sí**: cada sección nueva necesita su escenario |
| **TC-533** | cuenta las entradas de `IND_SECS` | **sí**: el conteo cambia |
| **TC-323, TC-330, TC-331, TC-334** | leen el objeto de `_indProtM()` (filas, clínica, compuerta, estado asimétrico) | **sí** si cambia su forma |
| **TC-649** | la prótesis mitral **sin molde** de Evidencia (guardián de la parada de `P6-a`) | **sí** si se le pone molde |
| **TC-661** | conteos de la Evidencia | a verificar |
| **TC-290, TC-346** | el papel de la prótesis aórtica (Tabla 5, narrativo) | **no**: esta tanda no toca el papel |
| **TC-293, TC-451, TC-528, TC-537** | un control de detalle por sección, etiquetas de globos, compactas, folios | a verificar |

---

## 7 · Lo que esta tanda NO puede tocar

Censado y escrito acá para que el commit siguiente no lo descubra tarde:

- **Ningún campo guardado nuevo** y **ninguna columna de Excel** (457). La Evidencia usa
  `_indClin`, que es memoria efímera.
- **Ningún id existente cambia.**
- **El papel es idéntico**: la Evidencia no llega al informe, al EN SUMA, al PDF ni al PPT.
- **No se tocan**: el informe, el EN SUMA, el Laboratorio, la tarjeta de severidad aórtica, el
  catálogo de modelos, el AT/ET, la graduación de ninguna válvula, la Evidencia de las demás
  secciones ni el 3D.
