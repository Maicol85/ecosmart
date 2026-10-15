<!-- mapa armado sobre el G3, 2026-10-15; los números de línea NO se guardan a propósito -->

# Mapa — la relación VD/VI: el número, el selector de tramo y la función dueña

Se busca por **nombre de función y de constante**, no por línea.
`grep -n 'vdViEstado' index.html`.

Salió a archivo propio en el G3 porque `docs/mapa/vd-derecho.md` estaba en **27,5 KB** y la
sección entera lo habría dejado a tiro del techo de 35 KB — medido con `wc -c` **antes** de
escribir, que es lo que `valvulas.md` aprendió pagándolo dos veces.

Lo que vive acá: el campo, el selector, sus cuatro reglas, la función dueña con su rama `src` y
los **cuatro** consumidores. La pestaña, la grilla y el cuadro de referencias están en
`docs/mapa/vd-derecho.md`.

---

## El dato tiene DOS controles y UNA fuente de verdad

| Control | id | Qué es |
|---|---|---|
| El número | `vd_vi` | `input` numérico, el cociente medido. Existe desde antes del G1 |
| El tramo | **`vd_vi_sel`** | `<select>` de tres opciones — `''` / `le1` / `gt1` — **nuevo en el G3** |

⚠️ **EL SELECTOR NO REEMPLAZA AL CAMPO, Y ESO ES LA DECISIÓN DE FONDO.** El G1 ya había
rechazado reemplazarlo: de `vd_vi` leen la categoría A de la probabilidad de HTP, el PDF y el
PPT, así que un desplegable solo habría perdido el valor medido. Lo que el médico pidió el
15/10/2026 es poder **elegir cuando no midió**, y eso es un segundo control del mismo dato.

⚠️ **EL BORDE EXACTO 1,00 ES «≤ 1» EN LOS DOS CONTROLES.** El operador de `VD_VI_HTP_MIN` es
`>`, así que 1,00 cae del lado no alterado; el selector corta igual. Es lo que impide que
tipear 1,00 y elegir «≤ 1» den veredictos distintos del mismo paciente.

---

## Las cuatro reglas, todas en `vdViSelSync`

`vdViSelSync` es el **único** que escribe el `<select>`, y `vdViSelClic` el único que registra
que la elección fue del médico.

| # | Regla | Cómo |
|---|---|---|
| a | Con número, el selector muestra el **derivado** y queda `disabled` | no se puede contradecir al dato medido |
| b | Sin número, el médico elige | el `<select>` queda habilitado |
| c | Escribir un número **pisa** la elección manual | el sync escribe el derivado encima |
| d | Borrar el número devuelve el selector a «—» **si lo había escrito la app**, y respeta la elección del médico | lo distingue `dataset.auto` |

⚠️ **`dataset.auto` NO SE PERSISTE, Y ES A PROPÓSITO.** Un estudio reabierto trae el `value` del
selector y no quién lo escribió; al abrirlo el sync lo vuelve a derivar del número cuando hay
número y lo respeta cuando no. Persistir la marca sería una segunda copia del estado que al
reabrir puede contradecir al dueño — el mismo argumento de `hfpep-` y `vauto-`.

⚠️ **LAS TRES COLUMNAS, Y LA TERCERA LA ENCONTRÓ LA SONDA.** `vdViSelSync` la llama `calcVD`,
está en `RECALC_MODULOS` **y** se repite al final de `limpiarCampos`. Sin la tercera: cargar una
relación y apretar «Nuevo estudio» dejaba el desplegable **bloqueado para siempre** sobre un
formulario vacío, porque `limpiarCampos` borra el número sin pasar por ninguno de los otros dos
caminos. Es exactamente la trampa que `vdMarcaSync` y `vdTeiAvisoSync` ya documentan.

⚠️ **VA ANTES DE LEER AL DUEÑO DENTRO DE `calcVD`.** Si corriera después, la fila del cuadro y la
probabilidad de HTP medirían el gesto ANTERIOR. Es la misma razón por la que `vdRefVisSync` va
al final, después de que la FAC ya se escribió.

---

## La función dueña — `vdViEstado(src)`

```
{ val, sel, fuente: 'numero' | 'selector' | null, alt: bool,
  estado: 'alterada' | 'no alterada' | 'sin dato' }
```

**El número manda siempre que exista** y el selector sólo habla en su ausencia: son dos formas
de decir lo mismo y una contradicción entre ellas no se resuelve a favor de la menos precisa.

⚠️ **LA RAMA `src` NO ES UN ADORNO.** `_htp2022Core` corre **también** sobre un estudio
ARCHIVADO —el panel de cohorte del Laboratorio clasifica la probabilidad de HTP de cada uno— y
ahí no hay formulario que leer. Sin esa rama, la probabilidad de HTP tendría que reabrir su
propia copia de la regla. Patrón de `emContFueraBanda(src)` y `vdTapsePsapRed(src)`.
Sin argumento lee el DOM (`v` / `sv`); con el accessor de `_hfSrcCampos`, el registro.

`vdViTexto(ascii, src)` publica el **número** cuando lo hay y el **rótulo del tramo** cuando no;
`null` sin ninguno de los dos, que es lo que las superficies ya saben descartar.

⚠️ **DOS FORMAS DEL MISMO RÓTULO, Y HACEN FALTA LAS DOS.** `VD_VI_SEL_TXT` publica `≤ 1` y
`VD_VI_SEL_ASCII` publica `<= 1`: el PDF se dibuja en helvetica y esa tabla ya escribe sus
referencias en ASCII (`'<=' + VD_BAS_NORMAL_MAX + ' mm'`). Una sola forma obligaría a elegir
entre un `≤` que el papel puede no dibujar y un `<=` en la pantalla.

---

## Los CUATRO consumidores

| # | Dónde | Qué lee | Con número |
|---|---|---|---|
| 1 | `_htp2022Core`, categoría A (ventrículos) | `vdViEstado(S).alt` | idéntico a HEAD: misma constante, mismo operador |
| 2 | Fila `vd-vi-interp` del cuadro + su visibilidad en `vdRefVisSync` | `vdViEstado()` y `vdViTexto()` | idéntico |
| 3 | PDF, fila «VD/VI» de la tabla del VD | `vPdf('vd_vi','',2)` y, sólo si da `null`, `vdViTexto(true)` | idéntico |
| 4 | PPT clínico, fila «VD/VI» de Hemodinámica | `_pptNum('vd_vi')` y, sólo si da `null`, `vdViTexto(false)` | idéntico |

⚠️ **EL VALOR QUE IMPRIME LA FILA SALE DE `vdViTexto` Y NO DE `val` A SECAS.** Con el selector y
sin número medido, `val` es `null` y la fila decía «null — dilatación del VD».

⚠️ **LA FILA SE ESCONDE POR SU VEREDICTO Y NO POR FALTA DE DATO** (decisión del G1): con el
cociente no alterado no se dibuja, porque existe para NOMBRAR un signo de probabilidad de HTP y
no para certificar su ausencia. Eso no cambió: hoy el veredicto puede venir del selector.

---

## Lo medido (`scripts/_probe_g3.mjs --solo vdvi`, con teclas y clics reales)

| Escena | Dueño | Selector | Fila | Categoría A | PDF |
|---|---|---|---|---|---|
| número 0,80 | no alterada | `le1`, bloqueado | oculta | no | `0.80` |
| número 0,99 | no alterada | `le1`, bloqueado | oculta | no | `0.99` |
| **número 1,00 EXACTO** | **no alterada** | `le1` | oculta | no | `1.00` |
| número 1,01 | alterada | `gt1` | visible | **sí** | `1.01` |
| número 1,30 | alterada | `gt1` | visible | **sí** | `1.30` |
| sin número, «—» | sin dato | `''` | oculta | no | la fila no sale |
| sin número, «≤ 1» | no alterada | `le1` | oculta | no | `<= 1` |
| sin número, «> 1» | **alterada** | `gt1` | **visible** | **sí** | `> 1` |

**Las cinco escenas con número salen IDÉNTICAS a HEAD en los cuatro lectores**, con el PDF
generado de verdad.

La secuencia de (c) y (d), en siete pasos: vacío → elige `gt1` → escribe 0,8 (el selector pasa a
`le1` con `auto=1` y bloqueado) → borra (vuelve a «—») → elige `le1` → escribe 1,3 (pasa a
`gt1`) → borra (vuelve a «—»).

Sobre un REGISTRO archivado: `{vd_vi:'1.3'}` alterada · `{vd_vi_sel:'gt1'}` alterada ·
`{vd_vi_sel:'le1'}` no alterada · `{}` sin dato · **`{vd_vi:'0.8', vd_vi_sel:'gt1'}` no alterada
— manda el número**.

---

## Lo que NO cambia

- **SIN columna de Excel.** El Excel queda en **438** con y sin el selector: el número sigue
  viajando por la suya y la elección manual **no viaja**. Declarado en `docs/PENDIENTES.md`.
- **SÍ se guarda con el estudio**: su id va con guión BAJO, así que `_noEsDelEstudio` no lo
  excluye. «Nuevo estudio» lo devuelve a «—» por el barrido de `select` a `selectedIndex = 0`.
- **EL `>= 0,9` DE LA PANTALLA DE TEP NO SE TOCA.** Es `tep_vdvi`, otro campo y otra pregunta
  —sobrecarga **aguda** del VD—, con su propia cascada en `calcTEP`. Ver `PENDIENTES` → G1-5.
- Ningún corte, ningún texto del informe y ninguna frase del EN SUMA.

## Trampas

- **El selector no entra en el conteo de `input[id]` de la grilla** (TC-476 cuenta dieciséis
  campos), pero **sí entra en el recorrido del Tab**, entre `vd_vi` y `vd_pared`.
- **Un clic que no prospera no es una medición.** La sonda **aborta** si el `<select>` está
  bloqueado: sin ese aborto, un selector `disabled` informa «sin dato» en las tres escenas y se
  lee como «el selector no hace nada». Así se encontró el defecto de `limpiarCampos`.
- **`_pptEnSuma()` NO es la fila del PPT.** Es la franja de hallazgos; la fila «VD/VI» vive en
  la tabla de Hemodinámica que arma `generarPPT`, detrás de dos modales encadenados. La sonda
  mide esa fila **por el fuente** —que llame a `vdViTexto`— y el valor por el dueño; la del PDF
  sí se genera de verdad. Declarado.
