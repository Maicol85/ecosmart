<!-- Ficha del caso TC-538 — tanda B, 2026-10-27. Archivo propio porque `tests-fichas.md` ya
     estaba en 34,2 KB, medido ANTES de escribir esto. -->

# Ficha — TC-538 · los espejos en vivo y el dueño único de la PAM

**Qué vigila.** Dos cambios de mecánica que no mueven ningún dato clínico y por eso son
exactamente los que se pueden deshacer sin que nada chille: *cuándo* se repinta un campo que lee
otra pestaña, y *de cuál de las tres fuentes* sale la presión arterial media.

## Las cinco partes

| Parte | Qué mide | Denominador |
|---|---|---|
| **(a)** | **26 espejos de 19 fuentes** siguen al dato sin tocar otro campo, sin cambiar de pestaña y sin recargar | cada espejo tiene que haber **cambiado**; si no, cuenta como «sin denominador» y el caso falla |
| **(b)** | **S1** (esquema y conclusión del POP siguen al GC del Swan) y **S2** (el texto de dosis sigue al peso, y sin peso lo pide) | S1 compara dos GC distintos; S2 compara 80 kg, 40 kg y sin peso |
| **(c)** | **las siete combinaciones** de fuentes de PAM: quién gana, con qué valor, y si aparece el aviso | cada combinación arranca de `limpiar()` |
| **(d)** | cuatro **controles negativos** | ver abajo |
| **(e)** | la PAM **tipeada** sobrevive a guardar y reabrir; la marca `derivadoDe` **no** | el guardado entra por `guardarInforme` real |

## Los controles negativos de (d)

1. **El barrido corrido TRES veces no mueve un solo campo que el médico pueda tipear** — ni
   `readonly`, ni `disabled`, ni `data-espejo`, ni `*_ro`. Denominador: **940** campos editables
   en la foto, más **tres centinelas** sembrados a mano en `pop_nor_dosis`, `vd_fac` y
   `hemo_pam` —los que escriben las funciones **excluidas** del registro—.
   ⚠️ **Los centinelas existen porque la foto sola no alcanzaba, y una mutación lo demostró.**
   Si un pintor ya venía pisando un campo editable, cuando el control saca la foto el campo
   **ya** tiene el valor pisado: las tres pasadas no lo mueven y el control da verde sobre el
   defecto que existe para cazar. Es el «freno que tapa al que se muta» que este repo ya
   documenta, y **M14 sobrevivió por eso**. Los centinelas se siembran con asignación directa,
   sin evento, así que no disparan el barrido y el valor queda.
1b. **La única escritura del barrido sobre un campo tipeable, declarada y medida en vez de
   escondida.** El centinela de `tv_tipo` se perdía **también en el árbol sano**: `tvSync` vacía
   `tv_tipo` y `tv_morfologia` cuando la TV no está documentada — y en el mismo gesto los
   **deshabilita**, que es por lo que la foto no los veía (`fotoEd()` saltea los `disabled`). No
   es una pérdida nueva: `tvSync` ya estaba en `RECALC_MODULOS`. El caso lo mide de los dos
   lados: con TV documentada el barrido **no** lo toca; sin documentar lo vacía **y** lo
   deshabilita.
2. **Es idempotente**: la segunda pasada seguida no mueve un solo nodo de texto.
3. **Las seis excluidas siguen fuera del registro** — `popSync`, `calcVD`,
   `imEspejosRestaurar`, `sincronizarTEERDesdeGlobal`, `v2dCerrar`, `m3dBotonSync`. Sin este
   control, «completar» la lista más adelante cerraría la vista 2D cada 220 ms.
4. **El aviso está en pantalla y no hay una palabra suya en el informe, el EN SUMA ni la hoja
   del posoperatorio** — con su propio denominador: la hoja **sí** se generó y **sí** publica la
   PAM que ganó, así que el «no está» no es un «no se generó nada».

## Tres trampas que este caso pagó al escribirse

1. **Casi todos los espejos son `<input readonly>`, no `<span>`.** En un `<input>` el
   `textContent` está **vacío**: leerlos con `txt()` daba cadena vacía siempre, los veintiséis
   decían «no se movió» y el caso se leía como «el arreglo no funciona» cuando lo que fallaba
   era la sonda. **Costó una corrida entera: 5 de 24.** El lector elige por el tag.
2. **La tabla va agrupada por FUENTE, no una fila por par.** Con una fila por par, dos filas
   seguidas que cambian el mismo campo al mismo valor dejan al segundo espejo **sin
   denominador** —ya se había movido en la fila anterior— y el caso informa «no se movió» sobre
   un espejo sano. **Costó otra corrida: otros cinco.**
3. **Hay que esperar al debounce.** El barrido corre 220 ms después del último evento, no en el
   acto: medir enseguida del `set()` da el valor viejo y el caso fallaría por el reloj y no por
   el código. Se esperan **450 ms**, el doble con margen.

## Que cae contra el árbol anterior

Corrido en un worktree sobre `3d93858` —el cierre de la tanda A— con **este mismo**
`test_clinico.mjs`:

- **(a) 0 de 26**, las veintiséis «sin denominador»: ni un espejo seguía a su fuente.
- **(b) S1 y S2 rojos**: `esq cambio=false concl cambio=false`, y el texto de dosis daba
  `≈ 0.10 mcg/kg/min` con 80 kg, con 40 kg **y sin peso**.
- **(c) las siete rojas**: `pamEfectiva` no existe, `clave=null` en todas.
- **(d4) rojo**: no hay aviso que medir.

Los tres controles que **tienen** que pasar en el árbol viejo —(d1), (d2) y (d3)— pasan, y (e)
también: la PAM tipeada ya se conservaba, que es la premisa falsa que esta tanda reporta.

## Las dieciséis mutaciones dirigidas

`python3 scripts/_mut_b.py` — worktree aparte, nunca sobre el árbol vivo, con guarda de md5 y
línea base antes de puntuar.

| # | Qué revierte | Qué mata |
|---|---|---|
| M1 | el barrido sale del debounce | (a), S1, S2 |
| M2 | el registro queda vacío | (a), S1, S2 |
| M3 | sale `popDosisTodas` | S2 |
| M4 | salen `popEsqPintar` y `popConclSync` | S1 |
| M5 | sale `tvSync` | los espejos de MCH, MCA y Fallot |
| M6 | sale `eteShuntSync` | la superficie corporal y el DDVI indexado |
| M7 | sale `calcTEP` | `tep-vdvi-interp` |
| M8 | sale `calcHemo` | la fila «PAM» con la del catéter |
| M9 | la tipeada le gana al catéter | (c4), (c5), (c7) |
| M10 | la comparación de discrepancia nunca encuentra nada | (c4) a (c7) |
| M11 | la calculada vuelve a ganar con el valor crudo | (c3) |
| M12 | el aviso se pinta también sin discrepancia | (c1), (c2) |
| M13 | entra `v2dCerrar` al registro | (d3) |
| M14 | un pintor del registro escribe un campo editable | (d1) |
| M15 | el aviso deja de ser idempotente | (d2) |
| M16 | la compuerta de `tvSync` deja de vaciar el tipo de TV | (d1b) |
