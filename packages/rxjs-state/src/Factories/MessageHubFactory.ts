import { MessageHub } from '../Models/MessageHub';
import { Observable, Subject, merge, OperatorFunction } from 'rxjs';
import { Action } from '../Models/Action';
import { share } from 'rxjs/operators';

export const MessageHubFactory = (
  effects$: OperatorFunction<Action<unknown>, Action<unknown>>[] = [],
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
