import React, { useContext } from 'react';
import {
  AbstractControl,
  ControlRef,
  FormArray as IFormArray,
  getControl,
} from '@hubfx/forms';
import { Form, FormContext } from './Form';

export interface FormArrayChildrenProps {
  controls: AbstractControl<unknown>[];
}

export interface FormArrayProps {
  component: React.JSXElementConstructor<unknown>;
  controlRef: ControlRef;
  children?: (props: FormArrayChildrenProps) => React.ReactNode;
}

export const FormArray = ({ controlRef, children }: FormArrayProps) => {
  const { state } = useContext(FormContext);
  const { controls } = getControl(controlRef, state) as IFormArray<unknown>;
  return <div>{children && children({ controls })}</div>;
};
