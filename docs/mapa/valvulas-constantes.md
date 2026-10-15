# Mapa · Las CONSTANTES de cortes y bandas de las ocho lesiones valvulares

Sacado de `docs/mapa/valvulas.md` el **2026-10-14** (tanda D2), porque aquel archivo cruzó el
techo de 35 KB que `ecosmart/CLAUDE.md` fija. **No se cambió una sola línea de contenido**: es el
mismo bloque, movido entero, con su puntero en el archivo de origen.

Acá viven los NÚMEROS; en `valvulas.md` viven las funciones que los aplican y en
`valvulas-manual-binario.md`, `aortica-cortes.md`, `valvulas-mitral-pantalla.md` y
`valvulas-ia-it-pantalla.md` las reglas y las pantallas de cada lesión.

---

## Constantes de cortes y bandas

### Aórtica
- `AVA_SEVERA_MAX = 1.0` — `<=1.0` severa; `1.0 < AVA < 1.5` moderada. **Lo comparten el AVA por
  continuidad y el AVA por planimetría** desde el 2026-10-13: es la misma magnitud física medida por
  otro método, y `_eaCritPlan` llama a `avaEsSevera`/`avaEsModerada` en vez de retipear los cortes.
- `EA_BANDAS` — la tabla de la Vmax (`bajo: 2.6 · 3.0 · 4.0 · Infinity`, borde superior EXCLUSIVO),
  `avaSinMin: 1.5` y los dos del gradiente medio, `gmedModMin: 20` y `gmedSevMin: 40`, los dos con
  borde `>=`. ⚠️ **El primer corte de la Vmax pasó de 2,0 a 2,6 el 2026-10-13** (EAE/ASE 2009,
  Tabla 3, p. 10: esclerosis `≤2,5`, leve `2,6-2,9`): el 2,0 no salía de ninguna guía de la
  biblioteca. **Mueve informes en la dirección tranquilizadora** — una Vmax de 2,3 deja de publicar
  «EAo leve.».
- `EA_DVI_SEV_MAX = 0.25` (`<`) · `EA_DVI_MOD_MAX = 0.50` (`<=`) — el DVI, que la Tabla 3 llama
  «velocity ratio». El **0,25 exacto es MODERADA**: el corte severo es estricto en las dos fuentes.
- `EA_AVAI_SEV_MAX = 0.6` (`<=`, de la ESC/EACTS 2025) · `EA_AVAI_MOD_MAX = 0.85` (`<=`, Tabla 3).
  El **0,60 exacto cae del lado SEVERO**, que es el de la guía vigente; la Tabla 3 escribe `<0.6`.
- `EA_CRIT = {vmax: 4.0, gmed: 40, avai: 0.6, di: 0.25}` — criterios de EA severa del panel.
  ⚠️ **Repite los cortes severos del gradiente, del AVA indexada y del DVI, y NO se unificó**: lo
  consume `eaEscenario`, que calcula el SUBTIPO hemodinámico y la discordancia, no el grado.
  Declarado en `docs/PENDIENTES.md`.
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
- `AVM_SEVERA_MAX = 1.5` cm² — `<=1,5` **significativa**. Fuente: **ASE 2023, Tabla 1, folio 8**, y
  **sólo** ésa —de ESC/EACTS 2021 no hay entrada en `FUENTES.md` y la 2025 no tiene página
  verificada de severidad de EM—.
- `AVM_MODERADA_MAX = 2.5` cm² — referencia del panel de Evidencia; **no gradúa**.
- `EM_GMEDIO_ELEVADO_MIN = 5` mmHg (borde `>=`) y `EM_GMEDIO_SIGNIF_MIN = 10` mmHg (borde `>=`) —
  las bandas del gradiente medio de la **ASE 2023, Tabla 1, folio 8** (`< 5` / `5-9` / `>= 10`, a FC
  de 60-80 lpm). **Reemplazan a `EM_GMEDIO_SIGNIF = 4`** (borde `>`), que era la definición de EM
  reumática de la WHF y no un corte de severidad. La banda `< 5` no clasifica.
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
  ESC/EACTS 2021): **criterios de significación**, no grados. Los tres están en la **Tabla 10,
  p. 19** de la EAE/ASE 2009, con el folio verificado en el pie impreso.
- **El área por continuidad: `π · (Ø_TSVD/20)² · VTI_TSVD / VTI_entrada`**, con el diámetro en **mm**
  —el `/20` pasa a cm y saca el radio en un paso— y los dos VTI en **cm**. Es la fórmula de la nota
  `ᵃ` de esa tabla (*«Stroke volume derived from left or right ventricular outflow»*) y del texto de
  la misma página (*«SV divided by the tricuspid inflow VTI as recorded with CWD»*).
  ⚠️ **VERIFICADA POR RECÁLCULO A MANO DE TRES CASOS, Y NO HAY ERROR** (2026-10-13). Con Ø TSVD
  25 mm el área del TSVD es `π·1,25² = 4,9087 cm²`: VTI TSVD 18 y entrada 15 → **5,89 cm²**; VTI
  TSVD 14 y entrada 70 → **0,98 cm²**; VTI TSVD 3 y entrada 15 → **0,98 cm²**. Los tres coinciden
  dígito por dígito con lo que publica la app.
  ⚠️ **Y POR ESO HACE FALTA UN VTI TSVD DE ~3 cm PARA CRUZAR EL CORTE CON UN VTI DE ENTRADA
  NORMAL**, que es el síntoma que el médico reportó: `4,9087 · x / 15 ≤ 1` pide `x ≤ 3,06`. **No es
  un defecto, es la fisiología**: con el VTI de entrada normal no hay estenosis, y la señal vive en
  el DENOMINADOR. Con el VTI de entrada que la propia Tabla 10 marca para ET significativa
  (**>60 cm**), basta un VTI TSVD de **14,26 cm**, que es un valor bajo-normal plausible.

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
