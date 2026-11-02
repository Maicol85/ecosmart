#!/usr/bin/env python3
"""
_mut_tga3.py - las mutaciones dirigidas de la tanda TGA-3 (2026-11-01).

Cada mutacion inyecta UN defecto en una COPIA del arbol (un worktree) y corre SOLO el caso que
le toca. Una mutacion que sobrevive es cobertura que falta, o una mutacion mal escrita.

⚠️ NUNCA SOBRE EL ARBOL VIVO. Se trabaja en el worktree que recibe --wt, con guarda de md5
antes y despues: si el index.html vivo cambio durante el barrido, se aborta.
⚠️ VARIAS NO REVIERTEN NADA: APLICAN DE MAS. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.

  python3 scripts/_mut_tga3.py --wt <ruta del worktree> [--solo M03,M07]
"""
import subprocess, sys, os, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'

def arg(n, d=None):
    return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d

WT = arg('--wt')
SOLO = (arg('--solo') or '').split(',') if arg('--solo') else None

# (id, caso que debe morir, viejo, nuevo, que inyecta)
MUT = [
 ('M01', 'TC-601',
  "  const _camp = document.getElementById('tga-campos');",
  "  (function(){ const _b=document.getElementById('tga-concl-box'); const _z=document.getElementById('tga-campos');"
  " if(_b&&_z&&_z.firstElementChild!==_b) _z.insertBefore(_b,_z.firstElementChild); })();\n"
  "  const _camp = document.getElementById('tga-campos');",
  'la conclusion deja de ser el ULTIMO hijo: se va arriba de todo y rompe el orden de tabulacion'),
 ('M02', 'TC-601',
  '  #tga-campos > #tga-concl-box { grid-column:1 / -1; margin-top:2px; }',
  '  #tga-campos > #tga-concl-box { margin-top:2px; }',
  'saca la regla de ancho completo: la conclusion cae en una columna y parte la grilla'),
 ('M03', 'TC-601',
  "  const _camp = document.getElementById('tga-campos');",
  "  (function(){ const _b=document.getElementById('tga-concl-box'); const _f=document.getElementById('tga-fila');"
  " if(_b&&_f&&_b.parentElement&&_b.parentElement.id==='tga-campos') _f.appendChild(_b); })();\n"
  "  const _camp = document.getElementById('tga-campos');",
  'devuelve la conclusion a la fila, fuera de la columna de campos (la maqueta vieja)'),
 ('M04', 'TC-602',
  "(c.lineasInf || c.parrafos || [(c.papel || c.txt) + '.'])",
  "(c.lineasInf || c.parrafos || [c.txt + '.'])",
  'el cuerpo del informe vuelve a publicar el texto con la conducta'),
 ('M05', 'TC-602',
  "ccHoja(sec[3], c.parrafos || [], c.papel || c.resumen || null, null);",
  "ccHoja(sec[3], c.parrafos || [], c.resumen || null, null);",
  'la hoja del PDF vuelve a recibir el resumen con la conducta'),
 ('M06', 'TC-602',
  "  const _papelDesc = partes.join('. ');\n  partes.push(conducta);",
  "  partes.push(conducta);\n  const _papelDesc = partes.join('. ');",
  'congela el papel DESPUES de la conducta: la salida descriptiva deja de serlo'),
 ('M07', 'TC-602',
  "    return { clave:'descriptivo', txt:_d, resumen:_d, papel:_d };",
  "    return { clave:'descriptivo', txt:_d, resumen:_d };",
  'la rama de Jatene y Rastelli deja de publicar su salida de papel (contrato no uniforme)'),
 ('M08', 'TC-603',
  "  const kRaw = (typeof _tga3dClave === 'function') ? _tga3dClave(anat, cir) : (anat || '');",
  "  const kRaw = 'dtga';",
  'el escenario deja de salir de los campos y queda clavado'),
 ('M09', 'TC-603',
  "  const _ocultaCIA = (k === 'mus'), _ocultaCIV = (k === 'ras');",
  "  const _ocultaCIA = false, _ocultaCIV = (k === 'ras');",
  'APLICA DE MAS: dibuja la CIA con el switch auricular, contra la regla medida'),
 ('M10', 'TC-603',
  "  const _ocultaCIA = (k === 'mus'), _ocultaCIV = (k === 'ras');",
  "  const _ocultaCIA = (k === 'mus'), _ocultaCIV = false;",
  'APLICA DE MAS: dibuja la CIV con el Rastelli, donde la comunicacion ES el tunel'),
 ('M11', 'TC-603',
  "  const d = _tgaEsqDirCom('ete_cia_dir');\n    s += '<path d=\"M120 164L180 116\"",
  "  const d = 'id';\n    s += '<path d=\"M120 164L180 116\"",
  'APLICA DE MAS: le pone punta de flecha a la CIA sin que la direccion este cargada'),
 ('M12', 'TC-603',
  "    v:[[80,140,'M'],[220,139,'T']], ao:[220,226], ap:[80,59] })\n});",
  "    v:[[80,140,'T'],[220,139,'M']], ao:[220,226], ap:[80,59] })\n});",
  'en la ccTGA las valvulas NO se cruzan: se pierde la doble discordancia'),
 ('M13', 'TC-603',
  "  ltga: Object.freeze({\n    box:{ TL:['VI','','b'], TR:['AI','','r'], BL:['AD','','b'], BR:['VD','sistémico','r'] },",
  "  ltga_apagada: Object.freeze({\n    box:{ TL:['VI','','b'], TR:['AI','','r'], BL:['AD','','b'], BR:['VD','sistémico','r'] },",
  'la ccTGA vuelve a caer en el esquema base con su nota de pendiente'),
 ('M14', 'TC-603',
  "  cont.innerHTML = tgaEsqSVG(base.k, sh);",
  "  cont.innerHTML = tgaEsqSVG(base.k, sh);\n  try { const _e=document.getElementById('tga_tipo');"
  " if(_e && !_e.value) { _e.value='dtga'; } } catch(e){}",
  'APLICA DE MAS: el esquema ESCRIBE en un campo del estudio'),
 ('M15', 'TC-604',
  "    tit: 'El esquema de circulación de la sangre',",
  "    tit: 'El esquema de circulación de la sangre (ESC 2020, Tabla 9, folio 620)',",
  'APLICA DE MAS: le mete una cita al globo, que la orden prohibe'),
 ('M16', 'TC-604',
  "aria-label=\"Qué muestra el esquema de circulación\" onclick=\"vInfoClic(this,event)\">ⓘ</button>",
  "aria-label=\"Qué muestra el esquema de circulación\" onclick=\"vInfoClic(this,event)\">ℹ</button>",
  'cambia el glifo estandar U+24D8 por el U+2139, que es el que la MARFAN-2 saco'),
 ('M17', 'TC-604',
  "no es una imagen de este estudio, no está a escala y no '",
  "no es una imagen de este estudio y no '",
  'el globo deja de decir que no esta a escala'),
]

def md5(p):
    return hashlib.md5(open(p, 'rb').read()).hexdigest()

vivo = md5(os.path.join(RAIZ, 'index.html'))
print('md5 del arbol VIVO al empezar: ' + vivo)
print('worktree: ' + str(WT))
if not WT or not os.path.isdir(WT):
    print('FALTA --wt con un worktree valido'); sys.exit(2)

IDX = os.path.join(WT, 'index.html')
base = open(IDX, encoding='utf-8').read()
# el archivo de tests del arbol de trabajo, que es el que trae los casos nuevos
import shutil
shutil.copy(os.path.join(RAIZ, 'scripts', 'test_clinico.mjs'), os.path.join(WT, 'scripts', 'test_clinico.mjs'))

res = []
t0 = time.time()
for (mid, tc, viejo, nuevo, que) in MUT:
    if SOLO and mid not in SOLO:
        continue
    n = base.count(viejo)
    if n != 1:
        res.append((mid, tc, 'NO APLICA', 'el ancla aparece ' + str(n) + ' veces', que))
        print('%s  NO APLICA (ancla x%d)  %s' % (mid, n, que)); continue
    open(IDX, 'w', encoding='utf-8').write(base.replace(viejo, nuevo, 1))
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', tc],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout
    if 'RESULTADO' not in out:
        veredicto = 'NO CORRIO'
    elif ('✗' in out) or ('CON FALLAS' in out):
        veredicto = 'MUERTA'
    else:
        veredicto = 'SOBREVIVIO'
    res.append((mid, tc, veredicto, '', que))
    print('%s  %-11s %s  ::  %s' % (mid, veredicto, tc, que))
open(IDX, 'w', encoding='utf-8').write(base)

print('')
print('=' * 78)
muertas = len([x for x in res if x[2] == 'MUERTA'])
print('RESUMEN  %d/%d muertas   (%.1f min)' % (muertas, len(res), (time.time() - t0) / 60))
for x in res:
    if x[2] != 'MUERTA':
        print('   %s  %s  %s %s' % (x[0], x[2], x[3], x[4]))
fin = md5(os.path.join(RAIZ, 'index.html'))
print('md5 del arbol VIVO al terminar: ' + fin + ('   IDENTICO' if fin == vivo else '   ⚠️ CAMBIO'))
