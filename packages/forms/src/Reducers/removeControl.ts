import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { FormControlType } from '../Models/FormControlType';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';

const reindexControl = (
  control: AbstractControl<unknown>,
  arrayRef: ControlRef,
  newIndex: number,
) => {
  const newControl = cloneDeep(control);
  if (newControl.config.controlType === FormControlType.Group) {
    Object.entries((<FormGroup<unknown>>newControl).controls).forEach(
      ([key, control]) => {
        (<FormGroup<unknown>>newControl).controls[key] = reindexControl(
          control,
          arrayRef,
          newIndex,
        );
      },
    );
  } else if (newControl.config.controlType === FormControlType.Array) {
    (<FormArray<unknown>>newControl).controls.forEach((control, index) => {
      (<FormArray<unknown>>newControl).controls[index] = reindexControl(
        control,
        arrayRef,
        newIndex,
      );
    });
  }
  return {
    ...newControl,
    controlRef: arrayRef
      .concat(newIndex)
      .concat(control.controlRef.slice(arrayRef.length + 1)),
  };
};

export const removeControl = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  if (!getControl(controlRef, state)) {
    throw 'Control not found';
  }

  if (!controlRef.length) return state;

  const newState = cloneDeep(state);

  const parentControl = getControl(controlRef.slice(0, -1), newState);
  const key = controlRef.slice(-1)[0];

  if (parentControl.config.controlType === FormControlType.Group) {
    delete (<FormGroup<unknown>>parentControl).controls[key];
  } else if (parentControl.config.controlType === FormControlType.Array) {
    const result = (<FormArray<unknown>>parentControl).controls
      .filter((_, index) => index !== key)
      .map((control, index) =>
        reindexControl(control, parentControl.controlRef, index),
      );

    (<FormArray<unknown>>parentControl).controls = result;
  }

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
