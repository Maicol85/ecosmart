<!-- registro armado sobre 5137c30, 2026-10-01; los números de línea no se guardan a propósito -->

# Fuentes verificadas — PRÓTESIS valvular

Separado de `docs/fuentes/FUENTES.md` (válvula nativa) porque son **claves distintas de `IND_REFS`
a propósito**: las entradas nativas tienen pie de tabla nativo y reusarlas acá le pondría pie de
tabla equivocado a una cita protésica. Las reglas de folio están en `FUENTES.md`.

**Cobertura hoy: prótesis MITRAL.** La aórtica tiene la clave registrada (`aseProtAo`) pero **sin
ningún corchete que la invoque** — ver el final de este archivo.

---

### `ahaProtM2020` — ACC/AHA 2020, prótesis valvular
Mismo documento, **clave distinta a propósito**: el `full` de `ahaVc2020` enumera las tablas de IM y
EM **nativas** y no menciona prótesis. Reusarlo le pondría pie de tabla nativa a una cita protésica.

- **§11.8.2** «Intervention for Prosthetic Valve Stenosis», **p. e152** — reintervención quirúrgica
  en la estenosis severa sintomática de prótesis biológica o mecánica, salvo riesgo alto o
  prohibitivo (**Clase 1 · Nivel B-NR**); antagonista de la vitamina K razonable en la estenosis
  significativa de prótesis biológica atribuida a trombosis (**Clase 2a · Nivel B-NR**).
- **§11.9.3** «Intervention» de la regurgitación protésica, **p. e154** — cirugía ante hemólisis
  intratable o insuficiencia cardíaca por fuga transvalvular o periprotésica (**Clase 1 · B-NR**);
  cirugía razonable en el asintomático con regurgitación protésica severa y riesgo operatorio bajo
  (**Clase 2a · B-NR**); cierre percutáneo de la fuga periprotésica con hemólisis intratable o
  NYHA III-IV, riesgo alto o prohibitivo y anatomía apta, en centro de referencia (**Clase 2a · B-NR**).
- ⚠️ Su fila de **valve-in-valve percutáneo está escrita para la prótesis AÓRTICA** y no se cita
  para la mitral.

### `aseProtM2024` — ASE 2024, prótesis (posición MITRAL)
Zoghbi WA, Jone PN, Chamsi-Pasha MA, et al. *J Am Soc Echocardiogr* 2024;37(1):2-63.
doi:10.1016/j.echo.2023.10.004.
**Ruta probable:** `.../05_Protesis_valvulares/Zoghbi_2024_Protesis.pdf`. **Folio = PDF + 1.**

- **Tabla 11** «Doppler findings suggestive of prosthetic mitral valve stenosis», **p. 27** —
  velocidad pico < 1,9 / 1,9-2,5 / ≥ 2,5 m/s · gradiente medio ≤ 5 / 6-10 / > 10 mmHg · VTI
  prótesis/VTI TSVI < 2,2 / 2,2-2,5 / > 2,5 · EOA ≥ 2,0 / 1-2 / < 1 cm² · THP < 130 / 130-200 / > 200 ms.
- **Tabla 12** «TTE findings suggestive of significant prosthetic MR in mechanical valves with
  normal PHT», **p. 28** — velocidad pico ≥ 1,9 m/s (S 90 %, E 89 %) · relación VTI ≥ 2,5 (S 89 %,
  E 91 %) · gradiente medio ≥ 5 mmHg (S 90 %, E 70 %). Con la velocidad pico y la relación VTI
  elevadas a la vez, la especificidad *«is close to 100 %»*.
- **Tabla 13** «Echocardiographic criteria for severity of prosthetic mitral valve regurgitation»,
  **p. 30** — vena contracta < 0,3 / 0,3-0,69 / ≥ 0,7 cm · volumen regurgitante < 30 / 30-59 /
  ≥ 60 mL · fracción regurgitante < 30 / 30-49 / ≥ 50 % · EROA < 0,20 / 0,20-0,39 / ≥ 0,40 cm².
  Nota †† — esos cuantitativos *«are less well validated than in native MR»*. Nota § — define la
  periprotésica por **dehiscencia o balanceo**.
- **Tabla 7** «Doppler parameter criteria of aortic valve and mitral valve PPM», **p. 20** — mitral
  indexada, **IMC < 30**: normal > 1,2 · moderado 1,2-0,91 · severo ≤ 0,90 cm²/m²; **IMC ≥ 30**:
  normal > 1,0 · moderado 1,0-0,76 · severo ≤ 0,75 cm²/m².
- **p. 10** — define el PPM mitral **sin estratificar por IMC**: *«Moderate mitral PPM is defined as
  < 1.2 cm²/m², and severe mitral PPM is defined as ≤ 0.9 cm²/m²»*. **Contradice a la Tabla 7 para
  IMC ≥ 30** (una EOA indexada de 1,1 cm²/m² es *moderada* por el texto y *normal* por la tabla).
  **La calculadora usa la Tabla 7**; la sección publica las tres voces declarando cuál está aplicada.
- **p. 10** prohíbe el THP para el área: *«calculation of EOA using the pressure half-time method is
  frequently inaccurate and leads to overestimation of EOA»*.
- **p. 11** — volumen y fracción regurgitantes por comparación de flujos no sirven acá: *«mitral
  inflow cannot be measured using Doppler because of the mitral prosthesis»*.
- ⚠️ **La Tabla 9 NO es de esta sección.** Es «Potential role of CT in various complications of
  prosthetic **AORTIC** valves» (**p. 26**), y el corte de **145 UH** para trombo vs pannus vive ahí
  dentro, **descrito para la posición aórtica**. Usarlo en mitral es extrapolación de posición, no
  una cita. **No se encontró fuente con cortes de TC para trombo vs pannus mitral** en las tres
  leídas, así que el punto se omite.

### `aseProtAo` — ASE 2024, prótesis (posición AÓRTICA)
Mismo documento que `aseProtM2024`, **clave separada a propósito**: su pie dice **«Tabla 5 — prótesis
aórtica quirúrgica»**, así que colgarle las Tablas 7/11/12/13 le pondría pie de tabla **aórtica** a
citas **mitrales**. Y sus cortes **no son los de válvula nativa**.
⚠️ **Registrada y hoy sin ningún corchete que la invoque**, y eso es un hallazgo, no un descuido: el
`guia:` de `eaProtNarrativa` es **código muerto** — los únicos accesos a ese retorno son `.frase`,
`.resumen` y `.salvedades`; `.guia` tiene cero lectores, aunque dos comentarios del archivo afirmen
que `_eaProtPintar` lo consume (no lo consume: lee `N.salvedades` y nada más).
