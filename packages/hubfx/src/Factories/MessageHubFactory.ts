import { MessageHub } from '../Models/MessageHub';
import { Observable, ReplaySubject, merge, OperatorFunction } from 'rxjs';
import { ActionType } from '../Models/Action';
import { share } from 'rxjs/operators';
import { Effect } from '../Models/Effect';

export const MessageHubFactory = (
  effects$: Effect<unknown, unknown>[] = [],
): MessageHub => {
  const dispatcher$ = new ReplaySubject<ActionType>(1);

  const messages$ = effects$
    .reduce(
      (result: Observable<ActionType>, effect$): Observable<ActionType> => {
        return merge(result, dispatcher$.pipe(effect$));
      },
      dispatcher$,
    )
    .pipe(share());

  return {
    messages$,
    dispatch: (action) => {
      dispatcher$.next(action);
    },
  };
};
