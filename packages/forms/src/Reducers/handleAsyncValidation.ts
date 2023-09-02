import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getAncestorControls } from '../Helpers/getAncestorControls';

export const handleAsyncValidation = <T>(
  state: AbstractControl<T>,
  action: Action<ControlRef>,
): AbstractControl<T> => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const newControlBranch = getAncestorControls(action.payload, newState);

  newControlBranch.forEach((control, index) => {
    control.validating = true;

    if (index === newControlBranch.length - 1) {
      control.config.asyncValidators.forEach((_, j) => {
        control.asyncValidateInProgress[j] = true;
      });
    }
  });

  return newState;
};
