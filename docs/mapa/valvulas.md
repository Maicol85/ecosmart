<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — cálculos de severidad por válvula

Lo parcial lleva `— ⚠️ no verificado: …`.

Convenciones transversales: **el pintor no decide** (`etEstado`/`easvEstado`/`teerEstado` calculan,
`calcET`/`easvSync`/`calcTEER` pintan); **marcar sin borrar** (la banda decide si **vota**, no si se
**muestra**); **sobre prótesis no se auto-gradúa** salvo en la aórtica; y **un grado a mano gana**
(`esqSevManual.<valv>`, `dataset.sugerido`).

---

## Mitral

`calcEM` — severidad integrada: Gmax `4V²` + categoría de `emCategoria`; el THP entra por `avm_thp_val`,
no como criterio aparte — lee: `em_vmax`, `em_gmedio`, `avm_plan`; escribe: `em_gmax`,
`em-gmax-row`, `em_grado` — llamada por: `calcTHP`, `emContRefrescar`.

**El área de Wilkins por ETE (`avm_ete`) NO es una fuente** (2026-10-08, decisión de Maicol). Las
fuentes de área son **tres**: planimetría (`avm_plan`), THP y continuidad. La regla de combinación no
cambió — sigue «prevalece el peor». El nodo **existe y está oculto** (`display:none` + `aria-hidden`
+ `tabindex="-1"`, el patrón de `em_grado` y `ea_grado`): lo persiste `guardarInforme`, lo repone
`limpiarCampos`, y un estudio guardado lo reabre con su valor **intacto y sin votar**. No lo lee ni
`emCategoria`, ni el informe (nativo ni protésico), ni el EN SUMA, ni el PDF, ni `VALVS.mide`, ni el
panel de Evidencia, ni el espejo del TEER. Nunca tuvo columna en el Excel ni mapeo en ningún
importador, ni entrada en ninguna tabla de rangos — y esto último es por qué un `150` tipeado ahí
subía al PDF firmado sin marca «(revisar)».

`emCategoria` — junta **todas** las fuentes de AVm válidas, no sólo la preferida de la ASE 2023 →
`{clave, gm, fuentes, sev, noSev, revisar}`, `clave:'protesis'` si lo es; su `_tomar(id, fuente, vota,
insumo)` exige `>0` y manda a `revisar[]` lo fuera de banda, incluido el **insumo**.

`calcTHP` — AVm por tiempo de hemipresión, 220/THP vía `_avmPorPHT` — lee: `thp`; escribe: `avm_thp`,
`em_thp_display`; llama `calcEM`.

`emContValido(src)` — `!emContFueraBanda(src) && emContMotivoNoVota(src)===''`; puerta del voto del AVm
por continuidad.

`emThpValido(src)` — idem: `!emThpFueraBanda(src) && emThpMotivoNoVota(src)===''`.

`emContMotivoNoVota(src)` — retira el voto si IM o IAo alcanzan `EM_CONT_REGURG_MIN`; **fail-closed** si
no puede leer un grado (`EM_CONT_NOVERIF_TXT`) — lee: `im_grado`, `ia_grado` vía `_emRegurgGrado`.
`emThpMotivoNoVota(src)` — ídem para el THP, sólo con IAo severa (`EM_IA_SEVERA_MIN`); ⚠️ su rama `src`
es **código muerto declarado**.

`emThpFueraBanda(src)` — banda del **insumo** `thp`, aparte del motivo, vía `emFueraBandaLocal`, dueño de
«¿es legible?» para `em_vmax` y `thp` (devuelve el **par** o `null`). `emBandaPlaus(id)` — accesor con la
forma de `_labRango`. `emContFueraBanda(src)` y `emFueraBanda(id)` — ⚠️ no verificado: cuerpo no leído;
del segundo sí consta que **falla abierto** sin entrada en `_labRango`.

`calcIM_ESC` — integración multiparamétrica de IM; basta `severa>=1`, así que cada votante pasa por
`vPlaus` con `p.crudo` **pelado** (marca, no borra) — lee: `im_vc`, `im_jet_area`,
`pisa_r`, `pisa_val`, `im_vmax`, `im_itv`, `im_onda_s`, `im_ai_area||ai_area`, `im_itv_tsvi||itv_tsvi`,
`im_dtsvi||diam_tsvi`; escribe el grado vía `autoCompletarSevIM`; llama `imSecAvisoSiExiste` primero.

`calcPISA` — una línea, `calcIM_ESC()`.

`calcContIM` — Vol-R / FR / EROA por continuidad; `vtim` y `diam_mit` por `vPlaus`, que los dos
multiplican — lee: `im_dtsvi||diam_tsvi`, `im_itv_tsvi||itv_tsvi`, `vtim`, `diam_mit`, `talla`, BSA;
escribe: `vm_lat`, `vr_cont`, `im_eroa_cont`, `im_fr_cont`, `im-cont-severidad`,
`im-tsvi-estimado-box` (Ø TSVI estimado `5.7*BSA+12.1`, `5.78*tallaM+12.1`).

`_imFueraBanda(idMagnitud, val)` — banda **de la magnitud, no de la casilla**, para los tres que llegan
por cascada; consulta `_labRango(idMagnitud)`.

`_imVmProt()` — dueño de «¿esta mitral es protésica?» que **falla cerrado**: sin `#vm_morf` devuelve
`true` — lee: `vm_morf` vía `valvEsProtesis`.

`vmEsProtesis()` — la pregunta del registro: `protNoGradua('vm_morf')` o la etiología del ETE vía
`_eteVmEsProt` — lee: `vm_morf`, `ete_etiologia`.

`vmProtEOA(src)` — Tabla 11 ASE 2024: EOA y DVI votan por separado y el peor manda → `{esProt, eoa, dvi,
dviFuente, eoaI, bsa, imc, obstr, ppm, valido, motivo, fuera, faltan}` — banda por `_plausDe`.

`calcWilkins` — pinta el score de valvuloplastia; con `<4` criterios muestra el parcial y **no
interpreta** — escribe: `wilkins-total`, `wilkins-interp`.

`wilkinsScore()` — `{m, e, c, s, total, puntuados, banda}` desde `wilkins_movilidad`,
`wilkins_engrosamiento`, `wilkins_calcificacion`, `wilkins_subvalvular`; bandas `''` sin puntuar ·
`incompleto` (<4) · `favorable` (≤8) · `suboptimo` (9-11) · `nofavorable` (>11).

`cxWilkins()` — el Wilkins del bloque de cirugía (`cx_wilk_mov/eng/cal/sub`); los cuatro vacíos → `—`,
los cuatro en `1` → «sin puntuar» — escribe: `cx-wilkins-total`.

`calcTEER` — pintor de `teerEstado`; **oculta**, no borra, las filas que no aplican (`teer-c5` con
secundaria, `c2`/`c4` con primaria, `c7`/`c8` del COAPT fuera de secundaria) — lee: `teer_tipo_im`;
tercer disparador de `imSecAvisoSiExiste` — ⚠️ no verificado: no leí `teerEstado`.

`sincronizarGradoIM()` / `sincronizarGradoIA()` — **ya no hay espejo que sincronizar** (2026-10-06):
los `<select>` visibles `im_sev_final` / `ia_sev_final` se fueron y los ocultos `im_grado` /
`ia_grado` son el único nodo del grado. El nombre se conserva a propósito porque sus ~8 llamadores
necesitan el efecto secundario: `emContRefrescar`, o sea el veto de regurgitación de la estenosis
mitral, que lee `im_grado`.

`autoCompletarSevIM(gradoVal)` — escribe el oculto `im_grado` (era `im_sev_final` hasta el
2026-10-06) salvo con `esqSevManual.im` puesto, y llama `sincronizarGradoIM`.

`emContRefrescar()` — llama `calcEM` dentro de un `try`.

---

## Aórtica

`calcAo` — cálculo de guardia del Doppler aórtico, **corre siempre**: Gmax `4V²`, DVI (que no exige
`diam_tsvi`) y AVA por continuidad — lee: `vmax_ao`, `gmedio_ao`, `itv_ao`, `itv_tsvi`, `diam_tsvi`, BSA;
escribe: `gmax_calc`, `dvi-val`, `ava_cont`; llama `sugerirSeveridadEA` y `clasificarEA_Vmax`.

`calcEADetalle` — cápsula del bloque detalle, cascada `ea_*→campo global`; corre **última**
(`syncEADesdeValvulas → calcAo → clasificarEA_Vmax → calcEADetalle`). ⚠️ Clasifica el AVA **redondeado**
(`ava_cont`), no el float crudo — lee: `ea_vmax||vmax_ao`, `ea_gmedio||gmedio_ao`, `ea_vtitsvi||itv_tsvi`,
`ea_vtiao||itv_ao`, `ea_dtsvi||diam_tsvi`; escribe: `ea_gmax_display`, `ea-det-gmax`, `ea-det-gmedio`,
`ea_grado`.

`clasificarEA_Vmax` — grado por Vmax; sale con `va_morf` protésico y con `esqSevManual.ea`.

`sugerirSeveridadEA(ava)` — escribe `ea_grado`: `>=1.5` leve · `avaEsModerada` moderada · resto severa;
con AVA no válida **dice** que no actualizó, no borra el badge.

`avaEsSevera(ava)` — `n <= AVA_SEVERA_MAX`; falla **cerrado** ante vacío, NaN, 0 y <0.
`avaEsModerada(ava)` — `n > AVA_SEVERA_MAX && n < 1.5`. ⚠️ `!avaEsSevera(x)` **no** es moderada:
negarlo vuelve el fail-closed en fail-open con default «moderada». `_avaNum(ava)` — normaliza coma
decimal, número sólo si `isFinite && >0`. `avaEsValida(ava)` = `_avaNum(ava)!==null`.

`eaEscenario()` — escenario de EA (bajo gradiente, bajo flujo); todo insumo pasa por filtro
de positividad, y una FEVI por rango visual que cruza `UMBRAL_FEVI_NORMAL` no es concluyente — lee:
`ava_cont`, `vmax_ao`, `gmedio_ao`, `itv_tsvi`, `itv_ao`, `fevi`, `fevi_hasta`, `fevi_met`, `ea_grado`,
BSA, `vliCalc()`.

`vliCalc()` — volumen latido indexado = `vs_calc / BSA`; `null` si alguno no es `>0`. `_vliPintar()` —
escribe `vli_calc` y `vli-interp`, **también en la rama sin datos** (se vacía).

`calcTango()` — AVA proyectada de Tango — lee: `tango_te`, `tango_tac`, `vmax_ao`; escribe:
`tango-ava`, `tango-ratio`.

`calcIA_ESC` — integración de IAo por votos: **`severa>=1`** desde `8b143e6` (un solo voto severo
basta), si no `moderada>=2`, si no `leve>=1` con los otros dos en cero, y el `else` publica
«Moderada — evaluar integrado». ⚠️ **El grado 3 («Moderada-severa») lo ofrece el `select`
`ia_sev_final` y `calcIA_ESC` NO lo emite nunca**: solo sale de `'4'`, `'2'` y `'1'`. Elegirlo a mano
apaga el panel de conducta, que abre con `ia_sev_final === '4'`.
Cortes inline VC `<3`/`<=6`/`>6` mm · jet/TSVI `<25`/`<65`/resto % · PHT `>500` leve/`>=200`
moderada/`<200` severa · **Vmax telediastólica en Ao desc. `>= IA_VMAX_TD_SEVERA` (20 cm/s) vota
severa y por debajo NO vota** —la ESC/EACTS 2025, Figura 4, folio 4659, publica solo el corte de
severa— · VTI Ao desc. `<15`/`<25`/`>=25` cm, que **no tiene fuente**: son cortes de la app,
declarados en el panel con el marcador `ecosmart` — lee: `ia_vc`, `ia_jet_diam`, `diam_tsvi`,
`ia_pht`, `ia_vmax_td`,
`ia_vti_desc`, `ia_pisa_r`, `ia_pisa_val`, `ia_vmax_cw`, `ia_vti`, `itv_tsvi`; escribe: `ia-jet-ratio`,
`ia-pht-interp`, `ia-vtd-interp`, `ia-vti-desc-interp`, `ia-eroa`, `ia-volr`, `ia-freg`, grado vía
`autoCompletarSevIA`.
⚠️ **La fracción regurgitante es `volR/vsv`, con guarda `vsv > 0`** (corregido en la tanda 2b; antes
era `volR/(volR+vsv)`). `vsv` es el volumen sistólico del TSVI — `π·(Ø TSVI/20)²·VTI TSVI` —, o sea el
SV de la válvula **aórtica**, que es la regurgitante: ASE 2017 (Zoghbi, folio 311) `RF =
RVol/SV_RegValv`, y Tabla 14 (folio 339) `RVol = SV_LVOT − SV_MV`, de donde el SV del TSVI ya contiene
el regurgitante. Sin `vsv` positivo el renglón queda en «—» y la FR **no vota**. Fijado por TC-350.

**Las tres FR de la app, que se parecen y no son la misma cuenta** — no unificar:

| Función | Fórmula | Por qué |
|---|---|---|
| `calcIA_ESC` (IAo, PISA) | `volR/vsv` | `vsv` es el SV de la válvula regurgitante (la aórtica) |
| `calcIM_ESC` (IM, PISA) | `volR/(volR+vsv)` | ahí `vsv` es el flujo **anterógrado**, y el SV mitral *es* `volR+vsv` |
| `calcContIM` (IM, continuidad) | `volR/vmit` con `vmit > 0` | la forma directa de Zoghbi; es el precedente de la guarda |

El defecto de la IAo fue la fórmula de `calcIM_ESC` copiada a otra válvula. **Un «dueño único» de la
cuenta sería el error, no el arreglo.**

⚠️ **Borde del voto severo: la app usa `fr >= 50` y las dos guías no coinciden entre sí.** La ASE 2017
(tabla de IAo, folio 340) publica **`≥ 50 %`** —la app coincide— y la ESC/EACTS 2025 (Figura 4, folio
4659) publica **`RF >50% (echo)`**. Difieren sólo en el 50 exacto. **No se tocó.**

`eaProtVeredicto()` — Tabla 5 ASE 2024 (obstrucción protésica aórtica): normal/posible/significativa;
`null` si `va_morf` no es prótesis; distingue TAVI; el DVI se lee de `dvi-val` antes que de
`ea_dvi_display`.

`eaTaviEspejar()` — espeja AVA, AVAi y DVI al módulo TAVI con `dataset.espejo='1'` y destinos `readOnly`;
un valor previo sin la marca es del médico — escribe: `ete_tavi_ava`, `ete_tavi_avai`.

`eaAtPintar()` — tiempo de aceleración protésico; fila sólo con `va_morf` protésico, y fuera de
`va_at:[10,300]` **no clasifica** — escribe: `ea-det-at-row`, `ea-det-at`, `ea-det-at-nota`.

`easvEstado()` — estenosis supravalvular aórtica; gradúa sólo con gradiente medio en banda (`[0,150]`;
pico `[0,200]`), severa con `>= EASV_MEDIO_SEVERO` → alertas + `SEGUIMIENTO`; sólo el compromiso
**documentado** de ostios alerta — lee: `easv_tipo`, `easv_williams`, `easv_coronarias`,
`easv_estenosis_pulmonar`, `easv_gradiente_medio`, `easv_gradiente_mmhg`.

`easvSync()` — pintor de `easvEstado` (por `createElement`) — escribe: `easv-resultado`.

---

## Tricúspide

`etEstado()` — el que decide, y lo que lee el informe. Tres criterios con su banda: Gm `[0,40]`, THP
`[50,400]`, VTI diast. `[5,100]`, Ø TSVD `[5,60]`, VTI TSVD `[2,60]`; el área exige sus **tres** insumos
en banda y denominador `>0`, y `hayDatos` **incluye** `fuera` — lee: `et_gmedio`, `et_thp`,
`et_vti_diast`, `tsvd_diametro`, `vti_tsvd`; devuelve `{gm, thp, vtiD, avt, gmOk, thpOk, vtiOk, cGm,
cThp, cAvt, signif, hayDatos, fuera}`.

`calcET` — el pintor: significativa / sin criterios. **No inventa grados** (la EAE/ASE 2009 no gradúa en
leve/moderada/severa) y no pisa un grado manual — escribe: `et_avt`, `et-sev`, `et-gmedio-badge`, y
`et_grado` sólo para volverlo a «Sin estenosis»; sale por `protNoGraduaPintar('vt_morf',['et-sev'])`.

`calcIT_ESC` — integración de IT, misma aritmética de votos que `calcIA_ESC`; cortes inline VC
`<3`/`<=7`/`>7` mm · EROA `<20`/`<40`/resto mm² · Vol-R `<30`/`<45`/resto ml · jet `debil`/`moderado`/
resto; EROA = `2π·(pisaR/10)²·pisaVal/vmaxCW·100` — lee: `it_vc`, `it_pisa_r`,
`it_pisa_val`, `it_vmax_cw`, `it_vti`, `it_densidad`; escribe: `it-densidad-interp`, `it-eroa`,
`it-volr`, grado (`'4'` severa / `'2'` moderada).

---

## Pulmonar

`calcVP` — estenosis pulmonar; el gradiente es **derivado** (`4V²`) y se recalcula siempre. Si la Vmax se
borra y el gradiente presente es el nuestro (`dataset.derivadoDe`), se limpia; si no, se respeta. El
auto-grado escribe `ep_grado`, **no** `vp_morf`, y no llega a «Moderada-severa» — lee: `vp_vmax`,
`vp_gmax`; escribe: `vp_gmax`, `ep_grado`, `vp-sev-badge`; sale por
`protNoGraduaPintar('vp_morf',['vp-sev-badge'])`; llama `vpSync`.

`epGradoPorGmax(g)` — `'Normal'`/`'Estenosis leve'`/`'Estenosis moderada'`/`'Estenosis severa'`, o
**`null`** para lo que no es un gradiente (sin esa guarda `null` y `0` caían en «Normal» y `NaN` en
«severa»). La traducción a los `value` del select vive en `_EP_AUTO`, dentro de `calcVP`.

`ipHayInsuf(val)` — único predicado de «¿hay IP?»; acepta la cadena vacía como «no hay», para que un
estudio legado se comporte igual que uno migrado. Cinco consumidores lo usan.

`calcIP` — PAP media y diastólica desde la IP (Masuyama): `4·Vmax²+PmAD` y `4·Vtd²+PmAD`; sin PmAD
publica con sufijo «(sin PmAD)» — lee: `ip_vmax`, `ip_vtd`, `pmad`; escribe:
`ip-papm-row`, `ip-papd-row`, `ip_papd`, `ip_pmad_display`.

`vpSync()` — visibilidad: `bloque-ep-detalle` con `ep_grado !== 'sin'`, `bloque-ip-detalle` por
`ipHayInsuf(ip_grado)`.

---

## Compartido

### «Sin» apaga el botón, y quién decide que el bloque de grado se vea (2026-10-03)

El invariante: **botón prendido = «hay valvulopatía»**. Antes el botón significaba «el cajón está
abierto», que es estado de interfaz, y por eso podía contradecir al grado.

`SEV_TOKEN_SIN` — `{esten:'sin', insuf:'0'}`, dueño único del token de «no hay». `sevEsSin(tipo,
valor)` lo consulta; lo usan el menú ▼, los tres `onchange` y la regla de visibilidad.

`SEV_SIN_APAGA_VALVS` — `['aortica','mitral','pulmonar']`. La costura por válvula: **la pulmonar SÍ
está** (entró en E5b-1: elegir «— grado —» con el botón prendido lo apaga, igual que la mitral) y la
que queda fuera por orden expresa es **sólo la tricúspide**. Tiene que coincidir con `SIN_EN_MENU`
dentro de `valvSev`.

### Quién prendió la pastilla de estenosis: la app o el médico

`VALV_ESTEN_AUTO` — `Set` vivo, NO persistido, exportado en `window`. `localStorage` no distingue el
auto-prendido del clic manual (los dos dejan la clave `valv-pill-esten-<valv>` en `'1'`), así que el
Set es lo único que dice **de quién es** la pastilla. Lo LLENA `valvAutoPrenderEsten` y lo VACÍA la
cola de `toggleValvPill` ante cualquier gesto de estenosis, prenda o apague. Un estudio reabierto
arranca sin dueño. (El gemelo para la insuficiencia pulmonar es `VALV_INSUF_AUTO`, aparte a
propósito.)

`valvAutoPrenderEsten(valv)` — prende el botón cuando el grado del `<select>` es graduable y la
clave de `localStorage` está **ausente** (así respeta el apagado y el prendido manuales).
Idempotente. Mapa: `aortica`→`ea_grado`, `mitral`→`em_grado`, `pulmonar`→`ep_grado`,
`tricuspide`→`et_grado`.

Los gemelos de APAGADO: apagan **sólo si** (a) la pastilla está en `VALV_ESTEN_AUTO` y (b) el grado
quedó en el centinela. Son **cuatro funciones y no una**, y la duplicación es deliberada: la
genérica está exportada y su mapa cubre tres válvulas, así que tocarla le cambia el informe firmado
a las otras.

| función | válvula | llamada desde | borra la clave de `localStorage` | borra `esqSevManual` + foto |
|---|---|---|---|---|
| `valvAutoApagarEsten(valv)` | genérica (ea/em/ep) | **nadie hoy** | no | no |
| `_etApagarAuto()` | tricúspide | `_etAutoGrado` | sí | sí |
| `_epApagarAuto()` | pulmonar | `calcVP` (dos puntos) | sí | sí |
| `_emApagarAuto()` | mitral | `calcEM`, al lado del auto-prendido | sí | sí |

Las dos últimas columnas no son adornos. Sin borrar la clave, `toggleValvPill` la deja en `'0'`,
`valvAutoPrenderEsten` lo lee como «el médico lo cerró» y **el auto-prendido se gasta en un solo
uso**. Sin borrar la marca manual, la cadena `toggleValvPill` → `valvApagarGrado` →
`valvSev.aplicar(…, centinela)` —que corre también cuando el que apaga es la APP, porque la clave
está en `SEV_SINC`— deja el autocálculo mudo para el resto del estudio. `valvAutoApagarEsten` no
hace ninguna de las dos: por eso **la aórtica sigue con el defecto abierto**, reportado y no
corregido (es su informe firmado).

`sevSinApagaPastilla(tipo, valv, valor)` — apaga la pastilla si el valor es «Sin». **Idempotente**:
«apagá si está prendida», porque `valvSev.aplicar` despacha un `change` que ya corrió el `onchange`
del desplegable y las dos puertas piden lo mismo en el mismo gesto. Escrito como «alterná», el botón
volvía a encenderse.

`sevSinApagaDesdeSelect(selectId)` — la misma regla entrando por el `onchange` de un desplegable;
deriva `tipo`/`valv` del registro por `C.select`. Llamadores: `_gradoManoBorraMarca` (las dos
aórticas), `emGradoManual`, `imGradoManual`. **No enciende `esqSevManual`** en la aórtica: «Aórtica
3b» intacta.

`sevBloqueGradoDe(tipo, valv)` — el nodo del grado final: `gf-insuf-<valv>` o
`bloque-esten-<valv>`. ⚠️ Son **hermanos** de la cuantificación, no padres: ésta vive en
`bloque-insuf-<valv>` y en `bloque-<em|ea>-detalle`, y sigue colgando sólo del botón.

`valvGradoVisSync(tipo, valv)` — **dueño único de la visibilidad** del bloque de grado:
`abierta || discrepa || hayGrado`. La tercera mitad existe para que no haya un grado publicado en
el informe con su bloque invisible. Llamado desde las dos ramas de `toggleValvPill` —**dentro** de
cada rama, donde estaba la escritura que reemplaza— y desde el final de `sevSincronizar`.
⚠️ **El orden importa**: `sincronizarEMDesdeGlobal` corre tres líneas después de abrir la pastilla,
así que con la llamada movida al final los espejos de EM quedaban vacíos (TC-301, TC-390).
⚠️ Sin clave registrada, `hayGrado` es `false` a propósito: negarlo dejaba el bloque de la
tricúspide visible para siempre.

### El escalón aórtico «botón abierto y sin grado» — cinco compuertas

`EA_ESCALON_SIN_GRADO = true` desde el 2026-10-03. `_eaSinGrado` / `_iaSinGrado` exigen:

1. `!eaDesc` / `!(iaG > 0)` — no hay grado;
2. `!esclerosis` (sólo la estenosis) — la esclerosis ya tiene su propio token;
3. `!_eaManualS` / `!_iaManualS` — sin marca manual. Hoy es la segunda compuerta, para los grados
   que llegan marcados **sin** botón (un estudio importado);
4. `!_aoBloqueado(clave)` — con **insumo fuera de banda** la app no afirma. Es lo que distingue «no
   se puede medir» de «no se contestó»: con el formulario vacío `bloqueado()` es `false` y el
   escalón sí dispara. Falla cerrada;
5. `!_aoEsProt` (sólo la insuficiencia) — con **prótesis** calla, porque la frase protésica tiene
   otra forma y el token quedaba colgado. Se pregunta por la **morfología**, no por `_eaProtN`.

Y `sevSincronizar` apaga el botón **dentro de la rama de R6** cuando el cálculo soltado es «sin» —
no en el cuerpo de la función, porque eso apagaría el botón del estado 2 y el escalón no dispararía
nunca.

`_plausDe(id, x)` — dueño único de la plausibilidad → `{val, fuera, sinBanda, crudo, b?}`. ⚠️ **La banda
se aplica sobre un valor, no sobre un campo**: el Excel corre sin DOM y con `vPlaus(id)` bandearía la
fila contra el paciente en pantalla.

`vPlaus(id)` — el caso «el valor es el de pantalla»: `_plausDe(id, v(id))`.

`_labRango(dest)` — accesor **mergeado** y cacheado: `DCM_RANGO` con `LAB_XLS_RANGO_PROPIO` encima. Un
solo dueño por campo: el mismo campo no puede tener dos veredictos según por qué puerta entró.

`protNoGraduaPintar(morfId, idsPintar)` — ⚠️ no verificado: `calcET` y `calcVP` salen por él pintando
`PROT_SIN_GRADO_TXT`; cuerpo no leído.

`valvEsProtesis(val)` — ⚠️ no verificado: es «¿este token es prótesis?», que **no** es «¿esta prótesis se
gradúa?» (una SAVR es prótesis y la aórtica sí se gradúa); cuerpo no leído.

---

## Constantes de cortes y bandas

### Aórtica
- `AVA_SEVERA_MAX = 1.0` — `<=1.0` severa; `1.0 < AVA < 1.5` moderada.
- `EA_CRIT = {vmax: 4.0, gmed: 40, avai: 0.6, di: 0.25}` — criterios de EA severa del panel.
- `UMBRAL_VLI_BAJO = 35` ml/m² — `<=35` bajo flujo; **mismo corte para ambos sexos** (ESC 2021/AHA 2020).
- `EA_PROT_CRIT` (ASE 2024, Tabla 5) — `vmax_normal_max 3` · `vmax_signif_min 4` (⚠️ `>=`, no `>`) ·
  `atet_normal_max 0.32` · `atet_signif_min 0.37` · `savr_gmed_normal_max 20` · `savr_gmed_signif_min 35`
  · `savr_dvi_normal_min 0.35` (⚠️ estricto, **no** el 0,30 de la Figura 13) · `savr_dvi_signif_max 0.25`.
- `EA_PROT_VS_MIN = 50` / `EA_PROT_VS_MAX = 90` mL — el VS que la nota `‡` exige para usar la Vmax.
- `AT_PROT_NORMAL_MAX = 80` / `AT_PROT_POSIBLE_MAX = 100` ms — `<80` normal, 80-100 posible, `>100` signif.
- `IA_VMAX_TD_SEVERA = 20` cm/s — velocidad **telediastólica** del flujo reverso en aorta descendente.
  `>= 20` vota severa; por debajo el parámetro **no vota**. Es el único corte que la ESC/EACTS 2025
  publica para ese parámetro (Figura 4, folio 4659, recuadro «Criteria for severe AR»): no hay banda
  de leve ni de moderada que copiar. ⚠️ El literal `20` está **también** en `holoSevero` del módulo
  TAVI (`velT >= 20`), que no deriva de esta constante — otro territorio (aorta abdominal) y otra
  fuente (VARC-3/ASE 2019); unificarlos es decisión clínica, no refactorización.
- `EASV_MEDIO_SEVERO = 40` mmHg — supravalvular severa (ESC 2020, a flujo normal).
- ⚠️ **Tabla 6** (deterioro) declarada y **sin implementar**: compara contra un basal post-implante. La
  app gradúa obstrucción, no deterioro.

### Mitral
- `AVM_SEVERA_MAX = 1.5` cm² — `<=1.5` severa (ESC/EACTS 2021 y 2025, ASE 2023).
- `AVM_MODERADA_MAX = 2.5` cm² — referencia del panel de Evidencia; **no gradúa**.
- `EM_GMEDIO_SIGNIF = 4` mmHg — definición de EM reumática (WHF, citada por ASE 2023).
- `EM_CONT_REGURG_MIN = 2` — grado de IM/IAo que retira el voto del AVm por continuidad.
- `EM_IA_SEVERA_MIN = 4` — sólo la IAo **severa** retira el voto del AVm/THP.
- `EM_BANDA_PLAUS = {em_vmax:[0.2,8] m/s, thp:[20,600] ms}` — banda local, **fuera** de `DCM_RANGO` a
  propósito: tocarla cambiaría la superficie del importador.
- `IM_RATIO_IA_MAX_NAT = 4` / `IM_RATIO_IA_MAX_PROT = 2` / `IM_RATIO_IA_MOD_MIN = 2` — **locales dentro
  de `calcIM_ESC`**: en nativa sólo la IAo severa retira el ratio VTI mitral/TSVI, en prótesis desde la
  moderada. `IM_RATIO_IA_MOD_TXT` declara la divergencia con la ASE 2023.
- `UMBRAL_ONDA_E_APOYO_IM = 120` cm/s — `>=120` **apoya** IM severa (ASE 2017), no la **gradúa**.
- `VM_PROT_EOA_OBSTR_MAX = 1.0` cm² · `VM_PROT_DVI_NORMAL_MAX = 2.2` · `VM_PROT_DVI_SIGNIF_MIN = 2.5` ·
  `VM_PROT_IMC_OBESIDAD = 30` (rama de la Tabla 7). `VM_PROT_PPM_CORTES` — ⚠️ no verificado: definición
  vista, valores no leídos.
- `WILK_9_11 = 'El score no predice el resultado'` — rótulo de la banda 9-11.

### Tricúspide
- `ET_GMEDIO_SIGNIF = 5` mmHg · `ET_THP_SIGNIF = 190` ms · `ET_AVT_SIGNIF = 1` cm² (EAE/ASE 2009 ·
  ESC/EACTS 2021): **criterios de significación**, no grados.

### Pulmonar
- `EP_GMAX_NORMAL_MAX = 9` mmHg (Vmax <1,5 m/s) · `EP_GMAX_LEVE_MAX = 36` (Vmax <3) ·
  `EP_GMAX_MOD_MAX = 64` (36-64 moderada, `>64` severa).
- `IP_SIN_INSUF = 'Sin insuficiencia'` — el token es la etiqueta.

### Prótesis — transversal
- `PROT_SIN_GRADO_TXT = 'No graduada: los cortes de válvula nativa no aplican a prótesis'`.
- `PROT_SIN_GRADO_VALVS = ['vm_morf', 'vt_morf', 'vp_morf']` — las tres que no se gradúan; la aórtica
  **no** entra (tablas ASE 2024; la TAVI no se gradúa por diseño). ⚠️ Declarada antes del primer
  llamador, por TDZ.

### Las tres tablas de bandas
`_labRango` = `DCM_RANGO` + `LAB_XLS_RANGO_PROPIO` (la segunda pisa). `CHM_RANGO` es aparte, y **no** se
fusionó para no tocar el importador de Excel. Criterio de las tres: **atrapan el error de un orden de
magnitud, no lo clínicamente raro**.

| Tabla | Entradas valvulares confirmadas |
|---|---|
| `DCM_RANGO` | `vmax_ao [0.5,8]`, `gmedio_ao [1,150]`, `em_gmedio [1,60]`, `vmax_it [0.5,8]`, `vp_gmax [1,200]`, `vp_vmax [0.2,8]`, `itv_tsvi [2,60]`, `diam_tsvi [5,45]`, `em_vtimit [2,80]`, `itv_mitral [2,80]`, `vtim [2,80]`, `diam_mit [10,60]`, `im_itv [20,400]`, `im_vc [0,20]`, `im_jet_area [0.5,50]`, `pisa_r [1,30]`, `pisa_val [5,150]`, `im_vmax [100,900]` (⚠️ **cm/s, no m/s**) |
| `LAB_XLS_RANGO_PROPIO` | `avm_cont [0.1,8]`, `avm_plan [0.1,8]`, `ava_cont [0.1,8]`, `avm_idx [0.05,6]`, `vm_dvi [0.05,10]`, `vt_dvi [0.05,1.5]`, `vp_dvi [0.05,1.5]`, `va_at [10,300]` |
| `CHM_RANGO` | `avm_plan [0.2,15]`, `ia_vmax_cw [50,800]`, `ia_pht [50,1500]`, `vp_vmax [0.2,8]`, `ai_area [2,80]`, `ad_area [2,80]` |

- ⚠️ **`im_vc` tiene piso `0` y NO se puede subir**: único votante de IM con columna importable, y fuera
  de banda el importador **descarta la fila entera**. Costo: con 0 vota «leve» una VC tipeada en cm.
- ⚠️ **`itv_mitral`/`vtim` [2,80] e `im_itv` [20,400] se solapan en [20,80]**: un VTI de chorro de 70 cm
  en la casilla del de entrada **pasa** y sigue inflando el Vol mitral; lo que las separa es el rótulo.
- ⚠️ **`va_at` está inerte** en TAVI: `ete_tavi_at` no se importa ni pasa por `vPlaus`/`vPdf`.

---

## Sincronías auto ← Doppler

`_syncSiVacio(map)` — copia origen → destino **sólo si el destino está vacío**.

`_syncDerivado(map)` — copia y **refresca mientras el espejo siga siendo espejo**: pisa el destino si
está vacío o si su valor es el último que copiamos (`dataset.espejoDe`); si el médico lo cambia, deja de
coincidir y no se vuelve a tocar. El vaciado del origen sólo arrastra si `dataset.espejoVivo === '1'`.

**Censo por destino** — los nueve espejos y lo que deciden:

| Origen | Destino | Decide |
|---|---|---|
| `diam_tsvi` | `im_dtsvi` | FR de IM → `im_grado` (informe firmado) |
| `itv_tsvi` | `im_itv_tsvi` | FR de IM → `im_grado` |
| `ai_area` | `im_ai_area` | ratio jet/AI → `im_grado` |
| `itv_mitral` | `vtim` | Vol-R y FR → `calcContIM` |
| `fevi` | `teer_fevi` | criterio c7 → APTO / NO APTO del TEER |
| `dsfvi` | `teer_dtsvi` | criterio c8 → APTO / NO APTO |
| `psap_calc` | `teer_pasp` | criterio PASP → APTO / NO APTO |
| `diam_tsvi` | `em_dtsvi` | AVm continuidad → severidad integrada de EM |
| `itv_tsvi` | `em_vtitsvi` | AVm continuidad → severidad integrada de EM |

`_IM_ESPEJOS` (4 de IM) · `_TEER_ESPEJOS` (3 del TEER) · `_EM_ESPEJOS` (2 de EM) · `_ESPEJOS_TODOS` = la
concatenación, en `window`. Siguen separadas: `sincronizarIMDesdeGlobal` filtra la primera con su gate.

`syncEADesdeValvulas()` — copia **incondicional** `ea_vmax→vmax_ao`, `ea_gmedio→gmedio_ao`,
`ea_vtitsvi→itv_tsvi`, `ea_vtiao→itv_ao`, `ea_dtsvi→diam_tsvi`; después llama `calcAo` y `calcEADetalle`.
No es un espejo con marca: si el origen tiene valor, pisa.

`syncTSVI()` — `diam_tsvi_ao → diam_tsvi`, y `calcAo()`.

`eaTaviEspejar()` — espejo propio del módulo TAVI (ver Aórtica).

`vpSync()` / `valvProtSync()` / `eteVmAvisoSync()` — **pintan visibilidad o avisos, no sincronizan
valores**. `eteVmAvisoSync` corre en `RECALC_MODULOS` y al final de `limpiarCampos`.

---

## No confirmado

- **`teerEstado`** — decide la aptitud para TEER (gate por tipo de IM, criterios c1…c8 del COAPT);
  `calcTEER` sólo lo pinta.
- **`_avaContinuidad(dtsvi, itsvi, itvao)`** — dueño de la fórmula del AVA; `calcAo` cae a
  `Math.PI*((dtsvi/20)**2)*itsvi/itvao` si devuelve `null`. **`_avmPorPHT(thp)`** — ídem para 220/THP.
- **`_emRegurgGrado(id, src)`** — lector de `im_grado`/`ia_grado`; confirmado su uso, no su cuerpo.
- **`emContFueraBanda`**, **`emFueraBanda`**, **`protNoGraduaPintar`**, **`valvEsProtesis`**,
  **`protNoGradua`**, **`_eteVmEsProt`**, **`_imEspejosGuardar`**, **`imEspejosRestaurar`**,
  **`sincronizarEMDesdeGlobal`**, **`sincronizarIMDesdeGlobal`**, **`vmProtEOAPintar`**,
  **`eaProtNarrativa`**, **`eaDatosTxt`**, **`valvProtSync`** — localizadas por `grep`, cuerpo no leído
  (`protNoGradua`, ni eso: sólo se vio invocada).
- **`calcDopTric`** y **`calcPSAP`** — insumo de `psap_calc` (que alimenta `teer_pasp`), no gradúan
  severidad valvular. `DT_IT_SIGNIF = 3` está en su zona y no se verificó qué decide.
- **`imSecAvisoPintar` / `imSecAvisoSiExiste` / `imMecanismoIM`** — aviso de IM secundaria:
  confirmados sus tres disparadores (`calcIM_ESC`, `calcTEER`, panel manual), no las funciones.
- **Las cuatro superficies de salida**: este documento cubre quién **calcula** la severidad, no quién
  la **imprime** → `docs/mapa/informe-pdf-excel.md`. La punta del hilo acá son `emPdfValsSync` y
  `_emPdfThpSpanSync`.
