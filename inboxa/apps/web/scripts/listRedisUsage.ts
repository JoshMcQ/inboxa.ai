// eslint-disable no-process-env
// Run with: `NODE_ENV=development npx tsx scripts/listRedisUsage.ts`

import "dotenv/config";
import { redis } from "@/utils/redis";

async function scanUsageKeys() {
  let cursor = "0";
  let keys: string[] = [];
  do {
    // Some redis clients in tests may not expose SCAN; fall back to KEYS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client: any = redis as any;
    if (typeof client.scan === "function") {
      const reply = await client.scan(cursor, { match: "usage:*", count: 100 });
      cursor = reply[0];
      keys = [...keys, ...reply[1]];
    } else {
      const all = await client.keys?.("usage:*");
      keys = Array.isArray(all) ? all : [];
      cursor = "0";
    }
  } while (cursor !== "0");

  const costs = await Promise.all(
    keys.map(async (key) => {
      const data = (await redis.hgetall(key)) as Record<string, unknown> | {};
      const cost = (data as any)?.cost as string | undefined;
      if (!cost) return { email: key, cost: 0, data };
      return {
        email: key,
        cost: Number.parseFloat(Number.parseFloat(cost).toFixed(1)),
        data,
      };
    }),
  );

  const totalCost = costs.reduce((acc, { cost }) => acc + cost, 0);

  const sortedCosts = costs.sort((a, b) => a.cost - b.cost);
  for (const { email, cost, data } of sortedCosts) {
    // if (cost > 10)
    console.log(email, cost, data);
  }

  console.log("totalCost:", totalCost);
}

scanUsageKeys().catch(console.error);
