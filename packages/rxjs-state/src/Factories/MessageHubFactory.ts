import { MessageHub } from '../Models/MessageHub';
import { Observable, Subject, merge, OperatorFunction } from 'rxjs';
import { Action } from '../Models/Action';
import { share } from 'rxjs/operators';
import { Effect } from '../Models/Effect';

export const MessageHubFactory = (
  effects$: Effect<unknown, unknown>[] = [],
): MessageHub => {
  const dispatcher$ = new Subject<Action<unknown>>();

  const messages$ = effects$
    .reduce(
      (
        result: Observable<Action<unknown>>,
        effect$,
      ): Observable<Action<unknown>> => {
        return merge(result, dispatcher$.pipe(effect$));
      },
      dispatcher$,
    )
    .pipe(share());

  return {
    messages$,
    dispatcher$,
  };
};
