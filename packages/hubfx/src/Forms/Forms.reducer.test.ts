import {
  formsReducer,
  getFormControl,
  updateValues,
  updateDirty,
  syncValidate,
  handleAsyncValidationResponseSuccess,
  handleAsyncValidation,
  addFormGroupControl,
  addFormArrayControl,
  removeControl,
  getChildControls,
  markControlAsPristine,
  markControlAsTouched,
} from './FormsReducer.reducer';
import cloneDeep from 'lodash.clonedeep';
import { buildControlState } from './buildControlState';
import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from './Tests/config';
import {
  FORMS_CONTROL_CHANGE,
  FORMS_VALUE_CHANGE_EFFECT,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  FORMS_ADD_GROUP_CONTROL,
  FORMS_ADD_FORM_ARRAY_CONTROL,
  FORMS_REMOVE_CONTROL,
  FORMS_RESET_CONTROL,
  FORMS_MARK_CONTROL_AS_PRISTINE,
  FORMS_MARK_CONTROL_AS_TOUCHED,
} from './Forms.actions';
import {
  FormGroup,
  FormControl,
  FormArray,
  FormArrayConfig,
  FormGroupConfig,
  FormControlConfig,
  FormControlType,
} from './Models/Forms';
import { Contact } from './Tests/Models/Contact';
import { EmergencyContact } from './Tests/Models/EmergencyContact';
import { DoctorInfo } from './Tests/Models/DoctorInfo';
import { required, email } from './Validators';
import {
  uniqueEmail,
  uniqueFirstAndLastName,
  blacklistedEmail,
} from './AsyncValidators';

describe('updateValues', () => {
  it('should update values only for a FC -> FG', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const expectedState = {
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
          ...initialState.controls.firstName,
          value: 'Homer',
        },
      },
    };

    const result = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    });

    expect(result).toEqual(expectedState);
  });

  it('should update values only for a FC -> FG -> FG', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(
      updateValues(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['doctorInfo', 'firstName'],
          value: 'Dr First Name',
        },
      }),
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
            ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
              .controls,
            firstName: {
              ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName,
              value: 'Dr First Name',
            },
          },
        },
      },
    });
  });

  it('should update values only for a FC -> FG -> FA -> FG ', () => {
    const emergencyContactsConfig = {
      ...(config.formGroupControls.emergencyContacts as FormArrayConfig),
      formArrayControls: emergencyContactConfigs,
    };

    const nonEmptyConfig: FormGroupConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: emergencyContactsConfig,
      },
    };
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

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as FormGroup<Contact>;

    expect(
      updateValues(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['emergencyContacts', 1, 'firstName'],
          value: 'Moe Flaming',
        },
      }),
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

  it('should update values only for a FG -> FG', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };
    const state = buildControlState(config);
    const expectedState = cloneDeep(state);
    expectedState.value = {
      ...expectedState.value,
      doctorInfo: newDoctorValue,
    };
    expectedState.controls.doctorInfo.value = newDoctorValue;
    expectedState.controls.doctorInfo.controls.firstName.value =
      newDoctorValue.firstName;
    expectedState.controls.doctorInfo.controls.lastName.value =
      newDoctorValue.lastName;
    expectedState.controls.doctorInfo.controls.email.value =
      newDoctorValue.email;

    const newState = updateValues(state, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo'],
        value: {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'dr@hoe.com',
        },
      },
    });

    expect(newState).toEqual(expectedState);
  });

  it('should update values only for a FA -> FG', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;

    const initialState = buildControlState(clonedConfig);
    const newValue: EmergencyContact[] = [
      {
        firstName: 'Milhouse',
        lastName: 'Vanhoutten',
        email: 'thrill@house.com',
        relation: 'friend',
      },
      {
        firstName: 'James',
        lastName: 'Woods',
        email: 'james@woods.com',
        relation: 'cashier',
      },
    ];

    const expectedState = cloneDeep(initialState);

    expectedState.value.emergencyContacts = newValue;
    expectedState.controls.emergencyContacts.value = newValue;
    expectedState.controls.emergencyContacts.controls[0].value = newValue[0];
    expectedState.controls.emergencyContacts.controls[0].controls.firstName.value =
      newValue[0].firstName;
    expectedState.controls.emergencyContacts.controls[0].controls.lastName.value =
      newValue[0].lastName;
    expectedState.controls.emergencyContacts.controls[0].controls.email.value =
      newValue[0].email;
    expectedState.controls.emergencyContacts.controls[0].controls.relation.value =
      newValue[0].relation;
    expectedState.controls.emergencyContacts.controls[1].value = newValue[1];
    expectedState.controls.emergencyContacts.controls[1].controls.firstName.value =
      newValue[1].firstName;
    expectedState.controls.emergencyContacts.controls[1].controls.lastName.value =
      newValue[1].lastName;
    expectedState.controls.emergencyContacts.controls[1].controls.email.value =
      newValue[1].email;
    expectedState.controls.emergencyContacts.controls[1].controls.relation.value =
      newValue[1].relation;

    const newState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts'],
        value: newValue,
      },
    });

    expect(newState).toEqual(expectedState);
  });

  it('should throw an error if trying to update a FG key that does not exist', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
      xyz: 'not here',
    };
    const state = buildControlState(config);

    const newStateFunc = () =>
      updateValues(state, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['doctorInfo'],
          value: newDoctorValue,
        },
      });

    expect(newStateFunc).toThrow(
      TypeError(`The number of keys do not match form group: doctorInfo`),
    );
  });

  it('should throw an error if trying to update a FA index that does not exist', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;
    const state = buildControlState(clonedConfig);

    const newStateFunc = () =>
      updateValues(state, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['emergencyContacts'],
          value: [
            {
              firstName: '',
              lastName: '',
              email: '',
              relation: '',
            },
          ],
        },
      });

    expect(newStateFunc).toThrow(
      TypeError(
        `The number of value items does not match the number of controls in array: emergencyContacts`,
      ),
    );
  });
});

describe('updateDirty', () => {
  it('should verify intitial state is not dirty', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(updateDirty(initialState)).toEqual(initialState);
  });

  it('should update dirty only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    }) as FormGroup<Contact>;
    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          ...initialState.controls.firstName,
          value: 'Homer',
          dirty: true,
        },
      },
    });
  });

  it('should update dirty only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name',
      },
    }) as FormGroup<Contact>;
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
              ...(<FormGroup<DoctorInfo>>valuesUpdatedState.controls.doctorInfo)
                .controls.firstName,
              value: 'Dr First Name',
              dirty: true,
            },
          },
        },
      },
    });
  });

  it('should update dirty only for a FormArray in a FormGroup', () => {
    const emergencyContactsConfig = {
      ...(config.formGroupControls.emergencyContacts as FormArrayConfig),
      formArrayControls: emergencyContactConfigs,
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

    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts', 1, 'firstName'],
        value: 'Moe Flaming',
      },
    }) as FormGroup<Contact>;

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

describe('syncValidate', () => {
  it('should verify intitial state is not valid', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(syncValidate(initialState)).toEqual(initialState);
  });

  it('should validate only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    }) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      errors: {
        firstNameNotSameAsLast: false,
      },
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          ...initialState.controls.firstName,
          value: 'Homer',
          valid: true,
          errors: {
            required: false,
          },
        },
      },
    });
  });

  it('should validate only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name',
      },
    }) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState)).toEqual({
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
              ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName,
              value: 'Dr First Name',
              valid: true,
              errors: {
                required: false,
              },
            },
          },
        },
      },
    });
  });

  it('should validate only for a FormArray in a FormGroup', () => {
    const emergencyContactsConfig = {
      ...(config.formGroupControls.emergencyContacts as FormArrayConfig),
      formArrayControls: emergencyContactConfigs,
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

    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts', 1, 'firstName'],
        value: 'syzlak',
      },
    }) as FormGroup<Contact>;

    expect(syncValidate(valuesUpdatedState)).toEqual({
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

describe('addGroupFormControl', () => {
  it('should add a form control to a group', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const controlRef = ['doctorInfo', 'type'];
    const newControlConfig: FormControlConfig<string> = {
      initialValue: 'proctology',
    };

    const expectedState = cloneDeep(initialState) as FormGroup<Contact>;
    expectedState.value = {
      ...expectedState.value,
      doctorInfo: {
        ...expectedState.value.doctorInfo,
        type: 'proctology',
      },
    };
    const doctorInfo = expectedState.controls
      .doctorInfo as FormGroup<DoctorInfo>;

    doctorInfo.value = {
      ...doctorInfo.value,
      type: 'proctology',
    };

    doctorInfo.controls.type = buildControlState(newControlConfig, controlRef);

    const newState = addFormGroupControl(initialState, {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: { controlRef, config: newControlConfig },
    });

    expect(newState).toEqual(expectedState);

    const occupationControlConfig: FormControlConfig<string> = {
      initialValue: 'carpenter',
    };

    const expectedStateWithOccupationControl = cloneDeep(expectedState);
    expectedStateWithOccupationControl.value = {
      ...expectedState.value,
      occupation: 'carpenter',
    };

    expectedStateWithOccupationControl.controls['occupation'] =
      buildControlState(occupationControlConfig, ['occupation']);

    const newStateWithOccupationControl = addFormGroupControl(newState, {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: { controlRef: ['occupation'], config: occupationControlConfig },
    });

    expect(newStateWithOccupationControl).toEqual(
      expectedStateWithOccupationControl,
    );
  });
});

describe('addFormArrayControl', () => {
  it('should add a form control to formArray', () => {
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
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const newControlConfig: FormGroupConfig = {
      controlType: FormControlType.Group,
      validators: [firstNameNotSameAsLast],
      asyncValidators: [uniqueFirstAndLastName],
      formGroupControls: {
        firstName: {
          initialValue: 'Barney',
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: 'Gumble',
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: 'barney@gumble.com',
          validators: [required, email],
          asyncValidators: [uniqueEmail, blacklistedEmail],
        } as FormControlConfig<string>,
        relation: {
          initialValue: 'astronaut friend',
          validators: [required],
        } as FormControlConfig<string>,
      },
    };

    const newState = addFormArrayControl(initialState, {
      type: FORMS_ADD_FORM_ARRAY_CONTROL,
      payload: {
        config: newControlConfig,
        controlRef: ['emergencyContacts'],
      },
    });

    const newControl = buildControlState(newControlConfig, [
      'emergencyContacts',
      2,
    ]);

    const expectedState = cloneDeep(initialState);
    expectedState.value.emergencyContacts = [
      ...initialValue,
      {
        firstName: 'Barney',
        lastName: 'Gumble',
        email: 'barney@gumble.com',
        relation: 'astronaut friend',
      },
    ];

    expectedState.controls.emergencyContacts.value = [
      ...initialValue,
      {
        firstName: 'Barney',
        lastName: 'Gumble',
        email: 'barney@gumble.com',
        relation: 'astronaut friend',
      },
    ];

    expectedState.controls.emergencyContacts.controls = [
      ...expectedState.controls.emergencyContacts.controls,
      newControl,
    ];

    expect(newState).toEqual(expectedState);
  });
});

describe('removeControl', () => {
  it('should remove a formGroup control', () => {
    const configWithType: FormGroupConfig = cloneDeep(config);

    (<FormGroupConfig>(
      configWithType.formGroupControls.doctorInfo
    )).formGroupControls.type = {
      initialValue: 'test',
    } as FormControlConfig<string>;

    const initialState = buildControlState(
      configWithType,
    ) as FormGroup<Contact>;

    const controlRef = ['doctorInfo', 'type'];
    const newState = removeControl(initialState, {
      type: FORMS_REMOVE_CONTROL,
      payload: controlRef,
    });

    const expectedState = cloneDeep(initialState);
    delete expectedState.controls.doctorInfo.controls.type;
    expectedState.controls.doctorInfo.value = {
      ...expectedState.controls.doctorInfo.value,
      type: undefined,
    };

    expectedState.value = {
      ...expectedState.value,
      doctorInfo: {
        ...expectedState.controls.doctorInfo.value,
        type: undefined,
      },
    };

    expect(newState).toEqual(expectedState);
  });

  it('should remove an array control item', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const controlRef = ['emergencyContacts', 0];

    const newState = removeControl(initialState, {
      type: FORMS_REMOVE_CONTROL,
      payload: controlRef,
    });

    const expectedState: FormGroup<Contact> = cloneDeep(initialState);
    const emergencyContacts = <FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );
    expectedState.value = {
      ...expectedState.value,
      emergencyContacts: [
        {
          firstName: 'moe',
          lastName: 'syzlak',
          email: 'moe@moe.com',
          relation: 'friend',
        },
      ],
    };
    emergencyContacts.controls = [
      {
        ...emergencyContacts.controls[1],
        controlRef: ['emergencyContacts', 0],
        controls: {
          firstName: {
            ...(<FormGroup<EmergencyContact>>emergencyContacts.controls[1])
              .controls.firstName,
            controlRef: ['emergencyContacts', 0, 'firstName'],
          },
          lastName: {
            ...(<FormGroup<EmergencyContact>>emergencyContacts.controls[1])
              .controls.lastName,
            controlRef: ['emergencyContacts', 0, 'lastName'],
          },
          email: {
            ...(<FormGroup<EmergencyContact>>emergencyContacts.controls[1])
              .controls.email,
            controlRef: ['emergencyContacts', 0, 'email'],
          },
          relation: {
            ...(<FormGroup<EmergencyContact>>emergencyContacts.controls[1])
              .controls.relation,
            controlRef: ['emergencyContacts', 0, 'relation'],
          },
        },
      },
    ];
    emergencyContacts.value = [
      {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
    ];

    expect(newState).toEqual(expectedState);
  });
});

describe('handleAsyncValidation', () => {
  it('should update validation', () => {
    const initialValue = [
      {
        firstName: '',
        lastName: '',
        email: '',
        relation: '',
      },
    ];
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const expectedState: FormGroup<Contact> = cloneDeep(initialState);

    const emergencyContacts = <FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );

    const emergencyContact = <FormGroup<EmergencyContact>>(
      emergencyContacts.controls[0]
    );

    const emergencyContactEmail = emergencyContact.controls.email;

    expectedState.validating = true;
    emergencyContacts.validating = true;
    emergencyContact.validating = true;
    emergencyContactEmail.validating = true;
    emergencyContactEmail.asyncValidateInProgress = { 0: true, 1: true };

    const newState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: ['emergencyContacts', 0, 'email'],
    });

    expect(newState).toEqual(expectedState);
  });
});

describe('handleAsyncValidationResponseSuccess', () => {
  it('should update errors for control', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;

    clonedConfig.asyncValidators = [];
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).asyncValidators = [];

    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls.forEach((control) => (control.asyncValidators = []));

    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const controlRef = ['emergencyContacts', 0, 'email'];

    const validatingState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
      key: controlRef.join(':'),
      payload: controlRef,
    });

    const expectedState: FormGroup<Contact> = cloneDeep(validatingState);

    const emergencyContacts = <FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );

    const emergencyContact = <FormGroup<EmergencyContact>>(
      emergencyContacts.controls[0]
    );

    const emergencyContactEmail = emergencyContact.controls.email;
    emergencyContactEmail.asyncValidateInProgress = {
      0: false,
      1: true,
    };
    emergencyContactEmail.errors = {
      email: false,
      required: false,
      uniqueEmail: true,
    };

    let validatingSuccessState = handleAsyncValidationResponseSuccess(
      validatingState,
      {
        type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
        payload: {
          controlRef: ['emergencyContacts', 0, 'email'],
          validatorIndex: 0,
          errors: {
            uniqueEmail: true,
          },
        },
      },
    );

    expectedState.validating = true;
    emergencyContacts.validating = true;
    emergencyContact.validating = true;
    emergencyContactEmail.validating = true;

    expect(validatingSuccessState).toEqual(expectedState);

    validatingSuccessState = handleAsyncValidationResponseSuccess(
      validatingSuccessState,
      {
        type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
        payload: {
          controlRef: ['emergencyContacts', 0, 'email'],
          validatorIndex: 1,
          errors: {
            blacklistedEmail: true,
          },
        },
      },
    );

    emergencyContactEmail.asyncValidateInProgress = {
      0: false,
      1: false,
    };

    emergencyContactEmail.errors = {
      email: false,
      required: false,
      uniqueEmail: true,
      blacklistedEmail: true,
    };

    expectedState.validating = false;
    emergencyContacts.validating = false;
    emergencyContact.validating = false;
    emergencyContactEmail.validating = false;
    expect(validatingSuccessState).toEqual(expectedState);
  });
});

describe('getChildControls', () => {
  it('should get child controls', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>(
      clonedConfig.formGroupControls.emergencyContacts
    )).formArrayControls = emergencyContactConfigs;

    const arrayControl = buildControlState(
      clonedConfig.formGroupControls.emergencyContacts,
    );

    const controlRefs = getChildControls(arrayControl).map(
      ({ controlRef }) => controlRef,
    );

    expect(controlRefs).toEqual([
      [],
      [0],
      [0, 'firstName'],
      [0, 'lastName'],
      [0, 'email'],
      [0, 'relation'],
      [1],
      [1, 'firstName'],
      [1, 'lastName'],
      [1, 'email'],
      [1, 'relation'],
    ]);
  });
});

describe('markControlAsPristine', () => {
  it('should mark a control as pristine for a FG -> FG', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };
    const state = buildControlState(config) as FormGroup<Contact>;
    const expectedChangedState = cloneDeep(state);
    expectedChangedState.value = {
      ...expectedChangedState.value,
      doctorInfo: newDoctorValue,
    };
    expectedChangedState.controls.doctorInfo.value = newDoctorValue;
    expectedChangedState.controls.doctorInfo.controls.firstName.value =
      newDoctorValue.firstName;
    expectedChangedState.controls.doctorInfo.controls.lastName.value =
      newDoctorValue.lastName;
    expectedChangedState.controls.doctorInfo.controls.email.value =
      newDoctorValue.email;

    const changedState = updateValues(state, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo'],
        value: {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'dr@hoe.com',
        },
      },
    }) as FormGroup<Contact>;

    expect(changedState).toEqual(expectedChangedState);

    const newPristineState = markControlAsPristine(changedState, {
      type: FORMS_MARK_CONTROL_AS_PRISTINE,
      payload: ['doctorInfo'],
    });

    const expectedPristineState: FormGroup<Contact> = cloneDeep(changedState);
    const doctorInfoControl: FormGroup<DoctorInfo> = cloneDeep(
      changedState.controls.doctorInfo,
    );
    delete doctorInfoControl.pristineControl;

    const doctorInfoFirstNameControl = cloneDeep(
      doctorInfoControl.controls.firstName,
    );
    delete doctorInfoFirstNameControl.pristineControl;
    const doctorInfoLastNameControl = cloneDeep(
      doctorInfoControl.controls.lastName,
    );
    delete doctorInfoLastNameControl.pristineControl;
    const doctorInfoEmailControl = cloneDeep(doctorInfoControl.controls.email);
    delete doctorInfoEmailControl.pristineControl;

    expect(newPristineState.controls.doctorInfo.pristineControl).toEqual(
      doctorInfoControl,
    );
    expect(
      newPristineState.controls.doctorInfo.controls.firstName.pristineControl,
    ).toEqual(doctorInfoFirstNameControl);
    expect(
      newPristineState.controls.doctorInfo.controls.lastName.pristineControl,
    ).toEqual(doctorInfoLastNameControl);
    expect(
      newPristineState.controls.doctorInfo.controls.email.pristineControl,
    ).toEqual(doctorInfoEmailControl);
  });
});

describe('markControlAsTouched', () => {
  it('should mark control and all anscestors as touched', () => {
    const initialState = buildControlState(config);
    const newState = markControlAsTouched(initialState, {
      type: FORMS_MARK_CONTROL_AS_TOUCHED,
      payload: ['doctorInfo', 'firstName'],
    });

    const expectedState = cloneDeep(initialState) as FormGroup<Contact>;

    expectedState.touched = true;
    (<FormGroup<DoctorInfo>>expectedState.controls.doctorInfo).touched = true;
    (<FormGroup<DoctorInfo>>(
      expectedState.controls.doctorInfo
    )).controls.firstName.touched = true;

    expect(newState).toEqual(expectedState);
  });
});

describe('formsReducer', () => {
  describe('reacting to change control', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;

    it('should react to FORMS_CONTROL_CHANGE for a FC -> FG', () => {
      expect(
        formsReducer(initialState, {
          type: FORMS_CONTROL_CHANGE,
          payload: {
            value: 'Homer',
            controlRef: ['firstName'],
          },
        }),
      ).toEqual({
        ...initialState,
        errors: {
          firstNameNotSameAsLast: false,
        },
        dirty: true,
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
            ...initialState.controls.firstName,
            controlRef: ['firstName'],
            value: 'Homer',
            dirty: true,
            touched: false,
            valid: true,
            errors: {
              required: false,
            },
            asyncValidateInProgress: {},
            validating: false,
          },
        },
      });
    });

    it('should react to a FORMS_CONTROL_CHANGE FG -> FA -> FG', () => {
      const clonedConfig: FormGroupConfig = cloneDeep(config);
      (<FormArrayConfig>(
        clonedConfig.formGroupControls.emergencyContacts
      )).formArrayControls = emergencyContactConfigs;

      const initialState = buildControlState(
        clonedConfig,
      ) as FormGroup<Contact>;

      const newValue = {
        firstName: 'Moe changed',
        lastName: 'Syzlak changed',
        email: 'moe@changed.com',
        relation: 'friend changed',
      };
      const expectedNewState = cloneDeep(initialState);

      expectedNewState.value.emergencyContacts[1] = newValue;
      expectedNewState.dirty = true;
      expectedNewState.controls.emergencyContacts.value = [
        initialState.controls.emergencyContacts.value[0],
        newValue,
      ];
      expectedNewState.controls.emergencyContacts.dirty = true;
      expectedNewState.controls.emergencyContacts.controls[1].value = newValue;
      expectedNewState.controls.emergencyContacts.controls[1].dirty = true;

      expectedNewState.controls.emergencyContacts.controls[1].controls.firstName.value =
        newValue.firstName;
      expectedNewState.controls.emergencyContacts.controls[1].controls.firstName.dirty =
        true;
      expectedNewState.controls.emergencyContacts.controls[1].controls.lastName.value =
        newValue.lastName;
      expectedNewState.controls.emergencyContacts.controls[1].controls.lastName.dirty =
        true;
      expectedNewState.controls.emergencyContacts.controls[1].controls.email.value =
        newValue.email;
      expectedNewState.controls.emergencyContacts.controls[1].controls.email.dirty =
        true;
      expectedNewState.controls.emergencyContacts.controls[1].controls.relation.value =
        newValue.relation;
      expectedNewState.controls.emergencyContacts.controls[1].controls.relation.dirty =
        true;

      const newState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });

      expect(newState).toEqual(expectedNewState);
    });
  });

  describe('when resetting form', () => {
    let clonedConfig: FormGroupConfig;
    let initialState: FormGroup<Contact>;
    const newValue = {
      firstName: 'Moe changed',
      lastName: 'Syzlak changed',
      email: 'moe@changed.com',
      relation: 'friend changed',
    };

    beforeEach(() => {
      clonedConfig = cloneDeep(config);
      (<FormArrayConfig>(
        clonedConfig.formGroupControls.emergencyContacts
      )).formArrayControls = emergencyContactConfigs;

      initialState = buildControlState(clonedConfig) as FormGroup<Contact>;
    });

    it('should reset entire form', () => {
      const changedState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });
      const stateReset = formsReducer(changedState, {
        type: FORMS_RESET_CONTROL,
        payload: [],
      });

      expect(stateReset).toEqual(initialState);
    });

    it('should reset a control and update ancestor values', () => {
      const changedState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });
      const stateReset = formsReducer(changedState, {
        type: FORMS_RESET_CONTROL,
        payload: ['emergencyContacts', 1],
      });
      const expectedState = cloneDeep(changedState) as FormGroup<Contact>;
      expectedState.dirty = false;
      expectedState.value = initialState.value;
      expectedState.controls.emergencyContacts.value =
        initialState.controls.emergencyContacts.value;
      expectedState.controls.emergencyContacts.dirty = false;

      (<FormArray<unknown>>(
        expectedState.controls.emergencyContacts
      )).controls[1] = (<FormArray<unknown>>(
        initialState.controls.emergencyContacts
      )).controls[1];

      expect(stateReset).toEqual(expectedState);
    });
  });
});
