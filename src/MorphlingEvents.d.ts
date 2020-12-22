export enum MorphlingEventTypes {
    gsi_aegis_available = 'gsi_aegis_available',
    gsi_gamedata = 'gsi_gamedata',
    gsi_game_paused = 'gsi_game_paused',
    gsi_game_state = 'gsi_game_state',
    gsi_game_winner = 'gsi_game_winner',
    gsi_game_win_chance = 'gsi_game_win_chance',
    gsi_game_activity = 'gsi_game_activity',
}

export interface MorphlingEvent {
    event: MorphlingEventTypes;
    value: any;
}