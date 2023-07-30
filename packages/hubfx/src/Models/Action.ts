import { Effect } from './Effect';
export type Action<T = undefined> = {
  type: string;
  key?: string;
  scopedEffects?: Effect<T, unknown>[];
} & (T extends undefined
  ? {}
  : {
      payload: T;
    });

export type ActionType<T = undefined> = Action | Action<T>;
