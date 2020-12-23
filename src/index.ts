import { process as processAegisEvents, reset as resetAegisEvents, getEvent as getAegisEvent } from './parser/aegis';
import { process as processGameEvents, reset as resetGameEvents, getEvent as getGameEvent } from './parser/game';
import { process as processDraftEvents, reset as resetDraftEvents, getEvent as getDraftEvent } from './parser/draft';
import {
  process as processPlayerEvents,
  reset as resetPlayerEvents,
  getEvent as getPlayerEvent,
} from './parser/player';
import {
  process as processRoshanEvents,
  reset as resetRoshanEvents,
  getEvent as getRoshanEvent,
} from './parser/roshan';

//#region <interfaces>

export type SetObjectFN = (key: string, data: any | null) => Promise<void>;
export type GetObjectFN<T extends object> = (key: string) => Promise<T | null>;

export enum MorphlingEventTypes {
  gsi_aegis_available = 'gsi_aegis_available',
  gsi_gamedata = 'gsi_gamedata',
  gsi_game_paused = 'gsi_game_paused',
  gsi_game_state = 'gsi_game_state',
  gsi_game_winner = 'gsi_game_winner',
  gsi_game_win_chance = 'gsi_game_win_chance',
  gsi_game_activity = 'gsi_game_activity',
  gsi_draft = 'gsi_draft',
  gsi_player_state = 'gsi_player_state',
  gsi_roshan = 'gsi_roshan',
  gsi_connected = 'gsi_connected',
  gsi_match_id = 'gsi_match_id',
}

export interface MorphlingEvent {
  event: MorphlingEventTypes;
  value: any;
}

export enum GameState {
  playersLoading = 'DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD',
  heroSelection = 'DOTA_GAMERULES_STATE_HERO_SELECTION',
  strategyTime = 'DOTA_GAMERULES_STATE_STRATEGY_TIME',
  teamShowcase = 'DOTA_GAMERULES_STATE_TEAM_SHOWCASE',
  mapLoading = 'DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD',
  preGame = 'DOTA_GAMERULES_STATE_PRE_GAME',
  running = 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
  postGame = 'DOTA_GAMERULES_STATE_POST_GAME',
}

export interface GameData {
  matchId: number;
  type: 'playing' | 'observing';
  gameState: GameState;
  paused: boolean;
  winner: string;
  radiantWinChance: number;
  radiant?: {
    name: string;
    logo: string;
  };
  dire?: {
    name: string;
    logo: string;
  };
}

export interface GSIMapData {
  name: string;
  matchid: string;
  game_time: number;
  clock_time: number;
  daytime: boolean;
  nightstalker_night: boolean;
  game_state: GameState;
  paused: boolean;
  win_team: 'none' | 'radiant' | 'dire';
  customgamename: string;
  radiant_ward_purchase_cooldown: number;
  dire_ward_purchase_cooldown: number;
  roshan_state: 'alive' | 'respawn_base' | 'respawn_variable';
  roshan_state_end_seconds: number;
  radiant_win_chance: number;
}

export interface GsiHeroState {
  xpos: number;
  ypos: number;
  id: number;
  name: string;
  level: number;
  alive: boolean;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  health: number;
  max_health: number;
  health_percent: number;
  mana: number;
  max_mana: number;
  mana_percent: number;
  silenced: boolean;
  stunned: boolean;
  disarmed: boolean;
  magicimmune: boolean;
  hexed: boolean;
  muted: boolean;
  break: boolean;
  smoked: boolean;
  has_debuff: boolean;
  selected_unit: boolean;
  talent_1: boolean;
  talent_2: boolean;
  talent_3: boolean;
  talent_4: boolean;
  talent_5: boolean;
  talent_6: boolean;
  talent_7: boolean;
  talent_8: boolean;
}

export interface GsiPlayerState {
  steamid: string;
  name: string;
  activity: string;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  kill_streak: number;
  commands_issued: number;
  kill_list: {
    [x: string]: number;
  };
  team_name: 'radiant' | 'dire';
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gold_from_hero_kills: number;
  gold_from_creep_kills: number;
  gold_from_income: number;
  gold_from_shared: number;
  gpm: number;
  xpm: number;
  net_worth: number;
  hero_damage: number;
  wards_purchased: number;
  wards_placed: number;
  wards_destroyed: number;
  runes_activated: number;
  camps_stacked: number;
  support_gold_spent: number;
  consumable_gold_spent: number;
  item_gold_spent: number;
  gold_lost_to_death: number;
  gold_spent_on_buybacks: number;
}

export interface GsiPlayer {
  team2: {
    player0: GsiPlayerState;
    player1: GsiPlayerState;
    player2: GsiPlayerState;
    player3: GsiPlayerState;
    player4: GsiPlayerState;
  };
  team3: {
    player5: GsiPlayerState;
    player6: GsiPlayerState;
    player7: GsiPlayerState;
    player8: GsiPlayerState;
    player9: GsiPlayerState;
  };
}

export interface GsiHero {
  team2: {
    player0: GsiHeroState;
    player1: GsiHeroState;
    player2: GsiHeroState;
    player3: GsiHeroState;
    player4: GsiHeroState;
  };
  team3: {
    player5: GsiHeroState;
    player6: GsiHeroState;
    player7: GsiHeroState;
    player8: GsiHeroState;
    player9: GsiHeroState;
  };
}

export interface PlayerState {
  steamId: string;
  heroId: number;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gold_from_hero_kills: number;
  gold_from_creep_kills: number;
  gold_from_income: number;
  gold_from_shared: number;
  gpm: number;
  xpm: number;
  net_worth: number;
  hero_damage: number;
  runes_activated: number;
  camps_stacked: number;
  support_gold_spent: number;
  consumable_gold_spent: number;
  item_gold_spent: number;
  gold_lost_to_death: number;
  gold_spent_on_buybacks: number;
  level: number;
  alive: boolean;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  health_percent: number;
  mana_percent: number;
  smoked: boolean;
  canBuyBack: boolean;
}

export interface TeamDraftData {
  home_team: boolean;
  pick0_id: number;
  pick0_class: string;
  pick1_id: number;
  pick1_class: string;
  pick2_id: number;
  pick2_class: string;
  pick3_id: number;
  pick3_class: string;
  pick4_id: number;
  pick4_class: string;
  ban0_id: number;
  ban0_class: string;
  ban1_id: number;
  ban1_class: string;
  ban2_id: number;
  ban2_class: string;
  ban3_id: number;
  ban3_class: string;
  ban4_id: number;
  ban4_class: string;
  ban5_id: number;
  ban5_class: string;
  ban6_id: number;
  ban6_class: string;
}

export interface DraftData {
  team: number;
  pick: boolean;
  activeteam_time_remaining: number;
  radiant_bonus_time: number;
  dire_bonus_time: number;
  team2: TeamDraftData;
  team3: TeamDraftData;
}

export interface GSIData {
  map?: GSIMapData;
  player?: GsiPlayer;
  hero?: GsiHero;
  draft?: DraftData;
}

//#endregion

export let setObj: SetObjectFN;
export let getObj: GetObjectFN<object>;

export function init(setData: SetObjectFN, getData: GetObjectFN<object>): void {
  setObj = setData;
  getObj = getData;
}

export async function parseEvents(data: GSIData, clientId: string): Promise<MorphlingEvent[]> {
  const aegis = await processAegisEvents(clientId, data);
  const game = await processGameEvents(clientId, data);
  const draft = await processDraftEvents(clientId, data);
  const player = await processPlayerEvents(clientId, data);
  const roshan = await processRoshanEvents(clientId, data);

  return [...aegis, ...game, ...draft, ...player, ...roshan];
}

export async function resetEvents(clientId: string): Promise<MorphlingEvent[]> {
  const aegis = await resetAegisEvents(clientId);
  const game = await resetGameEvents(clientId);
  const draft = await resetDraftEvents(clientId);
  const player = await resetPlayerEvents(clientId);
  const roshan = await resetRoshanEvents(clientId);

  return [...aegis, ...game, ...draft, ...player, ...roshan];
}

export async function getEvents(clientId: string): Promise<MorphlingEvent[]> {
  const aegis = await getAegisEvent(clientId);
  const game = await getGameEvent(clientId);
  const draft = await getDraftEvent(clientId);
  const player = await getPlayerEvent(clientId);
  const roshan = await getRoshanEvent(clientId);

  return [...aegis, ...game, ...draft, ...player, ...roshan];
}
