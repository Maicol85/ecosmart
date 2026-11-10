# Inventario de la TAREA 0 — tanda PANT-33 (2026-11-10)

Solo lectura. Nada de esto toca `index.html`. La sonda es `scripts/_probe_p33inv.mjs`, corrida
contra el arbol de la linea base: `origin/main = HEAD = 6cccf59`, sello **`v20261110-1736`**,
md5 **`4979b4ff`**, 173.563 lineas / 12.604.966 bytes, los cuatro verificados con `git rev-parse`,
`wc -l`, `wc -c` y `md5`, y el sello contra el pie (`#eco-build-sello`).

⚠️ **Los hashes de los commits de PANT-32 que `CLAUDE.md` cita son los de ANTES del rebase.** La
tanda PANT-32 se reescribio antes del push para sacar 17 demos de `docs/3d`, asi que los hashes
de su seccion de «Estado vigente» no existen en `origin/main`. La referencia valida es
`origin/main = 6cccf59`. Se corrige en el commit de documentacion de esta tanda.

---

## a) Configuracion → Documentos, tal como quedo en PANT-32

La tarjeta es `#cfg-card-docs`, entre «Imagenes del estudio» y «Modo de visualizacion».
**Todos los ids llevan prefijo `cfg-`**, y eso es lo que los deja fuera del censo del estudio y
del Excel por las dos listas a la vez (`_CAMPOS_FUERA_DEL_ESTUDIO` y `_noEsDelEstudio`); ninguno
termina en `-aviso` ni en `-badge`, que son los barridos por sufijo de «Nuevo estudio».

| pieza | id | que hace |
|---|---|---|
| interruptor del boton del Informe | `cfg-docs-on` | `cfgDocsToggleBoton` → clave `ecosmart_doc_boton` |
| indicador de cupo | `cfg-docs-cupo` | «4 de 6 documentos» (medido) |
| lista de documentos | `cfg-docs-lista` | `cfgDocsRender`, filas `.cfgdoc-fila` |
| fila de botones | `cfg-docs-botones` | envoltorio de agregar / exportar / importar |
| «＋ Agregar documento» | `cfg-docs-add` | `cfgDocsAgregar` |
| «⬇ Exportar modelos» | (sin id) | `cfgDocsExportar` |
| «⬆ Importar modelos» | `cfg-docs-imp-btn` + `cfg-docs-imp` | `cfgDocsImportar` |
| «¿Que querés agregar?» | `cfg-docs-tipo` | `cfgDocsEditarNuevo('constancia'|'consent')` |
| editor | `cfg-docs-ed` | `cfgDocsEdRender` con panel lateral de vista previa |
| pie | `cfg-docs-pie` | «El texto de cada documento es responsabilidad de la institución que lo usa.» |

**Claves de almacenamiento** (medidas): `ecosmart_doc_modelos` (`DOCMOD_KEY`, version
`DOCMOD_VER = 1`) y `ecosmart_doc_boton` (`DOCMOD_BTN_KEY`). Topes: `DOCMOD_PROPIOS_MAX = 2`,
`DOCMOD_TOTAL_MAX = 6`, `DOCMOD_LIM = {nom:60, tit:120, ptit:160, ptxt:6000, ctxt:3000, pregs:30,
total:60000}`.

**Oyentes.** Tres delegados y registrados **una sola vez** cada uno, con guarda de bandera en el
contenedor: `cont._cdDeleg` en la lista (`click` + `change`), `ed._cdDeleg` en el editor
(`input`, `change`, `click`), `m._docDeleg` en el menu del Informe. La guarda del editor no es
cosmetica: `cfgDocsEdRender` reemplaza el `innerHTML` pero **no** el contenedor, y sin ella cada
repintado colgaba un juego nuevo de oyentes.

**Estado en disco al medir**: `{v:1, incl:{constancia,cve,ete,burb → {vis:true,nom:'',ed:null}},
prop:[]}` y **cero documentos propios**.

---

## b) EL ENCABEZADO — las dos hipotesis, las dos CONFIRMADAS

### b1 · El nombre: `docDatos()` lee un campo distinto del «centro de trabajo». CONFIRMADO.

Medido con `ett_centros = ['GREMEDA']` y `ett_centro_principal = 'GREMEDA'`, que es como queda
el centro de trabajo cargado desde Configuracion:

| camino | devuelve |
|---|---|
| `ecoGetCentroPrincipal()` — el centro de trabajo | `GREMEDA` |
| `hdrCentroNombre()` — lo que muestra la cabecera de la app | `GREMEDA` |
| `sv('med-centro')` — el `span` de la cabecera vieja | `''` (vacio) |
| `localStorage.centro_nombre_activo` | `null` |
| **`docDatos().inst` — lo que usa el documento** | **`CeiboMed`** |
| **`docDatos().inst` con modo institucional en 1** | **`''` → la hoja escribe `—`** |

`docDatos()` resuelve `inst` con la cadena `sv('med-centro')` → `centro_nombre_activo` →
`'CeiboMed'` (o `''` en modo institucional), y **no mira `ecoGetCentroPrincipal()` en ningun
momento**. O sea que los dos estados son incorrectos: con modo institucional encendido sale la
raya, y apagado sale **otra institucion** («CeiboMed»), que es peor que la raya.

**La raya esta en una sola linea**: `docHojaHTML` escribe `escHtml(D.inst || '—')`. Medido con
`inst` vacia, el marcado es
`<div class="doc-enc-nom doc-dato">—</div>` y ademas un **circulo de iniciales VACIO**
(`<span class="doc-enc-ini"></span>`).

### b2 · El logo esta a la IZQUIERDA. CONFIRMADO.

Medido sobre la constancia, con la institucion `GREMEDA`:
- **papel**: el circulo de iniciales cae en **x = 21 mm** de una hoja de **210 mm** (`LOGO_W = 18`,
  `G.ML = 14`), o sea el borde izquierdo; el nombre va con `k:'c'`, centrado en `G.W/2`.
- **pantalla**: `.doc-enc` es `grid-template-columns: 18mm 1fr 18mm` → medido
  `68,03 px | 521,59 px | 68,03 px`, con las iniciales en la **primera** columna y
  `.doc-enc-hueco` en la tercera.

**El logo** sale de `localStorage['logo_centro_' + centro_tipo_activo]`, validado con
`LOGO_DATA_OK`, y entra como operacion `{k:'img', x, y, w:18, h:14, d}`. Las tres superficies lo
dibujan con la misma caja de 18 × 14 mm y sin deformarlo: jsPDF con la caja de la operacion, el
SVG con `preserveAspectRatio="xMidYMid meet"` y la pantalla con `object-fit:contain`.

---

## c) La hoja del Informe (PANT-31)

- Vive en `#doc-ov`, un `position:fixed; inset:0; z-index:300` hermano de los otros overlays, con
  `.doc-bar` fija arriba, `#doc-estado` y `.doc-hoja-wrap` → `#doc-hoja`.
- `#doc-hoja` es una **A4 de verdad**: `width:210mm; min-height:297mm`, relleno
  `12mm 14mm 13mm` (los margenes de `DOC_GEO`), y el cuerpo y el interlineado los escribe
  `docRender` en **puntos**, de la misma `def.sz`/`def.lh` que maqueta jsPDF, mas
  `--doc-sz` para los seis tamanios derivados.
- Lo que la hace entrar es `docZoomAjustar()`, que escribe `zoom` (no `transform`) con
  `Math.floor(disp/ancho*1000)/1000`, acotado a 1. Medido en PANT-31: 1 / 1 / 1 / 0,937 / 0,461
  a 1440, 1280, 1000, 768 y 390 px.
- El marcado lo arma **`docHojaHTML(bloques, D, editable)`**, la **misma** funcion que usa la
  vista previa del editor. `editable` pone `contenteditable` + `data-doc-i` (y `data-doc-j` en
  los items de una lista) en **todos** los bloques con texto.
- `docRender` cuelga un oyente `input` por bloque editable; `docEditado` guarda **texto llano**
  (y los `runs` por peso calculado en un `pr`).
- El pegado va por un oyente **delegado en el documento**, que cancela el nativo e inserta
  `text/plain` pasado por `docSan`, con `\s+` colapsado a un espacio.
- **Lo que hace falta para reusarla en Configuracion**: nada estructural. `#doc-ov` ya es
  pantalla completa y `docZoomAjustar` ya mide contra su envoltorio. Lo que falta es (1) un
  **modo**, para que la barra ofrezca otros botones; (2) que `docHojaHTML` sepa **no** poner
  `contenteditable` en los bloques fijos; y (3) una **zona editable unica** para el cuerpo, que
  hoy no existe: hoy cada bloque es su propio `contenteditable`, asi que no se puede «borrar todo
  y rehacerlo de cero».

---

## d) El modelo de datos de PANT-32

```
localStorage['ecosmart_doc_modelos'] = {
  v: 1,
  incl: { constancia|cve|ete|burb : { vis:bool, nom:string, ed: null | cuerpo } },
  prop: [ { clave:'pN', tipo:'constancia'|'consent', vis, nom, ...cuerpo } ]
}
cuerpo (docmodCuerpo) = { tit, decl, firmas, comunes } + (constancia: {frase, txt})
                                                       + (consent:    {pregs:[{t,x}]})
```

- **`ed: null` es «sin editar»**, y **no** es una bandera: `docmodModelo` compara el `ed` guardado
  contra el original normalizado y lo vuelve a `null` si coinciden. De eso depende la regla de
  oro: `docmodDef(clave)` devuelve **`DOC_DEFS[clave]` tal cual — el mismo objeto** para un
  incluido sin editar. Medido en los cuatro: `docmodDef(k) === DOC_DEFS[k]` → **true, true, true,
  true**.
- **El original se DERIVA** de la definicion por rebanado (`docmodOrig`), no se retipea.
- **Exportar e importar** (Parte E de PANT-32) tocan `st.incl` y `st.prop` enteros, con la marca
  `_ecosmart_modelos`, el tope de 200.000 bytes y el **mismo** validador que el almacen
  (`docmodValidar`), que rechaza el archivo **entero** y por **clave desconocida**.
- **Casos y anclas de PANT-32 que quedan afectados al sacar agregar, exportar e importar**:

| caso | que afirma | que le pasa en PANT-33 |
|---|---|---|
| **TC-801** | el almacen y la regla de oro; `docmodDef === DOC_DEFS` | **se mantiene**, con el conteo de documentos adaptado |
| **TC-802** | las cinco convenciones y la ida y vuelta | **se mantiene**; gana el «## » |
| **TC-803** | la seccion de Config, el interruptor, la lista, las etiquetas y el **cupo** | **se adapta**: el cupo, la etiqueta «Propio» y «Borrar» dejan de existir; la lista pasa a **6** filas |
| **TC-804** | el menu del Informe y el **editor con panel lateral** | **se adapta**: el editor pasa a ser la hoja; el menu se mantiene |
| **TC-805** | un documento **propio** de punta a punta | **se RETIRA**: agregar documentos propios deja de existir |
| **TC-806** | **exportar e importar** modelos | **se RETIRA**: las dos funciones dejan de existir |

Las anclas del barrido `scripts/_mut_pant32.py` que apuntan a `cfgDocsExportar`,
`cfgDocsImportar`, `cfgDocsAgregar`, `cfgDocsEditarNuevo`, el cupo y el tope de propios quedan
sin codigo al que apuntar y salen del barrido con su motivo.

---

## e) Donde se dibujan hoy la fecha, la firma, el paciente y las piezas finales

Son **bloques** del maquetador, y cada uno tiene su emisor en las tres superficies:

| bloque | pantalla (`docHojaHTML`) | papel (`docMaquetar`) |
|---|---|---|
| `enc` | `.doc-enc` en tres columnas | `encabezado()`: `img` o `circ` + nombre `k:'c'` |
| `ciudadfecha` | `.doc-cf`, a la derecha | `k:'r'`, «ciudad, dd/mm/aaaa» |
| `pacid` | `.doc-pacid`, paciente a la izquierda y ciudad+fecha a la derecha | dos operaciones, `k:'t'` y `k:'r'` |
| `firma` | `.doc-firma` con `margin-top:34mm` | 90 pt de aire, raya de 62 mm, nombre y matricula a la derecha |
| `tfirmas` | `table.doc-tf` | `tablaFirmas()`, 4 filas, la de «Firma» de 16 mm |
| declaracion | bloques `sec`/`p`/`ul`/`chk1`/`pchk` con `grupo:'firmas'` | los mismos, medidos juntos por `altoGrupo` |
| hojas comunes | arrancan con un `salto` | idem, tras `tfirmas` |

Medido sobre el consentimiento del ETE: **11** bloques con `grupo:'firmas'`, **1** `tfirmas`,
**2** `salto`, **1** `pacid`, **0** `ciudadfecha` y **0** `firma`. La constancia es la unica con
`ciudadfecha` (1) y `firma` (1).

**La regla de la hoja** la aplica el recorrido de `docMaquetar`: antes de abrir el grupo
`firmas` mide el grupo entero con `altoGrupo` —que mide la **tinta** y no la `y` de cierre— y, si
no entra, pasa de hoja. Es el mecanismo que la firma de un documento en blanco va a reusar.

---

## f) Como se guarda y se lee el texto editado, y que convenciones admite

- **Se guarda** en `st.incl[clave].ed = docmodCuerpo(m)` (`cfgDocsEdGuardar`), o `null` si quedo
  igual al original.
- **Se lee** en `docmodModelo(clave)`, que entrega el modelo vigente; `docmodDef` lo convierte en
  una `def` con `bloques: () => docmodArmar(m)`.
- **Convenciones** (`docmodTextoABloques` ⇄ `docmodBloquesATexto`), medidas:

| convencion | marca | bloque |
|---|---|---|
| viñeta | linea que empieza con `• ` | `ul` (con `fuerte` si trae `**…**` al principio) |
| casilla | linea que empieza con `☐ Sí ☐ No ` | `chk1` (una) o `chk2` (varias, en dos columnas) |
| raya para escribir a mano | linea de 3+ guiones bajos | `raya`, con el parrafo anterior como rotulo |
| negrita | `**texto**` | `pr` con sus `runs` |
| parrafo | linea en blanco entre medio | `p`, o `pchk` si la linea trae un `☐` en el medio |

⚠️ **NO existe hoy una convencion de TITULO DE SECCION.** Medido: `docmodTextoABloques('## Titulo\nCuerpo.')`
devuelve **un solo bloque `p`** — el «## » entra como texto literal. El titulo de seccion de un
consentimiento vive hoy en el campo `t` de cada «pregunta» (`pregs`), que el editor de PANT-32
mostraba como un `input` aparte. **La convencion `## ` de B4 hay que agregarla**, y es lo que
permite que el cuerpo entero del documento sea **un solo texto** que el medico puede borrar y
rehacer.

**Medicion del texto de los cuatro, con el cuerpo pasado a un solo texto con `## `:**

| documento | tipo | preguntas | caracteres | palabras | `##` | `•` | `☐` | raya | `**` |
|---|---|---|---|---|---|---|---|---|---|
| constancia | constancia | — | 92 | 13 | 0 | 0 | 0 | 0 | 0 |
| cardioversion | consent | 5 | 2.122 | 329 | 5 | 5 | 0 | 1 | 0 |
| ETE | consent | 6 | 3.171 | 501 | 6 | 3 | 8 | 1 | 2 |
| burbujas | consent | 6 | 2.189 | 355 | 6 | 2 | 1 | 1 | 2 |

---

## LA LINEA BASE DE D5 — el papel de los cuatro incluidos SIN EDITAR

Medido con el PDF maquetado de verdad, institucion `GREMEDA`:

| documento | bloques | hojas | operaciones de papel | `docmodDef === DOC_DEFS` |
|---|---|---|---|---|
| constancia | 8 | **1** | **13** | si |
| cardioversion | 44 | **3** | **150** | si |
| ETE | 48 | **3** | **198** | si |
| burbujas | 48 | **3** | **152** | si |

Es el **mismo** cuarteto que PANT-32 registro (1/13, 3/150, 3/198, 3/152), asi que la linea base
no se movio entre tandas. **D5 se mide contra estas cifras**: despues de PANT-33 las hojas y las
operaciones tienen que ser las mismas salvo las del encabezado.
