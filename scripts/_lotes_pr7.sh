#!/bin/bash
# Lotes de RIESGO de la tanda PR7. La orden dice expresamente NO correr la suite completa y correr
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
LOG=${LOG:-/tmp/pr7_lotes.log}

# Los ids de los casos cuyo CUERPO toca alguna de las seis zonas de PR7.
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

i=0; lote=0; acc=""
TOT_OK=0; TOT_N=0
for id in $IDS; do
  acc="$acc,$id"; i=$((i+1))
  if [ $i -ge $TAM ]; then
    lote=$((lote+1))
    echo "  ── lote $lote ($i casos)" | tee -a "$LOG"
    node scripts/test_clinico.mjs --solo "${acc#,}" 2>&1 | grep -E "RESULTADO|^  TC-.*✗" | tee -a "$LOG"
    acc=""; i=0
  fi
done
if [ -n "$acc" ]; then
  lote=$((lote+1))
  echo "  ── lote $lote ($i casos)" | tee -a "$LOG"
  node scripts/test_clinico.mjs --solo "${acc#,}" 2>&1 | grep -E "RESULTADO|^  TC-.*✗" | tee -a "$LOG"
fi
echo "" | tee -a "$LOG"
echo "  ── TOTALES" | tee -a "$LOG"
grep -oE "RESULTADO: [0-9]+/[0-9]+" "$LOG" | awk -F'[ /]' '{ok+=$2; n+=$3} END{printf "  %d/%d\n", ok, n}' | tee -a "$LOG"
echo "  ── ROJOS" | tee -a "$LOG"
grep -E "^  TC-.*✗" "$LOG" | sed 's/^ *//' | cut -c1-110 | sort -u | tee -a "$LOG"
