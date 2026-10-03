#!/usr/bin/env python3
"""
_mut_sinapaga.py — arnes TEMPORAL de mutacion para la tanda «Sin apaga el boton».

Una mutacion por COMPORTAMIENTO nuevo. Cada una revierte o rompe exactamente una pieza y se
espera que ponga en rojo el caso que le toca. Un caso que no se puede hacer fallar no prueba nada.

REGLAS DEL PROCEDIMIENTO (CLAUDE.md), implementadas y no comentadas:
  · Se muta sobre una COPIA del archivo vivo, y se compara el md5 del vivo contra su snapshot
    ANTES de aplicar. Si no coinciden, se ABORTA: un arnes que restaura desde un snapshot viejo es
    una maquina de deshacer ediciones en silencio.
  · md5 antes, despues de aplicar y despues de revertir, en cada mutacion.
  · Se puntua SOLO si la salida trae la linea RESULTADO. Sin eso el veredicto es NO CORRIO, porque
    un suite que no arranca deja stdout vacio, no imprime ningun ✗ y TODAS las mutaciones saldrian
    «sobrevivio» — indistinguible de «no hay cobertura». Ya reporto 7 falsos una vez.
  · Cada mutacion tiene que caer en EL CASO QUE LE CORRESPONDE, no en cualquiera.

Uso:  python3 scripts/_mut_sinapaga.py            # todas
      python3 scripts/_mut_sinapaga.py M3         # una
"""

import hashlib
import re
import shutil
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VIVO = RAIZ / 'index.html'
SNAP = Path('/tmp/_mut_sinapaga_snapshot.html')


def md5(p: Path) -> str:
    return hashlib.md5(p.read_bytes()).hexdigest()


# (id, casos esperados en rojo, descripcion, viejo, nuevo)
MUTACIONES = [
    (
        'M1', ['TC-402'],
        'El menu ▼ vuelve a ENCENDER el boton con «Sin» (el defecto original)',
        "    const esSin = (typeof sevEsSin === 'function') && sevEsSin(tipo, valor);\n"
        "    if (esSin) {\n"
        "      if (typeof sevSinApagaPastilla === 'function') sevSinApagaPastilla(tipo, valv, valor);\n"
        "    } else {\n"
        "      const pill = g('pill-' + tipo + '-' + valv);\n"
        "      if (pill && !pill.classList.contains('btn-primary')) toggleValvPill(valv, tipo);\n"
        "    }",
        "    const pill = g('pill-' + tipo + '-' + valv);\n"
        "    if (pill && !pill.classList.contains('btn-primary')) toggleValvPill(valv, tipo);",
    ),
    (
        'M2', ['TC-402', 'TC-397'],
        'El DESPLEGABLE de la aortica deja de apagar el boton (reabre el agujero del escalon)',
        "  if (typeof sevSinApagaDesdeSelect === 'function') {\n"
        "    try { sevSinApagaDesdeSelect(el.id); } catch (e) { console.warn('[sevSinApaga/ao]', el.id, e); }\n"
        "  }",
        "  /* MUTANTE M2 */",
    ),
    (
        'M3', ['TC-402'],
        'La visibilidad vuelve a depender SOLO del boton (se cae la mitad de la discrepancia)',
        '  const ver = abierta || discrepa || hayGrado;',
        '  const ver = abierta;',
    ),
    (
        'M4', ['TC-397', 'TC-399'],
        'El escalon aortico vuelve a quedar APAGADO',
        '    const EA_ESCALON_SIN_GRADO = true;',
        '    const EA_ESCALON_SIN_GRADO = false;',
    ),
    (
        'M5', ['TC-406'],
        'R6 deja de apagar el boton cuando suelta a «sin»',
        "      if (typeof sevSinApagaPastilla === 'function') {\n"
        "        try { sevSinApagaPastilla(C.tipo, C.valv, calc); }\n"
        "        catch (e) { console.warn('[sevSinApaga/R6] ' + clave, e); }\n"
        "      }",
        "      /* MUTANTE M5 */",
    ),
    (
        'M6', ['TC-406'],
        'Se cae la cuarta compuerta: el escalon afirma con el insumo fuera de banda',
        "      _pillA('esten') && !_aoBloqueado('ea');",
        "      _pillA('esten');",
    ),
    (
        'M7', ['TC-403'],
        'La tarjeta pre-PDF vuelve a escribir solo el oculto de la IAo (select y oculto divergen)',
        "setGrade('ia_grado','rev-ia','ia_sev_final')",
        "setGrade('ia_grado','rev-ia')",
    ),
    (
        'M8', ['TC-403'],
        'La tarjeta pre-PDF vuelve a repintar solo la mitral (la aortica queda rancia)',
        "    if (typeof SEV_SINC !== 'undefined' && typeof sevSincronizar === 'function') {\n"
        "      Object.keys(SEV_SINC).forEach(function (k) {\n"
        "        try { sevSincronizar(k); } catch (e) { console.warn('[tarjeta/sevSincronizar] ' + k, e); }\n"
        "      });\n"
        "    }",
        "    if (typeof _imSincronizarPantalla === 'function') _imSincronizarPantalla();\n"
        "    if (typeof _emSincronizarPantalla === 'function') _emSincronizarPantalla();",
    ),
    (
        'M9', ['TC-404'],
        'SEV_SINC.ia pierde su recalcular: al reabrir se vacia el cajon con el motivo firmado',
        "    recalcular: function(){ if (typeof calcIA_ESC === 'function') calcIA_ESC(); },\n"
        "    /* Exactamente lo que hacía el `else` de `sevSincronizar` antes de generalizarse: la marca de",
        "    /* Exactamente lo que hacía el `else` de `sevSincronizar` antes de generalizarse: la marca de",
    ),
    (
        'M10', ['TC-407'],
        'El gate de los espejos de EM vuelve a leer el style.display en vez de pillOn',
        "  const oculto = (typeof pillOn === 'function')\n"
        "    ? !pillOn('mitral', 'esten')\n"
        "    : (!det || det.style.display === 'none');",
        "  const oculto = !det || det.style.display === 'none';",
    ),
    (
        'M11', ['TC-405'],
        'La regla de apagado alcanza a la TRICUSPIDE (se borra la costura por valvula)',
        "const SEV_SIN_APAGA_VALVS = Object.freeze(['aortica', 'mitral']);",
        "const SEV_SIN_APAGA_VALVS = Object.freeze(['aortica', 'mitral', 'tricuspide']);",
    ),
    (
        'M12', ['TC-402'],
        'El token de «Sin» de la insuficiencia se desalinea (la regla deja de reconocerlo)',
        "const SEV_TOKEN_SIN = Object.freeze({ esten: 'sin', insuf: '0' });",
        "const SEV_TOKEN_SIN = Object.freeze({ esten: 'sin', insuf: 'no' });",
    ),
]


def correr_suite(casos):
    """Corre SOLO los casos que la mutacion deberia romper. Devuelve (veredicto, rojos, linea)."""
    r = subprocess.run(
        ['node', 'scripts/test_clinico.mjs', '--solo', ','.join(casos)],
        cwd=RAIZ, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    m = re.search(r'RESULTADO: (\d+)/(\d+)', out)
    if not m:
        return 'NO CORRIO', [], '(sin linea RESULTADO — el suite no arranco)'
    rojos = re.findall(r'(TC-\d+)[^\n]*✗', out)
    return 'OK', rojos, m.group(0)


def main():
    solo = sys.argv[1] if len(sys.argv) > 1 else None

    if not SNAP.exists():
        shutil.copy2(VIVO, SNAP)
        print(f'snapshot nuevo: {SNAP}  md5={md5(SNAP)}')
    elif md5(SNAP) != md5(VIVO):
        print('⛔ ABORTO: el snapshot NO coincide con el archivo vivo.')
        print(f'   vivo={md5(VIVO)}  snapshot={md5(SNAP)}')
        print('   Revisar y borrar el snapshot a mano si el archivo cambio a proposito.')
        return 2

    base = md5(VIVO)
    print(f'md5 base: {base}\n')
    filas = []

    for mid, casos, desc, viejo, nuevo in MUTACIONES:
        if solo and mid != solo:
            continue
        txt = VIVO.read_text()
        n = txt.count(viejo)
        if n != 1:
            filas.append((mid, 'NO APLICA', f'el patron aparece {n} veces (se esperaba 1)', desc))
            print(f'{mid}: ⛔ NO APLICA — el patron aparece {n} veces')
            continue

        VIVO.write_text(txt.replace(viejo, nuevo, 1))
        mut = md5(VIVO)
        if mut == base:
            VIVO.write_text(txt)
            filas.append((mid, 'NO APLICA', 'el md5 no cambio: la mutacion no edito nada', desc))
            continue

        veredicto, rojos, linea = correr_suite(casos)
        shutil.copy2(SNAP, VIVO)
        rev = md5(VIVO)

        if rev != base:
            print(f'{mid}: ⛔ LA REVERSION FALLO (md5 {rev} != {base}) — se detiene todo')
            return 2

        if veredicto == 'NO CORRIO':
            est = 'NO CORRIO'
        else:
            esperados = [c for c in casos if c in rojos]
            if esperados:
                est = 'MUERTA'
            else:
                est = 'SOBREVIVIO'
        filas.append((mid, est, f'{linea} · rojos={rojos or "ninguno"}', desc))
        icono = {'MUERTA': '✓', 'SOBREVIVIO': '✗', 'NO CORRIO': '?'}[est]
        print(f'{mid}: {icono} {est:11s} {linea}  rojos={rojos or "ninguno"}')
        print(f'      {desc}')

    print('\n' + '=' * 78)
    muertas = sum(1 for f in filas if f[1] == 'MUERTA')
    print(f'MUTACIONES: {len(filas)} corridas · {muertas} MUERTAS (en rojo, como corresponde)')
    for mid, est, info, desc in filas:
        if est != 'MUERTA':
            print(f'  ⚠ {mid} {est}: {desc}  [{info}]')
    print(f'md5 final: {md5(VIVO)} (base {base})')
    return 0 if muertas == len(filas) else 1


if __name__ == '__main__':
    sys.exit(main())
