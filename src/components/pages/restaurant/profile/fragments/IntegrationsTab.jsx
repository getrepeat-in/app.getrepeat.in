import { useState } from "react";
import api from "@/lib/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Link2, Unlink, Loader2 } from "lucide-react";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";

const InstagramIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const IntegrationsTab = ({ integrationsData }) => {
  const { restaurantId } = useRestaurant();
  const notification = useNotification();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const instagram = integrationsData?.instagram || {};
  const isConnected = !!instagram.accessToken;

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const res = await api.get(`/api/restaurant/${restaurantId}/instagram/auth`);
      const data = res.data;
      
      if (!data.success) {
        throw new Error(data.message || "Failed to initialize Instagram connection");
      }
      
      if (data.data && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      notification.error(error?.response?.data?.message || error.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      const res = await api.delete(`/api/restaurant/${restaurantId}/instagram/disconnect`);
      const data = res.data;
      
      if (!data.success) {
        throw new Error(data.message || "Failed to disconnect");
      }
      
      notification.success(data.message);
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      notification.error(error?.response?.data?.message || error.message);
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
              <InstagramIcon className="text-white h-6 w-6" />
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                Instagram Business
                {isConnected && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    Connected
                  </span>
                )}
              </h3>
              
              {!isConnected ? (
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 max-w-md leading-relaxed">
                  Connect your Instagram Professional account to display your latest posts directly on your customer app.
                </p>
              ) : (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700 dark:text-zinc-300 font-medium">
                    Connected as: <span className="font-bold text-primary">@{instagram.username}</span>
                  </p>
                  {instagram.connectedAt && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Connected on {new Date(instagram.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 pt-2 sm:pt-0">
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full sm:w-auto flex items-center gap-2 font-medium"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                Connect Account
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={handleDisconnect} 
                disabled={isDisconnecting}
                className="w-full sm:w-auto flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default IntegrationsTab;
