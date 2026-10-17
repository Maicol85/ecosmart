# Mapa — PRÓTESIS: los tres cortes de la tanda «PRO» (2026-10-17)

Mapa de los **commits 1 a 3** de la tanda PRO, que alinea tres cortes de prótesis a lo que dicen
las guías: el cociente VTI de la prótesis mitral, los dos bordes de la insuficiencia aórtica
protésica y el reverso diastólico de la TAVI. **No hay números de línea a propósito**: la línea
cambia en cada edición, el nombre de la función no.

Lo que este mapa NO cubre: el resto de la lógica protésica —`docs/mapa/protesis-valvular.md`, con
las tandas Z, Z5 y Z6 en `docs/mapa/protesis-z-z5-z6.md` (partición del 17/10) y la fuga
paravalvular de la prótesis quirúrgica en `docs/mapa/protesis-fuga-pvl.md`—, los
cortes nativos —`docs/mapa/valvulas.md`, `docs/mapa/aortica-cortes.md` y
`docs/mapa/valvulas-constantes.md`— y los cambios nativos del 2026-10-17, que están en
`docs/mapa/valvulas-val.md`.

⚠️ **Los commits 4, 5 y 6 de esa orden NO se hicieron y están declarados** en
`docs/PENDIENTES.md` → PRO-1 a PRO-4: la fuga paravalvular de la prótesis quirúrgica, la
graduación de las prótesis tricúspide y pulmonar, y su cobertura. Las tablas de las guías que esos
commits necesitan **ya están verificadas y transcritas** en `docs/fuentes/FUENTES-protesis.md`.

---

## 1 · La regla que gobierna la tanda, y las dos reglas de folio

Criterio general: en prótesis la app sigue **la guía más nueva que traiga el dato**; si no lo trae,
la anterior. Ante un borde ambiguo, la lectura **conservadora**, aplicada y declarada.

| Documento | Regla de folio | Comprobada en |
|---|---|---|
| **ASE 2024** (Zoghbi, JASE 2024;37(1):2-63) | folio = **hoja + 1** | el pie impreso de las hojas 22, 26, 32 y 38 (→ 23, 27, 33 y 39) |
| **VARC-3 2021** (Généreux, Eur Heart J 2021;42(19):1825-1857) | folio = **hoja + 1824** | el pie impreso de las hojas 22 y 23 (→ 1846 y 1847) |

⚠️ **EL TEXTO EXTRAÍDO DE LA ASE 2024 CODIFICA `≥` COMO `$` Y `≤` COMO `#`.** Quien la lea sin
saberlo invierte **todos** los operadores. Es la misma trampa que la ASE 2023 ya tiene escrita en
`docs/fuentes/FUENTES.md`. Las seis tablas de esta zona se leyeron con ese reemplazo hecho; **no
hizo falta renderizar ninguna**, a diferencia de la ASE 2023.

---

## 2 · PRO1 — el cociente VTI de la prótesis mitral

**Dueño del régimen: `_ratioReg`**, una IIFE dentro de `calcIM_ESC` que devuelve uno de cuatro
valores. **Dueño de los dos predicados: `vmProtEOA`**, al que `_ratioReg` le pregunta.

| `_ratioReg` | cuándo | qué publica la fila `#im-vti-ratio` |
|---|---|---|
| `nativa` | `_imVmProt()` falso | el valor y, con `> 1,4`, «(>1,4 — apoya IM severa)» |
| `bio` | prótesis **no** mecánica, o sin dueño, o excepción | **`—`**, la fila no se publica |
| `mec_normal` | mecánica **y** `R.porThp === 'normal'` | el valor y, con `≥ 2,5`, «(≥2,5 — apoya IM severa)» |
| `mec_otro` | mecánica con THP ≥ 130 ms, sin THP o fuera de banda | el valor **pelado** |

**La fuente, vista en el PDF original: ASE 2024, Tabla 12, folio 28, hoja 27.** Su **título** es la
condición entera: «Transthoracic echocardiographic findings suggestive of significant prosthetic MR
**in mechanical valves with normal PHT**», y su fila publica `VTI_PrMV/VTI_LVOT ≥ 2,5`
(sensibilidad 89 %, especificidad 91 %).

⚠️ **«THP NORMAL» ES `< 130 ms` Y ES EL MISMO NÚMERO EN LA GUÍA Y EN LA APP.** La Tabla 12 no lo
define; lo define la **Tabla 11, folio 27, hoja 26**, cuya columna «Normal» del THP es `<130`. La
app ya lo tenía en `VM_PROT_T11.thpNormalMax`, con su banda de plausibilidad, y **esta tanda no
declaró un segundo corte**: `_ratioReg` lee `R.porThp`, que es la categoría que ese dueño publica.
Un THP **fuera de banda** da `porThp = null`, o sea `mec_otro`, que es el lado que no afirma.

⚠️ **FALLA HACIA `bio`, o sea hacia NO PUBLICAR EL APOYO.** Sin el dueño, sin morfología legible o
con una excepción, la app no afirma: el valor sigue en pantalla en sus dos insumos. Es la misma
dirección que eligió `emContMotivoNoVota`.

⚠️ **`typeof` Y NO LLAMADA PELADA, al contrario de `_emRegurgGrado` dos líneas abajo.** `calcIM_ESC`
vive en el bloque `<script>` que abre en la 38421 y `vmProtEOA` en el que abre en la 52668: son
**bloques distintos**, así que acá el `typeof` cubre un caso real. (Los números de bloque son del
commit de esta tanda y pueden moverse; lo que no se mueve es que son dos bloques.)

⚠️ **EL COCIENTE NO VOTABA NI VOTA, y está medido por los dos lados**: no entra en `scores` ni en
`params` de `calcIM_ESC`, así que `im_grado` sale idéntico con un cociente de 3,00 y con uno de
1,00 sobre la misma escena. Lo fija TC-496 (b7).

⚠️ **LA REGLA DE «DOS O MÁS DE CUATRO» DE LA PROTESIS MITRAL NO SE TOCÓ**, que es la única
excepción que la orden protegía: `R.obstr`, `R.obstrPos` y `R.obstrMed` salen idénticos. TC-496 (b8).

### Un consumidor nuevo sin su disparador

⚠️ **LO CAZÓ LA SONDA Y NO LA LECTURA.** Desde que la fila mira el THP, el THP es **insumo de
`calcIM_ESC`**, y ninguna de sus dos puertas lo llamaba: `thpEditado` hacía `thpSync` + `calcTHP` y
nada más. Medido antes de cerrarlo: tipeando VTI mitral, VTI del TSVI y **después** el THP en
100 ms, la fila publicaba el número **pelado** —el régimen que corresponde al THP vacío— sobre una
mecánica con THP normal, o sea **el apoyo desaparecía en la única escena para la que existe**.

Se cierra en **`thpEditado`**, que es el dueño del gesto y lo comparten las dos puertas del dato
(`#thp` y `#em_thp_display`), así que una puerta nueva lo hereda. **No hay recursión**: `calcIM_ESC`
no llama a `calcTHP` ni a `thpEditado` —censado, cero apariciones en su cuerpo— y lo que lee del THP
lo lee por `nv('thp')` a través de `vmProtEOA`, que tampoco los llama. Lo fija TC-496 (b9), que mide
el **fuente** de `thpEditado`.

### Las tres superficies de texto que siguieron al predicado

1. el **rótulo** de la fila: «(nativa >1.4 · **prótesis mecánica con THP normal** ≥2.5)»;
2. la **tarjeta ⓘ** `im-vti-ratio`, en su `lee` y en su `ojo`;
3. la frase de **«Referencia clínica»**, que decía «EcoSmart no verifica ninguna de las dos» y hoy
   afirma lo contrario con la fecha.

⚠️ **LA TERCERA ERA LA MÁS CARA DE DEJAR.** Una nota que declara como pendiente algo que ya se
cerró es peor que ninguna: manda al médico a desconfiar de un número correcto. TC-496 (b10) lo exige
**por los dos lados**: que el rótulo nuevo esté y que la frase vieja **no**.

### Escenas que cambian (A/B con teclas reales, VTI mitral 60 / VTI TSVI 20 → 3,00)

| escena | antes | ahora |
|---|---|---|
| mecánica, THP 100 ms | apoya | **igual** |
| mecánica, THP 129 ms | apoya | **igual** — el borde separa |
| mecánica, THP 130 ms | apoya | **pelado** |
| mecánica, THP 250 ms | apoya | **pelado** |
| mecánica, sin THP | apoya | **pelado** |
| biológica, los tres estados | apoya | **`—`** |
| nativa | «>1,4 — apoya» | **igual** |
| cociente 2,49 / 2,50, mecánica con THP normal | — | el borde del corte separa |

---

## 3 · PRO2 — la insuficiencia aórtica protésica

**Dueño del régimen: `_iaProt`**, una IIFE dentro de `calcIA_ESC` que llama a `_eaEsProtesisAo()`
**una sola vez** para las dos decisiones. Falla hacia **nativa**, que es el régimen que la app
aplicaba hasta esta tanda.

**La fuente, vista en el PDF original: ASE 2024, Tabla 8 «Parameters for evaluation of the severity
of prosthetic aortic valve regurgitation», folio 23, hoja 22.**

| parámetro | Mild | Moderate | Severe |
|---|---|---|---|
| **jet width, % LVOT diameter** | Narrow (**≤25 %**) | 26 %-64 % | ≥65 % |
| VC width, cm | <0,3 | 0,3-0,6 | >0,6 |
| VC area, cm² | <0,10 | 0,10-0,29 | ≥0,30 |
| Circumferential extent of PVL, % | <10 | 10-29 | ≥30 |
| PHT, ms | Slow (>500) | Variable (200-500) | Steep (<200) |
| Diastolic flow reversal descending aorta | Absent or brief early | Intermediate | Prominent, holodiastolic |
| Regurgitant volume, mL/beat | <30 | 30-59 | ≥60 |
| **Regurgitant fraction, %** | <30 | **30-50** | **≥50** |

**Cambian DOS valores exactos y nada más:** el **25,0 %** del jet, que pasa de moderada a **leve**,
y el **50 %** de la fracción regurgitante, que pasa de moderada a **severa**. Los otros cuatro
parámetros coinciden número por número con los nativos que la app ya aplicaba.

⚠️ **EL 50 % ES UN BORDE AMBIGUO DE LA PROPIA TABLA 8** —escribe moderada «30-50» y severa «≥50», o
sea que el 50 está en las **dos** columnas— **y lo desambigua la VARC-3**, Tabla 16, folio 1846: sus
cinco clases son «40 to <50» y «≥50», **sin solape**. La lectura conservadora es además la que la
otra guía escribe explícito.

⚠️ **EN LA VÁLVULA NATIVA EL 50 SIGUE SIENDO MODERADA**, y eso es el VAL3 del mismo día
(`docs/mapa/valvulas-val.md`), que aplica la **ESC/EACTS 2025, Figura 4, folio 4659**: «RF >50%
(echo)». Son dos documentos y dos regímenes, y el mismo número cae de distinto lado en cada uno.

⚠️ **EL HUECO DE LA TABLA 8 (25,1 a 25,9 %) SE RESUELVE POR COMPLEMENTO, HACIA MODERADA.** La tabla
escribe «≤25» y «26-64», así que ese tramo no cae en ninguna columna; dejarlo en moderada es lo
único que no deja un valor sin leer y es el lado que no suaviza.

⚠️ **ALCANZA A LAS TRES PROTESIS AÓRTICAS, LA TAVI INCLUIDA, y es de la fuente**: el título de la
Tabla 8 dice «prosthetic aortic valve» sin abrir ramas por tipo, y la TAVI corre **exactamente**
esta cascada —`calcIA_ESC` no la distingue—. Acotarlo a la SAVR habría dejado a la TAVI con los
cortes nativos sobre una tabla que la cubre. Medido en las tres.

**La tabla de «Referencia clínica» de la IAo gana una nota al pie** con los dos cortes protésicos y
su folio. Va al **pie** y no dentro de las dos celdas porque son **dos filas distintas**: repartida,
cada celda quedaría con dos números y dejaría de leerse como un corte. Es la misma solución que el
bloque de salvedades de la IM.

### Escenas que cambian: SEIS de 24

Calibración: **Ø TSVI 20 mm**; Ø del jet 4,8 / 5,0 / 5,2 mm → 24,0 / 25,0 / 26,0 %. Para la FR,
**PISA r 5 mm / Valiasing 40 cm/s / Vmax CW 4 m/s → EROA 15,7 mm²**, y con VTI del TSVI 20 cm el
VSV es 62,83 ml: el **VTI del jet** en 197 / 200 / 204 cm da FR 49 / 50 / 51 %.

| escena | antes | ahora |
|---|---|---|
| jet 25,0 % · biológica, mecánica y TAVI | Moderada / grado 2 | **Leve / grado 1** |
| FR 50 % · biológica, mecánica y TAVI | Moderada / grado 2 | **Severa / grado 4** |
| jet 25,0 % · **nativa** | Moderada | **igual** |
| FR 50 % · **nativa** | Moderada | **igual** |
| jet 24 y 26 %, FR 49 y 51 %, en las cuatro morfologías | — | **idénticos** |

El **informe y el EN SUMA** siguen al grado en los tres estilos y en las tres prótesis («con
insuficiencia leve» / «IAo leve.»; «insuficiencia severa» / «IAo severa.»), y la **pastilla**
también.

---

## 4 · PRO3 — el reverso diastólico de la TAVI

**Dueño: `eteTaviRPV()`**, el motor de la fuga paravalvular, con dos constantes locales nuevas:
`TAVI_REV_SEV_MIN = 30` y `TAVI_REV_MOD_MIN = 20` (cm/s).

**La fuente, vista en el PDF original: VARC-3 2021, Tabla 16, folio 1846, hoja 22**, fila «Diastolic
flow reversal in proximal descending aorta (PW Doppler)»:

| clase (de cinco) | celda |
|---|---|
| None/Trace | Absent |
| Mild | Absent or brief early diastolic |
| Mild-moderate | Intermediate |
| Moderate | Intermediate |
| **Moderate-severe** | **Holodiastolic (end-diastolic velocity 20 to <30 cm/s)** |
| **Severe** | **Holodiastolic (end-diastolic velocity ≥30 cm/s)** |

La **misma tabla** publica su equivalencia de cinco clases a tres —tiene las dos filas de
encabezado, «Three-class grading scheme» y «Five-class grading scheme»—, que es la que Maicol fijó:
leve = leve y leve-moderada · moderada = moderada y **moderada-severa** · severa = severa. Así que
la banda de 20 a <30 cae en **moderada** y la de ≥30 en **severa**.

⚠️ **LA ASE 2024 NO DA CIFRA PARA ESTE PARÁMETRO, y se verificó antes de elegir la fuente**: su
Tabla 8 escribe «Absent or brief early diastolic | Intermediate | Prominent, holodiastolic», sin un
solo número. Por eso manda la VARC-3 aunque sea anterior: la regla de la casa es «la más nueva **que
traiga el dato**».

⚠️ **LA VARC-3 EXIGE QUE EL FLUJO SEA HOLODIASTÓLICO EN LAS DOS BANDAS** —las dos celdas empiezan
con la palabra «Holodiastolic»— así que la compuerta `flujo === 'holo'` se **conserva tal cual**. Con
el flujo en «proto» o «ausente» el parámetro no vota, igual que hasta hoy.

⚠️ **SIGUE SIENDO UN PARÁMETRO MÁS DE LA INTEGRACIÓN y no una regla aparte**: se empuja a `sev` o a
`mod` como cualquier otro y manda el peor presente. Medido: con el reverso en 25 cm/s (moderada) y
una extensión circunferencial trivial del 5 %, el veredicto es **moderada** y no «trivial».

**El TEXTO del motivo no cambia con el nivel**: describe la MEDICIÓN —«flujo holodiastólico con
velocidad tele-diastólica N cm/s»— y el nivel ya lo publica el veredicto. Dos redacciones para el
mismo hallazgo serían dos frases que hay que mantener sincronizadas.

⚠️ **EL LITERAL 20 DE `calcIA_ESC` (`IA_VMAX_TD_SEVERA`) NO SE TOCÓ, y la orden lo prohibía.** Ahí el
territorio es la aorta **descendente** de una nativa o de una SAVR y la fuente es la **ESC/EACTS
2025, Figura 4, folio 4659** («EDV ≥20 cm/s» dentro del recuadro de severa). **Desde esta tanda los
dos números ya no coinciden**, que es exactamente lo que el comentario de esa constante pedía no
dejar atrás: quedó al día y declarado en `docs/PENDIENTES.md` → PRO-5.

### Escenas que cambian: TRES de 14

| escena | antes | ahora |
|---|---|---|
| holodiastólico, 20 cm/s | Severa | **Moderada** |
| holodiastólico, 29 cm/s | Severa | **Moderada** |
| holodiastólico 25 cm/s + extensión 5 % | Severa | **Moderada** |
| holodiastólico, 19 cm/s | no vota | **igual** |
| holodiastólico, 30 y 45 cm/s | Severa | **igual** — el borde separa |
| proto-diastólico y ausente, 45 cm/s | no vota / negativa | **iguales** |
| extensión 35 y 15 %, VC 0,7 cm, área de VC 0,35 cm², THP 150 ms | — | **idénticos** |

---

## 5 · Las trampas medidas en esta tanda

1. **EL VTI MITRAL DE 100 cm CAE FUERA DE SU BANDA (`vtim: [2,80]`)** y las ocho primeras escenas de
   la sonda informaron «VTI de entrada fuera de rango — verificar»: un denominador vacío con pinta
   de «la regla nueva no funciona». Se mide con **60 cm**.
2. **`im_itv_tsvi` E `im_dtsvi` NO SON CAMPOS TIPEABLES**: llevan `style="display:none"` **en línea**
   y `tabindex="-1"`, y el abridor genérico de la sonda abre los **ancestros**, no el campo. La
   puerta visible es **`em_vtitsvi`**, que es además la que el médico usa.
3. **`#ete_tavi_vel_tele` VIVE EN UN ENVOLTORIO QUE NACE EN `display:none`** (`#ete-tavi-veltele-wrap`)
   y lo **enciende `eteTaviSync` cuando el flujo reverso es «holo»**: sin fijar el `<select>` primero,
   el campo existe y mide 0×0. La sonda abortó nombrándolo, que es lo correcto; para las escenas de
   «proto» y «ausente» la velocidad se carga **con el flujo en holo** y después se cambia el select,
   que es el gesto real del médico que corrige la lectura del Doppler.
4. **EL `\s` DENTRO DEL TEMPLATE DE UNA SONDA SE COCINA A LA LETRA `s`**, otra vez: el rótulo de la
   fila salió «próte i ≥2.5» —sin las eses— y aun así la comparación informó una diferencia de dos
   caracteres, o sea un falso plausible. Va con **doble barra en el archivo**.
5. **EL `innerHTML` DE `documentElement` DEVUELVE EL TEXTO DECODIFICADO, no el fuente**: una
   condición que buscaba la entidad `&aacute;` salía roja sobre una nota perfecta.
6. **`IA_VMAX_TD_SEVERA` ES UN `const` DE MÓDULO Y NO UNA PROPIEDAD DE `window`** —la trampa que
   `ECO_AYUDA` y `AO_SEGS` ya tienen escrita—: preguntar por el nombre informa «NO EXISTE» sobre una
   constante perfecta. Se mide el **comportamiento** por sus dos lados, que es además lo que de
   verdad hay que proteger.
7. **`ea_grado` GUARDA UN TOKEN DE TEXTO (`severa`) y no el 0-4 de las insuficiencias**: la primera
   versión del control negativo mayor comparaba contra `'4'` y salía roja sobre un grado perfecto.
8. **ME COMÍ EL ACENTO GRAVE UNA VEZ**, en un comentario mío dentro del cuerpo de TC-496, con el
   archivo que documenta la trampa abierto delante. `scripts/check_backticks.py` dio la línea exacta
   (74255) mientras `node --check` apuntaba a la apertura del template, 169 líneas antes.
9. **ESCRIBÍ «27 condiciones» ANTES DE CONTARLAS Y SON 33.** Lo cazó contar los `ex.push` del propio
   caso. **Contar y después escribir**, igual que medir y después escribir.

---

## 6 · Cobertura

**TC-496**, **33 condiciones** —contadas sobre el propio caso— con **cuatro denominadores** y **cinco
controles negativos**. **Verificado que sabe fallar contra el inicio de la tanda en un worktree
aparte: 11 de las 33 en rojo, y NINGUNA por excepción.** Las 22 que pasan son lo que esta tanda no
mueve: los denominadores, los controles negativos de la válvula nativa, los bordes vecinos de los
dos cortes, los otros cuatro parámetros de la fuga de la TAVI, las 440 columnas del Excel con sus
tres asserts, el Wilkins, la pestaña Otros, el cuadro de frases y la identificación del paciente.

**Arnés: `scripts/_probe_pro.mjs`** (CDP, teclas y clics reales; cinco grupos: `vti`, `jet`, `fr`,
`reverso`, `controles`), A/B de solo lectura con `--file`. Las mismas escenas con teclas reales son
las que midieron los síntomas contra el inicio de la tanda; el cuerpo de un caso corre **dentro** de
la página y no tiene el canal del navegador.

---

## La FUGA PARAVALVULAR de la prótesis quirúrgica → `docs/mapa/protesis-fuga-pvl.md`

La tanda **PRO-B** (2026-10-17) extendió el motor de la fuga de la TAVI —`eteTaviRPV`, con su
**fuente inyectable**— a la **prótesis aórtica quirúrgica**, con los cuatro cortes de la **Tabla 8
de la ASE 2024 (folio 23, hoja 22)** que ese motor ya aplicaba y **sin mover ninguno**: tres campos
nuevos (`ea_pvl_origen`, `ea_pvl_ext`, `ea_pvl_vc_area`) y **dos prestados**, el ancho de vena
contracta de `ia_vc` y el THP de `ia_pht`, cuyos cortes ya coincidían dígito por dígito.
En la **mitral** no se movió un solo corte —los cuatro cuantitativos de la **Tabla 13 (folio 30)**
ya eran los de `IM_CORTES`— y lo único que entró es `vm_pvl_origen`, el selector que marca que la
regurgitación es paravalvular. **La Tabla 13 no publica extensión circunferencial, así que la
mitral no la ofrece.**

⚠️ **El reverso diastólico NO alimenta el motor de la quirúrgica**: `IA_VMAX_TD_SEVERA` sigue en
20 cm/s de un solo nivel para la nativa y la SAVR (ESC/EACTS 2025) y la lectura en dos niveles es
de la VARC-3, que es de TAVI.
⚠️ **El Laboratorio tenía una segunda copia de los cuatro cortes** y divergía del dueño en dos
cosas; desde el PRO-B3 le pregunta al dueño, y `RPV_L` ganó el rótulo «Sin RPV».

Cobertura: **TC-497**, 51 condiciones. Fuentes: `docs/fuentes/FUENTES-protesis.md`.
