# Hubfx

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Core concepts](#core-concepts)
    1. [Hub and Stores](#hub-stores)
    1. [Effects](#effects)
       1. [Scoped Effects](#scoped-effects)
    1. [Integrating with UI](#integration)
1. [API](#api)
    1. [Hub](#hub)
        1. [Basic Usage](#hub-usage)
        1. [Store Config](#store-config)
        1. [messages$](#hub-messages)
        1. [Angular Example](#hub-angular-example)
        1. [React Example](#hub-react-example)

    1. [Scoped Effects in Action](#action-scoped-effects)

## Core concepts <a name="core-concepts"></a>

Taking inspiraton from [redux](https://redux.js.org/introduction/core-concepts), Hubfx uses the same concepts regarding Actions, Reducers, Store. These concepts are coupled with RxJS observables to manage state modelled as reactive streams.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Hub and Stores <a name="hub-stores"></a>

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

- (Slide 1)

### Effects<a name="effects"></a>

When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

- (slide 2)
**Scoped Effects** dynamically create effect streams scoped to a particular action & key combination when an action is dispatch.<a name="scoped-effects"></a>

  - (slide 3)

### Integrating with UI <a name="integration"></a>
A network of hubs and stores can be integrated with UI components without tight coupling. The developer can then decide how best to integrate with UI components.

- (slide 4 & 5)

## API <a name="api"></a>

### Hub <a name="hub"></a>

#### Basic Usage <a name="hub-usage"></a>

```typescript
const hub = HubFactory();

const countReducer = (state = { counter: 0 }, action) => {
  switch (action.type) {
    case 'increment':
      return { counter: state.counter + 1 };
    default:
      return state;
  }
}

const count$ = hub.store({ reducer: countReducer });

count$.subscribe((count) => console.log(count));

hub.dispatch({ type: 'increment' });

// Output
// 1
```

#### Store Config <a name="store-config"></a>

```typescript
export interface StoreConfig<T> {
  reducer: Reducer<T>;
  name?: string; // name for store to show up in debugging
  initialState?: T;
  debug?: boolean; // This will console log all messages the store receives and the prev and new state
}
```
- (slide 6)

#### messages$ <a name="hub-messages"></a>
The hub also exposes a `Hub.messages$` observable of all the actions stores receive. It can be helpful for testing how your hub is handling actions and effects.

#### Angular Example <a name="hub-angular-example"></a>

Using our above count example we can integrate with an Angular component. 

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { HubFactory } from '@hubfx/core';
import { countReducer } from '/countReducer;

export class CounterComponent {
  @Input() hub = HubFactory();
  count$: Observable<number>;

  increment() {
    this.hub.dispatch({ type: 'increment' });
  }

  ngOnInit() {
    this.count$ = this.hub.store({ reducer: countReducer });
  }
}

```

#### React Example <a name="hub-react-example"></a>

Using our above count example we can integrate with a React component. 

```typescript
import { useHub } from './useHub';
import { useObservable } from './useObservable';
import { countReducer } from './countReducer';

const Counter = (({ hub = useHub() })) => {

  const count = useObservable(hub.store(countReducer));

  return (
    <div>
      Count: {count}
      <button onClick={ () => {hub.dispatch({ type: 'increment' }); }}>
        Increment
      </button>
    </div>
  )
}


```

Hook to store a hub reference.

```typescript
// useHub.ts

import { useRef } from 'react';
import { HubFactory } from '@hubfx/core';

export const useHub = () => {
  return useRef(HubFactory()).current;
};
```

Hook to bind observable to React state.

```typescript
// useObservable.ts

import { useEffect, useState, useRef } from 'react';
import { Observable } from 'rxjs';

export const useObservable = <T>(obs$: Observable<T>) => {
  const currentObs$ = useRef(obs$).current;
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
```

### Scoped Effects in Action <a name="action-scoped-effects"></a>

Scoped effects can be declared in the action declaration and created with action creators. When the action is dispatched the hub will register a stream with the Action & key (if it hasnt already).

You can then manuipulate the stream as neccessary by piping operators.

You can also have more than one effect and each stream will be independent of each other.

```typescript

const UPDATE_TODO = 'UPDATE_TODO';
const UPDATE_TODO_SUCCESS = 'UPDATE_TODO_SUCCESS';
const updateTodo = ({ id, message }, todoService: TodoService) => ({
  type: UPDATE_TODO,
  payload: message,
  scopedEffects: {
    key: id,
    effects: [
      (actions$: Observable<Action<string>>) =>
        actions$.pipe(
          mergeMap((action) => todoService.updateTodo(id, action.payload))
          map(({ data }) => ({
            type: UPDATE_TODO_SUCCESS,
            payload: data
          }))
        )
    ]
  }
})
```

