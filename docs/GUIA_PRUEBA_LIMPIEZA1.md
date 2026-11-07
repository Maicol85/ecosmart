# Guia de comprobacion — tanda LIMPIEZA-1 (2026-11-08)

Ocho pasos, cada uno con una linea de que hace el comando. Se corren desde
`~/Desktop/APLICACIONES/ecosmart`. Ninguno escribe nada: todos leen.

## 1 · Cuanto pesa ahora lo que Code carga al arrancar

Mide los dos archivos que se leen en cada sesion. Antes sumaban 1.887.757 B; ahora, 1.035.182 —unos 259.000 tokens contra 472.000—.

```bash
wc -c CLAUDE.md docs/PENDIENTES.md
```

## 2 · El indice de CLAUDE.md, y que nombra solo archivos que existen

Lo primero imprime el bloque «Donde esta cada cosa»; lo segundo comprueba, uno por uno, que
cada archivo que ese bloque nombra existe.

```bash
sed -n '1,36p' CLAUDE.md
```

```bash
ls -l CLAUDE.md docs/PENDIENTES.md docs/INVENTARIO_LIMPIEZA_L1.md docs/HISTORIAL_CLAUDE.md docs/archivo/CLAUDE_HISTORIAL_TANDAS.md docs/archivo/PENDIENTES_CERRADOS.md
```

## 3 · Un id archivado aparece en UN solo archivo

Busca un id cerrado en los dos archivos de pendientes: tiene que salir **solo** en el archivo
de cerrados. Y el encabezado de una decision pendiente, **solo** en `docs/PENDIENTES.md`.
(Se compara entre esos dos y no contra `CLAUDE.md`: ahi los ids aparecen como prosa, nombrados
por la seccion de la tanda que los declaro, y eso es lo que corresponde.)

```bash
grep -rln "W1-2 ·" docs/PENDIENTES.md docs/archivo/PENDIENTES_CERRADOS.md
```

```bash
grep -rlnE "^## P22-a" docs/PENDIENTES.md docs/archivo/PENDIENTES_CERRADOS.md
```

## 4 · El sello sigue en CLAUDE.md y coincide con el pie de index.html

Es el chequeo de arranque, que es manual: las dos lineas tienen que decir `v20261107-1137`.

```bash
grep -n 'v20261107-1137' CLAUDE.md | head -2 && grep -o 'id="eco-build-sello">[^<]*' index.html
```

## 5 · Que tandas quedaron y cuales se archivaron

La primera lista tiene que dar **tres** —PANT-22, PANT-21 y PANT-20—; la segunda, **55**.
Tres mas cincuenta y cinco son las **58** que `CLAUDE.md` tenia.

```bash
grep -nE '^### .*«' CLAUDE.md
```

```bash
grep -cE '^### .*«' docs/archivo/CLAUDE_HISTORIAL_TANDAS.md
```

## 6 · Reconstruir los dos originales y comparar el md5

Es la comprobacion que importa: toma del manifiesto cada rango de su archivo destino, excluye
las lineas que la tanda escribio —las que van entre `<!-- L1:INDICE -->` y `<!-- /L1:INDICE -->`—
y rearma cada original. Tiene que imprimir **OK** y los dos md5 de `git show 8da375b:`. Con
`--neg` cambia un byte y tiene que imprimir **FALLA**: eso es lo que prueba que la comprobacion
distingue.

```bash
python3 - <<'PY'
import io,os,re,subprocess,hashlib,sys
RAIZ=os.getcwd(); INV='docs/INVENTARIO_LIMPIEZA_L1.md'
A,C='<!-- L1:INDICE -->','<!-- /L1:INDICE -->'
NEG='--neg' in sys.argv
m=re.search(r'```l1-manifiesto\n(.*?)\n```',io.open(INV,encoding='utf-8').read(),re.S)
org=None; md5s={}; nl={}; filas=[]
for ln in m.group(1).split('\n'):
    ln=ln.strip()
    if not ln or ln.startswith('#'): continue
    g=re.match(r'^(\S+) md5=([0-9a-f]{32}) lineas=(\d+)$',ln)
    if g: org=g.group(1); md5s[org]=g.group(2); nl[org]=int(g.group(3)); continue
    p=[x.strip() for x in ln.split('|')]; a,z=p[1].split('-')
    filas.append((p[0],int(a),int(z),p[2]))
def limpio(L):
    out=[]; s=False
    for x in L:
        t=x.strip()
        if t==A: s=True; continue
        if t==C: s=False; continue
        if not s: out.append(x)
    return out
ok=True
for o in sorted(md5s):
    mios=sorted([f for f in filas if f[0]==o],key=lambda f:f[1])
    cont={}; 
    for d in set(f[3] for f in mios):
        cont[d]=limpio(io.open(d,encoding='utf-8').read().split('\n'))
    cur=dict((d,0) for d in cont); re_=[]
    for _,a,z,d in mios:
        n=z-a+1; re_.extend(cont[d][cur[d]:cur[d]+n]); cur[d]+=n
    sob=sum(len(cont[d])-cur[d] for d in cont)
    txt='\n'.join(re_)
    if NEG: txt=txt.replace('a','A',1)
    got=hashlib.md5(txt.encode('utf-8')).hexdigest()
    ref=hashlib.md5(subprocess.check_output(['git','show','8da375b:'+o])).hexdigest()
    bien=(got==ref==md5s[o] and sob==0)
    ok=ok and bien
    print(('OK  ' if bien else 'MAL ')+o+'  reconstruido='+got+'  HEAD='+ref+'  sobran='+str(sob))
print('RESULTADO: '+('OK' if ok else 'FALLA'))
PY
```

## 7 · El caso que lo cubre

`TC-753` comprueba el indice, el sello, el renglon de tamano, que los dos archivos de
`docs/archivo/` existan y no esten vacios, y trae su propio control negativo con un nombre
inventado. Tiene que dar **1/1**.

```bash
node scripts/test_clinico.mjs --solo TC-753
```

## 8 · Las decisiones del medico siguen abiertas

Las diez que la orden nombra tienen que seguir en `docs/PENDIENTES.md`. La salida tiene que
listar **once** renglones y no diez: `P22-a` tiene ademas su «(continuacion)», que es como
estaba. Ninguna puede aparecer en `docs/archivo/`.

```bash
grep -nE '^## (P18-b|P18-d|P20-a|P20-b|P20-c|P21-a|P21-b|P21-c|P22-a|P22-b) ' docs/PENDIENTES.md
```
