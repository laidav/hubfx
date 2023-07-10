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
import { StreamConfig } from '../Models/Stream';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import { buildFormsReducer } from './Forms.reducer';
import { buildFormEffects } from './FormsEffectsBuilder';

export const getControlConfig = (
  config: AbstractControlConfig,
  controlRef: ControlRef,
): AbstractControlConfig => {
  if (!controlRef.length) {
    return config;
  }

  const result: AbstractControlConfig = controlRef.reduce(
    (acc, key): AbstractControlConfig => {
      if (
        typeof key === 'string' &&
        acc.controlType === FormControlType.Group
      ) {
        return (<FormGroupConfig>acc).formGroupControls[key];
      }

      return (<FormArrayConfig<unknown>>acc).arrayControlsTemplate;
    },
    config,
  );

  return result;
};

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
      validating: false,
      controls,
      errors,
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
      validating: false,
      valid: !arrayControlHasError && !controlsHasErrors,
      errors,
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
      validating: false,
      errors,
    };

    return result;
  }
};

export const getValueFromControlConfig = <T>(
  controlConfig: AbstractControlConfig,
): T => {
  if (controlConfig.controlType === FormControlType.Group) {
    const result: { [key: string]: unknown } = {};

    for (const key in (<FormGroupConfig>controlConfig).formGroupControls) {
      const control = (<FormGroupConfig>controlConfig).formGroupControls[key];
      result[key] = getValueFromControlConfig(control);
    }

    return result as T;
  } else {
    return (<FormArrayConfig<T> | FormControlConfig<T>>controlConfig)
      .initialValue;
  }
};

export const formBuilder = <T>(
  config: AbstractControlConfig,
): StreamConfig<AbstractControl<T>> => {
  const initialState: AbstractControl<T> = buildControlState(config);
  const formsReducer = buildFormsReducer(config);
  const effects$ = buildFormEffects(config, formsReducer);

  return {
    initialState,
    reducer: formsReducer,
    messageHub: MessageHubFactory(effects$),
  };
};

export const isChildControl = (
  childRef: ControlRef,
  parentRef: ControlRef,
): boolean => {
  const result = parentRef.every((key, index) => {
    if (key === '*') {
      return typeof childRef[index] === 'number';
    }

    return childRef[index] === key;
  });

  return result;
};
