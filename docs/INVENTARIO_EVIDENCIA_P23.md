# INVENTARIO DE LA EVIDENCIA — tanda PANT-23 (commit 1)

Medido el 2026-11-07 sobre `index.html` con el sello **v20261107-1137** y md5 **52f7573b**,
el cierre de PANT-22 (`4c1af7d`, con `origin/main` = `HEAD`). **Este documento es de solo
lectura: el commit 1 no cambia un byte de `index.html`**, y su md5 se verifica antes y despues.

Las sondas son `scripts/_probe_pant23inv.mjs` (el orden, los globos, el gesto real y el censo
de texto) y `scripts/_probe_pant23fuera.mjs` (los globos de afuera del panel). Las dos abren
`index.html` en el Chrome del sistema por Playwright.

---

## 1 · EL MODELO: la Evidencia de la estenosis aortica

Su cuerpo NO lo pinta la grilla comun: `_indEA` es la **unica** de las 45 secciones que
devuelve `molde`, asi que `_indSecHTMLCuerpo` sale por su rama temprana y el cuerpo lo arma
`_indMoldeHTMLSec` (index.html, la funcion `_indMoldeHTMLSec`).

```
<details>  (la seccion, su summary es el titulo)
  <div>  (el cuerpo)
    aviso (si hay)
    <div data-ind-molde=1 data-ind-grid=1 data-ind-preg=1>
        franja de categoria y estadio  ->  Datos del estudio  ->  prosa de los bloques
        ->  LAS PREGUNTAS (div.ind-pregcols)  ->  pie (tabla de recomendaciones)
    </div>
    RECUADRO de la recomendacion            <- _indRecomHTML, la caja de _indCajaReco
    _indSecPie:  criterio visible  ->  <details data-ind-detalle> ver detalle
                 ->  <details data-ind-biblio> bibliografia
  </div>
</details>
```

Medido por posicion de DOM, su orden de bloques es:

    preguntas > recuadro > verDetalle > bibliografia

o sea **las preguntas primero, el recuadro despues y el «Ver detalle» con la bibliografia
abajo**. Es el orden que la decision del medico del 08/11/2026 pide para TODAS las secciones.

Sus ids y marcas: `[data-ind-molde]`, `[data-ind-grid]`, `[data-ind-preg="1"]`,
`div.ind-pregcols`, la caja de `_indCajaReco` (se reconoce por `border-left:3px solid`),
`details[data-ind-detalle]` y `details[data-ind-biblio]`.

---

## 2 · EL ORDEN VERTICAL DE LAS 45 SECCIONES DE `IND_SECS`

Las 45 abrieron con su escenario (el mismo que TC-322 usa, una semilla por seccion), cero
secciones sin semilla y cero excepciones. El orden se mide por **posicion de DOM** sobre el
HTML que `_indSecHTML` arma, no por el orden del codigo.

| # | seccion | adapt | ordenProt | preguntas | compacta | orden medido |
|---|---|---|---|---|---|---|
| 1 | Estenosis aórtica | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 2 | Prótesis aórtica | si | si | — | — | preguntas > contestado > verDetalle > bibliografia |
| 3 | Insuficiencia mitral primaria | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 4 | Insuficiencia mitral secundaria | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 5 | Estenosis mitral | — | — | — | — | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 6 | Prótesis mitral | — | si | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 7 | Insuficiencia aórtica | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 8 | Válvula tricúspide | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 9 | Prótesis tricúspide | si | si | — | — | preguntas > contestado > verDetalle > bibliografia |
| 10 | Estenosis pulmonar | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 11 | Prótesis pulmonar | si | si | — | — | preguntas > contestado > verDetalle > bibliografia |
| 12 | Tromboembolia pulmonar — estratificación del riesgo | — | — | — | — | preguntas > recuadro > verDetalle > bibliografia |
| 13 | Hipertensión pulmonar — probabilidad ecocardiográfica | — | — | — | — | preguntas > verDetalle > bibliografia |
| 14 | Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF | — | — | — | — | preguntas > verDetalle > bibliografia |
| 15 | Comunicación interauricular | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 16 | Comunicación interventricular | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 17 | Defecto del septo auriculoventricular | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 18 | Anomalía de Ebstein | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 19 | Circulación de Fontan | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 20 | Conexión venosa pulmonar anómala parcial | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 21 | Síndrome de Eisenmenger | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 22 | Ductus arterioso permeable | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 23 | Ventana aortopulmonar | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 24 | Coartación de aorta | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 25 | Estenosis subaórtica | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 26 | Estenosis supravalvular aórtica | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 27 | Foramen oval permeable | — | — | — | — | preguntas > verDetalle > bibliografia |
| 28 | Miocardiopatía hipertrófica obstructiva | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 29 | Miocardiopatía hipertrófica — prevención de muerte súbita | si | — | — | — | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 30 | Válvula aórtica bicúspide — conclusión | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 31 | Válvula aórtica bicúspide — aorta ascendente | — | — | — | — | preguntas > verDetalle > bibliografia |
| 32 | Aorta torácica — dilatación y aortopatía | — | — | — | — | preguntas > verDetalle > bibliografia |
| 33 | Ecocardiograma transesofágico — trombo en la orejuela izquierda | — | — | — | — | preguntas > verDetalle > bibliografia |
| 34 | Reparabilidad de la válvula mitral | — | — | — | — | preguntas > verDetalle > bibliografia |
| 35 | Ateroma aórtico — prevención | — | — | — | — | preguntas > verDetalle > bibliografia |
| 36 | Tetralogía de Fallot reparada — insuficiencia pulmonar | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 37 | Tetralogía de Fallot reparada — ventrículo derecho y arritmias | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 38 | Transposición de grandes arterias — indicaciones y seguimiento | si | — | si | si | contestado > preguntas > verDetalleGuia > verDetalle > bibliografia |
| 39 | Derrame pericárdico y taponamiento | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 40 | Constricción pericárdica — diagnóstico | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 41 | Congestión venosa sistémica — VExUS | — | — | — | si | preguntas > verDetalle > bibliografia |
| 42 | Perfil hemodinámico — presiones y resistencias estimadas por eco | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 43 | Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |
| 44 | Amiloidosis cardíaca — algoritmo diagnóstico | — | — | — | si | preguntas > verDetalle > bibliografia |
| 45 | Posoperatorio de cirugía cardíaca | — | — | — | si | preguntas > verDetalleGuia > verDetalle > bibliografia |

### Las 17 secciones con el recuadro ARRIBA de las preguntas — PREMISA REPRODUCIDA

Son las que PANT-17b convirtio al formato nuevo y las que esta tanda tiene que reordenar.
Su orden medido es `contestado > preguntas > verDetalleGuia > verDetalle > bibliografia`:

- Comunicación interauricular
- Comunicación interventricular
- Defecto del septo auriculoventricular
- Anomalía de Ebstein
- Circulación de Fontan
- Conexión venosa pulmonar anómala parcial
- Síndrome de Eisenmenger
- Ductus arterioso permeable
- Ventana aortopulmonar
- Coartación de aorta
- Estenosis subaórtica
- Estenosis supravalvular aórtica
- Miocardiopatía hipertrófica obstructiva
- Miocardiopatía hipertrófica — prevención de muerte súbita
- Válvula aórtica bicúspide — conclusión
- Tetralogía de Fallot reparada — ventrículo derecho y arritmias
- Transposición de grandes arterias — indicaciones y seguimiento

### Las 3 que YA estan en el orden del modelo

Las cuatro de protesis, que PANT-21 ya reordeno con la opcion `ordenProt`:

- Prótesis aórtica (ordenProt=si)
- Prótesis tricúspide (ordenProt=si)
- Prótesis pulmonar (ordenProt=si)

### Las 25 secciones SIN recuadro «Con lo contestado» — NO lo reciben

La decision del medico lo dice expresamente: solo se reordena lo que ya existe. Estas
secciones no devuelven `adapt`, asi que su cuerpo no tiene nada que mover y su DOM no cambia
en un solo nodo. La de **Protesis mitral** entra aca y aun asi trae `ordenProt`: concluye con
`recom` (su cascada `_protmRecom`) y no con `adapt`.

- Estenosis aórtica
- Insuficiencia mitral primaria
- Insuficiencia mitral secundaria
- Estenosis mitral
- Prótesis mitral
- Insuficiencia aórtica
- Válvula tricúspide
- Estenosis pulmonar
- Tromboembolia pulmonar — estratificación del riesgo
- Hipertensión pulmonar — probabilidad ecocardiográfica
- Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF
- Foramen oval permeable
- Válvula aórtica bicúspide — aorta ascendente
- Aorta torácica — dilatación y aortopatía
- Ecocardiograma transesofágico — trombo en la orejuela izquierda
- Reparabilidad de la válvula mitral
- Ateroma aórtico — prevención
- Tetralogía de Fallot reparada — insuficiencia pulmonar
- Derrame pericárdico y taponamiento
- Constricción pericárdica — diagnóstico
- Congestión venosa sistémica — VExUS
- Perfil hemodinámico — presiones y resistencias estimadas por eco
- Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento
- Amiloidosis cardíaca — algoritmo diagnóstico
- Posoperatorio de cirugía cardíaca

### Por donde se arma cada bloque

| bloque | emisor | marca en el DOM |
|---|---|---|
| las preguntas y los datos | `_indSecHTMLCuerpo` (rama normal) o `_indMoldeHTMLSec` (el modelo) | `[data-ind-grid]`, `[data-ind-preg="1"]` |
| «Con lo contestado» | `_indAdaptHTML` -> `_indCajaReco` | caja con `border-left:3px solid` y su rotulo |
| «Causas posibles del gradiente alto» | `_indCausasHTML` -> `_indCajaReco` | idem, otro rotulo |
| el recuadro de la recomendacion | `_indRecomHTML` -> `_indCajaReco` | idem, el rotulo es `r.tit` |
| «Ver detalle de la guia» | `_bloRec` dentro de `_indSecHTMLCuerpo` | `details[data-ind-bloque]` |
| «Ver detalle» del pie | `_indDetalleHTML` desde `_indSecPie` | `details[data-ind-detalle]` |
| la bibliografia | `_indBiblioHTML` desde `_indSecPie` | `details[data-ind-biblio]` |

**El emisor es UNO y compartido**: `_indSecHTMLCuerpo` emite `adapt` en dos lugares segun la
opcion `ordenProt` — arriba de la grilla cuando no la trae, debajo cuando si —, y `_indSecPie`
es el pie comun de las dos ramas de cuerpo. No hay una funcion propia por seccion.

---

## 3 · EL CENSO DE LOS GLOBOS DE LA EVIDENCIA

En el panel hay **tres** mecanismos distintos que pintan el MISMO glifo, y estan declarados
en el propio archivo (el comentario del glosario del panel):

| mecanismo | emisor | que hace | cuantos |
|---|---|---|---|
| `details[data-ind-info]` | `_indInfoHTML`, desde `_indFilaHTML` | la NOTA de una fila | **473** |
| `button[data-ind-term]` | `_indTermBtnHTML` -> `_indTermAbrir` | la DEFINICION de un termino, en la tarjeta `#indic-term` | **9** |
| `details[data-ind-detalle]` / `[data-ind-biblio]` / `[data-ind-bloque]` | `_indDetalleHTML`, `_indBiblioHTML`, `_bloRec` | el «Ver detalle» y la bibliografia de la seccion | 1 + 1 + (0 o 1) por seccion |

Los **473** `data-ind-info` son los que esta tanda tiene que uniformar. **Los 473 estan en la
TERCERA celda de su fila**, sin una sola excepcion, y `_indInfoHTML` tiene **un solo lugar de
llamada** (`_indFilaHTML`): no hay variantes escondidas.

### El mecanismo con que abre cada uno — y es una COMPUERTA DE CSS, no de codigo

`_indInfoHTML` emite siempre el mismo `<details>`. Lo que decide si su texto **flota** o si se
dibuja **dentro de la celda** son DOS reglas de la hoja de estilos, las dos acotadas a
`[data-ind-preg="1"]`:

```css
#indic-card [data-ind-grid][data-ind-preg="1"] td:nth-child(3){position:relative}
#indic-card [data-ind-grid][data-ind-preg="1"] [data-ind-info][open] > div{
  position:absolute;right:0;top:100%;z-index:3;
  width:600px;max-width:76vw;margin-top:2px;
  ... }
```

Las escribio TGA-4 (commit 3b-2) y su propio comentario declara el alcance: «Va SOLO en las
secciones de preguntas: las ocho compactas anteriores no llevan el marcador y su globo sigue
exactamente como estaba». **Ese «como estaba» es el defecto que el medico reporto.**

| mecanismo medido | globos | secciones |
|---|---|---|
| cajon flotante (dentro de `[data-ind-preg="1"]`) | **368** | 27 |
| dentro de la fila (fuera de `[data-ind-preg="1"]`) | **105** | 17 |

### Los 105 que abren DENTRO de la fila, seccion por seccion

| seccion | globos dentro de la fila |
|---|---|
| Tromboembolia pulmonar — estratificación del riesgo | 4 |
| Hipertensión pulmonar — probabilidad ecocardiográfica | 2 |
| Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF | 2 |
| Foramen oval permeable | 2 |
| Miocardiopatía hipertrófica — prevención de muerte súbita | 3 |
| Válvula aórtica bicúspide — aorta ascendente | 6 |
| Aorta torácica — dilatación y aortopatía | 7 |
| Ecocardiograma transesofágico — trombo en la orejuela izquierda | 3 |
| Ateroma aórtico — prevención | 2 |
| Tetralogía de Fallot reparada — insuficiencia pulmonar | 16 |
| Derrame pericárdico y taponamiento | 14 |
| Constricción pericárdica — diagnóstico | 12 |
| Congestión venosa sistémica — VExUS | 6 |
| Perfil hemodinámico — presiones y resistencias estimadas por eco | 6 |
| Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento | 6 |
| Amiloidosis cardíaca — algoritmo diagnóstico | 5 |
| Posoperatorio de cirugía cardíaca | 9 |

### Los 368 que ya abren el cajon, seccion por seccion

| seccion | globos en el cajon |
|---|---|
| Estenosis aórtica | 4 |
| Prótesis aórtica | 7 |
| Insuficiencia mitral primaria | 4 |
| Insuficiencia mitral secundaria | 3 |
| Estenosis mitral | 12 |
| Prótesis mitral | 4 |
| Insuficiencia aórtica | 4 |
| Válvula tricúspide | 5 |
| Prótesis tricúspide | 7 |
| Estenosis pulmonar | 13 |
| Prótesis pulmonar | 11 |
| Comunicación interauricular | 19 |
| Comunicación interventricular | 18 |
| Defecto del septo auriculoventricular | 24 |
| Anomalía de Ebstein | 23 |
| Circulación de Fontan | 26 |
| Conexión venosa pulmonar anómala parcial | 18 |
| Síndrome de Eisenmenger | 27 |
| Ductus arterioso permeable | 16 |
| Ventana aortopulmonar | 10 |
| Coartación de aorta | 16 |
| Estenosis subaórtica | 12 |
| Estenosis supravalvular aórtica | 15 |
| Miocardiopatía hipertrófica obstructiva | 16 |
| Válvula aórtica bicúspide — conclusión | 12 |
| Tetralogía de Fallot reparada — ventrículo derecho y arritmias | 20 |
| Transposición de grandes arterias — indicaciones y seguimiento | 22 |

### Los 9 `data-ind-term` (la tarjeta `#indic-term`)

- Estenosis aórtica: easintomas
- Insuficiencia mitral primaria: impsintomas
- Insuficiencia mitral secundaria: imssintomas
- Estenosis mitral: score_eco, cormier, emsintomas
- Insuficiencia aórtica: iasintomas
- Válvula tricúspide: itsintomas
- Estenosis pulmonar: epsintomas

Estos ya abren una tarjeta flotante propia, con su `role="dialog"`, su foco y sus tres
formas de cierre. **No se tocan**: son un componente distinto, con su propio registro
`IND_TERMINOS`, y la decision del medico habla del texto que se abre DENTRO de la fila.

---

## 4 · EL MECANISMO DEL MODELO, MEDIDO CON EL GESTO REAL

Panel abierto por su boton `#indic-btn`, seccion abierta, y el globo tocado con `click()`
sobre su `<summary>` — no llamando a ninguna funcion.

| ancho de ventana | ancho del panel | caja del cajon | `position` | alto de la fila antes -> despues |
|---|---|---|---|---|
| 1440 px | 820 px | 600x35 px en x=502 | absolute | 45 -> 45 px |
| 1000 px | 820 px | 600x35 px en x=282 | absolute | 45 -> 45 px |
| 768 px | 744 px | 584x35 px en x=144 | absolute | 45 -> 45 px |
| 390 px | 366 px | 296x51 px en x=54 | absolute | 87 -> 87 px |

**La fila no crece en ninguno de los cuatro anchos**, y la caja se sale de su celda a
proposito: la celda mide 44 px y la caja 600, porque `right:0; top:100%` la ancla al borde de
la celda y la cuelga debajo de la fila. El `max-width:76vw` la encoge a 584 px a 768 y a
296 px a 390, asi que nunca desborda la pantalla: `scrollH` da **0** en los cuatro.

### Como se cierra, y el aria que lleva

| forma | medido |
|---|---|
| tocar el mismo globo otra vez | abre=True, cierra=True |
| Escape | abre=True, cierra=True |
| tocar afuera | abre=True, cierra=True |
| una X | **NO TIENE** (medido: False) |

Y **una sola abierta por vez**: abriendo la segunda, la primera se cierra (medido:
primera=False, segunda=True). Lo gobierna `_indInfoCerrar` desde el oyente unico de
`_indInfoCablear`, en fase de **captura** sobre el documento. El `<summary>` lleva
`aria-expanded` (medido: «false» con la nota cerrada) y un `aria-label` con el rotulo de su fila
(medido: presente). El estado lo mantiene `_indInfoSync`.

⚠️ **LA PREMISA DE LA X NO SE REPRODUCE.** La orden pide que el cajon «se cierre con la X,
con tocar afuera y con Escape». El modelo **no tiene X**: cierra de tres formas y ninguna es
un boton. Agregarle uno seria crear una variante del mecanismo — justo lo que la orden
prohibe — y ademas un nodo nuevo en 473 globos. Queda declarado en **P23-a**.

---

## 5 · LA PREMISA DEL MEDICO EN HEMODINAMICA — REPRODUCIDA

Escena: `onda_e=95`, `e_sep=6`, `e_lat=8`, `tapse=14`, con el sector **integrado al informe**
(desde PANT-22 una seccion de sector avanzado no aparece en el panel sin eso). Panel abierto
por su boton, seccion «Perfil hemodinamico» abierta, globo tocado con el gesto real.

La seccion tiene **6** globos de nota y **0** de ellos en el cajon: los seis abren dentro de
la fila. Los cuatro primeros, medidos a 1440 px:

| globo | fila antes | fila despues | caja del texto | `position` |
|---|---|---|---|---|
| Gasto cardíaco | 43 px de alto, 764 de ancho | **637 px de alto** | 56x590 px | static |
| Índice cardíaco | 43 px de alto, 764 de ancho | **716 px de alto** | 83x669 px | static |
| Resistencia vascular sistémica | 43 px de alto, 764 de ancho | **589 px de alto** | 63x542 px | static |
| Presión capilar pulmonar estimada por eco | 67 px de alto, 764 de ancho | **541 px de alto** | 63x494 px | static |

**La fila se estira de 43 a 637 px** — catorce veces su alto — y el texto se dibuja en una
tira de **56 px de ancho por 590 de alto**, dentro de la celda, que es la que mide 30 px.
Es exactamente lo que el medico vio.

⚠️ **UNA PRECISION SOBRE LA PREMISA, Y ES UNA MEDICION.** La orden dice que «la fila se
estira a casi toda la pantalla». Medido, **el ancho de la fila NO cambia**: 764 px antes y
764 despues, en los cuatro anchos. Lo que se estira es el **alto**, y hacia abajo: empuja
todo lo que viene despues. La premisa se reproduce; lo que no se reproduce es que el cambio
sea de ancho. Queda declarado en **P23-a** para que nadie busque un defecto de ancho que no
existe.

Y pasa en los cuatro anchos:

| ancho | fila antes | fila despues | caja |
|---|---|---|---|
| 1440 px | 43 px | **637 px** | 56x590 px |
| 1000 px | 43 px | **637 px** | 56x590 px |
| 768 px | 43 px | **637 px** | 56x590 px |
| 390 px | 46 px | **177 px** | 294x112 px |

### El orden de bloques de Hemodinamica

    preguntas > verDetalleGuia > verDetalle > bibliografia

No trae `adapt`, asi que **no recibe recuadro** y su orden no se toca: lo unico que esta
tanda le cambia es donde abre su globo.

---

## 6 · LOS GLOBOS FUERA DEL PANEL DE EVIDENCIA — NO SE TOCAN (P23-b)

Censados con `scripts/_probe_pant23fuera.mjs`, con el panel cerrado: **143** glifos de globo
fuera del panel, y **cero** dentro (el panel estaba cerrado, que es el control).

| mecanismo | cuantos | que abre |
|---|---|---|
| `onclick="vInfoClic(this)"` | 97 | la tarjeta flotante `#vinfo-card` |
| `onclick="vInfoClic(this,event)"` | 22 | idem |
| `onclick="event.stopPropagation();vInfoClic(...)"` | 1 | idem |
| `<summary>` de un `<details>` de Referencias | 19 | la ficha de `tab-refs` |
| sin `onclick` | 4 | nada (son rotulos) |

**120 de los 143 ya abren una tarjeta flotante** (`#vinfo-card`), que es el comportamiento
que la decision del medico pide. Los 19 de Referencias son fichas desplegables de una pagina
de consulta y no filas de una tabla. Por pestania:

| pestania | globos |
|---|---|
| `tab-valvulas` | 35 |
| `tab-congenitas` | 25 |
| `tab-congenitas2` | 22 |
| `tab-refs` | 19 (summary de ficha) |
| `tab-hemodinamica` | 10 |
| `tab-ai-vi` | 6 |
| `tab-vd` | 5 | 
| `tab-otros` | 4 |
| `tab-doppler` | 3 |
| `tab-ete` | 3 |
| `tab-cardioOnco` | 2 |
| `tab-amiloidosis` | 2 |
| `tab-pericardio` | 1 |
| `tab-contractilidad` | 1 |
| `tab-sgl` | 1 |
| `tab-informe` | 1 |
| sin pestania | 3 |

⚠️ **EL GLOBO QUE EL MEDICO VIO ESTA DENTRO DEL PANEL, Y ESTA MEDIDO.** La orden deja abierta
la posibilidad de que el globo de Hemodinamica pertenezca al sector y no al panel. No:
el que se abre dentro de la fila es un `details[data-ind-info]` hijo de
`#indic-cuerpo > details` de la seccion «Perfil hemodinamico». Los **10** globos de la
pestania `tab-hemodinamica` son otra cosa y ya abren `#vinfo-card`. **No se tocan.**

---

## 7 · LOS CASOS QUE AFIRMAN EL ORDEN O EL LUGAR DEL GLOBO

Corridos ANTES de tocar nada, sobre el arbol sellado: **19/19 verdes**. La base queda
guardada.

| caso | que afirma | choca con esta tanda |
|---|---|---|
| **TC-747** (F1) | «CONTROL NEGATIVO: en una seccion sin `ordenProt`, Con lo contestado sigue ARRIBA de la grilla» — busca la primera seccion con `adapt` y `preguntas` sin `ordenProt` y exige `contestado < grid` | **SI**: afirma justo lo que la decision del medico invierte. Hay que ADAPTARLO. |
| **TC-747** (F1b) | esa seccion ajena no declara `ordenProt` | depende de (F1); se adapta con el. |
| **TC-747** (F2c) | con `ordenProt`, «Con lo contestado» va DEBAJO de la grilla | no: sigue siendo cierto. |
| **TC-742** (A5) | el orden es preguntas, «Con lo contestado», causas y la bibliografia al final (protesis aortica) | no: sigue siendo cierto. |
| **TC-744** (C7) | sin «Con lo contestado», las causas van DESPUES de la conclusion (protesis mitral) | no. |
| **TC-745** (D5) | preguntas, «Con lo contestado» y la bibliografia al final (protesis tricuspide) | no. |
| **TC-537** (B5) | en las ocho compactas la grilla de datos es lo PRIMERO del cuerpo — y DESCUENTA «Con lo contestado» del conteo | no: el descuento lo deja indiferente al orden. |
| **TC-616** (F4) | el recuadro «Con lo contestado» sale con su numero | no: no mira posicion. |
| **TC-720**, **TC-721** | el recuadro, su conteo y el «Ver detalle de la guia» del ductus | no: buscan la caja, no su posicion. |
| **TC-322** | una cita numerada por seccion, arrancando en [1], con un escenario por seccion de `IND_SECS` | no por el orden, **SI por la numeracion**: el corchete se numera por orden de primera aparicion, asi que hay que medir si mover el recuadro renumera alguna cita. |
| **TC-293** | el detalle largo nace colapsado y hay UN control de detalle por seccion | no. |
| **TC-262**, **TC-419**, **TC-535**, **TC-533**, **TC-565**, **TC-323**, **TC-328**, **TC-329**, **TC-748** | corridos como control | no. |

⚠️ **NINGUN CASO AFIRMA DONDE ABRE EL GLOBO.** Censado: ni uno de los 19 mira el `position`
de la caja de un `data-ind-info`, ni el alto de su fila al abrirlo. Es cobertura que esta
tanda tiene que escribir, y es exactamente como un arreglo se deshace sin que nadie se
entere.

---

## 8 · EL CENSO DE `textContent` DE TODA LA EVIDENCIA — LA BASE

Con **todos** los `<details>` de cada seccion abiertos, para que nada quede fuera del texto:

| medida | base |
|---|---|
| secciones medidas | **45** de 45 |
| caracteres de texto normalizado, en total | **502468** |
| corchetes de cita, en total | **519** |
| md5 de los 45 textos concatenados | **66cf4802** |
| globos `data-ind-info` | **473** |
| globos `data-ind-term` | **9** |

El censo por seccion queda en el JSON de la sonda. Lo que los commits 2 y 3 tienen que
dejar **identico** es el conjunto de textos; lo unico que puede cambiar es el **orden**.

| seccion | caracteres | corchetes |
|---|---|---|
| Estenosis aórtica | 3212 | 2 |
| Prótesis aórtica | 11708 | 14 |
| Insuficiencia mitral primaria | 9339 | 20 |
| Insuficiencia mitral secundaria | 5777 | 21 |
| Estenosis mitral | 11211 | 37 |
| Prótesis mitral | 9604 | 29 |
| Insuficiencia aórtica | 4542 | 4 |
| Válvula tricúspide | 4805 | 2 |
| Prótesis tricúspide | 9415 | 9 |
| Estenosis pulmonar | 17777 | 5 |
| Prótesis pulmonar | 13413 | 12 |
| Tromboembolia pulmonar — estratificación del riesgo | 7191 | 10 |
| Hipertensión pulmonar — probabilidad ecocardiográfica | 10293 | 15 |
| Insuficiencia cardíaca con fracción de eyección preservada — HFA-PEFF | 5178 | 11 |
| Comunicación interauricular | 18810 | 6 |
| Comunicación interventricular | 14592 | 7 |
| Defecto del septo auriculoventricular | 18606 | 5 |
| Anomalía de Ebstein | 18850 | 5 |
| Circulación de Fontan | 20720 | 9 |
| Conexión venosa pulmonar anómala parcial | 14254 | 5 |
| Síndrome de Eisenmenger | 22103 | 5 |
| Ductus arterioso permeable | 15822 | 5 |
| Ventana aortopulmonar | 10192 | 16 |
| Coartación de aorta | 23021 | 20 |
| Estenosis subaórtica | 11935 | 7 |
| Estenosis supravalvular aórtica | 13091 | 6 |
| Foramen oval permeable | 6560 | 19 |
| Miocardiopatía hipertrófica obstructiva | 14649 | 4 |
| Miocardiopatía hipertrófica — prevención de muerte súbita | 9129 | 5 |
| Válvula aórtica bicúspide — conclusión | 18446 | 50 |
| Válvula aórtica bicúspide — aorta ascendente | 5881 | 4 |
| Aorta torácica — dilatación y aortopatía | 3996 | 3 |
| Ecocardiograma transesofágico — trombo en la orejuela izquierda | 5077 | 8 |
| Reparabilidad de la válvula mitral | 4412 | 7 |
| Ateroma aórtico — prevención | 3784 | 6 |
| Tetralogía de Fallot reparada — insuficiencia pulmonar | 7561 | 5 |
| Tetralogía de Fallot reparada — ventrículo derecho y arritmias | 22375 | 5 |
| Transposición de grandes arterias — indicaciones y seguimiento | 19674 | 8 |
| Derrame pericárdico y taponamiento | 7615 | 17 |
| Constricción pericárdica — diagnóstico | 8447 | 14 |
| Congestión venosa sistémica — VExUS | 7042 | 12 |
| Perfil hemodinámico — presiones y resistencias estimadas por eco | 11026 | 22 |
| Cardiotoxicidad por tratamiento oncológico — graduación y seguimiento | 8202 | 21 |
| Amiloidosis cardíaca — algoritmo diagnóstico | 5445 | 14 |
| Posoperatorio de cirugía cardíaca | 7686 | 8 |

---

## 9 · LO QUE ESTE INVENTARIO DEJA DECIDIDO

1. **El commit 2 toca UN lugar**: la compuerta `!ordenProt` con que `_indSecHTMLCuerpo` emite
   `adapt` arriba de la grilla. Las 17 secciones mal ordenadas pasan al orden del modelo por
   el mismo camino con que las cuatro de protesis ya estan. No hay un segundo mecanismo.
2. **El commit 3 toca DOS reglas de CSS**: las dos acotadas a `[data-ind-preg="1"]` que
   hacen flotar la nota. Sin acotarlas, los 473 globos abren el cajon del modelo con el
   mismo mecanismo, el mismo texto y el mismo `aria`. Los 473 estan en la tercera celda, asi
   que la regla de `position:relative` los cubre a todos.
3. **No se agrega ni una oracion, ni un numero, ni un nodo.** Las dos cosas que la orden pide
   y que el modelo NO tiene — una X de cierre — quedan declaradas y sin hacer.
4. **El riesgo medido es la RENUMERACION de las citas**: `_indRefMarca` numera por orden de
   primera aparicion dentro de la seccion, asi que mover el recuadro puede cambiar el numero
   de un corchete. Se mide seccion por seccion en el commit 2 y se reporta.
