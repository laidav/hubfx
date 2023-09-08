import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FormGroupConfig,
  FormControlType,
  FormControlConfig,
} from '@hubfx/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';

const meta: Meta<typeof Form> = {
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const formControlConfig: FormGroupConfig = {
  controlType: FormControlType.Group,
  formGroupControls: {
    firstName: {
      initialValue: 'john',
    } as FormControlConfig<string>,
  },
};

export const Primary: Story = {
  render: () => (
    <Form formConfig={formControlConfig}>
      {(state, hub) => {
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
