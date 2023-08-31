import { Hub } from '../Models/Hub';
import { Observable, ReplaySubject, merge } from 'rxjs';
import {
  filter,
  tap,
  map,
  mergeAll,
  scan,
  pairwise,
  startWith,
} from 'rxjs/operators';
import { Action } from '../Models/Action';
import { share } from 'rxjs/operators';
import { Effect } from '../Models/Effect';

const getScopedEffectSignature = (actionType: string, key: string) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const HubFactory = (effects$: Effect<unknown, unknown>[] = []): Hub => {
  const dispatcher$ = new ReplaySubject<Action<unknown>>(1);

  const genericEffects = effects$.reduce(
    (result: Observable<Action<unknown>>[], effect) => {
      return result.concat(dispatcher$.pipe(effect));
    },
    [],
  );

  // Should we keep this in the stream with a scan operator instead?
  const scopedEffectsDict: { [key: string]: Effect<unknown, unknown>[] } = {};

  const mergedScopedEffects$ = dispatcher$.pipe(
    filter(({ type, scopedEffects }) => {
      const hasEffects = Boolean(scopedEffects && scopedEffects.effects.length);

      return (
        hasEffects &&
        scopedEffectsDict[getScopedEffectSignature(type, scopedEffects.key)] ===
          undefined
      );
    }),
    tap(({ type, scopedEffects: { key, effects } }) => {
      scopedEffectsDict[getScopedEffectSignature(type, key)] = effects;
    }),
    map(({ type, scopedEffects: { key, effects } }) => {
      const signature = getScopedEffectSignature(type, key);

      const pipedEffects = effects.reduce(
        (acc: Observable<ActionType<unknown>>[], effect) =>
          acc.concat(
            dispatcher$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(
                    initialAction.type,
                    initialAction.scopedEffects?.key,
                  ) === signature,
              ),
              effect,
            ),
          ),
        [],
      );

      return merge(...pipedEffects);
    }),
    mergeAll(),
  );

  const messages$ = merge(
    dispatcher$,
    mergedScopedEffects$,
    ...genericEffects,
  ).pipe(share());

  const state = <T>(config: {
    reducer: (state?: T, action?: ActionType) => T;
    name?: string;
    initialState?: T;
    debug?: boolean;
  }) => {
    const { reducer, name, debug, initialState } = config;
    const debugName = `[Stream Name] ${name || 'undefined'}`;

    const state$ = messages$.pipe(
      tap((action) => {
        debug && console.log(debugName, '[Message Received]', action);
      }),
      scan(reducer, initialState !== undefined ? initialState : reducer()),
      startWith(initialState !== undefined ? initialState : reducer()),
      pairwise(),
      tap(([prevState, newState]) => {
        if (debug) {
          const hasDiff = prevState !== newState;
          if (hasDiff) {
            console.log(
              debugName,
              '[State changed] Prev State:',
              prevState,
              'New State:',
              newState,
            );
          } else {
            console.log(debugName, '[State unchanged] State:', newState);
          }
        }
      }),
      map((pair) => pair[1]),
    );

    return state$;
  };

  return {
    messages$,
    state,
    dispatch: (...actions) => {
      actions.forEach((action) => {
        dispatcher$.next(action);
      });
    },
  };
};
