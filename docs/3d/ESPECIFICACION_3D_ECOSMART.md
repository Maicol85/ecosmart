# EcoSmart — Los tres diagramas 3D aprobados

Documento de referencia escrito el 03/10/2026. Sirve para que cualquier sesión (otro chat de Claude o Claude Code) entienda qué queremos, dónde va, de dónde saca los datos y cómo debe comportarse, sin tener que releer las transcripciones.

**Estado:** diseño aprobado por Maicol. Todavía NO implementado en EcoSmart. Se hace después de terminar las válvulas (botones E1–E7 y resto de la aórtica).

**Las demos de esta carpeta son la referencia.** Abrirlas con doble clic en el navegador. Muestran el comportamiento y el aspecto aprobados. NO son el código final: hay que reescribirlas dentro de EcoSmart con los datos reales.

| Archivo | Qué es |
|---|---|
| `1_demo_ventriculo_17_segmentos.html` | VI 3D con los 17 segmentos |
| `2_demo_mitral_insuficiencia_estenosis.html` | Mitral 3D con insuficiencia y estenosis |
| `3_demo_wilkins_version1.html` | Mitral 3D con los cuatro componentes de Wilkins (versión 1, la aprobada) |

Las tres comparten el mismo estilo de motor: un dibujo en canvas (sin librerías externas), que se puede girar con el dedo o el mouse, con un botón Pausar y un selector de Fase del ciclo (por ejemplo «Fin de diástole»). Esa base común se construye una sola vez, con el primer 3D, y los otros dos la reutilizan.

---

## Reglas comunes a los tres

1. **Es un modelo esquemático, no una imagen del paciente.** Debe decirlo en pantalla. Nunca se presenta como medición ni como reconstrucción real.
2. **Los datos salen de lo que el médico ya cargó** en la app. No se pide cargar nada dos veces.
3. **Si faltan datos, no se inventa nada:** el panel dice cuáles hay que cargar.
4. **Se abre a pedido** (un botón), no está siempre encendido. Al cerrar el panel el motor de dibujo se apaga (no debe consumir batería ni CPU).
5. **Sincronía en los dos sentidos** donde hay un control equivalente (ver cada caso): tocar el 3D cambia el campo, y cambiar el campo cambia el 3D.
6. **Nada de esto escribe en el informe** por sí solo. Lo que se tocó en el 3D solo cuenta si queda cargado en el campo real que ya usa el informe.
7. Uso en celular: el dibujo se adapta al ancho, y los controles se pueden usar con el dedo.
8. Seguridad y estilo de código: según el CLAUDE.md del proyecto (por ejemplo, sin acentos graves dentro de template literals).

---

## 1. Ventrículo izquierdo 3D

**Dónde:** pestaña **Contractilidad**, dentro de la tarjeta «Hallazgos de motilidad».
**Cómo se abre:** botón **«Ver en 3D»** en el centro de la tarjeta. El texto de hallazgos queda a la izquierda y el diagrama a la derecha.

**Datos que toma de AI/VI:** volumen de fin de diástole (VDF), volumen de fin de sístole (VSF), fracción de eyección (FEVI) y diámetro diastólico final.
- Si hay VDF y VSF, la FEVI se calcula sola.
- Si hay VDF y FEVI, el VSF se calcula.
- Con el diámetro diastólico el modelo ajusta su tamaño (la demo tiene «VI de tamaño normal» y «VI dilatado» como ejemplos).

**Qué muestra**
- Los 17 segmentos coloreados por **motilidad**, con los mismos colores y estados del bull's eye: Normal, Hipoquinesia, Aquinesia, Disquinesia, Aneurisma.
- Botón para colorear en cambio por **territorio coronario** (DA, CD, CX).
- Vista desde la punta hacia el observador, punta a la derecha o punta a la izquierda.
- Cuerdas tendinosas y músculos papilares, como en las demos.
- Diástole «fantasma» opcional, para comparar con la sístole.
- **Sin ventrículo derecho** (se probó una versión con VD y se descartó).
- Tabla chica debajo con VDF, VSF y FEVI (y volumen de la fase que se está mirando).

**Sincronía:** con el bull's eye de 17 segmentos, en los dos sentidos. Tocar un segmento en el 3D cambia su estado en el bull's eye, y al revés.

---

## 2. Válvula mitral 3D

**Dónde:** pestaña **ETE, sección válvula mitral**, al lado del diagrama de las cuatro vistas y de la vista quirúrgica. Los tres dibujos van **coordinados**: lo que se marca en uno aparece en los otros.

**Datos que toma de los cajones de IM y de EM:** EROA, anillo, vena contracta, área valvular mitral (AVm), tamaño de la aurícula izquierda, y las lesiones por segmento.

**Qué muestra**
- Segmentos **A1, A2, A3 y P1, P2, P3**, cada uno con su lesión: Normal, Prolapso, Flail, Restricción, Perforación, Calcificación. Se toca un segmento para cambiar la lesión.
- **Insuficiencia:** el chorro regurgitante crece en proporción a la EROA; el cuello del chorro tiene el ancho de la vena contracta; la aurícula izquierda se dilata a medida que aumenta la severidad.
- **Estenosis:** el orificio diastólico se achica según el AVm, con valvas engrosadas y «doming».
- **Orientación por defecto:** vista del cirujano (aorta arriba, orejuela a la izquierda junto a A1/P1, comisura anterolateral a la izquierda). Desde ahí se puede girar libremente. Hay también «Desde el ventrículo» y «Corte lateral».
- Capas que se pueden prender y apagar: Etiquetas, Chorro, Aurícula.
- Fase del ciclo seleccionable (por ejemplo «Sístole: válvula cerrada»).

**Aviso pendiente de corregir antes de conectar:** las etiquetas de comisuras en la pestaña ETE están invertidas (AL y PM). Se corrige primero, en un prompt corto aparte.

---

## 3. Wilkins 3D

**Dónde:** pestaña **ETE, score de Wilkins**.

**Controles (de 1 a 4 cada uno):** movilidad, engrosamiento, calcificación, aparato subvalvular. El total se suma (máximo 16). Atajos de la demo: Wilkins 6, 10 y 14 y «Válvula normal».

**Qué cambia en el dibujo**
- **Movilidad:** apertura de las valvas y «doming».
- **Engrosamiento:** grosor y color de las valvas.
- **Calcificación:** parches verdes.
- **Subvalvular:** cuerdas más gruesas y acortadas.
- **AVm:** tamaño del orificio.
- Etiquetas y flujo se pueden prender y apagar.

**Qué versión sirve:** la **versión 1** (`3_demo_wilkins_version1.html`). Una segunda versión con las cuerdas más separadas no le gustó a Maicol: **no se usa**. Si se retoca, partir de la versión 1.

**Prerrequisito obligatorio:** hoy existen **dos calculadoras de Wilkins** en la app. Hay que unificarlas en una sola antes de conectarle el 3D, para que el dibujo y el informe lean el mismo valor. Se hace con un prompt de lectura primero (ver cómo están cargadas), después la unificación, y recién después el 3D.

---

## Orden recomendado y estimación

Cada uno empieza con un prompt corto de **solo lectura**, para ver cómo guarda hoy la app esos datos.

1. VI 3D (el más largo, porque construye el motor que reutilizan los otros).
2. Comisuras de la mitral (corrección chica).
3. Mitral 3D.
4. Unificar Wilkins.
5. Wilkins 3D.

Estimación de Claude (no medida, puede variar mucho): entre 10 y 18 horas de Code en unos 10 prompts. Maicol espera que sea menos.

---

## Idea futura, aparte de estos tres

En la pestaña **Imágenes**, un 3D del VI más real, construido a partir del movimiento del endocardio. Necesitaría las vistas A4C, A2C y A3C para los seis sectores de los niveles basal y medio. **Condición previa:** verificar si el visor de imágenes guarda los puntos del contorno trazado. Si no los guarda, hay que agregarlo antes.

---

## Cómo darle esto a otra sesión

- **Otro chat de Claude:** adjuntar esta carpeta (el documento y las tres demos) y decir «leé el documento y abrí las demos como referencia».
- **Claude Code:** copiar la carpeta dentro del proyecto, por ejemplo en `docs/3d/`, y en el prompt pedir «leé docs/3d/ESPECIFICACION_3D_ECOSMART.md y usá las demos como referencia de comportamiento».
