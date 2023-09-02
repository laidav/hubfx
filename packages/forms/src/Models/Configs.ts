import { FormControlType } from './FormControlType';
import { ValidatorFn, ValidatorAsyncFn } from './Validators';

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
