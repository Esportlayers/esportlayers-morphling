import { GameData, GSIMapData, MorphlingEvent, MorphlingEventTypes } from '../index';
import { getObj, setObj } from '../index';

export function key(userId: string): string {
  return `gsi_${userId}_game`;
}

export async function process(clientId: string, data: any): Promise<MorphlingEvent[]> {
  const events: MorphlingEvent[] = [];
  const oldData = (await getObj(key(clientId))) as GameData | null;
  const newData = data?.map as GSIMapData | null;

  if (newData) {
    if (!oldData || +newData.matchid !== oldData.matchId) {
      const isPlaying = data?.player.hasOwnProperty('steamid');
      const gameData = {
        matchId: +newData.matchid,
        gameState: newData.game_state,
        paused: newData.paused,
        winner: newData.win_team,
        radiantWinChance: newData.radiant_win_chance,
        type: isPlaying ? 'playing' : 'observing',
      };
      const isPlayingWin = isPlaying ? data.player.team_name === newData.win_team : false;

      events.push(
        {
          event: MorphlingEventTypes.gsi_gamedata,
          value: gameData,
        },
        {
          event: MorphlingEventTypes.gsi_game_paused,
          value: newData.paused,
        },
        {
          event: MorphlingEventTypes.gsi_game_state,
          value: newData.game_state,
        },
        {
          event: MorphlingEventTypes.gsi_game_win_chance,
          value: newData.radiant_win_chance,
        },
        {
          event: MorphlingEventTypes.gsi_game_activity,
          value: isPlaying ? 'playing' : 'observing',
        },
        {
          event: MorphlingEventTypes.gsi_game_winner,
          value: { isPlayingWin, winnerTeam: newData.win_team },
        },
        {
          event: MorphlingEventTypes.gsi_match_id,
          value: +newData.matchid,
        },
      );
      await setObj(key(clientId), gameData);
    }

    if (oldData) {
      const changeSet: Partial<GameData> = {};
      if (oldData.matchId !== +newData.matchid) {
        changeSet.matchId = +newData.matchid;
        events.push({
          event: MorphlingEventTypes.gsi_match_id,
          value: +newData.matchid,
        });
      }
      if (oldData.paused !== newData.paused) {
        changeSet.paused = newData.paused;
        events.push({
          event: MorphlingEventTypes.gsi_game_paused,
          value: newData.paused,
        });
      }

      if (oldData.gameState !== newData.game_state) {
        changeSet.gameState = newData.game_state;
        events.push({
          event: MorphlingEventTypes.gsi_game_state,
          value: newData.game_state,
        });
      }

      if (oldData.winner !== newData.win_team) {
        const isPlayingWin = oldData.type === 'playing' ? data.player.team_name === newData.win_team : false;
        changeSet.winner = newData.win_team;

        events.push({
          event: MorphlingEventTypes.gsi_game_winner,
          value: { isPlayingWin, winnerTeam: newData.win_team },
        });
      }

      if (oldData.radiantWinChance !== newData.radiant_win_chance) {
        changeSet.radiantWinChance = newData.radiant_win_chance;

        events.push({
          event: MorphlingEventTypes.gsi_game_win_chance,
          value: newData.radiant_win_chance,
        });
      }

      const activity = data?.player.hasOwnProperty('steamid') ? 'playing' : 'observing';
      if (activity !== oldData.type) {
        changeSet.type = activity;

        events.push({
          event: MorphlingEventTypes.gsi_game_activity,
          value: activity,
        });
      }

      if (Object.keys(changeSet).length > 0) {
        await setObj(key(clientId), { ...oldData, ...changeSet });
      }
    }
  } else if (oldData) {
    return await reset(clientId);
  }

  return events;
}

export async function reset(clientId: string): Promise<MorphlingEvent[]> {
  await setObj(key(clientId), null);

  return [
    {
      event: MorphlingEventTypes.gsi_match_id,
      value: null,
    },
    {
      event: MorphlingEventTypes.gsi_gamedata,
      value: null,
    },
    {
      event: MorphlingEventTypes.gsi_game_paused,
      value: false,
    },
    {
      event: MorphlingEventTypes.gsi_game_state,
      value: null,
    },
    {
      event: MorphlingEventTypes.gsi_game_winner,
      value: { isPlayingWin: false, winnerTeam: 'none' },
    },
    {
      event: MorphlingEventTypes.gsi_game_win_chance,
      value: 0,
    },
    {
      event: MorphlingEventTypes.gsi_game_activity,
      value: null,
    },
  ];
}

export async function getEvent(clientId: string): Promise<MorphlingEvent[]> {
  const data = (await getObj(key(clientId))) as GameData | null;
  return [
    {
      event: MorphlingEventTypes.gsi_match_id,
      value: data?.matchId || null,
    },
    {
      event: MorphlingEventTypes.gsi_gamedata,
      value: data || null,
    },
    {
      event: MorphlingEventTypes.gsi_game_paused,
      value: data?.paused || false,
    },
    {
      event: MorphlingEventTypes.gsi_game_state,
      value: data?.gameState || null,
    },
    {
      event: MorphlingEventTypes.gsi_game_winner,
      value: { isPlayingWin: false, winnerTeam: data?.winner || 'none' },
    },
    {
      event: MorphlingEventTypes.gsi_game_win_chance,
      value: data?.radiantWinChance || 0,
    },
    {
      event: MorphlingEventTypes.gsi_game_activity,
      value: data?.type || null,
    },
  ];
}
