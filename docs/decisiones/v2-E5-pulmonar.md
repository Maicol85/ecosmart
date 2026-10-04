<!-- Nota de la etapa E5 de la reestructura v2 de botones de válvula (2026-10-03). La reescribe
     E7 al absorberla en valvulas-botones.md v2. Es la medición, no el reglamento. -->

# v2 · E5 — Botones y pastillas de la pulmonar (EP, IP)

Rama `wip/valvulas-v2`, sobre `aabaa8f` (E4). «Se aprende una, se aprende todas»: la pulmonar
entra al mismo modelo que la mitral/aórtica/tricúspide.

## Qué se cambió (6 piezas)

1. **HTML — fila de pastillas + dos envoltorios.** Dentro de `vp-pane-morf`, debajo de la
   morfología: la fila `pill-insuf-pulmonar` / `sevbtn-insuf-pulmonar` / `sevmenu-insuf-pulmonar`
   (y lo mismo para `esten`) + `sevpills-pulmonar`, clonada de la mitral. `ep_grado`
   (+ badge, aviso §5, cajón, `bloque-ep-detalle`) quedó envuelto en
   `<div id="bloque-esten-pulmonar">`, e `ip_grado` (+ `bloque-ip-detalle`) en
   `<div id="bloque-insuf-pulmonar">`. `toggleValvPill` exige esos dos bloques (si no, sale por su
   `return` temprano). La EP la gobierna `valvGradoVisSync('esten','pulmonar')` (vía `sevSincronizar('ep')`,
   que ya corría desde E2c); la IP la gobierna el botón (no está en el registro, no hay
   `gf-insuf-pulmonar`, así que `valvGradoVisSync` es no-op para ella).

2. **`epGradoManual`** — se le agregó que PRENDA `pill-esten-pulmonar` al elegir un grado REAL
   (regla 3). El centinela «— grado —» (`value 'sin'`) no prende. Idempotente.

3. **`ipGradoManual` (nuevo)** — gemelo para la IP; reemplaza `onchange="vpSync()"` de `ip_grado`.
   La IP no autogradúa ni está en el registro, así que NO marca `esqSevManual` ni pinta aviso rojo:
   sólo prende `pill-insuf-pulmonar` con grado real y repinta (`vpSync`).

4. **`calcIP` — trigger de IP desde la Vmax (PMAP).** Cargar `ip_vmax` (>0) prende
   `pill-insuf-pulmonar`, respetando el apagado manual (`localStorage` en `'0'`), idempotente.
   Calcado del trigger de IT en `calcPSAP` (`ab18ac7`).

5. **`cargarValvPills`** — se agregó `'pulmonar'` a la lista de restauración.

6. **`valvAutoAbrirCajones`** — la comparación de grado pasó a `.toLowerCase()`. `VALV_AUTO_GRADO.esten`
   guarda tokens en minúscula (aórtica/mitral usan `ea/em_grado` en minúscula); `ep_grado` usa
   mayúscula inicial («Severa»), así que sin normalizar la EP autograduada nunca abría su pastilla.
   Es **no-op** para aórtica/mitral (ya minúscula) y para la insuficiencia (números). Así la EP entra
   a la regla J.

7. **Informe (`generarInforme`) — `hayIP`** sumó `|| pillOn('pulmonar','insuf')`, que es el término
   que `hayIT` ya tenía y a `hayIP` le faltaba. **Es aditivo** (sólo hace `hayIP` MÁS verdadero):
   ningún estudio que hoy nombra la IP deja de nombrarla, así que no migra lo guardado. Agrega la
   regla 9: botón prendido sin grado ni velocidad → «IP presente».

## Verificación (medida, no de memoria)

- **Sonda `auditoria_botones.mjs`: 183/0, exit 0.** Todas las escenas de la pulmonar (R1–R15 ep/ip)
  pasan por GESTO real; aórtica/mitral/tricúspide sin cambios.
- **Suite `test_clinico`: 396/422 — 26 rojos.** Son los **25 conocidos** (contrato v1, se reescriben
  en E6) + **TC-378**, que es un *tripwire por diseño*: su propio comentario dice que debe ponerse
  rojo «el día que alguien le agregue los botones [a la pulmonar]». Sus otras sub-condiciones
  (morfología antes de los botones en las 4, morfología primera en la solapa, control negativo)
  siguen en verde: sólo cae «pulmonar NO tiene fila de botones». Se une al set de E6. **Ningún rojo
  nuevo de lógica en otra válvula** (los 25 conocidos siguen rojos, ninguno pasó a verde por error).
- **Semgrep local: 127 WARNING / 0 ERROR** (línea base).
- **A/B de las 434 columnas de exportación (orig E4 vs E5, `_ab_e5.mjs`): 434 / 434, intacto.** Las
  escenas de regresión (ep/ip por grado, por velocidad, mitral, aórtica, vacío) dan las 434 columnas
  y el informe **idénticos**. Las ÚNICAS columnas que cambian son `Informe (texto completo)` y
  `EN SUMA (texto completo)`, y SÓLO en la escena «IP prendida sin grado ni velocidad» (regla 9:
  «IP presente»). 432 columnas idénticas en todas las escenas. (La IP por velocidad prende el botón
  pero el informe ya decía lo mismo por la velocidad, así que las 434 columnas no se mueven.)
- **Mutaciones `_mut_e5.py`: 4/4 MUERTAS**, md5 del archivo vivo igual antes y después. ME1 (quitar
  el término del pill en `hayIP`) → la «IP presente» desaparece; ME2 (desactivar el trigger de
  `calcIP`) → el pill no prende; ME3/ME4 (quitar el PRENDA de `epGradoManual`/`ipGradoManual`) → el
  pill no prende al elegir grado.
- **Móvil `check_mobile`: 2 ALTA, idénticas a HEAD** (ambas `#caso_interes`, preexistente). La
  pulmonar no agrega NINGÚN hallazgo (de hecho 2 menos a 360 px: `ep_grado`/`ip_grado` quedan en
  bloques colapsados por defecto).
- **Layout 1200/756/300 px:** sin scroll horizontal del body en ningún ancho; las pastillas miden
  44 px de alto; las dos solapas alternan. A 300 px la fila de pastillas excede su contenedor por
  ~25 px, pero **idéntico en mitral, aórtica y pulmonar** (263>238 las tres): es el patrón existente
  de la fila de botones, no una regresión de la pulmonar.

## Reportado y NO corregido (decisión de Maicol)

1. **Regla 9 para la EP: el botón prendido sin grado NO escribe «con estenosis» en el informe.**
   Medido (escena `N-ep-pill-solo`): con `pill-esten-pulmonar` prendido y `ep_grado` en «— grado —»,
   el informe y las 434 columnas quedan idénticos a HEAD (sin mención de estenosis). `epHay` lee el
   GRADO, no el botón. Implementarlo exige replicar el «escalón sin grado» de la aórtica (cinco
   compuertas: prótesis, insumo fuera de banda, etc.) en la sección pulmonar del informe firmado —es
   una decisión de wording de superficie firmada, como la aórtica, así que se reporta y se espera.
   La IP sí lo cumple (`hayIP` ya lee el pill), porque su mención es una sola frase sin grado.
2. **Elegir «— grado —» en `ep_grado` con el botón prendido no lo apaga.** La pulmonar no entra en
   `SEV_SIN_APAGA_VALVS` (`['aortica','mitral']`). Con el botón prendido queda `ep_grado='sin'` +
   botón prendido; por (1) el informe no dice estenosis. Si Maicol quiere la simetría con la mitral
   (elegir el centinela apaga el botón), es una línea: agregar `'pulmonar'` a `SEV_SIN_APAGA_VALVS`
   y `sevSinApagaDesdeSelect('ep_grado')` en `epGradoManual`.
3. **IP: apagar el botón con velocidad cargada no quita la mención.** `hayIP` sigue leyendo la
   velocidad (`ipProto/ipTele`), igual que `hayIT` lee la VRT. Apagar la pastilla con `ip_vmax`
   cargada deja «IP presente» por la velocidad. Es **el mismo comportamiento que la tricúspide** (no
   una asimetría nueva): la mención se apaga sólo sin velocidad medida.

## Arneses temporales versionados

`scripts/_ab_e5.mjs` (+ `_ab_e5_diff.mjs`) — A/B de las 434 columnas + informe/EN SUMA, sirve el
archivo que se le pase con `--file` (corre contra el snapshot de E4 sin swapear el vivo).
`scripts/_mut_e5.py` — 4 mutaciones, sobre copia, md5-guard, scorer por cambio de escena.
