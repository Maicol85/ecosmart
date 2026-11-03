#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_pant4.py - barrido de MUTACIONES DIRIGIDAS de la TANDA PANT-4 (2026-11-03).

Cada mutacion revierte UNA de las cosas que los commits 1 a 6 cambiaron -o la aplica DE MAS-
sobre el index.html del directorio donde se lo corra, y exige que SU caso se ponga ROJO.

  python3 scripts/_mut_pant4.py              # todas
  python3 scripts/_mut_pant4.py --solo 1,2   # algunas

SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO.
EXIGE LA LINEA RESULTADO EN LA SALIDA: sin ella el veredicto es NO CORRIO.

CADA MUTACION DECLARA SU CASO, y no se corren los seis por cada una: TC-633 cubre la alineacion,
TC-634 el papel de las dos estenosis, TC-635 la conclusion de pantalla y su Evidencia, TC-636 el
papel de la miocardiopatia arritmogenica, TC-637 los tres textos corregidos y TC-638 la cita de
aorta, la situacion nueva y los estadios. Una mutacion del commit 1 que pusiera rojo al caso del
commit 6 estaria diciendo que el reparto esta mal, no que la cobertura exista.

CINCO NO REVIERTEN NADA: LA APLICAN DE MAS. La 03 le da la clase de la grilla nueva a una seccion
ajena, la 09 deja la frase de dato faltante tambien cuando el gradiente SI consta, la 13 nombra la
guia tambien en el EN SUMA de un estudio sin la miocardiopatia integrada, la 18 abre el bloque de
la insuficiencia aortica tambien sin aorta dilatada y la 21 publica el estadio tambien en el papel.
Existen porque las condiciones que las matan son CONTROLES NEGATIVOS, y un control negativo que
ninguna mutacion puede romper no esta probando nada.

LA 04 ROMPE LAS DOS MITADES A LA VEZ: el `papel` del evaluador y el `suma`, que son las dos
salidas del mismo dueño, y romper una sola la tapa la otra en la mitad de las condiciones. Es la
leccion del D-11.
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')


def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


# (nombre, caso, viejo, nuevo)  -- o (nombre, caso, [(v1,n1),(v2,n2)]) para romper dos mitades
MUT = [

 # == COMMIT 1b - la alineacion ==============================================================
 ('01 las columnas vuelven a poder estirarse con el contenido', 'TC-633',
  """  .esa-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto auto;""",
  """  .esa-grid { grid-template-columns: repeat(3, 1fr); grid-template-rows: auto auto auto;"""),

 ('02 los campos dejan de ceder sus tres bandas a la grilla de afuera', 'TC-633',
  """  .esa-grid > .fg { display: grid; grid-template-rows: subgrid; grid-row: span 3; }""",
  """  .esa-grid > .fg { display: grid; grid-template-rows: auto auto auto; grid-row: span 3; }"""),

 ('03 DE MAS: el subgrid no se retira por debajo de 768 px', 'TC-633',
  """  @media (max-width: 768px) {
    .esa-grid { row-gap: 12px; }
    .esa-grid > .fg { display: flex; grid-row: auto; }
  }""",
  """  @media (max-width: 768px) {
    .esa-grid { row-gap: 12px; }
  }"""),

 # == COMMIT 1c - el papel de las dos estenosis ==============================================
 ('04 el papel y el EN SUMA de la subaortica vuelven a redactarse en el emisor -las DOS mitades-', 'TC-634',
  [("""      etePars.push(r.papel.join('. ') + '.');
      ccMarcarParrafo();
      sumaCC(r.suma);
    })();

    /* ── Circulación de Fontan ──""",
    """      etePars.push(r.papel.join('. ') + '. No se gradúa la severidad: el criterio de la ESC 2020 es el gradiente MEDIO y no consta. ' + ESUB_SEG_MUT);
      ccMarcarParrafo();
      sumaCC(r.suma);
      sumaCC('Estenosis subaórtica — evaluar indicación quirúrgica.');
    })();

    /* ── Circulación de Fontan ──"""),
   ("""const ESUB_MEDIO_SEVERO = 40;""",
    """const ESUB_MEDIO_SEVERO = 40;
const ESUB_SEG_MUT = 'Seguimiento ecocardiográfico anual.';""")]),

 ('05 la longitud del tunel vuelve a repetir el tipo', 'TC-634',
  """  if (tipo === 'tunel' && largoOk) papel.push('Longitud del túnel ' + f1(largo) + ' mm');""",
  """  if (tipo === 'tunel' && largoOk) papel.push('Túnel subaórtico de ' + f1(largo) + ' mm');"""),

 ('06 el negativo explicito de la insuficiencia vuelve a no concordar', 'TC-634',
  """  if (ia === 'no') papel.push('Sin insuficiencia aórtica asociada');
  else if (ia) papel.push('Insuficiencia aórtica asociada ' + (ESUB_IA_TXT[ia] || ia));""",
  """  if (ia) papel.push('Insuficiencia aórtica asociada ' + (ESUB_IA_TXT[ia] || ia));"""),

 ('07 el verbo de Valsalva vuelve a ser un adjetivo', 'TC-634',
  """    (vals === 'sin_cambios' ? 'no se modifica' : (ESUB_VALS_TXT[vals] || vals)));""",
  """    (ESUB_VALS_TXT[vals] || vals));"""),

 ('08 los ostios vuelven al rotulo de la pastilla pegado', 'TC-634',
  """  if (cor && COR_PAPEL[cor]) papel.push(COR_PAPEL[cor]);""",
  """  if (cor && COR_PAPEL[cor]) papel.push('Ostios coronarios ' + (EASV_COR_TXT[cor] || cor));"""),

 ('09 DE MAS: la supravalvular publica la frase de dato faltante tambien con el gradiente cargado', 'TC-634',
  """  const papel = ['Estenosis supravalvular aórtica' + (tipo ? ' (' + (EASV_TIPO_TXT[tipo] || tipo) + ')' : '')];""",
  """  const papel = ['Estenosis supravalvular aórtica' + (tipo ? ' (' + (EASV_TIPO_TXT[tipo] || tipo) + ')' : ''),
    'No se gradúa la severidad: el criterio de la ESC 2020 es el gradiente MEDIO y no consta'];"""),

 ('10 el EN SUMA de la supravalvular vuelve a repetir la lesion por cada alerta', 'TC-634',
  """      sumaCC(r.suma);
    })();

    /* ── Estenosis subaórtica ──""",
  """      sumaCC(r.suma);
      r.alertas.forEach(function (a) { sumaCC('Estenosis supravalvular aórtica — ' + a.txt.slice(0, 40)) });
    })();

    /* ── Estenosis subaórtica ──"""),

 # == COMMIT 1d - la conclusion de pantalla ==================================================
 ('11 vuelve el cuadro de Seguimiento a la pantalla de la subaortica', 'TC-635',
  """  if (r.alertas.length) r.alertas.forEach(a => fila('·', val(a.txt)));
}
window.esubSync = esubSync;""",
  """  if (r.alertas.length) r.alertas.forEach(a => fila('·', val(a.txt)));
  fila('Seguimiento', val('Seguimiento ecocardiográfico anual.'));
}
window.esubSync = esubSync;"""),

 ('12 vuelve la interpretacion quirurgica a la alerta de la insuficiencia', 'TC-635',
  """    txt:'Insuficiencia aórtica ' + ESUB_IA_TXT[ia] + ' asociada — marcador de severidad y de progresión de la lesión subaórtica.' });""",
  """    txt:'Insuficiencia aórtica ' + ESUB_IA_TXT[ia] + ' asociada — marcador de severidad y de progresión de la lesión subaórtica, y criterio que pesa por sí mismo en la decisión quirúrgica.' });"""),

 # == COMMIT 1e - la Evidencia de las dos lesiones ===========================================
 ('13 la Evidencia de la subaortica se saca del panel', 'TC-635',
  """  { tit:'Estenosis subaórtica',                  fn:_indESUB },""",
  """"""),

 ('14 las preguntas de la subaortica pierden el tercer estado', 'TC-635',
  """  const OPS = [{ v:'si', t:'Sí' }, { v:'no', t:'No' }, IND_OPS_SD];""",
  """  const OPS = [{ v:'si', t:'Sí' }, { v:'no', t:'No' }];"""),

 # == COMMIT 2 - Task Force fuera del papel ==================================================
 ('15 la linea del puntaje vuelve a nombrar el criterio en el informe', 'TC-636',
  """partes.push('Puntaje de criterios diagnósticos: ' + sc.total""",
  """partes.push('Puntaje Task Force 2010: ' + sc.total"""),

 ('16 la linea del puntaje vuelve a nombrarlo en el EN SUMA', 'TC-636',
  """    l += ' — criterios diagnósticos ' + sc.total""",
  """    l += ' — Task Force 2010 ' + sc.total"""),

 ('17 el resumen que lee la hoja del PDF y el PPT vuelve a nombrarlo', 'TC-636',
  """      ? 'Criterios posibles de miocardiopatía arritmogénica (2 puntos) — evaluación multimodal indicada'""",
  """      ? 'Criterios posibles de miocardiopatía arritmogénica (Task Force 2010: 2 puntos) — evaluación multimodal indicada'"""),

 # ROMPE LAS DOS MITADES A LA VEZ: la pantalla nombra el criterio en el titulo de la seccion Y
 # en la fila de interpretacion, y quitar una sola la tapa la otra. Leccion del D-11.
 ('18 DE MAS: el nombre del criterio sale TAMBIEN de la pantalla -las DOS mitades-', 'TC-636',
  [("""        <span>Criterios estructurales ecocardiográficos (Task Force 2010)</span>""",
    """        <span>Criterios estructurales ecocardiográficos</span>"""),
   ("""<span class="calc-lbl">Interpretación Task Force 2010</span>""",
    """<span class="calc-lbl">Interpretación</span>""")]),

 # == COMMIT 3 - los textos contra su fuente =================================================
 ('19 la resonancia vuelve a decir lo que su fuente no sostiene, en el papel', 'TC-637',
  """y la resonancia cardíaca es el método de referencia para evaluar la morfología y la función del ventrículo derecho, pero por sí sola no establece el diagnóstico');""",
  """y la resonancia cardíaca con gadolinio es el estándar de referencia para la caracterización tisular del miocardio');"""),

 # EL ROTULO VIVE EN DOS LISTAS -la tabla del marcado y MCA_CATS- y romper una sola la tapa la
 # otra: el texto sigue en la seccion por el otro camino. Leccion del D-11, pagada en el barrido.
 ('20 el rotulo del tisular vuelve a omitir la morfometria -las DOS listas-', 'TC-637',
  [("""<td>Sustitución fibrosa, miocitos residuales &lt;60 % por morfometría (&lt;50 % si se estima)</td>""",
    """<td>Sustitución fibrosa, miocitos residuales &lt;60 % en biopsia</td>"""),
   ("""['mca_ii_may','Sustitución fibrosa con miocitos residuales por debajo del 60 % por morfometría, o por debajo del 50 % si se estima, en biopsia endomiocárdica']""",
    """['mca_ii_may','Sustitución fibrosa con miocitos residuales <60 % en biopsia']"""),
   ("""['mca_ii_men','Miocitos residuales del 60 al 75 % por morfometría, o del 50 al 65 % si se estima, en biopsia endomiocárdica']""",
    """['mca_ii_men','Miocitos residuales 60-75 % en biopsia']"""),
   ("""<td>Miocitos residuales 60-75 % por morfometría (50-65 % si se estima)</td>""",
    """<td>Miocitos residuales 60-75 % en biopsia</td>""")]),

 ('21 los rotulos de repolarizacion vuelven a omitir los 14 anios -las DOS listas-', 'TC-637',
  [("""<td>Inversión de T en V1-V3 o más allá, &gt;14 años, sin BRD completo</td>""",
    """<td>Inversión de T en V1-V3 o más allá, sin BRD completo</td>"""),
   ("""<td>Inversión de T en V1-V2, &gt;14 años, sin BRD completo; o en V4-V6</td>""",
    """<td>Inversión de T en V1-V2, o en V4-V6</td>"""),
   ("""<td>Inversión de T en V1-V4, &gt;14 años, con BRD completo</td>""",
    """<td>Inversión de T en V1-V4 con BRD completo</td>"""),
   ("""['mca_iii_may','Inversión de onda T en V1-V3 o más allá, en mayores de 14 años, sin bloqueo completo de rama derecha']""",
    """['mca_iii_may','Inversión de onda T en V1-V3 o más allá, sin bloqueo completo de rama derecha']"""),
   ("""['mca_iii_men1','Inversión de onda T en V1-V2 en mayores de 14 años sin bloqueo completo de rama derecha, o en V4-V6']""",
    """['mca_iii_men1','Inversión de onda T en V1-V2, o en V4-V6']"""),
   ("""['mca_iii_men2','Inversión de onda T en V1-V4, en mayores de 14 años, con bloqueo completo de rama derecha']""",
    """['mca_iii_men2','Inversión de onda T en V1-V4 con bloqueo completo de rama derecha']""")]),

 ('22 la arritmia menor vuelve a omitir la configuracion del TSVD', 'TC-637',
  """<td>TV de configuración del TSVD: BRI con eje <b>inferior</b> o desconocido</td>""",
  """<td>TV con morfología de BRI y eje <b>inferior</b>, o de eje desconocido</td>"""),

 # == COMMIT 5 - la Evidencia de aortopatias =================================================
 ('23 la cita de Marfan vuelve a la paginacion de la otra edicion', 'TC-638',
  """  t62: 'ESC 2024, Tabla 62 · hoja 105 · folio 3642',""",
  """  t62: 'ESC 2024, Tabla 62 · folio 114',"""),

 ('24 DE MAS: el bloque de la insuficiencia aortica se abre tambien sin aorta dilatada', 'TC-638',
  """  if (_iaSev && _aoDil) {""",
  """  if (_iaSev || _aoDil) {"""),

 # == COMMIT 6 - los estadios ================================================================
 ('25 el estadio infiere el ausente de sintomas cuando no se contesto', 'TC-638',
  """    return { txt:'C o D, según síntomas', marca:'ask',
      nota:'estenosis aórtica severa. Lo que separa C de D son los síntomas""",
  """    return { txt:'C1', marca:'ask',
      nota:'estenosis aórtica severa. Lo que separa C de D son los síntomas"""),

 ('26 el estadio de la insuficiencia usa el corte de la aplicacion y no el de la tabla', 'TC-638',
  """      const c2 = _le(fevi, 55) || _gt(dsf, 50);""",
  """      const c2 = _le(fevi, 50) || _gt(dsf, 50);"""),

 # ⚠️ LA MUTACION «el estadio llega al papel» NO SE PUEDE ESCRIBIR aqui y se declara: el emisor
 # regenera el textarea entero en cada llamada, asi que escribir en el despues de pintar la fila
 # no es efectivo -lo sobrescribe la siguiente emision-. Lo que sostiene ese control negativo es
 # el A/B, que da CERO diferencias de superficie firmada en las 26 escenas. En su lugar, esta
 # mutacion le saca a la fila su tabla, su hoja y su folio, que es el otro invariante del commit.
 ('27 el estadio pierde su tabla, su hoja y su folio en la nota', 'TC-638',
  """  const F = ' (Tabla 13, hoja 20, folio e91)';""",
  """  const F = '';"""),
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
