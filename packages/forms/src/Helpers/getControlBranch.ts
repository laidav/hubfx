import { AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getFormControl } from './getFormControl';
import { getAncestorControls } from './getAncestorControls';
import { getChildControls } from './getChildControls';

export const getControlBranch = (
  controlRef: ControlRef,
  form: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  const ancestors = getAncestorControls(controlRef, form);
  const childControls = getChildControls(
    getFormControl(controlRef, form),
  ).slice(1);

  return ancestors.concat(childControls);
};
