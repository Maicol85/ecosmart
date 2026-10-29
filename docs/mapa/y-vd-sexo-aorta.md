# El strain en Referencias, el TRIV con dos puertas y el sexo que re-evalúa al instante

Mapa de la tanda **Y, Parte 1** (2026-10-29), commits 1 a 3. Lo que vive acá: la **mudanza del
resultado del strain del VD**, el **espejo del TRIV tricuspídeo**, el **dueño único del recálculo
por sexo**, y los **dos cambios del papel y de la pastilla de la raíz aórtica**.

Lo que **NO** vive acá: el campo del strain, sus cortes y su voto → `docs/mapa/aj5-mitral-tipoim-carpentier.md` §5;
el cuadro de referencias del VD y sus filas condicionales → `docs/mapa/vd-derecho.md`;
el criterio de dilatación de la raíz y sus siete superficies → `docs/mapa/aj4-raiz-aortica.md`;
el grado `sinsexo` y la sincronización de los dos campos de la raíz → `docs/mapa/g-raiz-aortica.md`;
lo declarado y no hecho → `docs/PENDIENTES.md` → **Y-a** a **Y-h**;
las fuentes con sus folios → `docs/fuentes/FUENTES.md` → «La tanda Y».

**Commits:** `b7d110e` (Y-1) · `505a9ee` (Y-2) · `1d1e591` (Y-3) · el de cobertura y documentación.

⚠️ **LOS COMMITS 4, 5 y 6 DE LA PARTE 1 Y TODA LA PARTE 2 NO SE HICIERON**, y no quedaron a
medias: ninguna línea de la app se tocó por ellos. Están declarados uno por uno en
`docs/PENDIENTES.md` → **Y-d** a **Y-h**, con los inventarios y las mediciones ya hechas, que es
la mitad del trabajo.

---

## 1 · El strain del VD: de debajo del campo al cuadro de referencias (commit 1)

| Antes | Ahora |
|---|---|
| `#vd_strain_pl-grado`, un `<div>` debajo del campo | la fila `#row-vd-strain-interp` con el span `#vd-strain-interp`, en el cuadro de referencias |
| texto vacío sin strain usable | la fila entera escondida |
| el cuadro tenía **diez** filas y **tres** condicionales | **once** y **cuatro** |

**El texto no cambió**, verificado carácter por carácter: «normal (más de 20 % en valor
absoluto)», «leve (de 15 a 20 % en valor absoluto)» y «por debajo de leve (menos de 15 % en valor
absoluto — la aplicación no tiene corte de moderada ni de severa)».

⚠️ **VA DESPUÉS DEL AVISO ÁMBAR DEL TEI Y NO ENTRE LA FILA DEL TEI Y SU AVISO.** Ese cartel lo
escribe `vdTeiAvisoSync` y es **del Tei**: meterle una fila en medio lo dejaría colgando de un
parámetro que no es el suyo. «Debajo del Tei» se cumple igual.

⚠️ **LA MARCA «(revisar)» NO SE MUDÓ.** `#vd_strain_pl-marca` sigue debajo del campo, y no es el
resultado: es la marca de la banda de **plausibilidad** —el dedazo de 185 por 18,5— que tiene que
estar al lado del campo que hay que corregir. Es el control negativo (A7) de TC-549.

⚠️ **UN SOLO DUEÑO DEL `display`.** La fila la esconde `vdRefVisSync`, que ya gobierna las otras
tres condicionales y lleva las tres columnas (`calcVD` → `RECALC_MODULOS`, y el final de
`limpiarCampos`). El pintor **no** la toca: dos mecanismos para el mismo trabajo es lo que hace
que una mutación sobreviva.

⚠️ **EL ESTADO VACÍO ESCRIBE «—» Y NO CADENA VACÍA**, porque el barrido genérico
`.calc-box .calc-row span[id]:not(.calc-lbl)` de `limpiarCampos` ahora sí lo alcanza y eso es lo
que deja. No se ve igual: sin strain usable la fila está escondida.

---

## 2 · El TRIV tricuspídeo, un dato con dos puertas (commit 2)

| id | Dónde | Qué es |
|---|---|---|
| `dt_triv` | Doppler → bloque tricuspídeo | el **dueño**, el único que se guarda |
| `vd-triv` | VD / AD, columna 1, **fila 7**, debajo de la FEVD | el **espejo**, fuera del estudio |

`vdTrivSync(origenId)`, calcado de `dtTapSync`: los dos sentidos, en vivo, colgado del **gesto**
(`oninput` de los dos campos) y de `RECALC_MODULOS` —donde se la llama **sin argumento**, o sea
copiando del dueño al espejo—. Gana la última edición; borrar en uno borra en el otro.

⚠️ **GUION MEDIO, Y NO ES COSMÉTICO.** El prefijo `vd-triv` entra en `_noEsDelEstudio`, así que
el recolector no lo toma: **cero campos guardados nuevos**, el Excel queda en **440** columnas y
no hay una segunda copia del número que al reabrir pueda contradecir al dueño. Es el reparto de
`hfpep-`, `vauto-` y `otr-asia-`. El censo del script pasa de **1027 a 1028** porque ése cuenta
controles de pantalla, no campos guardados.

⚠️ **ES EL REPARTO CONTRARIO AL DE `dt_tap`**, que sí se guarda: aquel nació antes de que
existiera esta regla y no se tocó en esta tanda.

⚠️ **NO ES `triv` NI ES `tvia`.** `triv` es el del **ventrículo izquierdo** y vive en Diastólica;
`tvia` es el **tiempo de aceleración pulmonar** y es el campo de la fila 1 de esta misma columna.
Son tres mediciones distintas.

### ⚠️ Lo que se paró: el significado y el amarillo

La orden condicionaba las dos cosas a **verificar el corte de 75 ms en la biblioteca, en imagen**.
Se verificó y **no se pudo**:

| Qué | Valor | Dónde |
|---|---|---|
| ASE 2025 de corazón derecho, texto | **≤ 73 ms** «in normal healthy adults» | hoja 28, folio 168, leído en imagen |
| ASE 2025, **Tabla 6** | **RV IVRT, ms: ≤73 / >73** | hoja 29, folio 169, leído en imagen |
| `DT_TRIV_HTP_PANEL` de la app | **75** | decisión de pantalla, **sin fuente publicada** |
| `DT_TRIV_HTP` de la app | **60**, gobierna el informe firmado | sin fuente registrada |

Y los 73 ms contestan **otra pregunta** —la función diastólica del VD, criterio de
pseudonormal—, no «a favor de HTP». → `docs/PENDIENTES.md` **Y-b**.

---

## 3 · El sexo se re-evalúa en el acto (commit 3, punto iii)

**`sexoRecalcSync()`**, dueño único, en el `onchange` del `<select id="sexo">`. Llama a
`calcDiastol`, `calcAI`, `calcVI` y `calcAorta`, cada uno en su propio `try`, y devuelve cuáles
corrieron para que el caso tenga denominador.

⚠️ **QUÉ SE RE-EVALÚA NO ES UNA SUPOSICIÓN.** Salió de un **barrido sobre los 137 candidatos**
—todos los `calc*` de `window` más los de `RECALC_MODULOS`—, llamando a cada uno sobre un estudio
con el sexo recién cargado y mirando cuáles movían alguno de los **1.824 nodos** de la foto.
Movieron **dos**: `calcBSA` (que encadena `calcAI`, `calcVI` y `calcAo`) y `calcAorta`.

⚠️ **SE LLAMAN `calcAI` Y `calcVI` DIRECTO Y NO `calcBSA`**: ése encadena además `calcAo`, que
**escribe el grado** de la estenosis aórtica, y un cambio de sexo no puede mover una afirmación de
severidad. El peso y la talla no cambiaron, así que no hay nada que recalcular ahí.

⚠️ **EL AVISO NARANJA NO SE AGREGA.** `aiviSexoSync` ya tiene su **oyente de documento** sobre
`input`, y un `<select>` lo dispara —medido—.

**Medido en HEAD antes de tocar nada:** con la raíz en 38 mm y sexo femenino, `ao-interp` seguía
diciendo «No se puede clasificar sin el sexo» y `ai-diam-interp` seguía diciendo «Normal (≤40mm)»
sobre un diámetro de 39 mm que en una mujer es dilatado. **El informe NO estaba atrasado** —se
regenera entero cada vez—: lo que se atrasaba era la pantalla, que es desde donde el médico decide.

---

## 4 · La raíz aórtica: el papel y la pastilla (commit 3, puntos i y ii)

### El papel dice sólo el diámetro

| | Antes | Ahora |
|---|---|---|
| Estándar / Conciso | «Aorta torácica: Raíz aórtica 39 mm — no se puede clasificar sin el sexo.» | «Aorta torácica: Raíz aórtica 39 mm.» |
| Narrativo | «A nivel de la aorta torácica, Raíz aórtica 39 mm, sin el sexo cargado no se puede clasificar su calibre.» | «A nivel de la aorta torácica, raíz aórtica 39 mm.» |
| Pantalla | «No se puede clasificar sin el sexo» | **igual** |
| EN SUMA | sin línea | **igual** |

La frase retirada es una nota sobre el **estado de carga del formulario**, no un hallazgo del
estudio. La pantalla la conserva entera: la pastilla gris y el cartel naranja.

⚠️ **LA RAMA NARRATIVA TENÍA SU TEXTO ARMADO CON UN `replace` SOBRE ESA MISMA FRASE**, así que
tuvo que dejar de depender de ella: nace `sinCNar`, con el rótulo en minúscula igual que la rama
de calibre normal.

⚠️ **EL EN SUMA NO TENÍA LÍNEA EN ESA FRANJA Y SIGUE SIN TENERLA.** Medido en las quince escenas
del A/B: la frase que debía perder nunca estuvo ahí. Agregarle el diámetro habría metido una línea
en el resumen de hallazgos de todo estudio con la raíz medida y sin sexo, que es cambiar para qué
sirve el EN SUMA.

### La pastilla dice cuánto dio

`'Dilatada (iDA >22 mm/m²)'` → `'iDA de 23 mm/m² (dilatada, iDA >22 mm/m²)'`.

El número sale del **mismo `Math.round`** que el informe ya usa para este índice, para que la
pantalla y el papel no puedan decir dos números.

⚠️ **EL BORDE DE REDONDEO ES REAL Y SE DECLARA.** Con un índice entre 22,0 y 22,5 la pastilla dice
«iDA de 22 mm/m² (dilatada, iDA >22 mm/m²)», que leído literal se contradice. Medido: peso 45,
talla 156, raíz 31 mm → índice **22,1996**. **No se cambió el redondeo**: es la convención que el
papel comparte y moverla es decisión de Maicol. → `docs/PENDIENTES.md` **Y-c**, y TC-521 (B3) lo
fija tal como es para que pueda ponerse rojo el día que se decida.

---

## 5 · Dos premisas de la orden que resultaron falsas, medidas

1. **El 4b no tenía nada que alinear.** La orden dice «la guía dice ≥45 mm y la app aplica >45».
   Medido con `marfanEstado()` sobre el árbol de HEAD: **44,9 → `sin_indicacion`; 45,0 →
   `cx_iia`**, «considerar cirugía de la aorta (ESC 2024, Tabla 62 · folio 114, Clase IIa · Nivel
   C desde 45 mm con factores)». La app **ya aplica `>= 45`** (`UMBRAL.marfan.iia = 45` con
   `maxAo >= u.iia`). El `maxAo > 45` que `G-c` citaba es el de **Loeys-Dietz**, dentro de
   `if (sind === 'lds')`, y ahí el estricto es **correcto**: su Tabla 66 dice «SUPERIOR A 45 mm».
   **`G-c` era un pendiente falso y se corrige en `docs/PENDIENTES.md`.**
2. **El corte del TRIV no se pudo verificar** — ver §2.

---

## 6 · Cómo medir esta zona

```bash
node scripts/_probe_yab.mjs --file "$PWD/_head_y.html" --out /tmp/y.HEAD.json --solo vacio,ajeno,yAo36,yAo39
node scripts/_probe_yab.mjs                           --out /tmp/y.NEW.json  --solo vacio,ajeno,yAo36,yAo39
node scripts/_ab_ydiff.mjs /tmp/y.HEAD.json /tmp/y.NEW.json
node scripts/_probe_ywk.mjs --out /tmp/ywk.json     # dos motores x cuatro anchos x dos temas
python3 scripts/_mut_y.py                            # EN UN WORKTREE, nunca sobre el vivo
```

⚠️ **LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO** (`_head_y.html`) y no en `/tmp`: el
archivo carga su tipografía por ruta relativa, así que una copia en `/tmp` fabrica un error de
consola que no existe. Es la trampa 8a del mapa de la tanda G.

⚠️ **EL DENOMINADOR DE LA SONDA BUSCABA EL ESPEJO DEL TRIV CON GUION BAJO**, y el campo va con
guion medio: decía «NO EXISTE» en los **dos** árboles y el A/B del commit 2 daba cero sin que eso
probara nada. Lo destapó mirar el volcado, no la lectura. **Un denominador que no distingue los
dos lados no es un denominador.**

⚠️ **DOS CASOS VIEJOS CUENTAN LAS FILAS DE ESE CUADRO, Y SON EL MISMO INVARIANTE ESCRITO CON
OTRAS PALABRAS**: TC-476 («el cuadro del VD tiene DIEZ filas») y **TC-457** («el cuadro del VD
tiene DIEZ filas (7 + FEVD + Qp + VD/VI)»). Grepear el conteo encontró uno y no el otro, y a
TC-457 lo destapó la **corrida completa**. Es el mismo modo de falla que la tanda C2 documenta con
TC-520: una afirmación de inventario no se encuentra buscando el nombre de lo que tocaste.

⚠️ **DOS MUTACIONES NO APLICARON AL PRIMER BARRIDO Y NINGUNA ERA FALTA DE COBERTURA**: las dos
estaban mal escritas. La 02 no contaba el `style="display:none;"` del marcado, y la 06 se anclaba
en `if (dst.value === src.value) return …`, que aparece **seis** veces en el archivo —es el patrón
de todos los espejos de la casa—. Corregidas, **13/13 muertas**.

---

## 7 · Los dos acentos graves que costaron dos corridas

El cuerpo de un caso de prueba y el de una sonda son **template literals**: un acento grave
—aunque esté dentro de un comentario— cierra la cadena y el archivo deja de parsear con un
`SyntaxError` que apunta decenas de líneas **antes** del culpable. Pasó dos veces en esta tanda,
las dos en comentarios que yo mismo escribí nombrando un id entre acentos graves.

**Lo que sirve es `node --check` sobre el archivo.** `check_backticks.py` no los cazó: sus cuatro
hallazgos son los de `_probe_aj2.mjs`, preexistentes y falsos positivos.
