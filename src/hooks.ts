import { useState, useEffect } from "react";
import { fetchOneRow, fetchRows } from "./api.js";

interface HookFetchResult<T> {
  rows: T[];
  error: string | null;
  isLoading: boolean;
}

interface HookFetchOneResult<T> {
  row: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useFetchOneRow<T>(
  tableName: string,
  query: Record<string, any> = {},
  dependencies: any[] = []
): HookFetchOneResult<T> {
  const [row, setRow] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetchOneRow<T>(tableName, query)
      .then(
        (row) => setRow(row),
        (err) => setError(err.message)
      )
      .catch((err) => {
        setError(err?.message || "Unknown error");
        setRow(null);
      })
      .finally(() => setIsLoading(false));
  }, [...dependencies]);

  return { row, error, isLoading };
}

export function useFetchRows<T>(
  tableName: string,
  query: Record<string, any> = {},
  dependencies: any[] = []
): HookFetchResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetchRows<T>(tableName, query)
      .then(
        (rows) => setRows(rows),
        (err) => setError(err.message)
      )
      .catch((err) => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => setIsLoading(false));
  }, [...dependencies]);
  return { rows, error, isLoading };
}