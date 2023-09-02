import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormControl } from '../Helpers/getFormControl';
import { getChildControls } from '../Helpers/getChildControls';

export const markControlAsPristine = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  const newState = cloneDeep(state);
  const control = getFormControl(controlRef, newState);
  const controls = getChildControls(control);

  controls.forEach((control) => {
    const pristineControl: AbstractControl<unknown> = cloneDeep(control);
    delete pristineControl.pristineControl;
    control.pristineControl = pristineControl;
  });

  return newState;
};
