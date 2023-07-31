import { ActionType } from './Action';
import { Observable, Subject } from 'rxjs';

export interface MessageHub {
  messages$: Observable<ActionType>;
  dispatch: (action: ActionType<unknown>) => void;
}
