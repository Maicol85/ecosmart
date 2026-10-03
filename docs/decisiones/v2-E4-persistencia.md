<!-- E4 de la reestructura v2 de botones de válvula. Verificación de persistencia y lectura de
     estudios legados. NO hubo cambio de código: con el enfoque B (el centinela «sin»/«0» se
     conserva), no hace falta migrar nada. Se absorbe/retira en E7. -->

# v2 · E4 — Persistencia y lectura de estudios legados (verificación, sin cambio de código)

Enfoque B: `sin`/`0` sigue siendo el **centinela interno de «no hay enfermedad»** (no se reescribió
esa plomería), así que un estudio guardado con un grado `sin`/`0` se lee **igual que antes** = sin
valvulopatía. **No hace falta migrar nada** (decisión de Maicol: no migrar estudios guardados).

## 1. Guardar y reabrir conserva el estado (sonda, escenas DUR-*)
Medido con `scripts/auditoria_botones.mjs` (guardar por la función real + reabrir por
`cargarEstudioPorId`):
- **DUR-ea / DUR-ia / DUR-em / DUR-im**: grado, nota del fundamento, aviso rojo y pastilla vuelven
  **idénticos** tras guardar+reabrir (grado a mano «Leve» sobre cálculo «Severa» + motivo «jet
  excéntrico»). El `recalcular` de cada entrada del registro repone la foto del calculado al reabrir.
- **it y ep** (nuevos en el registro, E2c): `sevFundRestaurar` atiende las **seis** claves (TC-391),
  así que su fundamento también se repone al reabrir.
- **DUR-et**: el grado (`et_grado`) se conserva y el informe lo usa («ET leve, significativa.»); la
  pastilla de estenosis tricuspídea no se repinta al reabrir — es el comportamiento **preexistente**
  («la pastilla es estado del navegador, no del estudio», `docs/PENDIENTES.md`), no una regresión v2.
  El contenido clínico firmado se conserva.

## 2. Leer un estudio legado con grado «Sin» = botón apagado (decisión 3) — ya se cumple
Medido en Chrome: se guardó un estudio con `ea_grado='sin'`, se dejó la pastilla aórtica **prendida
a propósito** (paciente anterior, `localStorage valv-pill-esten-aortica='1'`) y se reabrió el estudio
legado:
- `ea_grado` → `sin` (preservado, no se tocó el disco);
- pastilla → **apagada** (se resetea al cargar: `limpiarCampos` la apaga y `valvAutoAbrirCajones`
  no la reprende porque `sin` no está en `VALV_AUTO_GRADO`);
- informe → **«Válvula aórtica trivalva normal, sin estenosis ni insuficiencia.»** (sin «presente»,
  sin grado); EN SUMA sin línea de EAo.

O sea: una pastilla rancia del paciente anterior **no** fabrica un «EAo presente.» sobre un estudio
legado que decía «sin». El mismo camino (`cargarEstudioPorId`) cubre la reimportación de Excel/JSON:
el importador ya marca `sin`/`0` como manual (`_sevManualDesdeCampos`), y al abrir el estudio se
resuelve igual. Sin reescribir disco.

## 3. Conclusión
E4 no requirió tocar `index.html` — el enfoque B hizo la migración innecesaria. Verificado por sonda
(DUR-*) y por medición directa en Chrome del caso legado. md5 de `index.html` sin cambios respecto de
E3b (`d079bafe6fce72a6d26f19fd9f804a0d`).
