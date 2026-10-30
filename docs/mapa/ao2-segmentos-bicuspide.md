# Mapa — la TANDA AORTA-2 (2026-10-30): los segmentos de la Figura 5, la coartación en el EN SUMA y la Tabla 68

> Tres commits de código. Fuentes leídas **en imagen**: la **Figura 5** y la **Tabla 68** de la
> edición INGLESA de la ESC 2024 de aorta, y la tabla de intervención en coartación de la
> **ESC 2020 de cardiopatías congénitas del adulto**, también inglesa. Los folios se comprobaron
> en el pie impreso de cada hoja.
>
> Lo que esta tanda **NO** toca: la raíz aórtica (sigue con el apartado 9.2.1.1), el Excel, los
> campos guardados, el Laboratorio y la válvula aórtica tricúspide, que sólo se inventarió.

---

## 1 · Dónde está cada cosa, por nombre de función y de constante

| Si vas a tocar… | Mirá |
|---|---|
| Los ocho tramos de la Figura 5 por sexo | `AO_FIG5`, y los dos que se aplican: `AO_ST_MM` y `AO_TUB_MM` |
| Qué segmento corta por sexo y cuál declara criterio propio | `AO_SEGS`, marcas `fig5` y `ecosmart`, al lado del valor |
| El operador de un corte (`>` o `>=`) | `aoSegPasa`, que lo deriva de `incRef`, y nadie más |
| La franja «no se puede clasificar sin el sexo» | `aoSegGrado`, rama `sinsexo`, derivada del mismo `aoSegPasa` |
| Qué se afirma por encima del corte | `aoSegDicho` · `AO_FIG5_TXT` · `AO_FIG5_CITA` |
| La cápsula de pantalla y el chip gris | `calcAorta` |
| La frase del informe narrativo | el bloque 12 de `generarInforme`, `gTxt` |
| La línea del EN SUMA | el mismo bloque, el `aoD.forEach` de abajo |
| El aviso de «Falta el sexo» | `AIVI_SEXO_PARAMS` |
| El globo ⓘ del cayado y de la descendente | `evTarjetaAoSegs(cual)` · `AO_SEGS_CARD` · claves `ao-cay-card` y `ao-desc-card` |
| El globo ⓘ de los tres criterios de la coartación | `evTarjetaCoa` · clave `coa-card` |
| La línea descriptiva de la coartación en el EN SUMA | `coaSumaFrase` · `COA_SUMA_SIT`, y su único lugar de llamada al final del bloque de la aorta |
| Los cinco umbrales de la Tabla 68 | `VAB_T68`, dentro de `_indVAB` |
| Los nueve factores y sus tres estados | `vabFactores` (dueño) y `VAB_FR_FILAS` (dibujo), dentro de `_indVAB` |
| Las fichas de Referencias | `AOR-005` (Figura 5, verificada) y `AOR-001` (los dos segmentos propios) |

---

## 2 · Commit 1 — los dos segmentos con correspondencia directa

**Decisión del médico (opción 1).** De los ocho tramos de la Figura 5 se aplican por sexo **dos**:
la **unión sinotubular** (38 mm en el varón, 33 en la mujer) y la **aorta ascendente** (40 y 36).
Son los dos que tienen correspondencia **directa** con un campo del formulario.

El **cayado** y la **aorta torácica descendente** NO la tienen: la figura parte cada uno en dos
tramos con números distintos —cayado proximal 37/34 y medio 34/31; descendente proximal 29/26 y
distal 23/20— y la aplicación los mide en **un solo campo**. Elegir uno de los dos sería decidir
por el médico qué tramo midió. Conservan su corte propio y lo **declaran** con el chip gris
«Criterio de EcoSmart»; los valores de la guía los publica su globo ⓘ nuevo.

**El seno de Valsalva no se tocó.** La figura le da 34 mm en la mujer y la app aplica 36, del
apartado 9.2.1.1, que es la decisión vigente del médico desde el AJ4-1. Que el 34 esté en
`AO_FIG5` no lo pone en juego: `AO_SEGS.ao_sin` sigue leyendo `AO_DIL_MM`.

### Lo que se dice, y dónde

La Figura 5 se titula «upper normal values»: lo que publica es el **límite superior de lo
normal**, no un umbral de gravedad. Por eso los dos segmentos alineados afirman **«por encima del
límite superior de lo normal»** y no «dilatada», en las tres superficies —cápsula, informe en los
tres estilos y EN SUMA—.

**La cita va en la pantalla y no en el papel**, y hay dos funciones y no una con un `if` adentro
para que el emisor del informe no pueda alcanzar la cadena ni por descuido: la cápsula dice
«(…mm — ESC 2024, Figura 5)» y el papel firmado dice la frase sola. Es la regla R2 de la orden y
la regla de este repositorio de que el informe no lleva citas.

### Dos arreglos que nadie pidió y que había que hacer

1. **`aoSegDil` tenía el `>=` escrito en la rama de `refSexo`.** Era la rama de la raíz, que sí
   cuenta su corte como dilatado (`incRef`). Al entrar la unión sinotubular y la ascendente por
   esa rama, ese `>=` les habría movido el borde: 38,0 y 40,0 exactos pasaban de normales a
   dilatados **en el informe firmado**, sin que ninguna orden lo pidiera. Hoy las dos ramas
   preguntan por `incRef` a través de `aoSegPasa`.
2. **La franja «sin sexo» estaba escrita** como `x >= _bajo && x < _alto`, que es correcta para
   la raíz y equivocada para un segmento con `>` estricto: daba «no se puede clasificar» sobre
   33,0 exactos —normales en los dos sexos— y en cambio clasificaba 38,0, que es normal en el
   varón y está por encima del límite en la mujer. Hoy se deriva del mismo `aoSegPasa`: la franja
   ambigua es, por definición, donde el corte del sexo bajo ya votó y el del alto todavía no.

### Lo medido

72 escenas y 1.800 claves. El **varón sale idéntico** en los dos segmentos, borde por borde (32 a
39 y 35 a 41). La **raíz** sale idéntica en sus cinco bordes. El **control negativo** —un estudio
sin un solo segmento aórtico— no mueve ni la cápsula, ni el informe en los tres estilos, ni el
EN SUMA.

---

## 3 · Commit 2 — la coartación y los tres textos de pantalla

### 3.1 · Los tres textos pasan al ⓘ

Los tres campos llevaban cada uno un texto largo con una cita suelta y **ninguno con su folio**.
Hoy cada campo lleva una línea corta y el texto completo vive en el globo `coa-card`, en la fila
«Conclusión». **Un globo y no tres**: los tres textos son el mismo criterio leído en tres campos,
y tres tarjetas que se tocan por separado son tres textos que pueden divergir.

**Se agregaron los dos datos que faltaban**, y los destapó leer la fuente en imagen:

- el pico-pico de 20 mmHg o más indica significación **«cuando no hay colaterales bien
  desarrolladas»** — condición que la pantalla no decía, y que es la que vuelve engañoso justo al
  paciente que más colaterales tiene;
- el 50 % de estrechamiento **no es «Clase IIb» a secas**: es **IIa en el hipertenso** y **IIb en
  el normotenso**. `coaConclusion` ya repartía las dos ramas bien y el texto de al lado publicaba
  una sola.

### 3.2 · La coartación llega al EN SUMA esté o no integrada

**Medido en el árbol del commit 1**: con una coartación nativa de istmo 8 mm y gradiente medio
25 mmHg —`coaConclusion` en «significativa»— y la sección **sin integrar**, el EN SUMA decía
«Estudio sin alteraciones estructurales ni funcionales significativas» y el cuerpo del informe no
la nombraba.

`coaSumaFrase` es **descriptiva y nada más**: sin clase, sin nivel y sin tabla, que es lo que el
encabezado de la orden fija. No toca `c.txt` ni el mapa `DX`; toma de la conclusión **una sola
cosa, que exista**. Con la sección integrada **no se emite** —ahí la publica `ccSumaLinea('coa')`—
así que el hallazgo nunca sale dos veces. Es la misma guarda que `ccSumaLinea('vab')` ya usa.

La bicúspide ya lo hacía desde el AJ1-3: **verificado y no rehecho**.

### 3.3 · Cada umbral de la Evidencia de la bicúspide, una sola vez

Medido en la escena de una bicúspide con ascendente 52 mm y raíz 47: «55 mm» salía **2** veces,
«52 mm» **3**, «50 mm» **4** y «45 mm» **4**. Las repeticiones vivían en la línea de fuente y en
dos notas. Y la mayúscula de en medio de la frase —«cirugía Clase I B **SI** el fenotipo es de
raíz»— se corrigió (regla R3).

---

## 4 · Commit 3 — la Tabla 68 y los nueve factores en tres estados

### 4.1 · Una premisa de la orden era falsa

La orden sospechaba que la lista de factores de la bicúspide saliera de la **Tabla 38**, que es la
de la válvula **tricúspide**. **No era así**: `vabFactores` ya aplicaba los **nueve de la Tabla
68** —tres derivados (edad, talla, coartación) y seis preguntados— y su propio comentario lo
declara desde el Y3d5. No había defecto que corregir ahí.

Lo que sí había era **inferencia**: la casilla tenía dos estados y el comentario del Y3d5 lo decía
con todas las letras —«sin marcar = no cuenta»—, así que un factor sin contestar pesaba
exactamente lo mismo que uno descartado.

### 4.2 · Los tres estados, sin un campo guardado nuevo

Los seis `vab_fr_*` **ya eran campos de texto** —la casilla era `vabchk-*`, con guión medio, y
nunca se guardó—, así que el tercer estado entra en el valor: `''` es «sin dato», que es lo que
esos campos ya valen de fábrica. **Ninguna clave nace ni se borra** y `LAB_XLS_MAP` no tiene una
sola entrada `vab_`, censado.

**Dos orígenes y un solo dueño de la respuesta**, en `vabFactores`: el campo guardado manda; si
está vacío, se lee lo contestado en el panel (`_indClin`, efímero, el mecanismo que la Evidencia
ya usa). Vive ahí y no en `_indVAB` para que la sección y la conclusión no puedan contestar
distinto sobre el mismo paciente. **Con `src` —un estudio archivado— el panel no se consulta**:
`_indClin` es del paciente que está en pantalla.

El costo, declarado: **lo que se conteste en el panel no viaja con el estudio**, y cada fila lo
dice. Un estudio viejo con `'si'` guardado lo sigue trayendo y la Evidencia lo **lee**, porque
`_indOrigen` le da prioridad al dato del estudio: con el campo cargado el control no se dibuja,
porque no hay respuesta que dar.

### 4.3 · Las seis casillas salen de la pantalla, y se midió antes de sacarlas

El criterio de la orden es «quedan sólo las casillas que alimentan el informe, el EN SUMA, el PDF
o el Excel». **Medido, no supuesto**: en tres escenas —ascendente 51 mm con riesgo bajo, 56 mm y
42 mm— se encendió cada uno de los seis por separado y el informe y el EN SUMA salieron
**idénticos en los dieciocho cruces**. Lo único que mueven es `vabConclusion().txt`, y ese texto
hoy llega **sólo al panel**: el `etePars` de la bicúspide se retiró en el Y3d8 y su
`ccHoja('vab', p, c.txt, null)` del PDF se retiró con la hoja en el Y3f6 — las dos líneas siguen
en el archivo, comentadas.

**El rótulo «Factores de riesgo» y su globo se quedan**, con una línea que dice dónde se contestan
ahora: con el bloque entero retirado, los nueve desaparecían de la pestaña sin decir a dónde
fueron, y el globo es el único lugar de esa pantalla que explica qué son.

### 4.4 · Los cinco umbrales, en una constante

`VAB_T68` los declara una vez y los consultan las dos cosas que los necesitan: las **filas de
medida**, que dicen cuál alcanza el paciente **sin repetir el número**, y el **bloque de
recomendaciones**, que los publica. Se retiró además la cuarta recomendación del bloque viejo, que
era la **misma fila de 45 mm** escrita dos veces.

⚠️ **El «más de 50 mm» va sin clase, y es una diferencia de traducción.** El inglés dice «Surgery
at >50 mm **may also be considered** in a shared decision with the patient», que es el verbo de la
Clase IIb; la edición de la SEC lo pasa a «se debe considerar», que es el de la IIa. Se usa el
sentido del **inglés** y no se le pone clase, porque la tabla no se la da: es texto del cuerpo del
folio 3647, no una fila.

⚠️ **Los tres «50 mm» que quedan no son una repetición**: son tres recomendaciones distintas —el
fenotipo de raíz, el fenotipo ascendente con factores y la decisión compartida—, que es justo lo
que la orden dice de la Tabla 38 («no puede mostrarse como un umbral único»).

---

## 5 · Cómo medir esta zona

```bash
node scripts/_probe_aorta2.mjs --file /tmp/head.html --out /tmp/a2.HEAD.json   # los segmentos
node scripts/_probe_aorta2.mjs --out /tmp/a2.NUEVO.json
node scripts/_probe_coavab.mjs --out /tmp/cv.json                              # coartación y bicúspide
node scripts/_probe_ao2wk.mjs --out /tmp/wk.json                               # Chrome y WebKit
node scripts/test_clinico.mjs --solo TC-555
python3 scripts/_mut_ao2.py            # EN UN WORKTREE, nunca sobre el árbol vivo
```

⚠️ **Las dos trampas que esta tanda pagó, y las dos están documentadas desde antes:**

1. **Abrir la pestaña no le da caja a la tarjeta.** Los tres globos nuevos informaban `0x0` y
   `0/5` en los dieciséis cruces de la sonda de dos motores —y lo mismo en los dos árboles, que
   es como un cero se lee igual que «no cambió»—. Hay que abrir la pestaña **y el acordeón**, por
   su botón real, antes de medir.
2. **El acento grave dentro de un comentario.** El cuerpo de un caso y el de una sonda son
   template literals: un backtick en un comentario cierra la cadena. Costó **cuatro** corridas en
   esta tanda, en `test_clinico.mjs` y en `_probe_ao2wk.mjs`. `check_backticks.py` no lo caza:
   lo que sirve es `node --check` sobre el archivo.
