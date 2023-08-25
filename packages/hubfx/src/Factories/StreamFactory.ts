import { scan, startWith, tap, pairwise, map } from 'rxjs/operators';
import { StreamConfig, Stream } from '../Models/Stream';
import { HubFactory } from './HubFactory';

export const StreamFactory = <T>({
  reducer,
  initialState,
  hub = HubFactory(),
  debug,
  name,
}: StreamConfig<T>): Stream<T> => {
  const { dispatcher$, messages$ } = hub;
  const debugName = `[Stream Name] ${name || 'undefined'}`;

  const state$ = messages$.pipe(
    tap((action) => {
      debug && console.log(debugName, '[Message Received]', action);
    }),
    scan(reducer, initialState),
    startWith(initialState),
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

  return {
    dispatcher$,
    state$,
    hub,
  };
};
