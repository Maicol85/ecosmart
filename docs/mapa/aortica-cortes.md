# Mapa — los CORTES de la estenosis aórtica, variable por variable

Mapa de la tanda del **2026-10-13**. Sacado de `docs/mapa/valvulas.md`, que ya estaba en 33 KB.
Está por **nombre de función y de constante**, no por número de línea: la línea cambia en cada
edición, el nombre no.

**Los cortes con su guía y su folio NO están acá**: están en `docs/fuentes/FUENTES.md` →
«Estenosis AÓRTICA — los cortes por variable y por grado». Acá está el **comportamiento**.

---

> ⚠️ **ESTE MAPA ES DE LA VÁLVULA NATIVA.** Con morfología protésica —biológica, mecánica o
> TAVI— la aórtica se gradúa con la **Tabla 5 de la ASE 2024** y no con nada de acá, y desde la
> tanda **W2-B** (2026-10-15) el recuadro Doppler **deja de publicar el badge del corte absoluto
> de AVA** y la app calcula el **PPM** con la Tabla 7. Todo eso está en
> `docs/mapa/protesis-valvular.md`.

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

### El cuadro de referencias de la pestaña VÁLVULAS — el AVA indexada con su grado (F2, 2026-10-15)

Son **dos cuadros distintos** y conviene no confundirlos: `ao-ref-*` es el del **Doppler** —once
filas, cada una con su grado desde el 2026-10-13— y `ea-det-*` es el de **Válvulas**, dentro de
`bloque-ea-detalle`. Este último publicaba sus cinco filas **sin grado**.

| nodo | qué publica | ¿grado? |
|---|---|---|
| `ea-det-gmax` | G. máximo (4×Vmax²) | no — **no es criterio**, no vota |
| `ea-det-gmedio` | G. medio | **no, y vota** → auditoría |
| `ea-det-ava` | AVA continuidad | **no, y vota** → auditoría |
| `ea-det-avai` | AVA indexada | **sí, desde esta tanda** |
| `ea-det-dvi` | DVI | **no, y vota** → auditoría |
| `ea-det-sev` | ⚖️ Severidad EA — el renglón integrado | es el veredicto, y desde hoy dice **por qué** |

**`eaAvaiGradoPintar()`** es el dueño del grado de esa fila. Lee `eaGradoCalculado().gAvai` —el
mismo dueño único que vota— y escribe un `<span class="calc-grado" data-grado-de="ea-det-avai">`
**hermano y sin `id`**, el patrón de las nueve filas de la IM y las cuatro de la IAo. Tres
columnas: `_eaDetCuentaPura` (las dos ramas), `limpiarCampos` y `RECALC_MODULOS`.

**`_eaPorCriterio(R)`** devuelve `' — por ' + R.criterio` y lo usan las **tres** ramas que
escriben `ea-det-sev`. Las palabras son las de `R.criterio`, que es lo que `_eaBadgeAuto` ya
imprime detrás de «por »: `velocidad` · `gradiente` · `AVA` · `DVI` · `AVA por planimetría` ·
`AVA indexada`.

⚠️ **NO LO DICE CON «sin estenosis» NI CON «esclerosis» NI CON EL GRADO EN `null`.** «Sin
estenosis — por velocidad» se lee como si la velocidad hubiera afirmado algo, y la rama de «AVA
no valuable» es la que TC-344 fija: tiene que seguir diciendo eso y nada más.

⚠️ **LA RAMA DE BAJO GRADIENTE NO LLEVA SUFIJO**: reemplaza `sev` por «Severa por AVA ⚠️ bajo
gradiente», que ya nombra su criterio.

⚠️ **CON PRÓTESIS LA FILA NO PUBLICA NINGÚN GRADO**, y es el defecto **W1-4** que la tanda W2-B
cerró en el recuadro de al lado: los cortes del AVA indexada son de válvula NATIVA y la Tabla 5
de la ASE 2024 no publica ningún corte absoluto de área en prótesis. El predicado pasó a tener
un solo dueño, **`_eaEsProtesisAo()`**, extraído tal cual de `_eaPintarRecuadroDoppler`.

⚠️ **EL VALOR SE MUESTRA REDONDEADO A DOS DECIMALES Y EL GRADO SE DECIDE SOBRE EL ÍNDICE SIN
REDONDEAR.** Es herencia de `_eaCritAvai` y de la fila gemela del Doppler, que hace exactamente
lo mismo desde el 13/10; en una ventana de un centésimo alrededor del corte el número impreso
puede quedar del otro lado del que el grado afirma. Declarado, no corregido: `PENDIENTES.md`.

⚠️ **EL CARTEL `ea-ava-badge` NO SE ACORTÓ.** Lo único que se superpone con el renglón nuevo es
su primera cláusula; su contenido —la enumeración criterio por criterio con el valor y el grado
de cada uno— no está en ninguna otra superficie, y el mismo texto lo comparten los estados de
prótesis y de fuera de banda.

---

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

---

## El BORRADO del renglón integrado y las CINCO filas con su grado — tanda «Z» (2026-10-15)

### El defecto, como se midió

El médico reportó que la línea integrada de Válvulas **depende del orden en que se borra**.
Reproducido ANTES de tocar nada, con **teclas reales**, en las **seis permutaciones** de borrado
por los **dos gestos** —dígito por dígito y seleccionando todo— sobre su escena (Ø TSVI 20 · VTI
TSVI 20 · VTI Ao 56, que da AVA 1,12 cm² y DVI 0,357):

| | vuelven a «sin dato» |
|---|---|
| HEAD | **0 de 12** |
| hoy | **12 de 12** |

**Y es peor que lo reportado.** El borrado dígito a dígito pasa por un AVA de **0,11 cm²** —el «2»
de «20»— y la línea se congela en **«Severa — por AVA» sobre un formulario VACÍO**. El grado del
`<select>`, la pastilla y el EN SUMA **ya volvían solos**; lo que mentía era la pantalla.

⚠️ **NO ES UN DEFECTO DE LA TANDA F.** Medido también contra el árbol anterior (`0963d53`): las
doce quedan igual de congeladas. Lo que el F agregó fue el sufijo «— por X», que hace el síntoma
**más afirmativo** —«Severa» pasó a «Severa — por AVA»— pero no lo creó.

### La causa, con nombre

`calcEADetalle` tiene **tres** ramas —`if (vmax)`, `else if (ava)`, `else if (_RCalc.grado)`— y
**no tenía `else`**: con los tres vacíos nadie reescribía `ea-det-sev`. Y la función corre **dentro
de la compuerta de `calcAo`**, que deja de pasar justo cuando se borra el último dato.

### ⚠️ POR QUÉ NO ALCANZA CON EL `else`, Y DE DÓNDE SALE `eaSevVacioSync`

`calcEADetalle` **no se puede agregar a las puertas del gesto** (`eaParEditado`,
`tsviDiamEditado`). Está **medido y declarado** en el comentario de `tsviDiamEditado`:

- **puesta DESPUÉS** de `calcAo`, le **pisa el badge** a `_eaRetirarGradoSugerido`, que corre
  última en su cola a propósito porque es el único lugar que SABE que hubo retiro;
- **puesta ANTES**, el retiro **no llega a actuar**: su guarda es
  `sel.value !== sel.dataset.sugerido` y `calcEADetalle` ya reescribió las dos cosas.

Y **TC-432 verifica esa prohibición** sobre el texto de las dos funciones.

De ahí **`eaSevVacioSync`**, un dueño chico que corre desde `_eaDetCuentaPura` —la mitad PURA, que
**sí** corre en las dos puertas— y hace **una** sola cosa:

```
eaSevVacioSync()  ->  con PROTESIS se abstiene (ese renglon lo escribe _eaProtPintar)
                      sin Vmax, sin AVA por continuidad y sin grado calculado -> escribe «—»
                      en cualquier otro caso devuelve false y no toca nada
```

⚠️ **TOCA EL RENGLÓN Y NO EL BADGE.** El badge tiene **tres** dueños —el retiro,
`clasificarEA_Vmax` y `sugerirSeveridadEA`— y escribirlo desde acá reintroduciría exactamente el
defecto de arriba. El `else` nuevo de `calcEADetalle` **sí** lo escribe, porque allí ya corre
después de la cola de `calcAo`, que es donde HEAD lo pone.
⚠️ **Y SÓLO ACTÚA CON LA PANTALLA COMPLETAMENTE VACÍA.** Con un insumo fuera de banda hay grado o
hay valor, así que no entra y el aviso se conserva — con su texto **letra por letra** el de la
rama de arriba.

### Las CINCO filas con su grado

La auditoría **F8** midió tres filas que publican un criterio que VOTA sin mostrar su grado, y un
criterio que votaba **sin tener fila**. Hoy las cinco salen del MISMO mapa y del MISMO dueño:

```
EA_FILA_GRADO = { 'ea-det-gmedio':'gGrad', 'ea-det-ava':'gAva', 'ea-det-avai':'gAvai',
                  'ea-det-plan':'gPlan', 'ea-det-dvi':'gDvi' }   ->  eaGradoCalculado()
```

**`eaAvaiGradoPintar` conserva su nombre** aunque ahora pinte cinco: está en `RECALC_MODULOS` y en
los tres sitios de llamada de `_eaDetCuentaPura` y `calcEADetalle`.

**NINGÚN CORTE SE MOVIÓ.** Medido por sus bordes:

| Criterio | bordes |
|---|---|
| G. medio | 19 **sin grado** · 20 moderada · 39 moderada · 40 severa |
| AVA planimetría | 0,90 severa · 1,00 severa · 1,40 moderada · 1,50 **sin grado** |

⚠️ **«sin estenosis» NO SE IMPRIME COMO GRADO DE UNA FILA.** `gAva` vale `'sin'` con un área
normal, y «(sin estenosis)» al lado de «3.20 cm²» afirma un veredicto que la fila no da: un AVA
normal no distingue entre no tener estenosis y tenerla leve, que es por lo que la etiqueta del
renglón integrado lleva los **dos** nombres. Vacío es la abstención.
⚠️ **EL GRADO VA EN UN `<span>` HERMANO SIN `id`**, el patrón del F: `TC-436` compara el
`textContent` de `ea-det-avai` por igualdad **EXACTA**, y sin `id` el barrido de `limpiarCampos`
no le escribe «—» donde la regla pide blanco.

### ⚠️ UNA CONTRADICCIÓN QUE ESTA TANDA HACE VISIBLE Y NO CREA

Con esa escena más G. medio 30 y planimetría 0,90, el renglón dice **«Moderada — por AVA por
planimetría»** mientras el `<select>` y el informe dicen **severa** y la fila de la planimetría
ahora publica **(severa)**. **Medido IDÉNTICO en HEAD**: la rama `else if (ava)` etiqueta por la
banda del AVA **por continuidad** y le pega el sufijo del criterio **global**. Lo que el Z cambia
es que ahora se **ve**. No se corrigió: es el texto que la línea publica en un estado cargado, y
esta orden no lo autoriza. `docs/PENDIENTES.md` → **Z3-1**.

### El barrido de las otras filas y de las demás válvulas

A/B contra HEAD, cargando y borrando un dato por válvula: **lo único que quedaba fijo con un
veredicto rancio era la línea y el badge de la aórtica**, y hoy vuelven los tres insumos (Vmax,
gradiente medio y planimetría). Los tres residuos que quedan son **idénticos en HEAD** y **no son
veredictos**: `ea-sev` pasa de «—» a su texto explicativo («— sin Vmax ni gradiente medio
cargados»), e `im-discordancia` e `it-discordancia` de «—» a cadena vacía.

---

---

## El DVI sin el diámetro y el renglón integrado que nombra su criterio — tanda «Z5» (2026-10-15)

Cierra **Z3-1** y **Z3-2**. Lo de la prótesis **mitral** y el **PPM** vive en
`docs/mapa/protesis-valvular.md`.

### 1 · El DVI se publica con los dos VTI, sin el diámetro

| Pieza | Dueño | Nota |
|---|---|---|
| la cuenta y los dos nodos | el `if (itsvi && itvao)` propio dentro de `_eaDetCuentaPura` | antes compartía el `if` del AVA |
| la banda | `_eaDetDviDud` (los **dos VTI**) | el diámetro ya no entra en la cuenta |
| el criterio que vota | `_eaCritDvi()` | **ya votaba sin el diámetro**, y eso era el síntoma |
| la referencia nativa | `EA_DVI_SEV_MAX` 0,25 · `EA_DVI_MOD_MAX` 0,50 | ESC/EACTS 2025 f. 4663 · EAE/ASE 2009 Tabla 3 |
| la referencia protésica | `EA_PROT_CRIT.savr_dvi_*` vía `_eaDviProtNivel()` | ASE 2024, Tabla 5 |
| las palabras protésicas | `EA_DVI_PROT_TXT` | `sin criterios` / `posible` / `significativa` |

⚠️ **EL SÍNTOMA ERA PEOR QUE UNA FILA VACÍA.** Medido en HEAD: sin el diámetro la fila publicaba
**«— (moderada)»**, o sea un GRADO sin número, porque `_eaCritDvi` no necesita el diámetro y
`eaAvaiGradoPintar` sí lo publicaba. Las dos mitades del mismo cálculo, en la misma fila.

⚠️ **SE ELIGIÓ LA SALIDA (a) DE `PENDIENTES.md` Y NO LA CONSERVADORA**, que es la que la orden
autoriza: se despega también `ea_dvi_display`, que viaja en `campos` y es la **segunda** fuente que
lee `eaProtVeredicto`. **Escenas que cambian de veredicto en la prótesis: NINGUNA**, medido en las
ocho de la tabla — `dvi-val`, que `calcAo` escribe sin diámetro, se lee **primero** y ya estaba
poblado. Lo que cambia es que las dos superficies dejan de contradecirse.

⚠️ **LAS PALABRAS DE LOS DOS REGÍMENES SON DISTINTAS A PROPÓSITO.** En nativa el DVI gradúa una
**severidad** («moderada», «severa») y en prótesis declara un **nivel de sospecha**, que es lo que
la Tabla 5 publica. Traducir uno al vocabulario del otro diría que una prótesis tiene estenosis
«severa», que es la escala que el W2-B retiró de esta pantalla. **Medido: el mismo 0,36 es
«(moderada)» en nativa y «(sin criterios)» en prótesis.**

⚠️ **CON PRÓTESIS SÓLO LA FILA DEL DVI PUBLICA REFERENCIA.** Las otras cuatro siguen mudas: la
Tabla 5 no da cortes absolutos de AVA ni de AVA indexada para una prótesis —es el defecto W1-4 que
el W2-B cerró en el badge de al lado— y el gradiente medio protésico lo publica el veredicto.

### 2 · El renglón integrado dice el grado que de verdad se publica

La rama `else if (ava)` de `calcEADetalle` —la que corre **sin Vmax**— armaba la etiqueta con la
banda del AVA por **continuidad** (`avaEsModerada(avaR)`) y le pegaba el sufijo del criterio
**global** (`_eaPorCriterio(_RCalc)`), que es otro.

| escena (sin Vmax) | HEAD | hoy |
|---|---|---|
| planimetría severa + continuidad moderada | «Moderada — por AVA por planimetría» | **«Severa — por AVA por planimetría»** |
| planimetría severa + continuidad severa | «Moderada — por AVA por planimetría» | **«Severa — …»** |
| planimetría moderada + continuidad moderada | «Moderada — por gradiente» | idéntica |
| sin planimetría | «Moderada — por gradiente» | idéntica |

Hoy la etiqueta sale de `gradoStr`, que es `_RCalc.grado`, igual que la rama con Vmax.
**Ningún corte se movió, la regla del peor no se tocó y el grado publicado es el mismo** (el
`<select>` queda en severa en las dos escenas que cambian, igual que en HEAD).

⚠️ **LO QUE NO SE TOCÓ: que dos FILAS discrepen entre sí.** El aviso de discordancia existe y se
queda; TC-480 lo fija como control negativo —la fila del AVA sigue diciendo «(moderada)»—. El
error era una línea que nombra un criterio y le pone el grado de **otro**.

⚠️ **LAS DOS ETIQUETAS PROPIAS DE LA RAMA SE CONSERVAN**, y ninguna es decorativa:
- **«Sin estenosis / leve»** lleva los dos nombres porque un AVA normal no distingue entre no tener
  estenosis y tenerla leve; va en verde, su color de siempre.
- **«AVA no valuable»** es el fail-closed del AVA que redondea a 0, que **además retira el grado**.
  Esa abstención sigue definida por la banda del AVA por continuidad (`_avaNoValuable`, la misma
  condición escrita por su complemento), porque es la validez de **ese** número lo que falla.

⚠️ **Y LO QUE ARREGLÓ EL Z3 NO SE ROMPIÓ**: la línea vuelve a «sin dato» en **12 de 12** órdenes y
gestos de borrado, medido con los dos gestos y las seis permutaciones.

---

## El DVI protésico, por UN solo camino (Z6-3b, 2026-10-15)

`_eaDviProtNivel()` —la función que escribe el grado hermano de la fila `ea-det-dvi` con prótesis—
**recalculaba el cociente por su cuenta** (`_eaCritDvi()` sobre los dos VTI crudos) mientras el
**veredicto** (`eaProtVeredicto`) lo lee del número que `calcAo` ya publicó en `dvi-val`. Era la
entrada **Z5-5** de `PENDIENTES`.

**Los dos caminos DISCREPABAN, y está medido:**

| VTI TSVI / VTI Ao | crudo | publicado | FILA (antes) | VEREDICTO | FILA (hoy) |
|---|---|---|---|---|---|
| 20 / 56 | 0,35714 | 0.36 | sin criterios | normal | sin criterios |
| 20 / 70 | 0,28571 | 0.29 | posible | posible | posible |
| 20 / 90 | 0,22222 | 0.22 | significativa | signif | significativa |
| **20 / 56,4** | **0,35461** | **0.35** | **sin criterios** | **posible** | **posible** |
| **20 / 57** | **0,35088** | **0.35** | **sin criterios** | **posible** | **posible** |
| TAVI, 20 / 70 | 0,28571 | 0.29 | posible | — | posible |

El corte es `> 0,35` **estricto**, así que el crudo lo supera y el publicado no: la fila y el
veredicto se contradecían en el mismo cuadro. Hoy el dueño es `eaProtVeredicto`, que devuelve el
**nivel ya clasificado** (`dviNivel`), y la fila lo lee de ahí. Se clasifica el número **publicado**,
que es la regla de la casa desde el AVA de 1,00.

⚠️ **SE ELIGIÓ ESE SENTIDO Y NO EL CONTRARIO.** Hacer que el veredicto llame a `_eaCritDvi()`
cambiaría el **veredicto**, que es contenido clínico y está fuera de esa orden; así, lo único que
puede moverse es el texto de la fila.
⚠️ **EL CAMPO VIVE EN LAS DOS VÍAS, SAVR Y TAVI.** En la TAVI `niveles` **no** tiene `dvi` —su bloque
general son la velocidad pico, el AT y el AT/ET—, así que leer `P.niveles.dvi` habría dejado la fila
**muda en toda TAVI**: una pérdida silenciosa. Por eso el nivel viaja aparte.


---

## La fila de la VELOCIDAD PICO en el cuadro — «Y2b» (2026-10-16)

Cierra la mitad de **F8** que el AVA por planimetría había dejado abierta en el Z: la Vmax vota el
grado integrado —el renglón puede decir «Severa — por velocidad»— y era el **último criterio que
graduaba sin tener fila en este cuadro**. El criterio que decidía era el único invisible.

- **`ea-det-vmax`**, primera fila del `calc-box`, arriba del G. máximo, porque ése deriva de ella.
- El **valor** lo escribe `_eaDetCuentaPura` con el mismo `vmax` que esa función ya elegía —el
  campo de Válvulas con el del Doppler de respaldo— y con el mismo formato que `_eaBadgeAuto`
  publica: `«4.5 m/s»`.
- El **grado** sale de **`EA_FILA_GRADO`**, que pasa de **cinco entradas a seis**:
  `'ea-det-vmax': 'gVel'`. Es el grado que `eaGradoCalculado` ya publicaba en el badge.
- El grado va en el `<span>` hermano **sin `id`**, por las dos razones de las otras cinco filas.

**NINGÚN CORTE NUEVO.** Medido por los ocho bordes de la banda: 2,49 / 2,50 / 2,51 **sin grado**
—es `'sin'`, y «sin estenosis» no se imprime como grado de una fila—, 2,99 leve, 3,00 y 3,99
moderada, 4,00 y 4,01 severa. En las ocho, la fila publica exactamente `gVel`.

**La lista «Ver criterios» de la vista 2D la LEE**, como lee a las otras cinco: su entrada en
`V2D_PORQUE['esten:aortica']` es `{ id:'ea-det-vmax', color:true }` y va primera. No se inventa
ninguna fila en la tarjeta — eso era justamente lo que no se podía hacer.

⚠️ **CONTROL NEGATIVO, medido:** con la Vmax en 3,2 (moderada) y el gradiente en 45 (severa), la
fila publica «moderada» y el renglón integrado sigue diciendo «Severa — **por gradiente**». La fila
muestra su grado y **no** se lleva la marca de «decide».

**Caso adaptado:** TC-479, cuyo denominador exigía cinco entradas en `EA_FILA_GRADO`.
