import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';
import { FormGroup, AbstractControl } from '../Models/Controls';
import { AddControl } from '../Models/Payloads';
import { FormControlType } from '../Models/FormControlType';
import { buildControlState } from '../Helpers/buildControlState';
import { getControl } from '../Helpers/getControl';

export const addFormGroupControl = <T>(
  state: AbstractControl<T>,
  { payload: { controlRef, config } }: Action<AddControl>,
) => {
  const newState = cloneDeep(state);
  const newControl = getControl(
    controlRef.slice(0, -1),
    newState,
  ) as FormGroup<unknown>;

  if (newControl.config.controlType !== FormControlType.Group) {
    throw 'The control this is being added to is not a FormGroup control';
  }

  newControl.controls[controlRef.slice(-1)[0]] = buildControlState(
    config,
    controlRef,
  );

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
