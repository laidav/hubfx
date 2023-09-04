import React, { useContext, ChangeEvent, DragEvent, FocusEvent } from 'react';
import { Hub, HubFactory } from '@hubfx/core';
import { ControlChange, controlChange, ControlRef } from '@hubfx/forms';
import { FormContext } from './Form';

export type EventHandler<Event> = (event: Event, name?: string) => void;

export interface CommonFieldInputProps {
  name: string;
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
  component: React.JSXElementConstructor<WrappedFieldInputProps>;
  controlRef: ControlRef;
  hub: Hub;
}

const DefaultInput = (props) => <input {...props} />;

const Field = ({
  component: Component = DefaultInput,
  controlRef,
  hub = HubFactory(),
}: FieldProps) => {
  const { state, reducer, dispatch } = useContext(FormContext);

  return (
    <Component
      onChange={(value: unknown) => {
        const change: ControlChange<unknown> = {
          controlRef,
          value,
        };
        const actions = controlChange(change, state, reducer);
      }}
    />
  );
};

export default Field;
