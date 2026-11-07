# La Evidencia de prótesis — una sección por válvula (tanda PANT-21, 2026-11-07)

Mapa de la tanda. **No guarda números de línea a propósito**: la línea cambia en cada edición, el
nombre de la función no.

---

## 1 · Las cuatro secciones, y dónde están en el registro

`IND_SECS` pasa de **42 a 45** entradas. Cada sección de prótesis va **pegada a la de su válvula
nativa** y no al final: es la que **ocupa su lugar** cuando esa válvula es una prótesis, así que
el médico la busca donde buscaba aquélla.

| sección | función | compuerta | va pegada a | ¿es nueva? |
|---|---|---|---|---|
| `Prótesis aórtica` | `_indProtA` | `valvEsProtesis(va_morf)` | Estenosis aórtica | **sí** (commit 3) |
| `Prótesis mitral` | `_indProtM` | `vmEsProtesis()` | las tres mitrales nativas | no: existía |
| `Prótesis tricúspide` | `_indProtT` | `valvEsProtesis(vt_morf)` | Válvula tricúspide | **sí** (commit 5) |
| `Prótesis pulmonar` | `_indProtP` | `valvEsProtesis(vp_morf)` | Estenosis pulmonar | **sí** (commit 6) |

⚠️ **NINGÚN TÍTULO ES PREFIJO DE OTRO NI TIENE OTRO POR PREFIJO.** `IND_SECS` se recorre buscando
la sección por el **prefijo** de su título, así que un título que sea prefijo de otro deja una de
las dos sin probar. Los cuatro divergen en su **segunda palabra**.

⚠️ **LA AÓRTICA Y LA DE ESTENOSIS NATIVA USAN EL MISMO PREDICADO.** `_indEA` devuelve `null` con
`valvEsProtesis(va_morf)` y `_indProtA` existe con ese mismo predicado: con dos distintos
existiría un estado en que se ven las dos, o ninguna. Antes de esta tanda `_indEA` publicaba una
tarjeta **«Prótesis aórtica: esta sección no aplica»** cuyo texto decía «esa es otra tabla, la de
reintervención, **que esta aplicación todavía no implementa**».

---

## 2 · El orden de la sección, y dónde se decide

**Decisión del médico (07 y 08/11/2026), y SOLO para las cuatro de prótesis:** primero las
preguntas, después «Con lo contestado», después las causas, después «Ver detalle» plegado y al
final la bibliografía. **El resto de la Evidencia queda exactamente como está.**

El dueño es **`r.ordenProt`**, una opción por sección que lee `_indSecHTMLCuerpo`:

- **Implica `preguntas`** (`const esPreg = !!(r.preguntas || r.ordenProt)`): ese molde **es** el
  orden que la decisión pide —los datos arriba a todo el ancho, las preguntas debajo en dos
  columnas—. Con dos marcadores separados una sección podría quedar con el orden nuevo y la
  maqueta vieja, que es medio cambio.
- **«Con lo contestado» baja** de encima de las preguntas a debajo de ellas.
- **Las causas van DESPUÉS de lo que la sección CONCLUYE, y eso son dos lugares distintos**:
  «Con lo contestado» es `adapt` en la aórtica, la tricúspide y la pulmonar, y es **`recom`** en la
  **mitral**, que concluye con su cascada `_protmRecom` desde antes de esta tanda. Con `adapt`,
  `_bloRec()` es el «Ver detalle» y las causas van **antes**; sin `adapt`, `_bloRec()` **es** la
  conclusión visible y las causas van **después**.
- **Va antes de `_bloRec()`** en el camino con `adapt`, y eso es lo que deja la bibliografía
  última: el acumulador de citas se puebla **mientras se pinta**, así que una causa que cita se
  numera en el orden en que se lee.

**Por defecto ninguna sección lo trae y el DOM de las otras cuarenta y una no cambia en un nodo**,
medido una por una a los cuatro anchos.

---

## 3 · El bloque de causas — un solo mecanismo, parametrizado por válvula

Dos funciones, al lado de `_indAdaptHTML`:

- **`_indCausas(lista, decide)`** normaliza la lista y resuelve la marca de cada causa.
- **`_indCausasHTML(cs, nota)`** la emite, con el marco de `_indCajaReco`.

`decide(clave)` devuelve **tres** estados, y los tres usan los iconos de la leyenda que el panel
ya imprime:

| devuelve | icono | significa |
|---|---|---|
| `true` | ✅ | la rama que el algoritmo de la guía señala |
| `false` | — | la rama hermana, **medida y descartada** |
| `null` / `undefined` | ❓ | **no decidible** con lo que la app tiene |

⚠️ **SIN ESA DISTINCIÓN, una causa no decidible saldría con la marca de «medido y no alcanza el
criterio»**, que es una afirmación que esta aplicación no puede sostener.

### 3.1 · Cuándo aparece, por válvula

Sale **sólo** con el resultado que la pantalla de esa válvula ya publica como «posible» o su
equivalente de «sin criterios de estenosis pero con gradiente alterado». **El veredicto se LEE de
su dueño y no se recalcula.**

| válvula | función dueña | clave | el valor que lo abre | ¿tiene bloque? |
|---|---|---|---|---|
| aórtica | `eaProtVeredicto()` | `nivel` | **`posible`** | **sí**, cinco causas |
| mitral | `vmProtEOA()` | `obstr` | **`posible`** | **sí**, cuatro causas |
| tricúspide | `vtProtObstr()` | `obstr` | (`aislado`) | **no** → `P21-a` |
| pulmonar | `vpProtObstr()` | `obstr` | (`posible`) | **no** → `P21-a` |

### 3.2 · Qué se marca sola, y qué no

- **Aórtica**: **sólo** la rama del **hiperflujo** y la del **desajuste**, que son las que la
  **Figura 13 de la ASE 2024** (hoja 18, folio 19) decide con el **cociente de VTI** y el **área
  efectiva indexada** que la app ya calcula: con el cociente en **0,30 o más**, el área por encima
  de **0,85 cm²/m²** apunta al hiperflujo y por debajo al desajuste. Por debajo de 0,30 ninguna.
  El dueño es **`_protaCausaDecide(V, clave)`**. Las otras tres quedan como texto.
- **Mitral**: **ninguna**, y no es un olvido. La guía da para la mitral una **lista** (hoja 24,
  folio 25) y **no un algoritmo**: no hay ningún número de los que la app tiene que decida cuál de
  las cuatro es. Las cuatro salen con ❓.
- **Tricúspide y pulmonar**: **no hay bloque**. La ASE 2024 trae **una sola** enumeración de causas
  de estenosis protésica —la de la mitral— más el algoritmo de la Figura 13 para la aórtica. Su
  **Tabla 19** (hoja 35, folio 36) y su **Tabla 15** (hoja 32, folio 33) publican **cortes y no
  causas**. Las dos secciones lo **DICEN** en una de sus notas.

**NO se agrega ningún criterio de graduación y no se toca ninguna tarjeta de severidad.**

---

## 4 · Qué guía rige cada sección

**Decisión del médico (3).** Una pregunta usa los cortes de **UNA sola** guía.

| sección | rige | referencia, en su propia oración |
|---|---|---|
| aórtica | ESC/EACTS 2025, Tabla 17 (hoja 66, folio 4700) y Figura 20 (hoja 65, folio 4699) | ACC/AHA 2020 (hojas 79, 81 y 83; folios e150, e152 y e154) |
| mitral | ídem (ya lo era) | ídem |
| tricúspide | ídem | ídem |
| **pulmonar** | **ACC/AHA 2025 de congénitas** (hoja 75, folio e189) | **ESC 2020 de congénitas, inglesa** (hoja 60, folio 622) |

⚠️ **LA ESC/EACTS 2025 NO SE USA EN LA PULMONAR, y no es una elección**: su Tabla 17 **no tiene
ninguna fila de prótesis pulmonar**, verificado fila por fila. Sus únicas posiciones nombradas son
la **aórtica** (fila 6, transfemoral) y la **mitral o tricuspídea** (fila 7, transvenoso).

⚠️ **EL VALVE-IN-VALVE DE CADA POSICIÓN ES UNA FILA DISTINTA DE LA MISMA TABLA.** La 6 es
**transfemoral** y de la posición aórtica; la 7 es **transvenoso** y de la mitral o la
tricuspídea. Confundirlas publicaría una vía de acceso que esa fila no dice.

⚠️ **EL NOMBRE DE LA GUÍA AMERICANA DE CONGÉNITAS ES «ACC/AHA 2025» y no se renombra**, por lo que
el `CLAUDE.md` del proyecto fija desde PANT-17b.

---

## 5 · Las etiquetas cortas de guía

`IND_GUIA_LBL` gana **dos** entradas: **`vhd25`** → «ESC/EACTS 2025» y **`vhd20`** → «ACC/AHA
2020». ⚠️ **No se reusan `esc` ni `acc`**: ésas ya valen «ESC 2020» y «ACC/AHA 2025», que son las
de **congénitas**, y reusarlas pondría el año equivocado en la fila de cada pregunta — que es
justo lo que la regla E-1, «con su nombre y año visibles», existe para impedir.

**Las claves de cita no son nuevas**: `esc2025vc`, `ahaProtM2020`, `aseProtM2024`, `acc2025achd` y
`esc2020guch` ya estaban en `IND_REFS`.

---

## 6 · Las preguntas, y qué se pre-responde

| sección | preguntas | condicionales | pre-respondidas desde un campo |
|---|---|---|---|
| aórtica | **12** | 2 de fuga, 3 de trombosis (y por tipo de prótesis) | **1**: `prota.pvl` desde `ea_pvl_origen` |
| mitral | 6 (4 en el estado inicial) | 2 | ninguna |
| tricúspide | **12** | 2 de fuga, 3 de trombosis | ninguna |
| pulmonar | **11** | ninguna | ninguna |

⚠️ **UNA PREGUNTA SE PRE-RESPONDE SÓLO DESDE UN CAMPO QUE SIGNIFIQUE EXACTAMENTE LO MISMO.**
`ea_pvl_origen` lo cumple: «paravalvular» y «mixta» son fuga paravalvular, «central» es que la hay
y **no** lo es, y vacío es ausencia de dato. Con un valor de origen, `_indFilaOrigen` **ni siquiera
dibuja el control**, que es su contrato.

⚠️ **CENSADO: la aplicación NO tiene campo de síntomas, de riesgo quirúrgico ni de trombosis
protésica.** Las preguntas que dependen de ellos se contestan a mano, igual que en la mitral.

⚠️ **LAS CONDICIONALES NO SON COSMÉTICA**: una pregunta de trombosis de prótesis **biológica**
sobre una **mecánica**, o una fila de fuga sobre un paciente sin fuga, se contestarían «?» para
siempre y el contador diría que falta algo que no aplica. Se filtran **por el mismo dato que
decide la rama de la guía**, no por una lista escrita aparte.

---

## 7 · La mitral: lo que NO hizo falta, y por qué

⚠️ **EL COMMIT 4a SE PARÓ: no falta ninguna recomendación.** Censado sobre el árbol anterior,
`PROTM_REC_2025` ya traía **doce** claves, que son las **doce filas de la Tabla 17 que alcanzan a
la posición mitral**, cada una con su clase y su nivel, y coinciden fila por fila con lo leído en
imagen:

```
pvl_ht I·C · pvl_reop I·C · pvl_tc IIa·B · mec_reop I·C · bio_reint I·C · viv_mitral IIa·B
asint_reop IIa·C · tromb_img I·C · tromb_mec I·B · tromb_emb IIa·C · tromb_bio I·B · tromb_halt IIa·B
```

La decimotercera fila de la tabla es el valve-in-valve **transfemoral** de la posición **aórtica**
y no alcanza a la mitral. Y `PROTM_REC_AHA_2020` ya traía las **cinco** de la ACC/AHA 2020.
**Lo fija TC-744 (C0)**, que es el guardián de esa parada: se pone rojo tanto si una desaparece
como si alguien agrega una decimotercera creyendo que falta.

⚠️ **Y la mitral NO lleva `cuenta`, a propósito**: el contador del encabezado imprime
«N Sí · N No · N sin dato», y dos de sus seis preguntas no se contestan con Sí o No —el riesgo
quirúrgico es Bajo / Intermedio o alto—. Un contador con esos rótulos diría algo que las botoneras
no dicen. El emisor ya trata `cuenta` ausente: omite el span y deja el botón de columnas.

---

## 8 · Lo que esta tanda NO tocó

**Cero campos guardados nuevos**, **cero columnas de Excel** (457), **ningún id existente cambió**
y **el papel es idéntico**. Lo que se contesta en la Evidencia vive en `_indClin`, que es memoria
efímera del panel y se borra al cerrarlo.

No se tocaron: el informe, el EN SUMA, el Laboratorio, la tarjeta de severidad aórtica, el catálogo
de modelos, el AT/ET, la graduación de ninguna válvula, la Evidencia de las demás secciones ni el
3D del corazón.

---

## 9 · Las sondas y los casos

| qué mide | sonda |
|---|---|
| el orden de la sección y el control negativo de todas las demás | `scripts/_probe_pant21orden.mjs` |
| las cuatro secciones, con el gesto real (`--pos va\|vm\|vt\|vp`) | `scripts/_probe_pant21prot.mjs` |
| Chrome y WebKit, cuatro anchos, dos temas | `scripts/_probe_pant21wk.mjs` |
| el A/B de superficies | `scripts/_probe_pant21ab.mjs` |
| el barrido de mutaciones dirigidas | `scripts/_mut_pant21.py` |

Casos nuevos: **TC-742** (sección aórtica) · **TC-743** (causas aórticas) · **TC-744** (mitral) ·
**TC-745** (tricúspide) · **TC-746** (pulmonar) · **TC-747** (emisor compartido).
Casos adaptados: **TC-291** (invertido), **TC-322** (tres escenarios nuevos) y **TC-533** (42 → 45).

---

## 10 · Tres trampas que esta tanda pagó

1. **El acento grave dentro de MI PROPIO comentario**, en el cuerpo de un caso. El cuerpo es un
   template literal: lo cierra y el archivo deja de parsear. Lo caza `node --check`.
2. **La barra invertida de un literal de expresión regular** no sobrevive al template literal:
   `/ESC\/EACTS 2025/` llegó como `/ESC/EACTS 2025/` y dio «Invalid regular expression flags». Se
   cerró **no usando ninguna expresión regular**.
3. **Los títulos de los recuadros del panel NO van en mayúsculas en el HTML** — la mayúscula la
   pone el CSS con `text-transform`. Buscarlos en el HTML con la forma que el DOM muestra devuelve
   −1 sobre un recuadro que **sí** está.
