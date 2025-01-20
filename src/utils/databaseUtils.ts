import { PostgrestError, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Type guard to check if response has error
export function hasError<T>(
  response: PostgrestResponse<T> | PostgrestSingleResponse<T>
): response is PostgrestResponse<T> & { error: PostgrestError } {
  return response.error !== null;
}

// Type guard to check if response has data
export function hasData<T>(
  response: PostgrestResponse<T> | PostgrestSingleResponse<T>
): response is PostgrestResponse<T> & { data: T } {
  return response.data !== null;
}

// Safe data accessor that handles null checks
export function safeGetData<T>(
  response: PostgrestResponse<T> | PostgrestSingleResponse<T>
): T | null {
  if (hasError(response) || !hasData(response)) {
    return null;
  }
  return response.data;
}

// Type-safe database schema types
export type DbSchema = Database['public'];
export type DbTables = DbSchema['Tables'];
export type TableNames = keyof DbTables;

// Generic type for table rows
export type TableRow<T extends TableNames> = DbTables[T]['Row'];
export type TableInsert<T extends TableNames> = DbTables[T]['Insert'];
export type TableUpdate<T extends TableNames> = DbTables[T]['Update'];

// Type-safe database operation result
export interface DbOperationResult<T> {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
}

// Helper to create a type-safe operation result
export function createDbResult<T>(
  data: T | null = null,
  error: PostgrestError | null = null,
  isLoading = false
): DbOperationResult<T> {
  return { data, error, isLoading };
}

// Type-safe error handler
export function handleDbError(error: PostgrestError): void {
  console.error('Database operation failed:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
}

// Type-safe database operation wrapper
export async function safeDbOperation<T>(
  operation: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>
): Promise<DbOperationResult<T>> {
  try {
    const response = await operation();
    if (hasError(response)) {
      handleDbError(response.error);
      return createDbResult(null, response.error);
    }
    return createDbResult(response.data);
  } catch (error) {
    const dbError = error as PostgrestError;
    handleDbError(dbError);
    return createDbResult(null, dbError);
  }
}

// Type-safe table operation helpers
export function isValidTableName(tableName: string): tableName is TableNames {
  return tableName in ['profiles', 'properties', 'tenancies', 'payments', 'maintenance_requests', 'documents', 'utilities'];
}

// Type guard for checking if a value matches a table row type
export function isTableRow<T extends TableNames>(
  tableName: T,
  value: unknown
): value is TableRow<T> {
  if (!value || typeof value !== 'object') return false;
  // Basic structural check - can be enhanced based on specific table requirements
  return true;
}

// Helper for safely accessing nested properties
export function safeGet<T, K extends keyof T>(obj: T | null, key: K): T[K] | null {
  if (!obj) return null;
  return obj[key];
}

// Type-safe error message formatter
export function formatDbError(error: PostgrestError): string {
  return `Database error: ${error.message}${error.details ? ` (${error.details})` : ''}${
    error.hint ? `\nHint: ${error.hint}` : ''
  }`;
}