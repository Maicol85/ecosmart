# Transcripción de la TABLA A4 — tanda PANT-19, commit 2

> **ASE 2024 — Zoghbi W y col., *J Am Soc Echocardiogr* 2024;37:2-63**, archivo
> `Zoghbi_2024_Protesis.pdf`. Tabla A4, **hojas 52 a 57 · folios 53 a 58**.
> Leída **en imagen a 300 ppp** y cruzada con la capa de texto por coordenadas; donde las dos
> difieren manda la imagen. **Regla de folio = hoja + 1, comprobada en el pie impreso de las seis
> hojas**: 52 → «Zoghbi et al 53», 53 → «54 Zoghbi et al», 54 → «55», 55 → «56», 56 → «57»,
> 57 → «58».
>
> **Título impreso:** «Table A4 Normal Doppler echocardiographic values for surgical prosthetic
> aortic valves»
> **Columnas:** `Valve` · `Size, mm` · `Peak gradient, mm Hg` · `Mean gradient, mm Hg` · `EOA, cm²`
> **Nota al pie (hoja 57, folio 58):** «Data are expressed as mean ± SD. Modified from Rajani
> *et al.*²³¹»
>
> `—` = celda vacía impresa (se carga como `null`). Un valor sin `±` es un valor **impreso sin
> desvío** (se carga con el desvío en `null`). **Nada se corrige, se completa ni se redondea.**

## Cómo se separan el nombre y el tipo

La celda «Valve» trae el nombre en **romana** y una segunda línea en **cursiva**. La separación se
hace por la **fuente del PDF** (`AdvPSA183` romana contra `Advhelvneue-italic` cursiva), que es
mecánico y no interpreta. Después:

- si la cursiva es uno de los **descriptores de construcción** que la tabla usa —`Bileaflet`,
  `Single tilting disk`, `Caged ball`, `Stented bovine pericardial`, `Stented porcine`,
  `Stentless`, `Homograft valves`, `Sutureless`—, el **nombre** es la romana y el **descriptor**
  es la cursiva;
- si no lo es, la cursiva es parte del **nombre comercial** y se une a la romana.

El **tipo** sólo se asigna a los descriptores que nombran el mecanismo (`Bileaflet`,
`Single tilting disk`, `Caged ball` → **mecánica**) o el tejido (`Stented bovine pericardial`,
`Stented porcine`, `Stentless` → **biológica**). `Homograft valves` y `Sutureless` describen el
injerto y el método de implante, no el material: quedan **sin dato**, igual que los modelos sin
descriptor. Un modelo sin tipo se ofrece bajo **cualquier** morfología de prótesis.

⚠️ **El PDF codifica la mayúscula inicial del span cursivo en la fuente romana** en siete filas
(«Biocor **S**» + «tented porcine»). Se repone mecánicamente: una mayúscula suelta al final de la
romana seguida de una cursiva que empieza en minúscula.

## Conteo

| | |
|---|---|
| bloques impresos de modelo | **51** |
| modelos tras fundir los dos partidos por maquetación | **49** |
| filas de tamaño | **211** |
| celdas con dato (pico, medio, EOA) | **523** |
| celdas vacías impresas («—») | **110** |
| mecánicas · biológicas · sin tipo | **19 · 20 · 10** |

⚠️ **Los dos bloques partidos por maquetación** son `Medtronic Advantage / Bileaflet`
(23-25 y después 27-29) y `Medtronic-Hall / Single tilting disk` (21-27 y después 20): mismo
nombre, mismo descriptor y **ningún tamaño en común**, así que se funden sin perder una celda.


---

## Hoja 52 · folio 53

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **Abbott Epic** | 21 | — | 19.1 ± 8.2 | 1.0 ± 0.3 |
|  | 23 | — | 13.9 ± 6.0 | 1.4 ± 0.5 |
|  | 25 | — | 12.1 ± 5.1 | 1.5 ± 0.5 |
|  | 27 | — | 11.4 ± 4.1 | 1.6 ± 0.4 |
|  | 29 | — | 7.5 ± 3.3 | 2.4 ± 1.1 |
| **Abbott Trifecta** | 19 | — | 10.7 ± 4.6 | 1.41 ± 0.24 |
|  | 21 | — | 8.1 ± 3.5 | 1.63 ± 0.29 |
|  | 23 | — | 7.2 ± 2.8 | 1.81 ± 0.30 |
|  | 25 | — | 6.2 ± 2.7 | 2.02 ± 0.32 |
|  | 27 | — | 4.8 ± 2.0 | 2.20 ± 0.20 |
|  | 29 | — | 4.7 ± 1.6 | 2.35 ± 0.22 |
| **Arbor Surgical Trilogy** | 21 | 21 ± 8 | 11 ± 6 | 1.9 ± 0.2 |
|  | 23 | 15 ± 7 | 8 ± 4 | 2.0 ± 0.3 |
| **ATS** · *Bileaflet* | 19 | 47.0 ± 12.6 | 25.3 ± 8.0 | 1.1 ± 0.3 |
|  | 21 | 23.7 ± 6.8 | 15.9 ± 5.0 | 1.4 ± 0.5 |
|  | 23 | — | 14.4 ± 4.9 | 1.7 ± 0.5 |
|  | 25 | — | 11.3 ± 3.7 | 2.1 ± 0.7 |
|  | 27 | — | 8.4 ± 3.7 | 2.5 ± 0.1 |
|  | 29 | — | 8.0 ± 3.0 | 3.1 ± 0.8 |
| **ATS AP** · *Bileaflet* | 18 | — | 21.0 ± 1.8 | 1.2 ± 0.3 |
|  | 20 | 21.4 ± 4.2 | 11.1 ± 3.5 | 1.3 ± 0.3 |
|  | 22 | 18.7 ± 8.3 | 10.5 ± 4.5 | 1.7 ± 0.4 |
|  | 24 | 15.1 ± 5.6 | 7.5 ± 3.1 | 2.0 ± 0.6 |
|  | 26 | — | 6.0 ± 2.0 | 2.1 ± 0.4 |
| **ATS 3F Enable** | 21 | 27.0 ± 8.4 | 15.0 ± 4.6 | 1.1 ± 0.4 |
|  | 22 | 25.7 ± 10.8 | 14.5 ± 6.0 | 1.4 ± 0.4 |
|  | 25 | 20.3 ± 7.4 | 11.4 ± 4.0 | 1.6 ± 0.5 |
|  | 27 | 16.8 ± 6.3 | 9.4 ± 3.3 | 1.9 ± 0.5 |
|  | 29 | 14.3 ± 6.7 | 7.8 ± 3.8 | 2.4 ± 0.8 |
| **Baxter Perimount** · *Stented bovine pericardial* | 19 | 32.5 ± 8.5 | 19.5 ± 5.5 | 1.3 ± 0.2 |
|  | 21 | 24.9 ± 7.7 | 13.8 ± 4.0 | 1.3 ± 0.3 |
|  | 23 | 19.9 ± 7.4 | 11.5 ± 3.9 | 1.6 ± 0.3 |
|  | 25 | 16.5 ± 7.8 | 10.7 ± 3.8 | 1.6 ± 0.4 |
|  | 27 | 12.8 ± 5.4 | 4.8 ± 2.2 | 2.0 ± 0.4 |
| **Biocor** · *Stented porcine* | 23 | 30.0 ± 10.7 | 20 ± 6.6 | 1.3 ± 0.3 |
|  | 25 | 23.0 ± 7.9 | 16 ± 5.1 | 1.7 ± 0.4 |
|  | 27 | 22.0 ± 6.5 | 15.0 ± 3.7 | 2.2 ± 0.4 |
| **Extended Biocor** · *Stentless* | 19-21 | 17.5 ± 6.5 | 9.6 ± 3.6 | 1.4 ± 0.4 |
|  | 23 | 14.7 ± 7.3 | 7.7 ± 3.8 | 1.7 ± 0.4 |
|  | 25 | 14.0 ± 4.3 | 7.4 ± 2.5 | 1.8 ± 0.4 |

---

## Hoja 53 · folio 54

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **Bioflo** · *Stented bovine pericardial* | 19 | 37.2 ± 8.8 | 26.4 ± 5.5 | 0.7 ± 0.1 |
|  | 21 | 28.7 ± 6.2 | 18.7 ± 5.5 | 1.1 ± 0.1 |
| **Bjork-Shiley** · *Single tilting disk* | 21 | 38.9 ± 11.9 | 21.8 ± 3.4 | 1.1 ± 0.3 |
|  | 23 | 28.8 ± 11.2 | 15.7 ± 5.3 | 1.3 ± 0.3 |
|  | 25 | 23.7 ± 8.2 | 13.0 ± 5.0 | 1.5 ± 0.4 |
|  | 27 | — | 10.0 ± 2.0 | 1.6 ± 0.3 |
| **Carbomedics reduced** · *Bileaflet* | 19 | 43.4 ± 1.2 | 24.4 ± 1.2 | 1.2 ± 0.1 |
| **Carbomedics Standard** · *Bileaflet* | 19 | 38.0 ± 12.8 | 18.9 ± 8.3 | 1.0 ± 0.3 |
|  | 21 | 26.8 ± 10.1 | 12.9 ± 5.4 | 1.5 ± 0.4 |
|  | 23 | 22.5 ± 7.4 | 11.0 ± 4.6 | 1.4 ± 0.3 |
|  | 25 | 19.6 ± 7.8 | 9.1 ± 3.5 | 1.8 ± 0.4 |
|  | 27 | 17.5 ± 7.1 | 7.9 ± 3.2 | 2.2 ± 0.2 |
|  | 29 | 9.1 ± 4.7 | 5.6 ± 3.0 | 3.2 ± 1.6 |
| **Carbomedics Tophat** · *Bileaflet* | 21 | 30.2 ± 10.9 | 14.9 ± 5.4 | 1.2 ± 0.3 |
|  | 23 | 24.2 ± 7.6 | 12.5 ± 4.4 | 1.4 ± 0.4 |
|  | 25 | — | 9.5 ± 2.9 | 1.6 ± 0.32 |
| **Carpentier Edwards Pericardial** · *Stented bovine pericardial* | 19 | 32.1 ± 3.4 | 24.2 ± 8.6 | 1.2 ± 0.3 |
|  | 21 | 25.7 ± 9.9 | 20.3 ± 9.1 | 1.5 ± 0.4 |
|  | 23 | 21.7 ± 8.6 | 13.0 ± 5.3 | 1.8 ± 0.3 |
|  | 25 | 16.5 ± 5.4 | 9.0 ± 2.3 | — |
| **Carpentier Edwards Standard** · *Stented porcine* | 19 | 43.5 ± 12.7 | 25.6 ± 8.0 | 0.9 ± 0.2 |
|  | 21 | 27.7 ± 7.6 | 17.3 ± 6.2 | 1.5 ± 0.3 |
|  | 23 | 28.9 ± 7.5 | 16.1 ± 6.2 | 1.7 ± 0.5 |
|  | 25 | 24.0 ± 7.1 | 12.9 ± 4.6 | 1.9 ± 0.5 |
|  | 27 | 22.1 ± 8.2 | 12.1 ± 5.5 | 2.3 ± 0.6 |
|  | 29 | — | 9.9 ± 2.9 | 2.8 ± 0.5 |
| **Carpentier Supra-Annular** · *Stented porcine* | 19 | 34.1 ± 2.7 | — | 1.1 ± 0.1 |
|  | 21 | 28.0 ± 10.5 | 17.5 ± 3.8 | 1.4 ± 0.9 |
|  | 23 | 25.3 ± 10.5 | 13.4 ± 4.5 | 1.6 ± 0.6 |
|  | 25 | 24.4 ± 7.6 | 13.2 ± 4.8 | 1.8 ± 0.4 |
|  | 27 | 16.7 ± 4.7 | 8.8 ± 2.8 | 1.9 ± 0.7 |
| **Cryolife** · *Stentless* | 19 | — | 9.0 ± 2.0 | 1.5 ± 0.3 |
|  | 21 | — | 6.6 ± 2.9 | 1.7 ± 0.4 |
|  | 23 | — | 6.0 ± 2.3 | 2.3 ± 0.2 |
|  | 25 | — | 6.1 ± 2.6 | 2.6 ± 0.2 |
|  | 27 | — | 4.0 ± 2.4 | 2.8 ± 0.3 |
| **Edwards Duromedics** · *Bileaflet* | 21 | 39.0 ± 13 | — | — |
|  | 23 | 32.0 ± 8.0 | — | — |
|  | 25 | 26.0 ± 10.0 | — | — |
|  | 27 | 24.0 ± 10.0 | — | — |

---

## Hoja 54 · folio 55

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **Edwards Inspiris Resilia** | 19 | — | 17.6 ± 7.8 | 1.1 ± 0.2 |
|  | 21 | — | 12.6 ± 4.7 | 1.3 ± 0.3 |
|  | 23 | — | 10.1 ± 3.8 | 1.6 ± 0.4 |
|  | 25 | — | 9.6 ± 5.2 | 1.8 ± 0.5 |
|  | 27 | — | 8.2 ± 3.5 | 2.2 ± 0.6 |
| **Edwards Intuity** | 19 | — | 13.9 ± 3.9 | 1.1 ± 0.1 |
|  | 21 | — | 11.6 ± 3.6 | 1.3 ± 0.1 |
|  | 23 | — | 10.4 ± 3.5 | 1.7 ± 0.2 |
|  | 25 | — | 9.1 ± 3.2 | 1.9 ± 0.2 |
|  | 27 | — | 8.3 ± 3.7 | 2.2 ± 0.2 |
| **Edwards Mira** · *Bileaflet* | 19 | — | 18.2 ± 5.3 | 1.2 ± 0.4 |
|  | 21 | — | 13.3 ± 4.3 | 1.6 ± 0.4 |
|  | 23 | — | 14.7 ± 2.8 | 1.6 ± 0.6 |
|  | 25 | — | 13.1 ± 3.8 | 1.9 |
| **Edwards Mosaic** | 21 | — | 13.3 ± 5.3 | 1.4 ± 0.4 |
|  | 23 | — | 11.8 ± 4.9 | 1.6 ± 0.5 |
|  | 25 | — | 10.6 ± 4.4 | 1.8 ± 0.5 |
|  | 27 | — | 9.1 ± 4.0 | 2.0 ± 0.5 |
|  | 29 | — | 8.6 ± 2.9 | 2.3 ± 0.6 |
| **Hancock** · *Stented porcine* | 21 | 18.0 ± 6.0 | 12.0 ± 2.0 | — |
|  | 23 | 16.0 ± 2.0 | 11.0 ± 2.0 | — |
|  | 25 | 15.0 ± 3.0 | 10.0 ± 3.0 | — |
| **Hancock II** · *Stented porcine* | 21 | — | 14.8 ± 4.1 | 1.3 ± 0.4 |
|  | 23 | 34.0 ± 13.0 | 16.6 ± 8.5 | 1.3 ± 0.4 |
|  | 25 | 22.0 ± 5.3 | 10.8 ± 2.8 | 1.6 ± 0.4 |
|  | 29 | 16.2 ± 1.5 | 8.2 ± 1.7 | 1.6 ± 0.2 |
| **Homograft** · *Homograft valves* | 17-19 | — | 9.7 ± 4.2 | 4.2 ± 1.8 |
|  | 19-21 | — | — | 5.4 ± 0.9 |
|  | 20-21 | — | 7.9 ± 4.0 | 3.6 ± 2.0 |
|  | 20-22 | — | 7.2 ± 3.0 | 3.5 ± 1.5 |
|  | 22 | 1.7 ± 0.3 | — | 5.8 ± 3.2 |
|  | 22-23 | — | 5.6 ± 3.1 | 2.6 ± 1.4 |
|  | 22-24 | — | — | 5.6 ± 1.7 |
|  | 24-27 | — | 6.2 ± 2.6 | 2.8 ± 1.1 |
|  | 26 | 1.4 ± 0.6 | — | 6.8 ± 2.9 |
|  | 25-28 | — | — | 6.2 ± 2.5 |
| **Intact** · *Stented porcine* | 19 | 40.4 ± 15.4 | 24.5 ± 9.3 | — |
|  | 21 | 40.9 ± 15.6 | 19.6 ± 8.1 | 1.6 ± 0.4 |
|  | 23 | 32.7 ± 9.6 | 19.0 ± 6.1 | 1.6 ± 0.4 |
|  | 25 | 29.7 ± 15.0 | 17.7 ± 7.9 | 1.7 ± 0.3 |
|  | 27 | 25.0 ± 7.6 | 15.0 ± 4.5 | — |

---

## Hoja 55 · folio 56

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **Ionescu-Shiley** · *Stented bovine pericardial* | 17 | 23.8 ± 3.4 | — | 0.9 ± 0.1 |
|  | 19 | 19.7 ± 5.9 | 13.3 ± 3.9 | 1.1 ± 0.1 |
|  | 21 | 26.6 ± 9.0 | — | — |
|  | 23 | — | 15.6 ± 4.4 | — |
| **Labcor Santiago** · *Stented bovine pericardial* | 19 | 18.6 ± 5.0 | 11.8 ± 3.3 | 1.2 ± 0.1 |
|  | 21 | 17.5 ± 6.6 | 8.2 ± 4.5 | 1.3 ± 0.1 |
|  | 23 | 14.8 ± 5.2 | 7.8 ± 2.9 | 1.8 ± 0.2 |
|  | 25 | 12.3 ± 3.4 | 6.8 ± 2.0 | 2.1 ± 0.3 |
| **Labcor Synergy** · *Stented porcine* | 21 | 24.3 ± 8.1 | 13.3 ± 4.2 | 1.1 ± 0.3 |
|  | 23 | 27.3 ± 13.7 | 15.3 ± 6.9 | 1.4 ± 0.4 |
|  | 25 | 22.5 ± 11.9 | 13.2 ± 6.4 | 1.5 ± 0.4 |
|  | 27 | 17.8 ± 7.0 | 10.6 ± 4.6 | 1.8 ± 0.5 |
| **MCRI On-X** · *Bileaflet* | 19 | 21.3 ± 10.8 | 11.8 ± 3.4 | 1.5 ± 0.2 |
|  | 21 | 16.4 ± 5.9 | 9.9 ± 3.6 | 1.7 ± 0.4 |
|  | 23 | 15.9 ± 6.4 | 8.6 ± 3.4 | 1.9 ± 0.6 |
|  | 25 | 16.5 ± 10.2 | 6.9 ± 4.3 | 2.4 ± 0.6 |
| **Medtronic Advantage** · *Bileaflet* | 23 | — | 10.4 ± 3.1 | 2.2 ± 0.3 |
|  | 25 | — | 9.0 ± 3.7 | 2.8 ± 0.6 |
| **Medtronic Advantage** · *Bileaflet* | 27 | — | 7.6 ± 3.6 | 3.3 ± 0.7 |
|  | 29 | — | 6.1 ± 3.8 | 3.9 ± 0.7 |
| **Medtronic Avalus** | 19 | — | 17.1 ± 5.0 | 1.11 ± 0.25 |
|  | 21 | — | 14.5 ± 4.3 | 1.25 ± 0.25 |
|  | 23 | — | 12.1 ± 3.8 | 1.47 ± 0.32 |
|  | 25 | — | 11.7 ± 4.0 | 1.57 ± 0.31 |
|  | 27 | — | 10.3 ± 4.2 | 1.77 ± 0.41 |
| **Medtronic Freestyle** · *Stentless* | 19 | — | 13.0 ± 3.9 | — |
|  | 21 | — | 9.1 ± 5.1 | 1.4 ± 0.3 |
|  | 23 | 11.0 ± 4.0 | 8.1 ± 4.6 | 1.7 ± 0.5 |
|  | 25 | — | 5.3 ± 3.1 | 2.1 ± 0.5 |
|  | 27 | — | 4.6 ± 3.1 | 2.5 ± 0.1 |
| **Medtronic-Hall** · *Single tilting disk* | 21 | 26.9 ± 10.5 | 14.1 ± 5.9 | 1.1 ± 0.2 |
|  | 23 | 26.9 ± 8.9 | 13.5 ± 4.8 | 1.4 ± 0.4 |
|  | 25 | 17.1 ± 7.0 | 9.5 ± 4.3 | 1.5 ± 0.5 |
|  | 27 | 18.9 ± 9.7 | 8.7 ± 5.6 | 1.9 ± 0.2 |
| **Medtronic-Hall** · *Single tilting disk* | 20 | 34.4 ± 13.1 | 17.1 ± 5.3 | 1.2 ± 0.5 |
| **Medtronic Mosaic** · *Stented porcine* | 21 | — | 14.2 ± 5.0 | 1.4 ± 0.4 |
|  | 23 | 23.8 ± 11.0 | 13.7 ± 4.8 | 1.5 ± 0.4 |
|  | 25 | 22.5 ± 10.0 | 11.7 ± 5.1 | 1.8 ± 0.5 |
|  | 27 | — | 10.4 ± 4.3 | 1.9 ± 0.1 |
|  | 29 | — | 11.1 ± 4.3 | 2.1 ± 0.2 |

---

## Hoja 56 · folio 57

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **Mitroflow** · *Stented bovine pericardial* | 19 | 18.6 ± 5.3 | 13.1 ± 3.3 | 1.1 ± 0.2 |
| **Monostrut Bjork-Shiley** · *Single tilting disk* | 19 | — | 27.4 ± 8.8 | — |
|  | 21 | 27.5 ± 3.1 | 20.5 ± 6.2 | — |
|  | 23 | 20.3 ± 0.7 | 17.4 ± 6.4 | — |
|  | 25 | — | 16.1 ± 4.9 | — |
|  | 27 | — | 11.4 ± 3.8 | — |
| **Prima** · *Stentless* | 21 | 28.8 ± 6.0 | 13.7 ± 1.9 | 1.4 ± 0.7 |
|  | 23 | 21.5 ± 7.5 | 11.5 ± 4.9 | 1.5 ± 0.3 |
|  | 25 | 22.1 ± 12.5 | 11.6 ± 7.2 | 1.8 ± 0.5 |
| **Omnicarbon** · *Single tilting disk* | 21 | 37.4 ± 12.8 | 20.4 ± 5.4 | 1.3 ± 0.5 |
|  | 23 | 28.8 ± 9.1 | 17.4 ± 4.9 | 1.5 ± 0.3 |
|  | 25 | 23.7 ± 8.1 | 13.2 ± 4.6 | 1.9 ± 0.5 |
|  | 27 | 20.1 ± 4.2 | 12.4 ± 2.9 | 2.1 ± 0.4 |
| **Omniscience** · *Single tilting disk* | 21 | 50.8 ± 2.8 | 28.2 ± 2.2 | 0.9 ± 0.1 |
|  | 23 | 39.8 ± 8.7 | 20.1 ± 5.1 | 1.0 ± 0.1 |
| **Starr-Edwards** · *Caged ball* | 23 | 32.6 ± 12.8 | 22.0 ± 9.0 | 1.1 ± 0.2 |
|  | 24 | 34.1 ± 10.3 | 22.1 ± 7.5 | 1.1 ± 0.3 |
|  | 26 | 31.8 ± 9.0 | 19.7 ± 6.1 | — |
|  | 27 | 30.8 ± 6.3 | 18.5 ± 3.7 | — |
|  | 29 | 29.0 ± 9.3 | 16.3 ± 5.5 | — |
| **Sorin Bicarbon** · *Bileaflet* | 19 | 30.1 ± 4.5 | 16.7 ± 2.0 | 1.4 ± 0.1 |
|  | 21 | 22.0 ± 7.1 | 10.0 ± 3.3 | 1.2 ± 0.4 |
|  | 23 | 16.8 ± 6.1 | 7.7 ± 3.3 | 1.5 ± 0.2 |
|  | 25 | 11.2 ± 3.1 | 5.6 ± 1.6 | 2.4 ± 0.3 |
| **Sorin Pericarbon** · *Stentless* | 19 | 36.5 ± 9.0 | 28.9 ± 7.3 | 1.2 ± 0.5 |
|  | 21 | 28.0 ± 13.3 | 23.8 ± 11.1 | 1.3 ± 0.6 |
|  | 23 | 27.5 ± 11.5 | 23.2 ± 7.6 | 1.5 ± 0.5 |
| **Sorin Perceval** · *Sutureless* | S (21) | — | 10.1 ± 4.2 | 1.3 ± 0.3 |
|  | M (23) | — | 9.4 ± 5.5 | 1.5 ± 0.4 |
|  | L (25) | — | 8.5 ± 4.6 | 1.5 ± 0.4 |
|  | XL (27) | — | 9.7 ± 4.7 | 1.6 ± 0.4 |
| **St. Jude Medical Haem Plus** · *Bileaflet* | 19 | 28.5 ± 10.7 | 17.0 ± 7.8 | 1.9 ± 0.1 |
|  | 21 | 16.3 ± 17.0 | 10.6 ± 5.1) | 1.8 ± 0.5 |
|  | 23 | 16.8 ± 7.3 | 12.1 ± 4.2 | 1.7 ± 0.5 |
| **St. Jude Medical Regent** · *Bileaflet* | 19 | 20.6 ± 12 | 11.0 ± 4.9 | 1.6 ± 0.4 |
|  | 21 | 15.6 ± 9.4 | 8.0 ± 4.8 | 2.0 ± 0.7 |
|  | 23 | 12.8 ± 6.8 | 6.9 ± 3.5 | 2.3 ± 0.9 |
|  | 25 | 11.7 ± 6.8 | 5.6 ± 3.2 | 2.5 ± 0.8 |
|  | 27 | 7.9 ± 5.5 | 3.5 ± 1.7 | 3.6 ± 0.5 |

---

## Hoja 57 · folio 58

| Valve | Size, mm | Peak gradient, mm Hg | Mean gradient, mm Hg | EOA, cm² |
|---|---|---|---|---|
| **St. Jude Medical Standard** · *Bileaflet* | 19 | 42.0 ± 10.0 | 24.5 ± 5.8 | 1.5 ± 0.1 |
|  | 21 | 25.7 ± 9.5 | 15.2 ± 5.0 | 1.4 ± 0.4 |
|  | 23 | 21.8 ± 7.5 | 13.4 ± 5.6 | 1.6 ± 0.4 |
|  | 25 | 18.9 ± 7.3 | 11.0 ± 5.3 | 1.9 ± 0.5 |
|  | 27 | 13.7 ± 4.2 | 8.4 ± 3.4 | 2.5 ± 0.4 |
|  | 29 | 13.5 ± 5.8 | 7.0 ± 1.7 | 2.8 ± 0.5 |
| **St. Jude Medical** · *Stentless* | 21 | 22.6 ± 14.5 | 10.7 ± 7.2 | 1.3 ± 0.6 |
|  | 23 | 16.2 ± 9.0 | 8.2 ± 4.7 | 1.6 ± 0.6 |
|  | 25 | 12.7 ± 8.2 | 6.3 ± 4.1 | 1.8 ± 0.5 |
|  | 27 | 10.1 ± 5.8 | 5.0 ± 2.9 | 2.0 ± 0.3 |
|  | 29 | 7.7 ± 4.4 | 4.1 ± 2.4 | 2.4 ± 0.6 |

---

## Rarezas impresas, cargadas tal como están

| modelo | tamaño | qué | cómo se carga |
|---|---|---|---|
| Edwards Mira · *Bileaflet* | 25 | EOA impresa **«1.9» sin desvío** | media `1.9`, desvío `null` |
| St. Jude Medical Haem Plus · *Bileaflet* | 21 | media impresa **«10.6 ± 5.1)»**, con un paréntesis de más | media `10.6`, desvío `5.1)` **tal como se imprime** |
| Homograft · *Homograft valves* | nueve rangos | tamaños `17-19`, `19-21`, `20-21`, `20-22`, `22`, `22-23`, `22-24`, `24-27`, `26`, `25-28` | texto |
| Sorin Perceval · *Sutureless* | cuatro tallas | `S (21)`, `M (23)`, `L (25)`, `XL (27)` | texto |
| Edwards Mosaic / Medtronic Mosaic | — | dos modelos distintos con el mismo nombre comercial | dos entradas separadas, con valores distintos |

## Celdas que NO se cargaron

**Ninguna.** Las 523 celdas con dato se leyeron con certeza; las 110 vacías llevan el `—` impreso
y se cargan como `null`.

