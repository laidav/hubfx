import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormControl } from '../Helpers/getFormControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';

export const resetControl = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  if (!controlRef.length) {
    return {
      pristineControl: state.pristineControl,
      ...state.pristineControl,
    };
  }

  const parentRef = controlRef.slice(0, -1);
  const newState = cloneDeep(state);

  const control = getFormControl(controlRef, newState);
  const parentControl = getFormControl(parentRef, newState) as
    | FormGroup<unknown>
    | FormArray<unknown>;
  parentControl.controls[controlRef.slice(-1)[0]] = {
    pristineControl: control.pristineControl,
    ...control.pristineControl,
  };

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
