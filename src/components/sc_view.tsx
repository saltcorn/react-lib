import React, { useState, useEffect, useRef } from "react";
import { loadScView } from "../api.js";

const cache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

/**
 * Renders an embedded Saltcorn view by name, re-fetching whenever `query`
 * changes.
 * @param name - View name.
 * @param query - Query params forwarded to the view.
 * @param onLoad - Called with the raw HTML string each time content loads.
 * @param className - Class name applied to the wrapper div.
 */
export default function ScView({
  name,
  query,
  onLoad,
  className,
}: {
  name: string;
  query?: Record<string, any>;
  onLoad?: (html: string) => void;
  className?: string;
}) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // Always call the latest onLoad without re-running the fetch effect
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  });

  const queryKey = JSON.stringify(query);

  useEffect(() => {
    const cacheKey = `${name}-${queryKey}`;
    setError(null);

    const applyContent = (data: string) => {
      setContent(data);
      onLoadRef.current?.(data);
    };

    if (cache.has(cacheKey)) {
      applyContent(cache.get(cacheKey) as string);
      return;
    }

    if (pendingRequests.has(cacheKey)) {
      pendingRequests.get(cacheKey)?.then((data) => {
        if (data) applyContent(data);
      });
      return;
    }

    const requestPromise = loadScView(name, query)
      .then((data) => {
        cache.set(cacheKey, data);
        return data;
      })
      .catch((err) => {
        console.error("Error loading content:", err);
        setError(err?.response?.data?.error || err.message || "Unknown error");
        return null;
      })
      .finally(() => {
        pendingRequests.delete(cacheKey);
      });

    pendingRequests.set(cacheKey, requestPromise);
    requestPromise.then((data) => {
      if (data) applyContent(data);
    }).catch((err: any) => {
      setError(err?.response?.data?.error || err.message || "Unknown error");
    });
  }, [name, queryKey]);

  return error ? (
    <div className={className}>Error: {error}</div>
  ) : (
    <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
  );
}
