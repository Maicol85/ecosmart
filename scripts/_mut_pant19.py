#!/usr/bin/env python3
"""_mut_pant19.py - barrido de mutaciones dirigidas de la tanda PANT-19.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso (P14c-i).
Cada mutacion declara SU caso: con los siete por mutacion, un reparto mal hecho queda tapado
por el caso de otro commit.
"""
import os, re, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ,'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT,'index.html')

MUT = [
 # ---- TC-729: la tabla A4 contra su transcripcion ----
 ('01 se pierde una celda de la A4 (la EOA de la St. Jude Standard 23)','TC-729',
  [("['23',[21.8,7.5],[13.4,5.6],[1.6,0.4]]","['23',[21.8,7.5],[13.4,5.6],null]")]),
 ('02 un valor de la A4 cambia (el gradiente medio de la St. Jude Standard 23)','TC-729',
  [("['23',[21.8,7.5],[13.4,5.6],[1.6,0.4]]","['23',[21.8,7.5],[13.5,5.6],[1.6,0.4]]")]),
 ('03 se pierde un modelo entero de la A4','TC-729',
  [("{n:'Arbor Surgical Trilogy',d:'',t:'',f:'53',","{n:'Arbor Surgical Trilogy',d:'',t:'',f:'',x:1,")]),
 ('04 se ADIVINA el tipo de un modelo que la tabla no imprime','TC-729',
  [("{n:'Abbott Epic',d:'',t:'',f:'53',","{n:'Abbott Epic',d:'',t:'bio',f:'53',")]),
 ('05 la Edwards Mira 25 gana un desvio que la tabla no imprime','TC-729',
  [("['25',null,[13.1,3.8],[1.9,null]]","['25',null,[13.1,3.8],[1.9,0.4]]")]),
 ('06 los dos Mosaic se funden en uno','TC-729',
  [("{n:'Edwards Mosaic',d:'',t:'',","{n:'Medtronic Mosaic',d:'',t:'',")]),
 ('07 un tamano en rango pasa a numero','TC-729',
  [("['17-19',null,[9.7,4.2],[4.2,1.8]]","['17',null,[9.7,4.2],[4.2,1.8]]")]),
 # ---- TC-730: las tablas de TAVI ----
 ('08 un valor de la A1 cambia (el DVI de la SAPIEN 3 todos los tamanos)','TC-730',
  [("['All',null,[11.18,4.35],[1.66,0.38],[0.43,0.09]]","['All',null,[11.18,4.35],[1.66,0.38],[0.44,0.09]]")]),
 ('09 un valve-in-valve deja de estar marcado como tal','TC-730',
  [("{n:'SAPIEN 3 valve-in-valve',d:'',t:'tavi',viv:1,","{n:'SAPIEN 3 valve-in-valve',d:'',t:'tavi',")]),
 ('10 el «NA» impreso se carga como un numero','TC-730',
  [("{n:'SAPIEN',d:'',t:'tavi',f:'51',s:[['20',null,null,null,null]","{n:'SAPIEN',d:'',t:'tavi',f:'51',s:[['20',null,[9,4],[1.5,0.4],[0.5,0.1]]")]),
 ('11 un valve-in-valve gana un DVI que la tabla no imprime','TC-730',
  [("s:[['All',[33.93,10.11],[27.00,10.20],[1.07,0.32],null]]","s:[['All',[33.93,10.11],[27.00,10.20],[1.07,0.32],[0.43,0.09]]]")]),
 # ---- TC-731: el componente ----
 ('12 el boton se ve tambien con valvula nativa','TC-731',
  [("  wrap.style.display = hayCat ? '' : 'none';","  wrap.style.display = '';")]),
 ('13 el boton pierde su piso tactil de 44 px','TC-731',
  [(".vmod-btn{min-height:44px;white-space:nowrap;}",".vmod-btn{min-height:30px;white-space:nowrap;}")]),
 ('14 la sugerencia pasa a buscar por PREFIJO y no por palabra','TC-731',
  [("  const lst=C.lista.filter(m=>(' '+_vmNorm(m.n).replace(/-/g,' ')).indexOf(' '+q)>-1)",
    "  const lst=C.lista.filter(m=>_vmNorm(m.n).indexOf(q)===0)")]),
 ('15 la sugerencia pasa a buscar en cualquier posicion, no al principio de una palabra','TC-731',
  [("  const lst=C.lista.filter(m=>(' '+_vmNorm(m.n).replace(/-/g,' ')).indexOf(' '+q)>-1)",
    "  const lst=C.lista.filter(m=>_vmNorm(m.n).indexOf(q)>-1)")]),
 # ⚠️ LAS DOS MITADES JUNTAS, y lo pide una medicion: con SOLO el CSS la lista sigue colgada de
 # la card, asi que «top:100%» la manda DEBAJO de la card y no tapa nada. El defecto original es
 # la lista DENTRO de la fila —que es position:relative— y absoluta.
 ('16 la lista de sugerencias vuelve a flotar sobre los enlaces','TC-731',
  [("  const ul=document.createElement('ul'); ul.className='vmod-sug'; ul.id='vmod-sug'; ul.hidden=true;\n  c.appendChild(ul);",
    "  const ul=document.createElement('ul'); ul.className='vmod-sug'; ul.id='vmod-sug'; ul.hidden=true;\n  fila.appendChild(ul);"),
   ("#vmod-card .vmod-sug{list-style:none;margin:2px 0 6px;padding:3px;background:var(--bg2);",
    "#vmod-card .vmod-sug{list-style:none;margin:2px 0 6px;padding:3px;position:absolute;left:0;right:158px;top:100%;z-index:5;background:var(--bg2);")]),
 ('17 la lista se abre sola al abrir la card','TC-731',
 # ⚠️ LAS DOS MITADES JUNTAS: con solo llamar a _vModSug al abrir, el campo esta vacio y la
 # lista sigue oculta, asi que la mutacion era EQUIVALENTE. Hace falta ademas que la consulta
 # vacia deje de ocultar, que es lo que la abre con TODOS los modelos.
  [("  const ul=_vmEl('vmod-sug'); if(ul) ul.hidden=true;   /* NO se abre sola: taparia los enlaces */",
    "  _vModSug();"),
   ("  if(!q){ ul.hidden=true; return; }", "  if(!q){ }"),
   ("  if (ul && !ul.hidden && !ul.contains(e.target) && e.target!==inp) ul.hidden=true;",
    "  if (false) ul.hidden=true;")]),
 ('18 Escape deja de cerrar la card','TC-731',
  [("  if (e.key==='Escape' && _vModPos){ const b=_vmEl('vmod-'+_vModPos+'-btn'); vModCerrar(); if(b) b.focus(); }",
    "  if (false && _vModPos){ const b=_vmEl('vmod-'+_vModPos+'-btn'); vModCerrar(); if(b) b.focus(); }")]),
 # ---- TC-732: los esperados, la indexada, lo medido y el modo manual ----
 ('19 la EOA indexada predicha deja de dividirse por el ASC','TC-732',
  [("  const eoai = +( _vmN(eoaMedia) / bsa ).toFixed(2);","  const eoai = +( _vmN(eoaMedia) ).toFixed(2);")]),
 ('20 la categoria de la indexada usa SIEMPRE los cortes de IMC < 30','TC-732',
  [("  const imc = (typeof getIMC==='function') ? getIMC() : null;\n  const eoai = +( _vmN(eoaMedia) / bsa ).toFixed(2);",
    "  const imc = 25;\n  const eoai = +( _vmN(eoaMedia) / bsa ).toFixed(2);")]),
 ('21 la diferencia con lo esperado pierde el signo','TC-732',
  [("        txt += ' · '+(z>=0?'+':'−')+Math.abs(z).toFixed(1)+' DE respecto del esperado';",
    "        txt += ' · '+Math.abs(z).toFixed(1)+' DE respecto del esperado';")]),
 ('22 lo medido se publica aunque el modelo no traiga desvio','TC-732',
  [("      if (esp && esp[1]!=null && +esp[1]>0){","      if (esp){")]),
 # ⚠️ ESTABA MAL DIRIGIDA: apuntaba a _vModDraft —el borrador de la card— y la condicion que la
 # mata, (E2) de TC-732, mide vModEsperados, que es OTRO constructor. El borrador tiene su propia
 # mutacion, la 43.
 ('23 el modo manual inventa un desvio','TC-732',
  [("             vals:{ medio:[gm,null], eoa:[eo,null] }, fte:null, folio:null };",
    "             vals:{ medio:[gm,gm*0.2], eoa:[eo,eo*0.2] }, fte:null, folio:null };")]),
 ('24 sin peso ni talla la fila se calla en vez de decirlo','TC-732',
  [("    chips.appendChild(_vmChip('EOA indexada predicha','falta el peso y la talla'));","    ;")]),
 # ---- TC-733: TAVI, la limpieza y el recorrido de los campos ----
 ('25 el rotulo escribe « mm» tambien con un tamano que no es numero','TC-733',
  [("    const t = E.tam ? (' · '+E.tam+(/^\\d+$/.test(E.tam)?' mm':'')) : '';",
    "    const t = E.tam ? (' · '+E.tam+' mm') : '';")]),
 ('26 cambiar la morfologia a un tipo incompatible YA NO limpia el modelo','TC-733',
  [("    else if (!manual && !vModBuscar(pos,nom)) Object.keys(P.campos).forEach(k=>_vmSet(P.campos[k],''));",
    "    else if (false) Object.keys(P.campos).forEach(k=>_vmSet(P.campos[k],''));")]),
 ('27 el modelo sale al Excel tambien con valvula nativa','TC-733',
  [("    'Modelo de prótesis aórtica': (valvEsProtesis(c.va_morf||'') ? (c.va_prot_modelo || '') : ''),",
    "    'Modelo de prótesis aórtica': (c.va_prot_modelo || ''),")]),
 # ⚠️ ROMPE LAS DOS LISTAS A LA VEZ, y es la leccion del D-11: el repintado esta en RECALC_MODULOS
 # Y en ESPEJOS_VIVOS a proposito, asi que sacarlo de una sola lo tapa la otra -- medido, la
 # mutacion sobrevivia.
 ('28 el repintado sale de las DOS columnas y restaurar deja el boton viejo','TC-733',
  [("  return ['ccPuertaSync','vciNoVisSync','vModSyncTodos',","  return ['ccPuertaSync','vciNoVisSync',"),
   ("  return ['ccPuertaSync', 'vModSyncTodos', 'tvSync', 'dapSync', 'coaSync', 'vapSync', 'ebsSync', 'tgaSync', 'dsavSync',",
    "  return ['ccPuertaSync', 'tvSync', 'dapSync', 'coaSync', 'vapSync', 'ebsSync', 'tgaSync', 'dsavSync',")]),
 # ⚠️ LA MATA (C6b) Y NO (C6): (C6) cuenta las entradas por su CAMPO y el campo no cambia, asi
 # que esta mutacion sobrevivia -- y el round-trip quedaba roto en silencio.
 ('29 el nombre de columna del mapa deja de coincidir con el del Excel','TC-733',
  [("  ['Modelo de prótesis aórtica',            'va_prot_modelo', 'txt'],",
    "  ['Modelo de protesis aortica XX',         'va_prot_modelo', 'txt'],")]),
 # ---- TC-734: la EOA frente a la del modelo ----
 ('30 la EOA entra EN LUGAR del DVI y no junto a el','TC-734',
  [("  const indep = [nv.dvi, nv.eoa].filter(Boolean);","  const indep = [nv.eoa || nv.dvi].filter(Boolean);")]),
 ('31 la regla se aplica tambien a TAVI','TC-734',
  [("  if (morf !== 'Prótesis mecánica' && morf !== 'Prótesis biológica') return null;",
    "  if (morf !== 'Prótesis mecánica' && morf !== 'Prótesis biológica' && morf !== 'TAVI') return null;")]),
 # ⚠️ ROMPE LAS DOS GUARDAS A LA VEZ: `E.manual` y la del desvio protegen lo mismo por dos
 # puertas —el modo manual construye sus valores con desvio null—, asi que quitar una sola es
 # EQUIVALENTE. Medido: con solo quitar `E.manual`, eoaEvaluable sigue en false.
 ('32 la regla se aplica tambien al modo manual','TC-734',
  [("  if (!E || E.manual || !E.vals || !E.vals.eoa) return null;","  if (!E || !E.vals || !E.vals.eoa) return null;"),
   ("             vals:{ medio:[gm,null], eoa:[eo,null] }, fte:null, folio:null };",
    "             vals:{ medio:[gm,gm*0.2], eoa:[eo,eo*0.2] }, fte:null, folio:null };")]),
 ('33 la regla se aplica con un modelo SIN desvio impreso','TC-734',
  [("  if (ref == null || sd == null || !(+sd > 0)) return null;","  if (ref == null) return null;\n  var sd2 = (sd == null || !(+sd > 0)) ? 0.4 : sd;")]),
 ('34 el corte de «2 DE menores» se mueve a -1,5','TC-734',
  [("const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -2 });",
    "const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -1.5 });")]),
 ('35 el corte de «1 DE menor» se mueve a -0,5','TC-734',
  [("const EA_PROT_EOA_Z = Object.freeze({ normalMin: -1, signifMax: -2 });",
    "const EA_PROT_EOA_Z = Object.freeze({ normalMin: -0.5, signifMax: -2 });")]),
 ('36 la nota general deja de exigir el eje dependiente del flujo','TC-734',
  [("  else if (pDep === 'signif' && pIndep === 'signif') nivel = 'signif';",
    "  else if (pDep === 'signif' || pIndep === 'signif') nivel = 'signif';")]),
 # ⚠️ REESCRITA: la version anterior empujaba EA_PROT_SALV.eoa SIEMPRE para ver si volvia la
 # frase «no registra marca ni modelo», y esa frase YA NO EXISTE —el commit 5 reescribio la
 # constante—, asi que reproducia un defecto imposible y sobrevivia. Lo que de verdad no puede
 # pasar es que las DOS salvedades salgan juntas: «el area no se evalua» al lado de «el area
 # medida es de X». La mata (A7) de TC-734.
 ('37 las dos salvedades del area salen JUNTAS y se contradicen','TC-734',
  [("  } else salv.push(EA_PROT_SALV.eoa);","  }\n  salv.push(EA_PROT_SALV.eoa);")]),
 ('38 la AVA marcada «(revisar)» entra igual en la regla','TC-734',
  [("  if (!t || /revisar/i.test(t)) return null;","  if (!t) return null;")]),
 # ---- TC-735: la tabla A5 ----
 ('39 se pierde una celda de la A5 (el THP de la St. Jude 27)','TC-735',
  [("['27',[11,4],[5,1.82],[1.61,0.29],[75,10],[1.67,0.17]]","['27',[11,4],[5,1.82],[1.61,0.29],null,[1.67,0.17]]")]),
 ('40 Hancock II y Medtronic Mosaic dejan de estar impresos identicos','TC-735',
  [("{n:'Hancock II',d:'Stented bioprosthesis',t:'bio',f:'59',s:[['25',null,[8.3,1.71],[2.1,0.28],[76,19.8],[1.42,0.29]]",
    "{n:'Hancock II',d:'Stented bioprosthesis',t:'bio',f:'59',s:[['25',null,[8.4,1.71],[2.1,0.28],[76,19.8],[1.42,0.29]]")]),
 ('41 la Tabla A6 se carga igual','TC-735',
  [("window.PROT_CAT_A5 = PROT_CAT_A5; window.PROT_CAT_A5_COLS = PROT_CAT_A5_COLS;",
    "window.PROT_CAT_A6 = [{n:'SAPIEN mitral',s:[]}];\nwindow.PROT_CAT_A5 = PROT_CAT_A5; window.PROT_CAT_A5_COLS = PROT_CAT_A5_COLS;")]),
 ('42 la morfologia mitral gana una opcion de implante transcateter','TC-735',
  [("<option>TEER mitral</option>","<option>TEER mitral</option><option>TAVI mitral</option>")]),
 # ---- el BORRADOR de la card: el segundo constructor de valores manuales ----
 ('43 el BORRADOR del modo manual inventa un desvio','TC-731',
  [("         vals:{medio:[g,null], eoa:[e,null]}, cols:['medio','eoa']};",
    "         vals:{medio:[g,g*0.2], eoa:[e,e*0.2]}, cols:['medio','eoa']};")]),
]

orig = open(IDX,encoding='utf-8').read()
muertas, vivas, noaplica = [], [], []
t0=time.time()
SOLO = sys.argv[2].split(',') if len(sys.argv)>2 else None
for i,(nom,casos,pares) in enumerate(MUT,1):
    if SOLO and ('%02d'%i) not in SOLO: continue
    s = orig; ok = True
    for bus,rep in pares:
        if s.count(bus) != 1:
            noaplica.append((nom,'el ancla aparece %d veces'%s.count(bus))); ok=False; break
        s = s.replace(bus,rep)
    if not ok: print('  %02d NO APLICA  %s'%(i,nom), flush=True); continue
    with open(IDX,'w',encoding='utf-8') as f:
        f.write(s); f.flush(); os.fsync(f.fileno())
    if open(IDX,encoding='utf-8').read() != s:
        noaplica.append((nom,'el archivo en disco no coincide')); print('  %02d DISCO  %s'%(i,nom), flush=True); continue
    r = subprocess.run(['node','scripts/test_clinico.mjs','--solo',casos],
                       cwd=WT, capture_output=True, text=True, timeout=900)
    out = r.stdout + r.stderr
    if 'RESULTADO' not in out:
        noaplica.append((nom,'el suite NO CORRIO')); print('  %02d NO CORRIO  %s'%(i,nom), flush=True)
    elif '✗' in out:
        muertas.append(nom); print('  %02d MUERTA    %s'%(i,nom), flush=True)
    else:
        vivas.append(nom); print('  %02d SOBREVIVIO %s   <<<'%(i,nom), flush=True)
with open(IDX,'w',encoding='utf-8') as f:
    f.write(orig); f.flush(); os.fsync(f.fileno())
print('')
print('  %d/%d MUERTAS   %d sobrevivieron   %d no aplicaron   (%.1f min)'%(
    len(muertas),len(MUT) if not SOLO else len(SOLO),len(vivas),len(noaplica),(time.time()-t0)/60))
for n,m in noaplica: print('    NO APLICO: %s - %s'%(n,m))
for n in vivas: print('    SOBREVIVIO: %s'%n)
print('  md5 del arbol VIVO: antes %s  despues %s  %s'%(
    MD5_VIVO, md5(VIVO), 'IDENTICO' if MD5_VIVO==md5(VIVO) else '!!! CAMBIO !!!'))
