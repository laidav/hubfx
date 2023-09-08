import { useEffect, useState, useRef } from 'react';
import { Hub, Reducer } from '@hubfx/core';

export const useObservable = <T>(hub: Hub, reducer: Reducer<T>) => {
  const currentObs$ = useRef(hub.store({ reducer })).current;
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = currentObs$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(
      subscription,
    ) as () => void;

    return unsubscribe;
  }, []);

  return state;
};
