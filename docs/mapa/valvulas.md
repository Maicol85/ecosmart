<!-- mapa armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Mapa de funciones — cálculos de severidad por válvula

Lo parcial lleva `— ⚠️ no verificado: …`.

Convenciones transversales: **el pintor no decide** (`etEstado`/`easvEstado`/`teerEstado` calculan,
`calcET`/`easvSync`/`calcTEER` pintan); **marcar sin borrar** (la banda decide si **vota**, no si se
**muestra**); **sobre prótesis no se auto-gradúa** salvo en la aórtica; **un grado a mano gana**
(`esqSevManual.<valv>`, `dataset.sugerido`); y desde el **2026-10-13**, **un campo vacío no vota ni
deja grado**.

> ⚠️ **El BORRADO tiene su propio mapa: `docs/mapa/valvulas-borrado.md`** (2026-10-13). Ahí viven
> `sevRetirarSugerido` —el dueño único del retiro del grado en las cuatro lesiones—, la propiedad de
> las pastillas (`VALV_ESTEN_AUTO` / `VALV_INSUF_AUTO`, las cuatro puertas que prenden y las siete
> funciones de apagado), `_imIntegrar` y la regla del **peor de los dos métodos** de la IM, la regla
> de que **gana la continuidad** en la IT, el grado de cada fila entre paréntesis y la fila de FR del
> papel. Se sacó a archivo propio porque este mapa está en 32,7 KB y el techo de `CLAUDE.md` son
> ~35 KB — la misma razón por la que `vd-derecho.md` y `doppler-mitral-grilla.md` nacieron aparte.

---

## Mitral

### La PANTALLA de las dos lesiones mitrales → `docs/mapa/valvulas-mitral-pantalla.md`

Los **18 campos de la insuficiencia en tres columnas de seis**, las **cinco casillas automáticas
nuevas** y por qué no viajan con el estudio, el **cuadro de referencias en tres bloques** con los
cuantitativos en dos columnas por método, la **columna 2 de la estenosis** con el volumen eyectado
del TSVI y su dueño único `_vsTsviCalc`, y el **mecanismo de los globos ⓘ** de toda la pestaña
(toque, tarjeta corta, sin hover y sin llevar al manual). Tanda D1 del 2026-10-14.

⚠️ **Eso es PANTALLA: ni un corte, ni un grado, ni una regla de integración cambió ahí.** Lo que
gradúa sigue estando en este archivo y en `valvulas-manual-binario.md`.

### La PANTALLA de las insuficiencias AÓRTICA y TRICUSPÍDEA → `docs/mapa/valvulas-ia-it-pantalla.md`

La **IAo en tres columnas de cuatro** y la **IT en 3 + 3 + 2**, las **cinco casillas automáticas
nuevas** con sus dos dueños (`_iaAutosSync` y `_itAutosSync`) y el cuarto argumento que ganó
`_imAutoDeFila`, las **once tarjetas ⓘ** —cuatro nuevas y siete reescritas, con lo que bajó de
sus `title` largos a «Referencia clínica»—, el **rótulo PHT → THP** con lo que NO se cambió y por
qué, y el **color de los cinco avisos** que resolvían a gris. Tanda D2 del 2026-10-14.

⚠️ **LA FRACCIÓN REGURGITANTE DE LA IT NO EXISTE EN LA APP NI EN SU GUÍA**, y por eso la columna
3 de esa lesión tiene dos casillas y no tres. Antes de «agregarla», leer ahí.

⚠️ **Eso también es PANTALLA**, con la única excepción del rótulo THP, que sí llega al informe
firmado del TAVI y al PDF.


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

> ⚠️ **EL LABORATORIO TIENE SU PROPIO LECTOR DE ESTA MISMA REGLA, Y COMPARTE LAS CONSTANTES.**
> `_labEmLectura(inf)` (ver `docs/mapa/laboratorio-estenosis-mitral.md`) reproduce esta cascada
> sobre un **registro archivado** —`emCategoria` no se puede llamar desde ahí: lee el DOM— y
> consume `AVM_SEVERA_MAX`, `EM_GMEDIO_ELEVADO_MIN`, `EM_GMEDIO_SIGNIF_MIN`, `emThpValido`,
> `emContValido` y `emImSignificativa`. **Mover un corte o una compuerta de acá mueve las seis
> categorías del Laboratorio**, y al revés no: el sub-rango de 1,0 cm² es sólo de allá y no gradúa.

`emCategoria` — junta las fuentes de AVm **marcadas y válidas** →
`{clave, gm, fuentes, sev, noSev, revisar, noIncl}`, `clave:'protesis'` si lo es; su
`_tomar(id, fuente, vota, insumo, chk)` exige `>0`, consulta la casilla ANTES de la banda y manda a
`revisar[]` lo fuera de banda, incluido el **insumo**.

**LA REGLA ES BINARIA DESDE EL 2026-10-11 (decisión de Maicol):** «significativa» / «no
significativa, con gradiente elevado», nomenclatura de la ASE 2023 (Tabla 1, folio 8). Cuatro
escalones, en este orden:
1. `sev.length` → `severa` — **basta UNA** fuente marcada y válida con AVm `<= 1,5`: prevalece el
   peor, sin matiz. La clave se llama `severa` y la palabra impresa es «significativa»;
2. gradiente `>= 5` **y** `emImSignificativa()` → `gradiente_im`. Con IM moderada o mayor el
   criterio del gradiente se retira **COMPLETO**, las dos bandas, porque ahí el gradiente sube por
   volumen. El área sigue votando, y por eso su escalón va primero;
3. gradiente `>= 10` → `severa`;
4. gradiente `>= 5` → `gradiente`.

**`probable` SE ELIMINÓ.** La discrepancia de áreas ya no produce clave propia; el aviso
`em-discordancia` cuelga ahora del HECHO (`sev` y `noSev` las dos con contenido) y no del nombre de
una categoría.

`emMetodoIncluido(idChk)` — compuerta de «¿el médico lo marcó en *Incluir en el informe*?». **Sólo
se aplica si la casilla está RESUELTA** (`dataset.tocado` o `dataset.desdeEstudio`); sin resolver
vota por su valor. Es lo que hace que un estudio anterior al selector reabra y **reimprima** con la
misma categoría: esos estudios no traen `em_pdf_plan__chk`, las dos rutas de restauración lo leen
como desmarcado y `calcEM` no corre en la ventana de reimpresión. Falla ABIERTO sin la casilla.

`emGradoVis(g)` / `EM_GRADO_VIS` — dueño único de «¿cómo se escribe el grado?». El valor guardado
`em_grado='severa'` **no cambia** y se muestra «Significativa». Lo consumen la fila «EM grado» del
PDF y `SEV_SINC.em.etiqueta`; la `<option>` del selector tiene el texto a mano y **de ella cuelga el
PPT** (`_pptSel` devuelve el texto de la opción).

`emCuadroRefSync(cat)` — pinta el cuadro de referencias: una clasificación por método
(`em-clase-thp`, `-cont`, `-plan`) y la banda del gradiente (`em-clase-gm`). Recibe la `cat` y no la
vuelve a pedir. Sólo pantalla. `emCuadroRefRepintar()` es su entrada en `RECALC_MODULOS`, y
`limpiarCampos` repone la **clase** (el texto lo pone en «—» el barrido genérico).

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

### Los SEIS votantes de la estenosis aórtica → `docs/mapa/aortica-cortes.md`

El dueño único (`eaGradoCalculado`), la regla del peor, los seis criterios con su corte y su
operador, las tres piezas de cableado que no son obvias y el cuadro de referencias de once filas
viven en **`docs/mapa/aortica-cortes.md`**. Se sacó a archivo propio el 2026-10-13 porque
`valvulas.md` ya estaba en 33 KB y la regla de `CLAUDE.md` es partir en vez de estirar — la misma
decisión que `vd-derecho.md` y `doppler-mitral-grilla.md`.

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

### El MODO MANUAL, el selector binario de la EM, el violeta y el VTI de la ET → `docs/mapa/valvulas-manual-binario.md`

Mapa aparte, del 2026-10-13, porque este archivo está en 32,0 KB y el techo son ~35 KB. Allá viven:

- **`sevReiniciarManual(clave, calc)`** — dueño único de «la marca de manual se limpia sola al
  borrar el último dato que votaba», para las **ocho** lesiones con pastilla. Lo llama
  `sevSincronizar` y nadie más. Sus cuatro guardas, y por qué una marca **restaurada** —la de un
  estudio reabierto o una planilla importada— no se toca;
- el **selector binario** de la estenosis mitral: «No significativa» / «Significativa», con los
  cuatro `value` intactos y `moderada` como `<option hidden>`, más el censo de quién lee el valor;
- **`VIS_BTN` / `rotulo()`**, el dueño por par del rótulo del sub-botón, que cerró una divergencia
  pantalla/pantalla: `corto()` decía «Severa» donde la `<option>` decía «Significativa»;
- **`.valv-sev-btn.nivel-sig`**, el violeta de «Significativa» en las dos válvulas binarias;
- **`ET_CRIT.vtiEnt`**, el cuarto criterio de la estenosis tricuspídea (VTI de entrada `>60 cm`).

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

## PRÓTESIS valvular mitral y aórtica → `docs/mapa/protesis-valvular.md`

> **Esa zona son CUATRO archivos desde el 17/10/2026.** `protesis-valvular.md` (16,7 KB) tiene lo
> de abajo; `protesis-z-z5-z6.md` (20,4 KB) las tres tandas históricas; `protesis-pro.md`
> (17,6 KB) los tres cortes del PRO; y `protesis-fuga-pvl.md` la **fuga paravalvular de la
> prótesis quirúrgica**, aórtica y mitral. El original se partió porque estaba en 34,2 KB, a
> 754 bytes del techo.

Los criterios **propios de las prótesis** —Tabla 11 de la ASE 2024 para la estenosis mitral
(velocidad pico de E, gradiente medio, DVI, AEO en tres tramos y THP como parámetro **directo**),
Tabla 7 para el PPM de las dos válvulas, Tabla 5 para la estenosis aórtica protésica y Tablas 12 y
13 para la regurgitación mitral protésica— viven en ese mapa desde la tanda **W2-B** (2026-10-15),
junto con la nomenclatura **AEO** y las cinco tarjetas ⓘ de diferencia nativa-prótesis.

⚠️ **Lo que hay que saber antes de tocar algo de acá:** con morfología protésica el **cuadro de
referencias de la estenosis mitral ya no clasifica** —sus cuatro filas declaran que el corte
nativo no aplica— y el **recuadro Doppler aórtico ya no publica «Severa (≤1.0cm²)»**. Mover un
corte NATIVO no mueve ninguno de los dos; mover la lógica de esas dos superficies sí toca la
nativa, porque el mismo código la pinta.

## Constantes de cortes y bandas → `docs/mapa/valvulas-constantes.md`

Los cortes de las cuatro válvulas, los de prótesis, las tres tablas de bandas de plausibilidad y
sus dueños. **Se sacó a archivo propio el 2026-10-14**, cuando este mapa cruzó el techo de 35 KB
con el puntero de la tanda D2: era el bloque más grande y el más autocontenido —son números con su
fuente, sin cableado— así que partir por ahí no corta ninguna explicación por la mitad.

⚠️ **Mover un corte mueve lo que lo lee.** Antes de tocar uno, mirar qué función lo consume en
este mismo archivo: varios los comparten dos lesiones, y la estenosis mitral los comparte además
con el Laboratorio (ver `laboratorio-estenosis-mitral.md`).

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

---

## La VISTA 2D de las válvulas → `docs/mapa/vista-2d-valvulas.md` (Y1, 2026-10-15)
## El panel EN LÍNEA de esa vista → `docs/mapa/vista-2d-en-linea.md` (Y1c, 2026-10-16)

Al pie de esta pantalla, debajo de las ocho pestañas de válvula, hay un botón **«Ver en 2D»**
(`#v2d-abrir`) que **prende y apaga** —con el mismo texto siempre, gris como una pestaña en reposo
y azul como una pestaña activa— un panel **EN LÍNEA**, debajo del propio botón, con un esquema
animado del corazón, dos columnas de tarjetas y una tabla de cavidades.

⚠️ **DESDE EL Y1c YA NO ES UNA VENTANA FLOTANTE** y no hay botón de cerrar, ni fondo tenue, ni
Escape, ni cierre al tocar fuera. **Y se apaga solo** al salir de Válvulas, al limpiar y por
`RECALC_MODULOS`, así que no puede quedar publicando el paciente anterior.

**Es SOLO LECTURA**: no calcula ningún grado, no mueve ningún corte, no escribe un campo y no toca
el informe, el PDF, el PPT, el Excel ni el Laboratorio. Todo lo que muestra sale de **`v2dEstado()`**,
el lector único, que junta lo que esta pantalla ya publicó — incluidas **las pastillas de severidad**,
que son las dueñas del grado y del color de cada tarjeta.

⚠️ **TOCAR UNA PASTILLA O UN GRADO DE ESTA PANTALLA MUEVE LA VISTA 2D**, y al revés no: la vista no
escribe nada. El mapa de arriba tiene la tabla completa de qué nodo alimenta cada cosa.

---

## → La tanda «VAL» (2026-10-17) vive en `docs/mapa/valvulas-val.md`

Lo que esa tanda movió en esta zona, en una línea cada uno:
- **Estenosis tricuspídea:** el gradiente medio pasa a `> 5` mmHg ESTRICTO, el **THP deja de votar**
  y es un signo de APOYO, el veredicto **nombra el criterio que decide** (área → gradiente → VTI)
  y entra un aviso de texto con insuficiencia tricuspídea mayor que leve. La cita del cuadro pasa
  de «ESC/EACTS 2021» a **2025**.
- **Estenosis aórtica:** el **1,50 cm² EXACTO es MODERADA** (`AVA_MOD_MAX`, del que se deriva
  `EA_BANDAS.avaSinMin`). El borde de 1,0 se verificó y **no se tocó**.
- **Insuficiencia aórtica:** la fracción regurgitante es severa con **más** de 50 %.
- **Insuficiencia mitral:** la onda E apoya con **más** de 120 cm/s, el **cociente VTI se retira
  desde la IAo moderada** —y con eso se fue la salvedad de la divergencia— y el **jet/AI gana su
  fuente** (ACC/AHA 2020, Tabla 17, folio e121) sin mover un número.
- **Referencias:** el texto general de integración, al final de la sección de válvulas nativas.

Cada corte con su tabla, su folio impreso y su hoja del PDF está en `docs/fuentes/FUENTES.md` →
«La tanda VAL». Lo declarado y no tocado, en `docs/PENDIENTES.md` → VAL-1 a VAL-8.

---

## Las prótesis TRICÚSPIDE y PULMONAR — tanda «PRO-C» (2026-10-17)

Las dos tienen veredicto protésico propio desde el 17/10/2026: **`docs/mapa/protesis-tri-pulm.md`**.
Lo que importa desde acá: `calcET` y `calcVP` **no cambiaron** —su fila de severidad sigue
diciendo `PROT_SIN_GRADO_TXT`— y el veredicto vive en `#bloque-prot-vt-res` y
`#bloque-prot-vp-res`. La **estenosis tricuspídea NATIVA no se tocó** (sus cuatro cortes, su
operador y su veredicto binario siguen en `ET_CRIT`), y la **regurgitación de las dos tampoco**:
las Tablas 21 y 16 de la ASE 2024 coinciden con lo que la app ya aplica.
Tres campos nuevos, visibles sólo con prótesis y sin columna de Excel: `et_e_vmax`,
`vp_tipo_prot` y `ep_gmedio`.
