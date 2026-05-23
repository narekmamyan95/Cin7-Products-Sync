type RetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
};

const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_INITIAL_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 8000;

const sleep = (delayMs: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};
const getHttpStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const response = 'response' in error ? error.response : undefined;

  if (!response || typeof response !== 'object' || !('status' in response)) {
    return undefined;
  }

  return typeof response.status === 'number' ? response.status : undefined;
};

const isNetworkLikeError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? error.code : undefined;

  return (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNABORTED' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN'
  );
};

export const isRetryableError = (error: unknown): boolean => {
  const status = getHttpStatus(error);

  if (status === 429) {
    return true;
  }

  if (status && status >= 500 && status < 600) {
    return true;
  }

  return isNetworkLikeError(error);
};

export const withRetry = async <T>(
  task: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const initialDelayMs = options.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const shouldRetry = options.shouldRetry ?? isRetryableError;

  let attempt = 1;

  while (true) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = Math.min(initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
      attempt += 1;
    }
  }
};
