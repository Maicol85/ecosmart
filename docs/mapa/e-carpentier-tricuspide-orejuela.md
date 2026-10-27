<!-- mapa de la tanda E, armado sobre f9ca06d (2026-10-27); SIN números de línea a propósito -->

# E — el Carpentier con un solo dato, la tricúspide, el strain del VD y las dos tablas de la orejuela

Qué contesta este archivo: **quién es el dueño del Carpentier desde esta tanda y dónde se dice una
sola vez**; **por qué el aviso de la Evidencia de la tricúspide existía desde la AJ2 y el médico no
lo veía**; **qué publica el informe con un strain de pared libre del VD por debajo de 15 %**; y
**de dónde salen las dos tablas de dimensionamiento de la orejuela y por qué la app dejó de juzgar
la aptitud**. Se abre a demanda; no se carga solo.

---

## 1 · El Carpentier: un solo dato, y gana el ETE

**Decisión de Maicol, y REVIERTE la precedencia de la AJ5.** Hasta esta tanda `vmCarpEfectivo()`
devolvía «el de Válvulas, y si no dice nada, el del ETE». Desde hoy es al revés.

| función | qué hace |
|---|---|
| `vmCarpEfectivo()` | **ETE primero**, Válvulas como respaldo. Es el único dueño de «cuál es el Carpentier» |
| `vmCarpDesdeEte()` | predicado puro: ¿el ETE tiene un Carpentier cargado? |
| `vmCarpOrigenSync()` | llena el hueco, pinta el enlace, y le pide el bloqueo a `vmProtBloqSync` |
| `vmCarpPuertaEteAbierta()` / `vmCarpIrAlEte()` | el salto a la pestaña de origen, **gateado por el plan** |
| `vmCarpDichoEnMitral()` | dueño único de «¿la oración de la mitral ya dijo el Carpentier?» |
| `imHayInsufEnInforme()` | la misma cascada que `insE`/`insC`, en una función que se puede preguntar |

### Lo que el médico ve

- **Sin Carpentier en el ETE**: el `<select>` de Válvulas funciona solo, habilitado, y el nodo
  `vm-carp-origen` queda en `display:none`.
- **Con Carpentier en el ETE**: el `<select>` queda **deshabilitado y a opacidad 0,5**, mostrando
  el valor del ETE, y debajo aparece «Carpentier «IIIb» — lo consigna el ETE · abrir ↗».

⚠️ **UN SOLO ESCRITOR de `disabled` y de `opacity`.** `vm_carp` tiene ahora **dos** motivos para
quedar bloqueado —la prótesis mitral del AJ7 y el ETE como dueño— y la tentación era un segundo
pintor. `vmProtBloqSync` calcula el **OR** de los dos con su propio `title` por motivo, y
`vmCarpOrigenSync` lo llama en vez de escribir el atributo. Dos escritores de la misma propiedad
es cómo la pantalla queda contando el estado del último que corrió.

⚠️ **EL SALTO NO ES `showTab('ete')` PELADO**, y este repositorio ya documenta por qué: `showTab`
**no chequea el plan** y el plan Básico se aplica sólo escondiendo los `button[data-mod]`. Un
enlace pelado en una pestaña que el plan Básico **sí** muestra sería una puerta a ECO AVANZADO sin
compuerta — textual el defecto que `hfapeffIr` vino a cerrar. Con la puerta cerrada el texto queda
como **rótulo**: nombra el origen y no lleva a ningún lado.

### El hueco se llena; nada se pisa

`vmCarpOrigenSync` escribe `vm_carp` **sólo si está vacío**. Con un valor cargado no lo toca,
aunque difiera: pisar un valor guardado es migrar un estudio guardado.

⚠️ **Y `vmCarpLegadoSync` LLEVA UNA GUARDA DE REPINTADO, que es lo que hace que ese llenado sea
seguro.** El nodo de legado del cajón de prolapso (`vm_carpentier`) sigue a `vm_carp`, así que
llenar el hueco de un estudio guardado **antes de la AJ5** llegaba hasta ahí y pisaba el «Tipo …»
que ese estudio trae persistido. Desde la tanda E: en el **gesto** se escribe —ahí el médico acaba
de elegir—; en el **repintado** se escribe sólo si el nodo está en su valor de fábrica «—».

**Medido**: un estudio legado con `ete_carpentier` = II y el legado en «Tipo I (dilatación anular)»
conserva el «Tipo I». En HEAD el repintado lo pisaba a «Tipo II».

### El aviso de divergencia se retiró

`_vmCarpDiverge` y `vmCarpAvisoSync` **ya no existen**, y con ellos el nodo `vm-carp-aviso`. Con un
solo dato no hay dos voces que comparar.

⚠️ **Lo que esto cuesta, y queda declarado en `docs/PENDIENTES.md` → E-a:** en un estudio
importado o editado a mano donde `vm_carp` y `ete_carpentier` tengan valores **distintos**, el
informe publica el del ETE y el `<select>` sigue mostrando el suyo, deshabilitado. El enlace
nombra el valor que manda, así que la pantalla no miente.

---

## 2 · El Carpentier se dice UNA sola vez

**Medido en HEAD antes de tocar nada**, y era peor de lo que la orden suponía:

| escena | apariciones en HEAD | qué decía |
|---|---|---|
| transtorácico, prolapso, IM moderada-severa, `vm_carp` = II | **2** | «… (mecanismo secundario; Carpentier II). Prolapso mitral, mecanismo Carpentier II.» |
| ETE con la morfología integrada, prolapso, `ete_carpentier` = IIIb | **3** | el paréntesis «Carpentier **IIIb**», la frase de prolapso «Carpentier **III**» y la oración del ETE «Carpentier Tipo IIIb (tethering sistólico)» |

⚠️ **En la segunda, DOS VALORES DISTINTOS del mismo hallazgo en un documento firmado**, porque el
vocabulario del cajón de legado **no parte el tipo III**.

**Los tres emisores, y quién se calla:**

| emisor | lee | desde la tanda E |
|---|---|---|
| `_imMecCarp` → paréntesis de la insuficiencia | `vmCarpEfectivo()` | **es el que habla**. Se le retiró la abstención por divergencia de la AJ5-6 |
| la frase de prolapso (`vmSent`) | el nodo de legado `vm_carpentier` | se calla si `vmCarpDichoEnMitral()` |
| la oración de la mitral del ETE (`calcETE`) | `sv('ete_carpentier')` | se calla si `vmCarpDichoEnMitral()` |

⚠️ **EL EMISOR NO SE PREGUNTA A SÍ MISMO.** `_imMecCarp` usa sus tres condiciones directas —no
prótesis, un valor del vocabulario, y colgar de `insE`/`insC`—, que son las **mismas** que
`vmCarpDichoEnMitral` contesta para los otros dos. Si se cambia una, se cambian las dos.

⚠️ **SE CALLAN, NO SE BORRAN**, y la diferencia es un dato: cuando el paréntesis **no** habla
—sin insuficiencia, sobre una prótesis, o sin ningún Carpentier— la frase de prolapso vuelve a ser
la única voz y publica el del cajón igual que siempre. Medido: prolapso + Carpentier II **sin**
insuficiencia sigue saliendo «Prolapso mitral, mecanismo Carpentier II.»

⚠️ **LO QUE SE PIERDE Y SE DECLARA: la GLOSA del ETE.** Esa oración decía «Carpentier Tipo IIIb
(tethering sistólico)» y el paréntesis lo dice pelado. La glosa es la **definición** del tipo, no
un dato del paciente, y vive en el globo ⓘ `vm-carp` y en la ficha de Referencias. Y si el
Carpentier era lo único cargado, **la oración del ETE desaparece entera**, que es lo correcto: su
compuerta (`etio || carp || …`) existe justamente para no publicar «ETE — Válvula mitral.» a secas.

---

## 3 · El aviso del corte alternativo de la IM secundaria

`imSecAltPintar` pasa de una línea de hasta ~300 caracteres en dos renglones a **una línea corta
más un `<details>` con el ⓘ**. Medido: 113 caracteres y 28 px de alto contra 57 y 17 px.

- **Pantalla**: «Corte alternativo de la ESC/EACTS 2025: lo alcanza el ORE.» (una cita, regla R2)
- **ⓘ**: el texto **completo**, palabra por palabra el que la pantalla publicaba — los dos valores
  con su `toFixed(1)`, los dos cortes y las dos condiciones de aplicabilidad.

Se arma **con nodos**, no con `innerHTML`. Y sigue **sin subir al informe firmado**.

---

## 4 · La tricúspide: por qué el aviso de la AJ2-4 no se veía

**El texto estaba bien y la compuerta también. Lo que faltaba era el disparador.**

Reproducido en Chrome con la escena exacta —pastilla «Estenosis» abierta, severidad
«Significativa» elegida, sin gradiente, sin THP, sin área, sin VTI, la IT en «Sin»—, paso por paso:

| paso | `_indVT()` | el nodo `et-evid-aviso` |
|---|---|---|
| pastilla abierta | `null` | 0 × 0, texto vacío |
| severidad elegida | `null` | **0 × 0, texto vacío** ← el defecto |
| llamando a `etEvidAvisoSync()` a mano, en ese mismo estado | `null` | devuelve la frase **completa** |
| `et_gmedio` = 6 | abre | 0 × 0, vacío (correcto) |
| borrado el gradiente | `null` | **28 × 545 con la frase entera** |

**La causa**: el `onchange` de `#et_grado` es `valvSev.aplicar('esten','tricuspide',this.value)`,
que **no pasa por `calcET`** —el único lugar desde donde se llamaba al pintor—, y el oyente de
documento sólo atrapaba `it_grado` e `ia_grado`. El aviso recién aparecía después de un gesto que
tocara una **medición**, que es justo el gesto que esa escena no tiene.

**El arreglo**: `et_grado` entra en ese oyente, en captura, sin tocar la cadena de `valvSev` — el
patrón que `ia_grado` ya usó por esta misma razón. Y la cápsula protésica tricúspide se gatea a
`it_grado`/`ia_grado`, que son sus dos insumos reales.

### La regla es exactamente la que dice el texto, censada en el código

> «La Evidencia de esta válvula se activa cuando se cumple un criterio de estenosis —gradiente
> medio, área valvular o VTI de entrada— o con insuficiencia tricuspídea moderada o mayor.»

- `_indVT()` abre con `itSev || itMod || etSig`.
- `itMod` = `it_grado` 2 o 3; `itSev` = 4 → **«moderada o mayor»**.
- `etEstado().signif` = `cGm || cAvt || cVti` → **gradiente medio, área y VTI de entrada**. El THP
  se calcula y **no vota** desde el VAL1 (2026-10-17).

**Ni más ni menos que lo que el aviso dice.**

### ⚠️ Y por qué nadie lo había visto: el caso pasaba en verde sobre el defecto

**TC-519 (C1-C5)** cubría este aviso y **pasaba**, porque el caso llamaba a `calcET()` a mano justo
después de poner la severidad: **fabricaba el disparador que la app no tenía**. Es el «freno que
tapa al que se muta» que `CLAUDE.md` documenta — un chequeo que no podía fallar. Endurecido al
gesto real: C2 y C3 **caen** contra HEAD.

---

## 5 · Los dos bloques protésicos de la mitral bajan

**Medido en el DOM antes de mover nada**, no por coordenadas: `bloque-prot-vm` (el DVI) y
`bloque-prot-vm-res` (las siete filas de la Tabla 11) vivían **entre** los cajones de grado de las
dos lesiones y el envoltorio `#vm-lesiones`, que es el bloque de cuantificación habitual.

| | HEAD | hoy |
|---|---|---|
| `bloque-prot-vm` | y = 429 | y = **1306** |
| `bloque-prot-vm-res` | y = 437 | y = **1314** |
| cuadro de referencias de la estenosis | y = 729 | y = 729 |
| cuadro de referencias de la insuficiencia | y = 809 | y = 809 |

⚠️ **LA AÓRTICA NO TENÍA EL MISMO PROBLEMA, censado**: `bloque-prot-va` vive **dentro** de
`#caja-esten-aortica`, que es parte de `#va-lesiones`, y sus filas protésicas (`ea-det-*`) están en
ese mismo cuadro. Es la decisión del CORTOS2 —«las filas de la prótesis, DENTRO del cuadro»— que la
mitral no había seguido. Esta mudanza la pone a la par; del lado aórtico **no se tocó nada**.

⚠️ **POR QUÉ DEBAJO DE `#vm-lesiones` Y NO ADENTRO DE `#caja-esten-mitral`**, que sería el calco
exacto de la aórtica: ese envoltorio **se pliega** con `valvDatosTog`, y adentro los datos de la
prótesis desaparecerían al colapsar la estenosis — y la prótesis no es una lesión que se pueda
plegar, es la válvula que tiene el paciente. `bloque-prolapso-vm` **no se movió**: no es protésico.

---

## 6 · El strain de pared libre del VD, por debajo de 15 %

**Decisión de Maicol**, y reemplaza el «leve como mínimo» que el AJ7 había puesto.

| strain (valor absoluto) | categoría | qué publica el informe |
|---|---|---|
| más de 20 % | `normal` | **no vota**: «función sistólica conservada» |
| de 15 a 20 %, el 15 incluido | `leve` | «disfunción sistólica **leve**» |
| por debajo de 15 % | `bajo_leve` | **«disfunción sistólica», SIN grado** |

El cambio es de una línea: `if (!_vdDisfG && strCat === 'leve') _vdDisfG = 'leve';` — la banda
`bajo_leve` **vota** (la frase afirma disfunción) y **no escribe grado**.

⚠️ **POR QUÉ ES MEJOR QUE «leve como mínimo»**: esa frase es una afirmación de severidad —dice que
es al menos leve y deja abierto que sea peor— sobre una banda donde la fuente **no publica ningún
corte**. La ASE 2025 de mayo publica **uno solo**, el de normalidad (Tabla 1 folio 145, texto folio
159). Censado otra vez en esta tanda: ni `ASE25_T1` ni ninguna ficha de `IND_REFS` abre bandas de
moderada o de severa para este parámetro.

**Lo que no cambia, y está medido:**

- −25 %, −20 %, −18 % y −15 % salen **idénticos a HEAD**;
- si `vdDisfGrado(tapse, sp)` dio un grado, **ese manda**: TAPSE 12 mm con onda S′ 6 cm/s sigue
  publicando «moderada» con el strain en −12. El strain nunca pudo y sigue sin poder subir un grado;
- **el voto no se perdió en el Laboratorio**: `_labDisfSistVent` devuelve `{vi:false, vd:true}` en
  los dos árboles, porque su regex busca «disfunción sistólica» y **no el grado**. La columna
  `DisfSist_VD` del Excel y las dos filas de `_LAB_HALLAZGOS` no se mueven.

### La nota de la ficha `FUN-VD-008`

Pasa a **una línea** y sale «leve como mínimo»:

> «La banda de disfunción leve —de 15 a 20 % en valor absoluto— es una decisión de la aplicación y
> va sin cita; por debajo de 15 % la aplicación informa disfunción sistólica sin graduar, porque la
> fuente no publica cortes de moderada ni de severa.»

Los dos folios siguen en el ⓘ, como los dejó la tanda A. El campo `valor` del registro `IND_REFS`
se actualizó igual, para que la ficha y el registro no digan dos cosas.

### ⚠️ Lo que sólo se REPORTÓ (3c), con el conteo medido

La tabla de esa ficha tiene cabecera **«Parámetro | Varón | Mujer»** y **47 filas** de cuerpo:

- **46 no distinguen sexo** (las dos celdas dicen lo mismo) y **1 sí**;
- hay exactamente **una** celda que no es un valor: la columna **«Mujer»** de la fila del strain,
  que dice «Decisión de la aplicación»;
- el `colspan` **no se usa hoy** en ninguna fila de esa tabla.

**Solución mínima propuesta**: que `_evRefTabla` admita una celda con `colspan=2` para las filas
sin distinción de sexo, y usarla en esa **única** fila — **1 fila afectada**. La variante amplia
—aplicarlo a las 46— mejora la lectura pero toca las **cinco** fichas que usan `_evRefTabla`, así
que es otra orden. → `docs/PENDIENTES.md` **E-c**.

---

## 7 · La orejuela: las dos tablas, y el fin del juicio por rango

### ⚠️ La premisa «sigue sin juzgar» era FALSA, y está medida

Juzgaba en **tres** lugares y uno era el papel firmado:

| dónde | qué decía |
|---|---|
| `oai-notas` | «**dentro de** / por debajo de / por encima de** la zona de anclaje del Amplatzer Amulet» |
| el badge `oai-elegibilidad` | verde «Ostium dentro de la zona de anclaje (11 a 31 mm)» · amarillo «Evaluar — medidas límite» |
| **el emisor del INFORME** | «potencialmente apto para cierre percutáneo (Watchman/Amulet)», «a evaluar para cierre percutáneo (Amulet)», «**fuera de rango para dispositivos actuales**» |

⚠️ **Y EL HALLAZGO MÁS GRANDE: los dos rangos VIEJOS seguían vivos en el informe**, escritos a
mano (`oDiam >= 17 && oDiam <= 31` y `oDiam >= 11 && oDiam <= 32`). La I-E1 cambió las
**constantes** de la pantalla en octubre y esta cascada se quedó atrás: **la pantalla ya no los
usaba y el documento que se firma sí.**

Hoy el informe publica «ostium 36 mm, profundidad 25 mm.» y nada más. Medido en las seis plantillas
del PDF. Censo: los dos rangos viejos dan **cero** en el texto visible del documento entero.

⚠️ **LA RAMA DEL TROMBO NO SE TOCA Y SE DECLARA.** «no apto para cierre percutáneo (trombo
presente)» también es un juicio, pero es una **contraindicación absoluta** y no un rango de tamaño,
la orden no la nombra, y el párrafo de arriba depende de ese gate — su propio comentario dice que
sin él el informe salía con dos párrafos seguidos donde uno manda a considerar el cierre y el otro
declara al paciente no apto. → `docs/PENDIENTES.md` **E-d**.

### Las dos tablas, verificadas contra el PDF original

**Esta tanda SÍ abrió los dos PDF** y las **catorce filas coinciden exactamente** con las que la
orden dictaba. No hubo una sola discrepancia.

| constante | filas | fuente |
|---|---|---|
| `OAI_AMULET_TABLA` | **8** · [tamaño, zona de anclaje mín, máx, distancia desde el orificio] | IFU, aprobación FDA **P200049** (2021), Apéndice A, **Tabla 2** «Sizing chart», **hoja 19**, **folio 15** |
| `OAI_WATCH_TABLA` | **6** · [tamaño, ancho máximo del ostium mín, máx] | IFU **52212467-01 rev. A** (2025-09), **Tabla 78** «WATCHMAN FLX Pro Device Selection», **hoja 26** |

⚠️ **EL «MAYOR O IGUAL» DE LA TABLA 2 ES UN GLIFO DE LA FUENTE SYMBOL (U+F0B3)**, no el U+2265 de
Unicode: la extracción de texto plano devuelve « 10» y « 12» **sin el signo**, así que una lectura
por `pdftotext` publicaría la distancia como un valor exacto. Verificado glifo por glifo.

⚠️ **SE USA LA PALABRA DEL MANUAL: «distancia desde el orificio»**, no «profundidad mínima».

⚠️ **LA REGLA DE PROFUNDIDAD DEL WATCHMAN VA EN PALABRAS**, textual de la nota al pie de la Tabla
78: «aproximadamente la mitad del diámetro del dispositivo o más». **Sin número fijo**, porque la
tabla no lo da.

⚠️ **LA RESERVA DE LA I-E1 SE RETIRA PORQUE DEJÓ DE SER CIERTA.** Escribía que la tabla del
WATCHMAN «no se pudo leer y no se cita», nombrando el **51245861-01 rev. A (2023-07), Tabla 62**.
El que se leyó ahora es **otro y más nuevo**.

### Dónde va cada cosa

- **pantalla**: una línea corta por dispositivo, con el rango **derivado de la tabla** y no escrito
  a mano. Un **assert al arrancar** grita si el sobre de cada tabla se separa de sus constantes
  `OAI_*_MIN`/`MAX`;
- **globo ⓘ** (`oaiTablasGlobo`): las dos tablas completas, su fuente por documento/tabla/hoja/folio
  y la regla de profundidad. **Todo con nodos**, ni un `innerHTML`;
- **ficha `ref-oai`** de Referencias: las dos tablas también (punto 4f: la ficha ya existía);
- **el rótulo** del recuadro pasa de «⚖️ Zona de anclaje — Amplatzer Amulet» a «⚖️ Medidas de la
  orejuela»: nombrar un dispositivo en el rótulo de un recuadro que ya no lo usa como criterio es
  decir que sí lo usa;
- **ni una fecha de consulta** en pantalla ni en el ⓘ (regla R5): `OAI_FAB_FECHA` se retiró del
  código y las fechas viven en `docs/fuentes/FUENTES.md`.

### Lo que NO se hizo, a propósito

- **el punto de medición** de la zona de anclaje y del ostium: las fuentes no coinciden y la app no
  elige por el médico (punto 4d);
- **el aviso de seguridad del Amulet** (FA-Q326-SH-1 del 10/9/2026, tres categorías de riesgo de
  distancia a la arteria pulmonar): la orden lo deja fuera, su PDF **no se abrió**, y queda como
  idea en `docs/PENDIENTES.md` → **E-e**.

---

## 8 · El caso y las mutaciones

La ficha de **TC-539** vive en `docs/mapa/tests-fichas-539.md` — archivo propio, porque
`tests-fichas.md` ya estaba en 34,2 KB.

Las mutaciones dirigidas están en `scripts/_mut_e.py`, y las sondas en
`scripts/_probe_te.mjs` (medición paso a paso, con gestos reales) y `scripts/_ab_e.mjs` (el A/B de
superficies firmadas, calcado de `_probe_bab.mjs`, que es el único de la familia **sin** el defecto
del `RECALC_MODULOS.forEach`).
