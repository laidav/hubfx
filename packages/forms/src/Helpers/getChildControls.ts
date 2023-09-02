import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { FormControlType } from '../Models';

export const getChildControls = (
  control: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  if (control.config.controlType === FormControlType.Group) {
    return [control].concat(
      Object.values((<FormGroup<unknown>>control).controls).reduce(
        (acc: AbstractControl<unknown>[], control) =>
          acc.concat(getChildControls(control)),
        [],
      ),
    );
  } else if (control.config.controlType === FormControlType.Array) {
    return [control].concat(
      (<FormArray<unknown>>control).controls.reduce(
        (
          acc: AbstractControl<unknown>[],
          control,
        ): AbstractControl<unknown>[] => acc.concat(getChildControls(control)),
        [],
      ),
    );
  }
  return [control];
};
