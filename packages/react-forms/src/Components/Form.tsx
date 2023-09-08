import React from 'react';
import { HubFactory, Hub, Dispatcher, Reducer } from '@hubfx/core';
import { buildReducer, AbstractControl } from '@hubfx/forms';
import { AbstractControlConfig } from '@hubfx/forms';
import { useObservable } from '../Hooks/useObservable';

export const FormContext = React.createContext(null) as React.Context<{
  state: AbstractControl<unknown>;
  dispatch: Dispatcher;
  reducer: Reducer<AbstractControl<unknown>>;
}>;

interface FormProps {
  formConfig: AbstractControlConfig;
  hub?: Hub;
  children?: (state: AbstractControl<unknown>, hub: Hub) => React.ReactNode;
}

export const Form = ({
  formConfig,
  hub = HubFactory(),
  children,
}: FormProps) => {
  const state = useObservable(hub.store({ reducer: buildReducer(formConfig) }));

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch: hub.dispatch,
        reducer: buildReducer(formConfig),
      }}
    >
      {state !== undefined && children && children(state, hub)}
    </FormContext.Provider>
  );
};
