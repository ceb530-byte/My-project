export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public source?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate, ...init } = options ?? {};
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });

  if (!response.ok) {
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      url
    );
  }

  return response.json() as Promise<T>;
}
