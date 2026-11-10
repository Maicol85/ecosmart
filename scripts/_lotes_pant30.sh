#!/bin/bash
# Corre la suite completa en lotes de 55, UNA vez, con el pendrive DISK_IMG verificado al abrir,
# ENTRE lotes y al cerrar, y con el md5 de index.html comprobado antes y despues.
#
# ** EL RECUENTO SE ANCLA AL SIGNO DEL FINAL DE LINEA, y no cuenta cualquier linea que empiece con
#    dos espacios y TC-: el runner imprime ADEMAS una linea de diagnostico por cada caso rojo, y
#    contarlas sumaba de mas -lo pago la tanda VAL-PPT, que informo 636 de 623-.
# ** Y LA LISTA DE CASOS SE CUENTA CON grep -c . Y NO CON wc -l, que saltea la ultima linea si el
#    archivo no termina en salto -lo pago la tanda POP-C, que conto uno de menos-.
set -u
cd "$(dirname "$0")/.." || exit 1

LISTA=/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-UptycX/de3e0e91-d286-4c0f-b235-11d155d451a4/scratchpad/p30/casos_lista.txt
LOG=/private/tmp/claude-501/-Users-maicoldossantos--claude-spares-spare-UptycX/de3e0e91-d286-4c0f-b235-11d155d451a4/scratchpad/p30/suite2.log
MD5A=$(md5 -q index.html)

verificar_pendrive() {
  if [ ! -d /Volumes/DISK_IMG ]; then
    echo "  PENDRIVE DISK_IMG NO MONTADO ($1) - SE CORTA" | tee -a "$LOG"
    exit 2
  fi
  N=$(ls /Volumes/DISK_IMG | grep -c .)
  echo "  pendrive DISK_IMG verificado ($1): $N entradas" | tee -a "$LOG"
}

: > "$LOG"
echo "== SUITE COMPLETA EN LOTES DE 55 - tanda PANT-30 ==" | tee -a "$LOG"
echo "  md5 de index.html al abrir: $MD5A" | tee -a "$LOG"
TOTAL=$(grep -c . "$LISTA")
echo "  casos distintos en la lista: $TOTAL" | tee -a "$LOG"
verificar_pendrive "al abrir"

EJEC=0
LOTE=0
I=1
while [ "$I" -le "$TOTAL" ]; do
  LOTE=$((LOTE + 1))
  J=$((I + 54))
  [ "$J" -gt "$TOTAL" ] && J=$TOTAL
  SEL=$(sed -n "${I},${J}p" "$LISTA" | paste -sd, -)
  NSEL=$(sed -n "${I},${J}p" "$LISTA" | grep -c .)
  echo "" | tee -a "$LOG"
  echo "-- LOTE $LOTE: casos $I a $J ($NSEL) --" | tee -a "$LOG"
  verificar_pendrive "lote $LOTE"
  node scripts/test_clinico.mjs --solo "$SEL" >> "$LOG" 2>&1
  # ** EL CONTADOR POR LOTE ESTABA ROTO Y DECIA «0 de 55»: una CLASE de caracteres con dos
  #    glifos UTF-8 multibyte -[✓✗]- no empareja con el grep -E de macOS en locale C, porque ahi
  #    cada byte es un caracter. Se cuentan por separado, con el caracter completo. Es el hermano
  #    del grep -c de VAL-PPT y del wc -l de POP-C: el contador del arnes tambien se mide.
  N=$(sed -n "/-- LOTE $LOTE:/,\$p" "$LOG" | grep -cE '^  TC-.* (✓|✗)$')
  EJEC=$((EJEC + N))
  echo "  ejecutados en el lote: $N de $NSEL" | tee -a "$LOG"
  I=$((J + 1))
done

verificar_pendrive "al cerrar"
MD5B=$(md5 -q index.html)
echo "" | tee -a "$LOG"
echo "== CIERRE ==" | tee -a "$LOG"
echo "  ejecutados: $EJEC de $TOTAL" | tee -a "$LOG"
echo "  md5 al cerrar: $MD5B (identico: $([ "$MD5A" = "$MD5B" ] && echo SI || echo NO))" | tee -a "$LOG"
echo "  ROJOS de todos los lotes:" | tee -a "$LOG"
grep -E '^  TC-.* ✗$' "$LOG" | sed 's/ .*/ /' | sort -u | tee -a "$LOG"
echo "  verdes: $(grep -cE '^  TC-.* ✓$' "$LOG")  rojos: $(grep -cE '^  TC-.* ✗$' "$LOG")" | tee -a "$LOG"
