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
import { buildControlState } from './buildControlState';

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
  } else if (controlConfig.controlType === FormControlType.Array) {
    const configs = (<FormArrayConfig>controlConfig).formArrayControls;
    const result = configs
      ? configs.map((controlConfig) => getValueFromControlConfig(controlConfig))
      : [];

    return result as T;
  } else {
    return (<FormControlConfig<T>>controlConfig).initialValue;
  }
};

export const formBuilder = <T>(
  config: AbstractControlConfig,
): StreamConfig<AbstractControl<T>> => {
  const initialState: AbstractControl<T> = buildControlState(config);

  return {
    initialState,
    reducer: formsReducer,
    messageHub: MessageHubFactory(),
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
