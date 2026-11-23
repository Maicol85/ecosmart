#!/bin/bash
# _lotes_pr5.sh — los LOTES DE RIESGO de la tanda PR5 (2026-11-23).
#
# La orden dice: NO correr la suite completa; correr los casos nuevos y los grupos que toquen
# AORTA, INFORME, PDF y REFERENCIAS. La seleccion sale del PATRON DEL CUERPO de cada caso y no
# de elegirlos a ojo, que es la regla de esta casa desde la tanda CUADROS.
#
#   bash scripts/_lotes_pr5.sh            # todos los lotes
#   LOTE_DESDE=3 bash scripts/_lotes_pr5.sh
set -u
cd "$(dirname "$0")/.."
LOG=${LOG:-/tmp/pr5_lotes.log}
TAM=${TAM:-45}
: > "$LOG"

echo "== md5 de index.html al ABRIR: $(md5 -q index.html | cut -c1-8)" | tee -a "$LOG"

# La seleccion: todo caso cuyo CUERPO mencione la aorta, el informe narrativo, el EN SUMA, el
# PDF o Referencias. Se extrae con python para no depender del formato de grep.
python3 - > /tmp/pr5_sel.txt <<'PYEOF'
import io, re
s = io.open('scripts/test_clinico.mjs', encoding='utf-8').read()
# cada caso: desde caso('TC-...' hasta el proximo caso( o el fin
trozos = re.split(r"\ncaso\('", s)
PAT = ('ao_sin', 'ao_st', 'ao_tub', 'diam_cayado', 'diam_ao_toracica', 'aoSeg', 'AO_FIG5',
       'AO_DIL_MM', 'aorNomo', 'aorEsp', 'evTarjetaAo', 'ao-card', 'ao-interp', 'calcAorta',
       'informe_texto', 'generarInforme', 'en_suma', 'generarPDFReal', 'jspdf',
       'evRefPintar', 'ref-', 'REF_SUBTAB', 'refSubTab', 'VINFO', 'mfsZ', 'eaEscenario',
       'eaGradoCalculado', 'gmedio_ao', 'vmax_ao', 'ava_cont')
sel = []
for t in trozos[1:]:
    m = re.match(r"(TC-[0-9A-Za-z-]+)'", t)
    if not m: continue
    cuerpo = t[:400000]
    if any(p in cuerpo for p in PAT): sel.append(m.group(1))
vistos, out = set(), []
for x in sel:
    if x not in vistos: vistos.add(x); out.append(x)
print('\n'.join(out))
PYEOF

TOTAL=$(wc -l < /tmp/pr5_sel.txt | tr -d ' ')
echo "== casos seleccionados por el patron de su cuerpo: $TOTAL" | tee -a "$LOG"

# Los seis nuevos van SIEMPRE, por si el patron no los tomara.
for n in 1029 1030 1031 1032 1033 1034; do
  grep -qx "TC-$n" /tmp/pr5_sel.txt || echo "TC-$n" >> /tmp/pr5_sel.txt
done
TOTAL=$(wc -l < /tmp/pr5_sel.txt | tr -d ' ')
echo "== con los seis nuevos asegurados: $TOTAL" | tee -a "$LOG"

N=$(( (TOTAL + TAM - 1) / TAM ))
echo "== $N lote(s) de hasta $TAM" | tee -a "$LOG"
DESDE=${LOTE_DESDE:-1}
for ((i=DESDE; i<=N; i++)); do
  INI=$(( (i-1)*TAM + 1 ))
  IDS=$(sed -n "${INI},$((INI+TAM-1))p" /tmp/pr5_sel.txt | paste -sd, -)
  [ -z "$IDS" ] && continue
  echo "" | tee -a "$LOG"
  echo "───── LOTE $i/$N ─────" | tee -a "$LOG"
  node scripts/test_clinico.mjs --solo "$IDS" 2>&1 | grep -E "RESULTADO|✗|condicion:|excepcion:|DISK_IMG|pendrive" | tee -a "$LOG"
done
echo "" | tee -a "$LOG"
echo "== md5 de index.html al CERRAR: $(md5 -q index.html | cut -c1-8)" | tee -a "$LOG"
echo "== VERDES/TOTAL por lote:" | tee -a "$LOG"
grep -E "^  RESULTADO" "$LOG" | tee -a /dev/null
