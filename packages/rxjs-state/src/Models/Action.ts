export interface Action<T = undefined> {
  type: string;
  payload?: T;
}
