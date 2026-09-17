import { Store, MapPin, Clock, Settings } from "lucide-react";
import TimingTab from "../fragments/TimingTab";
import GeneralTab from "../fragments/GeneralTab";
import LocationTab from "../fragments/LocationTab";
import SettingsTab from "../fragments/SettingsTab";
import IntegrationsTab from "../fragments/IntegrationsTab";
import { Plug } from "lucide-react";

export const TABS = [
  {
    id: "general",
    label: "General Info",
    icon: Store,
  },
  {
    id: "location",
    label: "Location",
    icon: MapPin,
    badge: "Map",
    badgeClasses: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40",
  },
  {
    id: "timing",
    label: "Timings",
    icon: Clock,
    badge: "7 Days",
    badgeClasses: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/40",
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    badge: "New",
    badgeClasses: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/40",
  },
];

export const renderTabContent = (activeTab, data) => {
  const resData = data?.data || {};

  const generalTab = {
    logo: resData?.logo || "",
    name: resData?.name || "",
    slug: resData?.slug || "",
    phone: resData?.phone || "",
    email: resData?.email || "",
    domain: resData?.domain || "",
  };

  const locationTab = resData?.address || {};
  const timingsTab = resData?.openingHours || {};
  const settingsTab = {
    settings: resData?.settings || {},
  };
  const integrationsTab = {
    instagram: resData?.instagram || {},
  };

  switch (activeTab) {
    case "general":
      return <GeneralTab generalData={generalTab} />;
    case "location":
      return <LocationTab locationData={locationTab} />;
    case "timing":
      return <TimingTab timingsData={timingsTab} />;
    case "settings":
      return <SettingsTab settingData={settingsTab} />;
    case "integrations":
      return <IntegrationsTab integrationsData={integrationsTab} />;
    default:
      return null;
  }
};