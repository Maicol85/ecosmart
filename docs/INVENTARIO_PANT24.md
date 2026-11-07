# INVENTARIO PANT-24 — las premisas, medidas antes de tocar nada

> **Commit 1 de la tanda PANT-24. SOLO LECTURA: no cambia un byte de `index.html`.**
> Linea base: `origin/main` = `HEAD` = **`a40073f`** (cierre de PANT-23, ya publicado),
> sello **`v20261107-1627`**, md5 de `index.html` **`224fd6ae`**, **168.717** lineas /
> **12.268.984** bytes. El sello al pie coincide con el de `CLAUDE.md`, verificado en la
> linea 165852 (`#eco-build-sello`). Pendrive `DISK_IMG` montado. Suite: **771** casos
> distintos, contados nombre por nombre sobre `caso('...')` — **los siguientes TC libres
> son TC-757 y los que siguen** (el numero mas alto usado es 756, y los 15 nombres de mas
> salen del relleno con ceros: `TC-04` y `TC-004` son dos nombres distintos para el runner).
>
> Las sondas de esta tanda: `scripts/_probe_pant24inv.mjs` (la TAVI y el AT/ET),
> `scripts/_probe_pant24info.mjs` (la zona de toque del ⓘ) y
> `scripts/_probe_pant24barr.mjs` (el barrido de textos). Nombres propios, verificados con
> `ls` antes de crearlos.

---

## (a) LA TAVI — la premisa se reproduce, palabra por palabra

**Lo que la orden afirma** y lo que la sonda midio con el gesto real (`va_morf` = `TAVI` y
nada mas, informe generado por `generarInforme`):

| estilo | linea de la valvula aortica, HOY |
|---|---|
| conciso | `VAo con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica.` |
| estandar | `Válvula aórtica con prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica.` |
| **narrativo** | **`La válvula aórtica presenta una prótesis transcatéter tipo TAVI, sin datos suficientes para graduar la estenosis protésica.`** |
| EN SUMA | *nada de esta valvula*: el resumen cae en «Sin otras alteraciones estructurales ni funcionales significativas — ver los hallazgos descritos en el cuerpo del informe.» |

La frase que el medico cito es **la del estilo NARRATIVO**, textual.

⚠️ **EL ESTILO NO ES UN `<select>`, Y LA PRIMERA CORRIDA DE LA SONDA LO PAGO.** Lo fija
`setEstiloInforme(estilo)`, que es el dueno, y las pastillas `.estilo-pill` son su interfaz;
no existe ningun `#estilo_informe`. Con un `getElementById('estilo_informe')` la sonda
devolvia **las tres lecturas identicas** —la del estandar— y eso se lee igual que «los tres
estilos dicen lo mismo». Se corrigio llamando al dueno y **comprobando** que
`estiloInforme === st` despues de cada cambio.

### De donde sale cada pieza

| pieza | dueno | linea |
|---|---|---|
| el veredicto (`via`, `nivel`, `niveles`, `falta`) | `eaProtVeredicto()` | 74014 |
| la frase y el resumen del papel | `eaProtNarrativa(P)` | 74212 |
| la frase de `nivel === 'faltan'` | `frase = 'sin datos suficientes para graduar la estenosis protésica' + med` | 74228 |
| el `resumen` de esa rama | `null` — por eso el EN SUMA no dice nada | 74229 |
| las tres oraciones del informe | `estiloPick(...)` dentro de `if (_eaProtN)` | 62622-62624 |
| el EN SUMA de la protesis | `if (_eaProtN.resumen) suma.push('Prótesis aórtica: …')` | 62642 |
| la guarda que hoy impide el renglon de «normofuncionante» a la TAVI | `if (P.via === 'TAVI') { reusar(V); return; }` | 65891 |
| el texto de la capsula de pantalla | `EA_PROT_TXT.faltan` = «Falta un dato para aplicar la tabla» | 74157 |
| las salvedades de pantalla | `_eaProtPintar` consume `N.salvedades` | 74352 |

**Las superficies donde sale la frase vieja o su estado:** informe narrativo, informe
estandar e informe conciso (tres oraciones, un solo emisor); **EN SUMA** (por reutilizacion
de la linea del cuerpo, no por una frase propia); **PDF** y **PPT**, que se arman del texto
del informe; **Guardados**, que guarda ese mismo texto; la **capsula de pantalla**
(`#ea-det-sev`), con «Falta un dato para aplicar la tabla», que NO es la frase del papel y
que la orden no toca; y la seccion **«Protesis aortica» del panel de Evidencia**, que publica
«Falta un dato para aplicar la tabla» con su lista de lo que falta. El **Laboratorio** no
publica esta frase.

### La tabla de las cinco escenas — antes / despues

| escena | `nivel` | informe HOY (estandar) | EN SUMA HOY | DESPUES |
|---|---|---|---|---|
| TAVI y nada mas | `faltan` | `… tipo TAVI, sin datos suficientes para graduar la estenosis protésica.` | — | **`… tipo TAVI normofuncionante.`** / **`TAVI normofuncionante.`** |
| TAVI + Vmax 2,0 (parcial NORMAL) | `faltan` | `… , sin datos suficientes … (Vmax 2 m/s).` | la linea del cuerpo, reutilizada | **`… tipo TAVI normofuncionante.`** / **`TAVI normofuncionante.`** |
| TAVI + Vmax 4,5 + G 45, sin DVI | `faltan` | `… , sin datos suficientes … (Vmax 4.5 m/s, G. medio 45 mmHg).` | la linea del cuerpo | **SIN CAMBIO** |
| TAVI + Vmax 4,5 + G 45 + DVI 0,20 | `signif` | `… , con criterios que sugieren estenosis protésica significativa (…).` | `Prótesis aórtica: criterios que sugieren estenosis protésica significativa.` | **SIN CAMBIO** |
| TAVI + Vmax 2,0 + G 8 + DVI 0,44 | `normal` | `… , sin criterios de estenosis protésica (…).` | `Prótesis aórtica: sin criterios de estenosis protésica.` | **SIN CAMBIO** |
| TAVI + IAo grado 3 | `faltan` | `… , sin datos suficientes … , con insuficiencia moderada-severa.` | `IAo moderada-severa.` | **SIN CAMBIO** |
| Protesis biologica (SAVR), nada mas | `faltan` | `… con prótesis biológica, sin datos suficientes …` | — | **SIN CAMBIO** |
| Protesis mecanica (SAVR), nada mas | `faltan` | `… con prótesis mecánica, sin datos suficientes …` | — | **SIN CAMBIO** |
| Trivalva normal (nativa) | — | `Válvula aórtica trivalva normal, sin estenosis ni insuficiencia.` | `Estudio sin alteraciones …` | **SIN CAMBIO** (control negativo) |

⚠️ **LA TERCERA ESCENA ES LA QUE OBLIGA A LEER LA CONDICION COMPLETA.** Con Vmax 4,5 y
gradiente 45 **sin DVI** el nivel tambien es `faltan`, y ahi decir «normofuncionante» seria
afirmar lo contrario de lo que los dos ejes medidos sugieren. Es exactamente el defecto que
`/sharp-edges` ya cazo una vez en este mismo bloque —«una SAVR con Vmax 4,5 y gradiente 45
SIN DVI se resumia normofuncionante mientras el cuerpo decia sin datos suficientes»—. Por eso
la condicion de la orden —«SIN ningun dato cargado que indique estenosis o insuficiencia
protesica»— se implementa como: **via TAVI** + **nivel `faltan`** + **ningun nivel medido
distinto de `normal`** + **sin insuficiencia**.

⚠️ **EL CAMPO DEL GRADO DE LA INSUFICIENCIA AORTICA ES `ia_grado`, NO `ia_sev_final`.** Con
`ia_sev_final` —que no existe en el DOM— la linea salia **sin** la mitad de insuficiencia, o
sea la escena no llegaba a la condicion y el cero se leia igual que «la insuficiencia no
cambia nada». Y la insuficiencia tiene **dos** fuentes: el grado (`ia_grado`) y el **escalon
sin grado** (`EA_ESCALON_SIN_GRADO` + `_aoSinGrado('ia')`), que con la pastilla abierta y sin
grado emite «con insuficiencia». Las dos se conocen en el bloque del informe, no en el
emisor: por eso el emisor publica una **marca** y el bloque del informe compone.

⚠️ **EL DVI NO SE SIEMBRA POR `ea_dvi_display`.** Ese `<input>` es `readonly` y lo pisa
`calcAo`; el veredicto lee **`dvi-val`** primero. El DVI se siembra con **`itv_tsvi`** y
**`itv_ao`** (DVI = `itv_tsvi / itv_ao`): 20 y 100 dan 0,20 (significativa) y 22 y 50 dan
0,44 (normal). Con `ea_dvi_display` las dos escenas «completas» salian con `dvi: null` y
`nivel: faltan`, o sea **el denominador estaba vacio** y las dos se leian igual que la escena
parcial.

### Lo que la orden manda PARAR y queda declarado

El **PPM aortico** (Tabla 7) se publica en su propia oracion y no depende del veredicto de
estenosis. Es alcanzable que un estudio tenga `nivel: faltan` con todos los niveles normales
—DVI cargado y Vmax y gradiente vacios— y a la vez un **desajuste moderado o severo**, con lo
que el papel diria «TAVI normofuncionante.» y debajo «Desajuste protésico-paciente aórtico
severo». La orden **no dice** nada del PPM, y decidir si un desajuste impide llamar
normofuncionante a la protesis es contenido clinico. **No se toca y queda en P24-a.**

---

## (b) EL AT/ET — la premisa se reproduce, y la fila NO es donde sale el 1.67

Con `va_morf` = `TAVI`, `va_at` = **100** y `tango_te` = **60**:

| superficie | que dice HOY | ¿sale el cociente? |
|---|---|---|
| **fila `#ea-det-atet`** | `—` | **NO.** `_eaAtEtVal()` ya devuelve `null` con `!(at < et)` |
| fila `#ea-det-at` | `100 ms — posible estenosis (80–100 ms)` | no |
| **el aviso (la linea amarilla)** | **`El AT (100 ms) y el AT/ET (1.67) por sí solos no establecen estenosis.`** | **SI, con PUNTO** |
| **«Ver detalle» (el plegable de la capsula)** | `El cociente AT/tiempo eyectivo es de 1.67, fuera del rango normal (< 0,32), y tampoco vota por sí solo.` | **SI, con PUNTO** |
| **informe, los TRES estilos** | `… sin datos suficientes para graduar la estenosis protésica (AT 100 ms, AT/TE 1.67).` | **SI, con PUNTO — y es PAPEL** |
| **EN SUMA** | la linea del cuerpo, reutilizada, con el `1.67` adentro | SI |
| **PDF y PPT** | el mismo texto del informe | SI |
| Evidencia (seccion «Protesis aortica») | «Falta un dato para aplicar la tabla» + lo que falta | no publica el cociente |
| Laboratorio | — | no |
| **¿vota?** | **NO.** `dep = [nv.vmax, nv.gmed]`, `indep = [nv.dvi, nv.eoa]`: `nv.atet` se calcula y no entra en ninguna de las dos listas | — |

**La asimetria esta declarada desde PANT-18 en `docs/PENDIENTES.md` → P18-b**, y el
comentario del codigo la escribe: «`eaProtVeredicto` calcula `at / et` en cuanto el ET es
positivo, sin pedir que el AT sea menor». El dueno del cociente de la **fila** es
`_eaAtEtVal()` (74548); el del **veredicto** es la linea 74037,
`const atet = (at != null && et != null && et > 0) ? (at / et) : null;`.

### Los bordes medidos

| AT | ET | cociente | `niveles.atet` | fila | aviso | informe |
|---|---|---|---|---|---|---|
| 100 | 60 | 1,667 | `signif` | `—` | `… AT/ET (1.67) …` | `AT/TE 1.67` |
| 60 | 60 | **1,000** | `signif` | `—` | `El AT/ET (1.00) por sí solo …` | `AT/TE 1.00` |
| 99 | 100 | 0,99 | `signif` | `0.99 — sugiere estenosis significativa (> 0,37)` | `… AT/ET (0.99) …` | `AT/TE 0.99` |
| 50 | 100 | 0,50 | `signif` | `0.50 — sugiere estenosis significativa (> 0,37)` | `… AT/ET (0.50) …` | `AT/TE 0.50` |
| 37 | 100 | 0,37 | `posible` | `0.37 — posible estenosis (0,32–0,37)` | `… AT/ET (0.37) …` | `AT/TE 0.37` |
| 32 | 100 | 0,32 | `posible` | `0.32 — posible estenosis (0,32–0,37)` | `… AT/ET (0.32) …` | `AT/TE 0.32` |
| 100 | 60, protesis **quirurgica** | 1,667 | `signif` | `—` | `… AT/ET (1.67) …` | `AT/TE 1.67` |

**El 1 exacto tambien entra:** con AT 60 y ET 60 el cociente es `1.00` y hoy se publica en las
cuatro superficies. La ultima fila es el **control de que el defecto no es de la TAVI**: una
protesis quirurgica con los mismos valores publica lo mismo.

### Los numeros con PUNTO decimal en texto visible en espaniol

| donde | texto | ¿lo toca esta tanda? |
|---|---|---|
| la **fila** del AT/ET | `0.50 — sugiere estenosis significativa (> 0,37)` — el valor con punto al lado de los cortes con coma | **SI**: la orden pide la coma en esa ruta |
| el **aviso** de pantalla | `El AT/ET (0.50) por sí solo no establece estenosis.` | **SI**: es pantalla |
| **«Ver detalle»** | `El cociente AT/tiempo eyectivo es de 0.50, fuera del rango normal (< 0,32)` | **SI**: es pantalla |
| el **informe firmado** | `(AT 50 ms, AT/TE 0.50)` | **NO.** Cambiarlo moveria el papel, y el papel tiene **dos** diferencias autorizadas y esta no es una. Queda listado en **P24-c** |
| el **DVI del informe** | `(… DVI 0.20)`, `(… DVI 0.44)` — `P.dvi.toFixed(2)` | **NO**, mismo motivo. **P24-c** |
| el **PPM / AEO indexada** y la **EOA del catalogo** | los `toFixed(2)` de la misma familia | **NO**, no se midieron de a uno: se listan como familia en **P24-c** |

---

## (c) `escGuchCiv` — ubicacion y texto exactos

`index.html` linea **89209**, entrada `{ k:'escGuchCiv', full: … }` del registro `IND_REFS`
(es `IND_REFS[4]`). Es la **unica** entrada del registro con estas dos frases. Visible en la
bibliografia de la seccion **«Comunicacion interventricular»** del panel de Evidencia y en
**Referencias**.

Las dos frases que exponen lo pendiente, textuales:

1. `⚠️ EL CRITERIO QUE ESTA SECCIÓN APLICA DIVERGE DE ESA TABLA Y LA DIVERGENCIA ESTÁ SIN RESOLVER:`
2. `Verificación clínica pendiente: hasta resolverla, el nivel de evidencia no se publica y esta referencia no se unifica con la de sus secciones hermanas.`

Y una tercera forma que cae bajo la **regla del 04/11** —lo que una guia **no** dice—:
`y el corte de DDVI indexado > 32 mm/m² no figura en el documento.`

### El molde de PANT-22, medido sobre su propio diff

Las frases con que PANT-22 reescribio lo que antes decia «ninguna guia»:

- `Las reglas de conteo de esta sección —cuántos criterios hacen falta de cada lado, y cuáles cuentan— son un criterio propio de la aplicación.`
- `Para la insuficiencia mitral PRIMARIA las cifras de esta pantalla son un criterio propio de la aplicación.`
- `… las medidas se muestran y no se interpretan, y los cortes que la pantalla rotula son un criterio propio de la aplicación.`
- `Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos y congestión cuando la presión capilar supera los 18 mmHg.` *(la forma afirmativa: lo que la app hace, sin comparar)*

El molde es **«… son un criterio propio de la aplicación»** mas **cada fuente por lo que ella
misma dice, en su propia oracion, con su hoja y su folio**. Ningun numero, hoja, folio, tabla
ni clase de la entrada se pierde: la reescritura usa los que ya estan.

---

## (d) EL CORTE DE 10 MM — los lugares, medidos sobre el objeto que los publica

| # | donde | texto |
|---|---|---|
| 1 | `PROTA_PREG[10].lbl` (`prota.trombGrande`) | `Trombo protésico grande, de más de 10 mm, complicado con embolia` |
| 2 | `PROTA_PREG[10].rec` | `Clase IIa · Nivel C — la cirugía debe considerarse ante un trombo protésico grande, de más de 10 mm, complicado con embolia, hoja 66, folio 4700` |
| 3 | `PROTA_PREG[10].nota` | `la Tabla 17 imprime «más de 10 mm» y su Figura 20 (hoja 65, folio 4699) imprime «10 mm o más». Esta pregunta usa el de la tabla` |
| 4 | `PROTT_PREG[10].lbl` (`prott.trombGrande`) | igual que 1 |
| 5 | `PROTT_PREG[10].rec` | igual que 2 |
| 6 | `PROTT_PREG[10].nota` | igual que 3 |
| 7 | `PROTM_REC_2025.tromb_emb.t` | `Cirugía A CONSIDERAR ante un trombo protésico grande (mayor de 10 mm) complicado con embolia.` |
| 8 | la nota en linea de la protesis **mitral**, `index.html` 95329 | `Y la cirugía es a considerar (Clase IIa · Nivel C) ante un trombo grande, mayor de 10 mm, complicado con embolia. El tamaño del trombo y la clase funcional no se registran en esta aplicación.` |

**El recuento, dicho de las dos formas, porque la orden pone un tope en «tres lugares»:**
son **TRES** items de la Evidencia donde el medico ve el corte —la pregunta de la **protesis
aortica**, la pregunta de la **protesis tricuspide** y la recomendacion de la **protesis
mitral**— y **OCHO** cadenas, porque cada pregunta lo escribe en su `lbl`, en su `rec` y en su
`nota`, que es la forma estandar de UNA pregunta en este archivo. **No hay una cuarta
seccion**: la **protesis pulmonar** (`PROTP_PREG`) **no tiene** este corte, verificado sobre
el objeto.

**La aplicacion NO aplica ese corte a ningun numero suyo**, verificado: el tamanio del trombo
no es un campo de esta aplicacion, y las dos notas lo dicen («El tamaño del trombo y la clase
funcional no se registran en esta aplicación»). Se publica como texto.

Las dos cadenas **3** y **6** comparan las dos partes del mismo documento: cae bajo la regla
del 04/11 y esta declarado desde PANT-21 en **P21-a**.

---

## (e) EL ⓘ DE LA EVIDENCIA — la zona de toque de hoy, medida con emulacion tactil

Medido con `hasTouch: true`, que es lo que hace que **`(pointer: coarse)` empareje**
—comprobado: `solo viewport` da `coarse:false` y `hasTouch` da `coarse:true`—, con el panel
abierto **por su boton**, las 45 secciones sembradas una por una y las transiciones apagadas.

| que | a 1440 px |
|---|---|
| secciones recorridas | **45** (44 con globos; una sin ninguno) |
| globos `details[data-ind-info] > summary` | **473** |
| tamanio visible del glifo | **11 × 14 px**, `font-size` **11 px**, identico en los 473 |
| zona de toque de HOY (barrido con `elementFromPoint` desde el centro) | **± 5-6 px** a los lados y **± 6-8 px** arriba y abajo: la del propio glifo |
| globos con la caja de 44×44 respondiendo en sus **cuatro** esquinas | **0 de 473** |
| caja de 44×44 que se superpone con un **boton de respuesta** | **0** |
| caja de 44×44 que se superpone con **otro ⓘ** | **129 pares** |
| desplazamiento horizontal | **0** |

### Los pares de ⓘ vecinos a menos de 44 px

**129 pares**, y los 129 con **`dx` = 0 y `dy` = 42,9 px**: son **filas de preguntas
consecutivas**, mismo lugar en la fila, una debajo de la otra. **No hay un solo par apretado
en horizontal.** Por seccion:

| distancia minima entre centros | secciones | globos |
|---|---|---|
| **42,9 px** | **24** | 368 |
| 45 px | 11 | — |
| 55 px | 6 | — |
| 104 px | 3 | — |
| — (un solo globo) | 1 | — |
| | | **105** en las 20 secciones sin par apretado |

**Consecuencia medida, y es la que decide el commit 5:** una caja de 44 px de alto sobre un
paso de fila de 42,9 px se pisa **1,1 px** con la de arriba y con la de abajo. El maximo alto
que NO se pisa es **42 px**. En el eje horizontal no hay ninguna restriccion, asi que la
anchura puede ser 44 entera.

### Los ⓘ de FUERA del panel — medidos y NO tocados

**121** `.vinfo-btn` en el archivo; con todas las pestanias y secciones abiertas, **64**
tienen geometria a 1440 px, y los **64** miden **44 × 44 px** con `(pointer: coarse)`:
**cero** por debajo de 44 en cualquiera de los dos lados. Ya los cubre la regla
`@media (pointer: coarse){ .vinfo-btn{ min-width:44px; min-height:44px } }` (linea 2713), y
**65** llevan ademas la clase `vinfo-btn-44`, que les pone el piso sin la media query.
El censo completo de los **143** glifos de ⓘ de fuera del panel, por mecanismo y por
pestania, esta en **P23-b** y no se repite aca.

**Esta tanda no los toca**, que es lo que la orden manda.

---

## (f) BARRIDO DE TEXTOS QUE EXPONEN LO PENDIENTE — SOLO REPORTE

Medido **sobre `textContent` en el navegador** y **no por grep**, que es la regla de esta
casa: un grep sobre el archivo marca cientos de **comentarios**, que en esta casa van sin
tilde y sin pulir a proposito. Cuatro superficies, con su denominador:

| superficie | denominador | hallazgos crudos |
|---|---|---|
| el DOM con todo abierto, sin `<script>` ni `<style>` | **309.328** caracteres | 13 |
| los registros `EV_REG` (537 cadenas / 30.778 car.), `IND_REFS` (128 / 48.476), `VINFO` (409 / 102.518), `QV_BARRA` (66 / 377) | **1.140** cadenas | 17 |
| el panel de Evidencia, seccion por seccion, con los globos ABIERTOS | **45** secciones, **502.474** caracteres | 37 |
| el papel: informe en los TRES estilos y EN SUMA, en 4 escenas | **7.868** caracteres | **0** |

**CONTROL POSITIVO: 6 frases inyectadas, 6 detectadas.** Sin el, un cero se lee igual que
«la sonda no mira nada».

Los patrones: `pendiente`, `pendientes`, `sin resolver`, `a decidir`, `por resolver`,
`por definir`, `por verificar`, `sin definir`, `sin decidir`, `provisorio`, `provisoria`,
`proximamente`, `a confirmar`, `por confirmar`, `queda declarado`, `falta decidir`,
`en revision`, `sin validar`, `a revisar`, `por revisar`, `no implementa`, `todavia no`,
`aun no`, `queda pendiente`, `sin terminar`, `en curso`, `provisional`, y `TODO` **solo en
mayusculas como token suelto** —en espaniol «todo» es una palabra corriente—.

El reporte clasificado va en **`docs/PENDIENTES.md` → P24-b**. En dos lineas: de los **67**
hallazgos crudos, **4 son textos visibles que de verdad exponen lo pendiente** (dos son la
entrada `escGuchCiv`, que esta tanda corrige, y dos son el «Queda declarado, no corregido.»
de la estenosis mitral); el resto son **falsos positivos del patron** —«dosis-dependiente»,
«independientemente de los sintomas», «para confirmar el diagnostico», «en curso dentro de
las 48 horas»— o caen en las **excepciones que la propia regla declara**: un dato clinico del
paciente, un puntaje «provisorio», y lo que una fuente dice de si misma.

⚠️ **`EV_REG[*].estado = 'por verificar'` NO ES TEXTO VISIBLE, y se midio.** Los tres
hallazgos del registro son metadato: `estado` solo gobierna si la linea de fuente se publica
(`f.estado === 'verificado'`), y la palabra nunca llega al DOM — el barrido del DOM, con
309.328 caracteres, no la encuentra ni una vez. Es el recordatorio de que un barrido sobre un
**objeto** incluye campos que no se dibujan.

⚠️ **El papel da CERO, y no es un denominador vacio:** las cuatro escenas producen 7.868
caracteres de informe y EN SUMA, y el control positivo del DOM prueba que el buscador
encuentra lo que tiene que encontrar.

---

## (g) LOS CASOS QUE AFIRMAN LO QUE ESTA TANDA CAMBIA — corridos ANTES

| caso | que afirma, y por donde toca esta tanda |
|---|---|
| **TC-287** | el AVA, el AVAi y el DVI aorticos son un solo calculo |
| **TC-288** | el AT de la protesis: su corte de la ASE 2024 y la nota de pantalla |
| **TC-289** | el cuerpo dice «sin datos suficientes para graduar la estenosis protesica» y el EN SUMA nombra la protesis |
| **TC-290** | la severidad sale de la Tabla 5, exige las dos mitades, y **los tres operadores**: `EA_PROT_CRIT.atet_normal_max === 0.32` y `atet_signif_min === 0.37`, con el AT/ET «ejercido en aislamiento» porque **no vota** |
| **TC-303** | el EN SUMA no afirma «protesis normofuncionante» donde la app no gradua ni donde falta un eje — **es el caso de P18-d** y el que aisla la guarda `P.via === 'TAVI'` |
| **TC-322** | recorre `IND_SECS` y siembra `escGuchCiv` para la comunicacion interventricular |
| **TC-513 / TC-514** | «mas de 10 mm» — pero es el **aneurisma del septum**, no el trombo protesico: no los toca esta tanda |
| **TC-705** | una lista de formas que incluye «sin datos suficientes» |
| **TC-747** | PANT-21: el orden de protesis no toca otra seccion y la Evidencia no llega al papel |
| **TC-751** | PANT-22: ningun texto dice que dos fuentes no coinciden, con control positivo |
| **TC-753** | LIMPIEZA-1: el sello y el renglon de tamanio de `CLAUDE.md` siguen ahi — **lee el sello del pie, no lo escribe a mano** |

**La base, corrida sobre `a40073f` antes de tocar nada: `RESULTADO: 12/12 ✓ — sin regresiones`.**

---

## md5 de `index.html`

**`224fd6ae`** al abrir el commit 1 y **`224fd6ae`** al cerrarlo: este commit no cambia la
aplicacion.
