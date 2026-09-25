import { LayoutDashboard, Settings, Users, User, TableProperties, ClipboardList, Globe, Tags, Camera, Puzzle, BarChart3, Radio } from "lucide-react";

export const APP_SIDEBAR_CONFIG = {
  navUserItems: [
  ],
  navMain: {
    title: "MANAGE",
    items: [
      {
        title: "Live Orders",
        url: "/",
        icon: <Radio />,
      },
      {
        title: "Reports",
        url: "/restaurant/reports",
        icon: <BarChart3 />,
      },
      {
        title: "Orders",
        url: "/restaurant/orders",
        icon: <ClipboardList />,
      },
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
        title: "Integrations",
        url: "/restaurant/integrations",
        icon: <Puzzle />,
      },
      {
        title: "Social",
        url: "/restaurant/social",
        icon: <Camera />,
      },
    ],
  },
};
