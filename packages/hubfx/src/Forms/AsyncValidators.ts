import { of, delay, mergeMap, tap } from 'rxjs';
import { ValidatorAsyncFn } from './Models/Forms';

export const uniqueEmail: ValidatorAsyncFn = (control$) => {
  // return of({ uniqueEmail: true }).pipe(delay(1000));
  return control$.pipe(
    mergeMap((control) => of({ uniqueEmail: true }).pipe(delay(250))),
  );
};

export const blacklistedEmail: ValidatorAsyncFn = (control$) => {
  // return of({ uniqueEmail: true }).pipe(delay(1000));
  return control$.pipe(
    mergeMap((control) => of({ blacklistedEmail: true }).pipe(delay(300))),
  );
};

export const arrayLengthError: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    mergeMap((control) => of({ arrayLengthError: true }).pipe(delay(350))),
  );
};

export const uniqueFirstAndLastName: ValidatorAsyncFn = (control$) => {
  return control$.pipe(
    // tap((control) => console.log(control, 'in validator')),
    mergeMap((control) =>
      of({ uniqueFirstAndLastName: true }).pipe(delay(400)),
    ),
  );
};

//Change payload with the state
//map control to validator
// then send action with controlrRef
