import cloneDeep from 'lodash.clonedeep';
import { handleAsyncValidationResponseSuccess } from './handleAsyncValidationResponseSuccess';
import { handleAsyncValidation } from './handleAsyncValidation';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { FORMS_VALUE_CHANGE_EFFECT } from '../Actions/valueChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../Actions/asyncValidationResponseSuccess';
import { getControl } from '../Helpers/getControl';

describe('handleAsyncValidationResponseSuccess', () => {
  it('should update errors for control', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;

    const validatedState = handleAsyncValidationResponseSuccess(initialState, {
      type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
      payload: {
        controlRef: ['email'],
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      },
    }) as FormGroup<Contact>;

    expect(validatedState.controls.email.errors.uniqueEmail).toBe(true);
  });

  it('should update validating status and errors for control', () => {
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
    const control = getControl(controlRef, initialState);

    const validatingState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: control,
    }) as FormGroup<Contact>;

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
