import { useState, useEffect, useCallback } from "react";
import { fetchOneRow, fetchRows, countRows, loadScView } from "./api.js";

/** @internal */
interface HookFetchResult<T> {
  rows: T[];
  error: string | null;
  isLoading: boolean;
}

/** @internal */
interface HookFetchOneResult<T> {
  row: T | null;
  error: string | null;
  isLoading: boolean;
}

/** @internal */
interface HookCountResult {
  count: number;
  error: string | null;
  isCounting: boolean;
}

/**
 * Fetches a single row from a Saltcorn table.
 * @param tableName - Table to query.
 * @param query - Filter criteria passed to the API.
 * @param dependencies - Re-fetch when any value changes.
 */
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

/**
 * Fetches multiple rows from a Saltcorn table.
 * @param tableName - Table to query.
 * @param query - Filter criteria passed to the API.
 * @param dependencies - Re-fetch when any value changes.
 */
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

/**
 * Counts rows in a Saltcorn table.
 * @param tableName - Table to query.
 * @param query - Filter criteria passed to the API.
 * @param dependencies - Re-count when any value changes.
 */
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

// Keyed by view name; module-level so it survives pjax navigation
const _viewCache: Record<
  string,
  { hash?: string; pageSize?: number; hasNext?: boolean }
> = {};

/** Props to spread directly onto `ScView` when using {@link useManyView}. */
interface ManyViewProps {
  name: string;
  query: Record<string, any>;
  onLoad: (html: string) => void;
}

/** Return value of {@link useManyView}. */
interface UseManyViewResult {
  /** State hash prefix for this view's pagination/sort keys. */
  hash: string | null;
  /** Current page number (1-based). */
  page: number;
  /** `true` when a next page exists. */
  hasNext: boolean;
  /** `true` once the hash and page size have been discovered. */
  ready: boolean;
  /** Spread onto `ScView`: contains `name`, `query`, and `onLoad`. */
  viewProps: ManyViewProps;
}

/**
 * Tracks pagination and sort state for a paginated Saltcorn view (Feed or
 * List). Works with any view template that exposes `data-sc-state-hash`,
 * `data-sc-rows-per-page`, and `data-sc-total-rows` on its outer element.
 * @param viewName - Name of the embedded view.
 * @param state - Current URL state object (from the `state` prop).
 * @returns Pass `query` and `onLoad` to `ScView`; use `set_state_field` /
 * `set_state_fields` to navigate.
 */
export function useManyView(
  viewName: string,
  state: Record<string, any>
): UseManyViewResult {
  const c = _viewCache[viewName] || {};
  const [hash, setHash] = useState<string | null>(c.hash || null);
  const [pageSize, setPageSize] = useState<number | null>(c.pageSize || null);
  const [hasNext, setHasNext] = useState<boolean>(c.hasNext ?? false);

  // Discover hash and rows_per_page once per session
  useEffect(() => {
    if (hash) return;
    loadScView(viewName).then((h) => {
      const doc = new DOMParser().parseFromString(h, "text/html");
      const el = doc.querySelector("[data-sc-state-hash]");
      const discoveredHash = el?.getAttribute("data-sc-state-hash");
      const discoveredSize = el?.getAttribute("data-sc-rows-per-page");
      if (discoveredHash && discoveredSize) {
        _viewCache[viewName] = {
          ..._viewCache[viewName],
          hash: discoveredHash,
          pageSize: parseInt(discoveredSize),
        };
        setHash(discoveredHash);
        setPageSize(parseInt(discoveredSize));
      }
    });
  }, []);

  const page = hash ? parseInt(state[`_${hash}_page`]) || 1 : 1;

  const query: Record<string, any> = hash && pageSize
    ? {
        [`_${hash}_page`]: page,
        [`_${hash}_pagesize`]: pageSize,
        ...(state[`_${hash}_sortby`]
          ? { [`_${hash}_sortby`]: state[`_${hash}_sortby`] }
          : {}),
        ...(state[`_${hash}_sortdesc`]
          ? { [`_${hash}_sortdesc`]: "on" }
          : {}),
      }
    : {};

  const onLoad = useCallback(
    (html: string) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const el = doc.querySelector("[data-sc-state-hash]");
      const totalRows = parseInt(el?.getAttribute("data-sc-total-rows") ?? "");
      const next =
        !isNaN(totalRows) && pageSize !== null
          ? page * pageSize < totalRows
          : false;
      _viewCache[viewName] = { ..._viewCache[viewName], hasNext: next };
      setHasNext(next);
    },
    [page, pageSize, viewName]
  );

  return {
    hash,
    page,
    hasNext,
    ready: !!(hash && pageSize),
    viewProps: { name: viewName, query, onLoad },
  };
}
