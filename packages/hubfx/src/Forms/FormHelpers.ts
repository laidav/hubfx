import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControl,
  AbstractControlConfig,
  FormControlType,
  ControlRef,
} from './Models/Forms';
import { StreamConfig } from '../Models/Stream';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import { formsReducer } from './FormsReducer.reducer';
import { buildFormEffects } from './formEffect';
import { buildControlState } from './buildControlState';

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
  const effects$ = buildFormEffects();

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
