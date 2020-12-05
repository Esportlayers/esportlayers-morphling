export interface GSIData {
    buildings?: object;
}

export function parseEvents(data: GSIData, clientId: string): void {
    console.log(clientId, data);
}