<!-- Re-auditoría E7 (2026-10-04), posterior a E5 (EP presente), E5b-1/2/3/4 y E6. Actualiza la tabla
     regla × válvula del 2026-10-03 (ver `valvulas-botones.md` §4), que quedó vieja: la pulmonar ganó
     botones y pastillas, la tricúspide su disposición y su narrativo, y la regla 8 se invirtió. -->

# Re-auditoría E7 — botones, pastillas y grado de las válvulas (2026-10-04)

Auditoría contra el reglamento de 16 reglas (texto literal en `valvulas-botones.md` §1). La fuente de
verdad de esta corrida es la evidencia automática medida hoy, no la lectura:

- **Suite clínica** (`scripts/test_clinico.mjs`): **406/427**. Verdes todos los casos del contrato v2
  reescritos en E6 (TC-51, TC-137, TC-139, TC-372, TC-375, TC-378, TC-384, TC-388, TC-395, TC-396,
  TC-397, TC-398, TC-399, TC-400, TC-402, TC-405, TC-140) y los de E5 (TC-408 EP presente, TC-409 su
  auto-apagado, TC-410 tricúspide E5b-3, TC-411/TC-412 narrativo de una oración).
- **Sonda de gestos reales** (`scripts/auditoria_botones.mjs`): **188 escenas (0 inválidas), 7 doppler
  (0 inválidas), exitCode 0**, `md5` de `index.html` igual antes y después.
- **Semgrep** 127 / 0 ERROR. **A/B de 434 columnas** vs el commit anterior: 0 diferencias (el único
  cambio de código de E6 —la etiología de la IP en la oración única— sólo agrega texto cuando la
  etiología está puesta).

## Qué cambió desde la auditoría del 2026-10-03

El hallazgo estructural de entonces («la pulmonar no tiene botón ni pastilla; la tricúspide no está
registrada») se movió:

- **La pulmonar ganó botones y pastillas** (E5b-1): `pill-esten-pulmonar` / `pill-insuf-pulmonar`
  existen, su menú ▼ se puebla, y la EP autogradúa por `epGradoPorGmax`. Las mediciones Doppler se
  mudaron a `#dop-pulmonar`, bajo el Doppler Tricuspídeo (E5b-2).
- **La regla 8 se invirtió** (E5b-0, decisión de Maicol): apagar el botón **BORRA** el grado (vuelve
  al centinela) conservando la marca; si el cálculo discrepa, aviso rojo y cajón con el botón
  apagado. Aplica a aórtica y mitral; la tricúspide además borra la marca (no está registrada).
- **El menú ▼ ya no ofrece «Sin»** en ninguna válvula (regla 2): «Sin» es centinela interno y el
  gesto de «no hay» es apagar el botón.
- **Escalón «presente»** en EP (E5b-1) e IT (E2c/E5b-3): botón prendido sin grado → «con estenosis /
  insuficiencia» en el informe, sigla + «presente» en el EN SUMA.
- **Narrativo de una oración** por válvula en tricúspide y pulmonar (E5b-4), con la PSAP aparte.

## Tabla regla × válvula (PASA · FALLA · N/A · ⚠ reportado)

`PASA` = medido y cumple · `FALLA` = medido y no cumple · `N/A` = la regla no tiene sujeto ·
`⚠` = dejado abierto, es decisión de Maicol (ver abajo).

| # | Regla (resumen) | Mitral (EM/IM) | Aórtica (EAo/IAo) | Tricúspide (ET/IT) | Pulmonar (EP/IP) |
|---|---|---|---|---|---|
| 1 | Botón prendido = hay valvulopatía | PASA | PASA | PASA (sobrevive guardar+reabrir) | PASA |
| 2 | La pastilla muestra el grado y sigue al cálculo | PASA | PASA | PASA (ET/IT) | PASA (EP autogradúa; IP no gradúa) |
| 3 | Select = informe; prendido sin grado, el sustantivo | PASA | PASA | PASA (IT presente, ET presente) | PASA (EP presente, IP presente) |
| 4 | El cálculo usa el criterio de cada válvula | PASA | PASA (el peor manda) | PASA (ET significativa, EAE/ASE 2009) | PASA (EP por Gmax; IP no gradúa) |
| 5 | Grado a mano se mantiene; si cambia el calculado, a auto | PASA (IM) · N/A clasif. (EM) | **⚠ TC-406** | N/A (no registrada) | PASA (EP) · N/A (IP) |
| 6 | Discrepancia → aviso rojo + cajón, motivo al informe | PASA | PASA | N/A (no registrada: no existe) | EP: sí · IP: N/A |
| 7 | «Sin» apaga el botón; aviso/cajón aunque apagado | PASA | PASA (menú y desplegable) | N/A (no registrada) | menú sin «Sin» (regla 2) |
| 8 | Apagar el botón borra el grado (conserva la marca) | PASA | PASA | borra grado **y marca** (no registrada) | PASA (EP; auto-apagado del escalón) |
| 9 | Sin grado: informe «con …»; EN SUMA sigla + «presente» | PASA · PASA | PASA · PASA | IT PASA · ET PASA | EP PASA · IP PASA |
| 10 | El informe usa el grado final, no el botón | PASA | PASA | PASA | PASA |
| 11 | EN SUMA siempre siglas, leves incluidas | **⚠ TC-390** (EM con planimetría) | PASA | PASA | PASA |
| 12 | Borrar un dato no retira el grado | PASA | PASA | PASA | PASA |
| 13 | «Mixta» nunca se escribe sola | PASA | PASA | PASA (E5b-4) | PASA (E5b-4) |
| 14 | Excepciones (Esclerosis, EM sin clasif., prótesis) | PASA | PASA (Esclerosis no abre cajón) | N/A | prótesis EP calla el escalón |
| 15 | Tricúspide y pulmonar, mismo modelo y formato | N/A | N/A | es el sujeto (disposición E5b-3, narrativo E5b-4) | es el sujeto (botones E5b-1, narrativo E5b-4) |
| 16 | No cambia cortes ni fórmulas | PASA | PASA | PASA | PASA |

Nota de maquetación (regla 15): la auto-apertura del cajón aórtico al entrar a Válvulas alcanza el
grado por **Vmax** pero **no** el grado por **AVA-por-continuidad sola** traído del Doppler global
(⚠ TC-376).

## Los tres ⚠ — dejados abiertos, decisión de Maicol

1. **TC-390 — mitral con planimetría vs regla 11.** Con AVm por planimetría, el EN SUMA emite la
   frase larga «Estenosis mitral severa (AVm 1.20 cm² por planimetría).» en vez de la sigla «EM
   severa.». El test es correcto (detecta la violación); el código es el que no cumple. Arreglarlo es
   cambiar la emisión del EN SUMA (contenido del informe, decisión de Maicol).
2. **TC-406 — regla 5 vs regla 8.** Al corregir la Vmax a un valor no-graduable, la aórtica apaga el
   botón y publica «sin estenosis» (la prevención del escalón se mantiene), pero conserva la marca
   manual; el caso esperaba que la regla 5 la soltara. ¿Soltar o conservar la marca en ese camino?
3. **TC-376 — auto-apertura por AVA-sola + un umbral.** La pastilla no se auto-prende con el grado
   por AVA-por-continuidad sola; además, algunas aserciones tocan un umbral de grado (Vmax 2,5) que
   no se toca sin OK.

## Entorno

Los 17 casos del pendrive Vivid (`TC-181 … TC-197`, `DISK_IMG`) salen rojos cuando el pendrive no
está montado: es entorno, no código. Con el pendrive afuera «no prueban nada» (ver `CLAUDE.md`).
El único rojo que no es de diseño ni de entorno ni de los tres ⚠ es **TC-223**, que falla por la
fecha (documentado).
