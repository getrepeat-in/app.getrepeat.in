import { useState } from "react";
import api from "@/lib/api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Plus, Trash2 } from "lucide-react";
import useNotification from "@/store/hooks/useNotification";
import { useRestaurant } from "@/store/hooks/useRestaurant";
import { useFormMutation } from "@/store/hooks/useFormMutation";
import { RestaurantService } from "@/services/frontend/restaurant";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const CustomDomainCard = ({ domain }) => {
  const { restaurantId } = useRestaurant();
  const notification = useNotification();
  
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const currentDomain = domain || "";
  const hasDomain = !!currentDomain;

  const { mutate: updateRestaurant, isPending: isUpdatingDomain } = useFormMutation({
    mutationFn: (payload) => RestaurantService.updateRestaurant(restaurantId, payload),
    queryKey: ["restaurant-details", restaurantId],
    invalidateKeys: [["restaurant-details", restaurantId], ["all-restaurants"]],
    extractUpdatedData: (response) => response?.data?.restaurant || response?.restaurant,
    successMessage: "Domain updated successfully!"
  });

  const handleDomainSubmit = () => {
    if (!domainInput) {
      notification.error("Please enter a domain");
      return;
    }
    
    updateRestaurant(
      { domain: domainInput },
      {
        onSuccess: () => {
          setIsDomainModalOpen(false);
          setDomainInput("");
        },
        onError: (err) => {
           notification.error(err.message || "Failed to connect domain");
        }
      }
    );
  };

  const handleDisconnectDomain = () => {
    if (confirm("Are you sure you want to disconnect your custom domain?")) {
      updateRestaurant({ domain: "" });
      setVerificationStatus(null);
    }
  };

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      const res = await api.get(`/api/restaurant/${restaurantId}/domain`);
      const data = res.data;
      
      setVerificationStatus(data.verified ? "verified" : "unverified");
      
      if (data.verified) {
        notification.success("Domain DNS configuration verified successfully!");
      } else {
        notification.error("Domain DNS is not yet properly configured.");
      }
    } catch (err) {
      notification.error(err.message || "Failed to verify domain");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Card className="shadow-none flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="relative h-6 w-6 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
              <Globe className="text-indigo-600 dark:text-indigo-400 h-4 w-4" />
            </div>
            Custom Domain
          </CardTitle>
          <CardDescription>
            {hasDomain
              ? "Your custom domain is linked to your storefront."
              : "You have not connected a custom domain yet."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1 justify-between gap-4">
          {hasDomain ? (
            <div className="flex flex-col gap-3 h-full justify-between">
              <div className={`p-3 border rounded-lg ${verificationStatus === 'verified' ? 'bg-green-50 dark:bg-green-950/30 border-green-200/60 dark:border-green-900/50' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/50'}`}>
                <p className={`text-sm font-medium flex items-center gap-1.5 ${verificationStatus === 'verified' ? 'text-green-900 dark:text-green-200' : 'text-amber-900 dark:text-amber-200'}`}>
                  <a href={`https://${currentDomain}`} target="_blank" rel="noreferrer" className="underline hover:opacity-80 transition-opacity">
                    {currentDomain}
                  </a>
                </p>
                {verificationStatus !== 'verified' && (
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-2 leading-relaxed">
                    <strong>Action Required:</strong> Point a CNAME record for <strong className="text-amber-900 dark:text-amber-100">www</strong> to <code className="bg-amber-100/50 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono text-[10px] text-amber-900 dark:text-amber-100">cname.vercel-dns.com</code>
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Active</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="h-7 text-xs px-2.5"
                  >
                    {isVerifying && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
                    Verify DNS
                  </Button>
                  {verificationStatus === "verified" && (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                  {verificationStatus === "unverified" && (
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      ✗ Unverified
                    </span>
                  )}
                </div>
                <Button 
                  type="button"
                  onClick={handleDisconnectDomain} 
                  disabled={isUpdatingDomain}
                  variant="destructive"
                  size="sm"
                  className="h-8 rounded-md shadow-sm font-semibold text-xs"
                >
                  {isUpdatingDomain ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" strokeWidth={2.5} />}
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-auto">
              <div />
              <Button 
                type="button"
                onClick={() => setIsDomainModalOpen(true)} 
                disabled={isUpdatingDomain}
                size="sm"
                className="h-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold text-xs"
              >
                <Plus size={14} className="mr-1.5" strokeWidth={2.5} />
                Connect Domain
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDomainModalOpen} onOpenChange={setIsDomainModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Custom Domain</DialogTitle>
            <DialogDescription>
              Enter the domain you want to link to your restaurant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="domainInput" className="text-sm font-medium">
                Domain Name
              </label>
              <Input
                id="domainInput"
                placeholder="e.g. www.therusticspoon.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Make sure to include "www." if you plan to route the www subdomain.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDomainModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDomainSubmit} disabled={isUpdatingDomain}>
              {isUpdatingDomain && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomDomainCard;
