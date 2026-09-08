from pathlib import Path
p=Path(__file__).parent
s=(p/'mockup-v5.html').read_text().replace('Blindstop — v5','Blindstop — v6')
css='''
/* Reserve space for overlay scrollbars; account separately for classic gutters. */
.roster{--native-scrollbar:0px;--scroll-clearance:16px}
.roster-scroll{padding-inline-end:var(--scroll-clearance);scrollbar-gutter:auto}
.table-head{padding-inline-start:2px;padding-inline-end:calc(2px + var(--scroll-clearance) + var(--native-scrollbar))}
.roster-scroll:focus-visible{outline:2px solid var(--ink2);outline-offset:-2px}
'''
s=s.replace('</style>',css+'</style>',1)
marker='function render(){'
helper="function syncRosterColumns(){const el=app.querySelector('#roster-scroll');if(!el||!el.parentElement)return;const width=Math.max(0,el.offsetWidth-el.clientWidth);el.parentElement.style.setProperty('--native-scrollbar',width+'px')}\nwindow.addEventListener('resize',syncRosterColumns,{passive:true});\n"
assert marker in s
s=s.replace(marker,helper+marker,1)
old="scroll.addEventListener('scroll',()=>S.listScroll=scroll.scrollTop,{passive:true})}}"
new="scroll.addEventListener('scroll',()=>S.listScroll=scroll.scrollTop,{passive:true});syncRosterColumns()}}"
assert old in s
s=s.replace(old,new,1)
(p/'mockup-v6.html').write_text(s)
(p/'check-v6.js').write_text(s.split('<script>',1)[1].split('</script>',1)[0])
t=(p/'check-v5.cjs').read_text().replace('check-v5.js','check-v6.js')
t += '''\nscrollNode=element();let gutter;scrollNode.parentElement={style:{setProperty(k,v){assert.equal(k,'--native-scrollbar');gutter=v}}};for(const width of [0,5,17]){scrollNode.offsetWidth=350;scrollNode.clientWidth=350-width;run('syncRosterColumns()');assert.equal(gutter,width+'px')}scrollNode=null;console.log('PASS: column alignment for overlay, thin and classic scrollbars.');\n'''
(p/'check-v6.cjs').write_text(t)
