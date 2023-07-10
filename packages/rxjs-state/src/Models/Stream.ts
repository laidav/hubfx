import { Subject, Observable } from 'rxjs';
import { MessageHub } from './MessageHub';
import { Action } from './Action';

export interface Stream<T> {
  dispatcher$: Subject<Action<unknown>>;
  state$: Observable<T>;
  messageHub: MessageHub;
}

export type StreamConfig<T> = {
  initialState: T;
  reducer: (state: T, action: Action<unknown>) => T;
  messageHub?: MessageHub;
  debug?: boolean;
  name?: string;
};
