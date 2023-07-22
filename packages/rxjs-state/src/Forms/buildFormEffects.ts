import { Observable, forkJoin, merge } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { FORMS_CONTROL_CHANGE } from './Forms.actions';
import { ofType } from '../Operators/ofType';
import {
  AbstractControl,
  ControlChange,
  FormErrors,
  ControlAsyncValidationResponse,
  ControlRef,
} from './Models/Forms';
import { asyncValidationResponseSuccess } from './Forms.actions';
import { getFormControl, formsReducer } from './FormsReducer.reducer';
import { Effect } from '../Models/Effect';

export const buildFormEffects = <T>(): Effect<
  unknown,
  ControlAsyncValidationResponse
>[] => {
  const effect$: Effect<unknown, ControlAsyncValidationResponse> = (
    dispatcher$,
  ) => {
    const action$ = dispatcher$.pipe(ofType(FORMS_CONTROL_CHANGE));

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

    const controls$: Observable<AbstractControl<unknown>[]> = newState$.pipe(
      map(({ controlRef, newState }) =>
        controlRef.reduce((acc, key, index) => {
          acc = acc.concat(
            getFormControl(controlRef.slice(0, index), newState),
          );
          return acc;
        }, []),
      ),
    );

    const validationResultsForControls$ = controls$.pipe(
      mergeMap((controls) => {
        const controlValidationResponses$ = controls.reduce(
          (acc: Observable<ControlAsyncValidationResponse>[], control) => {
            const localValue$ = newState$.pipe(
              map(
                ({ newState }) =>
                  getFormControl(control.controlRef, newState).value,
              ),
            );
            const validatorsFns$ =
              control.config.asyncValidators?.reduce(
                (acc: Observable<FormErrors>[], validator) => {
                  const obs$ = validator(localValue$);
                  acc = acc.concat(obs$);
                  return acc;
                },
                [],
              ) || [];

            const controlErrors$: Observable<ControlAsyncValidationResponse> =
              forkJoin(validatorsFns$).pipe(
                map((validationResults) => ({
                  controlRef: control.controlRef,
                  errors: Object.assign({}, ...validationResults),
                })),
              );

            acc = acc.concat(controlErrors$);
            return acc;
          },
          [],
        );

        return merge(...controlValidationResponses$);
      }),
    );

    return validationResultsForControls$.pipe(
      map((response) => asyncValidationResponseSuccess(response)),
    );
  };

  return [effect$];
};
