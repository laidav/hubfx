import { Hub } from '../Models/Hub';
import { Observable, ReplaySubject, merge } from 'rxjs';
import { filter, tap, map, mergeAll } from 'rxjs/operators';
import { ActionType } from '../Models/Action';
import { share } from 'rxjs/operators';
import { Effect } from '../Models/Effect';

const getScopedEffectSignature = (actionType: string, key: string) =>
  `type: ${actionType}, scoped: true${key ? `,key:${key}` : ''}`;

export const HubFactory = (effects$: Effect<unknown, unknown>[] = []): Hub => {
  const dispatcher$ = new ReplaySubject<ActionType>(1);

  const genericEffects = effects$.reduce(
    (result: Observable<ActionType<unknown>>[], effect) => {
      return result.concat(dispatcher$.pipe(effect));
    },
    [],
  );

  // Should we keep this in the stream with a scan operator instead?
  const scopedEffectsDict: { [key: string]: Effect<unknown, unknown>[] } = {};

  const mergedScopedEffects$ = dispatcher$.pipe(
    filter(({ type, key, scopedEffects }) => {
      const hasEffects = Boolean(scopedEffects && scopedEffects.length);

      return (
        hasEffects &&
        scopedEffectsDict[getScopedEffectSignature(type, key)] === undefined
      );
    }),
    tap(({ type, key, scopedEffects }) => {
      scopedEffectsDict[getScopedEffectSignature(type, key)] = scopedEffects;
    }),
    map(({ type, key, scopedEffects }) => {
      const signature = getScopedEffectSignature(type, key);

      const pipedEffects = scopedEffects.reduce(
        (acc: Observable<ActionType<unknown>>[], effect) =>
          acc.concat(
            dispatcher$.pipe(
              filter(
                (initialAction) =>
                  getScopedEffectSignature(
                    initialAction.type,
                    initialAction.key,
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

  return {
    messages$,
    dispatch: (...actions) => {
      actions.forEach((action) => {
        dispatcher$.next(action);
      });
    },
  };
};
