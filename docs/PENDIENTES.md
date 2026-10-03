# EcoSmart — pendientes vivos

## Etapa de cálculos (mitral)

- El AVm por continuidad inválido (IAo moderada o severa) sigue alimentando `avmMax` y la
  contraindicación por área: decisión de voto, pendiente.
- El selector «Incluir en el informe» deja imprimir una continuidad inválida.
- `index.html` ~22263 afirma que `calcEM` vacía `avm_cont` con `emContValido()` falso; no lo hace
  (el gate es la casilla): corregir comentario.
- Negación tranquilizadora del informe con valores fuera de banda en `avm_plan`, `avm_ete`,
  `avm_cont` y `em_gmedio`.
- AVm indexada (`avm_idx`): marca de pantalla cuando viene de la continuidad; el Excel exporta el
  valor crudo.
- Piso de 20 ms del THP: un THP real por debajo se retiraría del informe.
- Estudios de prótesis guardados antes del cambio: el narrativo congelado publica el área y la
  tabla del PDF dice «no evaluable».
- Ratio VTI mitral/VTI TSVI protésico (≥2,5): hoy se retira desde IAo moderada; revisar si
  corresponde (la Tabla 12 de ASE 2024 no condiciona por IAo).
- Calculadora de severidad de IM: gradúa la secundaria con cortes de primaria; hay aviso en
  pantalla, sin decisión de grado propio.
- Abrir un estudio guardado arrastra las respuestas del panel de Evidencia; `cerrarSesionReal` no
  limpia `_indClin`.
- Wilkins: unificar `calcWilkins` y `cxWilkins`; al hacerlo, atribuir el ≤8 de la leyenda a la
  guía ESC; la escala (1-4) de los selectores NO se cambia.

## Aórtica — declarado en la tanda 2/3 (2026-10-01) y NO arreglado

Lo de abajo está **medido en Chrome**, no supuesto, y **espera decisión de Maicol**: son cortes,
fórmulas y rótulos clínicos, que por la regla del repo se reportan y no se tocan.

- **[CORREGIDO 2026-10-01, tanda 2b] La fracción regurgitante de la IAo usaba el denominador
  equivocado y fallaba hacia «menos severa».** Hacía `volR/(volR+vsv)`, donde `vsv` es el volumen
  sistólico del TSVI. La ASE 2017 (Zoghbi, **folio 311**) define *«RF is then derived as the RVol
  divided by the SV through the regurgitant valve. Thus, RVol = SV_RegValv − SV_CompValv;
  RF = RVol/SV_RegValv»*, y la **Tabla 14** (**folio 339**) da el método de la IAo: *«SV method:
  RVol = SV_LVOT − SV_MV»*. En la IAo la válvula regurgitante **es la aórtica** y su SV se mide en el
  TSVI: `vsv` **ya contiene** el regurgitante. Hoy es `volR/vsv`, con guarda `vsv > 0`.
  Medido antes/después con EROA 20 mm², VTI del jet 200 cm, Ø TSVI 20 mm y VTI TSVI 20 cm:
  **39 % → 64 %**, y el grado integrado **moderada → severa** en las cuatro superficies. Fijado por
  **TC-350**. ⚠️ **No es una duplicación con la mitral:** `calcIM_ESC` usa `volR/(volR+vsv)` y ahí
  **está bien**, porque el SV mitral *es* `volR + vsv`; `calcContIM` ya usaba `volR/vmit` con guarda
  `> 0`, que es la forma correcta. Un «dueño único» de la cuenta sería el error.
- **🔴 `itv_tsvi` y `diam_tsvi` NO llaman a `calcIA_ESC`, y la tanda 2b lo volvió mucho más caro.**
  Sus `oninput` llaman `calcAo(); … imSyncSiExiste(); emSyncSiExiste()` — la **mitral** sí se enganchó
  (`imSyncSiExiste` existe exactamente para esto), la aórtica no. Antes `vsv` estaba diluido en
  `volR+vsv`; ahora **`FR ∝ 1/vsv`**, así que corregir el Ø del TSVI de 20 a 22 mm deja en pantalla la
  FR del valor viejo **y no recalcula `ia-sev` ni `ia_grado`**, que es lo único de este bloque que baja
  al informe, al EN SUMA, al PDF y al Excel, y lo que gobierna `_indIA`. También queda obsoleto
  `ia-jet-ratio`, que lee `diam_tsvi`. Se cierra con un `iaSyncSiExiste()` calcado de
  `imSyncSiExiste` en los dos `oninput`. **No se hizo acá**: es cableado nuevo, merece su propio
  commit y su propia mutación. Lo encontró `/sharp-edges` sobre el diff de 2b.
- **La FR de la IAo perdió la cota implícita del 100 %.** `volR/(volR+vsv)` no podía pasar de 100 %;
  `volR/vsv` sí. Con el error de unidad que este repo ya documenta —Ø TSVI tipeado en cm, 2 por 20—
  `vsv` da 0,628 ml y la FR sale **6369 %**, impresa bajo el rótulo «Fracción regurgitante (%)», y
  vota severa. Con la fórmula vieja el mismo error daba 98 %. La IAo **sigue sin banda de
  plausibilidad** (`CHM_RANGO` no cubre `ia_pisa_r`, `ia_pisa_val`, `ia_vmax_cw`, `ia_vti`,
  `itv_tsvi` ni `diam_tsvi`), mientras la mitral publica con `MARCA_REVISAR` y **retira el voto**
  (`if (!_frDud)`). Opciones: tratar `fr > 100` como no valorable —precedente: `calcContIM` con
  «No valorable — revisar mediciones»—, o extender la banda y copiar el patrón `_frDud`. **Es
  decisión clínica de Maicol**, por eso quedó declarado y no resuelto.
- **Los calc-val de la IAo no se limpian cuando el insumo desaparece.** `ia-eroa`, `ia-volr` y
  `ia-jet-ratio` no tienen `else`: borrar el radio del PISA deja la fila afirmando el número
  retirado, y reimprimir un estudio sin PISA encima de otro que sí lo tenía conserva los del
  paciente anterior (`cargarEstudioPorId` corre `calcIA_ESC()` sin barrer los span). La mitral lo
  resolvió con `_pisaLimpiar`. Atenuante **medido**: ningún emisor lee esos tres span —el PDF de
  IAo imprime VC, PHT y AT; el Excel sólo `PHT IAo`—, así que queda en pantalla. Pero en pantalla
  es donde se decide. `limpiarCampos` sí los barre, así que «Nuevo estudio» no arrastra.
- **El VTI del TSVI negativo sigue llegando al PPT.** La tanda 2b lo cerró en `calcIA_ESC`, pero
  `calcAo` hace `if (dtsvi && itsvi)` sin `> 0` y publica `vs-val`, que el PPT entrega como «Volumen
  sistólico». Los inputs no tienen `min`. Queda la app diciendo dos cosas del mismo dato: en IAo
  «no valorable», en el PPT un número negativo. **No se tocó** — fuera del alcance de este diff.
- **⚠️ EFECTO RETROACTIVO SOBRE ESTUDIOS GUARDADOS — segunda entrada (la primera es la del corte de
  velocidad telediastólica, tanda 2/3).** No se migró nada, pero `cargarEstudioPorId` vuelve a correr
  `calcIA_ESC()` al reabrir, así que **la FR se recalcula**. La FR vieja era **siempre menor** que la
  nueva —el denominador era mayor—, de modo que un estudio archivado puede **subir** de grado al
  reabrirse y **nunca bajar**. Sumado al corte de 2/3, un mismo estudio reabierto hoy puede decir
  «severa» donde el papel impreso decía «moderada». Queda declarado, no migrado.
- **El grado 3 («Moderada-severa») lo ofrece el `select` `ia_sev_final` y `calcIA_ESC` no lo emite
  nunca.** La cascada solo produce `'4'`, `'2'` y `'1'`. Solo se llega a 3 eligiéndolo a mano, y
  hacerlo **apaga el panel de conducta**, que abre con `ia_sev_final === '4'`. La categoría sí existe
  en la ASE 2017 (tabla de IAo, folio 340, con cuatro columnas), así que la opción no es inventada:
  lo que falta es que la integración sepa emitirla, o que se retire del `select`.
- **Fail-open por unidad en `ia_vmax_td`, agravado por el corte nuevo.** El campo **no tiene banda de
  plausibilidad** (`CHM_RANGO` cubre `ia_vmax_cw` y `ia_pht`, no éste). Una velocidad tipeada en m/s
  —`0,25` en vez de `25`— cruza la guarda `if (vmaxTD)`, no alcanza los 20 y la pantalla contesta
  «No gradúa (< 20 cm/s) — la guía sólo publica el corte de severa»: un criterio de severa cumplido
  se pierde detrás de una frase con autoridad de guía. Toda la banda fisiológica en m/s (0,2-0,6)
  cae en esa ventana muerta. Igual con negativos (el equipo muestra la reversión con signo).
- **`if (vmaxTD)` descarta el cero medido.** «Busqué la reversión y no hay» se trata como «no hay
  dato». El módulo TAVI ya resolvió esta distinción con `cero()` y `_medidoCero`, y usa
  `velT != null`: dos lectores del mismo parámetro físico con guardas distintas.
- **El rótulo dice «Vmax telediastólica» y la guía pide EDV** (velocidad *al final* de la diástole),
  no el pico del flujo reverso. Son números distintos del mismo trazado y el pico siempre es mayor.
  Con el techo viejo de 200 cm/s la confusión era inofensiva; con el corte en 20 decide el grado, y
  hacia severa. Además el badge **afirma** «reversión holodiastólica» a partir de una sola velocidad,
  mientras el módulo TAVI exige la conjunción (`flujo==='holo' && velT>=20`, con un `select` propio).
- **`ia_vmax_td` no sale en el PDF, ni en el Excel, ni en el importador.** Con `severa >= 1` puede ser
  el **único** votante del grado que firma el informe: un papel que dice «insuficiencia aórtica
  severa» sin la fila que lo sostiene, y un round-trip de Excel que pierde el dato. Era deuda barata
  mientras el parámetro casi no podía votar severa; ahora no lo es.
- **Grado rancio en la IAo, límite ya declarado.** Bajar 25 → 15 cm/s sin limpiar deja el grado
  severo en pie (`params` vacío → early return antes de reescribirlo) y la pantalla se contradice:
  el renglón dice «No gradúa» sobre un grado severo. Retirar el grado auto-derivado en nativa es
  **decisión tomada de Maicol — «NO se toca»** (comentario de `calcIM_ESC`). Queda fijado por TC-348
  para que el límite sea visible y no cambie en silencio.

## Aórtica — declarado en la tanda 1/3 (2026-10-01) y NO arreglado

Sale de `/sharp-edges` sobre el diff de esa tanda. Está medido, no supuesto.

- **Cinco superficies más publican `ea_grado` con cortes nativos sobre una prótesis.** La tanda 1/3
  cubrió tres de ocho (EN SUMA, fila del PDF, `gEA` del Excel). Faltan: `_pptSel('ea_grado')` en el
  PPT; `VALVSIG` en el export a CeiboAnalytics (`sig=1` por `/severa|moderada/`); `_labEstenSev` en
  el PDF de auditoría del Laboratorio; el indicador «EA moderada-severa sin gradiente documentado»;
  y `_tieneValv`/`_labValvCounts`/`sevTable` (buscador, filtro y distribución). Se cierran con una
  línea cada una usando `eaGradoNoPublica(inf.campos.va_morf)`. No se hicieron en la misma tanda que
  el informe firmado para no mover estadísticas del Laboratorio a la vez. El censo está en el
  comentario de `eaGradoNoPublica`.
- **`VALV_PROT_OPCIONES` no tiene assert**, y es la única lista literal paralela a los selects que
  no lo tiene (`_labXlsAssertListas` y `_eteVmAssertPares` son el molde). Una opción de prótesis
  nueva o renombrada apaga SIETE compuertas de un golpe, sin error ni caso rojo. El caso que parece
  cubrirlo (`valvEsProtesis` contra la visibilidad del bloque) compara el predicado contra sí mismo:
  es una tautología en la dirección que importa. Falta un `_valvProtAssertOpciones` que recorra las
  opciones de los cuatro selects y grite si el texto dice prótesis/TAVI/SAVR y el predicado dice no.
- **El `<option>` de `ea_grado` severa dice «Vmax >4 m/s» y el motor decide con `>=`.** La tarjeta de
  pantalla y ahora el PDF dicen `≥4,0`; el selector que el médico lee mientras elige el grado quedó
  con el operador viejo. Es rótulo clínico: se reporta y se espera (`index.html` ~3724).
- **Los decisores no leen `EA_CRIT`.** `clasificarEA_Vmax`, `calcEADetalle` y `_indEA` comparan contra
  literales (`4.0`, `40`) mientras el `ref` del PDF ya deriva de la constante: mover `EA_CRIT.vmax`
  cambiaría la escala impresa y NO el grado. Y `_eaAssertUmbrales` compara valores, no operadores, así
  que un cambio de `>=` a `>` pasa en silencio. Lo correcto es un predicado compartido
  (`eaVmaxEsSevera`/`eaGmedEsSevero`), como `avaEsSevera` ya hace con el AVA. Toca operadores del
  motor: fuera del alcance de la tanda 1/3.
- **La abstención de `calcEADetalle` avisa sólo en pantalla.** Con AVA no valuable el grado anterior
  queda en el `<select>` y las cuatro superficies lo publican; el único aviso es `#ea-ava-badge`. Es
  la convención que `sugerirSeveridadEA` ya fijó, no algo nuevo, pero el canal que podría llevarlo al
  informe —`window._eaBajoGradiente`— tiene tres escrituras y **cero lectores**: hoy es código muerto.
  Decidir si el EN SUMA debe emitir «el grado consignado no se actualizó» (es texto del informe).
- **El Excel afirma el negativo en vez de abstenerse.** Con prótesis `gEA` queda en `''` y `bin()`
  devuelve `0`, así que `EAo_III (Severa)=0` dice «no hay estenosis severa» en lugar de «desconocido
  en esta escala». Un denominador de prevalencia construido sobre esa planilla cuenta la prótesis como
  negativo confirmado. Maicol aprobó los tres binarios en `0` el 2026-10-01; pasarlos a `''` es una
  decisión aparte y toca el round-trip del importador.
- **`va_morf` arranca en «Trivalva normal» y no tiene opción vacía**, así que una prótesis cuya
  morfología no se consignó deja las ocho guardas apagadas. Hay un dato cruzado para detectarlo
  (`vab_cx_valvular`). Migrar o agregar opción vacía toca datos guardados.

## Aórtica (próxima válvula)

- Reordenar el bloque «Estenosis Aórtica — Datos del Doppler»: fila 1 Vmax Ao, G. máx, G. medio;
  fila 2 Ø TSVI (auto), VTI TSVI, VTI Ao, DVI; fila 3 AVA continuidad y campo nuevo AVA por
  planimetría.
- Verificar que los dos «Ø TSVI auto ← Doppler» no se sincronizan con el diámetro de TSVI de la
  pestaña de aorta.
- Estenosis aórtica: el grado final aparece como «Severa (Vmax >4 m/s)» con la leyenda «sugerido
  por AVA continuidad (1,85 cm²)» mientras el recuadro dice «Sin estenosis / leve»: revisar.
- Rótulos «ESC 2021» en las etiquetas de severidad (guía vigente: ESC/EACTS 2025).

## Maquetación de Válvulas — declarado en la tanda del 2026-10-03 y NO arreglado

- **El menú de severidad depende de `:has()`, y sin soporte vuelve el recorte EN SILENCIO.**
  La regla `#tab-valvulas .card:has(.valv-sev-menu.open){overflow:visible;}` es lo único que evita
  que `.card{overflow:hidden}` corte el menú. `:has()` existe en Chrome 105+, Safari 15.4+ y
  **Firefox 121+**; en un navegador anterior la regla se descarta sin error ni aviso y vuelven a
  perderse tres opciones de la aórtica —«Moderada» y «Severa» de estenosis, y la última de
  insuficiencia—. El modo de fallo es «el médico elige Severa y no pasa nada», indistinguible de
  un clic mal dado. **La suite no puede detectarlo**: TC-395 corre por CDP contra el Chrome del
  sistema, así que es cobertura en Chrome, no cobertura del arreglo en otro navegador. La app se
  usa en Chrome, así que hoy no es un defecto activo — pero la dependencia queda declarada.
  Si alguna vez hay que soportar Firefox viejo o iOS <15.4, el camino ya resuelto en la app es el
  de `.igio-menu`: `position:fixed` + `max-height`, que además arregla el menú abierto por debajo
  del pliegue, algo que `:has()` no toca.

- **El rótulo por defecto del grado final quedó con 2 px de margen a 1200 px.**
  «— Sin insuficiencia / no evaluada» mide 197 px y es la opción seleccionada de fábrica de
  `im_sev_final` e `ia_sev_final`. Con el reparto 1:1 viejo le sobraban ~43 px; con el `grow:2` del
  cajón le quedan 2. **Sigue entrando** y está pineado por TC-396, así que si se trunca el caso se
  pone en rojo en vez de descubrirse en un informe. Las dos salidas son decisión de Maicol:
  acortar el rótulo —es texto clínico— o bajar el `grow`. No se tocó.

- **A 756 px ese mismo rótulo de 197 px NO entra, y eso es PREVIO a esta tanda.** Con el reparto
  1:1 el select medía 161 px (útil 129) y ya truncaba; con `grow:2` mide 157 (útil 125). El cambio
  no lo causó ni lo arregló. Mismo par de salidas que el punto anterior.

- **El cajón de la IA es el único sin lista de opciones** (sólo título, label y un input de texto),
  así que el `grow:2` le saca 41 px al select para dárselos a un cajón que no los necesita para
  repartir columnas. Se dejó uniforme en las cuatro filas a propósito —una sola regla— y ahora
  TC-396 lo mide. Si alguna vez molesta, el reparto se acota a los cajones con `.valv-fund-opc`.

## Visor de imágenes (cineloop)

- Modo mínimo: al abrir solo Reproducir, Capturar, Medir y la cruz de cierre; Medir es un
  interruptor que muestra/oculta el resto; siempre arranca en modo mínimo.

## Imágenes (después de las CC)

- Calibración automática por DICOM.
- VI en 3D interactivo a partir de los trazados A4C/A2C/A3C.
- Mitral esquemática animada.
