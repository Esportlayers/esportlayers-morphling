import {MorphlingEvent} from './MorphlingEvents';
import {process as processAegisEvents, reset as resetAegisEvents, getEvent as getAegisEvent} from './parser/aegis';
import {process as processGameEvents, reset as resetGameEvents, getEvent as getGameEvent} from './parser/game';
import {GSIData} from './GSIData';

export type SetObjectFN = (key: string, data: any | null) => Promise<void>;
export type GetObjectFN<T extends object> = (key: string) => Promise<T | null>

export let setObj: SetObjectFN;
// @ts-ignore
export let getObj: GetObjectFN;


export function init(setData: SetObjectFN, getData: GetObjectFN<object>): void {
    setObj = setData;
    getObj = getData;
}


export async function parseEvents(data: GSIData, clientId: string): Promise<MorphlingEvent[]> {
    const aegis = await processAegisEvents(clientId, data);
    const game = await processGameEvents(clientId, data);

    return [
        ...aegis,
        ...game,
    ];
}

export async function resetEvents(clientId: string): Promise<MorphlingEvent[]> {
    const aegis = await resetAegisEvents(clientId);
    const game = await resetGameEvents(clientId);

    return [
        ...aegis,
        ...game,
    ];
}

export async function getEvents(clientId: string): Promise<MorphlingEvent[]> {
    const aegis = await getAegisEvent(clientId);
    const game = await getGameEvent(clientId);

    return [
        ...aegis,
        ...game,
    ];
}