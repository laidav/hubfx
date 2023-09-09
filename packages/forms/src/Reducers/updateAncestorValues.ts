import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { FormControlType } from '../Models/FormControlType';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';

export const FORMS_UPDATE_ANCESTOR_VALUES = 'FORMS_UPDATE_ANCESTOR_VALUES';
export const updateAncestorValues = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
): AbstractControl<T> => {
  if (!controlRef.length) return state;

  const newState = cloneDeep(state);
  const control = getControl(controlRef, newState);
  const value = control?.value;
  const [key] = controlRef.slice(-1);
  const parentRef = controlRef.slice(0, -1);
  const parentControl = getControl(parentRef, newState);

  if (parentControl.config.controlType === FormControlType.Group) {
    (<FormGroup<unknown>>parentControl).value = {
      ...(<FormGroup<unknown>>parentControl.value),
      [key]: value,
    };
  } else if (parentControl.config.controlType === FormControlType.Array) {
    (<FormArray<unknown[]>>parentControl).value = (<FormArray<unknown[]>>(
      parentControl
    )).controls.map((control) => control.value);
  }

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: parentRef,
  });
};
