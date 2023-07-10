import {
  FormControlType,
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
} from '../Models/Forms';
import { required, email, phoneNumber } from '../Validators';
import {
  uniqueEmail,
  uniqueFirstAndLastName,
  arrayLengthError,
  blacklistedEmail,
} from '../AsyncValidators';
import { EmergencyContact } from './Models/EmergencyContact';

interface FullName {
  firstName: string;
  lastName: string;
}

export const firstNameNotSameAsLast = (value: FullName) => {
  return {
    firstNameNotSameAsLast: value.firstName === value.lastName,
  };
};

export const config: FormGroupConfig = {
  controlType: FormControlType.Group,
  validators: [firstNameNotSameAsLast],
  asyncValidators: [uniqueFirstAndLastName],
  formGroupControls: {
    firstName: {
      initialValue: '',
      validators: [required],
    } as FormControlConfig<string>,
    lastName: {
      initialValue: '',
      validators: [required],
    } as FormControlConfig<string>,
    email: {
      initialValue: '',
      validators: [required, email],
      asyncValidators: [uniqueEmail],
    } as FormControlConfig<string>,
    phone: {
      initialValue: '',
      validators: [required, phoneNumber],
    } as FormControlConfig<string>,
    emergencyContacts: {
      initialValue: [],
      controlType: FormControlType.Array,
      validators: [required],
      asyncValidators: [arrayLengthError],
      arrayControlsTemplate: {
        controlType: FormControlType.Group,
        validators: [firstNameNotSameAsLast],
        asyncValidators: [uniqueFirstAndLastName],
        formGroupControls: {
          firstName: {
            initialValue: '',
            validators: [required],
          },
          lastName: {
            initialValue: '',
            validators: [required],
          },
          email: {
            initialValue: '',
            validators: [required, email],
            asyncValidators: [uniqueEmail, blacklistedEmail],
          },
          relation: { initialValue: '', validators: [required] },
        },
      } as FormGroupConfig,
    } as FormArrayConfig<EmergencyContact[]>,
    doctorInfo: {
      controlType: FormControlType.Group,
      validators: [firstNameNotSameAsLast],
      asyncValidators: [uniqueFirstAndLastName],
      formGroupControls: {
        firstName: {
          initialValue: '',
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: '',
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: '',
          validators: [required, email],
          asyncValidators: [uniqueEmail, blacklistedEmail],
        } as FormControlConfig<string>,
      },
    } as FormGroupConfig,
  },
};
