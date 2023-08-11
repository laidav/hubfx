import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from './Tests/config';
import { Contact } from './Tests/Models/Contact';
import { DoctorInfo } from './Tests/Models/DoctorInfo';
import {
  FormControl,
  FormArray,
  FormGroup,
  FormArrayConfig,
  FormControlConfig,
  FormGroupConfig,
  FormControlType,
} from './Models/Forms';
import { required, email } from './Validators';
import { uniqueEmail, blacklistedEmail } from './AsyncValidators';
import { buildControlState } from './buildControlState';

describe('buildControlState', () => {
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
    asyncValidateInProgress: {},
    validating: false,
  };

  it('should build the control state for for type field', () => {
    expect(
      buildControlState(config.formGroupControls.firstName, ['firstName']),
    ).toEqual({
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      pristineValue: '',
      valid: false,
      errors: {
        required: true,
      },
      config: config.formGroupControls.firstName,
    } as FormControl<string>);
  });

  it('should build the control state for type group with empty value', () => {
    const initialValue = {
      firstName: '',
      lastName: '',
      email: '',
    };
    const expectedValue: FormGroup<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      valid: false,
      value: initialValue,
      pristineValue: initialValue,
      config: config.formGroupControls.doctorInfo,
      errors: {
        firstNameNotSameAsLast: true,
      },
      controls: {
        firstName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'firstName'],
          valid: false,
          errors: {
            required: true,
          },
          pristineValue: '',
          value: '',
          config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
            .formGroupControls.firstName,
        },
        lastName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'lastName'],
          valid: false,
          errors: {
            required: true,
          },
          pristineValue: '',
          value: '',
          config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
            .formGroupControls.lastName,
        },
        email: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'email'],
          valid: false,
          errors: {
            email: false,
            required: true,
          },
          pristineValue: '',
          value: '',
          config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
            .formGroupControls.email,
        },
      },
    } as FormGroup<DoctorInfo>;
    expect(
      buildControlState(config.formGroupControls.doctorInfo, ['doctorInfo']),
    ).toEqual(expectedValue);
  });

  it('should build the control state for type group with non-empty value', () => {
    const initialValue = {
      firstName: 'Dr',
      lastName: 'Bob',
      email: 'DrBobbob.com',
    };
    const testConfig = {
      controlType: FormControlType.Group,
      validators: [firstNameNotSameAsLast],
      formGroupControls: {
        firstName: {
          initialValue: initialValue.firstName,
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: initialValue.lastName,
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: initialValue.email,
          validators: [required, email],
        } as FormControlConfig<string>,
      },
    } as FormGroupConfig;
    const expectedValue: FormGroup<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      valid: false,
      value: initialValue,
      config: testConfig,
      pristineValue: initialValue,
      errors: {
        firstNameNotSameAsLast: false,
      },
      controls: {
        firstName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'firstName'],
          valid: true,
          errors: {
            required: false,
          },
          pristineValue: 'Dr',
          value: 'Dr',
          config: testConfig.formGroupControls.firstName,
        },
        lastName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'lastName'],
          valid: true,
          errors: {
            required: false,
          },
          pristineValue: 'Bob',
          value: 'Bob',
          config: testConfig.formGroupControls.lastName,
        },
        email: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo', 'email'],
          valid: false,
          errors: {
            email: true,
            required: false,
          },
          pristineValue: 'DrBobbob.com',
          value: 'DrBobbob.com',
          config: testConfig.formGroupControls.email,
        },
      },
    } as FormGroup<DoctorInfo>;
    expect(buildControlState(testConfig, ['doctorInfo'])).toEqual(
      expectedValue,
    );
  });

  it('should build the control state for for type array with empty initial value', () => {
    expect(
      buildControlState(config.formGroupControls.emergencyContacts, [
        'emergencyContacts',
      ]),
    ).toEqual({
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      controls: [],
      value: [],
      pristineValue: [],
      valid: false,
      config: config.formGroupControls.emergencyContacts,
      errors: {
        required: true,
      },
    } as FormArray<unknown>);
  });

  it('should build the control state for for type array with non-empty form group initial values', () => {
    const nonEmptyConfig = {
      ...(config.formGroupControls.emergencyContacts as FormArrayConfig),
      formArrayControls: emergencyContactConfigs,
    } as FormArrayConfig;

    expect(buildControlState(nonEmptyConfig, ['emergencyContacts'])).toEqual({
      config: nonEmptyConfig,
      controls: [
        {
          ...BASE_FORM_CONTROL,
          controlRef: ['emergencyContacts', 0],
          submitting: false,
          value: {
            firstName: 'Homer',
            lastName: 'Simpson',
            email: 'homer@homer.com',
            relation: 'friend',
          },
          pristineValue: {
            firstName: 'Homer',
            lastName: 'Simpson',
            email: 'homer@homer.com',
            relation: 'friend',
          },
          valid: true,
          errors: {
            firstNameNotSameAsLast: false,
          },
          config: emergencyContactConfigs[0],
          controls: {
            firstName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 0, 'firstName'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'Homer',
              value: 'Homer',
              config: {
                ...emergencyContactConfigs[0].formGroupControls.firstName,
                initialValue: 'Homer',
              },
            },
            lastName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 0, 'lastName'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'Simpson',
              value: 'Simpson',
              config: {
                ...emergencyContactConfigs[0].formGroupControls.lastName,
                initialValue: 'Simpson',
              },
            },
            email: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 0, 'email'],
              valid: true,
              errors: {
                email: false,
                required: false,
              },
              pristineValue: 'homer@homer.com',
              value: 'homer@homer.com',
              config: {
                ...emergencyContactConfigs[0].formGroupControls.email,
                initialValue: 'homer@homer.com',
              },
            },
            relation: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 0, 'relation'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'friend',
              value: 'friend',
              config: {
                ...emergencyContactConfigs[0].formGroupControls.relation,
                initialValue: 'friend',
              },
            },
          } as { [key: string]: FormControl<unknown> },
        } as FormGroup<unknown>,
        {
          ...BASE_FORM_CONTROL,
          controlRef: ['emergencyContacts', 1],
          submitting: false,
          value: {
            firstName: 'moe',
            lastName: 'syzlak',
            email: 'moe@moe.com',
            relation: 'friend',
          },
          pristineValue: {
            firstName: 'moe',
            lastName: 'syzlak',
            email: 'moe@moe.com',
            relation: 'friend',
          },
          valid: true,
          errors: {
            firstNameNotSameAsLast: false,
          },
          config: {
            ...emergencyContactConfigs[1],
            formGroupControls: {
              firstName: {
                initialValue: 'moe',
                validators: [required],
              },
              lastName: {
                initialValue: 'syzlak',
                validators: [required],
              },
              email: {
                initialValue: 'moe@moe.com',
                validators: [required, email],
                asyncValidators: [uniqueEmail, blacklistedEmail],
              },
              relation: { initialValue: 'friend', validators: [required] },
            },
          },
          controls: {
            firstName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 1, 'firstName'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'moe',
              value: 'moe',
              config: {
                ...emergencyContactConfigs[1].formGroupControls.firstName,
                initialValue: 'moe',
              },
            },
            lastName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 1, 'lastName'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'syzlak',
              value: 'syzlak',
              config: {
                ...emergencyContactConfigs[1].formGroupControls.lastName,
                initialValue: 'syzlak',
              },
            },
            email: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 1, 'email'],
              valid: true,
              errors: {
                email: false,
                required: false,
              },
              pristineValue: 'moe@moe.com',
              value: 'moe@moe.com',
              config: {
                ...emergencyContactConfigs[1].formGroupControls.email,
                initialValue: 'moe@moe.com',
              },
            },
            relation: {
              ...BASE_FORM_CONTROL,
              controlRef: ['emergencyContacts', 1, 'relation'],
              valid: true,
              errors: {
                required: false,
              },
              pristineValue: 'friend',
              value: 'friend',
              config: {
                ...emergencyContactConfigs[1].formGroupControls.relation,
                initialValue: 'friend',
              },
            },
          } as { [key: string]: FormControl<unknown> },
        } as FormGroup<unknown>,
      ] as FormGroup<unknown>[],
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: [
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
      ],
      pristineValue: [
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
      ],
      valid: true,
      errors: {
        required: false,
      },
    } as FormArray<unknown>);
  });

  it('should build the entire config with empty values', () => {
    const initialValue: Contact = {
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
    };
    expect(buildControlState(config)).toEqual({
      ...BASE_FORM_CONTROL,
      submitting: false,
      controlRef: [],
      valid: false,
      value: initialValue,
      pristineValue: initialValue,
      errors: {
        firstNameNotSameAsLast: true,
      },
      config,
      controls: {
        firstName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['firstName'],
          value: '',
          pristineValue: '',
          valid: false,
          errors: {
            required: true,
          },
          config: config.formGroupControls.firstName,
        },
        lastName: {
          ...BASE_FORM_CONTROL,
          controlRef: ['lastName'],
          value: '',
          pristineValue: '',
          valid: false,
          errors: {
            required: true,
          },
          config: config.formGroupControls.lastName,
        },
        email: {
          ...BASE_FORM_CONTROL,
          controlRef: ['email'],
          value: '',
          pristineValue: '',
          valid: false,
          errors: {
            email: false,
            required: true,
          },
          config: config.formGroupControls.email,
        },
        phone: {
          ...BASE_FORM_CONTROL,
          controlRef: ['phone'],
          value: '',
          pristineValue: '',
          valid: false,
          errors: {
            required: true,
            phoneNumber: false,
          },
          config: config.formGroupControls.phone,
        },
        emergencyContacts: {
          ...BASE_FORM_CONTROL,
          controlRef: ['emergencyContacts'],
          value: [],
          pristineValue: [],
          valid: false,
          errors: {
            required: true,
          },
          config: config.formGroupControls.emergencyContacts,
          controls: [],
        },
        doctorInfo: {
          ...BASE_FORM_CONTROL,
          controlRef: ['doctorInfo'],
          submitting: false,
          value: {
            firstName: '',
            lastName: '',
            email: '',
          },
          pristineValue: {
            firstName: '',
            lastName: '',
            email: '',
          },
          valid: false,
          errors: {
            firstNameNotSameAsLast: true,
          },
          config: config.formGroupControls.doctorInfo,
          controls: {
            firstName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['doctorInfo', 'firstName'],
              value: '',
              pristineValue: '',
              valid: false,
              errors: {
                required: true,
              },
              config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
                .formGroupControls.firstName,
            },
            lastName: {
              ...BASE_FORM_CONTROL,
              controlRef: ['doctorInfo', 'lastName'],
              value: '',
              pristineValue: '',
              valid: false,
              errors: {
                required: true,
              },
              config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
                .formGroupControls.lastName,
            },
            email: {
              ...BASE_FORM_CONTROL,
              controlRef: ['doctorInfo', 'email'],
              value: '',
              pristineValue: '',
              valid: false,
              errors: {
                email: false,
                required: true,
              },
              config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
                .formGroupControls.email,
            },
          },
        },
      },
    } as FormGroup<Contact>);
  });
});
