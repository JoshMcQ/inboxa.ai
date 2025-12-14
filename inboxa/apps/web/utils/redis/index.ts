import { env } from "@/env";
import { Redis } from "@upstash/redis";

// Create a mock Redis client for development when Redis is not available
const createMockRedis = () => ({
  get: async () => null,
  set: async () => "OK",
  del: async () => 1,
  expire: async () => 1,
  exists: async () => 0,
  incr: async () => 1,
  decr: async () => 1,
  sadd: async () => 1,
  srem: async () => 1,
  smembers: async () => [],
  hget: async () => null,
  hset: async () => 1,
  hdel: async () => 1,
  hgetall: async () => ({}),
});

// Use real Redis if environment variables are set, otherwise use mock
export const redis = env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN 
  ? new Redis({
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    })
  : createMockRedis();

export async function expire(key: string, seconds: number) {
  return redis.expire(key, seconds);
}
