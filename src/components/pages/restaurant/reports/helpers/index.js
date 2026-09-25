import { format } from "date-fns";

export * from "./constants";

export function formatCurrency(amount = 0, fractionDigits = 2) {
  const num = Number(amount || 0);
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatHourRangeShort(startHour, interval = 2) {
  const endHour = (startHour + interval) % 24;

  const to12h = (h) => {
    const period = h >= 12 && h < 24 ? "PM" : "AM";
    let num = h % 12;
    if (num === 0) num = 12;
    return { num, period };
  };

  const s = to12h(startHour);
  const e = to12h(endHour);

  if (s.period === e.period) {
    return `${s.num} - ${e.num} ${e.period}`;
  }
  return `${s.num} ${s.period} - ${e.num} ${e.period}`;
}

export function formatHourRangeFull(startHour, interval = 2) {
  const endHour = (startHour + interval) % 24;

  const to12hFull = (h) => {
    const period = h >= 12 && h < 24 ? "PM" : "AM";
    let num = h % 12;
    if (num === 0) num = 12;
    return `${num}:00 ${period}`;
  };

  return `${to12hFull(startHour)} – ${to12hFull(endHour)}`;
}

export function formatDateLabel(dateString, pattern = "d MMM") {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, pattern);
    }
  } catch (err) {
  }
  return String(dateString);
}

export function calculateAOV(revenue = 0, orders = 0) {
  if (!orders || orders <= 0) return 0;
  return Math.round((revenue / orders) * 100) / 100;
}

export function exportReportsToCsv({ data, restaurantName = "Restaurant" }) {
  if (!data) return;

  const {
    summary = {},
    paymentMethods = [],
    orderTypes = [],
    recentOrders = [],
    range = {},
  } = data;

  const lines = [];

  lines.push(`"${restaurantName} - Sales & Performance Report"`);
  lines.push(`"Generated At:","${format(new Date(), "yyyy-MM-dd HH:mm:ss")}"`);
  lines.push(`"Period:","${range.preset || "custom"}"`);
  lines.push(
    `"Date Range:","${range.startDate || ""} to ${range.endDate || ""}"`
  );
  lines.push("");

  lines.push('"EXECUTIVE SUMMARY"');
  lines.push(
    '"Total Revenue (₹)","Total Orders","Completed Orders","Cancelled Orders","Average Order Value (₹)","Paid Revenue (₹)","Pending Revenue (₹)"'
  );
  lines.push(
    `"${summary.totalRevenue || 0}","${summary.totalOrders || 0}","${
      summary.completedOrders || 0
    }","${summary.cancelledOrders || 0}","${
      summary.averageOrderValue || 0
    }","${summary.paidRevenue || 0}","${summary.pendingRevenue || 0}"`
  );
  lines.push("");

  lines.push('"PAYMENT MODES BREAKDOWN"');
  lines.push(
    '"Payment Method","Order Count","Total Revenue (₹)","Revenue Share (%)"'
  );
  paymentMethods.forEach((pm) => {
    lines.push(
      `"${pm.method}","${pm.count}","${pm.revenue}","${pm.percentage?.toFixed(
        2
      )}%"`
    );
  });
  lines.push("");

  lines.push('"ORDER CHANNELS BREAKDOWN"');
  lines.push(
    '"Channel","Order Count","Total Revenue (₹)","Order Share (%)"'
  );
  orderTypes.forEach((ot) => {
    lines.push(
      `"${ot.type}","${ot.count}","${ot.revenue}","${ot.percentage?.toFixed(
        2
      )}%"`
    );
  });
  lines.push("");

  if (recentOrders.length > 0) {
    lines.push('"RECENT ORDERS JOURNAL"');
    lines.push(
      '"Order ID","Date","Customer Name","Phone","Type","Payment Method","Payment Status","Order Status","Amount (₹)"'
    );
    recentOrders.forEach((ord) => {
      const dateStr = ord.createdAt
        ? format(new Date(ord.createdAt), "yyyy-MM-dd HH:mm")
        : "-";
      lines.push(
        `"${ord.orderNumber}","${dateStr}","${
          ord.customer?.name || "Guest"
        }","${ord.customer?.phone || ""}","${ord.orderType || "DINE_IN"}","${
          ord.paymentMethod || "CASH"
        }","${ord.paymentStatus || "PENDING"}","${
          ord.orderStatus || "PLACED"
        }","${ord.totalAmount || 0}"`
      );
    });
  }

  const csvContent =
    "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  const fileName = `${restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")}_report_${format(
    new Date(),
    "yyyyMMdd_HHmm"
  )}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
