# Mapa · El prompt 4 del 18/11 — la diastole sin conteos, el TRIV, Referencias y el aviso

Nueve puntos. Lo que cada uno movio, donde vive su dueño y que decidio que se hiciera asi.
Los numeros de linea NO se guardan a proposito: cambian en cada edicion, el nombre de la funcion no.

---

## 1 · La diastole sin conteos en el TEXTO ESCRITO

**Dueño:** `diastASE2025Evaluar` (ritmo sinusal). La constante `nPar` **ya no existe**.

**Donde estaba:** interpolada en SEIS ramas — `altaSinEa`, `g3`, `g2`, `indetComb`, `g1` y
`normalSinGrado`.

**Que NO se toco, y es la mitad del punto:** `R.pos` y `R.total` siguen vivos y los sigue
publicando `R.ventanaDet`, que alimenta la **ventana 🧭** y la nota «Via aplicada» de la tarjeta.
Las dos son PANTALLA. El resto de las formas del conteo del archivo —`R.via`, los `det1`/`det2`
de los tres protocolos de FA y el `R.pos + ' de ' + R.total` de la BSE y de la ASE 2016— van
todas a esas dos superficies y **se quedan**.

**Los otros tres algoritmos, medidos antes de tocar nada:**

| Algoritmo | Publicaba el conteo en el texto escrito |
|---|---|
| ASE 2025, ritmo sinusal | **SI**, en seis ramas. Es el unico. |
| ASE/EACVI 2016, ritmo sinusal | No: lo perdio en la 3A (su atajo de E/A >= 2 y sus dos «cannot determine») |
| BSE 2024 | No: sus frases ENUMERAN los parametros que votaron (`_bseDetalles`), no los cuentan |
| Los TRES protocolos de FA | No: su conteo nacio en `ventanaDet` |

**Cobertura:** TC-948 (informe), TC-949 (EN SUMA, guarda), TC-950 (PDF, sobre el content stream).
TC-948 y TC-950 caen contra el arbol anterior; TC-949 pasa en los dos y se declara en **PR4-a**.

---

## 2 · La recomendacion de la dobutamina fuera del informe

**Dueño:** el bloque del **escenario hemodinamico del bajo gradiente** de la estenosis aortica,
dentro del emisor del informe narrativo, rama `_eaR.sub === 'bfbg_clasica'`.

Lo que salio: «Considerar ecocardiograma con dobutamina a bajas dosis para distinguir severidad
verdadera de pseudo-severa.» Lo que queda: la descripcion entera, con sus seis numeros y la cola
de proximidad al umbral de 50 %.

**Donde vive ahora ese contenido:** en la Evidencia, en la nota del estadio **D2** de la Tabla 7
de la ACC/AHA 2020 (`_indEstEA`). No se agrego nada.

**Las otras tres colas del mismo bloque** —score de calcio por TAC, revision del TSVI y repaso de
las integrales— **no se tocaron**: **PR4-b**.

---

## 3 · Los elementos indirectos de HTP

**Dueño del corte:** `DT_TRIV_HTP = 75`, con `DT_TAP_HTP = 105`. **Los dos lectores**:
`dopTricEstado` (el informe y el EN SUMA, por `htpIndirectosFrase`) y `_dtTrivRefTxt` (las dos
filas de referencia: Doppler → tricuspide y VD/AD). Los dos comparan con `>=` desde el MEDIR-6.

**Lo que este punto cerro:** la seccion de **hipertension pulmonar** del panel de Evidencia
(`_indHTP`, bloque `_propios`) decia «por encima de 75 ms», que es el operador ESTRICTO. Pasa a
«de 75 ms o mas». Y el globo `vd-triv` —cuyo texto vive en `TRIV_DTI_LEE` y `TRIV_DTI_FUENTE`,
leidos por los TRES lugares que lo muestran— **declara el corte como criterio de la aplicacion**.

**Las fuentes:** Howard LS 2012, Cabrita IZ 2013 y Brechot N 2008 **no estan en la biblioteca**
—buscadas por nombre en «16- HTP», «03_VD_y_corazon_derecho», «17- Doppler tisular y strain» y en
todo el arbol—. Las tres citas se CONSERVAN, sin folio, y el globo declara el criterio como
propio.

---

## 4 · El strain GLOBAL del VD — NO se implemento

La Tabla 1 de la ASE 2025 (hoja 5, folio **145**) trae **DOS** filas de strain:

| Fila | Normal | Leve | Moderada | Severa |
|---|---|---|---|---|
| `RV longitudinal free wall strain (three segment)` | >20 | <=20 a >=15 | <15 a >=11 | <11 |
| `RV longitudinal global strain (six segment)` | >17 | <=17 a >13 | <=13 a >9 | <=9 |

Los cortes que la orden pide —20 / 15 / 11— son los de la **pared libre**, que la aplicacion **ya
gradua en cuatro tramos desde la 3A** (`VD_STRAIN_PL_NORMAL`, `_LEVE`, `_MOD` y `vdStrainPlCat`).
Los del strain **global** son otros, y la aplicacion **no tiene campo** para esa magnitud. Por la
regla de la orden —«si la fuente NO coincide, no implementes este punto»— no se toco nada. Ya
estaba declarado en **P3A-b**.

---

## 5 · Referencias · protesis

**El orden de las siete fichas:** `pao, pm, ptric, ppulm, trombo, viv, endo`. Es una mudanza de
nodos dentro de `#ref-protesicas`: ningun id se toca y `REF_SUBTAB` no se entera, porque ese
registro reubica el CONTENEDOR y no cada ficha.

**La tabla fija de valores esperados.** Dueños:

| Pieza | Dueño |
|---|---|
| Que tabla va en cada ficha | `VMOD_REF_TABLAS` |
| El catalogo de cada posicion | `VMOD_TABLA` y las constantes `PROT_CAT_A4`, `_TAVI`, `_A5`, `_A9`, `_A7` |
| El orden de las columnas | el `_COLS` de cada catalogo |
| El rotulo de cada columna | `VMOD_COL_TXT`, el mismo que usan los chips del selector |
| El formato de cada celda | `_vmPar` (valor ± desvio, o el TEXTO IMPRESO de medianas y limites) |
| El armador de la tabla | `vModRefTabla` (con NODOS, sin `innerHTML`) |
| La linea de fuente | `_vmRefFuente`, del `_FTE` del catalogo |
| El pintor por ficha | `vModRefTablaPintar`, llamado desde `toggleRef` |

La **aortica lleva DOS** tablas —quirurgica y transcateter—, el mismo reparto de `vModCatalogo`.
La **Tabla A8** no entra: **PR4-g**.

**«AEO» y no «EOA»:** el renombre vive en `VMOD_COL_TXT` y en los cuatro literales del chip de la
indexada predicha. Los nombres de funcion (`vmProtEOA`, `vmProtEOAPintar`) no son texto visible.

⚠️ **Para MEDIR estas tablas hay que abrir TRES niveles**: la pestaña `refs`, la subpestaña
**`valv`** —no `protesicas`— y la entrada plegable **`protesicas`**. Con cualquiera cerrado las
tablas miden 0 x 0 y el desplazamiento horizontal da 0, que se lee igual que «no desborda».

---

## 6 · Referencias · criterios de severidad

**Lo que ya estaba:** la tabla de cortes de CINCO lesiones nativas (`ref-im`, `ref-em`, `ref-ia`,
`ref-eao`, `ref-it`) y de las CUATRO posiciones proteticas, con el PPM aortico.

**Lo que entro:** las TRES lesiones que no tenian ficha — `ref-sevet` (estenosis tricuspidea),
`ref-sevep` (estenosis pulmonar) y `ref-sevip` (insuficiencia pulmonar), dentro de
`#ref-nativas` y detras de `it`. Las genera `scripts/_gen_sev_ref.py`, que emite tambien
`docs/CONTROL_SEVERIDAD_REF.md` con el inventario completo y las ONCE diferencias con la guia.

**Ningun corte se toco.** TC-956 compara cada corte publicado contra su constante leida en vivo
—`ET_CRIT`, `EP_GMAX_*`, `IP_PHT_SEVERA`— y ademas exige que esas constantes sigan en su valor.

**Lo que mueve de denominadores:** el censo de entradas de Referencias **42 → 45**, el indice del
buscador **40 → 43** y el reparto de `valv` **14 → 17**.

---

## 7 · Referencias · el resumen del posoperatorio

Vive en `#ref-pop-resumen`, **antes** de la tabla de criterios de `#ref-pop`, que no se toco: sus
DIECISIETE `tr` y sus DIECISIETE ⓘ siguen iguales y el resumen no agrega ninguno.

Lo genera `scripts/_gen_pop_ref.py`, que emite tambien `docs/CONTROL_POP_REF.md` con la
trazabilidad de las dieciocho afirmaciones y los diecisiete items que quedaron afuera.

---

## 8 · `prot-vmax.ojo` — solo informado

No se toco. Sigue siendo **P3A-a**.

---

## 9 · El aviso de independencia y su ⓘ

| Pieza | Dueño |
|---|---|
| La frase de cabecera | el marcado de `#modalAvisoEco` |
| Los TRES bloques, con su dibujito ADENTRO del nodo | `#eco-indep-1`, `#eco-indep-2`, `#eco-indep-3` |
| La lista de esos tres ids | `INDEP_IDS` |
| El cuarto bloque, lo unico propio del globo | `INDEP_EXTRA` |
| El cuerpo del globo | `_indepGloboInfo`, que LEE los tres nodos |
| El ancho de la tarjeta | la clave `ev-indep` de `VINFO` (460 px) |

Los dos ids viejos —`eco-indep-txt` y `eco-indep-fin`— **se retiraron**: **PR4-i**.

⚠️ **Para medir el aviso hay que MOSTRARLO**: nace en `display:none` y lo abre el flujo del login,
asi que en un arnes esta cerrado y su boton mide 0 x 0.
