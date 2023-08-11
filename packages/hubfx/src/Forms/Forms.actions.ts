import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import {
  ControlChange,
  ControlAsyncValidationResponse,
  AbstractControl,
  AbstractControlConfig,
  ControlRef,
  FormGroupAddControl,
  RemoveControl,
  FormArrayAddControl,
} from './Models/Forms';
import { getControlBranch, getFormControl } from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';
import { FormErrors } from './Models/Forms';

const getScopedEffectsForControl = <T>(
  formControl: AbstractControl<T>,
): Effect<AbstractControl<T>, FormErrors>[] => {
  const { config, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<AbstractControl<T>, FormErrors>[];

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

    return scopedEffects;
  }
};

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const FORMS_VALUE_CHANGE_EFFECT = 'FORMS_ARRAY_VALUE_CHANGE_EFFECT';

const getValueChangeEffects = (formControls: AbstractControl<unknown>[]) =>
  formControls.reduce((acc: Action<ControlRef>[], control) => {
    const { controlRef } = control;

    return acc.concat({
      type: FORMS_VALUE_CHANGE_EFFECT,
      key: controlRef.join(':'),
      payload: control.controlRef,
      scopedEffects: getScopedEffectsForControl(control),
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
  const newState = reducer(state, {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  });
  const formControls = getControlBranch(controlRef, newState);
  const effects = getValueChangeEffects(formControls);

  const actions: (Action<ControlChange<T>> | Action<ControlRef>)[] = [
    {
      type: FORMS_CONTROL_CHANGE,
      payload: controlChange,
    },
    ...effects,
  ];

  return actions;
};

export const FORMS_ADD_GROUP_CONTROL = 'FORMS_ADD_GROUP_CONTROL';
export const addGroupControl = <T>(
  config: AbstractControlConfig,
  controlRef: ControlRef,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const actions = [
    {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: {
        config,
        controlRef,
      } as FormGroupAddControl,
    },
  ];

  return actions;
};

export const FORMS_ADD_FORM_ARRAY_CONTROL = 'FORMS_ADD_FORM_ARRAY_CONTROL';
export const addFormArrayControl = <T>(
  controlRef: ControlRef,
  initialValue,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const actions = [
    {
      type: FORMS_ADD_FORM_ARRAY_CONTROL,
      payload: {
        initialValue,
        controlRef,
      } as FormArrayAddControl<unknown>,
    },
  ];

  return actions;
};

export const FORMS_REMOVE_CONTROL = 'FORMS_REMOVE_CONTROL';
export const removeControl = <T>(
  controlRef: ControlRef,
  reducer: (
    state: AbstractControl<T>,
    action: Action<unknown>,
  ) => AbstractControl<T>,
) => {
  const actions = [
    {
      type: FORMS_REMOVE_CONTROL,
      payload: {
        controlRef,
      },
    } as Action<RemoveControl>,
  ];

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
