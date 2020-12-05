import { parseEvents } from '../index';

test('parse call', () => {
    expect(parseEvents({}, 'hans')).toEqual(undefined);
});