import React from 'react';
import { WrappedFieldProps } from './Field';
export const Input = ({
  input,
  meta: { touched, errors },
}: WrappedFieldProps) => {
  return (
    <>
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
    </>
  );
};
