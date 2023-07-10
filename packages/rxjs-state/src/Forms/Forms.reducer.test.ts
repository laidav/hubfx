import {
  buildFormsReducer,
  getFormControl,
  updateValues,
  updateDirty,
  getControlValidators,
  syncValidate,
  handleAsyncValidationResponseSuccess,
} from './Forms.reducer';
import { buildControlState } from './FormHelpers';
import { config, firstNameNotSameAsLast } from './Tests/config';
import { controlChange } from './Forms.actions';
import {
  FormGroup,
  FormControl,
  FormArray,
  FormArrayConfig,
  FormGroupConfig,
} from './Models/Forms';
import { Contact } from './Tests/Models/Contact';
import { EmergencyContact } from './Tests/Models/EmergencyContact';
import { DoctorInfo } from './Tests/Models/DoctorInfo';
import { required, email } from './Validators';

describe('updateValues', () => {
  it('should update values only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(updateValues(initialState, ['firstName'], 'Homer')).toEqual({
      ...initialState,
      value: {
        firstName: 'Homer',
        lastName: '',
        email: '',
        phone: '',
        emergencyContacts: [],
        doctorInfo: {
          firstName: '',
          lastName: '',
          email: '',
        },
      },
      controls: {
        ...initialState.controls,
        firstName: {
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: false,
          touched: false,
          valid: false,
          errors: {
            required: true,
          },
          validating: false,
        },
      },
    });
  });

  it('should update values only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(
      updateValues(initialState, ['doctorInfo', 'firstName'], 'Dr First Name'),
    ).toEqual({
      ...initialState,
      value: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        emergencyContacts: [],
        doctorInfo: {
          firstName: 'Dr First Name',
          lastName: '',
          email: '',
        },
      },
      controls: {
        ...initialState.controls,
        doctorInfo: {
          ...initialState.controls.doctorInfo,
          value: {
            firstName: 'Dr First Name',
            lastName: '',
            email: '',
          },
          controls: {
            firstName: {
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: false,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              validating: false,
            },
            lastName: {
              controlRef: ['doctorInfo', 'lastName'],
              pristineValue: '',
              value: '',
              dirty: false,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              validating: false,
            },
            email: {
              controlRef: ['doctorInfo', 'email'],
              pristineValue: '',
              value: '',
              dirty: false,
              touched: false,
              valid: false,
              errors: {
                email: false,
                required: true,
              },
              validating: false,
            },
          },
        },
      },
    });
  });

  it('should update values only for a FormArray in a FormGroup', () => {
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

    const emergencyContactsConfig = {
      ...(config.formGroupControls
        .emergencyContacts as FormArrayConfig<unknown>),
      initialValue,
    };

    const nonEmptyConfig: FormGroupConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: emergencyContactsConfig,
      },
    };

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as FormGroup<Contact>;

    expect(
      updateValues(
        initialState,
        ['emergencyContacts', 1, 'firstName'],
        'Moe Flaming',
      ),
    ).toEqual({
      ...initialState,
      value: {
        ...initialState.value,
        emergencyContacts: [
          initialValue[0],
          {
            ...initialValue[1],
            firstName: 'Moe Flaming',
          },
        ],
      },
      controls: {
        ...initialState.controls,
        emergencyContacts: {
          ...initialState.controls.emergencyContacts,
          value: [
            initialValue[0],
            {
              ...initialValue[1],
              firstName: 'Moe Flaming',
            },
          ],
          controls: [
            (<FormArray<EmergencyContact>>(
              initialState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<FormArray<EmergencyContact>>(
                initialState.controls.emergencyContacts
              )).controls[1] as FormGroup<EmergencyContact>),
              value: {
                ...initialValue[1],
                firstName: 'Moe Flaming',
              },
              controls: {
                ...(
                  (<FormArray<EmergencyContact>>(
                    initialState.controls.emergencyContacts
                  )).controls[1] as FormGroup<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<FormArray<EmergencyContact>>(
                      initialState.controls.emergencyContacts
                    )).controls[1] as FormGroup<EmergencyContact>
                  ).controls.firstName,
                  value: 'Moe Flaming',
                },
              },
            },
          ],
        },
      },
    });
  });
});

describe('updateDirty', () => {
  it('should verify intitial state is not dirty', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(updateDirty(initialState)).toEqual(initialState);
  });

  it('should update dirty only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(
      initialState,
      ['firstName'],
      'Homer',
    ) as FormGroup<Contact>;
    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: true,
          touched: false,
          valid: false,
          errors: {
            required: true,
          },
          validating: false,
        },
      },
    });
  });

  it('should update dirty only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(
      initialState,
      ['doctorInfo', 'firstName'],
      'Dr First Name',
    ) as FormGroup<Contact>;
    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        doctorInfo: {
          ...valuesUpdatedState.controls.doctorInfo,
          dirty: true,
          controls: {
            ...(<FormGroup<DoctorInfo>>valuesUpdatedState.controls.doctorInfo)
              .controls,
            firstName: {
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: true,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              validating: false,
            },
          },
        },
      },
    });
  });

  it('should update dirty only for a FormArray in a FormGroup', () => {
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

    const emergencyContactsConfig = {
      ...(config.formGroupControls
        .emergencyContacts as FormArrayConfig<unknown>),
      initialValue,
    };

    const nonEmptyConfig: FormGroupConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: emergencyContactsConfig,
      },
    };

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as FormGroup<Contact>;

    const valuesUpdatedState = updateValues(
      initialState,
      ['emergencyContacts', 1, 'firstName'],
      'Moe Flaming',
    ) as FormGroup<Contact>;

    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        emergencyContacts: {
          ...valuesUpdatedState.controls.emergencyContacts,
          dirty: true,
          controls: [
            (<FormArray<EmergencyContact>>(
              valuesUpdatedState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<FormArray<EmergencyContact>>(
                valuesUpdatedState.controls.emergencyContacts
              )).controls[1] as FormGroup<EmergencyContact>),
              dirty: true,
              controls: {
                ...(
                  (<FormArray<EmergencyContact>>(
                    valuesUpdatedState.controls.emergencyContacts
                  )).controls[1] as FormGroup<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<FormArray<EmergencyContact>>(
                      valuesUpdatedState.controls.emergencyContacts
                    )).controls[1] as FormGroup<EmergencyContact>
                  ).controls.firstName,
                  dirty: true,
                },
              },
            },
          ],
        },
      },
    });
  });
});

describe('getControlValidators', () => {
  it('should get the correct validators for a FormControls, FormGroups and FormArrays', () => {
    expect(getControlValidators(['firstName'], config)).toEqual([required]);
    expect(getControlValidators(['email'], config)).toEqual([required, email]);
    expect(getControlValidators(['emergencyContacts'], config)).toEqual([
      required,
    ]);
    expect(getControlValidators(['emergencyContacts', 0], config)).toEqual([
      firstNameNotSameAsLast,
    ]);
    expect(
      getControlValidators(['emergencyContacts', 0, 'relation'], config),
    ).toEqual([required]);
    expect(
      getControlValidators(['emergencyContacts', 0, 'email'], config),
    ).toEqual([required, email]);
    expect(getControlValidators(['doctorInfo'], config)).toEqual([
      firstNameNotSameAsLast,
    ]);
    expect(getControlValidators(['doctorInfo', 'firstName'], config)).toEqual([
      required,
    ]);
    expect(getControlValidators(['doctorInfo', 'email'], config)).toEqual([
      required,
      email,
    ]);
  });
});

describe('syncValidate', () => {
  it('should verify intitial state is not valid', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(syncValidate(initialState, config)).toEqual(initialState);
  });

  it('should validate only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(
      initialState,
      ['firstName'],
      'Homer',
    ) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState, config)).toEqual({
      ...valuesUpdatedState,
      errors: {
        firstNameNotSameAsLast: false,
      },
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: false,
          touched: false,
          valid: true,
          errors: {
            required: false,
          },
          validating: false,
        },
      },
    });
  });

  it('should validate only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(
      initialState,
      ['doctorInfo', 'firstName'],
      'Dr First Name',
    ) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState, config)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        doctorInfo: {
          ...valuesUpdatedState.controls.doctorInfo,
          errors: {
            firstNameNotSameAsLast: false,
          },
          controls: {
            ...(<FormGroup<DoctorInfo>>valuesUpdatedState.controls.doctorInfo)
              .controls,
            firstName: {
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: false,
              touched: false,
              valid: true,
              errors: {
                required: false,
              },
              validating: false,
            },
          },
        },
      },
    });
  });

  it('should validate only for a FormArray in a FormGroup', () => {
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

    const emergencyContactsConfig = {
      ...(config.formGroupControls
        .emergencyContacts as FormArrayConfig<unknown>),
      initialValue,
    };

    const nonEmptyConfig: FormGroupConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: emergencyContactsConfig,
      },
    };

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as FormGroup<Contact>;

    const valuesUpdatedState = updateValues(
      initialState,
      ['emergencyContacts', 1, 'firstName'],
      'syzlak',
    ) as FormGroup<Contact>;

    expect(syncValidate(valuesUpdatedState, config)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        emergencyContacts: {
          ...valuesUpdatedState.controls.emergencyContacts,
          valid: false,
          controls: [
            (<FormArray<EmergencyContact>>(
              valuesUpdatedState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<FormArray<EmergencyContact>>(
                valuesUpdatedState.controls.emergencyContacts
              )).controls[1] as FormGroup<EmergencyContact>),
              valid: false,
              errors: {
                firstNameNotSameAsLast: true,
              },
              controls: {
                ...(
                  (<FormArray<EmergencyContact>>(
                    valuesUpdatedState.controls.emergencyContacts
                  )).controls[1] as FormGroup<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<FormArray<EmergencyContact>>(
                      valuesUpdatedState.controls.emergencyContacts
                    )).controls[1] as FormGroup<EmergencyContact>
                  ).controls.firstName,
                },
              },
            },
          ],
        },
      },
    });
  });
});

describe('getFormControl', () => {
  const contactFormGroup = buildControlState(config) as FormGroup<Contact>;
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
    validating: false,
  };

  it('should get form control', () => {
    expect(getFormControl(['firstName'], contactFormGroup)).toEqual({
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      pristineValue: '',
      valid: false,
      errors: {
        required: true,
      },
    } as FormControl<string>);

    expect(
      getFormControl(['doctorInfo', 'firstName'], contactFormGroup),
    ).toEqual({
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      value: '',
      pristineValue: '',
      valid: false,
      errors: {
        required: true,
      },
    } as FormControl<string>);

    expect(getFormControl(['emergencyContacts'], contactFormGroup)).toEqual({
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: [] as EmergencyContact[],
      pristineValue: [] as EmergencyContact[],
      controls: [] as FormControl<EmergencyContact>[],
      valid: false,
      errors: {
        required: true,
      },
    } as FormArray<EmergencyContact[]>);
  });
});

describe('handleAsyncValidationResponseSuccess', () => {
  it('should update errors for control', () => {
    const initialValue = [
      {
        firstName: '',
        lastName: '',
        email: '',
        relation: '',
      },
    ];
    const nonEmptyConfig = {
      ...(config.formGroupControls
        .emergencyContacts as FormArrayConfig<unknown>),
      initialValue,
    };

    const stateConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: nonEmptyConfig,
      },
    };
    const initialState = buildControlState(stateConfig) as FormGroup<Contact>;

    expect(
      handleAsyncValidationResponseSuccess(
        initialState,
        ['emergencyContacts', 0, 'email'],
        {
          uniqueEmail: true,
          blacklistedEmail: true,
        },
      ),
    ).toEqual({
      ...initialState,
      controls: {
        ...initialState.controls,
        emergencyContacts: {
          ...initialState.controls.emergencyContacts,
          controls: [
            {
              ...(<FormArray<unknown>>initialState.controls.emergencyContacts)
                .controls[0],
              controls: {
                ...(<FormGroup<unknown>>(
                  (<FormArray<unknown>>initialState.controls.emergencyContacts)
                    .controls[0]
                )).controls,
                email: {
                  ...(<FormGroup<unknown>>(
                    (<FormArray<unknown>>(
                      initialState.controls.emergencyContacts
                    )).controls[0]
                  )).controls.email,
                  errors: {
                    email: false,
                    required: true,
                    uniqueEmail: true,
                    blacklistedEmail: true,
                  },
                },
              },
            },
          ],
        },
      },
    });
  });
});

describe('buildFormsReducer', () => {
  const initialState = buildControlState(config) as FormGroup<Contact>;
  const formsReducer = buildFormsReducer(config);

  it('should build proper reducer and react to update value', () => {
    expect(
      formsReducer(
        initialState,
        controlChange({
          value: 'Homer',
          controlRef: ['firstName'],
        }),
      ),
    ).toEqual({
      ...initialState,
      errors: {
        firstNameNotSameAsLast: false,
      },
      value: {
        firstName: 'Homer',
        lastName: '',
        email: '',
        phone: '',
        emergencyContacts: [],
        doctorInfo: {
          firstName: '',
          lastName: '',
          email: '',
        },
      },
      controls: {
        ...initialState.controls,
        firstName: {
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: false,
          touched: false,
          valid: true,
          errors: {
            required: false,
          },
          validating: false,
        },
      },
    });
  });
});
