import { GetObjectFN, init, SetObjectFN } from '../..';

const store = new Map<string, any | null>();

export const setObj: SetObjectFN = async (key, data) => {
  store.set(key, data);
};

export const getObj: GetObjectFN<object> = async (key) => {
  return store.get(key);
};

init(setObj, getObj);
