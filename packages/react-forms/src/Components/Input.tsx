import React from 'react';
import { WrappedFieldProps } from './Field';
export const Input = ({ input, meta }: WrappedFieldProps) => {
  return (
    <>
      <input {...input} type="text" className={meta.dirty ? 'dirty' : ''} />
      <br />
      {meta.value}
      <br />
      {meta.dirty && <>dirty</>}
      <br />
      {meta.touched && <>touched</>}
    </>
  );
};
