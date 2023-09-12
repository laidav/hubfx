import React, { useContext } from 'react';
import {
  AbstractControlConfig,
  AbstractControl,
  ControlRef,
  FormArray as IFormArray,
  getControl,
  addFormArrayControl,
  removeControl as removeFormArrayControl,
} from '@hubfx/forms';
import { FormContext } from './Form';

export interface FormArrayChildrenProps {
  formArray: IFormArray<unknown>;
  addControl: (config: AbstractControlConfig) => void;
  removeControl: (controlRef: ControlRef) => void;
}

export interface FormArrayProps {
  controlRef: ControlRef;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ controlRef, children }: FormArrayProps) => {
  const { state, dispatch, reducer } = useContext(FormContext);
  const formArray = getControl(controlRef, state) as IFormArray<unknown>;

  const formArrayChildrenProps: FormArrayChildrenProps = {
    formArray,
    addControl: (config: AbstractControlConfig) => {
      dispatch(...addFormArrayControl({ controlRef, config }, state, reducer));
    },
    removeControl: (controlRef: ControlRef) => {
      dispatch(...removeFormArrayControl(controlRef, state, reducer));
    },
  };

  return <div>{children && children(formArrayChildrenProps)}</div>;
};
