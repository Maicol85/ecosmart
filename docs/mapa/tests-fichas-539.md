<!-- ficha de TC-539 (tanda E, 2026-10-27). Archivo propio: `tests-fichas.md` ya estaba en 34,2 KB. -->

# TC-539 — la tanda E

**Dónde**: `scripts/test_clinico.mjs`, último caso del archivo.
**Mutaciones dirigidas**: `scripts/_mut_e.py` — **13/13 muertas**.
**Contra HEAD**: cae en **19 condiciones** de las cuatro zonas.

## Qué fija, por bloque

| bloque | condiciones | qué fija |
|---|---|---|
| **A** · Carpentier | A1-A12 + 4 denominadores | sin ETE manda Válvulas y el enlace no se ve; con ETE gana el ETE, el campo queda deshabilitado a opacidad 0,5 y el enlace nombra el valor; **una sola aparición** en los tres estilos y ninguna en el EN SUMA; el aviso de divergencia no existe; el estudio legado llena el hueco sin pisar el «Tipo …»; **con los dos nodos distintos gana el ETE**; la oración del ETE sale con su etiología y **sin** el Carpentier |
| **B** · tricúspide | B1-B5 + 2 denominadores | el aviso aparece con el **gesto real**, sin llamar al pintor; nombra los tres criterios y la otra puerta sin pedir la Vmax de la IT; se va con el gradiente medio; vuelve al borrarlo; se va por la puerta de la IT moderada |
| **C** · strain del VD | C1-C7 + 1 denominador | −25 no vota; −20 y −18 leve; −15 leve (el 15 incluido); **−14.9 y −12 sin grado**, en el cuerpo y en el EN SUMA; con TAPSE y S′ anormales manda el dueño; la ficha no dice «leve como mínimo» |
| **D** · orejuela | D1-D8 + 1 denominador | las **ocho** filas del Amulet y las **seis** del Watchman, una por una; las dos tablas pintadas con la palabra del manual; los rangos viejos en cero en el texto renderizado; sin fecha de consulta; las notas y el informe sin veredicto de aptitud; **la rama del trombo conservada** |
| **E** · control | E1-E3 | un estudio sin ninguno de los valores que la tanda cambia no menciona el Carpentier ni la orejuela, su strain en banda leve sigue en «leve», y el campo del Carpentier sigue habilitado |

## Los denominadores que esta ficha paga, y por qué están escritos en el caso

1. **«sin estenosis ni insuficiencia» CONTIENE «insuficiencia».** El primer denominador probaba la
   palabra, así que pasaba sobre una escena que no graduaba nada. Hoy exige la insuficiencia
   **graduada** (`con insuficiencia moderada|severa|…`).
2. **La pastilla se abre por la clase del botón, no preguntándole a `pillOn`.** Tras un
   `limpiar()`, `pillOn('mitral','insuf')` puede devolver `true` con el botón **apagado** —la clave
   de `localStorage` sobrevive entre corridas—, así que el guard se salteaba el toggle. Se mira
   `btn-primary`, que es el estado real, y su valor entra en el denominador.
3. **`limpiar()` no borra la marca de ajuste manual ni las claves de las pastillas.** Con
   `esqSevManual.im` puesto por una escena anterior, `calcIM_ESC` sale por su guarda y la IM no
   gradúa. `escenaNueva()` las limpia — es lo mismo que TC-416 tuvo que hacer para la tricúspide.
4. **`calcETE` deja agendado un repintado que PISA `im_grado`.** Fijando el grado antes del
   debounce, el informe salía «sin insuficiencia» en **tres de cuatro** corridas. Se espera 450 ms
   y se fija después.
5. **El grado se FIJA y no se deriva de la vena contracta.** Lo que el bloque prueba es *dónde* se
   dice el Carpentier, no cómo se gradúa una IM: el informe lee `sv('im_grado')`, así que la escena
   deja de depender de una cascada que no es lo que se mide.
6. **`split('.')` corta «−14.9 %».** `lineaVM` y `lineaVD` parten por **salto de línea**; el
   informe es de una oración por renglón.
7. **`N()` colapsa los saltos de línea.** `inf3()` devuelve el texto **crudo**: normalizado, las
   dos funciones de arriba recibían el informe entero en un renglón.

⚠️ **Y DOS DE LAS CONDICIONES NACIERON DE MUTACIONES QUE SOBREVIVIERON**, que es para lo que el
barrido existe:

- **M1** (revertir la precedencia) no rompía nada, porque en todas las escenas los dos nodos
  terminan con el **mismo** valor: el espejo del gesto copia ETE → Válvulas. El estado donde la
  precedencia importa es el de un estudio importado con los dos **distintos** → **A11**, que los
  escribe sin disparar `change` para que el espejo no los iguale.
- **M7** (que la oración del ETE no se calle) tampoco, porque ninguna escena integraba la
  morfología del ETE (`ete_morfo_incluir_chk`), así que esa oración no se emitía → **A12**, que la
  integra y exige que salga con su etiología, **sin** el Carpentier, y el total en uno.

## ⚠️ Lo que este caso NO mide, y se declara

**La geometría de `vm-carp-origen` y de `et-evid-aviso`.** Se intentó por tres caminos
—`display:block` a mano sobre cada ancestro escondido, el abridor propio de la sección
(`toggleEteSeccion`, el que TC-522 usa para medir esta misma fila) y descartando el primer rect— y
los tres dejan el nodo en `display:block` y `visibility:visible` con `offsetParent` en `null`, o
sea sin caja. Es una limitación del arnés, no de la app.

**Dónde sí está medida — y las dos están medidas de verdad:**

- el **aviso de la tricúspide**: **28 × 545** con el gesto real en `scripts/_probe_te.mjs`
  (`--solo tric`, paso «et_grado=Significativa») y **0 × 0** contra HEAD; y **565 × 28** a 1440 px
  en los **dos motores** (`scripts/_probe_ewk.mjs`);
- el **enlace del Carpentier**: **156 × 44 px** con `offsetParent`, y su texto completo
  («Carpentier «IIIb» — lo consigna el ETE · abrir ↗»), midiéndolo con la pestaña abierta por su
  **botón real** más `toggleEteSeccion`.

⚠️ **Y eso es exactamente lo que les falta a los tres arneses**: abren la pestaña con `showTab` y
la **tarjeta** de adentro queda sin caja. El 0 × 0 era del arnés, no de la app.

## Casos viejos adaptados por esta tanda

| caso | qué medía | por qué cambió |
|---|---|---|
| **TC-523** (E2, E3, E4) | el aviso de divergencia y su geometría | el aviso se retiró; se mide el **enlace de origen**, y se agregó **E5** como control negativo |
| **TC-523** (F1, F2) | `vm_carp` vacío tras el repintado y que no se escribiera nada | hoy el hueco **se llena**; F2 sigue vigilando lo que importa: que el legado guardado **no** se pise |
| **TC-524** (H1, H2) | la abstención del paréntesis por divergencia | las dos piezas de ese mecanismo se fueron; hoy el paréntesis publica el del ETE y la frase de prolapso **se calla** |
| **TC-519** (C2, C3) | el aviso de la tricúspide **llamando a `calcET()` a mano** | fabricaba el disparador que faltaba — un chequeo que no podía fallar. Hoy es el gesto real y **cae contra HEAD** |
| **TC-519** (H1) | «zona de anclaje» en el rótulo del recuadro de la orejuela | el recuadro ya no evalúa contra ese rango |
| **TC-508** (K1) | que el **badge** nombrara el Amulet con sus dos números | el badge ya no da veredicto; los tres controles negativos quedan ahí y «nombra el Amulet con sus dos números» pasa a **K1b**, sobre las notas |
| **TC-535** (E2) | «leve como mínimo» con strain −12 | hoy exige que **no diga ningún grado**, que es más fuerte |
| **TC-537** (N3) | que «leve como mínimo» **no se tocara** | era el control de que la tanda A no tocara lo que no le tocaba; esta tanda es la que lo cambia, así que el control **se invierte** |
| **TC-526** (D) | — | sólo el comentario, que había quedado vencido |
