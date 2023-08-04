import { Subscription } from 'rxjs';
import cloneDeep from 'lodash.clonedeep';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import {
  controlChange,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
} from './Forms.actions';
import { FormControlConfig, FormArrayConfig } from './Models/Forms';
import { uniqueEmail } from './AsyncValidators';
import { buildControlState } from './buildControlState';
import { Action } from '../Models/Action';
import { formsReducer } from './FormsReducer.reducer';
import { config as fullConfig } from './Tests/config';
import { Contact } from './Tests/Models/Contact';

describe('controlChange', () => {
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

    config.formGroupControls.emergencyContacts.initialValue = [
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
            errors: {
              uniqueEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 1, 'email'],
            errors: {
              blacklistedEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts'],
            errors: {
              arrayLengthError: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: [],
            errors: {
              uniqueFirstAndLastName: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 1],
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

    config.formGroupControls.emergencyContacts.initialValue = [
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
            errors: {
              uniqueEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 0, 'email'],
            errors: {
              uniqueEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 1, 'email'],
            errors: {
              blacklistedEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 0, 'email'],
            errors: {
              blacklistedEmail: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts'],
            errors: {
              arrayLengthError: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts'],
            errors: {
              arrayLengthError: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: [],
            errors: {
              uniqueFirstAndLastName: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 1],
            errors: {
              uniqueFirstAndLastName: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: [],
            errors: {
              uniqueFirstAndLastName: true,
            },
          },
        },
        {
          type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
          payload: {
            controlRef: ['emergencyContacts', 0],
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
