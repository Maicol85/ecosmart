# Control de las diez secciones de Evidencia — PANT-17, commit 8

Documento de **solo lectura**. Es la mitad **medible** del control que el punto 8 de la orden
pide: qué clase publica hoy cada una de las diez secciones que esta tanda **no** reescribió, y
con qué folios. Medido en Chrome con `scripts/_probe_pant17ctrl.mjs` sobre el árbol `8943a59`
(cierre del commit 7).

## 1. Las diez, medidas

| sección | Clase I | Clase III | otras clases | folios que publica |
|---|---:|---:|---:|---|
| Comunicación interauricular | 18 | 5 | 18 | 592, e149 |
| Comunicación interventricular | 6 | 3 | 8 | 595, e153, e154 |
| Defecto del septo auriculoventricular | 15 | 4 | 8 | 595, 596, 597, e156, e157, e158 |
| Anomalía de Ebstein | 15 | 0 | 17 | 610, 611, e173, e174, e176 |
| Circulación de Fontan | 25 | 0 | 14 | 627, e201, e206, e241, e242 |
| Conexión venosa pulmonar anómala parcial | 11 | 1 | 7 | 575, 591, e158, e159 |
| Síndrome de Eisenmenger | 13 | 12 | 23 | 586, 4508, 66, e207, e209, e211 |
| Foramen oval permeable | 1 | 0 | 2 | 912, 916, 1395, 1399, e372, e411, e413 |
| Miocardiopatía hipertrófica — prevención de muerte súbita | 5 | 1 | 8 | e1267, 3561 |
| Transposición de grandes arterias — indicaciones y seguimiento | 5 | 0 | 17 | 618, 620, 621, 622, e189, e195, e197, e198 |

«Clase I» cuenta junto `Clase I` y `Clase 1`, que son la misma clase escrita por dos
sociedades; «Clase III», junto `Clase III` y `Clase 3`. El límite de palabra excluye II, IIa,
IIb, 2, 2a y 2b, que van en la última columna.

## 2. Cómo se midió, y una trampa que costó una corrida

Las funciones de `IND_SECS` se llaman **directamente y por su nombre pelado**: son `const` de
nivel de script y viven en el ámbito léxico global, así que `window.IND_SECS` corta y la
medición sale sobre un denominador vacío — la lección que PANT-13 pagó con `_cm3d`.

⚠️ **La primera corrida abrió 14 de 42 secciones y seis de las diez quedaron sin medir**,
porque la siembra usaba ids inventados: los reales son `ete_civ_tipo`, `ebs_desplazamiento`,
`fontan_tipo`, `cvpa_venas_numero`, `eis_lesion_base` y `fop_shunt_reposo`. Un conteo sobre una
sección que no abrió se lee igual que «esa sección no publica nada».

## 3. Lo que este commit NO hizo, y por qué — se declara en `P17-c`

El punto 8 pide además **agregar las Clase I y Clase III que falten**. Saber cuáles faltan
exige leer **en imagen**, con el folio comprobado en el pie impreso, la tabla de
recomendaciones completa de cada lesión en su guía, y comparar fila por fila. Eso no se hizo en
esta tanda: la regla central dice que nada clínico sale de la memoria, así que **no se agregó
ninguna recomendación**. Lo que queda es la tabla de arriba, que es el punto de partida, más
las hojas que hay que abrir:

| sección | qué tabla hay que leer |
|---|---|
| CIA | ACC/AHA 2025 § 4.1.1 y ESC 2020 § 4.1.4 |
| CIV | ACC/AHA 2025 § 4.1.2 y ESC 2020 § 4.2.4 |
| DSAV | ACC/AHA 2025 § 4.1.3 y ESC 2020 § 4.3.4 |
| Ebstein | ACC/AHA 2025 § 4.5 y ESC 2020 § 4.11.4 |
| Fontan | ACC/AHA 2025 § 4.10 y ESC 2020 § 4.16 |
| CVPA | ACC/AHA 2025 § 4.1.4 y ESC 2020 § 4.1.4 |
| Eisenmenger | ACC/AHA 2025 § 4.14 y ESC 2020 § 3.4.7 |
| FOP | **no se toca** — decisión expresa del médico |
| MCH — muerte súbita | AHA/ACC 2024 § 7.2 y ESC 2023 Tabla 18 |
| Transposición | ACC/AHA 2025 § 4.6 y 4.7, y ESC 2020 § 4.12 y 4.13 |

Y las **Clase IIa de intervención** que falten quedan listadas en `P17-c` por el mismo motivo:
el médico decidió que en estas diez sólo se agregan Clase I y Clase III, así que una IIa que
falte se **reporta** y no se escribe.
