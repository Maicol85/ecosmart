#!/usr/bin/env python3
"""
_mut_singrado.py — barrido de mutaciones TEMPORAL para la tanda
«valvulopatia consignada sin grado, leves y fundamento» (2026-10-03).

Cada mutacion se aplica sobre una COPIA del repo en /tmp, NUNCA sobre index.html.
El md5 del archivo vivo se compara antes y despues de cada corrida y el barrido ABORTA
si no coincide: un arnes que escribe sobre el archivo real es una maquina de deshacer
ediciones en silencio.

Se exige la linea RESULTADO en la salida antes de puntuar. Sin ella el veredicto es
NO CORRIO y no «sobrevivio»: si el suite no arranca, stdout queda vacio, no hay ningun
rojo y TODAS las mutaciones saldrian «sobrevivio», indistinguible de «no hay cobertura».
Eso ya reporto 7 falsos una vez.

Uso:  python3 scripts/_mut_singrado.py            # todas
      python3 scripts/_mut_singrado.py M4 M12      # algunas
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIVO = os.path.join(RAIZ, 'index.html')

def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()

# (id, descripcion, viejo, nuevo, casos que deben ponerse en ROJO)
MUT = [
 ('M1', 'mitral: se borra el escalon del boton en la ESTENOSIS',
  "const _emSinGrado = !estEGrado && !_emManual && _pillM('esten');",
  "const _emSinGrado = false && !estEGrado && !_emManual && _pillM('esten');",
  'TC-398,TC-390'),
 ('M2', 'mitral: se quita el gate de la marca manual en la ESTENOSIS (los estados 2 y 3 se unifican)',
  "const _emSinGrado = !estEGrado && !_emManual && _pillM('esten');",
  "const _emSinGrado = !estEGrado && _pillM('esten');",
  'TC-390,TC-398'),
 ('M3', 'mitral: se borra el escalon del boton en la INSUFICIENCIA',
  "const _imSinGrado = !(imG > 0) && !_imManual && _pillM('insuf');",
  "const _imSinGrado = false;",
  'TC-398,TC-390'),
 ('M4', 'aortica: se borra el escalon del boton en la ESTENOSIS',
  "const _eaSinGrado = !eaDesc && !esclerosis && !_eaManualS && _pillA('esten');",
  "const _eaSinGrado = false;",
  'TC-397'),
 ('M5', 'aortica: se quita el gate de la marca manual en la ESTENOSIS',
  "const _eaSinGrado = !eaDesc && !esclerosis && !_eaManualS && _pillA('esten');",
  "const _eaSinGrado = !eaDesc && !esclerosis && _pillA('esten');",
  'TC-397,TC-375'),
 ('M6', 'aortica: se borra el escalon del boton en la INSUFICIENCIA',
  "const _iaSinGrado = !(iaG > 0) && !_iaManualS && _pillA('insuf');",
  "const _iaSinGrado = false;",
  'TC-399,TC-375'),
 ('M7', 'EN SUMA: la EAo sin grado vuelve a la frase larga en vez de la sigla',
  "else if (estE) suma.push('EAo.');",
  "else if (estE) suma.push('Estenosis aortica.');",
  'TC-397'),
 ('M8', 'EN SUMA: la IAo sin grado vuelve a la frase larga',
  "else if (insE) suma.push('IAo.');",
  "else if (insE) suma.push('Insuficiencia aortica.');",
  'TC-399'),
 ('M9', 'EN SUMA: la EM sin grado vuelve a la frase larga',
  "else if (estE && !_vmProt && !_emSinVeredicto) suma.push('EM.');",
  "else if (estE && !_vmProt && !_emSinVeredicto) suma.push('Estenosis mitral.');",
  'TC-398,TC-390'),
 ('M10', 'mitral: la rama de valores medidos sin veredicto se cablea a estE (pierde el AVm medido)',
  "const _emSinVeredicto = !estEGrado && emCat.clave === 'nada' &&",
  "const _emSinVeredicto = !estE && emCat.clave === 'nada' &&",
  'TC-398'),
 ('M11', 'mitral: la rama de PROTESIS se cablea a estE (vuelve a graduar con cortes nativos)',
  "const _pE = [estEGrado, insE].filter(Boolean), _pC = [estCGrado, insC].filter(Boolean);",
  "const _pE = [estE, insE].filter(Boolean), _pC = [estC, insC].filter(Boolean);",
  'TC-398'),
 ('M12', 'leves: la EAo leve se vuelve a suprimir del EN SUMA',
  "if (eaDesc) suma.push(`EAo ${eaDesc}${_eaFundSumaG}.`); else if (estE) suma.push('EAo.');",
  "if (eaDesc && eaDesc !== 'leve') suma.push(`EAo ${eaDesc}${_eaFundSumaG}.`); else if (estE) suma.push('EAo.');",
  'TC-400'),
 ('M13', 'leves: la estenosis pulmonar leve se vuelve a suprimir',
  "if (epHay) suma.push(`Estenosis pulmonar ${epG.toLowerCase()}${epNivelTxt}.`);",
  "if (epHay && /moderada|severa/i.test(epG)) suma.push(`Estenosis pulmonar ${epG.toLowerCase()}${epNivelTxt}.`);",
  'TC-400,TC-51,TC-139'),
 ('M14', 'leves: la insuficiencia pulmonar leve se vuelve a suprimir',
  "        suma.push(`Insuficiencia pulmonar ${ipDesc}.`);",
  "        if (/moderada|severa/i.test(ipDesc)) suma.push(`Insuficiencia pulmonar ${ipDesc}.`);",
  'TC-400,TC-139'),
 ('M15', 'fundamento: sumaGrado queda vacio (el motivo no llega al EN SUMA)',
  "sumaGrado: (modsSuma.length ? ' ' + modsSuma.join(' y ') : ''), sumaSuelta: '' };",
  "sumaGrado: '', sumaSuelta: '' };",
  'TC-401'),
 ('M16', 'fundamento: la linea de Obstruccion subaortica no se empuja al EN SUMA',
  "if (_eaFund && _eaFund.sumaSuelta) suma.push(_eaFund.sumaSuelta);",
  "if (false && _eaFund && _eaFund.sumaSuelta) suma.push(_eaFund.sumaSuelta);",
  'TC-401'),
 ('M17', 'fundamento: la NOTA de texto libre se cuela al EN SUMA (que es lo prohibido)',
  "sumaGrado: (modsSuma.length ? ' ' + modsSuma.join(' y ') : ''), sumaSuelta: '' };",
  "sumaGrado: (modsSuma.length ? ' ' + modsSuma.join(' y ') : '') + parens, sumaSuelta: '' };",
  'TC-401'),

 ('M18', 'mitral: se saca la compuerta de PROTESIS del EN SUMA (el resumen afirma lo que el cuerpo calla)',
  "else if (estE && !_vmProt && !_emSinVeredicto) suma.push('EM.');",
  "else if (estE && !_emSinVeredicto) suma.push('EM.');",
  'TC-398'),
 ('M19', 'mitral: se saca la compuerta de «valores medidos sin veredicto» del EN SUMA',
  "else if (estE && !_vmProt && !_emSinVeredicto) suma.push('EM.');",
  "else if (estE && !_vmProt) suma.push('EM.');",
  'TC-398'),
 ('M20', 'aortica: se ENCIENDE el escalon que quedo en espera (debe poner TC-375 y TC-399 en rojo, y TC-397 en ▲)',
  "const EA_ESCALON_SIN_GRADO = false;",
  "const EA_ESCALON_SIN_GRADO = true;",
  'TC-375,TC-399'),
]

pedidos = [a for a in sys.argv[1:] if a.startswith('M')]
lista = [m for m in MUT if not pedidos or m[0] in pedidos]

sello = md5(VIVO)
print('md5 del archivo VIVO antes del barrido: %s' % sello)
orig = open(VIVO, encoding='utf-8').read()

# Una copia del repo por barrido, reusada: solo index.html cambia entre mutaciones.
base = tempfile.mkdtemp(prefix='ecomut-')
for sub in ('scripts', 'tests'):
    s = os.path.join(RAIZ, sub)
    if os.path.isdir(s):
        shutil.copytree(s, os.path.join(base, sub))
for f in ('version.json',):
    s = os.path.join(RAIZ, f)
    if os.path.isfile(s):
        shutil.copy2(s, base)
print('copia de trabajo: %s\n' % base)

filas = []
for mid, desc, viejo, nuevo, casos in lista:
    n = orig.count(viejo)
    if n != 1:
        filas.append((mid, 'NO APLICA', '%d coincidencias del patron (debe ser 1)' % n, desc))
        print('  %-4s NO APLICA — el patron aparece %d veces' % (mid, n))
        continue
    open(os.path.join(base, 'index.html'), 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', casos],
                       cwd=base, capture_output=True, text=True, timeout=1800)
    out = r.stdout + r.stderr
    m = re.search(r'RESULTADO: (\d+)/(\d+)(?:\s+—\s+(\d+) CON FALLAS)?', out)
    if not m:
        # Sin la linea RESULTADO el suite no corrio: no se puntua.
        filas.append((mid, 'NO CORRIO', (out.strip().splitlines() or ['(sin salida)'])[-1][:90], desc))
        print('  %-4s NO CORRIO (el suite no llego a reportar)' % mid)
        continue
    rojos = re.findall(r'^  (TC-\d+) .*✗$', out, re.M)
    espera = set(casos.split(','))
    cubiertos = espera & set(rojos)
    falta = espera - set(rojos)
    estado = 'MUERTA' if not falta else ('PARCIAL' if cubiertos else 'SOBREVIVIO')
    filas.append((mid, estado, 'rojos=%s · esperados=%s' % (','.join(rojos) or '-', casos), desc))
    print('  %-4s %-10s rojos: %s' % (mid, estado, ','.join(rojos) or '(ninguno)'))

ahora = md5(VIVO)
print('\nmd5 del archivo VIVO despues del barrido: %s' % ahora)
if ahora != sello:
    print('⚠️ ABORTA: el archivo vivo CAMBIO durante el barrido. No se puntua nada.')
    sys.exit(2)
print('✔ el archivo vivo no se toco\n')

print('%-5s %-11s %s' % ('MUT', 'VEREDICTO', 'QUE SE MUTO'))
for mid, est, diag, desc in filas:
    print('%-5s %-11s %s' % (mid, est, desc))
    print('%-17s %s' % ('', diag))
muertas = sum(1 for f in filas if f[1] == 'MUERTA')
print('\nRESUMEN: %d/%d mutaciones MUERTAS (todas sus casos esperados en rojo)' % (muertas, len(filas)))
malas = [f[0] for f in filas if f[1] in ('SOBREVIVIO', 'NO CORRIO', 'NO APLICA')]
if malas:
    print('⚠️ revisar: %s' % ', '.join(malas))
shutil.rmtree(base, ignore_errors=True)
sys.exit(1 if malas else 0)
