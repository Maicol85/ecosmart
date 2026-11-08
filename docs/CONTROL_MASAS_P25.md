# Control de lectura — MASAS y FUENTES EMBOLICAS (tanda PANT-25, 2026-11-08)

**SOLO LECTURA.** Este commit no cambia un byte de `index.html` (md5 `b8481a9b`).

Cada fila de abajo se leyo **en imagen**, renderizando la hoja a **220-230 ppp** con PyMuPDF y
mirandola, no extrayendo texto. El texto plano se uso **solo para localizar** en que hoja buscar;
ningun numero de esta tabla sale de ahi.

---

## 0 · LAS CUATRO REGLAS DE FOLIO, COMPROBADAS POR MI

| documento | archivo | regla | comprobada en |
|---|---|---|---|
| **Angeli 2024** · *JACC: CardioOncology* 2024;6:847-862, «Multimodality Imaging in Cardiac Masses» | `21_Otros_hallazgos/Angeli_2024_JACC-CO_Masas_cardiacas.pdf` (16 hojas) | folio = hoja + **846** | cabecera de las hojas **2 → 848**, **3 → 849**, **4 → 850**, **5 → 851**, **6 → 852** y **13 → 859** |
| **Saric 2016** · ASE, *J Am Soc Echocardiogr* 2016;29:1-42 | `21_Otros_hallazgos/Saric_2016_ASE_Fuente_embolica_masas.pdf` (42 hojas) | folio = **hoja** | cabecera de las hojas **3 → 3**, **10 → 10**, **15 → 15**, **16 → 16**, **17 → 17**, **18 → 18** y **27 → 27** |
| **Lyon 2022** · ESC de cardio-oncologia, *Eur Heart J* 2022;43:4229-4361 | `12_Cardio_oncologia/Lyon_2022_Cardio_oncologia.pdf` (133 hojas) | folio = hoja + **4228** | cabecera de las hojas **91 → 4319**, **92 → 4320** y **93 → 4321** |
| **Kleindorfer 2021** · AHA/ASA, *Stroke* 2021;52:e364-e467 | `21_Otros_hallazgos/kleindorfer-et-al-2021-…pdf` | folio = e + hoja + 363 | **NO se leyo**: la ficha `ref-embolig` ya publica sus nueve pasos con los folios **e373** y **e374**, y esta tanda **no toca ese bloque**. La regla queda sin comprobar por mi y por eso **no se escribe ni una cifra nueva** de esta fuente → **P25-a** |

⚠️ **NI SARIC NI LYON IMPRIMEN CLASE NI NIVEL** en lo que esta tanda publica, asi que **no se
escribe ninguna**. Saric usa **su propia** escala de tres niveles —«ecocardiografia recomendada»,
«potencialmente util» y «no recomendada»— que es lo que se cita, con esas palabras. La Tabla 13 de
Lyon **tampoco** lleva clase ni nivel.

---

## 1 · MASAS — bloque (i) CLASIFICACION Y FRECUENCIA

| # | el dato, en mis palabras | numeros | documento | hoja | folio | en imagen | estado |
|---|---|---|---|---|---|---|---|
| 1 | De los tumores cardiacos primarios, son benignos entre tres cuartas partes y nueve de cada diez; el mixoma es el histotipo predominante en el adulto, y los que no son mixoma son mas frecuentes en ninos y adolescentes | 75 a 90 % | Angeli 2024 | 2 | **848** | si | **VERIFICADO** · ya publicado, re-leido |
| 2 | Entre los primarios malignos, los sarcomas son los mas frecuentes, seguidos de linfomas y mesoteliomas | 65 a 88 % · 27 % · 8 % | Angeli 2024 | 2 | **848** | si | **VERIFICADO** · ya publicado, re-leido |
| 3 | La supervivencia de los tumores malignos es baja al ano y mas baja a los cinco | 45,3 % al ano · 11,5 % a los 5 anos | Angeli 2024 | 2 | **848** | si | **VERIFICADO · NUEVO** |
| 4 | Los pseudotumores son masas que no nacen de un proceso neoplasico: trombos, quistes, lipomatosis, nodulos valvulares y excrecencias de Lambl, ademas de las variantes anatomicas; son relativamente frecuentes y a menudo se diagnostican mal | — | Angeli 2024 | 2 | **848** | si | **VERIFICADO · NUEVO** (son las masas no tumorales que pide la decision (5)(i)) |
| 5 | Mas de nueve de cada diez tumores cardiacos primarios son benignos; el mixoma predomina en el adulto y el rabdomioma en el nino | mas del 90 % | Lyon 2022 | 91 | **4319** | si | **VERIFICADO · NUEVO** |
| 6 | Entre los primarios malignos, sarcomas y linfomas | ~65 % · ~25 % | Lyon 2022 | 91 | **4319** | si | **VERIFICADO · NUEVO** |
| 7 | Las metastasis cardiacas —melanoma, linfoma, leucemia, y canceres de mama, pulmon y esofago— son mucho mas frecuentes que los tumores cardiacos primarios | — | Lyon 2022 | 91 | **4319** | si | **VERIFICADO · NUEVO** |
| 8 | Los tumores secundarios son muchas veces mas probables que los primarios | 20 a 30 veces | Lyon 2022 (Figura 40, nota al pie f) | 93 | **4321** | si | **VERIFICADO · NUEVO** |
| 9 | El fibroelastoma papilar es el segundo tumor cardiaco primario mas frecuente en el adulto | — | Saric 2016 | 27 | **27** | si | **VERIFICADO · NUEVO** |

⚠️ **LAS DOS FUENTES DAN CIFRAS DISTINTAS PARA LO MISMO** (filas 1 y 5; 2 y 6). Por la regla del
04/11 **cada una va en su propia fila con su fuente, sin comentario** y sin compararlas.

---

## 2 · MASAS — bloque (ii) CLINICA · todo NUEVO

| # | el dato, en mis palabras | documento | hoja | folio | en imagen | estado |
|---|---|---|---|---|---|---|
| 10 | Los sintomas de presentacion son paraneoplasicos —fiebre, debilidad y fatiga—, tromboembolicos, hemodinamicos por compresion u obstruccion del tumor, o arritmicos | Lyon 2022 | 91 | **4319** | si | **VERIFICADO** |
| 11 | El compromiso de una valvula o la obstruccion del tracto de entrada o de salida, que se ve sobre todo con las masas benignas, puede obligar a una cirugia urgente; y puede haber taponamiento cuando hay derrame, sobre todo con las masas malignas | Angeli 2024 | 4 | **850** | si | **VERIFICADO** |
| 12 | El derrame pericardico moderado o severo acompana con mas frecuencia a las masas malignas; en las benignas, cuando lo hay, suele ser leve | Angeli 2024 | 4 | **850** | si | **VERIFICADO** |

---

## 3 · MASAS — bloque (iii) LOS PUNTAJES · todo NUEVO

**Esto es lo que la ficha declaraba como no leido con certeza.** Leido hoy, en imagen.

| # | el dato, en mis palabras | numeros | documento | hoja | folio | en imagen | estado |
|---|---|---|---|---|---|---|---|
| 13 | Por ecocardiograma, un puntaje de masa de cinco o mas orienta a malignidad | 5 o mas | Angeli 2024 (Figura 1) | 3 | **849** | si | **VERIFICADO** |
| 14 | Ese puntaje alcanza una exactitud diagnostica cercana al noventa por ciento | exactitud ~90 % · area bajo la curva 0,965 (IC 95 % 0,938 a 0,993) · sensibilidad 84 % · especificidad 96 % | Angeli 2024 | 6 | **852** | si | **VERIFICADO** |
| 15 | Por resonancia, un puntaje de masa de cinco o mas orienta a malignidad | 5 o mas | Angeli 2024 (Figura 1) | 3 | **849** | si | **VERIFICADO** |
| 16 | Por PET orientan a malignidad un valor maximo de captacion estandarizada, una glucolisis total de la lesion y un volumen tumoral metabolico por encima de sus cortes | SUVmax 4,9 o mas · TLG 29 o mas · MTV 8,2 o mas | Angeli 2024 (Figura 1) | 3 | **849** | si | **VERIFICADO** |
| 17 | Un margen se considera regular cuando mas de la mitad del borde esta bien delimitado | mas del 50 % | Angeli 2024 | 4 | **850** | si | **VERIFICADO** |
| 18 | Las seis senales de alarma de malignidad en el ecocardiograma: infiltracion, masa polilobulada, derrame pericardico significativo, insercion sesil, heterogeneidad y localizacion que no es izquierda | seis | Angeli 2024 | 5 | **851** | si | **VERIFICADO** · ya publicado, re-leido |

---

## 4 · MASAS — bloque (iv) COMO SE DIFERENCIAN

### 4.1 · La Tabla 1 de Angeli, rendimiento por entidad y modalidad (hoja 4, folio 850) · NUEVO

Escala impresa en la propia tabla: `+++` patron de referencia · `++` aporta informacion adicional
valiosa · `+` rendimiento diagnostico suboptimo · `+/-` habitualmente no indicada · `-` no indicada.

| entidad | ETT/ETE | resonancia | tomografia | PET | biopsia |
|---|---|---|---|---|---|
| Mixoma tipico | +++ | +++ | ++ | +/- | - |
| Mixoma atipico | ++ | +++ | ++ | + | +/- |
| Fibroelastoma | +++ | +/- | + | +/- | - |
| Lipoma | + | +++ | ++ | +/- | - |
| Variantes anatomicas | +++ | +++ | +++ | +/- | - |
| Trombo | ++ | +++ | ++ | +/- | - |
| Quiste | + | +++ | +++ | ++ | - |
| Vegetaciones | +++ | +/- | + | ++ | - |
| Primario maligno | ++ | +++ | ++ | ++ | +++ |
| Metastasis | + | +++ | +++ | +++ | +++ |

Notas al pie, leidas: **mixoma tipico** es una masa de margenes regulares adherida al lado
izquierdo del septo interauricular a la altura de la fosa oval; **mixoma atipico** es cualquier
morfologia o localizacion distinta de esa. **Todo en imagen · VERIFICADO.**

### 4.2 · El resto del bloque

| # | el dato, en mis palabras | documento | hoja | folio | en imagen | estado |
|---|---|---|---|---|---|---|
| 19 | La resonancia es el patron de referencia despues del ecocardiograma; salvo casos concretos, como las lesiones valvulares muy moviles, todo paciente con sospecha de masa cardiaca deberia tener una resonancia completa, que ademas sirve para el seguimiento —vigilar como se resuelve un trombo del ventriculo izquierdo o el control tras la reseccion— | Angeli 2024 | 6 | **852** | si | **VERIFICADO · NUEVO** |
| 20 | La resonancia caracteriza el tejido con una exactitud comparable a la de la histologia, en algunos casos llega al diagnostico —lipoma, melanoma— y, por su resolucion espacial, es superior para detectar infiltracion o invasion de lo vecino, que es lo que decide la planificacion quirurgica | Angeli 2024 | 6 | **852** | si | **VERIFICADO · NUEVO** |
| 21 | Lo que orienta a **benignidad** por modalidad: ecocardiograma, forma regular, pediculada y del lado izquierdo; resonancia, realce homogeneo, sin realce precoz de gadolinio y margenes regulares; tomografia, calcificacion, hipodensa y margenes regulares; PET, captacion del radiotrazador nula o baja | Angeli 2024 (Ilustracion central) | 13 | **859** | si | **VERIFICADO · NUEVO** |
| 22 | Lo que orienta a **malignidad** por modalidad: ecocardiograma, lado derecho, sesil y derrame pericardico; resonancia, infiltracion, realce tardio de gadolinio presente y realce heterogeneo; tomografia, margenes irregulares, isodensa e infiltracion; PET, captacion alta | Angeli 2024 (Ilustracion central) | 13 | **859** | si | **VERIFICADO · NUEVO** |
| 23 | El papel de cada tecnica: el ecocardiograma da localizacion, tamano y repercusion hemodinamica, y con contraste valora la vascularizacion; la tomografia identifica la neoplasia extracardiaca primaria, muestra cambios extracardiacos y estadifica; la resonancia caracteriza el tejido —infiltracion grasa, necrosis, hemorragia, calcificacion y vascularizacion— y excluye trombo; el PET separa lo maligno de lo benigno y estadifica | Lyon 2022 (Figura 40) | 93 | **4321** | si | **VERIFICADO · NUEVO** |
| 24 | Se considera la biopsia de la masa si se sospecha un tumor primario maligno o si la imagen no permite decidir | Lyon 2022 (Figura 40) | 93 | **4321** | si | **VERIFICADO · NUEVO** |
| 25 | La ASE dice, con su propia escala de tres niveles y **sin clase ni nivel**: *recomendada*, un transtoracico completo en todo paciente con sospecha de tumor cardiaco, el transesofagico puede ser superior sobre todo para mixoma y fibroelastoma, y vigilancia tras extirpar un tumor con alto potencial de recidiva como el mixoma; *potencialmente util*, el contraste con microburbujas para separar un tumor vascularizado de una masa avascular como una vegetacion o un trombo, y el 3D para mejorar la exactitud; *no recomendada*, cuando el resultado no va a guiar una decision terapeutica | Saric 2016 | 27 | **27** | si | **VERIFICADO · NUEVO** |
| 26 | El transesofagico es el patron de referencia para lo menor de 1 cm y muy movil, porque resuelve mejor en el tiempo que la resonancia; el contraste de microburbujas separa lo vascularizado de lo que no lo esta | Angeli 2024 | 5 | **851** | si | **VERIFICADO** · ya publicado, re-leido |

---

## 5 · MASAS — bloque (v) CONDUCTA · todo NUEVO · sin clase ni nivel

| # | el dato, en mis palabras | documento | hoja | folio | en imagen | estado |
|---|---|---|---|---|---|---|
| 27 | Antes de decidir, se valora el riesgo de embolia de la masa, su repercusion hemodinamica y la situacion clinica del paciente | Angeli 2024 (Ilustracion central) | 13 | **859** | si | **VERIFICADO** |
| 28 | Con alta sospecha de masa **benigna**: considerar anticoagulacion cuando este clinicamente indicado, extirpacion quirurgica de la masa, y seguimiento | Angeli 2024 (Ilustracion central) | 13 | **859** | si | **VERIFICADO** |
| 29 | Con alta sospecha de masa **maligna**: quimioterapia neoadyuvante, cirugia y quimioterapia adyuvante | Angeli 2024 (Ilustracion central) | 13 | **859** | si | **VERIFICADO** |
| 30 | El mixoma se trata con cirugia y tiene buen pronostico. Los malignos tienen mal pronostico y falta evidencia del mejor tratamiento: la reseccion completa suele ser imposible y hacen falta radioterapia adyuvante, quimioterapia sistemica o cirugia paliativa de reduccion. El linfoma B agresivo requiere diagnostico histopatologico —a menudo por el derrame pericardico, biopsia endomiocardica o biopsia quirurgica directa— y se trata con quimioterapia, posiblemente seguida de radioterapia | Lyon 2022 | 91 | **4319** | si | **VERIFICADO** |

### La Tabla 13 de Lyon (hoja 93, folio 4321), reescrita · **sin clase ni nivel impresos**

| situacion | estrategia de manejo | indicacion de cirugia |
|---|---|---|
| **Benigno · asintomatico** | Discusion en equipo multidisciplinario considerando tipo de tumor, localizacion, tamano, velocidad de crecimiento y probabilidad de embolia. Se considera la anticoagulacion en los tumores izquierdos, o en los derechos con un cortocircuito intracardiaco, segun el riesgo embolico y hemorragico de cada paciente | Si es izquierdo y endocardico, aunque sea pequeno e incidental, hace falta el equipo multidisciplinario para valorar la extirpacion por el riesgo embolico |
| **Benigno · sintomatico** | Manejo no quirurgico en el rabdomioma (puede regresar solo), en el hemangioma intramural (puede responder a corticoides) y en los casos no resecables si alcanza con el antiarritmico | Reseccion quirurgica en todos los demas casos. En tumores benignos grandes, no resecables y sintomaticos —obstruccion, insuficiencia cardiaca severa o arritmias malignas— el trasplante cardiaco puede estar indicado en algunos casos |
| **Maligno · asintomatico** | Se necesita diagnostico histopatologico | Si es un sarcoma cardiaco primario, la reseccion quirurgica completa puede aumentar la supervivencia |
| **Maligno · sintomatico** | La quimioterapia, la radioterapia o las dos son las unicas opciones para los tumores cardiacos secundarios. Si es un linfoma cardiaco primario, quimioterapia | Los tumores cardiacos secundarios tambien pueden tratarse con cirugia cardiaca paliativa |

**Todo en imagen · VERIFICADO.**

---

## 6 · FUENTES EMBOLICAS — LAS SENSIBILIDADES · todo NUEVO

| # | que se busca | transtoracico | transesofagico | documento | hoja | folio | en imagen |
|---|---|---|---|---|---|---|---|
| 31 | Trombo del ventriculo izquierdo | sensibilidad **95 %**, especificidad **85 a 90 %** | — | Saric 2016 | 15 | **15** | si |
| 32 | Vegetacion | especificidad **mayor del 90 %**, sensibilidad **62 a 79 %**; se le pueden escapar las vegetaciones **menores de 2 a 3 mm** | sensibilidad y especificidad **mayores del 90 %** | Saric 2016 | 16 | **16** | si |
| 33 | Endocarditis sobre protesis mitral o aortica | sensibilidad **20 a 40 %** | **mas del 80 a 90 %** | Saric 2016 | 16 | **16** | si |
| 34 | Absceso | sensibilidad **28 %**, especificidad **98 %** | sensibilidad **87 %**, especificidad **95 %** | Saric 2016 | 17 | **17** | si |
| 35 | Perforacion de un velo o una cuspide nativos | sensibilidad **45 %**, especificidad **98 %** | sensibilidad **95 %**, especificidad **98 %** | Saric 2016 | 17 | **17** | si |
| 36 | Fibroelastoma papilar | sensibilidad **62 %** | sensibilidad **77 %** | Saric 2016 | 27 | **27** | si |

**Las seis VERIFICADAS.**

---

## 7 · FUENTES EMBOLICAS — PREDICTORES DE EMBOLIA EN LA ENDOCARDITIS · todo NUEVO

| # | el dato, en mis palabras | numeros | documento | hoja | folio | en imagen |
|---|---|---|---|---|---|---|
| 37 | La incidencia de embolia sistemica en la endocarditis es muy variable, y la fuente lo atribuye a lo heterogenea que es la enfermedad | 13 a 49 % | Saric 2016 | 18 | **18** | si |
| 38 | La embolia sistemica, y con ella el ictus, se ve sobre todo en la endocarditis **izquierda**; la derecha puede dar ictus si hay foramen oval permeable o un cortocircuito interauricular | — | Saric 2016 | 18 | **18** | si |
| 39 | En estudios por resonancia, solo una minoria tiene signos o sintomas de embolia cerebral, mientras que una proporcion mayor tiene embolia cerebral **asintomatica** u otras lesiones cerebrales relacionadas | ~20 a 30 % · ~30 a 50 % | Saric 2016 | 18 | **18** | si |
| 40 | El riesgo embolico mas alto esta **antes** de que se haga el diagnostico; en las dos primeras semanas de antibiotico sigue siendo significativo y despues cae bruscamente | 2 semanas | Saric 2016 | 18 | **18** | si |
| 41 | La sola presencia de una vegetacion es un factor de riesgo de embolia, y dos estudios prospectivos grandes apoyan que el **tamano** predice la embolia | — | Saric 2016 | 18 | **18** | si |
| 42 | Con sospecha clinica intermedia o alta, un transtoracico negativo se sigue **siempre** de un transesofagico; y repetirlo a la semana es razonable si la sospecha sigue alta pese a un primer transesofagico negativo | ~7 dias | Saric 2016 | 17 | **17** | si |

**Las seis VERIFICADAS.** Y **no repiten** el globo `masa-ref-ei` de la pestana Otros, que publica
los germenes por contexto, las indicaciones quirurgicas con su plazo y el corte de tamano guia por
guia: eso es de la ESC 2023, la ACC/AHA 2020 y la ASE 2016, y lo de aca es la **incidencia**, el
**momento** y la fraccion **asintomatica**.

---

## 8 · FUENTES EMBOLICAS — DATOS GENERALES Y TROMBO DEL VENTRICULO IZQUIERDO · todo NUEVO

| # | el dato, en mis palabras | numeros | documento | hoja | folio | en imagen |
|---|---|---|---|---|---|---|
| 43 | La embolia de origen cardiaco explica una parte de los ictus isquemicos, y las causas indeterminadas o criptogenicas otra | 15 a 40 % · 30 a 40 % | Saric 2016 | 3 | **3** | si |
| 44 | La prevalencia de fibrilacion auricular en la poblacion general es baja y sube mucho a partir de los ochenta anos | 0,4 a 1 % · 9 % a los 80 anos o mas | Saric 2016 | 10 | **10** | si |
| 45 | El riesgo de ictus o embolia en la fibrilacion auricular va de bajo a alto segun el perfil | 1 % al ano a 15 % | Saric 2016 | 10 | **10** | si |
| 46 | En la mayor parte de los episodios cardioembolicos el embolo nace de la **orejuela izquierda** | ~75 % | Saric 2016 | 10 | **10** | si |
| 47 | Los trombos del ventriculo izquierdo moviles o que protruyen embolizan mas, pero una parte importante de los eventos ocurre con trombos que **no** protruyen ni son moviles | 40 % | Saric 2016 | 15 | **15** | si |
| 48 | La embolia es menos frecuente con el trombo **mural** y mas con el **movil** | — | Saric 2016 | 15 | **15** | si |
| 49 | En los primeros meses tras un infarto agudo, una parte de los trombos cambia de forma y otra de movilidad | 41 % · 29 % | Saric 2016 | 15 | **15** | si |
| 50 | El infarto de cara anterior se asocia con mas frecuencia a trombo del ventriculo izquierdo que otras regiones, y la frecuencia sube con fraccion de eyeccion por debajo del 40 % mas infarto anterior | 11,5 % contra 2,3 % · 17,8 % | Saric 2016 | 15 | **15** | si |
| 51 | En la miocardiopatia dilatada los eventos tromboembolicos tienen un rango amplio | 1,7 a 18 % | Saric 2016 | 15 | **15** | si |

**Las nueve VERIFICADAS.**

---

## 9 · ⚠️ LO QUE **NO** SE PUBLICA, Y POR QUE

| que | motivo | a donde va |
|---|---|---|
| **La intensidad en T1 del mixoma** | La **Tabla 2** (hoja 5, folio 851) lo da **isointenso**, y la **Figura 2** (hoja 6, folio 852) describe en un caso de mixoma auricular un **tiempo de relajacion T1 reducido**, de unos 830 ms. Son **dos hojas del mismo documento describiendo distinto el mismo rasgo**, que es el caso exacto que la decision (7) nombra | **P25-a** |
| «La embolia cardiaca explica **aproximadamente un tercio** de los ictus isquemicos» | Saric 2016 da **dos cifras para el mismo dato**: esa, en la INTRODUCCION (hoja 3, folio 3), y **15 a 40 %** en el apartado especifico «Clasificacion del ictus» de la misma hoja. Por la decision (7) se publica la del apartado especifico | **P25-a** |
| **La clasificacion de la OMS** | **No esta en la biblioteca**: la fila que hoy existe en `ref-tumores` tiene la celda de Fuente en «—». Por la regla del 08/11, lo que no tiene fuente leida **no se muestra**: la fila se retira | **P25-a** |
| El **tamano del trombo** como predictor de embolia | Saric lo publica como **controvertido** (hoja 15, folio 15). Se publica **con esa palabra** o no se publica; se opta por **no publicarlo**, para no dejar un predictor sin su reserva | **P25-a** |
| Cualquier cifra de **Kleindorfer 2021** | No se leyo ninguna hoja de ese documento en esta tanda, asi que su regla de folio **no esta comprobada por mi**. El bloque que ya existe en `ref-embolig` **no se toca** | **P25-a** |
| La **Figura 39** de Lyon (localizacion de cada tumor por camara) | Es una figura, y la orden prohibe copiarla; reescribirla entera seria contenido nuevo que ninguna de las dos decisiones pide, porque la localizacion ya es una columna de la tabla de la pestana Otros y una celda de la Tabla 2 | **P25-a** |

---

## 10 · RECUENTO

- **Cincuenta y un datos**, mas la Tabla 1 de rendimiento (10 filas × 5 columnas) y la Tabla 13 de
  conducta (4 filas × 3 columnas): **todos leidos en imagen y todos VERIFICADOS**.
- **Cuarenta y cinco son NUEVOS** y seis son **re-lecturas** de lo que la ficha ya publica.
- **Seis cosas NO se publican**, cada una con su motivo, y van a **P25-a**.
- **Trece hojas leidas en imagen**: Angeli 2, 3, 4, 5, 6 y 13; Saric 3, 10, 15, 16, 17, 18 y 27;
  Lyon 91, 92 y 93. **Las cuatro reglas de folio** —tres comprobadas, una declarada sin comprobar.
- **Ninguna clase y ningun nivel** se escriben, porque ninguna de las tres fuentes leidas los
  imprime en lo que esta tanda publica.
