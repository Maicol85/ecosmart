#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pr5.py — barrido de MUTACIONES DIRIGIDAS de la tanda PR5 (2026-11-23).

Cada mutacion revierte UNA de las cosas que los dos commits de codigo cambiaron —o la aplica DE
MAS— sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.
Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_pr5.py              # todas
  python3 scripts/_mut_pr5.py --solo 1,2   # algunas
  python3 scripts/_mut_pr5.py --anclas     # SOLO verifica que las 16 anclas emparejen

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba su
md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y la
medicion siguiente se hace sobre un archivo envenenado.

EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay ningun
signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
cobertura». Sin esa linea el veredicto es NO CORRIO.

LAS ANCLAS SE VERIFICAN ANTES DE CORRER (--anclas), que es lo que PANT-19 pago con siete anclas
que no aplicaron por escribirlas con secuencias de escape en vez del caracter real.

TRES DE LAS DIECISEIS NO REVIERTEN NADA: LA APLICAN DE MAS. La 07 deja que un diametro fuera de
rango plausible produzca una diferencia, la 08 manda la frase del esperado tambien al EN SUMA y
la 14 pega una clase junto al umbral de 15 mmHg. Existen porque las condiciones que las matan son
CONTROLES NEGATIVOS, y un control negativo que ninguna mutacion puede romper no prueba nada.

LA 03 NO PUEDE SER «MFS_Z_SEE = 0.261 escrito a mano»: esa mutacion seria EQUIVALENTE, porque la
condicion compara los VALORES y los dos darian 0.261. Para que el dueno unico este de verdad
cubierto hay que moverle el valor, que es lo que hace.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, caso, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── TAREA 1 · la ecuacion y sus duenos ─────────────────────────────────────────
 ('01 el coeficiente de la edad pasa de 0.090 a 0.100 por decada', 'TC-1029',
  "  return 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.267 * (sx === 'M' ? 1 : 2);",
  "  return 2.423 + 0.100 * (edad / 10) + 0.461 * bsa - 0.267 * (sx === 'M' ? 1 : 2);"),

 ('02 el desvio de la estimacion pasa de 0.261 a 0.300 cm', 'TC-1029',
  "const AOR_DEV_SEE      = 0.261;",
  "const AOR_DEV_SEE      = 0.300;"),

 ('03 el desvio de Marfan deja de leer su dueno y se escribe aparte', 'TC-1029',
  "var MFS_Z_SEE      = AOR_DEV_SEE;",
  "var MFS_Z_SEE      = 0.262;"),

 ('04 la superficie de DuBois de Marfan deja de leer su dueno', 'TC-1029',
  "function mfsZBsaDuBois(peso, talla) { return aorBsaDuBois(peso, talla); }",
  "function mfsZBsaDuBois(peso, talla) { return (peso > 0 && talla > 0) ? 0.007184 * Math.pow(talla, 0.730) * Math.pow(peso, 0.425) : null; }"),

 ('05 el coeficiente del sexo pasa de 0.267 a 0.200', 'TC-1029',
  "  return 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.267 * (sx === 'M' ? 1 : 2);",
  "  return 2.423 + 0.090 * (edad / 10) + 0.461 * bsa - 0.200 * (sx === 'M' ? 1 : 2);"),

 # ── TAREA 1 · las condiciones en que NO se publica ─────────────────────────────
 ('06 la edad minima baja de 15 a 0: el calculo sale en un menor', 'TC-1030',
  "const AOR_DEV_EDAD_MIN = 15;",
  "const AOR_DEV_EDAD_MIN = 0;"),

 ('07 DE MAS: un diametro fuera de rango plausible produce una diferencia', 'TC-1030',
  "  const medMm = (p && p.val != null && !p.fuera) ? p.val : null;",
  "  const medMm = (p && p.val != null) ? p.val : (nv('ao_sin'));"),

 ('08 DE MAS: la frase del esperado tambien sube al EN SUMA', 'TC-1031',
  "      inf.push('Senos de Valsalva ' + aorEspMmTxt(_esp.medMm) + ' mm (esperado '\n        + aorEspMmTxt(_esp.espMm) + ' mm para edad, sexo y superficie corporal).');",
  "      inf.push('Senos de Valsalva ' + aorEspMmTxt(_esp.medMm) + ' mm (esperado '\n        + aorEspMmTxt(_esp.espMm) + ' mm para edad, sexo y superficie corporal).');\n      suma.push('Senos de Valsalva ' + aorEspMmTxt(_esp.medMm) + ' mm (esperado '\n        + aorEspMmTxt(_esp.espMm) + ' mm para edad, sexo y superficie corporal).');"),

 ('09 el esperado del papel deja de salir de su dueno y se redondea a entero', 'TC-1031',
  "        + aorEspMmTxt(_esp.espMm) + ' mm para edad, sexo y superficie corporal).');",
  "        + String(Math.round(_esp.espMm)) + ' mm para edad, sexo y superficie corporal).');"),

 ('10 la oracion del esperado no se emite nunca', 'TC-1031',
  "    if (_esp && _esp.medMm != null) {",
  "    if (false && _esp && _esp.medMm != null) {"),

 # ── TAREA 1 · el globo y Referencias ──────────────────────────────────────────
 ('11 al bloque de la ESC 2024 se le cae el folio de la Tabla 3', 'TC-1032',
  "       + 'Clase IIa \\u00b7 Nivel B, Tabla 3, folio 3565). Define la dilataci\\u00f3n a\\u00f3rtica como un '",
  "       + 'Clase IIa \\u00b7 Nivel B, Tabla 3). Define la dilataci\\u00f3n a\\u00f3rtica como un '"),

 ('12 Referencias deja de publicar las tres posturas', 'TC-1032',
  "      _aorDevEvidPintar(_fr, false);",
  "      if (false) _aorDevEvidPintar(_fr, false);"),

 ('13 el globo deja de publicar las tres posturas', 'TC-1032',
  "  _aorDevEvidPintar(fr, true);",
  "  if (false) _aorDevEvidPintar(fr, true);"),

 # ── TAREA 3 · el cor triatriatum ──────────────────────────────────────────────
 ('14 el folio del umbral vuelve a e164', 'TC-1033',
  "aparece en el texto de apoyo de la recomendaci\\u00f3n de resecci\\u00f3n en el paciente asintom\\u00e1tico (folio e165) y no lleva clase ni nivel propios.",
  "aparece en el texto de apoyo de la recomendaci\\u00f3n de resecci\\u00f3n en el paciente asintom\\u00e1tico (folio e164) y no lleva clase ni nivel propios."),

 ('15 DE MAS: se le pega una clase al umbral de 15 mmHg', 'TC-1033',
  "y por Doppler no invasivo, pero LO PRESENTA COMO UN UMBRAL PROPUESTO PREVIAMENTE",
  "y por Doppler no invasivo (clase 2a, nivel C-LD), pero LO PRESENTA COMO UN UMBRAL PROPUESTO PREVIAMENTE"),

 # ── TAREA 2 · las tres colas ──────────────────────────────────────────────────
 ('16 vuelve la cola del score de calcio por TAC', 'TC-1034',
  "        inf.push(`Estenosis aórtica severa por AVA, de bajo flujo y bajo gradiente paradojal${_d}.` + _cercaDelBorde);",
  "        inf.push(`Estenosis aórtica severa por AVA, de bajo flujo y bajo gradiente paradojal${_d}. `\n          + `Considerar score de calcio valvular por TAC para confirmar severidad.` + _cercaDelBorde);"),

 # MAL ESCRITA EN EL PRIMER BARRIDO Y REESCRITA: cambiaba «bajo gradiente.» por «bajo gradiente de
 # todas formas.», o sea le AGREGABA palabras sin quitar la frase que la condicion busca -«No
 # configura la forma cl...»-, asi que era EQUIVALENTE y sobrevivio. Hoy quita la descripcion
 # entera, que es lo que (C4) vigila.
 ('17 se cae la descripcion «No configura la forma clasica», que SI se conserva', 'TC-1034',
  "          + `sin bajo flujo por volumen latido indexado. No configura la forma cl\u00e1sica de bajo flujo / `",
  "          + `sin bajo flujo por volumen latido indexado. `"),

 ('18 vuelve la cola de la medicion del TSVI', 'TC-1034',
  "        inf.push(`Estenosis aórtica severa por AVA con bajo gradiente y flujo normal${_d}.` + _cercaDelBorde);",
  "        inf.push(`Estenosis aórtica severa por AVA con bajo gradiente y flujo normal${_d}. `\n          + `Considerar medición incorrecta del TSVI o pseudo-severidad.` + _cercaDelBorde);"),

 # ── TC-516 adaptado · que la (h5) afinada SIGA detectando una nota interna ─────
 # La adaptacion de PR5 saco TODO y FIXME de la expresion insensible a mayusculas, porque
 # emparejaban con «metodos» y con «sobre todo». Esta mutacion mete un TODO DE VERDAD en el
 # bloque nuevo de la ficha de aorta y exige que el caso lo cace: sin ella, «el caso quedo mas
 # fuerte» seria una afirmacion sin medir.
 ('19 DE MAS: una nota interna de verdad en la ficha nueva de aorta', 'TC-516',
  "    txt: 'La poblaci",
  "    txt: 'TODO: revisar con Maicol. La poblaci"),
]

def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion:', out))
    if rojo and rojo.group(1) == '0':
        if nE and not nC:
            return 'MUERTA(EXC)', 'cayo por EXCEPCION y no por condiciones'
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]

def main():
    solo = None
    soloAnclas = '--anclas' in sys.argv
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    print('  md5 del arbol: %s' % m0[:8])
    malas = [(i, n) for i, (n, c, v, _) in enumerate(MUT, 1) if orig.count(v) != 1]
    for i, n in malas:
        print('  %02d  ANCLA x%d  %s' % (i, orig.count(MUT[i-1][2]), n))
    print('  anclas que emparejan exactamente una vez: %d/%d' % (len(MUT) - len(malas), len(MUT)))
    if soloAnclas:
        return 0 if not malas else 1
    bak = tempfile.mktemp(suffix='.html'); shutil.copy2(IDX, bak)
    res = []
    try:
        for i, (nom, caso, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            if orig.count(viejo) != 1:
                res.append((i, nom, caso, 'NO APLICA', 'apariciones: %d' % orig.count(viejo)))
                print('  %02d  NO APLICA  %s' % (i, nom), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, caso, v, det))
            print('  %02d  %-11s %s  [%s]  —  %s' % (i, v, nom, caso, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[3].startswith('MUERTA'))
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, caso, v, det in res:
        if not v.startswith('MUERTA'):
            print('    ⚠️ %02d %s %s [%s] — %s' % (i, v, nom, caso, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
