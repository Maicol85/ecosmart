#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
_mut_img.py — barrido de MUTACIONES DIRIGIDAS de la tanda IMAGENES (2026-10-29).

Cada mutacion revierte UNA de las cosas que los commits 2 a 5 cambiaron —o la aplica DE MAS—
sobre el index.html del directorio donde se lo corra, y exige que TC-550 se ponga ROJO. Una
mutacion que sobrevive es cobertura que no existe.

  python3 scripts/_mut_img.py              # todas
  python3 scripts/_mut_img.py --solo 1,2   # un grupo

⚠️ SE CORRE EN UN WORKTREE, NUNCA SOBRE EL ARBOL VIVO. El arnes restaura el original y comprueba
   su md5, pero con el arbol vivo cualquier corte a mitad de camino deja una mutacion aplicada y
   la medicion siguiente se hace sobre un archivo envenenado.
⚠️ EXIGE LA LINEA RESULTADO EN LA SALIDA. Si el suite no arranca, stdout queda vacio, no hay
   ningun signo de falla y TODAS las mutaciones saldrian «sobrevivio» — indistinguible de «no hay
   cobertura». Sin esa linea el veredicto es NO CORRIO.
⚠️ TRES DE LAS CATORCE NO REVIERTEN NADA: LA APLICAN DE MAS. La 09 hace que el esquema JUZGUE, la
   10 que el barrido de recalculo escriba la imagen —o sea que abrir un estudio guardado le meta
   un esquema que nadie pidio— y la 13 que el esquema entre entre los slots del estudio, que es
   por donde llegaria al PDF firmado. Existen porque las condiciones que las matan son CONTROLES
   NEGATIVOS, y un control negativo que ninguna mutacion puede romper no esta probando nada.
⚠️ LA 03 ROMPE LAS DOS MITADES A LA VEZ. Lo que la vista de imagenes esconde son TRES controles
   y la condicion (A2) los mira juntos: una mutacion que deje de esconder uno solo la pone en
   rojo igual, pero no prueba que el mecanismo —el display guardado en el dataset— sea el que
   funciona. Esta rompe el helper, o sea los tres a la vez.
"""
import hashlib, os, re, shutil, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = os.path.join(RAIZ, 'index.html')
CASO = 'TC-550'

def md5(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# (nombre, viejo, nuevo) — `viejo` tiene que aparecer EXACTAMENTE una vez.

MUT = [
 # ── commit 2 · la pantalla ───────────────────────────────────────────────────────
 ('01 la vista por omision pasa a ser la de imagenes',
  "let igVista = 'inf';                      /* 'inf' | 'img' — «Informes guardados» por omisión */",
  "let igVista = 'img';                      /* 'inf' | 'img' — «Informes guardados» por omisión */"),

 ('02 los meses nacen ABIERTOS',
  "    const cerrado = !igImgMesesAbiertos.has(k);",
  "    const cerrado = igImgMesesAbiertos.has(k);"),

 # Rompe el helper, o sea los TRES controles que la vista esconde, de una vez.
 ('03 la vista de imagenes deja de esconder lo que es de la otra',
  """function _igMostrar(id, mostrar) {
  const e = document.getElementById(id);
  if (!e) return;
  if (e.dataset.igDisp === undefined) e.dataset.igDisp = e.style.display || '';
  e.style.display = mostrar ? e.dataset.igDisp : 'none';
}""",
  """function _igMostrar(id, mostrar) {
  const e = document.getElementById(id);
  if (!e) return;
  if (e.dataset.igDisp === undefined) e.dataset.igDisp = e.style.display || '';
  e.style.display = e.dataset.igDisp;
}"""),

 ('04 la miniatura pierde su numero',
  """    const n = document.createElement('span');
    n.className = 'ig-img-n';
    n.textContent = it.n;
    b.appendChild(n);""",
  """    const n = document.createElement('span');
    n.className = 'ig-img-n';
    n.textContent = '';
    b.appendChild(n);"""),

 ('05 la miniatura deja de nombrar su estudio: se va el enlace de donde viene',
  """    b.title = 'Imagen ' + it.n + ' · ' + quien;
    b.setAttribute('aria-label', 'Abrir la imagen ' + it.n + ' de ' + quien);""",
  """    b.title = 'Imagen ' + it.n;
    b.setAttribute('aria-label', 'Abrir la imagen ' + it.n);"""),

 # LA GRANDE: la pantalla deja de usar los estudios YA filtrados y se arma con todos.
 ('06 la pagina se arma con TODOS los estudios y no con los filtrados',
  "  const vis = (Array.isArray(estudios) ? estudios : []).slice().sort(igCmpFecha);",
  "  const vis = todos.slice();"),

 # Y la variante fina: la cadena CORTA, que no ve los filtros clinicos ni los numericos.
 ('07 la pagina se arma con la cadena CORTA de filtros',
  "  igImgPintar(filtrados);\n}\nwindow.igImgSync = igImgSync;",
  "  igImgPintar(typeof igFiltrar === 'function' ? igFiltrar(null) : filtrados);\n}\nwindow.igImgSync = igImgSync;"),

 # ── commit 3 · la estrella ───────────────────────────────────────────────────────
 ('08 la estrella de imagen se pinta del mismo amarillo que «Casos de interes»',
  "    background:none; border:none; cursor:pointer; padding:0; }\n  .ig-img-st.off",
  "    background:none; border:none; cursor:pointer; padding:0; color:#f5c842 !important; }\n  .ig-img-st.off"),

 ('09 desmarcar la estrella CONSERVA la nota',
  """          if (!sl.star) sl.nota = '';""",
  """          if (!sl.star && false) sl.nota = '';"""),

 ('10 la marca no llega al disco',
  """          if (parche && 'star' in parche)    sl.star = !!parche.star;""",
  """          if (parche && 'star' in parche && false)    sl.star = !!parche.star;"""),

 # ── commit 4 · el PPT ────────────────────────────────────────────────────────────
 ('11 el limite del PPT deja de ser el de la demo aprobada',
  "const IG_IMG_PPT_MAX = 24;",
  "const IG_IMG_PPT_MAX = 100;"),

 ('12 el orden del mazo pasa a ser el de la grilla y no el de eleccion',
  "    _igImgSel.push({ uuid, idx, n });",
  "    _igImgSel.push({ uuid, idx, n }); _igImgSel.sort(function(a,b){ return a.n - b.n });"),

 ('13 exportar se saltea el aviso previo',
  "  igImgPptAviso(true);\n}\nwindow.igImgPptPedir = igImgPptPedir;",
  "  igImgPptExportar();\n}\nwindow.igImgPptPedir = igImgPptPedir;"),

 # ── commit 5 · el esquema ────────────────────────────────────────────────────────
 ('14 el esquema acumula una copia por cambio',
  "          const i = esqs.findIndex(e => e && e.clave === ent.clave);",
  "          const i = -1;"),

 # No revierte: APLICA DE MAS. El esquema pasa a juzgar.
 ('15 el esquema se pone a juzgar',
  "  if (!sil.length) g += L(212, 130, 'sin morfología cargada', 'middle', 10, C.tenue);",
  "  g += L(212, 130, 'apta para cierre', 'middle', 10, C.tenue);"),

 # No revierte: APLICA DE MAS. El barrido vuelve a escribir, o sea que abrir un estudio
 # guardado le mete un esquema que nadie pidio.
 ('16 el barrido de recalculo vuelve a guardar la imagen',
  """  cont.innerHTML = oaiEsqSVG();
}
window.oaiEsqSync = oaiEsqSync;""",
  """  cont.innerHTML = oaiEsqSVG();
  oaiEsqGuardarDiferido();
}
window.oaiEsqSync = oaiEsqSync;"""),

 ('17 guardar el estudio se lleva los esquemas puestos',
  """          const esqs = (prev && Array.isArray(prev.esqs))
            ? prev.esqs.filter(e => e && _imgSrcOK(e.dataURL)) : [];""",
  """          const esqs = [];"""),

 # No revierte: APLICA DE MAS. El esquema entra entre los SLOTS, que es por donde llegaria
 # al PDF firmado y al PPT del estudio.
 ('18 el esquema entra entre los slots del estudio',
  """      return _tx('readonly', (os, ok) => {
        const q = os.get(uuid);
        q.onsuccess = () => ok({ imgs: (q.result && Array.isArray(q.result.imgs)) ? q.result.imgs : [] });
      }).then(r => (r && r.imgs) ? r.imgs : null);""",
  """      return _tx('readonly', (os, ok) => {
        const q = os.get(uuid);
        q.onsuccess = () => ok({ imgs: ((q.result && Array.isArray(q.result.imgs)) ? q.result.imgs : [])
                                        .concat((q.result && q.result.esqs) || []) });
      }).then(r => (r && r.imgs) ? r.imgs : null);"""),
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
        for i, ent in enumerate(MUT, 1):
            if solo and i not in solo:
                continue
            nom = ent[0]
            # Una entrada puede traer UN par o una LISTA de pares: ver la nota de la 13.
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
