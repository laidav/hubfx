import { Action } from './Action';
import { Observable } from 'rxjs';

export type Reducer<T> = (state?: T, action?: Action<unknown>) => T;

export interface StateConfig<T> {
  reducer: Reducer<T>;
  name?: string;
  initialState?: T;
  debug?: boolean;
}

export interface Hub {
  messages$: Observable<Action<unknown>>;
  state: <T>(params: StateConfig<T>) => Observable<T>;
  dispatch: (action: Action<unknown>) => void;
}
