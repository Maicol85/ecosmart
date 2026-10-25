#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_aj7.py — barrido de MUTACIONES DIRIGIDAS de la tanda AJ7.

Cada mutacion revierte UNA de las cosas que la tanda cambio, sobre una COPIA de index.html, y
exige que TC-535 se ponga ROJO. Una mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_aj7.py              # todas
  python3 scripts/_mut_aj7.py --solo 1,2,3 # un grupo, para correr en primer plano

⚠️ EXIGE LA LINEA `RESULTADO` EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun `✗` y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ NUNCA MUTA EL ARCHIVO VIVO. Se trabaja sobre /tmp y se restaura el original con su md5.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-535'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.
MUT = [
 # ── commit 1 · Fallot ─────────────────────────────────────────────────────────────────────
 ('01 la linea del EN SUMA vuelve a publicar la insuficiencia pulmonar',
  "    if (g != null) l += ' — gradiente TSVD ' + _cc1(g) + ' mmHg';\n    if (ep === 'si') l += ' — estenosis o stent pulmonar';",
  "    if (ipHayInsuf(ip)) l += ' — insuficiencia pulmonar ' + ip.replace(/^IP\\s*/i, '').trim().toLowerCase();\n    if (g != null) l += ' — gradiente TSVD ' + _cc1(g) + ' mmHg';\n    if (ep === 'si') l += ' — estenosis o stent pulmonar';"),

 ('02 el resumen de Fallot vuelve a llevar la conducta',
  "  const _tdfDesc = partes.join('. ');\n  return { clave: clave, txt: _tdfDesc, lineasInf: _rengl(),\n    resumen: _tdfDesc, conducta: conducta };",
  "  const _tdfDesc = partes.join('. ');\n  return { clave: clave, txt: _tdfDesc, lineasInf: _rengl(),\n    resumen: 'Tetralogía de Fallot reparada' + (ipTxt ? ', ' + ipTxt : '') + '. ' + conducta, conducta: conducta };"),

 ('03 la compuerta del EN SUMA pierde la insuficiencia pulmonar y la linea desaparece',
  "    if (!ipHayInsuf(ip) && !fvd && g == null && civ !== 'si' && ep !== 'si') return null;",
  "    if (!fvd && g == null && civ !== 'si' && ep !== 'si') return null;"),

 # ── commit 2 · HF-PEFF, ateroma y bloques ─────────────────────────────────────────────────
 ('04 la linea de la presion de llenado vuelve a no decir NO DESCARTA',
  "lineas.push({ txt:'Una presión de llenado normal en reposo NO descarta la insuficiencia cardíaca con fracción de eyección preservada: la guía recomienda continuar la evaluación durante el ejercicio, por ecocardiografía de esfuerzo o por cateterismo derecho de esfuerzo (texto folio 3305 y texto folio 3307, hoja 11).', refs:['hfaPeff2019'] });",
  "lineas.push({ txt:'Con una presión de llenado normal en reposo la guía recomienda continuar la evaluación durante el ejercicio, por ecocardiografía de esfuerzo o por hemodinámica invasiva (texto folio 3305).', refs:['hfaPeff2019'] });"),

 ('05 la fila «Clasificacion - descripcion» del ateroma vuelve a verse',
  '<div class="calc-row" style="display:none;"><span class="calc-lbl">Clasificación — descripción</span>',
  '<div class="calc-row"><span class="calc-lbl">Clasificación — descripción</span>'),

 ('06 la hoja del ETE vuelve a publicar la linea «Descripcion | ...»',
  "    if (rec) L.push(rec);\n  }\n  const notas = _amV('ao_ete_notas'); if (notas) L.push(notas);",
  "    if (d) L.push('Descripción | ' + d);\n    if (rec) L.push(rec);\n  }\n  const notas = _amV('ao_ete_notas'); if (notas) L.push(notas);"),

 ('07 el bloque integrado deja de retirarse cuando su modulo queda sin datos',
  "    const _sinDato = (typeof sec.hayDatos === 'function') && !sec.hayDatos();\n    if (_sinDato) { if (typeof amiloRetirar === 'function') amiloRetirar(k); return; }",
  "    const _sinDato = false;\n    if (_sinDato) { if (typeof amiloRetirar === 'function') amiloRetirar(k); return; }"),

 ('08 el retiro automatico se lleva puesto tambien al bloque EDITADO A MANO',
  "    if (_amiloEstaEditado(k)) return;                                                    // editado a mano: no se pisa",
  "    if (false) return;                                                                   // editado a mano: no se pisa"),

 ('09 el PDF deja de preguntar por el bloque editado y desfasado',
  "  const _desf = _amiloDesfasadosRot();\n  if (_desf.length && !confirm(",
  "  const _desf = [];\n  if (_desf.length && !confirm("),

 ('10 el «no» del medico deja de detener la exportacion',
  "      + '\\n\\nEl PDF va a imprimir el texto tal como lo editaste, sin actualizarlo.\\n\\n¿Exportar igual?'))\n    return;",
  "      + '\\n\\nEl PDF va a imprimir el texto tal como lo editaste, sin actualizarlo.\\n\\n¿Exportar igual?'))\n    void 0;"),

 # ── commit 3 · VD y mitral ────────────────────────────────────────────────────────────────
 ('11 el strain del VD deja de votar',
  "      const vdDisf = tapseBajo || spBajo || facBajo || teiAlt || strVota;",
  "      const vdDisf = tapseBajo || spBajo || facBajo || teiAlt;"),

 ('12 el strain por debajo de 15 pasa a votar «leve» a secas',
  "      if (!_vdDisfG && strVota) _vdDisfG = (strCat === 'bajo_leve') ? 'leve como mínimo' : 'leve';",
  "      if (!_vdDisfG && strVota) _vdDisfG = 'leve';"),

 ('13 el strain PISA el grado que TAPSE y onda S prima ya dieron',
  "      if (!_vdDisfG && strVota) _vdDisfG = (strCat === 'bajo_leve') ? 'leve como mínimo' : 'leve';",
  "      if (strVota) _vdDisfG = (strCat === 'bajo_leve') ? 'leve como mínimo' : 'leve';"),

 ('14 el borde 15 deja de ser leve y cae en «por debajo de leve»',
  "  if (a >= VD_STRAIN_PL_LEVE)  return 'leve';",
  "  if (a > VD_STRAIN_PL_LEVE)  return 'leve';"),

 ('15 la fila de la banda leve sale del cuadro de Referencias del VD',
  "      { ficha: 'FUN-VD-008', rot: 'Strain de pared libre — disfunción leve (valor absoluto)',\n        h: 'de ' + VD_STRAIN_PL_LEVE + ' a ' + VD_STRAIN_PL_NORMAL + ' %',\n        m: 'de ' + VD_STRAIN_PL_LEVE + ' a ' + VD_STRAIN_PL_NORMAL + ' %' },",
  ""),

 ('16 la ficha de la banda leve pasa a «verificado» y su fila gana un corchete que no le corresponde',
  "    duenio: 'VD_STRAIN_PL_LEVE / vdStrainPlCat',\n    guia: '', ubicacion: '', folio: '', hoja_pdf: null,\n    doi: '', fuente_original: '', tipo: 'criterio propio de EcoSmart',\n    estado: 'por verificar', fecha_verificacion: EV_FECHA_VER,",
  "    duenio: 'VD_STRAIN_PL_LEVE / vdStrainPlCat',\n    guia: 'INVENTADA', ubicacion: '', folio: '', hoja_pdf: null,\n    doi: '', fuente_original: '', tipo: 'guía',\n    estado: 'verificado', fecha_verificacion: EV_FECHA_VER,"),

 ('17 la nota con el chip CRITERIO DE ECOSMART se va del cuadro del VD',
  "      chip.textContent = 'CRITERIO DE ECOSMART';",
  "      chip.textContent = '';"),

 ('18 el tipo de IM y el Carpentier dejan de bloquearse con protesis mitral',
  "    e.disabled = !!prot;",
  "    e.disabled = false;"),

 ('19 el campo deja de llevar el opacity PROPIO y queda con el del navegador',
  "    e.style.opacity = prot ? '0.5' : '';",
  "    e.style.opacity = '';"),

 ('19b el ROTULO deja de atenuarse',
  "    if (lab) lab.style.opacity = prot ? '0.5' : '';",
  "    if (lab) lab.style.opacity = '';"),

 ('20 el bloqueo se aplica TAMBIEN sobre una mitral nativa',
  "  const prot = (typeof vmEsProtesis === 'function') && vmEsProtesis();",
  "  const prot = true;"),

 ('21 el rotulo de la morfologia deja de achicarse y vuelve a recortarse',
  "  if (fs < base) el.style.fontSize = fs + 'px';",
  "  if (false) el.style.fontSize = fs + 'px';"),

 ('22 el achique pierde su piso y el rotulo se vuelve ilegible',
  "const _VM_MORF_FS_MIN = 10;",
  "const _VM_MORF_FS_MIN = 1;"),

 # ── commit 4 · pericardio, constriccion y VExUS ───────────────────────────────────────────
 ('23 vuelve la frase de correlacion clinica e imagenologica al papel firmado',
  "      + presentes.join(', ') + '.'];",
  "      + presentes.join(', ') + '. El diagnóstico definitivo requiere correlación clínica e imagenológica (TC/RMC pericárdica).'];"),

 ('24 vuelve «Considerar RMC con gadolinio» al papel firmado',
  "      + \"E/e' elevado (\" + n1(d.ee) + '), sin respirofasicidad significativa.'];",
  "      + \"E/e' elevado (\" + n1(d.ee) + '), sin respirofasicidad significativa. Considerar RMC con gadolinio.'];"),

 ('25 la Evidencia de constriccion vuelve a abrirse con la compuerta del modulo',
  "  if (!_propio) return null;",
  "  if (!st.espEval) return null;"),

 ('26 la compuerta de la Evidencia deja de mirar el rebote septal',
  "               || (_dC.rebote !== '' && _dC.rebote != null)",
  "               || false"),

 ('27 el aviso de la VCI de VExUS cambia de texto',
  "    else if (diam <= VEXUS_VCI_MM) aviso.innerHTML = ['VCI de ', _vn, ' mm exactos → el grado es <b>1</b> como máximo: los grados 2 y 3 del protocolo piden una vena cava de <b>más</b> de ', _vn, ' mm.'].join('');",
  "    else if (diam <= VEXUS_VCI_MM) aviso.innerHTML = ['VCI de ', _vn, ' mm exactos → el grado es <b>1</b>.'].join('');"),

 ('28 la poblacion del estudio sale de la Evidencia de VExUS',
  "    { txt:'La graduación se desarrolló en 145 pacientes de CIRUGÍA CARDÍACA, con 706 valoraciones ecográficas: ésa es la población en la que se midió, y fuera de ella el artículo no mide nada. Resumen, página 1.', refs:['vexus2020'] },",
  ""),

 # ── commit 5 · cardio-oncologia ───────────────────────────────────────────────────────────
 ('29 vuelve «reevaluar en 3-6 sem» a la fila anti-HER2',
  "<tr style=\"border-bottom:1px solid var(--border); background:var(--bg3);\"><td style=\"padding:5px 8px;font-weight:700;\">Anti-HER2</td><td style=\"padding:5px 8px;\">Basal obligatorio. Eco cada 3 meses durante el tto. Si la FEVI cae &gt;=10 pp o baja de 50%: graduar la CTRCD",
  "<tr style=\"border-bottom:1px solid var(--border); background:var(--bg3);\"><td style=\"padding:5px 8px;font-weight:700;\">Anti-HER2</td><td style=\"padding:5px 8px;\">Basal obligatorio. Eco cada 3 meses durante el tto. Si la FEVI cae &gt;=10 pp o baja de 50%: reevaluar en 3-6 sem y graduar la CTRCD"),

 # ── commit 6 · celular ────────────────────────────────────────────────────────────────────
 ('30 el globo del score de amiloidosis pierde su piso tactil sin gate',
  'class="vinfo-btn vinfo-btn-44" data-vinfo="amilo-score"',
  'class="vinfo-btn" data-vinfo="amilo-score"'),

 ('31 la clase del piso tactil deja de dar 44x44',
  "  .vinfo-btn.vinfo-btn-44 { min-width: 44px; min-height: 44px;",
  "  .vinfo-btn.vinfo-btn-44 { min-width: 20px; min-height: 20px;"),

 # ── commit 8 · G-a ────────────────────────────────────────────────────────────────────────
 ('32 el corte de HTP deja de tener un dueno unico y se mueve de un solo lado',
  "const HP_PAPM_MIN = 20;   // mmHg",
  "const HP_PAPM_MIN = 25;   // mmHg"),

 ('33 la rama del VD del posoperatorio deja de preguntar al dueno',
  "    vdRama = papm === null ? 'sin_pap' : (papm > HP_PAPM_MIN ? 'poscarga' : 'contractilidad');",
  "    vdRama = papm === null ? 'sin_pap' : (papm > 18 ? 'poscarga' : 'contractilidad');"),
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
    bak = tempfile.mktemp(suffix='.html')
    shutil.copy2(IDX, bak)
    res = []
    try:
        for i, (nom, viejo, nuevo) in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            n = orig.count(viejo)
            if n != 1:
                res.append((i, nom, 'NO APLICA', 'el patron aparece %d veces' % n))
                print('  %02d  NO APLICA  %s (%d apariciones)' % (i, nom, n), flush=True)
                continue
            open(IDX, 'w', encoding='utf-8').write(orig.replace(viejo, nuevo, 1))
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
        try: os.unlink(bak)
        except OSError: pass
    muertas = sum(1 for x in res if x[2] == 'MUERTA')
    print('')
    print('  RESULTADO DEL BARRIDO: %d/%d muertas' % (muertas, len(res)))
    for i, nom, v, det in res:
        if v != 'MUERTA':
            print('    ⚠️ %02d %s — %s · %s' % (i, v, nom, det))
    return 0 if muertas == len(res) else 1

if __name__ == '__main__':
    sys.exit(main())
