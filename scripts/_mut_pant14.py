#!/usr/bin/env python3
"""
_mut_pant14.py - el barrido de mutaciones dirigidas de la tanda PANT-14.
Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo, con guarda de md5 antes y despues.
Cada mutacion declara SU caso: correr los seis por cada una taparia un reparto mal hecho.
  python3 scripts/_mut_pant14.py [--solo M07] [--lista]
"""
import io, os, re, subprocess, sys, hashlib, time, shutil

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT = os.environ.get('MUT_WT', '/private/tmp/claude-501/-Users-maicoldossantos-Desktop-APLICACIONES-ecosmart/cf3e404d-754f-4950-b1ed-57512835e4aa/scratchpad/wt_mut')

# (id, caso que tiene que ponerse ROJO, viejo, nuevo, por que)
MUT = [
 # ── commit 1: los colores del esquema ──
 ('M01','TC-693', 'rx="8" fill="\' + P.card + \'" stroke="\' + (exc ? Gc',
                  'rx="8" fill="var(--card)" stroke="\' + (exc ? Gc',
  'repone el var() en el relleno de las cuatro cajas'),
 ('M02','TC-693', 'r="7" fill="\' + (oro ? Yc : P.card) + \'"',
                  'r="7" fill="\' + (oro ? Yc : \'var(--card)\') + \'"',
  'repone el var() en el relleno de las dos valvulas'),
 ('M03','TC-693', 'font-size="12" font-weight="600" fill="\' + P.texto + \'" class="cm3d-tp">\' + q[0] + \'</text><text',
                  'font-size="12" font-weight="600" fill="var(--text)" class="cm3d-tp">\' + q[0] + \'</text><text',
  'repone el var() en el titulo de la caja'),
 ('M04','TC-693', "return (x && COLOR_OK.test(x)) ? x : resp;",
                  "return x;",
  'saca el respaldo: con --card vacia la paleta devuelve la cadena vacia'),
 ('M05','TC-693', "  let box = { TL:['VD','','b'], TR:['AI','','r'], BL:['AD','','b'], BR:['VI','','r'] };",
                  "  const box = { TL:['VD','','b'], TR:['AI','','r'], BL:['AD','','b'], BR:['VI','','r'] };",
  'vuelve a const: la rama del switch auricular aborta el dibujo'),
 ('M06','TC-693', "fill=\"' + (oro ? CM_SCH_TINTA : P.texto) + '\" class=\"cm3d-tp-f\"",
                  "fill=\"' + P.texto + '\" class=\"cm3d-tp-f\"",
  'la letra de la valvula dorada vuelve al color del tema'),
 # ── commit 2: el boton del PDF ──
 ('M07','TC-694', "if (_cm3d.modo !== 'estudio') { apagar(CM_PDF_AVISO.explorar); return }",
                  "if (false) { apagar(CM_PDF_AVISO.explorar); return }",
  'saca la compuerta de Explorar: el boton queda activo ahi'),
 ('M08','TC-694', "if (!cmHayCargado()) { apagar(CM_PDF_AVISO.vacio); return }",
                  "if (false) { apagar(CM_PDF_AVISO.vacio); return }",
  'saca la compuerta de «sin lesiones»'),
 ('M09','TC-694', "  vacio:'No hay lesiones cargadas en las pestañas: no hay nada para incluir.',",
                  "  vacio:'',",
  'deja sin texto el aviso de «sin lesiones»'),
 # ── commit 3: las reglas de la transposicion y la obstruccion ──
 ('M10','TC-695', "    const DIBUJA={ d:['cia','civ','dap'], jat:['cia','civ'], mus:['civ'], ras:['cia'], cc:['cia','civ'] };",
                  "    const DIBUJA={ d:['cia','civ','dap'], jat:['cia','civ','dap','vap','cvpa','coa','ep','ea','vcs'], mus:[], ras:[], cc:[] };",
  'repone las reglas de la demo v13, que es lo que esta tanda cambia'),
 ('M11','TC-695', "jat:['cia','civ'], mus:['civ']",
                  "jat:['cia','civ','dap'], mus:['civ']",
  'deja el ductus con el Jatene, que el 3D no dibuja'),
 ('M12','TC-695', "const ok=DIBUJA[S.bv.tga]||DIBUJA.d;",
                  "const ok=(DIBUJA[S.bv.tga]||DIBUJA.d).concat(['vcs']);",
  'deja la cava izquierda en las cinco variantes'),
 ('M13','TC-695', "  if (K.tobs) {\n    const po = ({ jat:[0.4,0.05,-0.07]",
                  "  if (false) {\n    const po = ({ jat:[0.4,0.05,-0.07]",
  'saca el anillo de la obstruccion subaortica'),
 ('M14','TC-695', "  if (K.tobs) {\n    const po = ({ jat:[0.4,0.05,-0.07]",
                  "  if (true) {\n    const po = ({ jat:[0.4,0.05,-0.07]",
  'dibuja el anillo SIEMPRE, tambien sin la casilla'),
 ('M15','TC-695', "if (s.lb.length < 12) s.lb.push(['Obstr. subaórtica', [po[0]+1.0, po[1]-0.1, po[2]+0.4]]);",
                  "if (false) s.lb.push(['Obstr. subaórtica', [po[0]+1.0, po[1]-0.1, po[2]+0.4]]);",
  'saca el rotulo del anillo'),
 # ── commits 4 a 6: las siete lesiones ──
 ('M16','TC-696', "    S.base = 'fal'; S.bv.fal = 'op';",
                  "    S.base = 'fal'; S.bv.fal = 'sin';",
  'el Fallot del estudio pasa a «sin operar»'),
 ('M17','TC-696', "    if (_cmGrado(V('ip_grado'), ['Sin insuficiencia'])) S.ck.ip = true;",
                  "    if (false) S.ck.ip = true;",
  'saca la casilla de insuficiencia pulmonar'),
 ('M18','TC-696', "if (_cmGrado(V('ip_grado'), ['Sin insuficiencia'])) S.ck.ip = true;",
                  "if (_cmGrado(V('tdf_ip_ro'), ['Sin insuficiencia'])) S.ck.ip = true;",
  'lee el ESPEJO en vez del dueno del grado'),
 ('M19','TC-696', "    } else { omit.push('coa') }",
                  "    } else { S.mods.coa = 'nat' }",
  'la coartacion sin situacion se dibuja como nativa'),
 ('M20','TC-696', "      if (sit === 'recoartacion') S.ck.rec = true;",
                  "      if (false) S.ck.rec = true;",
  'la recoartacion deja de encender su casilla'),
 ('M21','TC-696', "  const epHay = (epGrado !== '' && epGrado !== 'sin')",
                  "  const epHay = (V('ep_vmax') !== '') || (epGrado !== '' && epGrado !== 'sin')",
  'la velocidad pulmonar sola enciende la estenosis'),
 ('M22','TC-696', "                     'Supravalvular':'sup', 'Ramas pulmonares':'sup' };",
                  "                     'Supravalvular':'sup', 'Ramas pulmonares':'sup', 'Mixto':'valv' };",
  'el nivel «Mixto» pasa a dibujarse como valvular'),
 ('M23','TC-696', "  } else if (ON.easv) {\n    S.mods.ea = 'sup';",
                  "  } else if (ON.easv) {\n    S.mods.ea = 'sub';",
  'la supravalvular se dibuja como subaortica'),
 ('M24','TC-696', "    chocan.push('estenosis supravalvular aórtica: no se dibuja junto con la subaórtica');",
                  "    if (false) chocan.push('estenosis supravalvular aórtica: no se dibuja junto con la subaórtica');",
  'el conflicto de las dos aorticas deja de listarse'),
 ('M25','TC-696', "    const DSAV_VAR = { parcial:'par', intermedio:'tra', completo:'com' };",
                  "    const DSAV_VAR = { parcial:'par', intermedio:'com', completo:'com' };",
  'el tipo intermedio pasa a dibujarse como completo'),
 ('M26','TC-696', "    if (_cmGrado(V('it_grado'), ['0'])) S.ck.eit = true;",
                  "    if (V('it_grado') !== '') S.ck.eit = true;",
  'el cero de it_grado pasa a contar como grado'),
 ('M27','TC-696', "      if (v !== 'atr' && V('fontan_fenestracion') === 'presente') S.ck.fen = true;",
                  "      if (v !== 'atr' && V('fontan_fenestracion') !== '') S.ck.fen = true;",
  'la fenestracion cerrada enciende la casilla'),
 ('M28','TC-696', "      if (v !== 'atr' && V('fontan_fenestracion') === 'presente') S.ck.fen = true;",
                  "      if (V('fontan_fenestracion') === 'presente') S.ck.fen = true;",
  'el Fontan atriopulmonar gana la casilla de fenestracion'),
 ('M29','TC-696', "    const FON_VAR = { extra:'ext', tunel:'tun', ap:'atr' };",
                  "    const FON_VAR = { extra:'ext', tunel:'tun', ap:'atr', noesp:'ext' };",
  'el Fontan sin tipo pasa a dibujarse como extracardiaco'),
 ('M30','TC-696', "    if (v) {\n      S.base = 'dsav'; S.bv.dsav = v;",
                  "    if (true) {\n      S.base = 'dsav'; S.bv.dsav = v || 'par';",
  'el defecto AV sin tipo pasa a dibujarse como parcial'),
 # ── commit 6: las reglas de conjunto ──
 ('M31','TC-697', "  Object.freeze({ b:'fal',  sec:'tdf',    lbl:'Fallot' }),",
                  "  Object.freeze({ b:'zzz',  sec:'nada',   lbl:'Fallot' }),",
  'saca el Fallot de la lista de prioridad'),
 ('M32','TC-697', "  otrasBases.forEach(function (l) { chocan.push(l + ': no se dibuja junto con '",
                  "  [].forEach(function (l) { chocan.push(l + ': no se dibuja junto con '",
  'deja de listar las bases que pierden por prioridad'),
 ('M33','TC-697', "  else if (!_omN && !_chN) partes.push('Todas las lesiones cargadas están dibujadas.');",
                  "  else partes.push('Todas las lesiones cargadas están dibujadas.');",
  'vuelve a afirmar que esta todo dibujado con un conflicto a la vista'),
 ('M34','TC-697', "  const PRIO_INV = 0;\n",
                  "",
  'placeholder'),
 # ── commit 7: solo lectura ──
 ('M35','TC-698', "  const ON = _cmSecsOn();\n  const otrasBases = [];",
                  "  const ON = _cmSecsOn();\n  try { const _e = document.getElementById('coa_istmo'); if (_e) _e.value = _e.value } catch (e) {}\n  try { const _f = document.getElementById('tdf_civ_grad'); if (_f) _f.value = '99' } catch (e) {}\n  const otrasBases = [];",
  'hace que cmDesdeEstudio ESCRIBA un campo del estudio'),
]

def md5(p):
    return hashlib.md5(io.open(p,'rb').read()).hexdigest()

def main():
    solo = None
    if '--solo' in sys.argv: solo = sys.argv[sys.argv.index('--solo')+1]
    if '--lista' in sys.argv:
        for m in MUT:
            if m[0] == 'M34': continue
            print(m[0], m[1], '-', m[4])
        print('total:', len([m for m in MUT if m[0] != 'M34']))
        return
    vivo = os.path.join(RAIZ, 'index.html')
    md5_antes = md5(vivo)
    if os.path.isdir(WT):
        subprocess.run(['git','worktree','remove','--force',WT], cwd=RAIZ, capture_output=True)
        shutil.rmtree(WT, ignore_errors=True)
    r = subprocess.run(['git','worktree','add','-q','--detach',WT,'HEAD'], cwd=RAIZ, capture_output=True, text=True)
    if r.returncode: print('no se pudo crear el worktree:', r.stderr); return
    shutil.copy(os.path.join(RAIZ,'scripts','test_clinico.mjs'), os.path.join(WT,'scripts','test_clinico.mjs'))
    orig = io.open(os.path.join(WT,'index.html'), encoding='utf-8').read()
    res = []
    t0 = time.time()
    for mid, tc, viejo, nuevo, por in MUT:
        if mid == 'M34': continue
        if solo and mid != solo: continue
        n = orig.count(viejo)
        if n != 1:
            res.append((mid, tc, 'ANCLA %d VECES' % n, por)); print(mid, 'ANCLA', n); continue
        io.open(os.path.join(WT,'index.html'),'w',encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
        p = subprocess.run(['node','scripts/test_clinico.mjs','--solo',tc], cwd=WT,
                           capture_output=True, text=True, timeout=900)
        out = p.stdout + p.stderr
        if 'RESULTADO' not in out:
            veredicto = 'NO CORRIO'
        elif ('  ' + tc) in out and (tc + ' ') in out and '✗' in out:
            veredicto = 'MUERTA'
        else:
            veredicto = 'SOBREVIVIO'
        res.append((mid, tc, veredicto, por))
        print('%-5s %-8s %-11s %s' % (mid, tc, veredicto, por))
    io.open(os.path.join(WT,'index.html'),'w',encoding='utf-8').write(orig)
    subprocess.run(['git','worktree','remove','--force',WT], cwd=RAIZ, capture_output=True)
    md5_desp = md5(vivo)
    print('')
    print('md5 del arbol vivo antes  : ' + md5_antes)
    print('md5 del arbol vivo despues: ' + md5_desp + ('  IDENTICO' if md5_antes == md5_desp else '  ⚠️ CAMBIO'))
    m = len([x for x in res if x[2]=='MUERTA'])
    print('MUERTAS %d de %d  en %.1f min' % (m, len(res), (time.time()-t0)/60))
    for x in res:
        if x[2] != 'MUERTA': print('  PENDIENTE', x[0], x[1], x[2], '-', x[3])

main()
