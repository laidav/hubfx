import { Action } from '../Models/Action';
import { ControlChange, ControlAsyncValidationResponse } from './Models/Forms';

export const FORMS_CONTROL_CHANGE = 'FORMS_CONTROL_CHANGE';
export const controlChange = <T, S>(
  payload: ControlChange<T, S>,
): Action<ControlChange<T, S>> => ({
  type: FORMS_CONTROL_CHANGE,
  payload,
});

export const FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS =
  'FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS';
export const asyncValidationResponseSuccess = (
  payload: ControlAsyncValidationResponse,
): Action<ControlAsyncValidationResponse> => ({
  type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
  payload,
});
