import React, { useState, useEffect } from "react";
import { loadScView } from "../api.js";

const cache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string | null>>();

// TODOs expire ?, loading-state ?
export default function ScView({
  name,
  query,
}: {
  name: string;
  query?: Record<string, any>;
}) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `${name}-${JSON.stringify(query)}`;
    setError(null);
    if (cache.has(cacheKey)) {
      setContent(cache.get(cacheKey) as string);
    } else if (pendingRequests.has(cacheKey)) {
      // is already loading => wait for it
      pendingRequests.get(cacheKey)?.then((data) => {
        if (data) setContent(data);
      });
    } else {
      // not in cache => load and add pending request
      const requestPromise = loadScView(name, query)
        .then((data) => {
          cache.set(cacheKey, data);
          return data;
        })
        .catch((error) => {
          console.error("Error loading content:", error);
          setError(error.message || "Unknown error");
          return null;
        })
        .finally(() => {
          pendingRequests.delete(cacheKey);
        });
      pendingRequests.set(cacheKey, requestPromise);
      const load = async () => {
        try {
          const data = await requestPromise;
          if (data) setContent(data);
        } catch (error: any) {
          console.error("Error setting content:", error);
          setError(error.message || "Unknown error");
        }
      };
      load();
    }
  }, [name]);

  return error ? (
    <div>Error: {error}</div>
  ) : (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
