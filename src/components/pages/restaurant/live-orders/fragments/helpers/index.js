import { STATUS_CONFIG, DIETARY_CONFIG } from "./constants";

export const getStatusConfig = (status) => {
    const key = status?.toUpperCase();
    return STATUS_CONFIG[key] || { label: status, color: "bg-gray-500", actionLabel: null, actionColor: "", nextStatus: null };
};

export const getDietaryConfig = (dietaryType) => {
    return DIETARY_CONFIG[dietaryType] || DIETARY_CONFIG["veg"];
};

export const getElapsedTime = (createdAt) => {
    if (!createdAt) return "";
    const now = new Date();
    const placed = new Date(createdAt);
    const diffMs = now - placed;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m ago`;
};

export const formatTime = (createdAt) => {
    if (!createdAt) return "";
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};