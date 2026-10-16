# Mapa — la IDENTIFICACIÓN del paciente en el PDF y en el PPT (tanda «J», 2026-10-16)

> **Mapa NUEVO.** Medido con `wc -c` **ANTES** de escribir: `informe-pdf-excel.md` estaba en
> **33,1 KB** y esta sección lo cruzaba, así que allá entra sólo un puntero.
> Sin números de línea a propósito: la línea cambia en cada edición, el nombre de la función no.

---

## 1 · El problema: dos datos y un solo renglón

El paciente tiene **dos** identificadores y no son lo mismo:

| Dato | id | Rótulo visible | Qué es |
|---|---|---|---|
| documento | `ci` + `doc_tipo` (`CI`/`DNI`/`CPF`) | «Nº documento» | el documento de identidad |
| matrícula | `matricula` | «Matrícula», placeholder «Nº mutualista» | el número del prestador |

⚠️ **NO CONFUNDIR CON LA MATRÍCULA DEL MÉDICO**, que es otra cosa y vive en `med-matricula` /
`cfg-medico-matricula`. Es la confusión que la tanda H ya pagó (**H-2**): la app **no tiene**
cédula del médico.

**Antes de esta tanda el papel imprimía el documento y nada más**: la matrícula del paciente
existía como campo, viajaba con el estudio y **no salía en ningún PDF ni en ningún PPT** por
ningún camino. Censado.

---

## 2 · Los TRES estados, y por qué no se mezclan

Es lo que permite que un estudio **reimprima como se firmó** sin congelar la elección de los
pacientes nuevos.

| Estado | Donde vive | Quién lo cambia | Sobrevive a |
|---|---|---|---|
| **la elección de la SESIÓN** | `_pacIdSesion`, variable de módulo | el gesto del médico | «Nuevo estudio» · **no** a recargar la página |
| **la elección del FORMULARIO** | `pac_id_print`, `input[type=hidden]` | el gesto, `pacIdRestaurar`, `pacIdNuevoEstudio` | se guarda con el estudio |
| **la elección del ESTUDIO** | `campos.pac_id_print` | `guardarInforme` | el backup JSON |

⚠️ **NO SE PERSISTE EN EL NAVEGADOR** (orden expresa): ni `localStorage`, ni IndexedDB, ni
Configuración. Recargar vuelve al documento —medido—.

⚠️ **TOCAR UN MARCADOR MUEVE LAS DOS PRIMERAS**, y es deliberado: la orden dice que la elección
se conserva entre pacientes «hasta que el médico la cambie», y tocar el marcador es cambiarla.
Sobre un estudio abierto eso deja la elección nueva en **ese** estudio, que es lo pedido, así que
**no hace falta mirar `_ettEditandoId`** —y por eso no se mira: una rama que distinga «estudio
abierto» de «formulario nuevo» sería una compuerta más que puede desincronizarse—.

---

## 3 · Las piezas, por nombre

| Pieza | Qué hace |
|---|---|
| `PAC_ID_DOC` / `PAC_ID_MATR` | los dos tokens (`'ci'` / `'matricula'`) |
| `PAC_ID_MATR_LBL` | `'Matrícula'`, el rótulo impreso de la matrícula |
| `_pacIdLeer(src, k)` | lector único: sin `src` el DOM, con `src` un estudio archivado —patrón de `getBSA(src)`— |
| `pacIdElegido(src)` | normaliza a uno de los dos tokens; **todo lo demás es el documento** |
| **`pacIdImpreso(src, docLblDef)`** | el **único dueño** de «qué se imprime»: `{clave, lbl, val}` o `null` |
| `pacIdPintar()` | pone `aria-pressed` en los dos marcadores |
| `pacIdElegir(clave)` | el gesto: escribe el formulario **y** la sesión |
| `pacIdRestaurar(campos)` | lo que repone un estudio al abrirlo y la reimpresión; **no** toca la sesión |
| `pacIdNuevoEstudio()` | «Nuevo estudio»: el oculto vuelve a la elección de la sesión |

### La regla del dato vacío

```
elegido con valor      → el elegido
elegido vacío, otro con valor → EL OTRO
los dos vacíos         → null: no se imprime nada, como hoy
```

Nunca sale la identificación en blanco existiendo una: un PDF firmado sin forma de atribuirlo es
peor que uno con el dato que el médico no prefirió.

⚠️ **EL RÓTULO POR OMISIÓN DEL DOCUMENTO LO PASA CADA SUPERFICIE**, y no es un descuido: el PDF
escribe **«Cédula»** y el PPT **«CI»** cuando `doc_tipo` viene vacío, y los dos literales ya
existían. Unificarlos cambiaría uno de los dos papeles sin que nadie lo haya pedido.

---

## 4 · Los marcadores — por qué cada decisión

Un `<button>` chico al lado del rótulo de cada campo, dentro de su `<label>`. Relleno (`●`) el
que va al papel, vacío (`○`) el otro.

⚠️ **NO LLEVAN `onclick`.** La regla táctil global de este archivo es
`button, [role=button], .btn, …, [onclick] { min-height:44px; min-width:44px }` y matchea **por
el atributo**: un `onclick` acá estira el rótulo a 44 px y **desplaza el campo**, que es justo lo
que la orden prohíbe. Es el defecto que `#ig-img-storage` ya documenta en la cabecera de Informes
Guardados. Los cablea un **oyente delegado** en el documento (`data-pac-id`), registrado una sola
vez al arrancar: abrir y cerrar pestañas no acumula nada, y el teclado funciona gratis porque un
`<button>` despacha `click` con Enter y con Espacio.

⚠️ **`min-height:0` SIN `!important`.** `.pac-id-mk` es (0,1,0) y `button` es (0,0,1): gana por
especificidad, igual que la excepción del header. Una regla que no gana se lee igual que un
arreglo aplicado —este archivo ya lo pagó cuatro veces—.

⚠️ **EL ÁREA TÁCTIL NO SE PIERDE**: la extiende un `::after` absoluto de 14 px a cada lado, que
no ocupa lugar en el flujo. Es el patrón del botón del «porqué» de la vista 2D (TC-484), y se
mide con `elementFromPoint` a 14 px arriba y abajo del centro.

⚠️ **EL GLIFO SALE DEL CSS Y NO DE JS** (`::before` sobre `[aria-pressed="true"]`): así el
círculo y el estado no pueden desincronizarse, porque uno **deriva** del otro. Es el defecto de
los rótulos cableados al lado de una constante que la tanda H cerró en la cápsula de la AI.

Colores: `--accent` el elegido y `--text2` el otro, las dos globales y definidas en los dos temas.

---

## 5 · Dónde se imprime, superficie por superficie

| Superficie | Quién decide | Nota |
|---|---|---|
| **PDF del informe** | `pacIdImpreso(null, 'Cédula')` | **UNA sola celda** (`pRows`) para las **SEIS** plantillas: las tres maquetaciones del bloque del paciente arman todas desde ahí |
| **PDF reimpreso** | la misma celda | los campos los repone la ventana y `pacIdRestaurar(c)` fija la elección del estudio |
| **PPT clínico** (portada) | `pacIdImpreso({ci, doc_tipo, matricula, pac_id_print}, 'CI')` | lee el **estudio**, no la sesión |
| PDF de los módulos de amiloidosis (`amiloImprimirPDF`) | **nadie**: sigue imprimiendo el documento | **no autorizado por esta orden**, declarado → `PENDIENTES.md` **J-2** |
| nombre del ARCHIVO del PDF | `localStorage ett_filename_fmt` | ya ofrecía las dos, y **no se tocó**: es el nombre del archivo, no la identificación impresa |
| Excel | la columna `CI` | **sin cambios** |
| informe narrativo | **no nombra** ninguno de los dos | censado |
| PDF de auditoría del Laboratorio | cohorte, no paciente | sin cambios |
| exportación / importación JSON | **conserva la elección por construcción** | `campos` viaja entero; el validador acota las claves de NIVEL SUPERIOR y `campos` es una de ellas |
| importador de Excel | no trae la clave | el estudio importado abre con el **documento**, declarado |

---

## 6 · Las CINCO puertas del estado

| Puerta | Qué llama | Por qué |
|---|---|---|
| el gesto | `pacIdElegir` | escribe formulario + sesión |
| `limpiarCampos` | `pacIdNuevoEstudio` | el oculto es `hidden` y el barrido de esa función toma text y number, así que **no lo alcanza**: se repone explícitamente desde la sesión |
| `editarInforme` | `pacIdRestaurar(inf.campos)` | al lado de `sevFundRestaurar`, con el mismo argumento |
| `cargarEstudioPorId` | `pacIdRestaurar(inf.campos)` | idem |
| el borrador (autosave) | `pacIdRestaurar(data)` | idem |
| la ventana de **reimpresión** | `pacIdRestaurar(c)` **y** `pacIdPintar()` en el cierre | al lado de `imPdfPisaRestaurar` |

⚠️ **`pacIdRestaurar` ESCRIBE SIEMPRE, con el default cuando la clave falta.** Un estudio
anterior a esta tanda no la trae, y eso **no** significa «dejá la de la pantalla» sino «el
documento». Es el mismo motivo por el que la ventana de reimpresión escribe el médico con `''`
cuando el estudio no lo registra: que el estudio no lo diga significa que no lo tiene, no que se
herede el del paciente de al lado.

⚠️ **Y EL CIERRE DE LA REIMPRESIÓN REPINTA.** El `.value` del oculto lo repone el barrido de
`backup` —es un `input[id]`— pero el círculo sale de `aria-pressed`, que **ningún barrido
toca**: sin esa línea el médico volvía a su paciente con el marcador del OTRO estudio pintado al
lado de su propio campo. Es la misma fuga que las tres filas de IM de esa función, y se cierra
con el mismo recurso.

---

## 7 · El Excel no gana ninguna columna, y por qué

`pac_id_print` es un `input[type=hidden]` con **id** y **guión BAJO**, así que:

* lo toma el recolector de `guardarInforme`, que barre `input[id], select[id], textarea[id]`;
* `_noEsDelEstudio` **no** lo excluye (su regex son prefijos con guión MEDIO);
* el Excel exporta por `LAB_XLS_MAP` y por los bloques declarados, **no por el DOM**, así que un
  campo que el mapa no nombra no produce columna. **Medido: sigue en 440.**

---

## 8 · Cómo medir esta zona

```bash
node scripts/_probe_j.mjs --solo ident --dest /tmp   # gestos, maqueta, PDF, reimpreso, PPT
node scripts/test_clinico.mjs --solo TC-489
```

La sonda manda **clics reales** por CDP, comprobando con `elementFromPoint` que el blanco ES el
botón —y centrando el nodo con `block:'center'`, porque `scrollIntoViewIfNeeded` lo deja pegado
al borde y su centro cae fuera del viewport—. El **cuerpo de un caso no puede mandar un clic de
confianza**, así que TC-489 usa un `.click()` sintético —que sí dispara el oyente delegado— y lo
declara: es el reparto de TC-460 y TC-463.
