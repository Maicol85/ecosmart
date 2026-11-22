// Censo de regiones de ultrasonido (0018,6011) sobre el pendrive. SOLO LECTURA.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const VR4 = { OB:1,OW:1,OF:1,OD:1,OL:1,SQ:1,UT:1,UN:1,UC:1,UR:1 };
function ascii(u8,o,n){let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(u8[o+i]);return s;}
function leerRegs(dv,u8,ini,fin){
  const regs=[];let q=ini;
  while(q+8<=fin){
    const tg=dv.getUint16(q,true),te=dv.getUint16(q+2,true);const fl=dv.getUint32(q+4,true);
    if(tg!==0xFFFE||te!==0xE000)break;
    const sub=(fl===0xFFFFFFFF)?fin:Math.min(fin,q+8+fl);
    const r={};let o=q+8;
    while(o+8<=sub){
      const g=dv.getUint16(o,true),e=dv.getUint16(o+2,true);
      if(g===0xFFFE)break;
      const vr=ascii(u8,o+4,2);if(!/^[A-Z]{2}$/.test(vr))break;
      const ln=VR4[vr]?dv.getUint32(o+8,true):dv.getUint16(o+6,true);
      const val=VR4[vr]?o+12:o+8;
      if(val+ln>sub)break;
      const num=()=>vr==='FD'?dv.getFloat64(val,true):vr==='FL'?dv.getFloat32(val,true)
        :vr==='SL'?dv.getInt32(val,true):vr==='UL'?dv.getUint32(val,true)
        :vr==='SS'?dv.getInt16(val,true):dv.getUint16(val,true);
      if(g===0x0018){
        if(e===0x6014)r.tipo=num();else if(e===0x6018)r.x0=num();else if(e===0x601A)r.y0=num();
        else if(e===0x601C)r.x1=num();else if(e===0x601E)r.y1=num();
        else if(e===0x6020)r.rx0=num();else if(e===0x6022)r.ry0=num();
        else if(e===0x6024)r.ux=num();else if(e===0x6026)r.uy=num();
        else if(e===0x6028)r.rvx=num();else if(e===0x602A)r.rvy=num();
        else if(e===0x602C)r.dx=num();else if(e===0x602E)r.dy=num();
      }
      o=val+ln;
    }
    if(r.dx||r.x1)regs.push(r);
    if(fl===0xFFFFFFFF)break;
    q+=8+fl;
  }
  return regs;
}
function saltarSQ(dv,u8,ini,fin){
  let q=ini;
  while(q+8<=fin){
    const g=dv.getUint16(q,true),e=dv.getUint16(q+2,true);
    if(g===0xFFFE&&e===0xE0DD)return q+8;
    if(g===0xFFFE){q+=8;continue;}
    const vr=ascii(u8,q+4,2);
    let ln,val;
    if(VR4[vr]){ln=dv.getUint32(q+8,true);val=q+12;}else{ln=dv.getUint16(q+6,true);val=q+8;}
    q=(ln===0xFFFFFFFF)?saltarSQ(dv,u8,val,fin):val+ln;
  }
  return q;
}
function leerArch(buf){
  const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);
  const u8=new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength);
  if(buf.byteLength<132||ascii(u8,128,4)!=='DICM')return null;
  let q=132;const fin=buf.byteLength;const out={regs:[],fab:'',mod:''};
  while(q+8<=fin){
    const g=dv.getUint16(q,true),e=dv.getUint16(q+2,true);
    const vr=ascii(u8,q+4,2);
    if(!/^[A-Z]{2}$/.test(vr))break;
    let ln,val;
    if(VR4[vr]){ln=dv.getUint32(q+8,true);val=q+12;}else{ln=dv.getUint16(q+6,true);val=q+8;}
    if(g===0x0008&&e===0x0070)out.fab=ascii(u8,val,ln).trim();
    if(g===0x0008&&e===0x1090)out.mod=ascii(u8,val,ln).trim();
    if(g===0x0018&&e===0x6011){
      const f=(ln===0xFFFFFFFF)?fin:val+ln;
      try{out.regs=leerRegs(dv,u8,val,f);}catch(e2){}
      q=(ln===0xFFFFFFFF)?saltarSQ(dv,u8,val,fin):val+ln;continue;
    }
    if(g===0x7FE0&&e===0x0010)break;
    q=(ln===0xFFFFFFFF)?saltarSQ(dv,u8,val,fin):val+ln;
  }
  return out;
}
const raiz=process.argv[2];
const archs=[];
(function rec(d,prof){ if(prof>6)return;
  let ls;try{ls=readdirSync(d);}catch(e){return;}
  for(const n of ls){const p=join(d,n);let st;try{st=statSync(p);}catch(e){continue;}
    if(st.isDirectory())rec(p,prof+1);else if(st.size>1000)archs.push(p);}
})(raiz,0);
let nArch=0,nReg=0;const marcas={};
const vel=[]; // regiones con uy=7
for(const p of archs){
  let buf;try{buf=readFileSync(p);}catch(e){continue;}
  let o;try{o=leerArch(buf);}catch(e){continue;}
  if(!o||!o.regs.length)continue;
  nArch++;nReg+=o.regs.length;
  const m=(o.fab+' / '+o.mod);marcas[m]=(marcas[m]||0)+1;
  for(const r of o.regs){ if(r.uy===7) vel.push({p:p.split('/').pop(),m,...r}); }
}
console.log('archivos con regiones:',nArch,'regiones:',nReg);
console.log('marcas:',JSON.stringify(marcas,null,1));
console.log('regiones con uy=7 (cm/s):',vel.length);
let dentro=0,fuera=0,arriba=0;
const muestra=[];
for(const r of vel){
  const d=(r.ry0>=r.y0&&r.ry0<=r.y1);
  if(d)dentro++;else{fuera++;if(r.ry0<r.y0)arriba++;}
  if(muestra.length<12)muestra.push({arch:r.p,rect:[r.x0,r.y0,r.x1,r.y1],ry0:r.ry0,rx0:r.rx0,rvy:r.rvy,dy:r.dy,dx:r.dx,ux:r.ux,uy:r.uy,tipo:r.tipo});
}
console.log('ry0 DENTRO del rect [y0..y1]:',dentro,' FUERA:',fuera,' (de ellas por ARRIBA:',arriba,')');
console.log(JSON.stringify(muestra,null,1));
// ANALISIS
let rx0cero=0,rx0eqx0=0;
for(const r of vel){ if(r.rx0===0)rx0cero++; if(r.rx0===r.x0)rx0eqx0++; }
console.log('rx0===0:',rx0cero,' rx0===x0:',rx0eqx0,' de',vel.length);
// --- analisis fino ---
const stat = (nom, f) => console.log(nom + ': ' + vel.filter(f).length + ' / ' + vel.length);
stat('rx0 === x1 - x0', r => r.rx0 === (r.x1 - r.x0));
stat('rx0 === x1 - x0 + 1', r => r.rx0 === (r.x1 - r.x0 + 1));
stat('rx0 === x1', r => r.rx0 === r.x1);
stat('rx0 dentro de [x0..x1]', r => r.rx0 >= r.x0 && r.rx0 <= r.x1);
stat('rx0 dentro de [0..x1-x0]', r => r.rx0 >= 0 && r.rx0 <= (r.x1 - r.x0));
stat('ry0 dentro de [0..y1-y0] (REL)', r => r.ry0 >= 0 && r.ry0 <= (r.y1 - r.y0));
stat('ry0 dentro de [y0..y1] (ABS)', r => r.ry0 >= r.y0 && r.ry0 <= r.y1);
const u = new Set(vel.map(r => [r.x0,r.y0,r.x1,r.y1].join(',')));
console.log('rectangulos distintos:', [...u]);
const rxs = new Set(vel.map(r => r.rx0)); console.log('rx0 distintos:', [...rxs].sort((a,b)=>a-b));
const rys = vel.map(r => r.ry0).sort((a,b)=>a-b);
console.log('ry0 min/max:', rys[0], rys[rys.length-1]);
// banda de velocidad implicada por cada interpretacion, en el rect
const ej = [];
for (const r of vel.slice(0,8)) {
  const vTopAbs = (r.y0 - r.ry0) * r.dy, vBotAbs = (r.y1 - r.ry0) * r.dy;
  const vTopRel = (0 - r.ry0) * r.dy,   vBotRel = ((r.y1-r.y0) - r.ry0) * r.dy;
  ej.push({ arch:r.p, dy:r.dy, ry0:r.ry0,
            ABS:[+vTopAbs.toFixed(0), +vBotAbs.toFixed(0)],
            REL:[+vTopRel.toFixed(0), +vBotRel.toFixed(0)] });
}
console.log(JSON.stringify(ej, null, 1));
// --- magnitud del error de offset que introduce leer ry0 como absoluto ---
const offs = vel.map(r => Math.abs(r.y0 * r.dy));
offs.sort((a,b)=>a-b);
const pct = p => offs[Math.min(offs.length-1, Math.floor(p*offs.length))];
console.log('OFFSET |y0*dy| cm/s  -> min', offs[0].toFixed(1), ' p25', pct(.25).toFixed(1),
            ' mediana', pct(.5).toFixed(1), ' p75', pct(.75).toFixed(1), ' max', offs[offs.length-1].toFixed(1));
// cuantas regiones: rango de velocidad del recuadro bajo cada interpretacion
let relOK=0, absOK=0;
for (const r of vel) {
  const alto = r.y1 - r.y0;
  const vT_rel = (0-r.ry0)*r.dy, vB_rel = (alto-r.ry0)*r.dy;
  const vT_abs = (r.y0-r.ry0)*r.dy, vB_abs = (r.y1-r.ry0)*r.dy;
  // el CERO esta dentro del recuadro?
  if (Math.min(vT_rel,vB_rel) <= 0 && Math.max(vT_rel,vB_rel) >= 0) relOK++;
  if (Math.min(vT_abs,vB_abs) <= 0 && Math.max(vT_abs,vB_abs) >= 0) absOK++;
}
console.log('el CERO de velocidad cae DENTRO del recuadro -> REL:', relOK, '/', vel.length,
            '   ABS:', absOK, '/', vel.length);
