# El aviso de exclusiones mitrales y la disfunción sistólica del VD en el Laboratorio

Mapa de la tanda del **2026-10-14**. Dos bloques independientes, con commits separados, más el
LARS por magnitud en el importador. Está por **nombre de función y de constante**, no por línea.

> Se abre a demanda. Mide antes de presupuestar contexto: `wc -c docs/mapa/*.md`.

---

## BLOQUE S · El aviso de exclusiones mitrales

### El problema que cerró

El aviso ámbar existía desde el 2026-10-12 y hablaba **sólo con la ASE 2025 en ritmo sinusal**. Un
paciente con prótesis mitral evaluado por la **BSE 2024** o por la **ASE/EACVI 2016** corría el
algoritmo sin que nada lo dijera, y lo mismo en **fibrilación auricular** con cualquiera de las
tres. Decisión de Maicol del 14/10/2026: la función diastólica se **calcula igual que hoy en todos
los casos** —el cálculo es anterior a la evaluación de la morfología— y lo único que entra es el
cartel.

### Los dueños, por nombre

| Función / constante | Qué hace |
|---|---|
| `diastExclMotivos()` | Devuelve la lista de motivos DETECTABLES. **No se tocó en esta tanda.** |
| `DIAST_EXCL_REF` | La referencia que se cita, **por guía y por ritmo**. Lo único que cambia entre las tres. |
| `diastExclTexto()` | **Dueño ÚNICO del texto.** Devuelve `null` cuando no hay nada que avisar. |
| `diastExclSync()` | Dueño único del nodo `#diast-excl-aviso` del cuadro gris. |
| `diastAlgoRender()` | La ventana 🧭: el aviso va en la **inicialización de `h`**, no en cada salida. |

### Las dos superficies no se pueden desincronizar

`diastAlgoRender` tiene **DOS** salidas (`host.innerHTML = h`): la de la rama de fibrilación
auricular y la del final. Agregar el aviso en cada una son dos puertas que se separan el día que
alguien toque una. Arrancando `h` con el aviso, las dos lo llevan **por construcción**. Y el texto
sale de `diastExclTexto`, que es el mismo dueño que escribe el cuadro gris.

### Qué dispara, medido una por una

Las **nueve** opciones EXACTAS de `vm_morf`, con lo que hace cada una:

| Opción de «Morfología VM» | ¿Avisa? | Por qué |
|---|---|---|
| `Normal` | no | |
| `Mixomatosa / Barlow` | no | |
| **`Calcificada`** | **sí** | motivo «válvula mitral calcificada» |
| `Reumática` | no | describe la etiología, no afirma estenosis |
| `Prolapso / EVMS` | no | |
| **`Prótesis biológica`** | **sí** | motivo «prótesis mitral» (`valvEsProtesis`) |
| **`Prótesis mecánica`** | **sí** | motivo «prótesis mitral» |
| `Endocarditis` | no | |
| `Isquémica (disfunción/rotura músculo papilar)` | no | |

Más dos disparadores que **no son de la morfología**:

- **La estenosis mitral** la consigna `em_grado`, cuyo centinela es `'sin'`. Cualquier otro valor
  —`leve` o `severa`— avisa. ⚠️ **No hay opción «estenosis mitral» en la morfología**, así que
  buscarla ahí es buscarla donde no está.
- **La insuficiencia mitral grave**: `v('im_grado') >= 4`. El grado lo produce la cadena de
  `calcIM_ESC`; el aviso lo LEE.

⚠️ **NO HAY OPCIÓN DE PLASTIA NI DE ANULOPLASTIA MITRAL**, y las tres guías las excluyen. La app no
tiene con qué detectarlas, ni tampoco el TEER ya realizado. TC-470 lo afirma por el lado negativo
—`OPCS.filter(/plasti|anuloplasti|reparaci/)` tiene que dar cero— para que el día que exista se
note. `docs/PENDIENTES.md` → X2.

### La referencia, por guía y por ritmo

| Guía | Ritmo sinusal | Fibrilación auricular |
|---|---|---|
| ASE 2025 | pie de la Figura 3, folio 554 | **el mismo** |
| BSE 2024 | pie de la Figura 17, pág. 36 | pie de la Figura 19, pág. 39 |
| ASE/EACVI 2016 | folio 286 | **el mismo** |

⚠️ **LA BSE ES LA ÚNICA CON UNA REFERENCIA POR RITMO, y es porque es la única que escribe la lista
dos veces.** La **Figura 8 de la ASE 2025** —la de la FA, folio 563— **NO repite las exclusiones**,
censado el PDF completo: su pie entero es «Algorithm for estimation of mean LAP with atrial
fibrillation. BMI, Body mass index; Pulm, pulmonary.» Así que en FA se cita igual la Figura 3, que
es donde esa guía lo dice.

⚠️ **Y LA FIGURA 18 DE LA BSE —la vía de función sistólica deprimida— NO LISTA LAS EXCLUSIONES
MITRALES.** Su pie (pág. 38) nombra bloqueo de rama, marcapaso apical del VD, resincronización y
asistencia ventricular, y nada más. El aviso sale igual con la BSE en ritmo sinusal **por las dos
vías**, que es el lado conservador para un cartel que no cambia nada: avisa de más en la vía de la
Figura 18 y nunca de menos. Separarlo por vía obligaría a preguntarle a `diastBSE2024Evaluar` cuál
corrió, o sea a atar el aviso al veredicto que no debe tocar.

### El color: `--orange` y no `--amber`

⚠️ **`--amber` SE DEFINE SOLO DENTRO DE `.amilo-root`** (es un alias de `--orange` para ese módulo).
Fuera de ahí, `color: var(--amber)` es **inválido en tiempo de valor computado** y el color cae al
HEREDADO. Medido en HEAD el 2026-10-14: los **cuatro** avisos ámbar de la diastólica computaban
`rgb(232, 236, 244)`, o sea el gris del texto normal, con el comentario diciendo «ámbar» al lado.

Este aviso pasó a `var(--orange)`, que es global y theme-aware (`#f59e42` de noche, `#d97b1f` de
día) — medido después del cambio: `rgb(245, 158, 66)`. **Los otros tres siguen con `--amber` a
propósito**: son del protocolo y de la BSE, no de esta tanda, y cambiarles el color es una
diferencia visible que la orden no autorizaba. `docs/PENDIENTES.md` → X1.

### Lo que el aviso NO hace

No cambia el veredicto, el badge, el informe, el EN SUMA, el PDF, el PPT, el Laboratorio ni el
Excel. **Medido**: 12 escenas (tres guías × dos ritmos × con y sin aviso) con **0 diferencias**
contra HEAD en informe (3 estilos), EN SUMA (3), Excel con sus 435 columnas y su hash, franja del
PPT, grado del Laboratorio y hash de los campos guardados.

---

## BLOQUE R1 · La disfunción sistólica del VD en el Laboratorio

### El defecto, reportado por Maicol

La categoría «Disfunción sistólica VI» clasificaba el texto con
`/disfunci[oó]n\s+sist[oó]lica|FEVI\s+[<>]?\s*[0-4]\d/i`, **que no distingue el ventrículo**. Todo
estudio con el VD alterado inflaba la estadística del izquierdo.

### El dueño

`_labDisfSistVent(inf)` devuelve `{vi, vd}` y lo consultan **tres** lugares: las dos filas de
`_LAB_HALLAZGOS` y la columna `DisfSist_VD` del Excel. Reimplementar el criterio en cada uno es cómo
se separan.

**El criterio es la FRASE, no el texto entero.** Se parte por `.`, `;` y salto de línea —los mismos
tres cortes que `_labMenciona` ya usa para su ventana de negación— y cada frase se clasifica sola.
Dentro de una frase sin esos cortes, `_labMenciona(seg, re)` mira **exactamente los mismos 40
caracteres hacia atrás** que miraba sobre el texto completo, así que **la detección de negaciones no
cambia**.

«Habla del VD» = que la **misma frase** nombre el ventrículo derecho, en cualquiera de las tres
formas en que la app lo escribe: `\bVD\b`, `\bHVD\b` o «ventrículo derecho».

⚠️ **LA VÍA DE LA FEVI NO SE PARTE, Y ES DELIBERADO.** `FEVI 45` es del ventrículo izquierdo por
construcción —la sigla lo dice—, así que esa alternativa suma al VI aunque la frase nombre también
el VD. Partirla sólo podría **perder** cuentas del VI que HEAD sí tenía.

### El censo, medido (12 escenas × 3 estilos = 36 celdas, cambian 21)

Los textos salen de generar el informe de verdad, no de una redacción reconstruida.

| Frase (EN SUMA o informe) | Ventrículo | Antes | Después |
|---|---|---|---|
| `VD dilatado con disfunción sistólica.` | VD | VI | **VD** |
| `VD de dimensiones normales con disfunción sistólica.` | VD | VI | **VD** |
| `VD con disfunción sistólica.` | VD | VI | **VD** |
| `HVD con disfunción sistólica.` | VD | VI | **VD** |
| `VD dilatado e hipertrófico, con disfunción sistólica.` | VD | VI | **VD** |
| `Disfunción sistólica severa del VD (FAC 23%).` | VD | VI | **VD** |
| `El ventrículo derecho se encuentra dilatado y presenta disfunción sistólica (…)` | VD | VI | **VD** |
| `El ventrículo derecho presenta disfunción sistólica (…)` | VD | VI | **VD** |
| `…compatible con disfunción sistólica leve` (narrativo del VI) | VI | VI | VI |
| `…compatible con disfunción sistólica moderada` | VI | VI | VI |
| `…compatible con miocardiopatía con disfunción sistólica severa` | VI | VI | VI |
| `función sistólica levemente reducida, FEVI 45 %…` (estándar) | VI | VI | VI |
| `VD dilatado con función sistólica conservada.` | — | — | — |
| `FEVI normal (60%).` | — | — | — |

**Ninguna frase es ambigua**: todas las del VD lo nombran en su propia oración (es el sujeto) y
ninguna del VI lo nombra.

⚠️ **LO QUE ESTO NO ARREGLA, Y ESTÁ MEDIDO: con el estilo CONCISO la disfunción del VI no matchea
por ninguna de las dos vías.** Su frase es «FEVI levemente reducida (45 %)», sin la palabra y sin el
número pegado a la sigla. Es **PREEXISTENTE** —medido igual en HEAD— y corregirlo cambia qué
estudios entran en la categoría, que la orden no autorizaba. `docs/PENDIENTES.md` → X3.

### Dónde aparece la categoría nueva

`_LAB_HALLAZGOS` es **una lista cerrada con TRES consumidores**, así que agregar la fila los cubre
a los tres por construcción:

| Consumidor | Qué |
|---|---|
| Dashboard del Laboratorio | el gráfico de «Hallazgos frecuentes» |
| PDF de auditoría | la sección 3, misma cuenta |
| PPT estadístico | el hallazgo más frecuente |

⚠️ **`_labHallazgosCuenta` CORTA EN OCHO** (`.slice(0, 8)`, ordenado por `n` descendente). Con una
novena categoría, una cohorte donde la del VD sea frecuente puede desplazar a otra del top 8. Es el
comportamiento de un «top 8» y no una rotura, pero conviene saberlo antes de leer un informe.

⚠️ **EL FILTRO DE COHORTE NO TIENE NINGUNA CATEGORÍA DE DISFUNCIÓN SISTÓLICA, Y ESTÁ MEDIDO.** Sus
cinco selectores son `filtro-fevi` (numérica), `filtro-geom`, `filtro-diast`, `filtro-valv` y
`filtro-interes`. No hubo nada que agregarle; TC-470 lo afirma para que el día que se agregue uno se
note.

### La columna de Excel: 435 → 436

- Nombre: **`DisfSist_VD`**. Valor `1`/`0` desde `_labDisfSistVent(inf).vd`.
- Declarada en `LAB_XLS_BLOQUES` → bloque **«5 · VENTRÍCULO DERECHO»**, y eso es lo que decide su
  posición: `_labOrdenarCols` manda las columnas que el mapa no conoce **al final** y después
  reagrupa por bloque. Sin esa declaración habría caído a decenas de columnas de las del VD — el
  defecto que «DVI mitral (fuente)» ya pagó.
- Medido: queda en el **índice 50**, entre `FAC VD (%)` y `Área AD (cm²)`.
- Es **derivada**: no entra en `LAB_XLS_MAP`, no se reimporta, y su encabezado lo dice solo («Sólo
  lectura»). Tiene su fila en la hoja **Leyenda**.
- **Reverificado** que los consumidores leen por NOMBRE: el export arma un objeto y `_labOrdenarCols`
  lo ordena por mapa y bloque; el importador lee por encabezado; y **CeiboAnalytics no lee este
  Excel** (cero `XLSX.read`, cero `sheet_to_json`, cero menciones de `LARS`).
- **Ninguna columna existente cambió de valor**, comparadas clave por clave contra HEAD en 12
  escenas.
- ⚠️ **No hay columna gemela para el VI**, y es la decisión de la orden: una sola columna nueva. El
  VI nunca tuvo una. `docs/PENDIENTES.md` → X4.

### Los estudios guardados no se migran

El Laboratorio los lee **desde el texto guardado**, así que se reclasifican solos al calcular. No se
reescribe ni un registro. El informe y el EN SUMA salen **idénticos a HEAD** en las 12 escenas.

---

## BLOQUE R2 · El LARS por magnitud en el importador

Cierra el punto **C1** de `docs/PENDIENTES.md`.

**El defecto, medido:** la pantalla lee el LARS en valor absoluto desde el 2026-10-12 —un −32 vota
como 32 y **no** se marca «(revisar)»— pero el importador comparaba el **crudo** contra `lars:[0,60]`,
la única banda **asimétrica** de la tabla. Una planilla con un LARS negativo perdía la **fila
entera** por rango, mientras la misma app en pantalla aceptaba ese número sin decir nada.

**El dueño:** `_labRangoValor(dest, v)` devuelve el número que se compara contra `_labRango(dest)`.
**No tiene lista propia**: le pregunta a `_DIAST_STRAIN_ABS_MARCA`, que es el dueño que la pantalla
ya usa. Una segunda lista es cómo se llega a que el importador rechace lo que la pantalla acepta.

Lo consultan **dos** lugares, y es a propósito que sean los dos: la **guarda** del importador y la
**ayuda** de la plantilla. Una ayuda que enseña «Rango aceptado: 0 a 60» sobre una columna que
acepta −32 es peor que no tener ayuda.

**Medido, nueve valores por los dos signos — cambian exactamente DOS:**

| Valor | HEAD acepta | Hoy acepta |
|---|---|---|
| 32 | sí | sí |
| **−32** | **no** | **sí** |
| 0 | sí | sí |
| 60 | sí | sí |
| **−60** | **no** | **sí** |
| ±61 | no | no |
| ±80 | no | no |

Y **las dos puertas concuerdan**: con teclas reales, ±32 no lleva marca y ±80 lleva «(revisar)» en
los dos signos.

⚠️ **`ai_strain_ct` NO SUFRE LO MISMO Y ESTÁ MEDIDO**: su banda ya es simétrica (`[-60, 60]`), así
que comparar el crudo contra ella es exactamente comparar la magnitud contra su mitad positiva. No
se tocó.

**El valor guardado no cambia**: esto decide qué se COMPARA. El Excel sigue exportando el número
tipeado con su signo y no gana ninguna columna por este bloque.

---

## Cómo medir esta zona

```bash
node scripts/_probe_exclusiones.mjs --solo morf        # las nueve opciones, una por una
node scripts/_probe_exclusiones.mjs --solo guias       # 3 guias x 2 ritmos x 5 disparadores
node scripts/_probe_exclusiones.mjs --solo im          # el grado de la IM con teclas reales
node scripts/_probe_exclusiones.mjs --solo ventana     # cuadro y ventana dicen lo mismo
node scripts/_probe_exclusiones.mjs --solo superficies # CONTROL: 0 diferencias contra HEAD
node scripts/_probe_exclusiones.mjs --solo captura --dest /tmp/cap
node scripts/_probe_labdisf.mjs --solo censo           # el censo de frases
node scripts/_probe_labdisf.mjs --solo excel           # 436 columnas y la posicion de la nueva
node scripts/_probe_labdisf.mjs --solo lars            # los dos signos del mismo valor
node scripts/_probe_labdisf.mjs --solo controles       # el resto del Laboratorio
node scripts/test_clinico.mjs --solo TC-470            # 91 condiciones
```

Las dos sondas son **A/B de solo lectura**: con `--file /tmp/index.HEAD.html` corren contra una
copia de HEAD y no tocan `index.html`.

---

## Las trampas de esta tanda, medidas

- ⚠️ **`showTab('valvulas')` CIERRA LO QUE EL CLIC ACABA DE ABRIR.** Corre `valvCerrarTarjetas`, así
  que llamarlo en cada lectura del estado deja la sección colapsada: la sonda clickeó **cuatro
  veces**, el clic llegó al blanco las cuatro —`esElBlanco: true`, medido— y la sección salía
  cerrada igual. Se llama **sólo si la pestaña no está activa**.
- ⚠️ **`im_vc` VIVE DETRÁS DE DOS PUERTAS Y LOS DOS NOMBRES NO COINCIDEN.** El contenedor oculto es
  `#bloque-insuf-mitral` y el `onclick` del botón dice `valvDatosTog('caja-insuf-mitral')`: el
  buscador genérico de `revelar()` —que busca el id del contenedor dentro del `onclick`— **no da con
  él**. Y encima hay una puerta más arriba, `#ete-seccion-valv-mitral`, que abre
  `toggleEteSeccion('valv-mitral', this)` — con la coma y el `this`, así que buscar el literal
  `toggleEteSeccion('valv-mitral')` tampoco matchea.
- ⚠️ **UN TECLEO QUE NO QUEDA NO ES UNA MEDICIÓN.** `clicEn` devuelve «NO SE PUDO» sobre un campo sin
  geometría, el foco no llega y las teclas se las come el documento: la escena informaba «no avisa»
  sobre un dato que nunca se cargó. `tipear()` **aborta** si el valor no quedó.
- ⚠️ **EL ESTILO DEL INFORME CAMBIA EL DENOMINADOR DEL CENSO.** Midiendo en el estilo por omisión,
  «diez de las doce escenas emiten una frase» daba **7**: en el conciso la frase del VI no existe.
  El caso fija `setEstiloInforme('narrativo')`.
- ⚠️ **ME COMÍ EL ACENTO GRAVE CUATRO VECES**, todas en comentarios míos dentro del template de una
  sonda. `node --check` dio la línea exacta las cuatro, porque el culpable estaba dentro del mismo
  template. **Barrer el cuerpo del template después de cada edición**, no sólo antes del commit.
- ⚠️ **EL AVISO LEGAL VUELVE A MITAD DE CORRIDA** y se come los clics: las dos sondas lo despejan
  **antes de cada escena**, no una vez al arranque.

---

## ⚠️ La tanda E retiró el grado del strain por debajo de 15 % (27/10/2026)

Con un strain de pared libre por debajo de 15 % en valor absoluto, el informe y el EN SUMA dicen
«disfunción sistólica» **sin grado**. El «leve como mínimo» del AJ7 salió. La banda de 15 a 20 %
sigue en «leve» y por encima de 20 sigue sin votar.

**El voto en el Laboratorio no se perdió**: `_labDisfSistVent` da `{vi:false, vd:true}` en los dos
árboles, porque su regex busca «disfunción sistólica» y no el grado — la columna `DisfSist_VD` y
las dos filas de `_LAB_HALLAZGOS` no se mueven.

**`docs/mapa/e-carpentier-tricuspide-orejuela.md` § 6.**
