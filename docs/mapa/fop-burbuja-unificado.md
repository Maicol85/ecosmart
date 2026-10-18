# El FOP, el aneurisma del septum y el test de burbuja — UN solo dueño

> Tanda **ARR**, commit 8 (2026-10-18). Cierra **CORTOS-1** de `docs/PENDIENTES.md` por su salida
> **(a)**: el bloque de Otros deja de publicar su oración cuando el módulo FOP está integrado, y
> los datos compartidos se espejan.

---

## El inventario: existían DOS veces

| dato | pestaña **Otros** (CORTOS13, 17/10/2026) | módulo **FOP** (CC frecuentes) |
|---|---|---|
| se hizo el test | `otr_burb` (casilla) | `fop_contraste` (sí/no) |
| hay pasaje | `otr_burb_pasaje` (sí/no) + `otr_burb_man` (espontáneo/Valsalva) | `fop_shunt_reposo` + `fop_shunt_valsalva` |
| cuántas burbujas | `otr_burb_cant` — **<10 / 10-30 / >30** | `fop_burbujas` — **Pocas (<5) / Moderado (5-20) / Abundante (>20)** |
| cuándo aparecen | `otr_burb_mom` (antes del 3.º / 3.º a 5.º / después del 5.º) | — |
| aneurisma del septum | `otr_asia` (casilla) + `otr_asia_nota` | `fop_asa` (sí/no) + `fop_asa_mm` (excursión) |

Un mismo estudio podía llevar las dos, y el informe firmado decía **dos oraciones sobre el mismo
test, con dos escalas**.

---

## La escala que queda, y por qué

⚠️ **NINGUNA FUENTE DE LA BIBLIOTECA GRADÚA EL PASO DE BURBUJAS**, censada entera (todos los PDF,
buscando `bubble`, `microbubble`, `agitated saline`, `right-to-left shunt`, `patent foramen` y
cualquier rango numérico en su ventana). Las menciones son de **contraste de perfusión**, de
**prótesis mecánicas**, de **artefactos pulmonares** y de referencias bibliográficas. Lo más cerca
es la ASE de ETE (`14- ETE/ASE ETE .pdf`, **hoja 59**), que describe el estudio positivo de forma
**cualitativa**: «Positive agitated saline contrast study with dense opacification of RA and RV,
and clear early passage of microbubbles to the LA (arrow) in a case of PFO» — **sin conteo**.

Por eso se aplica la regla de la orden: **conservar la que ya usan los estudios guardados y
adaptar la otra**. Queda la del **módulo FOP**, por tres razones medidas:

1. el **Laboratorio** cuenta su barra «Paso de burbujas con contraste» leyendo `fop_burbujas`;
2. es la única con **nombres de grado**, que es lo que el informe esquemático necesita;
3. es la antigua — la de Otros tiene **un día** de vida.

⚠️ **LAS TRES OPCIONES VIEJAS DE OTROS QUEDAN COMO `<option hidden>`**, el patrón que `em_grado`
ya usa: el recolector restaura por `el.value`, así que sin ellas un estudio guardado del CORTOS
reabre con el `<select>` en `selectedIndex -1`. Es la trampa de `et_grado`.
⚠️ **NO SE TRADUCEN**: equiparar «menos de 10» con «Pocas (<5)» o con «Moderado (5-20)» es
inventar una equivalencia que ninguna fuente hace. **No se migra nada.**

---

## El espejo: `fopBurbEspejo(origen)`

Patrón de `itVmaxSync`: espejo en los **dos** sentidos con guarda de re-entrada (`_fopEspejoSinc`).

| Otros | ↔ | FOP |
|---|---|---|
| `otr_burb` (casilla) | ↔ | `fop_contraste` |
| `otr_burb_pasaje` + `otr_burb_man` | ↔ | `fop_shunt_reposo` + `fop_shunt_valsalva` |
| `otr_burb_cant` | ↔ | `fop_burbujas` (mismos `value`) |
| `otr_asia` (casilla) | ↔ | `fop_asa` |

- **La excursión del aneurisma tiene UN campo en toda la app** (`fop_asa_mm`) y se deja ahí:
  agregarle uno a Otros sería crear el segundo dato que esto viene a cerrar.
- **Las tres opciones de legado no se espejan**: un `otr_burb_cant` en `lt10`, `e1030` o `gt30` se
  conserva y **no** se copia a `fop_burbujas`.
- **`pon()` no escribe un valor que el `<select>` no ofrece**, porque dejaría `selectedIndex -1`.
- ⚠️ **La guarda de re-entrada no es decorativa** aunque asignar `.value` por código no dispare
  `onchange`: los arneses despachan el evento a mano. Es el motivo de `_itVmaxSinc`.

## ⚠️ La mitad que faltaba, y la destapó la sonda

Con la escala unificada **el informe seguía publicando DOS oraciones**. Desde este commit, con el
módulo FOP integrado (`fop_incluir_chk`), **los dos hallazgos de Otros se callan**: `otrBurbuja()`
devuelve `null` y `otrHallazgos()` saltea `otr_asia`. Es el patrón con que el módulo pulmonar
básico se calla frente al avanzado. **Las casillas de Otros no se tocan**: siguen encendidas y
siguen viajando con el estudio; lo único que cambia es quién escribe la oración.

---

## El informe esquemático: TRES oraciones

| # | oración | de dónde sale |
|---|---|---|
| 1 | anatomía | `fop_tunel`, `fop_mov`, `fop_asa` + `fop_asa_mm` |
| 2 | test de burbuja | `fop_contraste`, `fop_shunt_reposo`, `fop_shunt_valsalva`, `FOP_BURB_TXT[fop_burbujas]` |
| 3 | contexto clínico | `c.esq` de `fopConclusion`, y el párrafo de siempre cuando esa clave no lo tiene |

Medido, con el ejemplo exacto de la orden:

> «Foramen oval permeable (túnel de 8 mm), con septum interauricular móvil y aneurisma del septum
> (excursión de 22 mm). Test de burbuja: sin shunt en reposo; con maniobra de Valsalva, shunt
> moderado (5-20 burbujas). Con ACV criptogénico.»

**EN SUMA:** «FOP — túnel 8 mm — shunt con Valsalva — aneurisma del septum (22 mm) — con ACV
criptogénico.»

- **No se pierde ni un dato:** los mismos campos, los mismos números y las mismas palabras de
  grado. Lo que cambia es la puntuación y el orden de las cláusulas.
- ⚠️ **`ccHoja` sigue recibiendo la lista `p`** y no la oración armada: esa hoja la consume el PDF
  de CC frecuentes renglón por renglón, y pasarle una sola cadena larga le rompería la maquetación.
- ⚠️ **Las claves sin `esq` publican el párrafo de siempre**, porque omitirlas sería **perder**
  información del informe firmado. Llevan `esq` las cuatro que cambian la conducta: `descartado`,
  `cierre_iia`, `acv_mayor`, `acv_sin_edad`, `trombofilia` y `alto_riesgo_sin_evento`.

## El aviso de la edad se OMITE

Decisión de Maicol. `acv_sin_edad` deja de publicar «falta la edad del paciente, de la que depende
la indicación: el cierre percutáneo es Clase IIa por debajo de los 60 años», y el EN SUMA deja de
decir «sin edad cargada». **Medido: con edad y sin edad el informe y el EN SUMA salen idénticos.**
La indicación queda documentada en `FUENTES.md` y en `PENDIENTES.md` para llevarla a Referencias;
**no se escribe en la app**.

⚠️ **LA RAMA DE `fopConclusion` SIGUE EXISTIENDO** y su `txt` sigue teniendo el aviso: lo consumen
el PDF de CC frecuentes y la hoja de `ccHoja`, que son otra superficie. Lo que se omite es el
informe narrativo y el EN SUMA.

---

## ⚠️ Un defecto que cazó la sonda sobre código recién escrito

**`FOP_BURB_TXT` YA EMPIEZA CON LA PALABRA «shunt»** —«shunt moderado (5-20 burbujas)»—, así que
la primera versión publicaba **«con maniobra de Valsalva, shunt shunt moderado (5-20 burbujas)»**
en el informe FIRMADO. La frase la pone el dueño del texto, no la plantilla.

## Cómo se mide

`scripts/_probe_arr.mjs --solo fopu`: siete escenas con clics y teclas reales —el ejemplo de la
orden, el ACV sin edad, el shunt descartado, el incidental, el espejo en los **dos** sentidos y el
control del legado—. Las siete publican **una sola** oración.
Cobertura: **TC-501**, bloques (M1) a (M7).
