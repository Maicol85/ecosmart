# Inventario de las siete pestañas que «Según el estudio» conecta — PANT-14, commit 4a

**SOLO LECTURA.** No propone cambios: es la medición que los commits 4 a 6 usan. Todo lo de acá
se midió en el navegador con `scripts/_probe_pant14inv.mjs` (que no escribe ningún campo) sobre
el árbol de PANT-13 (sello `v20261105-0008`, md5 `00825a73`).

---

## 0. Qué significa «cargada» — el dueño único

**No se escribió ningún predicado nuevo.** La pregunta se le hace a **`_CC_SECS`**, el registro
del Laboratorio, que ya es el dueño único de «esta lesión está cargada en el estudio»: lo usan el
filtro de cohorte, las tarjetas del Laboratorio y la propia línea de «cargadas y no dibujadas» de
este módulo. El helper nuevo es `_cmSecsOn()`, que arma el **mismo** objeto `inf` que
`cc3dNoDibujadas` —el mismo barrido y la misma exclusión de `_noEsDelEstudio`—: dos formas de
armarlo serían dos denominadores.

| lesión | clave en `_CC_SECS` | predicado medido |
|---|---|---|
| Fallot reparada | `tdf` | `tdf_func_vd` ≠ '' **o** `tdf_grad_tsvd` ≠ '' |
| Coartación | `coa` | `coa_loc` ≠ '' **o** `coa_istmo` ≠ '' |
| Estenosis subaórtica | `esub` | `esub_tipo` ≠ '' **o** `esub_gradiente_medio` ≠ '' **o** `esub_gradiente_mmhg` ≠ '' |
| Estenosis supravalvular aórtica | `easv` | `easv_tipo` ≠ '' **o** `easv_gradiente_medio` ≠ '' **o** `easv_gradiente_mmhg` ≠ '' |
| Defecto del septo AV | `dsav` | `dsav_tipo` ≠ '' **o** `dsav_regurg_av_izq` ≠ '' |
| Anomalía de Ebstein | `ebs` | `ebs_desplazamiento` ≠ '' **o** `ebs_area_vd_atrial` ≠ '' |
| Circulación de Fontan | `fontan` | `fontan_tipo` ≠ '' **o** `fontan_vs_fevi` ≠ '' **o** `fontan_saturacion` ≠ '' |
| **Estenosis pulmonar** | **no tiene entrada** | — ver § 3 |

⚠️ **La estenosis pulmonar NO ESTÁ en `_CC_SECS`**, censado el registro entero (19 entradas). Es
la única de las siete sin dueño en ese registro, así que su predicado hay que escribirlo, y eso
tiene su propia trampa (§ 3).

**Control medido**, con la forma vacía y con cada campo definitorio cargado de a uno: los cuatro
predicados con `hayDatos` (`esub`, `easv`, `dsav`, `fontan`) dan `false` vacíos y `true` con su
campo; `ebsConclusion()`, `tdfConclusion()` y `coaConclusion()` **devuelven `null`** con la forma
vacía y un objeto con datos.

⚠️ **Y `tdfConclusion()` DEJA DE SER NULA CON SÓLO UNA VELOCIDAD PULMONAR CARGADA**, medido: lee
`vp_gmax`, que es el espejo de `ep_vmax`. Por eso el predicado de la Fallot **no** puede ser «su
conclusión no es nula»: se usa el de `_CC_SECS`, que mira dos campos propios de la sección.

---

## 1. Tetralogía de Fallot reparada — pestaña «C. Congénitas» → «CC complejas»

**16 campos.** Valor sin tocar: **todos vacíos** (los selectores tienen opción 0 vacía).

| id | tipo | rótulo | va al dibujo |
|---|---|---|---|
| `tdf_func_vd` | select — / normal / leve / moderada / severa | Función del VD | **predicado de «cargada»** |
| `tdf_grad_tsvd` | texto | Gradiente TSVD (mmHg) — si difiere del transvalvular | **predicado de «cargada»** |
| `tdf_civ_residual` | select — / no_eval / no / si | CIV residual | casilla **`rciv`** con `si` |
| `tdf_ep_stent` | select — / no_eval / no / si | Estenosis pulmonar nativa o stent | casilla **`rest`** con `si` |
| `ip_grado` *(de Válvulas)* | select Sin insuficiencia / Leve / Moderada / Severa | IP — grado | casilla **`ip`** con cualquier grado ≠ «Sin insuficiencia» |
| `tdf_vtdvdi`, `tdf_vtsvdi`, `tdf_vol_fuente` | texto / select | volúmenes del VD indexados y su método | **nada** — ver abajo |
| `tdf_sintomas`, `tdf_ejercicio`, `tdf_civ_grad` | select / texto | clínica y gradiente de la CIV | nada |
| `tdf_ip_ro`, `tdf_it_ro`, `tdf_psvd_ro`, `tdf_tsvd_ro` | texto **solo lectura** | espejos de Válvulas y VD/AD | **nada: son espejos** |
| `tdf_tv` | select solo lectura | arritmia ventricular (bloque compartido) | nada |
| `tdf_incluir_chk` | casilla | «Integrar al informe» | nada |

**La variante se fija en «Operado» sin preguntar**, y es la única del módulo que se fija sin dato:
la pestaña es la de la Fallot **reparada** y no tiene ningún campo que diga si se operó. Así que
**«Fallot sin operar» no se dibuja nunca desde el estudio**: queda sólo en «Explorar».

⚠️ **La cuarta casilla del módulo, «VD dilatado» (`rvd`), QUEDA PARADA.** Ningún campo de la
pestaña dice que el VD esté dilatado: `tdf_func_vd` es la **función** y `tdf_vtdvdi` un **volumen**
cuyo umbral (160 ml/m², ESC 2020) es un criterio clínico. Elegir un umbral para encender una
casilla del dibujo no está en la orden → `docs/PENDIENTES.md`, **P14-b**.

---

## 2. Coartación de aorta — pestaña «C. Congénitas» → «CC frecuentes»

**11 campos.** Valor sin tocar: todos vacíos.

| id | tipo | rótulo | va al dibujo |
|---|---|---|---|
| `coa_situacion` | select — / nativa / recoartacion / post_stent / post_cirugia | situación | **define la variante**: `nativa`→`nat`; las otras tres→`rep` |
| `coa_loc` | select — / preductal / yuxtaductal / posductal | localización | **predicado de «cargada»** |
| `coa_istmo` | texto | Diámetro del istmo (mm) | **predicado de «cargada»** |
| `coa_vmax`, `coa_gmedio`, `coa_gradiente_picopico`, `coa_estenosis_relativa` | texto | gradientes y estenosis relativa | nada |
| `coa_hta`, `coa_diast_anterogrado` | select / casilla | hipertensión y flujo diastólico anterógrado | nada |
| `coa_ao_asc_ro` | texto **solo lectura** | espejo de la aorta ascendente | **nada: es espejo** |

**La casilla «Recoartación» (`rec`) se enciende sólo con `recoartacion`**, que es la única de las
tres opciones de reparada que lo afirma.

⚠️ **Cargada SIN la situación NO SE DIBUJA**, y la línea lo dice: el registro la cuenta por
`coa_loc` o `coa_istmo`, así que un estudio puede tener la coartación cargada sin decir si es
nativa o reparada. Es la regla de «lo que la pestaña no tiene no se inventa», y es el control
negativo que la orden pide. Medido: `omitidas = ['coa']` y la línea publica «coartación (falta
consignar si es nativa o reparada)».

⚠️ **Las otras dos casillas del módulo QUEDAN PARADAS**: «Colaterales» (`col`, en la nativa) y
«Aneurisma» (`ane`, en la reparada). La pestaña no tiene campo para ninguna de las dos —
`coa_diast_anterogrado` es un signo de significación, no colaterales → **P14-b**.

---

## 3. Estenosis pulmonar — pestaña «Válvulas»

**7 campos**, y acá está la trampa de la lección (n) de la orden.

⚠️ **TRES de sus campos NO ESTÁN VACÍOS SIN TOCAR**, medido:

| id | valor sin tocar | opciones |
|---|---|---|
| `ep_nivel` | **«No especificado»** | No especificado / Valvular / Subvalvular (infundibular) / Supravalvular / Ramas pulmonares / Mixto |
| `ep_etiologia` | **«No especificada»** | No especificada / Congénita valvular / Displasia (Noonan) / Supravalvular (Williams) / Carcinoide / Post-quirúrgica… |
| `ep_grado` | **«sin»** | sin / Leve / Moderada / Moderada-severa / Severa |
| `ep_vmax`, `ep_gmedio` | vacío | — |
| `ep_gmax` | vacío, **solo lectura** | derivado de 4·V² |

Sus opciones **no llevan atributo `value`**: el valor es el texto. Así que un predicado
`ep_nivel !== ''` daría **verdadero en todos los estudios** — el defecto que `_CC_SECS` documenta
para `fop_acv` y para `pericardio`.

**Mapa al dibujo** (variantes del módulo `valv` / `sub` / `sup`):
`Valvular`→`valv` · `Subvalvular (infundibular)`→`sub` · `Supravalvular`→`sup` ·
`Ramas pulmonares`→`sup` (la variante del módulo se llama «Supravalvular o de ramas») ·
`Mixto`→**no tiene variante única**, no se dibuja y se lista · `No especificado`→ídem.

---

## 4. Estenosis subaórtica — pestaña «C. Congénitas»

**7 campos**, todos vacíos sin tocar. Es la variante **`sub`** del módulo (membrana).

| id | tipo | va al dibujo |
|---|---|---|
| `esub_tipo` | select — / membrana / tunel / noesp | predicado; **todas** las opciones caen en `sub` |
| `esub_gradiente_medio`, `esub_gradiente_mmhg` | texto | predicado |
| `esub_ia_asociada` | select — / no / leve / moderada / severa | casilla **`iao`** con cualquier grado ≠ «no» |
| `esub_longitud_mm`, `esub_valsalva` | texto / select | nada |
| `esub_incluir_chk` | casilla | nada |

## 5. Estenosis supravalvular aórtica — pestaña «C. Congénitas»

**7 campos**, todos vacíos sin tocar. Es la variante **`sup`** (reloj de arena).

| id | tipo | va al dibujo |
|---|---|---|
| `easv_tipo` | select — / reloj / difusa / membranosa / noesp | predicado; **todas** caen en `sup` |
| `easv_gradiente_medio`, `easv_gradiente_mmhg` | texto | predicado |
| `easv_williams`, `easv_coronarias`, `easv_estenosis_pulmonar` | select | nada |
| `easv_incluir_chk` | casilla | nada |

⚠️ **La supravalvular NO TIENE campo de insuficiencia aórtica asociada**, censado: el `iao` del
módulo para `sup` queda apagado siempre. La subaórtica sí lo tiene → **P14-b**.

⚠️ **Y `ea` ES UNA SOLA LESIÓN CON DOS VARIANTES**: con las dos secciones cargadas a la vez sólo
una se puede dibujar. Es un conflicto y se lista con su motivo.

---

## 6. Defecto del septo auriculoventricular — pestaña «C. Congénitas» → «CC complejas»

**10 campos**, todos vacíos sin tocar.

| id | tipo | va al dibujo |
|---|---|---|
| `dsav_tipo` | select — / parcial / completo / **intermedio** / noesp | **define la variante**: `parcial`→`par`, `intermedio`→`tra`, `completo`→`com`, `noesp`→sin variante |
| `dsav_regurg_av_izq` | select — / no / leve / moderada / severa | casilla **`iav`** con cualquier grado ≠ «no» |
| `dsav_regurg_av_der`, `dsav_down`, `dsav_htp`, `dsav_qp_qs`, `dsav_rvp_uw`, `dsav_dssd_mm` | select / texto | nada |
| `dsav_vi_ro` | texto **solo lectura** | **nada: es espejo** |
| `dsav_incluir_chk` | casilla | nada |

⚠️ **La opción de la pestaña se llama `intermedio` y la variante del módulo `tra` (transicional)**:
son el mismo tipo con dos nombres. `noesp` no tiene variante → no se dibuja y se lista.

---

## 7. Anomalía de Ebstein — pestaña «C. Congénitas» → «CC complejas»

**17 campos**, todos vacíos sin tocar. **Sin variantes** (el módulo usa `ebs_std`).

| id | tipo | va al dibujo |
|---|---|---|
| `ebs_desplazamiento`, `ebs_area_vd_atrial` | texto | predicado de «cargada» |
| `it_grado` *(de Válvulas)* | select 0 / 1 / 2 / 4 | casilla **`eit`** con cualquier grado ≠ «0» |
| `ebs_atrializacion`, `ebs_area_ad`, `ebs_area_vd_func`, `ebs_area_ai`, `ebs_area_vi`, `ebs_saturacion` | texto | nada |
| `ebs_func_vd`, `ebs_tsv`, `ebs_vias`, `ebs_sintomas`, `ebs_ejercicio`, `ebs_progresion` | select | nada |
| `ebs_it_ro`, `ebs_areas_ro` | texto **solo lectura** | **nada: son espejos** |
| `ebs_incluir_chk` | casilla | nada |

⚠️ **El grado de insuficiencia tricuspídea se lee de `it_grado`, su dueño, y NO del espejo
`ebs_it_ro`**: es la lección (m) de la orden. Y su centinela de «sin grado» es el **cero**, no una
frase, al contrario que `ip_grado`.

---

## 8. Circulación de Fontan — pestaña «C. Congénitas» → «CC complejas»

**18 campos**, todos vacíos sin tocar.

| id | tipo | va al dibujo |
|---|---|---|
| `fontan_tipo` | select — / tunel / extra / ap / noesp | **define la variante**: `extra`→`ext`, `tunel`→`tun`, `ap`→`atr`, `noesp`→sin variante |
| `fontan_fenestracion` | select — / sin / presente / cerrada | casilla **`fen`** sólo con `presente` |
| `fontan_vs_fevi`, `fontan_saturacion` | texto | predicado de «cargada» |
| `fontan_vs_fac`, `fontan_vs_morfologia`, `fontan_it_grado`, `fontan_clase_nyha`, `fontan_arritmia`, `fontan_derrame_pleural`, `fontan_ascitis` | texto / select | nada |
| `fontan_comp_*` (seis casillas) | casilla | nada |

⚠️ **La casilla de fenestración existe sólo en `ext` y `tun`** (`CM_BCK` no tiene `fon_atr`), que
es correcto: el Fontan atriopulmonar no lleva conducto fenestrado.

---

## 9. Lo que el dibujo tiene y la pestaña no, y al revés

**Variantes del dibujo SIN opción en ninguna pestaña:**
- `fal/sin` — «Fallot sin operar»: la pestaña es la de la reparada (por diseño).
- casillas `rvd` (Fallot), `col` y `ane` (coartación), `iao` de la supravalvular.

**Opciones de pestaña SIN variante en el dibujo:**
- `ep_nivel` = «Mixto» y «No especificado».
- `dsav_tipo` = «noesp».
- `fontan_tipo` = «noesp».
- `coa_situacion` vacía con la coartación cargada por otro campo.
- `esub_tipo` y `easv_tipo` = «noesp» **sí** se dibujan: las cuatro opciones de cada una caen en
  la misma variante, así que «no especificado» no impide elegirla.

## 10. Cómo se reparte la línea de lo no dibujado

`cc3dTextoSync` arma la línea con cuatro piezas, y las dos últimas las llena `cmDesdeEstudio`:
1. «Sin lesiones cargadas que dibujar…» / «Cargadas y no dibujadas todavía: …» — sale de
   `cc3dNoDibujadas`, que compara `_CC_SECS` contra `CC3D_DIBUJA`.
2. «Cargadas con una opción que el dibujo no distingue: …» — `_cm3d.omitidas`, con el mapa `ROT`.
3. «No se dibujan juntas — …» — `_cm3d.chocan`, que trae lo que `cmBloqueado` rechazó **y** las
   anatomías de base que perdieron por el orden de prioridad.

**Toda clave que `cmDesdeEstudio` pueda poner en `omitidas` tiene que estar en `ROT`**, o la línea
publica la sigla interna en vez del nombre de la lesión.
