<!-- E1 de la reestructura v2 de botones de válvula. Medición del estado ANTES, sobre d3e016e
     (md5 index.html 3d5887efb09bb24d96f00b6a66091ef7). Es la base del A/B de las etapas siguientes.
     Este archivo es un artefacto de la tanda; se absorbe/retira en E7. -->

# v2 · E1 — Medición ANTES (estado previo a la reestructura)

Base: `d3e016e`, `md5 index.html = 3d5887efb09bb24d96f00b6a66091ef7`. Sonda endurecida
`scripts/auditoria_botones.mjs`: **183 escenas, 0 inválidas, 7 Doppler 0 inválidas, exitCode 0**
(JSON completo en `/tmp/aud_pre.json`).

## Registro y nodos por lesión (censo medido)
- `ea/ia/em/im`: en `SEV_SINC`, con botón, sub-botón ▼, menú, select, aviso y cajón. (ej. ea:
  `{enRegistro:true, boton:true, sevbtn:true, menu:true, select:true, aviso:true, cajon:true}`)
- `et/it`: **fuera** del registro; tienen botón/sub-botón/menú/select pero **no** aviso ni cajón.
- `ep/ip`: **fuera** del registro; **no** tienen botón ni sub-botón ni menú; sólo el `select`
  (`ep_grado`/`ip_grado`) y las dos solapas (`vp-pane-med`/`vp-pane-morf`).

## Comportamiento ACTUAL de los triggers (reglas 8, 9, 10) — a preservar/ampliar
- **§8 Aórtica — auto-prende SÍ, pero no en la tecla.** Tipear `vmax_ao`/`gmedio_ao` escribe
  `ea_grado` vía `calcAo → clasificarEA_Vmax/sugerirSeveridadEA → sevSincronizar('ea')`, y repinta
  la pastilla, pero **no** toca el pill. El auto-prende lo hace `valvAutoAbrirCajones()`
  (`index.html` ~51301) **al entrar a la pestaña Válvulas** (`showTab('valvulas')` ~16971), si no hay
  decisión guardada en `localStorage` y el grado cae en `VALV_AUTO_GRADO`
  (`esten:['leve','moderada','severa']`, `insuf:['1','2','3','4']`). **E2 mantiene esto.**
- **§9 Tricúspide — NO hay auto-prende.** La velocidad de la IT (`vmax_it → calcPSAP`) calcula PSAP
  y sincroniza TEER; **no** toca `pill-insuf-tricuspide`. **E2 lo agrega.**
- **§10 Pulmonar — NO hay auto-prende, NO hay pills.** `ip_vmax → calcIP` sólo alimenta PAPm/PAPd;
  el grado se elige a mano en `ip_grado`/`ep_grado`. No existen `pill-*-pulmonar`. **E5 agrega los
  botones y completa el trigger.**

## EN SUMA / informe — estado ANTES (medido, ejemplos)
- Sin hallazgo valvular → EN SUMA: `Estudio sin alteraciones estructurales ni funcionales
  significativas.` (ej. escena `R1-ea-neg`).
- Botón prendido sin grado (ej. `R9-ea`) → EN SUMA: `EAo.` (sigla sola; v2 → `EAo presente.`).
- Tabla ANTES→DESPUÉS completa de las 8 lesiones: en el documento de decisiones (v2), etapa E3.

## Línea base de verificación
- Suite clínica: baseline **medido 421/422** (único rojo **TC-223**, por fecha — `/tmp/suite_pre.txt`).
  Semgrep local: a medir. A/B de PDF/Excel y de EN SUMA: contra `git show d3e016e:index.html`.
