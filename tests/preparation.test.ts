import { describe, expect, it } from 'vitest';
import { RoomRunner } from '../src/room/runner';
import { snapshotSchema } from '../src/client/protocol';
import type { DurableRecord } from '../src/room/types';
import { harness, profile } from './fixtures';
function room() {
 const h=harness(), runner=new RoomRunner(null,h.deps); runner.create('ABCDE');
 const connections=['1','2'].map((digit,index)=>{const hash=digit.repeat(64); runner.join(profile(`P${index}`),hash); const result=runner.connect(hash); if(!result.ok) throw new Error(result.code); runner.ready(result.value); return result.value;});
 return {h,runner,host:connections[0]!,guest:connections[1]!};
}
const setup={gameId:'fixture',settings:{deadlineMs:1000,mode:'ranked'}};
describe('durable room preparation',()=>{
 it('counts accepted starts once across retries, aborts and durable restoration',()=>{
  const {h,runner,host,guest}=room();
  const start={actionId:'first-start',command:{type:'start',...setup}};
  expect(runner.snapshot(host)?.room.gamesStarted).toBe(0);
  expect(runner.intent(guest,start).accepted).toBe(false);
  expect(runner.snapshot(host)?.room.gamesStarted).toBe(0);
  const accepted=runner.intent(host,start);
  expect(accepted.accepted).toBe(true);
  expect(runner.intent(host,start)).toEqual(accepted);
  expect(runner.intent(host,{...start,actionId:'while-active'}).accepted).toBe(false);
  expect(runner.snapshot(host)?.room.gamesStarted).toBe(1);
  expect(runner.intent(host,{actionId:'abort',command:{type:'abort'}}).accepted).toBe(true);
  const resumed=new RoomRunner(JSON.parse(JSON.stringify(runner.record)) as DurableRecord,h.deps);
  expect(resumed.intent(host,start)).toEqual(accepted);
  expect(resumed.snapshot(host)?.room.gamesStarted).toBe(1);
  expect(resumed.snapshot(host)?.room.gamesPlayed).toBe(0);
  expect(resumed.intent(host,{...start,actionId:'second-start'}).accepted).toBe(true);
  expect(snapshotSchema.parse(resumed.snapshot(host)).room.gamesStarted).toBe(2);
 });
 it('accepts old room snapshots and initializes starts from retained completed games',()=>{
  const {h,runner,host}=room();
  const record=runner.record;
  if(record?.kind!=='room') throw new Error('Expected room');
  delete record.value.room.gamesStarted;
  record.value.room.gamesPlayed=3;
  const resumed=new RoomRunner(record,h.deps);
  expect(snapshotSchema.parse(resumed.snapshot(host)).room.gamesStarted).toBeUndefined();
  expect(resumed.intent(host,{actionId:'legacy-start',command:{type:'start',...setup}}).accepted).toBe(true);
  expect(resumed.snapshot(host)?.room.gamesStarted).toBe(4);
 });
 it('saves validated host setup, shares it, retains it across reconnect and still admits guests',()=>{
  const {h,runner,host,guest}=room();
  expect(runner.intent(guest,{actionId:'guest',command:{type:'configure',setup}}).accepted).toBe(false);
  expect(runner.intent(host,{actionId:'save',command:{type:'configure',setup}}).accepted).toBe(true);
  expect(runner.snapshot(guest)?.room.setup).toEqual(setup);
  expect(runner.join(profile('Late'),'3'.repeat(64)).ok).toBe(true);
  const resumed=new RoomRunner(runner.record,h.deps);
  expect(resumed.snapshot(host)?.room.setup).toEqual(setup);
  expect(resumed.intent(host,{actionId:'save',command:{type:'configure',setup}}).accepted).toBe(true);
  expect(resumed.intent(host,{actionId:'clear',command:{type:'configure',setup:null}}).accepted).toBe(true);
  expect(resumed.snapshot(guest)?.room.setup).toBeNull();
 });
 it('rejects unknown games, invalid settings and configuration during a running match',()=>{
  const {runner,host}=room();
  expect(runner.intent(host,{actionId:'unknown',command:{type:'configure',setup:{...setup,gameId:'missing'}}}).accepted).toBe(false);
  expect(runner.intent(host,{actionId:'invalid',command:{type:'configure',setup:{...setup,settings:{}}}}).accepted).toBe(false);
  expect(runner.intent(host,{actionId:'start',command:{type:'start',...setup}}).accepted).toBe(true);
  expect(runner.intent(host,{actionId:'active',command:{type:'configure',setup}}).accepted).toBe(false);
 });
 it('allows self identity edits only between games, preserving points and membership',()=>{
  const {runner,host,guest}=room();
  expect(runner.intent(guest,{actionId:'identity',command:{type:'profile',profile:{name:'Nina',faceId:'face-25'}}}).accepted).toBe(true);
  expect(runner.snapshot(host)?.room.players.find(p=>p.id===guest.playerId)?.name).toBe('Nina');
  expect(runner.intent(guest,{actionId:'bad',command:{type:'profile',profile:{name:'',faceId:'face-99'}}}).accepted).toBe(false);
  runner.intent(host,{actionId:'start',command:{type:'start',...setup}});
  expect(runner.intent(guest,{actionId:'during',command:{type:'profile',profile:{name:'Changed',faceId:'face-02'}}}).accepted).toBe(false);
 });
});

