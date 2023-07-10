import { getControlConfig } from './FormHelpers';
import { config } from './Tests/config';
import { FormArrayConfig, FormGroupConfig } from './Models/Forms';
import { EmergencyContact } from './Tests/Models/EmergencyContact';

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
