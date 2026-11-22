# Auditoría de memoria — P9, punto 4.5

**Sólo auditoría y propuesta. No se implementó compresión** (la orden lo prohíbe expresamente).
Fecha: 2026-11-22. Árbol: la tanda P9.

---

## 1 · Qué mide la barra, y por qué «5 % · 1,7 MB usado» no se contradice

El renglón visible de la barra —`imgStorageRender`— se arma así:

```
pctTxt + _fmtMB(uso.bytes) + ' usado'
```

y esos dos números **miden cosas distintas**:

| Pieza | De dónde sale | Qué incluye |
|---|---|---|
| el **porcentaje** | `CeiboImg.cuota()` → `navigator.storage.estimate()` | **TODO el origen**: las tres bases de IndexedDB (imágenes, cineloops y videos), `localStorage`, la caché |
| los **MB** | `CeiboImg.uso()` → suma de `bytes` de **`ceibomed_img`** | **sólo las imágenes fijas y los esquemas** |

Así que «5 % · 1,7 MB usado» con 35 imágenes y 41 cineloops es **exacto y a la vez
incomprensible**: el 5 % son los ~516 MB del origen sobre una cuota de ~10 GB, y el 1,7 MB son
las 35 fijas. Los cineloops —que son el 99,7 % del espacio— **no entran en el número que se lee**;
aparecen sólo en el desplegable, como «🎬 41 cineloop(s) guardado(s)», sin bytes.

**No hay ningún dato perdido ni ninguna cuenta mal hecha. Lo que hay es una frase que junta dos
mediciones.** Eso es el hallazgo.

**Tamaño por pieza, derivado de esos mismos números:**
- una **fija** en calidad media (JPEG 800×600): **~50 KB** (1,7 MB / 35);
- un **cineloop**: **~12,5 MB** de promedio (514 MB / 41). Coincide con lo que el médico midió a
  mano: 7,0 MB con 102 cuadros, y 177–258 KB una fija del VINNO.

---

## 2 · Cuál es el límite real del navegador

No hay un número fijo y **depende del navegador y del disco**:

- **Chrome / Edge** (lo que el médico usa): la cuota es por origen y se calcula sobre el espacio
  **libre** del disco — del orden del **60 %** de lo libre, compartido entre todos los orígenes.
  En una máquina con 100 GB libres son decenas de GB. `navigator.storage.estimate()` lo informa,
  y es el denominador que la barra ya usa.
- **Safari**: arranca con un límite del orden de **1 GB** por origen y pide permiso al usuario
  para crecer; además, **borra los datos de un sitio que no se visita en 7 días** si el origen no
  pidió almacenamiento persistente.
- **Modo incógnito / privado**: la cuota es chica y **todo se borra al cerrar la ventana**.

**Cuánto cabe, con los tamaños de arriba:**

| Cuota | Fijas (50 KB) | Cineloops (12,5 MB) |
|---|---|---|
| 1 GB (Safari de arranque) | ~20.000 | **~80** |
| 10 GB | ~200.000 | **~800** |
| 50 GB | ~1.000.000 | ~4.000 |

O sea: **las fijas no son el problema en ninguna escala realista; los cineloops lo son siempre.**
Con 41 cineloops el médico ya está en el 5 % de un origen de 10 GB; a 800 llegaría al tope.

---

## 3 · Qué pasa si el navegador borra datos

Esto es lo que hay que entender antes de decidir cualquier otra cosa.

Sin almacenamiento persistente, una base de IndexedDB es **«best effort»**: el navegador puede
borrarla entera, sin aviso y sin preguntar, cuando el disco se llena. Lo que se pierde:

- las **imágenes fijas** de todos los estudios (`ceibomed_img`);
- los **cineloops** y los originales DICOM (`ceibomed_cine`);
- los **videos** (`ceibomed_video`);
- la **bandeja** «Imágenes sin estudio» (`ceibomed_bandeja`).

⚠️ **Los estudios y sus informes también viven ahí** (`CeiboStore`, con respaldo en
`localStorage`), así que un borrado del origen no es «se perdieron las imágenes»: es **se perdió
el trabajo**. Y **el PDF de un estudio reabierto sale sin sus ecografías**, porque las lee de esa
base por uuid.

**Hoy la app no pide almacenamiento persistente.** Medido: no hay una sola llamada a
`navigator.storage.persist()` en el archivo.

---

## 4 · Propuestas, en orden de lo que más protege por lo que menos cuesta

### 4.1 · Pedir almacenamiento persistente (una línea, y es lo primero)

`navigator.storage.persist()` le pide al navegador que **no borre** este origen por presión de
disco. En Chrome se concede sin preguntar cuando el sitio está instalado o tiene uso frecuente;
en Safari cambia la regla de los 7 días. `navigator.storage.persisted()` dice si ya está.

- **Cuándo pedirlo:** la primera vez que el médico enciende «Guardar imágenes con los estudios»,
  que es el gesto donde la promesa importa.
- **Qué decir si lo niega:** que las imágenes pueden desaparecer si el disco se llena, y que
  conviene exportar un backup. Hoy ese aviso no existe.
- **Costo:** una llamada y un renglón de estado en la barra. **Cero riesgo clínico.**

### 4.2 · Una barra honesta, con aviso al 80 %

Lo que el punto 1 encontró se arregla con **un solo número y su desglose**:

```
💾 516 MB de ~10 GB (5 %)   ·   1,7 MB en imágenes · 514 MB en cineloops
```

- el número grande es **siempre el del origen** (`q.usado` / `q.total`), que es lo que se agota;
- debajo, el desglose por base, **con los bytes de los cineloops**, que hoy no se publican;
- **aviso al 80 %** con lo que se puede hacer (exportar, borrar cineloops viejos), y en rojo al
  90 %. La app ya tiene `_igTramo` para los colores; lo que falta es el umbral y el texto.

### 4.3 · Respaldo de los cineloops en una carpeta de la computadora

**Viable sólo en Chrome/Edge**, con la *File System Access API*
(`showDirectoryPicker()` + un handle persistido en IndexedDB). No existe en Safari.

- El médico elige UNA vez una carpeta («Respaldo de CeiboMed»); la app escribe ahí cada cineloop
  nuevo como archivo y guarda su nombre en el registro.
- Con eso el navegador deja de ser el único lugar donde vive un cineloop: si borra la base, el
  respaldo sigue.
- **Lo que hay que resolver antes:** el handle necesita permiso renovado por sesión (el navegador
  lo pide de nuevo), y el nombre del paciente **está dibujado en los píxeles** de los cineloops
  del ecógrafo, así que esa carpeta contiene datos clínicos en claro, fuera de la app. Eso es una
  decisión del médico y no una decisión técnica.

### 4.4 · Cada cineloop como pieza separada con su propio identificador

**Ya está así**, y eso es una buena noticia para Supabase: `ceibomed_cine` guarda **un registro
por cineloop**, con `id` propio (uuid), su `uuid` de estudio, sus `cuadros`, sus `offs` y sus
bytes. No hay un blob único por estudio que haya que partir.

Lo que **falta** para subirlos de a uno:
- un campo de **estado de sincronización** por registro (`sync: 'local' | 'subido' | 'error'`);
- y un **hash de contenido**, que la tanda P9 ya introdujo para no duplicar (`_cineClave`): sirve
  igual como clave de deduplicación del lado del servidor.

Son dos campos en un registro que ya existe. **No hace falta migrar nada.**

### 4.5 · La idea del médico: sin comprimir 3 meses y después comprimir solo los videos

**Es viable en el navegador, con dos salvedades.**

Lo que **sí** se puede hacer hoy, sin ninguna librería nueva:
- recorrer `CeiboCine.indice()` —que ya trae `ts` y `bytes` por registro y **no** carga los
  cuadros—, y para cada cineloop de más de 90 días, volver a comprimir **sus JPEG** con el mismo
  canvas que la app ya usa (`_imgComprimir`): bajar de 1016×708 a, digamos, 640×448 y de calidad
  0,92 a 0,65 da del orden de **4 a 6 veces menos** (es el mismo factor medido en las fijas).
  Un cineloop de 12,5 MB queda en 2–3 MB. **Cuarenta y un cineloops pasarían de 514 MB a ~110.**

Las dos salvedades, y las dos son del médico y no técnicas:

1. **Es irreversible y es dato clínico.** Recomprimir un cineloop le quita resolución a una
   ecografía que ya está guardada. La app tiene una regla para esto en las fijas —*sin el
   original en memoria sólo se puede BAJAR de calidad, y subir sería mentir sobre la calidad*— y
   acá pasa lo mismo: después de comprimir, la calidad original **no vuelve**. Por eso la
   propuesta es que lo haga **pidiendo permiso una vez por lote** y diciendo cuánto espacio
   libera, no «automáticamente» y en silencio.
2. **Hay que elegir en qué momento corre.** Comprimir 41 cineloops es decodificar y recodificar
   ~4.000 cuadros: son decenas de segundos con la pestaña trabada si corre en el hilo principal.
   La forma correcta es de a un cineloop por vez, con el progreso a la vista, y **nunca** mientras
   el médico tiene un estudio abierto sin guardar.

**Recomendación:** hacer **4.1 y 4.2 primero** —protegen de verdad y no tocan un píxel— y dejar
la compresión para después del respaldo en carpeta (4.3). Comprimir es lo único de esta lista que
**destruye información**, así que es lo último que conviene hacer y lo único que tiene que pedir
permiso.

---

## 5 · Lo que esta tanda SÍ cambió en memoria (no es parte de la propuesta)

- **El punto 4.1 del prompt** —la caída de la página al marcar todo en «Imágenes guardadas»— tenía
  una causa que no era la memoria de los cineloops: `igSelToggle` repintaba **la lista entera de
  Guardados en cada ítem**, así que «Todas» con 57 miniaturas hacía **57 repintados completos**.
  Está arreglado y medido en TC-1000.
- El registro de lo que ya entró (`ett_clnk_vistas`, tanda P9 · 3.2) guarda **sólo ids** y tiene
  tope de 4.000 entradas: unos 200 KB en el peor caso.
