import React, { useContext, ChangeEvent, DragEvent, FocusEvent } from 'react';
import {
  ControlChange,
  controlChange,
  ControlRef,
  getFormControl,
  markControlAsTouched,
  FormControl,
} from '@hubfx/forms';
import { FormContext } from './Form';

export type EventHandler<Event> = (event: Event, name?: string) => void;

export interface CommonFieldInputProps {
  name: string;
  //TODO: these drag drop and focus events
  onDragStart?: EventHandler<DragEvent<unknown>>;
  onDrop?: EventHandler<DragEvent<unknown>>;
  onFocus?: EventHandler<FocusEvent<unknown>>;
}

export interface EventOrValueHandler<Event> extends EventHandler<Event> {
  (value: unknown): void;
}

export interface WrappedFieldInputProps extends CommonFieldInputProps {
  value: unknown;
  onBlur: EventOrValueHandler<FocusEvent<unknown>>;
  onChange: EventOrValueHandler<ChangeEvent<unknown>>;
}

export interface FieldProps {
  component: React.JSXElementConstructor<{
    input: WrappedFieldInputProps;
    control: FormControl<unknown>;
  }>;
  controlRef: ControlRef;
}

const Field = ({ component: Component, controlRef, ...props }: FieldProps) => {
  const { state, reducer, dispatch } = useContext(FormContext);
  const control = getFormControl(controlRef, state);
  const inputProps = {
    name: controlRef.join('.'),
    value: control.value,
    onBlur: () => {
      dispatch(markControlAsTouched(controlRef));
    },
    onChange: (value: unknown) => {
      const change: ControlChange<unknown> = {
        controlRef,
        value,
      };
      dispatch(...controlChange(change, state, reducer));
    },
  };

  return <Component input={inputProps} control={control} {...props} />;
};

export default Field;
