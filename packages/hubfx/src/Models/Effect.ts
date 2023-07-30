import { OperatorFunction } from 'rxjs';
import { ActionType } from './Action';

export type Effect<T, S> = OperatorFunction<ActionType<T>, ActionType<S>>;
