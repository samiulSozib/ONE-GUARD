
import api from "@/service/api.service";

export type ApiRecord = Record<string, unknown>;

export type DeletionRequest = ApiRecord & {
  id: number;
  status?: string;
  created_at?: string;
  requested_at?: string;
  user_id?: number | null;
  client_id?: number | null;
  guard_id?: number | null;
  email_status?: string | null;
};

export type DeletionListing = {
  items: DeletionRequest[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

function record(input: unknown): ApiRecord | null {
  return input !== null &&
    typeof input === "object" &&
    !Array.isArray(input)
    ? (input as ApiRecord)
    : null;
}

function bodyOf(response: unknown): unknown {
  const outer = record(response);

  if (outer && "body" in outer) {
    return outer.body;
  }

  return response;
}

export function unwrapResponse(response: unknown): ApiRecord {
  return record(bodyOf(response)) ?? {};
}

function int(value: unknown, fallback: number): number {
  const n = Number(value);

  return Number.isFinite(n) && n >= 0
    ? n
    : fallback;
}

export const accountDeletionService = {
  async list(params: {
    page: number;
    per_page: number;
    status?: string;
    search?: string;
    type?: string;
  }): Promise<DeletionListing> {
    const response = await api.get(
      "/admin/account-deletion-requests",
      { params }
    );

    const result = unwrapResponse(response.data);

    const pagination =
      record(result.pagination) ??
      record(result.data) ??
      result;

    const rows = Array.isArray(result.items)
      ? result.items
      : Array.isArray(result.data)
        ? result.data
        : [];

    return {
      items: rows
        .map(record)
        .filter((v): v is ApiRecord => v !== null)
        .filter((v) => Number.isSafeInteger(Number(v.id)))
        .map((v) => ({
          ...v,
          id: Number(v.id),
        })),

      current_page: int(
        pagination.current_page,
        params.page
      ),

      last_page: int(
        pagination.last_page,
        1
      ),

      total: int(
        pagination.total,
        rows.length
      ),

      per_page: int(
        pagination.per_page,
        params.per_page
      ),
    };
  },

  async stats(): Promise<ApiRecord> {
    const response = await api.get(
      "/admin/account-deletion-requests/stats"
    );

    return unwrapResponse(response.data);
  },

  async details(id: number): Promise<ApiRecord> {
    const response = await api.get(
      `/admin/account-deletion-requests/${id}`
    );

    return unwrapResponse(response.data);
  },

  async impact(id: number): Promise<ApiRecord> {
    const response = await api.get(
      `/admin/account-deletion-requests/${id}/impact`
    );

    return unwrapResponse(response.data);
  },

  /**
   * POST /admin/account-deletion-requests/{id}/complete
   *
   * Laravel requires the exact confirmation phrase:
   * DELETE ACCOUNT
   */
  async complete(
    id: number,
    confirmation: string
  ): Promise<ApiRecord> {
    if (confirmation.trim() !== "DELETE ACCOUNT") {
      throw new Error(
        'Please type "DELETE ACCOUNT" to confirm permanent deletion.'
      );
    }

    const response = await api.post(
      `/admin/account-deletion-requests/${id}/complete`,
      {
        confirmation: confirmation.trim(),
      }
    );

    return unwrapResponse(response.data);
  },
};
