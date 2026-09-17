export const ALLOWED_UPDATE_FIELDS = new Set([
  "name",
  "slug",
  "logo",
  "address",
  "phone",
  "domain",
  "email",
  "gstNumber",
  "currency",
  "status",
  "openingHours",
  "instagram",
]);

export const DEFAULT_ALLOWED_OUTLETS = 1;

export const RESTAURANT_CACHE_TTL = 3600; 

export const OWNER_ROLE_DEFINITION = {
  name: "OWNER",
  description: "Restaurant Owner",
  isSystemRole: true,
};

export const STAFF_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DISABLED: "DISABLED",
};

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DEFAULT_OPENING_HOURS = {
  currentlyOpen: false,
  days: DAYS_OF_WEEK.map((day) => ({
    day,
    isOpen: false,
    openTime: null,
    closeTime: null,
  })),
};
