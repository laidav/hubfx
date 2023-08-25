import { Subject, Observable } from 'rxjs';
import { Hub } from './Hub';
import { Action } from './Action';

export interface Stream<T> {
  dispatcher$: Subject<Action<unknown>>;
  state$: Observable<T>;
  hub: Hub;
}

export type StreamConfig<T> = {
  initialState: T;
  reducer: (state: T, action: Action<unknown>) => T;
  hub?: Hub;
  debug?: boolean;
  name?: string;
};
