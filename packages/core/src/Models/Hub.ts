import { Action } from './Action';
import { Observable } from 'rxjs';

export type Reducer<T> = (state?: T, action?: Action<unknown>) => T;

export interface StoreConfig<T> {
  reducer: Reducer<T>;
  name?: string;
  initialState?: T;
  debug?: boolean;
}

export interface Hub {
  messages$: Observable<Action<unknown>>;
  store: <T>(params: StoreConfig<T>) => Observable<T>;
  dispatch: (...actions: Action<unknown>[]) => void;
}
