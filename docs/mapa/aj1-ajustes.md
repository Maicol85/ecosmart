# AJ1 — los siete ajustes ya decididos (22/10/2026)

Mapa de la tanda **AJ1**: la versión de MAYO de la ASE 2025 en el VD, el strain de pared libre sin
sexo, la coartación reparada que deja de indicar controles, el índice de dimensión aórtica, el
Ehlers-Danlos vascular en el EN SUMA, el corte alternativo de la IM secundaria y el flujo reverso
de la aorta descendente graduado por su duración.

Está armado sobre el sello `v20261022-xxxx` y **no guarda números de línea**: la línea cambia en
cada edición, el nombre de la función no.

---

## 1 · Las piezas, por nombre

| Qué | Dónde vive |
|---|---|
| Los cortes del corazón derecho | `ASE25_T1` (congelada), `ase25Grado`, `ase25Rango` |
| El rango «leve-moderada» del informe | `vdDisfGrado` |
| El strain de pared libre | `VD_STRAIN_NORMAL` (const de **módulo**, sin `window`), `_vdCalcular` |
| La coartación | `coaConclusion`, `coaSync`, `_indCoAo` |
| El globo ⓘ de la aorta | `evTarjetaAo` (cuarto `ev-cat`, `data-ev-cat="ao-operador"`) |
| El índice de dimensión aórtica | `AO_IDA_MAX`, `aoIdaVal`, `aoIdaDilatado`; lo consume `_indAo` |
| El Ehlers-Danlos del EN SUMA | la rama `sin_umbral` del bloque de aortopatías de `generarInforme` |
| El corte alternativo de la IM | `IMS_ALT_EROA`, `IMS_ALT_VOLR`, `imSecAltPintar`, `imSecAltSiExiste`, span `#im-sec-alt` |
| El flujo reverso | `<select id="ia_rev_dur">`, fila `#ia-rev-dur-interp`, dentro de `calcIA_ESC` |
| Las fichas | `EV_REG` → `FUN-VD-007` y `AOR-004`; `EV_GUIA_ASE2025VD`, `EV_GUIA_ESC2024AO` |
| Cobertura | **TC-516**, 51 condiciones |

---

## 2 · El VD a la versión de MAYO (E1 y E2)

El mismo artículo tiene **dos PDF**: el de febrero (creación 2025-02-28, con erratas, archivado en
`Archivo_EcoSmart/Retirados`) y el de **mayo** (creación 2025-05-07, el de la biblioteca, con el
mismo `md5` en `03_VD_y_corazon_derecho` y en `16- HTP`). La Tabla 1 se releyó **EN IMAGEN a 300
ppp** en las dos y el diff completo de la hoja 5 da **ONCE** diferencias.

⚠️ **Esa fuente codifica `≥` como `$` y `≤` como `#`** en el texto extraído: quien la lea sin
saberlo invierte todos los operadores. Hay que renderizar.

### Las dos que mueven un grado

| Fila | Febrero | Mayo | Qué cambia |
|---|---|---|---|
| TAPSE, banda leve | `≤1.7 to ≥1.3` | `≤1.7 to >1.3` | **1,3 cm pasa a MODERADA** |
| Onda S′, banda leve | `≤9.5 to ≥7.2` | `≤9.5 to >7.2` | **7,2 cm/s pasa a MODERADA** |

⚠️ **CON ESO DESAPARECE EL SOLAPE**, y con él la marca `solapa` que las dos bandas declaraban: en
mayo el valor del borde pertenece a **UNA** sola banda. **El mecanismo que la lee se conserva en
`vdDisfGrado`** —es genérico, hoy ninguna banda la declara— y **no se deriva del operador**, porque
un `>=` con `x === v` describiría el mismo conjunto por coincidencia de la forma y no por una
regla, y la FEVD tiene un `>=` que no solapa. **El rango «leve-moderada» sigue saliendo** por el
otro camino: el TAPSE y la onda S′ cayendo en bandas distintas.

### Las que NO mueven nada

- **FEVD 3D:** febrero escribe la banda leve `≤45 to <39` y mayo `≤45 to >39`. Los dos dejan el
  **39 exacto** fuera de la leve y dentro de la moderada, así que **el grado no cambia** y el
  `op:'>'` de la tabla ya era el de mayo. Lo que se corrigió es la **cita del rótulo**.
- **Diámetro de la arteria pulmonar** y **tiempo de aceleración del TSVD:** esta app **no los
  gradúa** —el primero tiene una banda de plausibilidad y el segundo es un corte binario de la
  probabilidad de HTP, que esta orden congela—. Reportados sin cambio.

### Tres diferencias MÁS, declaradas y NO aplicadas

- **«RAV index (area-length method)»**, banda moderada: febrero `>39 to ≤44`, mayo `>38 to ≤44`
  —o sea que mayo **cierra** el hueco de 38-39 que el comentario de la tabla declaraba—. Esa fila
  **no la usa esta app**: no hay volumen de la AD.
- **«RV E/A ratio»**, valor normal: febrero `≥0.8 to <2.0`, mayo `≥0.8 to ≤2.1`.
- **«Deceleration time»**, banda severa: febrero `≤57`, mayo `<57`.
  Las dos últimas son de la **función diastólica del VD**, que esta tabla no implementa.

Y **dos de rótulo**: los índices de área telesistólica y telediastólica del VD pasan de `cm2` a
`cm2/m2` en el encabezado de la fila, que es la unidad que siempre tuvieron.

### El strain de pared libre, sin sexo

`VD_STRAIN_NORMAL = -20`, **un solo número para los dos sexos**: ni la Tabla 1 (folio 145) ni el
texto del folio 159 abren columnas de varón y de mujer. `_vdCalcular` **sigue LEYENDO el sexo** y
lo publica en la ficha —es un dato del estudio que el médico ve al lado del número—; lo que ya no
hace es elegir el corte, así que **siempre hay clasificación** (antes, sin sexo, devolvía `null`).

⚠️ **EL CORTE VA CON PALABRAS Y NUNCA CON EL OPERADOR SOLO.** «Normal si es más negativo que
−20 %» quiere decir que −25 es normal y −18 no; escrito «< −20» es correcto y **se lee al revés**.
Es la lección que la leyenda de `#ref-cardiotox` ya pagó.

⚠️ **`VD_STRAIN_NORMAL` es un `const` de MÓDULO y no una propiedad de `window`** —la trampa de
`ECO_AYUDA`— y `_vdCalcular` necesita los **dos contornos dibujados**, que un caso no puede trazar.
Por eso **TC-516 lo mide por COMPORTAMIENTO**: la fila de `ref-vd2` que deriva del corte, que
publica el **mismo** valor en las dos columnas de sexo.

### Lo que se tocó en Referencias (E2)

- `EV_GUIA_ASE2025VD` termina ahora en `, ASE, 2025 (versión corregida de mayo de 2025)`.
- **Trece fichas** re-fechadas con `EV_FECHA_AJ1` y **quince** `fuente_una_linea` pasadas a
  «ASE 2025 de **mayo** (Mukherjee)…».
- **Ficha NUEVA `FUN-VD-007`** (strain de pared libre, Tabla 1 folio 145 + texto folio 159), con su
  entrada en la bibliografía de `ref-vd2` y una fila que **deriva** de `VD_STRAIN_NORMAL`.

---

## 3 · La coartación reparada (E3)

**`coaSeguimiento()` ya no existe.** Publicaba «Seguimiento anual obligatorio» en la pantalla, el
informe, el EN SUMA y el PDF: una **conducta** en el papel firmado, que es lo que esta app no hace.
Lo que queda es el **hecho**: la situación (nativa / recoartación / post-stent / post-cirugía) y
los números.

La recomendación pasó al **bloque VISIBLE** de la Evidencia (`_indCoAo().bloques`), no a `notas`:

> **Clase I · Nivel B** — En la coartación nativa o reparada está recomendado el seguimiento de por
> vida, con imagen aórtica periódica por tomografía o resonancia **cada 3 a 5 años**, ajustada al
> estado clínico y a los hallazgos de imagen previos (**ESC 2024, Tabla 69, folio 121**).

⚠️ **`notas` SE PINTA DENTRO DEL «Ver detalle», QUE NACE PLEGADO** —la lección que el trabajo H
pagó mirando la captura—. Por eso va en `bloques`.

Con la coartación **ya tratada** (`post_stent`, `post_cirugia`, `recoartacion`) la línea agrega
«Este estudio consigna una coartación ya tratada, así que la recomendación aplica hoy»; con la
nativa no.

### La nota del operador en el globo ⓘ de la aorta

Cuarto `ev-cat` de `evTarjetaAo`. La guía escribe el corte de **dos maneras** y las dos están
impresas: el apartado **9.2.1.1 (folio 71)** con `>` estricto, y la **Figura 24 (folio 76)**
bracketeando su primera banda como **«40-44 mm»**, o sea inclusivo. **El corte NO se movió** —sigue
siendo el inclusivo, que es la decisión del trabajo H— y lo único que entra es decir cuál aplica la
app y por qué.

---

## 4 · El índice de dimensión aórtica (E4)

```
AO_IDA_MAX = 22            // mm/m2, operador ESTRICTO
aoIdaVal()      → aoDilMax() / getBSA(), o null sin superficie corporal
aoIdaDilatado() → x != null && x > AO_IDA_MAX
```

Fuente: ESC 2024 de aorta, apartado **9.2.1.1, folio 71** —el mismo párrafo del que salen los
cortes absolutos—: «diámetro indexado/ASC [índice de dimensión aórtica (iDA)] > 22 mm/m²».

`_indAo` abre con **`(max >= corte) || porIda`**, así que una aorta de 36 mm en una persona de
1,50 m —iDA 24— abre la sección que el corte absoluto dejaba cerrada.

⚠️ **SIN SUPERFICIE CORPORAL EL ÍNDICE ES `null` Y NO SE APLICA.** Un campo vacío es SIN DATO: no
se afirma nada. La **fila del iDA se dibuja igual** —con `ask`— para que su ausencia no se lea como
un valor normal.

⚠️ **`_indVAB` CONSERVA `aoDilatada()`, o sea SÓLO EL DIÁMETRO ABSOLUTO.** Son dos predicados y no
uno, a propósito: las filas de la Tabla 68 de la bicúspide están escritas sobre el **diámetro
absoluto**, y abrirlas por el índice publicaría recomendaciones cuya fuente no las condiciona así.
**Medido: con iDA 23 la sección de aorta abre y la de la bicúspide no.**

### El Ehlers-Danlos vascular en el EN SUMA

La rama `sin_umbral` del bloque de aortopatías gana su frase, **descriptiva y sin conducta**:
«Aorta de 48 mm en un paciente con síndrome de Ehlers-Danlos vascular.», y sin diámetro sólo el
síndrome. La guía **no publica un diámetro al que intervenir** en esta enfermedad, así que la frase
no puede llevar umbral.

---

## 5 · El corte alternativo de la IM secundaria (E5)

```
IMS_ALT_EROA = 30   // mm2 — ESC/EACTS 2025, Figura 10 (folio 4672) y §9.2.2 (folio 4675)
IMS_ALT_VOLR = 45   // ml  — ESC/EACTS 2025, §9.2.2 (folio 4675)
```

`imSecAltPintar()` escribe en `#im-sec-alt` **sólo** cuando el mecanismo es **secundario** y el
valor alcanza el corte, y **nombra la condición que la guía pone**: el ORE con **orificio
elíptico**, el volumen con **bajo flujo**.

⚠️ **NO CAMBIA EL GRADO, Y ESO ES TODO EL PUNTO.** Los cortes que gradúan siguen siendo los de
siempre (ACC/AHA 2020, que la app ya aplica): lo único que entra es una frase de **pantalla** que
dice si ESTE paciente alcanza el corte de la otra guía. **Medido: `im_grado` vale lo mismo en las
seis escenas**, con y sin frase.

⚠️ **NO SUBE AL INFORME NI AL EN SUMA.** Es una lectura metodológica, no un hallazgo.

⚠️ **EL SPAN NO VIAJA CON EL ESTUDIO**: su id lleva **guión MEDIO**, así que `_noEsDelEstudio` lo
deja afuera y el conteo de campos no se mueve por él.

Toma el **peor de los dos métodos**: se registra en el bloque de PISA y en el de continuidad, y se
pinta al final de `calcIM_ESC` **y en su salida temprana** —sin eso, la escena sin datos dejaba la
frase del paciente anterior—. `limpiarCampos` vacía el span y las dos variables.

---

## 6 · El flujo reverso de la aorta descendente (E6)

El selector **`ia_rev_dur`** es el que decide, y nace **vacío**:

| `ia_rev_dur` | Qué vota |
|---|---|
| `''` — sin consignar | **nada**: el VTI y la velocidad se muestran y NO votan, y las dos filas lo dicen |
| `ausente` · `breve` | **leve** (ausente o reverso protodiastólico breve) |
| `intermedio` | **moderada** |
| `holo` con VTI **> 15 cm** | **severa** |
| `holo` con VTI ≤ 15 o sin VTI | **moderada** |
| `holo` con velocidad telediastólica `>= 20 cm/s` | **severa** (el corte que ya existía) |

⚠️ **EL CORTE DE 25 cm DE ECOSMART SALIÓ.** Era un criterio propio sin fuente; el 15 cm sale de la
**Tabla 20-5** del libro *Ecocardiografía avanzada* (Moya Mur, cap. 20), declarado como libro de
texto y no como guía.

⚠️ **EL 15 EXACTO VA AL LADO CONSERVADOR: MODERADA.** La fuente escribe «VTI > 15 cm».

⚠️ **`IA_VMAX_TD_SEVERA` SIGUE EN 20 CON `>=`, Y LAS DOS FUENTES NO COINCIDEN.** La EACVI 2013 y la
Tabla 20-5 escriben `> 20`; la ESC/EACTS 2025 —más nueva y ya verificada en este repo— escribe
`≥ 20`, que es el operador que la app aplica. Mover un operador que esta orden no autoriza sería
cambiar contenido clínico: queda declarado.

⚠️ **LA VELOCIDAD TAMPOCO VOTA SIN LA DURACIÓN**, y eso es de la fuente: las dos celdas de la tabla
empiezan por «holodiastólico».

**Sin columna de Excel**: el campo viaja con el estudio y las 440 columnas no se mueven.

---

## 7 · Las fichas de Referencias (E7)

- **`AOR-004`** — definición de dilatación y el iDA, folios **71** y **76**,
  DOI `10.1093/eurheartj/ehae179`. Dos filas de `ref-ao2` **derivan** de `AO_DIL_MM` y `AO_IDA_MAX`.
- **`ref-ia`** — la fila de la duración y una nota con las **DOS** fuentes: EACVI 2013 Tabla 4
  folio 621 para la estructura y la velocidad, y Moya Mur Tabla 20-5 para el 15 cm, **rotulado
  «libro de texto; no figura en las guías de la biblioteca»**.
- **`ref-im`** — el corte alternativo con sus dos condiciones y sus folios (4672 y 4675), al lado
  de los cortes de la ACC/AHA 2020 que la app aplica.
- **`ref-eao`** — el gradiente medio aórtico gana su línea de fuente: **EAE/ASE 2009, Tabla 3,
  folio 10**, columna AHA/ACC, con la columna de la ESC al lado para que se vea la diferencia.
- El corte de **9 mmHg** de la válvula pulmonar **no se tocó** y sigue rotulado
  «Criterio de EcoSmart».

⚠️ **EL REPOSITORIO ES PÚBLICO**: ninguna ficha lleva nota interna, duda ni reserva. **TC-516 (h5)
lo barre.**

---

## 8 · Las trampas de esta tanda

1. **UN PAR BALANCEADO DE ACENTOS GRAVES EN EL CUERPO DE UN CASO LO CIERRA IGUAL** y
   `check_backticks.py` da «OK». Pasó **cuatro** veces —en la sonda y en tres adaptaciones— y lo
   dio `node --check`, apuntando a la apertura del template. **Correr los dos.**
2. **UN REGEX LITERAL DENTRO DEL CUERPO DE UN CASO SE COCINA**: `\s` llega al motor como la letra
   `s`. La condición (b1) contaba dos apariciones y devolvía cero sobre una fila perfecta. Se
   cuenta con `split`, que no se cocina.
3. **`/iDA/i` MATCHEA «tracto de saliDA» Y «meDIDA»**: la condición que exige que el Excel no gane
   una columna salía roja sobre 440 columnas intactas. La sigla va **case-sensitive** y acotada.
4. **`evRefPintar` TOMA EL id CORTO** (`'vd2'`), no `'ref-vd2'`: con el largo las fichas salían con
   **cero** caracteres y se leía como «la ficha no existe».
5. **EL CAMPO DE LA COARTACIÓN ES `coa_vmax`, NO `coa_gmax_vmax`**, y su checkbox está en
   `display:none`: el control real es el botón `[data-ete-chk="coart_incluir_chk"]`. Con los ids
   equivocados **la escena no producía el párrafo** y el caso informaba «no está el seguimiento»
   sobre un informe que no hablaba de la coartación. **Lo cazó el DENOMINADOR**, que es para lo que
   está — y la sonda, que no lo tenía, había dado por buena la misma escena vacía.
6. **LA FUNCIÓN ES `_indCoAo` Y LA FILA ES `ia-sev`**, no `_indCoa` ni `ia-severidad`: dos lecturas
   de la sonda informaron «SIN FN» y `null` sobre piezas que funcionan.
7. **`EV_GUIA_ESC2024AO` HAY QUE DECLARARLA ANTES DE USARLA**: la zona muerta de `const` aborta el
   `<script>` COMPLETO y el síntoma aparece en otra función.
8. **UNA FICHA VERIFICADA SIN DOI PONE TC-492 EN ROJO** —su condición (A8) exige tabla o figura,
   folio **y** DOI—. El DOI se lee en el pie de la hoja 2 del propio PDF.
9. **`{ v: { leve: null } }` EN EL ARNÉS DE TC-463 IGUAL CORRE**: el arnés itera
   `Object.keys(e.v)`, así que un `null` no saltea la escena. Se omite la clave.

---

## 9 · Cómo medir esta zona

- **Sonda:** `scripts/_probe_aj1.mjs`, A/B de solo lectura con `--file`, once grupos
  (`vd`, `strain`, `coa`, `ida`, `eds`, `ims`, `iao`, `refs`, `maq`, `captura`, `ctrl`).
- **Caso:** **TC-516**, **51 condiciones** con sus denominadores y sus controles negativos.
  **Verificado que sabe fallar contra el árbol de entrada (`acae27d`) en un worktree aparte: 34 de
  las 51 en rojo, y NINGUNA por excepción.**
- **Los bordes exactos que usa el caso, y por qué esos números:**
  - **iDA:** peso **54** y talla **150** dan una superficie corporal de Mosteller de **1,50
    exacta** (54 × 150 / 3600 = 2,25; su raíz es 1,5), así que `ao_tub` 31,5 / 33,0 / 34,5 da iDA
    **21 / 22 / 23** redondos —y los tres están por debajo del corte absoluto de los dos sexos, de
    modo que **lo único que puede abrir la sección es el índice**—.
  - **IM secundaria:** con Valiasing 50 cm/s y Vmax 5 m/s el ORE es `0,62832 × r²`, así que un
    radio de **6,80** da 29,1 · **6,91** da **30,0 exacto** · 7,00 da 30,8; con el ORE en 30,0 y un
    VTI de 150 cm el volumen da **45,0 exacto**.
- **Qué NO tiene cobertura automática:** el strain de pared libre **por su cálculo** —necesita los
  dos contornos dibujados a mano— y el PDF de la coartación, que la sonda sí genera de verdad.
