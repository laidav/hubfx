import cloneDeep from 'lodash.clonedeep';
import { Action } from '../Models/Action';
import {
  FORMS_CONTROL_CHANGE,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  FORMS_VALUE_CHANGE_EFFECT,
  FORMS_ADD_GROUP_CONTROL,
  FORMS_ADD_FORM_ARRAY_CONTROL,
  FORMS_REMOVE_CONTROL,
  FORMS_RESET_CONTROL,
} from './Forms.actions';
import {
  FormControl,
  FormArray,
  FormGroup,
  ControlChange,
  AbstractControl,
  FormErrors,
  RemoveControl,
  FormControlType,
  AddControl,
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
      JSON.stringify(control.value) !==
      JSON.stringify(control.pristineControl.value),
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

export const getAncestorControls = (
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

export const getChildControls = (
  control: AbstractControl<unknown>,
): AbstractControl<unknown>[] => {
  if (control.config.controlType === FormControlType.Group) {
    return [control].concat(
      Object.values((<FormGroup<unknown>>control).controls).reduce(
        (acc, control) => acc.concat(getChildControls(control)),
        [],
      ),
    );
  } else if (control.config.controlType === FormControlType.Array) {
    return [control].concat(
      (<FormArray<unknown>>control).controls.reduce(
        (acc, control) => acc.concat(getChildControls(control)),
        [],
      ),
    );
  }
  return [control];
};

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

export const updateValues = <T>(
  state: AbstractControl<T>,
  { payload: { controlRef, value } }: Action<ControlChange<unknown>>,
): AbstractControl<T> => {
  const newState = cloneDeep(state);
  const newControl = getFormControl(controlRef, newState);
  newControl.value = value;

  const updatedAncestorsState = updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });

  return updateChildValues(updatedAncestorsState);
};

const FORMS_UPDATE_ANCESTOR_VALUES = 'FORMS_UPDATE_ANCESTOR_VALUES';
const updateAncestorValues = <T>(
  state: AbstractControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  if (!controlRef.length) return state;

  const newState = cloneDeep(state);
  const control = getFormControl(controlRef, newState);
  const value = control?.value;
  const [key] = controlRef.slice(-1);
  const parentRef = controlRef.slice(0, -1);
  const parentControl = getFormControl(parentRef, newState);

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

const updateChildValues = <T>(state: AbstractControl<T>) => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const value = newState.value;
  if (newState.config.controlType === FormControlType.Group) {
    if (
      Object.keys(value).length !==
      Object.keys((<FormGroup<T>>newState).controls).length
    ) {
      throw `The number of keys do not match form group: ${newState.controlRef.join(
        ',',
      )}`;
    }
    Object.entries(value).forEach(([key, value]) => {
      if (!(<FormGroup<T>>newState).controls[key]) {
        throw `Cannot find control with key ${key} in form group: ${newState.controlRef.join(
          ',',
        )}`;
      }
      (<FormGroup<T>>newState).controls[key].value = value;
      (<FormGroup<T>>newState).controls[key] = updateChildValues(
        (<FormGroup<T>>newState).controls[key],
      );
    });
  } else if (newState.config.controlType === FormControlType.Array) {
    (<FormArray<T>>newState).controls.forEach((control, index) => {
      if (!Array.isArray(value)) {
        throw `value must be an array for form array: ${newState.controlRef.join(
          ',',
        )}`;
      }

      if (
        (<Array<unknown>>value).length !==
        (<FormArray<T>>newState).controls.length
      ) {
        throw `The number of value items does not match the number of controls in array: ${newState.controlRef.join(
          ',',
        )}`;
      }
      control.value = value[index];
      (<FormArray<T>>newState).controls[index] = updateChildValues(control);
    });
  }

  return newState;
};

export const addFormGroupControl = <T>(
  state: AbstractControl<T>,
  { payload: { controlRef, config } }: Action<AddControl>,
) => {
  const newState = cloneDeep(state);
  const newControl = getFormControl(
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

export const addFormArrayControl = <T>(
  state: AbstractControl<T>,
  { payload: { config, controlRef } }: Action<AddControl>,
) => {
  const newState = cloneDeep(state);

  const arrayControl = getFormControl(
    controlRef,
    newState,
  ) as FormArray<unknown>;

  const newIndex = arrayControl.controls.length
    ? arrayControl.controls.length
    : 0;

  arrayControl.controls = arrayControl.controls.concat(
    buildControlState(config, controlRef.concat(newIndex)),
  );

  arrayControl.value = arrayControl.controls.map(({ value }) => value);

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};

const reindexControl = (
  control: AbstractControl<unknown>,
  arrayRef: ControlRef,
  newIndex: number,
) => {
  const newControl = cloneDeep(control);
  if (newControl.config.controlType === FormControlType.Group) {
    Object.entries((<FormGroup<unknown>>newControl).controls).forEach(
      ([key, control]) => {
        newControl.controls[key] = reindexControl(control, arrayRef, newIndex);
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
  { payload: { controlRef } }: Action<RemoveControl>,
) => {
  if (!getFormControl(controlRef, state)) {
    throw 'Control not found';
  }

  if (!controlRef.length) return state;

  const newState = cloneDeep(state);

  const parentControl = getFormControl(controlRef.slice(0, -1), newState);
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

export const handleAsyncValidation = <T>(
  state: AbstractControl<T>,
  action: Action<ControlRef>,
): AbstractControl<T> => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const newControlBranch = getAncestorControls(action.payload, newState);

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
  const controlBranch = getAncestorControls(controlRef, newState);

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
      return updateDirty(
        syncValidate(
          updateValues(state, action as Action<ControlChange<unknown>>),
        ),
      );
    case FORMS_VALUE_CHANGE_EFFECT:
      return handleAsyncValidation(state, action as Action<ControlRef>);
    case FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS:
      return syncValidate(
        handleAsyncValidationResponseSuccess(
          state,
          action as Action<ControlAsyncValidationResponse>,
        ),
      );
    case FORMS_ADD_GROUP_CONTROL:
      return updateDirty(
        syncValidate(addFormGroupControl(state, action as Action<AddControl>)),
      );
    case FORMS_ADD_FORM_ARRAY_CONTROL:
      return updateDirty(
        syncValidate(addFormArrayControl(state, action as Action<AddControl>)),
      );
    case FORMS_REMOVE_CONTROL:
      return updateDirty(
        syncValidate(removeControl(state, action as Action<RemoveControl>)),
      );
    case FORMS_RESET_CONTROL:
      return updateDirty(
        syncValidate(resetControl(state, action as Action<ControlRef>)),
      );

    default:
      return state;
  }
};
