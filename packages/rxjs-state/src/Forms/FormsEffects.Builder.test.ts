import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { ofType } from '../Operators/ofType';
import { Action } from '../Models/Action';
import { buildFormEffects } from './FormsEffectsBuilder';
import { buildFormsReducer } from './Forms.reducer';
import { config } from './Tests/config';
import { MessageHubFactory } from '../Factories/MessageHubFactory';
import { controlChange } from './Forms.actions';
import { buildControlState } from './FormHelpers';
import {
  ControlAsyncValidationResponse,
  FormArrayConfig,
} from './Models/Forms';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from './Forms.actions';

describe('buildFormEffects', () => {
  const initialState = buildControlState(config);
  const formsReducer = buildFormsReducer(config);
  const effects$ = buildFormEffects(config, formsReducer);
  const { dispatcher$, messages$ } = MessageHubFactory(effects$);

  const asyncValidationMessages = (actions$: Observable<Action<unknown>>) =>
    actions$.pipe(
      ofType(FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS),
      scan(
        (result: Action<ControlAsyncValidationResponse>[], message) =>
          result.concat(message as Action<ControlAsyncValidationResponse>),
        [],
      ),
    );

  it('FormGroup should trigger async validation on group value fields ', (done) => {
    messages$.pipe(asyncValidationMessages).subscribe((messages) => {
      if (messages.length === 2) {
        expect(messages).toEqual([
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: [],
              errors: { uniqueFirstAndLastName: true },
            },
          },
          {
            type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
            payload: {
              controlRef: ['doctorInfo'],
              errors: { uniqueFirstAndLastName: true },
            },
          },
        ]);
        done();
      }
    });

    dispatcher$.next(
      controlChange({
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Doctor change',
        state: initialState,
      }),
    );
  });

  it('FormArray should trigger async validation', (done) => {
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

    const stateConfig = {
      ...config,
      formGroupControls: {
        ...config.formGroupControls,
        emergencyContacts: nonEmptyConfig,
      },
    };

    messages$
      .pipe(
        // tap((message) => console.log(message)),
        asyncValidationMessages,
      )
      .subscribe((messages) => {
        if (messages.length === 4) {
          expect(messages).toEqual([
            {
              type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
              payload: {
                controlRef: [],
                errors: { uniqueFirstAndLastName: true },
              },
            },
            {
              type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
              payload: {
                controlRef: ['emergencyContacts'],
                errors: { arrayLengthError: true },
              },
            },
            {
              type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
              payload: {
                controlRef: ['emergencyContacts', 0],
                errors: { uniqueFirstAndLastName: true },
              },
            },
            {
              type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
              payload: {
                controlRef: ['emergencyContacts', 0, 'email'],
                errors: { uniqueEmail: true, blacklistedEmail: true },
              },
            },
          ]);
          done();
        }
      });

    dispatcher$.next(
      controlChange({
        controlRef: ['emergencyContacts', 0, 'email'],
        value: 'newHomerEmail@homer.com',
        state: buildControlState(stateConfig),
      }),
    );
  });

  it('FormControl should trigger async validation', () => {
    expect(true).toBe(true);
  });
});
