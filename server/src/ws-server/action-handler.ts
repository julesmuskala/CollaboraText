export interface ActionHandler<T> {
  handle: (payload: T) => void;
  validatePayload?: (payload: any) => void;
}
