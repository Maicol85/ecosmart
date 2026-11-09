# CONTINUACIÓN — tanda PANT-27, cortada a pedido del médico (2026-11-09)

> **Por qué se cortó:** el médico avisó que cerraba la computadora y sacaba el pendrive. Se
> frenó en el acto, se cortaron por **PID exacto** el script de lotes (**9312**) y el lote de la
> suite que estaba corriendo (**10494**), y se paró el monitor que esperaba el final. **No quedó
> ningún Chrome ni ningún arnés vivo**, verificado con `ps`.
>
> **No se hizo `git push`.** Los cinco commits de la tanda están en `main` **local**.

---

## 1 · Estado del árbol, al cortar

| qué | valor |
|---|---|
| sello del pie (`#eco-build-sello`) | **`v20261109-1203`** |
| md5 de `index.html` | **`a14c45a02066451010acde5359a1cf15`** (`a14c45a0`) |
| líneas / bytes | **169.037** / **12.323.864** |
| `HEAD` | **`934fcbf`** (`PANT27-5`), más el commit de este documento, que **no toca `index.html`** |
| `origin/main` | **`116ac5e`** (cierre de PANT-25, publicado) |
| commits locales sin pushear | **10**: los 4 de AUD-PROT (sólo documentación) + los 5 de PANT-27 + el de este documento |

⚠️ **El md5 de `index.html` es el mismo al abrir la suite y al cortarla** (`a14c45a0` en los dos
lados, está en `/tmp/p27_suite_out.txt`): **nada se editó mientras la suite corría.**

### Los cinco commits, todos verificados pieza por pieza antes de cerrarse

| commit | qué hizo |
|---|---|
| `bd4b986` **PANT27-1** | el inventario de los 14 textos, **solo lectura**: md5 idéntico antes y después |
| `9200536` **PANT27-2** | las **siete notas de la estenosis mitral** (`EM_NOTAS`) |
| `cbe8834` **PANT27-3** | **Fontan** (`fon.ev.sangrado`), el globo **`tavi-calc`** y el bloque del reverso de la ficha **`ref-ia`** |
| `dbdb6a4` **PANT27-4** | la oración de la cirugía ante el **trombo protésico grande**, sólo en el ramal mecánico |
| `934fcbf` **PANT27-5** | cobertura (TC-765 a TC-768, TC-328 y TC-516 adaptados), documentación y el **sello** |

Diff contra `ddcf42d`: **55 líneas agregadas y 33 quitadas** en `index.html`, de las que **49** no
son comentario. **Cero** `innerHTML`, `eval(` y `new Function` nuevos, cero claves, **cero campos
guardados nuevos**, **Excel en 457** columnas y **ningún id cambiado**.

---

## 2 · Lo que YA está verificado, y no hace falta repetir

| verificación | resultado |
|---|---|
| las **14 frases**, exactas y en pantalla, con el gesto real, en los **dos árboles** | ✓ las tres sondas |
| las expresiones viejas, ausentes, **con control positivo** sobre HEAD | ✓ |
| el área con **tres umbrales** (1,5 / 1,8 / 2,25) y el score por el cuerpo de `EM_NOTAS` | ✓ |
| la **compuerta de etiología** de T2, en tres escenas | ✓ |
| Fontan contestado en los **dos sentidos**, con el botón marcado como denominador | ✓ |
| el **papel idéntico a HEAD** en las tres sondas (3 estilos + EN SUMA, 0 diferencias) | ✓ |
| **40/40 mutaciones dirigidas muertas**, md5 del árbol vivo idéntico antes y después | ✓ |
| los 4 casos nuevos **caen** contra `ddcf42d` por **25 condiciones**, ninguna por excepción | ✓ |
| TC-328 y TC-516 adaptados **caen** contra `ddcf42d` por sus 3 condiciones | ✓ |
| **Semgrep 124 WARNING / 0 ERROR** — la línea base exacta | ✓ |
| **sin huérfanos nuevos** | ✓ |

⚠️ **El barrido de mutaciones corrió sobre el árbol de `dbdb6a4`, no sobre el sellado.** El
sello es la única diferencia entre los dos y no toca ninguna de las 40 anclas, pero **conviene
rehacerlo** sobre `934fcbf` para que el número que se publique sea del árbol que queda.

---

## 3 · Lo que FALTA, en orden

### 3.1 · La suite completa — **se cortó en el lote 11 de 15**

Corrió en lotes de 55 sobre el árbol sellado, con el pendrive verificado al abrir y en cada
lote. **Lo que alcanzó a correr está en `/tmp/p27_suite_out.txt`** (se pierde al reiniciar: lo
que importa está transcripto acá).

| lote | resultado | rojos |
|---|---|---|
| 1 a 4 | 55/55 ✓ | — |
| 5 | 54/55 | **TC-223** — rojo conocido, falla por la fecha |
| 6, 7 | 55/55 ✓ | — |
| 8 | 51/55 | **TC-358**, **TC-376**, **TC-390**, **TC-406** |
| 9, 10 | 55/55 ✓ | — (TC-520, adaptado en una tanda anterior, en verde) |
| 11 | **cortado a mitad** | — |
| 12 a 15 | **sin correr** | — |

⚠️ **TC-358 NO ES UNO DE LOS CUATRO ROJOS CONOCIDOS, Y HAY QUE CARACTERIZARLO ANTES DE LLAMARLO
NADA.** Los conocidos son **TC-223, TC-376, TC-390 y TC-406**, más los dos intermitentes
declarados **TC-551** y **TC-557**. TC-358 —«EA (i): con un insumo fuera de banda se RETIRA el
grado que la app sugirió sola»— **no está en esa lista**.

Lo que se sabe y lo que no:

- **No se sabe si es una regresión de esta tanda.** Esta tanda **no toca** la estenosis aórtica:
  tocó las notas de la estenosis **mitral**, Fontan, el globo `tavi-calc`, la ficha `ref-ia` y la
  nota del ramal mecánico de la prótesis **mitral**. El A/B del papel y las tres sondas dieron
  **cero diferencias** en las superficies firmadas.
- **Cayó en el MISMO lote que los otros tres rojos conocidos**, y los límites de lote de esta
  corrida **no son los de la línea base**: la suite pasó de **779 a 783** casos con los cuatro
  nuevos, así que cada lote arranca en otro caso. Este archivo ya documenta que **TC-328 da rojo
  corrido solo y verde con sus vecinos**, porque su escena la siembran los casos que lo preceden.
  TC-358 puede ser exactamente eso, o no.

**Cómo caracterizarlo, antes de decidir nada** (es el procedimiento que manda esta casa, no una
sugerencia):

```bash
node scripts/test_clinico.mjs --solo TC-358                      # aislado
node scripts/test_clinico.mjs --solo TC-355,TC-356,TC-357,TC-358 # con sus vecinos, en el orden del archivo
```

y, si da intermitente, **cuatro corridas aisladas de cada lado** —sobre `934fcbf` y sobre
`ddcf42d`— antes de declararlo. **Si cae igual contra `ddcf42d`, es preexistente y no es de esta
tanda.** Ese es el control que falta.

**Para rehacer la suite entera** (una sola pasada, sin editar nada que la suite lea mientras
corre):

```bash
python3 - <<'EOF'
import re
s=open('scripts/test_clinico.mjs',encoding='utf-8').read()
ids=[]
for m in re.finditer(r"caso\('([^']+)'", s):
    if m.group(1) not in ids: ids.append(m.group(1))
open('/tmp/p27_lotes.txt','w').write('\n'.join(','.join(ids[i:i+55]) for i in range(0,len(ids),55))+'\n')
print(len(ids),'casos distintos, en el ORDEN DEL ARCHIVO')
EOF
```

y después un lote por línea, verificando `DISK_IMG` entre lotes. Son **783** casos distintos en
**15** lotes.

### 3.2 · El barrido de mutaciones, sobre el árbol sellado

```bash
git worktree add --detach <ruta-temporal> 934fcbf
cp scripts/test_clinico.mjs <ruta-temporal>/scripts/test_clinico.mjs
python3 scripts/_mut_pant27.py <ruta-temporal> --anclas   # PRIMERO: las 40 anclas, una vez cada una
python3 scripts/_mut_pant27.py <ruta-temporal>            # el barrido, ~2,5 min
```

Dio **40/40 muertas** sobre `dbdb6a4`. Se espera lo mismo.

### 3.3 · El A/B del papel, con PDF y PPT generados de verdad

El arnés **ya está escrito y parsea**: `scripts/_probe_pant27ab.mjs` (**sin versionar todavía**,
ver § 4). Trae las **121** escenas acumuladas más **cuatro propias de esta tanda** —`p27emNoReum`,
`p27emReum`, `p27iaRev` y `p27vmMecTr`—, porque ninguna de las 121 carga una estenosis mitral
nativa con etiología no reumática ni una insuficiencia aórtica con reverso consignado.

```bash
git show ddcf42d:index.html > .p27tmp/index_head.html     # la copia va DENTRO del proyecto
node scripts/_probe_pant27ab.mjs --file <ruta>/.p27tmp/index_head.html --out /tmp/ab_p27_head.json
node scripts/_probe_pant27ab.mjs --out /tmp/ab_p27_nuevo.json
node scripts/_ab_pant24diff.mjs /tmp/ab_p27_head.json /tmp/ab_p27_nuevo.json
```

**Esta tanda no autoriza NINGUNA diferencia de superficie firmada**: el resultado esperado es
**cero** en informe, EN SUMA, Excel, Laboratorio, PDF y PPT.

⚠️ **El cero de ese arnés sigue siendo un CONTROL para la oración del trombo**, y está escrito en
su cabecera: lo contestado en el panel vive en `_indClin`, que es memoria del panel y no un
campo, así que ese arnés no puede llegar hasta ahí. Lo que la prueba son **TC-768** y
`scripts/_probe_pant27tromb.mjs`.

### 3.4 · Chrome y WebKit — los dieciséis cruces

El arnés **ya está escrito y parsea**: `scripts/_probe_pant27motores.mjs` (**sin versionar
todavía**). Dos motores × 1440, 1000, 768 y 390 px × tema día y noche.

```bash
node scripts/_probe_pant27motores.mjs --out /tmp/p27motores.json
```

Mide por cruce: las siete frases de la estenosis mitral en el detalle plegado, la fila de Fontan
con la frase nueva y sin el rótulo huérfano, el globo abierto por su botón con su caja, el bloque
del reverso en `ref-ia`, el desplazamiento horizontal, los textos recortados y los errores de
consola y de página. **WebKit de Playwright no es Safari, y el arnés lo declara.**

### 3.5 · El celular

```bash
node scripts/check_mobile.js
```

Línea base que **no puede empeorar**: **59** hallazgos a 360 px y **67** a 390, con **18 ALTA**
en cada ancho. Esta tanda no toca un solo estilo, así que se espera la línea base exacta.

### 3.6 · El reporte final y la guía de prueba

La guía ya está escrita, en **`docs/GUIA_PRUEBA_PANT27.md`**: ocho pasos y las **cinco** cosas
que esperan decisión del médico. Falta **pegarla en el chat** y escribir el reporte final con las
mediciones de § 3.1 a § 3.5.

---

## 4 · Dos archivos que quedaron SIN VERSIONAR, y hay que mirarlos

`scripts/_probe_pant27ab.mjs` y `scripts/_probe_pant27motores.mjs` están escritos, **parsean con
`node --check`** y **todavía no se corrieron ni una vez**. Se versionan en el commit de este
documento para que no se pierdan, pero **lo que miden no está medido**: la primera corrida de un
arnés nuevo es la que destapa los denominadores vacíos, y en esta misma tanda las tres sondas que
sí corrieron pagaron cinco. **Tratarlos como borrador hasta que corran.**

Lo que esta tanda ya aprendió de esos cinco, y conviene mirar primero en estos dos:

- **`showTab` no le da caja a la tarjeta del globo**: el campo vive en `ete-seccion-tavi`, que
  nace cerrada. Hay que abrir la pestaña **y** la sección.
- **El nodo de una fila del panel se destruye al contestar**: los botones se buscan **en vivo** en
  cada vuelta, o los dos clics caen en un árbol desprendido y las dos respuestas salen idénticas.
- **La trombosis no es un campo del estudio**: es la pregunta `protm.tromb` del panel, que se
  contesta por `data-ind-clin` y `data-ind-val`.
- **La sección de prótesis mitral sale temprano sin `protm.peri` contestada**.
- **Las expresiones viejas del reverso se cuentan DENTRO del bloque**, no en la ficha entera: el
  párrafo de arriba, que esta tanda no toca, cita a la ESC con «Holodiastolic flow reversal in
  descending aorta».

---

## 5 · Lo que quedó PARADO, esperando decisión del médico

Está entero en **`docs/PENDIENTES.md` → P27-a**. En una línea cada uno:

1. **Las otras dos apariciones del trombo** —las preguntas de la prótesis **aórtica** y de la
   **tricúspide**— no están acotadas por tipo de prótesis, así que la oración **no se sumó ahí**.
2. **La nota del reverso en la Evidencia** (no la ficha) sigue diciendo «la Tabla 20-5 del libro
   de texto» y «Sin la duración consignada»: las dos superficies ahora **divergen**.
3. **La nota hermana de T2, la de etiología reumática**, compara dos fuentes y no estaba en la
   lista de los catorce, así que no se tocó.
4. **Cuatro frases más del globo `tavi-calc`** dicen lo que las fuentes no publican o muestran
   una diferencia sin resolver.
5. **El registro `FON_PREG` está escrito sin tildes** en sus trece entradas, y la frase nueva
   también, por la instrucción específica de la orden para ese lugar.

---

## 6 · Al retomar, los primeros tres pasos

1. `git log --oneline ddcf42d..HEAD` — tienen que ser **6**: los **5** de la tanda, con
   `934fcbf` (`PANT27-5`) al tope de los de código, más el de este documento, que no toca
   `index.html`.
2. `md5 -q index.html` — tiene que dar **`a14c45a0...`**, y el sello del pie **`v20261109-1203`**.
   Si no coinciden, **parar**: alguien tocó el archivo y hay que medir antes de seguir.
3. Verificar que **`DISK_IMG` esté montado** antes de la suite. Sin él, los 17 casos que dependen
   del pendrive **no prueban nada** y hay que decirlo al reportar el total.

Y después, § 3.1 en adelante, en ese orden.

---

## 7 · Lo que esta sesión borró de sus propios temporales

Se borró `.p27tmp/`, que era la copia sellada de `ddcf42d:index.html` para el A/B y las dos
imágenes de la hoja 64 renderizadas a 300 ppp. **Se rehace en un comando** (§ 3.3). Los worktrees
de verificación vivían fuera del proyecto y se limpian con `git worktree prune`.

**No se tocó** `main.vacio`, ni `Estructura de la app/`, ni `docs/3d/`, ni ningún `*_aprobado` sin
versionar.
