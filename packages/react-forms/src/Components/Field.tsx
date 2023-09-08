import React, {
  useContext,
  ChangeEvent,
  DragEvent,
  FocusEvent,
  BaseSyntheticEvent,
} from 'react';
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
  value: any;
  onBlur: EventOrValueHandler<FocusEvent<unknown>>;
  onChange: EventOrValueHandler<ChangeEvent<unknown>>;
}

export interface WrappedFieldProps {
  input: WrappedFieldInputProps;
  meta: FormControl<unknown>;
}

export interface FieldProps {
  component: React.JSXElementConstructor<WrappedFieldProps>;
  controlRef: ControlRef;
}

export const Field = ({
  component: Component,
  controlRef,
  ...props
}: FieldProps) => {
  const { state, reducer, dispatch } = useContext(FormContext);
  const control = getFormControl(controlRef, state);
  const inputProps = {
    name: controlRef.join('.'),
    value: control.value,
    onBlur: () => {
      dispatch(markControlAsTouched(controlRef));
    },
    onChange: (event: BaseSyntheticEvent) => {
      const nativeEvent = event.nativeEvent as InputEvent;
      const change: ControlChange<unknown> = {
        controlRef,
        value: nativeEvent.data,
      };
      dispatch(...controlChange(change, state, reducer));
    },
  };

  return <Component input={inputProps} meta={control} {...props} />;
};