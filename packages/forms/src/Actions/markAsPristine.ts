import { Action } from '../Models/Action';
import { ControlRef } from '../Models/ControlRef';
export const FORMS_MARK_CONTROL_AS_PRISTINE = 'FORMS_MARK_CONTROL_AS_PRISTINE';
export const markControlAsPristine = (
  controlRef: ControlRef,
): Action<ControlRef> => {
  return {
    type: FORMS_MARK_CONTROL_AS_PRISTINE,
    payload: controlRef,
  };
};
