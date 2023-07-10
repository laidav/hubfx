import { OperatorFunction } from 'rxjs';
import { Action } from './Action';

export type Effect<T> = OperatorFunction<Action<unknown>, Action<T>>;
