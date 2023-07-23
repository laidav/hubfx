import { Action } from './Action';
import { Observable, Subject } from 'rxjs';

export interface MessageHub {
  messages$: Observable<Action<unknown>>;
  dispatcher$: Subject<Action<unknown>>;
}
