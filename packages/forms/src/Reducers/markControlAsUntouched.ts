import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormControl } from '../Helpers/getFormControl';
import { getChildControls } from '../Helpers/getChildControls';

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
