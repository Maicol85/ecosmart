# -*- coding: utf-8 -*-
"""_mut_a.py — mutaciones dirigidas de la TANDA A, contra TC-537.

Cada mutacion revierte UNA de las cosas que la tanda hizo. Si TC-537 no se pone rojo con ella,
esa parte del caso no esta probando nada.

  python3 scripts/_mut_a.py            # corre las quince en un WORKTREE
  python3 scripts/_mut_a.py --solo M3

⚠️ NUNCA TOCA EL ARBOL VIVO. Arma un worktree aparte, copia ahi el index.html y el
   test_clinico.mjs de trabajo, y muta la COPIA. El md5 del vivo se mide antes y despues.
⚠️ EXIGE «RESULTADO» EN LA SALIDA ANTES DE PUNTUAR. Si la suite no arranca, stdout queda vacio,
   no hay ningun ✗ y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Es la trampa que el arnes de la tanda AJ7 pago con siete falsos.
⚠️ Y CORRE LA LINEA BASE PRIMERO. Con el caso ya rojo de entrada, las quince salen «en rojo»
   sin que eso pruebe nada.
"""
import hashlib, io, os, re, shutil, subprocess, sys

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = '/tmp/wt-mut-a'
CASO = 'TC-537'

MUT = [
 ('M1', 'vuelve la nota de trabajo «son DESCRIPTIVOS» a una linea visible de Fallot',
  "      lineas: esc,\n      nota:'Las dos guías no piden lo mismo:",
  "      lineas: esc,\n      nota:'El informe y la conclusión de la aplicación son DESCRIPTIVOS: estas recomendaciones se publican acá y no en el papel firmado. Las dos guías no piden lo mismo:"),
 ('M2', 'vuelve el nombre interno del codigo a la ficha del posoperatorio',
  'El corte de la resistencia vascular pulmonar &mdash; 2 UW &mdash; es la &uacute;nica unidad de corte',
  'El corte de la RVP es <code>RVP_ELEVADA_UW</code>, la &uacute;nica unidad de corte'),
 ('M3', 'vuelve una mayuscula de en medio: «recomienda» -> «RECOMIENDA» en el derrame',
  "Clase I · Nivel C — La guía recomienda la pericardiocentesis",
  "Clase I · Nivel C — La guía RECOMIENDA la pericardiocentesis"),
 ('M4', 'la colchicina pierde su clase y su nivel',
  "peri.push({ txt:'Clase IIa · Nivel A — La colchicina, comenzada 48 a 72 h antes",
  "peri.push({ txt:'La colchicina, comenzada 48 a 72 h antes"),
 ('M5', 'vuelve la linea de umbrales duplicada a la seccion de la conclusion de la VAB',
  "      txt:'Los umbrales quirúrgicos de la aorta, con su clase y su nivel, están en la sección «Válvula aórtica bicúspide — aorta ascendente», que trae los diámetros que los sostienen (ESC 2024, Tabla 68, folio 119).' },",
  "      txt:'Cirugía Clase I · Nivel B con diámetro máximo ≥ 55 mm, y Clase I · Nivel B desde 50 mm en el fenotipo de raíz. Todo lo demás es Clase IIa (Tabla 68, folio 119).' },"),
 # ⚠️ M6 ESTABA MAL ESCRITA Y SOBREVIVIO POR ESO, no por falta de cobertura: cambiaba el
 # PREFIJO de la linea («Guia estadounidense:» -> «SIN LOCALIZADOR:») y dejaba intacto el
 # localizador que (C1) busca, que esta en la misma cadena mas adelante. Hoy saca el
 # localizador, que es lo que la regla R2 mando a ese globo.
 ('M6', 'el ⓘ de Fallot se queda sin los localizadores que la regla R2 le mando',
  "las cuatro filas terapéuticas de esta sección son las recomendaciones 9, 10, 13 y 14 del apartado 4.3.5, folio e182",
  "las cuatro filas terapéuticas de esta sección salen de esa guía"),
 ('M7', 'el modo compacto vuelve a poner las recomendaciones ARRIBA de la tabla',
  "  const compacta = !!r.compacta;\n  const _bloRec = function(){",
  "  const compacta = !!r.compacta;\n  const _bloRec0 = function(){\n    return ((r.bloques && r.bloques.length) ? r.bloques.map(_indBloqueHTML).join('') : '')\n         + (r.recom ? _indRecomHTML(r.recom) : ''); };\n  if (compacta) h += _bloRec0();\n  const _bloRec = function(){"),
 ('M8', 'la fila de la banda leve del strain vuelve a repetir su valor',
  "        fuente: 'Decisión de la aplicación' },",
  "        m: 'de ' + VD_STRAIN_PL_LEVE + ' a ' + VD_STRAIN_PL_NORMAL + ' %' },"),
 # ⚠️ M9 ESTABA MAL ESCRITA Y SOBREVIVIO POR ESO: esconder el <summary> deja el <details> en
 # pie, y (C5) cuenta querySelector('details'). Hoy saca el <details> entero de esa fila.
 ('M9', 'una fila de la ficha del posoperatorio pierde su ⓘ',
  '<details style="display:inline-block;vertical-align:top;margin-left:3px;"><summary style="cursor:pointer;list-style:none;display:inline;font-weight:700;color:var(--accent2);" aria-label="Ver el detalle de la fuente: vasoplejia, definici&oacute;n propuesta">&#9432;</summary>',
  '<span style="display:none;"><span aria-label="Ver el detalle de la fuente: vasoplejia, definici&oacute;n propuesta">&#9432;</span>'),
 ('M10','el mensaje del Forrester vuelve a copiar la capsula del modulo',
  "      (!ic && !pcp) ? 'faltan el índice cardíaco y la presión capilar pulmonar estimada'\n                    : (!ic ? 'falta el índice cardíaco'\n                    : (!pcp ? 'falta la presión capilar pulmonar estimada' : (forr || '—'))),",
  "      (forr || '—'),"),
 ('M11','el globo del glosario del Forrester pierde sus mayusculas (minusculizado global)',
  "    ojo: 'LOS DOS BORDES EXACTOS NO ESTÁN DEFINIDOS.",
  "    ojo: 'Los dos bordes exactos no están definidos."),
 ('M12','la capsula del modulo cambia de texto, que es la frontera con el informe y el PPT',
  "      forEl.innerHTML = badge('gray', 'Requiere IC + PCP estimada');",
  "      forEl.innerHTML = badge('gray', 'Faltan datos para el perfil');"),
 ('M13','se va la leyenda de que las dos guias de Fallot no se combinan',
  "Cada una se publica con su fuente y no se combinan.' }",
  "Cada una se publica con su fuente.' }"),
 ('M14','una fila de la ficha del posoperatorio pierde su chip de Criterio de EcoSmart',
  'letter-spacing:.3px;">CRITERIO DE ECOSMART</span>&iquest;Precarga suficiente?',
  'letter-spacing:.3px;"></span>&iquest;Precarga suficiente?'),
 # ⚠️ M15 SOBREVIVIO POR UN HUECO REAL, y es el unico de los tres: el bloque de hemodinamica
 # llega a la hoja de ETT Avanzado del PDF SOLO si el medico aprieta «Integrar al informe», y la
 # escena de TC-537 no lo integraba. Medido ademas que ese bloque NO entra en `informe_texto`,
 # contra lo que su propio comentario dice. El caso ahora lo integra y mide su texto en (E1b).
 ('M15','el bloque integrado de hemodinamica filtra una cita del panel a la hoja del PDF',
  "  L.push('Perfil de Forrester (estimado por eco): ' + (f || 'no determinable'));",
  "  L.push('Perfil de Forrester (estimado por eco, folio 1125): ' + (f || 'no determinable'));"),
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
