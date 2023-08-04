import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import {
  ControlChange,
  ControlAsyncValidationResponse,
  AbstractControl,
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
      (acc: Effect<AbstractControl<T>, FormErrors>[], validator) => {
        const effect: Effect<AbstractControl<T>, FormErrors> = (
          actions$: Observable<Action<AbstractControl<T>>>,
        ) => {
          return actions$
            .pipe(map(({ payload: newControlState }) => newControlState))
            .pipe(
              validator,
              map((errors) =>
                asyncValidationResponseSuccess({ controlRef, errors }),
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
export const controlChange = <T, S>(
  controlChange: ControlChange<T>,
  state: AbstractControl<S>,
  reducer: (
    state: AbstractControl<S>,
    action: Action<unknown>,
  ) => AbstractControl<S>,
): (Action<ControlChange<T>> | Action<AbstractControl<unknown>>)[] => {
  const { controlRef } = controlChange;
  const newState = reducer(state, {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  });
  const formControls = getControlBranch(controlRef, newState);

  const actions = formControls.reduce(
    (
      acc: (Action<ControlChange<T>> | Action<AbstractControl<unknown>>)[],
      control,
    ) => {
      const { controlRef } = control;

      return acc.concat({
        type: FORMS_VALUE_CHANGE_EFFECT,
        key: controlRef.join(':'),
        payload: getFormControl(controlRef, newState),
        scopedEffects: getScopedEffectsForControl(control),
      });
    },
    [
      {
        type: FORMS_CONTROL_CHANGE,
        payload: controlChange,
      },
    ],
  );

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
