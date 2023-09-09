import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FormGroupConfig,
  FormControlType,
  FormControlConfig,
  Validators,
  FormGroup,
} from '@hubfx/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { HubFactory } from '@hubfx/core';

const meta: Meta<typeof Form> = {
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const hub = HubFactory();

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
      hub={hub}
    >
      {(state) => {
        console.log(state);
        return (
          <>
            <Field controlRef={['firstName']} component={Input} />
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
              initialValue: 'john',
              validators: [Validators.required],
            } as FormControlConfig<string>,
          },
        } as FormGroupConfig
      }
      hub={hub}
    >
      {(state) => {
        console.log(state);
        return (
          <>
            <Field controlRef={['firstName']} component={Input} />
          </>
        );
      }}
    </Form>
  ),
};
