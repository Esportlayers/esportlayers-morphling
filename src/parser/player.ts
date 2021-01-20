import {
  GameData,
  getObj,
  GsiHero,
  GsiHeroState,
  GsiPlayer,
  GsiPlayerState,
  MorphlingEvent,
  MorphlingEventTypes,
  PlayerState,
  setObj,
} from '..';
import { key as gameDatakey } from './game';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';

function obsKey(userId: string): string {
  return `gsi_${userId}_players_state`;
}
function key(userId: string): string {
  return `gsi_${userId}_player_state`;
}

function lastUpdateKey(userId: string): string {
  return `gsi_${userId}_player_state_last`;
}

function mergePlayerHero(player: GsiPlayerState, playerHero: GsiHeroState): PlayerState {
  return {
    steamId: player.steamid,
    heroId: playerHero.id,
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    last_hits: player.last_hits,
    denies: player.denies,
    gold: player.gold,
    gold_reliable: player.gold_reliable,
    gold_unreliable: player.gold_unreliable,
    gold_from_hero_kills: player.gold_from_hero_kills,
    gold_from_creep_kills: player.gold_from_creep_kills,
    gold_from_income: player.gold_from_income,
    gold_from_shared: player.gold_from_shared,
    gpm: player.gpm,
    xpm: player.xpm,
    net_worth: player.net_worth,
    hero_damage: player.hero_damage,
    runes_activated: player.runes_activated,
    camps_stacked: player.camps_stacked,
    support_gold_spent: player.support_gold_spent,
    consumable_gold_spent: player.consumable_gold_spent,
    item_gold_spent: player.item_gold_spent,
    gold_lost_to_death: player.gold_lost_to_death,
    gold_spent_on_buybacks: player.gold_spent_on_buybacks,
    level: playerHero.level,
    alive: playerHero.alive,
    respawn_seconds: playerHero.respawn_seconds,
    buyback_cost: playerHero.buyback_cost,
    buyback_cooldown: playerHero.buyback_cooldown,
    health_percent: playerHero.health_percent,
    mana_percent: playerHero.mana_percent,
    smoked: playerHero.smoked,
    canBuyBack: playerHero.buyback_cooldown === 0 && playerHero.buyback_cost < player.gold,
  };
}

function transformState(allPlayers: GsiPlayer, hero: GsiHero): PlayerState[] {
  const players = [];

  const rawPlayers = Object.values(allPlayers);
  const playerData: [string, GsiPlayerState][] = Object.entries({ ...rawPlayers[0], ...rawPlayers[1] });
  const rawHeroes = Object.values(hero);
  const heroData: { [x: string]: GsiHeroState } = { ...rawHeroes[0], ...rawHeroes[1] };

  for (const [index, player] of playerData) {
    const playerHero = heroData[index];
    players.push(mergePlayerHero(player, playerHero));
  }

  return players;
}

export async function process(clientId: string, data: any): Promise<MorphlingEvent[]> {
  const gameData = (await getObj(gameDatakey(clientId))) as GameData;
  const lastUpdate = +((await getObj(lastUpdateKey(clientId))) || 0);

  if (gameData && gameData.type === 'observing' && (!lastUpdate || +lastUpdate + 5 < dayjs().unix())) {
    const oldData = (await getObj(obsKey(clientId))) as PlayerState[];
    const newPlayerState = data?.player as GsiPlayer | null;
    const newHeroState = data?.hero as GsiHero | null;

    if (newPlayerState && newHeroState) {
      const players = transformState(newPlayerState, newHeroState);
      await setObj(obsKey(clientId), players);
      await setObj(lastUpdateKey(clientId), '' + dayjs().unix());

      return [
        {
          event: MorphlingEventTypes.gsi_players_state,
          value: players,
        },
      ];
    } else if (oldData) {
      return await reset(clientId);
    }
  } else if (gameData && gameData.type === 'playing') {
    const oldData = (await getObj(key(clientId))) as PlayerState;
    const newPlayerState = data?.player as GsiPlayerState | null;
    const newHeroState = data?.hero as GsiHeroState | null;
    if (newPlayerState && newHeroState) {
      const newState = mergePlayerHero(newPlayerState, newHeroState);
      if (!isEqual(oldData, newState)) {
        await setObj(key(clientId), newState);
        return [
          {
            event: MorphlingEventTypes.gsi_player_state,
            value: newState,
          },
        ];
      }
    } else if (oldData) {
      return await reset(clientId);
    }
  }
  return [];
}

export async function reset(clientId: string): Promise<MorphlingEvent[]> {
  await setObj(obsKey(clientId), null);
  await setObj(key(clientId), null);
  return [
    {
      event: MorphlingEventTypes.gsi_players_state,
      value: null,
    },
    {
      event: MorphlingEventTypes.gsi_player_state,
      value: null,
    },
  ];
}

export async function getEvent(clientId: string): Promise<MorphlingEvent[]> {
  const value = (await getObj(obsKey(clientId))) as PlayerState[];
  const value1 = (await getObj(key(clientId))) as PlayerState;
  return [
    {
      value,
      event: MorphlingEventTypes.gsi_players_state,
    },
    {
      value: value1,
      event: MorphlingEventTypes.gsi_player_state,
    },
  ];
}
