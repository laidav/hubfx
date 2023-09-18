# Hubfx

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Core concepts](#core-concepts)
  1. [Hub and Stores](#hub-stores)
  1. [Effects](#effects)
     1. [Scoped Effects](#scoped-effects)
  1. [Integrating with UI](#integration)
  1. [Testing](#testing)
  
  


## Core concepts <a name="core-concepts"></a>

Taking inspiraton from [redux](https://redux.js.org/introduction/core-concepts), Hubfx uses the same concepts regarding Actions, Reducers, Store. These concepts are coupled with RxJS observables to manage state modelled as reactive streams.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Hub and Stores <a name="hub-stores"></a>

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

- PICTURE OF HUB AND STORE AND DISPATCH ACTIONS 1.

### Effects<a name="effects"></a>

- When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

- PICTURE of hub (image 2)
  - example?

**Scoped Effects** create effect streams scoped to a particular ACTION when an action is dispatch.<a name="scoped-effects"></a>

  - (image 3)
    - example?
    - Search Todos  -> async action updates state... effect stream created

- An effect can also be scoped to a unique to a unique composite key between

### Integrating with UI <a name="integration"></a>

A network of hubs and stores can be integrated with UI components without any tight coupling. The developer can model the state independent of presentation concerns.

Picture of DOM and hubs and stores (image 4)

### Testing <a name="testing"></a>

Since the state management is decoupled from presentation. It can be tested without rendering the UI.