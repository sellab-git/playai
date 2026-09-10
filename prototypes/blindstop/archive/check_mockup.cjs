const fs=require('fs'), vm=require('vm'), assert=require('assert');
const elements=new Map();
function element(){return {innerHTML:'',textContent:'',className:'',value:'',hidden:false,style:{},open:false,addEventListener(){},querySelectorAll(){return []},scrollTop:0,focus(){},close(){this.open=false},showModal(){this.open=true}}}
const doc={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},addEventListener(){},hidden:false};
let timers=new Map(),id=0,clock=0;
const ctx={document:doc,navigator:{},window:{addEventListener(){}},location:{hash:'',reload(){}},URLSearchParams,performance:{now:()=>clock},setTimeout(fn,ms){timers.set(++id,{fn,ms,interval:false});return id},clearTimeout(i){timers.delete(i)},setInterval(fn,ms){timers.set(++id,{fn,ms,interval:true});return id},clearInterval(i){timers.delete(i)},console,FormData};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/check.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
for(const n of [2,5,8]){run(`state.count=${n}`);for(const name of run('SCREENS.map(s=>s[0])')){run(`navigate('${name}',{seed:true})`);assert(elements.get('app').innerHTML.length>150,name);assert(!elements.get('app').innerHTML.includes('undefined'),name)}}
run("state.count=5;state.me=0;state.host=0;state.games=0;roster.forEach(p=>{p.total=0;p.history=[];p.active=true});beginGame()");
function fire(){const entry=[...timers.entries()][0];assert(entry,'timer expected');const [k,v]=entry;if(!v.interval)timers.delete(k);v.fn();}
for(let round=1;round<=10;round++){
assert.equal(run('state.screen'),'countdown');fire();fire();fire();assert.equal(run('state.screen'),'round');clock+=run('state.target')*1000+125;run('finishTap((performance.now()-state.started)/1000)');assert.equal(run('state.screen'),'waiting');run('finishTap(99)');assert.equal(run('me().history.length'),round,'double tap must not add score');fire();assert.equal(run('state.screen'),'roundResult');fire();fire();fire();}
assert.equal(run('state.screen'),'gameResult');assert.equal(run('state.games'),1);assert.equal(run('me().history.length'),10);assert.equal(run('people().reduce((s,p)=>s+p.total,0)'),15);
const total=run('me().total');run("navigate('lobbyTotals')");assert.equal(run('me().total'),total);
run("state.me=1;navigate('gameResultPlayer')");assert(!elements.get('app').innerHTML.includes('data-action="again"'));
run("navigate('offline')");assert(elements.get('app').innerHTML.includes('id="tap-zone" data-action="tap" disabled'));
run("navigate('missed',{seed:true})");assert(elements.get('app').innerHTML.includes('No tap'));assert(elements.get('app').innerHTML.includes('3.00 s penalty'));
run("navigate('gameResult',{seed:true});action('confirmRemove',{dataset:{id:'1'}})");assert(run('eveningPeople().some(p=>p.id===1)'),'departed player score preserved');
console.log('PASS: 24 screens × 3 player counts; complete 10-round timer flow; duplicate tap; totals; participant actions; disabled offline tap; missing-tap label; departed-player scores.');
