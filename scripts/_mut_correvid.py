#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_correvid.py - barrido de MUTACIONES DIRIGIDAS de la TANDA CORR-EVID (2026-11-02).

Cada mutacion revierte UNA de las cosas que esta tanda cambio -o la aplica DE MAS- sobre el
index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_correvid.py              # todas
  python3 scripts/_mut_correvid.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los cuatro por cada una: TC-609 cubre el EN SUMA
de la valvula reparada, TC-610 la regla «una pregunta, una guia», TC-611 que nada de la
Evidencia llegue al papel y TC-612 los simbolos del dibujo y el rotulo de la miocardiopatia
hipertrofica. Una mutacion del EN SUMA que pusiera rojo a TC-610 estaria diciendo que el
reparto esta mal, no que la cobertura exista.

CUATRO DE LAS DIECISEIS NO REVIERTEN NADA: LA APLICAN DE MAS. La 05 hace que la linea del
resumen tome tambien las protesis -que ya tienen la suya y saldrian dos veces-, la 09 que la
frase de «sin dato» salga tambien con la pregunta contestada, la 12 que una linea de referencia
cuelgue de una pregunta regida por la guia anterior -o sea que se refiera a si misma- y la 15
que el panel deje de publicar la clase, que es el CONTROL POSITIVO de TC-611. Existen porque
las condiciones que las matan son controles negativos y denominadores, y un control negativo
que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)
MUT = [
 # == COMMIT 1 . el EN SUMA de la valvula reparada ==========================================
 ('01 la linea de la valvula reparada no se emite nunca', 'TC-609',
  "  const rot = Object.prototype.hasOwnProperty.call(m, tc) ? m[tc] : '';",
  "  const rot = '';"),

 ('02 la linea suelta de la insuficiencia MITRAL vuelve a repetirse', 'TC-609',
  "    if (!_vmRepSuma) {",
  "    if (true) {"),

 ('03 la linea suelta de la insuficiencia TRICUSPIDEA vuelve a repetirse', 'TC-609',
  "      if (!_vtRepSuma && hayIT) suma.push(itG > 0 ? `IT ${imTxt[itG]}.` : 'IT presente.');",
  "      if (hayIT) suma.push(itG > 0 ? `IT ${imTxt[itG]}.` : 'IT presente.');"),

 ('04 el rotulo corto de la mitral se confunde con el de la tricuspide', 'TC-609',
  "  vm_morf: Object.freeze({ sigla: 'VM', plastia: 'plastia', teer: 'TEER' }),",
  "  vm_morf: Object.freeze({ sigla: 'VM', plastia: 'plastia', teer: 'T-TEER' }),"),

 # ⚠️ ROMPE LAS DOS MITADES A LA VEZ, y la primera version SOBREVIVIO por eso. El filtro por
 # tipo y el fail-closed de `rot` se tapan mutuamente: aflojando solo el filtro, «Protesis
 # mecanica» da tc='mec', la tabla no tiene esa clave y `rot` queda vacio, asi que la funcion
 # devuelve '' igual y no se inyecta ningun defecto. Es la leccion del D-11 con `data-espejo`.
 ('05 DE MAS: la linea del resumen toma tambien las protesis, que ya tienen la suya', 'TC-609',
  [("  if (tc !== 'plastia' && tc !== 'teer') return '';", "  if (!tc) return '';"),
   ("  vm_morf: Object.freeze({ sigla: 'VM', plastia: 'plastia', teer: 'TEER' }),",
    "  vm_morf: Object.freeze({ sigla: 'VM', plastia: 'plastia', teer: 'TEER', mec: 'prótesis mecánica', bio: 'prótesis biológica' }),")]),

 ('06 la insuficiencia deja de entrar en la linea de la mitral', 'TC-609',
  "      ? valvRepSuma('vm_morf', vmMorf,\n          [(imG > 0 || insE) ? 'insuficiencia' + (imG > 0 ? ' ' + imTxt[imG] : '') : ''])",
  "      ? valvRepSuma('vm_morf', vmMorf, [])"),

 # == COMMIT 4 . el molde de «una pregunta, una guia» =======================================
 ('07 la nota deja de nombrar la guia que rige', 'TC-610',
  "  if (g) partes.push(g + (p.rec ? ' · ' + p.rec : ''));",
  "  if (g) partes.push(p.rec ? String(p.rec) : '');"),

 ('08 la linea de referencia de la otra guia desaparece', 'TC-610',
  "  if (p.ref) partes.push('ESC 2020 (anterior): ' + p.ref);",
  "  if (false && p.ref) partes.push('ESC 2020 (anterior): ' + p.ref);"),

 ('09 DE MAS: la frase de «sin dato» sale tambien con la pregunta contestada', 'TC-610',
  "  if (sinDato) partes.push('Sin dato no cuenta como «no»",
  "  if (true) partes.push('Sin dato no cuenta como «no»"),

 ('10 una pregunta mezcla los cortes de las DOS guias en su recomendacion', 'TC-610',
  "{ clave:'tga.ev.htp', lbl:'Hipertensión pulmonar', guia:'acc', rec:'Clase 1 · Nivel B-NR, recomendación 3",
  "{ clave:'tga.ev.htp', lbl:'Hipertensión pulmonar', guia:'acc', rec:'ESC 2020, Clase I · C y Clase 1 · Nivel B-NR, recomendación 3"),

 ('11 una pregunta pierde la declaracion de su guia', 'TC-610',
  "{ clave:'cia.ev.eisen', lbl:'Fisiología de Eisenmenger', guia:'acc'",
  "{ clave:'cia.ev.eisen', lbl:'Fisiología de Eisenmenger', guia:'ninguna'"),

 ('12 DE MAS: una linea de referencia cuelga de una pregunta regida por la guia ANTERIOR', 'TC-610',
  "{ clave:'cia.ev.anciano', lbl:'Paciente de edad avanzada no apto para el cierre con dispositivo', guia:'esc'",
  "{ clave:'cia.ev.anciano', lbl:'Paciente de edad avanzada no apto para el cierre con dispositivo', guia:'esc', ref:'se refiere a si misma'"),

 ('13 la guia nueva sale del registro de citas', 'TC-610',
  "  { k:'acc2025achd',",
  "  { k:'acc2025achdXX',"),

 ('14 las tablas de preguntas dejan de poder medirse', 'TC-610',
  "window.TGA_IND_PREG = TGA_IND_PREG;",
  "/* window.TGA_IND_PREG = TGA_IND_PREG; */"),

 # == COMMITS 5 a 7 . el papel =============================================================
 # ⚠️ LA PRIMERA VERSION ESTABA MAL ESCRITA Y SOBREVIVIO: definia una funcion de recorte y no
 # la usaba en ningun lado, asi que no inyectaba ningun defecto. Lo que hace falta es vaciar
 # los bloques del panel, que es donde viven la clase y el folio que TC-611 usa como CONTROL
 # POSITIVO -sin ese control, su «cero marcadores en el papel» no distingue «el papel esta
 # limpio» de «no hay nada escrito en ninguna parte»-.
 ('15 DE MAS: el panel se queda sin sus bloques, o sea sin el CONTROL POSITIVO', 'TC-611',
  "  return { filas: filas,\n    clinica: clinica.length ? clinica : null,\n    bloques: bloques,",
  "  return { filas: filas,\n    clinica: clinica.length ? clinica : null,\n    bloques: [],"),

 # == EL DIBUJO Y EL ROTULO DE LA MIOCARDIOPATIA ===========================================
 ('16 el TEER se dibuja como una protesis biologica', 'TC-612',
  "  if (t.indexOf('TEER') === 0) return 'teer';",
  "  if (t.indexOf('TEER') === 0) return 'bio';"),

 ('17 los velos del TEER vuelven a ser los de la biologica', 'TC-612',
  "  if (bio === 'teer') {",
  "  if (false) {"),

 ('18 el rotulo de la miocardiopatia hipertrofica vuelve a la edicion 2020', 'TC-612',
  "AHA/ACC 2024 · factores mayores",
  "AHA/ACC 2020 · factores mayores"),
]


def correr(caso):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    nE = len(re.findall(r'excepcion', out))
    if rojo and rojo.group(1) == '0':
        if nC == 0 and nE:
            return 'POR EXCEPCION', out[out.find('excepcion'):][:160]
        return 'MUERTA', '%s condicion(es) en rojo' % nC
    return 'SOBREVIVIO', out[out.find('RESULTADO'):][:200]


def main():
    solo = None
    for a in sys.argv[1:]:
        if a.startswith('--solo'):
            v = a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]
            solo = set(int(x) for x in v.replace(',', ' ').split())
    orig = open(IDX, encoding='utf-8').read()
    m0 = md5(IDX)
    res = []
    try:
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom, caso = ent[0], ent[1]
            pares = ent[2] if isinstance(ent[2], list) else [(ent[2], ent[3])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c < 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr(caso)
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-13s %-6s %s  (%s)' % (i, v, caso, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for r in res if r[2] == 'MUERTA')
    print('\n  %d/%d MUERTAS' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('  !! %02d %s -> %s %s' % (i, nom, v, det[:200]))
    return 0 if muertas == len(res) else 1


if __name__ == '__main__':
    sys.exit(main())
