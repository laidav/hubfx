import { Observable, combineLatest } from 'rxjs';
import { map, filter, withLatestFrom } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { FORMS_CONTROL_CHANGE } from './Forms.actions';
import { ofType } from '../Operators/ofType';
import {
  AbstractControl,
  AbstractControlConfig,
  FormGroupConfig,
  FormArrayConfig,
  ControlChange,
  FormControlType,
  FormErrors,
  ValidatorAsyncFn,
  ControlAsyncValidationResponse,
  ControlRef,
  FormsReducer,
} from './Models/Forms';
import { asyncValidationResponseSuccess } from './Forms.actions';
import { getFormControl, formsReducer } from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';
import { isChildControl } from './FormHelpers';

export const buildFormEffects = <T>(
  config: AbstractControlConfig,
): Effect<unknown, ControlAsyncValidationResponse>[] => {
  let asyncValidators$: Effect<unknown, ControlAsyncValidationResponse>[] = [];

  const buildConfigEffect = (
    config: AbstractControlConfig,
    controlRef: ControlRef = [],
  ): void => {
    if (config.asyncValidators && config.asyncValidators.length) {
      const effect$: Effect<unknown, ControlAsyncValidationResponse> = (
        dispatcher$,
      ) => {
        const action$ = dispatcher$.pipe(
          ofType(FORMS_CONTROL_CHANGE),
          filter(({ payload }: Action<unknown>) => {
            const { controlRef: changeControlRef } = payload as ControlChange<
              unknown,
              T
            >;
            return isChildControl(changeControlRef, controlRef);
          }),
        );

        const newState$ = action$.pipe(
          map(
            (
              action: Action<unknown>,
            ): {
              controlRef: ControlRef;
              newState: AbstractControl<T>;
            } => {
              const { state, controlRef: changeControlRef } =
                action.payload as ControlChange<unknown, T>;

              if (!state) {
                throw 'current state is required for async validation';
              }

              return {
                controlRef: changeControlRef,
                newState: formsReducer(state, action),
              };
            },
          ),
        );

        const localControl$ = newState$.pipe(
          map(({ newState, controlRef: changeControlRef }) => {
            const control = getFormControl(
              controlRef.reduce((ref: ControlRef, key, index): ControlRef => {
                ref = ref.concat(changeControlRef[index]);
                return ref;
              }, []),
              newState,
            );

            return control;
          }),
        );

        const validators$ = (<ValidatorAsyncFn[]>config.asyncValidators).reduce(
          (result: Observable<FormErrors>[], validator) => {
            const localValue$ = localControl$.pipe(map(({ value }) => value));
            const formErrors$ = validator(localValue$);
            result = result.concat(formErrors$);
            return result;
          },
          [],
        );

        const mergedErrors: Observable<ControlAsyncValidationResponse> =
          combineLatest(validators$).pipe(
            withLatestFrom(localControl$),
            map(([validatorsResult, control]) => ({
              //Map proper reference here as well for index and array validator
              controlRef: control.controlRef,
              errors: Object.assign({}, ...validatorsResult) as FormErrors,
            })),
          );

        return mergedErrors.pipe(
          map((response) => asyncValidationResponseSuccess(response)),
        );
      };

      asyncValidators$ = asyncValidators$.concat(effect$);
    }

    if (config.controlType === FormControlType.Group) {
      Object.entries((<FormGroupConfig>config).formGroupControls).forEach(
        ([key, controlConfig]) => {
          buildConfigEffect(controlConfig, controlRef.concat(key));
        },
      );
    } else if (config.controlType === FormControlType.Array) {
      const { arrayControlsTemplate } = config as FormArrayConfig<T>;

      buildConfigEffect(arrayControlsTemplate, controlRef.concat('*'));
    }
  };

  buildConfigEffect(config);
  return asyncValidators$;
};
