# Mapa — el editor SOBRE LA HOJA, los dos documentos en blanco y el encabezado (PANT-33)

Armado sobre el sello **`v20261110-2022`** (md5 `b3259e74`). **Sin numeros de linea a proposito**:
la linea cambia en cada edicion y el nombre de la funcion no.

Lo de PANT-30 y PANT-31 sigue en `docs/mapa/pant30-documentos-protesis.md` y
`docs/mapa/pant31-hoja-ppt.md`; el almacen de modelos de PANT-32, en
`docs/mapa/pant32-modelos-documentos.md`. **Lo que esta tanda cambia de ahi queda dicho aca.**

---

## 1 · El encabezado: de donde sale el nombre y donde cae el logo (PARTE D)

| que | quien |
|---|---|
| la institucion del documento | `docDatos()`, que **delega en `hdrCentroNombre()`** |
| el centro de trabajo del medico | `ecoGetCentroPrincipal()` → `localStorage['ett_centro_principal']` |
| el texto gris cuando no hay dato | la constante **`DOC_INST_PH`** y la clase `.doc-enc-ph` |
| el nombre corregido en ESTA hoja | `_docEst[clave].inst`, puesto por `docInstEditada` |
| los datos que leen las tres superficies | **`docDatosHoja(clave)`** |
| el encabezado del papel | `encabezado()`, dentro de `docMaquetar` |
| el encabezado de la pantalla | el bloque `enc` de `docHojaHTML` |

⚠️ **ANTES DE ESTA TANDA `docDatos()` LEIA OTRO CAMPO, y los dos estados eran incorrectos.** Su
cadena era `sv('med-centro')` → `centro_nombre_activo` → `'CeiboMed'`, y ninguno de los tres es
el «centro de trabajo»: ese vive en `ett_centro_principal`. Medido en la TAREA 0 con GREMEDA
cargado, `docDatos().inst` devolvia **`CeiboMed`** con el modo institucional apagado — o sea OTRA
institucion, que es peor que una raya — y **cadena vacia** con el modo encendido, que es de donde
salia la raya que el medico vio.

⚠️ **SE DELEGA Y NO SE COPIA LA CADENA.** `hdrCentroNombre()` es el dueño unico de «que
institucion es esta» — el que pinta el boton 🏥 de la cabecera —: con la cadena copiada, el
documento y la cabecera podrian nombrar dos instituciones distintas el dia que una cambie.
`centro_nombre_activo` queda como ultimo recurso para instalaciones viejas, y **el respaldo
escrito a mano salio**.

⚠️ **LA RAYA ESTABA EN UNA SOLA LINEA**: `docHojaHTML` escribia `escHtml(D.inst || '—')`, y
ademas dibujaba un **circulo de iniciales VACIO**. Hoy, sin dato, va una linea gris con
«Nombre de la institución», por `::before` sobre el elemento **vacio** y no como texto adentro —
vacio, lo que se escribe es lo que vale —, y el papel no emite ninguna operacion de nombre: por
eso **no se imprime**, y no por una regla de impresion.

⚠️ **EL LOGO VUELVE A LA DERECHA (D3).** PANT-31 lo habia pasado a la izquierda leyendo «rincon
izquierdo» de su propia orden. Medido antes: el circulo caia en **x 21 mm** de una hoja de 210.
Hoy el circulo cae en `G.W - G.MR - 7` = **189** y el logo en `G.W - G.MR - LOGO_W` = **178**,
con el borde derecho en 196. En pantalla **lo que lo mueve es el ORDEN DEL DOM** — hueco,
nombre, logo — sobre la misma grilla `18mm 1fr 18mm`: no hay una regla nueva.

El nombre sigue **centrado en el ancho de la HOJA** (`k:'c'`, que centra en `G.W/2`, y la columna
del medio en pantalla), con el ancho de envoltura descontando el logo **de los dos lados**.

### El nombre editable de la hoja del Informe (D2)

En la hoja del **Informe** el nombre lleva `contenteditable` y `data-doc-inst`; en la hoja de
**Configuracion** no. Lo que se escribe va a `_docEst[clave].inst` y lo aplican las **tres**
superficies por un solo lector, `docDatosHoja()`: con la correccion aplicada solo al pintar, el
medico veria su institucion en la pantalla y la de la app en el papel. **No toca el modelo.**

---

## 2 · Configuracion → Documentos queda minima (PARTE A)

Lo que hay: el interruptor `cfg-docs-on` (clave `ecosmart_doc_boton`), la lista `cfg-docs-lista`
y el pie `cfg-docs-pie`. **Nada mas.**

**Lo que SALIO con su codigo**, no oculto: `cfgDocsExportar`, `cfgDocsImportar`, `cfgDocsAgregar`,
`cfgDocsAgregarCancelar`, `cfgDocsEditarNuevo`, `cfgDocsBorrar` y `docmodNuevo`, mas los ids
`cfg-docs-cupo`, `cfg-docs-botones`, `cfg-docs-add`, `cfg-docs-imp`, `cfg-docs-imp-btn`,
`cfg-docs-tipo` y `cfg-docs-ed`, mas las constantes `DOCMOD_AJENO`, `DOCMOD_3PROP`,
`DOCMOD_BYTES_MAX`, `DOCMOD_PREGS_NUEVAS` y `DOCMOD_CONST_TXT`, mas el CSS del editor viejo
(`.cdd-*`) y la regla del cupo.

**Lo que NO salio**: `docmodValidar`, que sigue siendo el guardian del almacen — un
`localStorage` lo puede editar cualquiera —, **con su rama de `prop`**, porque los documentos
propios que PANT-32 pudiera haber dejado en disco tienen que seguir validando para que el
almacen entero no se descarte.

La fila: nombre, **una** etiqueta de tipo (`docmodEtiqueta`), «Oculto en el menú» si corresponde,
el interruptor «Mostrar en el menú» y «Editar». Los dos oyentes van **delegados** en el
contenedor con la guarda `cont._cdDeleg`.

### A5 · los propios de PANT-32 no se listan y no se borran

`docmodLista` dejo de recorrer `st.prop`; `docmodLeer` y `docmodEscribir` lo pasan de largo
**intacto**. Borrarlos seria decidir por el medico sobre un texto que el escribio. En el arbol
real del medico habia **cero**, medido en la TAREA 0.

⚠️ **Y DE ESO DEPENDE QUE `DOCMOD_VER` SIGA EN 1 Y QUE LA RAIZ `blanco` SEA OPCIONAL.** El
almacen que PANT-32 dejo en el navegador **no tiene** esa raiz: exigirla, o subir la version,
descartaria el almacen entero — o sea lo que el medico ya edito de los cuatro incluidos —. El
validador la acepta ausente, la **completa** con su valor de fabrica, y rechaza una clave
desconocida igual que en `incl`.

---

## 3 · El editor SOBRE LA HOJA (PARTE B)

**Es la misma hoja del Informe, en el mismo overlay `#doc-ov`, con dos modos.**

| pieza | quien |
|---|---|
| el modo | `_docModo` — `'informe'` o `'modelo'` |
| abrir el editor | `cfgDocsEditar(clave)` |
| que juego de acciones se ve | `docModoSync()` |
| el estado del editor | `_cdEd = {clave, m, tit, txt, frase, firma, nom, firmaIni}` |
| el marcado de la hoja del editor | `docmodHojaEdHTML(ed, D)` |
| las partes fijas por tipo | `docmodEdPartes(m)` |
| pintar | `docmodEdRender(h)`, al que llama `docRender` |
| el cuerpo linea por linea | `docmodEdCuerpoHTML` / `docmodEdLineaHTML` |
| la clase de cada linea sin tocar el cursor | `docmodEdClases(el)` |
| «una linea, un div» | **`docmodEdNormalizar(el)`** |
| leer el texto | **`docmodEdLeerCuerpo(el)`** |
| el boton que se apaga | `docmodEdSync()` |
| guardar | `docmodEdGuardar()` |
| volver al original | `docmodEdOriginal()` |
| cerrar | `docmodEdCerrar()` → `docmodEdSalir()` |
| la ayuda | `docmodEdAyuda()` y la constante `DOCMOD_AYUDA` |
| el dialogo con su texto y su accion | **`docConfPreguntar(txt, rotuloOk, fn)`** |
| modelo ⇄ un solo texto | **`docmodModeloATexto` / `docmodTextoAModelo`** |

⚠️ **`_docAbierto` LLEVA LA CLAVE EN LOS DOS MODOS Y `_docModo` DICE CUAL.** Asi el zoom, el
reajuste al cambiar el ancho y el Escape siguen siendo los mismos: una segunda nocion de «que
hoja esta abierta» obligaria a tocar las cinco funciones de la hoja. Lo que **no** se toca en
modo modelo es `_docEst`, que es el estado de la hoja del Informe.

⚠️ **EL MODELO QUE SE GUARDA TIENE LA MISMA FORMA QUE EN PANT-32** — `{tit, frase, txt}` o
`{tit, pregs:[{t,x}]}` —, y eso no es casualidad: el editor convierte el modelo a UN texto y el
texto al modelo, asi que el almacen, su validador, la derivacion del original y la regla de oro
siguen siendo los mismos. **El unico camino nuevo es la conversion.**

⚠️ **Y ESA CONVERSION TIENE QUE DEVOLVER LA MISMA FORMA, no solo la misma tinta.**
`docmodIgualAlOriginal` compara los dos **cuerpos**: si la vuelta diera el mismo texto con otra
forma — por ejemplo todo el cuerpo en una sola «pregunta» en vez de seis —, abrir un incluido y
guardarlo sin cambiar nada lo dejaria marcado como editado **para siempre** y su papel saldria
por el armador en vez de por su definicion. Lo destapo el barrido de mutaciones y lo fija
TC-810 (A5b) y (A5c).

### Las seis convenciones (B4)

| convencion | marca | bloque |
|---|---|---|
| **titulo de seccion** | linea que empieza con `## ` | `sec` |
| viñeta | linea que empieza con `• ` | `ul` |
| casilla | linea que empieza con `☐ Sí ☐ No ` | `chk1` / `chk2` |
| raya para escribir a mano | 3+ guiones bajos, solos | `raya` |
| negrita | `**texto**` | `pr` con sus `runs` |
| parrafo | linea en blanco | `p`, o `pchk` con un `☐` en el medio |

⚠️ **EL «## » ES NUEVO.** Medido en la TAREA 0: `docmodTextoABloques('## Titulo\nCuerpo.')`
devolvia **un solo bloque `p`**. Hace falta porque el cuerpo entero es **un** texto que el medico
puede borrar y rehacer, y los titulos de seccion son parte de ese texto. Para los consentimientos
es ademas lo que parte el cuerpo en «preguntas» y lo que las vuelve a unir.

**Las marcas se VEN mientras se escribe**, y los `**` se envuelven en negrita **sin sacarlos del
texto**: `textContent` devuelve exactamente lo que el medico escribio.

### Lo FIJO y lo editable (B3)

| documento | fijo arriba | titulo editable | fijo en medio | cuerpo | fijo al pie |
|---|---|---|---|---|---|
| constancia | `enc`, `ciudadfecha` | el `tit` | — | editable | `firma` |
| consentimiento | `enc`, `hr`, `tit` | el `sub` | `pacid` | editable | declaracion, tabla de firmas, hojas comunes |
| en blanco | `enc`, `ciudadfecha` | — | — | editable | `firma`, si se pide |

Las partes fijas se dibujan con `docHojaHTML(..., false)`, con un **paciente FICTICIO** (María
Fernanda Pérez, CI 1.234.567-8) y la **institucion y el logo REALES** del medico.

### ⚠️ Las tres trampas del cuerpo editable, las tres medidas con teclado real

1. **El `input` de un Enter llega con el `target` puesto en el DIV de la LINEA nueva**, no en la
   zona editable, asi que un `hasAttribute` sobre el target devolvia falso y la pulsacion se
   perdia. Se busca con **`closest`**.
2. **Tras borrar TODO el cuerpo el cursor queda en el CONTENEDOR**, antes del `div` que
   sobrevive, asi que lo escrito entraba como un nodo de texto **suelto** y el Enter siguiente lo
   volvia a mandar al principio: «AAA» Enter «BBB» daba **«BBBAAA»**. `docmodEdNormalizar`
   garantiza «una linea, un div» en **cada** pulsacion y baja el cursor a su linea.
3. **`innerText` cuenta una linea EN BLANCO como DOS saltos** — el `<br>` mas el borde del
   bloque —, asi que el texto volvia con un salto de mas. Se lee el `textContent` de cada hijo.

⚠️ **Y UNA TRAMPA DEL ARNES**: `S.tecla('Enter')` manda keyDown y keyUp **sin `text`**, y asi
Chrome no inserta parrafo en un `contenteditable` — el DOM no cambia y el cursor se va al
contenedor —. Con **`escribir('\r')`** el Enter parte la linea como el del medico. Las sondas de
esta tanda usan la segunda forma; `scripts/_probe_p33lin.mjs` lo mide paso a paso.

### El pegado

El oyente de `paste` es el mismo del documento. **Dentro del cuerpo editable los saltos de linea
se conservan**: ahi la linea en blanco separa parrafos y la primera linea decide si el tramo es
un titulo, una viñeta o una casilla.

⚠️ **Y `docSan` SE APLICA LINEA POR LINEA.** Su ultimo reemplazo manda a un espacio todo lo que
no esta entre U+0020 y U+00FF, y **U+000A es el salto de linea**: con `docSan` sobre el texto
completo, un texto pegado de tres parrafos entraba como UNA sola linea. Lo destapo TC-812 (C3).

---

## 4 · Los dos documentos en blanco (PARTE C)

| que | quien |
|---|---|
| las dos claves fijas | `DOCMOD_BLANCOS = ['b1','b2']` |
| sus nombres de fabrica | `DOCMOD_BLANCO_NOM` y `docmodBlancoNom(clave)` |
| si una clave es un blanco | `docmodEsBlanco(clave)` |
| su raiz en el almacen | `st.blanco = {b1:{vis,nom,txt,firma}, b2:{…}}` |
| su modelo | la rama `blanco` de `docmodModelo` |
| su armado | la rama `blanco` de `docmodArmar` |
| su cuerpo y su interlineado | `DOCMOD_SZ.blanco` = 10,2 y `DOCMOD_LH.blanco` = 13,4 |
| la hoja del Informe | `docmodEdRenderBlanco(h, st)` |
| los bloques de la hoja abierta | **`docBloquesHoja(clave, D)`** |
| vaciar | `docmodEdVaciar()` |
| la casilla de firma del modelo | `cfg-doc-firmam` → `_cdEd.firma` → `st.blanco[k].firma` |
| la casilla de firma de ESTA hoja | `cfg-doc-firma` → `_docEst[clave].conFirma` |

**Son DOS CLAVES FIJAS y no dos «propios»**, y es lo que los hace medibles: la lista y el menu
tienen **seis** filas siempre — no «hasta seis» — y no hay nada que crear ni que borrar.

**Son virgenes (C2)**: encabezado, la fecha arriba a la derecha, el cuerpo y — si se pide — la
firma. **Sin titulo, sin linea del paciente, sin declaracion, sin tabla de firmas y sin hojas
comunes.** Con el texto vacio y sin firma, el papel es **una hoja de 5 operaciones**.

⚠️ **LA FIRMA NUNCA QUEDA SOLA EN UNA HOJA (C5), y no hizo falta un mecanismo nuevo**: el
**ultimo** bloque del cuerpo viaja con la firma en el grupo `firmas`, que es el que `docMaquetar`
mide con `altoGrupo` antes de abrirlo y pasa de hoja si no entra. Es el mismo recurso con el que
la declaracion y la tabla de firmas de los consentimientos viajan juntas. Medido en **trece**
largos distintos: en ninguno la firma queda sola.

⚠️ **EN EL INFORME UN BLANCO SE EDITA COMO EN EL EDITOR — una sola zona —, Y NO ES UNA
PREFERENCIA**: con el texto vacio no hay un solo bloque al que ponerle `contenteditable`, asi que
una hoja bloque por bloque no tendria donde escribir.

⚠️ **`conFirma` Y NO `firma` EN EL ESTADO DE LA HOJA**: `st.firma` ya era la **firma de los
datos** de la app con los que se armo la hoja, y dos cosas distintas con el mismo nombre habrian
hecho que el aviso «Actualizar con los datos» se disparara al tildar una casilla.

⚠️ **`cfgDocsVis` NECESITA SU RAMA.** Sin ella el interruptor de la fila de un blanco se movia y
el documento **seguia en el menu**. Lo destapo TC-804 (A6), que oculta los seis y exige que el
menu lo diga.

---

## 5 · Los ids nuevos, y por que llevan prefijo `cfg-`

Los controles nuevos de la barra son `input` de verdad: `cfg-doc-frase`, `cfg-doc-firmam`,
`cfg-doc-firma` y `cfg-doc-nom`. **Con cualquier otro prefijo entrarian al censo de campos del
estudio y al Excel.** `cfg-` esta en las **dos** listas a la vez
(`_CAMPOS_FUERA_DEL_ESTUDIO` y `_noEsDelEstudio`), medido. Y **ninguno** de los ids nuevos
termina en `-aviso` ni en `-badge`, que son los barridos por sufijo de «Nuevo estudio» — es lo
que PANT-30 pago con `doc-aviso`, que se llevaba el boton del aviso puesto.

Los demas ids nuevos son de pantalla: `doc-acc-informe`, `doc-acc-modelo`, `doc-mod-guardar`,
`doc-mod-orig`, `doc-mod-vaciar`, `doc-mod-ayuda`, `doc-mod-x`, `doc-ayuda`,
`cfg-doc-frase-wrap`, `cfg-doc-firmam-wrap`, `cfg-doc-firma-wrap` y `cfg-doc-nom-wrap`.

---

## 6 · Las sondas de la tanda

| sonda | que mide |
|---|---|
| `scripts/_probe_p33inv.mjs` | la TAREA 0: los dos campos de la institucion, donde cae el logo, la linea base del papel |
| `scripts/_probe_p33enc.mjs` | el encabezado: el nombre, el logo a la derecha, la linea gris, D5, y la edicion con teclado real |
| `scripts/_probe_p33cfg.mjs` | Configuracion minima y A5 |
| `scripts/_probe_p33ed.mjs` | el editor sobre la hoja, de punta a punta, con teclado real |
| `scripts/_probe_p33lin.mjs` | la estructura del cuerpo editable paso a paso, y la trampa del Enter del arnes |
| `scripts/_probe_p33bl.mjs` | los dos documentos en blanco |
| `scripts/_mut_pant33.py` | el barrido de 41 mutaciones dirigidas |

Las seis sondas aceptan `--file=`, asi que sirven de A/B contra cualquier arbol.
