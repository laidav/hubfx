import { ActionType } from './Action';
import { Observable } from 'rxjs';

export interface StateConfig<T> {
  reducer: (state?: T, action?: ActionType) => T;
  name?: string;
  initialState?: T;
  debug?: boolean;
}

export interface Hub {
  messages$: Observable<ActionType>;
  state: <T>(params: StateConfig<T>) => Observable<T>;
  dispatch: (action: ActionType<unknown>) => void;
}
