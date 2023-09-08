import React from 'react';
import { WrappedFieldProps } from './Field';
export const Input = ({ input, meta }: WrappedFieldProps) => {
  return (
    <>
      <input {...input} type="text" />
      {meta.value}
    </>
  );
};
