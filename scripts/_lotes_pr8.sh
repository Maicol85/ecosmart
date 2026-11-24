#!/bin/bash
# Lotes de RIESGO de la tanda PR8. La orden dice expresamente NO correr la suite completa y correr
# «los lotes de riesgo de SGL, contractilidad, PDF, informe, guardado de estudios y
# Configuracion».
#
# ⚠️ LA SELECCION SALE DEL PATRON DEL PROPIO CUERPO DE CADA CASO Y NO DE UNA LISTA A OJO, que es la
# regla que esta casa fija desde la tanda CUADROS: un caso que toca el PDF y que nadie recordo
# anotar no entra, y entonces el numero no dice nada. Los patrones son los nombres de las funciones
# y de los campos que esas seis zonas usan de verdad.
# ⚠️ Y SE CORRE EN LOTES: la bateria entera corre los mil casos en UNA pagina, asi que un caso que
# deja un overlay abierto se lo deja a los que siguen. Con lotes el dano queda acotado y se puede
# decir CUAL lote lo produjo.
set -u
cd "$(dirname "$0")/.."
TAM=${TAM:-45}
LOG=${LOG:-/tmp/pr8_lotes.log}

# Los ids de los casos cuyo CUERPO toca alguna de las seis zonas de PR8.
IDS=$(python3 - <<'PYEOF'
import re
s = open('scripts/test_clinico.mjs', encoding='utf-8').read()
# cada caso: desde caso('TC-...' hasta el proximo caso( de nivel superior
partes = re.split(r"\ncaso\(", s)
PAT = [
 # SGL y su bull's eye de strain
 'sgl-svg-bullseye', 'strainEstado', 'strainColor', 'strainCiclar', 'strainSet', 'strainEscribir',
 'strainTramoDe', 'strainParseNum', 'strainNum', 'strainHayDatos', 'strainAplicarTodos',
 'STRAIN_PAL', 'STRAIN_MARCAS', 'STRAIN_MIGRA', 'sglReset', 'sglOnShow', 'sglDibujarBullseye',
 'sgl_gls', 'sgl_notas', 'sgl_be_pdf', 'toggleSglPDF', 'sglPdfOn', 'tab-sgl', 'sglNeg',
 'patrones-sgl', 'patron-grid', 'sp-root', 'GE_STRAIN', 'bullseyeDataURL', 'strainLeyenda',
 '_restaurarStrain', 'strain_sgl',
 # contractilidad
 'contrEstado', 'contrSetSegmento', 'contrCiclar', 'contrGetLineasInforme', 'contrRenderInforme',
 'CONTR_MOTILIDAD', 'contr-svg-bullseye', 'contr_be_pdf', 'contrPdfOn', 'toggleContrPDF',
 'contrHayDatos', 'contr-arterias', 'contrArterias', 'lv3d', 'contrReset',
 # PDF
 '_pdfAjustarA4', 'generarPDFReal', 'generarPDF', 'setPdfPlantilla', 'PDF_PLANTILLAS',
 'pdfPlantillaGet', 'jspdf', 'drawTablaCompacta', 'pltz-grid', 'pdfDiagLbl', 'PDF_DIAG_REG',
 'pdfDiagPack', 'cuadDefs', 'cuadVisibles',
 # informe y EN SUMA
 '__t.informe', 'generarInforme', 'informe_texto', 'en_suma',
 # guardado de estudios
 '__t.guardar', 'guardarInforme', 'getInformes', 'recolectarCampos', 'restaurarCampos',
 'verDetalleInforme', 'imgPersistir', 'limpiarCampos',
 # Configuracion
 'cfgOnShow', 'tab-config', 'cfg-card', 'initPdfPlantillas',
 # CUADROS: la tarjeta, el arrastre, los quitados, el resumen de valvulas y los dos copiar
 'cuad-ov', 'cuad-grid', 'cuad-btn', 'cuadAbrir', 'cuadCerrar', 'cuadPintar', 'cuadQuitar',
 'cuadRecuperar', 'cuadRestablecer', 'cuadReset', 'cuadOrdenVigente', 'cuadOrdenDesdeDOM',
 'cuadPersonalizado', 'cuadBtnSync', 'cuadFilas', 'cuadCtx', 'cuadConDatos', '_cuadArr',
 'cuad-box', 'cuad-grip', 'cuad-x', 'cuad-chip', 'data-cuad', 'cuadResumenValv', 'cuad-rv',
 'cuadCopiarDatos', 'cuadCopiarInforme', 'cuadTexto', 'cuadTextoSecs', 'cuadTextoFaltan',
 'cuadInformeTexto', '_cuadCopiar', 'CW_SECS', 'CW_NO_MEDIDA', '_cwLinea', '_cwPz',
 # el noveno estilo
 'tipoword', 'Tipo Word',
 # la tabla de calculos de strain (para que los casos nuevos entren a su propio lote)
 'strainCalc', 'sgl-calc',
]
ids = []
for p in partes[1:]:
    m = re.match(r"'(TC-[A-Z0-9-]+)'", p)
    if not m: continue
    cuerpo = p
    if any(k in cuerpo for k in PAT):
        ids.append(m.group(1))
print(' '.join(ids))
PYEOF
)
N=$(echo $IDS | wc -w | tr -d ' ')
echo "  casos de riesgo seleccionados por el patron de su propio cuerpo: $N" | tee "$LOG"
echo "  md5 de index.html al abrir: $(md5 -q index.html | cut -c1-8)" | tee -a "$LOG"

# ** TOPE POR LOTE, y no es precaucion teorica: la PRIMERA pasada de esta tanda se quedo CLAVADA
#    en el lote 4, que trae TC-238 -uno de los tres casos que CLAUDE.md declara como «esperaban
#    una promesa que solo un clic resuelve, asi que no salian rojos: cortaban su lote»-. Un `node`
#    al 0 % de CPU que no imprime nada es indistinguible de uno lento. Con el tope, el lote se
#    corta, SE DICE en el log y la corrida sigue con el siguiente.
#    Es el mecanismo que la tanda EQ dejo escrito en `_lotes_eq_1419.sh`.
TOPE=${LOTE_TOPE:-420}

echo "$IDS" | tr ' ' '\n' | grep -c . > /dev/null
LISTA=$(mktemp)
echo "$IDS" | tr ' ' '\n' | grep . > "$LISTA"
TOTAL=$(grep -c . "$LISTA")

I=1; LOTE=0; EJEC=0
while [ "$I" -le "$TOTAL" ]; do
  LOTE=$((LOTE + 1))
  J=$((I + TAM - 1))
  [ "$J" -gt "$TOTAL" ] && J=$TOTAL
  SEL=$(sed -n "${I},${J}p" "$LISTA" | paste -sd, -)
  NSEL=$(sed -n "${I},${J}p" "$LISTA" | grep -c .)
  echo "" | tee -a "$LOG"
  echo "  -- LOTE $LOTE: casos $I a $J ($NSEL) --" | tee -a "$LOG"
  node scripts/test_clinico.mjs --solo "$SEL" >> "$LOG" 2>&1 &
  NPID=$!
  ESP=0
  while kill -0 "$NPID" 2>/dev/null; do
    sleep 5
    ESP=$((ESP + 5))
    if [ "$ESP" -ge "$TOPE" ]; then
      echo "  LOTE $LOTE CORTADO POR TIEMPO a los ${ESP} s - el ultimo caso impreso es el que se colgo" | tee -a "$LOG"
      kill "$NPID" 2>/dev/null
      sleep 2
      pkill -f "remote-debugging-port=0 --user-data" 2>/dev/null
      break
    fi
  done
  wait "$NPID" 2>/dev/null
  # ** EL CONTADOR POR LOTE: una CLASE con dos glifos UTF-8 multibyte no empareja con el grep -E
  #    de macOS en locale C, asi que se cuentan por separado con el caracter completo.
  NN=$(sed -n "/-- LOTE $LOTE:/,\$p" "$LOG" | grep -cE '^  TC-.* (✓|✗)$')
  EJEC=$((EJEC + NN))
  echo "  ejecutados en el lote: $NN de $NSEL" | tee -a "$LOG"
  I=$((J + 1))
done
rm -f "$LISTA"

echo "" | tee -a "$LOG"
echo "  md5 de index.html al cerrar: $(md5 -q index.html | cut -c1-8)" | tee -a "$LOG"
echo "  -- TOTALES (ejecutados: $EJEC de $TOTAL)" | tee -a "$LOG"
grep -oE "RESULTADO: [0-9]+/[0-9]+" "$LOG" | awk -F'[ /]' '{ok+=$2; n+=$3} END{printf "  %d/%d\n", ok, n}' | tee -a "$LOG"
echo "  -- ROJOS" | tee -a "$LOG"
grep -E "^  TC-.*✗" "$LOG" | sed 's/^ *//' | cut -c1-110 | sort -u | tee -a "$LOG"
