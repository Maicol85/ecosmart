#!/usr/bin/env node
/**
 * _probe_ajustes2barrido.mjs — el BARRIDO 6a de la tanda AJUSTES-2.
 *
 * Recorre el informe (tres estilos), el EN SUMA, el PDF en sus seis plantillas y el PPT sobre
 * TODAS las escenas del arnes, y lista cada mencion de: nombres de guias o sociedades, clase,
 * nivel, tabla, figura, folio, y verbos de recomendacion o conducta, con su superficie y un
 * ejemplo textual con su contexto.
 *
 *   node scripts/_probe_ajustes2barrido.mjs --vol <json de _probe_ajustes2ab.mjs>
 *
 * Trabaja sobre un volcado ya medido: no vuelve a abrir el navegador.
 */
const fs=await import('fs');
const arg=n=>{const i=process.argv.indexOf(n);return i>-1?process.argv[i+1]:null};
const VOL=arg('--vol');
if(!VOL){console.log('falta --vol');process.exit(2)}
const d=JSON.parse(fs.readFileSync(VOL,'utf8'));

const SOCIEDADES=['ESC','EACTS','ACC','AHA','ASE','EACVI','HRS','EHRA','ESH','SCAI','ISACHD',
                  'SCCT','SCMR','SOPE','ERS','HFA','ICOS','EAE','SAC','ACCF','NYHA'];
const META=['Clase I','Clase II','Clase III','Nivel A','Nivel B','Nivel C','Tabla ','Figura ',
            'folio','apartado','Recomendaciones-tabla','según la guía','Según la guía',
            'Segun la guia','guías'];
/* Verbos de recomendacion o conducta. Se buscan como PALABRA, con el limite a mano: en un
   motor sin lookbehind un \b antes de una tilde no siempre funciona. */
const VERBOS=['considerar','Considerar','se recomienda','Se recomienda','recomendado',
              'recomendada','debe ','Debe ','debería','indicado','indicada','indicación',
              'medir ','Medir ','evaluar','Evaluar','derivar','Derivar','completar','Completar',
              'vigilar','Vigilar','preferir','Preferir','realizar','Realizar','controlar',
              'seguimiento','Seguimiento','repetir','Repetir'];

/* Modulo al que pertenece la frase: se adivina por la oracion que la contiene. */
const MODULOS=[[/coartaci/i,'coartación'],[/orejuela/i,'orejuela'],[/posoperatorio|PostCEC|vasoplej/i,'posoperatorio'],
  [/bic[uú]spide|VAB\b/i,'válvula bicúspide'],[/Marfan|Loeys|Turner|ACTA2|Ehlers|aortopat/i,'aortopatía'],
  [/amiloid/i,'amiloidosis'],[/Fallot/i,'Fallot'],[/FOP|foramen/i,'FOP'],[/pericard|constricci|taponam/i,'pericardio'],
  [/TEP|embolia/i,'TEP'],[/HFA-PEFF|HFpEF/i,'HF-PEFF'],[/hipertensi[oó]n pulmonar|HTP/i,'HTP'],
  [/pr[oó]tesis|TAVI/i,'prótesis'],[/Wilkins|comisurotom/i,'estenosis mitral'],
  [/cardio-?onco|antracicl|HER2|VEGF/i,'cardio-oncología'],[/VExUS|congesti/i,'VExUS'],
  [/estenosis a[oó]rtica|EAo/i,'estenosis aórtica'],[/strain|SGL/i,'strain'],
  [/diast[oó]lic/i,'función diastólica'],[/ventr[ií]culo derecho|VD\b/i,'ventrículo derecho'],
  [/Ebstein/i,'Ebstein'],[/ductus|DAP\b/i,'ductus'],[/CIA|CIV|shunt/i,'shunt'],
  [/miocardiopat[ií]a hipertr/i,'MCH'],[/pulmonar|pleural|l[ií]neas B/i,'eco pulmonar']];
const modulo = (fr) => { for(const [re,n] of MODULOS) if(re.test(fr)) return n; return '(sin módulo claro)' };

/* Parte en oraciones respetando los puntos de los numeros y las abreviaturas comunes. */
function oraciones(t){
  return String(t||'').replace(/\s+/g,' ')
    .split(/(?<=[.;:!?])\s+(?=[A-ZÁÉÍÓÚÑ«¡¿])/).filter(x=>x.trim());
}

const SUPS=['informe_estandar','informe_narrativo','informe_conciso',
            'suma_estandar','suma_narrativo','suma_conciso'];
const hallazgos = new Map();   // frase normalizada -> {palabras, modulo, sups:Set, escenas:Set}
function registra(fr, sup, esc){
  const pal=[];
  for(const s of SOCIEDADES){ const re=new RegExp('(^|[^A-Za-z])'+s+'([^A-Za-z]|$)');
    if(re.test(fr)) pal.push(s) }
  for(const m of META) if(fr.indexOf(m)>-1) pal.push(m.trim());
  for(const v of VERBOS) if(fr.indexOf(v)>-1) pal.push(v.trim());
  if(!pal.length) return;
  const k=fr.trim();
  if(!hallazgos.has(k)) hallazgos.set(k,{pal:new Set(),mod:modulo(fr),sups:new Set(),esc:new Set()});
  const h=hallazgos.get(k);
  pal.forEach(p=>h.pal.add(p)); h.sups.add(sup); h.esc.add(esc);
}

let nEsc=0, nChars=0;
for(const esc of Object.keys(d)){
  const e=d[esc]; if(!e||typeof e!=='object'||esc==='archivo') continue;
  nEsc++;
  for(const s of SUPS){ if(!e[s]) continue; nChars+=String(e[s]).length;
    oraciones(e[s]).forEach(fr=>registra(fr,s.split('_')[0],esc)); }
  if(e._pdf) for(const pl of Object.keys(e._pdf)){ const t=e._pdf[pl].txt||''; nChars+=t.length;
    t.split(' | ').forEach(fr=>oraciones(fr).forEach(o=>registra(o,'pdf',esc))); }
  if(e._ppt){ const t=e._ppt.txt||((e._ppt.textos||[]).join(' | ')); nChars+=t.length;
    t.split(' | ').forEach(fr=>oraciones(fr).forEach(o=>registra(o,'ppt',esc))); }
}

/* Una frase es RECOMENDACION si trae un verbo de conducta dirigido al medico. */
const esConducta = (pal) => VERBOS.some(v=>pal.has(v.trim()));
const esCita     = (pal) => SOCIEDADES.some(s=>pal.has(s)) || META.some(m=>pal.has(m.trim()));

const filas=[...hallazgos.entries()].map(([fr,h])=>({fr,...h,
  tipo: esConducta(h.pal) ? (esCita(h.pal)?'CONDUCTA + CITA':'CONDUCTA') : 'CITA'}));
filas.sort((a,b)=> a.mod.localeCompare(b.mod) || a.tipo.localeCompare(b.tipo));

console.log('DENOMINADOR: '+nEsc+' escenas · '+nChars.toLocaleString('es')+' caracteres de '
  +'superficie firmada (informe x3, EN SUMA x3, PDF x6 plantillas, PPT)');
console.log('HALLAZGOS: '+filas.length+' frases distintas\n');
let mod='';
for(const f of filas){
  if(f.mod!==mod){ mod=f.mod; console.log('\n━━━ '+mod.toUpperCase()+' ━━━') }
  console.log('  ['+f.tipo+'] ('+[...f.sups].join(',')+')  '+[...f.pal].slice(0,6).join(' · '));
  console.log('      "'+f.fr.slice(0,250)+(f.fr.length>250?'…':'')+'"');
}
