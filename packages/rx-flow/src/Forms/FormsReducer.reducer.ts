import cloneDeep from 'lodash.clonedeep';
import { Action } from '../Models/Action';
import {
  FORMS_CONTROL_CHANGE,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
} from './Forms.actions';
import {
  FormControl,
  FormArray,
  FormGroup,
  ControlChange,
  AbstractControl,
  FormErrors,
} from './Models/Forms';
import { ControlAsyncValidationResponse } from './Models/Forms';
import { ControlRef } from './Models/Forms';

export const syncValidate = <T>(
  control: AbstractControl<T>,
): AbstractControl<T> => {
  let newControl: AbstractControl<T> = {
    ...control,
  };

  let controlsHasErrors = false;

  if (Array.isArray((<FormArray<T>>control).controls)) {
    const controls = (<FormArray<T>>control).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => syncValidate(control)),
    } as FormArray<T>;

    controlsHasErrors = (<FormArray<T>>newControl).controls.some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });
  } else if ((<FormGroup<T>>control).controls) {
    const controls = (<FormGroup<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (
          result: { [key: string]: AbstractControl<unknown> },
          [key, control],
        ) => {
          result[key] = syncValidate(control);
          return result;
        },
        {},
      ),
    } as FormGroup<T>;

    controlsHasErrors = Object.values((<FormGroup<T>>newControl).controls).some(
      (control) => {
        if (control.errors) {
          return Object.values(control.errors).some((error) => error);
        }

        return false;
      },
    );
  }

  const validators = control.config.validators;
  const errors = validators?.reduce((errors, validator) => {
    return {
      ...errors,
      ...validator(control.value),
    };
  }, {} as FormErrors);

  const groupControlHasError = errors
    ? Object.values(errors).some((error) => error)
    : false;

  return {
    ...newControl,
    errors,
    valid: !groupControlHasError && !controlsHasErrors,
  };
};

export const updateDirty = <T>(
  control: AbstractControl<T>,
): AbstractControl<T> => {
  let newControl: AbstractControl<T> = {
    ...control,
    dirty:
      JSON.stringify(control.value) !== JSON.stringify(control.pristineValue),
  };

  if (Array.isArray((<FormArray<T>>control).controls)) {
    const controls = (<FormArray<T>>control).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => updateDirty(control)),
    } as FormArray<T>;
  } else if ((<FormGroup<T>>control).controls) {
    const controls = (<FormGroup<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (
          result: { [key: string]: AbstractControl<unknown> },
          [key, control],
        ) => {
          result[key] = updateDirty(control);
          return result;
        },
        {},
      ),
    } as FormGroup<T>;
  }

  return newControl;
};

export const getFormControl = (
  controlRef: ControlRef,
  control: AbstractControl<unknown>,
): AbstractControl<unknown> => {
  if (!controlRef.length) {
    return control;
  }

  const result: FormControl<unknown> = controlRef.reduce(
    (acc, key): AbstractControl<unknown> => {
      if (typeof key === 'string') {
        return (<FormGroup<unknown>>acc).controls[key];
      }

      return (<FormArray<unknown>>acc).controls[key];
    },
    control,
  );

  return result;
};

export const updateValues = <T>(
  control: AbstractControl<T>,
  controlRef: ControlRef,
  value: unknown,
): AbstractControl<T> => {
  if (!controlRef.length) {
    return { ...control, value: value as T };
  }

  let newControl: AbstractControl<T> = { ...control };
  const newRef = controlRef.slice();
  newRef.shift();

  if (Array.isArray((<FormArray<T>>newControl).controls)) {
    const newControls = (<FormArray<T>>newControl).controls.slice();
    newControls[controlRef[0] as number] = updateValues(
      newControls[controlRef[0] as number],
      newRef || [],
      value,
    );

    newControl = {
      ...newControl,
      controls: newControls,
      value: newControls.map((control) => control.value),
    } as FormArray<T>;
  } else if ((<FormGroup<T>>control).controls) {
    const newControls = {
      ...(<FormGroup<T>>control).controls,
    };
    newControls[controlRef[0] as string] = updateValues(
      newControls[controlRef[0] as string],
      newRef || [],
      value,
    );

    newControl = {
      ...newControl,
      controls: newControls,
      value: Object.entries(newControls).reduce(
        (result: { [key: string]: unknown }, [key, control]) => {
          result[key] = control.value;
          return result;
        },
        {},
      ) as T,
    };
  }

  return newControl;
};

export const handleAsyncValidationResponseSuccess = <T>(
  control: AbstractControl<T>,
  controlRef: ControlRef,
  errors: FormErrors,
): AbstractControl<T> => {
  const newState = cloneDeep(control) as AbstractControl<T>;

  const newControl = getFormControl(controlRef, newState);
  newControl.validating = false;
  newControl.errors = {
    ...newControl.errors,
    ...errors,
  };

  return newState;
};

export const formsReducer = <T>(
  state: AbstractControl<T>,
  action: Action<unknown>,
): AbstractControl<T> => {
  switch (action.type) {
    case FORMS_CONTROL_CHANGE:
      const { controlRef, value } = <ControlChange<unknown, FormControl<T>>>(
        action.payload
      );

      const result = syncValidate(updateValues(state, controlRef, value));

      return result;
    case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
      const { controlRef: asyncValidationCtrlRef, errors } = <
        ControlAsyncValidationResponse
      >action.payload;

      return syncValidate(
        handleAsyncValidationResponseSuccess(
          state,
          asyncValidationCtrlRef,
          errors,
        ),
      );

    default:
      return state;
  }
};
