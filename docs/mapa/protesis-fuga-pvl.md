# Mapa — La FUGA PARAVALVULAR de la prótesis QUIRÚRGICA (tanda «PRO-B», 2026-10-17)

Qué cubre: los tres campos nuevos de la **prótesis aórtica quirúrgica**, el motor único con su
fuente inyectable, el selector de **origen** de la **prótesis mitral**, y por qué la mitral no
ofrece extensión circunferencial.

Lo que **no** está acá: el resto de la lógica protésica → `docs/mapa/protesis-valvular.md`; las
tandas Z, Z5 y Z6 → `docs/mapa/protesis-z-z5-z6.md`; los tres cortes del PRO →
`docs/mapa/protesis-pro.md`; los cortes nativos → `docs/mapa/valvulas.md`,
`docs/mapa/aortica-cortes.md` y `docs/mapa/valvulas-constantes.md`.

Como todos los mapas, va **por nombre de función y de constante** y no por número de línea: la
línea cambia en cada edición, el nombre no.

---

## 1 · La regla de la tanda

En prótesis manda **la guía más nueva que traiga el dato**. Acá la trae una sola:
**ASE 2024 (Zoghbi et al., JASE 2024;37(1):2-63)**, con su **regla de folio = hoja + 1**
comprobada otra vez en el **pie impreso** (hoja 22 → pie «23», hoja 29 → pie «30»).

⚠️ **EL TEXTO EXTRAÍDO DE LA ASE 2024 CODIFICA `≥` COMO `$` Y `≤` COMO `#`.** Quien la lea sin
saberlo invierte **todos** los operadores. Las dos tablas de abajo se leyeron con ese reemplazo
hecho; ninguna hizo falta renderizarla.

---

## 2 · El motor: uno solo, con su fuente inyectable

`eteTaviRPV(src)` es el **único** que gradúa una fuga paravalvular en toda la app.

- **Sin `src`** lee los seis campos del módulo TAVI por su id (`ete_tavi_ext_circ`,
  `ete_tavi_vc_ancho`, `ete_tavi_vc_area`, `ete_tavi_pht`, `ete_tavi_flujo_rev`,
  `ete_tavi_vel_tele`). Es **el mismo camino byte por byte** que antes de esta tanda, así que
  **la TAVI es idéntica POR CONSTRUCCIÓN** y no por una medición a posteriori.
- **Con `src`** lee un objeto con las claves `ext`, `vc`, `vcA`, `pht`, `flujo` y `velT`, en las
  **mismas unidades** que los campos de la TAVI: extensión en %, los dos de vena contracta en cm
  y cm², el THP en ms y la velocidad tele-diastólica en cm/s.

Es el patrón `src` que `valvProtDato`, `emContMotivoNoVota` y `_htp2022Core` ya usan, y el único
que deja que el **Laboratorio** —que trabaja sobre `inf.campos` y no sobre el DOM— le pregunte al
dueño en vez de reimplementarlo.

**Los cuatro cortes son los de la Tabla 8 y no se movió ninguno** (ASE 2024, **Tabla 8
«Parameters for evaluation of the severity of prosthetic aortic valve regurgitation», folio 23,
hoja 22**, verificada en el PDF original):

| parámetro | leve | moderada | severa |
|---|---|---|---|
| Extensión circunferencial de la fuga (%) | `<10` | `10-29` | `≥30` |
| Ancho de vena contracta (cm) | `<0,3` | `0,3-0,6` | `>0,6` |
| Área de vena contracta (cm²) | `<0,10` | `0,10-0,29` | `≥0,30` |
| THP (ms) | `>500` | `200-500` | `<200` |

**Integración: gana el peor parámetro presente.** «Trivial» exige **TRES** de los cuatro en banda
trivial; con menos devuelve «Leve — faltan parámetros para descartar mayor severidad». Y un
**cero medido** —la constancia de que se buscó el jet y no está— devuelve `{nula:true}`, que es la
única vía por la que este motor NIEGA.

⚠️ **CON DOS PARÁMETROS ALIMENTABLES «TRIVIAL» SERÍA INALCANZABLE.** Es parte de por qué la fuga
aórtica quirúrgica alimenta los **cuatro** y no sólo los dos específicos de una fuga.

---

## 3 · La prótesis AÓRTICA quirúrgica

### Las piezas, por nombre

| pieza | qué hace |
|---|---|
| `_eaEsProtesisSavr()` | «¿es una prótesis QUIRÚRGICA?» = `valvEsProtesis(va_morf)` **y no TAVI** |
| `EA_PVL_ORIGEN_PVL` | los dos valores de origen que habilitan el veredicto: `paraval` y `mixta` |
| `eaProtRPV()` | el dueño del veredicto. Delega en `eteTaviRPV(src)` |
| `eaProtPvlTxt()` | la frase, una sola para la pantalla y el informe. `{clave, txt}` |
| `eaPvlPintar()` | el dueño de la pantalla: la visibilidad del bloque y sus dos filas |
| `bloque-prot-va-pvl` | el bloque, al pie de la columna de la insuficiencia aórtica |
| `ea_pvl_origen`, `ea_pvl_ext`, `ea_pvl_vc_area` | los **tres** campos nuevos |
| `ea-pvl-interp`, `ea-pvl-motivo` | las dos filas del `.calc-box` |

### ⚠️ TRES CAMPOS NUEVOS Y DOS PRESTADOS

El **ancho de vena contracta** sale de `ia_vc` y el **THP** de `ia_pht`, que ya existen en la misma
pestaña, miden exactamente eso y cuyos cortes **ya coinciden dígito por dígito** con los de la
Tabla 8 —`calcIA_ESC` vota `<3 / 3-6 / >6` mm y `>500 / 200-500 / <200` ms—. Consecuencias:

- el médico **no tipea nada dos veces**;
- los dos parámetros **no pueden** dar un grado acá y otro en el cuadro de arriba;
- se leen con `vPlaus(...).val`, que es `null` fuera de banda: un valor ilegible no vota, igual
  que en `calcIA_ESC`.

⚠️ **`ia_vc` ESTÁ EN MILÍMETROS Y EL MOTOR ESPERA CENTÍMETROS.** Sin el `/10`, un ancho de 5 mm
entraría como 5 cm y el motor devolvería **SEVERA** sobre una fuga moderada — en la dirección que
sobre-afirma.

### ⚠️ EL REVERSO DIASTÓLICO NO SE LE PASA, Y ES DELIBERADO

`IA_VMAX_TD_SEVERA` queda en **20 cm/s de un solo nivel** para la nativa y la SAVR (ESC/EACTS
2025, Figura 4, folio 4659) y la lectura en **dos niveles** es de la **VARC-3**, un documento de
TAVI. Pasárselo aplicaría a una prótesis quirúrgica un corte que la orden prohíbe mover y dejaría
el mismo número leído con dos cortes distintos.
**Medido:** con `ia_vmax_td = 25 cm/s` la fuga sigue en **Trivial** mientras `ia_grado` pasa a
**severa**. Dos números, dos cortes, dos territorios.

### Las dos compuertas

1. morfología protésica **quirúrgica** (`_eaEsProtesisSavr`);
2. origen consignado como **paravalvular** o **mixto**.

Sin la segunda **no se afirma nada**: una fuga paravalvular no se deduce de los parámetros de una
insuficiencia aórtica, que son los mismos de una regurgitación central.

### Las frases, y de dónde salen

Son las de la TAVI **palabra por palabra**; lo único propio es la rama de «consignada y sin
graduar», que existe porque acá no hay reloj de horas con el que localizar el jet.

| estado | informe (los tres estilos) | EN SUMA |
|---|---|---|
| graduada | `Insuficiencia paravalvular moderada, extensión circunferencial 15%.` | `IAo paravalvular moderada.` |
| `nula` (cero medido) | `Sin insuficiencia paravalvular significativa.` | — |
| sin parámetros | `Insuficiencia de origen paravalvular.` | — |

⚠️ **NO REEMPLAZA LA REGURGITACIÓN CENTRAL.** `ia_grado` lo sigue publicando `calcIA_ESC` y la
fuga es una **oración aparte**, que es la misma lógica que la TAVI aplica desde siempre: allá
`ia_grado` y `taviRpvNarrativa()` conviven como dos oraciones del mismo párrafo.

### Las cuatro columnas del repintado

`eaPvlPintar` se llama desde: el `oninput`/`onchange` de sus tres campos · la **cola de
`calcIA_ESC`** (porque el motor lee `ia_vc` y `ia_pht`, que son campos de ese bloque) ·
`valvProtSync` (la morfología) · `RECALC_MODULOS` **y** `limpiarCampos`.

⚠️ **LA VISIBILIDAD LA GOBIERNA `eaPvlPintar` Y NO `valvProtSync`**, que es quien muestra los
otros cuatro bloques de prótesis. Dos motivos: `valvProtSync` **no se llama desde
`limpiarCampos`** —censado por `grep` sobre el cuerpo entero de esa función—, y con un dueño
propio la línea que hay que agregar ahí es **una** y no toca los otros cuatro bloques.

### ⚠️ EL BADGE SE CONSTRUYE POR NODOS Y NO CON `innerHTML`

`eteTaviSync` usa `el.innerHTML = badge(...)` y es lo que la línea base de Semgrep **ya
contabiliza**; una ocurrencia **nueva** la habría llevado de 127 a **128**, que es exactamente el
falso que la tanda Y2 pagó sobre código recién escrito. `eaPvlPintar` usa `createElement` +
`textContent`.

---

## 4 · La prótesis MITRAL

### ⚠️ LA TABLA 13 YA ESTABA IMPLEMENTADA

**ASE 2024, Tabla 13 «Echocardiographic criteria for severity of prosthetic mitral valve
regurgitation», folio 30, hoja 29**, verificada fila por fila en el PDF original:

| Tabla 13 | campo de la app | corte que la app aplica | ¿igual? |
|---|---|---|---|
| VC width `<0,3 / 0,3-0,69 / ≥0,7` cm | `im_vc` (mm) | `IM_CORTES.vc` `<3 / 3-<7 / ≥7` | **sí** |
| RVol `<30 / 30-59 / ≥60` mL | `vr_cont` + PISA | `IM_CORTES.volr` | **sí** |
| RF `<30 / 30-49 / ≥50` % | `im_fr_cont` + PISA | `IM_CORTES.fr` | **sí** |
| EROA `<0,20 / 0,20-0,39 / ≥0,40` cm² | `im_eroa_cont` + PISA (mm²) | `IM_CORTES.eroa` `<20 / 20-39 / ≥40` | **sí** |
| Color flow jet area `<20 %` / `>50 %` del área de la AI | `im_jet_area` + `im_ai_area` | `IM_CORTES.jet_prot` | **sí, ya cita la T13** |
| Pulmonary venous flow | `im_onda_s` | textual | **sí** |
| Flow convergence · Jet density · Jet contour | — | — | **no tienen campo** |

Así que la tanda **no movió un solo corte de la mitral**, y eso está medido: con vena contracta de
8 mm, `im_grado` vale **4** con el origen vacío, central, paravalvular y mixto.

### ⚠️ NO HAY EXTENSIÓN CIRCUNFERENCIAL, Y ES DE LA FUENTE

La Tabla 13 **no publica** ese parámetro —censada entera—, a diferencia de la Tabla 8 de la
aórtica. Ofrecerlo acá sería tomarlo prestado de una tabla de **otra válvula**: la ASE 2019 y la
VARC-3 que lo publican son también de la aórtica. Decisión de Maicol, y TC-497 lo fija por su
ausencia (`vm_pvl_ext` no existe).

### Lo que entró: un selector y nada más

| pieza | qué hace |
|---|---|
| `vm_pvl_origen` | el selector (— / central / paravalvular / mixta), en el bloque de la IM |
| `bloque-prot-vm-pvl` | su envoltorio, mostrado con morfología protésica |
| `VM_PVL_ORIGEN_PVL` | los dos valores que escriben frase: `paraval` y `mixta` |
| `VM_PVL_FRASE` | las dos frases, declinadas para que la oración concuerde |
| `imPvlOrigenTxt()` | el rótulo de la fila, **leído de la `<option>` del propio selector** |
| `imPvlTxt()` | la frase, una sola para el informe y el EN SUMA |
| `imPvlPintar()` | el dueño de la pantalla |
| `im-pvl-interp` | la fila del cuadro |

⚠️ **LA FRASE NO REPITE EL GRADO.** El grado lo publica la oración de arriba y el EN SUMA ya
escribió «IM severa.» dos renglones antes. Repetirlo sería una **quinta copia** del vocabulario de
severidad —`imTxt`, `GTX`, `_ESC04` y `GRTXT` ya son cuatro, censadas— y dos lugares diciendo lo
mismo del mismo paciente.

⚠️ **EL ORIGEN «CENTRAL» NO ESCRIBE NADA EN EL INFORME**: se ve en la pantalla —donde queda
constancia de que se evaluó— y no agrega una oración, porque la insuficiencia ya está graduada.

⚠️ **EL RÓTULO DE LA FILA SALE DE LA `<option>`** y no de un mapa paralelo: así la pantalla no
puede decir una palabra distinta de la que el control ofrece, que es el defecto que el ternario
del S/D venoso pulmonar ya pagó.

| estado | informe | EN SUMA |
|---|---|---|
| `paraval` | `Insuficiencia mitral paravalvular.` | `IM paravalvular.` |
| `mixta` | `Insuficiencia mitral de origen mixto, central y paravalvular.` | `IM de origen mixto.` |
| `central` | — (sólo pantalla) | — |

---

## 5 · El Laboratorio: la segunda copia que se retiró

`_labTaviResumen` **reimplementaba** la cascada de `eteTaviRPV` sobre `inf.campos` —no podía
llamarla, porque ese motor leía el DOM— y la segunda copia **divergió del dueño en DOS cosas**,
las dos medidas sobre estudios archivados:

1. **el reverso seguía votando SEVERA desde 20 cm/s.** El PRO3 lo partió en dos niveles por la
   VARC-3 y esta copia no lo siguió: con **25 cm/s** el dueño decía **Moderada** y el Laboratorio
   **Severa**, sobre el MISMO estudio;
2. **el «cero medido» no existía acá.** Un estudio con extensión circunferencial **0** —la
   constancia de que se buscó el jet y no está— contaba como **Leve**, que es exactamente el
   defecto que el motor cerró en su día.

Desde el PRO-B3 queda **una llamada**. `RPV_L` gana el rótulo **«Sin RPV»**, que es una categoría
nueva de esa distribución: sin él, esos estudios contarían en `nR` y no dibujarían barra, o sea
una distribución que no suma 100 % sin que nada lo diga.

---

## 6 · Las superficies, una por una

| superficie | qué publica |
|---|---|
| pantalla | el bloque aórtico con sus dos filas; el selector mitral con su fila |
| informe (3 estilos) | la oración de la fuga aórtica y la del origen mitral |
| EN SUMA | `IAo paravalvular <grado>.` · `IM paravalvular.` / `IM de origen mixto.` |
| PDF | por el narrativo, igual que la fuga de la TAVI. **Sin filas nuevas en la tabla de datos** |
| PPT clínico | `IAo paravalvular: <grado>` y `IM: origen paravalvular` en la franja de válvulas |
| vista 2D | `ea-pvl-interp` y `im-pvl-interp` en las listas «Ver criterios»; con válvula nativa las filas dicen «—» y `_v2dCrit` las descarta |
| Laboratorio | la distribución de la fuga de la TAVI, ahora leída del dueño |
| **Excel** | **440 columnas, sin una sola nueva** — los cuatro campos viajan con el estudio |

---

## 7 · Las trampas medidas en esta tanda

1. **`document.body.innerText` NO SIRVE PARA CENSAR UN RÓTULO.** `innerText` omite lo que está en
   `display:none`, así que parado en la pestaña Válvulas devolvió **674 caracteres** y CERO
   ocurrencias de «abdominal» con el rótulo viejo intacto en la pestaña ETE. Se censan los
   **rótulos autorados** (cada `<label>` y cada `<option>`), que existen con la pestaña cerrada.
   Y **no el fuente**: el comentario que explica el cambio **nombra** el texto viejo.
2. **EL BLOQUE DE LA INSUFICIENCIA AÓRTICA ESTÁ DETRÁS DE SU PROPIA PUERTA**, y `abrirValv` abre
   las otras tres cajas pero no ésa. La primera corrida informó el bloque invisible en las escenas
   que no tecleaban ningún campo —un tecleo llama a `abrirPara`, que lo abre de rebote— así que la
   visibilidad salía `true` o `false` según si la escena tipeaba algo, **no según la morfología**.
3. **A 768 px Y POR DEBAJO ESE CAJÓN SE CIERRA, Y EL RESPALDO EN LÍNEA NO GANA**: el CSS del
   celular usa la clase con `!important`. La primera medición informó el bloque en **0×0** en las
   seis celdas angostas con el bloque perfecto. Se abre con el **gesto real** (`valvDatosTog`)
   después de cambiar el viewport.
4. **EL `id` DEL CUERPO DEL CAJÓN ES `bloque-insuf-aortica` Y NO `bloque-ia-detalle`**: con el id
   inventado el abridor devolvía «NO EXISTE» y las ocho celdas medían el bloque cerrado.
5. **ESCRIBIR UN `id` EN EL LECTOR Y OTRO EN EL MARCADO da `null` sin error**: la primera versión
   de la sonda leía `ea-pvl-sev` y el marcado decía `ea-pvl-interp`, así que las diecinueve escenas
   informaron la fila en `null` con la fila perfecta.
6. **UN CAMPO DE FORMULARIO NO VA DENTRO DEL `.calc-box`**: la primera versión del selector mitral
   quedó entre dos `calc-row`. El `.calc-box` es la caja de **resultados**.
7. **Me comí el acento grave SEIS veces**, todas en comentarios míos dentro del template de la
   sonda o del cuerpo de TC-497. `scripts/check_backticks.py` dio la línea exacta las seis.
   ⚠️ **Y UNA VEZ ME LLEVÉ EL ACENTO GRAVE QUE ABRE EL CUERPO DEL CASO**, barriendo un rango de
   líneas: el síntoma fue que el chequeo señaló una línea **350 líneas después**, en el runner.
   **El acento grave que FALTA se ve igual que uno que SOBRA.**
