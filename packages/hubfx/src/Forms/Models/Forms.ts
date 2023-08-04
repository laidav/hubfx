import { Observable } from 'rxjs';
import { Action } from '../../Models/Action';

export enum FormControlType {
  Field = 'Field',
  Array = 'Array',
  Group = 'Group',
}

export interface FormGroupConfig extends AbstractControlConfig {
  formGroupControls: { [key: string]: AbstractControlConfig };
}

export interface FormArrayConfig<T> extends AbstractControlConfig {
  initialValue: T;
  arrayControlsTemplate: AbstractControlConfig;
}

export interface FormControlConfig<T> extends AbstractControlConfig {
  initialValue: T;
}

export interface AbstractControlConfig {
  controlType?: FormControlType; //default 'Field';
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
}

export interface FormControl<T> {
  controlRef: ControlRef;
  pristineValue: T;
  value: T;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors?: FormErrors;
  validating?: boolean;
  validators?: ValidatorFn[];
  asyncValidators?: ValidatorAsyncFn[];
  config: AbstractControlConfig;
}

export interface FormGroup<T> extends FormControl<T> {
  submitting?: boolean;
  controls: {
    [key: string]: AbstractControl<unknown>;
  };
}

export interface FormArray<T> extends FormControl<T> {
  controls: AbstractControl<unknown>[];
}

export type AbstractControl<T> = FormControl<T> | FormArray<T> | FormGroup<T>;

export interface FormErrors {
  [key: string]: boolean;
}

export type ControlRef = (string | number)[];

export interface ControlChange<T> {
  value: T;
  controlRef: ControlRef;
}

export interface ControlAsyncValidationResponse {
  controlRef: ControlRef;
  errors: FormErrors;
}

export type ValidatorFn = (value: any) => FormErrors;

export type ValidatorAsyncFn = <T>(
  control$: Observable<AbstractControl<T>>,
) => Observable<FormErrors>;

export type FormsReducer = <T>(
  state: AbstractControl<T>,
  action: Action<unknown>,
) => AbstractControl<T>;
