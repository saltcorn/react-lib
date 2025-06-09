import { useState, useEffect } from "react";
import { fetchOneRow, fetchRows, countRows } from "./api.js";

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

interface HookCountResult {
  count: number;
  error: string | null;
  isCounting: boolean;
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
        (err) => setError(err?.message || "Unknown error")
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
        (err) => setError(err?.message || "Unknown error")
      )
      .catch((err) => {
        setError(err?.message || "Unknown error");
        setRows([]);
      })
      .finally(() => setIsLoading(false));
  }, [...dependencies]);
  return { rows, error, isLoading };
}

export function useCountRows(
  tableName: string,
  query: Record<string, any> = {},
  dependencies: any[] = []
): HookCountResult {
  const [count, setCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isCounting, setIsCounting] = useState<boolean>(true);

  useEffect(() => {
    setIsCounting(true);
    countRows(tableName, query)
      .then(
        (count) => setCount(count),
        (err) => setError(err?.message || "Unknown error")
      )
      .catch((err) => {
        setError(err?.message || "Unknown error");
        setCount(0);
      })
      .finally(() => setIsCounting(false));
  }, [...dependencies]);

  return { count, error, isCounting };
}
