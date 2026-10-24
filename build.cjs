const fs=require('fs'),path=require('path');
const root=__dirname;
const original=fs.readFileSync(path.join(root,'reference/original.html'),'utf8');
function extract(name){
  const start=original.indexOf('  function '+name+'(');
  if(start<0)throw new Error('Missing '+name);
  // These reused original functions contain no template-literal brace expressions.
  let at=original.indexOf('{',start),depth=1,end=at+1;
  while(depth&&end<original.length){if(original[end]==='{')depth++;if(original[end]==='}')depth--;end++;}
  return original.slice(start,end);
}
const names=['rand','meshWithOutline','makeTree','makeRock','makeCloud','makeFlower','addProp','fantasyMesh','fantasyGlow','makeCrystal','makeMushroom','makeHouse','makeLantern','makeResident'];
const palette=original.slice(original.indexOf('  const fantasyPalette ='),original.indexOf('\n\n  function addProp'));
const reused=palette+'\n'+names.map(extract).join('\n');
fs.writeFileSync(path.join(root,'reused-art.js'),reused);
const three=fs.readFileSync(path.join(root,'reference/three.module.js'),'utf8');
const sim=fs.readFileSync(path.join(root,'sim.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'hydraulics.js'),'utf8');
const campaign=fs.readFileSync(path.join(root,'campaign.js'),'utf8');
// Warm each river during the build, retaining the solver's exact Float64 state.
// Starting a scene then needs only a copy, rather than thousands of blocking steps.
const stateFile=path.join(root,'reference/initial-rivers.json');
const stateHash=require('crypto').createHash('sha256').update(sim+campaign).digest('hex');
let initial;try{initial=JSON.parse(fs.readFileSync(stateFile,'utf8'));}catch{}
if(initial?.hash!==stateHash){
 const WaterWorld=require('./sim'),WaterCampaign=require('./campaign');
 const encode=values=>{const bytes=Buffer.alloc(values.length*8);values.forEach((v,i)=>bytes.writeDoubleLE(v,i*8));return bytes.toString('base64');};
 const states=WaterCampaign.levels.map((_,id)=>{const world=new WaterWorld(),s=WaterCampaign.prepare(world,id);return {h:encode(s.h),w:encode(s.w),qx:encode(s.qx),qz:encode(s.qz),mass:s.initialMass};});
 initial={hash:stateHash,states};fs.writeFileSync(stateFile,JSON.stringify(initial));
}
const seededCampaign=campaign+'\nWaterCampaign.seed('+JSON.stringify(initial.states)+');\n';
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
let html=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const notices=fs.readFileSync(path.join(root,'THIRD-PARTY-NOTICES.txt'),'utf8')+'\n\n'+fs.readFileSync(path.join(root,'LICENSE-original'),'utf8');
html=html.replace('<head>','<!--\n'+notices.replace(/--/g,'—')+'\n-->\n<head>');
// Inline the original MIT-licensed Three module in the same module scope.
// Namespace references refer to its named exports, without a CDN request.
const exportAt=three.lastIndexOf('export {');
const exportNames=three.slice(exportAt+8,three.indexOf('};',exportAt)).split(',').map(s=>s.trim()).filter(Boolean);
const namespace=exportNames.map(s=>{const p=s.split(/\s+as\s+/);return p.length===2?p[1]+':'+p[0]:s;}).join(',');
const library=three.slice(0,exportAt)+'\nconst THREE={'+namespace+'};\n';
html=html.replace('/* BUNDLE */',()=>library+'\n'+sim+'\n'+seededCampaign+'\n'+fs.readFileSync(path.join(root,'construction.js'),'utf8')+'\n'+app.replace('/* ORIGINAL_ART */',reused).replace('/* SCENERY */',fs.readFileSync(path.join(root,'scenery.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'map-art.js'),'utf8')).replace('/* FLOW */',fs.readFileSync(path.join(root,'flow.js'),'utf8')).replace('/* CAMERA */',fs.readFileSync(path.join(root,'camera.js'),'utf8')).replace('/* EXPERIENCE */',fs.readFileSync(path.join(root,'experience.js'),'utf8')));
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Built offline index.html: '+Buffer.byteLength(html)+' bytes; reused '+names.length+' original model helpers.');

