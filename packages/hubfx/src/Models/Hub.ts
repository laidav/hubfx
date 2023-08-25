import { ActionType } from './Action';
import { Observable, Subject } from 'rxjs';

export interface Hub {
  messages$: Observable<ActionType>;
  dispatch: (action: ActionType<unknown>) => void;
}
