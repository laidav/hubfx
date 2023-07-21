import { config, firstNameNotSameAsLast } from './Tests/config';
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
import { buildControlState } from './buildControlState';

describe('buildControlState', () => {
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
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
    const expectedValue: FormGroup<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      valid: false,
      value: initialValue,
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
        },
      },
    } as FormGroup<DoctorInfo>;
    expect(
      buildControlState(
        {
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
        } as FormGroupConfig,
        ['doctorInfo'],
      ),
    ).toEqual(expectedValue);
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
      errors: {
        required: true,
      },
    } as FormArray<unknown>);
  });

  it('should build the control state for for type array with non-empty form group initial values', () => {
    const initialValue = [
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
    const nonEmptyConfig = {
      ...(config.formGroupControls
        .emergencyContacts as FormArrayConfig<unknown>),
      initialValue,
    };
    expect(buildControlState(nonEmptyConfig, ['emergencyContacts'])).toEqual({
      controls: [
        {
          ...BASE_FORM_CONTROL,
          controlRef: ['emergencyContacts', 0],
          submitting: false,
          value: initialValue[0],
          pristineValue: initialValue[0],
          valid: true,
          errors: {
            firstNameNotSameAsLast: false,
          },
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
            },
          } as { [key: string]: FormControl<unknown> },
        } as FormGroup<unknown>,
        {
          ...BASE_FORM_CONTROL,
          controlRef: ['emergencyContacts', 1],
          submitting: false,
          value: initialValue[1],
          pristineValue: initialValue[1],
          valid: true,
          errors: {
            firstNameNotSameAsLast: false,
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
            },
          } as { [key: string]: FormControl<unknown> },
        } as FormGroup<unknown>,
      ] as FormGroup<unknown>[],
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: initialValue,
      pristineValue: initialValue,
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
            },
          },
        },
      },
    } as FormGroup<Contact>);
  });
});
