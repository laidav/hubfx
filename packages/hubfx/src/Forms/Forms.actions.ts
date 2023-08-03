import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../Models/Action';
import {
  ControlChange,
  ControlAsyncValidationResponse,
  AbstractControl,
  ControlRef,
  FormControlType,
} from './Models/Forms';
import { getFormControl } from './FormsReducer.reducer';
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
        actions$: Observable<Action<ControlChange<T, unknown>>>,
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
  controlChange: ControlChange<T, S>,
): Action<ControlChange<T, S>>[] => {
  const { state, controlRef } = controlChange;
  const formControl = getFormControl(controlRef, state);

  const formControls = controlRef.reduce(
    (acc, key) => {
      const currentRef = acc.currentRef.concat(key);
      const formControls = acc.formControls.concat(
        getFormControl(currentRef, state),
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

  const actions = formControls.reduce(
    (acc: Action<ControlChange<T, S>>[], formControl) => {
      let type: string;
      switch (formControl.config.controlType) {
        case FormControlType.Group:
          type = FORMS_GROUP_VALUE_CHANGE;
          break;
        case FormControlType.Array:
          type = FORMS_ARRAY_VALUE_CHANGE;
          break;
        default:
          type = FORMS_CONTROL_CHANGE;
      }

      return acc.concat({
        type,
        key: controlChange.controlRef.join(':'),
        payload: controlChange,
        scopedEffects: getScopedEffectsForControl(formControl),
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
