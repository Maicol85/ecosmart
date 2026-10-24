# Fichas de casos — TC-532 (tanda J, 2026-10-24)

> Las fichas anteriores viven en `tests-fichas.md` (TC-499 en adelante),
> `tests-fichas-496-498.md`, `tests-fichas-491-495.md` y `tests-fichas-481-490.md`.
> Ésta nace en archivo propio porque `tests-fichas.md` está en **34,2 KB**, a 800 bytes del
> techo de 35 KB. Medido con `wc -c` **antes** de escribir.

---

## TC-532 · Tanda J — pericardio y taponamiento, constricción y VEXUS

**Qué cubre**, por bloque:

| Bloque | Qué afirma |
|---|---|
| **A** | el rótulo y la frase del colapso de AD dicen **diastólico** y nunca «sistólico»; la duración en **0,33 / 0,34 / 0,35** con el corte estricto; la plétora de VCI en **19 / 20 / 21 / 22 mm**; los colapsos de AI y VI descritos y con su chip; y que ninguna superficie concluye taponamiento |
| **B** | la Evidencia de derrame: cita, bloque vacío sin contestar, y las **tres** filas de la Recommendation Table 12 con su clase, su nivel y su folio al contestar |
| **C** | la constricción **sin** el aviso invasivo en pantalla, informe y PDF; el cociente hepático en **0,77 / 0,78 / 0,79** sin mover el conteo; los tres tramos del e′ medial intactos; y el chip sobre e′ lateral, E/e′ y reglas de conteo |
| **D** | la Evidencia de constricción, con el cateterismo Clase IIa · Nivel C por las **dos** respuestas |
| **E** | VEXUS con la VCI en **19 / 20 / 21 mm** por cada juego de vasos, y cero frases de conducta fuera de Evidencia |
| **F** | la Evidencia de VEXUS: los números del artículo, **sin** clase ni nivel, y las tres conductas con chip |
| **G** | las fichas de Referencias de pericardio y de constricción, con su fuente y su folio |
| **H** | los bloques integrados al ETT avanzado se actualizan solos y el aviso de edición manual no se pisa |
| **I** | guardar, «Nuevo estudio» y reabrir con los dos campos nuevos |
| **J** | los CONTROLES: Excel en **440 columnas** sin claves nuevas, los grados del derrame, FOP/TEP/HTP en pie, el informe vacío mudo y el panel sin despertar ninguna de las tres secciones |

**Los tres DENOMINADORES declarados**, porque sin ellos el caso cuenta cero y parece sano:
- **(A0)** el módulo existe y tiene el campo de la duración;
- **(C9)** la escena cae **de verdad** en la rama `mixto` —la escena «zona mixta del e′ medial» es
  otra cosa y cae en `no_concluyente`, así que sin ésta el caso no toca la rama que la tanda cambió—;
- **(E5)** el informe **sí** trae la línea de VEXUS, así que buscar conductas ahí cuenta;
- **(H1)** el bloque integrado existe y tiene texto.

**Los cuatro CONTROLES NEGATIVOS**, que son los que prueban que la sonda distingue escenarios:
- **(A7)** el `vciD > 21` de `_htp2022Core` **sigue en 21** y no se movió con el del pericardio;
- **(C7)** los tres tramos del e′ medial dan `c` / `m` / `r` en 9, 7 y 5 cm/s;
- **(D7)** con la imagen multimodal **concluyente** la Evidencia dice que el cateterismo no
  corresponde y **no** emite el Clase IIa;
- **(E7)** la asociación con la injuria renal aguda, que **no** es una conducta, se queda.

**Sabe fallar**, por los dos caminos:
- contra el HEAD de la tanda, en un worktree aparte: **61 condiciones en rojo**, ninguna por
  excepción —todas son afirmaciones sobre lo que la tanda cambió, más los campos que ese árbol no
  tiene—;
- por **mutación dirigida**: `scripts/_mut_j.py`, doce mutaciones, una por cambio.

⚠️ **Dos cosas que este caso ya pagó y que están escritas en el código del caso:**
1. `\s` dentro del template literal del cuerpo del caso llega a la página como `s`, así que
   `/\s+/g` borra las **eses** y una búsqueda por prefijo no encuentra «Constricción». Va `/\\s+/g`.
2. El panel de Evidencia hay que **abrirlo** (`indicAbrir`) antes de contestar: `indicRender` no
   engancha el oyente de los botones, y sin él los bloques salen vacíos y el caso lo lee como «no
   emite» — el mismo texto que da una Evidencia sana sin contestar.
3. Las frases se buscan **enteras**: la bibliografía de la sección imprime el texto completo de la
   referencia, que nombra las filas con su clase y su nivel.
