import { getFormControl } from './getFormControl';
import { buildControlState } from '../Helpers/buildControlState';
import { config } from '../Testing/config';
import { FormGroup, FormArray, FormControl } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';

describe('getFormControl', () => {
  const contactFormGroup = buildControlState(config) as FormGroup<Contact>;
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
    asyncValidateInProgress: {},
    validating: false,
  };

  it('should get form control', () => {
    const expectedControl = {
      ...BASE_FORM_CONTROL,
      config: config.formGroupControls.firstName,
      controlRef: ['firstName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
    } as FormControl<string>;
    expect(getFormControl(['firstName'], contactFormGroup)).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });

    const expectedControlDoctorInfoFirstName = {
      ...BASE_FORM_CONTROL,
      config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
        .formGroupControls.firstName,
      controlRef: ['doctorInfo', 'firstName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
    } as FormControl<string>;

    expect(
      getFormControl(['doctorInfo', 'firstName'], contactFormGroup),
    ).toEqual({
      pristineControl: expectedControlDoctorInfoFirstName,
      ...expectedControlDoctorInfoFirstName,
    });

    const expectedEmergencyContactsControl = {
      ...BASE_FORM_CONTROL,
      config: <FormArrayConfig>config.formGroupControls.emergencyContacts,
      controlRef: ['emergencyContacts'],
      value: [] as EmergencyContact[],
      controls: [] as FormControl<EmergencyContact>[],
      valid: false,
      errors: {
        required: true,
      },
    } as FormArray<EmergencyContact[]>;

    expect(getFormControl(['emergencyContacts'], contactFormGroup)).toEqual({
      pristineControl: expectedEmergencyContactsControl,
      ...expectedEmergencyContactsControl,
    });
  });
});
