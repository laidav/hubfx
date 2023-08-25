import { Effect } from './Effect';
export interface ScopedEffects<T> {
  key?: string;
  effects: Effect<T, unknown>[];
}
export type Action<T = undefined> = {
  type: string;
  scopedEffects?: ScopedEffects<T>;
} & (T extends undefined
  ? {}
  : {
      payload: T;
    });

export type ActionType<T = undefined> = Action | Action<T>;
