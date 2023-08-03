import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import {
  ControlChange,
  ControlAsyncValidationResponse,
  AbstractControl,
  FormControlType,
} from './Models/Forms';
import { getControlBranch, getFormControl } from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';
import { FormErrors } from './Models/Forms';

const getScopedEffectsForControl = <T>(
  formControl: AbstractControl<T>,
): Effect<T, FormErrors>[] => {
  const { config, controlRef } = formControl;
  const { asyncValidators } = config;

  let scopedEffects: Effect<unknown, FormErrors>[];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce((acc, validator) => {
      const effect: Effect<T, FormErrors> = (
        actions$: Observable<Action<ControlChange<T>>>,
      ) => {
        return actions$
          .pipe(
            map((action) => {
              return action.payload.value;
            }),
          )
          .pipe(
            validator,
            map((errors) =>
              asyncValidationResponseSuccess({ controlRef, errors }),
            ),
          );
      };

      return acc.concat(effect);
    }, []);

    return scopedEffects;
  }
};

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const FORMS_GROUP_VALUE_CHANGE = 'FORMS_GROUP_VALUE_CHANGE';
export const FORMS_ARRAY_VALUE_CHANGE = 'FORMS_ARRAY_VALUE_CHANGE';
export const controlChange = <T, S>(
  controlChange: ControlChange<T>,
  state: AbstractControl<S>,
  reducer: (
    state: AbstractControl<S>,
    action: Action<unknown>,
  ) => AbstractControl<S>,
): Action<ControlChange<T>>[] => {
  const { controlRef } = controlChange;
  const formControls = getControlBranch(controlRef, state);
  const newState = reducer(state, {
    type: FORMS_CONTROL_CHANGE,
    payload: controlChange,
  });

  const actions = formControls.reduce(
    (acc: Action<ControlChange<T>>[], control) => {
      let type: string;
      let payload;
      const { controlRef } = control;

      let newControlValue = getFormControl(controlRef, newState).value;

      switch (control.config.controlType) {
        case FormControlType.Group:
          type = FORMS_GROUP_VALUE_CHANGE;
          payload = {
            controlRef,
            value: newControlValue,
          };
          break;
        case FormControlType.Array:
          type = FORMS_ARRAY_VALUE_CHANGE;
          payload = {
            controlRef,
            value: newControlValue,
          };
          break;
        default:
          payload = controlChange;
          type = FORMS_CONTROL_CHANGE;
      }

      return acc.concat({
        type,
        key: controlRef.join(':'),
        payload: controlChange,
        scopedEffects: getScopedEffectsForControl(control),
      });
    },
    [],
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
