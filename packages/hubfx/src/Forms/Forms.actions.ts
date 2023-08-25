import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import {
  ControlChange,
  ControlAsyncValidationResponse,
  AbstractControl,
  ControlRef,
  AddControl,
  FormArray,
} from './Models/Forms';
import {
  getAncestorControls,
  getFormControl,
  getControlBranch,
} from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';
import { FormErrors } from './Models/Forms';

const getScopedEffectsForControl = <T>(
  formControl: AbstractControl<T>,
): Effect<AbstractControl<T>, FormErrors>[] => {
  const { config, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<AbstractControl<T>, FormErrors>[] = [];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce(
      (
        acc: Effect<AbstractControl<T>, FormErrors>[],
        validator,
        validatorIndex,
      ) => {
        const effect: Effect<AbstractControl<T>, FormErrors> = (
          actions$: Observable<Action<AbstractControl<T>>>,
        ) => {
          return actions$
            .pipe(map(({ payload: newControlState }) => newControlState))
            .pipe(
              validator,
              map((errors) =>
                asyncValidationResponseSuccess({
                  controlRef,
                  errors,
                  validatorIndex,
                }),
              ),
            );
        };

        return acc.concat(effect);
      },
      [],
    );
  }
  return scopedEffects;
};

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const FORMS_VALUE_CHANGE_EFFECT = 'FORMS_ARRAY_VALUE_CHANGE_EFFECT';

const getValueChangeEffects = (formControls: AbstractControl<unknown>[]) =>
  formControls.reduce((acc: Action<ControlRef>[], control) => {
    const { controlRef } = control;

    return acc.concat({
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: control.controlRef,
      scopedEffects: {
        key: controlRef.join(':'),

        effects: getScopedEffectsForControl(control),
      },
    });
  }, []);

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

export const FORMS_ADD_GROUP_CONTROL = 'FORMS_ADD_GROUP_CONTROL';
export const addGroupControl = <T>(
  { controlRef, config }: AddControl,
  state,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
): (Action<AddControl> | Action<ControlRef>)[] => {
  const mainAction: Action<AddControl> = {
    type: FORMS_ADD_GROUP_CONTROL,
    payload: { controlRef, config },
  };
  const newState = reducer(state, mainAction);
  const formControls = getControlBranch(controlRef, newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};

export const FORMS_ADD_FORM_ARRAY_CONTROL = 'FORMS_ADD_FORM_ARRAY_CONTROL';
export const addFormArrayControl = <T>(
  { controlRef, config }: AddControl,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<AddControl> = {
    type: FORMS_ADD_FORM_ARRAY_CONTROL,
    payload: { controlRef, config },
  };

  const newState = reducer(state, mainAction);
  const index =
    (<FormArray<unknown>>getFormControl(controlRef, newState)).controls.length -
    1;
  const formControls = getControlBranch(controlRef.concat(index), newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};

export const FORMS_REMOVE_CONTROL = 'FORMS_REMOVE_CONTROL';
export const removeControl = <T>(
  controlRef: ControlRef,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<ControlRef> = {
    type: FORMS_REMOVE_CONTROL,
    payload: controlRef,
  };
  const newState = reducer(state, mainAction);
  const formControls = getAncestorControls(controlRef.slice(0, -1), newState);
  const effects = getValueChangeEffects(formControls);
  const actions = [mainAction, ...effects];

  return actions;
};

export const FORMS_RESET_CONTROL = 'FORMS_RESET_CONTROL';
export const resetControl = <T>(
  controlRef: ControlRef,
  state: AbstractControl<T>,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const mainAction: Action<ControlRef> = {
    type: FORMS_RESET_CONTROL,
    payload: controlRef,
  };

  const newState = reducer(state, mainAction);
  const formControls = getControlBranch(controlRef, newState);
  const effects = getValueChangeEffects(formControls);

  const actions = [mainAction, ...effects];

  return actions;
};

export const FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS =
  'FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS';
export const asyncValidationResponseSuccess = (
  payload: ControlAsyncValidationResponse,
): Action<ControlAsyncValidationResponse> => ({
  type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  payload,
});

export const FORMS_MARK_CONTROL_AS_PRISTINE = 'FORMS_MARK_CONTROL_AS_PRISTINE';
export const markControlAsPristine = (
  controlRef: ControlRef,
): Action<ControlRef> => {
  return {
    type: FORMS_MARK_CONTROL_AS_PRISTINE,
    payload: controlRef,
  };
};

export const FORMS_MARK_CONTROL_AS_TOUCHED = 'FORMS_MARK_CONTROL_AS_TOUCHED';
export const markControlAsTouched = (
  controlRef: ControlRef,
): Action<ControlRef> => {
  return {
    type: FORMS_MARK_CONTROL_AS_TOUCHED,
    payload: controlRef,
  };
};

export const FORMS_MARK_CONTROL_AS_UNTOUCHED =
  'FORMS_MARK_CONTROL_AS_UNTOUCHED';
export const markControlAsUntouched = (
  controlRef: ControlRef,
): Action<ControlRef> => ({
  type: FORMS_MARK_CONTROL_AS_UNTOUCHED,
  payload: controlRef,
});
