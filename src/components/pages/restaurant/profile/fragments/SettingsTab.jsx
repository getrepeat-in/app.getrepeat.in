import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Coins, Activity, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsTab = () => {
  return (
    <div className="flex flex-col">
      <div className="space-y-7">
        <div className="space-y-2">
          <Label htmlFor="gstNumber" className="font-semibold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wider">GST Number</Label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-primary/90 z-10" />
            <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" className="pl-11 h-11.5 sm:h-12 uppercase text-sm sm:text-base border-gray-200 dark:border-zinc-800 focus-visible:ring-primary rounded-md shadow-2xs bg-white dark:bg-zinc-900" />
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5">Must be a valid 15-character GSTIN.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className="font-semibold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wider">Currency</Label>
            <div className="relative">
              <Coins className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-primary/90 z-10" />
              <Select defaultValue="INR">
                <SelectTrigger id="currency" className="pl-11 h-11.5 sm:h-12 text-sm sm:text-base border-gray-200 dark:border-zinc-800 focus-visible:ring-primary rounded-md shadow-2xs bg-white dark:bg-zinc-900 w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1.5">Currently only INR is supported.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="font-semibold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wider">Account Status</Label>
            <div className="relative">
              <Activity className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-primary/90 z-10" />
              <Select defaultValue="active">
                <SelectTrigger id="status" className="pl-11 h-11.5 sm:h-12 text-sm sm:text-base border-gray-200 dark:border-zinc-800 focus-visible:ring-primary rounded-md shadow-2xs bg-white dark:bg-zinc-900 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
        <Button className="h-9 px-5 rounded-md font-semibold text-xs sm:text-sm shadow-2xs transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
