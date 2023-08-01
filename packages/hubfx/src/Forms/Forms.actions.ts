import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { ControlChange, ControlAsyncValidationResponse } from './Models/Forms';
import { getFormControl } from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';
import { FormErrors } from './Models/Forms';

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const controlChange = <T, S>(
  controlChange: ControlChange<T, S>,
): Action<ControlChange<T, S>> => {
  const { state, controlRef } = controlChange;
  const { config } = getFormControl(controlRef, state);
  const { asyncValidators } = config;

  let scopedEffects: Effect<unknown, FormErrors>[];

  if (asyncValidators && asyncValidators.length) {
    scopedEffects = asyncValidators.reduce((acc, validator) => {
      const effect: Effect<unknown, FormErrors> = (
        actions$: Observable<Action<ControlChange<T, S>>>,
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
  }

  return {
    type: FORMS_CONTROL_CHANGE,
    key: controlChange.controlRef.join(':'),
    payload: controlChange,
    scopedEffects,
  };
};

export const FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS =
  'FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS';
export const asyncValidationResponseSuccess = (
  payload: ControlAsyncValidationResponse,
): Action<ControlAsyncValidationResponse> => ({
  type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  payload,
});
