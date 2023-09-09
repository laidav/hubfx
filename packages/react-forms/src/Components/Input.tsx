import React from 'react';
import { WrappedFieldProps } from './Field';

export interface InputProps extends WrappedFieldProps {
  label?: string;
}

export const Input = ({
  input,
  meta: { touched, errors },
  label,
}: InputProps) => {
  return (
    <div className="mb-3">
      {label && (
        <label
          className={`form-label ${
            touched && errors.required ? 'text-danger' : ''
          }`}
        >
          {label}
        </label>
      )}
      <input
        {...input}
        type="text"
        className={`form-control ${
          touched && errors.required ? 'is-invalid' : ''
        }`}
      />
      {touched && errors.required && (
        <div>
          <small className="text-danger">Field is required</small>
        </div>
      )}
    </div>
  );
};
