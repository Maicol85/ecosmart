/* Genera el PPT BASE con PptxGenJS 3.12.0 (la libreria que la app ya carga), con un video chico
   embebido. NO escribe el bucle: eso lo hace el paso siguiente, post-procesando el paquete. */
const CAND=[process.env.HOME+'/.pwtmp/node_modules/playwright/index.js'];
let _pw=null; for(const c of CAND){try{_pw=(await import(c)).default;break}catch(e){}}
const {chromium}=_pw; const fs=await import('fs');
const DIR=process.argv[2];
const vid=fs.readFileSync(DIR+'/bucle.mp4').toString('base64');
const b=await chromium.launch({channel:'chrome',headless:true});
const pg=await b.newPage();
/* Se carga la propia app para usar SU PptxGenJS, con SU version y SU hash SRI. */
await pg.goto('file:///Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html',{waitUntil:'load',timeout:60000});
await pg.waitForTimeout(1500);
await pg.evaluate(v=>{ window.__VID=v }, vid);
const R=await pg.evaluate(`(async()=>{
  if(typeof PptxGenJS==='undefined') return {err:'sin PptxGenJS'};
  const P=new PptxGenJS();
  P.defineLayout({name:'C',width:10,height:5.63}); P.layout='C';
  const s=P.addSlide();
  s.addText('Experimento: video con «repetir hasta detener»',{x:0.4,y:0.3,w:9.2,h:0.5,fontSize:18,bold:true});
  s.addText('Si el video se repite solo, el ajuste funciono. Si PowerPoint pide reparar, no.',
            {x:0.4,y:0.85,w:9.2,h:0.4,fontSize:12});
  s.addMedia({ type:'video', data:'data:video/mp4;base64,'+window.__VID, x:0.4, y:1.4, w:4, h:3 });
  const buf=await P.write({outputType:'base64'});
  return { ver:(PptxGenJS.version||P.version||'?'), b64:buf };
})()`);
if(R.err){ console.log('ERROR '+R.err); process.exit(1) }
fs.writeFileSync(DIR+'/base.pptx', Buffer.from(R.b64,'base64'));
console.log('PptxGenJS '+R.ver+' — base.pptx '+fs.statSync(DIR+'/base.pptx').size+' bytes');
await b.close();
