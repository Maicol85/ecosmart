<!-- censo armado sobre 0d0d1f4, 2026-10-02; ver la nota sobre números de línea abajo -->

# Censo — grado calculado vs grado manual de la válvula aórtica

Insumo de la tanda «Aórtica 4» (grado calculado vs manual, aviso rojo, cajón «Fundamento del
ajuste», colores, apertura automática y campos del Doppler). **Nada de esto se implementó**: el
árbol estaba limpio en `0d0d1f4` cuando se midió y siguió limpio al escribirlo.

**Sobre los números de línea.** Los otros mapas no los guardan a propósito. Acá sí, porque este
documento existe para no repetir las lecturas, pero van **siempre al lado del nombre** de la función
o del id, que es lo que sobrevive a una edición. Si un número no coincide, grepear el nombre: el
número está medido sobre `0d0d1f4` y nada más. Vale la regla del CLAUDE.md — **antes de reabrir algo
por número de línea, mirar qué hay HOY en esa línea**.

Lo que no se verificó leyendo el cuerpo lleva `⚠️ no verificado: …`.

Todo lo de abajo se derivó del código. **No se corrió Chrome en esta sesión**: las causas de los
tres síntomas de §3 son predicciones desde el código, no mediciones en pantalla.

---

## §1 Bloque «Estenosis Aórtica — Datos del Doppler» (pestaña Válvulas)

Vive en `#bloque-ea-detalle`, que muestra y esconde `toggleValvPill('aortica','esten')`.

| Orden hoy | id | Tipo | Quién lo escribe | Listener |
|---|---|---|---|---|
| f1-1 | `ea_vmax` | number | médico | `oninput="syncEADesdeValvulas()"` |
| f1-2 | `ea_gmax_display` | text **readonly** | `calcEADetalle` | — |
| f1-3 | `ea_gmedio` | number | médico | `syncEADesdeValvulas()` |
| f1-4 | `ea_ava_display` | text **readonly** | `calcEADetalle` | — |
| f2-1 | `ea_vtitsvi` | number | médico | `syncEADesdeValvulas()` |
| f2-2 | `ea_vtiao` | number | médico | `syncEADesdeValvulas()` |
| f2-3 | `ea_dtsvi` | number | médico | `syncEADesdeValvulas()` |
| f2-4 | `ea_dvi_display` | text **readonly** | `calcEADetalle` | — |
| f3 | `va_at` | number | médico | `oninput="eaAtPintar()"`, dentro de `#bloque-prot-va` |

- **`tabindex`: cero ocurrencias en el bloque.** El orden de tabulación es el orden del DOM, así que
  reordenar los `div.fg` reordena el foco y no hay nada más que tocar.
- Los **cinco** campos tipeables comparten **el mismo** listener (`syncEADesdeValvulas()`), de modo
  que mover un `div.fg` completo no cambia ningún cableado.
- `va_at` va en su propia fila con su propio wrapper porque el tiempo de aceleración no es un
  parámetro de válvula nativa: lo muestra y lo esconde `valvProtSync`.
- **`ava_plan` / «AVA por planimetría»: cero ocurrencias en el archivo.** El id está libre. El de la
  mitral es `avm_plan`, que es otro campo y no se toca.
- Recuadro de resultados (`.calc-box`) del mismo bloque: `ea-det-gmax`, `ea-det-gmedio`,
  `ea-det-ava`, `ea-det-avai`, `ea-det-dvi`, `ea-det-at` + `ea-det-at-row` + `ea-det-at-nota`,
  `ea-det-sev` + `ea-det-sev-lbl` + `ea-det-sev-nota`.

---

## §2 Quién escribe cada display de severidad aórtica

| Display | Quién lo escribe | De dónde lee |
|---|---|---|
| `ea_grado` (select, Válvulas) | `calcEADetalle` (1 escritura), `clasificarEA_Vmax` (2), `sugerirSeveridadEA` (1), `_eaRetirarGradoSugerido` | Vmax / G. medio / AVA |
| `sevbtn-esten-aortica` (pastilla) | **sólo** `valvSev.refrescar` | `ea_grado.value` |
| `ea-det-sev` (recuadro de Válvulas) | `calcEADetalle` (22866) y `_eaProtPintar` (32958) | los cinco insumos, integrado |
| `ea-sev` (recuadro de la pestaña **Doppler**) | **`calcAo`** (escribe en 23504, vacía a `—` en 23555) | **el AVA por continuidad y nada más** |
| `ea-ava-badge` | `clasificarEA_Vmax`, `sugerirSeveridadEA`, `calcAo`, `_eaRetirarGradoSugerido` | — |

Declaraciones: `calcEADetalle` 22736 · `calcAo` 23412 · `clasificarEA_Vmax` 23599 ·
`sugerirSeveridadEA` 23702. Las **cuatro** escrituras de `ea_grado` están declaradas en el
comentario de 23225, y cada una llama a `_eaMarcarSugerido`.

**Los dos recuadros NO son dos vistas del mismo número**, y esto condiciona cualquier intento de
mostrar «el grado calculado» en los dos:

- `ea-det-sev` es el grado **integrado** (Vmax primario, AVA confirma).
- `ea-sev` es un badge de **AVA por continuidad sola**, con su propia cascada de cuatro ramas y los
  cortes impresos en el texto: «Sin estenosis / leve (≥1.5cm²)», «Moderada (>1.0-1.49cm²)», «Severa
  (≤1.0cm²)» y «AVA no valuable — revisá diámetro TSVI, ITV-TSVI e ITV-Ao». Su rama `else` lo deja
  en `—` cuando falta el Ø TSVI, el VTI TSVI o el VTI Ao.

Igualar los dos no es un refactor: hace desaparecer de la pestaña Doppler la lectura del AVA
aislada —que es un dato clínico distinto— y mueve de lugar textos que llevan los cortes escritos.

En la rama protésica, `_eaProtPintar` además **reetiqueta** `ea-det-sev-lbl` a «⚖️ Severidad EA
protésica (ASE 2024)» (32982) y lo devuelve a «⚖️ Severidad EA (ESC 2021)» (32996).

---

## §3 Los tres síntomas de pantalla, explicados desde el código

**(1) Con Vmax 4,1 el select dice «Severa» y la pastilla queda en «🟡 Severidad ▼».**
`valvSev.refrescar()` tiene exactamente **tres llamadores**: `aplicar()` (48820), `limpiar()`
(48839) y `refrescarTodo()` (48862, que corre al arrancar el DOM y desde `limpiarCampos`).
**Ningún camino automático la llama.** Y las cuatro escrituras automáticas de `ea_grado` asignan
`.value` **sin despachar `change` ni `input`** —a propósito, porque despachar borraría
`dataset.sugerido`—. O sea que el autocálculo no puede repintar la pastilla ni por evento ni por
llamada: la pastilla sólo se entera de un grado que el médico puso con el ▼.
La segunda mitad —`ea-sev` en `—`— es la rama `else` de `calcAo`: con Vmax 4,1 y sin Ø TSVI ni VTI
no hay AVA, y ese recuadro sólo sabe de AVA (§2).

**(2) Fijado a mano «Severa» con Vmax 2,6, el texto «Sugerido por Vmax 2.6 m/s» sigue ahí.**
El badge `ea-ava-badge` lo escribe `clasificarEA_Vmax`. `aplicar()` escribe el select y pone
`esqSevManual.ea`, pero **no toca el badge**; y en la corrida siguiente `clasificarEA_Vmax` sale
temprano por `if (esqSevManual.ea) return` (23626) **sin limpiarlo**, así que el texto queda
congelado de la medición anterior. El recuadro de abajo sigue en «Leve» porque `calcEADetalle` nunca
consulta la marca manual para sus textos.

**(3) Manual «Severa» y después Vmax 3,8: el informe sale «severa» sin aviso.**
Es la regla de precedencia vigente funcionando como está escrita: `esqSevManual.ea` bloquea a las
tres escritoras. Lo que no existe hoy es que un **cambio del grado calculado** suelte el manual, ni
ningún aviso de discrepancia.

---

## §4 El camino manual y la regla de precedencia

`valvSev.aplicar(tipo, valv, valor)` (48802): pone `esqSevManual[campo]` → `_sevManualSync()` → para
**estenosis** escribe `ea_grado.value` y despacha `change` + `input`; para **insuficiencia** escribe
`ia_sev_final` y despacha `change` (que dispara `_gradoManoBorraMarca` + `sincronizarGradoIA`) →
enciende la pastilla principal si estaba apagada → `refrescar()`.

- El `change` sintético de `aplicar()` **borra `dataset.sugerido`** vía `_gradoManoBorraMarca`
  (23253). Es inocuo porque `esqSevManual` ya se puso antes; está declarado en 23241-23252, con el
  motivo de por qué **no** se filtra por `isTrusted` (lo volvía inverificable desde el arnés).
- `valvSev.limpiar()` —apagar el botón principal— **resetea el grado**: `el.selectedIndex = 0` deja
  `ea_grado = 'sin'`, y borra `esqSevManual`. Conducta deliberada, documentada en 48689: el informe
  se arma desde el campo y no desde el estado del botón.
- `CAMPO` (48753) mapea `{insuf:{aortica:'ia_grado'}, esten:{aortica:'ea_grado'}}`.
  `INSUF_OPTS` (48758) ofrece **sólo** `1` Leve, `2` Moderada, `4` Severa.

Persistencia: el input oculto `#sev_manual` (3675) espeja `window.esqSevManual` y lo guarda con el
estudio (`_sevManualSync` / `_sevManualRestaurar`). **`dataset.sugerido` no se persiste**, y
`ea_grado` figura en `_MARCAS_DERIV` (58927) junto con `vp_gmax`, `ep_grado` e `ia_sev_final`.

El retiro fuera de banda: `_eaRetirarGradoSugerido` (23275) sale si `esqSevManual.ea`, si
`sel.value !== sel.dataset.sugerido` o si ningún insumo está fuera de banda; si retira, deja
`ea_grado = 'sin'` y reescribe `ea-ava-badge` nombrando los insumos. Insumos vigilados:
`EA_GRADO_INSUMOS` = `vmax_ao`, `gmedio_ao`, `itv_ao`, `itv_tsvi`, `diam_tsvi`, `ava_cont` (23213),
con sus rótulos en `EA_GRADO_ROTULOS`. El hermano de la IAo es `_iaRetirarGradoSugerido` (23309),
que retira a `'0'` y delega el hidden en `sincronizarGradoIA`. Fijado por TC-358…TC-362.

---

## §5 Insuficiencia aórtica — rótulos e ids

- Rótulo del select, textual: **«✅ Severidad IAo confirmada — irá al informe y PDF»** (3826).
- `ia_sev_final` (select visible), cinco opciones: `0` «— Sin insuficiencia / no evaluada», `1`
  Leve, `2` Moderada, `3` Moderada-severa, `4` Severa. Más el hidden `ia_grado` (3840), que copia
  `sincronizarGradoIA` (21787).
- Texto de ayuda: «Se completa automáticamente con la severidad calculada. Editable manualmente.»
  — **HTML estático, siempre visible**, sin id. Mostrarlo sólo en modo automático exige darle un
  nodo con id gobernado por JS.
- Recuadro calculado: `ia-sev`, rótulo «⚖️ Severidad IAo integrada (ESC 2021)», lo escribe
  `calcIA_ESC`. Más `ia-discordancia` (3823), que pinta en `var(--yellow)`.
- `autoCompletarSevIA` (21803) sale con `esqSevManual.ia`, escribe `ia_sev_final` y marca
  `dataset.sugerido` — corroborado por el comentario de 23306, que lo declara «el único escritor
  automático». ⚠️ no verificado: no se leyó su cuerpo línea por línea.
- El ▼ de insuficiencia **no ofrece «Moderada-severa»** (§4): el grado 3 sólo se alcanza desde el
  select, y `calcIA_ESC` nunca lo emite (ver `docs/mapa/valvulas.md`).

---

## §6 Consumidores del TEXTO de las opciones de `ea_grado`

Hoy: `value` = `sin|esclerosis|leve|moderada|severa`; textos «Sin estenosis», «Esclerosis», «Leve
(Vmax 2-3 m/s)», «Moderada (Vmax 3-4 m/s)», «Severa (Vmax >4 m/s)».

**Los diez consumidores de salida leen el `value`**, o un regex sobre el `value`: `sv('ea_grado')`
del EN SUMA (27211), `eaReal` y la fila «EA grado» del PDF (35326, 35408), `_labExcelRow`,
`_ccLbl(EA, sv2('ea_grado'))` del Excel (38984), `VALVSIG` de CeiboAnalytics, `_labEstenSev`
(71630), los indicadores del Laboratorio (42375, 42528) y `eaEscenario` (25064).

Leen el **texto** sólo tres, y ninguno bloquea el cambio:

| Lector | Qué hace | Efecto de quitar la velocidad |
|---|---|---|
| `_pptSel('ea_grado')` → franja de hallazgos del PPT (57627) | lee `options[i].text`, **pero** 57639 aplica `replace(/\s*\([^)]*\)\s*$/,'')` | **ninguno, salida idéntica** |
| `valvSev.opciones()` (48773) | `{v:o.value, t:o.textContent}` para pintar el ▼ | el menú muestra «Leve» en vez de «Leve (Vmax 2-3 m/s)» |
| `cloneSel('ea_grado')` (33468), tarjeta pre-PDF | clona el `innerHTML` del select | la tarjeta muestra los textos nuevos; asigna por `value` |

⚠️ **Corrección a un comentario del propio archivo.** La línea 3326 (sobre `em_grado`) afirma que
«`_pptSel` ya recorta el parentesis final». **`_pptSel` no recorta nada**, y `_pptTxt` (56658)
tampoco: sólo normaliza `\r` y saca caracteres de control. El recorte está en el consumidor, 57639.
El efecto final es el mismo, pero el comentario manda a mirar la función equivocada.

---

## §7 Tarjeta de revisión previa al PDF (33451-33540)

`cloneSel(id)` (33451) clona los selects de estenosis a `rev-em`, **`rev-ea`**, `rev-et` y
`vp_morf`; las insuficiencias se arman aparte con `setGrade('im_grado','rev-im')`, `rev-ia`,
`rev-it`. **Escribe grados de vuelta** al confirmar: `im_grado`/`ia_grado`/`it_grado` respetando
`esqSevManual` (33504, 33538), y los clonados por `value`. El «tercer escritor, y el PEOR» del
comentario de 33509 se refiere a IM/IA, **no** a EA. A `ea_grado` lo toca sólo por `value`.

---

## §8 Colores de la pastilla de severidad

| Estado | Selector | Fondo / borde / texto |
|---|---|---|
| sin dato | `#tab-valvulas .valv-sev-btn` (1344) | `#fef3c7` / `#b45309` / `#92400e` |
| leve | `.nivel1` (1347) | `#dcfce7` / `#16a34a` / `#166534` |
| **moderada** | `.nivel2` (1348) | **`#fef3c7`** / `#ca8a04` / `#78350f` |
| severa | `.nivel3` (1349) | `#fee2e2` / `#dc2626` / `#7f1d1d` |

- Los cuatro son **hex crudo, sin una sola variable**.
- El fondo de «moderada» es **el mismo byte** que el de «sin dato» (`#fef3c7`): sólo cambian borde y
  texto. Ése es el defecto observado en pantalla.
- **Cero overrides de tema** para `.valv-sev-btn` y `.nivel1/2/3` en todo el archivo. Los temas son
  dos: `:root` (oscuro) y `html.light-mode`. Las pastillas se ven igual en los dos — omisión
  preexistente, no una decisión.
- `nivelDe()` (48760) clasifica por regex sobre el **`value`**; `corto()` (48764) recorta la
  etiqueta. `refrescar()` para insuficiencia mapea `n>=4 → 3`, `n===3 → 3`, resto `n`.

**`--orange` ya existe en los dos temas**: `#f59e42` (línea 68, oscuro) y `#d97b1f` (85, claro),
junto a `--green`, `--yellow` y `--red`.

Censo de la misma convención en otras partes —**no es lo mismo que la pastilla y no comparte
variable con ella**, porque la pastilla no usa ninguna:

| Grupo | Dónde | Qué usa |
|---|---|---|
| `.sev-lvl0/1/2/3` de las `sev-pills` de `esqPills` | 1368-1371, con override de `light-mode` en 1372-1374 | sólo `color:`, hex crudo (`#16a34a` / `#ca8a04` / `#dc2626`) |
| pestañas de soplos `.fcg-sev-tab`, `.fcg-sev-content` | 12216-12230 | **ya usan naranja** para moderada (`#b45309` / `#fb923c`), hex crudo. ⚠️ no verificado: leído por grep, no por lectura del bloque |
| `.badge-green/yellow/orange/red` | 845-848 | ya usan `var(--green/yellow/orange/red)` para el color de texto. ⚠️ no verificado igual |

`esqPills` (91470) pinta `sevpills-aortica` (host en 3701) con la clase `'sev-lvl'+lvl`, y marca
`esqSevManual` al elegir. ⚠️ no verificado: cuerpo no leído, sólo sus llamadores (30855, 33345,
51086, 51202).

---

## §9 Apertura automática — el mecanismo existente no alcanza

- `secAutoOpen(tabId)` (51368) recorre `.sacc`; `cardAutoOpen(tabId)` (51411) recorre
  `[data-autoopen]`, hoy sólo en tres secciones de Cardio-Oncología. Los dos deciden por «¿hay algún
  input/select con dato?» y excluyen `[readonly]` y `[data-espejo]` —un espejo es dato de otra
  sección y contarlo abría secciones de pacientes que no tienen la patología—. Los llama
  `mostrarTab` (16509-16510).
- **Las secciones de válvula no las recorre ninguno de los dos.** Está declarado en el comentario de
  32132: son el patrón `toggleEteSeccion`, sin `.sacc` ni `data-autoopen`. Lo que gobierna los
  botones Estenosis/Insuficiencia es `toggleValvPill` (48681) + `cargarValvPills` (48728), que
  restaura desde **`localStorage`** (`valv-pill-esten-aortica`) con un `setTimeout(…, 150)`.
- ⚠️ **Cerrar el botón «Estenosis» borra el grado.** `toggleValvPill` llama `valvSev.limpiar`, que
  deja `ea_grado = 'sin'` y borra `esqSevManual.ea` (§4). O sea que «el médico ya cerró el cajón» no
  es un estado de interfaz: destruye la severidad que iba al informe. Cualquier regla de «no
  reabrir» tiene que decidir qué hace con eso.
- Colgar `data-autoopen` de `#ete-seccion-valv-aortica` traería un defecto menor conocido:
  `cardAutoOpen` busca la flecha como `sec.id + '-arrow'` → `ete-seccion-valv-aortica-arrow`, y la
  que existe es **`ete-valv-aortica-arrow`** (3683). Abriría la sección con la flecha diciendo
  «cerrado».

---

## §10 Sincronía de los Ø TSVI — hay divergencia medida

Cuatro ids, no dos: `diam_tsvi_ao` (pestaña **Aorta**, 2547), `diam_tsvi` (pestaña **Doppler**,
3100), `ea_dtsvi` (Válvulas/EA, 3764), `em_dtsvi` (Válvulas/EM, 3383); más el espejo `im_dtsvi`
(3595).

`syncTSVI()` (23016) copia `diam_tsvi_ao → diam_tsvi` **incondicionalmente** —incluido el vaciado,
`val || ''`— y después llama `calcAo()` + `iaSyncSiExiste()`.

**La divergencia.** El `oninput` de `diam_tsvi` llama a **seis**: `calcAo()`,
`mostrarTSVIEstimado()`, `eteShuntSyncSiExiste()`, `imSyncSiExiste()`, `emSyncSiExiste()`,
`iaSyncSiExiste()`. `syncTSVI` llama a **dos de los seis**. Consecuencia: cargar el Ø TSVI por la
pestaña **Aorta** actualiza la aórtica y la IAo, pero **no** refresca los espejos de EM ni de IM ni
el TSVI estimado; cargarlo por Doppler sí. Es la divergencia que el propio comentario de 23020 dice
estar persiguiendo, a medio cerrar.

**Toca la mitral, así que se reporta y no se arregla.** La corrección, cuando se autorice, es que
`syncTSVI` llame a los mismos seis que el `oninput`.

`syncEADesdeValvulas()` copia incondicionalmente `ea_* → campo global` y después llama `calcAo` y
`calcEADetalle` (ver `docs/mapa/valvulas.md`).

---

## §11 Qué comparte la mitral con esta lógica

Para la extensión futura a la mitral. **Acá no se aplicó nada a la mitral.**

**Compartido entre válvulas:** `window.esqSevManual` (claves `em`/`ea`/`ia`/`it`), el input
`#sev_manual`, `_sevManualSync` / `_sevManualRestaurar`, todo el módulo `valvSev` (`menu`,
`aplicar`, `limpiar`, `refrescar`, `refrescarTodo`), `toggleValvPill` / `cargarValvPills`,
`pillOn`, `esqPills`.

**Propio de la aórtica:** `_gradoManoBorraMarca` (sólo cuelga de `ea_grado` y `ia_sev_final`),
`dataset.sugerido` en la aórtica, `_eaRetirarGradoSugerido` / `_iaRetirarGradoSugerido`,
`_eaMarcarSugerido`, `_eaInsumoFueraDeBanda`, `clasificarEA_Vmax`, `sugerirSeveridadEA`,
`calcEADetalle`, `_eaProtPintar`.

La mitral tiene su propio par `emGradoAuto` (21381) / `emGradoManual` (21405).

**Conclusión de diseño:** la lógica de «calculado vs manual» puede escribirse **genérica desde el
principio** —recibiendo el par select/campo y el proveedor del grado calculado— y registrarse sólo
para la aórtica, de modo que extenderla a la mitral sea agregar dos entradas y no reescribirla.
