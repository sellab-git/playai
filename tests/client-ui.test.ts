// @vitest-environment jsdom
import { createElement } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomApp } from '../src/client/App';
import type { UiModel, UiActions } from '../src/client/model';
import { RoomRunner } from '../src/room/runner';
import { games } from '../src/games/registry';
import { harness, profile } from './fixtures';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function fixture() {
  const h=harness(), runner=new RoomRunner(null,{...h.deps,games});
  runner.create('ABCDE'); runner.join(profile('Test'),'1'.repeat(64));
  const connected=runner.connect('1'.repeat(64)); if(!connected.ok)throw new Error(connected.code);
  runner.ready(connected.value);
  runner.intent(connected.value,{actionId:'configure',command:{type:'configure',setup:{gameId:'blindstop',settings:{rounds:5,pace:'manual',practice:false}}}});
  const model:UiModel={snapshot:runner.snapshot(connected.value),connected:true,calibrated:true,pending:false,error:null,delivery:null,savedRoomCode:null,now:1000,serverToLocal:n=>n};
  const actions:UiActions={create:vi.fn(),join:vi.fn(),resume:vi.fn(),fresh:vi.fn(),send:vi.fn()};
  const view=render(createElement(RoomApp,{model,actions}));
  return {...view,model,actions,rerender:()=>view.rerender(createElement(RoomApp,{model:{...model},actions}))};
}
function openSettings(){ const trigger=screen.getByRole('button',{name:/Game settings/});fireEvent.click(trigger);return trigger; }
it('retains Start and settings focus across rapid drafts and server acknowledgements without accumulating actions',()=>{
  const f=fixture(), trigger=openSettings();
  const start=screen.getByRole('button',{name:'Play solo'}) as HTMLButtonElement;
  const input=screen.getByRole('spinbutton',{name:'Rounds'}) as HTMLInputElement;
  const save=screen.getByText('Changes save automatically.'), text=save.firstChild;
  input.focus(); const observer=new MutationObserver(()=>undefined);observer.observe(start,{subtree:true,childList:true,attributes:true,characterData:true});
  for(const [index,rounds] of [3,10,15,20,5].entries()){
    const settings={rounds,pace:index%2?'auto':'manual',practice:false};
    f.model.settingsDraft={gameId:'blindstop',settings};f.rerender();
    f.model.snapshot={...f.model.snapshot!,version:f.model.snapshot!.version+1,room:{...f.model.snapshot!.room,setup:f.model.settingsDraft}};f.model.settingsDraft=null;f.rerender();
    expect(screen.getByRole('button',{name:'Play solo'})).toBe(start);expect(start.disabled).toBe(false);
    expect(save.firstChild).toBe(text);expect(document.activeElement).toBe(input);expect(trigger.getAttribute('aria-expanded')).toBe('true');
  }
  expect(observer.takeRecords()).toEqual([]);observer.disconnect();
  fireEvent.click(screen.getByRole('button',{name:/^3$/}));
  expect(f.actions.send).toHaveBeenCalledTimes(1);
  expect(f.actions.send).toHaveBeenLastCalledWith({type:'configure',setup:{gameId:'blindstop',settings:{rounds:3,pace:'manual',practice:false}}});
  fireEvent.click(screen.getByRole('switch',{name:'Auto-start'}));
  expect(f.actions.send).toHaveBeenCalledTimes(2);
  expect(f.actions.send).toHaveBeenLastCalledWith({type:'configure',setup:{gameId:'blindstop',settings:{rounds:3,pace:'auto',practice:false}}});
  expect(screen.getByRole('button',{name:'Play solo'})).toBe(start);expect(start.disabled).toBe(false);
});
it('disables Start for invalid round input and restores it after a valid edit',()=>{
  const f=fixture();openSettings();const input=screen.getByRole('spinbutton',{name:'Rounds'});
  fireEvent.change(input,{target:{value:''}});expect((screen.getByRole('button',{name:'Play solo'}) as HTMLButtonElement).disabled).toBe(true);
  expect(f.actions.send).not.toHaveBeenCalled();
  fireEvent.change(input,{target:{value:'7'}});expect((screen.getByRole('button',{name:'Play solo'}) as HTMLButtonElement).disabled).toBe(false);
  expect(f.actions.send).toHaveBeenCalledTimes(1);
});
it('closes nested dialogs with X and invalidates a confirmation when context changes',async()=>{
  const f=fixture();fireEvent.click(screen.getByRole('button',{name:'Room menu'}));fireEvent.click(screen.getByRole('button',{name:'Invite friends'}));
  expect(screen.getByRole('dialog')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/^Close$/}));
  await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());
  fireEvent.click(screen.getByRole('button',{name:'Room menu'}));fireEvent.click(screen.getByRole('button',{name:'Close room'}));
  expect(screen.getByRole('button',{name:'Confirm'})).toBeTruthy();f.model.connected=false;f.rerender();
  await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(f.actions.send).not.toHaveBeenCalled();
});
it('copies again without changing the button label or disabling it',async()=>{
  fixture();const writeText=vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator',Object.assign(Object.create(navigator),{clipboard:{writeText}}));
  fireEvent.click(screen.getByRole('button',{name:'Room menu'}));fireEvent.click(screen.getByRole('button',{name:'Invite friends'}));
  const copy=screen.getByRole('button',{name:'Copy room code'}) as HTMLButtonElement;
  await act(async()=>{fireEvent.click(copy);});await act(async()=>{fireEvent.click(copy);});
  expect(writeText.mock.calls).toEqual([['ABCDE'],['ABCDE']]);expect(copy.disabled).toBe(false);expect(screen.getByRole('button',{name:'Copy room code'})).toBe(copy);
  expect(screen.getByText('Room code copied')).toBeTruthy();vi.unstubAllGlobals();
});

it('dismisses the dialog on a backdrop click without sending a room command',async()=>{
  const f=fixture();fireEvent.click(screen.getByRole('button',{name:'Room menu'}));
  const backdrop=document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]');expect(backdrop).not.toBeNull();
  await userEvent.click(backdrop!);
  await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(f.actions.send).not.toHaveBeenCalled();
});
