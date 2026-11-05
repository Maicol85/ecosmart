# El corazón maestro en 3D — mapa de la tanda PANT-12 (2026-11-04)

> Mapa NUEVO. `congenitas-otros.md` está a 500 bytes del techo y **no se tocó**, que es lo que la
> orden pide. Todo lo que está acá se midió; lo que no se pudo medir se dice.

---

## 1 · Dónde vive cada cosa

| Pieza | Nombre | Qué hace |
|---|---|---|
| El botón | `#cc3d-abrir`, en `#cc3d-wrap` | Abre y cierra el módulo. **Hermano** de las dos sub-pestañas de congénitas, así que hay UNA instancia y se ve en las dos |
| El panel | `#cc3d-panel` | Contiene el módulo entero |
| El lienzo | `#cm3d-cv` | **Propio**: desde esta tanda el panel ya NO presta el recuadro de la transposición |
| El hueco del préstamo | `#cc3d-host` | Se conserva **vacío**; su regla de CSS se acotó con `.cc3d-prestamo` |
| El modelo | `cmEscena(S)` | Función **pura**: recibe el estado y devuelve el escenario |
| Las reglas | `cmBloqueado(k, S)` | Devuelve el motivo por el que una lesión no se combina, o `null` |
| El motor | `cm3dInit()` | Monta la escena y corre el bucle. Publica `cm3dBuild`, `_cm3dVistaSet`, `_cm3dInsSet`, `_cm3dNomsSet` |
| La librería | `cm3dBoot()` | Reusa `TGA3D_URL` y `TGA3D_SRI`, que son sus **dueños únicos** |
| El estado | `_cm3d` | En memoria. `_cm3d.S` es lo único que `cmEscena` necesita |
| Los controles | `cmRenderCtl()`, `cmRenderSide()` | Pintan los botones y la tabla lateral |
| Los modos | `cmSetModo(m)` | «Según el estudio» y «Explorar» |
| El globo | `cmInfoTog()` / `cmInfoCerrar()` | Abre y cierra el panel de los cuatro textos, por sus **tres** vías |
| La lectura | `cmDesdeEstudio()` | El dueño único de «qué dibuja lo cargado». **Sólo lee** |
| El repintado en vivo | `cm3dEstudioSync()` | En los **dos** registros del embudo |
| La línea de abajo | `cc3dNoDibujadas()` / `cc3dTextoSync()` | Lee `_CC_SECS`, el registro del Laboratorio |

**Marcas de extracción** (para la sonda de comparación con la demo; cada una aparece **una sola
vez** en el archivo, y si eso deja de ser cierto la sonda falla ruidosamente):
`/* ══ CM-DATOS ══` y `/* ══ CM-FIN-MODELO ══`.

---

## 2 · El modelo, en tres piezas que se suman

- **Anatomía de base** (`CM_BASES`, `CM_BVARS`, `CM_BCK`): corazón normal; tetralogía de Fallot
  (sin operar · operada, con insuficiencia pulmonar, CIV residual, estenosis residual y VD
  dilatado); defecto del septo auriculoventricular (parcial · transicional · completo, con
  insuficiencia AV izquierda); anomalía de Ebstein (con insuficiencia tricuspídea); circulación
  de Fontan (conducto extracardíaco · túnel lateral · atriopulmonar, con fenestración).
- **Lesiones que se suman** (`CM_MODS`, `CM_MCK`): CIA (secundum · primum · seno venoso
  superior); CIV (perimembranosa · muscular · de salida · de entrada); ductus; ventana
  aortopulmonar (proximal · distal); conexión venosa pulmonar anómala parcial (con CIA de seno
  venoso); coartación (nativa, con colaterales · reparada, con recoartación y aneurisma);
  estenosis pulmonar (valvular · subvalvular · supravalvular); estenosis subaórtica y
  supravalvular aórtica (con insuficiencia aórtica); cava superior izquierda persistente.
- **Eisenmenger como modificador**: invierte el sentido y el color de los cortocircuitos, dilata
  la arteria pulmonar central, afina las ramas e hipertrofia el ventrículo derecho.

**Las reglas de compatibilidad**, portadas tal cual de la demo: Fallot ya incluye la CIV, la
obstrucción pulmonar y la aorta cabalgante; el defecto AV ya incluye la CIA primum y la CIV de
entrada; Fontan no admite comunicaciones ni Eisenmenger; Eisenmenger no se combina con la
estenosis pulmonar y necesita una comunicación.

---

## 3 · La comparación con la demo: qué se compara y qué no

`scripts/_probe_pant12demo.mjs` corre el `scenario()` de la demo y el `cmEscena()` de la app con
el **mismo** estado, en 58 escenarios.

⚠️ **LA GEOMETRÍA Y LOS TEXTOS SE COMPARAN POR SEPARADO, y hubo que partirlos.** Mezclados daban
**39 «diferencias»** que eran todas de redacción y tapaban la medición. Lo que tiene que salir
idéntico es la **geometría** —arterias, corrientes, extras, rótulos y tamaños—: **58 de 58**. Los
**textos** difieren en 39 escenas, y esa diferencia **es la prueba** de que se verificaron contra
las guías.

La tolerancia declarada es **0,0005**, y los dos lados usan los mismos literales.

---

## 4 · Las tres listas paralelas de un prefijo nuevo

El prefijo es **`cm3d-`**, con guión MEDIO, y entra en las tres:

1. **`_noEsDelEstudio`** — decide qué se guarda. Sin esto los cinco controles serían campos
   guardados en todo estudio que se guarde desde hoy.
2. **`_CAMPOS_FUERA_DEL_ESTUDIO`** — decide si el formulario «tiene datos». `cm3d-fc` es un
   `input[type=number]` con 70 en el marcado: sin esto, «Nuevo estudio» **preguntaría** sobre un
   formulario vacío y el autoguardado **no restauraría** el borrador. Es lo que la tanda TGA pagó
   con `tga-3d-fc`.
3. **`data-ui`** en cada control — lo lee `secAutoOpen`. Sin esto, entrar a la pestaña **abriría
   esta sección sola**, porque las dos casillas nacen marcadas y la frecuencia trae 70.

⚠️ **El guión medio NO alcanza por sí solo**: los tres barridos van por PREFIJO y no por el
separador. Es lo que MARFAN-1 pagó con una casilla que entraba en `campos` sin que nadie lo viera
hasta medir el censo.

---

## 5 · «Según el estudio»: qué pestaña dibuja qué

`CM_MAPA` es **declarativo**: una fila por lesión, con el campo del que sale la variante.

| Lesión | Campo | Traducción |
|---|---|---|
| CIA | `ete_cia_tipo` | `secundum` → sec · `primum` → pri · `sv_vcs` → sv · **el resto cae en `sec`** |
| CIV | `ete_civ_tipo` | `perimembranosa` → pm · `muscular` → mus · `infundibular` → sal · `inlet` → ent |
| Ductus | `dap_tipo` | los **tres** valores → std (la demo no distingue el tamaño) |
| Ventana | `vap_tipo` | `i` → prox · `ii` → dis · **`iii` (total) no tiene variante: se declara** |
| CVPA | `cvpa_conexion` | `vcs` → cs · **el resto no tiene variante: se declara** |
| Cava izquierda | `otr_var_vcsip` | la casilla del commit 3, por su **propia** puerta |
| Eisenmenger | `eis_lesion_base` | `civ`/`cia`/`dap` → el modificador sobre esa comunicación · **`dsav`, `tronco`, `tga` y `otra` se declaran** |

**La dirección** sale de `ete_cia_dir`, `dap_dir` y `vap_dir`: `di` pinta azul, `id` pinta roja, y
**`bi` y vacío NO se fuerzan** —ahí queda la regla de la demo, que es la que el médico aprobó—.

⚠️ **LA CIA DE SENO VENOSO ASOCIADA NO SE LEE DEL ESPEJO.** `cvpa_cia_ro` publica la frase
**«Sin CIA consignada»** cuando no hay ninguna: preguntarle «¿tiene texto?» la encendía sobre un
estudio que dice que no. Se le pregunta al **dato**: se enciende cuando la CIA del estudio es de
**seno venoso**, que es la que la ESC 2020 asocia a la conexión anómala (hoja 29, folio 591).
**Lo destapó el cruce con «Explorar», no la lectura.**

**La línea de abajo** dice, en este orden: lo cargado y no dibujado (de `_CC_SECS`); que la
transposición tiene su propio diagrama; lo cargado cuya **opción** el dibujo no distingue; y lo
que **choca** por las reglas. En modo «Explorar» dice otra cosa: que el dibujo no es el del
estudio.

⚠️ **LA TRANSPOSICIÓN SALE DE LA LISTA DE «no dibujadas» POR SU PROPIA PUERTA** (`CC3D_PROPIO`).
Dejándola caer ahí, la línea decía **las dos cosas a la vez** —«no dibujadas todavía: TGA» y
«tiene su propio diagrama»—, que se contradicen. Lo cierto es lo segundo.

---

## 6 · Las trampas de medición que esta tanda pagó

| Trampa | Síntoma | Qué la cierra |
|---|---|---|
| **`limpiarCampos` cierra el panel** (desde PANT-3) | Las 22 escenas se medían sobre un módulo cerrado y 19 daban `{}` | Reabrirlo después de cada vaciado |
| **El alto táctil de una casilla lo da su `<label>`** | 18 px sobre un control que se toca en 44 | Medir el `<label>` |
| **`elementFromPoint` fuera del viewport da `null`** | 0 de 5 puntos sobre botones no tapados | `scrollIntoView` antes de medir |
| **El aviso sin librería se lee del nodo de texto DIRECTO** | `textContent` devolvía «VDVIAoAP», los rótulos | Recorrer sólo los `nodeType === 3` |
| **Los `am-txt-*` se crean en la primera escena** | El censo de la primera escena sale 16 más bajo, en los dos árboles | Comparar el **juego de claves**, no el total |
| **El acento grave en mis propios comentarios** | El template del caso deja de cerrar | `node --check` y contar los acentos graves de cada caso |

---

## 7 · Lo que esta tanda NO hizo

La **parte 2** del corazón maestro: «Según el estudio» para Fallot, coartación, estenosis
pulmonar, estenosis subaórtica y supravalvular, defecto del septo auriculoventricular, Ebstein y
Fontan. El motor **ya los dibuja** —están en el modelo y se ven en «Explorar»—; lo que falta es
el cableado desde sus pestañas. Ver `docs/PENDIENTES.md` → **P12-c**.

---

## 8 · Lo que la tanda PANT-13 cambió de todo esto (2026-11-04 y 05)

**Siete puntos de este mapa dejaron de ser ciertos**, y el detalle está en
`docs/mapa/pant13-explorar-tga-masas.md`:

- **`CM_BASES` tiene SEIS anatomías y no cinco**: entró la **transposición de grandes arterias**,
  con cinco variantes y dos casillas. No se portó su geometría: se llama a `tga3dEscena`, la misma
  función que usa el 3D de su pestaña, así que la equivalencia es exacta por construcción.
- **`CC3D_DIBUJA` tiene OCHO entradas** y **`CC3D_PROPIO` quedó vacío**: la línea de abajo ya no
  dice que la transposición «tiene su propio diagrama», porque hoy el módulo la dibuja.
  ⚠️ **Su recuadro NO se retiró**, y la razón está medida en `docs/PENDIENTES.md` → **P13-c**.
- **«Explorar» se rediseñó en tres zonas** (`#cm3d-shell`) y **la tabla lateral de 21 filas se
  retiró**, junto con sus filas de botones grandes. El § 1 de este mapa nombraba
  `cmRenderSide()`: hoy lo que pinta son las dos listas finas y la fila de combinaciones.
- **El módulo tiene su propio «Incluir en el PDF»** (`#cm3d-pdfb`), que funciona **sólo** en
  «Según el estudio» y queda apagado con una transposición cargada. El lienzo lleva
  `preserveDrawingBuffer:true` y `_cm3dCaptura` compone las etiquetas, porque sin eso el PNG sale
  en blanco o sin un solo rótulo.
- **El lienzo sigue al ancho de su recuadro en cada cuadro**, que es el defecto de las etiquetas
  despegadas que el médico reportó.
- **El campo de frecuencia mide 78 px** y ya no se lleva una fila entera.
