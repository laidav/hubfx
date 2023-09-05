import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FormControlConfig, FormControlType } from '@hubfx/forms';
import { Form } from './Form';

const meta: Meta<typeof Form> = {
  component: Form,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const formControlConfig: FormControlConfig<string> = {
  initialValue: 'hello',
  controlType: FormControlType.Field,
};

export const Primary: Story = {
  args: {
    formConfig: formControlConfig,
    children: (state) => {
      console.log(state);
      return (
        <>
          <h1>hello</h1>
        </>
      );
    },
  },
};
