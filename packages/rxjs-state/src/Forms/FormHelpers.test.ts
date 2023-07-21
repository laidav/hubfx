import { getControlConfig } from './FormHelpers';
import { config } from './Tests/config';
import { FormArrayConfig, FormGroupConfig } from './Models/Forms';
import { EmergencyContact } from './Tests/Models/EmergencyContact';
import { getValueFromControlConfig } from './FormHelpers';

describe('getControlConfig', () => {
  it('should get the controlConfig by ControlRef', () => {
    expect(getControlConfig(config, [])).toBe(config);

    expect(getControlConfig(config, ['firstName'])).toBe(
      config.formGroupControls.firstName,
    );

    expect(getControlConfig(config, ['emergencyContacts'])).toBe(
      config.formGroupControls.emergencyContacts,
    );

    expect(getControlConfig(config, ['emergencyContacts', 2])).toBe(
      (<FormArrayConfig<EmergencyContact[]>>(
        config.formGroupControls.emergencyContacts
      )).arrayControlsTemplate,
    );

    expect(getControlConfig(config, ['emergencyContacts', 1])).toBe(
      (<FormArrayConfig<EmergencyContact[]>>(
        config.formGroupControls.emergencyContacts
      )).arrayControlsTemplate,
    );

    expect(getControlConfig(config, ['doctorInfo'])).toBe(
      config.formGroupControls.doctorInfo,
    );

    expect(getControlConfig(config, ['doctorInfo', 'firstName'])).toBe(
      (<FormGroupConfig>config.formGroupControls.doctorInfo).formGroupControls
        .firstName,
    );
  });
});

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
            initialValue: intialValue,
          },
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
