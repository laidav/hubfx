import { ControlRef } from '../Models/ControlRef';

export const isChildControl = (
  childRef: ControlRef,
  parentRef: ControlRef,
): boolean => {
  const result = parentRef.every((key, index) => {
    if (key === '*') {
      return typeof childRef[index] === 'number';
    }

    return childRef[index] === key;
  });

  return result;
};
