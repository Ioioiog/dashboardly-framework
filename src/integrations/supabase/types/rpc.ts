export interface RpcResponse<T> {
  data: T;
  error: Error | null;
}

export interface SetClaimParams {
  name: string;
  value: string;
}