import { Subscription, Observable } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import { HubFactory } from '../Factories/HubFactory';
import {
  controlChange,
  addGroupControl,
  addFormArrayControl,
  removeControl,
  resetControl,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
} from './Forms.actions';
import {
  FormControlConfig,
  FormGroupConfig,
  FormControlType,
  FormArrayConfig,
  FormGroup,
} from './Models/Forms';
import {
  blacklistedDoctorType,
  uniqueEmail,
  blacklistedEmail,
  uniqueFirstAndLastName,
} from './AsyncValidators';
import { buildControlState } from './buildControlState';
import { Action } from '../Models/Action';
import { formsReducer } from './FormsReducer.reducer';
import {
  emergencyContactConfigs,
  config as fullConfig,
  firstNameNotSameAsLast,
} from './Tests/config';
import { required, email } from './Validators';
import { Contact } from './Tests/Models/Contact';

describe('Form.actions', () => {
  let messages: Action<unknown>[] = [];
  let dispatch: (action: Action<unknown>) => void;
  let messages$: Observable<Action<unknown>>;
  let subscription: Subscription;

  //TODO:  Refactor this helper so we can use it multiple tests
  const assertMessages = (
    expectedMessages: Action<unknown>[],
    done: jest.DoneCallback,
    timeout = 1000,
  ) => {
    setTimeout(() => {
      expect(messages).toEqual(expectedMessages);
      done();
    }, timeout);
  };

  beforeEach(() => {
    const hub = HubFactory();
    dispatch = hub.dispatch;
    messages$ = hub.messages$;
    messages = [];
    subscription = messages$.subscribe((message) => {
      messages = messages.concat(message);
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  describe('controlChange', () => {
    it('should run async validations for a form control', (done) => {
      const config: FormControlConfig<string> = {
        initialValue: '',
        asyncValidators: [uniqueEmail],
      };

      const state = buildControlState(config);
      const actions = controlChange(
        {
          value: 'new@email.com',
          controlRef: [],
        },
        state,
        formsReducer,
      );
      dispatch(...actions);

      assertMessages(
        [
          ...actions,
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueEmail: true,
              },
            },
          },
        ],
        done,
      );
    });

    it('should run async validations for a form control and all anscestors', (done) => {
      const config = cloneDeep(fullConfig);

      config.formGroupControls.emergencyContacts.formArrayControls =
        emergencyContactConfigs;

      const state = buildControlState(config);
      const actions = controlChange(
        {
          controlRef: ['emergencyContacts', 1, 'email'],
          value: 'moechanged@email.com',
        },
        state,
        formsReducer,
      );

      dispatch(...actions);
      assertMessages(
        [
          ...actions,
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1, 'email'],
              validatorIndex: 0,
              errors: {
                uniqueEmail: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1, 'email'],
              validatorIndex: 1,
              errors: {
                blacklistedEmail: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
        ],
        done,
      );
    });

    it('should run async validations for multiple form controls and all common anscestors', (done) => {
      const config = cloneDeep(fullConfig);

      config.formGroupControls.emergencyContacts.formArrayControls =
        emergencyContactConfigs;

      const state = buildControlState(config);

      const actionsOne = controlChange(
        {
          controlRef: ['emergencyContacts', 1, 'email'],
          value: 'moechanged@email.com',
        },
        state,
        formsReducer,
      );

      const actionsTwo = controlChange(
        {
          controlRef: ['emergencyContacts', 0, 'email'],
          value: 'homerchanged@email.com',
        },
        state,
        formsReducer,
      );

      dispatch(...actionsOne);

      setTimeout(() => {
        dispatch(...actionsTwo);
      }, 0);

      assertMessages(
        [
          ...actionsOne,
          ...actionsTwo,
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1, 'email'],
              validatorIndex: 0,
              errors: {
                uniqueEmail: true,
              },
            },
          },
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
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1, 'email'],
              validatorIndex: 1,
              errors: {
                blacklistedEmail: true,
              },
            },
          },
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
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 1],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 0],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
        ],
        done,
      );
    });
  });

  describe('addGroupControl', () => {
    it('should run async validations for an added control and all anscenstors', (done) => {
      const config = cloneDeep(fullConfig);

      const state = buildControlState(config);
      const actions = addGroupControl(
        {
          controlRef: ['doctorInfo', 'type'],
          config: {
            initialValue: 'proctologist',
            validators: [required],
            asyncValidators: [blacklistedDoctorType],
          } as FormControlConfig<string>,
        },
        state,
        formsReducer,
      );
      dispatch(...actions);
      assertMessages(
        [
          ...actions,
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['doctorInfo'],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['doctorInfo', 'type'],
              validatorIndex: 0,
              errors: {
                blacklistedDoctorType: true,
              },
            },
          },
        ],
        done,
      );
    });
  });

  describe('addFormArrayControl', () => {
    it('should run async validations for an added control and all anscenstors', (done) => {
      const config = cloneDeep(fullConfig);

      const state = buildControlState(config);

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
      const actions = addFormArrayControl(
        {
          controlRef: ['emergencyContacts'],
          config: newControlConfig,
        },
        state,
        formsReducer,
      );
      dispatch(...actions);
      assertMessages(
        [
          ...actions,
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
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 0],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
        ],
        done,
      );
    });
  });

  describe('removeControl', () => {
    it('should run asyncvalidation on all anscestors', (done) => {
      const clonedConfig: FormGroupConfig = cloneDeep(fullConfig);
      (<FormArrayConfig>(
        clonedConfig.formGroupControls.emergencyContacts
      )).formArrayControls = emergencyContactConfigs;
      const state = buildControlState(clonedConfig) as FormGroup<Contact>;

      const controlRef = ['emergencyContacts', 0];
      const actions = removeControl(controlRef, state, formsReducer);
      dispatch(...actions);
      assertMessages(
        [
          ...actions,
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
        ],
        done,
      );
    });
  });

  describe('resetControl', () => {
    it('should run async validation on reset control and all anscestors', (done) => {
      const clonedConfig = cloneDeep(fullConfig);
      (<FormArrayConfig>(
        clonedConfig.formGroupControls.emergencyContacts
      )).formArrayControls = emergencyContactConfigs;
      const state = buildControlState(clonedConfig) as FormGroup<Contact>;

      const controlRef = ['emergencyContacts', 0];
      const actions = resetControl(controlRef, state, formsReducer);
      dispatch(...actions);
      assertMessages(
        [
          ...actions,
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
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts'],
              validatorIndex: 0,
              errors: {
                arrayLengthError: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['emergencyContacts', 0],
              validatorIndex: 0,
              errors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
        ],
        done,
      );
    });
  });
});
