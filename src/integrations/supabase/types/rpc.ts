import { Json } from './json';

export interface RpcResponse<T> {
  data: T;
  error: Error | null;
}

export interface SetClaimParams {
  name: string;
  value: string;
}

export interface SetClaimRequest {
  params: Json;
}