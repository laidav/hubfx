import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FormGroupConfig,
  FormControlType,
  FormControlConfig,
  Validators,
  FormArrayConfig,
} from '@hubfx/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { blacklistedEmail } from '../Testing/AsyncValidators/blacklistedEmail';
import { arrayLengthRequired } from '../Testing/Validators/arrayLengthRequired';
import { FormArray } from './FormArray';

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
      {() => {
        return (
          <div className="form-group">
            <Field
              controlRef={['firstName']}
              component={Input}
              label="First Name"
            />
            <Field
              controlRef={['lastName']}
              component={Input}
              label="Last Name"
            />
            <Field
              controlRef={['email']}
              component={Input}
              label={
                <span>
                  Email <i>(not@allowed.com is blacklisted)</i>
                </span>
              }
            />
          </div>
        );
      }}
    </Form>
  ),
};

export const CrossFieldValidation: Story = {
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
            emergencyContacts: {
              controlType: FormControlType.Array,
              validators: [arrayLengthRequired],
              formArrayControls: [
                {
                  controlType: FormControlType.Group,
                  formGroupControls: {
                    firstName: {
                      initialValue: 'Homer',
                      validators: [Validators.required],
                    } as FormControlConfig<string>,
                    lastName: {
                      initialValue: 'Simpson',
                      validators: [Validators.required],
                    } as FormControlConfig<string>,
                    email: {
                      initialValue: 'Homer@homer.com',
                      validators: [Validators.required, Validators.email],
                      asyncValidators: [blacklistedEmail],
                    } as FormControlConfig<string>,
                  },
                } as FormGroupConfig,
                {
                  controlType: FormControlType.Group,
                  formGroupControls: {
                    firstName: {
                      initialValue: 'Moe',
                      validators: [Validators.required],
                    } as FormControlConfig<string>,
                    lastName: {
                      initialValue: 'Syzlak',
                      validators: [Validators.required],
                    } as FormControlConfig<string>,
                    email: {
                      initialValue: 'moe@syzlak.com',
                      validators: [Validators.required, Validators.email],
                      asyncValidators: [blacklistedEmail],
                    } as FormControlConfig<string>,
                  },
                } as FormGroupConfig,
              ],
            } as FormArrayConfig,
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
              label="First Name"
            />
            <Field
              controlRef={['lastName']}
              component={Input}
              label="Last Name"
            />
            <Field
              controlRef={['email']}
              component={Input}
              label={
                <span>
                  Email <i>(not@allowed.com is blacklisted)</i>
                </span>
              }
            />
            <FormArray controlRef={['emergencyContacts']}>
              {({ controls }) => (
                <>
                  {controls.map((control) => {
                    return (
                      <div key={control.controlRef.join(',')}>
                        {control.controlRef.join(',')}
                      </div>
                    );
                  })}
                </>
              )}
            </FormArray>
          </div>
        );
      }}
    </Form>
  ),
};
