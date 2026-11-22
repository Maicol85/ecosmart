# Fichas de los casos TC-1017 a TC-1022 — tanda P12 (2026-11-22)

Los seis caen **0/6 contra `921b72b`** con el mismo archivo de casos y sólo el `index.html`
distinto, verificado en un worktree, **por sus condiciones y ninguno por excepción**: todo acceso
va por un ayudante con guarda, que es la lección de TC-827.

---

## TC-1017 — los cuatro carteles confirmados son propios y no abren ningún diálogo nativo

**Qué fija.** Que existen los tres primitivos (`avisoProp`, `preguntaProp`, `pedirProp`), que los
dos alias históricos (`_medAviso`, `borrConfirmar`) **siguen existiendo** —si uno desaparece,
veintitantos llamadores y nueve casos quedan sin cartel— y que los tres carteles que se pueden
disparar sin red abren un cartel **propio** sin llamar a ningún diálogo nativo.

**Cómo mide.** **Espía** `alert`, `confirm` y `prompt` en vez de sustituirlos por algo que
conteste: lo que se mide es que **no se llamen**. Los tres caminos:

1. la **envolvente con dos puntos** —por debajo del mínimo de tres—, que es el cartel que Maicol
   nombró; busca `[data-med-aviso="ov"]` y exige que su texto diga «tres puntos»;
2. **`imgSetCalidad(0, 'orig')`** con un `_orig` puesto; busca `[data-borr-conf]`, exige que diga
   «calidad original» y que su botón del sí **no** sea `btn-danger`: subir la resolución no
   destruye nada;
3. **`dopCorregir('ao.diam')`**; busca `[data-ped-prop="ov"]` y su campo.

**Lo que da contra la línea base.** Los tres primitivos no existen y los nativos **sí** se
llaman.

⚠️ **Limpia los tres carteles en su `finally`** y antes de cada medición: un cartel que queda
abierto es `position:fixed` con `inset:0` y tapa el documento entero para todos los casos que
siguen en su lote — es lo que P10 pagó con TC-890.

---

## TC-1018 — la escala de velocidad sobrevive al viaje por el registro

**Qué fija.** Que la región vuelve de `_cineRegistro` → `_cineDesdeRegistro` con los **cuatro**
campos del píxel de referencia, que la fila del cero es la misma (600) a los dos lados, que se
puede medir velocidad y VTI después del viaje, y que **el mismo trazo da el mismo VTI**.

**Los tres controles, que son lo que lo hace valer:**

- **Control del eje del TIEMPO**: sobrevive, y sobrevivía antes de P12. Es lo que separa los tres
  ejes y lo que impide que un «todo bien» venga de que la sonda no mide nada.
- **Control POSITIVO**: con la región recortada a los **nueve** campos de antes de P12, el VTI
  **falla**. Sin esto, dos «ok» iguales podrían venir de que no se mide nada.
- **Control NEGATIVO**: una región 2D mide distancia antes y después, con su `dx` y `dy`
  **idénticos** — los mm no se tocaron.

**Lo que da contra la línea base.** Campos `dx,dy,tipo,ux,uy,x0,x1,y0,y1`; base `antes=600
después=NaN`; VTI `43.2042 vs null`.

⚠️ La región lleva los números del **encabezado** del caso del VINNO: coordenadas de píxel y
escalas de eje. **Ningún dato de ningún paciente.**

⚠️ Sustituye `_medRegs` —la única entrada del cálculo— y la **repone en el `finally`**, y apaga
`_medCalibVel`: con la calibración manual puesta mandaría sobre la del archivo y la medición no
diría nada sobre la escala del archivo, que es justo lo que esta tanda arregla.

---

## TC-1019 — con «sólo las nuevas» las repetidas se descartan solas y quedan marcadas

**Qué fija.** Que existe `_clnkBorrarEnPuente`; que el reparto da 1 nueva y 2 repetidas; que el
botón dice el número; que el cartel **dice** que las repetidas se descartan; que tras apretar
**las dos repetidas ya no están en el puente** y **la nueva sigue ahí** esperando su destino; y
que las dos quedan marcadas `descartada` en el registro persistido, que es lo que hace que no
vuelvan al recargar.

**Cómo mide.** Contra el conector falso, con `__t.ec5Vincular(F)` —el flujo **real** de
vinculación, porque el token es de EcoSmart y `vinculado:true` del falso no alcanza—. Lee el
inventario del puente con un `GET /v1/imagenes` propio, antes y después del clic.

⚠️ **IDS PROPIOS** (`img_z12a/b/c`), por quinta vez en esta casa: el aviso no vuelve por las
**mismas** imágenes en la sesión y los mil casos corren en **una** página, así que una escena
compartida le gasta el aviso al caso de al lado.

⚠️ **Repone las cinco claves de `localStorage` y la base de prueba en su `finally`**, el modo de
vista incluido.

---

## TC-1020 — con cero nuevas el botón dice (0), está apagado y explica por qué

**Qué fija.** Que el reparto da **cero** nuevas y tres repetidas; que el botón dice **«(0)»**;
que está `disabled` **de verdad**; que **se ve** apagado —opacidad computada por debajo de 0,9—;
que su `title` explica por qué; y que apretarlo **no pierde nada**: las tres siguen en el puente.

**Control negativo.** El segundo botón —«todas igual»— **no** está apagado. Sin él, un «todo
apagado» pasaría por correcto.

**Lo que da contra la línea base.** El botón dice «✅ Agregar sólo las nuevas» **sin el `(0)`**.

---

## TC-1021 — la receta de la calibración manual y la frase del «qué hacer»

**Qué fija.** Que existen `MED_CAL_VEL_RECETA`, `MED_CAL_VEL_RECETA2` y
`MED_COMO_CALIBRAR_VEL`; que la receta nombra **el cero** y las **dos unidades**; que la segunda
oración conserva que sirven **dos puntos cualesquiera** (MEDIR-3); que la frase del qué hacer
dice «Qué hacer» y nombra el control por el rótulo que el médico lee, **«Calibrar vel.»**; y que
una zona espectral **sin** escala de velocidad abre un cartel propio que lo dice.

⚠️ **Apaga `_medCalibrandoVel` antes del clic**: con cero regiones medibles la app entra sola en
modo calibrar, y acá **sí** hay región — sin esto el caso mediría la rama de calibración y no la
del aviso.

---

## TC-1022 — la flecha de la velocidad, con imagen fresca y después del viaje

**Qué fija.** Que con la imagen **fresca** y la escala del archivo la flecha es correcta
—arriba/abajo—; que la fila del cero sobrevive al viaje; y que la flecha sigue siendo correcta
**después** del viaje.

**Control POSITIVO.** Con la región de **nueve** campos, la base **no es un número** y la flecha
dice **arriba en los dos lados** — que es el defecto que el médico vio, reproducido. Sin este
control, dos aciertos podrían venir de que la sonda no distingue nada.

**Control.** Con la escala **manual** la flecha es correcta, y lo era desde antes: es lo que el
médico también reportó.

**Lo que da contra la línea base.** Base `NaN` y flecha **arriba / arriba**.

⚠️ Mide el **signo** que cada camino produce, porque la flecha se dibuja con
`(v.cms < 0 ? abajo : arriba)`. No mide píxeles: lo que decide la flecha es el signo.
