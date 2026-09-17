import { getRestaurant } from "@/lib/api/hooks/getRestaurant";
import { redirect } from "next/navigation";
import SocialPage from "@/components/pages/restaurant/social";

export const metadata = {
  title: "Social Settings - Restaurant Dashboard",
  description: "Manage your restaurant's social integrations and post mappings.",
};

export default async function Page() {
  const { user, restaurant } = await getRestaurant();

  if (!user) {
    return redirect("/sign-in");
  }

  if (!restaurant) {
    return redirect("/onboarding");
  }

  return <SocialPage restaurantId={restaurant._id.toString()} />;
}
