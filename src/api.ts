import axios, { AxiosError } from "axios";

export async function fetchRows<T>(
  tableName: string,
  query: Record<string, any> = {}
): Promise<T[]> {
  const response = await axios.get(`/api/${tableName}`, {
    headers: {
      "X-CSRF-Token": (window as any)._sc_globalCsrf,
    },
    params: query,
  });
  if (response.data?.success) return response.data.success;
  else if (response.data?.error) throw new Error(response.data.error);
  else throw new Error("Unknown error");
}

export async function fetchOneRow<T>(
  tableName: string,
  query: Record<string, any>
): Promise<T | null> {
  const response = await axios.get(`/api/${tableName}`, {
    headers: {
      "X-CSRF-Token": (window as any)._sc_globalCsrf,
    },
    params: query,
  });
  if (response.data?.success) {
    if (response.data.success.length > 0) return response.data.success[0];
    else return null;
  } else if (response.data?.error) throw new Error(response.data.error);
  else throw new Error("Unknown error");
}

export async function insertRow(
  tableName: string,
  data: any
): Promise<string | boolean> {
  try {
    const response = await axios.post(`/api/${tableName}`, data, {
      headers: {
        "X-CSRF-Token": (window as any)._sc_globalCsrf,
      },
    });
    if (response.data?.success) return true;
    else
      return typeof response.data?.error === "string"
        ? response.data.error
        : "Unknown error";
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return "Unauthorized";
    } else {
      return "Unknown error";
    }
  }
}

export async function updateRow(
  tableName: string,
  id: number,
  data: any
): Promise<string | boolean> {
  try {
    const response = await axios.post(`/api/${tableName}/${id}`, data, {
      headers: {
        "X-CSRF-Token": (window as any)._sc_globalCsrf,
      },
    });
    if (response.data?.success) return true;
    else
      return typeof response.data?.error === "string"
        ? response.data.error
        : "Unknown error";
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return "Unauthorized";
    } else {
      return "Unknown error";
    }
  }
}

export async function deleteRow(
  tableName: string,
  id: number
): Promise<boolean | string> {
  try {
    const response = await axios.delete(`/api/${tableName}/${id}`, {
      headers: {
        "X-CSRF-Token": (window as any)._sc_globalCsrf,
      },
    });
    if (response.data?.success) return true;
    else
      return typeof response.data?.error === "string"
        ? response.data.error
        : "Unknown error";
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      return "Unauthorized";
    } else {
      return "Unknown error";
    }
  }
}

export async function loadScView(
  viewName: string,
  query: Record<string, any> = {}
): Promise<string> {
  const response = await axios.get(`/view/${viewName}`, {
    headers: {
      "X-CSRF-Token": (window as any)._sc_globalCsrf,
      "X-Requested-With": "XMLHttpRequest",
      "X-Saltcorn-Client": "react-view",
    },
    params: query,
  });
  if (response.status === 200) return response.data;
  else if (response.data?.error) throw new Error(response.data.error);
  else throw new Error("Unknown error");
}
