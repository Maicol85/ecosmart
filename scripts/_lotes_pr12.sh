#!/bin/bash
# Lotes de RIESGO de la tanda PR12. La orden dice expresamente NO correr la suite completa y
# correr «los lotes de copiado, Cuadros, visor, SGL, geometria del VI y celular» -el celular es
# check_mobile.js, aparte-.
# Se conserva la seleccion de PR9 -que ya cubre el SGL, los Cuadros, el copiado, el PDF, el
# informe, el guardado y Configuracion- y se le agregan los nombres del VISOR, de la geometria
# del VI y del criterio humoral, que son las zonas que PR12 toca.
#
# ⚠️ LA SELECCION SALE DEL PATRON DEL PROPIO CUERPO DE CADA CASO Y NO DE UNA LISTA A OJO, que es la
# regla que esta casa fija desde la tanda CUADROS: un caso que toca el visor y que nadie recordo
# anotar no entra, y entonces el numero no dice nada.
# ⚠️ Y SE CORRE EN LOTES: la bateria entera corre los mil casos en UNA pagina, asi que un caso que
# deja un overlay abierto se lo deja a los que siguen.
set -u
cd "$(dirname "$0")/.."
TAM=${TAM:-45}
LOG=${LOG:-/tmp/pr12_lotes.log}

# Los ids de los casos cuyo CUERPO toca alguna de las seis zonas de PR8.
IDS=$(python3 - <<'PYEOF'
import re
s = open('scripts/test_clinico.mjs', encoding='utf-8').read()
# cada caso: desde caso('TC-...' hasta el proximo caso( de nivel superior
partes = re.split(r"\ncaso\(", s)
PAT = [
 # ── (1) COPIADO con formato: los dos botones y sus dos armadores de HTML ──
 'cuadCopiarDatos', 'cuadCopiarInforme', '_cuadCopiar', 'cuadTextoHTML', 'cuadInformeHTML',
 'cuadTexto', 'cuadTextoSecs', 'cuadInformeTexto', 'cuadInformePartes', 'cuadSumaItems',
 '_cwEscHtml', '_cwP', 'CW_SECS', 'CW_NO_MEDIDA', '_cwLinea', '_cwPz', 'CW_DOPPLER_TIT',
 'cuad-copia', 'data-cuad-copia',
 # ── (2) CUADROS: la tarjeta, el arrastre, los quitados y el resumen de valvulas ──
 'cuad-ov', 'cuad-grid', 'cuad-btn', 'cuadAbrir', 'cuadCerrar', 'cuadPintar', 'cuadQuitar',
 'cuadRecuperar', 'cuadRestablecer', 'cuadReset', 'cuadOrdenVigente', 'cuadOrdenDesdeDOM',
 'cuadPersonalizado', 'cuadBtnSync', 'cuadFilas', 'cuadCtx', 'cuadConDatos', '_cuadArr',
 'cuad-box', 'cuad-grip', 'cuad-x', 'cuad-chip', 'data-cuad', 'cuadResumenValv', 'cuad-rv',
 'cuadDefs', 'cuadVisibles',
 # ── (3) VISOR de imagenes y su modulo de medicion ──
 'cine-ov', 'cine-med', '_cineAbrir', 'cineCerrar', '_cineDatos', 'medHerramienta', '_medHerr',
 'medOn', 'medApagar', 'medReset', '_medPintar', '_medEstado', '_medAreas', '_medPunto',
 'medCalib', '_dopRender', '_d2Render', '_medTablaHTML', 'vistaBAbrir', 'vistaCerrarUna',
 'medSimpson', '_simp', 'medVti', '_vtiDe', 'cine-modal', 'cine-panel', '_vTodas', '_vCon',
 # ── (4) SGL: la pestania, su bull is eye, la paleta y la tabla de calculos ──
 'sgl-svg-bullseye', 'strainEstado', 'strainColor', 'strainCiclar', 'strainSet', 'strainEscribir',
 'strainTramoDe', 'strainParseNum', 'strainNum', 'strainHayDatos', 'strainAplicarTodos',
 'STRAIN_PAL', 'STRAIN_MARCAS', 'STRAIN_MIGRA', 'sglReset', 'sglOnShow', 'sglDibujarBullseye',
 'sgl_gls', 'sgl_notas', 'sgl_be_pdf', 'toggleSglPDF', 'sglPdfOn', 'tab-sgl', 'sglNeg',
 'patrones-sgl', 'patron-grid', 'sp-root', 'GE_STRAIN', 'bullseyeDataURL', 'strainLeyenda',
 '_restaurarStrain', 'strain_sgl', 'strainCalc', 'sgl-calc', 'scRender', 'scCalcular',
 'scUsarComoSGL', '_scRed', '_scN', 'sc-ico', 'sc-lin', 'sc-caja',
 'strainTxtValido', 'strainNormTxt', 'data-strain-caja', 'strainCajaAbrir', 'strainTocar',
 # ── (5) EL STRAIN DEL VISOR y su diana por territorios ──
 'medStrain', '_strain', '_strBulls', '_strTono', '_STR_GRIS', '_STR_SEG', '_STR_ANILLOS',
 '_STR_VISTAS', '_strAgregar', '_strTerrVivos', '_strResultadoVivo', '_strainCalcular',
 '_strainAceptar', '_strColorPct', '_strLeyendaCanvas',
 # ── (6) GEOMETRIA DEL VI y el espesor parietal relativo ──
 'calcGeometriaVI', 'geom-val', 'rwt-val', 'rwt-septo', 'rwt-pp', 'rwt-ddvi', 'rwt-result',
 'UMBRAL_MASA_HVI', 'ref-vi', 'GEO-VI-00', 'calcRWT', 'calcAIVI', 'devereux-val',
 # ── (7) EL CRITERIO HUMORAL: HFA-PEFF y HFA-ICOS ──
 'hf_ntprobnp', 'hf_bnp', 'hf_nt_may', 'hf_nt_men', 'hfUmbrales', 'hfapeffRender',
 'hfaicos_bnp', 'hfaicosToggle', 'hfaicosRender', 'HFAICOS_RANGO_NT',
 # ── (8) los censos de globos y de fichas, que cualquier globo nuevo mueve ──
 'VINFO', 'vinfo-btn', '_vinfoN', 'vinfoAbrir',
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

# Para RETOMAR una corrida cortada: LOTE_DESDE=8 bash scripts/_lotes_pr12.sh
DESDE=${LOTE_DESDE:-1}
HASTA=${LOTE_HASTA:-999}
I=1; LOTE=0; EJEC=0
while [ "$I" -le "$TOTAL" ]; do
  LOTE=$((LOTE + 1))
  J=$((I + TAM - 1))
  [ "$J" -gt "$TOTAL" ] && J=$TOTAL
  if [ "$LOTE" -lt "$DESDE" ]; then I=$((J + 1)); continue; fi
  if [ "$LOTE" -gt "$HASTA" ]; then break; fi
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
  # ** LOS CHROME HUERFANOS AHOGAN LA CORRIDA, y el sintoma se lee como «esto tarda». El arnes del
  #    suite deja su arbol de Chrome con el servidor escuchando al terminar cada lote, y se van
  #    acumulando: medido en esta tanda, los cuatro primeros lotes tardaron unos seis minutos cada
  #    uno y el septimo mas de una hora, con catorce Chrome vivos. Matandolos, diez casos vuelven a
  #    tardar 83 s -8,3 s por caso-, que es lo normal.
  #    NO alcanza al Chrome del medico: ese no corre con --user-data-dir en el temporal. Es la
  #    misma linea que `_mut_pr8.py` ya tenia y que a este corredor le faltaba.
  pkill -f "remote-debugging-port=0 --user-data" 2>/dev/null
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
