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
    1. [Create a hub](#hub-create)
    1. [Methods](#hub-methods)
      1. [dispatch](#hub-dispatch)
      1. [store](#hub-store-create)
    1. [Properties](#hub-properties)
      1. [messages$](#hub-messages)

## Core concepts <a name="core-concepts"></a>

Taking inspiraton from [redux](https://redux.js.org/introduction/core-concepts), Hubfx uses the same concepts regarding Actions, Reducers, Store. These concepts are coupled with RxJS observables to manage state modelled as reactive streams.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Hub and Stores <a name="hub-stores"></a>

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

- (Slide 1)

### Effects<a name="effects"></a>

When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

- (slide 2)
**Scoped Effects** create effect streams scoped to a particular ACTION when an action is dispatch.<a name="scoped-effects"></a>

  - (slide 3)

### Integrating with UI <a name="integration"></a>
A network of hubs and stores can be integrated with UI components without tight coupling. The developer can then decide how best to integrate with UI components.

- (slide 4 & 5)

## API <a name="api"></a>
### HubFactory

