import {getObj, setObj, MorphlingEvent, MorphlingEventTypes} from '../index';

const aegisItemName = 'item_aegis';

export function key(userId: string): string {
    return `gsi_${userId}_aegis`;
}

export async function process(clientId: string, data: any): Promise<MorphlingEvent[]> {
    const oldData = Boolean(+(await getObj(key(clientId)) || 0));
    const newData = JSON.stringify(data.items || {}).indexOf(aegisItemName) !== -1;

    if(oldData !== newData) {
        await setObj(key(clientId), '' + (+newData));
        return [{
            event: MorphlingEventTypes.gsi_aegis_available,
            value: newData,
        }];
    }

    return [];
}

export async function reset(clientId: string): Promise<MorphlingEvent[]> {
    await setObj(key(clientId), '0');
    return [{
        event: MorphlingEventTypes.gsi_aegis_available,
        value: false,
    }];
}

export async function getEvent(clientId: string): Promise<MorphlingEvent[]> {
    const value = Boolean(+(await getObj(key(clientId)) || 0));
    return [{
        value,
        event: MorphlingEventTypes.gsi_aegis_available,
    }];
}