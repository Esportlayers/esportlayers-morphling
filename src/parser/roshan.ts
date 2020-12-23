import { getObj, GSIData, MorphlingEvent, MorphlingEventTypes, setObj } from '..';
import { key as aegisKey } from './aegis'

//#region <interfaces>
interface RoshanState {
    state: 'aegis' | 'alive' | 'respawn_base' | 'respawn_variable';
    respawnTime: number;
}
//#endregion

function key(userId: string): string {
    return `gsi_${userId}_roshan`;
}

export async function process(clientId: string, data: GSIData): Promise<MorphlingEvent[]> {
    const oldData = await getObj(key(clientId)) as RoshanState;
    const newData = data?.map;
    const aegisAlive = Boolean(+(await getObj(aegisKey(clientId)) || 0));
    const state = (aegisAlive ? 'aegis' : newData?.roshan_state) || 'alive';

    if(newData) {
        if(oldData?.state !== state || oldData.respawnTime !== newData.roshan_state_end_seconds) {
            await setObj(key(clientId), {state, respawnTime: newData.roshan_state_end_seconds});

            return [{
                event: MorphlingEventTypes.gsi_roshan,
                value: {state, respawnTime: newData.roshan_state_end_seconds},
            }]
        }
    } else if(oldData) {
        return await reset(clientId);
    }

    return [];
}


export async function reset(clientId: string): Promise<MorphlingEvent[]> {
    await setObj(key(clientId), null);
    return [{
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'alive', respawnTime: 0},
    }];
}

export async function getEvent(clientId: string): Promise<MorphlingEvent[]> {
    const value = await getObj(key(clientId)) as RoshanState;
    return [{
        value,
        event: MorphlingEventTypes.gsi_roshan,
    }];
}