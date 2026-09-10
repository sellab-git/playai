const fs=require('fs'),vm=require('vm'),assert=require('assert');let now=0,serial=0,tasks=new Map();const elements=new Map(),listeners={};let scrollNode=null;
function element(){return {innerHTML:'',textContent:'',value:'',style:{},scrollTop:0,hidden:false,open:false,classList:{add(){},remove(){}},listeners:{},addEventListener(k,f){this.listeners[k]=f},querySelector(s){return s==='#roster-scroll'?scrollNode:null},querySelectorAll(){return []},focus(){},close(){this.open=false},showModal(){this.open=true}}}
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

// Impostor is a bounded local prototype: one concealed role, discussion, confirmed vote, result.
run("resetRoom();S.me=0;people.forEach((p,i)=>{p.active=i<3;p.seen=i<3});self().total=9;S.games=2;S.screen='catalogue'");
run("action('selectGame',{dataset:{id:'impostor'}})");
assert.equal(run('S.screen'),'impostorPrepare');assert.equal(run('S.gameId'),'impostor');
assert(elements.get('app').innerHTML.includes('One round · no evening points'));
run("action('impostorStart',{})");assert.equal(run('S.screen'),'impostorRole');
assert.equal(run('S.impostor.impostorId'),1);assert(!elements.get('app').innerHTML.includes('Lantern'));
run("action('revealRole',{})");assert(elements.get('app').innerHTML.includes('Lantern'));
doc.hidden=true;listeners.visibilitychange();assert.equal(run('S.impostor.revealed'),false);assert(!elements.get('app').innerHTML.includes('Lantern'));doc.hidden=false;
run("action('revealRole',{});action('hideRole',{})");assert.equal(run('S.screen'),'impostorClues');
assert.equal(run('S.impostor.speakerIds.join()'),'0,1,2');
run("action('openVote',{});S.me=2;action('nextClue',{})");assert.equal(run('S.impostor.speakerIndex'),0);
run("S.me=0;action('roleReminder',{});action('revealReminder',{})");assert(doc.getElementById('dialog').innerHTML.includes('Lantern'));
doc.hidden=true;listeners.visibilitychange();doc.hidden=false;assert.equal(doc.getElementById('dialog').innerHTML,'');assert.equal(run('dialogTrail.length'),0);
run("S.me=1;S.impostor.previewRole='ordinary';action('roleReminder',{});action('revealReminder',{})");assert(!doc.getElementById('dialog').innerHTML.includes('Lantern'));run('dismiss()');
run("S.me=0;action('nextClue',{});S.me=1;action('nextClue',{});S.me=0;action('nextClue',{})");assert.equal(run('S.screen'),'impostorDiscussion');
run("action('openVote',{})");assert.equal(run('S.screen'),'impostorVote');assert(!elements.get('app').innerHTML.includes('data-id="0"'));
run("action('chooseSuspect',{dataset:{id:'1'}});action('confirmVote',{})");assert(doc.getElementById('dialog').innerHTML.includes('cannot be changed'));
run("action('castImpostorVote',{})");assert.equal(run('S.screen'),'impostorWaiting');assert(elements.get('app').innerHTML.includes('1 of 3 votes received'));assert(!elements.get('app').innerHTML.includes('Lantern'));
run("action('previewVotes',{})");assert.equal(run('S.screen'),'impostorResult');assert(elements.get('app').innerHTML.includes('The impostor was caught.'));assert(elements.get('app').innerHTML.includes('Ordinary players win'));assert(elements.get('app').innerHTML.includes('Lantern'));
assert.equal(run('self().total'),9);assert.equal(run('S.games'),2);
run("S.impostor.votes=[{voter:0,target:1},{voter:1,target:2},{voter:2,target:0}];render()");
assert(elements.get('app').innerHTML.includes('The vote was tied'));assert(elements.get('app').innerHTML.includes('Nobody is eliminated.'));assert(elements.get('app').innerHTML.includes('Impostor wins'));
run("action('replayImpostor',{})");assert.equal(run('S.screen'),'impostorPrepare');
console.log('PASS: Impostor preparation, private reveal/background concealment, no-self confirmed vote, caught/tied results, replay and unchanged evening totals.');

run("S.me=1;S.host=0;S.gameId='impostor';S.screen='impostorPrepare';S.impostor=null;render();action('impostorStart',{})");
assert.equal(run('S.screen'),'impostorPrepare');assert(elements.get('app').innerHTML.includes('Waiting for Artur'));
console.log('PASS: Impostor start and phase progression remain host-only for guests.');
run("action('chooseGame',{});action('previewSelectImpostor',{});action('previewDeal',{});action('revealRole',{});action('confirmLeave',{});action('rejoin',{})");
assert.equal(run('S.screen'),'impostorRole');assert.equal(run('S.impostor.revealed'),false);
run("action('revealRole',{});action('hideRole',{});action('openVote',{})");assert.equal(run('S.screen'),'impostorClues');
run("while(S.screen==='impostorClues') action('previewSpeaker',{})");assert.equal(run('S.screen'),'impostorDiscussion');
run("action('previewVoting',{})");assert.equal(run('S.screen'),'impostorVote');
run("S.me=S.host;screen('impostorPrepare');action('chooseGame',{});action('selectGame',{dataset:{id:'blindstop'}})");assert.equal(run('S.screen'),'lobby');
console.log('PASS: Impostor Games return, concealed rejoin, explicit guest simulation and switching back to Blindstop.');

// Categories keeps drafts locally, reviews in stable category order, and never changes evening totals.
run("resetRoom();S.me=0;people.forEach((p,i)=>{p.active=i<3;p.seen=i<3});self().total=11;S.games=2;S.screen='catalogue';action('selectGame',{dataset:{id:'categories'}})");
assert.equal(run('S.screen'),'categoriesPrepare');assert(elements.get('app').innerHTML.includes('One round · letter B'));
run("action('categoriesStart',{});S.categories.draft=[' Brazil ','Berlin','Bear','Bread'];action('categoriesStop',{})");
assert.equal(run('S.screen'),'categoriesWaiting');
const categorySaved=run('JSON.stringify(S.categories)');run("action('confirmLeave',{});action('rejoin',{})");
assert.equal(run('S.screen'),'categoriesWaiting');assert.equal(run('JSON.stringify(S.categories)'),categorySaved);
run("action('categoriesPreviewCommit',{});S.categories.answers[1]=['brazil','Boston','Bear','Bagel'];S.categories.answers[2]=['France','Bristol','Badger','Brownie'];S.categories.judgments['3:2']=false");
assert.equal(run('S.screen'),'categoriesReview');assert.equal(run('S.categories.reviewIndex'),0);
for(let i=0;i<4;i++)run("action('categoriesConfirm',{})");
assert.equal(run('S.screen'),'categoriesResult');
assert.deepEqual(JSON.parse(run('JSON.stringify(S.categories.scores)')),{0:30,1:30,2:20});
assert.equal(run('self().total'),11);assert.equal(run('S.games'),2);
run("action('replayCategories',{})");assert.equal(run('S.screen'),'categoriesPrepare');
run("S.me=1;S.host=0;S.categories=null;action('categoriesStart',{})");assert.equal(run('S.screen'),'categoriesPrepare');
console.log('PASS: Categories draft/rejoin, host review, normalized duplicates, rejection and wrong-letter scoring, replay, guards and unchanged evening totals.');

// Categories cannot enter Blindstop timing or bypass completion guards.
run("S.me=0;screen('categoriesPrepare');startCategories();action('categoriesStop',{})");assert.equal(run('S.screen'),'categoriesWrite');
run("S.me=1;action('categoriesFinishConfirm',{})");assert.equal(run('S.screen'),'categoriesWrite');
run("S.me=0;S.categories.draft[0]='Brazil'");doc.hidden=true;listeners.visibilitychange();doc.hidden=false;assert.equal(run('S.screen'),'categoriesWrite');assert.equal(run('S.categories.draft[0]'),'Brazil');
run("action('categoriesFinishConfirm',{})");assert.equal(run('S.screen'),'categoriesWaiting');assert.equal(run('Object.keys(S.categories.answers).length'),3);assert.equal(run('S.categories.answers[0][1]'),'');
const frozenSheets=run('JSON.stringify(S.categories.answers)');run("action('categoriesPreviewCommit',{})");assert.equal(run('JSON.stringify(S.categories.answers)'),frozenSheets);

// Review previews and final totals share a calculation; Back preserves judgments.
run("resetRoom();S.me=0;people.forEach((p,i)=>{p.active=i<3;p.seen=i<3});S.gameId='categories';S.screen='categoriesPrepare';startCategories()");
assert.equal(run('categoryWritingHint()'),'0 of 4 filled');
const unchangedForm=elements.get('app').innerHTML;
const stopButton={disabled:true};const oldQuery=elements.get('app').querySelector;
elements.get('app').querySelector=s=>s==='[data-action="categoriesStop"]'?stopButton:null;
for(const [i,value] of ['Brazil','Berlin','Bear','Bread'].entries())elements.get('app').listeners.input({target:{id:`category-${i}`,dataset:{categoryIndex:String(i)},value}});
assert.equal(elements.get('app').innerHTML,unchangedForm,'typing must not replace the form');
assert.equal(doc.getElementById('footer-meta').textContent,'Stops writing for everyone');assert.equal(stopButton.disabled,false);
elements.get('app').listeners.input({target:{id:'category-3',dataset:{categoryIndex:'3'},value:'  '}});
assert.equal(doc.getElementById('footer-meta').textContent,'3 of 4 filled');assert.equal(stopButton.disabled,true);
elements.get('app').querySelector=oldQuery;
run("S.categories.draft[3]='Bread';lockCategoryAnswers();previewCategoryAnswers();S.categories.answers={0:['Brazil','Berlin','Bear','Bread'],1:[' brazil ','Boston','Bear','Bread'],2:['France','','Badger','Banana']};render()");
assert.deepEqual(JSON.parse(run('JSON.stringify(categoryBreakdown(0).map(e=>[e.points,e.reason]))')),[[5,'categoryDuplicate'],[5,'categoryDuplicate'],[0,'categoryWrongLetter']]);
run("action('categoriesJudge',{dataset:{id:'1'}})");
assert.deepEqual(JSON.parse(run('JSON.stringify(categoryBreakdown(0).map(e=>[e.points,e.reason]))')),[[10,'categoryUnique'],[0,'categoryRejected'],[0,'categoryWrongLetter']]);
run("action('categoriesPrevious',{})");assert.equal(run('S.categories.reviewIndex'),0);
run("action('categoriesConfirm',{});action('categoriesPrevious',{})");assert.equal(run('S.categories.reviewIndex'),0);assert.equal(run("S.categories.judgments['0:1']"),false);
run("S.me=1;action('categoriesPrevious',{});action('categoriesConfirm',{})");assert.equal(run('S.categories.reviewIndex'),0);
run("S.me=0;action('categoriesJudge',{dataset:{id:'1'}});action('categoriesConfirm',{});action('categoriesConfirm',{});action('categoriesConfirm',{})");
assert(elements.get('app').innerHTML.includes('Show results'));assert.equal(run('S.categories.scores'),null);
run("action('categoriesPrevious',{});action('confirmLeave',{});action('rejoin',{})");assert.equal(run('S.categories.reviewIndex'),2);
run("action('categoriesConfirm',{});action('categoriesConfirm',{})");assert.equal(run('S.screen'),'categoriesResult');
assert.deepEqual(JSON.parse(run('JSON.stringify(categoryStandings().map(e=>[e.player.id,e.points,e.rank,e.tied]))')),[[0,25,1,true],[1,25,1,true],[2,20,3,false]]);
const completed=run('JSON.stringify(S.categories)');run("action('categoriesPrevious',{});action('categoriesConfirm',{})");assert.equal(run('JSON.stringify(S.categories)'),completed);
run("S.categories.scores={0:5,1:30,2:10}");assert.equal(run('categoryStandings().map(e=>e.player.id).join()'),'1,2,0');
console.log('PASS: Categories live input hints without render, score reasons and duplicate recalculation, guarded correction/rejoin, finalization and ranked ties.');

// Judging a scrolled row retains that row's position and keyboard focus.
run("S.screen='categoriesReview';S.categories.reviewIndex=0;S.me=S.host");
let focusedReviewId=null;const reviewBody={scrollTop:420};
const restoreQuery=elements.get('app').querySelector;
elements.get('app').querySelector=selector=>{
  if(selector==='.category-review-shell .body')return reviewBody;
  if(selector==='[data-action="categoriesJudge"][data-id="2"]')return {focus(options){focusedReviewId=2;assert.equal(options.preventScroll,true)}};
  return null;
};
run("action('categoriesJudge',{dataset:{id:'2'}})");
assert.equal(focusedReviewId,2);assert.equal(reviewBody.scrollTop,420);
elements.get('app').querySelector=restoreQuery;

// Bluff: real local input and explicit fixture progression must not reveal authors early.
run("resetRoom();S.me=0;S.host=0;people.forEach((p,i)=>{p.active=i<3;p.seen=i<3});self().total=11;S.games=2;S.screen='catalogue';action('selectGame',{dataset:{id:'bluff'}});action('bluffStart',{})");
assert.equal(run('S.screen'),'bluffWrite');
run("action('bluffSubmit',{});action('bluffSimulateVotes',{})");assert.equal(run('S.screen'),'bluffWrite');
const bluffFormBefore=elements.get('app').innerHTML;
elements.get('app').listeners.input({target:{id:'bluff-answer',dataset:{},value:' Nine '}});
assert.equal(run('S.bluff.draft'),' Nine ');assert.equal(elements.get('app').innerHTML,bluffFormBefore);
run("action('bluffSubmit',{})");assert.equal(run('S.screen'),'bluffSubmitted');assert.equal(run('S.bluff.answers[0]'),'Nine');
run("S.bluff.draft='Changed';action('bluffSubmit',{})");assert.equal(run('S.bluff.answers[0]'),'Nine');
run("action('bluffSimulateAnswers',{})");assert.equal(run('S.screen'),'bluffVote');
assert(!elements.get('app').innerHTML.includes('Natural History Museum'));assert(!elements.get('app').innerHTML.includes('Truth</'));
run("selectBluffOption(bluffOptions().find(o=>o.authors.includes(0)).id);castBluffVote();selectBluffOption('missing');castBluffVote()");
assert.equal(run('S.bluff.votes.length'),0);
run("selectBluffOption(bluffOptions().find(o=>o.truth).id);castBluffVote();castBluffVote()");
assert.equal(run('S.screen'),'bluffVoteWaiting');assert.equal(run('S.bluff.votes.length'),1);
assert(!elements.get('app').innerHTML.includes('Natural History Museum'));
run("action('bluffSimulateVotes',{})");assert.equal(run('S.screen'),'bluffResult');
assert.equal(run('S.bluff.votes.length'),3);run("action('bluffDetails',{})");assert(doc.getElementById('dialog').innerHTML.includes('Natural History Museum'));run('dismiss()');
assert.equal(run('self().total'),11);assert.equal(run('S.games'),2);
const bluffFinished=run('JSON.stringify(S.bluff)');run("action('bluffSimulateVotes',{});action('bluffSimulateAnswers',{});action('bluffCastVote',{})");assert.equal(run('JSON.stringify(S.bluff)'),bluffFinished);
run("action('replayBluff',{})");assert.equal(run('S.screen'),'bluffPrepare');
console.log('PASS: Bluff input without replacement, guarded submissions/self-votes, explicit simulation, concealed reveal, replay and unchanged evening totals.');

// Scoring assertions exercise duplicates, truth aliases and credit separately from fixture choices.
run("startBluff();S.bluff.answers={0:' Nine ',1:'nine',2:'3'}");
assert.equal(run('bluffOptions().length'),2);
assert.equal(run("bluffOptions().find(o=>o.truth).authors.join()"),'2');
run("S.bluff.votes=[{voter:0,option:bluffOptions().find(o=>o.truth).id},{voter:1,option:bluffOptions().find(o=>o.truth).id},{voter:2,option:bluffOptions().find(o=>!o.truth).id}]");
assert.deepEqual(JSON.parse(run('JSON.stringify(bluffScores())')),{0:3,1:3,2:2});
run("S.screen='bluffVote';S.me=2;S.bluff.votes=[];S.bluff.selected=null;render();selectBluffOption(bluffOptions().find(o=>o.truth).id);castBluffVote()");
assert.equal(run('S.bluff.votes.length'),0,'matching truth remains disabled without leaking its status');
assert(elements.get('app').innerHTML.includes('disabled'));assert(!elements.get('app').innerHTML.includes('Natural History Museum'));
console.log('PASS: Bluff duplicate authors share deception credit, numeric truth alias earns only truth credit and stays concealed as an own option.');

for(const phase of ['bluffWrite','bluffSubmitted','bluffVote','bluffVoteWaiting','bluffResult']){
  run("resetRoom();S.me=0;S.host=0;S.screen='catalogue';prepareGame('bluff');startBluff();S.bluff.draft='Nine'");
  if(phase!=='bluffWrite')run('submitBluffAnswer()');
  if(['bluffVote','bluffVoteWaiting','bluffResult'].includes(phase))run('simulateBluffAnswers()');
  if(['bluffVoteWaiting','bluffResult'].includes(phase))run('selectBluffOption(bluffOptions().find(o=>o.truth).id);castBluffVote()');
  if(phase==='bluffResult')run('simulateBluffVotes()');
  const saved=run('JSON.stringify(S.bluff)');
  run("action('confirmLeave',{});action('back',{});action('join',{});action('rejoin',{})");
  assert.equal(run('S.screen'),phase);assert.equal(run('JSON.stringify(S.bluff)'),saved);
}
run("resetRoom();S.me=1;S.host=0;S.screen='catalogue';action('previewSelectBluff',{});action('bluffStart',{})");
assert.equal(run('S.screen'),'bluffPrepare');run("action('previewBluffStart',{})");assert.equal(run('S.screen'),'bluffWrite');
run("S.bluff.draft='x'.repeat(81);submitBluffAnswer()");assert.equal(run('S.screen'),'bluffWrite');
for(const alias of ['3','Three',' THREE   HEARTS! ','3 hearts.'])assert.equal(run(`normalizeBluffAnswer(${JSON.stringify(alias)})`),'three');
run("S.me=0;S.bluff.answers={0:'Three',1:'3',2:'three hearts'};people.forEach((p,i)=>p.active=i<3);freezeBluffOptions()");
assert.equal(run('bluffOptions().filter(o=>!o.truth).length'),1);
assert.equal(run('bluffOptions().find(o=>!o.truth).house'),true);
for(const n of [2,20]){
  run(`resetRoom();S.me=0;S.host=0;people.forEach((p,i)=>{p.active=i<${n};p.seen=i<${n}});S.screen='catalogue';prepareGame('bluff');startBluff();S.bluff.draft='3 hearts';submitBluffAnswer();simulateBluffAnswers()`);
  const frozenOptions=run('JSON.stringify(bluffOptions())'),voteHtml=elements.get('app').innerHTML;
  run('selectBluffOption(bluffOptions().find(o=>!o.authors.includes(S.me)).id)');
  assert.equal(elements.get('app').innerHTML,voteHtml,'selecting an answer must not replace the scrolled list');
  run('castBluffVote();simulateBluffVotes()');
  assert.equal(run('S.screen'),'bluffResult');assert.equal(run('S.bluff.votes.length'),n);
  assert.equal(run('S.bluff.scores[0]'),2);assert.equal(run('JSON.stringify(bluffOptions())'),frozenOptions);
  assert(!elements.get('app').innerHTML.includes('undefined'));
}
console.log('PASS: Bluff recovery in every phase, explicit guest preview and answer length validation.');

// Both voting games update selection in place, preserving the scrolled list and focus.
run("resetRoom();S.me=0;people.forEach(p=>{p.active=true;p.seen=true});S.screen='catalogue';prepareGame('impostor');startImpostor();S.screen='impostorVote';render()");
const voteMarkup=elements.get('app').innerHTML,queryBefore=elements.get('app').querySelector,queryAllBefore=elements.get('app').querySelectorAll;
const voteConfirm={disabled:true},selectedRows=[1,19].map(id=>({dataset:{id:String(id)},setAttribute(key,value){this[key]=value}}));
elements.get('app').querySelectorAll=()=>selectedRows;
elements.get('app').querySelector=selector=>selector==='[data-action="confirmVote"]'?voteConfirm:null;
run("action('chooseSuspect',{dataset:{id:'19'}})");
assert.equal(run('S.impostor.vote'),19);assert.equal(elements.get('app').innerHTML,voteMarkup);
assert.equal(selectedRows[0]['aria-pressed'],'false');assert.equal(selectedRows[1]['aria-pressed'],'true');assert.equal(voteConfirm.disabled,false);
elements.get('app').querySelector=queryBefore;elements.get('app').querySelectorAll=queryAllBefore;
run("castImpostorVote();finishImpostorPreview()");assert.equal(run('S.screen'),'impostorResult');
run("S.screen='catalogue';prepareGame('bluff');startBluff();action('bluffDetails',{})");assert.equal(doc.getElementById('dialog').open,false);
run("S.bluff.draft='Five';submitBluffAnswer();simulateBluffAnswers();selectBluffOption(bluffOptions().find(o=>o.truth).id);castBluffVote();simulateBluffVotes()");
const detailsState=run('JSON.stringify(S.bluff)');
run("action('bluffDetails',{})");assert(doc.getElementById('dialog').innerHTML.includes('By Artur'));assert(doc.getElementById('dialog').innerHTML.includes('Natural History Museum'));
run('dismiss()');assert.equal(run('JSON.stringify(S.bluff)'),detailsState);assert.equal(run('S.screen'),'bluffResult');
console.log('PASS: lower-row Impostor selection preserves markup and updates exact controls; Bluff details are reveal-only and retain result state.');
