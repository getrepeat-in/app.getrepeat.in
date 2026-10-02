import { SeverityNumber } from "@opentelemetry/api-logs";
import { loggerProvider } from "../../instrumentation";

const logger = loggerProvider?.getLogger("nearby24.posthog-export");

export function logRestaurantCreated({ restaurantId }) {
  logger?.emit({
    body: "restaurant creation completed",
    severityNumber: SeverityNumber.INFO,
    attributes: {
      event: "restaurant.creation.completed",
      restaurant_id: restaurantId,
    },
  });
}

export function logRestaurantListRetrieved({ restaurantCount, isCached }) {
  logger?.emit({
    body: "restaurant list retrieval completed",
    severityNumber: SeverityNumber.INFO,
    attributes: {
      event: "restaurant.list.retrieved",
      restaurant_count: restaurantCount,
      cache_hit: isCached,
    },
  });
}

export async function flushPostHogLogs() {
  await loggerProvider?.forceFlush();
}
