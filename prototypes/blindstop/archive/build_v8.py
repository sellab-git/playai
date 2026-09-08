from pathlib import Path
import re,json
p=Path(__file__).parent
html=(p/'mockup-v7.html').read_text().replace('Blindstop — v7','Blindstop — v8')
js=(p/'check-v7.js').read_text()
# Consolidate all copy layers in declaration order, retaining their final values.
chunks=[re.search(r'const COPY=(\{.*?\n\});',js,re.S).group(1)]
chunks+=re.findall(r'Object.assign\(COPY,(\{[^\n]*\})\);',js)
(p/'extract-copy.cjs').write_text('const fs=require("fs");const copy=Object.assign({},'+','.join(chunks)+');fs.writeFileSync(__dirname+"/copy-v8.json",JSON.stringify(copy,null,2));')
import subprocess
subprocess.run(['node',str(p/'extract-copy.cjs')],check=True)
copy=json.loads((p/'copy-v8.json').read_text())
copy.update({
 'rules3':'Tap once when you think the target time has passed. The round closes 8 seconds after the target.',
 'rules4':'Most completed rounds wins. If equal, the lowest average absolute error wins. Equal displayed averages share a place.',
 'rulesNote':'2–20 players. Choose 1–20 rounds. A practice round is optional and unscored. The host starts each round, or automatic play waits 8 seconds between rounds.',
 'scoringNote':'A missed tap ranks below every recorded tap. Averages use recorded taps only. Evening points: player count minus game place, plus one. Tied players receive equal points; no recorded taps means no points.',
 'timing':'Error','roundDetails':'Round details','overallResults':'Overall standings','yourStats':'Your game','previewOptions':'Preview controls',
 'roundPlace':'Your place: #{n} of {total}','targetValue':'Target','tapValue':'Your tap','errorValue':'Your error',
 'completedValue':'Completed rounds','bestValue':'Best tap error','averageValue':'Average error',
 'noMeasuredAverage':'No measured average','noCompletedTaps':'No completed taps','noGamePoints':'No points this game',
 'noPracticePoints':'Practice · no points','nextNumber':'Next round · {n}/{total}',
 'resultReady':'Start when everyone is ready.','previewExplanation':'These controls simulate connection and host changes on this phone.',
 'finalMeta':'Most completed rounds, then lowest average error',
 'waitingNext':'Waiting for host · {name}', 'tapAgain':'Recorded taps are preserved.',
 'yourTiming':'Your timing','closest':'Closest tap wins the round.'
})
copy.pop('penalty',None)
js=re.sub(r'const COPY=\{.*?\n\};','const COPY='+json.dumps(copy,ensure_ascii=False,indent=2)+';',js,count=1,flags=re.S)
js=re.sub(r'^Object.assign\(COPY,\{[^\n]*\}\);\n','',js,flags=re.M)
js=js.replace("String(values[k]??''));","String(values[k]??'')).replace(/\\b1 rounds\\b/g,'1 round');")
js=js.replace("switch(a){", "switch(a){case 'roundDetails':showRoundDetails();break;case 'overallResults':showOverall();break;case 'yourStats':showStats();break;case 'previewOptions':previewOptions();break;")
new=(p/'v8-functions.js').read_text()
for name in re.findall(r'^function (\w+)\(',new,re.M):
 js=re.sub(r'^function '+name+r'\([^\n]*\n','',js,flags=re.M)
js=js.replace("app.addEventListener('click',",new+"\napp.addEventListener('click',",1)
js=js.replace("dialog.classList.remove('avatar-dialog')","dialog.classList.remove('avatar-dialog','standings-dialog')")
# Remove obsolete per-render scrollbar measurement entirely.
js=js.replace("window.addEventListener('resize',syncRosterColumns,{passive:true});\n",'')
js=js.replace(';syncRosterColumns()','')
js=re.sub(r'^function syncRosterColumns[^\n]*\n','',js,flags=re.M)
html=html[:html.index('<script>')+8]+js+html[html.index('</script>',html.index('<script>')):]
css='''
/* Native touch/keyboard scrolling, no painted scrollbar or reserved gutter. */
.roster-scroll{padding-inline-end:0;scrollbar-width:none;scrollbar-gutter:auto;-ms-overflow-style:none}
.roster-scroll::-webkit-scrollbar{display:none;width:0;height:0}
.table-head{padding-inline:2px}
.result-shell .roster{height:var(--height-list)}
.result-shell .focal{min-height:126px;gap:6px;padding:12px 0}
.result-shell .focal .number{font-size:var(--fs-number)}
.result-shell .focal .number small{font-size:24px}
.detail-list{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px 16px;align-items:baseline}
.detail-list dt{color:var(--ink2);font-size:14px}
.detail-list dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:500}
.standings-dialog .dialog-body{overflow:hidden}
.standings-dialog .roster{height:min(52svh,460px);--height-row:46px;--width-avatar:34px;--width-value:88px;--width-position:48px}
.standings-dialog .player{font-size:14px}
'''
html=html.replace('</style>',css+'</style>',1)
(p/'mockup-v8.html').write_text(html)
(p/'check-v8.js').write_text(js)
