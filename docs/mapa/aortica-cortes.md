# Mapa — los CORTES de la estenosis aórtica, variable por variable

Mapa de la tanda del **2026-10-13**. Sacado de `docs/mapa/valvulas.md`, que ya estaba en 33 KB.
Está por **nombre de función y de constante**, no por número de línea: la línea cambia en cada
edición, el nombre no.

**Los cortes con su guía y su folio NO están acá**: están en `docs/fuentes/FUENTES.md` →
«Estenosis AÓRTICA — los cortes por variable y por grado». Acá está el **comportamiento**.

---

### Los SEIS votantes de la estenosis aórtica (2026-10-13)

`eaGradoCalculado()` es el **dueño único** y la regla de integración es **el peor de los votos**
(`_eaPeorGrado`), con `null` = «este criterio no se pronuncia», que **no** es «sin estenosis». Los
cortes y sus folios están en `docs/fuentes/FUENTES.md` → «Estenosis AÓRTICA — los cortes por
variable y por grado».

| Criterio | Campo(s) | Dónde se calcula | Qué grados emite |
|---|---|---|---|
| Vmax | `vmax_ao` | `_eaBandaVmax` sobre `EA_BANDAS.vmax` | sin · leve · moderada · severa |
| G. medio | `gmedio_ao` | cascada inline, `EA_BANDAS.gmedModMin`/`gmedSevMin` | moderada · severa · **se abstiene** |
| AVA continuidad | `ava_cont` (derivado) | `avaEsModerada`/`avaEsSevera` + `EA_BANDAS.avaSinMin` | sin · moderada · severa |
| AVA planimetría | `ava_plan` | `_eaCritPlan` (los MISMOS predicados) | moderada · severa · **se abstiene** |
| AVA indexada | `ava_cont` ÷ `getBSA()` | `_eaCritAvai`, `EA_AVAI_SEV_MAX`/`MOD_MAX` | moderada · severa · **se abstiene** |
| DVI | `itv_tsvi` ÷ `itv_ao` | `_eaCritDvi`, `EA_DVI_SEV_MAX`/`MOD_MAX` | moderada · severa · **se abstiene** |

⚠️ **LOS TRES ÚLTIMOS SE APLICAN DESPUÉS Y SÓLO PUEDEN AGRAVAR, Y ESO ES EL DISEÑO.**
`eaGradoCalculado` calcula primero el peor de los TRES viejos y recién después deja que el DVI, la
planimetría y el AVA indexada lo empeoren. La consecuencia es un **control negativo construido**: en
toda escena donde ninguno de los tres se pronuncie, `grado`, `criterio`, `gVel`, `gGrad`, `gAva`,
`gVelGrad` y `criterioVelGrad` valen **byte por byte** lo de antes del 2026-10-13. Fundirlos en un
solo `_eaPeorGrado` de seis daría el mismo número y haría imposible afirmar esa igualdad sin medirla
escena por escena.

⚠️ **SÓLO LA Vmax VOTA «LEVE», Y LAS OTRAS CINCO SE ABSTIENEN EN ESA BANDA.** La banda «Mild» de la
Tabla 3 no tiene cota que la separe de lo normal para el gradiente, las tres áreas y el DVI: un DVI
de 0,9 o un área de 3,5 cm² son los de un corazón sano y caen ahí. La Vmax es la única con techo de
normalidad publicado (`≤2,5`, la columna «Aortic sclerosis»). El motivo largo está en el comentario
de `EA_BANDAS` y en `FUENTES.md`.

⚠️ **`eaGradoCalculado` CONSULTA LA BANDA DE PLAUSIBILIDAD PARA LOS TRES NUEVOS Y NO PARA LOS TRES
VIEJOS.** No es una inconsistencia: los viejos ya tienen la guarda en sus **tres** llamadores
(`calcAo`, `clasificarEA_Vmax`, `calcEADetalle`); los nuevos no la tienen en ninguno, así que sin
consultarla ahí no se consultaría en ningún lado y un área por planimetría de 50 cm² —tipeada en
mm²— votaría como si fuera legible.

**Tres piezas de cableado que no son obvias:**
- `avaPlanEditado(origenId)` es el **dueño único del gesto** de editar el AVA por planimetría. Sus
  dos puertas (`ava_plan` en Válvulas, `ava_plan_dop` en Doppler) llevaban
  `avaPlanSync(...);avaPlanPintar()`, que espeja y dice si el valor es plausible y **nada más**:
  ninguna corría la cadena que escribe el grado.
- `ava_plan` entra en **`EA_GRADO_INSUMOS`**: desde que vota, un valor fuera de banda tiene que
  **retirar** el grado que la app sugirió, no sólo dejar de escribir uno nuevo.
- **`calcBSA` recalcula la aórtica también en su rama SIN peso ni talla.** Su comentario declaraba lo
  contrario y era cierto hasta que el AVA indexada pasó a votar: desde entonces, borrar el peso
  dejaba en el informe firmado una severidad sostenida por un peso que ya no existe. Sólo puede
  **bajar** el grado, nunca subirlo, así que no reabre lo que aquella regla protegía.

⚠️ **EL CUADRO DE REFERENCIAS DEL DOPPLER PASÓ DE OCHO FILAS A ONCE** (`ao-ref-plan`,
`ao-ref-avai`, `ao-ref-dvi`). Es sólo pantalla —ningún emisor lee esos nodos— y **no recalculan
nada**: le preguntan a `eaGradoCalculado()`. Cuando un criterio se abstiene, la fila **dice** «no
gradúa» con el corte al lado: una fila que muestra el número y calla se lee como un criterio perdido.

⚠️ **LA FRASE «el grado consignado no coincide con las mediciones» DEL EN SUMA ES PREEXISTENTE Y
ALCANZA A MÁS ESCENAS DESDE EL 2026-10-13.** Sale de `eaEscenario().esperado`, que es una **segunda
lectura** del veredicto: mira el AVA y la pareja Vmax/gradiente y nada más, así que puede diferir del
grado que el dueño único escribe. **Está medido que es preexistente**: la escena «Vmax 3,5 + AVA
1,60» la produce sin ninguna variable de esta tanda, idéntica en HEAD y hoy. Cambiarla es cambiar un
texto del informe firmado; queda en `docs/PENDIENTES.md`.

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
