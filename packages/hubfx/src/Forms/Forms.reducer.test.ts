import {
  formsReducer,
  getFormControl,
  updateValues,
  updateDirty,
  syncValidate,
  handleAsyncValidationResponseSuccess,
  handleAsyncValidation,
  addFormGroupControl,
  removeControl,
} from './FormsReducer.reducer';
import cloneDeep from 'lodash.clonedeep';
import { buildControlState } from './buildControlState';
import { config } from './Tests/config';
import {
  FORMS_CONTROL_CHANGE,
  FORMS_VALUE_CHANGE_EFFECT,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  FORMS_ADD_GROUP_CONTROL,
  FORMS_REMOVE_CONTROL,
} from './Forms.actions';
import {
  FormGroup,
  FormControl,
  FormArray,
  FormArrayConfig,
  FormGroupConfig,
  FormControlConfig,
} from './Models/Forms';
import { Contact } from './Tests/Models/Contact';
import { EmergencyContact } from './Tests/Models/EmergencyContact';
import { DoctorInfo } from './Tests/Models/DoctorInfo';

describe('updateValues', () => {
  it('should update values only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(
      updateValues(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['firstName'],
          value: 'Homer',
        },
      }),
    ).toEqual({
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
          config: initialState.controls.firstName.config,
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: false,
          touched: false,
          valid: false,
          errors: {
            required: true,
          },
          asyncValidateInProgress: {},
          validating: false,
        },
      },
    });
  });

  it('should update values only for a FormGroup in a FormGroup', () => {
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
            firstName: {
              config: (<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName.config,
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: false,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              asyncValidateInProgress: {},
              validating: false,
            },
            lastName: {
              config: (<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.lastName.config,
              controlRef: ['doctorInfo', 'lastName'],
              pristineValue: '',
              value: '',
              dirty: false,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              asyncValidateInProgress: {},
              validating: false,
            },
            email: {
              config: (<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.email.config,
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
              asyncValidateInProgress: {},
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
          config: initialState.controls.firstName.config,
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: true,
          touched: false,
          valid: false,
          errors: {
            required: true,
          },
          asyncValidateInProgress: {},
          validating: false,
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
              config: (<FormGroup<DoctorInfo>>(
                valuesUpdatedState.controls.doctorInfo
              )).controls.firstName.config,
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: true,
              touched: false,
              valid: false,
              errors: {
                required: true,
              },
              asyncValidateInProgress: {},
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
          config: initialState.controls.firstName.config,
          controlRef: ['firstName'],
          pristineValue: '',
          value: 'Homer',
          dirty: false,
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
              config: (<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName.config,
              controlRef: ['doctorInfo', 'firstName'],
              pristineValue: '',
              value: 'Dr First Name',
              dirty: false,
              touched: false,
              valid: true,
              errors: {
                required: false,
              },
              asyncValidateInProgress: {},
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
    expect(getFormControl(['firstName'], contactFormGroup)).toEqual({
      ...BASE_FORM_CONTROL,
      config: config.formGroupControls.firstName,
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
      config: (<FormGroupConfig>config.formGroupControls.doctorInfo)
        .formGroupControls.firstName,
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
      config: <FormArrayConfig<Contact>>(
        config.formGroupControls.emergencyContacts
      ),
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

    doctorInfo.controls.type = buildControlState(newControlConfig);

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
      buildControlState(occupationControlConfig);

    const newStateWithOccupationControl = addFormGroupControl(newState, {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: { controlRef: ['occupation'], config: occupationControlConfig },
    });

    expect(newStateWithOccupationControl).toEqual(
      expectedStateWithOccupationControl,
    );
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
      payload: { controlRef },
    });

    const expectedState = cloneDeep(initialState);
    delete expectedState.controls.doctorInfo.controls.type;

    expect(newState).toEqual(expectedState);
  });

  it('should remove an array control item', () => {
    const initialValue = [
      {
        firstName: 'Homer',
        lastName: 'Simpson',
        email: 'homer@gmail.com',
        relation: 'dad',
      },
    ];
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig<EmergencyContact[]>>(
      clonedConfig.formGroupControls.emergencyContacts
    )).initialValue = initialValue;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const controlRef = ['emergencyContacts', 0];

    const newState = removeControl(initialState, {
      type: FORMS_REMOVE_CONTROL,
      payload: { controlRef },
    });

    const expectedState: FormGroup<Contact> = cloneDeep(initialState);
    (<FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    )).controls = [];

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
    (<FormArrayConfig<EmergencyContact[]>>(
      clonedConfig.formGroupControls.emergencyContacts
    )).initialValue = initialValue;
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
    const initialValue = [
      {
        firstName: '',
        lastName: '',
        email: '',
        relation: '',
      },
    ];
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig<EmergencyContact[]>>(
      clonedConfig.formGroupControls.emergencyContacts
    )).initialValue = initialValue;

    clonedConfig.asyncValidators = [];
    (<FormArrayConfig<EmergencyContact[]>>(
      clonedConfig.formGroupControls.emergencyContacts
    )).asyncValidators = [];
    (<FormArrayConfig<EmergencyContact[]>>(
      clonedConfig.formGroupControls.emergencyContacts
    )).arrayControlsTemplate.asyncValidators = [];

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
      required: true,
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
      required: true,
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

describe('buildFormsReducer', () => {
  const initialState = buildControlState(config) as FormGroup<Contact>;

  it('should build proper reducer and react to update value', () => {
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
          pristineValue: '',
          value: 'Homer',
          dirty: false,
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
});
