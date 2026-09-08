const fs=require('fs'),vm=require('vm'),assert=require('assert');let now=0,serial=0,tasks=new Map();const elements=new Map(),listeners={};let scrollNode=null;
function element(){return {innerHTML:'',textContent:'',value:'',style:{},scrollTop:0,hidden:false,open:false,classList:{add(){},remove(){}},addEventListener(){},querySelector(s){return s==='#roster-scroll'?scrollNode:null},querySelectorAll(){return []},focus(){},close(){this.open=false},showModal(){this.open=true}}}
const doc={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelector(){return null},addEventListener(k,f){listeners[k]=f},hidden:false,activeElement:null};const ctx={document:doc,window:{addEventListener(){}},navigator:{},location:{hash:''},URLSearchParams,FormData,performance:{now:()=>now},setTimeout(fn,ms){let id=++serial;tasks.set(id,{fn,at:now+ms,ms,repeat:false});return id},setInterval(fn,ms){let id=++serial;tasks.set(id,{fn,at:now+ms,ms,repeat:true});return id},clearTimeout(id){tasks.delete(id)},clearInterval(id){tasks.delete(id)},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../mockups/blindstop.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],ctx);const run=s=>vm.runInContext(s,ctx);
function advance(ms){let end=now+ms,guard=10000;while(guard--){let next=[...tasks].filter(([k,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;let [id,v]=next;now=v.at;if(v.repeat)v.at+=v.ms;else tasks.delete(id);v.fn()}assert(guard>0);now=end}
for(const n of [2,8,12,16,20]){run(`people.forEach((p,i)=>{p.active=i<${n};p.seen=i<${n};p.history=Array(5).fill({error:.95-p.id*.02})});S.gameRounds=5;S.results=active().map(p=>({id:p.id,error:.95-p.id*.02}));`);for(const screen of ['lobby','countdown','round','waiting','roundResult','final','summary']){run(`S.screen='${screen}';render()`);let html=elements.get('app').innerHTML;assert(!html.includes('undefined'));let ids=[...html.matchAll(/data-player-slot="(\d+)"/g)].map(m=>+m[1]);if(['lobby','waiting','roundResult'].includes(screen))assert.deepEqual(ids,Array.from({length:n},(_,i)=>i));if(screen==='final')assert.deepEqual(ids,Array.from({length:n},(_,i)=>n-i-1));}}
for(const rounds of [1,5,20]){run(`resetRoom();S.me=0;S.rounds=${rounds};S.pace='manual';people.forEach(p=>{p.active=true;p.seen=true});startGame()`);for(let r=1;r<=rounds;r++){advance(3000);assert.equal(run('S.screen'),'round');const target=run('S.target');assert.notEqual(Math.round(target*100)%100,0);advance(target*1000+100);run('tap();tap()');if(run('S.screen')==='waiting')advance(2000);assert.equal(run('S.screen'),'roundResult');assert.equal(run('self().history.length'),r);advance(10000);assert.equal(run('S.screen'),'roundResult');run('advanceRound()')}assert.equal(run('S.screen'),'final');assert.equal(run('S.games'),1);assert.equal(run('self().allHistory.length'),rounds)}
for(let i=0;i<25;i++){const targets=run('makeTargets(20)');assert.equal(new Set(targets).size,20);targets.forEach((x,j)=>{const cents=Math.round(x*100),frac=cents%100;assert(x>=3.11&&x<=11.89);assert(frac>=11&&frac<=89&&frac%5!==0);if(j)assert(Math.abs(x-targets[j-1])>=.799999)})}
run("resetRoom();S.me=0;S.screen='lobby';gameSetup()");doc.getElementById('rounds-count').value='0';doc.getElementById('preview-people').value='20';run('saveSetup()');assert.equal(run('S.rounds'),5,'invalid input leaves fresh-room defaults unchanged');doc.getElementById('rounds-count').value='3';run('saveSetup()');assert.equal(run('S.rounds'),3);assert.equal(run('active().length'),20);
run("S.screen='lobby';gameSetup()");doc.getElementById('rounds-count').value='5';doc.getElementById('preview-people').value='8';run('saveSetup()');assert.equal(run('seen().length'),8);
run('S.resetList=false');scrollNode=element();scrollNode.scrollTop=276;run("S.screen='waiting';render()");assert.equal(run('S.listScroll'),276);run("S.screen='roundResult';render()");assert.equal(scrollNode.scrollTop,276);run("screen('final')");assert.equal(scrollNode.scrollTop,0);scrollNode=null;
run("resetRoom();S.me=0;S.rounds=1;S.pace='auto';startGame()");advance(3000);advance(run('S.target')*1000+1500);run('tap()');assert.equal(run('S.screen'),'roundResult');advance(7000);assert.equal(run('S.screen'),'roundResult');advance(1000);assert.equal(run('S.screen'),'final');
console.log('PASS: 2/8/12/16/20 players; complete 1/5/20-round games; 500 fractional targets; unique targets and minimum separation; settings bounds; preserved scroll; final ranking reset; 8-second auto ending.');


run("resetRoom();S.me=0;S.screen='lobby';offerStart()");assert(doc.getElementById('dialog').innerHTML.includes('Try one practice round'));
run('startPractice()');advance(3000);advance(6500);run('tap()');advance(2000);assert.equal(run('S.screen'),'roundResult');assert.equal(run('self().history.length'),0);assert.equal(run('S.games'),0);run('advanceRound()');assert.equal(run('S.practice'),false);assert.equal(run('S.screen'),'countdown');
run("stopTimers();people.forEach(p=>p.active=p.id<3);people[0].history=[{error:7.5},{error:6.5}];people[1].history=[{error:null},{error:0}];people[2].history=[{error:7.0},{error:7.0}];S.results=[{id:0,error:7.5},{id:1,error:null},{id:2,error:0}]");assert.equal(run('place(people[0])'),1);assert.equal(run('place(people[2])'),1);assert.equal(run('place(people[1])'),3);assert.equal(run('rank(active(),roundMetric,people[1])'),3);
run("S.screen='roundResult';S.resultsView='overall';render()");run('showOverall()');assert(doc.getElementById('dialog').innerHTML.includes('Overall standings'));assert(doc.getElementById('dialog').innerHTML.includes('1/2 taps'));run('dismiss()');
run('resetRoom();S.me=0;S.rounds=1;S.pace="manual";startGame()');advance(3000);advance(1000);run('tap()');const saved=run('JSON.stringify(S.results)');run('pauseGame(true)');assert.equal(run('S.screen'),'paused');assert.notEqual(run('S.host'),0);advance(20000);assert.equal(run('JSON.stringify(S.results)'),saved);run('resumeGame()');assert.equal(run('S.screen'),'waiting');advance(20000);assert.equal(run('self().history.length'),1);assert.equal(run('S.screen'),'roundResult');run('advanceRound(true)');assert.equal(run('S.games'),1);
run("people.forEach(p=>p.history=[{error:null}]);S.scored=false;S.games=0;people.forEach(p=>p.total=0);finishGame()");assert.equal(run('people.reduce((s,p)=>s+p.total,0)'),0);assert(elements.get('app').innerHTML.includes('No completed taps'));
console.log('PASS: optional unscored practice, completion-first scoring, ties, overall results, pause/resume preserves taps, host transfer, zero-tap game.');
run("resetRoom();S.me=0;S.rounds=3;S.pace='auto';startGame()");advance(3000);advance(run('S.target')*1000+1500);run('tap()');assert.equal(run('S.screen'),'roundResult');run('menu()');assert.equal(run('S.resultPaused'),true);advance(15000);assert.equal(run('S.screen'),'roundResult');run('showRoundDetails()');assert(doc.getElementById('dialog').innerHTML.includes('Your tap'));run('dismiss()');assert(!elements.get('app').innerHTML.includes('result-tabs'));assert(!elements.get('app').innerHTML.includes('Your tap'));
const copy=run('JSON.stringify(COPY)');for(const stale of ['10 rounds.','eight seats','3.00 s penalty','2–8 players'])assert(!copy.includes(stale),stale);assert(copy.includes('1–20 rounds'));assert(copy.includes('8 seconds'));console.log('PASS: simplified result screen, details on demand, automatic rounds paused for reading, current copy.');

// Leaving a local preview must preserve the same round and recorded taps on rejoin.
for (const phase of ['countdown', 'round', 'waiting', 'roundResult', 'paused']) {
  run("resetRoom();S.me=0;S.rounds=2;S.pace='manual';startGame()");
  if (phase !== 'countdown') advance(3000);
  if (['waiting', 'roundResult', 'paused'].includes(phase)) run('tap()');
  if (phase === 'roundResult') advance(20000);
  if (phase === 'paused') run('pauseGame(false)');
  const before = run('JSON.stringify({results:S.results,history:self().history,round:S.round})');
  run("action('confirmLeave',{});");
  assert.equal(run('S.screen'), 'return');
  const returningPlayer = run('S.me');
  run("action('back',{});action('join',{})");
  assert.equal(run('S.screen'), 'return');
  assert.equal(run('S.me'), returningPlayer);
  advance(20000);
  assert.equal(run('JSON.stringify({results:S.results,history:self().history,round:S.round})'), before);
  run("action('rejoin',{});");
  assert.equal(run('S.screen'), phase === 'paused' ? 'waiting' : phase);
  assert.equal(run('JSON.stringify({results:S.results,history:self().history,round:S.round})'), before);
  assert.equal(run('S.games'), 0);
}
run("resetRoom();S.screen='lobby';action('confirmLeave',{});action('rejoin',{})");
assert.equal(run('S.screen'), 'lobby');
assert.equal(run('S.live'), false);
console.log('PASS: leave/rejoin preserves countdown, active round, saved tap, results and paused preview; idle room stays idle.');

// Room ownership and immediate pacing are independent of game progression.
run("resetRoom();S.me=0;S.screen='lobby';gameSetup()");
doc.getElementById('rounds-count').value='3';doc.getElementById('preview-people').value='20';
run("S.setupDraft.pace='auto';commitSetup()");
assert.equal(run('S.pace'),'auto');assert.equal(run('S.rounds'),3);
run("S.setupDraft.pace='manual';commitSetup();dismiss();startGame();S.pace='auto'");
advance(3000);run('tap()');advance(20000);
assert.equal(run('S.screen'),'roundResult');
assert(!elements.get('app').innerHTML.includes('data-action="toggleAuto"'));
assert(elements.get('app').innerHTML.includes('Round 1 results'));
assert(!elements.get('app').innerHTML.includes('Next round ·'));
run("stopTimers();S.live=false;S.screen='lobby';editIdentity()");
doc.getElementById('identity-name').value='Arthur';run('S.identityFace=25;saveIdentity()');
const identity=run('JSON.stringify({id:self().id,name:self().name,face:self().face})');
run('chooseGame();dismiss();S.pace="manual";S.rounds=1;startGame()');
advance(3000);run('tap()');advance(20000);run('advanceRound()');
const points=run('self().total');run("action('lobby',{});startGame()");
assert.equal(run('JSON.stringify({id:self().id,name:self().name,face:self().face})'),identity);
assert.equal(run('self().total'),points);
run("S.pace='auto';action('create',{})");
assert.equal(run('S.pace'),'manual');assert.equal(run('S.rounds'),5);assert.equal(run('S.games'),0);
console.log('PASS: immediate setup, frozen manual game pace, unambiguous round labels, room identity and points survive rematches, new rooms reset pacing.');

run("dismiss();S.screen='lobby';menu()");
const parentMenu=doc.getElementById('dialog').innerHTML;
run('roomPoints()');assert.equal(run('dialogTrail.length'),1);
assert(doc.getElementById('dialog').innerHTML.includes('data-action="dialogBack"'));
run('dialogBack()');assert.equal(doc.getElementById('dialog').innerHTML,parentMenu);
run('dismiss()');assert.equal(run('dialogTrail.length'),0);
console.log('PASS: nested dialogs return to the room menu and Close clears navigation history.');

// Selection is navigation, not a game start; room membership survives both routes.
run("resetRoom();S.me=0;screen('catalogue')");
assert(elements.get('app').innerHTML.includes('Choose a game'));
for(const control of ['prepare-rounds','roster-scroll','data-action="start"']) assert(!elements.get('app').innerHTML.includes(control));
run("action('selectGame',{})");assert.equal(run('S.screen'),'lobby');assert.equal(run('S.live'),false);
assert(elements.get('app').innerHTML.includes('data-action="setup"'));
assert(!elements.get('app').innerHTML.includes('Ready'));
run("self().total=7;S.games=1;self().name='Arthur';self().face=25;S.screen='final';action('selectGame',{})");
assert.equal(run('S.screen'),'lobby');assert.equal(run('S.live'),false);assert.equal(run('self().total'),7);
run("chooseGame();action('confirmLeave',{});action('rejoin',{})");assert.equal(run('S.screen'),'catalogue');
assert.equal(run('self().name'),'Arthur');assert.equal(run('self().face'),25);
run("S.me=1;screen('catalogue');action('selectGame',{})");assert.equal(run('S.screen'),'catalogue');
assert(elements.get('app').innerHTML.includes('Waiting for Arthur to choose a game'));
assert(!elements.get('app').innerHTML.includes('data-action="selectGame"'));
run("screen('lobby')");assert(!elements.get('app').innerHTML.includes('prepare-rounds'));
assert(!elements.get('app').innerHTML.includes('data-action="start"'));
run("screen('final');action('lobby',{})");assert.equal(run('S.screen'),'final');
console.log('PASS: separate selection/preparation, host-only transitions, guest waiting, replay preparation and room preservation.');

// Completed results survive local leave/rejoin; room management cannot rewrite them.
run("resetRoom();S.me=0;S.screen='final';action('confirmLeave',{});action('rejoin',{})");
assert.equal(run('S.screen'),'final');run('menu()');assert(!doc.getElementById('dialog').innerHTML.includes('data-action="manage"'));run('dismiss()');
run("S.me=1;screen('catalogue');action('demoSelect',{})");assert.equal(run('S.screen'),'lobby');run("action('demoStart',{})");assert.equal(run('S.screen'),'countdown');run('stopTimers()');
console.log('PASS: final-result return and explicit guest host-simulation controls.');

run("resetRoom();S.me=1;S.screen='lobby';render()");
assert(elements.get('app').innerHTML.includes('data-action="chooseGame"'));
const guestRoom = run('JSON.stringify({me:S.me,host:S.host,people})');
run('chooseGame()');
assert.equal(run('S.screen'),'catalogue');
assert.equal(run('JSON.stringify({me:S.me,host:S.host,people})'),guestRoom);
run('prepareGame()');
assert.equal(run('S.screen'),'catalogue');
console.log('PASS: guest can return to catalogue without gaining host selection permissions.');
