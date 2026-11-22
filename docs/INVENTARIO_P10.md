# Inventario P10 — de dónde sale hoy la escala de un Doppler espectral, y dónde está el defecto

Documento del **bloque 1**. No toca `index.html`. Todo lo que dice está medido con
`scripts/_probe_p10regs.mjs` sobre el pendrive `DISK_IMG` (solo lectura) o leído en el archivo.

---

## 1. De dónde sale cada cosa (tarea 1.1)

| Qué | Quién lo da | Tag DICOM | Dueño en `index.html` |
|---|---|---|---|
| El rectángulo de la región | el archivo | (0018,6018/601A/601C/601E) `RegionLocationMin X0/Y0 · Max X1/Y1` | `_dcmImgRegiones` → `r.x0 r.y0 r.x1 r.y1` |
| La unidad de cada eje | el archivo | (0018,6024/6026) `PhysicalUnits X/Y Direction` | `r.ux r.uy` — `3 = cm`, `4 = segundos`, `7 = cm/s` |
| El tamaño del píxel | el archivo | (0018,602C/602E) `PhysicalDeltaX/Y` | `r.dx r.dy` — **`dx` en segundos**, `dy` en cm/s, **negativo** |
| La línea de velocidad cero | el archivo | (0018,6022) `ReferencePixelY0` + (0018,601A) | `r.ry0` — **acá está el defecto** |
| El valor físico en ese píxel | el archivo | (0018,602A) `RefPixelPhysicalValueY` | `r.rvy` — 0 en las 138 regiones medidas |
| La escala de velocidad a mano | el médico | — | `_medCalibVel = { y0, cmsPorPx }`, de `_medCalVelDos` |
| El eje del tiempo a mano | **nadie** | — | no existe: lo tiene que traer el archivo |

Las tres compuertas son `_dcmImgRegionMedible` (los dos ejes en cm),
`_dcmImgRegionVelocidad` (eje Y en cm/s) y `_dcmImgRegionTiempo` (eje X en segundos);
el VTI exige **las dos últimas**.

---

## 2. El defecto (tarea 1.3)

`_dcmImgVelocidadEn(r, y)` calcula

```js
return (r.rvy || 0) + (y - r.ry0) * r.dy;
```

o sea trata **`ReferencePixelY0` como una fila absoluta de la imagen**.

El estándar dice que es un **desplazamiento relativo a `RegionLocationMinY0`**:

> «The Reference Pixel Y0 location is an offset from Region Location Min Y0 (0018,601A).»
> — DICOM PS3.3 C.8.5.5, US Region Calibration Module (aclarado por el Supplement 84, 2004).
> Para una región Doppler, ese píxel es **la línea de cero velocidad**.

### Lo medido sobre el pendrive, que lo confirma

320 archivos con regiones (GE Vingmed Ultrasound / Vivid iq), **484 regiones**, de ellas
**138 con el eje Y en cm/s**:

| Comprobación | lectura **RELATIVA** (la del estándar) | lectura **ABSOLUTA** (la de la app hoy) |
|---|---|---|
| `ry0` cae dentro del recuadro | **138 / 138** | 71 / 138 |
| el cero de velocidad cae dentro del recuadro | **138 / 138** | 71 / 138 |
| `rx0` cae en un borde del recuadro | **97 / 138** (igual al ancho exacto) | 0 / 138 — ni `x0` ni `x1` |

Y un caso que lo decide solo, sin estadística: el archivo `Q7DBTAH0`, con `dy = −0,111878`,
recuadro `212..671`, `ry0 = 218`.

- Leído **relativo**: el recuadro va de **+24 a −25 cm/s** con la base **centrada**. Es el rango
  de un **Doppler tisular**, donde hacen falta los dos sentidos (s′ positiva, e′ y a′ negativas).
- Leído **absoluto**: va de **0 a −49 cm/s**, con la base pegada al borde de arriba. Ahí la e′ y
  la a′ no se podrían medir. **Ningún equipo dibuja un tisular así.**

### Qué afecta

Un **offset constante de `y0 · dy` cm/s en toda velocidad del visor**, que arrastra:

- la Vmax y el gradiente máximo (`4V²`: el error entra al cuadrado),
- el gradiente medio,
- el **VTI** (`offset × tiempo`),
- y la **línea al cero** que el visor dibuja (línea 150688, que usa el `ry0` crudo guardado).

En este pendrive el offset va de **22,8 a 292,1 cm/s**, con **mediana 110,1 cm/s (1,1 m/s)**.

### Qué NO afecta

- **El eje del tiempo.** `_dcmImgMsEntre` usa `|x2 − x1| · dx`: una **diferencia**, así que `rx0`
  se cancela. Por eso los 305 ms del caso del VINNO son plausibles.
- **Las distancias 2D.** También salen de una diferencia (`mmPorPx = dx · 10`).
- **La calibración manual de velocidad.** `_medVelCalEn` no mira la región.

---

## 3. El caso del VINNO: la cuenta cierra (tarea 1.2)

Los tres números del equipo y de la app: **VTI 21,66 cm** (equipo) contra **VTI 136,7 cm,
Vmax 5,06 m/s y 305 ms** (EcoSmart).

Con el eje del tiempo intacto, un offset `C` en la velocidad da `VTI_app = VTI_real + C · T`:

```
136,7 = 21,66 + C · 0,305  →  C = 377,2 cm/s
Vmax_real = 5,06 − 3,77 = 1,29 m/s
velocidad media real = 21,66 / 0,305 = 71 cm/s  →  media/pico = 0,55
```

**0,55 es la forma típica de una envolvente de tracto de salida.** La hipótesis alternativa —que
la escala estuviera mal por un factor 6,31— daría `Vmax_real = 0,80 m/s` con **media/pico = 0,885**,
una envolvente casi cuadrada que no existe en un flujo pulsátil.

**O sea: línea cero mal ubicada, no escala mal leída, no unidad confundida y no región equivocada.**

El `C = 377 cm/s` implica `|y0 · dy| = 377`: por ejemplo un recuadro espectral que arranque en la
fila 400 con `dy ≈ −0,94 cm/s` por píxel, que son unos ±1,7 m/s de rango. Es plausible para un PW
de TSVI, pero **el número exacto no se puede confirmar sin el `.dcm`**: en el pendrive no hay
ningún VINNO —las 484 regiones son todas GE Vivid iq— y el repositorio no tiene ninguno.

### Esto corrige a P8-a

P8-a descartó el eje de velocidad con este argumento: «como el panel publica además la Vmax y el
médico no la reportó mal, la escala de velocidad está bien». **Esa premisa cayó**: el médico
reporta ahora Vmax 5,06 m/s y dice que no es creíble en un TSVI. Sus dos candidatas —trazo de
varios latidos, y `PhysicalDeltaX` del VINNO— **quedan descartadas por la aritmética de arriba**,
porque las dos exigen que el eje del tiempo esté mal y los 305 ms son plausibles.

---

## 4. Lo que hace falta de Maicol

Un `.dcm` del VINNO —el PW de TSVI del caso— para **confirmar el número exacto** del caso. La
corrección **no depende de ese archivo**: la regla está verificada contra 138 regiones y contra el
texto del estándar.
