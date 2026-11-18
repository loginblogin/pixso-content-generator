const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const messages = [], errors = [], storage = new Map();
let imageFailures = 0;
const figma = {
  currentPage: { selection: [] }, root: { setRelaunchData() {} },
  getStyleByIdAsync: async () => ({type:'TEXT',fontName:{family:'Inter',style:'Regular'}}),
  showUI() {}, on() {}, loadFontAsync: async () => {},
  notify: (message, options) => errors.push({message, options}),
  createImage: () => ({hash: 'downloaded'}),
  clientStorage: {getAsync: async k => storage.get(k), setAsync: async (k,v) => storage.set(k,v)},
  ui: {resize() {}, postMessage(message) {
    messages.push(message);
    if (message.type === 'fetch-image') queueMicrotask(() => figma.ui.onmessage({type:'image-bytes', requestId:message.requestId, ...(imageFailures-- > 0 ? {error:'HTTP 404'} : {bytes:new Uint8Array([1,2])})}));
  }}
};
const context = vm.createContext({figma, __html__:'', console});
vm.runInContext(fs.readFileSync(path.join(root,'code.js'),'utf8'), context);
function text(name, value='Original   12:00') {
  const n = {type:'TEXT', name, characters:value, styles:[], setRelaunchData() {},
    getRangeAllFontNames: () => [{family:'Inter',style:'Regular'}],
    getRangeFontName: start => ({family:'Inter',style:start ? 'Regular':'Bold'}),
    getRangeFontSize: start => start ? 14 : 20,
    getRangeFills: start => [{type:'SOLID',color:{r:start?0.6:0,g:0,b:0}}],
    getRangeLetterSpacing: () => ({unit:'PIXELS',value:0}),
    getRangeLineHeight: () => ({unit:'AUTO'}),
    getRangeTextStyleId: start => start ? 'second':'first', getRangeFillStyleId: () => '',
    getRangeTextCase: () => 'ORIGINAL', getRangeTextDecoration: () => 'NONE',
    setRangeTextStyleId() {throw Error('Forbidden sync style API')},
    setRangeFillStyleId() {throw Error('Forbidden sync style API')},
    async setRangeTextStyleIdAsync(a,b,v) {await Promise.resolve();this.styles.push(['textStyle',a,b,v]);},
    async setRangeFillStyleIdAsync(a,b,v) {await Promise.resolve();this.styles.push(['fillStyle',a,b,v]);}
  };
  for (const p of ['FontName','FontSize','Fills','LetterSpacing','LineHeight','TextCase','TextDecoration']) n['setRange'+p] = (a,b,v) => n.styles.push([p,a,b,v]);
  return n;
}
async function fill(nodes, params={}, descriptions) {
  figma.currentPage.selection=nodes;
  return context.action_fill(context.normalizeParams(params),nodes[0],null,undefined,descriptions);
}
(async()=>{
  const markers=['*news','*news-time','*anons','*article-title-description','*description','*author','*date','*time','*datetime-num','*rnd-10-100','*text','*quote','*photo-description','*country','*team-soccer','*team-tennis','*team-box','*category-lenta','*category-gazeta'];
  const nodes=markers.map(m=>text(m));await fill(nodes);
  assert(nodes.every(n=>n.characters!=='Original   12:00'));
  assert(/   \d{2}:\d{2}$/.test(nodes[1].characters));
  const article=nodes[3];assert(article.characters.length>=80&&article.characters.length<=130);
  const second=article.styles.find(s=>s[0]==='textStyle'&&s[3]==='second');assert(second);assert.equal(second[2],article.characters.length);
  assert(article.styles.some(s=>s[0]==='FontName'&&s[1]===second[1]&&s[3].style==='Regular'));
  const disabled=markers.map(m=>text(m));const off=vm.runInContext('Object.fromEntries(Object.keys(DEFAULTS).filter(k=>k.startsWith("fill")).map(k=>[k,false]))',context);await fill(disabled,off);assert(disabled.every(n=>n.characters==='Original   12:00'));
  const untouched=text('news');await fill([untouched]);assert.equal(untouched.characters,'Original   12:00');
  const ai=text('*description');await fill([ai],{},['AI description']);assert.equal(ai.characters,'AI description');
  const fire=text('*news-time');await fill([fire],{fireEmoji:true,prefixSymbol:'!',prefixProbability:100});assert(fire.characters.startsWith('! '));
  const main={parent:{type:'COMPONENT_SET',componentPropertyDefinitions:{'Variant***':{type:'VARIANT',variantOptions:['01','02']}}}};
  const inst={type:'INSTANCE',name:'Avatar***',children:[],componentProperties:{Size:{type:'VARIANT',value:'80'},'Variant***':{type:'VARIANT',value:'01'}},get mainComponent(){throw Error('Forbidden sync mainComponent')},getMainComponentAsync:async()=>main,setProperties(p){assert.equal(p.Size,'80');for(const k in p)this.componentProperties[k].value=p[k]}};
  await fill([inst],{randomizeChange:true});assert.equal(inst.componentProperties['Variant***'].value,'02');
  const img={type:'RECTANGLE',name:'*img',fills:[{type:'IMAGE',scaleMode:'FIT',imageHash:'old'}]};await fill([img],{fillImg:true});assert.equal(img.fills[0].imageHash,'downloaded');assert.equal(img.fills[0].scaleMode,'FIT');
  await figma.ui.onmessage({type:'save-settings',apiKey:'test-key',aiPrompt:'topic',useAi:true});await figma.ui.onmessage({type:'request-settings'});assert(messages.some(m=>m.type==='saved-settings'&&m.apiKey==='test-key'));
  imageFailures=2;
  let start=messages.length;
  const retryImage={type:'RECTANGLE',name:'*img',fills:[{type:'IMAGE',scaleMode:'FIT',imageHash:'old'}]};
  await fill([retryImage],{fillImg:true});
  let requests=messages.slice(start).filter(m=>m.type==='fetch-image');
  assert.equal(requests.length,3);assert.equal(new Set(requests.map(m=>m.url)).size,3);assert.equal(retryImage.fills[0].imageHash,'downloaded');
  imageFailures=100;start=messages.length;
  const failedImage={type:'RECTANGLE',name:'*img',fills:[{type:'IMAGE',scaleMode:'FIT',imageHash:'original'}]};
  await fill([failedImage],{fillImg:true});
  requests=messages.slice(start).filter(m=>m.type==='fetch-image');assert.equal(requests.length,8);assert.equal(new Set(requests.map(m=>m.url)).size,8);assert.equal(failedImage.fills[0].imageHash,'original');assert(errors.pop().message.includes('8 попыток'));imageFailures=0;
  assert.equal(errors.length,0);
  // A broken font inside a frame must not prevent later siblings from filling.
  const broken=text('*news');broken.getRangeAllFontNames=()=>[{family:'Missing Family',style:'Bold'}];
  const good=text('*country');const frame={type:'FRAME',name:'Page frame',children:[broken,good]};broken.parent=frame;good.parent=frame;
  const originalLoad=figma.loadFontAsync;figma.loadFontAsync=async f=>{if(f.family==='Missing Family')throw Error('font unavailable')};
  await fill([frame]);assert.equal(broken.characters,'Original   12:00');assert.notEqual(good.characters,'Original   12:00');assert(errors.at(-1).message.includes('Page frame → *news'));assert(errors.at(-1).message.includes('Missing Family'));
  const malformed=text('*news');malformed.getRangeAllFontNames=()=>[{family:'',style:'Bold'}];await fill([malformed]);assert.equal(malformed.characters,'Original   12:00');
  figma.loadFontAsync=originalLoad;
  const nested=text('*country');let writes=0;let value=nested.characters;Object.defineProperty(nested,'characters',{get:()=>value,set:v=>{writes++;value=v}});await fill([{type:'FRAME',name:'Outer',children:[nested]},nested]);assert.equal(writes,1);

  const html=fs.readFileSync(path.join(root,'ui.html'),'utf8');for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new Function(m[1]);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));assert.equal(manifest.documentAccess,'dynamic-page');assert.deepEqual(manifest.editorType,['figma']);
  console.log('PASS: all 19 markers, switches, mixed styles, async APIs, variants, images, AI descriptions, settings, UI and manifest.');
})().catch(e=>{console.error(e);process.exitCode=1});
