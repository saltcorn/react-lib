declare global {
  interface Window {
    common_done: (data: any) => Promise<void>;
    _sc_globalCsrf: string;
    saltcorn: any;
  }
}

const isMobile = typeof parent.saltcorn?.mobileApp !== "undefined";

function buildQuery(query: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const key in query) {
    if (query[key] !== undefined) {
      params.append(key, query[key]);
    }
  }
  return params.toString();
}

async function webOrMobileCall(
  path: string,
  query: Record<string, any>,
  method: string,
  body?: any
): Promise<any> {
  const queryString = buildQuery(query);
  if (isMobile) {
    const data = await parent.saltcorn.mobileApp.navigation.router.resolve({
      pathname: `${method.toLowerCase()}${path}`,
      query: queryString,
      body: body,
      alerts: [],
    });
    return data;
  } else {
    const fullPath = queryString ? `${path}?${queryString}` : path;
    const response = await fetch(fullPath, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": window._sc_globalCsrf,
        "X-Requested-With": "XMLHttpRequest",
        "X-Saltcorn-Client": "react-view",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return response.json();
  }
}

export async function fetchRows<T>(
  tableName: string,
  query: Record<string, any> = {}
): Promise<T[]> {
  const data = await webOrMobileCall(
    `/api/${encodeURIComponent(tableName)}`,
    query,
    "GET"
  );
  if (data?.success) return data.success;
  if (data?.error) throw new Error(data.error);
  throw new Error("Unknown error");
}

export async function fetchOneRow<T>(
  tableName: string,
  query: Record<string, any>
): Promise<T | null> {
  const data = await webOrMobileCall(
    `/api/${encodeURIComponent(tableName)}`,
    query,
    "GET"
  );
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
    const json = await webOrMobileCall(
      `/api/${encodeURIComponent(tableName)}`,
      {},
      "POST",
      data
    );
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
    const json = await webOrMobileCall(
      `/api/${encodeURIComponent(tableName)}/${id}`,
      {},
      "POST",
      data
    );
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
    const json = await webOrMobileCall(
      `/api/${encodeURIComponent(tableName)}/${id}`,
      {},
      "DELETE"
    );
    if (json?.success) return true;
    return typeof json?.error === "string" ? json.error : "Unknown error";
  } catch (error: any) {
    if (error instanceof TypeError || error.message === "Failed to fetch") {
      return "Unknown error";
    }
    return "Unknown error";
  }
}

// not yet on mobile
export async function loadScView(
  viewName: string,
  query: Record<string, any> = {}
): Promise<string> {
  const queryString = buildQuery(query);
  const response = await fetch(
    `/view/${encodeURIComponent(viewName)}?${queryString}`,
    {
      headers: {
        "X-CSRF-Token": window._sc_globalCsrf,
        "X-Requested-With": "XMLHttpRequest",
        "X-Saltcorn-Client": "react-view",
      },
    }
  );
  if (response.status === 200) return await response.text();
  const json = await response.json().catch(() => ({}));
  if (json?.error) throw new Error(json.error);
  throw new Error("Unknown error");
}

export async function runAction(
  action: string,
  row: Record<string, any> = {}
): Promise<any> {
  try {
    const resp = await webOrMobileCall(
      `/api/action/${encodeURIComponent(action)}`,
      {},
      "POST",
      row
    );
    await window.common_done(resp?.data || {});
    if (resp?.success) return resp.data || resp.success;
    throw new Error(resp?.error || "Unknown error");
  } catch (error: any) {
    await window.common_done(error?.response?.data || {});
    throw error;
  }
}
