#!/usr/bin/env python3
"""_mut_pant20.py - barrido de mutaciones dirigidas de la tanda PANT-20.

Corre SIEMPRE en un worktree y NUNCA sobre el arbol vivo: el guardian compara el md5 del
index.html vivo al abrir y al cerrar y aborta si cambio.
Escribe con flush + fsync Y COMPRUEBA que el archivo en disco tiene la mutacion antes de
correr el caso (P14c-i).
Cada mutacion declara SU caso: con los seis por mutacion, un reparto mal hecho queda tapado
por el caso de otro commit.
Las anclas llevan el CARACTER REAL y no secuencias \\uXXXX, que es por lo que siete de PANT-19
no aplicaron.
"""
import os, re, subprocess, sys, hashlib, time

RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart'
WT   = sys.argv[1]
def md5(p): return hashlib.md5(open(p,'rb').read()).hexdigest()[:8]
VIVO = os.path.join(RAIZ,'index.html')
MD5_VIVO = md5(VIVO)
IDX = os.path.join(WT,'index.html')

MUT = [
 ('01 se pierde una celda de la A7 (la EOA de la St. Jude 25)','TC-736',
  [("['25',[18,7.5],[11,6],[2,null],[83,11],[2.9,1]]","['25',[18,7.5],[11,6],[2,null],[83,11],null]")]),
 ('02 un valor de la A7 cambia (el gradiente pico de la St. Jude 25)','TC-736',
  [("['25',[18,7.5],[11,6],[2,null],[83,11],[2.9,1]]","['25',[19,7.5],[11,6],[2,null],[83,11],[2.9,1]]")]),
 ('03 una MEDIANA pierde su rango impreso y queda el valor solo','TC-736',
  [("[12,null,'12 (11-13)']",'[12,null]')]),
 ('04 un LIMITE se carga como si fuera un valor central','TC-736',
  [("[null,null,'<25']",'[25,null]')]),
 ('05 se ADIVINA el tipo de un conducto que la tabla no imprime','TC-736',
  [("{n:'Contegra',d:'Valved conduits',t:'',","{n:'Contegra',d:'Valved conduits',t:'bio',")]),
 ('06 un modelo de la A7 se queda sin folio','TC-736',
  [("{n:'Homograft',d:'',t:'',uno:1,f:'62',","{n:'Homograft',d:'',t:'',uno:1,f:'',")]),
 ('07 el Homograft gana la marca de tipo mecanico','TC-736',
  [("{n:'Homograft',d:'',t:'',uno:1,f:'62',","{n:'Homograft',d:'',t:'mec',uno:1,f:'62',")]),
 ('08 Alterra recibe «No data» como si fuera un tamano','TC-736',
  [("{n:'Alterra Stent with SAPIEN',d:'Percutaneous pulmonary valve native outflow',t:'',uno:1,f:'62',s:[['',","{n:'Alterra Stent with SAPIEN',d:'Percutaneous pulmonary valve native outflow',t:'',uno:1,f:'62',s:[['No data',")]),
 ('09 se pierde una celda de la A9 (la EOA de la St. Jude Medical Standard 27)','TC-737',
  [("['27',[77,14.6],[2.4,1.27],[1.1,0.32],[25,7.0],[1.2,0.33],[2.54,0.64],[1.52,0.34]]","['27',[77,14.6],[2.4,1.27],[1.1,0.32],[25,7.0],[1.2,0.33],null,[1.52,0.34]]")]),
 ('10 un «NA» impreso de la A9 se carga como numero','TC-737',
  [("{n:'Medtronic Hancock II',d:'Bioprosthesis',t:'bio',f:'63',s:[['31',null,","{n:'Medtronic Hancock II',d:'Bioprosthesis',t:'bio',f:'63',s:[['31',[120,20],")]),
 ('11 el THP de la Perimount 33 pierde su desvio','TC-737',
  [("['33',[137,53],","['33',[137,null],")]),
 ('12 un modelo de la A9 cambia de tipo','TC-737',
  [("{n:'Starr-Edwards',d:'Mechanical',t:'mec',","{n:'Starr-Edwards',d:'Mechanical',t:'bio',")]),
 ('13 la Tabla A8 gana un consumidor y entra al registro de tablas','TC-737',
  [("const VMOD_TABLA = Object.freeze({ va:'PROT_CAT_A4', vm:'PROT_CAT_A5',\n                                   vt:'PROT_CAT_A9', vp:'PROT_CAT_A7' });","const VMOD_TABLA = Object.freeze({ va:'PROT_CAT_A4', vm:'PROT_CAT_A8',\n                                   vt:'PROT_CAT_A9', vp:'PROT_CAT_A7' });")]),
 ('14 la morfologia tricuspide gana una opcion de implante transcateter','TC-737',
  [('<option>TEER tricuspídeo (T-TEER)</option>','<option>TEER tricuspídeo (T-TEER)</option><option>ViV tricuspídeo</option>')]),
 ('15 el boton de la mitral se mete DENTRO de la grilla de tres','TC-738',
  [('      <div class="valv-morf-row vmod-row">\n        <div class="fg vmod-wrap" id="vmod-vm-wrap"','      <div class="valv-morf-row vmod-row" style="display:contents;">\n        <div class="fg vmod-wrap" id="vmod-vm-wrap"')]),
 ('16 la grilla de tres gana un cuarto hijo','TC-738',
  [('<div class="valv-morf-row valv-morf-row--tres">','<div class="valv-morf-row valv-morf-row--tres"><div class="fg"><label>X</label><select id="vm_x"></select></div>')]),
 ('17 el boton de la mitral pierde su piso tactil','TC-738',
  [('.vmod-btn{min-height:44px;white-space:nowrap;}','.vmod-btn{min-height:30px;white-space:nowrap;}')]),
 ('18 la mitral usa los cortes AORTICOS de la Tabla 7','TC-738',
  [("    ppm:(eoai,imc)=>(typeof _vmPpmClasificar==='function')?_vmPpmClasificar(eoai,imc):null,\n    cortes:(imc)=>((imc!=null && imc>=VM_PROT_IMC_OBESIDAD)?VM_PROT_PPM_CORTES.imcAlto:VM_PROT_PPM_CORTES.imcBajo)","    ppm:(eoai,imc)=>(typeof _eaPpmAoClasificar==='function')?_eaPpmAoClasificar(eoai,imc):null,\n    cortes:(imc)=>((imc!=null && imc>=VM_PROT_IMC_OBESIDAD)?EA_PROT_PPM_CORTES.imcAlto:EA_PROT_PPM_CORTES.imcBajo)")]),
 ('19 el clasificador mitral deja de mirar el IMC: usa siempre la rama baja','TC-738',
  [("  const c = (imc != null && imc >= VM_PROT_IMC_OBESIDAD)\n          ? VM_PROT_PPM_CORTES.imcAlto : VM_PROT_PPM_CORTES.imcBajo;\n  return { cortes: c,\n           ppm: eoai <= c.severoMax ? 'severo' : (eoai > c.normalMin ? 'no' : 'moderado') };","  const c = VM_PROT_PPM_CORTES.imcBajo;\n  return { cortes: c,\n           ppm: eoai <= c.severoMax ? 'severo' : (eoai > c.normalMin ? 'no' : 'moderado') };")]),
 ('20 cambiar la morfologia mitral deja de limpiar el modelo','TC-738',
  [("vmProtBloqSync();vmMorfFitSync();vModMorfSync('vm')",'vmProtBloqSync();vmMorfFitSync()')]),
 ('21 la sugerencia pasa a buscar en cualquier posicion y no al principio de una palabra','TC-738',
  [("  const lst=C.lista.filter(m=>(' '+_vmNorm(m.n).replace(/-/g,' ')).indexOf(' '+q)>-1)",'  const lst=C.lista.filter(m=>_vmNorm(m.n).indexOf(q)>-1)')]),
 ('22 el boton se ve tambien con valvula nativa','TC-738',
  [("  wrap.style.display = hayCat ? '' : 'none';","  wrap.style.display = '';")]),
 ('23 la tricuspide inventa una categoria de desajuste','TC-739',
  [('    ppm:null, cortes:null\n  }),',"    ppm:(eoai,imc)=>(typeof _vmPpmClasificar==='function')?_vmPpmClasificar(eoai,imc):null,\n    cortes:(imc)=>VM_PROT_PPM_CORTES.imcBajo\n  }),")]),
 ('24 la velocidad de E pierde su factor de conversion','TC-739',
  [("               uni:' cm/s', id:'et_e_vmax', fac:100},","               uni:' cm/s', id:'et_e_vmax'},")]),
 ('25 el factor se aplica al reves y la conversion queda invertida','TC-739',
  [('      const _f = d.fac || 1;\n      if (esp && esp[1]!=null && (+esp[1])*_f>0){\n        const z=(x-(+esp[0])*_f)/((+esp[1])*_f);','      const _f = 1/(d.fac || 1);\n      if (esp && esp[1]!=null && (+esp[1])*_f>0){\n        const z=(x-(+esp[0])*_f)/((+esp[1])*_f);')]),
 ('26 la linea de abajo publica el IMC aunque no haya cortes que lo usen','TC-739',
  [("      if (idx.imc!=null && idx.cortes) partes.push('IMC '","      if (idx.imc!=null) partes.push('IMC '")]),
 ('27 la columna de la EOA indexada esperada desaparece de la A9','TC-739',
  [("const PROT_CAT_A9_COLS = Object.freeze(['thp','medio','evel','vti','dvi','eoa','ieoa']);","const PROT_CAT_A9_COLS = Object.freeze(['thp','medio','evel','vti','dvi','eoa','xxxx']);")]),
 ('28 el pintor ignora el TEXTO IMPRESO y publica el valor solo','TC-740',
  [('function _vmPar(c){ if(!c) return null; if(c[2]) return String(c[2]);','function _vmPar(c){ if(!c) return null;')]),
 ('29 los modelos sin tamano impreso pierden la marca uno y dejan de poder elegirse','TC-740',
  [("{n:'Homograft',d:'',t:'',uno:1,f:'62',","{n:'Homograft',d:'',t:'',f:'62',")]),
 ('30 la pulmonar declara un medido de AT que la aplicacion no tiene','TC-740',
  [("              {k:'vpico', lbl:'Velocidad pico', lblMed:'Velocidad pico medida', uni:' m/s', id:'ep_vmax'} ],\n    ppm:null, cortes:null\n  })\n});","              {k:'vpico', lbl:'Velocidad pico', lblMed:'Velocidad pico medida', uni:' m/s', id:'ep_vmax'},\n              {k:'at', lbl:'AT', uni:' ms', id:'vp_at'} ],\n    ppm:null, cortes:null\n  })\n});")]),
 ('31 la pulmonar inventa una categoria de desajuste','TC-740',
  [("              {k:'vpico', lbl:'Velocidad pico', lblMed:'Velocidad pico medida', uni:' m/s', id:'ep_vmax'} ],\n    ppm:null, cortes:null\n  })\n});","              {k:'vpico', lbl:'Velocidad pico', lblMed:'Velocidad pico medida', uni:' m/s', id:'ep_vmax'} ],\n    ppm:(eoai,imc)=>(typeof _vmPpmClasificar==='function')?_vmPpmClasificar(eoai,imc):null,\n    cortes:(imc)=>VM_PROT_PPM_CORTES.imcBajo\n  })\n});")]),
 ('32 un campo guardado pasa a type hidden','TC-741',
  [('<input type="text"   id="vt_prot_modelo" style="display:none;"','<input type="hidden" id="vt_prot_modelo" style="display:none;"')]),
 ('33 una columna del Excel se llama con la sigla que un caso existente prohibe','TC-741',
  [("    'AVT de referencia tricúspide (cm²)': rnd(valvProtDato('vt_morf','vt_prot_eoaref',c),2),","    'EOA de referencia tricúspide (cm²)': rnd(valvProtDato('vt_morf','vt_prot_eoaref',c),2),")]),
 ('34 una columna del Excel desaparece','TC-741',
  [("    'Tamaño de prótesis pulmonar': (valvEsProtesis(c.vp_morf||'') ? (c.vp_prot_tam || '') : ''),\n",'')]),
 ('35 el modelo sale al Excel tambien con valvula nativa','TC-741',
  [("    'Modelo de prótesis mitral': (valvEsProtesis(c.vm_morf||'') ? (c.vm_prot_modelo || '') : ''),","    'Modelo de prótesis mitral': (c.vm_prot_modelo || ''),")]),
 ('36 «Nuevo estudio» deja de repintar el boton y el rotulo sobrevive','TC-738',
  [('function vModSyncTodos(){ Object.keys(VMOD_POS).forEach(vModSync); }','function vModSyncTodos(){ if(window.__noSync) return; Object.keys(VMOD_POS).forEach(vModSync); }\nwindow.__noSync = true;')]),

 ('37 la ficha de la pulmonar NACE ABIERTA','TC-741',
  [('id="ref-ppulm" style="display:none;"','id="ref-ppulm" style="display:block;"')]),
 ('38 la ficha de la pulmonar se queda sin folio','TC-741',
  [('Tabla 15, hoja 32 · folio 33','Tabla 15, hoja 32')]),
 ('39 la tricuspide publica el tramo de la OTRA tabla','TC-741',
  [('&ge;200</td>','&ge;20</td>')]),
 ('40 la pulmonar pierde una de sus cuatro filas','TC-741',
  [('Gradiente medio — homoinjerto (mmHg)','Gradiente medio homoinjerto')]),
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
    elif chr(10007) in out:
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
