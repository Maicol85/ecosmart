<!-- registro armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Fuentes — lo no verificable, lo pendiente y cómo se agrega una

Complemento de `docs/fuentes/FUENTES.md`, que tiene las fuentes **ya verificadas**. Este archivo
tiene las que **no se pudieron verificar**, las que **faltan** para las válvulas que el panel todavía
no cubre, y el procedimiento para incorporar una. Se abre al **empezar una válvula nueva** o al
evaluar si vale la pena buscar un documento; para citar un dato ya verificado alcanza con `FUENTES.md`.

**En este pase no se abrió ningún PDF.** Nada de acá se puede citar hasta leerlo en texto completo.

---

## Lo que NO se pudo verificar, y por eso NO se cita

- **Hatle 1979** (la constante 220 del THP). *Circulation* 1979;60(5):1096-1104, de suscripción;
  Unpaywall da `is_oa: false`. **La fórmula sí se citó, pero por Baumgartner 2009** (Tabla 8, p. 17;
  constante en la p. 13), que es donde se leyó. Eso cita la práctica actual, no «qué dijo Hatle».
- **Lancellotti EACVI 2013** (*Eur Heart J Cardiovasc Imaging* 2013;14(7):611-644). Europe PMC lo da
  como `isOpenAccess: N` y el PDF del editor está detrás de Cloudflare. **No se citó.** Importa
  porque sería el único documento que especifica que el cociente VTI mitral/VTI TSVI > 1,4 se mide
  por **Doppler pulsado anterógrado**, en las puntas de los velos y con el flujo aórtico en el
  anillo — responde una pregunta abierta desde el 2026-09-29, pero **no se pudo abrir**.
- **ESC/EACTS 2025, Material suplementario Tabla S3** — donde viven la definición de la «puntuación
  ecocardiográfica > 8» y la de Cormier. **No está incluida** en el PDF en disco.
- **Cortes de TC para trombo vs pannus en posición MITRAL** — no se encontró fuente en las tres
  leídas. El corte de 145 UH de la ASE 2024 (su Tabla 9) es **aórtico**, y usarlo en mitral sería
  extrapolación de posición, no una cita.

---

## Pendientes de leer — fuentes que el panel todavía no tiene

El panel de Evidencia cubre hoy **mitral** (IM primaria, IM secundaria, EM nativa, prótesis mitral).
Falta todo lo demás. Lo de abajo es una **lista de títulos candidatos, sin cifras**.

**Válvula aórtica** (próxima etapa según `docs/PENDIENTES.md`)
- ESC/EACTS 2025 (`ehaf194.pdf`) — secciones de EAo e IAo. **Ya está en disco**, misma regla de folio.
- ACC/AHA 2020 (Otto) — EAo e IAo. **Ya está en disco**, misma regla de folio.
- ASE 2017 Zoghbi — tabla de IAo. **Ya está en disco**.
- EAE/ASE 2009 Baumgartner — graduación de la EAo. **Falta el PDF en disco.**
- ASE 2024 Zoghbi prótesis — **Tabla 5, prótesis aórtica quirúrgica** (es lo que ya declara la clave
  `aseProtAo`), Tabla 7 para el PPM aórtico y Tabla 9 para la TC. **Ya está en disco**, y las tres
  son aórticas: es la clave que hoy existe registrada y sin ningún corchete que la invoque.
- Consenso sobre válvula aórtica bicúspide — hay un **resumen** en
  `~/Desktop/EcoSmart_Biblioteca_Fuentes/10_Material_de_apoyo/Consenso_MX_Valvula_Bicuspide_resumen.pdf`.
  **Un resumen no verifica**: hace falta el documento.

**Válvula tricúspide**
- ESC/EACTS 2025 — sección de enfermedad tricuspídea. **En disco.**
- ACC/AHA 2020 — IT. **En disco.**
- ASE 2017 Zoghbi — tabla de IT. **En disco.**
- ASE 2023 Pandian — afectación tricuspídea reumática. **En disco**, con su compuerta por etiología.
- Falta un documento dedicado a la **IT secundaria / anular** y a los dispositivos tricuspídeos
  (T-TEER, ortotópico): **no identificado**.

**Válvula pulmonar**
- ESC 2020 congénitas (Baumgartner) — **en disco**. El historial menciona sus umbrales de IP severa
  del asintomático como **Clase IIa** — ⚠️ **no re-verificado contra el PDF en este pase**, así que
  ese dato NO se puede citar todavía.
- ASE 2017 Zoghbi — tabla de IP. **En disco.**
- Falta fuente para **estenosis pulmonar** graduada: **no identificada**.

**Cardiopatías congénitas**
- ESC 2020 (Baumgartner), **en disco** — y con la divergencia de CIV **abierta y sin resolver** (ver
  `escGuchCiv` en `FUENTES.md`). Resolver eso **antes** de construir más secciones de congénitas:
  hoy la app publica tres afirmaciones que la guía no sostiene.
- Falta la guía **AHA/ACC de congénitas del adulto (2018)** como segunda voz: **no está en disco**.

**Otros módulos sin fuentes en el panel.** Hay PDF en disco pero ninguna entrada en `IND_REFS`:
Lang 2015 (cuantificación de cavidades) · Nagueh 2025 y Robinson 2024 (diastólica) · Humbert 2022
(hipertensión pulmonar) · Schulz-Menger 2025 (pericardio) · Lyon 2022 (cardio-oncología) ·
Konstantinides 2019 (TEP) · Moody 2023 (amiloidosis) · te Riele 2014 (miocardiopatía arritmogénica) ·
ASE estandarización del informe. Rutas: `~/Desktop/EcoSmart_Biblioteca_Fuentes/<carpeta numerada>/`.

---

## Cómo se agrega una fuente al registro

1. **Leerla en texto completo**, sobre el PDF. Título o resumen no cuentan. Si no se pudo abrir, va
   a «Lo que NO se pudo verificar» de este archivo, no a `FUENTES.md`.
2. **Verificar el offset de folio mirando el pie impreso** de dos o tres páginas consecutivas, no
   sumando. Anotar la comprobación al lado, como hace la tabla de reglas de folio de `FUENTES.md`.
   El `+ 2` de Pandian estuvo escrito como `+ 3` y era falso.
3. **Agregar la entrada a `IND_REFS`** en `index.html` (`grep -n 'IND_REFS' index.html`), con tabla
   **y** página en el `full`: una cita sin página obliga a leer un documento de 70 o 156 hojas.
   El procedimiento completo está en `docs/mapa/panel-evidencia.md`.
4. **Clase y nivel NO van en el registro**: son propiedad de la recomendación y viven en el `txt`,
   con el formato `Clase I · Nivel B`. El nivel es opcional — hay documentos que usan GRADE.
5. **Si la fuente desmiente a la app: se reporta y se espera.** Cambiar un umbral, un rótulo o una
   frase clínica es decisión de Maicol. Lo que la fuente desmiente queda **sin corchete**, porque
   citarlo con una fuente verificada respaldaría lo que esa fuente niega.
6. **Una clave por documento Y por alcance.** Si el pie de tabla de una entrada existente no sirve
   para la cita nueva, es **otra clave**: el precedente está en `esc2020guch`/`escGuchCiv` y en
   `aseProtAo`/`aseProtM2024`, que son dos pares de claves sobre el mismo documento.
7. **Cada bibliografía lista sólo lo que su sección cita.** Una entrada numerada sin corchete que la
   invoque se lee como «hay una cita más que no encontrás».
