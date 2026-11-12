# Mapa — ECO-CONECTOR-2: el panel compacto, el sondeo, el aviso, la bandeja y la regla de paciente

Tanda **ECO-CONECTOR-2** (2026-11-12). Sello al cierre en `CLAUDE.md`.
Lo de ECO-CONECTOR-1 —la capa de comunicación y la tarjeta de Configuración— vive en
`docs/mapa/ceibolink-panel.md`; acá está **lo que esta tanda agregó**. Por nombre de función y
de constante, nunca por número de línea.

---

## 1 · El panel compacto (decisión 12)

| Qué | Dónde |
|---|---|
| La cabecera: luz + interruptor + «Actualizar» | marcado, justo después del párrafo de la tarjeta |
| La luz, su color y su rótulo | `_clnkPintarLuz(color, rotulo, detalle)` |
| Los tres números | los pinta `clnkLeerEstado` en `cfg-clnk-nums`, con `_clnkChip` |
| El estilo de los plegables | la clase `.clnk-det` y su `> summary`, junto al CSS de `.cfg-grid` |
| Los tres plegables | `cfg-clnk-det-conexion`, `cfg-clnk-det-equipos`, `cfg-clnk-det-ajustes` |
| Esconderlos | `_clnkEsconderDependientes()` |
| Los tres datos del ecógrafo en una fila | `_clnkDato(cont, rotulo, valor, nota)`, que **reemplaza** a `_clnkFila` |
| El renglón compacto de un equipo | `_clnkFilaEquipo` |
| El contador del renglón cerrado de Equipos | `cfg-clnk-eq-cnt`, lo escribe `clnkLeerEquipos` |
| Que «Equipos» se abra sola | `clnkLeerEquipos`, con `pend` |
| La ayuda única de las acciones | la arma `clnkLeerEquipos` al final, como `<details>` |
| «Desvincular» | sigue siendo `cfg-clnk-bloque-desvincular`, hoy **dentro** de Ajustes |
| La ayuda de las tres vías | sigue siendo `cfg-clnk-ayuda`, hoy un `<details>`; su renglón es `cfg-clnk-ayuda-btn` |

**Los DIECINUEVE ids de ECO-CONECTOR-1 se conservaron**, el del renglón de la ayuda incluido:
hoy es el `<summary>`. Es lo que deja TC-161 en verde sin adaptarlo.

⚠️ **El `<summary>` lleva sus 44 px A MANO.** La regla táctil global de este archivo empareja
`button, [role=button], .btn, …, [onclick]` y un `summary` no es ninguno de ésos. No se le pone
`role=button` para que la regla lo alcance: eso le quitaría su semántica propia de desplegable,
que es lo que lo hace accesible de entrada.

⚠️ **Lo dinámico es lo de ADENTRO de cada `<details>`; el `<details>` es estático.** Y «Ajustes»
es al revés —su cuerpo es marcado estático— así que **ese no se vacía nunca, sólo se esconde**.
Es la línea que ECO-CONECTOR-1 pagó: un `textContent = ''` sobre un bloque con marcado estático
se lleva los campos del documento para siempre, porque el repintado los busca por id y no los
crea.

### El hueco de la columna de al lado (12f), medido

`.cfg-grid` es una grilla de **dos columnas con `align-items:start`**: la fila se alinea a la
tarjeta más alta y debajo de la más baja queda el blanco. No es un estiramiento ni un defecto.

| ancho | hueco ANTES | hueco DESPUÉS |
|---|---|---|
| 1440 px | **859** px | **120** px |
| 1280 px | 873 | 121 |
| 1000 px | 792 | 11 |
| 768 y 390 px | 0 (una columna) | 0 |

**No se movió nada, y la decisión está medida:** con el panel compacto el hueco de la fila de
CeiboLink (120 px) pasó a ser **el MENOR de las cuatro filas de dos columnas** de Config —las
otras miden 271, 270 y 349 px—. Mover la tarjeta sólo trasladaría el desparejo a otra fila y
cambiaría un orden que el médico ya conoce. La sonda es `scripts/_probe_ec2hueco.mjs`.

### El alto de la tarjeta, antes y después (12f)

Medido con el **mismo** arnés en los dos árboles, Chrome del sistema:

| ancho | sin vincular ANTES → DESPUÉS | vinculado y todo cerrado ANTES → DESPUÉS |
|---|---|---|
| 1440 px | 528 → **392** | 1195 → **456** (−62 %) |
| 1280 px | 528 → 417 | 1209 → **456** (−62 %) |
| 1000 px | 545 → 461 | 1306 → **525** (−60 %) |
| 768 px | 512 → 375 | 1161 → **440** (−62 %) |
| 390 px | 587 → 461 | 1417 → **525** (−63 %) |

El tercer estado —dos equipos, uno esperando decisión, «Equipos» abierta sola— mide 712 / 734 /
823 / 696 / 823 px: **sigue por debajo del panel viejo con un solo equipo.**

---

## 2 · El sondeo (decisión 1)

| Qué | Dónde |
|---|---|
| El intervalo | `CLNK_SONDEO_MS` = **15000** |
| ¿Corresponde sondear ahora? | `clnkSondeoDebe()` — las TRES condiciones en un solo lugar |
| Arrancar y parar | `clnkSondeoSync()`, **idempotente** |
| Un turno | `_clnkSondear(forzado)`, que nunca lanza y nunca se solapa |
| La pausa | el oyente de `visibilitychange`, el mismo patrón que la vista 2D y el 3D de la mitral |
| El arranque | colgado del documento, **no** de `cfgOnShow`: el aviso es global |
| Los enganches | `clnkToggle`, `clnkVincular`, `clnkDesvincular` y `cfgSetMode` |

**Los quince segundos:** `GET /v1/estado` no lleva token, devuelve ~150 bytes y el contrato dice
textualmente que se puede consultar «cada pocos segundos». Cuatro pedidos por minuto a loopback
no se miden en ninguna parte, y el aviso llega como máximo 15 s después de que el ecógrafo
terminó de mandar. Con 5 s correría doce veces por minuto mientras el médico escribe, sin un
solo beneficio clínico; con 60 s el médico llega antes que el aviso.

**La lista sólo se pide si el estado dice que hay algo**: `GET /v1/imagenes` lleva token y recorre
el almacén del conector; `estado` publica el contador justamente para esto.

---

## 3 · El aviso y la agrupación (decisiones 2, 3 y 8)

| Qué | Dónde |
|---|---|
| El modal | `clnkav-ov`, con `clnkav-title`, `clnkav-txt` y `clnkav-b1/b2/b3` |
| Abrirlo | `clnkAvisoAbrir(titulo, texto, bot)` — la ÚNICA puerta |
| El progreso | `clnkAvisoProgreso(texto)` |
| Cerrarlo | `clnkAvisoCerrar()` |
| La agrupación | `clnkAgrupar(lista)` y `CLNK_VENTANA_MS` = **120000** |
| Qué ya se avisó | `_clnkAvisadas`, **en memoria** |
| El aviso de imágenes | `clnkRevisarImagenes()` |
| El aviso de equipo nuevo | `clnkAvisarEquipoNuevo()` y `_clnkEqAvisados` |
| Que el aviso no se superponga | `clnkAvisoHayOtraPregunta()` y `CLNK_AV_BLOQUEANTES` |
| El nombre del equipo | `_clnkNombreEq`, que llena `_clnkCargarNombresEq()` |

⚠️ **El modal es PROPIO y no un modo más del de «Nuevo estudio», y se midió por qué:** aquél
tiene los tres `onclick` escritos en el marcado, así que un modo más obliga a reasignar los tres
manejadores al abrir. Eso pone en riesgo las dos salidas que ese modal protege —«Nuevo estudio»
y «Cerrar sesión»— y deja abierta la posibilidad de que queden puestos los manejadores del aviso
cuando el médico apriete «Nuevo estudio».

⚠️ **El aviso no dice un solo dato del paciente, y no podría aunque quisiera:** la lista del
contrato §3.8 no los trae —`vista` queda en `null` a propósito— y los datos del paciente viven
**sólo** adentro del archivo DICOM, que recién se baja cuando el médico aprieta «Adjuntar».

**La ventana de dos minutos es DESLIZANTE** —cada imagen se compara con la ANTERIOR del mismo
equipo— y de ahí sale el número: un estudio sale del ecógrafo en una tanda continua, y dos
minutos cubren un envío lento de veinte imágenes a seis segundos cada una sin alcanzar nunca el
hueco que hay entre dos pacientes. Con un bloque fijo desde la primera, un envío de treinta se
partiría en dos avisos.

⚠️ **EL AVISO NO SE ABRE ENCIMA DE OTRA PREGUNTA, y eso salió de revisar el propio diff, no de un
caso.** El sondeo corre en segundo plano, los dos modales viven con el mismo `z-index` y el del
aviso está **después** en el documento, así que ganaba y le tapaba al médico la pregunta que
decide si pierde un estudio. Hoy el aviso se posterga si hay otra abierta —el modal de «Nuevo
estudio», la hoja de un documento, la contraseña de Deformación o el login— y no se pierde nada:
las imágenes siguen esperando y el próximo turno vuelve a ofrecerlas, que es lo mismo que pasa al
cerrarlo. Se mira una **lista** de los modales que hacen una pregunta y no «cualquier cosa con
`z-index`»: la app tiene decenas de superficies flotantes —el visor, los paneles, el 3D— y
postergar por cualquiera de ellas lo volvería un aviso que no llega nunca. **Falla cerrado.**

⚠️ **El límite está declarado:** si el médico manda DOS pacientes seguidos desde el mismo equipo
con menos de dos minutos entre el último de uno y el primero del otro, los dos salen en UN
aviso. No hay forma de distinguirlos con lo que el contrato entrega.

---

## 4 · Adjuntar, confirmar y descartar (decisiones 4, 5 y 7)

| Qué | Dónde |
|---|---|
| Adjuntar al estudio | `clnkAdjuntarAlEstudio(ids)` |
| La descarga de bytes | `clnkPedir(ruta, { bytes: true })` — en la MISMA función, no en una segunda |
| Los datos del paciente | `_clnkCompletarPaciente(buf)`, con `_clnkPonerSiVacio` |
| Los cuatro tags del paciente | los expone `_dcmImgLeer`: `pacNombre`, `pacNacimiento`, `pacSexo`, `estudioFecha` |
| La lista por confirmar | `_clnkPorConfirmar`, y `clnkOlvidarPendientes()` |
| Confirmar | `clnkConfirmarPersistidas()`, llamada **desde dentro del `ok` de `CeiboImg.guardar`** |
| Descartar | `clnkDescartar(ids)` |

⚠️ **Confirmar va dentro del `ok` de la escritura y NO en `guardarInforme`.** Confirmar BORRA en
el conector, así que la condición no puede ser «el médico apretó Guardar» sino «la imagen quedó
escrita»: `imgPersistir` devuelve `false` por tres caminos que no son una decisión del médico —el
guardado de imágenes apagado, la base bloqueada y una reimpresión en curso— y en los tres la
imagen NO está en disco.

⚠️ **Si confirmar falla, NO se da por borrado:** el id se queda en la lista y el próximo guardado
lo reintenta. Un 404 sí lo saca —ya no está en el conector— y no alarma al médico.

⚠️ **`_clnkPorConfirmar` se vacía en «Nuevo estudio»**, desde `imgVaciar`. Un id que sobreviviera
haría que el guardado del paciente siguiente **borrara del conector** una imagen que no entró a
ningún estudio, y confirmar es irreversible.

⚠️ **El `PatientID` del DICOM NO se lee ni se escribe como documento**: en un ecógrafo de
hospital es el número de historia clínica de la institución, no una cédula. No tenerlo en
`_dcmImgLeer` es la forma de que nadie lo escriba por descuido.

---

## 5 · La bandeja sin estudio (decisión 6)

| Qué | Dónde |
|---|---|
| La base | `CLNKB_DB` = **`ceibomed_bandeja`**, store `sinestudio` |
| Abrir, leer y escribir | `_clnkbAbrir`, `_clnkbTx`, `clnkbGuardar`, `clnkbListar`, `clnkbBorrar` |
| El id de un registro | `_clnkbId()`, con prefijo **`clnkb_`** |
| La pantalla | `clnkb-sec`, `clnkb-cnt`, `clnkb-lista`, y `clnkbRender()` |
| Guardar ahí | `clnkAdjuntarABandeja(ids, equipo)` |
| El JPEG del DICOM | `_clnkbBytesADataURL(buf)`, con `_dcmImgLeer` y `_imgComprimir` |
| El repintado | `showTab`, acotado a `id === 'imagenes'` |

**BASE NUEVA, y la orden pide justificarlo.** Tres razones medidas:

1. Todo lo que recorre `ceibomed_img` lo hace **por uuid de ESTUDIO**: `CeiboImg.listar()`
   alimenta «Imágenes guardadas» y el censo de bytes; `CeiboImg.leer(uuid)` alimenta
   `imgRestaurar`, el PDF y el PPT. Un registro con uuid inventado ahí aparecería en «Imágenes
   guardadas» como si fuera un estudio.
2. La fuga que `imgRestaurar` pagó fue exactamente «un registro de esa base llegó al formulario
   de otro paciente». Con una base distinta eso **no es alcanzable**: no hay una sola ruta de
   código que lleve de esta base a `imgSlots`. Es seguridad por construcción, no por filtrado.
3. La alternativa —meterla ahí con una marca— obliga a filtrar en **cinco** lectores maduros, que
   es el argumento con que este archivo sacó los esquemas a su propia lista.

**Lo que cuesta, declarado:** una base más que abrir, y que esto **no entra al respaldo** de
`_bkExportar`, que exporta estudios y medios por uuid.

---

## 6 · La regla de paciente y el espacio (decisiones 9 y 10)

| Qué | Dónde |
|---|---|
| El predicado ÚNICO | `clnkEstudioTieneImagenes()` |
| La regla al guardar | `guardarInforme`, **antes** de la regla de siempre |
| La regla al cerrar | `_neAbrir(modo)` |
| El aviso de espacio | `clnkEspacio(usados, tope)` |
| Los umbrales | `CLNK_ESP_AMBAR` 0,85 · `CLNK_ESP_ROJO` 0,95 · `CLNK_ESP_PISO` 32 MB |

**El predicado mira las DOS cosas**, y las dos hacen falta: la marca `origen === 'ceibolink'` de
los slots en pantalla, y la lista `_clnkPorConfirmar`. La segunda cubre el **cineloop**, que
entra por `dcmImgImportar` y puede quedar como video sin slot de imagen. **Falla CERRADO.**

**La marca `origen: 'ceibolink'` vive SÓLO en memoria, y es una decisión medida:** al persistir,
`CeiboImg.guardar` la normaliza a `'estudio'`. Las dos pantallas que consumen ese campo —el
reparto de «Imágenes guardadas» y el PPT— reparten por el par cerrado `['estudio','visor']`, así
que un tercer valor en disco haría que la imagen **no cayera en ninguna de las dos grillas** y
desapareciera de «Imágenes guardadas». No se necesita en disco: la decisión 9 dice que los
estudios ya guardados no cambian de regla.

**En el modal de cierre se mantienen las TRES salidas** y no se inventa ningún bloqueo: lo único
que cambia es que «Guardar y continuar» queda deshabilitada —porque el guardado la va a rechazar
igual— y que el texto dice que las imágenes **no se pierden**. **El estado del botón se repone en
las dos ramas**, porque el modal se reusa.

**Los dos umbrales del espacio, y de dónde salen.** El contrato publica una imagen de ejemplo de
16.120.122 bytes, así que la unidad real es «cuántas imágenes más entran»: el 85 % de 2 GB deja
~322 MB (unas veinte), el 95 % deja ~107 MB (unas seis, o sea un estudio), y el piso en bytes
cubre un tope chico donde el porcentaje no significa nada.

⚠️ **El piso sólo manda si el tope es grande frente a él, y eso lo destapó un caso viejo:** con
un tope de 1 MB, 1 MB libre es menos que los 32 MB del piso, así que el aviso rojo salía sobre un
conector **vacío**. TC-841 recibía «usó 0 KB de 0 KB» con el aviso puesto.

---

## 7 · Qué NO toca esta tanda

- **La carga manual desde el pendrive**: `dcmImgImportar` y `mediosImportar` ganaron un tercer
  argumento **opcional**; sin él, el valor es el `'estudio'` de siempre.
- **El papel**: ni el informe, ni el EN SUMA, ni el PDF, ni el PPT, ni el Excel. Medido.
- **Adjuntar desde la bandeja a un estudio**, y **pasar imágenes de un paciente a otro**: son de
  ECO-CONECTOR-3.

## 8 · Las pruebas

| Qué | Dónde |
|---|---|
| Los diez casos | `TC-842` a `TC-851`, fichas en `docs/mapa/tests-fichas-842.md` |
| El conector falso | `scripts/_conector_falso.mjs`, con sus escenas |
| Los DICOM sintéticos | `scripts/_dicom_falso.mjs` |
| La prueba del conector falso | `scripts/_probe_ec2falso.mjs` |
| Los dos motores y el alto | `scripts/_probe_ec2dos.mjs` |
| El hueco de la grilla | `scripts/_probe_ec2hueco.mjs` |
| La memoria | `scripts/_probe_ec2mem.mjs` |
| Las mutaciones | `scripts/_mut_ec2.py` |
| La suite en lotes | `scripts/_lotes_ec2.sh` |
