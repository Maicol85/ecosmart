# Continuación de la tanda PANT-2 — estado exacto al cerrar (2026-11-02)

## Qué quedó hecho

| commit | qué | estado |
|---|---|---|
| `b335dbf` | **corrección A** — el esquema del PDF con sus colores, el censo A3 y la línea corta | **cerrado y verificado** |
| `b87a299` | **corrección B** — el ⓘ que se cierra al tocar fuera, con Escape y al abrir otro | **cerrado y verificado** |
| `26999d4` | **corrección C** — las Evidencias de más de 6 preguntas, en dos columnas | **cerrado y verificado** |
| `cba0a47` | **corrección D** — las frases de la transposición | **cerrado y verificado** |
| `b511f1c` | **commit 1** — inventario, auditoría de sincronías y las dos copias de la guía | **cerrado** (solo lectura) |
| el de cierre | **commit 9** — cobertura, documentación y línea base | **cerrado** |

## Qué falta: los commits 2 a 8

**Ninguno se empezó.** No hay una sola línea de la aplicación tocada por ellos, así que no hay
nada a medias que haya que deshacer ni terminar.

| commit | pantalla | alto a 1440 px | campos |
|---|---|---:|---:|
| **2** | MCH — miocardiopatía hipertrófica | **1253** | 30 |
| **3** | el botón «3D» del corazón maestro (fase 1) | — | — |
| **4** | MCA — miocardiopatía arritmogénica | **1208** | 26 |
| **5** | TdF — tetralogía de Fallot reparada | 596 | 16 |
| **6** | estenosis subaórtica (317) y supravalvular aórtica (293) | 610 | 14 |
| **7** | arritmia ventricular (módulo compartido) | 157 | 4 |
| **8** | los rótulos de las presiones pulmonares | — | — |

## Lo que ya está hecho de ellos, y es aprovechable

**Del commit 1, que alimenta a todos:**
- El **inventario de las 19 secciones** con sus campos (id y rótulo), espejos, globos, textos
  largos y alturas a 1440, 1000, 768 y 390 px: `docs/AUDITORIA_SINCRONIAS_CONGENITAS.md` § 1a.
- **Qué lee cada sección de otras pestañas y qué emite al papel**, en la misma sección.
- **La lista de trabajo de los commits 2 y 4 a 6**: las **53 frases visibles** clasificadas por
  lo que hacen (explica una guía / cuenta historia / otro).
- La **auditoría de sincronías** completa, con el caso de tipo 4 que el commit 7 cerraría.
- La sonda `scripts/_probe_pant2inv.mjs`, que vuelve a medir todo eso en un minuto.

**Del commit 2, la parte que podía pararlo:**
- **La verificación en imagen de la AHA/ACC 2024 ya está hecha** — Ommen, *Circulation*
  2024;149:e1239-e1311, **hoja 29, folio e1267** (pie impreso comprobado), recomendaciones 3 y 6.
  Transcrita en `docs/fuentes/FUENTES.md` → «La tanda PANT-2».
- **Resultado:** los **cinco** factores mayores de `mchAHA` coinciden **uno por uno** con los de
  la recomendación 3; el **realce tardío** y la **TVNS** son los **dos árbitros** de la
  recomendación 6 (sólo para pacientes **sin** factores mayores); la **respuesta tensional
  anormal NO aparece** en ninguna de las dos. **El código aplica exactamente eso.**
- **UN TEXTO DE LA PANTALLA QUEDÓ PARADO** y no se puede mover al ⓘ hasta que el médico decida:
  ver `docs/PENDIENTES.md` → **P2-f**.

**Lo que falta leer para el commit 2:** la **ESC 2022 del HCM Risk-SCD**. En la biblioteca, lo que
hay de miocardiopatías de la ESC es **Arbelo 2023** (`11_Miocardiopatias/Arbelo_2023_Miocardiopatias.pdf`
y `ehad194.pdf`), que es de **2023** y no de 2022 — la pantalla rotula «ESC 2022». Eso hay que
verificarlo antes de mover cualquier texto que la cite.

## Cómo retomar

1. **Medir la línea base**, no leerla: `git rev-parse HEAD`, el sello al pie de `index.html`,
   `wc -c`, `wc -l`, `md5`, el pendrive `DISK_IMG` y la suite.
2. Leer `docs/PENDIENTES.md` → **P2-a** a **P2-h** y `docs/mapa/pant2-correcciones.md`.
3. Empezar por el **commit 2 (MCH)**, que es el siguiente por prioridad de la orden. Su
   inventario (2a) ya está; su verificación de fuente (2c-iii) también.
4. **Antes de tocar la pantalla de MCH**, decidir con el médico lo de **P2-f**: la frase del
   realce tardío no se puede mover al ⓘ mientras afirme algo que la hoja no respalda.
5. El orden del resto es el de la orden: 3, 4, 5, 6, 7, 8 — y si hay que dejar algo afuera, se
   corta por el final.

## Lo que esta tanda NO tocó, a propósito

- `docs/mapa/congenitas-otros.md` (34.540 B, al techo).
- `docs/3d/`, `main.vacio`, `Estructura de la app/` y los `*_aprobado` sin versionar.
- El Laboratorio, el Excel (441 columnas, mismas claves) y los campos guardados (1002, el mismo
  juego exacto).
- Ninguna pantalla de congénitas: las cuatro correcciones tocan el **molde del panel de
  Evidencia**, el **rasterizador de esquemas** y las **frases de la transposición**.
