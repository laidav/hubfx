import React, { PropsWithChildren } from 'react';
import { HubFactory, Hub } from '@hubfx/core';
import { buildReducer } from '@hubfx/forms';
import { AbstractControlConfig } from '@hubfx/forms';
import { useObservable } from '../Hooks/useObservable';

const FormContext = React.createContext(null);

interface FormProps extends PropsWithChildren {
  formConfig: AbstractControlConfig;
  hub: Hub;
}

const Form = ({ formConfig, hub = HubFactory(), children }: FormProps) => {
  const state = useObservable(hub.store({ reducer: buildReducer(formConfig) }));
  return (
    <FormContext.Provider value={{ state, dispatch: hub.dispatch }}>
      {children}
    </FormContext.Provider>
  );
};
export default Form;
