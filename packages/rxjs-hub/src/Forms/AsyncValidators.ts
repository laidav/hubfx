import { of, delay, Observable, mergeMap, tap } from 'rxjs';
import { ValidatorAsyncFn } from './Models/Forms';

export const uniqueEmail: ValidatorAsyncFn = (value$: Observable<unknown>) => {
  // return of({ uniqueEmail: true }).pipe(delay(1000));
  return value$.pipe(
    mergeMap((value) => of({ uniqueEmail: true }).pipe(delay(1000))),
  );
};

export const blacklistedEmail: ValidatorAsyncFn = (
  value$: Observable<unknown>,
) => {
  // return of({ uniqueEmail: true }).pipe(delay(1000));
  return value$.pipe(
    mergeMap((value) => of({ blacklistedEmail: true }).pipe(delay(1000))),
  );
};

export const uniqueFirstAndLastName: ValidatorAsyncFn = (
  value$: Observable<unknown>,
) => {
  return value$.pipe(
    // tap((value) => console.log(value, 'in validator')),
    mergeMap((value) => of({ uniqueFirstAndLastName: true }).pipe(delay(1000))),
  );
};

export const arrayLengthError: ValidatorAsyncFn = (
  value$: Observable<unknown>,
) => {
  return value$.pipe(
    mergeMap((value) => of({ arrayLengthError: true }).pipe(delay(1000))),
  );
};

//Change payload with the state
//map value to validator
// then send action with controlrRef
