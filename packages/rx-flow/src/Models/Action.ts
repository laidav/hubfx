export type Action<T = undefined> = {
  type: string;
} & (T extends undefined
  ? {}
  : {
      payload: T;
    });
