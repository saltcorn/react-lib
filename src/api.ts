declare global {
  interface Window {
    common_done: (data: any) => Promise<void>;
    _sc_globalCsrf: string;
  }
}

function buildQuery(query: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const key in query) {
    if (query[key] !== undefined) {
      params.append(key, query[key]);
    }
  }
  return params.toString();
}

export async function fetchRows<T>(
  tableName: string,
  query: Record<string, any> = {}
): Promise<T[]> {
  const queryString = buildQuery(query);
  const res = await fetch(
    `/api/${encodeURIComponent(tableName)}?${queryString}`,
    {
      headers: {
        "X-CSRF-Token": window._sc_globalCsrf,
      },
    }
  );
  const data = await res.json();
  if (data?.success) return data.success;
  if (data?.error) throw new Error(data.error);
  throw new Error("Unknown error");  
}

export async function fetchOneRow<T>(
  tableName: string,
  query: Record<string, any>
): Promise<T | null> {
  const queryString = buildQuery(query);
  const res = await fetch(
    `/api/${encodeURIComponent(tableName)}?${queryString}`,
    {
      headers: {
        "X-CSRF-Token": window._sc_globalCsrf,
      },
    }
  );
  const data = await res.json();
  if (data?.success) {
    return data.success.length > 0 ? data.success[0] : null;
  } else if (data?.error) throw new Error(data.error);
  else throw new Error("Unknown error");
}

export async function insertRow(
  tableName: string,
  data: any
): Promise<string | boolean> {
  try {
    const res = await fetch(`/api/${encodeURIComponent(tableName)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window._sc_globalCsrf,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json?.success) return true;
    return typeof json?.error === "string" ? json.error : "Unknown error";
  } catch (error: any) {
    if (error instanceof TypeError || error.message === "Failed to fetch") {
      return "Unknown error";
    }
    return "Unknown error";
  }
}

export async function updateRow(
  tableName: string,
  id: number | string,
  data: any
): Promise<string | boolean> {
  try {
    const res = await fetch(`/api/${encodeURIComponent(tableName)}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window._sc_globalCsrf,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json?.success) return true;
    return typeof json?.error === "string" ? json.error : "Unknown error";
  } catch (error: any) {
    if (error instanceof TypeError || error.message === "Failed to fetch") {
      return "Unknown error";
    }
    return "Unknown error";
  }
}

export async function deleteRow(
  tableName: string,
  id: number | string
): Promise<boolean | string> {
  try {
    const res = await fetch(`/api/${encodeURIComponent(tableName)}/${id}`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": window._sc_globalCsrf,
      },
    });
    const json = await res.json();
    if (json?.success) return true;
    return typeof json?.error === "string" ? json.error : "Unknown error";
  } catch (error: any) {
    if (error instanceof TypeError || error.message === "Failed to fetch") {
      return "Unknown error";
    }
    return "Unknown error";
  }
}

export async function loadScView(
  viewName: string,
  query: Record<string, any> = {}
): Promise<string> {
  const queryString = buildQuery(query);
  const res = await fetch(
    `/view/${encodeURIComponent(viewName)}?${queryString}`,
    {
      headers: {
        "X-CSRF-Token": window._sc_globalCsrf,
        "X-Requested-With": "XMLHttpRequest",
        "X-Saltcorn-Client": "react-view",
      },
    }
  );
  if (res.status === 200) return await res.text();
  const json = await res.json().catch(() => ({}));
  if (json?.error) throw new Error(json.error);
  throw new Error("Unknown error");
}

export async function runAction(
  action: string,
  row: Record<string, any> = {}
): Promise<any> {
  try {
    const res = await fetch(`/api/action/${encodeURIComponent(action)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window._sc_globalCsrf,
        "X-Requested-With": "XMLHttpRequest",
        "X-Saltcorn-Client": "react-view",
      },
      body: JSON.stringify(row),
    });
    const data = await res.json();
    await window.common_done(data?.data || {});
    if (data?.success) return data.data || data.success;
    throw new Error(data?.error || "Unknown error");
  } catch (error: any) {
    await window.common_done(error?.response?.data || {});
    throw error;
  }
}
