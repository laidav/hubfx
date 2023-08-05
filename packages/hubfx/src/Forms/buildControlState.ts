import {
  FormControl,
  FormGroup,
  FormArray,
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  FormErrors,
  AbstractControl,
  AbstractControlConfig,
  FormControlType,
  ControlRef,
} from './Models/Forms';
import { getValueFromControlConfig } from './FormHelpers';

export const buildControlState = <T>(
  controlConfig: AbstractControlConfig,
  controlRef: ControlRef = [],
): AbstractControl<T> => {
  // Form Group
  if (controlConfig.controlType === FormControlType.Group) {
    const controls = {} as { [key: string]: FormControl<unknown> };
    const groupInitialValue: {
      [key: string]: unknown;
    } = getValueFromControlConfig(controlConfig);

    for (const key in (<FormGroupConfig>controlConfig).formGroupControls) {
      const formGroupControlConfig = (<FormGroupConfig>controlConfig)
        .formGroupControls[key];
      controls[key] = buildControlState(
        formGroupControlConfig,
        controlRef.concat(key),
      );
    }

    const errors = controlConfig.validators?.reduce((errors, validator) => {
      return {
        ...errors,
        ...validator(getValueFromControlConfig(controlConfig)),
      };
    }, {} as FormErrors);

    const groupControlHasError = errors
      ? Object.values(errors).some((error) => error)
      : false;

    const controlsHasErrors = Object.values(controls).some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });

    const result: FormGroup<T> = {
      controlRef,
      dirty: false,
      touched: false,
      pristineValue: groupInitialValue as T,
      value: groupInitialValue as T,
      valid: !groupControlHasError && !controlsHasErrors,
      submitting: false,
      asyncValidateInProgress: {},
      validating: false,
      controls,
      errors,
      config: controlConfig,
    };

    return result;
    // Form Array
  } else if (controlConfig.controlType === FormControlType.Array) {
    const controls: AbstractControl<unknown>[] = [];
    const initialValues = (<FormArrayConfig<T>>controlConfig)
      .initialValue as unknown[];

    initialValues.forEach((initialValue, index) => {
      const template = (<FormArrayConfig<T>>controlConfig)
        .arrayControlsTemplate;

      if (template.controlType === FormControlType.Group) {
        const formGroupControls = Object.entries(
          (<FormGroupConfig>template).formGroupControls,
        ).reduce((result, [key, value]) => {
          result[key] = {
            ...value,
            initialValue: (<{ [key: string]: unknown }>initialValue)[key],
          };
          return result;
        }, {} as { [key: string]: FormControlConfig<unknown> });

        const config = {
          ...template,
          formGroupControls,
        } as FormGroupConfig;

        const controlState = buildControlState(
          config,
          controlRef.concat(index),
        );
        controls.push(controlState);
      } else {
        const controlState = buildControlState(
          {
            ...template,
            initialValue,
          } as FormControlConfig<unknown> | FormArrayConfig<unknown>,
          controlRef.concat(index),
        );
        controls.push(controlState);
      }
    });

    const errors = controlConfig.validators?.reduce((errors, validator) => {
      return {
        ...errors,
        ...validator(getValueFromControlConfig(controlConfig)),
      };
    }, {} as FormErrors);

    const arrayControlHasError = errors
      ? Object.values(errors).some((error) => error)
      : false;

    const controlsHasErrors = controls.some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });

    const result: FormArray<T> = {
      controlRef,
      controls,
      dirty: false,
      pristineValue: (<FormArrayConfig<T>>controlConfig).initialValue,
      value: (<FormArrayConfig<T>>controlConfig).initialValue,
      touched: false,
      asyncValidateInProgress: {},
      validating: false,
      valid: !arrayControlHasError && !controlsHasErrors,
      errors,
      config: controlConfig,
    };
    return result;
    // Form Field
  } else {
    const errors = controlConfig.validators?.reduce((errors, validator) => {
      return {
        ...errors,
        ...validator(getValueFromControlConfig(controlConfig)),
      };
    }, {} as FormErrors);

    const result: FormControl<T> = {
      controlRef,
      dirty: false,
      pristineValue: (<FormControlConfig<T>>controlConfig).initialValue,
      value: (<FormControlConfig<T>>controlConfig).initialValue,
      touched: false,
      valid: errors ? Object.values(errors).every((error) => !error) : true,
      asyncValidateInProgress: {},
      validating: false,
      errors,
      config: controlConfig,
    };

    return result;
  }
};
