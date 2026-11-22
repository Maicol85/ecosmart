#!/bin/bash
# Corre la suite completa en lotes de 55, UNA vez, con el pendrive DISK_IMG verificado al abrir,
# ENTRE lotes y al cerrar, y con el md5 de index.html comprobado antes y despues.
#
# ** Heredado de _lotes_pr4.sh SIN tocar una sola de sus guardas (19/11/2026, prompt 6). Las
#    cuatro mejoras del punto E1 de MEDIR-6 y las cuatro trampas de recuento que documenta -el
#    ancla al signo del final de linea, el grep -c en vez de wc -l, el patron COMPLETO del id y
#    el corte si la lista sale vacia- se conservan tal cual. Lo unico que cambia son los nombres
#    del log y de la lista, para no pisar la corrida de la tanda anterior.
#
# ** Las cuatro mejoras del punto E1 (16/11/2026):
#
#  1. SE LEE UN ARCHIVO CONCRETO Y NO SE LISTA EL DIRECTORIO. `ls` sobre un volumen desmontado
#     puede contestar DE CACHE -- es la trampa del «pendrive fantasma» que CLAUDE.md documenta:
#     «si se desmonta a mitad de una corrida, readdir sigue contestando de cache y readFile
#     revienta»--, asi que una comprobacion que solo lista puede decir «montado» sobre un disco
#     que ya no esta. Leer DICOMDIR de verdad es lo que no se puede fingir.
#     Se usa `dd` y no `cat`: lee un bloque y corta, asi que no arrastra los 135 KB del archivo
#     en cada uno de los diecinueve controles.
#
#  2. SE MIDE CUANTO TARDA. Un volumen que responde pero tarda segundos es un disco que se esta
#     yendo, y el sintoma siguiente es un caso que falla por tiempo y parece un defecto de la app.
#     El tiempo queda en el log de cada control, asi que al leerlo se ve si se degrado.
#
#  3. SE DECLARA CUANTOS ARCHIVOS ENCONTRO -- denominador explicito--. Un pendrive montado y VACIO
#     pasaba el `[ -d ]` de la version anterior, y entonces los diecisiete casos que leen de el
#     salen verdes sobre CERO archivos: verde sobre nada, que es lo que esta casa no informa.
#     Se cuentan los archivos de GEMS_IMG, que es de donde salen las imagenes del ecografo, y si
#     son cero SE CORTA.
#
#  4. HAY UN TOQUE PREVIO ANTES DEL PRIMER LOTE. El primer acceso a un volumen dormido lo despierta
#     y puede tardar segundos; sin el toque, ese costo caia dentro del primer caso que leyera del
#     disco y se contaba como lentitud de la app.
#
# ** Y SI EL DISCO NO ESTA, LOS CASOS QUE DEPENDEN DE EL FALLAN FUERTE, no quedan en verde: los
#    diecisiete declaran su denominador con el valor `false`, asi que sin archivos salen ROJOS con
#    su motivo. Verificado midiendolo con ECO_PENDRIVE apuntando a una ruta inexistente.
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
#    igual que una corrida limpia.
set -u
cd "$(dirname "$0")/.." || exit 1
RAIZ=$(pwd -P)

PEN=${ECO_PENDRIVE:-/Volumes/DISK_IMG}
LISTA=/tmp/claude-501/casos_lista_p12.txt
LOG=/tmp/p12.log
mkdir -p /tmp/claude-501
MD5A=$(md5 -q "$RAIZ/index.html")

# E1 · (1) lee un archivo concreto · (2) mide el tiempo · (3) declara el denominador
verificar_pendrive() {
  if [ ! -d "$PEN" ]; then
    echo "  PENDRIVE NO MONTADO en $PEN ($1) - SE CORTA" | tee -a "$LOG"
    exit 2
  fi
  T0=$(date +%s%N 2>/dev/null || echo 0)
  if ! dd if="$PEN/DICOMDIR" of=/dev/null bs=4096 count=1 2>/dev/null; then
    echo "  NO SE PUDO LEER $PEN/DICOMDIR ($1) - SE CORTA" | tee -a "$LOG"
    echo "  (el volumen puede estar listando de cache con el disco ya afuera)" | tee -a "$LOG"
    exit 2
  fi
  T1=$(date +%s%N 2>/dev/null || echo 0)
  MS=$(( (T1 - T0) / 1000000 ))
  N=$(find "$PEN/GEMS_IMG" -type f 2>/dev/null | grep -c .)
  if [ "$N" -lt 1 ]; then
    echo "  PENDRIVE MONTADO Y SIN ARCHIVOS en GEMS_IMG ($1) - SE CORTA" | tee -a "$LOG"
    echo "  (los diecisiete casos que leen del disco saldrian verdes sobre CERO archivos)" | tee -a "$LOG"
    exit 2
  fi
  echo "  pendrive verificado ($1): DICOMDIR leido en ${MS} ms, $N archivos en GEMS_IMG" | tee -a "$LOG"
}

grep -oE "caso\('TC-[A-Z0-9-]+'" "$RAIZ/scripts/test_clinico.mjs" \
  | sed "s/caso('//;s/'//" | sort -u > "$LISTA"

: > "$LOG"
echo "== SUITE COMPLETA en lotes de 55 - tanda P12 ==" | tee -a "$LOG"
echo "  md5 de index.html al abrir: $MD5A" | tee -a "$LOG"
echo "  pendrive: $PEN" | tee -a "$LOG"
TOTAL=$(grep -c . "$LISTA")
echo "  casos distintos en la lista: $TOTAL" | tee -a "$LOG"
if [ "$TOTAL" -lt 1 ]; then
  echo "  LA LISTA SALIO VACIA - SE CORTA" | tee -a "$LOG"
  exit 2
fi
DUP=$(grep -oE "caso\('TC-[A-Z0-9-]+'" "$RAIZ/scripts/test_clinico.mjs" | sed "s/caso('//;s/'//" | sort | uniq -d | grep -c .)
echo "  ids duplicados en el archivo de casos: $DUP" | tee -a "$LOG"

# E1 · (4) TOQUE PREVIO: despierta el volumen antes del primer lote, para que el costo del primer
# acceso no caiga dentro de un caso y se cuente como lentitud de la app.
echo "" | tee -a "$LOG"
echo "-- TOQUE PREVIO del pendrive --" | tee -a "$LOG"
TT0=$(date +%s%N 2>/dev/null || echo 0)
dd if="$PEN/DICOMDIR" of=/dev/null bs=4096 count=1 2>/dev/null || true
find "$PEN/GEMS_IMG" -type f 2>/dev/null | head -3 | while read -r f; do
  dd if="$f" of=/dev/null bs=4096 count=1 2>/dev/null || true
done
TT1=$(date +%s%N 2>/dev/null || echo 0)
echo "  toque previo: $(( (TT1 - TT0) / 1000000 )) ms (DICOMDIR + los tres primeros de GEMS_IMG)" | tee -a "$LOG"

verificar_pendrive "al abrir"

# ** RANGO: por omision, TODOS los lotes. Se conserva el mecanismo por si hay que rehacer uno.
DESDE=${LOTE_DESDE:-1}
HASTA=${LOTE_HASTA:-99}

# ** TOPE POR LOTE, y no es precaucion teorica: la pasada anterior se quedo UNA HORA Y MEDIA
#    clavada en el lote 18 porque un caso esperaba una promesa que solo un clic resuelve, y el
#    corredor no tiene como saber que un `node` que no imprime nada esta colgado y no lento. Con
#    el tope, un lote trabado se corta, SE DICE en el log y la corrida sigue con el siguiente.
TOPE=${LOTE_TOPE:-900}

EJEC=0
LOTE=0
I=1
while [ "$I" -le "$TOTAL" ]; do
  LOTE=$((LOTE + 1))
  J=$((I + 54))
  [ "$J" -gt "$TOTAL" ] && J=$TOTAL
  if [ "$LOTE" -lt "$DESDE" ] || [ "$LOTE" -gt "$HASTA" ]; then
    I=$((J + 1)); continue
  fi
  SEL=$(sed -n "${I},${J}p" "$LISTA" | paste -sd, -)
  NSEL=$(sed -n "${I},${J}p" "$LISTA" | grep -c .)
  echo "" | tee -a "$LOG"
  echo "-- LOTE $LOTE: casos $I a $J ($NSEL) --" | tee -a "$LOG"
  verificar_pendrive "lote $LOTE"
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
echo "  ejecutados en los lotes $DESDE a $HASTA: $EJEC" | tee -a "$LOG"
echo "  md5 al cerrar: $MD5B (identico: $([ "$MD5A" = "$MD5B" ] && echo SI || echo NO))" | tee -a "$LOG"
echo "  ROJOS de todos los lotes:" | tee -a "$LOG"
# ** EL sed HEREDADO IMPRIMIA LA LISTA EN BLANCO: las lineas arrancan con DOS espacios, asi que
#    's/ .*/ /' borra desde el primero y deja un espacio. Se recorta por campo con awk.
grep -E '^  TC-.* ✗$' "$LOG" | awk '{print "   " $1}' | sort -u | tee -a "$LOG"
echo "  verdes: $(grep -cE '^  TC-.* ✓$' "$LOG")  rojos: $(grep -cE '^  TC-.* ✗$' "$LOG")" | tee -a "$LOG"
