from pathlib import Path
p=Path(__file__).parent
s=(p/'mockup-v6.html').read_text().replace('Blindstop — v6','Blindstop — v7')
js=(p/'check-v6.js').read_text()
js=js.replace("mean(a)-mean(b)","gameMetric(a)-gameMetric(b)")
js=js.replace("final:['average','points']","overall:['average','place'],final:['average','points']")
js=js.replace("${role(p)}</span></div><div class=", "${role(p)}${['overall','final'].includes(mode)&&misses(p)?' · '+completed(p)+'/'+p.history.length+' taps':''}</span></div><div class=")
js=js.replace("t('round',{n:S.round,total:S.gameRounds})","roundLabel()")
js=js.replace("S.games=0;S.round=1;","S.games=0;S.practiceDone=false;S.practice=false;S.round=1;")
js=js.replace("case 'start':startGame();break;","case 'start':offerStart();break;")
js=js.replace("case 'resume':S.live=true;if(S.pausedFrom==='roundResult'){S.screen='roundResult';S.resultPaused=true;render();}else startCountdown();break;","case 'resume':resumeGame();break;")
js=js.replace("switch(a){","switch(a){case 'practice':startPractice();break;case 'realStart':S.practiceDone=true;startGame();break;case 'resultsView':S.resultsView=el.dataset.view==='overall'?'overall':'roundResult';render();break;case 'demoDisconnect':pauseGame(true);break;case 'demoNext':dismiss();advanceRound(true);break;case 'demoHost':S.host=active().find(p=>p.id!==S.host).id;dismiss();render();break;")
js=js.replace("+button('leave','leave','secondary')", "+(mid?button('demoDisconnectLabel','demoDisconnect','secondary')+button('demoHostLabel','demoHost','secondary')+(S.screen==='roundResult'&&S.me!==S.host?button('demoNextLabel','demoNext','secondary'):''):'')+button('leave','leave','secondary')")
js=js.replace("document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.live){stopTimers();S.live=false;if(dialog.open)dialog.close();S.pausedFrom=S.screen;S.screen='paused';render()}})","document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.live)pauseGame(false)})")
# Override the small view/engine functions together; the original event wiring remains intact.
new=(p/'v7-functions.js').read_text()
marker="app.addEventListener('click',"
# Remove superseded declarations so each function has one authoritative definition.
import re
for name in re.findall(r'^function (\w+)\(',new,re.M):
    js=re.sub(r'^function '+name+r'\([^\n]*\n','',js,flags=re.M)
js=js.replace(marker,new+'\n'+marker,1)
js=js.replace("<p class=\"muted\">${t(c[1])}</p>","<p class=\"muted\">${t(c[1])}</p>${S.screen==='paused'?`<p class=\"meta\">Host: ${esc(people[S.host].name)} · Your seat and scores are kept.</p>`:''}")
s=s[:s.index('<script>')+8]+js+s[s.index('</script>',s.index('<script>')):]
css='''
.result-tabs{display:flex;gap:6px;justify-content:center;flex:none;height:38px;padding:0 0 6px}
.result-tabs button{height:32px;min-width:106px;border:1px solid var(--ln2);border-radius:var(--r-control);font-size:13px;padding:3px 12px}
.result-tabs button[aria-pressed="true"]{background:var(--ink);color:var(--on-ink);border-color:var(--ink)}
.result-detail{font-size:13px;line-height:1.5;color:var(--ink2);text-align:center}
.result-shell .focal{min-height:156px;gap:5px;padding:8px 0}
.result-shell .focal .number{font-size:48px}
.result-shell .focal .number small{font-size:21px}
.result-shell .roster{height:calc(var(--height-list) - 38px)}
.result-shell .focal h2{font-size:30px}
'''
s=s.replace('</style>',css+'</style>',1)
(p/'mockup-v7.html').write_text(s)
(p/'check-v7.js').write_text(js)
