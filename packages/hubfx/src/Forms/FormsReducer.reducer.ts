import cloneDeep from 'lodash.clonedeep';
import { Action } from '../Models/Action';
import {
  FORMS_CONTROL_CHANGE,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  FORMS_VALUE_CHANGE_EFFECT,
} from './Forms.actions';
import {
  FormControl,
  FormArray,
  FormGroup,
  ControlChange,
  AbstractControl,
  FormErrors,
  FormGroupAddControl,
  FormControlType,
} from './Models/Forms';
import { ControlAsyncValidationResponse } from './Models/Forms';
import { ControlRef } from './Models/Forms';
import { buildControlState } from './buildControlState';

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

export const getControlBranch = (
  controlRef: ControlRef,
  form: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  const formControls = controlRef.reduce(
    (acc, key) => {
      const currentRef = acc.currentRef.concat(key);
      const formControls = acc.formControls.concat(
        getFormControl(currentRef, form),
      );
      return {
        currentRef,
        formControls,
      };
    },
    {
      currentRef: [] as ControlRef,
      formControls: [] as AbstractControl<unknown>[],
    },
  ).formControls;

  return [form].concat(formControls);
};
export const updateValues = <T>(
  control: AbstractControl<T>,
  { payload: { controlRef, value } }: Action<ControlChange<unknown>>,
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
      {
        type: FORMS_CONTROL_CHANGE,
        payload: { controlRef: newRef || [], value },
      },
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
      {
        type: FORMS_CONTROL_CHANGE,
        payload: { controlRef: newRef || [], value },
      },
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

export const addFormGroupControl = <T>(
  state: AbstractControl<T>,
  { payload: { controlRef, config } }: Action<FormGroupAddControl>,
) => {
  const newState = cloneDeep(state);
  const newControl = getFormControl(
    controlRef.slice(0, -1),
    newState,
  ) as FormGroup<unknown>;

  if (newControl.config.controlType !== FormControlType.Group) {
    throw 'The control this is being added to is not a FormGroup control';
  }

  newControl.controls[controlRef.slice(-1)[0]] = buildControlState(config);

  return newState;
};

export const handleAsyncValidation = <T>(
  state: AbstractControl<T>,
  action: Action<ControlRef>,
): AbstractControl<T> => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const newControlBranch = getControlBranch(action.payload, newState);

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

const isControlValidating = (control: AbstractControl<unknown>): boolean => {
  if (!control.asyncValidateInProgress) return false;

  return Object.values(control.asyncValidateInProgress).some(
    (validating) => validating,
  );
};

export const handleAsyncValidationResponseSuccess = <T>(
  state: AbstractControl<T>,
  {
    payload: { controlRef, validatorIndex, errors },
  }: Action<ControlAsyncValidationResponse>,
): AbstractControl<T> => {
  const newState = cloneDeep(state) as AbstractControl<T>;
  const controlBranch = getControlBranch(controlRef, newState);

  controlBranch.reverse().forEach((control, index) => {
    if (index === 0) {
      control.asyncValidateInProgress[validatorIndex] = false;
      control.errors = {
        ...control.errors,
        ...errors,
      };
    }
    const validating =
      isControlValidating(control) ||
      Boolean(controlBranch[index - 1]?.validating);
    control.validating = validating;
  });

  return newState;
};

export const formsReducer = <T>(
  state: AbstractControl<T>,
  action: Action<unknown>,
): AbstractControl<T> => {
  switch (action.type) {
    case FORMS_CONTROL_CHANGE:
      const result = syncValidate(
        updateValues(state, action as Action<ControlChange<unknown>>),
      );

      return result;
    case FORMS_VALUE_CHANGE_EFFECT:
      return handleAsyncValidation(state, action as Action<ControlRef>);
    case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
      return syncValidate(
        handleAsyncValidationResponseSuccess(
          state,
          action as Action<ControlAsyncValidationResponse>,
        ),
      );

    default:
      return state;
  }
};
