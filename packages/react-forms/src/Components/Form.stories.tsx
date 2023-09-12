import React, { Fragment } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FormGroupConfig,
  FormControlType,
  FormControlConfig,
  Validators,
  FormArrayConfig,
  FormGroup,
} from '@hubfx/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { ContactForm } from './ContactForm';
import { blacklistedEmail } from '../Testing/AsyncValidators/blacklistedEmail';
import { arrayLengthRequired } from '../Testing/Validators/arrayLengthRequired';
import { FormArray } from './FormArray';
import { Contact } from '../Testing/Models/Contact';

const meta: Meta<typeof Form> = {
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

export const BasicControl: Story = {
  render: () => (
    <Form
      formConfig={
        {
          controlType: FormControlType.Group,
          formGroupControls: {
            firstName: {
              initialValue: 'john',
            } as FormControlConfig<string>,
          },
        } as FormGroupConfig
      }
    >
      {({ getControl }) => {
        return (
          <>
            <Field controlRef={['firstName']} component={Input} />
            <div>
              First Name:{' '}
              <span>{getControl(['firstName']).value as string}</span>
            </div>
          </>
        );
      }}
    </Form>
  ),
};

export const Validation: Story = {
  render: () => (
    <Form
      formConfig={
        {
          controlType: FormControlType.Group,
          formGroupControls: {
            firstName: {
              initialValue: 'John',
              validators: [Validators.required],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: '',
              validators: [Validators.required],
            } as FormControlConfig<string>,
          },
        } as FormGroupConfig
      }
    >
      {() => {
        return (
          <div className="form-group">
            <Field
              controlRef={['firstName']}
              component={Input}
              label="First Name (required)"
            />
            <Field
              controlRef={['lastName']}
              component={Input}
              label="Last Name (required)"
            />
          </div>
        );
      }}
    </Form>
  ),
};

export const AsyncValidation: Story = {
  render: () => (
    <Form
      formConfig={
        {
          controlType: FormControlType.Group,
          formGroupControls: {
            firstName: {
              initialValue: 'John',
              validators: [Validators.required],
            } as FormControlConfig<string>,
            lastName: {
              initialValue: 'Doe',
              validators: [Validators.required],
            } as FormControlConfig<string>,
            email: {
              initialValue: '',
              validators: [Validators.required, Validators.email],
              asyncValidators: [blacklistedEmail],
            } as FormControlConfig<string>,
          },
        } as FormGroupConfig
      }
    >
      {({ state }) => {
        return <ContactForm formGroup={state as FormGroup<Contact>} />;
      }}
    </Form>
  ),
};

const contactFormConfig = ({ firstName, lastName, email }: Contact) => ({
  controlType: FormControlType.Group,
  formGroupControls: {
    firstName: {
      initialValue: firstName,
      validators: [Validators.required],
    } as FormControlConfig<string>,
    lastName: {
      initialValue: lastName,
      validators: [Validators.required],
    } as FormControlConfig<string>,
    email: {
      initialValue: email,
      validators: [Validators.required, Validators.email],
      asyncValidators: [blacklistedEmail],
    } as FormControlConfig<string>,
  },
});

export const FormArrays: Story = {
  render: () => (
    <Form
      formConfig={
        {
          controlType: FormControlType.Group,
          formGroupControls: {
            emergencyContacts: {
              controlType: FormControlType.Array,
              validators: [arrayLengthRequired],
              formArrayControls: [
                {
                  firstName: 'Homer',
                  lastName: 'Simpson',
                  email: 'homer@homer.com',
                },
              ].map(contactFormConfig),
            } as FormArrayConfig,
          },
        } as FormGroupConfig
      }
    >
      {() => {
        return (
          <div className="form-group">
            <p>
              <b>Emergency Contacts:</b>
            </p>
            <FormArray controlRef={['emergencyContacts']}>
              {({ controls, addControl, removeControl }) => (
                <>
                  {controls.map((control, index) => {
                    return (
                      <div key={control.controlRef.join(',')}>
                        <p>
                          <b>Contact #{index + 1}:</b>
                        </p>
                        <div className="d-flex align-items-center">
                          <ContactForm
                            formGroup={control as FormGroup<Contact>}
                          />
                          <button
                            className="ml-5"
                            type="button"
                            onClick={() => {
                              removeControl(control.controlRef);
                            }}
                          >
                            Remove Contact
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      addControl(
                        contactFormConfig({
                          firstName: '',
                          lastName: '',
                          email: '',
                        }),
                      );
                    }}
                  >
                    Add Contact
                  </button>
                </>
              )}
            </FormArray>
          </div>
        );
      }}
    </Form>
  ),
};

export const ResetForm: Story = {};
