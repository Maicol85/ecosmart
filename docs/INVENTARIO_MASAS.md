# Inventario · las masas intracardíacas y dónde podrían vivir

**Tanda PANT-8, commit 7b (2026-11-04). SOLO LECTURA: este documento no cambió una línea de
`index.html`.** Todo lo que sigue está medido en la aplicación.

El pedido es decidir si «Masas» debería ser una sección propia de la pestaña **Otros**, debajo de
«Variantes anatómicas», y qué habría que mover y qué sincronía habría que cuidar.

---

## 1 · Lo que hay — la sección «Pericardio y masas»

Vive en la pestaña **Pericardio y pulmón**. Sus campos se parten en **dos temas** que hoy comparten
sección, y eso es lo primero que hay que ver: **ningún campo de masas comparte prefijo, dueño ni
emisor con los de pericardio**.

### 1a · Los campos de MASAS — prefijo `masa_`, nueve campos

| id | rótulo | tipo | opciones |
|---|---|---|---|
| `masa_presente` | 🫀 Masa intracardíaca — descripción estructurada | select | No se detectan masas · Masa / imagen intracardíaca presente |
| `masa_cavidad` | Cavidad | select | VI · VD · AI · AD · Múltiples |
| `masa_loc` | Localización | select | Pared libre · Septo · Válvula · Tracto de salida · Tracto de entrada · Auricular (orejuela) · Otro |
| `masa_tam_mm` | Tamaño (mm) | número | — |
| `masa_morf` | Morfología | select | Pediculada · Sésil · Irregular · Redondeada |
| `masa_movil` | Movilidad | select | Móvil · Semimóvil · Fija |
| `masa_eco` | Ecogenicidad | select | Hiperecogénica · Hipoecoica · Mixta · Con calcificación |
| `masa_dx` | Diagnóstico diferencial sugerido | select | Trombo · Mixoma · Fibroelastoma · Vegetación · Lipoma · Metástasis · Indeterminado |
| `masa_notas` | Notas adicionales | texto | — |

⚠️ **`masa_presente` NO tiene opción vacía:** su primer valor es «No se detectan masas», así que un
formulario en blanco **afirma** que no hay masas. Es el mismo patrón que `va_morf` con «Trivalva
normal», y hay que tenerlo en cuenta antes de usar ese campo como predicado de «la sección está en
uso»: no distingue «nadie miró» de «se miró y no había».

### 1b · Los campos de PERICARDIO

Son los del derrame pericárdico y el taponamiento, que viven en su propia tarjeta y tienen su
propio emisor y su propia sección de Evidencia. **No comparten un solo campo con los nueve de
arriba.** Separarlos no corta ningún cálculo.

### 1c · Qué emiten al papel

Los nueve `masa_` llegan al **cuerpo del informe** y al **EN SUMA** por el mismo bloque que hoy
publica el pericardio y las masas —el párrafo que el informe imprime justo antes de la ecografía
pulmonar—, y al **Excel** por `LAB_XLS_MAP`. No tienen hoja propia en el PDF ni diapositiva propia
en el PPT: viajan dentro del texto del informe.

## 2 · Dónde vive hoy la pestaña «Otros», y qué lugar tendría «Masas»

La pestaña **Otros** (`#tab-otros`) contiene hoy, en este orden:

1. **🫧 Test de burbuja** — con el foramen oval.
2. **🦴 Variantes anatómicas** — las seis variantes, la circunfleja retroaórtica.

(El perfil hemodinámico, la valoración de HTP y VExUS viven en **Hemodinámica**, no en Otros.)

«Masas» entraría como **tercera sección, debajo de «Variantes anatómicas»**, con la misma forma de
acordeón que las dos de arriba. No hay conflicto de nombres ni de prefijos: `masa_` no se cruza con
`fop_`, `bur_` ni los de variantes.

## 3 · Qué datos del estudio podrían orientar sobre la naturaleza de una masa, SIN agregar campos

Todos estos ya existen y ya se cargan en otras pestañas. **Ninguno exige un campo guardado nuevo.**

| dato | de dónde sale | qué orienta |
|---|---|---|
| válvula afectada | `masa_loc` = «Válvula», más la morfología de la válvula de esa cavidad (`vm_morf`, `va_morf`, `vt_morf`, `vp_morf`) | una masa sobre una válvula nativa o protésica cambia el diferencial |
| prótesis presente | `vmEsProtesis()`, `va_morf`, los campos de prótesis de las cuatro válvulas | una masa sobre una prótesis orienta a trombo o a vegetación |
| endocarditis consignada | la opción «Endocarditis» de las morfologías valvulares | si ya está consignada, «Vegetación» deja de ser una hipótesis suelta |
| orejuela | `oai_trombo` («sí — confirmado» / «sospecha»), `oai_sec` (contraste espontáneo) | una masa en la orejuela con contraste espontáneo orienta a trombo |
| fibrilación auricular | el ritmo que el estudio ya consigna | lo mismo |
| cavidad y función | el tamaño y la función del ventrículo de la cavidad afectada | un trombo apical se asocia a disfunción regional |
| contexto oncológico | los campos de cardio-oncología (`co_farmaco`, el tipo de tumor) | «Metástasis» deja de ser una hipótesis suelta |

**Lo que NO se puede hacer sin decidirlo el médico:** convertir cualquiera de estos en un
**diagnóstico**. Hoy `masa_dx` es un selector del médico; que la aplicación lo escriba sola sería
contenido clínico nuevo, y además chocaría con la regla de que nada automático escribe en el
estudio.

## 4 · Lo que habría que mover, y la sincronía que habría que cuidar

| pieza | qué hay que hacer | riesgo |
|---|---|---|
| el marcado de los nueve campos | moverlo entero a una sección nueva de `#tab-otros` | **ningún id cambia**; el riesgo es el `</div>` de más que PANT-6 y PANT-7 pagaron cuatro veces: hay que extraer el bloque por **balance de etiquetas** y no «hasta el siguiente div» |
| el título de la sección vieja | pasa de «Pericardio y masas» a «Pericardio» | aparece en la pestaña y en los mapas; no en el papel |
| el emisor del informe | **no se toca**: emite por id, no por pestaña | — |
| el Excel | **no se toca**: `LAB_XLS_MAP` va por id | 441 columnas intactas |
| `secAutoOpen` | la sección nueva se abre sola si algún campo tiene valor; **`masa_presente` arranca con valor**, así que abriría siempre | hay que excluirlo del barrido o darle opción vacía, **y darle opción vacía cambia lo que el papel afirma** → decisión del médico |
| el panel de Evidencia | no hay sección de masas; nada que mover | — |
| los casos de prueba | los que cuentan secciones por pestaña y los que abren «Pericardio y masas» por su título | adaptarlos con el motivo escrito |

---

## Decisiones que le tocan al médico

1. **¿«Masas» se muda a Otros, o se queda con el pericardio?** Técnicamente la mudanza no corta
   ningún cálculo: los dos temas no comparten un solo campo.
2. **¿`masa_presente` debería tener opción vacía?** Hoy un formulario en blanco **afirma** que no
   hay masas, y eso llega al informe. Darle opción vacía cambia lo que el papel dice de todo
   estudio en el que nadie tocó el campo.
3. **¿La aplicación debería orientar el diagnóstico diferencial?** Los siete datos de la tabla 3
   están disponibles sin agregar un campo. Si la respuesta es sí, hay que decidir si orienta
   **mostrando** el contexto —«hay una prótesis mitral cargada»— o **sugiriendo** un diagnóstico,
   que es contenido clínico nuevo.
4. **¿La masa debería tener su propia sección de Evidencia?** Hoy no la tiene.
