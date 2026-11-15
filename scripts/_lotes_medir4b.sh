#!/bin/bash
# Corre la suite completa en lotes de 55, UNA vez, con el pendrive DISK_IMG verificado al abrir,
# ENTRE lotes y al cerrar, y con el md5 de index.html comprobado antes y despues.
#
# ** EL RECUENTO SE ANCLA AL SIGNO DEL FINAL DE LINEA, y no cuenta cualquier linea que empiece con
#    dos espacios y TC-: el runner imprime ADEMAS una linea de diagnostico por cada caso rojo, y
#    contarlas sumaba de mas -lo pago la tanda VAL-PPT, que informo 636 de 623-.
# ** Y LA LISTA DE CASOS SE CUENTA CON grep -c . Y NO CON wc -l, que saltea la ultima linea si el
#    archivo no termina en salto -lo pago la tanda POP-C, que conto uno de menos-.
# ** LA LISTA SE GENERA ACA, con el patron COMPLETO del id: hay casos TC-<numero> y casos TC-GR-nn,
#    y contar solo los numericos deja QUINCE casos sin ejecutar con el total pareciendo correcto
#    -lo pago PANT-36-.
# ** Y SI LA LISTA SALE VACIA SE CORTA CON exit 2: una corrida de cero casos que devuelve 0 se lee
#    igual que una corrida limpia (leccion 10 de la orden de MEDIR-4b).
set -u
cd "$(dirname "$0")/.." || exit 1
RAIZ=$(pwd -P)

LISTA=/tmp/claude-501/casos_lista_medir4b.txt
LOG=/tmp/claude-501/suite_medir4b.log
mkdir -p /tmp/claude-501
MD5A=$(md5 -q "$RAIZ/index.html")

verificar_pendrive() {
  if [ ! -d /Volumes/DISK_IMG ]; then
    echo "  PENDRIVE DISK_IMG NO MONTADO ($1) - SE CORTA" | tee -a "$LOG"
    exit 2
  fi
  N=$(ls /Volumes/DISK_IMG | grep -c .)
  echo "  pendrive DISK_IMG verificado ($1): $N entradas" | tee -a "$LOG"
}

grep -oE "caso\('TC-[A-Z0-9-]+'" "$RAIZ/scripts/test_clinico.mjs" \
  | sed "s/caso('//;s/'//" | sort -u > "$LISTA"

: > "$LOG"
echo "== SUITE COMPLETA EN LOTES DE 55 - tanda MEDIR-4b (CIERRE) ==" | tee -a "$LOG"
echo "  md5 de index.html al abrir: $MD5A" | tee -a "$LOG"
TOTAL=$(grep -c . "$LISTA")
echo "  casos distintos en la lista: $TOTAL" | tee -a "$LOG"
if [ "$TOTAL" -lt 1 ]; then
  echo "  LA LISTA SALIO VACIA - SE CORTA" | tee -a "$LOG"
  exit 2
fi
DUP=$(grep -oE "caso\('TC-[A-Z0-9-]+'" "$RAIZ/scripts/test_clinico.mjs" | sed "s/caso('//;s/'//" | sort | uniq -d | grep -c .)
echo "  ids duplicados en el archivo de casos: $DUP" | tee -a "$LOG"
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
  #    cada byte es un caracter. Se cuentan por separado, con el caracter completo.
  N=$(sed -n "/-- LOTE $LOTE:/,\$p" "$LOG" | grep -cE '^  TC-.* (✓|✗)$')
  EJEC=$((EJEC + N))
  echo "  ejecutados en el lote: $N de $NSEL" | tee -a "$LOG"
  I=$((J + 1))
done

verificar_pendrive "al cerrar"
MD5B=$(md5 -q "$RAIZ/index.html")
echo "" | tee -a "$LOG"
echo "== CIERRE ==" | tee -a "$LOG"
echo "  ejecutados: $EJEC de $TOTAL" | tee -a "$LOG"
echo "  md5 al cerrar: $MD5B (identico: $([ "$MD5A" = "$MD5B" ] && echo SI || echo NO))" | tee -a "$LOG"
echo "  ROJOS de todos los lotes:" | tee -a "$LOG"
grep -E '^  TC-.* ✗$' "$LOG" | sed 's/ .*/ /' | sort -u | tee -a "$LOG"
echo "  verdes: $(grep -cE '^  TC-.* ✓$' "$LOG")  rojos: $(grep -cE '^  TC-.* ✗$' "$LOG")" | tee -a "$LOG"
