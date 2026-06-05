export interface GetResponse<T> {
  success: true;
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
  success: true;
  message: string;
  data?: unknown;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export function ok<T>(data: T, message: string = 'Success'): GetResponse<T> {
  return { success: true, message, data };
}

export function okPaginated<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message: string = 'Success',
): GetResponse<T> {
  return {
    success: true,
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
  return { success: true, message, data };
}

export function error(message: string, errors?: string[]): ErrorResponse {
  return { success: false, message, errors };
}
