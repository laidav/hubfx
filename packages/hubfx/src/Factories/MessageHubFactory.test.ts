import { createEffect } from '../Helpers/createEffect';
import { Observable, Subscription, of } from 'rxjs';
import { delay, switchMap, mergeMap, debounceTime } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { MessageHubFactory } from './MessageHubFactory';

describe('MessageHubFactory', () => {
  const TEST_ACTION = 'TEST_ACTION';
  const TEST_ACTION_SUCCESS = 'TEST_ACTION_SUCCESS';

  it('should detect a test action dispatch', (done) => {
    const { messages$, dispatch } = MessageHubFactory();

    messages$.subscribe((message) => {
      if (message.type === TEST_ACTION) {
        expect(message.type).toBe(TEST_ACTION);
        done();
      }
    });

    dispatch({ type: TEST_ACTION, payload: 'test' });
  });

  it('should detect a generic effect', (done) => {
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

    const { messages$, dispatch } = MessageHubFactory([effect$]);

    messages$.subscribe((message) => {
      if (message.type === TEST_ACTION_SUCCESS) {
        expect(message.type).toBe(TEST_ACTION_SUCCESS);
        expect((<Action<string>>message).payload).toBe('test hi');
        done();
      }
    });

    dispatch({ type: TEST_ACTION, payload: 'test' });
  });

  describe('scoped effects', () => {
    let messages = [];
    let dispatch;
    let messages$;
    let subscription: Subscription;
    const assertMessages = (expectedMessages, done, timeout = 1000) => {
      setTimeout(() => {
        expect(messages).toEqual(expectedMessages);
        done();
      }, timeout);
    };

    beforeEach(() => {
      const hub = MessageHubFactory();
      dispatch = hub.dispatch;
      messages$ = hub.messages$;
      messages = [];
      subscription = messages$.subscribe((message) => {
        messages = messages.concat(message);
      });
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    const switchMapEffect = (action$: Observable<Action<string>>) =>
      action$.pipe(
        switchMap((action) =>
          of({
            type: TEST_ACTION_SUCCESS,
            payload: action.payload + ' succeeded',
          }).pipe(delay(100)),
        ),
      );

    it('should detect a scoped effect', (done) => {
      const action: Action<string> = {
        type: TEST_ACTION,
        payload: 'test action with scopped effect',
        scopedEffects: [switchMapEffect],
      };

      dispatch(action);
      assertMessages(
        [
          action,
          {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scopped effect succeeded',
          },
        ],
        done,
      );
    });

    it('switchMap in effect should cancel previous inner observables', (done) => {
      const action: Action<string> = {
        type: TEST_ACTION,
        payload: 'test action with scopped effect',
        scopedEffects: [switchMapEffect],
      };

      dispatch(action);

      setTimeout(() => {
        dispatch(action);
      }, 50);
      setTimeout(() => {
        dispatch(action);
      }, 200);

      assertMessages(
        [
          action,
          action,
          {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scopped effect succeeded',
          },
          action,
          {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scopped effect succeeded',
          },
        ],
        done,
      );
    });
  });

  // scoped effect
  // // more than one effect
  // // effects are independent streams
  // scoped effect with keys
  // // indepenedent between streams
  // // independent in array

  // generic effect does not trigger scoped effect

  // it('should detect a scoped effect', (done) => { const action: Action<string> = {
  //     type: TEST_ACTION,
  //     payload: 'test action with effect',
  //     key: 'unique',
  //     scopedEffects: [
  //       (action$: Observable<Action<string>>) =>
  //         action$.pipe(
  //           debounceTime(400),
  //           mergeMap((action) =>
  //             of({
  //               type: TEST_ACTION_SUCCESS,
  //               payload: action.payload + ' hi',
  //             }).pipe(delay(1000)),
  //           ),
  //         ),
  //       (action$: Observable<Action<string>>) =>
  //         action$.pipe(
  //           debounceTime(500),
  //           mergeMap((action) =>
  //             of({
  //               type: TEST_ACTION_SUCCESS,
  //               payload: action.payload + ' hi 2',
  //             }).pipe(delay(1000)),
  //           ),
  //         ),
  //     ],
  //   };

  //   const { messages$, dispatch } = MessageHubFactory();

  //   messages$.subscribe((message) => {
  //     console.log(message);
  //   });

  //   dispatch(action);
  //   dispatch({ type: TEST_ACTION, payload: 'no key or effect' });
  //   setTimeout(() => {
  //     dispatch(action);
  //   }, 450);
  // });
});
