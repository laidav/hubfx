import { Subscription } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import {
  controlChange,
  addGroupControl,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
} from './Forms.actions';
import { FormControlConfig } from './Models/Forms';
import { blacklistedDoctorType, uniqueEmail } from './AsyncValidators';
import { buildControlState } from './buildControlState';
import { Action } from '../Models/Action';
import { formsReducer } from './FormsReducer.reducer';
import { emergencyContactConfigs, config as fullConfig } from './Tests/config';
import { required } from './Validators';
describe('Form.actions', () => {
  let messages = [];
  let dispatch;
  let messages$;
  let subscription: Subscription;

  //TODO:  Refactor this helper so we can use it multiple tests
  const assertMessages = (
    expectedMessages: Action<unknown>[],
    done,
    timeout = 1000,
  ) => {
    setTimeout(() => {
      expect(messages).toEqual(expectedMessages);
      done();
    }, timeout);
  };

  beforeEach(() => {
    const hub = MessageHubFactory();
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

  fdescribe('addGroupControl', () => {
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
      assertMessages([], done);
    });
  });
});
