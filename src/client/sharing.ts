import qrcode from 'qrcode-generator';
import type { RoomState } from '../engine.ts';
import { t } from './i18n.ts';
export function invitation(code: string): string {
  const url=new URL('/',location.href); url.searchParams.set('code',code); return url.href;
}
export function qrMarkup(value: string): string {
  const qr=qrcode(0,'M'); qr.addData(value); qr.make();
  const size=qr.getModuleCount(); let path='';
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(qr.isDark(y,x))path+=`M${x+4} ${y+4}h1v1h-1z`;
  return `<svg class="invite-qr" viewBox="0 0 ${size+8} ${size+8}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
}
export function eveningText(room: RoomState): string {
  const ordered=room.players.slice().sort((a,b)=>(room.totals[b.id]??0)-(room.totals[a.id]??0));
  return [t('room.evening'),t('room.gamesPlayed',{count:room.gamesPlayed}),...ordered.map(player=>t('room.shareRow',{name:player.name,points:room.totals[player.id]??0}))].join('\n');
}
