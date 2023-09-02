import { Observable } from 'rxjs';
import { Action } from '@hubfx/core';

export enum FormControlType {
  Field = 'Field',
  Array = 'Array',
  Group = 'Group',
}

export interface FormGroupConfig extends AbstractControlConfig {
  formGroupControls: { [key: string]: AbstractControlConfig };
}

export interface FormArrayConfig extends AbstractControlConfig {
  formArrayControls?: AbstractControlConfig[];
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
  pristineControl?: AbstractControl<T>;
  controlRef: ControlRef;
  value: T;
  dirty: boolean;
  touched: boolean;
  valid: boolean;
  errors?: FormErrors;
  asyncValidateInProgress: { [key: string | number]: boolean };
  validating?: boolean;
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

export interface AddControl {
  config: AbstractControlConfig;
  controlRef: ControlRef;
}

export interface ControlAsyncValidationResponse {
  controlRef: ControlRef;
  validatorIndex: number;
  errors: FormErrors;
}

export type FormsReducer = <T>(
  state: AbstractControl<T>,
  action: Action<unknown>,
) => AbstractControl<T>;

export type ValidatorFn = (value: unknown) => FormErrors;

export type ValidatorAsyncFn = <T>(
  control$: Observable<AbstractControl<T>>,
) => Observable<FormErrors>;
