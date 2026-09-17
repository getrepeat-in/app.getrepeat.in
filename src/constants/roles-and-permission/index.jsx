export const SYSTEM_PERMISSIONS = [
  {
    code: "RESTAURANT:CREATE",
    description: "Create new restaurant entities",
    category: "Restaurant",
  },
  {
    code: "RESTAURANT:READ",
    description: "View restaurant profiles and settings",
    category: "Restaurant",
  },
  {
    code: "RESTAURANT:UPDATE",
    description: "Update restaurant profile, timings, branding, and details",
    category: "Restaurant",
  },
  {
    code: "RESTAURANT:DELETE",
    description: "Delete restaurant entity",
    category: "Restaurant",
  },

  {
    code: "MENU:READ",
    description: "View categories, items, and addon groups",
    category: "Menu",
  },
  {
    code: "MENU:CREATE",
    description: "Create categories, items, and addon groups",
    category: "Menu",
  },
  {
    code: "MENU:UPDATE",
    description: "Edit menu items, categories, pricing, and availability",
    category: "Menu",
  },
  {
    code: "MENU:DELETE",
    description: "Delete categories, items, and addon groups",
    category: "Menu",
  },

  {
    code: "ORDER:READ",
    description: "View live orders, customer tickets, and order history",
    category: "Orders",
  },
  {
    code: "ORDER:CREATE",
    description: "Create and place new orders (POS & floor order taking)",
    category: "Orders",
  },
  {
    code: "ORDER:UPDATE",
    description: "Update order status, item modifications, and payment status",
    category: "Orders",
  },
  {
    code: "ORDER:DELETE",
    description: "Cancel and void orders",
    category: "Orders",
  },

  {
    code: "KDS:READ",
    description: "Access Kitchen Display System (KDS) and view incoming kitchen tickets",
    category: "Kitchen",
  },
  {
    code: "KDS:UPDATE",
    description: "Update kitchen ticket prep status (e.g. Preparing, Ready, Cooked)",
    category: "Kitchen",
  },

  {
    code: "TABLE:READ",
    description: "View tables, floor layouts, QR codes, and occupancy status",
    category: "Tables",
  },
  {
    code: "TABLE:CREATE",
    description: "Add new tables and floor sections",
    category: "Tables",
  },
  {
    code: "TABLE:UPDATE",
    description: "Update table status (occupy/vacate), reservations, and table info",
    category: "Tables",
  },
  {
    code: "TABLE:DELETE",
    description: "Remove tables and sections",
    category: "Tables",
  },

  {
    code: "STAFF:READ",
    description: "View staff members and roles",
    category: "Staff",
  },
  {
    code: "STAFF:CREATE",
    description: "Invite and add new staff members",
    category: "Staff",
  },
  {
    code: "STAFF:UPDATE",
    description: "Edit staff member roles, profile details, and active status",
    category: "Staff",
  },
  {
    code: "STAFF:DELETE",
    description: "Remove staff members",
    category: "Staff",
  },

  {
    code: "PROMOTION:READ",
    description: "View active discounts, promo codes, and offers",
    category: "Promotions",
  },
  {
    code: "PROMOTION:CREATE",
    description: "Create new discounts and promotional campaigns",
    category: "Promotions",
  },
  {
    code: "PROMOTION:UPDATE",
    description: "Edit promotional campaigns and voucher limits",
    category: "Promotions",
  },
  {
    code: "PROMOTION:DELETE",
    description: "Delete promotional campaigns",
    category: "Promotions",
  },

  {
    code: "WEBSITE:MANAGE",
    description: "Customize storefront branding, banners, and digital menu appearance",
    category: "Storefront",
  },
  {
    code: "INTEGRATION:MANAGE",
    description: "Manage social media (Instagram), payment gateways, and external integrations",
    category: "Integrations",
  },

  {
    code: "ANALYTICS:READ",
    description: "View revenue metrics, sales analytics, and business reports",
    category: "Analytics",
  },
];

export const ALL_PERMISSION_CODES = SYSTEM_PERMISSIONS.map((p) => p.code);

export const SYSTEM_ROLES = {
  OWNER: {
    name: "OWNER",
    description: "Complete administrative access to all restaurant settings, operations, staff, and management.",
    isSystemRole: true,
    permissions: ALL_PERMISSION_CODES,
  },

  MANAGER: {
    name: "MANAGER",
    description: "Full restaurant management including menu, tables, staff, orders, and promotions (excluding restaurant creation and deletion).",
    isSystemRole: true,
    permissions: ALL_PERMISSION_CODES.filter(
      (code) => code !== "RESTAURANT:CREATE" && code !== "RESTAURANT:DELETE"
    ),
  },

  CHEF: {
    name: "CHEF",
    description: "Kitchen staff with access to the Kitchen Display System (KDS), orders queue, recipe details, and menu items.",
    isSystemRole: true,
    permissions: [
      "KDS:READ",
      "KDS:UPDATE",
      "ORDER:READ",
      "MENU:READ",
      "TABLE:READ",
    ],
  },

  WAITER: {
    name: "WAITER",
    description: "Floor staff with access to take and place orders, manage table occupancy, and update order statuses.",
    isSystemRole: true,
    permissions: [
      "ORDER:READ",
      "ORDER:CREATE",
      "ORDER:UPDATE",
      "TABLE:READ",
      "TABLE:UPDATE",
      "MENU:READ",
    ],
  },
};

export const SYSTEM_ROLES_LIST = Object.values(SYSTEM_ROLES);
