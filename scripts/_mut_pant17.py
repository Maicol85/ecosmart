#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Barrido de mutaciones dirigidas de la tanda PANT-17.

CORRE EN UN WORKTREE Y NUNCA SOBRE EL ARBOL VIVO, con guarda de md5 antes y despues.
Cada mutacion declara SU caso: correr los seis por cada una taparia un reparto mal hecho.

⚠️ EL ARCHIVO SE ESCRIBE CON flush + fsync. Sin eso el servidor del suite lee el index.html
SIN los cambios y la mutacion sale «sobrevivio» sobre un defecto que, aplicado a mano, pone el
caso en rojo — es lo que PANT-14c pago con nueve mutaciones falsas.

   python3 scripts/_mut_pant17.py <worktree> [--solo M01,M02]
"""
import hashlib, io, os, subprocess, sys, time

WT = sys.argv[1] if len(sys.argv) > 1 else None
SOLO = None
for a in sys.argv[2:]:
    if a.startswith('--solo'):
        SOLO = set((a.split('=', 1)[1] if '=' in a else sys.argv[sys.argv.index(a) + 1]).split(','))
if not WT or not os.path.isdir(WT):
    print('uso: python3 scripts/_mut_pant17.py <worktree> [--solo M01,M02]'); sys.exit(2)
IDX = os.path.join(WT, 'index.html')

#  id    caso      buscar                                        reemplazar
MUT = [
 ('M01', 'TC-714', "{ clave:'dap.ev.anatapta', lbl:'Anatomía apta para el cierre con dispositivo', guia:'esc',",
                   "{ clave:'dap.ev.anatapta', lbl:'Anatomía apta para el cierre con dispositivo',"),
 ('M02', 'TC-714', "const _dapDirResp = (dir === 'id') ? 'si' : (dir === 'di' ? 'no' : '');",
                   "const _dapDirResp = (dir === 'id' || dir === 'bi') ? 'si' : (dir === 'di' ? 'no' : '');"),
 ('M03', 'TC-714', "const _dapDirResp = (dir === 'id') ? 'si' : (dir === 'di' ? 'no' : '');",
                   "const _dapDirResp = (dir === 'id') ? 'no' : (dir === 'di' ? 'si' : '');"),
 ('M04', 'TC-715', "{ clave:'coa.ev.hta'", "{ clave:'coa.ev.BORRADA_NO_EXISTE'"),
 ('M05', 'TC-715', "'coa.ev.picopico20': _coaNum('coa_gradiente_picopico', 'gt', 20)",
                   "'coa.ev.picopico20': _coaNum('coa_gradiente_picopico', 'lt', 20)"),
 ('M06', 'TC-715', "salen de TRES guías: la ESC 2024 de enfermedades aórticas",
                   "salen de TRES guías: la guía de enfermedades aórticas"),
 ('M07', 'TC-716', "\n  return { filas: filas,\n    clinica: clinica,\n    bloques: [\n      { tit:'Evaluación por imagen",
                   "\n  return { filasNO: filas,\n    clinica: clinica,\n    bloques: [\n      { tit:'Evaluación por imagen"),
 ('M08', 'TC-716', "{ tit:'Tetralogía de Fallot reparada — ventrículo derecho y arritmias'",
                   "{ tit:'Tetralogía de Fallot reparada'"),
 ('M09', 'TC-716', "EP_PREG_ACC.forEach(", "[].forEach("),
 ('M10', 'TC-717', "    clinica: _vabcClinica(),\n    bloques: _vabcBloques(),\n    compacta: true,\n    preguntas: true,",
                   "    clinica: _vabcClinica(),\n    bloques: _vabcBloques(),\n    compacta: true,\n    preguntas: false,"),
 ('M11', 'TC-717', "  return { filas: filas,\n    aviso: (C && C.clave === 'contradiccion') ? C.txt : '',",
                   "  return { filas: filas, preguntas: true,\n    aviso: (C && C.clave === 'contradiccion') ? C.txt : '',"),
 ('M12', 'TC-718', "{ clave:'vap.ev.reparada', lbl:'Ventana reparada quirúrgicamente', guia:'serie',",
                   "{ clave:'vap.ev.reparada', lbl:'Ventana reparada quirúrgicamente',"),
 ('M13', 'TC-718', "rec:'en el síndrome de Eisenmenger, el cierre de cualquier cortocircuito intracardíaco o vascular NO debe realizarse",
                   "rec:'Clase 3: Daño · Nivel B-NR — en el síndrome de Eisenmenger, el cierre de cualquier cortocircuito intracardíaco o vascular NO debe realizarse"),
 ('M14', 'TC-718', "const _vapEisen = (dir === 'di') ? 'si' : (dir === 'id' ? 'no' : '');",
                   "const _vapEisen = (dir === 'di' || dir === 'bi') ? 'si' : (dir === 'id' ? 'no' : '');"),
 ('M15', 'TC-718', "  return { filas: filas,\n    aviso: C.txt || '',\n    clinica: clinica,\n    bloques: [\n      { tit:'Qué es, y cómo se clasifica",
                   "  return { filasNO: filas,\n    aviso: C.txt || '',\n    clinica: clinica,\n    bloques: [\n      { tit:'Qué es, y cómo se clasifica"),
 ('M16', 'TC-718', "  { k:'yakut2018apw',", "  { k:'yakut2018apw_BORRADA',"),
 ('M17', 'TC-719', "&& Math.abs(e.clientX - _tap.x) < 6 && Math.abs(e.clientY - _tap.y) < 6",
                   "&& Math.abs(e.clientX - _tap.x) < 999 && Math.abs(e.clientY - _tap.y) < 999"),
 ('M18', 'TC-719', "      if (_sg !== _cmSig) { _cmSig = _sg; _cm3d.sinColor = Object.create(null) } }",
                   "      if (false) { _cmSig = _sg; _cm3d.sinColor = Object.create(null) } }"),
 ('M19', 'TC-719', "      ob.userData.cmK = 'm' + (n++);", "      ob.userData.cmK = null;"),
 ('M20', 'TC-714', "    const o = _indOrigen(p.clave === 'dap.ev.netoid' ? _dapDirResp : null, p.clave);",
                   "    const o = _indOrigen(null, p.clave);"),
]

orig = io.open(IDX, encoding='utf-8').read()
md5_0 = hashlib.md5(orig.encode('utf-8')).hexdigest()
print('md5 del arbol del worktree ANTES: %s' % md5_0)
res, t0 = [], time.time()
for mid, caso, a, b in MUT:
    if SOLO and mid not in SOLO:
        continue
    n = orig.count(a)
    if n != 1:
        res.append((mid, caso, 'NO APLICA (%d coincidencias)' % n)); print('%s %-8s NO APLICA (%d)' % (mid, caso, n)); continue
    with io.open(IDX, 'w', encoding='utf-8') as f:
        f.write(orig.replace(a, b, 1)); f.flush(); os.fsync(f.fileno())
    p = subprocess.run(['node', 'scripts/test_clinico.mjs', '--solo', caso],
                       cwd=WT, capture_output=True, text=True)
    out = p.stdout
    if 'RESULTADO' not in out:
        v = 'NO CORRIO'
    elif ('✗' in out) or ('CON FALLAS' in out):
        v = 'MUERTA'
    else:
        v = 'SOBREVIVIO'
    res.append((mid, caso, v)); print('%s %-8s %s' % (mid, caso, v))
    with io.open(IDX, 'w', encoding='utf-8') as f:
        f.write(orig); f.flush(); os.fsync(f.fileno())

fin = hashlib.md5(io.open(IDX, encoding='utf-8').read().encode('utf-8')).hexdigest()
print('')
print('md5 del arbol del worktree DESPUES: %s  %s' % (fin, 'IDENTICO' if fin == md5_0 else 'CAMBIO — REVISAR'))
m = len([x for x in res if x[2] == 'MUERTA'])
print('MUERTAS %d de %d  (%.1f min)' % (m, len(res), (time.time() - t0) / 60))
for x in res:
    if x[2] != 'MUERTA':
        print('   >>> %s %s %s' % x)
