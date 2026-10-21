# La tanda «R» — referencias y fuentes (2026-10-20)

Ocho correcciones que Maicol decidió el 20-21/10/2026 después de que Cowork verificara las
fuentes, más la declaración honesta de lo que es **criterio propio de EcoSmart**. Lo que esta
tanda cambia es **qué dice la app sobre de dónde sale cada corte**, y en cuatro lugares **qué
corte aplica**. Las piezas van por nombre de función y de constante, no por número de línea.

> El censo completo de fuentes, con su tabla y su folio, está en `docs/fuentes/FUENTES.md` →
> «La tanda «R»». Acá va el mapa del código.

---

## 1 · R1 — la VAB muestra la lesión PRESENTE sin grado

**Dueño único: `aoLesionSinGrado(clave)`**, declarada al lado de `window.pillOn`. Replica las
**cinco** compuertas que el informe ya aplicaba —grado en el centinela, que no sea esclerosis,
sin `esqSevManual`, la pastilla prendida y el proveedor no `bloqueado()`— y devuelve `false`
desde un `try/catch`.

- `generarInforme` perdió sus **cuatro ayudantes locales** y hoy llama a esa función por
  `_aoSinGrado(k)`, con `typeof` para que un revert del dueño no se lleve el informe.
- `vabFuncionDerivada(src)` la consulta por `sinGr(k)`. ⚠️ **CON `src` DEVUELVE `false` SIEMPRE**:
  un estudio ARCHIVADO no tiene pastillas, así que preguntarle al DOM por el estado de otro
  paciente sería leer la pantalla en vez del registro.
- `vabResumenPintar` publica «Estenosis presente» / «Insuficiencia presente» / «Estenosis e
  insuficiencia presentes» — tres ramas y no una concatenación, para que con las dos no salga
  una enumeración con «y» armada a mano.

**Los dos rótulos**: `no_clasif` pasa de «No clasificable» a **«Fusión indeterminada»** en
`VAB_TIPO_TXT`, `VAB_TIPO_LBL_ES`, `VAB_INF_FENO`, `VAB_TIPOS_LBL`, `VAB_DIB_HIT` y la
`<option>`; y la cúspide pasa a **«no coronariana»**.

⚠️ **`VAB_TIPO_LBL` (el del EXCEL) NO SE TOCA**, y es lo que impide romper todo backup ya
exportado: para una columna de opción un valor desconocido descarta la **FILA ENTERA**. Lo que
sí entra es una entrada de ENTRADA en `LAB_XLS_VOCAB.vab_tipo` (`'fusion indeterminada'`), así
que el importador entiende las **dos** formas.

---

## 2 · R2 — TEER: la profundidad de coaptación pasa a `<11 mm`

El corte estaba en `<10` y la fuente dice otra cosa: **Tamburino 2010, Tabla 1, folio 1386**,
que **excluye `≥11 mm`**. Cambian **dos** lugares y tienen que cambiar los dos:

| pieza | qué publica |
|---|---|
| `c4` de `calcTEER` | la fila «Profundidad de coaptación <11 mm» del cuadro |
| `_LAB_TEER_CRIT` | la hoja del PDF, con `ok: v => v < 11` |

Con uno solo, el papel firmado y la pantalla gradúan distinto el mismo número.

**Los otros dos rótulos**: la PSAP pasa a **`≤70 mmHg`** y el DSFVI a **`≤70 mm`
telesistólico** —ESC/EACTS 2025 de valvulopatías, Tabla 7, folio 4678—, con el adjetivo
«telesistólico» que faltaba.

**El pie de fuentes** es marcado ESTÁTICO debajo de la caja: nombra las tres fuentes por tabla
y folio y lleva el chip «CRITERIO DE ECOSMART» para el 20-50 % de FEVI, que sale de COAPT y no
de una guía. ⚠️ **USA `--text2` Y `--border`, LAS DOS GLOBALES**: `--amber` sólo existe dentro
de `.amilo-root` y acá se vería **gris**, el defecto que este repo ya pagó cinco veces.

---

## 3 · R3 — el informe dice la SEVERIDAD de la disfunción sistólica del VD

**Dueño único: `vdDisfGrado(tapse, sprime)`**, que sondea `ASE25_T1` con `bandasDe` y devuelve
`null`, un grado, o **un rango con guión** («leve-moderada») cuando los dos parámetros caen en
bandas distintas.

⚠️ **DOS FILAS DE LA TABLA 1 GANARON `solapa: true`**, y es de la fuente: el TAPSE escribe su
banda leve «≤1.7 to ≥1.3» y la moderada «≤1.3 to >1.0», así que **1,3 cm está en las dos**
(y 7,2 cm/s igual para la onda S′). `bandasDe` agrega la banda siguiente cuando `solapa` y el
valor es exactamente el borde, y la app publica el rango.

⚠️ **UN SOLO PARÁMETRO NORMAL DEVUELVE `null`**: con el TAPSE conservado no se puede afirmar un
grado de disfunción global, así que la oración sale como hasta hoy, sin adjetivo.

`_vdDisfTxt` es el único texto, y lo consumen `funcTxt` del informe y las **ocho** ramas del
EN SUMA.

---

## 4 · R4 — el área de la AI pasa a CUATRO grados

**`AI_AREA_BANDAS`** (Lang 2005, Tabla 9: ≤20 / >20-30 / >30-40 / >40 cm², iguales en los dos
sexos), con `aiAreaClasificar`, `aiAreaRotulo` y `aiAreaDilatada` derivados.

⚠️ **EL BLOQUE VA DESPUÉS DE `AI_VOL_BANDAS`, DE DONDE DERIVA SUS ADJETIVOS, Y ESO NO ES
ESTÉTICA.** Declarado 35 líneas antes, un `const` que nombra otro `const` del mismo bloque
**aborta el `<script>` ENTERO** por zona muerta: el síntoma fue `showTab('ai-vi')` tirando
`Cannot access '_lv3d' before initialization` y la pestaña AI/VI sin abrir, con Semgrep en
127 / 0 ERROR al lado. Lo destapó la sonda, no la lectura.

**Quién manda, en orden:** el **volumen indexado** primero (esa rama no se tocó), después el
**área**, y el **diámetro AP** sigue siendo binario porque ninguna guía lo gradúa.

⚠️ **EL EN SUMA TUVO QUE SEGUIR AL INFORME, Y EN LA PRIMERA VERSIÓN NO LO HACÍA.** La línea
`suma.push('AI dilatada (…)')` no consultaba `_aiAreaB`, así que el informe decía «levemente
dilatada» y el resumen del mismo papel decía «dilatada» pelado. **Lo destapó la SUITE COMPLETA**
—TC-487 (6)— y no la medición de zona, porque mis escenas del R4 leían el informe y no el
resumen. Hoy el adjetivo sale del MISMO `_aiAreaB` que arma `aiStr`.

La invitación a completar el volumen se acotó a `aiDilGeo && !_aiAreaB`: con el área cargada
decía «el grado de dilatación auricular no se informa», que desde el R4 es **falso**.

---

## 5 · R5 — el derrame pericárdico pasa a los TRES grados de la ESC 2025

**`DPT_TAM`** congelado: severo `>20 mm`, moderado `10-20`, leve `<10`. Se va el grado
**«mínimo»**, que ninguna guía publica, y el leve pierde su piso de 5.

⚠️ **LAS DOS OPCIONES VIEJAS SE QUEDAN COMO `<option hidden>`**, el patrón de `et_grado`: el
`value` de este selector **ES su texto** y es lo que viaja en `campos`, así que sin ellas cada
estudio guardado con «Derrame mínimo» o «Derrame leve (5-10mm)» reabriría con el `<select>` en
`selectedIndex -1`. **No se migra nada**: abren como se guardaron, el Excel conserva su token y
lo que se MUESTRA lo traduce `DPT_TAM`.

⚠️ **Y LA OPCIÓN NUEVA TUVO QUE ENTRAR EN `LAB_XLS_LISTAS.pericardio`.** Lo cazó el assert de
arranque del Excel **dos commits después**: sin ella, reimportar un backup de cualquier estudio
nuevo con derrame leve habría descartado la **fila entera**.

---

## 6 · R6 — el taponamiento DEJA DE CONCLUIR

Decisión de Maicol. El módulo **lista los signos presentes** y dice cuántos criterios evaluó;
el diagnóstico lo hace el médico. Fuente: **ESC 2025 de miocarditis y pericarditis, Tabla 17**,
que lo define como clínico con confirmación ecocardiográfica.

| antes | hoy |
|---|---|
| `dptEstado().clave` ∈ {`taponamiento`, `incipiente`, …} | `con_derrame` / `sin_derrame` |
| seis ramas de conclusión + «No se evaluó» | una oración con `_dptSignosTxt` |
| `DPT_BADGE` por conclusión | `dptBadge(st)` por signos y criterios evaluados |
| rótulos de conclusión en `coh-dpt-con` | `con_derrame` / `sin_derrame` |

Los consumidores quedaron alineados **por construcción**, porque los tres leen el mismo dueño:
la pregunta del POP, el POCUS, el filtro de cohorte y la hoja del PDF (`## Descripción`).

⚠️ **EL COMPROMISO HEMODINÁMICO NO SE DEDUCE: SE CONSIGNA.** La pregunta del POP pasa a leer
`pericardio_hemo`, que es el campo de tres estados de la pestaña Otros — porque «sin compromiso»
es una **afirmación** y una casilla desmarcada no distingue «lo busqué y no está» de «no lo
busqué».

El pie declara con su chip que los tres cortes de la app son el **límite inferior** de los
rangos que publica la Tabla 17, o sea que la app marca **antes** que la guía.

---

## 7 · R7 — el VD/VI del eco en TEP pasa a `≥1,0`

**`TEP_VDVI_DILAT_MIN = 1.0`**, con sus **cuatro** consumidores leyéndola y sus rótulos
derivados: `calcTEP`, el score del informe, el POCUS y la pregunta del POP. Antes el número
estaba escrito a mano en cada uno.

Y las **dos fórmulas de hipertensión pulmonar** de Referencias pasan a decir lo que la app
aplica: el cociente TAPSE/PSAP con `≥0.55` **y su signo de HTP si `<0,55`** (ESC/ERS 2022,
Tabla 10) y la relación VD/VI con `≤1.0` y el `>1,0` que la app marca.

---

## 8 · R8 — Referencias: el DOI, las citas, los textos y los criterios declarados

- **`EV_DOI_ESC2021IC`**, el DOI que faltaba.
- **`ET_CRIT_FUENTE`** pasa a nombrar las **tres** guías con su tabla y su folio
  (EAE/ASE 2009 Tabla 10 folio 19 · ASE 2023 Key Points folio 16 · ESC/EACTS 2025 §12
  folios 4687-4688). **Ningún corte ni operador se movió**: lo único que cambia es que la línea
  diga DÓNDE está cada uno.
- La regla de la **prótesis mitral** entra en `#ref-integracion`.
- El **ancho del jet de la IP** pasa a nombrar el **anillo pulmonar** y no el TSVD.
- La **escala de burbujas** gana su tabla de cuatro grados con su bloque de fuentes.

**El marcador de criterio propio: `QV_ECOSMART`**, un prefijo único, y el chip «CRITERIO DE
ECOSMART» en los **tres** lugares donde la app aplica un corte que ninguna fuente publica: el
20-50 % de FEVI del TEER, los tres cortes del taponamiento y el 5 de la escala de burbujas.

⚠️ **`QV_NOTA['esten:pulmonar']` TUVO QUE SER UNA FUNCIÓN**, y por la misma razón que el R4:
nombra `EP_GMAX_NORMAL_MAX`, que se declara **1700 líneas más abajo**. Como valor, el `const` de
módulo lanzaba en la evaluación del `<script>` y el síntoma apareció en
`_labXlsAssertBloques` (`Cannot access 'LAB_XLS_BLOQUES'`), que es otra función. Su consumidor
la resuelve con `(typeof n === 'function') ? n() : n`.

---

## Cómo medir esta zona

**Arnés: `scripts/_probe_r.mjs`** (CDP, teclas y clics reales, A/B de solo lectura con
`--file`), con **doce** grupos:

```
vab  teer  vd  ai  peri  tapo  tep  xlsassert  refs  maqueta  captura  ctrl
```

**Cobertura: TC-507**, con 81 condiciones. **Verificado que sabe fallar contra el inicio de la
tanda en un worktree aparte: 57 en rojo y ninguna por excepción.**

### Siete trampas, y seis daban mediciones falsas y plausibles

1. **LAS TRES ZONAS NUEVAS VIVEN EN TRES PESTAÑAS DISTINTAS, y eso lo destapó medir.** El
   `<select id="pericardio">` está en **`tab-otros`** aunque su sección se llame
   `ete-seccion-pericardio-masas`; el módulo del taponamiento en **`tab-hemodinamica`** y detrás
   de **una segunda puerta** (`ete-seccion-derrame-tap`); el pie del TEER en `tab-ete`. Abrir una
   sola pestaña dejó las otras dos midiendo **0×0** con el marcado perfecto.
2. **LA PESTAÑA SE LLAMA `refs` Y NO `referencias`, Y `refSubTab` EXIGE SU SEGUNDO ARGUMENTO**:
   sin el botón lanza al tocarle el `classList`, y esa excepción se tragaba el resto del
   abridor. Las dos cosas juntas dejaban la ficha de burbujas en 0×0.
3. **EL `value` DEL SELECTOR DE PERICARDIO ES SU TEXTO COMPLETO, PARÉNTESIS INCLUIDO.**
   Mandarle `'Derrame moderado'` lo deja en `selectedIndex -1` y la escena mide el selector
   **vacío**. **Lo destapó MIRAR el PNG**, que decía «SIN DERRAME» con la geometría perfecta al
   lado: la medición numérica lo había dado por bueno.
4. **UN CHIP SE BUSCA POR SU PESTAÑA CONTENEDORA Y NO POR SU ÍNDICE EN EL DOCUMENTO**: los tres
   existen siempre y el orden del DOM no es el de las pestañas, así que `hits[0]` devolvía el del
   taponamiento —que vive en otra pestaña y mide 0×0— cuando lo que se medía era el de burbujas.
5. **SE RECORTA EL CONTENEDOR Y NO EL SPAN.** Un `clip` de 276×16 dio un PNG de **230 bytes**
   que, como archivo, se ve perfectamente bien — y está en blanco.
6. **EL TEMA HAY QUE EXIGIRLO, NO PEDIRLO**: `__P.tema(claro)` devuelve `{ claro: <quedó?> }` y
   hay que comparar contra ESE booleano.
7. ⚠️ **ME COMÍ EL ACENTO GRAVE NUEVE VECES**, todas en comentarios míos dentro del cuerpo de un
   caso o del template de la sonda. `scripts/check_backticks.py` dio la línea exacta **salvo las
   del template de la sonda**, que ese script no alcanza: ésas las dio `node --check`.
   **Correr los dos.**

### Lo medido al cierre

- **Maqueta**: 4 anchos × 2 temas, **8 de 8 celdas sin scroll horizontal de la página**, con el
  pie del TEER reflowando de 952×33 a 272×111 y el selector del derrame de 978×29 a 298×29.
  Los colores resuelven **reales y distintos** en los dos temas —`rgb(232,236,244)` de noche y
  `rgb(26,34,51)` de día para `--text`, `rgb(154,163,188)` y `rgb(91,100,120)` para `--text2`—.
- **Captura**: **10 PNG con los 10 `md5` distintos**, y **tres miradas**: el TEER con su corte
  nuevo dando «✕ 11mm ≥11mm — anatomía compleja, Heart Team», el taponamiento publicando
  «2 SIGNOS PRESENTES · 1 de 3 criterios evaluados» **sin concluir**, y la ficha de burbujas con
  sus cuatro grados, su bloque de fuentes y su chip.
- **A/B de control contra el inicio de la tanda: CERO diferencias** con el formulario vacío y con
  un escenario AJENO, en el **PDF generado de verdad en sus SEIS plantillas**, el PPT (21
  textos), el PDF de auditoría (104), el Laboratorio por sus funciones dueñas, el **Excel en 440
  columnas clave por clave**, los 1031 campos del estudio, las 295 referencias de pantalla, el
  almacenamiento y las pastillas.

---

## Lo que la tanda «R2» corrigió de esta tanda (21/10/2026)

Dos cosas del R se midieron en Safari y fallaban:

- **El derrame pericárdico** dejaba las dos opciones viejas como `<option hidden>`, y eso **no las
  esconde**: WebKit las pinta en la lista nativa y en los dos motores la búsqueda por letra las
  alcanza. Hoy no están en el marcado y el token viejo se traduce en tres bordes.
- **La sección VAB** no se repintaba con el gesto de la pastilla aórtica, porque ese gesto no pasa
  por ningún `input` ni `change` de la sección.

Lo demás de esta tanda no se tocó. **Dónde está:** `docs/mapa/tanda-r2-correcciones.md`.
