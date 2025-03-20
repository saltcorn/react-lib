import { useState, useEffect } from "react";
import { fetchOneRow, fetchRows } from "./api.js";

interface HookFetchResult<T> {
  rows: T[];
  error: string | null;
}

interface HookFetchOneResult<T> {
  row: T | null;
  error: string | null;
}

export function useFetchOneRow<T>(
  tableName: string,
  query: Record<string, any> = {},
  dependencies: any[] = []
): HookFetchOneResult<T> {
  const [row, setRow] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchOneRow<T>(tableName, query).then(
      (row) => setRow(row),
      (err) => setError(err.message)
    );
  }, [...dependencies]);

  return { row, error };
}

export function useFetchRows<T>(
  tableName: string,
  query: Record<string, any> = {},
  dependencies: any[] = []
): HookFetchResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchRows<T>(tableName, query).then(
      (rows) => setRows(rows),
      (err) => setError(err.message)
    );
  }, [...dependencies]);
  return { rows, error };
}
