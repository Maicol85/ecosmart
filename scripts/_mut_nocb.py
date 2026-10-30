#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_nocb.py — barrido de MUTACIONES DIRIGIDAS de la TANDA NOCTURNA, Parte B (2026-10-30).

Cada mutacion revierte UNA de las cosas que los commits B1 a B3 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-552 se ponga ROJO.

  python3 scripts/_mut_nocb.py              # todas
  python3 scripts/_mut_nocb.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.
⚠️ TRES DE LAS DOCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 04 hace que el TRIV VOTE en la
   probabilidad de HTP, la 08 que un automatismo ESCRIBA el indice en el campo del estudio y la
   11 que el indice aparezca en el papel de CUALQUIER aortopatia y no solo en Turner. Existen
   porque las condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo que
   ninguna mutacion puede romper no esta probando nada.
⚠️ LA 02 ROMPE LAS DOS FILAS A LA VEZ. El texto del TRIV tiene UN dueno y DOS consumidores: una
   mutacion que toque un solo consumidor la tapa el otro, porque la condicion (A3) compara las
   dos filas entre si. Esta cambia el dueno, o sea las dos.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-552'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

MUT = [
 # ── B1 · el TRIV ────────────────────────────────────────────────────────────────
 ('01 el operador del TRIV deja de ser estricto: 75 pasa a llevar la aclaracion',
  "  const alto = r.triv > DT_TRIV_HTP_PANEL;",
  "  const alto = r.triv >= DT_TRIV_HTP_PANEL;"),

 ('02 el corte de pantalla se unifica con el del papel: las DOS filas cambian a la vez',
  "const DT_TRIV_HTP_PANEL = 75, DT_TDE_ACORT = 120;",
  "const DT_TRIV_HTP_PANEL = 60, DT_TDE_ACORT = 120;"),

 ('03 la fila nueva se dibuja siempre, tambien sin valor',
  "  const _hayTriv = (typeof _dtTrivRefTxt === 'function') && _dtTrivRefTxt() !== null;",
  "  const _hayTriv = true;"),

 ('04 DE MAS: el TRIV pasa a VOTAR en los signos indirectos con el corte de pantalla',
  "  const trivAlto = trivOk && triv > DT_TRIV_HTP;",
  "  const trivAlto = trivOk && triv > 40;"),

 ('05 el amarillo desaparece: el color deja de marcar el valor alto',
  "      el.style.color = t.alto ? 'var(--yellow)' : '';",
  "      el.style.color = '';"),

 ('06 la fila de VD/AD deja de pintarse: solo queda la de Doppler',
  "    _pinta('vd-triv-ref'); }",
  "    }"),

 # ── B2 · el indice ──────────────────────────────────────────────────────────────
 ('07 el indice vuelve a leerse del campo tipeado y deja de calcularse',
  """  const calc = aoIndexar(_n('marfan_ao_ascendente'), src);
  if (calc != null) return { val: calc, origen: 'calculado' };
  const guardado = _n('marfan_ita');
  return guardado != null ? { val: guardado, origen: 'guardado' } : null;""",
  """  const guardado = _n('marfan_ita');
  if (guardado != null) return { val: guardado, origen: 'guardado' };
  const calc = aoIndexar(_n('marfan_ao_ascendente'), src);
  return calc != null ? { val: calc, origen: 'calculado' } : null;"""),

 ('08 DE MAS: el recalculo ESCRIBE el indice calculado en el campo del estudio',
  """  { const ef = marfanItaEfectivo();
    const vv = document.getElementById('marfan-ita-val');""",
  """  { const ef = marfanItaEfectivo();
    { const _c = document.getElementById('marfan_ita');
      if (_c && ef && ef.origen === 'calculado') _c.value = String(Math.round(ef.val * 10) / 10); }
    const vv = document.getElementById('marfan-ita-val');"""),

 ('09 la columna del Excel vuelve a leer el campo crudo',
  """    'Marfan/EHAT índice tamaño aórtico (mm/m2)': (function(){
      const ef = (typeof marfanItaEfectivo === 'function') ? marfanItaEfectivo(c) : null;
      return ef ? rnd(ef.val, 1) : ''; })(),""",
  """    'Marfan/EHAT índice tamaño aórtico (mm/m2)': rnd(num('marfan_ita'),1),"""),

 ('10 el iDA vuelve a publicarse como ENTERO en las tres superficies',
  """function aoIdaTxt(ida) {
  if (ida == null || !isFinite(ida)) return null;
  return (Math.round(ida * 10) / 10).toFixed(1).replace('.', ',');
}""",
  """function aoIdaTxt(ida) {
  if (ida == null || !isFinite(ida)) return null;
  return String(Math.round(ida));
}"""),

 # ── B3 · el papel ───────────────────────────────────────────────────────────────
 ('11 DE MAS: el indice entra al papel de CUALQUIER aortopatia, no solo de Turner',
  "      if (r.sind === 'turner' && f1(r.ita)) p.push('índice de tamaño aórtico ' + (r.itaTxt || f1(r.ita)) + ' mm/m²');",
  "      if (f1(r.ita)) p.push('índice de tamaño aórtico ' + (r.itaTxt || f1(r.ita)) + ' mm/m²');"),

 ('12 el cuerpo del informe vuelve a publicar el umbral, la clase, el nivel y la tabla',
  "      etePars.push(_enc + (p.length ? ': ' + p.join(', ') : '') + '.');",
  "      etePars.push(_enc + (p.length ? ': ' + p.join(', ') : '') + '. ' + r.txt + '.');"),

 ('13 el EN SUMA vuelve a publicar la clase y la tabla',
  "        sumaCC(_encS + _d + _i + '.');",
  "        sumaCC(_encS + _d + _i + ' con indicación quirúrgica Clase ' + r.clave + ' (' + MARFAN_FTE[r.sind] + ').');"),

 ('14 «dilatada» deja de salir del dueno unico y se escribe con un corte propio',
  "        return sg ? aoSegDil(sg, mm) === true : false;",
  "        return mm >= 55;"),
]

def correr():
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojo = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    nC = len(re.findall(r'condicion:', out))
    if rojo and rojo.group(1) == '0':
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
            nom = ent[0]
            pares = ent[1] if (len(ent) == 2 and isinstance(ent[1], list)) else [(ent[1], ent[2])]
            cuentas = [orig.count(v) for v, _ in pares]
            if any(c != 1 for c in cuentas):
                res.append((i, nom, 'NO APLICA', 'apariciones: %s' % cuentas))
                print('  %02d  NO APLICA  %s (apariciones %s)' % (i, nom, cuentas), flush=True)
                continue
            mut = orig
            for v, n2 in pares:
                mut = mut.replace(v, n2, 1)
            open(IDX, 'w', encoding='utf-8').write(mut)
            try:
                v, det = correr()
            except Exception as e:
                v, det = 'NO CORRIO', str(e)
            open(IDX, 'w', encoding='utf-8').write(orig)
            assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
            res.append((i, nom, v, det))
            print('  %02d  %-11s %s  —  %s' % (i, v, nom, det), flush=True)
    finally:
        open(IDX, 'w', encoding='utf-8').write(orig)
        assert md5(IDX) == m0, 'EL ARCHIVO VIVO NO VOLVIO A SU md5'
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
