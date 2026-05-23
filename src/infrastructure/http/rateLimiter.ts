import Bottleneck from 'bottleneck';

const CIN7_REQUESTS_PER_SECOND = 60;
const CIN7_MAX_CONCURRENT_REQUESTS = 5;

export const cin7RateLimiter = new Bottleneck({
  maxConcurrent: CIN7_MAX_CONCURRENT_REQUESTS,
  reservoir: CIN7_REQUESTS_PER_SECOND,
  reservoirRefreshAmount: CIN7_REQUESTS_PER_SECOND,
  reservoirRefreshInterval: 1000
});

export const withCin7RateLimit = <T>(task: () => Promise<T>): Promise<T> => {
  return cin7RateLimiter.schedule(task);
};
