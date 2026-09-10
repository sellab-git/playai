import type { RoomState } from '../engine.ts';
import { t } from './i18n.ts';
export function invitation(code: string): string {
  const url=new URL('/',location.href); url.searchParams.set('code',code); return url.href;
}
export function eveningText(room: RoomState): string {
  const ordered=room.players.slice().sort((a,b)=>(room.totals[b.id]??0)-(room.totals[a.id]??0));
  return [t('room.shareTitle'),t('room.gamesPlayed',{count:room.gamesPlayed}),'',...ordered.map(player=>t('room.shareRow',{rank:1+ordered.filter(other=>(room.totals[other.id]??0)>(room.totals[player.id]??0)).length,name:player.name,count:room.totals[player.id]??0}))].join('\n');
}
