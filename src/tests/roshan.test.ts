import { GSIData, MorphlingEventTypes, setObj } from '..';
import { process } from '../parser/roshan';
import { key as aegisKey } from '../parser/aegis';
import './util/storeSimulator';

const clientId = 'roshan1';

describe('Testing roshan state parsing', () => {
    test('No state',  async () => {
        const events = await process(clientId, {});
        expect(events).toHaveLength(0);
    });
    
    test('New state',  async () => {
        const events = await process(clientId, {map: {roshan_state: 'alive', roshan_state_end_seconds: 0}} as Partial<GSIData>);
        expect(events).toHaveLength(1);
        expect(events[0]).toEqual({
            event: MorphlingEventTypes.gsi_roshan,
            value: {state: 'alive', respawnTime: 0}
        })
    });
});


test('Roshan lifecycle', async () => {
    await process(clientId, {map: {roshan_state: 'alive', roshan_state_end_seconds: 0}} as Partial<GSIData>);

    /** Roshan kill **/
    const roshanKillEvents = await process(clientId, {map: {roshan_state: 'respawn_base', roshan_state_end_seconds: 400}} as Partial<GSIData>);
    expect(roshanKillEvents).toHaveLength(1);
    expect(roshanKillEvents[0]).toEqual({
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'respawn_base', respawnTime: 400}
    })

    /** Aegis pickup **/
    await setObj(aegisKey(clientId), 1);
    const aegisPickupEvents = await process(clientId, {map: {roshan_state: 'respawn_base', roshan_state_end_seconds: 390}} as Partial<GSIData>);
    expect(aegisPickupEvents).toHaveLength(1);
    expect(aegisPickupEvents[0]).toEqual({
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'aegis', respawnTime: 390}
    })

    /** Aegis drop **/
    await setObj(aegisKey(clientId), 0);
    const aegisDropEvents = await process(clientId, {map: {roshan_state: 'respawn_base', roshan_state_end_seconds: 380}} as Partial<GSIData>);
    expect(aegisDropEvents).toHaveLength(1);
    expect(aegisDropEvents[0]).toEqual({
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'respawn_base', respawnTime: 380}
    })

    /** Roshan variable countdown **/
    const roshanVariableCountdown = await process(clientId, {map: {roshan_state: 'respawn_variable', roshan_state_end_seconds: 120}} as Partial<GSIData>);
    expect(roshanVariableCountdown).toHaveLength(1);
    expect(roshanVariableCountdown[0]).toEqual({
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'respawn_variable', respawnTime: 120}
    });

    /** Roshan respawn **/
    await setObj(aegisKey(clientId), 0);
    const respawnEvents = await process(clientId, {map: {roshan_state: 'alive', roshan_state_end_seconds: 0}} as Partial<GSIData>);
    expect(respawnEvents).toHaveLength(1);
    expect(respawnEvents[0]).toEqual({
        event: MorphlingEventTypes.gsi_roshan,
        value: {state: 'alive', respawnTime: 0}
    })
});