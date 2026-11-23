# Fichas de los casos TC-1029 a TC-1034 — tanda PR5 (2026-11-23)

> Archivo propio y no un bloque en `tests-punteros-tandas.md`, que al 2026-11-23 pesa **36,4 KB**
> y está **por encima** del techo de ~35 KB. Es la misma decisión que P13 y el PROMPT 7 tomaron
> por el mismo motivo.
> Los seis caen **0/6 contra `b005504`** —el cierre de P13 + P13-B— con el mismo archivo de casos
> y sólo el `index.html` distinto, **por sus condiciones y ninguno por excepción**.

---

## TC-1029 · la ecuación de Devereux 2012 y sus cuatro dueños únicos

**Qué fija.** Los cuatro números de la orden, verificados con la superficie corporal **exacta** y
no a través de un peso y una talla que la aproximan —de ahí que la ecuación sea **pura y
expuesta**—: varón de 50 años y 1,9 m² → **34,8190 mm** con límite **39,9346**; mujer de 50 y
1,6 m² → **30,7660** con límite **35,8816**. Lo publicado son **34,8** y **30,8**, con un decimal.
El margen de 1,96 × SEE son **5,1156 mm**.

Y las piezas de la ecuación una por una: el término del sexo vale **2,67 mm** —que es el
«Male −0.267 / Female −0.534» de la Tabla 1 leído al revés— y la edad suma **0,9 mm por década**.
Sin sexo o sin superficie devuelve `null`: no inventa un valor.

**Los cuatro dueños únicos.** `MFS_Z_SEE === AOR_DEV_SEE`, `MFS_Z_EDAD_MIN === AOR_DEV_EDAD_MIN`,
`mfsZBsaDuBois(70,170) === aorBsaDuBois(70,170)` y —la que importa— el **Z de aorta y el de
Marfan son el MISMO número** sobre el mismo paciente. Medido: **+2,65232** por las dos puertas.

**Denominador** (A0): existen la ecuación, el desvío y la edad mínima.
**Y los valores no se movieron** (C1): 0,261 y 15, comparados contra el literal.

---

## TC-1030 · cuándo NO aparece nada

**Denominador** (A1) y (A2): con los cuatro datos la línea **sí** sale, nombra el esperado y trae
la diferencia en z. Sin eso, los tres «no aparece nada» de abajo miden un nodo que nunca se llenó.

**Los tres casos de la orden**: edad **14**, sin sexo, y sin peso ni talla. En los tres la línea
está vacía o escondida y `aorEspSenos` devuelve `null`. Y (B4) exige que en los tres **no haya
ningún texto de dato faltante**: la orden pide que no aparezca nada, y la pantalla ya tiene su
cartel naranja para el sexo.

**Tres bordes más.** Los **15 años exactos** sí se calculan —es el piso de la población—; sin el
diámetro sale el esperado y **no** la diferencia; y un diámetro **fuera de rango plausible** no
produce diferencia, porque el valor entra por `vPlaus('ao_sin')`.

**(D1) la cápsula NO se movió**: con 42 mm en un varón sigue diciendo «Dilatada (≥40mm)». Es la
condición que prueba que este cálculo no gradúa.

⚠️ **Todo acceso va por ayudantes con guarda** (`ESP()`, `PINTAR()`), y no es un adorno: contra un
árbol donde esas funciones no existen un acceso pelado tira `ReferenceError`, que se lleva el caso
entero y deja las condiciones de abajo sin evaluar. Es la lección de **TC-827** (PANT-37), y la
primera versión de este caso la pagó.

---

## TC-1031 · la frase en el informe y en el PDF, nunca en el EN SUMA

**El informe** trae la frase **una sola vez**, empieza con «Senos de Valsalva 42,0 mm» y lleva
«(esperado 35,1 mm para edad, sexo y superficie corporal)». El **EN SUMA** no la trae. Y (A5): la
frase no nombra ninguna guía, folio, clase, z-score ni la palabra «dilatada».

**El PDF de verdad.** Se envuelve el **constructor** de `jspdf.jsPDF` y se intercepta `text()`,
que es por donde pasa cada cadena que se dibuja; `save()` se neutraliza para que no baje un
archivo. **Denominador** (B0): el PDF se generó sin error y dibujó más de veinte textos.
⚠️ **La envoltura se instala y se restaura ACÁ**: la batería corre los mil casos en UNA página y un
caso que la deja puesta rompe a los veintitrés que también la usan. Es la lección que P8 pagó con
TC-805.

**Dos controles negativos**: sin sexo la frase no sale **ni en el informe ni en el PDF**.

---

## TC-1032 · las diecinueve cifras y folios, del mismo dueño, y ninguna en el papel

**(A)** El **dueño único** `AOR_DEV_EVID` tiene sus **cinco** bloques, con los cinco rótulos en su
orden, y las **19** cifras y folios de la orden.
**(B)** El **globo** del campo de senos las publica todas, y agrega el esperado de **este**
paciente («En este paciente el valor esperado es de 35,1 mm»).
**(C)** **Referencias → Aorta** publica las mismas diecinueve y **no** habla de este paciente.
**(D)** Ninguna guía, folio ni clase llega al informe ni al EN SUMA.

**Denominadores.** (A0) el dueño y su pintor existen. (B0) la sección de aorta está **abierta**
—por `aria-expanded`, porque `secToggle` es un toggle— y el botón del globo existe.
⚠️ La pestaña se abre **clickeando su botón** y no llamando a `showTab`: esa función lee el
`window.event` global y revienta con «reading classList» tras una escritura en IndexedDB
(**P30-d**, preexistente). Sin eso el botón mide 0×0 y el globo da **cero** caracteres.

---

## TC-1033 · el folio e165 del cor triatriatum, sin clase pegada al 15

Cita el folio **e165**, ya **no** el e164, y la línea de fuente publica el rango **e163 a e165**.

**(B1) la ORACIÓN del 15 mmHg no lleva ninguna clase ni nivel pegados**, y se mide la oración y no
una ventana de caracteres: con 80 a cada lado se captura el «clase 2a, nivel B-NR» de la oración
**anterior**, que es la de la recomendación diagnóstica del transesofágico. Esa oración dice ahora
que el umbral **no lleva clase ni nivel propios**, lo ubica en el **texto de apoyo** con su folio, y
lo sigue enmarcando como un **umbral propuesto previamente**.

**Lo que se conserva.** (C1) la clase 2a · nivel B-NR de la recomendación del transesofágico.
(C2) el autor y el año: «ACC/AHA 2025 (Gurvitz)» y «ASE 2019 (Puchalski)» — la **regla fija del
2026-11-06** prohíbe renombrar esa guía a 2026. (C3) la aplicación sigue sin graduar el cor
triatriatum y sin publicar tipos.

**(D1)** ni el folio, ni la clase, ni el umbral llegan al papel.

---

## TC-1034 · las tres colas ausentes en las cuatro ramas

**Denominadores.** (A0) las **cuatro** ramas se montan de verdad —`eaEscenario().sub` devuelve
`bfbg_paradojal`, `bg_flujo_normal`, `bfbg_clasica_flujo_normal` y `bfbg_clasica`— y (A1) las
cuatro escriben su oración en el informe. Sin eso, «la cola no está» mide un informe vacío.

⚠️ **El volumen latido se recalcula del TSVI y pisa `vol_lat`.** Para mover el flujo hay que mover
el área del tracto y su integral, y mantener el área valvular severa eligiendo la integral aórtica:
20 mm y 15 cm con 59 → AVA 0,80 y VL indexado **24**; 24 mm y 16 cm con 90 → AVA 0,80 y **37**.

**(B)** Ninguna de las tres colas queda en el informe **ni** en el EN SUMA, en las cuatro ramas.
**(C1)** Ningún número medido desaparece: AVA, Vmax, gradiente medio y FEVI siguen en las cuatro.
**(C2) a (C5)** Lo que se conserva, rama por rama: «paradojal», «flujo normal», «No configura la
forma clásica» y «BF/BG clásica».

**(D1)** La línea de **discordancia de grado** no es de este bloque y **sigue en pie**, montada con
su propia escena: pastilla «moderada» con mediciones de severa concordante.
