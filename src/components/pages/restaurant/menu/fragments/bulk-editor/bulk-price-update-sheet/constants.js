export const APPLY_TO_OPTIONS = [
  { label: "Entire Menu", value: "entire_menu" },
  { label: "Selected Items", value: "selected_items" },
];

export const ACTION_OPTIONS = [
  { label: "+", value: "increase" },
  { label: "-", value: "decrease" },
];

export const TYPE_OPTIONS = [
  { label: "%", value: "percentage" },
  { label: "Flat", value: "flat" },
];

export const ROUNDING_OPTIONS = [
  { value: "none", label: "No Rounding" },
  { value: "round_to_integer", label: "Round to Integer (e.g. ₹299.5 → ₹300)" },
  { value: "nearest_9", label: "Nearest 9 (e.g. ₹305 → ₹309, ₹302 → ₹299)" },
  { value: "next_9", label: "Next 9 (e.g. ₹300 → ₹309, ₹291 → ₹299)" },
];
