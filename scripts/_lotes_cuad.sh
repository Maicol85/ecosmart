#!/bin/bash
# Los LOTES DE RIESGO de la tanda CUADROS (18/11/2026): solo los casos que tocan el PDF, el
# informe, el EN SUMA o el Laboratorio. Por orden expresa NO se corre la suite completa.
# Hereda las cuatro guardas de _lotes_3a.sh: el pendrive leido de verdad (no listado), el tiempo
# de esa lectura, el denominador de archivos y el md5 de index.html antes y despues.
set -u
cd "$(dirname "$0")/.."
LOG=/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-DzA9vX/99130228-c931-40b1-ad76-db04e4f2ca97/scratchpad/cuad/lotes.log
LISTA=/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-DzA9vX/99130228-c931-40b1-ad76-db04e4f2ca97/scratchpad/cuad/riesgo.txt
: > "$LOG"
disco() {
  local t0 t1 n
  t0=$(python3 -c 'import time;print(int(time.time()*1000))')
  if ! dd if=/Volumes/DISK_IMG/DICOMDIR of=/dev/null bs=4096 count=1 2>/dev/null; then
    echo "  [$1] PENDRIVE: NO SE PUDO LEER DICOMDIR -- los casos que dependen de el NO prueban nada" >> "$LOG"; return 1
  fi
  t1=$(python3 -c 'import time;print(int(time.time()*1000))')
  n=$(ls /Volumes/DISK_IMG/GEMS_IMG 2>/dev/null | wc -l | tr -d ' ')
  echo "  [$1] PENDRIVE ok en $((t1-t0)) ms · GEMS_IMG=$n" >> "$LOG"
  [ "$n" -gt 0 ] || { echo "  [$1] PENDRIVE VACIO -- se corta" >> "$LOG"; return 1; }
}
MD5A=$(md5 -q index.html)
echo "md5 index.html ANTES = $MD5A" >> "$LOG"
disco abrir || exit 1
TOT=$(grep -c . "$LISTA")
echo "casos de riesgo: $TOT" >> "$LOG"
i=0; lote=0
while [ $i -lt "$TOT" ]; do
  lote=$((lote+1))
  SUB=$(sed -n "$((i+1)),$((i+55))p" "$LISTA" | paste -sd, -)
  echo "── LOTE $lote ──" >> "$LOG"
  disco "lote $lote"
  node scripts/test_clinico.mjs --solo "$SUB" >> "$LOG" 2>&1
  i=$((i+55))
done
disco cerrar
MD5B=$(md5 -q index.html)
echo "md5 index.html DESPUES = $MD5B" >> "$LOG"
[ "$MD5A" = "$MD5B" ] && echo "md5 IDENTICO" >> "$LOG" || echo "⚠️ EL ARCHIVO CAMBIO DURANTE LA CORRIDA" >> "$LOG"
grep -E "RESULTADO" "$LOG"
