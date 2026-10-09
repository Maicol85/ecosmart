# EcoSmart — pendientes vivos

## EN SUMA · morfología y prótesis (2026-10-05, parte D) — declarado y NO arreglado

De la tanda «EN SUMA: morfología y prótesis en una línea (pulmonar y tricúspide)». Nada de esto es
un defecto introducido por esa tanda: los tres están **medidos en HEAD y en el cambio con el mismo
resultado**. Los encontró `/sharp-edges` corriendo sobre el propio diff.

### ⚠️ El grado calculado con cortes NATIVOS sobrevive al cambio a prótesis

**Qué se midió.** Dos gestos, en el orden del día a día:

| gesto | pulmonar | tricúspide |
|---|---|---|
| 1 · cargar el dato con la válvula nativa | `vp_vmax = 3.5` → `calcVP` escribe `ep_grado = 'Moderada'` | `et_gmedio = 6` → `calcET` escribe `et_grado = 'Significativa'` |
| 2 · elegir la prótesis en Válvulas | `ep_grado` sigue en `'Moderada'` | `et_grado` sigue en `'Significativa'` |

El `onchange` de `vp_morf` es `vpSync();valvProtSync()` y el de `vt_morf` es `valvProtSync()`:
ninguno limpia el `<select>` de grado ni vuelve a llamar al calculador — y si lo llamara, saldría
por `protNoGraduaPintar` **antes** de tocarlo.

**Qué causa.** El informe firmado gradúa con cortes de válvula nativa lo que la app se niega a
graduar. Y **el cuerpo ya lo hacía en HEAD**: imprime «Válvula pulmonar con prótesis biológica y
estenosis moderada (Vmax 3.5 m/s, Gmax 49 mmHg)». Lo que cambió con D es sólo el renglón del
resumen, que pasó de «EP moderada.» a «VP protésica biológica con estenosis moderada.» — o sea que
D hizo el resumen **coherente con el cuerpo**; la fuga está aguas arriba, en el campo de grado.

**Peor en la pulmonar:** el badge `vp-sev-badge` sigue diciendo «Sugerido automáticamente por Vmax
3.5 m/s → Gmax 49 mmHg…» sobre una válvula cuyo badge debería decir `PROT_SIN_GRADO_TXT`, porque
`calcVP` sólo corre desde el `oninput` del Doppler. La pantalla se contradice con su propia regla.

**Por qué no se corrigió.** Retirar el grado residual al cambiar de morfología cambia el criterio
de una válvula protésica en el informe firmado —decisión de Maicol— y el `onchange` es código
compartido con el resto de la sincronización de válvulas. **Alternativas, sin elegir ninguna:**
(a) que el `onchange` de la morfología devuelva el grado al centinela cuando pasa a prótesis — el
gesto más honesto, pero reescribe un campo que el médico pudo haber fijado a mano;
(b) que el emisor no publique grado de estenosis con prótesis (ni en el cuerpo ni en el resumen),
dejando `VP protésica biológica.` y los valores medidos — no toca ningún campo, pero borra del
papel un grado que el médico quizá fijó a propósito;
(c) repintar el badge al cambiar la morfología y dejar el grado como está — arregla la pantalla y
no el papel.

### ⚠️ «VT protésica biológica con estenosis no significativa.»

El grado de la ET es binario y `No significativa` es un valor elegible a mano (o traído por un
legado), así que la línea única puede decirlo. Es una frase **por la negativa** y, sobre una
prótesis, una afirmación de función conservada construida con cortes que la app declara
inaplicables — justo lo que la compuerta (3b) del bloque de «normofuncionante» existe para
impedir. En HEAD el mismo estado salía como `ET no significativa.`, así que no es nuevo.
No se tocó: es redacción clínica. Alternativa, sin elegir: en la rama protésica empujar la lesión
sólo con grado afirmativo y callar con «No significativa» (callar no es negar).

### ⚠️ El nivel de la EP se cae del EN SUMA con prótesis (no del cuerpo)

Medido: con `vp_morf = 'Prótesis biológica'`, `ep_grado = 'Moderada'` y `ep_nivel = 'Supravalvular'`,
el EN SUMA pasa de «EP moderada a nivel supravalvular.» (HEAD) a «VP protésica biológica con
estenosis moderada.». El **cuerpo lo conserva** («…y estenosis moderada a nivel supravalvular.»),
así que no desaparece del papel; desaparece de la superficie que se copia al resumen de alta.
El formato que Maicol escribió para la línea única no lleva nivel, y agregarlo es cambiar ese
formato. Alternativa: `«VP protésica biológica con estenosis moderada a nivel supravalvular.»`.

### Lo que NO es alcanzable y queda dicho, para no reabrirlo

- **`VP protésica transcatéter tipo TAVI.`** — `VALV_MORF_FRASE` tiene la entrada `TAVI`, así que
  `sumaProtLinea` la redactaría; pero `TAVI` **no es una `<option>`** de `vp_morf` ni de `vt_morf`,
  y el importador descarta la fila entera ante un valor que no está en la lista. No se agregó
  ninguna guarda: agregarla sería código para un estado que no se alcanza.
- **«con estenosis» sin grado en la PULMONAR protésica** — `_epSinGrado` lleva `!_epEsProt` adentro
  desde E5b-1, así que el escalón «botón prendido sin grado» no afirma estenosis en ninguna
  superficie. La tricúspide sí lo alcanza, por `etPill`. Lo fija TC-419 como límite declarado.

## 3D E2 (2026-10-04) — declarado y NO arreglado

De la tanda «color por territorio coronario + captura». Nada de esto es un defecto introducido:
son cosas medidas durante el trabajo que quedan abiertas porque están fuera del alcance del pedido
o porque son decisión de Maicol.

- **El VI 3D no tiene ni un caso en `test_clinico.mjs`.** `grep lv3d scripts/test_clinico.mjs` da
  **cero**: los 429 casos no tocan el panel. Toda su cobertura vive en sondas temporales
  —`scripts/_probe_vi3d.mjs` (tanda E1) y `scripts/_probe_vi3dcolor.mjs` (ésta, 101 aserciones)—
  que están versionadas pero **nadie corre automáticamente**. Es exactamente el patrón de EcoSmart
  S3/S4: cerrados pero sin cobertura automática, que es cómo un arreglo se deshace sin que nadie
  se entere. Pasar las aserciones a la suite es un trabajo aparte.
- **La brújula se corta y se superpone en la vista por defecto.** «Sep» se dibuja con x negativa y
  se recorta contra el borde izquierdo, y «Punta» pisa a «Lat» porque con la rotación identidad el
  eje de la punta proyecta sobre el origen de la brújula. Es **preexistente** (el código de la
  brújula viene de E1 y no se tocó), pero ahora queda horneado dentro del PNG de la captura, que
  es una imagen pensada para un informe. Se ve en `/tmp/vi3d_*_{claro,oscuro}.png`.
- **El comentario de `index.html` sobre la tarjeta del 3D dice «Lo mide TC-408» y es falso.**
  TC-408 es el escalón de estenosis pulmonar. El caso que mediría la maquetación de esa tarjeta no
  existe. Referencia cruzada rota de la tanda E1.
- **`scripts/check_mobile.js` no abre el panel del 3D**, así que no mide ninguno de sus controles.
  Su informe salió **byte a byte idéntico** a HEAD, pero para los controles nuevos eso es un cero
  sin denominador, no un aprobado: lo táctil del panel lo mide `_probe_vi3dcolor.mjs` (`LAY-2`,
  con el panel abierto a 1200/768/390/360 px).
- **La escalera de tonos tiene un paso apretado, y es el de la CD.** Normal ↔ Hipoquinesia de la
  circunfleja derecha da **8,9 ΔE2000**, el peor de los doce pares vecinos. No es «demasiado
  parecido» —8,9 se distingue cómodo— pero es el que menos margen tiene, porque la base de la CD
  (`#3ecf8e`, L\* 74,6) ya es la más clara de las tres y deja poco techo para dos pasos más claros.
  Separarlos más obliga a bajar el extremo oscuro o a mover el color base: **decisión de Maicol**.
- **`_lv3d.fase` sobrevive a `limpiarCampos`.** Abrir un estudio nuevo arranca el latido donde lo
  dejó el anterior en vez de en fin de diástole. No es fuga de dato del paciente —es estado de
  vista y la animación corre igual— pero sí hizo fallar dos veces la sonda, que creía estar
  midiendo con la fase congelada en 0. Si alguna vez molesta, se resetea en `lv3dNuevoPaciente`.

## ✅ CERRADO 2026-10-03 — la aórtica entró, y por una tercera salida

La decisión de Maicol no fue ninguna de las dos que este archivo ofrecía. **El invariante es
«botón prendido = hay valvulopatía», y elegir «Sin» APAGA el botón** — por los dos gestos: el menú ▼
(`valvSev.aplicar`) y el desplegable de grado final (`_gradoManoBorraMarca`, `emGradoManual`,
`imGradoManual`). Con el botón apagado, el estado 3 llega al emisor sin la tercera mitad de la
compuerta, así que `EA_ESCALON_SIN_GRADO` pudo ponerse en `true` **sin tocar la regla de la marca**:
«Aórtica 3b» queda intacta y por el desplegable siguen sin aparecer el aviso rojo ni el cajón.

Eso descartó las dos salidas de antes: la (a) traía el aviso y el cajón por ese camino, que era su
precio, y la (b) dependía de un `dataset.sugerido` ausente en un formulario en blanco.

Commits: `23eb4e2` (el invariante y el escalón) y `e8b03c5` (los defectos hermanos).
Casos: **TC-397** promovido de `casoAbierto` a `caso`; **TC-399** reescrito —pineaba el
comportamiento «en espera» a propósito—; **TC-402 … TC-407** nuevos. Mutaciones en
`scripts/_mut_sinapaga.py`.

### ⚠️ Lo que quedó abierto de la aórtica, medido y NO corregido

- **«Sin» en el desplegable aórtico no es durable.** Apagar el botón es un rastro, pero el
  autocálculo no lo respeta: reabrir el botón corre `sincronizarEADesdeValvulas → calcAo →
  clasificarEA_Vmax`, que no mira la pastilla y no tiene marca que lo frene, así que **regrada a
  «severa»** y el informe firmado publica «EAo severa.» sobre un «Sin estenosis» que el médico
  acababa de elegir. Medido el 2026-10-03 (escena `H-VUELTA-ea`). Control: la mitral lo conserva,
  porque su `onchange` sí enciende `esqSevManual`.
  Es **pre-existente** —no lo causa el escalón— y cerrarlo exige una señal nueva que sobreviva al
  recálculo sin ser `esqSevManual`: por ejemplo un `dataset.sinExplicito` en el `<select>`, que
  `limpiarCampos` barra y que las escritoras automáticas respeten. Eso es la decisión que «Aórtica
  3b» excluyó, así que **es tuya**.
- **Con prótesis aórtica el escalón de insuficiencia calla, a propósito.** La frase protésica tiene
  otra forma: `Válvula aórtica <morf>, <veredicto protésico><, insuficiencia …>`, sin el «con» que
  en la nativa carga el token. Con el escalón corriendo salía «…, sin datos suficientes para graduar
  la estenosis protésica, insuficiencia.» — un sustantivo colgado. Lo destapó el A/B de las 47
  escenas (`H11-prot-ia`), no la lectura. La prótesis quedó **exactamente** como en `42a1f0e` y el
  hueco se declara: una prótesis aórtica con la pastilla de insuficiencia abierta y sin grado sigue
  sin afirmar nada. Darle texto propio es escribir una frase de informe firmado — decisión tuya.
- **Apagar por regla deja la clave `valv-pill-*` en `'0'`**, que para `valvAutoAbrirCajones`
  significa «el médico lo cerró a mano, no reabrir». O sea que elegir «Sin» revoca la apertura
  automática de ese cajón en ese estudio. Se acepta —el médico dijo que no— y el daño que tenía
  (un grado publicado con su bloque invisible) lo cierra la mitad `hayGrado` de `valvGradoVisSync`.

### Lo demás que la tanda del `c808e69` reportó y no corrigió
- **La tricúspide tiene el mismo mecanismo sin gatear**: `etPill` y `hayIT` leen `pillOn` y no
  consultan `esqSevManual.et` / `.it`, que existen y se escriben. `et_grado` no tiene `onchange`
  (no marca, no repinta), el menú ▼ no ofrece «Sin» para esa válvula, y **cerrar su cajón borra el
  grado Y la marca**, así que cerrar y reabrir convierte una ET graduada en «Estenosis tricuspídea.»
  sin grado. Además su EN SUMA dice la frase larga donde la mitral ahora dice la sigla.
- **La pastilla es estado del navegador, no del estudio.** `toggleValvPill` la persiste en
  `localStorage` y `limpiarCampos` la borra; no viaja con el estudio guardado. Desde esta tanda ese
  estado decide texto del informe firmado: **el mismo estudio puede firmar «con estenosis» hoy y
  «sin estenosis ni insuficiencia» al reabrirlo mañana**, y nada en el estudio explica la
  diferencia.
- **El discriminador es una ausencia**, que es el estado de fábrica de todo estudio legado (la marca
  se persiste recién desde que existe el oculto `#sev_manual`). Hoy lo frenan `limpiarCampos`
  borrando las claves `valv-pill-*` y `valvAutoAbrirCajones` abriendo sólo con grado leve o mayor;
  las dos son frágiles frente a un clic.
- **La tarjeta pre-PDF marca sólo `if (cambio)`**: confirmar «Sin estenosis» sin tocarlo no deja
  marca. La tarjeta que existe para evitar el defecto podría producirlo.
- ~~**R6 (`sevSincronizar`) suelta la marca sola y en silencio**, y `eaGradoCalculado` sí emite
  `'sin'`: el camino automático puede dejar grado `'sin'` sin marca y con la pastilla abierta.~~
  **[CERRADO 2026-10-03, `23eb4e2`]** Era exactamente eso, y con el escalón encendido publicaba
  «EAo.» en el firmado sobre un paciente con Vmax 1,8. `sevSincronizar` apaga el botón **dentro de
  la rama de R6** y sólo ahí: aplicar la regla en cada sincronía apagaría el botón del estado 2 y el
  escalón no volvería a dispararse. Lo fija **TC-406**, con su control negativo (R6 que suelta a un
  grado real no apaga nada). El hermano del **retiro por insumo fuera de banda** —que dejaba el
  mismo estado con el badge diciendo «no gradúa»— se cerró con una cuarta compuerta por
  `bloqueado()`, en el mismo caso.
- **Las leves pulmonares perdieron la lista blanca de vocabulario** que el filtro
  `/moderada|severa/` hacía de refilón. El día que `ip_grado` recupere «Fisiológica» o «Trivial»,
  el EN SUMA firmado dirá «Insuficiencia pulmonar fisiológica.» como hallazgo de conclusión sin que
  nadie toque `generarInforme`.

---

## Etapa de cálculos (mitral)

- El AVm por continuidad inválido (IAo moderada o severa) sigue alimentando `avmMax` y la
  contraindicación por área: decisión de voto, pendiente.
- El selector «Incluir en el informe» deja imprimir una continuidad inválida.
- `index.html` ~22263 afirma que `calcEM` vacía `avm_cont` con `emContValido()` falso; no lo hace
  (el gate es la casilla): corregir comentario.
- Negación tranquilizadora del informe con valores fuera de banda en `avm_plan`, `avm_cont` y
  `em_gmedio`. Eran cuatro: `avm_ete` salió el 2026-10-08 al dejar de ser una fuente, y era el único
  de los cuatro **sin banda en ninguna tabla**, o sea el que ni llegaba a `cat.revisar`.
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
