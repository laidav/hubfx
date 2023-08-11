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

export const emergencyContactConfigs: FormGroupConfig[] = [
  {
    controlType: FormControlType.Group,
    validators: [firstNameNotSameAsLast],
    asyncValidators: [uniqueFirstAndLastName],
    formGroupControls: {
      firstName: {
        initialValue: 'Homer',
        validators: [required],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'Simpson',
        validators: [required],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'homer@homer.com',
        validators: [required, email],
        asyncValidators: [uniqueEmail, blacklistedEmail],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: [required],
      } as FormControlConfig<string>,
    },
  },
  {
    controlType: FormControlType.Group,
    validators: [firstNameNotSameAsLast],
    asyncValidators: [uniqueFirstAndLastName],
    formGroupControls: {
      firstName: {
        initialValue: 'moe',
        validators: [required],
      } as FormControlConfig<string>,
      lastName: {
        initialValue: 'syzlak',
        validators: [required],
      } as FormControlConfig<string>,
      email: {
        initialValue: 'moe@moe.com',
        validators: [required, email],
        asyncValidators: [uniqueEmail, blacklistedEmail],
      } as FormControlConfig<string>,
      relation: {
        initialValue: 'friend',
        validators: [required],
      } as FormControlConfig<string>,
    },
  },
];

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
      controlType: FormControlType.Array,
      validators: [required],
      asyncValidators: [arrayLengthError],
    } as FormArrayConfig,
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
