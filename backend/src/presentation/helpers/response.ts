export interface GetResponse<T> {
  status: true;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostResponse {
  status: true;
  message: string;
  data?: unknown;
}

export interface ErrorResponse {
  status: false;
  message: string;
  errors?: string[];
}

export function ok<T>(data: T, message: string = 'Success'): GetResponse<T> {
  return { status: true, message, data };
}

export function okPaginated<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message: string = 'Success',
): GetResponse<T> {
  return {
    status: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function created(message: string = 'Created', data?: unknown): PostResponse {
  return { status: true, message, data };
}

export function error(message: string, errors?: string[]): ErrorResponse {
  return { status: false, message, errors };
}
