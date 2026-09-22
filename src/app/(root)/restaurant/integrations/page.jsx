"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { Puzzle, Plus, Loader2, Trash2 } from "lucide-react";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { integrationService } from "@/services/frontend/integration";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function IntegrationsPage() {
  const { restaurantId, isLoading: isRestaurantLoading } = useRestaurant();
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectingRazorpay, setConnectingRazorpay] = useState(false);
  const [connectingInstagram, setConnectingInstagram] = useState(false);
  const [disconnectingRazorpay, setDisconnectingRazorpay] = useState(false);

  const fetchIntegrations = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await integrationService.getIntegrations(restaurantId);
      if (data) {
        setIntegrations(data);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchIntegrations();
    }
  }, [restaurantId]);

  const toggleIntegration = async (platform, currentValue) => {
    try {
      const data = await integrationService.updateIntegration(restaurantId, platform, !currentValue);
      if (data?.success) {
        setIntegrations((prev) => ({
          ...prev,
          [platform]: { ...prev[platform], isActive: !currentValue },
        }));
      }
    } catch (error) {
      console.error(`Failed to toggle ${platform}:`, error);
    }
  };

  const handleConnectRazorpay = async () => {
    try {
      setConnectingRazorpay(true);
      const res = await integrationService.connectRazorpay(restaurantId);
      if (res?.success && res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to connect Razorpay:", error);
    } finally {
      setConnectingRazorpay(false);
    }
  };

  const handleDisconnectRazorpay = async () => {
    setDisconnectingRazorpay(true);
    try {
      await integrationService.disconnectRazorpay(restaurantId);
      await fetchIntegrations();
      notification.success("Razorpay disconnected successfully");
    } catch (error) {
      notification.error("Failed to disconnect Razorpay");
    } finally {
      setDisconnectingRazorpay(false);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      setConnectingInstagram(true);
      const res = await integrationService.connectInstagram(restaurantId);
      if (res?.success && res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to connect Instagram:", error);
    } finally {
      setConnectingInstagram(false);
    }
  };

  return (
    <div className="flex flex-col bg-white m-2 sm:m-4 p-3 sm:p-5 md:p-6 space-y-6 rounded-xl min-w-0">
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50 flex items-center gap-2">
          <Puzzle className="w-6 h-6" />
          Integrations
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage your connected apps and services. Enable or disable them as needed.
        </p>
      </div>

{loading || isRestaurantLoading ? <Loader /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="relative h-6 w-6">
                <Image src="/assets/logo/razorpay.png" alt="Razorpay logo" fill className="object-contain" sizes="24px" />
              </div>
              Razorpay
            </CardTitle>
            <CardDescription>
              {integrations?.razorpay?.isLinked
                ? "Your Razorpay account is connected for payments."
                : "You have not connected Razorpay yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            {integrations?.razorpay?.isLinked ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {integrations.razorpay.isActive ? "Active" : "Disabled"}
                  </span>
                  <Switch
                    checked={integrations.razorpay.isActive}
                    onCheckedChange={() =>
                      toggleIntegration("razorpay", integrations.razorpay.isActive)
                    }
                  />
                </div>
                <Button 
                  type="button"
                  onClick={handleDisconnectRazorpay} 
                  disabled={disconnectingRazorpay}
                  variant="destructive"
                  size="sm"
                  className="h-8 rounded-md shadow-sm font-semibold text-xs"
                >
                  {disconnectingRazorpay ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" strokeWidth={2.5} />}
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                type="button"
                onClick={handleConnectRazorpay} 
                disabled={connectingRazorpay}
                size="sm"
                className="h-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold text-xs"
              >
                {connectingRazorpay ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" strokeWidth={2.5} />}
                Connect Razorpay
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="relative h-6 w-6">
                <Image src="/assets/logo/instagram.png" alt="Instagram logo" fill className="object-contain" sizes="24px" />
              </div>
              Instagram
            </CardTitle>
            <CardDescription>
              {integrations?.instagram?.isLinked
                ? `Connected as @${integrations.instagram.username}`
                : "You have not connected Instagram yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            {integrations?.instagram?.isLinked ? (
              <>
                <span className="text-sm font-medium">
                  {integrations.instagram.isActive ? "Active" : "Disabled"}
                </span>
                <Switch
                  checked={integrations.instagram.isActive}
                  onCheckedChange={() =>
                    toggleIntegration("instagram", integrations.instagram.isActive)
                  }
                />
              </>
            ) : (
              <Button 
                type="button"
                onClick={handleConnectInstagram} 
                disabled={connectingInstagram}
                size="sm"
                className="h-8 rounded-md bg-pink-600 hover:bg-pink-700 text-white shadow-sm font-semibold text-xs"
              >
                {connectingInstagram ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" strokeWidth={2.5} />}
                Connect Instagram
              </Button>
            )}
          </CardContent>
        </Card>
      </div> }
    </div>
  );
}