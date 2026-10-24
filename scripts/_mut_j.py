#!/usr/bin/env python3
"""Barrido de mutaciones dirigidas de la tanda J.

Corre SOBRE EL WORKTREE /tmp/jwt y NUNCA sobre el archivo vivo: cada mutacion se aplica a
una copia, se corre TC-532 y se restaura. El veredicto exige la linea RESULTADO en la salida
-sin ella la corrida no corrio y puntuar «sobrevivio» seria el falso que este repo ya pago-.

  python3 scripts/_mut_j.py            # todas
  python3 scripts/_mut_j.py --solo M3  # una
"""
import subprocess, sys, shutil, hashlib, os, re

WT   = '/tmp/jwt'
VIVO = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'index.html')
IDX  = os.path.join(WT, 'index.html')
SNAP = '/tmp/jwt_index.snapshot.html'

MUT = [
 ('M1', 'la pletora de VCI vuelve a >21 mm',
  'const DPT_VCI_PLETORA_MM = 20;', 'const DPT_VCI_PLETORA_MM = 21;'),
 ('M2', 'el colapso de AD vuelve a llamarse sistolico en la frase del informe',
  "otros.push('colapso diastólico de la aurícula derecha'", "otros.push('colapso sistólico de la aurícula derecha'"),
 ('M3', 'el corte de la duracion del colapso de AD se mueve a 0,30',
  'const DPT_COL_AD_DUR_SIG = 0.34;', 'const DPT_COL_AD_DUR_SIG = 0.30;'),
 ('M4', 'vuelve el cartel de confirmacion invasiva a la pantalla',
  '<div style="border-top:1px solid var(--border); margin:10px 0 0;"></div>\n        <div style="font-size:10px; color:var(--text2); line-height:1.55; margin-top:6px;">\n          <span style="display:inline-block; border:1px solid var(--border); border-radius:4px;\n                       padding:1px 5px; margin-right:4px; font-size:9px; letter-spacing:.3px;">CRITERIO DE ECOSMART</span>\n          El <b>e&#39; lateral de 10 cm/s</b>',
  '<div style="font-size:10px;color:var(--text2);">⚠️ El diagnóstico definitivo de constricción requiere correlación clínica e invasiva.</div>\n        <div style="font-size:10px; color:var(--text2); line-height:1.55; margin-top:6px;">\n          <span style="display:inline-block; border:1px solid var(--border); border-radius:4px;\n                       padding:1px 5px; margin-right:4px; font-size:9px; letter-spacing:.3px;">CRITERIO DE ECOSMART</span>\n          El <b>e&#39; lateral de 10 cm/s</b>'),
 ('M5', 'el cociente hepatico se mueve a 0,70',
  'const CVR_HEP_COC_MIN    = 0.78;', 'const CVR_HEP_COC_MIN    = 0.70;'),
 ('M6', 'VEXUS vuelve a usar un solo corte de VCI para los cuatro grados',
  '  if (d <= VEXUS_VCI_MM) return { score: 1, severos, evaluados: evaluadosLbl.length, vciDiam: d };',
  '  if (d < 0) return { score: 1, severos, evaluados: evaluadosLbl.length, vciDiam: d };'),
 ('M7', 'vuelve una frase de conducta al grado 3 de VEXUS',
  "  3: 'Congestión venosa severa. Alta asociación con injuria renal aguda (AKI).'",
  "  3: 'Congestión venosa severa. Alta asociación con injuria renal aguda (AKI). Considerar descongestión activa — diuréticos o ultrafiltración según contexto clínico. Reevaluar con tratamiento.'"),
 ('M8', 'se saca del panel la Evidencia de constriccion',
  "  { tit:'Constricción pericárdica — diagnóstico', fn:_indConstr },",
  "  /* MUTACION */"),
 ('M9', 'se saca la ficha de Referencias de constriccion',
  """onclick="toggleRef('constriccion',this)\"""",
  """onclick="toggleRef('constriccionMUT',this)\""""),
 ('M10','vuelve la recomendacion de cateterismo a la rama de criterios mixtos',
  "      + 'ecocardiográficamente.'];",
  "      + 'ecocardiográficamente. Se recomienda cateterismo cardíaco derecho e izquierdo simultáneo para diagnóstico definitivo.'];"),
 ('M11','vuelve la fase vieja al rotulo del campo de colapso de AD',
  '<label>Colapso AD — diastólico (Tabla 17)</label>',
  '<label>Colapso AD — sistólico (≥1/3 del ciclo)</label>'),
 ('M12','se saca del panel la Evidencia de VEXUS',
  "  { tit:'Congestión venosa sistémica — VExUS', fn:_indVexus }",
  "  /* MUTACION */"),
]

def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest()

def correr():
    r = subprocess.run(['node','scripts/test_clinico.mjs','--solo','TC-532'],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        return 'NO CORRIO', out[-400:]
    rojas = out.count('condicion:')
    verde = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    return ('MUERTA' if rojas > 0 else 'SOBREVIVIO'), ('%s · %d condiciones en rojo' % (verde.group(0) if verde else '?', rojas))

def main():
    solo = None
    if '--solo' in sys.argv: solo = sys.argv[sys.argv.index('--solo')+1].split(',')
    shutil.copy(VIVO, IDX)              # el worktree arranca igual al arbol vivo
    shutil.copy(IDX, SNAP)
    base_md5 = md5(IDX)
    print('base md5', base_md5)
    est, det = correr()
    print('LINEA BASE: %s — %s' % (est, det))
    if est != 'MUERTA' and 'condiciones en rojo' in det and not det.endswith('0 condiciones en rojo'):
        pass
    if est == 'MUERTA':
        print('⚠️ LA LINEA BASE YA ESTA EN ROJO: ninguna mutacion prueba nada. Abortando.')
        return 1
    ok = 0; tot = 0
    for mid, desc, viejo, nuevo in MUT:
        if solo and mid not in solo: continue
        tot += 1
        s = open(IDX, encoding='utf-8').read()
        n = s.count(viejo)
        if n != 1:
            print('%-4s %-62s ANCLA x%d  → NO SE PUDO APLICAR' % (mid, desc[:62], n)); continue
        open(IDX,'w',encoding='utf-8').write(s.replace(viejo, nuevo))
        est, det = correr()
        shutil.copy(SNAP, IDX)
        assert md5(IDX) == base_md5, 'el worktree no volvio a su snapshot'
        print('%-4s %-62s %-11s %s' % (mid, desc[:62], est, det))
        if est == 'MUERTA': ok += 1
    print('\n%d/%d mutaciones MUERTAS' % (ok, tot))
    return 0 if ok == tot else 1

sys.exit(main())
