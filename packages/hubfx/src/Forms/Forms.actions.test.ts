import { Subscription } from 'rxjs';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import {
  controlChange,
  FORMS_CONTROL_CHANGE,
  FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
} from './Forms.actions';
import { FormControlConfig } from './Models/Forms';
import { uniqueEmail } from './AsyncValidators';
import { buildControlState } from './buildControlState';
import { Action } from '../Models/Action';
import { formsReducer } from './FormsReducer.reducer';

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

  it('should run async validations for a form control and all anscestors', () => {});

  it('should run async validations for multiple form controls and all common anscestors', () => {});
});
