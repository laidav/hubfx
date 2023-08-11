import { config, emergencyContactConfigs } from './Tests/config';
import { FormGroupConfig, FormArrayConfig } from './Models/Forms';
import { getValueFromControlConfig } from './FormHelpers';

describe('getValueFromConfig', () => {
  it('should return the correct initial empty value from config', () => {
    expect(getValueFromControlConfig(config)).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContacts: [],
      doctorInfo: {
        firstName: '',
        lastName: '',
        email: '',
      },
    });
  });
  it('should return the correct non-empty value from config', () => {
    const intialValue = [
      {
        firstName: 'Homer',
        lastName: 'Simpson',
        email: 'homer@homer.com',
        relation: 'friend',
      },
      {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
    ];
    expect(
      getValueFromControlConfig({
        ...config,
        formGroupControls: {
          ...config.formGroupControls,
          emergencyContacts: {
            ...config.formGroupControls.emergencyContacts,
            formArrayControls: emergencyContactConfigs,
          } as FormArrayConfig,
        },
      } as FormGroupConfig),
    ).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContacts: intialValue,
      doctorInfo: {
        firstName: '',
        lastName: '',
        email: '',
      },
    });
  });
});
