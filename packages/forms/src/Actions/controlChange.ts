import { Action } from '@hubfx/core';
import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { ControlChange } from '../Models/Payloads';
import { getAncestorControls } from '../FormsReducer.reducer';
import { getValueChangeEffects } from './ValueChange';

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const controlChange = <T, S>(
  controlChange: ControlChange<T>,
  state: AbstractControl<S>,
  reducer: (
    state: AbstractControl<S>,
    action: Action<unknown>,
  ) => AbstractControl<S>,
): (Action<ControlChange<T>> | Action<ControlRef>)[] => {
  const { controlRef } = controlChange;
  const mainAction: Action<ControlChange<T>> = {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  };

  const newState = reducer(state, mainAction);
  const formControls = getAncestorControls(controlRef, newState);
  const effects = getValueChangeEffects(formControls);

  const actions = [mainAction, ...effects];

  return actions;
};
