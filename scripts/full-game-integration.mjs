import assert from 'node:assert/strict';
import { post, client } from './ws-client.mjs';
const sockets=[];
async function intent(c,command){const actionId=crypto.randomUUID();const version=c.latest().version;c.send({type:'intent',intent:{actionId,command}});const ack=(await c.wait(m=>m.type==='ack'&&m.ack.actionId===actionId)).ack;await c.wait(m=>m.type==='state'&&m.snapshot.version>version);return ack;}
const action=(c,payload)=>intent(c,{type:'action',scope:c.latest().game.scope,payload});
try {
 const host=await post('/api/rooms',{name:'Full host',faceId:'face-01'}),guest=await post(`/api/rooms/${host.code}/join`,{name:'Full guest',faceId:'face-02'});
 let a=await client(host);const b=await client(guest);sockets.push(a.ws,b.ws);
 const setup={gameId:'blindstop',settings:{rounds:2,pace:'auto',practice:false}};
 assert.equal((await intent(a,{type:'configure',setup})).accepted,true);
 assert.equal((await intent(b,{type:'configure',setup:null})).accepted,false);
 await b.wait(m=>m.type==='state'&&m.snapshot.room.setup?.settings.rounds===2);
 assert.equal((await intent(a,{type:'start',gameId:'blindstop',settings:{rounds:2,pace:'auto',practice:true}})).accepted,true);
 for(const round of [0,1,2]){
  await a.wait(m=>m.type==='state'&&m.snapshot.game?.public.round===round&&m.snapshot.game?.phase.name==='round');
  await b.wait(m=>m.type==='state'&&m.snapshot.game?.public.round===round&&m.snapshot.game?.phase.name==='round');
  const target=a.latest().game.public.targetMs;
  assert.equal((await action(a,{type:'TAP',elapsedMs:target})).accepted,true);
  assert.deepEqual(a.latest().game.public.rows,[]);
  assert.equal((await action(b,{type:'TAP',elapsedMs:target+100})).accepted,true);
  await a.wait(m=>m.type==='state'&&m.snapshot.game?.public.round===round&&m.snapshot.game?.phase.name==='result');
  assert.equal(a.latest().room.gamesPlayed,0);
  if(round===0){assert.deepEqual(a.latest().game.public.history,[]);assert.equal((await action(a,{type:'START'})).accepted,true);}
  if(round===1){
   assert.equal((await action(a,{type:'PAUSE'})).accepted,true);
   const old=a;a=await client(host);sockets.push(a.ws);await a.wait(m=>m.type==='state'&&m.snapshot.game?.public.paused===true);
   assert.equal(a.latest().room.setup.settings.rounds,2);assert.equal(a.latest().game.public.history.length,1);
   assert.equal((await action(b,{type:'NEXT'})).accepted,false);
   assert.equal((await action(a,{type:'RESUME'})).accepted,true);old.ws.close();
  }
 }
 await a.wait(m=>m.type==='state'&&m.snapshot.room.status==='completed');
 assert.equal(a.latest().room.gamesPlayed,1);assert.equal(a.latest().room.totals[host.playerId],2);assert.equal(a.latest().room.totals[guest.playerId],1);
 assert.equal(a.latest().game.public.history.length,2);
 assert.equal((await intent(a,{type:'lobby',destination:'preparation'})).accepted,true);
 assert.equal(a.latest().room.setup.settings.rounds,2);assert.equal(a.latest().room.totals[host.playerId],2);
 assert.equal((await intent(b,{type:'profile',profile:{name:'New name',faceId:'face-25'}})).accepted,true);
 assert.equal((await intent(a,{type:'configure',setup:null})).accepted,true);
 assert.equal(a.latest().room.setup,null);
 assert.equal((await intent(a,{type:'close'})).accepted,true);
 console.log('PASS: full practice plus two-round game, shared settings, private timing, pause/reconnect/resume, automatic final, exactly-once totals, replay preparation and identity edit.');
}finally{for(const socket of sockets)socket.close();}
