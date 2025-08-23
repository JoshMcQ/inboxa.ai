import "server-only";
import { redis } from "@/utils/redis";
import prisma from "@/utils/prisma";

const EXPIRATION = 60 * 60; // 1 hour

/**
 * Get the Redis key for account validation
 */
function getValidationKey({
  userId,
  emailAccountId,
}: {
  userId: string;
  emailAccountId: string;
}): string {
  return `account:${userId}:${emailAccountId}`;
}

/**
 * Validate that an account belongs to a user, using Redis for caching
 * @param userId The user ID
 * @param accountId The account ID to validate
 * @returns email address of the account if it belongs to the user, otherwise null
 */
export async function getEmailAccount({
  userId,
  emailAccountId,
}: {
  userId: string;
  emailAccountId: string;
}): Promise<string | null> {
  if (!userId || !emailAccountId) return null;

  const key = getValidationKey({ userId, emailAccountId });

  // Check Redis cache first
  try {
    const cachedResult = await redis.get<string>(key);
    if (cachedResult !== null) {
      return cachedResult;
    }
  } catch (error) {
    // Redis is not available, continue without cache
    console.warn("Redis not available for account validation cache:", error);
  }

  // Not in cache, check database
  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId, userId },
    select: { email: true },
  });

  // Cache the result
  try {
    await redis.set(key, emailAccount?.email ?? null, { ex: EXPIRATION });
  } catch (error) {
    // Redis is not available, continue without caching
    console.warn("Redis not available for caching account validation:", error);
  }

  return emailAccount?.email ?? null;
}

/**
 * Invalidate the cached validation result for a user's account
 * Useful when account ownership changes
 */
export async function invalidateAccountValidation({
  userId,
  emailAccountId,
}: {
  userId: string;
  emailAccountId: string;
}): Promise<void> {
  const key = getValidationKey({ userId, emailAccountId });
  try {
    await redis.del(key);
  } catch (error) {
    // Redis is not available, no need to invalidate cache
    console.warn("Redis not available for invalidating account validation:", error);
  }
}
