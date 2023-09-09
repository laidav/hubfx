import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FormGroupConfig,
  FormControlType,
  FormControlConfig,
  Validators,
  getControl,
} from '@hubfx/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { blacklistedEmail } from '../Testing/AsyncValidators/blacklistedEmail';

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
      {(state) => {
        return (
          <>
            <Field controlRef={['firstName']} component={Input} />
            <div>
              First Name:{' '}
              <span>{getControl(['firstName'], state).value as string}</span>
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
              label="First Name"
            />
            <Field
              controlRef={['lastName']}
              component={Input}
              label="Last Name"
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
            <Field controlRef={['email']} component={Input} label="Email" />
          </div>
        );
      }}
    </Form>
  ),
};
