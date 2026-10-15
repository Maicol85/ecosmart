<!-- mapa armado el 2026-10-15 (tanda Z); los numeros de linea NO se guardan a proposito -->

# Mapa — el Excel: los datos de ORIGEN, las dos columnas del Z y la ida y vuelta del TAPSE/PSAP

**Tanda «Z», 2026-10-15.** Salió a archivo propio porque `docs/mapa/informe-pdf-excel.md` estaba
en **29,7 KB** y esta sección lo cruzaba: medido con `wc -c` **ANTES** de escribir, que es lo que
`ecosmart/CLAUDE.md` pide desde la tanda D2 y lo que `valvulas.md` aprendió pagándolo dos veces.
Allá queda un puntero.

El Excel pasa de **438 a 440 columnas**. Las dos nuevas son `Vmax IT (m/s)` y `PPM aórtico`, y son
de las **dos familias opuestas**, que es lo que hace a este mapa útil.

---

## Los DOS criterios de columna derivada, y de qué lado cae cada una

La casa tiene dos, y el G2 los dejó escritos:

| | Cómo se declara | Se reimporta | Ejemplos |
|---|---|---|---|
| **(a) derivada CON campo** | está en `LAB_XLS_MAP` y se aparta por `LAB_XLS_SOLO_EXPORT` o por `readonly` | **no** | `PSAP (mmHg)`, `PmAD (mmHg)`, `AVm THP` |
| **(b) derivada SIN campo** | **no** está en el mapa; se declara por NOMBRE en `LAB_XLS_BLOQUES` | **no** | `FAC VD (%)`, `DisfSist_VD`, `TAPSE/PSAP (mm/mmHg)`, **`PPM aórtico`** |
| **(c) campo de ENTRADA** | está en `LAB_XLS_MAP` y no es calculado | **sí** | `TAPSE (mm)`, `VCI diám (mm)`, **`Vmax IT (m/s)`** |

- **`Vmax IT (m/s)`** → **(c)**. `['Vmax IT (m/s)', 'vmax_it', 'num']`, bloque 8, **pegada a
  `VC IT (mm)`**, que es la otra medición de esa válvula.
- **`PPM aórtico`** → **(b)**. No tiene campo en el DOM: el veredicto sale de
  `_eaPpmAoClasificar`. Bloque 8, **pegada a `AVA (cm²)`**, que es de donde deriva.

⚠️ **LAS DOS VAN DECLARADAS POR NOMBRE EN `LAB_XLS_BLOQUES`, Y NO ES OPCIONAL.** `PPM aórtico`
porque el mapa no la conoce y `_labOrdenarCols` manda al final lo que no está en el mapa;
`Vmax IT (m/s)` porque empieza con «Vmax», que **no es prefijo de ningún bloque**, así que la
reagrupación por bloque la mandaría al 18 · OTRAS COLUMNAS aunque el mapa la ordene bien. Lo caza
`_labXlsAssertBloques`, que es para lo que está.

⚠️ **Y SE RE-VERIFICÓ QUE NINGÚN CONSUMIDOR LEE POR POSICIÓN**, que es lo que permite ponerlas en
el medio y no al final: el export arma un objeto y lo ordena `_labOrdenarCols`; el importador lee
por **nombre de encabezado normalizado** (`porNorm`, con `trim` + colapso de espacios +
minúsculas); y CeiboAnalytics no lee este libro.

---

## La ida y vuelta del TAPSE/PSAP — la cadena entera

```
TAPSE/PSAP  <-  TAPSE   +   PSAP
                            PSAP  <-  4 x VRT^2  +  PmAD
                                                    PmAD  <-  vci_diam + vci_col
```

| Eslabón | Campo | ¿Tiene columna? | ¿Se reimporta? |
|---|---|---|---|
| TAPSE | `tapse` | sí | **sí** |
| VRT (velocidad máxima de la IT) | `vmax_it` | **sí, desde el Z** | **sí** |
| PmAD | `pmad` | sí | **no** — `LAB_XLS_SOLO_EXPORT` |
| PSAP | `psap_calc` | sí | **no** — `readonly` |
| cociente | — | sí | **no** — derivada sin campo |

**El G3 midió que esto NO se reproducía** y lo declaró PARADA (G3-1): el eslabón que faltaba era
el VRT. El Z agrega su columna, que es la alternativa **(a)** de esa entrada — la que el médico
eligió — y **no** la (b), que habría dejado dos fuentes del mismo número.

### ⚠️ Y FALTABA UN SEGUNDO ESLABÓN, QUE LA MEDICIÓN DESTAPÓ Y LA LECTURA NO

Con la columna puesta, la vuelta **seguía dejando la PSAP y el cociente vacíos**. La causa:
`calcPmAD` **no corría** en dos de las rutas de restauración — `editarInforme` y
`cargarEstudioPorId` — y `calcPSAP` lee `v('pmad')` **sin derivarla**.

- Para un estudio **GUARDADO** no se notaba: `pmad` viaja en `campos` y la restauración lo repone.
- Para un estudio **IMPORTADO** sí, porque `pmad` está en `LAB_XLS_SOLO_EXPORT`.

**El arreglo es una llamada en cada una de esas dos rutas.** Es idempotente y no puede pisar nada
del médico: `pmad` es un `input readonly` cuyo único dueño es `calcPmAD`, derivado de `vci_diam` +
`vci_col`, que sí viajan y sí se reimportan. Y `calcPmAD` llama a `calcPSAP()` en su cola, así que
el orden se corrige solo.

⚠️ **NO VA EN `RECALC_MODULOS`**, por el mismo motivo que `calcIP` declara desde el 2026-10-09: el
embudo corre **además** en las dos rutas de la **REIMPRESIÓN**, que tiene que reproducir lo que se
firmó aunque lo firmado estuviera mal.

### Medido, con teclas reales

TAPSE 18 · Vmax IT 2,8 · VCI 18 mm / colapso >50 %:

| | PmAD | PSAP | cociente | fila del Doppler tricuspídeo |
|---|---|---|---|---|
| IDA | 3 | 34 | 0,529 | «0.529 mm/mmHg — signo de probabilidad de HTP» |
| VUELTA | 3 | 34 | 0,529 | **idéntica, letra por letra** |

Y un Excel **VIEJO de 438 columnas**, sin las dos nuevas, entra «1 fila válida» y **sin un solo
error**.

---

## El mensaje del importador

El G3 dejó **un** mensaje común para las columnas calculadas (`_labXlsCalcMsg` +
`LAB_XLS_CALC_ORIGEN`). El Z le toca tres cosas y nada más:

1. `PPM aórtico` entra en `LAB_XLS_CALC_ORIGEN` con sus tres orígenes —AVA por continuidad,
   superficie corporal e índice de masa corporal—, para que el mensaje diga de qué se recalcula.
2. Las **dos** frases que decían «la velocidad máxima de la insuficiencia tricuspídea, **que NO
   tiene columna en este Excel**» dejan de decirlo: ahora la tiene.
3. El detalle de la vista previa pasa de **«no se pudo recalcular: falta la PSAP estimada»** a
   **«se recalcula al abrir el estudio»**.

⚠️ **EL PUNTO 3 NO ES COSMÉTICO.** Esa vista previa corre sobre la fila **cruda**, antes de abrir
el estudio: ahí la PSAP y la PmAD no existen todavía porque la app las deriva **al abrir**. Decir
«falta la PSAP estimada» manda al médico a llenar una columna que el importador descarta igual,
sobre una cadena que la app reconstruye sola.

⚠️ **Y EL COMENTARIO DEL FUENTE QUE AFIRMABA LO CONTRARIO SE CORRIGIÓ.** Dejarlo sería el archivo
contradiciéndose consigo mismo, que es cómo un arreglo se deshace sin que nadie se entere.

---

## Trampas de esta zona

- ⚠️ **EL MODAL DEL IMPORTADOR NO ES LA IDA Y VUELTA.** Es una previsualización. Medir ahí y
  concluir «no se reproduce» es exactamente lo que la primera corrida de la sonda informó, con la
  cadena ya completa. Lo que hay que medir es el estudio **ya abierto**.
- ⚠️ **`num('vmax_it','it_vmax_cw')` Y NO EL CAMPO PELADO.** Los dos son el MISMO dato en m/s
  desde el 2026-10-05, espejados por `itVmaxSync`; un estudio anterior a esa coordinación puede
  traer sólo uno.
- ⚠️ **DOS DECIMALES Y NO UNO** para la Vmax IT: el campo acepta 2,85 y con un decimal la celda
  publicaría 2,9, o sea una PSAP reimportada distinta de la exportada.
- ⚠️ **LA BANDA NO SE REPITE.** `vmax_it [0.5, 8]` ya vive en `DCM_RANGO`, que `_labRango`
  fusiona, así que el importador la valida sin que haya un segundo dueño de esos dos números.
- ⚠️ **EL `PPM aórtico` SE CLASIFICA SOBRE EL AVA REDONDEADO A DOS DECIMALES**, que es el número
  que la columna `AVA (cm²)` de al lado publica y el que la pantalla clasifica. Con el crudo, la
  celda y la fila podrían pararse a los lados del corte sobre el mismo estudio — la regla de la
  casa desde el AVA de 1,00.
- ⚠️ **Y EXIGE PRÓTESIS AÓRTICA**, igual que la fila de pantalla, preguntándole a
  `valvEsProtesis` sobre el token: `_imVmProt` pregunta por el DOM y acá no hay formulario.

---
