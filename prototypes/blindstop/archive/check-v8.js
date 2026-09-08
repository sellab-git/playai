
'use strict';
// Local UX prototype. The other players and room membership are simulated.
// A stable roster slot belongs to a player for the entire evening; it is never sorted.
const COPY={
  "title": "Blindstop",
  "tagline": "Count in your head.<br>Trust your timing.",
  "closest": "Closest tap wins the round.",
  "create": "Create room",
  "join": "Join with code",
  "back": "Back",
  "help": "How to play",
  "room": "Room",
  "invite": "Invite",
  "options": "Options",
  "close": "Close",
  "cancel": "Cancel",
  "name": "Your name",
  "nameHelp": "A nickname is enough.",
  "namePlaceholder": "Your nickname",
  "code": "Room code",
  "codeHelp": "Five characters from your host.",
  "face": "Choose your face",
  "more": "More faces",
  "faceLabel": "Choose face {n}",
  "joinTitle": "Join the room",
  "createTitle": "Create your room",
  "joinAction": "Join room",
  "nameError": "Enter a name, up to 12 characters.",
  "codeError": "Enter a five-character code.",
  "badAlphabet": "Use letters and numbers, without I, O, 0 or 1.",
  "qrReady": "Joining room {code}",
  "meta": "2–20 players · choose 1–20 rounds",
  "players": "Players",
  "timing": "Error",
  "place": "Place",
  "points": "Points",
  "status": "Status",
  "average": "Avg. error",
  "you": "you",
  "host": "host",
  "youHost": "you · host",
  "ready": "Ready",
  "counting": "Counting",
  "locked": "Locked",
  "left": "Left",
  "start": "Start game",
  "waitFor": "Waiting for {name}",
  "waitToStart": "The host starts when everyone is ready.",
  "needPlayer": "Waiting for one more player",
  "joined": "{n} of 20 players",
  "round": "Round {n} of {total}",
  "target": "Stop at",
  "countStarts": "Count when the countdown disappears.",
  "getReady": "Get ready",
  "tap": "Tap",
  "countSilently": "Count in your head.",
  "tapSaved": "Locked in",
  "noTap": "Missed",
  "waiting": "Waiting for {n} more",
  "waitingLast": "Waiting for the last player",
  "waitingNone": "Everyone is ready",
  "hiddenResult": "Your result appears when everyone finishes.",
  "recorded": "Your tap is recorded",
  "early": "early",
  "late": "late",
  "exact": "On target",
  "yourTiming": "Your timing",
  "targetWas": "Target {target} s",
  "winnerRound": "{name} was closest",
  "tieRound": "{n} players tied",
  "noWinner": "No taps this round",
  "next": "Next round in {n}s",
  "finalIn": "Final results in {n}s",
  "roundFinished": "Round complete",
  "final": "Game finished",
  "wins": "{name} wins",
  "tieWins": "{n} players tied for first",
  "yourAverage": "Your average: {n} s",
  "again": "Play again",
  "backRoom": "Lobby",
  "onlyHost": "{name} starts the next game",
  "evening": "The evening",
  "games": "{n} games played",
  "oneGame": "1 game played",
  "total": "Total",
  "endEvening": "End the evening",
  "share": "Share results",
  "newRoom": "Start a new room",
  "earlyInsight": "You went early in {n} of {total} rounds.",
  "lateInsight": "You went late in {n} of {total} rounds.",
  "neutralInsight": "Your average error was {n} s.",
  "noRounds": "No completed rounds yet.",
  "thanks": "That was your evening.",
  "emptySummary": "No games completed.",
  "returnTitle": "Your room is still here.",
  "rejoin": "Rejoin room",
  "newInstead": "Start a new room",
  "roomGone": "Room not found",
  "roomGoneBody": "Check the code with your host. The room may have closed.",
  "editCode": "Try another code",
  "home": "Back to start",
  "fullTitle": "This room is full",
  "fullBody": "All 20 seats are taken. Ask the host to free a seat.",
  "retry": "Try again",
  "playTitle": "A game is underway",
  "playBody": "New players can join between games.",
  "leaveTitle": "Leave this room?",
  "leaveBody": "You can return while the room is still open.",
  "leave": "Leave room",
  "endTitle": "End the evening for everyone?",
  "endBody": "Everyone will see the final table. This room will close.",
  "endConfirm": "End and show results",
  "stopTitle": "End this game?",
  "stopBody": "Completed games keep their points. This unfinished game adds no points.",
  "stop": "End game",
  "removeTitle": "Remove {name}?",
  "removeBody": "Their points from completed games stay in the evening total.",
  "remove": "Remove player",
  "removeShort": "Remove",
  "manage": "Manage players",
  "removeLabel": "Manage {name}",
  "copy": "Copy code",
  "copied": "Code copied",
  "copyFail": "Select the code and copy it.",
  "qrLabel": "Room code {code}",
  "inviteBody": "Show the code to your friends, or read it aloud.",
  "rules1": "Everyone gets the same target time.",
  "rules2": "When the countdown disappears, count silently in your head.",
  "rules3": "Tap once when you think the target time has passed. The round closes 8 seconds after the target.",
  "rules4": "Most completed rounds wins. If equal, the lowest average absolute error wins. Equal displayed averages share a place.",
  "rulesNote": "2–20 players. Choose 1–20 rounds. A practice round is optional and unscored. The host starts each round, or automatic play waits 8 seconds between rounds.",
  "gotIt": "Got it",
  "shareTitle": "Our Blindstop evening",
  "shareHeader": "Blindstop · {n} games",
  "shareLine": "{rank}. {name} — {points} pts",
  "sharedCopy": "Results copied",
  "shareFallback": "Copy this into your group chat.",
  "reconnectTitle": "Ready to return?",
  "reconnectBody": "This preview pauses while you are away. Continue with recorded taps preserved.",
  "resume": "Continue game",
  "paused": "Round paused",
  "tapAgain": "Recorded taps are preserved.",
  "lobbyReturn": "The room and points stay with you.",
  "savedRoom": "Room {code}",
  "liveSummary": "Tonight’s points",
  "noChanges": "No scores yet",
  "seconds": "seconds",
  "newHost": "{name} is now the host",
  "leftRoom": "You left the room",
  "leaveOrStay": "Stay in room",
  "exactNumber": "0.00",
  "finalMeta": "Most completed rounds, then lowest average error",
  "noTapShort": "Missed",
  "pointsUnit": "{n} pts",
  "nameSuffix": "{name} {n}",
  "freeSeat": "Free seat",
  "creatorNote": "Invite your friends, then start.",
  "roomCodeSelect": "Select room code",
  "codeName": "K7QMX",
  "maxPlayers": "20 players maximum",
  "setup": "Game setup",
  "setupButton": "{n} rounds · {pace}",
  "roundsLabel": "Rounds",
  "roundCount": "{n} rounds",
  "fewerRounds": "Fewer rounds",
  "moreRounds": "More rounds",
  "roundsHint": "1–20 rounds. Five is a good first game.",
  "duration": "About {min}–{max} minutes of play",
  "saveSetup": "Save setup",
  "setupValidation": "Choose 1–20 rounds and 2–20 players.",
  "demoPeople": "Players in this preview",
  "demoPeopleHint": "Fills the room with simulated participants.",
  "allPlayers": "{n} players",
  "scrollHint": "Scroll for all {n} players",
  "gameInfo": "{n} rounds · {pace}",
  "changeFace": "Change face",
  "allFaces": "Choose your face",
  "faceDone": "Use this face",
  "roundPace": "Round pace",
  "hostPace": "Host starts",
  "autoPace": "Automatic",
  "hostPaceDesc": "Read the results. Start the next round when everyone is ready.",
  "autoPaceDesc": "The next round starts after 8 seconds. You can pause the countdown.",
  "hostPaceShort": "You start each round",
  "autoPaceShort": "8 seconds between rounds",
  "paceButton": "Rounds: {mode}",
  "nextRound": "Next round",
  "seeFinal": "See final results",
  "waitingNext": "Waiting for host · {name}",
  "resultReady": "Start when everyone is ready.",
  "autoNext": "Next round in {n}s",
  "autoFinal": "Final results in {n}s",
  "pause": "Pause",
  "resumeAuto": "Resume",
  "autoPaused": "Automatic rounds paused",
  "inviteFriends": "Invite friends",
  "shareShort": "Share results",
  "newShort": "New room",
  "bestRound": "Closest this round",
  "yourPlace": "You finished #{n}",
  "sessionIntro": "A room for the whole evening.",
  "joinShort": "Join room",
  "closeRoom": "Close room",
  "missed": "Missed",
  "practiceTitle": "Try one practice round?",
  "practiceBody": "One round to get a feel for the start and the tap. It does not count towards your score.",
  "practiceAction": "Try a round",
  "skipPractice": "Start game",
  "practiceRound": "Practice · no points",
  "practiceComplete": "Practice complete",
  "startScored": "Start game",
  "demoDisconnectLabel": "Preview: disconnect",
  "demoHostLabel": "Preview: change host",
  "demoNextLabel": "Preview: host continues",
  "scoringNote": "A missed tap ranks below every recorded tap. Averages use recorded taps only. Evening points: player count minus game place, plus one. Tied players receive equal points; no recorded taps means no points.",
  "roundDetails": "Round details",
  "overallResults": "Overall standings",
  "yourStats": "Your game",
  "previewOptions": "Preview controls",
  "roundPlace": "Your place: #{n} of {total}",
  "targetValue": "Target",
  "tapValue": "Your tap",
  "errorValue": "Your error",
  "completedValue": "Completed rounds",
  "bestValue": "Best tap error",
  "averageValue": "Average error",
  "noMeasuredAverage": "No measured average",
  "noCompletedTaps": "No completed taps",
  "noGamePoints": "No points this game",
  "noPracticePoints": "Practice · no points",
  "nextNumber": "Next round · {n}/{total}",
  "previewExplanation": "These controls simulate connection and host changes on this phone."
};
const tr=(key,values={})=>(COPY[key]??key).replace(/\{(\w+)\}/g,(_,k)=>String(values[k]??'')).replace(/\b1 rounds\b/g,'1 round');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=(k,v)=>esc(tr(k,v));
const app=document.getElementById('app'),dialog=document.getElementById('dialog');
const colors=['tYel','tRed','tBlu','tPur','tGrn','tOrg','tPnk','tGry'];
const names=['Artur','Mila','Tom','Ola','Kate','Noah','Alex','Lena','Sam','Nina','Leo','Zoe','Ben','Iris','Max','Eva','Adam','Ruby','Luca','Maya'];
let people=names.map((name,id)=>({id,name,face:id+1,tile:colors[id%colors.length],active:id<8,seen:id<8,total:0,history:[],allHistory:[]}));
let S={screen:'home',mode:'create',name:'',face:1,facePage:0,me:0,host:0,code:'K7QMX',draftCode:'',round:1,target:7,games:0,results:[],locked:false,started:0,live:false,countdown:3,left:false,pace:'manual',resultPaused:false,autoRemaining:8,faceDraft:1,scored:false,rounds:5,gameRounds:5,targets:[],listScroll:0,previewPlayers:8,setupDraft:null};
let jobs=[],ticker=null,epoch=0,toastTimer=null,invoker=null;
const active=()=>people.filter(p=>p.active),seen=()=>people.filter(p=>p.seen),self=()=>people[S.me];
const ico=(id,cls='')=>`<svg class="${cls}" aria-hidden="true" viewBox="0 0 ${['sw','door'].includes(id)?'100 100':'24 24'}"><use href="#${id}"/></svg>`;
function avatar(p){return `<span class="avatar" style="--tile:var(--${p.tile})"><svg viewBox="90 90 900 900" aria-hidden="true"><use href="#face${p.face}"/></svg></span>`}
function button(key,action,style='primary',attrs='',values={}){return `<button type="button" class="button ${style}" data-action="${action}" ${attrs}>${t(key,values)}</button>`}
function navIcon(action){const paths={back:'<path d="M14.5 5.5 8 12l6.5 6.5"/>',menu:'<path d="M5 7h14M5 12h14M5 17h14"/>',help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9a2.5 2.5 0 0 1 4.9.6c0 1.7-2.5 1.8-2.5 3.5M12 16.2v.1"/>',invite:'<path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4M9 9h1v1H9zM14 9h1v1h-1zM9 14h1v1H9zM14 14h2v2h-2z"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[action]||paths.menu}</svg>`}
function header(middle='',left='back',right='help'){return `<header class="header"><div>${left?`<button data-action="${left}" aria-label="${t(left==='menu'?'options':left)}" title="${t(left==='menu'?'options':left)}">${navIcon(left)}</button>`:''}</div><div class="middle">${middle}</div><div class="right">${right?`<button data-action="${right}" aria-label="${t(right)}" title="${t(right)}">${navIcon(right)}</button>`:''}</div></header>`}
function footer(primary='',secondary='',meta=''){return `<footer class="actions"><div class="action-meta" id="footer-meta" role="status">${meta}</div><div class="action-row ${secondary?'two':''}">${secondary}${primary||'<div class="action-placeholder primary-slot hidden" aria-hidden="true">—</div>'}</div></footer>`}
function status(key,v={}){return `<div class="action-placeholder primary-slot" role="status">${t(key,v)}</div>`}
function shell(head,body,foot,cls=''){return `<div class="shell ${cls}" data-size="${seen().length}" style="--seen-count:${seen().length}">${head}<section class="body">${body}</section>${foot}</div>`}
function stopTimers(){epoch++;jobs.forEach(clearTimeout);jobs=[];clearInterval(ticker);ticker=null}
function schedule(fn,ms){const id=epoch;jobs.push(setTimeout(()=>{if(id===epoch)fn()},Math.max(0,ms)))}
function screen(name,{keepTimers=false}={}){if(!keepTimers)stopTimers();if(dialog.open)dialog.close();if((name==='final'||name==='summary')&&name!==S.screen)S.resetList=true;S.screen=name;render();}
function rank(list,metric,p){return 1+list.filter(x=>metric(x)<metric(p)-1e-8).length}
function roundWinners(){const valid=S.results.filter(x=>x.error!==null);if(!valid.length)return [];const min=Math.min(...valid.map(x=>Math.abs(x.error)));return valid.filter(x=>Math.abs(Math.abs(x.error)-min)<1e-8).map(x=>people[x.id])}
function winners(list,metric,descending=false){if(!list.length)return [];const scores=list.map(metric),best=descending?Math.max(...scores):Math.min(...scores);return list.filter(p=>Math.abs(metric(p)-best)<1e-8)}
function winnersText(list,round=false){return list.length===0?t('noWinner'):list.length===1?t(round?'winnerRound':'wins',{name:list[0].name}):t(round?'tieRound':'tieWins',{n:list.length})}
function role(p){return p.id===S.me?(p.id===S.host?t('youHost'):t('you')):p.id===S.host?t('host'):p.active?'':t('left')}
function roster(mode){const finalMode=mode==='final'||mode==='summary';const list=finalMode?[...seen()].sort((a,b)=>mode==='summary'?b.total-a.total||a.id-b.id:Number(b.active)-Number(a.active)||gameMetric(a)-gameMetric(b)||a.id-b.id):seen();const heading={lobby:['status','points'],waiting:['status','place'],roundResult:['timing','place'],overall:['average','place'],final:['average','points'],summary:['total','place']}[mode];return `<div class="roster" data-size="${list.length}"><div class="table-head"><span class="people-label">${t('allPlayers',{n:list.length})}</span><span class="value">${t(heading[0])}</span><span class="position">${t(heading[1])}</span></div><div class="roster-scroll" id="roster-scroll" tabindex="0" role="region" aria-label="${t('players')}">${list.map(p=>{const f=playerFields(p,mode);const position=mode==='final'?(p.active?place(p):null):mode==='summary'?1+seen().filter(x=>x.total>p.total).length:null;return `<div class="player ${p.id===S.me?'self':''} ${p.active?'':'absent'} ${finalMode&&position===1?'top-ranked':''}" data-player-slot="${p.id}">${avatar(p)}<div class="identity"><div class="name"><span>${esc(p.name)}</span></div><span class="role">${finalMode&&position!==null?'#'+position+(role(p)?' · ':''):''}${role(p)}${['overall','final'].includes(mode)&&misses(p)?' · '+completed(p)+'/'+p.history.length+' taps':''}</span></div><div class="value ${f.quiet?'quiet':''}" ${f.aria?`aria-label="${esc(f.aria)}"`:''}>${f.value}</div><div class="position">${f.position}</div></div>`}).join('')}</div></div>`}
function intro(){return shell(header(t('title'),'','help'),`<div class="center-body">${ico('sw','watch')}<div class="landing-text"><h1>${t('title')}</h1><p>${tr('tagline')}</p><p class="muted">${t('closest')}</p></div></div>`,footer(button('create','create'),button('joinShort','join','secondary'),t('meta')))}
function form(){const join=S.mode==='join',prefill=S.screen==='qrjoin';const chosen={face:S.face,tile:colors[S.me]};return shell(header(t('title'),'back','help'),`<form id="identity-form" class="form-body" novalidate><h2>${t(join?'joinTitle':'createTitle')}</h2>${join?(prefill?`<div class="notice">${t('qrReady',{code:S.code})}</div><input type="hidden" name="code" value="${S.code}">`:`<div class="field"><label for="code">${t('code')}</label><input name="code" id="code" class="code-input" value="${esc(S.draftCode)}" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="code-help"><p class="help" id="code-help">${t('codeHelp')}</p></div>`):''}<div class="field"><label for="name">${t('name')}</label><input name="name" id="name" maxlength="12" autocomplete="nickname" value="${esc(S.name)}" placeholder="${t('namePlaceholder')}" aria-describedby="form-error"></div><div class="face-choice"><span class="face-label">${t('face')}</span><div class="face-preview">${avatar(chosen)}${button('changeFace','faces','quiet')}</div></div><p class="error" id="form-error" role="alert"></p></form>`,footer(`<button type="submit" class="button primary" form="identity-form">${t(join?'joinAction':'create')}</button>`))}
function lobby(){const host=S.me===S.host;return shell(header(t('title'),'menu','help'),`<div class="focal"><p class="meta">${t('code')}</p><p class="room-code">${esc(S.code)}</p><p class="message">${t('joined',{n:active().length})}${S.games?' · '+t(S.games===1?'oneGame':'games',{n:S.games}):''}</p><div class="room-tools"><button class="small-action" data-action="invite">${navIcon('invite')}${t('inviteFriends')}</button>${host?`<button class="small-action" data-action="setup">${t('setupButton',{n:S.rounds,pace:tr(S.pace==='manual'?'hostPace':'autoPace')})}</button>`:''}</div></div>${roster('lobby')}`,footer(host?button(active().length>=2?'start':'needPlayer','start','primary',active().length<2?'disabled':''):status('waitFor',{name:people[S.host].name}),'',host?t('gameInfo',{n:S.rounds,pace:tr(S.pace==='manual'?'hostPaceShort':'autoPaceShort')}):t('waitToStart')))}
function timing(){const counting=S.screen==='countdown';return shell(header(roundLabel(),'menu',''),`<div class="timing"><div class="timing-content"><p class="meta">${t('target')}</p><p class="target">${S.target.toFixed(2)} <small>s</small></p><div class="count-holder ${counting?'':'silent'}" ${counting?'':'aria-hidden="true"'}><svg viewBox="0 0 200 200" aria-hidden="true"><use href="#ring"/></svg><span class="count-digit" id="count">${S.countdown}</span></div><p class="meta ${counting?'':'silent'}">${t('countStarts')}</p></div></div>`,footer(counting?button('getReady','none','primary','disabled'):button('tap','tap','primary tap','id="tap"'),'',counting?'':t('countSilently')))}
function waiting(){const own=S.results.find(x=>x.id===S.me),remaining=active().length-S.results.length;return shell(header(roundLabel(),'menu',''),`<div class="focal">${ico('t','locked-mark')}<h2>${t(own?.error===null?'noTap':'tapSaved')}</h2><p class="message">${t(remaining===1?'waitingLast':'waiting',{n:remaining})}</p></div>${roster('waiting')}`,footer(status('recorded'),'',t('hiddenResult')))}
function summary(){return shell(header(t('evening'),'',''),`<div class="focal"><p class="meta">${t(S.games===1?'oneGame':'games',{n:S.games})}</p><h2>${S.games?winnersText(winners(seen(),p=>p.total,true)):t('emptySummary')}</h2><p class="message">${S.games?insight():t('thanks')}</p></div>${roster('summary')}`,footer(button('share','share'),button('newShort','new','secondary')), 'summary')}
function returning(){return shell(header(t('title'),'back','help'),`<div class="center-body">${ico('sw','watch')}<h2>${t('returnTitle')}</h2><div class="recall"><p class="meta">${t('code')}</p><p class="room-code">${esc(S.code)}</p></div><p class="meta">${t('lobbyReturn')}</p></div>`,footer(button('rejoin','rejoin'),button('newShort','new','secondary')))}
function edge(){const map={gone:['roomGone','roomGoneBody','editCode','join'],full:['fullTitle','fullBody','retry','join'],playing:['playTitle','playBody','retry','join'],paused:['reconnectTitle','reconnectBody','resume','resume']};const c=map[S.screen]||map.gone;return shell(header(t('title'),'back','help'),`<div class="center-body">${ico('door','watch')}<h2>${t(c[0])}</h2><p class="muted">${t(c[1])}</p>${S.screen==='paused'?`<p class="meta">Host: ${esc(people[S.host].name)} · Your seat and scores are kept.</p>`:''}</div>`,footer(button(c[2],c[3]),button(S.screen==='paused'?'backRoom':'home',S.screen==='paused'?'lobby':'home','secondary')))}
function render(){const oldScroll=app.querySelector('#roster-scroll');if(oldScroll)S.listScroll=oldScroll.scrollTop;app.innerHTML=S.screen==='home'?intro():['form','qrjoin'].includes(S.screen)?form():S.screen==='lobby'?lobby():['countdown','round'].includes(S.screen)?timing():S.screen==='waiting'?waiting():S.screen==='roundResult'?roundResult():S.screen==='final'?final():S.screen==='summary'?summary():S.screen==='return'?returning():edge();const scroll=app.querySelector('#roster-scroll');if(scroll){if(S.resetList){S.listScroll=0;S.resetList=false}scroll.scrollTop=S.listScroll;scroll.addEventListener('scroll',()=>S.listScroll=scroll.scrollTop,{passive:true})}}
function remember(){const n=document.getElementById('name'),c=document.getElementById('code');if(n)S.name=n.value;if(c)S.draftCode=c.value;}
function resetRoom(){people=names.map((name,id)=>({id,name,face:id+1,tile:colors[id%colors.length],active:id<8,seen:id<8,total:0,history:[],allHistory:[]}));S.games=0;S.practiceDone=false;S.practice=false;S.round=1;S.host=0;S.listScroll=0;S.resetList=true;S.scored=false;S.left=false;S.results=[];S.live=false;S.code='K7QMX';}
function makeTargets(count,rng=Math.random){const pool=[];for(let whole=3;whole<=11;whole++)for(let part=11;part<=89;part++){if(part%5!==0)pool.push(whole*100+part)}const result=[];for(let i=0;i<count;i++){const choices=pool.filter(x=>!result.length||Math.abs(x-result[result.length-1])>=80);const candidate=choices[Math.min(choices.length-1,Math.floor(rng()*choices.length))];result.push(candidate);pool.splice(pool.indexOf(candidate),1)}return result.map(x=>x/100)}
function startCountdown(){stopTimers();S.results=[];S.locked=false;S.countdown=3;S.screen='countdown';render();const id=epoch;ticker=setInterval(()=>{if(id!==epoch)return;S.countdown--;if(S.countdown===0)startRound();else{const el=document.getElementById('count');if(el)el.textContent=S.countdown}},1000)}
function record(id,error){if(!['round','waiting'].includes(S.screen)||S.results.some(r=>r.id===id))return;const judged=error===null?null:Math.round(error*100)/100;S.results.push({id,error:judged});if(id===S.me){S.locked=true;S.screen='waiting';render()}else if(S.screen==='waiting')updateWaiting();if(S.results.length===active().length)completeRound()}
function updateWaiting(){const remaining=active().length-S.results.length;const message=app.querySelector('.focal .message');if(message)message.textContent=tr(remaining===1?'waitingLast':'waiting',{n:remaining});for(const p of active()){const cell=app.querySelector(`[data-player-slot="${p.id}"] .value`);if(!cell)continue;const done=S.results.some(r=>r.id===p.id);cell.innerHTML=done?ico('t'):t('counting');cell.setAttribute('aria-label',tr(done?'locked':'counting'));cell.classList.toggle('quiet',!done)}}
function tap(){if(S.screen!=='round'||S.locked)return;record(S.me,(performance.now()-S.started)/1000-S.target)}
function startResultTimer(){stopTimers();const id=epoch;ticker=setInterval(()=>{if(id!==epoch||S.screen!=='roundResult')return;S.autoRemaining--;const label=document.getElementById('footer-meta');if(label)label.textContent=tr(S.round===S.gameRounds?'autoFinal':'autoNext',{n:S.autoRemaining});if(S.autoRemaining<=0)advanceRound(true)},1000)}
function facePicker(){S.faceDraft=S.face;drawFaces()}
function drawFaces(){openDialog(t('allFaces'),`<div class="face-gallery">${Array.from({length:25},(_,i)=>`<button type="button" data-action="pickFace" data-id="${i+1}" style="--tile:var(--${colors[S.me]})" aria-pressed="${S.faceDraft===i+1}" aria-label="${t('faceLabel',{n:i+1})}"><svg viewBox="90 90 900 900" aria-hidden="true"><use href="#face${i+1}"/></svg></button>`).join('')}</div>`,button('faceDone','saveFace'));dialog.classList.add('avatar-dialog')}
function pacePicker(){openDialog(t('roundPace'),`<div class="mode-options" role="radiogroup" aria-label="${t('roundPace')}">${['manual','auto'].map(mode=>`<button class="mode-option" role="radio" aria-checked="${S.pace===mode}" data-action="setPace" data-mode="${mode}"><strong>${t(mode==='manual'?'hostPace':'autoPace')}</strong><small>${t(mode==='manual'?'hostPaceDesc':'autoPaceDesc')}</small>${ico('t')}</button>`).join('')}</div>`,button('gotIt','dismiss'))}
function toast(key){clearTimeout(toastTimer);const el=document.getElementById('toast');el.textContent=tr(key);el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,2500)}
function openDialog(title,body,actions){if(!dialog.open)invoker=document.activeElement;dialog.classList.remove('avatar-dialog','standings-dialog');dialog.innerHTML=`<div class="dialog-head"><h2>${title}</h2><button type="button" class="close-button" data-action="dismiss" aria-label="${t('close')}">${ico('x')}</button></div><div class="dialog-body">${body}</div><div class="dialog-actions">${actions}</div>`;if(!dialog.open)dialog.showModal()}
function dismiss(){dialog.close();if(invoker?.isConnected)invoker.focus({preventScroll:true})}
function invite(){openDialog(t('invite'),`<img class="qr" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAEiAQAAAAB1xeIbAAABe0lEQVR4nO2aQW6DMBBF3xSkLOEGPQrcoEeqejM4Sg4QCS8jgX4XtpuGLtqNIQ3jhWWsJ/lrNIyHL0z8PsaXP0DglFNOOeXUo1OWRg2wmPUh7/S76joE1UmSJrCeShqoJEm6p7bXdQgqpBzXwBJX+TXYV9ehqPEW8Y1OPCy1DrQVP9GpPHLsGwEBRGhRXO2p60DUaGZmbbprrWeJbc7eup6ainl/y3GNbYXus/5x1T8DZX2o40Q3gfWA9Sye9yUpYh8/NGmKe0Mzo4FKsfEfHlX9/6byXRsMurOh8e1SQ0j72kvXEagY41RbmrmmO9cYzaW2Tot57ItTGgAIJ0EzoyHU6MNO7imUpFK9/xrZ2alS+fd6X47iu2WWbTS6uJcMNY99GYp1tutb3s943m9AZR8zf9yCvZ+93hel1l6aCIbG16tpbPE+Z0vKeiD2991UKT3ur+sZqR8+5tiS+nuaq3sKJal1n0M3pXZfmtxTKEqZ/xvllFNOOXUI6hNa29WIRKysyQAAAABJRU5ErkJggg==" alt="${t('qrLabel',{code:S.code})}"><p class="room-code center" tabindex="0">${esc(S.code)}</p><p class="meta center">${t('inviteBody')}</p>`,button('copy','copy')+button('close','dismiss','secondary'))}
function manage(){openDialog(t('manage'),`<div>${active().filter(p=>p.id!==S.me).map(p=>`<button class="player roster-button" data-action="remove" data-id="${p.id}" aria-label="${t('removeLabel',{name:p.name})}">${avatar(p)}<span class="identity"><span class="name">${esc(p.name)}</span></span><span class="value">${t('removeShort')}</span><span class="position">${ico('x')}</span></button>`).join('')}</div>`,button('close','dismiss','secondary'))}
async function copy(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}const box=document.createElement('textarea');box.value=text;(dialog.open?dialog:document.body).append(box);box.select();const ok=document.execCommand('copy');box.remove();return ok}catch{return false}}
async function share(){const sorted=[...seen()].sort((a,b)=>b.total-a.total||a.id-b.id);const text=[tr('shareHeader',{n:S.games}),...sorted.map(p=>tr('shareLine',{rank:1+sorted.filter(x=>x.total>p.total).length,name:p.name,points:p.total}))].join('\n');try{if(navigator.share){await navigator.share({title:tr('shareTitle'),text});return}}catch(err){if(err.name==='AbortError')return}if(await copy(text))toast('sharedCopy');else openDialog(t('share'),`<p>${t('shareFallback')}</p><textarea readonly aria-label="${t('share')}">${esc(text)}</textarea>`,button('close','dismiss','secondary'))}

function gameSetup(){if(S.me!==S.host||S.screen!=='lobby')return;S.setupDraft={rounds:S.rounds,pace:S.pace,players:active().length};drawSetup()}
function drawSetup(){const d=S.setupDraft;openDialog(t('setup'),`<div class="setup-fields"><div><label class="setup-label" for="rounds-count">${t('roundsLabel')}</label><div class="stepper"><button type="button" data-action="roundStep" data-step="-1" aria-label="${t('fewerRounds')}">−</button><input type="number" inputmode="numeric" id="rounds-count" value="${d.rounds}" min="1" max="20" step="1"><button type="button" data-action="roundStep" data-step="1" aria-label="${t('moreRounds')}">+</button></div><div class="presets">${[1,3,5,10,20].map(n=>`<button type="button" data-action="roundPreset" data-rounds="${n}" aria-pressed="${d.rounds===n}">${n}</button>`).join('')}</div><p class="setup-help">${t('roundsHint')}</p></div><div><p class="setup-label">${t('roundPace')}</p><div class="pace-switch">${['manual','auto'].map(mode=>`<button type="button" data-action="draftPace" data-mode="${mode}" aria-pressed="${d.pace===mode}">${t(mode==='manual'?'hostPace':'autoPace')}</button>`).join('')}</div><p class="setup-help" id="pace-description">${t(d.pace==='manual'?'hostPaceDesc':'autoPaceDesc')}</p></div><div class="preview-control"><label class="setup-label" for="preview-people">${t('demoPeople')}</label><select id="preview-people">${Array.from({length:19},(_,i)=>i+2).map(n=>`<option value="${n}" ${n===d.players?'selected':''}>${n}</option>`).join('')}</select><p class="setup-help">${t('demoPeopleHint')}</p></div><p class="error" id="setup-error" role="alert"></p></div>`,button('saveSetup','saveSetup')+button('cancel','dismiss','secondary'))}
function readSetup(){if(!S.setupDraft)return;const rounds=document.getElementById('rounds-count'),players=document.getElementById('preview-people');if(rounds)S.setupDraft.rounds=Number(rounds.value);if(players)S.setupDraft.players=Number(players.value)}
function updateRoundChoice(n){S.setupDraft.rounds=Math.max(1,Math.min(20,n));const field=document.getElementById('rounds-count');if(field)field.value=S.setupDraft.rounds;dialog.querySelectorAll('[data-action="roundPreset"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.rounds)===S.setupDraft.rounds)))}
function saveSetup(){if(S.screen!=='lobby'||S.me!==S.host)return;readSetup();const d=S.setupDraft;if(!Number.isInteger(d.rounds)||d.rounds<1||d.rounds>20||!Number.isInteger(d.players)||d.players<2||d.players>20){document.getElementById('setup-error').textContent=tr('setupValidation');return}S.rounds=d.rounds;S.pace=d.pace;S.previewPlayers=d.players;people.forEach((p,i)=>{p.active=i<d.players;p.seen=p.active||p.total>0});S.setupDraft=null;dismiss();render()}

async function action(a,el){remember();switch(a){case 'roundDetails':showRoundDetails();break;case 'overallResults':showOverall();break;case 'yourStats':showStats();break;case 'previewOptions':previewOptions();break;case 'practice':startPractice();break;case 'realStart':S.practiceDone=true;startGame();break;case 'resultsView':S.resultsView=el.dataset.view==='overall'?'overall':'roundResult';render();break;case 'demoDisconnect':pauseGame(true);break;case 'demoNext':dismiss();advanceRound(true);break;case 'demoHost':S.host=active().find(p=>p.id!==S.host).id;dismiss();render();break;case 'setup':gameSetup();break;case 'roundStep':readSetup();updateRoundChoice((Number.isFinite(S.setupDraft.rounds)?S.setupDraft.rounds:5)+Number(el.dataset.step));break;case 'roundPreset':readSetup();updateRoundChoice(Number(el.dataset.rounds));break;case 'draftPace':readSetup();S.setupDraft.pace=el.dataset.mode==='auto'?'auto':'manual';dialog.querySelectorAll('[data-action="draftPace"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===S.setupDraft.pace)));document.getElementById('pace-description').textContent=tr(S.setupDraft.pace==='manual'?'hostPaceDesc':'autoPaceDesc');break;case 'saveSetup':saveSetup();break;case 'home':screen('home');break;case 'back':screen(['form','qrjoin','return','gone','full','playing'].includes(S.screen)?'home':'lobby');break;case 'create':S.mode='create';S.me=0;screen('form');break;case 'join':S.mode='join';S.me=1;screen('form');break;case 'face':S.face=Number(el.dataset.id);render();document.querySelector(`[data-action="face"][data-id="${S.face}"]`)?.focus({preventScroll:true});break;case 'faces':facePicker();break;case 'pickFace':S.faceDraft=Number(el.dataset.id);dialog.querySelectorAll('[data-action="pickFace"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.id)===S.faceDraft)));break;case 'saveFace':S.face=S.faceDraft;dismiss();render();app.querySelector('[data-action="faces"]')?.focus({preventScroll:true});break;case 'pace':pacePicker();break;case 'setPace':if(S.me!==S.host)break;S.pace=el.dataset.mode==='auto'?'auto':'manual';dialog.querySelectorAll('[data-action="setPace"]').forEach(b=>b.setAttribute('aria-checked',String(b.dataset.mode===S.pace)));const paceControl=app.querySelector('[data-action="pace"]');if(paceControl)paceControl.textContent=tr('paceButton',{mode:tr(S.pace==='manual'?'hostPace':'autoPace')});const footerMeta=document.getElementById('footer-meta');if(footerMeta)footerMeta.textContent=tr(S.pace==='manual'?'hostPaceShort':'autoPaceShort');break;case 'nextRound':advanceRound();break;case 'toggleAuto':if(S.screen!=='roundResult'||S.me!==S.host)break;S.resultPaused=!S.resultPaused;if(S.resultPaused)stopTimers();else startResultTimer();render();break;case 'start':offerStart();break;case 'tap':tap();break;case 'lobby':S.live=false;screen('lobby');break;case 'help':help();break;case 'invite':invite();break;case 'menu':menu();break;case 'dismiss':dismiss();break;case 'copy':toast(await copy(S.code)?'copied':'copyFail');break;case 'share':await share();break;case 'new':resetRoom();S.mode='create';S.me=0;screen('form');break;case 'rejoin':S.left=false;screen('lobby');break;case 'resume':resumeGame();break;case 'endEvening':openDialog(t('endTitle'),`<p>${t('endBody')}</p>`,button('endConfirm','confirmEnd')+button('cancel','dismiss','secondary'));break;case 'confirmEnd':S.live=false;screen('summary');break;case 'stop':openDialog(t('stopTitle'),`<p>${t('stopBody')}</p>`,button('stop','confirmStop')+button('cancel','dismiss','secondary'));break;case 'confirmStop':S.live=false;screen('lobby');break;case 'leave':openDialog(t('leaveTitle'),`<p>${t('leaveBody')}</p>`,button('leave','confirmLeave')+button('leaveOrStay','dismiss','secondary'));break;case 'confirmLeave':S.left=true;S.live=false;screen('return');break;case 'manage':manage();break;case 'remove':{const p=people[Number(el.dataset.id)];openDialog(t('removeTitle',{name:p.name}),`<p>${t('removeBody')}</p>`,button('remove','confirmRemove','primary',`data-id="${p.id}"`)+button('cancel','dismiss','secondary'));break}case 'confirmRemove':people[Number(el.dataset.id)].active=false;screen('lobby');break;}}
S.practice=false;S.practiceDone=false;S.resultsView='roundResult';
function roundLabel(){return S.practice?t('practiceRound'):t('round',{n:S.round,total:S.gameRounds})}
function completed(p){return p.history.filter(r=>r.error!==null).length}
function misses(p){return p.history.length-completed(p)}
function mean(p){const h=p.history.filter(r=>r.error!==null);return h.length?Math.round(h.reduce((s,r)=>s+Math.abs(r.error),0)/h.length*100)/100:0}
function gameMetric(p){return misses(p)*1000+mean(p)}
function place(p){return rank(active(),gameMetric,p)}
function roundMetric(p){const r=S.results.find(x=>x.id===p.id);return r&&r.error!==null?Math.abs(r.error):Infinity}
function errorText(error){return error===null?t('missed'):error===0?'0.00 s':(error<0?'−':'+')+Math.abs(error).toFixed(2)+' s'}
function playerFields(p,mode){if(!p.active&&mode!=='summary')return {value:t('left'),position:'—',quiet:true};if(mode==='lobby')return {value:t('ready'),position:S.games?p.total:'—',quiet:true};if(mode==='waiting'){const done=S.results.some(r=>r.id===p.id);return {value:done?ico('t'):t('counting'),position:'—',aria:tr(done?'locked':'counting'),quiet:!done}}if(mode==='roundResult'){const r=S.results.find(x=>x.id===p.id);return {value:r?errorText(r.error):'—',position:r?'#'+rank(active(),roundMetric,p):'—'}}if(mode==='overall'||mode==='final')return {value:completed(p)?mean(p).toFixed(2)+' s':'—',position:mode==='overall'?'#'+place(p):'+'+(completed(p)?active().length-place(p)+1:0)};if(mode==='summary')return {value:t('pointsUnit',{n:p.total}),position:'#'+(1+seen().filter(x=>x.total>p.total).length)};return {value:'—',position:'—'}}
function offerStart(){if(S.me!==S.host)return;if(S.games===0&&!S.practiceDone)openDialog(t('practiceTitle'),`<p>${t('practiceBody')}</p>`,button('practiceAction','practice')+button('skipPractice','realStart','secondary'));else startGame()}
function startPractice(){if(S.me!==S.host)return;S.practice=true;S.practiceDone=true;S.target=6.37;S.round=1;S.results=[];S.live=true;dismiss();startCountdown()}
function startGame(hostInitiated=false){if(active().length<2||active().length>20||(!hostInitiated&&S.me!==S.host))return;S.practice=false;S.practiceDone=true;S.resultsView='roundResult';people.forEach(p=>p.history=[]);S.gameRounds=S.rounds;S.targets=makeTargets(S.gameRounds);S.round=1;S.target=S.targets[0];S.results=[];S.scored=false;S.live=true;S.listScroll=0;if(dialog.open)dismiss();startCountdown()}
function insight(){const h=self().allHistory.filter(r=>r.error!==null);if(!h.length)return t('noRounds');const early=h.filter(r=>r.error<0).length,late=h.filter(r=>r.error>0).length;if(early>h.length/2)return t('earlyInsight',{n:early,total:h.length});if(late>h.length/2)return t('lateInsight',{n:late,total:h.length});return t('neutralInsight',{n:(h.reduce((s,r)=>s+Math.abs(r.error),0)/h.length).toFixed(2)})}
function completeRound(){if(S.screen==='roundResult')return;stopTimers();if(!S.practice)for(const p of active()){const r=S.results.find(x=>x.id===p.id)||{error:null};p.history.push({error:r.error,target:S.target})}S.screen='roundResult';S.resultsView='roundResult';S.resultPaused=false;S.autoRemaining=8;render();if(S.pace==='auto'&&!S.practice)startResultTimer()}
function advanceRound(hostInitiated=false){if(S.screen!=='roundResult'||(!hostInitiated&&S.me!==S.host))return;stopTimers();if(S.practice){startGame(hostInitiated);return}if(S.round===S.gameRounds){finishGame();return}S.round++;S.target=S.targets[S.round-1];startCountdown()}
function finishGame(){if(S.scored)return;S.scored=true;for(const p of active()){if(completed(p))p.total+=active().length-place(p)+1;p.allHistory.push(...p.history)}S.games++;S.live=false;screen('final')}
function pauseGame(migrate=false){if(!S.live)return;S.elapsed=Math.max(0,performance.now()-S.started);S.pausedFrom=S.screen;stopTimers();S.live=false;if(migrate&&S.host===S.me){const next=active().find(p=>p.id!==S.me);if(next)S.host=next.id}screen('paused')}
function resumeGame(){S.live=true;if(S.pausedFrom==='roundResult'){S.screen='roundResult';S.resultPaused=true;render()}else if(S.pausedFrom==='countdown')startCountdown();else startRound(true)}
function startRound(resuming=false){stopTimers();S.started=performance.now()-(resuming?S.elapsed:0);if(!resuming){S.results=[];S.locked=false}S.screen=S.locked?'waiting':'round';render();for(const p of active()){if(p.id===S.me||S.results.some(r=>r.id===p.id))continue;const error=Math.sin(S.round*7.1+p.id*3.7)*.82+(p.id%3)*.13;schedule(()=>record(p.id,error),Math.max(.15,S.target+error)*1000-(resuming?S.elapsed:0))}schedule(()=>{for(const p of active())if(!S.results.some(r=>r.id===p.id))S.results.push({id:p.id,error:null});S.locked=true;completeRound()},(S.target+8)*1000-(resuming?S.elapsed:0))}

function roundResult(){const error=S.results.find(x=>x.id===S.me)?.error??null,host=S.me===S.host,auto=S.pace==='auto'&&!S.practice;const meta=S.practice?t('noPracticePoints'):auto?(S.resultPaused?t('autoPaused'):t(S.round===S.gameRounds?'autoFinal':'autoNext',{n:S.autoRemaining})):t('roundPlace',{n:rank(active(),roundMetric,self()),total:active().length});const nextLabel=S.practice?t('start'):S.round===S.gameRounds?t('seeFinal'):t('nextNumber',{n:S.round+1,total:S.gameRounds});return shell(header(roundLabel(),'menu',''),`<div class="focal"><p class="meta">${t('yourTiming')}</p>${error===null?`<h2>${t('missed')}</h2>`:`<p class="number">${Math.abs(error).toFixed(2)} <small>s${error===0?'':' '+t(error<0?'early':'late')}</small></p>`}<p class="message">${winnersText(roundWinners(),true)}</p></div>${roster('roundResult')}`,footer(host?`<button class="button primary" data-action="nextRound">${nextLabel}</button>`:status('waitingNext',{name:people[S.host].name}),host&&auto?button(S.resultPaused?'resumeAuto':'pause','toggleAuto','secondary'):'',meta),'result-shell')}
function final(){const host=S.me===S.host,valid=active().filter(p=>completed(p)>0);return shell(header(t('final'),'menu',''),`<div class="focal"><h2>${valid.length?winnersText(winners(active(),gameMetric)):t('noCompletedTaps')}</h2><p class="message">${completed(self())?t('yourAverage',{n:mean(self()).toFixed(2)}):t('noMeasuredAverage')}</p></div>${roster('final')}`,footer(host?button('again','start'):status('onlyHost',{name:people[S.host].name}),button('backRoom','lobby','secondary'),completed(self())?t('yourPlace',{n:place(self())}):t('noGamePoints')))}
function detailsList(items){return `<dl class="detail-list">${items.map(([label,value])=>`<dt>${t(label)}</dt><dd>${value}</dd>`).join('')}</dl>`}
function pauseForReading(){if(S.screen==='roundResult'&&S.pace==='auto'&&!S.practice&&S.me===S.host){S.resultPaused=true;stopTimers();render()}}
function showRoundDetails(){pauseForReading();const error=S.results.find(x=>x.id===S.me)?.error??null;openDialog(t('roundDetails'),detailsList([['targetValue',S.target.toFixed(2)+' s'],['tapValue',error===null?'—':Math.max(0,S.target+error).toFixed(2)+' s'],['errorValue',errorText(error)],['place','#'+rank(active(),roundMetric,self())+' / '+active().length]]),button('close','dismiss'))}
function showOverall(){pauseForReading();openDialog(t('overallResults'),roster('overall'),button('close','dismiss'));dialog.classList.add('standings-dialog')}
function showStats(){const h=self().history.filter(r=>r.error!==null),best=h.length?Math.min(...h.map(r=>Math.abs(r.error))):null;openDialog(t('yourStats'),detailsList([['completedValue',completed(self())+' / '+S.gameRounds],['averageValue',h.length?mean(self()).toFixed(2)+' s':'—'],['bestValue',best===null?'—':best.toFixed(2)+' s'],['place','#'+place(self())]]),button('close','dismiss'))}
function menu(){pauseForReading();const mid=['countdown','round','waiting','roundResult'].includes(S.screen),host=S.me===S.host;openDialog(t('options'),'',(S.screen==='roundResult'?button('roundDetails','roundDetails','secondary')+(!S.practice?button('overallResults','overallResults','secondary'):''):'')+(S.screen==='final'?button('yourStats','yourStats','secondary'):'')+button('help','help','secondary')+(mid&&host?button('stop','stop','secondary'):'')+(!mid&&host?button('manage','manage','secondary'):'')+(!mid&&host?button('endEvening','endEvening','secondary'):'')+(mid?button('previewOptions','previewOptions','quiet'):'')+button('leave','leave','secondary')+button('cancel','dismiss','quiet'))}
function previewOptions(){openDialog(t('previewOptions'),`<p class="meta">${t('previewExplanation')}</p>`,button('demoDisconnectLabel','demoDisconnect','secondary')+button('demoHostLabel','demoHost','secondary')+(S.screen==='roundResult'&&S.me!==S.host?button('demoNextLabel','demoNext','secondary'):'')+button('close','dismiss','quiet'))}
function help(){openDialog(t('help'),`<ol><li>${t('rules1')}</li><li>${t('rules2')}</li><li>${t('rules3')}</li><li>${t('rules4')}</li></ol><p class="meta">${t('rulesNote')}</p><p class="meta">${t('hiddenResult')}</p><p class="meta">${t('scoringNote')}</p>`,button('gotIt','dismiss'))}

app.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el&&!el.disabled)action(el.dataset.action,el)});dialog.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(el)action(el.dataset.action,el)});
app.addEventListener('input',event=>{if(event.target.id==='code')event.target.value=event.target.value.toUpperCase().replace(/\s/g,'')});
app.addEventListener('submit',event=>{event.preventDefault();remember();const data=new FormData(event.target),name=String(data.get('name')||'').trim(),code=String(data.get('code')||'').trim().toUpperCase();let error='';if(!name||name.length>12)error='nameError';else if(S.mode==='join'&&code.length!==5)error='codeError';else if(S.mode==='join'&&!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/.test(code))error='badAlphabet';if(error){document.getElementById('form-error').textContent=tr(error);document.getElementById(error==='nameError'?'name':'code')?.focus();return}if(S.mode==='join'&&code!=='K7QMX'){screen('gone');return}let finalName=name,n=2;while(active().some(p=>p.id!==S.me&&p.name.toLowerCase()===finalName.toLowerCase())){const suffix=' '+n++;finalName=name.slice(0,12-suffix.length)+suffix}S.name=name;self().name=finalName;const previousFace=self().face;const sameFace=active().find(p=>p.id!==S.me&&p.face===S.face);if(sameFace)sameFace.face=previousFace;self().face=S.face;S.live=false;S.left=false;screen('lobby');if(S.me!==S.host)schedule(()=>startGame(true),4000);});
// Pointer presses measure the intention at contact, not after finger release.
app.addEventListener('pointerdown',event=>{if(event.button!==0)return;const el=event.target.closest('[data-action="tap"]');if(el&&!el.disabled){event.preventDefault();tap()}});
app.addEventListener('keydown',event=>{if(event.repeat)return;if(event.target?.dataset?.action==='tap'&&[' ','Enter'].includes(event.key)){event.preventDefault();tap()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.live)pauseGame(false)});window.addEventListener('pagehide',stopTimers);
const initial=new URLSearchParams(location.hash.slice(1));if(initial.get('join')){S.mode='join';S.me=1;S.draftCode='K7QMX';S.screen='qrjoin'}render();
