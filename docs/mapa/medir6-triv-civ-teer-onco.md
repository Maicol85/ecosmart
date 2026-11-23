# MEDIR-6 — el visor, el TRIV, la CIV, el TEER, la Tabla 4 y el cor triatriatum

> Mapa por **nombre de función y constante**, no por número de línea: la línea cambia en cada
> edición y el nombre no. Armado sobre el sello `v20261116-0650`.

---

## 0 · Lo que se midió antes de tocar, y las premisas que se dieron vuelta

| punto | la premisa del pedido | lo que estaba |
|---|---|---|
| **A2** | «lista los VTI para el Qp/Qs y queda al cambiar de válvula» | **media falsa**: `_vtiPanel` nunca estuvo atada a una válvula — se dibuja con la herramienta VTI activa, con cualquiera abierta o con ninguna |
| **A3** | dos claves que no se hablan | **TRES dueños**: `_dop.tri.vciDiam`, `_d2.vci.vci` y el campo `vci_diam` |
| **A5** | «elimina una medición por clic» | `medBorrar` vaciaba **cinco colecciones** y entre ellas **no había un orden común** |
| **A6** | una tabla por lado | `_dop` y `_d2` son estado **de módulo A PROPÓSITO** — la ecuación de continuidad cruza planos que con dos vistas son dos pantallas |
| **B1** | el corte pasa a ≥75 | el corte **ya era 75**; lo que faltaba era el operador, y el ⓘ **ya citaba** a Cabrita y Bréchot |
| **B2** | el ⓘ debe decir que es orientativo | **ya lo decía**, con sus folios; y el grado **ya no conducía** ninguna conclusión |
| **B5** | el clip a ≥11 mm | **ya estaba aplicado** desde R2; lo que faltaba era el **tethering** |
| **C2** | rotular como criterio propio | **ya estaba rotulado en cinco lugares** |
| **E1** | los casos quedan verdes sobre cero archivos | **ya fallaban fuerte**: los diecisiete declaran su denominador con `false` |

---

## 1 · El visor (A1 a A5)

### A1 · Los calculados debajo de la imagen — `_vSlotSync`, `cine-calc-slot`

`#cine-calc` **viaja** a una ranura nueva de la columna **izquierda** del panel, después de la
imagen. Mismo mecanismo y **mismo dueño** que el cajón Doppler, porque sus números salen de `_dop`.

- Sin ninguna vista midiendo en Doppler, `dueno` cae en la activa — hace falta, porque la mini
  tabla de FC es «fija debajo de cualquier imagen».
- ⚠️ **Por debajo de 1024 px vuelve al nivel del modal**, que es lo de antes. Se repone **después
  de `cine-simp-uni`** y no antes de `cine-dop-slot`: ese vecino lo mueve la misma función.
- ⚠️ **El reacomodo cuelga del `resize`** que el visor ya tenía: el corte lo decide el ancho de la
  ventana y los dos render corren al medir, no al agrandar el visor.
- La clase `cine-calc-enpanel` le saca el tope de 780 px, con `!important` porque el margen y el
  tope salen de un estilo **en línea**.

**Revierte a propósito la ubicación de MEDIR-5** (su mapa §6), por pedido del médico.

### A2 · La lista de VTI — `_vtiPanel`

Sale **sólo con la aórtica o la pulmonar** abiertas, que son los planos del TSVI y del TSVD, y
lista **sólo las libres**.

⚠️ **El índice que viaja en el botón es el de `_medVtis` y no el de la lista filtrada.** Es la
trampa de `_vPickLista` (MEDIR-4a): `medVtiAsignar(i)` indexa la colección real, así que con el
índice de la lista dibujada el botón asigna **otra medición del paciente**, en silencio.

⚠️ **Las asignadas conservan su botón** en un renglón compacto: sacarlas dejaba sin ninguna forma
de corregir una asignación cruzada, y el rol es exclusivo.

### A3 · El alias de la VCI — `_D2_ALIAS`

Entra `'vci.vci': 'tri.vciDiam'`, la tercera entrada. Las dos puntas están en **mm** y las dos
prestan la banda del **mismo** campo (`vci_diam`, ver `_D2_BANDA_DE`).

⚠️ **Lo que se perdía no era un rótulo: de `tri.vciDiam` cuelga la PmAD.** Medir la VCI y no ver
ninguna presión de aurícula derecha era el estado **normal**, no el raro.

### A4 · «Limpiar» por estructura — `_dopLimpiarGrupo`, `_d2LimpiarGrupo`

⚠️ **`_dopLimpiar` y `_d2Limpiar` NO se tocan**: las llaman «Nuevo estudio» y `cerrarSesionReal`,
y las dos **tienen** que llevarse todo. Lo que se acota es el **botón**.

- El grupo se repone desde **`_dopNuevo()`** y no poniendo sus campos en `null`: los valores
  iniciales no son todos `null` (`tri.vciCol` nace en cadena vacía).
- En el cajón 2D se barre por **`_D2_FILAS_DE`** y **no por el prefijo de la clave**: `vi.tsvi` se
  **dibuja** en el grupo de la aorta y `vd.tsvd` en el del VD.
- El diálogo filtra los alias al grupo que se limpia y **dice qué sobrevive**.

### A5 · «Borrar» de a uno — `_medSello`, `medBorrarUna`

Hacía falta un **orden común** entre las cinco colecciones: dentro de un arreglo se sabe qué vino
después, pero entre una velocidad y un área no había forma de decirlo.

- `_medSello` es **por vista** (las cinco colecciones son accesores sobre `_V`) y vive al lado de
  `_vBind`, porque los seis sitios que crean mediciones están en **tres bloques `<script>`**.
- Un **gesto a medio hacer se cancela primero**: los puntos sueltos y el trazo en curso son lo más
  reciente, así que borrar una medición terminada dejándolos dibujados haría que el botón parezca
  que no hizo nada.
- La **calibración no entra**, igual que antes.
- ⚠️ **`medBorrar` queda intacta**: es el reseteo de las puertas internas y con la que la batería
  arma sus escenas — **diecinueve usos**.

### A6 · Lo que NO se hizo

La tabla por lado queda para su propio prompt. El estado seguirá siendo **uno** y cada lado
filtrará por `_dop.origen`, que ya existe (`'A'` / `'B'` / `'mano'`).

---

## 2 · El TRIV a ≥ 75 ms (B1) — `DT_TRIV_HTP`

El corte **ya era 75**. Lo que cambió es el operador, en los **dos** lectores:

| | antes | hoy |
|---|---|---|
| `dopTricEstado` | `triv > DT_TRIV_HTP` | `triv >= DT_TRIV_HTP` |
| `_dtTrivRefTxt` | `r.triv > DT_TRIV_HTP` | `r.triv >= DT_TRIV_HTP` |

Y las **tres cadenas** que publican el operador pasan a decir «≥».

⚠️ **El globo se desmentía a sí mismo.** `TRIV_DTI_LEE` decía «prolongado —más de 75 ms—» mientras
`TRIV_DTI_FUENTE`, tres líneas más abajo, cita el consenso como **«normal menos de 75 ms, anormal
75 ms o más»**. O sea que el documento del que sale el corte ya lo daba **incluido** y la app lo
leía más estricto que su propia fuente. Hoy dicen lo mismo.

**Cabrita 2013 y Bréchot 2008 ya estaban citados** con autor y año: no se agregó ninguna cita.

---

## 3 · El índice de Celermajer (B2) — `cc9-ebs-cel`

Las dos mitades **ya estaban cumplidas** y se verificaron en vez de suponerlas:

- el `ojo` del globo ya decía «orientativo, no una indicación» y «se derivó en una serie de **50
  neonatos**», con sus folios;
- el grado **no conduce** ninguna conclusión: `ebsConclusion` usa `cel.idx` sólo para decidir si
  **hay** dato, y el «grado» que evalúa es el de la **IT**.

Lo único que entró es el encuadre explícito de que **en adultos** se aplica por extensión.

---

## 4 · La CIV sin el DDVI indexado (B3) — `_civConducta`

`CIV_DDVI_IDX_CIERRE` (32 mm/m²) **se retira con su lápida**. El archivo ya la declaraba como
criterio propio en tres lugares y decía textualmente que corregirla *«es contenido clínico y es
decisión del médico»*.

- La conducta la decide el **Qp/Qs**.
- Los rótulos de `CIV_CONDUCTAS` dicen lo que dice la guía: sobrecarga de volumen del VI sin
  hipertensión pulmonar, y el Qp/Qs.
- La fila del DDVI de la Evidencia queda **descriptiva** — nunca marca criterio cumplido — y manda
  a la pregunta `civ.ev.vidil`, que es donde el médico afirma la sobrecarga.
- La cita `escGuchCiv` deja de listar ese corte.

⚠️ **Se cae de paso la contradicción que su propio comentario describía**: ya no hay forma de que
la misma tabla diga «contraindicado» y «criterio de cierre» a la vez.

⚠️ **DOS cosas no se tocan y se declaran**: el **«Normal < 32 mm/m²»** de Hemodinámica, que es una
referencia de **normalidad** de la medición y no un criterio de cierre; y **`_pDilVi`**, propiedad
**descriptiva** de cohorte compartida por **cuatro** fichas —CIA incluida— que no lee la constante
retirada.

---

## 5 · El TEER (B4 y B5)

### B4 · Los cuatro tramos del velo posterior — `_teerVpTramo`

Dueño único del nombre de cada tramo: lo leen el criterio `c1b` y su fila, así que no pueden
nombrar el mismo milimetraje de dos maneras.

| longitud | tramo | ¿cumple? |
|---|---|---|
| más de 10 mm | agarre no complejo | **sí** |
| 7 a 10 mm | agarre complejo | no |
| 5 a 7 mm | agarre muy complejo | no |
| menos de 5 mm | agarre difícil o imposible | no |

⚠️ **Los bordes se resolvieron HACIA ABAJO y queda declarado**: el médico escribió los tramos con
los extremos repetidos («7-10» y «5-7»), así que **7,0 exactos es «complejo»** y **5,0 es «muy
complejo»**. Si lo quiere al revés son dos operadores.

**Sigue siendo una advertencia y no un veto**; el velo anterior ≥20 mm no se tocó.

### B5 · Los dos cortes de la coaptación, por procedimiento

| procedimiento | corte | dueño | ¿cambió? |
|---|---|---|---|
| reparación quirúrgica | **10 mm o más** desfavorable | `REPAR_COAPT_MM` | **no** |
| clip | **11 mm o más** desfavorable, **y sólo con tethering** | `c4` + `hayTethering` | el tethering es nuevo |

⚠️ **El tethering NO agrega ningún campo**: ya se consigna en el **Carpentier IIIb** y en el
**mecanismo** de la IM secundaria, y se lee de los **dos** porque el médico puede haber cargado uno
y no el otro. **Falla hacia NO afirmar**: sin consignarlo el criterio queda «sin dato».

El pie de fuentes dice ahora que son **criterios de exclusión de un estudio pequeño y no de una
guía**, aplicados **por extensión** sobre las medidas del ETE, y separa expresamente la
**longitud** de coaptación de menos de 2 mm —otra medida del mismo trabajo— de la **profundidad**.

**Lo que ya estaba y se verificó sin tocar**: el ángulo posterolateral en «más de 45°» y el área de
tenting disparando en **2,5** con el rango «>2,5-3» declarado en el pie.

**La altura de tenting de 10 mm pasa a criterio propio**: el renglón la atribuía a una tabla de
material suplementario descrita para el TEER, y la pantalla la publica **también** junto a los
factores de la reparación. El número no cambia.

---

## 6 · La Tabla 4, tres casillas (C1) — `coT4Pesos`

Una casilla para **tres filas** de la tabla, con «el **mayor** de las tres». Se parte:

| casilla | antraciclinas | anti-HER2 | anti-VEGF | BCR-ABL | mieloma | RAF/MEK |
|---|---|---|---|---|---|---|
| `hfaicos_cv_vhd` — valvulopatía severa | alto | alto | **—** | — | — | alto |
| `hfaicos_cv_mi` — infarto, angioplastia o cirugía | alto | alto | muy alto | — | — | alto |
| `hfaicos_cv_angina` — angina estable | alto | alto | muy alto | — | — | alto |

⚠️ **El puntaje propio NO se mueve**, y es la mitad que no se podía romper: los tres entran en
`_hfaicosCvGrupo` —que era `_hfaicosCvTerna` y mentía, porque ya no son tres— y el grupo sigue
sumando **2 en total** y no 2 por casilla. `hfaicosMax` saltea los tres nuevos, así que el máximo
sigue siendo **13**.

**D2-a queda cerrado.** Su caso era: con anti-VEGF, un paciente cuyo único antecedente fuera una
valvulopatía severa se clasificaba como si tuviera un infarto. Hoy da **bajo**, y la angina estable
sola en esa **misma** columna sigue dando muy alto — o sea que las tres filas se distinguen y no es
que bajaron todas.

---

## 7 · El cor triatriatum (D1) — `OTR_HALL`, `OTR_VAR_IDS`

Casilla y caja de nota con el **mismo molde** que las otras siete variantes.

⚠️ **Es la primera variante que sube al EN SUMA**, y por eso su entrada trae **`sumaNota`** en vez
de una sigla: el ASIA y la RAC suben con su sigla sola porque la sigla **es** el hallazgo, mientras
que acá lo que el médico escribe (el lado, el gradiente) es parte de lo que el EN SUMA tiene que
decir. Con la caja vacía sube el nombre solo.

⚠️ **Hubo que agregarlo a `OTR_VAR_IDS`**, que **no** es la misma lista que `OTR_HALL`: de ella
cuelga que la caja de nota aparezca al marcar. Sin esa entrada la celda existía y su caja no se
mostraba nunca. `otr_var_vcsip` sigue sin caja, que es por lo que las dos listas no coinciden.

---

## 8 · La comprobación del pendrive (E1) — `scripts/_lotes_medir6.sh`

1. **Lee DICOMDIR** con `dd bs=4096 count=1` y no lista: `ls` sobre un volumen desmontado puede
   contestar **de caché** —la trampa del «pendrive fantasma»—, así que listar puede decir
   «montado» sobre un disco que ya no está.
2. **Mide el tiempo**: un volumen que responde pero tarda es un disco que se está yendo, y el
   síntoma siguiente es un caso que falla por tiempo y parece un defecto de la app.
3. **Declara cuántos archivos encontró** en `GEMS_IMG`, y si son **cero corta**: montado y vacío
   pasaba el `[ -d ]` y los diecisiete casos salían verdes sobre **cero archivos**.
4. **Toque previo** antes del primer lote, para que el costo de despertar el volumen no caiga
   dentro de un caso.

**Y la mitad que ya estaba cumplida se verificó midiéndola**: los casos que dependen del disco ya
fallan fuerte. Medido con TC-181: **1/1 con el disco, 0/1 sin él**, con el diagnóstico nombrando la
ruta que faltó.

---

## 9 · Cobertura

| caso | qué fija |
|---|---|
| **TC-906** | A1 — el bloque en la ranura de su vista, fuera de la columna de la tabla, y de vuelta al modal en ventana angosta |
| **TC-907** | A2 — sólo aórtica y pulmonar, sólo las libres, y el **índice real** de `_medVtis` |
| **TC-908** | A3 — el alias en los dos sentidos, la fila llena y la PmAD habilitada |
| **TC-909** | A4 — la estructura abierta se borra y las otras sobreviven; «Nuevo estudio» sigue llevándose todo |
| **TC-910** | A5 — una por clic en orden inverso de llegada, el gesto a medio hacer primero, la calibración intacta |
| **TC-911** | D1 — las dos superficies con nota y sin nota, en oración aparte, y el control de apagada |

Los seis caen **0/6** contra su línea base, **ninguno por excepción**.

**Casos adaptados** (15): TC-86, TC-101, TC-133, TC-170, TC-251, TC-264, TC-428, TC-499, TC-507,
TC-540, TC-549, TC-552, TC-553, TC-556, TC-648, TC-664, TC-759 — con **once condiciones
INVERTIDAS**, o sea que fallan por los dos lados.

⚠️ **TC-535 no era de esta tanda**: falla con las mismas tres condiciones en los dos árboles. Es un
resto de **PANT-38**, que agregó el globo `clnk-guia` y dejó el censo en 65. Se mueve a **66**.

**Punteros de prueba**: ⚠️ `docs/mapa/tests-punteros-tandas.md` está en **35,5 KB**, o sea **ya
cruzó el techo**, así que esta tanda **no le agregó nada** y sus punteros viven acá. La próxima que
lo toque tiene que partirlo.

---

## 10 · Lo que esta tanda NO hizo

- **A6** — la tabla por lado, que va en su propio prompt.
- **La mudanza de «Estado vigente»** de `CLAUDE.md`, por decimosexta tanda seguida.

---

## → La tanda PR5 (2026-11-23)

Lo que PR5 movió de esta zona está en **`docs/mapa/pr5-esperado-senos-devereux.md`**:

- el **valor esperado de los senos de Valsalva** por Devereux 2012 —en pantalla, en una oración del
  informe que el PDF imprime por el mismo lugar, y en cinco bloques de evidencia en el globo y en
  Referencias—, con `aorPredSenosCm` como **dueño único de la ecuación**, que `mfsZCalc` pasó a
  consumir junto con el desvío, la edad mínima y la superficie de DuBois;
- las **tres colas** del bloque de bajo flujo / bajo gradiente de la estenosis aórtica —el score de
  calcio por TAC, la medición del TSVI y el repaso de las integrales— **retiradas del papel**, que
  cierra **PR4-b**; y la línea de **discordancia de grado**, que **no** es de ese bloque y **no se
  tocó**;
- el folio del umbral del **cor triatriatum**, de **e164** a **e165**, en el texto de apoyo de la
  recomendación 5 y sin clase propia.

**Ningún corte, operador ni voto de esta zona se movió**: lo fija TC-1030 (D1) para la cápsula del
seno y TC-1034 (C1) para los números del paréntesis del bajo gradiente. Lo declarado, en
`docs/PENDIENTES.md` → **PR5-a** a **PR5-h**.
