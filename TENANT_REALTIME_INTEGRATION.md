# Tenant Application — Real-Time Orders Integration Guide

This guide provides everything the tenant/storefront engineering team needs to implement real-time order synchronization with the GetRepeat restaurant dashboard.

---

## 1. Architecture Overview

Both applications run in a serverless environment (Vercel + Next.js). Real-time communication is powered by **Pusher Channels**:

```
[Tenant Customer]                          [GetRepeat Backend]                       [Merchant Dashboard]
       |                                           |                                          |
       |--- 1. Places Order (POST /api/[slug]/order) ->|                                      |
       |                                           |--- 2. Pusher ("order:created") --------->| (Sound + Toast + Table Update)
       |                                           |                                          |
       |                                           |<-- 3. Staff Updates Status (PATCH) ------|
       |<-- 4. Pusher ("order:updated") -----------|                                          |
(Status flips to PREPARING / READY)
```

- **Placing Orders**: Fully automatic. Any order created via `/api/[slug]/order` or Razorpay verification instantly notifies the merchant dashboard.
- **Tracking Orders**: The tenant client subscribes to a dedicated channel for that order to receive live status updates.

---

## 2. Environment Variables & Setup

### Install Dependency
Install `pusher-js` in the tenant application:

```bash
npm install pusher-js
```

### Environment Variables
Add the following keys to your tenant `.env` and Vercel project settings:

```env
NEXT_PUBLIC_PUSHER_KEY=9ba2ef6a94032aeb6a6c
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

---

## 3. Real-Time Order Channels & Events

### Channels
Each order broadcasts to two interchangeable channels:
1. `order-${orderId}` (e.g., `order-67e41fa8b89d9124a91901a1`)
2. `order-${orderNumber}` (e.g., `order-ORD-123456-A1B2`)

### Events Listened to by Tenant

| Event Name | Trigger Condition | Primary Data in Payload |
|---|---|---|
| `order:updated` | Staff advances status (e.g., ACCEPTED, PREPARING, READY), rejects, or cancels | `{ order, orderId, orderNumber, orderStatus, paymentStatus }` |
| `order:status_changed` | Alias event for specific status transitions | `{ order, orderId, orderNumber, orderStatus }` |

### Payload Schema
```json
{
  "orderId": "67e41fa8b89d9124a91901a1",
  "orderNumber": "ORD-543210-9F2B",
  "restaurantId": "67a12390f019482910a92019",
  "orderStatus": "PREPARING",
  "paymentStatus": "PAID",
  "order": {
    "_id": "67e41fa8b89d9124a91901a1",
    "orderNumber": "ORD-543210-9F2B",
    "orderType": "DINE_IN",
    "orderStatus": "PREPARING",
    "paymentStatus": "PAID",
    "totalAmount": 450,
    "items": [ ... ],
    "table": { "tableNumber": "T-04" },
    "createdAt": "2026-09-25T11:20:00.000Z",
    "statusHistory": [ ... ]
  }
}
```

---

## 4. Drop-in React Hook (`useRealtimeOrderStatus.js`)

Copy this hook directly into your tenant codebase (e.g., `src/hooks/useRealtimeOrderStatus.js`):

```javascript
"use client";
import { useEffect, useState, useCallback } from "react";
import PusherClient from "pusher-js";

let pusherInstance = null;

const getPusherClient = () => {
  if (typeof window === "undefined") return null;
  if (pusherInstance) return pusherInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "9ba2ef6a94032aeb6a6c";
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  pusherInstance = new PusherClient(key, {
    cluster,
    forceTLS: true,
  });

  return pusherInstance;
};

/**
 * Hook to track order status in real-time on tenant tracking pages.
 *
 * @param {Object} params
 * @param {string} params.orderId - MongoDB ObjectId of the order
 * @param {string} params.orderNumber - ORD-... identifier
 * @param {Function} [params.onStatusChange] - Callback with updated order
 * @param {Function} [params.refetch] - Optional React Query or fetcher to reload order
 */
export function useRealtimeOrderStatus({
  orderId,
  orderNumber,
  onStatusChange,
  refetch,
} = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);

  const identifier = orderId || orderNumber;

  const handleUpdate = useCallback(
    (data) => {
      const updatedOrder = data?.order || data;
      setLatestOrder(updatedOrder);

      if (onStatusChange) {
        onStatusChange(updatedOrder);
      }
      if (refetch) {
        refetch();
      }
    },
    [onStatusChange, refetch]
  );

  useEffect(() => {
    if (!identifier) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `order-${identifier}`;
    let channel = pusher.channel(channelName);
    if (!channel) {
      channel = pusher.subscribe(channelName);
    }

    if (channel.subscribed || pusher.connection.state === "connected") {
      setIsConnected(true);
    }

    channel.bind("pusher:subscription_succeeded", () => setIsConnected(true));
    channel.bind("order:updated", handleUpdate);
    channel.bind("order:status_changed", handleUpdate);

    // Also bind to orderNumber channel if different
    let secondaryChannel = null;
    if (orderNumber && orderId && orderNumber !== orderId) {
      const secName = `order-${orderNumber}`;
      secondaryChannel = pusher.channel(secName) || pusher.subscribe(secName);
      secondaryChannel.bind("order:updated", handleUpdate);
      secondaryChannel.bind("order:status_changed", handleUpdate);
    }

    return () => {
      channel.unbind("order:updated", handleUpdate);
      channel.unbind("order:status_changed", handleUpdate);
      if (secondaryChannel) {
        secondaryChannel.unbind("order:updated", handleUpdate);
        secondaryChannel.unbind("order:status_changed", handleUpdate);
      }
    };
  }, [identifier, orderId, orderNumber, handleUpdate]);

  return { isConnected, latestOrder };
}
```

---

## 5. Implementation Example in Tenant Tracking Page

```jsx
"use client";
import { useState } from "react";
import { useRealtimeOrderStatus } from "@/hooks/useRealtimeOrderStatus";

export default function OrderTrackingPage({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);

  const { isConnected } = useRealtimeOrderStatus({
    orderId: order?._id,
    orderNumber: order?.orderNumber,
    onStatusChange: (updatedOrder) => {
      setOrder(updatedOrder);
    },
  });

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {isConnected ? "● Live Updates" : "Syncing..."}
        </span>
      </div>

      {/* Dynamic Status Progress */}
      <div className="p-4 rounded-xl border bg-white shadow-sm space-y-2">
        <div className="text-sm font-semibold text-gray-500">Current Status</div>
        <div className="text-2xl font-bold text-orange-600">
          {order.orderStatus.replace(/_/g, " ")}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Order Status Progression Reference

Depending on the `orderType`, the dashboard transitions status through the following stages:

| Order Type | Status Flow |
|---|---|
| **DINE_IN** | `PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `SERVED` → `COMPLETED` |
| **TAKEAWAY** | `PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `PICKED_UP` → `COMPLETED` |
| **DELIVERY** | `PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `IN_TRANSIT` → `DELIVERED` → `COMPLETED` |
| **Exceptions** | `REJECTED` (with `order.rejectionReason`) or `CANCELLED` |

---

## 7. Recommended Fallback Mechanism
While Pusher delivers sub-second updates, we recommend setting a fallback polling interval (e.g., 10–15 seconds via TanStack Query `refetchInterval`) on active order tracking pages to guarantee synchronization even if a customer switches apps, enters airplane mode, or experiences network interruptions.
