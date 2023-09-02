import cloneDeep from 'lodash.clonedeep';
import { handleAsyncValidation } from './handleAsyncValidation';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { FORMS_VALUE_CHANGE_EFFECT } from '../Actions/valueChange';
import { getFormControl } from '../Helpers/getFormControl';

describe('handleAsyncValidation', () => {
  it('should update validation', () => {
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

    const controlRef = ['emergencyContacts', 0, 'email'];
    const control = getFormControl(controlRef, initialState);

    const newState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: control,
    });

    expect(newState).toEqual(expectedState);
  });
});
