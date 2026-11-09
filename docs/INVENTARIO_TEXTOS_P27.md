# Inventario de los 14 textos de la tanda PANT-27 (2026-11-09)

Documento de **solo lectura**: el commit que lo crea **no toca `index.html`**.
md5 de `index.html` al escribirlo: **f2587ad8**, el mismo que dejo PANT-25 — sin cambio.

Para cada texto: (a) ubicacion exacta y texto completo actual; (b) como esta escrito y como
se muestra; (c) en que condicion se muestra; (d) si el mismo texto visible aparece en otro
lugar; (e) los casos que lo afirman, buscados por los literales exactos.

---

## Resumen de la medicion, y las TRES premisas de la orden que NO se reprodujeron

| # | lo que la orden supone | lo que se midio | consecuencia |
|---|---|---|---|
| 1 | T10 a T13 estan en una **nota de la Evidencia** de la insuficiencia aortica | estan en la **ficha de Referencias** `ref-ia` (lineas 22492-22505), que es donde viven los CUATRO literales; tres de los cuatro **no existen** en la nota de Evidencia | se aplican en `ref-ia`, que es el unico lugar donde los literales caen; la nota de Evidencia (linea 97302) **no se toca** y queda en **P27-a** |
| 2 | T14 esta en un lugar de la app **especifico de protesis mecanicas** | de las **tres** apariciones visibles, **solo una** lo es: la nota del ramal `tipo === 'mec'` de la seccion mitral (linea 95619). La pregunta aortica `prota.trombGrande` y la tricuspide `prott.trombGrande` **no estan acotadas por tipo de protesis** | la oracion se suma **solo** a la nota mitral mecanica; las otras dos quedan en **P27-a** |
| 3 | T2 es **una** nota | `EM_NOTAS` tiene **DOS** notas que empiezan con ese literal: la de etiologia **reumatica** (linea 94536) y la de etiologia **no reumatica** (linea 94546). La orden solo aprueba la segunda | se cambia **solo** la de etiologia no reumatica; la reumatica queda intacta y se declara en **P27-a** |

**Una cuarta medicion, que no es una premisa de la orden:** `PROTM_REC_2025.tromb_emb`
(linea 95520) contiene el corte de 10 mm pero **no tiene ningun consumidor** en el archivo
—censado: su clave no se lee en ninguna parte—, asi que su texto **no es visible**. Es dato,
no pantalla. El caso TC-759 lo cuenta porque recorre el objeto del registro.

---

## Los siete textos de la estenosis mitral (T1 a T7)

**Ubicacion comun.** Funcion **`EM_NOTAS(US, etio, D)`**, que empieza en la linea **94484**.
Es el **detalle plegado** de la seccion «Estenosis mitral» del panel de Evidencia: `_indEM`
la llama y publica su resultado en `notas`. Las siete son elementos del array que la funcion
devuelve (`return [` en la linea **94492**).

**Como estan escritas (medido en el archivo).** Cadenas de JavaScript entre comillas simples,
con los acentos y las comillas angulares **como caracteres reales** —no entidades HTML—, y con
concatenacion de variables por `+`. Seis son objetos `{ txt:..., refs:[...] }`; **T2 es una
cadena pelada**, sin `refs`, porque la regla de la seccion le prohibe el corchete.

**Como se muestran.** El detalle plegado las pinta pasandolas por **`_critEsc`**, asi que el
caracter real llega escapado al HTML y el medico lee la tilde y la comilla angular. El camino
que ya usa el lugar **si** muestra tildes: no hay que cambiar de convencion.

**Condicion de pantalla (comun a las siete).** Hace falta una **estenosis mitral nativa**
cargada para que `_indEM` devuelva seccion; dentro de esa seccion, el detalle esta **plegado**
y hay que abrirlo. **T2 y las dos notas de la ASE 2023 se filtran ademas por etiologia**
(ver cada ficha).

**Las variables que las siete comparten.**

- **`u`** = `(US != null) ? _indNum(US, 1) : '1,5'` (linea **94485**): el area de corte con
  **coma decimal**, formateada por `_indNum`. La usan **T1, T6, T7** y la nota de guias previas.
- **`EM_CRIT_2025.score_desfav`**: el 8 del score. Lo usan **T5** y la nota de guias previas.

---

### T1 — `index.html` lineas 94501-94502

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'El operador del área no es el mismo en los tres lugares del documento: el enunciado de severidad (folio 4680) y el título de la Figura 14 (folio 4681) dicen ≤ ' + u + ' cm², y el §10.2.3 del folio 4680 escribe «MVA <1.5 cm2» con menor estricto. Esta aplicación usa ≤, que es lo que dicen dos de los tres. Queda declarado, no corregido.',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional: sale siempre que la seccion exista.
- **(d) El mismo texto en otro lugar:** ninguno — el literal «operador del area no es el mismo» aparece **una sola vez** en todo el archivo.
- **(e) Casos que lo afirman:** ninguno por su literal.

---

### T2 — `index.html` lineas 94546

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    (etio && etio !== 'reumatica') ? 'Los dos cortes del gradiente medio que esta aplicación aplica —5 y 10 mmHg— salen de un documento de cardiopatía REUMÁTICA, y la aplicación los usa en TODA etiología para decidir la categoría. En esta válvula, que no es reumática, el gradiente se ubica en su banda y la banda no se cita: no hay fuente verificada que escriba esos cortes para esta etiología. Queda declarado, no corregido.' : '',
```

- **(c) Condicion de pantalla:** **SOLO con etiologia distinta de reumatica y no vacia**: el ternario es `(etio && etio !== 'reumatica') ? ... : ''`, asi que con etiologia reumatica, y tambien **sin etiologia cargada**, la nota no existe.
- **(d) El mismo texto en otro lugar:** su hermana de etiologia **reumatica** (linea **94536**) empieza con el MISMO literal y **no la cambia esta orden**; ver P27-a.
- **(e) Casos que lo afirman:** ninguno por su literal; **TC-327** afirma que la ASE 2023 se cita solo con etiologia reumatica, que es la condicion de la hermana.

---

### T3 — `index.html` lineas 94494-94495

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'La palabra de la guía es «clínicamente grave» («clinically severe MS», folio 4680) y lo que la define es el área JUNTO CON factores clínicos: síntomas, riesgo tromboembólico alto o descompensación hemodinámica. El informe de esta aplicación dice «significativa» para el mismo hecho.',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional.
- **(d) El mismo texto en otro lugar:** «clinicamente grave» aparece ademas en las lineas **94552**, **94559**, **94904** y **95324**, pero el literal completo «La palabra de la guia es «clinicamente grave»» esta **una sola vez**.
- **(e) Casos que lo afirman:** ninguno por su literal.

---

### T4 — `index.html` lineas 94506-94507

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'Las características desfavorables tampoco se definen igual en los dos lugares: la nota ^c de la Recommendation Table 8 (folio 4682) dice «the presence of several of the following» sin dar número, y la nota ^c de la Figura 14 (folio 4681) dice «Favourable = absence of unfavourable characteristics», o sea ninguna. Con «Una» esta aplicación no elige entre las dos lecturas: publica las filas que aplican en cada una.',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional.
- **(d) El mismo texto en otro lugar:** ninguno — «tampoco se definen igual» aparece **una sola vez**.
- **(e) Casos que lo afirman:** ninguno por su literal.

---

### T5 — `index.html` lineas 94512-94513

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'El corte del score es «score ecocardiográfico > ' + EM_CRIT_2025.score_desfav + '», según la guía. La definición de esa escala vive en su material suplementario (Table S3), que no está en el documento consultado: la aplicación usa el corte tal como la guía lo escribe y no lo atribuye a ninguna escala concreta.',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional.
- **(d) El mismo texto en otro lugar:** ninguno — «El corte del score es» aparece **una sola vez**.
- **(e) Casos que lo afirman:** ninguno por su literal.

---

### T6 — `index.html` lineas 94514-94515

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'Contraindicaciones de la comisurotomía (Tabla 8, folio 4682): AVm > ' + u + ' cm²; trombo en aurícula izquierda; insuficiencia mitral MÁS QUE LEVE —no «moderada o más»—; calcificación severa o bicomisural; ausencia de fusión comisural; valvulopatía aórtica severa, o estenosis e insuficiencia tricuspídeas severas con indicación quirúrgica; coronariopatía que requiera revascularización quirúrgica.',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional.
- **(d) El mismo texto en otro lugar:** «Contraindicaciones de la comisurotomia (Tabla 8)» es tambien el **titulo de dos tablas del cuerpo** de la seccion, lineas **95193** y **95301** (`tit:`), y aparece en un comentario en la **92590**. Son titulos, no este texto: **no se tocan**.
- **(e) Casos que lo afirman:** ninguno por su literal.

---

### T7 — `index.html` lineas 94519-94520

**Texto completo actual, sin recortar** (tal como esta en el archivo):

```javascript
    { txt:'Las dos excepciones de esa tabla: con AVm > ' + u + ' cm² puede considerarse si los síntomas no se explican por otra causa y la anatomía es favorable (nota ^a); y con el trombo en la OREJUELA —no en toda la aurícula— puede considerarse en quien tiene contraindicación quirúrgica o no tiene necesidad urgente, anticoagulando 1-3 meses y con un ETE de control que confirme la resolución (nota ^b).',
      refs:['esc2025vc'] },
```

- **(c) Condicion de pantalla:** sin filtro adicional.
- **(d) El mismo texto en otro lugar:** ninguno — «excepciones de esa tabla» aparece **una sola vez**.
- **(e) Casos que lo afirman:** **TC-328**, condiciones (2) y (3): busca la nota con `notaCon('Las dos excepciones de esa tabla')` y con `notaCon('el trombo en la OREJUELA')`, y exige `1-3 meses`, `ete de control`, `no se explican por otra causa`, `anatomia es favorable` y la cita `esc2025vc`.

---

## T8 — Fontan, entrada `fon.ev.sangrado`

**Ubicacion.** Registro **`FON_PREG`**, entrada de clave **`fon.ev.sangrado`**, `index.html`
linea **97678** (una sola linea). La consume `_indFON`.

**Texto completo actual, sin recortar:**

```javascript
  { clave:'fon.ev.sangrado', lbl:'Contraindicacion de sangrado para la anticoagulacion', guia:'acc', rec:'Clase 1 · Nivel B-NR, recomendacion 13 — en ausencia de rasgos de alto riesgo o de contraindicaciones de sangrado, el tratamiento con aspirina O anticoagulacion esta recomendado para reducir la probabilidad de enfermedad tromboembolica, hoja 87, folio e201', nota:'esta pregunta se contesta al reves que las otras: con contraindicacion de sangrado, la recomendacion 13 NO aplica', ref:'la ESC 2020 solo indica anticoagulacion con trombo, arritmia auricular o tromboembolia, y no publica una recomendacion para el paciente sin rasgos de alto riesgo (hoja 65, folio 627)', tramo:'las dos guias no cubren lo mismo: la ACC/AHA 2025 indica aspirina o anticoagulacion a TODO paciente sin rasgos de alto riesgo, y la ESC 2020 no' },
```

- **(b) Como esta escrito.** Cadena de JavaScript **SIN NINGUNA TILDE** —`recomendacion`,
  `anticoagulacion`, `guias`, `arritmia auricular`— y sin entidades HTML. Es la convencion de
  **todo** el registro `FON_PREG`: censadas sus trece entradas, ninguna lleva tilde. **Lo que
  el medico ve es el texto sin tilde**, porque el renderizador no transforma nada.
- **Como se muestra.** `_indPregNota` (linea **90965**) arma la fila concatenando partes con
  `partes.join('. ')`:
  - `if (p.ref) partes.push((p.refLbl || 'ESC 2020 (anterior)') + ': ' + p.ref);` (linea **90980**)
  - `if (p.tramo) partes.push('Nota: ' + p.tramo);` (linea **90981**)
  Asi que en pantalla se lee **«ESC 2020 (anterior): ...»** y **«Nota: ...»**.
- **El `tramo` esta GUARDADO por un `if`**, medido en la linea 90981: quitar la propiedad
  **no deja rotulo huerfano, ni linea vacia, ni error**. Y como las partes se unen con `'. '`,
  el texto de `ref` **no debe terminar en punto**: el separador lo agrega.
- **(c) Condicion de pantalla:** hace falta un **Fontan** cargado (`fontanEstado()` con datos)
  para que `_indFON` devuelva seccion; la fila existe contestada o sin contestar.
- **(d) El mismo texto en otro lugar:** ninguno. El literal «no cubren lo mismo» aparece
  **una sola vez** en todo el archivo, en esta linea.
- **(e) Casos que lo afirman:** ninguno por su literal («no cubren lo mismo» da 0 en
  `scripts/test_clinico.mjs`).

---

## T9 — el globo de la calculadora de TAVI, clave `tavi-calc`

**Ubicacion.** Registro **`VINFO`**, clave **`tavi-calc`**, `index.html` lineas
**48701-48715**, titulo «La calcificacion de la valvula aortica», ancho 460. El parrafo que
la orden cambia es el **ultimo**, linea **48715**.

**El globo COMPLETO, sin recortar** (es lo que la orden pide leer entero):

```javascript
      'DE DÓNDE SALE EL CRITERIO. Ninguna de las fuentes de esta biblioteca publica una clasificación con grados —leve, moderada, severa— de la calcificación de la válvula aórtica, ni por ecocardiografía ni por tomografía. La graduación de este campo queda a criterio de quien informa: las fuentes no la definen con grados.\n'
    + 'La guía de estandarización del informe de la Sociedad Americana de Ecocardiografía lo dice en su Tabla 1: desaconseja escribir «calcificación valvular aórtica leve, moderada o severa» salvo que el laboratorio tenga su propia definición interna, y como regla general desaconseja graduar una entidad sin grados publicados. Folio 739.\n'
    + '\nLO QUE SÍ EXISTE: EL PUNTAJE DE CALCIO POR TOMOGRAFÍA. Son cortes de severidad de la ESTENOSIS, no grados de calcificación, y se miden con el método de Agatston, por sexo. Guía europea de 2025, folio 4663:\n'
    + '· Por encima de 2000 unidades Agatston en el varón y de 1200 en la mujer: estenosis aórtica severa, con sensibilidad y especificidad cercanas al 85 %.\n'
    + '· Umbrales más específicos: por encima de 3000 en el varón y de 1600 en la mujer.\n'
    + '· La estenosis severa es poco probable por debajo de 1600 en el varón y de 800 en la mujer.\n'
    + '· La misma guía pide cautela en la válvula bicúspide, en la amiloidosis concomitante y en la estenosis predominantemente fibrótica —posreumática, por radiación e inflamatoria—, donde puede haber estenosis severa sin calcificación pronunciada.\n'
    + 'Los mismos dos cortes son un nodo de su Figura 6, el árbol de evaluación integrada de la estenosis aórtica, folio 4664.\n'
    + '\nUNA DIFERENCIA ENTRE FUENTES, QUE SE MUESTRA Y NO SE RESUELVE, LA MÁS NUEVA PRIMERO. El corte de la mujer: la guía europea de 2025 escribe más de 1200 unidades (folio 4663); una revisión de 2023 sobre la evaluación ecocardiográfica de la estenosis aórtica escribe más de 1300. El del varón coincide en 2000 en las dos.\n'
    + '\nPARA EL TAVI, LA GUÍA DESCRIBE LA CALCIFICACIÓN EN TÉRMINOS CUALITATIVOS Y SIN GRADOS. Folio 4668:\n'
    + '· Calcificaciones excesivas o voluminosas del anillo o del tracto de salida aumentan el riesgo de fuga paravalvular y de rotura anular.\n'
    + '· En la válvula bicúspide, la calcificación asimétrica de los velos suma complejidad, junto con la forma elíptica del anillo.\n'
    + '· La calcificación marcada de los velos, sobre todo junto con un rafe calcificado, se asocia a más riesgo de lesión de la raíz aórtica, fuga paravalvular y mortalidad.\n'
    + 'La tomografía multicorte es la herramienta de elección para ver la extensión y la distribución de la calcificación de la válvula y del tracto de salida, folio 4663.\n'
    + '\nY LA GUÍA USA LA PALABRA «SEVERA» SIN DEFINIRLA. En su tabla de la estenosis aórtica aparece la expresión «calcificación valvular severa, idealmente evaluada por tomografía», junto con una progresión de la velocidad máxima de 0,3 m/s por año o más. Folio 4670.' },
```

- **(b) Como esta escrito.** Cadenas de JavaScript concatenadas con `+`, con **tildes y
  comillas angulares como caracteres reales**, y `\n` como separador de parrafo. El cajon
  `#vinfo-card` lo pinta con el cuerpo a **11 px**, la regla fija del 04/11.
- **(c) Condicion de pantalla:** se abre con el boton ⓘ del campo `ete_tavi_calc`. No depende
  de ningun dato cargado.
- **(d) El mismo texto en otro lugar:** ninguno. «SEVERA» SIN DEFINIRLA» aparece **una sola
  vez** en todo el archivo.
- **(e) Casos que lo afirman:** ninguno por su literal (0 apariciones de «SIN DEFINIRLA» y de
  «sin definirla» en el archivo de casos).

### Lo que la orden pide reportar: las OTRAS frases del mismo ⓘ que caen bajo las reglas

**No se cambian** —la orden solo aprueba el ultimo parrafo— y van a **P27-a**:

| # | frase, textual | que regla roza |
|---|---|---|
| 1 | «Ninguna de las fuentes de esta biblioteca publica una clasificacion con grados —leve, moderada, severa— de la calcificacion de la valvula aortica, ni por ecocardiografia ni por tomografia.» | **04/11**: escribe lo que las fuentes **no** dicen |
| 2 | «las fuentes no la definen con grados» | **04/11**: lo mismo, en la misma frase de apertura |
| 3 | «UNA DIFERENCIA ENTRE FUENTES, QUE SE MUESTRA Y NO SE RESUELVE, LA MAS NUEVA PRIMERO.» con el corte de la mujer de las dos fuentes | **04/11** (compara dos fuentes entre si) y **08/11** (dice que queda sin resolver) |
| 4 | «PARA EL TAVI, LA GUIA DESCRIBE LA CALCIFICACION EN TERMINOS CUALITATIVOS Y SIN GRADOS.» | **04/11**: dice lo que la guia **no** hace |

---

## T10 a T13 — el reverso diastolico de la aorta descendente

### LA MEDICION QUE DA VUELTA LA PREMISA DE LA ORDEN

La orden los ubica en «la nota del reverso diastolico de la **insuficiencia aortica**» y su
verificacion dice «abrir su **Evidencia**». Hay **DOS** bloques que empiezan con esa frase:

| lugar | linea | que es |
|---|---|---|
| ficha de Referencias **`ref-ia`** | **22492-22505** | un `<div>` de prosa debajo de la tabla de criterios de la insuficiencia aortica, dentro de `<div id="ref-ia">`, que vive en `ref-nativas` de la pestania **Referencias** |
| nota del panel de **Evidencia** | **97302** | un elemento `{ txt:..., refs:['ecosmart'] }` de la seccion de insuficiencia aortica |

**Los cuatro literales de la orden, buscados uno por uno en todo el archivo:**

| literal de la orden | `ref-ia` | nota de Evidencia |
|---|---|---|
| T10 «Tabla 20-5 del libro de texto» | **si** (22500) | **si** (97302) |
| T11 «deja ese valor sin definir» | **si** (22503) | **NO** |
| T12 «Sin la duracion consignada» | **si** (22504, como `Sin la duraci&oacute;n consignada`) | **si** (97302) |
| T13 «brief, protodiastolic flow reversal» | **si** (22497) | **NO** |

**Y tres pruebas mas, todas a favor de `ref-ia`:**

1. La frase que T10 reemplaza —la que «cita la Tabla 20-5 **y dice que no figura en las
   guias**»— existe **solo** en `ref-ia`: `no figura en las gu` da **una sola** aparicion en
   todo el archivo, la linea **22501**. La nota de Evidencia no dice eso.
2. El texto nuevo de T13 pide la cita completa **«Lancellotti y col., Eur Heart J Cardiovasc
   Imaging 2013;14:611-644»**, que existe **solo** en `ref-ia` (linea 22496). La nota de
   Evidencia cita «EACVI 2013 (Tabla 4, folio 621)» a secas.
3. La orden manda dejar **identica** la primera oracion y la escribe **terminada en punto**:
   en `ref-ia` esa oracion termina en punto; en la nota de Evidencia sigue con **dos puntos**
   y no termina ahi. Y la orden pide «respeta el marcado del lugar (negritas, cursivas,
   entidades)», que solo existe en `ref-ia`.

**Conclusion de la medicion:** los cuatro textos que el medico aprobo son los de la ficha
`ref-ia`. **Se aplican ahi.** La nota de Evidencia de la linea 97302 **no se toca** y queda
declarada en **P27-a**, con el aviso de que a partir de esta tanda las dos superficies dicen
de dos formas distintas de donde sale el VTI de 15 cm y que pasa sin la duracion.

### Texto completo actual del bloque de `ref-ia`, sin recortar

```html
               edicion, el anio y la pagina del libro los completa el medico: no se inventan. -->
          <div style="margin-top:8px;font-size:11px;color:var(--text2);line-height:1.6;">
            El <b>reverso diast&oacute;lico de la aorta descendente</b> se grad&uacute;a por su <b>duraci&oacute;n</b>, y el VTI
            y la velocidad telediast&oacute;lica la califican. La estructura de los tres grados es la de la
            <b>EACVI 2013</b> (Lancellotti P y col., <i>Eur Heart J Cardiovasc Imaging</i> 2013;14:611-644,
            <b>Tabla 4, folio 621</b>), que escribe <i>&laquo;brief, protodiastolic flow reversal&raquo;</i> en leve,
            <i>&laquo;intermediate&raquo;</i> en moderada y <i>&laquo;holodiastolic flow reversal (end-diastolic velocity
            &gt;20 cm/s)&raquo;</i> en grave &mdash; y que a su vez lo cita de Tribouilloy, <i>Br Heart J</i> 1991;65:37-40.
            El <b>corte de 15 cm del VTI</b> sale de la <b>Tabla 20-5 del libro de texto</b> &laquo;Ecocardiograf&iacute;a
            avanzada&raquo; (Moya Mur, cap&iacute;tulo 20): <b>libro de texto; no figura en las gu&iacute;as de la biblioteca</b>.
            Con <b>15 cm exactos</b> la aplicaci&oacute;n se queda en <b>moderada</b>, que es el lado que no afirma
            la gravedad: la tabla escribe &laquo;&lt;15&raquo; y &laquo;&gt;15&raquo; y deja ese valor sin definir.
            <b>Sin la duraci&oacute;n consignada</b>, el VTI y la velocidad se muestran y <b>no grad&uacute;an</b>.
          </div>
```

- **(b) Como esta escrito.** HTML con **entidades** (`&oacute;`, `&laquo;`, `&raquo;`,
  `&aacute;`, `&iacute;`, `&gt;`, `&le;`, `&mdash;`) y con **negritas** `<b>` y **cursivas**
  `<i>`. Es marcado estatico del documento: el navegador resuelve la entidad, asi que en
  pantalla se lee con **tilde y comilla angular**.
- **(c) Condicion de pantalla:** pestania **Referencias**, subpestania **Valvulas nativas**,
  ficha **«Insuficiencia aortica»** desplegada. La ficha nace **cerrada** y hay que abrirla;
  `evRefPintar` solo pinta al abrir su subpestania. No depende de ningun dato del paciente.
- **(d) El mismo texto en otro lugar:** la **nota de Evidencia** de la linea **97302**, que
  comparte el contenido de T10 y T12 (con otras palabras en T10) y **no** el de T11 ni el de
  T13. **No se toca.** «Tribouilloy» aparece ademas en la linea **22303** (otra ficha de
  Referencias) y en comentarios de las lineas 8381-8398 y 168362.
- **(e) Casos que lo afirman:**
  - **TC-516**, condicion **(h1)** «la ficha de la IAo trae las DOS fuentes del reverso y el
    rotulo del libro»: exige que el `textContent` de `#ref-ia` contenga `EACVI 2013`,
    `folio 621`, `Moya Mur`, `Tabla 20-5` **y** `no figura en las guias de la biblioteca`.
    **Es el caso que esta tanda rompe, y lo rompe por el literal exacto que cambia.**
  - **TC-349** afirma la **nota de Evidencia** (no `ref-ia`): su condicion de la linea 51230
    exige `obj.txt.indexOf('Tabla 20-5') > -1 && obj.txt.indexOf('15 cm') > -1`. Como esa
    nota **no se toca**, el caso **no se adapta**.

---

## T14 — el trombo protesico grande de 10 mm

**La seccion 3.c (ii) de `docs/AUDITORIA_PROTESIS.md` ya lo midio, y se verifico de nuevo.**
Hay **cuatro** apariciones; **tres** son visibles y **una** es dato muerto.

| # | ubicacion | linea | visible | especifico de MECANICA |
|---|---|---|---|---|
| 1 | `PROTM_REC_2025.tromb_emb` (registro mitral) | **95520** | **NO**: la clave `tromb_emb` **no tiene consumidor** en el archivo | — |
| 2 | nota del ramal `tipo === 'mec'` de la seccion **mitral** | **95619** | si | **SI**: cuelga de `if (tipo === 'mec')`, linea **95616** |
| 3 | pregunta `prota.trombGrande` (seccion **aortica**) | **95752-95754** | si | **NO**: la entrada no esta acotada por tipo de protesis |
| 4 | pregunta `prott.trombGrande` (seccion **tricuspide**) | **96089-96091** | si | **NO**: idem |

**Texto completo actual de la nota mitral mecanica (linea 95619):**

```javascript
    if (tipo === 'mec') {
      o.mod = { tit:'También aplica', txt:PROTM_REC_2025.tromb_mec.t, clase:PROTM_REC_2025.tromb_mec.c,
        fuente:PROTM_FUENTE_ESC, ref:PROTM_REF_ESC,
        nota:'Y la cirugía es a considerar (Clase IIa · Nivel C) ante un trombo grande, de 10 mm o más, complicado con embolia: el tamaño del trombo grande lo imprime así su Figura 20 (hoja 65, folio 4699). El tamaño del trombo y la clase funcional no se registran en esta aplicación.' };
    } else if (tipo === 'bio') {
```

**Texto completo actual de las dos preguntas:**

```javascript
  { clave:'prota.trombGrande', lbl:'Trombo protésico grande, de 10 mm o más, complicado con embolia', guia:'vhd25',
    rec:'Clase IIa · Nivel C — la cirugía debe considerarse ante un trombo protésico grande, de 10 mm o más, complicado con embolia, hoja 66, folio 4700',
    nota:'su Figura 20 (hoja 65, folio 4699) imprime el tamaño del trombo grande como «10 mm o más»' },

  { clave:'prott.trombGrande', lbl:'Trombo protésico grande, de 10 mm o más, complicado con embolia', guia:'vhd25',
    rec:'Clase IIa · Nivel C — la cirugía debe considerarse ante un trombo protésico grande, de 10 mm o más, complicado con embolia, hoja 66, folio 4700',
    nota:'su Figura 20 (hoja 65, folio 4699) imprime el tamaño del trombo grande como «10 mm o más»' },
```

- **(b) Como estan escritas.** Cadenas de JavaScript con **tildes y comillas angulares reales**.
  La nota de la seccion mitral se pinta en la tarjeta del modificador; las dos preguntas pasan
  por `_indPregNota`, que une las partes con `'. '`.
- **(c) Condicion de pantalla:** (2) protesis **mitral** con **tipo mecanico** y disfuncion
  atribuida a trombosis (`tromb === 'si'`); (3) y (4) protesis aortica / tricuspide cargada,
  con la seccion de Evidencia correspondiente abierta.
- **(d) El mismo texto en otro lugar:** las cuatro de arriba son todas; «trombo protesico
  grande» da **tres** apariciones (95520, 95753, 96090) y la cuarta usa «trombo grande».
- **(e) Casos que lo afirman:** **TC-759**, bloque **(B)**. Recorre `PROTA_PREG`, `PROTT_PREG`,
  `PROTP_PREG` y `PROTM_REC_2025` buscando cadenas con «10 mm» y exige **(B0)** que haya
  exactamente **SIETE**, **(B2)** que las siete digan «10 mm o mas», **(B3)** que ninguna
  compare las dos partes del documento y **(B4)** las dos citas. La oracion que el commit 4
  agrega **no contiene «10 mm»** —la orden lo prohibe expresamente— y va en la nota de la
  linea 95619, que **no esta en ninguno de los cuatro registros que TC-759 recorre**: el
  conteo de siete **no se mueve**.

---

## (e) La base de los casos afectados, corrida ANTES de tocar nada

Corrida sobre el arbol de HEAD (`ddcf42d`), md5 **f2587ad8**:

```
node scripts/test_clinico.mjs --solo TC-324,TC-329,TC-328,TC-327,TC-326,TC-325,TC-322
  RESULTADO: 7/7 — sin regresiones

node scripts/test_clinico.mjs --solo TC-349,TC-516,TC-759
  los tres en verde
```

⚠️ **TC-328 EN AISLAMIENTO DA ROJO, Y NO ES UN ROJO.** Corrido solo, su denominador sale
**vacio** —`EM=false`, `notas=0`, `trombo=false`— porque la escena de la estenosis mitral la
siembran los casos que lo preceden en el archivo (**TC-324** y **TC-329**). Con sus vecinos en
el orden del archivo pasa. Es el modo de falla que `CLAUDE.md` llama «denominador vacio no es
cero»: **hay que correrlo con su lote**, no solo.

Los rojos conocidos de la suite siguen siendo **TC-223, TC-376, TC-390 y TC-406**, mas los dos
intermitentes declarados **TC-551** y **TC-557**. Ninguno de los cinco casos de este inventario
esta en esa lista.

---

## Casos a adaptar en el commit 5, con el motivo

| caso | condicion | motivo |
|---|---|---|
| **TC-328** | (2) y (3) | afirman **T7** por su literal exacto: `Las dos excepciones de esa tabla`, `el trombo en la OREJUELA` y `1-3 meses`. La frase nueva del medico dice «Excepciones de la Tabla 8 (folio 4682)», «con trombo en la orejuela» y «de 1 a 3 meses»: los tres literales cambian. Se adapta a los literales nuevos **y** se le agrega que los viejos ya no estan |
| **TC-516** | (h1) | afirma **T10** por su literal exacto: `no figura en las guias de la biblioteca`. La frase nueva lo retira. Se adapta a la frase nueva **y** a la ausencia de la vieja |

**No se adaptan:** TC-349 (afirma la nota de Evidencia, que no se toca), TC-759 (su conteo de
siete no se mueve), TC-322 (recorre `IND_SECS` y esta tanda no agrega ni quita secciones) y
TC-327 (afirma la nota hermana de etiologia reumatica, que no se toca).
