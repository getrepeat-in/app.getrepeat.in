import { LayoutDashboard, Settings, Users, User, TableProperties, ClipboardList, Globe, Tags, Camera } from "lucide-react";

export const APP_SIDEBAR_CONFIG = {
  navUserItems: [
  ],
  navMain: {
    title: "MANAGE",
    items: [
      {
        title: "Menu",
        url: "/restaurant/menu",
        icon: <LayoutDashboard />,
      },
      {
        title: "Promotions",
        url: "/restaurant/promotions",
        icon: <Tags />,
      },
      {
        title: "Website",
        url: "/restaurant/website",
        icon: <Globe />,
      },
      {
        title: "Tables",
        url: "/restaurant/tables",
        icon: <TableProperties />,
      },
      {
        title: "Orders",
        url: "/restaurant/orders",
        icon: <ClipboardList />,
      },
      {
        title: "Customers",
        url: "/restaurant/users",
        icon: <User />,
      },
      {
        title: "Staff",
        url: "/restaurant/staff",
        icon: <Users />,
      },
      {
        title: "Settings",
        url: "/restaurant/profile",
        icon: <Settings />,
      },
      {
        title: "Social",
        url: "/restaurant/social",
        icon: <Camera />,
      },
    ],
  },
};
