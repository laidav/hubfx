# Hubfx Core

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Core concepts](#core-concepts)
  1. [Hub and Stores](#hub-stores)
  1. [Effects](#scoped-effects)
  1. [One Way In, One Way Out](#one-way)

## Core concepts <a name="core-concepts"></a>

Taking inspiraton from [redux](https://redux.js.org/introduction/core-concepts), Hubfx uses the same concepts regarding Actions, Reducers, Store. These concepts are coupled with RxJS observables to manage state modelled as reactive streams.

### Hub and Stores <a name="hub-stores"></a>

Hub is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects i.e api calls and other async operations...

- PICTURE OF HUB AND STORE AND DISPATCH ACTIONS 1.

### Effects<a name="effects"></a>

- When initializing a `Hub` we can declare effects. The hub can listen for various actions and perform side-effects as needed. The effects are additional reactive streams registered stores are listening too.

- PICTURE of hub
  - example?

### Scoped Effects<a name="scoped-effects">

- We can also dynamically create effect streams scoped to a particular ACTION when an action is dispatch.

  - picture
    - example?
```
{ type: UPDATE_TODO }
```
Then you would 

In Hubfx we can declare a scoped 





- # 2023 09 12 (Thurs)
  - documentation
  - Description
  - Core concepts
    - hub
    - scoped effects
      - key

    - diagram

# Motivation:

1. Current UI Library/Frameworks still require us to imperatively manage state

- examples:

  - in react we still use the setter from useState hook

  - in angular many developers still handle state by managing a component class property

- this leaves the door open for implicit depedencies resulting to unexpected side-effects and ultimately unexpected behaviour.

1. application state and business logic is coupled with rendering libraries

- How did we get there?

  - we use to have MVC but then we went the component route

    - good but then we coupled business logic with the view and presentation in component classes/functions

- buisness logic is hard to reuse

- business logic is hard to test without rendering the component

# Proposed solution

- model application state as reactive streams with rxjs allowing us to:

  - decouple application state and business logic from rendering libraries/frameworks

    - we can separate concerns and test our application logic via streams

- this new model can be bound with any UI library for rendering


1. Update config api so we don't need type property

1. Documentation
  1. Hubfx core
  - motivation/problem
  - solution
  - core concepts
  - docs
    - how to bind to react
    - how to bind to angular
    - how to bind to vue?
  - api


# TODOS

1. Forms
  - API

1. forms with react

1. set up cicd

## CLEAN UP TODOS
- why is lint function not picking up type errors that jest ts is?

### FORMS

1. add test cases formsReducer for testing as a whole

1. SHOULD INITIALIZE and async validate at beginning?

1. better way to copy compare objects than JSON STRINGIFY?

1. remove submitting property on Form Group?

1. is it reliable that controlRef can be independently scoped from what the control/data actaully are?

  - the scopedEffects timeout can help with this maybe

### Other Items
1. Documentation

1. update config interface to not need the type property?

  - one way in one way out rule

1. and a idle timeout for scopedEffects

1. add a tap option for neccessary side effects

- timeout solved it

1. Clean up initil state builder method

1. reduce boilerplate some how?

1. some tests for hub state


### React project 

1. binding hooks and form components

1. default props? can we make the components as dumb as possible

1. Bug in react use effect on component mount, wrapper not receivign firs dispatch message
