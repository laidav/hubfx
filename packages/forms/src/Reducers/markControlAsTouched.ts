import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from '../Helpers/getAncestorControls';
import { getChildControls } from '../Helpers/getChildControls';
import { getFormControl } from '../Helpers/getFormControl';

export const markControlAsTouched = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const ancestorControls = getAncestorControls(controlRef, newState);

  ancestorControls.forEach((control) => {
    control.touched = true;
  });

  return newState;
};

export const markControlAsUntouched = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const control = getFormControl(controlRef, newState);
  const childControls = getChildControls(control);

  childControls.forEach((control) => {
    control.touched = false;
  });

  return newState;
};
