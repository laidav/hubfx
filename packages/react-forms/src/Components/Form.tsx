import React from 'react';
import { HubFactory, Hub } from '@hubfx/core';
import { buildReducer, AbstractControl } from '@hubfx/forms';
import { AbstractControlConfig } from '@hubfx/forms';
import { useObservable } from '../Hooks/useObservable';

const FormContext = React.createContext(null);

interface FormProps {
  formConfig: AbstractControlConfig;
  hub: Hub;
  children: (state: AbstractControl<unknown>) => React.ReactNode;
}

const Form = ({ formConfig, hub = HubFactory(), children }: FormProps) => {
  const state = useObservable(hub.store({ reducer: buildReducer(formConfig) }));
  return (
    <FormContext.Provider value={{ state, dispatch: hub.dispatch }}>
      {children(state)}
    </FormContext.Provider>
  );
};
export default Form;
