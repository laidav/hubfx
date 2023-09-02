import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import { FormControlType } from '../Models/FormControlType';

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
