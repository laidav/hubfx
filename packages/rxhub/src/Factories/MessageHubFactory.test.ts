import { createEffect } from '../Helpers/createEffect';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { MessageHubFactory } from './MessageHubFactory';

describe('MessageHubFactory', () => {
  const TEST_ACTION = 'TEST_ACTION';

  it('should detect a test action dispatch', (done) => {
    const { dispatcher$, messages$ } = MessageHubFactory();

    messages$.subscribe((message) => {
      if (message.type === TEST_ACTION) {
        expect(message.type).toBe(TEST_ACTION);
        done();
      }
    });

    dispatcher$.next({ type: TEST_ACTION, payload: 'test' });
  });

  it('should detect an effect', (done) => {
    const TEST_ACTION_SUCCESS = 'TEST_ACTION_SUCCESS';

    const effect$ = createEffect(
      TEST_ACTION,
      (action$: Observable<Action<string>>) =>
        action$.pipe(
          switchMap((action) =>
            of({
              type: TEST_ACTION_SUCCESS,
              payload: action.payload + ' hi',
            }).pipe(delay(2000)),
          ),
        ),
    );

    const { dispatcher$, messages$ } = MessageHubFactory([effect$]);

    messages$.subscribe((message) => {
      if (message.type === TEST_ACTION_SUCCESS) {
        expect(message.type).toBe(TEST_ACTION_SUCCESS);
        expect(message.payload).toBe('test hi');
        done();
      }
    });

    dispatcher$.next({ type: TEST_ACTION, payload: 'test' });
  });
});
