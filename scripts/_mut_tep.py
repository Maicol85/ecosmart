# -*- coding: utf-8 -*-
"""_mut_tep.py - mutaciones dirigidas de la tanda TEP, contra TC-546.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-546 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_tep.py
  python3 scripts/_mut_tep.py --solo M4

Calcado de _mut_c2.py, con sus tres advertencias:
  - NUNCA toca el arbol vivo: arma un worktree, copia ahi el index.html y el
    test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
  - EXIGE «RESULTADO» en la salida antes de puntuar.
  - CORRE LA LINEA BASE PRIMERO.

⚠️ M4 ES LA QUE MAS DICE, y es la que la regla T4 pide escribir asi. El corte lo comparten SEIS
   consumidores, y hasta esta tanda compartian el NUMERO y cada uno escribia su propio operador.
   M4 le devuelve al posoperatorio su `>=` propio: el numero sigue siendo el mismo, asi que todo
   lo que no mira el 0,90 EXACTO sigue en verde. Solo (H4) la caza. Si alguna vez esa condicion
   se saca, la app puede volver a graduar el mismo cociente de dos formas sin que nada avise.

⚠️ M12 NO ES UNA REVERSION: aplica el corte nuevo DE MAS, al VD/VI de la probabilidad de HTP,
   que es de otra guia y no se movio. Existe porque la condicion que la mata es un CONTROL
   NEGATIVO, y un control negativo que ninguna mutacion puede romper no esta probando nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-tep'
CASO = 'TC-546'

MUT = [
 # ══ COMMIT 1 · LOS CORTES Y SUS CITAS ══════════════════════════════════════════════════════
 ('M1', 'el TAPSE del score vuelve a 16 mm (el corte de la ESC 2019)',
  'const TEP_TAPSE_BAJO_MAX = 17;', 'const TEP_TAPSE_BAJO_MAX = 16;'),
 ('M2', 'el VD/VI vuelve a 1,0 (el corte que la tanda R habia puesto)',
  'const TEP_VDVI_DILAT_MIN = 0.9;', 'const TEP_VDVI_DILAT_MIN = 1.0;'),
 ('M3', 'el operador del VD/VI vuelve a ser inclusivo: el 0,90 exacto pasa a contar',
  'return vdvi !== null && vdvi !== undefined && vdvi > TEP_VDVI_DILAT_MIN; }',
  'return vdvi !== null && vdvi !== undefined && vdvi >= TEP_VDVI_DILAT_MIN; }'),
 ('M4', 'el POCUS del posoperatorio recupera su propio operador y deja de compartir el predicado',
  "function popPocusSync() {", "function popPocusSync() {\n  const tepVdViDilatado = function (x) { return x !== null && x !== undefined && x >= TEP_VDVI_DILAT_MIN; };"),
 ('M5', 'el rotulo del badge de la capsula vuelve a escribir el operador inclusivo',
  "'VD/VI ' + vdvi + ' — dilatación VD (>' + TEP_VDVI_DILAT_MIN.toFixed(1) + ') ✓'",
  "'VD/VI ' + vdvi + ' — dilatación VD (≥' + TEP_VDVI_DILAT_MIN.toFixed(1) + ') ✓'"),
 ('M6', 'la ficha de Referencias vuelve a atribuirle el VD/VI a la ESC 2019, folio 497.e17',
  '<td style="padding:5px 8px;">AHA/ACC 2026 de embolia pulmonar, Tabla 4 (folio e989)</td></tr>\n        <tr style="border-bottom:1px solid var(--border);background:var(--bg3);">\n          <td style="padding:5px 8px;">Funci&oacute;n sist&oacute;lica del VD &mdash; TAPSE</td>',
  '<td style="padding:5px 8px;">ESC 2019 de TEP, folio 497.e17 y Figura 3 B (folio 497.e15)</td></tr>\n        <tr style="border-bottom:1px solid var(--border);background:var(--bg3);">\n          <td style="padding:5px 8px;">Funci&oacute;n sist&oacute;lica del VD &mdash; TAPSE</td>'),
 ('M7', 'el rotulo estatico del campo VD/VI se desincroniza del corte, como ya paso dos veces',
  '<span style="font-size:10px;color:var(--text2);">Patol\u00f3gico: &gt;0,9</span>',
  '<span style="font-size:10px;color:var(--text2);">Patol\u00f3gico: &ge;1,0</span>'),
 # ══ COMMIT 2 · McCONNELL ═══════════════════════════════════════════════════════════════════
 ('M8', 'vuelve el adjetivo a la capsula, y por su via a la hoja del PDF',
  ": mcconnell ? badge('red', 'Presente ✓') : badge('green', 'Ausente');",
  ": mcconnell ? badge('red', 'Presente — altamente específico de TEP ✓') : badge('green', 'Ausente');"),
 ('M9', 'el globo de McConnell pierde la especificidad y el valor predictivo',
  "'Sensibilidad del 77 % y especificidad del 94 % para el diagnóstico de embolia pulmonar aguda, con un valor predictivo positivo del 71 % y un valor predictivo negativo del 96 %.",
  "'Es un hallazgo sugestivo de embolia pulmonar aguda."),
 ('M10', 'el globo de McConnell deja de decir que no es patognomonico',
  "'No es patognomónico: otros mecanismos de isquemia del ventrículo derecho pueden producirlo sin embolia pulmonar.",
  "'Orienta el diagnóstico de embolia pulmonar aguda.")
]

MUT += [
 # ══ COMMIT 3 · EL ECO ORIENTA ══════════════════════════════════════════════════════════════
 ('M11', 'la linea del eco vuelve a la frase vieja, que decia casi lo mismo con otras palabras',
  'Los hallazgos ecocardiográficos orientan la evaluación del ventrículo derecho. <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="tep-eco-dx"',
  'Orientación ecocardiográfica de disfunción VD por sobrecarga aguda de presión (TEP/HTP aguda). <button type="button" class="vinfo-btn vinfo-btn-44" data-vinfo="tep-eco-dx"'),
 ('M12', 'SOBRE-APLICACION: el corte nuevo se le aplica TAMBIEN al VD/VI de la probabilidad de HTP, que es de otra guia',
  'const VD_VI_HTP_MIN = 1.0;', 'const VD_VI_HTP_MIN = 0.9;'),
 ('M13', 'el globo del eco pierde la clase y el nivel de la recomendacion',
  "'La AHA/ACC 2026 no recomienda la ecocardiografía para confirmar ni para descartar el diagnóstico de embolia pulmonar: clase 3, sin beneficio; nivel B-NR.",
  "'La AHA/ACC 2026 no recomienda la ecocardiografía para confirmar ni para descartar el diagnóstico de embolia pulmonar."),
 ('M14', 'vuelve la «Salvedad» a la hoja del PDF de TEP',
  "     La advertencia sigue EN PANTALLA, en el cartel de la tarjeta de TEP, que no se toco. */\n  return L.join('\\n');",
  "     La advertencia sigue EN PANTALLA, en el cartel de la tarjeta de TEP, que no se toco. */\n  L.push('Salvedad. Estos hallazgos son orientativos y no reemplazan la estratificacion de riesgo.');\n  return L.join('\\n');"),
]

def md5(p):
    with open(p, 'rb') as f: return hashlib.md5(f.read()).hexdigest()

def corre(dirw):
    r = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', CASO],
                       cwd=dirw, capture_output=True, text=True, timeout=900)
    return r.stdout + r.stderr

def veredicto(sal):
    if 'RESULTADO' not in sal: return 'NO CORRIO'
    return 'MUERTA' if re.search(r'✗\s*$', sal, re.M) or ' CON FALLAS' in sal else 'SOBREVIVIO'

def main():
    solo = None
    if '--solo' in sys.argv: solo = sys.argv[sys.argv.index('--solo') + 1]
    md5_ini = md5(os.path.join(RAIZ, 'index.html'))
    print('md5 del index.html VIVO al abrir: %s' % md5_ini)
    if os.path.exists(WT):
        subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ, capture_output=True)
    subprocess.run(['git', 'worktree', 'add', '-q', '--detach', WT, 'HEAD'], cwd=RAIZ, check=True)
    for f in ('index.html', 'scripts/test_clinico.mjs'):
        shutil.copy(os.path.join(RAIZ, f), os.path.join(WT, f))
    orig = io.open(os.path.join(WT, 'index.html'), encoding='utf-8').read()
    print('worktree: %s  (copia del arbol de trabajo, md5 %s)'
          % (WT, md5(os.path.join(WT, 'index.html'))))

    print('\n== LINEA BASE en el worktree ==')
    base = corre(WT)
    if 'RESULTADO' not in base: print('  ABORTA: la suite no arranco en el worktree'); return 2
    if ' CON FALLAS' in base:
        print('  ABORTA: %s ya esta ROJO sin mutar. Mutar sobre un rojo no prueba nada.' % CASO)
        print('\n'.join(l for l in base.split('\n') if 'condicion' in l or 'encontrado' in l)); return 2
    print('  %s VERDE sin mutar.' % CASO)

    res = []
    for cod, desc, viejo, nuevo in MUT:
        if solo and cod != solo: continue
        n = orig.count(viejo)
        if n != 1:
            res.append((cod, 'MAL ESCRITA', desc, 'esperaba 1 ocurrencia, hay %d' % n))
            print('  %-4s MAL ESCRITA (%d ocurrencias)  %s' % (cod, n, desc)); continue
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig.replace(viejo, nuevo))
        sal = corre(WT)
        v = veredicto(sal)
        cond = [l.strip() for l in sal.split('\n') if 'condicion:' in l]
        res.append((cod, v, desc, ' | '.join(c.replace('condicion: ', '') for c in cond)[:150]))
        print('  %-4s %-11s %s' % (cod, v, desc))
        if cond: print('        mata: %s' % ' | '.join(c.replace('condicion: ', '') for c in cond)[:160])
        io.open(os.path.join(WT, 'index.html'), 'w', encoding='utf-8').write(orig)

    md5_fin = md5(os.path.join(RAIZ, 'index.html'))
    print('\nmd5 del index.html VIVO al cerrar: %s' % md5_fin)
    print('GUARDA %s' % ('OK: el arbol vivo no se toco' if md5_ini == md5_fin
                         else 'ROTA: el arbol vivo CAMBIO — la medicion no vale'))
    m = sum(1 for r in res if r[1] == 'MUERTA')
    print('\nRESUMEN: %d/%d muertas' % (m, len(res)))
    for r in res:
        if r[1] != 'MUERTA': print('  ⚠️ %s %s — %s' % (r[0], r[1], r[2]))
    subprocess.run(['git', 'worktree', 'remove', '--force', WT], cwd=RAIZ, capture_output=True)
    return 0 if m == len(res) else 1

sys.exit(main())
