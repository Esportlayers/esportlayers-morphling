import { getObj, setObj, DraftData, GSIData, MorphlingEvent, MorphlingEventTypes } from '../index';
import isEqual from 'lodash/isEqual';

function key(userId: string): string {
  return `gsi_${userId}_draft`;
}

export async function process(clientId: string, data: GSIData): Promise<MorphlingEvent[]> {
  const oldData = (await getObj(key(clientId))) as DraftData;
  const newData = data?.draft;

  if (newData) {
    if (!oldData || !isEqual(newData, oldData)) {
      await setObj(key(clientId), newData);
      return [
        {
          event: MorphlingEventTypes.gsi_draft,
          value: newData,
        },
      ];
    }
  } else if (oldData) {
    return await reset(clientId);
  }

  return [];
}

export async function reset(clientId: string): Promise<MorphlingEvent[]> {
  await setObj(key(clientId), null);
  return [
    {
      event: MorphlingEventTypes.gsi_draft,
      value: null,
    },
  ];
}

export async function getEvent(clientId: string): Promise<MorphlingEvent[]> {
  const value = (await getObj(key(clientId))) as DraftData;
  return [
    {
      value,
      event: MorphlingEventTypes.gsi_draft,
    },
  ];
}
